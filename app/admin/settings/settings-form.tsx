'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettingsFromForm } from '@/app/actions/settings'
import { uploadImage } from '@/app/actions/upload'
import { compressImage } from '@/lib/compression'
import { Loader2, Upload, Store, CreditCard, MessageCircle, Bot, Truck, Gift, Image as ImageIcon } from 'lucide-react'
import { getImageSrc } from '@/lib/image-proxy'
import toast from 'react-hot-toast'
import Link from 'next/link'

const sectionClass = "bg-card border-border"
const titleClass = "text-lg font-semibold flex items-center gap-2"
const inputClass = "bg-input border-border focus:border-gold focus:ring-gold/20"

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const [floatingEnabled, setFloatingEnabled] = useState(initial.floatingButtonEnabled === 'true')

  const homepageImageKeys = ['heroImage', 'heroForHim', 'heroForHer', 'heroUnisex', 'scentFresh', 'scentFloral', 'scentWoody', 'scentAmber'] as const
  const [imageUrls, setImageUrls] = useState<Record<string, string>>(
    Object.fromEntries([
      ['_logo', initial.store_logo || ''],
      ...homepageImageKeys.map(k => [k, initial[k] || '']),
    ])
  )
  const [imageUploading, setImageUploading] = useState<Record<string, boolean>>({})

  async function handleUpload(key: string, folder: string, e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return
    setImageUploading(prev => ({ ...prev, [key]: true }))
    try {
      const base64 = await compressImage(rawFile, 0.85, 1920)
      const result = await uploadImage(base64, folder)
      if (result.success && result.url) {
        setImageUrls(prev => ({ ...prev, [key]: result.url! }))
        toast.success('Foto berhasil diunggah')
      } else {
        toast.error(result.error || 'Gagal mengunggah foto')
      }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Gagal memproses gambar: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setImageUploading(prev => ({ ...prev, [key]: false }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!confirm('Simpan semua perubahan settings?')) return
    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('floatingButtonEnabled', floatingEnabled ? 'true' : 'false')
    fd.set('store_logo', imageUrls['_logo'] || '')
    for (const key of homepageImageKeys) {
      fd.set(key, imageUrls[key] || '')
    }

    const res = await updateSettingsFromForm(fd)
    if (res.success) {
      toast.success('Settings saved')
      window.location.reload()
    } else {
      toast.error(res.error || 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your store, payments, and messaging.</p>
      </div>

      {/* Store Info */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Store className="w-4 h-4 text-gold" />
            </div>
            Store Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Store Name</Label>
            <Input name="store_name" defaultValue={initial.store_name || ''} placeholder="My Store" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Slogan</Label>
            <Input name="store_slogan" defaultValue={initial.store_slogan || ''} placeholder="Your tagline" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Logo</Label>
            <div className="flex items-center gap-4">
              {imageUrls['_logo'] ? (
                <div className="w-16 h-16 rounded-xl bg-accent border border-border flex items-center justify-center overflow-hidden shrink-0">
                  <img src={imageUrls['_logo']} alt="Logo" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-accent border border-border flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg border border-border text-sm transition-colors">
                    {imageUploading['_logo'] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {imageUrls['_logo'] ? 'Change Logo' : 'Upload Logo'}
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload('_logo', 'logos', e)} disabled={imageUploading['_logo']} />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG. Max 5MB.</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Support Email</Label>
            <Input name="support_email" type="email" defaultValue={initial.support_email || ''} placeholder="support@example.com" className={inputClass} />
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods — redirect */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gold" />
            </div>
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Manage QRIS, bank transfer, and other payment methods.</p>
          <Link href="/admin/payment-methods" className="inline-flex items-center gap-2 bg-gold/10 hover:bg-gold/20 text-gold px-4 py-2 rounded-lg text-sm font-medium border border-gold/20 transition-colors">
            Go to Payment Methods →
          </Link>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gold" />
            </div>
            Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp (Order)</Label>
            <Input id="whatsapp" name="whatsapp" defaultValue={initial.whatsapp || ''} placeholder="08123456789" className={inputClass} />
            <p className="text-xs text-muted-foreground">Number only. Leading 0 auto-converted to 62.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsappConfirm" className="text-sm font-medium">WhatsApp (Confirmation)</Label>
            <Input id="whatsappConfirm" name="whatsappConfirm" defaultValue={initial.whatsappConfirm || ''} placeholder="08123456789" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegramUsername" className="text-sm font-medium">Telegram Username</Label>
            <Input id="telegramUsername" name="telegramUsername" defaultValue={initial.telegramUsername || ''} placeholder="@username" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="giftWrapPrice" className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold" />
              Harga Gift Wrapping (Rp)
            </Label>
            <Input id="giftWrapPrice" name="giftWrapPrice" type="number" defaultValue={initial.giftWrapPrice || '15000'} className={inputClass} />
            <p className="text-xs text-muted-foreground">Biaya tambahan untuk gift wrapping. Default: Rp 15.000.</p>
          </div>
          <div>
            <Label htmlFor="warMaxOrdersPerIp" className="text-sm font-medium">
              Batas Order War per IP (24 jam)
            </Label>
            <Input id="warMaxOrdersPerIp" name="war_max_orders_per_ip" type="number" min="1" defaultValue={initial.war_max_orders_per_ip || '2'} className={inputClass} />
            <p className="text-xs text-muted-foreground">Maksimal pesanan war per IP dalam 24 jam. Default: 2. Nonaktifkan dengan 0.</p>
          </div>
        </CardContent>
      </Card>

      {/* Floating Chat Button */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-gold" />
            </div>
            Floating Chat Button
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFloatingEnabled(!floatingEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${floatingEnabled ? 'bg-gold' : 'bg-accent'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${floatingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <Label className="text-sm font-medium">Enable Floating Button</Label>
          </div>
          {floatingEnabled && (
            <div className="space-y-2">
              <Label htmlFor="floatingButtonType" className="text-sm font-medium">Provider</Label>
              <select
                id="floatingButtonType"
                name="floatingButtonType"
                defaultValue={initial.floatingButtonType || 'whatsapp'}
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:ring-gold/20"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Buttons */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-gold" />
            </div>
            Confirmation Buttons
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmButtonType" className="text-sm font-medium">Show Confirmation Via</Label>
            <select
              id="confirmButtonType"
              name="confirmButtonType"
              defaultValue={initial.confirmButtonType || 'both'}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:border-gold focus:ring-gold/20"
            >
              <option value="both">Both (WhatsApp + Telegram)</option>
              <option value="telegram">Telegram Only</option>
              <option value="whatsapp">WhatsApp Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Telegram Bot */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gold" />
            </div>
            Telegram Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="telegramBotToken" className="text-sm font-medium">Bot Token</Label>
            <Input id="telegramBotToken" name="telegramBotToken" type="password" defaultValue={initial.telegramBotToken || ''} placeholder="123456:ABC-DEF..." className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegramChatId" className="text-sm font-medium">Chat ID</Label>
            <Input id="telegramChatId" name="telegramChatId" defaultValue={initial.telegramChatId || ''} placeholder="-1001234567890" className={inputClass} />
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Promos */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-gold" />
            </div>
            Shipping & Promos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Free Shipping Threshold (IDR)</Label>
              <Input name="shipping_free_threshold" type="number" defaultValue={initial.shipping_free_threshold || '300000'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Customization Fee per Item (IDR)</Label>
              <Input name="shipping_customization_fee" type="number" defaultValue={initial.shipping_customization_fee || '25000'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transfer Discount (IDR)</Label>
              <Input name="shipping_transfer_discount" type="number" defaultValue={initial.shipping_transfer_discount || '50000'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Instant Shipping Price (IDR)</Label>
              <Input name="shipping_instant_price" type="number" defaultValue={initial.shipping_instant_price || '45000'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Next Day Surcharge (IDR)</Label>
              <Input name="shipping_nextday_surcharge" type="number" defaultValue={initial.shipping_nextday_surcharge || '20000'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bundle Promo Min Qty</Label>
              <Input name="promo_qty_bundle" type="number" defaultValue={initial.promo_qty_bundle || '3'} className={inputClass} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Mega Promo Min Qty</Label>
              <Input name="promo_qty_mega" type="number" defaultValue={initial.promo_qty_mega || '5'} className={inputClass} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homepage Images */}
      <Card className={sectionClass}>
        <CardHeader>
          <CardTitle className={titleClass}>
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-gold" />
            </div>
            Homepage Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hero Banner */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hero Banner</p>
            {[
              { key: 'heroImage', label: 'Hero Banner', folder: 'homepage' },
            ].map(({ key, label, folder }) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <div className="flex items-center gap-4">
                  {imageUrls[key] ? (
                    <div className="w-24 h-16 rounded-lg bg-accent border border-border flex items-center justify-center overflow-hidden shrink-0">
                      <img src={getImageSrc(imageUrls[key])} alt={label} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded-lg bg-accent border border-border flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg border border-border text-sm transition-colors">
                        {imageUploading[key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {imageUrls[key] ? 'Change' : 'Upload'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(key, folder, e)} disabled={imageUploading[key]} />
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border" />

          {/* Gender Sections */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gender Sections</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: 'heroForHim', label: 'For Him', folder: 'homepage' },
                { key: 'heroForHer', label: 'For Her', folder: 'homepage' },
                { key: 'heroUnisex', label: 'For Everyone', folder: 'homepage' },
              ].map(({ key, label, folder }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="flex items-center gap-3">
                    {imageUrls[key] ? (
                      <div className="w-16 h-16 rounded-lg bg-accent border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <img src={getImageSrc(imageUrls[key])} alt={label} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-accent border border-border flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <Label className="cursor-pointer">
                      <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                        {imageUploading[key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {imageUrls[key] ? 'Change' : 'Upload'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(key, folder, e)} disabled={imageUploading[key]} />
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Scent Family Images */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Scent Family Images</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'scentFresh', label: 'Fresh', folder: 'homepage' },
                { key: 'scentFloral', label: 'Floral', folder: 'homepage' },
                { key: 'scentWoody', label: 'Woody', folder: 'homepage' },
                { key: 'scentAmber', label: 'Amber', folder: 'homepage' },
              ].map(({ key, label, folder }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <div className="flex items-center gap-3">
                    {imageUrls[key] ? (
                      <div className="w-16 h-16 rounded-lg bg-accent border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <img src={getImageSrc(imageUrls[key])} alt={label} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-accent border border-border flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Label className="cursor-pointer">
                        <span className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 px-3 py-2 rounded-lg border border-border text-sm transition-colors">
                          {imageUploading[key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {imageUrls[key] ? 'Change' : 'Upload'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(key, folder, e)} disabled={imageUploading[key]} />
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-accent hover:bg-accent-hover text-white font-bold">
        Save Settings
      </Button>
    </form>
  )
}
