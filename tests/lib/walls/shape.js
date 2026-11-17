/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/shape.js — the Shape block of the wall tool (0.9 WT.6, wall tool spec page 7: attach top / base, edit profile, slanted wall;
 * session walls-09, design in docs/0.9-sessions/walls-09.md § WT.6 design). Host-free: no DOM, no IFC, plan millimetres. The host gives
 * the wall's joined plan outline and its heights; this answers the shaped body as a closed shell of planar faces, which the host writes in
 * its own format (BimCraft: IfcFacetedBrep). The plan outline, the joins and the location line are never changed by a shape.
 *
 * A wall here: { a, b, t, height, bulge? } (bulge = tan(θ / 4) of a curved wall's centre line, + anticlockwise, 0 or missing = straight).
 * Heights are the wall's own: 0 at its base. A curved wall (walls-shape-10): `s` runs along its arc, its outline comes in chords (the
 * plan's own), its top and base are cut in strips between the chords' stations and every face is flat (triangles where four points are not).
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
 *   arcFrame(wall)                        a curved wall's own coordinates → { C, R, sg, theta, L, toL(p) → [s, off], toW([s, off]) → p,
 *                                         normal(s) } (off to the wall's left), null for a straight wall
 *   cutOutline(wall, outline, { slant, cut, topAt, baseAt })   a slanted wall's outline where a level plane `cut` above its base cuts it
 *                                         (each vertex moved sideways by tan(angle of its face) × its height at the cut); the outline itself
 *                                         when nothing leans
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
  const F = arcFrame(wall);
  if (F) return arcBreaks(wall, F, polys);
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
  const F = arcFrame(wall);
  if (F) return arcBody(wall, outline, F, { topAt, baseAt, breaks, slant });
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

// ------------------------------------------------------------------------------------------------- curved walls (walls-shape-10)
const TAU = 2 * Math.PI;
const wrapPi = (x) => { let y = (x + Math.PI) % TAU; if (y <= 0) y += TAU; return y - Math.PI; };
/** A curved wall's own coordinates (the same arc BimCraft's model-arcs.js arcOf gives): null when the wall is straight. */
export function arcFrame(wall) {
  const bg = Number(wall?.bulge) || 0, a = wall.a, b = wall.b, c = dist(a, b);
  if (!(Math.abs(bg) > 1e-9) || c < 1e-9) return null;
  const theta = 4 * Math.atan(bg), nl = [-(b[1] - a[1]) / c, (b[0] - a[0]) / c], h = bg * c / 2;
  const mid = [(a[0] + b[0]) / 2 - nl[0] * h, (a[1] + b[1]) / 2 - nl[1] * h];
  const R = ((c / 2) ** 2 + h * h) / (2 * Math.abs(h)), sg = Math.sign(theta);
  const C = [mid[0] + nl[0] * R * sg, mid[1] + nl[1] * R * sg], a0 = Math.atan2(a[1] - C[1], a[0] - C[0]), half = Math.abs(theta) / 2;
  return {
    C, R, sg, theta, L: R * Math.abs(theta),
    toL: (p) => [R * (wrapPi((Math.atan2(p[1] - C[1], p[0] - C[0]) - a0) * sg - half) + half), (R - dist(p, C)) * sg],
    toW: ([s, off]) => { const f = a0 + sg * s / R, r = R - off * sg; return [C[0] + r * Math.cos(f), C[1] + r * Math.sin(f)]; },
    normal: (s) => { const f = a0 + sg * s / R; return [-sg * Math.cos(f), -sg * Math.sin(f)]; },
  };
}
/** Where a curved wall's two faces and centre line (circles) cross the edges of these plan polygons: the s values. */
function arcBreaks(wall, F, polys) {
  const out = [];
  for (const off of [wall.t / 2, 0, -wall.t / 2]) {
    const r = F.R - off * F.sg;
    if (!(r > 0)) continue;
    for (const poly of polys) for (let i = 0; i < poly.length; i++) {
      const q = poly[i], d = sub(poly[(i + 1) % poly.length], q), m = sub(q, F.C);
      const A = dot(d, d), B = 2 * dot(m, d), Cc = dot(m, m) - r * r, disc = B * B - 4 * A * Cc;
      if (A < 1e-12 || disc < 0) continue;
      const sq = Math.sqrt(disc);
      for (const k of [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
        if (k < -1e-9 || k > 1 + 1e-9) continue;
        const s = F.toL([q[0] + d[0] * k, q[1] + d[1] * k])[0];
        if (s > -1 && s < F.L + 1) out.push(s);
      }
    }
  }
  return out;
}
/** Keep the part of a polygon (local [s, off] points) between s = lo and s = hi. */
function clipLocal(poly, lo, hi) {
  const clip = (pts, k, above) => {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      const ip = above ? p[0] >= k - 1e-7 : p[0] <= k + 1e-7, iq = above ? q[0] >= k - 1e-7 : q[0] <= k + 1e-7;
      if (ip) out.push(p);
      if (ip !== iq) { const t = (k - p[0]) / (q[0] - p[0]); out.push([k, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  };
  return clip(clip(poly, lo, true), hi, false);
}
/**
 * The shaped body of a curved wall. Worked in the wall's own [s, off] coordinates (a rectangle with the joins' corners at its ends), so
 * the rules are the straight wall's: a ring vertex wherever an edge crosses a break, the top and base cut in strips. The strips' edges
 * are the breaks AND the chords' stations (at least 1 mm apart), so no face of the top runs over more than one chord of the arc.
 */
function arcBody(wall, outline, F, { topAt, baseAt, breaks = [], slant = null }) {
  const half = wall.t / 2;
  const RL = outline.map((p) => F.toL(p));
  const S = RL.map((q) => q[0]), lo = Math.min(...S), hi = Math.max(...S);
  const want = [...breaks.map((s) => [s, 0]), ...S.map((s) => [s, 1])].filter(([s]) => s > lo + 0.5 && s < hi - 0.5).map(([s, k]) => [Math.round(s * 1000) / 1000, k]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const cuts = [];
  for (const [s, k] of want) {   // a break is always kept; a chord's station only when it is not within 1 mm of a cut already there
    const last = cuts[cuts.length - 1];
    if (last !== undefined && s - last < (k ? 1 : 1e-6)) continue;
    cuts.push(s);
  }
  const ringL = [], ring = [];
  for (let i = 0; i < RL.length; i++) {
    const p = RL[i], q = RL[(i + 1) % RL.length];
    ringL.push(p); ring.push(outline[i]);
    const inner = cuts.filter((s) => (s - p[0]) * (s - q[0]) < 0 && Math.abs(s - p[0]) > 0.5 && Math.abs(s - q[0]) > 0.5).sort((x, y) => (q[0] > p[0] ? x - y : y - x));
    for (const s of inner) { const t = (s - p[0]) / (q[0] - p[0]), v = [s, p[1] + (q[1] - p[1]) * t]; ringL.push(v); ring.push(F.toW(v)); }
  }
  const key = (q) => Math.round(q[0] * 1000) + ',' + Math.round(q[1] * 1000);
  const index = new Map(ringL.map((q, i) => [key(q), i]));
  const idxOf = (q) => { const i = index.get(key(q)); if (i !== undefined) return i; let best, bd = 1; ringL.forEach((v, j) => { const d = dist(q, v); if (d < bd) { bd = d; best = j; } }); return best; };
  const N = ring.length;
  const sl = slant ? (slant.length === 1 ? [slant[0], slant[0]] : slant) : [0, 0];
  const tanL = Math.tan(sl[0] * D2R), tanR = Math.tan(sl[1] * D2R);
  const zb = ring.map((p, i) => baseAt(p, ringL[i][0])), zt = ring.map((p, i) => topAt(p, ringL[i][0]));
  for (let i = 0; i < N; i++) if (!(zt[i] - zb[i] >= MIN_H)) fail('wshape.err.low');
  const verts = [];
  for (let i = 0; i < N; i++) verts.push([ring[i][0], ring[i][1], zb[i]]);
  for (let i = 0; i < N; i++) {
    const [s, off] = ringL[i], f = half > 0 ? Math.max(-1, Math.min(1, off / half)) : 0;
    const tn = (tanL * (1 + f) + tanR * (1 - f)) / 2, h = zt[i] - zb[i];
    const p = tn ? F.toW([s, off + tn * h]) : ring[i];   // a leaning face moves along the radius
    verts.push([p[0], p[1], zt[i]]);
  }
  const faces = [];
  const edges = [lo - 1, ...cuts, hi + 1];
  for (let k = 1; k < edges.length; k++) {
    const strip = clipLocal(ringL, edges[k - 1], edges[k]).map(idxOf).filter((i, j, all) => i !== undefined && all.indexOf(i) === j);
    if (strip.length < 3) continue;
    for (const [i, j, m] of triangulate(strip.map((i) => ringL[i]))) {
      const A = strip[i], B = strip[j], C = strip[m];
      faces.push([N + A, N + B, N + C]);
      faces.push([C, B, A]);
    }
  }
  let sideArea = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N, q = [i, j, N + j, N + i];
    if (planar(q.map((k) => verts[k]))) faces.push(q); else { faces.push([i, j, N + j]); faces.push([i, N + j, N + i]); }
    if (ringL[i][1] > half * 0.5 && ringL[j][1] > half * 0.5) sideArea += Math.abs(ringL[j][0] - ringL[i][0]) * ((zt[i] - zb[i]) + (zt[j] - zb[j])) / 2;
  }
  let volume = 0;
  for (const f of faces) for (let k = 1; k + 1 < f.length; k++) volume += det3(verts[f[0]], verts[f[k]], verts[f[k + 1]]) / 6;
  let footArea = 0;
  for (let i = 0; i < N; i++) footArea += cross(ring[i], ring[(i + 1) % N]) / 2;
  return { verts, faces, volume: Math.abs(volume), sideArea, footArea: Math.abs(footArea), ring: N };
}

// ------------------------------------------------------------------------------------- a slanted wall on the plan (walls-shape-10)
/**
 * The outline of a slanted wall where a level plane cuts it: `cut` mm above the wall's base (its own heights). Each outline vertex moves
 * sideways by tan(the angle of its face) × (cut − its base there), never past its own top. The joins stay at the base: this is only
 * what the plan draws at its cut height. With no slant (or a cut at the base) → the outline, unchanged.
 */
export function cutOutline(wall, outline, { slant = null, cut = 0, topAt = null, baseAt = null } = {}) {
  if (!slant || !slant.some((v) => Math.abs(v) > 1e-9)) return outline;
  const sl = slant.length === 1 ? [slant[0], slant[0]] : slant, tanL = Math.tan(sl[0] * D2R), tanR = Math.tan(sl[1] * D2R), half = wall.t / 2;
  const F = arcFrame(wall);
  const L = dist(wall.a, wall.b) || 1, u = [(wall.b[0] - wall.a[0]) / L, (wall.b[1] - wall.a[1]) / L], n = [-u[1], u[0]];
  return outline.map((p) => {
    const [s, off] = F ? F.toL(p) : [dot(sub(p, wall.a), u), dot(sub(p, wall.a), n)];
    const zb = baseAt ? baseAt(p, s) : 0, zt = topAt ? topAt(p, s) : (wall.height ?? Infinity);
    const h = Math.max(0, Math.min(cut, zt) - zb), f = half > 0 ? Math.max(-1, Math.min(1, off / half)) : 0;
    const d = (tanL * (1 + f) + tanR * (1 - f)) / 2 * h;
    if (!d) return [p[0], p[1]];
    return F ? F.toW([s, off + d]) : [p[0] + n[0] * d, p[1] + n[1] * d];
  });
}
