/**
 * After running `npm run scrape`, run this to bake trails into the tracker:
 *   node bake.js
 *
 * Also merges pacific-animals.json into the animal list if present.
 */

const fs = require('fs');
const path = require('path');

const TRAILS_FILE = path.join(__dirname, 'trails.json');
const TRACKER = path.join(__dirname, 'index.html');
const PACIFIC_FILE = path.join(__dirname, 'pacific-animals.json');

if (!fs.existsSync(TRAILS_FILE)) {
  console.error('trails.json not found — run `npm run scrape` first!');
  process.exit(1);
}

const trails = JSON.parse(fs.readFileSync(TRAILS_FILE, 'utf8'));
let html = fs.readFileSync(TRACKER, 'utf8');

// Merge Pacific animals into the embedded ANIMALS list if the file exists
if (fs.existsSync(PACIFIC_FILE)) {
  try {
    const pacific = JSON.parse(fs.readFileSync(PACIFIC_FILE, 'utf8'));
    const m = html.match(/const ANIMALS = (\{[\s\S]*?\});/);
    if (m) {
      const animals = JSON.parse(m[1]);
      const existingIds = new Set(animals.features.map(f => f.properties.id));
      let added = 0;
      pacific.features.forEach(f => {
        if (!existingIds.has(f.properties.id)) {
          animals.features.push(f);
          added++;
        }
      });
      html = html.replace(/const ANIMALS = \{[\s\S]*?\};/, 'const ANIMALS = ' + JSON.stringify(animals) + ';');
      console.log(`Merged ${added} Pacific animals into the tracker`);
    }
  } catch (e) {
    console.warn('Could not merge pacific animals:', e.message);
  }
}

// Inject trails
const trailsJs = `window._TRAILS = ${JSON.stringify(trails)};`;
html = html.replace('const TRAILS = window._TRAILS || {};', `${trailsJs}\nconst TRAILS = window._TRAILS || {};`);

fs.writeFileSync(TRACKER, html);

const count = Object.keys(trails).length;
const totalPings = Object.values(trails).reduce((s, t) => s + (t.motion?.length || 0), 0);
console.log(`Baked ${count} trails (${totalPings.toLocaleString()} pings) into shark-tracker.html`);
console.log('Open shark-tracker.html in your browser!');
