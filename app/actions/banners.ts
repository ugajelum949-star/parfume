'use server'

import { db } from '@/lib/db'
import { banners } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

export async function getBanners() {
  return db.select().from(banners).orderBy(banners.order)
}

export async function createBanner(formData: FormData) {
  await verifyAdmin()
  const title = (formData.get('title') as string || '').trim()
  const image = formData.get('image') as string
  const link = (formData.get('link') as string || '').trim()
  const active = formData.get('active') === 'true'
  const order = parseInt(formData.get('order') as string) || 0

  if (!image) return { success: false, error: 'Image is required.' }

  await db.insert(banners).values({ title: title || null, image, link: link || null, active, order })
  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}

export async function updateBanner(id: string, formData: FormData) {
  await verifyAdmin()
  const title = (formData.get('title') as string || '').trim()
  const image = formData.get('image') as string
  const link = (formData.get('link') as string || '').trim()
  const active = formData.get('active') === 'true'
  const order = parseInt(formData.get('order') as string) || 0

  await db.update(banners).set({
    title: title || null, image, link: link || null, active, order,
  }).where(eq(banners.id, id))
  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}

export async function deleteBanner(id: string) {
  await verifyAdmin()
  await db.delete(banners).where(eq(banners.id, id))
  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}

export async function toggleBanner(id: string, active: boolean) {
  await verifyAdmin()
  await db.update(banners).set({ active }).where(eq(banners.id, id))
  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}
