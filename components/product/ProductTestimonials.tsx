'use client'

import { Star } from 'lucide-react'
import { getImageSrc } from '@/lib/image-proxy'

interface Testimonial {
  id: string
  name: string
  role: string | null
  content: string
  rating: number
  avatar: string | null
  proofImage: string | null
}

const rotations = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]']

function ReviewCard({ t, rotation }: { t: Testimonial; rotation: string }) {
  return (
    <div className={`${rotation} group hover:!rotate-0 transition-transform duration-300 shrink-0 w-[280px] md:w-[320px]`}>
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-accent/40 transition-all h-[310px] shadow-sm">
        <div className="flex items-center gap-3">
          {t.avatar ? (
            <img src={getImageSrc(t.avatar)} alt={t.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center ring-2 ring-border">
              <span className="text-accent font-bold text-xs">{t.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{t.name}</p>
            {t.role && <p className="text-[10px] text-muted-foreground truncate">{t.role}</p>}
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
            <Star className="w-3 h-3 fill-accent text-accent" />
            <span className="text-xs font-bold text-accent">{t.rating}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-2 my-1">
          &ldquo;{t.content}&rdquo;
        </p>

        {t.proofImage ? (
          <div className="w-full h-36 md:h-40 rounded-xl overflow-hidden border border-border bg-black/20 shrink-0">
            <img
              src={t.proofImage}
              alt="Bukti Review"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  )
}

function MarqueeRow({ items, reverse, speed }: { items: Testimonial[]; reverse?: boolean; speed?: number }) {
  const duplicated = [...items, ...items, ...items]
  const dur = speed || 30

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-4 pb-4 hover:[animation-play-state:paused]"
        style={{
          width: 'max-content',
          animation: `marquee${reverse ? '-reverse' : ''} ${dur}s linear infinite`,
        }}
      >
        {duplicated.map((t, i) => (
          <ReviewCard key={`${t.id}-${i}`} t={t} rotation={rotations[i % 3]} />
        ))}
      </div>
    </div>
  )
}

export function ProductTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials.length) {
    return (
      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold mb-6">Customer Reviews</h2>
          <p className="text-muted-foreground text-sm text-center py-6">Belum ada review untuk produk ini.</p>
        </div>
      </section>
    )
  }

  const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length

  // Split into 2 rows (skip middle)
  const rows: Testimonial[][] = [[], []]
  testimonials.forEach((t, i) => { rows[i % 2].push(t) })

  return (
    <section className="py-10 md:py-16 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-xl md:text-2xl font-bold">Customer Reviews</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span>{avgRating.toFixed(1)}</span>
            <span>({testimonials.length})</span>
          </div>
        </div>

        <div className="space-y-4">
          <MarqueeRow items={rows[0]} reverse speed={25} />
          {rows[1].length > 0 && <MarqueeRow items={rows[1]} speed={18} />}
        </div>
      </div>
    </section>
  )
}
