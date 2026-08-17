import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { getFirstSizePrice } from '@/lib/price'
import { getImageSrc } from '@/lib/image-proxy'

type ProductCardProps = {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
  stockData?: string
  sizes?: string
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  const isSoldOut = (product.stock ?? 0) <= 0
  const displayPrice = getFirstSizePrice(product.stockData, product.sizes || '', product.price)

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-secondary mb-3">
        {product.image ? (
          <Image
            src={getImageSrc(product.image)}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}

        {/* Watermark Overlay */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none select-none overflow-hidden opacity-[0.06]"
          aria-hidden="true"
        >
          <div
            className="absolute inset-[-50%] w-[200%] h-[200%] flex flex-wrap items-center justify-center gap-4 rotate-[-25deg]"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '3px',
              lineHeight: '2.5',
              color: 'white',
              wordSpacing: '20px',
            }}
          >
            {'BEST PARFUME STORE '.repeat(200)}
          </div>
        </div>

        {isSoldOut && (
          <div className="absolute top-2 left-2 z-10 bg-muted-foreground/80 text-background text-[10px] font-medium px-2 py-0.5 rounded">
            Sold out
          </div>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {product.brand}
      </p>
      <p className="text-sm font-semibold line-clamp-1 mb-1">
        {product.name}
      </p>
      <div className="flex items-center gap-2">
        {displayPrice.hasDiscount && (
          <span className="text-xs text-muted-foreground line-through">{formatCurrency(displayPrice.original)}</span>
        )}
        <p className="text-sm font-bold">
          {formatCurrency(displayPrice.final)}
        </p>
      </div>
    </Link>
  )
}
