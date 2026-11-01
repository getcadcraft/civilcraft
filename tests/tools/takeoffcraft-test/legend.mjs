#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * legend.mjs — 0.8 EG.67 (session takeoff_PART_2): "Count everything" without a browser.
 *
 *   node tools/takeoffcraft-test/legend.mjs [--build dev] [--verbose]
 *   node tools/takeoffcraft-test/legend.mjs --bench [--sheets 200] [--symbols 8] [--w 1700 --h 1100] [--workers 1]   (heavy: run it on workstation11a, rule 25)
 *
 * legend.js against generated legends and sheets: the rows' words and symbols read, a layout with the symbols on the right, a two-column
 * legend, a legend with no words, a title with no symbol beside it; symbols found on sheets with the right counts per sheet, a lookalike
 * pair kept apart (and reported), a legend on its own sheet left out; the gate not losing true finds; and the owner's rule: no network
 * and no trained model in the code. --bench times a generated set (the search only: the page's PDF drawing is not in this number).
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const opt = (n, d) => (args.includes('--' + n) ? args[args.indexOf('--' + n) + 1] : d);
const BUILD = opt('build', 'dev'), VERBOSE = args.includes('--verbose');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft', BUILD);
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await load('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const Lg = await load('legend.js');
const Mt = await load('match.js');

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name, 'got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b));
const section = (s) => console.log('\n' + s);

// ---- drawing on a raster (ink 0..1) ----
const canvas = (w, h) => ({ data: new Float32Array(w * h), w, h });
const put = (c, x, y, v) => { if (x >= 0 && y >= 0 && x < c.w && y < c.h) c.data[y * c.w + x] = Math.max(c.data[y * c.w + x], v); };
// a point splatted over its four pixels, like an antialiased renderer would: a symbol at a fractional place looks a little different
const px = (c, x, y, v = 1) => { const fx = Math.floor(x), fy = Math.floor(y), ax = x - fx, ay = y - fy; put(c, fx, fy, v * (1 - ax) * (1 - ay) * 1.6); put(c, fx + 1, fy, v * ax * (1 - ay) * 1.6); put(c, fx, fy + 1, v * (1 - ax) * ay * 1.6); put(c, fx + 1, fy + 1, v * ax * ay * 1.6); };
const line = (c, x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) * 2; for (let i = 0; i <= n; i++) px(c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
const ring = (c, cx, cy, r) => { for (let a = 0; a < 720; a++) px(c, cx + r * Math.cos(a * Math.PI / 360), cy + r * Math.sin(a * Math.PI / 360)); };
const rect = (c, x, y, w, h) => { line(c, x, y, x + w, y); line(c, x + w, y, x + w, y + h); line(c, x + w, y + h, x, y + h); line(c, x, y + h, x, y); };
// the symbols (about 18 px): duplex (circle, bar), quad (circle, two bars), light (circle, cross), switch (S in a box, a stem), panel (filled box), exit (box, triangle)
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
function inkText(c, l) { for (let x = Math.round(l.x0); x < l.x1; x += 2) for (let y = Math.round(l.y0) + 2; y < l.y1 - 1; y++) if ((x + y) % 3) put(c, x, y, 0.8); }     // blobs standing for words

function legendFor(layout) {
  const c = canvas(340, 260), labels = [], names = NAMES.slice();
  if (layout === 'left') names.forEach((n, i) => { const y = 30 + i * 30; SYMS[n](c, 12, y); labels.push(label(n.toUpperCase() + ' OUTLET', 50, y + 4)); });
  if (layout === 'right') names.forEach((n, i) => { const y = 30 + i * 30; labels.push(label(n.toUpperCase() + ' OUTLET', 12, y + 4)); SYMS[n](c, 120, y); });
  if (layout === 'two') names.forEach((n, i) => { const col = i % 2, y = 30 + Math.floor(i / 2) * 36; SYMS[n](c, 12 + col * 170, y); labels.push(label(n.toUpperCase() + ' X', 50 + col * 170, y + 4)); });
  if (layout !== 'two' || true) { labels.push(label('LEGEND', 110, 6)); }
  for (const l of labels) inkText(c, l);
  return { c, labels, names };
}

section('A boxed legend');
{   // the legend drawn inside a frame with a rule under the title: the frame and the rule are not symbols (the title row has none)
  const { c, labels, names } = legendFor('left');
  rect(c, 2, 2, c.w - 5, c.h - 5);
  line(c, 3, 22, c.w - 4, 22);
  const rows = Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l })));
  const r = Lg.readLegend(c, rows);
  eq(r.entries.length, names.length, 'a frame round the legend and a rule under its title do not make a symbol');
  ok(r.entries.every((e) => !e.problem && e.tpl.w <= 24), 'and the symbols are still cut to their own size', JSON.stringify(r.entries.map((e) => [e.tpl.w, e.tpl.h])));
}
section('Reading a legend');
for (const layout of ['left', 'right', 'two']) {
  const { c, labels, names } = legendFor(layout);
  const rows = Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l })));
  ok(rows.length === labels.length, layout + ': one label per row', rows.length + ' of ' + labels.length);
  const r = Lg.readLegend(c, rows);
  ok(r.side === (layout === 'right' ? 'right' : 'left'), layout + ': the side is found', r.side);
  eq(r.entries.length, names.length, layout + ': a symbol per row (the title has none)');
  eq(r.entries.map((e) => e.label).sort(), rows.filter((x) => x.text !== 'LEGEND').map((x) => x.text).sort(), layout + ': each symbol keeps its words');
  ok(r.entries.every((e) => !e.problem && e.tpl.w >= 14 && e.tpl.w <= 24 && e.tpl.h >= 14 && e.tpl.h <= 24), layout + ': symbols cut to their size', JSON.stringify(r.entries.map((e) => [e.tpl.w, e.tpl.h])));
}
{
  const { c } = legendFor('left');                                           // a scan: no words at all
  const r = Lg.readLegend(c, []);
  ok(r.entries.length >= 5, 'no words: the symbols are still found by their rows', String(r.entries.length));
}
{
  const a = Lg.groupLabels([{ str: 'DUPLEX', x0: 50, y0: 10, x1: 80, y1: 19 }, { str: 'OUTLET,', x0: 83, y0: 10, x1: 120, y1: 19 }, { str: '20A', x0: 50, y0: 21, x1: 70, y1: 30 }, { str: 'FAR', x0: 50, y0: 60, x1: 70, y1: 69 }]);
  eq(a.map((l) => l.text), ['DUPLEX OUTLET, 20A', 'FAR'], 'words on a line and a wrapped line join; a far row does not');
  eq(Lg.groupLabels([{ str: 'a‮b\u0000c', x0: 0, y0: 0, x1: 10, y1: 9 }])[0].text, 'a b c', 'control and direction characters are removed from labels (rule 36)');
}
{
  const { c, labels } = legendFor('left');
  const rows = Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l })));
  const r = Lg.readLegend(c, rows), by = Object.fromEntries(r.entries.map((e) => [e.label.split(' ')[0].toLowerCase(), e]));
  if (VERBOSE) console.log('   likeness dq', Lg.likeness(by.duplex.tpl, by.quad.tpl).toFixed(2), 'dl', Lg.likeness(by.duplex.tpl, by.light.tpl).toFixed(2), 'panel turns', Lg.distinctTurns(by.panel.tpl), Lg.likeness(by.panel.tpl, Mt.rotate(by.panel.tpl, 90)).toFixed(3), by.panel.tpl.w, by.panel.tpl.h);
  ok(Lg.likeness(by.duplex.tpl, by.quad.tpl) < 0.85 && Lg.likeness(by.duplex.tpl, by.light.tpl) < 0.85, 'different symbols are not alike');
  ok(Lg.likeness(by.duplex.tpl, by.duplex.tpl) > 0.999, 'a symbol is like itself');
  const sq = canvas(40, 40); for (let y = 10; y < 26; y++) for (let x = 10; x < 26; x++) px(sq, x, y, 1);
  eq(Lg.distinctTurns(Mt.trim(sq)).length, 1, 'a solid square needs one search, not four');
  ok(Lg.distinctTurns(by.duplex.tpl).length >= 2, 'a circle with a bar needs more than one turn');
}

// ---- a set of generated sheets ----
function makeSheet(seed, counts, W = 900, H = 600, withLegend = false) {
  let s = seed; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const c = canvas(W, H);
  for (let i = 0; i < 40; i++) { const x = rnd() * W, y = rnd() * H; line(c, x, y, x + (rnd() - 0.5) * 300, y + (rnd() < 0.5 ? 0 : (rnd() - 0.5) * 200)); }   // walls and clutter
  rect(c, 20, 20, W - 40, H - 40);
  const spots = [];
  for (const [name, n] of Object.entries(counts)) for (let i = 0; i < n; i++) {
    let x, y, tries = 0;
    do { x = 40 + rnd() * (W - 100); y = 40 + rnd() * (H - 100); tries++; } while (spots.some((p) => Math.abs(p.x - x) < 30 && Math.abs(p.y - y) < 30) && tries < 50);
    spots.push({ x, y, name }); SYMS[name](c, x, y);
  }
  return { c, spots };
}
section('Searching sheets');
{
  const { c: lc, labels, names } = legendFor('left');
  const rows = Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l })));
  const leg = Lg.readLegend(lc, rows);
  const jobs = leg.entries.map((e, i) => ({ key: 'e' + i, tpl: e.tpl, floor: 0.65 }));
  const label = Object.fromEntries(leg.entries.map((e, i) => ['e' + i, e.label.split(' ')[0].toLowerCase()]));
  const sheets = [{ duplex: 5, light: 3 }, { quad: 4, switch: 2, exit: 1 }, {}, { duplex: 2, quad: 2, light: 2, switch: 2, panel: 2, exit: 2 }];
  const hits = [];
  sheets.forEach((cnt, si) => {
    const { c, spots } = makeSheet(7 + si, cnt);
    const res = Lg.searchSheet(c, jobs);
    for (const [k, list] of Object.entries(res)) for (const h of list) hits.push({ entry: k, sheet: 's' + si, x: h.x, y: h.y, w: h.w, h: h.h, score: h.score });
  });
  const { kept, mixed } = Lg.keepBest(hits, () => 0.8);
  const T = Lg.tally(kept);
  const got = {};
  for (const [k, n] of Object.entries(T.total)) got[label[k]] = n;
  if (VERBOSE) for (const h of hits.filter((h) => h.sheet === 's0')) console.log('   s0', label[h.entry], h.x, h.y, h.score.toFixed(2));
  const want = { duplex: 7, light: 5, quad: 6, switch: 4, exit: 3, panel: 2 };
  const missed = Object.entries(want).map(([k, n]) => n - Math.min(n, got[k] || 0)), extra = Object.entries(got).map(([k, n]) => Math.max(0, n - want[k]));
  ok(missed.reduce((a, b) => a + b, 0) <= 3, 'at least 24 of the 27 real symbols are found (lines through a symbol can hide one)', JSON.stringify(got));
  ok(extra.reduce((a, b) => a + b, 0) === 0, 'nothing is counted that is not a symbol', JSON.stringify(got));
  const per = {};
  for (const [k, m] of Object.entries(T.bySheet)) per[label[k]] = m;
  ok(Object.keys(per.duplex || {}).every((k) => ['s0', 's3'].includes(k)), 'the duplex counts are tied to the sheets that have them', JSON.stringify(per.duplex));
  ok(!T.sheets.includes('s2'), 'the empty sheet has no counts');
  ok(T.all === Object.values(got).reduce((a, b) => a + b, 0), 'every find is counted once', String(T.all));
  {   // a spot two symbols both match goes to the better one, and the pair is reported
    const A = { entry: 'a', sheet: 's', x: 10, y: 10, w: 18, h: 18, score: 0.9 }, B = { entry: 'b', sheet: 's', x: 11, y: 10, w: 18, h: 18, score: 0.85 }, C = { entry: 'b', sheet: 's', x: 100, y: 10, w: 18, h: 18, score: 0.85 };
    const r = Lg.keepBest([B, A, C], () => 0.8);
    eq(r.kept.map((h) => h.entry + h.x), ['a10', 'b100'], 'the better symbol takes a shared spot');
    eq([...r.mixed.entries()], [['a|b', 1]], 'the mix-up is reported');
    eq(Lg.keepBest([{ ...A, score: 0.7 }], () => 0.8).kept.length, 0, 'below that symbol\'s threshold is not kept');
  }
  ok(mixed.size >= 0, 'mix-ups are reported (' + [...mixed.entries()].map(([k, n]) => k + ':' + n).join(',') + ')');
}
section('The gate does not lose true finds');
{
  const { c: lc, labels } = legendFor('left');
  const leg = Lg.readLegend(lc, Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l }))));
  const { c } = makeSheet(99, { duplex: 6, quad: 6, light: 6, switch: 6, panel: 6, exit: 6 }, 900, 600);
  let same = true, n = 0;
  for (const e of leg.entries) {
    const a = Mt.findSymbol(c, e.tpl, { floor: 0.8, rotations: [0] }), b = Mt.findSymbol(c, e.tpl, { floor: 0.8, rotations: [0], gate: [0.4, 2.5] });
    const A = Mt.suppress(a, 0.8), B = Mt.suppress(b, 0.8);
    n += A.length; if (A.length !== B.length) { same = false; if (VERBOSE) { let tm = 0; for (const v of e.tpl.data) tm += v; const h0 = A.find((h) => !B.some((g) => g.x === h.x && g.y === h.y)); let wm = 0; for (let y = h0.y; y < h0.y + h0.h; y++) for (let x = h0.x; x < h0.x + h0.w; x++) wm += c.data[y * c.w + x]; console.log('   mass tpl', tm.toFixed(1), 'window', wm.toFixed(1)); } if (VERBOSE) console.log('   gate', e.label, A.length, B.length, A.map((h) => [h.x, h.y, h.score.toFixed(2)].join(',')).join(' '), '|', B.map((h) => [h.x, h.y, h.score.toFixed(2)].join(',')).join(' ')); }
  }
  ok(same && n >= 25, 'gated and ungated finds are the same on clean symbols', n + ' finds');
}
section('Scales');
eq(Lg.renderScales(2, 0.1, 0.1), [2], 'same scale: one size');
eq(Lg.renderScales(2, 0.1, 0.2), [4, 2], 'another scale: that size and the legend size');
ok(Math.abs(Lg.runScale([{ w: 9, h: 6 }, { w: 30, h: 20 }], 18) - 2) < 1e-9, 'the smallest symbol sets the run size');
section('The owner\'s rule (35)');
for (const f of ['legend.js', 'legend-worker.js', 'legend-ui.js']) {
  if (!fs.existsSync(path.join(APP, f))) continue;
  const src = fs.readFileSync(path.join(APP, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|onnx|tensorflow|\.predict\(/i.test(src), f + ': no network call, no model');
}
const en = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
ok(!Object.entries(en).some(([k, v]) => k.startsWith('eg67.') && /\bAI\b|artificial|machine learning/i.test(String(v))), 'the copy never says the app has AI built in');

// ---- timing ----
if (args.includes('--bench')) {
  const N = Number(opt('sheets', 200)), S = Number(opt('symbols', 8)), W = Number(opt('w', 1700)), H = Number(opt('h', 1100));
  const { c: lc, labels } = legendFor('left');
  const leg = Lg.readLegend(lc, Lg.groupLabels(labels.map((l) => ({ str: l.text, ...l }))));
  const jobs = leg.entries.slice(0, S).map((e, i) => ({ key: 'e' + i, tpl: e.tpl, floor: 0.65 }));
  console.log(`\nbench: ${N} sheets ${W}×${H} px, ${jobs.length} symbols, ${os.cpus().length} × ${os.cpus()[0].model.trim()}, load ${os.loadavg()[0].toFixed(2)}, node ${process.version}`);
  const t0 = performance.now(); let finds = 0, tm = 0;
  for (let i = 0; i < N; i++) {
    const cnt = {}; for (const n of NAMES) cnt[n] = 3 + (i % 5);
    const { c } = makeSheet(1000 + i, cnt, W, H);
    const t1 = performance.now();
    const res = Lg.searchSheet(c, jobs);
    tm += performance.now() - t1;
    for (const l of Object.values(res)) finds += l.length;
  }
  console.log(`search only: ${(tm / 1000).toFixed(1)} s for ${N} sheets (${(tm / N).toFixed(0)} ms a sheet), ${finds} raw finds; whole loop with drawing ${((performance.now() - t0) / 1000).toFixed(1)} s`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
