---
aliases: [testimonials, reviews, customer-reviews]
tags: [flow, testimonials]
---

# Testimonials Flow

> Customer reviews/testimonials — admin CRUD, homepage display, product detail display.

## Schema

```typescript
// db/schema.ts
testimonials = pgTable("testimonials", {
  id: uuid          // primary key, auto-generated
  name: text        // customer name (required)
  role: text        // e.g. "Loyal Customer" (optional)
  content: text     // review text (required)
  rating: integer   // 1-5, default 5
  avatar: text      // avatar image URL (optional)
  proofImage: text  // proof/screenshot image (optional)
  createdAt: timestamp
})
```

## Server Actions

**File:** `app/actions/testimonials.ts`

| Action | Auth | Description |
|--------|------|-------------|
| `getTestimonials()` | Public | Returns all testimonials, ordered by `createdAt DESC` |
| `createTestimonial(formData)` | Admin | Inserts new testimonial, revalidates `/` and `/admin/testimonials` |
| `updateTestimonial(id, formData)` | Admin | Updates testimonial by ID, revalidates paths |
| `deleteTestimonial(id)` | Admin | Deletes testimonial by ID, revalidates paths |

All mutations use `verifyAdmin()` from `@/app/actions/auth`.

## Admin Page

**File:** `app/admin/testimonials/page.tsx`

- Client component with list + add/edit form
- Avatar upload via `uploadImage` from `@/app/actions/upload`
- Star rating picker (1-5)
- Edit/delete actions per testimonial
- Uses `react-hot-toast` for feedback
- Nav link in `AdminShell.tsx` (Reviews, Star icon)

## Display Components

### Homepage

**File:** `components/home/TestimonialsSection.tsx`

- Props: `{ testimonials: Testimonial[] }`
- Grid layout: 2 columns mobile, 3 desktop
- Each card: avatar (or initials circle), name, role, star rating, content
- Rendered in `app/page.tsx` between best sellers and trust strip
- Only shown if testimonials exist; limited to 6

### Product Detail

**File:** `components/product/ProductTestimonials.tsx`

- Props: `{ testimonials: Testimonial[] }`
- Shows average rating at top
- Compact grid of review cards
- Empty state message when no reviews
- Rendered in `app/product/[id]/page.tsx` after product detail

## Seed Data

**File:** `scripts/seed.ts`

- 6 testimonials with Indonesian names
- Ratings: mix of 4 and 5 stars
- Realistic Indonesian perfume review content
- Avatar placeholders from placehold.co

## Data Flow

```
Seed → DB (testimonials table)
  ↓
getTestimonials() → admin page (list/form)
  ↓
createTestimonial / updateTestimonial / deleteTestimonial → revalidatePath
  ↓
app/page.tsx (server) → TestimonialsSection (client)
app/product/[id]/page.tsx (server) → ProductTestimonials (client)
```

## Related

- [[TABLE_testimonials]] — Schema reference
- [[FLOW_auth]] — `verifyAdmin()` session check
