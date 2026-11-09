#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Makes the big test layout ONCE (testfiles/LARGE-FILES.md rule 3): testfiles/generated/chip/layout-1m-shapes.{gds,oas}.
// Skipped when both files are there; --force remakes them (then update their sha256 in the registry).
// Layout (database unit 1 nm, mulberry32 seed 9): SEA = 1,000,000 stored shapes (one per 2 µm grid point over 2 mm × 2 mm: 90 % rectangles,
// 8 % L-shaped polygons, 2 % two-segment paths, layers 1–8); 16 standard cells STD0–STD15 of 60 rectangles; ROW = 250 placements of them;
// CORE = ROW as an array of 1 × 80; TOP = SEA + CORE as an array of 4 × 4. Stored shapes 1,000,960; placed out 1,000,000 + 19,200,000.
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as L from '../layout.js';
import { writeGds } from '../gds.js';
import { writeOasis } from '../oasis.js';

const DIR = '/var/www/CADCRAFT/testfiles/generated/chip/', GF = DIR + 'layout-1m-shapes.gds', OF = DIR + 'layout-1m-shapes.oas';
if (!process.argv.includes('--force') && fs.existsSync(GF) && fs.existsSync(OF)) { console.log('already there: ' + GF + ', ' + OF); process.exit(0); }
fs.mkdirSync(DIR, { recursive: true });
let a = 9; const rnd = () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const lib = L.newLib('cc_big_1m', { userPerDb: 0.001, metersPerDb: 1e-9 });
for (let k = 0; k < 16; k++) { const c = L.newCell(lib, 'STD' + k); for (let s = 0; s < 60; s++) { const x = ri(0, 1600), y = ri(0, 3400), w = ri(20, 200), h = ri(20, 200); c.shapes.add(L.POLY, ri(1, 6), 0, [x, y, x + w, y, x + w, y + h, x, y + h]); } }
const row = L.newCell(lib, 'ROW'); for (let i = 0; i < 250; i++) row.refs.push({ cell: 'STD' + ri(0, 15), x: i * 2000, y: 0, flip: false, angle: 0, mag: 1 });
const core = L.newCell(lib, 'CORE'); core.refs.push({ cell: 'ROW', x: 0, y: 0, flip: false, angle: 0, mag: 1, rep: { kind: 'lattice', nx: 1, ny: 80, ax: [0, 0], ay: [0, 4000] } });
const sea = L.newCell(lib, 'SEA'), S = sea.shapes;
for (let gy = 0; gy < 1000; gy++) for (let gx = 0; gx < 1000; gx++) {
  const x = gx * 2000 + ri(0, 300), y = gy * 2000 + ri(0, 300), layer = ri(1, 8), r = rnd();
  if (r < 0.9) { const w = ri(200, 1500), h = ri(200, 1500); S.add(L.POLY, layer, 0, [x, y, x + w, y, x + w, y + h, x, y + h]); }
  else if (r < 0.98) { const w = ri(600, 1500), h = ri(600, 1500), t = ri(150, 400); S.add(L.POLY, layer, 0, [x, y, x + w, y, x + w, y + t, x + t, y + t, x + t, y + h, x, y + h]); }
  else { const i = S.add(L.PATH, layer, 0, [x, y, x + 1200, y, x + 1200, y + 1200], 100); if (rnd() < 0.5) S.ext.set(i, { pathtype: 2 }); }
}
const top = L.newCell(lib, 'TOP'); top.refs.push({ cell: 'SEA', x: 0, y: 0, flip: false, angle: 0, mag: 1 }, { cell: 'CORE', x: 2100000, y: 0, flip: false, angle: 0, mag: 1, rep: { kind: 'lattice', nx: 4, ny: 4, ax: [520000, 0], ay: [0, 330000] } });
top.texts.push({ text: 'cc_big_1m', layer: 63, texttype: 0, x: 0, y: -5000 });
for (const c of Object.values(lib.cells)) c.shapes.trim();
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
let t = Date.now(); const g = writeGds(lib); fs.writeFileSync(GF, g); console.log('GDSII ' + GF + ' ' + (g.length / 1048576).toFixed(1) + ' MB sha256 ' + sha(g) + ' (' + (Date.now() - t) + ' ms)');
t = Date.now(); const o = writeOasis(lib); fs.writeFileSync(OF, o); console.log('OASIS ' + OF + ' ' + (o.length / 1048576).toFixed(1) + ' MB sha256 ' + sha(o) + ' (' + (Date.now() - t) + ' ms)');
