const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ANIMALS = [
  { name: 'Breton',      slug: 'breton',      id: 544541 },
  { name: 'Contender',   slug: 'contender',   id: 2344847 },
  { name: 'Penny',       slug: 'penny',       id: 1561937 },
  { name: 'Brookes',     slug: 'brookes',     id: 2881663 },
  { name: 'Ripple',      slug: 'ripple',      id: 2884021 },
  { name: 'Goodall',     slug: 'goodall',     id: 2885826 },
  { name: 'Danny',       slug: 'danny',       id: 2344838 },
  { name: 'Quint',       slug: 'quint',       id: 2794989 },
  { name: 'Bella',       slug: 'bella',       id: 2790721 },
  { name: 'Jason',       slug: 'jason',       id: 2789925 },
  { name: 'Baker',       slug: 'baker',       id: 2790722 },
  { name: 'Mira',        slug: 'mira',        id: 2548468 },
  { name: 'Serena',      slug: 'serena',      id: 2893202 },
  { name: 'Tono',        slug: 'tono',        id: 3470603 },
  { name: 'Crystal',     slug: 'crystal',     id: 1167289 },
  { name: 'Nukumi',      slug: 'nukumi',      id: 551127 },
  { name: 'Mary Lee',    slug: 'mary-lee',    id: 288428 },
  { name: 'Niabi',       slug: 'niabi',       id: 2832241 },
  { name: 'Webster',     slug: 'webster',     id: 2883372 },
  { name: 'Brass Bed',   slug: 'brass-bed',   id: 2886160 },
  { name: 'Ernst',       slug: 'ernst',       id: 2886164 },
  { name: 'Cross',       slug: 'cross',       id: 2886165 },
  { name: 'Nori',        slug: 'nori',        id: 2885995 },
  { name: 'Jekyll',      slug: 'jekyll',      id: 1480814 },
  { name: 'Frosty',      slug: 'frosty',      id: 1483470 },
  { name: 'Dold',        slug: 'dold',        id: 2361676 },
  { name: 'LYS',         slug: 'lys',         id: 3467308 },
  { name: 'Felix',       slug: 'felix',       id: 2141156 },
  { name: 'Hanna',       slug: 'hanna',       id: 2431784 },
  { name: 'Unamaki',     slug: 'unamaki',     id: 290985 },
  { name: 'Scot',        slug: 'scot',        id: 858430 },
  { name: 'Bob',         slug: 'bob',         id: 867210 },
  { name: 'Sarah',       slug: 'sarah',       id: 865246 },
  { name: 'Tupelo',      slug: 'tupelo',      id: 3551617 },
  { name: 'Tallulah',    slug: 'tallulah',    id: 3552504 },
  { name: 'Priscilla',   slug: 'priscilla',   id: 3552505 },
  { name: 'Wassaw Will', slug: 'wassaw-will', id: 2812557 },
  { name: 'Bootes',      slug: 'bootes',      id: 2108458 },
];

const OUTPUT_FILE = path.join(__dirname, 'trails.json');

// How many sharks to scrape at the same time. Higher = faster but heavier.
// 4-5 is a good balance; bump to 6-8 on a fast machine + connection.
const CONCURRENCY = 5;

(async () => {
  console.log('🦈 OCEARCH Trail Scraper (parallel)');
  console.log('===================================');

  let results = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`Loaded ${Object.keys(results).length} existing trails`);
  }

  // Only scrape animals we don't already have
  const todo = ANIMALS.filter(a => !(results[a.id]?.motion?.length > 0));
  const skipped = ANIMALS.length - todo.length;
  console.log(`${todo.length} to fetch, ${skipped} already cached, ${CONCURRENCY} at a time\n`);

  if (todo.length === 0) {
    console.log('Everything already scraped! Running bake...');
    require('./bake.js');
    return;
  }

  const launchOpts = process.env.CI
    ? { headless: true }                       // GitHub Actions: use bundled Chromium
    : { channel: 'chrome', headless: true };   // Local: use your installed Chrome
  const browser = await chromium.launch(launchOpts);

  let success = 0, failed = 0, done = 0;
  const startTime = Date.now();

  // Worker: processes animals from a shared queue
  const queue = [...todo];
  async function worker(workerId) {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Block heavy resources we don't need — big speedup
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

      // Set up a promise that resolves when this animal's data arrives
      let resolveData;
      const dataPromise = new Promise(res => { resolveData = res; });

      const handler = async (response) => {
        const url = response.url();
        if (url.includes(`/pois/${animal.id}/motion/with-meta/`)) {
          try {
            const data = await response.json();
            if (data.motion?.length > 0) {
              results[animal.id] = { name: animal.name, motion: data.motion, log: data.log };
              fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results));
              resolveData(data.motion.length);
            }
          } catch (e) {}
        }
      };
      page.on('response', handler);

      try {
        // Navigate; don't wait for full networkidle, just DOM + the data response
        await page.goto(`https://www.ocearch.org/tracker/detail/${animal.slug}`, {
          waitUntil: 'domcontentloaded', timeout: 25000
        });
        // Wait up to 12s for the data response (or resolve early when it arrives)
        const pings = await Promise.race([
          dataPromise,
          new Promise(res => setTimeout(() => res(null), 12000)),
        ]);

        done++;
        const pct = Math.round(100 * done / todo.length);
        if (pings) {
          success++;
          console.log(`[${pct}%] ✅ ${animal.name} — ${pings} pings`);
        } else {
          failed++;
          console.log(`[${pct}%] ⚠ ${animal.name} — no data`);
        }
      } catch (e) {
        done++;
        failed++;
        console.log(`[${Math.round(100*done/todo.length)}%] ❌ ${animal.name} — ${e.message.split('\n')[0]}`);
      } finally {
        page.off('response', handler);
      }
    }

    await context.close();
  }

  // Launch workers in parallel
  const workers = [];
  for (let i = 0; i < Math.min(CONCURRENCY, todo.length); i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  await browser.close();

  const secs = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n===================================`);
  console.log(`✅ ${success} fetched, ${failed} failed in ${secs}s`);
  console.log(`Total trails: ${Object.keys(results).length}`);

  if (Object.keys(results).length > 0) {
    console.log('\nBaking into tracker...');
    require('./bake.js');
  }
})();
