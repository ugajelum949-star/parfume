import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { getFirstSizePrice } from '@/lib/price'

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
            src={product.image}
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
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-muted-foreground/80 text-background text-[10px] font-medium px-2 py-0.5 rounded">
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
