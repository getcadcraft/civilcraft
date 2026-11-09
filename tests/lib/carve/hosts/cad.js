/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/cad.js — the CadCraft adapter of the Router carving add-on (copied to cadcraft/dev/addons/carving/host.js by tools/carve/sync.mjs).
 * 0.9 SU.886, session `carve-09`. The add-on's engine (lib/) and panel (main.js) know nothing of CadCraft; this file is all that does.
 *
 *   detect(api, { t }) → the host, or null when the api has no drawing to read and write (no api.doc.change)
 *   host.id = 'cad'
 *   host.shapes({ selection, layers }) → { closed: [{ layer, pts: [[x, y]] }], open: [...], layers: [{ name, closed, open }], skipped: { kind: n }, mmPer }
 *       the drawing as CadCraft's Laser reads it (laser-cad.js drawingInput: lines, arcs, circles, polylines with bulges, ellipses, splines and hatch
 *       loops, blocks expanded, layers that show), in millimetres, arcs flattened to chords no further than 0.01 mm from the arc; `selection` = only
 *       what is selected; `layers` = a Set of layer names or null for all
 *   host.draw(ops, { origin }) → { n } the toolpaths as polylines on layers CARVE-… (one undo step; redrawing replaces them), host.erase(), host.count()
 *   host.units() → millimetres in one drawing unit    host.selectionSize()
 *   host.start(app) → adds the commands CARVE, CARVEDRAW, CARVEGCODE (the panel's actions without the panel)
 */
import { drawingInput } from '../../laser-cad.js';
import { flattenBulges } from './lib/geom.js';

export const LAYERS = { 'CARVE-CLEAR': { color: 5, lineweight: 0.25 }, 'CARVE-VCARVE': { color: 1, lineweight: 0.25 }, 'CARVE-ENGRAVE': { color: 2, lineweight: 0.25 }, 'CARVE-ROUGH': { color: 8, lineweight: 0.13 }, 'CARVE-FINISH': { color: 3, lineweight: 0.13 } };
const LAYER_OF = { clear: 'CARVE-CLEAR', vcarve: 'CARVE-VCARVE', engrave: 'CARVE-ENGRAVE', rough: 'CARVE-ROUGH', finish: 'CARVE-FINISH' };

export function detect(api, { t }) {
  if (!api || !api.doc || typeof api.doc.change !== 'function' || !api.data || typeof api.data.set !== 'function') return null;
  const doc = () => api.doc;
  const mine = (d) => [...d.model.values()].filter((e) => String(e.layer).startsWith('CARVE-'));   // by layer: it survives undo, redo, DXF and DWG
  const per = () => { const d = doc(); const u = d.meta && d.meta.units; const i = { '': 1, inches: 25.4, feet: 304.8, millimeters: 1, centimeters: 10, meters: 1000, yards: 914.4 }; return i[String(u || '')] ?? 1; };
  const host = {
    id: 'cad',
    units: () => per(),
    selectionSize: () => (api.selection ? api.selection().length : 0),
    shapes({ selection = false, layers = null } = {}) {
      const d = doc();
      const only = selection ? new Set((api.selection ? api.selection() : []).map(Number)) : null;
      const inp = drawingInput(d, { only: only && only.size ? only : null, tol: 0.01 });
      const out = { closed: [], open: [], layers: [], skipped: inp.skipped || {}, mmPer: inp.mmPer };
      for (const s of inp.shapes) {
        if (String(s.layer).startsWith('CARVE-')) continue;   // our own toolpaths are not shapes to carve
        let row = out.layers.find((l) => l.name === s.layer);
        if (!row) out.layers.push((row = { name: s.layer, closed: 0, open: 0 }));
        row[s.closed ? 'closed' : 'open'] += s.loops.length;
        if (layers && !layers.has(s.layer)) continue;
        for (const l of s.loops) (s.closed ? out.closed : out.open).push({ layer: s.layer, pts: flattenBulges(l, s.closed, 0.01) });
      }
      return out;
    },
    count: () => mine(doc()).length,
    erase() {
      const d = doc(); let n = 0;
      d.change(t('cad.erase.label'), () => { for (const e of mine(d)) { d.remove(e.id); n++; } });
      return n;
    },
    draw(ops, { origin = [0, 0] } = {}) {
      const d = doc(), f = 1 / per();
      for (const [name, l] of Object.entries(LAYERS)) if (!d.layers.has(name)) d.addLayer({ name, ...l });
      let n = 0;
      d.change(t('cad.draw.label'), () => {
        for (const e of mine(d)) d.remove(e.id);
        for (const op of ops) {
          const layer = LAYER_OF[op.id] || 'CARVE-VCARVE';
          for (const p of op.paths) {
            if (p.length < 2) continue;
            const ent = { type: 'poly', layer, closed: false, pts: p.map((q) => ({ x: (q[0] + origin[0]) * f, y: (q[1] + origin[1]) * f })) };
            d.add(ent); n++;
          }
        }
      });
      return { n };
    },
    start(app) {
      const say = (s) => { try { api.print(s); } catch { /* no history */ } };
      api.commands.add('CARVE', [], async () => { const r = app.run(); say(r.ok ? t('cmd.carve.done', r.summary) : r.message); }, { help: () => t('cmd.carve.help') });
      api.commands.add('CARVEDRAW', [], async () => { const r = app.run(); if (!r.ok) { say(r.message); return; } const dr = app.draw(); say(t('cad.draw.done', { n: dr.n })); }, { help: () => t('cmd.carvedraw.help') });
      api.commands.add('CARVEGCODE', [], async () => { const r = app.run(); if (!r.ok) { say(r.message); return; } app.download(); say(t('cmd.gcode.done', r.summary)); }, { help: () => t('cmd.carvegcode.help') });
    },
  };
  return host;
}
