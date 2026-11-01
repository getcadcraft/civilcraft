/* SPDX-License-Identifier: Apache-2.0 */
/**
 * measure.js — checks and numbers on a triangle mesh { positions, indices } (0.8 CE.1). Exact, no tolerances except where said.
 */
/** Signed volume (divergence theorem, sum of tetrahedra to the origin), in double precision, in index order. Positive for outward winding. */
export function meshVolume(m) {
  const P = m.positions, I = m.indices; let v = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    v += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]);
  }
  return v / 6;
}
export function meshArea(m) {
  const P = m.positions, I = m.indices; let s = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
    s += Math.sqrt(x * x + y * y + z * z) / 2;
  }
  return s;
}
/**
 * Topology of the mesh as indexed: { closed (every edge in exactly two triangles, one each way), edgeManifold, vertexManifold
 * (every vertex's triangles form one fan), boundaryEdges, nonManifoldEdges, nonManifoldVertices, flippedEdges, components,
 * degenerate (triangles with a repeated index), euler }. A watertight manifold mesh has all four of the first three true.
 */
export function meshTopology(m) {
  const I = m.indices, nv = m.positions.length / 3, nt = I.length / 3;
  const edges = new Map();
  let degenerate = 0;
  for (let t = 0; t < nt; t++) {
    const v = [I[t * 3], I[t * 3 + 1], I[t * 3 + 2]];
    if (v[0] === v[1] || v[1] === v[2] || v[2] === v[0]) { degenerate++; continue; }
    for (let q = 0; q < 3; q++) {
      const a = v[q], b = v[(q + 1) % 3], lo = a < b ? a : b, hi = a < b ? b : a, k = lo * 4294967296 + hi;
      let e = edges.get(k); if (!e) edges.set(k, (e = { fwd: 0, bwd: 0 }));
      if (a < b) e.fwd++; else e.bwd++;
    }
  }
  let boundary = 0, nonManifold = 0, flipped = 0;
  for (const e of edges.values()) { const n = e.fwd + e.bwd; if (n === 1) boundary++; else if (n > 2) nonManifold++; else if (e.fwd !== 1) flipped++; }
  // vertex fans: triangles around a vertex must connect through shared edges into one piece
  const around = new Map();
  for (let t = 0; t < nt; t++) for (let q = 0; q < 3; q++) { const v = I[t * 3 + q]; let l = around.get(v); if (!l) around.set(v, (l = [])); l.push(t); }
  let badVerts = 0;
  for (const [v, ts] of around) {
    const parent = new Map(ts.map((t) => [t, t]));
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const byNeighbour = new Map();
    for (const t of ts) for (let q = 0; q < 3; q++) { const w = I[t * 3 + q]; if (w === v) continue; const l = byNeighbour.get(w); if (l !== undefined) { const a = find(l), b = find(t); if (a !== b) parent.set(a, b); } else byNeighbour.set(w, t); }
    const roots = new Set(ts.map(find));
    if (roots.size > 1) badVerts++;
  }
  // connected components over shared vertices
  const par = new Int32Array(nv).map((_, i) => i);
  const fnd = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let t = 0; t < nt; t++) { const a = fnd(I[t * 3]), b = fnd(I[t * 3 + 1]), c = fnd(I[t * 3 + 2]); par[b] = a; par[fnd(c)] = fnd(a); }
  const comps = new Set(); for (const v of around.keys()) comps.add(fnd(v));
  const used = around.size;
  return {
    closed: boundary === 0 && nonManifold === 0 && flipped === 0 && degenerate === 0, edgeManifold: nonManifold === 0 && flipped === 0,
    vertexManifold: badVerts === 0, boundaryEdges: boundary, nonManifoldEdges: nonManifold, nonManifoldVertices: badVerts, flippedEdges: flipped,
    components: comps.size, degenerate, euler: used - edges.size + nt,
  };
}
