/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/bim.js — the BimCraft adapter of CabinetCraft (copied to bimcraft/dev/addons/cabinetcraft/host.js by tools/cabinetcraft/sync.mjs). 0.8 DC.117, session `cabinetcraft_hosts`.
 *
 * What BimCraft does with the cabinets: they become BIM ELEMENTS in the open model — one IfcFurniture per cabinet, filler and end panel (IFC2X3: IfcFurnishingElement), one
 * IfcBuildingElementProxy per countertop piece — standing on the storey the room came from, each with a solid body of one extruded prism per panel and a CabinetCraft property set (number,
 * template, run, size, elevation, material, job). The room comes from the model: "Use this room" lists the rooms the walls enclose (the ones touching the walls you selected first), and the
 * doors and windows near the room's edge become the job's openings. One placement is ONE undo step (`api.model.write`); placing again replaces the job's elements. The plan is also put on the
 * storey's plan view as drafting lines (`api.drafting.put`, API 1.4, one undo step). The schedule is read BACK from the model's elements, and a check compares it with the job.
 * What BimCraft cannot do: G-code (a CAM export is PartCraft's), and elevations/sections of the cabinets are BimCraft's own views of the elements (the job's own set is saved as HTML).
 * detect(api, { t }) → the host descriptor, or null when the api cannot write into a model (no api.model.write).
 */
import { ids } from '../../ifc-util.js';
import { cabinetElements } from './lib/elements.js';
import { planEnts } from './lib/drawings.js';
import { toModel } from './lib/fromroom.js';
import { HOST_CSS } from './lib/hoststyle.js';

export const PSET = 'CabinetCraft';
const CLASSES = ['IFCFURNITURE', 'IFCFURNISHINGELEMENT', 'IFCBUILDINGELEMENTPROXY'];
const rgb = (hex) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(hex)); const n = m ? parseInt(m[1], 16) : 0xc9c2b4; return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

/** The key one job's elements carry, so placing again replaces them and no other job's. */
export const jobKey = (project, storey) => String(project.name || 'job').slice(0, 40) + '|' + storey;

/** Write the elements into the model through a ModelWriter `w` (inside api.model.write). → the number made. */
export function writeElements(w, storeyGuid, els, key, project) {
  const st = w.byGuid(storeyGuid);
  if (!st) throw new Error('storey');
  const stl = w.api.GetLine(w.mid, st, false);
  dropJob(w, key);
  const styles = new Map();
  const styleFor = (hex) => { if (!styles.has(hex)) styles.set(hex, w.surfaceStyle('CabinetCraft ' + hex, rgb(hex))); return styles.get(hex); };
  let n = 0;
  for (const el of els) {
    const [x0, y0, z0] = el.bbox;
    const lp = w.placeAt(stl.ObjectPlacement.value, x0, y0, z0, 0);
    const g = w.gid();
    const occ = el.kind === 'counter' ? 'IFCBUILDINGELEMENTPROXY' : (w.v4 ? 'IFCFURNITURE' : 'IFCFURNISHINGELEMENT');
    const id = w.make(occ, g, w.ownerHistory(), w.L(el.name), null, w.L('CabinetCraft ' + el.tag), w.H(lp), null, w.L(String(el.no)), ...w.occExtra(occ));
    w.noteGuid(g, id);
    const items = [], colors = [];
    for (const p of el.pieces) {
      const prof = w.profile(p.pts.map((q) => [q[0] - x0, q[1] - y0]));
      items.push(w.extrude(prof, p.z0 - z0, Math.max(0.1, p.z1 - p.z0)));
      colors.push(p.color);
    }
    w.setShape(id, [w.rep('body', 'Body', 'SweptSolid', items)]);
    items.forEach((it, i) => w.styleItem(it, styleFor(colors[i])));
    w.contain(id, st);
    w.upsertPset(id, PSET, [['Job', 'IFCLABEL', key], ['Number', 'IFCLABEL', String(el.no)], ['Kind', 'IFCLABEL', el.kind], ['Template', 'IFCLABEL', el.tag], ['Run', 'IFCLABEL', String(el.run ?? '')], ['Row', 'IFCLABEL', String(el.row ?? '')],
      ['WidthMm', 'IFCREAL', el.w], ['HeightMm', 'IFCREAL', el.h], ['DepthMm', 'IFCREAL', el.d], ['ElevationMm', 'IFCREAL', el.elev], ['Material', 'IFCLABEL', el.material], ['Pieces', 'IFCINTEGER', el.pieces.length], ['MadeToOrder', 'IFCBOOLEAN', !!el.madeToOrder]]);
    n++;
  }
  void project;
  return n;
}

function elementsOf(w, key = null) {
  const out = [];
  for (const cls of CLASSES) {
    let list = [];
    try { list = ids(w.api, w.mid, cls); } catch { list = []; }
    for (const id of list) {
      let ps = null;
      try { ps = w.readPset(id, PSET); } catch { ps = null; }
      if (ps && (key === null || ps.Job === key)) out.push({ id, ps, guid: w.guidOf(id), storey: (w.storeyOf().get(id) ?? null) });
    }
  }
  return out;
}
function dropJob(w, key) { const old = elementsOf(w, key).map((x) => x.id); if (old.length) w.dropProduct(old); return old.length; }

export function detect(api, { t }) {
  if (!api || !api.model || typeof api.model.write !== 'function') return null;
  const hasRooms = typeof api.model.roomPlans === 'function';
  const hasDraft = !!(api.drafting && typeof api.drafting.put === 'function');
  let rooms = [];
  const state = { count: null };
  const storeyOf = async (ctx) => {
    const site = ctx.project.site;
    if (site && site.host === 'bim' && site.storey) return { guid: site.storey, ox: site.ox, oy: site.oy, name: site.name };
    const lv = typeof api.model.levels === 'function' ? api.model.levels() : [];
    if (!lv.length) throw new Error(t('bim.nolevel'));
    return { guid: lv[0].guid, ox: 0, oy: 0, name: lv[0].name, assumed: true };
  };
  const refreshCount = (ctx) => {
    try { const s = ctx.project.site; const key = jobKey(ctx.project, s && s.storey || ''); void key; } catch { /* no site */ }
  };
  void refreshCount;
  const readJob = (key) => api.model.read((w) => elementsOf(w, key).map((x) => ({ guid: x.guid, ...x.ps })));
  const host = {
    id: 'bim', gcode: false, styles: HOST_CSS,
    room: hasRooms ? {
      label: t('bim.room.title'), note: t('bim.room.note'),
      async list() {
        const sel = new Set((api.model.selection ? api.model.selection() : []).map(Number));
        let selGuids = new Set();
        if (sel.size && typeof api.model.walls === 'function') selGuids = new Set(api.model.walls().filter((x) => sel.has(Number(x.id))).map((x) => x.guid));
        rooms = api.model.roomPlans();
        const withSel = (r) => (r.walls || []).filter((g) => selGuids.has(g)).length;
        const list = rooms.map((r, i) => ({ i, r, hit: withSel(r) })).sort((a, b) => b.hit - a.hit || a.i - b.i);
        return list.map(({ i, r, hit }) => ({ id: String(i), label: t('bim.room.row', { name: r.name, area: Math.round(r.area / 1e4) / 100, walls: (r.walls || []).length, doors: r.doors.length, windows: r.windows.length }) + (hit ? ' — ' + t('bim.room.selected', { n: hit }) : '') }));
      },
      async read(id) {
        const r = rooms[Number(id)];
        if (!r) return null;
        let height = 0;
        try { const lv = typeof api.model.levels === 'function' ? api.model.levels().find((l) => l.guid === r.storey) : null; if (lv && lv.height > 0) height = lv.height; } catch { height = 0; }
        return { name: r.name, storey: r.storey, z: r.z, height, pts: r.poly, openings: [...r.doors.map((d) => ({ kind: 'door', x: d.x, y: d.y, w: d.w })), ...r.windows.map((d) => ({ kind: 'window', x: d.x, y: d.y, w: d.w, sill: d.sill }))] };
      },
    } : null,
    sections(ctx) {
      const secs = [];
      const site = ctx.project.site;
      const count = state.count;
      secs.push({
        id: 'bim-place', where: 'drawings', title: t('bim.place.title'), note: t('bim.place.note'),
        actions: [
          { id: 'bim-place', label: count ? t('bim.place.replace') : t('bim.place.do'), async run(c) {
            const st = await storeyOf(c);
            const els = cabinetElements(c.build, { word: c.t, origin: [st.ox, st.oy, 0] });
            if (!els.length) return t('bim.place.empty');
            const key = jobKey(c.project, st.guid);
            const r = await api.model.write(t('bim.place.label'), (w) => writeElements(w, st.guid, els, key, c.project));
            state.count = r.value;
            return t('bim.place.done', { n: r.value, level: st.name || '' }) + (st.assumed ? ' ' + t('bim.place.assumed') : '');
          } },
          { id: 'bim-remove', label: t('bim.remove'), async run(c) {
            const st = await storeyOf(c);
            const key = jobKey(c.project, st.guid);
            const r = await api.model.write(t('bim.remove.label'), (w) => dropJob(w, key));
            state.count = 0;
            return r.value ? t('bim.removed', { n: r.value }) : t('bim.none');
          } },
        ],
        status: count === null ? t('bim.count.unknown') : t('bim.count', { n: count }),
      });
      secs.push({
        id: 'bim-model', where: 'export', title: t('bim.model.title'), note: t('bim.model.note') + (site && site.storey ? '' : ' ' + t('bim.model.nosite')),
        actions: [
          { id: 'bim-schedule', label: t('bim.schedule'), async run(c) {
            const st = await storeyOf(c);
            const rows = readJob(jobKey(c.project, st.guid)).sort((a, b) => String(a.Number).localeCompare(String(b.Number), undefined, { numeric: true }));
            if (!rows.length) return t('bim.none');
            const head = ['Number', 'Kind', 'Template', 'Run', 'Row', 'WidthMm', 'HeightMm', 'DepthMm', 'ElevationMm', 'Material', 'Pieces', 'guid'];
            const csv = [head.map((h2) => t('bim.csv.' + h2)).join(','), ...rows.map((r) => head.map((h2) => csvCell(r[h2])).join(','))].join('\n') + '\n';
            c.download(c.base() + '-model-schedule.csv', csv, 'text/csv');
            return t('bim.schedule.done', { n: rows.length });
          } },
          { id: 'bim-check', label: t('bim.check'), async run(c) {
            const st = await storeyOf(c);
            const rows = readJob(jobKey(c.project, st.guid));
            const have = new Set(rows.map((r) => String(r.Number)));
            const want = cabinetElements(c.build, { word: c.t }).map((e) => String(e.no));
            const missing = want.filter((n) => !have.has(n)), extra = [...have].filter((n) => !want.includes(n));
            return missing.length || extra.length ? t('bim.check.diff', { missing: missing.length, extra: extra.length, list: [...missing, ...extra].slice(0, 12).join(', ') }) : t('bim.check.ok', { n: want.length });
          } },
        ],
      });
      if (hasDraft) secs.push({
        id: 'bim-draft', where: 'drawings', title: t('bim.draft.title'), note: t('bim.draft.note'),
        actions: [{ id: 'bim-draft', label: t('bim.draft.do'), async run(c) {
          const st = await storeyOf(c);
          const k = c.project.unit === 'in' ? 25.4 : 1;
          const at = (p) => [st.ox + p.x * k, st.oy + p.y * k];
          const items = [];
          for (const e of planEnts(c.build)) {
            if (e.dimPart || e.type === 'text') continue;
            if (e.type === 'line') items.push({ level: st.guid, kind: 'lines', pts: [at({ x: e.x1, y: e.y1 }), at({ x: e.x2, y: e.y2 })] });
            else if (e.type === 'poly' && e.pts.length >= 2) items.push({ level: st.guid, kind: 'lines', pts: e.pts.map(at), closed: !!e.closed });
          }
          const r = await api.drafting.put('cabinetcraft-' + String(c.project.name || 'job').replace(/[^A-Za-z0-9]/g, '').slice(0, 20), items, { label: t('bim.draft.label') });
          return t('bim.draft.done', { n: r.n, level: st.name || '' });
        } }],
      });
      return secs;
    },
    command(name, fn, label) { if (api.commands && typeof api.commands.add === 'function') api.commands.add(name, fn, { label }); },
    start(app) {
      // the count of this job's elements in the model, now and after each change of the model
      const upd = () => { try { const s = app.get().project.site; const lv = typeof api.model.levels === 'function' ? api.model.levels() : []; const guid = (s && s.storey) || (lv[0] && lv[0].guid) || ''; if (guid) state.count = readJob(jobKey(app.get().project, guid)).length; } catch { /* no model open */ } };
      upd();
      try { host._off = api.model.onChange && api.model.onChange(() => { upd(); }); } catch { host._off = null; }
    },
    stop() { try { host._off && host._off(); } catch { /* gone */ } },
  };
  void toModel;
  return host;
}
