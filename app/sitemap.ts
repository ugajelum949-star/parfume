import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { products, posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ]

  // Dynamic product pages
  const allProducts = await db.select({ id: products.id, updatedAt: products.updatedAt }).from(products)
  const productPages: MetadataRoute.Sitemap = allProducts.map(p => ({
    url: `${baseUrl}/product/${p.id}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Dynamic blog post pages
  const allPosts = await db.select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(eq(posts.published, true))
  const blogPages: MetadataRoute.Sitemap = allPosts.map(p => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...blogPages]
}
