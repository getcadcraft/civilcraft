/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cage.js — SubD cages that are exact NURBS (0.9 D9.8, option A of docs/0.9-sessions/subd-nurbs-09.md). No DOM, no strings.
 *
 * Where every vertex of a quad cage has four edges, the Catmull–Clark limit surface IS a uniform bicubic B-spline surface:
 * the cage points are its control points. Nothing is converted or fitted. At a vertex with a different number of edges (a
 * corner of a cube, a pole) the limit is not a finite set of NURBS patches, so those quads are LEFT OUT and reported
 * (`pending`); they wait for option B in the write-up. Textbook B-spline maths (de Boor; the Catmull–Clark regular-patch
 * result is in Catmull and Clark 1978 and every subdivision text); no code from any other program.
 *
 *   gridToSurface(grid, { ends: 'open' | 'clamped' }) → surface   grid[i][j] = [x, y, z], i along u, j along v, ≥ 4 × 4
 *       'open'    the surface is the Catmull–Clark limit over the inner (n−3) × (m−3) quads of the grid, the outer ring of
 *                 points only shapes it (it does not reach them); stored as the clamped surface with the same spans
 *       'clamped' knots repeated at the ends: the surface runs from the first row/column to the last (an end-interpolating
 *                 B-spline; the cage's border behaves as a cubic curve end, not as the Catmull–Clark boundary rule)
 *   quadMeshToSurfaces({ verts, quads }) → { patches:[{ quad, surface }], pending:[{ quad, why }], interior }
 *       one single-span bicubic surface (Bézier form, exact) per quad whose four corners all have four edges and whose
 *       whole 4 × 4 neighbourhood exists; `pending` says why a quad was left out ('boundary' | 'valence' | 'open')
 *   catmullClarkGrid(grid) → grid'            one Catmull–Clark step of a regular grid (interior rules; the border is held
 *       by reflecting the grid: n × m → (2n − 1) × (2m − 1)); for tests and for refining a cage
 *   limitPoint(g, i, j) → [x, y, z]           the limit position of the regular vertex g[i][j]: (16 v + 4 Σ edges + Σ diagonals) / 36
 *
 * What is NOT here: creases (a full crease is a repeated knot and fits NURBS exactly; a partial crease does not, and is not
 * done), the border rule of Catmull–Clark, cages with extraordinary vertices.
 */
import * as S from './surface.js';
import { fail } from './curve.js';
import { findSpan, basisFuns, greville } from './basis.js';

const add = (a, b, k = 1) => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const finite3 = (p) => Array.isArray(p) && p.length === 3 && p.every((x) => typeof x === 'number' && Number.isFinite(x));

function cleanGrid(grid) {
  if (!Array.isArray(grid) || grid.length < 4 || !Array.isArray(grid[0]) || grid[0].length < 4) fail('nurbs.err.cv_count', { min: 4 });
  const m = grid[0].length;
  return grid.map((row) => {
    if (!Array.isArray(row) || row.length !== m) fail('nurbs.err.cv_grid');
    return row.map((p) => { if (!finite3(p)) fail('nurbs.err.cv_value'); return p.slice(); });
  });
}

const clampedKnots = (n) => { const k = [0, 0, 0, 0]; for (let i = 1; i < n - 3; i++) k.push(i); const e = n - 3; return [...k, e, e, e, e]; };

/** The uniform cubic B-spline (knots …, −1, 0, 1, 2, …) with control points c, at u in [0, n − 3]. */
function uniformAt(c, u) {
  const n = c.length, i = Math.min(Math.floor(u), n - 4), t = u - i;
  const b = [(1 - t) ** 3 / 6, (3 * t ** 3 - 6 * t ** 2 + 4) / 6, (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6, t ** 3 / 6];
  let p = [0, 0, 0];
  for (let k = 0; k < 4; k++) p = add(p, c[i + k], b[k]);
  return p;
}

/**
 * The same curve as clamped control points (the library keeps every surface clamped): the clamped B-spline with the same
 * spans passes through the uniform one's values at its Greville points, which fixes its n control points exactly.
 */
function toClamped(c) {
  const n = c.length, U = clampedKnots(n), gre = greville(U, 3, n);
  const A = Array.from({ length: n }, () => new Array(n).fill(0)), rhs = gre.map((u) => uniformAt(c, Math.min(Math.max(u, 0), n - 3)));
  gre.forEach((u, r) => { const span = findSpan(n - 1, 3, u, U), N = basisFuns(span, u, 3, U); for (let k = 0; k <= 3; k++) A[r][span - 3 + k] = N[k]; });
  const out = Array.from({ length: n }, () => [0, 0, 0]);
  for (let d = 0; d < 3; d++) {   // one solve per coordinate (dense elimination with pivoting; n is the cage size)
    const M = A.map((row, r) => [...row, rhs[r][d]]);
    for (let i = 0; i < n; i++) {
      let pv = i;
      for (let r = i + 1; r < n; r++) if (Math.abs(M[r][i]) > Math.abs(M[pv][i])) pv = r;
      [M[i], M[pv]] = [M[pv], M[i]];
      for (let r = i + 1; r < n; r++) { const f = M[r][i] / M[i][i]; if (f) for (let k = i; k <= n; k++) M[r][k] -= f * M[i][k]; }
    }
    for (let i = n - 1; i >= 0; i--) { let v = M[i][n]; for (let k = i + 1; k < n; k++) v -= M[i][k] * out[k][d]; out[i][d] = v / M[i][i]; }
  }
  return out;
}

export function gridToSurface(grid, { ends = 'open' } = {}) {
  const g = cleanGrid(grid), n = g.length, m = g[0].length;
  let cvs = g;
  if (ends !== 'clamped') {   // the exact Catmull–Clark limit over the inner quads, written as a clamped surface
    const rows = g.map((row) => toClamped(row));                     // along v
    const cols = Array.from({ length: m }, (_, j) => toClamped(rows.map((r) => r[j])));   // along u
    cvs = Array.from({ length: n }, (_, i) => cols.map((c) => c[i]));
  }
  return S.cleanSurface({ degU: 3, degV: 3, knotsU: clampedKnots(n), knotsV: clampedKnots(m), cvs, w: null });
}

export function limitPoint(g, i, j) {
  let p = scale(g[i][j], 16);
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p = add(p, g[i + a][j + b], 4);
  for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) p = add(p, g[i + a][j + b], 1);
  return scale(p, 1 / 36);
}

export function catmullClarkGrid(grid) {
  const g = cleanGrid(grid), n = g.length, m = g[0].length;
  const at = (i, j) => g[Math.min(n - 1, Math.max(0, i))][Math.min(m - 1, Math.max(0, j))];   // the border is held by repeating the edge row
  const N = 2 * n - 1, M = 2 * m - 1, out = Array.from({ length: N }, () => new Array(M));
  // on a regular grid Catmull–Clark is knot insertion on the uniform cubic B-spline, one direction at a time: even point
  // (c[i−1] + 6 c[i] + c[i+1]) / 8, odd point (c[i] + c[i+1]) / 2. Tensor products of those give the three rules:
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {   // vertex point: (36 v + 6 Σ edge neighbours + Σ diagonal neighbours) / 64
    let p = scale(at(i, j), 36);
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) p = add(p, at(i + a, j + b), 6);
    for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) p = add(p, at(i + a, j + b), 1);
    out[2 * i][2 * j] = scale(p, 1 / 64);
  }
  for (let i = 0; i < n; i++) for (let j = 0; j + 1 < m; j++) {   // edge point along v: (6 a + 6 b + the four points either side) / 16
    let p = scale(add(at(i, j), at(i, j + 1)), 6);
    for (const a of [1, -1]) p = add(add(p, at(i + a, j)), at(i + a, j + 1));
    out[2 * i][2 * j + 1] = scale(p, 1 / 16);
  }
  for (let i = 0; i + 1 < n; i++) for (let j = 0; j < m; j++) {   // edge point along u
    let p = scale(add(at(i, j), at(i + 1, j)), 6);
    for (const b of [1, -1]) p = add(add(p, at(i, j + b)), at(i + 1, j + b));
    out[2 * i + 1][2 * j] = scale(p, 1 / 16);
  }
  for (let i = 0; i + 1 < n; i++) for (let j = 0; j + 1 < m; j++) {   // face point: the average of its four corners
    out[2 * i + 1][2 * j + 1] = scale(add(add(at(i, j), at(i + 1, j)), add(at(i, j + 1), at(i + 1, j + 1))), 0.25);
  }
  return out;
}

/** The cubic B-spline segment with control points c0…c3 as a Bézier segment: (c0 + 4 c1 + c2)/6, (2 c1 + c2)/3, (c1 + 2 c2)/3, (c1 + 4 c2 + c3)/6. */
function bezierOf(c) {
  const a = (p, q, r, s, wp, wq, wr, ws) => scale(add(add(scale(p, wp), scale(q, wq)), add(scale(r, wr), scale(s, ws))), 1 / (wp + wq + wr + ws));
  return [a(c[0], c[1], c[2], c[3], 1, 4, 1, 0), a(c[0], c[1], c[2], c[3], 0, 2, 1, 0), a(c[0], c[1], c[2], c[3], 0, 1, 2, 0), a(c[0], c[1], c[2], c[3], 0, 1, 4, 1)];
}

export function quadMeshToSurfaces(mesh) {
  const V = mesh?.verts, Q = mesh?.quads;
  if (!Array.isArray(V) || !Array.isArray(Q)) fail('nurbs.err.cv_grid');
  V.forEach((p) => { if (!finite3(p)) fail('nurbs.err.cv_value'); });
  Q.forEach((q) => { if (!Array.isArray(q) || q.length !== 4 || q.some((i) => !Number.isInteger(i) || i < 0 || i >= V.length) || new Set(q).size !== 4) fail('nurbs.err.cv_grid'); });
  const around = V.map(() => []), edge = new Map();
  Q.forEach((q, qi) => q.forEach((v, k) => {
    around[v].push(qi);
    const w = q[(k + 1) % 4], key = Math.min(v, w) + ',' + Math.max(v, w);
    (edge.get(key) || edge.set(key, []).get(key)).push(qi);
  }));
  const neighbours = V.map(() => new Set());
  Q.forEach((q) => q.forEach((v, k) => { neighbours[v].add(q[(k + 1) % 4]); neighbours[v].add(q[(k + 3) % 4]); }));
  const border = V.map(() => false);
  for (const [key, qs] of edge) if (qs.length === 1) { const [a, b] = key.split(',').map(Number); border[a] = border[b] = true; }
  const regular = (v) => !border[v] && neighbours[v].size === 4 && around[v].length === 4;
  // the quad across the directed edge a → b (the other quad that has the edge), returned rotated so it reads [b, a, p, q]
  const across = (qi, a, b) => {
    const qs = edge.get(Math.min(a, b) + ',' + Math.max(a, b)) || [];
    const other = qs.find((x) => x !== qi);
    if (other === undefined || qs.length !== 2) return null;
    const q = Q[other], k = q.indexOf(b);
    if (q[(k + 1) % 4] !== a) return null;   // the neighbour runs the other way: the mesh is not consistently oriented
    return [0, 1, 2, 3].map((d) => q[(k + d) % 4]);
  };
  const fourth = (a, e1, e2, not) => {   // the quad at vertex a that has e1 and e2, other than those in `not`: its last vertex
    for (const qi of around[a]) { if (not.includes(qi)) continue; const q = Q[qi]; if (q.includes(e1) && q.includes(e2)) return q.find((x) => x !== a && x !== e1 && x !== e2); }
    return null;
  };
  const patches = [], pending = [];
  Q.forEach((q, qi) => {
    const [A, B, C, D] = q;
    if (!q.every((v) => !border[v])) { pending.push({ quad: qi, why: 'boundary' }); return; }
    if (!q.every(regular)) { pending.push({ quad: qi, why: 'valence' }); return; }
    const T = across(qi, A, B), R = across(qi, B, C), Bt = across(qi, C, D), L = across(qi, D, A);
    if (!T || !R || !Bt || !L) { pending.push({ quad: qi, why: 'open' }); return; }
    const used = [qi];
    const id = [[null, null, null, null], [null, A, B, null], [null, D, C, null], [null, null, null, null]];   // id[row][col]
    id[0][1] = T[2]; id[0][2] = T[3]; id[1][3] = R[2]; id[2][3] = R[3]; id[3][2] = Bt[2]; id[3][1] = Bt[3]; id[2][0] = L[2]; id[1][0] = L[3];
    id[0][0] = fourth(A, T[2], L[3], used); id[0][3] = fourth(B, T[3], R[2], used); id[3][3] = fourth(C, R[3], Bt[2], used); id[3][0] = fourth(D, Bt[3], L[2], used);
    if (id.flat().some((x) => x === null || x === undefined)) { pending.push({ quad: qi, why: 'open' }); return; }
    const P = id.map((row) => row.map((v) => V[v]));
    // Bézier form per direction: rows (u) first, then columns (v)
    const rows = P.map((row) => bezierOf(row));
    const cvs = [0, 1, 2, 3].map((c) => bezierOf(rows.map((r) => r[c])));   // cvs[c][r] → transpose to [r][c]
    const grid = [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => cvs[c][r]));
    patches.push({ quad: qi, surface: S.cleanSurface({ degU: 3, degV: 3, knotsU: [0, 0, 0, 0, 1, 1, 1, 1], knotsV: [0, 0, 0, 0, 1, 1, 1, 1], cvs: grid, w: null }) });
  });
  return { patches, pending, interior: Q.length - pending.filter((p) => p.why === 'boundary').length };
}
