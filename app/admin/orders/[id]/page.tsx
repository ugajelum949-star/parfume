import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MapPin, Calendar, Phone, User, Package } from 'lucide-react'
import { OrderStatusUpdater } from './OrderStatusUpdater'

export const dynamic = 'force-dynamic'

function formatDate(d: Date | string | null) {
  if (!d) return '-'
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [order] = await db.select().from(orders).where(eq(orders.id, id))
  if (!order) notFound()

  const items = await db.select({
    id: orderItems.id,
    quantity: orderItems.quantity,
    size: orderItems.size,
    price: orderItems.price,
    notes: orderItems.notes,
    productId: orderItems.productId,
    productName: products.name,
    productBrand: products.brand,
    productImage: products.image,
  }).from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id))

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    PAID: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    PROCESSING: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    SHIPPED: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Menunggu Bayar', PAID: 'Sudah Bayar', PROCESSING: 'Diproses',
    SHIPPED: 'Dikirim', COMPLETED: 'Selesai',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Detail</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">{order.id}</p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColors[order.status] || 'bg-accent text-muted-foreground'}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer info */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{order.customerName || 'Guest'}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.customerPhone}</span>
              </div>
            )}
            {order.shippingAddress && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{order.shippingAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status updater */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Update Status</CardTitle></CardHeader>
          <CardContent>
            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-sm">Ringkasan</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span>{items.length} produk</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Qty</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-gold">{formatCurrency(order.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order items */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-sm">Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gold/5 shrink-0">
                  {item.productImage ? (
                    <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.productName || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{item.productBrand} · {item.size}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{formatCurrency(item.price)}</p>
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
