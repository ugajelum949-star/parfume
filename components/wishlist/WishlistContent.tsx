'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, Check, Heart } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'
import { getFirstSizePrice, getPostWarPrice } from '@/lib/price'
import { useCartStore } from '@/features/cart/store'
import { useWishlistStore } from '@/features/wishlist/store'
import { getPublicProducts } from '@/app/actions/products'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  price: number
  image: string | null
  sizes: string
  stock: number
  stockData?: string
  isBestSeller: boolean
  warPrice?: number | null
  launchedAt?: Date | string | null
}

export function WishlistContent() {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const wishlistIds = useWishlistStore((s) => s.ids)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  useEffect(() => {
    getPublicProducts().then((data) => {
      setProducts(data as Product[])
      setLoading(false)
    })
  }, [])

  const wishlistProducts = products.filter((p) => {
    if (!wishlistIds.includes(p.id)) return false
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const categories = ['All', ...Array.from(new Set(products.filter(p => wishlistIds.includes(p.id)).map(p => p.category)))].sort()

  const handleAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const sizes = product.sizes.split(',').map((s) => s.trim())
    const firstSize = sizes[0]
    const { final: finalPrice } = getFirstSizePrice(product.stockData, firstSize, product.price)
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <div className="container mx-auto px-4 py-6 md:py-10 space-y-6">
        <h1 className="text-xl md:text-2xl font-bold">Produk Favorit ❤️</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-card border-border overflow-hidden">
                <div className="aspect-[3/4] bg-gold/5 animate-pulse" />
                <div className="p-3 md:p-4 space-y-2">
                  <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                </div>
              </Card>
            ))}
          </div>
        ) : wishlistIds.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-4">Belum ada produk favorit ❤️</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-full hover:bg-gold-light transition-colors"
            >
              <Search className="w-4 h-4" />
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <>
            {/* Search & Filters */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari di favorit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {categories.length > 1 && (
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
            )}

            <span className="text-xs text-muted-foreground">{wishlistProducts.length} produk</span>

            {/* Products grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {wishlistProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="bg-card border-border overflow-hidden group hover:border-gold/30 transition-colors h-full cursor-pointer">
                    <div className={`relative aspect-[3/4] bg-gold/5 overflow-hidden ${product.stock <= 0 ? 'opacity-60' : ''}`}>
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
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
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
                    <div className="p-3 md:p-4 space-y-2">
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
                          <span className="hidden md:inline ml-1">{addedId === product.id ? 'Added' : 'Add'}</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {wishlistProducts.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p>No products match your filter.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
