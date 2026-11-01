/* SPDX-License-Identifier: Apache-2.0 */
/**
 * room.js — the room a job sits in: a rectangle, an L, a U or a free outline with right angles, its walls, and the doors and windows in them
 * (0.8 DC.117, session `cabinetcraft_addon` round 2). DOM-free, pure.
 *
 *   room = { w, d, h, shape ('rect' | 'L' | 'U' | 'free'), notch?: { w, d, at }, pts?: [[x, y]…] (free only) }
 *     rect   w × d. Walls S, E, N, W (south = the bottom edge, going round counter-clockwise).
 *     L      the w × d box with a notch w × d cut from the corner `at` ('NE' | 'NW' | 'SE' | 'SW').
 *     U      the w × d box with a notch cut from the middle of the side `at` ('N' | 'S' | 'E' | 'W'), notch.w wide along the side, notch.d deep.
 *     free   `pts`: corners in order, every edge along x or y (right angles); typed or picked on the plan.
 *   An L, U or free room has walls P1…Pn (edge i runs from corner i to corner i+1, the room on its LEFT: counter-clockwise).
 *
 *   roomPts(room) → [[x, y]…] counter-clockwise from (0, 0) · cleanRoom(raw, fallback) → room · walls(room) → [{ id, i, a, b, len, frame, convexStart, convexEnd }]
 *   wallById(room, id) · frameOf(wall) · pointInRoom(room, x, y) · rectInRoom(room, [x0, y0, x1, y1]) · distToWalls(room, rect)
 *   cleanOpenings(raw, room, unit) → [{ id, kind ('door' | 'window'), wall, at, w, h, sill, swing ('in' | 'out'), name }]
 *   openingRect(room, op, depth) → world [x0, y0, x1, y1] strip of the wall the opening is in, `depth` into the room (a door's swing square when swing is 'in')
 */
import { num, clamp, r6 } from './core.js';
import { arcGeom, arcPoints, turnBetween, edgeEnd, arcEnd } from './angled.js';

const MAX_PTS = 32;
const EPS = 1e-6;
const txt = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);

export function roomPts(room) {
  const W = room.w, D = room.d;
  const box = [[0, 0], [W, 0], [W, D], [0, D]];
  if (room.shape === 'free' && Array.isArray(room.pts)) return room.pts.map((p) => [p[0], p[1]]);
  const n = room.notch;
  if (room.shape === 'L' && n) {
    const nw = clamp(n.w, 1, W - 1), nd = clamp(n.d, 1, D - 1);
    switch (n.at) {
      case 'NW': return [[0, 0], [W, 0], [W, D], [nw, D], [nw, D - nd], [0, D - nd]];
      case 'SE': return [[0, 0], [W - nw, 0], [W - nw, nd], [W, nd], [W, D], [0, D]];
      case 'SW': return [[nw, 0], [W, 0], [W, D], [0, D], [0, nd], [nw, nd]];
      default: return [[0, 0], [W, 0], [W, D - nd], [W - nw, D - nd], [W - nw, D], [0, D]];   // NE
    }
  }
  if (room.shape === 'U' && n) {
    const horiz = n.at === 'N' || n.at === 'S';
    const nw = clamp(n.w, 1, (horiz ? W : D) - 2), nd = clamp(n.d, 1, (horiz ? D : W) - 1);
    if (n.at === 'S') { const a = (W - nw) / 2; return [[0, 0], [a, 0], [a, nd], [a + nw, nd], [a + nw, 0], [W, 0], [W, D], [0, D]]; }
    if (n.at === 'E') { const a = (D - nw) / 2; return [[0, 0], [W, 0], [W, a], [W - nd, a], [W - nd, a + nw], [W, a + nw], [W, D], [0, D]]; }
    if (n.at === 'W') { const a = (D - nw) / 2; return [[0, 0], [W, 0], [W, D], [0, D], [0, a + nw], [nd, a + nw], [nd, a], [0, a]]; }
    const a = (W - nw) / 2;   // N
    return [[0, 0], [W, 0], [W, D], [a + nw, D], [a + nw, D - nd], [a, D - nd], [a, D], [0, D]];
  }
  return box;
}

const area2 = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0);
function segCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > EPS && d2 < -EPS) || (d1 < -EPS && d2 > EPS)) && ((d3 > EPS && d4 < -EPS) || (d3 < -EPS && d4 > EPS));
}

/** A free outline made safe: right angles only, no repeated or collinear corners, no crossing edges, counter-clockwise, moved to (0, 0). null when it cannot be one. */
export function cleanOutline(raw) {
  if (!Array.isArray(raw)) return null;
  let pts = [];
  for (const p of raw.slice(0, MAX_PTS)) {
    if (!Array.isArray(p)) return null;
    const x = num(p[0], NaN), y = num(p[1], NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e5 || Math.abs(y) > 1e5) return null;
    pts.push([x, y]);
  }
  // drop repeats, then collinear corners
  pts = pts.filter((p, i) => { const q = pts[(i + 1) % pts.length]; return Math.abs(p[0] - q[0]) > EPS || Math.abs(p[1] - q[1]) > EPS; });
  for (let again = true; again && pts.length >= 4;) {
    again = false;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i + pts.length - 1) % pts.length], b = pts[i], c = pts[(i + 1) % pts.length];
      if ((Math.abs(a[0] - b[0]) < EPS && Math.abs(b[0] - c[0]) < EPS) || (Math.abs(a[1] - b[1]) < EPS && Math.abs(b[1] - c[1]) < EPS)) { pts.splice(i, 1); again = true; break; }
    }
  }
  if (pts.length < 4) return null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (Math.abs(a[0] - b[0]) > EPS && Math.abs(a[1] - b[1]) > EPS) return null;   // a slanted edge
  }
  for (let i = 0; i < pts.length; i++) for (let j = i + 2; j < pts.length; j++) {
    if (i === 0 && j === pts.length - 1) continue;
    if (segCross(pts[i], pts[(i + 1) % pts.length], pts[j], pts[(j + 1) % pts.length])) return null;
  }
  const A = area2(pts);
  if (Math.abs(A) < 1) return null;
  if (A < 0) pts.reverse();
  const x0 = Math.min(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1]));
  return pts.map((p) => [r6(p[0] - x0), r6(p[1] - y0)]);
}

const MAX_ARCS = 12;
/** The edges of a corner list that are arcs, cleaned: [{ i, sweep }] with i in range, sweep a non-zero number within ±170 degrees, one per edge. */
function cleanArcs(raw, n) {
  const out = [];
  const seen = new Set();
  for (const a of (Array.isArray(raw) ? raw.slice(0, MAX_ARCS * 2) : [])) {
    if (!a || typeof a !== 'object') continue;
    const i = Math.round(num(a.i, -1)), sweep = num(a.sweep, 0);
    if (!(i >= 0 && i < n) || seen.has(i) || !(Math.abs(sweep) >= 0.5)) continue;
    seen.add(i);
    out.push({ i, sweep: r6(clamp(sweep, -170, 170)) });
    if (out.length >= MAX_ARCS) break;
  }
  return out.sort((x, y) => x.i - y.i);
}
/** The outline as a polygon with the arcs written out as short chords (for inside tests, areas and drawing). */
export function outlineOf(pts, arcs = []) {
  const out = [];
  const sw = new Map((arcs || []).map((a) => [a.i, a.sweep]));
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (sw.has(i)) {
      // enough chords that the polygon is within 0.5 of the true arc (a unit-free guess of 1 mm = 1 unit is fine: a smaller job just gets more chords)
      const g = arcGeom(a, b, sw.get(i));
      const step = g ? 2 * Math.acos(Math.max(0, 1 - 0.5 / g.r)) : 0.2;
      const n = Math.max(4, Math.min(400, Math.ceil(Math.abs(sw.get(i)) * Math.PI / 180 / Math.max(step, 1e-3))));
      out.push(...arcPoints(a, b, sw.get(i), n).slice(0, -1));
    } else out.push(a);
  }
  return out;
}
export function roomOutline(room) { return room.shape === 'free' && room.arcs && room.arcs.length ? outlineOf(roomPts(room), room.arcs) : roomPts(room); }
const polyArea2 = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0);

/**
 * A free outline of ANY angle, with arc edges: { pts, arcs } counter-clockwise and moved so its bounding box starts at (0, 0), or null when it cannot be one
 * (fewer than three corners, repeated corners, edges that cross, a wall shorter than 1). Collinear corners are dropped unless an arc starts or ends there.
 */
export function cleanShape(raw, rawArcs) {
  if (!Array.isArray(raw)) return null;
  let pts = [];
  for (const p of raw.slice(0, MAX_PTS)) {
    if (!Array.isArray(p)) return null;
    const x = num(p[0], NaN), y = num(p[1], NaN);
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e5 || Math.abs(y) > 1e5) return null;
    pts.push([x, y]);
  }
  let arcs = cleanArcs(rawArcs, pts.length);
  const keep = pts.map(() => true);
  // a repeated corner (same as the next one) is dropped; an arc on it goes too
  for (let i = 0; i < pts.length; i++) { const q = pts[(i + 1) % pts.length]; if (Math.abs(pts[i][0] - q[0]) <= EPS && Math.abs(pts[i][1] - q[1]) <= EPS) keep[i] = false; }
  if (arcs.some((a) => !keep[a.i])) arcs = arcs.filter((a) => keep[a.i]);
  const arcAt = new Set();
  arcs.forEach((a) => { arcAt.add(a.i); arcAt.add((a.i + 1) % pts.length); });
  let list = pts.map((p, i) => ({ p, i, arc: arcs.find((a) => a.i === i) || null, isEnd: arcAt.has(i) })).filter((_, i) => keep[i]);
  for (let again = true; again && list.length >= 4;) {
    again = false;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.isEnd) continue;
      const a = list[(i + list.length - 1) % list.length].p, b = e.p, c = list[(i + 1) % list.length].p;
      const cr = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (Math.abs(cr) < 1e-9 * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1])) && ((b[0] - a[0]) * (c[0] - b[0]) + (b[1] - a[1]) * (c[1] - b[1])) > 0) { list.splice(i, 1); again = true; break; }
    }
  }
  if (list.length < 3) return null;
  let P = list.map((e) => e.p);
  let A = list.map((e, k) => (e.arc ? { i: k, sweep: e.arc.sweep } : null)).filter(Boolean);
  for (let i = 0; i < P.length; i++) { const q = P[(i + 1) % P.length]; if (Math.hypot(P[i][0] - q[0], P[i][1] - q[1]) < 1) return null; }
  // orientation from the corners (the arcs' signs are physical: + away from the room, so they do not change when the order is reversed)
  if (polyArea2(P) < 0) {
    const n = P.length;
    P = P.slice().reverse();
    A = A.map((a) => ({ i: (n - 2 - a.i + n) % n, sweep: a.sweep })).sort((x, y) => x.i - y.i);
  }
  const poly0 = outlineOf(P, A);
  for (let i = 0; i < poly0.length; i++) for (let j = i + 2; j < poly0.length; j++) {
    if (i === 0 && j === poly0.length - 1) continue;
    if (segCross(poly0[i], poly0[(i + 1) % poly0.length], poly0[j], poly0[(j + 1) % poly0.length])) return null;
  }
  if (Math.abs(polyArea2(poly0)) < 1) return null;
  const poly = outlineOf(P, A);
  const x0 = Math.min(...poly.map((p) => p[0])), y0 = Math.min(...poly.map((p) => p[1]));
  return { pts: P.map((p) => [r6(p[0] - x0), r6(p[1] - y0)]), arcs: A, w: r6(Math.max(...poly.map((p) => p[0])) - x0), d: r6(Math.max(...poly.map((p) => p[1])) - y0) };
}

export function cleanRoom(raw, fallback = { w: 3600, d: 3000, h: 2400 }) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const h = clamp(num(r.h, fallback.h), 1, 1e5);
  let out = { w: clamp(num(r.w, fallback.w), 1, 1e5), d: clamp(num(r.d, fallback.d), 1, 1e5), h, shape: 'rect' };
  if (r.shape === 'free') {
    const sh = cleanShape(r.pts, r.arcs);
    if (sh) {
      out = { w: sh.w, d: sh.d, h, shape: 'free', pts: sh.pts };
      if (sh.arcs.length) out.arcs = sh.arcs;
      // a rectangle typed as a free outline is a rectangle (walls S E N W)
      else if (sh.pts.length === 4 && sh.pts.every((p, i) => { const q = sh.pts[(i + 1) % 4]; return Math.abs(p[0] - q[0]) < EPS || Math.abs(p[1] - q[1]) < EPS; })) out = { w: out.w, d: out.d, h, shape: 'rect' };
    }
  } else if (r.shape === 'L' && r.notch && typeof r.notch === 'object') {
    const at = ['NE', 'NW', 'SE', 'SW'].includes(r.notch.at) ? r.notch.at : 'NE';
    out.shape = 'L';
    out.notch = { w: clamp(num(r.notch.w, out.w / 3), 1, Math.max(1, out.w - 1)), d: clamp(num(r.notch.d, out.d / 3), 1, Math.max(1, out.d - 1)), at };
  } else if (r.shape === 'U' && r.notch && typeof r.notch === 'object') {
    const at = ['N', 'S', 'E', 'W'].includes(r.notch.at) ? r.notch.at : 'N';
    const horiz = at === 'N' || at === 'S';
    out.shape = 'U';
    out.notch = { w: clamp(num(r.notch.w, (horiz ? out.w : out.d) / 3), 1, Math.max(1, (horiz ? out.w : out.d) - 2)), d: clamp(num(r.notch.d, (horiz ? out.d : out.w) / 2), 1, Math.max(1, (horiz ? out.d : out.w) - 1)), at };
  }
  return out;
}

/**
 * The walls, counter-clockwise: each has the frame the layout uses (origin = the wall's start corner, u along it, n into the room). A slanted wall's frame
 * is rotated; an ARC wall's frame is its CHORD's (u from corner to corner) and it also has `arc` (angled.js arcGeom), `chord` and `len` = the arc length.
 * `turnStart` / `turnEnd` = how far the boundary turns at its two corners, degrees, + = left (a room corner), − = right (an inside corner).
 */
export function walls(room) {
  const pts = roomPts(room);
  const rect = room.shape === 'rect' || !room.shape;
  const ids = rect ? ['S', 'E', 'N', 'W'] : pts.map((_, i) => 'P' + (i + 1));
  const n = pts.length;
  const sw = new Map((room.shape === 'free' && room.arcs ? room.arcs : []).map((a) => [a.i, a.sweep]));
  const out = pts.map((a, i) => {
    const b = pts[(i + 1) % n];
    const chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = { x: r6((b[0] - a[0]) / chord), y: r6((b[1] - a[1]) / chord) };
    const arc = sw.has(i) ? arcGeom(a, b, sw.get(i)) : null;
    const w = { id: ids[i], i, a: { x: a[0], y: a[1] }, b: { x: b[0], y: b[1] }, len: arc ? arc.arcLen : r6(chord), chord: r6(chord), arc,
      frame: { o: { x: a[0], y: a[1] }, u, n: { x: r6(-u.y), y: r6(u.x) }, ang: Math.atan2(u.y, u.x) } };
    w.angle = r6((Math.atan2(u.y, u.x) * 180) / Math.PI);
    w.t0 = arc ? arc.t0 : u; w.t1 = arc ? arc.t1 : u;
    return w;
  });
  out.forEach((w, i) => {
    const p = out[(i + n - 1) % n], q = out[(i + 1) % n];
    w.turnStart = r6(turnBetween(p.t1, w.t0));
    w.turnEnd = r6(turnBetween(w.t1, q.t0));
    w.convexStart = w.turnStart > 1e-6;   // a left turn into this wall: the room's corner
    w.convexEnd = w.turnEnd > 1e-6;
    w.nextId = q.id; w.prevId = p.id;
  });
  return out;
}
export const wallById = (room, id) => walls(room).find((w) => w.id === id) || null;
/** How long a wall is for openings (they sit at positions along the chord): the chord, not the arc. */
export const openLen = (w) => w.chord;

const onSeg = (a, b, x, y) => Math.abs((b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0])) < 1e-4 * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1])) && x >= Math.min(a[0], b[0]) - 1e-4 && x <= Math.max(a[0], b[0]) + 1e-4 && y >= Math.min(a[1], b[1]) - 1e-4 && y <= Math.max(a[1], b[1]) + 1e-4;
function pointInPoly(pts, x, y) {
  for (let i = 0; i < pts.length; i++) if (onSeg(pts[i], pts[(i + 1) % pts.length], x, y)) return true;   // on an edge
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** Is (x, y) inside the room (the boundary counts)? Even-odd over the outline (arcs written out as chords). */
export function pointInRoom(room, x, y) { return pointInPoly(roomOutline(room), x, y); }

/** Does a polygon (any angle) lie inside the room? Its corners and middle are in, no room corner is inside it, and no room edge crosses its edges. */
export function polyInRoom(room, poly, tol = 0.5) {
  const out = roomOutline(room);
  for (const [x, y] of poly) if (!pointInPoly(out, x, y) && distPointPoly(out, x, y) > tol) return false;
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cy = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  if (!pointInPoly(out, cx, cy)) return false;
  // a room corner poking into the polygon (further than tol from its edges)
  for (const [px, py] of out) if (pointInPoly(poly, px, py) && distPointPoly(poly, px, py) > tol) return false;
  return true;
}
function distPointSeg(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy;
  const t = L2 ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / L2)) : 0;
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}
function distPointPoly(poly, x, y) { let d = Infinity; for (let i = 0; i < poly.length; i++) d = Math.min(d, distPointSeg(x, y, poly[i], poly[(i + 1) % poly.length])); return d; }
function segsCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
}

/** Does an axis-aligned rectangle [x0, y0, x1, y1] lie inside the room? */
export function rectInRoom(room, [x0, y0, x1, y1], tol = 0.5) { return polyInRoom(room, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], tol); }

/** Distance from a convex polygon (or a rectangle [x0, y0, x1, y1]) to the nearest wall (0 when touching or crossing). */
export function distToWalls(room, shape) {
  const poly = shape.length === 4 && typeof shape[0] === 'number' ? [[shape[0], shape[1]], [shape[2], shape[1]], [shape[2], shape[3]], [shape[0], shape[3]]] : shape;
  const out = roomOutline(room);
  let best = Infinity;
  for (let i = 0; i < out.length; i++) {
    const a = out[i], b = out[(i + 1) % out.length];
    for (let j = 0; j < poly.length; j++) {
      const c = poly[j], d = poly[(j + 1) % poly.length];
      if (segsCross(a, b, c, d)) return 0;
      best = Math.min(best, distPointSeg(c[0], c[1], a, b), distPointSeg(a[0], a[1], c, d), distPointSeg(b[0], b[1], c, d));
    }
  }
  return best === Infinity ? 0 : best;
}

export function cleanOpenings(raw, room, unit = 'mm') {
  const W = walls(room);
  const k = unit === 'in' ? 1 / 25.4 : 1;
  const out = [];
  const seen = new Set();
  for (const o of (Array.isArray(raw) ? raw.slice(0, 40) : [])) {
    if (!o || typeof o !== 'object') continue;
    const wall = W.find((w) => w.id === o.wall);
    if (!wall) continue;
    const kind = o.kind === 'window' ? 'window' : 'door';
    const w = clamp(num(o.w, (kind === 'door' ? 900 : 1200) * k), 1, wall.chord);
    const at = clamp(num(o.at, 0), 0, Math.max(0, wall.chord - w));
    let id = txt(o.id, 12).replace(/[^A-Za-z0-9-]/g, '') || (kind === 'door' ? 'D' : 'W') + (out.length + 1);
    while (seen.has(id)) id += 'x';
    seen.add(id);
    const h = clamp(num(o.h, (kind === 'door' ? 2100 : 1200) * k), 1, room.h);
    const sill = kind === 'door' ? 0 : clamp(num(o.sill, 1000 * k), 0, Math.max(0, room.h - 1));
    out.push({ id, kind, wall: wall.id, at: r6(at), w: r6(w), h: r6(h), sill: r6(sill), swing: o.swing === 'out' ? 'out' : 'in', name: txt(o.name, 40) });
  }
  return out;
}

/** The strip of floor in front of an opening, in world plan coordinates: depth into the room, the opening's width along the wall. */
export function openingPoly(room, op, depth) {
  const wall = wallById(room, op.wall);
  if (!wall) return null;
  const f = wall.frame;
  const P = (s, o) => [r6(f.o.x + f.u.x * s + f.n.x * o), r6(f.o.y + f.u.y * s + f.n.y * o)];
  return [P(op.at, 0), P(op.at + op.w, 0), P(op.at + op.w, depth), P(op.at, depth)];
}
export function openingRect(room, op, depth) {
  const wall = wallById(room, op.wall);
  if (!wall) return null;
  const f = wall.frame;
  const P = (s, o) => [f.o.x + f.u.x * s + f.n.x * o, f.o.y + f.u.y * s + f.n.y * o];
  const a = P(op.at, 0), b = P(op.at + op.w, depth);
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

/** Parse "x,y" lines or "x,y x,y …" typed by a person into corner pairs. */
export function parsePoints(text) {
  const out = [];
  for (const m of String(text || '').matchAll(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/g)) out.push([Number(m[1]), Number(m[2])]);
  return out;
}

/** The corners of a right-angled outline from the lengths of its edges: start at (0, 0) going east, then turn left (L) or right (R) at each corner. "4000 L 2500 L 1500 R …". */
export function outlineFromTurns(lengths, turns) {
  const pts = [[0, 0]];
  let dir = [1, 0];
  for (let i = 0; i < lengths.length; i++) {
    const p = pts[pts.length - 1];
    pts.push([p[0] + dir[0] * lengths[i], p[1] + dir[1] * lengths[i]]);
    dir = turns[i] === 'R' ? [dir[1], -dir[0]] : [-dir[1], dir[0]];
  }
  pts.pop();
  return pts;
}

/**
 * Typed walls. Lines of text, one wall each, from (0, 0):
 *   `length angle`                      a straight wall: its length and its direction in degrees (0 = east, 90 = north, counter-clockwise)
 *   `arc radius sweep [heading]`        an arc wall: radius, sweep in degrees (+ bulges away from the room, − into it), and the heading of its chord
 *                                       (the direction from where it starts to where it ends; the previous wall's heading when left out)
 * The last wall closes the outline by itself if you stop short of the start. parseSegments(text) → [{ kind, … }].
 */
export function parseSegments(text) {
  const out = [];
  for (const raw of String(text || '').split(/\r?\n/).slice(0, 64)) {
    const l = raw.replace(/#.*/, '').trim();
    if (!l) continue;
    const nums = (l.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (/^arc\b/i.test(l)) { if (nums.length >= 2) out.push({ kind: 'arc', radius: nums[0], sweep: nums[1], heading: nums.length >= 3 ? nums[2] : null }); }
    else if (nums.length >= 2) out.push({ kind: 'line', len: nums[0], angle: nums[1] });
  }
  return out;
}
export function outlineFromSegments(segs) {
  if (!Array.isArray(segs) || segs.length < 2) return null;
  const pts = [[0, 0]], arcs = [];
  let heading = 0;
  for (let k = 0; k < segs.length; k++) {
    const sg = segs[k], p = pts[pts.length - 1];
    let next;
    if (sg.kind === 'arc') {
      const rr = num(sg.radius, NaN), sw = num(sg.sweep, NaN);
      if (!(rr > 0) || !(Math.abs(sw) >= 0.5 && Math.abs(sw) < 180)) return null;
      heading = sg.heading === null || sg.heading === undefined ? heading : num(sg.heading, heading);
      next = arcEnd(p, heading, rr, sw);
      arcs.push({ i: pts.length - 1, sweep: sw });
    } else {
      const len = num(sg.len, NaN);
      if (!(len > 0)) return null;
      heading = num(sg.angle, 0);
      next = edgeEnd(p, len, heading);
    }
    pts.push(next);
  }
  // the last point is the start again when the outline closes by itself
  const last = pts[pts.length - 1];
  if (Math.hypot(last[0], last[1]) < 1) pts.pop();
  return { pts, arcs: arcs.filter((a) => a.i < pts.length) };
}
