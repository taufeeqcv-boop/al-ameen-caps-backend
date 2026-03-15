# PayFast Configuration Guide

## PayFast URLs

### Sandbox (Testing)
- **URL:** `https://sandbox.payfast.co.za/eng/process`
- **Use when:** `VITE_PAYFAST_SANDBOX = 'true'`
- **Merchant ID:** `10000100` (test account)
- **Merchant Key:** `46f0cd694581a` (test key)
- **Passphrase:** `salt` (test passphrase)

### Live (Production)
- **URL:** `https://www.payfast.co.za/eng/process`
- **Use when:** `VITE_PAYFAST_SANDBOX = 'false'` or unset
- **Merchant ID:** Your live merchant ID from PayFast dashboard
- **Merchant Key:** Your live merchant key from PayFast dashboard
- **Passphrase:** Your live passphrase from PayFast dashboard

## Environment Variables

### Required in Netlify Dashboard

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_PAYFAST_SANDBOX` | Set to `'true'` for sandbox, `'false'` or unset for live | `false` |
| `VITE_PAYFAST_MERCHANT_ID` | Your PayFast merchant ID | `10000100` (sandbox) or your live ID |
| `VITE_PAYFAST_MERCHANT_KEY` | Your PayFast merchant key | `46f0cd694581a` (sandbox) or your live key |
| `VITE_PAYFAST_PASSPHRASE` | Your PayFast passphrase | `salt` (sandbox) or your live passphrase |

## Common 500 Error Causes

1. **Wrong URL for mode:**
   - Using live URL with sandbox credentials → 500 error
   - Using sandbox URL with live credentials → 500 error
   - **Fix:** Ensure `VITE_PAYFAST_SANDBOX` matches your credentials

2. **Invalid signature:**
   - Wrong passphrase → signature validation fails → 500 error
   - **Fix:** Verify passphrase matches PayFast dashboard exactly

3. **Missing required fields:**
   - Missing `email_address`, `amount`, `item_name`, etc. → 500 error
   - **Fix:** Check browser console logs for missing fields

4. **Invalid merchant credentials:**
   - Wrong merchant ID or key → 500 error
   - **Fix:** Verify credentials in PayFast dashboard

5. **Empty email address:**
   - PayFast requires valid email → 500 error
   - **Fix:** Ensure user email is filled in form

## Debugging Steps

1. **Check browser console:**
   - Look for "PayFast Configuration" log
   - Verify `isSandbox`, `payfastUrl`, and all fields are set

2. **Verify environment variables:**
   - Netlify Dashboard → Site settings → Environment variables
   - Ensure all `VITE_PAYFAST_*` variables are set correctly

3. **Check PayFast dashboard:**
   - Verify merchant ID, key, and passphrase match
   - Check if account is active and not suspended

4. **Test signature:**
   - Signature should be 32 characters (MD5 hash)
   - Check console log for "signature_length: 32"

## Current Configuration

Based on deployment topology:
- **Mode:** LIVE (production)
- **URL:** `https://www.payfast.co.za/eng/process`
- **Sandbox:** `false` (should be unset or `'false'`)

## Testing

To test in sandbox mode:
1. Set `VITE_PAYFAST_SANDBOX = 'true'` in Netlify
2. Use sandbox credentials (10000100 / 46f0cd694581a / salt)
3. Redeploy site
4. Test checkout → should redirect to sandbox PayFast

To switch to live:
1. Set `VITE_PAYFAST_SANDBOX = 'false'` or remove it
2. Use your live PayFast credentials
3. Redeploy site
4. Test checkout → should redirect to live PayFast
