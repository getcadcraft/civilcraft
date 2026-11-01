/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cutlist.js — parts, cut lists and edge banding for sheet-goods work (0.8 SU.1035, session `sx-cabinet`; shared with SU.874,
 * the window builder). DOM-free and import-free. Canonical in lib/cutlist; the cabinet add-on carries a byte-identical copy
 * (`node tools/cutlist/sync.mjs [--check]` after every change; nobody edits a copy).
 *
 * Units are the caller's (mm or inches); nothing here converts. Sizes are FINISHED sizes (what the part measures with its
 * banding on); the cut size is worked out (`cutSize`).
 *
 * A part:
 *   { id, name, group (the cabinet or assembly it belongs to, e.g. 'B01'), length (along the grain), width, thickness,
 *     material, grain: 'length' | 'none' (default 'length': the grain runs along `length`; 'none' = may be turned any way),
 *     qty = 1, band: { l1, l2, w1, w2 } (each null or a banding { code, thickness }; L1/L2 are the two edges that run along
 *     the length, W1/W2 the two along the width; a cabinet's front edge is L1 by convention), outline (optional: loops of
 *     {x, y, b?} in the part's own frame at the CUT size, x along length, for a part that is not a rectangle — nesting uses it), note }
 *
 *   cleanPart(p) → a part with every field checked (null when it has no size)
 *   cutSize(part, { deductBand = true, premill = 0 }) → { length, width }: finished size less the banding thickness on each
 *     banded edge (the banding adds it back), plus `premill` per banded edge (a bander that trims the edge first)
 *   expand(parts) → one entry per piece: { ...part, copy (1…qty), pieceId: id or id.copy }
 *   cutList(parts, opts) → { groups: [{ key, material, thickness, rows: [part…], pieces, area, cutArea }], pieces, area,
 *     banding: [{ code, thickness, length, edges, withWaste }], sheets: [{ key, material, thickness, area, estimate }] }
 *       opts { deductBand, premill, merge = false (rows that agree in everything but id/name/group become one row, qty added;
 *              their ids are kept in `ids`), bandWaste = 0 (added to each banded edge, e.g. 50 mm of trim), sheet: { w, h }
 *              (a rough sheet count = cut area ÷ sheet area × (1 + kerfWaste), only an estimate: nesting gives the real one),
 *              kerfWaste = 0.15 }
 *   toCsv(list, { columns, unit }) → RFC 4180 text, CRLF, every part a row (formula-looking cells get a leading ')
 *   bandMarks(part) → 'L1 L2 W1' style text; bandSides(part) → ['l1', …]
 *   groupKey(part) → 'material|thickness'
 */

export const SIDES = ['l1', 'l2', 'w1', 'w2'];
const num = (v, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const str = (v, max = 80) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
const round = (v, dp = 6) => { const k = 10 ** dp; const r = Math.round(v * k) / k; return Object.is(r, -0) ? 0 : r; };

export function cleanBand(b) {
  if (!b) return null;
  if (typeof b === 'string') return { code: str(b, 40), thickness: 0 };
  const code = str(b.code, 40), thickness = Math.max(0, num(b.thickness));
  return code || thickness ? { code: code || 'band', thickness } : null;
}

export function cleanPart(p) {
  if (!p || typeof p !== 'object') return null;
  const length = num(p.length), width = num(p.width);
  if (!(length > 0) || !(width > 0)) return null;
  const band = {};
  for (const s of SIDES) band[s] = cleanBand(p.band?.[s]);
  const out = {
    id: str(p.id, 40), name: str(p.name), group: str(p.group, 40),
    length, width, thickness: Math.max(0, num(p.thickness)), material: str(p.material) || 'Material',
    grain: p.grain === 'none' ? 'none' : 'length', qty: Math.max(1, Math.round(num(p.qty, 1))), band, note: str(p.note, 200),
  };
  if (Array.isArray(p.outline) && p.outline.length) out.outline = p.outline;
  if (p.meta && typeof p.meta === 'object') out.meta = p.meta;
  return out;
}

export const bandSides = (part) => SIDES.filter((s) => part.band?.[s]);
export const bandMarks = (part) => bandSides(part).map((s) => s.toUpperCase()).join(' ');
const bt = (part, s) => (part.band?.[s] ? part.band[s].thickness : 0);

export function cutSize(part, { deductBand = true, premill = 0 } = {}) {
  let length = part.length, width = part.width;
  if (deductBand) {
    // the L edges run along the length: their banding sits at the ends of the width, and the other way round
    width -= bt(part, 'l1') + bt(part, 'l2');
    length -= bt(part, 'w1') + bt(part, 'w2');
  }
  if (premill) {
    width += premill * ((part.band?.l1 ? 1 : 0) + (part.band?.l2 ? 1 : 0));
    length += premill * ((part.band?.w1 ? 1 : 0) + (part.band?.w2 ? 1 : 0));
  }
  return { length: round(length), width: round(width) };
}

export function expand(parts) {
  const out = [];
  for (const p of parts) for (let k = 1; k <= p.qty; k++) out.push({ ...p, copy: k, pieceId: p.qty > 1 ? p.id + '.' + k : p.id });
  return out;
}

export const groupKey = (part) => part.material + '|' + part.thickness;
const bandKey = (b) => (b ? b.code + '@' + b.thickness : '');
const sameKind = (a, b) => a.material === b.material && a.thickness === b.thickness && a.length === b.length && a.width === b.width &&
  a.grain === b.grain && SIDES.every((s) => bandKey(a.band[s]) === bandKey(b.band[s])) && !a.outline && !b.outline;

export function cutList(partsIn, { deductBand = true, premill = 0, merge = false, bandWaste = 0, sheet = null, kerfWaste = 0.15 } = {}) {
  const parts = partsIn.map(cleanPart).filter(Boolean);
  const groups = new Map();
  for (const p of parts) {
    const k = groupKey(p);
    if (!groups.has(k)) groups.set(k, { key: k, material: p.material, thickness: p.thickness, rows: [], pieces: 0, area: 0, cutArea: 0 });
    const g = groups.get(k);
    const cut = cutSize(p, { deductBand, premill });
    const prev = merge ? g.rows.find((r) => sameKind(r, p)) : null;
    if (prev) { prev.qty += p.qty; prev.ids.push(p.id); }
    else g.rows.push({ ...p, cut, ids: [p.id] });
    g.pieces += p.qty;
    g.area += p.qty * p.length * p.width;
    g.cutArea += p.qty * cut.length * cut.width;
  }
  // banding: every banded edge's finished length (the edge it covers), plus the waste per edge
  const bands = new Map();
  for (const p of parts) for (const s of SIDES) {
    const b = p.band[s];
    if (!b) continue;
    const k = bandKey(b);
    if (!bands.has(k)) bands.set(k, { code: b.code, thickness: b.thickness, length: 0, edges: 0, withWaste: 0 });
    const e = bands.get(k), len = s[0] === 'l' ? p.length : p.width;
    e.length += p.qty * len; e.edges += p.qty; e.withWaste += p.qty * (len + bandWaste);
  }
  const list = [...groups.values()].sort((a, b) => a.material.localeCompare(b.material) || b.thickness - a.thickness);
  for (const g of list) { g.area = round(g.area); g.cutArea = round(g.cutArea); }
  const banding = [...bands.values()].sort((a, b) => a.code.localeCompare(b.code) || a.thickness - b.thickness)
    .map((b) => ({ ...b, length: round(b.length), withWaste: round(b.withWaste) }));
  const sheetArea = sheet && sheet.w > 0 && sheet.h > 0 ? sheet.w * sheet.h : 0;
  return {
    groups: list,
    pieces: list.reduce((n, g) => n + g.pieces, 0),
    area: round(list.reduce((n, g) => n + g.area, 0)),
    banding,
    sheets: list.map((g) => ({ key: g.key, material: g.material, thickness: g.thickness, area: g.cutArea, estimate: sheetArea ? Math.ceil(round(g.cutArea * (1 + kerfWaste) / sheetArea, 9)) : null })),
  };
}

/**
 * Parts → lib/nest's part list (no import: the shape is lib/nest/nest.js `nest(parts, …)`'s). Each part is nested at its CUT
 * size (the bander adds the rest); x runs along the length, so a part with grain has grain angle 0 and may turn round
 * (turn: true = 0° or 180°), a part without grain any way. One nest per material and thickness: `byMaterial` groups them.
 */
export function toNestParts(partsIn, { deductBand = true, premill = 0 } = {}) {
  const out = [];
  for (const p0 of partsIn) {
    const p = cleanPart(p0);
    if (!p) continue;
    const c = cutSize(p, { deductBand, premill });
    const rect = [{ x: 0, y: 0 }, { x: c.length, y: 0 }, { x: c.length, y: c.width }, { x: 0, y: c.width }];
    out.push({ id: p.id, name: p.name, loops: p.outline || [rect], qty: p.qty, grain: p.grain === 'length' ? 0 : null, turn: true, material: p.material, thickness: p.thickness });
  }
  return out;
}
export function byMaterial(nestParts) {
  const m = new Map();
  for (const p of nestParts) { const k = p.material + '|' + p.thickness; if (!m.has(k)) m.set(k, { key: k, material: p.material, thickness: p.thickness, parts: [] }); m.get(k).parts.push(p); }
  return [...m.values()];
}
/**
 * A nest result → the order the pieces come off the machine: sheet by sheet, in the order they were laid, numbered from 1 on
 * each sheet. [{ pieceId (id, or id.copy when its part has qty > 1), id, copy, sheet (1-based), n }]. `sheetBase` shifts the
 * sheet numbers (several materials: the second nest's sheets follow the first's).
 */
export function nestSequence(result, parts, { sheetBase = 0 } = {}) {
  const qty = new Map(parts.map((p) => [p.id, p.qty || 1]));
  const placed = [...(result?.placed || [])].map((p, i) => ({ p, i })).sort((a, b) => a.p.sheet - b.p.sheet || a.i - b.i);
  const per = new Map(), out = [];
  for (const { p } of placed) {
    const n = (per.get(p.sheet) || 0) + 1;
    per.set(p.sheet, n);
    const copy = (p.copy ?? 0) + 1;
    out.push({ pieceId: (qty.get(p.id) || 1) > 1 ? p.id + '.' + copy : p.id, id: p.id, copy, sheet: sheetBase + p.sheet + 1, n });
  }
  return out;
}

export const CSV_COLUMNS =['id', 'name', 'group', 'material', 'thickness', 'length', 'width', 'qty', 'grain', 'l1', 'l2', 'w1', 'w2', 'cutLength', 'cutWidth', 'note'];
const CSV_HEAD = { id: 'Part', name: 'Name', group: 'Cabinet', material: 'Material', thickness: 'Thickness', length: 'Length', width: 'Width', qty: 'Qty', grain: 'Grain', l1: 'L1', l2: 'L2', w1: 'W1', w2: 'W2', cutLength: 'Cut length', cutWidth: 'Cut width', note: 'Note' };   // i18n-ignore (the library's English default; apps pass their own words as `head`)

export function csvCell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** The cut list as CSV: one row per list row, grouped by material. `head` relabels columns (a translated header). */
export function toCsv(list, { columns = CSV_COLUMNS, head = CSV_HEAD, dp = 2 } = {}) {
  const f = (v) => (typeof v === 'number' ? String(round(v, dp)) : v);
  const rows = [columns.map((c) => csvCell(head[c] ?? c))];
  for (const g of list.groups) for (const r of g.rows) {
    const cell = {
      ...r, id: r.ids.join(' '), grain: r.grain, cutLength: r.cut.length, cutWidth: r.cut.width,
      l1: r.band.l1?.code || '', l2: r.band.l2?.code || '', w1: r.band.w1?.code || '', w2: r.band.w2?.code || '',
    };
    rows.push(columns.map((c) => csvCell(f(cell[c]))));
  }
  return rows.map((r) => r.join(',')).join('\r\n') + '\r\n';
}
