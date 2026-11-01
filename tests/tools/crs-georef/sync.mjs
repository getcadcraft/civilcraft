#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — lib/crs-georef/ is canonical (0.8 D8.9 round 3, session `d89b_PART_3`): the georeference maths and the reprojection loop.
 * Each app that offers it carries byte-identical copies next to its crs.js. Scoped: touches only the three files below and the words of lang.mjs
 * (georef.*, measure.georef*), never another library's files or keys.
 *
 *   node tools/crs-georef/sync.mjs [--check] [--words] [target …]       targets: bimcraft (bimcraft/dev/)
 *   --words  also write the words (en + es-MX draft, @context notes) into the target's lang files · --check  change nothing; exit 1 and list what differs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const LIB = path.join(ROOT, 'lib/crs-georef');
const FILES = ['crs-georef.js', 'reproject-batch.js', 'reproject-worker.js'];
export const TARGETS = { bimcraft: path.join(APPS, 'bimcraft/dev') };
const args = process.argv.slice(2), check = args.includes('--check'), words = args.includes('--words');
const names = args.filter((a) => !a.startsWith('--'));
let diff = 0;
const { EN, ES, CTX } = await import('./lang.mjs');
for (const name of names.length ? names : Object.keys(TARGETS)) {
  const dir = TARGETS[name];
  if (!dir) { console.error(name + ': not a target (' + Object.keys(TARGETS).join(', ') + ')'); diff++; continue; }
  for (const f of FILES) {
    const src = fs.readFileSync(path.join(LIB, f)), dst = path.join(dir, f);
    if (fs.existsSync(dst) && Buffer.compare(src, fs.readFileSync(dst)) === 0) continue;
    diff++; console.log(name + ' ' + f + ': ' + (check ? 'differs' : 'updated'));
    if (!check) fs.writeFileSync(dst, src);
  }
  for (const [loc, table] of [['en', EN], ['es-MX', ES]]) {
    const file = path.join(dir, 'lang', loc + '.json');
    const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
    const out = {};
    let changed = false;
    for (const [k, v] of Object.entries(obj)) { if (k in table && table[k] !== v) { out[k] = table[k]; changed = true; } else out[k] = v; }
    for (const [k, v] of Object.entries(table)) if (!(k in out)) { out[k] = v; changed = true; }
    if (loc === 'en') { obj['@context'] ||= {}; for (const [k, v] of Object.entries(CTX)) if (obj['@context'][k] !== v) { out['@context'] = { ...(out['@context'] || obj['@context']), [k]: v }; changed = true; } }
    if (changed) { diff++; console.log(name + ' ' + loc + '.json: georef words ' + ((check || !words) ? 'differ' : 'written')); if (words && !check) fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n'); }
  }
  if (!diff) console.log(name + ': ok');
}
process.exit(check && diff ? 1 : 0);
