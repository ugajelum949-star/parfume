'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, Check, Star, X, ZoomIn, ChevronLeft, ChevronRight, Plus, Minus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { getPostWarPrice } from '@/lib/price'
import { useCartStore } from '@/features/cart/store'
import toast from 'react-hot-toast'
import { useWishlistStore } from '@/features/wishlist/store'

type Product = {
  id: string
  name: string
  category: string
  brand: string
  price: number
  description: string | null
  image: string | null
  sizes: string
  stock: number
  isBestSeller: boolean
  sizePrices?: Record<string, number>
  sizeSalePrices?: Record<string, number>
  allImages?: string[]
  warPrice?: number | null
  launchedAt?: Date | string | null
}

export function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  const wishlistedIds = useWishlistStore((s) => s.ids)
  const isWishlisted = wishlistedIds.includes(product.id)
  const sizes = product.sizes.split(',').map((s) => s.trim())
  const images = product.allImages?.length ? product.allImages : (product.image ? [product.image] : [])
  const [selectedSize, setSelectedSize] = useState(sizes[0])
  const [added, setAdded] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  // Post-war premium price check
  const postWarPrice = getPostWarPrice(product.warPrice, product.launchedAt)
  const isPostWar = !!postWarPrice

  const currentPrice = postWarPrice || (Number(product.sizePrices?.[selectedSize]) || product.price)
  const currentSalePrice = isPostWar ? 0 : (Number(product.sizeSalePrices?.[selectedSize]) || 0)
  const hasDiscount = !isPostWar && currentSalePrice > 0 && currentSalePrice < currentPrice
  const displayPrice = hasDiscount ? currentSalePrice : currentPrice

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        size: selectedSize,
        price: displayPrice,
        image: product.image,
        category: product.category,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
    toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })
  }

  const prevImage = () => setCurrentImage(i => i === 0 ? images.length - 1 : i - 1)
  const nextImage = () => setCurrentImage(i => i === images.length - 1 ? 0 : i + 1)

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
← Kembali
        </Link>
        <button
          onClick={() => toggleWishlist(product.id)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-accent text-accent' : ''}`} />
          <span>{isWishlisted ? 'Hapus' : '♡'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
        {/* Image Carousel */}
        <div className="relative">
          <div className="relative aspect-square bg-gold/5 rounded-2xl overflow-hidden cursor-zoom-in group" onClick={() => setZoomed(true)}>
            {images.length > 0 ? (
              <Image
                src={images[currentImage]}
                alt={`${product.brand} ${product.name} — ${product.category} perfume`}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4 text-white" />
            </div>
            {product.isBestSeller && (
              <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Best Seller
              </div>
            )}
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-red-600 text-white text-sm md:text-base font-bold px-4 py-2 rounded-full">STOK HABIS</span>
              </div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                Sisa {product.stock}
              </div>
            )}
          </div>

          {/* Carousel arrows */}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-gold' : 'bg-muted'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Zoom overlay */}
        {zoomed && images[currentImage] && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center cursor-zoom-out" onClick={() => setZoomed(false)}>
            <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10" onClick={() => setZoomed(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
            {images.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prevImage() }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); nextImage() }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <img src={images[currentImage]} alt={`${product.brand} ${product.name} — zoom`} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
          </div>
        )}

        {/* Info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {isPostWar ? (
              <>
                <span className="text-gold text-2xl md:text-3xl font-bold">{formatCurrency(displayPrice)}</span>
                <span className="text-xs text-red-500 font-medium">Post-War Price</span>
              </>
            ) : hasDiscount ? (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatCurrency(currentPrice)}</span>
                <span className="text-gold text-2xl md:text-3xl font-bold">{formatCurrency(currentSalePrice)}</span>
                <span className="text-xs text-green-500 font-medium">Hemat {formatCurrency(currentPrice - currentSalePrice)}</span>
              </>
            ) : (
              <span className="text-gold text-2xl md:text-3xl font-bold">{formatCurrency(currentPrice)}</span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedSize === size
                        ? 'bg-accent text-white border-gold'
                        : 'bg-card text-muted-foreground border-border hover:border-gold/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity — hidden when out of stock */}
          {product.stock > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg">{String(quantity).padStart(2, '0')}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Stock */}
          <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} tersedia` : 'Stok Habis'}
          </p>

          {/* Add to cart */}
          <Button
            onClick={handleAdd}
            disabled={product.stock <= 0}
            className={`w-full h-12 text-base font-bold ${
              added
                ? 'bg-green-600 hover:bg-green-600 text-white'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {added ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Ditambahkan ✓
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Keranjang — {formatCurrency(displayPrice * quantity)}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
