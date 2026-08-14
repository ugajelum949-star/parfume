---
aliases: [hacking, threat-model, security-hardening, attacker]
tags: [plan, security, hardening]
last_updated: 2026-08-14
---

# PLAN_hacking — Threat Model & Hardening

> **Mindset: Anggap semua orang adalah potensial attacker.** Kompetitor iri, bot spam, script kiddie, atau customer yang tidak puas.

---

## Daftar Ancaman

### Kategori 1: Akun & Akses

| #   | Ancaman                                 | Target                             | Impact           |
| --- | --------------------------------------- | ---------------------------------- | ---------------- |
| H1  | Brute force admin login                 | `/login`                           | Account takeover |
| H2  | Session hijacking                       | Cookie `auth_session`              | Admin access     |
| H3  | Admin password leak                     | `.env`, source code                | Full control     |
| H4  | IDOR (Insecure Direct Object Reference) | `/invoice/[id]`, `/api/order/[id]` | Data leakage     |

### Kategori 2: Data Manipulation

| #   | Ancaman                                 | Target             | Impact          |     |
| --- | --------------------------------------- | ------------------ | --------------- | --- |
| H5  | Upload fake payment proof               | `/api/order/proof` | Gratis barang   |     |
| H6  | Change product prices via API           | `/api/settings`    | Revenue loss    |     |
| H7  | Cancel/manipulate other people's orders | `/api/order/[id]`  | Chaos           |     |
| H8  | Inject malicious blog content           | `/admin/blog`      | XSS to visitors |     |

### Kategori 3: Abuse & Flooding

| # | Ancaman | Target | Impact |
|---|---------|--------|--------|
| H9 | DDoS / flood API endpoints | All `/api/*` | Site down |
| H10 | S3 storage abuse (upload raksasa) | Upload endpoint | Cost explosion |
| H11 | Telegram bot flooding | `/api/order/proof` | Spam admin |
| H12 | Scraping all products + prices | `/products`, `/api/*` | Competitive intel |

### Kategori 4: War/FOMO Abuse

| # | Ancaman | Target | Impact |
|---|---------|--------|--------|
| H13 | Bot beli semua war stock | War checkout | Real customer tidak kebagian |
| H14 | War items manipulation | `/admin/wars` | Wrong pricing |
| H15 | Exploit auto-conversion | `checkExpiredWars()` | Premature product listing |

### Kategori 5: Injection & XSS

| # | Ancaman | Target | Impact |
|---|---------|--------|--------|
| H16 | XSS via testimonial content | Homepage display | Cookie steal |
| H17 | XSS via blog content | Blog detail page | Redirect/phishing |
| H18 | XSS via product name/brand | Product pages | Stored XSS |
| H19 | SQL injection | All DB queries | Data leak (low risk — Drizzle ORM parameterized) |

---

## Detailed Analysis & Mitigation

### H1: Brute Force Admin Login

**Attack:**
```
Script kirim 1000 request /login dengan password berbeda
→ Rate limit sudah ada: 5 attempts/min/IP
→ Tapi attacker pakai 200 IP dari VPN/proxy
→ 200 × 5 = 1000 attempts per menit
```

**Current defense:** Rate limit 5/min/IP (`lib/ratelimit.ts`)

**Gap:** IP rotation (VPN/proxy) bisa bypass per-IP rate limit.

**Mitigation:**

| Layer | Action |
|-------|--------|
| Per-IP | 5 attempts/min (sudah ada) |
| Per-account | 10 attempts/jam per email → lock 1 jam |
| CAPTCHA | Tambah CAPTCHA setelah 3 failed attempts |
| Alert | Kirim Telegram notif jika ada 10+ failed attempts dalam 5 menit |
| IP block | Block IP yang gagal 20+ kali dalam 1 jam |

**Implementation:**
```typescript
// lib/ratelimit.ts — tambah per-account limiter
const accountAttempts = new Map<string, { count: number; resetAt: number }>()

export function checkAccountLock(email: string): boolean {
  const data = accountAttempts.get(email)
  if (!data) return false
  if (Date.now() > data.resetAt) {
    accountAttempts.delete(email)
    return false
  }
  return data.count >= 10
}

export function recordFailedAttempt(email: string) {
  const data = accountAttempts.get(email) || { count: 0, resetAt: Date.now() + 3600000 }
  data.count++
  accountAttempts.set(email, data)
}
```

---

### H2: Session Hijacking

**Attack:**
```
1. Attacker dapat cookie auth_session dari:
   - Network sniffing (HTTP tanpa HTTPS)
   - XSS injection
   - Physical access ke komputer korban
2. Attacker pakai cookie untuk login sebagai admin
```

**Current defense:** httpOnly, secure, sameSite: strict

**Gap:** Tidak ada `maxAge` (sudah dibahas di S3). Tidak ada session rotation.

**Mitigation:**

| Layer | Action |
|-------|--------|
| Cookie | Tambah `maxAge: 7 hari` (S3) |
| Rotation | Regenerate session ID setelah login |
| IP binding | Simpan IP saat login, cek di setiap request |
| UA binding | Simpan User-Agent saat login, cek di setiap request |

**IP + UA binding:**
```typescript
// Simpan saat login
cookies().set('auth_session', user.id, {
  // ... existing options
})
cookies().set('auth_session_ip', ip, {
  httpOnly: true, secure: true, sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60,
})
cookies().set('auth_session_ua', userAgent, {
  httpOnly: true, secure: true, sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60,
})

// Cek di verifyAdmin()
const ip = cookies().get('auth_session_ip')?.value
const ua = cookies().get('auth_session_ua')?.value
if (ip !== currentIp || ua !== currentUa) {
  // Session compromised — logout
  cookies().delete('auth_session')
  redirect('/login')
}
```

**Trade-off:** IP binding bisa break kalau user pindah WiFi (mobile). Solusi: hanya warn, jangan block. Atau cek IP only untuk admin sessions.

---

### H3: Admin Password Leak

**Attack:**
```
1. Source code diakses (GitHub leak, insider)
2. .env file bocor
3. Database dump bocor
```

**Mitigation:**

| Layer | Action |
|-------|--------|
| Password | Gunakan password kuat (16+ chars, mixed) |
| Hash | bcrypt dengan cost factor 12 (sudah ada) |
| .env | Tidak di-commit ke git (sudah ada di .gitignore) |
| DB backup | Encrypt backup files |
| Secret rotation | Ganti `ORDER_TOKEN_SECRET` periodically |

**Yang belum ada:**
- ❌ Login notification ke admin (Telegram alert saat ada login baru)
- ❌ IP allowlist untuk admin (hanya IP tertentu yang bisa akses `/admin/*`)

---

### H4: IDOR (Insecure Direct Object Reference)

**Attack:**
```
GET /api/order/abc-123 → dapat semua data order
GET /api/order/def-456 → dapat semua data order lain
Cukup brute-force UUID (122 bit = 5.3 × 10^36 combinations → tidak feasible)
```

**Current risk:** Rendah karena UUID sulit di-guess. Tapi tetap:

**Mitigation:**
- Jangan return sensitive fields dari API publik (S2 di PLAN_security)
- Tambah rate limit (S8 di PLAN_security)
- Invoice page: tambah signed token (S1 di PLAN_security)

---

### H5: Upload Fake Payment Proof

**Covered by:** S1 (signed token) + S6 (upload validation)

**Additional:** Max 3 uploads per order. Setelah 3x, tolak.

```typescript
// app/api/order/proof/route.ts
const uploadCount = await db.select({ count: count() })
  .from(orderProofs)  // atau track di order table
  .where(eq(orderProofs.orderId, orderId))

if (uploadCount[0].count >= 3) {
  return NextResponse.json({ error: 'Maximum upload attempts reached' }, { status: 429 })
}
```

**Note:** Butuh tabel baru `order_proofs` atau field `proofUploadCount` di orders.

---

### H6: Change Product Prices via API

**Current state:** Tidak ada `/api/products/[id]` PUT endpoint. Hanya admin yang bisa edit via Server Actions.

**Risk:** Low — tapi cek apakah ada hidden API endpoints.

**Mitigation:**
- Pastikan tidak ada `PUT`/`PATCH` endpoint untuk products selain admin server actions
- Semua mutations via `'use server'` + `verifyAdmin()` (sudah ada)
- Tambah audit log untuk price changes

---

### H7: Order Manipulation

**Current state:** `/api/order/[id]` hanya GET, tidak ada PUT/DELETE.

**Risk:** Low. Tapi admin panel bisa di-exploit jika admin account compromised.

**Mitigation:**
- Audit log untuk semua status changes
- Notification ke customer setiap kali status berubah
- Status只能前进 (PENDING→PROCESSING→SHIPPED→COMPLETED), tidak bisa mundur

---

### H8: Malicious Blog Content (XSS)

**Covered by:** S4 (DOMPurify)

**Additional concern:** Jika admin account compromised, attacker bisa inject XSS ke blog yang dibaca ribuan visitor.

**Mitigation:**
- DOMPurify sudah cukup untuk XSS prevention
- Tambah CSP (Content Security Policy) headers
- Blog content preview sebelum publish (admin only)

---

### H9: DDoS / Flood API

**Attack:**
```
Attacker kirim 10,000 request/second ke:
- /api/settings (semua settings bocor)
- /api/payment-methods (semua payment methods bocor)
- /api/order/proof (server busy handle upload)
```

**Mitigation:**

| Layer | Action |
|-------|--------|
| Infrastructure | Cloudflare / CDN rate limiting (deployment level) |
| Application | Rate limit per IP (sudah ada di PLAN_security S8) |
| Caching | Cache GET responses (settings, payment-methods) |
| Body limit | Next.js 50MB body limit (sudah ada) |
| Timeout | AbortController 10s untuk semua external calls |

**Caching untuk /api/settings:**
```typescript
// app/api/settings/route.ts
export const revalidate = 60  // cache 60 detik
```

---

### H10: S3 Storage Abuse

**Attack:**
```
Attacker upload 10,000 file × 20MB = 200GB
→ S3 cost: ~$5/GB = $1,000
```

**Mitigation:**

| Layer | Action |
|-------|--------|
| Per-request | Max 20MB (sudah ada) |
| Per-order | Max 3 uploads per order |
| Per-IP | Max 5 uploads per jam |
| Per-account | Max 20 uploads per hari (admin) |
| S3 bucket | Set lifecycle policy: auto-delete after 90 hari |
| S3 bucket | Set storage quota: 10GB max |

---

### H11: Telegram Bot Flooding

**Attack:**
```
Attacker upload 1000 fake proofs
→ 1000 Telegram messages ke admin
→ Admin bot muted, miss real payment proof
```

**Mitigation:**
- Rate limit proof uploads (S8)
- Max 3 per order
- Debounce: jangan kirim ke Telegram jika order sudah PROCESSING
- Batch: kumpulkan proofs, kirim resume setiap jam

---

### H12: Product Scraping

**Attack:**
```
Bot scrape semua produk:
- Nama, brand, harga, deskripsi, gambar
- Kirim ke kompetitor
```

**Current state:** Semua data produk di-fetch server-side (SSR). Client-side bisa di-scrape juga.

**Mitigation (defensive, bukan block total):**

| Layer | Action |
|-------|--------|
| Rate limit | Max 30 requests/menit/IP ke /products |
| No API | Tidak ada public API untuk products (sudah benar) |
| Image protection | Tambah watermark (sudah ada) |
|robots.txt | Block bot scrapers (partial) |

**robots.txt:**
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/admin/' },
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

---

### H13: Bot Beli Semua War Stock

**Attack:**
```
Bot submit 50 order sekaligus saat war dimulai
→ Semua stok habis dalam 1 detik
→ Real customer tidak kebagian
→ Bot jual kembali dengan markup
```

**Current state:** Tidak ada proteksi. Checkout langsung.

**Mitigation:**

| Layer | Action |
|-------|--------|
| Per-IP | Max 1 order per war per IP |
| Per-session | Max 2 items per war per checkout |
| CAPTCHA | Tambah CAPTCHA saat checkout war items |
| Queue system | First-come-first-served dengan queue (advanced) |
| Stok validation | Validate stok di server-side SEBELUM insert order |

**Server-side stock validation (critical):**
```typescript
// app/actions/orders.ts — di createOrder
if (item.source === 'war' && item.warItemId) {
  const [warItem] = await db.select()
    .from(warItems)
    .where(eq(warItems.id, item.warItemId))

  if (!warItem || warItem.stock < item.quantity) {
    return { success: false, error: `${warItem?.name} stok tidak cukup` }
  }
}
```

---

### H14-H15: War Manipulation & Auto-Conversion

**Risk:** Low — hanya admin yang bisa akses war CRUD.

**Additional:**
- Log semua perubahan war settings
- Validate: war tidak bisa di-edit setelah dimulai
- Auto-conversion hanya jalan sekali (flag `converted`)

---

### H16-H18: Stored XSS via User Content

**X vectors:**

| Vector | Risk | Mitigation |
|--------|------|------------|
| Testimonial content | Medium — admin-generated | Sanitize with DOMPurify |
| Blog content | Medium — admin-generated | Sanitize with DOMPurify |
| Product name/brand | Low — admin-generated | Sanitize with DOMPurify |

**All admin-generated content** tetap perlu sanitization karena:
1. Admin account bisa compromised
2. Human error (paste malicious code tidak sengaja)

**Universal sanitize function:**
```typescript
// lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'src', 'alt'],
  })
}
```

---

### H19: SQL Injection

**Risk:** Sangat rendah — Drizzle ORM menggunakan parameterized queries.

**Verification:**
```bash
grep -rn "\${" db/schema.ts  # Cek raw SQL interpolation
grep -rn "sql\`" lib/ lib/db.ts  # Cek raw SQL queries
```

**Mitigation:**
- Drizzle ORM sudah parameterized by default ✅
- Tapi cek raw SQL queries di `lib/shipping.ts` dan `app/actions/orders.ts`
- Jangan pernah pakai string interpolation di SQL

---

## CSP (Content Security Policy) Header

**File: `next.config.ts`**

```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js butuh unsafe-inline
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https://*.cloudhost.id https://placehold.co data: blob:",
      "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]
```

---

## Monitoring & Alerting

### Telegram Alerts untuk Security Events

```typescript
// lib/security-alerts.ts
import { sendTelegramMessage } from '@/lib/telegram'

export async function alertSecurity(event: string, details: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_SECURITY_CHAT_ID  // Chat terpisah!
  if (!token || !chatId) return

  await sendTelegramMessage(token, chatId,
    `🔒 Security Alert\n\nEvent: ${event}\nDetails: ${details}\nTime: ${new Date().toISOString()}`
  )
}
```

### Events yang Perlu Alert

| Event | Trigger | Urgency |
|-------|---------|---------|
| Login attempt gagal 5x | Brute force | 🔴 High |
| Login dari IP baru | Possible compromise | 🟡 Medium |
| Upload proof gagal (invalid token) | Tampering attempt | 🟡 Medium |
| Rate limit hit | Flooding | 🟡 Medium |
| Large file upload (>10MB) | Storage abuse | 🟢 Low |
| Blog content change | Content integrity | 🟢 Low |

---

## Security Checklist

### Sebelum Deploy
- [ ] `ORDER_TOKEN_SECRET` di-set di production env (64 char hex)
- [ ] `NEXT_PUBLIC_BASE_URL` pakai HTTPS
- [ ] Session `maxAge: 7 hari`
- [ ] Rate limit aktif di semua public API
- [ ] DOMPurify install dan aktif di blog + testimonials
- [ ] CSP headers diaktifkan
- [ ] `.env` tidak di-commit ke git
- [ ] Admin password kuat (16+ chars)

### Monitoring
- [ ] Telegram alert untuk security events
- [ ] Error logging (Sentry atau sejenis)
- [ ] Uptime monitoring
- [ ] Log semua admin actions

### Periodic
- [ ] `npm audit fix` setiap bulan
- [ ] Ganti admin password setiap 3 bulan
- [ ] Review access logs
- [ ] Update dependencies

---

*See also: [[PLAN_security]], [[ADMIN_GUIDE]]*

---

*Back to [[00-index]]*
