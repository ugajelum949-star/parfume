---
aliases: [war, drop, flash-sale, product-launch]
tags: [flow, business]
last_updated: 2026-08-13
---

# War (Product Drop) Flow

## Konsep

"War" = product drop — peluncuran produk baru dengan stok terbatas. Customer yang ikut war mendapat akses duluan dengan harga normal, sebelum produk masuk ke catalog biasa.

> [!tip] Contoh
> "War Mykonos" — Parfum baru Mykonos launch, 50 stok, 3 hari waktu war.

## Pricing Lifecycle

```
Phase 1: WAR (selama war berlangsung)
  Harga: Rp 500.000 (= harga normal)
  Stok: terbatas (war stock)
  Display: "NEW DROP — Rp 500.000 — Stok: 50"

Phase 2: POST-WAR (0-7 hari setelah war selesai)
  Harga: Rp 850.000 (= warPrice × 1.7, markup 70%)
  Stok: normal
  Display: "Rp 850.000" (premium price)

Phase 3: SALE (8+ hari setelah war selesai)
  Harga: Rp 400.000 (= products.price, diskon)
  Stok: normal
  Display: "Rp 850.000 → Rp 400.000" (strikethrough + sale)
```

> [!warning] FOMO Logic
> Customer yang beli di war dapet harga Rp 500.000. Besoknya naik ke Rp 850.000. 7 hari baru diskon ke Rp 400.000. Yang beli di war merasa "untung".

## Pricing Priority

```ts
// Runtime computed, bukan stored value
const postWarPrice = warPrice × 1.7
const salePrice = products.price

if (warActive && warProduct)        → warPrice (halaman war)
else if (now < launchedAt + 7 hari) → postWarPrice (catalog, premium)
else if (salePrice)                 → salePrice (catalog, diskon)
else                               → products.price (normal)
```

## Schema

### products (tabel existing + field baru)

| Field | Type | Description |
|-------|------|-------------|
| price | real | Harga normal / sale price |
| warPrice | real | Harga war (nullable) |
| launchedAt | timestamp | Kapan produk masuk catalog |

### wars (tabel baru)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| name | text | Nama war |
| description | text | Deskripsi |
| image | text | Banner image |
| startTime | timestamp | Waktu mulai |
| endTime | timestamp | Waktu selesai |
| active | boolean | Aktif |
| converted | boolean | Sudah di-convert ke products |

### war_items (tabel baru)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| warId | uuid | FK → wars |
| name | text | Nama produk |
| brand | text | Brand |
| price | text | Harga war (= normal price) |
| stock | integer | Stok war (terbatas) |
| image | text | Gambar produk |
| productId | uuid | FK → products (nullable, terisi setelah convert) |

## Flow

### Admin: Buat War

1. Buka `/admin/wars` → "New War"
2. Isi: nama, deskripsi, gambar, waktu mulai/selesai
3. Tambah item: nama, brand, harga (normal price), stok
4. Simpan → war muncul di homepage (kalau waktu mulai sudah tiba)

### Homepage: War Berlangsung

```
WAR MYKONOS — countdown timer
[Produk grid dengan badge "WAR" + "Sisa X"]
```

### Homepage: War Coming Soon

```
WAR VELIXIR — "Dimulai dalam 2 hari 14:30:22"
[Countdown ke waktu mulai]
```

### Auto-Conversion (war selesai)

`checkExpiredWars()` → jalan di homepage load:
1. Cari war yang `endTime <= now && converted == false`
2. Buat products dari war_items (price = warPrice, stock = sisa)
3. Set `warItems.productId` → link ke products baru
4. Set `war.converted = true`

### Post-War Display

Produk masuk catalog dengan:
- `products.warPrice` = harga war (Rp 500.000)
- `products.price` = sale price (Rp 400.000)
- `products.launchedAt` = timestamp

0-7 hari: tampilkan Rp 850.000 (premium, computed)
8+ hari: tampilkan Rp 400.000 (sale)

### Non-War Products

Zero change. Logic existing tetap jalan:
- `products.price` = normal price
- `stockData.salePrices` = diskon per-size
- `getSizePrice()` helper unchanged

## Edge Cases

- **War product, sold out during war** → badge "HABIS" di halaman war, stok normal tetap 0
- **War product, stok ≤ 5** → badge "Sisa X" di halaman war
- **Multiple active wars** → semua tampil di homepage, urut start time
- **Admin edit produk war setelah converted** → normal product edit, warPrice tetap sebagai reference
- **Sale start date configurable** → `launchedAt + N hari` (default 7, bisa di-set admin)

---

*See also: [[PROJECT_OVERVIEW]], [[FLOW_cart]], [[FLOW_products]]*
