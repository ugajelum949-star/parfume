# Graph Report - parfume  (2026-08-18)

## Corpus Check
- 121 files · ~82,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 654 nodes · 1427 edges · 36 communities (30 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin CRUD + Upload
- Public Shopping UI
- Admin Shell + UI Primitives
- Homepage + Brand Showcase
- NPM Dependencies
- Orders + Shipping + Cart
- Dev Dependencies
- TypeScript Config
- Blog System
- Root Layout + Providers
- Project Docs + Plans
- Schema + Auth Seed
- shadcn/ui Registry
- Auth + Products + DB
- API Routes + Rate Limit
- Product Detail + Reviews
- Product CRUD Admin
- Orders Admin
- Settings + Cart Pages
- Message Generator
- Testimonials CRUD
- Payment Proof + Telegram
- Testimonials Marquee
- S3 Orphan Cleanup
- Products Layout
- Error Boundary
- Next Config
- Drizzle Config
- Featured Brands Actions
- Gender Slots Settings

## God Nodes (most connected - your core abstractions)
1. `cn()` - 46 edges
2. `verifyAdmin()` - 45 edges
3. `formatCurrency()` - 31 edges
4. `db` - 27 edges
5. `Button` - 22 edges
6. `Card` - 20 edges
7. `uploadImage()` - 19 edges
8. `useCartStore` - 19 edges
9. `compilerOptions` - 17 edges
10. `CardContent` - 16 edges

## Surprising Connections (you probably didn't know these)
- `BPS (Best Parfume Store) Logo` --references--> `PROJECT_PLAN (Master Plan & Scale Project Part 1)`  [INFERRED]
  public/img.png → PROJECT_PLAN.md
- `BPS (Best Parfume Store) Logo` --conceptually_related_to--> `CSS/HTML Watermark Overlay`  [INFERRED]
  public/img.png → PLAN_FIX_UPLOAD_WATERMARK.md
- `ProductPage()` --calls--> `parseAllSizePrices()`  [EXTRACTED]
  app/product/[id]/page.tsx → lib/price.ts
- `PLAN FIX UPLOAD WATERMARK Document` --conceptually_related_to--> `PROJECT_PLAN (Master Plan & Scale Project Part 1)`  [INFERRED]
  PLAN_FIX_UPLOAD_WATERMARK.md → PROJECT_PLAN.md
- `login()` --calls--> `rateLimit()`  [EXTRACTED]
  app/actions/auth.ts → lib/ratelimit.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **S3 File Lifecycle (Upload, Store, Delete)** — plan_fix_upload_watermark_lib_s3_storage_uploadtos3, plan_fix_upload_watermark_lib_s3_storage_deletefroms3, plan_fix_upload_watermark_lib_s3_storage_getpresigneduploadurl, concept_acl_fallback, concept_s3_orphan_cleanup, plan_fix_upload_watermark_direct_to_telegram_proof [INFERRED 0.85]
- **Image Upload Pipeline (Compress, Encode, Upload)** — plan_fix_upload_watermark_lib_compression_compressimage, plan_fix_upload_watermark_lib_compression_filetobase64, plan_fix_upload_watermark_app_actions_upload_ts, concept_client_side_compression [EXTRACTED 1.00]
- **Homepage Product Sections Architecture** — concept_homepage_architecture, project_plan_homepage_product_logic, project_plan_curated_gender_slots, project_plan_brand_showcase_slider [EXTRACTED 1.00]

## Communities (36 total, 6 thin omitted)

### Community 0 - "Admin CRUD + Upload"
Cohesion: 0.07
Nodes (54): deletePaymentMethod(), getPaymentMethods(), savePaymentMethod(), uploadQrisImage(), ALLOWED_MIME_TYPES, forceJpg(), generateUploadUrl(), uploadImage() (+46 more)

### Community 1 - "Public Shopping UI"
Cohesion: 0.08
Nodes (46): getProducts(), DashboardPage(), CompareContent(), dynamic, Product, Product, ProductsContent(), dynamic (+38 more)

### Community 2 - "Admin Shell + UI Primitives"
Cohesion: 0.08
Nodes (33): logout(), navItems, SidebarContent(), Badge(), BadgeProps, badgeVariants, CardFooter, DropdownMenuCheckboxItem() (+25 more)

### Community 3 - "Homepage + Brand Showcase"
Cohesion: 0.07
Nodes (33): checkExpiredWars(), convertWarToProducts(), convertWarToProductsInternal(), createWar(), deleteWar(), getActiveWars(), getScheduledWars(), getWars() (+25 more)

### Community 4 - "NPM Dependencies"
Cohesion: 0.05
Nodes (41): @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcryptjs, class-variance-authority, clsx, drizzle-orm, isomorphic-dompurify, lucide-react (+33 more)

### Community 5 - "Orders + Shipping + Cart"
Cohesion: 0.08
Nodes (30): ALLOWED_SHIPPING_SERVICES, ALLOWED_STATUSES, createOrder(), getOrders(), updateOrderStatus(), OrderStatusUpdater(), statusConfig, statuses (+22 more)

### Community 6 - "Dev Dependencies"
Cohesion: 0.12
Nodes (31): verifyAdmin(), createBanner(), deleteBanner(), getBanners(), toggleBanner(), updateBanner(), createFeaturedBrand(), deleteFeaturedBrand() (+23 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.05
Nodes (36): dotenv, drizzle-kit, eslint, eslint-config-next, devDependencies, dotenv, drizzle-kit, eslint (+28 more)

### Community 8 - "Blog System"
Cohesion: 0.06
Nodes (30): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 9 - "Root Layout + Providers"
Cohesion: 0.12
Nodes (23): createPost(), deletePost(), getAllPosts(), getPost(), getPosts(), updatePost(), AdminBlogPage(), init() (+15 more)

### Community 10 - "Project Docs + Plans"
Cohesion: 0.14
Nodes (15): getSettings(), dmSerif, inter, metadata, organizationJsonLd, viewport, Footer(), ProtectionProvider() (+7 more)

### Community 11 - "Schema + Auth Seed"
Cohesion: 0.10
Nodes (21): S3 ACL Fallback Strategy, Client-Side Image Compression via Canvas, Homepage Architecture & Sections, Replace Sharp Watermark with CSS Overlay, PLAN FIX UPLOAD WATERMARK Document, Admin Form Compression Integration Pattern, app/actions/upload.ts (Clean Upload Pipeline), CSS/HTML Watermark Overlay (+13 more)

### Community 12 - "shadcn/ui Registry"
Cohesion: 0.11
Nodes (14): AdminShell(), dynamic, featuredBrands, orderItemsRelations, ordersRelations, paymentMethodsRelations, posts, productImagesRelations (+6 more)

### Community 13 - "Auth + Products + DB"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 14 - "API Routes + Rate Limit"
Cohesion: 0.20
Nodes (8): isRedirectError(), login(), dynamic, LoginPage(), productImages, client, db, globalForDb

### Community 15 - "Product Detail + Reviews"
Cohesion: 0.23
Nodes (9): GET(), dynamic, GET(), dynamic, GET(), HIDDEN_KEYS, rateLimit(), rateLimitMap (+1 more)

### Community 16 - "Product CRUD Admin"
Cohesion: 0.17
Nodes (8): dynamic, ProductPage(), Props, revalidate, ProductTestimonials(), rotations, Testimonial, testimonials

### Community 17 - "Orders Admin"
Cohesion: 0.20
Nodes (9): createProduct(), deleteProduct(), updateProduct(), ProductsPage(), handleDelete(), handleExtraImageUpload(), handleImageUpload(), handleSubmit() (+1 more)

### Community 18 - "Settings + Cart Pages"
Cohesion: 0.32
Nodes (7): dynamic, formatDate(), getOrders(), OrdersPage(), statusColors, statusLabels, orderItems

### Community 19 - "Message Generator"
Cohesion: 0.25
Nodes (4): dynamic, dynamic, paymentMethods, settings

### Community 20 - "Testimonials CRUD"
Cohesion: 0.29
Nodes (3): OrderData, TransferSettings, CartItem

### Community 21 - "Payment Proof + Telegram"
Cohesion: 0.48
Nodes (6): createTestimonial(), deleteTestimonial(), getTestimonials(), updateTestimonial(), AdminTestimonialsPage(), init()

### Community 22 - "Testimonials Marquee"
Cohesion: 0.47
Nodes (3): ALLOWED_TYPES, POST(), sendTelegramPhoto()

### Community 24 - "Products Layout"
Cohesion: 0.50
Nodes (4): S3 Orphaned File Cleanup, deleteBanner() (S3 Auto-Cleanup), deleteProduct() (S3 Auto-Cleanup), deleteFromS3()

## Knowledge Gaps
- **217 isolated node(s):** `ALLOWED_STATUSES`, `ALLOWED_SHIPPING_SERVICES`, `ShippingConfig`, `DEFAULTS`, `ALLOWED_MIME_TYPES` (+212 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Admin Shell + UI Primitives` to `Admin CRUD + Upload`, `Public Shopping UI`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `verifyAdmin()` connect `Dev Dependencies` to `Admin CRUD + Upload`, `Homepage + Brand Showcase`, `Orders + Shipping + Cart`, `Root Layout + Providers`, `API Routes + Rate Limit`, `Orders Admin`, `Payment Proof + Telegram`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `formatCurrency()` connect `Public Shopping UI` to `Admin CRUD + Upload`, `Orders Admin`, `Settings + Cart Pages`, `Orders + Shipping + Cart`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `ALLOWED_STATUSES`, `ALLOWED_SHIPPING_SERVICES`, `ShippingConfig` to the rest of the system?**
  _217 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin CRUD + Upload` be split into smaller, more focused modules?**
  _Cohesion score 0.07052631578947369 - nodes in this community are weakly interconnected._
- **Should `Public Shopping UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07511737089201878 - nodes in this community are weakly interconnected._
- **Should `Admin Shell + UI Primitives` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._