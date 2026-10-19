/* SPDX-License-Identifier: Apache-2.0 */
/**
 * swept.js — vehicle swept paths (0.6 WL.28): a vehicle (a tractor and up to three trailers) driven along a path, forward
 * or reversing, its wheel paths, body traces, steering and articulation, and the area it sweeps. No DOM; the Node test
 * drives it (bin/test-civilcraft-swept.mjs). The method and its checks: docs/spikes/swept-paths.md.
 *
 * Kinematics (the low-speed, no-slip model every swept-path check uses): each unit turns about its rear axle's line; a
 * point the unit is pulled by (the front axle for the tractor, the hitch for a trailer) drags the axle along a tractrix.
 * Each step moves the leader along a straight piece and places the follower by the tractrix exactly
 * (tan(α/2) = tan(α₀/2)·e^(−d/L), α = the angle between the piece and the leader-to-follower line); arcs are cut into
 * steps along it (a point and its travel direction exactly on every arc).
 *   forward  the tractor's FRONT axle centre follows the path; the rear axle, then each trailer through its hitch, follow
 *   reverse  the LAST unit's rear axle centre follows the path (drawn in the direction of travel, backwards); each unit
 *            ahead is pushed through its hitch — with the hitch behind the axle (c > 0) that is again a pulled tractrix
 *            in the direction of travel (stable); a hitch on the axle (c ≈ 0, a fifth wheel) makes the unit ahead turn
 *            with the hitch's path; a hitch ahead of the axle (c < 0) is taken as on it, and said (problem kind 'hitch'). The tractor's steering is then whatever that takes: checked against its lock.
 *
 * Vehicle (lengths in project units, angles in degrees; every default a placeholder to set from your own design vehicle):
 *   { name, width, front (front overhang ahead of the front axle), wheelbase, rear (rear overhang behind the rear axle),
 *     track (wheel centres across), maxSteer, trailers: [{ hitch (behind the unit's rear axle, + behind), wheelbase (hitch
 *     to the trailer's axle), front (ahead of the hitch), rear (behind its axle), width, track, maxArticulation }] }
 *   VEHICLES(units) → named placeholders · cleanVehicle(o, units) → vehicle | null (untrusted)
 *
 *   simulate(vehicle, path, { mode 'forward'|'reverse', step, start: 'path' }) → {
 *     frames: [{ s, units: [{ x, y, th }] (each unit's rear axle centre and heading), steer (deg), art: [deg] }],
 *     wheels: [[{x,y}]] (every wheel centre's path: per unit left and right of each axle), corners: [[{x,y}]],
 *     maxSteer, maxArt: [deg], problems: [{ kind 'steer'|'articulation'|'short', s, value, limit }], length }
 *   envelope(sim, vehicle, { cell }) → { loops: [[{x,y}]] (outline; holes after their outer loop), area, cell, cells }
 *   bodyOutline(vehicle, frame, i) → the unit's four body corners at that frame
 *   In the project (state.swept): cleanSwept(o, units) → { id 'w<n>', name, vehicle, mode, from: { kind 'feature'|'alignment',
 *     id } } | null · alignmentPath(al) → [{x, y, b?}] (its lines and arcs as a path) · sweptItems(name, sim, env,
 *     unitPerMm) → plan items on C-ROAD-SWPT: the swept outline, the outermost and innermost wheel paths, the name
 *   steadyRadii(vehicle, R) → { rear: [radius of each unit's rear axle], hitch: [] } when the front axle runs on a circle of
 *     radius R for ever (the closed form the test checks the integration against)
 */

import { arcOf, pointOnSeg } from './featureline.js';
import { t } from './i18n.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const D2R = Math.PI / 180;
export const MAX_TRAILERS = 3;

/** Placeholder design vehicles (feet; metres scaled by 0.3048 and rounded). Set them from your own design vehicle. */
export function VEHICLES(units = 'ft') {
  const ft = [
    { key: 'car', name: t('sw.v.car'), width: 7, front: 3, wheelbase: 11, rear: 5, track: 6, maxSteer: 35, trailers: [] },
    { key: 'su', name: t('sw.v.su'), width: 8, front: 4, wheelbase: 20, rear: 6, track: 6.8, maxSteer: 35, trailers: [] },
    { key: 'bus', name: t('sw.v.bus'), width: 8.5, front: 7, wheelbase: 25, rear: 8, track: 7, maxSteer: 40, trailers: [] },
    { key: 'semi', name: t('sw.v.semi'), width: 8.5, front: 4, wheelbase: 19, rear: 2, track: 7, maxSteer: 30,
      trailers: [{ hitch: 0, wheelbase: 41, front: 3, rear: 8, width: 8.5, track: 7, maxArticulation: 70 }] },
    { key: 'cartrailer', name: t('sw.v.cartrailer'), width: 7, front: 3, wheelbase: 11, rear: 5, track: 6, maxSteer: 35,
      trailers: [{ hitch: 5, wheelbase: 12, front: 4, rear: 3, width: 7, track: 6, maxArticulation: 80 }] },
  ];
  if (units !== 'm') return ft;
  const k = 0.3048, r = (v) => Math.round(v * k * 100) / 100;
  return ft.map((v) => ({ ...v, width: r(v.width), front: r(v.front), wheelbase: r(v.wheelbase), rear: r(v.rear), track: r(v.track),
    trailers: v.trailers.map((tr) => ({ ...tr, hitch: r(tr.hitch), wheelbase: r(tr.wheelbase), front: r(tr.front), rear: r(tr.rear), width: r(tr.width), track: r(tr.track) })) }));
}

export function cleanVehicle(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const big = units === 'm' ? 60 : 200;
  const len = (v, min = 0) => (fin(v) && v >= min && v < big ? v : null);
  const v = { name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80), width: len(o.width, 1e-6), front: len(o.front), wheelbase: len(o.wheelbase, 1e-6), rear: len(o.rear), track: len(o.track, 0), maxSteer: fin(o.maxSteer) && o.maxSteer > 0 && o.maxSteer < 89 ? o.maxSteer : null, trailers: [] };
  if ([v.width, v.front, v.wheelbase, v.rear, v.track, v.maxSteer].some((x) => x === null)) return null;
  v.track = Math.min(v.track, v.width);
  for (const t0 of (Array.isArray(o.trailers) ? o.trailers : []).slice(0, MAX_TRAILERS)) {
    const tr = { hitch: fin(t0?.hitch) && Math.abs(t0.hitch) < big ? t0.hitch : null, wheelbase: len(t0?.wheelbase, 1e-6), front: len(t0?.front), rear: len(t0?.rear), width: len(t0?.width, 1e-6), track: len(t0?.track, 0),
      maxArticulation: fin(t0?.maxArticulation) && t0.maxArticulation > 0 && t0.maxArticulation <= 180 ? t0.maxArticulation : null };
    if (Object.values(tr).some((x) => x === null)) return null;
    tr.track = Math.min(tr.track, tr.width);
    v.trailers.push(tr);
  }
  return v;
}

// ---- the chain: unit 0 = the tractor; for unit i ≥ 1, `hitch` belongs to unit i − 1 (behind its rear axle) ----
const unitDims = (v) => [{ L: v.wheelbase, front: v.front, rear: v.rear, width: v.width, track: v.track, steer: true },
  ...v.trailers.map((tr) => ({ L: tr.wheelbase, front: tr.front, rear: tr.rear, width: tr.width, track: tr.track, hitch: tr.hitch, maxArt: tr.maxArticulation }))];

/** Move a follower at distance L behind a leader that goes in a straight line from A to B: the exact tractrix. */
function tractrix(F, A, B, L) {
  const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
  if (d < 1e-15) return F;
  const wx = dx / d, wy = dy / d;
  // α: from the travel direction w to the line leader → follower, measured as the follower trails behind (α = 0 straight behind)
  const bx = F.x - A.x, by = F.y - A.y, bl = Math.hypot(bx, by) || 1;
  const cosA = -(bx * wx + by * wy) / bl, sinA = (bx * wy - by * wx) / bl;   // behind = −w
  let a = Math.atan2(sinA, cosA);
  const k = Math.exp(-d / L);
  if (Math.abs(Math.abs(a) - Math.PI) < 1e-12) a = Math.sign(a || 1) * (Math.PI - 1e-9);   // exactly ahead: unstable point
  const a1 = 2 * Math.atan(Math.tan(a / 2) * k);
  // follower = B + L·(rotation of −w by a1)
  const c = Math.cos(a1), s = Math.sin(a1);
  return { x: B.x + L * (-wx * c + wy * s), y: B.y + L * (-wy * c - wx * s) };
}

/** steady state: the front axle on a circle of radius R; each rear axle's radius about the same centre. */
export function steadyRadii(vehicle, R) {
  const U = unitDims(vehicle), rear = [], hitch = [];
  let lead = R;   // radius of the point that pulls the unit
  for (let i = 0; i < U.length; i++) {
    const r = Math.sqrt(Math.max(0, lead * lead - U[i].L * U[i].L));
    rear.push(r);
    if (i + 1 < U.length) { const c = U[i + 1].hitch; const h = Math.sqrt(r * r + c * c); hitch.push(h); lead = h; }
  }
  return { rear, hitch };
}

const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

export function simulate(vehicle, path, { mode = 'forward', step = null } = {}) {
  const v = vehicle, U = unitDims(v), n = U.length;
  // walk the path in steps no longer than ds: exact points and travel directions on its arcs (featureline.js pointOnSeg)
  const P = (path || []).filter((p) => p && fin(p.x) && fin(p.y));
  const segs = [];
  for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], A = arcOf(a, b, a.b), L = A ? A.L : Math.hypot(b.x - a.x, b.y - a.y); if (L > 1e-12) segs.push({ a, b, L }); }
  const total = segs.reduce((m, q) => m + q.L, 0);
  const problems = [];
  if (!segs.length) return { frames: [], wheels: [], corners: [], maxSteer: 0, maxArt: [], problems: [{ kind: 'short', s: 0, value: 0, limit: 0 }], length: 0, mode };
  const ds = step > 0 ? step : Math.max(1e-3, Math.min(v.wheelbase, ...v.trailers.map((tr) => tr.wheelbase)) / 40);
  const walk = [{ ...pointOnSeg(segs[0].a, segs[0].b, segs[0].a.b, 0), s: 0 }];
  let s = 0;
  for (const q of segs) {
    const k = Math.max(1, Math.ceil(q.L / ds));
    for (let j = 1; j <= k; j++) walk.push({ ...pointOnSeg(q.a, q.b, q.a.b, j / k), s: s + (q.L * j) / k });
    s += q.L;
  }
  const t0 = walk[0].dir, pts = [walk[0]];
  // the start: everything straight along the first piece
  const units = [];
  if (mode === 'forward') {
    let lead = { x: pts[0].x, y: pts[0].y }, th = t0;
    for (let i = 0; i < n; i++) {
      const r = { x: lead.x - U[i].L * Math.cos(th), y: lead.y - U[i].L * Math.sin(th) };
      units.push({ ...r, th });
      if (i + 1 < n) lead = { x: r.x - U[i + 1].hitch * Math.cos(th), y: r.y - U[i + 1].hitch * Math.sin(th) };
    }
  } else {
    // reversing: the units face against the travel direction; the last axle sits on the path's start
    const th = t0 + Math.PI;
    let r = { x: pts[0].x, y: pts[0].y };
    for (let i = n - 1; i >= 0; i--) {
      units[i] = { ...r, th };
      if (i > 0) { const h = { x: r.x + U[i].L * Math.cos(th), y: r.y + U[i].L * Math.sin(th) }; r = { x: h.x + U[i].hitch * Math.cos(th), y: h.y + U[i].hitch * Math.sin(th) }; }
    }
  }
  const frames = [];
  const rec = (sNow, steer) => frames.push({ s: sNow, units: units.map((u) => ({ ...u })), steer: steer / D2R, art: units.slice(1).map((u, i) => angDiff(units[i].th, u.th) / D2R) });
  rec(0, 0);
  let maxSteer = 0;
  const maxArt = new Array(n - 1).fill(0);
  const said = { steer: false, art: new Array(n - 1).fill(false), hitch: false };
  for (let k = 1; k < walk.length; k++) {
    const A = walk[k - 1], B = walk[k];
    let steer = 0;
    const prev0 = { ...units[0] };
    if (mode === 'forward') {
      // the front axle moves A → B; the tractor's rear axle follows it; each hitch drags the next trailer
      const r0 = tractrix(units[0], A, B, U[0].L);
      const th0 = Math.atan2(B.y - r0.y, B.x - r0.x);
      let hOld = null, hNew = null;
      const before = units.map((u) => ({ ...u }));
      units[0] = { ...r0, th: th0 };
      for (let i = 1; i < n; i++) {
        const c = U[i].hitch, p = before[i - 1], q = units[i - 1];
        hOld = { x: p.x - c * Math.cos(p.th), y: p.y - c * Math.sin(p.th) };
        hNew = { x: q.x - c * Math.cos(q.th), y: q.y - c * Math.sin(q.th) };
        const r = tractrix(before[i], hOld, hNew, U[i].L);
        units[i] = { ...r, th: Math.atan2(hNew.y - r.y, hNew.x - r.x) };
      }
    } else {
      // reversing: the last axle moves A → B (the unit faces backwards); each unit ahead hangs from the hitch it pushes
      const before = units.map((u) => ({ ...u }));
      units[n - 1] = { x: B.x, y: B.y, th: B.dir + Math.PI };
      for (let i = n - 1; i > 0; i--) {
        const L = U[i].L, c = U[i].hitch, p = before[i], q = units[i];
        const hOld = { x: p.x + L * Math.cos(p.th), y: p.y + L * Math.sin(p.th) }, hNew = { x: q.x + L * Math.cos(q.th), y: q.y + L * Math.sin(q.th) };
        let r, th;
        if (c < -1e-6 && !said.hitch) { problems.push({ kind: 'hitch', unit: i, s: B.s, value: c, limit: 0 }); said.hitch = true; }
        if (c < 1e-6) {   // a hitch on or ahead of the axle: reversing, the unit turns with the hitch's path
          r = hNew;
          th = Math.hypot(hNew.x - hOld.x, hNew.y - hOld.y) > 1e-12 ? Math.atan2(hOld.y - hNew.y, hOld.x - hNew.x) : before[i - 1].th;
        } else {
          // the unit's rear axle sits c ahead of the hitch (c > 0: the hitch is behind the axle): a tractrix led by the hitch
          r = tractrix(before[i - 1], hOld, hNew, c);
          th = Math.atan2(r.y - hNew.y, r.x - hNew.x);
        }
        units[i - 1] = { ...r, th };
      }
    }
    // the steering angle: tan δ = wheelbase × the curvature of the tractor's rear axle path (turn per length, + = left,
    // the length counted along the heading: negative when reversing)
    {
      const q = units[0], dl = Math.hypot(q.x - prev0.x, q.y - prev0.y), along = (q.x - prev0.x) * Math.cos(q.th) + (q.y - prev0.y) * Math.sin(q.th);
      if (dl > 1e-12) steer = Math.atan((U[0].L * angDiff(q.th, prev0.th)) / (along < 0 ? -dl : dl));
    }
    const sd = Math.abs(steer) / D2R;
    if (sd > maxSteer) maxSteer = sd;
    if (sd > v.maxSteer + 1e-9 && !said.steer) { problems.push({ kind: 'steer', s: B.s, value: sd, limit: v.maxSteer }); said.steer = true; }
    rec(B.s, steer);
    const fr = frames[frames.length - 1];
    fr.art.forEach((a, i) => {
      const x = Math.abs(a);
      if (x > maxArt[i]) maxArt[i] = x;
      if (x > U[i + 1].maxArt + 1e-9 && !said.art[i]) { problems.push({ kind: 'articulation', unit: i + 1, s: B.s, value: x, limit: U[i + 1].maxArt }); said.art[i] = true; }
    });
  }
  // wheel paths and body corner traces
  const wheels = [], corners = [];
  for (let i = 0; i < n; i++) {
    const u = U[i], axles = i === 0 ? [0, u.L] : [0];
    for (const ax of axles) for (const side of [-1, 1]) wheels.push(frames.map((f) => { const q = f.units[i], c = Math.cos(q.th), sn = Math.sin(q.th); return { x: q.x + ax * c - side * (u.track / 2) * sn, y: q.y + ax * sn + side * (u.track / 2) * c }; }));
    for (let k = 0; k < 4; k++) corners.push(frames.map((f) => bodyOutline(v, f, i)[k]));
  }
  return { frames, wheels, corners, maxSteer, maxArt, problems, length: total, mode };
}

/** The four corners of unit i's body at a frame (anticlockwise from rear right). */
export function bodyOutline(v, frame, i) {
  const u = unitDims(v)[i], q = frame.units[i], c = Math.cos(q.th), s = Math.sin(q.th);
  const back = -u.rear, fwd = i === 0 ? u.L + u.front : u.L + u.front;   // a trailer's front = ahead of its hitch, which is L ahead of its axle
  return [[back, -u.width / 2], [fwd, -u.width / 2], [fwd, u.width / 2], [back, u.width / 2]].map(([a, b]) => ({ x: q.x + a * c - b * s, y: q.y + a * s + b * c }));
}

/** The area the bodies sweep: every frame's body rectangles filled into a grid of `cell`, the filled cells' outline. */
export function envelope(sim, v, { cell = null, maxCells = 4e6 } = {}) {
  if (!sim.frames.length) return { loops: [], area: 0, cell: 0, cells: 0 };
  const n = 1 + v.trailers.length;
  const polys = [];
  for (const f of sim.frames) for (let i = 0; i < n; i++) polys.push(bodyOutline(v, f, i));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const P of polys) for (const p of P) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  let h = cell > 0 ? cell : Math.min(v.width, ...v.trailers.map((tr) => tr.width)) / 40;
  while (((maxX - minX) / h + 3) * ((maxY - minY) / h + 3) > maxCells) h *= 1.5;
  const W = Math.ceil((maxX - minX) / h) + 3, H = Math.ceil((maxY - minY) / h) + 3, x0 = minX - h, y0 = minY - h;
  const g = new Uint8Array(W * H);
  // a cell is in when its centre is inside a rectangle; consecutive frames overlap, so the sweep has no gaps
  for (const P of polys) {
    let a = Infinity, b = -Infinity;
    for (const p of P) { a = Math.min(a, p.y); b = Math.max(b, p.y); }
    const j0 = Math.max(0, Math.ceil((a - y0) / h - 0.5)), j1 = Math.min(H - 1, Math.floor((b - y0) / h - 0.5));
    for (let j = j0; j <= j1; j++) {
      const yc = y0 + (j + 0.5) * h, xs = [];
      for (let k = 0; k < 4; k++) {
        const p = P[k], q = P[(k + 1) % 4];
        if ((p.y <= yc) !== (q.y <= yc)) xs.push(p.x + ((yc - p.y) * (q.x - p.x)) / (q.y - p.y));
      }
      if (xs.length < 2) continue;
      xs.sort((m, o) => m - o);
      const i0 = Math.max(0, Math.ceil((xs[0] - x0) / h - 0.5)), i1 = Math.min(W - 1, Math.floor((xs[xs.length - 1] - x0) / h - 0.5));
      for (let i = i0; i <= i1; i++) g[j * W + i] = 1;
    }
  }
  let cells = 0;
  for (let i = 0; i < g.length; i++) cells += g[i];
  // the outline: every cell edge between in and out, joined into loops (corners kept: a grid polygon), then thinned
  const loops = traceLoops(g, W, H).map((L) => simplify(L.map(([i, j]) => ({ x: x0 + i * h, y: y0 + j * h })), h * 0.5));
  return { loops, area: cells * h * h, cell: h, cells };
}

/** The boundary loops of the filled cells (cell (i, j) spans [i, i+1] × [j, j+1]); each loop has the filled side on its left. */
function traceLoops(g, W, H) {
  const at = (i, j) => (i >= 0 && j >= 0 && i < W && j < H ? g[j * W + i] : 0);
  // directed edges: start vertex → next vertex, keyed by start; a vertex may have two outgoing edges (a pinch)
  const out = new Map();
  const add = (a, b) => { const k = a[0] * (H + 1) + a[1]; if (!out.has(k)) out.set(k, []); out.get(k).push(b); };
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    if (!at(i, j)) continue;
    if (!at(i, j - 1)) add([i, j], [i + 1, j]);          // bottom edge, left to right
    if (!at(i + 1, j)) add([i + 1, j], [i + 1, j + 1]);  // right edge, upward
    if (!at(i, j + 1)) add([i + 1, j + 1], [i, j + 1]);  // top edge, right to left
    if (!at(i - 1, j)) add([i, j + 1], [i, j]);          // left edge, downward
  }
  const loops = [];
  for (const [k0, list] of out) {
    while (list.length) {
      const start = [Math.floor(k0 / (H + 1)), k0 % (H + 1)], loop = [start];
      let cur = list.pop(), prev = start;
      while (!(cur[0] === start[0] && cur[1] === start[1])) {
        loop.push(cur);
        const l2 = out.get(cur[0] * (H + 1) + cur[1]);
        if (!l2 || !l2.length) break;
        // at a pinch take the left turn, so loops never cross
        let pick = 0;
        if (l2.length > 1) {
          const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
          pick = l2.findIndex((q) => (q[0] - cur[0]) * -dy + (q[1] - cur[1]) * dx > 0);
          if (pick < 0) pick = 0;
        }
        prev = cur;
        cur = l2.splice(pick, 1)[0];
      }
      if (loop.length >= 4) loops.push(loop);
    }
  }
  return loops;
}

/** Douglas–Peucker on a closed loop. */
function simplify(P, tol) {
  if (P.length < 8) return P;
  const keep = new Uint8Array(P.length);
  // split at the two points furthest apart so the closed loop becomes two open chains
  let a = 0, b = 0, best = -1;
  for (let i = 0; i < P.length; i++) { const d = (P[i].x - P[0].x) ** 2 + (P[i].y - P[0].y) ** 2; if (d > best) { best = d; b = i; } }
  keep[a] = keep[b] = 1;
  const stack = [[a, b], [b, P.length]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const p = P[i], q = P[j % P.length], dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
    let far = -1, fd = tol;
    for (let k = i + 1; k < j; k++) { const d = Math.abs((P[k].x - p.x) * dy - (P[k].y - p.y) * dx) / L; if (d > fd) { fd = d; far = k; } }
    if (far >= 0) { keep[far] = 1; stack.push([i, far], [far, j]); }
  }
  return P.filter((_, i) => keep[i]);
}

// ---- swept paths in the project ----
export function cleanSwept(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const vehicle = cleanVehicle(o.vehicle, units);
  const f = o.from, id = String(f?.id ?? '');
  const from = f?.kind === 'feature' && /^f\d{1,9}$/.test(id) ? { kind: 'feature', id } : f?.kind === 'alignment' && /^a\d{1,9}$/.test(id) ? { kind: 'alignment', id } : null;
  if (!vehicle || !from) return null;
  return {
    id: /^w\d{1,9}$/.test(String(o.id)) ? String(o.id) : null,
    name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || vehicle.name,
    vehicle, mode: o.mode === 'reverse' ? 'reverse' : 'forward', from,
  };
}
/** An alignment's lines and arcs as a path with bulges (+ = left). */
export function alignmentPath(al) {
  if (!al?.elements?.length) return [];
  const out = [];
  for (const e of al.elements) {
    out.push(e.type === 'arc' ? { x: e.p0.x, y: e.p0.y, b: (e.ccw ? 1 : -1) * Math.tan(e.delta / 4) } : { x: e.p0.x, y: e.p0.y });
  }
  const e = al.elements[al.elements.length - 1];
  out.push({ x: e.p1.x, y: e.p1.y });
  return out;
}
/** Plan items (scene.js shape) for one swept path: the outline loops, the extreme wheel paths, the name at the start. */
export function sweptItems(name, sim, env, unitPerMm = 1) {
  const items = [];
  for (const L of env?.loops || []) if (L.length >= 3) items.push({ layer: 'C-ROAD-SWPT', kind: 'poly', pts: L, closed: true });
  // the wheel paths furthest out on each side: the first tractor wheel pair's outer ones and the last unit's (thinned)
  const thin = (P) => { const k = Math.max(1, Math.ceil(P.length / 600)); return P.filter((_, i) => i % k === 0 || i === P.length - 1); };
  const w = sim?.wheels || [];
  for (const P of [w[0], w[1], w[w.length - 2], w[w.length - 1]].filter(Boolean)) if (P.length >= 2) items.push({ layer: 'C-ROAD-SWPT', kind: 'poly', pts: thin(P), dashed: true });
  const f0 = sim?.frames?.[0]?.units?.[0];
  if (f0 && name) items.push({ layer: 'C-ROAD-SWPT', kind: 'text', x: f0.x, y: f0.y, rot: 0, mm: 1.8, align: 'left', text: name });
  return items;
}
