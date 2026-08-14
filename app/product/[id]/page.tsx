import { db } from '@/lib/db'
import { products, productImages, testimonials } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ProductDetail } from '@/components/product/ProductDetail'
import { ProductTestimonials } from '@/components/product/ProductTestimonials'
import { parseAllSizePrices } from '@/lib/price'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const revalidate = 300

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!product) return {}

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const productUrl = `${baseUrl}/product/${product.id}`

  return {
    title: `${product.brand} ${product.name}`,
    description: product.description || `${product.brand} ${product.name} — Parfum branded original. Tersedia dalam ukuran ${product.sizes}.`,
    keywords: [product.brand, product.name, product.category, 'parfum', 'perfume', 'parfum original'],
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${product.brand} ${product.name}`,
      description: product.description || `${product.brand} ${product.name} — Parfum branded original.`,
      url: productUrl,
      siteName: 'Parfume Store',
      images: product.image ? [{ url: product.image, width: 800, height: 800, alt: `${product.brand} ${product.name}` }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.brand} ${product.name}`,
      description: product.description || `${product.brand} ${product.name} — Parfum branded original.`,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)

  if (!product) notFound()

  const [allTestimonials, extraImages] = await Promise.all([
    db.select().from(testimonials).orderBy(desc(testimonials.createdAt)).limit(6),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.order),
  ])

  // Build all images array: main + extras
  const allImages: string[] = []
  if (product.image) allImages.push(product.image)
  extraImages.forEach(img => { if (img.url) allImages.push(img.url) })

  // Parse size prices from stockData
  const { sizePrices, sizeSalePrices } = parseAllSizePrices(product.stockData, product.sizes, product.price)

  // JSON-LD Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const productUrl = `${baseUrl}/product/${product.id}`
  const avgRating = allTestimonials.length > 0
    ? (allTestimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / allTestimonials.length).toFixed(1)
    : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.brand} ${product.name}`,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description || `${product.brand} ${product.name} — Parfum branded original.`,
    image: allImages,
    url: productUrl,
    offers: {
      '@type': 'Offer',
      price: Number(product.price),
      priceCurrency: 'IDR',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Parfume Store',
        url: baseUrl,
      },
    },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: String(allTestimonials.length),
      },
    }),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Produk', item: `${baseUrl}/products` },
      { '@type': 'ListItem', position: 3, name: `${product.brand} ${product.name}`, item: productUrl },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <Header />
      <ProductDetail product={{ ...product, sizePrices, sizeSalePrices, allImages }} />
      <ProductTestimonials testimonials={allTestimonials} />
    </div>
  )
}
