# Schema & IndexNow verification (Phase 4)

## IndexNow .txt file

- **Build script:** `scripts/write-indexnow-key.js` runs after `vite build` (see `package.json`). It writes `dist/<KEY>.txt` with content = key (plain text) when `INDEXNOW_KEY` is set.
- **Target file:** When `INDEXNOW_KEY=4ed08a1ef99a4e2c900e1f0cd2eb69f8`, output is `dist/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt`.
- **Netlify:** Publish directory is `dist/`, so the file is at the site root. The SPA redirect uses `force = false`, so Netlify serves existing files first; requests to `/.txt` URLs are served the static file and are **not** rewritten to index.html.
- **Live check:** After deploy, open `https://alameencaps.com/4ed08a1ef99a4e2c900e1f0cd2eb69f8.txt`. You should see only the key string (plain page). Ensure `INDEXNOW_KEY` is set in Netlify (Build & deploy → Environment) so the file is created on each build.
