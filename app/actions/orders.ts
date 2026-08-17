'use server'

import { db } from '@/lib/db'
import { orders, orderItems, paymentMethods, products, warItems, settings } from '@/db/schema'
import { eq, desc, sql, and, gte } from 'drizzle-orm'
import { calculateOrderTotal, type ZoneId } from '@/lib/shipping'
import { getSizePrice } from '@/lib/price'
import { verifyAdmin } from './auth'
import { revalidatePath } from 'next/cache'

const ALLOWED_STATUSES = ['PENDING', 'PROOF_UPLOADED', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] as const
const ALLOWED_SHIPPING_SERVICES = ['reguler', 'instant', 'next_day'] as const

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
  ipAddress?: string
}) {
  try {
    // Validate inputs
    if (!data.items || data.items.length === 0 || data.items.length > 20) {
      return { success: false, error: 'Jumlah item tidak valid (maksimal 20)' }
    }

    const VALID_ZONES = ['jabodetabek', 'jawa', 'sumatera', 'kalimantan', 'sulawesi', 'bali-nusatenggara', 'maluku', 'papua']
    if (!VALID_ZONES.includes(data.shippingZone)) {
      return { success: false, error: 'Zona pengiriman tidak valid' }
    }

    if (!ALLOWED_SHIPPING_SERVICES.includes(data.shippingService as typeof ALLOWED_SHIPPING_SERVICES[number])) {
      return { success: false, error: 'Invalid shipping service' }
    }

    // War order limit: only enforced when order contains war items
    const hasWarItems = data.items.some(i => i.source === 'war')
    if (hasWarItems) {
      const clientIp = data.ipAddress || 'unknown'
      if (clientIp !== 'unknown') {
        // Get configurable limit from settings (default: 2)
        const limitRaw = await db.select().from(settings).where(eq(settings.key, 'war_max_orders_per_ip')).limit(1)
        const maxOrders = Number(limitRaw[0]?.value) || 2

        const recentWarOrders = await db.select({ id: orders.id }).from(orders).where(
          and(
            eq(orders.ipAddress, clientIp),
            gte(orders.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
          )
        ).limit(maxOrders + 1)
        if (recentWarOrders.length >= maxOrders) {
          return { success: false, error: `Batas pemesanan war tercapai (maks ${maxOrders} pesanan/24 jam per IP).` }
        }
      }
    }

    const [paymentMethod] = await db.select().from(paymentMethods).where(and(eq(paymentMethods.id, data.paymentMethodId), eq(paymentMethods.isActive, true)))
    if (!paymentMethod) return { success: false, error: 'Payment method not found' }

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
    const verifiedItems: { productId: string | null; quantity: number; size: string; price: number; notes?: string; source?: string; warItemId?: string }[] = []

    // Normal items: validate product stock, use per-size DB price
    for (const item of normalItems) {
      const product = productMap.get(item.productId)
      if (!product) return { success: false, error: `Product not found: ${item.productId}` }
      if (product.stock < item.quantity) {
        return { success: false, error: `"${product.name}" hanya tersisa ${product.stock} stok` }
      }
      // Use per-size pricing from stockData
      const sizePrice = getSizePrice(product.stockData, item.size, product.price)
      verifiedItems.push({ ...item, price: sizePrice.final })
    }

    // War items: validate war stock, use DB price (never client price)
    for (const item of warItemsData) {
      if (!item.warItemId) return { success: false, error: 'War item ID missing' }
      const [warItem] = await db.select().from(warItems).where(eq(warItems.id, item.warItemId))
      if (!warItem) return { success: false, error: `War product not found` }
      if (warItem.stock < item.quantity) {
        return { success: false, error: `"${warItem.name}" hanya tersisa ${warItem.stock} stok war` }
      }
      // Use war item price from DB, not client price
      verifiedItems.push({
        ...item,
        productId: warItem.productId || null, // null during active war (no product yet)
        warItemId: warItem.id,
        price: warItem.price,
      })
    }

    // 3. Fetch configurable settings from DB
    const settingKeys = ['shipping_free_threshold', 'shipping_customization_fee', 'shipping_transfer_discount', 'shipping_instant_price', 'shipping_nextday_surcharge']
    const dbSettings = await db.select().from(settings).where(sql`${settings.key} IN ${settingKeys}`)
    const settingsMap = new Map(dbSettings.map(s => [s.key, s.value]))

    // 4. Recalculate total server-side with configurable settings
    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const totalQty = verifiedItems.reduce((sum, item) => sum + item.quantity, 0)

    const orderCalc = calculateOrderTotal({
      subtotal,
      totalQty,
      shippingZone: data.shippingZone as ZoneId,
      shippingService: data.shippingService,
      isTransfer: paymentMethod.type === 'transfer',
      freeShippingThreshold: settingsMap.get('shipping_free_threshold') ? Number(settingsMap.get('shipping_free_threshold')) : undefined,
      customizationFee: settingsMap.get('shipping_customization_fee') ? Number(settingsMap.get('shipping_customization_fee')) : undefined,
      transferDiscount: settingsMap.get('shipping_transfer_discount') ? Number(settingsMap.get('shipping_transfer_discount')) : undefined,
      instantPrice: settingsMap.get('shipping_instant_price') ? Number(settingsMap.get('shipping_instant_price')) : undefined,
      nextdaySurcharge: settingsMap.get('shipping_nextday_surcharge') ? Number(settingsMap.get('shipping_nextday_surcharge')) : undefined,
    })

    // Include gift wrap in total
    const giftWrapCost = data.giftWrap ? (Number(settingsMap.get('giftWrapPrice')) || 15000) : 0
    const finalTotal = orderCalc.total + giftWrapCost

    // 5. Create order with server-verified total (includes gift wrap)
    const [order] = await db.insert(orders).values({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      shippingZone: data.shippingZone,
      paymentMethodId: data.paymentMethodId,
      total: finalTotal,
      status: 'PENDING',
      giftWrap: data.giftWrap || false,
      giftWrapNote: data.giftWrapNote || null,
    }).returning()

    // 6. Insert items with DB prices + warItemId
    if (verifiedItems.length > 0) {
      await db.insert(orderItems).values(
        verifiedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId || null,
          warItemId: item.warItemId || null,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
          notes: item.notes || null,
        }))
      )

      // 7. Decrement stock atomically (prevents TOCTOU race)
      for (const item of verifiedItems) {
        if (item.source === 'war' && item.productId) {
          // War-converted product: decrement products table
          const result = await db.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(and(eq(products.id, item.productId), sql`${products.stock} >= ${item.quantity}`))
            .returning({ id: products.id })
          if (result.length === 0) {
            return { success: false, error: `"${item.size}" stok tidak mencukupi` }
          }
        } else if (item.source === 'war' && item.warItemId) {
          // Active war (no product yet): decrement warItems table
          const result = await db.update(warItems)
            .set({ stock: sql`${warItems.stock} - ${item.quantity}` })
            .where(and(eq(warItems.id, item.warItemId), sql`${warItems.stock} >= ${item.quantity}`))
            .returning({ id: warItems.id })
          if (result.length === 0) {
            return { success: false, error: `Stok war tidak mencukupi` }
          }
        } else {
          // Normal product: decrement products table
          const result = await db.update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(and(eq(products.id, item.productId!), sql`${products.stock} >= ${item.quantity}`))
            .returning({ id: products.id })
          if (result.length === 0) {
            return { success: false, error: `Stok tidak mencukupi` }
          }
        }
      }
    }

    revalidatePath('/admin/orders')
    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Failed to create order.' }
  }
}

export async function getOrders() {
  try {
    await verifyAdmin()
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

export async function updateOrderStatus(orderId: string, status: string, orderUpdatedAt?: string) {
  try {
    await verifyAdmin()
    if (!ALLOWED_STATUSES.includes(status as typeof ALLOWED_STATUSES[number])) {
      return { success: false, error: 'Invalid status' }
    }

    // Optimistic lock: reject if another admin modified the order since page load
    if (orderUpdatedAt) {
      const [current] = await db.select({ updatedAt: orders.updatedAt }).from(orders).where(eq(orders.id, orderId)).limit(1)
      if (!current) return { success: false, error: 'Order not found' }
      if (current.updatedAt && new Date(current.updatedAt).getTime() !== new Date(orderUpdatedAt).getTime()) {
        return { success: false, error: 'Order sudah diubah oleh admin lain. Silakan refresh halaman.' }
      }
    }

    await db.update(orders).set({ status }).where(eq(orders.id, orderId))
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Gagal mengupdate status' }
  }
}
