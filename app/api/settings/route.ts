import { db } from '@/lib/db'
import { settings } from '@/db/schema'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic';

// Settings keys that should NEVER be exposed via public API
const HIDDEN_KEYS = ['telegramBotToken', 'telegramChatId']

export async function GET(req: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rl = rateLimit(`settings:${ip}`, 30, 60 * 1000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const allSettings = await db.select().from(settings)
  const settingsMap = allSettings
    .filter(s => !HIDDEN_KEYS.includes(s.key))
    .reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc
    }, {} as Record<string, string>)

  return NextResponse.json(settingsMap)
}
