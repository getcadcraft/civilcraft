#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** prices.mjs — 0.8 EG.68 (session takeoff_PART_2): price memory from your own jobs, without a browser. node tools/takeoffcraft-test/prices.mjs [--build dev] [--verbose] */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2), VERBOSE = args.includes('--verbose');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft', args.includes('--build') ? args[args.indexOf('--build') + 1] : 'dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const P = await load('prices.js'), M = await load('model.js'), Lr = await load('learn.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
const section = (s) => console.log('\n' + s);

const job = (plans, items) => {                       // a takeoff of `plans` (file hashes) with priced items, each used by a mark
  const m = new M.Takeoff();
  for (const h of plans) m.addFile({ hash: h, name: h + '.pdf', size: 1, pages: 1 });
  for (const it of items) { const id = m.addItem(it); if (it.type !== 'fixed') m.addMark({ item: id, sheet: plans[0] + ':0', pts: it.type === 'count' ? [[1, 1]] : it.type === 'area' ? [[0, 0], [10, 0], [10, 10], [0, 10]] : [[1, 1], [10, 1]], kind: it.type }); }
  return m.state;
};
const A = job(['a'.repeat(64)], [{ name: '2x4 stud, 8 ft', type: 'count', mat: 38500, lab: 12000 }, { name: 'Drywall 5/8"', type: 'area', mat: 8200, lab: 6100 }, { name: 'Unpriced thing', type: 'count' }]);
const B = job(['b'.repeat(64)], [{ name: '2x4 STUD 8 ft', type: 'count', mat: 41000, lab: 12500 }, { name: 'Drywall 5/8"', type: 'area', mat: 8800, lab: 6100 }]);
const C = job(['c'.repeat(64)], [{ name: '2x4 stud 8 ft', type: 'count', mat: 36000, lab: 13000 }]);
const kA = Lr.jobKey(A), kB = Lr.jobKey(B), kC = Lr.jobKey(C);

section('Remembering');
eq(P.keyOf('  2x4 STUD,  8 ft '), '2x4 stud 8 ft', 'a name is kept as lower-case words');
let s = P.emptyStore();
let r = P.recordJob(s, A, kA, '2026-01-01T00:00:00Z');
eq([r.seen, r.changed, Object.keys(r.store.names).length], [2, 2, 2], 'priced, used items are remembered; an unpriced one is not');
s = r.store;
r = P.recordJob(s, A, kA, '2026-01-02T00:00:00Z');
eq(r.changed, 0, 'saving the same job again changes nothing');
s = P.recordJob(s, B, kB, '2026-02-01T00:00:00Z').store;
s = P.recordJob(s, C, kC, '2026-03-01T00:00:00Z').store;
const stud = s.names[P.keyOf('2x4 stud 8 ft')];
eq(stud.obs.map((o) => o.mat), [38500, 41000, 36000], 'three jobs: the same name in any case is one entry, oldest first');
{
  const A2 = job(['a'.repeat(64)], [{ name: '2x4 stud, 8 ft', type: 'count', mat: 39000, lab: 12000 }]);
  const r2 = P.recordJob(s, A2, kA, '2026-04-01T00:00:00Z');
  eq(r2.store.names[P.keyOf('2x4 stud 8 ft')].obs.map((o) => o.mat), [41000, 36000, 39000], 'a job saved again with a new price replaces its own old one');
}
ok(P.recordJob(s, job([], [{ name: 'x', type: 'count', mat: 1 }]), '', 'x').seen === 0, 'no plan files = not a job yet: nothing remembered');
{
  let big = s;
  for (let i = 0; i < 15; i++) big = P.recordJob(big, job(['d'.repeat(63) + i.toString(16)], [{ name: 'Rebar', type: 'linear', mat: 100 + i, lab: 1 }]), Lr.jobKey(job(['d'.repeat(63) + i.toString(16)], [])), '2027-01-' + String(i + 1).padStart(2, '0')).store;
  eq([big.names.rebar.obs.length, big.names.rebar.obs[0].mat], [12, 103], 'at most the last 12 jobs are kept');
}
ok(P.recordJob({ ...s, off: true }, A, kA).changed === 0, 'switched off: nothing is remembered');

section('What it says');
const st = P.statsOf(stud);
eq([st.last.mat, st.median.mat, st.min, st.max, st.jobs], [36000, 38500, 49000, 53500, 3], 'last, typical (median), the range of the unit price and the number of jobs');
{
  const items = [{ id: 'i1', name: '2x4 Stud 8 ft', type: 'count', unit: 'EA', mat: 0, lab: 0, waste: 0 }, { id: 'i2', name: 'Drywall 5/8"', type: 'area', unit: 'SF', mat: 100, lab: 100, waste: 0 }, { id: 'i3', name: '2x4 stud', type: 'count', unit: 'EA', mat: 0, lab: 0, waste: 0 }, { id: 'i4', name: 'Novel', type: 'count', unit: 'EA', mat: 0, lab: 0, waste: 0 }, { id: 'i5', name: '2x4 stud 8 ft', type: 'linear', unit: 'LF', mat: 0, lab: 0, waste: 0 }];
  const f = P.find(s, items[2]);
  ok(!f.exact && f.similar.length === 1 && f.similar[0].name.startsWith('2x4'), 'a name that is part of a remembered one is offered as similar, never as exact');
  ok(!P.find(s, items[4]).exact, 'the same words for another type of item are not the same price');
  const pl = P.plan(s, items, {});
  eq(pl.map((x) => x.id), ['i1'], 'only unpriced items with an exact name are priced by default');
  eq(pl[0].patch, { mat: 36000, lab: 13000 }, 'from the last job');
  eq(P.plan(s, items, { mode: 'median' })[0].patch, { mat: 38500, lab: 12500 }, 'or from the typical rates');
  eq(P.plan(s, items, { only: 'all' }).map((x) => x.id).sort(), ['i1', 'i2'], 'all = priced items too (the Drywall has remembered rates)');
  eq(P.plan(s, items, { similar: true }).map((x) => x.id).sort(), ['i1', 'i3'], 'similar names are used only when asked');
  const un = P.plan(s, [{ ...items[0], unit: 'LF', type: 'count' }], {});
  ok(un.length === 0 && un.skipped.length === 1, 'a price remembered per EA is not put on an item per LF (and is reported)');
}

section('Storage and safety');
{
  const back = P.readStore(JSON.parse(JSON.stringify(s)));
  eq(back, s, 'the list reads back the same');
  eq(P.readStore({ v: 2, names: {} }), P.emptyStore(), 'a newer version is ignored, not misread');
  const evil = P.readStore({ v: 1, names: { x: { name: 'x', type: 'count', obs: [{ job: 'j' + '0'.repeat(16), mat: -5, lab: 'a' }] }, ' ': { name: ' ', type: 'count', obs: [] }, '<b>': { name: '<b>', type: 'weird', obs: [] } } });
  eq(Object.keys(evil.names), [], 'junk in storage (negative or text rates, a made-up type, no observations) is dropped');
  ok(P.readStore({ v: 1, names: { a: { name: 'a‮b\u0000c', type: 'count', obs: [{ job: kA, mat: 1, lab: 0 }] } } }).names['a b c'] === undefined, 'a name must equal its own key (a forged one is dropped)');
  eq(Object.keys(P.forget(s, P.keyOf('2x4 stud 8 ft')).names), [P.keyOf('Drywall 5/8"')], 'forget one name');
  eq(P.count(P.clear({ ...s, off: true })), 0, 'clear all');
  ok(P.clear({ ...s, off: true }).off === true, 'clearing keeps the switch');
}
section('The owner\'s rule (35)');
for (const f of ['prices.js', 'prices-ui.js']) {
  const src = fs.readFileSync(path.join(APP, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|onnx|tensorflow/i.test(src), f + ': no network call, no model');
}
ok(!/innerHTML|insertAdjacentHTML/.test(fs.readFileSync(path.join(APP, 'prices-ui.js'), 'utf8')), 'item names reach the page only as text');
const en = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
ok(!Object.entries(en).some(([k, v]) => /^eg68\./.test(k) && /\bAI\b|machine learning|artificial/i.test(JSON.stringify(v))), 'the copy never says the app has AI built in');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
