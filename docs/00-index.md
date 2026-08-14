---
aliases: [home, start, toc, map of content]
tags: [moc]
---

# Project Map

> **Parfume Store** — Next.js 16 + Drizzle ORM + PostgreSQL + TailwindCSS v4 + Zustand

## Core Architecture

- [[PROJECT_OVERVIEW]] — Business purpose, scope, features, routes
- [[DESIGN_SYSTEM]] — Dark Editorial theme, component patterns
- [[DATABASE_SCHEMA]] — 12 tables, relations
- [[ADMIN_GUIDE]] — Admin panel operations

## Database Tables (12)

- [[TABLE_users]] · [[TABLE_products]] · [[TABLE_product_images]]
- [[TABLE_orders]] · [[TABLE_order_items]] · [[TABLE_payment_methods]]
- [[TABLE_testimonials]] · [[TABLE_settings]] · [[TABLE_banners]]
- [[TABLE_wars]] · [[TABLE_war_items]] · [[TABLE_posts]]

## Flows

- [[FLOW_auth]] — Login, session, admin verification
- [[FLOW_products]] — Product CRUD, image upload
- [[FLOW_cart]] — Zustand cart, drawer summary
- [[FLOW_checkout]] — Checkout form, order creation
- [[FLOW_orders]] — Order listing, status lifecycle, invoice
- [[FLOW_settings]] — Store branding, payments, contact, Telegram
- [[FLOW_shipping]] — Shipping zones, province mapping, promo thresholds
- [[FLOW_telegram]] — Telegram bot, notifications, deep links
- [[FLOW_testimonials]] — Reviews/testimonials CRUD, homepage & product display
- [[FLOW_wars]] — War (product drop) pricing lifecycle, auto-conversion

## Plans

- [[PLAN_features]] — 7 new features: stock alert, wishlist, search, comparison, blog, gift wrap, SEO
- [[PLAN_design]] — Visual refresh: Dark Editorial, Mykonos-inspired layout
- [[PLAN_lint-fix]] — Fix 82 lint errors & warnings
- [[PLAN_war]] — War implementation plan & progress tracker
- [[PLAN_security]] — Security fixes: signed tokens, rate limiting, XSS, upload validation
- [[PLAN_hacking]] — Threat model: 19 ancaman + mitigasi
- [[PLAN_seo]] — SEO strategy: technical, on-page, content, performance
- [[PLAN_audit]] — Full codebase audit: vulnerabilities & secure areas

## Feature Progress

| # | Fitur | Status |
|---|-------|:------:|
| 1 | Stock Alert / Habis Badge | ✅ |
| 2 | Wishlist / Favorite | ✅ |
| 3 | Search + Autocomplete | ✅ |
| 4 | Product Comparison | ✅ |
| 5 | Blog / Content Page | ✅ |
| 6 | Gift Wrapping | ✅ |
| 7 | SEO Meta Tags + JSON-LD | ✅ |

---

*Last updated: 2026-08-14*
