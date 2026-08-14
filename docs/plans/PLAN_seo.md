---
aliases: [seo-plan, seo-strategy, search-engine-optimization]
tags: [plan, seo, marketing]
last_updated: 2026-08-14
---

# PLAN_seo — SEO Strategy & Implementation Guide

> **Instruksi untuk AI:** Ikuti step-by-step. Jangan improvisasi. Semua code example sudah lengkap.

---

## Current SEO Status

### ✅ Sudah Ada
| Area | Status | File |
|------|:------:|------|
| Global meta (title, desc, OG, Twitter) | ✅ | `app/layout.tsx` |
| Product generateMetadata | ✅ | `app/product/[id]/page.tsx` |
| Product JSON-LD (Product) | ✅ | `app/product/[id]/page.tsx` |
| Blog generateMetadata | ✅ | `app/blog/[slug]/page.tsx` |
| Dynamic sitemap | ✅ | `app/sitemap.ts` |
| Robots.txt | ✅ | `app/robots.ts` |
| Blog DOMPurify | ✅ | `app/blog/[slug]/page.tsx` |

### ❌ Belum Ada
| Area | Impact | Priority |
|------|--------|:--------:|
| Image alt text (product detail) | Medium | P1 |
| Product LCP priority | Medium | P1 |
| Breadcrumb JSON-LD | Low | P2 |
| Organization JSON-LD | Medium | P1 |
| Blog Article JSON-LD | Medium | P2 |
| Internal linking | High | P1 |
| Core Web Vitals | High | P2 |
| Canonical URLs | Low | P3 |
| Category page SEO | Medium | P2 |
| Blog content strategy | High | P1 |
| Meta description per page | Medium | P1 |
| Open Graph images per page | Medium | P2 |

---

## P1: Quick Wins (1-2 jam)

### 1.1 Image Alt Text

**Problem:** Product detail page tidak punya `alt` attribute.

**File:** `app/product/[id]/page.tsx`

Cari tag `<img` dan tambahkan `alt` attribute:

```tsx
// Tambah di gambar produk
<img
  src={images[currentImage]}
  alt={`${product.brand} ${product.name} - ${product.category} perfume`}
  // ... existing props
/>
```

**Rule:** Alt text harus mengandung brand + nama produk. Ini yang Google index untuk image search.

### 1.2 Product Page LCP Priority

**Problem:** Product image tidak pakai `priority` hint.

**File:** `app/product/[id]/page.tsx`

```tsx
// Ganti <img> menjadi <Image> dari next/image
import Image from 'next/image'

<Image
  src={images[currentImage]}
  alt={`${product.brand} ${product.name}`}
  width={800}
  height={800}
  priority  // ← tambah ini untuk LCP
  className="object-cover"
/>
```

### 1.3 Organization JSON-LD

**File:** `app/layout.tsx`

Tambah di `<head>` atau di layout component:

```tsx
// Tambah di metadata export
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Parfume Store',
  url: process.env.NEXT_PUBLIC_BASE_URL,
  logo: `${process.env.NEXT_PUBLIC_BASE_URL}/img.png`,
  description: 'Toko parfum branded original Indonesia',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
  },
  sameAs: [
    'https://instagram.com/parfumestore',
    'https://tiktok.com/@parfumestore',
  ],
}

// Di layout render:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
/>
```

### 1.4 Meta Description Per Page

Saat ini hanya ada global description. Perlu per-page description.

**File:** `app/products/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: 'Katalog Parfum Original',
  description: 'Jelajahi koleksi parfum branded original. Dior, Chanel, Tom Ford, Creed. Gratis ongkir untuk pembelian 2+ item. Harga mulai Rp 450.000.',
}
```

**File:** `app/blog/page.tsx` (atau layout.tsx blog)

```tsx
export const metadata: Metadata = {
  title: 'Blog — Tips & Guide Parfum',
  description: 'Tips merawat parfum, panduan scent family, review produk. Wawasan parfum dari Parfume Store.',
}
```

**Rule:** Setiap page harus punya `description` unik, 120-160 karakter, mengandung keyword target.

### 1.5 Internal Linking di Homepage

**Problem:** Homepage hanya punya 1 `href` (ke section). Tidak ada internal links ke kategori/produk.

**File:** `app/page.tsx`

Di section **Scent Cards** dan **Gender Split**, setiap card sudah link ke `/products?category=...` atau `/products?gender=...`. Itu sudah bagus.

**Yang kurang:** Tambah text links di bagian deskripsi homepage:

```tsx
{/* Tambah di bawah hero atau di bagian trust strip */}
<div className="max-w-4xl mx-auto text-center py-8">
  <p className="text-muted-foreground text-sm mb-4">
    Jelajahi koleksi kami:
    <a href="/products?category=Fresh" className="text-foreground hover:text-accent mx-1">Fresh</a>·
    <a href="/products?category=Floral" className="text-foreground hover:text-accent mx-1">Floral</a>·
    <a href="/products?category=Woody" className="text-foreground hover:text-accent mx-1">Woody</a>·
    <a href="/products?category=Amber" className="text-foreground hover:text-accent mx-1">Amber</a>
  </p>
</div>
```

### 1.6 Blog Sitemap Update

**File:** `app/sitemap.ts`

Sudah include blog posts dari DB. Verify dengan:

```bash
curl http://localhost:3000/sitemap.xml | grep blog
```

Harus tampil semua published blog posts.

---

## P2: Medium Effort (2-5 jam)

### 2.1 Breadcrumb JSON-LD

**File:** `app/product/[id]/page.tsx`

Tambah breadcrumb structured data:

```tsx
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Produk', item: `${baseUrl}/products` },
    { '@type': 'ListItem', position: 3, name: `${product.brand} ${product.name}`, item: productUrl },
  ],
}
```

**File:** `app/blog/[slug]/page.tsx`

```tsx
const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
    { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
  ],
}
```

### 2.2 Blog Article JSON-LD

**File:** `app/blog/[slug]/page.tsx`

```tsx
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt || post.title,
  image: post.coverImage || `${baseUrl}/img.png`,
  datePublished: post.createdAt,
  dateModified: post.updatedAt || post.createdAt,
  author: {
    '@type': 'Organization',
    name: 'Parfume Store',
    url: baseUrl,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Parfume Store',
    logo: { '@type': 'ImageObject', url: `${baseUrl}/img.png` },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': postUrl,
  },
}
```

### 2.3 Canonical URLs

Tambah canonical URL untuk menghindari duplicate content.

**File:** `app/product/[id]/page.tsx` — di `generateMetadata`:

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  // ... existing code ...
  return {
    // ... existing metadata ...
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${id}`,
    },
  }
}
```

**File:** `app/blog/[slug]/page.tsx` — sama:

```tsx
alternates: {
  canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/blog/${slug}`,
},
```

### 2.4 Category Page SEO

**File:** `app/products/layout.tsx`

Sudah ada basic metadata. Tambah dynamic description berdasarkan category:

```tsx
export const metadata: Metadata = {
  title: 'Katalog Parfum Original — Semua Scent Family',
  description: 'Temukan parfum branded original: Fresh untuk kesegaran, Floral untuk keeleganan, Woody untuk kehangatan, Amber untuk kesensualan. Gratis ongkir.',
  openGraph: {
    title: 'Katalog Parfum Original',
    description: 'Dior, Chanel, Tom Ford, Creed & lebih. Gratis ongkir untuk 2+ item.',
  },
}
```

### 2.5 Open Graph Images

Saat ini OG image hanya default `/img.png`. Perlu custom OG image per product.

**Approach A (Simple):** Pakai product image sebagai OG image

```tsx
// Di generateMetadata product page
openGraph: {
  images: product.image ? [{
    url: product.image,
    width: 800,
    height: 800,
    alt: `${product.brand} ${product.name}`,
  }] : [],
}
```

**Approach B (Advanced):** Generate OG image dinamis pakai `next/og` (Edge Runtime)

Ini lebih complex — skip dulu, pakai Approach A.

### 2.6 Core Web Vitals Check

**Tool:** Lighthouse atau PageSpeed Insights

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html
```

**Target metrics:**
| Metric | Target | Current (estimasi) |
|--------|:------:|:-------------------:|
| LCP | < 2.5s | ~3s (hero image) |
| FID | < 100ms | ~50ms ✅ |
| CLS | < 0.1 | ~0.05 ✅ |
| Speed Index | < 3s | ~3.5s |
| TTI | < 3.5s | ~4s |

**Fixes untuk LCP:**
1. Hero image → pakai `priority` + `fetchPriority="high"`
2. Product images → lazy load (sudah ada)
3. Font → pakai `display: swap` (sudah ada di Inter + DM Serif)
4. Preload critical CSS

---

## P3: Content Strategy

### 3.1 Blog Content Calendar

| Minggu | Judul | Kategori | Target Keywords |
|:------:|-------|----------|----------------|
| 1 | Cara Merawat Parfum Agar Tahan Lama | Care Tips | "cara merawat parfum", "parfum tahan lama" |
| 2 | Panduan Scent Family: Fresh, Floral, Woody, Amber | Scent Guide | "scent family parfum", "jenis aroma parfum" |
| 3 | Perbedaan EDP, EDT, dan Eau de Parfum | Education | "edp vs edt", "parfum tahan lama" |
| 4 | 5 Parfum Best Seller untuk Pria | Recommendation | "parfum pria terbaik", "parfum pria favorit" |
| 5 | Tips Memilih Parfum Sesuai Musim | Care Tips | "parfum musim panas", "parfum musim hujan" |
| 6 | Review: Dior Sauvage vs Bleu de Chanel | Review | "sauvage vs bleu de chanel", "parfum pria" |
| 7 | Parfum Arabian: Panduan Lengkap untuk Pemula | Education | "parfum arab", "parfum arab murah" |
| 8 | Gift Guide: Parfum untuk Pacar | Recommendation | "parfum hadiah", "parfum kado pacar" |

**Rule:** Setiap blog post minimal 500 kata, mengandung 3-5 target keywords natural, ada 1-2 internal link ke produk terkait.

### 3.2 On-Page SEO Checklist

Untuk SETIAP halaman baru:

- [ ] Title tag: 50-60 karakter, mengandung keyword utama
- [ ] Meta description: 120-160 karakter, CTA di akhir
- [ ] H1: 1 per page, mengandung keyword
- [ ] H2-H3: structured headings
- [ ] Image alt text: mengandung keyword + deskripsi
- [ ] Internal links: minimal 2-3 per page
- [ ] Canonical URL: set untuk setiap page
- [ ] OG image: ada di setiap page
- [ ] JSON-LD: sesuai page type (Product, Article, BreadcrumbList)

### 3.3 Keyword Research Targets

| Keyword | Volume (est.) | Difficulty | Pages |
|---------|:-------------:|:----------:|-------|
| parfum original | 10K+ | Tinggi | /products |
| parfum branded | 5K+ | Sedang | /products |
| parfum pria terbaik | 3K+ | Sedang | Blog |
| parfum wanita | 3K+ | Sedang | /products?gender=Women |
| dior sauvage | 2K+ | Tinggi | /product/[id] |
| parfum arab murah | 2K+ | Rendah | Blog |
| cara merawat parfum | 1K+ | Rendah | Blog |
| parfum hadiah | 1K+ | Rendah | Blog |
| free ongkir parfum | 500+ | Rendah | Homepage |

---

## P4: Technical SEO

### 4.1 Performance Optimization

**Lazy loading images:**
```tsx
// Sudah ada di StoreGrid. Pastikan juga di:
// - GenderSplit.tsx
// - BlogSection.tsx
// - ProductCard.tsx
<Image loading="lazy" ... />
```

**Font optimization:**
```tsx
// Sudah benar di layout.tsx — Inter + DM Serif dengan display: swap
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] })
```

**Preconnect ke S3:**
```html
<!-- Di app/layout.tsx, di <head> -->
<link rel="preconnect" href="https://is3.cloudhost.id" />
```

### 4.2 URL Structure

Pastikan URL bersih dan konsisten:

| Type | Pattern | Contoh |
|------|---------|--------|
| Product | `/product/[uuid]` | `/product/abc-123` |
| Blog | `/blog/[slug]` | `/blog/cara-merawat-parfum` |
| Products | `/products` | `/products` |
| Category | `/products?category=Fresh` | `/products?category=Fresh` |
| Gender | `/products?gender=Men` | `/products?gender=Men` |

**Note:** Product URL pakai UUID, bukan slug. Tapi ini acceptable karena product links diarahkan dari search results.

### 4.3 Mobile SEO

Semua halaman sudah responsive. Pastikan:

- Touch targets minimal 48x48px
- Font minimal 16px di mobile
- Tidak ada horizontal scroll
- Viewport meta sudah ada: `width=device-width, initial-scale=1`

---

## Execution Order

| Order | Task | Effort | Impact |
|:-----:|------|:------:|:------:|
| 1 | Image alt text + LCP priority | 15 menit | Medium |
| 2 | Organization JSON-LD | 10 menit | Medium |
| 3 | Meta descriptions per page | 15 menit | Medium |
| 4 | Internal linking homepage | 10 menit | High |
| 5 | Canonical URLs | 15 menit | Low |
| 6 | Blog Article JSON-LD | 15 menit | Medium |
| 7 | Breadcrumb JSON-LD | 20 menit | Low |
| 8 | OG images per product | 15 menit | Medium |
| 9 | Preconnect S3 | 5 menit | Low |
| 10 | Lighthouse audit + fix | 1 jam | High |
| 11 | Blog content (mulai post 1) | 2 jam | High |
| 12 | Blog content (post 2-5) | 1 jam/post | High |

**Total P1: ~1 jam**
**Total P2: ~3 jam**
**Total P3: ~8 jam (5 blog posts)**
**Grand Total: ~12 jam**

---

## Verification

### Quick Check
```bash
# 1. Sitemap berisi semua pages + blog + products
curl -s http://localhost:3000/sitemap.xml | grep -c "url"
# Target: 20+ URLs

# 2. Robots.txt benar
curl http://localhost:3000/robots.txt
# Harus allow /, disallow /admin/

# 3. Product page punya meta tags
curl -s http://localhost:3000/product/[id] | grep -o '<title>[^<]*</title>'
# Harus: "[Brand] [Name] | Parfume Store"

# 4. JSON-LD valid
curl -s http://localhost:3000/product/[id] | grep -o 'application/ld+json' | wc -l
# Target: 2+ (Product + BreadcrumbList)

# 5. Blog page punya Article JSON-LD
curl -s http://localhost:3000/blog/[slug] | grep -o 'application/ld+json' | wc -l
# Target: 2+ (Article + BreadcrumbList)
```

### Lighthouse Audit
```bash
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse.json
# Target: Performance > 80, SEO > 90, Best Practices > 90
```

---

## Monitoring

### Weekly
- [ ] Cek Google Search Console untuk crawl errors
- [ ] Cek indexing status (site:parfumestore.com)
- [ ] Review top keywords

### Monthly
- [ ] Lighthouse audit
- [ ] Update sitemap (otomatis, tapi verify)
- [ ] Publish 2-4 blog posts
- [ ] Check Core Web Vitals di PageSpeed Insights

---

*See also: [[PLAN_features]], [[PLAN_design]]*

---

*Back to [[00-index]]*
