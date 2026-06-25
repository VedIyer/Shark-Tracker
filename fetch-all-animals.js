/**
 * Fetches OCEARCH's COMPLETE animal roster (every shark/turtle worldwide) and:
 *   1. Rebuilds the ANIMALS array in scrape.js so every animal gets scraped
 *   2. Saves the full geojson to all-animals.json so bake.js merges them onto the map
 *
 * This replaces the old region-limited find-pacific.js — no region is missed now.
 *
 * Run:  node fetch-all-animals.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Fetching the COMPLETE OCEARCH animal list...\n');

  const launchOpts = process.env.CI ? { headless: true } : { channel: 'chrome', headless: true };
  const browser = await chromium.launch(launchOpts);

  let geojson = null;
  // Retry a few times — datacenter IPs sometimes need more than one attempt
  for (let attempt = 1; attempt <= 3 && !geojson; attempt++) {
    if (attempt > 1) console.log(`Retry ${attempt}/3...`);
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    page.on('response', async (r) => {
      if (r.url().includes('/pois.geojson')) {
        try { const j = await r.json(); if (j && j.features) geojson = j; } catch (e) {}
      }
    });
    try {
      await page.goto('https://www.ocearch.org/tracker/', { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(5000);
    } catch (e) {
      console.log('  page load issue: ' + e.message.split('\n')[0]);
    }
    await context.close();
  }
  await browser.close();

  if (!geojson) {
    console.warn('Could not fetch the animal list (network may be blocked).');
    console.warn('Keeping the existing animal list; exiting without changes.');
    process.exit(0);   // don't break the workflow — scrape continues with existing list
  }

  const feats = geojson.features.filter(f => f.properties && f.properties.id && f.properties.slug);
  console.log(`Found ${feats.length} animals worldwide.\n`);

  // ── 1. Save the full geojson for bake.js to merge onto the map ──
  fs.writeFileSync(
    path.join(__dirname, 'all-animals.json'),
    JSON.stringify({ type: 'FeatureCollection', features: feats }, null, 2)
  );
  console.log('Saved full roster to all-animals.json');

  // ── 2. Rebuild the ANIMALS array in scrape.js ──
  const scrapePath = path.join(__dirname, 'scrape.js');

  const entries = feats.map(f => {
    const p = f.properties;
    const name = (p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const slug = (p.slug || '').replace(/'/g, "\\'");
    return `  { name: '${name}', slug: '${slug}', id: ${p.id} },`;
  });
  const newArray = 'const ANIMALS = [\n' + entries.join('\n') + '\n];';

  let scrape = '';
  try { scrape = fs.readFileSync(scrapePath, 'utf8'); } catch (e) { scrape = ''; }

  // Use a function replacement so $ in data can't trigger special replace patterns.
  const re = /const ANIMALS = \[[\s\S]*?\n\];/;
  let out;
  if (scrape && re.test(scrape)) {
    out = scrape.replace(re, () => newArray);
    console.log(`Rebuilt scrape.js ANIMALS array with ${feats.length} animals`);
  } else {
    // Self-heal: the existing scrape.js is missing/malformed — write a fresh,
    // known-good scrape.js around the new ANIMALS array.
    console.warn('ANIMALS array not found in scrape.js — regenerating scrape.js from template.');
    out = buildScrapeTemplate(newArray);
    console.log(`Wrote a fresh scrape.js with ${feats.length} animals`);
  }

  // Safety: never write something that doesn't contain the array
  if (!/const ANIMALS = \[/.test(out)) {
    console.error('Refusing to write scrape.js — generated content looks wrong.');
    process.exit(1);
  }
  fs.writeFileSync(scrapePath, out);

  // Region breakdown for visibility
  const regions = { Atlantic_Americas: 0, Pacific_Asia: 0, Africa_Indian: 0, Other: 0 };
  feats.forEach(f => {
    const [lon, lat] = f.geometry.coordinates;
    if (lon >= -100 && lon <= -30 && lat > 0) regions.Atlantic_Americas++;
    else if (lon >= 90 || lon <= -150) regions.Pacific_Asia++;
    else if (lon >= -30 && lon <= 70) regions.Africa_Indian++;
    else regions.Other++;
  });
  console.log('\nRough region breakdown:');
  Object.entries(regions).forEach(([k, v]) => console.log(`  ${k.replace(/_/g, '/')}: ${v}`));

  console.log('\nNow run:  npm run scrape');
})();

// A complete, known-good scrape.js with the ANIMALS array injected. Used when the
// existing scrape.js is missing or its ANIMALS array can't be located.
function buildScrapeTemplate(animalsArray) {
  return `const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

${animalsArray}

const OUTPUT_FILE = path.join(__dirname, 'trails.json');
const CONCURRENCY = 5;

(async () => {
  console.log('OCEARCH Trail Scraper (parallel)');
  console.log('===================================');

  let results = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(\`Loaded \${Object.keys(results).length} existing trails\`);
  }

  // Re-fetch animals whose cached data is stale (or missing).
  const STALE_HOURS = 20;
  const now = Date.now();
  const forceAll = process.env.REFRESH_ALL === '1';
  const todo = ANIMALS.filter(a => {
    const cached = results[a.id];
    if (!cached || !(cached.motion && cached.motion.length > 0)) return true;
    if (forceAll) return true;
    const ageHours = (now - (cached.fetchedAt || 0)) / 3.6e6;
    return ageHours >= STALE_HOURS;
  });
  const skipped = ANIMALS.length - todo.length;
  console.log(\`\${todo.length} to fetch, \${skipped} fresh (cached < \${STALE_HOURS}h), \${CONCURRENCY} at a time\\n\`);

  if (todo.length === 0) {
    console.log('Everything is fresh! Running bake...');
    require('./bake.js');
    return;
  }

  const launchOpts = process.env.CI ? { headless: true } : { channel: 'chrome', headless: true };
  const browser = await chromium.launch(launchOpts);

  let success = 0, failed = 0, done = 0;
  const startTime = Date.now();
  const queue = [...todo];

  async function worker() {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    await page.route('**/*', route => {
      const type = route.request().resourceType();
      const url = route.request().url();
      if (['image', 'font', 'media', 'stylesheet'].includes(type) ||
          url.includes('google') || url.includes('hubspot') || url.includes('hsadspixel') ||
          url.includes('sentry') || url.includes('hotjar') || url.includes('doubleclick') ||
          url.includes('windy') || url.includes('cloudflareinsights') || url.includes('fndrsp')) {
        return route.abort();
      }
      route.continue();
    });

    while (queue.length > 0) {
      const animal = queue.shift();
      if (!animal) break;
      let resolveData;
      const dataPromise = new Promise(res => { resolveData = res; });
      const handler = async (response) => {
        const url = response.url();
        if (url.includes(\`/pois/\${animal.id}/motion/with-meta/\`)) {
          try {
            const data = await response.json();
            if (data.motion && data.motion.length > 0) {
              results[animal.id] = { name: animal.name, motion: data.motion, log: data.log, fetchedAt: Date.now() };
              fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));
              resolveData(data.motion.length);
            }
          } catch (e) {}
        }
      };
      page.on('response', handler);
      try {
        await page.goto(\`https://www.ocearch.org/tracker/detail/\${animal.slug}\`, { waitUntil: 'domcontentloaded', timeout: 40000 });
        const pings = await Promise.race([
          dataPromise,
          new Promise(res => setTimeout(() => res(null), process.env.CI ? 20000 : 12000)),
        ]);
        done++;
        const pct = Math.round(100 * done / todo.length);
        if (pings) { success++; console.log(\`[\${pct}%] OK \${animal.name} - \${pings} pings\`); }
        else { failed++; console.log(\`[\${pct}%] -- \${animal.name} - no data\`); }
      } catch (e) {
        done++; failed++;
        console.log(\`[\${Math.round(100*done/todo.length)}%] xx \${animal.name} - \${e.message.split('\\n')[0]}\`);
      } finally {
        page.off('response', handler);
      }
    }
    await context.close();
  }

  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, todo.length); i++) workers.push(worker());
  await Promise.all(workers);
  await browser.close();

  const secs = Math.round((Date.now() - startTime) / 1000);
  console.log(\`\\n===================================\`);
  console.log(\`\${success} fetched, \${failed} failed in \${secs}s\`);
  console.log(\`Total trails: \${Object.keys(results).length}\`);

  if (Object.keys(results).length > 0) {
    console.log('\\nBaking into tracker...');
    require('./bake.js');
  }
})();
`;
}
