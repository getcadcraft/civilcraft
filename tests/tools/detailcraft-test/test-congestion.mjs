#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-congestion.mjs — the rebar congestion map (0.8 round 2, EG.74): the opening between bars by hand, the clear-spacing need (ACI 318-19
 * 25.2.1, EN 1992-1-1 8.2), aggregate and vibrator inputs, starters and hooks, a tight mat flagged, Problems.
 *   node tools/detailcraft-test/test-congestion.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const R = await load('rebar.js'), C = await load('congestion.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const foot = (over = {}) => R.cleanFooting({ ...R.FOOTING_DEFAULTS, ...over, mat: { ...R.FOOTING_DEFAULTS.mat, ...(over.mat || {}) }, starters: { ...R.FOOTING_DEFAULTS.starters, ...(over.starters || {}) } }).footing;

// need: ACI 318-19 25.2.1 — the greater of 25.4 mm and db; with an aggregate, 4/3 of it
const B5 = R.BARS.get('#5'), B11 = R.BARS.get('#11'), H16 = R.BARS.get('H16');
ok(near(C.clearNeed(B5), 25.4, 0.01) && near(C.clearNeed(B11), 35.814, 0.01), 'need: #5 25.4 mm, #11 = its diameter 35.8 mm');
ok(near(C.clearNeed(B5, { aggregate: 25 }), 33.33, 0.01), 'need: 25 mm aggregate → 4/3 × 25 = 33.3 mm');
ok(C.clearNeed(H16) === 20 && C.clearNeed(H16, { aggregate: 20 }) === 25 && C.clearNeed(R.BARS.get('H25')) === 25, 'need (EN): max(db, aggregate + 5, 20)');

// a footing with no starters: openings by hand. 2000 × 2000, cover 75, #5 at 250: n = 9, spacing 229.26, clear = 229.26 − 15.875 = 213.39
const f0 = foot({ starters: { on: false } });
const m0 = C.congestion(f0, { cell: 10 });
const lay = R.layout(2000 - 150 - 15.875, 250);
const clear = lay.spacing - 15.875;
// the cell right in the middle between two bars in both directions
const mid = (j) => -1000 + 75 + 15.875 / 2 + (j + 0.5) * lay.spacing;
const at = (m, x, y) => { const i = Math.floor((x - m.x0) / m.cell), j = Math.floor((y - m.y0) / m.cell); return m.opening[j * m.cols + i]; };
ok(near(at(m0, mid(3), mid(3)), clear, 1.5), 'opening between four bars = ' + clear.toFixed(1) + ' mm (' + at(m0, mid(3), mid(3)).toFixed(1) + ')');
ok(m0.worst.ratio < 0.2 && m0.over === 0 && C.congestionProblems(m0, { id: 'f1', label: 'F1' }).length === 0, 'a normal mat: nothing flagged (worst ' + m0.worst.ratio.toFixed(2) + ')');
ok(m0.need === 25.4, 'need of the mat = 25.4 mm');

// a tight mat: #8 (25.4 mm) at the closest spacing the model takes, 50 mm → clear 24.6 mm < 25.4
const f1 = foot({ L: 800, B: 800, mat: { barX: '#8', barY: '#8', sX: 50, sY: 50 }, starters: { on: false } });
const m1 = C.congestion(f1, { cell: 5 });
ok(m1.worst.ratio > 1 && m1.over > 0, '#8 bars 50 mm apart: flagged (worst ' + m1.worst.ratio.toFixed(2) + ')');
const p1 = C.congestionProblems(m1, { id: 'f1', label: 'F1' });
ok(p1.length === 1 && p1[0].code === 'cong.tight' && p1[0].about[0].kind === 'footing' && p1[0].source.name === 'detailcraft.congestion', 'a Problem about the footing');
ok(p1[0].req.value === 25.4 && near(p1[0].found.value, m1.worst.opening, 0.1), 'it carries what was needed and what was found');

// an aggregate and a vibrator raise the need
const m2 = C.congestion(f0, { cell: 10, aggregate: 38 });
ok(near(m2.need, 50.67, 0.01), '38 mm aggregate: need 50.7 mm');
const m3 = C.congestion(f0, { cell: 10, vibrator: 60 });
ok(m3.need === 60, 'a 60 mm vibrator: need 60 mm');
ok(m3.worst.ratio > m0.worst.ratio, 'a bigger need makes the map tighter');

// starters and their hooks close the middle: 4 × #11 starters 100 mm apart
const f2 = foot({ L: 1500, B: 1500, starters: { on: true, bar: '#11', nx: 2, ny: 2, sx: 100, sy: 100, projection: 600, hook: true } });
const m4 = C.congestion(f2, { cell: 5 });
const f3 = foot({ L: 1500, B: 1500, starters: { on: false } });
const m5 = C.congestion(f3, { cell: 5 });
ok(m4.worst.ratio > m5.worst.ratio, 'starters and hooks make the middle tighter (' + m4.worst.ratio.toFixed(2) + ' vs ' + m5.worst.ratio.toFixed(2) + ')');
ok(Math.abs(m4.worst.x) < 400 && Math.abs(m4.worst.y) < 400, 'the worst place is by the starters (' + Math.round(m4.worst.x) + ', ' + Math.round(m4.worst.y) + ')');
const gapStarters = 100 - B11.db;   // between two #11 starters: 100 − 35.8 = 64.2 mm
ok(m4.bars.filter((b) => b.kind === 'starter').length === 4 && m4.bars.filter((b) => b.kind === 'hook').length === 4, 'four starters and four hook legs');
// the heat ramp
ok(C.heat(0).join() === '226,236,247' && C.heat(1.5).join() === '196,48,43' && C.heat(9).join() === '196,48,43', 'heat ramp ends');
// bigger footings stay within the cell budget
const big = C.congestion(foot({ L: 20000, B: 20000 }), {});
ok(big.cols <= 200 && big.rows <= 200, 'a 20 m footing: ' + big.cols + ' × ' + big.rows + ' cells');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
