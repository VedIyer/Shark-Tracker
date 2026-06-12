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
  { name: 'ANZAC', slug: 'anzac', id: 288255 },
  { name: 'Maroochy', slug: 'maroochy', id: 288267 },
  { name: 'Trinity', slug: 'trinity', id: 288277 },
  { name: 'Bec Piper', slug: 'bec-piper', id: 288280 },
  { name: 'Alice', slug: 'alice', id: 288281 },
  { name: 'Shayna', slug: 'shayna', id: 288297 },
  { name: 'Aussie', slug: 'aussie', id: 288298 },
  { name: 'Zuza', slug: 'zuza', id: 288301 },
  { name: 'Jedda', slug: 'jedda', id: 288304 },
  { name: 'Leeuwin', slug: 'leeuwin', id: 288306 },
  { name: 'Naia', slug: 'naia', id: 288307 },
  { name: 'Hannah', slug: 'hannah', id: 288308 },
  { name: 'Bevan', slug: 'bevan', id: 288315 },
  { name: 'CHIPS', slug: 'chips', id: 288323 },
  { name: 'Sunny', slug: 'sunny', id: 288327 },
  { name: 'Ned', slug: 'ned', id: 288328 },
  { name: 'Nickol', slug: 'nickol', id: 288336 },
  { name: 'Mackay', slug: 'mackay', id: 288343 },
  { name: 'Sero', slug: 'sero', id: 288344 },
  { name: 'Jon', slug: 'jon', id: 288362 },
  { name: 'GBR1', slug: 'gbr1', id: 288363 },
  { name: 'Catalina', slug: 'catalina', id: 288365 },
  { name: 'Siegi', slug: 'siegi', id: 288378 },
  { name: 'Adelaide', slug: 'adelaide', id: 288382 },
  { name: 'Cathy', slug: 'cathy', id: 288388 },
  { name: 'Quang', slug: 'quang', id: 288392 },
  { name: 'Kimberley', slug: 'kimberley', id: 288399 },
  { name: 'Erica', slug: 'erica', id: 288425 },
  { name: 'Gnaraloo', slug: 'gnaraloo', id: 288435 },
  { name: 'Gareth', slug: 'gareth', id: 288443 },
  { name: 'Ingo', slug: 'ingo', id: 288448 },
  { name: 'Kekoa', slug: 'kekoa', id: 288456 },
  { name: 'Laura', slug: 'laura', id: 288457 },
  { name: 'Freo', slug: 'freo', id: 288492 },
  { name: 'Katya (tiger shark)', slug: 'katya-tiger-shark', id: 288494 },
  { name: 'Ningaloo', slug: 'ningaloo', id: 288505 },
  { name: 'Perth', slug: 'perth', id: 288506 },
  { name: 'Zac', slug: 'zac', id: 288510 },
  { name: 'Bindi', slug: 'bindi', id: 288520 },
  { name: 'Holly', slug: 'holly', id: 384777 },
  { name: 'Zake', slug: 'zake', id: 384778 },
  { name: 'Alara', slug: 'alara', id: 384779 },
  { name: 'Jaap', slug: 'jaap', id: 384780 },
  { name: 'Lisa Christina', slug: 'lisa-christina', id: 384781 },
  { name: 'Belinda', slug: 'belinda', id: 384782 },
  { name: 'Grizz', slug: 'grizz', id: 405769 },
  { name: 'Hanna Marie', slug: 'hanna-marie', id: 405770 },
  { name: 'Fitzy', slug: 'fitzy', id: 406534 },
  { name: 'Headstone', slug: 'headstone', id: 406535 },
  { name: 'Miamiti', slug: 'miamiti', id: 406742 },
  { name: 'David', slug: 'david', id: 406789 },
  { name: 'Emma', slug: 'emma', id: 406793 },
  { name: 'Amy', slug: 'amy', id: 406820 },
  { name: 'Fletcher', slug: 'fletcher', id: 407072 },
  { name: 'Tintoela', slug: 'tintoela', id: 412932 },
  { name: 'Koru', slug: 'koru', id: 413146 },
  { name: 'Katya', slug: 'katya', id: 422455 },
  { name: 'Norfolk', slug: 'norfolk', id: 538048 },
  { name: 'Kate', slug: 'kate', id: 655105 },
  { name: 'Collette', slug: 'collette', id: 655106 },
  { name: 'Nomad', slug: 'nomad', id: 655117 },
  { name: 'Phillip', slug: 'phillip', id: 657935 },
  { name: 'Nepean', slug: 'nepean', id: 657952 },
  { name: 'Freidi', slug: 'freidi', id: 658080 },
  { name: 'Geoff', slug: 'geoff', id: 662567 },
  { name: 'Isla Belle', slug: 'isla-belle', id: 663081 },
  { name: 'Jap', slug: 'jap', id: 663822 },
  { name: 'Scotty 2', slug: 'scotty-2', id: 711247 },
  { name: 'Nehsi', slug: 'nehsi', id: 714085 },
  { name: 'Saki', slug: 'saki', id: 813615 },
  { name: 'Pete', slug: 'pete', id: 885626 },
  { name: 'Zozo', slug: 'zozo', id: 885628 },
  { name: 'Z-River', slug: 'z-river', id: 885795 },
  { name: 'Chloe', slug: 'chloe', id: 894870 },
  { name: 'Ali', slug: 'ali', id: 985813 },
  { name: 'Blancpain', slug: 'blancpain', id: 985814 },
  { name: 'Fifty Fathoms', slug: 'fifty-fathoms', id: 985851 },
  { name: 'Alexios', slug: 'alexios', id: 987168 },
  { name: 'Kimmy', slug: 'kimmy', id: 1100935 },
  { name: 'Tinka', slug: 'tinka', id: 1100943 },
  { name: 'Jens', slug: 'jens', id: 1100944 },
  { name: 'Sharky McShark Face', slug: 'sharky-mcshark-face', id: 1100946 },
  { name: 'Suki', slug: 'suki', id: 1100952 },
  { name: 'Jess', slug: 'jess', id: 1100966 },
  { name: 'Birgit', slug: 'birgit', id: 1100989 },
  { name: 'Rocket', slug: 'rocket', id: 1101252 },
  { name: 'Lacky', slug: 'lacky', id: 1101253 },
  { name: 'Aatuti', slug: 'aatuti', id: 1101254 },
  { name: 'Robert', slug: 'robert', id: 1101388 },
  { name: 'Theodosia', slug: 'theodosia', id: 1101543 },
  { name: 'Nate', slug: 'nate', id: 1101589 },
  { name: 'Tigger', slug: 'tigger', id: 1104738 },
  { name: 'Ali-Bel', slug: 'ali-bel', id: 1106959 },
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
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    });
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
          waitUntil: 'domcontentloaded', timeout: 40000
        });
        // Wait up to 12s for the data response (or resolve early when it arrives)
        const pings = await Promise.race([
          dataPromise,
          new Promise(res => setTimeout(() => res(null), process.env.CI ? 20000 : 12000)),
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
