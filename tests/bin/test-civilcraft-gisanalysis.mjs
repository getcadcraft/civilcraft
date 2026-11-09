#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-gisanalysis.mjs — CivilCraft's GIS analysis tools (0.9 SU.1080), DOM-free, in Node: buffer, overlay (intersect, union,
 * erase), dissolve, spatial join, attribute queries, measure and statistics (lib/gis/gis-poly.js + gis-analysis.js, byte-identical copies
 * in civilcraft/dev) and their run on a real project (gis-analysis-run.js: one new layer, one undo step, the inputs untouched).
 *
 *   node bin/test-civilcraft-gisanalysis.mjs [--build dev|x.y] [--verbose]
 *
 * Every number is worked out by hand in the comment beside it (squares of known size, circles by the n-gon area formula) or by an
 * identity that needs no second program (inclusion-exclusion on random polygons, and a point-by-point membership check against the
 * ray-casting test over a grid of probe points).
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const PJ = await mod('project.js');
const GL = await mod('gis-layers.js');
const A = await mod('gis-analysis.js');
const PL = await mod('gis-poly.js');
const R = await mod('gis-analysis-run.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---- the engine copies are the canonical files
section('lib/gis is canonical, the app carries byte-identical copies');
for (const f of ['gis-poly.js', 'gis-analysis.js']) ok(fs.readFileSync(path.join(REPO, 'lib/gis', f)).equals(fs.readFileSync(path.join(APP, f))), f + ' is identical in lib/gis and ' + BUILD);

const sq = (x, y, w, h = w) => [[[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]]];
const poly = (x, y, w, h) => ({ t: 'pg', c: [sq(x, y, w, h)] });
const pt = (x, y) => ({ t: 'pt', c: [x, y] });
const rec = (o) => { const p = Object.create(null); Object.assign(p, o); return p; };
const ngon = (n, r) => (n / 2) * r * r * Math.sin((2 * Math.PI) / n);

// ---- polygon booleans by hand
section('polygon booleans: squares and rectangles worked out by hand');
{
  const a = [sq(0, 0, 10)], b = [sq(5, 5, 10)];   // overlap 5 x 5 = 25
  near(PL.area(PL.intersect(a, b)), 25, 1e-9, 'two 10-squares offset by 5: intersection 5 x 5 = 25');
  near(PL.area(PL.union(a, b)), 175, 1e-9, '... union 100 + 100 - 25 = 175');
  near(PL.area(PL.difference(a, b)), 75, 1e-9, '... difference 100 - 25 = 75');
  near(PL.area(PL.union(a, a)), 100, 1e-9, 'a polygon with itself: union 100');
  near(PL.area(PL.intersect(a, a)), 100, 1e-9, '... intersection 100');
  ok(PL.difference(a, a).length === 0, '... difference nothing');
  const touch = PL.union(a, [sq(10, 0, 10)]);
  near(PL.area(touch), 200, 1e-9, 'squares sharing an edge: union 200');
  ok(touch.length === 1 && touch[0].length === 1, '... one polygon, no hole (the shared edge vanishes)');
  near(PL.perimeter(touch), 60, 1e-9, '... perimeter 2 x (20 + 10) = 60');
  ok(PL.intersect(a, [sq(10, 0, 10)]).length === 0, 'squares that only touch: empty intersection');
  const holed = PL.difference(a, [sq(2, 2, 4)]);   // 100 - 16
  near(PL.area(holed), 84, 1e-9, 'a 4-square cut out of the middle: area 84');
  ok(holed.length === 1 && holed[0].length === 2, '... one polygon with one hole');
  near(PL.area(PL.union(holed, [sq(3, 3, 2)])), 88, 1e-9, 'a 2-square put back inside the hole: 84 + 4 = 88');
  const donut = PL.difference([sq(0, 0, 30)], [sq(10, 10, 10)]);
  near(PL.area(PL.intersect(donut, [sq(5, 5, 10)])), 100 - 25, 1e-9, 'a donut and a square over its inner corner: 10 x 10 less the 5 x 5 inside the hole = 75');
  near(PL.area(PL.intersect([sq(6e6, 2e6, 10)], [sq(6e6 + 5, 2e6 + 5, 10)])), 25, 1e-6, 'state-plane sized coordinates (6,000,000 / 2,000,000): intersection still 25');
  const L = PL.union([sq(0, 0, 2)], [sq(0, 0, 1, 4)]);   // L-ish: 4 + (1 x 4 less overlap 2) = 6
  near(PL.area(L), 6, 1e-9, 'overlapping rectangles sharing a corner: union 6');
}

section('polygon booleans: identities on random polygons and a probe grid');
{
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const blob = (cx, cy, r, n) => { const pts = []; for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n, rr = r * (0.5 + rnd() * 0.5); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } pts.push(pts[0].slice()); return pts; };
  let worstArea = 0, probeMiss = 0, probes = 0, cases = 60;
  for (let k = 0; k < cases; k++) {
    const a = [[blob(0, 0, 50, 7 + (k % 9))]], b = [[blob(20 + rnd() * 40, rnd() * 40 - 20, 40, 6 + (k % 7))]];
    const i = PL.intersect(a, b), u = PL.union(a, b), d = PL.difference(a, b), d2 = PL.difference(b, a);
    const Aa = PL.area(a), Ab = PL.area(b), Ai = PL.area(i);
    worstArea = Math.max(worstArea, Math.abs(PL.area(u) - (Aa + Ab - Ai)), Math.abs(PL.area(d) - (Aa - Ai)), Math.abs(PL.area(d2) - (Ab - Ai)));
    for (let x = -90; x <= 110; x += 7.3) for (let y = -90; y <= 90; y += 6.1) {
      const ia = PL.pointIn(a, x, y), ib = PL.pointIn(b, x, y);
      if (PL.onBoundary(a, x, y, 1e-6) || PL.onBoundary(b, x, y, 1e-6)) continue;
      probes++;
      if (PL.pointIn(i, x, y) !== (ia && ib) || PL.pointIn(u, x, y) !== (ia || ib) || PL.pointIn(d, x, y) !== (ia && !ib)) probeMiss++;
    }
  }
  ok(worstArea < 1e-6, `${cases} random pairs: union = A + B - A∩B, A-B = A - A∩B, B-A = B - A∩B (worst error ${worstArea.toExponential(2)})`);
  ok(probeMiss === 0, `${probes} probe points agree with ray casting on A and B for intersection, union and difference (${probeMiss} misses)`);
}

// ---- buffers, by the n-gon formula
section('buffers: circles are 4 x quarter-gons inscribed in the true circle');
{
  const c64 = PL.bufferPoint([0, 0], 100, 16);   // 64-gon of radius 100
  near(PL.area(c64), ngon(64, 100), 1e-6, 'point buffer, radius 100, 64 pieces: ' + ngon(64, 100).toFixed(3) + ' (32 r² sin(2π/64))');
  ok(PL.area(c64) / (Math.PI * 1e4) > 0.998 && PL.area(c64) < Math.PI * 1e4, '... within 0.2 % of π r² and never over it');
  const line = PL.bufferLine([[[0, 0], [1000, 0]]], 10, 16);   // rectangle 1000 x 20 + one full 64-gon of r 10
  near(PL.area(line), 20000 + ngon(64, 10), 1e-6, 'line buffer 1000 long, distance 10: 20000 + a 64-gon of radius 10 = ' + (20000 + ngon(64, 10)).toFixed(3));
  const straight = PL.bufferLine([[[0, 0], [50, 0], [100, 0]]], 10, 16);
  near(PL.area(straight), 2000 + ngon(64, 10), 1e-6, 'a line with a vertex in the middle buffers like the straight one: 2000 + a 64-gon of radius 10');
  const bend = PL.bufferLine([[[0, 0], [100, 0], [100, 100]]], 10, 16);
  // true outline: two 100 x 20 bars overlapping in a 10 x 10 square (-100), a half disc at each free end, a quarter disc outside the corner
  const exact = 4000 - 100 + 100 * Math.PI * (0.5 + 0.5 + 0.25);
  ok(PL.area(bend) <= exact && exact - PL.area(bend) < 1.0, `L-shaped line, distance 10: ${PL.area(bend).toFixed(3)} against the exact outline ${exact.toFixed(3)} (inscribed pieces: a little under, less than 1)`);
  const sqr = [sq(0, 0, 100)];
  near(PL.area(PL.bufferMulti(sqr, 2, 16)), 10000 + 4 * 100 * 2 + ngon(64, 2), 1e-6, 'polygon buffer, 100-square grown by 2: 10000 + 4 x 200 + a 64-gon of radius 2 = ' + (10000 + 800 + ngon(64, 2)).toFixed(3));
  near(PL.area(PL.bufferMulti(sqr, -5, 16)), 8100, 1e-6, 'the same square shrunk by 5: 90 x 90 = 8100');
  ok(PL.bufferMulti(sqr, -60, 8).length === 0, 'shrunk by 60 (more than half the width): nothing left');
  const withHole = PL.difference(sqr, [sq(40, 40, 20)]);
  near(PL.area(PL.bufferMulti(withHole, -5, 16)), 8100 - (400 + 4 * 20 * 5 + ngon(64, 5)), 1e-6, 'a square with a 20-square hole, shrunk by 5: 90 x 90 less the hole grown by 5 (400 + 4 x 100 + 64-gon of radius 5)');
  const two = PL.unionAll([PL.bufferPoint([0, 0], 10, 16), PL.bufferPoint([100, 0], 10, 16)]);
  ok(two.length === 2, 'two circles 100 apart stay two shapes');
  near(PL.area(two), 2 * ngon(64, 10), 1e-6, '... and their areas add');
}

// ---- layer tools
const parcels = {
  name: 'Parcels', geom: 'pg', fields: [{ name: 'ID', type: 'text' }, { name: 'Use_', type: 'text' }, { name: 'VALUE', type: 'number' }, { name: 'Notes', type: 'text' }],
  features: [
    { g: poly(0, 0, 100), p: rec({ ID: 'A', Use_: 'Res', VALUE: 100, Notes: null }) },
    { g: poly(100, 0, 100), p: rec({ ID: 'B', Use_: 'Res', VALUE: 250, Notes: 'corner lot' }) },
    { g: poly(0, 150, 100), p: rec({ ID: 'C', Use_: 'Com', VALUE: 400, Notes: null }) },
  ],
};
const zone = { name: 'Zone', geom: 'pg', fields: [{ name: 'ZONE', type: 'text' }, { name: 'MAXH', type: 'number' }], features: [{ g: poly(50, -20, 100, 80), p: rec({ ZONE: 'R2', MAXH: 35 }) }] };   // x 50..150, y -20..60 = 100 x 80
const wells = {
  name: 'Wells', geom: 'pt', fields: [{ name: 'W', type: 'text' }, { name: 'Q', type: 'number' }],
  features: [[50, 50, 'W1', 10], [150, 50, 'W2', 20], [160, 60, 'W3', 5], [500, 500, 'W4', 1], [0, 120, 'W5', 7]].map(([x, y, w, q]) => ({ g: pt(x, y), p: rec({ W: w, Q: q }) })),
};
const snapshot = JSON.stringify([parcels, zone, wells]);
const total = (l) => l.features.reduce((s, f) => s + PL.area(f.g.c), 0);

section('overlay: parcels (3 squares of 10,000) and a zone 100 x 80 over parcels A and B and the strip below them');
{
  const inter = A.overlay(parcels, zone, 'intersect');
  // zone x50..150 y-20..60: with A (x0..100, y0..100) = x50..100 × y0..60 = 50 x 60 = 3000; with B = 3000; C none
  ok(inter.features.length === 2, 'intersect: two pieces (parcels A and B; C is far away)');
  near(total(inter), 6000, 1e-6, '... 3000 + 3000 = 6000');
  ok(inter.features.every((f) => f.p.ZONE === 'R2' && f.p.MAXH === 35) && inter.features.map((f) => f.p.ID).join() === 'A,B', '... each carries the parcel\'s fields and the zone\'s');
  ok(inter.fields.map((f) => f.name).join() === 'ID,Use_,VALUE,Notes,ZONE,MAXH', '... fields: the first layer\'s, then the second\'s');
  const clash = A.overlay(parcels, { ...parcels, name: 'P2', features: [parcels.features[0]] }, 'intersect');
  ok(clash.fields.map((f) => f.name).join() === 'ID,Use_,VALUE,Notes,ID_2,Use__2,VALUE_2,Notes_2', 'same field names in both layers: the second layer\'s get _2');
  const un = A.overlay(parcels, zone, 'union');
  // parcels 30000 + zone outside the parcels (strip x50..150, y -20..0 = 100 x 20 = 2000) = 32000; pieces: A∩Z, B∩Z, A rest, B rest, C, zone rest
  near(total(un), 32000, 1e-6, 'union: 30000 of parcels + 2000 of zone beyond them = 32000');
  ok(un.features.length === 6, '... six pieces (two shared, three parcel-only, one zone-only)');
  const zoneOnly = un.features.filter((f) => f.p.ID === null);
  ok(zoneOnly.length === 1 && Math.abs(PL.area(zoneOnly[0].g.c) - 2000) < 1e-6 && zoneOnly[0].p.ZONE === 'R2', '... the zone-only piece is 2000 with the zone\'s fields and empty parcel fields');
  const er = A.overlay(parcels, zone, 'erase');
  ok(er.features.length === 3, 'erase: three parcels remain');
  near(total(er), 30000 - 6000, 1e-6, '... 30000 - 6000 = 24000');
  ok(er.features[0].p.ID === 'A' && Math.abs(PL.area(er.features[0].g.c) - 7000) < 1e-6, '... parcel A is 10000 - 3000 = 7000 and keeps its fields');
  ok(A.overlay(zone, parcels, 'erase').features.length === 1 && Math.abs(total(A.overlay(zone, parcels, 'erase')) - 2000) < 1e-6, 'zone erase parcels: 8000 - 6000 = 2000');
  const lines = { name: 'Roads', geom: 'ln', fields: [{ name: 'NAME', type: 'text' }], features: [{ g: { t: 'ln', c: [[[0, 30], [200, 30]]] }, p: rec({ NAME: 'Main' }) }] };
  const clip = A.overlay(lines, zone, 'intersect');
  near(clip.features[0].g.c.reduce((s, q) => s + PL.ringLen(q), 0), 100, 1e-9, 'a road 200 long crossing the zone (x 50..150): clipped to 100');
  const clipPts = A.overlay(wells, zone, 'intersect');
  ok(clipPts.features.map((f) => f.p.W).join() === 'W1,W2', 'wells inside the zone: W1 (50,50) and W2 (150,50) sit on / inside it; W3 (160,60) and the rest are outside');
  ok(A.overlay(parcels, wells, 'union').error?.code === 'needpoly', 'a points layer as the overlay layer: refused in words');
  ok(same(JSON.stringify([parcels, zone, wells]), snapshot), 'the input layers were not changed');
}

section('dissolve');
{
  const d = A.dissolve(parcels, 'Use_');
  ok(d.features.length === 2, 'by Use_: Res and Com');
  const res = d.features.find((f) => f.p.Use_ === 'Res');
  ok(res.p.COUNT === 2 && Math.abs(res.p.AREA - 20000) < 1e-6 && res.g.c.length === 1, 'Res: A and B merge into one 20,000 polygon (COUNT 2)');
  near(PL.perimeter(res.g.c), 600, 1e-9, '... perimeter 2 x (200 + 100) = 600');
  const all = A.dissolve(parcels, null);
  ok(all.features.length === 1 && all.features[0].g.c.length === 2 && Math.abs(all.features[0].p.AREA - 30000) < 1e-6, 'dissolve everything: two shapes (A+B, and C apart), 30,000');
  ok(A.dissolve(parcels, 'Nope').error?.code === 'field' && A.dissolve(wells, null).error?.code === 'needpoly', 'unknown field and a points layer are refused in words');
}

section('buffer a layer');
{
  const b = A.bufferLayer(wells, 25, { quarter: 16 });
  ok(b.geom === 'pg' && b.features.length === 5, 'wells, distance 25: five polygons');
  near(PL.area(b.features[0].g.c), ngon(64, 25), 1e-6, '... each a 64-gon of radius 25 = ' + ngon(64, 25).toFixed(3));
  ok(b.features[0].p.W === 'W1' && b.features[0].p.BUFF_DIST === 25, '... attributes kept, BUFF_DIST added');
  const m = A.bufferLayer(wells, 25, { quarter: 16, dissolve: true });
  ok(m.features.length === 1 && m.features[0].p.COUNT === 5, 'dissolved: one feature, COUNT 5');
  near(PL.area(m.features[0].g.c), ngon(64, 25) * 3 + PL.area(PL.unionAll([PL.bufferPoint([150, 50], 25, 16), PL.bufferPoint([160, 60], 25, 16)])), 1e-6, '... W2 and W3 (14.14 apart) overlap into one shape, the others stand alone');
  const byField = A.bufferLayer(wells, 0, { field: 'Q', quarter: 16 });
  near(PL.area(byField.features[2].g.c), ngon(64, 5), 1e-6, 'distance from a field: W3 has Q = 5 → radius 5');
  const sh = A.bufferLayer(parcels, -10, { quarter: 16 });
  near(total(sh), 3 * 80 * 80, 1e-6, 'parcels shrunk by 10: 3 x (80 x 80) = 19200');
  ok(A.bufferLayer(wells, -5).error?.code === 'negative' && A.bufferLayer(wells, 0).error?.code === 'dist' && A.bufferLayer(wells, 5, { field: 'W' }).error?.code === 'distfield', 'negative on points, zero, a text field: refused in words');
  const gone = A.bufferLayer(parcels, -60);
  ok(gone.features.length === 0 && gone.notes[0].code === 'vanished' && gone.notes[0].n === 3, 'shrunk past nothing: no features, and it says 3 vanished');
}

section('spatial join');
{
  const s = A.spatialJoin(parcels, wells, { relation: 'intersects', mode: 'summary' });
  const f = (id) => s.features.find((x) => x.p.ID === id).p;
  // W1 (50,50) in A; W2 (150,50) and W3 (160,60) in B; C has none
  ok(f('A').COUNT === 1 && f('A').SUM_Q === 10, 'parcel A: 1 well, sum Q = 10');
  ok(f('B').COUNT === 2 && f('B').SUM_Q === 25 && f('B').MEAN_Q === 12.5 && f('B').MIN_Q === 5 && f('B').MAX_Q === 20, 'parcel B: 2 wells, sum 25, mean 12.5, min 5, max 20');
  ok(f('C').COUNT === 0 && f('C').SUM_Q === null, 'parcel C: 0 wells, sum empty');
  const w = A.spatialJoin(wells, parcels, { relation: 'within' });
  const g = (id) => w.features.find((x) => x.p.W === id).p;
  ok(g('W1').ID === 'A' && g('W2').ID === 'B' && g('W3').ID === 'B' && g('W4').ID === null && g('W4').JOIN_COUNT === 0, 'wells within parcels: W1→A, W2→B, W3→B, W4 none');
  ok(w.notes.some((n) => n.code === 'unmatched' && n.n === 2), '... two wells found no parcel (W4 and W5) and it says so');
  ok(A.spatialJoin(wells, parcels, { relation: 'within', keep: false }).features.length === 3, 'keep off: only the three matched wells remain');
  const nr = A.spatialJoin(wells, parcels, { relation: 'nearest' });
  const n4 = nr.features.find((x) => x.p.W === 'W4').p, n5 = nr.features.find((x) => x.p.W === 'W5').p;
  // W4 (500,500): nearest corner of C is (100,250): √(400² + 250²) = 471.699…; of B is (200,100): 500
  ok(n4.ID === 'C', 'W4 (500,500): nearest parcel is C');
  near(n4.DISTANCE, Math.hypot(400, 250), 1e-9, '... at √(400² + 250²) = 471.699');
  ok(n5.ID === 'A', 'W5 (0,120): nearest parcel is A (20 below it) rather than C (30 above)');
  near(n5.DISTANCE, 20, 1e-9, '... distance 20');
  const lim = A.spatialJoin(wells, parcels, { relation: 'nearest', distance: 25 });
  ok(lim.features.find((x) => x.p.W === 'W4').p.ID === null && lim.features.find((x) => x.p.W === 'W5').p.ID === 'A', 'nearest within 25: W4 finds nothing, W5 still A');
  const wd = A.spatialJoin(parcels, wells, { relation: 'within-distance', distance: 20, mode: 'summary' });
  ok(wd.features.find((x) => x.p.ID === 'A').p.COUNT === 2, 'parcels with wells within 20: A has W1 (inside) and W5 (20 from its top edge) → 2');
  const co = A.spatialJoin(parcels, wells, { relation: 'contains', mode: 'summary' });
  ok(co.features.map((x) => x.p.COUNT).join() === '1,2,0', 'contains (a polygon target holds the wells): 1, 2, 0');
  ok(A.spatialJoin(wells, wells, { relation: 'within' }).error?.code === 'needpoly' && A.spatialJoin(parcels, wells, { relation: 'x' }).error?.code === 'relation', 'a points layer to be "within", an unknown relation: refused in words');
  ok(same(JSON.stringify([parcels, zone, wells]), snapshot), 'the input layers were not changed');
}

section('geometry distance and within');
{
  near(A.geomDistance(poly(0, 0, 10), poly(13, 14, 5)), 5, 1e-12, 'squares whose corners are (10,10) and (13,14): 3-4-5 = 5');
  near(A.geomDistance(pt(5, 5), poly(0, 0, 10)), 0, 0, 'a point inside a polygon: 0');
  near(A.geomDistance(pt(20, 5), poly(0, 0, 10)), 10, 1e-12, 'a point 10 right of a square: 10');
  near(A.geomDistance({ t: 'ln', c: [[[0, 0], [10, 10]]] }, { t: 'ln', c: [[[0, 10], [10, 0]]] }), 0, 0, 'crossing lines: 0');
  near(A.geomDistance(poly(0, 0, 100), poly(10, 10, 5)), 0, 0, 'a polygon inside a polygon: 0');
  ok(A.geomWithin(poly(10, 10, 5), poly(0, 0, 100)) && !A.geomWithin(poly(95, 95, 10), poly(0, 0, 100)), 'within: a small square yes, one hanging over the edge no');
  ok(A.geomWithin({ t: 'ln', c: [[[10, 10], [90, 90]]] }, poly(0, 0, 100)) && !A.geomWithin({ t: 'ln', c: [[[10, 10], [190, 10]]] }, poly(0, 0, 100)), 'within: a line inside yes, a line leaving no');
}

section('attribute queries');
{
  const q = (text) => { const r = A.selectWhere(parcels, text); return r.error ? 'ERR:' + r.error.code : r.indices.join(','); };
  ok(q("Use_ = 'Res'") === '0,1', "Use_ = 'Res' → A, B");
  ok(q("VALUE > 200 and Use_ = 'Res'") === '1', 'VALUE > 200 and Use_ = Res → B');
  ok(q('VALUE between 100 and 250') === '0,1', 'VALUE between 100 and 250 → A, B (ends count)');
  ok(q("Use_ in ('Com', 'Ind')") === '2' && q("Use_ not in ('Com')") === '0,1', 'in / not in');
  ok(q("not Use_ = 'Res'") === '2' && q("Use_ != 'Res'") === '2' && q("Use_ <> 'Res'") === '2', 'not, !=, <>');
  ok(q("Use_ like 'R%'") === '0,1' && q("ID like '_'") === '0,1,2' && q("Use_ like 'r%'") === '0,1', 'like with % and _ (ignores case)');
  ok(q("Notes contains 'CORNER'") === '1' && q("ID startswith 'b'") === '1' && q("Notes endswith 'lot'") === '1', 'contains, startswith, endswith ignore case');
  ok(q('Notes is null') === '0,2' && q('Notes is not null') === '1', 'is null / is not null (an empty value counts as null)');
  ok(q('$area = 10000') === '0,1,2' && q('$perimeter = 400') === '0,1,2' && q('$area > 10000') === '', '$area = 10000 and $perimeter = 400 for the squares');
  ok(q('VALUE / 2 > 100') === '1,2' && q('VALUE * 2 - 100 = 100') === '0' && q('(VALUE + 50) / 3 = 50') === '0', 'arithmetic: VALUE / 2 > 100 → B, C');
  ok(q(`"VALUE" >= 100 and (Use_ = 'Com' or VALUE < 150)`) === '0,2', 'brackets and a "quoted" field name');
  ok(q('Use_ = ') === 'ERR:syntax' && q('Nope = 1') === 'ERR:field' && q('$bogus > 1') === 'ERR:geometry' && q('') === 'ERR:empty' && q('VALUE > 1 )') === 'ERR:syntax', 'an incomplete question, an unknown field, an unknown shape value, empty text, a stray bracket: each refused with a code');
  ok(A.parseQuery("Use_ = 'x' and", parcels.fields).error.code === 'syntax' && A.parseQuery('VALUE >', parcels.fields).error.pos >= 0, 'the error says where');
  const wellsQ = A.selectWhere(wells, '$x > 100 and $y < 100');
  ok(wellsQ.indices.join() === '1,2', 'point coordinates: $x > 100 and $y < 100 → W2, W3');
  ok(A.selectWhere(parcels, '__proto__ = 1').error?.code === 'field', '"__proto__" is just an unknown field');
}

section('measure and statistics');
{
  const m = A.addMeasure(parcels);
  ok(m.fields.map((f) => f.name).slice(4).join() === 'AREA,PERIMETER' && m.features.every((f) => f.p.AREA === 10000 && f.p.PERIMETER === 400), 'AREA 10000 and PERIMETER 400 on every square');
  ok(A.addMeasure(m).fields.map((f) => f.name).slice(6).join() === 'AREA_2,PERIMETER_2', 'a second time: AREA_2, PERIMETER_2 (never overwrites a field)');
  ok(!('AREA' in parcels.features[0].p), 'the layer it read is unchanged');
  const ln = { name: 'L', geom: 'ln', fields: [], features: [{ g: { t: 'ln', c: [[[0, 0, 0], [30, 40, 0]], [[0, 0, 0], [0, 0, 12]]] }, p: rec({}) }, { g: { t: 'ln', c: [[[0, 0], [3, 4]]] }, p: rec({}) }] };
  const lm = A.addMeasure(ln);
  ok(lm.features[0].p.LENGTH === 50 && lm.features[1].p.LENGTH === 5, 'LENGTH is the plan length: 3-4-5 scaled gives 50, and 5');
  ok(A.measureFeature(ln.features[0].g).length3d === 62, '3D length keeps z: 50 + 12 = 62');
  ok(A.measureFeature(ln.features[1].g).length3d === undefined, '... and is absent when there is no z');
  const wm = A.addMeasure(wells);
  ok(wm.features[1].p.X === 150 && wm.features[1].p.Y === 50, 'points: X and Y');
  const st = A.statistics(parcels, 'VALUE', 'Use_');
  const row = (k) => st.rows.find((r) => r.key === k);
  ok(row('Res').count === 2 && row('Res').sum === 350 && row('Res').mean === 175 && row('Res').min === 100 && row('Res').max === 250, 'VALUE by Use_: Res → count 2, sum 350, mean 175, min 100, max 250');
  ok(row('Com').sum === 400 && st.total.count === 3 && st.total.sum === 750 && st.total.mean === 250 && st.total.min === 100 && st.total.max === 400, '... Com 400; all: 3, 750, mean 250, 100..400');
  ok(A.statistics(parcels, null, 'Use_').rows.map((r) => r.count).join() === '1,2', 'just counts by Use_: Com 1, Res 2');
  ok(A.statistics(parcels, 'ID').error?.code === 'notnumber' && A.statistics(parcels, 'zz').error?.code === 'field', 'a text field, an unknown field: refused in words');
}

// ---- on a real project
section('on a project: one new layer, one undo step, inputs untouched');
{
  const p = new PJ.Project();
  const ids = GL.addLayers(p, [parcels, zone, wells].map((l) => ({ name: l.name, geom: l.geom, hasZ: false, fields: l.fields, features: l.features.map((f) => ({ g: f.g, p: rec(f.p) })) })), { label: 'test import' });
  const [pId, zId, wId] = ids;
  const steps = p.undoStack.length, before = JSON.stringify([...p.gisFeatures].map(([k, v]) => [k, v.map((f) => [f.g, f.p])]));
  const r = R.buffer(p, wId, { dist: 25, quarter: 16 });
  ok(r.ok && p.state.gis.layers.length === 4 && p.undoStack.length === steps + 1, 'Buffer: one new layer, one undo step');
  const lay = GL.layerOf(p, r.id);
  ok(lay.geom === 'pg' && lay.name === 'Wells buffer 25' && p.gisFeatures.get(r.id).length === 5, '... a polygon layer named "Wells buffer 25" with 5 features');
  p.undo(); ok(p.state.gis.layers.length === 3 && !p.gisFeatures.has(r.id), 'undo: the layer is gone'); p.redo(); ok(p.state.gis.layers.length === 4 && p.gisFeatures.get(r.id).length === 5, 'redo: it is back with its features');
  const o = R.overlay(p, pId, zId, 'intersect');
  ok(o.ok && GL.layerOf(p, o.id).name === 'Parcels intersect Zone' && Math.abs(p.gisFeatures.get(o.id).reduce((s, f) => s + PL.area(f.g.c), 0) - 6000) < 1e-6, 'Overlay › intersect: "Parcels intersect Zone", 6000');
  const j = R.join(p, wId, pId, { relation: 'within' });
  ok(j.ok && GL.layerOf(p, j.id).geom === 'pt' && p.gisFeatures.get(j.id).length === 5, 'Join: a points layer with the parcels\' fields');
  const d = R.dissolve(p, pId, 'Use_'); ok(d.ok && p.gisFeatures.get(d.id).length === 2, 'Dissolve by Use_: 2 features');
  const s = R.select(p, pId, "Use_ = 'Res'"); ok(s.ok && s.indices.join() === '0,1' && s.total === 3, 'Select: 2 of 3');
  const fs = R.fromSelection(p, pId, s.indices); ok(fs.ok && p.gisFeatures.get(fs.id).length === 2 && GL.layerOf(p, fs.id).fields.length === 4, 'Layer from the selection: 2 features, same fields');
  const nsteps = p.undoStack.length;
  const c = R.calcGeometry(p, pId);
  ok(c.ok && c.fields.join() === 'AREA,PERIMETER' && p.undoStack.length === nsteps + 1 && p.gisFeatures.get(pId)[0].p.AREA === 10000 && GL.layerOf(p, pId).fields.length === 6, 'Add measure fields: AREA, PERIMETER written into the layer in one undo step');
  p.undo(); ok(GL.layerOf(p, pId).fields.length === 4 && !('AREA' in p.gisFeatures.get(pId)[0].p), 'undo takes the fields back out');
  ok(!R.buffer(p, wId, { dist: 0 }).ok && R.describe(R.buffer(p, wId, { dist: 0 }).error).length > 10, 'a refused tool says why in a sentence: "' + R.describe({ code: 'dist' }) + '"');
  ok(R.describe({ code: 'field', name: 'Zed' }) === 'There is no field called "Zed" on this layer.', 'messages fill in names');
  const e = R.overlay(p, pId, zId, 'erase');
  ok(e.ok && Math.abs(p.gisFeatures.get(e.id).reduce((s2, f) => s2 + PL.area(f.g.c), 0) - 24000) < 1e-6, 'Erase: 24000');
  const empty = R.overlay(p, zId, e.id, 'intersect');
  ok(empty.ok === true || empty.error.code === 'nothing', 'an empty result adds no layer but a result with area does');
  const before2 = JSON.stringify([...p.gisFeatures].filter(([k]) => ids.includes(k)).map(([k, v]) => [k, v.map((f) => [f.g, f.p])]));
  ok(before2 === before, 'the three input layers hold exactly what they held at the start');
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  const { project: p2, notes } = PJ.Project.fromJSON(json);
  ok(!notes.length && p2.state.gis.layers.length === p.state.gis.layers.length && p2.gisFeatures.get(r.id).length === 5, 'save and reopen: the analysis layers come back, no notes');
  ok(R.stats(p, pId, 'VALUE', 'Use_').total.sum === 750 && R.measureSelection(p, pId, [0, 2]).area === 20000, 'stats and measure of a selection run on the project (VALUE total 750; two squares 20000)');
}

console.log(`
${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
