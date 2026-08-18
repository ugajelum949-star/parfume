'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Swords, Clock, ShoppingCart, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCartStore } from '@/features/cart/store'
import { getImageSrc } from '@/lib/image-proxy'
import toast from 'react-hot-toast'

export interface WarItem {
  id: string
  name: string
  brand: string
  price: number
  stock: number
  image: string | null
  sizes: string
}

export interface War {
  id: string
  name: string
  description: string | null
  image: string | null
  startTime: string | Date
  endTime: string | Date
  items: WarItem[]
}

function Countdown({ endTime }: { endTime: string | Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const end = new Date(endTime).getTime()
    const tick = () => {
      const now = Date.now()
      const diff = Math.max(0, end - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      {timeLeft.days > 0 && <span className="bg-red-600 text-white px-2 py-1 rounded font-bold">{timeLeft.days}d</span>}
      <span className="bg-card border border-border px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
      <span className="text-gold font-bold">:</span>
      <span className="bg-card border border-border px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
      <span className="text-gold font-bold">:</span>
      <span className="bg-card border border-border px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
    </div>
  )
}

export function WarSection({ war, mode = 'live' }: { war: War; mode?: 'live' | 'coming-soon' }) {
  const addItem = useCartStore(s => s.addItem)
  const [addedId, setAddedId] = useState<string | null>(null)

  const handleAdd = (item: WarItem) => {
    const sizes = item.sizes.split(',').map(s => s.trim())
    addItem({
      id: item.id,
      name: item.name,
      size: sizes[0],
      price: item.price,
      image: item.image,
      category: 'war',
      source: 'war',
      warItemId: item.id,
    })
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1200)
    toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })
  }

  return (
    <section className="py-10 md:py-16 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        {/* War header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
              <Swords className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-500">{war.name}</h2>
              {war.description && <p className="text-muted-foreground text-sm">{war.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {mode === 'coming-soon' ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Dimulai dalam</span>
                <Countdown endTime={war.startTime} />
              </div>
            ) : (
              <Countdown endTime={war.endTime} />
            )}
          </div>
        </div>

        {/* War banner */}
        {war.image && (
          <div className="relative w-full h-40 md:h-64 rounded-2xl overflow-hidden mb-8">
            <Image src={getImageSrc(war.image)} alt={war.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        {/* War products — hidden for coming-soon */}
        {mode === 'coming-soon' ? (
          <div className="text-center py-12 bg-accent/20 rounded-2xl border border-dashed border-border">
            <Swords className="w-12 h-12 text-red-500/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Produk akan diungkap saat war dimulai</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{war.items?.length || 0} produk siap launch</p>
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {war.items.map(item => (
            <Card key={item.id} className="bg-card border-border overflow-hidden group hover:border-red-500/30 transition-colors">
              <div className="relative aspect-[3/4] bg-gold/5 overflow-hidden">
                {item.image ? (
                  <Image src={getImageSrc(item.image)} alt={item.name} fill loading="lazy" sizes="240px" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">WAR</div>
                {item.stock <= 5 && item.stock > 0 && (
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Sisa {item.stock}</div>
                )}
                {item.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">HABIS</span>
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 space-y-2">
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider truncate">{item.brand}</p>
                <h3 className="font-semibold text-xs md:text-sm line-clamp-1">{item.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-red-500 font-bold text-sm md:text-base">{formatCurrency(item.price)}</p>
                  <Button
                    onClick={() => handleAdd(item)}
                    disabled={item.stock <= 0}
                    className={`shrink-0 font-bold h-8 md:h-9 px-2.5 md:px-3 ${
                      item.stock <= 0
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : addedId === item.id
                          ? 'bg-green-600 hover:bg-green-600 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    size="sm"
                  >
                    {addedId === item.id ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}
