/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build.js — a resolved pool design turned into solid elements (0.11 POOL.1; other shapes, steps and benches on any side and the gate POOL.8).
 * Host-free; millimetres.
 *
 * Axes: x along the length (0 = the shallow end, L = the deep end), y across the width, z up, z = 0 the finished level of the coping and paving.
 * The water line is at z = -freeboard. Depths are water depths at x = 0 and x = L; the floor falls in one straight slope between them, whatever
 * the outline (plan.js). A rectangle keeps the exact construction it always had (end walls, long walls); any other outline is built from bands
 * of one four-sided piece per side between two offsets of the outline.
 *
 * An element = { key, group, ifc (class), predefined, objectType, name, material, color, alpha, pieces, props, qty, ports? }. A piece is either
 *   an extruded prism { profile: [[a, b]…] in the frame's X/Y, origin, x, z (unit vectors; Y = Z × X), depth along the frame's Z }, or
 *   a SLAB { slab: true, poly: [[x, y]…] (plan, counter-clockwise), bot: [a, s], top: [a, s] }: the solid over poly between the planes
 *   z = a + s·x (a floor that falls, a wall on it). The IFC writer and the BimCraft host write a slab as a faceted solid.
 * Every host draws the same list: BimCraft as elements in the model, the IFC writer (ifcout.js) as a file, the drawings (drawings.js) as plan and section.
 */

import { pipeFor } from './hydraulics.js';
import { outlineOf, isRect, offset, bandQuads, edges, area, area2, centroidX, perimeter, along, inside, nearest, sOf, pathAlong, longestAtX, longestAtY, sharpCorners } from './plan.js';

export const COLORS = {
  concrete: '#b8b8b0', room: '#a9a9a2', tile: '#5fb3d9', water: '#3aa0e0', coping: '#d8d2c4', paving: '#c9bfae', grating: '#eeeeee', barrier: '#555555', gate: '#3d3d3d',
  filter: '#3b6ea5', pump: '#44546a', tank: '#607d8b', panel: '#9e9e9e', fitting: '#f5f5f5', rebar: '#8b4513',
  surface: '#2e7d32', drain: '#8d6e63', ret: '#1565c0', overflow: '#00838f', jet: '#6a1b9a', link: '#455a64',
};

// ---------- prisms
export const vz = (pts, z0, z1) => ({ profile: pts, origin: [0, 0, z0], z: [0, 0, 1], x: [1, 0, 0], depth: z1 - z0 });
/** A profile in (x, z) pushed from y1 back to y0. */
export const vy = (ptsXZ, y0, y1) => ({ profile: ptsXZ, origin: [0, y1, 0], z: [0, -1, 0], x: [1, 0, 0], depth: y1 - y0 });
/** A profile in (y, z) pushed from x0 to x1. */
export const vx = (ptsYZ, x0, x1) => ({ profile: ptsYZ, origin: [x0, 0, 0], z: [1, 0, 0], x: [0, 1, 0], depth: x1 - x0 });
export const box = (x0, y0, z0, x1, y1, z1) => vz([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1);
/** The solid over a plan polygon between two planes z = a + s·x. */
export const slab = (poly, bot, top) => ({ slab: true, poly: area2(poly) < 0 ? [...poly].reverse() : poly, bot, top });
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v) => { const n = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
/** A round bar or pipe from one point to another, as a prism of `sides` sides of the same cross-section area. */
export function cyl(from, to, r, sides = 12) {
  const d = [to[0] - from[0], to[1] - from[1], to[2] - from[2]], len = Math.hypot(d[0], d[1], d[2]);
  const z = unit(d), x = Math.abs(z[2]) < 0.9 ? unit(cross(z, [0, 0, 1])) : [1, 0, 0];
  const rr = r * Math.sqrt((2 * Math.PI / sides) / Math.sin(2 * Math.PI / sides));   // same area as the circle
  const profile = Array.from({ length: sides }, (_, i) => [rr * Math.cos((2 * Math.PI * i) / sides), rr * Math.sin((2 * Math.PI * i) / sides)]);
  return { profile, origin: [...from], z, x, depth: len };
}
export const polyArea = (p) => Math.abs(p.reduce((s, q, i) => { const n = p[(i + 1) % p.length]; return s + q[0] * n[1] - n[0] * q[1]; }, 0)) / 2;
/** mm³ of a piece. A slab: ∫(top − bot) dA = A·(Δa + Δs·x̄). */
export const pieceVolume = (pc) => (pc.slab ? area(pc.poly) * ((pc.top[0] - pc.bot[0]) + (pc.top[1] - pc.bot[1]) * centroidX(pc.poly)) : polyArea(pc.profile) * pc.depth);
/** The world point of a piece's profile point (a, b) at distance t along its push. */
export function piecePoint(pc, a, b, t = 0) {
  const y = cross(pc.z, pc.x);
  return [0, 1, 2].map((i) => pc.origin[i] + a * pc.x[i] + b * y[i] + t * pc.z[i]);
}
/** The corners of a piece in the world (a slab's top and bottom). */
export function pieceCorners(pc) {
  if (pc.slab) return pc.poly.flatMap(([x, y]) => [[x, y, pc.bot[0] + pc.bot[1] * x], [x, y, pc.top[0] + pc.top[1] * x]]);
  return pc.profile.flatMap(([a, c]) => [piecePoint(pc, a, c, 0), piecePoint(pc, a, c, pc.depth)]);
}
/** [x0, y0, z0, x1, y1, z1] of an element list. */
export function bounds(elements) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const e of elements) for (const pc of e.pieces) for (const p of pieceCorners(pc)) for (let i = 0; i < 3; i++) { b[i] = Math.min(b[i], p[i]); b[i + 3] = Math.max(b[i + 3], p[i]); }
  return b;
}
/** A band round the rectangle [x0, y0, x1, y1] from offset o0 to o1 outward, between z0 and z1 → { pieces (4 boxes), area mm² }. */
export function ring(x0, y0, x1, y1, o0, o1, z0, z1) {
  if (o1 <= o0) return { pieces: [], area: 0 };
  const pieces = [
    box(x0 - o1, y0 - o1, z0, x1 + o1, y0 - o0, z1), box(x0 - o1, y1 + o0, z0, x1 + o1, y1 + o1, z1),
    box(x0 - o1, y0 - o0, z0, x0 - o0, y1 + o0, z1), box(x1 + o0, y0 - o0, z0, x1 + o1, y1 + o0, z1),
  ];
  return { pieces, area: (x1 - x0 + 2 * o1) * (y1 - y0 + 2 * o1) - (x1 - x0 + 2 * o0) * (y1 - y0 + 2 * o0) };
}
/** The band between two offsets of an outline as one flat-topped prism per side (z0 to z1) → { pieces, area }. */
export function band(poly, o0, o1, z0, z1) {
  if (o1 <= o0) return { pieces: [], area: 0 };
  const a = offset(poly, o0), b = offset(poly, o1);
  if (!a || !b) return { pieces: [], area: 0, bad: true };
  const quads = bandQuads(a, b);
  return { pieces: quads.map((q) => vz(q, z0, z1)), area: area(b) - area(a), quads, inner: a, outer: b };
}

// ---------- the floor line and the steps
/** Finished floor level at x. */
export const floorZ = (d, x) => -(d.freeboard + d.depthShallow + (d.depthDeep - d.depthShallow) * Math.min(1, Math.max(0, x / d.length)));
/** The floor's plane [a, s]: z = a + s·x (the same line as floorZ inside 0 … L, carried on beyond it). */
export const floorPlane = (d) => [-(d.freeboard + d.depthShallow), -(d.depthDeep - d.depthShallow) / d.length];

/** Equal risers down to a floor that may fall: depthAt(u) = water depth at distance u along the flight. → null | { nofit } | the flight. */
function flight(d, depthAt, width, maxRun) {
  const g = d.tread;
  let risers = Math.ceil(depthAt(0) / d.riser - 1e-9);
  for (let i = 0; i < 6; i++) { const n = Math.ceil(depthAt((risers - 1) * g) / d.riser - 1e-9); if (n === risers) break; risers = n; }
  const treads = risers - 1;
  if (treads < 1) return null;
  const run = treads * g, r = depthAt(run) / risers;
  if (run > maxRun) return { nofit: true, risers, treads, run };
  const top = -d.freeboard, fz = (u) => -(d.freeboard + depthAt(u));
  const profile = [[0, fz(0)]];
  for (let k = 1; k <= treads; k++) profile.push([(k - 1) * g, top - k * r], [k * g, top - k * r]);
  profile.push([run, fz(run)]);
  const area2d = polyArea(profile);
  return { risers, treads, riser: r, tread: g, width, run, lastRiser: top - treads * r - fz(run), profile, area: area2d, volume: (area2d * width) / 1e9 };
}

/** The outline a resolved design has (cached on the design object by index.js). */
const shapeOf = (d) => d._shape || outlineOf(d);
const isPlainRect = (sh) => isRect(sh.poly);

/**
 * The entry steps. Without a side named (stepsEdge 0) a rectangle has them at the shallow end from y = 0, as always; any other outline has them
 * in the middle of its shallowest side. With stepsEdge = n they stand on side n (side 1 runs from corner 1 to corner 2, counter-clockwise from
 * the shallow end's corner nearest y = 0), their middle stepsAt mm along it (0 = the middle). → null when the pool has none or the side is
 * unknown, { nofit } when they do not fit, else { risers, treads, riser, tread, width, lastRiser, run, profile [[u, z]…], volume (m³), tile (m²),
 * edge (1-based), at [x, y] (middle of the top), d (along the side), n (outward), plan [[x, y]×4] }.
 */
export function stepsOf(d) {
  if (d.steps === 'none' || d.kind !== 'pool') return null;
  const sh = shapeOf(d), E = edges(sh.poly);
  const plain = isPlainRect(sh) && !(d.stepsEdge > 0);
  if (plain) {
    const slope = (d.depthDeep - d.depthShallow) / d.length;
    const f = flight(d, (u) => d.depthShallow + slope * u, d.stepWidth, d.length * 0.6);
    if (!f || f.nofit) return f;
    return { ...f, tile: (f.risers * f.riser * f.width + (f.width < d.width ? f.area : 0)) / 1e6, edge: 4, at: [0, f.width / 2], d: [0, 1], n: [-1, 0], plain: true,
      plan: [[0, 0], [f.run, 0], [f.run, f.width], [0, f.width]] };
  }
  let e;
  if (d.stepsEdge > 0) { e = E[d.stepsEdge - 1]; if (!e) return null; }
  else e = E.reduce((b, x) => ((x.a[0] + x.b[0]) / 2 < (b.a[0] + b.b[0]) / 2 - 1e-6 || (Math.abs((x.a[0] + x.b[0]) / 2 - (b.a[0] + b.b[0]) / 2) < 1e-6 && x.len > b.len) ? x : b));
  const w = Math.min(d.steps === 'full' ? e.len : d.stepWidth, e.len);
  const mid = d.stepsAt > 0 ? Math.min(Math.max(d.stepsAt, w / 2), e.len - w / 2) : e.len / 2;
  const c = [e.a[0] + e.d[0] * mid, e.a[1] + e.d[1] * mid], inward = [-e.n[0], -e.n[1]];
  const [fa, fs] = floorPlane(d);
  const depthAt = (u) => -(fa + fs * Math.min(sh.L, Math.max(0, c[0] + inward[0] * u))) - d.freeboard;
  const room = longestAtLine(sh.poly, c, inward);
  const f = flight(d, depthAt, w, Math.max(0, room * 0.6));
  if (!f || f.nofit) return f ? { ...f, edge: e.i + 1 } : null;
  const s = [c[0] - e.d[0] * w / 2, c[1] - e.d[1] * w / 2], t = [c[0] + e.d[0] * w / 2, c[1] + e.d[1] * w / 2];
  const plan = [s, t, [t[0] + inward[0] * f.run, t[1] + inward[1] * f.run], [s[0] + inward[0] * f.run, s[1] + inward[1] * f.run]];
  return { ...f, tile: (f.risers * f.riser * w + (w < e.len ? 2 * f.area : 0)) / 1e6, edge: e.i + 1, at: c, d: e.d, n: e.n, plan,
    fits: plan.every((q) => inside(sh.poly, q) || nearest(sh.poly, q).dist < 1) };
}
/** How far the water reaches from a point on the edge along a direction (the free run for a flight). */
function longestAtLine(poly, c, dir) {
  let best = Infinity;
  const E = edges(poly);
  for (const e of E) {
    const den = dir[0] * (e.b[1] - e.a[1]) - dir[1] * (e.b[0] - e.a[0]);
    if (Math.abs(den) < 1e-9) continue;
    const t = ((e.a[0] - c[0]) * (e.b[1] - e.a[1]) - (e.a[1] - c[1]) * (e.b[0] - e.a[0])) / den;
    const u = ((e.a[0] - c[0]) * dir[1] - (e.a[1] - c[1]) * dir[0]) / den;
    if (t > 1 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, t);
  }
  return Number.isFinite(best) ? best : 0;
}

/**
 * Benches: "side, from, length" per line (millimetres; side as for the steps, from = mm along the side from its first corner). A bench is a
 * ledge benchDepth deep whose seat is benchSeat under the water line. → [{ side, from, length, plan [[x, y]×4], seatZ, volume m³, tile m², fits }] + problems.
 */
export function benchesOf(d) {
  const out = [], problems = [];
  if (d.kind !== 'pool' || !String(d.benches || '').trim()) return { list: out, problems };
  const sh = shapeOf(d), E = edges(sh.poly), [fa, fs] = floorPlane(d);
  for (const line of String(d.benches).split(/[;\n]+/)) {
    const s = line.trim(); if (!s) continue;
    const n = s.split(/\s*,\s*/).map(Number);
    const e = E[Math.round(n[0]) - 1];
    if (n.length !== 3 || !n.every(Number.isFinite) || !e || n[2] <= 0) { problems.push({ code: 'bench.bad', vars: { text: s.slice(0, 60) } }); continue; }
    const t0 = Math.max(0, Math.min(n[1], e.len)), t1 = Math.max(t0, Math.min(n[1] + n[2], e.len));
    if (t1 - t0 < 300) { problems.push({ code: 'bench.bad', vars: { text: s.slice(0, 60) } }); continue; }
    const a = [e.a[0] + e.d[0] * t0, e.a[1] + e.d[1] * t0], b = [e.a[0] + e.d[0] * t1, e.a[1] + e.d[1] * t1], k = d.benchDepth;
    const plan = [a, b, [b[0] - e.n[0] * k, b[1] - e.n[1] * k], [a[0] - e.n[0] * k, a[1] - e.n[1] * k]];
    const seatZ = -d.freeboard - d.benchSeat;
    const floorAt = (x) => fa + fs * Math.min(sh.L, Math.max(0, x));
    const lowFloor = Math.min(...plan.map((q) => floorAt(q[0])));
    const fits = plan.every((q) => inside(sh.poly, q) || nearest(sh.poly, q).dist < 1) && seatZ > Math.max(...plan.map((q) => floorAt(q[0]))) + 50;
    if (!fits) problems.push({ code: 'bench.fit', vars: { side: e.i + 1 } });
    const vol = area(plan) * (seatZ - fa - fs * centroidX(plan));
    out.push({ side: e.i + 1, from: t0, length: t1 - t0, plan, seatZ, low: lowFloor, fits, volume: fits ? vol / 1e9 : 0,
      tile: fits ? ((t1 - t0) * k + (t1 - t0) * (seatZ - floorAt((a[0] + b[0]) / 2 - e.n[0] * k))) / 1e6 : 0 });
  }
  return { list: out, problems };
}

// ---------- routing round the pool (plan)
function crosses(p, q, R) {
  if (Math.abs(p[1] - q[1]) < 1e-6) return p[1] > R[1] + 1e-6 && p[1] < R[3] - 1e-6 && Math.max(Math.min(p[0], q[0]), R[0]) < Math.min(Math.max(p[0], q[0]), R[2]) - 1e-6;
  return p[0] > R[0] + 1e-6 && p[0] < R[2] - 1e-6 && Math.max(Math.min(p[1], q[1]), R[1]) < Math.min(Math.max(p[1], q[1]), R[3]) - 1e-6;
}
export const tidy = (pts) => {
  const out = [];
  for (const p of pts) {
    if (out.length && Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1], (p[2] ?? 0) - (out[out.length - 1][2] ?? 0)) < 1e-6) continue;
    if (out.length >= 2) {
      const a = out[out.length - 2], b = out[out.length - 1];
      const u = [b[0] - a[0], b[1] - a[1], (b[2] ?? 0) - (a[2] ?? 0)], v = [p[0] - b[0], p[1] - b[1], (p[2] ?? 0) - (b[2] ?? 0)];
      const c = cross(u, v);
      if (Math.hypot(...c) < 1e-6 * (Math.hypot(...u) + 1) * (Math.hypot(...v) + 1) && u[0] * v[0] + u[1] * v[1] + u[2] * v[2] >= 0) { out[out.length - 1] = p; continue; }
    }
    out.push(p);
  }
  return out;
};
export const pathLen = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], (p[2] ?? 0) - (pts[i - 1][2] ?? 0)) : 0), 0);
/** The shortest square-cornered way from a to b that does not pass through the rectangle R = [x0, y0, x1, y1] (a and b are outside it). */
export function routeRound(a, b, R, lane = 300) {
  const c = [[a, [a[0], b[1]], b], [a, [b[0], a[1]], b]];
  for (const X of [R[0] - lane, R[2] + lane]) c.push([a, [X, a[1]], [X, b[1]], b]);
  for (const Y of [R[1] - lane, R[3] + lane]) c.push([a, [a[0], Y], [b[0], Y], b]);
  for (const X of [R[0] - lane, R[2] + lane]) for (const Y of [R[1] - lane, R[3] + lane]) { c.push([a, [a[0], Y], [X, Y], [X, b[1]], b]); c.push([a, [X, a[1]], [X, Y], [b[0], Y], b]); }
  let best = null;
  for (const raw of c) {
    const p = tidy(raw);
    if (p.some((q, i) => i && crosses(p[i - 1], q, R))) continue;
    if (!best || pathLen(p) < pathLen(best) - 1e-6) best = p;
  }
  return best || tidy(c[0]);
}

const el = (key, group, ifc, name, material, color, pieces, extra = {}) => ({ key, group, ifc, predefined: null, objectType: null, name, material, color, alpha: 1, pieces, props: {}, qty: {}, ...extra });

/** The barrier: the band from pav1 − 50 to pav1 round the outline, open for the gate on the side nearest gateSide. */
function barrier(d, poly, pav1, add, M, rect) {
  if (!(d.barrierHeight > 0)) return null;
  const inner = offset(poly, pav1 - 50), outer = offset(poly, pav1);
  if (!inner || !outer) return null;
  const quads = bandQuads(inner, outer), mid = offset(poly, pav1 - 25);
  const want = { 'x+': [1, 0], 'x-': [-1, 0], 'y+': [0, 1], 'y-': [0, -1] }[d.gateSide] || [-1, 0];
  const E = edges(outer);
  const gw = d.gateWidth > 0 ? d.gateWidth : 0;
  let gi = -1;
  if (gw > 0) { let best = -Infinity; for (const e of E) { if (e.len < gw + 300) continue; const sc = e.n[0] * want[0] + e.n[1] * want[1] + e.len * 1e-9; if (sc > best + 1e-9) { best = sc; gi = e.i; } } }
  const pieces = [];
  let gate = null;
  if (gw > 0 && gi < 0) {
    // no side is long enough (a round pool): leave out the sides round the best-facing one until the gap is as wide as the gate
    let bi = 0, best = -Infinity;
    for (const e of E) { const sc = e.n[0] * want[0] + e.n[1] * want[1]; if (sc > best + 1e-9) { best = sc; bi = e.i; } }
    const n = E.length, gone = new Set([bi]);
    let lo = bi, hi = bi, run = E[bi].len;
    while (run < gw + 40 && gone.size < n - 2) { if (E[(lo - 1 + n) % n].len <= E[(hi + 1) % n].len) { lo = (lo - 1 + n) % n; gone.add(lo); run += E[lo].len; } else { hi = (hi + 1) % n; gone.add(hi); run += E[hi].len; } }
    const midOf = (k) => [(inner[k][0] + outer[k][0]) / 2, (inner[k][1] + outer[k][1]) / 2];
    const a = midOf(lo), b = midOf((hi + 1) % n), cl = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (cl >= gw * 0.8) {
      quads.forEach((q, i) => { if (!gone.has(i)) pieces.push(vz(q, 0, d.barrierHeight)); });
      const u = [(b[0] - a[0]) / cl, (b[1] - a[1]) / cl], nn = [u[1], -u[0]], g0 = [a[0] + u[0] * 20, a[1] + u[1] * 20], g1 = [b[0] - u[0] * 20, b[1] - u[1] * 20];
      gate = { side: bi + 1, width: cl, at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], plan: [g0, g1, [g1[0] + nn[0] * 40, g1[1] + nn[1] * 40], [g0[0] + nn[0] * 40, g0[1] + nn[1] * 40]], gone: run };
    }
  }
  quads.forEach((q, i) => {
    if (gate && gate.gone) return;
    if (i !== gi) { pieces.push(vz(q, 0, d.barrierHeight)); return; }
    // split side i: [a, b] inner, [B, A] outer; leave the middle gw open
    const [a, b, B, A] = q, len = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    const lenO = Math.hypot(B[0] - A[0], B[1] - A[1]), uo = [(B[0] - A[0]) / lenO, (B[1] - A[1]) / lenO];
    const m = len / 2, mo = lenO / 2, h = gw / 2;
    const P = (s, t, k) => [s[0] + t[0] * k, s[1] + t[1] * k];
    pieces.push(vz([a, P(a, u, m - h), P(A, uo, mo - h), A], 0, d.barrierHeight), vz([P(a, u, m + h), b, B, P(A, uo, mo + h)], 0, d.barrierHeight));
    const g0 = P(a, u, m - h + 20), g1 = P(a, u, m + h - 20), n = E[i].n;
    gate = { side: i + 1, width: gw, at: P(a, u, m), plan: [g0, g1, [g1[0] + n[0] * 40, g1[1] + n[1] * 40], [g0[0] + n[0] * 40, g0[1] + n[1] * 40]] };
  });
  add('barrier', 'surround', 'IFCRAILING', 'Barrier', 'steel', COLORS.barrier, pieces, { predefined: 'GUARDRAIL', props: { HeightMm: d.barrierHeight, GateWidthMm: gate ? gate.width : 0 } });
  M.barrierLength = (rect ? 2 * (d.length + d.width) + 8 * (pav1 - 25) : perimeter(mid)) - (gate ? gate.gone || gate.width : 0);
  if (gate) {
    add('gate', 'surround', 'IFCDOOR', 'Barrier gate', 'steel', COLORS.gate, [vz(gate.plan, 50, Math.max(100, d.barrierHeight - 25))],
      { predefined: 'GATE', params: { width: gate.width, height: d.barrierHeight }, props: { WidthMm: gate.width, HeightMm: d.barrierHeight, Side: gate.side } });
  } else if (gw > 0) M.gateNoFit = true;
  return gate;
}

/** The machine room and what stands in it, on the room side of the bounding box. → { room, T, entry, entryR } */
function machineRoom(d, circ, L, B, edge, add, M, gutter) {
  const eR = edge + d.roomGap, side = d.roomSide;
  const T = (u, v) => (side === 'x+' ? [L + eR + u, B / 2 + v] : side === 'x-' ? [-eR - u, B / 2 - v] : side === 'y+' ? [L / 2 - v, B + eR + u] : [L / 2 + v, -eR - u]);
  const rect = (u0, v0, u1, v1) => { const a = T(u0, v0), b = T(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const c = 500, trw = d.roomWall, items = [];
  const fD = circ.filter.diameter;
  for (let i = 0; i < circ.filter.count; i++) {
    items.push({ kind: 'filter', n: i + 1, wv: fD, wu: fD, h: fD + 600 });
    items.push({ kind: 'pump', n: i + 1, wv: 600, wu: 350, h: 400 });
  }
  const tankM3 = gutter ? (d.balancePct / 100) * circ.volume : 0;
  if (tankM3 > 0) { const s = Math.sqrt(tankM3 / 1.5) * 1000; items.push({ kind: 'tank', n: 1, wv: s, wu: s, h: 1500 }); }
  items.push({ kind: 'panel', n: 1, wv: 600, wu: 200, h: 800, lift: 1000 });
  const rl = Math.max(2500, items.reduce((s, i) => s + i.wv + c, c)), rw = Math.max(2000, Math.max(...items.map((i) => i.wu)) + c + 900);
  const pt = d.pavingThickness, roofT = 200, floorT = 200, ceil = -pt - roofT, zr = ceil - d.roomHeight;
  const inner = rect(trw, -rl / 2, trw + rw, rl / 2), outerR = rect(0, -rl / 2 - trw, rw + 2 * trw, rl / 2 + trw);
  add('room-floor', 'room', 'IFCSLAB', 'Machine room floor', 'concrete', COLORS.room, [box(outerR[0], outerR[1], zr - floorT, outerR[2], outerR[3], zr)], { predefined: 'BASESLAB', props: { ThicknessMm: floorT } });
  add('room-walls', 'room', 'IFCWALL', 'Machine room walls', 'concrete', COLORS.room, ring(inner[0], inner[1], inner[2], inner[3], 0, trw, zr, ceil).pieces, { predefined: 'SOLIDWALL', props: { ThicknessMm: trw } });
  add('room-roof', 'room', 'IFCSLAB', 'Machine room roof', 'concrete', COLORS.room, [box(outerR[0], outerR[1], ceil, outerR[2], outerR[3], ceil + roofT)], { predefined: 'ROOF', alpha: 0.35, props: { ThicknessMm: roofT } });
  add('room-space', 'room', 'IFCSPACE', 'Machine room', 'air', '#ffffff', [box(inner[0], inner[1], zr, inner[2], inner[3], ceil)], { predefined: 'INTERNAL', alpha: 0.05, props: { ClearHeightMm: d.roomHeight, LengthMm: rl, WidthMm: rw } });
  M.formwork += 2 * (2 * (rl + rw) + 4 * trw) * d.roomHeight + (rl + 2 * trw) * (rw + 2 * trw);
  let v = -rl / 2 + c;
  const placed = [];
  for (const it of items) {
    const u0 = trw + (it.kind === 'panel' ? 0 : c);
    const r = rect(u0, v, u0 + it.wu, v + it.wv), zb = zr + (it.lift || 0);
    const cx = (r[0] + r[2]) / 2, cy = (r[1] + r[3]) / 2;
    placed.push({ ...it, rect: r, at: [cx, cy, zb], u0, v0: v, vc: v + it.wv / 2 });
    if (it.kind === 'filter') add('filter-' + it.n, 'equipment', 'IFCFILTER', 'Filter ' + it.n, 'equipment', COLORS.filter, [cyl([cx, cy, zb], [cx, cy, zb + it.h], fD / 2, 16)],
      { predefined: 'WATERFILTER', props: { DiameterMm: fD, FilterAreaM2: circ.filter.area / circ.filter.count, FlowM3h: circ.pump.flowEach, RateMh: circ.filter.rate } });
    else if (it.kind === 'pump') add('pump-' + it.n, 'equipment', 'IFCPUMP', 'Pump ' + it.n, 'equipment', COLORS.pump, [box(r[0], r[1], zb, r[2], r[3], zb + it.h)],
      { predefined: 'ENDSUCTION', props: { FlowM3h: circ.pump.flowEach, HeadM: circ.pump.head, ShaftKw: circ.pump.shaftKw, MotorKw: circ.pump.motorKw } });
    else if (it.kind === 'tank') add('balance-tank', 'equipment', 'IFCTANK', 'Balance tank', 'equipment', COLORS.tank, [box(r[0], r[1], zb, r[2], r[3], zb + it.h)], { predefined: 'STORAGE', props: { VolumeM3: tankM3 } });
    else add('panel', 'equipment', 'IFCELECTRICDISTRIBUTIONBOARD', 'Control panel', 'equipment', COLORS.panel, [box(r[0], r[1], zb, r[2], r[3], zb + it.h)], { predefined: 'DISTRIBUTIONBOARD' });
    v += it.wv + c;
  }
  const room = { side, inner, outer: outerR, floorZ: zr, ceilZ: ceil, length: rl, width: rw, items: placed, wall: trw, clear: c, T };
  return { room, T, entry: T(0, 0), entryR: T(0, 400) };
}

/** Pipe names by system. */
const NAMES = { surface: 'Skimmer suction pipe', overflow: 'Overflow pipe', drain: 'Drain suction pipe', ret: 'Return pipe', jet: 'Jet supply pipe' };

/**
 * Build everything. d = a resolved design (model.js resolve), circ = hydraulics.js circulation(d), steps = stepsOf(d), benches = benchesOf(d).list.
 * → { elements, layout: { poly (the water outline), rect (its bounding box), outer (the structure's outside, bounding box), rings { shell, coping,
 *     paving, barrier }, room, entry, entryR, skimmers, inlets, drains, jets, terms (each terminal's port and where its pipe starts), pipes: [{ system,
 *     dn, pts, flow, role }] }, metrics (areas and lengths the quantities need, mm / mm²) }.
 */
export function build(d, circ, steps = stepsOf(d), benches = benchesOf(d).list) {
  const sh = shapeOf(d), poly = sh.poly, rectShape = isPlainRect(sh);
  const L = d.length, B = d.width, tf = d.finish, tw = d.wall, tfl = d.floor, ct = d.copingThickness, pt = d.pavingThickness;
  const zf = (x) => floorZ(d, x), zs = (x) => zf(x) - tf, zt = -ct;
  const [fa, fs] = floorPlane(d);
  const e0 = tf + tw, x0 = -e0, x1 = L + e0, y0 = -e0, y1 = B + e0;
  const gutter = d.overflow === 'gutter' && d.kind === 'pool';
  const fountain = d.kind === 'fountain';
  const E = [], M = { formwork: 0 };
  const add = (...a) => { const e = el(...a); E.push(e); return e; };
  const terms = [];
  let edge = e0;   // how far the structure reaches outside the finished water edge
  const cw = gutter ? e0 : Math.max(d.copingWidth, 0);

  if (rectShape) {
    // ---- concrete shell (the exact rectangle of POOL.1)
    const slabTop = [[x0, zs(0)], [0, zs(0)], [L, zs(L)], [x1, zs(L)]];
    add('shell-floor', 'shell', 'IFCSLAB', 'Pool floor slab', 'concrete', COLORS.concrete,
      [vy([...slabTop, ...slabTop.map(([x, z]) => [x, z - tfl]).reverse()], y0, y1)], { predefined: 'BASESLAB', props: { ThicknessMm: tfl } });
    const wallLong = [...slabTop, [x1, zt], [x0, zt]];
    add('shell-wall-y0', 'shell', 'IFCWALL', 'Pool wall, side 1', 'concrete', COLORS.concrete, [vy(wallLong, y0, -tf)], { predefined: 'SOLIDWALL', props: { ThicknessMm: tw } });
    add('shell-wall-y1', 'shell', 'IFCWALL', 'Pool wall, side 2', 'concrete', COLORS.concrete, [vy(wallLong, B + tf, y1)], { predefined: 'SOLIDWALL', props: { ThicknessMm: tw } });
    const endRect = (zb) => [[-tf, zb], [B + tf, zb], [B + tf, zt], [-tf, zt]];
    add('shell-wall-x0', 'shell', 'IFCWALL', 'Pool wall, shallow end', 'concrete', COLORS.concrete, [vx(endRect(zs(0)), x0, -tf)], { predefined: 'SOLIDWALL', props: { ThicknessMm: tw } });
    add('shell-wall-x1', 'shell', 'IFCWALL', 'Pool wall, deep end', 'concrete', COLORS.concrete, [vx(endRect(zs(L)), L + tf, x1)], { predefined: 'SOLIDWALL', props: { ThicknessMm: tw } });
    const hAvg = (zt - zs(0) + zt - zs(L)) / 2;
    M.formwork = 2 * 2 * (L + 2 * e0) * hAvg + 2 * (B + 2 * tf) * ((zt - zs(0)) + (zt - zs(L)));
    M.tileFloor = B * Math.hypot(L, d.depthDeep - d.depthShallow);
    M.tileWalls = 2 * L * ((zt - zf(0) + zt - zf(L)) / 2) + B * (zt - zf(0)) + B * (zt - zf(L));
    if (tf > 0) {
      add('finish-floor', 'finish', 'IFCCOVERING', 'Floor tiles', 'tile', COLORS.tile, [vy([[0, zs(0)], [L, zs(L)], [L, zf(L)], [0, zf(0)]], 0, B)], { predefined: 'FLOORING', qty: { area: M.tileFloor } });
      const wl = [[0, zf(0)], [L, zf(L)], [L, zt], [0, zt]];
      add('finish-walls', 'finish', 'IFCCOVERING', 'Wall tiles', 'tile', COLORS.tile,
        [vy(wl, -tf, 0), vy(wl, B, B + tf), vx([[0, zf(0)], [B, zf(0)], [B, zt], [0, zt]], -tf, 0), vx([[0, zf(L)], [B, zf(L)], [B, zt], [0, zt]], L, L + tf)],
        { predefined: 'CLADDING', qty: { area: M.tileWalls } });
    }
    add('water', 'water', 'IFCBUILDINGELEMENTPROXY', 'Water', 'water', COLORS.water, [vy([[0, zf(0)], [L, zf(L)], [L, -d.freeboard], [0, -d.freeboard]], 0, B)],
      { objectType: 'WATER', alpha: 0.5, props: { VolumeM3: circ.volume, SurfaceM2: circ.surface } });
    if (gutter) {
      const gw = d.gutterWidth, gd = d.gutterDepth, tg = d.gutterWall;
      const base = ring(0, 0, L, B, e0, e0 + gw + tg, zt - gd - tg, zt - gd), side = ring(0, 0, L, B, e0 + gw, e0 + gw + tg, zt - gd, zt);
      add('gutter', 'shell', 'IFCWALL', 'Overflow channel', 'concrete', COLORS.concrete, [...base.pieces, ...side.pieces], { predefined: 'SOLIDWALL', objectType: 'OVERFLOWCHANNEL', props: { WidthMm: gw, DepthMm: gd } });
      M.formwork += 2 * (2 * (L + B) + 8 * (e0 + gw)) * (gd + tg);
      add('grating', 'surround', 'IFCCOVERING', 'Overflow grating', 'plastic', COLORS.grating, ring(0, 0, L, B, e0, e0 + gw, zt, 0).pieces, { predefined: 'FLOORING', objectType: 'GRATING' });
      M.gratingLength = 2 * (L + B) + 8 * (e0 + gw / 2);
      edge = e0 + gw + tg;
    }
    const coping = ring(0, 0, L, B, 0, cw, zt, 0);
    add('coping', 'surround', 'IFCCOVERING', gutter ? 'Overflow edge' : 'Coping', 'stone', COLORS.coping, coping.pieces, { predefined: 'FLOORING', objectType: 'COPING', qty: { area: coping.area } });
    M.copingLength = 2 * (L + B); M.copingArea = coping.area;
    const pav0 = gutter ? edge : cw;
    const paving = ring(0, 0, L, B, pav0, pav0 + d.pavingWidth, -pt, 0);
    if (paving.pieces.length) add('paving', 'surround', 'IFCCOVERING', 'Paving', 'stone', COLORS.paving, paving.pieces, { predefined: 'FLOORING', objectType: 'PAVING', qty: { area: paving.area } });
    M.pavingArea = paving.area; M.pav1 = pav0 + d.pavingWidth;
  } else {
    // ---- any other outline: bands of one piece per side between offsets, the floor as one sloping slab
    const Pt = offset(poly, tf), Pe = offset(poly, e0);
    if (!Pt || !Pe) throw Object.assign(new Error('shape.offset'), { code: 'shape.offset' });
    const zsP = [fa - tf, fs];
    add('shell-floor', 'shell', 'IFCSLAB', 'Pool floor slab', 'concrete', COLORS.concrete, [slab(Pe, [zsP[0] - tfl, fs], zsP)], { predefined: 'BASESLAB', props: { ThicknessMm: tfl } });
    add('shell-walls', 'shell', 'IFCWALL', 'Pool walls', 'concrete', COLORS.concrete, bandQuads(Pt, Pe).map((q) => slab(q, zsP, [zt, 0])), { predefined: 'SOLIDWALL', props: { ThicknessMm: tw, Sides: poly.length } });
    const hAt = (x) => zt - (zsP[0] + fs * x);
    const faceSum = (p) => edges(p).reduce((s, e) => s + e.len * hAt((e.a[0] + e.b[0]) / 2), 0);
    M.formwork = faceSum(Pt) + faceSum(Pe);
    const A = area(poly);
    M.tileFloor = A * Math.hypot(1, fs);
    M.tileWalls = edges(poly).reduce((s, e) => s + e.len * (zt - (fa + fs * (e.a[0] + e.b[0]) / 2)), 0);
    if (tf > 0) {
      add('finish-floor', 'finish', 'IFCCOVERING', 'Floor tiles', 'tile', COLORS.tile, [slab(poly, zsP, [fa, fs])], { predefined: 'FLOORING', qty: { area: M.tileFloor } });
      add('finish-walls', 'finish', 'IFCCOVERING', 'Wall tiles', 'tile', COLORS.tile, bandQuads(poly, Pt).map((q) => slab(q, [fa, fs], [zt, 0])), { predefined: 'CLADDING', qty: { area: M.tileWalls } });
    }
    add('water', 'water', 'IFCBUILDINGELEMENTPROXY', 'Water', 'water', COLORS.water, [slab(poly, [fa, fs], [-d.freeboard, 0])], { objectType: 'WATER', alpha: 0.5, props: { VolumeM3: circ.volume, SurfaceM2: circ.surface } });
    if (gutter) {
      const gw = d.gutterWidth, gd = d.gutterDepth, tg = d.gutterWall;
      const base = band(poly, e0, e0 + gw + tg, zt - gd - tg, zt - gd), side = band(poly, e0 + gw, e0 + gw + tg, zt - gd, zt), grate = band(poly, e0, e0 + gw, zt, 0);
      add('gutter', 'shell', 'IFCWALL', 'Overflow channel', 'concrete', COLORS.concrete, [...base.pieces, ...side.pieces], { predefined: 'SOLIDWALL', objectType: 'OVERFLOWCHANNEL', props: { WidthMm: gw, DepthMm: gd } });
      M.formwork += (perimeter(offset(poly, e0 + gw) || poly) + perimeter(offset(poly, e0 + gw + tg) || poly)) * (gd + tg);
      add('grating', 'surround', 'IFCCOVERING', 'Overflow grating', 'plastic', COLORS.grating, grate.pieces, { predefined: 'FLOORING', objectType: 'GRATING' });
      M.gratingLength = perimeter(offset(poly, e0 + gw / 2) || poly);
      edge = e0 + gw + tg;
    }
    const coping = band(poly, 0, cw, zt, 0);
    add('coping', 'surround', 'IFCCOVERING', gutter ? 'Overflow edge' : 'Coping', 'stone', COLORS.coping, coping.pieces, { predefined: 'FLOORING', objectType: 'COPING', qty: { area: coping.area } });
    M.copingLength = perimeter(poly); M.copingArea = coping.area;
    const pav0 = gutter ? edge : cw;
    const paving = band(poly, pav0, pav0 + d.pavingWidth, -pt, 0);
    if (paving.pieces.length) add('paving', 'surround', 'IFCCOVERING', 'Paving', 'stone', COLORS.paving, paving.pieces, { predefined: 'FLOORING', objectType: 'PAVING', qty: { area: paving.area } });
    M.pavingArea = paving.area; M.pav1 = pav0 + d.pavingWidth;
    M.sharp = sharpCorners(poly).length;
  }

  // ---- steps and benches (any outline)
  M.tileSteps = steps && !steps.nofit ? steps.tile * 1e6 : 0;
  if (steps && !steps.nofit) {
    const props = { Risers: steps.risers, Treads: steps.treads, RiserMm: steps.riser, TreadMm: steps.tread, BottomRiserMm: steps.lastRiser, WidthMm: steps.width, Side: steps.edge };
    if (steps.plain) add('steps', 'shell', 'IFCSTAIRFLIGHT', 'Entry steps', 'concrete', COLORS.tile, [vy(steps.profile, 0, steps.width)], { predefined: 'STRAIGHT', props });
    else {
      const s = [steps.at[0] - steps.d[0] * steps.width / 2, steps.at[1] - steps.d[1] * steps.width / 2];
      add('steps', 'shell', 'IFCSTAIRFLIGHT', 'Entry steps', 'concrete', COLORS.tile, [{ profile: steps.profile, origin: [s[0], s[1], 0], x: [-steps.n[0], -steps.n[1], 0], z: [steps.d[0], steps.d[1], 0], depth: steps.width }], { predefined: 'STRAIGHT', props });
    }
  }
  benches.forEach((b, i) => {
    if (!b.fits) return;
    add('bench-' + (i + 1), 'shell', 'IFCBUILDINGELEMENTPROXY', 'Bench ' + (i + 1), 'concrete', COLORS.tile, [slab(b.plan, [fa, fs], [b.seatZ, 0])],
      { objectType: 'POOLBENCH', props: { Side: b.side, LengthMm: b.length, SeatDepthMm: d.benchDepth, SeatUnderWaterMm: d.benchSeat } });
    M.tileSteps += b.tile * 1e6;
  });

  // ---- barrier (with its gate), machine room
  const gate = barrier(d, poly, M.pav1, add, M, rectShape);
  const R = machineRoom(d, circ, L, B, edge, add, M, gutter);
  const { room, entry, entryR } = R;

  // ---- terminals and pipes
  const keep = [-edge - 100, -edge - 100, L + edge + 100, B + edge + 100];
  const zp = -(ct + 600), zpR = zp - 300, off = edge + 300;
  const pipes = [], layout = { poly, rect: [0, 0, L, B], outer: [-edge, -edge, L + edge, B + edge], edge, room, entry, entryR, skimmers: [], inlets: [], drains: [], jets: [], pipes, terms, steps, benches, gate,
    rings: { shell: offset(poly, e0), coping: gutter ? null : offset(poly, cw), paving: d.pavingWidth > 0 ? offset(poly, M.pav1) : null, outer: edge > e0 + 1 ? offset(poly, edge) : null } };
  const pipe = (system, dn, pts, flow = 0, role = 'trunk') => { const p = tidy(pts.map((q) => [q[0], q[1], pts[0][2]])); if (p.length >= 2 && pathLen(p) > 1) pipes.push({ system, dn, pts: p, flow, role }); return p; };
  const term = (key, kind, system, port, dir, start, dn) => terms.push({ key, kind, system, port, dir, start, dn });
  const zSk = -d.freeboard - 150, zi = -d.freeboard - 300;
  if (rectShape) {
    const skimSide = room.side === 'y-' ? -1 : 1, yS = skimSide > 0 ? B + off : -off, yR = skimSide > 0 ? -off : B + off;
    /** A collector along y = yc between the xs, joined to the room by the shorter way round. */
    const collector = (system, dn, xs, yc, z, flow, to) => {
      const a = [Math.min(...xs), yc], b = [Math.max(...xs), yc];
      const ra = routeRound(to, a, keep), rb = routeRound(to, b, keep);
      const viaA = pathLen(ra) <= pathLen(rb);
      pipe(system, dn, [...(viaA ? ra : rb), viaA ? b : a].map((q) => [q[0], q[1], z]), flow, 'trunk');
    };
    const alongX = (n) => Array.from({ length: n }, (_, i) => (L * (i + 0.5)) / n);
    if (circ.skimmers > 0) {
      const xs = alongX(circ.skimmers), yw = skimSide > 0 ? B : 0, yo = skimSide > 0 ? B + e0 : -e0;
      const br = pipeFor(circ.lines.surface.flow / circ.skimmers, d.vSuction).dn;
      xs.forEach((x, i) => {
        layout.skimmers.push([x, yw]);
        add('skimmer-' + (i + 1), 'terminals', 'IFCBUILDINGELEMENTPROXY', 'Skimmer ' + (i + 1), 'plastic', COLORS.fitting,
          [box(x - 125, Math.min(yw, yw + skimSide * 250), -d.freeboard - 200, x + 125, Math.max(yw, yw + skimSide * 250), -d.freeboard + 100)], { objectType: 'SKIMMER' });
        pipe('surface', br, [[x, yo, zp], [x, yS, zp]], circ.lines.surface.flow / circ.skimmers, 'branch');
        term('skimmer-' + (i + 1), 'skimmer', 'surface', [x, yw + skimSide * 250, zSk], [0, skimSide, 0], [x, yo, zp], br);
      });
      collector('surface', circ.lines.surface.dn, xs, yS, zp, circ.lines.surface.flow, entry);
    }
    if (circ.inlets > 0) {
      const xs = alongX(circ.inlets), yw = skimSide > 0 ? 0 : B, yo = skimSide > 0 ? -e0 : B + e0;
      const bi = pipeFor(circ.lines.ret.flow / circ.inlets, d.vReturn).dn;
      xs.forEach((x, i) => {
        layout.inlets.push([x, yw]);
        add('inlet-' + (i + 1), 'terminals', 'IFCBUILDINGELEMENTPROXY', 'Inlet ' + (i + 1), 'plastic', COLORS.fitting, [cyl([x, yw, zi], [x, yo, zi], 40)], { objectType: 'INLET' });
        pipe('ret', bi, [[x, yo, zpR], [x, yR, zpR]], circ.lines.ret.flow / circ.inlets, 'branch');
        term('inlet-' + (i + 1), 'inlet', 'ret', [x, yo, zi], [0, -skimSide, 0], [x, yo, zpR], bi);
      });
      collector('ret', circ.lines.ret.dn, xs, yR, zpR, circ.lines.ret.flow, entryR);
    }
  } else {
    // terminals spread round the outline, branches straight out to a ring at `off`, the ring joined to the room at its nearest point
    const per = perimeter(poly), ringS = offset(poly, off);
    const spots = (n, shift) => Array.from({ length: n }, (_, i) => {
      const s = (per * (i + shift)) / n, pos = along(poly, s), E2 = edges(poly)[pos.edge], m = Math.min(E2.len / 2, off + 300);
      const t = Math.min(Math.max(pos.t, m), E2.len - m);
      return { edge: pos.edge, t, at: [E2.a[0] + E2.d[0] * t, E2.a[1] + E2.d[1] * t], n: E2.n };
    });
    const ringRun = (system, dn, feet, z, flow, to) => {
      if (!ringS || !feet.length) return;
      const near = nearest(ringS, to), s0 = sOf(ringS, near), perR = perimeter(ringS);
      const sf = feet.map((f) => { let s = sOf(ringS, { edge: f.edge, t: Math.max(0, Math.min(edges(ringS)[f.edge].len, (f.foot[0] - edges(ringS)[f.edge].a[0]) * edges(ringS)[f.edge].d[0] + (f.foot[1] - edges(ringS)[f.edge].a[1]) * edges(ringS)[f.edge].d[1])) }); while (s < s0) s += perR; return s; });
      // go the shorter way round: counter-clockwise to the farthest foot, or clockwise to the nearest-after-s0
      const ccw = Math.max(...sf) - s0, cwLen = s0 + perR - Math.min(...sf);
      const path = ccw <= cwLen ? pathAlong(ringS, s0, Math.max(...sf)) : pathAlong(ringS, Math.min(...sf), s0 + perR).reverse();
      pipe(system, dn, [[to[0], to[1], z], ...path.map((q) => [q[0], q[1], z])], flow, 'trunk');
    };
    if (circ.skimmers > 0) {
      const br = pipeFor(circ.lines.surface.flow / circ.skimmers, d.vSuction).dn, feet = [];
      spots(circ.skimmers, 0.5).forEach((p, i) => {
        layout.skimmers.push(p.at);
        const o = (k) => [p.at[0] + p.n[0] * k, p.at[1] + p.n[1] * k], tdir = [-p.n[1], p.n[0]];
        const c0 = o(0), c1 = o(250);
        add('skimmer-' + (i + 1), 'terminals', 'IFCBUILDINGELEMENTPROXY', 'Skimmer ' + (i + 1), 'plastic', COLORS.fitting,
          [vz([[c0[0] - tdir[0] * 125, c0[1] - tdir[1] * 125], [c0[0] + tdir[0] * 125, c0[1] + tdir[1] * 125], [c1[0] + tdir[0] * 125, c1[1] + tdir[1] * 125], [c1[0] - tdir[0] * 125, c1[1] - tdir[1] * 125]], -d.freeboard - 200, -d.freeboard + 100)], { objectType: 'SKIMMER' });
        const a = o(e0), b = o(off);
        pipe('surface', br, [[a[0], a[1], zp], [b[0], b[1], zp]], circ.lines.surface.flow / circ.skimmers, 'branch');
        term('skimmer-' + (i + 1), 'skimmer', 'surface', [c1[0], c1[1], zSk], [p.n[0], p.n[1], 0], [a[0], a[1], zp], br);
        feet.push({ edge: p.edge, foot: b });
      });
      ringRun('surface', circ.lines.surface.dn, feet, zp, circ.lines.surface.flow, entry);
    }
    if (circ.inlets > 0) {
      const bi = pipeFor(circ.lines.ret.flow / circ.inlets, d.vReturn).dn, feet = [];
      spots(circ.inlets, circ.skimmers > 0 ? 0 : 0.5).forEach((p, i) => {
        layout.inlets.push(p.at);
        const o = (k) => [p.at[0] + p.n[0] * k, p.at[1] + p.n[1] * k];
        const a = o(e0), b = o(off);
        add('inlet-' + (i + 1), 'terminals', 'IFCBUILDINGELEMENTPROXY', 'Inlet ' + (i + 1), 'plastic', COLORS.fitting, [cyl([p.at[0], p.at[1], zi], [a[0], a[1], zi], 40)], { objectType: 'INLET' });
        pipe('ret', bi, [[a[0], a[1], zpR], [b[0], b[1], zpR]], circ.lines.ret.flow / circ.inlets, 'branch');
        term('inlet-' + (i + 1), 'inlet', 'ret', [a[0], a[1], zi], [-p.n[0], -p.n[1], 0], [a[0], a[1], zpR], bi);
        feet.push({ edge: p.edge, foot: b });
      });
      ringRun('ret', circ.lines.ret.dn, feet, zpR, circ.lines.ret.flow, entryR);
    }
  }
  if (gutter) {
    const g = [Math.min(Math.max(entry[0], -edge), L + edge), Math.min(Math.max(entry[1], -edge), B + edge)];
    const zo = zt - d.gutterDepth - d.gutterWall - 150;
    pipe('overflow', circ.lines.surface.dn, [[g[0], g[1], zo], [entry[0], entry[1], zo]], circ.lines.surface.flow, 'trunk');
    terms.push({ key: 'gutter', kind: 'channel', system: 'overflow', port: [g[0], g[1], zt - d.gutterDepth], dir: [0, 0, -1], start: [g[0], g[1], zo], dn: circ.lines.surface.dn });
  }
  // drains (and a fountain's jets) are fed from under the slab, out past the deep end, then round to the room
  const zd = zs(L) - tfl - 300, xo = L + edge + 300;
  const xd = L - Math.min(1500, L / 4), span = longestAtX(poly, xd) || [0, B], yc = (span[0] + span[1]) / 2;
  const under = (system, dn, xFrom, y, flow, z, to) => {
    const r = routeRound([xo, y], to, keep);
    const p = tidy([[xFrom, y, z], ...r.map((q) => [q[0], q[1], z])]);
    pipes.push({ system, dn, flow, role: 'trunk', pts: p });
  };
  if (circ.drains > 0) {
    const sep = circ.drains > 1 ? Math.min(1000, (span[1] - span[0]) / 2) : 0;
    const ys = circ.drains > 1 ? [yc - sep / 2, yc + sep / 2] : [yc];
    const br = circ.drains > 1 ? circ.lines.drain.dn : circ.lines.drain.dn;
    ys.forEach((y, i) => {
      layout.drains.push([xd, y]);
      add('drain-' + (i + 1), 'terminals', 'IFCWASTETERMINAL', fountain ? 'Sump' : 'Main drain ' + (i + 1), 'plastic', COLORS.fitting, [box(xd - 150, y - 150, zf(xd), xd + 150, y + 150, zf(xd) + 30)], { predefined: 'USERDEFINED', objectType: 'POOLMAINDRAIN' });
      term('drain-' + (i + 1), 'drain', 'drain', [xd, y, zf(xd)], [0, 0, -1], [xd, y, zd], br);
    });
    if (ys.length > 1) pipes.push({ system: 'drain', dn: circ.lines.drain.dn, flow: circ.lines.drain.flow / 2, role: 'branch', pts: [[xd, ys[0], zd], [xd, ys[1], zd]] });
    under('drain', circ.lines.drain.dn, xd, yc, circ.lines.drain.flow, zd, entry);
  }
  if (circ.jets > 0) {
    const jspan = longestAtY(poly, B / 2) || [0, L];
    const xs = Array.from({ length: circ.jets }, (_, i) => jspan[0] + ((jspan[1] - jspan[0]) * (i + 0.5)) / circ.jets);
    xs.forEach((x, i) => {
      layout.jets.push([x, B / 2]);
      add('jet-' + (i + 1), 'terminals', 'IFCBUILDINGELEMENTPROXY', 'Jet ' + (i + 1), 'steel', COLORS.fitting, [cyl([x, B / 2, zf(x)], [x, B / 2, -d.freeboard + 50], 30)], { objectType: 'FOUNTAINJET', props: { FlowM3h: d.jetFlow } });
      term('jet-' + (i + 1), 'jet', 'jet', [x, B / 2, zf(x)], [0, 0, -1], [x, B / 2, zd - 200], pipeFor(d.jetFlow, d.vReturn).dn);
    });
    under('jet', circ.lines.jet.dn, xs[0], B / 2, circ.lines.jet.flow, zd - 200, entryR);
  }
  for (const e of E) if (e.qty.volume === undefined) e.qty.volume = e.pieces.reduce((s, pc) => s + pieceVolume(pc), 0);
  const ob = offset(poly, edge) || poly, oxs = ob.map((q) => q[0]), oys = ob.map((q) => q[1]);
  M.excavation = (Math.max(...oxs) - Math.min(...oxs) + 1200) * (Math.max(...oys) - Math.min(...oys) + 1200) * (-(zs(0) + zs(L)) / 2 + tfl)
    + (room.outer[2] - room.outer[0] + 1200) * (room.outer[3] - room.outer[1] + 1200) * (-(room.floorZ - 200));
  M.zp = zp; M.zpR = zpR;
  return { elements: E, layout, metrics: M, names: NAMES };
}
