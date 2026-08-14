'use server'

import { db } from '@/lib/db'
import { orders, orderItems, paymentMethods, products, warItems, settings } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { calculateOrderTotal, type ZoneId } from '@/lib/shipping'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

export async function createOrder(data: {
  customerName: string
  customerPhone: string
  shippingAddress: string
  shippingZone: string
  shippingService: string
  items: { productId: string; quantity: number; size: string; price: number; notes?: string; source?: string; warItemId?: string }[]
  paymentMethodId: string
  giftWrap?: boolean
  giftWrapNote?: string
}) {
  try {
    // Split items into normal and war
    const normalItems = data.items.filter(i => i.source !== 'war')
    const warItemsData = data.items.filter(i => i.source === 'war')

    // 1. Re-fetch normal product prices from DB — never trust client prices
    const productIds = normalItems.map(i => i.productId)
    const dbProducts = productIds.length > 0
      ? await db.select().from(products).where(sql`${products.id} IN ${productIds}`)
      : []
    const productMap = new Map(dbProducts.map(p => [p.id, p]))

    // 2. Verify stock + rebuild items with DB prices
    const verifiedItems = []

    // Normal items: validate product stock
    for (const item of normalItems) {
      const product = productMap.get(item.productId)
      if (!product) return { success: false, error: `Product not found: ${item.productId}` }
      if (product.stock < item.quantity) {
        return { success: false, error: `"${product.name}" hanya tersisa ${product.stock} stok` }
      }
      verifiedItems.push({ ...item, price: product.price })
    }

    // War items: validate war stock
    for (const item of warItemsData) {
      if (!item.warItemId) return { success: false, error: 'War item ID missing' }
      const [warItem] = await db.select().from(warItems).where(eq(warItems.id, item.warItemId))
      if (!warItem) return { success: false, error: `War product not found` }
      if (warItem.stock < item.quantity) {
        return { success: false, error: `"${warItem.name}" hanya tersisa ${warItem.stock} stok war` }
      }
      verifiedItems.push({ ...item, productId: warItem.productId || item.productId, price: item.price })
    }

    // 3. Recalculate total server-side
    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalQty = verifiedItems.reduce((sum, item) => sum + item.quantity, 0)

    const [paymentMethod] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, data.paymentMethodId))

    const [thresholdSetting] = await db.select().from(settings).where(eq(settings.key, 'shipping_free_threshold')).limit(1)
    const freeShippingThreshold = Number(thresholdSetting?.value) || undefined

    const orderCalc = calculateOrderTotal({
      subtotal,
      totalQty,
      shippingZone: data.shippingZone as ZoneId,
      shippingService: data.shippingService,
      isTransfer: paymentMethod?.type === 'transfer',
      freeShippingThreshold,
    })

    // 4. Create order with server-verified total
    const [order] = await db.insert(orders).values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      shippingZone: data.shippingZone,
      paymentMethodId: data.paymentMethodId,
      total: orderCalc.total,
      status: 'PENDING',
      giftWrap: data.giftWrap || false,
      giftWrapNote: data.giftWrapNote || null,
    }).returning()

    // 5. Insert items with DB prices
    if (verifiedItems.length > 0) {
      await db.insert(orderItems).values(
        verifiedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          notes: item.notes || null,
        }))
      )

      // 6. Decrement stock
      for (const item of verifiedItems) {
        if (item.source === 'war' && item.warItemId) {
          // Decrement war stock
          const [wi] = await db.select().from(warItems).where(eq(warItems.id, item.warItemId))
          if (wi) await db.update(warItems).set({ stock: wi.stock - item.quantity }).where(eq(warItems.id, item.warItemId))
        } else {
          // Decrement normal product stock
          const product = productMap.get(item.productId)
          if (product) {
            await db.update(products).set({ stock: product.stock - item.quantity }).where(eq(products.id, item.productId))
          }
        }
      }
    }

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Failed to create order.' }
  }
}

export async function getOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export async function getActivePaymentMethods() {
  try {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.isActive, true))
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await verifyAdmin()
    await db.update(orders).set({ status }).where(eq(orders.id, orderId))
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false }
  }
}
