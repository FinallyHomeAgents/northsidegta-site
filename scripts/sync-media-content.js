const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'public/content', name), 'utf8'));
const snapshot = { settings: read('socials-settings.json'), items: read('socials.json').items || [] };
fs.writeFileSync(path.join(root, 'src/data/mediaSnapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
console.log('[sync-media-content] Updated public media snapshot for prerendering.');
