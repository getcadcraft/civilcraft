#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-mount.mjs — the check each app's owner runs after mounting cc-nurbs (0.8 SU.747b; ModelCraft: `model-08`, PartCraft:
 * `engineer`). It loads the app's own copy (dev/nurbs/), runs one command of each family through the copy, checks every key the
 * library can show is in the app's en.json and es-MX.json, and — once the app has mounted it — that a dev file imports
 * ./nurbs/index.js and the app's Problems source uses the continuity problems.
 *
 *   node tools/nurbs/test-mount.mjs <modelcraft|partcraft> [--before-mount]
 *   --before-mount  skip the "is it mounted" checks (copy + words only)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NURBS_KEYS } from './lang.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const app = process.argv[2];
const BEFORE = process.argv.includes('--before-mount');
if (!['modelcraft', 'partcraft'].includes(app)) { console.error('name the app: modelcraft | partcraft'); process.exit(2); }
const DEV = path.join(ROOT, 'public_html/assets/apps', app, 'dev');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };

const N = await import(pathToFileURL(path.join(DEV, 'nurbs/index.js')).href);
let d = N.doc.newDoc();
const r1 = N.tools.run(d, 'curve.points', { points: [[0, 0, 0], [5, 0, 1], [10, 0, 0]] }); d = r1.doc;
const r2 = N.tools.run(d, 'curve.points', { points: [[0, 10, 0], [5, 10, -1], [10, 10, 0]] }); d = r2.doc;
const r3 = N.tools.run(d, 'surface.loft', { curves: [r1.ids[0], r2.ids[0]] }); d = r3.doc;
const p = N.tools.panel(d);
ok(p.items.length === 3 && Array.isArray(p.edges) && Array.isArray(p.problems), app + ': the copy runs commands and builds the panel');
const st = N.step.readStep(N.step.writeStep(d));
ok(st.items.length === 3, app + ': the copy writes and reads STEP');

for (const f of ['en.json', 'es-MX.json']) {
  const lang = JSON.parse(fs.readFileSync(path.join(DEV, 'lang', f), 'utf8'));
  const missing = Object.keys(NURBS_KEYS).filter((k) => !(k in lang) && !(f !== 'en.json' && NURBS_KEYS[k][2] === null));   // null: English only for now (0.9 rule 57; the app falls back to English)
  ok(!missing.length, app + ' ' + f + ': every nurbs.* key (run node tools/nurbs/lang.mjs ' + app + ')', missing.length + ' missing, e.g. ' + missing.slice(0, 3).join(', '));
}
if (!BEFORE) {
  const files = fs.readdirSync(DEV).filter((n) => n.endsWith('.js'));
  const importer = files.find((n) => /from '\.\/nurbs\/index\.js'/.test(fs.readFileSync(path.join(DEV, n), 'utf8')));
  ok(!!importer, app + ': a dev file imports ./nurbs/index.js', importer || 'none');
  const usesProblems = files.some((n) => /continuity\(|nurbs\.continuity|tools\.panel\(/.test(fs.readFileSync(path.join(DEV, n), 'utf8')) && /ccProblems|problems/.test(fs.readFileSync(path.join(DEV, n), 'utf8')));
  ok(usesProblems, app + ': continuity problems go to the shell Problems store (rule 29)');
}
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
