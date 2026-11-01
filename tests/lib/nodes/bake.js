/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: no words here. */
/**
 * bake.js — cc-nodes (0.8, session oltl2-c_PART_3; DC.54): the meshes a graph shows, as plain triangles a host can turn into its own geometry.
 * Surfaces are tessellated with cc-nurbs (the same tolerance the display uses), meshes pass through; points and curves are not solids and are
 * counted, not baked. Millimetres in, millimetres out (the host scales). DOM-free; cc-nurbs is handed in like display.js does.
 *
 *   bakeMeshes(N, shown, { tol }) → { meshes: [{ id, port, name, positions: number[], indices: number[], triangles }], skipped: { points, curves }, triangles }
 *   shown = Evaluator.run().shown. A list value gives one mesh per item. Non-finite coordinates and out-of-range indices drop that mesh.
 */
const MAX_TRIANGLES = 400000;

export function bakeMeshes(N, shown, { tol = 0.2 } = {}) {
  const meshes = [], skipped = { points: 0, curves: 0 };
  let triangles = 0;
  for (const { id, port, value } of shown || []) {
    let k = 0;
    const one = (x) => {
      if (Array.isArray(x)) { x.forEach(one); return; }
      if (x instanceof Float64Array && x.length === 3) { skipped.points++; return; }
      if (x && Array.isArray(x.knots) && Array.isArray(x.cvs)) { skipped.curves++; return; }
      let pos = null, idx = null;
      if (x && Array.isArray(x.knotsU)) { const t = N.surface.tessellate(x, { tol }); pos = t.positions; idx = t.indices; }
      else if (x && x.positions && x.indices) { pos = x.positions; idx = x.indices; }
      if (!pos || !idx || idx.length < 3) return;
      const n = Math.floor(pos.length / 3);
      let good = pos.length % 3 === 0;
      for (let i = 0; good && i < pos.length; i++) if (!Number.isFinite(pos[i])) good = false;
      for (let i = 0; good && i < idx.length; i++) if (!(idx[i] >= 0 && idx[i] < n)) good = false;
      if (!good || triangles + Math.floor(idx.length / 3) > MAX_TRIANGLES) return;
      const t = Math.floor(idx.length / 3);
      triangles += t;
      meshes.push({ id, port, name: id + (port && port !== 'out' ? '.' + port : '') + (k++ ? '-' + k : ''), positions: Array.from(pos), indices: Array.from(idx).slice(0, t * 3), triangles: t });
    };
    one(value);
  }
  return { meshes, skipped, triangles };
}
