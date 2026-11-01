/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — a file that cannot be read is told as `code` plus a plain-English fallback; the apps word the code from their own language files (supply.err.<code>) */
/**
 * supply.js — supplier stock and lead-time files (0.8 EG.51; the shared engine, round 3 detail_PART_3). DOM-free, imports nothing: tested in Node, copied byte for
 * byte into the apps by tools/supply/sync.mjs (rule 39: built for every app, SuperCad Studio one of them; an app only says what it needs).
 *
 * A supplier's stock list (CSV: item, SKU, in stock, lead time, price, unit, supplier) is read and matched to what a model needs (a list of needs: name,
 * unit, quantity), and each need is checked: enough in stock? how long to wait? No network and no model: the person brings the file, the page never asks a
 * supplier anything. What is read from the file is content, never instructions (rule 36): names and numbers, nothing more.
 *
 *   readSupplyCsv(text)                  → { ok, rows, warnings } | { ok: false, code, error }  (code: empty | no-header | no-name | no-stock | none)     rows: { name, sku, unit, stock, inStock, lead, backorder, price, supplier, eta }
 *   emptySupply() / readSupply(json) / writeSupply(s)   the part an app keeps in its file (optional key `supply`, v 1)
 *   addSource(supply, { name, at, rows }, needs)         a file's rows (the matching ones first) join the list
 *   check(needs, supply)                 → { rows: [{ id, name, unit, need, row, exact, status, stock, short, lead, … }], unmatched, critical, leadDays }
 *   problemsOf(res, { t, app })          → problems for ccProblems (supply.short, supply.lead)
 *   keyOf(text)                          the matching key of a name ("W16 X 26" and "w16x26" are one)
 *
 * A need = { id, name, unit, need, units?: { m: x, ea: y, kg: z }, about?: { kind, id, label } }. With `units` a row in any of those units is compared in
 * its own unit (a steel yard lists bars in each, lengths in metres and weight in kilograms); without it the supplier's unit must be the need's.
 */

export const LIMIT = { rows: 2000, sources: 5, text: 200 };
const clean = (s, n = LIMIT.text) => String(s ?? '').replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
export const keyOf = (text) => clean(text, 120).toLowerCase().replace(/[×✕*]/g, 'x').replace(/\s*x\s*/g, 'x').replace(/[^a-z0-9.x\/ -]/g, ' ').replace(/[ -]+/g, ' ').trim();

/** A small CSV reader (RFC 4180: quoted fields, doubled quotes, CRLF), comma, semicolon or tab separated by what the first line uses. */
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const first = src.split(/\r?\n/, 1)[0] || '';
  const sep = (first.match(/\t/g) || []).length > (first.match(/,/g) || []).length ? '\t' : (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; continue; }
    if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && src[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; if (rows.length > 100000) break; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const HEAD = [
  ['sku', /^(sku|part\s*(no|number|#)?|item\s*(#|no\.?|number|code)|product\s*(#|no\.?|code|number)|catalog\s*(#|no\.?|number)|code)$/i],
  ['name', /^(item|name|description|product|material|section|profile|item\s*name|product\s*name)$/i],
  ['lead', /lead|delivery\s*(time|days)|ships?\s*(in|within)/i],
  ['stock', /(in\s*stock|on\s*hand|available|inventory|stock|qty|quantity)/i],
  ['unit', /^(unit|uom|u\/m|unit\s*of\s*measure|per)$/i],
  ['price', /(unit\s*)?(price|cost)/i],
  ['supplier', /(supplier|vendor|source|branch|yard|warehouse|mill)/i],
  ['eta', /(eta|restock|back\s*in\s*stock|due|expected)/i],
];

/** "1,200" → 1200 · "Out of stock" / "OOS" → 0 · "In stock" → inStock · "" → unknown. */
export function parseStock(text) {
  const s = clean(text, 60).toLowerCase();
  if (!s) return { stock: null, inStock: null };
  if (/^(out of stock|oos|none|sold out|nil)$/.test(s)) return { stock: 0, inStock: false };
  if (/^(in stock|yes|available|y)$/.test(s)) return { stock: null, inStock: true };
  const m = /^([<>~≥≤]?\s*)?(\d[\d,]*(?:\.\d+)?)\s*\+?\s*([a-z.\/²³]*)$/.exec(s);
  if (!m) return { stock: null, inStock: null };
  const n = Number(m[2].replace(/,/g, ''));
  return Number.isFinite(n) && n >= 0 && n <= 1e12 ? { stock: n, inStock: n > 0 } : { stock: null, inStock: null };
}
/** "5 days" · "2 wks" · "2-3 weeks" (the longer) · "3 months" · "same day" / "stock" → 0 · "backorder" → null + backorder. `bare` = the unit of a plain number. */
export function parseLead(text, bare = 'day') {
  const s = clean(text, 60).toLowerCase();
  if (!s) return { lead: null, backorder: false };
  if (/back\s*order|tbd|call|unknown|n\/a|discontinued/.test(s)) return { lead: null, backorder: true };
  if (/^(same day|immediate|immediately|stock|in stock|now|next day)$/.test(s)) return { lead: /next/.test(s) ? 1 : 0, backorder: false };
  const m = /(\d+(?:\.\d+)?)(?:\s*[-–to]+\s*(\d+(?:\.\d+)?))?\s*(day|d\b|business day|week|wk|w\b|month|mo\b)?/.exec(s);
  if (!m) return { lead: null, backorder: false };
  const n = Math.max(Number(m[1]), m[2] ? Number(m[2]) : 0), u = (m[3] || bare).replace(/s$/, '');
  const days = /^(week|wk|w)/.test(u) ? n * 7 : /^(month|mo)/.test(u) ? n * 30 : /^business/.test(u) ? Math.ceil(n * 7 / 5) : n;
  return days >= 0 && days <= 3650 ? { lead: Math.round(days * 10) / 10, backorder: false } : { lead: null, backorder: false };
}
const money = (text) => { const m = /(\d[\d,]*(?:\.\d+)?)/.exec(String(text ?? '')); if (!m) return null; const n = Number(m[1].replace(/,/g, '')); return Number.isFinite(n) && n >= 0 && n < 1e9 ? Math.round(n * 10000) : null; };

export function readSupplyCsv(text) {
  const all = parseCsv(text);
  if (!all.length) return { ok: false, code: 'empty', error: 'The file is empty.' };
  const hi = all.findIndex((r) => r.filter((c) => c && c.trim()).length >= 2);
  if (hi < 0) return { ok: false, code: 'no-header', error: 'The file has no header row.' };
  const head = all[hi].map((h) => clean(h, 80));
  const col = {};
  head.forEach((h, i) => { for (const [k, re] of HEAD) if (col[k] === undefined && re.test(h)) { col[k] = i; break; } });
  if (col.name === undefined && col.sku === undefined) return { ok: false, code: 'no-name', error: 'No Item, Name, Description or SKU column was found in the header row.' };
  if (col.stock === undefined && col.lead === undefined) return { ok: false, code: 'no-stock', error: 'No stock or lead-time column was found in the header row.' };
  const leadBare = /week|wk/i.test(head[col.lead] || '') ? 'week' : /month/i.test(head[col.lead] || '') ? 'month' : 'day';
  const rows = [], warnings = [];
  let skipped = 0;
  for (const r of all.slice(hi + 1)) {
    if (!r.some((c) => c && c.trim())) continue;
    const g = (k) => (col[k] === undefined ? '' : r[col[k]] ?? '');
    const name = clean(g('name')), sku = clean(g('sku'), 60);
    if (!name && !sku) { skipped++; continue; }
    const st = parseStock(g('stock')), ld = parseLead(g('lead'), leadBare);
    if (st.stock === null && st.inStock === null && ld.lead === null && !ld.backorder) { skipped++; continue; }
    if (rows.length >= 20000) { warnings.push('Only the first 20,000 rows were read.'); break; }
    rows.push({ name: name || sku, sku, unit: clean(g('unit'), 12), ...st, ...ld, price: col.price === undefined ? null : money(g('price')), supplier: clean(g('supplier'), 80), eta: clean(g('eta'), 40) });
  }
  if (skipped) warnings.push(skipped + (skipped === 1 ? ' row had no name or no stock and lead time and was left out.' : ' rows had no name or no stock and lead time and were left out.'));
  if (!rows.length) return { ok: false, code: 'none', error: 'No row had an item and a stock or lead time.' };
  return { ok: true, rows, warnings };
}

// ---- the part kept in the file ----
export const emptySupply = () => ({ v: 1, leadDays: 14, sources: [], ignore: [] });
const rowOk = (r) => r && typeof r === 'object' && clean(r.name);
const cleanRow = (r) => ({ name: clean(r.name), sku: clean(r.sku, 60), unit: clean(r.unit, 12), stock: Number.isFinite(r.stock) && r.stock >= 0 && r.stock <= 1e12 ? r.stock : null, inStock: typeof r.inStock === 'boolean' ? r.inStock : null,
  lead: Number.isFinite(r.lead) && r.lead >= 0 && r.lead <= 3650 ? r.lead : null, backorder: r.backorder === true, price: Number.isInteger(r.price) && r.price >= 0 && r.price < 1e13 ? r.price : null, supplier: clean(r.supplier, 80), eta: clean(r.eta, 40) });
export function readSupply(json) {
  const s = emptySupply();
  if (!json || typeof json !== 'object' || json.v !== 1) return null;
  if (Number.isFinite(json.leadDays) && json.leadDays >= 0 && json.leadDays <= 3650) s.leadDays = json.leadDays;
  let n = 0;
  for (const src of (Array.isArray(json.sources) ? json.sources : []).slice(0, LIMIT.sources)) {
    const rows = (Array.isArray(src?.rows) ? src.rows : []).filter(rowOk).slice(0, Math.max(0, LIMIT.rows - n)).map(cleanRow);
    n += rows.length;
    if (rows.length) s.sources.push({ name: clean(src.name, 120) || 'Supplier file', at: typeof src.at === 'string' ? src.at.slice(0, 24) : '', rows });
  }
  s.ignore = (Array.isArray(json.ignore) ? json.ignore : []).filter((x) => typeof x === 'string' && x.length <= 80).slice(0, 500);
  return s.sources.length || s.ignore.length ? s : null;
}
export const writeSupply = (s) => JSON.parse(JSON.stringify(s));

const words = (k) => new Set(k.split(' ').filter(Boolean));
/** Which supplier row is for this need: the same name, else the SKU in the name, else one name inside the other (a lower rank, `exact` false). */
function matchRow(need, rows) {
  const key = keyOf(need.name), ws = words(key);
  let best = null;
  for (const r of rows) {
    const rk = keyOf(r.name);
    let rank = 0;
    if (rk && rk === key) rank = 3;
    else if (r.sku && ws.has(keyOf(r.sku))) rank = 2;
    else if (rk && key) { const rw = words(rk); if ([...ws].every((x) => rw.has(x)) || [...rw].every((x) => ws.has(x))) rank = 1; }
    if (rank && (!best || rank > best.rank || (rank === best.rank && betterRow(r, best.row)))) best = { row: r, rank };
  }
  return best;
}
const betterRow = (a, b) => (a.stock ?? -1) > (b.stock ?? -1);
const unitKey = (u) => String(u || '').toLowerCase().replace(/[^a-z0-9²³]/g, '');
const SAME = [['ea', 'each', 'pc', 'pcs', 'piece', 'pieces', 'unit', 'units', 'bar', 'bars', 'length', 'lengths'], ['m', 'metre', 'metres', 'meter', 'meters', 'lm'], ['lf', 'ft', 'linearfeet', 'linearfoot'], ['kg', 'kgs', 'kilogram', 'kilograms'], ['t', 'tonne', 'tonnes', 'mt'],
  ['sf', 'sqft', 'squarefeet'], ['sy', 'sqyd'], ['cy', 'cuyd']];
const groupOf = (u) => { const k = unitKey(u); return SAME.findIndex((g) => g.includes(k)); };
const sameUnit = (a, b) => { const x = unitKey(a), y = unitKey(b); return !x || !y || x === y || (groupOf(a) >= 0 && groupOf(a) === groupOf(b)); };
/** The quantity the need has in the supplier row's unit (the need's own unit, or one of `units`; tonnes from kilograms). { amount, unit } or null. */
function needIn(n, row) {
  if (sameUnit(n.unit, row.unit)) return { amount: n.need, unit: n.unit };
  for (const [u, v] of Object.entries(n.units || {})) if (v > 0 && sameUnit(u, row.unit)) return { amount: v, unit: u };
  if (n.units && n.units.kg > 0 && groupOf(row.unit) === groupOf('t')) return { amount: n.units.kg / 1000, unit: row.unit };
  return null;
}

/** A file's rows join the list (the same name from the same file replaces); the rows that match something needed come first when there are too many. */
export function addSource(supply, src, needs = []) {
  const out = supply ? readSupply(JSON.parse(JSON.stringify(supply))) || emptySupply() : emptySupply();
  const keys = needs.map((n) => keyOf(n.name)), ws = needs.map((n) => words(keyOf(n.name)));
  const score = (r) => { const rk = keyOf(r.name); return keys.includes(rk) || ws.some((w) => r.sku && w.has(keyOf(r.sku))) ? 2 : ws.some((w) => { const rw = words(rk); return [...w].every((x) => rw.has(x)) || [...rw].every((x) => w.has(x)); }) ? 1 : 0; };
  const rows = src.rows.map((r, i) => ({ r, s: score(r), i })).sort((a, b) => b.s - a.s || a.i - b.i);
  const kept = rows.slice(0, LIMIT.rows).map((x) => cleanRow(x.r));
  out.sources = out.sources.filter((s) => s.name !== src.name);
  out.sources.push({ name: clean(src.name, 120), at: src.at || '', rows: kept });
  while (out.sources.length > LIMIT.sources) out.sources.shift();
  let n = 0;
  for (const s of out.sources) { s.rows = s.rows.slice(0, Math.max(0, LIMIT.rows - n)); n += s.rows.length; }
  return { supply: out, kept: kept.length, dropped: src.rows.length - kept.length, matched: rows.filter((x) => x.s > 0).length };
}

/** Each need against the supplier rows. status: ok · short (stock below the need) · late (lead time over the person's limit) · unknown (no stock figure) · unit (the supplier's unit is not one of the need's). */
export function check(needs, supply) {
  const all = (supply?.sources || []).flatMap((s) => s.rows.map((r) => ({ ...r, source: s.name })));
  const ignore = new Set(supply?.ignore || []);
  const limit = supply?.leadDays ?? 14;
  const rows = [], unmatched = [];
  for (const n of needs) {
    if (ignore.has(n.id) || !(n.need > 0)) continue;
    const m = all.length ? matchRow(n, all) : null;
    if (!m) { unmatched.push(n); continue; }
    const r = m.row, q = needIn(n, r);
    const base = { ...n, row: r, exact: m.rank >= 2, stock: r.stock, lead: r.lead, backorder: r.backorder, supplier: r.supplier || r.source, price: r.price };
    if (!q) { rows.push({ ...base, status: 'unit' }); continue; }
    const short = r.stock !== null ? Math.max(0, q.amount - r.stock) : r.inStock === false ? q.amount : null;
    const status = short > 0 ? 'short' : (r.lead !== null && r.lead > limit) || r.backorder ? (r.inStock === true || (r.stock !== null && r.stock >= q.amount) ? 'ok' : 'late') : short === null && r.stock === null && r.inStock === null ? 'unknown' : 'ok';
    rows.push({ ...base, need: q.amount, unit: q.unit, short: short || 0, status });
  }
  const waiting = rows.filter((r) => (r.status === 'short' || r.status === 'late') && r.lead !== null);
  const critical = waiting.length ? waiting.reduce((a, b) => (b.lead > a.lead ? b : a)) : null;
  return { rows, unmatched, critical, leadDays: limit };
}

/** Problems in the shared shape (rule 29). `t(key, vars)` words them; ids do not change with the language. `app` names the source; `keys` = { short, lead, back } message keys. */
export function problemsOf(res, { t = (k) => k, fmt = (n) => String(Math.round(n * 100) / 100), app = 'app', keys = { short: 'eg51.prob.short', lead: 'eg51.prob.lead', back: 'eg51.prob.back' } } = {}) {
  const out = [];
  for (const r of res.rows) {
    const about = r.about ? [r.about] : [];
    if (r.status === 'short') {
      const vars = { name: r.name, need: fmt(r.need), stock: r.stock === null ? '0' : fmt(r.stock), unit: r.unit, short: fmt(r.short) };
      out.push({ id: app + ':supply.short:' + r.id, code: 'supply.short', severity: 'warning', about, msg: { key: keys.short, vars }, text: t(keys.short, vars),
        req: { op: '>=', value: Math.round(r.need * 100) / 100, unit: r.unit }, found: { value: r.stock === null ? 0 : r.stock, unit: r.unit }, acceptable: true });
    } else if (r.status === 'late') {
      const vars = { name: r.name, lead: r.lead === null ? '?' : fmt(r.lead), limit: fmt(res.leadDays) };
      out.push({ id: app + ':supply.lead:' + r.id, code: 'supply.lead', severity: 'note', about, msg: { key: r.backorder ? keys.back : keys.lead, vars }, text: t(r.backorder ? keys.back : keys.lead, vars),
        ...(r.lead !== null ? { req: { op: '<=', value: res.leadDays, unit: 'days' }, found: { value: r.lead, unit: 'days' } } : {}), acceptable: true });
    }
  }
  return out;
}
