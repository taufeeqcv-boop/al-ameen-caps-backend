# PayFast ITN Listener – Netlify Setup

The function at `netlify/functions/itn-listener.js` receives PayFast’s Instant Transaction Notification (ITN), validates the signature, and sends an order confirmation email.

## 1. Install dependency

From the project root:

```bash
npm install nodemailer
```

(`crypto` is built into Node – no install needed.)

## 2. Netlify environment variables

Set these in **Netlify Dashboard → Your site → Site configuration → Environment variables**.  
Do **not** put `PAYFAST_PASSPHRASE` or email credentials in your frontend `.env` (Vite) – they must only be used on the server.

| Variable | Description | Example |
|----------|-------------|---------|
| `PAYFAST_PASSPHRASE` | Your PayFast passphrase (from PayFast dashboard). Required for ITN signature validation. | `your_secret_passphrase` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port (587 for TLS, 465 for SSL) | `587` |
| `EMAIL_USER` | SMTP login (e.g. Gmail address) | `yourname@gmail.com` |
| `EMAIL_PASS` | SMTP password. **Gmail:** use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password. | App password or SMTP password |
| `ADMIN_EMAIL` | BCC address – you receive a copy of every order confirmation here (e.g. `sales@alameencaps.com`) | `sales@alameencaps.com` |

### Gmail App Password

1. Google Account → Security → 2-Step Verification (must be on).
2. Security → App passwords → Generate for “Mail” / “Other”.
3. Use the 16-character password as `EMAIL_PASS`.

## 3. PayFast notify URL

Checkout already sends:

- `notify_url: ${VITE_SITE_URL}/.netlify/functions/itn-listener`

So when `VITE_SITE_URL` is your live site (e.g. `https://alameencaps.com`), PayFast will POST ITNs to:

- `https://alameencaps.com/.netlify/functions/itn-listener`

No change needed in code if your live URL is set correctly in Netlify (or in build env) as `VITE_SITE_URL`.

## 4. PayFast passphrase

In the PayFast dashboard, enable and set a passphrase. The same value must be set as `PAYFAST_PASSPHRASE` in Netlify. If the passphrase is wrong or missing, signature validation will fail and the function will not send the email (it still returns 200 so PayFast does not retry forever).

## 5. Deploy

Push to your repo; Netlify will build and deploy. The function is available at:

- `https://<your-site>/.netlify/functions/itn-listener`

PayFast will only call this URL when a payment is processed (success or failure). You can test with a PayFast sandbox payment.

## 6. Optional: local .env for Netlify CLI

If you run Netlify locally (`netlify dev`), you can put the same variables in a `.env` file in the project root (and add `.env` to `.gitignore` if not already). Do not commit real passphrases or passwords.
