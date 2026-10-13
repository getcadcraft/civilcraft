/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crs.js — coordinate reference systems for CivilCraft (lead-written; spec docs/GIS-SPEC.md §1). No DOM.
 *
 * The project's coordinates stay plain numbers (x = easting, y = northing, z = elevation, in project units). A project
 * MAY say which system they are in — `state.crs` — and then every GIS file, map layer and lat/long readout goes through
 * one `Frame` built from it. Nothing here changes a project coordinate by itself.
 *
 *   state.crs = null | {
 *     code: 2277 | null,              EPSG code when the system is in the catalog
 *     name: 'NAD83 / Texas Central (ftUS)',
 *     proj4: '+proj=lcc …',           the definition actually used (from the catalog, a .prj, or typed)
 *     unit: 'm' | 'ft' | 'ftUS',      the system's linear unit (geographic systems are refused for a project)
 *     local: null | { scale, rotation, from: [x, y], to: [x, y] }
 *   }
 *   local = project ("ground" or assumed) coordinates → grid:  grid = to + scale · R(rotation°, CCW) · (p − from).
 *     Ground coordinates: scale = combined scale factor, rotation 0, from = to = the base point.
 *     An assumed system (5000,5000 site grid): from two control points (`localFromPairs`).
 *
 *   await loadCatalog()                       fetch ./crs-db.json once (Node tests: setCatalog(json))
 *   byCode(code) → entry | null               entry = { code, name, proj4, unit, area:[w,s,e,n], shiftAccuracy }
 *   search(text, { near:[lon,lat], limit })   by code or words in the name; systems whose area holds `near` first
 *   suggest([lon, lat], { unit, limit })      projected systems whose area holds the point (state plane / UTM first)
 *   crsFromEntry(entry) → state.crs           crsFromPrj(wktText) → { crs, matched: entry | null, notes[] }
 *   crsProblem(crs, projectUnits) → string | null   why it can't be the project's system (geographic, unit mismatch…)
 *   const f = frame(state.crs)                f.toLonLat(x, y) → [lon, lat] · f.fromLonLat(lon, lat) → [x, y]
 *                                             f.toGrid(x, y) / f.fromGrid(gx, gy)  (the `local` step only)
 *                                             f.to(otherCrs) → (x, y) => [x2, y2]  (project coords → another system)
 *                                             f.from(otherCrs) → (x2, y2) => [x, y]
 *                                             f.factors(x, y, z) → { k, convergence, elevation, combined }
 *   transformer(fromCrs, toCrs) → (x, y) => [x, y]   any two systems (state.crs shape or catalog entry; null = WGS 84)
 *   localFromPairs([[pLocal, pGrid], [pLocal, pGrid]]) → local       two control points → a similarity
 *   prjFor(crs) → Promise<string | null>      ESRI WKT for a shapefile .prj (./crs-wkt.json, loaded on first use)
 *   METRES_PER = { m: 1, ft: 0.3048, ftUS: 1200 / 3937 }
 *
 * Datum shifts: each catalog system carries the first grid-free shift to WGS 84 that PROJ offers (as +towgs84) and
 * EPSG's stated accuracy (`shiftAccuracy`, metres; null = unknown — say so). NAD83 is treated as WGS 84 (EPSG: about
 * 4 m). Grid files (NADCON, OSTN15, …) are not shipped: where PROJ's best shift needs one, the first grid-free one is used
 * instead and its accuracy says how rough it is (NAD27: a three-parameter shift, about 20 m; NAD27(CGQ77): unknown). The
 * projection maths is exact either way — only lat/long, GeoJSON and map layers feel the shift. The catalog is generated
 * by tools/civilcraft-test/make-crs-db.py and only keeps systems where proj4js and PROJ agree to 1 cm.
 *
 * Grid shift files (0.4 V11): a project may carry its own grid (NTv2 .gsb, or a PROJ GeoTIFF grid such as NADCON5
 * us_noaa_nadcon5_nad27_nad83_1986_conus.tif) and name it in `state.crs.grid`. Once loaded, the system's +towgs84 is
 * replaced by +nadgrids=@<grid> everywhere a definition is used, so NAD27 lands within the grid's accuracy (NADCON5 CONUS:
 * about 0.1 m) instead of about 20 m. Points outside the grid fall back to no shift (said by `gridStatus`).
 *   await loadGrid(name, bytes) → { name, kind: 'ntv2'|'geotiff', extent: [w, s, e, n] (degrees), subgrids }   registers
 *       it with proj4 (once per name; a different file under the same name replaces it)
 *   gridInfo(name) → that | null      gridsLoaded() → [names]
 *   defFor(crs) → the proj4 definition actually used (with the grid when it is loaded)
 *   gridStatus(crs, lon?, lat?) → null | { name, loaded, inside }    GRID_SUGGEST: grids PROJ's CDN serves, by area
 */

import proj4 from 'proj4';
import { t } from './i18n.js';   // 0.4 V11 strings

export const METRES_PER = { m: 1, ft: 0.3048, ftUS: 1200 / 3937 };
const WGS84 = '+proj=longlat +datum=WGS84 +no_defs';
const UNIT_OF_PROJ4 = { m: 'm', ft: 'ft', 'us-ft': 'ftUS' };

let CATALOG = null, BY_CODE = null, WKT = null;

/** Use an already-parsed crs-db.json (tests, or a page that fetched it itself). */
export function setCatalog(json) {
  const f = json.fields || ['code', 'name', 'proj4', 'unit', 'area', 'shiftAccuracy'];
  CATALOG = json.crs.map((r) => Object.fromEntries(f.map((k, i) => [k, r[i] ?? null])));
  for (const e of CATALOG) e.geographic = e.unit === 'deg';
  BY_CODE = new Map(CATALOG.map((e) => [e.code, e]));
  return CATALOG;
}
export async function loadCatalog() {
  if (CATALOG) return CATALOG;
  const r = await fetch(new URL('./crs-db.json', import.meta.url));
  if (!r.ok) throw new Error(t('crs.load', { status: r.status }));
  return setCatalog(await r.json());
}
export const catalogLoaded = () => !!CATALOG;
export function setWktCatalog(json) { WKT = json; }
export function byCode(code) {
  if (!BY_CODE) throw new Error(t('crs.notloaded'));
  return BY_CODE.get(Number(code)) || null;
}

const inArea = (a, lon, lat) => !!a && lat >= a[1] && lat <= a[3] && (a[0] <= a[2] ? lon >= a[0] && lon <= a[2] : lon >= a[0] || lon <= a[2]);
const areaSize = (a) => (a ? ((a[2] - a[0] + 360) % 360 || 360) * (a[3] - a[1]) : 1e9);

export function search(text, { near = null, limit = 50 } = {}) {
  if (!CATALOG) throw new Error(t('crs.notloaded'));
  const q = String(text || '').trim().toLowerCase().replace(/^epsg:\s*/, '');
  let hits;
  if (/^\d+$/.test(q)) hits = CATALOG.filter((e) => String(e.code).startsWith(q)).sort((a, b) => (a.code === +q ? -1 : b.code === +q ? 1 : a.code - b.code));
  else {
    const words = q.split(/[\s/,()]+/).filter(Boolean);
    hits = CATALOG.filter((e) => { const n = e.name.toLowerCase(); return words.every((w) => n.includes(w)); });
    hits.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  }
  if (near) hits.sort((a, b) => (inArea(b.area, near[0], near[1]) - inArea(a.area, near[0], near[1])));
  return hits.slice(0, limit);
}
// NAD83(2011) and plain NAD83 state plane / UTM, WGS 84 first; older realizations after
function rank(e) {
  const n = e.name;
  if (/^NAD83\(2011\)/.test(n)) return 0;
  if (/^NAD83 \//.test(n)) return 1;
  if (/^WGS 84/.test(n)) return 2;
  if (/^(ETRS89|GDA2020|NZGD2000|NAD83\(CSRS\)|RGF93|OSGB36)/.test(n)) return 3;
  return 5;
}

export function suggest([lon, lat], { unit = null, limit = 12 } = {}) {
  if (!CATALOG) throw new Error(t('crs.notloaded'));
  const fam = unit === 'm' ? ['m'] : unit === 'ft' ? ['ft', 'ftUS'] : null;
  // WGS 84 UTM keeps its place; other WGS 84 systems (continental and polar: GLANCE, Equi7, "North Pole LAEA Alaska" for
  // Paris) go after the national grids — builder C, crs tests: Lambert-93, BNG, NZTM and MGA fell out of the first 12
  const rs = (e) => (/^WGS 84 \/ UTM zone/.test(e.name) ? 2 : /^WGS 84\b/.test(e.name) ? 6 : rank(e));
  return CATALOG.filter((e) => !e.geographic && inArea(e.area, lon, lat) && (!fam || fam.includes(e.unit)))
    .sort((a, b) => rs(a) - rs(b) || areaSize(a.area) - areaSize(b.area))
    .slice(0, limit);
}

export function crsFromEntry(e) {
  return { code: e.code, name: e.name, proj4: e.proj4, unit: e.unit === 'deg' ? 'deg' : e.unit, local: null };
}

/** A .prj (ESRI or OGC WKT 1). Matches it to a catalog system when one gives the same coordinates (to 1 mm). */
export function crsFromPrj(wkt) {
  const notes = [];
  const text = String(wkt || '').trim();
  if (!text || text.length > 20000 || !/^(PROJCS|GEOGCS|PROJCRS|GEOGCRS|GEODCRS)\[/i.test(text)) throw new Error(t('crs.prj.not'));
  // an EPSG authority on the outermost object wins
  const auth = text.match(/AUTHORITY\["EPSG",\s*"?(\d+)"?\]\s*\]\s*$/i) || text.match(/ID\["EPSG",\s*(\d+)\]\s*\]\s*$/i);
  if (auth && CATALOG && byCode(+auth[1])) return { crs: crsFromEntry(byCode(+auth[1])), matched: byCode(+auth[1]), notes };
  // web Mercator: ESRI writes it as Mercator_Auxiliary_Sphere on the WGS 84 ellipsoid, which no maths test matches (builder C)
  if (CATALOG && byCode(3857) && /^PROJCS\[/i.test(text) && /Mercator_Auxiliary_Sphere|Pseudo[_ -]?Mercator|Popular[_ ]Visuali[sz]ation/i.test(text)) return { crs: crsFromEntry(byCode(3857)), matched: byCode(3857), notes };
  let def;
  try { def = proj4.Proj(text); } catch { throw new Error(t('crs.prj.bad')); }
  const name = (text.match(/^\w+\["([^"]{1,200})"/) || [])[1] || t('crs.prj.name');
  const geographic = /^GEOG/i.test(text);
  const unit = geographic ? 'deg' : unitFromDef(def, text);
  if (!unit) throw new Error(t('crs.prj.unit'));
  const crs = { code: null, name, proj4: text, unit, local: null };
  // match on the projection maths alone (each on its own ellipsoid): a .prj often leaves out the datum shift the
  // catalog system carries (British National Grid), and then the catalog's definition is the better one to use
  let matched = null;
  if (CATALOG) {
    const pts = probePoints(def, geographic);
    const sameEllipsoid = (P) => Math.abs(P.a - def.a) < 1e-3 && Math.abs((P.es || 0) - (def.es || 0)) < 1e-9; // a .prj rounds 1/f
    // geographic: radians either way (a WKT's degree UNIT sets to_meter ≈ 111 km — builder C: GEOGCS .prj files never matched)
    const fwd = (P, [lon, lat]) => { const r = P.forward({ x: lon * Math.PI / 180, y: lat * Math.PI / 180 }), k = geographic ? 1 : (P.to_meter || 1); return [r.x / k, r.y / k]; };
    let want = null;
    try { want = pts.map((p) => fwd(def, p)); } catch { want = null; }
    if (want && want.every((w) => w.every(Number.isFinite))) {
      const tol = geographic ? 1e-9 : 1e-3;
      for (const e of CATALOG) {
        if (e.unit !== unit || e.geographic !== geographic) continue;
        try {
          const P = proj4.Proj(e.proj4);
          if (!sameEllipsoid(P)) continue;
          if (pts.every((p, i) => { const g = fwd(P, p); return Math.hypot(g[0] - want[i][0], g[1] - want[i][1]) < tol; })) {
            if (!matched || prjRank(e, text) < prjRank(matched, text)) matched = e;
          }
        } catch { /* a definition proj4js can't build is just not a match */ }
      }
    }
  }
  if (matched) return { crs: crsFromEntry(matched), matched, notes };
  notes.push(t('crs.prj.nomatch'));
  return { crs, matched: null, notes };
}
// among systems giving the same numbers, the one whose datum realization the .prj names (NAD83 vs NAD83(2011), HARN…)
function prjRank(e, text) {
  const norm = (x) => x.toUpperCase().replace(/NORTH_?AMERICAN_?(DATUM_?)?19?83/g, 'NAD83').replace(/19(\d\d)/g, '$1').replace(/[^A-Z0-9]/g, '');
  const t = norm(text);
  const datum = norm(e.name.split(' / ')[0].replace(/\(.*$/, ''));
  const real = (e.name.match(/^[^/(]+\(([^)]+)\)/) || [])[1];
  const named = real ? t.includes(norm(real)) : !/2011|HARN|NSRS|CSRS|CORS|MA11|PA11/.test(t);
  // the datum by the WKT's DATUM name, not anywhere in the text: SPHEROID["WGS_1984"] made every WGS 84-ellipsoid datum
  // look like WGS 84, and ESRI's "D_Korean_Datum_1995" hid "Korean 1995" (builder C, crs tests)
  const dn = norm(((text.match(/DATUM\["([^"]{0,200})"/i) || [])[1] || '').replace(/^D_/i, '').replace(/_?DATUM_?/gi, ''));
  const datumHit = dn ? dn.includes(datum) || (dn.length >= 3 && datum.includes(dn)) : t.includes(datum);
  return (datumHit ? 0 : 20) + (named ? 0 : 10) + (1 - nameLikeness(e.name, text)) * 5 + rank(e) / 10;
}
// how alike the system's name and the .prj's own name are (shared words / all words): among systems with the same maths
// it picks "Xian 1980 / 3-degree Gauss-Kruger CM 129E" over "… / Gauss-Kruger CM 129E", and a plain "UTM zone 31N" over
// its "(N-E)" twin (builder C, crs tests)
function nameLikeness(name, text) {
  const words = (s) => new Set(String(s).toUpperCase().replace(/NORTH_?AMERICAN_?(DATUM_?)?19?83/g, 'NAD83').split(/[^A-Z0-9]+/).filter(Boolean));
  const a = words(name), b = words((text.match(/^\w+\["([^"]{1,200})"/) || [])[1] || '');
  let both = 0;
  for (const w of a) if (b.has(w)) both++;
  return both / ((a.size + b.size - both) || 1);
}
function unitFromDef(def, text) {
  const u = def.units && UNIT_OF_PROJ4[def.units];
  if (u) return u;
  const m = text.match(/UNIT\["([^"]+)",\s*([\d.eE+-]+)\]\s*(,\s*AXIS|,\s*AUTHORITY|\]\s*$)/i) || text.match(/UNIT\["([^"]+)",\s*([\d.eE+-]+)/gi)?.slice(-1)[0]?.match(/UNIT\["([^"]+)",\s*([\d.eE+-]+)/i);
  const k = m ? Number(m[2]) : (def.to_meter || 1);
  if (Math.abs(k - 1) < 1e-12) return 'm';
  if (Math.abs(k - 0.3048) < 1e-10) return 'ft';
  if (Math.abs(k - 1200 / 3937) < 1e-10) return 'ftUS';
  return null;
}
// three points inside the zone, as lon/lat (for matching a .prj to the catalog): on the central meridian, between the
// standard parallels when there are two, else at the latitude of origin (UTM: 45°, so the false northing is exercised)
function probePoints(def, geographic) {
  const deg = 180 / Math.PI;
  const lon0 = def.zone ? def.zone * 6 - 183 : (def.long0 || 0) * deg;
  let lat = def.lat1 != null && def.lat2 != null ? (def.lat1 + def.lat2) / 2 * deg : (def.lat0 || 0) * deg;
  if (def.zone) lat = def.utmSouth ? -45 : 45;
  if (geographic) lat = 0;
  lat = Math.max(-80, Math.min(80, lat));
  return [[lon0, lat], [lon0 + 0.5, lat + 0.5], [lon0 - 0.5, lat + 0.25]];
}

export function crsProblem(crs, projectUnits = 'ft') {
  if (!crs) return null;
  if (!crs.proj4) return t('crs.p.nodef');
  if (crs.unit === 'deg') return t('crs.p.deg');
  if (!METRES_PER[crs.unit]) return t('crs.p.unit');
  const fam = crs.unit === 'm' ? 'm' : 'ft';
  if (fam !== projectUnits) return projectUnits === 'm' ? t('crs.p.units.m') : t('crs.p.units.ft');
  const l = crs.local;
  if (l && !(l.scale > 0 && Number.isFinite(l.scale) && Number.isFinite(l.rotation) && [...l.from, ...l.to].every(Number.isFinite))) return t('crs.p.local');
  try { proj4(WGS84, crs.proj4); } catch { return t('crs.p.use'); }
  return null;
}

const defOf = (c) => (!c ? WGS84 : typeof c === 'string' ? c : defFor(c));

// ------------------------------------------------------------------ grid shift files (0.4 V11)
const GRIDS = new Map();   // name → { name, kind, extent, subgrids, size }
export const GRID_SUGGEST = [
  { name: 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif', datum: 'NAD27', area: [-125, 24, -66, 50], accuracy: 0.1, size: 139914, get label() { return t('grid.s.conus'); } },
  { name: 'us_noaa_alaska.tif', datum: 'NAD27', area: [-194, 46, -128, 77], accuracy: 0.5, size: 524798, get label() { return t('grid.s.alaska'); } },
  { name: 'ca_nrc_ntv2_0.tif', datum: 'NAD27', area: [-142, 40, -47, 84], accuracy: 0.1, size: 7784410, get label() { return t('grid.s.canada'); } },
];
export const GRID_CDN = 'https://cdn.proj.org/';
export function suggestGrids(crs) {
  if (!crs || !/NAD27/i.test(crs.name || '')) return [];
  const e = byCode(crs.code)?.area;
  if (!e) return GRID_SUGGEST;
  const cx = (e[0] + e[2]) / 2, cy = (e[1] + e[3]) / 2;
  return GRID_SUGGEST.filter((g) => cx >= g.area[0] && cx <= g.area[2] && cy >= g.area[1] && cy <= g.area[3]);
}
const safeName = (n) => String(n || '').replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 80);
/** Register a grid with proj4. bytes: Uint8Array | ArrayBuffer. NTv2 starts with NUM_OREC; GeoTIFF with II*\0 or MM\0*. */
export async function loadGrid(name, bytes) {
  const nm = safeName(name);
  if (!nm) throw new Error(t('grid.err.name'));
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  const head = String.fromCharCode(...u8.subarray(0, 8));
  let g, kind;
  if (head === 'NUM_OREC') { kind = 'ntv2'; g = proj4.nadgrid(nm, ab); }
  else if (head.startsWith('II*\u0000') || head.startsWith('MM\u0000*')) {
    kind = 'geotiff';
    const { fromArrayBuffer } = await import('geotiff');
    const tiff = await fromArrayBuffer(ab);
    g = await proj4.nadgrid(nm, tiff).ready;
  } else throw new Error(t('grid.err.kind'));
  if (!g?.subgrids?.length) throw new Error(t('grid.err.empty'));
  // extent of every subgrid (proj4 keeps longitudes positive west, radians, ll = the south-east corner)
  const D = 180 / Math.PI;
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const sg of g.subgrids) {
    const east = -sg.ll[0] * D, west = -(sg.ll[0] + (sg.lim[0] - 1) * sg.del[0]) * D, south = sg.ll[1] * D, north = (sg.ll[1] + (sg.lim[1] - 1) * sg.del[1]) * D;
    w = Math.min(w, west); e = Math.max(e, east); s = Math.min(s, south); n = Math.max(n, north);
  }
  const info = { name: nm, kind, extent: [w, s, e, n], subgrids: g.subgrids.length, size: u8.byteLength };
  GRIDS.set(nm, info);
  cache.clear();   // definitions bind their grids when proj4 parses them
  return info;
}
export const gridInfo = (name) => GRIDS.get(name) || null;
export const gridsLoaded = () => [...GRIDS.keys()];
export function defFor(c) {
  if (!c?.grid || !GRIDS.has(c.grid) || typeof c.proj4 !== 'string' || !c.proj4.startsWith('+')) return c?.proj4;
  return c.proj4.replace(/\+datum=NAD27\b/i, '+ellps=clrk66').replace(/\s*\+(?:towgs84|nadgrids)=\S+/g, '') + ' +nadgrids=@' + c.grid;
}
export function gridStatus(c, lon = null, lat = null) {
  if (!c?.grid) return null;
  const g = GRIDS.get(c.grid);
  if (!g) return { name: c.grid, loaded: false, inside: null };
  const inside = lon === null || lat === null ? null : lon >= g.extent[0] && lon <= g.extent[2] && lat >= g.extent[1] && lat <= g.extent[3];
  return { name: c.grid, loaded: true, inside, info: g };
}
const cache = new Map();
function converter(a, b) {
  const k = a + '\u0000' + b;
  let t = cache.get(k);
  if (!t) { t = proj4(a, b); if (cache.size > 64) cache.clear(); cache.set(k, t); }
  return t;
}

/** Any two systems (state.crs shapes, catalog entries, proj4/WKT strings; null = WGS 84 lon/lat). Ignores `local`. */
export function transformer(from, to) {
  const t = converter(defOf(from), defOf(to));
  return (x, y) => t.forward([x, y]);
}

export function frame(crs) {
  if (!crs) return null;
  const l = crs.local;
  let toGrid = (x, y) => [x, y], fromGrid = (x, y) => [x, y];
  if (l) {
    const c = Math.cos(l.rotation * Math.PI / 180), s = Math.sin(l.rotation * Math.PI / 180), k = l.scale;
    toGrid = (x, y) => { const dx = x - l.from[0], dy = y - l.from[1]; return [l.to[0] + k * (c * dx - s * dy), l.to[1] + k * (s * dx + c * dy)]; };
    fromGrid = (gx, gy) => { const dx = (gx - l.to[0]) / k, dy = (gy - l.to[1]) / k; return [l.from[0] + c * dx + s * dy, l.from[1] - s * dx + c * dy]; };
  }
  const geo = converter(defFor(crs), WGS84);   // 0.4 V11: with its grid shift when one is loaded
  let P = null;
  const own = () => (P ||= proj4.Proj(crs.proj4)); // the projection on its own ellipsoid, metres, radians
  const f = {
    crs,
    toGrid, fromGrid,
    toLonLat(x, y) { const g = toGrid(x, y); return geo.forward(g); },
    fromLonLat(lon, lat) { const g = geo.inverse([lon, lat]); return fromGrid(g[0], g[1]); },
    to(other) {
      if (!other) return (x, y) => f.toLonLat(x, y);
      const t = converter(defFor(crs), defOf(other));
      return (x, y) => t.forward(toGrid(x, y));
    },
    from(other) {
      if (!other) return (lon, lat) => f.fromLonLat(lon, lat);
      const t = converter(defOf(other), defFor(crs));
      return (x, y) => { const g = t.forward([x, y]); return fromGrid(g[0], g[1]); };
    },
    /** At a project point: grid scale factor k (along the meridian and the parallel, averaged — conformal systems make
     *  them equal), convergence γ (degrees, the surveying sign: geodetic azimuth = grid azimuth + γ; + east of the
     *  central meridian in the northern hemisphere; PROJ's meridian_convergence),
     *  elevation factor R / (R + h) with h = z taken as ellipsoid height (no geoid model: off by ~5 ppm per 30 m of
     *  geoid separation — say so where it is shown), combined = k × elevation. All on the system's own ellipsoid. */
    factors(x, y, z = 0) {
      const P = own(), toM = P.to_meter || 1;
      const g = toGrid(x, y);
      const ll = P.inverse({ x: g[0] * toM, y: g[1] * toM });
      const lam = ll.x, phi = ll.y, d = 1e-5; // radians (~60 m; central differences: the error is ~d², rounding ~1e-10)
      // central differences (builder C, crs tests: one-sided ones were off by up to 2e-7 in k and 4e-6° in γ vs PROJ)
      const pN = P.forward({ x: lam, y: phi + d }), pS = P.forward({ x: lam, y: phi - d }), pE = P.forward({ x: lam + d, y: phi }), pW = P.forward({ x: lam - d, y: phi });
      const e2 = P.es || 0, w = Math.sqrt(1 - e2 * Math.sin(phi) ** 2);
      const N = P.a / w, M = P.a * (1 - e2) / w ** 3;
      const kN = Math.hypot(pN.x - pS.x, pN.y - pS.y) / (2 * M * d), kE = Math.hypot(pE.x - pW.x, pE.y - pW.y) / (2 * N * Math.cos(phi) * d);
      const k = (kN + kE) / 2;
      const convergence = -Math.atan2(pN.x - pS.x, pN.y - pS.y) * 180 / Math.PI;
      const R = Math.sqrt(M * N);
      const h = (Number(z) || 0) * (METRES_PER[crs.unit] || 1);
      const elevation = R / (R + h);
      const [lon, lat] = geo.forward(g);
      return { k, kMeridian: kN, kParallel: kE, convergence, elevation, combined: k * elevation, lon, lat };
    },
  };
  return f;
}

/** Two control points [[local, grid], [local, grid]] (each [x, y]) → `local` (scale, rotation about the first). */
export function localFromPairs(pairs) {
  if (!Array.isArray(pairs) || pairs.length !== 2) throw new Error(t('crs.pairs.two'));
  const [[a, A], [b, B]] = pairs;
  const dl = [b[0] - a[0], b[1] - a[1]], dg = [B[0] - A[0], B[1] - A[1]];
  const ll = Math.hypot(...dl), lg = Math.hypot(...dg);
  if (!(ll > 1e-6) || !(lg > 1e-6)) throw new Error(t('crs.pairs.same'));
  const rotation = (Math.atan2(dg[1], dg[0]) - Math.atan2(dl[1], dl[0])) * 180 / Math.PI;
  return { scale: lg / ll, rotation: ((rotation + 540) % 360) - 180, from: [a[0], a[1]], to: [A[0], A[1]] };
}

/** Ground coordinates: scale about a base point (the same point in both systems). */
export const groundLocal = (combined, base) => ({ scale: combined, rotation: 0, from: [base[0], base[1]], to: [base[0], base[1]] });

export async function prjFor(crs) {
  if (!crs) return null;
  if (crs.code == null) return /^(PROJCS|GEOGCS)\[/i.test(crs.proj4) ? crs.proj4 : null;
  if (!WKT) {
    const r = await fetch(new URL('./crs-wkt.json', import.meta.url));
    if (!r.ok) throw new Error(t('crs.wkt.load', { status: r.status }));
    WKT = await r.json();
  }
  return WKT[String(crs.code)] || null;
}
