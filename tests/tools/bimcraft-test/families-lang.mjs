/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/families-lang.mjs [--check]` (0.6 DC.114, session bim-families_PART_2): writes the family tools'
 * words into BimCraft's dev language files: families-strings.mjs → lang/en.json, families-strings-es.mjs (drafts) →
 * lang/es-MX.json. Every `fam.*` key is taken out and the current set goes in at the end; no other key is touched. --check:
 * exit 1 when a file is not up to date (its fam.* keys and words, in any order), or when a draft is missing for an English key.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LANG = path.resolve(HERE, '../../public_html/assets/apps/bimcraft/dev/lang');
const check = process.argv.includes('--check');
const en = (await import('./families-strings.mjs')).default;
const esFile = path.join(HERE, 'families-strings-es.mjs');
const es = fs.existsSync(esFile) ? (await import('./families-strings-es.mjs')).default : {};
let bad = 0;
for (const [loc, words] of [['en', en], ['es-MX', es]]) {
  const file = path.join(LANG, loc + '.json'), text = fs.readFileSync(file, 'utf8');
  const J = JSON.parse(text), out = {};
  for (const [k, v] of Object.entries(J)) if (!k.startsWith('fam.')) out[k] = v;
  for (const k of Object.keys(en)) if (words[k] !== undefined) out[k] = words[k];
  const next = JSON.stringify(out, null, 2) + '\n';
  const missing = Object.keys(en).filter((k) => words[k] === undefined);
  if (loc !== 'en' && missing.length) { console.error(loc + ': ' + missing.length + ' fam.* drafts missing (first ' + missing[0] + ')'); if (check) bad++; }
  // up to date = every fam.* key there with its words and no other fam.* key, wherever the block sits (res-lang.mjs puts its
  // own block last too, so the order of the two blocks depends on which ran last; neither check looks at it)
  const want = Object.keys(en).filter((k) => words[k] !== undefined);
  const same = want.every((k) => J[k] === words[k]) && Object.keys(J).filter((k) => k.startsWith('fam.')).length === want.length;
  if (check) { if (!same) { console.error('lang/' + loc + '.json: fam.* keys not up to date (run node tools/bimcraft-test/families-lang.mjs)'); bad++; } else console.log('fam.* keys up to date in ' + loc + ' (' + Object.keys(en).filter((k) => words[k] !== undefined).length + ')'); continue; }
  if (!same) fs.writeFileSync(file, next);   // nothing moves when the words are already there
  console.log('wrote ' + Object.keys(en).filter((k) => words[k] !== undefined).length + ' fam.* keys to ' + loc);
}
process.exit(bad ? 1 : 0);
