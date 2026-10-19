/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node tools/bimcraft-test/res-lang.mjs [--check]` — writes the residential tools' words (res-strings.mjs) into BimCraft's
 * dev lang/en.json: every existing `"res.…"` line is taken out and the current set goes in before the closing brace. No
 * other line is touched, so sessions editing their own keys beside it are safe. --check: exit 1 when the file is not up to
 * date.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/lang/en.json');
const words = (await import('./res-strings.mjs')).default;
const text = fs.readFileSync(FILE, 'utf8');
const lines = text.replace(/\s+$/, '').split('\n');
if (lines[lines.length - 1] !== '}') { console.error('en.json does not end with "}"'); process.exit(2); }
const keep = lines.slice(0, -1).filter((l) => !/^\s*"res\./.test(l));
// the last kept line needs a comma
keep[keep.length - 1] = keep[keep.length - 1].replace(/,?\s*$/, ',');
const add = Object.entries(words).map(([k, v]) => '  ' + JSON.stringify(k) + ': ' + JSON.stringify(v) + ',');
add[add.length - 1] = add[add.length - 1].replace(/,$/, '');
const out = [...keep, ...add, '}'].join('\n') + '\n';
JSON.parse(out);
// up to date = every res.* key there with its words and no other res.* key, wherever the block sits (families-lang.mjs also
// puts its block last, so the order of the two depends on which ran last; neither check looks at it)
const J = JSON.parse(text), resKeys = Object.keys(J).filter((k) => k.startsWith('res.'));
const same = Object.entries(words).every(([k, v]) => J[k] === v) && resKeys.length === Object.keys(words).length;
if (process.argv.includes('--check')) { if (!same) { console.error('lang/en.json: res.* keys not up to date (run node tools/bimcraft-test/res-lang.mjs)'); process.exit(1); } console.log('res.* keys up to date (' + add.length + ')'); process.exit(0); }
if (!same) fs.writeFileSync(FILE, out);   // nothing moves when the words are already there
console.log('wrote ' + add.length + ' res.* keys');
