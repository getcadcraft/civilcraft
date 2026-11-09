/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/modify.js — the Modify recipes of the wall tool (0.9 WT.3, wall tool spec pages 5-6, tests 4 and 9; session walls-09).
 * Host-free: walls as plain rows { guid, a, b, t, bulge, joins? } in, a plan out (Map guid → { a, b }: every wall that moves), which the
 * host writes as one undo step and hands to its join solver like any other change.
 *
 *   dimensionMove(dim, value, wall)    edit by dimension: a dimension { a, b, value } measured from a reference to a point on `wall`
 *                                      (resolved, plan mm) is typed to `value`: → the distance the wall moves square to itself
 *                                      (to its left, +), so the far reference point lands where the value says and the other end of
 *                                      the dimension holds. null when the wall cannot change it by moving square (it runs along the
 *                                      dimension).
 *   boxStretch(walls, box, d)          Archicad's stretch with a marquee: every wall end inside the box moves by d = [dx, dy]; a wall
 *                                      with both ends inside moves whole and the walls that butt into its side (a T) slide along their
 *                                      own line to stay on it; a wall with one end inside stretches. → plan
 *   inBox(box, p)                      box { minX, minY, maxX, maxY }
 *   offsetDistance(wall, p, typed)     the Offset tool: how far (to the wall's left, +) a wall goes for a pointer at p, or the typed
 *                                      distance on the pointer's side
 *   growFrom(wall, mm, from)           FX.67: a new length with a fixed side: 'start' (a holds), 'end' (b holds) or 'centre' (both
 *                                      ends move by half) → { a, b, fixed: [[x, y]...] } (the fixed points, for the marker)
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (v) => { const L = Math.hypot(v[0], v[1]); return L > 0 ? [v[0] / L, v[1] / L] : [1, 0]; };
const leftOf = (u) => [-u[1], u[0]];
const fail = (key) => { throw Object.assign(new Error(key), { key }); };

export function dimensionMove(dim, value, wall) {
  if (!(value > 0) || !dim || !(dim.value > 0)) return null;
  if (wall.bulge) return null;
  const e = unit(sub(dim.b, dim.a)), n = leftOf(unit(sub(wall.b, wall.a))), k = dot(n, e);
  if (Math.abs(k) < 0.05) return null;   // the wall runs along the dimension: moving it square does not change it
  return (value - dim.value) / k;
}

export const inBox = (box, p) => p[0] >= box.minX && p[0] <= box.maxX && p[1] >= box.minY && p[1] <= box.maxY;
const meetAt = (p, d, q, e) => { const c = cross(d, e); if (Math.abs(c) < 1e-9) return null; const s = cross(sub(q, p), e) / c; return [p[0] + d[0] * s, p[1] + d[1] * s]; };

export function boxStretch(walls, box, d) {
  const plan = new Map();
  if (!(Math.abs(d[0]) + Math.abs(d[1]) > 0)) return plan;
  const mv = (p) => [p[0] + d[0], p[1] + d[1]];
  const whole = new Set();
  for (const w of walls) {
    const ia = inBox(box, w.a), ib = inBox(box, w.b);
    if (!ia && !ib) continue;
    plan.set(w.guid, { a: ia ? mv(w.a) : w.a, b: ib ? mv(w.b) : w.b });
    if (ia && ib) whole.add(w.guid);
  }
  // a partition whose end sits on the side of a wall that moved whole slides along its own line to that wall's new line
  for (const x of walls) {
    if (x.bulge) continue;
    for (const end of ['a', 'b']) {
      if (inBox(box, x[end])) continue;
      const host = walls.find((h) => whole.has(h.guid) && !h.bulge && h.guid !== x.guid && onSide(h, x[end]));
      if (!host) continue;
      const u = unit(sub(x.b, x.a)), hu = unit(sub(host.b, host.a));
      if (Math.abs(cross(u, hu)) < 0.05) continue;
      const to = meetAt(x[end], u, mv(host.a), hu);
      if (!to) continue;
      const cur = plan.get(x.guid) || { a: x.a, b: x.b };
      plan.set(x.guid, { ...cur, [end]: to });
    }
  }
  for (const [g, m] of plan) if (dist(m.a, m.b) < 10) fail('model.err.short');
  return plan;
}
function onSide(h, p) {
  const L = dist(h.a, h.b), u = unit(sub(h.b, h.a)), r = sub(p, h.a), s = dot(r, u);
  return s > 1 && s < L - 1 && Math.abs(cross(u, r)) <= (h.t || 0) / 2 + 1;
}

export function offsetDistance(wall, p, typed = null) {
  const n = leftOf(unit(sub(wall.b, wall.a))), side = dot(sub(p, wall.a), n);
  if (typed !== null && Number.isFinite(typed)) return (side < 0 ? -1 : 1) * Math.abs(typed);
  return side;
}

export const GROW_FROM = ['start', 'end', 'centre'];
export function growFrom(wall, mm, from = 'start') {
  if (!(mm > 0)) fail('model.err.length');
  const u = unit(sub(wall.b, wall.a)), L = dist(wall.a, wall.b), d = mm - L;
  if (from === 'end') { const a = [wall.a[0] - u[0] * d, wall.a[1] - u[1] * d]; return { a, b: wall.b, fixed: [wall.b] }; }
  if (from === 'centre') { const h = d / 2; return { a: [wall.a[0] - u[0] * h, wall.a[1] - u[1] * h], b: [wall.b[0] + u[0] * h, wall.b[1] + u[1] * h], fixed: [[(wall.a[0] + wall.b[0]) / 2, (wall.a[1] + wall.b[1]) / 2]] }; }
  return { a: wall.a, b: [wall.b[0] + u[0] * d, wall.b[1] + u[1] * d], fixed: [wall.a] };
}
