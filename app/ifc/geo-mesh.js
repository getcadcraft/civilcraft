/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library. */
/**
 * geo-mesh.js — the triangle mesh cc-ifc builds every representation item into. Vertices carry a normal; a planar face
 * keeps its own vertices (its normal), so edges between faces stay sharp.
 *
 *   const m = new Mesh()
 *   m.polygon(rings3d)            one planar face: [outer, ...holes] of [x, y, z]; triangulated; normal from the outer ring
 *   m.tri(a, b, c)                one triangle (flat normal)
 *   m.addIndexed(pos, idx, nrm?)  triangles over a shared point list (normals per vertex, or flat when absent)
 *   m.append(other, matrix?)      another mesh, moved (normals by the inverse transpose; a mirror flips the winding)
 *   m.transform(matrix)  m.flip()  m.bounds()  m.volume()  m.triangles  m.isEmpty
 *   m.welded(eps) → { pos, idx }  shared vertices (for booleans)
 *   Mesh.fromWelded(pos, idx)     back from a boolean result (flat normals)
 *   m.interleaved() → { vertices: Float32Array [x y z nx ny nz …], indices: Uint32Array }
 */

import { newell, invert, det3, norm, cross, sub } from './geo-math.js';
import { planeTriangulate } from './geo-tri.js';

export class Mesh {
  constructor() { this.pos = []; this.nrm = []; this.idx = []; }

  get vertexCount() { return this.pos.length / 3; }
  get triangles() { return this.idx.length / 3; }
  get isEmpty() { return this.idx.length === 0; }

  vertex(p, n) { this.pos.push(p[0], p[1], p[2]); this.nrm.push(n[0], n[1], n[2]); return this.pos.length / 3 - 1; }

  tri(a, b, c) {
    const n = norm(cross(sub(b, a), sub(c, a)));
    const i = this.vertex(a, n), j = this.vertex(b, n), k = this.vertex(c, n);
    this.idx.push(i, j, k);
  }

  /** A planar face with holes; nothing for fewer than three points. Returns the number of triangles added. */
  polygon(rings) {
    const r = rings.filter((x) => x && x.length >= 3);
    if (!r.length || r[0] !== rings[0]) return 0;
    if (r.length === 1 && r[0].length === 3) { this.tri(r[0][0], r[0][1], r[0][2]); return 1; }
    const n = norm(newell(r[0]));
    if (!n[0] && !n[1] && !n[2]) return 0;
    const tris = planeTriangulate(r);
    if (!tris.length) return 0;
    const base = this.vertexCount;
    for (const ring of r) for (const p of ring) this.vertex(p, n);
    for (const k of tris) this.idx.push(base + k);
    return tris.length / 3;
  }

  addIndexed(pos, idx, nrm = null) {
    if (nrm) {
      const base = this.vertexCount;
      for (let i = 0; i < pos.length; i++) this.vertex(pos[i], nrm[i] || [0, 0, 1]);
      for (const k of idx) this.idx.push(base + k);
      return;
    }
    for (let i = 0; i + 2 < idx.length; i += 3) {
      const a = pos[idx[i]], b = pos[idx[i + 1]], c = pos[idx[i + 2]];
      if (a && b && c) this.tri(a, b, c);
    }
  }

  append(other, m = null) {
    const base = this.vertexCount;
    if (!m) {
      for (const v of other.pos) this.pos.push(v);
      for (const v of other.nrm) this.nrm.push(v);
      for (const k of other.idx) this.idx.push(base + k);
      return this;
    }
    const nm = normalMatrix(m), mirror = det3(m) < 0;
    const P = other.pos, N = other.nrm;
    for (let i = 0; i < P.length; i += 3) {
      const x = P[i], y = P[i + 1], z = P[i + 2];
      this.pos.push(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]);
      const nx = N[i], ny = N[i + 1], nz = N[i + 2];
      const tx = nm[0] * nx + nm[3] * ny + nm[6] * nz, ty = nm[1] * nx + nm[4] * ny + nm[7] * nz, tz = nm[2] * nx + nm[5] * ny + nm[8] * nz;
      const l = Math.hypot(tx, ty, tz) || 1;
      this.nrm.push(tx / l, ty / l, tz / l);
    }
    const I = other.idx;
    for (let i = 0; i < I.length; i += 3) {
      if (mirror) this.idx.push(base + I[i], base + I[i + 2], base + I[i + 1]);
      else this.idx.push(base + I[i], base + I[i + 1], base + I[i + 2]);
    }
    return this;
  }

  transform(m) {
    const out = new Mesh().append(this, m);
    this.pos = out.pos; this.nrm = out.nrm; this.idx = out.idx;
    return this;
  }

  flip() {
    for (let i = 0; i < this.idx.length; i += 3) { const t = this.idx[i + 1]; this.idx[i + 1] = this.idx[i + 2]; this.idx[i + 2] = t; }
    for (let i = 0; i < this.nrm.length; i++) this.nrm[i] = -this.nrm[i];
    return this;
  }

  bounds() {
    const P = this.pos;
    if (!P.length) return null;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { const v = P[i + k]; if (v < lo[k]) lo[k] = v; if (v > hi[k]) hi[k] = v; }
    return { min: lo, max: hi };
  }

  /** Signed volume (divergence theorem); meaningful for closed, outward-facing meshes. */
  volume() {
    const P = this.pos, I = this.idx;
    let v = 0;
    for (let i = 0; i < I.length; i += 3) {
      const a = I[i] * 3, b = I[i + 1] * 3, c = I[i + 2] * 3;
      v += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]);
    }
    return v / 6;
  }

  /** Shared vertices: points closer than eps (per axis grid) become one. Degenerate triangles are dropped. */
  welded(eps = 1e-7) {
    const map = new Map(), pos = [], idx = [], remap = new Int32Array(this.vertexCount);
    const P = this.pos, inv = 1 / eps;
    for (let i = 0; i < P.length / 3; i++) {
      const key = Math.round(P[i * 3] * inv) + ',' + Math.round(P[i * 3 + 1] * inv) + ',' + Math.round(P[i * 3 + 2] * inv);
      let k = map.get(key);
      if (k === undefined) { k = pos.length / 3; map.set(key, k); pos.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); }
      remap[i] = k;
    }
    for (let i = 0; i < this.idx.length; i += 3) {
      const a = remap[this.idx[i]], b = remap[this.idx[i + 1]], c = remap[this.idx[i + 2]];
      if (a !== b && b !== c && a !== c) idx.push(a, b, c);
    }
    return { pos, idx };
  }

  static fromWelded(pos, idx) {
    const m = new Mesh();
    for (let i = 0; i + 2 < idx.length; i += 3) {
      const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
      m.tri([pos[a], pos[a + 1], pos[a + 2]], [pos[b], pos[b + 1], pos[b + 2]], [pos[c], pos[c + 1], pos[c + 2]]);
    }
    return m;
  }

  interleaved() {
    const n = this.vertexCount, v = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      v[i * 6] = this.pos[i * 3]; v[i * 6 + 1] = this.pos[i * 3 + 1]; v[i * 6 + 2] = this.pos[i * 3 + 2];
      v[i * 6 + 3] = this.nrm[i * 3]; v[i * 6 + 4] = this.nrm[i * 3 + 1]; v[i * 6 + 5] = this.nrm[i * 3 + 2];
    }
    return { vertices: v, indices: Uint32Array.from(this.idx) };
  }
}

/** The 3 × 3 inverse transpose of m's linear part (column-major), for normals. */
function normalMatrix(m) {
  const inv = invert(m) || m;
  return [inv[0], inv[4], inv[8], inv[1], inv[5], inv[9], inv[2], inv[6], inv[10]];
}
