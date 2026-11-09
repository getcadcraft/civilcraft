#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs — copies cc-ifcx (lib/ifcx/*.js + NOTICE; 0.9 SU.882) byte for byte into BimCraft (bimcraft/dev/ifcx/) and writes the
 * ifcx.* words (tools/ifcx/lang.mjs) into its lang/en.json and es-MX.json. Run it after every change to lib/ifcx — nobody edits a
 * copy; `--check` exits 1 while a copy or a word differs. Same shape as tools/usd/sync.mjs. Only BimCraft carries it.
 *
 *   node tools/ifcx/sync.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = path.join(ROOT, 'lib/ifcx');
const DST = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/ifcx');
export const FILES = ['index.js', 'util.js', 'parse.js', 'validate.js', 'compose.js', 'names.js', 'model.js', 'build.js', 'NOTICE'];
const check = process.argv.includes('--check');
let diff = 0;
const { EN, ES } = await import('./lang.mjs');
for (const [loc, table] of [['en', EN], ['es-MX', ES]]) {
  const file = path.join(DST, '..', 'lang', loc + '.json');
  const obj = JSON.parse(fs.readFileSync(file, 'utf8'));
  const stale = Object.keys(obj).filter((k) => k.startsWith('ifcx.') && !(k in table));
  if (!stale.length && Object.entries(table).every(([k, v]) => obj[k] === v)) continue;
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (!stale.includes(k)) out[k] = k in table ? table[k] : v;
  for (const [k, v] of Object.entries(table)) if (!(k in out)) out[k] = v;
  diff++;
  if (!check) fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  console.log(loc + '.json: ifcx.* words ' + (check ? 'differ' : 'written'));
}
const bad = [];
for (const f of FILES) {
  const dst = path.join(DST, f);
  if (!fs.existsSync(dst) || Buffer.compare(fs.readFileSync(path.join(LIB, f)), fs.readFileSync(dst)) !== 0) bad.push(f);
}
if (fs.existsSync(DST)) for (const f of fs.readdirSync(DST)) if (!FILES.includes(f)) bad.push(f + ' (stale)');
if (bad.length) {
  diff++;
  if (!check) {
    fs.mkdirSync(DST, { recursive: true });
    for (const f of bad) { if (f.endsWith('(stale)')) fs.unlinkSync(path.join(DST, f.replace(' (stale)', ''))); else fs.copyFileSync(path.join(LIB, f), path.join(DST, f)); }
  }
  console.log('bimcraft: ' + (check ? 'differs — ' : 'updated — ') + bad.join(', '));
} else console.log('bimcraft: ok (' + FILES.length + ' files)');
process.exit(check && diff ? 1 : 0);
