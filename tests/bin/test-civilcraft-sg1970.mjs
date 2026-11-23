#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sg1970.mjs — CivilCraft 0.10.1, suggestion #1970 (feature lines, pads, grading), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-sg1970.mjs [--build dev]
 *
 * Every number is worked by hand in the comment above its check.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; return m ? { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true } : next(spec, ctx); } });
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await imp('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { snapTargets, snapSegments, segmentSnap } = await imp('snap.js');
const FL = await imp('featureline.js');
const PE = await imp('pad-edit.js');
const { Project } = await imp('project.js');

let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const section = (s) => console.log('\n' + s);

// ---------------------------------------------------------------------------------------------------------------------
section('Snaps on lines (Pad 3)');
// A pad (0,0)-(100,0)-(100,50)-(0,50) at elevation 10 whose corner 2 (100,50) carries z = 12, and a feature line from (50,-20,z 0)
// to (50,70,z 9): it crosses the pad's bottom side at (50,0) (t = 20/90, z = 2) and its top side at (50,50).
const state = {
  pads: [{ id: 'p1', z: 10, pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50, z: 12 }, { x: 0, y: 50 }] }],
  features: [{ id: 'f1', closed: false, pts: [{ x: 50, y: -20, z: 0 }, { x: 50, y: 70, z: 9 }] }],
  parcels: [{ id: 'r1', pts: [{ x: 200, y: 0 }, { x: 240, y: 0 }, { x: 240, y: 30 }] }],
};
const segs = snapSegments(state);
ok(segs.length === 4 + 1 + 3, 'pad sides, the feature line and the parcel sides are snap lines (4 + 1 + 3)', segs.length);
const T = snapTargets(state);
ok(T.find((q) => q.x === 100 && q.y === 50)?.z === 12 && T.find((q) => q.x === 0 && q.y === 0)?.z === 10, 'a pad corner target carries its own elevation, else the pad elevation');
ok(T.find((q) => q.x === 50 && q.y === 70)?.z === 9, 'a feature-line vertex target carries its elevation');
let h = segmentSnap(segs, { x: 51, y: 1 }, 3);
ok(h && h.kind === 'cross' && near(h.x, 50) && near(h.y, 0), 'near (50, 0) the crossing of the pad side and the feature line wins', h);
// z at the crossing comes from the first line listed (the pad side at pad elevation 10)
ok(h && near(h.z, 10), 'the crossing reads its elevation along the first line (the pad side, 10)', h?.z);
h = segmentSnap(segs, { x: 49, y: 25.5 }, 3);
// the feature line's middle is (50, 25), z = 4.5
ok(h && h.kind === 'mid' && near(h.x, 50) && near(h.y, 25) && near(h.z, 4.5), 'near its middle the feature line gives Midpoint (50, 25) at z 4.5', h);
h = segmentSnap(segs, { x: 20, y: 1 }, 3);
ok(h && h.kind === 'near' && near(h.x, 20) && near(h.y, 0) && near(h.z, 10), 'elsewhere on a pad side: Nearest (20, 0) at the pad elevation', h);
// from the last point placed (30, 40): the foot on the bottom side is (30, 0); the pointer at (31, 1) is within 3 of it
h = segmentSnap(segs, { x: 31, y: 1 }, 3, { from: { x: 30, y: 40 } });
ok(h && h.kind === 'perp' && near(h.x, 30) && near(h.y, 0), 'with a last point at (30, 40) the pointer near (30, 0) gives Perpendicular', h);
h = segmentSnap(segs, { x: 40, y: 1 }, 3, { from: { x: 30, y: 40 } });
ok(h && h.kind === 'near' && near(h.x, 40), 'the perpendicular foot 10 away is out of reach: Nearest instead', h);
// the right side from (100,0) z 10 to (100,50) z 12: at y = 12.5 the elevation is 10 + 2 × 0.25 = 10.5
h = segmentSnap(segs, { x: 99, y: 12.5 }, 3);
ok(h && h.kind === 'near' && near(h.z, 10.5), 'a sloped pad side reads z along it: 10.5 a quarter of the way up', h);
ok(segmentSnap(segs, { x: 30, y: 25 }, 3) === null, 'nothing within reach: no snap');
ok(segmentSnap(segs, { x: 220, y: 0.5 }, 3)?.z === undefined, 'a parcel side has no elevation');
ok(snapSegments(state, { skip: state.pads[0].pts[1] }).length === 4, 'the object whose corner is being dragged is left out', snapSegments(state, { skip: state.pads[0].pts[1] }).length);
// an arc: the half circle from (0,0) to (20,0) with bulge 1 (turning left): centre (10,0), radius 10, through (10,-10)
const arcSegs = snapSegments({ features: [{ id: 'f2', closed: false, pts: [{ x: 0, y: 0, z: 0, b: 1 }, { x: 20, y: 0, z: 2 }] }] });
ok(arcSegs.length > 8 && arcSegs.every((s) => Math.abs(Math.hypot((s.a.x + s.b.x) / 2 - 10, (s.a.y + s.b.y) / 2) - 10) < 0.02), 'an arc is snapped along its pieces (all within 0.02 of the circle)', arcSegs.length);

// ---------------------------------------------------------------------------------------------------------------------
section('Feature line vertices (Feature lines 1)');
// (0,0,z 100) → (100,0,z 104) → (100,50,z 104): the first segment rises 4 in 100 (4 %)
const f = { id: 'f1', name: 'L', closed: false, use: 'eg', pts: [{ x: 0, y: 0, z: 100 }, { x: 100, y: 0, z: 104 }, { x: 100, y: 50, z: 104 }] };
let g = FL.insertVertex(f, 0, 0.25);
ok(g.pts.length === 4 && near(g.pts[1].x, 25) && near(g.pts[1].y, 0) && near(g.pts[1].z, 101), 'a vertex a quarter along the first segment sits at (25, 0) z 101', g.pts[1]);
ok(FL.segments(g).slice(0, 2).every((s) => near(s.grade, 0.04)), 'both halves keep the 4 % grade');
ok(f.pts.length === 3, 'the line given is not changed');
ok(FL.insertVertex(f, 2, 0.5) === f && FL.insertVertex(f, 0, 0) === f && FL.insertVertex(f, 0, 1) === f, 'past the last segment or at an end: nothing added');
g = FL.moveVertex(f, 1, 90, 10);
ok(g.pts[1].x === 90 && g.pts[1].y === 10 && g.pts[1].z === 104 && f.pts[1].x === 100, 'a moved vertex keeps its elevation');
g = FL.removeVertex(f, 1);
ok(g && g.pts.length === 2 && g.pts[1].y === 50, 'removing the middle vertex leaves the two ends');
ok(FL.removeVertex(g, 0) === null, 'a two-vertex line refuses to lose one');
const tri = { ...f, closed: true };
ok(FL.removeVertex(tri, 0) === null, 'a closed line keeps three vertices');
// the same half circle (0,0) → (20,0), bulge 1: centre (10,0), radius 10; z 0 → 2
const arc = { id: 'f2', closed: false, pts: [{ x: 0, y: 0, z: 0, b: 1 }, { x: 20, y: 0, z: 2 }] };
g = FL.insertVertex(arc, 0, 0.5);
// halfway round: on the circle, 10 from the centre, z 1; each half sweeps 90°, bulge tan(22.5°) = 0.41421356
ok(g.pts.length === 3 && near(Math.hypot(g.pts[1].x - 10, g.pts[1].y), 10, 1e-9) && near(g.pts[1].z, 1), 'a vertex added on an arc sits on the circle at the middle elevation', g.pts[1]);
ok(near(g.pts[0].b, Math.tan(Math.PI / 8)) && near(g.pts[1].b, Math.tan(Math.PI / 8)), 'the arc becomes two quarter circles (bulge 0.4142 each)', [g.pts[0].b, g.pts[1].b]);
ok(near(FL.stations(g)[2], Math.PI * 10, 1e-9), 'and its length is still π × 10', FL.stations(g)[2]);
const back = FL.removeVertex(g, 1);
ok(back.pts.length === 2 && back.pts[0].b === undefined, 'removing a vertex between two arcs leaves a straight segment');
// nearest place: (40, 7) is 7 above the first segment at 40 % → z 101.6
let nr = FL.nearestOnFeature(f, 40, 7);
ok(nr.i === 0 && near(nr.u, 0.4) && near(nr.z, 101.6) && near(nr.d, 7), 'the nearest place to (40, 7) is 40 % along segment 1, z 101.6, 7 away', nr);
nr = FL.nearestOnFeature(arc, 10, -4);
// the arc with bulge +1 from (0,0) to (20,0) turns left: it passes below the chord through (10, -10); (10, -4) is 6 from it
ok(near(nr.x, 10, 1e-9) && near(nr.y, -10, 1e-9) && near(nr.d, 6, 1e-9) && near(nr.u, 0.5), 'on an arc the nearest place is exact: (10, -10), halfway', nr);

// ---------------------------------------------------------------------------------------------------------------------
section('Pad corners (Pad 1, 2, 4)');
// a 100 × 50 pad at 10; side 1 (corner 2 → 3) is a wall, side 2 has its own slopes
const pad = { id: 'p1', name: 'Pad', z: 10, cut: 2, fill: 3, pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }],
  sides: { edges: [null, { wall: true }, { cut: 4, fill: 5 }], wallT: 1, wallLimit: 3.3, maxSlope: null, u: 'ft' } };
ok(PE.cornerZ(pad, 0) === 10 && !PE.hasCornerZ(pad), 'a flat pad: every corner at the pad elevation');
let q = PE.setCornerZ(pad, 1, 12);
ok(q.pts[1].z === 12 && PE.cornerZ(q, 1) === 12 && PE.cornerZ(q, 0) === 10 && pad.pts[1].z === undefined && PE.hasCornerZ(q), 'corner 2 raised to 12; the others follow the pad');
// grades: side 1 (0,0)→(100,0): +2 in 100 = +2 %; side 2 (100,0)→(100,50): 10 − 12 = −2 in 50 = −4 %; side 3 and 4 level
const eg = PE.edgeGrades(q);
ok(near(eg[0], 0.02) && near(eg[1], -0.04) && near(eg[2], 0) && near(eg[3], 0), 'side grades +2 %, −4 %, 0, 0', eg);
ok(PE.setCornerZ(q, 1, null).pts[1].z === undefined, 'an emptied Z goes back to the pad elevation');
ok(!PE.hasCornerZ(PE.levelPad(q)) && PE.levelPad(q).pts.length === 4, 'Flat removes every corner elevation');
// insert on side 1 (corner 1 → 2 of q) at 25 %: (25, 0); the side runs 10 → 12 so z = 10.5
let r = PE.insertCorner(q, 0, 0.25);
ok(r.pts.length === 5 && near(r.pts[1].x, 25) && near(r.pts[1].y, 0) && near(r.pts[1].z, 10.5), 'a corner added a quarter along a sloped side: (25, 0) at 10.5', r.pts[1]);
ok(r.sides.edges.length === 4 && r.sides.edges[0] === null && r.sides.edges[1] === null && r.sides.edges[2]?.wall === true && r.sides.edges[3]?.cut === 4, 'the side settings move along: the wall is now side 3, the own slopes side 4', r.sides.edges);
// insert on the wall side: both halves are walls
r = PE.insertCorner(pad, 1, 0.5);
ok(r.pts[2].x === 100 && r.pts[2].y === 25 && r.pts[2].z === undefined && r.sides.edges[1]?.wall && r.sides.edges[2]?.wall && r.sides.edges[3]?.cut === 4, 'a corner added on a wall side: both halves stay a wall; a flat pad gives it no own elevation', r.sides.edges);
// remove corner 3 (index 2) of the original: sides become [null, wall (now 2 → 4)], the own-slope side is gone
ok(PE.removeCorner(pad, 2) === null || PE.removeCorner(pad, 2).pts.length === 3, 'a four-corner pad can lose one');
r = PE.removeCorner(pad, 2);
ok(r.pts.length === 3 && r.sides.edges.length === 2 && r.sides.edges[1]?.wall === true, 'removing corner 3 drops the side that started there; the wall side before it now reaches corner 4', r.sides.edges);
ok(PE.removeCorner(r, 0) === null, 'a triangle refuses to lose a corner');
const ns = PE.nearestSide(pad, 60, -4);
ok(ns.k === 0 && near(ns.u, 0.6) && near(ns.d, 4), 'the side nearest (60, −4) is side 1 at 60 %');
const plain = PE.insertCorner({ z: 1, pts: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 10 }] }, 2, 0.5);
ok(plain.pts.length === 4 && plain.sides === undefined && plain.pts[3].x === 0 && plain.pts[3].y === 5, 'a pad without side settings gets none; the closing side splits too', plain.pts[3]);

section('The project file keeps corner elevations (Pad 4: a ramp can be edited after it is saved)');
{
  const file = { format: 'civilcraft-project', version: 1, name: 't', units: 'ft', points: [], seq: 9, alignments: [], network: null,
    pads: [{ id: 'p1', name: 'Ramp', z: 11, cut: 2, fill: 2, pts: [{ x: 0, y: 0, z: 10 }, { x: 50, y: 0, z: 12 }, { x: 50, y: 10, z: 12 }, { x: 0, y: 10, z: 'x' }] }] };
  const p = Project.fromJSON(file).project;
  const pts = p.state.pads[0].pts;
  ok(pts[0].z === 10 && pts[1].z === 12 && pts[2].z === 12, 'corner elevations survive opening a file', pts);
  ok(!('z' in pts[3]), 'a bad corner elevation is dropped (that corner follows the pad)');
  const again = Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project.state.pads[0].pts;
  ok(again[1].z === 12 && !('z' in again[3]), 'and a save and open round trip keeps them');
  // one undo step per edit
  const n0 = p.undoStack.length;
  p.change('z', (s) => { s.pads[0] = PE.setCornerZ(s.pads[0], 3, 10); });
  ok(p.undoStack.length === n0 + 1 && p.state.pads[0].pts[3].z === 10, 'a corner elevation is one undo step');
  p.undo();
  ok(!('z' in p.state.pads[0].pts[3]), 'undo puts the corner back');
}

// ---------------------------------------------------------------------------------------------------------------------
const { gridVolume } = await imp('grading.js');
const flatGround = () => { const p = new Project(), pts = []; let n = 1; for (let x = 0; x <= 200; x += 20) for (let y = 0; y <= 200; y += 20) pts.push({ n: String(n++), x, y, z: 100, d: '' }); p.setPoints(pts, 'flat'); return p; };
const line = (id, pts, more = {}) => ({ id, name: 'Line ' + id, pts: pts.map(([x, y, z]) => ({ x, y, z })), closed: false, use: 'design', daylight: false, cut: 2, fill: 3, ...more });

section('A feature line inside a pad shapes its interior (Pad 5)');
{
  // Flat ground at 100 (a 200 × 200 grid every 20). A pad 120 × 80 from (40, 60) to (160, 140) at 100 (level with the ground, so
  // no slopes) and a design feature line along its middle from (60, 100) to (140, 100) at 101: a ridge. The pad becomes a hip
  // roof: two trapezoids (parallel sides 120 and 80, 40 apart) rising 0 → 1, and two triangles (base 80, 20 deep) rising 0 → 1.
  //   trapezoid: ∫0..40 (y / 40)(120 − y) dy = (60·40² − 40³ / 3) / 40 = 1,866.667     triangle: (80 · 20 / 2) · 1 / 3 = 266.667
  //   fill = 2 × 1,866.667 + 2 × 266.667 = 4,266.667
  const p = flatGround();
  p.change('pad', (s) => { s.pads.push({ id: 'p1', name: 'Pad', pts: [{ x: 40, y: 60 }, { x: 160, y: 60 }, { x: 160, y: 140 }, { x: 40, y: 140 }], z: 100, cut: 2, fill: 3 }); });
  ok(near(p.volumes().fill, 0, 1e-6) && near(p.volumes().cut, 0, 1e-6), 'the pad alone, level with the ground: no cut, no fill');
  const n0 = p.undoStack.length;
  p.change('ridge', (s) => { s.features.push(line('f1', [[60, 100, 101], [140, 100, 101]])); });
  const g = p.graded(), sf = g.surface;
  ok(g.items.some((it) => it.kind === 'breakline' && it.id === 'f1' && !it.problems.length), 'the open design line is a breakline item of the graded surface', g.items.map((it) => [it.kind, it.problems]));
  ok(near(sf.elevationAt(100, 100), 101, 1e-9), 'the surface is at 101 on the ridge');
  ok(near(sf.elevationAt(100, 80), 100.5, 1e-9), 'halfway from the pad edge to the ridge: 100.5');
  ok(near(sf.elevationAt(50, 100), 100.5, 1e-9), 'halfway up the hip at the end: 100.5');
  ok(near(sf.elevationAt(100, 60), 100, 1e-9) && near(sf.elevationAt(20, 100), 100, 1e-9), 'the pad edge and the ground outside stay at 100');
  const v = p.volumes(1);
  // Across the middle (x = 80 … 120) the section is a triangle 80 wide and 1 high = 40 sq ft, so the fill there is 40 × 40 = 1,600 exactly.
  const strip = gridVolume(p.eg().surface, sf, { cell: 1, bounds: { minX: 80, minY: 60, maxX: 120, maxY: 140 } });
  ok(near(strip.fill, 1600, 1e-6) && near(strip.cut, 0, 1e-9), 'fill across the middle 40 of the pad is exactly 1,600 (40 sq ft × 40)', strip.fill);
  // The whole pad: the ideal hip roof is 4,266.67; the triangles in the four corners join points of the pad edge to each other and
  // stay level, so the surface holds a little less there. It must be under the ideal and over 90 % of it.
  ok(v.fill < 4266.667 && v.fill > 4266.667 * 0.9 && v.cut < 1e-6, 'the whole pad: just under the ideal hip roof of 4,266.67 (level triangles in the corners)', [v.fill, v.cut]);
  ok(v.items.length === 1 && v.items[0].id === 'p1' && Math.abs(v.items[0].fill - v.fill) < 1e-6, 'it is counted in the pad\'s own row (the line lies inside the pad)', v.items.map((x) => [x.id, x.fill]));
  ok(g.items.find((it) => it.id === 'f1').inside === true, 'the line is marked as inside the pad');
  ok(p.undoStack.length === n0 + 1, 'adding the line was one undo step');
  p.undo();
  ok(near(p.graded().surface.elevationAt(100, 100), 100, 1e-9) && near(p.volumes().fill, 0, 1e-6), 'undo: the pad is flat again');
  p.redo();
  // a sloped pad (Pad 1) with the same ridge: corner Z 100, 100, 102, 102 → the far side is 2 higher; the ridge still wins on its line
  p.change('slope', (s) => { s.pads[0].pts[2].z = 102; s.pads[0].pts[3].z = 102; });
  ok(near(p.graded().surface.elevationAt(100, 100), 101, 1e-9), 'on a sloped pad the surface still passes through the line');
  const again = Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(again.state.features[0].use === 'design' && again.state.pads[0].pts[2].z === 102 && near(again.graded().surface.elevationAt(100, 100), 101, 1e-9), 'saved and opened again: the same surface');
}

section('A feature line as a breakline of the proposed surface (Grading 1)');
{
  // Flat ground at 100, grid every 20. A design line from (20, 110) to (180, 110) at 99 runs midway between the survey rows
  // y = 100 and y = 120: a V ditch 1 deep and 20 wide. Between x = 40 and 160 its section is a triangle of 20 × 1 / 2 = 10 sq ft,
  // so the cut there is 10 × 120 = 1,200 cu ft exactly (cells of 1 never straddle the ditch line or a survey row).
  const p = flatGround();
  ok(p.graded().surface === null, 'no design yet: no graded surface');
  p.change('ditch', (s) => { s.features.push(line('f1', [[20, 110, 99], [180, 110, 99]])); });
  const g = p.graded(), sf = g.surface, it = g.items[0];
  ok(sf && it.kind === 'breakline' && !it.problems.length && it.inside === false, 'the line alone makes a graded surface');
  ok(near(sf.elevationAt(100, 110), 99, 1e-9) && near(sf.elevationAt(100, 105), 99.5, 1e-9) && near(sf.elevationAt(100, 100), 100, 1e-9) && near(sf.elevationAt(100, 120), 100, 1e-9), 'the ditch: 99 on the line, 99.5 halfway, 100 at the survey rows');
  ok(near(sf.elevationAt(100, 60), 100, 1e-9), 'the ground away from the line is unchanged');
  const mid = gridVolume(p.eg().surface, sf, { cell: 1, bounds: { minX: 40, minY: 90, maxX: 160, maxY: 130 } });
  ok(near(mid.cut, 1200, 1e-6) && near(mid.fill, 0, 1e-9), 'cut between x = 40 and 160 is exactly 1,200 (10 sq ft × 120)', mid.cut);
  // the whole line: 160 long → 1,600 where the section is full; the two ends only add the triangles that reach the end vertices
  const v = p.volumes(1);
  ok(v && v.cut > 1500 && v.cut < 1900 && v.fill < 1e-6, 'the project\'s cut counts the ground the line changed (about 1,600 + the ends)', v?.cut);
  ok(v.items.length === 1 && v.items[0].id === 'f1', 'and the line has its own row');
  ok(it.region && it.region.length >= 6, 'its region is the triangles it touches');
  p.change('off', (s) => { s.features[0].use = 'off'; });
  ok(p.graded().surface === null, 'use Drawn only: out of the surface again');
  p.undo();
  // a line running off the ground: only the part on it is used
  p.change('long', (s) => { s.features[0].pts = [{ x: 100, y: 110, z: 99 }, { x: 180, y: 110, z: 99 }, { x: 400, y: 110, z: 99 }]; });
  const g2 = p.graded();
  ok(g2.surface && g2.items[0].off === 1 && near(g2.surface.elevationAt(150, 110), 99, 1e-9) && g2.surface.elevationAt(300, 110) === null, 'a vertex off the ground is left out; the surface does not grow', g2.items[0].off);
  p.change('away', (s) => { s.features[0].pts = [{ x: 300, y: 110, z: 99 }, { x: 400, y: 110, z: 99 }]; });
  ok(p.graded().surface === null && p.graded().items[0].problems.length === 1, 'a line wholly off the ground is reported and nothing is graded', p.graded().items[0].problems);
  // a closed design line is still the old sloped-pad item, not a breakline
  p.change('closed', (s) => { s.features[0] = line('f1', [[40, 40, 101], [80, 40, 101], [80, 80, 101], [40, 80, 101]], { closed: true }); });
  ok(p.graded().items[0].kind === 'feature', 'a closed design line is graded as before');
}

// ---------------------------------------------------------------------------------------------------------------------
const FG = await imp('feature-grade.js');
const F3 = (pts, more = {}) => ({ id: 'f9', name: 'Src', pts: pts.map(([x, y, z]) => ({ x, y, z })), closed: false, use: 'off', ...more });

section('Slope from a feature line to a surface (Grading 2)');
{
  // Flat ground at 100. A line at 104 from (20, 100) to (180, 100), drawn west to east, so its right is south. Slopes run down
  // (fill) to the ground: 4 high at 2:1 reaches 8 out, at 4:1 reaches 16 out, halfway (3:1) 12 out.
  const p = flatGround(), eg = p.eg().surface;
  const src = F3([[20, 100, 104], [180, 100, 104]]);
  let r = FG.slopeToSurface(src, eg, { side: 1, slope0: 2, slope1: 4 });
  const first = r.pts[0], last = r.pts[r.pts.length - 1], midI = r.rays.findIndex((q) => near(q.d, 80, 1e-9)), mid = r.pts[midI];
  ok(!r.problem && r.missed === 0 && r.pts.length === r.base.length && r.pts.length >= 3, 'every ray reaches the ground', [r.problem, r.missed, r.pts.length]);
  ok(near(first.x, 20, 1e-6) && near(first.y, 92, 1e-5) && near(first.z, 100, 1e-5), 'start: 2:1 down 4 = 8 out → (20, 92) at 100', first);
  ok(near(last.x, 180, 1e-6) && near(last.y, 84, 1e-5) && near(last.z, 100, 1e-5), 'stop: 4:1 down 4 = 16 out → (180, 84) at 100', last);
  ok(mid && near(mid.x, 100, 1e-6) && near(mid.y, 88, 1e-5), 'halfway the slope is 3:1 = 12 out → (100, 88)', mid);
  ok(r.rays.every((q) => q.kind === 'fill'), 'they are all fill slopes (the line is above the ground)');
  // the other side, and a stretch of the line only: from 40 to 120 along it → x 60 … 140
  r = FG.slopeToSurface(src, eg, { side: -1, from: 40, to: 120, slope0: 3, slope1: 3 });
  ok(near(r.pts[0].x, 60, 1e-6) && near(r.pts[0].y, 112, 1e-5) && near(r.pts[r.pts.length - 1].x, 140, 1e-6) && near(r.pts[r.pts.length - 1].y, 112, 1e-5), 'left side, 40 to 120 along the line, 3:1: (60, 112) … (140, 112)', [r.pts[0], r.pts[r.pts.length - 1]]);
  // a line BELOW the ground: a cut slope up to it. 98 on ground 100 at 2:1 → 4 out
  r = FG.slopeToSurface(F3([[20, 100, 98], [180, 100, 98]]), eg, { side: 1, slope0: 2 });
  ok(r.rays.every((q) => q.kind === 'cut') && near(r.pts[0].y, 96, 1e-5), 'a line 2 below the ground: cut slopes 4 out at 2:1', r.pts[0]);
  // a corner: (20,60) → (100,60) → (100,140), right side (outside of the left turn), line at 102, 2:1 → 4 out square to each leg;
  // at the corner the ray runs along the bisector and lands at (104, 56): 4 from both legs
  r = FG.slopeToSurface(F3([[20, 60, 102], [100, 60, 102], [100, 140, 102]]), eg, { side: 1, slope0: 2 });
  const corner = r.pts[r.rays.findIndex((q) => near(q.d, 80, 1e-9))];
  ok(corner && near(corner.x, 104, 1e-4) && near(corner.y, 56, 1e-4), 'at a corner the daylight point is 4 from both legs: (104, 56)', corner);
  // the slope as a closed outline: source stretch, then the daylight line backwards
  r = FG.slopeToSurface(src, eg, { side: 1, slope0: 2, slope1: 2 });
  const poly = FG.slopePolygon(r);
  // a rectangle 160 long and 8 wide = 1,280 sq ft
  const area = Math.abs(poly.reduce((t, q, i) => t + q.x * poly[(i + 1) % poly.length].y - poly[(i + 1) % poly.length].x * q.y, 0)) / 2;
  ok(poly && near(area, 1280, 1e-3) && poly[0].z === 104 && near(poly[poly.length - 1].z, 100, 1e-5), 'the slope outline is 160 × 8 = 1,280 sq ft, from the line (104) to the ground (100)', area);
  // graded: as a closed design line it fills a wedge 4 high at the line, 0 at the daylight: 160 × (8 × 4 / 2) = 2,560 cu ft
  p.change('slope', (s) => { s.features.push({ id: 'f1', name: 'Slope', pts: poly, closed: true, use: 'design', daylight: false, cut: 2, fill: 3 }); });
  const v = p.volumes(1);
  ok(v && Math.abs(v.fill - 2560) < 2560 * 0.01 && v.cut < 1e-6, 'graded as a closed design line it holds 2,560 cu ft of fill (wedge by hand) within 1 %', v && [v.fill, v.cut]);
  ok(near(p.graded().surface.elevationAt(100, 96), 102, 1e-6), 'halfway down the slope the surface is at 102');
  // refusals
  ok(FG.slopeToSurface(src, eg, { slope0: 0 }).problem === 'slope' && FG.slopeToSurface(src, eg, { slope0: 2, from: 50, to: 50 }).problem === 'range' && FG.slopeToSurface(src, null, { slope0: 2 }).problem === 'surface', 'a zero slope, an empty stretch and no surface are refused');
  r = FG.slopeToSurface(F3([[300, 100, 104], [400, 100, 104]]), eg, { slope0: 2 });
  ok(r.problem === 'surface' && r.missed === r.rays.length, 'a line off the surface: no daylight line');
}

section('Longitudinal feature: an offset that changes along the line (Grading 3)');
{
  const src = F3([[0, 0, 100], [100, 0, 100]]);
  // offset 10 → 20 to the right (south), cross slope −2 % → −2 %: z = 100 − 0.02 × offset → 99.8 and 99.6; a straight line
  let r = FG.longOffset(src, { side: 1, off0: 10, off1: 20, mode: 'slope', s0: -0.02, s1: -0.02 });
  ok(!r.problem && r.pts.length === 2 && near(r.pts[0].y, -10) && near(r.pts[0].z, 99.8) && near(r.pts[1].x, 100) && near(r.pts[1].y, -20) && near(r.pts[1].z, 99.6), 'offset 10 → 20 at −2 %: (0, −10, 99.8) to (100, −20, 99.6)', r.pts);
  // both change: offset 10 → 20 and slope −2 % → −4 %. Halfway: offset 15, slope −3 % → z = 100 − 0.45 = 99.55 (not the 99.5 a
  // straight line between the ends would give), so points are added in between
  r = FG.longOffset(src, { side: 1, off0: 10, off1: 20, mode: 'slope', s0: -0.02, s1: -0.04 });
  const m = r.pts.find((q) => near(q.x, 50, 1e-9));
  ok(r.pts.length === 17 && m && near(m.y, -15) && near(m.z, 99.55), 'offset and slope both changing: 17 points, the middle at (50, −15, 99.55)', [r.pts.length, m]);
  ok(near(r.pts[16].z, 100 - 20 * 0.04), 'and the end at 99.2');
  // start and end elevation
  r = FG.longOffset(src, { side: -1, off0: 5, off1: 5, mode: 'elev', z0: 101, z1: 103 });
  ok(near(r.pts[0].y, 5) && r.pts[0].z === 101 && r.pts[1].z === 103, 'left side, 5 off, elevations 101 → 103', r.pts);
  // start elevation + grade along the new line: a 3-4-5 case. Offset 0 → 75 over 100 makes the new line 125 long; 2 % of 125 = 2.5
  r = FG.longOffset(src, { side: 1, off0: 0, off1: 75, mode: 'grade', z0: 50, grade: 0.02 });
  ok(near(r.pts[1].y, -75) && near(r.pts[1].z, 52.5), 'start elevation 50 and +2 % along the new line (125 long): end at 52.5', r.pts[1]);
  // slope out to an elevation: the source falls 100 → 99 … use a level line at 100, target 98 at 4:1 (25 %): 2 down = 8 out
  r = FG.longOffset(src, { side: 1, mode: 'toelev', target: 98, s0: 0.25, s1: 0.25 });
  ok(r.pts.length === 2 && near(r.pts[0].y, -8) && near(r.pts[1].y, -8) && r.pts[0].z === 98, 'a 25 % slope out to elevation 98 from a line at 100: 8 out, at 98', r.pts);
  // a sloping source 100 → 104, target 98 at 50 %: 4 out at the start, 12 out at the end (a straight line: no extra points)
  r = FG.longOffset(F3([[0, 0, 100], [100, 0, 104]]), { side: 1, mode: 'toelev', target: 98, s0: 0.5, s1: 0.5 });
  ok(r.pts.length === 2 && near(r.pts[0].y, -4) && near(r.pts[1].y, -12), 'from a rising line the offset grows: 4 out, then 12 out', r.pts);
  // a corner: (0,0) → (100,0) → (100,100), left side, 10 off: the mitre keeps it parallel: (0,10), (90,10), (90,100)
  r = FG.longOffset(F3([[0, 0, 0], [100, 0, 0], [100, 100, 0]]), { side: -1, off0: 10, off1: 10, mode: 'slope', s0: 0, s1: 0 });
  ok(r.pts.length === 3 && near(r.pts[0].y, 10) && near(r.pts[1].x, 90) && near(r.pts[1].y, 10) && near(r.pts[2].x, 90) && near(r.pts[2].y, 100), 'round a corner the offset is mitred: (0, 10), (90, 10), (90, 100)', r.pts);
  // a stretch only: 20 to 60 along the line
  r = FG.longOffset(src, { side: 1, from: 20, to: 60, off0: 2, off1: 4, mode: 'elev', z0: 1, z1: 2 });
  ok(near(r.pts[0].x, 20) && near(r.pts[0].y, -2) && near(r.pts[1].x, 60) && near(r.pts[1].y, -4), 'from 20 to 60 along the line only', r.pts);
  // refusals: no numbers, a zero slope to an elevation, an inside offset larger than the bend allows (it folds)
  ok(FG.longOffset(src, { mode: 'elev', off0: 1, off1: 1 }).problem === 'numbers' && FG.longOffset(src, { mode: 'toelev', target: 98, s0: 0, s1: 0.1 }).problem === 'slope' && FG.longOffset(src, { from: 10, to: 10, off0: 1 }).problem === 'range', 'missing numbers, a zero slope and an empty stretch are refused');
  ok(FG.longOffset(F3([[0, 0, 0], [100, 0, 0], [100, 100, 0]]), { side: -1, off0: 150, off1: 150, mode: 'slope' }).problem === 'fold', 'an offset 150 inside a corner with 100 legs folds over: refused');
  ok(near(FG.planLength(F3([[0, 0, 0], [30, 40, 9]])), 50), 'plan length of a 3-4-5 line is 50');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
