import Link from 'next/link'
import Image from 'next/image'
import { getPost } from '@/app/actions/posts'
import { Header } from '@/components/layout/Header'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import DOMPurify from 'isomorphic-dompurify'

export const dynamic = 'force-dynamic'

export const revalidate = 60

const categoryColors: Record<string, string> = {
  'Care Tips': 'bg-emerald-500/10 text-emerald-600',
  'Scent Guide': 'bg-blue-500/10 text-blue-600',
  'News': 'bg-purple-500/10 text-purple-600',
  'Recommendation': 'bg-gold/10 text-gold',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Artikel Tidak Ditemukan' }
  const postUrl = `${process.env.NEXT_PUBLIC_BASE_URL!}/blog/${slug}`
  return {
    title: `${post.title} — Blog Parfume Store`,
    description: post.excerpt || post.title,
    alternates: {
      canonical: postUrl,
    },
  }
}


function simpleMarkdownToHtml(md: string): string {
  const html = md
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-gold/10 text-gold px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-gold hover:underline">$1</a>')
    // Line breaks to paragraphs
    .split('\n\n')
    .map(p => p.trim())
    .filter(p => p)
    .map(p => {
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<li')) return p
      return `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')
  return html
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const html = simpleMarkdownToHtml(post.content)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!
  const postUrl = `${baseUrl}/blog/${slug}`

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.coverImage || `${baseUrl}/img.png`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { '@type': 'Organization', name: 'Parfume Store', url: baseUrl },
    publisher: { '@type': 'Organization', name: 'Parfume Store', logo: { '@type': 'ImageObject', url: `${baseUrl}/img.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <Header />

      <article className="container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-gold hover:text-gold-light transition-colors mb-8">
          ← Kembali ke Blog
        </Link>

        {post.coverImage && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[post.category] || 'bg-gold/10 text-gold'}`}>
              {post.category}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </span>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-6">{post.title}</h1>

        {post.excerpt && (
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">{post.excerpt}</p>
        )}

        <div
          className="prose prose-invert max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
        />
      </article>
    </div>
  )
}
