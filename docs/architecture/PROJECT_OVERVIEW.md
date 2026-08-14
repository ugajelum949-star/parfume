---
aliases: [overview, stack, setup]
tags: [architecture]
last_updated: 2026-08-14
---

# Project Overview

## What Is This?

**Parfume Store** — toko online parfum reseller untuk pasar Indonesia. Menjual parfum branded internasional (Dior, Chanel, Tom Ford, Creed, dll) dengan sistem FOMO "War" (product drop) yang unik.

**Business Model**: Reseller — membeli dari distributor/supplier, menjual kembali dengan markup.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| React | React 19.2 |
| ORM | Drizzle ORM 0.45 |
| Database | PostgreSQL (via `postgres` driver) |
| Styling | TailwindCSS v4 + shadcn/ui (New York) |
| Fonts | Inter + DM Serif Display (Google Fonts) |
| State | Zustand 5 (persist middleware) |
| Storage | AWS S3-compatible (IDCloudHost) |
| Image Processing | sharp (watermark) |
| Auth | Cookie-based (httpOnly, secure, sameSite: strict, 7-day expiry) |
| Caching | ISR (revalidate 60s homepage) |
| Animations | CSS only (no framer-motion) |
| Messaging | Telegram Bot API, WhatsApp deep links |
| Security | Rate limiting, DOMPurify, UUID validation |
| Deploy | Docker (standalone) / Coolify |

## Project Structure

```
├── app/
│   ├── actions/        # Server Actions (auth, products, upload, settings, orders, payment, wars, posts, banners, shipping-config)
│   ├── admin/          # Admin panel (9 sections)
│   ├── api/            # Route handlers (order/proof, order/[id], payment-methods, settings)
│   ├── blog/           # Blog listing + [slug] detail
│   ├── cart/           # Checkout page (CartClient)
│   ├── compare/        # Product comparison page
│   ├── invoice/[id]/   # Invoice with payment proof upload
│   ├── login/          # Admin login
│   ├── product/[id]/   # Product detail
│   ├── products/       # Products with search/filter/sort
│   └── wishlist/       # Wishlist page
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Header (single-row), Footer, BottomNav
│   ├── home/           # MarqueeBar, StoreGrid, WarSection, TestimonialsSection, BlogSection, ScentCards, GenderSplit, PopularSection, BannerCarousel
│   ├── product/        # ProductDetail, ProductTestimonials
│   ├── compare/        # CompareBar
│   ├── wishlist/       # WishlistContent
│   ├── providers/      # StoreProvider, ProtectionProvider
│   └── shared/         # ProductCard, ClientOverlays, ScrollToTop
├── db/
│   └── schema.ts       # Drizzle schema (12 tables + relations)
├── features/
│   ├── cart/           # Zustand store + CartDrawer + message generators
│   ├── compare/        # Compare store
│   └── wishlist/       # Wishlist store
├── lib/                # DB singleton, S3, config, shipping, telegram, rate limiter, watermark, price
├── scripts/            # Admin init, seed data, seed shipping config
└── tests/              # DB connection test, S3 test
```

## Routes

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Homepage — marquee, hero, popular tabs, scent cards, gender split, testimonials, blog, trust strip | Public |
| `/products` | Products — search, category/brand/gender filter, sort | Public |
| `/product/[id]` | Product detail — image, sizes, add to cart, reviews | Public |
| `/blog` | Blog listing | Public |
| `/blog/[slug]` | Blog post detail (markdown rendered) | Public |
| `/compare` | Product comparison | Public |
| `/wishlist` | Wishlisted products | Public |
| `/cart` | Checkout — 3-step form (shipping, payment, review) | Public |
| `/invoice/[id]` | Invoice — order info, payment proof upload, confirmation buttons | Public |
| `/login` | Admin login (hidden from nav) | Public |
| `/admin/dashboard` | Admin dashboard | Admin |
| `/admin/products` | Product CRUD | Admin |
| `/admin/orders` | Order management | Admin |
| `/admin/wars` | War/drop management | Admin |
| `/admin/banners` | Homepage banner management | Admin |
| `/admin/blog` | Blog post management | Admin |
| `/admin/testimonials` | Testimonial management | Admin |
| `/admin/payment-methods` | Payment methods | Admin |
| `/admin/settings` | Store settings (6 sections) | Admin |
| `/api/settings` | Settings API (sensitive keys filtered) | Public |
| `/api/order/proof` | Payment proof upload + Telegram (rate limited) | Public |
| `/api/order/[id]` | Order API (sanitized, rate limited) | Public |
| `/api/payment-methods` | Payment methods API (account numbers filtered) | Public |

## Homepage Sections (in order)

1. **Marquee Bar** — scrolling promo text
2. **Header** — single-row, sticky, backdrop blur
3. **Hero** — full-width image with gradient overlay, headline, CTA
4. **War Drops** — active/scheduled wars with countdown (if any)
5. **Banners** — carousel (if any)
6. **Most Popular + Sale** — tabbed product grid (PopularSection)
7. **Scent Family Cards** — Fresh/Floral/Woody/Amber exploration
8. **For Him / For Her** — gender-split product sections
9. **Testimonials** — 2-row marquee (top: RTL, bottom: LTR)
10. **Blog** — latest posts (if any)
11. **Trust Strip** — pills: 100% Original, Gratis Ongkir, etc.
12. **Footer** — 3-column: Kategori, Bantuan, Hubungi

## Key Features

### Storefront
- **Single-row header** — logo, nav links, search/wishlist/cart icons
- **BottomNav** — Home, Products, Cart (badge) on mobile
- **Toast notifications** — "Ditambahkan ke keranjang ✓" on add-to-cart
- **Product cards** — `aspect-[4/5]`, brand/name/price, `scale-[1.02]` hover
- **Anti-screenshot** — ProtectionProvider on public pages

### Products
- **Per-size pricing** — `stockData` JSON with `prices` and `salePrices` per size
- **Post-war pricing** — `getPostWarPrice()` ×1.7 for 7 days after war ends
- **URL params** — `?category=Fresh`, `?gender=Men` auto-filter products page
- **Sort** — Terbaru, Harga Terendah/Tertinggi, Nama A-Z, Terlaris

### Cart & Checkout
- **Zustand cart** — localStorage persistence (`shopping-cart-storage`)
- **Toast on add** — no auto-open drawer
- **3-step checkout** — Shipping Info → Payment → Review Order
- **Invoice** — payment proof upload (JPEG/PNG/WebP, max 20MB) → Telegram notification

### Admin
- **9 sections** — Dashboard, Products, Orders, Wars, Banners, Blog, Reviews, Payments, Settings
- **Homepage Images** — 8 upload fields in Settings for hero/gender/scent images
- **Blog** — markdown content with DOMPurify sanitization
- **Per-size pricing** — stockData JSON editor in product form

### Security
- Rate limiting on all public API endpoints
- Order proof: UUID validation + status check
- Settings API: sensitive keys filtered (telegramBotToken, telegramChatId)
- Payment methods API: account numbers filtered
- DOMPurify on blog content
- Session: httpOnly + secure + sameSite: strict + 7-day expiry

---

*Technical details → `CLAUDE.md` at project root*

*See also: [[DATABASE_SCHEMA]], [[DESIGN_SYSTEM]], [[ADMIN_GUIDE]], [[PLAN_security]]*

---

*Back to [[00-index]]*
