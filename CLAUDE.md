# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

Parfume Store — Indonesian e-commerce parfum reseller. Next.js 16 (App Router), PostgreSQL (Drizzle ORM), TailwindCSS v4, Zustand, S3 (IDCloudHost), Telegram Bot. Deployed via Coolify. CSS animations only (no framer-motion).

> Full business context, features, and project scope → [[docs/PROJECT_OVERVIEW]]

## Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build (standalone output)
npm run lint             # ESLint
npm run seed             # Seed DB with dummy data
npm run test:conn        # Test DB connection
npm run test:s3          # Test S3 upload
npx drizzle-kit generate # Generate migration SQL
npx drizzle-kit push     # Push schema to DB
npx tsx scripts/admin/init_admin.ts  # Create admin user
```

## Technical Architecture

### Data Layer (`db/schema.ts`, `lib/db.ts`)

Drizzle ORM with PostgreSQL. Schema in single `db/schema.ts`. Connection singleton in `lib/db.ts` (postgres.js, max 5 connections). UUID PKs throughout.

Tables: `users`, `products`, `productImages`, `orders`, `orderItems`, `paymentMethods`, `testimonials`, `banners`, `settings` (key-value), `wars`, `warItems`, `posts`.

Products support up to 5 images (1 main + 4 extra via `productImages`). Brand is free text input with a `BRANDS` constant in `lib/config.ts` for autocomplete suggestions. Scent families: 4 only (Fresh, Floral, Woody, Amber) via `lib/config.ts`. Config also has `GENDERS`, `SIZE_PRESETS`, `GIFT_WRAP_PRICE` (15,000 IDR).

**Product pricing uses `stockData` JSON** (`lib/price.ts`): `stockData` is a JSON string on the `products` table with shape `{ prices: { "50ml": 250000 }, salePrices: { "50ml": 200000 } }`. This enables per-size pricing and per-size sale prices. Key helpers in `lib/price.ts`: `getSizePrice()`, `getFirstSizePrice()`, `parseAllSizePrices()`. If `stockData.prices` is empty, falls back to `products.price`.

`posts` table stores blog content with categories: Care Tips, Scent Guide, News, Recommendation. Slug-based routing.

### Config & Utilities (`lib/config.ts`, `lib/utils.ts`, `lib/ratelimit.ts`)

- `config.ts` — `SCENT_FAMILIES`, `GENDERS`, `SIZE_PRESETS` (Standard/Mini presets), `BRANDS` (16 popular perfume brands), `GIFT_WRAP_PRICE`
- `shipping.ts` — `SHIPPING_ZONES` (8 zones, 30 provinces), `SHIPPING_SERVICES`, zone-based shipping calculator, promo thresholds (qty 2+ free, 3+/5+ bundle)
- `ratelimit.ts` — rate limiter helper for login and API endpoints
- `utils.ts` — `formatCurrency()` (IDR), `cn()` (clsx + tailwind-merge)
- `price.ts` — per-size pricing from stockData JSON (original/sale/final price per size)
- `watermark.ts` — tiled logo watermark on payment proof images via sharp (4% opacity)
- `s3-storage.ts` — S3 upload/delete helpers using IDCloudHost

### Auth Model (`app/actions/auth.ts`)

Cookie-based session (UUID in `auth_session` cookie, httpOnly/secure/sameSite, **7-day expiry**). `verifyAdmin()` checks cookie + DB on every protected action. Admin layout (`app/admin/layout.tsx`) guards `/admin/*` routes. Login rate-limited: 5 attempts/min/IP.

**Admin login is hidden from public nav** — only accessible via `/login` URL.

### Server Actions (`app/actions/`)

- `auth.ts` — login, logout, verifyAdmin
- `products.ts` — CRUD with revalidatePath
- `upload.ts` — server-side base64 image processing (no presigned URLs)
- `settings.ts` — key-value store, form sanitization (WhatsApp phone, Telegram username), 6 sections: Store Info, Contact, Floating Chat, Confirmation Buttons, Telegram Bot, **Homepage Images** (8 upload fields: hero, gender, scent)
- `orders.ts` — order creation, listing, payment methods
- `payment.ts` — payment method CRUD, QRIS image upload
- `testimonials.ts` — testimonial CRUD with revalidatePath
- `wars.ts` — war CRUD, auto-conversion to products, stock decrement
- `posts.ts` — blog post CRUD with slug generation
- `banners.ts` — banner CRUD with ordering
- `shipping-config.ts` — shipping configuration management

All mutations via `'use server'`. Admin actions call `verifyAdmin()`.

### API Routes (`app/api/`)

All public API routes have **rate limiting** via `lib/ratelimit.ts`.

- `api/order/[id]/route.ts` — order retrieval (sanitized: no PII), rate limited (10/min/IP), UUID validation
- `api/order/proof/route.ts` — payment proof upload (JPEG/PNG/WebP, max 20MB), rate limited (5/min/IP), order status check (only PENDING/PAID)
- `api/payment-methods/route.ts` — active methods only (account numbers filtered), rate limited (30/min/IP)
- `api/settings/route.ts` — settings (telegramBotToken/ChatId filtered), rate limited (30/min/IP)

### UI Components

- **Header** (`components/layout/Header.tsx`) — Single-row: logo + nav (Home/Produk/Kontak) + icons (Search/Heart/Cart). Sticky with backdrop blur. Mobile: hamburger + logo + icons.
- **BottomNav** (`components/layout/BottomNav.tsx`) — Mobile only: Home, Produk, Cart (with badge).
- **Footer** (`components/layout/Footer.tsx`) — 3-column: Kategori, Bantuan, Hubungi (WhatsApp/Telegram/Email).
- **MarqueeBar** (`components/home/MarqueeBar.tsx`) — Scrolling promo banner at top.
- **PopularSection** (`components/home/PopularSection.tsx`) — Tabbed product grid (Most Popular / Sale).
- **ScentCards** (`components/home/ScentCards.tsx`) — 4 scent family exploration cards.
- **GenderSplit** (`components/home/GenderSplit.tsx`) — For Him / For Her product sections.
- **ProductCard** (`components/shared/ProductCard.tsx`) — Reusable card: `aspect-[4/5]`, brand/name/price.
- **StoreGrid** (`components/home/StoreGrid.tsx`) — Product grid with category filter, search, add-to-cart (toast).
- **WarSection** (`components/home/WarSection.tsx`) — Active wars with countdown, coming soon mode.
- **TestimonialsSection** (`components/home/TestimonialsSection.tsx`) — 2-row marquee (no middle row). Top: RTL, bottom: LTR faster.
- **ProductDetail** (`components/product/ProductDetail.tsx`) — Size selector, add-to-cart (toast), per-size pricing, reviews.
- **ProductTestimonials** (`components/product/ProductTestimonials.tsx`) — Product-level reviews marquee.
- **CartDrawer** (`features/cart/components/CartDrawer.tsx`) — Minimal slide-out. No auto-open.
- **CartClient** (`app/cart/CartClient.tsx`) — 3-step checkout: shipping, payment, review.
- **InvoiceClient** (`app/invoice/[id]/InvoiceClient.tsx`) — Payment proof upload, confirmation buttons.
- **SettingsForm** (`app/admin/settings/settings-form.tsx`) — 6-section settings including Homepage Images (8 fields).
- **PostEditor** (`app/admin/blog/`) — Blog post CRUD with markdown + DOMPurify.
- **ScrollReveal** (`components/shared/ScrollReveal.tsx`) — IntersectionObserver fade-in.
- **StoreProvider** (`components/providers/StoreProvider.tsx`) — Context: storeName, storeLogo, storeSlogan, supportEmail, whatsapp, telegramUsername.
- **ProtectionProvider** (`components/providers/ProtectionProvider.tsx`) — Anti-screenshot on public pages.

### Cart Flow

Zustand store (`features/cart/store.ts`) with localStorage persistence (`shopping-cart-storage`). **Toast on add-to-cart** (`toast.success('Ditambahkan ke keranjang ✓')`). CartDrawer only opens via `/cart` link or BottomNav. War products tracked via `source: 'war'` + `warItemId` fields.

Additional stores: `features/compare/store.ts` (product comparison), `features/wishlist/store.ts` (wishlisted products).

### Shipping Module (`lib/shipping.ts`)

8 shipping zones with 30 Indonesian province mappings. 3 shipping services (Reguler, Instant, Next Day) with zone-dependent availability. Promo thresholds: qty 2+ free shipping, 3+/5+ bundle (same result). `calculateOrderTotal()` computes final cost including customization fee and transfer discount (hardcoded in `lib/shipping.ts`, separate `app/actions/shipping-config.ts` for DB-configurable version).

### Telegram Integration (`lib/telegram.ts`)

`sendTelegramMessage()` and `sendTelegramPhoto()` for bot notifications. Payment proof photos forwarded to admin chat on upload. Configured via admin Settings (bot token + chat ID).

### Message Generators (`features/cart/lib/message-generator.ts`)

Four text/order helpers in `features/cart/lib/message-generator.ts`:
- `generateWhatsAppOrderText()` — URL-encoded for WA deep links
- `generateTelegramOrderText()` — Plain text for TG messages
- `generateTransferOrderText()` — Includes bank details
- `getTelegramUrl()` — generates `t.me/` URL with encoded text

### Post-War Pricing (`lib/price.ts`)

Runtime pricing for war-converted products:
- `getPostWarPrice(warPrice, launchedAt)` — If `warPrice` + `launchedAt` exists and < 7 days old → returns `warPrice × 1.7`
- After 7 days → returns null, falls back to normal `products.price`

### Build & Deploy

- `next.config.ts`: standalone output, 50MB body limit, `remotePatterns` for `is3.cloudhost.id` and `placehold.co`.
- `nixpacks.toml`: Nixpacks config for Coolify — Node 20, sharp native deps, standalone output.
- `package.json` build script: copies `.next/static` and `public` into standalone for deployment.

## Key Conventions (Coding Rules)

- All DB writes via Server Actions, never client-side.
- `revalidatePath` after ALL mutations (actions + API).
- Currency: `formatCurrency()` in `lib/utils.ts` (IDR).
- `cn()` = `clsx` + `tailwind-merge`.
- Product categories: `SCENT_FAMILIES` (Fresh, Floral, Woody, Amber). Brand: free text + `BRANDS` constant. Gender: `GENDERS` (Men, Women, Unisex).
- Per-size pricing: `stockData` JSON — use `lib/price.ts` helpers, never raw JSON parsing.
- Colors: `bg-background`/`text-foreground`/`bg-accent` (not `bg-gold`/`text-navy`).
- Fonts: `font-serif` (DM Serif Display) for headlines, `font-sans` (Inter) for body.
- Hover scale: `scale-[1.02]` (never `scale-105`).
- WhatsApp phone: leading 0 → 62. Telegram username: leading @ stripped.
- Payment proof: JPEG/PNG/WebP, max 20MB, watermarked via `lib/watermark.ts`.
- Blog content: `DOMPurify.sanitize()` before `dangerouslySetInnerHTML`.
- Product stock: enforced server-side in `createOrder`, decrements on purchase.
- War stock: decremented separately from product stock.
- Slug: auto-generated from title in `posts.ts`.
- All public API routes: rate limit + UUID validation where applicable.
- Sensitive data: never expose `telegramBotToken`/`telegramChatId`/`accountNumber` via public API.

## Obsidian Project Docs

| Topic | Entry Point |
|-------|-------------|
| Architecture | [[docs/architecture/PROJECT_OVERVIEW]] |
| Design system | [[docs/architecture/DESIGN_SYSTEM]] |
| Database (12 tables) | [[docs/architecture/DATABASE_SCHEMA]] |
| Admin guide | [[docs/architecture/ADMIN_GUIDE]] |
| Auth flow | [[docs/flows/FLOW_auth]] |
| Products flow | [[docs/flows/FLOW_products]] |
| Cart flow | [[docs/flows/FLOW_cart]] |
| Checkout flow | [[docs/flows/FLOW_checkout]] |
| Orders flow | [[docs/flows/FLOW_orders]] |
| Settings flow | [[docs/flows/FLOW_settings]] |
| Shipping flow | [[docs/flows/FLOW_shipping]] |
| Telegram flow | [[docs/flows/FLOW_telegram]] |
| Testimonials flow | [[docs/flows/FLOW_testimonials]] |
| War flow | [[docs/flows/FLOW_wars]] |
| War plan | [[docs/plans/PLAN_war]] |
| Security audit | [[docs/plans/SECURITY_AUDIT]] |
| Smoke test | [[docs/plans/SMOKE_TEST]] |
| Map of Content | [[docs/00-index]] |
