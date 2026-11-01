/* SPDX-License-Identifier: Apache-2.0 */
/**
 * reproject-batch.js — the inner loop of reprojecting many points between two coordinate systems (0.8 D8.9 item 3, session
 * `d89b_PART_3`). No imports, so the same file runs on the page and inside a Worker (a worker does not see the page's import map:
 * the caller hands in the proj4 function). lib/crs-georef is canonical; `node tools/crs-georef/sync.mjs` copies it.
 *
 *   reprojectBatch(proj4, fromDef, toDef, xy, { start = 0, end, zFactor }) → bad
 *     xy = Float64Array [x0, y0, x1, y1, …] in the FROM system's unit, changed in place to the TO system's unit.
 *     A point that does not project (outside what the projection can carry) is set to NaN, NaN; `bad` counts them.
 *     z (optional third argument form below) is not touched here: the caller scales heights by the unit factor.
 */
export function reprojectBatch(proj4, fromDef, toDef, xy, { start = 0, end = xy.length / 2 } = {}) {
  const conv = proj4(fromDef, toDef);
  let bad = 0;
  const p = [0, 0];
  for (let i = start; i < end; i++) {
    p[0] = xy[2 * i]; p[1] = xy[2 * i + 1];
    let q = null;
    try { q = conv.forward(p); } catch (e) { q = null; }
    if (q && Number.isFinite(q[0]) && Number.isFinite(q[1])) { xy[2 * i] = q[0]; xy[2 * i + 1] = q[1]; } else { xy[2 * i] = NaN; xy[2 * i + 1] = NaN; bad++; }
  }
  return bad;
}
