#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lang-add.mjs — add new keys to an app's lang/en.json and lang/es-MX.json (session discord-fixes, 0.6): each key goes in
 * just before the closing brace of the file, read and written in one step (the rest of the file is left as it is), and
 * @context notes into en.json's @context. Refuses a key that is already there with another text.
 *
 *   node tools/cadcraft-test/lang-add.mjs <app> <keys.json>     keys.json = { "en": {k: v}, "es-MX": {k: v}, "context": {k: note} }
 *   node tools/cadcraft-test/lang-add.mjs <app> <keys.json> --dir <folder with en.json>   (an add-on's lang folder)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [app, file, ...rest] = process.argv.slice(2);
if (!app || !file) { console.error('usage: lang-add.mjs <app> <keys.json> [--dir <lang folder>]'); process.exit(2); }
const di = rest.indexOf('--dir');
const DIR = di >= 0 ? path.resolve(rest[di + 1]) : path.join(ROOT, 'public_html/assets/apps', app, 'dev/lang');
const add = JSON.parse(fs.readFileSync(file, 'utf8'));
let problems = 0;
for (const loc of ['en', 'es-MX']) {
  const keys = add[loc] || {};
  if (!Object.keys(keys).length) continue;
  const p = path.join(DIR, loc + '.json');
  const text = fs.readFileSync(p, 'utf8');
  const cur = JSON.parse(text);
  const lines = [];
  for (const [k, v] of Object.entries(keys)) {
    if (k in cur) { if (JSON.stringify(cur[k]) !== JSON.stringify(v)) { console.error(`${loc}: ${k} is already there with other text`); problems++; } continue; }
    lines.push('  ' + JSON.stringify(k) + ': ' + JSON.stringify(v, null, 2).replace(/\n/g, '\n  '));
  }
  let out = text;
  if (lines.length) {
    const end = out.lastIndexOf('\n}');
    out = out.slice(0, end) + ',\n' + lines.join(',\n') + out.slice(end);
  }
  if (loc === 'en' && add.context && Object.keys(add.context).length) {
    const obj = JSON.parse(out);
    const ctx = obj['@context'] || {};
    const fresh = Object.entries(add.context).filter(([k]) => !(k in ctx));
    if (fresh.length) {
      const at = out.indexOf('"@context": {') + '"@context": {'.length;
      out = out.slice(0, at) + '\n' + fresh.map(([k, v]) => '    ' + JSON.stringify(k) + ': ' + JSON.stringify(v)).join(',\n') + ',' + out.slice(at);
    }
  }
  JSON.parse(out);   // still JSON
  if (out !== text) {
    if (fs.readFileSync(p, 'utf8') !== text) { console.error(`${loc}: changed while reading, run again`); process.exit(1); }
    fs.writeFileSync(p, out);
  }
  console.log(`${loc}: ${lines.length} keys added`);
}
process.exit(problems ? 1 : 0);
