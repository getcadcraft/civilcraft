/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/hold.js — the Hold block of the wall tool (0.9 WT.3 align and lock, lock dimension; WT.7 walls locked to grid lines; wall
 * tool spec pages 6 and 9; session walls-09). Built once, host-free, so BimCraft, CadCraft plan walls (walls-plan-09) and SuperCad
 * Studio keep the same locks. A hold is a stored record, never guessed again at each edit:
 *
 *   { id, kind: 'line', wall, ref, to: { wall, ref } | { grid }, off }   the wall's line `ref` (its centre line or a face) stays `off`
 *                                         mm from the target line (another wall's line, or a grid line by its tag), square to it;
 *                                         Align + padlock is a line hold with off 0
 *   { id, kind: 'end', wall, end: 'a'|'b', to: { grid } }               that end of the wall stays on the grid line (WT.7)
 *   { id, kind: 'dim', dim, value }                                     the dimension (its id) keeps its value (Lock dimension)
 *
 * The host gives the geometry it alone knows (ctx):
 *   lineOf(wall, ref) → { p, u }           a point on the wall's line `ref` and its direction (its location offsets, assemblies)
 *   grid(tag) → { a, b } | null            a grid line now (plan mm of the walls' level)
 *   dim(id, walls) → { value, a, b, walls: [guidFrom, guidTo] } | null   a dimension resolved on these walls
 *   move(walls, guid, d) → Map             the wall moved d square to itself (to its left), its joined walls following (the join
 *                                         solver's square move)
 *
 *   distanceTo(line, target)               the signed distance of a line from a target line, square to the target (null when not parallel)
 *   holdsOf(holds, guids)                  the holds that name any of these walls (as subject or target)
 *   keep(walls, holds, plan, ctx, { driven })  after a change worked out as `plan` (Map guid → { a, b }) on `walls`: every hold the
 *                                         change breaks is kept by moving the wall on the other side square (it follows, with its own
 *                                         joined walls), outward until nothing changes. A hold both of whose sides were moved by the
 *                                         person (`driven`, the walls they acted on) cannot be kept that way, nor one to a grid whose
 *                                         wall moved: the change is refused with { key: 'walls.err.held', hold }.  → the plan, grown
 *   followGrid(walls, holds, tag, ctx)     a grid line moved (ctx.grid answers the new one): the walls held to it follow → plan; a grid
 *                                         line turned so a held wall can no longer lie square on it is refused (walls.err.gridturn)
 *   drop(holds, gone)                      the holds left when these walls / dimensions / grid tags are gone
 *   renameGrid(holds, from, to)            a grid line's tag changed
 */
export const TOL = 0.5;   // mm: a hold is kept when the change leaves it within this
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const unit = (v) => { const L = Math.hypot(v[0], v[1]); return L > 0 ? [v[0] / L, v[1] / L] : [1, 0]; };
const leftOf = (u) => [-u[1], u[0]];
const held = (hold, key = 'walls.err.held') => Object.assign(new Error(key), { key, hold });
const PARALLEL = Math.sin(0.5 * Math.PI / 180);

export function distanceTo(line, target) {
  const tu = unit(target.u), u = unit(line.u);
  if (Math.abs(cross(u, tu)) > PARALLEL) return null;
  return dot(sub(line.p, target.p), leftOf(tu));
}
const gridLine = (g) => (g ? { p: g.a, u: unit(sub(g.b, g.a)) } : null);
const targetLine = (h, walls, ctx) => (h.to.grid !== undefined ? gridLine(ctx.grid(h.to.grid)) : walls.has(h.to.wall) ? ctx.lineOf(walls.get(h.to.wall), h.to.ref || 'center') : null);

export const holdsOf = (holds, guids) => { const s = new Set(guids); return holds.filter((h) => s.has(h.wall) || s.has(h.to?.wall) || (h.kind === 'dim')); };

function applyPlan(walls, plan) {
  const out = new Map();
  for (const w of walls) { const m = plan.get(w.guid); out.set(w.guid, m ? { ...w, a: m.a, b: m.b } : w); }
  return out;
}
function merge(plan, more) { for (const [g, m] of more) plan.set(g, m); return plan; }

/** How far the hold is out after the change, and which wall should follow: { err, follow, d } | null (kept). */
function check(h, W, ctx, driven) {
  if (h.kind === 'line') {
    const w = W.get(h.wall), tgt = targetLine(h, W, ctx);
    if (!w || !tgt) return null;   // a side is gone: the host drops the hold
    const dl = distanceTo(ctx.lineOf(w, h.ref || 'center'), tgt);
    if (dl === null) throw held(h, 'walls.err.heldturn');   // the change turned one side: square moves cannot keep it
    const err = dl - (h.off || 0);
    if (Math.abs(err) <= TOL) return null;
    const grid = h.to.grid !== undefined;
    if (grid) { if (driven.has(h.wall)) throw held(h); return { follow: h.wall, along: tgt, err }; }
    const sub0 = driven.has(h.wall), tgt0 = driven.has(h.to.wall);
    if (sub0 && tgt0) throw held(h);
    // the side the person did not touch follows
    return sub0 ? { follow: h.to.wall, along: tgt, err: -err } : { follow: h.wall, along: tgt, err };
  }
  if (h.kind === 'end') {
    const w = W.get(h.wall), g = ctx.grid(h.to.grid);
    if (!w || !g) return null;
    const L = gridLine(g), off = dot(sub(w[h.end], L.p), leftOf(L.u));
    if (Math.abs(off) <= TOL) return null;
    throw held(h);   // an end on a grid line follows only the grid (followGrid); moving it away is refused
  }
  if (h.kind === 'dim') {
    const r = ctx.dim(h.dim, [...W.values()]);
    if (!r) return null;
    const err = r.value - h.value;
    if (Math.abs(err) <= TOL) return null;
    const [g0, g1] = r.walls, d0 = driven.has(g0), d1 = driven.has(g1);
    if ((d0 && d1) || g0 === g1) throw held(h);
    const follow = d1 && !d0 ? g0 : g1;   // the reference side holds unless it is the one the person moved
    return { follow, dim: r, err, fromSide: follow === g0 };
  }
  return null;
}
function followMove(c, W, ctx) {
  const w = W.get(c.follow);
  if (!w) return null;
  const u = unit(sub(w.b, w.a)), n = leftOf(u);
  if (c.dim) {
    // the follower moves so the value comes back: along the dimension, the far point moves by -err (the near point by +err)
    const e = unit(sub(c.dim.b, c.dim.a)), k = dot(n, e);
    if (Math.abs(k) < 0.05) return null;
    return (c.fromSide ? c.err : -c.err) / k;
  }
  // a line hold: the follower's line goes back to its distance from the target, moving square to the target
  const k = dot(n, leftOf(unit(c.along.u)));
  if (Math.abs(k) < 0.05) return null;
  return -c.err / k;
}

export function keep(walls, holds, plan, ctx, { driven = [], passes = 12 } = {}) {
  const out = new Map(plan), drv = new Set(driven);
  if (!holds.length) return out;
  for (let i = 0; i < passes; i++) {
    const W = applyPlan(walls, out);
    let moved = false;
    for (const h of holds) {
      const c = check(h, W, ctx, drv);
      if (!c) continue;
      const d = followMove(c, W, ctx);
      if (d === null || !Number.isFinite(d)) throw held(h);
      merge(out, ctx.move([...W.values()], c.follow, d));
      drv.add(c.follow);   // it has followed: from now on it is held where it is
      moved = true;
      break;   // the walls changed: look at every hold again
    }
    if (!moved) return out;
  }
  throw held(null);
}

export function followGrid(walls, holds, tag, ctx) {
  const plan = new Map(), g = ctx.grid(tag);
  if (!g) return plan;
  const L = gridLine(g), mine = holds.filter((h) => h.to?.grid === tag);
  for (const h of mine.filter((x) => x.kind === 'line')) {
    const W = applyPlan(walls, plan), w = W.get(h.wall);
    if (!w) continue;
    const dl = distanceTo(ctx.lineOf(w, h.ref || 'center'), L);
    if (dl === null) throw held(h, 'walls.err.gridturn');
    const err = dl - (h.off || 0);
    if (Math.abs(err) <= TOL) continue;
    const k = dot(leftOf(unit(sub(w.b, w.a))), leftOf(L.u));
    merge(plan, ctx.move([...W.values()], h.wall, -err / k));
  }
  for (const h of mine.filter((x) => x.kind === 'end')) {
    const W = applyPlan(walls, plan), w = W.get(h.wall);
    if (!w) continue;
    const u = unit(sub(w.b, w.a)), c = cross(u, L.u);
    if (Math.abs(c) < 0.05) throw held(h, 'walls.err.gridturn');
    const p = w[h.end], s = cross(sub(L.p, p), L.u) / c, to = [p[0] + u[0] * s, p[1] + u[1] * s];
    if (Math.abs(s) <= TOL) continue;
    const cur = plan.get(w.guid) || { a: w.a, b: w.b };
    plan.set(w.guid, { ...cur, [h.end]: to });
    // what shares that end comes with it
    for (const x of W.values()) {
      if (x.guid === w.guid) continue;
      for (const e of ['a', 'b']) if (Math.hypot(x[e][0] - p[0], x[e][1] - p[1]) <= 1) { const cx = plan.get(x.guid) || { a: x.a, b: x.b }; plan.set(x.guid, { ...cx, [e]: to }); }
    }
  }
  return plan;
}

export function drop(holds, gone) {
  const s = new Set(gone);
  return holds.filter((h) => !s.has(h.wall) && !s.has(h.to?.wall) && !s.has(h.dim) && !(h.to?.grid !== undefined && s.has('grid:' + h.to.grid)));
}
export const renameGrid = (holds, from, to) => holds.map((h) => (h.to?.grid === from ? { ...h, to: { ...h.to, grid: to } } : h));
