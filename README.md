# Al-Ameen Caps — Premium E-Commerce

A high-end, single-page e-commerce app for **Al-Ameen Caps**, selling premium handcrafted Islamic headwear. *Spirituality meets luxury.*

## Tech Stack

- **React (Vite)** — JavaScript
- **Tailwind CSS** — Gold/Black/White design system
- **Framer Motion** — Animations (ready for Phase 2)
- **React Router DOM** — Routing
- **React Context** — Cart state + `localStorage` persistence
- **Supabase** — Products (Postgres)
- **PayFast** — HTML form redirect payment (Phase 4)
- **Netlify** — Hosting

## Design System

| Role      | Color   | Hex       |
|----------|---------|-----------|
| Primary  | Black   | `#000000` |
| Secondary| White   | `#ffffff` |
| Accent   | Gold    | `#D4AF37` |

- **Headings:** Playfair Display (serif)
- **Body:** Inter / Lato (sans-serif)

## Getting Started

```bash
cd al-ameen-caps
npm install
cp .env.example .env
# Edit .env with your Supabase and PayFast keys (when ready)
npm run dev
# Pre-order/reservation: works with `npm run dev` (Vite + @netlify/vite-plugin serves functions). Alternatively: npm run dev:netlify
```

Build for production (e.g. Netlify):

```bash
npm run build
```

## Project Structure

```
src/
  components/   Navbar, Footer, Hero, ProductCard, CartSidebar
  context/      CartContext (addToCart, removeFromCart, clearCart, cartTotal)
  pages/        Home, Shop, ProductDetails, Checkout, Success, Cancel
  lib/          supabase.js
  assets/       Images
```

## Environment Variables

See `.env.example`. Use:

- **Supabase:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` for products.
- **PayFast:** `VITE_PAYFAST_MERCHANT_ID`, `VITE_PAYFAST_MERCHANT_KEY` for checkout.

## Phases

1. **Setup & config** — Done (structure, Tailwind, routes, cart context).
2. **Core UI** — Navbar, Hero, ProductCard in place; Framer Motion next.
3. **Cart** — CartContext with `localStorage` persistence.
4. **Checkout** — Shipping form + PayFast form redirect.
5. **Supabase** — Products from `products` table; fallback to local collection when empty.
