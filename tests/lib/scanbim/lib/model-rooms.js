/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model-rooms.js — rooms and the building's outline found from the walls (0.5 part 3, BM.6). No DOM: bin/test-bimcraft.mjs
 * --model runs it in Node. Plan millimetres.
 *
 *   planLoops(polys) → { rooms: [{ poly, holes, area, perimeter, centroid }], outlines: [{ poly, area, perimeter }] }
 *     polys = the walls' joined outlines (model-walls.js wallOutlines). Rooms are the closed spaces the walls enclose
 *     (their inner faces, anticlockwise; free-standing walls inside a room are its holes); outlines are the building's outer
 *     faces (anticlockwise), one per separate building on the level.
 *   loopAt(loops, p) → the room (or outline) containing p (the smallest), or null
 *
 * How: every edge of every outline, split where edges cross or overlap (a T wall's end lies along the through wall's face);
 * a piece is on the boundary of the walls when one side of it is inside a wall and the other is not; turned so the free
 * side is on its left, the pieces are walked into closed loops (at a point where several meet, the next piece is the first
 * one clockwise from the way back). A loop going anticlockwise is a room; clockwise, the outside round a building (its
 * outline, turned round) or round an island inside a room (a hole).
 */
const EPS = 1e-6;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

export function planLoops(polys, { snap = 1e-3 } = {}) {
  const edges = [];
  for (const p of polys) for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) > EPS) edges.push([a, b]); }
  // split every edge at the points where others cross or touch it
  const cuts = edges.map(() => [0, 1]);
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const [a, b] = edges[i], [c, d] = edges[j];
    const r = sub(b, a), s = sub(d, c), den = cross(r, s), ca = sub(c, a);
    if (Math.abs(den) < 1e-12 * Math.hypot(...r) * Math.hypot(...s)) {
      // parallel: overlapping when collinear — each cut at the other's ends
      if (Math.abs(cross(ca, r)) > 1e-6 * Math.hypot(...r)) continue;
      const rr = dot(r, r), ss = dot(s, s);
      for (const q of [c, d]) { const t = dot(sub(q, a), r) / rr; if (t > EPS && t < 1 - EPS) cuts[i].push(t); }
      for (const q of [a, b]) { const t = dot(sub(q, c), s) / ss; if (t > EPS && t < 1 - EPS) cuts[j].push(t); }
      continue;
    }
    const t = cross(ca, s) / den, u = cross(ca, r) / den;
    if (t < -EPS || t > 1 + EPS || u < -EPS || u > 1 + EPS) continue;
    if (t > EPS && t < 1 - EPS) cuts[i].push(t);
    if (u > EPS && u < 1 - EPS) cuts[j].push(u);
  }
  const key = (p) => Math.round(p[0] / snap) + ',' + Math.round(p[1] / snap);
  const pts = new Map();
  const node = (p) => { const k = key(p); if (!pts.has(k)) pts.set(k, [p[0], p[1]]); return k; };
  const pieces = new Map();
  edges.forEach(([a, b], i) => {
    const ts = [...new Set(cuts[i].map((x) => Math.round(x * 1e9) / 1e9))].sort((x, y) => x - y);
    for (let k = 0; k + 1 < ts.length; k++) {
      const p = [a[0] + (b[0] - a[0]) * ts[k], a[1] + (b[1] - a[1]) * ts[k]], q = [a[0] + (b[0] - a[0]) * ts[k + 1], a[1] + (b[1] - a[1]) * ts[k + 1]];
      const kp = node(p), kq = node(q);
      if (kp === kq) continue;
      const id = kp < kq ? kp + '|' + kq : kq + '|' + kp;
      if (!pieces.has(id)) pieces.set(id, [kp, kq]);
    }
  });
  // which pieces are on the boundary, turned so the free side is on the left
  const inside = (x, y) => polys.some((p) => inPoly(x, y, p));
  const out = new Map();   // node → [{ to, ang }]
  for (const [kp, kq] of pieces.values()) {
    const p = pts.get(kp), q = pts.get(kq), d = sub(q, p), L = Math.hypot(...d);
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], n = [-d[1] / L, d[0] / L], h = Math.min(0.5, L / 4);
    const left = inside(m[0] + n[0] * h, m[1] + n[1] * h), right = inside(m[0] - n[0] * h, m[1] - n[1] * h);
    if (left === right) continue;
    const [from, to] = left ? [kq, kp] : [kp, kq];   // free on the left
    if (!out.has(from)) out.set(from, []);
    const a = pts.get(from), b = pts.get(to);
    out.get(from).push({ to, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), used: false });
  }
  // walk the loops
  const loops = [];
  for (const [start, list] of out) for (const e0 of list) {
    if (e0.used) continue;
    const loop = [start];
    let cur = start, e = e0, guard = 0;
    while (e && !e.used && guard++ < 100000) {
      e.used = true;
      const at = e.to;
      if (at === start) break;
      loop.push(at);
      const back = Math.atan2(pts.get(cur)[1] - pts.get(at)[1], pts.get(cur)[0] - pts.get(at)[0]);
      // the first piece clockwise from the way back
      let best = null, bestA = Infinity;
      for (const c of out.get(at) || []) {
        if (c.used) continue;
        let a = back - c.ang; while (a <= 1e-9) a += 2 * Math.PI; while (a > 2 * Math.PI + 1e-9) a -= 2 * Math.PI;
        if (a < bestA) { bestA = a; best = c; }
      }
      cur = at; e = best;
    }
    if (loop.length >= 3 && e && e.to === start) loops.push(clean(loop.map((k) => pts.get(k))));
  }
  const rooms = [], islands = [], outlines = [];
  for (const l of loops) {
    if (l.length < 3) continue;
    const A = area(l);
    if (A > 1) rooms.push({ poly: l, holes: [], area: A, perimeter: perim(l), centroid: centroid(l) });
    else if (A < -1) islands.push(l);
  }
  // a clockwise loop inside a room is an island in it (a hole); otherwise it runs round a building
  for (const l of islands) {
    const host = rooms.filter((r) => inPoly(l[0][0], l[0][1], r.poly)).sort((a, b) => a.area - b.area)[0];
    if (host && Math.abs(area(l)) < host.area) host.holes.push(l.slice().reverse());
    else { const o = l.slice().reverse(); outlines.push({ poly: o, area: area(o), perimeter: perim(o) }); }
  }
  for (const r of rooms) {
    if (!r.holes.length) continue;
    r.area -= r.holes.reduce((s, h) => s + area(h), 0);
    r.perimeter += r.holes.reduce((s, h) => s + perim(h), 0);
  }
  rooms.sort((a, b) => a.centroid[1] - b.centroid[1] || a.centroid[0] - b.centroid[0]);
  return { rooms, outlines };
}

/** The smallest loop containing p (rooms: not inside one of its holes), or null. */
export function loopAt(loops, p) {
  return loops.filter((l) => inPoly(p[0], p[1], l.poly) && !(l.holes || []).some((h) => inPoly(p[0], p[1], h))).sort((a, b) => Math.abs(a.area) - Math.abs(b.area))[0] || null;
}

export function area(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return s / 2; }
export function perim(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += Math.hypot(b[0] - a[0], b[1] - a[1]); } return s; }
export function centroid(p) {
  let A = 0, x = 0, y = 0;
  for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], c = a[0] * b[1] - b[0] * a[1]; A += c; x += (a[0] + b[0]) * c; y += (a[1] + b[1]) * c; }
  return Math.abs(A) < 1e-9 ? p[0] : [x / (3 * A), y / (3 * A)];
}
/** A point well inside a polygon (for a label): the centroid when it is inside, else the middle of the widest span through it. */
export function labelPoint(p) {
  const c = centroid(p);
  if (inPoly(c[0], c[1], p)) return c;
  const xs = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    if ((a[1] > c[1]) !== (b[1] > c[1])) xs.push(a[0] + (c[1] - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
  }
  xs.sort((a, b) => a - b);
  let best = null;
  for (let i = 0; i + 1 < xs.length; i += 2) if (!best || xs[i + 1] - xs[i] > best[1] - best[0]) best = [xs[i], xs[i + 1]];
  return best ? [(best[0] + best[1]) / 2, c[1]] : c;
}
export function inPoly(x, y, p) {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** Drop repeated and collinear points of a loop. */
function clean(p) {
  let q = p.filter((v, i) => i === 0 || Math.hypot(v[0] - p[i - 1][0], v[1] - p[i - 1][1]) > 1e-6);
  if (q.length > 1 && Math.hypot(q[0][0] - q[q.length - 1][0], q[0][1] - q[q.length - 1][1]) <= 1e-6) q.pop();
  let changed = true;
  while (changed && q.length > 3) {
    changed = false;
    for (let i = 0; i < q.length; i++) {
      const a = q[(i + q.length - 1) % q.length], b = q[i], c = q[(i + 1) % q.length];
      const ab = sub(b, a), bc = sub(c, b);
      if (Math.abs(cross(ab, bc)) <= 1e-7 * (Math.hypot(...ab) * Math.hypot(...bc) + 1e-12) && dot(ab, bc) > 0) { q.splice(i, 1); changed = true; break; }
    }
  }
  return q;
}
