---
tags: [table]
---

# order_items

Line items in orders.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| order_id | uuid | FK → orders, CASCADE |
| product_id | uuid | FK → products |
| quantity | integer | NOT NULL |
| size | text | NOT NULL |
| price | real | NOT NULL |
| notes | text | — |

## Relations

- order_items → orders (many-to-one)
- order_items → products (many-to-one)

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
