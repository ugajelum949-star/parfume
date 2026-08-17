# 🛠️ PANDUAN TEKNIS: PERBAIKAN PHOTO UPLOAD & WATERMARK OVERLAY 

Dokumen ini adalah spesifikasi teknis dan panduan eksekusi mandiri untuk **Claude Code** dalam memperbaiki sistem upload foto (>1MB error, hanya JPG yang bisa, PNG transparan rusak), menerapkan penghapusan file sampah S3 (*Auto-Cleanup*), penanganan error ACL S3, serta mengadopsi sistem CSS Watermark Overlay dari `D:\jersey-store`.

---

## 📑 DAFTAR ISI
1. [Ringkasan Masalah & Solusi Teknis](#1-ringkasan-masalah--solusi-teknis)
2. [Spesifikasi Modul 1: Client-Side Canvas Compression (`lib/compression.ts`)](#2-spesifikasi-modul-1-client-side-canvas-compression-libcompressionts)
3. [Spesifikasi Modul 2: Clean Upload Pipeline (`app/actions/upload.ts`)](#3-spesifikasi-modul-2-clean-upload-pipeline-appactionsuploadts)
4. [Spesifikasi Modul 3: Resilient S3 Storage & Auto-Cleanup (`lib/s3-storage.ts`)](#4-spesifikasi-modul-3-resilient-s3-storage--auto-cleanup-libs3-storagets)
5. [Spesifikasi Modul 4: S3 Auto-Cleanup pada Penghapusan Data](#5-spesifikasi-modul-4-s3-auto-cleanup-pada-penghapusan-data)
6. [Spesifikasi Modul 5: Integrasi Kompresi di Seluruh Form Admin](#6-spesifikasi-modul-5-integrasi-kompresi-di-seluruh-form-admin)
7. [Spesifikasi Modul 6: CSS/HTML Watermark Overlay Ala Jersey Store](#7-spesifikasi-modul-6-csshtml-watermark-overlay-ala-jersey-store)
8. [Aturan Khusus: Bukti Transfer (Direct-to-Telegram)](#8-aturan-khusus-bukti-transfer-direct-to-telegram)
9. [Langkah Eksekusi Berurutan & Protokol Verifikasi](#9-langkah-eksekusi-berurutan--protokol-verifikasi)

---

## 1. Ringkasan Masalah & Solusi Teknis

| No | Masalah Saat Ini | Penyebab Akar (*Root Cause*) | Solusi Yang Harus Diterapkan |
| :--- | :--- | :--- | :--- |
| **1** | **Upload >1MB Langsung Error** | Browser membaca file menjadi Base64 mentah tanpa kompresi klien. Server Action memicu *HTTP 413 Payload Too Large*. | Pasang `lib/compression.ts` berbasis HTML5 Canvas untuk kompresi otomatis (15MB ➔ ~250KB) sebelum dikirim. |
| **2** | **Hanya JPG yang Bisa & PNG Transparan Jadi Hitam** | Fungsi `forceJpg()` di `upload.ts` mengonversi paksa seluruh gambar ke JPEG dan membuang *alpha channel* PNG. | Hapus `forceJpg()`, pertahankan format asli (PNG transparan tetap PNG, WebP tetap WebP). |
| **3** | **Watermark Sharp Merusak Foto Asli di S3** | Server menjalankan Sharp watermark permanen ke dalam file gambar. Foto menjadi buram, berat, dan crash jika logo hilang. | Hapus Sharp watermark server-side, ganti dengan **CSS/HTML Watermark Overlay** non-destruktif di UI ala `jersey-store`. |
| **4** | **File Sampah (Orphaned Files) Menumpuk di S3** | Menghapus produk/banner di admin hanya menghapus data DB tanpa menghapus file fisik di S3. | Panggil `deleteFromS3(imageUrl)` di semua Server Action delete (`products.ts`, `banners.ts`, `wars.ts`). |
| **5** | **Potensi Error ACL `public-read` di S3** | `PutObjectCommand` mengirim `ACL: 'public-read'` yang bisa ditolak jika S3 memakai *Bucket Owner Enforced*. | Tambahkan *try-catch fallback* di `s3-storage.ts` untuk mencoba ulang upload tanpa header ACL jika ditolak. |

---

## 2. Spesifikasi Modul 1: Client-Side Canvas Compression (`lib/compression.ts`)

Buat file baru **`lib/compression.ts`** dengan kode berikut:

```typescript
/**
 * Client-Side Canvas Compression Module
 * Mengecilkan ukuran file gambar di browser sebelum dikirim ke server.
 * Mendukung JPEG, PNG (mempertahankan transparansi), dan WebP.
 */
export async function compressImage(file: File, quality = 0.82, maxWidth = 1920): Promise<File> {
  if (!file || !file.type.startsWith('image/')) return file;

  // Jika SVG atau GIF animasi, jangan dikompresi via canvas
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize proporsional jika melebihi maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Tentukan output format: jika PNG, pertahankan PNG transparan
        const isPng = file.type === 'image/png';
        const isWebp = file.type === 'image/webp';
        const outputMime = isPng ? 'image/png' : isWebp ? 'image/webp' : 'image/jpeg';

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputMime,
          isPng ? undefined : quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Helper konversi File ke Base64 Data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
```

---

## 3. Spesifikasi Modul 2: Clean Upload Pipeline (`app/actions/upload.ts`)

Perbarui file **`app/actions/upload.ts`**:
* **Hapus** import `applyWatermark` dan fungsi `forceJpg`.
* Terima base64 hasil kompresi dan simpan langsung ke S3 sesuai mime type aslinya.

```typescript
'use server'

import { uploadToS3, getPresignedUploadUrl } from '@/lib/s3-storage'
import { verifyAdmin } from './auth'

export async function generateUploadUrl(folder: string, filename: string, contentType: string) {
  try {
    await verifyAdmin()

    if (!folder || !filename || !contentType) {
      throw new Error('Missing parameters')
    }

    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(folder, filename, contentType)
    return { success: true, uploadUrl, publicUrl }
  } catch (error: unknown) {
    console.error('generateUploadUrl error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || 'Failed to generate upload URL' }
  }
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

export async function uploadImage(base64Data: string, folder: string) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    if (!base64Data || !folder) {
      throw new Error('Missing parameters')
    }

    // Validasi MIME type
    const mimeMatch = base64Data.match(/^data:([^;]+);base64,/)
    if (mimeMatch) {
      const mimeType = mimeMatch[1].toLowerCase()
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error('Hanya format JPG, PNG, dan WebP yang diizinkan')
      }
    }

    // Validasi estimasi ukuran
    const base64Payload = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
    const estimatedSize = Math.ceil(base64Payload.length * 0.75)
    if (estimatedSize > MAX_FILE_SIZE) {
      throw new Error('Ukuran file melebihi batas 20MB')
    }

    // Upload langsung ke S3 tanpa merusak atau membakar watermark ke pixel gambar
    const publicUrl = await uploadToS3(base64Data, folder)

    return { success: true, url: publicUrl }
  } catch (error: unknown) {
    console.error('uploadImage error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg || 'Gagal mengunggah gambar' }
  }
}
```

---

## 4. Spesifikasi Modul 3: Resilient S3 Storage & Auto-Cleanup (`lib/s3-storage.ts`)

Perbarui **`lib/s3-storage.ts`**:
* Pastikan `uploadToS3` mendukung Buffer dan Base64 secara akurat.
* Tambahkan *fallback retry* jika S3 provider menolak parameter `ACL: 'public-read'`.

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'https://is3.cloudhost.id',
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || '',
    secretAccessKey: process.env.S3_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET = process.env.S3_BUCKET || 'app-bucket';

/**
 * Upload image buffer or base64 string to S3 Storage with resilient ACL fallback.
 */
export async function uploadToS3(fileData: string | Buffer, folder: string): Promise<string> {
  let buffer: Buffer
  let ext = 'jpg'
  let mimeType = 'image/jpeg'

  if (Buffer.isBuffer(fileData)) {
    buffer = fileData
    if (fileData[0] === 0x89 && fileData[1] === 0x50) { mimeType = 'image/png'; ext = 'png' }
    else if (fileData[0] === 0x52 && fileData[1] === 0x49) { mimeType = 'image/webp'; ext = 'webp' }
    else if (fileData[0] === 0x47 && fileData[1] === 0x49) { mimeType = 'image/gif'; ext = 'gif' }
  } else {
    const matches = fileData.match(/^data:([A-Za-z0-9-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      throw new Error('Format gambar base64 tidak valid')
    }
    mimeType = matches[1].toLowerCase()
    buffer = Buffer.from(matches[2], 'base64')
    if (mimeType.includes('png')) ext = 'png'
    else if (mimeType.includes('webp')) ext = 'webp'
    else if (mimeType.includes('gif')) ext = 'gif'
    else if (mimeType.includes('svg')) ext = 'svg'
  }

  const fileName = `uploads/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

  // Coba upload dengan ACL public-read, jika ditolak oleh bucket policy, retry tanpa ACL
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      ACL: 'public-read',
    }));
  } catch (aclErr: any) {
    if (aclErr?.name === 'AccessControlListNotSupported' || aclErr?.message?.includes('ACL')) {
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
      }));
    } else {
      throw aclErr;
    }
  }

  const endpoint = process.env.S3_ENDPOINT || 'https://is3.cloudhost.id';
  return `${endpoint}/${BUCKET}/${fileName}`;
}

/**
 * Delete image from S3 based on URL.
 */
export async function deleteFromS3(fileUrl: string | null | undefined): Promise<void> {
  if (!fileUrl) return;
  try {
    const endpoint = process.env.S3_ENDPOINT || 'https://is3.cloudhost.id';
    const prefix = `${endpoint}/${BUCKET}/`;

    if (!fileUrl.startsWith(prefix)) {
      return;
    }

    const key = fileUrl.replace(prefix, '');
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }));
  } catch (err) {
    console.error(`[S3] Failed to delete ${fileUrl}:`, err);
  }
}

/**
 * Generate presigned URL for direct client-side S3 upload.
 */
export async function getPresignedUploadUrl(folder: string, filename: string, contentType: string) {
  const uniqueFilename = `uploads/${folder}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: uniqueFilename,
    ContentType: contentType,
    ACL: 'public-read',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const endpoint = process.env.S3_ENDPOINT || 'https://is3.cloudhost.id';
  const publicUrl = `${endpoint}/${BUCKET}/${uniqueFilename}`;

  return { uploadUrl, publicUrl };
}
```

---

## 5. Spesifikasi Modul 4: S3 Auto-Cleanup pada Penghapusan Data

Pastikan file fisik di S3 otomatis terhapus saat data dihapus di Server Actions:

### 5.1. `app/actions/products.ts` (pada `deleteProduct`)
```typescript
import { deleteFromS3 } from '@/lib/s3-storage'

export async function deleteProduct(id: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    // 1. Ambil URL gambar produk utama & gambar ekstra
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1)
    const extraImages = await db.select().from(productImages).where(eq(productImages.productId, id))

    // 2. Hapus file fisik di S3
    if (product?.image) await deleteFromS3(product.image)
    for (const img of extraImages) {
      if (img.url) await deleteFromS3(img.url)
    }

    // 3. Hapus data dari DB
    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/')
    revalidatePath('/products')
    revalidatePath('/admin/products')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menghapus produk' }
  }
}
```

### 5.2. `app/actions/banners.ts` (pada `deleteBanner`)
```typescript
import { deleteFromS3 } from '@/lib/s3-storage'

export async function deleteBanner(id: string) {
  const isAdmin = await verifyAdmin()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  try {
    const [banner] = await db.select().from(banners).where(eq(banners.id, id)).limit(1)
    if (banner?.image) await deleteFromS3(banner.image)

    await db.delete(banners).where(eq(banners.id, id))
    revalidatePath('/')
    revalidatePath('/admin/banners')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menghapus banner' }
  }
}
```

---

## 6. Spesifikasi Modul 5: Integrasi Kompresi di Seluruh Form Admin

Di semua komponen form admin yang memiliki input file `<input type="file">`:

Import helper kompresi:
```typescript
import { compressImage, fileToBase64 } from '@/lib/compression'
import { uploadImage } from '@/app/actions/upload'
```

Contoh pola penanganan file yang benar di:
1. `app/admin/products/page.tsx`
2. `app/admin/settings/settings-form.tsx`
3. `app/admin/banners/page.tsx`
4. `app/admin/wars/page.tsx`
5. `app/admin/testimonials/page.tsx`

```typescript
async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const rawFile = e.target.files?.[0]
  if (!rawFile) return

  setUploading(true)
  try {
    // 1. Kompresi otomatis di browser (10MB -> 300KB)
    const compressedFile = await compressImage(rawFile, 0.85, 1920)
    
    // 2. Konversi ke Base64
    const base64 = await fileToBase64(compressedFile)
    
    // 3. Upload via Server Action
    const result = await uploadImage(base64, 'products')
    if (result.success && result.url) {
      setImageUrl(result.url)
      toast.success('Foto berhasil diunggah')
    } else {
      toast.error(result.error || 'Gagal mengunggah foto')
    }
  } catch (err) {
    toast.error('Gagal memproses gambar')
  } finally {
    setUploading(false)
  }
}
```

---

## 7. Spesifikasi Modul 6: CSS/HTML Watermark Overlay Ala Jersey Store

### 7.1. Pasang di `components/shared/ProductCard.tsx`
Tambahkan layer watermark overlay tepat di dalam container gambar kartu produk:

```tsx
<div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-secondary mb-3">
  {product.image ? (
    <Image
      src={product.image}
      alt={product.name}
      fill
      loading="lazy"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
      className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
      No Image
    </div>
  )}

  {/* Watermark Overlay Ala Jersey Store */}
  <div 
    className="absolute inset-0 z-[5] pointer-events-none select-none overflow-hidden opacity-[0.06]"
    aria-hidden="true"
  >
    <div 
      className="absolute inset-[-50%] w-[200%] h-[200%] flex flex-wrap items-center justify-center gap-4 rotate-[-25deg]"
      style={{
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '3px',
        lineHeight: '2.5',
        color: 'white',
        wordSpacing: '20px',
      }}
    >
      {'BEST PARFUME STORE '.repeat(200)}
    </div>
  </div>

  {isSoldOut && (
    <div className="absolute top-2 left-2 z-10 bg-muted-foreground/80 text-background text-[10px] font-medium px-2 py-0.5 rounded">
      Sold out
    </div>
  )}
</div>
```

### 7.2. Pasang di `components/product/ProductDetail.tsx`
Pasang layer watermark serupa pada wadah gambar utama detail produk.

---

## 8. Aturan Khusus: Bukti Transfer (Direct-to-Telegram)

* **Keputusan Arsitektur**: Bukti transfer pembayaran dari pembeli di `app/api/order/proof/route.ts` **TIDAK DISIMPAN KE S3 STORAGE** untuk menjaga bucket S3 bebas sampah (*Zero S3 Clutter*).
* **Alur Tetap**: Foto dikirimkan langsung ke Telegram Bot admin dan status pesanan diperbarui menjadi `PAID`.
* **Optimasi**: Tambahkan kompresi ringan di browser pada `InvoiceClient.tsx` sebelum mengirim form multipart ke `/api/order/proof` agar upload bukti bayar di HP pembeli super cepat.

---

## 9. Langkah Eksekusi Berurutan & Protokol Verifikasi

### 9.1. Langkah Eksekusi Berurutan untuk Claude Code
1. **Langkah 1**: Buat file `lib/compression.ts`.
2. **Langkah 2**: Perbarui `app/actions/upload.ts` (hapus `forceJpg` & Sharp watermark).
3. **Langkah 3**: Perbarui `lib/s3-storage.ts` (tambahkan penanganan format bersih & ACL fallback).
4. **Langkah 4**: Perbarui penghapusan file S3 di `app/actions/products.ts`, `banners.ts`, `wars.ts`.
5. **Langkah 5**: Integrasikan `compressImage` di `app/admin/products/page.tsx`, `settings/settings-form.tsx`, `banners/page.tsx`, `wars/page.tsx`, `testimonials/page.tsx`.
6. **Langkah 6**: Tambahkan CSS Watermark Overlay di `ProductCard.tsx` dan `ProductDetail.tsx`.
7. **Langkah 7**: Jalankan `npm run lint` untuk memvalidasi tidak ada error TypeScript.

### 9.2. Protokol Pengujian
* **Test 1**: Upload foto berukuran besar (5MB–15MB) di `/admin/products`. ➔ **Wajib berhasil < 1 detik tanpa timeout**.
* **Test 2**: Upload logo PNG transparan di `/admin/settings`. ➔ **Wajib tetap transparan (tidak hitam)**.
* **Test 3**: Upload gambar WebP. ➔ **Wajib tersimpan dan tampil sempurna**.
* **Test 4**: Hapus salah satu produk testing. ➔ **File di S3 bucket wajib terhapus**.
* **Test 5**: Buka Home Page. ➔ **Teks watermark `BEST PARFUME STORE` terlihat miring halus di atas kartu produk**.

---

*Dokumen ini adalah acuan final dan siap dieksekusi secara otomatis oleh Claude Code.*
