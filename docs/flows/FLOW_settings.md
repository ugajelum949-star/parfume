---
aliases: [settings-flow, branding, settings-page]
tags: [flow]
last_updated: 2026-08-14
---

# Settings Flow

## Overview

Admin settings page at `/admin/settings` with **6 sections**. All values stored in `settings` table (key-value). Saved via `updateSettingsFromForm()` server action.

## Settings Sections

### 1. Store Info

| Key | Description |
|-----|-------------|
| `store_name` | Store display name |
| `store_slogan` | Store tagline |
| `store_logo` | Logo (S3 upload) |
| `support_email` | Contact email |

### 2. Contact

| Key | Description |
|-----|-------------|
| `whatsapp` | WhatsApp number (order inquiries) |
| `whatsappConfirm` | WhatsApp number (confirmation) |
| `telegramUsername` | Telegram username (without @) |

**WhatsApp sanitization**: Leading `0` → `62`. Digits only.
**Telegram sanitization**: Leading `@` stripped.

### 3. Floating Chat Button

| Key | Description |
|-----|-------------|
| `floatingButtonEnabled` | `true` / `false` |
| `floatingButtonType` | `whatsapp` or `telegram` |

### 4. Confirmation Buttons

| Key | Description |
|-----|-------------|
| `confirmButtonType` | `both`, `whatsapp`, or `telegram` |

### 5. Telegram Bot

| Key | Description |
|-----|-------------|
| `telegramBotToken` | Bot API token |
| `telegramChatId` | Target chat/group ID |

**Security**: `telegramBotToken` and `telegramChatId` are NOT exposed via `/api/settings` public endpoint.

### 6. Homepage Images

| Key | Section | Description | Fallback |
|-----|---------|-------------|----------|
| `heroImage` | Hero | Banner utama homepage | Gradient gelap |
| `heroForHim` | Gender | Gambar lifestyle "For Him" | Gradient biru tua |
| `heroForHer` | Gender | Gambar lifestyle "For Her" | Gradient pink |
| `heroUnisex` | Gender | Gambar lifestyle "Unisex" | — |
| `scentFresh` | Scent | Gambar splash "Fresh" | Gradient biru + emoji 🍊 |
| `scentFloral` | Scent | Gambar splash "Floral" | Gradient pink + emoji 🌸 |
| `scentWoody` | Scent | Gambar splash "Woody" | Gradient coklat + emoji 🪵 |
| `scentAmber` | Scent | Gambar splash "Amber" | Gradient oranye + emoji 🔥 |

Images uploaded to S3 `homepage/` folder. URLs stored in `settings` table.

### Additional Keys (Shipping & Promos)

| Key | Description | Default |
|-----|-------------|---------|
| `giftWrapPrice` | Gift wrap price (IDR) | 15000 |
| `shipping_free_threshold` | Free shipping qty threshold | 300000 |
| `shipping_customization_fee` | Customization fee | 25000 |
| `shipping_transfer_discount` | Transfer discount | 50000 |
| `shipping_instant_price` | Instant shipping price | 45000 |
| `shipping_nextday_surcharge` | Next day surcharge | 20000 |
| `promo_qty_bundle` | Bundle promo qty | 3 |
| `promo_qty_mega` | Mega promo qty | 5 |

## Server Actions

```typescript
getSetting(key)                 // Single value
getSettings(keys[])             // Multiple values
updateSetting(key, value)       // Single upsert
updateSettings(data)            // Batch upsert
updateSettingsFromForm(formData) // Form handler — sanitizes + saves all keys
```

`updateSettingsFromForm` allowlist includes all keys listed above plus homepage image keys.

## Client-Side Access

`StoreProvider` context wraps the app:
```typescript
const { storeName, storeLogo, storeSlogan, supportEmail, whatsapp, telegramUsername } = useStoreSettings()
```

Fetches: `store_name`, `store_slogan`, `store_logo`, `support_email`, `whatsapp`, `telegramUsername`.

## Components Using Store Settings

- **Header** — logo + store name
- **Footer** — store name, WhatsApp link, Telegram link, email
- **Login** — logo + store name
- **AdminShell** — logo + store name
- **Homepage** — hero image, gender images, scent images

---

*Back to [[00-index]]*
