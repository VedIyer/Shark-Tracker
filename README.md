# 🦈 Shark Tracker

A live, interactive shark tracker built on real OCEARCH data. Shows animal positions, full migration trails with smooth animated playback, a 2D ocean map, and a 3D globe view.

**Live site:** `https://YOUR-USERNAME.github.io/REPO-NAME/`

---

## How it works

- **`index.html`** — the entire tracker app (self-contained, no build step). This is what GitHub Pages serves.
- **`scrape.js`** — visits each animal's OCEARCH page and captures its trail data into `trails.json`.
- **`bake.js`** — embeds `trails.json` into `index.html` so the live site has the data baked in.
- **`.github/workflows/update-trails.yml`** — runs the scraper automatically every day and commits the fresh data, so the live site stays current with zero effort.

---

## One-time setup

### 1. Create the repository
- Create a new **public** repo on GitHub.
- Upload all these files (keep the folder structure — the `.github/workflows/` folder matters).

### 2. Turn on GitHub Pages
- Repo **Settings → Pages**
- Under **Branch**, choose **main**, folder **/ (root)**, click **Save**.
- After a minute your site is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

### 3. Turn on the automatic updates
- Repo **Settings → Actions → General**
- Scroll to **Workflow permissions**, choose **Read and write permissions**, save.
- Go to the **Actions** tab, select **Update shark trails**, click **Run workflow** to test it now.
- After it finishes, it will have scraped fresh data and committed an updated `index.html`. From then on it runs every day automatically.

That's it — anyone visiting your Pages URL sees the latest data.

---

## Updating manually (optional)

You don't need to, but if you want to refresh on demand:

**From the website:** Actions tab → Update shark trails → Run workflow.

**From your computer:**
```bash
npm install
npx playwright install chromium
npm run scrape      # scrapes + bakes into index.html
git add -A && git commit -m "update" && git push
```

---

## Adding more animals

- Edit the `ANIMALS` array in `scrape.js` (each needs `name`, `slug`, `id`).
- Or run `node find-pacific.js` to auto-add Asia/Pacific-region sharks.
- The next scrape picks them up.

---

## Notes

- The map tiles (Esri), globe textures (unpkg), and temperature overlay (NASA) load from their own free servers — nothing to host.
- The daily schedule is set to 09:00 UTC; change the `cron` line in the workflow to adjust.
- If the cloud scraper ever gets blocked by OCEARCH, just run the scrape locally and push — the result is identical.
