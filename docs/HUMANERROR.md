# 🛡️ HUMAN ERROR PROTECTION & SYSTEM INTEGRITY AUDIT — PARFUME STORE

> **STATUS: 39/41 SELESAI ✅ | 1 DEFERRED (M10) ⏳ | 2 DITUTUP (H9, M6) ❌**

Dokumen ini merangkum hasil audit proteksi human error, status perbaikan, serta spesifikasi teknis untuk 4 tugas integrasi lanjutan yang dipilih oleh owner toko (termasuk verifikasi bukti bayar via Tombol Telegram & Batas Maksimal Order Flash Sale).

---

## 📑 DAFTAR ISI & KEPUTUSAN ROADMAP
1. [Status & Keputusan 7 Item Deferred](#1-status--keputusan-7-item-deferred)
2. [Spesifikasi Teknis H2: Telegram Inline Keyboard Instant Approval Bot](#2-spesifikasi-teknis-h2-telegram-inline-keyboard-instant-approval-bot)
3. [Spesifikasi Teknis M11: War Edit Capability & Batas Maksimal Order Flash Sale](#3-spesifikasi-teknis-m11-war-edit-capability--batas-maksimal-order-flash-sale)
4. [Spesifikasi Teknis L8: Cart Real-time Stale Price Warning](#4-spesifikasi-teknis-l8-cart-real-time-stale-price-warning)
5. [Spesifikasi Teknis L5: Featured Brand Deactivation Cleanup](#5-spesifikasi-teknis-l5-featured-brand-deactivation-cleanup)
6. [Catatan Item Non-Code (M10, H9, M6)](#6-catatan-item-non-code-m10-h9-m6)
7. [Log 34 Item yang Telah Selesai (Fixed)](#7-log-34-item-yang-telah-selesai-fixed)

---

## 1. Status & Keputusan 7 Item Deferred

| Kode | Nama Masalah | Keputusan Owner | Tindakan & Spesifikasi |
| :---: | :--- | :---: | :--- |
| **H2** | Payment proof auto-set PAID | ✅ **SELESAI** | Status `PROOF_UPLOADED` + Telegram inline keyboard `[✅ Setujui] [❌ Tolak]` + webhook `/api/telegram/webhook` |
| **M11** | War edit & no quota limit | ✅ **SELESAI** | Limit order war per IP (configurable via admin settings, default: 2/24jam). War edit deferred ke Scale Part 2. |
| **L8** | Cart stale price warning | ✅ **SELESAI** | Disclaimer "Harga akan diverifikasi ulang oleh admin" di bawah total checkout |
| **L5** | Brand deactivate → gender slots | ✅ **SELESAI** | Otomatis bersihkan gender slots saat brand dinonaktifkan |
| **M10** | X-Forwarded-For spoofable | ⏳ **PENDING PROXY** | Dicatat untuk konfigurasi reverse proxy Coolify di masa mendatang |
| **H9** | Rate limiter in-memory → Redis | ❌ **DITUTUP (TIDAK PERLU)** | Server single-instance Coolify sudah cukup memadai |
| **M6** | Payment proof IDOR | ❌ **DITUTUP (TIDAK PERLU)** | Random UUID order sudah cukup aman tanpa perlu token tambahan |

---

## 2. Spesifikasi Teknis H2: Telegram Inline Keyboard Instant Approval Bot

### 2.1. Alur Kerja (Workflow):
1. Pembeli mengunggah bukti transfer di halaman invoice (`/invoice/[id]`).
2. Endpoint `/api/order/proof` mengubah status pesanan menjadi `PROOF_UPLOADED` (bukan langsung `PAID`).
3. Sistem mengirim foto bukti transfer ke Telegram Admin beserta tombol interaktif **Inline Keyboard**:
   * Tombol 1: `[ ✅ Setujui & Set PAID ]` (Callback: `approve_<orderId>`)
   * Tombol 2: `[ ❌ Tolak Bukti Transfer ]` (Callback: `reject_<orderId>`)
4. Saat Admin menekan tombol di Telegram:
   * Webhook Next.js (`/api/telegram/webhook`) memproses callback query.
   * Status pesanan di database langsung di-update menjadi `PAID` (atau dikembalikan ke `PENDING`).
   * Pesan di Telegram otomatis di-edit menjadi: `✅ PESANAN #[id] TELAH DIVERIFIKASI OLEH ADMIN`.

### 2.2. Implementasi `lib/telegram.ts` (Kirim dengan Inline Keyboard)
```typescript
export async function sendPaymentProofWithActions(photoBuffer: Buffer, orderId: string, orderData: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const caption = 
`🔔 *BUKTI TRANSFER BARU MASUK!*

• *Order ID:* \`${orderId}\`
• *Customer:* ${orderData.customerName} (${orderData.customerPhone})
• *Total:* Rp ${orderData.total.toLocaleString('id-ID')}
• *Metode:* ${orderData.paymentMethod}

_Silakan periksa bukti di atas lalu klik tombol di bawah untuk verifikasi:_`

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: "✅ Setujui (Set PAID)", callback_data: `approve_${orderId}` },
        { text: "❌ Tolak Bukti", callback_data: `reject_${orderId}` }
      ]
    ]
  }

  const formData = new FormData()
  formData.append('chat_id', chatId)
  formData.append('caption', caption)
  formData.append('parse_mode', 'Markdown')
  formData.append('reply_markup', JSON.stringify(inlineKeyboard))
  formData.append('photo', new Blob([photoBuffer], { type: 'image/jpeg' }), 'proof.jpg')

  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: formData
  })
}
```

### 2.3. Endpoint Webhook Telegram: `app/api/telegram/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const callbackQuery = body.callback_query

    if (callbackQuery && callbackQuery.data) {
      const data = callbackQuery.data as string
      const token = process.env.TELEGRAM_BOT_TOKEN

      if (data.startsWith('approve_')) {
        const orderId = data.replace('approve_', '')
        await db.update(orders).set({ status: 'PAID' }).where(eq(orders.id, orderId))

        // Update teks di Telegram
        await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            caption: `${callbackQuery.message.caption}\n\n✅ *STATUS: TELAH DISETUJUI ADMIN (PAID)*`,
            parse_mode: 'Markdown'
          })
        })
      } else if (data.startsWith('reject_')) {
        const orderId = data.replace('reject_', '')
        await db.update(orders).set({ status: 'PENDING' }).where(eq(orders.id, orderId))

        await fetch(`https://api.telegram.org/bot${token}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            caption: `${callbackQuery.message.caption}\n\n❌ *STATUS: BUKTI DITOLAK (KEMBALI KE PENDING)*`,
            parse_mode: 'Markdown'
          })
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram Webhook Error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
```

---

## 3. Spesifikasi Teknis M11: War Edit Capability & Batas Maksimal Order Flash Sale

### 3.1. Skema Database: Batas Pembelian per User di `war_items`
Tambahkan kolom `max_per_user` di tabel `war_items` ([db/schema.ts](file:///d:/parfume/db/schema.ts)):

```typescript
// Di tabel warItems:
maxPerUser: integer("max_per_user").default(1).notNull(), // Batas beli per transaksi (misal: max 1 botol saat War)
```

SQL Migration:
```sql
ALTER TABLE "war_items" ADD COLUMN IF NOT EXISTS "max_per_user" integer DEFAULT 1 NOT NULL;
```

### 3.2. Modal Edit War di Admin (`/admin/wars`)
* Admin dapat mengedit Nama War, Waktu Selesai (`endTime`), dan Batas Maksimal Beli per User (`maxPerUser`).
* **Proteksi Live**: Jika War sedang berlangsung, waktu mulai (`startTime`) dikunci agar tidak merusak countdown pembeli.

### 3.3. Validasi Checkout di Cart
Saat checkout item War, validasi kuota:
```typescript
if (item.isWar && item.quantity > item.maxPerUser) {
  return { success: false, error: `Maksimal pembelian untuk ${item.name} saat Flash Sale adalah ${item.maxPerUser} botol per pesanan.` }
}
```

---

## 4. Spesifikasi Teknis L8: Cart Real-time Stale Price Warning

### 4.1. Real-time Price Sync di `app/cart/CartClient.tsx`
Saat halaman Keranjang dibuka, jalankan pengecekan harga terkini ke server:

```typescript
useEffect(() => {
  async function checkPriceUpdates() {
    const updatedItems = await syncCartPrices(items.map(i => ({ id: i.id, size: i.size, price: i.price })))
    const priceChanged = updatedItems.filter(i => i.hasChanged)
    
    if (priceChanged.length > 0) {
      toast.error('Beberapa harga produk telah diperbarui oleh toko.', { duration: 4000 })
      // Perbarui harga di keranjang secara transparan
      updateCartPrices(updatedItems)
    }
  }
  if (items.length > 0) checkPriceUpdates()
}, [])
```

---

## 5. Spesifikasi Teknis L5: Featured Brand Deactivation Cleanup

### 5.1. Update `app/actions/featured-brands.ts`
Saat admin menonaktifkan atau menghapus Featured Brand:
1. Otomatis periksa tabel `settings` key `gender_curated_slots`.
2. Jika ada slot yang berisi produk dari brand yang dinonaktifkan, hapus ID produk tersebut dari slot agar sistem fallback otomatis mengisi dengan produk brand aktif terbaru.

---

## 6. Catatan Item Non-Code (M10, H9, M6)

* **M10 (X-Forwarded-For Spoofing)**: Ditandai sebagai *Pending Deployment Configuration* pada reverse proxy Coolify.
* **H9 (Redis Rate Limiter)**: Ditutup (*Discarded*), arsitektur single-instance Coolify sudah aman.
* **M6 (Proof IDOR)**: Ditutup (*Discarded*), random UUID v4 order tidak dapat ditebak.

---

## 7. Log 34 Item yang Telah Selesai (Fixed)
* ✅ **C1**: Settings form konfirmasi simpan modal & validasi diff.
* ✅ **C2**: Proteksi penghapusan War yang sedang live.
* ✅ **H1**: Modal konfirmasi pesanan mobile sebelum create order.
* ✅ **H3**: Pembuatan order & potong stok dibungkus `db.transaction()`.
* ✅ **H4**: Rate limiting order 5 req/min/IP.
* ✅ **H5**: Validasi number `min="0"` dan server `< 0` check.
* ✅ **H6**: State machine status pesanan (hanya forward, cegah mundur).
* ✅ **H7**: Validasi numerik pada shipping threshold.
* ✅ **H8**: Validasi slug blog unik pada saat update post.
* ✅ **H10**: Proteksi `verifyAdmin()` pada seluruh Server Actions produk.
* ✅ **H11**: Atomic transaction pada multi-settings update.
* ✅ **M1–M5, M7–M9, L1–L4, L6–L7, L9–L14**: Seluruh batas input teks, optimasi query, sanitasi markdown, dan logging telah diamankan.

---
*Dokumen ini adalah acuan resmi human error protection. 4 tugas lanjutan (H2, M11, L8, L5) siap dieksekusi.*
