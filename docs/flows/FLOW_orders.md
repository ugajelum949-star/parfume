---
aliases: [order-management, order-list, orders-page]
tags: [flow]
---

# Orders Flow

## Order Listing

```
Admin navigates to /admin/orders
  ↓
Server component: OrdersPage (force-dynamic)
  ↓
Direct DB query: select all from orders
  ↓
Orders ordered by createdAt DESC
  ↓
Rendered as card list with status badges
```

## Status Lifecycle

Orders move through a linear pipeline:

```
PENDING → PROCESSING → SHIPPED → COMPLETED
```

| Status | Color | Description |
|--------|-------|-------------|
| `PENDING` | Yellow | Order created, awaiting payment |
| `PAID` | Blue | Payment confirmed (manual admin action) |
| `PROCESSING` | Purple | Being prepared; also auto-set when payment proof is uploaded |
| `SHIPPED` | Cyan | Dispatched to customer |
| `COMPLETED` | Green | Delivered |

**Auto-transition**: When a customer uploads payment proof via `/invoice/[id]`, the order status auto-updates from PENDING to PROCESSING.

## Invoice Page (`/invoice/[id]`)

The invoice page serves as both a customer-facing order summary and payment proof submission interface.

### Progress Stepper (5 steps)

| Step | Status | Icon |
|------|--------|------|
| 1. Order Dibuat | PENDING | ShoppingCart |
| 2. Pembayaran | PAID | CreditCard |
| 3. Diproses | PROCESSING | Package |
| 4. Dikirim | SHIPPED | Truck |
| 5. Selesai | COMPLETED | CheckCircle |

Active steps are highlighted with primary color. Determined by mapping status to step index.

### Payment Proof Upload

- Customer selects image file (JPEG/PNG/WebP, max 20MB)
- `POST /api/order/proof` with FormData (`file` + `orderId`)
- Order status auto-updates to PROCESSING
- [[FLOW_telegram|Telegram bot notification]]: proof photo forwarded with caption (order ID, customer name, total)
- Success toast displayed on completion

### Confirmation Buttons

Based on `confirmButtonType` setting from [[FLOW_settings|Settings]]:
- **WhatsApp** — deep link with pre-filled order confirmation message
- **Telegram** — deep link to Telegram chat
- **Both** — both buttons displayed

## Server Actions

```typescript
createOrder(data)          // Create order + order items
getOrders()                // List all orders (ordered by createdAt DESC)
getOrder(id)               // Single order with line items
getActivePaymentMethods()  // Payment methods where isActive = true
```

### createOrder

Receives customer info, items array, and payment method ID. Calculates total from `item.price * item.quantity`. Inserts into `orders` table with status `PENDING`, then batch-inserts `order_items`.

## Key Files

- `app/actions/orders.ts` — createOrder, getOrders, getOrder, getActivePaymentMethods
- `app/admin/orders/page.tsx` — Admin order list page (server component)
- `app/invoice/[id]/page.tsx` — Invoice page (server component with stepper)
- `app/invoice/[id]/InvoiceClient.tsx` — Client component (upload proof, confirmation buttons)
- `app/api/order/proof/route.ts` — Payment proof upload handler
- `db/schema.ts` — orders, orderItems tables

---

*Back to [[00-index]]*
