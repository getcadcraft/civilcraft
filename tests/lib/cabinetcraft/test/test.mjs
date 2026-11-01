#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — the CabinetCraft add-on's Node tests (0.8 DC.117, session `cabinetcraft_addon`). The cabinet model, lib/cutlist and lib/nest are the
 * CadCraft Cabinets add-on's and tested there (`node public_html/assets/apps/cadcraft/dev/addons/cabinet/test/test.mjs`, `node tools/cutlist/test.mjs`);
 * these tests are for what CabinetCraft adds: the catalog, the room/run layout, face frames and blind corners, materials, per-job sheets,
 * the estimate (placeholders), the checks, the drawings, the exports and the add-on through PartCraft's own loader.
 *   node public_html/assets/apps/partcraft/dev/addons/cabinetcraft/test/test.mjs [--verbose] [--only layout|room|corner|angled|drill|build|sheets|estimate|checks|drawings|edit|elements|fromroom|cadents|lang|part|bim|cad|model]
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ADDON = path.resolve(HERE, '..');
const APP = path.resolve(ADDON, '../..');
const ROOT = path.resolve(APP, '../../../../..');
const VERBOSE = process.argv.includes('--verbose');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const mine = (f) => import(pathToFileURL(path.join(ADDON, f)).href);
const app = (f) => import(pathToFileURL(path.join(APP, f)).href);
const EN = JSON.parse(fs.readFileSync(path.join(ADDON, 'lang/en.json'), 'utf8'));

let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const section = (s) => console.log('\n' + s);
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
globalThis.__ccTest = { ok, section, near, mine, app, ADDON, APP, ROOT, EN, VERBOSE };

// the engine tests (t-*.mjs, the same in every app's folder), then the tests of THIS app's host adapter (h-<slug>.mjs: sync.mjs copies the one for this app)
const hostTests = fs.readdirSync(HERE).filter((f) => /^h-[a-z]+\.mjs$/.test(f)).map((f) => f.slice(0, -4));
for (const part of ['layout', 'room', 'corner', 'angled', 'drill', 'build', 'edit', 'sheets', 'estimate', 'checks', 'drawings', 'viewport', 'nest', 'elements', 'fromroom', 'cadents', 'lang', ...hostTests]) {
  if (only && only !== part && !(only === 'addon' && part === 'h-part') && only !== part.replace(/^h-/, '')) continue;
  const f = part.startsWith('h-') ? part + '.mjs' : 't-' + part + '.mjs';
  if (!fs.existsSync(path.join(HERE, f))) continue;
  if ((part === 'sheets' || part === 'viewport') && !fs.existsSync(path.join(APP, 'cam-sheets.js'))) { console.log('\n(' + part + ': needs PartCraft\'s cam-sheets.js and addon-bodies.js; run in the PartCraft folder)'); continue; }   // the G-code and viewport tests are PartCraft's
  await import(pathToFileURL(path.join(HERE, f)).href);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
