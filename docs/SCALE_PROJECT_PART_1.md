# 🚀 SCALE PROJECT PART 1: EKOSISTEM BRAND, CURATED GENDER SLOTS & 5-BRAND SHOWCASE SLIDER

> **STATUS: SELESAI / COMPLETED ✅** (Telah diimplementasikan dan diverifikasi pada branch `main`)

Dokumen teknis komprehensif ini dirancang sebagai panduan eksekusi mandiri untuk **Claude Code** atau pengembang dalam mengimplementasikan **Scale Project Part 1** pada repositori `parfume`.

---

## 📑 DAFTAR ISI
1. [Overview & Tujuan Arsitektur](#1-overview--tujuan-arsitektur)
2. [Status Pilar 1: Master Brand & SEO (Selesai ✅)](#2-status-pilar-1-master-brand--seo-selesai-)
3. [Spesifikasi Teknis Fitur 1: Kurasi Slot Gender (For Him, For Her, For Everyone)](#3-spesifikasi-teknis-fitur-1-kurasi-slot-gender-for-him-for-her-for-everyone)
4. [Spesifikasi Teknis Fitur 2: 5-Brand Showcase Slider (Urutan 1–5)](#4-spesifikasi-teknis-fitur-2-5-brand-showcase-slider-urutan-15)
5. [Skema Database & Migrasi Drizzle](#5-skema-database--migrasi-drizzle)
6. [Kontrak Server Actions (`app/actions/`)](#6-kontrak-server-actions-appactions)
7. [Desain Antarmuka Panel Admin (`app/admin/featured-brands/`)](#7-desain-antarmuka-panel-admin-appadminfeatured-brands)
8. [Desain Komponen Frontend Beranda (`components/home/`)](#8-desain-komponen-frontend-beranda-componentshome)
9. [Integrasi Halaman Beranda (`app/page.tsx`)](#9-integrasi-halaman-beranda-apppagetsx)
10. [Langkah Eksekusi & Protokol Verifikasi](#10-langkah-eksekusi--protokol-verifikasi)

---

## 1. Overview & Tujuan Arsitektur

Toko telah beralih dari data seed dummy ke **produk real** (*Mykonos, Velixir, Afnan, dll.*). Pada **Scale Project Part 1**, kita memberikan kendali penuh kepada admin untuk mengatur kurasi produk dan brand unggulan di halaman beranda (**Home Page**) dengan dua fitur utama:

1. **Curated Gender Slots (Opsi 2)**: Admin dapat secara manual memilih produk spesifik untuk mengisi **4 slot** di *For Him*, **4 slot** di *For Her*, dan **4 slot** di *For Everyone*.
2. **5-Brand Showcase Slider**: Admin dapat memilih maksimal **5 brand unggulan** dengan urutan 1 sampai 5. Setiap brand akan memiliki satu baris **slider carousel horizontal** di beranda yang menampilkan seluruh produk dari brand tersebut dengan navigasi panah `<` dan `>`.

---

## 2. Status Pilar 1: Master Brand & SEO (Selesai ✅)

Komponen berikut telah selesai diimplementasikan:
* `lib/config.ts`: Master array `BRANDS` mencakup brand lokal viral, arabian/timur tengah, dan luxury designer.
* `app/admin/products/page.tsx` & `app/admin/wars/page.tsx`: Input brand terhubung dengan `<datalist id="brand-suggestions">`.
* `app/layout.tsx`: Root Metadata, Schema.org `OnlineStore`, keywords komprehensif, OpenGraph, dan Twitter cards.
* `app/products/layout.tsx`: Metadata katalog untuk seluruh scent family dan gender.
* `app/product/[id]/page.tsx`: Dynamic metadata generator spesifik per botol parfum.

---

## 3. Spesifikasi Teknis Fitur 1: Kurasi Slot Gender (For Him, For Her, For Everyone)

### 3.1. Konsep & Aturan Bisnis
* Di beranda, seksi **GenderSplit** memiliki 3 kategori (*For Him*, *For Her*, *For Everyone*), masing-masing memiliki 4 slot kartu produk (total 12 slot).
* Admin dapat memilih produk spesifik untuk setiap slot melalui menu dropdown di admin panel.
* **Format Penyimpanan**: Disimpan di tabel `settings` dengan key `gender_curated_slots` berupa JSON string:
  ```json
  {
    "forHim": ["uuid-prod-1", "uuid-prod-2", "uuid-prod-3", "uuid-prod-4"],
    "forHer": ["uuid-prod-5", "uuid-prod-6", "uuid-prod-7", "uuid-prod-8"],
    "forEveryone": ["uuid-prod-9", "uuid-prod-10", "uuid-prod-11", "uuid-prod-12"]
  }
  ```
* **Fallback Cerdas**: Jika ada slot yang kosong (`""` atau `null`) atau produk telah dihapus dari database, sistem otomatis mengisi slot yang kosong dengan produk terbaru (`createdAt DESC`) dari gender yang sesuai.

---

## 4. Spesifikasi Teknis Fitur 2: 5-Brand Showcase Slider (Urutan 1–5)

### 4.1. Konsep & Aturan Bisnis
1. **Batas Maksimal 5 Brand**: Tabel `featured_brands` hanya boleh memiliki maksimal 5 brand aktif (`isActive = true`).
2. **Validasi Penolakan di Server & Client**:
   * Jika admin mencoba menambahkan brand baru saat slot aktif sudah mencapai 5, aksi ditolak dan mengembalikan pesan:  
     `"Maksimal 5 brand unggulan. Silakan hapus atau nonaktifkan brand yang ada terlebih dahulu sebelum menambahkan brand baru."`
3. **Urutan Tampilan (Order 1 s/d 5)**:
   * Kolom `order` bernilai integer antara `1` sampai `5`.
   * Di beranda, seksi brand diurutkan vertikal dari atas ke bawah berdasarkan `order ASC`.
4. **Tipografi Murni (Tanpa Upload File Logo)**:
   * Header seksi menampilkan nama brand dalam tipografi serif elegan (*DM Serif Display*) + tombol tautan `"Lihat Semua [Brand] →"` yang mengarah ke `/products?search=[NamaBrand]`.
5. **Horizontal Carousel Slider**:
   * Menampilkan **seluruh produk** yang memiliki `product.brand === brand.name`.
   * Dilengkapi tombol navigasi panah kiri **`<`** dan kanan **`>`** untuk menggeser produk secara horizontal dengan transisi mulus (*smooth scrolling*).
   * Mendukung *touch swipe* alami pada perangkat mobile.

---

## 5. Skema Database & Migrasi Drizzle

### 5.1. Tambahkan Tabel `featured_brands` di `db/schema.ts`
Tambahkan kode berikut ke dalam [db/schema.ts](file:///d:/parfume/db/schema.ts):

```typescript
export const featuredBrands = pgTable("featured_brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  order: integer("order").default(1).notNull(), // Urutan 1 sampai 5
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
```

### 5.2. Eksekusi Push Skema
Jalankan perintah berikut di terminal:
```bash
npx drizzle-kit push
```

---

## 6. Kontrak Server Actions (`app/actions/`)

### 6.1. File Baru: `app/actions/featured-brands.ts`
Implementasikan Server Actions untuk Featured Brands dengan proteksi admin:

```typescript
'use server'

import { db } from '@/lib/db'
import { featuredBrands, products } from '@/db/schema'
import { eq, asc, count } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from './auth'

const MAX_FEATURED_BRANDS = 5

export async function getFeaturedBrands(activeOnly: boolean = false) {
  if (activeOnly) {
    return db
      .select()
      .from(featuredBrands)
      .where(eq(featuredBrands.isActive, true))
      .orderBy(asc(featuredBrands.order), asc(featuredBrands.name))
  }
  return db
    .select()
    .from(featuredBrands)
    .orderBy(asc(featuredBrands.order), asc(featuredBrands.name))
}

export async function addFeaturedBrand(formData: FormData) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const name = (formData.get('name') as string || '').trim()
  const order = Number(formData.get('order') || 1)
  const isActive = formData.get('isActive') !== 'false'

  if (!name) return { success: false, error: 'Nama brand wajib diisi' }

  // Cek apakah slot sudah penuh jika isActive = true
  if (isActive) {
    const activeCount = await db
      .select({ val: count() })
      .from(featuredBrands)
      .where(eq(featuredBrands.isActive, true))
    
    if ((activeCount[0]?.val ?? 0) >= MAX_FEATURED_BRANDS) {
      return {
        success: false,
        error: `Maksimal ${MAX_FEATURED_BRANDS} brand unggulan. Silakan hapus atau nonaktifkan brand yang ada terlebih dahulu sebelum menambahkan brand baru.`
      }
    }
  }

  try {
    await db.insert(featuredBrands).values({
      name,
      order: Math.min(Math.max(order, 1), MAX_FEATURED_BRANDS),
      isActive,
    })
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch (err: any) {
    if (err?.code === '23505') {
      return { success: false, error: 'Brand ini sudah terdaftar di Featured Brands' }
    }
    return { success: false, error: 'Gagal menambahkan featured brand' }
  }
}

export async function updateFeaturedBrand(id: string, formData: FormData) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const name = (formData.get('name') as string || '').trim()
  const order = Number(formData.get('order') || 1)
  const isActive = formData.get('isActive') === 'true'

  // Jika mengaktifkan brand, cek kuota slot
  if (isActive) {
    const current = await db.select().from(featuredBrands).where(eq(featuredBrands.id, id)).limit(1)
    if (current[0] && !current[0].isActive) {
      const activeCount = await db
        .select({ val: count() })
        .from(featuredBrands)
        .where(eq(featuredBrands.isActive, true))
      
      if ((activeCount[0]?.val ?? 0) >= MAX_FEATURED_BRANDS) {
        return {
          success: false,
          error: `Maksimal ${MAX_FEATURED_BRANDS} brand unggulan aktif. Nonaktifkan brand lain terlebih dahulu.`
        }
      }
    }
  }

  try {
    await db.update(featuredBrands)
      .set({
        name: name || undefined,
        order: Math.min(Math.max(order, 1), MAX_FEATURED_BRANDS),
        isActive,
      })
      .where(eq(featuredBrands.id, id))

    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: 'Gagal memperbarui featured brand' }
  }
}

export async function deleteFeaturedBrand(id: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    await db.delete(featuredBrands).where(eq(featuredBrands.id, id))
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menghapus featured brand' }
  }
}
```

### 6.2. File `app/actions/settings.ts` (Gender Curation Slots)
Tambahkan fungsi untuk menyimpan dan mengambil kurasi slot gender:

```typescript
export interface GenderCuratedSlots {
  forHim: string[]       // 4 Product IDs
  forHer: string[]       // 4 Product IDs
  forEveryone: string[]  // 4 Product IDs
}

export async function getGenderSlots(): Promise<GenderCuratedSlots> {
  const raw = await getSetting('gender_curated_slots')
  try {
    const parsed = JSON.parse(raw || '{}')
    return {
      forHim: Array.isArray(parsed.forHim) ? parsed.forHim.slice(0, 4) : ['', '', '', ''],
      forHer: Array.isArray(parsed.forHer) ? parsed.forHer.slice(0, 4) : ['', '', '', ''],
      forEveryone: Array.isArray(parsed.forEveryone) ? parsed.forEveryone.slice(0, 4) : ['', '', '', ''],
    }
  } catch {
    return { forHim: ['', '', '', ''], forHer: ['', '', '', ''], forEveryone: ['', '', '', ''] }
  }
}

export async function saveGenderSlots(slots: GenderCuratedSlots) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    await setSetting('gender_curated_slots', JSON.stringify(slots))
    revalidatePath('/')
    revalidatePath('/admin/featured-brands')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menyimpan kurasi slot gender' }
  }
}
```

---

## 7. Desain Antarmuka Panel Admin (`app/admin/featured-brands/`)

### 7.1. Struktur Halaman `app/admin/featured-brands/page.tsx`
Halaman admin ini dibagi menjadi 2 Tab/Bagian:

1. **Tab 1: 5-Brand Showcase Slider**:
   * **Header Info Slot**: Badge visual `Slot Terpakai: X / 5` (jika 5/5, warna amber/merah; tombol tambah dinonaktifkan).
   * **Form Tambah Brand**:
     * Dropdown pilihan merek dari daftar merek unik yang ada di tabel `products` + `BRANDS` dari `lib/config.ts`.
     * Input pilihan urutan `order` (1 sampai 5).
     * Tombol Simpan.
   * **Tabel / Daftar Brand Aktif**:
     * Kolom: Urutan (1–5), Nama Brand, Total Produk di Toko, Status Aktif (Toggle Switch), dan Aksi (Edit / Hapus).
2. **Tab 2: Kurasi Slot Gender (For Him, For Her, For Everyone)**:
   * **Seksi For Him**: 4 baris dropdown (Slot 1, Slot 2, Slot 3, Slot 4) berisi produk-produk gender *Men* dan *Unisex* (+ opsi "Otomatis / Produk Terbaru").
   * **Seksi For Her**: 4 baris dropdown (Slot 1, Slot 2, Slot 3, Slot 4) berisi produk-produk gender *Women* dan *Unisex* (+ opsi "Otomatis / Produk Terbaru").
   * **Seksi For Everyone**: 4 baris dropdown (Slot 1, Slot 2, Slot 3, Slot 4) berisi produk-produk gender *Unisex* (+ opsi "Otomatis / Produk Terbaru").
   * Tombol **"Simpan Kurasi Slot Gender"** dengan konfirmasi toast.

### 7.2. Sidebar Navigasi `app/admin/AdminShell.tsx`
Tambahkan item navigasi berikut di dalam array menu:
```typescript
{ href: '/admin/featured-brands', label: 'Featured & Kurasi', icon: Sparkles }
```

---

## 8. Desain Komponen Frontend Beranda (`components/home/`)

### 8.1. Komponen Baru: `components/home/BrandShowcaseSlider.tsx`
Komponen carousel horizontal per brand:

```tsx
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/shared/ProductCard'

type Product = {
  id: string
  name: string
  brand: string
  price: number
  image: string | null
  stock?: number
  stockData?: string
  sizes?: string
}

interface BrandShowcaseSliderProps {
  brandName: string
  order: number
  products: Product[]
}

export function BrandShowcaseSlider({ brandName, order, products }: BrandShowcaseSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = 320
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <section className="py-10 md:py-14 max-w-6xl mx-auto px-4 md:px-6">
      {/* Header Brand */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-medium mb-1">
            Featured Brand #{order}
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            {brandName}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/products?search=${encodeURIComponent(brandName)}`}
            className="text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground hover:border-foreground pb-0.5"
          >
            Lihat Semua {brandName} ({products.length}) →
          </Link>
          
          {/* Tombol Panah Geser Desktop */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full border border-border bg-card/50 hover:bg-card flex items-center justify-center text-foreground transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full border border-border bg-card/50 hover:bg-card flex items-center justify-center text-foreground transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-border mb-6" />

      {/* Horizontal Carousel */}
      <div
        ref={sliderRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px] flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
```

### 8.2. Update Komponen `components/home/GenderSplit.tsx`
Perbarui `GenderSplit` agar menerima daftar produk yang sudah dikurasi berdasarkan slot:

```tsx
interface GenderSplitProps {
  menProducts: Product[]
  womenProducts: Product[]
  unisexProducts: Product[]
  heroForHim?: string | null
  heroForHer?: string | null
  heroForEveryone?: string | null
}
```

---

## 9. Integrasi Halaman Beranda (`app/page.tsx`)

### 9.1. Alur Data di `app/page.tsx`
1. Ambil data secara paralel:
   * `allProducts`: Semua produk aktif.
   * `featuredBrands`: `getFeaturedBrands(true)` (maksimal 5 brand terurut 1-5).
   * `genderSlots`: `getGenderSlots()`.
2. **Resolver Kurasi Gender**:
   * Untuk `For Him`: Cari produk berdasarkan ID di `genderSlots.forHim`. Jika slot kosong/tidak ditemukan, isi dengan produk `gender = Men` terbaru. Ambil 4 produk.
   * Untuk `For Her`: Cari produk berdasarkan ID di `genderSlots.forHer`. Jika slot kosong, isi dengan produk `gender = Women` terbaru. Ambil 4 produk.
   * Untuk `For Everyone`: Cari produk berdasarkan ID di `genderSlots.forEveryone`. Jika slot kosong, isi dengan produk `gender = Unisex` terbaru. Ambil 4 produk.
3. **Render Urutan Seksi di Beranda**:
   * Hero Banner
   * War Section (jika ada)
   * Banner Carousel (jika ada)
   * **5-Brand Showcase Slider** (Merender setiap brand aktif berurutan dari urutan 1 sampai 5)
   * Popular Section (Most Popular / Sale tabs)
   * Explore Scent Cards
   * **Curated Gender Split** (For Him, For Her, For Everyone)
   * Blog Section & Testimonials

---

## 10. Langkah Eksekusi & Protokol Verifikasi

### 10.1. Langkah Eksekusi Berurutan
1. **Langkah 1**: Edit `db/schema.ts` (tabel `featured_brands`) & jalankan `npx drizzle-kit push`.
2. **Langkah 2**: Buat Server Actions `app/actions/featured-brands.ts` & update `app/actions/settings.ts`.
3. **Langkah 3**: Buat halaman admin `app/admin/featured-brands/page.tsx` & daftarkan menu di `app/admin/AdminShell.tsx`.
4. **Langkah 4**: Buat komponen `components/home/BrandShowcaseSlider.tsx`.
5. **Langkah 5**: Update `components/home/GenderSplit.tsx` dan integrasikan ke `app/page.tsx`.
6. **Langkah 6**: Jalankan linter & uji fungsionalitas.

### 10.2. Protokol Pengujian & Verifikasi
1. **Verifikasi Linter**:
   ```bash
   npm run lint
   ```
   *Pastikan 0 error.*
2. **Uji Panel Admin `/admin/featured-brands`**:
   * Tambahkan Brand 1 (*Afnan*, order: 1).
   * Tambahkan Brand 2 (*Mykonos*, order: 2).
   * Tambahkan Brand 3 (*Velixir*, order: 3).
   * Tambahkan Brand 4 & 5 hingga slot penuh (5/5).
   * Coba tambahkan Brand ke-6 ➔ **Wajib muncul pesan penolakan maksimal 5 brand**.
   * Di tab Kurasi Gender, pilih 4 produk untuk For Him, 4 untuk For Her, 4 untuk For Everyone, lalu klik Simpan.
3. **Uji Halaman Beranda (`/`)**:
   * Buka browser dan pastikan slider brand muncul dari urutan 1 sampai 5.
   * Klik tombol panah **`<`** dan **`>`** pada slider dan pastikan produk bergeser mulus.
   * Pastikan seksi For Him / For Her / For Everyone menampilkan tepat 4 produk yang dipilih admin.

---

*Dokumen Scale Project Part 1 ini siap dieksekusi oleh Claude Code secara presisi.*
