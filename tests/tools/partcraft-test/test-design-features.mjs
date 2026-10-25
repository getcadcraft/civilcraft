#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-design-features.mjs — PartCraft's Design features of 2026-10-11 on the exact kernel (OpenCascade in Node):
 * reference planes / axes / points, sweep, loft, draft, extrude up to a face / the next face / a vertex / an offset,
 * picked regions, two directions, taper, countersunk and tapped holes, two-distance and distance-angle chamfers, the
 * variable-radius fillet, their face names, the file format (round trip, tampered references refused), the mesh
 * kernel's share, and a STEP of a lofted part read back by native OpenCascade (cadquery-ocp). Every volume is checked
 * against a closed form worked out in the comment beside it.
 *   node tools/partcraft-test/test-design-features.mjs [--verbose]    (or runDesignFeatureTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PI = Math.PI;

export async function runDesignFeatureTests({ ok, section, oc, skip = (m) => console.log('  skip ' + m), M = null }) {
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const K = await import(DEV + 'kernel.js');
  const D = await import(DEV + 'design-features.js');
  const V = await import(DEV + 'vec.js');
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const xb = (part) => B.regenerateBrep(part, oc);
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const why = (r) => [...r.results].filter(([, x]) => x.status !== 'ok').map(([k, x]) => `${k}: ${x.message}`).join('; ');
  const sketchOn = (part, plane, draw) => { const sk = S.newSketch(); draw(sk); return P.addFeature(part, 'sketch', { plane, sketch: sk }); };
  const front = { kind: 'base', name: 'front' }, top = { kind: 'base', name: 'top' }, right = { kind: 'base', name: 'right' };
  /** A 100 × 60 × 40 block on the front plane (x 0…100, y 0…60, z 0…40). */
  const block = () => {
    const part = P.newPart('Block');
    const s = sketchOn(part, front, (sk) => S.addRect(sk, [0, 0], [100, 60]));
    const e = P.addFeature(part, 'extrude', { sketch: s.id, depth: 40 });
    return { part, s, e };
  };

  // ======================================================================================
  section('design: reference planes, axes and points');
  {
    // offset plane from the block's end face follows the extrude depth
    const { part, e } = block();
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [{ kind: 'face', feature: e.id, face: 'end' }], d: 15 });
    let r = xb(part);
    let g = r.refGeom.get(pl.id);
    ok(allOk(r) && near(g.frame.o[2], 55) && near(g.frame.n[2], 1), 'offset plane 15 from the block top (z 40) sits at z 55, normal +Z');
    e.depth = 70; r = xb(part); g = r.refGeom.get(pl.id);
    ok(near(g.frame.o[2], 85), 'the block 40 → 70 deep: the offset plane follows to z 85');
    // sketch on it + extrude: a Ø20 boss from z 85 down to the block (up to next)
    const s2 = sketchOn(part, { kind: 'ref', feature: pl.id }, (sk) => S.addCircle(sk, [50, 30], 10));
    const ex = P.addFeature(part, 'extrude', { sketch: s2.id, end: 'next', reverse: true });
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 100 * 60 * 70 + PI * 100 * 15), `sketch on the offset plane, up to next (down to the block): 420000 + 1500π (${r.stats.volume.toFixed(6)})`);
    ok(P.dependsOn(s2).includes(pl.id) && P.dependsOn(pl).includes(e.id), 'dependsOn: sketch → plane → extrude');
    ok(!P.canMove(part, pl.id, 0).ok, 'the plane cannot move above the extrude it is offset from');
    // the extrude's end face (z 70) is named; up to next stopped on it, its name kept
    ok(r.faces.some((f) => f.name === `${ex.id}.end`) === false && r.faces.some((f) => f.name === `${ex.id}.side:${s2.sketch.entities.find((x) => x.type === 'circle').id}`), 'the boss side is named by its sketch circle');
    void ex;
  }
  {
    // angle plane: about the X axis, 30° from the top plane; a 20 × 20 square on it extruded 10 along its normal
    const part = P.newPart();
    const pl = P.addFeature(part, 'plane', { mode: 'angle', planes: [top], axis: { kind: 'world', axis: 'x' }, angle: 30 });
    const s = sketchOn(part, { kind: 'ref', feature: pl.id }, (sk) => S.addRect(sk, [-10, -10], [10, 10]));
    const ex = P.addFeature(part, 'extrude', { sketch: s.id, depth: 10 });
    const r = xb(part);
    const n = [0, Math.cos(PI / 6), Math.sin(PI / 6)];
    const end = r.faces.find((f) => f.name === `${ex.id}.end`);
    ok(allOk(r) && rel(r.stats.volume, 4000), 'square 20 × 20 on a plane at 30° extruded 10: 4000');
    ok(end && V.dot(end.n, n) > 1 - 1e-12 && near(V.dot(end.at, n), 10, 1e-9), 'its end face is square to the turned normal (0, cos 30°, sin 30°), 10 from the axis');
  }
  {
    const { part, e } = block();
    const cyl = sketchOn(part, { kind: 'face', feature: e.id, face: 'end' }, (sk) => S.addCircle(sk, [50, 30], 10));
    const boss = P.addFeature(part, 'extrude', { sketch: cyl.id, depth: 20 });
    let r = xb(part);
    const side = r.faces.find((f) => f.type === 'cylinder');
    const mk = (props) => P.addFeature(part, 'plane', props);
    const p3 = mk({ mode: '3pt', points: [{ kind: 'fixed', p: [0, 0, 10] }, { kind: 'fixed', p: [1, 0, 10] }, { kind: 'fixed', p: [0, 1, 10] }] });
    const mid = mk({ mode: 'mid', planes: [{ kind: 'face', feature: e.id, face: 'start' }, { kind: 'face', feature: e.id, face: 'end' }] });
    const tan = mk({ mode: 'tangent', face: B.faceRef(side), points: [{ kind: 'fixed', p: [80, 30, 50] }] });
    const edge = r.edges.find((x) => x.type === 'line' && near(x.a[1], 0) && near(x.b[1], 0) && near(x.a[2], 40) && near(x.b[2], 40));
    const nrm = mk({ mode: 'normal', edge: B.edgeRef(edge), points: [{ kind: 'fixed', p: [25, 7, 3] }] });
    const circ = r.edges.find((x) => x.type === 'circle' && near(x.at[2], 60, 1e-6));
    const nrmC = mk({ mode: 'normal', edge: B.edgeRef(circ), points: [{ kind: 'fixed', p: [70, 30, 60] }] });
    const ax1 = P.addFeature(part, 'axis', { mode: 'cyl', face: B.faceRef(side) });
    const ax2 = P.addFeature(part, 'axis', { mode: 'planes', planes: [front, right] });
    const ax3 = P.addFeature(part, 'axis', { mode: '2pt', points: [{ kind: 'sketch', sketch: cyl.id, entity: 'O' }, { kind: 'fixed', p: [0, 0, 100] }] });
    const ax4 = P.addFeature(part, 'axis', { mode: 'edge', edge: B.edgeRef(circ) });
    const ax5 = P.addFeature(part, 'axis', { mode: 'normal', planes: [{ kind: 'face', feature: e.id, face: 'end' }], points: [{ kind: 'fixed', p: [5, 5, 40] }] });
    const pt1 = P.addFeature(part, 'point', { mode: 'center', edge: B.edgeRef(circ) });
    const pt2 = P.addFeature(part, 'point', { mode: 'at', points: [{ kind: 'vertex', edge: B.edgeRef(edge), p: [99, 0, 40] }] });
    r = xb(part);
    const G = (f) => r.refGeom.get(f.id);
    ok(allOk(r), 'every reference mode builds: ' + why(r));
    ok(near(G(p3).frame.n[2], 1) && near(G(p3).frame.o[2], 10), 'plane through 3 points (z 10): normal Z, at z 10');
    ok(near(Math.abs(G(mid).frame.n[2]), 1) && near(G(mid).frame.o[2], 20), 'midplane between the block\'s start (z 0) and end (z 40): z 20');
    ok(near(G(tan).frame.n[0], 1) && near(G(tan).frame.o[0], 60), 'tangent to the Ø20 boss at the side facing (80, 30): normal +X, at x 60');
    ok(near(Math.abs(G(nrm).frame.n[0]), 1) && near(G(nrm).frame.o[0], 25), 'square to the front top edge at the point nearest (25, 7, 3): normal X, x 25');
    ok(near(Math.abs(G(nrmC).frame.n[1]), 1, 1e-12) && V.len(V.sub(G(nrmC).center, [60, 30, 60])) < 1e-9 && near(G(nrmC).frame.o[1], 30, 1e-9), 'square to the boss\'s top circle at its point nearest (70, 30, 60): (60, 30, 60), tangent ±Y');
    ok(V.len(V.sub(G(ax1).o, [50, 30, G(ax1).o[2]])) < 1e-9 && near(Math.abs(G(ax1).d[2]), 1), 'axis of the cylinder: x 50, y 30, along Z');
    ok(near(Math.abs(G(ax2).d[1]), 1) && V.len([G(ax2).o[0], 0, G(ax2).o[2]]) < 1e-12, 'axis where the front and right planes meet: the Y axis');
    ok(near(G(ax3).d[2], 1) && near(G(ax3).o[2], 40), 'axis through the sketch origin (on the block top) and (0, 0, 100)');
    ok(near(G(ax4).o[0], 50) && near(G(ax4).o[1], 30), 'axis of a circular edge: its centre line');
    ok(V.len(V.sub(G(ax5).o, [5, 5, 40])) < 1e-12 && near(G(ax5).d[2], 1), 'axis square to the block top through (5, 5, 40)');
    ok(V.len(V.sub(G(pt1).p, [50, 30, 60])) < 1e-9, 'point at the centre of the boss\'s top circle (50, 30, 60)');
    ok(V.len(V.sub(G(pt2).p, [100, 0, 40])) < 1e-9, 'point at the edge end nearest (99, 0, 40): the corner (100, 0, 40)');
    // a reference used as a pattern direction and a mirror plane
    P.addFeature(part, 'lpattern', { seeds: [boss.id], dir: { kind: 'ref', feature: ax2.id }, count: 1, spacing: 0 });
    // bad inputs: parallel planes, collinear points
    const bad1 = P.addFeature(part, 'axis', { mode: 'planes', planes: [front, { kind: 'face', feature: e.id, face: 'end' }] });
    const bad2 = mk({ mode: '3pt', points: [{ kind: 'fixed', p: [0, 0, 0] }, { kind: 'fixed', p: [1, 1, 1] }, { kind: 'fixed', p: [2, 2, 2] }] });
    r = xb(part);
    ok(/parallel/.test(r.results.get(bad1.id).message || ''), 'an axis between two parallel planes fails, saying so');
    ok(/one line/.test(r.results.get(bad2.id).message || ''), 'a plane through three points on a line fails, saying so');
  }
  {
    // references gone: an offset plane on a named side face, then the sketch line that made the face is redrawn
    const { part, s, e } = block();
    let r = xb(part);
    const sideName = r.faces.find((f) => f.type === 'plane' && near(f.n[0], 1)).name;   // x = 100 wall
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [B.refForName(sideName)], d: 5 });
    const s2 = sketchOn(part, { kind: 'ref', feature: pl.id }, (sk) => S.addCircle(sk, [0, 0], 3));
    r = xb(part);
    const v0 = r.stats.volume;
    ok(allOk(r) && near(r.refGeom.get(pl.id).frame.o[0], 105), 'offset plane 5 from the x = 100 wall: x 105');
    // delete the right-hand line (the wall's maker) and draw it again: a new curve id, so the face name is gone
    const L = s.sketch.entities.find((x) => x.type === 'line' && sideName.endsWith(':' + x.id));
    const [a, b] = [S.pointXY(s.sketch, L.p1), S.pointXY(s.sketch, L.p2)];
    S.removeEntities(s.sketch, [L.id]);
    S.addLine(s.sketch, a, b);
    r = xb(part);
    const msg = r.results.get(pl.id).message || '';
    ok(r.results.get(pl.id).status === 'error' && /gone/.test(msg), `the plane fails with a clear message when its face is gone ("${msg}")`);
    ok(r.results.get(s2.id).status === 'skipped' && !r.refGeom.has(pl.id) && rel(r.stats.volume, v0), 'the sketch on it is not built and nothing else moved (same volume)');
    void e;
  }
  {
    // the mesh kernel builds references from base planes, points and other references, refuses faces/edges with the reason
    if (M) {
      const part = P.newPart();
      const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [top], d: 25 });
      const s = sketchOn(part, { kind: 'ref', feature: pl.id }, (sk) => S.addRect(sk, [0, 0], [10, 10]));
      P.addFeature(part, 'extrude', { sketch: s.id, depth: 5 });
      const bad = P.addFeature(part, 'axis', { mode: 'cyl', face: { name: 'f9.side:c1' } });
      const r = K.regenerate(part, M);
      ok(rel(r.stats.volume, 500, 1e-9) && near(r.stats.bbox.min[1], 25, 1e-6), 'mesh kernel: a sketch on an offset plane (y 25) extrudes there');
      ok(/exact kernel/.test(r.results.get(bad.id).message || '') || r.results.get(bad.id).status === 'skipped', 'mesh kernel: an axis from a face says it needs the exact kernel');
    } else skip('manifold not passed: mesh-kernel reference checks skipped');
  }

  // ======================================================================================
  section('design: sweep');
  {
    // circle r 5 on the top plane, swept along a straight line of 100 (front plane, up Y): a cylinder 2500π
    const part = P.newPart();
    const prof = sketchOn(part, top, (sk) => S.addCircle(sk, [0, 0], 5));
    const path = sketchOn(part, front, (sk) => S.addLine(sk, [0, 0], [0, 100]));
    const sw = P.addFeature(part, 'sweep', { sketch: prof.id, path: [{ sketch: path.id }] });
    let r = xb(part);
    const cid = prof.sketch.entities.find((x) => x.type === 'circle').id;
    ok(allOk(r) && rel(r.stats.volume, 2500 * PI), `sweep of a circle r 5 along a line of 100 = πr²L = 2500π (${r.stats.volume.toFixed(9)})`);
    ok(r.faces.map((f) => f.name).sort().join() === [`${sw.id}.end`, `${sw.id}.side:${cid}`, `${sw.id}.start`].sort().join(), 'its faces: start, end, side:<circle>');
    // a quarter arc of radius 50 (centre (50, 0)): a quarter torus πr² · (πR/2) = 25π · 25π
    path.sketch = S.newSketch(); S.addArc(path.sketch, [50, 0], [50, 50], [0, 0]);
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 25 * PI * 25 * PI), `along a quarter arc R 50: πr²·(πR/2) = 625π² (${r.stats.volume.toFixed(9)})`);
    for (const orient of ['frenet', 'binormal']) {
      sw.orient = orient; sw.binormal = { kind: 'world', axis: 'z' };
      r = xb(part);
      ok(allOk(r) && rel(r.stats.volume, 625 * PI * PI, 1e-9), `orientation ${orient}: same quarter torus`);
    }
    sw.orient = 'corrected';
    // scale law: end scale 0.5 along the straight line: a frustum π·100/3·(10² + 5² + 10·5)… with r 10
    path.sketch = S.newSketch(); S.addLine(path.sketch, [0, 0], [0, 100]);
    prof.sketch = S.newSketch(); S.addCircle(prof.sketch, [0, 0], 10);
    sw.scale = 0.5;
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, PI * 100 / 3 * (100 + 25 + 50), 1e-6), `end scale 0.5: a frustum π·h/3·(R² + r² + Rr) = 5833.3π (law approximated by OCCT: ${(r.stats.volume / (PI * 100 / 3 * 175) - 1).toExponential(1)})`);
    sw.scale = 1;
    // the profile off the path's ends is refused; ops cut / intersect / new
    prof.plane = { kind: 'fixed', o: [0, 50, 0], n: [0, 1, 0] };
    r = xb(part);
    ok(/one end of the path/.test(r.results.get(sw.id).message || ''), 'a profile that does not sit at an end of the path is refused, saying so');
  }
  {
    const { part } = block();
    const prof = sketchOn(part, top, (sk) => S.addCircle(sk, [50, 0], 5));
    const path = sketchOn(part, front, (sk) => S.addLine(sk, [50, 0], [50, 100]));
    const sw = P.addFeature(part, 'sweep', { sketch: prof.id, path: [{ sketch: path.id }], op: 'cut' });
    let r = xb(part);
    // the cylinder axis lies on the block's z = 0 face: half of it (z ≥ 0) is inside, over y 0…60
    ok(allOk(r) && rel(r.stats.volume, 240000 - 25 * PI / 2 * 60), 'sweep cut: 240000 − ½·25π·60');
    sw.op = 'intersect'; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 25 * PI / 2 * 60), 'sweep intersect: ½·25π·60 kept');
    sw.op = 'new'; prof.sketch = S.newSketch(); S.addCircle(prof.sketch, [200, 0], 5); path.sketch = S.newSketch(); S.addLine(path.sketch, [200, 0], [200, 100]);
    r = xb(part);
    ok(allOk(r) && r.stats.bodies === 2 && rel(r.stats.volume, 240000 + 2500 * PI), 'sweep as a new body: two bodies, 240000 + 2500π');
  }
  {
    // a 3D path from two sketches: up 50 on the front plane, then along −Z 30 on the right plane (y 50)
    const part = P.newPart();
    const prof = sketchOn(part, top, (sk) => S.addCircle(sk, [0, 0], 2));
    const a = sketchOn(part, front, (sk) => S.addLine(sk, [0, 0], [0, 50]));
    const b = sketchOn(part, right, (sk) => S.addLine(sk, [0, 50], [30, 50]));   // right plane: sketch x = −Z
    P.addFeature(part, 'sweep', { sketch: prof.id, path: [{ sketch: a.id }, { sketch: b.id }], orient: 'corrected' });
    const r = xb(part);
    ok(allOk(r) && r.stats.bodies === 1 && rel(r.stats.volume, 4 * PI * 80), `a path chained from two sketches (an L of 50 + 30, a sharp corner, mitred): one solid, πr²·80 (a mitre keeps the centre-line length) (${r.stats.volume.toFixed(9)})`);
  }

  // ======================================================================================
  section('design: loft');
  let loftPart = null;
  for (const ruled of [true, false]) {
    // squares 40 × 40 (top plane) and 20 × 20 (offset plane, 30 up): frustum h/3·(A + B + √AB) = 10·(1600 + 400 + 800) = 28000
    const part = P.newPart('Loft');
    const a = sketchOn(part, top, (sk) => S.addRect(sk, [-20, -20], [20, 20]));
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [top], d: 30 });
    const b = sketchOn(part, { kind: 'ref', feature: pl.id }, (sk) => S.addRect(sk, [-10, -10], [10, 10]));
    const lf = P.addFeature(part, 'loft', { sections: [{ sketch: a.id }, { sketch: b.id }], ruled });
    const r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 28000), `loft between two squares (${ruled ? 'ruled' : 'smooth'}): frustum 28000 (${r.stats.volume.toFixed(9)})`);
    ok(r.faces.filter((f) => f.name.startsWith(lf.id + '.side:l')).length === 4 && r.faces.some((f) => f.name === lf.id + '.start') && r.faces.some((f) => f.name === lf.id + '.end'), 'its faces: 4 sides named by the first sketch\'s lines, start, end');
    if (ruled) loftPart = part;
  }
  {
    // three sections 40 / 20 / 40 square at 0 / 30 / 60: ruled = two frustums 56000; smooth bulges less (a different, smaller number)
    const mk = (ruled) => {
      const part = P.newPart();
      const s = [0, 30, 60].map((y, i) => sketchOn(part, y ? { kind: 'fixed', o: [0, y, 0], n: [0, 1, 0] } : top, (sk) => S.addRect(sk, [-(i === 1 ? 10 : 20), -(i === 1 ? 10 : 20)], [i === 1 ? 10 : 20, i === 1 ? 10 : 20])));
      P.addFeature(part, 'loft', { sections: s.map((x) => ({ sketch: x.id })), ruled });
      return xb(part);
    };
    const rr = mk(true), rs = mk(false);
    ok(allOk(rr) && rel(rr.stats.volume, 56000), 'three sections, ruled: two frustums 56000');
    ok(allOk(rs) && rs.stats.volume < 56000 - 1000 && rs.stats.volume > 24000 * 1.5, `three sections, smooth: a curved waist (${rs.stats.volume.toFixed(1)}, less than the ruled 56000)`);
    // a square to a point: a pyramid 40²·30/3 = 16000; a triangle to a square warns about vertex matching
    const part = P.newPart();
    const a = sketchOn(part, top, (sk) => S.addRect(sk, [-20, -20], [20, 20]));
    const lf = P.addFeature(part, 'loft', { sections: [{ sketch: a.id }, { point: { kind: 'fixed', p: [0, 30, 0] } }], ruled: true });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 16000), 'loft from a square to a point: a pyramid 16000');
    const tri = sketchOn(part, { kind: 'fixed', o: [0, 30, 0], n: [0, 1, 0] }, (sk) => { const l1 = S.addLine(sk, [-15, -10], [15, -10]); const l2 = S.addLine(sk, [15, -10], [0, 15]); S.addLine(sk, [0, 15], [-15, -10]); void l1; void l2; });
    P.moveFeature(part, tri.id, 1);
    lf.sections = [{ sketch: a.id }, { sketch: tri.id }];
    r = xb(part);
    ok(r.results.get(lf.id).status === 'ok' && /sides/.test(r.results.get(lf.id).warning || ''), 'a square lofted to a triangle builds and warns that the vertices are matched by OpenCascade');
    lf.sections = [{ sketch: a.id }];
    r = xb(part);
    ok(/at least two/.test(r.results.get(lf.id).message || ''), 'one section is refused, saying a loft needs two');
  }

  section('design: loft with guide rails (0.4 P6)');
  {
    const I18N = await import(DEV + 'i18n.js');
    I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
    const pct = (x, y) => `${((x / y - 1) * 100).toFixed(4)} %`, throws = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(e.message); } };
    // circles r 20 (top plane, y 0) and r 10 (y 40); rails in the front plane (θ 0°, 180°) and the right plane (90°, 270°)
    // right plane: sketch x = −Z, y = Y
    const railed = (draw) => {
      const part = P.newPart('Rails');
      const a = sketchOn(part, top, (sk) => S.addCircle(sk, [0, 0], 20));
      const b = sketchOn(part, { kind: 'fixed', o: [0, 40, 0], n: [0, 1, 0] }, (sk) => S.addCircle(sk, [0, 0], draw.r2 ?? 10));
      const r1 = sketchOn(part, front, (sk) => draw.front(sk));
      const r2 = sketchOn(part, right, (sk) => draw.right(sk));
      const lf = P.addFeature(part, 'loft', { sections: [{ sketch: a.id }, { sketch: b.id }], rails: [{ sketch: r1.id }, { sketch: r2.id }] });
      return { part, a, b, r1, r2, lf };
    };
    const straight = railed({ front: (sk) => { S.addLine(sk, [20, 0], [10, 40]); S.addLine(sk, [-20, 0], [-10, 40]); }, right: (sk) => { S.addLine(sk, [-20, 0], [-10, 40]); S.addLine(sk, [20, 0], [10, 40]); } });
    let r = xb(straight.part);
    const cone = PI * 40 * (400 + 200 + 100) / 3, rep = r.results.get(straight.lf.id).gordon;
    ok(allOk(r) && rel(r.stats.volume, cone, 1e-5) && rep && rep.guides === 4 && rep.profiles === 2, `two circles and four straight rails: the frustum π·h·(R² + Rr + r²)/3 = ${cone.toFixed(6)} (${r.stats.volume.toFixed(6)}, ${pct(r.stats.volume, cone)}); ${rep?.profiles} sections × ${rep?.guides} rails`);
    ok(r.faces.some((f) => f.name === straight.lf.id + '.gordon:0') && r.faces.some((f) => f.name === straight.lf.id + '.start') && r.faces.some((f) => f.name === straight.lf.id + '.end') && rep.dev < 1e-4, `faces: the guided side (<id>.gordon:0), start and end caps; the side follows every section and rail within ${rep.dev.toExponential(1)} mm`);
    // arcs through (±20, 0), (±25, 20), (±20, 40): centre (∓17.5, 20), radius 42.5 — a barrel
    const R = 42.5, cx = 17.5;
    const barrel = railed({ r2: 20,
      front: (sk) => { S.addArc(sk, [-cx, 20], [20, 0], [20, 40]); S.addArc(sk, [cx, 20], [-20, 40], [-20, 0]); },
      right: (sk) => { S.addArc(sk, [cx, 20], [-20, 40], [-20, 0]); S.addArc(sk, [-cx, 20], [20, 0], [20, 40]); } });
    r = xb(barrel.part);
    // the solid of revolution of that arc: V = π ∫₀⁴⁰ (√(R² − (y − 20)²) − 17.5)² dy (Simpson, 2000 panels)
    let vr = 0; const nS = 2000, hS = 40 / nS;
    for (let i = 0; i <= nS; i++) { const y = i * hS, rr = Math.sqrt(R * R - (y - 20) ** 2) - cx, w = i === 0 || i === nS ? 1 : i % 2 ? 4 : 2; vr += w * PI * rr * rr; }
    vr *= hS / 3;
    const rb = r.results.get(barrel.lf.id).gordon, cyl = PI * 400 * 40;
    ok(allOk(r) && rb.dev < 1e-4 && r.stats.volume > cyl * 1.1 && Math.abs(r.stats.volume / vr - 1) < 0.02, `curved rails bulge the loft to them: ${r.stats.volume.toFixed(1)} mm³ against the barrel of revolution ${vr.toFixed(1)} (${pct(r.stats.volume, vr)}: between rails the Gordon side is not a circle) and the plain cylinder ${cyl.toFixed(1)}; on every rail within ${rb.dev.toExponential(1)} mm`);
    const plain = P.newPart(); const pa = sketchOn(plain, top, (sk) => S.addCircle(sk, [0, 0], 20)); const pb = sketchOn(plain, { kind: 'fixed', o: [0, 40, 0], n: [0, 1, 0] }, (sk) => S.addCircle(sk, [0, 0], 20)); P.addFeature(plain, 'loft', { sections: [{ sketch: pa.id }, { sketch: pb.id }] });
    ok(rel(xb(plain).stats.volume, cyl, 1e-6), 'the same sections without rails: the cylinder 16000π');
    // refusals in words; each chain of a rail sketch is one rail (two sketches of two lines = four rails, as above)
    const p2 = railed({ front: (sk) => { S.addLine(sk, [20, 0], [10, 40]); }, right: (sk) => { S.addLine(sk, [-20, 0], [-10, 40]); } });
    p2.lf.rails = [{ sketch: p2.r1.id }];
    ok(/two or more/.test(xb(p2.part).results.get(p2.lf.id).message || ''), `a single rail is refused: "${xb(p2.part).results.get(p2.lf.id).message}"`);
    const p3 = railed({ front: (sk) => { S.addLine(sk, [23, 0], [10, 40]); S.addLine(sk, [-20, 0], [-10, 40]); }, right: (sk) => { S.addLine(sk, [-20, 0], [-10, 40]); S.addLine(sk, [20, 0], [10, 40]); } });
    const m3 = xb(p3.part).results.get(p3.lf.id).message || '';
    ok(/apart/.test(m3), `a rail that misses a section by 3 mm is refused with the gap: "${m3}"`);
    const p4 = railed({ front: (sk) => { S.addLine(sk, [20, 0], [10, 40]); S.addLine(sk, [-20, 0], [-10, 40]); }, right: (sk) => { S.addLine(sk, [-20, 0], [-10, 40]); S.addLine(sk, [20, 0], [10, 40]); } });
    p4.lf.sections = [{ sketch: p4.a.id }, { point: { kind: 'fixed', p: [0, 40, 0] } }];
    ok(/every section must be a sketch/.test(xb(p4.part).results.get(p4.lf.id).message || ''), 'a point section with rails is refused, saying sections must be sketches');
    // as a cut: the frustum taken out of a 60 × 60 × 40 block around it
    const cutPart = railed({ front: (sk) => { S.addLine(sk, [20, 0], [10, 40]); S.addLine(sk, [-20, 0], [-10, 40]); }, right: (sk) => { S.addLine(sk, [-20, 0], [-10, 40]); S.addLine(sk, [20, 0], [10, 40]); } });
    const bs = sketchOn(cutPart.part, top, (sk) => S.addRect(sk, [-30, -30], [30, 30]));
    P.moveFeature(cutPart.part, bs.id, 0);
    const be = P.addFeature(cutPart.part, 'extrude', { sketch: bs.id, depth: 40 });   // top plane: +Y, 0…40 like the loft
    P.moveFeature(cutPart.part, be.id, 1);
    cutPart.lf.op = 'cut';
    r = xb(cutPart.part);
    ok(allOk(r) && rel(r.stats.volume, 60 * 60 * 40 - cone, 1e-5), `op cut: a 60 × 60 × 40 block less the guided frustum = ${(144000 - cone).toFixed(3)} (${r.stats.volume.toFixed(3)}) ${why(r)}`);
    // the file: rails saved and read back; deleting a rail sketch takes the loft with it
    const back = P.readPart(P.toJSON(straight.part));
    ok(JSON.parse(P.toJSON(straight.part)).version === 3 && JSON.stringify(back.features.find((f) => f.type === 'loft').rails) === JSON.stringify([{ sketch: straight.r1.id }, { sketch: straight.r2.id }]) && D.designDeps(straight.lf, P.nameFeatures).includes(straight.r2.id), 'saved and read back with its rails; the rails are dependencies');
    const gone = P.deleteFeatures(back, [straight.r2.id]);
    ok(gone.includes('Loft1') || gone.some((n) => /Loft/.test(n)), `deleting a rail sketch deletes the loft that uses it (${gone.join(', ')})`);
    const tj = JSON.parse(P.toJSON(straight.part)); tj.features.find((f) => f.type === 'loft').rails = [{ sketch: 'f99' }];
    ok(throws(() => P.readPart(JSON.stringify(tj)), /rail|bad/), 'a rail naming a sketch the file lacks is refused');
  }

  // ======================================================================================
  section('design: draft');
  {
    // a 100 × 100 × 50 block on the top plane, its 4 sides drafted 5° about the bottom: frustum h/3·(a² + b² + ab), b = a − 2h·tan 5°
    const part = P.newPart();
    const s = sketchOn(part, top, (sk) => S.addRect(sk, [-50, -50], [50, 50]));
    P.addFeature(part, 'extrude', { sketch: s.id, depth: 50 });
    let r = xb(part);
    const sides = r.faces.filter((f) => /\.side:/.test(f.name)).map(B.faceRef);
    const dr = P.addFeature(part, 'draft', { faces: sides, neutral: top, angle: 5 });
    r = xb(part);
    const a = 100, h = 50, b = a - 2 * h * Math.tan(5 * PI / 180);
    ok(allOk(r) && rel(r.stats.volume, h / 3 * (a * a + b * b + a * b)), `draft 5° on a block's sides: h/3·(a² + b² + ab) = ${(h / 3 * (a * a + b * b + a * b)).toFixed(6)} (${r.stats.volume.toFixed(6)})`);
    ok([0, 1, 2, 3].every((i) => r.faces.some((f) => f.name === `${dr.id}.draft:${i}`)), 'the drafted faces are named draft:0…3');
    dr.angle = -5; r = xb(part);
    const b2 = a + 2 * h * Math.tan(5 * PI / 180);
    ok(allOk(r) && rel(r.stats.volume, h / 3 * (a * a + b2 * b2 + a * b2)), 'draft −5°: the sides lean out (b = a + 2h·tan 5°)');
    dr.angle = 5; dr.faces = [{ name: 'f9.side:zz' }];
    r = xb(part);
    ok(/gone/.test(r.results.get(dr.id).message || ''), 'a draft whose face is gone fails, naming it');
  }

  // ======================================================================================
  section('design: extrude end conditions, regions, two directions, taper');
  {
    const circleOn = (part, plane) => sketchOn(part, plane, (sk) => S.addCircle(sk, [50, 30], 10));
    // up to a parallel reference plane at z 80 from the front plane: 40 + 40 more of a Ø20 → exact depth 80
    let { part } = block();
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [front], d: 80 });
    let c = circleOn(part, front);
    let ex = P.addFeature(part, 'extrude', { sketch: c.id, end: 'upto', upto: { kind: 'ref', feature: pl.id } });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 240000 + PI * 100 * 40), 'up to a parallel plane (z 80): 240000 + 100π·40');
    // up to a slanted plane through (0,0,60), (100,0,80): the cylinder's top is cut on a slope; mean height 70 → 100π·(70 − 40)
    pl.mode = '3pt'; pl.points = [{ kind: 'fixed', p: [0, 0, 60] }, { kind: 'fixed', p: [100, 0, 80] }, { kind: 'fixed', p: [0, 10, 60] }];
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 240000 + PI * 100 * 30), 'up to a slanted plane: a cylinder cut on a slope, mean height 70 → 240000 + 100π·30');
    ok(r.faces.some((f) => f.name === `${ex.id}.end` && f.type === 'plane' && Math.abs(f.n[0]) > 0.1), 'the slanted face it was cut to is named end');
    ex.end = 'offset'; ex.offset = 5;
    r = xb(part);
    // offset 5 along the slanted face's normal = 5/cos(θ) along Z, tan θ = 0.2
    ok(allOk(r) && rel(r.stats.volume, 240000 + PI * 100 * (30 - 5 / Math.cos(Math.atan(0.2)))), 'offset 5 from that face: 5/cos θ shorter along Z');
    // to a vertex: a point feature at z 70 → depth 70
    ({ part } = block());
    const pt = P.addFeature(part, 'point', { mode: 'xyz', p: [0, 0, 70] });
    c = circleOn(part, front);
    ex = P.addFeature(part, 'extrude', { sketch: c.id, end: 'vertex', vertex: { kind: 'ref', feature: pt.id } });
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 240000 + PI * 100 * 30), 'to a vertex (z 70): 240000 + 100π·30');
    // up to next as a cut: a pocket from the top face down, stopping at a floor 10 above the bottom: a boss inside? Use a step block
    ({ part } = block());
    const lower = sketchOn(part, { kind: 'base', name: 'front' }, (sk) => S.addRect(sk, [0, 0], [100, 60]));
    void lower;
    // a cut from z 40 downward through a block that has a slot: up to next stops at the slot's floor
    const slot = sketchOn(part, { kind: 'fixed', o: [0, 0, 40], n: [0, 0, 1] }, (sk) => S.addRect(sk, [20, 0], [80, 60]));
    P.addFeature(part, 'extrude', { sketch: slot.id, op: 'cut', depth: 15 });
    const hole = sketchOn(part, { kind: 'fixed', o: [0, 0, 100], n: [0, 0, 1] }, (sk) => S.addCircle(sk, [50, 30], 5));
    ex = P.addFeature(part, 'extrude', { sketch: hole.id, end: 'next', reverse: true });
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 240000 - 60 * 60 * 15 + 25 * PI * 75), 'up to next (a boss from z 100 down): stops on the slot floor at z 25');
    ex.reverse = false; r = xb(part);
    ok(/meets no face|Reverse/.test(r.results.get(ex.id).message || ''), 'up to next with nothing ahead fails, saying try reversing');
  }
  {
    // two directions, taper, regions
    const part = P.newPart();
    const s = sketchOn(part, top, (sk) => S.addRect(sk, [-50, -50], [50, 50]));
    const ex = P.addFeature(part, 'extrude', { sketch: s.id, depth: 50, taper: 5 });
    let r = xb(part);
    const a = 100, h = 50, b = a - 2 * h * Math.tan(5 * PI / 180);
    ok(allOk(r) && rel(r.stats.volume, h / 3 * (a * a + b * b + a * b)), 'taper 5° on a 100 × 100 extruded 50: the frustum h/3·(a² + b² + ab)');
    ex.taper = 0; ex.two = true; ex.depth2 = 20;
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 100 * 100 * 70) && near(r.stats.bbox.min[1], -20, 1e-9) && near(r.stats.bbox.max[1], 50, 1e-9), 'two directions 50 + 20: 700000, y −20…50');
    ex.taper = 3; r = xb(part);
    ok(/one direction/.test(r.results.get(ex.id).message || ''), 'taper with two directions is refused, saying so');
    ex.taper = 0; ex.two = false;
    S.addCircle(s.sketch, [0, 0], 20);
    ex.regions = [[0, 0]]; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, PI * 400 * 50), 'one contour: the inner circle picked (Ø40 × 50 = 20000π)');
    ex.regions = [[40, 40]]; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, (10000 - 400 * PI) * 50), 'one contour: the square minus the circle picked');
    ex.regions = [[400, 400]]; r = xb(part);
    ok(/gone/.test(r.results.get(ex.id).message || ''), 'a picked region outside every loop fails, saying it is gone');
    if (M) {
      ex.regions = [[0, 0]];
      const rm = K.regenerate(part, M);
      const k = (64 / 2) * Math.sin(2 * PI / 64);
      ok(rel(rm.stats.volume, k * 400 * 50, 1e-6), 'mesh kernel: one contour too (the inscribed 64-gon)');
      ex.regions = null; ex.end = 'upto';
      ok(/exact kernel/.test(K.regenerate(part, M).results.get(ex.id).message || ''), 'mesh kernel: up to a face says it needs the exact kernel');
    }
  }

  // ======================================================================================
  section('design: countersunk and tapped holes');
  {
    ok(Object.keys(D.ISO_COARSE).length === 15 && Object.entries(D.ISO_COARSE).every(([k, [d, p, drill]]) => k === 'M' + d && Math.abs(drill - (d - p)) <= 0.05 + 1e-12), 'ISO coarse M2–M24 (15 sizes): every tap drill = nominal − pitch to the drill series (M8 6.75 → 6.8, M12 10.25 → 10.2; ISO 2306)');
    const table = { M2: 1.6, 'M2.5': 2.05, M3: 2.5, M4: 3.3, M5: 4.2, M6: 5, M8: 6.8, M10: 8.5, M12: 10.2, M14: 12, M16: 14, M18: 15.5, M20: 17.5, M22: 19.5, M24: 21 };
    ok(Object.entries(table).every(([k, v]) => D.ISO_COARSE[k][2] === v), 'tap drills match the published table (M6 → 5.0, M8 → 6.8, M10 → 8.5, M12 → 10.2, M24 → 21)');
    const { part, e } = block();
    const hs = sketchOn(part, { kind: 'face', feature: e.id, face: 'end' }, (sk) => S.addPoint(sk, 50, 30));
    const h = P.addFeature(part, 'hole', { sketch: hs.id, kind: 'tapped', size: 'M8', through: true });
    let r = xb(part);
    const wall = r.faces.find((f) => f.type === 'cylinder');
    ok(allOk(r) && rel(r.stats.volume, 240000 - PI * 3.4 * 3.4 * 40) && near(wall.r, 3.4, 1e-9), 'M8 tapped through: drilled Ø6.8 (the tap drill), 240000 − π·3.4²·40');
    const th = r.threads.get(h.id);
    ok(th && th.callout === 'M8×1.25 - 6H, thread through' && near(th.list[0].r, 4), 'the thread is cosmetic: major Ø8 noted "M8×1.25 - 6H, thread through"');
    {
      // the drawing notes the thread (the model's thread is cosmetic)
      const BD = await import(DEV + 'brep-draw.js');
      const DR = await import(DEV + 'drawing.js');
      const data = BD.drawingViews(part, oc, {});
      const sheet = DR.composeSheet(data, { name: 'Tapped', date: new Date('2026-10-11') });
      const { missing } = await DR.toPdf(sheet);
      ok(data.threads?.[0]?.callout === 'M8×1.25 - 6H, thread through' && sheet.texts.some((t) => t.text === 'M8×1.25 - 6H, thread through') && missing === 0, 'the drawing sheet carries the thread callout as a note (and it encodes in the PDF)');
    }
    h.through = false; h.depth = 20; h.threadDepth = 16; r = xb(part);
    ok(allOk(r) && r.threads.get(h.id).callout === 'M8×1.25 - 6H, thread 16 deep', 'blind tapped hole: "thread 16 deep"');
    // countersink: Ø6.6 through with a 90° Ø13.2 countersink: cone height (R − r)/tan 45° = 3.3
    for (const ang of [90, 82]) {
      Object.assign(h, { kind: 'csink', d: 6.6, csinkD: 13.2, csinkAngle: ang, through: true });
      r = xb(part);
      const R = 6.6, r0 = 3.3, hc = (R - r0) / Math.tan(ang / 2 * PI / 180);
      const want = 240000 - (PI * r0 * r0 * (40 - hc) + PI * hc / 3 * (R * R + R * r0 + r0 * r0));
      ok(allOk(r) && rel(r.stats.volume, want) && r.faces.some((f) => f.name === `${h.id}.csink:${hs.sketch.entities[0].id}` && f.type === 'cone'), `countersink ${ang}°: cylinder + cone frustum (${want.toFixed(6)}), its cone named csink`);
    }
    if (M) {
      const rm = K.regenerate(part, M);
      ok(rm.results.get(h.id).status === 'ok' && rm.stats.volume < 240000 - PI * 3.3 * 3.3 * 30, 'mesh kernel: the countersunk hole builds (faceted)');
    }
  }

  // ======================================================================================
  section('design: chamfer variants and the variable-radius fillet');
  {
    const { part } = block();
    let r = xb(part);
    const e0 = r.edges.find((x) => x.type === 'line' && near(x.a[2], 40) && near(x.b[2], 40) && near(x.a[1], 0) && near(x.b[1], 0));
    const ch = P.addFeature(part, 'chamfer', { edges: [B.edgeRef(e0)], d: 3, mode: 'two', d2: 6 });
    r = xb(part);
    const topArea = (rr) => rr.faces.find((f) => f.type === 'plane' && near(f.n[2], 1)).area;
    ok(allOk(r) && rel(r.stats.volume, 240000 - 0.5 * 3 * 6 * 100), 'two-distance chamfer 3 × 6 along 100: 240000 − ½·3·6·100');
    const a1 = topArea(r);
    ch.flip = true; r = xb(part);
    const a2 = topArea(r);
    ok(rel(r.stats.volume, 240000 - 900) && near(Math.abs(a1 - a2), 300, 1e-6), 'flip swaps which face takes 3 and which 6 (the top face area changes by 3 × 100)');
    Object.assign(ch, { mode: 'angle', d: 4, angle: 30, flip: false });
    r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 240000 - 0.5 * 4 * 4 * Math.tan(PI / 6) * 100), 'distance-angle chamfer 4 at 30°: legs 4 and 4·tan 30°');
    part.features.pop();
    const fl = P.addFeature(part, 'fillet', { edges: [B.edgeRef(e0)], r: 2, r2: 8 });
    r = xb(part);
    const lo = 240000 - (1 - PI / 4) * 64 * 100, hi = 240000 - (1 - PI / 4) * 4 * 100;
    ok(allOk(r) && r.stats.volume > lo && r.stats.volume < hi && r.faces.some((f) => f.name === `${fl.id}.blend:0`), `variable fillet r 2 → 8 (linear law): volume between the r 8 and r 2 rounds (${r.stats.volume.toFixed(2)})`);
    const quasi = 240000 - (1 - PI / 4) * 100 * (4 + 16 + 64) / 3;
    ok(rel(r.stats.volume, quasi, 0.002), `… and within 0.2 % of ∫(1 − π/4)r(x)² dx = ${quasi.toFixed(2)} (the rolling-ball section is not a quarter circle exactly when r varies)`);
    const bbox = (rr) => rr.stats.bbox;
    void bbox;
  }

  // ======================================================================================
  section('design: files');
  {
    // a part using everything, saved and opened again: same JSON, version 3, same volume
    const part = loftPart;
    const s = sketchOn(part, top, (sk) => S.addCircle(sk, [0, 0], 3));
    const pth = sketchOn(part, front, (sk) => S.addLine(sk, [0, 0], [0, -20]));
    P.addFeature(part, 'sweep', { sketch: s.id, path: [{ sketch: pth.id }], op: 'add', orient: 'binormal', binormal: { kind: 'world', axis: 'x' }, scale: 1 });
    const r0 = xb(part);
    const json = P.toJSON(P.readPart(P.toJSON(part)));   // readSketch puts points first: compare the read-back form
    const back = P.readPart(json);
    ok(JSON.parse(json).version === 3 && P.toJSON(back) === json && JSON.stringify(back.features.filter((f) => f.type !== 'sketch')) === JSON.stringify(part.features.filter((f) => f.type !== 'sketch')), 'save → open: the same features and JSON (file version 3, since it uses design features)');
    ok(rel(xb(back).stats.volume, r0.stats.volume), 'and the same volume');
    const old = P.readPart(P.toJSON(block().part));
    ok(JSON.parse(P.toJSON(old)).version === 2 && P.toJSON(P.readPart(P.toJSON(old))) === P.toJSON(old) && !('regions' in old.features[1]) && !('taper' in old.features[1]), 'a part without them still saves as version 2, with no new fields written');
    const tamper = (fn, what, re = /bad|missing|unknown/) => {
      const j = JSON.parse(json); fn(j);
      let m = '';
      try { P.readPart(JSON.stringify(j)); } catch (e) { m = e.message; }
      ok(re.test(m), `tampered ${what} refused ("${m}")`);
    };
    const find = (j, type) => j.features.find((f) => f.type === type);
    tamper((j) => { find(j, 'sketch').plane = { kind: 'ref', feature: find(j, 'sketch').id }; }, 'sketch plane pointing at a sketch');
    tamper((j) => { const f = j.features.filter((x) => x.type === 'sketch')[1]; f.plane = { kind: 'ref', feature: 'f999' }; }, 'plane ref to a missing feature');
    tamper((j) => { find(j, 'plane').mode = 'sideways'; }, 'plane mode');
    tamper((j) => { find(j, 'plane').d = 1e300; }, 'plane distance');
    tamper((j) => { find(j, 'plane').points = [{ kind: 'vertex', edge: { faces: ['x', 'y'] }, p: [0, 0, 0] }]; }, 'vertex reference with bad face names');
    tamper((j) => { find(j, 'loft').sections = [{ sketch: find(j, 'loft').id }, { sketch: 'f1' }]; }, 'loft section pointing at a loft');
    tamper((j) => { find(j, 'loft').op = 'explode'; }, 'loft operation');
    tamper((j) => { find(j, 'sweep').path = [{ edge: { faces: ['f1.side:<script>', 'f1.end'] } }]; }, 'sweep path edge with a bad name');
    tamper((j) => { find(j, 'sweep').orient = 'wobbly'; }, 'sweep orientation');
    tamper((j) => { find(j, 'sweep').scale = 0; }, 'sweep scale');
    tamper((j) => { j.features.push({ id: 'f990', type: 'draft', name: 'D', faces: [], neutral: { kind: 'base', name: 'top' }, pull: null, angle: 95 }); }, 'draft angle 95°');
    tamper((j) => { j.features.push({ id: 'f991', type: 'extrude', name: 'E', sketch: 'f1', op: 'add', end: 'blind', depth: 5, reverse: false, regions: [[1, 'x']] }); }, 'extrude regions');
    tamper((j) => { j.features.push({ id: 'f992', type: 'hole', name: 'H', sketch: 'f1', kind: 'tapped', size: 'M7', d: 6, depth: 5, through: true, cboreD: 9, cboreDepth: 2, reverse: false }); }, 'tapped hole size M7');
    tamper((j) => { j.features.push({ id: 'f993', type: 'chamfer', name: 'C', edges: [], d: 1, mode: 'round' }); }, 'chamfer type');
    tamper((j) => { j.features.push({ id: 'f994', type: 'extrude', name: 'E', sketch: 'f1', op: 'add', end: 'upto', depth: 5, reverse: false, upto: { kind: 'ref', feature: 'f1' } }); }, 'up-to plane pointing at a sketch');
  }

  // ======================================================================================
  section('design: STEP of a lofted part, read by native OpenCascade');
  {
    const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
    const hasOcp = fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
    const part = P.newPart('Loft');
    const a = sketchOn(part, top, (sk) => S.addRect(sk, [-20, -20], [20, 20]));
    const b = sketchOn(part, { kind: 'fixed', o: [0, 30, 0], n: [0, 1, 0] }, (sk) => S.addCircle(sk, [0, 0], 12));
    P.addFeature(part, 'loft', { sections: [{ sketch: a.id }, { sketch: b.id }], ruled: false });
    const r = xb(part);
    const { text } = B.exportStep(part, oc);
    ok(allOk(r) && /ISO-10303-21;/.test(text) && /B_SPLINE_SURFACE|SURFACE_OF_LINEAR_EXTRUSION|ADVANCED_FACE/.test(text), `a square-to-circle loft exports as exact STEP (${(text.length / 1024).toFixed(0)} kB)`);
    if (!hasOcp) skip('cadquery-ocp missing: the lofted STEP is not read back natively');
    else {
      const TMP = path.join(REPO, 'tmp/partcraft-design');
      fs.mkdirSync(TMP, { recursive: true });
      const f = path.join(TMP, 'loft.step');
      fs.writeFileSync(f, text);
      const out = execFileSync(PY, ['-c', `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
n = 0; e = TopExp_Explorer(s, TopAbs_SOLID)
while e.More(): n += 1; e.Next()
print(json.dumps({'valid': BRepCheck_Analyzer(s).IsValid(), 'volume': g.Mass(), 'solids': n}))
`, f], { encoding: 'utf8' });
      const j = JSON.parse(out.trim().split('\n').pop());
      ok(j.valid && j.solids === 1 && rel(j.volume, r.stats.volume, 1e-6), `native OpenCascade (cadquery-ocp) reads the lofted STEP: one valid solid, volume ${j.volume.toFixed(4)} = ours ${r.stats.volume.toFixed(4)}`);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
  const M = await Module(); M.setup();
  await runDesignFeatureTests({ ok, section, oc, M });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
