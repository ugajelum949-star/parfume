---
tags: [table]
---

# product_images

Multiple images per product.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| url | text | NOT NULL |
| product_id | uuid | FK → products, CASCADE |
| order | integer | default 0 |

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
