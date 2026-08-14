import { db } from '@/lib/db'
import { paymentMethods } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Rate limit: 30 requests per minute per IP
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
  const rl = rateLimit(`pm:${ip}`, 30, 60 * 1000)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const activeMethods = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.isActive, true))
      .orderBy(paymentMethods.createdAt)

    // Only return safe fields (no account numbers)
    const safeMethods = activeMethods.map(m => ({
      id: m.id,
      type: m.type,
      label: m.label,
      qrisImageUrl: m.qrisImageUrl,
      isActive: m.isActive,
    }))

    return NextResponse.json(safeMethods)
  } catch (error) {
    console.error('Failed to fetch payment methods', error)
    return NextResponse.json([], { status: 500 })
  }
}
