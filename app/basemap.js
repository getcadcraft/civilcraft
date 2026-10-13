/* SPDX-License-Identifier: Apache-2.0 */
/**
 * basemap.js — map layers under the plan (docs/GIS-SPEC.md §4.2), the DOM-free half. Builder C. No fetching here:
 * gis-map-ui.js fetches and paints; this file parses what servers send (untrusted), builds request URLs, plans tiles and
 * warps pictures into the plan. Runs in Node for bin/test-civilcraft-maps.mjs exactly as the page runs it.
 *
 * Map layers live in state.gis.maps as FLAT records (gis-layers.js keeps plain strings, numbers and true/false):
 *   { id: 'm1', name, kind: 'image'|'xyz'|'wms'|'wmts'|'arcgis', url, layer, style, format, version,
 *     crsCode, crsName, crsProj4, crsUnit       the layer's own system (null crsProj4 = the project's coordinates)
 *     opacity (0…1), visible, attribution,
 *     image: '<id>' (kind image: the picture is project.gisImages.get(id), a data: URL kept outside the undo snapshots),
 *     width, height, a0…a5                       kind image: GDAL geotransform of the picture (pixel corners → system)
 *     grid: JSON text of a tile grid             wmts / tiled arcgis (so a saved project needs no capabilities fetch)
 *     set, template, subdomains }               wmts tile matrix set id and REST template · xyz {s} letters
 *   readMaps(list, notes) → the records cleaned for use (unknown kinds/URLs dropped with a note)
 *
 * Tile grids (one shape for XYZ, WMTS and ArcGIS tile caches):
 *   grid = { code, origin: [x, y] (top-left, system units), matrices: [{ id, res, tw, th, mw, mh }] }  res = units per pixel
 *   XYZ_GRID (web Mercator, z 0…22) · gridTiles(grid, bbox, res, {cap}) → { matrix, tiles: [{ col, row, bounds }] }
 *   pickMatrix(grid, res) — the finest matrix not finer than the screen needs (never more than ~1.5× the screen's pixels)
 *
 * Servers: parseWmsCapabilities(text) · parseWmtsCapabilities(text) · parseArcgisService(json, url) (each throws a plain
 *   Error for junk, caps sizes and counts, keeps only text) · codeOfCrs('urn:ogc:def:crs:EPSG::3857') → 3857 (CRS84 → 4326,
 *   900913/102100/102113 → 3857) · wmsPickCode(layerCodes, projectCode) · wmsGetMapUrl(…) (1.3.0 axis order for
 *   geographic EPSG codes) · wmtsTileUrl(…) · arcgisExportUrl(…) · arcgisTileUrl(…) · xyzUrl(template, z, x, y, subdomains)
 *   checkUrl(text) → URL | throws (http and https only)
 * Pictures: parseWorldFile(text) → GDAL geotransform · worldFileFor(name) → the world file names to look for
 * Warping: planWarp(pixToScreen, w, h, { tol, maxDepth }) → cells [{ src: [[u,v]×4], dst: [[x,y]×4], m: affine }], each
 *   drawn as an affine piece clipped to its quad — split until the affine is within `tol` screen px of the exact mapping.
 *   affineFrom3(src3, dst3) → [a, b, c, d, e, f] (canvas setTransform order) · viewSourceBox(viewBounds, toSource, n)
 */

import { parseXml } from './xml.js';
import { t } from "./i18n.js";

export const R_MERC = 6378137;
export const HALF_MERC = Math.PI * R_MERC; // 20037508.342789244
export const MERC_CODES = new Set([3857, 900913, 102100, 102113, 3785, 41001]);
const MAX_TEXT = 8 * 1024 * 1024;           // capabilities larger than this are refused
const MAX_LAYERS = 5000, MAX_MATRICES = 40;

// ------------------------------------------------------------------ web Mercator
export function lonLatToMerc(lon, lat) {
  const l = Math.max(-85.0511287798066, Math.min(85.0511287798066, lat));
  return [R_MERC * lon * Math.PI / 180, R_MERC * Math.log(Math.tan(Math.PI / 4 + l * Math.PI / 360))];
}
export function mercToLonLat(x, y) {
  return [x / R_MERC * 180 / Math.PI, (2 * Math.atan(Math.exp(y / R_MERC)) - Math.PI / 2) * 180 / Math.PI];
}
/** The standard XYZ ("Google") tile grid: 256 px tiles, zoom 0 = one tile for the world. */
export const XYZ_GRID = Object.freeze({
  code: 3857, origin: [-HALF_MERC, HALF_MERC],
  matrices: Array.from({ length: 23 }, (_, z) => Object.freeze({ id: String(z), res: (2 * HALF_MERC) / 256 / 2 ** z, tw: 256, th: 256, mw: 2 ** z, mh: 2 ** z })),
});
/** Tile column/row of a lon/lat at zoom z (whole numbers). */
export function tileAt(lon, lat, z) {
  const [x, y] = lonLatToMerc(lon, lat), m = XYZ_GRID.matrices[z];
  return [Math.floor((x + HALF_MERC) / (m.res * 256)), Math.floor((HALF_MERC - y) / (m.res * 256))];
}

// ------------------------------------------------------------------ tile grids
/** The matrix to use for a screen resolution `res` (system units per screen px): the coarsest whose pixels are no larger
 *  than 1.5 screen px — sharp enough, and never a flood of tiles. */
export function pickMatrix(grid, res) {
  const ms = [...grid.matrices].sort((a, b) => b.res - a.res);
  let pick = ms[0];
  for (const m of ms) { pick = m; if (m.res <= res * 1.5) break; }
  return pick;
}
/** Tiles of `grid` covering bbox [minX, minY, maxX, maxY] (grid units) at screen resolution `res`; a coarser matrix when
 *  more than `cap` tiles would be needed. */
export function gridTiles(grid, bbox, res, { cap = 64 } = {}) {
  const ms = [...grid.matrices].sort((a, b) => b.res - a.res);
  let i = ms.indexOf(pickMatrix(grid, res));
  for (; i >= 0; i--) {
    const m = ms[i], tw = m.res * m.tw, th = m.res * m.th;
    let c0 = Math.floor((bbox[0] - grid.origin[0]) / tw), c1 = Math.floor((bbox[2] - grid.origin[0]) / tw);
    let r0 = Math.floor((grid.origin[1] - bbox[3]) / th), r1 = Math.floor((grid.origin[1] - bbox[1]) / th);
    c0 = Math.max(0, c0); r0 = Math.max(0, r0);
    if (Number.isFinite(m.mw)) c1 = Math.min(m.mw - 1, c1);
    if (Number.isFinite(m.mh)) r1 = Math.min(m.mh - 1, r1);
    if (!(c1 >= c0 && r1 >= r0)) return { matrix: m, tiles: [] };
    if ((c1 - c0 + 1) * (r1 - r0 + 1) > cap && i > 0) continue;
    const tiles = [];
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      if (tiles.length >= cap) break;
      tiles.push({ col: c, row: r, bounds: [grid.origin[0] + c * tw, grid.origin[1] - (r + 1) * th, grid.origin[0] + (c + 1) * tw, grid.origin[1] - r * th] });
    }
    // the middle first: what the eye looks at arrives first
    const cx = (bbox[0] + bbox[2]) / 2, cy = (bbox[1] + bbox[3]) / 2;
    tiles.sort((a, b) => Math.hypot((a.bounds[0] + a.bounds[2]) / 2 - cx, (a.bounds[1] + a.bounds[3]) / 2 - cy) - Math.hypot((b.bounds[0] + b.bounds[2]) / 2 - cx, (b.bounds[1] + b.bounds[3]) / 2 - cy));
    return { matrix: m, tiles };
  }
  return { matrix: ms[0], tiles: [] };
}

// ------------------------------------------------------------------ CRS names in capabilities
/** 'EPSG:3857', 'urn:ogc:def:crs:EPSG::3857', 'urn:ogc:def:crs:EPSG:6.18:3857', 'http://www.opengis.net/def/crs/EPSG/0/3857',
 *  'CRS:84' / 'urn:ogc:def:crs:OGC:1.3:CRS84' (→ 4326, longitude first), Google's 900913 and ArcGIS's 102100/102113 (→ 3857).
 *  → { code, lonFirst } | null. */
export function codeOfCrs(text) {
  const s = String(text || '').trim();
  if (/^(urn:ogc:def:crs:OGC:[\d.]*:CRS84|CRS:?84|http:\/\/www\.opengis\.net\/def\/crs\/OGC\/[\d.]+\/CRS84)$/i.test(s)) return { code: 4326, lonFirst: true, crs84: true };
  const m = s.match(/^(?:EPSG:|urn:ogc:def:crs:EPSG:[\d.]*:|https?:\/\/www\.opengis\.net\/def\/crs\/EPSG\/[\d.]+\/)(\d{3,6})$/i) || s.match(/^(\d{4,6})$/);
  if (!m) return null;
  let code = Number(m[1]);
  if (MERC_CODES.has(code)) code = 3857;
  return { code, lonFirst: /^EPSG:/i.test(s) || /^\d/.test(s), crs84: false };
}

// ------------------------------------------------------------------ XML helpers (xml.js tree: { name, attrs, children, text })
const kids = (e, n) => (e?.children || []).filter((c) => c.name === n);
const kid = (e, n) => (e?.children || []).find((c) => c.name === n) || null;
const txt = (e, max = 500) => clean(e?.text, max);
const attr = (e, n) => { if (!e) return ''; const a = e.attrs || {}; return a[n] ?? a['xlink:' + n] ?? Object.entries(a).find(([k]) => k.endsWith(':' + n))?.[1] ?? ''; };
/** Text from a file or a server: control characters out, trimmed, capped. */
export function clean(v, max = 500) { return String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
const num = (v) => { const n = Number(String(v ?? '').trim()); return Number.isFinite(n) ? n : null; };
/** `what`: 'wms' | 'wmts' (whose capabilities: each message is a whole sentence in the language files). */
function readXml(text, what) {
  const K = what === 'wms'
    ? { big: 'basemap.wms.big', json: 'basemap.wms.json', html: 'basemap.wms.html', bad: 'basemap.wms.unreadable', empty: 'basemap.wms.empty' }
    : { big: 'basemap.wmts.big', json: 'basemap.wmts.json', html: 'basemap.wmts.html', bad: 'basemap.wmts.unreadable', empty: 'basemap.wmts.empty' };
  const s = typeof text === 'string' ? text : '';
  if (!s.trim()) throw new Error(t('basemap.xml.nothing'));
  if (s.length > MAX_TEXT) throw new Error(t(K.big, { mb: Math.round(s.length / 1048576) }));
  if (/^\s*[{[]/.test(s)) throw new Error(t(K.json));
  if (/^\s*<!doctype html|^\s*<html/i.test(s)) throw new Error(t(K.html));
  let doc;
  try { doc = parseXml(s, { maxDepth: 64 }); } catch (e) { throw new Error(t(K.bad, { reason: clean(e.message, 120) })); }
  const root = doc?.name === '#doc' ? doc.children?.[0] : doc;   // xml.js returns the root element
  if (!root) throw new Error(t(K.empty));
  const ex = root.name === 'ServiceExceptionReport' || root.name === 'ExceptionReport' ? root : null;
  if (ex) throw new Error(t('basemap.server_error', { error: clean(findText(ex), 200) }));
  return root;
}
function findText(e) { if (!e) return ''; return (e.text || '') + (e.children || []).map(findText).join(' '); }

// ------------------------------------------------------------------ WMS
/** WMS 1.1.1 / 1.3.0 GetCapabilities → { version, title, getMap, formats, layers: [{ name, title, codes, bbox84, bboxes,
 *  styles, attribution, queryable }] } (only layers with a Name can be requested; CRS, bounding boxes, styles and
 *  attribution are inherited from parents as the standard says). */
export function parseWmsCapabilities(text) {
  const root = readXml(text, 'wms');
  if (!/^(WMS_Capabilities|WMT_MS_Capabilities)$/.test(root.name)) throw new Error(t('basemap.wms.not', { root: clean(root.name, 60) }));
  const version = clean(root.attrs?.version, 20) || (root.name === 'WMS_Capabilities' ? '1.3.0' : '1.1.1');
  const v13 = !/^1\.[01]/.test(version);
  const cap = kid(root, 'Capability');
  const gm = kid(kid(cap, 'Request'), 'GetMap');
  const formats = kids(gm, 'Format').map((f) => txt(f, 80)).filter(Boolean).slice(0, 50);
  const get = kid(kid(kid(kid(gm, 'DCPType'), 'HTTP'), 'Get'), 'OnlineResource');
  const getMap = attr(get, 'href');
  const layers = [];
  const walk = (el, inh, depth) => {
    if (depth > 20 || layers.length >= MAX_LAYERS) return;
    const codes = new Set(inh.codes);
    for (const c of [...kids(el, 'CRS'), ...kids(el, 'SRS')]) for (const part of txt(c, 2000).split(/\s+/)) { const k = codeOfCrs(part); if (k) codes.add(k.code); }
    const bboxes = { ...inh.bboxes };
    for (const b of kids(el, 'BoundingBox')) {
      const k = codeOfCrs(attr(b, 'CRS') || attr(b, 'SRS')); const v = ['minx', 'miny', 'maxx', 'maxy'].map((n) => num(attr(b, n)));
      if (k && v.every((x) => x !== null)) bboxes[k.code] = v13 && isLatFirst(k) ? [v[1], v[0], v[3], v[2]] : v;
    }
    let bbox84 = inh.bbox84;
    const ex = kid(el, 'EX_GeographicBoundingBox');
    if (ex) { const v = ['westBoundLongitude', 'southBoundLatitude', 'eastBoundLongitude', 'northBoundLatitude'].map((n) => num(txt(kid(ex, n)))); if (v.every((x) => x !== null)) bbox84 = v; }
    const ll = kid(el, 'LatLonBoundingBox');
    if (ll) { const v = ['minx', 'miny', 'maxx', 'maxy'].map((n) => num(attr(ll, n))); if (v.every((x) => x !== null)) bbox84 = v; }
    const styles = [...inh.styles];
    for (const s of kids(el, 'Style')) { const n = txt(kid(s, 'Name'), 200); if (n && !styles.some((x) => x.name === n)) styles.push({ name: n, title: txt(kid(s, 'Title'), 200) || n }); }
    const at = kid(el, 'Attribution');
    const attribution = at ? txt(kid(at, 'Title'), 300) || inh.attribution : inh.attribution;
    const name = txt(kid(el, 'Name'), 300);
    if (name) layers.push({ name, title: txt(kid(el, 'Title'), 300) || name, codes: [...codes].slice(0, 500), bbox84, bboxes, styles: styles.slice(0, 50), attribution, queryable: el.attrs?.queryable === '1' });
    for (const c of kids(el, 'Layer')) walk(c, { codes: [...codes], bboxes, bbox84, styles, attribution }, depth + 1);
  };
  for (const l of kids(cap, 'Layer')) walk(l, { codes: [], bboxes: {}, bbox84: null, styles: [], attribution: '' }, 0);
  if (!layers.length) throw new Error(t('basemap.wms.no_layers'));
  return { version: v13 ? '1.3.0' : '1.1.1', title: txt(kid(kid(root, 'Service'), 'Title'), 300), getMap: getMap ? clean(getMap, 2000) : '', formats, layers };
}
/** WMS 1.3.0 (and WMTS) put latitude first for geographic EPSG codes (4326, 4269, 4258…) but not for CRS:84. */
export function isLatFirst(k) {
  if (!k || k.crs84) return false;
  return GEOGRAPHIC_CODES.has(k.code) || (k.code >= 4000 && k.code < 5000 && !MERC_CODES.has(k.code));
}
const GEOGRAPHIC_CODES = new Set([4326, 4269, 4258, 4283, 4167, 4617, 4759, 6318, 7844, 4674, 4612, 4171]);
/** Which system to ask a WMS for: the project's when offered, else web Mercator, else WGS 84 lon/lat (warped). */
export function wmsPickCode(codes, projectCode) {
  const set = new Set(codes);
  if (projectCode && set.has(projectCode)) return projectCode;
  if (set.has(3857)) return 3857;
  if (set.has(4326)) return 4326;
  return null;
}
/** GetMap URL. bbox [minX, minY, maxX, maxY] in `code`'s x (east/longitude) and y order; written lat-first for geographic
 *  EPSG codes in 1.3.0. */
export function wmsGetMapUrl({ url, version = '1.3.0', layer, style = '', format = 'image/png', code, bbox, width, height, transparent = true }) {
  const u = checkUrl(url);
  const v13 = version !== '1.1.1';
  const swap = v13 && isLatFirst({ code, crs84: false });
  const b = swap ? [bbox[1], bbox[0], bbox[3], bbox[2]] : bbox;
  const q = { SERVICE: 'WMS', VERSION: v13 ? '1.3.0' : '1.1.1', REQUEST: 'GetMap', LAYERS: layer, STYLES: style || '', FORMAT: format, TRANSPARENT: transparent ? 'TRUE' : 'FALSE', [v13 ? 'CRS' : 'SRS']: 'EPSG:' + code, BBOX: b.map(fmtNum).join(','), WIDTH: String(Math.round(width)), HEIGHT: String(Math.round(height)) };
  for (const k of Object.keys(q)) for (const have of [...u.searchParams.keys()]) if (have.toUpperCase() === k) u.searchParams.delete(have);
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
  return u.href;
}
const fmtNum = (v) => (Math.abs(v) >= 1e4 ? v.toFixed(3) : String(+v.toPrecision(12)));

// ------------------------------------------------------------------ WMTS
/** WMTS 1.0.0 GetCapabilities → { title, layers: [{ id, title, formats, styles: [{ id, isDefault }], sets: [id], templates:
 *  [{ format, template }], bbox84, attribution }], sets: { id: { code, lonFirst, matrices: [{ id, res, scale, tl: [a, b],
 *  tw, th, mw, mh }] } }, kvp: GetTile URL | '' }. Each matrix's top-left corner is read in the set's axis order
 *  (`tl` raw); `wmtsGrid(set, layer)` turns it into a grid with [x, y]. */
export function parseWmtsCapabilities(text) {
  const root = readXml(text, 'wmts');
  if (root.name !== 'Capabilities') throw new Error(t('basemap.wmts.not', { root: clean(root.name, 60) }));
  const contents = kid(root, 'Contents');
  if (!contents) throw new Error(t('basemap.wmts.no_contents'));
  const sets = {};
  for (const s of kids(contents, 'TileMatrixSet').slice(0, 200)) {
    const id = txt(kid(s, 'Identifier'), 200); if (!id) continue;
    const k = codeOfCrs(txt(kid(s, 'SupportedCRS'), 200));
    const matrices = [];
    for (const m of kids(s, 'TileMatrix').slice(0, MAX_MATRICES)) {
      const scale = num(txt(kid(m, 'ScaleDenominator'))), tl = txt(kid(m, 'TopLeftCorner'), 100).split(/\s+/).map(Number);
      const tw = num(txt(kid(m, 'TileWidth'))), th = num(txt(kid(m, 'TileHeight'))), mw = num(txt(kid(m, 'MatrixWidth'))), mh = num(txt(kid(m, 'MatrixHeight')));
      if (!(scale > 0) || tl.length !== 2 || !tl.every(Number.isFinite) || !(tw > 0 && tw <= 4096) || !(th > 0 && th <= 4096) || !(mw > 0) || !(mh > 0)) continue;
      matrices.push({ id: txt(kid(m, 'Identifier'), 100), scale, tl, tw, th, mw, mh });
    }
    if (matrices.length) sets[id] = { id, code: k?.code ?? null, lonFirst: !!k?.lonFirst || !!k?.crs84, crs84: !!k?.crs84, latFirst: isLatFirst(k), matrices };
  }
  const layers = [];
  for (const l of kids(contents, 'Layer').slice(0, MAX_LAYERS)) {
    const id = txt(kid(l, 'Identifier'), 300); if (!id) continue;
    const bb = kid(l, 'WGS84BoundingBox');
    let bbox84 = null;
    if (bb) { const lo = txt(kid(bb, 'LowerCorner'), 100).split(/\s+/).map(Number), hi = txt(kid(bb, 'UpperCorner'), 100).split(/\s+/).map(Number); if ([...lo, ...hi].length === 4 && [...lo, ...hi].every(Number.isFinite)) bbox84 = [lo[0], lo[1], hi[0], hi[1]]; }
    layers.push({
      id, title: txt(kid(l, 'Title'), 300) || id,
      formats: kids(l, 'Format').map((f) => txt(f, 80)).filter(Boolean).slice(0, 20),
      styles: kids(l, 'Style').map((s) => ({ id: txt(kid(s, 'Identifier'), 200), isDefault: s.attrs?.isDefault === 'true' })).filter((s) => s.id).slice(0, 50),
      sets: kids(l, 'TileMatrixSetLink').map((s) => txt(kid(s, 'TileMatrixSet'), 200)).filter((s) => sets[s]).slice(0, 50),
      templates: kids(l, 'ResourceURL').filter((r) => (r.attrs?.resourceType || 'tile') === 'tile').map((r) => ({ format: clean(r.attrs?.format, 80), template: clean(r.attrs?.template, 2000) })).filter((r) => /^https?:\/\//i.test(r.template)).slice(0, 20),
      bbox84,
      attribution: '',
    });
  }
  if (!layers.length) throw new Error(t('basemap.wmts.no_layers'));
  let kvp = '';
  for (const op of kids(kid(root, 'OperationsMetadata'), 'Operation')) {
    if (op.attrs?.name !== 'GetTile') continue;
    for (const g of kids(kid(kid(op, 'DCP'), 'HTTP'), 'Get')) {
      const enc = findText(g).toUpperCase();
      if (!/RESTFUL/.test(enc) || /KVP/.test(enc)) { kvp = clean(attr(g, 'href'), 2000); if (kvp) break; }
    }
  }
  const prov = txt(kid(kid(root, 'ServiceProvider'), 'ProviderName'), 200);
  for (const l of layers) l.attribution = prov;
  return { title: txt(kid(kid(root, 'ServiceIdentification'), 'Title'), 300), layers, sets, kvp };
}
/** Metres per unit of a system for WMTS scale denominators (0.28 mm pixels). Geographic: metres per degree. */
export const metresPerUnit = (unit) => (unit === 'deg' ? 2 * Math.PI * 6378137 / 360 : unit === 'ft' ? 0.3048 : unit === 'ftUS' ? 1200 / 3937 : 1);
/** A WMTS tile matrix set as a grid with x/y corners. `toSet(lon, lat)` maps WGS 84 to the set's system and `bbox84`
 *  (the layer's) decides the axis order of TopLeftCorner when the set's own CRS does not say it clearly. */
export function wmtsGrid(set, unit, { toSet = null, bbox84 = null } = {}) {
  const k = metresPerUnit(unit);
  let swap = set.latFirst;
  if (!set.crs84 && !set.latFirst && toSet && bbox84) {
    // projected systems with northing-first axes (NZTM…) write TopLeftCorner northing first: try both, keep the one whose
    // matrix holds the layer's middle
    try {
      const [mx, my] = toSet((bbox84[0] + bbox84[2]) / 2, (bbox84[1] + bbox84[3]) / 2);
      const m = set.matrices[0], w = m.scale * 0.00028 / k * m.tw * m.mw, h = m.scale * 0.00028 / k * m.th * m.mh;
      const holds = ([x, y]) => mx >= x && mx <= x + w && my <= y && my >= y - h;
      if (!holds(m.tl) && holds([m.tl[1], m.tl[0]])) swap = true;
    } catch { /* keep the CRS's own order */ }
  }
  const matrices = set.matrices.map((m) => ({ id: m.id, res: m.scale * 0.00028 / k, tw: m.tw, th: m.th, mw: m.mw, mh: m.mh, origin: swap ? [m.tl[1], m.tl[0]] : [m.tl[0], m.tl[1]] }));
  // one origin per grid; WMTS allows one per matrix — keep each matrix's own
  return { code: set.code, origin: matrices[0].origin, matrices };
}
/** Tiles of a grid whose matrices may each have their own origin (WMTS). */
export function gridTilesAny(grid, bbox, res, opt) {
  const m = pickMatrix(grid, res);
  if (!m.origin || (m.origin[0] === grid.origin[0] && m.origin[1] === grid.origin[1])) return gridTiles(grid, bbox, res, opt);
  const ms = [...grid.matrices].sort((a, b) => b.res - a.res);
  for (let i = ms.indexOf(m); i >= 0; i--) {
    const one = { code: grid.code, origin: ms[i].origin || grid.origin, matrices: [ms[i]] };
    const r = gridTiles(one, bbox, ms[i].res, opt);
    const need = estimateCount(one, bbox, ms[i]);
    if (need <= (opt?.cap ?? 64) || i === 0) return r;
  }
  return { matrix: m, tiles: [] };
}
function estimateCount(g, b, m) {
  const tw = m.res * m.tw, th = m.res * m.th;
  return (Math.floor((b[2] - g.origin[0]) / tw) - Math.floor((b[0] - g.origin[0]) / tw) + 1) * (Math.floor((g.origin[1] - b[1]) / th) - Math.floor((g.origin[1] - b[3]) / th) + 1);
}
/** A WMTS tile URL: the REST template ({TileMatrixSet} {TileMatrix} {TileRow} {TileCol} {Style}, case-insensitive) or KVP. */
export function wmtsTileUrl({ template = '', kvp = '', layer, style = 'default', format = 'image/png', set, matrix, row, col }) {
  if (template) {
    const map = { tilematrixset: set, tilematrix: matrix, tilerow: row, tilecol: col, style, layer };
    const t = template.replace(/\{(\w+)\}/g, (m, k) => (k.toLowerCase() in map ? encodeURIComponent(String(map[k.toLowerCase()])) : m));
    return checkUrl(t).href;
  }
  const u = checkUrl(kvp);
  const q = { SERVICE: 'WMTS', REQUEST: 'GetTile', VERSION: '1.0.0', LAYER: layer, STYLE: style, FORMAT: format, TILEMATRIXSET: set, TILEMATRIX: matrix, TILEROW: String(row), TILECOL: String(col) };
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
  return u.href;
}

// ------------------------------------------------------------------ ArcGIS REST (MapServer / ImageServer)
/** The service URL people paste (…/MapServer, …/MapServer/, …/MapServer?f=pjson, …/MapServer/3) → its base, or throws. */
export function arcgisBase(text) {
  const u = checkUrl(text);
  const m = u.pathname.match(/^(.*?\/(MapServer|ImageServer))(\/.*)?$/i);
  if (!m) throw new Error(t('basemap.arc.url'));
  u.pathname = m[1]; u.search = ''; u.hash = '';
  return { base: u.href.replace(/\/$/, ''), kind: /ImageServer/i.test(m[2]) ? 'ImageServer' : 'MapServer' };
}
/** The service's ?f=json answer (untrusted) → { kind, name, code, tiled, grid, extent, attribution, formats } */
export function parseArcgisService(json, url) {
  let j = json;
  if (typeof j === 'string') { if (j.length > MAX_TEXT) throw new Error(t('basemap.arc.big')); try { j = JSON.parse(j); } catch { throw new Error(t('basemap.arc.not_json')); } }
  if (!j || typeof j !== 'object' || Array.isArray(j)) throw new Error(t('basemap.arc.not_desc'));
  if (j.error) throw new Error(t(j.error.code === 499 || j.error.code === 498 ? 'basemap.arc.error_signin' : 'basemap.arc.error', { error: clean(j.error.message || j.error.code, 200) }));
  const { kind } = arcgisBase(url);
  const sr = j.spatialReference || j.extent?.spatialReference || j.fullExtent?.spatialReference || {};
  const codeOf = (s) => { const c = Number(s?.latestWkid || s?.wkid); return Number.isInteger(c) && c > 0 ? (MERC_CODES.has(c) ? 3857 : c) : null; };
  const code = codeOf(sr);
  let tiled = false, grid = null;
  const ti = j.tileInfo;
  if (ti && typeof ti === 'object' && (j.singleFusedMapCache === true || kind === 'ImageServer') && Array.isArray(ti.lods)) {
    const tc = codeOf(ti.spatialReference) ?? code;
    const rows = num(ti.rows), cols = num(ti.cols), ox = num(ti.origin?.x), oy = num(ti.origin?.y);
    const lods = ti.lods.slice(0, MAX_MATRICES).map((l) => ({ id: String(Math.trunc(num(l?.level))), res: num(l?.resolution) })).filter((l) => l.res > 0 && /^\d+$/.test(l.id));
    if (tc === 3857 && rows > 0 && rows <= 4096 && cols > 0 && cols <= 4096 && ox !== null && oy !== null && lods.length) {
      tiled = true;
      grid = { code: 3857, origin: [ox, oy], matrices: lods.map((l) => ({ id: l.id, res: l.res, tw: cols, th: rows, mw: Infinity, mh: Infinity })) };
    }
  }
  const e = j.fullExtent || j.extent || j.initialExtent;
  const extent = e && ['xmin', 'ymin', 'xmax', 'ymax'].every((k) => Number.isFinite(e[k])) ? { bbox: [e.xmin, e.ymin, e.xmax, e.ymax], code: codeOf(e.spatialReference) ?? code } : null;
  return {
    kind, name: clean(j.mapName || j.name || j.documentInfo?.Title || '', 200), code, tiled, grid, extent,
    attribution: clean(j.copyrightText || '', 300),
    formats: clean(j.supportedImageFormatTypes || '', 300),
  };
}
/** export (MapServer) / exportImage (ImageServer) for a picture of bbox in `code`. */
export function arcgisExportUrl({ base, kind = 'MapServer', bbox, code, width, height }) {
  const u = checkUrl(base.replace(/\/$/, '') + (kind === 'ImageServer' ? '/exportImage' : '/export'));
  const q = { bbox: bbox.map(fmtNum).join(','), bboxSR: String(code), imageSR: String(code), size: Math.round(width) + ',' + Math.round(height), format: kind === 'ImageServer' ? 'png' : 'png32', transparent: 'true', f: 'image' };
  for (const [k, v] of Object.entries(q)) u.searchParams.set(k, v);
  return u.href;
}
export const arcgisTileUrl = (base, level, row, col) => checkUrl(base.replace(/\/$/, '') + '/tile/' + level + '/' + row + '/' + col).href;

// ------------------------------------------------------------------ XYZ templates
/** Checks a tile URL template: http(s), {z}, {x} and {y} or {-y}; {s} needs subdomain letters. */
export function checkTemplate(text) {
  const s = String(text || '').trim();
  if (!/^https?:\/\//i.test(s)) throw new Error(t('basemap.tile.https'));
  if (s.length > 2000) throw new Error(t('basemap.url.long'));
  if (!/\{z\}/.test(s) || !/\{x\}/.test(s) || !/\{-?y\}/.test(s)) throw new Error(t('basemap.tile.xyz'));
  const bad = s.match(/\{(?!z\}|x\}|y\}|-y\}|s\})[^}]*\}/);
  if (bad) throw new Error(t('basemap.tile.placeholder', { name: bad[0] }));
  checkUrl(s.replace(/\{-?\w+\}/g, '0'));
  return s;
}
export function xyzUrl(template, z, x, y, subdomains = 'abc') {
  const subs = String(subdomains || 'abc').replace(/[^a-z0-9]/gi, '') || 'abc';
  return template.replace('{z}', z).replace('{x}', x).replace('{-y}', 2 ** z - 1 - y).replace('{y}', y).replace('{s}', subs[(x + y) % subs.length]);
}

// ------------------------------------------------------------------ URLs
/** http(s) URLs only, ≤ 2000 characters, no credentials in them. → URL */
export function checkUrl(text) {
  const s = String(text || '').trim();
  if (s.length > 2000) throw new Error(t('basemap.url.long'));
  let u;
  try { u = new URL(s); } catch { throw new Error(t('basemap.url.not')); }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error(t('basemap.url.scheme'));
  if (u.username || u.password) throw new Error(t('basemap.url.creds'));
  return u;
}
/** A WMS / WMTS capabilities URL from what was pasted (the service's base URL or a full GetCapabilities link). */
export function capabilitiesUrl(text, service) {
  const u = checkUrl(text);
  if (service === 'WMTS' && /\/1\.0\.0\/WMTSCapabilities\.xml$/i.test(u.pathname)) return u.href;
  const has = (k) => [...u.searchParams.keys()].find((x) => x.toUpperCase() === k);
  for (const k of ['SERVICE', 'REQUEST', 'VERSION']) { const h = has(k); if (h) u.searchParams.delete(h); }
  u.searchParams.set('SERVICE', service); u.searchParams.set('REQUEST', 'GetCapabilities');
  if (service === 'WMS') u.searchParams.set('VERSION', '1.3.0');
  return u.href;
}

// ------------------------------------------------------------------ world files
/** A world file (.pgw .jgw .tfw .wld …): six numbers A D B E C F — x = A·col + B·row + C, y = D·col + E·row + F, for the
 *  CENTRE of pixel (col, row). → GDAL geotransform [x0, dxCol, dxRow, y0, dyCol, dyRow] for pixel CORNERS. */
export function parseWorldFile(text) {
  const s = String(text || '');
  if (s.length > 10000) throw new Error(t('basemap.world.long'));
  const v = s.trim().split(/\s+/).map(Number);
  if (v.length !== 6 || !v.every(Number.isFinite)) throw new Error(t('basemap.world.six'));
  const [A, D, B, E, C, F] = v;
  if (Math.abs(A * E - B * D) < 1e-30) throw new Error(t('basemap.world.zero'));
  return [C - A / 2 - B / 2, A, B, F - D / 2 - E / 2, D, E];
}
/** World file names that go with an image: x.png → x.pgw, x.pngw, x.png.wld… */
export function worldFileFor(name) {
  const m = String(name).match(/^(.*)\.([^.]+)$/);
  if (!m) return [];
  const [, stem, ext] = m, e = ext.toLowerCase();
  const short = e.length >= 3 ? e[0] + e[e.length - 1] + 'w' : e + 'w';
  return [stem + '.' + short, stem + '.' + e + 'w', stem + '.wld', name + '.wld', name + '.aux.wld'].map((s) => s.toLowerCase());
}
export const pixelToSystem = (gt, u, v) => [gt[0] + u * gt[1] + v * gt[2], gt[3] + u * gt[4] + v * gt[5]];

// ------------------------------------------------------------------ warping
/** The affine (canvas order a b c d e f: x' = a·u + c·v + e, y' = b·u + d·v + f) mapping three source points onto three
 *  destination points. */
export function affineFrom3(s, d) {
  const [[u0, v0], [u1, v1], [u2, v2]] = s, [[x0, y0], [x1, y1], [x2, y2]] = d;
  const det = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0);
  if (Math.abs(det) < 1e-18) return null;
  const a = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / det, c = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / det;
  const b = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / det, dd = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / det;
  return [a, b, c, dd, x0 - a * u0 - c * v0, y0 - b * u0 - dd * v0];
}
export const applyAffine = (m, u, v) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
/** Splits a picture (w × h px; pixToScreen(u, v) → [x, y] or null exact) into cells, each drawn by one affine, until each
 *  affine is within `tol` screen px of the exact mapping at the cell's middle and edge midpoints. A cell whose corners
 *  cannot be mapped is left out. → [{ src: 4 corners [u, v], dst: 4 corners [x, y], m: affine }] */
export function planWarp(pixToScreen, w, h, { tol = 0.25, maxDepth = 6, minCells = 0 } = {}) {
  const out = [];
  const cache = new Map();
  const P = (u, v) => { const k = u + ',' + v; let r = cache.get(k); if (r === undefined) { r = pixToScreen(u, v); r = r && Number.isFinite(r[0]) && Number.isFinite(r[1]) ? r : null; cache.set(k, r); } return r; };
  const cell = (u0, v0, u1, v1, depth) => {
    const c = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
    if (c.some((p) => !p)) { if (depth < maxDepth) split(u0, v0, u1, v1, depth); return; }
    // the affine through three corners; its error at the fourth corner, the middle and the edge midpoints
    const m = affineFrom3([[u0, v0], [u1, v0], [u0, v1]], [c[0], c[1], c[3]]);
    let err = Infinity;
    if (m) {
      const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
      err = 0;
      for (const [u, v] of [[u1, v1], [um, vm], [um, v0], [u1, vm], [um, v1], [u0, vm]]) {
        const e = P(u, v); if (!e) { err = Infinity; break; }
        const a = applyAffine(m, u, v); err = Math.max(err, Math.hypot(a[0] - e[0], a[1] - e[1]));
      }
    }
    if ((err > tol || depth < minCells) && depth < maxDepth && u1 - u0 > 1 && v1 - v0 > 1) { split(u0, v0, u1, v1, depth); return; }
    if (!m) return;
    // the fourth corner exact; the affine is the average of the two triangles' (the cell is drawn clipped to its quad)
    const m2 = affineFrom3([[u1, v1], [u0, v1], [u1, v0]], [c[2], c[3], c[1]]);
    const avg = m2 ? m.map((x, i) => (x + m2[i]) / 2) : m;
    out.push({ src: [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], dst: c, m: avg, err });
  };
  const split = (u0, v0, u1, v1, depth) => {
    const um = (u0 + u1) / 2, vm = (v0 + v1) / 2;
    cell(u0, v0, um, vm, depth + 1); cell(um, v0, u1, vm, depth + 1); cell(u0, vm, um, v1, depth + 1); cell(um, vm, u1, v1, depth + 1);
  };
  cell(0, 0, w, h, 0);
  return out;
}
/** The box in a source system that covers the view: the view's edges sampled n times each, mapped by toSource(x, y). */
export function viewSourceBox(vb, toSource, n = 8) {
  const xs = [], ys = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    for (const [x, y] of [[vb.minX + (vb.maxX - vb.minX) * t, vb.minY], [vb.minX + (vb.maxX - vb.minX) * t, vb.maxY], [vb.minX, vb.minY + (vb.maxY - vb.minY) * t], [vb.maxX, vb.minY + (vb.maxY - vb.minY) * t]]) {
      try { const p = toSource(x, y); if (p && Number.isFinite(p[0]) && Number.isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } } catch { /* off the system */ }
    }
  }
  if (!xs.length) return null;
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// ------------------------------------------------------------------ the project file's map layers (untrusted)
export const KINDS = ['image', 'xyz', 'wms', 'wmts', 'arcgis'];
const INTERNET = new Set(['xyz', 'wms', 'wmts', 'arcgis']);
export const isInternet = (m) => INTERNET.has(m?.kind);
/** state.gis.maps as read from a file (already flattened by gis-layers.js) → records safe to use. */
export function readMaps(list, notes = [], images = null) {
  const out = [], seen = new Set();
  let bad = 0;
  for (const m of Array.isArray(list) ? list.slice(0, 100) : []) {
    try { const r = readMap(m, images); if (seen.has(r.id)) r.id = 'm' + (out.length + 1000); seen.add(r.id); out.push(r); } catch { bad++; }
  }
  if (bad) notes.push(t('basemap.maps.bad', { n: bad }));
  return out;
}
function readMap(m, images) {
  if (!m || typeof m !== 'object' || !KINDS.includes(m.kind)) throw new Error('kind');
  const s = (v, n = 300) => (typeof v === 'string' ? clean(v, n) : '');
  const f = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const r = {
    id: /^m\d{1,9}$/.test(m.id) ? m.id : 'm' + Math.floor(Math.random() * 1e6),
    name: s(m.name, 120) || t('mapl.default_name'), kind: m.kind, url: '', layer: s(m.layer, 300), style: s(m.style, 200), format: s(m.format, 80) || 'image/png',
    version: m.version === '1.1.1' ? '1.1.1' : '1.3.0',
    crsCode: Number.isInteger(m.crsCode) && m.crsCode > 0 && m.crsCode < 1e6 ? m.crsCode : null, crsName: s(m.crsName, 200),
    crsProj4: typeof m.crsProj4 === 'string' && m.crsProj4.length <= 20000 ? m.crsProj4.replace(/[\u0000-\u001f\u007f]/g, ' ').trim() : '',
    crsUnit: ['m', 'ft', 'ftUS', 'deg'].includes(m.crsUnit) ? m.crsUnit : 'm',
    opacity: f(m.opacity) !== null ? Math.max(0, Math.min(1, m.opacity)) : 1, visible: m.visible !== false, attribution: s(m.attribution, 300),
    image: '', width: 0, height: 0, a0: 0, a1: 1, a2: 0, a3: 0, a4: 0, a5: -1, grid: '', set: s(m.set, 200), template: '', subdomains: s(m.subdomains, 20).replace(/[^a-z0-9]/gi, ''),
  };
  if (m.kind === 'image') {
    if (!/^img\d{1,9}$/.test(m.image) || (images && !images.has(m.image))) throw new Error('image');
    r.image = m.image;
    r.width = Number.isInteger(m.width) && m.width > 0 && m.width <= 65536 ? m.width : 0; r.height = Number.isInteger(m.height) && m.height > 0 && m.height <= 65536 ? m.height : 0;
    const a = [m.a0, m.a1, m.a2, m.a3, m.a4, m.a5].map(f);
    if (!r.width || !r.height || a.some((x) => x === null) || Math.abs(a[1] * a[5] - a[2] * a[4]) < 1e-30) throw new Error('affine');
    [r.a0, r.a1, r.a2, r.a3, r.a4, r.a5] = a;
  } else {
    r.url = checkUrl(m.url).href;
    if (m.kind === 'xyz') r.url = checkTemplate(m.url);
    if (m.kind === 'wmts' && m.template) r.template = checkTemplate2(m.template);
    if (m.kind === 'wmts' || m.kind === 'arcgis') r.grid = m.grid ? JSON.stringify(readGrid(m.grid)) : '';
    if (m.kind === 'wmts' && (!r.grid || !r.set)) throw new Error('grid');
    if (!r.crsProj4 && m.kind !== 'xyz') throw new Error('crs');
  }
  return r;
}
function checkTemplate2(t) { const s = String(t); checkUrl(s.replace(/\{\w+\}/g, '0')); if (s.length > 2000) throw new Error('long'); return s; }
/** A tile grid from its JSON text (untrusted). */
export function readGrid(text) {
  const g = typeof text === 'string' ? JSON.parse(text.length > 200000 ? 'null' : text) : text;
  if (!g || typeof g !== 'object' || !Array.isArray(g.matrices) || !Array.isArray(g.origin) || g.origin.length !== 2 || !g.origin.every(Number.isFinite)) throw new Error('grid');
  const mats = g.matrices.slice(0, MAX_MATRICES).map((m) => {
    const ok = m && typeof m.id === 'string' && m.id.length <= 100 && m.res > 0 && Number.isFinite(m.res) && m.tw > 0 && m.tw <= 4096 && m.th > 0 && m.th <= 4096;
    if (!ok) return null;
    const o = { id: clean(m.id, 100), res: m.res, tw: m.tw | 0, th: m.th | 0, mw: Number.isFinite(m.mw) && m.mw > 0 ? m.mw : Infinity, mh: Number.isFinite(m.mh) && m.mh > 0 ? m.mh : Infinity };
    if (Array.isArray(m.origin) && m.origin.length === 2 && m.origin.every(Number.isFinite)) o.origin = [m.origin[0], m.origin[1]];
    return o;
  }).filter(Boolean);
  if (!mats.length) throw new Error('grid');
  return { code: Number.isInteger(g.code) ? g.code : null, origin: [g.origin[0], g.origin[1]], matrices: mats };
}
/** JSON for a grid (Infinity → omitted). */
export const gridJson = (g) => JSON.stringify({ code: g.code, origin: g.origin, matrices: g.matrices.map((m) => ({ id: m.id, res: m.res, tw: m.tw, th: m.th, ...(Number.isFinite(m.mw) ? { mw: m.mw } : {}), ...(Number.isFinite(m.mh) ? { mh: m.mh } : {}), ...(m.origin ? { origin: m.origin } : {}) })) });
/** A picture kept in the project file: data:image/png|jpeg;base64,… up to 25 MB. */
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export function checkImageData(v) {
  return typeof v === 'string' && v.length <= Math.ceil(MAX_IMAGE_BYTES * 4 / 3) + 40 && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v);
}
