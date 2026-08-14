---
tags: [table]
---

# orders

Customer orders.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| user_id | uuid | FK → users |
| payment_method_id | uuid | FK → payment_methods, SET NULL |
| total | real | NOT NULL |
| status | text | default "PENDING" |
| customer_name | text | — |
| customer_phone | text | — |
| shipping_address | text | — |
| shipping_zone | text | — |
| ip_address | text | — |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

## Status Flow

`PENDING` → `PAID` → `PROCESSING` → `SHIPPED` → `COMPLETED`

## Relations

- orders → users (many-to-one)
- orders → payment_methods (many-to-one)
- orders → order_items (one-to-many)

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
