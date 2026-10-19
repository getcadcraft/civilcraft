#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-lengths.mjs — CivilCraft 0.6 DF.3: arithmetic wherever a length is typed (units.js readLength over the
 * lencalc.js copy), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-lengths.mjs [--build dev|x.y] [--verbose]
 *
 * By hand, in a feet and a metre project: plain numbers, lengths with their own marks (12'6", 12' 6 1/2", 12'-6", 6", 3 ft 6 in,
 * 4 7/16, 4-7/16, 450 mm, 1.2 m), the sums Jame and DF.3 name (4+7/16, 12'6" + 3/4", (24'-0")/3, 2*450mm), a dash with
 * spaces subtracts (24' - 6" = 23'-6"), signs, functions; refusals with the character (4+, (3, 10/0, 2'*3', abc); stations are
 * not read here; the lencalc.js copy is byte-identical to CadCraft's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const U = await mod('units.js');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + msg); } else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); } };
const head = (s) => console.log('== ' + s);
const is = (text, unit, want) => { const r = U.readLength(text, unit); ok(r.ok && Math.abs(r.value - want) < 1e-12, JSON.stringify(text) + ' (' + unit + ') = ' + want, r); };
const refuses = (text, unit, re) => { const r = U.readLength(text, unit); ok(!r.ok && re.test(r.error), JSON.stringify(text) + ' refused: ' + r.error, r); };

head('one length');
is('12.5', 'ft', 12.5); is('-3', 'ft', -3); is('+3', 'ft', 3); is('1e2', 'm', 100);
is(`12'6"`, 'ft', 12.5); is(`12' 6 1/2"`, 'ft', 12 + 6.5 / 12); is(`12'-6"`, 'ft', 12.5); is('6"', 'ft', 0.5); is('3 ft 6 in', 'ft', 3.5);
is('4 7/16', 'ft', 4.4375); is('4-7/16', 'ft', 4.4375); is('7/16', 'ft', 0.4375); is('1,234.5', 'ft', 1234.5);
is('450 mm', 'm', 0.45); is('1.2m', 'm', 1.2); is('90 cm', 'm', 0.9); is('6"', 'm', 0.1524); is(`1'`, 'm', 0.3048);
is('1 m', 'ft', 1 / 0.3048); is('-6"', 'ft', -0.5);

head('sums (DF.3)');
is('4+7/16', 'ft', 4.4375); is(`12'6" + 3/4"`, 'ft', 12.5 + 0.75 / 12); is(`(24'-0")/3`, 'ft', 8); is('2*450mm', 'm', 0.9);
is(`24' - 6"`, 'ft', 23.5); is('10 + 2.5', 'm', 12.5); is('100.25-0.5', 'ft', 99.75); is('2*(3+4)', 'ft', 14); is('round(2.6)', 'ft', 3);
is('12 × 2 ÷ 4', 'ft', 6); is('3 − 1', 'ft', 2);

head('refusals');
refuses('4+', 'ft', /ends too soon \(character 3\)/); refuses('(3', 'ft', /bracket is not closed/); refuses('10/0', 'ft', /Division by zero/);
refuses(`2'*3'`, 'ft', /area/); refuses('abc', 'ft', /Can't read "abc"/); refuses('', 'ft', /Can't read/); refuses('4 + hello', 'ft', /not a length|Can't read/);

head('the copy');
const CANON = path.join(REPO, 'public_html/assets/apps/cadcraft/dev/lencalc.js');   // not in CivilCraft's public repo: skipped there
if (fs.existsSync(CANON)) ok(fs.readFileSync(path.join(APP, 'lencalc.js')).equals(fs.readFileSync(CANON)), 'lencalc.js is byte-identical to CadCraft\'s (tools/lencalc/sync.mjs)');
ok(U.parseStation('10+00', 'ft') === 1000 && U.parseStation('1+234.5', 'm') === 1234.5, 'stations stay stations (parseStation; the station boxes never do sums)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
