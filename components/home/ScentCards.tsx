import Link from 'next/link'

const scentFamilies = [
  { name: 'Fresh', description: 'Bersih & menyegarkan', color: 'from-blue-500/20 to-cyan-500/20', emoji: '🍊' },
  { name: 'Floral', description: 'Elegan & feminin', color: 'from-pink-500/20 to-rose-500/20', emoji: '🌸' },
  { name: 'Woody', description: 'Hangat & maskulin', color: 'from-amber-700/20 to-yellow-700/20', emoji: '🪵' },
  { name: 'Amber', description: 'Kaya & sensual', color: 'from-orange-600/20 to-red-600/20', emoji: '🔥' },
]

export function ScentCards() {
  return (
    <section className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h2 className="font-serif text-3xl md:text-4xl mb-2">Explore Our Collection</h2>
        <p className="text-muted-foreground">
          Temukan aroma yang mencerminkan <span className="text-foreground font-medium">kamu</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scentFamilies.map(family => (
          <Link
            key={family.name}
            href={`/products?category=${family.name}`}
            className="group"
          >
            <div className={`aspect-[4/3] rounded-xl bg-gradient-to-br ${family.color} flex items-center justify-center text-5xl mb-3 group-hover:scale-[1.02] transition-transform`}>
              {family.emoji}
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
