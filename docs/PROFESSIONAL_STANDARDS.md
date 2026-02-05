# Al-Ameen Caps – Professional Standards

Suggestions to keep the brand and operations professional and trustworthy.

---

## 1. Website & UX

- **Consistent tone** – Calm, respectful, premium. No hype or aggressive CTAs.
- **Clear navigation** – Home, Shop, About, Cart, Checkout. No dead links.
- **Mobile-first** – Test checkout and forms on phone; ensure buttons and text are readable.
- **Loading states** – Show “Loading…” or skeletons so users never see a blank screen.
- **Error handling** – Friendly messages for empty cart, payment cancelled, or connection issues (e.g. Success/Cancel pages).

---

## 2. Trust & Legal

- **Privacy policy** – Short page or doc: what you collect (name, email, phone, address), why (order fulfilment, contact), how long you keep it, and that you don’t sell data. Link in footer.
- **Terms of sale** – Refunds/returns, delivery expectations, payment (PayFast), and that placing an order means acceptance. Link in footer.
- **Contact** – One clear channel (e.g. email or contact form). Show on About and in footer so customers can reach you.
- **Secure checkout** – Keep using PayFast; don’t ask for card details on your site. Mention “Secure payment via PayFast” near the Pay button.

---

## 3. Content & Copy

- **Product descriptions** – Accurate, concise. Material, care, sizing if relevant.
- **About page** – Keep mission and “Our Promise” clear and honest.
- **No typos** – Quick pass on headings, buttons, and footer. Fix grammar and spelling.
- **Pricing** – Show prices clearly (e.g. “R 299”); mention if VAT is included where applicable.

---

## 4. Operations

- **Order confirmation** – After PayFast success, consider emailing a simple “Order received” (e.g. via Netlify function or later Supabase + email service).
- **Shipping** – Set expectations (e.g. “Dispatch within 1–2 business days”; “Delivery 3–5 days”). Add a short Shipping/FAQ section or link when you use Fastway.
- **Support** – Reply to queries in a set time (e.g. within 24–48 hours) and keep replies polite and clear.
- **Inventory** – Keep Supabase (or your source of truth) in sync so you don’t oversell.

---

## 5. Brand & Design

- **Colours** – Stick to Gold (#D4AF37), Black, White. No extra accent colours unless intentional.
- **Typography** – Serif for headings, sans-serif for body. Don’t mix too many fonts.
- **Imagery** – High-quality product photos; consistent style. No low-res or off-brand stock images.
- **Logo** – Use one main logo (e.g. gold crown) everywhere; same treatment in navbar and footer.

---

## 6. Technical & Security

- **Env vars** – Never commit `.env`. Use `.env.example` with placeholders only.
- **HTTPS** – Always in production (Netlify provides this).
- **Dependencies** – Run `npm audit` occasionally; update critical issues.
- **Backups** – If you store orders in Supabase, use Supabase backups or export important data periodically.

---

## 7. Documentation (this repo)

- **README** – Up to date with stack, env vars, and how to run the project.
- **docs/** – Keep Fastway, marketing, and this standards doc organised. Add Privacy/Terms here when you write them.

---

*Short version: be clear, consistent, and honest; protect customer data; set expectations on delivery and support; keep the site fast and error-free.*
