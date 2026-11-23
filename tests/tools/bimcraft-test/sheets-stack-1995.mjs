#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sheets-stack-1995.mjs — #1995 (2): "The sheets could not be drawn: Maximum call stack size exceeded". A section of a structural model with
 * rebar sees a very large number of lines; res-sheets.js put a view's items on its sheet with push(...items), and a call takes only so many
 * arguments. Old file (fixtures-1995/res-sheets-before.mjs) against the new: with 200,000 lines the old throws that RangeError and the new makes
 * the set; with 5,000 lines (and with a real-looking set) both give the same sheets.   node tools/bimcraft-test/sheets-stack-1995.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const APP = '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/bimcraft/dev';
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const NEW = await import(path.join(APP, 'res-sheets.js'));
const OLD = await import(new URL('./fixtures-1995/res-sheets-before.mjs', import.meta.url).href);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
let s = 7; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const sectionInput = (n) => {
  const lines = []; for (let i = 0; i < n; i++) { const x = rnd() * 40000, y = rnd() * 12000; lines.push([x, y, x + rnd() * 30 + 1, y + rnd() * 3000 + 1]); }
  const view = { bounds: { x0: 0, y0: 0, x1: 41000, y1: 15500 }, lines, cuts: [], notes: [], warnings: [], scale: 50 };
  return { plans: [], rcps: [], elevations: [], sections: [{ ref: 'S1', title: 'Section A', view }], schedules: [], framing: [], interiors: [] };
};
const opts = { paper: 'a3', units: 'mm', project: 'Stack test', date: '2026-11-21', strip: [] };
for (const n of [5000, 200000]) {
  let a = null, ea = null, b = null, eb = null;
  try { a = OLD.buildSet(sectionInput((s = 7, n)), opts); } catch (e) { ea = e; }
  try { b = NEW.buildSet(sectionInput((s = 7, n)), opts); } catch (e) { eb = e; }
  const items = (set) => (set || []).reduce((t, sh) => t + (sh.items?.length || 0), 0);
  console.log(`${n} lines in the section: before ${ea ? 'threw ' + ea.constructor.name + ': ' + ea.message : items(a) + ' items'}, now ${eb ? 'threw ' + eb.message : items(b) + ' items on ' + b.length + ' sheets'}`);
  ok(!eb && b.length > 0, n + ' lines: the new code makes the set');
  if (n === 5000) ok(!ea && JSON.stringify(a) === JSON.stringify(b), '5,000 lines: the same sheets before and after');
  if (n === 200000) ok(ea instanceof RangeError && /call stack/i.test(ea.message), '200,000 lines: the old code threw "Maximum call stack size exceeded" (the report)', ea && ea.message);
  if (n === 200000 && !eb) { const lines = b.reduce((t, sh) => t + (sh.items || []).filter((x) => x.t === 'line').length, 0); ok(lines >= n, 'every line is on the sheet (' + lines + ')'); }
}
console.log(`sheets stack (#1995): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
