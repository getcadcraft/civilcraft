#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-bodies.mjs — PartCraft's body tools of 2026-10-11 on the exact kernel (OpenCascade in Node): body ids across
 * rebuilds, Combine (join / cut / intersect, keep tools), Move/Copy body (translate, point to point, rotate about an
 * axis / edge / cylinder, align face to face), Scale body (uniform, and non-uniform through brep-gtrsf.js), the path
 * pattern (features and bodies, equal / set spacing, following the path or fixed, closed paths), bodies in linear and
 * circular patterns, the datum modes "between objects" (refgeom.js), the file format and the mesh kernel's share.
 * Every number is checked against arithmetic worked out independently in the comment beside it: volumes by
 * inclusion–exclusion on boxes and cylinders, boxes after transforms from the corners, sx·sy·sz for scales, instance
 * positions on a known line and arc, intersection points by hand.
 *   node tools/partcraft-test/test-bodies.mjs [--verbose]     (or runBodiesTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const PI = Math.PI;

export async function runBodiesTests({ ok, section, oc, skip = (m) => console.log('  skip ' + m), M = null }) {
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const K = await import(DEV + 'kernel.js');
  const BD = await import(DEV + 'bodies.js');
  const GT = await import(DEV + 'brep-gtrsf.js');
  const PP = await import(DEV + 'params-part.js');
  const V = await import(DEV + 'vec.js');
  const F = await import(path.join(REPO, 'tools/partcraft-test/fixtures.mjs'));
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const nearV = (a, b, t = 1e-9) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= t);
  const xb = (part) => B.regenerateBrep(part, oc);
  const allOk = (r) => [...r.results.values()].every((x) => x.status === 'ok');
  const why = (r) => [...r.results].filter(([, x]) => x.status !== 'ok').map(([k, x]) => `${k}: ${x.message}`).join('; ');
  const front = { kind: 'base', name: 'front' }, top = { kind: 'base', name: 'top' }, right = { kind: 'base', name: 'right' };
  const sketchOn = (part, plane, draw) => { const sk = S.newSketch(); draw(sk); return P.addFeature(part, 'sketch', { plane, sketch: sk }); };
  const body = (r, id) => r.bodies.find((b) => b.id === id);
  const boxOf = (b) => [...b.bbox.min, ...b.bbox.max];
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re.test(e.message); } };
  /**
   * Two bodies: A = [0,100]×[0,50]×[0,20] (Extrude1, f2), B = [60,140]×[10,40]×[0,30] (Extrude2 as a new body, f4).
   * |A| = 100000, |B| = 72000, A∩B = [60,100]×[10,40]×[0,20] = 40·30·20 = 24000.
   */
  const twoBoxes = () => {
    const part = P.newPart('Bodies');
    const sa = sketchOn(part, front, (sk) => S.addRect(sk, [0, 0], [100, 50]));
    const A = P.addFeature(part, 'extrude', { sketch: sa.id, depth: 20 });
    const sb = sketchOn(part, front, (sk) => S.addRect(sk, [60, 10], [140, 40]));
    const Bx = P.addFeature(part, 'extrude', { sketch: sb.id, depth: 30, op: 'new' });
    return { part, sa, A, sb, Bx };
  };

  // ======================================================================================
  section('bodies: separate bodies and their ids');
  {
    const { part, A, Bx } = twoBoxes();
    const r = xb(part);
    ok(allOk(r) && r.bodies.length === 2 && rel(body(r, A.id).volume, 100000) && rel(body(r, Bx.id).volume, 72000), `an extrude as a new body: two bodies ${A.id} (100000) and ${Bx.id} (72000), total ${r.stats.volume.toFixed(6)}`);
    ok(r.faceBody.length === r.faces.length && r.faces.every((f, i) => r.faceBody[i] === (P.nameFeatures(f.name)[0] === A.id ? A.id : Bx.id)), 'every face knows its body (faceBody, in regen.faces order)');
    ok(BD.bodyLabel(part, A.id) === 'Extrude1' && BD.bodyLabel(part, `${Bx.id}@f9#2`).startsWith('Extrude2, copy 2 of'), 'body ids in words: "Extrude1", "Extrude2, copy 2 of …"');
    ok(P.fileVersion(part) === 3 && P.readPart(P.toJSON(part)).features[3].op === 'new', 'an extrude with op "new" makes the file version 3 and reads back');
    const plain = P.newPart(); const s = sketchOn(plain, front, (sk) => S.addRect(sk, [0, 0], [1, 1])); P.addFeature(plain, 'extrude', { sketch: s.id, depth: 1 });
    ok(P.fileVersion(plain) === 2, 'a part without body tools stays version 2');
    // an intersect extrude: the overlap of A with a 30-deep 80×30 prism = A∩B = 24000
    const p2 = P.newPart(); const s1 = sketchOn(p2, front, (sk) => S.addRect(sk, [0, 0], [100, 50])); P.addFeature(p2, 'extrude', { sketch: s1.id, depth: 20 });
    const s2 = sketchOn(p2, front, (sk) => S.addRect(sk, [60, 10], [140, 40])); const ix = P.addFeature(p2, 'extrude', { sketch: s2.id, depth: 30, op: 'intersect' });
    ok(rel(xb(p2).stats.volume, 24000), 'an extrude with op "intersect" keeps the overlap: 24000');
    if (M) {
      const km = K.regenerate(p2, M);
      ok(rel(km.stats.volume, 24000, 1e-9), 'the mesh kernel builds "intersect" too (boxes: exact 24000)');
      ix.op = 'new';
      const kn = K.regenerate(p2, M);
      ok(kn.results.get(ix.id).status === 'error' && /exact kernel/.test(kn.results.get(ix.id).message), 'the mesh kernel refuses a new body, saying it needs the exact kernel');
    } else skip('manifold missing: mesh-kernel checks');
  }

  // ======================================================================================
  section('bodies: Combine');
  {
    const { part, A, Bx, sa } = twoBoxes();
    const c = P.addFeature(part, 'combine', { op: 'cut', target: A.id, tools: [Bx.id] });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 76000) && r.bodies.length === 1 && r.bodies[0].id === A.id, `cut: |A| − |A∩B| = 100000 − 24000 = 76000 (${r.stats.volume.toFixed(6)}), one body keeping the target's id`);
    ok(r.faces.some((f) => f.name && f.name.endsWith('@' + c.id)), 'the pocket walls are the tool\'s faces, named …@' + c.id);
    c.op = 'join'; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 148000) && r.bodies.length === 1, `join: |A| + |B| − |A∩B| = 148000 (${r.stats.volume.toFixed(6)})`);
    c.op = 'intersect'; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 24000), `intersect: |A∩B| = 24000 (${r.stats.volume.toFixed(6)})`);
    c.op = 'cut'; c.keep = true; r = xb(part);
    ok(allOk(r) && r.bodies.length === 2 && rel(body(r, A.id).volume, 76000) && rel(body(r, Bx.id).volume, 72000), 'cut keeping the tool: A = 76000 and B = 72000 stay two bodies');
    // the target follows an upstream edit: A 100 → 120 wide, A∩B = 60·30·20 = 36000
    sa.sketch.entities.filter((e) => e.type === 'point' && Math.abs(e.x - 100) < 1e-9).forEach((p) => { p.x = 120; });
    r = xb(part);
    ok(allOk(r) && rel(body(r, A.id).volume, 120 * 50 * 20 - 36000), `A widened to 120 upstream: Combine still finds both bodies, A = 120000 − 36000 = 84000 (${body(r, A.id)?.volume.toFixed(6)})`);
    // a fillet on an edge of the pocket (between A's top face and a tool face) survives moving B upstream
    c.keep = false; r = xb(part);
    const e = r.edges.find((x) => x.faces.some((n) => n === `${A.id}.end`) && x.faces.some((n) => n.endsWith('@' + c.id)) && x.type === 'line' && Math.abs(x.a[1] - x.b[1]) < 1e-9);
    const fil = P.addFeature(part, 'fillet', { edges: [B.edgeRef(e)], r: 2 });
    r = xb(part);
    const v1 = r.stats.volume;
    // a convex edge: the round takes (1 − π/4)·r² off along its length
    ok(allOk(r) && rel(v1, 84000 - (1 - PI / 4) * 4 * e.len, 1e-9), `a fillet r 2 on a pocket edge named by the tool face (…@${c.id}): 84000 − (1 − π/4)·4·${+e.len.toFixed(6)} (${v1.toFixed(6)})`);
    const sb = part.features.find((f) => f.id === part.features.find((g) => g.id === Bx.id).sketch);
    sb.sketch.entities.filter((p) => p.type === 'point').forEach((p) => { p.x -= 5; });
    r = xb(part);
    ok(allOk(r) && r.results.get(fil.id).status === 'ok', `B moved 5 left upstream: the fillet still finds its edge (${why(r) || 'all built'})`);
    P.deleteFeatures(part, [fil.id]);
    // a second Combine naming the consumed tool fails in words
    const c2 = P.addFeature(part, 'combine', { op: 'join', target: A.id, tools: [Bx.id] });
    r = xb(part);
    ok(r.results.get(c2.id).status === 'error' && /tool body Extrude2 is gone/.test(r.results.get(c2.id).message), `a tool already used up is named: "${r.results.get(c2.id).message}"`);
    ok(P.dependsOn(c2).includes(A.id) && P.dependsOn(c2).includes(Bx.id), 'Combine depends on the features that made its bodies');
    const names = P.deleteFeatures(part, [Bx.id]);
    ok(names.includes(c.name) && names.includes(c2.name), 'deleting Extrude2 deletes the Combines that use its body');
  }
  {
    // three bodies: A, B and a cylinder C (r 10 about (30, 25), z 0…40, new): C∩A = π·10²·20 = 2000π, C∩B = ∅
    const { part, A, Bx } = twoBoxes();
    const sc = sketchOn(part, front, (sk) => S.addCircle(sk, [30, 25], 10));
    const C = P.addFeature(part, 'extrude', { sketch: sc.id, depth: 40, op: 'new' });
    const c = P.addFeature(part, 'combine', { op: 'join', target: A.id, tools: [Bx.id, C.id] });
    let r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 100000 + 72000 + 4000 * PI - 24000 - 2000 * PI), `join of three: |A|+|B|+|C| − |A∩B| − |A∩C| = 148000 + 2000π (${r.stats.volume.toFixed(6)})`);
    c.op = 'cut'; r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 100000 - 24000 - 2000 * PI), `cut by two tools: 76000 − 2000π (${r.stats.volume.toFixed(6)})`);
    c.op = 'intersect'; c.tools = [C.id]; r = xb(part);
    ok(allOk(r) && rel(body(r, A.id).volume, 2000 * PI) && rel(body(r, Bx.id).volume, 72000) && r.faces.some((f) => f.type === 'cylinder' && near(f.r, 10)), `A intersected with the cylinder: 2000π with a true cylinder r 10 (${body(r, A.id).volume.toFixed(6)}); B, not a tool, is left alone`);
    c.tools = [Bx.id, C.id]; r = xb(part);
    ok(r.results.get(c.id).status === 'error' && /do not overlap/.test(r.results.get(c.id).message), 'intersect of A, B and C (nothing common to all three) is refused in words');
    c.tools = [A.id]; r = xb(part);
    ok(r.results.get(c.id).status === 'error' && /own tools/.test(r.results.get(c.id).message), 'the target as its own tool is refused');
  }

  // ======================================================================================
  section('bodies: Move/Copy body');
  {
    const { part, A, Bx } = twoBoxes();
    const m = P.addFeature(part, 'movebody', { bodies: [Bx.id], mode: 'translate', dx: 10, dy: -5, dz: 50, copy: true });
    let r = xb(part);
    const cp = body(r, `${Bx.id}@${m.id}#1`);
    ok(allOk(r) && r.bodies.length === 3 && cp && nearV(boxOf(cp), [70, 5, 50, 150, 35, 80]) && nearV(boxOf(body(r, Bx.id)), [60, 10, 0, 140, 40, 30]), 'copy moved by (10, −5, 50): the copy\'s box is [70,150]×[5,35]×[50,80], the original stays');
    ok(rel(r.stats.volume, 100000 + 72000 * 2), 'three bodies: 100000 + 2·72000');
    m.copy = false; r = xb(part);
    ok(allOk(r) && r.bodies.length === 2 && nearV(boxOf(body(r, Bx.id)), [70, 5, 50, 150, 35, 80]), 'moved without a copy: the same body id, now at [70,150]×[5,35]×[50,80]');
    ok(r.faces.some((f) => f.name === `${Bx.id}.end` && near(f.o[2], 80)), 'a moved body keeps its face names (its end face now at z 80)');
    // point to point: B's corner (60, 10, 0) onto (0, 0, 100)
    Object.assign(m, { mode: 'points', from: { kind: 'sketch', sketch: Bx.sketch, entity: part.features.find((f) => f.id === Bx.sketch).sketch.entities.find((e) => e.type === 'point').id }, to: { kind: 'fixed', p: [0, 0, 100] } });
    r = xb(part);
    ok(allOk(r) && nearV(boxOf(body(r, Bx.id)), [0, 0, 100, 80, 30, 130]), 'point to point: B\'s first sketch corner (60, 10) onto (0, 0, 100) → [0,80]×[0,30]×[100,130]');
    // rotate 90° about the line x = 60, z = 0 along +Y (right-handed: +X turns to −Z): x' = 60 + z, z' = −(x − 60)
    Object.assign(m, { mode: 'rotate', axis: { kind: 'fixed', o: [60, 0, 0], d: [0, 1, 0] }, angle: 90 });
    r = xb(part);
    ok(allOk(r) && nearV(boxOf(body(r, Bx.id)), [60, 10, -80, 90, 40, 0], 1e-9) && rel(body(r, Bx.id).volume, 72000), 'rotate 90° about the line x 60, z 0 (+Y): [60,90]×[10,40]×[−80,0], volume unchanged');
    // the same axis taken from B's own edge (x 60, z 0, along y): either sense of the edge gives one of the two quarter turns
    r = xb(part);
    const eB = B.regenerateBrep({ ...part, rollback: P.indexOf(part, m.id) }, oc).edges.find((x) => x.type === 'line' && near(x.a[0], 60) && near(x.b[0], 60) && near(x.a[2], 0) && near(x.b[2], 0));
    Object.assign(m, { axis: null, edge: B.edgeRef(eB) });
    r = xb(part);
    const bb = boxOf(body(r, Bx.id));
    ok(allOk(r) && (nearV(bb, [60, 10, -80, 90, 40, 0], 1e-9) || nearV(bb, [30, 10, 0, 60, 40, 80], 1e-9)), `rotate about a picked straight edge: [${bb.map((v) => +v.toFixed(6))}]`);
    // about a cylinder's axis: a new cylinder C about (30, 25) along Z; B turned 180° about it: x' = 60 − x, y' = 50 − y
    const sc = sketchOn(part, front, (sk) => S.addCircle(sk, [30, 25], 5));
    P.moveFeature(part, sc.id, P.indexOf(part, m.id));
    const C = P.addFeature(part, 'extrude', { sketch: sc.id, depth: 5, op: 'new' });
    P.moveFeature(part, C.id, P.indexOf(part, m.id));
    const cyl = B.regenerateBrep({ ...part, rollback: P.indexOf(part, m.id) }, oc).faces.find((f) => f.type === 'cylinder');
    Object.assign(m, { edge: null, face: B.faceRef(cyl), angle: 180 });
    r = xb(part);
    ok(allOk(r) && nearV(boxOf(body(r, Bx.id)), [-80, 10, 0, 0, 40, 30], 1e-9), 'rotate 180° about a cylinder\'s axis (30, 25): [60,140] → [−80,0], [10,40] → [10,40] (y 50 − y)');
    // align: B's bottom face (z 0, normal −Z) face to face onto A's top (z 20, normal +Z): B sits on A, z 20…50
    Object.assign(m, { mode: 'align', face: null, planes: [{ kind: 'face', feature: Bx.id, face: 'start' }, { kind: 'face', feature: A.id, face: 'end' }], flip: false });
    r = xb(part);
    ok(allOk(r) && nearV(boxOf(body(r, Bx.id)), [60, 10, 20, 140, 40, 50], 1e-9), 'align face to face: B\'s bottom onto A\'s top → [60,140]×[10,40]×[20,50]');
    // align B's side face (x 140, +X) onto the top plane (y 0, normal +Y): turn +X to −Y about the face centre (140, 25, 15),
    // (x, y, z) → (140 + (y − 25), 25 − (x − 140), z), then down 25 so the face lies in y 0: [125,155]×[0,80]×[0,30]
    const sideName = xb({ ...part, rollback: P.indexOf(part, m.id) }).faces.find((f) => f.name?.startsWith(Bx.id + '.side') && f.type === 'plane' && near(f.n[0], 1)).name;
    Object.assign(m, { planes: [B.refForName(sideName), top] });
    r = xb(part);
    ok(allOk(r) && nearV(boxOf(body(r, Bx.id)), [125, 0, 0, 155, 80, 30], 1e-9), `align a side face onto the top plane: [125,155]×[0,80]×[0,30] ([${boxOf(body(r, Bx.id)).map((v) => +v.toFixed(6))}])`);
    m.planes = [B.refForName(sideName)]; r = xb(part);
    ok(r.results.get(m.id).status === 'error' && /Pick the face/.test(r.results.get(m.id).message), 'align with one plane asks for the other');
    ok(PP.partAdapter.targets(part).has(m.id + '.angle') === true && PP.fieldInUse({ ...m, mode: 'rotate' }, 'angle') && !PP.fieldInUse({ ...m, mode: 'translate' }, 'angle'), 'equations can drive the move\'s numbers (registered fields, in use by mode)');
  }

  // ======================================================================================
  section('bodies: Scale body');
  {
    const { part, A, Bx } = twoBoxes();
    const s = P.addFeature(part, 'scalebody', { bodies: [Bx.id], uniform: true, s: 2, point: { kind: 'fixed', p: [0, 0, 0] } });
    let r = xb(part);
    ok(allOk(r) && rel(body(r, Bx.id).volume, 72000 * 8) && nearV(boxOf(body(r, Bx.id)), [120, 20, 0, 280, 80, 60], 1e-7), 'uniform ×2 about the origin: volume ×8 = 576000, box [120,280]×[20,80]×[0,60]');
    Object.assign(s, { uniform: false, sx: 2, sy: 0.5, sz: 3, point: null });
    r = xb(part);
    // about B's box centre (100, 25, 15): x 100 ± 80, y 25 ± 7.5, z 15 ± 45
    ok(allOk(r) && rel(body(r, Bx.id).volume, 72000 * 3) && nearV(boxOf(body(r, Bx.id)), [20, 17.5, -30, 180, 32.5, 60], 1e-6), 'non-uniform 2 × 0.5 × 3 about its box centre: volume × sx·sy·sz = 216000, box [20,180]×[17.5,32.5]×[−30,60]');
    ok(/only flat faces/.test(r.results.get(s.id).note || ''), 'a box scaled non-uniformly is exact (only planes and lines), and the note says so');
    ok(r.faces.some((f) => f.name === `${Bx.id}.end` && near(f.o[2], 60, 1e-6)), 'the scaled body keeps its face names');
  }
  {
    // a cylinder r 10, 40 long about (30, 25) scaled 2 × 0.5 × 3 about (30, 25, 0): an elliptic cylinder 20 × 5, 120 long
    const part = P.newPart();
    const sc = sketchOn(part, front, (sk) => S.addCircle(sk, [30, 25], 10));
    const C = P.addFeature(part, 'extrude', { sketch: sc.id, depth: 40 });
    const s = P.addFeature(part, 'scalebody', { bodies: [C.id], uniform: false, sx: 2, sy: 0.5, sz: 3, point: { kind: 'fixed', p: [30, 25, 0] } });
    const r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, PI * 20 * 5 * 120, 1e-7), `elliptic cylinder: π·20·5·120 = 12000π within 1e-7 (${r.stats.volume.toFixed(6)} vs ${(12000 * PI).toFixed(6)})`);
    ok(nearV([...r.stats.bbox.min, ...r.stats.bbox.max], [10, 20, 0, 50, 30, 120], 1e-5), 'its box: [10,50]×[20,30]×[0,120]');
    ok(r.faces.some((f) => f.type === 'spline') && !r.faces.some((f) => f.type === 'cylinder'), 'the cylinder became a B-spline surface (no analytic surface holds an ellipse in the same parameters)');
    ok(/ellipses/.test(r.results.get(s.id).note) && /B-spline/.test(r.results.get(s.id).note), `the note says so: "${r.results.get(s.id).note}"`);
    // points of the scaled side face lie on the ellipse ((x−30)/20)² + ((y−25)/5)² = 1 (mesh vertices on that face)
    const fi = r.faces.findIndex((f) => f.type === 'spline');
    let worst = 0;
    for (let t = 0; t < r.mesh.triFace.length; t++) if (r.mesh.triFace[t] === fi) for (let k = 0; k < 3; k++) {
      const v = r.mesh.indices[t * 3 + k], x = r.mesh.positions[v * 3], y = r.mesh.positions[v * 3 + 1];
      // the distance off the ellipse ≈ |F − 1|·(gradient length)⁻¹; the radius vector bound is enough here
      const F = ((x - 30) / 20) ** 2 + ((y - 25) / 5) ** 2;
      worst = Math.max(worst, Math.abs(Math.sqrt(F) - 1) * 5);
    }
    ok(worst < 2e-5, `the scaled side face's mesh points lie on the ellipse within ${worst.toExponential(1)} mm (float32 positions)`);
    // the flange, scaled 1 × 2 × 0.5 about the origin: volume 302160π exactly ×1
    const fl = F.flange();
    const rev = fl.part.features.find((f) => f.type === 'revolve');
    P.addFeature(fl.part, 'scalebody', { bodies: [rev.id], uniform: false, sx: 1.5, sy: 2, sz: 0.5, point: { kind: 'fixed', p: [0, 0, 0] } });
    const rf = xb(fl.part);
    ok(allOk(rf) && rel(rf.stats.volume, 302160 * PI * 1.5, 2e-7), `the flange scaled 1.5 × 2 × 0.5 (cones, cylinders, 8 holes): 302160π × 1.5 within 2e-7 (${rf.stats.volume.toFixed(4)})`);
    // the deviation bound itself: the unit-circle interpolation against cos/sin at 4000 points
    const n = 64, h = 2 * PI / n, k = 6 / (4 + 2 * Math.cos(h));
    let e = 0;
    for (let q = 0; q < 4000; q++) {
      const u = 2 * PI * q / 4000, j = Math.floor(u / h), t = u / h - j;
      const b = [(1 - t) ** 3 / 6, (3 * t ** 3 - 6 * t * t + 4) / 6, (-3 * t ** 3 + 3 * t * t + 3 * t + 1) / 6, t ** 3 / 6];
      let x = 0, y = 0;
      for (let m = 0; m < 4; m++) { const a = (j + m - 1) * h; x += b[m] * k * Math.cos(a); y += b[m] * k * Math.sin(a); }
      e = Math.max(e, Math.hypot(x - Math.cos(u), y - Math.sin(u)));
    }
    ok(e <= Math.pow(h, 4) / 384 * 1.01 && e > Math.pow(h, 4) / 384 * 0.9, `uniform periodic cubic interpolation of a circle errs h⁴/384 (n 64: ${e.toExponential(3)} vs ${(Math.pow(h, 4) / 384).toExponential(3)}), the bound brep-gtrsf.js sizes n by`);
    ok(throws(() => GT.affineShape(oc, null, { m: [[-1, 0, 0], [0, 1, 0], [0, 0, 1]], t: [0, 0, 0] }, { bbox: { min: [0, 0, 0], max: [1, 1, 1] } }), /handedness/), 'a mirroring map (a negative factor) is refused');
    // its STEP read by native OpenCascade (cadquery-ocp): a valid solid of the same volume
    const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
    if (!(fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0)) skip('cadquery-ocp missing: the scaled STEP is not read back natively');
    else {
      const { text } = B.exportStep(part, oc);
      const TMP = path.join(REPO, 'tmp/partcraft-bodies'); fs.mkdirSync(TMP, { recursive: true });
      const fp = path.join(TMP, 'ellipse.step'); fs.writeFileSync(fp, text);
      const out = execFileSync(PY, ['-c', `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
print(json.dumps({'valid': BRepCheck_Analyzer(s).IsValid(), 'volume': g.Mass()}))
`, fp], { encoding: 'utf8' });
      const j = JSON.parse(out.trim().split('\n').pop());
      ok(j.valid && rel(j.volume, 12000 * PI, 1e-6), `native OpenCascade 7.9 reads the elliptic cylinder's STEP: valid, ${j.volume.toFixed(4)} ≈ 12000π`);
    }
  }

  // ======================================================================================
  section('bodies: path pattern');
  {
    // a 10 × 10 × 10 box body centred (50, 0, 5) and a quarter arc r 50 from (50, 0) to (0, 50) on the front plane;
    // 4 equally spaced = every 30°: following the path, copy i is the box turned 30i° about the Z axis
    const part = P.newPart();
    const s1 = sketchOn(part, front, (sk) => S.addRect(sk, [45, -5], [55, 5]));
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
    const s2 = sketchOn(part, front, (sk) => S.addArc(sk, [0, 0], [50, 0], [0, 50]));
    const pp = P.addFeature(part, 'pathpattern', { bodies: [e1.id], path: [{ sketch: s2.id }], count: 4 });
    let r = xb(part);
    const centre = (b) => b.bbox.min.map((v, i) => (v + b.bbox.max[i]) / 2);
    const ids = [e1.id, ...[1, 2, 3].map((i) => `${e1.id}@${pp.id}#${i}`)];
    const w30 = 10 * (Math.cos(PI / 6) + Math.sin(PI / 6));   // a 10-square turned 30° spans 10(cos 30° + sin 30°)
    ok(allOk(r) && r.bodies.length === 4 && ids.every((id, i) => body(r, id) && nearV(centre(body(r, id)), [50 * Math.cos(i * PI / 6), 50 * Math.sin(i * PI / 6), 5], 1e-9)), 'along a quarter arc, 4 equal: centres at 50(cos 30i°, sin 30i°, ·) to 1e-9');
    ok(near(body(r, ids[1]).bbox.max[0] - body(r, ids[1]).bbox.min[0], w30, 1e-9) && near(body(r, ids[3]).bbox.max[0] - body(r, ids[3]).bbox.min[0], 10, 1e-9), `following the path: copy 1 turned 30° (box width ${w30.toFixed(6)}), copy 3 turned 90° (10)`);
    pp.orient = 'fixed'; r = xb(part);
    ok(allOk(r) && ids.every((id, i) => nearV(centre(body(r, id)), [50 * Math.cos(i * PI / 6), 50 * Math.sin(i * PI / 6), 5], 1e-9) && near(body(r, id).bbox.max[0] - body(r, id).bbox.min[0], 10, 1e-9)), 'fixed orientation: the same centres, every copy square to the axes');
    ok(rel(r.stats.volume, 4000), 'four boxes: 4000');
    // set distance: 3 copies 10π apart along the arc (25π long): 0°, 36°, 72°
    Object.assign(pp, { spacing: 'distance', d: 10 * PI, count: 3, orient: 'path' });
    r = xb(part);
    ok(allOk(r) && [0, 1, 2].every((i) => nearV(centre(body(r, ids[i])), [50 * Math.cos(i * PI / 5), 50 * Math.sin(i * PI / 5), 5], 1e-9)), 'set distance 10π along r 50: copies every 36°');
    pp.count = 4; r = xb(part);
    ok(r.results.get(pp.id).status === 'error' && /need .* of path/.test(r.results.get(pp.id).message), `too many copies for the path: "${r.results.get(pp.id).message}"`);
    pp.reverse = true; pp.count = 2; r = xb(part);
    ok(r.results.get(pp.id).status === 'error' && /Reverse/.test(r.results.get(pp.id).message) === false && /left that way/.test(r.results.get(pp.id).message), 'the seed at the path\'s start, reversed: no room that way, said in words');
  }
  {
    // a line and a tangent arc: (0,0)→(50,0), then centre (50,30) r 30 to (80,30); L = 50 + 15π; 5 equal stations s = iL/4,
    // on the line (s, 0), on the arc (50 + 30 sin φ, 30 − 30 cos φ), φ = (s − 50)/30
    const part = P.newPart();
    const s1 = sketchOn(part, front, (sk) => S.addRect(sk, [-2, -2], [2, 2]));
    const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 4, reverse: true });   // a 4-cube centred on (0, 0, −2)
    const s2 = sketchOn(part, front, (sk) => { S.addLine(sk, [0, 0], [50, 0]); S.addArc(sk, [50, 30], [50, 0], [80, 30]); });
    const pp = P.addFeature(part, 'pathpattern', { bodies: [e1.id], path: [{ sketch: s2.id }], count: 5, orient: 'fixed' });
    const r = xb(part);
    const L = 50 + 15 * PI;
    const want = [0, 1, 2, 3, 4].map((i) => { const s = i * L / 4; if (s <= 50) return [s, 0, -2]; const ph = (s - 50) / 30; return [50 + 30 * Math.sin(ph), 30 - 30 * Math.cos(ph), -2]; });
    const got = [e1.id, ...[1, 2, 3, 4].map((i) => `${e1.id}@${pp.id}#${i}`)].map((id) => body(r, id)).map((b) => b && b.bbox.min.map((v, i) => (v + b.bbox.max[i]) / 2));
    ok(allOk(r) && got.every((g, i) => g && nearV(g, want[i], 1e-8)), `a line + tangent arc path (L = 50 + 15π): 5 copies at equal arc lengths, by hand to 1e-8 (${why(r) || 'built'})`);
  }
  {
    // closed path: a circle r 40 about the origin, a feature seed (a Ø6 boss 5 high on a 120×120×4 plate, at (40, 0)),
    // 6 equal round the loop: plate + 6·π·9·5
    const part = P.newPart();
    const s0 = sketchOn(part, front, (sk) => S.addRect(sk, [-60, -60], [60, 60]));
    P.addFeature(part, 'extrude', { sketch: s0.id, depth: 4 });
    const s1 = sketchOn(part, { kind: 'fixed', o: [0, 0, 4], n: [0, 0, 1] }, (sk) => S.addCircle(sk, [40, 0], 3));
    const boss = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 5 });
    const s2 = sketchOn(part, front, (sk) => S.addCircle(sk, [0, 0], 40));
    const pp = P.addFeature(part, 'pathpattern', { seeds: [boss.id], path: [{ sketch: s2.id }], count: 6 });
    const r = xb(part);
    ok(allOk(r) && rel(r.stats.volume, 120 * 120 * 4 + 6 * PI * 9 * 5) && r.bodies.length === 1, `features along a closed circle: 6 bosses joined to the plate, 57600 + 270π (${r.stats.volume.toFixed(6)})`);
    const walls = r.faces.filter((f) => f.type === 'cylinder' && near(f.r, 3));
    const angles = walls.map((f) => Math.atan2(f.axis.o[1], f.axis.o[0]) * 180 / PI).map((a) => Math.round(((a % 360) + 360) % 360 * 1e6) / 1e6).sort((a, b) => a - b);
    ok(walls.length === 6 && angles.every((a, i) => near(a, i * 60, 1e-6)) && walls.every((f) => near(Math.hypot(f.axis.o[0], f.axis.o[1]), 40, 1e-9)), `the six boss walls on the r 40 circle every 60° (${angles.join(', ')})`);
    ok(r.faces.some((f) => f.name && f.name.includes(`@${pp.id}#5`)), 'copy faces are named …@' + pp.id + '#i');
  }
  {
    // bodies in linear and circular patterns: a 10-cube body, 3 along X every 30 → new bodies; 4 about Y every 90°
    const part = P.newPart();
    const s = sketchOn(part, front, (sk) => S.addRect(sk, [20, 0], [30, 10]));
    const e = P.addFeature(part, 'extrude', { sketch: s.id, depth: 10 });
    const lp = P.addFeature(part, 'lpattern', { seeds: [], bodies: [e.id], dir: { kind: 'world', axis: 'x' }, count: 3, spacing: 30 });
    let r = xb(part);
    ok(allOk(r) && r.bodies.length === 3 && nearV(boxOf(body(r, `${e.id}@${lp.id}#2`)), [80, 0, 0, 90, 10, 10]), 'a linear pattern of a body: 3 separate bodies, copy 2 at [80,90]×[0,10]×[0,10]');
    lp.suppressed = true;
    const cp = P.addFeature(part, 'cpattern', { seeds: [], bodies: [e.id], axis: { kind: 'world', axis: 'y' }, count: 4, angle: 360 });
    r = xb(part);
    // about +Y by 90°: (x, z) → (z, −x): [20,30]×[0,10] in (x, z) → x ∈ [0,10], z ∈ [−30,−20]
    ok(r.results.get(cp.id).status === 'ok' && r.bodies.length === 4 && nearV(boxOf(body(r, `${e.id}@${cp.id}#1`)), [0, 0, -30, 10, 10, -20], 1e-9), 'a circular pattern of a body: copy 1 turned 90° about Y to [0,10]×[0,10]×[−30,−20]');
    const back = P.readPart(P.toJSON(part));
    ok(JSON.stringify(back.features.find((f) => f.id === cp.id).bodies) === JSON.stringify([e.id]) && P.fileVersion(part) === 3, 'pattern bodies are saved (version 3) and read back');
    if (M) { const km = K.regenerate(part, M); ok(km.results.get(cp.id).status === 'error' && /exact kernel/.test(km.results.get(cp.id).message), 'the mesh kernel refuses body patterns in words'); }
  }

  // ======================================================================================
  section('bodies: datum geometry between objects');
  {
    // the block 100 × 60 × 40 (x 0…100, y 0…60, z 0…40) with a Ø20 hole through its top at (50, 30)
    const part = P.newPart();
    const s = sketchOn(part, front, (sk) => S.addRect(sk, [0, 0], [100, 60]));
    const bx = P.addFeature(part, 'extrude', { sketch: s.id, depth: 40 });
    const hs = sketchOn(part, { kind: 'face', feature: bx.id, face: 'end' }, (sk) => S.addCircle(sk, [50, 30], 10));
    P.addFeature(part, 'extrude', { sketch: hs.id, op: 'cut', end: 'through' });
    let r = xb(part);
    const edgeX = r.edges.find((e) => e.type === 'line' && near(e.a[1], 0) && near(e.b[1], 0) && near(e.a[2], 0) && near(e.b[2], 0));   // (0,0,0)–(100,0,0)
    const rim = r.edges.find((e) => e.type === 'circle' && near(e.at[2], 40));
    const add = (props) => P.addFeature(part, props.type, props);
    const pts = {
      planes3: add({ type: 'point', mode: 'planes3', planes: [front, top, right] }),
      planes3b: add({ type: 'point', mode: 'planes3', planes: [{ kind: 'face', feature: bx.id, face: 'end' }, top, right] }),
      mid: add({ type: 'point', mode: 'mid', edge: B.edgeRef(edgeX) }),
      midPts: add({ type: 'point', mode: 'mid', points: [{ kind: 'fixed', p: [0, 0, 0] }, { kind: 'fixed', p: [10, 20, 30] }] }),
      midCirc: add({ type: 'point', mode: 'mid', edge: B.edgeRef(rim) }),
      meetAxis: add({ type: 'point', mode: 'meet', axis: { kind: 'world', axis: 'z' }, planes: [{ kind: 'face', feature: bx.id, face: 'end' }] }),
      meetEdge: add({ type: 'point', mode: 'meet', edge: B.edgeRef(edgeX), planes: [{ kind: 'fixed', o: [30, 0, 0], n: [1, 1, 0] }] }),
      meetCirc: add({ type: 'point', mode: 'meet', edge: B.edgeRef(rim), planes: [{ kind: 'fixed', o: [50, 0, 0], n: [1, 0, 0] }] }),
      meetCirc2: add({ type: 'point', mode: 'meet', edge: B.edgeRef(rim), planes: [{ kind: 'fixed', o: [50, 0, 0], n: [1, 0, 0] }], flip: true }),
      meetCyl: add({ type: 'point', mode: 'meet', axis: { kind: 'fixed', o: [0, 30, 5], d: [1, 0, 0] }, face: B.faceRef(r.faces.find((f) => f.type === 'cylinder')) }),
      meetCyl2: add({ type: 'point', mode: 'meet', axis: { kind: 'fixed', o: [0, 30, 5], d: [1, 0, 0] }, face: B.faceRef(r.faces.find((f) => f.type === 'cylinder')), flip: true }),
      edgept: add({ type: 'plane', mode: 'edgept', edge: B.edgeRef(edgeX), points: [{ kind: 'fixed', p: [0, 60, 40] }] }),
      midnormal: add({ type: 'plane', mode: 'midnormal', points: [{ kind: 'fixed', p: [0, 0, 0] }, { kind: 'fixed', p: [100, 0, 0] }] }),
      midnormalE: add({ type: 'plane', mode: 'midnormal', edge: B.edgeRef(edgeX) }),
      axis2: add({ type: 'axis', mode: '2pt', points: [{ kind: 'fixed', p: [1, 2, 3] }, { kind: 'fixed', p: [4, 6, 3] }] }),
    };
    r = xb(part);
    const g = (k) => r.refGeom.get(pts[k].id);
    ok(allOk(r), `every datum builds (${why(r) || 'all'})`);
    ok(nearV(g('planes3').p, [0, 0, 0]) && nearV(g('planes3b').p, [0, 0, 40]), 'three planes meet: front/top/right at the origin; the block top (z 40), top and right planes at (0, 0, 40)');
    ok(nearV(g('mid').p, [50, 0, 0]) && nearV(g('midPts').p, [5, 10, 15]), 'midpoint of the edge (0,0,0)–(100,0,0) = (50, 0, 0); between (0,0,0) and (10,20,30) = (5, 10, 15)');
    const mc = g('midCirc').p, st = rim.a;
    ok(near(Math.hypot(mc[0] - 50, mc[1] - 30), 10, 1e-9) && near(mc[2], 40) && nearV([mc[0] + st[0], mc[1] + st[1]], [100, 60], 1e-9), 'midpoint of the full rim circle: on the circle, opposite its start point (half its length)');
    ok(nearV(g('meetAxis').p, [0, 0, 40]), 'the Z axis meets the block top at (0, 0, 40)');
    ok(nearV(g('meetEdge').p, [30, 0, 0]), 'the edge along X meets the plane x + y = 30 at (30, 0, 0)');
    const c1 = g('meetCirc').p, c2 = g('meetCirc2').p;
    ok(near(c1[0], 50) && near(c2[0], 50) && near(c1[2], 40) && nearV([c1[1], c2[1]].sort((a, b) => a - b), [20, 40], 1e-9), 'the rim circle (r 10 about (50, 30)) crosses x = 50 at y 20 and y 40; flip gives the other');
    ok(nearV(g('meetCyl').p, [40, 30, 5], 1e-9) && nearV(g('meetCyl2').p, [60, 30, 5], 1e-9), 'the line y 30, z 5 along X meets the hole (r 10 about x 50) at x 40, flip x 60');
    const ne = g('edgept').frame.n, wantN = V.norm([0, -40, 60]);
    ok(near(Math.abs(V.dot(ne, wantN)), 1, 1e-12) && near(V.dot(V.sub([0, 60, 40], g('edgept').frame.o), ne), 0, 1e-9), 'plane through the X edge and (0, 60, 40): normal ±(0, −40, 60)/|·|, holding the point');
    ok(near(Math.abs(g('midnormal').frame.n[0]), 1) && near(g('midnormal').frame.o[0], 50) && near(Math.abs(g('midnormalE').frame.n[0]), 1) && near(g('midnormalE').frame.o[0], 50), 'square to the segment / the edge at its middle: the plane x = 50');
    ok(nearV(g('axis2').d.map(Math.abs), [0.6, 0.8, 0], 1e-12), 'axis through two points (1,2,3)–(4,6,3): direction (0.6, 0.8, 0)');
    // refusals in words
    const bad = [
      [{ type: 'point', mode: 'planes3', planes: [front, front, top] }, /do not meet in one point/],
      [{ type: 'point', mode: 'meet', axis: { kind: 'world', axis: 'x' }, planes: [top] }, /parallel/],
      [{ type: 'point', mode: 'meet', axis: { kind: 'fixed', o: [0, 80, 5], d: [1, 0, 0] }, face: B.faceRef(r.faces.find((f) => f.type === 'cylinder')) }, /misses the cylinder/],
      [{ type: 'point', mode: 'meet', edge: B.edgeRef(rim), planes: [{ kind: 'fixed', o: [90, 0, 0], n: [1, 0, 0] }] }, /does not reach/],
      [{ type: 'plane', mode: 'edgept', edge: B.edgeRef(edgeX), points: [{ kind: 'fixed', p: [70, 0, 0] }] }, /lies on the line/],
      [{ type: 'plane', mode: 'midnormal', points: [{ kind: 'fixed', p: [1, 1, 1] }, { kind: 'fixed', p: [1, 1, 1] }] }, /same point/],
      [{ type: 'point', mode: 'mid' }, /two points/],
    ];
    for (const [props, re] of bad) {
      const f = add(props);
      const rr = xb(part);
      const res = rr.results.get(f.id);
      ok(res.status === 'error' && re.test(res.message), `refused: "${res.message}"`);
      P.deleteFeatures(part, [f.id]);
    }
    const back = P.readPart(P.toJSON(part));
    const canon = (o) => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map((x) => [x, v[x]])) : v));
    const diff = back.features.filter((f) => f.type === 'point' || f.type === 'plane').filter((f) => canon(f) !== canon(part.features.find((x) => x.id === f.id)));
    ok(!diff.length, 'the new datum modes save and read back unchanged' + (diff.length ? ': ' + JSON.stringify(diff[0]) + ' vs ' + JSON.stringify(part.features.find((x) => x.id === diff[0].id)) : ''));
    if (M) {
      const km = K.regenerate(part, M);
      const kk = (k) => km.refGeom.get(pts[k].id);
      ok(nearV(kk('planes3').p, [0, 0, 0]) && nearV(kk('midPts').p, [5, 10, 15]) && nearV(kk('midnormal').frame.o, [50, 0, 0]), 'the mesh kernel builds the modes made of planes and points (three planes, between points, square to a segment)');
      ok(km.results.get(pts.mid.id).status === 'error' && /exact kernel/.test(km.results.get(pts.mid.id).message), 'and refuses the edge ones, saying they need the exact kernel');
    }
  }

  // ======================================================================================
  section('bodies: files');
  {
    const { part, A, Bx } = twoBoxes();
    P.addFeature(part, 'combine', { op: 'cut', target: A.id, tools: [Bx.id], keep: true });
    P.addFeature(part, 'movebody', { bodies: [Bx.id], mode: 'rotate', axis: { kind: 'world', axis: 'z' }, angle: 15, copy: true });
    P.addFeature(part, 'scalebody', { bodies: [A.id], uniform: false, sx: 1, sy: 2, sz: 1, point: { kind: 'fixed', p: [0, 0, 0] } });
    const sp = sketchOn(part, front, (sk) => S.addLine(sk, [0, -20], [200, -20]));
    P.addFeature(part, 'pathpattern', { bodies: [A.id], path: [{ sketch: sp.id }], count: 2, spacing: 'distance', d: 150 });
    const j = P.toJSON(part);
    const back = P.readPart(j);
    const strip = (fs) => fs.filter((f) => f.type !== 'sketch').map((f) => JSON.stringify(f));
    ok(JSON.parse(j).version === 3 && JSON.stringify(strip(back.features)) === JSON.stringify(strip(part.features)), 'Combine, Move, Scale and Path pattern save (version 3) and read back unchanged');
    ok(allOk(xb(back)), 'and the read-back part builds');
    const tamper = (fn, what) => { const t = JSON.parse(j); fn(t); ok(throws(() => P.readPart(JSON.stringify(t)), /bad|unknown|missing/), `a tampered file is refused (${what})`); };
    const find = (t, type) => t.features.find((f) => f.type === type);
    tamper((t) => { find(t, 'combine').op = 'smash'; }, 'combine operation');
    tamper((t) => { find(t, 'combine').target = 'f99'; }, 'a target body of a feature the file lacks');
    tamper((t) => { find(t, 'combine').tools = ['x1']; }, 'a malformed body id');
    tamper((t) => { find(t, 'combine').tools = 'f2'; }, 'tools not a list');
    tamper((t) => { find(t, 'movebody').mode = 'teleport'; }, 'move type');
    tamper((t) => { find(t, 'movebody').dx = 1e9; }, 'move distance');
    tamper((t) => { find(t, 'movebody').planes = [1, 2, 3]; }, 'align planes');
    tamper((t) => { find(t, 'scalebody').sx = 0; }, 'a zero scale');
    tamper((t) => { find(t, 'scalebody').sy = -2; }, 'a negative scale');
    tamper((t) => { find(t, 'pathpattern').count = 0; }, 'path pattern count');
    tamper((t) => { find(t, 'pathpattern').spacing = 'random'; }, 'path pattern spacing');
    tamper((t) => { find(t, 'pathpattern').path = [{ sketch: 'f2' }]; }, 'a path sketch that is an extrude');
    tamper((t) => { find(t, 'pathpattern').bodies = ['f2@f99#1']; }, 'a copy of a feature the file lacks');
    tamper((t) => { t.features.push({ id: 'f990', type: 'point', name: 'P', mode: 'meet', points: [], edge: null, p: [0, 0, 0], planes: [1] }); }, 'a datum point with a bad plane');
    if (M) {
      const km = K.regenerate({ ...part, features: part.features.map((f) => (f.id === Bx.id ? { ...f, op: 'add' } : f)) }, M);   // Extrude2 joined, so Combine is reached
      const tools = part.features.filter((f) => BD.BODY_LABELS[f.type]).map((f) => km.results.get(f.id));
      const c0 = km.results.get(part.features.find((f) => f.type === 'combine').id);
      ok(tools.length === 4 && tools.every((x) => x.status === 'skipped') && /^Combine: not built yet\. It needs an exact kernel/.test(c0.message), `the mesh kernel skips the body tools ("${c0.message}")`);
    }
  }

  // ======================================================================================
  section('bodies: names and hiding (0.4 P3)');
  {
    const I18N = await import(DEV + 'i18n.js');
    I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
    const { part, A, Bx } = twoBoxes();
    let r = xb(part);
    ok(P.fileVersion(part) === 3 && !part.bodyInfo, 'no names or hidden bodies: no bodyInfo key');
    BD.setBodyName(part, A.id, '  Base\u0007 plate  ');
    ok(BD.bodyLabel(part, A.id) === 'Base plate' && BD.autoBodyLabel(part, A.id) === 'Extrude1' && BD.bodyLabel(part, Bx.id) === 'Extrude2', 'a renamed body is called by its name everywhere bodyLabel is used (control characters and spaces trimmed); the other keeps its feature\'s name');
    BD.setBodyName(part, A.id, 'x'.repeat(200));
    ok(BD.bodyLabel(part, A.id).length === BD.BODY_NAME_MAX, `names are cut at ${BD.BODY_NAME_MAX} characters`);
    BD.setBodyName(part, A.id, '');
    ok(!part.bodyInfo && BD.bodyLabel(part, A.id) === 'Extrude1', 'clearing the name goes back to the feature\'s name and drops the entry');
    BD.setBodyName(part, A.id, 'Extrude1');
    ok(!part.bodyInfo, 'a name equal to the automatic one is not stored');
    // hiding: the faces of B and only the edges between two of B's faces
    BD.setBodiesHidden(part, [Bx.id], true);
    const h = BD.hiddenGeometry(part, r);
    const bFaces = r.faceBody.map((b, i) => (b === Bx.id ? i : -1)).filter((i) => i >= 0);
    const bNames = new Set(bFaces.map((i) => r.faces[i].name));
    const bEdges = r.edges.map((e, i) => (e.faces.every((n) => bNames.has(n)) ? i : -1)).filter((i) => i >= 0);
    ok(h && h.faces.size === bFaces.length && bFaces.every((i) => h.faces.has(i)) && h.edges.size === bEdges.length && bEdges.length >= 12 && h.bodies.has(Bx.id) && !h.bodies.has(A.id),
      `hiding Extrude2: its ${bFaces.length} faces and ${bEdges.length} edges (a box: 6 and 12) are hidden, Extrude1's are not`);
    ok(r.edges.every((e, i) => !h.edges.has(i) || !e.faces.some((n) => r.faceBody[r.faces.findIndex((f) => f.name === n)] === A.id)), 'no hidden edge touches a face of the shown body');
    ok(rel(xb(part).stats.volume, 172000), 'hiding is display only: both bodies are still built (172000)');
    // the mesh triangles of the hidden faces: what the view leaves out
    const hidTris = [...r.mesh.triFace].filter((f) => h.faces.has(f)).length;
    ok(hidTris > 0 && hidTris < r.mesh.triFace.length, `the view leaves out ${hidTris} of ${r.mesh.triFace.length} triangles`);
    // file: version 3, round trip, tamperings, a body of a deleted feature dropped on read
    BD.setBodyName(part, A.id, 'Base plate');
    const j = P.toJSON(part);
    const back = P.readPart(j);
    ok(JSON.parse(j).version === 3 && back.bodyInfo?.[A.id]?.name === 'Base plate' && back.bodyInfo?.[Bx.id]?.hidden === true && !back.bodyInfo[A.id].hidden, 'saved and read back: the name and the hidden body (version 3)');
    const tamper = (fn, what, re = /bod(y|ies)/) => { const t = JSON.parse(j); fn(t); ok(throws(() => P.readPart(JSON.stringify(t)), re), `a tampered body list is refused (${what})`); };
    tamper((t) => { t.bodyInfo = [1, 2]; }, 'not an object');
    tamper((t) => { t.bodyInfo = { 'not a body': { name: 'x' } }; }, 'a bad body id');
    tamper((t) => { t.bodyInfo[A.id] = 'x'; }, 'an entry that is not an object');
    tamper((t) => { t.bodyInfo[A.id] = { name: 42 }; }, 'a name that is not text');
    tamper((t) => { t.bodyInfo = Object.fromEntries(Array.from({ length: 501 }, (_, i) => [`f${i + 1}`, { hidden: true }])); }, 'too many entries');
    const t2 = JSON.parse(j); t2.bodyInfo['f77'] = { name: 'Gone' }; t2.bodyInfo[A.id].hidden = 'yes';
    const b2 = P.readPart(JSON.stringify(t2));
    ok(!b2.bodyInfo.f77 && b2.bodyInfo[A.id].hidden === undefined && b2.bodyInfo[A.id].name === 'Base plate', 'a body of a feature the file lacks is dropped (it was deleted before the save); hidden must be true, else ignored');
    const t3 = JSON.parse(j); t3.bodyInfo[A.id].name = '\u0001\u0002'; delete t3.bodyInfo[Bx.id];
    ok(!P.readPart(JSON.stringify(t3)).bodyInfo, 'an entry left empty after cleaning is dropped');
    ok(P.readPart(P.toJSON(P.readPart(j))).bodyInfo[A.id].name === 'Base plate', 'saved again: unchanged');
    // showing all again leaves only the name
    BD.setBodiesHidden(part, [Bx.id], false);
    ok(BD.hiddenGeometry(part, r) === null && Object.keys(part.bodyInfo).join() === A.id, 'Show all: nothing hidden, the name stays');
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
  await runBodiesTests({ ok, section, oc, M });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
