/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/mep-sync.mjs [--check]` (0.6 DF.29; session bim-draw): BimCraft's pipe sizes and duct sizing ARE
 * CadCraft's Piping and HVAC add-ons' tables. The add-ons stay canonical (`cadcraft/dev/addons/piping/lib/tables.js`,
 * `cadcraft/dev/addons/hvac/lib/sizing.js`, both import-free); this copies them byte for byte into `bimcraft/dev/mep/`.
 * `--check` fails when a copy differs. Run it after either add-on file changes; never edit the copies.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ADDONS = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/addons');
const OUT = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/mep');
export const MEP_FILES = [['piping/lib/tables.js', 'tables.js'], ['hvac/lib/sizing.js', 'sizing.js']];

const check = process.argv.includes('--check');
let bad = 0;
for (const [from, to] of MEP_FILES) {
  const src = fs.readFileSync(path.join(ADDONS, from)), dst = path.join(OUT, to);
  if (/^\s*import\s/m.test(src.toString('utf8'))) { console.error(from + ' imports something: BimCraft copies only import-free files'); process.exit(1); }
  const have = fs.existsSync(dst) ? fs.readFileSync(dst) : null;
  if (have && Buffer.compare(have, src) === 0) { console.log('same   mep/' + to + ' = addons/' + from); continue; }
  if (check) { console.error('DIFFERS mep/' + to + ' is not addons/' + from + ': run node tools/bimcraft-test/mep-sync.mjs'); bad++; continue; }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(dst, src);
  console.log('wrote  mep/' + to + ' from addons/' + from);
}
process.exit(bad ? 1 : 0);
