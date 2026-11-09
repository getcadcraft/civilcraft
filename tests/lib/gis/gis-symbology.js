/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-symbology.js — symbology by attribute for GIS layers (0.9 SU.1080 round 2): classes from a field, colour ramps that
 * stay readable with the common kinds of colour blindness, point size by a number. No DOM, no imports. Canonical in lib/gis/;
 * byte-identical copies by tools/gis/sync.mjs --to civilcraft.
 *
 * A symbology is the plain object kept on the layer (`layer.symbology`, saved in the project file):
 *   { mode: 'single'|'categorized'|'graduated', field, ramp, method: 'equal'|'quantile'|'natural', classes: 2..9, reverse,
 *     sizeField, sizeMin, sizeMax (half-side of a point square, paper mm), fill (polygons: tint the inside), legend }
 *
 *   classify(values, method, k) → { breaks: [min, …, max], approx }      numbers only; class j holds breaks[j] < v <= breaks[j+1]
 *                                                                           (the first class also holds the minimum)
 *   equalInterval(values, k) · quantile(values, k) · naturalBreaks(values, k)   the three methods (Jenks natural breaks by
 *                                                                           dynamic programming, exact up to 1,500 values, else
 *                                                                           on 1,500 evenly spaced sorted values and `approx`)
 *   classIndex(v, breaks) → class number | -1
 *   RAMPS · rampColors(id, n, reverse) → n hex colours · lerpHex · cvdSimulate(hex, kind) · luminance(hex)
 *   compile(layer, features, base) → { mode, classes: [{ label, color, count }], classOf: Int16Array, size: Float32Array | null, fill,
 *                                      legend, note? }                    classOf -1 = no value (its own grey class when it occurs)
 *   cleanSymbology(raw, fields) → the checked object | null              (untrusted input from a project file)
 */

export const MODES = ['single', 'categorized', 'graduated'];
export const METHODS = ['equal', 'quantile', 'natural'];
export const MAX_CLASSES = 9;
export const MAX_CATEGORIES = 12;
export const NO_VALUE = '#8c8c8c';
export const OTHER = '#6e6e6e';
const NATURAL_CAP = 1500;

// ------------------------------------------------------------------------------------------------------ colour ramps
// Sequential: viridis and cividis (matplotlib / Nuñez et al., both CC0), Blues (ColorBrewer, Apache-2.0 terms). Diverging: RdBu
// (ColorBrewer, marked colour-blind safe). Categorical: Okabe and Ito (2008), designed for all common colour vision types.
export const RAMPS = {
  viridis: { kind: 'seq', stops: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'] },
  cividis: { kind: 'seq', stops: ['#00204d', '#414d6b', '#7c7b78', '#bcaf6f', '#ffea46'] },
  blues: { kind: 'seq', stops: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'] },
  rdbu: { kind: 'div', stops: ['#b2182b', '#ef8a62', '#f7f7f7', '#67a9cf', '#2166ac'] },
  okabe: { kind: 'cat', stops: ['#0072b2', '#e69f00', '#009e73', '#cc79a7', '#56b4e9', '#d55e00', '#f0e442', '#000000'] },
};
export const RAMP_IDS = Object.keys(RAMPS);
const hex = (h) => { const m = /^#([0-9a-f]{6})$/i.exec(String(h)); if (!m) return [0, 0, 0]; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
export const lerpHex = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
function along(stops, t) {
  const p = Math.max(0, Math.min(1, t)) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(p));
  return lerpHex(stops[i], stops[i + 1], p - i);
}
/** n colours from a ramp (a categorical ramp gives its first n, repeating after eight). reverse flips the order. */
export function rampColors(id, n, reverse = false) {
  const r = RAMPS[id] || RAMPS.viridis;
  let out;
  if (r.kind === 'cat') out = Array.from({ length: n }, (_, i) => r.stops[i % r.stops.length]);
  else out = Array.from({ length: n }, (_, i) => (n === 1 ? along(r.stops, 0.5) : along(r.stops, i / (n - 1))));
  return reverse ? out.reverse() : out;
}
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const gam = (v) => { v = Math.max(0, Math.min(1, v)); return 255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055); };
export const luminance = (h) => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
// Machado, Oliveira and Fernandes (2009), severity 1.0, applied in linear RGB
const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
export const CVD_KINDS = Object.keys(CVD);
export function cvdSimulate(h, kind) {
  const m = CVD[kind], c = hex(h).map(lin);
  return toHex(m.map((row) => gam(row[0] * c[0] + row[1] * c[1] + row[2] * c[2])));
}

// ------------------------------------------------------------------------------------------------------ class breaks
const finite = (values) => values.filter((v) => typeof v === 'number' && Number.isFinite(v));
const sortedNums = (values) => Float64Array.from(finite(values)).sort();
export function equalInterval(values, k) {
  const v = finite(values);
  if (!v.length) return [];
  let lo = Infinity, hi = -Infinity;
  for (const x of v) { if (x < lo) lo = x; if (x > hi) hi = x; }
  if (lo === hi) return [lo, hi];
  return Array.from({ length: k + 1 }, (_, i) => (i === k ? hi : lo + ((hi - lo) * i) / k));
}
/** Quantile breaks with the usual linear interpolation between sorted values (position i/k × (n − 1)); repeated breaks collapse. */
export function quantile(values, k) {
  const s = sortedNums(values), n = s.length;
  if (!n) return [];
  const out = [s[0]];
  for (let i = 1; i < k; i++) {
    const p = (i / k) * (n - 1), lo = Math.floor(p), f = p - lo;
    out.push(lo + 1 < n ? s[lo] + (s[lo + 1] - s[lo]) * f : s[lo]);
  }
  out.push(s[n - 1]);
  return out.filter((x, i) => i === 0 || x > out[i - 1]);
}
/** Jenks natural breaks: the split into k classes with the least total squared distance to each class mean. Upper bounds are the largest value of each class. */
export function naturalBreaks(values, k, report = null) {
  let s = Array.from(sortedNums(values));
  if (!s.length) return [];
  const uniq = [...new Set(s)];
  if (uniq.length <= k) return uniq.length === 1 ? [uniq[0], uniq[0]] : [uniq[0], ...uniq.slice(1)];
  if (s.length > NATURAL_CAP) {
    const keep = [];
    for (let i = 0; i < NATURAL_CAP; i++) keep.push(s[Math.round((i * (s.length - 1)) / (NATURAL_CAP - 1))]);
    s = keep;
    if (report) report.approx = true;
  }
  const n = s.length, pre = new Float64Array(n + 1), pre2 = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) { pre[i + 1] = pre[i] + s[i]; pre2[i + 1] = pre2[i] + s[i] * s[i]; }
  const cost = (i, j) => { const c = j - i + 1, sum = pre[j + 1] - pre[i]; return pre2[j + 1] - pre2[i] - (sum * sum) / c; };   // values i..j
  const kk = Math.min(k, new Set(s).size);
  let prev = new Float64Array(n), cut = [];
  for (let j = 0; j < n; j++) prev[j] = cost(0, j);
  for (let c = 2; c <= kk; c++) {
    const cur = new Float64Array(n).fill(Infinity), at = new Int32Array(n);
    for (let j = c - 1; j < n; j++) {
      for (let i = c - 1; i <= j; i++) { const v = prev[i - 1] + cost(i, j); if (v < cur[j]) { cur[j] = v; at[j] = i; } }
    }
    cut.push(at); prev = cur;
  }
  const ub = []; let j = n - 1;
  for (let c = kk; c >= 1; c--) { ub.push(s[j]); if (c > 1) j = cut[c - 2][j] - 1; }
  const out = [s[0], ...ub.reverse()];
  return out.filter((x, i) => i === 0 || x > out[i - 1]);
}
export function classify(values, method, k) {
  const rep = { approx: false };
  k = Math.max(2, Math.min(MAX_CLASSES, Math.trunc(k) || 5));
  const breaks = method === 'quantile' ? quantile(values, k) : method === 'natural' ? naturalBreaks(values, k, rep) : equalInterval(values, k);
  return { breaks, approx: rep.approx };
}
/** Class number of a value in breaks [b0, b1, …, bk]: the first j with v <= b(j+1); below b0 and above bk are outside (−1); the minimum is in class 0. */
export function classIndex(v, breaks) {
  if (typeof v !== 'number' || !Number.isFinite(v) || breaks.length < 2 || v < breaks[0] || v > breaks[breaks.length - 1]) return -1;
  let lo = 1, hi = breaks.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (v <= breaks[mid]) hi = mid; else lo = mid + 1; }
  return lo - 1;
}

// ------------------------------------------------------------------------------------------------------ compile for a layer
export const defaults = () => ({ mode: 'single', field: '', ramp: 'viridis', method: 'quantile', classes: 5, reverse: false, sizeField: '', sizeMin: 0.6, sizeMax: 3, fill: false, legend: true });
/** Round a break for a legend label: up to the digits that tell neighbours apart (at most 6 significant), no trailing zeros. */
export function fmt(v) {
  if (!Number.isFinite(v)) return '';
  const a = Math.abs(v);
  const s = a >= 1e6 || (a !== 0 && a < 1e-4) ? v.toExponential(3) : String(+v.toPrecision(6));
  return s;
}
const keyOf = (v) => (v === null || v === undefined || v === '' ? null : typeof v === 'number' ? (Number.isFinite(v) ? String(v) : null) : String(v));

/** What the plan needs: per-feature class numbers, the classes (label, colour, count), and a size per point. `base` is the
 *  layer's own colour (used for "single"). Pure; the caller caches it. */
export function compile(layer, features, base = '#1e48c8') {
  const sym = { ...defaults(), ...(layer.symbology || {}) };
  const n = features.length;
  const field = layer.fields.find((f) => f.name === sym.field);
  const out = { mode: 'single', classes: [], classOf: new Int16Array(n), size: null, fill: !!sym.fill && layer.geom === 'pg', legend: sym.legend !== false, field: '', note: '' };
  const sf = layer.geom === 'pt' && sym.sizeField ? layer.fields.find((f) => f.name === sym.sizeField && f.type === 'number') : null;
  if (sf) {
    let lo = Infinity, hi = -Infinity;
    for (const f of features) { const v = f.p?.[sf.name]; if (typeof v === 'number' && Number.isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } }
    out.size = new Float32Array(n);
    features.forEach((f, i) => { const v = f.p?.[sf.name]; out.size[i] = typeof v === 'number' && Number.isFinite(v) ? (hi > lo ? sym.sizeMin + ((sym.sizeMax - sym.sizeMin) * (v - lo)) / (hi - lo) : (sym.sizeMin + sym.sizeMax) / 2) : sym.sizeMin; });
    out.sizeRange = { field: sf.name, min: lo, max: hi };
  }
  if (sym.mode === 'categorized' && field) {
    const count = new Map();
    for (const f of features) { const k = keyOf(f.p?.[field.name]); if (k !== null) count.set(k, (count.get(k) || 0) + 1); }
    const ranked = [...count.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const cat = RAMPS[sym.ramp]?.kind === 'cat';
    const room = cat ? RAMPS[sym.ramp].stops.length : MAX_CATEGORIES;
    const shown = ranked.length > room ? ranked.slice(0, room - 1) : ranked;
    const hidden = ranked.length - shown.length;
    // classes in order of first value (stable and sorted for the legend): numbers numerically, text alphabetically
    const isNum = field.type === 'number';
    shown.sort((a, b) => (isNum ? Number(a[0]) - Number(b[0]) : a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const colors = rampColors(sym.ramp, shown.length, sym.reverse);
    const idx = new Map();
    shown.forEach(([k, c], j) => { idx.set(k, j); out.classes.push({ label: k, color: colors[j], count: c }); });
    let other = -1, none = -1;
    features.forEach((f, i) => {
      const k = keyOf(f.p?.[field.name]);
      if (k === null) { if (none < 0) { none = out.classes.length; out.classes.push({ label: '', color: NO_VALUE, count: 0, kind: 'none' }); } out.classes[none].count++; out.classOf[i] = none; return; }
      const j = idx.get(k);
      if (j !== undefined) { out.classOf[i] = j; return; }
      if (other < 0) { other = out.classes.length; out.classes.push({ label: '', color: OTHER, count: 0, kind: 'other', n: hidden }); }
      out.classes[other].count++; out.classOf[i] = other;
    });
    out.mode = 'categorized'; out.field = field.name;
    if (hidden) out.note = 'other';
  } else if (sym.mode === 'graduated' && field && field.type === 'number') {
    const vals = []; for (const f of features) { const v = f.p?.[field.name]; if (typeof v === 'number' && Number.isFinite(v)) vals.push(v); }
    const { breaks, approx } = classify(vals, sym.method, sym.classes);
    if (breaks.length >= 2) {
      const k = breaks.length - 1, colors = rampColors(sym.ramp, k, sym.reverse);
      for (let j = 0; j < k; j++) out.classes.push({ label: '', lo: breaks[j], hi: breaks[j + 1], color: colors[j], count: 0 });
      let none = -1;
      features.forEach((f, i) => {
        const j = classIndex(f.p?.[field.name], breaks);
        if (j < 0) { if (none < 0) { none = out.classes.length; out.classes.push({ label: '', color: NO_VALUE, count: 0, kind: 'none' }); } out.classes[none].count++; out.classOf[i] = none; return; }
        out.classes[j].count++; out.classOf[i] = j;
      });
      out.mode = 'graduated'; out.field = field.name; out.breaks = breaks;
      for (let j = 0; j < k; j++) out.classes[j].label = fmt(breaks[j]) + ' – ' + fmt(breaks[j + 1]);
      if (approx) out.note = 'approx';
    }
  }
  if (out.mode === 'single') { out.classes = []; out.classOf.fill(-1); }
  out.base = base;
  return out;
}

// ------------------------------------------------------------------------------------------------------ project file
const num = (v, lo, hi, d) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : d);
/** A symbology read from a project file (untrusted). Unknown keys are dropped, bad values fall back to the defaults, a field that
 *  is gone (or not a number where one is needed) turns the mode back to single. Returns null when it says nothing but "single". */
export function cleanSymbology(raw, fields = []) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const d = defaults(), out = {};
  const find = (name) => fields.find((f) => f.name === name);
  const mode = MODES.includes(raw.mode) ? raw.mode : 'single';
  const f = typeof raw.field === 'string' ? find(raw.field) : null;
  out.mode = mode === 'categorized' && f ? mode : mode === 'graduated' && f?.type === 'number' ? mode : 'single';
  out.field = out.mode === 'single' ? '' : f.name;
  out.ramp = RAMP_IDS.includes(raw.ramp) ? raw.ramp : out.mode === 'categorized' ? 'okabe' : d.ramp;
  out.method = METHODS.includes(raw.method) ? raw.method : d.method;
  out.classes = Math.trunc(num(raw.classes, 2, MAX_CLASSES, d.classes));
  out.reverse = raw.reverse === true;
  const sz = typeof raw.sizeField === 'string' ? find(raw.sizeField) : null;
  out.sizeField = sz?.type === 'number' ? sz.name : '';
  out.sizeMin = num(raw.sizeMin, 0.2, 6, d.sizeMin);
  out.sizeMax = num(raw.sizeMax, 0.2, 10, d.sizeMax);
  if (out.sizeMax < out.sizeMin) out.sizeMax = out.sizeMin;
  out.fill = raw.fill === true;
  out.legend = raw.legend !== false;
  if (out.mode === 'single' && !out.sizeField && !out.fill) return null;
  return out;
}
