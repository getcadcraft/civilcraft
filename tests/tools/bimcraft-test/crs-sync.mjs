#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-sync.mjs — BimCraft's copy of CivilCraft's coordinate systems (0.5 WL.4: latitude and longitude of a picked point).
 * CivilCraft's `crs.js` and its catalog `crs-db.json` are canonical; BimCraft ships byte-identical copies (an app's build
 * never imports another app's folder). The words crs.js shows come from BimCraft's own language file, so every `crs.*`
 * key crs.js uses is copied into bimcraft/dev/lang/en.json when it is missing there.
 *   node tools/bimcraft-test/crs-sync.mjs           copy (files and missing keys)
 *   node tools/bimcraft-test/crs-sync.mjs --check   exit 1 when a copy differs or a key is missing (the BimCraft test runs it)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FROM = path.join(REPO, 'public_html/assets/apps/civilcraft/dev'), TO = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
const FILES = ['crs.js', 'crs-db.json'];
const check = process.argv.includes('--check');
const problems = [];

for (const f of FILES) {
  const a = fs.readFileSync(path.join(FROM, f)), dst = path.join(TO, f);
  const same = fs.existsSync(dst) && Buffer.compare(a, fs.readFileSync(dst)) === 0;
  if (same) continue;
  if (check) problems.push(f + ' differs from civilcraft/dev/' + f);
  else { fs.writeFileSync(dst, a); console.log('copied ' + f); }
}

const keys = [...new Set([...fs.readFileSync(path.join(FROM, 'crs.js'), 'utf8').matchAll(/\bt\('([a-z0-9.]+)'/g)].map((m) => m[1]))];
const civ = JSON.parse(fs.readFileSync(path.join(FROM, 'lang/en.json'), 'utf8'));
const bimFile = path.join(TO, 'lang/en.json');
let text = fs.readFileSync(bimFile, 'utf8');
const bim = JSON.parse(text);
const missing = keys.filter((k) => !(k in bim) && k in civ);
if (missing.length) {
  if (check) problems.push('bimcraft lang/en.json lacks ' + missing.join(', '));
  else {
    // append before the closing brace, keeping the file's own layout
    const add = missing.map((k) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(civ[k])).join(',\n');
    text = text.replace(/\n\}\s*$/, ',\n' + add + '\n}\n');
    JSON.parse(text);
    fs.writeFileSync(bimFile, text);
    console.log('added ' + missing.length + ' key(s) to bimcraft lang/en.json');
  }
}
if (check) {
  if (problems.length) { for (const p of problems) console.log('  FAIL ' + p); process.exit(1); }
  console.log('crs copies in step');
}
