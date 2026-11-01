/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — TrussCraft's adapter for PartCraft (add-on API 1.1: api.model.addBodies). Trusses and whole sets become display bodies in the 3D
 * viewport: every timber piece is a closed mesh body in the species colour, placed as one undo step per group of up to 5000 pieces. The roof
 * outline is typed, or taken from the selected sketch (its largest closed loop). Bodies are display bodies: not part of the part's solid, so
 * no boolean, mass, STEP or pick — the set leaves as STL / OBJ / CSV / jig drawing through the add-on's exports. Axes: plan (x, y, up z)
 * becomes PartCraft's world (x, z, -y), Y up, mm.
 */
import { buildBodies } from './lib/bodies.js';
import { profile } from '../../sketch.js';

const PER_GROUP = 5000;
const GROUP = 'trusses';
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return Math.abs(s / 2); };

export function makeHost(api, { t }) {
  const canPlace = !!(api.model && typeof api.model.addBodies === 'function');
  const mine = () => (canPlace ? api.model.bodies().filter((g) => g.group === GROUP || g.group.startsWith(GROUP + '-')) : []);
  return {
    id: 'partcraft',
    roofs: () => [],
    canPlace,
    placeKey: 'h.partcraft.place',
    async place({ layout, designFor, z0, speciesId }) {
      const bodies = buildBodies(layout, designFor, { z0, speciesId });
      if (!bodies.length) throw new Error(t('h.partcraft.none'));
      const mapped = bodies.map((b) => {
        const positions = []; for (let i = 0; i < b.positions.length; i += 3) positions.push(b.positions[i], b.positions[i + 2], -b.positions[i + 1]);
        return { name: b.name, color: b.color, mesh: { positions, indices: b.indices } };
      });
      const n = Math.ceil(mapped.length / PER_GROUP), keep = new Set();
      for (let i = 0; i < n; i++) {
        const id = i === 0 ? GROUP : GROUP + '-' + (i + 1);
        keep.add(id);
        api.model.addBodies(id, mapped.slice(i * PER_GROUP, (i + 1) * PER_GROUP), { name: 'TrussCraft', label: t('h.partcraft.undo'), fit: i === 0 });
      }
      for (const g of mine()) if (!keep.has(g.group)) api.model.removeBodies(g.group, { label: t('h.partcraft.undo') });
      return mapped.length;
    },
    async clear() { let any = false; for (const g of mine()) any = api.model.removeBodies(g.group, { label: t('h.partcraft.undo') }) || any; return any; },
    pickKey: 'h.partcraft.pick',
    pickOutline() {
      const f = api.selection && api.selection.feature ? api.selection.feature() : null;
      if (!f || f.type !== 'sketch' || !f.sketch) throw new Error(t('h.partcraft.nosketch'));
      const r = profile(f.sketch, 32);
      if (r.error) throw new Error(r.error);
      const loop = (r.loops || []).slice().sort((a, b) => area(b) - area(a))[0];
      if (!loop || loop.length < 3) throw new Error(t('h.partcraft.noloop'));
      return loop.map((p) => [p[0], p[1]]);
    },
    limits: () => [t('h.partcraft.limit.bodies'), t('h.partcraft.limit.roofs')],
  };
}
