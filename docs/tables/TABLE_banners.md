---
tags: [table]
---

# banners

Homepage promotional banners.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| title | text | — |
| image | text | NOT NULL |
| link | text | — |
| active | boolean | default true |
| order | integer | default 0 |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
