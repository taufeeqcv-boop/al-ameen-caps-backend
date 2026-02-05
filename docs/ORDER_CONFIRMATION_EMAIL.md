# Order Confirmation Email

The Success page tells customers: *"We will email you confirmation shortly."* To fulfil this, you need to send an email after a successful PayFast payment.

## Options

### 1. PayFast Notify URL (recommended)

PayFast can send a server-side **ITN (Instant Transaction Notification)** to your server when payment is successful. You can then:

- Validate the payment (check signature, amount, etc.)
- Store the order in Supabase (e.g. an `orders` table)
- Send a confirmation email from your server

**Steps:**

1. **Backend endpoint**  
   Create an HTTP endpoint that:
   - Accepts POST from PayFast (e.g. `https://your-site.com/api/payfast-notify`).
   - Verifies the PayFast signature (see [PayFast docs](https://developers.payfast.co.za/docs)).
   - Saves the order (Supabase or your DB).
   - Sends an email (e.g. via Resend, SendGrid, or a Netlify/Supabase Edge Function that calls an email API).

2. **Set `notify_url` in Checkout**  
   When building the PayFast form in `Checkout.jsx`, add:
   - `notify_url: `${appUrl}/api/payfast-notify``  
   (Your hosting must expose that route; e.g. Netlify Function at `/.netlify/functions/payfast-notify` and redirect or rewrite so PayFast can POST to it.)

3. **Email content**  
   Include: order reference, items, total, shipping address, and “We’ll send tracking when dispatched.”

### 2. Netlify Function + Email service

If you host on Netlify:

1. Create a serverless function (e.g. `netlify/functions/payfast-notify.js`) that:
   - Receives the PayFast POST.
   - Validates the request.
   - Writes the order to Supabase.
   - Calls an email API (Resend, SendGrid, etc.) to send the confirmation.

2. Add your email API key in Netlify environment variables (not in the repo).

### 3. Supabase Edge Function + Resend/SendGrid

1. Create a Supabase Edge Function that:
   - Is triggered by an HTTP request (e.g. from a webhook or your own frontend after redirect).
   - Receives order + customer email (from PayFast data or your DB).
   - Sends the email via Resend or SendGrid.

2. You still need a secure way to know the payment succeeded (e.g. PayFast `notify_url` calling a public endpoint that then calls Supabase or the Edge Function).

### 4. Manual (short term)

Until automation is in place:

- Check PayFast dashboard or your bank for new payments.
- Send a short confirmation email yourself (or use a template) with order details and “we’ll notify you when dispatched.”

## Security

- Always verify PayFast ITN requests (signature, amount, merchant ID) before saving orders or sending emails.
- Never expose API keys in the frontend; keep them in server-side env (Netlify, Supabase, or your backend).

---

*Once you choose an option (e.g. Netlify Function + Resend), you can add the exact code and env vars to this doc or the README.*
