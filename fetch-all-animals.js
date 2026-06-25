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
  let scrape = fs.readFileSync(scrapePath, 'utf8');

  const entries = feats.map(f => {
    const p = f.properties;
    const name = (p.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const slug = (p.slug || '').replace(/'/g, "\\'");
    return `  { name: '${name}', slug: '${slug}', id: ${p.id} },`;
  });

  const newArray = 'const ANIMALS = [\n' + entries.join('\n') + '\n];';
  // Replace the existing ANIMALS array (from "const ANIMALS = [" to the first "];")
  const replaced = scrape.replace(/const ANIMALS = \[[\s\S]*?\];/, newArray);

  if (replaced === scrape) {
    console.warn('Could not find ANIMALS array to replace in scrape.js!');
    process.exit(1);
  }
  fs.writeFileSync(scrapePath, replaced);
  console.log(`Rebuilt scrape.js ANIMALS array with ${feats.length} animals`);

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
