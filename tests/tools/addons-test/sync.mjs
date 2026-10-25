#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — copy the canonical add-on trust module into every app build (0.4 part 2, A.8; session addons).
 *
 *   node tools/addons-test/sync.mjs           copy public_html/assets/js/addons-trust.js → <app>/dev/addons/trust.js
 *   node tools/addons-test/sync.mjs --check   exit 1 when a copy differs or is missing
 *
 * Only builds that carry the loader (dev/addons.js) get a copy. Never edit a copy: change the canonical file and run this.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(ROOT, 'public_html/assets/js/addons-trust.js');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const check = process.argv.includes('--check');
const want = fs.readFileSync(SRC);
let bad = 0, wrote = 0;
for (const app of fs.readdirSync(APPS).sort()) {
  const dev = path.join(APPS, app, 'dev');
  if (!fs.existsSync(path.join(dev, 'addons.js'))) continue;
  const dst = path.join(dev, 'addons', 'trust.js');
  const have = fs.existsSync(dst) ? fs.readFileSync(dst) : null;
  if (have && have.equals(want)) continue;
  if (check) { console.log('differs: ' + path.relative(ROOT, dst)); bad++; continue; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.writeFileSync(dst, want);
  console.log('copied: ' + path.relative(ROOT, dst));
  wrote++;
}
if (check) { console.log(bad ? bad + ' copies differ' : 'every copy matches'); process.exit(bad ? 1 : 0); }
console.log(wrote ? wrote + ' copied' : 'every copy already matches');
