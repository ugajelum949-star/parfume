---
aliases: [schema, tables, db, database]
tags: [database]
---

# Database Schema

PostgreSQL via Drizzle ORM. UUID primary keys throughout.

## Tables (12)

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| [[TABLE_users]] | Admin/user accounts | → orders |
| [[TABLE_products]] | Product catalog | → product_images, order_items |
| [[TABLE_product_images]] | Multiple images per product | → products |
| [[TABLE_orders]] | Customer orders | → users, payment_methods, order_items |
| [[TABLE_order_items]] | Line items in orders | → orders, products |
| [[TABLE_payment_methods]] | QRIS/bank transfer config | → orders |
| [[TABLE_testimonials]] | Customer reviews | — |
| [[TABLE_settings]] | Key-value config store | — |
| [[TABLE_banners]] | Homepage banners | — |
| [[TABLE_wars]] | Product drop events | → war_items |
| [[TABLE_war_items]] | War product items | → wars, products |
| [[TABLE_posts]] | Blog articles | — |

## Relations

```
users 1───∞ orders
orders ∞───1 users
orders ∞───1 payment_methods
orders 1───∞ order_items
order_items ∞───1 products
products 1───∞ product_images
products 1───∞ order_items
payment_methods 1───∞ orders
wars 1───∞ war_items
war_items ∞───1 products (after conversion)
```

## Schema File

Single source: `db/schema.ts`

## Migrations

```bash
npx drizzle-kit generate  # Generate SQL migration
npx drizzle-kit push      # Push directly to DB
```

---

*See also: [[PROJECT_OVERVIEW]], individual table docs*

---

*Back to [[00-index]]*
