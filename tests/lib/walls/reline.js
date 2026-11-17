/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/reline.js — a wall gets a new LINE (an end dragged by its grip, the wall turned): its joined walls keep their direction
 * (0.9 FX.63, wall tool spec section 8, solver step 2: "recalculate the other wall's joined end to the new intersection with the changed
 * wall's location line. The other wall keeps its direction unless the user is dragging that end"; session walls-plan-10). Host-free, no
 * DOM, no model access; the rows are square.js's: { guid, a, b, t, bulge, storey, joins } in plan mm (joins = [{ other, pos, otherPos,
 * kind }], the stored join record; rows without `joins` are joined by where their ends are). square.js is not changed: it stays byte for
 * byte BimCraft's wall-square.js; this file only calls its setLengthGrow for a drag along the wall.
 *
 *   relineJoined(walls, lines)        lines = Map guid → { a, b }: where the person put these walls. Each joined wall that the person
 *                                     did not move keeps its direction and its far end: its joined end slides along its OWN line to
 *                                     where the changed wall's new line crosses it, and the changed wall's end goes there too. An end
 *                                     butting into a wall (T) stays on that wall. Partitions butting into a changed wall follow along
 *                                     their own line. Walls changed together (a corner moved: both walls on it are in `lines`) keep the
 *                                     corner where the person put it, so both turn. A neighbour that cannot guide the corner (it runs
 *                                     along the changed wall, or the crossing would fold the wall back) is carried: its end goes with
 *                                     the changed end, so it turns. A neighbour that would be turned back through its far end is
 *                                     refused: throws { key: 'model.err.short' }.   → Map guid → { a, b }
 *   endDrag(walls, guid, end, to)     one end ('a' | 'b') dragged to `to`, the other end holds. Along the wall's own line it is a
 *                                     Length change (square.js setLengthGrow: the joined wall moves parallel, decision D1 option A);
 *                                     any other way it is relineJoined.   → Map guid → { a, b }
 */
import { setLengthGrow } from './square.js';

const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const along = (w) => { const L = dist(w.a, w.b) || 1; return [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L]; };
const NODE_TOL = 1;                               // mm, as square.js
const PARALLEL = Math.sin(5 * Math.PI / 180);     // under this a joined wall cannot guide a corner, as square.js
const short = () => Object.assign(new Error('model.err.short'), { key: 'model.err.short' });
const find = (walls, guid) => { const w = walls.find((x) => x.guid === guid); if (!w) throw Object.assign(new Error('model.err.nowall'), { key: 'model.err.nowall' }); return w; };
const stored = (walls) => walls.some((x) => x.joins);
const posOf = (end) => (end === 'a' ? 'start' : 'end');

/** The other walls with an end on this end of the wall: [{ w, end }] (the record when the rows carry it, else where the ends are). */
function joinedAt(walls, w, end) {
  const out = [];
  if (stored(walls)) {
    for (const r of w.joins || []) {
      if (r.pos !== posOf(end) || r.otherPos === 'mid') continue;
      const o = walls.find((x) => x.guid === r.other);
      if (o) out.push({ w: o, end: r.otherPos === 'start' ? 'a' : 'b' });
    }
    return out;
  }
  for (const x of walls) {
    if (x.guid === w.guid) continue;
    if (dist(x.a, w[end]) <= NODE_TOL) out.push({ w: x, end: 'a' }); else if (dist(x.b, w[end]) <= NODE_TOL) out.push({ w: x, end: 'b' });
  }
  return out;
}
/** The straight wall this end of the wall butts into (a T), or null. */
function hostOf(walls, w, end) {
  if (stored(walls)) {
    const r = (w.joins || []).find((j) => j.pos === posOf(end) && j.otherPos === 'mid');
    const h = r && walls.find((x) => x.guid === r.other);
    return h && !h.bulge ? h : null;
  }
  const p = w[end];
  for (const x of walls) {
    if (x.guid === w.guid || x.bulge) continue;
    const u = along(x), L = dist(x.a, x.b), rel = sub(p, x.a), s = dot(rel, u);
    if (s > NODE_TOL && s < L - NODE_TOL && Math.abs(cross(u, rel)) <= x.t / 2 + NODE_TOL) return x;
  }
  return null;
}
/** The walls with an end on this wall's side (a T): [{ x, end }]. */
function buttingInto(walls, wall) {
  const out = [];
  if (stored(walls)) {
    for (const r of wall.joins || []) {
      if (r.pos !== 'mid' || r.otherPos === 'mid') continue;
      const x = walls.find((y) => y.guid === r.other);
      if (x && !x.bulge) out.push({ x, end: r.otherPos === 'start' ? 'a' : 'b' });
    }
    return out;
  }
  const u = along(wall), L = dist(wall.a, wall.b);
  for (const x of walls) {
    if (x.guid === wall.guid || x.bulge) continue;
    for (const end of ['a', 'b']) {
      const rel = sub(x[end], wall.a), s = dot(rel, u);
      if (s > NODE_TOL && s < L - NODE_TOL && Math.abs(cross(u, rel)) <= wall.t / 2 + NODE_TOL) out.push({ x, end });
    }
  }
  return out;
}
/** Where the line through p along d meets the line through q along e (null when they run together). */
const meetAt = (p, d, q, e) => { const c = cross(d, e); if (Math.abs(c) < 1e-9) return null; const s = cross(sub(q, p), e) / c; return [p[0] + d[0] * s, p[1] + d[1] * s]; };
/** A wall whose end goes from `was` to `to` must not be turned back through its far end `from`. */
const turnsBack = (from, was, to) => dot(sub(was, from), sub(to, from)) <= 0 || dist(from, to) < NODE_TOL;
function put(plan, w, end, to) {
  const cur = plan.get(w.guid) || { a: w.a, b: w.b };
  plan.set(w.guid, { ...cur, [end]: to });
}

export function relineJoined(allWalls, lines) {
  const plan = new Map(), S = new Map([...lines].filter(([, l]) => l && Array.isArray(l.a) && Array.isArray(l.b)));
  if (!S.size) return plan;
  const first = find(allWalls, [...S.keys()][0]), level = allWalls.filter((x) => x.storey === first.storey), keys = new Set(S.keys());
  for (const g of keys) find(level, g);
  for (const [g, l] of S) {
    const w = find(level, g), len = dist(l.a, l.b);
    if (len < NODE_TOL) throw short();
    const u = [(l.b[0] - l.a[0]) / len, (l.b[1] - l.a[1]) / len];
    for (const end of ['a', 'b']) {
      const p = w[end], q = l[end], other = end === 'a' ? l.b : l.a, away = end === 'a' ? [-u[0], -u[1]] : u;   // away: from the other end towards this one
      const all = joinedAt(level, w, end), outside = all.filter((j) => !keys.has(j.w.guid)), together = all.length > outside.length;
      let to = q;
      if (!w.bulge && !together) {
        // the guide: the straight joined wall most square to the new line (a T end: the wall it butts into)
        const guide = outside.filter((j) => !j.w.bulge && Math.abs(cross(u, along(j.w))) >= PARALLEL)
          .sort((x, y) => Math.abs(cross(u, along(y.w))) - Math.abs(cross(u, along(x.w))))[0];
        let line = guide ? { p, d: along(guide.w) } : null;
        if (!line && !outside.length) { const h = hostOf(level, w, end); if (h && !keys.has(h.guid) && Math.abs(cross(u, along(h))) >= PARALLEL) line = { p: h.a, d: along(h) }; }
        const x = line && meetAt(q, u, line.p, line.d);
        // a crossing that folds the changed wall back onto its other end is no corner: the neighbour is carried instead
        if (x && dot(sub(x, other), away) >= NODE_TOL) to = x;
      }
      for (const j of outside) { if (!j.w.bulge && turnsBack(j.end === 'a' ? j.w.b : j.w.a, p, to)) throw short(); put(plan, j.w, j.end, to); }
      put(plan, w, end, to);
    }
    if (w.bulge) continue;
    // partitions butting into this wall come with it, along their own line
    for (const { x, end } of buttingInto(level, w)) {
      if (keys.has(x.guid)) continue;
      const gx = along(x), p = x[end];
      if (Math.abs(cross(u, gx)) < PARALLEL) continue;
      const to = meetAt(l.a, u, p, gx);
      if (!to) continue;
      if (turnsBack(end === 'a' ? x.b : x.a, p, to)) throw short();
      for (const j of joinedAt(level, x, end)) { if (keys.has(j.w.guid)) continue; if (!j.w.bulge && turnsBack(j.end === 'a' ? j.w.b : j.w.a, p, to)) throw short(); put(plan, j.w, j.end, to); }
      put(plan, x, end, to);
    }
  }
  for (const [g, m] of plan) {
    const w = find(level, g);
    if (w.bulge) continue;
    if (keys.has(g)) { const l = S.get(g); if (dot(sub(m.b, m.a), sub(l.b, l.a)) / dist(l.a, l.b) < NODE_TOL) throw short(); }
    else if (dot(sub(m.b, m.a), along(w)) < NODE_TOL) throw short();
  }
  return plan;
}

export function endDrag(allWalls, guid, end, to) {
  const w = find(allWalls, guid), fixed = end === 'a' ? w.b : w.a, u = along(w);
  if (!Array.isArray(to) || !Number.isFinite(to[0]) || !Number.isFinite(to[1])) return new Map();
  const off = Math.abs(cross(u, sub(to, fixed))), tol = 1e-7 * Math.max(1, dist(w.a, w.b));
  if (!w.bulge && off <= tol) {   // along the wall's own line: a Length change, the end that is not dragged holds
    const mm = dot(sub(to, fixed), end === 'a' ? [-u[0], -u[1]] : u);
    if (mm < NODE_TOL) throw short();
    return setLengthGrow(allWalls, guid, mm, 'center', end === 'a' ? 'end' : 'start');
  }
  return relineJoined(allWalls, new Map([[guid, end === 'a' ? { a: to, b: w.b } : { a: w.a, b: to }]]));
}
