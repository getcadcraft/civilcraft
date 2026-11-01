/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/model.js — the ModelCraft adapter of CabinetCraft (copied to modelcraft/dev/addons/cabinetcraft/host.js by tools/cabinetcraft/sync.mjs). 0.8 DC.117, session `cabinetcraft_hosts`.
 *
 * What ModelCraft does with the cabinets: they become BODIES in the model — a group "<job name>" at the top level (tagged "CabinetCraft / cabinets"), one sub-group per cabinet, filler,
 * end panel and countertop, each part a coloured prism of real faces and edges (colour = the material pick's display tint). So they render, they are selectable and measurable, they can be hidden
 * with their tag, and File › Export writes them to OBJ, glTF, STL … with the rest of the model. One placement is ONE undo step (`api.model.addBodies`, add-on API 1.4; ModelCraft's
 * `addon-bodies-mc.js`); placing again replaces the group. The room can be the floor face you have selected (`api.model.rooms()`): its outline, and the starter doors and windows near its edge.
 * The cut list, the drawings and CSV are the panel's (Export, Drawings). What ModelCraft cannot do: G-code (a CAM export is PartCraft's), and the bodies are not parametric — placing again replaces them.
 * detect(api, { t }) → the host descriptor, or null when the app's api has no model host (no api.model.capabilities).
 */
import { cabinetElements } from './lib/elements.js';
import { HOST_CSS } from './lib/hoststyle.js';

export const GROUP = 'cabinets';

export function bodiesOf(els) {
  const out = [];
  for (const el of els) for (const p of el.pieces) out.push({ name: p.name, color: p.color, prism: { pts: p.pts, z0: p.z0, z1: p.z1 }, in: el.name });
  return out;
}

export function detect(api, { t }) {
  if (!api || !api.model || typeof api.model.capabilities !== 'function') return null;
  const caps = () => { try { return api.model.capabilities(); } catch { return []; } };
  let rooms = [];
  const count = () => { try { const g = api.model.bodies().find((x) => x.group === GROUP); return g ? g.count : 0; } catch { return 0; } };
  const host = {
    id: 'model', gcode: false, styles: HOST_CSS,
    room: {
      label: t('mod.room.title'), note: t('mod.room.note'),
      async list() {
        if (!caps().includes('rooms')) throw new Error(t('mod.room.unavailable'));
        rooms = await api.model.rooms();
        if (!rooms.length) throw new Error(t('mod.room.select'));
        return rooms.map((r, i) => ({ id: String(i), label: t('mod.room.row', { name: r.name || '', area: Math.round(r.area / 1e4) / 100, doors: r.doors.length, windows: r.windows.length }) }));
      },
      async read(id) {
        const r = rooms[Number(id)];
        if (!r) return null;
        return { name: r.name, z: r.z, pts: r.poly, openings: [...r.doors.map((d) => ({ kind: 'door', x: d.x, y: d.y, w: d.w })), ...r.windows.map((d) => ({ kind: 'window', x: d.x, y: d.y, w: d.w, sill: d.sill }))] };
      },
    },
    sections(ctx) {
      const can = caps().includes('bodies');
      const n = can ? count() : 0;
      return [{
        id: 'model-place', where: 'drawings', title: t('mod.place.title'), note: can ? t('mod.place.note') : t('mod.place.unavailable'),
        actions: can ? [
          { id: 'model-place', label: n ? t('mod.place.replace') : t('mod.place.do'), async run(c) {
            const s = c.project.site && c.project.site.host === 'model' ? c.project.site : { ox: 0, oy: 0, oz: 0 };
            const els = cabinetElements(c.build, { word: c.t });
            if (!els.length) return t('mod.place.empty');
            const bodies = bodiesOf(els);
            const k = await api.model.addBodies(GROUP, bodies, { name: c.project.name || t('name'), label: t('mod.place.label'), at: [s.ox, s.oy, s.oz] });
            return t('mod.place.done', { n: k, cabs: els.length });
          } },
          { id: 'model-remove', label: t('mod.remove'), disabled: !n, async run() { const was = await api.model.removeBodies(GROUP, { label: t('mod.remove.label') }); return was ? t('mod.removed') : t('mod.none'); } },
        ] : [],
        status: can ? (n ? t('mod.count', { n }) : t('mod.none')) : '',
      }];
    },
  };
  return host;
}
