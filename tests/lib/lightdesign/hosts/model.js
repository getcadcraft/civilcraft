/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/model.js — the ModelCraft adapter of the Interior lighting design add-on (copied to modelcraft/dev/addons/lightdesign/host.js by tools/lightdesign/sync.mjs).
 * 0.11 IL.8, session `light-finish-11`. Same shape as hosts/cad.js and hosts/bim.js; ModelCraft's add-on API 1.4 model host gives it a room and display bodies.
 *
 *   detect(api, { t }) → the host, or null when the app's api has no model host with rooms (api.model.capabilities() lacks 'rooms')
 *   host.rooms() → [{ name, poly mm, area m², z mm }]   the room the SELECTED floor face makes (api.model.rooms(): ModelCraft's furnish-mc roomOfFace, as Furnish a room uses it);
 *       its windows come with it (windows [{ x, y, w, sill }], the height of a window is assumed as in BimCraft). No height: the panel's ceiling height is used.
 *   host.draw({ luminaires, result, room, cct }) → { n, surface }   ONE undo step (api.model.addBodies): a group "Interior lighting design / lightdesign" holding the luminaires as thin
 *       boxes of their luminous opening (a 300 mm square when the file gives none) just under the ceiling, coloured from the colour temperature, and the 3D lux surface (isolines.js
 *       luxSurface) as coloured mesh bodies over the workplane, its rise at most a fifth of the room's size, so it shows in ModelCraft's own 3D view, renders and exports with the model.
 *       Drawing again replaces the group. They are display bodies, not luminaires ModelCraft knows: nothing in ModelCraft lights the scene from them.
 *   host.erase() → n   removes the group     host.count() → bodies in it     host.start(app) → nothing (the panel is the interface)
 */
import { kelvinToHex } from './lib/night.js';
import { gridField, luxSurface } from './lib/isolines.js';

export const GROUP = 'lightdesign';

const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, '0')).join('');

/** The lux surface as mesh bodies (one per colour band, colours rounded to eighths so there are a few bodies, not one per triangle), in mm with z up, over the workplane. */
export function surfaceBodies(result, { name = 'Lux surface' } = {}) {
  const g = result.grid;
  if (!g || !g.nx || g.points.length < 9) return [];
  const s = luxSurface(gridField(result)), P = s.positions, C = s.colours, I = s.indices;
  const xs = result.room.polygon.map((q) => q[0]), ys = result.room.polygon.map((q) => q[1]), size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  let top = 0; for (let i = 2; i < P.length; i += 3) top = Math.max(top, P[i]);
  const rise = Math.min(1000, size / 5), k = top > 0 ? rise / top : 0, base = (result.room.workplane || 0) + 10;
  const bins = new Map();
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t], col = [0, 1, 2].map((j) => Math.round(((C[3 * I[t] + j] + C[3 * I[t + 1] + j] + C[3 * I[t + 2] + j]) / 3) * 8) / 8), key = hex(col);
    let b = bins.get(key);
    if (!b) bins.set(key, (b = { positions: [], indices: [], map: new Map() }));
    for (const v of [a, I[t + 1], I[t + 2]]) {
      if (!b.map.has(v)) { b.map.set(v, b.positions.length / 3); b.positions.push(Math.round(P[3 * v]), Math.round(P[3 * v + 1]), Math.round(base + P[3 * v + 2] * k)); }
      b.indices.push(b.map.get(v));
    }
  }
  return [...bins].map(([color, b]) => ({ name, color, mesh: { positions: b.positions, indices: b.indices }, in: name }));
}

/** The luminaires as thin boxes of their luminous opening, the top face `z` mm (their height) and 40 mm deep. */
export function luminaireBodies(luminaires, { cct = 3000, name = 'Luminaires' } = {}) {
  return luminaires.map((L, i) => {
    const p = L.photo || {}, w = p.width > 0 && p.width <= 3000 ? p.width : 300, l = p.length > 0 && p.length <= 3000 ? p.length : 300, [x, y, z] = L.p;
    return { name: name + ' ' + (i + 1), color: kelvinToHex(L.cct ?? cct), box: [x - w / 2, y - l / 2, z - 40, x + w / 2, y + l / 2, z], in: name };
  });
}

export function detect(api, { t }) {
  if (!api || !api.model || typeof api.model.capabilities !== 'function') return null;
  const caps = () => { try { return api.model.capabilities(); } catch { return []; } };
  if (!caps().includes('rooms')) return null;
  let last = [];
  const count = () => { try { const g = api.model.bodies().find((x) => x.group === GROUP); return g ? g.count : 0; } catch { return 0; } };
  const host = {
    id: 'model',
    noRoomsKey: 'mod.noroom',
    async rooms() {
      const rs = await api.model.rooms();
      last = (Array.isArray(rs) ? rs : []).filter((r) => r && Array.isArray(r.poly) && r.poly.length >= 3);
      return last.map((r) => ({ name: r.name || '', poly: r.poly.map((q) => [q[0], q[1]]), area: (r.area || 0) / 1e6, z: r.z || 0,
        windows: (r.windows || []).map((q) => ({ x: q.x, y: q.y, w: q.w, sill: q.sill })) }));
    },
    count,
    async erase() {
      const n = count();
      if (!caps().includes('bodies')) return 0;
      const was = await api.model.removeBodies(GROUP, { label: t('mod.erase.label') });
      return was ? n : 0;
    },
    async draw({ luminaires, result, room, cct = 3000 }) {
      if (!caps().includes('bodies')) throw Object.assign(new Error('mod.noroom'), { key: 'mod.noroom' });
      const same = (q) => q.poly.length === room.polygon.length && q.poly.every((c, i) => Math.hypot(c[0] - room.polygon[i][0], c[1] - room.polygon[i][1]) <= 2);
      const r = last.find(same), z = r ? r.z || 0 : 0;   // a typed outline that is not the face's sits at the model's ground
      const lum = luminaireBodies(luminaires, { cct, name: t('mod.draw.label') }), surf = surfaceBodies(result, { name: t('mod.surface.label') });
      await api.model.addBodies(GROUP, [...lum, ...surf], { name: t('tab'), label: t('mod.draw.label'), at: [0, 0, z] });
      return { n: lum.length, surface: surf.length > 0 };
    },
    start() { /* the panel is the whole interface */ },
  };
  return host;
}
