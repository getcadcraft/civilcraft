/* SPDX-License-Identifier: Apache-2.0 */
/**
 * walls.js — 2D smart walls, doors and windows (cc-plan2d, 0.9 PLAN2D). DOM-free, no 3D, no host imports: CadCraft is the first
 * host (cadcraft/dev/plan2d/, tools/plan2d/sync.mjs); anything that can place a block can host it.
 *
 * A wall is an ordinary block reference. Its block holds plain lines, arcs and fills; its settings live in the reference's
 * extended data under CADCRAFT_WALL, so Move, Copy, Erase, layers, plotting and DWG/DXF need nothing new, and another CAD
 * program sees one block per wall. The data is one JSON text in 1000 strings:
 *   { v:1, a:[x,y], b:[x,y] (the centre line, in the block's own coordinates), t (thickness), f ('' | 'solid' | a pattern name),
 *     ops: [ { k:'door'|'window', st, at (centre, measured from a), w (width), hinge:'s'|'e', sw:1|-1 (the side it swings to:
 *     1 = left of a→b), open (degrees, 0 = closed) } ],
 *     g (the wall's own id, stable through save and copy: 0.9 FX.59), jn (its join records, below), jo ('a' | 'b' | 'ab': an end that
 *     disallows joins), lj (location line: 'l' or 'r' = the left or right face is the line that holds when the thickness changes; absent = centre), h (the Hold records whose subject is this wall, lib/walls/hold.js) }
 *
 * The join record (0.9 FX.59, the same record as BimCraft's IfcRelConnectsPathElements, rules in lib/walls/joins.js): a join is kept
 * on BOTH walls as jn: [{ o: the other wall's g, me: 'start'|'end'|'mid', ot: the other's place, k: 'L'|'T'|'X' }]. Joins are no
 * longer found by position at each edit: geometry() and followMoves() use the walls the caller names (the joined ones).
 *
 *   isWall(e) · wallData(e) · withWallData(e, data) · model(e) → { id, a, b, t, f, ops, flip, scale } in world coordinates
 *   geometry(w, others) → { lines, arcs, fills } in world coordinates: clean corners, T joins, crossings, gaps for openings
 *   followMoves(changes, walls) → Map(id → { a, b }): the walls joined to the ones that moved keep their joins
 *   snapEnd(p, walls, reach) · offsetChain(pts, d, closed) · placeAt(w, p) → { at, side, d } · fits(w, op, skip)
 *   wallGrips(e) · wallGripMove(e, key, to) · wallGripAct(e, key) → the entity with its data changed (the host rebuilds the block)
 */

export const APP = 'CADCRAFT_WALL';
export const DOOR_STYLES = ['single', 'double', 'sliding', 'opening'];
export const WINDOW_STYLES = ['fixed', 'casement', 'sliding'];
const CHUNK = 200, MAX_OPS = 200;
const cache = new WeakMap();
const fin = Number.isFinite;

// ---------------------------------------------------------------------------- data

function cleanOp(o) {
  if (!o || typeof o !== 'object') return null;
  const k = o.k === 'window' ? 'window' : o.k === 'door' ? 'door' : null;
  if (!k || !fin(o.at) || !(o.w > 0)) return null;
  const styles = k === 'door' ? DOOR_STYLES : WINDOW_STYLES;
  return { k, st: styles.includes(o.st) ? o.st : styles[0], at: o.at, w: o.w, hinge: o.hinge === 'e' ? 'e' : 's', sw: o.sw === -1 ? -1 : 1, open: fin(o.open) ? Math.max(0, Math.min(180, o.open)) : 90 };
}
/** Untrusted (a file): anything that isn't a wall gives null. */
export function cleanWall(d) {
  if (!d || typeof d !== 'object' || !Array.isArray(d.a) || !Array.isArray(d.b) || !(d.t > 0)) return null;
  const nums = [d.a[0], d.a[1], d.b[0], d.b[1]];
  if (!nums.every(fin)) return null;
  const out = { v: 1, a: [nums[0], nums[1]], b: [nums[2], nums[3]], t: d.t, f: typeof d.f === 'string' ? d.f.slice(0, 64) : '', ops: (Array.isArray(d.ops) ? d.ops : []).slice(0, MAX_OPS).map(cleanOp).filter(Boolean) };
  if (typeof d.g === 'string' && /^[0-9a-zA-Z_-]{6,40}$/.test(d.g)) out.g = d.g;
  const POS = ['start', 'end', 'mid'];
  if (Array.isArray(d.jn)) out.jn = d.jn.slice(0, 64).filter((r) => r && typeof r.o === 'string' && POS.includes(r.me) && POS.includes(r.ot)).map((r) => ({ o: r.o.slice(0, 40), me: r.me, ot: r.ot, k: r.me === 'mid' && r.ot === 'mid' ? 'X' : r.me === 'mid' || r.ot === 'mid' ? 'T' : 'L' }));
  if (d.jo === 'a' || d.jo === 'b' || d.jo === 'ab') out.jo = d.jo;
  if (d.lj === 'l' || d.lj === 'r') out.lj = d.lj;
  if (Array.isArray(d.h) && d.h.length) out.h = d.h.slice(0, 32).filter((x) => x && typeof x === 'object' && ['line', 'end', 'dim'].includes(x.kind) && typeof x.id === 'string').map((x) => JSON.parse(JSON.stringify(x)));
  return out;
}
export const isWall = (e) => !!e && e.type === 'insert' && Array.isArray(e.xd?.[APP]);
export function wallData(e) {
  if (!isWall(e)) return null;
  const x = e.xd[APP];
  if (cache.has(x)) return cache.get(x);
  let d = null;
  try { d = cleanWall(JSON.parse(x.filter((r) => Number(r[0]) === 1000).map((r) => String(r[1])).join(''))); } catch { d = null; }
  cache.set(x, d);
  return d;
}
export function withWallData(e, data) {
  const text = JSON.stringify(data).replace(/[^\x20-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  const rows = [];
  for (let i = 0; i < text.length; i += CHUNK) rows.push([1000, text.slice(i, i + CHUNK)]);
  return { ...e, xd: { ...(e.xd || {}), [APP]: rows } };
}

const matrixOf = (e) => {
  const r = e.rot || 0, c = Math.cos(r), s = Math.sin(r), sx = e.sx ?? 1, sy = e.sy ?? 1;
  return { xx: c * sx, xy: s * sx, yx: -s * sy, yy: c * sy, x: e.x || 0, y: e.y || 0 };
};
const ap = (m, p) => ({ x: m.xx * p[0] + m.yx * p[1] + m.x, y: m.xy * p[0] + m.yy * p[1] + m.y });

/** The wall in world coordinates, whatever Move, Rotate, Mirror or Scale did to its reference. */
export function model(e) {
  const d = wallData(e);
  if (!d) return null;
  const m = matrixOf(e), det = m.xx * m.yy - m.xy * m.yx, scale = Math.sqrt(Math.abs(det)) || 1, flip = det < 0;
  const jo = d.jo || '';
  return { id: e.id, a: ap(m, d.a), b: ap(m, d.b), t: d.t * scale, f: d.f, flip, scale, g: d.g || '', jn: d.jn || [], jo, lj: d.lj || '', h: d.h || [],
    ops: d.ops.map((o) => ({ ...o, at: o.at * scale, w: o.w * scale, sw: flip ? -o.sw : o.sw })) };
}
/** The reference for a wall model: no rotation or scale, placed at a; the block's local coordinates start at a. */
export function canonical(e, w) {
  const data = { v: 1, a: [0, 0], b: [w.b.x - w.a.x, w.b.y - w.a.y], t: w.t, f: w.f || '', ops: w.ops.map(cleanOp).filter(Boolean) };
  if (w.g) data.g = w.g;
  if (w.jn?.length) data.jn = w.jn;
  if (w.jo) data.jo = w.jo;
  if (w.lj) data.lj = w.lj;
  if (w.h?.length) data.h = w.h;
  return withWallData({ ...e, x: w.a.x, y: w.a.y, rot: 0, sx: 1, sy: 1 }, data);
}

// ---------------------------------------------------------------------------- small geometry

const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
const dot = (p, q) => p.x * q.x + p.y * q.y;
const cross = (p, q) => p.x * q.y - p.y * q.x;
const lenOf = (p) => Math.hypot(p.x, p.y);
const same = (p, q, tol) => Math.hypot(p.x - q.x, p.y - q.y) <= tol;
function frame(w) {
  const d = sub(w.b, w.a), L = lenOf(d) || 1, u = { x: d.x / L, y: d.y / L };
  return { L, u, n: { x: -u.y, y: u.x }, h: w.t / 2 };
}
const tolOf = (w) => Math.max(1e-7, w.t * 1e-4);
/** Where lines p + s·d and q + r·e meet → s along the first, or null when they run together. */
function meet(p, d, q, e) {
  const k = cross(d, e);
  if (Math.abs(k) < 1e-7) return null;
  return cross(sub(q, p), e) / k;
}
const onSeg = (w, f, p, tol) => {   // p on the centre line, away from its ends?
  const s = dot(sub(p, w.a), f.u), off = Math.abs(dot(sub(p, w.a), f.n));
  return off <= tol && s > tol && s < f.L - tol ? s : null;
};
const boxOf = (w, pad = 0) => ({ x0: Math.min(w.a.x, w.b.x) - w.t - pad, y0: Math.min(w.a.y, w.b.y) - w.t - pad, x1: Math.max(w.a.x, w.b.x) + w.t + pad, y1: Math.max(w.a.y, w.b.y) + w.t + pad });
export const wallBox = boxOf;
export const boxesTouch = (p, q) => p.x0 <= q.x1 && q.x0 <= p.x1 && p.y0 <= q.y1 && q.y0 <= p.y1;

// ---------------------------------------------------------------------------- the joins and the outline

/**
 * For one end of w: how far along the wall each side stops, measured into the wall from the node.
 * → { left, right, cap, steps } where left / right are distances along the direction into the wall for the sides at +h / −h
 * of that direction; cap = true when nothing joins here.
 */
function endTreatment(w, f, isB, others) {
  const P = isB ? w.b : w.a, into = isB ? { x: -f.u.x, y: -f.u.y } : f.u, tol = tolOf(w);
  const arms = [{ w, d: into, h: f.h, self: true }];
  for (const o of others) {
    if (o.id === w.id) continue;
    const g = frame(o);
    if (same(o.a, P, tol)) arms.push({ w: o, d: g.u, h: g.h });
    else if (same(o.b, P, tol)) arms.push({ w: o, d: { x: -g.u.x, y: -g.u.y }, h: g.h });
  }
  const nrm = (d) => ({ x: -d.y, y: d.x });
  const at = (d, off) => ({ x: P.x + nrm(d).x * off, y: P.y + nrm(d).y * off });
  const limit = 6 * Math.max(...arms.map((a) => a.h));
  if (arms.length > 1) {
    arms.sort((p, q) => Math.atan2(p.d.y, p.d.x) - Math.atan2(q.d.y, q.d.x));
    const i = arms.findIndex((a) => a.self), me = arms[i], ccw = arms[(i + 1) % arms.length], cw = arms[(i - 1 + arms.length) % arms.length];
    const side = (off, other, otherOff) => {
      const s = meet(at(me.d, off), me.d, at(other.d, otherOff), other.d);
      return s === null || Math.abs(s) > limit ? 0 : s;
    };
    const left = side(me.h, ccw, -ccw.h), right = side(-me.h, cw, cw.h);
    // walls of different thickness in a straight run: a short step closes the gap
    const steps = [];
    if (arms.length === 2 && dot(me.d, ccw.d) < -0.9999 && Math.abs(me.h - ccw.h) > tol && me.h > ccw.h) {
      const n = nrm(me.d);
      for (const s of [1, -1]) steps.push({ x1: P.x + n.x * s * me.h, y1: P.y + n.y * s * me.h, x2: P.x + n.x * s * ccw.h, y2: P.y + n.y * s * ccw.h });
    }
    return { left, right, cap: false, steps };
  }
  // a T: this end stops on the near face of the wall it lands on
  for (const o of others) {
    if (o.id === w.id) continue;
    const g = frame(o);
    if (onSeg(o, g, P, tol) === null) continue;
    const facing = dot(into, g.n) >= 0 ? 1 : -1;
    const face = { x: o.a.x + g.n.x * facing * g.h, y: o.a.y + g.n.y * facing * g.h };
    const side = (off) => { const s = meet(at(into, off), into, face, g.u); return s === null || Math.abs(s) > limit ? 0 : s; };
    return { left: side(f.h), right: side(-f.h), cap: false, steps: [] };
  }
  return { left: 0, right: 0, cap: true, steps: [] };
}

/** The parts of [s0, s1] left after taking the gaps out. */
function minus(s0, s1, gaps) {
  const out = [];
  let from = s0;
  for (const [g0, g1] of gaps.filter((g) => g[1] > s0 && g[0] < s1).sort((p, q) => p[0] - q[0])) {
    if (g0 > from) out.push([from, Math.min(g0, s1)]);
    from = Math.max(from, g1);
  }
  if (from < s1) out.push([from, s1]);
  return out.filter((r) => r[1] - r[0] > 1e-9);
}

/** Where other walls land on or cross w, as gaps in each face: { left: [[s0, s1]…], right: […] }. */
function joinGaps(w, f, others) {
  const gaps = { left: [], right: [] }, tol = tolOf(w);
  for (const o of others) {
    if (o.id === w.id) continue;
    const g = frame(o);
    const span = (off) => {   // where the other wall's two faces cross this face
      const q = { x: w.a.x + f.n.x * off, y: w.a.y + f.n.y * off };
      const s0 = meet(q, f.u, { x: o.a.x + g.n.x * g.h, y: o.a.y + g.n.y * g.h }, g.u), s1 = meet(q, f.u, { x: o.a.x - g.n.x * g.h, y: o.a.y - g.n.y * g.h }, g.u);
      return s0 === null || s1 === null ? null : [Math.min(s0, s1), Math.max(s0, s1)];
    };
    const onA = onSeg(w, f, o.a, tol) !== null, onB = onSeg(w, f, o.b, tol) !== null;
    if (onA !== onB) {   // a T: only the face the other wall comes from opens
      const far = onA ? o.b : o.a, up = dot(sub(far, w.a), f.n) >= 0;
      const r = span(up ? f.h : -f.h);
      if (r) gaps[up ? 'left' : 'right'].push(r);
      continue;
    }
    if (onA || onB) continue;
    // a crossing: both centre lines pass through each other away from every end
    const s = meet(w.a, f.u, o.a, g.u);
    if (s === null || s <= tol || s >= f.L - tol) continue;
    const r2 = meet(o.a, g.u, w.a, f.u);
    if (r2 === null || r2 <= tol || r2 >= g.L - tol) continue;
    const l = span(f.h), r = span(-f.h);
    if (l) gaps.left.push(l);
    if (r) gaps.right.push(r);
  }
  return gaps;
}

/** A leaf from hinge H: closed along dc, opening towards sw·n by `deg` degrees. */
function leaf(out, H, dc, n, sw, len, deg) {
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const dir = { x: dc.x * c + n.x * sw * s, y: dc.y * c + n.y * sw * s };
  out.lines.push({ x1: H.x, y1: H.y, x2: H.x + dir.x * len, y2: H.y + dir.y * len });
  if (deg > 0.01) {
    const a0 = Math.atan2(dc.y, dc.x), a1 = Math.atan2(dir.y, dir.x);
    const ccw = cross(dc, dir) > 0;
    out.arcs.push({ cx: H.x, cy: H.y, r: len, a0: ccw ? a0 : a1, a1: ccw ? a1 : a0 });
  }
}

function drawOpening(out, w, f, op) {
  const Q = (s, off) => ({ x: w.a.x + f.u.x * s + f.n.x * off, y: w.a.y + f.u.y * s + f.n.y * off });
  const L = (s0, o0, s1, o1) => { const p = Q(s0, o0), q = Q(s1, o1); out.lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y }); };
  const s0 = op.at - op.w / 2, s1 = op.at + op.w / 2, h = f.h;
  L(s0, -h, s0, h); L(s1, -h, s1, h);   // the jambs
  const fromS = op.hinge !== 'e';
  const H = Q(fromS ? s0 : s1, op.sw * h);
  const dc = fromS ? f.u : { x: -f.u.x, y: -f.u.y };
  if (op.k === 'door') {
    if (op.st === 'single') leaf(out, H, dc, f.n, op.sw, op.w, op.open);
    else if (op.st === 'double') {
      leaf(out, Q(s0, op.sw * h), f.u, f.n, op.sw, op.w / 2, op.open);
      leaf(out, Q(s1, op.sw * h), { x: -f.u.x, y: -f.u.y }, f.n, op.sw, op.w / 2, op.open);
    } else if (op.st === 'sliding') {
      const k = h / 4, m = op.at;
      L(s0, k, m + op.w * 0.05, k); L(m - op.w * 0.05, -k, s1, -k);
    }
    return;
  }
  // windows: the sill lines on both faces, the glass inside
  L(s0, h, s1, h); L(s0, -h, s1, -h);
  if (op.st === 'sliding') {
    const k = h / 4, m = op.at;
    L(s0, k, m + op.w * 0.05, k); L(m - op.w * 0.05, -k, s1, -k);
    return;
  }
  L(s0, h / 4, s1, h / 4); L(s0, -h / 4, s1, -h / 4);
  if (op.st === 'casement') leaf(out, H, dc, f.n, op.sw, op.w, op.open);
}

/** The opening where it fits, or null. */
const openingOf = (op, L) => (op.w <= L + 1e-9 ? { ...op, at: Math.min(Math.max(op.at, op.w / 2), L - op.w / 2) } : null);

/** Everything the wall draws, in world coordinates. `others` = the walls it may join (its own kind of floor, same space). */
export function geometry(w, others = []) {
  const f = frame(w), out = { lines: [], arcs: [], fills: [] };
  if (lenOf(sub(w.b, w.a)) < 1e-9) return out;
  const near = others.filter((o) => o.id !== w.id && boxesTouch(boxOf(w), boxOf(o)));
  const A = endTreatment(w, f, false, near), B = endTreatment(w, f, true, near);
  const Q = (s, off) => ({ x: w.a.x + f.u.x * s + f.n.x * off, y: w.a.y + f.u.y * s + f.n.y * off });
  // into-the-wall distances → positions along the wall. At a, "into" is +u: its left is the wall's left. At b, "into" is −u: its left is the wall's right.
  const start = { left: A.left, right: A.right }, end = { left: f.L - B.right, right: f.L - B.left };
  const ops = w.ops.map((o) => openingOf(o, f.L)).filter(Boolean);
  const holes = ops.map((o) => [o.at - o.w / 2, o.at + o.w / 2]);
  const joins = joinGaps(w, f, near);
  for (const [side, off] of [['left', f.h], ['right', -f.h]]) {
    for (const [s0, s1] of minus(start[side], end[side], [...holes, ...joins[side]])) {
      const p = Q(s0, off), q = Q(s1, off);
      out.lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y });
    }
  }
  if (A.cap) { const p = Q(0, f.h), q = Q(0, -f.h); out.lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y }); }
  if (B.cap) { const p = Q(f.L, f.h), q = Q(f.L, -f.h); out.lines.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y }); }
  out.lines.push(...A.steps, ...B.steps);
  for (const o of ops) drawOpening(out, w, f, o);
  if (w.f) {
    // the fill stops at the openings; each piece runs from the left face to the right face
    const left = minus(start.left, end.left, holes), right = minus(start.right, end.right, holes);
    for (let i = 0; i < Math.min(left.length, right.length); i++) {
      const p = Q(left[i][0], f.h), q = Q(left[i][1], f.h), r = Q(right[i][1], -f.h), s = Q(right[i][0], -f.h);
      out.fills.push([p.x, p.y, q.x, q.y, r.x, r.y, s.x, s.y]);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------- walls keep their joins

/**
 * Walls that moved: the others joined to them follow (`joined(idA, idB)`, when given, says which pairs are joined: the stored record; without it, by position as before). changes = [{ id, a0, b0, a1, b1 }] (world, before and after).
 * A shared end goes where the moved end went; an end landing on a wall's length (T) slides along its own line to the wall's
 * new line. Walls the user moved themselves (in changes) are left alone.
 */
export function followMoves(changes, walls, joined = null) {
  const out = new Map(), user = new Set(changes.map((c) => c.id)), byId = new Map(walls.map((w) => [w.id, { ...w }]));
  const queue = changes.slice(), doneEnd = new Set();
  let guard = 0;
  while (queue.length && guard++ < 5000) {
    const c = queue.shift(), tol = Math.max(1e-7, (byId.get(c.id)?.t || 1) * 1e-4);
    const f0 = frame({ a: c.a0, b: c.b0, t: 1 });
    for (const x of byId.values()) {
      if (x.id === c.id || user.has(x.id)) continue;
      if (joined && !joined(c.id, x.id)) continue;   // FX.59: only walls the join record names follow
      for (const end of ['a', 'b']) {
        const key = x.id + ':' + end;
        if (doneEnd.has(key)) continue;
        const p = x[end];
        let to = null;
        if (same(p, c.a0, tol)) to = c.a1;
        else if (same(p, c.b0, tol)) to = c.b1;
        else if (onSeg({ a: c.a0, b: c.b0 }, f0, p, tol) !== null) {
          const other = end === 'a' ? x.b : x.a, d = sub(p, other), g = frame({ a: c.a1, b: c.b1, t: 1 });
          const s = meet(other, d, c.a1, g.u);
          to = s === null ? { x: p.x + (c.a1.x - c.a0.x), y: p.y + (c.a1.y - c.a0.y) } : { x: other.x + d.x * s, y: other.y + d.y * s };
        }
        if (!to || same(p, to, tol * 1e-2)) continue;
        doneEnd.add(key);
        const a0 = x.a, b0 = x.b;
        x[end] = { x: to.x, y: to.y };
        out.set(x.id, { a: x.a, b: x.b });
        queue.push({ id: x.id, a0, b0, a1: x.a, b1: x.b });
      }
    }
  }
  return out;
}

/** An end near another wall lands exactly on it: on its end, else on its centre line. `reach` = how near counts. */
export function snapEnd(p, walls, reach, skip = null) {
  let best = null, bestD = Infinity;
  for (const o of walls) {
    if (o.id === skip) continue;
    const r = Math.max(reach, o.t / 2 + 1e-9);
    for (const q of [o.a, o.b]) { const d = lenOf(sub(p, q)); if (d <= r && d < bestD - 1e-9) { best = q; bestD = d; } }
  }
  if (best) return { x: best.x, y: best.y };
  for (const o of walls) {
    if (o.id === skip) continue;
    const f = frame(o), r = Math.max(reach, f.h + 1e-9), s = dot(sub(p, o.a), f.u), off = dot(sub(p, o.a), f.n);
    if (s >= 0 && s <= f.L && Math.abs(off) <= r && Math.abs(off) < bestD) { best = { x: o.a.x + f.u.x * s, y: o.a.y + f.u.y * s }; bestD = Math.abs(off); }
  }
  return best || p;
}

/** Clicked points → the centre line when the clicks run along a face (d = the distance to the left of the direction of travel). */
export function offsetChain(pts, d, closed = false) {
  if (!d || pts.length < 2) return pts.map((p) => ({ x: p.x, y: p.y }));
  const n = pts.length, dirs = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) { const q = sub(pts[(i + 1) % n], pts[i]), L = lenOf(q) || 1; dirs.push({ x: q.x / L, y: q.y / L }); }
  return pts.map((p, i) => {
    const prev = closed ? dirs[(i - 1 + n) % n] : dirs[i - 1], next = closed ? dirs[i] : dirs[i];
    const d0 = prev || next, d1 = next || prev;
    const n0 = { x: -d0.y, y: d0.x }, n1 = { x: -d1.y, y: d1.x };
    const s = meet({ x: p.x + n0.x * d, y: p.y + n0.y * d }, d0, { x: p.x + n1.x * d, y: p.y + n1.y * d }, d1);
    return s === null ? { x: p.x + n1.x * d, y: p.y + n1.y * d } : { x: p.x + n0.x * d + d0.x * s, y: p.y + n0.y * d + d0.y * s };
  });
}

// ---------------------------------------------------------------------------- placing openings

/** A point → where along the wall, which side of it, how far from the centre line. */
export function placeAt(w, p) {
  const f = frame(w), q = sub(p, w.a), off = dot(q, f.n);
  return { at: Math.max(0, Math.min(f.L, dot(q, f.u))), side: off >= 0 ? 1 : -1, d: Math.abs(off), inside: dot(q, f.u) >= 0 && dot(q, f.u) <= f.L };
}
/** Does the opening fit: within the wall and clear of the wall's other openings? → true | 'long' | 'overlap' */
export function fits(w, op, skip = -1) {
  const f = frame(w);
  if (op.w > f.L + 1e-9) return 'long';
  const at = Math.min(Math.max(op.at, op.w / 2), f.L - op.w / 2);
  for (let i = 0; i < w.ops.length; i++) {
    if (i !== skip && Math.abs(w.ops[i].at - at) < (w.ops[i].w + op.w) / 2 - 1e-9) return 'overlap';
  }
  return true;
}

// ---------------------------------------------------------------------------- grips

/** Where each grip is: the two ends, the middle (moves the wall), each opening (slides it), each door's hinge and swing flips. */
export function wallGrips(e) {
  const w = model(e);
  if (!w) return [];
  const f = frame(w), out = [{ x: w.a.x, y: w.a.y, key: 'wall:a' }, { x: w.b.x, y: w.b.y, key: 'wall:b' }, { x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2, key: 'wall:mid' }];
  w.ops.forEach((o, i) => {
    const c = { x: w.a.x + f.u.x * o.at, y: w.a.y + f.u.y * o.at };
    out.push({ x: c.x, y: c.y, key: 'wall:op:' + i });
    const swings = (o.k === 'door' && (o.st === 'single' || o.st === 'double')) || (o.k === 'window' && o.st === 'casement');
    if (!swings) return;
    const dd = f.h + Math.max(o.w * 0.2, f.h);
    out.push({ x: c.x + f.n.x * dd, y: c.y + f.n.y * dd, key: 'wall:swing:' + i, shape: 'flip', ux: f.n.x, uy: f.n.y, kind: 'wall', name: 'swing' });
    if (o.st !== 'double') out.push({ x: c.x + f.u.x * o.w * 0.35 - f.n.x * dd, y: c.y + f.u.y * o.w * 0.35 - f.n.y * dd, key: 'wall:hinge:' + i, shape: 'flip', ux: f.u.x, uy: f.u.y, kind: 'wall', name: 'hinge' });
  });
  return out;
}
/** A drag on a grip → the reference with the wall changed (no block yet: the host's hook draws it, wallOutline previews it). */
export function wallGripMove(e, key, to) {
  const w = model(e);
  if (!w) return e;
  if (key === 'wall:a') return canonical(e, { ...w, a: { x: to.x, y: to.y } });
  if (key === 'wall:b') return canonical(e, { ...w, b: { x: to.x, y: to.y } });
  if (key === 'wall:mid') {
    const mx = (w.a.x + w.b.x) / 2, my = (w.a.y + w.b.y) / 2, dx = to.x - mx, dy = to.y - my;
    return canonical(e, { ...w, a: { x: w.a.x + dx, y: w.a.y + dy }, b: { x: w.b.x + dx, y: w.b.y + dy } });
  }
  const m = /^wall:op:(\d+)$/.exec(key);
  if (m && w.ops[+m[1]]) {
    const i = +m[1], f = frame(w), at = Math.max(w.ops[i].w / 2, Math.min(f.L - w.ops[i].w / 2, dot(sub(to, w.a), f.u)));
    const ops = w.ops.slice();
    ops[i] = { ...ops[i], at };
    return fits(w, ops[i], i) === true ? canonical(e, { ...w, ops }) : e;
  }
  return e;
}
/** A click on a flip grip. */
export function wallGripAct(e, key) {
  const w = model(e), m = /^wall:(swing|hinge):(\d+)$/.exec(key);
  if (!w || !m || !w.ops[+m[2]]) return null;
  const ops = w.ops.slice(), o = ops[+m[2]];
  ops[+m[2]] = m[1] === 'swing' ? { ...o, sw: -o.sw } : { ...o, hinge: o.hinge === 'e' ? 's' : 'e' };
  return canonical(e, { ...w, ops });
}
/** Plain lines and arcs for a preview. */
export function wallOutline(w, others = []) {
  const g = geometry(w, others);
  return [...g.lines.map((l) => ({ type: 'line', ...l })), ...g.arcs.map((a) => ({ type: 'arc', ...a }))];
}
