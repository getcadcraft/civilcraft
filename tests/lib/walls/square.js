/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/square.js — moving walls and keeping their corners (0.9 FX.22, FX.62, FX.67). Canonical here since walls-plan-09, so CadCraft
 * plan walls and BimCraft run ONE solver; the code is BimCraft's wall-square.js, byte for byte apart from this header (the test
 * lib/walls/test/test.mjs checks they still agree; BimCraft's own copy can be replaced by this one when its owner syncs). No DOM and
 * no model access: each function takes the walls of a level as rows { guid, a, b, t, bulge, storey, joins } (plan mm; joins =
 * [{ other, pos, otherPos, kind }], the stored join record, which the solver uses instead of looking at where ends are) and answers
 * with the new ends, a Map guid → { a, b }. A refusal throws { key: 'model.err.short' }.
 *
 *   squareMove(walls, guid, d)            the wall moves d mm square to itself (to its left is +); each corner slides along
 *                                         the joined wall, so that wall keeps its angle and the room stays square
 *   moveJoined(walls, moves)              the Move tool: walls move by [dx, dy]; every wall joined to them follows and stays joined
 *   squareUp(walls, guid)                 the connected walls within SQUARE_TOL of a right angle to the main direction go to it
 *   setAngle(walls, guid, deg)            this wall at deg to the wall joined at its start (else its end; else from east)
 *   setLength(walls, guid, mm, from)      the far end's joined wall moves square, so it follows and stays at its angle
 *   setLengthGrow(walls, guid, mm, from, fixed)   the same with the end (start | end | centre) that holds
 *   lengthFrom(walls, wall, from)         centre | inside | outside (the faces)
 *   roomSize / setRoomSize                the distance to the parallel wall across the room, from centres or faces
 */
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
const along = (w) => { const L = dist(w.a, w.b) || 1; return [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L]; };
const leftOf = (u) => [-u[1], u[0]];
const plus = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
const D2R = Math.PI / 180;

/** Walls read from a model that holds its joins carry them (`joins`); plain walls (tests, older files) are joined by where their ends are. */
const stored = (walls) => walls.some((x) => x.joins);
const NODE_TOL = 1;          // ends this close (mm) are joined, as updateWall's carryJoined reads it
const PARALLEL = Math.sin(5 * D2R);   // under this a joined wall can't guide a corner: the wall simply carries it
export const SQUARE_TOL = 10;   // degrees: further than this from a right angle, a wall is meant to be that way
const short = () => Object.assign(new Error('model.err.short'), { key: 'model.err.short' });

const sameLevel = (walls, w) => walls.filter((x) => x.storey === w.storey);
const find = (walls, guid) => { const w = walls.find((x) => x.guid === guid); if (!w) throw Object.assign(new Error('model.err.nowall'), { key: 'model.err.nowall' }); return w; };
/** The other walls with an end on this point: [{ w, end }]. */
const joinedAt = (walls, p, not) => {
  const out = [];
  if (stored(walls)) {   // 0.9 FX.60: the join record, not the geometry: what is recorded as end + end at this end of the wall
    const n = walls.find((x) => x.guid === not), end = !n ? null : dist(n.a, p) <= NODE_TOL ? 'a' : dist(n.b, p) <= NODE_TOL ? 'b' : null;
    if (!end) return out;
    const pos = end === 'a' ? 'start' : 'end';
    for (const r of n.joins) {
      if (r.pos !== pos || r.otherPos === 'mid') continue;
      const o = walls.find((x) => x.guid === r.other);
      if (o) out.push({ w: o, end: r.otherPos === 'start' ? 'a' : 'b' });
    }
    return out;
  }
  for (const x of walls) {
    if (x.guid === not) continue;
    if (dist(x.a, p) <= NODE_TOL) out.push({ w: x, end: 'a' }); else if (dist(x.b, p) <= NODE_TOL) out.push({ w: x, end: 'b' });
  }
  return out;
};
const otherEnd = (j) => (j.end === 'a' ? j.w.b : j.w.a);
/** Which way a joined wall runs away from the shared corner. */
const awayFrom = (j) => { const u = along(j.w); return j.end === 'a' ? u : [-u[0], -u[1]]; };
/** The straight wall whose body this point lands on (a T), not at its ends. */
function hostOf(walls, p, not) {
  if (stored(walls)) {
    const n = walls.find((x) => x.guid === not), end = !n ? null : dist(n.a, p) <= NODE_TOL ? 'a' : dist(n.b, p) <= NODE_TOL ? 'b' : null;
    const r = end && n.joins.find((j) => j.pos === (end === 'a' ? 'start' : 'end') && j.otherPos === 'mid');
    const h = r && walls.find((x) => x.guid === r.other);
    return h && !h.bulge ? h : null;
  }
  for (const x of walls) {
    if (x.guid === not || x.bulge) continue;
    const u = along(x), L = dist(x.a, x.b), rel = [p[0] - x.a[0], p[1] - x.a[1]], s = dot(rel, u);
    if (s > NODE_TOL && s < L - NODE_TOL && Math.abs(cross(u, rel)) <= x.t / 2 + NODE_TOL) return x;
  }
  return null;
}
/** The walls with an end on this wall's side (a T): [{ x, end, p }]. */
function buttingInto(walls, wall) {
  const out = [];
  if (stored(walls)) {
    for (const r of wall.joins || []) {
      if (r.pos !== 'mid' || r.otherPos === 'mid') continue;
      const x = walls.find((y) => y.guid === r.other);
      if (!x || x.bulge) continue;
      const end = r.otherPos === 'start' ? 'a' : 'b';
      out.push({ x, end, p: x[end] });
    }
    return out;
  }
  const u = along(wall), n = leftOf(u), L = dist(wall.a, wall.b);
  for (const x of walls) {
    if (x.guid === wall.guid || x.bulge) continue;
    for (const end of ['a', 'b']) {
      const p = x[end], rel = [p[0] - wall.a[0], p[1] - wall.a[1]], s = dot(rel, u);
      if (s <= NODE_TOL || s >= L - NODE_TOL || Math.abs(dot(rel, n)) > wall.t / 2 + NODE_TOL) continue;
      out.push({ x, end, p });
    }
  }
  return out;
}
const planOf = () => new Map();
function put(plan, w, end, to) {
  const cur = plan.get(w.guid) || { a: w.a, b: w.b };
  plan.set(w.guid, { ...cur, [end]: to });
}
/** Refuse a move that would turn a wall back through its far end. */
function keepsDirection(from, was, to) { if (dot([was[0] - from[0], was[1] - from[1]], [to[0] - from[0], to[1] - from[1]]) <= 0 || dist(from, to) < NODE_TOL) throw short(); }

/** Move a corner: each wall on it follows; `w` itself is left to the caller. */
function carry(plan, walls, p, to, not, checkAll = true) {
  for (const j of joinedAt(walls, p, not)) {
    if (checkAll) keepsDirection(otherEnd(j), p, to);
    put(plan, j.w, j.end, to);
  }
}

/**
 * The wall moves d mm along its left normal. `prefer` (a guid): that joined wall guides the corner it shares, whichever other
 * wall is there. → Map guid → { a, b }.
 */
export function squareMove(allWalls, guid, d, { prefer = null } = {}) {
  const wall = find(allWalls, guid), walls = sameLevel(allWalls, wall), plan = planOf();
  if (wall.bulge || !Number.isFinite(d)) return plan;
  const u = along(wall), n = leftOf(u), L = dist(wall.a, wall.b);
  for (const end of ['a', 'b']) {
    const p = wall[end], joined = joinedAt(walls, p, guid);
    // the guide: the straight joined wall most square to this one (a T's host when nothing is joined)
    let guide = null, best = PARALLEL;
    for (const j of joined) {
      if (j.w.bulge) continue;
      const g = awayFrom(j), c = Math.abs(cross(u, g));
      if (j.w.guid === prefer && c >= PARALLEL) { guide = g; break; }
      if (c >= best) { best = c; guide = g; }
    }
    if (!guide && !joined.length) { const h = hostOf(walls, p, guid); if (h && Math.abs(cross(u, along(h))) >= PARALLEL) guide = along(h); }
    const to = guide ? plus(p, guide, d / dot(guide, n)) : plus(p, n, d);
    carry(plan, walls, p, to, guid, !!guide);
    put(plan, wall, end, to);
  }
  // partitions butting into this wall come with it, along their own line
  for (const { x, end, p } of buttingInto(walls, wall)) {
    const g = along(x), c = dot(g, n);
    if (Math.abs(c) < PARALLEL) continue;
    const to = plus(p, g, d / c), far = end === 'a' ? x.b : x.a;
    keepsDirection(far, p, to);
    carry(plan, walls, p, to, x.guid);
    put(plan, x, end, to);
  }
  const mine = plan.get(guid);
  if (dot([mine.b[0] - mine.a[0], mine.b[1] - mine.a[1]], u) < NODE_TOL) throw short();
  return plan;
}
/** A drag's vector as a square move: how far along the wall's left. */
export const squareDistance = (wall, v) => dot(v, leftOf(along(wall)));

// ------------------------------------------------------------------------------------------------------------- move (any way)
/** Where the line through p along d meets the line through q along e (null when they are parallel). */
const meetAt = (p, d, q, e) => { const c = cross(d, e); if (Math.abs(c) < 1e-9) return null; const s = cross([q[0] - p[0], q[1] - p[1]], e) / c; return plus(p, d, s); };
/**
 * 0.9 FX.62, the Move tool: these walls move by their own [dx, dy] (guid → [dx, dy]) and every wall joined to them follows and
 * stays joined, with nobody picked first (the wall tool spec's rules 2 and 3). At a corner or T the wall that is not moving keeps its
 * direction and its far end: its end slides along its own line to where the moved wall's new line crosses it (spec test 1: the top wall
 * up 500, the side walls lengthen 500; test 2: a partition butting into a moved wall comes with it). Walls moved together keep their
 * corners as they are. A free end goes with the move. A neighbour parallel to the moved wall cannot guide the corner, so it is carried
 * (it turns), as before. → Map guid → { a, b }; curved walls move as they are and carry what is joined to them.
 */
export function moveJoined(allWalls, moves) {
  const plan = planOf(), S = new Map([...moves].filter(([g, v]) => Array.isArray(v) && (Math.abs(v[0]) + Math.abs(v[1]) > 0)));
  if (!S.size) return plan;
  const level = sameLevel(allWalls, find(allWalls, [...S.keys()][0])), keys = new Set(S.keys());
  for (const g of S.keys()) find(level, g);
  for (const [g, v] of S) {
    const w = find(level, g), u = along(w), moved = (p) => [p[0] + v[0], p[1] + v[1]];
    for (const end of ['a', 'b']) {
      const p = w[end], np = moved(p), all = joinedAt(level, p, g), outside = all.filter((j) => !keys.has(j.w.guid)), together = all.length > outside.length;
      let to = np;
      if (!w.bulge && !together) {
        const guide = outside.filter((j) => !j.w.bulge && Math.abs(cross(u, along(j.w))) >= PARALLEL)
          .sort((x, y) => Math.abs(cross(u, along(y.w))) - Math.abs(cross(u, along(x.w))))[0];
        if (guide) to = meetAt(np, u, p, awayFrom(guide)) || np;
        else if (!outside.length) {   // a T end: it stays on the wall it butts into
          const h = hostOf(level, p, g);
          if (h && !keys.has(h.guid) && Math.abs(cross(u, along(h))) >= PARALLEL) to = meetAt(np, u, h.a, along(h)) || np;
        }
      }
      for (const j of outside) { if (!j.w.bulge) keepsDirection(otherEnd(j), p, to); put(plan, j.w, j.end, to); }
      put(plan, w, end, to);
    }
    // partitions butting into this wall come with it, along their own line
    if (w.bulge) continue;
    for (const { x, end, p } of buttingInto(level, w)) {
      if (keys.has(x.guid)) continue;
      const gx = along(x), to = meetAt(moved(w.a), u, p, gx);
      if (!to || Math.abs(cross(u, gx)) < PARALLEL) continue;
      keepsDirection(end === 'a' ? x.b : x.a, p, to);
      carry(plan, level, p, to, x.guid);
      put(plan, x, end, to);
    }
  }
  for (const [g, m] of plan) {
    const w = find(level, g), u = along(w);
    if (!w.bulge && dot([m.b[0] - m.a[0], m.b[1] - m.a[1]], u) < NODE_TOL) throw short();
  }
  return plan;
}

// ------------------------------------------------------------------------------------------------------------- square up
/** The walls connected to this one by shared ends or T joints, straight ones only. */
function connected(walls, start) {
  if (stored(walls)) {
    const seen = new Set([start.guid]), todo = [start];
    while (todo.length) {
      const w = todo.pop();
      for (const r of w.joins || []) { const x = walls.find((y) => y.guid === r.other); if (x && !seen.has(x.guid) && !x.bulge && r.kind !== 'X') { seen.add(x.guid); todo.push(x); } }
    }
    return walls.filter((x) => seen.has(x.guid));
  }
  const seen = new Set([start.guid]), todo = [start], touch = (x, y) => [x.a, x.b].some((p) => dist(p, y.a) <= NODE_TOL || dist(p, y.b) <= NODE_TOL || hostOf([y], p, x.guid));
  while (todo.length) {
    const w = todo.pop();
    for (const x of walls) if (!seen.has(x.guid) && !x.bulge && (touch(w, x) || touch(x, w))) { seen.add(x.guid); todo.push(x); }
  }
  return walls.filter((x) => seen.has(x.guid));
}
const mod90 = (deg) => ((deg % 90) + 90) % 90;
const off90 = (x, y) => { const d = Math.abs(mod90(x) - mod90(y)); return Math.min(d, 90 - d); };
/** The direction most of the wall length runs in (mod 90°); a tie goes to the picked wall. */
function mainDirection(list, picked) {
  const dir = (w) => Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) / D2R;
  let best = null;
  for (const c of list) {
    const score = list.reduce((s, x) => s + (off90(dir(c), dir(x)) <= 1 ? dist(x.a, x.b) : 0), 0) + (c.guid === picked.guid ? 1e-3 : 0);
    if (!best || score > best.score) best = { score, deg: dir(c) };
  }
  return best.deg;
}
/**
 * Square up: every connected wall within SQUARE_TOL of a right angle to the main direction turns to it about its middle (walls
 * in line with each other turn as one), and each corner goes where the new lines meet. Other walls keep their line.
 * → Map guid → { a, b }; empty when nothing needs to change.
 */
export function squareUp(allWalls, guid, { tol = SQUARE_TOL } = {}) {
  const wall = find(allWalls, guid), level = sameLevel(allWalls, wall), plan = planOf();
  if (wall.bulge) return plan;
  const list = connected(level, wall), main = mainDirection(list, wall);
  // walls in line with a joined neighbour share one line
  const parent = new Map(list.map((w) => [w.guid, w.guid]));
  const root = (g) => { while (parent.get(g) !== g) g = parent.get(g); return g; };
  for (const w of list) for (const p of [w.a, w.b]) for (const j of joinedAt(list, p, w.guid)) if (Math.abs(cross(along(w), along(j.w))) < Math.sin(0.5 * D2R)) parent.set(root(j.w.guid), root(w.guid));
  const groups = new Map();
  for (const w of list) { const r = root(w.guid); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(w); }
  const lines = new Map();   // guid → { c, u }: the line this wall will lie on
  let changes = false;
  for (const g of groups.values()) {
    let sx = 0, sy = 0, sl = 0;
    for (const w of g) { const L = dist(w.a, w.b); sx += (w.a[0] + w.b[0]) / 2 * L; sy += (w.a[1] + w.b[1]) / 2 * L; sl += L; }
    const c = [sx / sl, sy / sl], u0 = along(g[0]), deg = Math.atan2(u0[1], u0[0]) / D2R;
    const k = Math.round((deg - main) / 90), want = main + k * 90, snap = Math.abs(deg - want) <= tol;
    const u = snap ? [Math.cos(want * D2R), Math.sin(want * D2R)] : u0;
    if (snap && Math.abs(deg - want) > 1e-4) changes = true;
    for (const w of g) lines.set(w.guid, { c: snap ? c : w.a, u });
  }
  if (!changes) return plan;
  // each corner: the point nearest all the lines through it (least squares; a touch of pull to where it is, so a free end
  // stays where the line lets it and two walls in line can't leave it undecided)
  const solve = (p, ls) => {
    const eps = 1e-9;
    let A = eps, B = 0, D = eps, ex = eps * p[0], ey = eps * p[1];
    for (const l of ls) { const n = leftOf(l.u), s = dot(n, l.c); A += n[0] * n[0]; B += n[0] * n[1]; D += n[1] * n[1]; ex += n[0] * s; ey += n[1] * s; }
    const det = A * D - B * B;
    return [(D * ex - B * ey) / det, (A * ey - B * ex) / det];
  };
  for (const w of list) {
    for (const end of ['a', 'b']) {
      const p = w[end], ls = [lines.get(w.guid)];
      for (const j of joinedAt(list, p, w.guid)) ls.push(lines.get(j.w.guid));
      if (ls.length === 1) {
        const h = hostOf(list, p, w.guid);
        if (h) { const l = lines.get(h.guid), off = cross(along(h), [p[0] - h.a[0], p[1] - h.a[1]]); ls.push({ c: plus(l.c, leftOf(l.u), off), u: l.u }); }   // a T keeps its side of the host's centre line
      }
      put(plan, w, end, solve(p, ls));
    }
  }
  for (const w of list) {
    const m = plan.get(w.guid);
    if (dot([m.b[0] - m.a[0], m.b[1] - m.a[1]], along(w)) < NODE_TOL) throw short();
  }
  // a curved wall on a corner comes with it
  for (const w of list) for (const end of ['a', 'b']) for (const j of joinedAt(level, w[end], w.guid)) if (j.w.bulge) put(plan, j.w, j.end, plan.get(w.guid)[end]);
  return plan;
}

// ------------------------------------------------------------------------------------------------------------------ angle
/** The wall's angle: { deg, to } `to` the joined wall it is read from (null = from east, 0–360). */
export function angleOf(allWalls, guid) {
  const wall = find(allWalls, guid), walls = sameLevel(allWalls, wall), u = along(wall);
  for (const [end, dir] of [['a', u], ['b', [-u[0], -u[1]]]]) {
    const j = joinedAt(walls, wall[end], guid).filter((x) => !x.w.bulge && Math.abs(cross(u, along(x.w))) >= PARALLEL)[0];
    if (j) {
      const g = awayFrom(j), deg = Math.acos(Math.max(-1, Math.min(1, dot(dir, g)))) / D2R;
      return { deg, to: j.w.guid, end };
    }
  }
  const deg = Math.atan2(u[1], u[0]) / D2R;
  return { deg: (deg + 360) % 360, to: null, end: 'a' };
}
/** Turn the wall to `deg`, about the corner it is read from. The far corner slides along its joined wall where it can. */
export function setAngle(allWalls, guid, deg) {
  const wall = find(allWalls, guid), walls = sameLevel(allWalls, wall), plan = planOf();
  if (wall.bulge || !Number.isFinite(deg)) return plan;
  const now = angleOf(walls, guid), pivot = wall[now.end], farEnd = now.end === 'a' ? 'b' : 'a', far = wall[farEnd], L = dist(pivot, far);
  const was = [(far[0] - pivot[0]) / L, (far[1] - pivot[1]) / L];
  let dir;
  if (now.to) {
    if (!(deg > 0 && deg < 180)) throw Object.assign(new Error('model.err.angle'), { key: 'model.err.angle' });
    const j = joinedAt(walls, pivot, guid).find((x) => x.w.guid === now.to), g = awayFrom(j), sign = cross(g, was) < 0 ? -1 : 1, r = sign * deg * D2R;
    dir = [g[0] * Math.cos(r) - g[1] * Math.sin(r), g[0] * Math.sin(r) + g[1] * Math.cos(r)];
  } else {
    const r = (now.end === 'a' ? deg : deg + 180) * D2R;
    dir = [Math.cos(r), Math.sin(r)];
  }
  let to = plus(pivot, dir, L);
  const guide = joinedAt(walls, far, guid).filter((x) => !x.w.bulge).sort((p, q) => Math.abs(cross(dir, along(q.w))) - Math.abs(cross(dir, along(p.w))))[0];
  if (guide && Math.abs(cross(dir, along(guide.w))) >= PARALLEL) {
    const g = along(guide.w), s = cross([far[0] - pivot[0], far[1] - pivot[1]], g) / cross(dir, g);
    if (s > NODE_TOL && s < 20 * L) to = plus(pivot, dir, s);
  }
  carry(plan, walls, far, to, guid);
  put(plan, wall, now.end, pivot);
  put(plan, wall, farEnd, to);
  // partitions butting into this wall come with it, along their own line
  for (const { x, end, p } of buttingInto(walls, wall)) {
    const g = along(x), c = cross(dir, g);
    if (Math.abs(c) < PARALLEL) continue;
    put(plan, x, end, plus(p, g, cross([pivot[0] - p[0], pivot[1] - p[1]], dir) / -c));
  }
  return plan;
}

// ------------------------------------------------------------------------------------------------------------- measuring
export const MEASURE_FROM = ['center', 'inside', 'outside'];
/** The side of the wall its outside is on: +1 left, -1 right. */
const outSide = (w) => (w.extSide === 'right' ? -1 : 1);
/** Where one end stops along the wall on its inside or outside face (0 at wall.a). */
function faceStop(walls, wall, end, from) {
  const u = along(wall), L = dist(wall.a, wall.b), base = end === 'a' ? 0 : L;
  const js = joinedAt(walls, wall[end], wall.guid).filter((j) => !j.w.bulge && Math.abs(cross(u, along(j.w))) >= PARALLEL);
  if (!js.length) return base;
  const j = js.sort((p, q) => Math.abs(cross(u, along(q.w))) - Math.abs(cross(u, along(p.w))))[0];
  const g = along(j.w), m = leftOf(g), n = leftOf(u), off = (from === 'outside' ? 1 : -1) * outSide(wall) * wall.t / 2;
  // this wall's face line against each face of the joined wall: inside stops at the nearer, outside at the further
  const stops = [1, -1].map((s) => {
    const q = plus(j.w.a, m, s * j.w.t / 2), start = plus(wall.a, n, off);
    return cross([q[0] - start[0], q[1] - start[1]], g) / cross(u, g);
  });
  const grow = (end === 'b') === (from === 'outside');
  return grow ? Math.max(...stops) : Math.min(...stops);
}
/** This wall's length from its centre line or a face. */
export function lengthFrom(allWalls, wall, from = 'center') {
  if (from === 'center' || wall.bulge) return wall.len ?? dist(wall.a, wall.b);
  const walls = sameLevel(allWalls, wall);
  return faceStop(walls, wall, 'b', from) - faceStop(walls, wall, 'a', from);
}
/**
 * Give the wall this length, read from `from`: its end moves, and the wall joined there moves square so it keeps its angle
 * (with no such wall, the end just goes there).
 */
export function setLength(allWalls, guid, mm, from = 'center') {
  const wall = find(allWalls, guid), walls = sameLevel(allWalls, wall), plan = planOf();
  if (wall.bulge || !(mm > 0)) return plan;
  const u = along(wall), delta = mm - lengthFrom(walls, wall, from);
  const j = joinedAt(walls, wall.b, guid).filter((x) => !x.w.bulge && Math.abs(cross(u, along(x.w))) >= PARALLEL)
    .sort((p, q) => Math.abs(cross(u, along(q.w))) - Math.abs(cross(u, along(p.w))))[0];
  if (j) return squareMove(walls, j.w.guid, delta * dot(u, leftOf(along(j.w))), { prefer: guid });
  const to = plus(wall.b, u, delta);
  keepsDirection(wall.a, wall.b, to);
  carry(plan, walls, wall.b, to, guid, false);
  put(plan, wall, 'b', to);
  return plan;
}
/** The same wall drawn the other way (its ends, its joins' positions and its outside side swapped), so a recipe for its end works on its start. */
function reversed(walls, guid) {
  const flip = { start: 'end', end: 'start', mid: 'mid' };
  return walls.map((x) => {
    if (x.guid === guid) return { ...x, a: x.b, b: x.a, extSide: x.extSide === 'right' ? 'left' : 'right', joins: x.joins && x.joins.map((j) => ({ ...j, pos: flip[j.pos] })), joinOff: x.joinOff && { a: x.joinOff.b, b: x.joinOff.a } };
    return x.joins ? { ...x, joins: x.joins.map((j) => (j.other === guid ? { ...j, otherPos: flip[j.otherPos] } : j)) } : x;
  });
}
const unreverse = (plan, guid) => { const m = plan.get(guid); if (m) plan.set(guid, { a: m.b, b: m.a }); return plan; };
const applied = (walls, plan) => walls.map((x) => { const m = plan.get(x.guid); return m ? { ...x, a: m.a, b: m.b, len: x.bulge ? x.len : dist(m.a, m.b) } : x; });   // the stored Length is the old one
export const GROW = ['start', 'end', 'centre'];
/**
 * 0.9 FX.67 (wall tool spec page 11: "start end fixed by default; toggle to grow from the other end or the centre"): the Length with a
 * fixed side. 'start' = setLength (the start holds, the end moves, the wall joined there moves square); 'end' = the end holds and the
 * start moves (the wall joined at the start moves square); 'centre' = half each way. → Map guid → { a, b }.
 */
export function setLengthGrow(allWalls, guid, mm, from = 'center', fixed = 'start') {
  if (fixed === 'end') return unreverse(setLength(reversed(allWalls, guid), guid, mm, from), guid);
  if (fixed !== 'centre') return setLength(allWalls, guid, mm, from);
  const wall = find(allWalls, guid), now = lengthFrom(allWalls, wall, from);
  const first = setLength(allWalls, guid, now + (mm - now) / 2, from), walls1 = applied(allWalls, first);
  const second = unreverse(setLength(reversed(walls1, guid), guid, mm, from), guid);
  for (const [g, m] of second) first.set(g, m);
  return first;
}
/** The fixed side's point while the Length field is focused (the marker on the plan). */
export function fixedPoint(wall, fixed = 'start') { return fixed === 'end' ? wall.b : fixed === 'centre' ? [(wall.a[0] + wall.b[0]) / 2, (wall.a[1] + wall.b[1]) / 2] : wall.a; }

/** The parallel wall across the room: reached through a joined wall first, else the nearest facing it on its inside. */
export function oppositeWall(allWalls, wall) {
  if (wall.bulge) return null;
  const walls = sameLevel(allWalls, wall), u = along(wall), n = leftOf(u), L = dist(wall.a, wall.b);
  const parallel = (x) => !x.bulge && x.guid !== wall.guid && Math.abs(cross(u, along(x))) < Math.sin(1 * D2R);
  const gap = (x) => dot([x.a[0] - wall.a[0], x.a[1] - wall.a[1]], n);
  const seen = [];
  for (const end of ['a', 'b']) for (const j of joinedAt(walls, wall[end], wall.guid)) {
    if (j.w.bulge || Math.abs(cross(u, along(j.w))) < PARALLEL) continue;
    for (const k of joinedAt(walls, otherEnd(j), j.w.guid)) if (parallel(k.w) && Math.abs(gap(k.w)) > NODE_TOL) seen.push(k.w);
  }
  if (!seen.length) {
    const overlaps = (x) => { const s = [dot([x.a[0] - wall.a[0], x.a[1] - wall.a[1]], u), dot([x.b[0] - wall.a[0], x.b[1] - wall.a[1]], u)]; return Math.max(...s) > 0 && Math.min(...s) < L; };
    const inward = -outSide(wall);
    for (const x of walls) if (parallel(x) && overlaps(x) && gap(x) * inward > NODE_TOL) seen.push(x);
  }
  return seen.sort((p, q) => Math.abs(gap(p)) - Math.abs(gap(q)))[0] || null;
}
/** The size of the room across this wall: { value, opposite, sign } (sign: which way along its left the opposite wall is). */
export function roomSize(allWalls, wall, from = 'center') {
  const o = oppositeWall(allWalls, wall);
  if (!o) return null;
  const g = dot([o.a[0] - wall.a[0], o.a[1] - wall.a[1]], leftOf(along(wall))), half = (wall.t + o.t) / 2;
  const D = Math.abs(g);
  return { value: from === 'inside' ? D - half : from === 'outside' ? D + half : D, opposite: o.guid, sign: g < 0 ? -1 : 1 };
}
/** Make the room this size: this wall moves square, away from the opposite one to grow it. */
export function setRoomSize(allWalls, guid, mm, from = 'center') {
  const wall = find(allWalls, guid), r = roomSize(allWalls, wall, from);
  if (!r || !(mm > 0)) return planOf();
  return squareMove(allWalls, guid, -r.sign * (mm - r.value));
}
/** Typed: the wall moves this far outward (its outside is +). */
export const moveOutward = (allWalls, guid, mm) => squareMove(allWalls, guid, outSide(find(allWalls, guid)) * mm);
/** A grip's end near square to a joined wall (within maxDeg, seen from `fixed`) goes square to it: { p } or null. */
export function squareSnap(walls, wall, fixed, p, { maxDeg = 3, round = 0 } = {}) {
  const j = joinedAt(sameLevel(walls, wall), fixed, wall.guid).find((x) => !x.w.bulge);
  const len = dist(fixed, p);
  if (!j || len < 1) return null;
  const v = [(p[0] - fixed[0]) / len, (p[1] - fixed[1]) / len], g = along(j.w);
  for (const d of [g, leftOf(g), [-g[0], -g[1]], [g[1], -g[0]]]) {
    if (dot(v, d) < Math.cos(maxDeg * D2R)) continue;
    let l = len * dot(v, d);
    if (round > 0) l = Math.max(round, Math.round(l / round) * round);
    return { p: plus(fixed, d, l), kind: 'ortho' };
  }
  return null;
}
