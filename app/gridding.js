/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gridding.js — choose how scattered survey points become a ground surface (0.9 D9.6, from /suggest #1237).
 * No DOM, no strings (notes are codes with data), no dependencies but tin.js. Written from the published maths
 * (Shepard 1968, Franke–Little weights, Hardy multiquadrics, Matheron/ordinary kriging, Briggs 1974 minimum curvature,
 * Sibson/Laplace natural neighbours); no code taken from any other program. Tested by bin/test-civilcraft-gridding.mjs.
 *
 *   METHODS                      [{ key, exact, local }]  the methods this file does
 *   gridSurface(points, { method, step, power, order, radius, neighbours, maxNodes }) →
 *       { pts, faces, grid:{ nx, ny, x0, y0, step, z:Float64Array (NaN = outside the points) }, sigma?, residuals:{ rms, max, n },
 *         notes:[{ code, ...data }], method, step }
 *     pts/faces go to tin.js surfaceFromFaces(), so contours, slopes and volumes work unchanged. Nodes outside the convex hull
 *     of the points are left out (no extrapolation). Points are {x, y, z}; non-finite ones are dropped.
 *
 *   key        what it does
 *   idw        inverse distance to a power (power, default 2) over the nearest `neighbours` (default 16)
 *   nearest    value of the nearest point
 *   movavg     mean of the points within `radius` (default 2.5 × mean spacing); the nearest point where there are none
 *   shepard    modified Shepard: Franke–Little weights over the nearest 12, smoother than idw, no flat spots at the points
 *   natural    natural neighbour (Laplace weights from the Delaunay cavity of the node): exact, smooth between points, local
 *   polyreg    global polynomial regression of `order` 1–3 (a trend, not an exact fit)
 *   localpoly  weighted local quadratic (linear where there are few points) over the nearest 16
 *   rbf        radial basis function, multiquadric, exact; the first 1500 points (evenly thinned) when there are more
 *   mincurv    minimum curvature (Briggs): the smoothest surface through the data; the grid is limited to 40000 nodes
 *   kriging    ordinary kriging, spherical variogram fitted to the points, nearest 16; also returns sigma (the kriging error)
 *   krigerr    the kriging error itself as the surface (how little the points say about each place; 0 at a point)
 *   metric-*   data metrics: count, mean, min, max, range, std of the points within `radius` (default 2.5 × mean spacing) of each node
 *
 *   options also: lines [[{x,y,z}…]] (breaklines: their vertices and points along them every grid step become data),
 *   boundary [{x,y}…] (nodes outside it are left out)
 */

import { buildSurface, convexHull, pointInPoly } from './tin.js';

export const METHODS = [
  { key: 'idw', exact: true, local: true }, { key: 'nearest', exact: true, local: true }, { key: 'movavg', exact: false, local: true },
  { key: 'shepard', exact: true, local: true }, { key: 'natural', exact: true, local: true }, { key: 'polyreg', exact: false, local: false },
  { key: 'localpoly', exact: false, local: true }, { key: 'rbf', exact: true, local: false }, { key: 'mincurv', exact: true, local: false },
  { key: 'kriging', exact: true, local: true }, { key: 'krigerr', exact: false, local: true },
  // data metrics (what the points are like, not a height): each is a surface of its own
  ...['count', 'mean', 'min', 'max', 'range', 'std'].map((m) => ({ key: 'metric-' + m, exact: false, local: true, metric: m })),
];

const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const MAX_NODES = 250000;
const NODE_CAP = { mincurv: 40000, kriging: 40000, rbf: 90000 };

/** Solve A x = b (n×n, row arrays) by Gaussian elimination with partial pivoting; null when singular. */
function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let p = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    if (Math.abs(A[p][i]) < 1e-300) return null;
    if (p !== i) { [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]]; }
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      if (f === 0) continue;
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      b[r] -= f * b[i];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c];
    x[i] = s / A[i][i];
  }
  return x;
}

/** Uniform hash for nearest-k queries. */
function makeIndex(P, bounds) {
  const w = Math.max(bounds.maxX - bounds.minX, 1e-9), h = Math.max(bounds.maxY - bounds.minY, 1e-9);
  const cell = Math.max(Math.sqrt((w * h) / Math.max(P.length, 1)) * 1.5, Math.max(w, h) / 2000, 1e-9);
  const cols = Math.floor(w / cell) + 1, rows = Math.floor(h / cell) + 1;
  const bins = new Map();
  P.forEach((p, i) => {
    const k = Math.floor((p.y - bounds.minY) / cell) * cols + Math.floor((p.x - bounds.minX) / cell);
    (bins.get(k) || bins.set(k, []).get(k)).push(i);
  });
  /** indexes of the k nearest points to (x, y), nearest first, with their distances */
  function nearest(x, y, k) {
    const cx = Math.floor((x - bounds.minX) / cell), cy = Math.floor((y - bounds.minY) / cell);
    const found = [];
    let ring = 0;
    for (;; ring++) {
      for (let j = cy - ring; j <= cy + ring; j++) {
        if (j < 0 || j >= rows) continue;
        for (let i = cx - ring; i <= cx + ring; i++) {
          if (i < 0 || i >= cols) continue;
          if (ring && j !== cy - ring && j !== cy + ring && i !== cx - ring && i !== cx + ring) continue;
          const b = bins.get(j * cols + i);
          if (b) for (const q of b) found.push(q);
        }
      }
      // a point found in ring r can be as far as (r+1)·cell·√2; stop once k are within the guaranteed radius ring·cell
      if (found.length >= k) {
        const d = found.map((q) => Math.hypot(P[q].x - x, P[q].y - y)).sort((a, b) => a - b);
        if (d[k - 1] <= ring * cell || ring > Math.max(cols, rows)) break;
      } else if (ring > Math.max(cols, rows)) break;
    }
    const sorted = found.map((q) => ({ q, d: Math.hypot(P[q].x - x, P[q].y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
    return sorted;
  }
  return { nearest, cell };
}

// ---------------------------------------------------------------------------
// Per-method estimators: each takes the prepared data and returns f(x, y) → z (or { z, sigma })

function est_idw(P, ix, o) {
  const k = Math.min(P.length, o.neighbours || 16), pw = finite(o.power) && o.power > 0 ? o.power : 2;
  return (x, y) => {
    let sw = 0, sz = 0;
    for (const { q, d } of ix.nearest(x, y, k)) {
      if (d < 1e-12) return P[q].z;
      const w = 1 / d ** pw; sw += w; sz += w * P[q].z;
    }
    return sz / sw;
  };
}

function est_nearest(P, ix) { return (x, y) => P[ix.nearest(x, y, 1)[0].q].z; }

function est_movavg(P, ix, o, meanSpacing) {
  const R = o.radius > 0 ? o.radius : 2.5 * meanSpacing;
  return (x, y) => {
    const near = ix.nearest(x, y, Math.min(P.length, 64));
    let n = 0, s = 0;
    for (const { q, d } of near) if (d <= R) { n++; s += P[q].z; }
    return n ? s / n : P[near[0].q].z;
  };
}

function est_shepard(P, ix, o) {
  const k = Math.min(P.length, o.neighbours || 12);
  return (x, y) => {
    const near = ix.nearest(x, y, Math.min(P.length, k + 1));
    const R = near[near.length - 1].d * 1.0000001;   // the farthest of the k+1 is the cut-off, so it weighs 0
    let sw = 0, sz = 0;
    for (const { q, d } of near) {
      if (d < 1e-12) return P[q].z;
      if (d >= R) continue;
      const w = ((R - d) / (R * d)) ** 2; sw += w; sz += w * P[q].z;
    }
    return sw ? sz / sw : P[near[0].q].z;
  };
}

function est_polyreg(P, ix, o) {
  const order = Math.min(3, Math.max(1, Math.round(o.order || 1)));
  const terms = [];
  for (let a = 0; a <= order; a++) for (let b = 0; a + b <= order; b++) terms.push([a, b]);
  const m = terms.length;
  if (P.length < m) return null;
  const basis = (x, y) => terms.map(([a, b]) => x ** a * y ** b);
  const A = Array.from({ length: m }, () => new Array(m).fill(0)), r = new Array(m).fill(0);
  for (const p of P) { const f = basis(p.x, p.y); for (let i = 0; i < m; i++) { r[i] += f[i] * p.z; for (let j = 0; j < m; j++) A[i][j] += f[i] * f[j]; } }
  const c = solve(A, r);
  return c ? (x, y) => { const f = basis(x, y); let s = 0; for (let i = 0; i < m; i++) s += c[i] * f[i]; return s; } : null;
}

function est_localpoly(P, ix, o) {
  const k = Math.min(P.length, o.neighbours || 16);
  return (x, y) => {
    const near = ix.nearest(x, y, k);
    if (near[0].d < 1e-12) return P[near[0].q].z;
    const h = near[near.length - 1].d * 1.0000001, quad = near.length >= 8;
    const terms = quad ? [[0, 0], [1, 0], [0, 1], [2, 0], [1, 1], [0, 2]] : [[0, 0], [1, 0], [0, 1]], m = terms.length;
    if (near.length < m) return P[near[0].q].z;
    const A = Array.from({ length: m }, () => new Array(m).fill(0)), r = new Array(m).fill(0);
    for (const { q, d } of near) {
      const w = (1 - (d / h) ** 2) ** 2 + 1e-6, dx = P[q].x - x, dy = P[q].y - y;
      const f = terms.map(([a, b]) => dx ** a * dy ** b);
      for (let i = 0; i < m; i++) { r[i] += w * f[i] * P[q].z; for (let j = 0; j < m; j++) A[i][j] += w * f[i] * f[j]; }
    }
    for (let i = 0; i < m; i++) A[i][i] += 1e-9 * (A[i][i] || 1);
    const c = solve(A, r);
    return c ? c[0] : P[near[0].q].z;   // the fit's value at (x, y) is its constant term (the data are centred on the node)
  };
}

function est_rbf(P, ix, o, spacing, notes) {
  let S = P;
  if (P.length > 1500) { const st = P.length / 1500; S = Array.from({ length: 1500 }, (_, i) => P[Math.floor(i * st)]); notes.push({ code: 'rbf.thinned', used: S.length, of: P.length }); }
  const n = S.length, c2 = (o.radius > 0 ? o.radius : spacing) ** 2;
  const phi = (d2) => Math.sqrt(d2 + c2);
  const A = Array.from({ length: n + 3 }, () => new Array(n + 3).fill(0)), b = new Array(n + 3).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) A[i][j] = phi((S[i].x - S[j].x) ** 2 + (S[i].y - S[j].y) ** 2);
    A[i][n] = A[n][i] = 1; A[i][n + 1] = A[n + 1][i] = S[i].x; A[i][n + 2] = A[n + 2][i] = S[i].y; b[i] = S[i].z;
  }
  const w = solve(A, b);
  if (!w) return null;
  return (x, y) => {
    let s = w[n] + w[n + 1] * x + w[n + 2] * y;
    for (let i = 0; i < n; i++) s += w[i] * phi((x - S[i].x) ** 2 + (y - S[i].y) ** 2);
    return s;
  };
}

/** Spherical variogram fitted to the points: nugget 0, the range that gives the least squared misfit, the sill that goes with it. */
function fitVariogram(P) {
  const S = P.length > 400 ? Array.from({ length: 400 }, (_, i) => P[Math.floor(i * P.length / 400)]) : P;
  const pairs = [];
  let maxD = 0;
  for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
    const d = Math.hypot(S[i].x - S[j].x, S[i].y - S[j].y); maxD = Math.max(maxD, d);
    pairs.push([d, 0.5 * (S[i].z - S[j].z) ** 2]);
  }
  if (!pairs.length || maxD === 0) return { range: 1, sill: 1e-9, nugget: 0 };
  const nb = 15, sum = new Array(nb).fill(0), cnt = new Array(nb).fill(0), dm = new Array(nb).fill(0);
  const lim = maxD / 2;
  for (const [d, g] of pairs) { if (d > lim) continue; const b = Math.min(nb - 1, Math.floor(d / lim * nb)); sum[b] += g; cnt[b]++; dm[b] += d; }
  const bins = [];
  for (let b = 0; b < nb; b++) if (cnt[b]) bins.push({ h: dm[b] / cnt[b], g: sum[b] / cnt[b], n: cnt[b] });
  if (!bins.length) return { range: maxD, sill: 1e-9, nugget: 0 };
  let best = null;
  for (let r = 1; r <= 24; r++) {
    const range = lim * r / 16;
    const sh = (h) => (h >= range ? 1 : 1.5 * h / range - 0.5 * (h / range) ** 3);
    let num = 0, den = 0;
    for (const b of bins) { num += b.n * b.g * sh(b.h); den += b.n * sh(b.h) ** 2; }
    const sill = Math.max(den ? num / den : 0, 1e-12);
    let sse = 0;
    for (const b of bins) sse += b.n * (b.g - sill * sh(b.h)) ** 2;
    if (!best || sse < best.sse) best = { range, sill, sse };
  }
  return { range: best.range, sill: best.sill, nugget: 0 };
}

function est_kriging(P, ix, o, spacing, notes) {
  const v = fitVariogram(P), k = Math.min(P.length, o.neighbours || 16);
  notes.push({ code: 'kriging.variogram', range: v.range, sill: v.sill });
  const gam = (h) => (h <= 0 ? 0 : h >= v.range ? v.sill + v.nugget : v.nugget + v.sill * (1.5 * h / v.range - 0.5 * (h / v.range) ** 3));
  return (x, y) => {
    const near = ix.nearest(x, y, k);
    if (near[0].d < 1e-12) return { z: P[near[0].q].z, sigma: 0 };
    const n = near.length, A = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(1)), b = new Array(n + 1).fill(1);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) A[i][j] = gam(Math.hypot(P[near[i].q].x - P[near[j].q].x, P[near[i].q].y - P[near[j].q].y));
      A[i][i] = 0; b[i] = gam(near[i].d);
    }
    A[n][n] = 0;
    const w = solve(A, b);
    if (!w) return { z: P[near[0].q].z, sigma: NaN };
    let z = 0, s2 = w[n];
    for (let i = 0; i < n; i++) { z += w[i] * P[near[i].q].z; s2 += w[i] * b[i]; }
    return { z, sigma: Math.sqrt(Math.max(s2, 0)) };
  };
}

/** Data metrics: a statistic of the points near each node (a count of 0 is a real answer, so nothing is filled in). */
function est_metric(P, ix, o, spacing) {
  const R = o.radius > 0 ? o.radius : 2.5 * spacing, metric = o.metric;
  return (x, y) => {
    const near = ix.nearest(x, y, Math.min(P.length, 256)).filter((q) => q.d <= R).map((q) => P[q.q].z);
    const n = near.length;
    if (metric === 'count') return n;
    if (!n) return NaN;
    if (metric === 'mean') return near.reduce((a, b) => a + b, 0) / n;
    if (metric === 'min') return Math.min(...near);
    if (metric === 'max') return Math.max(...near);
    if (metric === 'range') return Math.max(...near) - Math.min(...near);
    const m = near.reduce((a, b) => a + b, 0) / n;   // std
    return Math.sqrt(near.reduce((a, b) => a + (b - m) ** 2, 0) / n);
  };
}

/** Natural neighbour interpolation with Laplace (non-Sibsonian) weights, from the Delaunay triangulation of the points. */
function est_natural(P, ix, o, spacing, notes) {
  const built = buildSurface({ points: P });
  const S = built.surface;
  if (!S) return null;
  const { X, Y, Z, tris, nT } = S;   // coordinates are offset by (S.ox, S.oy)
  const ox = S.ox, oy = S.oy;
  const cc = new Float64Array(nT * 3);   // circumcentre x, y, r²
  for (let t = 0; t < nT; t++) {
    const a = tris[t * 3], b = tris[t * 3 + 1], c = tris[t * 3 + 2];
    const d = 2 * (X[a] * (Y[b] - Y[c]) + X[b] * (Y[c] - Y[a]) + X[c] * (Y[a] - Y[b]));
    const a2 = X[a] ** 2 + Y[a] ** 2, b2 = X[b] ** 2 + Y[b] ** 2, c2 = X[c] ** 2 + Y[c] ** 2;
    const ux = (a2 * (Y[b] - Y[c]) + b2 * (Y[c] - Y[a]) + c2 * (Y[a] - Y[b])) / d, uy = (a2 * (X[c] - X[b]) + b2 * (X[a] - X[c]) + c2 * (X[b] - X[a])) / d;
    cc[t * 3] = ux; cc[t * 3 + 1] = uy; cc[t * 3 + 2] = (X[a] - ux) ** 2 + (Y[a] - uy) ** 2;
  }
  // hash triangles by the bounding box of their circumcircle; the few huge ones (slivers on the hull) are always tested
  const cell = Math.max(ix.cell * 2, 1e-9), bins = new Map(), big = [];
  for (let t = 0; t < nT; t++) {
    const r = Math.sqrt(cc[t * 3 + 2]);
    if (!(r < cell * 8)) { big.push(t); continue; }
    for (let j = Math.floor((cc[t * 3 + 1] - r) / cell); j <= Math.floor((cc[t * 3 + 1] + r) / cell); j++) for (let i = Math.floor((cc[t * 3] - r) / cell); i <= Math.floor((cc[t * 3] + r) / cell); i++) {
      const k = j * 100003 + i;
      (bins.get(k) || bins.set(k, []).get(k)).push(t);
    }
  }
  const circum = (qx, qy, ax, ay, bx, by) => {   // circumcentre of (q, a, b)
    const d = 2 * (qx * (ay - by) + ax * (by - qy) + bx * (qy - ay));
    const q2 = qx * qx + qy * qy, a2 = ax * ax + ay * ay, b2 = bx * bx + by * by;
    return [(q2 * (ay - by) + a2 * (by - qy) + b2 * (qy - ay)) / d, (q2 * (bx - ax) + a2 * (qx - bx) + b2 * (ax - qx)) / d];
  };
  return (px, py) => {
    const x = px - ox, y = py - oy;
    const cav = [];
    const test = (t) => { const dx = x - cc[t * 3], dy = y - cc[t * 3 + 1]; if (dx * dx + dy * dy < cc[t * 3 + 2]) cav.push(t); };
    for (const t of bins.get(Math.floor(y / cell) * 100003 + Math.floor(x / cell)) || []) test(t);
    for (const t of big) test(t);
    const fallback = () => { const n = ix.nearest(px, py, 1)[0]; return P[n.q].z; };
    if (!cav.length) return fallback();
    // boundary edges of the cavity: directed edges (CCW in their triangle) whose reverse is not also in the cavity
    const edges = new Map();
    for (const t of cav) for (let e = 0; e < 3; e++) { const a = tris[t * 3 + e], b = tris[t * 3 + (e + 1) % 3]; edges.set(a + ',' + b, [a, b]); }
    const bnd = [];
    for (const [k, [a, b]] of edges) if (!edges.has(b + ',' + a)) bnd.push([a, b]);
    const next = new Map(bnd.map(([a, b]) => [a, b]));
    if (next.size !== bnd.length || !bnd.length) return fallback();
    // walk the cycle
    const cyc = [bnd[0][0]];
    for (let v = next.get(cyc[0]); v !== undefined && v !== cyc[0]; v = next.get(v)) { cyc.push(v); if (cyc.length > bnd.length) return fallback(); }
    if (cyc.length !== bnd.length) return fallback();
    const n = cyc.length, cen = cyc.map((a, i) => circum(x, y, X[a], Y[a], X[cyc[(i + 1) % n]], Y[cyc[(i + 1) % n]]));
    let sw = 0, sz = 0;
    for (let i = 0; i < n; i++) {
      const a = cyc[i], dist = Math.hypot(X[a] - x, Y[a] - y);
      if (dist < 1e-12) return Z[a];
      const c0 = cen[(i - 1 + n) % n], c1 = cen[i];   // the Voronoi edge between the node and a joins these two circumcentres
      const w = Math.hypot(c1[0] - c0[0], c1[1] - c0[1]) / dist;
      if (!Number.isFinite(w)) return fallback();
      sw += w; sz += w * Z[a];
    }
    return sw > 0 ? sz / sw : fallback();
  };
}

// ---------------------------------------------------------------------------

export function gridSurface(points, opts = {}) {
  const notes = [];
  const method = opts.method;
  const def = METHODS.find((m) => m.key === method);
  if (!def) return { error: 'method', notes };
  const P = (points || []).filter((p) => p && finite(p.x) && finite(p.y) && finite(p.z));
  if (P.length < 3) return { error: 'few', notes };
  // a node can have only one value: points at the same x, y are averaged
  const byXY = new Map();
  for (const p of P) { const k = p.x + ',' + p.y; const e = byXY.get(k); if (e) { e.s += p.z; e.n++; } else byXY.set(k, { x: p.x, y: p.y, s: p.z, n: 1 }); }
  const dupes = P.length - byXY.size;
  if (dupes) notes.push({ code: 'dupes', n: dupes });
  let cx = 0, cy = 0;
  for (const e of byXY.values()) { cx += e.x; cy += e.y; }
  cx /= byXY.size; cy /= byXY.size;
  const C = [...byXY.values()].map((e) => ({ x: e.x - cx, y: e.y - cy, z: e.s / e.n }));   // centred, so polynomial and RBF sums stay accurate
  if (C.length < 3) return { error: 'few', notes };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of C) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const bounds = { minX, minY, maxX, maxY }, w = maxX - minX, h = maxY - minY;
  if (!(w > 0 && h > 0)) return { error: 'flat', notes };
  const hull = convexHull(C.map((p) => ({ x: p.x, y: p.y })));
  if (hull.length < 3 || polyArea2(hull) < 1e-9 * w * h) return { error: 'flat', notes };   // all in a line
  const spacing = Math.sqrt(polyArea2(hull) / C.length) || Math.max(w, h) / 10;   // mean spacing if the points were spread evenly
  // breaklines: their vertices, and points along each piece every half a spacing, join the data at their own heights
  let lineAdded = 0;
  if (Array.isArray(opts.lines) && !def.metric && method !== 'krigerr') {
    const gap = Math.max(opts.step > 0 ? opts.step : spacing / 2, 1e-9), seen = new Set(C.map((p) => p.x + ',' + p.y));
    for (const ln of opts.lines) {
      const L = (ln || []).filter((q) => q && finite(q.x) && finite(q.y) && finite(q.z));
      for (let i = 0; i < L.length; i++) {
        const a = L[i], b = L[i + 1], pieces = b ? Math.max(1, Math.min(2000, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / gap))) : 1;
        for (let k = 0; k < (b ? pieces : 1); k++) {
          const f = k / pieces, q = { x: a.x + (b ? (b.x - a.x) * f : 0) - cx, y: a.y + (b ? (b.y - a.y) * f : 0) - cy, z: a.z + (b ? (b.z - a.z) * f : 0) };
          const key = q.x + ',' + q.y;
          if (!seen.has(key)) { seen.add(key); C.push(q); lineAdded++; }
        }
      }
    }
    if (lineAdded) {
      notes.push({ code: 'lines', n: lineAdded });
      for (const p of C) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
      bounds.minX = minX; bounds.minY = minY; bounds.maxX = maxX; bounds.maxY = maxY;
    }
  }
  const w2 = maxX - minX, h2 = maxY - minY;
  const hull2 = lineAdded ? convexHull(C.map((p) => ({ x: p.x, y: p.y }))) : hull;

  // grid spacing: the caller's, else about 2 nodes per mean point spacing, limited so there are at most maxNodes nodes
  const cap = Math.min(opts.maxNodes || MAX_NODES, NODE_CAP[method] || MAX_NODES);
  let step = opts.step > 0 ? opts.step : spacing / 2;
  const nodes = (s) => (Math.floor(w2 / s) + 2) * (Math.floor(h2 / s) + 2);
  if (nodes(step) > cap) { const was = step; while (nodes(step) > cap) step *= 1.05; notes.push({ code: 'step.raised', from: was, to: step, nodes: nodes(step) }); }
  const nx = Math.floor(w2 / step) + 2, ny = Math.floor(h2 / step) + 2;
  const x0 = minX - (nx * step - w2) / 2, y0 = minY - (ny * step - h2) / 2;

  const ix = makeIndex(C, bounds);
  const make = def.metric ? est_metric : method === 'krigerr' ? est_kriging : { idw: est_idw, nearest: est_nearest, movavg: est_movavg, shepard: est_shepard, natural: est_natural, polyreg: est_polyreg, localpoly: est_localpoly, rbf: est_rbf, mincurv: null, kriging: est_kriging }[method];
  const z = new Float64Array(nx * ny).fill(NaN);
  const inside = new Uint8Array(nx * ny);
  const bnd = Array.isArray(opts.boundary) && opts.boundary.length >= 3 ? opts.boundary.filter((q) => q && finite(q.x) && finite(q.y)).map((q) => ({ x: q.x - cx, y: q.y - cy })) : null;
  if (bnd && bnd.length >= 3) notes.push({ code: 'boundary', n: bnd.length });
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) inside[j * nx + i] = pointInPoly(x0 + i * step, y0 + j * step, hull2) && (!bnd || pointInPoly(x0 + i * step, y0 + j * step, bnd)) ? 1 : 0;
  let sigma = null;
  if (method === 'mincurv') minCurv(C, { nx, ny, x0, y0, step, inside, z }, notes);
  else {
    const f0 = make(C, ix, def.metric ? { ...opts, metric: def.metric } : opts, spacing, notes);
    if (!f0) return { error: 'fit', notes };
    const f = method === 'krigerr' ? (x, y) => { const r = f0(x, y); return r.sigma; } : f0;
    if (method === 'kriging') sigma = new Float64Array(nx * ny).fill(NaN);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      if (!inside[j * nx + i]) continue;
      const r = f(x0 + i * step, y0 + j * step);
      if (r && typeof r === 'object') { z[j * nx + i] = r.z; sigma[j * nx + i] = r.sigma; } else z[j * nx + i] = r;
    }
  }
  // points and triangles (two per cell, split along the diagonal that is flatter in z); nodes outside the hull are left out
  const idx = new Int32Array(nx * ny).fill(-1), pts = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) if (inside[j * nx + i] && Number.isFinite(z[j * nx + i])) { idx[j * nx + i] = pts.length; pts.push({ x: x0 + i * step + cx, y: y0 + j * step + cy, z: z[j * nx + i] }); }
  const faces = [];
  for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
    const a = idx[j * nx + i], b = idx[j * nx + i + 1], c = idx[(j + 1) * nx + i + 1], d = idx[(j + 1) * nx + i];
    if (a < 0 || b < 0 || c < 0 || d < 0) continue;
    if (Math.abs(pts[a].z - pts[c].z) <= Math.abs(pts[b].z - pts[d].z)) faces.push([a, b, c], [a, c, d]); else faces.push([a, b, d], [b, c, d]);
  }
  if (!faces.length) return { error: 'nofaces', notes };
  // residuals: grid value (bilinear) minus the data value, at every data point
  const at = (x, y) => {
    const fx = (x - x0) / step, fy = (y - y0) / step, i = Math.min(nx - 2, Math.max(0, Math.floor(fx))), j = Math.min(ny - 2, Math.max(0, Math.floor(fy)));
    const tx = fx - i, ty = fy - j, v = [z[j * nx + i], z[j * nx + i + 1], z[(j + 1) * nx + i], z[(j + 1) * nx + i + 1]];
    if (v.some((q) => !Number.isFinite(q))) return NaN;
    return v[0] * (1 - tx) * (1 - ty) + v[1] * tx * (1 - ty) + v[2] * (1 - tx) * ty + v[3] * tx * ty;
  };
  let ss = 0, mx = 0, n = 0;
  for (const p of C) { const g = at(p.x, p.y); if (!Number.isFinite(g)) continue; const r = g - p.z; ss += r * r; mx = Math.max(mx, Math.abs(r)); n++; }
  return { pts, faces, grid: { nx, ny, x0: x0 + cx, y0: y0 + cy, step, z }, sigma, residuals: { rms: n ? Math.sqrt(ss / n) : NaN, max: mx, n }, notes, method, step };
}

function polyArea2(h) { let a = 0; for (let i = 0; i < h.length; i++) { const p = h[i], q = h[(i + 1) % h.length]; a += p.x * q.y - q.x * p.y; } return Math.abs(a) / 2; }

/** Minimum curvature (Briggs): data pinned at their nearest nodes, the rest relaxed toward ∇⁴z = 0, starting from an IDW fill. */
function minCurv(C, G, notes) {
  const { nx, ny, x0, y0, step, inside, z } = G;
  const pin = new Float64Array(nx * ny).fill(NaN), cnt = new Uint16Array(nx * ny);
  for (const p of C) {
    const i = Math.min(nx - 1, Math.max(0, Math.round((p.x - x0) / step))), j = Math.min(ny - 1, Math.max(0, Math.round((p.y - y0) / step))), k = j * nx + i;
    pin[k] = Number.isNaN(pin[k]) ? p.z : pin[k] + p.z; cnt[k]++;
  }
  for (let k = 0; k < pin.length; k++) if (cnt[k] > 1) pin[k] /= cnt[k];
  const ix = makeIndex(C, { minX: Math.min(...C.map((p) => p.x)), minY: Math.min(...C.map((p) => p.y)), maxX: Math.max(...C.map((p) => p.x)), maxY: Math.max(...C.map((p) => p.y)) });
  const f = est_idw(C, ix, { power: 2, neighbours: 8 });
  const v = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = Number.isNaN(pin[j * nx + i]) ? f(x0 + i * step, y0 + j * step) : pin[j * nx + i];
  const g = (i, j) => v[Math.min(ny - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))];
  let it = 0, delta = Infinity;
  const tol = 1e-5 * (Math.max(...C.map((p) => p.z)) - Math.min(...C.map((p) => p.z)) || 1);
  for (; it < 3000 && delta > tol; it++) {
    delta = 0;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      if (!Number.isNaN(pin[k])) continue;
      const nz = (8 * (g(i - 1, j) + g(i + 1, j) + g(i, j - 1) + g(i, j + 1)) - 2 * (g(i - 1, j - 1) + g(i + 1, j - 1) + g(i - 1, j + 1) + g(i + 1, j + 1)) - (g(i - 2, j) + g(i + 2, j) + g(i, j - 2) + g(i, j + 2))) / 20;
      delta = Math.max(delta, Math.abs(nz - v[k])); v[k] = v[k] + 0.9 * (nz - v[k]);
    }
  }
  notes.push({ code: 'mincurv.iter', n: it, converged: delta <= tol });
  for (let k = 0; k < v.length; k++) if (inside[k]) z[k] = v[k];
}
