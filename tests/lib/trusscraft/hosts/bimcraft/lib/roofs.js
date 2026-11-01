/* SPDX-License-Identifier: Apache-2.0 */
/**
 * roofs.js — the roofs of the open BimCraft model as truss layouts' input. A bundled add-on may use the app's own modules.
 *   readRoofsFrom(w) → [{ guid, name, pitch, overhang, gables, outline (plan mm, the building's outer faces), plan (BimCraft's own roof geometry: faces, ridge / hip /
 *                         valley lines), top (mm above the walls' storey), storey (GlobalId), level (name) }]
 *   typedRoof — re-exported from roofs-typed.js (shared by every host)
 * Run readRoofsFrom inside api.model.read(fn) / model.write(label, fn). Roofs whose walls are gone (no outline at their seed) are left out.
 */
import { readDerived, storeyLoops } from '../../../model-slabs.js';
import { readLevels } from '../../../model-levels.js';
import { loopAt } from '../../../model-rooms.js';
import { roofGeometry, edgeKinds } from '../../../res-roof.js';

export function readRoofsFrom(w) {
  const out = [], levels = readLevels(w);
  for (const r of readDerived(w).roofs) {
    const lv = levels.find((l) => l.guid === r.walls);
    if (!lv) continue;
    let L;
    try { L = storeyLoops(w, lv.id); } catch { continue; }
    const loop = loopAt(L.outlines, r.seed);
    if (!loop) continue;
    const top = L.walls.reduce((m, x) => Math.max(m, x.baseOffset + x.height), 0) || lv.height;
    let plan = null;
    try {
      const kinds = edgeKinds(loop.poly, L.walls, r), g = roofGeometry(loop.poly, kinds, { thickness: r.thickness, plate: 0, fascia: r.fascia, soffit: !!r.soffit });
      plan = g.error ? null : g;
    } catch { plan = null; }
    out.push({ guid: r.guid, name: 'Roof ' + (out.length + 1), pitch: r.pitch, overhang: r.overhang, gables: r.gables, outline: loop.poly.map((q) => [q[0], q[1]]), plan, top, storey: lv.guid, level: lv.name || '' });
  }
  return out;
}

export { typedRoof } from './roofs-typed.js';   // the typed-corners roof is shared by every host
