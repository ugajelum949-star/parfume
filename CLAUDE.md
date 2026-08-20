# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

Parfume Store — Indonesian e-commerce parfum reseller. Next.js 16 (App Router), PostgreSQL (Drizzle ORM), TailwindCSS v4, Zustand, S3 (IDCloudHost), Telegram Bot. Deployed via Coolify. CSS animations only (no framer-motion).

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
```

### Environment Variables (`.env`)

Required: `DATABASE_URL`, `NEXT_PUBLIC_BASE_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`. Optional: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (auto-seed admin on startup).

## Technical Architecture

### Data Layer (`db/schema.ts`, `lib/db.ts`)

Drizzle ORM with PostgreSQL. Schema in single `db/schema.ts`. Connection singleton in `lib/db.ts` (postgres.js, max 5 connections). UUID PKs throughout.

Tables: `users`, `products`, `productImages`, `orders`, `orderItems`, `paymentMethods`, `testimonials`, `banners`, `settings` (key-value), `wars`, `warItems`, `posts`.

Products support up to 5 images (1 main + 4 extra via `productImages`). Brand is free text input with a `BRANDS` constant in `lib/config.ts` for autocomplete suggestions. Scent families: 4 only (Fresh, Floral, Woody, Amber) via `lib/config.ts`. Config also has `GENDERS`, `GIFT_WRAP_PRICE` (15,000 IDR).

**Product pricing uses `stockData` JSON** (`lib/price.ts`): `stockData` is a JSON string on the `products` table with shape `{ prices: { "50ml": 250000 }, salePrices: { "50ml": 200000 } }`. This enables per-size pricing and per-size sale prices. Key helpers in `lib/price.ts`: `getSizePrice()`, `getFirstSizePrice()`, `parseAllSizePrices()`. If `stockData.prices` is empty, falls back to `products.price`.

`posts` table stores blog content with categories: Care Tips, Scent Guide, News, Recommendation. Slug-based routing.

### Config & Utilities (`lib/config.ts`, `lib/utils.ts`, `lib/ratelimit.ts`)

- `config.ts` — `SCENT_FAMILIES`, `GENDERS`, `BRANDS` (60+ popular perfume brands), `GIFT_WRAP_PRICE`
- `shipping.ts` — `SHIPPING_ZONES` (8 zones, 30 provinces), `SHIPPING_SERVICES`, zone-based shipping calculator, price-based free shipping (configurable threshold via DB settings)
- `ratelimit.ts` — rate limiter helper for login and API endpoints
- `utils.ts` — `formatCurrency()` (IDR), `cn()` (clsx + tailwind-merge)
- `price.ts` — per-size pricing from stockData JSON (original/sale/final price per size)
- `compression.ts` — client-side Canvas image normalization/compression; always re-encodes JPEG/PNG/WebP to base64, bypasses SVG/GIF
- `s3-storage.ts` — S3 upload/delete helpers using IDCloudHost
- `hooks/use-image-upload.ts` — `useImageUpload(folder)` hook: normalize → base64 → upload → generic error toast. Used by admin pages.

### Auth Model (`app/actions/auth.ts`)

Cookie-based session (UUID in `auth_session` cookie, httpOnly/secure/sameSite, **7-day expiry**). `verifyAdmin()` checks cookie + DB on every protected action. Admin layout (`app/admin/layout.tsx`) guards `/admin/*` routes. Login rate-limited: 5 attempts/min/IP.

**Admin auto-seed:** `instrumentation.ts` seeds admin user on server startup from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars. Skips if admin already exists. Default: `xxx@parfume.com` / `Jarwo828@Jr`.

**Admin login is hidden from public nav** — only accessible via `/login` URL.

**Admin routes:** `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/payment-methods`, `/admin/settings`, `/admin/testimonials`, `/admin/wars`, `/admin/banners`, `/admin/blog`.

### Server Actions (`app/actions/`)

- `auth.ts` — login, logout, verifyAdmin
- `products.ts` — CRUD with revalidatePath
- `upload.ts` — server-side base64 image upload to S3 (MIME + size validation)
- `settings.ts` — key-value store, form sanitization (WhatsApp phone, Telegram username), 6 sections: Store Info, Contact, Floating Chat, Confirmation Buttons, Telegram Bot, **Homepage Images** (8 upload fields: hero, gender, scent)
- `orders.ts` — order creation, listing, payment methods
- `payment.ts` — payment method CRUD, QRIS image upload
- `testimonials.ts` — testimonial CRUD with revalidatePath
- `wars.ts` — war CRUD, auto-conversion to products, stock decrement
- `posts.ts` — blog post CRUD with slug generation
- `banners.ts` — banner CRUD with ordering

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
- **WarSection** (`components/home/WarSection.tsx`) — Active wars with countdown, coming soon mode.
- **TestimonialsSection** (`components/home/TestimonialsSection.tsx`) — 2-row marquee (no middle row). Top: RTL, bottom: LTR faster.
- **ProductDetail** (`components/product/ProductDetail.tsx`) — Size selector, add-to-cart (toast), per-size pricing, reviews.
- **ProductTestimonials** (`components/product/ProductTestimonials.tsx`) — Product-level reviews marquee.
- **CartDrawer** (`features/cart/components/CartDrawer.tsx`) — Minimal slide-out. No auto-open.
- **CartClient** (`app/cart/CartClient.tsx`) — 3-step checkout: shipping, payment, review.
- **InvoiceClient** (`app/invoice/[id]/InvoiceClient.tsx`) — Payment proof upload, confirmation buttons.
- **SettingsForm** (`app/admin/settings/settings-form.tsx`) — 6-section settings including Homepage Images (8 fields).
- **PostEditor** (`app/admin/blog/`) — Blog post CRUD with markdown.
- **StoreProvider** (`components/providers/StoreProvider.tsx`) — Context: storeName, storeLogo, supportEmail, whatsapp, telegramUsername.
- **ProtectionProvider** (`components/providers/ProtectionProvider.tsx`) — Anti-screenshot on public pages.

### Cart Flow

Zustand store (`features/cart/store.ts`) with localStorage persistence (`shopping-cart-storage`). **Toast on add-to-cart** (`toast.success('Ditambahkan ke keranjang ✓')`). CartDrawer only opens via `/cart` link or BottomNav. War products tracked via `source: 'war'` + `warItemId` fields.

### Blog System

Server-rendered blog at `/blog` with slug-based routing (`/blog/[slug]`). Posts stored in `posts` table with `coverImage`, `category` (Care Tips, Scent Guide, News, Recommendation), `excerpt`, `content` (markdown). Revalidate: 60s ISR. Admin CRUD via `/admin/blog`. Content sanitized via markdown renderer before rendering.

### Compare & Wishlist

`features/compare/store.ts` — up to 3 products, localStorage (`parfume_compare`), exposes `ids`, `toggle`, and `remove`. `features/wishlist/store.ts` — arbitrary count, localStorage (`parfume_wishlist`). Both Zustand + persist middleware.

### Shipping Module (`lib/shipping.ts`)

8 shipping zones with 30 Indonesian province mappings. 3 shipping services (Reguler, Instant, Next Day) with zone-dependent availability. Free shipping: price-based (default ≥Rp300.000, configurable via `shipping_free_threshold` in admin Settings). `calculateOrderTotal()` computes final cost including customization fee and transfer discount.

### Telegram Integration (`lib/telegram.ts`)

`sendPaymentProofWithActions()` for bot notifications with inline approve/reject buttons. Payment proof photos forwarded to admin chat on upload. Configured via admin Settings (bot token + chat ID).

### Message Generators

Order message helper module was removed after confirming zero callers. Checkout and payment confirmation flows now use their active action/component paths directly.

### Post-War Pricing (`lib/price.ts`)

Runtime pricing for war-converted products:
- `getPostWarPrice(warPrice, launchedAt)` — If `warPrice` + `launchedAt` exists and < 7 days old → returns `warPrice × 1.7`
- After 7 days → returns null, falls back to normal `products.price`

### Build & Deploy

- `next.config.ts`: standalone output, 50MB Server Action body limit, unoptimized images with remote patterns for `is3.cloudhost.id` and `placehold.co`.
- Upload errors log only generic messages; raw exception details are not returned to clients or written to logs.
- `nixpacks.toml`: Nixpacks config for Coolify — Node 22, sharp native deps, standalone output.
- `package.json` build script: copies `.next/static` and `public` into standalone for deployment.

### SEO

- `app/robots.ts` — blocks `/admin/`, allows everything else.
- `app/sitemap.ts` — static + dynamic product + published blog post URLs.
- Blog posts: canonical URLs, JSON-LD structured data.

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
- Payment proof: JPEG/PNG/WebP, max 20MB.
- Blog content: Sanitized / parsed via markdown renderer before rendering.
- Product stock: enforced server-side in `createOrder`, decrements on purchase.
- War stock: decremented separately from product stock.
- Slug: auto-generated from title in `posts.ts`.
- All public API routes: rate limit + UUID validation where applicable.
- Sensitive data: never expose `telegramBotToken`/`telegramChatId`/`accountNumber` via public API.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
