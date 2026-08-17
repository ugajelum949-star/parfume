# 📦 Parfume Store

E-commerce parfum reseller Indonesia. Next.js 16 (App Router), PostgreSQL (Drizzle ORM), TailwindCSS v4, Zustand, S3 (IDCloudHost), Telegram Bot. Deployed via Coolify.

---

## Quick Start

```bash
npm install              # Install dependencies
cp .env.example .env     # Konfigurasi env vars
npx drizzle-kit push     # Push schema ke DB
npm run dev              # Dev server localhost:3000
```

Admin login: `/login` (auto-seed dari env vars `ADMIN_EMAIL`/`ADMIN_PASSWORD`)

---

## Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run lint             # ESLint
npm run seed             # Seed DB dengan dummy data
npm run test:conn        # Test DB connection
npm run test:s3          # Test S3 upload
npx drizzle-kit generate # Generate migration SQL
npx drizzle-kit push     # Push schema ke DB
```

---

## Project Structure

```
parfume/
├── app/
│   ├── actions/          # Server Actions (auth, products, orders, upload, settings, wars, posts, banners, featured-brands)
│   ├── admin/            # Admin Panel (dashboard, products, orders, wars, banners, blog, testimonials, settings, payment-methods, featured-brands)
│   ├── api/              # API Routes (order, proof, payment-methods, settings, image proxy, telegram webhook, health)
│   ├── blog/             # Blog listing + slug pages
│   ├── cart/             # Checkout page
│   ├── compare/          # Product comparison
│   ├── invoice/          # Post-order invoice + payment proof upload
│   ├── login/            # Admin login
│   ├── product/          # Product detail
│   ├── products/         # Product listing with filters
│   └── wishlist/         # Wishlist page
├── components/
│   ├── home/             # Homepage (MarqueeBar, BannerCarousel, PopularSection, ScentCards, GenderSplit, BrandShowcaseSlider, WarSection, BlogSection, TestimonialsSection)
│   ├── layout/           # Header, Footer, BottomNav
│   ├── product/          # ProductDetail, ProductTestimonials
│   ├── providers/        # StoreProvider, ProtectionProvider
│   ├── search/           # SearchAutocomplete
│   ├── shared/           # ProductCard, FloatingChat, ScrollReveal, ClientOverlays
│   ├── compare/          # CompareBar
│   ├── wishlist/         # WishlistContent
│   └── ui/               # shadcn/ui (Button, Card, Input, Label, Sheet, etc)
├── db/
│   ├── schema.ts         # Drizzle ORM schema (13 tables)
│   └── migrations/       # SQL migrations
├── features/
│   ├── cart/             # Zustand cart store + CartDrawer + message generator
│   ├── compare/          # Zustand compare store
│   └── wishlist/         # Zustand wishlist store
├── hooks/                # Custom hooks (useIsMobile)
├── lib/
│   ├── config.ts         # Brands, scent families, genders, size presets
│   ├── db.ts             # PostgreSQL connection singleton
│   ├── image-proxy.ts    # S3 URL → proxy URL converter
│   ├── price.ts          # Per-size pricing from stockData JSON
│   ├── ratelimit.ts      # In-memory rate limiter
│   ├── s3-storage.ts     # S3 upload/delete (IDCloudHost)
│   ├── shipping.ts       # Shipping zones, services, calculator
│   ├── telegram.ts       # Telegram bot notifications
│   ├── utils.ts          # formatCurrency (IDR), cn (clsx+tailwind-merge)
│   ├── watermark.ts      # Sharp watermark (legacy, not used for new uploads)
│   └── compression.ts    # Client-side Canvas image compression
├── scripts/              # Seed & maintenance scripts
└── tests/                # DB & S3 connection tests
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Database | PostgreSQL (Drizzle ORM, postgres.js) |
| Styling | TailwindCSS v4 (Dark luxury: Obsidian #0C0C0C + Gold) |
| State | Zustand (cart, wishlist, compare — localStorage persist) |
| Storage | IDCloudHost S3 (images, no ACL) |
| Notifications | Telegram Bot API + WhatsApp deep links |
| Deploy | Coolify (Nixpacks, Node 22, standalone output) |
| Image Serving | `/api/image` proxy (24h cache, CORS-free) |

---

## Environment Variables

Required in `.env`:

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
S3_ENDPOINT=https://is3.cloudhost.id
S3_REGION=us-east-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=parfume
ADMIN_EMAIL=admin@parfume.com
ADMIN_PASSWORD=yourpassword
TELEGRAM_BOT_TOKEN=xxx        # Optional: for payment proof notifications
TELEGRAM_CHAT_ID=xxx          # Optional: admin chat ID
SESSION_SECRET=your-random-secret  # For cookie signing
```

---

## Deployment (Coolify)

### First Deploy

1. Push ke GitHub (`main` branch)
2. Coolify auto-deploys via webhook
3. Set environment variables di Coolify Dashboard
4. Run `npx drizzle-kit push` di Coolify terminal untuk init DB
5. Set Telegram webhook (jika pakai fitur approval):
   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d '{"url":"https://yourdomain.com/api/telegram/webhook"}'
   ```

### Subsequent Deploys

```bash
git add -A && git commit -m "feat: ..." && git push origin main
```

Coolify auto-build (~2-5 min). Tidak perlu manual migration kecuali schema berubah.

### Rollback

Coolify Dashboard → Deployment → Rollback to previous. Atau:
```bash
git revert HEAD && git push origin main
```

---

## Key Features

- **5-Brand Showcase Slider** — horizontal carousel per brand (admin configurable)
- **Curated Gender Slots** — admin pick 4 products per For Him/Her/Everyone
- **War (Flash Sale)** — countdown timer, auto-conversion to products, post-war pricing
- **Per-size Pricing** — stockData JSON with size-level prices and sale prices
- **Image Proxy** — `/api/image?key=...` for CORS-free, cached image serving
- **Client Compression** — Canvas-based image compression before upload
- **CSS Watermark** — non-destructive text overlay on product cards
- **Blog System** — markdown + DOMPurify, 4 categories, ISR
- **Shipping Calculator** — 8 zones, 30 provinces, configurable free shipping
- **Telegram Integration** — order notifications, payment proof forwarding
- **Anti-screenshot** — ProtectionProvider on public pages (deterrence only)

---

## Documentation

- [00_INDEX.md](docs/00_INDEX.md) — Master project plan & map of content
- [HUMANERROR.md](docs/HUMANERROR.md) — Human error protection audit (38/41 fixed)
- [PLAN_TELEGRAM_APPROVAL.md](docs/PLAN_TELEGRAM_APPROVAL.md) — Telegram payment approval plan + deployment guide
- [SCALE_PROJECT_PART_1.md](docs/SCALE_PROJECT_PART_1.md) — Featured brands + gender slots
- [SCALE_PROJECT_PART_2.md](docs/SCALE_PROJECT_PART_2.md) — Frontend luxury features
- [PLAN_FIX_UPLOAD_WATERMARK.md](docs/PLAN_FIX_UPLOAD_WATERMARK.md) — Upload fix + watermark overlay
