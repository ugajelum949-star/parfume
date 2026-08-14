# 📦 E-Commerce Starter Kit Boilerplate

Template proyek E-Commerce siap pakai berbasis **Next.js (App Router)**, **Drizzle ORM (PostgreSQL)**, **TailwindCSS**, **Zustand**, dan **AWS S3 Object Storage**.

---

## 🚀 Quick Start Guide

### 1. Copy Template Ke Proyek Baru
Copy seluruh folder `template` ke nama proyek baru Anda:
```bash
cp -r d:/template d:/my-new-store
cd d:/my-new-store
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env` dari `.env.example`:
```bash
cp .env.example .env
```
Isi konfigurasi `DATABASE_URL` (PostgreSQL) & kredensial `S3_*`.

### 4. Database Setup & Migration
```bash
# Geberate skema migrasi Drizzle
npx drizzle-kit generate

# Push ke database
npx drizzle-kit push
```

### 5. Inisialisasi Akun Admin
```bash
npx tsx scripts/admin/init_admin.ts
```

### 6. Jalankan Server Dev
```bash
npm run dev
```

Buka `http://localhost:3000` untuk halaman utama dan `http://localhost:3000/login` untuk login admin dashboard.

---

## 📁 Struktur Folder Proyek

```
d:/template/
├── app/
│   ├── actions/          # Server Actions (Auth, Upload, CRUD)
│   ├── admin/            # Admin Panel Dashboard, Products, & Settings
│   ├── api/              # Route Handlers
│   ├── login/            # Halaman Admin Login
│   ├── globals.css       # Design System & Tailwind CSS Tokens
│   ├── layout.tsx        # Root App Layout
│   └── page.tsx          # Homepage Placeholder
├── components/
│   ├── ui/               # Komponen shadcn/ui (Button, Input, Card, Sheet, etc)
│   ├── layout/           # Header, Footer, BottomNav
│   ├── providers/        # QuickViewProvider
│   └── shared/           # ScrollToTop, ClientOverlays
├── db/
│   └── schema.ts         # Skema Database Drizzle (Users, Products, Orders, Banners)
├── features/
│   └── cart/             # Zustand Cart Store & Floating Cart Drawer
├── hooks/                # Custom React Hooks (useIsMobile)
├── lib/
│   ├── db.ts             # Singleton PostgreSQL connection pool
│   ├── s3-storage.ts     # Upload & Delete AWS S3 Utility
│   ├── ratelimit.ts      # Rate limiter helper
│   └── utils.ts          # Utility formatting & cn helper
├── scripts/              # Skrip admin & maintenance
├── tests/                # Skrip isolasi pengujian (DB, S3)
└── Dockerfile            # Containerization deployment
```

---

## 🛠️ Shortcut Commands

- `npm run dev`: Jalankan server dev lokal
- `npm run build`: Kompilasi build produksi (cross-platform)
- `npm run test:conn`: Tes koneksi database PostgreSQL
- `npm run test:s3`: Tes upload S3 cloud storage
