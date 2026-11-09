/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/bim.js — the BimCraft adapter of the Interior lighting design add-on (copied to bimcraft/dev/addons/lightdesign/host.js by tools/lightdesign/sync.mjs).
 * 0.9 IL.9, session `adapters-09`. Same shape as hosts/cad.js; BimCraft's add-on API 1.4 gives it the model's rooms (with their windows) and a writer.
 *
 *   detect(api, { t }) → the host, or null when the api has no model.rooms
 *   host.rooms() → [{ name, poly mm, area m², height (the walls' usual height), z, level, storey (GlobalId), windows [{ x, y, w, sill }] }]   from api.model.roomPlans() (api.model.rooms() on an older host)
 *   host.draw({ luminaires, result, room }) → { n, lux }   ONE undo step: the luminaires become IfcLightFixture in the room's level (BimCraft's own ceiling luminaire, with
 *       its plan symbol, tag and Load = the luminaire's watts, so the device schedule and the electrical tools see them; a property set CadCraft_LightDesign holds lumens, watts and
 *       the room's calculated mean lux), and the calculated lux are drawn in that level's plan view as numbers (drafting lines, tag 'lightdesign'). Drawing again replaces both.
 *   host.erase() → n   the fixtures this add-on placed and its numbers on the plan     host.count()     host.start(app) → nothing (the panel is the interface)
 *   The fixtures are real model elements: moving or deleting one afterwards is the person's, the next Draw removes only the ones this add-on made (they carry CadCraft_LightDesign).
 */
const PSET = 'CadCraft_LightDesign';
const TAG = 'lightdesign';

// seven-segment digits as stroke polylines in a 2 × 4 box (x right, y up); one entry per digit, each a list of strokes
const SEG = { a: [[0, 4], [2, 4]], b: [[2, 4], [2, 2]], c: [[2, 2], [2, 0]], d: [[0, 0], [2, 0]], e: [[0, 0], [0, 2]], f: [[0, 2], [0, 4]], g: [[0, 2], [2, 2]] };
const DIGITS = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
/** The strokes (each [[x, y], [x, y]] in mm) that write the whole number `n` centred on (cx, cy), digits `h` mm high. */
export function numberStrokes(n, cx, cy, h) {
  const s = String(Math.max(0, Math.round(n))), k = h / 4, w = 2 * k, gap = k, total = s.length * w + (s.length - 1) * gap, out = [];
  [...s].forEach((ch, i) => {
    const x0 = cx - total / 2 + i * (w + gap), y0 = cy - h / 2;
    for (const g of DIGITS[ch] || '') out.push(SEG[g].map(([x, y]) => [Math.round(x0 + x * k), Math.round(y0 + y * k)]));
  });
  return out;
}

export function detect(api, { t }) {
  if (!api || !api.model || typeof api.model.rooms !== 'function') return null;
  let n = 0, last = [], lib = null;
  const elec = () => (lib ||= import('../../res-elec.js'));
  /** Run `opFn` (an op: (editor) → result) inside the running writer `w`: its journal joins w's, so one undo step takes it all back. */
  const nest = (w, opFn) => {
    const r = opFn({ W: w.W, api: w.api, mid: w.mid });
    if (r && r.journal) {
      for (const id of r.journal.created) if (!w.journal.created.includes(id)) w.journal.created.push(id);
      for (const [id, line] of r.journal.before) if (!w.journal.before.has(id) && !w.journal.created.includes(id)) w.journal.before.set(id, line);
    }
    w._guids = null;
    return r;
  };
  const mine = (E, w) => E.readDevices(w).filter((d) => { try { return !!w.readPset(d.id, PSET); } catch { return false; } });
  const host = {
    id: 'bim',
    async rooms() {
      let plans = null;
      if (typeof api.model.roomPlans === 'function') { try { plans = await api.model.roomPlans(); } catch { plans = null; } }
      if (plans) {
        let walls = [];
        try { walls = (await api.model.walls()) || []; } catch { walls = []; }
        const byGuid = new Map(walls.map((x) => [x.guid, x]));
        last = plans.filter((r) => r && Array.isArray(r.poly) && r.poly.length >= 3);
        return last.map((r) => {
          const hs = (r.walls || []).map((g) => byGuid.get(g)).filter(Boolean).map((x) => x.height).filter((x) => x > 0).sort((a, b) => a - b);
          return { name: r.name || '', poly: r.poly.map((q) => [q[0], q[1]]), area: (r.area || 0) / 1e6, z: r.z || 0, level: r.storeyName || '', storey: r.storey || '', height: hs.length ? Math.round(hs[Math.floor(hs.length / 2)]) : undefined,
            windows: (r.windows || []).map((q) => ({ x: q.x, y: q.y, w: q.w, sill: q.sill })) };
        });
      }
      const rs = await api.model.rooms();
      last = (Array.isArray(rs) ? rs : []).filter((r) => r && Array.isArray(r.poly) && r.poly.length >= 3);
      return last.map((r) => ({ name: r.name || '', poly: r.poly.map((q) => [q[0], q[1]]), area: (r.area || 0) / 1e6, z: r.z || 0, level: r.level || '', storey: '' }));
    },
    count: () => n,
    async erase() {
      const E = await elec();
      let removed = 0;
      await api.model.write(t('bim.erase.label'), (w) => {
        const ds = mine(E, w);
        if (ds.length) nest(w, E.removeDevices(ds.map((d) => d.guid)));
        removed = ds.length;
      });
      try { if (typeof api.drafting?.put === 'function') await api.drafting.put(TAG, [], { label: t('bim.erase.label') }); } catch { /* no plan numbers to remove */ }
      try { await api.model.removeBodies?.('lightdesign'); } catch { /* the older display bodies, if the file still has them */ }
      n = 0;
      return removed;
    },
    async draw({ luminaires, result, room }) {
      const E = await elec();
      // the outline in the panel is rounded to whole millimetres: the model's room is the one whose corners are all within 2 mm of it (same count)
      const same = (q) => q.poly.length === room.polygon.length && q.poly.every((c, i) => Math.hypot(c[0] - room.polygon[i][0], c[1] - room.polygon[i][1]) <= 2);
      const r = last.find(same);
      if (!r || !r.storey) throw Object.assign(new Error('bim.noroom'), { key: 'bim.noroom' });
      const mean = Math.round(result.em);
      let made = 0;
      await api.model.write(t('bim.draw.label'), (w) => {
        const old = mine(E, w);
        if (old.length) nest(w, E.removeDevices(old.map((d) => d.guid)));
        for (const L of luminaires) {
          const p = L.photo, linear = p.length > 0 && p.width > 0 && p.length / p.width >= 3 && p.length <= 3000;
          const res = nest(w, E.placeDevice({ kind: linear ? 'luminaire.linear' : p.width > 0 && p.width < 250 && p.length < 250 ? 'downlight' : 'luminaire', level: r.storey, at: [L.p[0], L.p[1]], height: L.p[2], load: Math.round((p.watts || 0) * (L.scale ?? 1) * 10) / 10 }));
          if (res && res.id) {
            w.upsertPset(res.id, PSET, [['Lumens', 'IFCREAL', Math.round((p.lumens || 0) * (L.scale ?? 1))], ['Watts', 'IFCREAL', Math.round((p.watts || 0) * (L.scale ?? 1) * 10) / 10], ['Photometry', 'IFCLABEL', String(p.name || '').slice(0, 80)], ['RoomMeanLux', 'IFCREAL', mean]]);
            made++;
          }
        }
      });
      // the calculated lux as numbers in the level's plan view (drafting lines: BimCraft shows them on screen, on sheets and in the PDF)
      const g = result.grid, step = Math.max(1, Math.ceil(g.points.length / 30)), h = Math.max(120, Math.min(250, g.spacing / 4)), items = [];
      g.points.forEach((p, i) => { if (i % step === 0) for (const s of numberStrokes(g.values[i], p[0], p[1], h)) items.push({ level: r.storey, kind: 'lines', pts: s, closed: false }); });
      let lux = 0;
      if (typeof api.drafting?.put === 'function' && items.length) { const put = await api.drafting.put(TAG, items, { label: t('bim.lux.label') }); lux = put.n; }
      n = made;
      return { n: made, lux };
    },
    start() { /* the panel is the whole interface */ },
  };
  return host;
}
