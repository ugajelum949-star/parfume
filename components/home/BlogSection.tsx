'use client'

import Link from 'next/link'
import Image from 'next/image'
import { getImageSrc } from '@/lib/image-proxy'
type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  category: string | null
  tags: string
  published: boolean
  createdAt: Date | null
  updatedAt: Date | null
}

const categoryColors: Record<string, string> = {
  'Care Tips': 'bg-emerald-500/10 text-emerald-600',
  'Scent Guide': 'bg-blue-500/10 text-blue-600',
  'News': 'bg-purple-500/10 text-purple-600',
  'Recommendation': 'bg-gold/10 text-gold',
}

export function BlogSection({ posts }: { posts: Post[] }) {
  const latest = posts.slice(0, 3)
  if (latest.length === 0) return null

  return (
    <section className="py-10 md:py-16 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8 md:mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Artikel Terbaru</h2>
            <p className="text-muted-foreground text-sm mt-1">Tips & guide parfum untukmu</p>
          </div>
          <Link href="/blog" className="text-sm text-gold hover:text-gold-light font-medium transition-colors">Lihat Semua →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gold/5 mb-3">
                {post.coverImage ? (
                  <Image
                    src={getImageSrc(post.coverImage)}
                    alt={post.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                )}
                {post.category && (
                  <span className={`absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gold/10 text-gold'}`}>
                    {post.category}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-gold transition-colors">{post.title}</h3>
              {post.excerpt && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
              )}
              <span className="text-xs text-gold mt-2 inline-block font-medium">Baca Selengkapnya →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
