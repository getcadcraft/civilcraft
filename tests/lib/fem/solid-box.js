/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid-box.js — structured quadratic-tetrahedron meshes in the form solid-study.js reads (0.9 SU.908c): a block (boxSolid) and a quarter ring
 * (quarterRing). Each cell is split into six tets around its 0-6 diagonal (the same diagonal in every cell, so neighbours agree: the Kuhn
 * subdivision); midside nodes sit at the chord midpoint (block) or at the polar mean (ring, so arcs and radial lines are exact). Used by the tests
 * and by hosts that have no mesher of their own for a simple block. Not a mesher for general parts.
 *   boxSolid(Lx, Ly, Lz, nx, ny, nz, warp?)  faces: 0 x=0, 1 x=Lx, 2 y=0, 3 y=Ly, 4 z=0, 5 z=Lz
 *   quarterRing(a, b, h, nr, nth)            faces: 0 inner r=a, 1 outer r=b, 2 y=0, 3 x=0, 4 z=0, 5 z=h
 *   fromTets(points, tets, mid, classify) → mesh { nodes, tets10, btri6, bface }
 */
const EDGE = [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]];
const HEX = [[0, 1, 2, 6], [0, 2, 3, 6], [0, 3, 7, 6], [0, 7, 4, 6], [0, 4, 5, 6], [0, 5, 1, 6]];
const vol = (p, t) => { const a = p[t[0]], b = p[t[1]], c = p[t[2]], d = p[t[3]], u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], w = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]; return (u[0] * (v[1] * w[2] - v[2] * w[1]) - u[1] * (v[0] * w[2] - v[2] * w[0]) + u[2] * (v[0] * w[1] - v[1] * w[0])) / 6; };
const mid3 = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];

export function fromTets(pts, tets, mid, classify) {
  const nodes = pts.map((p) => p.slice()), mids = new Map(), t10 = [], faces = new Map();
  const key = (a, b) => Math.min(a, b) * 1e7 + Math.max(a, b);
  for (const t of tets) {
    const n = [...t];
    for (const [i, j] of EDGE) { const k = key(t[i], t[j]); if (!mids.has(k)) { mids.set(k, nodes.length); nodes.push(mid(nodes[t[i]], nodes[t[j]])); } n.push(mids.get(k)); }
    t10.push(n);
    for (const [f, opp] of [[[0, 1, 2], 3], [[0, 1, 3], 2], [[0, 2, 3], 1], [[1, 2, 3], 0]]) {
      const c = f.map((q) => t[q]), k = [...c].sort((x, y) => x - y).join(',');
      faces.set(k, faces.has(k) ? null : { c, opp: t[opp] });
    }
  }
  const btri = [], bface = [];
  for (const f of faces.values()) {
    if (!f) continue;
    let [a, b, c] = f.c;
    const pa = nodes[a], pb = nodes[b], pc = nodes[c], u = pb.map((v, d) => v - pa[d]), v = pc.map((x, d) => x - pa[d]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], o = nodes[f.opp];
    if (n[0] * (o[0] - pa[0]) + n[1] * (o[1] - pa[1]) + n[2] * (o[2] - pa[2]) > 0) [b, c] = [c, b];   // outward
    btri.push(a, b, c, mids.get(key(a, b)), mids.get(key(b, c)), mids.get(key(c, a)));
    bface.push(classify([nodes[a], nodes[b], nodes[c]]));
  }
  return { nodes: Float64Array.from(nodes.flat()), tets10: Int32Array.from(t10.flat()), btri6: Int32Array.from(btri), bface: Int32Array.from(bface) };
}
function cells(pts, id, nx, ny, nz) {
  const tets = [];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = [id(i, j, k), id(i + 1, j, k), id(i + 1, j + 1, k), id(i, j + 1, k), id(i, j, k + 1), id(i + 1, j, k + 1), id(i + 1, j + 1, k + 1), id(i, j + 1, k + 1)];
    for (const q of HEX) { const t = q.map((s) => c[s]); tets.push(vol(pts, t) < 0 ? [t[0], t[2], t[1], t[3]] : t); }
  }
  return tets;
}
export function boxSolid(Lx, Ly, Lz, nx, ny, nz, warp = null) {
  const pts = [], id = (i, j, k) => (k * (ny + 1) + j) * (nx + 1) + i, e = 1e-9;
  for (let k = 0; k <= nz; k++) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) pts.push([Lx * i / nx, Ly * j / ny, Lz * k / nz]);
  if (warp) for (const p of pts) warp(p);
  const on = (c, d, v) => c.every((p) => Math.abs(p[d] - v) < e);
  return fromTets(pts, cells(pts, id, nx, ny, nz), mid3, (c) => (on(c, 0, 0) ? 0 : on(c, 0, Lx) ? 1 : on(c, 1, 0) ? 2 : on(c, 1, Ly) ? 3 : on(c, 2, 0) ? 4 : on(c, 2, Lz) ? 5 : -1));
}
export function quarterRing(a, b, h, nr, nth) {
  const pts = [], id = (i, j, k) => (k * (nth + 1) + j) * (nr + 1) + i, th = Math.PI / 2, e = 1e-9;
  for (let k = 0; k <= 1; k++) for (let j = 0; j <= nth; j++) for (let i = 0; i <= nr; i++) { const r = a + (b - a) * i / nr, q = th * j / nth; pts.push([r * Math.cos(q), r * Math.sin(q), h * k]); }
  const polar = (p1, p2) => { const r = (Math.hypot(p1[0], p1[1]) + Math.hypot(p2[0], p2[1])) / 2, q = (Math.atan2(p1[1], p1[0]) + Math.atan2(p2[1], p2[0])) / 2; return [r * Math.cos(q), r * Math.sin(q), (p1[2] + p2[2]) / 2]; };
  const rr = (c, v) => c.every((p) => Math.abs(Math.hypot(p[0], p[1]) - v) < e);
  return fromTets(pts, cells(pts, id, nr, nth, 1), polar, (c) => (rr(c, a) ? 0 : rr(c, b) ? 1 : c.every((p) => Math.abs(p[1]) < e) ? 2 : c.every((p) => Math.abs(p[0]) < e) ? 3 : c.every((p) => Math.abs(p[2]) < e) ? 4 : c.every((p) => Math.abs(p[2] - h) < e) ? 5 : -1));
}
