/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * match.js — cc-nurbs (0.8 SU.747b, session `nurbs`): making curves and surfaces meet with G0, G1 or G2, and blends between
 * them. DOM-free. Every result carries the continuity it reached, measured by continuity.js on the exact geometry.
 *
 * Method (published geometry only): the end conditions of a clamped B-spline are fixed by its first control points — C(0) = P0,
 * C'(0) = a1 (P1 − P0) with a1 = p / (U[p+1] − U[1]), C''(0) = c2 (b1 (P2 − P1) − a1 (P1 − P0)) with b1 = p / (U[p+2] − U[2]),
 * c2 = (p − 1) / (U[p+1] − U[2]) (The NURBS Book eq. 3.7–3.9 for the derivative curves). G1 sets the direction of C', G2 the
 * normal part of C'' to κ |C'|² (do Carmo § 1.5 / § 3.2: κ_n = II(t) / I(t)), keeping each speed as it was. For a surface
 * the same holds row by row across the edge; the wanted rows are fitted with the surface's own knots along the edge (least
 * squares), and knots are added along the edge until the measured result is within tolerance (or the limit is reached).
 * Blends are Bézier cross-sections (degree 3 for G1, 5 for G2: two/three control points from each side) skinned along the edges.
 *
 *   matchCurve(c, end, target, targetEnd, { continuity = 'G2' }) → { curve, report } (moves only the first 1–3 control points at
 *     that end; knots are inserted first when the curve is too short to keep its other end where it is)
 *   blendCurve(a, endA, b, endB, { continuity = 'G2', bulge = [1, 1] }) → { curve, report }
 *   matchSurface(s, edge, target, targetEdge, { continuity = 'G1', tol, maxRefine = 6, samples = 33 }) → { surface, report }
 *   blendSurface(sA, edgeA, sB, edgeB, { continuity = 'G1', bulge = [1, 1], tol, maxSections = 129 }) → { surface, report }
 */
import * as B from './basis.js';
import * as C from './curve.js';
import * as F from './fit.js';
import * as S from './surface.js';
import * as K from './construct.js';
import * as G from './continuity.js';
import * as V from './vec.js';

const { fail } = C;
const LEVEL = { G0: 0, G1: 1, G2: 2 };
const level = (c) => { if (!(c in LEVEL)) fail('nurbs.err.continuity'); return LEVEL[c]; };

// ------------------------------------------------------------------------------------------------ curve ends

/** Position, unit direction of travel (`out`: away from the curve past its end) and curvature vector at an end. */
function endFrame(c, end) {
  const [a, b] = C.domain(c), u = end === 'start' ? a : b, d = C.derivs(c, u, 1);
  const t = V.norm(d[1]);
  return { p: d[0], out: end === 'end' ? t : V.mul(t, -1), kv: C.curvatureVector(c, u), speed: V.len(d[1]) };
}

const startCoefs = (U, p) => ({
  a1: p / (U[p + 1] - U[1]),
  b1: p / (U[p + 2] - U[2]),
  c2: p > 1 ? (p - 1) / (U[p + 1] - U[2]) : 0,
});

export function matchCurve(c, end, target, targetEnd, { continuity = 'G2' } = {}) {
  const k = level(continuity);
  let w = end === 'start' ? C.reparam(c, 0, 1) : C.reverse(C.reparam(c, 0, 1));
  let note = null;
  if (w.w) { const q = K.polynomial(w, 1e-7); w = q.curve; note = { refit: q.deviation }; }
  if (w.deg < k) w = C.elevate(w, k - w.deg);
  // enough control points that the other end keeps its own (k + 1 at each end, none shared)
  while (w.cvs.length < 2 * (k + 1)) {
    const ks = B.distinctKnots(w.knots), widest = ks.slice(1).reduce((m, x, i) => (x.u - ks[i].u > m.w ? { w: x.u - ks[i].u, u: (x.u + ks[i].u) / 2 } : m), { w: 0, u: 0.5 });
    w = C.insertKnot(w, widest.u);
  }
  const T = endFrame(target, targetEnd);
  // the joined path runs from the target into this curve: at our start the direction must be T.out
  const P = w.cvs.map((q) => q.slice()), U = w.knots, p = w.deg, { a1, b1, c2 } = startCoefs(U, p);
  const d0 = C.derivs(w, 0, 2);
  P[0] = T.p.slice();
  if (k >= 1) {
    const speed = V.len(d0[1]) || 1;
    P[1] = V.add(P[0], V.mul(T.out, speed / a1));
    if (k >= 2 && p >= 2) {
      const d1 = V.mul(T.out, speed);
      const tang = V.mul(T.out, V.dot(d0[2], T.out));
      const D2 = V.add(tang, V.mul(T.kv, speed * speed));
      const Q0 = V.mul(V.sub(P[1], P[0]), a1), Q1 = V.add(Q0, V.mul(D2, 1 / c2));
      P[2] = V.add(P[1], V.mul(Q1, 1 / b1));
      void d1;
    }
  }
  let out = { deg: p, knots: U.slice(), cvs: P, w: null };
  if (end === 'end') out = C.reverse(out);
  const rep = G.curveJoin(target, targetEnd, out, end, G.TOL);
  return { curve: out, report: { ...rep, want: continuity, ...(note || {}) } };
}

export function blendCurve(a, endA, b, endB, { continuity = 'G2', bulge = [1, 1] } = {}) {
  const k = level(continuity);
  const A = endFrame(a, endA), Bf = endFrame(b, endB);
  const chord = V.dist(A.p, Bf.p);
  if (chord < 1e-12) fail('nurbs.err.blend_ends');
  const al = chord * bulge[0], be = chord * bulge[1];
  const arrive = V.mul(Bf.out, -1);   // the blend arrives at b running into it
  let cvs;
  if (k === 0) cvs = [A.p, Bf.p];
  else if (k === 1) cvs = [A.p, V.add(A.p, V.mul(A.out, al / 3)), V.sub(Bf.p, V.mul(arrive, be / 3)), Bf.p];
  else {
    const P1 = V.add(A.p, V.mul(A.out, al / 5)), P2 = V.add(V.sub(V.mul(P1, 2), A.p), V.mul(A.kv, al * al / 20));
    const P4 = V.sub(Bf.p, V.mul(arrive, be / 5)), P3 = V.add(V.sub(V.mul(P4, 2), Bf.p), V.mul(Bf.kv, be * be / 20));
    cvs = [A.p, P1, P2, P3, P4, Bf.p];
  }
  const deg = cvs.length - 1;
  const curve = { deg, knots: [...new Array(deg + 1).fill(0), ...new Array(deg + 1).fill(1)], cvs: cvs.map((q) => q.slice()), w: null };
  return { curve, report: { start: G.curveJoin(a, endA, curve, 'start'), end: G.curveJoin(curve, 'end', b, endB), want: continuity } };
}

// ------------------------------------------------------------------------------------------------ surfaces

/** Turn s so `edge` becomes u0 (and back). */
function toU0(s, edge) {
  let w = s;
  if (edge[0] === 'v') w = S.swap(w);
  if (edge[1] === '1') w = S.reverse(w, 'u');
  return S.reparam(w);
}
function fromU0(w, edge, s) {
  let o = w;
  if (edge[1] === '1') o = S.reverse(o, 'u');
  if (edge[0] === 'v') o = S.swap(o);
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  return S.reparam(o, [ua, ub], [va, vb]);
}

/** At target's edge, for a point near it: the point on the edge, the direction away from the target (in its tangent plane,
 *  across the edge), the target normal and its normal curvature in that direction. */
function targetFrame(target, tEdge, tCurve, p) {
  const cp = C.closestParam(tCurve, p), uv = S.edgeUV(target, tEdge, cp.u);
  const n = S.normal(target, ...uv), te = C.derivs(tCurve, cp.u, 1)[1];
  let d = V.norm(V.cross(n, V.len(te) > 1e-300 ? te : V.perp(n)));
  // pointing away from the target: against the inward cross derivative
  const e = S.edgeParams(target, tEdge), D = S.derivs(target, ...uv, 1);
  const inward = V.mul(e.dir === 'u' ? D[1][0] : D[0][1], e.inward);
  if (V.dot(d, inward) > 0) d = V.mul(d, -1);
  return { p: cp.point, d, n, k: S.normalCurvature(target, ...uv, d), u: cp.u };
}

function rowCurve(w, i) { return { deg: w.degV, knots: w.knotsV, cvs: w.cvs[i], w: null }; }

export function matchSurface(s, edge, target, targetEdge, { continuity = 'G1', tol = G.TOL, maxRefine = 6, samples = 33 } = {}) {
  const k = level(continuity);
  let w = toU0(s, edge), refit = 0;
  if (w.w) {
    const r = F.fitSurfaceTo((u, v) => S.point(w, u, v), Math.max(3, w.degU), Math.max(3, w.degV), tol.g0 / 10, { start: [w.cvs.length, w.cvs[0].length] });
    w = r.surface; refit = r.deviation;
  }
  if (w.degU < Math.max(k, 1)) w = S.elevate(w, 'u', Math.max(k, 1) - w.degU);
  // rows near the edge free to move without touching the far edge: k + 1 rows here, k + 1 there, none shared
  while (w.cvs.length < 2 * (k + 1) + 1) {
    const ks = B.distinctKnots(w.knotsU);
    w = S.insertKnot(w, 'u', (ks[0].u + ks[1].u) / 2);
  }
  // the target's edge curve in our v space (degree and knots), so G0 can be exact when the edges are the same curve
  const tc = S.edgeCurve(target, targetEdge);
  const tcPoly = tc.w ? null : C.reparam(tc, 0, 1);
  const ourEdge = S.edgeCurve(w, 'u0');
  const forward = V.dist(C.endsOf(ourEdge).start, C.endsOf(tc).start) + V.dist(C.endsOf(ourEdge).end, C.endsOf(tc).end)
    <= V.dist(C.endsOf(ourEdge).start, C.endsOf(tc).end) + V.dist(C.endsOf(ourEdge).end, C.endsOf(tc).start);
  if (tcPoly) {
    const tk = forward ? tcPoly : C.reverse(tcPoly);
    if (w.degV < tk.deg) w = S.elevate(w, 'v', tk.deg - w.degV);
    const tk2 = tk.deg < w.degV ? C.elevate(tk, w.degV - tk.deg) : tk;
    for (const x of B.distinctKnots(tk2.knots)) if (x.u > 0 && x.u < 1) { const have = B.multiplicity(w.knotsV, x.u, 1e-12); if (x.m > have) w = S.insertKnot(w, 'v', x.u, x.m - have); }
  }
  while (w.cvs[0].length < 8) {
    const ks = B.distinctKnots(w.knotsV), widest = ks.slice(1).reduce((m, x, i) => (x.u - ks[i].u > m.w ? { w: x.u - ks[i].u, u: (x.u + ks[i].u) / 2 } : m), { w: 0, u: 0.5 });
    w = S.insertKnot(w, 'v', widest.u);
  }
  let best = null;
  for (let round = 0; round <= maxRefine; round++) {
    const U = w.knotsU, p = w.degU, { a1, b1, c2 } = startCoefs(U, p);
    const M = Math.max(samples, w.cvs[0].length * 4);
    const tv = Array.from({ length: M + 1 }, (_, i) => i / M);
    const tparam = (v) => (forward ? v : 1 - v);
    const r0 = [], r1 = [], r2 = [];
    tv.forEach((v) => {
      const D = S.derivs(w, 0, v, 2);
      const fr = targetFrame(target, targetEdge, tc, tcPoly ? C.point(tcPoly, tparam(v)) : C.point(tc, C.domain(tc)[0] + (C.domain(tc)[1] - C.domain(tc)[0]) * tparam(v)));
      r0.push(fr.p);
      if (k >= 1) {
        const speed = V.len(D[1][0]) || 1;
        const D1 = V.mul(fr.d, speed);
        r1.push(V.add(fr.p, V.mul(D1, 1 / a1)));
        if (k >= 2) {
          const tang = V.sub(D[2][0], V.mul(fr.n, V.dot(D[2][0], fr.n)));
          const D2 = V.add(tang, V.mul(fr.n, fr.k * speed * speed));
          const Q0 = D1, Q1 = V.add(Q0, V.mul(D2, 1 / c2));
          r2.push(V.add(V.add(fr.p, V.mul(D1, 1 / a1)), V.mul(Q1, 1 / b1)));
        }
      }
    });
    const fitRow = (Q) => F.fitFixedKnots(Q, tv, w.degV, w.knotsV).cvs;
    const cvs = w.cvs.map((r) => r.map((q) => q.slice()));
    cvs[0] = fitRow(r0);
    if (k >= 1) cvs[1] = fitRow(r1);
    if (k >= 2) cvs[2] = fitRow(r2);
    const cand = { ...w, cvs, w: null };
    const back = fromU0(cand, edge, s);
    const m = G.surfaceEdge(back, edge, target, targetEdge, { samples, tol });
    const good = [m.gap <= tol.g0, m.angle <= tol.g1, m.dk.max <= tol.g2 || m.rel <= tol.g2rel].slice(0, k + 1).every(Boolean);
    best = { surface: back, report: { want: continuity, measured: m.cls, gap: m.gap, angle: m.angle, dk: m.dk.max, rel: m.rel, refinements: round, cvs: [cand.cvs.length, cand.cvs[0].length], refit, tol } };
    if (good) return best;
    // refine along the edge where it is worst: halve every span
    const ks = B.distinctKnots(w.knotsV);
    for (let i = 0; i + 1 < ks.length; i++) w = S.insertKnot(w, 'v', (ks[i].u + ks[i + 1].u) / 2);
    void rowCurve;
  }
  return best;
}

export function blendSurface(sA, edgeA, sB, edgeB, { continuity = 'G1', bulge = [1, 1], tol = G.TOL, maxSections = 129 } = {}) {
  const k = level(continuity);
  const cA = S.edgeCurve(sA, edgeA), cB = S.edgeCurve(sB, edgeB);
  const [a0, a1] = C.domain(cA), [b0, b1] = C.domain(cB);
  const eA = C.endsOf(cA), eB = C.endsOf(cB);
  const forward = V.dist(eA.start, eB.start) + V.dist(eA.end, eB.end) <= V.dist(eA.start, eB.end) + V.dist(eA.end, eB.start);
  const section = (t) => {
    const pa = C.point(cA, a0 + (a1 - a0) * t), pb = C.point(cB, b0 + (b1 - b0) * (forward ? t : 1 - t));
    const fa = targetFrame(sA, edgeA, cA, pa), fb = targetFrame(sB, edgeB, cB, pb);
    const chord = V.dist(fa.p, fb.p);
    if (chord < 1e-12) fail('nurbs.err.blend_ends');
    const al = chord * bulge[0], be = chord * bulge[1];
    if (k === 0) return [fa.p, fb.p];
    if (k === 1) return [fa.p, V.add(fa.p, V.mul(fa.d, al / 3)), V.add(fb.p, V.mul(fb.d, be / 3)), fb.p];
    const P1 = V.add(fa.p, V.mul(fa.d, al / 5)), P2 = V.add(V.sub(V.mul(P1, 2), fa.p), V.mul(fa.n, fa.k * al * al / 20));
    const P4 = V.add(fb.p, V.mul(fb.d, be / 5)), P3 = V.add(V.sub(V.mul(P4, 2), fb.p), V.mul(fb.n, fb.k * be * be / 20));
    return [fa.p, P1, P2, P3, P4, fb.p];
  };
  const deg = k === 0 ? 1 : k === 1 ? 3 : 5;
  let n = 8, best = null;
  for (;;) {
    const ts = Array.from({ length: n + 1 }, (_, i) => i / n), secs = ts.map(section);
    // rows across: section point index i (u); along: the sections (v)
    const lists = secs[0].map((_, i) => secs.map((sc) => sc[i]));
    const r = F.interpolateMany(lists, ts, 3);
    const surface = { degU: deg, degV: r.deg, knotsU: [...new Array(deg + 1).fill(0), ...new Array(deg + 1).fill(1)], knotsV: r.knots, cvs: r.rows.map((row) => row.map((q) => q.slice())), w: null };
    const mA = G.surfaceEdge(surface, 'u0', sA, edgeA, { tol }), mB = G.surfaceEdge(surface, 'u1', sB, edgeB, { tol });
    const okk = (m) => [m.gap <= tol.g0, m.angle <= tol.g1, m.dk.max <= tol.g2 || m.rel <= tol.g2rel].slice(0, k + 1).every(Boolean);
    best = { surface, report: { want: continuity, sections: n + 1, a: { measured: mA.cls, gap: mA.gap, angle: mA.angle, dk: mA.dk.max }, b: { measured: mB.cls, gap: mB.gap, angle: mB.angle, dk: mB.dk.max }, tol } };
    if ((okk(mA) && okk(mB)) || n + 1 >= maxSections) return best;
    n = Math.min(maxSections - 1, n * 2);
  }
}
