---
aliases: [checkout, checkout-flow, order-creation]
tags: [flow]
last_updated: 2026-08-12
---

# Checkout Flow

## Overview

Checkout is a single-page experience at `/cart` with 3 numbered steps. After placing an order, the customer is redirected to `/invoice/[id]` (the invoice page for the newly created order).

## Flow

```
CartDrawer: user clicks "Checkout"
  ↓
/cart — CartClient renders 3-step form
  ↓
Step 1: Shipping Info (name, phone, address, city/province)
Step 2: Payment (radio selection from DB payment methods)
Step 3: Review Order (item list with quantity controls)
  ↓
User clicks "Place Order"
  ↓
createOrder() server action
  ↓
Order inserted (status: PENDING) + order items
Cart cleared
  ↓
Redirect to /invoice/[id]
```

## Shipping Zones & Province Selection

Shipping is calculated client-side via [[FLOW_shipping|lib/shipping.ts]]:

- **30 provinces** mapped to **8 zones**
- Customer selects province from dropdown (populated from `PROVINCES` array)
- Province dropdown determines the shipping zone
- Zone determines available services and base shipping cost
- Shipping cost is displayed in the order summary
- Promo thresholds applied automatically based on quantity

## Customer Form Fields

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | Yes | Text input, saved to localStorage |
| Phone | Yes | Text input (08xxx format), saved to localStorage |
| Address | Yes | Text input, saved to localStorage |
| City/Province | Yes | Province dropdown, determines shipping zone |
| Payment Method | Yes | Radio selection from active payment methods |

Customer data is persisted in `localStorage` key `parfume_customer` and pre-filled on next visit.

## Payment Method Selection

Payment methods are fetched server-side via `getActivePaymentMethods()` (where `isActive = true`). Each method shows:
- **Transfer** — label, account name, account number
- **QRIS** — label, QR image thumbnail

When a payment method is selected, a preview is shown:
- **Transfer** — bank details (account name, account number)
- **QRIS** — full QR image display

## Order Summary (Right Sidebar)

Sticky sidebar on desktop, fixed bottom bar on mobile. Shows:
- Item list with quantity controls (+/-/remove)
- Subtotal per item
- Shipping cost (based on selected province zone)
- Total amount
- "Place Order" button (loading state with spinner)

## Invoice Page (`/invoice/[id]`)

After order placement, the customer is redirected directly to this page. It provides:

### Progress Stepper (5 steps)
1. Order Dibuat (Created)
2. Pembayaran (Payment)
3. Diproses (Processing)
4. Dikirim (Shipped)
5. Selesai (Completed)

Step is determined by order status mapping: PENDING=1, PAID=2, PROCESSING=3, SHIPPED=4, COMPLETED=5.

### Payment Info Card
Shows payment method details:
- **Transfer** — account name and number
- **QRIS** — full QR image

### Order Items
Product name, size, quantity, price per item.

### Upload Payment Proof
- Accepts JPEG, PNG, WebP (max 20MB)
- Sends to `POST /api/order/proof`
- Order status auto-updates to PROCESSING
- If Telegram bot configured, proof photo is forwarded to admin chat

### Confirmation Button
Based on `confirmButtonType` setting:
- **whatsapp** — deep link: `https://wa.me/{phone}?text={message}`
- **telegram** — deep link: `https://t.me/+{phone}`
- **both** — both buttons displayed

## Key Files

- `app/cart/CartClient.tsx` — Checkout form (3 steps, sticky sidebar, mobile bottom bar)
- `features/cart/store.ts` — Zustand cart store (persist, addItem, removeItem, clearCart)
- `app/actions/orders.ts` — createOrder server action
- `app/invoice/[id]/page.tsx` — Invoice page (server component, stepper)
- `app/invoice/[id]/InvoiceClient.tsx` — Invoice client (upload proof, confirmation buttons)
- `app/api/order/proof/route.ts` — Payment proof upload handler
- `lib/shipping.ts` — Shipping zones, services, calculateOrderTotal
- `features/cart/lib/message-generator.ts` — WhatsApp/Telegram order text generators

---

*Back to [[00-index]]*
