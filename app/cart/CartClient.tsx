'use client'

import { useCartStore } from '@/features/cart/store'
import { Header } from '@/components/layout/Header'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder } from '@/app/actions/orders'
import { formatCurrency } from '@/lib/utils'
import { GIFT_WRAP_PRICE } from '@/lib/config'
import { getImageSrc } from '@/lib/image-proxy'
import { PROVINCES, getZoneByProvince, getShippingCost, getAvailableServices, calculateOrderTotal } from '@/lib/shipping'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Loader2 } from 'lucide-react'

type PaymentMethod = {
  id: string
  type: string
  label: string
  accountName: string | null
  accountNumber: string | null
  qrisImageUrl: string | null
}

interface CartClientProps {
  initialSettings: Record<string, string>
  initialPaymentMethods: PaymentMethod[]
}

export function CartClient({ initialSettings, initialPaymentMethods }: CartClientProps) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  const [paymentMethodId, setPaymentMethodId] = useState(initialPaymentMethods[0]?.id || '')
  const [isLoading, setIsLoading] = useState(false)

  // Customer form
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('')
  const [customerPostalCode, setCustomerPostalCode] = useState('')
  const [customerProvince, setCustomerProvince] = useState('')
  const [shippingService, setShippingService] = useState<'reguler' | 'instant' | 'next_day'>('reguler')

  const [giftWrap, setGiftWrap] = useState(false)
  const [giftWrapNote, setGiftWrapNote] = useState('')

  useEffect(() => {
    async function init() {
      setMounted(true)
      try {
        const saved = localStorage.getItem('parfume_customer')
        if (saved) {
          const d = JSON.parse(saved)
          if (d.name) setCustomerName(d.name)
          if (d.phone) setCustomerPhone(d.phone)
          if (d.address) setCustomerAddress(d.address)
          if (d.city) setCustomerCity(d.city)
          if (d.postalCode) setCustomerPostalCode(d.postalCode)
          if (d.province) setCustomerProvince(d.province)
        }
      } catch {}
    }
    init()
  }, [])

  // Shipping calculations
  const shippingZone = (customerProvince ? getZoneByProvince(customerProvince) : undefined) || 'jawa'
  const isSulawesi = shippingZone === 'sulawesi'
  const availableServices = customerProvince && shippingZone ? getAvailableServices(shippingZone) : []
  const baseCost = getShippingCost(shippingZone)

  // Auto-adjust service when zone changes
  useEffect(() => {
    async function init() {
      if (shippingZone === 'jabodetabek' || shippingZone === 'jawa') {
        if (shippingService !== 'reguler' && shippingService !== 'instant') {
          setShippingService('reguler')
        }
      } else {
        if (shippingService !== 'reguler' && shippingService !== 'next_day') {
          setShippingService('reguler')
        }
      }
    }
    init()
  }, [shippingZone, shippingService])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0)
  const selectedMethod = initialPaymentMethods.find(m => m.id === paymentMethodId)

  const giftWrapCost = giftWrap ? (Number(initialSettings.giftWrapPrice) || GIFT_WRAP_PRICE) : 0

  const orderCalc = calculateOrderTotal({
    subtotal,
    totalQty,
    shippingZone,
    shippingService,
    isTransfer: selectedMethod?.type === 'transfer',
    freeShippingThreshold: Number(initialSettings.shipping_free_threshold) || undefined,
    customizationFee: Number(initialSettings.shipping_customization_fee) || undefined,
    transferDiscount: Number(initialSettings.shipping_transfer_discount) || undefined,
    instantPrice: Number(initialSettings.shipping_instant_price) || undefined,
    nextdaySurcharge: Number(initialSettings.shipping_nextday_surcharge) || undefined,
  })

  const finalTotal = orderCalc.total + giftWrapCost

  const handleCheckout = async () => {
    if (!customerName.trim()) { toast.error('Mohon isi nama lengkap'); return }
    if (!customerPhone.trim()) { toast.error('Mohon isi nomor WhatsApp'); return }
    if (!customerAddress.trim()) { toast.error('Mohon isi alamat lengkap'); return }
    if (!customerCity.trim()) { toast.error('Mohon isi kota/kabupaten'); return }
    if (!customerPostalCode.trim()) { toast.error('Mohon isi kode pos'); return }
    if (!customerProvince) { toast.error('Mohon pilih provinsi'); return }
    if (isSulawesi) { toast.error('Maaf, pengiriman ke Sulawesi saat ini dibatasi.'); return }

    setIsLoading(true)
    try {
      try {
        localStorage.setItem('parfume_customer', JSON.stringify({
          name: customerName, phone: customerPhone, address: customerAddress,
          city: customerCity, postalCode: customerPostalCode, province: customerProvince
        }))
      } catch {}

      const fullAddress = `${customerAddress}, ${customerCity}, ${customerPostalCode}, ${customerProvince}`

      const order = await createOrder({
        customerName,
        customerPhone,
        shippingAddress: fullAddress,
        shippingZone,
        shippingService,
        paymentMethodId,
        giftWrap,
        giftWrapNote: giftWrapNote || undefined,
        items: items.map(i => ({
          productId: i.id, quantity: i.quantity, size: i.size, price: i.price,
          source: i.source || 'normal', warItemId: i.warItemId,
        })),
      })

      if (order.success && order.orderId) {
        clearCart()
        toast.success('Order berhasil!')
        router.push(`/invoice/${order.orderId}`)
      } else {
        toast.error(order.error || 'Gagal membuat order')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Keranjang kosong</h1>
          <p className="text-muted-foreground mb-6">Belum ada produk di keranjang.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold px-6 py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Mulai Belanja
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 lg:pb-10">
      <Header />

      <div className="max-w-[1100px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <h1 className="text-xl sm:text-2xl font-bold">CHECKOUT</h1>
          <span className="text-muted-foreground text-xs bg-accent px-2 py-1 rounded font-medium">{totalQty} ITEM</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Shipping */}
            <div id="customer-form" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold font-bold text-sm">1</div>
                <h2 className="text-lg font-bold uppercase tracking-wider">Informasi Pengiriman</h2>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nama Lengkap *</Label>
                    <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Budi Santoso" className="bg-input border-border text-sm h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">No. WhatsApp *</Label>
                    <Input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="0812xxxx (Wajib Aktif)" className="bg-input border-border text-sm h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Alamat Lengkap *</Label>
                  <textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kota/Kabupaten *</Label>
                    <Input value={customerCity} onChange={e => setCustomerCity(e.target.value)} placeholder="Jakarta Selatan" className="bg-input border-border text-sm h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode Pos *</Label>
                    <Input value={customerPostalCode} onChange={e => setCustomerPostalCode(e.target.value)} placeholder="12345" maxLength={5} className="bg-input border-border text-sm h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Provinsi *</Label>
                  <select value={customerProvince} onChange={e => setCustomerProvince(e.target.value)} className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground h-11">
                    <option value="">Pilih Provinsi Tujuan</option>
                    {PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                {customerProvince && availableServices.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Layanan Pengiriman</Label>
                    <select value={shippingService} onChange={e => setShippingService(e.target.value as typeof shippingService)} className="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-foreground h-11">
                      {availableServices.map(s => {
                        let price = 0
                        const instantPrice = Number(initialSettings.shipping_instant_price) || 45000
                        const nextdaySurcharge = Number(initialSettings.shipping_nextday_surcharge) || 20000
                        if (s.id === 'instant') price = orderCalc.promo?.freeShipping ? Math.max(0, instantPrice - baseCost) : instantPrice
                        else if (s.id === 'next_day') price = orderCalc.promo?.freeShipping ? nextdaySurcharge : (baseCost + nextdaySurcharge)
                        else price = orderCalc.promo?.freeShipping ? 0 : baseCost
                        const priceLabel = price === 0 ? 'Gratis' : formatCurrency(price)
                        return <option key={s.id} value={s.id}>{s.label} ({priceLabel})</option>
                      })}
                    </select>
                  </div>
                )}
                {isSulawesi && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm font-bold text-red-400">⚠️ Pengiriman Dibatasi</p>
                    <p className="text-xs text-red-400/80 mt-1">Maaf, pengiriman ke Sulawesi saat ini tidak tersedia.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold font-bold text-sm">2</div>
                <h2 className="text-lg font-bold uppercase tracking-wider">Metode Pembayaran</h2>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl space-y-3">
                {initialPaymentMethods.map(pm => (
                  <label key={pm.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethodId === pm.id ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/30'}`}>
                    <input type="radio" name="payment" checked={paymentMethodId === pm.id} onChange={() => setPaymentMethodId(pm.id)} className="accent-gold w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">{pm.label}</p>
                      <p className="text-xs text-muted-foreground">{pm.type === 'qris' ? 'Scan Barcode / E-Wallet' : 'Transfer Manual'}</p>
                    </div>
                    {pm.type === 'qris' && pm.qrisImageUrl && (
                      <div className="w-12 h-12 rounded bg-white p-1 shrink-0">
                        <img src={getImageSrc(pm.qrisImageUrl)} alt={pm.label} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </label>
                ))}
                {/* Selected method preview */}
                {selectedMethod?.type === 'transfer' && selectedMethod.accountNumber && (
                  <div className="bg-accent/50 border border-border p-5 rounded-xl mt-2">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-2 tracking-wider">Transfer ke:</p>
                    <p className="text-foreground font-bold text-lg">{selectedMethod.label}</p>
                    <p className="text-xl font-mono text-gold tracking-wider my-1">{selectedMethod.accountNumber}</p>
                    <p className="text-sm text-muted-foreground">a.n {selectedMethod.accountName}</p>
                  </div>
                )}
                {selectedMethod?.type === 'qris' && selectedMethod.qrisImageUrl && (
                  <div className="bg-accent/50 border border-border p-5 rounded-xl flex flex-col items-center mt-2">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-4 tracking-wider w-full text-left">Scan QRIS:</p>
                    <div className="bg-white p-3 rounded-xl">
                      <img src={getImageSrc(selectedMethod.qrisImageUrl)} alt={selectedMethod.label} className="w-full max-w-[200px] h-auto object-contain" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Gopay, OVO, Dana, ShopeePay, mBCA, dll.</p>
                  </div>
                )}
                {initialPaymentMethods.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada metode pembayaran.</p>
                )}
              </div>
            </div>

            {/* Step 3: Review */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold font-bold text-sm">3</div>
                <h2 className="text-lg font-bold uppercase tracking-wider">Review Pesanan</h2>
              </div>
              <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gold/10 shrink-0 overflow-hidden">
                      {item.image ? (
                        <img src={getImageSrc(item.image)} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-gold/40" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-2 bg-accent rounded-lg hover:bg-accent/80 min-w-[32px] min-h-[32px] flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-2 bg-accent rounded-lg hover:bg-accent/80 min-w-[32px] min-h-[32px] flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                      <button onClick={() => removeItem(item.id, item.size)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg ml-0.5 min-w-[32px] min-h-[32px] flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <p className="text-sm font-bold text-gold shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gift Wrapping */}
            <div className="space-y-4">
              <div className="bg-card border border-border p-6 rounded-2xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="text-sm font-semibold">🎁 Kirim sebagai hadiah</span>
                  {giftWrap && (
                    <span className="text-xs text-gold font-medium ml-auto">+{formatCurrency(Number(initialSettings.giftWrapPrice) || GIFT_WRAP_PRICE)}</span>
                  )}
                </label>
                {giftWrap && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pesan untuk penerima (opsional)</Label>
                    <textarea
                      value={giftWrapNote}
                      onChange={(e) => setGiftWrapNote(e.target.value.slice(0, 200))}
                      rows={2}
                      maxLength={200}
                      placeholder="Tulis pesan singkat untuk penerima..."
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground text-right">{giftWrapNote.length}/200</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary (sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-card border border-border p-6 rounded-2xl shadow-lg">
                <h2 className="text-lg font-bold mb-5 pb-4 border-b border-border uppercase tracking-wider">Ringkasan Belanja</h2>
                <div className="space-y-3 text-sm mb-4">
                  {items.map(item => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between">
                      <span className="text-muted-foreground truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="shrink-0 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(orderCalc.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ongkir ({shippingZone})</span>
                    <span>{orderCalc.shipping === 0 ? <span className="text-green-500">Gratis</span> : formatCurrency(orderCalc.shipping)}</span>
                  </div>
                  {orderCalc.customization > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biaya Customization</span>
                      <span>{formatCurrency(orderCalc.customization)}</span>
                    </div>
                  )}
                  {orderCalc.promo?.activePromos && orderCalc.promo.activePromos.length > 0 && (
                    <div className="text-xs text-green-500 space-y-1">
                      {orderCalc.promo.activePromos.map((promo, i) => <p key={i}>🎉 {promo}</p>)}
                    </div>
                  )}
                  {orderCalc.transferDiscount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diskon Transfer</span>
                      <span className="text-green-500">-{formatCurrency(orderCalc.transferDiscount)}</span>
                    </div>
                  )}
                  {giftWrapCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">🎁 Gift Wrapping</span>
                      <span>{formatCurrency(giftWrapCost)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gold">{formatCurrency(finalTotal)}</span>
                </div>
                <Button onClick={handleCheckout} disabled={isLoading || isSulawesi} className="w-full hidden lg:flex py-6 text-base font-bold rounded-xl mt-5 bg-accent hover:bg-accent-hover text-white">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Bayar Sekarang'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-border px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-[1100px] mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Pembayaran</span>
            <span className="text-lg font-bold text-gold">{formatCurrency(finalTotal)}</span>
          </div>
          <Button onClick={handleCheckout} disabled={isLoading || isSulawesi} className="flex-1 py-5 text-sm font-bold rounded-xl bg-accent hover:bg-accent-hover text-white">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Bayar Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  )
}
