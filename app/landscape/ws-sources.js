/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ws-sources.js — the Landscape workspace's rows for worksheets (0.8 LA.8, session `landscape-arch_PART_4`): one row per object of a kind,
 * every field a worksheet column can read. No DOM. The worksheet engine is lib/worksheet/worksheet.js (copied here as worksheet.js);
 * labels on plants and areas read the same field names ({botanical} {cultivar} {size} {qty}), so a change to a record shows everywhere.
 *
 *   WS_SOURCES · wsRows(source, { ls, index, units, surface, lang, quantities, modifiers }) → [row]
 *   defaultWorksheets(t) → the plant schedule and the hardscape schedule as saved worksheets (w1, w2)
 */
import { schedule } from './planting.js';
import { areaQuantities } from './planted.js';
import { wallLayout, stepsLayout, pavingSurface } from './hardscape.js';

export const WS_SOURCES = ['plants', 'areas', 'paving', 'walls', 'steps', 'modifiers', 'quantities'];
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : v);
function area(pts) { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y); return Math.abs(a) / 2; }

export function wsRows(source, { ls, index, units, surface = null, lang = 'en', quantities = () => [], modifiers = () => [] }) {
  if (!ls) return [];
  const hard = ls.hardscape || [];
  switch (source) {
    case 'plants': return schedule(ls, index, units, lang).rows.map((r) => ({ key: r.key, botanical: r.botanical, cultivar: r.cultivar, name: r.name, type: r.type,
      height: r.size.h, spread: r.size.s, size: r.container, qty: r.qty, plants: r.plants, beds: r.beds, hedges: r.hedges, spec: index.get(r.key)?.spec || '' }));
    case 'areas': return (ls.areas || []).map((a) => { const q = areaQuantities(a, ls, index, units); return { name: a.name, kind: a.kind, area: r3(q.area), perimeter: r3(q.perimeter),
      edging: r3(q.edging), edging_kind: a.buildup.edging, topsoil: r3(q.topsoil), mulch: r3(q.mulch), membrane: r3(q.membrane), plants: q.plants, level: a.level ?? '' }; });
    case 'paving': return hard.filter((h) => h.kind === 'paving').map((h) => ({ name: h.name, area: r3(area(h.pts)), level: r3(surface ? pavingSurface(h, surface).z0 : h.level ?? ''),
      falls: h.falls.mode, pattern: h.pattern.kind, thickness: r3(h.layers.reduce((s, l) => s + l.thickness, 0)), layers: h.layers.map((l) => l.name).join(', ') }));
    case 'walls': return hard.filter((h) => h.kind === 'wall').map((h) => { const w = wallLayout(h, surface, units); return { name: h.name, kind: h.wall, length: r3(w.length),
      max_height: r3(w.maxHeight), min_height: r3(w.minHeight), face_area: r3(w.faceArea), volume: r3(w.volume), footing_steps: w.steps, material: h.material }; });
    case 'steps': return hard.filter((h) => h.kind === 'steps').map((h) => { const s = stepsLayout(h, surface, units); return { name: h.name, risers: s.n, riser: r3(s.riser), going: r3(s.going),
      height: r3(s.H), run: r3(s.run), flights: s.flights, fits: s.fits, width: h.width }; });
    case 'modifiers': return modifiers().map((m) => ({ name: m.name, kind: m.kind, cut: r3(m.cut), fill: r3(m.fill), net: r3(m.fill - m.cut) }));
    case 'quantities': return quantities().map((q) => ({ key: q.key, kind: String(q.key).split(':')[0], name: q.name, unit: q.unit, qty: q.qty }));
    default: return [];
  }
}

export function defaultWorksheets(t) {
  return [
    { id: 'w1', name: t('ls.ws.d.plants'), source: 'plants', columns: [
      { label: t('ls.sch.botanical'), expr: 'botanical', total: '' }, { label: t('ls.sch.cultivar'), expr: 'cultivar', total: '' }, { label: t('ls.sch.name'), expr: 'name', total: '' },
      { label: t('ls.sch.container'), expr: 'size', total: '' }, { label: t('ls.ws.c.qty'), expr: 'qty', total: 'sum' }], group: '', filter: '', sort: null, onSheet: true },
    { id: 'w2', name: t('ls.ws.d.hard'), source: 'quantities', columns: [
      { label: t('ls.ws.c.item'), expr: 'name', total: '' }, { label: t('ls.ws.c.unit'), expr: 'unit', total: '' }, { label: t('ls.ws.c.qty'), expr: 'qty', total: '', dec: 2 }],
      group: 'unit', filter: 'or(kind = "hard", kind = "area")', sort: null, onSheet: true },
  ];
}
