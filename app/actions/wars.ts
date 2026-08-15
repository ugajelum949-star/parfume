'use server'

import { db } from '@/lib/db'
import { wars, warItems, products } from '@/db/schema'
import { eq, and, lte, gt, desc, sql } from 'drizzle-orm'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

/** Get all wars (admin) */
export async function getWars() {
  return db.select().from(wars).orderBy(desc(wars.createdAt))
}

/** Get active wars for homepage (startTime <= now, endTime >= now) */
export async function getActiveWars() {
  const now = new Date()
  const active = await db.select().from(wars).where(
    and(eq(wars.active, true), lte(wars.startTime, now), gt(wars.endTime, now))
  )
  return active
}

/** Get scheduled wars (startTime > now) — for "Coming Soon" */
export async function getScheduledWars() {
  const now = new Date()
  return db.select().from(wars).where(
    and(eq(wars.active, true), eq(wars.converted, false), gt(wars.startTime, now))
  ).orderBy(wars.startTime)
}

/** Get war with items */
export async function getWarWithItems(warId: string) {
  const [war] = await db.select().from(wars).where(eq(wars.id, warId))
  if (!war) return null
  const items = await db.select().from(warItems).where(eq(warItems.warId, warId))
  return { ...war, items }
}

/** Create war with items */
export async function createWar(data: {
  name: string
  description?: string
  image?: string
  startTime: string
  endTime: string
  items: { name: string; brand: string; category: string; gender: string; price: number; sizes: string; stock: number; image?: string }[]
}) {
  try {
    await verifyAdmin()

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return { success: false, error: 'End time must be after start time' }
    }

    const [war] = await db.insert(wars).values({
      name: data.name,
      description: data.description || null,
      image: data.image || null,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    }).returning()

    if (data.items.length > 0) {
      await db.insert(warItems).values(
        data.items.map(item => ({
          warId: war.id,
          name: item.name,
          brand: item.brand,
          category: item.category,
          gender: item.gender,
          price: item.price,
          sizes: item.sizes,
          stock: item.stock,
          image: item.image || null,
        }))
      )
    }

    revalidatePath('/')
    revalidatePath('/admin/wars')
    return { success: true, warId: war.id }
  } catch (error) {
    console.error('Error creating war:', error)
    return { success: false, error: 'Failed to create war.' }
  }
}

/** Delete war + items */
export async function deleteWar(id: string) {
  await verifyAdmin()
  await db.delete(warItems).where(eq(warItems.warId, id))
  await db.delete(wars).where(eq(wars.id, id))
  revalidatePath('/')
  revalidatePath('/admin/wars')
  return { success: true }
}

/** Convert war to products — uses atomic CAS to prevent duplicates */
async function convertWarToProductsInternal(warId: string) {
  // Atomic compare-and-swap: mark as converted first (prevents concurrent duplicates)
  const [updated] = await db.update(wars)
    .set({ converted: true })
    .where(and(eq(wars.id, warId), eq(wars.converted, false)))
    .returning()

  // If no row updated, another call already converted it
  if (!updated) return

  const items = await db.select().from(warItems).where(eq(warItems.warId, warId))

  for (const item of items) {
    const [product] = await db.insert(products).values({
      name: item.name,
      brand: item.brand,
      category: item.category,
      gender: item.gender,
      price: item.price,
      sizes: item.sizes,
      stock: item.stock,
      image: item.image,
      warPrice: item.price,
      launchedAt: new Date(),
      stockData: '{}',
    }).returning()

    await db.update(warItems).set({ productId: product.id }).where(eq(warItems.id, item.id))
  }

  revalidatePath('/')
  revalidatePath('/admin/wars')
  revalidatePath('/admin/products')
}

/** Convert war to products (admin version — with auth) */
export async function convertWarToProducts(warId: string) {
  try {
    await verifyAdmin()
    await convertWarToProductsInternal(warId)
    return { success: true }
  } catch (error) {
    console.error('Error converting war:', error)
    return { success: false, error: 'Failed to convert war.' }
  }
}

/** Check and auto-convert expired wars (public — no auth needed) */
export async function checkExpiredWars() {
  const now = new Date()
  const expired = await db.select().from(wars).where(
    and(eq(wars.active, true), eq(wars.converted, false), lte(wars.endTime, now))
  )
  for (const war of expired) {
    await convertWarToProductsInternal(war.id)
  }
}
