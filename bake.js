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
const ALL_ANIMALS_FILE = path.join(__dirname, 'all-animals.json');

if (!fs.existsSync(TRAILS_FILE)) {
  console.error('trails.json not found — run `npm run scrape` first!');
  process.exit(1);
}

const trails = JSON.parse(fs.readFileSync(TRAILS_FILE, 'utf8'));
let html = fs.readFileSync(TRACKER, 'utf8');

// Merge the full animal roster into the embedded ANIMALS list.
// Prefer all-animals.json (complete worldwide roster); fall back to pacific.
const mergeFile = fs.existsSync(ALL_ANIMALS_FILE) ? ALL_ANIMALS_FILE
                 : (fs.existsSync(PACIFIC_FILE) ? PACIFIC_FILE : null);
if (mergeFile) {
  try {
    const extra = JSON.parse(fs.readFileSync(mergeFile, 'utf8'));
    const m = html.match(/const ANIMALS = (\{[\s\S]*?\});/);
    if (m) {
      const animals = JSON.parse(m[1]);
      const byId = new Map(animals.features.map(f => [f.properties.id, f]));
      let added = 0, updated = 0;
      extra.features.forEach(f => {
        if (byId.has(f.properties.id)) {
          // Refresh metadata/position for existing animals too
          byId.set(f.properties.id, f); updated++;
        } else {
          byId.set(f.properties.id, f); added++;
        }
      });
      animals.features = Array.from(byId.values());
      html = html.replace(/const ANIMALS = \{[\s\S]*?\};/, 'const ANIMALS = ' + JSON.stringify(animals) + ';');
      console.log(`Merged roster from ${path.basename(mergeFile)}: ${added} added, ${updated} refreshed (total ${animals.features.length})`);
    }
  } catch (e) {
    console.warn('Could not merge animal roster:', e.message);
  }
}

// Inject trails (idempotent — remove any prior injection so re-runs don't stack)
html = html.replace(/window\._TRAILS = \{[\s\S]*?\};\n/, '');
const trailsJs = `window._TRAILS = ${JSON.stringify(trails)};`;
html = html.replace('const TRAILS = window._TRAILS || {};', `${trailsJs}\nconst TRAILS = window._TRAILS || {};`);

fs.writeFileSync(TRACKER, html);

const count = Object.keys(trails).length;
const totalPings = Object.values(trails).reduce((s, t) => s + (t.motion?.length || 0), 0);
console.log(`Baked ${count} trails (${totalPings.toLocaleString()} pings) into index.html`);
