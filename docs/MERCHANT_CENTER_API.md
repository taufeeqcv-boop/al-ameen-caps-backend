# Add products using API (Google Merchant Center)

Use this when you choose **"Add products using API"** as the feed source in Merchant Center. The script pushes your collection products to Merchant Center via the Content API for Shopping.

---

## 1. In Merchant Center

1. Go to **Products** → **Feeds** → **Add feed**.
2. Select **South Africa**, **English**.
3. Choose **Add products using API** (not "Add products from a file").
4. Create the feed and note your **Merchant ID** (numeric account ID, e.g. in the URL or Account settings).

---

## 2. Google Cloud & Content API

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project and enable **Content API for Shopping** (APIs & Services → Enable APIs).
3. Create **OAuth 2.0 credentials** (APIs & Services → Credentials → Create credentials → OAuth client ID). Use "Desktop app" or "Web application" and add your redirect URI if needed.
4. Get an **access token** with scope `https://www.googleapis.com/auth/content`:
   - Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/): select **Content API for Shopping** → **https://www.googleapis.com/auth/content**, authorize, then "Exchange authorization code for tokens" and copy the **Access token**.
   - Or use the Google API client library in your own app to obtain a token.

---

## 3. Run the upload script

Set environment variables and run the script:

```bash
export MERCHANT_ID=123456789
export CONTENT_API_ACCESS_TOKEN="ya29...."
node scripts/merchant-center-upload-products.js
```

Windows (PowerShell):

```powershell
$env:MERCHANT_ID="123456789"
$env:CONTENT_API_ACCESS_TOKEN="ya29...."
node scripts/merchant-center-upload-products.js
```

- **MERCHANT_ID** – Your Merchant Center account ID (numeric).
- **CONTENT_API_ACCESS_TOKEN** – OAuth2 access token with scope `https://www.googleapis.com/auth/content`. Tokens expire (often after 1 hour); get a new one from the Playground or your OAuth flow when needed.

The script reads `COLLECTION_PRODUCTS` from `src/data/collection.js` and inserts each product via the Content API. It uses the same data as your XML feed (product-feed.xml).

---

## 4. Optional: feed label

If your API feed in Merchant Center uses a **feed label**, you can add it to each product in the script by setting `feedLabel: "YOUR_LABEL"` in the object passed to the API (in `toApiProduct`). Then redeploy or re-run the script as needed.

---

## Alternative: use feed URL instead of API

If you prefer not to manage OAuth and tokens, use **"Add products from a file"** → **"Enter a link to your file"** with:

**https://alameencaps.com/product-feed.xml**

That feed updates automatically on each deploy and does not require the Content API or credentials.
