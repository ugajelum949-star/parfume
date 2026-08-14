'use client'

import Link from 'next/link'
import { useCartStore } from '../store'
import { formatCurrency } from '@/lib/utils'
import { ShoppingBag, X, Trash2, Plus, Minus } from 'lucide-react'
import { useState, useEffect } from 'react'

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    const handler = () => setIsOpen(true)
    window.addEventListener('open-cart', handler)
    return () => window.removeEventListener('open-cart', handler)
  }, [])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-background text-foreground flex flex-col shadow-xl border-l border-border">
              {/* Header */}
              <div className="flex items-center justify-between py-4 px-6 border-b border-border">
                <h2 className="text-lg font-semibold">Keranjang ({totalItems})</h2>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-accent rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Keranjang kosong</p>
                    <Link href="/products" onClick={() => setIsOpen(false)} className="text-sm text-accent hover:text-accent-hover mt-2 inline-block transition-colors">
                      Mulai belanja →
                    </Link>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 py-4 px-6 border-b border-border">
                      <div className="w-16 h-16 rounded-lg bg-secondary shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.size}</p>
                        <p className="text-sm font-bold">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 min-w-[32px] min-h-[32px] flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="p-2 bg-secondary rounded-lg hover:bg-secondary/80 min-w-[32px] min-h-[32px] flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        <button onClick={() => removeItem(item.id, item.size)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg ml-0.5 min-w-[32px] min-h-[32px] flex items-center justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border px-6 py-4">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-bold">{formatCurrency(totalPrice())}</span>
                  </div>
                  <Link href="/cart" onClick={() => setIsOpen(false)} className="block w-full bg-foreground text-background py-3 rounded-lg font-medium text-center transition-colors hover:bg-foreground/90">
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
