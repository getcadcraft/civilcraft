/* SPDX-License-Identifier: Apache-2.0 */
// `node tools/bimcraft-test/views09-lang.mjs [--check]` — writes ONLY views09-strings.mjs's keys into bimcraft/dev/lang/en.json and es-MX.json
// (session bim-views-09). Other keys and other locales are never touched; `--check` fails when one differs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EN, ES } from './views09-strings.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const LANG = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/lang');
const check = process.argv.includes('--check');
let bad = 0;
for (const [loc, words] of [['en', EN], ['es-MX', ES]]) {
  const f = path.join(LANG, loc + '.json'), J = JSON.parse(fs.readFileSync(f, 'utf8'));
  const differ = Object.keys(words).filter((k) => J[k] !== words[k]);
  if (!differ.length) { console.log('same   ' + loc + '.json (' + Object.keys(words).length + ')'); continue; }
  if (check) { console.error('DIFFERS ' + loc + '.json: ' + differ.length + ' words'); bad++; continue; }
  for (const k of differ) J[k] = words[k];
  fs.writeFileSync(f, JSON.stringify(J, null, 2) + '\n');
  console.log('wrote  ' + loc + '.json (' + differ.length + ')');
}
const missing = Object.keys(EN).filter((k) => !(k in ES));
if (missing.length) { console.error('es-MX lacks ' + missing.join(', ')); bad++; }
process.exit(bad ? 1 : 0);
