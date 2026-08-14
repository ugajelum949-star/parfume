'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, Check, Heart, GitCompareArrows } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { getSizePrice, getFirstSizePrice, getPostWarPrice } from '@/lib/price'
import { useCartStore } from '@/features/cart/store'
import { useWishlistStore } from '@/features/wishlist/store'
import { useCompareStore } from '@/features/compare/store'
import { getProducts } from '@/app/actions/products'
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
  stockData?: string
  isBestSeller: boolean
  warPrice?: number | null
  launchedAt?: Date | string | null
  tags?: string
  description?: string | null
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'All'
  const initialGender = searchParams.get('gender') || 'All'
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const wishlistedIds = useWishlistStore((s) => s.ids)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const compareIds = useCompareStore((s) => s.ids)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [activeBrand, setActiveBrand] = useState<string>('All')

  useEffect(() => {
    getProducts().then((data) => { setProducts(data as Product[]); setLoading(false) })
  }, [])

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const sizes = product.sizes.split(',').map((s) => s.trim())
    const firstSize = sizes[0]
    const { final: finalPrice } = getSizePrice(product.stockData, firstSize, product.price)
    addItem({
      id: product.id,
      name: product.name,
      size: firstSize,
      price: finalPrice,
      image: product.image,
      category: product.category,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1200)
    toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })
  }

  const categories = ['All', ...SCENT_FAMILIES]
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand).filter(Boolean)))].sort()

  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    const matchesBrand = activeBrand === 'All' || p.brand === activeBrand
    const matchesGender = initialGender === 'All' || p.gender === initialGender
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags && p.tags.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    return matchesCategory && matchesBrand && matchesSearch && matchesGender
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'bestseller') return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
    return 0 // newest = default order from DB
  })

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
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

        {/* Categories */}
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

        {/* Brand filter + Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <select value={activeBrand} onChange={e => setActiveBrand(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
            {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'Semua Merek' : b}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
            <option value="newest">Terbaru</option>
            <option value="price-low">Harga Terendah</option>
            <option value="price-high">Harga Tertinggi</option>
            <option value="name">Nama A-Z</option>
            <option value="bestseller">Terlaris</option>
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} produk</span>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <div className="p-3 md:p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {filtered.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="bg-card border-border overflow-hidden group hover:border-gold/30 transition-colors h-full cursor-pointer">
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
                    <div className="absolute top-2 left-2 bg-accent text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full">
                      ★ Best Seller
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
                <div className="p-3 md:p-4 pb-5 md:pb-6 space-y-2">
                  <div>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider truncate">{product.brand}</p>
                    <h3 className="font-semibold text-xs md:text-sm mt-0.5 line-clamp-2 min-h-[2rem]">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const postWar = getPostWarPrice(product.warPrice, product.launchedAt)
                        if (postWar) return <span className="text-red-500 font-bold text-sm md:text-base">{formatCurrency(postWar)}</span>
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
          ))}
        </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>Belum ada produk.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
