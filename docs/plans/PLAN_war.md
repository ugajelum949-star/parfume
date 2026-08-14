# War (Product Drop) — Implementation Plan

## Context

Parfume store perlu fitur "War" — product drop dengan stok terbatas untuk menciptakan FOMO. Produk baru launch via war, post-war markup 70%, lalu balik ke harga diskon 7 hari kemudian. Schema `wars` + `war_items` sudah di-DB, admin page sudah dibuat, homepage WarSection sudah render. Yang belum: **post-war pricing lifecycle** + **coming soon countdown** + **auto-conversion logic di cart/checkout**.

## Goal

War products punya 3-phase pricing:
1. **War** (selama war): harga normal (Rp 500.000)
2. **Post-war** (0-7 hari): markup 70% (Rp 850.000)
3. **Sale** (8+ hari): diskon (Rp 400.000)

Non-war products: zero change.

## Current State

- [x] Schema: `wars` + `war_items` tables + pushed to DB
- [x] Server actions: `app/actions/wars.ts` (CRUD, convert, decrement)
- [x] Admin page: `/admin/wars` (create war + items, list with status)
- [x] Admin nav: Wars link added
- [x] Homepage: `WarSection` component renders active wars with countdown
- [x] Auto-conversion: `checkExpiredWars()` called on homepage load
- [x] Obsidian docs: `FLOW_wars.md`, `TABLE_wars.md`, `TABLE_war_items.md`
- [x] Post-war pricing: `warPrice` + `launchedAt` fields on products
- [x] Post-war display: `getPostWarPrice()` helper + UI integration
- [x] Coming soon: scheduled wars with countdown to start
- [x] Cart war tracking: `source` + `warItemId` fields on CartItem
- [x] Order war handling: war stock decrement, separate validation

## What's Missing

All phases completed! See verification below.

**File: `db/schema.ts`**
- Add `warPrice: real("war_price")` to products (nullable)
- Add `launchedAt: timestamp("launched_at")` to products (nullable)
- `npx drizzle-kit push`

**File: `app/actions/wars.ts` → `convertWarToProducts()`**
- When converting, also set `warPrice` and `launchedAt` on the new product
- `warPrice = item.price` (the war price)
- `launchedAt = new Date()`

### Phase 2: Post-War Display Price ✅

**File: `lib/price.ts`**
- Add `getPostWarDisplayPrice(product)` helper
- Logic: if `warPrice && launchedAt && now < launchedAt + 7 days` → return `warPrice * 1.7`
- Else return normal price from existing logic

**File: `components/home/StoreGrid.tsx`**
- For war-converted products (has `warPrice`): show post-war premium price

**File: `components/product/ProductDetail.tsx`**
- Show post-war premium price if within 7 days of launch
- After 7 days: show normal sale price

**File: `app/products/page.tsx`**
- Same post-war price display

### Phase 3: Coming Soon Countdown ✅

**File: `app/actions/wars.ts`**
- Add `getScheduledWars()` — wars where `startTime > now && active == true`

**File: `components/home/WarSection.tsx`**
- Accept `mode: 'live' | 'coming-soon'`
- Coming soon mode: show countdown to startTime, no products yet, show "Ingatkan Saya" button

**File: `app/page.tsx`**
- Fetch scheduled wars alongside active wars
- Render coming soon wars with countdown (no products visible)

### Phase 4: Cart/Checkout for War Products ✅

**File: `features/cart/store.ts`**
- Cart items from war: store `source: 'war'` + `warItemId` in CartItem

**File: `app/actions/orders.ts` → `createOrder()`**
- If item source is 'war': decrement war stock, not product stock
- Validate war stock server-side

### Phase 5: Admin Enhancements ✅

**File: `app/admin/wars/page.tsx`**
- Show sold count per war item
- Show remaining stock

**File: `app/admin/products/page.tsx`**
- Show "warPrice" and "launchedAt" for war-converted products (read-only info)

## Files Changed

| File | Change |
|------|--------|
| `db/schema.ts` | +warPrice, +launchedAt on products |
| `app/actions/wars.ts` | set warPrice/launchedAt on convert, getScheduledWars |
| `lib/price.ts` | +getPostWarDisplayPrice() |
| `components/home/WarSection.tsx` | coming-soon mode, countdown to start |
| `components/home/StoreGrid.tsx` | post-war price display |
| `components/product/ProductDetail.tsx` | post-war price display |
| `app/products/page.tsx` | post-war price display |
| `app/page.tsx` | fetch scheduled wars |
| `features/cart/store.ts` | war source tracking |
| `app/actions/orders.ts` | war stock decrement |
| `app/admin/wars/page.tsx` | sold count display |

## Verification

1. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
2. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin/wars` → 200
3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/products` → 200
4. Manual test: create war → check homepage countdown → war ends → check post-war price → 7 days check sale price

## Related

- [[FLOW_wars]] — War pricing lifecycle & auto-conversion
- [[TABLE_wars]] — War events table
- [[TABLE_war_items]] — War items table

---

*Back to [[00-index]]*
