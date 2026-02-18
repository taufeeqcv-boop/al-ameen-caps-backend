# Prerendering and Performance (2026)

This project follows **2026 Netlify Prerendering** guidelines: use the **Netlify Prerender extension** only; legacy prerendering is deprecated and must be disabled.

- **Netlify Prerendering docs:** [docs.netlify.com/build/post-processing/prerendering/](https://docs.netlify.com/build/post-processing/prerendering/)
- **Prerender extension:** [app.netlify.com/extensions/prerender](https://app.netlify.com/extensions/prerender)

---

## How it works

1. **Edge** — When a request hits Netlify, the Edge determines if it is from a crawler (user-agent for bots, AI agents, or preview services).
2. **Prerender function** — For those requests, the request is rewritten to a serverless function that runs a headless browser, loads the requested URL, and returns the fully-rendered HTML (with meta tags and JSON-LD).
3. **Config** — Extension configuration is stored in Netlify Blobs (dashboard); no repo config is required. Sensible defaults are enough for most sites.

Crawlers and AI tools receive full HTML; normal visitors continue to get the standard React SPA.

---

## Checklist

1. **Extension installed** — A Team Owner installs the Prerender extension from the link above so it is available for the team.
2. **Enabled for this project** — In the al-ameen-caps-backend site, go to **Extensions** → **Prerender** → **Enable prerendering**, then save.
3. **Legacy prerendering off** — In **Site configuration** (or **Build & deploy**) → **Post processing** → **Prerendering**, ensure the legacy “Prerendering” option is **OFF**.
4. **Redeploy** — Trigger a new deploy (or push a commit) so the extension is active.
5. **Verify** — Use the [prerendering checker tool](https://do-you-need-prerender.netlify.app/) with `https://alameencaps.com` to confirm crawlers receive full content.

---

## Performance

- **Headers and caching:** See [netlify.toml](../netlify.toml) — cache headers for HTML (no-cache), hashed assets (immutable), and static assets.
- **Core Web Vitals and SEO:** See [SEO_STRATEGY.md](SEO_STRATEGY.md) (LCP, CLS, INP targets) and [SEO_CHECKLIST.md](../SEO_CHECKLIST.md) (GSC, sitemap).

No code or build changes are required for the extension; it works with the current SPA and SEO setup.
