// Turns src/dor.html (the DOR builder page) into src/dorHtml.ts so the app can
// load it with no network. Run `npm run html` after editing src/dor.html.
import fs from 'node:fs';
const html = fs.readFileSync('src/dor.html', 'utf8');
fs.writeFileSync('src/dorHtml.ts', '// Generated from src/dor.html by scripts/build-html.mjs. Do not edit.\nexport const DOR_HTML = ' + JSON.stringify(html) + ';\n');
console.log('src/dorHtml.ts written', html.length);
