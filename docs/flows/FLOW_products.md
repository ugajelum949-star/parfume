---
aliases: [product-management, crud]
tags: [flow]
last_updated: 2026-08-12
---

# Product Flow

## Create Product

```
Admin clicks "Add Product"
  ↓
Server Action: createProduct(formData)
  ↓
verifyAdmin() check
  ↓
Parse FormData: name, category, price, description, brand, scent family, images, sizes
  ↓
Validate: name + category + price required
  ↓
db.insert(products) → returns new product
  ↓
revalidatePath('/admin/products', '/')
  ↓
Return { success: true, product }
```

## Edit Product

```
Admin clicks edit on product
  ↓
Server Action: updateProduct(id, formData)
  ↓
verifyAdmin() check
  ↓
Parse FormData: name, category, price, description, brand, scent family, images, sizes
  ↓
db.update(products).where(eq(products.id, id))
  ↓
revalidatePath('/admin/products', '/')
```

## Delete Product

```
Admin clicks delete
  ↓
Server Action: deleteProduct(id)
  ↓
verifyAdmin() check
  ↓
db.delete(products).where(eq(products.id, id))
  ↓
revalidatePath('/admin/products', '/')
```

## Image Upload

Product images support up to 5 images: 1 main image + 4 extra images via `product_images` table.

```
Client sends image as base64
  ↓
Server Action: handles server-side base64 processing
  ↓
Server stores image (base64 in DB or file storage)
  ↓
Product record updated with image reference
```

No presigned URLs — all upload is server-side base64.

## Key Fields

| Field | Notes |
|-------|-------|
| Brand | Free text input (not a dropdown) |
| Scent Family | One of 4: `Fresh`, `Floral`, `Woody`, `Amber` |
| Images | 1 main + 4 extra (server-side base64) |
| Sizes | Array of available product sizes |

## Key Files

- `app/actions/products.ts` — CRUD operations
- `lib/config.ts` — `SCENT_FAMILIES` (4: Fresh, Floral, Woody, Amber)

---

*See also: [[FLOW_wars]] — War product lifecycle & auto-conversion*

*Back to [[00-index]]*
