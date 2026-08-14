---
tags: [table]
---

# payment_methods

QRIS and bank transfer payment configuration.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| type | text | NOT NULL ('qris' or 'transfer') |
| label | text | NOT NULL |
| account_name | text | — |
| account_number | text | — |
| qris_image_url | text | — |
| is_active | boolean | default true |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

## Relations

- payment_methods → orders (one-to-many)

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
