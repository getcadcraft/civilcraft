/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — the sandbox's own clash and clearance check (cc-clashfix, 0.9 EG.42, session `clash-assistants-09`). DOM-free, no imports.
 * Millimetres, z up, one frame chosen by the host's adapter.
 *
 * An ELEMENT is either a solid with a box, or a run (duct, pipe, tray, conduit) with a centre line:
 *   { id, kind, discipline, box: [x0, y0, z0, x1, y1, z1] }                                   beams, columns, walls, slabs …
 *   { id, kind, discipline, path: [[x, y, z] …], section: { w, h, round }, insulation, slope, bend }  runs; the slope falls from the first
 *        point; bend = the centre-line radius of a turn up or down (mm), so a detour leaves room for its fittings
 *
 * A run is swept as boxes: a level leg along x or y is one exact box (its width across, its height up); a vertical leg is one box;
 * any other leg is cut into short pieces, each a cube of the section's larger half-size (conservative: a slanted leg may report a
 * clash a mesh check would not). The host's own mesh check stays the final word once a fix is applied; this one judges proposals
 * in the sandbox, where no mesh exists yet.
 *
 *   piecesOf(e) → [box]        boxOf(e) → box        overlapDepth(a, b) → mm (< 0: apart)        gapBetween(a, b) → mm (0 when touching)
 *   pairKey(a, b)              runVertices(e)        pathLength(e)
 *   findClashes(elements, { tolerance, among, allowed }) → [{ id, a, b, depth, point }]   deepest first; `among` = ids that must take
 *        part (the others only as the other side); `allowed` = Set of pair keys to skip (a sanctioned opening)
 *   nearest(e, elements, { skip }) → [{ id, gap }]  clear distance to every other element, nearest first
 */

export const pairKey = (a, b) => (a < b ? a + '|' + b : b + '|' + a);

/** A run's corners with its slope applied (it falls from its first point along its horizontal length). */
export function runVertices(e) {
  const out = [];
  let fall = 0;
  const P = e.path || [];
  for (let i = 0; i < P.length; i++) {
    const q = P[i];
    if (i) { const p = P[i - 1]; fall += (e.slope || 0) * Math.hypot(q[0] - p[0], q[1] - p[1]); }
    out.push([q[0], q[1], (q[2] || 0) - fall]);
  }
  return out;
}

export function pathLength(e) {
  const V = runVertices(e);
  let L = 0;
  for (let i = 1; i < V.length; i++) L += Math.hypot(V[i][0] - V[i - 1][0], V[i][1] - V[i - 1][1], V[i][2] - V[i - 1][2]);
  return L;
}

/** Half-sizes of a run's section, insulation included: [across, up]. */
export function halfSection(e) {
  const s = e.section || { w: 100, h: 100 }, ins = e.insulation || 0;
  return [s.w / 2 + ins, (s.round ? s.w : s.h) / 2 + ins];
}

/** The boxes a run is swept as, or the solid's one box. */
export function piecesOf(e) {
  if (!e.path) return e.box ? [e.box] : [];
  const V = runVertices(e), [hw, hh] = halfSection(e), R = Math.max(hw, hh), out = [];
  for (let i = 1; i < V.length; i++) {
    const a = V[i - 1], b = V[i], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d);
    if (L < 1e-6) continue;
    const u = d.map((x) => Math.abs(x) / L);
    const lo = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])], hi = [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
    if (u[0] > 0.9999 || u[1] > 0.9999) {   // level, along x or y: width across, height up
      const ax = u[0] > 0.9999 ? 1 : 0;   // the across axis
      const e3 = [0, 0, hh]; e3[ax] = hw;
      out.push([lo[0] - e3[0], lo[1] - e3[1], lo[2] - e3[2], hi[0] + e3[0], hi[1] + e3[1], hi[2] + e3[2]]);
    } else if (u[2] > 0.9999) {
      out.push([lo[0] - R, lo[1] - R, lo[2], hi[0] + R, hi[1] + R, hi[2]]);
    } else {
      const n = Math.max(1, Math.ceil(L / Math.max(R, 1)));
      for (let k = 0; k < n; k++) {
        const t0 = k / n, t1 = (k + 1) / n;
        const p = [0, 1, 2].map((j) => a[j] + d[j] * t0), q = [0, 1, 2].map((j) => a[j] + d[j] * t1);
        out.push([Math.min(p[0], q[0]) - R, Math.min(p[1], q[1]) - R, Math.min(p[2], q[2]) - R, Math.max(p[0], q[0]) + R, Math.max(p[1], q[1]) + R, Math.max(p[2], q[2]) + R]);
      }
    }
  }
  return out;
}

export function boxOf(e) {
  const P = piecesOf(e);
  if (!P.length) return null;
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const p of P) for (let j = 0; j < 3; j++) { if (p[j] < b[j]) b[j] = p[j]; if (p[j + 3] > b[j + 3]) b[j + 3] = p[j + 3]; }
  return b;
}

/** The smallest overlap of two boxes over the three axes (negative when they are apart on some axis). */
export function overlapDepth(a, b) {
  let d = Infinity;
  for (let j = 0; j < 3; j++) d = Math.min(d, Math.min(a[j + 3], b[j + 3]) - Math.max(a[j], b[j]));
  return d;
}
/** The clear distance between two boxes (0 when they touch or overlap). */
export function boxGap(a, b) {
  let s = 0;
  for (let j = 0; j < 3; j++) { const g = Math.max(0, Math.max(a[j], b[j]) - Math.min(a[j + 3], b[j + 3])); s += g * g; }
  return Math.sqrt(s);
}

function contact(A, B) {
  let best = -Infinity, at = null;
  for (const p of A) for (const q of B) {
    const d = overlapDepth(p, q);
    if (d > best) { best = d; at = [0, 1, 2].map((j) => (Math.max(p[j], q[j]) + Math.min(p[j + 3], q[j + 3])) / 2); }
  }
  return { depth: best, point: at };
}
export function gapBetween(a, b) {
  const A = piecesOf(a), B = piecesOf(b);
  let g = Infinity;
  for (const p of A) for (const q of B) g = Math.min(g, boxGap(p, q));
  return g;
}

/** Clashes among the elements: pairs whose pieces run into each other by more than `tolerance` mm on every axis. */
export function findClashes(elements, { tolerance = 10, among = null, allowed = null } = {}) {
  const must = among ? new Set(among) : null;
  const items = elements.map((e) => ({ e, box: boxOf(e) })).filter((x) => x.box).sort((p, q) => p.box[0] - q.box[0]);
  const active = [], out = [];
  for (const it of items) {
    for (let i = active.length - 1; i >= 0; i--) if (active[i].box[3] < it.box[0]) active.splice(i, 1);
    for (const o of active) {
      if (o.e.id === it.e.id) continue;
      if (must && !must.has(o.e.id) && !must.has(it.e.id)) continue;
      if (o.e.group && o.e.group === it.e.group) continue;   // parts of one thing (a host may say so)
      if (overlapDepth(o.box, it.box) <= tolerance) continue;
      const id = pairKey(o.e.id, it.e.id);
      if (allowed && allowed.has(id)) continue;
      const c = contact(piecesOf(o.e), piecesOf(it.e));
      if (c.depth > tolerance) { const [a, b] = o.e.id < it.e.id ? [o.e.id, it.e.id] : [it.e.id, o.e.id]; out.push({ id, a, b, depth: c.depth, point: c.point }); }
    }
    active.push(it);
  }
  return out.sort((x, y) => y.depth - x.depth || (x.id < y.id ? -1 : 1));
}

/** Clear distance from e to every other element, nearest first. */
export function nearest(e, elements, { skip = null, within = Infinity } = {}) {
  const bx = boxOf(e), out = [];
  if (!bx) return out;
  for (const o of elements) {
    if (o.id === e.id || (skip && skip(o))) continue;
    const ob = boxOf(o);
    if (!ob || boxGap(bx, ob) > within) continue;
    out.push({ id: o.id, gap: gapBetween(e, o) });
  }
  return out.sort((a, b) => a.gap - b.gap);
}
