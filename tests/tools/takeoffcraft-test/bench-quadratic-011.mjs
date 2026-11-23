#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bench-quadratic-011.mjs — PERF.76 (0.11 `code-shared-11`): TakeoffCraft's clipboard looked each copied item up in the whole item list
 * (copied x items), and Live's reorder op searched two lists with includes() (n x n).
 *   nice -n 10 node tools/takeoffcraft-test/bench-quadratic-011.mjs [--items 20000]
 * RESULT lines (JSON): milliseconds and a hash of what was produced, so before/after runs compare for equal output.
 * The reorder case runs the old and the new expression of live.js `walk` side by side on the same arrays (the function is private).
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = +arg('--items', 20000);
const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { copyItems, copyMarks } = await import(pathToFileURL(path.join(APP, 'clipboard.js')));
const hash = (s) => crypto.createHash('sha256').update(typeof s === 'string' ? s : JSON.stringify(s)).digest('hex').slice(0, 16);
const out = (o) => console.log('RESULT ' + JSON.stringify({ ...o, load: os.loadavg()[0].toFixed(2) }));
const items = [], marks = [];
for (let i = 0; i < N; i++) { items.push({ id: 'i' + i, name: 'Item ' + i, kind: 'count', unit: 'ea' }); marks.push({ id: 'm' + i, item: 'i' + ((i * 7919) % N), kind: 'count', sheet: 's1', pts: [{ x: i, y: i }] }); }
const state = { items, marks, sheets: [], assemblies: [] };
const ids = items.map((i) => i.id).reverse();
let t0 = performance.now();
const a = copyItems(state, ids, { now: 1 });
out({ case: 'copyItems', items: N, ms: Math.round(performance.now() - t0), hash: hash(a?.items?.length + ':' + hash(a?.items || [])) });
t0 = performance.now();
let b = null; try { b = copyMarks(state, marks.map((m) => m.id), { now: 1, source: 'x' }); } catch (e) { b = { error: String(e.message) }; }
out({ case: 'copyMarks', marks: N, ms: Math.round(performance.now() - t0), hash: hash(b?.items ? b.items : b) });

// live.js walk 'ord' (old text vs new text)
const list0 = Array.from({ length: N }, (_, i) => 'x' + i), v = list0.slice().reverse().filter((_, i) => i % 9);
const oldOrd = (list, v) => { const next = v.filter((id) => list.includes(id)); for (const id of list) if (!next.includes(id)) next.push(id); list.splice(0, list.length, ...next); return list; };
const newOrd = (list, v) => { const have = new Set(list), next = v.filter((id) => have.has(id)), put = new Set(next); for (const id of list) if (!put.has(id)) { next.push(id); put.add(id); } list.splice(0, list.length, ...next); return list; };
t0 = performance.now(); const o1 = oldOrd(list0.slice(), v); const msOld = Math.round(performance.now() - t0);
t0 = performance.now(); const o2 = newOrd(list0.slice(), v); const msNew = Math.round(performance.now() - t0);
out({ case: 'live-ord (old text / new text)', n: N, msOld, msNew, same: hash(o1) === hash(o2) });
