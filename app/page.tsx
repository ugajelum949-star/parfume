import Image from 'next/image'
import { eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { banners, products } from '@/db/schema'
import { getSetting } from '@/app/actions/settings'
import { Header } from '@/components/layout/Header'
import { MarqueeBar } from '@/components/home/MarqueeBar'
import { BannerCarousel } from '@/components/home/BannerCarousel'
import { WarSection } from '@/components/home/WarSection'
import type { War as WarType } from '@/components/home/WarSection'
import { BlogSection } from '@/components/home/BlogSection'
import { PopularSection } from '@/components/home/PopularSection'
import { ScentCards } from '@/components/home/ScentCards'
import { GenderSplit } from '@/components/home/GenderSplit'
import { getActiveWars, checkExpiredWars, getScheduledWars } from '@/app/actions/wars'
import { getPosts } from '@/app/actions/posts'

export const dynamic = 'force-dynamic'

export const revalidate = 60

export default async function Home() {
  await checkExpiredWars()

  const [
    activeBanners,
    allProducts,
    activeWars,
    scheduledWars,
    latestPosts,
    heroImage,
    heroForHim,
    heroForHer,
    heroUnisex,
    scentFresh,
    scentFloral,
    scentWoody,
    scentAmber,
  ] = await Promise.all([
    db.select().from(banners).where(eq(banners.active, true)).orderBy(desc(banners.order)),
    db.select().from(products).orderBy(desc(products.createdAt)).limit(50),
    getActiveWars(),
    getScheduledWars(),
    getPosts(),
    getSetting('heroImage'),
    getSetting('heroForHim'),
    getSetting('heroForHer'),
    getSetting('heroUnisex'),
    getSetting('scentFresh'),
    getSetting('scentFloral'),
    getSetting('scentWoody'),
    getSetting('scentAmber'),
  ])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <MarqueeBar />
      <Header />

      {/* Hero — full-width image */}
      <section className={`relative overflow-hidden ${heroImage ? 'h-[70vh] md:h-[85vh]' : 'h-[40vh] md:h-[50vh]'}`}>
        <div className="absolute inset-0">
          {heroImage ? (
            <Image
              src={heroImage}
              alt="Parfume Store — Parfum branded original Indonesia"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-background via-background/80 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-12 max-w-6xl mx-auto">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight mb-6">
            Parfum yang<br />
            <span className="text-accent">Bikin Kamu</span><br />
            Dikenang.
          </h1>
          <a
            href="#products"
            className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full font-medium text-sm hover:bg-foreground/90 transition-colors w-fit"
          >
            Jelajahi Koleksi
            <span>→</span>
          </a>
        </div>
      </section>

      {/* Active Wars */}
      {activeWars.length > 0 && activeWars.map(war => (
        <WarSection key={war.id} war={war as unknown as WarType} />
      ))}
      {scheduledWars.length > 0 && scheduledWars.map(war => (
        <WarSection key={war.id} war={war as unknown as WarType} mode="coming-soon" />
      ))}

      {/* Banners */}
      {activeBanners.length > 0 && (
        <section className="py-6 md:py-10 overflow-x-hidden">
          <BannerCarousel banners={activeBanners} />
        </section>
      )}

      {/* Most Popular + Sale tabs */}
      <PopularSection products={allProducts} />

      {/* Scent Family Cards */}
      <ScentCards images={{ fresh: scentFresh, floral: scentFloral, woody: scentWoody, amber: scentAmber }} />

      {/* For Him / For Her / Unisex */}
      <GenderSplit
        products={allProducts}
        heroForHim={heroForHim}
        heroForHer={heroForHer}
        heroForEveryone={heroUnisex}
      />

{/* Blog */}
      {latestPosts.length > 0 && (
        <BlogSection posts={latestPosts} />
      )}

      {/* Trust strip */}
      <section className="py-8 md:py-10 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-3 md:gap-4">
          {['100% Original', 'Gratis Ongkir', 'Free Vial', 'Return 7 Hari'].map(item => (
            <span key={item} className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 rounded-full border border-border">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Internal linking — scent families */}
      <section className="py-6 text-center">
        <p className="text-muted-foreground text-sm">
          Jelajahi koleksi kami:{' '}
          <a href="/products?category=Fresh" className="text-foreground hover:text-accent underline underline-offset-2">Fresh</a>{' · '}
          <a href="/products?category=Floral" className="text-foreground hover:text-accent underline underline-offset-2">Floral</a>{' · '}
          <a href="/products?category=Woody" className="text-foreground hover:text-accent underline underline-offset-2">Woody</a>{' · '}
          <a href="/products?category=Amber" className="text-foreground hover:text-accent underline underline-offset-2">Amber</a>
        </p>
      </section>
    </div>
  )
}
