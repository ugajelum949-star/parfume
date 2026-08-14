---
aliases: [admin, admin-panel, admin-operations]
tags: [guide]
last_updated: 2026-08-14
---

# Admin Guide

## Access

Admin panel at `/admin/*`. Cookie-based auth — `role: ADMIN` required. Unauthorized visitors redirected to `/login`. Login rate-limited: 5 attempts/min/IP.

## Navigation

Admin shell (`AdminShell`) sidebar — 9 items:

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin/dashboard` | Stats overview |
| Products | `/admin/products` | CRUD + multi-image upload |
| Orders | `/admin/orders` | Order list + status management |
| Wars | `/admin/wars` | Product drop events |
| Banners | `/admin/banners` | Homepage banner carousel |
| Blog | `/admin/blog` | Blog post CRUD |
| Reviews | `/admin/testimonials` | Customer testimonials |
| Payments | `/admin/payment-methods` | Payment method management |
| Settings | `/admin/settings` | Store config (6 sections) |

## Pages

### Products

- **List** — All products, ordered by creation date
- **Add/Edit** — name, brand (free text + `BRANDS` constant for suggestions), category (scent family), gender, price, per-size pricing via `stockData` JSON, description, sizes, image upload (base64 + S3 + watermark)
- **Delete** — cascades to `product_images`
- **Scent Families**: Fresh, Floral, Woody, Amber
- **Stock per size**: `stockData` JSON column with `prices` and `salePrices`

### Orders

- **List** — All orders, newest first
- **Detail** (`/admin/orders/[id]`) — items, customer info, status updater
- **Status lifecycle**: PENDING → PAID → PROCESSING → SHIPPED → COMPLETED
- Status colors: PENDING (yellow), PAID (blue), PROCESSING (purple), SHIPPED (cyan), COMPLETED (green)

### Wars

- Create war events with start/end time
- Add war items (products with stock + pricing)
- Active wars show countdown on homepage
- Auto-convert to products after war ends
- Coming soon mode for scheduled wars

### Banners

- Full CRUD with image upload
- Ordering field for display sequence
- Active/inactive toggle
- Shown in carousel on homepage

### Blog

- Full CRUD with markdown content
- Auto-generated slug from title
- Categories: Care Tips, Scent Guide, News, Recommendation
- Cover image upload
- Published/draft toggle
- Rendered with `simpleMarkdownToHtml` + DOMPurify sanitization

### Testimonials

- CRUD: name, role, content, rating (1-5), avatar, proof image
- Displayed on homepage (2-row marquee) and product detail pages

### Payment Methods

- **Add/Edit**: type (transfer/QRIS), label, account details
- **QRIS**: upload QR image to S3
- **Toggle**: active/inactive per method
- Active methods shown on checkout

### Settings (6 sections)

1. **Store Info** — Name, slogan, logo upload, support email
2. **Contact** — WhatsApp numbers, Telegram username
3. **Floating Chat** — Enable/disable toggle, provider (WA/TG)
4. **Confirmation Buttons** — Both / WA only / TG only
5. **Telegram Bot** — Bot token, chat ID
6. **Homepage Images** — 8 upload fields: hero banner, For Him/Her/Unisex, Fresh/Floral/Woody/Amber

All images uploaded to S3 `homepage/` folder. URLs stored in `settings` table.

See [[FLOW_settings]] for field details and sanitization rules.

## Store Branding

AdminShell sidebar header shows store logo + name from `useStoreSettings()` hook (StoreProvider context).

## Security

All admin actions verified via `verifyAdmin()` (cookie + DB check). See [[PLAN_security]] for full audit.

---

*Back to [[00-index]]*
