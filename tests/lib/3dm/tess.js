/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tess.js — triangles for what a .3dm file stores as surfaces. DOM-free, our own code.
 *
 * Sources, in this order (mode 'cached-first', the default):
 *   1. the render mesh the file saved with a face or an extrusion (what the program that wrote it showed);
 *   2. our own tessellation, for faces on surfaces geom.js evaluates (plane, NURBS, revolution, sum) and for extrusions;
 *   3. nothing, counted by surface kind as "not read yet".
 * mode 'ours' skips the saved meshes (tests compare the two).
 *
 * Our trimmed-face tessellation: each edge is sampled once on its 3D curve (so the two faces that share it get the same
 * points and the solid closes), each loop is walked in the face's (u, v) plane through its trim curves at those same
 * fractions, the loops are triangulated in (u, v) (earcut: outer loop with its holes), then interior triangle edges are
 * halved while the surface bulges more than `tol` from them or their ends' normals differ by more than ~20°. A halving
 * is decided by the edge alone, so neighbouring triangles always agree (no cracks inside a face).
 *
 *   meshTriangles(m) → { positions, indices, normals?, uvs?, colors? } (a mesh record: quads split, colours 0–1)
 *   tessellateBrep(b, { tol, mode, maxTriangles, stats }) → { positions, indices, normals, triFace }
 *   tessellateExtrusion(e, { tol, mode, stats }) → same shape, or null
 *   stats: { cached, ours {kind → faces}, notRead {kind → faces}, capped, mitered } (added to)
 */
import { earcut } from './earcut.js';
import { insertPoints, flipAll } from './cdt.js';
import { curveAt, curveDomain, sampleCurve, surfaceAt, surfaceDomain, normalAt, surfaceOk, curveOk } from './geom.js';

const MAX_DEPTH = 8;
const MAX_GRID = 40000;   // interior points in one face

/** A mesh record's faces as triangles (a quad whose last two corners match is a triangle). */
export function meshTriangles(m) {
  const nv = m.nv;
  const positions = new Float64Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) positions[i] = m.V[i];
  const idx = [];
  for (let f = 0; f < m.nf; f++) {
    const a = m.F[f * 4], b = m.F[f * 4 + 1], c = m.F[f * 4 + 2], d = m.F[f * 4 + 3];
    if (c === d) { if (a !== b && b !== c && a !== c) idx.push(a, b, c); }
    else { if (a !== b && b !== c && a !== c) idx.push(a, b, c); if (a !== c && c !== d && a !== d) idx.push(a, c, d); }
  }
  const out = { positions, indices: Uint32Array.from(idx) };
  if (m.N) out.normals = Float64Array.from(m.N);
  if (m.T) out.uvs = Float64Array.from(m.T);
  if (m.C) { const c = new Float32Array(nv * 4); for (let i = 0; i < nv * 4; i++) c[i] = m.C[i] / 255; for (let i = 0; i < nv; i++) c[i * 4 + 3] = 1; out.colors = c; }
  return out;
}

/** Collects triangles from several pieces into one indexed mesh. */
class Builder {
  constructor() { this.P = []; this.N = []; this.I = []; this.TF = []; }
  get nv() { return this.P.length / 3; }
  add(p, n) { this.P.push(p[0], p[1], p[2]); this.N.push(n ? n[0] : 0, n ? n[1] : 0, n ? n[2] : 0); return this.nv - 1; }
  tri(a, b, c, face) { if (a === b || b === c || a === c) return; this.I.push(a, b, c); this.TF.push(face); }
  mesh(m, face) {
    const t = meshTriangles(m), base = this.nv;
    for (let i = 0; i < t.positions.length; i += 3) this.add([t.positions[i], t.positions[i + 1], t.positions[i + 2]], t.normals ? [t.normals[i], t.normals[i + 1], t.normals[i + 2]] : null);
    for (let i = 0; i < t.indices.length; i += 3) this.tri(base + t.indices[i], base + t.indices[i + 1], base + t.indices[i + 2], face);
  }
  /**
   * The mesh, with points that coincide joined (faces of one polysurface share their edge points, so the solid closes as
   * one piece): positions closer than a billionth of the object's size are one point; its first normal stays.
   */
  done() {
    const P = this.P, n = P.length / 3;
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i * 3 + k]); hi[k] = Math.max(hi[k], P[i * 3 + k]); }
    const q = Math.max(Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) * 1e-9, 1e-12);
    const key = new Map(), map = new Int32Array(n), pos = [], nor = [];
    for (let i = 0; i < n; i++) {
      const k = Math.round(P[i * 3] / q) + ',' + Math.round(P[i * 3 + 1] / q) + ',' + Math.round(P[i * 3 + 2] / q);
      let j = key.get(k);
      if (j === undefined) { j = pos.length / 3; key.set(k, j); pos.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); nor.push(this.N[i * 3], this.N[i * 3 + 1], this.N[i * 3 + 2]); }
      map[i] = j;
    }
    const I = [], TF = [];
    for (let t = 0; t < this.I.length; t += 3) {
      const a = map[this.I[t]], b = map[this.I[t + 1]], c = map[this.I[t + 2]];
      if (a === b || b === c || a === c) continue;
      I.push(a, b, c); TF.push(this.TF[t / 3]);
    }
    return { positions: Float64Array.from(pos), normals: Float32Array.from(nor), indices: Uint32Array.from(I), triFace: Int32Array.from(TF) };
  }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = len(a); return l > 0 ? a.map((x) => x / l) : null; };
const bump = (stats, group, kind) => { stats[group][kind] = (stats[group][kind] || 0) + 1; };

// ------------------------------------------------------------------------------------------------------------- breps

export function tessellateBrep(b, { tol = 0.01, mode = 'cached-first', maxTriangles = 2000000, stats = newStats() } = {}) {
  const out = new Builder();
  const edgeCache = new Map();
  b.F.forEach((f, fi) => {
    const s = b.S[f.si];
    if (mode !== 'ours' && f.mesh) { out.mesh(f.mesh, fi); stats.cached++; return; }
    if (!surfaceOk(s)) { bump(stats, 'notRead', s ? s.cls : 'unknown'); return; }
    const before = out.I.length;
    let ok = false;
    try { ok = face(b, f, fi, s, tol, out, edgeCache, maxTriangles, stats); } catch { ok = false; }
    if (!ok) { out.I.length = before; out.TF.length = before / 3; bump(stats, 'notRead', s.cls + ':trims'); return; }
    bump(stats, 'ours', s.cls);
  });
  return out.done();
}

export function newStats() { return { cached: 0, ours: {}, notRead: {}, capped: 0, mitered: 0 }; }

/** An edge's samples: { s: fractions along the edge's own direction, pts } on its 3D curve, or null when it has none we read. */
function edgeSamples(b, ei, tol, cache) {
  if (cache.has(ei)) return cache.get(ei);
  let r = null;
  const e = b.E[ei];
  const c = e && e.c3i >= 0 ? b.c3[e.c3i] : null;
  if (c && curveOk(c)) {
    const [p0, p1] = e.proxy;
    const { pts, ts } = sampleCurve(c, tol, [p0, p1]);
    const span = p1 - p0 || 1;
    let s = ts.map((t) => (t - p0) / span), P = pts;
    if (e.rev) { s = s.map((x) => 1 - x).reverse(); P = P.slice().reverse(); }
    r = { s, pts: P };
  }
  cache.set(ei, r);
  return r;
}

function face(b, f, fi, S, tol, out, edgeCache, maxTriangles, stats) {
  const dom = surfaceDomain(S);
  const loops = [];
  const free = !f.li.length;   // a lone surface (no trims): its whole domain, and nothing beside it to match
  if (free) {
    const [[u0, u1], [v0, v1]] = dom, n = 8, uv = [];
    for (let k = 0; k < n; k++) uv.push([u0 + (u1 - u0) * k / n, v0]);
    for (let k = 0; k < n; k++) uv.push([u1, v0 + (v1 - v0) * k / n]);
    for (let k = 0; k < n; k++) uv.push([u1 - (u1 - u0) * k / n, v1]);
    for (let k = 0; k < n; k++) uv.push([u0, v1 - (v1 - v0) * k / n]);
    loops.push({ outer: true, uv, P: uv.map(() => null) });
  }
  for (const li of f.li) {
    const L = b.L[li];
    if (L.type !== 1 && L.type !== 2) continue;   // slits and curves on the surface bound nothing
    const uv = [], P3 = [];
    for (const ti of L.ti) {
      const t = b.T[ti];
      const c2 = b.c2[t.c2i];
      if (!curveOk(c2)) return false;
      const [q0, q1] = t.proxy;
      const at = (s) => curveAt(c2, t.rev ? q1 - s * (q1 - q0) : q0 + s * (q1 - q0));
      let fr, pts = null;
      const es = t.ei >= 0 ? edgeSamples(b, t.ei, tol, edgeCache) : null;
      if (es) {
        fr = es.s; pts = es.pts;
        if (t.rev3d) { fr = fr.map((x) => 1 - x).reverse(); pts = pts.slice().reverse(); }
      } else if (t.type === 4 || t.ei < 0) {
        fr = [0, 1];   // singular (a pole): every point of it is one point in space
        const v = b.V[t.vi[0]];
        if (v) pts = [v, v];
      } else {
        const d = sampleCurve(c2, Math.max(dom[0][1] - dom[0][0], dom[1][1] - dom[1][0]) * 1e-3, [q0, q1]);
        fr = d.ts.map((x) => (x - q0) / ((q1 - q0) || 1));
        if (t.rev) fr = fr.map((x) => 1 - x).reverse();
      }
      for (let k = 0; k < fr.length - 1; k++) {
        const p = at(fr[k]);
        uv.push([p[0], p[1]]);
        P3.push(pts ? pts[k] : null);
      }
    }
    // drop repeats (a loop that comes back to a point it just left)
    const u2 = [], p2 = [];
    for (let k = 0; k < uv.length; k++) {
      const q = uv[k], prev = u2[u2.length - 1];
      if (prev && Math.abs(prev[0] - q[0]) < 1e-12 && Math.abs(prev[1] - q[1]) < 1e-12) continue;
      u2.push(q); p2.push(P3[k]);
    }
    while (u2.length > 1 && Math.abs(u2[0][0] - u2[u2.length - 1][0]) < 1e-12 && Math.abs(u2[0][1] - u2[u2.length - 1][1]) < 1e-12) { u2.pop(); p2.pop(); }
    if (u2.length >= 3) loops.push({ outer: L.type === 1, uv: u2, P: p2 });
  }
  if (!loops.length) return false;
  loops.sort((a, c) => (c.outer ? 1 : 0) - (a.outer ? 1 : 0));
  if (!loops[0].outer) return false;
  // triangulate in (u, v), scaled so a step in u and one in v are about as long on the surface
  const du = dom[0][1] - dom[0][0] || 1, dv = dom[1][1] - dom[1][0] || 1;
  const along = (fn) => { let L = 0, prev = null; for (let k = 0; k <= 8; k++) { const p = fn(k / 8); if (prev) L += len(sub(p, prev)); prev = p; } return L; };
  const vm = dom[1][0] + dv / 2, um = dom[0][0] + du / 2;
  const Lu = Math.max(along((s) => surfaceAt(S, dom[0][0] + s * du, vm)), 1e-12), Lv = Math.max(along((s) => surfaceAt(S, um, dom[1][0] + s * dv)), 1e-12);
  const ku = Lu / du, kv = Lv / dv;
  const flat = [], holes = [], U = [], V = [], P = [];
  for (const l of loops) {
    if (l !== loops[0]) holes.push(U.length);
    for (let k = 0; k < l.uv.length; k++) { flat.push(l.uv[k][0] * ku, l.uv[k][1] * kv); U.push(l.uv[k][0]); V.push(l.uv[k][1]); P.push(l.P[k]); }
  }
  let tris = earcut(flat, holes);
  if (!tris.length) return false;
  // points inside, on a grid as fine as the surface bends, then Delaunay flips (no fans of slivers to refine)
  const nb = U.length;
  const X = [], Y = [];
  for (let k = 0; k < flat.length; k += 2) { X.push(flat[k]); Y.push(flat[k + 1]); }
  const h = gridStep(S, dom, tol, Lu, Lv);
  const pts = h ? insidePoints(loops, ku, kv, h, dom) : [];
  tris = pts.length ? insertPoints(X, Y, tris, pts) : flipAll(X, Y, tris);
  for (let k = nb; k < X.length; k++) { U.push(X[k] / ku); V.push(Y[k] / kv); P.push(null); }
  // vertices: boundary ones on the edges (shared with the neighbour), the rest on the surface
  const base = out.nv;
  const nrm = (u, v) => { const n = normalAt(S, u, v, dom); return n && f.rev ? n.map((x) => -x) : n; };
  const vu = U.slice(), vv = V.slice(), vn = [];
  for (let k = 0; k < U.length; k++) { const p = P[k] || surfaceAt(S, U[k], V[k]); const n = nrm(U[k], V[k]); vn.push(n); out.add(p, n); }
  const pos = (i) => out.P.slice((base + i) * 3, (base + i) * 3 + 3);
  // the loop sides may not be halved: the face beside them has the same points there
  const boundary = new Set();
  let start = 0;
  for (const l of loops) {
    const n = l.uv.length;
    for (let k = 0; k < n; k++) { const a = start + k, c = start + (k + 1) % n; boundary.add(Math.min(a, c) * nb + Math.max(a, c)); }
    start += n;
  }
  const mids = new Map();
  const minLen = tol * 2, cosMax = Math.cos(20 * Math.PI / 180);
  let capped = false;
  const half = (a, c) => {
    const key = a < c ? a + ',' + c : c + ',' + a;
    if (mids.has(key)) return mids.get(key);
    let m = -1;
    if (free || !(a < nb && c < nb && boundary.has(Math.min(a, c) * nb + Math.max(a, c)))) {
      const pa = pos(a), pc = pos(c);
      if (len(sub(pa, pc)) > minLen) {
        const u = (vu[a] + vu[c]) / 2, v = (vv[a] + vv[c]) / 2;
        const pm = surfaceAt(S, u, v);
        const chord = [(pa[0] + pc[0]) / 2, (pa[1] + pc[1]) / 2, (pa[2] + pc[2]) / 2];
        const na = vn[a], nc = vn[c];
        if (len(sub(pm, chord)) > tol || (na && nc && dot(na, nc) < cosMax)) {
          if (out.I.length / 3 >= maxTriangles) capped = true;
          else { m = out.add(pm, nrm(u, v)) - base; vu.push(u); vv.push(v); vn.push(nrm(u, v)); }
        }
      }
    }
    mids.set(key, m);
    return m;
  };
  const emit = (a, c, d) => {
    // the triangle turns the way the surface faces (u × v), flipped for a reversed face
    const ar = (vu[c] - vu[a]) * (vv[d] - vv[a]) - (vu[d] - vu[a]) * (vv[c] - vv[a]);
    if (ar === 0) { const n = cross(sub(pos(c), pos(a)), sub(pos(d), pos(a))); if (len(n) === 0) return; }
    const ccw = ar >= 0;
    if (ccw !== f.rev) out.tri(base + a, base + c, base + d, fi); else out.tri(base + a, base + d, base + c, fi);
  };
  const refine = (a, c, d, depth) => {
    if (depth >= MAX_DEPTH) { emit(a, c, d); return; }
    const mac = half(a, c), mcd = half(c, d), mda = half(d, a);
    const n = (mac >= 0) + (mcd >= 0) + (mda >= 0);
    if (n === 0) { emit(a, c, d); return; }
    if (n === 3) { refine(a, mac, mda, depth + 1); refine(mac, c, mcd, depth + 1); refine(mda, mcd, d, depth + 1); refine(mac, mcd, mda, depth + 1); return; }
    // one or two sides halved: turn the triangle so the halved sides come first
    let [x, y, z, mxy, myz, mzx] = [a, c, d, mac, mcd, mda];
    for (let r = 0; r < 3 && !(mxy >= 0 && (n === 1 || myz >= 0)); r++) [x, y, z, mxy, myz, mzx] = [y, z, x, myz, mzx, mxy];
    if (n === 1) { refine(x, mxy, z, depth + 1); refine(mxy, y, z, depth + 1); return; }
    refine(mxy, y, myz, depth + 1); refine(x, mxy, myz, depth + 1); refine(x, myz, z, depth + 1);
  };
  for (let k = 0; k < tris.length; k += 3) refine(tris[k], tris[k + 1], tris[k + 2], 0);
  if (capped) stats.capped++;
  return true;
}

/**
 * The grid step (in the scaled (u, v) plane, about surface length) for a face: from the most the surface bends, so a chord
 * stays within `tol` (sagitta L²κ/8) and turns at most ~20°; null for a flat face.
 */
function gridStep(S, dom, tol, Lu, Lv) {
  const n = 8, N = [], Pp = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    const u = dom[0][0] + (dom[0][1] - dom[0][0]) * i / n, v = dom[1][0] + (dom[1][1] - dom[1][0]) * j / n;
    N.push(normalAt(S, u, v, dom)); Pp.push(surfaceAt(S, u, v));
  }
  const ks = [];
  const at = (i, j) => i * (n + 1) + j;
  const near = Math.min(Lu, Lv) / n / 4;   // pairs closer than this sit at a pole or a pinch: their normals say nothing
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) for (const [a, b] of [[i + 1, j], [i, j + 1]]) {
    if (a > n || b > n) continue;
    const n0 = N[at(i, j)], n1 = N[at(a, b)];
    const d = len(sub(Pp[at(i, j)], Pp[at(a, b)]));
    if (!n0 || !n1 || d <= near) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, dot(n0, n1))));
    ks.push(ang / d);
  }
  // the grid follows how the face bends over most of it; the edge halving after it handles the tight places (an apex)
  ks.sort((a, b) => a - b);
  const k = ks.length ? ks[Math.floor(ks.length * 0.75)] : 0;
  if (k < 1e-9) return null;
  let h = Math.min(Math.sqrt(8 * tol / k), 0.349 / k);
  const big = Math.max(Lu, Lv);
  h = Math.max(h, big / 400, Math.sqrt((Lu * Lv) / MAX_GRID));
  return h < big ? h : null;
}

/** Grid points inside the face's loops (even-odd), at least half a step from every side. */
function insidePoints(loops, ku, kv, h, dom) {
  const segs = [];
  for (const l of loops) for (let k = 0; k < l.uv.length; k++) { const a = l.uv[k], b = l.uv[(k + 1) % l.uv.length]; segs.push([a[0] * ku, a[1] * kv, b[0] * ku, b[1] * kv]); }
  const x0 = dom[0][0] * ku, x1 = dom[0][1] * ku, y0 = dom[1][0] * kv, y1 = dom[1][1] * kv;
  const lo = [Math.min(x0, x1), Math.min(y0, y1)], hi = [Math.max(x0, x1), Math.max(y0, y1)];
  const nx = Math.floor((hi[0] - lo[0]) / h), ny = Math.floor((hi[1] - lo[1]) / h);
  if (nx < 1 && ny < 1) return [];
  const gx = (hi[0] - lo[0]) / (nx + 1), gy = (hi[1] - lo[1]) / (ny + 1);
  // the sides in buckets by row, for the distance test
  const rows = Math.max(1, ny + 1), bucket = Array.from({ length: rows + 2 }, () => []);
  const rowOf = (y) => Math.max(0, Math.min(rows + 1, Math.floor((y - lo[1]) / gy)));
  segs.forEach((sg, k) => { const a = rowOf(Math.min(sg[1], sg[3])), b = rowOf(Math.max(sg[1], sg[3])); for (let r = a; r <= b; r++) bucket[r].push(k); });
  const out = [];
  for (let j = 1; j <= ny; j++) {
    const y = lo[1] + j * gy;
    const r = rowOf(y);
    const near = new Set([...(bucket[r - 1] || []), ...bucket[r], ...(bucket[r + 1] || [])]);
    // crossings of this row by every side (even-odd)
    const xs = [];
    for (const sg of segs) { const [ax, ay, bx, by] = sg; if ((ay > y) !== (by > y)) xs.push(ax + (y - ay) * (bx - ax) / (by - ay)); }
    xs.sort((a, b) => a - b);
    for (let i = 1; i <= nx; i++) {
      const x = lo[0] + i * gx;
      let c = 0;
      while (c < xs.length && xs[c] < x) c++;
      if (c % 2 === 0) continue;
      let ok = true;
      for (const k of near) {
        const [ax, ay, bx, by] = segs[k];
        const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
        const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
        if (Math.hypot(x - ax - t * dx, y - ay - t * dy) < 0.5 * Math.min(gx, gy)) { ok = false; break; }
      }
      if (ok) out.push([x, y]);
    }
  }
  return out;
}

// -------------------------------------------------------------------------------------------------------- extrusions

/** An extrusion: walls along the path from each profile, caps from the closed ones (outer with its holes). */
export function tessellateExtrusion(e, { tol = 0.01, mode = 'cached-first', stats = newStats() } = {}) {
  if (mode !== 'ours' && e.mesh) { const out = new Builder(); out.mesh(e.mesh, 0); stats.cached++; return out.done(); }
  const profiles = e.count > 1 && e.profile && e.profile.cls === 'polyCurve' ? e.profile.segs : e.profile ? [e.profile] : [];
  if (!profiles.length || !profiles.every((p) => curveOk(p))) { bump(stats, 'notRead', 'extrusion'); return null; }
  const T = unit(sub(e.path[1], e.path[0])), Uu = unit(e.up);
  if (!T || !Uu) { bump(stats, 'notRead', 'extrusion'); return null; }
  const X = unit(cross(Uu, T));
  if (!X) { bump(stats, 'notRead', 'extrusion'); return null; }
  const Y = cross(T, X);
  const at = (s) => [0, 1, 2].map((k) => e.path[0][k] + (e.path[1][k] - e.path[0][k]) * s);
  const P0 = at(e.t[0]), P1 = at(e.t[1]);
  const place = (O, q) => [O[0] + q[0] * X[0] + q[1] * Y[0], O[1] + q[0] * X[1] + q[1] * Y[1], O[2] + q[0] * X[2] + q[1] * Y[2]];
  if (e.mitered) stats.mitered++;
  const out = new Builder();
  const rings = [];
  profiles.forEach((pc, k) => {
    const { pts } = sampleCurve(pc, tol);
    const closed = pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) <= Math.max(tol, 1e-9);
    let ring = closed ? pts.slice(0, -1) : pts.slice();
    const area = ring.reduce((A, p, i) => { const q = ring[(i + 1) % ring.length]; return A + p[0] * q[1] - q[0] * p[1]; }, 0);
    if (closed && ((k === 0) !== (area > 0))) ring = ring.reverse();   // outer turns left, holes right: walls face out
    rings.push({ ring, closed });
  });
  let faceId = 0;
  for (const { ring, closed } of rings) {
    const n = ring.length, segs = closed ? n : n - 1;
    // a new face where the profile turns sharply (a corner of a rectangle), one face along a smooth run
    let prevDir = null;
    for (let i = 0; i < segs; i++) {
      const a = ring[i], c = ring[(i + 1) % n];
      const dir = unit([c[0] - a[0], c[1] - a[1], 0]);
      if (!dir) continue;
      if (!prevDir || dot(dir, prevDir) < Math.cos(30 * Math.PI / 180)) faceId++;
      prevDir = dir;
      const nn = [dir[1] * X[0] - dir[0] * Y[0], dir[1] * X[1] - dir[0] * Y[1], dir[1] * X[2] - dir[0] * Y[2]];
      const i0 = out.add(place(P0, a), nn), i1 = out.add(place(P0, c), nn), i2 = out.add(place(P1, c), nn), i3 = out.add(place(P1, a), nn);
      out.tri(i0, i1, i2, faceId); out.tri(i0, i2, i3, faceId);
    }
  }
  const capRings = rings.filter((r) => r.closed);
  const capped = e.oldCaps ? rings[0] && rings[0].closed : true;
  if (capRings.length && rings[0].closed && capped) {
    const flat = [], holes = [], pts = [];
    capRings.forEach((r, k) => { if (k) holes.push(pts.length); for (const p of r.ring) { flat.push(p[0], p[1]); pts.push(p); } });
    const tris = earcut(flat, holes);
    for (const [end, O, nn] of [[0, P0, T.map((x) => -x)], [1, P1, T]]) {
      if (!e.cap[end] && !e.oldCaps) continue;
      faceId++;
      const base = out.nv;
      for (const p of pts) out.add(place(O, p), nn);
      for (let k = 0; k < tris.length; k += 3) {
        const [a, c, d] = [tris[k], tris[k + 1], tris[k + 2]];
        const ar = (pts[c][0] - pts[a][0]) * (pts[d][1] - pts[a][1]) - (pts[d][0] - pts[a][0]) * (pts[c][1] - pts[a][1]);
        const up = (ar > 0) === (end === 1);
        if (up) out.tri(base + a, base + c, base + d, faceId); else out.tri(base + a, base + d, base + c, faceId);
      }
    }
  }
  bump(stats, 'ours', 'extrusion');
  return out.done();
}

export { curveDomain };
