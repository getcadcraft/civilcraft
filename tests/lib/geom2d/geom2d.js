/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom2d.js — the plane-geometry helpers that the apps each typed again (0.10 PERF.74; tools/perf/quality-utils.mjs counts them). Pure functions,
 * no imports, no DOM. lib/geom2d is canonical; an app that needs one carries a byte copy made by `node tools/geom2d/sync.mjs <app>`; nobody
 * edits a copy.
 *
 *   pointInPolygon(x, y, pts)   even-odd ray cast over pts = [{x, y}, …] (the ring is closed by itself; the same arithmetic the 18 copies had,
 *                               so a point exactly on an edge answers as it always did: edges are half-open, bottom/left in, top/right out)
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
