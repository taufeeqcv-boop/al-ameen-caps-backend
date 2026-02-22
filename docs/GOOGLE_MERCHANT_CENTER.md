# Google Merchant Center - Search Shopping tab

To get products on the Search Shopping tab for alameencaps.com, add a product feed in Google Merchant Center.

## Feed URL

After each deploy the feed is available at:

https://alameencaps.com/product-feed.xml

It is generated at build time by scripts/generate-product-feed.js (runs in npm run build). Format: RSS 2.0 with Google product attributes.

## Steps in Merchant Center

1. Go to Google Merchant Center and select or add your business (alameencaps.com).
2. Products then Feeds then Add feed.
3. Choose Website or Fetch from URL and enter: https://alameencaps.com/product-feed.xml
4. Country of sale: South Africa. Language: English.
5. Save and run a fetch.
6. Check Products then Diagnostics for any errors and fix if needed.

Once the feed is approved, products can appear in the Search Shopping tab.
