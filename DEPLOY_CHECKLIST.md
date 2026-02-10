# Live deploy checklist — Al-Ameen Caps

**Use this before every deploy when the site is live.** Missing env = broken features for real users.

---

## 1. Netlify → Site → Environment variables

Set these (same Supabase project for all four):

| Variable | Required | Notes |
|----------|----------|--------|
| **SUPABASE_URL** | Yes | e.g. `https://xxxx.supabase.co` — backend (reservation, orders, ITN) |
| **SUPABASE_SERVICE_ROLE_KEY** | Yes | Backend only; never expose in frontend |
| **VITE_SUPABASE_URL** | Yes | **Same value as SUPABASE_URL** — frontend (shop, admin, auth) |
| **VITE_SUPABASE_ANON_KEY** | Yes | **Same project** — frontend |
| **PAYFAST_MERCHANT_ID** | If using PayFast | Live ID when going live (not sandbox 10000100) |
| **PAYFAST_MERCHANT_KEY** | If using PayFast | Live key |
| **PAYFAST_PASSPHRASE** | If using PayFast | Same as in PayFast dashboard |
| **VITE_PAYFAST_SANDBOX** | Optional | `false` for live payments |
| **VITE_PAYFAST_MERCHANT_ID** | If using PayFast | Same as PAYFAST_MERCHANT_ID (frontend needs it) |
| **VITE_PAYFAST_MERCHANT_KEY** | If using PayFast | Same as PAYFAST_MERCHANT_KEY |
| **VITE_PAYFAST_PASSPHRASE** | If using PayFast | Same as PAYFAST_PASSPHRASE |
| **VITE_ENABLE_ECOMMERCE** | Optional | `true` to show Pay Fast / checkout |
| **VITE_SITE_URL** | Optional | e.g. `https://al-ameen-caps.netlify.app` — PayFast return URLs; Netlify sets URL automatically |
| **VITE_IMAGE_BASE_URL** | Optional | If you have two deploys (frontend + backend) and images only work on one: set this on the **frontend** site to the backend URL (e.g. `https://al-ameen-caps-backend.netlify.app`) so product images load from there. Then redeploy frontend. |
| **VITE_DELIVERY_FEE** | Optional | Default 99 (ZAR) |

**Critical:** If Pre-Orders (reservations) save but don’t show in Admin, **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** are from a different project. Set them to the **same** Supabase project as **SUPABASE_URL**, then **redeploy** (build bakes these into the frontend).

---

## 2. Supabase (same project)

- **Auth → URL Configuration:** Add your live site URL (and Netlify deploy preview URL if you use it) to **Redirect URLs**.
- **Database:** Tables `products`, `reservations`, `orders`, `order_items`, `profiles` exist and RLS allows anon read for products, auth for orders/profiles.

---

## 3. After deploy

- Open the live site; confirm Shop loads products (and images).
- If using PayFast: do one test payment (sandbox or small live amount) and confirm redirect to Success and order status updates.
- Submit sitemap in Google Search Console: `https://your-site.netlify.app/sitemap.xml`.

---

## 4. Build (already verified)

- `npm run build` runs: sitemap generation → Vite build → 404 copy. No errors = ready to push.
