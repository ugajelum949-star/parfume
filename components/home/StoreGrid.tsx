'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star, Check, Search, Heart, GitCompareArrows } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { getSizePrice, getFirstSizePrice, getPostWarPrice } from '@/lib/price'
import { useCartStore } from '@/features/cart/store'
import toast from 'react-hot-toast'
import { useWishlistStore } from '@/features/wishlist/store'
import { useCompareStore } from '@/features/compare/store'
import { SCENT_FAMILIES } from '@/lib/config'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  gender: string
  price: number
  image: string | null
  sizes: string
  stock: number
  isBestSeller: boolean
  stockData?: string
  salePrice?: number
  warPrice?: number | null
  launchedAt?: Date | string | null
  tags?: string
  description?: string | null
}

export function StoreGrid({ products }: { products: Product[] }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const wishlistedIds = useWishlistStore((s) => s.ids)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const compareIds = useCompareStore((s) => s.ids)
  const [selectedSizes] = useState<Record<string, string>>({})
  const [addedId, setAddedId] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const sizes = product.sizes.split(',').map((s) => s.trim())
    const size = selectedSizes[product.id] || sizes[0]
    const { final: itemPrice } = getSizePrice(product.stockData, size, product.price)
    addItem({
      id: product.id,
      name: product.name,
      size,
      price: itemPrice,
      image: product.image,
      category: product.category,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1200)
    toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })
  }

  const categories = ['All', ...SCENT_FAMILIES]

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  // Priority sort: name match > brand > category > tags > description
  const q = searchQuery.trim().toLowerCase()
  const sorted = q ? [...filtered].sort((a, b) => {
    const nameA = a.name.toLowerCase().includes(q) ? 0 : 1
    const nameB = b.name.toLowerCase().includes(q) ? 0 : 1
    if (nameA !== nameB) return nameA - nameB
    const brandA = a.brand.toLowerCase().includes(q) ? 0 : 1
    const brandB = b.brand.toLowerCase().includes(q) ? 0 : 1
    if (brandA !== brandB) return brandA - brandB
    const catA = a.category.toLowerCase().includes(q) ? 0 : 1
    const catB = b.category.toLowerCase().includes(q) ? 0 : 1
    if (catA !== catB) return catA - catB
    const tagsA = (a.tags || '').toLowerCase().includes(q) ? 0 : 1
    const tagsB = (b.tags || '').toLowerCase().includes(q) ? 0 : 1
    if (tagsA !== tagsB) return tagsA - tagsB
    return 0
  }) : filtered

  /** Highlight matching text in a string */
  const highlightText = (text: string, query: string) => {
    if (!query) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + query.length)
    const after = text.slice(idx + query.length)
    return <>{before}<mark className="bg-gold/30 text-foreground rounded px-0.5">{match}</mark>{after}</>
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="max-w-md mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari parfum..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 px-4 md:px-0 md:justify-center scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex-shrink-0 ${
              activeCategory === cat
                ? 'bg-accent text-white border-gold'
                : 'bg-card text-muted-foreground border-border hover:border-gold/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {sorted.map((product) => {
          return (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="bg-card border-border overflow-hidden group hover:border-gold/30 transition-colors h-full">
                {/* Image */}
                <div className={`relative aspect-[4/5] bg-gold/5 overflow-hidden ${product.stock <= 0 ? 'opacity-60' : ''}`}>
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                  {product.isBestSeller && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span className="hidden sm:inline">Best Seller</span>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id) }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors z-10"
                    aria-label={wishlistedIds.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${wishlistedIds.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(product.id) }}
                    className={`absolute bottom-2 left-2 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors z-10 ${
                      compareIds.includes(product.id)
                        ? 'bg-gold/90 border border-gold'
                        : 'bg-black/30 border border-transparent hover:bg-black/50'
                    }`}
                    aria-label={compareIds.includes(product.id) ? 'Remove from compare' : 'Add to compare'}
                  >
                    <GitCompareArrows className={`w-4 h-4 ${compareIds.includes(product.id) ? 'text-navy' : 'text-white'}`} />
                  </button>
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-red-600 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full">HABIS</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-12 right-2 bg-amber-500 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full">
                      Sisa {product.stock}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 md:p-4 pb-5 md:pb-6 space-y-2">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider truncate">{product.brand}</p>
                    <h3 className="font-semibold text-xs md:text-sm mt-0.5 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">{highlightText(product.name, q)}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-full">{product.category}</span>
                      <span className="text-[9px] bg-accent text-muted-foreground px-1.5 py-0.5 rounded-full">{product.gender}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        // Check post-war premium price first
                        const postWar = getPostWarPrice(product.warPrice, product.launchedAt)
                        if (postWar) {
                          return <span className="text-red-500 font-bold text-sm md:text-base">{formatCurrency(postWar)}</span>
                        }
                        const p = getFirstSizePrice(product.stockData, product.sizes, product.price)
                        if (p.hasDiscount) return (
                          <>
                            <span className="text-[10px] text-muted-foreground line-through">{formatCurrency(p.original)}</span>
                            <span className="text-gold font-bold text-sm md:text-base">{formatCurrency(p.sale)}</span>
                          </>
                        )
                        return <span className="text-gold font-bold text-sm md:text-base">{formatCurrency(p.original)}</span>
                      })()}
                    </div>
                    <Button
                      onClick={(e) => handleAdd(e, product)}
                      disabled={product.stock <= 0}
                      className={`shrink-0 font-bold h-8 md:h-9 px-2.5 md:px-3 ${
                        product.stock <= 0
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : addedId === product.id
                            ? 'bg-green-600 hover:bg-green-600 text-white'
                            : 'bg-accent hover:bg-accent-hover text-white'
                      }`}
                      size="sm"
                    >
                      {addedId === product.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <ShoppingCart className="w-3.5 h-3.5 md:mr-1.5" />
                      )}
                      <span className="hidden">{addedId === product.id ? 'Added' : 'Add'}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>Belum ada produk.</p>
        </div>
      )}
    </div>
  )
}
