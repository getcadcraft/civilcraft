/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout.js — where the luminaires go (0.9 LD.3): an even grid, a row, or a plan for a target lux. DOM-free.
 *   gridLayout(room, photo, nx, ny, { z, aim }) → { luminaires, nx, ny }     nx × ny equal cells over the room's bounding box, one luminaire in the middle of each cell that is inside the outline
 *   rowLayout(room, photo, rows, perRow, { z, along }) → same                 rows of luminaires parallel to x ('x') or y ('y'), evenly spread
 *   planLayout({ room, photo, targetLux, llf, uo, maxCount }) → { ok, nx, ny, count, em, uo, luminaires, tried }     the smallest even grid that reaches the target on the workplane
 */
import { prepare, solve, workplane, inside, bbox, polyArea, autoSpacing, cleanRoom } from './calc.js';
import { gridPoints, stats } from './photometry.js';

const lum = (photo, x, y, z, aim, rot) => ({ photo, p: [x, y, z], aim: aim || [0, 0, -1], rot: rot || 0 });
export function mountZ(room, suspension = 0) { return room.height - Math.max(0, suspension); }

export function gridLayout(roomIn, photo, nx, ny, { z = null, aim = null, rot = 0 } = {}) {
  const room = cleanRoom(roomIn), bb = bbox(room.polygon), zz = z ?? room.height, out = [];
  nx = Math.max(1, Math.round(nx)); ny = Math.max(1, Math.round(ny));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const x = bb.x0 + (bb.x1 - bb.x0) * (i + 0.5) / nx, y = bb.y0 + (bb.y1 - bb.y0) * (j + 0.5) / ny;
    if (inside(room.polygon, x, y)) out.push(lum(photo, x, y, zz, aim, rot));
  }
  return { luminaires: out, nx, ny };
}
export function rowLayout(roomIn, photo, rows, perRow, { z = null, along = 'x', aim = null } = {}) {
  const room = cleanRoom(roomIn), bb = bbox(room.polygon), zz = z ?? room.height, out = [];
  rows = Math.max(1, Math.round(rows)); perRow = Math.max(1, Math.round(perRow));
  for (let r = 0; r < rows; r++) for (let k = 0; k < perRow; k++) {
    const u = (k + 0.5) / perRow, v = (r + 0.5) / rows;
    const x = along === 'x' ? bb.x0 + (bb.x1 - bb.x0) * u : bb.x0 + (bb.x1 - bb.x0) * v, y = along === 'x' ? bb.y0 + (bb.y1 - bb.y0) * v : bb.y0 + (bb.y1 - bb.y0) * u;
    if (inside(room.polygon, x, y)) out.push(lum(photo, x, y, zz, aim, along === 'x' ? 0 : 90));
  }
  return { luminaires: out, nx: along === 'x' ? perRow : rows, ny: along === 'x' ? rows : perRow };
}

/** The smallest even grid (by count) that reaches `targetLux` (maintained, mean on the workplane) and `uo` (min/avg, 0 = ignore). Aspect of a cell kept between 0.6 and 1.7. */
export function planLayout({ room: roomIn, photo, targetLux, llf = 0.8, uo = 0, maxCount = 400, z = null }) {
  const room = cleanRoom(roomIn), prep = prepare(room, { maxPatches: 450 }), bb = bbox(room.polygon), W = bb.x1 - bb.x0, D = bb.y1 - bb.y0;
  if (!(targetLux > 0) || !(photo && photo.lumens > 0)) return { ok: false, key: 'err.plan', tried: 0 };
  const g = gridPoints(room.polygon, { spacing: Math.max(autoSpacing(room.polygon), 400), height: room.workplane, margin: room.margin });
  const pts = g.points.length ? g.points : gridPoints(room.polygon, { spacing: 400, height: room.workplane, margin: 0 }).points;
  const cands = [];
  for (let nx = 1; nx <= 40; nx++) for (let ny = 1; ny <= 40; ny++) {
    const r = (W / nx) / (D / ny);
    if (r < 0.6 || r > 1.7 || nx * ny > maxCount) continue;
    cands.push([nx, ny]);
  }
  cands.sort((a, b) => a[0] * a[1] - b[0] * b[1] || Math.abs(Math.log((W / a[0]) / (D / a[1]))) - Math.abs(Math.log((W / b[0]) / (D / b[1]))));
  const est = (targetLux * polyArea(room.polygon)) / (llf * photo.lumens * 0.8);     // a generous utilance of 0.8 gives a floor under the search
  let tried = 0, best = null;
  for (const [nx, ny] of cands) {
    const n = nx * ny;
    if (n < Math.floor(est * 0.7)) continue;
    const L = gridLayout(room, photo, nx, ny, { z }).luminaires;
    if (!L.length) continue;
    tried++;
    const E = workplane(prep, solve(prep, L), L, pts).map((x) => x * llf), s = stats(E);
    best = { nx, ny, count: L.length, em: s.avg, uo: s.minAvg, luminaires: L };
    if (s.avg >= targetLux && (!(uo > 0) || s.minAvg >= uo)) return { ok: true, tried, ...best };
  }
  return { ok: false, key: 'err.plan.max', tried, best };
}
