# Heritage Image Branding — Edge Function

The **process-heritage-image** Supabase Edge Function automatically adds the Al-Ameen Emerald Star logo to all four corners of images uploaded to the `heritage-majlis` storage bucket. No change is required in the frontend; uploads are branded in place.

## Prerequisites

1. **Logo asset:** A transparent PNG of the Al-Ameen Emerald Star logo at a **public URL**.
   - Example: upload to your site as `/static/al-ameen-star-emerald.png` (e.g. in `public/static/` so it’s served at `https://alameencaps.com/static/al-ameen-star-emerald.png`).
   - Or upload to a Supabase Storage bucket (e.g. `public`) and use the object’s public URL.

2. **Edge Function env (Supabase Dashboard → Edge Functions → process-heritage-image → Settings):**
   - **LOGO_URL** (required): Full URL to the logo PNG, e.g. `https://alameencaps.com/static/al-ameen-star-emerald.png`.
   - **HERITAGE_BUCKET** (optional): Bucket to process. Default: `heritage-majlis`.

## Behaviour

- **Trigger:** Database Webhook on **storage.objects** (see below).
- **Filter:** Only runs when the new object is in the `heritage-majlis` bucket (or the one set in `HERITAGE_BUCKET`).
- **Processing:** Fetches the uploaded image and the logo, scales the logo to 10% of the image width (aspect ratio kept), composites it at all four corners with 20px padding, encodes as high-quality JPEG (92%), **injects a JPEG COM (comment) segment** with copyright and keywords (SEO metadata travels with the file), and **overwrites the same path** in the bucket (upsert).
- **Metadata injected:** Credit: *"Digital Archive of Al-Ameen Caps - Preserving the Legacy of Tuan Guru through the Taliep & Rakiep lineages—from Imam Talaboedien to Asia Taliep."* Keywords: *Tuan Guru, Imam Talaboedien, District Six, Bridgetown, Taliep Family, Rakiep Family, Auwal Masjid.*
- **Result:** The same URL now serves the branded, metadata-rich JPEG. The frontend and `heritage_majlis.image_url` do not need to change.

## Storage Webhook Setup

Supabase does not offer “Storage Webhooks” as a separate product; you use a **Database Webhook** on the table that backs Storage.

1. In **Supabase Dashboard** → **Database** → **Webhooks** → **Create a new webhook**.
2. **Name:** e.g. `Heritage image branding`.
3. **Table:** Under **storage** schema, select **objects** (the table that backs Storage).
4. **Events:** tick **Insert** only.
5. **Type:** HTTP Request.
6. **Method:** POST.
7. **URL:**  
   `https://<PROJECT_REF>.supabase.co/functions/v1/process-heritage-image`  
   Replace `<PROJECT_REF>` with your project reference (Dashboard → Settings → General).
8. **HTTP Headers (optional):**  
   If you protect the function with a secret, add e.g. `Authorization: Bearer <YOUR_ANON_OR_SERVICE_ROLE_KEY>` or a custom header your function validates.
9. Save.

Because the webhook is on **all** of `storage.objects`, the function **must** ignore events from other buckets by checking `record.bucket_id === HERITAGE_BUCKET` (default `heritage-majlis`). The code already does this.

## Deploying the Function

From the project root (with [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked):

```bash
supabase functions deploy process-heritage-image
```

Set secrets (e.g. LOGO_URL) in Dashboard → Edge Functions → process-heritage-image → Settings, or via CLI:

```bash
supabase secrets set LOGO_URL=https://alameencaps.com/static/al-ameen-star-emerald.png
```

## Logo Asset

- **Format:** Transparent PNG.
- **Suggested size:** At least 200–400px on the longer side so it scales cleanly to 10% of large scans.
- **Placement:** The function places the logo at top-left, top-right, bottom-left, and bottom-right with 20px padding. Logo width is 10% of the image width; height is proportional.

## Limits and Errors

- Edge Functions have [resource limits](https://supabase.com/docs/guides/functions/limits). Very large images (e.g. >5MB) may hit memory or time limits; consider resizing or compressing before upload if needed.
- If branding fails, the function returns 500 and the **original file is left unchanged** (we only overwrite after successful processing). Check Edge Function logs in the Dashboard.

## Frontend and SEO

- **Upload flow:** No change. The Majlis form uploads to `heritage-majlis`; the webhook runs after the object is inserted, and the same path is overwritten with the branded JPEG. The `image_url` stored in `heritage_majlis` continues to point to that path and will serve the branded image once the function has run.
- **Alt text:** The `heritage_majlis` table has a `seo_alt_text` column, auto-filled when a post is approved (migration `20250230_heritage_majlis_seo_alt_text.sql`). The Majlis Wall uses `seo_alt_text` for each `<img alt="...">` when present, improving accessibility and SEO.
- **Social sharing:** The Heritage page sets `og:image` (and Twitter card image) to the first approved majlis image URL when available, so shares use a branded, metadata-rich image.
