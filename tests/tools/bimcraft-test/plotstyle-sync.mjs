/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/plotstyle-sync.mjs [--check]` (0.9 D8.12-B, session bim-views-09): BimCraft prints through a pen table in
 * CadCraft's plot-style format (0.6 DC.14), never a second format. CadCraft stays canonical (`cadcraft/dev/plotstyle.js`, which imports
 * only `aciHex` and `nearestAci` from `./doc.js`). This copies plotstyle.js byte for byte into `bimcraft/dev/plotstyle/plotstyle.js` and
 * writes `bimcraft/dev/plotstyle/doc.js` holding only those colour functions, cut from cadcraft/dev/doc.js unchanged (the block from
 * "// Colours (AutoCAD Color Index)" to the next export after nearestAci). `--check` fails when either differs. Never edit the copies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const FROM = path.join(APPS, 'cadcraft/dev'), TO = path.join(APPS, 'bimcraft/dev/plotstyle');
const check = process.argv.includes('--check');
let bad = 0;
const src = fs.readFileSync(path.join(FROM, 'plotstyle.js'), 'utf8');
const imports = [...src.matchAll(/^\s*import\s+\{([^}]*)\}\s*from\s+['"]([^'"]+)['"]/gm)];
if (imports.length !== 1 || imports[0][2] !== './doc.js' || imports[0][1].split(',').map((x) => x.trim()).sort().join() !== 'aciHex,nearestAci') {
  console.error('cadcraft/dev/plotstyle.js imports something else than { aciHex, nearestAci } from ./doc.js: update this script first'); process.exit(1);
}
const doc = fs.readFileSync(path.join(FROM, 'doc.js'), 'utf8');
const a = doc.indexOf('// Colours (AutoCAD Color Index)');
const n = doc.indexOf('export function nearestAci');
const b = n < 0 ? -1 : doc.indexOf('\n/**', n);
if (a < 0 || n < 0 || b < 0) { console.error('cadcraft/dev/doc.js: the colour block was not found'); process.exit(1); }
const colours = '/* SPDX-License-Identifier: Apache-2.0 */\n// plotstyle/doc.js — the ACI colour functions of cadcraft/dev/doc.js, cut unchanged by tools/bimcraft-test/plotstyle-sync.mjs. Never edit.\n\n' + doc.slice(a, b).trimEnd() + '\n';
const want = { 'plotstyle.js': src, 'doc.js': colours };
if (!check) fs.mkdirSync(TO, { recursive: true });
for (const [name, text] of Object.entries(want)) {
  const f = path.join(TO, name), have = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
  if (have === text) { console.log('same   plotstyle/' + name); continue; }
  if (check) { console.error('DIFFERS bimcraft/dev/plotstyle/' + name + ': run node tools/bimcraft-test/plotstyle-sync.mjs'); bad++; continue; }
  fs.writeFileSync(f, text);
  console.log('wrote  plotstyle/' + name);
}
process.exit(bad ? 1 : 0);
