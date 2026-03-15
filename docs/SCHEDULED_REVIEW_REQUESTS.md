# Scheduled Review Request Automation

## Overview

The `scheduled-review-request` Netlify function automatically sends review request emails to customers 5 days after their order status is updated to `SHIPPED`.

## Setup Instructions

### 1. Database Migration

Run the SQL migration to add the `review_requested` column:

```sql
-- File: supabase/migrations/20250312_add_review_requested_column.sql
-- Run this in Supabase SQL Editor
```

This adds:
- `review_requested` boolean column (default: `false`)
- Index for efficient querying

### 2. Netlify Scheduled Function Configuration

**Option A: Via Netlify Dashboard (Recommended)**

1. Go to **Netlify Dashboard** → Your site → **Functions**
2. Click on **Scheduled functions**
3. Click **Add scheduled function**
4. Configure:
   - **Function**: `scheduled-review-request`
   - **Schedule**: `0 7 * * *` (Daily at 07:00 UTC / 09:00 SAST)
   - **Timezone**: UTC

**Option B: Via Netlify CLI**

```bash
netlify functions:schedule scheduled-review-request "0 7 * * *"
```

### 3. Environment Variables

Ensure these are set in **Netlify Dashboard** → **Site settings** → **Environment variables**:

- `SUPABASE_URL` or `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EMAIL_HOST` (default: `smtp.gmail.com`)
- `EMAIL_PORT` (default: `587`)
- `EMAIL_USER`
- `EMAIL_PASS`
- `VITE_SITE_URL` (default: `https://alameencaps.com`)

### 4. Manual Testing

You can manually trigger the function for testing:

```bash
curl -X POST https://alameencaps.com/.netlify/functions/scheduled-review-request
```

Or use the Netlify Functions dashboard to trigger it manually.

## How It Works

1. **Query Logic**: 
   - Finds orders with `status = 'SHIPPED'`
   - Where `updated_at` is exactly 5 days ago (00:00:00 to 23:59:59 UTC)
   - Where `review_requested = false` (not yet sent)

2. **Email Sending**:
   - Uses the "Heritage Connection" template
   - Includes link to `/review?token=<review_token>`
   - Sets `review_requested = true` after successful send

3. **Prevention**:
   - The `review_requested` boolean ensures each order only receives one email
   - If email fails, the order remains `review_requested = false` and will be retried on the next run

## Email Template

The "Heritage Connection" template emphasizes:
- Mumbai-to-Cape Town heritage
- Handcrafted quality
- Jumu'ah, Salah, and Eid connection
- Cape Malay and Bo-Kaap heritage
- Direct link to review page with 5% coupon incentive

## Monitoring

Check Netlify Function logs:
- **Netlify Dashboard** → **Functions** → `scheduled-review-request` → **Logs**

The function logs:
- Number of orders found
- Number of emails sent
- Number of failures
- Individual order processing status

## Troubleshooting

**No emails sent:**
- Check `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Verify orders exist with `status = 'SHIPPED'` and `updated_at` exactly 5 days ago
- Check function logs for errors

**Duplicate emails:**
- Ensure `review_requested` column exists and migration ran successfully
- Check that `review_requested = true` is being set after email send

**Schedule not running:**
- Verify scheduled function is configured in Netlify Dashboard
- Check timezone settings (should be UTC)
- Review Netlify function logs for execution errors
