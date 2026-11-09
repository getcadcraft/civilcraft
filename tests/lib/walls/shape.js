/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/shape.js — the Shape block of the wall tool (0.9 WT.6, wall tool spec page 7: attach top / base, edit profile, slanted wall;
 * session walls-09, design in docs/0.9-sessions/walls-09.md § WT.6 design). Host-free: no DOM, no IFC, plan millimetres. The host gives
 * the wall's joined plan outline and its heights; this answers the shaped body as a closed shell of planar faces, which the host writes in
 * its own format (BimCraft: IfcFacetedBrep). The plan outline, the joins and the location line are never changed by a shape.
 *
 * A wall here: { a, b, t, height } (straight walls only: a curved wall keeps its extrusion). Heights are the wall's own: 0 at its base.
 *
 *   parseShape(json) / formatShape(shape)   the wall's shape settings { profile: { top: [[s, z]...], bottom: [[s, z]...] } | null,
 *                                         attachTop: guid | '', attachBase: guid | '', slant: [deg] | [degLeft, degRight] | null }
 *   hasShape(shape)                       true when any setting changes the body
 *   profileAt(line, s)                    a profile line's height at s (linear between its points, level past its ends); null for no line
 *   checkProfile(line, L)                 throws { key: 'wshape.err.profile' } unless the points run along the wall once (s rising)
 *   shapeBody(wall, outline, { topAt, baseAt, breaks, slant })   the closed shell → { verts: [[x, y, z]...], faces: [[i, j, k...]...],
 *                                         volume, sideArea, footArea }; topAt(p, s) / baseAt(p, s) give the height at a plan point (s along
 *                                         the wall), `breaks` the s values where they change slope (each becomes a ring vertex on both faces),
 *                                         slant [deg] or [left, right] from vertical (+ leans to the wall's left)
 *   lineBreaks(wall, polys)               the s values where the wall's two faces and centre line cross the edges of these plan polygons
 *                                         (a roof's faces, a slab's outline): where an attached surface can change plane
 *   inPoly(p, poly)
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const fail = (key) => { throw Object.assign(new Error(key), { key }); };
const D2R = Math.PI / 180;
export const MIN_H = 10;   // mm: no part of a shaped wall lower than this

export function parseShape(json) {
  let o = null;
  try { o = json ? JSON.parse(json) : null; } catch (e) { o = null; }
  const line = (x) => (Array.isArray(x) && x.length >= 2 && x.every((q) => Array.isArray(q) && q.length === 2 && q.every(Number.isFinite)) ? x.map((q) => [q[0], q[1]]) : null);
  const profile = o?.profile && (line(o.profile.top) || line(o.profile.bottom)) ? { top: line(o.profile.top), bottom: line(o.profile.bottom) } : null;
  const slant = Array.isArray(o?.slant) && o.slant.length >= 1 && o.slant.length <= 2 && o.slant.every((v) => Number.isFinite(v) && Math.abs(v) < 60) && o.slant.some((v) => Math.abs(v) > 1e-9) ? o.slant.slice() : null;
  return { profile, slant, attachTop: typeof o?.attachTop === 'string' ? o.attachTop : '', attachBase: typeof o?.attachBase === 'string' ? o.attachBase : '' };
}
export function formatShape(s) {
  if (!hasShape(s)) return '';
  const out = {};
  if (s.profile && (s.profile.top || s.profile.bottom)) out.profile = { ...(s.profile.top ? { top: s.profile.top } : {}), ...(s.profile.bottom ? { bottom: s.profile.bottom } : {}) };
  if (s.slant) out.slant = s.slant;
  if (s.attachTop) out.attachTop = s.attachTop;
  if (s.attachBase) out.attachBase = s.attachBase;
  return JSON.stringify(out);
}
export const hasShape = (s) => !!(s && ((s.profile && (s.profile.top || s.profile.bottom)) || (s.slant && s.slant.some((v) => Math.abs(v) > 1e-9)) || s.attachTop || s.attachBase));

export function profileAt(line, s) {
  if (!line || !line.length) return null;
  if (s <= line[0][0]) return line[0][1];
  for (let i = 1; i < line.length; i++) {
    const [s0, z0] = line[i - 1], [s1, z1] = line[i];
    if (s <= s1) return s1 - s0 < 1e-9 ? z1 : z0 + (z1 - z0) * (s - s0) / (s1 - s0);
  }
  return line[line.length - 1][1];
}
export function checkProfile(line, L) {
  if (!line) return;
  if (line.length < 2) fail('wshape.err.profile');
  for (let i = 0; i < line.length; i++) {
    const [s, z] = line[i];
    if (!Number.isFinite(s) || !Number.isFinite(z) || s < -1 || s > L + 1) fail('wshape.err.profile');
    if (i && s <= line[i - 1][0]) fail('wshape.err.profile');
  }
}

export function inPoly(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

export function lineBreaks(wall, polys) {
  const L = dist(wall.a, wall.b), u = [(wall.b[0] - wall.a[0]) / L, (wall.b[1] - wall.a[1]) / L], n = [-u[1], u[0]], out = [];
  for (const off of [wall.t / 2, 0, -wall.t / 2]) {
    const p0 = [wall.a[0] + n[0] * off, wall.a[1] + n[1] * off];
    for (const poly of polys) for (let i = 0; i < poly.length; i++) {
      const q = poly[i], r = sub(poly[(i + 1) % poly.length], q), c = cross(u, r);
      if (Math.abs(c) < 1e-9) continue;
      const d = sub(q, p0), s = cross(d, r) / c, k = cross(d, u) / c;
      if (k >= -1e-9 && k <= 1 + 1e-9) out.push(s);
    }
  }
  return out;
}

/** Ear clipping of a simple polygon (2D points, either winding) → triangles as index triples into it, anticlockwise. */
function triangulate(P) {
  const n = P.length;
  if (n < 3) return [];
  let area = 0;
  for (let i = 0; i < n; i++) area += cross(P[i], P[(i + 1) % n]);
  const idx = [...Array(n).keys()];
  if (area < 0) idx.reverse();
  const tris = [];
  const inTri = (p, a, b, c) => cross(sub(b, a), sub(p, a)) >= -1e-9 && cross(sub(c, b), sub(p, b)) >= -1e-9 && cross(sub(a, c), sub(p, c)) >= -1e-9;
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k - 1 + idx.length) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = P[i0], b = P[i1], c = P[i2];
      const z = cross(sub(b, a), sub(c, b));
      if (z <= 1e-9) { if (Math.abs(z) <= 1e-9 && dist(a, c) > 1e-9) { idx.splice(k, 1); cut = true; break; } continue; }
      if (idx.some((j) => j !== i0 && j !== i1 && j !== i2 && inTri(P[j], a, b, c) && dist(P[j], a) > 1e-9 && dist(P[j], b) > 1e-9 && dist(P[j], c) > 1e-9)) continue;
      tris.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) tris.push([idx[0], idx[1], idx[2]]);
  return tris;
}

/** Cut a polygon between two lines s = lo and s = hi (s = dot(p − a, u)). */
function clipS(poly, a, u, lo, hi) {
  const side = (p) => dot(sub(p, a), u);
  const clip = (pts, k, keepAbove) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], sp = side(p), sq = side(q);
      const ip = keepAbove ? sp >= k - 1e-7 : sp <= k + 1e-7, iq = keepAbove ? sq >= k - 1e-7 : sq <= k + 1e-7;
      if (ip) out.push(p);
      if (ip !== iq) { const t = (k - sp) / (sq - sp); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  };
  return clip(clip(poly, lo, true), hi, false);
}

export function shapeBody(wall, outline, { topAt, baseAt, breaks = [], slant = null } = {}) {
  const L = dist(wall.a, wall.b), u = [(wall.b[0] - wall.a[0]) / L, (wall.b[1] - wall.a[1]) / L], n = [-u[1], u[0]];
  const sOf = (p) => dot(sub(p, wall.a), u), offOf = (p) => dot(sub(p, wall.a), n);
  // the ring: the outline with a vertex on every edge where it crosses a break
  const S = outline.map(sOf), lo = Math.min(...S), hi = Math.max(...S);
  const cuts = [...new Set(breaks.filter((s) => s > lo + 0.5 && s < hi - 0.5).map((s) => Math.round(s * 1000) / 1000))].sort((x, y) => x - y);
  const ring = [];
  for (let i = 0; i < outline.length; i++) {
    const p = outline[i], q = outline[(i + 1) % outline.length], sp = sOf(p), sq = sOf(q);
    ring.push(p);
    const inner = cuts.filter((s) => (s - sp) * (s - sq) < 0 && Math.abs(s - sp) > 0.5 && Math.abs(s - sq) > 0.5).sort((x, y) => (sq > sp ? x - y : y - x));
    for (const s of inner) { const t = (s - sp) / (sq - sp); ring.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  const key = (p) => Math.round(p[0] * 1000) + ',' + Math.round(p[1] * 1000);
  const index = new Map(ring.map((p, i) => [key(p), i]));
  const idxOf = (p) => { const i = index.get(key(p)); if (i !== undefined) return i; let best, bd = 1; ring.forEach((q, j) => { const d = dist(p, q); if (d < bd) { bd = d; best = j; } }); return best; };
  const N = ring.length, half = wall.t / 2;
  const sl = slant ? (slant.length === 1 ? [slant[0], slant[0]] : slant) : [0, 0];
  const tanL = Math.tan(sl[0] * D2R), tanR = Math.tan(sl[1] * D2R);
  const zb = ring.map((p) => baseAt(p, sOf(p))), zt = ring.map((p) => topAt(p, sOf(p)));
  for (let i = 0; i < N; i++) if (!(zt[i] - zb[i] >= MIN_H)) fail('wshape.err.low');
  const verts = [];
  for (let i = 0; i < N; i++) verts.push([ring[i][0], ring[i][1], zb[i]]);
  for (let i = 0; i < N; i++) {
    const off = offOf(ring[i]), f = half > 0 ? Math.max(-1, Math.min(1, off / half)) : 0;   // +1 on the left face, −1 on the right, between for the ends
    const tn = (tanL * (1 + f) + tanR * (1 - f)) / 2, h = zt[i] - zb[i];
    verts.push([ring[i][0] + n[0] * tn * h, ring[i][1] + n[1] * tn * h, zt[i]]);
  }
  const faces = [];
  // top and bottom: cut in strips between the breaks so each strip is one plane, then into triangles
  const edges = [lo - 1, ...cuts, hi + 1];
  for (let k = 1; k < edges.length; k++) {
    const strip = clipS(ring, wall.a, u, edges[k - 1], edges[k]).map(idxOf).filter((i, j, all) => i !== undefined && all.indexOf(i) === j);
    if (strip.length < 3) continue;
    for (const [i, j, m] of triangulate(strip.map((i) => ring[i]))) {
      const A = strip[i], B = strip[j], C = strip[m];
      faces.push([N + A, N + B, N + C]);   // top: anticlockwise seen from above
      faces.push([C, B, A]);               // bottom: the other way round
    }
  }
  // the sides: one quad per ring edge (two triangles when it is not flat)
  let sideArea = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, q = [i, j, N + j, N + i];
    if (planar(q.map((k) => verts[k]))) faces.push(q); else { faces.push([i, j, N + j]); faces.push([i, N + j, N + i]); }
    if (offOf(ring[i]) > half - 0.5 && offOf(ring[j]) > half - 0.5) sideArea += Math.abs(sOf(ring[j]) - sOf(ring[i])) * ((zt[i] - zb[i]) + (zt[j] - zb[j])) / 2;
  }
  let volume = 0;
  for (const f of faces) for (let k = 1; k + 1 < f.length; k++) volume += det3(verts[f[0]], verts[f[k]], verts[f[k + 1]]) / 6;
  let footArea = 0;
  for (let i = 0; i < N; i++) footArea += cross(ring[i], ring[(i + 1) % N]) / 2;
  return { verts, faces, volume: Math.abs(volume), sideArea, footArea: Math.abs(footArea), ring: N };
}
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
function planar(P) {
  const v1 = [P[1][0] - P[0][0], P[1][1] - P[0][1], P[1][2] - P[0][2]], v2 = [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]];
  const nn = [v1[1] * v2[2] - v1[2] * v2[1], v1[2] * v2[0] - v1[0] * v2[2], v1[0] * v2[1] - v1[1] * v2[0]], m = Math.hypot(...nn);
  if (m < 1e-9) return false;
  const v3 = [P[3][0] - P[0][0], P[3][1] - P[0][1], P[3][2] - P[0][2]];
  return Math.abs(nn[0] * v3[0] + nn[1] * v3[1] + nn[2] * v3[2]) / m < 0.01;
}
