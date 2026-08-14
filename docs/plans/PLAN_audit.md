---
aliases: [security-audit, audit-report, vuln-report]
tags: [security, audit]
last_updated: 2026-08-14
---

# Security Audit Report — Full Codebase Scan

> **Tanggal audit:** 2026-08-14
> **Scope:** Seluruh source code — API routes, server actions, components, lib
> **Metode:** Manual code review + automated grep

---

## Executive Summary

| Severity | Found | Fixed | Remaining |
|----------|:-----:|:-----:|:---------:|
| 🔴 Critical | 4 | 0 | **4** |
| 🟠 High | 2 | 0 | **2** |
| 🟡 Medium | 3 | 0 | **3** |
| 🟢 Low | 2 | 0 | **2** |
| **Total** | **11** | **0** | **11** |

---

## ✅ Yang Sudah Aman (Tidak Perlu Fix)

| # | Area | Status | Detail |
|---|------|:------:|--------|
| A1 | Rate limit semua API routes | ✅ | 4/4 routes punya rate limit |
| A2 | Login rate limit | ✅ | 5 attempts/min/IP |
| A3 | Session cookie | ✅ | httpOnly, secure, sameSite:strict, maxAge: 7 hari |
| A4 | verifyAdmin() di semua write actions | ✅ | products, settings, payments, testimonials, posts, banners |
| A5 | Blog content sanitized | ✅ | DOMPurify via isomorphic-dompurify |
| A6 | JSON-LD escaped | ✅ | Unicode escape `<`, `>`, `&` |
| A7 | Login error generic | ✅ | "Invalid credentials." — tidak leak user existence |
| A8 | Order API sanitize response | ✅ | Hanya return: id, total, status, createdAt, paymentMethodId |
| A9 | Payment methods hide account numbers | ✅ | Hanya return: id, type, label, qrisImageUrl |
| A10 | Settings hide secrets | ✅ | telegramBotToken, telegramChatId di-filter |
| A11 | Upload MIME validation | ✅ | jpeg/png/webp only |
| A12 | Upload size validation | ✅ | Max 20MB |
| A13 | UUID validation | ✅ | Order ID di-validate sebelum query |
| A14 | createOrder re-fetch prices | ✅ | Tidak trust client-side prices |
| A15 | Tidak ada eval/exec | ✅ | 0 matches |
| A16 | Tidak ada PUT/DELETE API routes | ✅ | Semua mutation via server actions |
| A17 | Drizzle ORM parameterized queries | ✅ | Tidak ada raw string SQL |

---

## 🔴 Critical Issues

### C1: `convertWarToProducts` — NO AUTH

**File:** `app/actions/wars.ts:95`

```typescript
export async function convertWarToProducts(warId: string) {
  const [war] = await db.select().from(wars).where(eq(wars.id, warId))
  if (!war || war.converted) return
  // ... inserts products from war items ...
}
```

**Masalah:** Server action ini **tidak punya `verifyAdmin()`**. Karena server actions bisa dipanggil dari client-side via `import { convertWarToProducts } from '@/app/actions/wars'`, siapapun yang tahu war ID bisa convert war menjadi produk.

**Impact:**
- Attacker convert war sebelum waktunya → produk muncul di catalog premature
- War items kehilangan stock tanpa ada order

**Fix:**
```typescript
export async function convertWarToProducts(warId: string) {
  await verifyAdmin()  // ← tambah ini
  // ...
}
```

**Catatan:** Function ini dipanggil dari `checkExpiredWars()` (yang jalan di homepage). Homepage adalah server component, jadi auth check tidak diperlukan di situ. Tapi karena function juga exported dan bisa dipanggil dari client, auth check tetap perlu.

---

### C2: `decrementWarStock` — NO AUTH

**File:** `app/actions/wars.ts:130`

```typescript
export async function decrementWarStock(warItemId: string, quantity: number) {
  const [item] = await db.select().from(warItems).where(eq(warItems.id, warItemId))
  if (!item || item.stock < quantity) return false
  await db.update(warItems).set({ stock: item.stock - quantity }).where(eq(warItems.id, warItemId))
  return true
}
```

**Masalah:** Tidak ada auth check. Siapapun bisa panggil dari client-side untuk mengurangi stok war item.

**Impact:**
- Attacker decrement stok tanpa beli → stok habis, real customer tidak kebagian
- Warfare: competitor sengaja habiskan stok

**Fix:**
```typescript
export async function decrementWarStock(warItemId: string, quantity: number) {
  await verifyAdmin()  // ← tambah ini
  // ... atau hanya bisa dipanggil dari createOrder (yang sudah auth)
}
```

---

### C3: `getOrders()` — NO AUTH, ALL PII EXPOSED

**File:** `app/actions/orders.ts:120`

```typescript
export async function getOrders() {
  try {
    return await db.select().from(orders).orderBy(desc(orders.createdAt))
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}
```

**Masalah:** Mengembalikan **SEMUA field** dari **SEMUA orders** — termasuk `customerName`, `customerPhone`, `shippingAddress`, `ipAddress`. Tidak ada auth check.

**Impact:**
- Client-side code yang import `getOrders` bisa akses semua data PII
- Meskipun dipanggil dari admin page (yang server component), function-nya tetap exported tanpa auth

**Fix:**
```typescript
export async function getOrders() {
  await verifyAdmin()  // ← tambah ini
  return await db.select().from(orders).orderBy(desc(orders.createdAt))
}
```

---

### C4: `getOrder(id)` — NO AUTH, ALL PII EXPOSED

**File:** `app/actions/orders.ts:129`

```typescript
export async function getOrder(id: string) {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) return null
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id))
    return { ...order, items }
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}
```

**Masalah:** Mengembalikan **SEMUA field** order termasuk PII. Tidak ada auth.

**Impact:** Sama dengan C3 — data leakage jika dipanggil dari client context.

**Fix:**
```typescript
export async function getOrder(id: string) {
  await verifyAdmin()  // ← tambah ini
  // ... existing logic
}
```

**Atau:** Jangan export function ini untuk client use. Buat versi public yang hanya return safe fields.

---

## 🟠 High Issues

### H1: Login Error Catch Block Leaks Internal Errors

**File:** `app/actions/auth.ts:57-59`

```typescript
} catch (error) {
    console.error('Login error:', error)
    const errObj = error as { code?: string, message?: string }
    return { error: `ERROR: ${errObj.message || String(error)}` }
}
```

**Masalah:** Jika terjadi error tak terduga (DB connection error, dll), error message dikirim ke client. Bisa leak:
- Database error messages
- Stack trace informasi
- Internal system details

**Fix:**
```typescript
} catch (error) {
    console.error('Login error:', error)
    return { error: 'Terjadi kesalahan. Silakan coba lagi.' }  // generic message
}
```

---

### H2: Upload Folder Parameter — Path Traversal Risk

**File:** `app/actions/upload.ts:7`

```typescript
export async function generateUploadUrl(folder: string, filename: string, contentType: string) {
    await verifyAdmin()
    // ...
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(folder, filename, contentType)
}
```

**Masalah:** `folder` parameter dikirim dari client. Jika tidak di-validate, attacker bisa:
- Upload ke folder yang salah: `../../admin/secrets`
- Overwrite file yang ada

**Risk level:** Medium karena admin-only, dan S3 key structure biasanya tidak support `..` traversal. Tapi tetap perlu validation.

**Fix:**
```typescript
const ALLOWED_FOLDERS = ['products', 'banners', 'testimonials', 'payments', 'homepage']

export async function generateUploadUrl(folder: string, filename: string, contentType: string) {
    await verifyAdmin()
    
    if (!ALLOWED_FOLDERS.includes(folder)) {
        throw new Error('Invalid upload folder')
    }
    // ...
}
```

---

## 🟡 Medium Issues

### M1: `createOrder` — NO RATE LIMIT (Spam Orders)

**File:** `app/actions/orders.ts:10`

```typescript
export async function createOrder(data: { ... }) {
  try {
    // ... langsung proses order
  }
}
```

**Masalah:** Tidak ada rate limit. Attacker bisa submit ratusan order palsu per menit.

**Impact:**
- Database pollution (ribuan order palsu)
- Stock depletion (setiap order mengurangi stock)
- Admin ribet handle order palsu

**Fix:**
```typescript
import { rateLimit } from '@/lib/ratelimit'

export async function createOrder(data: { ... }) {
  const ip = (await headers()).get('x-forwarded-for') || 'unknown'
  const rl = rateLimit(`order-create:${ip}`, 3, 60 * 1000)  // 3 orders per menit
  if (!rl.success) {
    return { success: false, error: 'Terlalu banyak order. Coba lagi nanti.' }
  }
  // ...
}
```

---

### M2: Error Logs Bisa Leak Sensitive Data

**File:** Multiple — `app/actions/orders.ts`, `app/api/*/route.ts`

```typescript
console.error('Error creating order:', error)
console.error('[proof] POST error:', e)
```

**Masalah:** Error objects bisa mengandung:
- Query strings (dengan data)
- Stack traces
- File paths

**Fix:** Gunakan structured logging, jangan log error objects langsung:
```typescript
console.error('[order] create failed:', error instanceof Error ? error.message : 'unknown')
```

---

### M3: SQL IN Query dengan User-Controlled Array

**File:** `app/actions/orders.ts:29`

```typescript
const dbProducts = productIds.length > 0
  ? await db.select().from(products).where(sql`${products.id} IN ${productIds}`)
  : []
```

**Masalah:** `productIds` berasal dari client request. Drizzle ORM parameterizes query ini (aman dari SQL injection), tapi:
- Array kosong bisa cause unexpected behavior
- Sangat banyak IDs bisa cause query timeout

**Risk:** Rendah — Drizzle handle dengan aman. Tapi tambah validation:
```typescript
if (productIds.length > 50) {
  return { success: false, error: 'Too many items' }
}
```

---

## 🟢 Low Issues

### L1: `checkExpiredWars` — NO AUTH (Acceptable)

**File:** `app/actions/wars.ts:138`

```typescript
export async function checkExpiredWars() {
  const now = new Date()
  const expired = await db.select().from(wars).where(...)
  for (const war of expired) {
    await convertWarToProducts(war.id)
  }
}
```

**Masalah:** Tidak ada auth. Tapi function ini hanya dipanggil dari homepage server component.

**Risk:** Rendah — tetap perlu fix `convertWarToProducts` (C1) agar client tidak bisa exploit.

---

### L2: Console.error di Production

**File:** Multiple locations

**Masalah:** `console.error` bisa membanjiri logging di production.

**Fix:** Gunakan error monitoring service (Sentry, LogRocket) daripada console.log.

---

## Fix Priority

| Priority | Issue | Effort | Fix |
|----------|-------|--------|-----|
| 🔴 Sekarang | C1 | 1 menit | Tambah `verifyAdmin()` ke `convertWarToProducts` |
| 🔴 Sekarang | C2 | 1 menit | Tambah `verifyAdmin()` ke `decrementWarStock` |
| 🔴 Sekarang | C3 | 1 menit | Tambah `verifyAdmin()` ke `getOrders` |
| 🔴 Sekarang | C4 | 1 menit | Tambah `verifyAdmin()` ke `getOrder` |
| 🠊 Hari ini | H1 | 2 menit | Generic error message di login |
| 🠊 Hari ini | H2 | 5 menit | Whitelist upload folders |
| 🟡 Minggu ini | M1 | 5 menit | Rate limit di createOrder |
| 🟡 Minggu ini | M2 | 10 menit | Structured logging |
| 🟡 Minggu ini | M3 | 2 menit | Max 50 product IDs |
| 🟢 Nanti | L1 | — | Covered by C1 fix |
| 🟢 Nanti | L2 | — | Setup error monitoring |

**Total fix effort: ~35 menit**

---

## Security Score Card

| Category | Score | Notes |
|----------|:-----:|-------|
| Authentication | 7/10 | Cookie settings bagus, tapi function exports tanpa auth |
| Authorization | 4/10 | **4 server actions tanpa verifyAdmin()** |
| Input Validation | 7/10 | Upload validated, tapi createOrder belum rate-limited |
| Data Protection | 6/10 | API routes sanitized, tapi server actions export raw data |
| XSS Prevention | 8/10 | DOMPurify aktif di blog, JSON-LD escaped |
| Rate Limiting | 8/10 | 4/5 endpoints covered (createOrder belum) |
| Error Handling | 5/10 | Login leak error message, console.error berlebihan |
| Infrastructure | 7/10 | HTTPS, CSP bisa ditambah |

**Overall: 53/70 (76%) → Target: 65/70 (93%) setelah fix**

---

*See also: [[PLAN_security]], [[PLAN_hacking]]*

---

*Back to [[00-index]]*
