#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * terrain-sync.mjs — CivilCraft's surface engine and grid reader in BimCraft (0.5 part 4 RC.10, session bim-residential),
 * as SG.1 shares its LAS reader (tools/pointcloud/sync.mjs). An app's build never imports another app's folder, so BimCraft
 * carries byte-identical copies:
 *   civilcraft/dev/tin.js, raster.js → bimcraft/dev   (canonical in CivilCraft; terrain.js, crs.js, las.js are pointcloud/sync.mjs's)
 * The words they show: every key they use that BimCraft's language file lacks is copied from CivilCraft's en.json, with
 * "CivilCraft" in the text turned into "BimCraft", with its translator note. BimCraft's manifest maps the libraries they
 * import (delaunator, robust-predicates, geotiff — CivilCraft's vendored versions).
 *
 *   node tools/bimcraft-test/terrain-sync.mjs           copy the files and the missing keys
 *   node tools/bimcraft-test/terrain-sync.mjs --check   exit 1 when a copy differs or a key is missing (bin/test-bimcraft.mjs --res runs it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dev = (app, f = '') => path.join(REPO, 'public_html/assets/apps', app, 'dev', f);
const FILES = ['tin.js', 'raster.js'];
const LIBS = ['delaunator', 'robust-predicates', 'geotiff'];
const check = process.argv.includes('--check');
const problems = [];
for (const f of FILES) {
  const want = fs.readFileSync(dev('civilcraft', f));
  const dst = dev('bimcraft', f);
  if (fs.existsSync(dst) && fs.readFileSync(dst).equals(want)) continue;
  if (check) problems.push('bimcraft/dev/' + f + ' differs from civilcraft/dev/' + f);
  else { fs.writeFileSync(dst, want); console.log('copied civilcraft/dev/' + f + ' → bimcraft/dev/'); }
}
// the libraries they import, as CivilCraft maps them
const cm = JSON.parse(fs.readFileSync(dev('civilcraft', 'manifest.json'), 'utf8')), bmFile = dev('bimcraft', 'manifest.json');
const bm = JSON.parse(fs.readFileSync(bmFile, 'utf8'));
const lack = LIBS.filter((l) => bm.imports?.[l] !== cm.imports[l]);
if (lack.length) {
  if (check) problems.push('bimcraft/dev/manifest.json lacks ' + lack.join(', '));
  else { for (const l of lack) bm.imports[l] = cm.imports[l]; fs.writeFileSync(bmFile, JSON.stringify(bm, null, 2) + '\n'); console.log('mapped ' + lack.join(', ') + ' in bimcraft/dev/manifest.json'); }
}
// language keys
const civ = JSON.parse(fs.readFileSync(dev('civilcraft', 'lang/en.json'), 'utf8'));
const file = dev('bimcraft', 'lang/en.json');
let text = fs.readFileSync(file, 'utf8');
const have = JSON.parse(text);
for (const [k, v] of Object.entries(have)) if (v === '[object Object]') problems.push('bimcraft/dev/lang/en.json: ' + k + ' is "[object Object]" (re-copy it from CivilCraft)');
const keys = [...new Set(FILES.flatMap((f) => [...fs.readFileSync(dev('bimcraft', f), 'utf8').matchAll(/['"]([a-z][a-z0-9_-]*(?:\.[a-z0-9_-]+)+)['"]/g)].map((m) => m[1])))].filter((k) => k in civ && !(k in have));
if (keys.length) {
  if (check) problems.push('bimcraft/dev/lang/en.json lacks ' + keys.join(', '));
  else {
    // a plural is an object of forms: rename inside each (String() of it wrote "[object Object]" before the final sweep)
    const rename = (s) => (s && typeof s === 'object' ? Object.fromEntries(Object.entries(s).map(([f, v]) => [f, rename(v)])) : String(s).replace(/\bCivilCraft\b/g, 'BimCraft'));
    const add = keys.map((k) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(rename(civ[k])));
    const notes = keys.filter((k) => civ['@context']?.[k] && !(have['@context'] && k in have['@context'])).map((k) => '    ' + JSON.stringify(k) + ': ' + JSON.stringify(rename(civ['@context'][k])) + ',');
    // before the residential keys (res-lang.mjs keeps those last), else at the end
    const at = text.search(/\n\s*"res\./);
    text = at > 0 ? text.slice(0, at) + '\n' + add.join(',\n') + ',' + text.slice(at) : text.replace(/\n\}\s*$/, ',\n' + add.join(',\n') + '\n}\n');
    if (notes.length) text = text.replace(/("@context": \{\n)/, '$1' + notes.join('\n') + '\n');
    JSON.parse(text);
    fs.writeFileSync(file, text);
    console.log('added ' + add.length + ' key(s) to bimcraft/dev/lang/en.json');
  }
}
if (problems.length) { for (const p of problems) console.log('  FAIL ' + p); process.exit(1); }
if (check) console.log('terrain copies in step');
