---
aliases: [war-items, war-product]
tags: [database]
---

# Table: war_items

Individual products within a war event.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| warId | uuid | FK → wars (cascade delete) |
| name | text | Product name |
| brand | text | Brand name |
| category | text | Scent family |
| gender | text | Men / Women / Unisex |
| price | real | War price (= normal price) |
| sizes | text | Comma-separated sizes |
| stock | integer | War stock (limited) |
| image | text | Product image URL |
| productId | uuid | FK → products (nullable, set after conversion) |
| createdAt | timestamp | Created at |

## Relations

```
war_items ∞───1 wars
war_items ∞───1 products (after conversion)
```

## Related

- [[TABLE_wars]] — Parent war event
- [[FLOW_wars]] — Auto-conversion logic

*See also: [[DATABASE_SCHEMA]], [[PROJECT_OVERVIEW]]*
