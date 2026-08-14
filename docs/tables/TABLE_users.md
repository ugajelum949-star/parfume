---
tags: [table]
---

# users

Admin and user accounts.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, defaultRandom() |
| email | text | NOT NULL, UNIQUE |
| password | text | NOT NULL (bcrypt) |
| name | text | — |
| role | text | default "USER" |
| created_at | timestamp | defaultNow() |
| updated_at | timestamp | $onUpdate |

## Key Notes

- Role: `"ADMIN"` or `"USER"`
- Passwords hashed with bcryptjs
- Session: raw UUID stored in `auth_session` cookie

## Relations

- users → orders (one-to-many)

---

*See also: [[DATABASE_SCHEMA]]*

*Back to [[00-index]]*
