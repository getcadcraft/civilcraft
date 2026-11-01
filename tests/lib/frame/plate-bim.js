/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate-bim.js — slabs and walls of a building model as plates in the frame model (0.8 SU.1056 step 2; owner question 3's default:
 * IfcSlab / IfcWall → plates, in BimCraft). DOM-free; imports plate-mesh.js. The app reads its elements (BimCraft: bimcraft/dev/analysis-bim.js
 * readFrameElements) into the plain shapes below; this module meshes them into `raw.plates` of the raw frame model (before cleanFrame),
 * merging plate nodes with the frame's nodes within 1 mm, so a slab on its beams and a wall on its slab are one structure.
 *
 *   addPlates(raw, { slabs, walls }, { fc = 28, size = 0, material? }) → { plates, nodes, skipped: [{ id, why }], warnings, quality }
 *     slabs: [{ id, ref?, outline: [[x, y]…], holes?: [[[x, y]…]…], z, t, points?: [[x, y]…] }]    z = the mid-surface height (mm)
 *     walls: [{ id, ref?, from: [x, y], to: [x, y], z0, z1, t, openings?: [{ u0, v0, u1, v1 }], points? }]   u along the wall, v up from z0
 *     size   the target plate size in mm (0 = the mesher's own choice); points are nodes to keep (columns under a slab)
 *   A concrete material (E = 4700 √f'c, ν = 0.2, 2400 kg/m³) is added to raw.materials unless `material` names one already there.
 *   An element the mesher cannot do (a self-crossing outline, too many plates) is skipped with its reason, never half-added.
 */
import { slabPlates, wallPlates, MESH_LIMIT } from './plate-mesh.js';

export function addPlates(raw, { slabs = [], walls = [] } = {}, { fc = 28, size = 0, material = null } = {}) {
  raw.materials = raw.materials || [];
  let mat = material && raw.materials.some((m) => m.id === material) ? material : null;
  if (!mat) {
    const E = 4700 * Math.sqrt(fc);
    mat = 'concrete-' + fc;
    if (!raw.materials.some((m) => m.id === mat)) raw.materials.push({ id: mat, name: "f'c " + fc + ' MPa', E, G: E / 2.4, rho: 2400 });
  }
  raw.nodes = raw.nodes || [];
  raw.plates = raw.plates || [];
  const skipped = [], warnings = [];
  let added = 0, nodes = 0, worst = null;
  const take = (id, ref, fn) => {
    // an element is all or nothing: the plates and nodes it made are taken back when it fails
    const n0 = raw.nodes.length, p0 = raw.plates.length;
    try {
      const r = fn();
      if (raw.plates.length - p0 + added > MESH_LIMIT) throw { code: 'too-many' };
      raw.plates.slice(p0).forEach((p) => { if (ref) p.from = { app: ref.app || 'bimcraft', ref: String(ref.ref || ref).slice(0, 60) }; });
      added += raw.plates.length - p0; nodes += r.nodes;
      for (const w of r.warnings || []) warnings.push({ id, ...(typeof w === 'string' ? { code: w } : w) });
      if (r.quality && (!worst || (r.quality.worst ?? 0) > (worst.worst ?? 0))) worst = r.quality;
    } catch (e) {
      raw.nodes.length = n0; raw.plates.length = p0;
      skipped.push({ id, why: e?.code || 'mesh-outline' });
    }
  };
  const seen = new Set();
  const uid = (prefix, id) => { let k = prefix + id; while (seen.has(k)) k += '_'; seen.add(k); return k; };
  for (const s of slabs) {
    const id = uid('slab-', s.id);
    take(id, s.ref ?? s.id, () => slabPlates(raw, { id, outline: s.outline, holes: s.holes || [], z: s.z, t: s.t, material: mat, size: size || s.size, points: s.points || [] }));
  }
  for (const w of walls) {
    const id = uid('wall-', w.id);
    take(id, w.ref ?? w.id, () => wallPlates(raw, { id, from: w.from, to: w.to, z0: w.z0, z1: w.z1, t: w.t, material: mat, size: size || w.size, openings: w.openings || [], points: w.points || [] }));
  }
  return { plates: added, nodes, skipped, warnings, quality: worst, material: mat };
}
