# Al-Ameen Caps E‑commerce — Project Overview for AI (e.g. Gemini)

This document describes the **full makeup of the Al-Ameen Caps e‑commerce site** from scratch: concept, architecture, tech stack, database, backend, frontend, payment flow, and current progress. Use it to get up to date with the project when continuing work or answering questions.

---

## 1. Project identity and goal

- **Name:** Al-Ameen Caps  
- **Tagline / positioning:** “Restoring the Crown of the Believer” — Islamic headwear and related products (caps, taj, rumal, perfumes).  
- **Market:** South Africa (ZAR currency, PayFast, Fastway Couriers).  
- **Concept we are trying to achieve:**  
  A full e‑commerce site where customers can browse products, add to cart, sign in (optional for checkout in current flow), go to PayFast to pay, and have orders recorded in the database. The store owner can manage orders, inventory, and customers via a protected Admin Dashboard. All prices and currency are in **ZAR (South African Rand)**, with **R** as the symbol and **en-ZA** locale.

---

## 2. Tech stack (high level)

| Layer        | Technology |
|-------------|------------|
| Frontend    | React 19, Vite 7, React Router 7, Tailwind CSS, Lucide React, Framer Motion |
| Backend     | Netlify serverless functions (Node/TypeScript) |
| Database    | Supabase (PostgreSQL + Auth + Storage) |
| Payments    | PayFast (South African gateway); sandbox for testing, live for production |
| Hosting     | Netlify (single site: React app + serverless functions) |
| Repo        | GitHub: `taufeeqcv-boop/al-ameen-caps-backend` (monorepo: frontend + backend) |

The “backend” is not a separate URL: it is the **same Netlify site**; serverless functions live under `/.netlify/functions/<name>`.

---

## 3. Repository structure (important paths)

```
al-ameen-caps/
├── .env                    # Local env (not committed); see env.backend.example
├── env.backend.example     # Backend env template for Netlify / reference
├── netlify.toml            # Netlify build + publish + functions config
├── package.json            # Scripts: dev, build, dev:netlify
├── index.html
├── public/                 # Static assets, collection images, favicon, sitemap
│   └── collection/         # Product images (e.g. nalain-cap.png)
├── src/
│   ├── main.jsx
│   ├── App.jsx             # Routes: public + /admin/* + /login
│   ├── components/         # Navbar, Footer, CartSidebar, AdminLayout, AdminRoute, etc.
│   ├── context/            # AuthContext, CartContext
│   ├── lib/                # supabase.js (client), format.js (formatPrice ZAR), seo.js
│   ├── pages/              # Home, Shop, ProductDetails, Checkout, Success, Cancel, Login, etc.
│   │   └── admin/          # Dashboard, Orders, Products (Inventory), Customers
│   ├── data/               # collection.js (fallback product list when no Supabase products)
│   ├── types/              # payfast.ts (PayFastInit), supabase.js, payfast.js
│   └── utils/              # payfast-crypto.ts (generateSignature), payfast.js
├── netlify/functions/      # Serverless API
│   ├── initiate-payment.ts # POST: get order from DB, build PayFast payload, return payload + signature
│   ├── itn-listener.ts     # POST: PayFast ITN; validate signature, set order PAID, decrement stock
│   ├── send-email.js       # Placeholder
│   ├── reservation.js      # Legacy/form reservation (CommonJS)
│   └── lib/
│       └── supabaseAdmin.ts # Supabase client with SERVICE_ROLE_KEY (bypasses RLS)
├── supabase/
│   ├── schema.sql          # Full schema: profiles, products, orders, order_items, RLS, trigger
│   └── migrations/
│       └── 20250208_admin_dashboard.sql  # is_admin, storage bucket, admin RLS, image_url, created_at
├── docs/                   # This file + other strategy/setup docs
└── scripts/
    └── generate-sitemap.js
```

---

## 4. Database (Supabase)

### 4.1 Core schema (see `supabase/schema.sql`)

- **profiles**  
  One row per user; extends `auth.users`.  
  Columns: `id` (uuid, PK, FK → auth.users), `first_name`, `last_name`, `phone`, `shipping_address` (jsonb), `billing_address` (jsonb).  
  After migration: **`is_admin`** (boolean, default false).

- **products**  
  Catalog.  
  Columns: `id` (bigint identity), `sku` (text unique), `name`, `description`, `price` (numeric 10,2), `stock_quantity` (int), `metadata` (jsonb), `is_active` (boolean default true).  
  After migration: **`image_url`** (text, optional), for admin-uploaded images.

- **orders**  
  One row per order.  
  Columns: `id` (uuid default gen_random_uuid()), `user_id` (FK → profiles), `status` (text default 'PENDING'; e.g. PAID, SHIPPED, CANCELLED), `total_amount` (numeric 10,2), `payfast_pf_payment_id` (text unique), `shipping_data` (jsonb).  
  After migration: **`created_at`** (timestamptz default now()).

- **order_items**  
  Line items; snapshot of product at order time.  
  Columns: `id`, `order_id` (FK → orders), `product_id` (FK → products), `quantity`, `unit_price`, `product_name`.

A trigger **on_auth_user_created** inserts a row into **profiles** when a user signs up (using auth.users.raw_user_meta_data for first/last name).

### 4.2 RLS (row-level security)

- **products:** SELECT for everyone (anon + authenticated).  
- **orders:** SELECT and INSERT for authenticated users, restricted to own `user_id`.  
- **order_items:** SELECT and INSERT for authenticated users, only for orders where `orders.user_id = auth.uid()`.  
- **profiles:** SELECT and UPDATE for authenticated users, restricted to own `id`.

Migration **20250208_admin_dashboard.sql** adds:

- **is_admin** on profiles; helper **public.is_admin()** (security definer).  
- Policies so users with **is_admin = true** can SELECT/UPDATE/DELETE on **orders**, **order_items**, **profiles**, and **products** (and INSERT on products).  
- Storage bucket **products** (public read; admins can upload/update/delete).  
- **image_url** on products, **created_at** on orders.

Admins are identified only by **profiles.is_admin**; there is no separate “backend admin login” — the same Supabase Auth user logs in via the app’s `/login` page.

---

## 5. Backend (Netlify serverless functions)

All run on the same Netlify site; base URL is the site URL (e.g. `https://al-ameen-caps-backend.netlify.app`).

### 5.1 `initiate-payment` (TypeScript)

- **Path:** `POST /.netlify/functions/initiate-payment`
- **Purpose:** Securely prepare a PayFast payment for an existing order (no trust of client-supplied amount).
- **Input:** JSON body with **`order_id`** (uuid).
- **Logic:**  
  - Use **supabaseAdmin** (SERVICE_ROLE_KEY) to fetch the order; ensure status is **PENDING**.  
  - Get user email via **auth.admin.getUserById(order.user_id)**.  
  - Build PayFast payload: merchant_id, merchant_key, return_url, cancel_url, notify_url, email_address, **m_payment_id** = order id, **amount** from DB, item_name = "Order #&lt;id&gt;".  
  - Sign with **generateSignature(payload, PAYFAST_PASSPHRASE)** from `src/utils/payfast-crypto.ts`.  
- **Response:** 200 JSON **{ payload, signature }**.  
- **Errors:** 400 (missing/invalid order_id), 404 (order not found), 500 (config/server).

### 5.2 `itn-listener` (TypeScript)

- **Path:** `POST /.netlify/functions/itn-listener`
- **Purpose:** PayFast Instant Transaction Notification (ITN) webhook: confirm payment and update app state.
- **Input:** Body is **application/x-www-form-urlencoded** (PayFast POST).
- **Logic:**  
  - Parse body (e.g. URLSearchParams).  
  - Recompute signature (exclude `signature` param; use rest + passphrase); **if mismatch → 400**.  
  - If **payment_status !== 'COMPLETE'** → 200 (ack only).  
  - Load order by **m_payment_id**; verify **amount_gross** matches **order.total_amount**.  
  - Update **orders** set **status = 'PAID'**, **payfast_pf_payment_id** = PayFast’s pf_payment_id.  
  - Optionally decrement **products.stock_quantity** for each **order_items** row.  
- **Response:** Always **200** with empty body after processing (so PayFast stops retrying).

### 5.3 `send-email` (placeholder)

- **Path:** `/.netlify/functions/send-email`
- **Status:** Stub; can be used later for order confirmation or other emails.

### 5.4 `reservation.js`

- **Path:** `/.netlify/functions/reservation`
- **Purpose:** Handles reservation/contact form (nodemailer, etc.).  
- **Note:** CommonJS (`exports.handler`); rest of project is ESM. May show a warning in Netlify dev.

### 5.5 Shared backend lib

- **netlify/functions/lib/supabaseAdmin.ts**  
  Creates Supabase client with **SUPABASE_URL** and **SUPABASE_SERVICE_ROLE_KEY** (env vars). Used by **initiate-payment** and **itn-listener** to bypass RLS and access orders/products/auth.admin.

---

## 6. Auth and admin access

- **Auth provider:** Supabase Auth.  
- **Login page:** **`/login`** (email + password). Uses **supabase.auth.signInWithPassword**.  
- **After login:** App fetches **profiles** for **auth.uid()** and checks **is_admin**:  
  - If **is_admin === true** → redirect to **/admin/dashboard**.  
  - Else → redirect to **/** and show message that the account does not have admin access.  
- **Admin routes:** Under **/admin** (e.g. /admin/dashboard, /admin/orders, /admin/products, /admin/customers).  
- **Protection:** **AdminRoute** wraps admin layout: ensures user is signed in and **profiles.is_admin === true**; otherwise redirects to /login or /.  
- **Admin dashboard:** Sidebar layout (AdminLayout) with: Dashboard (revenue, pending orders, low stock), Orders (table, status change, refund/cancel + restock), Inventory/Products (table, add/edit product, image upload to Storage), Customers (profiles table).  
- **Manager login:** There is no separate “backend” or “Netlify” admin login. The **same Supabase Auth user** that has **profiles.is_admin = true** logs in at **https://&lt;site&gt;/login**. Credentials are the email/password set in Supabase Dashboard → Authentication → Users. If “Sign-in is not configured” or “No API key found”, the frontend env vars **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** must be set in Netlify and the site **redeployed**.

---

## 7. Frontend (React) — main flows

- **Store:** Shop page lists products (from Supabase if available, else **data/collection.js**). ProductCard shows price via **formatPrice** (ZAR). Cart in context + CartSidebar; cart persisted in **localStorage** (key **alameen-caps-cart**).  
- **Checkout:** Checkout page shows cart, delivery fee, total. User can sign in (Google OAuth or email/password). On “Pay with PayFast”: frontend calls **POST /.netlify/functions/initiate-payment** with **{ order_id }** (order must already exist in DB for that user); receives **{ payload, signature }**; then either redirects to PayFast with a form built from payload + signature, or uses PayFast’s URL with query params as per PayFast docs.  
- **Success / Cancel:** After payment, PayFast redirects to **return_url** (e.g. /success) or **cancel_url** (e.g. /cancel). Success page clears cart.  
- **ITN:** PayFast server POSTs to **notify_url** (e.g. **/.netlify/functions/itn-listener**). Only the live Netlify URL is reachable by PayFast (not localhost unless a tunnel is used).  
- **Currency:** All displayed prices use **formatPrice** from **src/lib/format.js**, which uses **Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })** so the symbol is **R** and formatting is South African.

---

## 8. Payment flow (PayFast) — end to end

1. **Create order (client or server):** An **orders** row (and **order_items**) must exist with **status = 'PENDING'** and **user_id** = current user. (In current flow this is assumed to be created before checkout; exact place may be in Checkout or a separate step.)  
2. **Initiate payment:** Frontend POSTs **order_id** to **initiate-payment**. Backend loads order (by id, server-side), checks PENDING, builds PayFast payload with **amount** from DB, signs with **generateSignature(data, passphrase)**.  
3. **Redirect to PayFast:** Frontend sends user to PayFast with payload + signature (form POST or URL params).  
4. **Customer pays (or cancels)** on PayFast.  
5. **PayFast redirects** to return_url or cancel_url.  
6. **PayFast ITN:** PayFast POSTs to **notify_url** (itn-listener). Backend validates signature, checks payment_status and amount, updates order to PAID and optionally decrements stock.  
7. **Order visible in Admin:** Under **/admin/orders**, status PAID and payfast_pf_payment_id stored.

**Signature (payfast-crypto):** Filter out empty/null values, sort keys, build `key=value&...`, append `&passphrase=<encoded>`, MD5 hex. Used both when creating the redirect (initiate-payment) and when validating ITN (itn-listener).

---

## 9. Environment variables

- **Frontend (Vite, must be prefixed VITE_):**  
  **VITE_SUPABASE_URL**, **VITE_SUPABASE_ANON_KEY** (required for login and Supabase client).  
  **VITE_SITE_URL** (optional; used for PayFast redirects and links; e.g. Netlify site URL).  
  **VITE_PAYFAST_SANDBOX**, **VITE_PAYFAST_MERCHANT_ID**, **VITE_PAYFAST_MERCHANT_KEY** if used by frontend for PayFast config.

- **Backend (Netlify / serverless):**  
  **SUPABASE_URL**, **SUPABASE_SERVICE_ROLE_KEY** (for supabaseAdmin).  
  **PAYFAST_MERCHANT_ID**, **PAYFAST_MERCHANT_KEY**, **PAYFAST_PASSPHRASE**.  
  **VITE_SITE_URL** or **URL** (Netlify sets URL automatically; used for return/cancel/notify URLs if needed).

See **env.backend.example** in the repo.  
**Important:** For the deployed site, **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** must be set in **Netlify** and a **new deploy** triggered so the build includes them; otherwise the frontend shows “Sign-in is not configured” or Supabase returns “No API key found in request”.

---

## 10. Deployment and repo

- **GitHub:** **taufeeqcv-boop/al-ameen-caps-backend** (main branch).  
- **Netlify:** Site linked to that repo; build command **npm run build**, publish directory **dist**.  
- **Functions:** Served from **netlify/functions** (initiate-payment, itn-listener, send-email, reservation).  
- **Local dev:** **npm run dev** (Vite only) or **npm run dev:netlify** (Netlify Dev: Vite + functions).  
- **Supabase:** Project ref **nvzmesnuxczmafjunbob** (project URL **https://nvzmesnuxczmafjunbob.supabase.co**).  
- **PayFast:** Sandbox credentials (e.g. merchant 10000100) for testing; swap to live merchant ID and keys for production.

---

## 11. Current state and progress (as of this doc)

- **Done:**  
  - Full schema + RLS + admin migration (is_admin, storage, admin RLS).  
  - Initiate-payment and itn-listener implemented and deployed.  
  - Admin Dashboard (Dashboard, Orders, Products, Customers) and AdminRoute/AdminLayout.  
  - Login page (email/password) with admin vs customer redirect and clear error messages.  
  - Currency: formatPrice(en-ZA, ZAR, R) used across Store, Cart, Checkout, Admin.  
  - Cart persistence (localStorage), Checkout flow calling initiate-payment, Success/Cancel pages.  
  - Env templates (env.backend.example) and docs.

- **Known issues / notes:**  
  - Admin login on production requires **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** set in Netlify and site redeployed; otherwise “Sign-in is not configured” or “No API key found”.  
  - **VITE_SITE_URL** should be set to the Netlify site URL (e.g. for redirects and PayFast).  
  - reservation.js is CommonJS; may show a warning in Netlify dev.  
  - Order creation (insert into orders + order_items) before calling initiate-payment may live in Checkout or a separate API; the backend expects an existing order_id.

- **Possible next steps:**  
  - Ensure order creation flow (when and where orders/order_items are inserted) is documented and consistent.  
  - Implement or wire **send-email** for order confirmation after ITN.  
  - Custom domain (e.g. alameencaps.co.za) on Netlify.  
  - Switch PayFast from sandbox to live when going live.

---

## 12. How to use this doc (for Gemini or other AIs)

- Use it as the **single source of truth** for project makeup, concept, and progress.  
- When changing schema, backend, or auth, update this doc.  
- When debugging “login not working”, “No API key”, “Failed to fetch”, or “admin redirect”, refer to **§6** and **§9**.  
- When working on payments or ITN, refer to **§5** and **§8**.  
- When adding pages or features, follow **§3** and **§7** for structure and existing patterns.
