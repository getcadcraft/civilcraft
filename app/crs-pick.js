/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs-pick.js — the DOM-free half of the coordinate system dialog (gis-crs-ui.js; docs/GIS-SPEC.md §4.1). Builder C.
 * Everything here runs in Node for bin/test-civilcraft-crs.mjs exactly as the page runs it.
 *
 *   systemsThatFit({x, y}, units, {limit}) → { list: [{ entry, lon, lat }], total }
 *       catalog systems in the project's unit family (ft: ft + ftUS; m: m) whose area of use holds the point when the
 *       point is read in that system (and reads back to itself) — "Systems these coordinates fit"
 *   familyOf(units) → ['ft','ftUS'] | ['m']
 *   unitWords(unit) · areaWords(area) · shiftWords(entryOrCrs) · describe(crs) → { name, code, unit, shift, area, local }
 *   latLonText(lon, lat, 'dms'|'dd') → '30°18′00.00″ N  97°42′00.00″ W' | '30.300000° N  97.700000° W'
 *   parseLatLon(text) → [lon, lat] | null      "30.3, -97.7" · "30°18'N 97°42'W" · "N30 18 00 W97 42 00"
 *   gridOf(crs, lon, lat) → [gx, gy]           latitude/longitude → the system's grid (no local step)
 *   misclosure(local, pLocal, pGrid) → { dx, dy, dist, ppm } a third control point against a two-point fit
 *   groundFactor(crs, x, y, z) → { k, elevation, combined, convergence, lon, lat } (z in project units, ellipsoid height)
 *   reprojectProject(state, points, map) → { points, moved, refused } converts a project's coordinates in place with
 *       map(x, y) → [x, y] (points, breaklines, boundary, alignment PIs, pads, structures); a LandXML TIN is refused
 */

import { byCode, frame, transformer, search, METRES_PER, gridInfo, GRID_SUGGEST } from './crs.js';
import { t } from './i18n.js';   // 0.4 V11

export const familyOf = (units) => (units === 'm' ? ['m'] : ['ft', 'ftUS']);
const inArea = (a, lon, lat) => !!a && lat >= a[1] && lat <= a[3] && (a[0] <= a[2] ? lon >= a[0] && lon <= a[2] : lon >= a[0] || lon <= a[2]);
const areaSize = (a) => (a ? ((a[2] - a[0] + 360) % 360 || 360) * (a[3] - a[1]) : 1e9);

/** Catalog systems the project's coordinates fit (see the header). Sorted: state plane / UTM of current datums first, then
 *  the smallest area of use (the most specific system). */
export function systemsThatFit(pt, units, { limit = 60 } = {}) {
  if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return { list: [], total: 0 };
  const fam = familyOf(units);
  const all = search('', { limit: 1e6 }).filter((e) => !e.geographic && fam.includes(e.unit));
  const out = [];
  for (const e of all) {
    try {
      const t = transformer(e, null), [lon, lat] = t(pt.x, pt.y);
      if (!Number.isFinite(lon) || !Number.isFinite(lat) || !inArea(e.area, lon, lat)) continue;
      const back = transformer(null, e)(lon, lat);
      if (!(Math.hypot(back[0] - pt.x, back[1] - pt.y) < 1e-3)) continue;
      out.push({ entry: e, lon, lat });
    } catch { /* a definition proj4js cannot run here is just not a fit */ }
  }
  out.sort((a, b) => rankOf(a.entry) - rankOf(b.entry) || areaSize(a.entry.area) - areaSize(b.entry.area) || a.entry.code - b.entry.code);
  return { list: out.slice(0, limit), total: out.length };
}
function rankOf(e) {
  const n = e.name;
  if (/^NAD83\(2011\)/.test(n)) return 0;
  if (/^NAD83 \//.test(n)) return 1;
  if (/^WGS 84/.test(n)) return 2;
  if (/^(ETRS89|GDA2020|NZGD2000|NAD83\(CSRS\)|RGF93|OSGB36)/.test(n)) return 3;
  return 5;
}

const UNIT_KEY = { m: 'crs.unit.m', ft: 'crs.unit.ft', ftUS: 'crs.unit.ftus', deg: 'crs.unit.deg' };
export const unitWords = (u) => (Object.hasOwn(UNIT_KEY, u) ? t(UNIT_KEY[u]) : String(u || ''));

const deg = (v, pos, neg, d = 2) => Math.abs(v).toFixed(d) + '° ' + (v >= 0 ? pos : neg);   // i18n-ignore: hemisphere letters (symbols)
/** The catalog's bounds in words. */
export function areaWords(a) {
  if (!Array.isArray(a) || a.length !== 4) return t('crs.area.none');
  if (a[1] <= -89 && a[3] >= 89 && areaSize(a) >= 359 * 178) return t('crs.area.world');
  return t('crs.area.box', { south: deg(a[1], 'N', 'S'), north: deg(a[3], 'N', 'S'), west: deg(a[0], 'E', 'W'), east: deg(a[2], 'E', 'W') });
}

/** How well the datum shift to WGS 84 is known — what map layers and GeoJSON can be trusted to. */
export function shiftWords(x) {
  const e = x && (x.shiftAccuracy !== undefined ? x : x.code != null ? byCodeSafe(x.code) : null);
  const name = String(x?.name || '');
  if (/^WGS 84\b/.test(name)) return t('crs.shift.wgs84');
  if (x?.grid) {   // 0.4 V11: a grid shift file
    const g = gridInfo(x.grid), sg = GRID_SUGGEST.find((q) => q.name === x.grid);
    return g ? t('grid.shift.on', { name: x.grid, acc: sg ? fmtM(sg.accuracy) : t('grid.shift.acc.own') }) : t('grid.shift.missing', { name: x.grid });
  }
  if (/^NAD83\b/.test(name)) return t('crs.shift.nad83');
  if (!e) return t('crs.shift.prj');
  if (e.shiftAccuracy == null) return t('crs.shift.unknown');
  if (e.shiftAccuracy === 0 || /\+towgs84=0,0,0(\s|$)/.test(e.proj4 || '') && e.shiftAccuracy <= 1) return t('crs.shift.same', { acc: fmtM(e.shiftAccuracy || 1) });
  return t('crs.shift.known', { acc: fmtM(e.shiftAccuracy) });
}
const fmtM = (m) => (m < 1 ? Math.round(m * 100) + ' cm' : (m < 10 ? +m.toFixed(1) : Math.round(m)) + ' m');
function byCodeSafe(c) { try { return byCode(c); } catch { return null; } }

/** One system, ready to show. */
export function describe(crs) {
  if (!crs) return null;
  const e = crs.code != null ? byCodeSafe(crs.code) : null;
  const l = crs.local;
  let local = t('crs.local.grid');
  if (l) {
    const ground = l.rotation === 0 && l.from[0] === l.to[0] && l.from[1] === l.to[1];
    local = ground
      ? t('crs.local.ground', { scale: l.scale.toFixed(8), e: l.from[0], n: l.from[1] })
      : t('crs.local.local', { scale: l.scale.toFixed(8), rotation: l.rotation.toFixed(6), from: l.from.join(', '), to: l.to.join(', ') });
  }
  return { name: crs.name, code: crs.code ?? null, unit: unitWords(crs.unit), shift: shiftWords(crs), area: e ? areaWords(e.area) : t('crs.area.prj'), local };
}

/** Latitude and longitude for the status bar. */
export function latLonText(lon, lat, mode = 'dms') {
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return '';
  // i18n-ignore: hemisphere letters N S E W (symbols; parseLatLon reads them back)
  if (mode === 'dd') return Math.abs(lat).toFixed(6) + '° ' + (lat >= 0 ? 'N' : 'S') + '  ' + Math.abs(lon).toFixed(6) + '° ' + (lon >= 0 ? 'E' : 'W');
  return dmsOf(lat, 'N', 'S') + '  ' + dmsOf(lon, 'E', 'W');
}
function dmsOf(v, pos, neg) {
  let s = Math.round(Math.abs(v) * 360000) / 100; // hundredths of a second (about 0.3 m)
  const d = Math.floor(s / 3600); s -= d * 3600;
  const m = Math.floor(s / 60); s -= m * 60;
  return d + '°' + String(m).padStart(2, '0') + '′' + s.toFixed(2).padStart(5, '0') + '″ ' + (v >= 0 ? pos : neg);
}

/** Typed latitude and longitude (latitude first, as people say it): decimal or degrees-minutes-seconds, with N/S/E/W or
 *  signs. → [lon, lat] or null. */
export function parseLatLon(text) {
  const s = String(text || '').trim().slice(0, 200).replace(/[°º˚′'’″"]/g, ' ').replace(/\s+/g, ' ');
  if (!s) return null;
  const halves = s.includes(',') || s.includes(';') ? s.split(/\s*[,;]\s*/) : splitHemis(s);
  if (!halves || halves.length !== 2) return null;
  const a = oneAngle(halves[0]), b = oneAngle(halves[1]);
  if (!a || !b) return null;
  let lat = a, lon = b;
  if (a.axis === 'lon' || b.axis === 'lat') { lat = b; lon = a; }
  if (lat.axis === 'lon' || lon.axis === 'lat') return null;
  if (!(Math.abs(lat.v) <= 90) || !(Math.abs(lon.v) <= 180)) return null;
  return [lon.v, lat.v];
}
function splitHemis(s) {
  // "30 18 00 N 97 42 00 W" or "N30 18 00 W97 42 00"
  const m = s.match(/^([NSns]?\s*[\d.\s]+[NSns]?)\s+([EWew]?\s*[\d.\s]+[EWew]?)$/) || s.match(/^([EWew]?\s*[\d.\s]+[EWew]?)\s+([NSns]?\s*[\d.\s]+[NSns]?)$/);
  return m ? [m[1], m[2]] : null;
}
function oneAngle(t) {
  let s = t.trim(), sign = 1, axis = null;
  const h = s.match(/^([NSEWnsew])\s*|\s*([NSEWnsew])$/);
  if (h) { const c = (h[1] || h[2]).toUpperCase(); axis = c === 'N' || c === 'S' ? 'lat' : 'lon'; if (c === 'S' || c === 'W') sign = -1; s = s.replace(/^[NSEWnsew]\s*|\s*[NSEWnsew]$/, ''); }
  if (s.startsWith('-')) { sign *= -1; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  const n = s.trim().split(/\s+/);
  if (!n.length || n.length > 3 || !n.every((x) => /^\d+(\.\d+)?$/.test(x))) return null;
  const [d, m = 0, sec = 0] = n.map(Number);
  if (n.length > 1 && (!Number.isInteger(d) || m >= 60 || sec >= 60)) return null;
  return { v: sign * (d + m / 60 + sec / 3600), axis };
}

/** Latitude/longitude → the system's grid coordinates (the `local` step left out). */
export function gridOf(crs, lon, lat) {
  return transformer(null, crs)(lon, lat);
}

/** A third control point against a fit: where the fit puts its project coordinates vs its known grid coordinates. */
export function misclosure(local, pLocal, pGrid) {
  const g = localToGrid(local, pLocal[0], pLocal[1]);
  const dx = pGrid[0] - g[0], dy = pGrid[1] - g[1], dist = Math.hypot(dx, dy);
  const span = Math.hypot(pLocal[0] - local.from[0], pLocal[1] - local.from[1]);
  return { dx, dy, dist, ppm: span > 0 ? dist / span * 1e6 : null };
}

/** The `local` step alone (crs.js frame().toGrid without a system): grid = to + scale · R(rotation) · (p − from). */
export function localToGrid(l, x, y) {
  const c = Math.cos(l.rotation * Math.PI / 180), s = Math.sin(l.rotation * Math.PI / 180), dx = x - l.from[0], dy = y - l.from[1];
  return [l.to[0] + l.scale * (c * dx - s * dy), l.to[1] + l.scale * (s * dx + c * dy)];
}

/** Scale factors at a project point for ground coordinates (z: elevation in project units, taken as ellipsoid height). */
export function groundFactor(crs, x, y, z = 0) {
  const f = frame(crs);
  const r = f.factors(x, y, z);
  return { k: r.k, elevation: r.elevation, combined: r.combined, convergence: r.convergence, lon: r.lon, lat: r.lat };
}

/** Converts every coordinate of a project (state + survey points) with map(x, y) → [x, y]. Call inside one undo step
 *  (Project.editPoints). Refuses a surface read from LandXML (its TIN is kept outside the undo snapshots). */
export function reprojectProject(state, points, map) {
  if (state.surface?.tin) return { points, moved: 0, refused: t('crs.reproject.tin') };
  let moved = 0;
  const xy = (q) => { const [x, y] = map(q.x, q.y); if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(t('crs.reproject.coord')); q.x = x; q.y = y; moved++; };
  const pts = points.map((p) => { const [x, y] = map(p.x, p.y); if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error(t('crs.reproject.point', { n: p.n })); moved++; return { ...p, x, y }; });
  for (const b of state.surface?.breaklines || []) b.pts.forEach(xy);
  if (state.surface?.boundary) state.surface.boundary.forEach(xy);
  for (const a of state.alignments || []) a.pis.forEach(xy);
  for (const d of state.pads || []) d.pts.forEach(xy);
  for (const s of state.network?.structures || []) xy(s);
  return { points: pts, moved, refused: null };
}

export { METRES_PER };
