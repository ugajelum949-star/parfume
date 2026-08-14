---
tags: [table]
---

# products

Product catalog.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| name | text | NOT NULL |
| category | text | NOT NULL |
| brand | text | default "-" |
| price | real | NOT NULL |
| description | text | — |
| image | text | — |
| sizes | text | NOT NULL (e.g. "S,M,L,XL") |
| stock_data | text | default "{}" (JSON string per-size stock) |
| stock | integer | default 0 |
| tags | text | default "" |
| is_best_seller | boolean | default false |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

## Categories

Defined in `lib/config.ts`:
- General
- Featured
- New Arrival
- Sale

## Size Presets

Also in `lib/config.ts`:
- Standard: S, M, L, XL, XXL (10 each)

## Relations

- products → product_images (one-to-many)
- products → order_items (one-to-many)

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
