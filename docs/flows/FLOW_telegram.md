---
aliases: [telegram, telegram-bot, tg-integration]
tags: [flow, telegram]
---

# Telegram Integration

## Overview

Telegram integration provides bot-based order notifications and payment proof forwarding. Configuration is managed in the admin Settings page.

## Bot Setup

Two settings keys in the `settings` table:

| Key | Description | Format |
|-----|-------------|--------|
| `telegramBotToken` | Bot API token from @BotFather | `123456:ABC-DEF...` |
| `telegramChatId` | Target chat/group ID | `-1001234567890` |

Set via `/admin/settings` in the Telegram Bot section.

## Core Functions (`lib/telegram.ts`)

### sendTelegramMessage

```typescript
sendTelegramMessage(token: string, chatId: string, text: string): Promise<void>
```

Sends a plain text message to the configured Telegram chat. 10-second timeout via `AbortController`.

### sendTelegramPhoto

```typescript
sendTelegramPhoto(token: string, chatId: string, photoBuffer: Buffer, caption: string): Promise<void>
```

Sends a photo with caption (used for payment proof images). Creates a `FormData` with `Blob` attachment. 10-second timeout.

Both functions silently log errors to console — failures do not block the request flow.

## Payment Proof Flow

When a customer uploads payment proof via the invoice page:

1. Customer selects image (JPEG/PNG/WebP, max 20MB)
2. `POST /api/order/proof` receives the file
3. Order status updates to `PROCESSING`
4. If `telegramBotToken` and `telegramChatId` are configured:
   - File buffer is read from the upload
   - `sendTelegramPhoto()` sends the image with caption: order ID, customer name, total
5. Caption format: `Bukti Pembayaran\nOrder: {id}\nCustomer: {name}\nTotal: Rp {amount}`

## Deep Links

### WhatsApp Confirmation

Built in `app/invoice/[id]/InvoiceClient.tsx`:
```
https://wa.me/{phone}?text={encoded message}
```

### Telegram Confirmation

```
https://t.me/+{phone}
```

The `confirmButtonType` setting (from admin Settings) controls which button(s) appear on the invoice page:
- `whatsapp` — WhatsApp button only
- `telegram` — Telegram button only
- `both` — Both buttons

## Message Templates

`features/cart/lib/message-generator.ts` provides three generators:

| Function | Format | Purpose |
|----------|--------|---------|
| `generateWhatsAppOrderText()` | URL-encoded (`%0A`) | WhatsApp deep link text |
| `generateTelegramOrderText()` | Plain newline | Telegram message |
| `generateTransferOrderText()` | Plain + bank details | Transfer payment instructions |

All include: order ID, customer data, item list, total.

### getTelegramUrl()

```typescript
getTelegramUrl(cleanUsername: string, text: string): string
```

Builds a Telegram deep link. Handles `https://t.me/`, `t.me/`, or bare username prefixes.

## Key Files

- `lib/telegram.ts` — sendTelegramMessage, sendTelegramPhoto
- `app/api/order/proof/route.ts` — Payment proof upload handler (calls sendTelegramPhoto)
- `features/cart/lib/message-generator.ts` — Order text generators + getTelegramUrl
- `app/admin/settings/settings-form.tsx` — Bot token/chat ID configuration UI

---

*Back to [[00-index]]*
