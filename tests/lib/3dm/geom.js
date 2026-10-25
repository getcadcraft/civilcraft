/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — points on the curves and surfaces objects.js reads, and curves as polylines. DOM-free, our own code from the
 * published definitions (B-splines: de Boor's algorithm, as in Piegl & Tiller, "The NURBS Book"; the rest is plain
 * geometry). Where a class maps its parameters in a particular way (a plane's extents, a revolution's angle range, an
 * extrusion's profile frame) the mapping follows what openNURBS's Evaluate() does (see NOTICE).
 *
 *   curveDomain(c) → [t0, t1]            curveAt(c, t) → [x, y, z]
 *   sampleCurve(c, tol, [t0, t1]) → { pts: [[x,y,z]…], ts: [t…] }  (a chord within `tol` of the curve, kinks kept)
 *   surfaceDomain(s) → [[u0, u1], [v0, v1]]   surfaceAt(s, u, v) → [x, y, z]   normalAt(s, u, v) → unit [x, y, z] | null
 *
 * Knot vectors are openNURBS's (order + count − 2 knots: no end knots), control points homogeneous when rational.
 */

// --------------------------------------------------------------------------------------------------------- B-splines

/** The span index i (order-1 ≤ i ≤ n-1 in the full knot vector) with U[i] ≤ t < U[i+1]; t clamped into the domain. */
function span(K, order, n, t) {
  // K is openNURBS's: full knot k = K[k - 1]; the domain is [K[order - 2], K[n - 1]]
  const lo = order - 2, hi = n - 1;
  if (t <= K[lo]) { let i = lo; while (i < hi - 1 && K[i + 1] <= K[lo]) i++; return i; }
  if (t >= K[hi]) { let i = hi - 1; while (i > lo && K[i] >= K[hi]) i--; return i; }
  let a = lo, b = hi;
  while (b - a > 1) { const m = (a + b) >> 1; if (t < K[m]) b = m; else a = m; }
  return a;
}

/** de Boor on `size`-wide control points (`cv(i)` gives point i), openNURBS knots K. → Float64Array(size). */
function deBoor(K, order, n, size, cv, t) {
  const p = order - 1;
  const s = span(K, order, n, t);   // K[s] ≤ t < K[s+1]: the points s-p+1 … s+1 are active
  const first = s - p + 1;
  const d = new Float64Array(order * size);
  for (let j = 0; j < order; j++) { const q = cv(first + j); for (let k = 0; k < size; k++) d[j * size + k] = q[k]; }
  for (let r = 1; r <= p; r++) {
    for (let j = p; j >= r; j--) {
      const i = first + j;   // the point index; its knots run K[i-1] … K[i+p-1] in openNURBS's numbering
      const a0 = K[i - 1], a1 = K[i + p - r];
      const den = a1 - a0;
      const a = den !== 0 ? (t - a0) / den : 0;
      for (let k = 0; k < size; k++) d[j * size + k] = (1 - a) * d[(j - 1) * size + k] + a * d[j * size + k];
    }
  }
  return d.subarray(p * size, p * size + size);
}

const homog = (q, dim, rat) => {
  if (!rat) return [q[0], dim > 1 ? q[1] : 0, dim > 2 ? q[2] : 0];
  const w = q[dim] || 1;
  return [q[0] / w, dim > 1 ? q[1] / w : 0, dim > 2 ? q[2] / w : 0];
};

function nurbsCurveAt(c, t) {
  const size = c.dim + (c.rat ? 1 : 0);
  const q = deBoor(c.knots, c.order, c.n, size, (i) => c.cvs.subarray(i * size, i * size + size), t);
  return homog(q, c.dim, c.rat);
}

function nurbsSurfaceAt(s, u, v) {
  const size = s.dim + (s.rat ? 1 : 0);
  const [ou, ov] = s.order, [nu, nv] = s.n;
  // along v for each active u row, then along u
  const su = span(s.knots[0], ou, nu, u);
  const first = su - ou + 2;
  const rows = [];
  for (let j = 0; j < ou; j++) {
    const i = first + j;
    const row = (k) => s.cvs.subarray((i * nv + k) * size, (i * nv + k) * size + size);
    rows.push(Float64Array.from(deBoor(s.knots[1], ov, nv, size, row, v)));
  }
  const q = deBoor(s.knots[0], ou, nu, size, (i) => rows[i - first], u);
  return homog(q, s.dim, s.rat);
}

// ----------------------------------------------------------------------------------------------------------- curves

export function curveDomain(c) {
  switch (c.cls) {
    case 'nurbsCurve': return [c.knots[c.order - 2], c.knots[c.n - 1]];
    case 'lineCurve': case 'arcCurve': return c.t.slice();
    case 'polylineCurve': return c.t.length ? [c.t[0], c.t[c.t.length - 1]] : [0, 1];
    case 'polyCurve': return [c.t[0], c.t[c.t.length - 1]];
    default: return [0, 1];
  }
}

const lerp = (a, b, s) => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
const map = (t, [a0, a1], [b0, b1]) => (a1 === a0 ? b0 : b0 + (t - a0) * (b1 - b0) / (a1 - a0));

export function curveAt(c, t) {
  switch (c.cls) {
    case 'nurbsCurve': return nurbsCurveAt(c, t);
    case 'lineCurve': return lerp(c.a, c.b, c.t[1] === c.t[0] ? 0 : (t - c.t[0]) / (c.t[1] - c.t[0]));
    case 'arcCurve': {
      const a = map(t, c.t, c.angle), { o, x, y } = c.plane, r = c.radius, ca = Math.cos(a) * r, sa = Math.sin(a) * r;
      return [o[0] + ca * x[0] + sa * y[0], o[1] + ca * x[1] + sa * y[1], o[2] + ca * x[2] + sa * y[2]];
    }
    case 'polylineCurve': {
      const P = c.pts, T = c.t;
      if (P.length < 2 || T.length !== P.length) return P[0] ? P[0].slice() : [0, 0, 0];
      let i = 0;
      while (i < P.length - 2 && t > T[i + 1]) i++;
      return lerp(P[i], P[i + 1], T[i + 1] === T[i] ? 0 : (t - T[i]) / (T[i + 1] - T[i]));
    }
    case 'polyCurve': {
      const T = c.t;
      let i = 0;
      while (i < c.segs.length - 1 && t > T[i + 1]) i++;
      const s = c.segs[i];
      return curveAt(s, map(t, [T[i], T[i + 1]], curveDomain(s)));
    }
    default: return [0, 0, 0];
  }
}

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const chordDev = (p, a, b) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const L = ab[0] * ab[0] + ab[1] * ab[1] + ab[2] * ab[2];
  if (L === 0) return Math.hypot(...ap);
  const s = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L));
  return Math.hypot(ap[0] - s * ab[0], ap[1] - s * ab[1], ap[2] - s * ab[2]);
};

/** Parameters where a curve may kink: knots of a NURBS curve (distinct, inside), polyline corners, poly curve joins. */
function breaks(c, t0, t1) {
  const out = new Set([t0, t1]);
  const add = (t) => { if (t > t0 && t < t1) out.add(t); };
  if (c.cls === 'nurbsCurve') for (let k = c.order - 1; k < c.n - 1; k++) add(c.knots[k]);
  if (c.cls === 'polylineCurve') for (const t of c.t) add(t);
  if (c.cls === 'polyCurve') {
    c.t.forEach(add);
    c.segs.forEach((s, i) => { const d = curveDomain(s); for (const u of breaks(s, d[0], d[1])) add(map(u, d, [c.t[i], c.t[i + 1]])); });
  }
  if (c.cls === 'arcCurve') { const n = Math.ceil(Math.abs(c.angle[1] - c.angle[0]) / (Math.PI / 2)); for (let k = 1; k < n; k++) add(t0 + (t1 - t0) * k / n); }
  return [...out].sort((a, b) => a - b);
}

/**
 * A polyline within `tol` of the curve between t0 and t1 (default its domain): every break point kept, each piece cut in
 * half while its middle (and its quarter points) lie farther than `tol` from the chord, at most `maxDepth` halvings.
 * Straight pieces stay one segment. → { pts, ts }.
 */
export function sampleCurve(c, tol, range = null, { maxDepth = 10, minPieces = 1 } = {}) {
  const [t0, t1] = range || curveDomain(c);
  const lo = Math.min(t0, t1), hi = Math.max(t0, t1);
  let B = breaks(c, lo, hi);
  if (B.length - 1 < minPieces) { B = []; for (let k = 0; k <= minPieces; k++) B.push(lo + (hi - lo) * k / minPieces); }
  const ts = [B[0]], pts = [curveAt(c, B[0])];
  const straight = c.cls === 'lineCurve' || c.cls === 'polylineCurve' || (c.cls === 'nurbsCurve' && c.order === 2);
  const rec = (a, pa, b, pb, depth) => {
    if (!straight && depth < maxDepth) {
      const m = (a + b) / 2, pm = curveAt(c, m);
      const q1 = curveAt(c, a + (b - a) * 0.25), q3 = curveAt(c, a + (b - a) * 0.75);
      if (chordDev(pm, pa, pb) > tol || chordDev(q1, pa, pb) > tol || chordDev(q3, pa, pb) > tol || (depth < 2 && dist(pa, pb) === 0 && dist(pm, pa) > tol)) {
        rec(a, pa, m, pm, depth + 1);
        rec(m, pm, b, pb, depth + 1);
        return;
      }
    }
    ts.push(b); pts.push(pb);
  };
  for (let k = 0; k + 1 < B.length; k++) rec(B[k], pts[pts.length - 1], B[k + 1], curveAt(c, B[k + 1]), 0);
  if (t0 > t1) { ts.reverse(); pts.reverse(); }
  return { pts, ts };
}


// --------------------------------------------------------------------------------------------------------- surfaces

export function surfaceDomain(s) {
  switch (s.cls) {
    case 'nurbsSurface': return [[s.knots[0][s.order[0] - 2], s.knots[0][s.n[0] - 1]], [s.knots[1][s.order[1] - 2], s.knots[1][s.n[1] - 1]]];
    case 'planeSurface': return [s.domain[0].slice(), s.domain[1].slice()];
    case 'revSurface': { const a = s.t.slice(), b = s.curve ? curveDomain(s.curve) : [0, 1]; return s.transposed ? [b, a] : [a, b]; }
    case 'sumSurface': return [s.curves[0] ? curveDomain(s.curves[0]) : [0, 1], s.curves[1] ? curveDomain(s.curves[1]) : [0, 1]];
    default: return [[0, 1], [0, 1]];
  }
}

/** Rotate p about the line (o, unit axis z) by angle a (right hand). */
function rotate(p, o, z, a) {
  const v = [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
  const c = Math.cos(a), s = Math.sin(a), d = v[0] * z[0] + v[1] * z[1] + v[2] * z[2];
  const x = [z[1] * v[2] - z[2] * v[1], z[2] * v[0] - z[0] * v[2], z[0] * v[1] - z[1] * v[0]];
  return [0, 1, 2].map((k) => o[k] + v[k] * c + x[k] * s + z[k] * d * (1 - c));
}

export function surfaceAt(s, u, v) {
  switch (s.cls) {
    case 'nurbsSurface': return nurbsSurfaceAt(s, u, v);
    case 'planeSurface': {
      const a = map(u, s.domain[0], s.extents[0]), b = map(v, s.domain[1], s.extents[1]), { o, x, y } = s.plane;
      return [o[0] + a * x[0] + b * y[0], o[1] + a * x[1] + b * y[1], o[2] + a * x[2] + b * y[2]];
    }
    case 'revSurface': {
      if (!s.curve) return [0, 0, 0];
      let a = u, t = v;
      if (s.transposed) { a = v; t = u; }
      const ang = map(a, s.t, s.angle);
      const [o, e] = s.axis, d = [e[0] - o[0], e[1] - o[1], e[2] - o[2]], L = Math.hypot(...d) || 1;
      return rotate(curveAt(s.curve, t), o, d.map((x) => x / L), ang);
    }
    case 'sumSurface': {
      const [c0, c1] = s.curves;
      if (!c0 || !c1) return [0, 0, 0];
      const p = curveAt(c0, u), q = curveAt(c1, v);
      return [p[0] + q[0] + s.base[0], p[1] + q[1] + s.base[1], p[2] + q[2] + s.base[2]];
    }
    default: return [0, 0, 0];
  }
}

/** The unit normal (∂u × ∂v) by central differences, stepped back inside the domain at its edges; null where it vanishes. */
export function normalAt(s, u, v, dom = surfaceDomain(s)) {
  const hu = (dom[0][1] - dom[0][0]) * 1e-5 || 1e-9, hv = (dom[1][1] - dom[1][0]) * 1e-5 || 1e-9;
  const cu = Math.min(Math.max(u, dom[0][0] + hu), dom[0][1] - hu), cv = Math.min(Math.max(v, dom[1][0] + hv), dom[1][1] - hv);
  const a = surfaceAt(s, cu - hu, cv), b = surfaceAt(s, cu + hu, cv), c = surfaceAt(s, cu, cv - hv), d = surfaceAt(s, cu, cv + hv);
  const du = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], dv = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
  const n = [du[1] * dv[2] - du[2] * dv[1], du[2] * dv[0] - du[0] * dv[2], du[0] * dv[1] - du[1] * dv[0]];
  const L = Math.hypot(...n);
  return L > 0 && Number.isFinite(L) ? n.map((x) => x / L) : null;
}

export const SURFACES_WE_EVALUATE = new Set(['nurbsSurface', 'planeSurface', 'revSurface', 'sumSurface']);
export const CURVES_WE_EVALUATE = new Set(['nurbsCurve', 'lineCurve', 'polylineCurve', 'arcCurve', 'polyCurve']);

/** Every curve inside (a poly curve's segments, a revolution's or sum's curves) is one we evaluate. */
export function curveOk(c, depth = 0) {
  if (!c || depth > 32 || c.unread || !CURVES_WE_EVALUATE.has(c.cls)) return false;
  if (c.cls === 'polyCurve') return c.segs.length > 0 && c.segs.every((s) => curveOk(s, depth + 1));
  if (c.cls === 'nurbsCurve') return c.knots.every(Number.isFinite) && c.cvs.every(Number.isFinite);
  return true;
}
export function surfaceOk(s) {
  if (!s || s.unread || !SURFACES_WE_EVALUATE.has(s.cls)) return false;
  if (s.cls === 'revSurface') return curveOk(s.curve);
  if (s.cls === 'sumSurface') return curveOk(s.curves[0]) && curveOk(s.curves[1]);
  if (s.cls === 'nurbsSurface') return s.knots[0].every(Number.isFinite) && s.knots[1].every(Number.isFinite) && s.cvs.every(Number.isFinite);
  return true;
}
