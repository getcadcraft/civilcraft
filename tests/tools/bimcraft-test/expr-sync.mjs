/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/expr-sync.mjs [--check]` (0.6 DC.114, session bim-families_PART_2; owner 2026-10-18: "full yes"):
 * BimCraft's family parameters use PartCraft's expression language. PartCraft stays canonical (`partcraft/dev/expr.js`, which
 * imports only `./i18n.js`, a file every build carries); this copies it byte for byte into `bimcraft/dev/expr.js` and copies
 * its `expr.*` words from PartCraft's language files into BimCraft's (en, es-MX, id; only `expr.*` keys are touched).
 * `--check` fails when the copy or a word differs. Run it after PartCraft's expr.js or its `expr.*` words change; never edit
 * the copy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const FROM = path.join(APPS, 'partcraft/dev'), TO = path.join(APPS, 'bimcraft/dev');
const check = process.argv.includes('--check');
let bad = 0;

const src = fs.readFileSync(path.join(FROM, 'expr.js'));
const imports = [...src.toString('utf8').matchAll(/^\s*import\s[^;]*from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
if (imports.some((x) => x !== './i18n.js')) { console.error('partcraft/dev/expr.js imports ' + imports.join(', ') + ': BimCraft copies it only while it imports ./i18n.js alone'); process.exit(1); }
const dst = path.join(TO, 'expr.js');
const have = fs.existsSync(dst) ? fs.readFileSync(dst) : null;
if (have && Buffer.compare(have, src) === 0) console.log('same   expr.js = partcraft/dev/expr.js');
else if (check) { console.error('DIFFERS bimcraft/dev/expr.js is not partcraft/dev/expr.js: run node tools/bimcraft-test/expr-sync.mjs'); bad++; }
else { fs.writeFileSync(dst, src); console.log('wrote  expr.js from partcraft/dev/expr.js'); }

for (const loc of ['en', 'es-MX', 'id']) {
  const pf = path.join(FROM, 'lang', loc + '.json'), bf = path.join(TO, 'lang', loc + '.json');
  if (!fs.existsSync(pf) || !fs.existsSync(bf)) continue;
  const P = JSON.parse(fs.readFileSync(pf, 'utf8')), B = JSON.parse(fs.readFileSync(bf, 'utf8'));
  const keys = Object.keys(P).filter((k) => k.startsWith('expr.'));
  const differ = keys.filter((k) => JSON.stringify(B[k]) !== JSON.stringify(P[k]));
  if (!differ.length) { console.log('same   lang/' + loc + '.json expr.* (' + keys.length + ')'); continue; }
  if (check) { console.error('DIFFERS lang/' + loc + '.json: ' + differ.length + ' expr.* words'); bad++; continue; }
  for (const k of keys) B[k] = P[k];
  fs.writeFileSync(bf, JSON.stringify(B, null, 2) + '\n');
  console.log('wrote  lang/' + loc + '.json expr.* (' + differ.length + ')');
}
process.exit(bad ? 1 : 0);
