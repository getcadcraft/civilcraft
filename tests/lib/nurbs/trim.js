/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * trim.js — cc-nurbs (0.8 DC.54 S2, session `apps-mount_PART_5`): TRIMMED surfaces. A surface keeps its whole B-spline patch; a trim is
 * the part of the patch that is shown and counted, drawn in the patch's own (u, v) plane: one OUTER loop (none = the whole patch) and any
 * number of HOLES. A loop is a closed polygon of [u, v] points (a circle or a projected curve is sampled finely; the surface itself is
 * never changed). DOM-free, written from the plain definitions (point in polygon by crossing number, ear clipping with hole bridges,
 * a grid cut by the loops) — no library's code read.
 *
 *   cleanTrim(x, s) → { outer: loop | null, holes: [loop] } | null     (untrusted input: loops cleaned, clamped to the patch, outer
 *       turned counter-clockwise and holes clockwise, so the shown region is always on the left of every loop; null = untrimmed)
 *   rectLoop(s, u0, u1, v0, v1) · circleLoop(s, u, v, r, n) — shares 0–1 of the patch's parameter range (the circle is round in the
 *       unit square, so an ellipse on a patch that is not square in parameters)
 *   curveLoop(s, curve, { tol, samples }) → loop      a closed 3-D curve lying on the surface, projected into (u, v); NurbsError
 *       nurbs.err.trim_open / trim_off when it is not closed or does not lie on the surface within tol mm
 *   addLoop(s, trim, loop, { hole }) → trim          adds the loop; fails nurbs.err.trim_self (crosses itself or another loop) or
 *       nurbs.err.trim_outside (a hole not inside the outer loop)
 *   contains(s, trim, u, v) → bool                   is the point in the shown part
 *   tessellate(s, trim, { tol, maxPerSpan, curvature }) → { positions, normals, uvs, indices, … }  as surface.tessellate, cut along the
 *       loops: every loop vertex and every crossing with the tessellation grid is a vertex, so neighbouring cells share them (no cracks)
 *   area(s, trim) → mm² of the shown part (from the cut mesh)        uvArea(trim) → the shown part in (u, v)
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as V from './vec.js';

const { fail } = C;
export const MAX_LOOPS = 64;
export const MAX_LOOP_POINTS = 4096;

// ------------------------------------------------------------------------------------------------ small geometry

const shoelace = (L) => { let a = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
const reversed = (L) => L.slice().reverse();

/** Crossing-number test: is [x, y] inside the polygon L (a boundary point may go either way). */
function inPoly(L, x, y) {
  let inside = false;
  for (let i = 0, j = L.length - 1; i < L.length; j = i++) {
    const a = L[i], b = L[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function segCross(p, q, r, s) {
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  if (d === 0) return false;
  const t = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  const u = ((r[0] - p[0]) * (q[1] - p[1]) - (r[1] - p[1]) * (q[0] - p[0])) / d;
  return t > 1e-12 && t < 1 - 1e-12 && u > 1e-12 && u < 1 - 1e-12;
}

/** Does any loop cross itself or another? (proper crossings only; O(n²) over at most MAX_LOOP_POINTS points each.) */
function crosses(loops) {
  for (let a = 0; a < loops.length; a++) for (let b = a; b < loops.length; b++) {
    const A = loops[a], B = loops[b];
    for (let i = 0; i < A.length; i++) {
      const p = A[i], q = A[(i + 1) % A.length];
      for (let j = a === b ? i + 2 : 0; j < B.length; j++) {
        if (a === b && (j === i || (j + 1) % B.length === i)) continue;
        if (segCross(p, q, B[j], B[(j + 1) % B.length])) return true;
      }
    }
  }
  return false;
}

// ------------------------------------------------------------------------------------------------ the trim data

function cleanLoop(x, s) {
  if (!Array.isArray(x)) return null;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  const L = [];
  for (const p of x) {
    if (!Array.isArray(p) || p.length < 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) fail('nurbs.err.trim_loop');
    const q = [Math.min(ub, Math.max(ua, p[0])), Math.min(vb, Math.max(va, p[1]))];
    const last = L[L.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) L.push(q);
  }
  if (L.length > 1 && L[0][0] === L[L.length - 1][0] && L[0][1] === L[L.length - 1][1]) L.pop();
  if (L.length > MAX_LOOP_POINTS) fail('nurbs.err.trim_loop');
  if (L.length < 3 || Math.abs(shoelace(L)) < 1e-14 * (ub - ua) * (vb - va)) fail('nurbs.err.trim_loop');
  return L;
}

export function cleanTrim(x, s) {
  if (x == null) return null;
  if (typeof x !== 'object' || Array.isArray(x)) fail('nurbs.err.trim_loop');
  const outer = x.outer == null ? null : cleanLoop(x.outer, s);
  const holes = Array.isArray(x.holes) ? x.holes.slice(0, MAX_LOOPS).map((h) => cleanLoop(h, s)).filter(Boolean) : [];
  if (!outer && !holes.length) return null;
  const o = outer ? (shoelace(outer) < 0 ? reversed(outer) : outer) : null;
  const hs = holes.map((h) => (shoelace(h) > 0 ? reversed(h) : h));
  return { outer: o, holes: hs };
}

export const rectLoop = (s, u0, u1, v0, v1) => {
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  const f = (a, b, t) => a + (b - a) * t;
  const x0 = f(ua, ub, Math.min(u0, u1)), x1 = f(ua, ub, Math.max(u0, u1)), y0 = f(va, vb, Math.min(v0, v1)), y1 = f(va, vb, Math.max(v0, v1));
  return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
};

export function circleLoop(s, u, v, r, n = 64) {
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n;
    out.push([ua + (ub - ua) * (u + r * Math.cos(a)), va + (vb - va) * (v + r * Math.sin(a))]);
  }
  return out;
}

export function curveLoop(s, curve, { tol = 0.1, samples = 256 } = {}) {
  const size = S.size(s);
  const [a, b] = C.domain(curve);
  const e = C.endsOf(curve);
  if (V.dist(e.start, e.end) > Math.max(tol, 1e-6 * size)) fail('nurbs.err.trim_open');
  const L = [];
  let uv0 = null;
  for (let i = 0; i < samples; i++) {
    const p = C.point(curve, a + (b - a) * i / samples);
    const r = S.closestPoint(s, p, uv0 ? { uv0 } : {});
    if (r.d > tol) fail('nurbs.err.trim_off', { mm: Math.round(r.d * 1e3) / 1e3 });
    uv0 = [r.u, r.v];
    L.push([r.u, r.v]);
  }
  return L;
}

export function addLoop(s, trim, loop, { hole = false } = {}) {
  const L = cleanLoop(loop, s);
  const cur = trim || { outer: null, holes: [] };
  const next = hole ? { outer: cur.outer, holes: [...cur.holes, shoelace(L) > 0 ? reversed(L) : L] } : { outer: shoelace(L) < 0 ? reversed(L) : L, holes: cur.holes };
  if (next.holes.length > MAX_LOOPS) fail('nurbs.err.trim_loop');
  const all = [...(next.outer ? [next.outer] : []), ...next.holes];
  if (crosses(all)) fail('nurbs.err.trim_self');
  if (next.outer) for (const h of next.holes) if (!h.every((p) => inPoly(next.outer, p[0], p[1]) || onLoop(next.outer, p))) fail('nurbs.err.trim_outside');
  return next;
}
const onLoop = (L, p) => L.some((q) => q[0] === p[0] && q[1] === p[1]);

export function contains(s, trim, u, v) {
  if (!trim) return true;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  if (u < ua || u > ub || v < va || v > vb) return false;
  if (trim.outer && !inPoly(trim.outer, u, v)) return false;
  for (const h of trim.holes) if (inPoly(h, u, v)) return false;
  return true;
}

export const uvArea = (trim, s = null) => {
  if (!trim) return null;
  let a = trim.outer ? shoelace(trim.outer) : (s ? (S.domainU(s)[1] - S.domainU(s)[0]) * (S.domainV(s)[1] - S.domainV(s)[0]) : 0);
  for (const h of trim.holes) a += shoelace(h);   // holes are clockwise: negative
  return a;
};

// ------------------------------------------------------------------------------------------------ ear clipping (with hole bridges)

const cross3 = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const sameXY = (a, b) => a.x === b.x && a.y === b.y;
function inTri(a, b, c, p) {
  return (c.x - p.x) * (a.y - p.y) - (a.x - p.x) * (c.y - p.y) >= 0 && (a.x - p.x) * (b.y - p.y) - (b.x - p.x) * (a.y - p.y) >= 0 && (b.x - p.x) * (c.y - p.y) - (c.x - p.x) * (b.y - p.y) >= 0;
}

/** A counter-clockwise ring (array of {x, y, id}) → triangles (id triples). Collinear vertices keep a degenerate triangle, so a
 *  vertex a neighbour also uses is never dropped (no crack). Falls back to a fan when numbers leave no ear. */
function earClip(ring) {
  const tris = [];
  let r = ring.slice();
  let guard = r.length * r.length + 16;
  while (r.length > 3 && guard-- > 0) {
    const n = r.length;
    let cut = -1;
    for (let i = 0; i < n && cut < 0; i++) {
      const a = r[(i + n - 1) % n], b = r[i], c = r[(i + 1) % n];
      const cr = cross3(a, b, c);
      if (Math.abs(cr) < 1e-18) { cut = i; break; }   // collinear (or a spike): emit it flat and drop b
      if (cr < 0) continue;
      let clear = true;
      for (let k = 0; k < n; k++) {
        const p = r[k];
        if (p === a || p === b || p === c || sameXY(p, a) || sameXY(p, b) || sameXY(p, c)) continue;
        if (inTri(a, b, c, p)) { clear = false; break; }
      }
      if (clear) cut = i;
    }
    if (cut < 0) break;
    const a = r[(cut + n - 1) % n], b = r[cut], c = r[(cut + 1) % n];
    tris.push([a.id, b.id, c.id]);
    r.splice(cut, 1);
  }
  if (r.length >= 3) for (let i = 1; i + 1 < r.length; i++) tris.push([r[0].id, r[i].id, r[i + 1].id]);
  return tris;
}

/** outer (counter-clockwise) with holes (clockwise), each an array of {x, y, id}; holes bridged into the outer ring. */
function triangulate(outer, holes) {
  let ring = outer.slice();
  const hs = holes.map((h) => ({ h, m: h.reduce((bi, p, i) => (p.x > h[bi].x ? i : bi), 0) })).sort((a, b) => b.h[b.m].x - a.h[a.m].x);
  for (const { h, m } of hs) {
    const M = h[m];
    // the nearest outer edge hit by a ray to the right of M
    let best = null, bx = Infinity;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      if ((a.y > M.y) === (b.y > M.y) && !(a.y === M.y || b.y === M.y)) continue;
      if (a.y === b.y) continue;
      const x = a.x + (M.y - a.y) * (b.x - a.x) / (b.y - a.y);
      if (x >= M.x && x < bx && ((a.y <= M.y && b.y >= M.y) || (b.y <= M.y && a.y >= M.y))) { bx = x; best = a.x > b.x ? i : (i + 1) % ring.length; }
    }
    if (best == null) continue;   // not inside: the hole is dropped rather than a broken ring built
    // a reflex vertex inside the triangle (M, hit, endpoint) is a better, truly visible target
    const P = ring[best], I = { x: bx, y: M.y };
    let cand = best, ca = Infinity;
    for (let k = 0; k < ring.length; k++) {
      const q = ring[k];
      if (q.x >= M.x && q.x <= P.x && inTri(M, I, P, q) && !sameXY(q, M)) {
        const ang = Math.abs(Math.atan2(q.y - M.y, q.x - M.x));
        if (ang < ca || (ang === ca && q.x < ring[cand].x)) { ca = ang; cand = k; }
      }
    }
    const rot = h.slice(m).concat(h.slice(0, m));
    const bridge = [...rot, rot[0], ring[cand]];
    ring = [...ring.slice(0, cand + 1), ...bridge, ...ring.slice(cand + 1)];
  }
  return earClip(ring);
}

// ------------------------------------------------------------------------------------------------ tessellation

/** span parameters, as surface.tessellate chooses them (re-derived through a plain tessellation's own parameter lists) */
function gridParams(s, tol, maxPerSpan, uParams, vParams) {
  if (uParams && vParams) return [uParams, vParams];
  const g = S.tessellate(s, { tol, maxPerSpan, uParams, vParams });
  return [g.uParams, g.vParams];
}

export function tessellate(s, trim, { tol = 0.01, maxPerSpan = 64, uParams = null, vParams = null, curvature: withK = false } = {}) {
  if (!trim || (!trim.outer && !trim.holes.length)) return S.tessellate(s, { tol, maxPerSpan, uParams, vParams, curvature: withK });
  const [up, vp] = gridParams(s, tol, maxPerSpan, uParams, vParams);
  const nu = up.length - 1, nv = vp.length - 1;
  const du = (up[nu] - up[0]) * 1e-6, dv = (vp[nv] - vp[0]) * 1e-6;

  // loops: off the grid lines (a vertex on a line is moved a hair), inside the patch
  const nudge = (x, lines, d) => { for (const L of lines) if (Math.abs(x - L) < d * 0.5) return L + d; return x; };
  const loops = [];
  if (trim.outer) loops.push(trim.outer);
  for (const h of trim.holes) loops.push(h);
  const fixed = loops.map((L) => L.map((p) => [Math.min(up[nu] - du, Math.max(up[0] + du, nudge(p[0], up, du))), Math.min(vp[nv] - dv, Math.max(vp[0] + dv, nudge(p[1], vp, dv)))]));

  // vertex registry
  const vx = [], vy = [], reg = new Map();
  const vid = (u, v) => { const k = u + '|' + v; let i = reg.get(k); if (i === undefined) { i = vx.length; vx.push(u); vy.push(v); reg.set(k, i); } return i; };
  const cellOf = (list, x) => { let lo = 0, hi = list.length - 2; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (list[m] <= x) lo = m; else hi = m - 1; } return lo; };
  const uCross = Array.from({ length: nu + 1 }, () => []), vCross = Array.from({ length: nv + 1 }, () => []);   // per grid line: the other coordinate of each crossing
  const pieces = new Map();   // cell → [[a, b], …] directed loop pieces
  const addPiece = (a, b) => {
    const mu = (vx[a] + vx[b]) / 2, mv = (vy[a] + vy[b]) / 2;
    const k = cellOf(up, mu) * nv + cellOf(vp, mv);
    let l = pieces.get(k); if (!l) pieces.set(k, l = []);
    l.push([a, b]);
  };
  for (const L of fixed) {
    for (let i = 0; i < L.length; i++) {
      const p = L[i], q = L[(i + 1) % L.length];
      const cuts = [];
      const i0 = cellOf(up, p[0]), i1 = cellOf(up, q[0]);
      for (let k = Math.min(i0, i1) + 1; k <= Math.max(i0, i1); k++) { const t = (up[k] - p[0]) / (q[0] - p[0]); cuts.push({ t, u: up[k], v: p[1] + t * (q[1] - p[1]), line: 'u', k }); }
      const j0 = cellOf(vp, p[1]), j1 = cellOf(vp, q[1]);
      for (let k = Math.min(j0, j1) + 1; k <= Math.max(j0, j1); k++) { const t = (vp[k] - p[1]) / (q[1] - p[1]); cuts.push({ t, u: p[0] + t * (q[0] - p[0]), v: vp[k], line: 'v', k }); }
      cuts.sort((a, b) => a.t - b.t);
      let prev = vid(p[0], p[1]);
      for (const c of cuts) {
        const cur = vid(c.u, c.v);
        if (c.line === 'u') uCross[c.k].push(c.v); else vCross[c.k].push(c.u);
        if (cur !== prev) addPiece(prev, cur);
        prev = cur;
      }
      const end = vid(q[0], q[1]);
      if (end !== prev) addPiece(prev, end);
    }
  }
  for (const a of uCross) a.sort((x, y) => x - y);
  for (const a of vCross) a.sort((x, y) => x - y);

  const inside = (x, y) => {
    if (trim.outer && !inPoly(trim.outer, x, y)) return false;
    for (const h of trim.holes) if (inPoly(h, x, y)) return false;
    return true;
  };
  const tris = [];
  const dropped = { open: 0 };
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const u0 = up[i], u1 = up[i + 1], v0 = vp[j], v1 = vp[j + 1];
    const mine = pieces.get(i * nv + j);
    if (!mine) {
      if (!inside((u0 + u1) / 2, (v0 + v1) / 2)) continue;
      const a = vid(u0, v0), b = vid(u1, v0), c = vid(u1, v1), d = vid(u0, v1);
      tris.push([a, b, c], [a, c, d]);
      continue;
    }
    // the cell's own edges, split at the crossings on them, counter-clockwise; an edge piece stays when the shown part lies on its left
    const segs = mine.slice();
    const eps = Math.min(u1 - u0, v1 - v0) * 1e-6;
    const edge = (pts, fixedCoord, along, inward) => {
      for (let k = 0; k + 1 < pts.length; k++) {
        const a = pts[k], b = pts[k + 1];
        if (a === b) continue;
        const m = (a + b) / 2;
        const x = along === 'u' ? m : fixedCoord + inward[0] * eps, y = along === 'u' ? fixedCoord + inward[1] * eps : m;
        if (inside(x, y)) segs.push(along === 'u' ? [vid(a, fixedCoord), vid(b, fixedCoord)] : [vid(fixedCoord, a), vid(fixedCoord, b)]);
      }
    };
    const within = (arr, lo, hi) => arr.filter((x) => x > lo && x < hi);
    const bottom = [u0, ...within(vCross[j], u0, u1), u1];
    const right = [v0, ...within(uCross[i + 1], v0, v1), v1];
    const top = [u1, ...within(vCross[j + 1], u0, u1).reverse(), u0];
    const left = [v1, ...within(uCross[i], v0, v1).reverse(), v0];
    edge(bottom, v0, 'u', [0, 1]);
    edge(right, u1, 'v', [-1, 0]);
    edge(top, v1, 'u', [0, -1]);
    edge(left, u0, 'v', [1, 0]);
    // chain the directed pieces into closed loops
    const out = new Map();
    for (let k = 0; k < segs.length; k++) { const a = segs[k][0]; if (!out.has(a)) out.set(a, []); out.get(a).push(k); }
    const used = new Array(segs.length).fill(false);
    const chains = [];
    for (let k = 0; k < segs.length; k++) {
      if (used[k]) continue;
      const chain = [segs[k][0]];
      let cur = k, closed = false;
      for (let guard = 0; guard <= segs.length; guard++) {
        used[cur] = true;
        const to = segs[cur][1];
        if (to === chain[0]) { closed = true; break; }
        chain.push(to);
        const nxt = (out.get(to) || []).find((q) => !used[q]);
        if (nxt === undefined) break;
        cur = nxt;
      }
      if (closed && chain.length >= 3) chains.push(chain); else dropped.open++;
    }
    const pt = (id) => ({ x: vx[id], y: vy[id], id });
    const outers = [], holes = [];
    for (const ch of chains) {
      const ring = ch.map(pt);
      const area = shoelace(ring.map((p) => [p.x, p.y]));
      (area >= 0 ? outers : holes).push(ring);
    }
    for (const o of outers) {
      const mine2 = holes.filter((h) => inPoly(o.map((p) => [p.x, p.y]), h[0].x, h[0].y));
      for (const t of triangulate(o, mine2)) tris.push(t);
    }
  }

  // evaluate the surface at the vertices that are used
  const remap = new Map(), order = [];
  const idx = new Uint32Array(tris.length * 3);
  tris.forEach((t, k) => t.forEach((id, c) => {
    let m = remap.get(id);
    if (m === undefined) { m = order.length; order.push(id); remap.set(id, m); }
    idx[k * 3 + c] = m;
  }));
  const n = order.length;
  const positions = new Float64Array(n * 3), normals = new Float64Array(n * 3), uvs = new Float64Array(n * 2);
  const K = withK ? new Float64Array(n) : null, H = withK ? new Float64Array(n) : null;
  order.forEach((id, m) => {
    const u = vx[id], v = vy[id];
    positions.set(S.point(s, u, v), m * 3); normals.set(S.normal(s, u, v), m * 3);
    uvs[m * 2] = u; uvs[m * 2 + 1] = v;
    if (withK) { const c = S.curvature(s, u, v); K[m] = c.K; H[m] = c.H; }
  });
  const res = { positions, normals, uvs, indices: idx, nu: 0, nv: 0, uParams: up, vParams: vp, trimmed: true, openPieces: dropped.open };
  if (withK) { res.K = K; res.H = H; }
  return res;
}

/** Area (mm²) of the shown part, from the cut mesh. */
export function area(s, trim, opts = {}) {
  const t = tessellate(s, trim, opts);
  let a = 0;
  const P = t.positions;
  for (let i = 0; i < t.indices.length; i += 3) {
    const o = [t.indices[i] * 3, t.indices[i + 1] * 3, t.indices[i + 2] * 3];
    const p = o.map((k) => [P[k], P[k + 1], P[k + 2]]);
    a += V.len(V.cross(V.sub(p[1], p[0]), V.sub(p[2], p[0]))) / 2;
  }
  return a;
}
