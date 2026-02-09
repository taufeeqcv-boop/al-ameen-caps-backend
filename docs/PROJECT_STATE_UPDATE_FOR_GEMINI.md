# Project State Update for Gemini (Sync with Cursor)

**Date:** Current state as of codebase scan.  
**Purpose:** Align Gemini’s view with Cursor’s live codebase: DB schema, Netlify functions, Admin UI, reservations, and env/errors.

---

## 1. Codebase scan (docs/PROJECT_OVERVIEW_FOR_AI.md)

- **Location:** `docs/PROJECT_OVERVIEW_FOR_AI.md`
- **Status:** Up to date. It describes:
  - Project identity (Al-Ameen Caps, ZAR, PayFast, South Africa)
  - Tech stack (React, Vite, Netlify, Supabase, PayFast)
  - Repo structure, DB schema, RLS, admin migration
  - Netlify functions (initiate-payment, itn-listener, send-email, reservation)
  - Auth/admin (Supabase Auth, is_admin, /login, AdminRoute)
  - Payment flow (order → initiate-payment → PayFast → ITN → PAID)
  - Env vars (VITE_* for frontend, backend vars for Netlify)
  - Current state and known issues

**Note for Gemini:** `initiate-payment` is implemented in **TypeScript**: `netlify/functions/initiate-payment.ts` (not `.js`). The overview doc is correct; the filename is `.ts`.

---

## 2. Database schema verification

**Sources:** `supabase/schema.sql` and `supabase/migrations/20250208_admin_dashboard.sql`.

### Tables that exist

| Table         | Purpose |
|---------------|--------|
| **profiles** | One row per auth user. Columns: id (uuid, FK auth.users), first_name, last_name, phone, shipping_address (jsonb), billing_address (jsonb). After migration: **is_admin** (boolean, default false). |
| **products** | Catalog. id (bigint), sku (unique), name, description, price, stock_quantity, metadata, is_active. After migration: **image_url** (text). |
| **orders**   | One per order. id (uuid), user_id (FK profiles), status (e.g. PENDING, PAID, SHIPPED, CANCELLED), total_amount, payfast_pf_payment_id, shipping_data (jsonb). After migration: **created_at** (timestamptz). |
| **order_items** | Line items per order. order_id (FK orders), product_id (FK products), quantity, unit_price, product_name (snapshot). |

### Tables that do **not** exist

- **reservations** — There is **no `reservations` table** in the schema or in any migration. The reservation flow does not use the database.

### RLS and admin

- Base RLS: products (read all), orders/order_items/profiles (own rows only for authenticated users).
- Migration adds: **public.is_admin()** and policies so users with **profiles.is_admin = true** can SELECT/UPDATE/DELETE on orders, order_items, profiles, products (and INSERT on products). Storage bucket **products** with public read and admin write.

---

## 3. Netlify functions

### 3.1 `reservation.js` (CommonJS)

- **Path:** `netlify/functions/reservation.js`
- **Behavior:** Receives **POST** with JSON body: **{ formData, cart, total }**. Does **not** touch the database. Sends two emails via nodemailer:
  1. To admin (ADMIN_EMAIL / RESERVATION_EMAIL): “NEW RESERVATION” with customer details and cart.
  2. To customer (formData.email_address): “Reservation Confirmed” with items and next steps.
- **Env used:** ADMIN_EMAIL or RESERVATION_EMAIL, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.
- **Note:** Uses `exports.handler` (CommonJS). In a `"type": "module"` repo this can trigger a Netlify/Vite warning; functionally it still runs.

### 3.2 `initiate-payment.ts` (TypeScript)

- **Path:** `netlify/functions/initiate-payment.ts` (not `.js`).
- **Behavior:** POST with JSON **{ order_id }**. Uses **supabaseAdmin** to fetch the order (must be PENDING), get user email via auth.admin, build PayFast payload (amount from DB), sign with **generateSignature** from `src/utils/payfast-crypto.ts`, return **{ payload, signature }**.
- **Env used:** SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYFAST_*, VITE_SITE_URL or URL.

Other functions: **itn-listener.ts** (PayFast ITN → set PAID, decrement stock), **send-email.js** (placeholder).

---

## 4. Missing links: reservations

### 4.1 Does a reservations table exist?

- **No.** There is no **reservations** table (or any reservation-related table) in:
  - `supabase/schema.sql`
  - `supabase/migrations/20250208_admin_dashboard.sql`
  - Any other file under `supabase/`.

### 4.2 Does Admin Dashboard show reservations?

- **No.** `src/pages/admin/Dashboard.jsx` shows:
  - Total Revenue (sum of PAID orders)
  - Pending Orders count (link to /admin/orders?status=PENDING)
  - Low Stock Alerts (products with stock < 5) and a table with Edit links
- There is **no** “Reservations” section, no reservations table view, and no admin route for reservations. The sidebar in `AdminLayout.jsx` has: **Dashboard, Orders, Inventory (Products), Customers** — no Reservations.

### 4.3 How reservations work today

- **Frontend:** `src/pages/Checkout.jsx` can call `POST /.netlify/functions/reservation` with `{ formData, cart, total }` (e.g. when e‑commerce is disabled or as a fallback).
- **Backend:** `reservation.js` only sends emails; it does **not** persist to any database.
- **Gap:** If you want to “view reservations” in Admin, you need: (1) a **reservations** table in Supabase, (2) the reservation function (or a new one) to **insert** into that table, and (3) a new Admin page (e.g. **/admin/reservations**) and a Dashboard widget or sidebar link to list them.

---

## 5. Summary: Admin UI state

| Area | Status |
|------|--------|
| **Admin access** | Protected by AdminRoute; requires Supabase Auth user with **profiles.is_admin = true**. Login at **/login** (email/password). |
| **Dashboard** (/admin/dashboard) | Total Revenue (PAID), Pending Orders count, Low Stock (count + table with Edit). No reservations. |
| **Orders** (/admin/orders) | Table: date, customer, total, status, actions (change status, Refund/Cancel with restock). |
| **Inventory** (/admin/products) | Table: image, name, price, stock, Edit. Add/Edit product modal with image upload (Supabase Storage `products` bucket). |
| **Customers** (/admin/customers) | Table of profiles: name, phone, shipping/billing (jsonb). |
| **Reservations in Admin** | Not implemented. No DB table, no admin view. |

---

## 6. Environment variables and errors

### 6.1 “Sign-in is not configured”

- **Cause:** Frontend Supabase client is null because **VITE_SUPABASE_URL** or **VITE_SUPABASE_ANON_KEY** is missing (or not available at build time) in the environment where the app is built (e.g. Netlify).
- **Fix:** In Netlify, set **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** (exact names, anon key from Supabase API settings), then **trigger a new deploy** so the build inlines them.
- **User report:** Taufeeq has confirmed admin login works after fixing this.

### 6.2 “No API key found in request”

- **Cause:** Requests to Supabase are sent without the anon key — usually because **VITE_SUPABASE_ANON_KEY** was not set or was wrong/empty in Netlify at build time.
- **Fix:** Set **VITE_SUPABASE_ANON_KEY** correctly in Netlify and redeploy.

### 6.3 “Failed to fetch”

- Can be: Supabase project paused, wrong Supabase URL, or Site URL / Redirect URLs not set for the Netlify domain in Supabase Authentication. Ensure project is active and URL config includes the live site URL.

### 6.4 Other env vars referenced

- **Frontend (VITE_*):** VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (required for login); VITE_SITE_URL (PayFast redirects); VITE_DELIVERY_FEE, VITE_ENABLE_ECOMMERCE, VITE_PAYFAST_* (Checkout); VITE_CONTACT_* (Contact).
- **Backend (Netlify):** SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY, PAYFAST_PASSPHRASE, VITE_SITE_URL or URL; for reservation emails: ADMIN_EMAIL, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.

### 6.5 Terminal / build warnings

- **reservation.js:** “The CommonJS `exports` variable is treated as a global…” in ESM package. Comes from `exports.handler` in a repo with `"type": "module"`. Fix options: convert reservation to ESM (`export const handler`) or rename to `reservation.cjs`. Function still runs on Netlify.

---

## 7. What Gemini can do next (alignment with Cursor)

1. **Reservations in DB + Admin:**  
   - Add a **reservations** table (e.g. id, created_at, form_data jsonb, cart jsonb, total numeric, email, status).  
   - Update **reservation.js** (or a new function) to **insert** into `reservations` before/after sending emails.  
   - Add **/admin/reservations** page and a “Reservations” item in AdminLayout; optionally a small “Recent reservations” block on Dashboard.

2. **Env / “Sign-in is not configured”:**  
   - Cross-check Netlify env with **env.backend.example** and ensure **VITE_SUPABASE_URL** and **VITE_SUPABASE_ANON_KEY** are set and a new deploy is run after changes.

3. **reservation.js ESM warning:**  
   - If desired, Cursor can refactor `reservation.js` to ESM (`export const handler`) or move it to `reservation.cjs` and keep CommonJS.

This document can be copied and pasted to Gemini so it has the same view as Cursor’s live codebase and can suggest concrete SQL/React/Netlify changes.
