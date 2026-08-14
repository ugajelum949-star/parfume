---
aliases: [shipping, zones, shipping-module]
tags: [flow, shipping]
---

# Shipping Flow

## Overview

Shipping is handled entirely client-side via `lib/shipping.ts`. There is no server-side calculation — the frontend determines shipping cost based on the customer's province.

## Shipping Zones (8)

| Zone ID | Label | Base Price |
|---------|-------|-----------|
| `jabodetabek` | Jabodetabek | Rp 15.000 |
| `jawa` | Jawa | Rp 20.000 |
| `sumatera` | Sumatera | Rp 28.000 |
| `kalimantan` | Kalimantan | Rp 32.000 |
| `sulawesi` | Sulawesi | Rp 32.000 |
| `bali_nusa` | Bali & Nusa Tenggara | Rp 28.000 |
| `maluku` | Maluku | Rp 40.000 |
| `papua` | Papua | Rp 50.000 |

## Province-to-Zone Mapping (30 provinces)

Provinces are mapped to zones in the `PROVINCES` array:

| Zone | Provinces |
|------|-----------|
| jabodetabek (6) | DKI Jakarta, Banten, Jawa Barat, Jawa Tengah, Jawa Timur, DI Yogyakarta |
| sumatera (9) | Aceh, Sumatera Utara/Barat/Selatan, Riau, Jambi, Bengkulu, Lampung, Kep. Bangka Belitung |
| kalimantan (5) | Kalimantan Barat/Tengah/Selatan/Timur/Utara |
| sulawesi (4) | Sulawesi Utara/Tengah/Selatan/Tenggara |
| bali_nusa (3) | Bali, NTB, NTT |
| maluku (2) | Maluku, Maluku Utara |
| papua (1) | Papua |

## Shipping Services (3)

Available services depend on the zone:

| Service | Available In | Price |
|---------|-------------|-------|
| **Reguler** | All zones | Base price of zone |
| **Instant** | Jabodetabek, Jawa only | Rp 45.000 |
| **Next Day** | All non-core zones | Base price + Rp 20.000 |

Core zones (`jabodetabek`, `jawa`) get Instant; all other zones get Next Day instead.

## Promo Thresholds

Quantity-based promotions calculated by `calculateOrderTotal()`:

| Quantity | Promo | Effect |
|----------|-------|--------|
| 2+ | Gratis Ongkir | Free shipping |
| 3+ | Bundle | Free shipping + bonus jersey |
| 5+ | Mega Bundle | Free shipping + bonus jersey + extra gift |

Transfer payment discount: Rp 50.000 off total.

Customization fee: Rp 25.000 per item.

## calculateOrderTotal()

```typescript
function calculateOrderTotal(input: OrderInput): OrderResult
```

Input: `subtotal`, `totalQty`, `shippingZone`, `shippingService`, `isTransfer?`

Returns:
- `subtotal`, `customization`, `shipping`, `total`
- `promo` object: `{ freeShipping, bonusJersey, activePromos[] }`
- `shippingIncluded` boolean

Formula: `total = subtotal + customization + shipping - transferDiscount`

## Key Files

- `lib/shipping.ts` — All zone/province data and calculation logic
- `app/cart/CartClient.tsx` — Uses shipping data in checkout form
- `app/invoice/[id]/InvoiceClient.tsx` — Displays order summary post-checkout

---

*Back to [[00-index]]*
