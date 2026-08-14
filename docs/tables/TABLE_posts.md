---
tags: [table]
---

# posts

Blog articles and content pages.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| title | text | NOT NULL |
| slug | text | NOT NULL, UNIQUE |
| excerpt | text | — |
| content | text | NOT NULL (markdown) |
| cover_image | text | — |
| category | text | — (Care Tips, Scent Guide, News, Recommendation) |
| tags | text | default "" |
| published | boolean | default false |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

## Relations

- No foreign keys (standalone content table)

## Key Notes

- `slug` is unique — used for URL `/blog/[slug]`
- `published` controls visibility — only published posts shown on `/blog`
- `category` values: "Care Tips", "Scent Guide", "News", "Recommendation"
- Admin CRUD at `/admin/blog`

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
