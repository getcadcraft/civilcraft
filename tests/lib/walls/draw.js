/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/draw.js — the Draw recipes of the wall tool (0.9 WT.2, wall tool spec page 5; session walls-09). Host-free: plan
 * millimetres in, centre-line paths out, no DOM and no model. Every host (BimCraft's adapter in dev/, CadCraft plan walls through
 * walls-plan-09, SuperCad Studio through its owner) turns a path into walls with its own "draw walls" call and then runs its join
 * solver, so the corners are joins like any others, made in one undo step.
 *
 * A path is { points: [[x, y]...], bulges: [b0, b1...] (one per segment; tan(theta / 4), + anticlockwise, 0 straight), closed }.
 * segsOf(path) → [{ a, b, bulge }] in drawing order (a closed path ends at its first point).
 *
 *   rectangle(p, q)                       four walls, axis-aligned, corners p and q (any two opposite corners)
 *   rotatedRectangle(p, q, r)             p → q is the first side (its direction and length), r sets the other side (its distance
 *                                         square to p → q, on r's side)
 *   polygon(c, p, n, { fit })             a regular polygon of n sides about c; p sets the size and turn: fit 'inscribed' (corners on
 *                                         the circle through p) or 'circumscribed' (the middle of each side on it, p at a side's middle)
 *   arcByCentre(c, s, e, { ccw })         centre c, start s (the radius), end e (only its direction counts); ccw: which way round
 *                                         (default the shorter way); split in pieces when it turns more than MAX_TURN
 *   tangentArc(p, dir, e)                 an arc leaving p along dir (the last wall's direction there) and ending at e
 *   endTangent(seg)                       the direction a wall { a, b, bulge } leaves its end b (for the next tangent arc)
 *   chainFrom(lines, i, { tol })          pick lines: the line i and, with Tab, every line joined end to end with it, in order →
 *                                         a path (closed when the chain closes); lines [{ a, b, bulge? }]
 *   lineAt(lines, p, tol)                 the index of the line nearest p within tol (null)
 *   outlineAround(lines, p, { tol })      trace outline: the smallest closed area the lines make around p → a closed path (null)
 *   offsetPath(path, d)                   placement offset: the path moved d to its left (+) or right (−), corners mitred
 *
 * Errors thrown: { key: 'walls.err.small' } (a side under MIN mm), 'walls.err.sides' (n not 3..64), 'walls.err.open' (no closed
 * area around the point), 'walls.err.tangent' (the end lies on the tangent line: a straight wall, not an arc).
 */
export const MIN = 10;
/** The most one curved wall may turn (BimCraft's BULGE_MAX is 270°); a longer sweep is cut in equal pieces. */
export const MAX_TURN = 270 * Math.PI / 180;
const TAU = 2 * Math.PI;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (v) => { const L = Math.hypot(v[0], v[1]); return L > 0 ? [v[0] / L, v[1] / L] : [1, 0]; };
const left = (u) => [-u[1], u[0]];
const fail = (key) => { throw Object.assign(new Error(key), { key }); };
const closedPath = (points, bulges = null) => ({ points, bulges: bulges || points.map(() => 0), closed: true });

export function segsOf(path) {
  const P = path.points, n = P.length, out = [];
  const m = path.closed ? n : n - 1;
  for (let i = 0; i < m; i++) out.push({ a: P[i], b: P[(i + 1) % n], bulge: (path.bulges && path.bulges[i]) || 0 });
  return out;
}
/** A path's signed area (anticlockwise > 0), straight sides only (for which side is outside). */
export function pathArea(path) {
  let s = 0; const P = path.points;
  for (let i = 0; i < P.length; i++) s += cross(P[i], P[(i + 1) % P.length]);
  return s / 2;
}

export function rectangle(p, q) {
  if (Math.abs(q[0] - p[0]) < MIN || Math.abs(q[1] - p[1]) < MIN) fail('walls.err.small');
  const x0 = Math.min(p[0], q[0]), x1 = Math.max(p[0], q[0]), y0 = Math.min(p[1], q[1]), y1 = Math.max(p[1], q[1]);
  return closedPath([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
}

export function rotatedRectangle(p, q, r) {
  const L = dist(p, q);
  if (L < MIN) fail('walls.err.small');
  const u = unit(sub(q, p)), n = left(u), w = dot(sub(r, p), n);
  if (Math.abs(w) < MIN) fail('walls.err.small');
  const off = mul(n, w), pts = [p, q, add(q, off), add(p, off)];
  return closedPath(w > 0 ? pts : pts.reverse());   // anticlockwise either way
}

export function polygon(c, p, n, { fit = 'inscribed' } = {}) {
  if (!(Number.isInteger(n) && n >= 3 && n <= 64)) fail('walls.err.sides');
  const r = dist(c, p);
  if (r < MIN) fail('walls.err.small');
  const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]), R = fit === 'circumscribed' ? r / Math.cos(Math.PI / n) : r;
  const start = fit === 'circumscribed' ? a0 - Math.PI / n : a0;   // circumscribed: p is the middle of the first side
  const pts = [];
  for (let i = 0; i < n; i++) { const f = start + i * TAU / n; pts.push([c[0] + R * Math.cos(f), c[1] + R * Math.sin(f)]); }
  return closedPath(pts);
}

/** Cut a sweep in equal pieces of at most MAX_TURN: [{ a, b, bulge }]. */
function arcPieces(c, R, f0, sweep) {
  const k = Math.max(1, Math.ceil(Math.abs(sweep) / MAX_TURN - 1e-9)), step = sweep / k, out = [];
  const at = (f) => [c[0] + R * Math.cos(f), c[1] + R * Math.sin(f)];
  for (let i = 0; i < k; i++) out.push({ a: at(f0 + step * i), b: at(f0 + step * (i + 1)), bulge: Math.tan(step / 4) });
  return out;
}
export function arcByCentre(c, s, e, { ccw = null } = {}) {
  const R = dist(c, s);
  if (R < MIN || dist(c, e) < 1e-9) fail('walls.err.small');
  const f0 = Math.atan2(s[1] - c[1], s[0] - c[0]), f1 = Math.atan2(e[1] - c[1], e[0] - c[0]);
  let sweep = ((f1 - f0) % TAU + TAU) % TAU;   // anticlockwise, 0..2π
  const whole = sweep < 1e-9;
  if (whole) sweep = ccw === false ? -TAU : TAU;   // the end back at the start: the whole circle
  else if (ccw === false || (ccw === null && sweep > Math.PI)) sweep -= TAU;   // the other way round (null: the shorter way)
  if (Math.abs(sweep) * R < MIN) fail('walls.err.small');
  const segs = arcPieces(c, R, f0, sweep);
  const full = Math.abs(Math.abs(sweep) - TAU) < 1e-9;
  return { points: segs.map((x) => x.a).concat(full ? [] : [segs[segs.length - 1].b]), bulges: segs.map((x) => x.bulge), closed: full };
}

export function tangentArc(p, dir, e) {
  const d = unit(dir), ch = sub(e, p), L = Math.hypot(ch[0], ch[1]);
  if (L < MIN) fail('walls.err.small');
  const phi = Math.atan2(cross(d, ch), dot(d, ch));   // from the tangent to the chord, + anticlockwise
  if (Math.abs(phi) < 1e-6 || Math.abs(Math.abs(phi) - Math.PI) < 1e-6) fail('walls.err.tangent');
  const theta = 2 * phi;   // the arc's included angle
  if (Math.abs(theta) <= MAX_TURN + 1e-9) return { points: [p, e], bulges: [Math.tan(theta / 4)], closed: false };
  // over 270°: two pieces about the same centre
  const R = L / (2 * Math.abs(Math.sin(phi))), c = add(p, mul(left(d), Math.sign(phi) * R));
  const segs = arcPieces(c, R, Math.atan2(p[1] - c[1], p[0] - c[0]), theta);
  return { points: segs.map((x) => x.a).concat([segs[segs.length - 1].b]), bulges: segs.map((x) => x.bulge), closed: false };
}
export function endTangent(seg) {
  const u = unit(sub(seg.b, seg.a)), th = 4 * Math.atan(Number(seg.bulge) || 0);
  if (Math.abs(th) < 1e-12) return u;
  const r = th / 2, c = Math.cos(r), s = Math.sin(r);   // the tangent at the end is the chord turned on by half the included angle
  return [u[0] * c - u[1] * s, u[0] * s + u[1] * c];
}

// ------------------------------------------------------------------------------------------------------------ pick lines
function segDist(p, a, b) {
  const ab = sub(b, a), L2 = dot(ab, ab);
  const t = L2 > 0 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / L2)) : 0;
  return dist(p, add(a, mul(ab, t)));
}
export function lineAt(lines, p, tol) {
  let best = null, bd = tol;
  lines.forEach((l, i) => { const d = segDist(p, l.a, l.b); if (d <= bd) { bd = d; best = i; } });
  return best;
}
export function chainFrom(lines, i, { tol = 1 } = {}) {
  const first = lines[i];
  if (!first) return null;
  const used = new Set([i]), pts = [first.a, first.b], bul = [first.bulge || 0];
  const grow = (atEnd) => {
    for (;;) {
      const tip = atEnd ? pts[pts.length - 1] : pts[0];
      let found = -1, rev = false;
      for (let j = 0; j < lines.length && found < 0; j++) {
        if (used.has(j)) continue;
        if (dist(lines[j].a, tip) <= tol) { found = j; rev = false; } else if (dist(lines[j].b, tip) <= tol) { found = j; rev = true; }
      }
      if (found < 0) return;
      used.add(found);
      const l = lines[found], bg = l.bulge || 0;   // rev: the line's b is at the tip
      // at the end: a at the tip → walked a → b (bulge kept); b at the tip → b → a (bulge flips)
      // at the start: b at the tip → a → b ends there (kept); a at the tip → b → a (flips)
      if (atEnd) { pts.push(rev ? l.a : l.b); bul.push(rev ? -bg : bg); }
      else { pts.unshift(rev ? l.a : l.b); bul.unshift(rev ? bg : -bg); }
      if (dist(pts[0], pts[pts.length - 1]) <= tol && pts.length > 2) return;
    }
  };
  grow(true); grow(false);
  const closed = pts.length > 3 && dist(pts[0], pts[pts.length - 1]) <= tol;
  if (closed) pts.pop();
  return { points: pts, bulges: bul, closed, lines: [...used] };
}

// -------------------------------------------------------------------------------------------------------- trace outline
/** Cut every line where it meets another (straight lines; a curved one is taken as its chord). */
function noded(lines, tol) {
  const segs = lines.map((l) => [l.a, l.b]).filter(([a, b]) => dist(a, b) > tol);
  const cuts = segs.map(() => [0, 1]);
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) {
    const [p, p2] = segs[i], [q, q2] = segs[j], r = sub(p2, p), s = sub(q2, q), den = cross(r, s);
    if (Math.abs(den) < 1e-9) continue;
    const t = cross(sub(q, p), s) / den, u = cross(sub(q, p), r) / den;
    const et = tol / Math.hypot(...r), eu = tol / Math.hypot(...s);
    if (t < -et || t > 1 + et || u < -eu || u > 1 + eu) continue;
    cuts[i].push(Math.max(0, Math.min(1, t))); cuts[j].push(Math.max(0, Math.min(1, u)));
  }
  const nodes = [], nodeOf = (p) => { let k = nodes.findIndex((n) => dist(n, p) <= tol); if (k < 0) { nodes.push(p); k = nodes.length - 1; } return k; };
  const edges = new Set();
  segs.forEach(([a, b], i) => {
    const ts = cuts[i].slice().sort((x, y) => x - y).filter((x, k, all) => k === 0 || x - all[k - 1] > 1e-12);
    for (let k = 1; k < ts.length; k++) {
      const u = nodeOf(add(a, mul(sub(b, a), ts[k - 1]))), v = nodeOf(add(a, mul(sub(b, a), ts[k])));
      if (u !== v) edges.add(u < v ? u + ',' + v : v + ',' + u);
    }
  });
  return { nodes, edges: [...edges].map((e) => e.split(',').map(Number)) };
}
const polyArea = (P) => { let s = 0; for (let i = 0; i < P.length; i++) s += cross(P[i], P[(i + 1) % P.length]); return s / 2; };
function inside(P, p) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > p[1]) !== (P[j][1] > p[1]) && p[0] < (P[j][0] - P[i][0]) * (p[1] - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
}
export function outlineAround(lines, p, { tol = 1 } = {}) {
  const { nodes, edges } = noded(lines, tol);
  const out = nodes.map(() => []);
  for (const [u, v] of edges) { out[u].push(v); out[v].push(u); }
  for (let u = 0; u < nodes.length; u++) out[u].sort((x, y) => Math.atan2(nodes[x][1] - nodes[u][1], nodes[x][0] - nodes[u][0]) - Math.atan2(nodes[y][1] - nodes[u][1], nodes[y][0] - nodes[u][0]));
  // walk every half-edge keeping the area on its left: each walk is one face of the drawing
  const seen = new Set();
  let best = null;
  for (const [u0, v0] of edges.flatMap(([u, v]) => [[u, v], [v, u]])) {
    if (seen.has(u0 + '>' + v0)) continue;
    const face = [];
    let u = u0, v = v0, guard = 0;
    while (!seen.has(u + '>' + v) && guard++ < 100000) {
      seen.add(u + '>' + v); face.push(u);
      const list = out[v], k = list.indexOf(u);
      const w = list[(k - 1 + list.length) % list.length];   // the next edge clockwise from the way back: the face on the left
      u = v; v = w;
    }
    if (face.length < 3) continue;
    const P = face.map((i) => nodes[i]), A = polyArea(P);
    if (A <= 1e-6) continue;   // the outside of a group of lines
    if (inside(P, p) && (!best || A < best.A)) best = { A, P };
  }
  if (!best) fail('walls.err.open');
  // straight runs through a node become one side
  const P = best.P.filter((q, i, all) => { const a = all[(i - 1 + all.length) % all.length], b = all[(i + 1) % all.length]; return Math.abs(cross(sub(q, a), sub(b, q))) > 1e-6 * dist(a, q) * dist(q, b); });
  return closedPath(P);
}

// -------------------------------------------------------------------------------------------------------- placement offset
export function offsetPath(path, d) {
  if (!d) return path;
  const segs = segsOf(path).map((s) => { const n = mul(left(unit(sub(s.b, s.a))), d); return { a: add(s.a, n), b: add(s.b, n), u: unit(sub(s.b, s.a)), bulge: s.bulge }; });
  const meet = (s, t) => { const c = cross(s.u, t.u); if (Math.abs(c) < 1e-9) return s.b; const k = cross(sub(t.a, s.a), t.u) / c; return add(s.a, mul(s.u, k)); };
  const pts = [];
  const n = segs.length;
  for (let i = 0; i < n; i++) {
    const prev = i > 0 ? segs[i - 1] : path.closed ? segs[n - 1] : null;
    pts.push(prev ? meet(prev, segs[i]) : segs[i].a);
  }
  if (!path.closed) pts.push(segs[n - 1].b);
  return { ...path, points: pts };
}
