/**
 * Fetches the full live OCEARCH animal list, finds Indo-Pacific / Asia-region
 * animals, saves their data, AND automatically adds them to scrape.js.
 *
 * Run:  node find-pacific.js
 * Then: npm run scrape
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Fetching full OCEARCH animal list...\n');

  const launchOpts = process.env.CI ? { headless: true } : { channel: 'chrome', headless: true };
  const browser = await chromium.launch(launchOpts);

  let geojson = null;

  // Try up to 3 times — datacenter IPs (GitHub Actions) sometimes need a few tries
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
    // Don't crash the workflow — just skip the Pacific step and let scraping continue
    console.warn('Could not fetch animal list (likely blocked from this network).');
    console.warn('Skipping Pacific discovery; existing animals will still be scraped.');
    process.exit(0);
  }

  console.log(`Total animals worldwide: ${geojson.features.length}\n`);

  const ASIA_KEYWORDS = /australia|indonesia|japan|asia|pacific|new zealand|guam|philippines|taiwan|hawaii|fiji|queensland|victoria|tasmania|reunion|mauritius/i;

  const pacific = geojson.features.filter(f => {
    const [lon, lat] = f.geometry.coordinates;
    const tagLoc = f.properties.tag_location || '';
    const inLonRange = lon >= 90 || lon <= -150;
    return inLonRange || ASIA_KEYWORDS.test(tagLoc);
  });

  console.log(`Found ${pacific.length} Indo-Pacific / Asia-region animals:\n`);
  pacific.forEach(f => {
    const p = f.properties;
    const [lon, lat] = f.geometry.coordinates;
    console.log(`  ${p.name}  (${p.species?.split('(')[0].trim()})  —  ${p.tag_location}`);
  });

  // Save full feature data for bake.js to merge into the map
  fs.writeFileSync(
    path.join(__dirname, 'pacific-animals.json'),
    JSON.stringify({ type: 'FeatureCollection', features: pacific }, null, 2)
  );

  // Auto-add entries to scrape.js ANIMALS array
  const scrapePath = path.join(__dirname, 'scrape.js');
  let scrape = fs.readFileSync(scrapePath, 'utf8');

  // Build new entries, skipping any already present
  const newEntries = pacific
    .filter(f => !scrape.includes(`id: ${f.properties.id} `) && !scrape.includes(`id: ${f.properties.id},`))
    .map(f => {
      const p = f.properties;
      const name = (p.name || '').replace(/'/g, "\\'");
      return `  { name: '${name}', slug: '${p.slug}', id: ${p.id} },`;
    });

  if (newEntries.length > 0) {
    // Insert before the closing "];" of the ANIMALS array
    const marker = '];';
    const idx = scrape.indexOf(marker);
    if (idx > 0) {
      scrape = scrape.slice(0, idx) + newEntries.join('\n') + '\n' + scrape.slice(idx);
      fs.writeFileSync(scrapePath, scrape);
      console.log(`\n✅ Added ${newEntries.length} new animals to scrape.js`);
    }
  } else {
    console.log('\n(All Pacific animals already in scrape.js)');
  }

  console.log('\nNow run:  npm run scrape');
})();
