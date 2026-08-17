'use server'

import { db } from '@/lib/db'
import { featuredBrands, products, settings } from '@/db/schema'
import { eq, asc, count, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'

const MAX_FEATURED_BRANDS = 5

export async function getFeaturedBrands() {
  return db
    .select()
    .from(featuredBrands)
    .orderBy(asc(featuredBrands.order), asc(featuredBrands.brand))
}

export async function createFeaturedBrand(formData: FormData) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const brand = (formData.get('brand') as string || '').trim()
  const order = Number(formData.get('order') || 0)

  if (!brand) return { success: false, error: 'Brand wajib diisi' }

  // Check max active brands
  const activeCount = await db
    .select({ val: count() })
    .from(featuredBrands)
    .where(eq(featuredBrands.active, true))

  if ((activeCount[0]?.val ?? 0) >= MAX_FEATURED_BRANDS) {
    return {
      success: false,
      error: `Maksimal ${MAX_FEATURED_BRANDS} brand unggulan. Silakan hapus atau nonaktifkan brand yang ada terlebih dahulu.`
    }
  }

  try {
    await db.insert(featuredBrands).values({
      brand,
      order: Math.min(Math.max(order, 0), MAX_FEATURED_BRANDS - 1),
      active: true,
    })
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('unique') || msg.includes('23505')) {
      return { success: false, error: 'Brand ini sudah terdaftar di Featured Brands' }
    }
    return { success: false, error: 'Gagal menambahkan featured brand' }
  }
}

export async function updateFeaturedBrand(id: string, formData: FormData) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const brand = (formData.get('brand') as string || '').trim()
  const order = Number(formData.get('order') || 0)

  try {
    await db.update(featuredBrands)
      .set({
        brand: brand || undefined,
        order: Math.min(Math.max(order, 0), MAX_FEATURED_BRANDS - 1),
      })
      .where(eq(featuredBrands.id, id))

    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal memperbarui featured brand' }
  }
}

export async function deleteFeaturedBrand(id: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    await db.delete(featuredBrands).where(eq(featuredBrands.id, id))
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menghapus featured brand' }
  }
}

export async function toggleFeaturedBrand(id: string, active: boolean) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // If activating, check max active count
  if (active) {
    const activeCount = await db
      .select({ val: count() })
      .from(featuredBrands)
      .where(eq(featuredBrands.active, true))

    if ((activeCount[0]?.val ?? 0) >= MAX_FEATURED_BRANDS) {
      return {
        success: false,
        error: `Maksimal ${MAX_FEATURED_BRANDS} brand unggulan aktif. Nonaktifkan brand lain terlebih dahulu.`
      }
    }
  }

  try {
    // Get brand name before toggling
    const [brandRow] = await db.select().from(featuredBrands).where(eq(featuredBrands.id, id)).limit(1)

    await db.update(featuredBrands)
      .set({ active })
      .where(eq(featuredBrands.id, id))

    // When deactivating, clean gender slots that reference this brand's products
    if (!active && brandRow) {
      const brandProds = await db.select({ id: products.id }).from(products).where(eq(products.brand, brandRow.brand))
      const brandIds = new Set(brandProds.map(p => p.id))
      const raw = await db.select().from(settings).where(eq(settings.key, 'gender_curated_slots')).limit(1)
      if (raw[0]?.value) {
        try {
          const slots = JSON.parse(raw[0].value)
          let changed = false
          for (const key of ['Men', 'Women', 'Unisex'] as const) {
            if (Array.isArray(slots[key])) {
              const filtered = slots[key].filter((pid: string) => !brandIds.has(pid))
              if (filtered.length !== slots[key].length) { slots[key] = filtered; changed = true }
            }
          }
          if (changed) {
            await db.insert(settings).values({ key: 'gender_curated_slots', value: JSON.stringify(slots) })
              .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(slots) } })
          }
        } catch {}
      }
    }

    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal mengubah status featured brand' }
  }
}

export async function getBrandProducts(brand: string) {
  return db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      price: products.price,
      image: products.image,
      stock: products.stock,
      stockData: products.stockData,
      sizes: products.sizes,
    })
    .from(products)
    .where(eq(products.brand, brand))
    .orderBy(desc(products.createdAt))
}

export async function getAllProductsForPicker() {
  return db
    .select({
      id: products.id,
      name: products.name,
      brand: products.brand,
      gender: products.gender,
      image: products.image,
    })
    .from(products)
    .orderBy(desc(products.createdAt))
}
