---
aliases: [lint-fix, code-quality]
tags: [plan, cleanup]
last_updated: 2026-08-14
---

# Lint Fix Plan

## Summary

```
82 problems: 15 errors, 67 warnings
2 errors auto-fixable with --fix
```

## Error Categories

### Category 1: `react-hooks/set-state-in-effect` (10 errors + 1 warning)

**Masalah:** Memanggil `setState()` langsung di dalam `useEffect` body — React strict mode tidak suka ini.

**Files affected:**
| File | Line | Code |
|------|------|------|
| `app/admin/banners/page.tsx` | 38 | `useEffect(() => { load() }, [])` |
| `app/admin/blog/page.tsx` | 61 | `useEffect(() => { load() }, [])` |
| `app/admin/blog/page.tsx` | 66 | `setSlug(slugify(title))` inside effect |
| `app/admin/payment-methods/page.tsx` | 61 | `load()` inside effect |
| `app/admin/testimonials/page.tsx` | 51 | `useEffect(() => { load() }, [])` |
| `app/admin/wars/page.tsx` | 54 | `useEffect(() => { load() }, [])` |
| `app/cart/CartClient.tsx` | 54 | `setMounted(true)` inside effect |
| `app/cart/CartClient.tsx` | 79 | `setShippingService(...)` inside effect |
| `components/search/SearchAutocomplete.tsx` | 110 | `setRecentSearches(...)` inside effect |
| `hooks/use-mobile.ts` | 11 | `setIsMobile(mql.matches)` inside effect |

**Fix pattern:**

```tsx
// ❌ LAMA — setState langsung di effect body
useEffect(() => {
  const data = await fetchSomething()
  setData(data)
}, [])

// ✅ BARU — wrap di async function
useEffect(() => {
  async function load() {
    const data = await fetchSomething()
    setData(data)
  }
  load()
}, [])
```

**Catatan:** Sebenarnya pattern ini umum di React (fetch-on-mount). Error ini dari React 19 strict mode. Fix-nya adalah bungkus dalam async function internal, atau pakai pattern yang disarankan React docs.

### Category 2: `prefer-const` (2 errors)

| File | Line | Fix |
|------|------|-----|
| `app/blog/[slug]/page.tsx` | 38 | `let html` → `const html` |
| `app/cart/page.tsx` | 9 | `let settingsMap` → `const settingsMap` |

**Fix:** Ganti `let` → `const` (2 line).

### Category 3: `react/no-unescaped-entities` (2 errors)

| File | Line | Fix |
|------|------|-----|
| `app/invoice/[id]/InvoiceClient.tsx` | 121 | `"` → `&quot;` |

**Fix:** Escape quote characters di JSX:
```tsx
// ❌ LAMA
<p>Ada yang perlu ditanyakan?</p>

// ✅ BARU
<p>Ada yang perlu ditanyakan?</p>
// atau
<p>{`Ada yang perlu ditanyakan?`}</p>
```

### Category 4: `typescript-eslint/no-explicit-any` (1 error)

| File | Line | Fix |
|------|------|-----|
| `app/invoice/[id]/InvoiceClient.tsx` | 50 | `any` → proper type |

**Fix:** Ganti `any` dengan type yang tepat:
```tsx
// ❌ LAMA
const handler = (data: any) => { ... }

// ✅ BARU
const handler = (data: Record<string, unknown>) => { ... }
// atau
const handler = (data: { [key: string]: string }) => { ... }
```

---

## Warning Categories

### Category 5: `typescript-eslint/no-unused-vars` (17 warnings)

**Auto-fixable:** Run `npm run lint -- --fix` untuk 2 error pertama. Sisanya perlu manual.

| File | Unused Import/Variable | Action |
|------|----------------------|--------|
| `app/actions/banners.ts` | `desc` | Hapus dari import |
| `app/actions/orders.ts` | `getZoneByProvince`, `getAvailableServices` | Hapus dari import |
| `app/actions/upload.ts` | `deleteFromS3` | Hapus dari import |
| `app/actions/wars.ts` | `soldStock` | Hapus assignment |
| `app/admin/banners/page.tsx` | `GripVertical` | Hapus dari import |
| `app/admin/dashboard/page.tsx` | `sum` | Hapus assignment |
| `app/admin/orders/[id]/OrderStatusUpdater.tsx` | `Button` | Hapus dari import |
| `app/admin/orders/page.tsx` | `CardHeader`, `CardTitle` | Hapus dari import |
| `app/admin/payment-methods/page.tsx` | `formatCurrency` | Hapus dari import |
| `app/admin/products/page.tsx` | `BRANDS`, `price` | Hapus dari import/assignment |
| `app/admin/wars/page.tsx` | `Pencil`, `getWarWithItems` | Hapus dari import |
| `app/cart/CartClient.tsx` | `CheckCircle`, `Truck`, `MapPin`, `notes`, `setNotes` | Hapus dari import/assignment |
| `app/compare/page.tsx` | `getSizePrice` | Hapus dari import |
| `app/invoice/[id]/InvoiceClient.tsx` | `customerName`, `total` | Hapus assignments |
| `app/invoice/[id]/page.tsx` | `Badge`, `Circle` | Hapus dari import |
| `app/page.tsx` | `Link`, `sql`, `orderItems`, `TestimonialsSection`, `formatCurrency`, `latestTestimonials` | Hapus dari import/assignment |
| `app/product/[id]/page.tsx` | `price` | Hapus assignment |
| `components/compare/CompareBar.tsx` | `Image` | Hapus dari import |
| `components/home/PopularSection.tsx` | `getFirstSizePrice` | Hapus dari import |
| `components/search/SearchAutocomplete.tsx` | `Star` | Hapus dari import |

### Category 6: `next/next/no-img-element` (24 warnings)

**Bukan error.** Warning ini bilang sebaiknya pakai `<Image>` dari Next.js untuk optimasi. Tapi di admin panel dan S3-hosted images, `<img>` sering kali lebih practical (karena image loader perlu dikonfigurasi).

**Approach:**
- **Admin pages** → biarkan `<img>` (24 warning) — admin pages tidak perlu image optimization
- **Public pages** → ganti ke `<Image>` dengan custom loader untuk S3 images

### Category 7: `react-hooks/set-state-in-effect` warnings (di CartClient line 79)

Sudah tercakup di Category 1.

---

## Execution Plan

### Step 1: Auto-fix (1 command)

```bash
npm run lint -- --fix
```

Ini fix 2 error (`prefer-const` di blog/[slug]/page.tsx dan cart/page.tsx).

### Step 2: Fix unused imports/variables (30 minutes)

Hapus semua unused imports di list Category 5. Bisa dilakukan satu per satu dengan `patch`.

**Approach:** 
- Setiap file, buka → hapus import yang tidak dipakai → lanjut file berikutnya
- Total: ~20 file perlu di-edit
- Semua perubahan kecil (1-2 baris per file)

### Step 3: Fix `set-state-in-effect` errors (1 hour)

Untuk setiap error di Category 1:

**Pattern A — Fetch on mount (8 cases):**
```tsx
// Wrap async function di dalam effect
useEffect(() => {
  async function load() {
    const data = await someAction()
    setState(data)
  }
  load()
}, [])
```

**Pattern B — Derive state from props (1 case di CartClient):**
```tsx
// Ganti useEffect → useMemo atau hitung langsung
const shippingService = useMemo(() => {
  if (zone === 'jabodetabek' || zone === 'jawa') return 'regular'
  return 'regular'
}, [zone])
```

**Pattern C — Client-side detection (1 case di use-mobile.ts):**
```tsx
// Pakai useState dengan lazy initializer + listener
const [isMobile, setIsMobile] = useState(() => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
})

useEffect(() => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  const onChange = () => setIsMobile(mql.matches)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}, [])
```

**Pattern D — Auto-generate slug (1 case di blog/page.tsx):**
```tsx
// Ganti useEffect → event handler atau derive langsung
const handleTitleChange = (newTitle: string) => {
  setTitle(newTitle)
  if (!slugEdited) {
    setSlug(slugify(newTitle))
  }
}
```

### Step 4: Fix remaining errors (15 minutes)

- `react/no-unescaped-entities` — escape quotes di InvoiceClient
- `typescript-eslint/no-explicit-any` — ganti `any` dengan proper type

### Step 5: Verify

```bash
npm run lint
npm run build
```

Target: 0 errors, warnings ≤ 30 (hanya `<img>` warnings di admin pages).

---

## Files Changed Summary

| Category | Files | Changes |
|----------|-------|---------|
| Auto-fix | 2 | `let` → `const` |
| Unused imports | ~20 | Hapus 1-2 imports per file |
| set-state-in-effect | 10 | Wrap async functions |
| Unescaped entities | 1 | Escape quotes |
| Explicit any | 1 | Add proper type |
| **Total** | **~25** | **Small, safe changes** |

## Risk

- **Low risk** — semua perubahan kecil dan terisolasi
- Tidak mengubah behavior, hanya struktur code
- `npm run build` harus tetap pass setelah semua fix

---

*Back to [[00-index]]*
