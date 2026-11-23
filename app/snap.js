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
 *
 * 0.10.1 (suggestion #1970): snaps on the LINES of what is drawn, not only its vertices.
 *   snapSegments(state, { skip }) → [{ a: {x, y, z?}, b: {x, y, z?}, kind: 'pad'|'parcel'|'mass'|'feature' }]   pad, parcel and mass
 *       edges and feature lines (arcs as their pieces). Alignments are not listed (their curves are not their PI polygon).
 *       A pad corner's z is its own elevation, else the pad's; `skip` = a vertex being dragged: its own object is left out.
 *   segmentSnap(segs, w, tol, { from }) → { x, y, z?, kind } | null   the best snap within `tol` (project units) of w, in this
 *       order: 'cross' (where two lines cross), 'mid' (the middle of a segment), 'perp' (the foot of the perpendicular from
 *       `from`, the last point placed, when given), 'near' (the closest place on a line). z is read along the segment when
 *       both its ends have one.
 *   Targets from snapTargets carry z too when the vertex has one (feature-line vertices, pad corners).
 */

import { flatten } from './featureline.js';

const list = (a) => (Array.isArray(a) ? a : []);
const finite = (v) => typeof v === 'number' && Number.isFinite(v);

export function snapTargets(state, { skip = null } = {}) {
  const out = [];
  const add = (v, kind, ref = v, z = v?.z) => { if (v && ref !== skip && Number.isFinite(v.x) && Number.isFinite(v.y)) out.push({ x: v.x, y: v.y, kind, ref, ...(kind !== 'pi' && kind !== 'structure' && finite(z) ? { z } : {}) }); };
  for (const a of list(state?.alignments)) list(a.pis).forEach((p) => add(p, 'pi'));
  for (const d of list(state?.pads)) list(d.pts).forEach((p) => add(p, 'corner', p, finite(p.z) ? p.z : Number(d.z)));
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

export function snapSegments(state, { skip = null } = {}) {
  const out = [];
  const ok = (p) => p && finite(p.x) && finite(p.y);
  const ring = (pts, kind, closed, zOf = (p) => p.z) => {
    const P = list(pts);
    if (P.length < 2 || !P.every(ok) || (skip && P.includes(skip))) return;
    for (let i = 0; i < (closed ? P.length : P.length - 1); i++) {
      const a = P[i], b = P[(i + 1) % P.length], za = zOf(a), zb = zOf(b);
      if (Math.hypot(b.x - a.x, b.y - a.y) > 1e-12) out.push({ a: { x: a.x, y: a.y, ...(finite(za) ? { z: za } : {}) }, b: { x: b.x, y: b.y, ...(finite(zb) ? { z: zb } : {}) }, kind });
    }
  };
  for (const d of list(state?.pads)) ring(d.pts, 'pad', true, (p) => (finite(p.z) ? p.z : Number(d.z)));
  for (const c of list(state?.parcels)) ring(c.pts, 'parcel', true, () => undefined);
  for (const m of list(state?.masses)) ring(m.pts, 'mass', true, () => undefined);
  for (const f of list(state?.features)) {
    const P = list(f.pts);
    if (P.length < 2 || !P.every(ok) || (skip && P.includes(skip))) continue;
    ring(flatten(f), 'feature', false);   // a closed line's pieces already end back at its start
  }
  return out;
}

export function segmentSnap(segs, w, tol, { from = null } = {}) {
  if (!w || !(tol > 0)) return null;
  const near = [];
  for (const s of list(segs)) {
    const dx = s.b.x - s.a.x, dy = s.b.y - s.a.y, L2 = dx * dx + dy * dy;
    if (!(L2 > 0)) continue;
    const u = Math.max(0, Math.min(1, ((w.x - s.a.x) * dx + (w.y - s.a.y) * dy) / L2));
    const d = Math.hypot(w.x - s.a.x - dx * u, w.y - s.a.y - dy * u);
    if (d <= tol) near.push({ s, u, d, dx, dy, L2 });
  }
  if (!near.length) return null;
  const at = (c, u, kind) => { const s = c.s, p = { x: s.a.x + c.dx * u, y: s.a.y + c.dy * u, kind }; if (finite(s.a.z) && finite(s.b.z)) p.z = s.a.z + (s.b.z - s.a.z) * u; return p; };
  const dist = (p) => Math.hypot(p.x - w.x, p.y - w.y);
  let best = null;
  const take = (p) => { if (dist(p) <= tol && (!best || dist(p) < dist(best))) best = p; };
  // where two of the nearby lines cross
  for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) {
    const A = near[i], B = near[j], den = A.dx * B.dy - A.dy * B.dx;
    if (Math.abs(den) < 1e-12 * Math.sqrt(A.L2 * B.L2)) continue;
    const ex = B.s.a.x - A.s.a.x, ey = B.s.a.y - A.s.a.y, u = (ex * B.dy - ey * B.dx) / den, v = (ex * A.dy - ey * A.dx) / den;
    if (u < -1e-9 || u > 1 + 1e-9 || v < -1e-9 || v > 1 + 1e-9) continue;
    if ((u < 1e-9 || u > 1 - 1e-9) && (v < 1e-9 || v > 1 - 1e-9)) continue;   // two ends meeting is a vertex, found by the vertex snap
    take(at(A, Math.max(0, Math.min(1, u)), 'cross'));
  }
  if (best) return best;
  for (const c of near) take(at(c, 0.5, 'mid'));
  if (best) return best;
  if (from && finite(from.x) && finite(from.y)) {
    for (const c of near) {
      const u = ((from.x - c.s.a.x) * c.dx + (from.y - c.s.a.y) * c.dy) / c.L2;
      if (u < 0 || u > 1) continue;
      const p = at(c, u, 'perp');
      if (Math.hypot(p.x - from.x, p.y - from.y) > 1e-9) take(p);   // a point already on the line has no perpendicular to it
    }
    if (best) return best;
  }
  near.sort((p, q) => p.d - q.d);
  return at(near[0], near[0].u, 'near');
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
