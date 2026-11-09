/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vcarve.js — V-carving closed outlines (lib/carve). DOM-free. Millimetres.
 *   vcarve(loops, { angle, maxDepth, res, clear, ridgeTol, tol }) → { ops, stats, field }
 *     loops      closed outlines, even-odd (a letter's counter is a loop inside a loop)
 *     angle      the V-bit's included angle in degrees (default 60), half of it sets how deep a width needs: depth = distance to the edge / tan(angle / 2)
 *     maxDepth   the deepest the tip may go (default 3 mm). Where the shape is wider than 2 × maxDepth × tan(angle / 2) the floor is flat at maxDepth
 *     clear      how that flat floor is cleared: { mode: 'endmill', dia, stepover } (a flat mill first: contours inward, then the V-bit trims the walls),
 *                { mode: 'vbit' } (the V-bit itself in contours, many passes) or { mode: 'none' } (the V-bit only follows the walls: the floor is left standing)
 *     ridgeTol   the ridge a V-bit leaves between its passes when it clears, in mm (default 0.15)
 *     res, tol   the grid (mm, default size / 2000 but at least 0.05) and how straight a path may be made (default 0.02 mm)
 *   ops = [{ id: 'clear' | 'vcarve', tool: { type: 'flat', dia } | { type: 'v', angle }, paths: [[[x, y, z]…]] }]  z ≤ 0 is below the surface.
 *
 * How: one pass of the V-bit along the shape's medial axis (the line equally far from two edges) with the tip at distance-to-edge / tan(angle / 2)
 * cuts walls that meet the edge exactly; the axis comes from a distance field on a grid and every point of it is then moved onto the true bisector
 * of its two nearest edges, so the depth does not depend on the grid. Where the shape is wider than the flat depth the walls are a contour at that
 * distance at full depth; the floor between is the clearing.
 */
import { makeField, nearest } from './field.js';
import { medialAxis } from './ridge.js';
import { contours } from './contour.js';
import { simplify, orderPaths, pathLength, bounds } from './geom.js';

export const V_DEFAULTS = { angle: 60, maxDepth: 3, ridgeTol: 0.15, tol: 0.02, clear: { mode: 'endmill', dia: 6, stepover: 0.6 } };

/** The point of the medial axis near (x, y): moved onto the line equally far from its two nearest edges. → [x, y, d] */
export function polish(F, x, y, iterations = 6) {
  const segs = F.segs;
  let q = [x, y];
  for (let it = 0; it < iterations; it++) {
    let b1 = null;
    for (let k = 0; k < segs.length; k++) {
      const c = foot(segs[k], q);
      if (!b1 || c.d < b1.d) b1 = { ...c, k };
    }
    if (!b1 || !(b1.d > 0)) break;
    const u = [(b1.x - q[0]) / b1.d, (b1.y - q[1]) / b1.d];
    let b2 = null;
    for (let k = 0; k < segs.length; k++) {
      const c = foot(segs[k], q);
      if (c.d < b1.d * 0.999 || (c.x - q[0]) * u[0] + (c.y - q[1]) * u[1] > 0.2 * c.d) continue;   // the same side: not the one across
      if (!b2 || c.d < b2.d) b2 = c;
    }
    if (!b2) break;
    // moving away from the first edge by delta lengthens d1 by delta and changes d2 by delta * (u . v), v = the way to the second foot: equalise them
    const v = [(b2.x - q[0]) / b2.d, (b2.y - q[1]) / b2.d];
    const delta = (b2.d - b1.d) / (1 - (u[0] * v[0] + u[1] * v[1]));
    if (Math.abs(delta) < 1e-6) break;
    q = [q[0] - u[0] * delta, q[1] - u[1] * delta];
  }
  const n = nearest(F, q[0], q[1]);
  return [q[0], q[1], n.d];
}
function foot(e, q) {
  const dx = e[2] - e[0], dy = e[3] - e[1], L2 = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, L2 > 0 ? ((q[0] - e[0]) * dx + (q[1] - e[1]) * dy) / L2 : 0));
  const x = e[0] + t * dx, y = e[1] + t * dy;
  return { x, y, d: Math.hypot(x - q[0], y - q[1]) };
}

export function vcarve(loops, o = {}) {
  const angle = Number(o.angle) > 5 && Number(o.angle) < 170 ? Number(o.angle) : V_DEFAULTS.angle;
  const maxDepth = Number(o.maxDepth) > 0 ? Number(o.maxDepth) : V_DEFAULTS.maxDepth;
  const tol = Number(o.tol) >= 0 ? Number(o.tol) : V_DEFAULTS.tol;
  const ridgeTol = Number(o.ridgeTol) > 0 ? Number(o.ridgeTol) : V_DEFAULTS.ridgeTol;
  const clear = { ...V_DEFAULTS.clear, ...(o.clear || {}) };
  const closedLoops = (loops || []).filter((l) => Array.isArray(l) && l.length >= 3);
  if (!closedLoops.length) throw Object.assign(new Error('carve.err.noshape'), { key: 'carve.err.noshape' });
  const tanH = Math.tan((angle * Math.PI) / 360), dflat = maxDepth * tanH;
  let cutAt = dflat;   // set once the grid is known: a cell more than the flat depth counts as wide
  const F = makeField(closedLoops, { res: o.res });
  cutAt = dflat + F.res;
  const zOf = (d) => -Math.min(d / tanH, maxDepth);
  const warnings = [];

  // 1. the medial axis, polished, cut where the shape is wider than the flat depth
  const vpaths = [];
  for (const a of medialAxis(F)) {
    const pts = a.pts.map((p) => polish(F, p[0], p[1]));
    let run = [];
    const flush = () => { if (run.length) { vpaths.push(run); run = []; } };
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], inn = p[2] <= cutAt;
      if (inn) { run.push(p); continue; }
      const prev = pts[i - 1];
      if (prev && prev[2] <= cutAt) { const t = (cutAt - prev[2]) / (p[2] - prev[2]); run.push([prev[0] + t * (p[0] - prev[0]), prev[1] + t * (p[1] - prev[1]), cutAt]); }
      flush();
      const nxt = pts[i + 1];
      if (nxt && nxt[2] <= cutAt) { const t = (cutAt - p[2]) / (nxt[2] - p[2]); run.push([p[0] + t * (nxt[0] - p[0]), p[1] + t * (nxt[1] - p[1]), cutAt]); }
    }
    flush();
  }
  const withZ = (pts) => pts.map((p) => [p[0], p[1], zOf(p[2])]);
  const vzs = vpaths.map((p) => simplify(withZ(p), Math.max(tol, 0.005)));

  // 2. where the shape is wider than the flat depth: the wall, a contour at that distance at full depth
  const wide = F.max > cutAt;
  const level = (L) => contours(F.dist, F.w, F.h, L, { x0: F.x0, y0: F.y0, res: F.res }).map((c) => (c.closed ? c.pts.concat([c.pts[0]]) : c.pts));
  const wall = [];
  const flatPaths = [];
  const vclear = [];
  if (wide) {
    for (const c of level(dflat)) wall.push(simplify(c.map((p) => [p[0], p[1], -maxDepth]), Math.max(tol, 0.005)));
    // 3. the floor
    if (clear.mode === 'endmill' && clear.dia > 0) {
      const rf = clear.dia / 2, step = Math.max(0.05, clear.dia * Math.min(0.95, Math.max(0.1, clear.stepover)));
      if (F.max < dflat + rf) warnings.push('carve.warn.narrowfloor');
      const first = dflat + rf + 0.5 * F.res;
      let last = -Infinity;
      for (let L = first, n = 0; L <= F.max && n < 2000; L += step, n++) { for (const c of level(L)) flatPaths.push(simplify(c.map((p) => [p[0], p[1], -maxDepth]), Math.max(tol, 0.005))); last = L; }
      if (last + rf < F.max - 0.25 * F.res) {   // the last pass stops short of the ridge: one more, with its edge on the ridge's top
        const L = Math.max(first, F.max - 0.8 * rf);
        for (const c of level(L)) flatPaths.push(simplify(c.map((p) => [p[0], p[1], -maxDepth]), Math.max(tol, 0.005)));
      }
      // what the mill leaves next to the wall (a strip as wide as its radius) is trimmed by the V-bit at the floor's depth
      const sv = Math.max(0.02, 2 * ridgeTol * tanH);
      for (let L = dflat + sv, n = 0; L < dflat + rf + sv && L <= F.max && n < 500; L += sv, n++) for (const c of level(L)) vclear.push(simplify(c.map((p) => [p[0], p[1], -maxDepth]), Math.max(tol, 0.005)));
    } else if (clear.mode === 'vbit') {
      const sv = Math.max(0.02, 2 * ridgeTol * tanH), count = Math.ceil((F.max - dflat) / sv);
      if (count > 400) throw Object.assign(new Error('carve.err.manypasses'), { key: 'carve.err.manypasses', count });
      for (let L = dflat + sv; L <= F.max; L += sv) for (const c of level(L)) vclear.push(simplify(c.map((p) => [p[0], p[1], -maxDepth]), Math.max(tol, 0.005)));
    } else warnings.push('carve.warn.floor');
  }
  const ops = [];
  if (flatPaths.length) ops.push({ id: 'clear', tool: { type: 'flat', dia: clear.dia }, paths: orderPaths(flatPaths.filter((p) => p.length > 1).sort((a, b) => b[0][2] - a[0][2]), [0, 0]) });
  const vAll = [...vclear, ...wall, ...vzs].filter((p) => p.length >= 1);
  ops.push({ id: 'vcarve', tool: { type: 'v', angle }, paths: orderPaths(vAll, [0, 0]) });
  const total = ops.reduce((s, op) => s + op.paths.reduce((t, p) => t + pathLength(p), 0), 0);
  return { ops, field: F, stats: { angle, maxDepth, dflat, inradius: F.max, deepest: Math.min(0, ...vAll.flat().map((p) => p[2])), wide, passes: ops.map((op) => ({ id: op.id, n: op.paths.length })), length: total, warnings, res: F.res, bounds: bounds(closedLoops) } };
}
