# Graph Report - parfume  (2026-08-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 641 nodes · 1485 edges · 31 communities (26 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `622d2589`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- schema.ts
- app/products/page.tsx
- admin/products/page.tsx
- cn
- dependencies
- CartClient.tsx
- devDependencies
- getImageSrc
- compilerOptions
- admin/blog/page.tsx
- app/layout.tsx
- app/page.tsx
- verifyAdmin
- components.json
- product/[id]/page.tsx
- WishlistContent.tsx
- formatCurrency
- message-generator.ts
- SearchAutocomplete.tsx
- image/route.ts
- products/layout.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `verifyAdmin()` - 48 edges
2. `cn()` - 46 edges
3. `formatCurrency()` - 31 edges
4. `db` - 28 edges
5. `getImageSrc()` - 22 edges
6. `Button` - 22 edges
7. `Card` - 20 edges
8. `useCartStore` - 19 edges
9. `uploadImage()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  app/admin/dashboard/page.tsx → lib/utils.ts
- `ReviewCard()` --calls--> `getImageSrc()`  [EXTRACTED]
  components/product/ProductTestimonials.tsx → lib/image-proxy.ts
- `LoginPage()` --calls--> `useStoreSettings()`  [EXTRACTED]
  app/login/page.tsx → components/providers/StoreProvider.tsx
- `LoginPage()` --calls--> `getImageSrc()`  [EXTRACTED]
  app/login/page.tsx → lib/image-proxy.ts
- `OrderDetailPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  app/admin/orders/[id]/page.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (31 total, 5 thin omitted)

### Community 0 - "schema.ts"
Cohesion: 0.05
Nodes (53): isRedirectError(), login(), signSession(), AdminLayout(), verifySession(), dynamic, formatDate(), OrderDetailPage() (+45 more)

### Community 1 - "app/products/page.tsx"
Cohesion: 0.17
Nodes (17): getPublicProducts(), CompareContent(), dynamic, Product, Product, ProductsContent(), CompareBar(), Product (+9 more)

### Community 2 - "admin/products/page.tsx"
Cohesion: 0.09
Nodes (44): createTestimonial(), deleteTestimonial(), getTestimonials(), updateTestimonial(), uploadImage(), Banner, dynamic, emptyForm (+36 more)

### Community 3 - "cn"
Cohesion: 0.08
Nodes (33): logout(), navItems, SidebarContent(), Badge(), BadgeProps, badgeVariants, CardFooter, DropdownMenuCheckboxItem() (+25 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (41): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, class-variance-authority, clsx, drizzle-orm, isomorphic-dompurify, lucide-react (+33 more)

### Community 5 - "CartClient.tsx"
Cohesion: 0.08
Nodes (29): ALLOWED_SHIPPING_SERVICES, ALLOWED_STATUSES, createOrder(), getOrders(), updateOrderStatus(), OrderStatusUpdater(), statusConfig, statuses (+21 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (36): dotenv, drizzle-kit, eslint, eslint-config-next, devDependencies, dotenv, drizzle-kit, eslint (+28 more)

### Community 7 - "getImageSrc"
Cohesion: 0.13
Nodes (15): GenderSplit(), GenderSplitProps, Product, PopularSection(), Product, ScentCards(), scentFamilies, ScentImages (+7 more)

### Community 8 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 9 - "admin/blog/page.tsx"
Cohesion: 0.12
Nodes (23): createPost(), deletePost(), getAllPosts(), getPost(), getPosts(), updatePost(), AdminBlogPage(), init() (+15 more)

### Community 10 - "app/layout.tsx"
Cohesion: 0.13
Nodes (16): getSettings(), AdminShell(), dmSerif, inter, metadata, organizationJsonLd, viewport, Footer() (+8 more)

### Community 11 - "app/page.tsx"
Cohesion: 0.08
Nodes (28): getGenderSlots(), getSetting(), checkExpiredWars(), convertWarToProducts(), convertWarToProductsInternal(), createWar(), deleteWar(), getActiveWars() (+20 more)

### Community 12 - "verifyAdmin"
Cohesion: 0.06
Nodes (52): verifyAdmin(), verifySession(), createBanner(), deleteBanner(), getBanners(), toggleBanner(), updateBanner(), createFeaturedBrand() (+44 more)

### Community 13 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 14 - "product/[id]/page.tsx"
Cohesion: 0.14
Nodes (13): dynamic, ProductPage(), Props, revalidate, ProductTestimonials(), ReviewCard(), rotations, Testimonial (+5 more)

### Community 15 - "WishlistContent.tsx"
Cohesion: 0.21
Nodes (8): dynamic, metadata, Header(), NAV_LINKS, Product, WishlistContent(), useWishlistStore, WishlistStore

### Community 16 - "formatCurrency"
Cohesion: 0.32
Nodes (8): WarSection(), BottomNav(), Product, ProductDetail(), CartDrawer(), CartState, useCartStore, formatCurrency()

### Community 17 - "message-generator.ts"
Cohesion: 0.29
Nodes (3): OrderData, TransferSettings, CartItem

### Community 18 - "SearchAutocomplete.tsx"
Cohesion: 0.39
Nodes (6): getRecentSearches(), Product, saveRecentSearch(), SearchAutocomplete(), init(), searchProducts()

## Knowledge Gaps
- **212 isolated node(s):** `RateLimitRecord`, `Product`, `Product`, `Product`, `CartState` (+207 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `app/products/page.tsx`, `admin/products/page.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `verifyAdmin()` connect `verifyAdmin` to `schema.ts`, `admin/products/page.tsx`, `CartClient.tsx`, `admin/blog/page.tsx`, `app/page.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `schema.ts`, `app/products/page.tsx`, `admin/products/page.tsx`, `CartClient.tsx`, `getImageSrc`, `verifyAdmin`, `WishlistContent.tsx`, `SearchAutocomplete.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `RateLimitRecord`, `Product`, `Product` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.050617283950617285 - nodes in this community are weakly interconnected._
- **Should `admin/products/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09176587301587301 - nodes in this community are weakly interconnected._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._