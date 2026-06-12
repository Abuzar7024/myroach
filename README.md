# NOIRÉ — Premium Fashion E-Commerce

A luxury fashion e-commerce platform built with Next.js 15+, inspired by split-screen editorial layouts while maintaining a unique brand identity.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — minimal luxury design system
- **Framer Motion** — elegant scroll and hero transitions
- **Firebase** — Auth, Firestore, Storage (optional, works with mock data)
- **Zustand** — cart & wishlist state
- **Radix UI + shadcn-style components**
- **Embla Carousel** — featured collections slider

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add Firebase credentials to .env.local (optional for demo mode)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Design Principles

- **Split-screen hero** with smooth crossfade transitions and featured product strip
- **Strong visual hierarchy** — Cormorant Garamond display + Inter body
- **Large editorial lifestyle imagery** via optimized Unsplash assets
- **Whitespace-first minimalism** — warm ivory palette, bronze accents
- **Immersive scroll sections** with Framer Motion fade-in animations
- **Performance-conscious animations** with `prefers-reduced-motion` support

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — split hero, collections, products, story, testimonials |
| `/shop` | Product grid with filters, search, sort, quick view |
| `/product/[slug]` | Product detail with gallery, variants, reviews |
| `/cart` | Cart with coupons and shipping |
| `/checkout` | Checkout flow with success/failure states |
| `/login`, `/register`, `/forgot-password` | Firebase auth (demo mode without config) |
| `/account/*` | Profile, orders, wishlist, addresses |
| `/about` | Brand story, timeline, team |
| `/contact` | Contact form, store info, FAQ |
| `/admin/*` | Admin dashboard with CRUD views |

## Firebase Setup

The app works without Firebase (mock data). For live data, follow **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**.

Quick summary:

1. **Enable Firestore API** in Google Cloud Console (required before any Firestore calls work)
2. Create Firestore database in Firebase Console (production mode)
3. Copy `NEXT_PUBLIC_FIREBASE_*` credentials to `.env.local`
4. Deploy rules: `firebase deploy --only firestore:rules,storage`
5. Enable Auth providers (Email, Google, Phone) and authorized domains
6. Seed catalog data: `npm run seed`
7. Set `role: "admin"` on your user doc in Firestore

Rules: `firebase/firestore.rules` · Storage: `firebase/storage.rules` · Config: `firebase.json`

## Implementation Plan

### Phase 1 — Foundation ✅
- Project scaffold, design tokens, typography
- Core UI components and layout shell
- Mock data and TypeScript models

### Phase 2 — Storefront ✅
- Split-screen hero and home sections
- Shop with filters and quick view
- Product detail, cart, checkout

### Phase 3 — User Features ✅
- Auth pages with Firebase integration
- Account management pages
- Cart/wishlist persistence (Zustand)

### Phase 4 — Admin ✅
- Dashboard with analytics overview
- Product, category, order, coupon, banner, inventory views

### Phase 5 — Production (Next Steps)
- [ ] Connect Firestore for live product/order data
- [ ] Stripe payment integration
- [ ] Admin CRUD with Firebase Storage uploads
- [ ] Role-based admin route protection
- [ ] Email notifications (order confirmations)
- [ ] SEO sitemap and structured data
- [ ] E2E tests with Playwright

## Coupon Codes (Demo)

- `WELCOME15` — 15% off orders over $100
- `FREESHIP` — $12 shipping discount on orders over $200

## License

Private — All rights reserved.
