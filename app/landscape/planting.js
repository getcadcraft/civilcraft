/* SPDX-License-Identifier: Apache-2.0 */
/**
 * planting.js — CivilCraft's Landscape workspace, planting (0.7 LD.2, session `landscape`). No DOM: the Node test drives it
 * exactly as the page does. Plant sizes come from the `plants` library in metres; everything placed is in project units.
 *
 * state.landscape = {
 *   palette: [species…]        the project's own plant list (plants.js rows; replaces seed rows with the same key, adds others)
 *   plants:  [{ id 'l<n>', key, x, y, z: null (sits on the ground: the graded surface, else the existing one) | number, label?: '' }]
 *   beds:    [{ id, name, pts: [{x,y}] (closed), mix: [{ key, pct }], spacing: null (from the species) | m, pattern 'triangular'|'square',
 *              angle (deg), seed }]
 *   hedges:  [{ id, name, pts: [{x,y}] (open line), key, spacing: null | m, rows 1|2, rowGap (m) }]
 *   grading: [platform | berm | swale | area]   (LD.3, grade.js)
 *   hardscape: [paving | path | wall | kerb | ramp | steps]   (LD.4, hardscape.js)
 *   irrigation: { supply, heads, pipes, valves, drips, catalog, settings }   (LD.5, irrigation.js; absent until used)
 *   freeform: [{ id, name, mesh, at, base 'follow'|'cut', baseZ, cut, fill, ifc }]   (LD.7, freeform.js; absent until used)
 *   show:    'mature' | 'plant'  (symbols at mature size or at planting size)
 *   label:   the label template for single plants ('{name}', '{botanical}', '{size}', '{qty}', '{height}', '{spread}', '{container}', '{key}')
 *   labels:  bool
 * }
 *
 *   emptyLandscape() · cleanLandscape(obj, units) (untrusted: the project file) · unitM(units) (metres per project unit)
 *   speciesIndex(seedSpecies, palette) → Map key → species
 *   bedFill(bed, index, units) → { pts: [{x, y, key}], counts: {key: n}, spacing (project units), area, capped }
 *   hedgeFill(hedge, index, units) → { pts: [{x, y, key}], length, spacing, capped }
 *   placed(ls, index, units, zAt?) → [{ x, y, z, key, from: 'plant'|'bed'|'hedge', id }]   every plant in the project
 *   schedule(ls, index, units, lang) → { rows: [{ key, botanical, name, type, size: {h, s}, container, qty, plants, beds, hedges }], total, missing }
 *   scheduleRows(sch) → header + rows for CSV / XLSX · scheduleCsv(sch) · scheduleQuantities(sch, {project, made}) (TakeoffCraft)
 *   labelText(template, sp, {qty, which, lang})
 *   sceneItems(ls, index, units, { unitPerMm, lang, zAt }) → plan items on the L-PLNT-* layers (screen, DXF, DWG, PDF draw them)
 *   pickPlanting(ls, index, units, x, y, tol) → { kind: 'plant'|'bed'|'hedge', id } | null
 */

import { symbolPlan, sizeOf, spacingOf, displayName, mergeLists, symbolOf } from './plants.js';
import { t } from '../i18n.js';
import { cleanGrading } from './grade.js';
import { cleanHardscape } from './hardscape.js';
import { cleanIrrigation } from './irrigation.js';
import { cleanFreeform } from './freeform.js';
import './layers.js';

export const MAX_PLANTS = 20000;          // single plants in a project
export const MAX_BEDS = 2000;
export const MAX_FILL = 50000;            // plants filled into one bed or along one hedge
export const MAX_SYMBOLS = 3000;          // per bed: above this the bed's plants are drawn as small circles only
const FT_M = 1200 / 3937;                 // a US survey foot in metres (CivilCraft's feet)
export const unitM = (units) => (units === 'm' ? 1 : FT_M);
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const KEY = /^[a-z0-9-]{1,64}$/;

export function emptyLandscape() { return { palette: [], plants: [], beds: [], hedges: [], grading: [], hardscape: [], show: 'mature', label: '{name}', labels: true }; }

export function speciesIndex(seed, palette) { return new Map(mergeLists(seed || [], palette || []).map((s) => [s.key, s])); }

/** The project file's `landscape` (untrusted). `cleanPalette` is plants.js readPlants applied to the rows (passed in so the
 *  project file reader stays small). Returns a fresh state; bad items are dropped. */
export function cleanLandscape(obj, units, cleanPalette = null) {
  const s = emptyLandscape();
  if (!obj || typeof obj !== 'object') return s;
  const xy = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
  const id = (v, pre) => (new RegExp('^' + pre + '\\d{1,9}$').test(String(v)) ? String(v) : null);
  const list = (a, max) => (Array.isArray(a) ? a.slice(0, max) : []);
  if (cleanPalette && Array.isArray(obj.palette)) s.palette = cleanPalette(obj.palette.slice(0, 5000));
  for (const p of list(obj.plants, MAX_PLANTS)) {
    const q = xy(p);
    if (!q || !KEY.test(p.key) || !id(p.id, 'l')) continue;
    s.plants.push({ id: p.id, key: p.key, ...q, z: fin(p.z) && Math.abs(p.z) < 1e6 ? p.z : null, ...(p.label ? { label: str(p.label, 200) } : {}) });
  }
  for (const b of list(obj.beds, MAX_BEDS)) {
    const pts = list(b?.pts, 5000).map(xy).filter(Boolean);
    if (pts.length < 3 || !id(b.id, 'l')) continue;
    const mix = list(b.mix, 20).filter((m) => m && KEY.test(m.key) && fin(m.pct) && m.pct > 0 && m.pct <= 100).map((m) => ({ key: m.key, pct: m.pct }));
    if (!mix.length) continue;
    s.beds.push({ id: b.id, name: str(b.name) || t('ls.bed.default'), pts, mix, spacing: fin(b.spacing) && b.spacing >= 0.05 && b.spacing <= 50 ? b.spacing : null,
      pattern: b.pattern === 'square' ? 'square' : 'triangular', angle: fin(b.angle) ? ((b.angle % 360) + 360) % 360 : 0, seed: Number.isInteger(b.seed) ? b.seed >>> 0 : 1 });
  }
  for (const h of list(obj.hedges, MAX_BEDS)) {
    const pts = list(h?.pts, 5000).map(xy).filter(Boolean);
    if (pts.length < 2 || !id(h.id, 'l') || !KEY.test(h.key)) continue;
    s.hedges.push({ id: h.id, name: str(h.name) || t('ls.hedge.default'), pts, key: h.key, spacing: fin(h.spacing) && h.spacing >= 0.05 && h.spacing <= 50 ? h.spacing : null,
      rows: h.rows === 2 ? 2 : 1, rowGap: fin(h.rowGap) && h.rowGap > 0 && h.rowGap <= 10 ? h.rowGap : 0.4 });
  }
  s.grading = cleanGrading(obj.grading, units);   // LD.3 (grade.js)
  s.hardscape = cleanHardscape(obj.hardscape, units);   // LD.4 (hardscape.js)
  if (obj.irrigation) s.irrigation = cleanIrrigation(obj.irrigation);   // LD.5 (irrigation.js)
  if (obj.freeform) s.freeform = cleanFreeform(obj.freeform);   // LD.7 (freeform.js)
  if (obj.show === 'plant') s.show = 'plant';
  if (typeof obj.label === 'string') s.label = str(obj.label, 200) || '{name}';
  if (obj.labels === false) s.labels = false;
  return s;
}

// ---- geometry ----
function area(pts) { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y); return Math.abs(a) / 2; }
export function inside(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
function segDist(x, y, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  const t0 = L ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L)) : 0;
  return Math.hypot(x - (a.x + t0 * dx), y - (a.y + t0 * dy));
}
export function edgeDist(x, y, pts, closed = true) {
  let d = Infinity;
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) d = Math.min(d, segDist(x, y, pts[i], pts[(i + 1) % n]));
  return d;
}
function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

/** Whole counts from percentages that add up to exactly n (largest remainder). */
export function shares(mix, n) {
  const tot = mix.reduce((a, m) => a + m.pct, 0) || 1;
  const raw = mix.map((m) => (m.pct / tot) * n), out = raw.map(Math.floor);
  let left = n - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k][1]]++;
  return out;
}

/** A bed's spacing in metres: its own, else the mix's species spacings weighted by share. */
export function bedSpacingM(bed, index) {
  if (bed.spacing) return bed.spacing;
  let w = 0, s = 0;
  for (const m of bed.mix) { const sp = index.get(m.key); if (sp) { w += m.pct; s += m.pct * spacingOf(sp); } }
  return w > 0 && s > 0 ? s / w : 0.5;
}

export function bedFill(bed, index, units) {
  const um = unitM(units), sM = bedSpacingM(bed, index), s = sM / um;
  const pts = bed.pts, A = area(pts);
  const out = [];
  let capped = false;
  if (s > 0 && pts.length >= 3) {
    const a = (bed.angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
    // the bed in the grid's frame (rotated by −angle about its first point)
    const o = pts[0];
    const loc = pts.map((p) => ({ x: (p.x - o.x) * ca + (p.y - o.y) * sa, y: -(p.x - o.x) * sa + (p.y - o.y) * ca }));
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of loc) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    const tri = bed.pattern !== 'square', dy = tri ? (s * Math.sqrt(3)) / 2 : s, edge = s / 2 - 1e-9;
    let row = 0;
    for (let y = y0 + s / 2; y <= y1 && !capped; y += dy, row++) {
      const shift = tri && row % 2 ? s / 2 : 0;
      for (let x = x0 + s / 2 + shift; x <= x1; x += s) {
        if (!inside(x, y, loc) || edgeDist(x, y, loc) < edge) continue;
        if (out.length >= MAX_FILL) { capped = true; break; }
        out.push({ x: o.x + x * ca - y * sa, y: o.y + x * sa + y * ca });
      }
    }
    if (!out.length) {   // a bed smaller than one spacing still gets one plant, in its middle when that is inside
      const cx = pts.reduce((v, p) => v + p.x, 0) / pts.length, cy = pts.reduce((v, p) => v + p.y, 0) / pts.length;
      if (inside(cx, cy, pts)) out.push({ x: cx, y: cy });
    }
  }
  // species by share, at places in a seeded random order (the same bed always fills the same way)
  const n = out.length, counts = {}, cnt = shares(bed.mix, n), order = out.map((_, i) => i), r = rng(bed.seed);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  let k = 0;
  bed.mix.forEach((m, mi) => { for (let c = 0; c < cnt[mi]; c++) out[order[k++]].key = m.key; counts[m.key] = (counts[m.key] || 0) + cnt[mi]; });
  return { pts: out, counts, spacing: s, area: A, capped };
}

export function hedgeFill(hedge, index, units) {
  const sp = index.get(hedge.key), um = unitM(units);
  const s = (hedge.spacing || (sp ? spacingOf(sp) : 0.4)) / um, gap = hedge.rowGap / um;
  const P = hedge.pts, out = [];
  let length = 0, capped = false;
  for (let i = 0; i + 1 < P.length; i++) length += Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
  if (!(s > 0) || length <= 0) return { pts: out, length, spacing: s, capped };
  const along = (d) => {   // point and unit direction at distance d along the line
    let acc = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const L = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y);
      if (d <= acc + L || i === P.length - 2) { const f = L ? (d - acc) / L : 0, ux = L ? (P[i + 1].x - P[i].x) / L : 1, uy = L ? (P[i + 1].y - P[i].y) / L : 0; return { x: P[i].x + f * (P[i + 1].x - P[i].x), y: P[i].y + f * (P[i + 1].y - P[i].y), ux, uy }; }
      acc += L;
    }
    return null;
  };
  // one row centred along the line (the ends get the same margin); a second row sits beside it, between the first row's plants
  const n = Math.min(MAX_FILL, Math.max(1, Math.floor(length / s + 1e-9) + 1)), start = (length - (n - 1) * s) / 2;
  if (n === MAX_FILL) capped = true;
  const rows = hedge.rows === 2 ? [[-gap / 2, 0, n], [gap / 2, s / 2, Math.min(n - 1, MAX_FILL - n)]] : [[0, 0, n]];
  for (const [off, shift, count] of rows) {
    for (let k = 0; k < count; k++) {
      const q = along(start + shift + k * s);
      out.push({ x: q.x - q.uy * off, y: q.y + q.ux * off, key: hedge.key });
    }
  }
  return { pts: out, length, spacing: s, capped };
}

/** Every plant in the project, with its ground elevation when `zAt(x, y)` is given (tree on grade: follows the grading). */
export function placed(ls, index, units, zAt = null) {
  const out = [];
  const z = (p) => (fin(p.z) ? p.z : zAt ? zAt(p.x, p.y) : null);
  for (const p of ls.plants) out.push({ x: p.x, y: p.y, z: z(p), key: p.key, from: 'plant', id: p.id });
  for (const b of ls.beds) for (const p of bedFill(b, index, units).pts) out.push({ x: p.x, y: p.y, z: zAt ? zAt(p.x, p.y) : null, key: p.key, from: 'bed', id: b.id });
  for (const h of ls.hedges) for (const p of hedgeFill(h, index, units).pts) out.push({ x: p.x, y: p.y, z: zAt ? zAt(p.x, p.y) : null, key: p.key, from: 'hedge', id: h.id });
  return out;
}

const TYPE_ORDER = ['tree', 'hedge', 'shrub', 'climber', 'grass', 'perennial', 'groundcover'];
export function schedule(ls, index, units, lang = 'en') {
  const by = new Map(), missing = new Set();
  const add = (key, n, what) => {
    if (!n) return;
    if (!index.has(key)) { missing.add(key); return; }
    let r = by.get(key);
    if (!r) by.set(key, (r = { key, plants: 0, beds: 0, hedges: 0 }));
    r[what] += n;
  };
  for (const p of ls.plants) add(p.key, 1, 'plants');
  for (const b of ls.beds) for (const [k, n] of Object.entries(bedFill(b, index, units).counts)) add(k, n, 'beds');
  for (const h of ls.hedges) add(h.key, hedgeFill(h, index, units).pts.length, 'hedges');
  const rows = [...by.values()].map((r) => {
    const sp = index.get(r.key);
    return { key: r.key, botanical: sp.botanical, name: displayName(sp, lang), type: sp.type, size: sizeOf(sp, 'plant'), container: sp.container || '', qty: r.plants + r.beds + r.hedges, plants: r.plants, beds: r.beds, hedges: r.hedges };
  }).sort((a, b) => TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type) || a.botanical.localeCompare(b.botanical));
  return { rows, total: rows.reduce((a, r) => a + r.qty, 0), missing: [...missing] };
}

export function scheduleRows(sch) {
  const head = [t('ls.sch.botanical'), t('ls.sch.name'), t('ls.sch.type'), t('ls.sch.height'), t('ls.sch.spread'), t('ls.sch.container'), t('ls.sch.qty')];
  return [head, ...sch.rows.map((r) => [r.botanical, r.name, t('ls.type.' + r.type), r.size.h, r.size.s, r.container, r.qty])];
}
export function scheduleCsv(sch) {
  const cell = (v) => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return scheduleRows(sch).map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}
/** TakeoffCraft's quantities format (fixedqty.js reads it): one count item per species, key plant:<species key>. */
export function scheduleQuantities(sch, { project = '', made = new Date().toISOString().replace(/\.\d+Z$/, 'Z') } = {}) {
  return {
    format: 'cadcraft-quantities', version: 1, app: 'CivilCraft', project: String(project).slice(0, 200), made,   // i18n-ignore: the app's name in the file
    items: sch.rows.map((r) => ({ key: 'plant:' + r.key, name: `${r.name} (${r.botanical})`.slice(0, 200), unit: 'EA', qty: r.qty, note: t('ls.sch.note', { size: r.container || `${r.size.h} m` }) })),
  };
}

export function labelText(template, sp, { qty = 1, which = 'mature', lang = 'en' } = {}) {
  const z = sizeOf(sp, which);
  const v = { name: displayName(sp, lang), botanical: sp.botanical, key: sp.key, qty: String(qty), height: `${z.h} m`, spread: `${z.s} m`, size: sp.container || `${sizeOf(sp, 'plant').h} m`, container: sp.container || '' };
  return String(template || '{name}').replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m)).slice(0, 200);
}

const LAYER_OF = { tree: 'L-PLNT-TREE', hedge: 'L-PLNT-HDGE' };
/** Plan items. Symbols are the plants.js symbols at the shown size, in project units; beds get their outline, hedges their line. */
export function sceneItems(ls, index, units, { unitPerMm = 1, lang = 'en', which = null } = {}) {
  const items = [], um = unitM(units), sc = 1 / um, show = which || ls.show || 'mature';
  const symCache = new Map();
  const sym = (sp) => { let s = symCache.get(sp.key); if (!s) symCache.set(sp.key, (s = symbolPlan(sp, { which: show, scale: sc }))); return s; };
  const put = (sp, x, y, small = false) => {
    const layer = LAYER_OF[sp.type] || 'L-PLNT-SHRB';
    if (small) { items.push({ layer, kind: 'arc', c: { x, y }, r: (sizeOf(sp, show).s / 2) * sc * 0.5, a0: 0, a1: 2 * Math.PI }); return; }
    for (const e of sym(sp).entities) {
      if (e.type === 'circle') items.push({ layer, kind: 'arc', c: { x: x + e.x, y: y + e.y }, r: e.r, a0: 0, a1: 2 * Math.PI });
      else if (e.type === 'line') items.push({ layer, kind: 'poly', pts: [{ x: x + e.x1, y: y + e.y1 }, { x: x + e.x2, y: y + e.y2 }] });
      else if (e.type === 'arc') items.push({ layer, kind: 'arc', c: { x: x + e.x, y: y + e.y }, r: e.r, a0: (e.a0 * Math.PI) / 180, a1: (e.a1 * Math.PI) / 180 });
      else if (e.type === 'poly') items.push({ layer, kind: 'poly', pts: flattenBulges(e.pts, e.closed).map((p) => ({ x: x + p.x, y: y + p.y })), closed: e.closed });
    }
  };
  const labelMm = 2.2;
  for (const p of ls.plants) {
    const sp = index.get(p.key);
    if (!sp) { items.push({ layer: 'L-PLNT-TEXT', kind: 'text', x: p.x, y: p.y, mm: labelMm, rot: 0, text: '?' + p.key, align: 'center', middle: true }); continue; }
    put(sp, p.x, p.y);
    if (ls.labels) items.push({ layer: 'L-PLNT-TEXT', kind: 'text', x: p.x + (sizeOf(sp, show).s / 2) * sc * 0.75, y: p.y + (sizeOf(sp, show).s / 2) * sc * 0.75, mm: labelMm, rot: 0, text: p.label || labelText(ls.label, sp, { which: show, lang }), align: 'left' });
  }
  for (const b of ls.beds) {
    items.push({ layer: 'L-PLNT-BEDS', kind: 'poly', pts: b.pts, closed: true });
    const f = bedFill(b, index, units), small = f.pts.length > MAX_SYMBOLS;
    // plants under 1 mm across at this scale are left to the bed's label (its count); zoomed in, every plant shows
    const tiny = f.spacing / unitPerMm < 1;
    if (!tiny) for (const q of f.pts) { const sp = index.get(q.key); if (sp) put(sp, q.x, q.y, small); }
    if (ls.labels) {
      const cx = b.pts.reduce((v, p) => v + p.x, 0) / b.pts.length, cy = b.pts.reduce((v, p) => v + p.y, 0) / b.pts.length;
      const lines = b.mix.map((m) => { const sp = index.get(m.key); return sp ? labelText('{qty} {name}', sp, { qty: f.counts[m.key] || 0, lang }) : '?' + m.key; });
      lines.forEach((text, i) => items.push({ layer: 'L-PLNT-TEXT', kind: 'text', x: cx, y: cy - i * labelMm * 1.5 * unitPerMm, mm: labelMm, rot: 0, text, align: 'center', middle: true }));
    }
  }
  for (const h of ls.hedges) {
    items.push({ layer: 'L-PLNT-HDGE', kind: 'poly', pts: h.pts, dashed: true });
    const sp = index.get(h.key);
    if (!sp) continue;
    const f = hedgeFill(h, index, units), w = (sizeOf(sp, show).s / 2) * sc;
    for (const side of [-1, 1]) items.push({ layer: 'L-PLNT-HDGE', kind: 'poly', pts: offsetLine(h.pts, side * (w + (h.rows === 2 ? h.rowGap / um / 2 : 0))) });
    if (ls.labels) { const m = h.pts[Math.floor((h.pts.length - 1) / 2)]; items.push({ layer: 'L-PLNT-TEXT', kind: 'text', x: m.x, y: m.y + w * 1.6, mm: labelMm, rot: 0, text: labelText('{qty} {name}', sp, { qty: f.pts.length, lang }), align: 'center' }); }
  }
  return items;
}

/** A polyline with bulges ([x, y, b?]) → points, arcs in ≤ 10° pieces. */
export function flattenBulges(pts, closed) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], bul = a[2] || 0;
    out.push({ x: a[0], y: a[1] });
    if (!closed && i === n - 1) break;
    if (!bul) continue;
    const sweep = 4 * Math.atan(bul), dx = b[0] - a[0], dy = b[1] - a[1], c = Math.hypot(dx, dy);
    if (!c) continue;
    const r = c / (2 * Math.sin(Math.abs(sweep) / 2)), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const h = r * Math.cos(Math.abs(sweep) / 2) * Math.sign(bul);
    const cx = mx - (dy / c) * h, cy = my + (dx / c) * h;
    const a0 = Math.atan2(a[1] - cy, a[0] - cx), k = Math.max(2, Math.ceil(Math.abs(sweep) / (Math.PI / 18)));
    for (let j = 1; j < k; j++) { const ang = a0 + (sweep * j) / k; out.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) }); }
  }
  return out;
}

/** An open line offset sideways (left = +), mitred. */
export function offsetLine(pts, d) {
  const n = pts.length, out = [];
  const nrm = (a, b) => { const L = Math.hypot(b.x - a.x, b.y - a.y) || 1; return { x: -(b.y - a.y) / L, y: (b.x - a.x) / L }; };
  for (let i = 0; i < n; i++) {
    const n0 = i > 0 ? nrm(pts[i - 1], pts[i]) : null, n1 = i < n - 1 ? nrm(pts[i], pts[i + 1]) : null;
    let m = n0 && n1 ? { x: n0.x + n1.x, y: n0.y + n1.y } : n0 || n1;
    const L = Math.hypot(m.x, m.y) || 1;
    m = { x: m.x / L, y: m.y / L };
    const cos = n0 && n1 ? Math.max(0.25, m.x * n1.x + m.y * n1.y) : 1;
    out.push({ x: pts[i].x + (m.x * d) / cos, y: pts[i].y + (m.y * d) / cos });
  }
  return out;
}

/** What is under (x, y): a plant (within its symbol), a hedge line, then a bed (inside). */
export function pickPlanting(ls, index, units, x, y, tol, which = null) {
  const um = unitM(units), show = which || ls.show || 'mature';
  let best = null, bd = Infinity;
  for (const p of ls.plants) {
    const sp = index.get(p.key), r = sp ? (sizeOf(sp, show).s / 2) / um : tol;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= Math.max(r, tol) && d < bd) { bd = d; best = { kind: 'plant', id: p.id }; }
  }
  if (best) return best;
  for (const h of ls.hedges) if (edgeDist(x, y, h.pts, false) <= Math.max(tol, 0.5 / um)) return { kind: 'hedge', id: h.id };
  for (let i = ls.beds.length - 1; i >= 0; i--) if (inside(x, y, ls.beds[i].pts)) return { kind: 'bed', id: ls.beds[i].id };
  return null;
}

export { symbolOf };
