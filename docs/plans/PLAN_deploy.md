# Panduan Deploy Parfume Store ke Coolify

## Prasyarat

- Server/VPS dengan **4GB RAM** minimum
- Domain (opsional, bisa pakai IP dulu)
- GitHub repo sudah ada: `ugajelum949-star/parfume`

## Step 1: Install Coolify di Server

### Via SSH (recommended)

```bash
# SSH ke server
ssh root@IP_SERVER

# Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Coolify akan jalan di port `8000`. Buka:
```
http://IP_SERVER:8000
```

### Setup Awal Coolify

1. Buka `http://IP_SERVER:8000`
2. Buat akun admin Coolify (bukan admin parfume — ini admin Coolify)
3. **Skip** SSH key setup dulu (bisa diatur nanti)

---

## Step 2: Tambah PostgreSQL Database

Di Coolify:

1. Klik **Databases** → **New**
2. Pilih **PostgreSQL**
3. Nama: `parfume-db`
4. Version: `16` (latest)
5. Klik **Deploy**
6. Tunggu sampai status **Running**
7. Catat connection string (akan dipakai nanti):
   ```
   postgresql://coolify:PASSWORD@parfume-db:5432/coolify
   ```

---

## Step 3: Deploy Parfume Store

### 3a. Tambah Application

1. Klik **Applications** → **New**
2. Pilih **Git Based** → **GitHub**
3. Connect GitHub account (authorize Coolify)
4. Pilih repo: `ugajelum949-star/parfume`
5. Branch: `main`

### 3b. Konfigurasi Build

| Setting | Value |
|---------|-------|
| Build Pack | **Nixpacks** |
| Port | `3000` |
| Base Directory | `/` |
| Health Check Path | `/` |

### 3c. Environment Variables

Klik tab **Environment Variables** → tambah:

```env
DATABASE_URL=postgresql://coolify:PASSWORD@parfume-db:5432/coolify
NEXT_PUBLIC_BASE_URL=http://IP_SERVER
S3_ENDPOINT=https://is3.cloudhost.id
S3_REGION=us-east-1
S3_ACCESS_KEY=xxx
S3_SECRET_KEY=xxx
S3_BUCKET=xxx
ADMIN_EMAIL=xxx@parfume.com
ADMIN_PASSWORD=Jarwo828@Jr
```

> **Penting:** Ganti `PASSWORD` dengan password PostgreSQL yang dihasilkan Coolify.
> Ganti `IP_SERVER` dengan IP atau domain kamu.

### 3d. Deploy

1. Klik **Deploy**
2. Tunggu build selesai (biasanya 2-5 menit)
3. Status berubah jadi **Running** (hijau)
4. Klik URL untuk buka aplikasi

---

## Step 4: Inisialisasi Database

Setelah deploy pertama kali, database masih kosong. Perlu jalankan seed + init admin.

### 4a. Cari Container ID

Di Coolify → Applications → Parfume → **Terminal** tab

Atau via SSH:
```bash
# Cari container parfume
docker ps | grep parfume

# Masuk ke container
docker exec -it CONTAINER_ID sh
```

### 4b. Jalankan Commands

```bash
# Push schema ke database
npx drizzle-kit push

# Seed data (products, banners, testimonials, blog posts)
npm run seed

# Buat admin user
npx tsx scripts/admin/init_admin.ts
```

### 4c. Akses Admin

Buka: `http://IP_SERVER/login`

| Field | Value |
|-------|-------|
| Email | `xxx@parfume.com` |
| Password | `Jarwo828@Jr` |

---

## Step 5: Domain & SSL (Opsional)

### 5a. Tambah Domain

Di Coolify → Application → **General** → **Domains**

```
parfumestore.com
www.parfumestore.com
```

### 5b. SSL otomatis

Coolify otomatis setup SSL via Let's Encrypt kalau domain sudah pointing ke IP server.

### 5c. DNS Setting

Di registrar domain (Namecheap, Cloudflare, dll):

| Type | Name | Value |
|------|------|-------|
| A | @ | IP_SERVER |
| A | www | IP_SERVER |

---

## Step 6: Update Environment Variables

Setelah domain aktif:

```
NEXT_PUBLIC_BASE_URL=https://parfumestore.com
```

---

## Troubleshooting

### Build gagal
- Cek logs di Coolify → Application → **Logs**
- Pastikan `DATABASE_URL` benar
- Pastikan PostgreSQL container running

### Application restart loop
- Cek logs untuk error message
- Pastikan semua env vars terisi
- Pastikan port 3000 tidak conflict

### Database connection error
- Pastikan PostgreSQL container running
- Pastikan `DATABASE_URL` format benar
- Coba test dari Coolify terminal: `npx tsx scripts/test-conn.ts`

### RAM Usage
- 4GB seharusnya cukup untuk Next.js + PostgreSQL
- Monitor di Coolify → **Monitoring**
- Kalau RAM > 80%, pertimbangkan tambah swap

---

## Checklist Deploy

- [ ] Coolify installed
- [ ] PostgreSQL database created
- [ ] Application deployed
- [ ] Environment variables set
- [ ] `drizzle-kit push` executed
- [ ] `npm run seed` executed
- [ ] Admin user created
- [ ] Admin login tested
- [ ] Homepage loads
- [ ] Products page works
- [ ] Checkout flow works
- [ ] Domain + SSL configured (opsional)

---

*Back to [[00-index]]*
