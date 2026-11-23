/* SPDX-License-Identifier: Apache-2.0 */
// Every bundled BimCraft add-on (dev/addons/index.json) has a manifest the loader accepts for this app and API, its entry file and
// lang/en.json exist, the strings its code asks for (t('key')) are in its lang/en.json, and other languages only translate keys
// en.json has. Ported from the public bimcraft PR #18 (Rumi-3653), paths adapted to this repository.
//   node tools/bimcraft-test/addons-manifests-test.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const app = path.join(here, '../../public_html/assets/apps/bimcraft/dev');
const { checkManifest } = await import(pathToFileURL(path.join(app, 'addons.js')));
const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const apiVersion = fs.readFileSync(path.join(app, 'addons/bimcraft-api.js'), 'utf8').match(/BIMCRAFT_API_VERSION = '([\d.]+)'/)[1];
const dir = path.join(app, 'addons');
const ids = read(path.join(dir, 'index.json')).addons;
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
for (const id of ids) {
  let r;
  try { r = checkManifest(read(path.join(dir, id, 'addon.json')), { app: 'bimcraft', apiVersion }); } catch (e) { check(false, `${id}: addon.json: ${e.message}`); continue; }
  check(r.ok, `${id}: manifest refused: ${r.reason} ${r.detail}`);
  if (!r.ok) continue;
  check(fs.existsSync(path.join(dir, id, r.manifest.entry)), `${id}: entry ${r.manifest.entry} is missing`);
  if (!r.manifest.lang) continue;
  const lang = path.join(dir, id, r.manifest.lang);
  if (!fs.existsSync(path.join(lang, 'en.json'))) { check(false, `${id}: lang/en.json is missing`); continue; }
  const en = read(path.join(lang, 'en.json'));
  const code = fs.readFileSync(path.join(dir, id, r.manifest.entry), 'utf8');
  // literal keys only (t('a.' + x) is not checked), and only where t is api.t itself: add-ons that wrap it (setT) have strings of their own
  if (!/\bsetT\(/.test(code)) for (const [, key] of code.matchAll(/\bt\('([^']+)'\s*[,)]/g)) check(key in en, `${id}: t('${key}') is not in lang/en.json`);
  for (const f of fs.readdirSync(lang)) {
    if (f === 'en.json' || !f.endsWith('.json')) continue;
    for (const key of Object.keys(read(path.join(lang, f)))) check(key.startsWith('@') || key in en, `${id}: ${f} has "${key}", en.json does not`);
  }
}
for (const m of fails) console.log('  FAIL ' + m);
console.log(`addons: ${ids.length - new Set(fails.map((m) => m.split(':')[0])).size} of ${ids.length} add-ons ok (API ${apiVersion}), ${fails.length} problem(s)`);
process.exit(fails.length ? 1 : 0);
