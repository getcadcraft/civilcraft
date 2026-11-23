/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom2d.js — the plane-geometry helpers that the apps each typed again (0.10 PERF.74; tools/perf/quality-utils.mjs counts them). Pure functions,
 * no imports, no DOM. lib/geom2d is canonical; an app that needs one carries a byte copy made by `node tools/geom2d/sync.mjs <app>`; nobody
 * edits a copy.
 *
 *   pointInPolygon(x, y, pts)   even-odd ray cast over pts = [{x, y}, …] (the ring is closed by itself; the same arithmetic the 18 copies had,
 *                               so a point exactly on an edge answers as it always did: edges are half-open, bottom/left in, top/right out)
 *   pointInRing(x, y, ring)     the same ray cast over ring = [[x, y], …] (0.11 PERF.74: the array-point copies in BimCraft, ModelCraft, PartCraft)
 *   signedArea(pts)             shoelace area of [{x, y}, …], counter-clockwise positive, the sum taken from point 0 in order (as the copies did)
 *   ringArea(ring)              the same over [[x, y], …]
 * Array vectors (dot, cross, length, …) are in geom-vec.js next to this file.
 */

/** Is (x, y) inside the polygon `pts` ([{x, y}, …], not repeated at the end)? Fewer than 3 points is never inside. */
export function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const p = pts[i], q = pts[j];
    if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) inside = !inside;
  }
  return inside;
}

/** pointInPolygon over [[x, y], …] points: the same arithmetic, the same edge answers. */
export function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const p = ring[i], q = ring[j];
    if ((p[1] > y) !== (q[1] > y) && x < ((q[0] - p[0]) * (y - p[1])) / (q[1] - p[1]) + p[0]) inside = !inside;
  }
  return inside;
}

/** Signed shoelace area of [{x, y}, …] (counter-clockwise positive). The terms are added from point 0 in order, so the answer is bit for bit the copies'. */
export function signedArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    s += p.x * q.y - p.y * q.x;
  }
  return s / 2;
}

/** signedArea over [[x, y], …]. */
export function ringArea(ring) {
  let s = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length];
    s += p[0] * q[1] - p[1] * q[0];
  }
  return s / 2;
}
