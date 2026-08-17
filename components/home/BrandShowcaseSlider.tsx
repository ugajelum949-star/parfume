'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/shared/ProductCard'

type Product = {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
  stockData?: string
  sizes?: string
}

type BrandWithProducts = {
  brand: string
  products: Product[]
}

interface BrandShowcaseSliderProps {
  brands: BrandWithProducts[]
}

export function BrandShowcaseSlider({ brands }: BrandShowcaseSliderProps) {
  if (brands.length === 0) return null

  return (
    <section className="py-10 md:py-14 max-w-6xl mx-auto px-4 md:px-6 space-y-12">
      {brands.map((b) => (
        <BrandRow key={b.brand} brand={b.brand} products={b.products} />
      ))}
    </section>
  )
}

function BrandRow({ brand, products }: BrandWithProducts) {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = 320
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            {brand}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products?search=${encodeURIComponent(brand)}`}
            className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-0.5"
          >
            Lihat Semua {brand} ({products.length}) →
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-border bg-card/50 hover:bg-card flex items-center justify-center text-foreground transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-border bg-card/50 hover:bg-card flex items-center justify-center text-foreground transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mb-6" />

      <div
        ref={sliderRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`.brand-slider::-webkit-scrollbar { display: none; }`}</style>
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}
