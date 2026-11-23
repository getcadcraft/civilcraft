/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rows.js — a read model (read.js) as takeoff rows, and the rows as a quantities file (0.11 MT.1). DOM-free; host-neutral (lib/modeltakeoff).
 *
 *   groupRows(model, { by: 'type' | 'class' | 'level' | 'material' | 'layer' | 'size' }) → [row]
 *     'class' one row per category · 'type' per category and type (the default) · 'level' per category, type and level
 *     'material' per category and material (0.11 MT.4: a wall, floor or roof built of layers gives each layer's material its own row: drywall,
 *     studs and insulation price apart; the area is the element's own face, the volume is that area times the layer's thickness)
 *     'layer' the same, a layer's thickness part of its row ("Gypsum board, 12.5 mm") · 'size' per category and type, a door or window also per width and height
 *     row = { id, ids: [element ids], group ('wall'), cls: [..IFC classes in it], type, storey, size ({ w, h } m or null), layer (thickness m or 0),
 *             count, boxes, open, kinds: ['length', 'side', 'volume'],
 *             q: { <kind>: { sum (SI), counted, file, shape, rough } } }
 *       layered = how many of those came from a layer's thickness (not the element's own volume);
 *       counted = elements that gave a number; file / shape = how many of those the file stated / the shape gave; rough = how many were measured
 *       as "half the upright faces" (curved or cornered: see measure.js). A box (read.js) is counted in `count` and `boxes` and gives no number.
 *   quantityItems(rows, { t, units: 'imperial' | 'metric', pick: Set<row id> | null }) → [{ key, name, unit, qty, note }]   (fixedqty.js items)
 *   quantitiesFile(rows, { t, units, pick, project, app, made }) → a 'cadcraft-quantities' document
 *   rowsCsv(rows, { t, units }) → CSV text of the rows · openingsSchedule(model) → [{ kind, cls, type, storey, size, count }] · openingsCsv(list, { t, units })
 *   compare(existing, file) → { added, updated, same, gone: [names] }   existing = the takeoff's typed quantities [{ name, unit, qty, origin }]
 *   GROUPS, KIND_UNITS, MAX_ITEMS
 *
 * Keys are stable for the same category, type and level names, so opening a newer copy of the model under the same model name UPDATES the
 * quantities already in the takeoff (the estimator's names, rates, waste and assemblies stay).
 */

export const MAX_ITEMS = 500;                // fixedqty.js QTY_MAX_ITEMS: one quantities file

/** Category → what it is measured in. The first class pattern that matches wins; 'other' takes the rest (count only). */
export const GROUPS = [
  ['wall', /^Ifc(Wall|CurtainWall)/, ['length', 'side', 'volume']],
  ['roof', /^IfcRoof/, ['plan', 'slope', 'volume']],
  ['floor', /^Ifc(Slab|Covering|Plate|Ramp)/, ['plan', 'volume']],
  ['footing', /^Ifc(Footing|Pile)/, ['plan', 'volume']],
  ['column', /^IfcColumn/, ['length', 'volume']],
  ['beam', /^Ifc(Beam|Member)/, ['length', 'volume']],
  ['door', /^IfcDoor/, []],
  ['window', /^IfcWindow/, []],
  ['stair', /^IfcStair/, ['volume']],
  ['railing', /^IfcRailing/, ['length']],
  ['pipe', /^Ifc(PipeSegment|DuctSegment|CableSegment|CableCarrierSegment|FlowSegment)/, ['length']],
  ['room', /^IfcSpace/, ['plan', 'volume']],
];
const KINDS_OF = Object.fromEntries(GROUPS.map(([g, , k]) => [g, k]));

export const KIND_UNITS = {
  metric: { count: ['EA', 1], length: ['m', 1], side: ['m²', 1], plan: ['m²', 1], slope: ['m²', 1], volume: ['m³', 1] },
  imperial: { count: ['EA', 1], length: ['LF', 1 / 0.3048], side: ['SF', 1 / (0.3048 * 0.3048)], plan: ['SF', 1 / (0.3048 * 0.3048)], slope: ['SF', 1 / (0.3048 * 0.3048)], volume: ['CY', 1 / (0.9144 * 0.9144 * 0.9144)] },
};

export function groupOf(cls) {
  for (const [g, re] of GROUPS) if (re.test(cls)) return g;
  return 'other';
}

const fnv = (s, seed) => { let h = seed >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const slug = (s, max) => String(s).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');

export const BY = ['class', 'type', 'level', 'material', 'layer', 'size'];

/** The groups whose elements are built of layers, and the face a layer's volume is that face times its thickness (the first one the element has). */
const LAYERED = { wall: ['side'], floor: ['plan'], roof: ['slope', 'plan'] };

/** "Gypsum board, 12.5 mm" (the layer's thickness is part of what is priced). */
function layerName(l) {
  const mat = l.material || l.name || '';
  const mm = l.thickness * 1000;
  return mat + (l.thickness > 0 ? (mat ? ', ' : '') + Number(mm.toFixed(mm >= 100 ? 0 : 1)) + ' mm' : '');
}
const mmOf = (m) => Math.round(m * 1000);

export function groupRows(model, { by = 'type' } = {}) {
  const rows = new Map();
  for (const e of model.elements) {
    const group = groupOf(e.cls);
    // 'other' keeps its class apart (furniture is not a light fixture); a named group gathers its classes
    const head = group === 'other' ? e.cls : group;
    const split = by === 'material' || by === 'layer';
    const level = by === 'level' ? e.storey : '';
    const size = by === 'size' && e.size && (group === 'door' || group === 'window') ? { w: mmOf(e.size.w) / 1000, h: mmOf(e.size.h) / 1000 } : null;
    // what each row this element lands in is called, and the layer behind it (null: the element's own numbers)
    const layered = split && LAYERED[group] && e.layers && e.layers.length;
    const parts = layered
      ? e.layers.filter((l) => l.thickness > 0 || l.material).map((l) => ({ type: by === 'layer' ? layerName(l) : l.material || l.name || '', layer: l }))
      : split ? [{ type: (e.materials || []).join(' + '), layer: null }] : [{ type: by === 'class' ? '' : e.type, layer: null }];
    const seen = new Set();
    for (const part of parts) {
      const type = part.type;
      const ident = head + '\u0001' + type + '\u0001' + level + (size ? '\u0001' + mmOf(size.w) + 'x' + mmOf(size.h) : '') + (split ? '\u0001m' : '');
      let r = rows.get(ident);
      if (!r) {
        const kinds = KINDS_OF[group] || [];
        r = { id: 'mt:' + (slug(head.replace(/^Ifc/, ''), 14) || 'x') + ':' + (slug([type, level, size ? mmOf(size.w) + 'x' + mmOf(size.h) : ''].filter(Boolean).join(' '), 30) || 'all') + ':' + fnv(ident, 0x811c9dc5) + fnv(ident, 0x9e3779b9).slice(0, 4),
          ids: [], group, other: group === 'other' ? e.cls : '', cls: [], type, storey: level, size, layer: 0, count: 0, boxes: 0, open: 0, kinds,
          q: Object.fromEntries(kinds.map((k) => [k, { sum: 0, counted: 0, file: 0, shape: 0, rough: 0, layered: 0 }])) };
        rows.set(ident, r);
      }
      if (!r.cls.includes(e.cls)) r.cls.push(e.cls);
      if (!seen.has(r)) { r.ids.push(e.id); r.count++; seen.add(r); if (e.box) r.boxes++; }
      if (part.layer) r.layer = Math.max(r.layer, part.layer.thickness);
      if (e.open && r.kinds.includes('volume') && !(e.q.volume) && !part.layer) r.open++;
      const face = part.layer ? (LAYERED[group].map((k) => e.q[k]).find(Boolean) || null) : null;
      for (const k of r.kinds) {
        let v = e.q[k];
        if (part.layer && k === 'volume') v = face && part.layer.thickness > 0 ? { v: face.v * part.layer.thickness, from: 'shape', exact: true, layer: true } : null;
        if (!v) continue;
        const a = r.q[k];
        a.sum += v.v; a.counted++; a[v.from]++;
        if (v.layer) a.layered++;
        if (!v.exact) a.rough++;
      }
    }
  }
  const order = [...GROUPS.map((g) => g[0]), 'other'];
  return [...rows.values()].sort((a, b) => order.indexOf(a.group) - order.indexOf(b.group) || a.other.localeCompare(b.other)
    || a.type.localeCompare(b.type, undefined, { numeric: true }) || a.storey.localeCompare(b.storey, undefined, { numeric: true })
    || (a.size ? a.size.w : 0) - (b.size ? b.size.w : 0) || (a.size ? a.size.h : 0) - (b.size ? b.size.h : 0));
}

/** A door or window size as words: 900 × 2,100 mm, or 3'-0" × 6'-8" (to the nearest quarter inch). */
export function sizeText(size, units = 'metric') {
  if (!size) return '';
  if (units !== 'imperial') return mmOf(size.w).toLocaleString('en-US') + ' \u00d7 ' + mmOf(size.h).toLocaleString('en-US') + ' mm';   // i18n-ignore: unit symbols
  const ftIn = (m) => {
    const q = Math.round(m / 0.0254 * 4) / 4;
    const ft = Math.floor(q / 12 + 1e-9), inch = q - ft * 12;
    return ft + "'-" + Number(inch.toFixed(2)) + '"';
  };
  return ftIn(size.w) + ' \u00d7 ' + ftIn(size.h);
}

/** "Walls", or an unlisted class as words: IfcSanitaryTerminal → "Sanitary terminal". */
export function groupLabel(row, t) {
  if (row.group !== 'other') return t('mt.group.' + row.group);
  const w = row.other.replace(/^Ifc/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
  return w.charAt(0) + w.slice(1).toLowerCase();
}
export function rowLabel(row, t, units = 'metric') {
  return groupLabel(row, t) + (row.type ? ': ' + row.type : '') + (row.size ? ' ' + sizeText(row.size, units) : '') + (row.storey ? ' (' + row.storey + ')' : '');
}

const round = (v) => Number(v.toFixed(v >= 100 ? 2 : 3));

export function quantityItems(rows, { t, units = 'imperial', pick = null } = {}) {
  const U = KIND_UNITS[units] || KIND_UNITS.imperial;
  const items = [];
  for (const r of rows) {
    if (pick && !pick.has(r.id)) continue;
    const label = rowLabel(r, t, units).slice(0, 170);
    items.push({ key: r.id + ':count', name: label + ': ' + t('mt.kind.count'), unit: 'EA', qty: r.count,
      note: t('mt.note.count', { n: r.count }) + (r.boxes ? ' ' + t('mt.note.boxes', { n: r.boxes }) : '') });
    for (const k of r.kinds) {
      const a = r.q[k];
      if (!a.counted) continue;
      const [unit, f] = U[k];
      const have = Math.min(a.counted, r.count);   // a wall with two gypsum layers is one wall in the gypsum row
      const parts = [have === r.count ? t('mt.note.all', { n: r.count }) : t('mt.note.some', { n: have, of: r.count })];
      if (a.file && a.shape) parts.push(t('mt.note.mixed', { file: a.file, shape: a.shape }));
      else parts.push(t(a.file ? 'mt.note.file' : 'mt.note.shape'));
      if (a.rough) parts.push(t('mt.note.rough', { n: a.rough }));
      if (a.layered) parts.push(t('mt.note.layer', { n: a.layered }));
      if (k === 'volume' && r.open) parts.push(t('mt.note.open', { n: r.open }));
      if (r.boxes) parts.push(t('mt.note.boxes', { n: r.boxes }));
      items.push({ key: r.id + ':' + k, name: label + ': ' + t('mt.kind.' + k), unit, qty: round(a.sum * f), note: parts.join(' ').slice(0, 400) });
    }
  }
  return items;
}

export function quantitiesFile(rows, { t, units = 'imperial', pick = null, project = '', app = 'Model', made = new Date().toISOString().replace(/\.\d+Z$/, 'Z') } = {}) {   // i18n-ignore: the origin label default
  return { format: 'cadcraft-quantities', version: 1, app, project: String(project).slice(0, 200), made, items: quantityItems(rows, { t, units, pick }) };
}

const csvCell = (v) => {
  let x = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(x) && !/^-?\d+(\.\d+)?$/.test(x)) x = "'" + x;       // a cell that starts like a formula stays text when the file opens in a spreadsheet
  return /[",\r\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x;
};
const csv = (lines) => lines.map((l) => l.map(csvCell).join(',')).join('\r\n') + '\r\n';

/** The rows as CSV (0.11 MT.4): one line per row, the units in the heading, a blank where a row has no such number. */
export function rowsCsv(rows, { t, units = 'imperial' } = {}) {
  const U = KIND_UNITS[units] || KIND_UNITS.imperial;
  const kinds = ['length', 'side', 'plan', 'slope', 'volume'];
  const head = [t('mt.col.category'), t('mt.col.type'), t('mt.col.size'), t('mt.col.level'), t('mt.col.count'), ...kinds.map((k) => t('mt.col.' + k) + ' (' + U[k][0] + ')')];
  const lines = [head];
  for (const r of rows) {
    lines.push([groupLabel(r, t), r.type, sizeText(r.size, units), r.storey, r.count, ...kinds.map((k) => (r.kinds.includes(k) && r.q[k].counted ? round(r.q[k].sum * U[k][1]) : ''))]);
  }
  return csv(lines);
}

/** Every door and window by type, size and level: [{ kind, cls, type, storey, size, count }], doors before windows. A size the file does not state is null. */
export function openingsSchedule(model) {
  const m = new Map();
  for (const e of model.elements) {
    const kind = groupOf(e.cls);
    if (kind !== 'door' && kind !== 'window') continue;
    const size = e.size ? { w: mmOf(e.size.w) / 1000, h: mmOf(e.size.h) / 1000 } : null;
    const key = kind + '\u0001' + e.type + '\u0001' + e.storey + '\u0001' + (size ? mmOf(size.w) + 'x' + mmOf(size.h) : '');
    const r = m.get(key) || { kind, cls: e.cls, type: e.type, storey: e.storey, size, count: 0 };
    r.count++;
    m.set(key, r);
  }
  return [...m.values()].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'door' ? -1 : 1) || a.type.localeCompare(b.type, undefined, { numeric: true })
    || a.storey.localeCompare(b.storey, undefined, { numeric: true }) || (a.size ? a.size.w : 0) - (b.size ? b.size.w : 0));
}

export function openingsCsv(list, { t, units = 'imperial' } = {}) {
  const lines = [[t('mt.col.category'), t('mt.col.type'), t('mt.col.level'), t('mt.col.width') + ' (' + (units === 'imperial' ? 'in' : 'mm') + ')', t('mt.col.height') + ' (' + (units === 'imperial' ? 'in' : 'mm') + ')', t('mt.col.count')]];
  const d = (m) => (units === 'imperial' ? Number((m / 0.0254).toFixed(2)) : mmOf(m));
  for (const r of list) lines.push([t('mt.group.' + r.kind), r.type, r.storey, r.size ? d(r.size.w) : '', r.size ? d(r.size.h) : '', r.count]);
  return csv(lines);
}

/** What bringing `file` in would do to the typed quantities already in a takeoff (same app + project = the same model, an earlier copy). */
export function compare(existing, file) {
  const mine = existing.filter((it) => it.origin && it.origin.app === file.app && it.origin.project === file.project);
  const byKey = new Map(mine.map((it) => [String(it.origin.key).toLowerCase(), it]));
  const out = { added: 0, updated: 0, same: 0, gone: [], changes: [] };
  const seen = new Set();
  for (const q of file.items) {
    const k = q.key.toLowerCase(), old = byKey.get(k);
    seen.add(k);
    if (!old) { out.added++; continue; }
    if (old.qty === q.qty && old.unit === q.unit) out.same++;
    else { out.updated++; out.changes.push({ name: old.name, from: old.qty, to: q.qty, unit: q.unit, unitFrom: old.unit }); }
  }
  for (const [k, it] of byKey) if (!seen.has(k)) out.gone.push(it.name);
  return out;
}
