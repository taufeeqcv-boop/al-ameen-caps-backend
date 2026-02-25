# Digital Majlis — Thank You Email (Database Webhook)

When you approve a heritage submission in Supabase (`is_approved` set to `true`), an automated "Thank You" email is sent to the contributor's email so they see their story on the wall immediately.

## How it works

1. **Form:** Contributor submits story + **email address** (required). Stored in `heritage_majlis.contributor_email`.
2. **You approve:** In Supabase Table Editor → `heritage_majlis`, set `is_approved = true` for a row.
3. **Webhook:** Supabase Database Webhook fires on UPDATE and POSTs to the Netlify function.
4. **Function:** Only runs when `is_approved` changes from `false` to `true`. Sends one email to `contributor_email` with subject and body below.

## Environment variables (Netlify)

| Variable | Purpose |
|----------|--------|
| `EMAIL_USER` | SMTP login (e.g. Gmail address). Same as other site emails. |
| `EMAIL_PASS` | SMTP password or app password. |
| `MAJLIS_SENDER_EMAIL` | (Optional) From address for thank-you emails. Defaults to `EMAIL_USER` or `taufeeqcv@gmail.com`. |
| `MAJLIS_WEBHOOK_SECRET` | (Recommended) Secret shared with Supabase webhook. Add as header `X-Webhook-Secret` so only Supabase can call the function. |

## Supabase Database Webhook setup

1. In **Supabase Dashboard** → **Database** → **Webhooks** → **Create a new webhook**.
2. **Name:** e.g. `Heritage Majlis — thank you email`.
3. **Table:** `heritage_majlis`.
4. **Events:** tick **Update** only.
5. **Type:** HTTP Request.
6. **Method:** POST.
7. **URL:** `https://alameencaps.com/.netlify/functions/send-majlis-thank-you`  
   (or your Netlify site URL + `/.netlify/functions/send-majlis-thank-you`).
8. **HTTP Headers:**  
   - Name: `X-Webhook-Secret`  
   - Value: (same value as `MAJLIS_WEBHOOK_SECRET` in Netlify)
9. Save.

Supabase will send a JSON body like:

```json
{
  "type": "UPDATE",
  "table": "heritage_majlis",
  "schema": "public",
  "record": { "id": "...", "contributor_email": "...", "is_approved": true, ... },
  "old_record": { "id": "...", "is_approved": false, ... }
}
```

The function only sends email when `old_record.is_approved === false` and `record.is_approved === true`.

## Email content

- **Subject:** `Your contribution to the Al-Ameen Heritage Archive: [Ancestor Name]`
- **Body:** Community Archive template with:
  - Contributor name, ancestor name
  - Mention of Imam Talaboedien, District Six, Bridgetown (entity-rich for brand/SEO)
  - Link to `/heritage` (Digital Majlis)
  - Signed by Taufeeq Essop, Founder

## Pre-launch test (Thursday)

1. Run the migration that adds `contributor_email` to `heritage_majlis` (if not already run).
2. Submit a test story from the Heritage form (use your own email).
3. In Supabase → Table Editor → `heritage_majlis`, set `is_approved = true` for that row.
4. Check your inbox for the thank-you email.
5. If no email: check Netlify function logs and that the webhook URL and secret match.

## Local testing

With `netlify dev`, the function is at `http://localhost:8888/.netlify/functions/send-majlis-thank-you`. Supabase webhooks cannot target localhost; test by temporarily pointing the webhook at a deployed URL or by sending a manual POST with the same JSON shape and optional `X-Webhook-Secret` header.
