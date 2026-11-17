// SPDX-License-Identifier: Apache-2.0
/**
 * sitelines.js: site constraints as plain geometry (booklet row BK.104, session bk-stages-10). Host-free: no DOM, no IFC, no imports.
 * lib/sitelines/ is canonical; each host carries a byte-identical copy in <app>/dev/sitelines/ (node tools/sitelines/sync.mjs).
 * Hosts: BimCraft (model-site-constraints.js: building lines, servitudes and the crossing warning), CivilCraft (zoning.js: the
 * setback envelope calls mitreInset here, so the setback rule lives once).
 *
 * Units are the caller's (BimCraft: plan millimetres). Points are [x, y]; mitreInset alone takes { x, y } (CivilCraft's shape).
 *
 * THE RULES (advisory: the caller warns, it never refuses an edit)
 *   site boundary   a wall is over it when any part of the wall's plan footprint lies outside the site outline.
 *   building line   closed (worked out from setbacks, or drawn as a closed line): the area inside is where one may build; a wall
 *                   is over it when any part of its footprint lies outside. Open (drawn): a wall crosses it when the line runs
 *                   through the footprint.
 *   servitude       (easement, right of way) an area: a strip (a centre line and a width) or a drawn polygon. A wall is over it
 *                   when its footprint and the area overlap.
 *   Touching is allowed: a face exactly on a line, or within `tol` of it (default 1), is not a crossing.
 *
 *   mitreInset(ring [{x, y}] counter-clockwise, per [distance per edge]) → { poly [{x, y}] | null, problem }
 *       edge i (ring[i] → ring[i+1]) moved in by per[i]; problems: 'repeat', 'step', 'sharp', 'fold'
 *   buildingLine(outline [[x, y]], setbacks [per edge of the outline as given]) → { poly [[x, y]] | null, problem }
 *       the lot taken in from every edge by that edge's distance, mitred; null with a reason when it folds over or leaves the lot
 *   stripPolygon(path [[x, y]], width) → [[x, y]] | null     the strip `width` wide centred on an open path (mitred, square ends)
 *   wallFootprint({ a, b, t, bulge }) → [[x, y]]              a wall's plan footprint from its centre line (bulge = tan(angle / 4))
 *   signedDepth(p, ring) → +distance inside, -distance outside
 *   overlaps(P, Q, tol) · outsideOf(P, region, tol) · crossesPath(P, path, closed, tol) → boolean
 *   checkConstraints({ walls: [{ id, label, poly }], boundary: ring | null, lines: [{ id, name, pts, closed }],
 *                      servitudes: [{ id, name, kind, poly }], tol }) → [{ wall, label, kind: 'boundary' | 'buildingline' | 'servitude', id, name, sub }]
 *   SERVITUDE_KINDS, cleanSetbacks(list, n)
 */

export const SERVITUDE_KINDS = ['servitude', 'right-of-way', 'access', 'sewer', 'stormwater', 'water', 'electrical', 'gas', 'telecom', 'other'];

// ------------------------------------------------------------------------------------------------ setbacks (from CivilCraft's zoning.js)
/** Per-edge mitre: edge i (ring[i] → ring[i+1]) moved in (to its left) by per[i]; corner i = where edges i−1 and i meet. */
export function mitreInset(ring, per) {
  const n = ring.length, E = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1e-12) return { poly: null, problem: 'repeat' };
    const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, nx = -uy, ny = ux;
    E.push({ px: a.x + nx * per[i], py: a.y + ny * per[i], ux, uy, nx, ny });   // a point on the moved line and its direction
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = E[(i + n - 1) % n], q = E[i], cr = p.ux * q.uy - p.uy * q.ux;
    if (Math.abs(cr) < 1e-9) {   // collinear lines: a straight continuation (two different distances on one straight line step; take the later)
      if (Math.abs((q.px - p.px) * p.nx + (q.py - p.py) * p.ny) > 1e-9) return { poly: null, problem: 'step' };
      out.push({ x: q.px, y: q.py }); continue;
    }
    // p.p + s p.u = q.p + t q.u
    const dx = q.px - p.px, dy = q.py - p.py, s = (dx * q.uy - dy * q.ux) / cr;
    if (Math.abs(s) > 1e7) return { poly: null, problem: 'sharp' };
    out.push({ x: p.px + s * p.ux, y: p.py + s * p.uy });
  }
  // every moved edge must keep its direction (a line that turned round has folded over)
  for (let i = 0; i < n; i++) { const a = out[i], b = out[(i + 1) % n]; if ((b.x - a.x) * E[i].ux + (b.y - a.y) * E[i].uy <= 1e-12) return { poly: null, problem: 'fold' }; }
  return { poly: out, problem: null };
}

// ------------------------------------------------------------------------------------------------ small geometry
export const ringArea = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; };
const segDist = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
  const u = L2 > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0;
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
};
export function inRing(p, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
export function ringDist(p, ring, closed = true) {
  let d = Infinity;
  for (let i = 0; i + (closed ? 0 : 1) < ring.length; i++) d = Math.min(d, segDist(p, ring[i], ring[(i + 1) % ring.length]));
  return d;
}
/** How deep a point is inside a ring: + inside, − outside (0 on the edge). */
export function signedDepth(p, ring) { const d = ringDist(p, ring); return inRing(p, ring) ? d : -d; }
const side = (p, a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return L > 0 ? ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / L : 0; };
/** Two segments truly cross: each one's ends lie on opposite sides of the other, each more than tol from it. */
function properCross(a, b, c, d, tol) {
  const s1 = side(c, a, b), s2 = side(d, a, b);
  if (!(s1 * s2 < 0) || Math.min(Math.abs(s1), Math.abs(s2)) <= tol) return false;
  const s3 = side(a, c, d), s4 = side(b, c, d);
  return s3 * s4 < 0 && Math.min(Math.abs(s3), Math.abs(s4)) > tol;
}
const edges = (ring, closed = true) => { const out = []; for (let i = 0; i + (closed ? 0 : 1) < ring.length; i++) out.push([ring[i], ring[(i + 1) % ring.length]]); return out; };
const anyCross = (E1, E2, tol) => E1.some(([a, b]) => E2.some(([c, d]) => properCross(a, b, c, d, tol)));
const probes = (ring) => { const out = ring.slice(); for (const [a, b] of edges(ring)) out.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]); return out; };
const centroid = (ring) => {
  let A = 0, cx = 0, cy = 0;
  for (const [a, b] of edges(ring)) { const k = a[0] * b[1] - b[0] * a[1]; A += k; cx += (a[0] + b[0]) * k; cy += (a[1] + b[1]) * k; }
  return Math.abs(A) > 1e-12 ? [cx / (3 * A), cy / (3 * A)] : ring[0];
};

/** The two areas share more than a touch (more than tol deep). */
export function overlaps(P, Q, tol = 1) {
  if (!(P?.length >= 3) || !(Q?.length >= 3)) return false;
  if (anyCross(edges(P), edges(Q), tol)) return true;
  if (probes(P).some((p) => signedDepth(p, Q) > tol) || probes(Q).some((q) => signedDepth(q, P) > tol)) return true;
  return signedDepth(centroid(P), Q) > tol && inRing(centroid(P), P);
}
/** Some of P lies outside the region (more than tol beyond its edge). */
export function outsideOf(P, region, tol = 1) {
  if (!(P?.length >= 3) || !(region?.length >= 3)) return false;
  if (probes(P).some((p) => signedDepth(p, region) < -tol)) return true;
  return anyCross(edges(P), edges(region), tol);
}
/** The path (open, or closed) runs through P. */
export function crossesPath(P, path, closed = false, tol = 1) {
  if (!(P?.length >= 3) || !(path?.length >= 2)) return false;
  const E = edges(path, closed);
  if (anyCross(edges(P), E, tol)) return true;
  if (path.some((q) => signedDepth(q, P) > tol)) return true;
  return E.some(([a, b]) => signedDepth([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], P) > tol);
}

// ------------------------------------------------------------------------------------------------ building lines, strips, walls
/** Setbacks as n finite distances ≥ 0 (a short list is filled with 0, a long one cut). */
export function cleanSetbacks(list, n) {
  const out = [];
  for (let i = 0; i < n; i++) { const v = Number(list?.[i]); out.push(Number.isFinite(v) && v > 0 ? v : 0); }
  return out;
}
/** The building line of a lot from a setback per edge (edge i = outline[i] → outline[i+1], whichever way the outline runs). */
export function buildingLine(outline, setbacks) {
  const n = outline?.length || 0;
  if (n < 3) return { poly: null, problem: 'short' };
  const per = cleanSetbacks(setbacks, n);
  const ccw = ringArea(outline) >= 0;
  // counter-clockwise for the mitre: a clockwise outline is reversed, and edge k of the reversed ring is edge n − 2 − k of the given one
  const ring = (ccw ? outline : outline.slice().reverse()).map((p) => ({ x: p[0], y: p[1] }));
  const d = ccw ? per : per.map((_, k) => per[(((n - 2 - k) % n) + n) % n]);
  const r = mitreInset(ring, d);
  if (!r.poly) return { poly: null, problem: r.problem };
  const poly = r.poly.map((p) => [p.x, p.y]);
  if (!(ringArea(poly) > 1e-9) || poly.some((p) => signedDepth(p, outline) < -1e-6) || anyCross(edges(poly), edges(poly), 1e-9)) return { poly: null, problem: 'fold' };
  return { poly, problem: null };
}
/** One side of an open path moved by d to its left (mitred corners; a corner sharper than about 11° is cut at 5 × d). */
function offsetPath(path, d) {
  const n = path.length, out = [];
  const dir = (i) => { const a = path[i], b = path[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; };
  for (let i = 0; i < n; i++) {
    const u = i > 0 ? dir(i - 1) : dir(0), v = i < n - 1 ? dir(i) : dir(n - 2);
    let mx = -(u[1] + v[1]), my = u[0] + v[0];
    const L = Math.hypot(mx, my);
    if (L < 1e-9) { out.push([path[i][0] - u[1] * d, path[i][1] + u[0] * d]); continue; }   // a full turn back: square
    mx /= L; my /= L;
    const k = 1 / Math.max(0.2, mx * -u[1] + my * u[0]);   // 1 / cos(half the turn)
    out.push([path[i][0] + mx * d * k, path[i][1] + my * d * k]);
  }
  return out;
}
const tidyPath = (path) => { const out = []; for (const q of path || []) { const p = [Number(q[0]), Number(q[1])]; if (!p.every(Number.isFinite)) continue; const l = out[out.length - 1]; if (!l || Math.hypot(p[0] - l[0], p[1] - l[1]) > 1e-9) out.push(p); } return out; };
export function stripPolygon(path, width) {
  const p = tidyPath(path), w = Number(width);
  if (p.length < 2 || !(w > 0)) return null;
  const L = offsetPath(p, w / 2), R = offsetPath(p, -w / 2);
  return [...L, ...R.reverse()];
}
/** A wall's footprint from its centre line: straight = a rectangle; curved (bulge = tan(angle / 4), + anticlockwise) = chords within `sag` of the arc. */
export function wallFootprint({ a, b, t, bulge = 0 }, sag = 0.25) {
  const h = Math.max(0, Number(t) || 0) / 2;
  let line = [a, b];
  if (Math.abs(bulge) > 1e-9) {
    const c = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = 4 * Math.atan(bulge), R = Math.abs(c / (2 * Math.sin(ang / 2)));
    // the centre lies to the left of a → b for an anticlockwise arc under half a turn
    const k = (c / 2) / Math.tan(ang / 2), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, ux = (b[0] - a[0]) / c, uy = (b[1] - a[1]) / c;
    const cx = mx - uy * k, cy = my + ux * k, a0 = Math.atan2(a[1] - cy, a[0] - cx);
    const step = 2 * Math.acos(Math.max(0, Math.min(1, 1 - sag / Math.max(R, sag * 2)))) || Math.PI / 16;
    const n = Math.max(2, Math.min(720, Math.ceil(Math.abs(ang) / step)));
    line = [];
    for (let i = 0; i <= n; i++) { const th = a0 + ang * (i / n); line.push([cx + R * Math.cos(th), cy + R * Math.sin(th)]); }
    line[0] = [a[0], a[1]]; line[n] = [b[0], b[1]];
  }
  return h > 0 ? [...offsetPath(line, h), ...offsetPath(line, -h).reverse()] : null;
}

// ------------------------------------------------------------------------------------------------ the check
/**
 * Which walls are over which constraint. One finding per wall and constraint. `sub` says how: 'outside' (a closed building
 * line or the boundary), 'crosses' (an open building line), 'over' (a servitude).
 */
export function checkConstraints({ walls = [], boundary = null, lines = [], servitudes = [], tol = 1 } = {}) {
  const out = [];
  for (const w of walls) {
    const P = w.poly;
    if (!(P?.length >= 3)) continue;
    if (boundary?.length >= 3 && outsideOf(P, boundary, tol)) out.push({ wall: w.id, label: w.label || '', kind: 'boundary', id: 'boundary', name: '', sub: 'outside' });
    for (const l of lines) {
      if (!(l.pts?.length >= 2)) continue;
      const closed = !!l.closed && l.pts.length >= 3;
      if (closed ? outsideOf(P, l.pts, tol) : crossesPath(P, l.pts, false, tol)) out.push({ wall: w.id, label: w.label || '', kind: 'buildingline', id: l.id, name: l.name || '', sub: closed ? 'outside' : 'crosses' });
    }
    for (const s of servitudes) if (s.poly?.length >= 3 && overlaps(P, s.poly, tol)) out.push({ wall: w.id, label: w.label || '', kind: 'servitude', id: s.id, name: s.name || '', servitude: s.kind || 'servitude', sub: 'over' });
  }
  return out;
}
