---
tags: [table]
---

# testimonials

Customer reviews and testimonials.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| name | text | NOT NULL |
| role | text | — |
| content | text | NOT NULL |
| rating | integer | default 5 |
| avatar | text | — |
| proof_image | text | — |
| created_at | timestamp | defaultNow() |

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
