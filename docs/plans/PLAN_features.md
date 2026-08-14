---
aliases: [plan-features, roadmap]
tags: [plan]
last_updated: 2026-08-14
---

# Plan: 7 Fitur Baru

## Context

Toko parfume reseller sudah punya fondasi kuat: produk, cart, checkout, War/FOMO, admin panel, integrasi Telegram/WA. Sekarang perlu fitur yang meningkatkan **conversion rate**, **SEO**, dan **customer experience**.

## Fitur yang Dikerjakan

| # | Fitur | Prioritas | Estimasi |
|---|-------|-----------|----------|
| 1 | Stock Alert / "Habis" Badge | 🔴 Tinggi | 0.5 hari |
| 2 | Wishlist / Favorite | 🔴 Tinggi | 2 hari |
| 3 | Search Improvement (autocomplete) | 🟡 Sedang | 1.5 hari |
| 4 | Product Comparison | 🟡 Sedang | 2 hari |
| 5 | Blog / Content Page | 🟡 Sedang | 2 hari |
| 6 | Gift Wrapping Option | 🟡 Sedang | 1 hari |
| 7 | SEO Meta Tags (OG + Structured Data) | 🟡 Sedang | 1 hari |

**Total estimasi: ~10 hari**

---

## 1. Stock Alert / "Habis" Badge

### Current State
- `products.stock` field ada (integer, default 0)
- `stockData` JSON per-size stock
- `ProductDetail.tsx` line 212: `{product.stock > 0 ? '${product.stock} in stock' : 'Out of stock'}`
- `StoreGrid.tsx`: TIDAK ada badge "habis" — produk tetap tampil tanpa indikasi sold out
- Add-to-cart button: `disabled={product.stock <= 0}` — sudah benar

### Yang Perlu Dibuat

**a) "Habis" badge di StoreGrid (homepage + /products)**
```
File: components/home/StoreGrid.tsx
- Cek stock === 0 atau semua size dalam stockData === 0
- Tampilkan badge merah "HABIS" di pojok kanan atas card
- Overlay gelap 50% opacity di atas gambar
- Add-to-cart button tersembunyi atau disabled
```

**b) "Sisa X" badge untuk stok rendah**
```
File: components/home/StoreGrid.tsx
- Jika stock > 0 && stock <= 5: badge kuning "Sisa {stock}"
- Style: badge kecil di pojok card
```

**c) "Habis" badge di ProductDetail**
```
File: components/product/ProductDetail.tsx
- Large badge "STOK HABIS" di area gambar
- Tombol "Beritahu Saya Saat Tersedia" (opsional, bisa waitlist di fase berikut)
- Hide quantity selector kalau stok 0
```

**d) Filter "Stok Tersedia" di /products**
```
File: app/products/page.tsx
- Toggle: "Tampilkan semua" / "Hanya yang tersedia"
- Default: tampilkan semua (agar SEO tetap index semua produk)
```

### Schema
Tidak perlu perubahan schema — `stock` dan `stockData` sudah ada.

### Edge Cases
- Product dengan beberapa size, beberapa habis, beberapa tidak → tampilkan "Sisa X" berdasarkan total stock
- War products: stock war terpisah dari product stock → cek `source === 'war'` untuk badge

---

## 2. Wishlist / Favorite

### Current State
- Tidak ada wishlist — customer harus langsung add to cart
- Cart pakai Zustand + localStorage
- Tidak ada user account system untuk customer (hanya admin)

### Yang Perlu Dibuat

**a) Schema baru: `wishlist` table**
```typescript
// db/schema.ts
export const wishlist = pgTable("wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  sessionId: text("session_id").notNull(), // anonymous: UUID from localStorage
  createdAt: timestamp("created_at").defaultNow(),
});
```
> Catatan: Tanpa login system, pakai `sessionId` (random UUID di localStorage) sebagai identifier.

**b) Server Actions: `app/actions/wishlist.ts`**
```
toggleWishlist(productId, sessionId)   → add/remove
getWishlist(sessionId)                 → list products
getWishlistCount(sessionId)            → count
```

**c) Heart icon di ProductCard dan ProductDetail**
```
File: components/home/StoreGrid.tsx
- Heart icon (outline) di pojok kanan atas card
- Klik → toggle (outline ↔ filled red)
- Animated fill (CSS transition)

File: components/product/ProductDetail.tsx
- Heart button di area product info
- Label: "Tambah ke Wishlist" / "Hapus dari Wishlist"
```

**d) Wishlist page: `/wishlist`**
```
File: app/wishlist/page.tsx (new)
- Grid layout seperti /products
- Hanya tampilkan produk yang di-wishlist
- Kosong → "Belum ada produk favorit" + link ke /products
- Heart icon untuk remove
```

**e) Badge counter di Header**
```
File: components/layout/Header.tsx
- Heart icon di row 1 (sebelah cart)
- Badge counter jumlah wishlist
```

**f) CartDrawer integration**
```
File: features/cart/components/CartDrawer.tsx
- Jika produk di-wishlist juga ada di cart → tampilkan badge "❤️ di wishlist"
```

### Schema
| Table | Field | Type |
|-------|-------|------|
| `wishlist` | id | uuid PK |
| | productId | uuid FK → products |
| | sessionId | text (anonymous user) |
| | createdAt | timestamp |

### Migration
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

### Future Enhancement
- Jika login system ditambah → ganti `sessionId` dengan `userId`
- Push notification via Telegram kalau wishlist product turun harga

---

## 3. Search Improvement (Autocomplete)

### Current State
- `StoreGrid.tsx`: Filter by `p.name.includes(q) || p.brand.includes(q)` — simple string match
- `app/products/page.tsx`: Sama — hanya name + brand
- Tidak ada autocomplete, search hanya client-side filtering
- Tidak search by tags, description, atau category

### Yang Perlu Dibuat

**a) Expand search scope**
```
File: components/home/StoreGrid.tsx
- Tambah search by: name, brand, category (scent family), tags, description
- Prioritas: name > brand > category > tags > description

File: app/products/page.tsx
- Sama: expand search scope
```

**b) Autocomplete dropdown**
```
File: components/search/SearchAutocomplete.tsx (new)
- Input dengan dropdown hasil
- Max 8 suggestions
- Setiap suggestion: gambar kecil + nama + brand + harga
- Klik → navigate ke /product/[id]
- Keyboard navigation: arrow keys + Enter
- Debounce 300ms (tidak perlu API call, client-side)
```

**c) Recent searches**
```
File: components/search/SearchAutocomplete.tsx
- Simpan 5 search terakhir di localStorage
- Tampilkan saat input focused (sebelum typing)
- X button untuk clear individual
```

**d) "Popular" suggestions**
```
File: components/search/SearchAutocomplete.tsx
- Jika belum ketik apa-apa → tampilkan "Populer" (isBestSeller products)
```

**e) Search highlight**
```
File: components/home/StoreGrid.tsx + app/products/page.tsx
- Matched text di-highlight kuning di result
```

### Approach
Tetap client-side (tanpa API) — dataset kecil (16 produk sekarang, max ~200). Tidak perlu Algolia/ElasticSearch.

---

## 4. Product Comparison

### Current State
- Tidak ada fitur comparison
- Customer harus buka tab berbeda untuk bandingkan

### Yang Perlu Dibuat

**a) Compare button di ProductCard**
```
File: components/home/StoreGrid.tsx
- Checkbox/icon "Compare" di pojok kiri bawah card
- Max 3 produk bisa dipilih
- Floating bar muncul di bawah: "Bandingkan 2/3 produk" (sticky)
```

**b) Compare bar (floating)**
```
File: components/compare/CompareBar.tsx (new)
- Sticky bottom bar
- Tampilkan thumbnail 3 produk terpilih
- "Bandingkan" button → navigasi ke /compare?id=1,2,3
- "Hapus" per item
- CSS: slide-up animation
```

**c) Compare page: `/compare`**
```
File: app/compare/page.tsx (new)
- Read IDs from query params (?id=x,y,z)
- Fetch products from DB
- Tampilkan tabel perbandingan side-by-side

Kolom perbandingan:
| Field | Detail |
|-------|--------|
| Gambar | Product images |
| Nama | Product name |
| Brand | Brand |
| Harga | Price (per size) |
| Scent Family | Category |
| Gender | Gender |
| Deskripsi | Description |
| Stok | Stock per size |
| Tags | Tags |
| Rating | Avg rating dari testimonials |
| Best Seller | Badge |
```

**d) Share comparison**
```
- Copy link: /compare?id=1,2,3
- Bisa share ke WhatsApp/Teman
```

### Schema
Tidak perlu schema baru — data semua dari `products` table.

### URL Design
```
/compare?id=uuid1,uuid2,uuid3
- Max 3 IDs
- Invalid ID → skip, show error toast
```

---

## 5. Blog / Content Page

### Current State
- Tidak ada blog/content infrastructure
- Sitemap hanya punya `/` dan `/products`
- Metadata deskripsi masih generic ("Production-ready Next.js E-Commerce template.")

### Yang Perlu Dibuat

**a) Schema: `posts` table**
```typescript
// db/schema.ts
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(), // Markdown
  coverImage: text("cover_image"),
  category: text("category"), // "Care Tips", "Scent Guide", "News"
  tags: text("tags").default(""),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
```

**b) Blog listing page: `/blog`**
```
File: app/blog/page.tsx (new)
- Grid cards: cover image + title + excerpt + category + date
- Filter by category
- Pagination (10 per page)
```

**c) Blog detail page: `/blog/[slug]`**
```
File: app/blog/[slug]/page.tsx (new)
- Server component
- Render markdown content
- Share buttons (WA, copy link)
- "Related posts" section
- Back to blog link
```

**d) Admin: Blog management**
```
File: app/admin/blog/page.tsx (new)
- CRUD posts
- Markdown editor (textarea + preview)
- Publish/draft toggle
- Cover image upload
```

**e) Blog section di Homepage**
```
File: components/home/BlogSection.tsx (new)
- "Artikel Terbaru" — max 3 posts
- Grid: cover + title + excerpt + "Baca Selengkapnya"
```

**f) Sitemap update**
```
File: app/sitemap.ts
- Tambah /blog listing
- Tambah semua /blog/[slug] (dynamic dari DB)
```

**g) Content ideas (seed data)**
```
1. "Cara Merawat Parfum Agar Tahan Lama" — Care Tips
2. "Panduan Scent Family: Fresh, Floral, Woody, Amber" — Scent Guide
3. "Perbedaan EDP, EDT, dan Eau de Parfum" — Education
4. "5 Parfum Best Seller untuk Pria" — Recommendation
5. "Tips Memilih Parfum Sesuai Musim" — Guide
```

### Schema
| Table | Field | Type |
|-------|-------|------|
| `posts` | id | uuid PK |
| | title | text NOT NULL |
| | slug | text UNIQUE NOT NULL |
| | excerpt | text |
| | content | text NOT NULL (Markdown) |
| | coverImage | text |
| | category | text |
| | tags | text |
| | published | boolean |
| | createdAt | timestamp |
| | updatedAt | timestamp |

---

## 6. Gift Wrapping Option

### Current State
- Checkout (`CartClient.tsx`) 3-step: Shipping → Payment → Review
- Tidak ada gift wrapping option
- Order total dihitung di `lib/shipping.ts` → `calculateOrderTotal()`

### Yang Perlu Dibuat

**a) Schema: tambah field di `orders` table**
```typescript
// db/schema.ts — tambah ke orders
giftWrap: boolean("gift_wrap").default(false),
giftWrapNote: text("gift_wrap_note"), // pesan untuk penerima
```

**b) Gift wrap toggle di Checkout (Step 3: Review)**
```
File: app/cart/CartClient.tsx
- Di Step 3 (Review Order), tambah section "Gift Wrapping"
- Toggle: "Kirim sebagai hadiah 🎁"
- Jika aktif:
  - Input: "Pesan untuk penerima" (textarea, max 200 char)
  - Preview: card wrapping (visual indicator)
  - Biaya: +Rp 15.000 (configurable via settings)
```

**c) Settings: Gift wrap price**
```
File: app/admin/settings/settings-form.tsx
- Section baru atau tambah di Contact:
  "Gift Wrapping: Rp [input] per paket"
- Default: Rp 15.000
- Key: giftWrapPrice
```

**d) Total calculation update**
```
File: lib/shipping.ts
- `calculateOrderTotal()` tambah parameter: `giftWrap: boolean, giftWrapPrice: number`
- Jika giftWrap: total += giftWrapPrice
```

**e) Order display**
```
File: app/invoice/[id]/page.tsx
- Jika ada giftWrap: tampilkan badge 🎁 "Gift Wrapping" + note
- File: app/admin/orders/page.tsx
- Tampilkan icon 🎁 di order list jika ada giftWrap
```

**f) Telegram notification update**
```
File: features/cart/lib/message-generator.ts
- Tambah gift wrap info ke order message
- "🎁 Gift Wrapping: Ya (+Rp 15.000)"
- "Pesan: [giftWrapNote]"
```

### Schema Change
| Table | Field | Type |
|-------|-------|------|
| `orders` | gift_wrap | boolean, default false |
| | gift_wrap_note | text (nullable) |

### Migration
```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## 7. SEO Meta Tags (OG + Structured Data)

### Current State
- `app/layout.tsx`: Global metadata — title template "%s | E-Commerce Store", description generic
- `app/sitemap.ts`: Hanya `/` dan `/products` (2 URLs)
- `app/robots.ts`: Sudah ada, allow all except `/admin/`
- Tidak ada OG image, tidak ada structured data (JSON-LD)
- Product detail page: TIDAK ada per-page metadata
- Blog (belum ada): nanti perlu juga

### Yang Perlu Dibuat

**a) Global metadata update**
```
File: app/layout.tsx
- Title: "Parfume Store" (dari settings, tapi fallback hardcoded)
- Description: "Parfum branded original. Dior, Chanel, Tom Ford & lebih. Free ongkir untuk 2+ item."
- Open Graph: default image, site name, locale (id_ID)
```

**b) Product page metadata**
```
File: app/product/[id]/page.tsx
- Gunakan `generateMetadata()` (server component)
- Dynamic: title, description, OG image (product image), OG type: "product"
- Keywords: brand, name, category

export async function generateMetadata({ params }) {
  const product = await getProduct(id)
  return {
    title: `${product.brand} ${product.name}`,
    description: product.description,
    openGraph: {
      title: `${product.brand} ${product.name}`,
      description: product.description,
      images: [{ url: product.image, width: 800, height: 600 }],
      type: 'website',
    },
  }
}
```

**c) Products listing page metadata**
```
File: app/products/page.tsx
- export const metadata = {
    title: 'Katalog Parfum',
    description: 'Jelajahi koleksi parfum branded original...',
  }
```

**d) Homepage metadata**
```
File: app/page.tsx
- export const metadata = {
    title: 'Parfume Store — Parfum Branded Original',
    description: 'Toko parfum original...',
    openGraph: { ... }
  }
```

**e) JSON-LD Structured Data (Product)**
```
File: app/product/[id]/page.tsx
- Tambah script tag JSON-LD untuk Product schema:

{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Dior Sauvage",
  "brand": { "@type": "Brand", "name": "Dior" },
  "image": "...",
  "description": "...",
  "offers": {
    "@type": "Offer",
    "price": "1850000",
    "priceCurrency": "IDR",
    "availability": "https://schema.org/InStock",
    "seller": { "@type": "Organization", "name": "Parfume Store" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "6"
  }
}
```

**f) JSON-LD Structured Data (Organization)**
```
File: app/layout.tsx
- Global Organization schema:

{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Parfume Store",
  "url": "...",
  "logo": "...",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Indonesian"
  }
}
```

**g) Sitemap improvement**
```
File: app/sitemap.ts
- Dynamic: fetch all published products + posts from DB
- Include: /, /products, /blog, /blog/[slug], /product/[id]
- Priority: homepage=1, products=0.8, product=0.9, blog=0.7
```

**h) Breadcrumb structured data**
```
- Homepage: Home
- /products: Home > Katalog
- /product/[id]: Home > Katalog > [Brand] [Name]
- /blog: Home > Artikel
- /blog/[slug]: Home > Artikel > [Title]
```

---

## Execution Order

```
Phase 1 (Quick wins, 1 hari):
  ├── #1 Stock Alert / "Habis" Badge
  └── #7 SEO Meta Tags (start with global + product page)

Phase 2 (Core features, 4 hari):
  ├── #3 Search Improvement
  ├── #6 Gift Wrapping Option
  └── #7 SEO Meta Tags (JSON-LD + sitemap)

Phase 3 (Engagement, 5 hari):
  ├── #2 Wishlist / Favorite
  ├── #4 Product Comparison
  └── #5 Blog / Content Page

Phase 4 (Polish):
  ├── Cross-feature integration (wishlist × comparison × search)
  └── Testing & optimization
```

## Files Changed (Summary)

| Fitur | New Files | Modified Files | Schema Change |
|-------|-----------|---------------|---------------|
| #1 Stock Alert | — | StoreGrid, ProductDetail, products/page | No |
| #2 Wishlist | wishlist page, store, actions | Header, StoreGrid, ProductDetail, CartDrawer | Yes (new table) |
| #3 Search | SearchAutocomplete component | StoreGrid, products/page | No |
| #4 Comparison | compare page, CompareBar | StoreGrid | No |
| #5 Blog | blog pages, admin blog, BlogSection | sitemap.ts, page.tsx (homepage) | Yes (new table) |
| #6 Gift Wrap | — | CartClient, settings-form, orders, invoice, shipping, message-generator | Yes (add fields) |
| #7 SEO | — | layout.tsx, product/[id]/page, products/page, sitemap.ts | No |

## Verification

1. `npm run build` → 0 errors
2. `npm run lint` → 0 warnings
3. Manual test semua flow:
   - Produk stok 0 → badge "HABIS" muncul, add-to-cart disabled
   - Wishlist: tambah/hapus, refresh page → persist, counter update
   - Search: ketik "dior" → autocomplete muncul, "floral" → filter by scent family
   - Compare: pilih 2-3 produk → halaman comparison lengkap
   - Blog: list page, detail page, admin CRUD
   - Gift wrap: toggle di checkout → total update, invoice tampil, Telegram notif
   - SEO: view source product page → OG tags + JSON-LD present
4. Google Rich Results Test → Product structured data valid

---

*See also: [[PROJECT_OVERVIEW]], [[FLOW_products]], [[FLOW_cart]], [[FLOW_checkout]]*

---

*Back to [[00-index]]*
