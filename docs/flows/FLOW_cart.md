---
aliases: [shopping-cart, checkout]
tags: [flow]
last_updated: 2026-08-14
---

# Cart Flow

## State Management

Zustand store with localStorage persistence (`shopping-cart-storage`).

```
features/cart/store.ts
  ↓
create<CartState>()(persist(...))
  ↓
localStorage key: "shopping-cart-storage"
```

## Cart Operations

### Add Item
```
addItem(item) → find existing (id + size match) → increment qty or push new
```

Item shape:
```typescript
{ id, name, size, price, image, category, source?: 'war', warItemId?: string }
```

### Remove Item
```
removeItem(id, size) → filter out matching item
```

### Update Quantity
```
updateQuantity(id, size, qty) → if qty <= 0, remove; else update
```

### Totals
```
totalItems() → sum of all quantities
totalPrice() → sum of (price × quantity)
```

## Add-to-Cart Behavior

**Toast notification** — `toast.success('Ditambahkan ke keranjang ✓', { duration: 2000 })`. No auto-open drawer.

CartDrawer opens only via:
- `/cart` page navigation
- BottomNav cart icon

## Cart Drawer

Slide-out from right. Minimal layout:
- Header: "Keranjang (N)" + close button
- Items: image thumbnail (`w-16 h-16`), name, size, price, quantity controls, delete
- Footer: subtotal + full-width "Checkout" button → `/cart`
- Empty state: "Keranjang kosong" + link to `/products`

## Checkout Flow (`/cart`)

3-step form (CartClient):
1. **Shipping Info** — name, phone, address, province selection → ongkir calculation
2. **Payment Selection** — QRIS or bank transfer (from active payment methods)
3. **Review Order** — summary of items, shipping, payment, total

Creates order + order_items in DB. Redirects to `/invoice/[id]`.

## Invoice (`/invoice/[id]`)

- Order ID + copy button
- Payment proof upload (JPEG/PNG/WebP, max 20MB) → forwarded to Telegram bot
- Confirmation buttons (WhatsApp / Telegram / Both) — pre-filled order text
- Order status tracking

## War Products in Cart

War items tracked via `source: 'war'` + `warItemId` fields. Separate stock management from regular products.

## Key Files

- `features/cart/store.ts` — Zustand store
- `features/cart/components/CartDrawer.tsx` — Slide-out drawer
- `features/cart/lib/message-generator.ts` — WhatsApp/TG/Transfer order text generators
- `app/cart/CartClient.tsx` — Checkout form
- `app/invoice/[id]/InvoiceClient.tsx` — Invoice + proof upload

---

*See also: [[FLOW_wars]] — War products in cart*

*Back to [[00-index]]*
