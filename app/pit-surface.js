/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry only, no strings. */
/**
 * pit-surface.js — an open pit cut into a ground surface (0.8 EG.27, civil_PART_4). The glue between a saved pit (geo.pits), the ground (tin.js Surface) and
 * pit-geom.js: the ground's own points outside the pit, the grid of cut nodes inside it, one new triangulated surface. The pit's walls slope over one block (the
 * way the block pit steps); the ground's breaklines are not carried over. Lengths in the project unit, the block model in metres inside (geo-run.js).
 *
 *   pitGround(ground, pit, units, { mined?, model? }) → { surface, dug (volume, project unit³), belowTop (bool), notes[] } | null
 */
import { buildSurface, surfaceFromFaces } from './tin.js';
import { cutNodes } from './pit-geom.js';
import { runPit, toM } from './geo-run.js';

export function pitGround(ground, pit, units, run = null) {
  if (!ground) return null;
  const k = toM(units), r = run || runPit(pit, units);
  const at = (x, y) => { const z = ground.elevationAt(x / k, y / k, 1e-6); return Number.isFinite(z) ? z * k : null; };
  const cut = cutNodes(r.model, r.result.mined, at, { margin: 2 });
  const b = cut.box, inBox = (x, y) => x >= b.x0 / k - 1e-9 && x <= b.x1 / k + 1e-9 && y >= b.y0 / k - 1e-9 && y <= b.y1 / k + 1e-9;
  const pts = [];
  const used = ground.usedVertices();
  for (let i = 0; i < ground.X.length; i++) if (used[i]) { const x = ground.X[i] + ground.ox, y = ground.Y[i] + ground.oy; if (!inBox(x, y)) pts.push({ x, y, z: ground.Z[i] }); }
  for (const n of cut.nodes) pts.push({ x: n.x / k, y: n.y / k, z: n.z / k });
  const built = buildSurface({ points: pts });
  if (!built.surface) return null;
  // the triangulation fills the hull: keep only triangles over the old ground (or over the pit's box, where the ground is known)
  const s = built.surface, faces = [], P = [];
  for (let i = 0; i < s.X.length; i++) P.push({ x: s.X[i] + s.ox, y: s.Y[i] + s.oy, z: s.Z[i] });
  for (let t = 0; t < s.tris.length; t += 3) {
    const a = s.tris[t], c = s.tris[t + 1], d = s.tris[t + 2], cx = (P[a].x + P[c].x + P[d].x) / 3, cy = (P[a].y + P[c].y + P[d].y) / 3;
    if (ground.elevationAt(cx, cy, 1e-6) !== null) faces.push([a, c, d]);
  }
  const out = surfaceFromFaces({ pts: P, faces });
  if (!out.surface) return null;
  return { surface: out.surface, dug: cut.dug / (k * k * k), belowTop: cut.belowTop, nodes: cut.nodes.length };
}
