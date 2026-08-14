import { db } from '@/lib/db'
import { orders, orderItems } from '@/db/schema'
import { desc, eq, count } from 'drizzle-orm'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Calendar, MapPin, Hash } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getOrders() {
  const result = await db
    .select({
      id: orders.id,
      total: orders.total,
      status: orders.status,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      shippingAddress: orders.shippingAddress,
      createdAt: orders.createdAt,
      giftWrap: orders.giftWrap,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))

  // Get item counts
  const ordersWithItems = await Promise.all(
    result.map(async (order) => {
      const [itemCount] = await db
        .select({ total: count() })
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id))
      return { ...order, itemCount: itemCount?.total || 0 }
    })
  )

  return ordersWithItems
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  PAID: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  PROCESSING: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  SHIPPED: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Bayar',
  PAID: 'Sudah Bayar',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  COMPLETED: 'Selesai',
}

function formatDate(d: Date | string | null) {
  if (!d) return '-'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function OrdersPage() {
  const ordersList = await getOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground text-sm">{ordersList.length} total orders</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {ordersList.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada order.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {ordersList.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="block px-4 py-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm">{order.customerName || 'Guest'}</p>
                        {order.giftWrap && <span className="text-xs" title="Gift Wrapping">🎁</span>}
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusColors[order.status] || 'bg-accent text-muted-foreground'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          {order.itemCount} item
                        </span>
                        {order.customerPhone && <span>{order.customerPhone}</span>}
                      </div>
                      {order.shippingAddress && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{order.shippingAddress}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gold">{formatCurrency(order.total)}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{order.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
