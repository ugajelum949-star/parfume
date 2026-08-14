---
aliases: [design-plan, redesign, visual-refresh]
tags: [plan, design]
last_updated: 2026-08-14
---

# DESIGN IMPLEMENTATION GUIDE

> **Instruksi lengkap untuk redesign Parfume Store. Ikuti step-by-step. Jangan improvisasi.**

---

## Reference

- **Visual reference:** https://officialmykonos.com/ (Mykonos Parfum — clean, product-focused, editorial)
- **Approach:** Struktur Mykonos + dark mode
- **Framework:** Next.js 16, TailwindCSS v4, shadcn/ui

---

## STEP 1: Color System

**File: `app/globals.css`**

Ganti SEMUA color tokens dengan ini. Jangan pertahankan yang lama.

```css
@import "tailwindcss";

@theme {
  --color-background: #0C0C0C;
  --color-foreground: #FAFAFA;
  --color-card: #161616;
  --color-card-foreground: #FAFAFA;
  --color-popover: #161616;
  --color-popover-foreground: #FAFAFA;
  --color-primary: #FFFFFF;
  --color-primary-foreground: #0C0C0C;
  --color-secondary: #1C1C1C;
  --color-secondary-foreground: #FAFAFA;
  --color-muted: #1C1C1C;
  --color-muted-foreground: #777777;
  --color-accent: #C43A31;
  --color-accent-hover: #D94A41;
  --color-destructive: #C43A31;
  --color-border: #252525;
  --color-input: #252525;
  --color-ring: #C43A31;
  --color-gold: #C43A31;
  --color-gold-light: #D94A41;
  --color-navy: #0C0C0C;
  --radius: 0.5rem;
}

/* HAPUS semua CSS variables lama yang menggunakan hsl() wrapper */
/* HAPUS: --background, --foreground, --primary, --muted, dll versi lama */

/* Marquee animation */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

/* Scroll reveal */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Subtle image zoom on hover */
.group:hover .group-hover\:scale-102 {
  transform: scale(1.02);
}

/* Scrollbar hidden utility */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

---

## STEP 2: Typography

**File: `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ProtectionProvider } from "@/components/providers/ProtectionProvider";
import { ClientOverlays } from "@/components/shared/ClientOverlays";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Parfume Store — Parfum Original',
    template: '%s | Parfume Store'
  },
  description: 'Parfum branded original. Dior, Chanel, Tom Ford & lebih. Gratis ongkir untuk 2+ item.',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Parfume Store',
  },
  icons: {
    icon: '/img.png',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${dmSerif.variable} antialiased`}>
        <StoreProvider>
          <ProtectionProvider />
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-1">{children}</main>
            <Footer />
            <BottomNav />
            <ClientOverlays />
            <ScrollToTop />
          </div>
          <Toaster position="top-center" />
        </StoreProvider>
      </body>
    </html>
  );
}
```

### Font Usage Rules

| Location | Font Class | Contoh |
|----------|-----------|--------|
| Hero headline | `font-serif` (DM Serif) | "Parfum yang Bikin Dikenang" |
| Section title | `font-semibold` (Inter) | "Most Popular" |
| Product name | `font-semibold` (Inter) | "Sauvage EDP" |
| Body text | `font-normal` (Inter) | Deskripsi produk |
| Small/label | `text-xs uppercase tracking-wider` (Inter) | "FRENCH AVENUE" |
| Price | `font-bold` (Inter) | "Rp 1.850.000" |
| Button | `font-medium` (Inter) | "Jelajahi" |

---

## STEP 3: Homepage Redesign

**File: `app/page.tsx`**

Homepage harus punya sections ini, DALAM URUTAN INI:

### Section 1: Marquee Bar

**File baru: `components/home/MarqueeBar.tsx`**

```tsx
export function MarqueeBar() {
  const items = [
    'GRATIS ONGKIR untuk pembelian 2+ item',
    'GARANSI 100% ORIGINAL',
    'BAYAR DI TEMPAT tersedia',
    'FREE VIAL untuk setiap pembelian',
  ]
  const text = items.join(' · ')

  return (
    <div className="bg-surface border-b border-border overflow-hidden">
      <div className="animate-marquee whitespace-nowrap py-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground inline-block">
          {text} · {text} · {text} ·
        </span>
      </div>
    </div>
  )
}
```

**Style rules:**
- Background: `bg-surface` (#161616)
- Border bottom: `border-border` (#252525)
- Text: `text-xs uppercase tracking-widest text-muted-foreground`
- Animation: infinite horizontal scroll, 30s linear

### Section 2: Header Single Row

**File: `components/layout/Header.tsx`**

GANTI 2-row header dengan single-row:

```
┌──────────────────────────────────────────────────┐
│ Logo        Home    Produk    Kontak    🔍 ♡(2) 🛒(3) │
└──────────────────────────────────────────────────┘
```

**Rules:**
- Single row, `py-4` padding
- Background: `bg-background/80 backdrop-blur-md` → transparan dengan blur
- Sticky: `sticky top-0 z-50`
- Border bottom: `border-b border-border` (hanya saat scroll, pakai JavaScript)
- Logo: `font-serif text-xl font-bold` (DM Serif)
- Nav links: `text-sm font-medium text-muted-foreground hover:text-foreground`
- Active nav: `text-foreground`
- Icons: `w-5 h-5` (Heart, ShoppingCart)
- Badge counter: `text-[10px] bg-accent text-white rounded-full w-4 h-4 flex items-center justify-center`
- Mobile: hamburger + logo + icons (2 baris kalau perlu, tapi minimal)

### Section 3: Hero

**File: `app/page.tsx` (bagian hero)**

```
┌─────────────────────────────────────────┐
│                                         │
│    [Full-width product image]           │
│    dengan overlay gradient gelap        │
│                                         │
│    overlay text:                        │
│    "Parfum yang"                        │
│    "Bikin Kamu Dikenang"                │
│                                         │
│    [Jelajahi Koleksi →]                 │
│                                         │
└─────────────────────────────────────────┘
```

**Implementation:**
```tsx
{/* Hero */}
<section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
  {/* Background image */}
  <div className="absolute inset-0">
    <img
      src={heroImage}
      alt="Parfume Store"
      className="w-full h-full object-cover"
    />
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
  </div>

  {/* Content */}
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
```

**Rules:**
- Height: `h-[70vh]` mobile, `md:h-[85vh]` desktop
- Image: `object-cover` full bleed
- Gradient overlay: `from-background via-background/60 to-transparent`
- Headline: DM Serif, `text-4xl md:text-6xl lg:text-7xl`
- Accent text: `text-accent` (deep red)
- CTA button: `bg-foreground text-background` (terbalik dari biasa — light on dark)
- Max width: `max-w-6xl`
- **TIDAK ada:** stats bar, "Est. 2024", ambient glow, asymmetric typography

### Section 4: Most Popular + Sale (Tabs)

**File: `components/home/PopularSection.tsx`** (new)

```
┌──────────────────────────────────────────────────────┐
│ Most Popular        Sale              Shop All →      │
│══════════════                                         │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │      │ │      │ │      │ │      │                 │
│ │ img  │ │ img  │ │ img  │ │ img  │                 │
│ │      │ │      │ │      │ │      │                 │
│ │──────│ │──────│ │──────│ │──────│                 │
│ │Brand │ │Brand │ │Brand │ │Brand │                 │
│ │ Name │ │ Name │ │ Name │ │ Name │                 │
│ │Rp X  │ │Rp X  │ │Rp X  │ │Rp X  │                 │
│ └──────┘ └──────┘ └──────┘ └──────┘                 │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │      │ │      │ │      │ │      │                 │
│ │ img  │ │ img  │ │ img  │ │ img  │                 │
│ │      │ │      │ │      │ │      │                 │
│ │──────│ │──────│ │──────│ │──────│                 │
│ │Brand │ │Brand │ │Brand │ │Brand │                 │
│ │ Name │ │ Name │ │ Name │ │ Name │                 │
│ │Rp X  │ │Rp X  │ │Rp X  │ │Rp X  │                 │
│ └──────┘ └──────┘ └──────┘ └──────┘                 │
└──────────────────────────────────────────────────────┘
```

**Implementation:**
```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

type Product = {
  id: string; name: string; brand: string; price: number
  image: string | null; isBestSeller: boolean
  stockData?: string; sizes?: string
}

export function PopularSection({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<'popular' | 'sale'>('popular')

  // Filter by tab
  const displayProducts = tab === 'popular'
    ? products.filter(p => p.isBestSeller).slice(0, 8)
    : products.filter(p => {
        // Check if any size has a sale price
        try {
          const data = JSON.parse(p.stockData || '{}')
          return data.prices && Object.values(data.prices).some(
            (v: any) => v.sale && v.sale < v.price
          )
        } catch { return false }
      }).slice(0, 8)

  return (
    <section id="products" className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setTab('popular')}
            className={`text-2xl md:text-3xl font-semibold transition-colors ${
              tab === 'popular' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setTab('sale')}
            className={`text-2xl md:text-3xl font-semibold transition-colors ${
              tab === 'sale' ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            Sale
          </button>
        </div>
        <Link
          href="/products"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-0.5"
        >
          Shop All Products
        </Link>
      </div>

      {/* Active tab underline */}
      <div className="h-px bg-border mb-8" />

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {displayProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Belum ada produk</p>
      )}
    </section>
  )
}
```

### Section 5: Scent Family Cards

**File baru: `components/home/ScentCards.tsx`**

```tsx
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
```

**Style rules:**
- Card: `aspect-[4/3] rounded-xl` dengan gradient background per scent family
- Emoji sebagai placeholder visual (ganti dengan gambar ingredients nanti)
- Hover: `scale-[1.02]` (subtle, bukan 1.05 atau 1.1)
- Arrow icon: `↗` di pojok kanan bawah

### Section 6: For Him / For Her / Unisex

**File: `components/home/GenderSplit.tsx`**

```
┌──────────────────┐ ┌──────┐ ┌──────┐
│                  │ │      │ │      │
│  [Lifestyle img] │ │ prod │ │ prod │
│  "For Him"       │ │      │ │      │
│  Explore →       │ └──────┘ └──────┘
└──────────────────┘ ┌──────┐ ┌──────┐
                     │      │ │      │
┌──────────────────┐ │ prod │ │ prod │
│                  │ │      │ │      │
│  [Lifestyle img] │ └──────┘ └──────┘
│  "For Her"       │
│  Explore →       │
└──────────────────┘

┌──────────────────┐ ┌──────┐ ┌──────┐
│                  │ │      │ │      │
│  [Lifestyle img] │ │ prod │ │ prod │
│  "Unisex"        │ │      │ │      │
│  Explore →       │ └──────┘ └──────┘
└──────────────────┘ ┌──────┐ ┌──────┐
                     │      │ │      │
                     │ prod │ │ prod │
                     │      │ │      │
                     └──────┘ └──────┘
```

**3 sections, masing-masing:**
- Kiri: gambar lifestyle + label + "Explore →"
- Kanan: 4 product cards (grid 2x2)
- Background gambar per gender **di-config dari admin settings**:
  - **For Him:** setting key `heroForHim`
  - **For Her:** setting key `heroForHer`
  - **Unisex:** setting key `heroUnisex`
- Fallback: gradient color kalau gambar belum di-upload

**Implementation:**
```tsx
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

type Product = { id: string; name: string; brand: string; price: number; image: string | null; gender: string }

export function GenderSplit({ products }: { products: Product[] }) {
  const menProducts = products.filter(p => p.gender === 'Men').slice(0, 4)
  const womenProducts = products.filter(p => p.gender === 'Women').slice(0, 4)

  return (
    <section className="py-12 md:py-20 max-w-6xl mx-auto px-4 md:px-6 space-y-8">
      {/* For Him */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
        <Link href="/products?gender=Men" className="group relative aspect-[4/3] md:aspect-auto md:h-full rounded-xl overflow-hidden">
          <img src="/images/for-him.jpg" alt="For Him" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h3 className="font-serif text-3xl text-white mb-1">For Him</h3>
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Explore Men's Fragrances →</span>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          {menProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* For Her */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
        <Link href="/products?gender=Women" className="group relative aspect-[4/3] md:aspect-auto md:h-full rounded-xl overflow-hidden">
          <img src="/images/for-her.jpg" alt="For Her" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6">
            <h3 className="font-serif text-3xl text-white mb-1">For Her</h3>
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">Explore Women's Fragrances →</span>
          </div>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          {womenProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
```

### Section 7: Trust Strip

```tsx
<section className="py-8 md:py-10 border-t border-border">
  <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-3 md:gap-4">
    {['100% Original', 'Gratis Ongkir', 'Bayar di Tempat', 'Return 7 Hari', 'Made in Indonesia'].map(item => (
      <span key={item} className="text-xs uppercase tracking-wider text-muted-foreground px-4 py-2 rounded-full border border-border">
        {item}
      </span>
    ))}
  </div>
</section>
```

---

## STEP 4: Product Card Redesign

**File: `components/shared/ProductCard.tsx`** (new — buat reusable component)

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'

type ProductCardProps = {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  const isSoldOut = (product.stock ?? 0) <= 0

  return (
    <Link href={`/product/${product.id}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-secondary mb-3">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-muted-foreground/80 text-background text-[10px] font-medium px-2 py-0.5 rounded">
            Sold out
          </div>
        )}
      </div>

      {/* Info */}
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
        {product.brand}
      </p>
      <p className="text-sm font-semibold line-clamp-1 mb-1">
        {product.name}
      </p>
      <p className="text-sm font-bold">
        {formatCurrency(product.price)}
      </p>
    </Link>
  )
}
```

**Style rules:**
- Aspect ratio: `aspect-[4/5]` (tall, editorial)
- Background: `bg-secondary` (#1C1C1C)
- Border radius: `rounded-lg` (bukan rounded-2xl)
- Image hover: `scale-[1.02]` (bukan 1.05 atau 1.1)
- "Sold out" badge: `bg-muted-foreground/80 text-background` (abu-abu, bukan merah)
- NO badges: Best Seller, heart, compare, category pills, stock count
- NO add-to-cart button
- Spacing: `mb-3` (image-info), `mb-0.5` (brand-name), `mb-1` (name-price)

---

## STEP 5: Product Detail Redesign

**File: `components/product/ProductDetail.tsx`**

Layout:
```
← Back                    ♡ Wishlist

[PRODUCT IMAGE — large, centered, max-w-2xl]

Brand Name               Rp 1.850.000
─────────────            (bold, large, accent)
Product Name

Original · Tahan 8 jam · Gratis Ongkir

Size
[60ml — Rp 1.200.000]  [100ml — Rp 1.850.000]  [150ml — Rp 2.500.000]

Quantity
[−] 01 [+]

┌─────────────────────────────────────────────┐
│ 🛒  Keranjang — Rp 1.850.000                │
└─────────────────────────────────────────────┘

Deskripsi
Parfum ini menggabungkan notes...

Reviews (6)  ★★★★★
...
```

**Key changes dari sekarang:**
1. Image: center, `max-w-2xl mx-auto`, tidak full width
2. Layout: single column (bukan 2-column grid)
3. Brand + Name: brand di atas name, dengan accent color untuk name
4. Trust badges: inline row, bukan section terpisah
5. Size selector: buttons dengan harga per size
6. Add to cart: full-width button dengan `bg-accent text-white`
7. TIDAK ada: image carousel dengan dots (cukup 1 gambar utama)

---

## STEP 6: Cart Changes

### Add to Cart: Toast, bukan auto-drawer

**File: `components/product/ProductDetail.tsx`**

Ganti:
```tsx
// LAMA (hapus):
window.dispatchEvent(new Event('open-cart'))

// BARU:
toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })
```

**File: `components/home/StoreGrid.tsx`**

Sama — ganti `window.dispatchEvent(new Event('open-cart'))` dengan `toast.success(...)`.

### Cart Drawer: Minimal

**File: `features/cart/components/CartDrawer.tsx`**

```
┌─────────────────────────┐
│ Keranjang (2)        ✕  │
│─────────────────────────│
│ [img] Sauvage     60ml  │
│        Rp 1.850.000     │
│        [−] 1 [+]        │
│─────────────────────────│
│ [img] Bleu Chanel 100ml │
│        Rp 1.750.000     │
│        [−] 1 [+]        │
│─────────────────────────│
│                         │
│ Subtotal     Rp 3.600.000│
│                         │
│ ┌─────────────────────┐ │
│ │     Checkout         │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

**Rules:**
- Header: `py-4 px-6`, `text-lg font-semibold`
- Items: gap `py-4 px-6`
- Thumbnail: `w-16 h-16 rounded-lg`
- Subtotal: `px-6 py-4 border-t border-border`
- Checkout button: `w-full bg-foreground text-background py-3 rounded-lg font-medium`
- Empty: "Keranjang kosong" + link ke /products

---

## STEP 7: Copywriting (Bahasiswa Indonesia)

Ganti SEMUA text berikut. Search & replace di seluruh project.

| File | Lama | Baru |
|------|------|------|
| page.tsx | "Shop Collection" | "Jelajahi Koleksi" |
| page.tsx | "Featured Collection" | (hapus, digabung ke Most Popular) |
| page.tsx | "Most popular fragrances" | (hapus) |
| page.tsx | "Popular Products" | (hapus, digabung) |
| page.tsx | "Most ordered fragrances" | (hapus) |
| page.tsx | "See all →" | "Semua Produk →" |
| page.tsx | "Free Shipping" | "Gratis Ongkir" |
| page.tsx | "100% Authentic" | "100% Original" |
| page.tsx | "Easy Returns" | "Return 7 Hari" |
| page.tsx | "Secure Payment" | "Bayar di Tempat" |
| page.tsx | "Products" (stat) | "Produk" |
| page.tsx | "Authentic" (stat) | "Original" |
| page.tsx | "Shipping" (stat) | "Ongkir" |
| StoreGrid.tsx | "Cari parfum..." | "Cari parfum..." |
| StoreGrid.tsx | "No products found." | "Belum ada produk." |
| products/page.tsx | "Search perfumes..." | "Cari parfum..." |
| products/page.tsx | "Semua Merek" | "Semua Merek" |
| products/page.tsx | "Terbaru" | "Terbaru" |
| products/page.tsx | "Best Sellers" | "Terlaris" |
| ProductDetail.tsx | "Back" | "← Kembali" |
| ProductDetail.tsx | "Tambah ke Wishlist" | "♡" (icon saja) |
| ProductDetail.tsx | "Add to Cart" | "Keranjang" |
| ProductDetail.tsx | "Added to Cart" | "Ditambahkan ✓" |
| ProductDetail.tsx | "in stock" | "tersedia" |
| ProductDetail.tsx | "Out of stock" | "Stok Habis" |
| CartDrawer | "Checkout" | "Checkout" |
| CartDrawer | empty state | "Keranjang kosong" |
| Header | "Home" | "Home" |
| Header | "Products" | "Produk" |
| Header | "Contact" | "Kontak" |
| Footer | English text | Bahasa Indonesia |

---

## STEP 8: Animations

**File: `app/globals.css`** (tambahkan)

```css
/* Marquee */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-marquee { animation: marquee 30s linear infinite; }

/* Fade in on scroll — gunakan Intersection Observer */
.animate-fade-in-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.animate-fade-in-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**Gunakan Intersection Observer** untuk fade-in sections:
```tsx
'use client'
import { useEffect, useRef } from 'react'

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return <div ref={ref} className="animate-fade-in-up">{children}</div>
}
```

---

## STEP 9: Footer Redesign

**File: `components/layout/Footer.tsx`**

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Parfume Store                                           │
│  Parfum branded original untukmu.                       │
│                                                          │
│  Kategori        Bantuan         Hubungi                  │
│  Pria            FAQ             WhatsApp                 │
│  Wanita          Pengiriman      Instagram                │
│  Unisex          Pengembalian    Email                    │
│                                                          │
│  © 2026 Parfume Store. All rights reserved.              │
└──────────────────────────────────────────────────────────┘
```

**Rules:**
- Background: `bg-background`
- Border top: `border-t border-border`
- Logo: `font-serif text-xl font-bold`
- Description: `text-sm text-muted-foreground max-w-sm`
- Column headings: `text-xs uppercase tracking-wider font-semibold mb-3`
- Links: `text-sm text-muted-foreground hover:text-foreground transition-colors`
- Copyright: `text-xs text-muted-foreground text-center mt-12 pt-6 border-t border-border`

## STEP 10: Admin Image Configuration

Semua gambar visual di homepage **harus bisa di-upload dari admin settings**. Tidak ada gambar hardcoded di code.

### Settings Keys (disimpan di `settings` table — key-value)

| Key | Section | Deskripsi | Fallback kalau kosong |
|-----|---------|-----------|----------------------|
| `heroImage` | Hero | Banner utama homepage | Gradient gelap saja |
| `heroForHim` | Gender Split | Gambar lifestyle "For Him" | Gradient biru tua |
| `heroForHer` | Gender Split | Gambar lifestyle "For Her" | Gradient pink |
| `heroUnisex` | Gender Split | Gambar lifestyle "Unisex" | Gradient hitam/gold |
| `scentFresh` | Scent Cards | Gambar splash "Fresh" | Gradient biru |
| `scentFloral` | Scent Cards | Gambar splash "Floral" | Gradient pink |
| `scentWoody` | Scent Cards | Gambar splash "Woody" | Gradient coklat |
| `scentAmber` | Scent Cards | Gambar splash "Amber" | Gradient oranye |

### Admin Settings Section Baru

**File: `app/admin/settings/settings-form.tsx`**

Tambah section **"Homepage Images"** dengan 8 upload fields:
- Hero Banner (1 image, landscape 16:9)
- For Him / For Her / Unisex (3 images, landscape 16:9)
- Fresh / Floral / Woody / Amber (4 images, landscape 4:3)

Setiap field: upload image → simpan ke S3 → simpan URL ke settings table.

### Implementation Pattern

```tsx
// Di homepage, fetch semua gambar dari settings
const [heroImg, himImg, herImg, unisexImg, freshImg, floralImg, woodyImg, amberImg] =
  await Promise.all([
    getSetting('heroImage'),
    getSetting('heroForHim'),
    getSetting('heroForHer'),
    getSetting('heroUnisex'),
    getSetting('scentFresh'),
    getSetting('scentFloral'),
    getSetting('scentWoody'),
    getSetting('scentAmber'),
  ])

// Contoh usage di GenderSplit
<Link href="/products?gender=Men" className="...">
  {himImg ? (
    <img src={himImg} alt="For Him" className="..." />
  ) : (
    <div className="... bg-gradient-to-br from-blue-900 to-blue-950" />
  )}
</Link>

// Contoh usage di ScentCards
<div className="...">
  {freshImg ? (
    <img src={freshImg} alt="Fresh" className="... object-cover" />
  ) : (
    <span className="text-5xl">🍊</span>
  )}
</div>
```

**Fallback rule:** Kalau gambar belum di-upload, tampilkan gradient color + emoji sebagai placeholder. Admin bisa upload kapan saja.

### Screenshot Admin UI yang Diinginkan

```
┌─────────────────────────────────────────────┐
│ Settings > Homepage Images                  │
│                                             │
│ Hero Banner                                 │
│ ┌─────────────────────────────┐ [Upload]    │
│ │    Preview gambar hero      │             │
│ └─────────────────────────────┘             │
│                                             │
│ Gender Sections                             │
│ For Him:    [Preview] [Upload] [Hapus]      │
│ For Her:    [Preview] [Upload] [Hapus]      │
│ Unisex:     [Preview] [Upload] [Hapus]      │
│                                             │
│ Scent Family Images                         │
│ Fresh:      [Preview] [Upload] [Hapus]      │
│ Floral:     [Preview] [Upload] [Hapus]      │
│ Woody:      [Preview] [Upload] [Hapus]      │
│ Amber:      [Preview] [Upload] [Hapus]      │
│                                             │
│ [Simpan Pengaturan]                         │
└─────────────────────────────────────────────┘
```

---

## EXECUTION ORDER

### Phase 1: Foundation (1 hari)
1. Color system — globals.css, tailwind config
2. Typography — Inter + DM Serif Display, layout.tsx
3. Spacing utilities — globals.css

### Phase 2: Homepage (2 hari)
4. Scrolling marquee bar (new component)
5. Header single-row redesign
6. Hero/banner section
7. Most Popular + Sale tabs
8. Scent family exploration cards
9. For Him / For Her / Unisex split layout
10. Trust strip pills
11. Footer redesign

### Phase 3: Admin + Components (2 hari)
12. Admin settings: Homepage Images section (8 upload fields + S3)
13. Product card redesign (semua grid)
14. Product detail redesign
15. Cart drawer redesign
16. Toast instead of auto-drawer
17. Size selector with prices

### Phase 4: Polish (1 hari)
18. Animations (marquee, scroll reveal, hover)
19. Copywriting refresh (semua text → ID)
20. Mobile responsive fine-tune

**Total: 6 hari**

### Files Changed

| Phase | Modified | New |
|-------|----------|-----|
| Phase 1 | globals.css, layout.tsx, tailwind.config | — |
| Phase 2 | page.tsx, Header.tsx, Footer.tsx | MarqueeBar.tsx, ScentCards.tsx, GenderSplit.tsx, PopularSection.tsx, ProductCard.tsx |
| Phase 3 | settings-form.tsx, StoreGrid.tsx, ProductDetail.tsx, CartDrawer.tsx, CartClient.tsx, products/page.tsx | — |
| Phase 4 | All above + copywriting pass | ScrollReveal.tsx |

---

## FINAL CHECKLIST

Sebelum deploy, pastikan:

- [ ] Tidak ada `bg-navy` atau `text-gold` yang tersisa (ganti dengan `bg-background`/`text-accent`)
- [ ] Tidak ada `font-geist` atau Geist font import (ganti Inter + DM Serif)
- [ ] Tidak ada `rounded-2xl` pada product cards (ganti `rounded-lg`)
- [ ] Tidak ada `scale-105` pada hover (ganti `scale-[1.02]`)
- [ ] Tidak ada auto-open cart drawer (ganti toast)
- [ ] Semua copywriting sudah Bahasa Indonesia
- [ ] Homepage punya marquee bar, tabs, scent cards, gender split
- [ ] Product card hanya: image + brand + name + price
- [ ] `npm run build` 0 errors

---

*See also: [[DESIGN_SYSTEM]], [[PROJECT_OVERVIEW]]*

---

*Back to [[00-index]]*
