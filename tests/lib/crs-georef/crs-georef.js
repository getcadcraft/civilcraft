/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-georef.js — the maths behind placing a model on the map and moving data between coordinate systems (0.8 D8.9, session
 * `d89b_PART_3`). DOM-free. Stands on crs.js (CivilCraft's catalog + proj4) and adds no second projection library. lib/crs-georef is
 * canonical: `node tools/crs-georef/sync.mjs [--check] [--words] [bimcraft]` copies it (and reproject-batch.js) next to crs.js.
 *
 *   Conversion  { Eastings, Northings, OrthogonalHeight, XAxisAbscissa, XAxisOrdinate, Scale }   as IfcMapConversion (map units = the system's unit;
 *               the model's X axis points (XAxisAbscissa, XAxisOrdinate) on the map; Scale = map length per model length, so it carries the unit difference)
 *   Problem     the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1): { code, severity, msg:{key,vars}, text, about:[], source:{name:'georef'} }
 *
 *   makeConversion({ crs, eastings, northings, height, rotationDeg, scale, fileUnitM }) → { conv, lonlat, problems, error? }
 *   originFromLonLat(crs, lon, lat) → { eastings, northings, problems, error? }       a latitude/longitude through the chosen system
 *   reprojectConversion(conv, fromCrs, toCrs) → { conv, before:[lon,lat], after:[lon,lat], problems, error? }   item 2: the georeference only
 *   conversionMatrix(conv) → 16 numbers (column-major, as cc-ifc's georef) · rotationDeg(conv) · trueNorth(conv, crs) → [x, y] | null
 *   projectedCrsFields(crs) → { Name, Description, GeodeticDatum, MapProjection, MapZone, unit }      what IfcProjectedCRS says
 *   shiftProblems(from, to) · areaProblems(crs, lon, lat, which) · extentProblems(from, to, box)
 *   fileKey(file) · rememberFileCrs(storage, key, crs) · recallFileCrs(storage, key)       item 3: "which system is this file in?" remembered per file
 *   reproject({ proj4, from, to, xy, zFrom?, … }) → { xy, bad, problems }                    batched, in a worker when large, never blocks the page
 *   REPROJECT_MAX                                                                           the point cap, with a plain message
 *
 * Datum shifts: crs.js's catalog carries the first grid-free shift PROJ offers and EPSG's stated accuracy. Grid-based shifts (NADCON, NTv2,
 * OSTN15 …) are not available unless a grid was loaded: the result is then approximate to the stated accuracy and a Problem says so.
 */
import { transformer, byCode, METRES_PER, gridInfo } from './crs.js';
import { reprojectBatch } from './reproject-batch.js';
import { fromRecord, toRecord } from './crs-pick.js';
import { t } from './i18n.js';

export const REPROJECT_MAX = 25e6;
const D2R = Math.PI / 180;
const fin = Number.isFinite;
const r6 = (v) => Math.round(v * 1e6) / 1e6;
const r12 = (v) => Math.round(v * 1e12) / 1e12;

export function problem(code, severity, vars = {}, extra = {}) {
  const key = 'georef.p.' + code;
  return { code: 'georef.' + code, severity, msg: { key, vars }, text: t(key, vars), about: [], source: { name: 'georef' }, ...extra };
}
const fail = (code, vars) => problem(code, 'error', vars);

// ------------------------------------------------------------------ valid area and datum shifts
const entryOf = (crs) => { try { return crs?.code ? byCode(crs.code) : null; } catch { return null; } };
function inArea(a, lon, lat) {
  const [w, s, e, n] = a;
  const lonIn = w <= e ? lon >= w && lon <= e : lon >= w || lon <= e;
  return lonIn && lat >= s && lat <= n;
}
/** A point outside the area the system was made for: a warning (the maths still runs; distortion grows). `which` names the system in the text. */
export function areaProblems(crs, lon, lat, which = '') {
  const e = entryOf(crs);
  if (!e?.area || !Array.isArray(e.area) || inArea(e.area, lon, lat)) return [];
  return [problem('area', 'warning', { name: e.name, code: e.code, lon: r6(lon), lat: r6(lat), w: e.area[0], s: e.area[1], e: e.area[2], n: e.area[3], which })];
}
const nums = (s) => String(s).split(',').map(Number);
export function datumKey(p4) {
  const s = String(p4 || '');
  const g = /\+nadgrids=(\S+)/.exec(s);
  if (g) return 'grid:' + g[1];
  const tw = /\+towgs84=(\S+)/.exec(s);
  if (tw) { const v = nums(tw[1]); return v.every((x) => Math.abs(x) < 1e-9) ? 'wgs' : 'tw:' + v.join(','); }
  const d = /\+datum=(\w+)/i.exec(s)?.[1]?.toLowerCase();
  if (d === 'nad83') return 'nad83';   // EPSG: about 4 m from WGS 84; crs.js carries no shift, so the accuracy is stated, not applied
  if (d === 'wgs84') return 'wgs';
  if (d) return 'datum:' + d;
  const el = /\+ellps=(\w+)/i.exec(s)?.[1]?.toLowerCase();
  if (el === 'grs80' || el === 'wgs84') return 'wgs';
  return 'none:' + (el || '');
}
/**
 * The datum shift between two systems. Same datum → nothing. A grid that is not loaded → error (grid-based shifts are not available).
 * A grid-free shift → a note or warning that names the accuracy, never silent.
 */
export function shiftProblems(from, to) {
  const kf = datumKey(from?.proj4), kt = datumKey(to?.proj4);
  if (kf === kt) return [];
  const out = [];
  for (const [crs, key] of [[from, kf], [to, kt]]) {
    if (key.startsWith('grid:') && !gridInfo(key.slice(5).replace(/^@/, ''))) out.push(fail('grid', { name: crs.name, grid: key.slice(5) }));
  }
  if (out.length) return out;
  if (kf.startsWith('none:') || kt.startsWith('none:')) {
    const bare = kf.startsWith('none:') ? from : to;
    return [problem('noshift', 'warning', { name: bare.name })];
  }
  const accs = [from, to].map((c) => (c === from ? kf : kt) === 'wgs' ? 0 : entryOf(c)?.shiftAccuracy ?? (( c === from ? kf : kt) === 'nad83' ? 4 : null));
  const unknown = accs.some((a) => a === null || a === undefined);
  const acc = unknown ? null : Math.max(...accs);
  if (acc === null) return [problem('approx.unknown', 'warning', { from: from.name, to: to.name })];
  return [problem('approx', acc > 0.1 ? 'warning' : 'note', { from: from.name, to: to.name, acc })];
}
/** Whole-extent check for moving data: the corners and middle of `box` [minx, miny, maxx, maxy] (in `from`'s unit) must project and land in both areas. */
export function extentProblems(from, to, box) {
  const out = [...shiftProblems(from, to)];
  const [x0, y0, x1, y1] = box;
  if (![x0, y0, x1, y1].every(fin)) return [...out, fail('nofinite')];
  const toLL = from.unit === 'deg' ? (x, y) => [x, y] : transformer(from, null);
  for (const [x, y] of [[x0, y0], [x1, y1], [x0, y1], [x1, y0], [(x0 + x1) / 2, (y0 + y1) / 2]]) {
    let ll;
    try { ll = toLL(x, y); } catch { ll = null; }
    if (!ll || !ll.every(fin) || Math.abs(ll[1]) > 90) return [...out, fail('outside', { name: from.name })];
    const a = areaProblems(from, ll[0], ll[1], 'file'), b = areaProblems(to, ll[0], ll[1], 'model');
    if (a.length || b.length) { out.push(...a.slice(0, 1), ...b.slice(0, 1)); break; }
  }
  return out;
}

// ------------------------------------------------------------------ a model with no map conversion (item 1)
export const lonLatOf = (crs, e, n) => (crs.unit === 'deg' ? [e, n] : transformer(crs, null)(e, n));
const gridOf = (crs, lon, lat) => transformer(null, crs)(lon, lat);

/** Eastings / northings (in the system's unit) of a latitude and longitude through the chosen system. */
export function originFromLonLat(crs, lon, lat) {
  if (!crs || crs.unit === 'deg') return { error: fail('projected'), problems: [] };
  if (!fin(lon) || !fin(lat) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return { error: fail('latlon'), problems: [] };
  let q;
  try { q = gridOf(crs, lon, lat); } catch { q = null; }
  if (!q || !q.every(fin)) return { error: fail('outside', { name: crs.name }), problems: [] };
  return { eastings: r6(q[0]), northings: r6(q[1]), problems: [...areaProblems(crs, lon, lat, 'model'), ...shiftProblems({ proj4: '+datum=WGS84', name: 'WGS 84' }, crs)] };
}

/**
 * The IfcMapConversion for a model placed at (eastings, northings) in `crs`'s unit, with its X axis `rotationDeg` degrees counter-clockwise from grid
 * east (0 = the model's Y axis points to grid north), and `scale` (default: the model's length unit over the map's, i.e. the unit difference only).
 */
export function makeConversion({ crs, eastings, northings, height = 0, rotationDeg = 0, scale, fileUnitM = 1 }) {
  if (!crs || crs.unit === 'deg') return { error: fail('projected'), problems: [] };
  const unitScale = fileUnitM / (METRES_PER[crs.unit] || 1);
  const s = scale === undefined || scale === null || scale === '' ? unitScale : Number(scale);
  const nums6 = [eastings, northings, height, rotationDeg].map(Number);
  if (!nums6.every(fin)) return { error: fail('numbers'), problems: [] };
  if (!fin(s) || s <= 0 || s / unitScale > 1000 || s / unitScale < 0.001) return { error: fail('scale', { scale: s }), problems: [] };
  if (Math.abs(nums6[0]) > 1e9 || Math.abs(nums6[1]) > 1e9) return { error: fail('numbers'), problems: [] };
  const a = nums6[3] * D2R;
  const conv = { Eastings: r6(nums6[0]), Northings: r6(nums6[1]), OrthogonalHeight: r6(nums6[2]), XAxisAbscissa: r12(Math.cos(a)), XAxisOrdinate: r12(Math.sin(a)), Scale: s };
  let ll;
  try { ll = lonLatOf(crs, conv.Eastings, conv.Northings); } catch { ll = null; }
  if (!ll || !ll.every(fin) || Math.abs(ll[1]) > 90) return { error: fail('outside', { name: crs.name }), problems: [] };
  return { conv, lonlat: ll, problems: areaProblems(crs, ll[0], ll[1], 'model') };
}

export const rotationDeg = (conv) => Math.atan2(conv.XAxisOrdinate ?? 0, conv.XAxisAbscissa ?? 1) / D2R;
/** model units → map units (cc-ifc's georef matrix, column-major). */
export function conversionMatrix(conv) {
  let ax = conv.XAxisAbscissa ?? 1, ay = conv.XAxisOrdinate ?? 0;
  const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
  const s = conv.Scale ?? 1;
  return [ax * s, ay * s, 0, 0, -ay * s, ax * s, 0, 0, 0, 0, s, 0, conv.Eastings, conv.Northings, conv.OrthogonalHeight, 1];
}
/** Where true north points in the model's own X/Y (unit vector), for IfcGeometricRepresentationContext.TrueNorth. */
export function trueNorth(conv, crs) {
  try {
    const ll = lonLatOf(crs, conv.Eastings, conv.Northings);
    const a = gridOf(crs, ll[0], ll[1]), b = gridOf(crs, ll[0], ll[1] + 1e-4);
    const g = Math.atan2(b[1] - a[1], b[0] - a[0]), m = Math.atan2(conv.XAxisOrdinate, conv.XAxisAbscissa);
    return [r12(Math.cos(g - m)), r12(Math.sin(g - m))];
  } catch { return null; }
}

// ------------------------------------------------------------------ what IfcProjectedCRS says
const PROJ_NAME = { tmerc: 'Transverse Mercator', etmerc: 'Transverse Mercator', utm: 'UTM', lcc: 'Lambert Conformal Conic', merc: 'Mercator', stere: 'Stereographic', sterea: 'Oblique Stereographic',
  aea: 'Albers Equal Area', omerc: 'Oblique Mercator', cass: 'Cassini-Soldner', laea: 'Lambert Azimuthal Equal Area', poly: 'Polyconic', krovak: 'Krovak' };
export function projectedCrsFields(crs) {
  const p4 = String(crs.proj4 || '');
  const e = entryOf(crs);
  const nm = e?.name || crs.name || '';
  const kind = /\+proj=(\w+)/.exec(p4)?.[1] || '';
  const utm = /\bUTM\b/i.test(nm) || kind === 'utm';
  const zm = /zone\s+(\d+)\s*([NS])?/i.exec(nm) || (/\+zone=(\d+)/.exec(p4) ? [null, /\+zone=(\d+)/.exec(p4)[1], /\+south/.test(p4) ? 'S' : 'N'] : null);
  const head = nm.includes(' / ') ? nm.split(' / ')[0].trim() : '';
  const datum = head ? head.replace(/^WGS 84$/i, 'WGS84').replace(/\s+/g, '') : (/\+datum=(\w+)/i.exec(p4)?.[1] || /\+ellps=(\w+)/i.exec(p4)?.[1] || '').toUpperCase();
  let zone = null;
  if (utm && zm) zone = zm[1] + (zm[2] ? zm[2].toUpperCase() : '');
  else if (nm.includes(' / ')) zone = nm.split(' / ').slice(1).join(' / ').trim().slice(0, 120) || null;
  return {
    Name: crs.code ? 'EPSG:' + crs.code : String(crs.name || '').slice(0, 255),
    Description: nm.slice(0, 255) || null,
    GeodeticDatum: datum || null,
    MapProjection: utm ? 'UTM' : PROJ_NAME[kind] || kind || null,
    MapZone: zone,
    unit: crs.unit,
  };
}

// ------------------------------------------------------------------ item 2: move the georeference to another system
/**
 * Re-express an IfcMapConversion in another projected system. The place the model stands on the earth stays the same (its latitude/longitude do
 * not change); the numbers that describe it change: origin through proj4, rotation from how the new grid's north turns at the origin, scale from
 * how lengths along the model's X axis change. Heights change by the unit only (a vertical datum is not touched). Nothing inside the model moves.
 */
export function reprojectConversion(conv, from, to) {
  if (!from || !to || from.unit === 'deg' || to.unit === 'deg') return { error: fail('projected'), problems: [] };
  const problems = [];
  let before, o2;
  try {
    before = lonLatOf(from, conv.Eastings, conv.Northings);
    o2 = transformer(from, to)(conv.Eastings, conv.Northings);
  } catch { return { error: fail('outside', { name: from.name }), problems }; }
  if (!before.every(fin) || !o2.every(fin)) return { error: fail('outside', { name: from.name }), problems };
  problems.push(...shiftProblems(from, to), ...areaProblems(from, before[0], before[1], 'file'));
  const after = lonLatOf(to, o2[0], o2[1]);
  problems.push(...areaProblems(to, after[0], after[1], 'model'));
  let ax = conv.XAxisAbscissa ?? 1, ay = conv.XAxisOrdinate ?? 0;
  const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
  const step = 10 / (METRES_PER[from.unit] || 1);   // 10 m along the model's X axis, in the old system's unit
  const p1 = transformer(from, to)(conv.Eastings + ax * step, conv.Northings + ay * step);
  const dx = p1[0] - o2[0], dy = p1[1] - o2[1], D = Math.hypot(dx, dy);
  if (!fin(D) || D === 0) return { error: fail('outside', { name: from.name }), problems };
  const out = {
    Eastings: r6(o2[0]), Northings: r6(o2[1]),
    OrthogonalHeight: r6((conv.OrthogonalHeight || 0) * (METRES_PER[from.unit] || 1) / (METRES_PER[to.unit] || 1)),
    XAxisAbscissa: r12(dx / D), XAxisOrdinate: r12(dy / D),
    Scale: (conv.Scale ?? 1) * D / step,
  };
  return { conv: out, before, after, problems };
}

// ------------------------------------------------------------------ item 3: files that carry a system of their own
export const fileKey = (f) => [f?.name || '', f?.size ?? 0, f?.lastModified ?? 0].join('|');
const FILE_KEY = 'cadcraft.filecrs';
const store = (s) => s || (typeof localStorage !== 'undefined' ? localStorage : null);
export function rememberFileCrs(storage, key, crs) {
  try {
    const all = JSON.parse(store(storage)?.getItem(FILE_KEY) || '{}') || {};
    all[key] = toRecord(crs);
    const keys = Object.keys(all);
    for (const k of keys.slice(0, Math.max(0, keys.length - 200))) delete all[k];
    store(storage)?.setItem(FILE_KEY, JSON.stringify(all));
  } catch { /* private window: this page only */ }
}
export function recallFileCrs(storage, key) {
  try { return fromRecord((JSON.parse(store(storage)?.getItem(FILE_KEY) || '{}') || {})[key]); } catch { return null; }
}

const defOf = (c) => c.proj4;
/**
 * Reproject interleaved x, y (a Float64Array in `from`'s unit) into `to`'s unit. Large inputs go through a Worker when `worker` = { url, proj4Url } is
 * given (proj4 is imported there by URL: a worker does not see the page's import map); otherwise in slices that give the page back between them.
 * `proj4` = the proj4 function. `progress(fraction)`, `signal` (AbortSignal). Points that do not project come back NaN and are counted in `bad`.
 */
export async function reproject({ proj4, from, to, xy, worker = null, progress = null, signal = null, sliceMs = 8, max = REPROJECT_MAX }) {
  const n = xy.length / 2;
  if (n > max) return { xy, bad: 0, problems: [fail('toolarge', { n, max })], refused: true };
  const fromDef = defOf(from), toDef = defOf(to);
  let bad = 0;
  if (worker && typeof Worker !== 'undefined' && n > 200000) {
    bad = await new Promise((resolve, reject) => {
      const w = new Worker(worker.url, { type: 'module' });
      const stop = () => { w.terminate(); reject(Object.assign(new Error('cancelled'), { name: 'AbortError' })); };
      signal?.addEventListener('abort', stop, { once: true });
      w.onmessage = (e) => {
        const m = e.data;
        if (m.progress !== undefined) { progress?.(m.progress); return; }
        signal?.removeEventListener('abort', stop); w.terminate();
        if (m.error) reject(new Error(m.error)); else { xy.set(m.xy); resolve(m.bad); }
      };
      w.onerror = (e) => { signal?.removeEventListener('abort', stop); w.terminate(); reject(new Error(e.message || 'worker')); };
      const copy = new Float64Array(xy);
      w.postMessage({ proj4Url: worker.proj4Url, fromDef, toDef, xy: copy }, [copy.buffer]);
    });
  } else {
    const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    let i = 0, last = now();
    while (i < n) {
      const end = Math.min(n, i + 20000);
      bad += reprojectBatch(proj4, fromDef, toDef, xy, { start: i, end });
      i = end;
      if (signal?.aborted) throw Object.assign(new Error('cancelled'), { name: 'AbortError' });
      if (now() - last > sliceMs) { progress?.(i / n); await new Promise((r) => setTimeout(r, 0)); last = now(); }
    }
  }
  const problems = bad ? [problem('dropped', 'warning', { n: bad })] : [];
  return { xy, bad, problems };
}
