import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { rateLimit } from '@/lib/ratelimit'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = _req.headers.get('x-forwarded-for') || _req.headers.get('x-real-ip') || 'unknown'
    const rl = rateLimit(`order:${ip}`, 10, 60 * 1000)
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 })
    }

    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only return safe fields (no PII leakage)
    const safeOrder = {
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      paymentMethodId: order.paymentMethodId,
    }

    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        size: orderItems.size,
        price: orderItems.price,
        notes: orderItems.notes,
        productName: products.name,
        productImage: products.image,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id))

    return NextResponse.json({ ...safeOrder, items })
  } catch (e) {
    console.error('[order] GET error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
