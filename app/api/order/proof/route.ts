import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sendTelegramPhoto } from '@/lib/telegram'
import { rateLimit } from '@/lib/ratelimit'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 uploads per minute per IP
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(`proof:${ip}`, 5, 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const orderId = formData.get('orderId') as string | null

    if (!file || !orderId) {
      return NextResponse.json({ error: 'file and orderId are required' }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and WebP are allowed' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Max file size is 20MB' }, { status: 400 })
    }

    // Verify order exists before updating
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only update if order is PENDING
    if (existingOrder.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 })
    }

    // Update order status to PAID (admin verifies manually → PROCESSING)
    await db
      .update(orders)
      .set({ status: 'PAID', updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    // Fire-and-forget: send proof to Telegram
    const allSettings = await db.select().from(settings)
    const s = Object.fromEntries(allSettings.map(r => [r.key, r.value]))
    if (s.telegramBotToken && s.telegramChatId) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const caption = `Bukti Pembayaran\nOrder: ${orderId}\nCustomer: ${existingOrder.customerName || '-'}\nTotal: Rp ${existingOrder.total.toLocaleString('id-ID')}`
      sendTelegramPhoto(s.telegramBotToken, s.telegramChatId, buffer, caption).catch(err => {
        console.error('[proof] Telegram photo failed:', err)
      })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[proof] POST error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
