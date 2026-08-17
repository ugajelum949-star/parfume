'use server'

import { db } from '@/lib/db'
import { products, productImages } from '@/db/schema'
import { verifyAdmin } from './auth'
import { eq, desc } from 'drizzle-orm'
import { deleteFromS3 } from '@/lib/s3-storage'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  try {
    await verifyAdmin()
    return await db.select().from(products).orderBy(desc(products.createdAt))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getProductWithImages(id: string) {
  try {
    await verifyAdmin()
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    if (!product) return null
    const images = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.order)
    return { ...product, images }
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function createProduct(formData: FormData) {
  try {
    await verifyAdmin()

    const name = (formData.get('name') as string).trim()
    const category = formData.get('category') as string
    const brand = (formData.get('brand') as string || '-').trim()
    const gender = formData.get('gender') as string || 'Unisex'
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string
    const image = formData.get('image') as string
    const sizes = formData.get('sizes') as string || '30ml,50ml,100ml'
    const stock = parseInt(formData.get('stock') as string) || 0
    const isBestSeller = formData.get('isBestSeller') === 'true'
    const isFeatured = formData.get('isFeatured') === 'true'
    const images = formData.getAll('images') as string[]
    let sizePrices: Record<string, number> = {}
    let sizeSalePrices: Record<string, number> = {}
    try { sizePrices = JSON.parse(formData.get('sizePrices') as string || '{}') } catch {}
    try { sizeSalePrices = JSON.parse(formData.get('sizeSalePrices') as string || '{}') } catch {}

    if (!name || !category || isNaN(price)) {
      return { success: false, error: 'Name, category, and price are required.' }
    }

    if (name.length > 200) return { success: false, error: 'Nama produk maksimal 200 karakter' }
    if (description && description.length > 5000) return { success: false, error: 'Deskripsi maksimal 5000 karakter' }
    if (brand.length > 100) return { success: false, error: 'Brand maksimal 100 karakter' }

    if (price < 0) return { success: false, error: 'Harga tidak boleh negatif' }
    if (stock < 0) return { success: false, error: 'Stok tidak boleh negatif' }

    const [newProduct] = await db.insert(products).values({
      name,
      category,
      brand,
      gender,
      price,
      description,
      image,
      sizes,
      stock,
      isBestSeller,
      isFeatured,
      stockData: JSON.stringify({ prices: sizePrices, salePrices: sizeSalePrices }),
    }).returning()

    // Save additional images
    const validImages = images.filter(url => url && url.trim() !== '')
    if (validImages.length > 0) {
      await db.insert(productImages).values(
        validImages.map((url, i) => ({
          url,
          productId: newProduct.id,
          order: i,
        }))
      )
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/products')

    return { success: true, product: newProduct }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function deleteProduct(id: string) {
  try {
    await verifyAdmin()

    // Fetch images before deleting DB records
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    const extraImages = await db.select().from(productImages).where(eq(productImages.productId, id))

    // Delete files from S3
    if (product?.image) await deleteFromS3(product.image)
    for (const img of extraImages) {
      if (img.url) await deleteFromS3(img.url)
    }

    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/products')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function updateProduct(id: string, formData: FormData) {
  try {
    await verifyAdmin()

    const name = (formData.get('name') as string).trim()
    const category = formData.get('category') as string
    const brand = (formData.get('brand') as string || '-').trim()
    const gender = formData.get('gender') as string || 'Unisex'
    const price = parseFloat(formData.get('price') as string)
    const description = formData.get('description') as string
    const image = formData.get('image') as string
    const sizes = formData.get('sizes') as string || '30ml,50ml,100ml'
    const stock = parseInt(formData.get('stock') as string) || 0
    const isBestSeller = formData.get('isBestSeller') === 'true'
    const isFeatured = formData.get('isFeatured') === 'true'
    const images = formData.getAll('images') as string[]
    let sizePrices: Record<string, number> = {}
    let sizeSalePrices: Record<string, number> = {}
    try { sizePrices = JSON.parse(formData.get('sizePrices') as string || '{}') } catch {}
    try { sizeSalePrices = JSON.parse(formData.get('sizeSalePrices') as string || '{}') } catch {}

    if (!name || !category || isNaN(price)) {
      return { success: false, error: 'Name, category, and price are required.' }
    }

    if (name.length > 200) return { success: false, error: 'Nama produk maksimal 200 karakter' }
    if (description && description.length > 5000) return { success: false, error: 'Deskripsi maksimal 5000 karakter' }
    if (brand.length > 100) return { success: false, error: 'Brand maksimal 100 karakter' }

    if (price < 0) return { success: false, error: 'Harga tidak boleh negatif' }
    if (stock < 0) return { success: false, error: 'Stok tidak boleh negatif' }

    await db.update(products).set({
      name,
      category,
      brand,
      gender,
      price,
      description,
      image,
      sizes,
      stock,
      isBestSeller,
      isFeatured,
      stockData: JSON.stringify({ prices: sizePrices, salePrices: sizeSalePrices }),
    }).where(eq(products.id, id))

    // Diff additional images: only delete S3 files for images that are truly removed
    const oldImages = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.order)
    const oldUrls = new Set(oldImages.map(img => img.url))
    const newValidImages = images.filter(url => url && url.trim() !== '')
    const newUrls = new Set(newValidImages)

    // Delete S3 files for images no longer referenced
    for (const img of oldImages) {
      if (!newUrls.has(img.url)) {
        await deleteFromS3(img.url)
      }
    }

    // Replace DB records
    await db.delete(productImages).where(eq(productImages.productId, id))
    if (newValidImages.length > 0) {
      await db.insert(productImages).values(
        newValidImages.map((url, i) => ({
          url,
          productId: id,
          order: i,
        }))
      )
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    revalidatePath('/products')
    revalidatePath(`/product/${id}`)
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
