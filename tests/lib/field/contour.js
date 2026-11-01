/* SPDX-License-Identifier: Apache-2.0 */
/**
 * contour.js — Grid → triangle mesh by dual contouring (0.8 CE.1). Watertight and manifold by construction.
 *
 * One vertex per surface cell (per connected group of inside corners when the cell has several), placed at the least-squares
 * point of the edge crossings' planes (Ju, Losasso, Schaefer, Warren 2002), pulled gently toward the mean of the crossings so a
 * flat or ill-conditioned patch stays put; then one quad per sign-changing grid edge joining the four cells around it, split
 * along its shorter diagonal. The surface is the zero level: inside is value < 0. Inside corners of one cell are grouped by the
 * cube's edges, so two corners that only touch diagonally on a face are two groups in both cells that share the face — the
 * same choice on both sides is what keeps the result manifold.
 * Output { positions: Float32Array, indices: Uint32Array, bbox }. Vertices and triangles come out in brick-key order.
 */
import { Grid, INSIDE, BN, keyOf, brickOf, BS } from './grid.js';

// corner c = x | y<<1 | z<<2; cube edges as corner pairs
const CUBE_EDGES = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
// PATCH[mask][inCorner·8 + outCorner] = which surface patch of the cell the crossing edge belongs to (−1 if it is not a crossing),
// PATCH_N[mask] = how many patches. Patches are the closed loops the surface cuts out of the cube: two crossing edges of a face
// are joined by the arc that crosses the face (a face with four crossings is the saddle case, resolved by keeping the inside
// corners apart — the same choice for both cells that share the face), and the loops of arcs are the patches. One vertex per
// patch makes every patch a disc and every vertex's fan a single piece, however the inside and outside corners are connected
// through the cube.
const FACES = [];
for (let ax = 0; ax < 3; ax++) for (let side = 0; side < 2; side++) {
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].filter((c) => (c >> ax & 1) === side);
  FACES.push(CUBE_EDGES.map((e, i) => (corners.includes(e[0]) && corners.includes(e[1]) ? i : -1)).filter((i) => i >= 0));
}
const PATCH = [], PATCH_N = [];
for (let m = 0; m < 256; m++) {
  const cross = CUBE_EDGES.map(([p, q]) => (m >> p & 1) !== (m >> q & 1));
  const par = CUBE_EDGES.map((_, i) => i);
  const find = (x) => { while (par[x] !== x) x = par[x]; return x; };
  const join = (x, y) => { const a2 = find(x), b2 = find(y); if (a2 !== b2) par[Math.max(a2, b2)] = Math.min(a2, b2); };
  for (const fe of FACES) {
    const cr = fe.filter((i) => cross[i]);
    if (cr.length === 2) join(cr[0], cr[1]);
    else if (cr.length === 4) {                           // saddle: join the two crossings that meet at each inside corner
      for (const c of new Set(fe.flatMap((i) => CUBE_EDGES[i]))) if (m >> c & 1) { const at = fe.filter((i) => CUBE_EDGES[i].includes(c)); join(at[0], at[1]); }
    }
  }
  const map = new Int8Array(64).fill(-1), ids = new Map();
  CUBE_EDGES.forEach(([p, q], i) => {
    if (!cross[i]) return;
    const root = find(i);
    if (!ids.has(root)) ids.set(root, ids.size);
    const inC = m >> p & 1 ? p : q, outC = inC === p ? q : p;
    map[inC * 8 + outC] = ids.get(root);
  });
  PATCH.push(map); PATCH_N.push(ids.size);
}

/* 0.8 IND.11: the cell table and the two edge sets are open-addressing hash tables in typed arrays. A JS Map or Set stops at 2^24 (16.7 million) entries, which a
   0.1 mm surface over 200 mm passes (the benchmark crashed there), and the old edge key p·2^32 + q is not exact above 2^21 vertices. Insertion order is not
   used by anything: results are read by key, so the output is the same triangles in the same order as before. */
const EMPTY32 = 0xFFFFFFFF;
function hash2(lo, hi) { let h = Math.imul(lo ^ Math.imul(hi + 0x9E3779B9 | 0, 0x85EBCA6B), 0xC2B2AE35); h ^= h >>> 15; h = Math.imul(h, 0x27D4EB2F); return (h ^ (h >>> 13)) >>> 0; }
/** key → value, both unsigned 32-bit pairs (key = hi·2^32 + lo with hi, lo < 2^32 - 1; value a double). Grows by doubling at half full. */
class CellTable {
  constructor() { this.cap = 1 << 16; this.n = 0; this.hi = new Uint32Array(this.cap).fill(EMPTY32); this.lo = new Uint32Array(this.cap); this.val = new Float64Array(this.cap); }
  set(hi, lo, v) {
    if (2 * (this.n + 1) > this.cap) this.grow();
    const m = this.cap - 1; let i = hash2(lo, hi) & m;
    while (this.hi[i] !== EMPTY32) { if (this.hi[i] === hi && this.lo[i] === lo) { this.val[i] = v; return; } i = (i + 1) & m; }
    this.hi[i] = hi; this.lo[i] = lo; this.val[i] = v; this.n++;
  }
  get(hi, lo) {
    const m = this.cap - 1; let i = hash2(lo, hi) & m;
    while (this.hi[i] !== EMPTY32) { if (this.hi[i] === hi && this.lo[i] === lo) return this.val[i]; i = (i + 1) & m; }
    return undefined;
  }
  grow() {
    const oh = this.hi, ol = this.lo, ov = this.val, oc = this.cap;
    this.cap = oc * 2; this.hi = new Uint32Array(this.cap).fill(EMPTY32); this.lo = new Uint32Array(this.cap); this.val = new Float64Array(this.cap);
    const m = this.cap - 1;
    for (let j = 0; j < oc; j++) if (oh[j] !== EMPTY32) { let i = hash2(ol[j], oh[j]) & m; while (this.hi[i] !== EMPTY32) i = (i + 1) & m; this.hi[i] = oh[j]; this.lo[i] = ol[j]; this.val[i] = ov[j]; }
  }
}
/** A set of unordered pairs of vertex indices (each < 2^32 - 1). */
class EdgeSet {
  constructor() { this.cap = 1 << 16; this.n = 0; this.a = new Uint32Array(this.cap).fill(EMPTY32); this.b = new Uint32Array(this.cap); }
  _slot(p, q) { if (p > q) { const t = p; p = q; q = t; } const m = this.cap - 1; let i = hash2(q, p) & m; while (this.a[i] !== EMPTY32 && !(this.a[i] === p && this.b[i] === q)) i = (i + 1) & m; return i; }
  has(p, q) { if (p > q) { const t = p; p = q; q = t; } return this.a[this._slot(p, q)] === p; }
  add(p, q) {
    if (p > q) { const t = p; p = q; q = t; }
    if (2 * (this.n + 1) > this.cap) this.grow();
    const i = this._slot(p, q); if (this.a[i] === EMPTY32) { this.a[i] = p; this.b[i] = q; this.n++; }
  }
  grow() {
    const oa = this.a, ob = this.b, oc = this.cap; this.cap = oc * 2; this.a = new Uint32Array(this.cap).fill(EMPTY32); this.b = new Uint32Array(this.cap);
    for (let j = 0; j < oc; j++) if (oa[j] !== EMPTY32) { const i = this._slot(oa[j], ob[j]); this.a[i] = oa[j]; this.b[i] = ob[j]; }
  }
}

const LAMBDA = 0.1;

export function contour(grid) {
  const h = grid.h, bw = grid.bw;
  const keys = grid.sortedKeys();
  if (!keys.length) return { positions: new Float32Array(0), indices: new Uint32Array(0), bbox: null };
  // scan set: every stored brick and the 7 bricks below it (cells whose lowest corner lies there reach into it)
  const scan = new Set();
  for (const k of keys) { const [bx, by, bz] = brickOf(k); for (let d = 0; d < 8; d++) scan.add(keyOf(bx - (d & 1), by - (d >> 1 & 1), bz - (d >> 2 & 1))); }
  const scanKeys = [...scan].sort((a, b) => a - b);

  // cached node lookup
  let cKey = -1, cBrick = null;
  const val = (i, j, k) => {
    const key = keyOf(i >> 3, j >> 3, k >> 3);
    if (key !== cKey) { cKey = key; cBrick = grid.bricks.get(key); }
    if (cBrick === undefined) return bw;
    if (cBrick === INSIDE) return -bw;
    return cBrick[(i & 7) | ((j & 7) << 3) | ((k & 7) << 6)];
  };

  // cells −65 536 … 65 535 on an axis (grid.js inRange keeps bricks inside that): key = (i·2^17 + j)·2^17 + k, 51 bits, kept as two unsigned 32-bit halves.
  // 0.8 IND.11 slab by slab: the work runs one brick-thick layer of x at a time (a "slab"). A cell's quads only reach cells at i−1, j−1, k−1, so a slab needs its own
  // cell table and the one before it; a quad's diagonal is chosen against edges that cells of the next slab can share, so a slab's quads wait for the next slab's to be
  // collected. The tables (cells, quad edges, diagonals) are therefore the size of three slabs, not of the whole surface; only the output grows with the mesh.
  // Vertices, quads and triangles come out in the same order as the whole-surface version, so the mesh is byte-identical to it.
  let prevCells = null, prevSlab = NaN, cells = null, curSlab = NaN;
  const cellSet = (i, j, k, v) => { const a = i + 65536, b = j + 65536, c = k + 65536; cells.set((a << 2) | (b >> 15), (((b & 0x7FFF) << 17) | c) >>> 0, v); };
  const cellGet = (i, j, k) => {
    const sb = i >> 3, t = sb === curSlab ? cells : sb === prevSlab ? prevCells : null;
    if (t === null) return undefined;
    const a = i + 65536, b = j + 65536, c = k + 65536; return t.get((a << 2) | (b >> 15), (((b & 0x7FFF) << 17) | c) >>> 0);
  };
  // growable typed buffers: a fine grid has tens of millions of vertices, which plain arrays of doubles cannot hold
  let pa = new Float64Array(1 << 16), pn = 0, ta = new Uint32Array(1 << 17), tn = 0;
  const pushPos = (x, y, z) => { if (pn + 3 > pa.length) { const b = new Float64Array(pa.length * 2); b.set(pa); pa = b; } pa[pn++] = x; pa[pn++] = y; pa[pn++] = z; };
  const pushTri = (a, b, c) => { if (tn + 3 > ta.length) { const q = new Uint32Array(ta.length * 2); q.set(ta); ta = q; } ta[tn++] = a; ta[tn++] = b; ta[tn++] = c; };
  const cv = new Float64Array(8);
  const P = [], N = [];

  const cellLoop = (bx, by, bz, fn) => {
    // only a brick holding real values can have a surface in its inner cells; a solid-inside brick (INSIDE) is as uniform as a missing one, so only the cells that reach
    // into the next brick are looked at (the sphere at 0.1 mm has 8.4 million of them: 4.3 billion cell visits for nothing)
    const b = grid.bricks.get(keyOf(bx, by, bz)), full = b !== undefined && b !== INSIDE;
    for (let lk = 0; lk < 8; lk++) for (let lj = 0; lj < 8; lj++) for (let li = 0; li < 8; li++) {
      if (!full && li < 7 && lj < 7 && lk < 7) continue;     // a cell wholly inside a stored-nothing brick has one sign
      fn(bx * 8 + li, by * 8 + lj, bz * 8 + lk);
    }
  };

  const vert = (i, j, k, corner, other) => {               // vertex of cell (i,j,k) whose patch holds the edge between these two corners
    const rec = cellGet(i, j, k);
    if (rec === undefined) return -1;
    const mask = rec & 255, inC = mask >> corner & 1 ? corner : other, outC = inC === corner ? other : corner;
    return Math.floor(rec / 256) + PATCH[mask][inC * 8 + outC];
  };
  // A quad is two triangles; its diagonal must not be an edge that already exists, or that edge would have three triangles
  // (it happens where a wall is only a voxel or two thick). Quads are collected first; their perimeters are real edges.
  const perims = new Map(), diags = new Map();             // slab → EdgeSet
  const setOf = (m, s) => { let e = m.get(s); if (!e) { e = new EdgeSet(); m.set(s, e); } return e; };
  const hasIn = (m, ss, p, q) => { for (const s of ss) { const e = m.get(s); if (e && e.has(p, q)) return true; } return false; };
  const D2 = (p, q) => (pa[p * 3] - pa[q * 3]) ** 2 + (pa[p * 3 + 1] - pa[q * 3 + 1]) ** 2 + (pa[p * 3 + 2] - pa[q * 3 + 2]) ** 2;
  const finish = (Q) => {                                  // choose the diagonals of a slab's quads, in order, and emit the triangles
    const { qa, qn, slab } = Q, near = [slab - 1, slab, slab + 1], dnear = [slab - 1, slab], dset = setOf(diags, slab);
    for (let q = 0; q < qn; q += 4) {
      const o0 = qa[q], o1 = qa[q + 1], o2 = qa[q + 2], o3 = qa[q + 3];
      const bad02 = hasIn(perims, near, o0, o2) || hasIn(diags, dnear, o0, o2), bad13 = hasIn(perims, near, o1, o3) || hasIn(diags, dnear, o1, o3);
      const use02 = bad02 === bad13 ? D2(o0, o2) <= D2(o1, o3) : !bad02;
      if (use02) { dset.add(o0, o2); pushTri(o0, o1, o2); pushTri(o0, o2, o3); } else { dset.add(o1, o3); pushTri(o0, o1, o3); pushTri(o1, o2, o3); }
    }
    perims.delete(slab - 1); diags.delete(slab - 1);       // nothing in a later slab can reach these any more
  };

  let pending = null;
  for (let at = 0; at < scanKeys.length;) {
    const slab = brickOf(scanKeys[at])[0];
    let end = at; while (end < scanKeys.length && brickOf(scanKeys[end])[0] === slab) end++;
    prevCells = cells; prevSlab = curSlab; cells = new CellTable(); curSlab = slab;
    if (prevSlab !== slab - 1) { prevCells = null; prevSlab = NaN; }

    // ---- pass 1: vertices ----
    for (let n = at; n < end; n++) {
      const [bx, by, bz] = brickOf(scanKeys[n]);
      cellLoop(bx, by, bz, (i, j, k) => {
        let mask = 0;
        for (let c = 0; c < 8; c++) { const v = val(i + (c & 1), j + (c >> 1 & 1), k + (c >> 2 & 1)); cv[c] = v; if (v < 0) mask |= 1 << c; }
        if (mask === 0 || mask === 255) return;
        const ncomp = PATCH_N[mask], pm = PATCH[mask], first = pn / 3;
        for (let comp = 0; comp < ncomp; comp++) {
          P.length = 0; N.length = 0;
          let mx = 0, my = 0, mz = 0;
          for (const [p, q] of CUBE_EDGES) {
            const ip = mask >> p & 1, iq = mask >> q & 1;
            if (ip === iq) continue;
            const inC = ip ? p : q, outC = ip ? q : p;
            if (pm[inC * 8 + outC] !== comp) continue;
            const vi = cv[inC], vo = cv[outC], t = vi / (vi - vo);
            const x0 = (i + (inC & 1)) * h, y0 = (j + (inC >> 1 & 1)) * h, z0 = (k + (inC >> 2 & 1)) * h;
            const x1 = (i + (outC & 1)) * h, y1 = (j + (outC >> 1 & 1)) * h, z1 = (k + (outC >> 2 & 1)) * h;
            const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t, pz = z0 + (z1 - z0) * t;
            let g = cellGradient(cv, (px - i * h) / h, (py - j * h) / h, (pz - k * h) / h); let gl = Math.sqrt(g[0] * g[0] + g[1] * g[1] + g[2] * g[2]);
            if (!(gl > 1e-12)) { g = [x1 - x0, y1 - y0, z1 - z0]; gl = h; }
            P.push(px, py, pz); N.push(g[0] / gl, g[1] / gl, g[2] / gl);
            mx += px; my += py; mz += pz;
          }
          const n = P.length / 3;
          mx /= n; my /= n; mz /= n;
          // minimise Σ (nᵢ·(x − pᵢ))² + λ|x − m|²  →  (AᵀA + λI) y = Aᵀb, x = m + y
          let a00 = LAMBDA, a01 = 0, a02 = 0, a11 = LAMBDA, a12 = 0, a22 = LAMBDA, b0 = 0, b1 = 0, b2 = 0;
          for (let e = 0; e < n; e++) {
            const nx = N[e * 3], ny = N[e * 3 + 1], nz = N[e * 3 + 2], d = nx * (P[e * 3] - mx) + ny * (P[e * 3 + 1] - my) + nz * (P[e * 3 + 2] - mz);
            a00 += nx * nx; a01 += nx * ny; a02 += nx * nz; a11 += ny * ny; a12 += ny * nz; a22 += nz * nz;
            b0 += nx * d; b1 += ny * d; b2 += nz * d;
          }
          const det = a00 * (a11 * a22 - a12 * a12) - a01 * (a01 * a22 - a12 * a02) + a02 * (a01 * a12 - a11 * a02);
          let x = mx, y = my, z = mz;
          if (det > 1e-12) {
            x += (b0 * (a11 * a22 - a12 * a12) - a01 * (b1 * a22 - a12 * b2) + a02 * (b1 * a12 - a11 * b2)) / det;
            y += (a00 * (b1 * a22 - a12 * b2) - b0 * (a01 * a22 - a12 * a02) + a02 * (a01 * b2 - b1 * a02)) / det;
            z += (a00 * (a11 * b2 - b1 * a12) - a01 * (a01 * b2 - b1 * a02) + b0 * (a01 * a12 - a11 * a02)) / det;
          }
          const clamp = (v, lo) => (v < lo ? lo : v > lo + h ? lo + h : v);
          pushPos(clamp(x, i * h), clamp(y, j * h), clamp(z, k * h));
        }
        cellSet(i, j, k, mask + 256 * first);
      });
    }

    // ---- pass 2: one quad per sign-changing edge ----
    const Q = { qa: new Int32Array(1 << 12), qn: 0, slab }, pset = setOf(perims, slab);
    const quad = (a, b, c, d, flip) => {
      if (a < 0 || b < 0 || c < 0 || d < 0) return;
      let { qa, qn } = Q;
      if (qn + 4 > qa.length) { const g = new Int32Array(qa.length * 2); g.set(qa); qa = g; Q.qa = g; }
      if (flip) { qa[qn] = a; qa[qn + 1] = d; qa[qn + 2] = c; qa[qn + 3] = b; } else { qa[qn] = a; qa[qn + 1] = b; qa[qn + 2] = c; qa[qn + 3] = d; }
      for (let n = 0; n < 4; n++) pset.add(qa[qn + n], qa[qn + (n + 1) % 4]);
      Q.qn = qn + 4;
    };
    for (let n = at; n < end; n++) {
      const [bx, by, bz] = brickOf(scanKeys[n]);
      cellLoop(bx, by, bz, (i, j, k) => {
        const v0 = val(i, j, k);
        for (let axis = 0; axis < 3; axis++) {
          const v1 = axis === 0 ? val(i + 1, j, k) : axis === 1 ? val(i, j + 1, k) : val(i, j, k + 1);
          const in0 = v0 < 0, in1 = v1 < 0;
          if (in0 === in1) continue;
          // the four cells around the edge, counter-clockwise about +axis; the endpoint corners inside each
          let cs, ci;
          if (axis === 0) { cs = [[i, j - 1, k - 1], [i, j, k - 1], [i, j, k], [i, j - 1, k]]; ci = [6, 4, 0, 2]; }       // corner of each cell that is this edge's low end (x = 0 side)
          else if (axis === 1) { cs = [[i - 1, j, k - 1], [i - 1, j, k], [i, j, k], [i, j, k - 1]]; ci = [5, 1, 0, 4]; }
          else { cs = [[i - 1, j - 1, k], [i, j - 1, k], [i, j, k], [i - 1, j, k]]; ci = [3, 2, 0, 1]; }
          // for axis a the edge's endpoints are corner ci (low end) and ci | (1 << a) (high end) of each cell
          const bit = 1 << axis;
          const w = cs.map((c, m) => vert(c[0], c[1], c[2], ci[m], ci[m] | bit));
          quad(w[0], w[1], w[2], w[3], !in0);
        }
      });
    }
    if (pending) finish(pending);                          // its neighbours' quad edges are all in now
    pending = Q;
    if (prevCells && prevSlab !== slab - 1) prevCells = null;
    at = end;
  }
  if (pending) finish(pending);
  const positions = Float32Array.from(pa.subarray(0, pn)), indices = ta.slice(0, tn);
  const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  for (let n = 0; n < positions.length; n += 3) for (let a = 0; a < 3; a++) { if (positions[n + a] < bbox.min[a]) bbox.min[a] = positions[n + a]; if (positions[n + a] > bbox.max[a]) bbox.max[a] = positions[n + a]; }
  return { positions, indices, bbox };
}

/** Gradient of the trilinear interpolant of a cell's eight corner values (corner c = x | y<<1 | z<<2) at (u, v, w) in [0,1]³, per voxel. */
function cellGradient(c, u, v, w) {
  const iu = 1 - u, iv = 1 - v, iw = 1 - w;
  return [
    (c[1] - c[0]) * iv * iw + (c[3] - c[2]) * v * iw + (c[5] - c[4]) * iv * w + (c[7] - c[6]) * v * w,
    (c[2] - c[0]) * iu * iw + (c[3] - c[1]) * u * iw + (c[6] - c[4]) * iu * w + (c[7] - c[5]) * u * w,
    (c[4] - c[0]) * iu * iv + (c[5] - c[1]) * u * iv + (c[6] - c[2]) * iu * v + (c[7] - c[3]) * u * v,
  ];
}
