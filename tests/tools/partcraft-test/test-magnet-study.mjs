#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-magnet-study.mjs — 0.8 SG.7+: the Magnet study of a sketch (magnet-study.js over physics_PART_3's magnetSolve; session oltl-su_PART_3).
 * Sketch loops → regions → job → solve → answers → Problems, in Node, with the solver called directly (the page runs it in a compute worker).
 * Hand cases:
 *   - a magnet in the left leg of a closed iron frame (magnet in a sketch of its own, sharing two edges with the yoke): B in the magnet =
 *     Br (l/μrm) / (l/μrm + L/μr), the magnetic circuit of P. Campbell, Permanent Magnet Materials and their Application (1994), within 1 %;
 *   - two square coils with opposite currents: equal and opposite forces (within 3 %), repulsion along x, a force of the order μ0 I² / (2π D)
 *     that approaches it as the air box grows (the box is a wall);
 *   - a keeper drawn across the pole faces of a U yoke with a permanent magnet: attracted (−y), no sideways force, no torque of note, the contour runs
 *     through the gaps in the middle of the air, and the study warns that a force through a thin gap is rough (sim.magnet.force_thin).
 *   node tools/partcraft-test/test-magnet-study.mjs   (or runMagnetStudyTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runMagnetStudyTests({ ok, section }) {
  const I18N = await import(DEV + 'i18n.js');
  try { I18N.init({ strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) }); } catch { /* keys show instead */ }
  const S = await import(DEV + 'sketch.js'), MS = await import(DEV + 'magnet-study.js'), W = await import(DEV + 'phys-worker.js');
  const near = (a, b, tol) => Math.abs(a - b) <= tol * Math.abs(b);
  const rect = (x0, y0, x1, y1) => { const sk = S.newSketch(); S.addRect(sk, [x0, y0], [x1, y1]); return sk; };
  const poly = (pts) => { const sk = S.newSketch(); const ids = pts.map(([x, y]) => S.addPoint(sk, x, y)); ids.forEach((id, i) => S.addLine(sk, id, ids[(i + 1) % ids.length])); return sk; };
  const run = (loops, specs, o) => { const b = MS.buildJob(loops, specs, o); if (b.problems.length) throw new Error(b.problems.join('; ')); const r = W.magnetSolve(b.job); return { b, r, sum: MS.summarize(r, b.meta) }; };

  section('Magnet study: sketches to regions (0.8 SG.7+; magnet-study.js)');
  {
    const one = MS.loopsOf(rect(0, 0, 10, 5));
    ok(one.loops && one.loops.length === 1 && one.loops[0].length >= 4, 'a rectangle sketch is one closed profile');
    const openSk = S.newSketch(); S.addLine(openSk, S.addPoint(openSk, 0, 0), S.addPoint(openSk, 5, 0));
    ok(/./.test(MS.loopsOf(openSk).error || ''), 'an open sketch is refused with the reader\'s sentence', MS.loopsOf(openSk).error);
    ok(MS.loopsOf(S.newSketch()).error && MS.loopsOf(null).error, 'an empty sketch and no sketch are refused');
    const two = MS.loopsOfSketches([{ id: 'a', name: 'A', sketch: rect(0, 0, 10, 10) }, { id: 'b', name: 'B', sketch: rect(2, 2, 4, 4) }]);
    ok(two.loops.length === 2 && two.origin[1].name === 'B' && two.origin[1].n === 1, 'two sketches give one list, each profile remembering its sketch');
    const bad = MS.loopsOfSketches([{ id: 'a', name: 'A', sketch: rect(0, 0, 10, 10) }, { id: 'o', name: 'Open', sketch: openSk }]);
    ok(/Open/.test(bad.error || ''), 'a bad sketch is named in the refusal', bad.error);
    const cut = MS.splitTouching([[[0, 0], [10, 0], [10, 10], [0, 10]], [[0, 2], [0, 6], [-4, 6], [-4, 2]]]);
    ok(cut[0].length === 6 && cut[0].some((p) => p[0] === 0 && p[1] === 2) && cut[0].some((p) => p[0] === 0 && p[1] === 6), 'corners of a body that lies on another\'s edge are added to that edge (T-junction split)', JSON.stringify(cut[0]));
    ok(MS.crossingPairs([[[0, 0], [10, 0], [10, 10], [0, 10]], [[5, 5], [15, 5], [15, 15], [5, 15]]]).length === 1 && MS.crossingPairs([[[0, 0], [10, 0], [10, 10], [0, 10]], [[2, 2], [4, 2], [4, 4], [2, 4]]]).length === 0, 'outlines that cross are found; nested ones are not');
    const cur = MS.parseCurve('# B H\n0.5 150\n1.0 400\n1.5, 2000');
    ok(cur.points && cur.points.length === 3 && MS.parseCurve('1 100\n0.5 200').error && MS.parseCurve('x y').error && MS.parseCurve('0 0\n1 5').error, 'a B–H curve: pairs read, comments skipped; falling, non-numeric and zero points refused');
    ok(MS.fieldColour(0) === '#182860' && MS.fieldColour(1) === '#c8281e' && /^#[0-9a-f]{6}$/.test(MS.fieldColour(0.5)), 'the colour scale runs dark blue to red');
    const nosrc = MS.buildJob(one.loops, MS.defaultSpecs(1), {});
    ok(nosrc.problems.length === 1 && /drives a field/.test(nosrc.problems[0]), 'with nothing that drives a field the study will not run', nosrc.problems.join());
    const cross = MS.buildJob([[[0, 0], [10, 0], [10, 10], [0, 10]], [[5, 5], [15, 5], [15, 15], [5, 15]]], [{ role: 'magnet', br: 1 }, { role: 'iron' }], {});
    ok(cross.problems.some((p) => /cross/.test(p)), 'crossing outlines are refused in words', cross.problems.join());
  }

  section('Magnet study: a magnet in a closed iron frame (known answer)');
  {
    const yoke = rect(-50, -30, 50, 30); S.addRect(yoke, [-30, -10], [30, 10]);
    const L = MS.loopsOfSketches([{ id: 'y', name: 'Yoke', sketch: yoke }, { id: 'm', name: 'Magnet', sketch: rect(-50, -10, -30, 10) }]);
    ok(L.loops.length === 3, 'frame outline + window + magnet = three profiles');
    const sp = MS.defaultSpecs(3); sp[0] = { ...sp[0], role: 'iron', mur: 1000 }; sp[1] = { ...sp[1], role: 'air' }; sp[2] = { ...sp[2], role: 'magnet', br: 1.2, angle: 90, murMag: 1.05 };
    const { r } = run(L.loops, sp, { depth: 1000, pad: 1, fine: 1 });
    let s = 0, n = 0;
    for (let e = 0; e < r.mesh.tris.length / 3; e++) if (r.mesh.region[e] === 3) { s += r.B.mag[e]; n++; }
    const want = 1.2 * (20 / 1.05) / (20 / 1.05 + 220 / 1000);
    ok(n > 20 && near(s / n, want, 0.01), `B in the magnet ${(s / n).toFixed(4)} T against the circuit's ${want.toFixed(4)} T (${(100 * (s / n / want - 1)).toFixed(2)} %)`);
    ok(r.stats.minAngle > 15, 'the mesh is well shaped (smallest angle ' + r.stats.minAngle.toFixed(1) + '°)');
  }

  section('Magnet study: forces and torque');
  {
    const L = MS.loopsOfSketches([{ id: 'a', name: 'A', sketch: rect(-22, -2, -18, 2) }, { id: 'b', name: 'B', sketch: rect(18, -2, 22, 2) }]);
    const sp = MS.defaultSpecs(2).map((s, i) => ({ ...s, role: 'coil', current: i ? -1000 : 1000, force: true }));
    const exact = 4e-7 * Math.PI * 1000 * 1000 / (2 * Math.PI * 0.04);   // N per metre between two long conductors 40 mm apart
    const small = run(L.loops, sp, { depth: 1000, pad: 1, fine: 1 }), big = run(L.loops, sp, { depth: 1000, pad: 4, fine: 1 });
    const [a1, b1] = small.sum.bodies, [a4, b4] = big.sum.bodies;
    ok(near(a4.fx, -b4.fx, 0.03), `equal and opposite forces on the two coils (${a4.fx.toFixed(2)} and ${b4.fx.toFixed(2)} N at 1 m depth; with the box 1× only: ${a1.fx.toFixed(2)} and ${b1.fx.toFixed(2)})`);
    ok(a4.fx < 0 && b4.fx > 0 && Math.abs(a4.fy) < 0.06 * Math.abs(a4.fx), 'opposite currents repel: the left coil is pushed left, with no sideways force to speak of');
    ok(Math.abs(Math.abs(a4.fx) - exact) < Math.abs(Math.abs(a1.fx) - exact) && near(-a4.fx, exact, 0.1), `the force approaches μ0I²/2πD = ${exact.toFixed(2)} N as the air grows: ${(-a1.fx).toFixed(2)} (1×) → ${(-a4.fx).toFixed(2)} N (4×; the box edge is a wall)`);
    const d2 = run(L.loops, sp, { depth: 500, pad: 1, fine: 1 }).sum.bodies[0];
    ok(near(d2.fx, a1.fx / 2, 1e-9), 'the force scales with the depth given');
    // torque about the body's middle, not the origin: shifting the reference point by c changes the torque by c × F
    const fake = { Bmax: { value: 1, at: [0, 0] }, iterations: 3, stats: { tris: 10, minAngle: 30 }, mesh: { tris: new Int32Array(3) }, ms: 1, forces: [{ id: 'r1', fx: 2, fy: 3, torque: 5 }] };
    const meta = { depth: 1000, regions: [{ id: 1, loop: 0, role: 'iron' }], contours: [{ id: 'r1', loop: 0, box: [0.01, 0.02, 0.03, 0.04], thin: true }] };
    const tau = MS.summarize(fake, meta).bodies[0].torque;
    ok(near(tau, 5 - (0.02 * 3 - 0.03 * 2), 1e-12), 'torque is given about the body\'s middle: τ − (cx·Fy − cy·Fx)');
  }
  {
    const poly1 = poly([[-50, -30], [50, -30], [50, 30], [30, 30], [30, -10], [-30, -10], [-30, 30], [-50, 30]]);
    const L = MS.loopsOfSketches([{ id: 'y', name: 'Yoke', sketch: poly1 }, { id: 'm', name: 'Magnet', sketch: rect(-10, -30, 10, -10) }, { id: 'k', name: 'Keeper', sketch: rect(-50, 32, 50, 52) }]);
    const sp = MS.defaultSpecs(3).map((s) => ({ ...s, mur: 1000 }));
    sp[1] = { ...sp[1], role: 'magnet', br: 1.2, angle: 0, murMag: 1.05 }; sp[2] = { ...sp[2], force: true };
    const { b, r, sum } = run(L.loops, sp, { depth: 1000, pad: 1, fine: 0.5 });
    const k = sum.bodies[0], box = b.meta.contours[0].box;
    ok(L.loops.length === 3 && k.loop === 3, 'a U yoke with a magnet in its base, and a keeper 2 mm above the pole faces');
    ok(k.fy < 0 && Math.abs(k.fx) < 0.02 * Math.abs(k.fy) && Math.abs(k.torque) < 0.01 * Math.abs(k.fy) * 0.1, `the keeper is pulled down (${k.fy.toFixed(0)} N at 1 m depth), with no sideways force or torque of note`);
    ok(box[1] * 1000 > 30 && box[1] * 1000 < 32, 'the contour runs through the middle of the gaps (y = ' + (box[1] * 1000).toFixed(2) + ' mm, between 30 and 32)');
    // the gap field itself, from the same solution: the force is of the order of the pole pressure B²/2μ0 on the two pole faces
    let sB = 0, ar = 0; const T = r.mesh.tris, N = r.mesh.nodes;
    for (let e = 0; e < T.length / 3; e++) {
      const i = T[3 * e], j = T[3 * e + 1], l = T[3 * e + 2], cx = (N[2 * i] + N[2 * j] + N[2 * l]) / 3 * 1000, cy = (N[2 * i + 1] + N[2 * j + 1] + N[2 * l + 1]) / 3 * 1000;
      if (cy > 30.2 && cy < 31.8 && ((cx > -48 && cx < -32) || (cx > 32 && cx < 48))) { const a = Math.abs((N[2 * j] - N[2 * i]) * (N[2 * l + 1] - N[2 * i + 1]) - (N[2 * l] - N[2 * i]) * (N[2 * j + 1] - N[2 * i + 1])) / 2; sB += r.B.y[e] ** 2 * a; ar += a; }
    }
    const press = Math.sqrt(sB / ar) ** 2 / (2 * 4e-7 * Math.PI) * 0.04;   // N per metre of depth, both pole faces, 20 mm wide
    ok(ar > 0 && -k.fy > 0.5 * press && -k.fy < 2 * press, `the force is within a factor of two of the pole pressure on the faces (${(-k.fy).toFixed(0)} against ${press.toFixed(0)} N/m): a sanity bound, not an accuracy claim`);
    ok(b.meta.contours[0].thin === true && k.thin === true, 'a contour within three triangles of its body is marked thin');
    const probs = MS.magnetProblems(sum, b.meta, sp);
    ok(probs.some((p) => p.code === 'sim.magnet.force_thin' && p.severity === 'warning' && p.msg.key === 'study.mag.p.force_thin' && p.source.name === 'partcraft.magnet'), 'the Problems say the force through a thin gap is rough');
    ok(probs.every((p) => p.id && p.about && p.source), 'every Problem has an id, what it is about and its source (rule 29)');
    const csv = MS.resultCsv(sum);
    ok(csv.startsWith('﻿quantity,value,unit') && /region 3 Fy,-/.test(csv), 'the CSV has the field and each body\'s force and torque');
    // iron with only a permeability past 2 T: the warning; with a curve: none
    const hot = { ...sum, bmax: 2.6 };
    ok(MS.magnetProblems(hot, b.meta, sp).some((p) => p.code === 'sim.magnet.saturation') && !MS.magnetProblems(hot, b.meta, sp.map((s) => ({ ...s, curve: '0.5 100\n1 300' }))).some((p) => p.code === 'sim.magnet.saturation'), 'iron with only a permeability passing 2 T raises a Problem; iron with a B–H curve does not');
    const tight = MS.contourBox(2, L.loops, [-0.2 * 1000, -0.2 * 1000, 0.2 * 1000, 0.2 * 1000], ['iron', 'magnet', 'iron']);
    ok(tight && tight[1] > 30 && tight[1] < 32, 'contourBox: the margin that centres the edge in the gap');
    const none = MS.contourBox(0, L.loops, [-50.05, -30.05, 50.05, 30.05], ['iron', 'magnet', 'iron']);
    ok(none === null, 'contourBox: no room for any contour round the yoke inside a model box that hugs it → null (the study says so)');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m, d) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d !== undefined ? ' — ' + String(d).slice(0, 200) : '')); };
  const section = (t) => console.log('\n== ' + t);
  await runMagnetStudyTests({ ok, section });
  console.log(`\nmagnet study: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
