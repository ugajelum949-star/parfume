'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, Check, Copy, MessageCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface InvoiceClientProps {
  orderId: string
  orderStatus?: string
  customerPhone?: string | null
  confirmButtonType?: string
  storeTelegramUsername?: string
  giftWrap?: boolean | null
  giftWrapNote?: string | null
}

export default function InvoiceClient({
  orderId,
  orderStatus,
  customerPhone,
  confirmButtonType = 'both',
  storeTelegramUsername,
  giftWrap,
  giftWrapNote,
}: InvoiceClientProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return toast.error('Pilih file terlebih dahulu')

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) return toast.error('Format file tidak didukung')
    if (file.size > 20 * 1024 * 1024) return toast.error('Ukuran maksimal 20MB')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('orderId', orderId)
      const res = await fetch('/api/order/proof', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUploaded(true)
      toast.success('Bukti pembayaran berhasil dikirim!')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal upload bukti'
      toast.error(msg)
    } finally {
      setUploading(false)
    }
  }

  function copyOrderId() {
    navigator.clipboard.writeText(orderId)
    toast.success('Order ID disalin')
  }

  const phone = customerPhone?.replace(/\D/g, '') || ''
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(`Konfirmasi pembayaran order ${orderId}`)}`
  const tgLink = storeTelegramUsername ? `https://t.me/${storeTelegramUsername.replace(/^@/, '')}` : ''

  return (
    <div className="space-y-4">
      {/* Upload proof */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Upload Bukti Pembayaran</p>
          {uploaded ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Check className="h-4 w-4" /> Bukti pembayaran berhasil dikirim
            </div>
          ) : (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleUpload}
              />
              <Button
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Mengirim...' : 'Pilih & Upload Bukti'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order ID */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Order ID</p>
          <div className="flex items-center gap-2">
            <code className="text-sm font-mono text-foreground break-all">{orderId}</code>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={copyOrderId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gift Wrapping */}
      {giftWrap && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <p className="text-sm font-semibold text-foreground">Gift Wrapping</p>
            </div>
            {giftWrapNote && (
              <p className="text-xs text-muted-foreground italic ml-7">&quot;{giftWrapNote}&quot;</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation buttons */}
      {confirmButtonType === 'whatsapp' ? (
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Konfirmasi via WhatsApp
          </Button>
        </a>
      ) : confirmButtonType === 'telegram' ? (
        <a href={tgLink} target="_blank" rel="noopener noreferrer" className="block">
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
            <Send className="h-4 w-4 mr-2" />
            Konfirmasi via Telegram
          </Button>
        </a>
      ) : (
        <div className="space-y-3">
          <a href={waLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              <MessageCircle className="h-4 w-4 mr-2" />
              Konfirmasi via WhatsApp
            </Button>
          </a>
          {tgLink && (
            <a href={tgLink} target="_blank" rel="noopener noreferrer" className="block">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <Send className="h-4 w-4 mr-2" />
                Konfirmasi via Telegram
              </Button>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
