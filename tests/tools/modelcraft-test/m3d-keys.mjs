#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * m3d-keys.mjs — the m3d kernel (ModelCraft's model.js, tools.js, infer.js, io.js, units.js, xml.js, dwg-reader.js, copied
 * byte-identical into other apps' dev/m3d/) says every word through t() with keys under `m3d.*`. Its English lives in
 * modelcraft/dev/lang/en.json; an app that carries the kernel copies needs the same keys in its own lang/en.json.
 *
 *   node tools/modelcraft-test/m3d-keys.mjs [--check] [app…]     (default app: cadcraft)
 *
 * Copies every `m3d.*` key (and its @context note, when there is one) from ModelCraft's en.json into each app's en.json,
 * replacing old values and removing `m3d.*` keys ModelCraft no longer has; `--check` only reports drift (exit 1).
 * Other languages: translators work in ModelCraft's files; this tool copies English only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const args = process.argv.slice(2);
const check = args.includes('--check');
const apps = args.filter((a) => !a.startsWith('--'));
if (!apps.length) apps.push('cadcraft');

const src = JSON.parse(fs.readFileSync(path.join(APPS, 'modelcraft/dev/lang/en.json'), 'utf8'));
const want = Object.fromEntries(Object.entries(src).filter(([k]) => k.startsWith('m3d.')));
const ctx = Object.fromEntries(Object.entries(src['@context'] || {}).filter(([k]) => k.startsWith('m3d.')));
let drift = 0;
for (const app of apps) {
  const file = path.join(APPS, app, 'dev/lang/en.json');
  if (!fs.existsSync(file)) { console.log(`${app}: no lang/en.json — skipped`); continue; }
  const cur = JSON.parse(fs.readFileSync(file, 'utf8'));
  const have = Object.fromEntries(Object.entries(cur).filter(([k]) => k.startsWith('m3d.')));
  const changed = Object.keys(want).filter((k) => JSON.stringify(have[k]) !== JSON.stringify(want[k]));
  const gone = Object.keys(have).filter((k) => !(k in want));
  if (!changed.length && !gone.length) { console.log(`${app}: ${Object.keys(want).length} m3d.* keys in step`); continue; }
  drift++;
  console.log(`${app}: ${changed.length} m3d.* keys to add or update, ${gone.length} to remove`);
  if (check) continue;
  const out = {};
  for (const [k, v] of Object.entries(cur)) if (!k.startsWith('m3d.')) out[k] = v;
  Object.assign(out, want);
  if (Object.keys(ctx).length) out['@context'] = { ...(cur['@context'] || {}), ...ctx };
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log(`${app}: written`);
}
process.exit(check && drift ? 1 : 0);
