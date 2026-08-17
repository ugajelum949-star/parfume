import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { orders, orderItems, products, paymentMethods, settings } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, CreditCard, File, Package, Truck, ShoppingCart } from 'lucide-react'
import InvoiceClient from './InvoiceClient'

export const dynamic = 'force-dynamic'

const STEPS = [
  { key: 'CREATED', label: 'Order Dibuat', icon: ShoppingCart },
  { key: 'PROOF_UPLOADED', label: 'Bukti Diterima', icon: File },
  { key: 'PAYMENT', label: 'Pembayaran', icon: CreditCard },
  { key: 'PROCESSING', label: 'Diproses', icon: Package },
  { key: 'SHIPPED', label: 'Dikirim', icon: Truck },
  { key: 'COMPLETED', label: 'Selesai', icon: CheckCircle },
]

function stepIndex(status: string) {
  const map: Record<string, number> = {
    PENDING: 1,
    PROOF_UPLOADED: 2,
    PAID: 3,
    PROCESSING: 4,
    SHIPPED: 5,
    COMPLETED: 6,
  }
  return map[status] ?? 0
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  if (!order) notFound()

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

  let paymentMethod: typeof paymentMethods.$inferSelect | null = null
  if (order.paymentMethodId) {
    const [pm] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, order.paymentMethodId))
      .limit(1)
    paymentMethod = pm ?? null
  }

  const allSettings = await db.select().from(settings)
  const s = Object.fromEntries(allSettings.map(r => [r.key, r.value]))
  const currentStep = stepIndex(order.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-foreground">Invoice</h1>
          <p className="text-sm text-muted-foreground">
            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : ''}
          </p>
        </div>

        {/* Progress Stepper */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => {
                const isActive = i + 1 <= currentStep
                const Icon = step.icon
                return (
                  <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`rounded-full p-1.5 ${isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        {paymentMethod && (
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-muted-foreground">{paymentMethod.label}</p>
              {paymentMethod.type === 'transfer' && paymentMethod.accountNumber && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Transfer ke:</p>
                  <p className="text-sm font-medium text-foreground">{paymentMethod.accountName}</p>
                  <p className="text-lg font-mono font-bold text-primary">{paymentMethod.accountNumber}</p>
                </div>
              )}
              {paymentMethod.type === 'qris' && paymentMethod.qrisImageUrl && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentMethod.qrisImageUrl}
                    alt="QRIS"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm">Detail Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="space-y-0.5">
                  <p className="text-foreground">{item.productName || 'Produk'}</p>
                  <p className="text-xs text-muted-foreground">{item.size} x {item.quantity}</p>
                  {item.notes && <p className="text-xs text-muted-foreground italic">{item.notes}</p>}
                </div>
                <p className="text-foreground font-medium whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Client: upload + confirm */}
        <InvoiceClient
          orderId={order.id}
          storeWhatsApp={s.whatsapp}
          confirmButtonType={s.confirmButtonType}
          storeTelegramUsername={s.telegramUsername}
          giftWrap={order.giftWrap}
          giftWrapNote={order.giftWrapNote}
        />
      </div>
    </div>
  )
}
