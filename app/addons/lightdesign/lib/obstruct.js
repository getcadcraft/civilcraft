/* SPDX-License-Identifier: Apache-2.0 */
/**
 * obstruct.js — furniture, columns and partitions that block direct light (0.9 IL.7, session `adapters-09`). DOM-free. Clean room (rule 32): a ray against an
 * axis-aligned box is the textbook slab test.
 *
 * An obstacle is a box { x0, y0, x1, y1, z0, z1 } in millimetres (a thin box is a partition). The light of a luminaire reaches a point only when the straight
 * line between them crosses no obstacle. Only the DIRECT light is blocked: light that has bounced off a wall or the floor passes through the obstacles (the
 * calculation says so in its notes), so a room with big furniture reads a little too bright in its shadows, never too dark.
 *
 *   cleanObstacles(list) → [{ x0, y0, x1, y1, z0, z1 }]     corners in any order, non-numbers and flat boxes dropped, at most 500
 *   segmentHitsBox(p, q, box) → boolean                        the open segment p–q crosses the inside of the box (touching a face does not count)
 *   blocked(p, q, obstacles) → boolean
 *   directAt(luminaires, p, normal, obstacles) → lux at initial flux, luminaires hidden from p left out (no obstacles: the photometry's own sum)
 *   hiddenByObstacle(p, obstacles) → boolean                   p is inside a box (a point inside a column is not a place anyone works)
 */
import { illuminanceAt } from './photometry.js';

export const MAX_OBSTACLES = 500;
export function cleanObstacles(list) {
  const out = [];
  for (const o of Array.isArray(list) ? list : []) {
    if (!o) continue;
    const v = ['x0', 'y0', 'x1', 'y1', 'z0', 'z1'].map((k) => Number(o[k]));
    if (!v.every(Number.isFinite)) continue;
    const b = { x0: Math.min(v[0], v[2]), y0: Math.min(v[1], v[3]), x1: Math.max(v[0], v[2]), y1: Math.max(v[1], v[3]), z0: Math.min(v[4], v[5]), z1: Math.max(v[4], v[5]) };
    if (b.x1 - b.x0 < 1 || b.y1 - b.y0 < 1 || b.z1 - b.z0 < 1) continue;
    out.push(b);
    if (out.length >= MAX_OBSTACLES) break;
  }
  return out;
}

const EPS = 1e-9;
export function segmentHitsBox(p, q, b) {
  let t0 = 0, t1 = 1;
  const lo = [b.x0, b.y0, b.z0], hi = [b.x1, b.y1, b.z1];
  for (let k = 0; k < 3; k++) {
    const d = q[k] - p[k];
    if (Math.abs(d) < 1e-12) { if (p[k] <= lo[k] + EPS || p[k] >= hi[k] - EPS) return false; continue; }   // parallel to the slab: inside it or never
    let a = (lo[k] - p[k]) / d, c = (hi[k] - p[k]) / d;
    if (a > c) { const s = a; a = c; c = s; }
    if (a > t0) t0 = a;
    if (c < t1) t1 = c;
    if (t0 >= t1 - EPS) return false;   // empty or only a touch
  }
  return t1 - t0 > EPS;
}
export function blocked(p, q, obstacles) {
  if (!obstacles) return false;
  for (const b of obstacles) if (segmentHitsBox(p, q, b)) return true;
  return false;
}
export function directAt(luminaires, p, normal, obstacles) {
  if (!obstacles || !obstacles.length) return illuminanceAt(luminaires, p, normal, 1);
  let E = 0;
  for (const L of luminaires) if (!blocked(L.p, p, obstacles)) E += illuminanceAt([L], p, normal, 1);
  return E;
}
export function hiddenByObstacle(p, obstacles) {
  for (const b of obstacles || []) if (p[0] > b.x0 && p[0] < b.x1 && p[1] > b.y0 && p[1] < b.y1 && p[2] > b.z0 && p[2] < b.z1) return true;
  return false;
}
