---
aliases: [authentication, login, session]
tags: [flow]
---

# Auth Flow

## Login

```
User → /login → email + password
  ↓
Server Action: login()
  ↓
Rate limit check (5 attempts/min per IP)
  ↓
Query users table by email
  ↓
bcrypt.compare(password, user.password)
  ↓
Check role === "ADMIN"
  ↓
Set cookie: auth_session = user.id (httpOnly, secure, sameSite: strict, 24h)
  ↓
Redirect → /admin/dashboard
```

## Admin Verification

```
Request to /admin/* route
  ↓
proxy.ts middleware: check auth_session cookie
  ↓
Cookie exists? → continue
No cookie → redirect /login
  ↓
Server Action calls verifyAdmin()
  ↓
Query users table by cookie value
  ↓
user.role === "ADMIN"? → return user
Not admin → redirect /login
```

## Logout

```
Form action: logout()
  ↓
Delete auth_session cookie
  ↓
Redirect → /login
```

## Key Files

- `app/actions/auth.ts` — login, logout, verifyAdmin
- `proxy.ts` — middleware guard for /admin routes

---

*Back to [[00-index]]*
