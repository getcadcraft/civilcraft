/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — TrussCraft's adapter for ModelCraft. A bundled add-on may use the app's modules and the open model (window.modelcraft). Every
 * truss of the set becomes ONE mesh object (its timber pieces, closed boxes) in a group "TrussCraft", painted in the species colour, placed
 * in one undo step; ModelCraft's own export then writes the set as STL / OBJ / glTF too. The roof outline is typed, or taken from the
 * selected face (its outer loop, in plan). Units: ModelCraft works in metres, z up; the plan is in mm, so positions are divided by 1000.
 */
import { buildBodies } from './lib/bodies.js';

const NAME = 'TrussCraft';
const ident = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const M = () => (typeof window !== 'undefined' && window.modelcraft) || null;
const hex = (c) => c;

export function makeHost(api, { t }) {
  const canPlace = !!(M() && M().model);
  const oldGroups = (m) => [...m.root.insts].filter(([, i]) => (m.defs.get(i.def) || {}).name === NAME).map(([id]) => id);
  return {
    id: 'modelcraft',
    roofs: () => [],
    canPlace,
    placeKey: 'h.modelcraft.place',
    async place({ layout, designFor, z0, speciesId }) {
      const mc = M();
      if (!mc || !mc.model) throw new Error(t('h.modelcraft.nomodel'));
      const bodies = buildBodies(layout, designFor, { z0, speciesId });
      if (!bodies.length) throw new Error(t('h.modelcraft.none'));
      const { meshFromTris } = await import('../../print-solid.js');
      const byTruss = new Map();
      for (const b of bodies) { if (!byTruss.has(b.truss)) byTruss.set(b.truss, []); byTruss.get(b.truss).push(b); }
      const model = mc.model;
      return model.change(t('h.modelcraft.undo'), (m) => {
        for (const id of oldGroups(m)) m.root.insts.delete(id);
        const grp = m.newDef('group', NAME);
        for (const [truss, list] of byTruss) {
          const tris = [];
          for (const b of list) for (let i = 0; i < b.indices.length; i += 3) tris.push([0, 1, 2].map((k) => { const j = b.indices[i + k] * 3; return [b.positions[j] / 1000, b.positions[j + 1] / 1000, b.positions[j + 2] / 1000]; }));
          const md = m.newMeshDef(meshFromTris(tris, { sharpDeg: 30, weld: 1e-9 }), truss);
          const iid = m.place(grp, md.id, ident());
          grp.insts.get(iid).color = hex(list[0].color);
        }
        m.place(m.root, grp.id, ident());
        m.purge?.();
        return bodies.length;
      });
    },
    async clear() {
      const mc = M();
      if (!mc || !mc.model) return false;
      let n = 0;
      mc.model.change(t('h.modelcraft.undo'), (m) => { for (const id of oldGroups(m)) { m.root.insts.delete(id); n++; } m.purge?.(); });
      return n > 0;
    },
    pickKey: 'h.modelcraft.pick',
    pickOutline() {
      const mc = M();
      const sel = mc && mc.host && mc.host.sel ? mc.host.sel.filter((x) => x.t === 'f') : [];
      if (!sel.length) throw new Error(t('h.modelcraft.noface'));
      const ctx = mc.model.context(mc.host.path || []);
      const f = ctx && ctx.def.faces.get(sel[0].id);
      if (!f) throw new Error(t('h.modelcraft.noface'));
      const m = ctx.m, P = (p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]];
      const pts = f.loops[0].map((v) => P(ctx.def.verts.get(v))).map((p) => [p[0] * 1000, p[1] * 1000]);
      if (pts.length < 3) throw new Error(t('h.modelcraft.noface'));
      return pts;
    },
    limits: () => [t('h.modelcraft.limit.meshes'), t('h.modelcraft.limit.roofs')],
  };
}
