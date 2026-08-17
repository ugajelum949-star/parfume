'use server'

import { db } from '@/lib/db'
import { banners } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'
import { deleteFromS3 } from '@/lib/s3-storage'

export async function getBanners() {
  return db.select().from(banners).orderBy(banners.order)
}

export async function createBanner(formData: FormData) {
  try {
    await verifyAdmin()
    const title = (formData.get('title') as string || '').trim()
    const image = formData.get('image') as string
    const link = (formData.get('link') as string || '').trim()
    const active = formData.get('active') === 'true'
    const order = Math.max(0, parseInt(formData.get('order') as string) || 0)

    if (!image) return { success: false, error: 'Image is required.' }

    await db.insert(banners).values({ title: title || null, image, link: link || null, active, order })
    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (error) {
    console.error('Error creating banner:', error)
    return { success: false, error: 'Failed to create banner.' }
  }
}

export async function updateBanner(id: string, formData: FormData) {
  try {
    await verifyAdmin()
    const title = (formData.get('title') as string || '').trim()
    const image = formData.get('image') as string
    const link = (formData.get('link') as string || '').trim()
    const active = formData.get('active') === 'true'
    const order = Math.max(0, parseInt(formData.get('order') as string) || 0)

    await db.update(banners).set({
      title: title || null, image, link: link || null, active, order,
    }).where(eq(banners.id, id))
    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (error) {
    console.error('Error updating banner:', error)
    return { success: false, error: 'Failed to update banner.' }
  }
}

export async function deleteBanner(id: string) {
  try {
    await verifyAdmin()

    // Fetch banner to get image URL before deleting
    const [banner] = await db.select().from(banners).where(eq(banners.id, id)).limit(1)
    if (banner?.image) await deleteFromS3(banner.image)

    await db.delete(banners).where(eq(banners.id, id))
    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (error) {
    console.error('Error deleting banner:', error)
    return { success: false, error: 'Failed to delete banner.' }
  }
}

export async function toggleBanner(id: string, active: boolean) {
  try {
    await verifyAdmin()
    await db.update(banners).set({ active }).where(eq(banners.id, id))
    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch (error) {
    console.error('Error toggling banner:', error)
    return { success: false, error: 'Failed to toggle banner.' }
  }
}
