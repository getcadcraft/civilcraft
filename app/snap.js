/* SPDX-License-Identifier: Apache-2.0 */
/**
 * snap.js — snapping, picking and moving drawn objects (0.9 WB.10 + WB.15, a visitor's CivilCraft request). No DOM; the Node test
 * drives it (bin/test-civilcraft-snap.mjs).
 *
 *   snapTargets(state, { skip }) → [{ x, y, kind, ref, label? }]   every drawn vertex a new vertex can land on: alignment PIs,
 *       pad corners, parcel corners, building-mass corners, feature-line vertices, storm structures. Survey points are not
 *       listed (there can be thousands; the plan already finds those by their own nearest-point search). `skip` = a vertex
 *       object left out (the one being dragged).
 *   nearestSnap(targets, toScreen, s, px) → target | null   the closest target within `px` screen pixels of s = {x, y}
 *   translate(pts, dx, dy) · rotate(pts, cx, cy, angle) — move / turn a list of {x, y} IN PLACE (other keys stay, arcs `b` are unchanged)
 *   bearingBetween(a, b) → radians   the direction a → b (atan2(dy, dx), the same angle the alignment code uses)
 *   setTangent(pis, k, dir) → boolean   point tangent k (PI k → PI k+1) along `dir`, keeping its length; PI k+1 moves, later PIs keep
 *       their place (so the next tangent changes). False when the tangent has no length or k is out of range.
 *   copyOf(obj, id, name, dx, dy) → a deep copy with a new id and name, moved by dx, dy (alignment pis · pad / parcel / feature pts)
 */

const list = (a) => (Array.isArray(a) ? a : []);

export function snapTargets(state, { skip = null } = {}) {
  const out = [];
  const add = (v, kind, ref = v) => { if (v && ref !== skip && Number.isFinite(v.x) && Number.isFinite(v.y)) out.push({ x: v.x, y: v.y, kind, ref }); };
  for (const a of list(state?.alignments)) list(a.pis).forEach((p) => add(p, 'pi'));
  for (const d of list(state?.pads)) list(d.pts).forEach((p) => add(p, 'corner'));
  for (const c of list(state?.parcels)) list(c.pts).forEach((p) => add(p, 'corner'));
  for (const m of list(state?.masses)) list(m.pts).forEach((p) => add(p, 'corner'));
  for (const f of list(state?.features)) list(f.pts).forEach((p) => add(p, 'vertex'));
  for (const s of list(state?.network?.structures)) add(s, 'structure');
  return out;
}

export function nearestSnap(targets, toScreen, s, px = 10) {
  let best = null, bd = px;
  for (const t of targets) {
    const q = toScreen(t.x, t.y), d = Math.hypot(q.x - s.x, q.y - s.y);
    if (d <= bd) { bd = d; best = t; }
  }
  return best;
}

export function translate(pts, dx, dy) {
  for (const p of pts) { p.x += dx; p.y += dy; }
  return pts;
}

export function rotate(pts, cx, cy, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  for (const p of pts) {
    const x = p.x - cx, y = p.y - cy;
    p.x = cx + x * c - y * s;
    p.y = cy + x * s + y * c;
  }
  return pts;
}

export const bearingBetween = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

export function setTangent(pis, k, dir) {
  if (!Number.isInteger(k) || k < 0 || k + 1 >= pis.length || !Number.isFinite(dir)) return false;
  const a = pis[k], b = pis[k + 1], L = Math.hypot(b.x - a.x, b.y - a.y);
  if (!(L > 1e-9)) return false;
  b.x = a.x + L * Math.cos(dir);
  b.y = a.y + L * Math.sin(dir);
  return true;
}

export function copyOf(obj, id, name, dx, dy) {
  const c = JSON.parse(JSON.stringify(obj));
  c.id = id;
  c.name = name;
  translate(list(c.pis || c.pts), dx, dy);
  return c;
}
