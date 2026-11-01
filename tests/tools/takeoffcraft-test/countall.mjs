#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * countall.mjs — 0.8 EG.67 (session takeoff_PART_2): the run over a set, without a browser.
 *
 *   node tools/takeoffcraft-test/countall.mjs [--build dev] [--verbose]
 *   node tools/takeoffcraft-test/countall.mjs --bench [--sheets 200] [--w 1700 --h 1100] [--parallel 3]   (heavy: workstation11a, rule 25)
 *
 * runCountAll over generated sheets (legend on sheet 1, a sheet at another scale, an empty sheet, a too-large sheet), the match level
 * moving without a new search, mix-ups, what accepting adds (an existing item is reused, a hand mark is not doubled), one undo step
 * for every item, parallel = serial, stop.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes('--' + n) ? args[args.indexOf('--' + n) + 1] : d);
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft', opt('build', 'dev')), VERBOSE = args.includes('--verbose');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await load('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const Lg = await load('legend.js'), Ca = await load('countall.js'), M = await load('model.js');

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
const section = (s) => console.log('\n' + s);

const canvas = (w, h) => ({ data: new Float32Array(w * h), w, h });
const put = (c, x, y, v) => { if (x >= 0 && y >= 0 && x < c.w && y < c.h) c.data[y * c.w + x] = Math.max(c.data[y * c.w + x], v); };
const px = (c, x, y, v = 1) => { const fx = Math.floor(x), fy = Math.floor(y), ax = x - fx, ay = y - fy; put(c, fx, fy, v * (1 - ax) * (1 - ay) * 1.6); put(c, fx + 1, fy, v * ax * (1 - ay) * 1.6); put(c, fx, fy + 1, v * (1 - ax) * ay * 1.6); put(c, fx + 1, fy + 1, v * ax * ay * 1.6); };
const line = (c, x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) * 2; for (let i = 0; i <= n; i++) px(c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
const ring = (c, cx, cy, r) => { for (let a = 0; a < 720; a++) px(c, cx + r * Math.cos(a * Math.PI / 360), cy + r * Math.sin(a * Math.PI / 360)); };
const rect = (c, x, y, w, h) => { line(c, x, y, x + w, y); line(c, x + w, y, x + w, y + h); line(c, x + w, y + h, x, y + h); line(c, x, y + h, x, y); };
const SYMS = {
  duplex: (c, x, y) => { ring(c, x + 9, y + 9, 8); line(c, x + 4, y + 9, x + 14, y + 9); },
  quad: (c, x, y) => { ring(c, x + 9, y + 9, 8); line(c, x + 4, y + 7, x + 14, y + 7); line(c, x + 4, y + 11, x + 14, y + 11); },
  light: (c, x, y) => { ring(c, x + 9, y + 9, 8); line(c, x + 3, y + 3, x + 15, y + 15); line(c, x + 15, y + 3, x + 3, y + 15); },
  switch: (c, x, y) => { rect(c, x + 3, y + 5, 12, 10); line(c, x + 9, y + 5, x + 9, y - 2); line(c, x + 5, y + 10, x + 13, y + 10); },
  panel: (c, x, y) => { for (let i = 0; i < 16; i++) line(c, x + 1, y + 1 + i, x + 17, y + 1 + i); },
  exit: (c, x, y) => { rect(c, x + 1, y + 2, 16, 14); line(c, x + 9, y + 4, x + 3, y + 14); line(c, x + 9, y + 4, x + 15, y + 14); line(c, x + 3, y + 14, x + 15, y + 14); },
};
const NAMES = Object.keys(SYMS);
const label = (text, x, y, h = 9) => ({ text, x0: x, y0: y, x1: x + text.length * 5.2, y1: y + h });
const inkText = (c, l) => { for (let x = Math.round(l.x0); x < l.x1; x += 2) for (let y = Math.round(l.y0) + 2; y < l.y1 - 1; y++) if ((x + y) % 3) put(c, x, y, 0.8); };
function legend() {
  const c = canvas(340, 260), labels = [];
  NAMES.forEach((n, i) => { const y = 30 + i * 30; SYMS[n](c, 12, y); labels.push(label(n.toUpperCase() + ' OUTLET', 50, y + 4)); });
  for (const l of labels) inkText(c, l);
  return Lg.readLegend(c, Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l }))));
}
function sheet(seed, counts, W = 900, H = 600) {
  let s = seed; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const c = canvas(W, H);
  for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * H; line(c, x, y, x + (rnd() - 0.5) * 300, y + (rnd() < 0.5 ? 0 : (rnd() - 0.5) * 200)); }
  rect(c, 20, 20, W - 40, H - 40);
  const spots = [];
  for (const [name, n] of Object.entries(counts)) for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = 40 + rnd() * (W - 100); y = 40 + rnd() * (H - 100); tries++; } while (spots.some((p) => Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30) && tries < 50);
    spots.push({ x, y, name }); SYMS[name](c, x, y);
  }
  return c;
}

const leg = legend();
const entries = leg.entries.map((e, i) => ({ id: 's' + (i + 1), name: e.label.replace(/ OUTLET$/, '').toLowerCase(), tpl: e.tpl, problem: e.problem, on: true }));
const idOf = (n) => entries.find((e) => e.name === n).id;
const W = 1;       // working scale: one px per display unit
// the set: sheet A holds the legend, B has symbols, C is empty, D is drawn at another scale (symbols twice as large on paper), E is too large
const SET = [
  { key: 'A:0', width: 900, height: 600, counts: { duplex: 2 } },
  { key: 'B:0', width: 900, height: 600, counts: { duplex: 5, light: 3 } },
  { key: 'C:0', width: 900, height: 600, counts: {} },
  { key: 'D:0', width: 450, height: 300, counts: { quad: 4, switch: 2, exit: 1 }, scale: 0.5 },     // ft per unit: half, so the working size is half
  { key: 'E:0', width: 9000, height: 6000, counts: {} },
];
const ft = { 'A:0': 0.1, 'B:0': 0.1, 'C:0': 0.1, 'D:0': 0.2, 'E:0': 0.1 };
const images = new Map();
const rasterize = async (sh, wt) => {
  if (sh.key === 'A:0') { const c = sheet(11, sh.counts); for (let y = 0; y < legendCanvas.h; y++) c.data.set(legendCanvas.data.subarray(y * legendCanvas.w, (y + 1) * legendCanvas.w), (y + 300) * c.w + 500); return { data: c.data.slice(), w: c.w, h: c.h }; }
  if (sh.key === 'D:0') { const base = sheet(13, sh.counts, 900, 600); return wt === 2 ? { data: new Float32Array(base.data), w: 900, h: 600 } : { data: new Float32Array(900 * 600), w: 900, h: 600 }; }   // drawn at 2: the symbols are the legend's size
  return sheet(sh.key.charCodeAt(0), sh.counts);
};
// the legend is drawn on sheet A at (500, 300)
const legendCanvas = (() => { const c = canvas(340, 260), labels = []; NAMES.forEach((n, i) => { const y = 30 + i * 30; SYMS[n](c, 12, y); labels.push(label(n.toUpperCase() + ' OUTLET', 50, y + 4)); }); for (const l of labels) inkText(c, l); return c; })();
const unit = (sh, wt) => (x, y) => ({ x: x / wt, y: y / wt });
const search = async (img, jobs) => Lg.searchSheet(img, jobs);

section('Counting a set');
const sheets = SET.map((s) => ({ key: s.key, width: s.width, height: s.height, counts: s.counts }));
let r = await Ca.runCountAll({ sheets, entries, w: W, legend: { key: 'A:0', box: { x: 500, y: 300, w: 340, h: 260 } }, ftOf: (k) => ft[k], rasterize, unit, search });
const dec = Ca.decide(r.hits, 0.8);
const by = (n) => dec.tally.bySheet[idOf(n)] || {};
if (VERBOSE) console.log('   total', JSON.stringify(dec.tally.total), 'skipped', JSON.stringify(r.skipped), 'searched', r.searched);
eq(Object.fromEntries(Object.entries(by('duplex')).sort()), { 'A:0': 2, 'B:0': 5 }, 'duplex: counted on the sheets that have it');
eq(by('light'), { 'B:0': 3 }, 'light: one sheet');
ok(!dec.tally.sheets.includes('C:0'), 'the empty sheet has no counts');
ok(r.skipped.some((s) => s.key === 'E:0' && s.why === 'large'), 'a sheet too large to draw at this size is skipped and listed', JSON.stringify(r.skipped));
ok(Object.keys(dec.tally.bySheet).length >= 5, 'a count for each symbol that is on the set');
{   // the legend's own symbols are not counted on its sheet: the duplex there are the 2 real ones
  ok((by('duplex')['A:0'] || 0) === 2 && (by('quad')['A:0'] || 0) === 0 && (by('exit')['A:0'] || 0) === 0, 'the legend on its own sheet is left out');
  const noBlank = await Ca.runCountAll({ sheets: sheets.slice(0, 1), entries, w: W, legend: null, ftOf: (k) => ft[k], rasterize, unit, search });
  ok(Ca.decide(noBlank.hits, 0.8).tally.all > dec.tally.bySheet[idOf('duplex')]['A:0'], 'without blanking, the legend\'s symbols would be counted (so the blanking is doing the work)');
}
ok(Object.values(dec.tally.bySheet).some((m) => m['D:0']), 'the sheet drawn at another scale is searched at its own size');
{   // the match level moves without a new search
  const hi = Ca.decide(r.hits, 0.99).tally.all, lo = Ca.decide(r.hits, 0.6).tally.all;
  ok(hi <= dec.tally.all && dec.tally.all <= lo, 'a higher match level keeps fewer finds, from the same search', [hi, dec.tally.all, lo].join(' '));
}
{   // parallel = serial; stop
  const par = await Ca.runCountAll({ sheets, entries, w: W, legend: { key: 'A:0', box: { x: 500, y: 300, w: 340, h: 260 } }, ftOf: (k) => ft[k], rasterize, unit, search, parallel: 3 });
  eq(Object.entries(Ca.decide(par.hits, 0.8).tally.total).sort(), Object.entries(dec.tally.total).sort(), 'three searches at once give the same counts as one');
  let n = 0;
  const stopped = await Ca.runCountAll({ sheets, entries, w: W, ftOf: (k) => ft[k], rasterize, unit, search, stop: () => n++ > 2 });
  ok(stopped.stopped && stopped.searched < 4, 'stop ends the run early', String(stopped.searched));
}
{   // off, with problems
  const some = entries.map((e) => ({ ...e }));
  some[0].on = false; some[1].problem = 'too small';
  const q = await Ca.runCountAll({ sheets: sheets.slice(1, 2), entries: some, w: W, ftOf: () => 0.1, rasterize, unit, search });
  ok(!q.hits.some((h) => h.entry === some[0].id || h.entry === some[1].id), 'a symbol turned off, or with a problem, is not searched');
}

section('Adding');
{
  const marks = [{ item: 'i1', sheet: 'B:0', pts: [[0, 0]], kind: 'count' }];
  const plan = Ca.planItems(entries, dec.kept, [{ id: 'i1', name: 'DUPLEX', type: 'count' }, { id: 'i2', name: 'light', type: 'linear' }], marks, 1);
  const dup = plan.find((p) => p.name === 'DUPLEX');
  ok(dup && dup.item === 'i1', 'a name that is an existing count item goes onto it (case ignored)');
  ok(plan.find((p) => p.entry === idOf('light')).item === null, 'an item of another type is not reused: a new count item');
  eq(plan.reduce((a, p) => a + p.marks.length, 0), dec.tally.all, 'every find becomes a mark');
  const off = new Set([dec.kept[0]]);
  eq(Ca.planItems(entries, Ca.without(dec.kept, off), [], [], 0).reduce((a, p) => a + p.marks.length, 0), dec.tally.all - 1, 'a find turned off is not added');
  const links = Ca.sheetLinks(idOf('duplex'), dec.tally, SET.map((s) => s.key), (k) => 'Sheet ' + k[0]);
  eq(links, [{ sheet: 'A:0', title: 'Sheet A', n: 2 }, { sheet: 'B:0', title: 'Sheet B', n: 5 }], 'each count links to its sheets, in the set\'s order');
}
{   // one undo step for every item
  const model = new M.Takeoff();
  model.addItem({ name: 'Existing', type: 'count' });
  const before = model.state.items.length;
  const out = model.addCountedMany([{ create: { name: 'Duplex' }, list: [{ sheet: 'B:0', pts: [[1, 2]] }, { sheet: 'B:0', pts: [[3, 4]] }] }, { create: { name: 'Light' }, list: [{ sheet: 'B:0', pts: [[5, 6]] }] }, { item: model.state.items[0].id, list: [{ sheet: 'A:0', pts: [[7, 8]] }] }], 'Count everything');
  eq([model.state.items.length - before, out.map((o) => o.ids.length), model.state.marks.length], [2, [2, 1, 1], 4], 'two new items and four marks');
  model.undo();
  eq([model.state.items.length, model.state.marks.length], [before, 0], 'ONE undo takes back every item and mark');
  model.redo();
  eq(model.state.marks.length, 4, 'redo brings them back');
  let threw = false;
  try { model.addCountedMany([{ item: model.addItem({ name: 'Wall', type: 'linear' }), list: [{ sheet: 'x', pts: [[0, 0]] }] }], 'x'); } catch { threw = true; }
  ok(threw, 'a linear item cannot take count marks');
}
section('The owner\'s rule (35, 36)');
for (const f of ['countall.js', 'countall-ui.js', 'countall-worker.js']) {
  const src = fs.readFileSync(path.join(APP, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|onnx|tensorflow|\.predict\(/i.test(src), f + ': no network call, no model');
}
{
  const src = fs.readFileSync(path.join(APP, 'countall-ui.js'), 'utf8');
  ok(!/innerHTML|insertAdjacentHTML/.test(src), 'legend text reaches the page only as text (el() children), never as HTML');
}

if (args.includes('--bench')) {
  const N = Number(opt('sheets', 200)), Wd = Number(opt('w', 1700)), Ht = Number(opt('h', 1100)), P = Number(opt('parallel', 1));
  console.log(`\nbench: ${N} sheets ${Wd}×${Ht} px, ${entries.length} symbols, parallel ${P}, ${os.cpus().length} × ${os.cpus()[0].model.trim()}, load ${os.loadavg()[0].toFixed(2)}, node ${process.version}`);
  const big = Array.from({ length: N }, (_, i) => ({ key: 'S' + i + ':0', width: Wd, height: Ht, i }));
  let gen = 0;
  const rz = async (sh) => { const t = performance.now(); const c = sheet(1000 + sh.i, Object.fromEntries(NAMES.map((n) => [n, 3 + (sh.i % 5)])), Wd, Ht); gen += performance.now() - t; return c; };
  const res = await Ca.runCountAll({ sheets: big, entries, w: 1, ftOf: () => null, rasterize: rz, unit, search, parallel: P });
  const d = Ca.decide(res.hits, 0.8);
  console.log(`run: ${(res.ms / 1000).toFixed(1)} s for ${N} sheets (${(res.ms / N).toFixed(0)} ms a sheet; generating the pictures took ${(gen / 1000).toFixed(1)} s of that), ${d.tally.all} counted on ${d.tally.sheets.length} sheets`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
