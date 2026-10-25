#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-sketch-tools.mjs — PartCraft sketch splines, intersections and editing tools (assets/apps/partcraft/dev/
 * sketch-spline.js, sketch-intersect.js, sketch-tools.js and the spline parts of sketch.js / solver.js / brep.js):
 * spline evaluation against OpenCascade's own (GeomAPI_Interpolate, Geom_BSplineCurve) to 1e-9, intersections
 * against closed forms, trim / extend / offset / mirror results, exact extrudes of spline profiles against the
 * exact area × depth, the DXF polyline read back by ezdxf, and readSketch refusing tampered splines.
 *   node tools/partcraft-test/test-sketch-tools.mjs [--verbose]     (or runSketchToolTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runSketchToolTests({ ok, section, near, oc, skip = (m) => console.log('  skip ' + m) }) {
  const S = await import(DEV + 'sketch.js');
  const SP = await import(DEV + 'sketch-spline.js');
  const I = await import(DEV + 'sketch-intersect.js');
  const T = await import(DEV + 'sketch-tools.js');
  const { solveSketch } = await import(DEV + 'solver.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const X = await import(DEV + 'export.js');
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const maxOver = (n, f) => { let m = 0; for (let i = 0; i <= n; i++) m = Math.max(m, f(i / n)); return m; };
  const PI = Math.PI;

  // OCCT helpers
  const pntArr = (pts) => { const a = new oc.NCollection_Array1_gp_Pnt(1, pts.length); pts.forEach((p, i) => a.SetValue(i + 1, new oc.gp_Pnt(p[0], p[1], 0))); return a; };
  const occCurve = (f) => {
    const K = new oc.NCollection_Array1_double(1, f.knots.length); f.knots.forEach((k, i) => K.SetValue(i + 1, k));
    const M = new oc.NCollection_Array1_int(1, f.mults.length); f.mults.forEach((k, i) => M.SetValue(i + 1, k));
    return new oc.Geom_BSplineCurve(pntArr(f.poles), K, M, f.deg, f.periodic);
  };
  const vsOcc = (c, occ) => { const [lo, hi] = SP.domain(c); return maxOver(400, (s) => { const u = lo + (hi - lo) * s, p = occ.EvalD0(u), q = SP.pointAt(c, u); return Math.hypot(p.X() - q[0], p.Y() - q[1]); }); };

  // =====================================================================================
  section('sketch splines: evaluation against OpenCascade');
  const Q = [[0, 0], [10, 5], [25, -3], [40, 8], [50, 0], [62, 14]];
  {
    const nat = SP.interpFit(Q);
    ok(Q.every((q, i) => dist(SP.pointAt(nat, chord(Q, i)), q) < 1e-12), 'a fit spline passes through every fit point (1e-12)');
    // natural ends: no curvature at either end
    const [lo, hi] = SP.domain(nat);
    ok(Math.hypot(...SP.derivsAt(nat, lo, 2)[2]) < 1e-12 && Math.hypot(...SP.derivsAt(nat, hi, 2)[2]) < 1e-12, 'its ends are natural (second derivative 0)');
    ok(near(hi, chord(Q, Q.length - 1), 1e-12), 'parameters are chord lengths (as GeomAPI_Interpolate)');
    // GeomAPI_Interpolate with the same end tangents gives the same curve
    for (const [label, opt] of [['natural ends', {}], ['end angles 0.3 / −0.7', { a0: 0.3, a1: -0.7 }]]) {
      const mine = SP.interpFit(Q, opt);
      const ip = new oc.GeomAPI_Interpolate(new oc.NCollection_HArray1_gp_Pnt(pntArr(Q)), false, 1e-9);
      const t0 = opt.a0 !== undefined ? [Math.cos(opt.a0), Math.sin(opt.a0)] : SP.derivsAt(mine, lo, 1)[1];
      const t1 = opt.a1 !== undefined ? [Math.cos(opt.a1), Math.sin(opt.a1)] : SP.derivsAt(mine, hi, 1)[1];
      ip.Load(new oc.gp_Vec(t0[0], t0[1], 0), new oc.gp_Vec(t1[0], t1[1], 0), false);
      ip.Perform();
      const err = vsOcc(mine, ip.Curve());
      ok(ip.IsDone() && err < 1e-9, `fit spline (${label}) = OCCT GeomAPI_Interpolate with those end tangents, 400 points to 1e-9 (max ${err.toExponential(1)})`);
      ok(near(Math.atan2(...[...SP.derivsAt(mine, lo, 1)[1]].reverse()), opt.a0 ?? Math.atan2(t0[1], t0[0]), 1e-12), `${label}: the start tangent is where it was asked`);
    }
    const mineOcc = occCurve(SP.occForm(nat));
    ok(vsOcc(nat, mineOcc) < 1e-9, 'the poles/knots we hand OCCT (Geom_BSplineCurve) evaluate the same, to 1e-9');
    // closed (periodic)
    const Qc = [[0, 0], [30, -6], [52, 14], [31, 40], [-6, 26]];
    const per = SP.interpFit(Qc, { closed: true });
    ok(Qc.every((q, i) => dist(SP.pointAt(per, per.tau[i]), q) < 1e-12), 'a closed fit spline passes through its points');
    const [plo, phi] = SP.domain(per);
    const d0 = SP.derivsAt(per, plo, 2), d1 = SP.derivsAt(per, phi, 2);
    ok(dist(d0[0], d1[0]) < 1e-12 && dist(d0[1], d1[1]) < 1e-9 && dist(d0[2], d1[2]) < 1e-9, 'it closes C2 (point, tangent and curvature match at the seam)');
    const occP = occCurve(SP.occForm(per));
    ok(occP.IsPeriodic() && vsOcc(per, occP) < 1e-9, `periodic Geom_BSplineCurve from our poles = our curve to 1e-9 (${vsOcc(per, occP).toExponential(1)})`);
    // control-point splines
    const Pc = [[0, 0], [10, 30], [40, 35], [55, 5], [80, 20], [95, 0]];
    const cc = SP.controlCurve(Pc);
    ok(vsOcc(cc, occCurve(SP.occForm(cc))) < 1e-9 && dist(SP.pointAt(cc, 0), Pc[0]) === 0 && dist(SP.pointAt(cc, SP.domain(cc)[1]), Pc[5]) < 1e-12, 'clamped control spline = OCCT, ends on its end poles');
    const cp = SP.controlCurve(Pc, { closed: true });
    ok(vsOcc(cp, occCurve(SP.occForm(cp))) < 1e-9, 'closed (periodic) control spline = OCCT');
    // a single cubic Bézier against the Bernstein form
    const Bz = [[0, 0], [1, 3], [2, -1], [3, 2]];
    const bz = SP.controlCurve(Bz);
    const bern = (t) => { const b = [(1 - t) ** 3, 3 * t * (1 - t) ** 2, 3 * t * t * (1 - t), t ** 3]; return [0, 1].map((k) => b.reduce((s, w, i) => s + w * Bz[i][k], 0)); };
    ok(maxOver(100, (t) => dist(SP.pointAt(bz, t), bern(t))) < 1e-14, 'de Boor = Bernstein for a 4-pole control spline (1e-14)');
    // knot insertion and segments keep the shape
    const ins = SP.insertKnot(cc, 1.37);
    ok(maxOver(200, (s) => dist(SP.pointAt(ins, 3 * s), SP.pointAt(cc, 3 * s))) < 1e-12, 'knot insertion keeps the curve (1e-12)');
    const seg = SP.segment(nat, 13.2, 41.7);
    ok(maxOver(200, (s) => { const u = 13.2 + (41.7 - 13.2) * s; return dist(SP.pointAt(seg, u), SP.pointAt(nat, u)); }) < 1e-11 && SP.knotProblem(seg.knots, seg.poles.length) === null, 'segment(13.2, 41.7) is the same curve there, clamped');
    const segW = SP.segment(per, phi - 10, phi + 15);
    ok(maxOver(200, (s) => { const u = phi - 10 + 25 * s; const v = u > phi ? u - (phi - plo) : u; return dist(SP.pointAt(segW, u), SP.pointAt(per, v)); }) < 1e-11, 'a segment of a closed spline across its seam is the same curve');
    const rv = SP.reverse(nat);
    ok(maxOver(100, (s) => dist(SP.pointAt(rv, hi * s), SP.pointAt(nat, hi * (1 - s)))) < 1e-12, 'reverse runs the same curve backwards');
    // exact area
    const Aexact = SP.areaTerm(per);
    const poly = SP.tessellate(per, 4000); poly.pop();
    ok(Math.abs(S.loopArea(poly) - Aexact) / Aexact < 1e-7, `the area by Green + 3-point Gauss (${Aexact.toFixed(6)}) = the 4000-per-span polygon's limit to 1e-7`);
    // offsets
    const off = SP.offsetFit(nat, 2.5, T.OFFSET_TOL);
    let worst = 0;
    for (const [u0, u1] of SP.spans(nat)) for (let i = 0; i < 97; i++) {
      const u = u0 + (u1 - u0) * (i + 0.37) / 97, [q, t] = SP.derivsAt(nat, u, 1), l = Math.hypot(...t);
      const want = [q[0] - 2.5 * t[1] / l, q[1] + 2.5 * t[0] / l];
      worst = Math.max(worst, dist(SP.pointAt(off.curve, SP.closestParam(off.curve, want)), want));
    }
    ok(worst <= T.OFFSET_TOL && off.err <= T.OFFSET_TOL, `a spline offset 2.5 is within ${T.OFFSET_TOL} mm of the true offset (checked at ${SP.spans(nat).length * 97} other points: ${worst.toExponential(2)})`);
    ok(throws(() => SP.offsetFit(SP.interpFit([[0, 0], [5, 5], [10, 0]]), -40, 0.001), /tightest bend/), 'an offset past the tightest bend is refused');
  }
  function chord(pts, i) { let s = 0; for (let k = 1; k <= i; k++) s += dist(pts[k - 1], pts[k]); return s; }

  // =====================================================================================
  section('sketch splines: entities, relations, solver, file data');
  {
    const sk = S.newSketch();
    const l = S.addLine(sk, [-40, 0], [0, 0]);
    S.addConstraint(sk, 'horizontal', [l.id]);
    const sp = S.addSpline(sk, [l.p2, [20, 10], [40, -5], [60, 5]]);
    const e = S.byId(sk, sp.id);
    ok(e.pts[0] === l.p2 && e.kind === 'fit', 'a fit spline starts on the line\'s end point (shared point)');
    let r = solveSketch(sk);
    ok(r.ok && r.dof === 3 + 6, `DOF = line 4 − horizontal 1, + 3 more fit points × 2 (the start is the line's end) = ${r.dof}`);
    const tg = S.addConstraint(sk, 'tangent', [l.id, sp.id]);
    ok(tg.refs[0] === l.id && Number.isFinite(e.a0) && e.a1 === undefined, 'tangent to the spline\'s start: the spline takes a start angle variable (a0)');
    r = solveSketch(sk);
    const t0 = S.splineEndTangent(sk, e, 's');
    ok(r.ok && Math.abs(t0[1]) < 1e-9 && r.dof === 9, `solved: the spline leaves the horizontal line horizontally (tangent y ${t0[1].toExponential(1)}), DOF still ${r.dof} (+1 angle −1 relation)`);
    // drag a fit point: tangency holds
    r = solveSketch(sk, { pin: new Map([[e.pts[2], [42, 12]]]) });
    ok(r.ok && Math.abs(S.splineEndTangent(sk, e, 's')[1]) < 1e-9, 'dragging a fit point keeps the tangency');
    // fit points take dimensions
    S.addConstraint(sk, 'fix', [l.p1]);
    S.addConstraint(sk, 'distance', [l.p1, l.p2], 40);
    S.addConstraint(sk, 'vdistance', [l.p2, e.pts[1]], 10);
    r = solveSketch(sk);
    ok(r.ok && near(S.pointXY(sk, e.pts[1])[1] - S.pointXY(sk, l.p2)[1], 10, 1e-9), 'a fit point takes a vertical distance from the line\'s end (10)');
    const c = S.splineCurve(sk, e);
    ok(dist(SP.pointAt(c, 0), S.pointXY(sk, l.p2)) < 1e-12, 'the spline still starts exactly on the line');
    // spline–spline tangent at a shared end, arc–spline tangent
    const sp2 = S.addSpline(sk, [e.pts[3], [80, 20], [100, 0]], { kind: 'control' });
    S.addConstraint(sk, 'tangent', [sp.id, sp2.id]);
    r = solveSketch(sk);
    const ta = S.splineEndTangent(sk, e, 'e'), tb = S.splineEndTangent(sk, S.byId(sk, sp2.id), 's');
    ok(r.ok && Math.abs(ta[0] * tb[1] - ta[1] * tb[0]) < 1e-6, 'fit spline end tangent to a control spline start (G1, to the solver\'s 1e-9 × size)');
    const ar = S.addArc(sk, [100, 30], S.byId(sk, sp2.id).pts[2], [130, 30]);
    S.addConstraint(sk, 'tangent', [ar.id, sp2.id]);
    r = solveSketch(sk);
    const tcn = S.splineEndTangent(sk, S.byId(sk, sp2.id), 'e'), ce = S.pointXY(sk, S.byId(sk, ar.id).c), pj = S.pointXY(sk, S.byId(sk, sp2.id).pts[2]);
    ok(r.ok && Math.abs(tcn[0] * (pj[0] - ce[0]) + tcn[1] * (pj[1] - ce[1])) < 1e-8, 'an arc tangent to a control spline\'s end (radius square to its last leg)');
    ok(throws(() => S.addConstraint(sk, 'tangent', [S.addLine(sk, [0, 50], [10, 50]).id, sp.id]), /meet one end/), 'a tangent to a spline away from its ends is refused');
    // round trip and refusals
    const back = S.readSketch(JSON.parse(JSON.stringify(sk)));
    const byIdStr = (list) => JSON.stringify([...list].sort((p, q) => (p.id < q.id ? -1 : 1)));
    ok(byIdStr(back.entities) === byIdStr(sk.entities) && back.constraints.length === sk.constraints.length, 'readSketch keeps splines (kind, points, end angle) and their relations');
    const tamper = (fn, re) => { const j = JSON.parse(JSON.stringify(sk)); fn(j); try { S.readSketch(j); return false; } catch (err) { return re.test(err.message); } };
    const sj = (j) => j.entities.find((x) => x.id === sp.id), cj = (j) => j.entities.find((x) => x.id === sp2.id);
    ok(tamper((j) => { sj(j).kind = 'bezier'; }, /neither/), 'refused: unknown spline kind');
    ok(tamper((j) => { sj(j).pts = [sj(j).pts[0]]; }, /too few/), 'refused: one point');
    ok(tamper((j) => { sj(j).pts[1] = sj(j).pts[0]; }, /used twice/), 'refused: a point used twice');
    ok(tamper((j) => { sj(j).pts[1] = 'O'; }, /missing or used twice/), 'refused: the origin as a fit point');
    ok(tamper((j) => { sj(j).pts[2] = 'p999'; }, /missing/), 'refused: a missing point');
    ok(tamper((j) => { sj(j).a0 = 'up'; }, /end angle/), 'refused: a non-number end angle');
    ok(tamper((j) => { cj(j).a0 = 1; }, /end angle/), 'refused: an end angle on a control spline');
    ok(tamper((j) => { sj(j).knots = [0, 0, 0, 0, 1, 1, 1, 1]; }, /only an open control/), 'refused: knots on a fit spline');
    ok(tamper((j) => { cj(j).knots = [0, 0, 0, 1, 1, 1, 1]; }, /do not match/), 'refused: a knot vector of the wrong length');
    ok(tamper((j) => { cj(j).knots = [0, 0, 0, 2, 2, 2]; cj(j).knots = [0, 0, 1, 0]; }, /do not match|backwards/), 'refused: knots going backwards');
    ok(tamper((j) => { cj(j).knots = [0, 0, 0.5, 1, 1, 1]; }, /clamped/), 'refused: unclamped knots');
    ok(tamper((j) => { cj(j).pts = cj(j).pts.slice(0, 2); cj(j).closed = true; }, /too few/), 'refused: a closed spline of two points');
    ok(tamper((j) => { const q = j.entities.find((x) => x.id === sj(j).pts[1]); const q2 = j.entities.find((x) => x.id === sj(j).pts[2]); q2.x = q.x; q2.y = q.y; }, /on top of each other/), 'refused: two fit points on top of each other');
    ok(tamper((j) => { j.constraints.find((k) => k.id === tg.id).refs = [j.constraints.find((k) => k.id === tg.id).refs[0], sp2.id]; }, /not at one of its ends|wrong geometry/), 'refused: a spline tangent away from its ends');
    ok(tamper((j) => { j.entities.push({ id: 's900', type: 'spline', kind: 'fit', pts: Array.from({ length: 501 }, (_, i) => 'p' + i) }); }, /too many/), 'refused: more than 500 spline points');
    // deleting an inner fit point keeps the spline
    const sk2 = S.clone(sk);
    const e2 = S.byId(sk2, sp.id);
    const inner = e2.pts[1];
    S.removeEntities(sk2, [inner]);
    ok(S.byId(sk2, sp.id) && S.byId(sk2, sp.id).pts.length === 3 && !S.byId(sk2, inner), 'deleting an inner fit point keeps the spline (3 points left)');
    // profile: closed spline and spline + line loops
    const sk3 = S.newSketch();
    S.addSpline(sk3, [[0, 0], [30, -6], [52, 14], [31, 40], [-6, 26]], { closed: true });
    const pr = S.profile(sk3, 64);
    ok(!pr.error && pr.loops.length === 1 && pr.loops[0].length === 5 * 8, 'a closed spline is a profile loop by itself (8 facets per span at 64 per turn)');
  }

  // =====================================================================================
  section('intersections (sketch-intersect.js) against closed forms');
  {
    const L = (a, b) => ({ kind: 'line', a, b });
    let x = I.intersect(L([0, 0], [10, 10]), L([0, 10], [10, 0]));
    ok(x.length === 1 && near(x[0].p[0], 5, 1e-14) && near(x[0].ta, 0.5, 1e-15) && near(x[0].tb, 0.5, 1e-15), 'line × line: (5, 5) at t = ½, ½');
    ok(I.intersect(L([0, 0], [1, 0]), L([0, 1], [1, 1])).length === 0 && I.intersect(L([0, 0], [1, 1]), L([3, 0], [4, -5])).length === 0, 'parallel lines and lines that miss: none');
    ok(I.intersect(L([0, 0], [1, 1]), L([3, 0], [4, -5]), { infA: true, infB: true }).length === 1, '…but their infinite lines meet');
    const C = { kind: 'circle', c: [3, -2], r: 5 };
    x = I.intersect(L([-10, 1], [10, 1]), C);
    ok(x.length === 2 && near(x[0].p[0], 3 - 4, 1e-13) && near(x[1].p[0], 3 + 4, 1e-13) && near(x[0].p[1], 1, 1e-14), 'line y = 1 × circle (3, −2) r 5: x = −1 and 7 (3-4-5)');
    x = I.intersect(L([-10, 3], [10, 3]), C);
    ok(x.length === 1 && near(x[0].p[0], 3, 1e-6) && near(x[0].p[1], 3, 1e-12), 'a tangent line touches once, at (3, 3)');
    const C2 = { kind: 'circle', c: [11, -2], r: 5 };
    x = I.intersect(C, C2);
    ok(x.length === 2 && x.every((q) => near(q.p[0], 7, 1e-12) && near(Math.abs(q.p[1] + 2), 3, 1e-12)), 'circle × circle: (7, −2 ± 3)');
    const arcTop = { kind: 'arc', c: [3, -2], r: 5, a0: 0, sweep: PI };
    ok(I.intersect(L([-10, -3], [10, -3]), arcTop).length === 0 && I.intersect(L([-10, -3], [10, -3]), arcTop, { infB: true }).length === 2, 'an arc (upper half) misses y = −3; its full circle does not');
    // spline × line: a cubic Bézier with x = 3t, so y = c is the cubic y(t) = c
    const Bz = [[0, 0], [1, 3], [2, -1], [3, 2]];
    const bz = { kind: 'spline', bs: SP.controlCurve(Bz), closed: false };
    const yOf = (t) => 3 * t * (1 - t) ** 2 * 3 - 3 * t * t * (1 - t) + 2 * t ** 3;
    // y(t) − 1 = 0: power form a t³ + b t² + c t + d; roots by Cardano (trigonometric, three real: y has a local max 1.19 and min 0.81)
    const coef = [9 + 3 + 2, -18 - 3, 9, -1];   // 9t(1−t)² − 3t²(1−t) + 2t³ − 1 = 14t³ − 21t² + 9t − 1
    ok(maxOver(10, (t) => Math.abs(coef[0] * t ** 3 + coef[1] * t * t + coef[2] * t + coef[3] - (yOf(t) - 1))) < 1e-12, '(the power form of that Bézier is right)');
    const [a3, b3, c3, d3] = coef;
    const pp = (3 * a3 * c3 - b3 * b3) / (3 * a3 * a3), qq = (2 * b3 ** 3 - 9 * a3 * b3 * c3 + 27 * a3 * a3 * d3) / (27 * a3 ** 3);
    const cardano = [0, 1, 2].map((k) => 2 * Math.sqrt(-pp / 3) * Math.cos(Math.acos(3 * qq / (2 * pp) * Math.sqrt(-3 / pp)) / 3 - 2 * PI * k / 3) - b3 / (3 * a3)).filter((t) => t >= 0 && t <= 1).sort((p, q) => p - q);
    x = I.intersect(L([-1, 1], [4, 1]), bz);
    ok(x.length === cardano.length && cardano.length === 3 && x.every((q, i) => near(q.tb, cardano[i], 1e-12) && near(q.p[0], 3 * cardano[i], 1e-11)), `spline × line: the 3 crossings of y = 1 match Cardano's roots to 1e-12 (t = ${cardano.map((t) => t.toFixed(6)).join(', ')})`);
    // spline × circle: centre (1.5, 0.5) r 1 — check each point is on both and the count by a fine scan
    const Cc = { kind: 'circle', c: [1.5, 0.5], r: 1 };
    x = I.intersect(Cc, bz);
    let scan = 0, prev = null;
    for (let i = 0; i <= 200000; i++) { const p = SP.pointAt(bz.bs, i / 200000), s = Math.sign(Math.hypot(p[0] - 1.5, p[1] - 0.5) - 1); if (prev !== null && s !== prev) scan++; prev = s; }
    ok(x.length === scan && x.every((q) => near(Math.hypot(q.p[0] - 1.5, q.p[1] - 0.5), 1, 1e-12) && dist(SP.pointAt(bz.bs, q.tb), q.p) < 1e-12), `spline × circle: ${x.length} crossings (a 200000-step scan counts ${scan}), each on both to 1e-12`);
    // spline × spline: the Bézier and its mirror in x = 1.5 cross on x = 1.5
    const bm = { kind: 'spline', bs: SP.controlCurve(Bz.map(([u, v]) => [3 - u, v])), closed: false };
    x = I.intersect(bz, bm);
    ok(x.length >= 1 && x.some((q) => near(q.p[0], 1.5, 1e-10)) && x.every((q) => dist(SP.pointAt(bz.bs, q.ta), SP.pointAt(bm.bs, q.tb)) < 1e-9), `spline × spline: crossings on both curves to 1e-9, one on the mirror line x = 1.5 (${x.length} found)`);
    ok(x.some((q) => near(q.ta, 0.5, 1e-10) && near(q.tb, 0.5, 1e-10)), '…at t = ½ on both (by symmetry)');
  }

  // =====================================================================================
  section('trim and extend');
  const solved = (sk) => solveSketch(sk);
  {
    // a horizontal line crossed by a vertical one: trim the right arm
    const sk = S.newSketch();
    const h = S.addLine(sk, [0, 0], [100, 0]);
    const v = S.addLine(sk, [60, -30], [60, 30]);
    S.addConstraint(sk, 'horizontal', [h.id]); S.addConstraint(sk, 'vertical', [v.id]);
    S.addConstraint(sk, 'distance', [h.id], 100);
    const r = T.trim(sk, h.id, [85, 0.5]);
    const hl = S.byId(sk, h.id);
    ok(r.removed === 'piece' && near(S.pointXY(sk, hl.p2)[0], 60, 1e-12) && near(S.pointXY(sk, hl.p2)[1], 0, 1e-12), 'trim the right arm: the line now ends at the crossing (60, 0)');
    ok(r.dropped === 1 && sk.constraints.some((k) => k.type === 'horizontal' && k.refs[0] === h.id) && !sk.constraints.some((k) => k.type === 'distance'), 'its length dimension is dropped (1 reported), horizontal kept');
    ok(sk.constraints.some((k) => k.type === 'coincident' && k.refs[0] === hl.p2 && k.refs[1] === v.id), 'the new end is put on the vertical line');
    ok(solved(sk).ok, 'the sketch still solves');
    // the middle of a line crossed twice: split
    const sk2 = S.newSketch();
    const h2 = S.addLine(sk2, [0, 0], [100, 0]);
    S.addConstraint(sk2, 'horizontal', [h2.id]);
    S.addLine(sk2, [20, -30], [20, 30]); S.addLine(sk2, [60, -30], [60, 30]);
    const r2 = T.trim(sk2, h2.id, [40, 0]);
    const lines = sk2.entities.filter((e) => e.type === 'line');
    const newer = S.byId(sk2, r2.made[1]);
    ok(lines.length === 4 && near(S.pointXY(sk2, S.byId(sk2, h2.id).p2)[0], 20, 1e-12) && near(S.pointXY(sk2, newer.p1)[0], 60, 1e-12) && newer.p2 === h2.p2, 'trim between two crossings splits the line: 0–20 and 60–100 (the far end keeps its point)');
    ok(sk2.constraints.filter((k) => k.type === 'coincident' && k.refs[1] === h2.id).length === 2, 'the far piece is kept on the same line (both its ends on it)');
    const sv = solved(sk2);
    ok(sv.ok && sv.conflicts.length === 0 && sv.redundant.length === 0, 'and the sketch solves, nothing redundant');
    // nothing crossing: the whole curve goes
    const lone = S.addLine(sk, [0, 80], [10, 80]);
    ok(T.trim(sk, lone.id, [5, 80]).removed === 'curve' && !S.byId(sk, lone.id), 'a line that crosses nothing is removed whole');
  }
  {
    // a circle cut by a line through its centre becomes a half circle; its diameter dimension follows
    const sk = S.newSketch();
    const c = S.addCircle(sk, [0, 0], 20);
    S.addConstraint(sk, 'diameter', [c.id], 40);
    S.addLine(sk, [-50, 0], [50, 0]);
    const r = T.trim(sk, c.id, [0, -20]);
    const arc = S.byId(sk, r.made[0]);
    const g = S.arcAngles(sk, arc);
    ok(arc.type === 'arc' && near(g.r, 20, 1e-12) && near(g.sweep, PI, 1e-12) && near(Math.sin(g.a0), 0, 1e-12) && near(g.a0 + g.sweep / 2, PI / 2, 1e-12), 'trimming the lower half of a circle leaves the upper half circle, exact');
    ok(sk.constraints.some((k) => k.type === 'diameter' && k.refs[0] === arc.id), 'the diameter dimension moved to the arc');
    ok(solved(sk).ok, 'solves');
    // trim the end of the arc against a vertical line
    S.addLine(sk, [10, -5], [10, 40]);
    const r2 = T.trim(sk, arc.id, [18, 6]);
    const g2 = S.arcAngles(sk, S.byId(sk, r2.made[0]));
    ok(near(Math.cos(g2.a0) * 20, 10, 1e-12) && near(g2.a0 + g2.sweep, PI, 1e-12), 'trimming an arc end to x = 10: it starts at 60° now');
    // extend a line to a circle
    const sk2 = S.newSketch();
    const l = S.addLine(sk2, [0, 0], [10, 0]);
    S.addCircle(sk2, [0, 0], 30);
    T.extend(sk2, l.id, [9, 0]);
    ok(near(S.pointXY(sk2, S.byId(sk2, l.id).p2)[0], 30, 1e-12), 'extend: the line reaches the circle at x = 30');
    ok(sk2.constraints.some((k) => k.type === 'coincident' && k.refs[0] === S.byId(sk2, l.id).p2), '…and its end is put on the circle');
    ok(throws(() => T.extend(sk2, l.id, [29, 0]), /nothing/), 'extending again finds nothing to reach (it is there)');
    // extend an arc to a line
    const sk3 = S.newSketch();
    const a = S.addArc(sk3, [0, 0], [10, 0], [0, 10]);
    S.addLine(sk3, [-20, -5], [20, -5]);
    T.extend(sk3, a.id, [0, 10]);
    const ga = S.arcAngles(sk3, S.byId(sk3, a.id));
    ok(near(10 * Math.sin(ga.a0 + ga.sweep), -5, 1e-12) && near(Math.cos(ga.a0 + ga.sweep), -Math.sqrt(3) / 2, 1e-12), 'extend an arc round to y = −5 (210°)');
  }
  {
    // a fit spline tangent to a line, cut by a vertical line: exact control-point pieces
    const sk = S.newSketch();
    const l = S.addLine(sk, [-30, 0], [0, 0]);
    const sp = S.addSpline(sk, [l.p2, [20, 15], [40, -10], [60, 5]]);
    S.addConstraint(sk, 'tangent', [l.id, sp.id]);
    solveSketch(sk);
    const before = S.splineCurve(sk, S.byId(sk, sp.id));
    const cut = S.addLine(sk, [30, -40], [30, 40]);
    const xs = I.intersect(I.curveOf(sk, S.byId(sk, sp.id)), I.curveOf(sk, S.byId(sk, cut.id)));
    const r = T.trim(sk, sp.id, [50, SP.pointAt(before, SP.closestParam(before, [50, 0]))[1]]);
    const piece = S.byId(sk, r.made[0]);
    const pc = S.splineCurve(sk, piece);
    const u1 = xs[0].ta;
    ok(r.made.length === 1 && piece.kind === 'control' && Array.isArray(piece.knots), 'trimming the spline\'s far end leaves one control-point spline with its own knots');
    ok(maxOver(300, (s) => dist(SP.pointAt(pc, SP.domain(pc)[0] + (SP.domain(pc)[1] - SP.domain(pc)[0]) * s), SP.pointAt(before, u1 * s))) < 1e-9, 'it is exactly the kept part of the old curve (300 points, 1e-9)');
    ok(near(S.pointXY(sk, piece.pts[piece.pts.length - 1])[0], 30, 1e-9) && piece.pts[0] === l.p2, 'it ends on the cutting line and still starts on the line\'s end point');
    ok(sk.constraints.some((k) => k.type === 'tangent' && k.refs.includes(piece.id)), 'the tangent relation at the kept end moved to the piece');
    const sv = solveSketch(sk);
    const ld = (() => { const e = S.byId(sk, l.id), a = S.pointXY(sk, e.p1), b = S.pointXY(sk, e.p2); return [(b[0] - a[0]) / dist(a, b), (b[1] - a[1]) / dist(a, b)]; })();
    const tp = S.splineEndTangent(sk, piece, 's');
    ok(sv.ok && Math.abs(ld[0] * tp[1] - ld[1] * tp[0]) < 1e-6, 'it solves and stays tangent to the line');
    // closed spline crossed twice
    const sk2 = S.newSketch();
    const cs = S.addSpline(sk2, [[0, 0], [30, -6], [52, 14], [31, 40], [-6, 26]], { closed: true });
    S.addLine(sk2, [20, -20], [20, 60]);
    const orig = S.splineCurve(sk2, S.byId(sk2, cs.id));
    const r2 = T.trim(sk2, cs.id, [45, 14]);
    const op = S.byId(sk2, r2.made[0]);
    const oc2 = S.splineCurve(sk2, op);
    const ends = [S.pointXY(sk2, op.pts[0]), S.pointXY(sk2, op.pts[op.pts.length - 1])];
    ok(!op.closed && ends.every((q) => near(q[0], 20, 1e-9)) && maxOver(100, (s) => { const p = SP.pointAt(oc2, SP.domain(oc2)[0] + (SP.domain(oc2)[1] - SP.domain(oc2)[0]) * s); return dist(SP.pointAt(orig, SP.closestParam(orig, p)), p); }) < 1e-9 && maxOver(20, (s) => SP.pointAt(oc2, SP.domain(oc2)[1] * s)[0]) <= 20 + 1e-9, 'a closed spline cut twice by x = 20: the right part goes, the rest is an open spline on the old curve');
  }

  // =====================================================================================
  section('offset');
  {
    const sk = S.newSketch();
    const rc = S.addRect(sk, [0, 0], [100, 50]);
    const ch = T.chainOf(sk, rc.lines[0]);
    ok(ch.closed && ch.items.length === 4, 'the chain through a rectangle side is the closed loop of 4');
    const side = T.offsetSide(sk, ch, [50, -10]);
    ok(side.side === -1 && near(side.d, 10, 1e-12), 'a point below the bottom side is on its right (outside), 10 away');
    const r = T.offset(sk, ch, 5 * side.side);
    const lines = r.made.map((id) => S.byId(sk, id));
    const P2 = (id) => S.pointXY(sk, id);
    const xs = lines.flatMap((l) => [P2(l.p1), P2(l.p2)]);
    ok(r.parametric && xs.every((q) => (near(q[0], -5, 1e-12) || near(q[0], 105, 1e-12)) && (near(q[1], -5, 1e-12) || near(q[1], 55, 1e-12))), 'offset 5 outside: corners exactly at (−5, −5), (105, −5), (105, 55), (−5, 55)');
    let sv = solveSketch(sk);
    ok(sv.ok && !sv.conflicts.length && !sv.redundant.length, 'one Offset dimension + 3 links; it solves with no conflicts or redundant relations');
    const master = sk.constraints.find((k) => k.type === 'offset');
    master.value = 8;
    sv = solveSketch(sk);
    const off = (l, o) => { const a = P2(o.p1), b = P2(o.p2), q = P2(l.p1); return Math.abs((b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0])) / dist(a, b); };
    ok(sv.ok && lines.every((l, i) => near(off(l, S.byId(sk, rc.lines[i])), 8, 1e-9)), 'Offset 5 → 8: every side moves to exactly 8 away (it stays parametric)');
    // a slot: arcs get r ± d
    const sk2 = S.newSketch();
    const sl = T.addSlot(sk2, [0, 0], [40, 0], 20);
    sv = solveSketch(sk2);
    ok(sv.ok && sv.dof === 5, `slot: two tangent lines, two equal half circles, DOF ${sv.dof} (centres + width)`);
    const ch2 = T.chainOf(sk2, sl.arcs[0]);
    ok(ch2.closed && ch2.items.length === 4, 'its chain is the closed loop of 4');
    const r2 = T.offset(sk2, ch2, 3 * T.offsetSide(sk2, ch2, [20, 30]).side);
    const arcs = r2.made.map((id) => S.byId(sk2, id)).filter((e) => e.type === 'arc');
    ok(arcs.length === 2 && arcs.every((a) => near(S.radiusOf(sk2, a), 13, 1e-12)), 'offset 3 outside: both arcs r 13 exactly');
    sv = solveSketch(sk2);
    ok(sv.ok && !sv.conflicts.length, 'solves');
    // a circle, both sides
    const sk3 = S.newSketch();
    const cc = S.addCircle(sk3, [5, 5], 10);
    const chc = T.chainOf(sk3, cc.id);
    const ra = T.offset(sk3, chc, 4), rb = T.offset(sk3, chc, -4, { link: ra.master });
    ok(near(S.byId(sk3, ra.made[0]).r, 6, 1e-12) && near(S.byId(sk3, rb.made[0]).r, 14, 1e-12), 'a circle r 10 offset both sides by 4: r 6 and r 14');
    sk3.constraints.find((k) => k.type === 'offset').value = 2;
    solveSketch(sk3);
    ok(near(S.byId(sk3, ra.made[0]).r, 8, 1e-9) && near(S.byId(sk3, rb.made[0]).r, 12, 1e-9), 'both follow the one Offset dimension (4 → 2: r 8 and 12)');
    ok(throws(() => T.offset(sk3, chc, 10), /bigger than the circle/), 'an offset bigger than the radius is refused');
    ok(throws(() => T.offset(sk, T.chainOf(sk, rc.lines[0]), 30), /inside out/), 'an inside offset bigger than half the rectangle is refused (a side would turn inside out)');
    // a spline in a chain: one-shot, within the tolerance
    const sk4 = S.newSketch();
    const sp = S.addSpline(sk4, [[0, 0], [20, 10], [40, -5], [60, 5]]);
    const r4 = T.offset(sk4, T.chainOf(sk4, sp.id), 2);
    ok(!r4.parametric && r4.err <= T.OFFSET_TOL && !sk4.constraints.some((k) => k.type === 'offset'), `a spline offset is a one-shot fit spline within ${T.OFFSET_TOL} mm (${r4.err.toExponential(1)}), no Offset dimension`);
  }

  // =====================================================================================
  section('mirror, polygon, patterns');
  {
    const sk = S.newSketch();
    const ax = S.addLine(sk, [0, -50], [0, 50], { construction: true });
    S.addConstraint(sk, 'vertical', [ax.id]); S.addConstraint(sk, 'coincident', [ax.p1, 'O']);
    const l = S.addLine(sk, [0, 20], [30, 40]);
    const a = S.addArc(sk, [30, 0], [40, 0], [30, 10]);
    const c = S.addCircle(sk, [15, -20], 6);
    const sp = S.addSpline(sk, [[5, -30], [20, -40], [35, -25]]);
    const r = T.mirror(sk, [l.id, a.id, c.id, sp.id], ax.id);
    const map = (id) => S.byId(sk, r.made[r.made.length - 4 + [l.id, a.id, c.id, sp.id].indexOf(id)]);
    const ml = map(l.id), ma = map(a.id), mc = map(c.id), ms = map(sp.id);
    const P2 = (id) => S.pointXY(sk, id);
    ok(ml.p1 === S.byId(sk, l.id).p1 && near(P2(ml.p2)[0], -30, 1e-12) && near(P2(ml.p2)[1], 40, 1e-12), 'the line\'s end on the axis is shared; the other end mirrors to (−30, 40)');
    const ga = S.arcAngles(sk, ma);
    ok(near(ga.c[0], -30, 1e-12) && near(ga.sweep, PI / 2, 1e-12) && near(ga.a0, PI / 2, 1e-12), 'the arc mirrors (centre −30, 0; runs from 90° to 180°)');
    ok(near(P2(mc.c)[0], -15, 1e-12) && mc.r === 6 && sk.constraints.some((k) => k.type === 'equal' && k.refs.includes(mc.id)), 'the circle mirrors with an equal relation');
    const so = S.splineCurve(sk, S.byId(sk, sp.id)), sm = S.splineCurve(sk, ms);
    ok(maxOver(200, (s) => { const p = SP.pointAt(so, SP.domain(so)[1] * s), q = SP.pointAt(sm, SP.domain(sm)[1] * s); return dist([-p[0], p[1]], q); }) < 1e-12, 'the fit spline mirrors exactly (its curve, not just its points)');
    ok(sk.constraints.filter((k) => k.type === 'symmetric').length === r.relations - 2, 'every mirrored point has a symmetric relation');
    // move the original: the mirror follows
    S.addConstraint(sk, 'hdistance', ['O', S.byId(sk, l.id).p2], 45);
    let sv = solveSketch(sk);
    ok(sv.ok && near(P2(ml.p2)[0], -45, 1e-9), 'dimension the original end to x 45: its mirror goes to −45');
    // polygon
    const sk2 = S.newSketch();
    const pg = T.addPolygon(sk2, [0, 0], [10, 0], 6);
    sv = solveSketch(sk2);
    const lens = pg.lines.map((id) => { const e = S.byId(sk2, id); return dist(S.pointXY(sk2, e.p1), S.pointXY(sk2, e.p2)); });
    ok(sv.ok && sv.dof === 4 && lens.every((v) => near(v, 10, 1e-12)), `hexagon r 10: six sides of 10, DOF ${sv.dof} (centre, size, turn)`);
    // patterns
    const sk3 = S.newSketch();
    const cc = S.addCircle(sk3, [10, 0], 2);
    S.addConstraint(sk3, 'radius', [cc.id], 2);
    T.patternLinear(sk3, [cc.id], [15, 5], 4);
    const circles = sk3.entities.filter((e) => e.type === 'circle');
    ok(circles.length === 4 && near(S.pointXY(sk3, circles[3].c)[0], 55, 1e-12) && sk3.constraints.filter((k) => k.type === 'radius').length === 4, 'linear pattern ×4 at (15, 5): last at x 55, each with its radius dimension');
    T.patternCircular(sk3, [cc.id], [0, 0], 6);
    const ring = sk3.entities.filter((e) => e.type === 'circle').slice(4).map((e) => S.pointXY(sk3, e.c));
    ok(ring.length === 5 && ring.every((q) => near(Math.hypot(q[0], q[1]), 10, 1e-12)) && near(Math.atan2(ring[0][1], ring[0][0]), PI / 3, 1e-12), 'circular pattern ×6 about the origin: 60° apart on r 10');
  }

  // =====================================================================================
  section('splines in the exact kernel, the mesh kernel and DXF');
  {
    const sk = S.newSketch();
    const sp = S.addSpline(sk, [[0, 0], [40, -5], [60, 20], [30, 45], [-10, 30]], { closed: true });
    const part = P.newPart();
    const s1 = P.addFeature(part, 'sketch', { sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 12 });
    const r = B.regenerateBrep(part, oc);
    const A = SP.areaTerm(S.splineCurve(sk, S.byId(sk, sp.id)));
    ok([...r.results.values()].every((x) => x.status === 'ok') && Math.abs(r.stats.volume - 12 * A) / (12 * A) < 1e-9, `closed fit spline extruded 12 (exact kernel): volume ${r.stats.volume.toFixed(6)} = exact area × 12 = ${(12 * A).toFixed(6)} to 1e-9`);
    ok(r.faces.length === 3 && r.faces.filter((f) => f.type === 'plane').length === 2 && r.faces.some((f) => f.name === `${part.features[1].id}.side:${sp.id}`), 'three faces: two planes and the swept spline wall named by the spline');
    ok(r.edges.some((e) => e.type === 'curve'), 'its edges include the true B-spline curve (not facets)');
    // spline + line loop, with a hole
    const sk2 = S.newSketch();
    const l = S.addLine(sk2, [0, 0], [50, 0]);
    const s2 = S.addSpline(sk2, [l.p2, [45, 20], [20, 30], [0, 15], l.p1]);
    S.addCircle(sk2, [22, 12], 4);
    const part2 = P.newPart();
    const f1 = P.addFeature(part2, 'sketch', { sketch: sk2 });
    P.addFeature(part2, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 10 });
    const r2 = B.regenerateBrep(part2, oc);
    const A2 = Math.abs(SP.areaTerm(S.splineCurve(sk2, S.byId(sk2, s2.id)))) - PI * 16;
    ok([...r2.results.values()].every((x) => x.status === 'ok') && Math.abs(r2.stats.volume - 10 * A2) / (10 * A2) < 1e-9, `a spline + line loop with a ⌀8 hole: volume = (spline area − 16π) × 10 to 1e-9 (${r2.stats.volume.toFixed(6)})`);
    // revolve a spline profile about a centerline: Pappus-free check via OCCT GK against the exact area×centroid
    const sk3 = S.newSketch();
    const axl = S.addLine(sk3, [0, -10], [0, 60], { construction: true });
    void axl;
    const b1 = S.addLine(sk3, [0, 0], [20, 0]);
    const b2 = S.addSpline(sk3, [b1.p2, [30, 20], [15, 40]], { kind: 'control' });
    const b3 = S.addLine(sk3, [15, 40], [0, 40]);
    S.addConstraint(sk3, 'coincident', [S.byId(sk3, b2.id).pts[2], b3.p1]);
    S.addLine(sk3, b3.p2, b1.p1);
    const part3 = P.newPart();
    const f3 = P.addFeature(part3, 'sketch', { sketch: sk3 });
    P.addFeature(part3, 'revolve', { sketch: f3.id, op: 'add', angle: 360 });
    const r3 = B.regenerateBrep(part3, oc);
    // V = 2π ∮ … : by Green, V = π ∫ x² dy over the closed profile (x = radius): lines x² dy (top/bottom horizontal: 0; axis x=0: 0)
    const bc = S.splineCurve(sk3, S.byId(sk3, b2.id));
    let vInt = 0;
    for (const [u0, u1] of SP.spans(bc)) { const h = (u1 - u0) / 2, m = (u0 + u1) / 2; for (const [g, w] of [[-0.9061798459386640, 0.2369268850561891], [-0.5384693101056831, 0.4786286704993665], [0, 0.5688888888888889], [0.5384693101056831, 0.4786286704993665], [0.9061798459386640, 0.2369268850561891]]) { const [p, d] = SP.derivsAt(bc, m + h * g, 1); vInt += w * h * p[0] * p[0] * d[1]; } }
    const Vrev = PI * vInt;   // x² y′ of a cubic is degree 8: 5-point Gauss is exact
    ok([...r3.results.values()].every((x) => x.status === 'ok') && Math.abs(r3.stats.volume - Vrev) / Vrev < 1e-9, `a control-spline profile revolved 360°: volume = π∫x²dy (exact, 5-point Gauss) = ${Vrev.toFixed(6)} to 1e-9`);
    // mesh kernel: faceted, within 0.5 %
    const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
    const M = await Module(); M.setup();
    const K = await import(DEV + 'kernel.js');
    const rm = K.regenerate(part, M);
    ok(rm.stats && Math.abs(rm.stats.volume - 12 * A) / (12 * A) < 5e-3, `the mesh kernel extrudes the faceted spline within 0.5 % (${rm.stats.volume.toFixed(2)})`);
    // DXF: R12 has no spline entity — a polyline within 0.01 mm
    const d = X.dxfSketch(sk2);
    ok(d.counts.spline === 1 && /POLYLINE/.test(d.text), 'DXF: the spline goes out as one R12 polyline');
    const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
    if (fs.existsSync(PY)) {
      const f = path.join(REPO, 'tmp/partcraft-test/spline.dxf');
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, d.text);
      const out = JSON.parse(execFileSync(PY, ['-c', 'import sys, json, ezdxf\nd = ezdxf.readfile(sys.argv[1])\nprint(json.dumps([[list(v.dxf.location)[:2] for v in e.vertices] for e in d.modelspace().query("POLYLINE")]))', f], { encoding: 'utf8' }));
      const bs = S.splineCurve(sk2, S.byId(sk2, s2.id));
      const pts = out[0] || [];
      let worst = 0;
      for (let i = 0; i + 1 < pts.length; i++) for (const t of [0.25, 0.5, 0.75]) { const m = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; worst = Math.max(worst, dist(SP.pointAt(bs, SP.closestParam(bs, m)), m)); }
      ok(pts.length > 10 && dist(pts[0], [50, 0]) < 1e-6 && worst <= 0.01 + 1e-6, `ezdxf reads it back: ${pts.length} vertices from (50, 0), every chord within 0.01 mm of the curve (${worst.toFixed(5)})`);
      fs.rmSync(f, { force: true });
    } else skip('ezdxf not installed (tools/partcraft-test/venv)');
  }

  // =====================================================================================
  section('project model edges (exact kernel edge records)');
  {
    // a 60 × 40 block 20 deep on the front plane with a ⌀16 hole at (20, 15), and a boss revolved about the y axis
    const sk = S.newSketch();
    S.addRect(sk, [0, 0], [60, 40]);
    S.addCircle(sk, [20, 15], 8);
    const part = P.newPart();
    const s1 = P.addFeature(part, 'sketch', { sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 20 });
    const r = B.regenerateBrep(part, oc);
    const front = { o: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], n: [0, 0, 1] };
    const lineE = r.edges.find((e) => e.type === 'line' && Math.abs(e.a[2] - 20) < 1e-9 && Math.abs(e.b[2] - 20) < 1e-9 && Math.abs(e.a[1] - e.b[1]) < 1e-9);
    const circE = r.edges.find((e) => e.type === 'circle' && e.circ && Math.abs(e.circ.c[2] - 20) < 1e-9);
    ok(lineE && circE && near(circE.circ.r, 8, 1e-12) && near(Math.abs(circE.circ.n[2]), 1, 1e-12), 'the exact kernel\'s edge records carry a circle\'s centre, axis and radius (r 8)');
    const t = S.newSketch();
    const a = T.projectEdge(t, front, lineE);
    const l = S.byId(t, a.made[0]);
    const la = S.pointXY(t, l.p1), lb = S.pointXY(t, l.p2);
    ok(a.kind === 'line' && near(Math.abs(la[0] - lb[0]), 60, 1e-12) && near(la[1], lineE.a[1], 1e-12) && t.constraints.some((k) => k.type === 'fix' && k.refs[0] === l.id), 'a 60 mm edge of the block projects onto the front plane exactly, fixed');
    const b = T.projectEdge(t, front, circE);
    const pe = S.byId(t, b.made[0]);
    const pc0 = S.pointXY(t, pe.c);
    const full = b.kind === 'circle' ? pe.r : S.radiusOf(t, pe);
    ok((b.kind === 'circle' || b.kind === 'arc') && near(full, 8, 1e-12) && near(pc0[0], 20, 1e-12) && near(pc0[1], 15, 1e-12), `the hole's edge projects as a${b.kind === 'arc' ? 'n arc' : ' circle'} centred (20, 15) r 8 exactly`);
    const sv = solveSketch(t);
    ok(sv.ok && sv.dof === 0, 'projected geometry is fully defined (fixed)');
    const top = { o: [0, 0, 0], x: [1, 0, 0], y: [0, 0, -1], n: [0, 1, 0] };
    ok(throws(() => T.projectEdge(S.newSketch(), top, circE), /ellipse/), 'a circle tilted to the sketch plane is refused (it would be an ellipse)');
    const vert = r.edges.find((e) => e.type === 'line' && Math.abs(e.a[0] - e.b[0]) < 1e-9 && Math.abs(e.a[1] - e.b[1]) < 1e-9);
    ok(throws(() => T.projectEdge(S.newSketch(), front, vert), /projects to a point/), 'an edge square to the sketch plane is refused (it projects to a point)');
    ok(throws(() => T.projectEdge(S.newSketch(), front, { type: 'curve', a: [0, 0, 0], b: [1, 1, 0] }), /free-form/), 'a free-form edge is refused');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runSketchToolTests({ ok, section, near, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
