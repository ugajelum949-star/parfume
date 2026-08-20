import Link from 'next/link'
import Image from 'next/image'
import { getPosts } from '@/app/actions/posts'
import { getImageSrc } from '@/lib/image-proxy'
import { Header } from '@/components/layout/Header'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — Tips & Guide Parfum',
  description: 'Temukan tips merawat parfum, panduan scent family, dan rekomendasi parfum terbaik untukmu.',
}

export const revalidate = 60

const categoryColors: Record<string, string> = {
  'Care Tips': 'bg-emerald-500/10 text-emerald-600',
  'Scent Guide': 'bg-blue-500/10 text-blue-600',
  'News': 'bg-purple-500/10 text-purple-600',
  'Recommendation': 'bg-gold/10 text-gold',
}

const categories = ['All', 'Care Tips', 'Scent Guide', 'News', 'Recommendation']

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">Blog</h1>
          <p className="text-muted-foreground text-sm mt-2">Tips, guide, dan berita seputar parfum</p>
        </div>

        {/* Category filter — rendered as static all-pass since this is a server component */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                cat === 'All'
                  ? 'bg-gold/10 text-gold border-gold/30'
                  : 'bg-card text-muted-foreground border-border hover:border-gold/30'
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Belum ada artikel</p>
            <p className="text-muted-foreground text-sm mt-1">Artikel akan segera hadir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gold/5 mb-3">
                  {post.coverImage ? (
                    <Image
                      src={getImageSrc(post.coverImage)}
                      alt={post.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                <h2 className="font-semibold text-sm line-clamp-2 group-hover:text-gold transition-colors">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
