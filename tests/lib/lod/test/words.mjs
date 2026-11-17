// SPDX-License-Identifier: Apache-2.0
// node lib/lod/test/words.mjs [--write]: public_html/assets/apps/bimcraft/dev/lod/lang.en.json is the English of lod-words.js, as the host's
// language file takes it (bim-core-10 merges it into lang/en.json; es-MX and the rest go through lang-10). Without --write it only checks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/bimcraft/dev/lod');
const { EN } = await import(path.join(DIR, 'lod-words.js'));
const out = JSON.stringify(EN, null, 2) + '\n', file = path.join(DIR, 'lang.en.json');
if (process.argv.includes('--write')) { fs.writeFileSync(file, out); console.log('wrote ' + Object.keys(EN).length + ' keys'); process.exit(0); }
const same = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === out;
// every key must be new to the host's file (no clash), and every {var} in a sentence must be a word
const host = JSON.parse(fs.readFileSync(path.join(DIR, '../lang/en.json'), 'utf8'));
const clash = Object.keys(EN).filter((k) => k in host);
console.log(same ? 'lang.en.json is current (' + Object.keys(EN).length + ' keys)' : 'lang.en.json is OUT OF DATE: run with --write');
console.log(clash.length ? 'KEYS ALREADY IN lang/en.json: ' + clash.join(', ') : 'no key clashes with lang/en.json');
process.exit(same && !clash.length ? 0 : 1);
