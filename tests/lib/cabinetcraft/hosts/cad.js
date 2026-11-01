/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/cad.js — the CadCraft adapter of CabinetCraft (copied to cadcraft/dev/addons/cabinetcraft/host.js by tools/cabinetcraft/sync.mjs). 0.8 DC.117, session `cabinetcraft_hosts`.
 *
 * What CadCraft does with the cabinets: the SHOP DRAWINGS are drawn as real CAD entities in the open drawing, on layers of their own (CC-ROOM, CC-BASE, CC-UPPER, CC-FILL, CC-HIDDEN, CC-COUNTER,
 * CC-TEXT, CC-DIM, CC-TABLE, CC-SHEET): the plan with hatched countertops and real dimensions, an elevation of every run with one BLOCK for each cabinet type (CC-CAB-n, inserted where it stands),
 * a section of every cabinet template, the cabinet schedule, the cut list and (after Nest) the nested sheets as tables and rectangles — each sheet in a frame with its title. Everything is one undo
 * step, tagged with the add-on's data (so Redraw replaces it and DXF/DWG carry it), in the drawing's own units. The room can be a closed polyline of the drawing (selected, or any on the
 * drawing) with the door and window blocks near its edge. The cabinets can also be put on the 3D tab as solids (`api.solids`, one per cabinet). What CadCraft cannot do: G-code (a CAM export is
 * PartCraft's; the nested sheets are in the drawing and, with the DXF in Export, go to PartCraft's Manufacture).
 * detect(api, { t }) → the host descriptor, or null when the api has no drawing to write into (no api.doc.change).
 */
import { entityBounds } from '../../geom.js';
import { cadSheets, scaleSheets, layoutSheets, LAYERS } from './lib/cadents.js';
import { cabinetElements } from './lib/elements.js';
import { HOST_CSS } from './lib/hoststyle.js';

const UNIT_M = { '': 0.001, inches: 0.0254, feet: 0.3048, millimeters: 0.001, centimeters: 0.01, meters: 1, yards: 0.9144 };
/** Millimetres in one drawing unit. */
export const mmPerUnit = (doc) => (UNIT_M[String(doc && doc.meta && doc.meta.units || '')] ?? 0.001) / 0.001;
const DOOR = /door|puerta|\bdr\b|porte/i, WINDOW = /window|ventana|\bwin\b|fenetre|fen[eê]tre/i;

/** A polyline's corners in mm; a bulge becomes chords (15 degrees each at most). */
export function polyMm(e, f) {
  const out = [];
  const pts = e.pts || [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    out.push([a.x * f, a.y * f]);
    const bulge = Number(a.b) || 0;
    if (bulge && (i < n - 1 || e.closed)) {
      const sweep = 4 * Math.atan(bulge), steps = Math.max(1, Math.ceil(Math.abs(sweep) / (Math.PI / 12)));
      const dx = b.x - a.x, dy = b.y - a.y, chord = Math.hypot(dx, dy);
      if (chord > 0) {
        // the centre is on the left of a → b for a counter-clockwise arc (bulge > 0), on the right for a clockwise one
        const r = chord / (2 * Math.sin(Math.abs(sweep) / 2)), off = r * Math.cos(Math.abs(sweep) / 2) * (bulge > 0 ? 1 : -1);
        const cx = (a.x + b.x) / 2 - (dy / chord) * off, cy = (a.y + b.y) / 2 + (dx / chord) * off;
        const a0 = Math.atan2(a.y - cy, a.x - cx);
        for (let k = 1; k < steps; k++) { const ang = a0 + sweep * (k / steps); out.push([(cx + r * Math.cos(ang)) * f, (cy + r * Math.sin(ang)) * f]); }
      }
    }
  }
  return out;
}

export function detect(api, { t }) {
  if (!api || !api.doc || typeof api.doc.change !== 'function' || !api.data || typeof api.data.set !== 'function') return null;
  const doc = () => api.doc;
  let found = [];
  const keyOf = (c) => 'cabinetcraft:' + String(c.project.name || 'job');
  const ours = (d, key) => [...d.model.values()].filter((e) => { try { const v = api.data.get(e); return v && v.job === key; } catch { return false; } });
  const countOurs = (c) => { try { return ours(doc(), keyOf(c)).length; } catch { return 0; } };
  const state = { x: null, y: null };
  const units = (c) => { const d = doc(); const f = mmPerUnit(d); return { f, k: (c.project.unit === 'in' ? 25.4 : 1) / f }; };   // k: drawing units per job unit

  function entitiesFor(c) {
    const { k } = units(c);
    const res = scaleSheets(cadSheets(c.build, { t: c.t, list: c.list, nest: c.nest, est: c.est }), k);
    return res;
  }
  function origin(c, res) {
    if (Number.isFinite(state.x) && Number.isFinite(state.y)) return { x: state.x, y: state.y };
    // right of what is in the drawing already (not our own earlier sheets: they are replaced), 5 sheets' gap away
    let x1 = -Infinity, y1 = -Infinity;
    const key = keyOf(c), mine = new Set(ours(doc(), key).map((e) => e.id));
    for (const e of doc().model.values()) { if (mine.has(e.id)) continue; try { const b = entityBounds(e, doc().blocks); if (b && Number.isFinite(b.maxx)) { x1 = Math.max(x1, b.maxx); y1 = Math.max(y1, b.maxy); } } catch { /* unbounded */ } }
    const maxH = Math.max(0, ...res.sheets.map((s) => s.h));
    return Number.isFinite(x1) ? { x: x1 + maxH * 0.3, y: y1 } : { x: 0, y: 0 };
  }

  function draw(c) {
    const d = doc();
    const res = entitiesFor(c);
    const o = origin(c, res);
    const lay = layoutSheets(res, { x: o.x, y: o.y, rowW: Math.max(...res.sheets.map((s) => s.w)) * 2.4 });
    const key = keyOf(c);
    for (const [name, l] of Object.entries(LAYERS)) if (!d.layers.has(name)) d.addLayer({ name, ...l });
    let n = 0;
    d.change(c.t('cad.draw.label'), () => {
      for (const e of ours(d, key)) d.remove(e.id);
      for (const b of res.blocks) d.defineBlock(b);
      const mark = (e) => api.data.set(e, { job: key });
      for (const e of lay.entities) { d.add(mark(e)); n++; }
    });
    state.x = null;
    return { n, sheets: res.sheets.length, blocks: res.blocks.length };
  }

  const solidKey = (c, no) => 'CC.' + String(c.project.name || 'job').replace(/[^A-Za-z0-9]/g, '').slice(0, 20) + '.' + String(no).replace(/[^A-Za-z0-9]/g, '');
  function solidSpec(el, f) {
    const polys = [];
    const P = (x, y, z) => [x / f, y / f, z / f];
    for (const p of el.pieces) {
      const pts = p.pts, n = pts.length;
      polys.push(pts.slice().reverse().map(([x, y]) => P(x, y, p.z0)));
      polys.push(pts.map(([x, y]) => P(x, y, p.z1)));
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; polys.push([P(pts[i][0], pts[i][1], p.z0), P(pts[j][0], pts[j][1], p.z0), P(pts[j][0], pts[j][1], p.z1), P(pts[i][0], pts[i][1], p.z1)]); }
    }
    return { name: el.name, polys, color: el.pieces[0] ? el.pieces[0].color : '#c9c2b4', tag: 'CabinetCraft' };
  }

  const host = {
    id: 'cad', gcode: false, styles: HOST_CSS,
    room: {
      label: t('cad.room.title'), note: t('cad.room.note'),
      async list() {
        const d = doc(), f = mmPerUnit(d);
        const sel = new Set((api.selection ? api.selection() : []).map(Number));
        const closed = [...d.model.values()].filter((e) => e.type === 'poly' && e.closed && (e.pts || []).length >= 3 && (e.pts || []).length <= 400 && !(api.data.get(e) && api.data.get(e).job));
        found = closed.map((e) => ({ e, sel: sel.has(e.id), pts: polyMm(e, f) }));
        found.sort((a, b) => (b.sel ? 1 : 0) - (a.sel ? 1 : 0));
        const area = (p) => Math.abs(p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2) / 1e6;
        return found.slice(0, 40).map((x, i) => ({ id: String(i), label: t('cad.room.row', { layer: x.e.layer, n: x.pts.length, area: Math.round(area(x.pts) * 100) / 100 }) + (x.sel ? ' — ' + t('cad.room.selected') : '') }));
      },
      async read(id) {
        const x = found[Number(id)];
        if (!x) return null;
        const d = doc(), f = mmPerUnit(d);
        const openings = [];
        for (const e of d.model.values()) {
          if (e.type !== 'insert') continue;
          const kind = DOOR.test(e.block) ? 'door' : WINDOW.test(e.block) ? 'window' : null;
          if (!kind) continue;
          let w = 900;
          try { const b = entityBounds(e, d.blocks); if (b && Number.isFinite(b.maxx)) w = Math.max(b.maxx - b.minx, b.maxy - b.miny) * f; } catch { /* default width */ }
          openings.push({ kind, x: e.x * f, y: e.y * f, w: Math.min(3000, Math.max(300, w)) });
        }
        return { name: t('cad.room.name', { layer: x.e.layer }), pts: x.pts, openings };
      },
    },
    sections(c) {
      const n = countOurs(c);
      return [
        {
          id: 'cad-draw', where: 'drawings', title: t('cad.draw.title'), note: t('cad.draw.note', { layers: Object.keys(LAYERS).length }),
          fields: [],
          actions: [
            { id: 'cad-draw', label: n ? t('cad.draw.redraw') : t('cad.draw.do'), run(cc) { const r = draw(cc); return t('cad.draw.done', { n: r.n, sheets: r.sheets, blocks: r.blocks }); } },
            { id: 'cad-erase', label: t('cad.erase'), disabled: !n, run(cc) { const d = doc(), key = keyOf(cc); let k = 0; d.change(t('cad.erase.label'), () => { for (const e of ours(d, key)) { d.remove(e.id); k++; } }); return t('cad.erased', { n: k }); } },
          ],
          status: n ? t('cad.count', { n }) : t('cad.none'),
        },
        {
          id: 'cad-3d', where: 'drawings', title: t('cad.3d.title'), note: api.solids ? t('cad.3d.note') : t('cad.3d.unavailable'),
          actions: api.solids ? [
            { id: 'cad-3d', label: t('cad.3d.do'), run(cc) {
              const f = mmPerUnit(doc());
              const els = cabinetElements(cc.build, { word: cc.t });
              const map = {};
              for (const el of els) map[solidKey(cc, el.no)] = solidSpec(el, f);
              const out = api.solids.apply(map);
              return t('cad.3d.done', { n: Object.values(out).filter(Boolean).length });
            } },
            { id: 'cad-3d-clear', label: t('cad.3d.clear'), run(cc) {
              const pre = solidKey(cc, '').slice(0, -1); const keys = api.solids.keys().filter((k) => k.startsWith(pre));
              api.solids.apply(Object.fromEntries(keys.map((k) => [k, null])));
              return t('cad.3d.cleared', { n: keys.length });
            } },
          ] : [],
        },
      ];
    },
    command(name, fn, label) {
      const cname = 'CC' + String(name).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      api.commands.add(cname, [], async () => { await fn(); }, { help: () => label });
    },
    start(app) {
      try {
        api.commands.add('CCDRAW', [], async () => { const r = draw(app.hostCtx()); app.say2(t('cad.draw.done', { n: r.n, sheets: r.sheets, blocks: r.blocks })); }, { help: () => t('cad.cmd.draw') });
        api.commands.add('CCROOM', [], async () => {   // the selected closed polyline (else the first one) is the room: for a CadCraft with no right panel (a mounted one in SuperCad Studio)
          const list = await app.hostRooms();
          if (!list || !list.length) { app.say2(t('hostroom.none')); return; }
          await app.useHostRoom(list[0].id);
        }, { help: () => t('cad.cmd.room') });
      } catch (e) { api.log('CCDRAW / CCROOM not added', e); /* i18n-ignore */ }
    },
  };
  void units;
  return host;
}
