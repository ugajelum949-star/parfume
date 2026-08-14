---
tags: [table]
---

# settings

Key-value store for app configuration.

| Column | Type | Constraints |
|--------|------|-------------|
| key | text | PK |
| value | text | NOT NULL |

## Usage

Store name, support email, and other configurable values. Accessed via `app/api/settings/route.ts`.

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
