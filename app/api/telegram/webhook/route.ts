import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const callbackQuery = body.callback_query

    if (!callbackQuery?.data) {
      return NextResponse.json({ ok: true })
    }

    const data = callbackQuery.data as string
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return NextResponse.json({ ok: true })

    const chatId = callbackQuery.message?.chat?.id
    const messageId = callbackQuery.message?.message_id

    if (data.startsWith('approve_')) {
      const orderId = data.replace('approve_', '')
      await db.update(orders).set({ status: 'PAID', updatedAt: new Date() }).where(eq(orders.id, orderId))

      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id, text: `✅ Order disetujui` }),
      })

      if (chatId && messageId) {
        const newCaption = `${callbackQuery.message.caption || ''}\n\n✅ *DIVERIFIKASI — PAID*`
        await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, caption: newCaption, parse_mode: 'Markdown' }),
        })
      }
    } else if (data.startsWith('reject_')) {
      const orderId = data.replace('reject_', '')
      await db.update(orders).set({ status: 'PENDING', updatedAt: new Date() }).where(eq(orders.id, orderId))

      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id, text: `❌ Order ditolak` }),
      })

      if (chatId && messageId) {
        const newCaption = `${callbackQuery.message.caption || ''}\n\n❌ *DITOLAK — KEMBALI KE PENDING*`
        await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, caption: newCaption, parse_mode: 'Markdown' }),
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook]', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
