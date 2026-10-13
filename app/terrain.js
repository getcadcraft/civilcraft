/* SPDX-License-Identifier: Apache-2.0 */
/**
 * terrain.js — elevation grids and LiDAR into a CivilCraft project (docs/GIS-SPEC.md §3, builder B). No DOM.
 *
 * Shared by raster.js (GeoTIFF / ASCII grid), las.js (LAS / LAZ), geotiff-write.js and gis-terrain-ui.js:
 *   UNIT_OF_EPSG {9001:'m', 9002:'ft', 9003:'ftUS'} · unitFromName('metre' | 'US survey foot' | …) → 'm'|'ft'|'ftUS'|null
 *   UNIT_WORDS / UNIT_SHORT                                  'meters' / 'm' …
 *   crsFromGeoKeys(keys) → { crs, code, note, zUnit, xyUnit } GeoTIFF GeoKeys (also LAS's GeoKeys VLR) → a state.crs
 *                                                            shape through crs.js's catalog (projected or geographic)
 *   projectZUnit(project) → 'm' | 'ft' | 'ftUS'              what the project's "ft" means (the system's foot, else US survey ft)
 *   zFactor(fromUnit, toUnit)                                multiply a file's z by this to get project units
 *   toProject(srcCrs, projectCrs) → { fn(x, y) → [x, y], identity }   (frame(projectCrs).from(srcCrs); identity when the
 *                                                            numbers are the same system, or when either side is unknown)
 *   toSource(srcCrs, projectCrs) → (x, y) → [x, y]           the other way (areas picked in the plan → the file's window)
 *   boxThrough(box, fn) → box                                a rectangle's outline (densified) through a transform → its box
 *   gridWindow(src, box) → { c0, r0, c1, r1 } | null         the cells of a raster whose centers can fall in a box
 *   nodeXY(src, col, row) → [x, y]                           a cell center in the file's system (gt = GDAL geotransform,
 *                                                            cell-corner convention, pixel-is-point already shifted)
 *   gridPoints(grid, src, { fn, zf, desc, start }) → points  survey points ({n, x, y, z, d}) from a read window
 *   gridTin(grid, src, { fn, zf }) → { pts, faces, cells, skipped }  a grid TIN: two triangles per cell (the SW–NE
 *                                                            diagonal); a triangle is left out when a corner is nodata
 *   nextNumber(points) → n                                   the first whole number after the highest point number
 *   niceStep(x) → 1-2-5 rounding up                          LIMITS
 *
 * A grid read (raster.js readWindow) is { c0, r0, step, nx, ny, z: Float64Array (NaN = nodata) }: node (i, j) is cell
 * (c0 + i·step, r0 + j·step). Elevations at the nodes are the file's values (× zf for units); a grid TIN is planar between
 * them — so the surface equals the grid at every node and interpolates linearly inside each triangle.
 */

import { t } from "./i18n.js";
import { byCode, crsFromEntry, catalogLoaded, frame, transformer, METRES_PER } from './crs.js';

export const LIMITS = {
  fileBytes: 200 * 1024 * 1024,   // as Open: larger files are refused
  points: 500000,                 // survey points from one import
  tinNodes: 500000,               // grid TIN nodes (≈ 1 M triangles)
  readCells: 400e6,               // cells a window read may cover (rows are read in bands; memory stays small)
  dim: 1e6,                       // width or height of a raster
};

export const UNIT_OF_EPSG = { 9001: 'm', 9002: 'ft', 9003: 'ftUS' };
export const EPSG_OF_UNIT = { m: 9001, ft: 9002, ftUS: 9003 };
export const UNIT_WORDS = { get m() { return t('terrain.unit.m'); }, get ft() { return t('terrain.unit.ft'); }, get ftUS() { return t('terrain.unit.ftus'); } };
export const UNIT_SHORT = { m: 'm', ft: 'ft', ftUS: 'ft (US)' };   // i18n-ignore: unit symbols

export function unitFromName(s) {
  const t = String(s ?? '').trim().toLowerCase().replace(/[_\s]+/g, ' ');
  if (!t) return null;
  if (/^(m|metre|meter|metres|meters|9001)$/.test(t)) return 'm';
  if (/^(us survey foot|us survey feet|survey foot|us-ft|ftus|us ft|foot us|foot_us|9003|us foot)$/.test(t)) return 'ftUS';
  if (/^(ft|foot|feet|international foot|intl foot|9002)$/.test(t)) return 'ft';
  return null;
}

/** GeoKeys (geotiff.js names or numeric ids) → the system they name. */
export function crsFromGeoKeys(keys) {
  const k = (name, id) => (keys ? keys[name] ?? keys[id] : undefined);
  const model = k('GTModelTypeGeoKey', 1024);
  const proj = k('ProjectedCSTypeGeoKey', 3072);
  const geog = k('GeographicTypeGeoKey', 2048);
  const lin = k('ProjLinearUnitsGeoKey', 3076);
  const vert = k('VerticalUnitsGeoKey', 4099);
  const out = { crs: null, code: null, note: null, zUnit: UNIT_OF_EPSG[vert] || null, xyUnit: UNIT_OF_EPSG[lin] || null };
  if (!keys) { out.note = t('terrain.crs.none'); return out; }
  const code = model === 2 ? geog : proj ?? (model !== 1 ? geog : undefined);
  if (!Number.isInteger(code) || code <= 0 || code === 32767) {
    out.note = code === 32767 ? t('terrain.crs.own') : t('terrain.crs.none');
    return out;
  }
  out.code = code;
  if (!catalogLoaded()) { out.note = t('terrain.crs.noload'); return out; }
  const e = byCode(code);
  if (!e) { out.note = t('terrain.crs.unknown', { code }); return out; }
  out.crs = crsFromEntry(e);
  return out;
}

export function projectZUnit(project) {
  const s = project.state;
  if (s.units === 'm') return 'm';
  return s.crs?.unit === 'ft' ? 'ft' : 'ftUS';
}
export const zFactor = (from, to) => METRES_PER[from] / METRES_PER[to];

const sameCrs = (a, b) => !!a && !!b && !b.local && ((a.code != null && a.code === b.code) || a.proj4 === b.proj4);

export function toProject(src, pc) {
  if (!src || !pc || sameCrs(src, pc)) return { fn: (x, y) => [x, y], identity: true };
  return { fn: frame(pc).from(src), identity: false };
}
export function toSource(src, pc) {
  if (!src || !pc || sameCrs(src, pc)) return (x, y) => [x, y];
  return frame(pc).to(src);
}
/** Lon/lat of a file's point, when its system is known. */
export function lonLatOf(src) {
  if (!src) return null;
  if (src.unit === 'deg') return (x, y) => [x, y];
  const t = transformer(src, null);
  return (x, y) => t(x, y);
}

export function boxThrough(b, fn, n = 16) {
  const o = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  const add = (x, y) => { const [u, v] = fn(x, y); if (!Number.isFinite(u) || !Number.isFinite(v)) return; o.minX = Math.min(o.minX, u); o.maxX = Math.max(o.maxX, u); o.minY = Math.min(o.minY, v); o.maxY = Math.max(o.maxY, v); };
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = b.minX + (b.maxX - b.minX) * t, y = b.minY + (b.maxY - b.minY) * t;
    add(x, b.minY); add(x, b.maxY); add(b.minX, y); add(b.maxX, y);
  }
  return Number.isFinite(o.minX) ? o : null;
}

export function nodeXY(src, col, row) {
  const g = src.gt, c = col + 0.5, r = row + 0.5;
  return [g[0] + c * g[1] + r * g[2], g[3] + c * g[4] + r * g[5]];
}

/** Cells (half-open [c0, c1) × [r0, r1)) whose centers may fall in the box (source coordinates). */
export function gridWindow(src, box) {
  const g = src.gt, det = g[1] * g[5] - g[2] * g[4];
  if (!det || !box) return null;
  const inv = (x, y) => { const dx = x - g[0], dy = y - g[3]; return [(g[5] * dx - g[2] * dy) / det - 0.5, (-g[4] * dx + g[1] * dy) / det - 0.5]; };
  let c0 = Infinity, r0 = Infinity, c1 = -Infinity, r1 = -Infinity;
  for (const [x, y] of [[box.minX, box.minY], [box.maxX, box.minY], [box.maxX, box.maxY], [box.minX, box.maxY]]) {
    const [c, r] = inv(x, y);
    c0 = Math.min(c0, c); c1 = Math.max(c1, c); r0 = Math.min(r0, r); r1 = Math.max(r1, r);
  }
  const w = { c0: Math.max(0, Math.ceil(c0 - 1e-9)), r0: Math.max(0, Math.ceil(r0 - 1e-9)), c1: Math.min(src.width, Math.floor(c1 + 1e-9) + 1), r1: Math.min(src.height, Math.floor(r1 + 1e-9) + 1) };
  return w.c1 > w.c0 && w.r1 > w.r0 ? w : null;
}

export function nextNumber(points) {
  let hi = 0;
  for (const p of points) { const n = Number(p.n); if (Number.isInteger(n) && n > hi && n < 1e12) hi = n; }
  return hi + 1;
}

export function gridPoints(grid, src, { fn, zf = 1, desc = 'DEM', start = 1 }) {
  const out = [];
  let n = start;
  for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) {
    const z = grid.z[j * grid.nx + i];
    if (Number.isNaN(z)) continue;
    const [sx, sy] = nodeXY(src, grid.c0 + i * grid.step, grid.r0 + j * grid.step);
    const [x, y] = fn(sx, sy);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push({ n: String(n++), x, y, z: z * zf, d: desc });
  }
  return out;
}

export function gridTin(grid, src, { fn, zf = 1 }) {
  const { nx, ny, z } = grid, idx = new Int32Array(nx * ny).fill(-1), pts = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = z[j * nx + i];
    if (Number.isNaN(v)) continue;
    const [sx, sy] = nodeXY(src, grid.c0 + i * grid.step, grid.r0 + j * grid.step);
    const [x, y] = fn(sx, sy);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    idx[j * nx + i] = pts.length;
    pts.push({ x, y, z: v * zf });
  }
  const faces = [];
  let cells = 0, skipped = 0;
  // row j runs north → south (row order of the file); the cell (i, j) has corners a = (i, j+1) SW, b = (i+1, j+1) SE,
  // c = (i+1, j) NE, d = (i, j) NW; triangles a-b-c and a-c-d share the SW–NE diagonal
  for (let j = 0; j + 1 < ny; j++) for (let i = 0; i + 1 < nx; i++) {
    const a = idx[(j + 1) * nx + i], b = idx[(j + 1) * nx + i + 1], c = idx[j * nx + i + 1], d = idx[j * nx + i];
    cells++;
    if (a >= 0 && b >= 0 && c >= 0) faces.push([a, b, c]); else skipped++;
    if (a >= 0 && c >= 0 && d >= 0) faces.push([a, c, d]); else skipped++;
  }
  return { pts, faces, cells, skipped };
}

/** 1-2-5 rounding (up). */
export function niceStep(x) {
  if (!(x > 0) || !Number.isFinite(x)) return 1;
  const p = 10 ** Math.floor(Math.log10(x)), m = x / p;
  return (m <= 1 + 1e-9 ? 1 : m <= 2 + 1e-9 ? 2 : m <= 5 + 1e-9 ? 5 : 10) * p;
}
