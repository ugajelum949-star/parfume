---
aliases: [security, security-fix, security-plan]
tags: [plan, security]
last_updated: 2026-08-14
---

# Security Fix Plan

## S1: Signed Token untuk Invoice & Proof Upload

### Problem

`/invoice/[id]` bisa diakses siapapun yang tahu order ID (UUID). `/api/order/proof` menerima upload tanpa verifikasi — siapapun bisa ubah status order orang lain jadi PROCESSING.

### Solution: HMAC-SHA256 Signed Token

Order ID saja tidak cukup. Setiap order harus punya **token unik** yang hanya diketahui sistem dan customer yang punya order.

### Flow Baru

```
1. Customer place order
   └→ createOrder() generates token = HMAC(secret, orderId)
   └→ return { orderId, token }

2. Redirect ke /invoice/{orderId}?token={token}

3. Invoice page
   └→ Render normal (token di URL, tidak perlu validasi di sini)

4. Upload proof
   └→ Customer kirim: { file, orderId, token }
   └→ /api/order/proof validates: HMAC(secret, orderId) === token
   └→ Jika valid → proses
   └→ Jika invalid → 403 Forbidden
```

### Implementation

#### 1. Token Utility

**File baru: `lib/token.ts`**

```typescript
import { createHmac, randomBytes } from 'crypto'

const SECRET = process.env.ORDER_TOKEN_SECRET || 'fallback-dev-secret-change-in-production'

export function generateOrderToken(orderId: string): string {
  return createHmac('sha256', SECRET).update(orderId).digest('hex')
}

export function verifyOrderToken(orderId: string, token: string): boolean {
  const expected = generateOrderToken(orderId)
  // Constant-time comparison to prevent timing attacks
  if (expected.length !== token.length) return false
  let result = 0
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ token.charCodeAt(i)
  }
  return result === 0
}
```

#### 2. Order Creation — Return Token

**File: `app/actions/orders.ts`**

```typescript
import { generateOrderToken } from '@/lib/token'

// Di dalam createOrder(), setelah order.insert:
const token = generateOrderToken(order.id)

return { success: true, orderId: order.id, token }
```

#### 3. CartClient — Redirect dengan Token

**File: `app/cart/CartClient.tsx`**

```typescript
// Ganti:
router.push(`/invoice/${order.orderId}`)

// Menjadi:
router.push(`/invoice/${order.orderId}?token=${order.token}`)
```

#### 4. Invoice Page — Pass Token ke Client

**File: `app/invoice/[id]/page.tsx`**

```typescript
// Di server component, baca token dari searchParams
export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { id } = await params
  const { token } = await searchParams
  // ... fetch order ...

  return (
    <InvoiceClient
      order={order}
      items={orderItems}
      orderId={id}
      token={token || ''}  // pass token ke client
    />
  )
}
```

#### 5. InvoiceClient — Kirim Token saat Upload

**File: `app/invoice/[id]/InvoiceClient.tsx`**

```typescript
// Tambah prop
type Props = {
  order: Order
  items: OrderItem[]
  orderId: string
  token: string  // ← baru
}

// Di handleProofUpload:
const fd = new FormData()
fd.append('file', file)
fd.append('orderId', orderId)
fd.append('token', token)  // ← tambah token
const res = await fetch('/api/order/proof', { method: 'POST', body: fd })
```

#### 6. Proof API — Validasi Token

**File: `app/api/order/proof/route.ts`**

```typescript
import { verifyOrderToken } from '@/lib/token'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const orderId = formData.get('orderId') as string | null
  const token = formData.get('token') as string | null

  if (!file || !orderId || !token) {
    return NextResponse.json({ error: 'file, orderId, and token are required' }, { status: 400 })
  }

  // ✅ Validate token
  if (!verifyOrderToken(orderId, token)) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 })
  }

  // ... rest of existing logic
}
```

#### 7. Environment Variable

**File: `.env`**

```
ORDER_TOKEN_SECRET=<random-64-char-hex>
```

Generate secret:
```bash
openssl rand -hex 32
```

### Security Properties

| Property | Status |
|----------|--------|
| Token unik per order | ✅ HMAC-SHA256 |
| Tidak bisa di-guess | ✅ 256-bit secret |
| Tidak bisa di-reuse lintas order | ✅ Token = f(orderId) |
| Timing-safe comparison | ✅ Constant-time |
| Tidak perlu storage | ✅ Deterministic (same input = same output) |
| Customer asli tidak terganggu | ✅ Token otomatis di URL |

### Attack yang Dicegah

| Attack | Sebelum | Sesudah |
|--------|---------|---------|
| Upload proof ke order orang lain | ✅ Bisa | ❌ Token tidak cocok → 403 |
| Brute-force order ID | ✅ Bisa | ❌ Perlu tahu token juga |
| Bot upload massal | ✅ Bisa | ❌ Token wajib |

### Edge Cases

- **Customer bookmark invoice URL** → Aman, token tetap valid (deterministic)
- **Customer share URL ke orang lain** → Orang lain bisa LIHAT invoice, tapi TIDAK bisa upload proof (butuh token yang benar — dan token sudah di URL, jadi technically bisa. Tapi ini acceptable risk — lihat invoice tidak berbahaya, upload proof yang berbahaya)
- **Token di URL bisa dilihat di browser history** → Acceptable, same-site cookie policy melindungi
- **Order tanpa token (legacy)** → API return 400 "token required"

---

## S2: Rate Limit + Sanitize /api/order/[id]

### Problem

`/api/order/[id]` mengembalikan semua field termasuk `ip_address` dan `shipping_address` tanpa auth.

### Fix

**File: `app/api/order/[id]/route.ts`**

1. Tambah rate limit: 10 req/menit/IP (pakai `lib/ratelimit.ts`)
2. Sembunyikan sensitive fields dari response:

```typescript
// Filter response — jangan return semua fields
const safeOrder = {
  id: order.id,
  status: order.status,
  total: order.total,
  customerName: order.customerName,
  createdAt: order.createdAt,
  items: orderItems,
}
// JANGAN return: ipAddress, shippingAddress, customerPhone, paymentMethodId
```

---

## S3: Session Expiry

### Problem

Cookie `auth_session` tidak punya `maxAge` — session infinite sampai browser di-close.

### Fix

**File: `app/actions/auth.ts`**

```typescript
// Ganti cookie set:
cookies().set(COOKIE_NAME, user.id, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60,  // ← 7 hari
})
```

---

## S4: Blog Content XSS

### Problem

Blog detail page pakai `dangerouslySetInnerHTML` untuk render markdown content. Jika admin account compromised, bisa inject malicious script.

### Fix

```bash
npm install isomorphic-dompurify
```

```typescript
import DOMPurify from 'isomorphic-dompurify'

// Di blog detail page:
const cleanContent = DOMPurify.sanitize(post.content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class'],
})

<div dangerouslySetInnerHTML={{ __html: cleanContent }} />
```

---

## S5: JSON-LD Escape

### Problem

JSON-LD pakai `dangerouslySetInnerHTML` — jika data produk mengandung `</script>`, bisa break page.

### Fix

JSON sudah aman dari injection karena `JSON.stringify()` handle special characters. Tapi tambah explicit escape:

```typescript
const jsonLd = { /* ... */ }
const jsonStr = JSON.stringify(jsonLd)
  .replace(/</g, '\\u003c')
  .replace(/>/g, '\\u003e')
  .replace(/&/g, '\\u0026')

return (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: jsonStr }}
  />
)
```

---

## S6: Upload Validation

### Problem

`uploadImage` server action tidak validate MIME type atau file size.

### Fix

**File: `app/actions/upload.ts`**

```typescript
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function uploadImage(base64Data: string, fileName: string) {
  // Validate MIME type
  const mimeMatch = base64Data.match(/^data:(image\/[a-z]+);base64,/)
  if (!mimeMatch || !ALLOWED_MIMES.includes(mimeMatch[1])) {
    throw new Error('Only JPG, PNG, and WebP images are allowed')
  }

  // Validate size
  const base64 = base64Data.split(',')[1]
  const sizeInBytes = Math.ceil((base64.length * 3) / 4)
  if (sizeInBytes > MAX_FILE_SIZE) {
    throw new Error('File size must be under 20MB')
  }

  // ... upload to S3
}
```

---

## S7-S9: npm audit + Rate Limiting

### S7: npm vulnerabilities

```bash
npm audit fix
npm audit fix --force  # if needed
```

### S8: API Rate Limiting

Wrap public endpoints dengan rate limiter:

```typescript
// app/api/order/proof/route.ts
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(`proof:${ip}`, 5, 60)) {  // 5 per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  // ...
}
```

### S9: Upload Rate Limit

Gabungkan dengan S6 — `uploadImage` sudah punya rate limit dari S8.

---

## Execution Order

| Order | Issue | Effort | Fix |
|-------|-------|--------|-----|
| 1 | S3 | 5 menit | Session maxAge |
| 2 | S1 | 30 menit | Signed token |
| 3 | S2 | 15 menit | Rate limit + sanitize response |
| 4 | S6 | 15 menit | Upload validation |
| 5 | S4 | 10 menit | DOMPurify blog |
| 6 | S5 | 5 menit | JSON-LD escape |
| 7 | S7 | 5 menit | npm audit fix |
| 8 | S8 | 10 menit | API rate limit |
| 9 | S9 | — | Sama dengan S6+S8 |

**Total: ~95 menit**

---

*Back to [[00-index]]*
