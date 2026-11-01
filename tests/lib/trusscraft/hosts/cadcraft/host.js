/* SPDX-License-Identifier: Apache-2.0 */
/**
 * host.js — TrussCraft's adapter for CadCraft (add-on API 1.3 on CadCraft's own loader: api.doc, api.selection, api.redraw). The drawings are real CAD
 * entities on TRUSS-* layers: lines, closed polylines, text, solid hatches (the plates) and linear dimensions, so the drawing saves, plots and goes
 * out as DXF / DWG like anything drawn by hand. Each drawing is one undo step. The roof outline is typed, or taken from the selected closed
 * polyline (drawing units are converted to mm by the drawing's own units). Nothing is drawn in 3D here (no solids), and an entity is plain: it does
 * not follow the truss design if you change it — draw again, or "Remove the drawings" first.
 *   Draw layout plan · elevation · force diagram · schedule (cut list + joints).
 */
import { LAYERS, elevationEnts, forceEnts, layoutEnts, tableEnts, scheduleRows } from './lib/cadplan.js';

const MM = { millimeters: 1, centimeters: 10, meters: 1000, kilometers: 1e6, inches: 25.4, feet: 304.8, yards: 914.4 };
const mmPerUnit = (doc) => MM[String(doc && doc.meta && doc.meta.units || '').toLowerCase()] || 1;
const isMine = (e) => typeof e.layer === 'string' && e.layer.startsWith('TRUSS-');

function bounds(doc) {
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  const add = (x, y) => { if (Number.isFinite(x) && Number.isFinite(y)) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); } };
  for (const e of doc.all()) {
    if (e.type === 'line') { add(e.x1, e.y1); add(e.x2, e.y2); }
    else if (e.type === 'poly') for (const p of e.pts || []) add(p.x, p.y);
    else if (e.type === 'hatch') for (const l of e.loops || []) for (let i = 0; i + 1 < l.length; i += 2) add(l[i], l[i + 1]);
    else if (e.type === 'dim') { for (const p of [e.p1, e.p2, e.loc]) if (p) add(p.x, p.y); }
    else add(e.x ?? e.cx, e.y ?? e.cy);
  }
  return x1 === Infinity ? null : { x1, y1, x2, y2 };
}

export function makeHost(api, { t }) {
  const doc = () => api.doc;
  const k = () => 1 / mmPerUnit(doc());
  const style = (th) => { const cur = (doc().current && doc().current.dim) || {}; return { ...cur, scale: (th * k()) / (cur.txt || 2.5) }; };
  const ensureLayers = (d) => { for (const [name, l] of Object.entries(LAYERS)) if (!d.layers.has(name)) d.addLayer({ name, ...l }); };
  /** Put entities in the drawing as one undo step → how many. */
  function put(label, ents) {
    const d = doc();
    if (!d) throw new Error(t('h.cadcraft.nodoc'));
    let n = 0;
    d.change(label, () => { ensureLayers(d); for (const e of ents) { d.add(e); n++; } });
    if (typeof api.redraw === 'function') api.redraw();
    return n;
  }
  /** Where a drawing of its own goes: to the right of everything already in the drawing. */
  const slot = () => { const b = bounds(doc()); return b ? [b.x2 + 3000 * k(), b.y1] : [0, 0]; };
  const th = 60;
  return {
    id: 'cadcraft',
    roofs: () => [],
    /** CadCraft's commands take aliases and a command context: TRUSSDESIGN · TRUSSLAYOUT · TRUSSCHECK · TRUSSPLACE on the command line. */
    addCommand(name, fn) { api.commands.add('TRUSS' + name.toUpperCase(), [], async () => { await fn(); }); },
    canPlace: true,
    placeKey: 'h.cadcraft.place',
    async place({ layout, designs, outline }) {
      const d = doc(); if (!d) throw new Error(t('h.cadcraft.nodoc'));
      const kk = k();
      // the plan is drawn where the roof outline is: typed or picked corners are mm, the drawing's units are mm / mmPerUnit
      return put(t('h.cadcraft.undo.plan'), layoutEnts(layout, designs, { at: [0, 0], k: kk, st: style(150), textH: 150, outline }));
    },
    async clear() {
      const d = doc(); if (!d) return false;
      const ids = d.all().filter(isMine).map((e) => e.id);
      if (!ids.length) return false;
      d.change(t('h.cadcraft.undo.clear'), () => { for (const id of ids) d.remove(id); });
      if (typeof api.redraw === 'function') api.redraw();
      return true;
    },
    pickKey: 'h.cadcraft.pick',
    pickOutline() {
      const d = doc(); if (!d) throw new Error(t('h.cadcraft.nodoc'));
      const e = (api.selection() || []).map((id) => d.get(id)).find((x) => x && x.type === 'poly' && x.closed && (x.pts || []).length >= 3);
      if (!e) throw new Error(t('h.cadcraft.nopoly'));
      const m = mmPerUnit(d);
      return e.pts.map((p) => [p.x * m, p.y * m]);
    },
    buttons: [
      { id: 'elevation', key: 'h.cadcraft.elevation', async run({ design }) { const n = put(t('h.cadcraft.undo.elevation'), elevationEnts(design, { at: slot(), k: k(), st: style(th), textH: th })); return t('h.cadcraft.drawn', { n }); } },
      { id: 'forces', key: 'h.cadcraft.forces', async run({ design }) { const n = put(t('h.cadcraft.undo.forces'), forceEnts(design, { at: slot(), k: k(), textH: th })); return t('h.cadcraft.drawn', { n }); } },
      { id: 'table', key: 'h.cadcraft.table', async run({ design }) { const n = put(t('h.cadcraft.undo.table'), tableEnts(scheduleRows(design), { at: slot(), k: k(), textH: th })); return t('h.cadcraft.drawn', { n }); } },
    ],
    limits: () => [t('h.cadcraft.limit.entities'), t('h.cadcraft.limit.roofs')],
  };
}
