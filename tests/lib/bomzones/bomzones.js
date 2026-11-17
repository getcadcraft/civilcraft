/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the only words here are English fallbacks; every host passes its own labels. */
/**
 * bomzones.js — bills of materials by zone (0.9.1, suggestion #1503: "multiple dynamic BOMs associated to different zones of a
 * drawing", with columns ticked on and off). Canonical in lib/bomzones/; hosts carry a byte-identical copy
 * (`node tools/bomzones/sync.mjs <app>`; CadCraft is the first host). No DOM, no imports: a host maps its own objects to ITEMS
 * and draws the lines and texts this returns.
 *
 *   An ITEM (from the host)  { id, kind: 'block' | 'object', name, layer, x, y, attrs: { TAG: value }, length: number | null,
 *                              area: number | null }     x, y = the point the item is counted by (the host states its rule)
 *   A ZONE                   a closed polygon [{ x, y }…]; null = the whole drawing
 *   A TABLE (saved by the host, cleaned by cleanTable: a file is untrusted)
 *     { v: 1, id, zone: '<zone id>' | '', title, showTitle, totals, frozen, blocks, objects, h (text height),
 *       group: 'detail' | 'name' | 'layer' | 'attr:<TAG>', sort: { key, dir: 1 | -1 },
 *       columns: [{ key, on, label }]       key: item | qty | name | layer | length | area | remarks | attr:<TAG>; list order = table order
 *       nums: { <row hash>: item number }, next: the next free item number, remarks: { <row hash>: text } }
 *
 *   pointInZone(p, poly)            even-odd rule; a point exactly on the edge counts as inside
 *   collect(items, poly)            the items counted in the zone (poly null: all of them)
 *   attrTags(items)                 every attribute tag the items carry, in first-seen order
 *   syncColumns(table, items)       the table with a column added for every tag it does not list yet (new ones shown while few)
 *   groupRows(items, table)         → rows [{ key, hash, kind, name, layer, qty, length, area, attrs, ids }]
 *   numberRows(rows, table)         item numbers that stay: a known row keeps its number, a new row takes `next`; → { nums, next }
 *   renumber(rows, table)           1…n in the table's sort order; → { nums, next }
 *   buildTable(table, items, opts)  → { title, columns: [{ key, label, align }], rows: [{ key, hash, item, cells }], totals, nums, next }
 *   diffTables(a, b)                → { added, removed, changed } (row hashes)
 *   layoutTable(result, { h, measure }) → { lines: [{ x1, y1, x2, y2 }], texts: [{ x, y, h, s, align }], width, height } drawn down from (0, 0)
 *   toCsv(result)                   comma-separated, CRLF; a cell starting with = + - @ gets a leading ' (formula injection)
 *   pack(obj) / unpack(strings)     a small record as short ASCII strings (extension data in a file keeps ≤ 255 characters each)
 *
 * Point in polygon: the crossing-number (even-odd) test, as in J. O'Rourke, Computational Geometry in C, 2nd ed., §7.4.
 * Hash: FNV-1a 32-bit (Fowler, Noll, Vo; http://www.isthe.com/chongo/tech/comp/fnv/), two passes with different offsets.
 */

export const LIMITS = Object.freeze({ columns: 60, rows: 5000, text: 255, name: 120, pack: 12000, chunk: 200 });
export const BUILTIN = Object.freeze(['item', 'qty', 'name', 'layer', 'length', 'area', 'remarks']);
export const GROUPS = Object.freeze(['detail', 'name', 'layer']);
export const VARIES = '\u0000varies';
const NUMERIC = new Set(['item', 'qty', 'length', 'area']);
const isAttr = (k) => typeof k === 'string' && k.startsWith('attr:') && k.length > 5;
const str = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// ---------------------------------------------------------------------------- zones

/** Is p on the segment a–b (within a tolerance relative to the segment)? */
function onSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), tol = 1e-9 * Math.max(1, len, Math.abs(a.x), Math.abs(a.y));
  if (len <= tol) return Math.hypot(p.x - a.x, p.y - a.y) <= tol;
  if (Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len > tol) return false;
  const u = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (len * len);
  return u >= -1e-12 && u <= 1 + 1e-12;
}

export function pointInZone(p, poly) {
  if (!poly) return true;
  const n = poly.length;
  if (n < 3 || !Number.isFinite(p?.x) || !Number.isFinite(p?.y)) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = poly[i], b = poly[j];
    if (onSegment(p, a, b)) return true;
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function zoneBounds(poly) {
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const p of poly || []) { if (p.x < b.minX) b.minX = p.x; if (p.y < b.minY) b.minY = p.y; if (p.x > b.maxX) b.maxX = p.x; if (p.y > b.maxY) b.maxY = p.y; }
  return b;
}

export function collect(items, poly) {
  if (!poly) return [...items];
  const b = zoneBounds(poly), out = [];
  for (const it of items) {
    if (!(it.x >= b.minX && it.x <= b.maxX && it.y >= b.minY && it.y <= b.maxY)) continue;
    if (pointInZone(it, poly)) out.push(it);
  }
  return out;
}

// ---------------------------------------------------------------------------- the table record

export function defaultTable(over = {}) {
  return cleanTable({ v: 1, id: 't1', zone: '', title: '', showTitle: true, totals: false, frozen: false, blocks: true, objects: false, h: 2.5, group: 'detail',
    sort: { key: 'item', dir: 1 }, columns: [{ key: 'item', on: true }, { key: 'qty', on: true }, { key: 'name', on: true }, { key: 'layer', on: false }, { key: 'length', on: false }, { key: 'area', on: false }, { key: 'remarks', on: false }],
    nums: {}, next: 1, remarks: {}, ...over });
}

const cleanKey = (k) => (BUILTIN.includes(k) ? k : isAttr(k) ? 'attr:' + str(k.slice(5), LIMITS.name) : null);

/** A table record from a file or a dialog: every field checked, unknown ones dropped. → table | null */
export function cleanTable(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const id = str(raw.id, 40);
  if (!/^[A-Za-z0-9_-]{1,40}$/.test(id)) return null;
  const columns = [], seen = new Set();
  for (const c of Array.isArray(raw.columns) ? raw.columns.slice(0, LIMITS.columns * 2) : []) {
    const key = cleanKey(c?.key);
    if (!key || seen.has(key) || columns.length >= LIMITS.columns) continue;
    seen.add(key);
    columns.push({ key, on: c.on !== false, label: str(c.label, LIMITS.name) });
  }
  for (const key of BUILTIN) if (!seen.has(key)) columns.push({ key, on: false, label: '' });   // the built-in columns are always offered
  const group = GROUPS.includes(raw.group) ? raw.group : cleanKey(raw.group) && isAttr(raw.group) ? cleanKey(raw.group) : 'detail';
  const sortKey = cleanKey(raw.sort?.key) || 'item';
  const nums = {}, remarks = {};
  let top = 0;
  if (raw.nums && typeof raw.nums === 'object') for (const [k, v] of Object.entries(raw.nums).slice(0, LIMITS.rows)) if (/^[0-9a-z]{1,16}$/.test(k) && Number.isInteger(v) && v > 0 && v < 1e7) { nums[k] = v; if (v > top) top = v; }
  if (raw.remarks && typeof raw.remarks === 'object') for (const [k, v] of Object.entries(raw.remarks).slice(0, LIMITS.rows)) if (/^[0-9a-z]{1,16}$/.test(k) && str(v).trim()) remarks[k] = str(v);
  const next = Number.isInteger(raw.next) && raw.next > top && raw.next < 1e7 ? raw.next : top + 1;
  return { v: 1, id, zone: /^[A-Za-z0-9_-]{1,40}$/.test(String(raw.zone ?? '')) ? String(raw.zone) : '', title: str(raw.title), showTitle: raw.showTitle !== false, totals: !!raw.totals, frozen: !!raw.frozen,
    blocks: raw.blocks !== false, objects: !!raw.objects, h: Number.isFinite(raw.h) && raw.h > 0 && raw.h < 1e9 ? raw.h : 2.5, group, sort: { key: sortKey, dir: raw.sort?.dir === -1 ? -1 : 1 }, columns, nums, next, remarks };
}

export function attrTags(items) {
  const tags = [];
  const seen = new Set();
  for (const it of items) for (const k of Object.keys(it.attrs || {})) if (!seen.has(k)) { seen.add(k); tags.push(k); }
  return tags;
}

/** Every attribute the items carry gets a column (shown while the table has fewer than `show` attribute columns shown). */
export function syncColumns(table, items, { show = 6 } = {}) {
  const have = new Set(table.columns.map((c) => c.key));
  const add = attrTags(items).map((tag) => 'attr:' + str(tag, LIMITS.name)).filter((k) => !have.has(k));
  if (!add.length) return table;
  let shown = table.columns.filter((c) => isAttr(c.key) && c.on).length;
  const columns = table.columns.slice();
  const at = Math.max(0, columns.findIndex((c) => c.key === 'remarks'));   // attributes go before the remarks
  const fresh = [];
  for (const key of add) { if (columns.length + fresh.length >= LIMITS.columns) break; fresh.push({ key, on: shown++ < show, label: '' }); }
  columns.splice(columns.some((c) => c.key === 'remarks') ? at : columns.length, 0, ...fresh);
  return { ...table, columns };
}

// ---------------------------------------------------------------------------- rows

function fnv(s, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
/** A row's short stable name in the saved record (the numbers and remarks hang on it). */
export const hashKey = (key) => fnv(key, 0x811c9dc5).toString(36) + fnv(key, 0x9747b28c).toString(36);

function keyOf(it, group) {
  if (it.kind !== 'block') return 'O\u0001' + (it.layer ?? '');
  if (group === 'name') return 'N\u0001' + it.name;
  if (group === 'layer') return 'L\u0001' + (it.layer ?? '');
  if (isAttr(group)) return 'A\u0001' + group.slice(5) + '\u0001' + String(it.attrs?.[group.slice(5)] ?? '');
  const a = it.attrs || {};
  return 'B\u0001' + it.name + Object.keys(a).sort().map((k) => '\u0001' + k + '=' + String(a[k] ?? '')).join('');
}
const merge = (cur, v) => (cur === undefined ? v : cur === v ? cur : VARIES);
const natural = (a, b) => String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) || (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);

export function groupRows(items, table) {
  const by = new Map();
  for (const it of items) {
    if (it.kind === 'block' ? !table.blocks : !table.objects) continue;
    const key = keyOf(it, table.group);
    let r = by.get(key);
    if (!r) { if (by.size >= LIMITS.rows) continue; by.set(key, (r = { key, hash: hashKey(key), kind: it.kind === 'block' ? 'block' : 'object', name: undefined, layer: undefined, qty: 0, length: null, area: null, attrs: {}, tags: new Set(), ids: [] })); }
    r.qty++;
    r.ids.push(it.id);
    r.name = merge(r.name, it.kind === 'block' ? String(it.name ?? '') : '');
    r.layer = merge(r.layer, String(it.layer ?? ''));
    if (Number.isFinite(it.length)) r.length = (r.length || 0) + it.length;
    if (Number.isFinite(it.area)) r.area = (r.area || 0) + it.area;
    const a = it.attrs || {};
    for (const tag of new Set([...r.tags, ...Object.keys(a)])) {
      const v = own(a, tag) ? String(a[tag] ?? '') : '';
      r.attrs[tag] = r.qty === 1 ? v : merge(own(r.attrs, tag) ? r.attrs[tag] : '', v);
      r.tags.add(tag);
    }
  }
  const rows = [...by.values()].sort((a, b) => natural(a.key, b.key));
  for (const r of rows) delete r.tags;
  return rows;
}

export function numberRows(rows, table) {
  const nums = {};
  let next = Math.max(1, table.next | 0);
  for (const r of rows) if (own(table.nums || {}, r.hash)) nums[r.hash] = table.nums[r.hash];
  for (const r of rows) if (!own(nums, r.hash)) nums[r.hash] = next++;   // a number is never handed out twice: `next` only grows
  for (const r of rows) r.item = nums[r.hash];
  return { nums, next };
}

const valueOf = (r, key, table) => (key === 'item' ? r.item : key === 'qty' ? r.qty : key === 'name' ? r.name : key === 'layer' ? r.layer : key === 'length' ? r.length : key === 'area' ? r.area
  : key === 'remarks' ? table.remarks?.[r.hash] ?? '' : isAttr(key) ? r.attrs[key.slice(5)] ?? '' : '');

export function sortRows(rows, table) {
  const { key, dir } = table.sort || { key: 'item', dir: 1 };
  const num = NUMERIC.has(key);
  return rows.slice().sort((a, b) => {
    const x = valueOf(a, key, table), y = valueOf(b, key, table);
    const c = num ? (x ?? -Infinity) - (y ?? -Infinity) : natural(x === VARIES ? '' : x ?? '', y === VARIES ? '' : y ?? '');
    return (c || (a.item ?? 0) - (b.item ?? 0) || natural(a.key, b.key)) * (c ? dir : 1);
  });
}

/** Item numbers 1…n in the order the table shows its rows now (sorted by something other than the item number: that order). */
export function renumber(rows, table) {
  const order = sortRows(rows.map((r) => ({ ...r, item: table.nums?.[r.hash] ?? Infinity })), table.sort?.key === 'item' ? { ...table, sort: { key: 'item', dir: 1 } } : table);
  const nums = {};
  order.forEach((r, i) => { nums[r.hash] = i + 1; });
  for (const r of rows) r.item = nums[r.hash];
  return { nums, next: order.length + 1 };
}

const plain = (v, dec = 2) => (Number.isFinite(v) ? String(Number(v.toFixed(dec))) : '');

/**
 * The table as text. opts: labels { item, qty, name, layer, length, area, remarks, total, varies, objects ("{layer}" is filled in), title },
 * fmtLength(v), fmtArea(v) (the host's number formats), attrLabel(tag).
 */
export function buildTable(table, items, opts = {}) {
  const L = { item: 'Item', qty: 'Qty', name: 'Name', layer: 'Layer', length: 'Length', area: 'Area', remarks: 'Remarks', total: 'Total', varies: 'varies', objects: '{layer}', title: 'Bill of materials', ...(opts.labels || {}) };
  const fmtLength = opts.fmtLength || plain, fmtArea = opts.fmtArea || plain;
  const rows = groupRows(items, table);
  const { nums, next } = numberRows(rows, table);
  const shown = sortRows(rows, table);
  const cols = table.columns.filter((c) => c.on).map((c) => ({ key: c.key, label: c.label || (isAttr(c.key) ? (opts.attrLabel ? opts.attrLabel(c.key.slice(5)) : c.key.slice(5)) : L[c.key]), align: NUMERIC.has(c.key) ? 'right' : 'left' }));
  const text = (r, key) => {
    const v = valueOf(r, key, table);
    if (v === VARIES) return L.varies;
    if (key === 'name' && r.kind === 'object') return L.objects.replace('{layer}', r.layer === VARIES ? L.varies : r.layer ?? '');
    if (key === 'length') return v === null ? '' : fmtLength(v);
    if (key === 'area') return v === null ? '' : fmtArea(v);
    return v === null || v === undefined ? '' : String(v);
  };
  const out = shown.map((r) => ({ key: r.key, hash: r.hash, item: r.item, kind: r.kind, qty: r.qty, ids: r.ids, cells: cols.map((c) => text(r, c.key)) }));
  let totals = null;
  if (table.totals && cols.length) {
    const sum = (k) => rows.reduce((s, r) => s + (Number.isFinite(r[k]) ? r[k] : 0), 0);
    const any = (k) => rows.some((r) => Number.isFinite(r[k]));
    totals = cols.map((c) => (c.key === 'qty' ? String(sum('qty')) : c.key === 'length' && any('length') ? fmtLength(sum('length')) : c.key === 'area' && any('area') ? fmtArea(sum('area')) : ''));
    const at = cols.findIndex((c) => !NUMERIC.has(c.key));
    const where = at >= 0 ? at : cols.findIndex((c) => c.key === 'item');
    if (where >= 0 && !totals[where]) totals[where] = L.total;
  }
  return { title: table.showTitle ? table.title || L.title : '', columns: cols, rows: out, totals, nums, next };
}

/** What changed between two built tables, by row. */
export function diffTables(a, b) {
  const A = new Map((a?.rows || []).map((r) => [r.hash, r.cells.join('\u0001')])), B = new Map((b?.rows || []).map((r) => [r.hash, r.cells.join('\u0001')]));
  const added = [], removed = [], changed = [];
  for (const [k, v] of B) { if (!A.has(k)) added.push(k); else if (A.get(k) !== v) changed.push(k); }
  for (const k of A.keys()) if (!B.has(k)) removed.push(k);
  return { added, removed, changed, same: !added.length && !removed.length && !changed.length && (a?.title ?? '') === (b?.title ?? '') && JSON.stringify(a?.columns || []) === JSON.stringify(b?.columns || []) && JSON.stringify(a?.totals ?? null) === JSON.stringify(b?.totals ?? null) && (a?.rows || []).map((r) => r.hash).join() === (b?.rows || []).map((r) => r.hash).join() };
}

// ---------------------------------------------------------------------------- drawing and CSV

/** The table as lines and texts, drawn downward from its top left corner at (0, 0). measure(s, h) → the text's width. */
export function layoutTable(result, { h = 2.5, measure = null } = {}) {
  const w = (s) => (measure ? measure(String(s), h) : String(s).length * h * 0.62);
  const pad = h * 0.6, rowH = h * 2, n = result.columns.length;
  const lines = [], texts = [];
  if (!n) return { lines, texts, width: 0, height: 0 };
  const widths = result.columns.map((c, i) => Math.max(w(c.label), ...result.rows.map((r) => w(r.cells[i])), result.totals ? w(result.totals[i]) : 0, h) + 2 * pad);
  let width = widths.reduce((s, x) => s + x, 0);
  if (result.title) { const need = w(result.title) + 2 * pad; if (need > width) { widths[n - 1] += need - width; width = need; } }
  const xs = [0];
  for (const x of widths) xs.push(xs[xs.length - 1] + x);
  let y = 0;
  const hline = (yy) => lines.push({ x1: 0, y1: yy, x2: width, y2: yy });
  hline(0);
  if (result.title) { texts.push({ x: width / 2, y: y - rowH + (rowH - h) / 2, h, s: result.title, align: 'center' }); y -= rowH; hline(y); }
  const top = y;
  const row = (cells) => {
    cells.forEach((s, i) => { if (s === '' || s === undefined) return; const right = result.columns[i].align === 'right'; texts.push({ x: right ? xs[i + 1] - pad : xs[i] + pad, y: y - rowH + (rowH - h) / 2, h, s: String(s), align: right ? 'right' : 'left' }); });
    y -= rowH; hline(y);
  };
  row(result.columns.map((c) => c.label));
  for (const r of result.rows) row(r.cells);
  if (result.totals) row(result.totals);
  for (let i = 0; i <= n; i++) lines.push({ x1: xs[i], y1: i === 0 || i === n ? 0 : top, x2: xs[i], y2: y });
  return { lines, texts, width, height: -y };
}

const cell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function toCsv(result) {
  const rows = [result.columns.map((c) => c.label), ...result.rows.map((r) => r.cells), ...(result.totals ? [result.totals] : [])];
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

// ---------------------------------------------------------------------------- the record in a file

const PREFIX = 'BOM1:';
/** A record as ASCII strings of at most LIMITS.chunk + 12 characters ("BOM1:<n>:<part>"); null when it would not fit the file's limit. */
export function pack(obj) {
  const text = JSON.stringify(obj).replace(/[^\x20-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  if (text.length > LIMITS.pack) return null;
  const out = [];
  for (let i = 0; i < text.length; i += LIMITS.chunk) out.push(PREFIX + (out.length + 1) + ':' + text.slice(i, i + LIMITS.chunk));
  return out;
}
export function unpack(strings) {
  const parts = [];
  for (const s of strings || []) { const m = /^BOM1:(\d{1,4}):(.*)$/s.exec(String(s ?? '')); if (m) parts.push([+m[1], m[2]]); }
  if (!parts.length) return null;
  parts.sort((a, b) => a[0] - b[0]);
  const text = parts.map((p) => p[1]).join('');
  if (text.length > LIMITS.pack * 2) return null;
  try { const o = JSON.parse(text); return o && typeof o === 'object' && !Array.isArray(o) ? o : null; } catch { return null; }
}
/** A record small enough for the file: the numbers of rows that are gone are already dropped; when it is still too big the remarks, then the numbers go. */
export function packTable(table) {
  return pack(table) || pack({ ...table, remarks: {} }) || pack({ ...table, remarks: {}, nums: {}, next: table.next });
}
