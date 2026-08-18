# Graph Report - parfume  (2026-08-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 637 nodes · 1473 edges · 33 communities (28 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9cea60b4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- formatCurrency
- admin/products/page.tsx
- verifyAdmin
- app/page.tsx
- cn
- dependencies
- devDependencies
- compilerOptions
- CartClient.tsx
- admin/blog/page.tsx
- app/layout.tsx
- proof/route.ts
- components.json
- db.ts
- orders.ts
- schema.ts
- product/[id]/page.tsx
- invoice/[id]/page.tsx
- message-generator.ts
- auth.ts
- orders/page.tsx
- image/route.ts
- products/layout.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `verifyAdmin()` - 48 edges
2. `cn()` - 46 edges
3. `formatCurrency()` - 31 edges
4. `db` - 27 edges
5. `Button` - 22 edges
6. `Card` - 20 edges
7. `useCartStore` - 19 edges
8. `getImageSrc()` - 18 edges
9. `uploadImage()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `ReviewCard()` --calls--> `getImageSrc()`  [EXTRACTED]
  components/product/ProductTestimonials.tsx → lib/image-proxy.ts
- `ProductPage()` --calls--> `parseAllSizePrices()`  [EXTRACTED]
  app/product/[id]/page.tsx → lib/price.ts
- `DashboardPage()` --calls--> `formatCurrency()`  [EXTRACTED]
  app/admin/dashboard/page.tsx → lib/utils.ts
- `CompareBar()` --calls--> `useCompareStore`  [EXTRACTED]
  components/compare/CompareBar.tsx → features/compare/store.ts
- `TestimonialCard()` --calls--> `getImageSrc()`  [EXTRACTED]
  components/home/TestimonialsSection.tsx → lib/image-proxy.ts

## Import Cycles
- None detected.

## Communities (33 total, 5 thin omitted)

### Community 0 - "formatCurrency"
Cohesion: 0.07
Nodes (52): getProducts(), CompareContent(), dynamic, Product, Product, ProductsContent(), dynamic, metadata (+44 more)

### Community 1 - "admin/products/page.tsx"
Cohesion: 0.10
Nodes (45): createBanner(), deleteBanner(), getBanners(), toggleBanner(), updateBanner(), createTestimonial(), deleteTestimonial(), getTestimonials() (+37 more)

### Community 2 - "verifyAdmin"
Cohesion: 0.08
Nodes (45): verifyAdmin(), createFeaturedBrand(), deleteFeaturedBrand(), getAllProductsForPicker(), getFeaturedBrands(), toggleFeaturedBrand(), updateFeaturedBrand(), deletePaymentMethod() (+37 more)

### Community 3 - "app/page.tsx"
Cohesion: 0.06
Nodes (35): checkExpiredWars(), convertWarToProducts(), convertWarToProductsInternal(), createWar(), deleteWar(), getActiveWars(), getScheduledWars(), getWars() (+27 more)

### Community 4 - "cn"
Cohesion: 0.08
Nodes (32): navItems, SidebarContent(), Badge(), BadgeProps, badgeVariants, CardFooter, DropdownMenuCheckboxItem(), DropdownMenuContent() (+24 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (41): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, class-variance-authority, clsx, drizzle-orm, isomorphic-dompurify, lucide-react (+33 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (36): dotenv, drizzle-kit, eslint, eslint-config-next, devDependencies, dotenv, drizzle-kit, eslint (+28 more)

### Community 7 - "compilerOptions"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 8 - "CartClient.tsx"
Cohesion: 0.11
Nodes (22): createOrder(), CartClient(), CartClientProps, PaymentMethod, DEFAULT_SIZE_PRESET, Gender, GENDERS, GIFT_WRAP_PRICE (+14 more)

### Community 9 - "admin/blog/page.tsx"
Cohesion: 0.12
Nodes (23): createPost(), deletePost(), getAllPosts(), getPost(), getPosts(), updatePost(), AdminBlogPage(), init() (+15 more)

### Community 10 - "app/layout.tsx"
Cohesion: 0.15
Nodes (14): getSettings(), dmSerif, inter, metadata, organizationJsonLd, viewport, Footer(), ProtectionProvider() (+6 more)

### Community 11 - "proof/route.ts"
Cohesion: 0.16
Nodes (12): GET(), ALLOWED_TYPES, POST(), dynamic, GET(), dynamic, GET(), HIDDEN_KEYS (+4 more)

### Community 12 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 13 - "db.ts"
Cohesion: 0.16
Nodes (9): AdminShell(), AdminLayout(), verifySession(), dynamic, dynamic, users, client, db (+1 more)

### Community 14 - "orders.ts"
Cohesion: 0.17
Nodes (12): ALLOWED_SHIPPING_SERVICES, ALLOWED_STATUSES, getOrders(), updateOrderStatus(), OrderStatusUpdater(), statusConfig, statuses, dynamic (+4 more)

### Community 15 - "schema.ts"
Cohesion: 0.14
Nodes (13): dynamic, banners, featuredBrands, orderItemsRelations, ordersRelations, paymentMethodsRelations, posts, productImagesRelations (+5 more)

### Community 16 - "product/[id]/page.tsx"
Cohesion: 0.15
Nodes (10): dynamic, ProductPage(), Props, revalidate, ProductTestimonials(), ReviewCard(), rotations, Testimonial (+2 more)

### Community 17 - "invoice/[id]/page.tsx"
Cohesion: 0.17
Nodes (8): dynamic, InvoiceClient(), dynamic, InvoicePage(), stepIndex(), STEPS, orderItems, paymentMethods

### Community 18 - "message-generator.ts"
Cohesion: 0.29
Nodes (3): OrderData, TransferSettings, CartItem

### Community 19 - "auth.ts"
Cohesion: 0.38
Nodes (6): isRedirectError(), login(), logout(), signSession(), verifySession(), LoginPage()

### Community 20 - "orders/page.tsx"
Cohesion: 0.38
Nodes (6): dynamic, formatDate(), getOrders(), OrdersPage(), statusColors, statusLabels

## Knowledge Gaps
- **212 isolated node(s):** `Product`, `Product`, `Product`, `Testimonial`, `WarItem` (+207 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `formatCurrency`, `admin/products/page.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `verifyAdmin()` connect `verifyAdmin` to `formatCurrency`, `admin/products/page.tsx`, `app/page.tsx`, `admin/blog/page.tsx`, `orders.ts`, `auth.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `formatCurrency` to `admin/products/page.tsx`, `verifyAdmin`, `app/page.tsx`, `CartClient.tsx`, `orders.ts`, `invoice/[id]/page.tsx`, `orders/page.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `Product`, `Product`, `Product` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `formatCurrency` be split into smaller, more focused modules?**
  _Cohesion score 0.06611813106082869 - nodes in this community are weakly interconnected._
- **Should `admin/products/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09672131147540984 - nodes in this community are weakly interconnected._
- **Should `verifyAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.07597402597402597 - nodes in this community are weakly interconnected._