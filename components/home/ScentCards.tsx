import Link from 'next/link'
import Image from 'next/image'

type ScentImages = { fresh?: string | null; floral?: string | null; woody?: string | null; amber?: string | null }

const scentFamilies = [
  { key: 'fresh' as const, name: 'Fresh', description: 'Bersih & menyegarkan', color: 'from-blue-500/20 to-cyan-500/20', emoji: '🍊' },
  { key: 'floral' as const, name: 'Floral', description: 'Elegan & feminin', color: 'from-pink-500/20 to-rose-500/20', emoji: '🌸' },
  { key: 'woody' as const, name: 'Woody', description: 'Hangat & maskulin', color: 'from-amber-700/20 to-yellow-700/20', emoji: '🪵' },
  { key: 'amber' as const, name: 'Amber', description: 'Kaya & sensual', color: 'from-orange-600/20 to-red-600/20', emoji: '🔥' },
]

export function ScentCards({ images }: { images?: ScentImages }) {
  return (
    <section className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl mb-2">Explore Our Collection</h2>
        <p className="text-muted-foreground">
          Temukan aroma yang mencerminkan <span className="text-foreground font-medium">kamu</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-hidden">
        {scentFamilies.map(family => (
          <Link
            key={family.name}
            href={`/products?category=${family.name}`}
            className="group"
          >
            <div className={`relative aspect-[4/3] rounded-xl bg-gradient-to-br ${family.color} overflow-hidden mb-3 group-hover:scale-[1.02] transition-transform`}>
              {images?.[family.key] ? (
                <Image src={images[family.key]!} alt={family.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">{family.emoji}</div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{family.name}</p>
                <p className="text-xs text-muted-foreground">{family.description}</p>
              </div>
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
