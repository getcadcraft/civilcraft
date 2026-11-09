#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** test-trim.mjs — cc-nurbs trimmed surfaces (0.8 DC.54 S2): areas against closed forms, watertight cut mesh, loops from curves, doc/STEP round trips. */
import * as S from '../../lib/nurbs/surface.js';
import * as C from '../../lib/nurbs/curve.js';
import * as K from '../../lib/nurbs/construct.js';
import * as T from '../../lib/nurbs/trim.js';
import * as D from '../../lib/nurbs/doc.js';
import * as ST from '../../lib/nurbs/step.js';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
// a flat 100 x 60 mm plate, bilinear, parameters 0..1
const plate = K.ruled(C.line([0, 0, 0], [100, 0, 0]), C.line([0, 60, 0], [100, 60, 0])).surface;
const full = 6000;
ok(near(T.area(plate, null), full, 1e-9), 'untrimmed area');
// rectangle in the middle: u .25..75 -> 50 mm, v .2..0.7 -> 30 mm
let tr = T.addLoop(plate, null, T.rectLoop(plate, 0.25, 0.75, 0.2, 0.7));
ok(near(T.area(plate, tr), 1500, 1e-6), 'rect outer area', String(T.area(plate, tr)));
// rect aligned to grid lines exactly (u 0..0.5, v 0..1 covers part of the domain, edges on the domain)
tr = T.addLoop(plate, null, T.rectLoop(plate, 0, 0.5, 0, 1));
ok(near(T.area(plate, tr), 3000, 1e-5), 'rect on the patch edge', String(T.area(plate, tr)));
// circle hole: r = 0.2 of the unit square -> ellipse in uv; in mm: rx=20, ry=12 -> area pi*20*12 (polygon 64 -> less)
tr = T.addLoop(plate, null, T.circleLoop(plate, 0.5, 0.5, 0.2, 256), { hole: true });
const hole = Math.PI * 20 * 12;
ok(near(T.area(plate, tr), full - hole, 2e-4), 'elliptical hole', String(T.area(plate, tr)) + ' vs ' + (full - hole));
ok(!T.contains(plate, tr, 0.5, 0.5) && T.contains(plate, tr, 0.1, 0.1), 'contains');
// outer circle plus a hole inside it
let t2 = T.addLoop(plate, null, T.circleLoop(plate, 0.5, 0.5, 0.4, 256));
t2 = T.addLoop(plate, t2, T.circleLoop(plate, 0.5, 0.5, 0.1, 128), { hole: true });
const want = Math.PI * 40 * 24 - Math.PI * 10 * 6;
ok(near(T.area(plate, t2), want, 2e-4), 'outer + hole', String(T.area(plate, t2)) + ' vs ' + want);
// watertight: every interior edge used twice (opposite directions) except boundary edges: count edges with one use = boundary; closed-ness check by euler: boundary edges form loops
const tess = T.tessellate(plate, t2, { tol: 0.05 });
const edges = new Map();
for (let i = 0; i < tess.indices.length; i += 3) for (let k = 0; k < 3; k++) {
  const a = tess.indices[i + k], b = tess.indices[i + (k + 1) % 3];
  const key = a < b ? a + '_' + b : b + '_' + a;
  edges.set(key, (edges.get(key) || 0) + (a < b ? 1 : 100));
}
let bad = 0, boundary = 0;
for (const v of edges.values()) { if (v === 101) continue; if (v === 1 || v === 100) boundary++; else bad++; }
ok(bad === 0, 'no edge used twice the same way (consistent orientation)', String(bad));
ok(tess.openPieces === 0, 'no open pieces');
// boundary edges only on the loops: count equals the two loops' pieces: all boundary vertices lie on a loop (check radius)
const P = tess.positions, uvs = tess.uvs;
let offLoop = 0;
for (const key of edges.keys()) {
  if (edges.get(key) === 101) continue;
  const [a, b] = key.split('_').map(Number);
  for (const i of [a, b]) {
    const u = uvs[i * 2], v = uvs[i * 2 + 1], d = Math.hypot(u - 0.5, v - 0.5);
    if (Math.abs(d - 0.4) > 0.01 && Math.abs(d - 0.1) > 0.01) offLoop++;
  }
}
ok(offLoop === 0, 'cut edges lie on the loops', String(offLoop));
// triangles all inside the region (centroid test) and normals present
let outside = 0;
for (let i = 0; i < tess.indices.length; i += 3) {
  let u = 0, v = 0; for (let k = 0; k < 3; k++) { u += uvs[tess.indices[i + k] * 2] / 3; v += uvs[tess.indices[i + k] * 2 + 1] / 3; }
  if (!T.contains(plate, t2, u, v)) outside++;
}
ok(outside / (tess.indices.length / 3) < 0.01, 'triangles inside the shown part', String(outside));
// curved surface: a cylinder quarter, area of a rect trim = r * dtheta * h
const arc = C.arc([0, 0, 0], [1, 0, 0], [0, 1, 0], 50, 0, Math.PI / 2);
const cyl = K.extrude(arc, [0, 0, 80]).surface;

const areaFull = (Math.PI / 2) * 50 * 80;
const cA = T.addLoop(cyl, null, T.rectLoop(cyl, 0, 1, 0.25, 0.75));
ok(near(T.area(cyl, cA, { tol: 0.005 }), areaFull / 2, 2e-3), 'cylinder: half the height', String(T.area(cyl, cA, { tol: 0.005 })));
// the arc's parameter is not the angle, so cut at a parameter and check the two parts add up to the whole
const left = T.area(cyl, T.addLoop(cyl, null, T.rectLoop(cyl, 0, 0.37, 0, 1)), { tol: 0.005 }), right = T.area(cyl, T.addLoop(cyl, null, T.rectLoop(cyl, 0.37, 1, 0, 1)), { tol: 0.005 });
ok(near(left + right, areaFull, 2e-3), 'cylinder: two parts add up', String(left + right) + ' vs ' + areaFull);
// loop from a closed 3-D curve on the plate (a circle of radius 15 at (50,30))
const circ = C.circle([50, 30, 0], [0, 0, 1], 15);
const lp = T.curveLoop(plate, circ, { tol: 0.01 });
const t3 = T.addLoop(plate, null, lp, { hole: true });
ok(near(T.area(plate, t3, { tol: 0.05 }), full - Math.PI * 225, 5e-4), 'hole from a projected circle', String(T.area(plate, t3)));
try { T.curveLoop(plate, C.circle([50, 30, 5], [0, 0, 1], 15), { tol: 0.01 }); ok(false, 'off the surface refused'); } catch (e) { ok(e.code === 'nurbs.err.trim_off', 'off the surface refused', e.code); }
try { T.curveLoop(plate, C.line([0, 0, 0], [10, 10, 0])); ok(false, 'open refused'); } catch (e) { ok(e.code === 'nurbs.err.trim_open', 'open curve refused'); }
// crossing loops refused; hole outside outer refused
try { T.addLoop(plate, tr, T.rectLoop(plate, 0.4, 0.9, 0.4, 0.9), { hole: true }); ok(false, 'crossing refused'); } catch (e) { ok(e.code === 'nurbs.err.trim_self', 'crossing refused', e.code); }
try { T.addLoop(plate, t2, T.rectLoop(plate, 0.0, 0.05, 0.0, 0.05), { hole: true }); ok(false, 'outside refused'); } catch (e) { ok(e.code === 'nurbs.err.trim_outside', 'hole outside refused', e.code); }
// doc round trip
let doc = D.add(D.newDoc(), 'surface', plate, { name: 'plate' });
const id = doc.id; doc = D.setTrim(doc.doc, id, t2);
const back = D.fromJSON(D.toJSON(doc));
ok(back.items[0].trim && back.items[0].trim.holes.length === 1 && back.items[0].trim.outer.length === 256, 'doc keeps the trim');
ok(D.setTrim(back, id, null).items[0].trim === undefined, 'untrim');
// STEP round trip: an outer circle and a hole come back as the same trim (same shown area)
const stepText = ST.writeStep(doc, { name: 'trim', time: '2026-10-31T00:00:00' });
ok(/FACE_BOUND/.test(stepText) && /FACE_OUTER_BOUND/.test(stepText), 'STEP writes the bounds');
const rd = ST.readStep(stepText);
const rt = rd.items[0].trim;
ok(rt && rt.outer && rt.holes.length === 1, 'STEP reads the trim back');
if (rt) ok(near(T.area(rd.items[0].surface, rt, { tol: 0.05 }), T.area(plate, t2, { tol: 0.05 }), 2e-3), 'STEP round trip keeps the shown area', String(T.area(rd.items[0].surface, rt, { tol: 0.05 })));
// an untrimmed surface still writes and reads without a trim
const plain = ST.readStep(ST.writeStep(D.add(D.newDoc(), 'surface', plate, {}).doc));
ok(plain.items[0].trim === undefined, 'untrimmed stays untrimmed through STEP');
// cleaning untrusted trims
try { T.cleanTrim({ outer: [[0, 0], [1, 1]] }, plate); ok(false, 'two points refused'); } catch (e) { ok(e.code === 'nurbs.err.trim_loop', 'bad loop refused'); }
const clamp = T.cleanTrim({ outer: [[-5, -5], [5, -5], [5, 5], [-5, 5]] }, plate);
ok(clamp.outer.every((p) => p[0] >= 0 && p[0] <= 1), 'clamped to the patch');
console.log(`trim: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
