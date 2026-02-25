# Heritage Launch — Step-by-Step Guide

Follow these steps in order. Each step is self-contained so you can pause and resume.

---

## Step 1: Run Supabase migrations (in order)

1. Open **Supabase Dashboard** → your project → **SQL Editor**.
2. For each migration below, open the file in your repo, **copy the full contents**, paste into a new SQL Editor tab, and click **Run**. Run them in this exact order.

### 1.1 — Admin post + Tana Baru Spotlight

- **File:** `supabase/migrations/20250235_heritage_majlis_admin_post_tana_baru.sql`
- **What it does:** Adds `is_admin_post`, seeds the “Tana Baru — Resting Place of Tuan Guru” card.
- **Run it.** You should see “Success” and no errors.

### 1.2 — Final heritage seed (names + parent links)

- **File:** `supabase/migrations/20250236_final_heritage_seed.sql`
- **What it does:** Level 3 → Imam Mogamat Talaabodien (Ou Bappa), Level 4 → Imam Achmat (Bappa), Level 0 story, parent_id links, Tuan Guru alt-text trigger.
- **Run it.**

### 1.3 — Lineage verification handover

- **File:** `supabase/migrations/20250237_lineage_verification_handover.sql`
- **What it does:** Root name “Imam Abdullah Kadi Abdus Salaam (Tuan Guru)”, Level 3/4 story refinements, Gadija Rakiep (granddaughter of Imam Abdul Ra’uf), trigger for both root names.
- **Run it.**

### 1.4 — Final Golden Thread verification

- **File:** `supabase/migrations/20250238_final_golden_thread_verification.sql`
- **What it does:** Sovereign Root + Sunan Gunung Jati, Patriarch/Ou Bappa and Bappa/Oemie stories, final names.
- **Run it.**

### 1.5 — Tana Baru Spotlight image path

- **File:** `supabase/migrations/20250239_tana_baru_spotlight_image_url.sql`
- **What it does:** Sets the Tana Baru Spotlight card to use `/images/heritage/tana-baru-spotlight.jpg`.
- **Run it.**

**Check:** In Supabase → **Table Editor** → `heritage_majlis`, you should see a row with `ancestor_name` = “Tana Baru — Resting Place of Tuan Guru” and `is_admin_post` = true, and rows for Imam Mogamat Talaabodien (Ou Bappa), Imam Achmat Talaabodien (Bappa), and Asia Taliep (Oemie).

---

## Step 2: Add the Tana Baru image

1. Locate your **Tana Baru** image (e.g. the grave marker photo you shared).
2. In your project folder, go to:  
   `public/images/heritage/`
3. Save (or copy) the image there with this **exact filename:**  
   `tana-baru-spotlight.jpg`  
   (If you only have a PNG, name it `tana-baru-spotlight.png` and tell your dev so the migration can be updated to use `.png`.)
4. Confirm the file exists at:  
   `public/images/heritage/tana-baru-spotlight.jpg`

**Check:** After deploy, open `https://alameencaps.com/images/heritage/tana-baru-spotlight.jpg` in a browser — the image should load.

---

## Step 3: Deploy to production

1. **Commit and push** your code (including `public/images/heritage/tana-baru-spotlight.jpg`) to your main branch:
   ```bash
   git add .
   git commit -m "Heritage launch: migrations, Tana Baru image, credits"
   git push origin main
   ```
2. If you use **Netlify**, wait for the build to finish (or trigger a deploy from Netlify Dashboard).
3. When the deploy is **Live**, go to:  
   `https://alameencaps.com/heritage`  
   and confirm the page loads and the Wall shows the Tana Baru Spotlight card (with image if the file was added).

---

## Step 4: Verification checks

Do these after the site is live.

### 4.1 — Deep link to Ou Bappa

1. Open:  
   `https://alameencaps.com/heritage#ou-bappa`
2. **Expected:** The page opens and scrolls so the **Imam Mogamat Talaabodien (Ou Bappa)** card is in view (with a bit of space below the nav).  
3. If it doesn’t scroll correctly, the card wrapper has `scroll-mt-24`; if your header is taller, we can increase that value.

### 4.2 — “View the Wall” email link

1. Submit a **test** story from the Heritage form (use a real email you can check).
2. In **Supabase** → **Table Editor** → `heritage_majlis`, find that row and set **is_approved** to **true**.
3. Check the inbox for the **“The Legacy Lives”** email.
4. **Expected:**  
   - Subject mentions the ancestor name.  
   - Body mentions “Imam Mogamat Talaabodien (Ou Bappa)” and “bridge to Bappa (Imam Achmat Talaabodien)”.  
   - The **“View the Wall”** button goes to:  
     `https://alameencaps.com/heritage#ou-bappa`  
   and that link scrolls to the Ou Bappa card (as in 4.1).

### 4.3 — Footer credit

1. Scroll to the **footer** on any page.
2. **Expected:** You see:  
   “Lineage and historical information courtesy of the Tuan Guru Family Tree group (Facebook).”  
   above the copyright line.

### 4.4 — Sovereign Root not on Wall

1. On **Heritage** → **The Wall**, look at the cards.
2. **Expected:** There is **no** card for “Imam Abdullah Kadi Abdus Salaam (Tuan Guru)” or “Tuan Guru” in the grid (the root is excluded). The first lineage card shown is the Tana Baru Spotlight, then Ou Bappa (or similar order).

---

## Step 5: Approval email webhook (Supabase)

So that approving a submission sends “The Legacy Lives” email automatically:

1. In **Supabase Dashboard** go to **Database** → **Webhooks** (or **Integrations** → **Webhooks**).
2. If a webhook for `heritage_majlis` **already exists**:
   - Open it.
   - **Events:** ensure **Update** is selected.
   - **URL:**  
     `https://alameencaps.com/.netlify/functions/send-majlis-thank-you`  
     (or your Netlify function URL if different).
   - Under advanced options, enable **“Send old record”** (or equivalent) so the function can detect approval (false → true).
   - Save.
3. If **no** webhook exists yet:
   - **Create webhook** (or “New webhook”).
   - **Name:** e.g. `heritage_majlis_approval`.
   - **Table:** `heritage_majlis`.
   - **Events:** **Update**.
   - **URL:**  
     `https://alameencaps.com/.netlify/functions/send-majlis-thank-you`
   - **Headers** (if your function expects a secret):  
     `X-Webhook-Secret`: your secret value.
   - Enable **“Send old record”**.
   - Create/Save.

**Check:** Approve another test row and confirm the thank-you email is received.

---

## Step 6: Optional after launch

- **Google Search Console:** Submit `https://alameencaps.com/heritage` for indexing.
- **Admin:** Visit `/admin/majlis`, approve/edit a submission, and confirm the **Spotlight** and **Custodian** labels look correct.
- **More images:** Add other heritage photos under `public/images/heritage/` and link them in copy or future Majlis posts as needed.

---

## Quick reference — migration order

| Order | Migration file |
|-------|-----------------|
| 1 | `20250235_heritage_majlis_admin_post_tana_baru.sql` |
| 2 | `20250236_final_heritage_seed.sql` |
| 3 | `20250237_lineage_verification_handover.sql` |
| 4 | `20250238_final_golden_thread_verification.sql` |
| 5 | `20250239_tana_baru_spotlight_image_url.sql` |

---

If any step fails (e.g. migration error, missing email, wrong link), note the step number and the exact message or behaviour and we can fix it.
