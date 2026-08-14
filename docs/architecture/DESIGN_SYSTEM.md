---
aliases: [design, palette, tokens, styling, theme]
tags: [design]
last_updated: 2026-08-14
---

# Design System

## Theme: Dark Minimal

Black base, white text, red accent. Mykonos-inspired clean aesthetic.

## Color Palette

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Background | `#0C0C0C` | `bg-background` | Page base |
| Foreground | `#FAFAFA` | `text-foreground` | Primary text |
| Card | `#161616` | `bg-card` | Card surfaces |
| Secondary | `#1C1C1C` | `bg-secondary` | Input backgrounds |
| Accent | `#C43A31` | `bg-accent` | CTAs, highlights, buttons |
| Accent Hover | `#D94A41` | `bg-accent-hover` | Hover states |
| Muted | `#777777` | `text-muted-foreground` | Secondary text |
| Border | `#252525` | `border-border` | Dividers |

Legacy tokens mapped: `gold` → `#C43A31` (red accent), `navy` → `#0C0C0C` (background).

## Typography

- **Display / Headlines**: DM Serif Display (`font-serif`)
- **Body / UI**: Inter (`font-sans`)
- **Hero**: `text-4xl md:text-6xl lg:text-7xl font-serif`
- **Section titles**: `text-2xl md:text-3xl font-semibold`
- **Brand labels**: `text-[10px] uppercase tracking-wider`
- **Prices**: `font-bold`

## Component Patterns

### Marquee Bar
Scrolling promo banner at top. `animate-marquee` (30s linear infinite).

### Single-Row Header
Logo (left) | Nav links — Home, Produk, Kontak (center, desktop) | Search, Heart, Cart icons (right).
Sticky with `bg-background/80 backdrop-blur-md`. Border appears on scroll.

### Hero Section
Full-width image (`h-[70vh]` mobile, `md:h-[85vh]` desktop) with gradient overlay. Headline in DM Serif, CTA button.

### Product Cards
`aspect-[4/5]` image, `rounded-lg`, `scale-[1.02]` hover. Shows: brand (uppercase), name, price. No add-to-cart button on card. "Sold out" badge in muted gray.

### Cart Drawer
Slide-out from right. Minimal: item list with quantity controls, subtotal, full-width checkout button. No auto-open — uses toast on add-to-cart.

### Testimonials
2-row marquee animation (no middle row). Top row: right-to-left. Bottom row: left-to-right, faster.

### Footer
3-column: Kategori (Pria/Wanita/Unisex), Bantuan (FAQ/Pengiriman/Pengembalian), Hubungi (WhatsApp/Telegram/Email).

### Admin Shell
Desktop sidebar: 9 items (Dashboard, Products, Orders, Wars, Banners, Blog, Reviews, Payments, Settings). Mobile: slide-out menu.

## Animations

CSS animations only — no framer-motion:
- `animate-marquee` — horizontal scroll (30s)
- `animate-marquee-reverse` — reverse scroll
- `animate-fade-in-up` — scroll reveal via IntersectionObserver

## CSS Tokens (globals.css)

```css
@theme {
  --color-background: #0C0C0C;
  --color-foreground: #FAFAFA;
  --color-accent: #C43A31;
  --color-border: #252525;
  --radius: 0.5rem;
}
```

---

*See also: [[PROJECT_OVERVIEW]]*

---

*Back to [[00-index]]*
