#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-framing.mjs — timber and light-gauge framing panels (0.8 round 2, EG.6): a wall counted by hand piece by piece, a window wall, steel
 * studs, floor and roof panels, the cut list, nesting, the shop drawing, geometry that cannot be framed, and the model file's cleaning.
 *   node tools/detailcraft-test/test-framing.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const F = await load('framing.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const count = (p, kind) => p.pieces.filter((x) => x.kind === kind).length;

// a plain wall: 3600 × 2400, 2x4 at 400, two top plates: plates 3 × 38 = 114; studs 2286 long
let w = F.wallPanel({ length: 3600, height: 2400 });
ok(count(w, 'plate') === 3 && w.pieces.filter((p) => p.kind === 'plate').every((p) => p.length === 3600), 'plain wall: one bottom and two top plates, 3600 long');
ok(w.pieces.find((p) => p.kind === 'stud').length === 2286, 'stud length = 2400 − 3 × 38 = 2286');
// studs: two ends + the grid 400 … 3200 (8) = 10
ok(count(w, 'stud') === 10, 'studs: 2 ends + 8 on the 400 grid = 10 (' + count(w, 'stud') + ')');
ok(w.pieces.filter((p) => p.kind === 'stud').every((p) => p.x >= 0 && p.x + p.w <= 3600 + 1e-6), 'every stud is inside the panel');
// a door wall, 2700 high: door 900 × 2100 at x = 1200; header 2x10 doubled
w = F.wallPanel({ length: 3600, height: 2700, openings: [{ x: 1200, width: 900, height: 2100, sill: 0 }] });
ok(count(w, 'stud') === 2 + 5, 'door wall: 2 ends + 5 grid studs outside the king/jack band (' + count(w, 'stud') + ')');
ok(count(w, 'king') === 2 && count(w, 'jack') === 2, 'two king studs, two jack studs');
ok(w.pieces.find((p) => p.kind === 'jack').length === 2100 - 38, 'jack = opening top (2100) − bottom plate (38) = 2062');
ok(count(w, 'header') === 2 && w.pieces.find((p) => p.kind === 'header').length === 900 + 76, 'header: two plies, 900 + 2 × 38 = 976');
const hdr = w.pieces.find((p) => p.kind === 'header');
ok(hdr.y === 2100 && hdr.h === 235, 'the header sits on the opening top, 235 deep');
ok(count(w, 'cripple') === 3 && w.pieces.find((p) => p.kind === 'cripple').length === 2700 - 76 - 2335, 'cripples over the header: 3 on the grid, 2700 − 76 − 2335 = 289 long');
ok(count(w, 'sill') === 0 && w.issues.length === 0 && count(w, 'plate') === 3, 'a door has no sill; no issues');
// no stud overlaps the opening
const ops = w.pieces.filter((p) => p.kind === 'stud');
ok(ops.every((p) => p.x + p.w <= 1124 + 1e-6 || p.x >= 2176 - 1e-6), 'no grid stud inside the king/jack band');
// total pieces
ok(w.pieces.length === 3 + 7 + 2 + 2 + 2 + 3, 'door wall: 19 pieces counted by hand (' + w.pieces.length + ')');
// a window with a sill at 900, 1200 wide × 1200 high
const win = F.wallPanel({ length: 3600, height: 2700, openings: [{ x: 1200, width: 1200, height: 1200, sill: 900 }] });
ok(count(win, 'sill') === 1 && win.pieces.find((p) => p.kind === 'sill').y === 900 - 38, 'window: a sill plate whose top is the rough opening bottom (900)');
const under = win.pieces.filter((p) => p.kind === 'cripple' && p.y < 900);
ok(under.length > 0 && under.every((p) => Math.abs(p.length - (900 - 38 - 38)) < 1e-9), 'cripples under the sill: 900 − 38 (sill) − 38 (plate) = 824');
// bad geometry
ok(F.wallPanel({ length: 3600, height: 2400, openings: [{ x: 1200, width: 900, height: 2100, sill: 0 }] }).issues.some((i) => i.code === 'tall'), '2x10 header on a 2100 door in a 2400 wall: does not fit (tall)');
ok(F.wallPanel({ length: 3600, height: 2700, openings: [{ x: 10, width: 900, height: 2100 }] }).issues.some((i) => i.code === 'edge'), 'an opening at the end of the wall: edge');
ok(F.wallPanel({ length: 3600, height: 2700, openings: [{ x: 1200, width: 900, height: 2100 }, { x: 1700, width: 900, height: 2100 }] }).issues.some((i) => i.code === 'overlap'), 'two openings too close: overlap');
ok(F.wallPanel({ size: '9x9' }).issues[0].code === 'size', 'an unknown size is said');
// light-gauge steel: one track top and bottom, 1.2 mm
const s = F.wallPanel({ material: 'lgs', size: 'C92-1.2', headerSize: 'C200-1.5', length: 3000, height: 2700, spacing: 600, openings: [] });
ok(count(s, 'plate') === 2 && s.pieces.find((p) => p.kind === 'stud').length === 2700 - 2.4, 'steel wall: top and bottom track, stud = 2700 − 2 × 1.2 = 2697.6');
// cut list
const cl = F.cutList(w);
ok(cl.reduce((a, r) => a + r.count, 0) === w.pieces.length && cl.find((r) => r.kind === 'stud').count === 7, 'cut list counts every piece; 7 studs of one mark');
ok(cl.every((r) => Math.abs(r.total - r.length * r.count / 1000) < 0.001), 'row totals in metres');
// nesting: 2x4 studs 2586 long: three from a 7.8... use stocks 2400/3000/3600/4800/6000 → the stud (2586) needs a 3000 bar
const w2 = F.wallPanel({ length: 3600, height: 2700 });
const nest = F.nestPanels([w2]);
const g = nest.groups.find((q) => q.profile === '2x4');
ok(g && g.bars.every((b) => b.stock >= b.used) && g.tooLong.length === 0, 'nesting: every bar holds its cuts');
ok(F.panelProblems(F.wallPanel({ length: 9000, height: 2700 }), [2400, 3000, 3600]).some((p) => p.code === 'frm.long'), 'a 9000 plate is longer than the stock: said');
// a floor: 3600 wide, 4200 span, 2x10 at 400 with rim joists; joists = ends + grid 400…3200 = 10; length = 4200 − 2 × 38
const fl = F.floorPanel({ width: 3600, span: 4200 });
ok(count(fl, 'joist') === 10 && fl.pieces.find((p) => p.kind === 'joist').length === 4200 - 76 && count(fl, 'rim') === 2, 'floor: 10 joists of 4124 between two rims');
const fb = F.floorPanel({ width: 3600, span: 4200, blocking: true });
ok(count(fb, 'blocking') === 9 && fb.pieces.filter((p) => p.kind === 'blocking').map((p) => p.length).join() === '343,362,362,362,362,362,362,362,343', 'floor with blocking: 9 blocks between 10 joists (end bays 343, the rest 400 − 38 = 362)');
// a roof: run 3000, rise 1500 → rafter 3354.1 + overhang 400 × 1.118 = 3801.3; 4800 long at 600 → pairs
const rf = F.roofPanel({ length: 4800, run: 3000, rise: 1500, overhang: 400, spacing: 600 });
ok(Math.abs(rf.pieces.find((p) => p.kind === 'rafter').length - (Math.hypot(3000, 1500) + 400 * Math.hypot(3000, 1500) / 3000)) < 0.2, 'roof: rafter = slope length + overhang along the slope (' + rf.pieces[0].length + ')');
ok(Math.abs(rf.pitch - 26.565) < 0.01, 'roof pitch 26.57°');
const rl = F.cutList(rf);
ok(rl.find((r) => r.kind === 'rafter').count === 2 * 9 && rl.find((r) => r.kind === 'ridge').count === 1, 'roof cut list: 9 pairs of rafters, one ridge (' + rl.map((r) => r.kind + r.count).join() + ')');
// drawings
const svg = F.panelSvg(w, { title: 'W1' });
ok(svg.startsWith('<svg') && svg.endsWith('</svg>') && (svg.match(/data-piece=/g) || []).length === w.pieces.length && svg.includes('>W1<'), 'the shop drawing has every piece, marked, and a title');
ok(!/<script|onload/i.test(F.panelSvg(F.wallPanel({}), { title: '<script>alert(1)</script>' })), 'a title cannot put markup in the drawing');
for (const p of [fl, rf, s]) ok(F.panelSvg(p).includes('data-piece'), p.spec.kind + ' drawing');
// the file
const clean = F.cleanFraming({ panels: [{ kind: 'wall', length: 'x', height: 99999, spacing: 5, size: '9x9', openings: [{ x: -4, width: 5 }], id: 'a b' }, { kind: 'door' }, { kind: 'roof', rise: 800 }] });
ok(clean.panels.length === 2 && clean.panels[0].length === 3600 && clean.panels[0].height === 2400 && clean.panels[0].spacing === 400 && clean.panels[0].size === '2x4', 'bad numbers and sizes fall back to the defaults');
ok(clean.panels[0].id === 'ab' && clean.panels[0].openings[0].x === 0 && clean.panels[0].openings[0].width === 900, 'an id is cleaned; an opening is made valid');
ok(F.cleanFraming({ panels: [] }) === null && F.cleanFraming(null) === null, 'nothing to keep: null');
ok(F.cleanPanelSpec({ kind: 'wall', material: 'lgs', size: '2x4' }).size === 'C92-1.2', 'a timber size on a steel wall falls back to a steel size');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
