'use server'

import { db } from '@/lib/db'
import { settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

export async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  return row?.value ?? null
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const rows = await db.select().from(settings)
  const map: Record<string, string> = {}
  for (const row of rows) {
    if (keys.includes(row.key)) {
      map[row.key] = row.value
    }
  }
  return map
}

export async function updateSetting(key: string, value: string) {
  try {
    await verifyAdmin()

    const [existing] = await db.select().from(settings).where(eq(settings.key, key)).limit(1)

    if (existing) {
      await db.update(settings).set({ value }).where(eq(settings.key, key))
    } else {
      await db.insert(settings).values({ key, value })
    }

    revalidatePath('/admin/settings')
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function updateSettings(data: Record<string, string>) {
  try {
    await verifyAdmin()

    for (const [key, value] of Object.entries(data)) {
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } })
    }

    revalidatePath('/admin/settings')
    revalidatePath('/cart')
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}

export async function getGenderSlots(): Promise<{
  Men: string[]
  Women: string[]
  Unisex: string[]
}> {
  const raw = await getSetting('gender_curated_slots')
  if (!raw) return { Men: [], Women: [], Unisex: [] }
  try {
    const parsed = JSON.parse(raw)
    return {
      Men: Array.isArray(parsed.Men) ? parsed.Men.slice(0, 4) : [],
      Women: Array.isArray(parsed.Women) ? parsed.Women.slice(0, 4) : [],
      Unisex: Array.isArray(parsed.Unisex) ? parsed.Unisex.slice(0, 4) : [],
    }
  } catch {
    return { Men: [], Women: [], Unisex: [] }
  }
}

export async function saveGenderSlots(slots: {
  Men: string[]
  Women: string[]
  Unisex: string[]
}) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const sanitized = {
      Men: Array.isArray(slots.Men) ? slots.Men.filter(Boolean).slice(0, 4) : [],
      Women: Array.isArray(slots.Women) ? slots.Women.filter(Boolean).slice(0, 4) : [],
      Unisex: Array.isArray(slots.Unisex) ? slots.Unisex.filter(Boolean).slice(0, 4) : [],
    }
    await updateSetting('gender_curated_slots', JSON.stringify(sanitized))
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menyimpan kurasi slot gender' }
  }
}

export async function updateSettingsFromForm(formData: FormData) {
  try {
    await verifyAdmin()

    const sanitizePhone = (v: string) => {
      const digits = v.replace(/\D/g, '')
      return digits.startsWith('0') ? '62' + digits.slice(1) : digits
    }

    const sanitizeUsername = (v: string) => v.trim().replace(/^@/, '')

    const entries: [string, string][] = [
      ['store_name', (formData.get('store_name') as string || '').trim()],
      ['store_slogan', (formData.get('store_slogan') as string || '').trim()],
      ['store_logo', (formData.get('store_logo') as string || '').trim()],
      ['support_email', (formData.get('support_email') as string || '').trim()],
      ['bankName', (formData.get('bankName') as string || '').trim()],
      ['bankAccount', (formData.get('bankAccount') as string || '').trim()],
      ['bankHolder', (formData.get('bankHolder') as string || '').trim()],
      ['whatsapp', sanitizePhone(formData.get('whatsapp') as string || '')],
      ['whatsappConfirm', sanitizePhone(formData.get('whatsappConfirm') as string || '')],
      ['telegramBotToken', (formData.get('telegramBotToken') as string || '').trim()],
      ['telegramChatId', (formData.get('telegramChatId') as string || '').trim()],
      ['floatingButtonEnabled', formData.get('floatingButtonEnabled') === 'true' ? 'true' : 'false'],
      ['floatingButtonType', (formData.get('floatingButtonType') as string || 'whatsapp').trim()],
      ['telegramUsername', sanitizeUsername(formData.get('telegramUsername') as string || '')],
      ['confirmButtonType', (formData.get('confirmButtonType') as string || 'both').trim()],
      // Shipping & promos
      ['shipping_free_threshold', (formData.get('shipping_free_threshold') as string || '300000').trim()],
      ['shipping_customization_fee', (formData.get('shipping_customization_fee') as string || '25000').trim()],
      ['shipping_transfer_discount', (formData.get('shipping_transfer_discount') as string || '50000').trim()],
      ['shipping_instant_price', (formData.get('shipping_instant_price') as string || '45000').trim()],
      ['shipping_nextday_surcharge', (formData.get('shipping_nextday_surcharge') as string || '20000').trim()],
      ['promo_qty_bundle', (formData.get('promo_qty_bundle') as string || '3').trim()],
      ['promo_qty_mega', (formData.get('promo_qty_mega') as string || '5').trim()],
      // Gift wrap
      ['giftWrapPrice', (formData.get('giftWrapPrice') as string || '15000').trim()],
      // Homepage images
      ['heroImage', (formData.get('heroImage') as string || '').trim()],
      ['heroForHim', (formData.get('heroForHim') as string || '').trim()],
      ['heroForHer', (formData.get('heroForHer') as string || '').trim()],
      ['heroUnisex', (formData.get('heroUnisex') as string || '').trim()],
      ['scentFresh', (formData.get('scentFresh') as string || '').trim()],
      ['scentFloral', (formData.get('scentFloral') as string || '').trim()],
      ['scentWoody', (formData.get('scentWoody') as string || '').trim()],
      ['scentAmber', (formData.get('scentAmber') as string || '').trim()],
    ]

    for (const [key, value] of entries) {
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({ target: settings.key, set: { value } })
    }

    revalidatePath('/admin/settings')
    revalidatePath('/cart')
    revalidatePath('/')
    return { success: true }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }
}
