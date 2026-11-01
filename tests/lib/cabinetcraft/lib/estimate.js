/* SPDX-License-Identifier: Apache-2.0 */
/**
 * estimate.js — what a job costs to make, from its cut list, banding, hardware and countertops (0.8 DC.117, session `cabinetcraft_addon`).
 * DOM-free. Owner rule EG.76 applies as in PartCraft's Manufacture › Cost: EVERY rate here is a PLACEHOLDER until a shop supplies its
 * own. They are round numbers in one currency, not a price list and not anyone's prices. The result says which rates are still the
 * placeholders (rows carry `placeholder: true`), and the panel and the CSV say so in words.
 *
 *   DEFAULT_RATES   the placeholders. Sheet prices are for the library's stock sheet (2440 × 1220 mm) and scale with the sheet area.
 *   readRates(raw) → only what differs from the defaults, bounded (untrusted); the job keeps this
 *   ratesOf(over) → the full rates (defaults with the overrides) · changedPaths(over) → ['labour.perHour', …]
 *   importRates(text) → { values: { 'labour.perHour': 60, … }, applied: [path], ignored: [{ key, reason ('unknown' | 'bad') }] }  a shop's OWN rate table, CSV (path,value) or JSON
 *   rateSheetCsv(over) → CSV of every rate (path, value, placeholder yes/no) to fill in and import back · leafPaths() → every rate path
 *   ratesLint(project) → { categories: [{ key, paths, placeholder (bool) }], open: [category keys still on placeholders], final (bool) }   the "final quote" gate:
 *        a category is the shop's own when every rate the job USES in it (and markup and tax) was typed or imported (`project.ratesOk` keeps the ones that equal the placeholder)
 *   estimate(build, nestJob | null, { rates (overrides), sheetOf, cutList, linear, install }) →
 *     { currency, rows: [{ key, what (word key), detail, qty, unit (word key), rate (as charged), path (the base rate it comes from), base, amount, placeholder }], subtotal, markup, tax, total,
 *       cabinets, perCabinet, placeholders (count of rows on a placeholder rate), allPlaceholder }
 */
import { MATERIALS, BANDS } from './materials.js';
import { cutListOf, linearList } from './sheets.js';
import { r2 } from './core.js';

export const DEFAULT_RATES = {
  currency: 'USD',
  sheet: Object.fromEntries(MATERIALS.filter((m) => m.role !== 'frame').map((m) => [m.id, ({ 'melamine-18': 48, 'melamine-16': 42, 'ply-18': 75, 'ply-15': 62, 'hdf-8': 22, 'hdf-3': 12, 'ply-6': 28, 'mdf-painted-18': 60, 'laminate-19': 70, 'veneer-ply-18': 120, 'melamine-front-18': 52, 'drawer-ply-15': 58, 'drawer-melamine-16': 44, 'drawer-bottom-hdf-6': 18, 'drawer-bottom-ply-9': 34 })[m.id] ?? 55])),
  sheetOther: 55,
  bandPerM: Object.fromEntries(BANDS.map((b) => [b.id, ({ 'pvc-1': 0.45, 'pvc-2': 0.85, 'abs-04': 0.3, 'veneer-05': 0.7 })[b.id] ?? 0.5])),
  bandOther: 0.5, bandWaste: 0.1,
  hardwoodPerM: 7,            // per metre of a 38 × 19 mm board; scales with width and thickness
  hardware: { hinge: 2.5, plate: 0.9, 'shelf-pin': 0.06, slide: 9, leg: 0.8, bracket: 2.2, pull: 3, fastener: 0.15, carousel: 30, dowel: 0.1 },
  madeToOrder: { curvedPerM: 420 },   // a cabinet with a curved front, made to order: per metre of its front arc (a placeholder; a maker's quote replaces it)
  counterPerM: 85,            // per metre of a 600 mm deep counter; scales with the depth
  labour: { perHour: 45, base: 0.9, drawers: 1.4, wall: 0.7, tall: 1.6, filler: 0.15, endpanel: 0.2, frameExtra: 0.5, install: 0.5 },
  machine: { perHour: 55, minPerSheet: 14 },
  markup: 0.25, tax: 0,
};

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const ok = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1e6;

export function readRates(raw) {
  const out = {};
  const copy = (src, dst, ref) => {
    if (!isObj(src)) return;
    for (const k of Object.keys(src)) {
      if (!(k in ref)) continue;
      if (isObj(ref[k])) { const d = {}; copy(src[k], d, ref[k]); if (Object.keys(d).length) dst[k] = d; }
      else if (k === 'currency') { if (typeof src[k] === 'string' && /^[A-Za-z]{3}$/.test(src[k])) dst[k] = src[k].toUpperCase(); }
      else if (ok(src[k]) && src[k] !== ref[k]) dst[k] = src[k];
    }
  };
  copy(raw, out, DEFAULT_RATES);
  if (out.currency === DEFAULT_RATES.currency) delete out.currency;
  return out;
}
const merge = (base, over) => {
  if (!isObj(base)) return over !== undefined ? over : base;
  const o = {};
  for (const k of Object.keys(base)) o[k] = isObj(base[k]) ? merge(base[k], isObj(over) ? over[k] : undefined) : (isObj(over) && over[k] !== undefined ? over[k] : base[k]);
  return o;
};
export const ratesOf = (over) => merge(DEFAULT_RATES, readRates(over));
/** The base rate at a dotted path ('labour.perHour'), or undefined. */
export const rateAt = (R, path) => String(path).split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), R);
export function changedPaths(over) {
  const out = [];
  const walk = (o, pre) => { for (const [k, v] of Object.entries(o || {})) isObj(v) ? walk(v, pre + k + '.') : out.push(pre + k); };
  walk(readRates(over), '');
  return out;
}

/** Every rate path of the table ('sheet.melamine-18', 'labour.perHour', 'markup' …). */
export function leafPaths(ref = DEFAULT_RATES, pre = '') {
  return Object.keys(ref).flatMap((k) => (isObj(ref[k]) ? leafPaths(ref[k], pre + k + '.') : [pre + k]));
}

/**
 * A shop's own rate table. JSON: the job's `rates` shape (or { rates: … }); CSV or tab / semicolon text: one `path,value` per line (a header line, blank
 * lines and #-comments are skipped; `currency,EUR` sets the currency). Only known paths with sensible numbers (0 … 1,000,000) are taken; the rest is
 * listed as ignored with the reason. Nothing here supplies a rate: it only reads the ones the shop typed.
 */
export function importRates(text) {
  const values = {}, ignored = [];
  const known = new Set(leafPaths());
  const take = (path, v) => {
    if (!known.has(path)) { ignored.push({ key: path, reason: 'unknown' }); return; }
    if (path === 'currency') { if (typeof v === 'string' && /^[A-Za-z]{3}$/.test(v.trim())) values[path] = v.trim().toUpperCase(); else ignored.push({ key: path, reason: 'bad' }); return; }
    const n = typeof v === 'number' ? v : Number(String(v).trim().replace(/^\$/, '').replace(',', '.'));
    if (ok(n)) values[path] = n; else ignored.push({ key: path, reason: 'bad' });
  };
  const src = String(text ?? '').replace(/^\uFEFF/, '');
  let json = null;
  if (/^\s*[{[]/.test(src)) { try { json = JSON.parse(src); } catch { json = null; } }
  if (isObj(json)) {
    const walk = (o, pre) => { for (const [k, v] of Object.entries(o)) { if (isObj(v)) walk(v, pre + k + '.'); else take(pre + k, v); } };
    walk(isObj(json.rates) ? json.rates : json, '');
  } else {
    for (const line of src.split(/\r?\n/).slice(0, 2000)) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;
      const cells = l.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cells.length < 2) continue;
      if (/^(path|rate|key|name)$/i.test(cells[0]) && !known.has(cells[0])) continue;
      take(cells[0], cells[1]);
    }
  }
  return { values, applied: Object.keys(values), ignored };
}

export function rateSheetCsv(over = {}, { head = { path: 'path', value: 'value', placeholder: 'placeholder' }, yes = 'yes', no = 'no' } = {}) {
  const R = ratesOf(over), changed = new Set(changedPaths(over));
  const q = (v) => { const s = String(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const lines = [[head.path, head.value, head.placeholder].map(q).join(',')];
  for (const p of leafPaths()) lines.push([p, rateAt(R, p), changed.has(p) ? no : yes].map(q).join(','));
  return lines.join('\r\n') + '\r\n';
}

const SHEET_AREA = 2440 * 1220;

export function estimate(build, nestJob, { rates: over = {}, sheetOf = () => ({ w: 2440, h: 1220 }), install = false, ok: okPaths = [] } = {}) {
  const R = ratesOf(over);
  const changed = new Set([...changedPaths(over), ...okPaths]);
  const unit = build.project.unit;
  const mmK = unit === 'in' ? 25.4 : 1;
  const rows = [];
  const add = (key, what, detail, qty, unitKey, rate, path) => {
    const amount = r2(qty * rate);
    if (!(qty > 0)) return;
    rows.push({ key, what, detail, qty: Math.round(qty * 1000) / 1000, unit: unitKey, rate, amount, path, base: rateAt(R, path), placeholder: !changed.has(path) });
  };
  const sheetRate = (name, sh) => {
    const id = build.materialNames ? build.materialNames.get(name) : null;      // the library id whose written name this is (a typed name has none)
    const known = id && id in R.sheet;
    const area = sh.w * sh.h * mmK * mmK;
    return { rate: r2((known ? R.sheet[id] : R.sheetOther) * (area / SHEET_AREA)), path: known ? 'sheet.' + id : 'sheetOther' };
  };
  // sheets: from the nest when it ran, else the cut list's area estimate
  const cl = cutListOf(build.parts, { sheet: { w: 2440 / mmK, h: 1220 / mmK } });
  const sheetsFor = (g) => {
    const m = nestJob && nestJob.mats.find((x) => x.material === g.material && x.thickness === g.thickness);
    if (m) return { n: m.result.sheets.length, sh: m.sheet, nested: true };
    const sh = sheetOf(g.material, g.thickness);
    const area = g.cutArea * (1 + 0.15), n = Math.max(1, Math.ceil(area / (sh.w * sh.h)));
    return { n, sh, nested: false };
  };
  for (const g of cl.groups) {
    const { n, sh, nested } = sheetsFor(g);
    const sr = sheetRate(g.material, sh);
    add('sheet:' + g.key, 'est.sheets', g.material + ' ' + g.thickness + (nested ? '' : ' (area)'), n, 'est.u.sheet', sr.rate, sr.path);
  }
  for (const b of cl.banding) {
    const id = (BANDS.find((x) => (build.bandNames && build.bandNames.get(x.id) === b.code)) || {}).id;
    const perM = id && id in R.bandPerM ? R.bandPerM[id] : R.bandOther;
    const path = id && id in R.bandPerM ? 'bandPerM.' + id : 'bandOther';
    add('band:' + b.code + b.thickness, 'est.band', b.code + ' ' + b.thickness, (b.length / 1000 * mmK) * (1 + R.bandWaste), 'est.u.m', perM, path);
  }
  const lin = linearList(build.parts.filter((p) => p.meta && p.meta.linear));
  for (const l of lin) {
    const per = R.hardwoodPerM * (l.width / (38 / mmK)) * (l.thickness / (19 / mmK));
    add('frame:' + l.material + l.width, 'est.frame', l.material + ' ' + l.thickness + ' × ' + l.width, l.length / 1000 * mmK * 1.1, 'est.u.m', r2(per), 'hardwoodPerM');
  }
  for (const h of build.hardware) add('hw:' + h.key + h.spec, 'est.hardware', (h.item || h.key) + (h.spec ? ' ' + h.spec : ''), h.qty, 'est.u.each', R.hardware[h.key] ?? 0, 'hardware.' + h.key);
  for (const c of build.counters) add('counter:' + c.no, 'est.counter', c.no, c.length / 1000 * mmK, 'est.u.m', r2(R.counterPerM * (c.width * mmK / 600)), 'counterPerM');
  for (const c of build.cells) if (c.kind === 'cab' && c.madeToOrder) add('mto:' + c.no, 'est.mto', c.no + ' · R ' + Math.round(c.madeToOrder.rFront) + (build.project.unit === 'in' ? ' in' : ' mm'), c.madeToOrder.arcLen / 1000 * mmK, 'est.u.m', R.madeToOrder.curvedPerM, 'madeToOrder.curvedPerM');
  // labour: hours by cabinet kind, a face frame adds its own, installation on request
  const hours = {};
  let frames = 0;
  for (const c of build.cells) {
    const kind = c.kind === 'cab' ? c.cab.type : c.kind;
    hours[kind] = (hours[kind] || 0) + 1;
    if (c.kind === 'cab' && c.construction === 'faceframe') frames++;
  }
  const keyOf = { base: 'base', drawers: 'drawers', wall: 'wall', tall: 'tall', filler: 'filler', endpanel: 'endpanel' };
  let hrs = 0;
  for (const [k, n] of Object.entries(hours)) hrs += n * (R.labour[keyOf[k]] ?? 0);
  hrs += frames * R.labour.frameExtra;
  add('labour', 'est.labour', '', hrs, 'est.u.hour', R.labour.perHour, 'labour.perHour');
  if (install) add('install', 'est.install', '', build.cells.filter((c) => c.kind === 'cab').length * R.labour.install, 'est.u.hour', R.labour.perHour, 'labour.perHour');
  const nSheets = nestJob ? nestJob.sheets : cl.sheets.reduce((s, g) => s + (g.estimate || 0), 0);
  add('machine', 'est.machine', '', nSheets * R.machine.minPerSheet / 60, 'est.u.hour', R.machine.perHour, 'machine.perHour');
  const subtotal = r2(rows.reduce((s, r) => s + r.amount, 0));
  const markup = r2(subtotal * R.markup), tax = r2((subtotal + markup) * R.tax);
  const cabinets = build.cells.filter((c) => c.kind === 'cab').length;
  const total = r2(subtotal + markup + tax);
  const placeholders = rows.filter((r) => r.placeholder).length;
  return {
    currency: R.currency, rows, subtotal, markup, markupRate: R.markup, tax, taxRate: R.tax, total, cabinets, perCabinet: cabinets ? r2(total / cabinets) : 0,
    placeholders, allPlaceholder: rows.length > 0 && placeholders === rows.length, markupPlaceholder: !changed.has('markup'),
    lint: lintOf(rows, changed),
  };
}

/** The categories of a rate path: the first part of 'hardware.hinge', 'sheet.melamine-18' … ; a bare rate ('markup', 'tax') is its own. */
export const categoryOf = (path) => String(path).split('.')[0];
function lintOf(rows, changed) {
  const used = new Set(rows.map((r) => r.path));
  used.add('markup'); used.add('tax');
  const cats = new Map();
  for (const p of used) {
    const k = categoryOf(p);
    const c = cats.get(k) || { key: k, paths: [], open: [] };
    c.paths.push(p);
    if (!changed.has(p)) c.open.push(p);
    cats.set(k, c);
  }
  const categories = [...cats.values()].map((c) => ({ key: c.key, paths: c.paths, placeholder: c.open.length > 0, open: c.open }));
  const open = categories.filter((c) => c.placeholder).map((c) => c.key);
  return { categories, open, final: open.length === 0 && rows.length > 0 };
}
/** The "final quote" gate for a job (see the header): the same lint, from a project and an estimate. */
export function ratesLint(est) { return est.lint; }
