/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * curve.js — cc-nurbs (0.8 SU.747b, session `nurbs`): 3-D NURBS curves. DOM-free.
 *
 * A curve is plain data: { deg, knots: [number], cvs: [[x, y, z]], w: [number] | null } — clamped knots (basis.js), w null for
 * a polynomial (non-rational) curve. Every operation returns a new curve; nothing is changed in place.
 *
 * From The NURBS Book (Piegl & Tiller, 2nd ed.), cited by algorithm number, no library code read:
 *   point (A4.1) · derivs (A3.2 on the homogeneous curve, then A4.2 for the rational quotient) · insertKnot (A5.1) ·
 *   removeKnot (A5.8, homogeneous tolerance as in § 5.4) · decompose to Bézier pieces (§ 5.3, by knot insertion) ·
 *   elevate (Bézier pieces raised with eq. 5.36, then the knots removed again: § 5.5's decompose–elevate–remove route) ·
 *   reduce (Bézier pieces reduced with eq. 5.41/5.42, blended, error bounded by re-elevation; § 5.6) ·
 *   arc/circle (A7.1) · closestParam (§ 6.1, Newton on (C − P)·C' = 0).
 *
 *   cleanCurve(x, { maxCvs, maxDeg }) → curve (untrusted data: every field checked) or throws NurbsError (code nurbs.err.*)
 *   domain(c) → [a, b] · isRational(c) · hcvs(c) → homogeneous [wx, wy, wz, w] · fromH(deg, knots, Pw)
 *   point(c, u) · derivs(c, u, d) → [C, C', …, C^(d)] · tangent(c, u) · curvature(c, u) · curvatureVector(c, u) · torsion(c, u)
 *   insertKnot(c, u, r = 1) · refine(c, [u…]) · removeKnot(c, u, num = 1, tol) → { curve, removed }
 *   decompose(c) → [Bézier curves] · elevate(c, t = 1, { removeKnots = true }) · reduce(c, tol) → { curve, error } | null
 *   split(c, u) → [left, right] · segment(c, a, b) · reverse(c) · reparam(c, a = 0, b = 1) · transform(c, m4)
 *   closestParam(c, p, { u0 }) → { u, point, d } · arcLength(c, a, b) · paramAtLength(c, s) · bbox(c) → { min, max }
 *   tessellate(c, { tol = 0.01, maxSegs = 4096 }) → { points, params } (chord deviation ≤ tol, checked at three points a segment)
 *   line(a, b) · polyline(pts) · arc(center, xAxis, yAxis, r, a0, a1) · circle(center, normal, r) · join(curves, tol) → curve
 *   endsOf(c) → { start, end } · sameCurve(a, b, tol, samples) → boolean (sampled distance)
 */
import { findSpan, basisFuns, dersBasisFuns, multiplicity, distinctKnots, knotProblem, binomial } from './basis.js';
import * as V from './vec.js';

export class NurbsError extends Error { constructor(code, vars = {}) { super(code); this.code = code; this.vars = vars; } }
export const fail = (code, vars) => { throw new NurbsError(code, vars); };

export const MAX_DEG = 15;
export const MAX_CVS = 100000;

// ------------------------------------------------------------------------------------------------ data

const finite3 = (p) => Array.isArray(p) && p.length >= 2 && p.length <= 3 && p.every((x) => typeof x === 'number' && Number.isFinite(x));

export function cleanCurve(x, { maxCvs = MAX_CVS, maxDeg = MAX_DEG } = {}) {
  if (!x || typeof x !== 'object') fail('nurbs.err.not_curve');
  const deg = x.deg;
  if (!Number.isInteger(deg) || deg < 1 || deg > maxDeg) fail('nurbs.err.degree', { max: maxDeg });
  if (!Array.isArray(x.cvs) || x.cvs.length < deg + 1) fail('nurbs.err.cv_count', { min: deg + 1 });
  if (x.cvs.length > maxCvs) fail('nurbs.err.too_many', { max: maxCvs });
  const cvs = x.cvs.map((p) => { if (!finite3(p)) fail('nurbs.err.cv_value'); return [p[0], p[1], p.length > 2 ? p[2] : 0]; });
  const kp = knotProblem(x.knots, deg, cvs.length);
  if (kp) fail(kp);
  let w = null;
  if (x.w != null) {
    if (!Array.isArray(x.w) || x.w.length !== cvs.length) fail('nurbs.err.weights');
    for (const v of x.w) if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) fail('nurbs.err.weights');
    w = x.w.every((v) => v === 1) ? null : x.w.slice();
  }
  return { deg, knots: x.knots.slice(), cvs, w };
}

export const domain = (c) => [c.knots[c.deg], c.knots[c.cvs.length]];
export const isRational = (c) => !!c.w;
export const hcvs = (c) => c.cvs.map((p, i) => { const w = c.w ? c.w[i] : 1; return [p[0] * w, p[1] * w, p[2] * w, w]; });

export function fromH(deg, knots, Pw) {
  const rational = Pw.some((q) => Math.abs(q[3] - 1) > 1e-14);
  return {
    deg, knots: knots.slice(),
    cvs: Pw.map((q) => [q[0] / q[3], q[1] / q[3], q[2] / q[3]]),
    w: rational ? Pw.map((q) => q[3]) : null,
  };
}

const clampU = (c, u) => { const [a, b] = domain(c); return u < a ? a : u > b ? b : u; };

// ------------------------------------------------------------------------------------------------ evaluation

export function point(c, u) {
  u = clampU(c, u);
  const n = c.cvs.length - 1, p = c.deg, k = findSpan(n, p, u, c.knots), N = basisFuns(k, u, p, c.knots);
  let x = 0, y = 0, z = 0, w = 0;
  for (let j = 0; j <= p; j++) {
    const i = k - p + j, q = c.cvs[i], wi = c.w ? c.w[i] : 1, f = N[j] * wi;
    x += f * q[0]; y += f * q[1]; z += f * q[2]; w += f;
  }
  return [x / w, y / w, z / w];
}

/** [C(u), C'(u), …, C^(d)(u)]; derivatives above the degree are zero for a polynomial curve. */
export function derivs(c, u, d = 2) {
  u = clampU(c, u);
  const n = c.cvs.length - 1, p = c.deg, k = findSpan(n, p, u, c.knots);
  const du = Math.min(d, p), nd = dersBasisFuns(k, u, p, du, c.knots);
  const A = [], W = [];
  for (let r = 0; r <= d; r++) {
    let x = 0, y = 0, z = 0, w = 0;
    if (r <= du) for (let j = 0; j <= p; j++) {
      const i = k - p + j, q = c.cvs[i], wi = c.w ? c.w[i] : 1, f = nd[r][j] * wi;
      x += f * q[0]; y += f * q[1]; z += f * q[2]; w += f;
    }
    A.push([x, y, z]); W.push(w);
  }
  const CK = [];
  for (let r = 0; r <= d; r++) {
    let v = A[r].slice();
    for (let i = 1; i <= r; i++) { const f = binomial(r, i) * W[i]; v = [v[0] - f * CK[r - i][0], v[1] - f * CK[r - i][1], v[2] - f * CK[r - i][2]]; }
    CK.push(V.mul(v, 1 / W[0]));
  }
  return CK;
}

export function tangent(c, u) { return V.norm(derivs(c, u, 1)[1]); }

export function curvature(c, u) {
  const [, d1, d2] = derivs(c, u, 2), l = V.len(d1);
  return l < 1e-300 ? 0 : V.len(V.cross(d1, d2)) / (l * l * l);
}

/** κN: the curvature vector (points to the centre of curvature, length = curvature). */
export function curvatureVector(c, u) {
  const [, d1, d2] = derivs(c, u, 2), l2 = V.dot(d1, d1);
  if (l2 < 1e-300) return [0, 0, 0];
  const t = V.mul(d1, 1 / Math.sqrt(l2));
  return V.mul(V.sub(d2, V.mul(t, V.dot(d2, t))), 1 / l2);
}

export function torsion(c, u) {
  const [, d1, d2, d3] = derivs(c, u, 3), x = V.cross(d1, d2), l = V.dot(x, x);
  return l < 1e-300 ? 0 : V.dot(x, d3) / l;
}

// ------------------------------------------------------------------------------------------------ knots

export function insertKnot(c, u, r = 1) {
  const p = c.deg, U = c.knots, n = c.cvs.length - 1;
  const [a, b] = domain(c);
  // inside the domain by more than rounding (a knot within 1e-12 of an end would be read as that end's knot)
  if (!(u > a + 1e-12 * (b - a) && u < b - 1e-12 * (b - a))) fail('nurbs.err.knot_outside');
  const s = multiplicity(U, u);
  if (r <= 0) return { deg: p, knots: U.slice(), cvs: c.cvs.map((q) => q.slice()), w: c.w ? c.w.slice() : null };
  if (r + s > p) fail('nurbs.err.knot_mult');
  const k = findSpan(n, p, u, U), Pw = hcvs(c), mp = n + p + 1, nq = n + r;
  const UQ = new Array(mp + r + 1), Qw = new Array(nq + 1);
  for (let i = 0; i <= k; i++) UQ[i] = U[i];
  for (let i = 1; i <= r; i++) UQ[k + i] = u;
  for (let i = k + 1; i <= mp; i++) UQ[i + r] = U[i];
  for (let i = 0; i <= k - p; i++) Qw[i] = Pw[i];
  for (let i = k - s; i <= n; i++) Qw[i + r] = Pw[i];
  const Rw = [];
  for (let i = 0; i <= p - s; i++) Rw[i] = Pw[k - p + i].slice();
  let L = 0;
  for (let j = 1; j <= r; j++) {
    L = k - p + j;
    for (let i = 0; i <= p - j - s; i++) {
      const al = (u - U[L + i]) / (U[i + k + 1] - U[L + i]);
      Rw[i] = V.comb(Rw[i + 1], al, Rw[i], 1 - al);
    }
    Qw[L] = Rw[0];
    Qw[k + r - j - s] = Rw[p - j - s];
  }
  for (let i = L + 1; i < k - s; i++) Qw[i] = Rw[i - L];
  return fromH(p, UQ, Qw);
}

export function refine(c, X) {
  let out = c;
  for (const u of X) out = insertKnot(out, u, 1);
  return out;
}

/** Homogeneous-space tolerance for a geometric tolerance (The NURBS Book § 5.4, eq. 5.30). */
function hTol(c, tol) {
  if (!c.w) return tol;
  const wmin = Math.min(...c.w);
  let pmax = 0;
  for (const q of c.cvs) pmax = Math.max(pmax, V.len(q));
  return tol * wmin / (1 + pmax);
}

/** Remove up to `num` copies of the interior knot u while the curve moves no more than tol. */
export function removeKnot(c, u, num = 1, tol = 1e-9) {
  const p = c.deg, n = c.cvs.length - 1, ord = p + 1;
  const U = c.knots.slice(), Pw = hcvs(c), m = U.length - 1;
  const s = multiplicity(U, u);
  const [a, b] = domain(c);
  if (s === 0 || !(u > a && u < b)) return { curve: c, removed: 0 };
  let r = -1;
  for (let i = 0; i <= m; i++) if (Math.abs(U[i] - u) <= 1e-12 * (b - a)) r = i;
  const TOL = hTol(c, tol);
  const fout = (2 * r - s - p) >> 1;
  let first = r - p, last = r - s, t = 0;
  const temp = [];
  for (t = 0; t < Math.min(num, s); t++) {
    const off = first - 1;
    temp[0] = Pw[off]; temp[last + 1 - off] = Pw[last + 1];
    let i = first, j = last, ii = 1, jj = last - off, remflag = false;
    while (j - i > t) {
      const alfi = (u - U[i]) / (U[i + ord + t] - U[i]);
      const alfj = (u - U[j - t]) / (U[j + ord] - U[j - t]);
      temp[ii] = V.mul(V.sub(Pw[i], V.mul(temp[ii - 1], 1 - alfi)), 1 / alfi);
      temp[jj] = V.mul(V.sub(Pw[j], V.mul(temp[jj + 1], alfj)), 1 / (1 - alfj));
      i++; ii++; j--; jj--;
    }
    if (j - i < t) { if (V.dist(temp[ii - 1], temp[jj + 1]) <= TOL) remflag = true; }
    else {
      const alfi = (u - U[i]) / (U[i + ord + t] - U[i]);
      if (V.dist(Pw[i], V.comb(temp[ii + t + 1], alfi, temp[ii - 1], 1 - alfi)) <= TOL) remflag = true;
    }
    if (!remflag) break;
    i = first; j = last;
    while (j - i > t) { Pw[i] = temp[i - off]; Pw[j] = temp[j - off]; i++; j--; }
    first--; last++;
  }
  if (t === 0) return { curve: c, removed: 0 };
  for (let k = r + 1; k <= m; k++) U[k - t] = U[k];
  U.length = m + 1 - t;
  let j = fout, i = j;
  for (let k = 1; k < t; k++) { if (k % 2 === 1) i++; else j--; }
  for (let k = i + 1; k <= n; k++) { Pw[j] = Pw[k]; j++; }
  Pw.length = n + 1 - t;
  return { curve: fromH(p, U, Pw), removed: t };
}

/** The curve as its Bézier pieces (each a clamped curve of one span on that span's own parameter interval). */
export function decompose(c) {
  const p = c.deg;
  let full = c;
  for (const k of distinctKnots(c.knots).slice(1, -1)) if (k.m < p) full = insertKnot(full, k.u, p - k.m);
  const Pw = hcvs(full), ks = distinctKnots(full.knots), out = [];
  for (let s = 0; s + 1 < ks.length; s++) {
    const a = ks[s].u, b = ks[s + 1].u;
    const seg = Pw.slice(s * p, s * p + p + 1);
    out.push(fromH(p, [...new Array(p + 1).fill(a), ...new Array(p + 1).fill(b)], seg));
  }
  return out;
}

/** Bézier pieces (homogeneous, sharing ends) back into one curve; interior knots have multiplicity p. */
function assemble(p, pieces, breaks) {
  const knots = new Array(p + 1).fill(breaks[0]);
  for (let s = 1; s < breaks.length - 1; s++) for (let i = 0; i < p; i++) knots.push(breaks[s]);
  for (let i = 0; i <= p; i++) knots.push(breaks[breaks.length - 1]);
  const Pw = [];
  pieces.forEach((seg, s) => { for (let i = s ? 1 : 0; i < seg.length; i++) Pw.push(seg[i]); });
  return fromH(p, knots, Pw);
}

function curveSize(c) { const bb = bbox(c); return Math.max(1e-9, V.dist(bb.min, bb.max)); }

export function elevate(c, t = 1, { removeKnots = true } = {}) {
  if (!Number.isInteger(t) || t < 0) fail('nurbs.err.degree');
  if (t === 0) return reparam(c, ...domain(c));
  const p = c.deg, ph = p + t;
  if (ph > MAX_DEG) fail('nurbs.err.degree', { max: MAX_DEG });
  const orig = distinctKnots(c.knots);
  const pieces = decompose(c).map((b) => {
    const P = hcvs(b), Q = [];
    for (let i = 0; i <= ph; i++) {
      let q = [0, 0, 0, 0];
      for (let j = Math.max(0, i - t); j <= Math.min(p, i); j++) q = V.add(q, V.mul(P[j], binomial(p, j) * binomial(t, i - j) / binomial(ph, i)));
      Q.push(q);
    }
    return Q;
  });
  let out = assemble(ph, pieces, orig.map((k) => k.u));
  if (!removeKnots) return out;
  const tol = 1e-10 * curveSize(c);
  for (const k of orig.slice(1, -1)) out = removeKnot(out, k.u, p - k.m, tol).curve;
  return out;
}

/** One degree lower, if the curve moves no more than tol; the error is a bound (control points of the re-elevated pieces). */
export function reduce(c, tol = 1e-6) {
  const p = c.deg;
  if (p < 2) return null;
  const orig = distinctKnots(c.knots);
  let err = 0;
  const pieces = decompose(c).map((b) => {
    const P = hcvs(b), q = p - 1, L = new Array(p), R = new Array(p);
    L[0] = P[0];
    for (let i = 1; i < p; i++) { const al = i / p; L[i] = V.mul(V.sub(P[i], V.mul(L[i - 1], al)), 1 / (1 - al)); }
    R[q] = P[p];
    for (let i = q - 1; i >= 0; i--) { const al = (i + 1) / p; R[i] = V.mul(V.sub(P[i + 1], V.mul(R[i + 1], 1 - al)), 1 / al); }
    const Q = [];
    for (let i = 0; i <= q; i++) { const lam = q ? i / q : 0.5; Q.push(V.comb(L[i], 1 - lam, R[i], lam)); }
    Q[0] = P[0]; Q[q] = P[p];
    // bound: raise Q back to degree p and compare control points (convex hull: the curves differ by no more than that)
    for (let i = 0; i <= p; i++) {
      const a = i / p, e = i === 0 ? Q[0] : i === p ? Q[q] : V.comb(Q[i - 1], a, Q[i], 1 - a);
      err = Math.max(err, V.dist(e.slice(0, 3).map((x) => x / e[3]), P[i].slice(0, 3).map((x) => x / P[i][3])));
    }
    return Q;
  });
  if (err > tol) return null;
  let out = assemble(p - 1, pieces, orig.map((k) => k.u));
  const rest = Math.max(0, tol - err);
  for (const k of orig.slice(1, -1)) out = removeKnot(out, k.u, p - k.m, rest).curve;
  return { curve: out, error: err };
}

// ------------------------------------------------------------------------------------------------ pieces

export function split(c, u) {
  const [a, b] = domain(c);
  if (!(u > a + 1e-12 * (b - a) && u < b - 1e-12 * (b - a))) fail('nurbs.err.knot_outside');
  const p = c.deg, s = multiplicity(c.knots, u);
  const full = s < p ? insertKnot(c, u, p - s) : c;
  const Pw = hcvs(full), U = full.knots;
  let k = -1;
  for (let i = 0; i < U.length; i++) if (Math.abs(U[i] - u) <= 1e-12 * (b - a)) { k = i; break; }
  // knots U[k … k+p-1] are u (p copies); the left curve ends with p+1 copies, the right one starts with them
  const left = fromH(p, [...U.slice(0, k + p), u], Pw.slice(0, k));
  const right = fromH(p, [u, ...U.slice(k)], Pw.slice(k - 1));
  return [left, right];
}

export function segment(c, a, b) {
  const [ca, cb] = domain(c);
  const eps = 1e-12 * (cb - ca);
  let out = c;
  if (b < cb - eps) out = split(out, b)[0];
  if (a > ca + eps) out = split(out, a)[1];
  return out;
}

export function reverse(c) {
  const [a, b] = domain(c);
  return { deg: c.deg, knots: c.knots.map((x) => a + b - x).reverse(), cvs: c.cvs.map((q) => q.slice()).reverse(), w: c.w ? c.w.slice().reverse() : null };
}

export function reparam(c, a = 0, b = 1) {
  const [ca, cb] = domain(c), f = (b - a) / (cb - ca);
  const knots = c.knots.map((x) => a + (x - ca) * f);
  for (let i = 0; i <= c.deg; i++) { knots[i] = a; knots[knots.length - 1 - i] = b; }
  return { deg: c.deg, knots, cvs: c.cvs.map((q) => q.slice()), w: c.w ? c.w.slice() : null };
}

export function transform(c, m) {
  return { deg: c.deg, knots: c.knots.slice(), cvs: c.cvs.map((q) => V.xform(m, q)), w: c.w ? c.w.slice() : null };
}

export const endsOf = (c) => ({ start: point(c, domain(c)[0]), end: point(c, domain(c)[1]) });

// ------------------------------------------------------------------------------------------------ measures

export function closestParam(c, p, { u0 = null } = {}) {
  const [a, b] = domain(c);
  let best = u0, bd = u0 == null ? Infinity : V.dist(point(c, u0), p);
  if (u0 == null) {
    const ks = distinctKnots(c.knots), per = 4 * c.deg + 4;
    for (let s = 0; s + 1 < ks.length; s++) for (let i = 0; i <= per; i++) {
      const u = ks[s].u + (ks[s + 1].u - ks[s].u) * i / per, d = V.dist(point(c, u), p);
      if (d < bd) { bd = d; best = u; }
    }
  }
  let u = best;
  for (let it = 0; it < 30; it++) {
    const [C, d1, d2] = derivs(c, u, 2), r = V.sub(C, p);
    const f = V.dot(d1, r), df = V.dot(d2, r) + V.dot(d1, d1);
    if (Math.abs(df) < 1e-300) break;
    let un = u - f / df;
    un = un < a ? a : un > b ? b : un;
    if (Math.abs(un - u) <= 1e-15 * (b - a + 1)) { u = un; break; }
    u = un;
  }
  const q = point(c, u), d = V.dist(q, p);
  return d <= bd ? { u, point: q, d } : { u: best, point: point(c, best), d: bd };
}

const GL_X = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
const GL_W = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];

/** Gauss–Legendre (8 points) on 4 pieces of each knot span. */
export function arcLength(c, a = null, b = null) {
  const [ca, cb] = domain(c);
  a = a == null ? ca : a; b = b == null ? cb : b;
  if (b < a) return arcLength(c, b, a);
  const cuts = [a, ...distinctKnots(c.knots).map((k) => k.u).filter((u) => u > a && u < b), b];
  let s = 0;
  for (let k = 0; k + 1 < cuts.length; k++) for (let q = 0; q < 4; q++) {
    const x0 = cuts[k] + (cuts[k + 1] - cuts[k]) * q / 4, x1 = cuts[k] + (cuts[k + 1] - cuts[k]) * (q + 1) / 4, h = (x1 - x0) / 2;
    for (let g = 0; g < 8; g++) s += GL_W[g] * h * V.len(derivs(c, x0 + h * (1 + GL_X[g]), 1)[1]);
  }
  return s;
}

/** The parameter at arc length s from the start (Newton on the length, bracketed). */
export function paramAtLength(c, s) {
  const [a, b] = domain(c), total = arcLength(c);
  if (s <= 0) return a;
  if (s >= total) return b;
  let lo = a, hi = b, u = a + (b - a) * s / total;
  for (let it = 0; it < 50; it++) {
    const f = arcLength(c, a, u) - s;
    if (Math.abs(f) <= 1e-12 * total) break;
    if (f > 0) hi = u; else lo = u;
    const sp = V.len(derivs(c, u, 1)[1]);
    let un = sp > 1e-300 ? u - f / sp : (lo + hi) / 2;
    if (!(un > lo && un < hi)) un = (lo + hi) / 2;
    u = un;
  }
  return u;
}

export function bbox(c) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const q of c.cvs) for (let i = 0; i < 3; i++) { if (q[i] < min[i]) min[i] = q[i]; if (q[i] > max[i]) max[i] = q[i]; }
  return { min, max };
}

function segDist(p, a, b) {
  const ab = V.sub(b, a), l2 = V.dot(ab, ab);
  if (l2 < 1e-300) return V.dist(p, a);
  let t = V.dot(V.sub(p, a), ab) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return V.dist(p, V.add(a, V.mul(ab, t)));
}

export function tessellate(c, { tol = 0.01, maxSegs = 4096 } = {}) {
  const ks = distinctKnots(c.knots).map((k) => k.u);
  const params = [ks[0]];
  const points = [point(c, ks[0])];
  let budget = maxSegs;
  const rec = (u0, p0, u1, p1, depth) => {
    const ok = [0.25, 0.5, 0.75].every((f) => segDist(point(c, u0 + (u1 - u0) * f), p0, p1) <= tol);
    if ((ok && depth >= 1) || depth > 20 || budget <= 1) { params.push(u1); points.push(p1); budget--; return; }
    const um = (u0 + u1) / 2, pm = point(c, um);
    rec(u0, p0, um, pm, depth + 1);
    rec(um, pm, u1, p1, depth + 1);
  };
  for (let s = 0; s + 1 < ks.length; s++) rec(ks[s], points[points.length - 1], ks[s + 1], point(c, ks[s + 1]), c.deg > 1 ? 0 : 1);
  return { points, params };
}

export function sameCurve(a, b, tol = 1e-6, samples = 32) {
  const [a0, a1] = domain(a);
  for (let i = 0; i <= samples; i++) {
    const p = point(a, a0 + (a1 - a0) * i / samples);
    if (closestParam(b, p).d > tol) return false;
  }
  return true;
}

// ------------------------------------------------------------------------------------------------ constructors

export const line = (a, b) => ({ deg: 1, knots: [0, 0, 1, 1], cvs: [[...a, 0].slice(0, 3), [...b, 0].slice(0, 3)], w: null });

export function polyline(pts) {
  if (pts.length < 2) fail('nurbs.err.cv_count', { min: 2 });
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.max(1e-12, V.dist(pts[i], pts[i - 1])));
  const knots = [0, ...L.map((x) => x / L[L.length - 1]), 1];
  return { deg: 1, knots, cvs: pts.map((p) => [p[0], p[1], p.length > 2 ? p[2] : 0]), w: null };
}

/** A7.1: a circular arc from angle a0 to a1 (radians, counter-clockwise about xAxis × yAxis), as a rational quadratic. */
export function arc(center, xAxis, yAxis, r, a0, a1) {
  let th = a1 - a0;
  if (!(Math.abs(th) > 1e-12)) fail('nurbs.err.arc');
  if (Math.abs(th) > 2 * Math.PI) th = Math.sign(th) * 2 * Math.PI;
  const X = V.norm(xAxis), Y = V.norm(yAxis);
  const narcs = Math.abs(th) <= Math.PI / 2 ? 1 : Math.abs(th) <= Math.PI ? 2 : Math.abs(th) <= 1.5 * Math.PI ? 3 : 4;
  const dth = th / narcs, w1 = Math.cos(dth / 2);
  const at = (ang) => V.add(center, V.add(V.mul(X, r * Math.cos(ang)), V.mul(Y, r * Math.sin(ang))));
  const tan = (ang) => V.add(V.mul(X, -Math.sin(ang)), V.mul(Y, Math.cos(ang)));
  const cvs = [at(a0)], w = [1];
  let ang = a0, P0 = at(a0), T0 = tan(a0);
  for (let i = 1; i <= narcs; i++) {
    ang += dth;
    const P2 = at(ang), T2 = tan(ang);
    // the middle point: where the end tangents meet (they meet at distance r·tan(dth/2) from each end)
    const P1 = V.add(P0, V.mul(T0, r * Math.tan(dth / 2)));
    cvs.push(P1, P2); w.push(w1, 1);
    P0 = P2; T0 = T2;
  }
  const knots = [0, 0, 0];
  for (let i = 1; i < narcs; i++) knots.push(i / narcs, i / narcs);
  knots.push(1, 1, 1);
  return { deg: 2, knots, cvs, w };
}

export function circle(center, normal, r) {
  const n = V.norm(normal), x = V.perp(n), y = V.cross(n, x);
  return arc(center, x, y, r, 0, 2 * Math.PI);
}

/** Join curves end to start (each next one turned round when its far end is the near one) into one curve, C0 at the joints. */
export function join(curves, tol = 1e-6) {
  if (!curves.length) fail('nurbs.err.cv_count', { min: 1 });
  const list = [curves[0]];
  for (let i = 1; i < curves.length; i++) {
    const prevEnd = endsOf(list[i - 1]).end, e = endsOf(curves[i]);
    if (V.dist(prevEnd, e.start) <= tol) list.push(curves[i]);
    else if (V.dist(prevEnd, e.end) <= tol) list.push(reverse(curves[i]));
    else if (i === 1 && V.dist(endsOf(list[0]).start, e.start) <= tol) { list[0] = reverse(list[0]); list.push(curves[i]); }
    else if (i === 1 && V.dist(endsOf(list[0]).start, e.end) <= tol) { list[0] = reverse(list[0]); list.push(reverse(curves[i])); }
    else fail('nurbs.err.join_gap', { index: i });
  }
  const p = Math.max(...list.map((c) => c.deg));
  const lens = list.map((c) => Math.max(1e-12, arcLength(c))), total = lens.reduce((x, y) => x + y, 0);
  let at = 0, knots = null, Pw = null;
  list.forEach((c0, i) => {
    let c = elevate(c0, p - c0.deg);
    c = reparam(c, at / total, (at + lens[i]) / total);
    at += lens[i];
    let H = hcvs(c);
    if (!Pw) { knots = c.knots.slice(); Pw = H; return; }
    // scale this piece's homogeneous points so its first weight equals the last weight so far (same curve, continuous weights)
    const f = Pw[Pw.length - 1][3] / H[0][3];
    H = H.map((q) => V.mul(q, f));
    Pw[Pw.length - 1] = V.mul(V.add(Pw[Pw.length - 1], H[0]), 0.5);
    Pw.push(...H.slice(1));
    knots = [...knots.slice(0, knots.length - 1), ...c.knots.slice(p + 1)];
  });
  knots[knots.length - 1] = 1;
  for (let i = 0; i <= p; i++) knots[knots.length - 1 - i] = 1;
  return fromH(p, knots, Pw);
}
