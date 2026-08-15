'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProductCard } from '@/components/shared/ProductCard'
type Product = {
  id: string; name: string; brand: string; price: number
  image: string | null; isBestSeller: boolean; stock?: number
  stockData?: string; sizes?: string
}

export function PopularSection({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<'popular' | 'sale'>('popular')

  const displayProducts = tab === 'popular'
    ? products.filter(p => p.isBestSeller).slice(0, 8)
    : products.filter(p => {
        try {
          const data = JSON.parse(p.stockData || '{}')
          return data.salePrices && Object.keys(data.salePrices).length > 0
        } catch { return false }
      }).slice(0, 8)

  return (
    <section id="products" className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setTab('popular')}
            className={`text-lg md:text-3xl font-semibold transition-colors ${
              tab === 'popular' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setTab('sale')}
            className={`text-lg md:text-3xl font-semibold transition-colors ${
              tab === 'sale' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Sale
          </button>
        </div>
        <Link
          href="/products"
          className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-0.5"
        >
          Shop All Products
        </Link>
      </div>

      <div className="h-px bg-border mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {displayProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Belum ada produk</p>
      )}
    </section>
  )
}
