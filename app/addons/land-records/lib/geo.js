/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geo.js — the geometry of the Land records add-on (0.11 Track LR). DOM-free, no imports, Node-tested (bin/test-landrecords.mjs).
 * lib/landrecords is canonical: `node tools/landrecords/sync.mjs` copies it into the add-on (copies are made, never edited).
 *
 * Two kinds of numbers live here and are never mixed: positions on the WGS 84 ellipsoid (latitude and longitude in degrees, what a phone
 * or a watch gives) and plane coordinates (x east, y north, in the caller's unit). A RING is [{ x, y }] without the first corner repeated;
 * every function takes either winding and says what it returns.
 *
 *   radii(lat) → { M, N }                      metres per radian along the meridian and along the prime vertical (WGS 84)
 *   localPlane({ lat, lon }) → { origin, toXY(lat, lon) → { x, y } metres, toLatLon(x, y) → { lat, lon } }
 *       a plane through the first point by the mid-latitude formulas: east = Δλ · N(φm) · cos φm, north = Δφ · M(φm), φm the mean latitude.
 *       Within 10 km of the origin a distance read on the plane is within a few millimetres of the ellipsoid's (tested against
 *       Vincenty's inverse). It is a site plane, not a map projection: a project with a coordinate system uses that instead.
 *   distanceM(a, b)                             metres between two positions (through the plane at a)
 *   flatten(pts, tol) → ring                    a parcel outline with bulges (parcels.js: b = tan(Δ/4) on the corner a curve starts at) as chords within tol
 *   ringArea(r) signed (+ = counter-clockwise) · area(r) · perimeter(r) · centroid(r) · ccw(r) (a counter-clockwise copy) · bbox(r)
 *   pointInRing(p, r) · distToSeg(p, a, b) → { d, t } · distToRing(p, r) → { d, edge, t }
 *   selfCrossings(r) → [{ i, j, at }]           pairs of edges that cross (a ring that crosses itself has no area worth stating)
 *   triangulate(r) → [[a, b, c]]                ear clipping of a simple ring (a ring that crosses itself gives what it can; areas then mean nothing)
 *   overlapArea(a, b)                           area the two rings share: a cut into triangles, b clipped to each (Sutherland–Hodgman against a convex
 *                                               piece), summed. Rings that only share a boundary give 0.
 *   nearMisses(a, b, tol, eps) → [{ at, d, edge }]   corners of a that lie within tol of b's outline without lying ON it (d > eps): the slivers and
 *                                               gaps two neighbours leave when their common line was drawn twice
 *   sharedLength(a, b, eps)                     length of outline the two rings have in common
 *   cutByLine(r, p, q, eps) → { ok, left: [ring], right: [ring] } | { ok: false, why }   the ring cut by the endless line through p and q (left = the
 *       side to the left of p → q). why: 'miss' (the line does not cross), 'along' (an edge lies on the line), 'ring' (too few corners)
 *   cutToArea(r, dir, target, eps) → { ok, left, right, line: [p, q], area }   the line of direction `dir` (radians, 0 = east, counter-clockwise) that
 *       leaves `target` area on its left, found by bisection to 1e-9 of the ring's area
 *   merge(a, b, tol) → { ok, ring, area } | { ok: false, why }   two rings that adjoin made one: corners matched within tol, the common edges taken
 *       out, the rest chained. why: 'overlap' (they share area), 'apart' (no common edge), 'hole' (the result is not one outline), 'touch'
 */

export const fin = Number.isFinite;
const WGS_A = 6378137, WGS_F = 1 / 298.257223563, WGS_E2 = WGS_F * (2 - WGS_F);
const RAD = Math.PI / 180;
export const MAX_RING = 5000;

export function radii(latDeg) {
  const s = Math.sin(latDeg * RAD), w = 1 - WGS_E2 * s * s;
  return { M: WGS_A * (1 - WGS_E2) / Math.pow(w, 1.5), N: WGS_A / Math.sqrt(w) };
}

export function localPlane(origin) {
  const lat0 = origin.lat, lon0 = origin.lon;
  const toXY = (lat, lon) => {
    const m = (lat + lat0) / 2, { M, N } = radii(m);
    let dl = lon - lon0; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
    return { x: dl * RAD * N * Math.cos(m * RAD), y: (lat - lat0) * RAD * M };
  };
  const toLatLon = (x, y) => {
    let lat = lat0 + y / (radii(lat0).M * RAD);
    for (let i = 0; i < 4; i++) lat = lat0 + y / (radii((lat + lat0) / 2).M * RAD);
    const m = (lat + lat0) / 2;
    return { lat, lon: lon0 + x / (radii(m).N * Math.cos(m * RAD) * RAD) };
  };
  return { origin: { lat: lat0, lon: lon0 }, toXY, toLatLon };
}

export function distanceM(a, b) { const p = localPlane(a).toXY(b.lat, b.lon); return Math.hypot(p.x, p.y); }

/** Bulged outline → chords. A course from corner i with bulge b is an arc of included angle 4·atan(b), to the left when b > 0. */
export function flatten(pts, tol = 0.01) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], c = pts[(i + 1) % n], b = fin(a.b) ? a.b : 0;
    out.push({ x: a.x, y: a.y });
    if (!b) continue;
    const chord = Math.hypot(c.x - a.x, c.y - a.y); if (!(chord > 0)) continue;
    const ang = 4 * Math.atan(b), R = chord / (2 * Math.sin(Math.abs(ang) / 2));
    const steps = Math.min(256, Math.max(2, Math.ceil(Math.abs(ang) / (2 * Math.acos(Math.max(0, 1 - Math.min(tol, R) / R)) || 0.1))));
    // centre: left of the chord by R·cos(ang/2) for a left turn (b > 0), right for a right turn
    const mx = (a.x + c.x) / 2, my = (a.y + c.y) / 2, ux = (c.x - a.x) / chord, uy = (c.y - a.y) / chord;
    const h = R * Math.cos(Math.abs(ang) / 2) * Math.sign(b), cx = mx - uy * h, cy = my + ux * h;
    const a0 = Math.atan2(a.y - cy, a.x - cx);
    for (let k = 1; k < steps; k++) { const th = a0 + ang * (k / steps); out.push({ x: cx + R * Math.cos(th), y: cy + R * Math.sin(th) }); }
  }
  return out.slice(0, MAX_RING * 8);
}

export function ringArea(r) { let s = 0; for (let i = 0, n = r.length; i < n; i++) { const a = r[i], b = r[(i + 1) % n]; s += a.x * b.y - b.x * a.y; } return s / 2; }
export const area = (r) => Math.abs(ringArea(r));
export function perimeter(r) { let s = 0; for (let i = 0, n = r.length; i < n; i++) { const a = r[i], b = r[(i + 1) % n]; s += Math.hypot(b.x - a.x, b.y - a.y); } return s; }
export function centroid(r) {
  let s = 0, cx = 0, cy = 0;
  for (let i = 0, n = r.length; i < n; i++) { const a = r[i], b = r[(i + 1) % n], k = a.x * b.y - b.x * a.y; s += k; cx += (a.x + b.x) * k; cy += (a.y + b.y) * k; }
  if (Math.abs(s) < 1e-12) { const n = r.length || 1; return { x: r.reduce((m, p) => m + p.x, 0) / n, y: r.reduce((m, p) => m + p.y, 0) / n }; }
  return { x: cx / (3 * s), y: cy / (3 * s) };
}
export const ccw = (r) => (ringArea(r) < 0 ? r.slice().reverse() : r.slice());
export function bbox(r) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of r) { if (p.x < a) a = p.x; if (p.y < b) b = p.y; if (p.x > c) c = p.x; if (p.y > d) d = p.y; } return { minX: a, minY: b, maxX: c, maxY: d }; }

export function pointInRing(p, r) {
  let inside = false;
  for (let i = 0, n = r.length, j = n - 1; i < n; j = i++) {
    const a = r[i], b = r[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export function distToSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)) : 0;
  return { d: Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy)), t };
}
export function distToRing(p, r) {
  let best = { d: Infinity, edge: -1, t: 0 };
  for (let i = 0, n = r.length; i < n; i++) { const q = distToSeg(p, r[i], r[(i + 1) % n]); if (q.d < best.d) best = { d: q.d, edge: i, t: q.t }; }
  return best;
}

const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
function segCross(a, b, c, d) {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    const t = d1 / (d1 - d2); return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  }
  return null;
}
export function selfCrossings(r) {
  const out = [], n = r.length;
  if (n > 2000) return out;   // a bound on the pair loop; a ring this long is not checked
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    const at = segCross(r[i], r[(i + 1) % n], r[j], r[(j + 1) % n]);
    if (at) out.push({ i, j, at });
  }
  return out;
}

export function triangulate(ring) {
  const r = ccw(ring), tris = [], idx = r.map((_, i) => i);
  let guard = r.length * r.length + 10;
  while (idx.length > 3 && guard-- > 0) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = r[i0], b = r[i1], c = r[i2], cr = cross(a, b, c);
      if (cr < 0) continue;   // a reflex corner is never an ear
      if (cr === 0) { idx.splice(k, 1); cut = true; break; }   // a corner on a straight line: drop it
      let ear = true;
      for (const m of idx) {
        if (m === i0 || m === i1 || m === i2) continue;
        const p = r[m];
        if (cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0 && !((p.x === a.x && p.y === a.y) || (p.x === b.x && p.y === b.y) || (p.x === c.x && p.y === c.y))) { ear = false; break; }
      }
      if (!ear) continue;
      tris.push([a, b, c]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;   // not a simple ring: stop with what was cut
  }
  if (idx.length === 3) { const [a, b, c] = idx.map((i) => r[i]); if (cross(a, b, c) > 0) tris.push([a, b, c]); }
  return tris;
}

/** Subject clipped to a counter-clockwise convex piece (Sutherland–Hodgman). */
function clipConvex(subject, clip) {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length], inp = out; out = [];
    for (let k = 0; k < inp.length; k++) {
      const p = inp[k], q = inp[(k + 1) % inp.length], sp = cross(a, b, p), sq = cross(a, b, q);
      if (sp >= 0) out.push(p);
      if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) { const t = sp / (sp - sq); out.push({ x: p.x + t * (q.x - p.x), y: p.y + t * (q.y - p.y) }); }
    }
  }
  return out;
}
export function overlapArea(a, b) {
  if (a.length < 3 || b.length < 3) return 0;
  const A = bbox(a), B = bbox(b);
  if (A.maxX <= B.minX || B.maxX <= A.minX || A.maxY <= B.minY || B.maxY <= A.minY) return 0;
  const sub = ccw(b);
  let s = 0;
  for (const tri of triangulate(a)) s += ringArea(clipConvex(sub, tri));   // signed: a concave subject may fold, the folds cancel
  return Math.max(0, s);
}

export function nearMisses(a, b, tol, eps = tol / 1000) {
  const out = [];
  for (const p of a) { const q = distToRing(p, b); if (q.d > eps && q.d <= tol) out.push({ at: { x: p.x, y: p.y }, d: q.d, edge: q.edge }); }
  return out;
}
export function sharedLength(a, b, eps = 1e-6) {
  let s = 0;
  for (let i = 0, n = a.length; i < n; i++) {
    const p = a[i], q = a[(i + 1) % n], len = Math.hypot(q.x - p.x, q.y - p.y); if (!(len > 0)) continue;
    for (let j = 0, m = b.length; j < m; j++) {
      const c = b[j], d = b[(j + 1) % m];
      if (Math.abs(cross(p, q, c)) / len > eps || Math.abs(cross(p, q, d)) / len > eps) continue;   // not on the same line
      const tc = ((c.x - p.x) * (q.x - p.x) + (c.y - p.y) * (q.y - p.y)) / (len * len), td = ((d.x - p.x) * (q.x - p.x) + (d.y - p.y) * (q.y - p.y)) / (len * len);
      const lo = Math.max(0, Math.min(tc, td)), hi = Math.min(1, Math.max(tc, td));
      if (hi > lo) s += (hi - lo) * len;
    }
  }
  return s;
}

export function cutByLine(ring, p, q, eps = 1e-9) {
  if (!Array.isArray(ring) || ring.length < 3) return { ok: false, why: 'ring' };
  const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy);
  if (!(len > 0)) return { ok: false, why: 'miss' };
  const side = (v) => { const s = (dx * (v.y - p.y) - dy * (v.x - p.x)) / len; return Math.abs(s) <= eps ? 0 : s; };
  const along = (v) => ((v.x - p.x) * dx + (v.y - p.y) * dy) / len;
  // the ring with a corner put in wherever an edge crosses the line
  const nodes = [];
  for (let i = 0, n = ring.length; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n], sa = side(a), sb = side(b);
    nodes.push({ x: a.x, y: a.y, s: sa });
    if (sa === 0 && sb === 0) return { ok: false, why: 'along' };
    if (sa * sb < 0) { const t = sa / (sa - sb); nodes.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), s: 0 }); }
  }
  const N = nodes.length;
  // a corner on the line is a crossing when the outline changes side there, a touch when it does not
  const cuts = [];
  for (let i = 0; i < N; i++) {
    if (nodes[i].s !== 0) continue;
    const a = nodes[(i + N - 1) % N].s, b = nodes[(i + 1) % N].s;
    if (a * b < 0) cuts.push(i);
  }
  if (cuts.length < 2) return { ok: false, why: 'miss' };
  if (cuts.length % 2) return { ok: false, why: 'along' };
  cuts.sort((i, j) => along(nodes[i]) - along(nodes[j]));
  const next = nodes.map((_, i) => (i + 1) % N), pt = nodes.map((v) => v);
  for (let k = 0; k < cuts.length; k += 2) {
    const a = cuts[k], b = cuts[k + 1], a2 = pt.length, b2 = a2 + 1;
    pt.push({ ...nodes[a] }, { ...nodes[b] });
    next[a2] = next[a]; next[b2] = next[b]; next[a] = b2; next[b] = a2;
  }
  const seen = new Uint8Array(pt.length), left = [], right = [];
  for (let s0 = 0; s0 < pt.length; s0++) {
    if (seen[s0]) continue;
    const r = []; let s = 0, i = s0, guard = pt.length + 2;
    while (!seen[i] && guard-- > 0) { seen[i] = 1; r.push({ x: pt[i].x, y: pt[i].y }); if (pt[i].s !== 0) s = pt[i].s; i = next[i]; }
    if (r.length < 3 || area(r) <= eps * eps) continue;
    (s > 0 ? left : right).push(r);
  }
  if (!left.length || !right.length) return { ok: false, why: 'miss' };
  return { ok: true, left, right };
}

export function cutToArea(ring, dir, target, eps = 1e-9) {
  const total = area(ring);
  if (!(target > 0) || !(target < total)) return { ok: false, why: 'area' };
  const ux = Math.cos(dir), uy = Math.sin(dir), nx = -uy, ny = ux;   // the normal points to the line's left
  let lo = Infinity, hi = -Infinity;
  for (const v of ring) { const d = v.x * nx + v.y * ny; if (d < lo) lo = d; if (d > hi) hi = d; }
  const c = centroid(ring), span = Math.max(hi - lo, 1e-9);
  const at = (d) => { const o = { x: c.x * ux * ux + c.y * ux * uy + nx * d, y: c.x * ux * uy + c.y * uy * uy + ny * d }; return [o, { x: o.x + ux * span, y: o.y + uy * span }]; };
  const leftOf = (d) => { const [p, q] = at(d), r = cutByLine(ring, p, q, span * 1e-12); return r.ok ? { r, a: r.left.reduce((m, x) => m + area(x), 0) } : null; };
  let a = lo, b = hi, best = null;   // the area on the left falls from the whole ring at lo to nothing at hi
  for (let i = 0; i < 200; i++) {
    const m = (a + b) / 2, got = leftOf(m);
    if (!got) { // a corner or an edge exactly on the line: step aside by a hair
      const g2 = leftOf(m + span * 1e-7); if (!g2) return { ok: false, why: 'along' };
      best = { ...g2, d: m + span * 1e-7 };
    } else best = { ...got, d: m };
    if (Math.abs(best.a - target) <= eps * total) break;
    if (best.a > target) a = best.d; else b = best.d;
  }
  if (!best || Math.abs(best.a - target) > 1e-6 * total) return { ok: false, why: 'area' };
  return { ok: true, left: best.r.left, right: best.r.right, line: at(best.d), area: best.a };
}

export function merge(ringA, ringB, tol = 1e-6) {
  if (ringA.length < 3 || ringB.length < 3) return { ok: false, why: 'ring' };
  let A = ccw(ringA).map((p) => ({ x: p.x, y: p.y })), B = ccw(ringB).map((p) => ({ x: p.x, y: p.y }));
  const aA = area(A), aB = area(B);
  if (overlapArea(A, B) > Math.max(tol * tol, 1e-9 * Math.min(aA, aB))) return { ok: false, why: 'overlap' };
  // corners of one within tol of a corner of the other become that corner; a corner on the other's edge is put into that edge
  for (const p of B) for (const q of A) if (Math.hypot(p.x - q.x, p.y - q.y) <= tol) { p.x = q.x; p.y = q.y; break; }
  const insert = (R, others) => {
    const out = [];
    for (let i = 0, n = R.length; i < n; i++) {
      const a = R[i], b = R[(i + 1) % n], on = [];
      for (const p of others) {
        if ((p.x === a.x && p.y === a.y) || (p.x === b.x && p.y === b.y)) continue;
        const q = distToSeg(p, a, b);
        if (q.d <= tol && q.t > 0 && q.t < 1) on.push({ t: q.t, p });
      }
      out.push(a); on.sort((u, v) => u.t - v.t);
      for (const o of on) if (!out.some((z) => z.x === o.p.x && z.y === o.p.y)) out.push({ x: o.p.x, y: o.p.y });
    }
    return out;
  };
  A = insert(A, B); B = insert(B, A);
  const key = (p) => p.x + ',' + p.y;
  const edges = new Map();   // "from>to" → { from, to }
  for (const R of [A, B]) for (let i = 0, n = R.length; i < n; i++) { const a = R[i], b = R[(i + 1) % n]; if (key(a) !== key(b)) edges.set(key(a) + '>' + key(b), { a, b }); }
  let shared = 0;
  for (const k of [...edges.keys()]) { const [f, t] = k.split('>'); const back = t + '>' + f; if (edges.has(k) && edges.has(back)) { edges.delete(k); edges.delete(back); shared++; } }
  if (!shared) return { ok: false, why: 'apart' };
  const from = new Map();
  for (const e of edges.values()) { const k = key(e.a); if (from.has(k)) return { ok: false, why: 'touch' }; from.set(k, e); }
  const first = edges.values().next().value;
  if (!first) return { ok: false, why: 'hole' };
  const ring = []; let e = first, guard = edges.size + 2;
  do { ring.push({ x: e.a.x, y: e.a.y }); e = from.get(key(e.b)); } while (e && e !== first && guard-- > 0);
  if (!e || ring.length !== edges.size) return { ok: false, why: 'hole' };
  // straight-through corners the stitching left on a line are taken out
  const clean = ring.filter((p, i) => { const a = ring[(i + ring.length - 1) % ring.length], b = ring[(i + 1) % ring.length]; return Math.abs(cross(a, p, b)) > 1e-12 * (1 + Math.hypot(b.x - a.x, b.y - a.y)); });
  const out = clean.length >= 3 ? clean : ring;
  return { ok: true, ring: out, area: area(out), sum: aA + aB };
}
