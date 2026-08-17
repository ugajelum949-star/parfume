# 🚀 SCALE PROJECT PART 2: FRONTEND LUXURY EXPERIENCE, S3 PROXY INFRASTRUCTURE & ADMIN MANAGEMENT FUNCTION

Dokumen teknis komprehensif ini dirancang sebagai panduan eksekusi mandiri untuk **Claude Code** dalam mengimplementasikan **Scale Project Part 2** pada repositori `parfume`.

> ⚠️ **STRICT ZERO-HARDCODE RULE**: Seluruh data dinamis (Piramida Aroma, Longevity, Sillage, Konsentrasi, WhatsApp Toggle, Banner, dll.) **WAJIB bersumber 100% dari Database (PostgreSQL / Drizzle)** dan dapat diedit oleh Admin melalui Admin Panel. DILARANG KERAS menggunakan string dummy / fallback hardcode di sisi kode frontend!

---

## 📑 DAFTAR ISI
1. [Matrix Perubahan File & Arsitektur](#1-matrix-perubahan-file--arsitektur)
2. [Skema Database & Drizzle Migration (Piramida Aroma)](#2-skema-database--drizzle-migration-piramida-aroma)
3. [Pilar 1: Infrastruktur Image Proxy & Normalizer (`Zero Broken Images`)](#3-pilar-1-infrastruktur-image-proxy--normalizer-zero-broken-images)
4. [Pilar 2: Engine Direct WhatsApp Checkout dengan Master Admin Toggle](#4-pilar-2-engine-direct-whatsapp-checkout-dengan-master-admin-toggle)
5. [Pilar 3: Olfactory Scent Pyramid (Top, Heart, Base Notes) 100% Database-Driven](#5-pilar-3-olfactory-scent-pyramid-top-heart-base-notes-100-database-driven)
6. [Pilar 4: Form Input Piramida Aroma di Admin Produk (`/admin/products`)](#6-pilar-4-form-input-piramida-aroma-di-admin-produk-adminproducts)
7. [Pilar 5: Mobile Sticky Bottom Buy Bar (Detail Produk)](#7-pilar-5-mobile-sticky-bottom-buy-bar-detail-produk)
8. [Pilar 6: Trust Badges & Seksi Rekomendasi Produk Terkait ("You May Also Like")](#8-pilar-6-trust-badges--seksi-rekomendasi-produk-terkait-you-may-also-like)
9. [Pilar 7: Quick Size Pills & Stock Badges di Kartu Produk (`ProductCard.tsx`)](#9-pilar-7-quick-size-pills--stock-badges-di-kartu-produk-productcardtsx)
10. [Pilar 8: Koreksi Tautan Kontak Header & WhatsApp Direct](#10-pilar-8-koreksi-tautan-kontak-header--whatsapp-direct)
11. [Protokol Eksekusi & Pengujian Claude Code](#11-protokol-eksekusi--pengujian-claude-code)

---

## 1. Matrix Perubahan File & Arsitektur

| No | File Path | Aksi | Fungsi & Tanggung Jawab |
| :---: | :--- | :---: | :--- |
| 1 | `db/schema.ts` | **[MODIFY]** | Tambah kolom `topNotes`, `middleNotes`, `baseNotes`, `longevity`, `sillage`, `concentration` pada tabel `products` |
| 2 | `app/api/image/route.ts` | **[BARU]** | Next.js Streaming Proxy dari S3 dengan Cache-Control 24h & MIME resolution |
| 3 | `lib/image-proxy.ts` | **[MODIFY]** | URL Normalizer dinamis untuk IDCloudHost S3 dan relative paths |
| 4 | `features/cart/lib/message-generator.ts` | **[MODIFY]** | Helper generator URL pesan WhatsApp instan per produk & ukuran |
| 5 | `app/actions/settings.ts` | **[MODIFY]** | Tambahkan key `whatsapp_order_button_enabled` pada serializer & parser |
| 6 | `components/providers/StoreProvider.tsx` | **[MODIFY]** | Expose state `whatsappOrderButtonEnabled` ke seluruh client components |
| 7 | `app/admin/settings/settings-form.tsx` | **[MODIFY]** | Toggle Switch UI untuk mengaktifkan / mematikan tombol WA di produk |
| 8 | `app/actions/products.ts` | **[MODIFY]** | Tambahkan field aroma pada `createProduct()`, `updateProduct()`, dan query `getRelatedProducts()` |
| 9 | `app/admin/products/page.tsx` | **[MODIFY]** | Input form Top/Middle/Base Notes, Longevity, Sillage, & Konsentrasi |
| 10 | `components/product/ScentPyramid.tsx` | **[BARU]** | Visualisasi Piramida Aroma murni dari data DB (disembunyikan jika DB kosong) |
| 11 | `components/product/StickyBuyBar.tsx` | **[BARU]** | Floating bottom bar mobile yang muncul saat scroll melewati viewport |
| 12 | `components/product/RelatedProducts.tsx` | **[BARU]** | Carousel produk rekomendasi dari database berdasarkan kesamaan Brand |
| 13 | `components/product/ProductDetail.tsx` | **[MODIFY]** | Integrasi ScentPyramid dinamis, StickyBuyBar, Trust Badges, dan Tombol WA |
| 14 | `components/shared/ProductCard.tsx` | **[MODIFY]** | Tambahkan pills ukuran botol dinamis (`30ml • 50ml`) dan badge low-stock |
| 15 | `components/home/GenderSplit.tsx` | **[MODIFY]** | Bungkus seluruh banner (`heroForHim/Her/Everyone`) dengan `getImageSrc` |
| 16 | `components/home/ScentCards.tsx` | **[MODIFY]** | Bungkus banner aroma dengan `getImageSrc` |
| 17 | `components/layout/Header.tsx` | **[MODIFY]** | Hubungkan menu 'Kontak' langsung ke WhatsApp toko dinamis |

---

## 2. Skema Database & Drizzle Migration (Piramida Aroma)

### 2.1. Update `db/schema.ts`
Tambahkan kolom baru (nullable dengan nilai default aman) pada tabel `products`:

```typescript
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  brand: text("brand").default("-").notNull(),
  gender: text("gender").default("Unisex").notNull(), // Men, Women, Unisex
  price: real("price").notNull(),
  description: text("description"),
  image: text("image"),
  sizes: text("sizes").notNull(), // e.g. "10ml,30ml,50ml,100ml"
  stockData: text("stock_data").default("{}").notNull(),
  stock: integer("stock").default(0).notNull(),
  tags: text("tags").default("").notNull(),
  isBestSeller: boolean("is_best_seller").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  warPrice: real("war_price"),
  launchedAt: timestamp("launched_at"),

  // KOLOM BARU: Piramida Aroma & Spesifikasi Parfum (Database-Driven)
  topNotes: text("top_notes"),
  middleNotes: text("middle_notes"),
  baseNotes: text("base_notes"),
  longevity: text("longevity").default("8 - 12 Jam"),
  sillage: text("sillage").default("Moderate to Strong"),
  concentration: text("concentration").default("Extrait de Parfum"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
```

### 2.2. SQL Migration Script untuk Coolify / PostgreSQL
Perintah SQL non-breaking untuk dijalankan / di-push via Drizzle:

```sql
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "top_notes" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "middle_notes" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "base_notes" text;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "longevity" text DEFAULT '8 - 12 Jam';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sillage" text DEFAULT 'Moderate to Strong';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "concentration" text DEFAULT 'Extrait de Parfum';
```

---

## 3. Pilar 1: Infrastruktur Image Proxy & Normalizer (`Zero Broken Images`)

### 3.1. File Baru: `app/api/image/route.ts`
Streaming proxy dari S3 dengan resolusi MIME dinamis dan cache browser:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '@/lib/s3-storage'

const S3_BUCKET = process.env.S3_BUCKET || 'parfume'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')

  if (!key) {
    return new NextResponse('Missing key parameter', { status: 400 })
  }

  const sanitizedKey = key.replace(/^\/+/, '')
  if (!sanitizedKey.startsWith('uploads/')) {
    return new NextResponse('Forbidden key path', { status: 403 })
  }

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: sanitizedKey,
    })

    const s3Response = await s3Client.send(command)

    if (!s3Response.Body) {
      return new NextResponse('Not found', { status: 404 })
    }

    let contentType = s3Response.ContentType
    if (!contentType || contentType === 'application/octet-stream') {
      if (sanitizedKey.endsWith('.webp')) contentType = 'image/webp'
      else if (sanitizedKey.endsWith('.png')) contentType = 'image/png'
      else if (sanitizedKey.endsWith('.svg')) contentType = 'image/svg+xml'
      else contentType = 'image/jpeg'
    }

    const byteArray = await s3Response.Body.transformToByteArray()

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Content-Length': byteArray.byteLength.toString(),
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: any) {
    console.error(`[Image Proxy Error] Key: ${sanitizedKey}`, error?.message || error)
    return new NextResponse('Image not found or inaccessible', { status: 404 })
  }
}
```

### 3.2. File `lib/image-proxy.ts` (Full Drop-in Replacement)

```typescript
export function toProxyUrl(url: string | null | undefined): string {
  if (!url) return ''

  if (url.startsWith('/api/image') || (url.startsWith('/') && !url.includes('/uploads/'))) {
    return url
  }

  if (url.includes('is3.cloudhost.id/')) {
    const afterEndpoint = url.split('is3.cloudhost.id/')[1]
    const parts = afterEndpoint.split('/')
    const key = parts.slice(1).join('/')
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  if (url.includes('/uploads/')) {
    const key = 'uploads/' + url.split('/uploads/')[1]
    return `/api/image?key=${encodeURIComponent(key)}`
  }

  if (url.startsWith('uploads/')) {
    return `/api/image?key=${encodeURIComponent(url)}`
  }

  return url
}

export function getImageSrc(url: string | null | undefined): string {
  return toProxyUrl(url)
}
```

---

## 4. Pilar 2: Engine Direct WhatsApp Checkout dengan Master Admin Toggle

### 4.1. Update `features/cart/lib/message-generator.ts`

```typescript
export interface SingleProductOrderData {
  productName: string
  brand: string
  size: string
  quantity: number
  price: number
  productUrl: string
  storeWhatsApp: string
}

export function generateDirectWhatsAppOrderUrl(data: SingleProductOrderData): string {
  const cleanPhone = data.storeWhatsApp.replace(/\D/g, '').replace(/^0/, '62')
  if (!cleanPhone) return '#'

  const total = data.price * data.quantity
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(total)

  const text = 
`Halo *Best Parfume Store*, saya ingin memesan:

• *Produk:* ${data.productName}
• *Brand:* ${data.brand}
• *Ukuran:* ${data.size}
• *Jumlah:* ${data.quantity} botol
• *Total:* ${formattedTotal}

Apakah stok ini masih tersedia?
Link Produk: ${data.productUrl}`

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
}
```

### 4.2. Update `components/providers/StoreProvider.tsx`

```typescript
// Interface StoreSettings:
whatsappOrderButtonEnabled?: boolean

// Value provider mapping:
whatsappOrderButtonEnabled: settings.whatsapp_order_button_enabled === 'true',
```

### 4.3. Update `app/admin/settings/settings-form.tsx`

```tsx
<div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
  <div className="space-y-0.5">
    <Label htmlFor="whatsappOrderToggle" className="text-sm font-semibold text-foreground">
      Tombol "Beli Cepat via WhatsApp" di Halaman Produk
    </Label>
    <p className="text-xs text-muted-foreground">
      Jika aktif, pembeli dapat langsung memesan via WhatsApp di halaman detail produk.
    </p>
  </div>
  <input
    id="whatsappOrderToggle"
    type="checkbox"
    checked={formData.whatsappOrderButtonEnabled}
    onChange={(e) => setFormData({ ...formData, whatsappOrderButtonEnabled: e.target.checked })}
    className="w-5 h-5 accent-accent rounded cursor-pointer"
  />
</div>
```

---

## 5. Pilar 3: Olfactory Scent Pyramid (Top, Heart, Base Notes) 100% Database-Driven

### 5.1. File Baru: `components/product/ScentPyramid.tsx`
Komponen ini **HANYA merender piramida aroma jika admin telah menginput data aroma di database**. Dilarang menampilkan teks palsu jika data di database kosong:

```tsx
import { Sparkles, Clock, Wind, Award } from 'lucide-react'

interface ScentPyramidProps {
  topNotes?: string | null
  middleNotes?: string | null
  baseNotes?: string | null
  longevity?: string | null
  sillage?: string | null
  concentration?: string | null
  category?: string
}

export function ScentPyramid({
  topNotes,
  middleNotes,
  baseNotes,
  longevity,
  sillage,
  concentration,
  category,
}: ScentPyramidProps) {
  // Hanya tampilkan jika setidaknya satu tier aroma diisi di database
  const hasNotes = Boolean(topNotes || middleNotes || baseNotes)
  const hasSpecs = Boolean(longevity || sillage || concentration)

  if (!hasNotes && !hasSpecs) return null

  return (
    <div className="space-y-6 pt-6 border-t border-border/70">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          Piramida Aroma (Olfactory Notes)
        </h3>
        {concentration && (
          <span className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            {concentration}
          </span>
        )}
      </div>

      {/* 3-Tier Pyramid Card (Hanya muncul jika ada data di DB) */}
      {hasNotes && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topNotes && (
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  🍃 Top Notes
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">0 - 15 m</span>
              </div>
              <p className="text-xs font-semibold text-foreground/90 leading-snug">{topNotes}</p>
              <span className="text-[9px] text-muted-foreground block">Kesan wangi pertama saat disemprot</span>
            </div>
          )}

          {middleNotes && (
            <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                  🌺 Heart Notes
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">2 - 4 Jam</span>
              </div>
              <p className="text-xs font-semibold text-foreground/90 leading-snug">{middleNotes}</p>
              <span className="text-[9px] text-muted-foreground block">Karakter inti & aroma tubuh utama</span>
            </div>
          )}

          {baseNotes && (
            <div className="p-4 rounded-xl border border-amber-600/20 bg-amber-600/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  🪵 Base Notes
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">8 - 12 Jam</span>
              </div>
              <p className="text-xs font-semibold text-foreground/90 leading-snug">{baseNotes}</p>
              <span className="text-[9px] text-muted-foreground block">Jejak aroma mewah tahan seharian</span>
            </div>
          )}
        </div>
      )}

      {/* Fragrance Performance Metrics */}
      {hasSpecs && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {longevity && (
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Clock className="w-5 h-5 text-gold flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Ketahanan</span>
                <span className="text-xs font-bold text-foreground">{longevity}</span>
              </div>
            </div>
          )}

          {sillage && (
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3">
              <Wind className="w-5 h-5 text-gold flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Jarak Pancar</span>
                <span className="text-xs font-bold text-foreground">{sillage}</span>
              </div>
            </div>
          )}

          {concentration && (
            <div className="p-3 rounded-xl bg-card border border-border flex items-center gap-3 col-span-2 sm:col-span-1">
              <Award className="w-5 h-5 text-gold flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Konsentrasi</span>
                <span className="text-xs font-bold text-foreground">{concentration}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

---

## 6. Pilar 4: Form Input Piramida Aroma di Admin Produk (`/admin/products`)

### 6.1. Update `app/actions/products.ts`
Pastikan Server Action menerima dan menyimpan field aroma ke database:

```typescript
// Di createProduct() & updateProduct():
const topNotes = (formData.get('topNotes') as string || '').trim() || null
const middleNotes = (formData.get('middleNotes') as string || '').trim() || null
const baseNotes = (formData.get('baseNotes') as string || '').trim() || null
const longevity = (formData.get('longevity') as string || '8 - 12 Jam').trim()
const sillage = (formData.get('sillage') as string || 'Moderate to Strong').trim()
const concentration = (formData.get('concentration') as string || 'Extrait de Parfum').trim()

// Masukkan ke values insert/update:
topNotes,
middleNotes,
baseNotes,
longevity,
sillage,
concentration,
```

### 6.2. Update Form `app/admin/products/page.tsx`
Tambahkan seksi input "Piramida Aroma & Spesifikasi" di modal/form produk admin:

```tsx
<div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-4">
  <h3 className="text-sm font-bold text-foreground">✨ Piramida Aroma & Spesifikasi (Opsional)</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">🍃 Top Notes</label>
      <input
        type="text"
        name="topNotes"
        value={form.topNotes || ''}
        onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
        placeholder="Contoh: Bergamot, Mandarin, Pink Pepper"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">🌺 Heart Notes</label>
      <input
        type="text"
        name="middleNotes"
        value={form.middleNotes || ''}
        onChange={(e) => setForm({ ...form, middleNotes: e.target.value })}
        placeholder="Contoh: Damask Rose, Jasmine, Cedar"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">🪵 Base Notes</label>
      <input
        type="text"
        name="baseNotes"
        value={form.baseNotes || ''}
        onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
        placeholder="Contoh: Amber, Vanilla Bean, Musk"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">Ketahanan (Longevity)</label>
      <input
        type="text"
        name="longevity"
        value={form.longevity || '8 - 12 Jam'}
        onChange={(e) => setForm({ ...form, longevity: e.target.value })}
        placeholder="8 - 12 Jam"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">Jarak Pancar (Sillage)</label>
      <input
        type="text"
        name="sillage"
        value={form.sillage || 'Moderate to Strong'}
        onChange={(e) => setForm({ ...form, sillage: e.target.value })}
        placeholder="Moderate to Strong"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-1">Konsentrasi</label>
      <input
        type="text"
        name="concentration"
        value={form.concentration || 'Extrait de Parfum'}
        onChange={(e) => setForm({ ...form, concentration: e.target.value })}
        placeholder="Extrait de Parfum"
        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs"
      />
    </div>
  </div>
</div>
```

---

## 7. Pilar 5: Mobile Sticky Bottom Buy Bar (Detail Produk)

### 7.1. File Baru: `components/product/StickyBuyBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ShoppingCart, MessageCircle, Check } from 'lucide-react'

interface StickyBuyBarProps {
  productName: string
  selectedSize: string
  price: number
  stock: number
  onAdd: () => void
  added: boolean
  whatsappUrl?: string
  showWhatsAppButton?: boolean
}

export function StickyBuyBar({
  productName,
  selectedSize,
  price,
  stock,
  onAdd,
  added,
  whatsappUrl,
  showWhatsAppButton,
}: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 350)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible || stock <= 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border px-4 py-2.5 md:hidden flex items-center justify-between gap-3 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-bold text-foreground truncate">{productName}</span>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="px-1.5 py-0.2 rounded bg-secondary text-[10px] font-medium">{selectedSize}</span>
          <span>•</span>
          <span className="text-gold font-bold text-sm text-foreground">{formatCurrency(price)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showWhatsAppButton && whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-md"
            aria-label="Order via WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        )}

        <Button
          onClick={onAdd}
          className={`h-10 px-4 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md ${
            added ? 'bg-green-600 text-white' : 'bg-accent hover:bg-accent-hover text-white'
          }`}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Tersimpan
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              + Keranjang
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
```

---

## 8. Pilar 6: Trust Badges & Seksi Rekomendasi Produk Terkait ("You May Also Like")

### 8.1. Query `getRelatedProducts()` di `app/actions/products.ts`
Tambahkan fungsi query database untuk mengambil produk dengan brand yang sama:

```typescript
export async function getRelatedProducts(currentProductId: string, brand: string, limit: number = 4) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.brand, brand), ne(products.id, currentProductId)))
    .limit(limit)
}
```

### 8.2. File Baru: `components/product/RelatedProducts.tsx`

```tsx
import { ProductCard } from '@/components/shared/ProductCard'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
  stockData?: string
  sizes?: string
}

interface RelatedProductsProps {
  products: Product[]
  brandName: string
}

export function RelatedProducts({ products, brandName }: RelatedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-border/80 max-w-6xl mx-auto px-4 md:px-6">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">
            Koleksi Pilihan
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-foreground font-bold">
            Parfum Serupa dari {brandName}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
```

---

## 9. Pilar 7: Quick Size Pills & Stock Badges di Kartu Produk (`ProductCard.tsx`)

### 9.1. File `components/shared/ProductCard.tsx` (Full Drop-in Update)

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { getFirstSizePrice } from '@/lib/price'
import { getImageSrc } from '@/lib/image-proxy'

type ProductCardProps = {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
  stockData?: string
  sizes?: string
}

export function ProductCard({ product }: { product: ProductCardProps }) {
  const isSoldOut = (product.stock ?? 0) <= 0
  const isLowStock = !isSoldOut && (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5
  const displayPrice = getFirstSizePrice(product.stockData, product.sizes || '', product.price)
  const sizeList = product.sizes ? product.sizes.split(',').map((s) => s.trim()).filter(Boolean) : []

  return (
    <Link href={`/product/${product.id}`} className="group block h-full flex flex-col">
      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-secondary mb-3 border border-border/50 group-hover:border-gold/40 transition-colors">
        {product.image ? (
          <Image
            src={getImageSrc(product.image)}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No Image
          </div>
        )}

        {/* Watermark Overlay */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none select-none overflow-hidden opacity-[0.06]"
          aria-hidden="true"
        >
          <div
            className="absolute inset-[-50%] w-[200%] h-[200%] flex flex-wrap items-center justify-center gap-4 rotate-[-25deg]"
            style={{
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '3px',
              lineHeight: '2.5',
              color: 'white',
              wordSpacing: '20px',
            }}
          >
            {'BEST PARFUME STORE '.repeat(200)}
          </div>
        </div>

        {/* Badges */}
        {isSoldOut && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
            Habis
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-amber-500/90 backdrop-blur-sm text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow">
            Sisa {product.stock}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
          {product.brand}
        </p>
        <p className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-gold transition-colors mb-1">
          {product.name}
        </p>

        {/* Available Size Pills */}
        {sizeList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {sizeList.map((sz) => (
              <span
                key={sz}
                className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground border border-border/40"
              >
                {sz}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2">
          {displayPrice.hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(displayPrice.original)}
            </span>
          )}
          <p className="text-sm font-extrabold text-foreground">
            {formatCurrency(displayPrice.final)}
          </p>
        </div>
      </div>
    </Link>
  )
}
```

---

## 10. Pilar 8: Koreksi Tautan Kontak Header & WhatsApp Direct

### 10.1. Update `components/layout/Header.tsx`

```tsx
const { storeName, storeLogo, whatsapp } = useStoreSettings()
const cleanWa = whatsapp?.replace(/\D/g, '').replace(/^0/, '62')

const contactHref = cleanWa ? `https://wa.me/${cleanWa}?text=${encodeURIComponent('Halo Best Parfume Store, saya butuh bantuan konsultasi parfum.')}` : '/products'
```

---

## 11. Protokol Eksekusi & Pengujian Claude Code

### Urutan Eksekusi Wajib:
1. **Skema Database & Drizzle Migration**:
   * Update [db/schema.ts](file:///d:/parfume/db/schema.ts) dengan kolom aroma baru.
   * Eksekusi migration via Coolify / `npx drizzle-kit push`.
2. **Buat File Baru**:
   * `app/api/image/route.ts` (Streaming proxy S3).
   * `components/product/ScentPyramid.tsx` (Piramida wangi murni DB-driven).
   * `components/product/StickyBuyBar.tsx` (Mobile buy bar).
   * `components/product/RelatedProducts.tsx` (Related products).
3. **Update Core Helpers & Settings**:
   * `lib/image-proxy.ts` (Normalizer URL).
   * `features/cart/lib/message-generator.ts` (WhatsApp order URL helper).
   * `components/providers/StoreProvider.tsx` & `app/actions/settings.ts`.
   * `app/admin/settings/settings-form.tsx` (Toggle switch UI).
4. **Update Form Admin Produk & Actions**:
   * `app/actions/products.ts` (Simpan kolom notes & query related products).
   * `app/admin/products/page.tsx` (Input form aroma & spesifikasi).
5. **Update Komponen Visual Frontend**:
   * `components/product/ProductDetail.tsx` (Integrasi ScentPyramid DB, StickyBuyBar, TrustBadges, WA Direct button).
   * `components/shared/ProductCard.tsx` (Size pills & stock badges).
   * `components/home/GenderSplit.tsx` & `components/home/ScentCards.tsx` (Bungkus `getImageSrc`).
   * `components/layout/Header.tsx` (Kontak WhatsApp).
6. **Verifikasi Build & Test**:
   * Jalankan:
     ```bash
     npm run build
     ```
     *Wajib exit code 0 tanpa error tipe TypeScript.*
7. **Perbarui Knowledge Graph**:
   * Jalankan:
     ```text
     /auto-graphify
     ```

---
*Dokumen ini adalah cetak biru teknis resmi untuk Scale Project Part 2. Jalankan eksekusi sesuai instruksi di atas.*
