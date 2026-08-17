import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/shared/ProductCard'

type Product = { id: string; name: string; brand: string; price: number; image: string | null; gender: string; stock?: number; stockData?: string; sizes?: string }

interface GenderSplitProps {
  products: Product[]
  heroForHim?: string | null
  heroForHer?: string | null
  heroForEveryone?: string | null
  curatedMen?: Product[]
  curatedWomen?: Product[]
  curatedUnisex?: Product[]
}

export function GenderSplit({ products, heroForHim, heroForHer, heroForEveryone, curatedMen, curatedWomen, curatedUnisex }: GenderSplitProps) {
  const menProducts = curatedMen?.length ? curatedMen.slice(0, 4) : products.filter(p => p.gender === 'Men').slice(0, 4)
  const womenProducts = curatedWomen?.length ? curatedWomen.slice(0, 4) : products.filter(p => p.gender === 'Women').slice(0, 4)
  const unisexProducts = curatedUnisex?.length ? curatedUnisex.slice(0, 4) : products.filter(p => p.gender === 'Unisex').slice(0, 4)

  return (
    <section className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6 space-y-8">
      {/* For Him */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
        <Link href="/products?gender=Men" className="group relative aspect-[4/3] md:aspect-auto md:h-full rounded-xl overflow-hidden">
          {heroForHim ? (
            <Image src={heroForHim} alt="Parfum untuk pria — For Him" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h3 className="font-serif text-3xl text-white mb-1">For Him</h3>
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Explore Men&apos;s Fragrances →</span>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          {menProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* For Her */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
        <Link href="/products?gender=Women" className="group relative aspect-[4/3] md:aspect-auto md:h-full rounded-xl overflow-hidden">
          {heroForHer ? (
            <Image src={heroForHer} alt="Parfum untuk wanita — For Her" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-900 to-pink-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h3 className="font-serif text-3xl text-white mb-1">For Her</h3>
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Explore Women&apos;s Fragrances →</span>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          {womenProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* For Everyone (Unisex) */}
      {(unisexProducts.length > 0 || heroForEveryone) && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
          <Link href="/products?gender=Unisex" className="group relative aspect-[4/3] md:aspect-auto md:h-full rounded-xl overflow-hidden">
            {heroForEveryone ? (
              <Image src={heroForEveryone} alt="Parfum unisex — For Everyone" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover group-hover:scale-[1.02] transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-amber-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="font-serif text-3xl text-white mb-1">For Everyone</h3>
              <span className="text-sm text-white/70 group-hover:text-white transition-colors">Explore Unisex Fragrances →</span>
            </div>
          </Link>
          <div className="grid grid-cols-2 gap-4">
            {unisexProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </section>
  )
}
