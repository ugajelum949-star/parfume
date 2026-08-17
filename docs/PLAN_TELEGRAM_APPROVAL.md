# H2: Telegram Inline Keyboard Payment Approval

## Context
Upload bukti bayar auto-set PAID tanpa admin review. Fix: admin approve/reject via tombol Telegram.

## Workflow
```
User upload proof → Status: PROOF_UPLOADED → Telegram: foto + inline buttons
Admin tekan ✅ → Status: PAID → Telegram: edit caption "✅ DIVERIFIKASI"
Admin tekan ❌ → Status: PENDING → Telegram: edit caption "❌ DITOLAK"
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `lib/telegram.ts` | Modify | Tambah `sendPaymentProofWithActions()` — kirim foto + inline keyboard |
| `app/api/telegram/webhook/route.ts` | **CREATE** | Handle callback query dari tombol Telegram |
| `app/api/order/proof/route.ts` | Modify | Ubah `PAID` → `PROOF_UPLOADED`, pakai function baru |
| `app/actions/orders.ts` | Modify | Tambah status `PROOF_UPLOADED` ke ALLOWED_STATUSES |
| `app/admin/orders/[id]/OrderStatusUpdater.tsx` | Modify | Tambah `PROOF_UPLOADED` ke daftar status |
| `app/invoice/[id]/InvoiceClient.tsx` | Modify | Update status display untuk `PROOF_UPLOADED` |

## Implementation Steps

### Step 1: Add PROOF_UPLOADED status
- `app/actions/orders.ts`: Tambah `'PROOF_UPLOADED'` ke `ALLOWED_STATUSES`
- `app/admin/orders/[id]/OrderStatusUpdater.tsx`: Tambah ke status dropdown
- `app/invoice/[id]/InvoiceClient.tsx`: Tambah display untuk status ini

### Step 2: Update proof upload endpoint
- `app/api/order/proof/route.ts`: Ubah `status: 'PAID'` → `status: 'PROOF_UPLOADED'`
- Panggil `sendPaymentProofWithActions()` dari `lib/telegram.ts`

### Step 3: Create Telegram inline keyboard function
- `lib/telegram.ts`: Tambah `sendPaymentProofWithActions()`
- Kirim foto + caption + inline keyboard `[✅ Setujui] [❌ Tolak]`

### Step 4: Create webhook endpoint
- `app/api/telegram/webhook/route.ts`: Handle `callback_query`
- Parse `approve_<orderId>` / `reject_<orderId>`
- Update DB status
- Edit Telegram message caption

### Step 5: Setup webhook
- Set webhook: `POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<DOMAIN>/api/telegram/webhook`
- Test with real bot

## Verification
1. Upload bukti bayar → status = PROOF_UPLOADED (bukan PAID)
2. Telegram dapat foto + tombol ✅ ❌
3. Tekan ✅ → status = PAID, pesan Telegram edit
4. Tekan ❌ → status = PENDING, pesan Telegram edit
5. Admin bisa manual override di `/admin/orders/[id]`

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] Telegram bot sudah dibuat via @BotFather
- [ ] Bot token dan chat ID sudah ada di Coolify env vars
- [ ] Domain site punya HTTPS (Telegram webhook wajib HTTPS)
- [ ] Database backup sebelum migration

### Step 1: Database Migration

Tidak perlu schema change — status `PROOF_UPLOADED` disimpan sebagai string di kolom `text`. Tapi tambahkan validasi di code.

Tidak ada SQL migration yang diperlukan.

### Step 2: Environment Variables (Coolify)

Pastikan variabel berikut sudah ter-set di Coolify Dashboard → Environment Variables:

```
TELEGRAM_BOT_TOKEN=xxxxx        # Dari @BotFather
TELEGRAM_CHAT_ID=xxxxx          # Chat ID admin (dari @userinfobot)
NEXT_PUBLIC_BASE_URL=https://bestparfumestore.com  # Domain production
```

**Cara dapat TELEGRAM_CHAT_ID:**
1. Buka bot di Telegram
2. Kirim pesan apa saja ke bot
3. Buka: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
4. Cari `chat.id` di response

### Step 3: Set Webhook (Terminal)

Jalankan SETELAH deploy berhasil dan site accessible via HTTPS:

```bash
# Ganti dengan nilai sebenarnya
BOT_TOKEN="your-bot-token-here"
DOMAIN="https://bestparfumestore.com"

# Set webhook ke Telegram
curl -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${DOMAIN}/api/telegram/webhook\"}"

# Verifikasi webhook sudah ter-set
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
```

**Expected response `getWebhookInfo`:**
```json
{
  "ok": true,
  "result": {
    "url": "https://bestparfumestore.com/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "last_error_date": 0
  }
}
```

Jika `last_error_message` muncul, cek logs di Coolify.

### Step 4: Deploy ke Coolify

```bash
# Commit semua perubahan
git add -A
git commit -m "feat: Telegram payment approval bot with inline keyboard"

# Push ke main (auto-deploy via Coolify webhook)
git push origin main
```

Tunggu Coolify build selesai (~2-5 menit). Cek build logs di Coolify Dashboard.

### Step 5: Post-Deployment Verification

```bash
# 1. Cek webhook masih aktif
curl "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo" | jq '.result.url'

# 2. Test upload bukti bayar
# → Buka /invoice/<order-id>
# → Upload foto
# → Cek Telegram: harus menerima foto + tombol

# 3. Test tombol approve
# → Tekan ✅ di Telegram
# → Cek DB: status order = PAID
# → Cek Telegram: caption berubah jadi "✅ DIVERIFIKASI"

# 4. Test tombol reject
# → Upload bukti lagi untuk order lain
# → Tekan ❌ di Telegram
# → Cek DB: status order = PENDING
# → Cek Telegram: caption berubah jadi "❌ DITOLAK"
```

### Step 6: Rollback Plan

Jika webhook bermasalah setelah deploy:

```bash
# Hapus webhook (bot berhenti terima callback, tapi upload masih jalan)
curl "https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook"

# Atau revert ke branch sebelumnya di Coolify
# Dashboard → Deployment → Rollback to previous
```

**Fallback behavior tanpa webhook:**
- Upload bukti tetap jalan
- Status tetap `PROOF_UPLOADED`
- Admin bisa manual set `PAID` di `/admin/orders/[id]`
- Tidak ada crash, hanya tombol Telegram tidak fungsi

### Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Webhook gagal set | Cek domain HTTPS aktif, cek `getWebhookInfo` untuk error |
| Tombol tidak merespon | Cek Coolify logs untuk webhook POST errors |
| Foto tidak muncul di Telegram | Cek buffer conversion di `lib/telegram.ts`, cek ukuran foto |
| Status tidak berubah | Cek DB langsung, cek webhook callback data format |
| Bot tidak kirim pesan | Cek `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID` di Coolify env |

### Cost Impact
- Telegram Bot API: **gratis** (tidak ada biaya)
- Webhook: **gratis** (Next.js route, no additional infra)
- Database: tambah 1 status string per order (negligible)
