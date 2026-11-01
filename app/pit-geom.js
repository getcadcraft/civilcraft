/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry only, no strings. */
/**
 * pit-geom.js — the geometry of an open pit built from the block model (0.8 EG.27, civil_PART_4): the outline of every bench, a haul ramp that winds down
 * the pit wall at a set grade and width, and the pit cut into a ground surface. No DOM, no strings, no imports. SI inside (m); the glue converts.
 * A planning aid: a ramp laid out here is a sketch of where a road could go on the block model's stepped walls, not a mine design signed by a competent person.
 *
 * Methods (published, nothing copied):
 *  - Bench outline: the boundary edges between mined and unmined cells of one layer, joined into closed loops (counter-clockwise, interior on the left).
 *  - Spiral ramp: a haul road descends one bench height H over a run of H / grade (grade = rise over run, Hustrulid and Kuchta, Open Pit Mine Planning and Design,
 *    ch. 9 on ramp design). Here it follows the wall of each bench in turn, inset by half its width, and steps in to the next bench's wall at the end of the bench.
 *  - A ramp's width makes the overall wall flatter: tan(OSA') = H / (H / tan(OSA) + w) for one ramp lane per bench (the same formula as mining.js overallSlope).
 *
 *   benchLoops(model, mined, k) → [{ pts: [[x,y]…], area, perimeter }]       outer loops first (area > 0, largest first), holes after (area < 0)
 *   columnFloors(model, mined) → Float64Array(nx·ny)                          the bottom of the lowest mined block of each column, NaN where nothing is mined
 *   rampRoute(model, mined, { grade, width, start? }) → { pts: [[x,y,z]…], length, drop, benches: [{ level, run, perimeter, laps, ringOk, widthOk }], flags: [code…] }
 *   slopeWithRamp(slopeRad, benchHeight, width) → radians                    the overall slope with a ramp lane on every bench
 *   cutNodes(model, mined, groundAt, { margin }) → { nodes: [{x,y,z}], box, dug }   the grid of nodes over the pit (and a margin) with the pit cut into the ground
 */

export function benchLoops(model, mined, k) {
  const { nx, ny, size, origin } = model, is = (i, j) => i >= 0 && j >= 0 && i < nx && j < ny && mined[model.index(i, j, k)] === 1;
  const out = new Map();   // start vertex "a,b" -> [[a0,b0,a1,b1]]
  const add = (a0, b0, a1, b1) => { const key = a0 + ',' + b0; if (!out.has(key)) out.set(key, []); out.get(key).push([a0, b0, a1, b1, false]); };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (!is(i, j)) continue;
    if (!is(i, j - 1)) add(i, j, i + 1, j);
    if (!is(i + 1, j)) add(i + 1, j, i + 1, j + 1);
    if (!is(i, j + 1)) add(i + 1, j + 1, i, j + 1);
    if (!is(i - 1, j)) add(i, j + 1, i, j);
  }
  const loops = [];
  for (const list of out.values()) for (const e0 of list) {
    if (e0[4]) continue;
    const ring = []; let e = e0, guard = 0;
    while (e && !e[4] && guard++ < 1e6) {
      e[4] = true; ring.push([e[0], e[1]]);
      const next = out.get(e[2] + ',' + e[3]) || [];
      // at a vertex with two ways on (two blocks touching at a corner) turn left-most first, so the loops stay simple
      const dx = e[2] - e[0], dy = e[3] - e[1];
      const free = next.filter((n) => !n[4]);
      free.sort((a, b) => turn(dx, dy, a[2] - a[0], a[3] - a[1]) - turn(dx, dy, b[2] - b[0], b[3] - b[1]));
      e = free[0];
    }
    if (ring.length < 4) continue;
    const pts = simplify(ring).map(([a, b]) => [origin[0] + a * size[0], origin[1] + b * size[1]]);
    let area = 0, perimeter = 0;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; area += p[0] * q[1] - q[0] * p[1]; perimeter += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    loops.push({ pts, area: area / 2, perimeter });
  }
  return loops.sort((a, b) => (a.area > 0) === (b.area > 0) ? Math.abs(b.area) - Math.abs(a.area) : b.area - a.area);
}
const turn = (dx, dy, ex, ey) => { const c = dx * ey - dy * ex; return c > 0 ? 0 : c === 0 ? 1 : 2; };   // left first, straight, right
function simplify(ring) {
  const n = ring.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = ring[(i + n - 1) % n], q = ring[i], r = ring[(i + 1) % n];
    if ((q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]) !== 0) out.push(q);
  }
  return out;
}

export function columnFloors(model, mined) {
  const { nx, ny, nz, origin, size } = model, f = new Float64Array(nx * ny).fill(NaN);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) if (mined[model.index(i, j, k)]) { f[i + nx * j] = origin[2] + k * size[2]; break; }
  return f;
}

export function slopeWithRamp(slope, benchHeight, width) { return Math.atan(benchHeight / (benchHeight / Math.tan(slope) + Math.max(0, width))); }

/** The loop moved `d` to its inside (left of travel). Rectilinear loops only (no hairpins): each vertex moves along the sum of the two edge normals. */
function inset(pts, d) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const p = pts[(i + n - 1) % n], q = pts[i], r = pts[(i + 1) % n];
    const a = unit(q[0] - p[0], q[1] - p[1]), b = unit(r[0] - q[0], r[1] - q[1]), n0 = [-a[1], a[0]], n1 = [-b[1], b[0]], den = 1 + n0[0] * n1[0] + n0[1] * n1[1];
    const s = den > 1e-9 ? d / den : d;
    out.push([q[0] + (n0[0] + n1[0]) * s, q[1] + (n0[1] + n1[1]) * s]);
  }
  return out;
}
const unit = (x, y) => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };

/** The point on a closed loop nearest to (x,y): { d (distance along the loop), p, dist }. */
function nearestOn(pts, x, y) {
  let best = null, acc = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (l > 0) {
      const u = Math.max(0, Math.min(1, ((x - a[0]) * (b[0] - a[0]) + (y - a[1]) * (b[1] - a[1])) / (l * l))), p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], dist = Math.hypot(p[0] - x, p[1] - y);
      if (!best || dist < best.dist) best = { d: acc + u * l, p, dist };
    }
    acc += l;
  }
  return best;
}
/** The point `d` along a closed loop (d may exceed the perimeter: it wraps). */
function walk(pts, d, from, to, out) {
  // appends the loop's vertices from distance `from` to `to` (to > from), including the end points
  const per = pts.reduce((s, p, i) => s + Math.hypot(pts[(i + 1) % pts.length][0] - p[0], pts[(i + 1) % pts.length][1] - p[1]), 0);
  void d;
  const at = (s) => { s = ((s % per) + per) % per; let acc = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (s <= acc + l || i === pts.length - 1) { const u = l ? (s - acc) / l : 0; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; } acc += l; } return pts[0]; };
  out.push(at(from));
  // every vertex strictly between
  let acc = 0; const marks = [];
  for (let lap = Math.floor(from / per); lap <= Math.floor(to / per); lap++) { acc = lap * per; for (let i = 0; i < pts.length; i++) { const v = acc; if (v > from + 1e-9 && v < to - 1e-9) marks.push([v, pts[i]]); acc += Math.hypot(pts[(i + 1) % pts.length][0] - pts[i][0], pts[(i + 1) % pts.length][1] - pts[i][1]); } }
  for (const [, p] of marks) out.push(p);
  out.push(at(to));
}

/**
 * A ramp from the rim to the floor. It goes down along the wall of each bench for the run the grade needs (the bench height over the grade), then steps in to the next
 * bench's wall. `flags`: 'wraps' (a bench's wall is shorter than the run: the road laps the pit more than once, which the stepped walls do not have room for),
 * 'ring-narrow' (the strip between a bench's wall and the next one down is narrower than the ramp), 'noRamp' (nothing mined or a grade of zero),
 * 'floor-narrow' (the lowest bench is narrower than the ramp).
 */
export function rampRoute(model, mined, { grade = 0.1, width = 20, start = null } = {}) {
  const flags = [], dz = model.size[2];
  const levels = [];
  for (let k = model.nz - 1; k >= 0; k--) { let any = false; for (let j = 0; j < model.ny && !any; j++) for (let i = 0; i < model.nx; i++) if (mined[model.index(i, j, k)]) { any = true; break; } if (any) levels.push(k); }
  if (!levels.length || !(grade > 0)) return { pts: [], length: 0, drop: 0, benches: [], flags: ['noRamp'] };
  const loops = new Map(); for (const k of levels) { const o = benchLoops(model, mined, k).filter((l) => l.area > 0)[0]; if (o) loops.set(k, o); }
  const run = dz / grade, pts = [], benches = [];
  let cur = null;   // [x, y] where the ramp stands now
  for (let li = 0; li < levels.length; li++) {
    const k = levels[li], L = loops.get(k); if (!L) continue;
    const lane = inset(L.pts, width / 2);
    const area = polyArea(lane);
    const widthOk = area > 0 && L.area > 0 && Math.min(...bbox(L.pts)) >= width;
    let s0 = 0;
    if (cur) s0 = nearestOn(lane, cur[0], cur[1]).d;
    else if (start) s0 = nearestOn(lane, start.x, start.y).d;
    else { let bi = 0; lane.forEach((p, i) => { if (p[1] < lane[bi][1] - 1e-9 || (Math.abs(p[1] - lane[bi][1]) < 1e-9 && p[0] < lane[bi][0])) bi = i; }); s0 = lane.slice(0, bi).reduce((s, p, i) => s + Math.hypot(lane[i + 1][0] - p[0], lane[i + 1][1] - p[1]), 0); }
    const per = lane.reduce((s, p, i) => s + Math.hypot(lane[(i + 1) % lane.length][0] - p[0], lane[(i + 1) % lane.length][1] - p[1]), 0);
    const zTop = model.origin[2] + (k + 1) * dz, zBot = model.origin[2] + k * dz;
    const seg = []; walk(lane, 0, s0, s0 + run, seg);
    // elevation falls linearly with the distance walked
    let acc = 0; for (let i = 0; i < seg.length; i++) { if (i) acc += Math.hypot(seg[i][0] - seg[i - 1][0], seg[i][1] - seg[i - 1][1]); pts.push([seg[i][0], seg[i][1], zTop - dz * Math.min(1, acc / (run || 1))]); }
    // is the lane over the next bench down (mined there)? Then it would hang over a hole.
    let ringOk = true;
    const lower = k > 0 ? k - 1 : -1;
    if (lower >= 0) for (const p of seg) { const i = Math.floor((p[0] - model.origin[0]) / model.size[0]), j = Math.floor((p[1] - model.origin[1]) / model.size[1]); if (i >= 0 && j >= 0 && i < model.nx && j < model.ny && mined[model.index(i, j, lower)]) { ringOk = false; break; } }
    const laps = per > 0 ? run / per : Infinity;
    if (laps > 1 + 1e-9 && !flags.includes('wraps')) flags.push('wraps');
    if (!ringOk && !flags.includes('ring-narrow')) flags.push('ring-narrow');
    if (li === levels.length - 1 && !widthOk) flags.push('floor-narrow');
    benches.push({ level: k, run, perimeter: per, laps, ringOk, widthOk: li === levels.length - 1 ? widthOk : true, zTop, zBot });
    cur = seg[seg.length - 1];
    void zBot;
  }
  let length = 0; for (let i = 1; i < pts.length; i++) length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], pts[i][2] - pts[i - 1][2]);
  return { pts, length, drop: pts.length ? pts[0][2] - pts[pts.length - 1][2] : 0, benches, flags, grade, width };
}
const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a / 2; };
const bbox = (p) => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; };

/**
 * The grid of nodes over the pit and `margin` cells around it, with the pit cut into the ground: a node's height is the lower of the ground there and the
 * average of its (up to four) neighbouring columns, a mined column giving its floor and an unmined one the ground. So the wall slopes over one cell, the way
 * the block pit really steps. `groundAt(x, y)` gives the ground height (a number) or null where the ground is not known; such nodes are left out.
 * `dug`: the volume (m³) between the ground and the pit surface over the footprint, and `belowTop`: the model's top is lower than the ground at the rim.
 */
export function cutNodes(model, mined, groundAt, { margin = 2 } = {}) {
  const { nx, ny, size, origin } = model, floor = columnFloors(model, mined), nodes = [];
  const topZ = origin[2] + model.nz * size[2];
  const g = (x, y) => { const z = groundAt(x, y); return Number.isFinite(z) ? z : null; };
  let dug = 0, belowTop = false;
  const col = (i, j, x, y, gz) => (i >= 0 && j >= 0 && i < nx && j < ny && Number.isFinite(floor[i + nx * j]) ? Math.min(gz, floor[i + nx * j]) : gz);
  for (let b = -margin; b <= ny + margin; b++) for (let a = -margin; a <= nx + margin; a++) {
    const x = origin[0] + a * size[0], y = origin[1] + b * size[1], gz = g(x, y); if (gz === null) continue;
    const vals = [col(a - 1, b - 1, x, y, gz), col(a, b - 1, x, y, gz), col(a - 1, b, x, y, gz), col(a, b, x, y, gz)];
    const z = Math.min(gz, vals.reduce((s, v) => s + v, 0) / 4);
    nodes.push({ x, y, z, ground: gz, a, b });
    if (gz - z > 1e-9) { /* counted per cell below */ }
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (!Number.isFinite(floor[i + nx * j])) continue;
    const cx = origin[0] + (i + 0.5) * size[0], cy = origin[1] + (j + 0.5) * size[1], gz = g(cx, cy);
    if (gz === null) continue;
    dug += Math.max(0, gz - Math.min(gz, floor[i + nx * j])) * size[0] * size[1];
    if (gz - topZ > size[2] + 1e-9) belowTop = true;
  }
  return { nodes, box: { x0: origin[0] - margin * size[0], y0: origin[1] - margin * size[1], x1: origin[0] + (nx + margin) * size[0], y1: origin[1] + (ny + margin) * size[1] }, dug, belowTop, nx: nx + 2 * margin + 1, ny: ny + 2 * margin + 1, margin };
}
