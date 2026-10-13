/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-read.js — GIS vector files to project layers: reading, the source coordinate system, and what an import will do
 * (docs/GIS-SPEC.md §2). No DOM: gis-vector-ui.js and the Node test both drive these functions.
 *
 *   await readGisFiles(files, { tick }) → { sources, notes }
 *     files [{ name, data: Uint8Array }] (a dropped set: .shp + .shx + .dbf + .prj + .cpg, .zip, .geojson/.json, .gpkg).
 *     source = { file, format: 'Shapefile'|'GeoJSON'|'GeoPackage', layers, src, notes }
 *       src = { kind: 'wgs84' } (GeoJSON, EPSG:4326) | { kind: 'crs', crs, name, matched, geographic } | { kind: 'none' }
 *       (no .prj / an undefined GeoPackage system) | { kind: 'bad', why } (a .prj that could not be read)
 *   isGisFile(name) · gisFileKind(name, head)
 *   resolveSrc({ prj | code | srs }) → src           .prj text (crsFromPrj), EPSG code (catalog), GeoPackage srs row
 *   planImport(projectState, sources) → plan
 *     plan = { case, project: state.crs|null, offer: crs|null, near: [lon, lat]|null, unknown: bool, needPick: bool, why }
 *       case 'project'    the project has a system; sources with one are reprojected into it (unknown ones: same as project
 *                         unless picked)
 *       'offer'           no project system; a projected source in the project's unit family → offer it as the project's
 *       'pick'            no project system; geographic source (GeoJSON) or another unit family → ask for the project's
 *                         system (reg.pickCrs, near = the data's middle in lat/long)
 *       'none'            no project system and no source system → numbers as they are (said)
 *   buildLayers(sources, { project: crs|null, units, overrides }) → { layers, notes }
 *     every vertex source → project through frame(project).from(source) (crs.js), z → project units (GeoJSON and
 *     geographic sources: metres; projected: the source's unit), checks lat/long ranges for geographic sources.
 *     overrides: Map(source index → src) for "same as the project" or a picked source system.
 */

import { readShapefile, shapefileSets } from './shapefile.js';
import { readGeoJSON } from './geojson.js';
import { readKml } from './kml.js';   // 0.4 V6: KML / KMZ
import { t } from './i18n.js';
import { listZip, unzipEntry } from './zipfile.js';
import { mapXY, mapZ, bounds } from './gis-geom.js';
import { addLayers } from './gis-layers.js';
import { byCode, crsFromPrj, crsFromEntry, frame, transformer, search, METRES_PER } from './crs.js';

export class GisReadError extends Error {}
const MAX_FILE = 200 * 1024 * 1024;

export const isGisFile = (name) => /\.(shp|shx|dbf|prj|cpg|zip|geojson|gpkg|kml|kmz)$/i.test(name);
export function gisFileKind(name, head = '') {
  if (/\.(shp|shx|dbf|cpg)$/i.test(name)) return 'shp';
  if (/\.prj$/i.test(name)) return 'prj';
  if (/\.zip$/i.test(name)) return 'zip';
  if (/\.gpkg$/i.test(name)) return 'gpkg';
  if (/\.kml$/i.test(name)) return 'kml';   // 0.4 V6 (a .kmz is unzipped like a .zip)
  if (/\.geojson$/i.test(name) || (/\.json$/i.test(name) && /"type"\s*:\s*"(FeatureCollection|Feature)"/.test(head))) return 'geojson';
  return null;
}

export function resolveSrc({ prj = null, code = null, srs = null } = {}) {
  try {
    if (srs) {
      if (srs.org.toUpperCase() === 'EPSG' && srs.code === 4326) return { kind: 'wgs84' };
      if (srs.org.toUpperCase() === 'EPSG' && byCode(srs.code)) return entrySrc(byCode(srs.code));
      if (srs.definition && srs.definition !== 'undefined') return resolveSrc({ prj: srs.definition });
      if (srs.org.toUpperCase() === 'EPSG') return { kind: 'bad', why: t('gread.epsg.unknown.grid', { code: srs.code }) };
      return { kind: 'none' };
    }
    if (code != null) { if (Number(code) === 4326) return { kind: 'wgs84' }; const e = byCode(code); return e ? entrySrc(e) : { kind: 'bad', why: t('gread.epsg.unknown', { code }) }; }
    if (prj) {
      const r = crsFromPrj(prj);
      if (r.matched?.code === 4326) return { kind: 'wgs84' };
      const geographic = r.crs.unit === 'deg';
      return { kind: 'crs', crs: r.crs, name: r.crs.name, matched: r.matched, geographic, notes: r.notes };
    }
  } catch (e) { return { kind: 'bad', why: e.message }; }
  return { kind: 'none' };
}
function entrySrc(e) { return { kind: 'crs', crs: crsFromEntry(e), name: e.name, matched: e, geographic: !!e.geographic }; }

const toBytes = async (d) => (d instanceof Uint8Array ? d : d?.arrayBuffer ? new Uint8Array(await d.arrayBuffer()) : new Uint8Array(d));

export async function readGisFiles(files, { tick = null, maxFeatures = 500000 } = {}) {
  const sources = [], notes = [];
  const flat = [];
  for (const f of files) {
    const size = f.data?.byteLength ?? f.data?.size ?? f.size ?? 0;
    if (size > MAX_FILE) { notes.push(t('gread.big', { file: f.name })); continue; }
    if (/\.(zip|kmz)$/i.test(f.name)) {
      let entries;
      const bytes = await toBytes(f.data);
      try { entries = listZip(bytes); } catch (e) { notes.push(t('gread.file.note', { file: f.name, note: e.message })); continue; }
      const want = entries.filter((e) => !e.dir && !/(^|\/)(__MACOSX|\.)/.test(e.name) && /\.(shp|shx|dbf|prj|cpg|geojson|json|gpkg|kml)$/i.test(e.name));
      if (!want.length) { notes.push(t('kml.zip.empty', { file: f.name })); continue; }
      let total = 0;
      for (const e of want) {
        total += e.size;
        if (total > MAX_FILE * 2) { notes.push(t('gread.zip.big', { file: f.name })); break; }
        try { flat.push({ name: e.name, data: await unzipEntry(bytes, e), zip: f.name }); } catch (err) { notes.push(t('gread.file.note', { file: f.name, note: err.message })); }
      }
    } else flat.push({ name: f.name, data: await toBytes(f.data), zip: null });
  }
  // shapefile sets (by name, inside a zip or dropped together)
  const shpFiles = flat.filter((f) => /\.(shp|shx|dbf|prj|cpg)$/i.test(f.name));
  for (const set of shapefileSets(shpFiles.map((f) => ({ name: (f.zip ? f.zip + '/' : '') + f.name, data: f.data })))) {
    const file = set.name + '.shp';
    if (!set.shp) { if (set.dbf) notes.push(t('gread.dbf.alone', { name: set.name })); else if (set.prj && !shpFiles.some((f) => /\.shp$/i.test(f.name))) notes.push(t('gread.prj.alone', { name: set.name })); continue; }
    try {
      const layer = await readShapefile(set, { tick, maxFeatures });
      const prjText = layer.prj;
      const src = prjText ? resolveSrc({ prj: prjText }) : { kind: 'none' };
      sources.push({ file, format: 'Shapefile', layers: [{ ...layer, notes: [] }], src, notes: layer.notes, encoding: null });
    } catch (e) { notes.push(e.message); }
  }
  for (const f of flat) {
    const kind = gisFileKind(f.name, f.name.match(/\.json$/i) ? new TextDecoder().decode(f.data.subarray(0, 4096)) : '');
    if (kind === 'geojson') {
      try {
        const text = new TextDecoder('utf-8').decode(f.data);
        const r = readGeoJSON(text, f.name.replace(/^.*\//, '').replace(/\.(geo)?json$/i, ''), { maxFeatures });
        if (!r.layers.length) { notes.push(t('gread.geojson.empty', { file: f.name })); continue; }
        sources.push({ file: f.name, format: 'GeoJSON', layers: r.layers, src: r.crsCode ? resolveSrc({ code: r.crsCode }) : { kind: 'wgs84' }, notes: r.notes, legacyCrs: !!r.crsCode });
      } catch (e) { notes.push(e.message); }
    } else if (kind === 'kml') {   // 0.4 V6: WGS 84 longitude/latitude, heights in metres (as GeoJSON)
      try {
        const r = readKml(new TextDecoder('utf-8').decode(f.data), (f.zip ? f.zip : f.name).replace(/^.*\//, '').replace(/\.km[lz]$/i, ''), { maxFeatures });
        if (!r.layers.length) { notes.push(t('kml.empty', { file: f.name })); continue; }
        sources.push({ file: f.zip ? f.zip + ' › ' + f.name : f.name, format: 'KML', layers: r.layers, src: { kind: 'wgs84' }, notes: r.notes });
      } catch (e) { notes.push(e.message); }
    } else if (kind === 'gpkg') {
      let gp;
      try {
        const { openGpkg } = await import('./gpkg.js');
        gp = await openGpkg(f.data);
        if (!gp.tables.length) { notes.push(t('gread.gpkg.notables', { file: f.name })); continue; }
        for (const tb of gp.tables) {
          const ls = await gp.read(tb.name, { maxFeatures, tick });
          if (!ls.length) { notes.push(t('gread.gpkg.empty', { file: f.name, table: tb.identifier })); continue; }
          const src = tb.srsId === -1 || tb.srsId === 0 || !tb.srs ? (tb.srsId === 0 ? { kind: 'bad', why: t('gread.gpkg.undefgeo') } : { kind: 'none' }) : resolveSrc({ srs: tb.srs });
          sources.push({ file: f.name + ' › ' + tb.identifier, format: 'GeoPackage', layers: ls, src, notes: ls[0].notes, table: tb.name });
        }
      } catch (e) { notes.push(t('gread.file.note', { file: f.name, note: e.message })); } finally { gp?.close(); }
    }
  }
  return { sources, notes };
}

const srcDef = (src) => (src.kind === 'wgs84' ? null : src.crs);
const srcName = (src) => (src.kind === 'wgs84' ? t('gread.src.wgs84') : src.kind === 'crs' ? src.name : src.kind === 'bad' ? t('gread.src.bad') : t('gread.src.none'));
const unitWord = (u) => ({ m: t('gread.unit.m'), ft: t('gread.unit.ft'), ftUS: t('gread.unit.ftus') })[u];
export { srcName };

/** The middle of every source's data in longitude/latitude (null when no source has a known system). */
export function middleLonLat(sources) {
  for (const s of sources) {
    if (s.src.kind !== 'wgs84' && s.src.kind !== 'crs') continue;
    const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const l of s.layers) for (const f of l.features) bounds(f.g, b);
    if (!Number.isFinite(b.minX)) continue;
    const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
    try { const ll = s.src.kind === 'wgs84' ? [cx, cy] : transformer(s.src.crs, null)(cx, cy); if (ll.every(Number.isFinite)) return ll; } catch { /* next */ }
  }
  return null;
}

export function planImport(state, sources) {
  const unknown = sources.some((s) => s.src.kind === 'none');
  const near = middleLonLat(sources);
  if (state.crs) return { case: 'project', project: state.crs, offer: null, near, unknown, needPick: false };
  const fam = state.units === 'm' ? ['m'] : ['ft', 'ftUS'];
  const known = sources.filter((s) => s.src.kind === 'crs' || s.src.kind === 'wgs84');
  if (!known.length) return { case: 'none', project: null, offer: null, near: null, unknown, needPick: false };
  const proj = known.find((s) => s.src.kind === 'crs' && !s.src.geographic && fam.includes(s.src.crs.unit));
  if (proj) return { case: 'offer', project: null, offer: proj.src.crs, near, unknown, needPick: false };
  const k = known[0].src;
  const why = k.kind === 'wgs84' || k.geographic
    ? t('gread.why.latlon')
    : t('gread.why.units', { name: k.name, unit: unitWord(k.crs.unit) || k.crs.unit, project: unitWord(state.units === 'm' ? 'm' : 'ft') });
  return { case: 'pick', project: null, offer: null, near, unknown, needPick: true, why };
}

const UNIT_M = { m: 1, ft: 0.3048, ftUS: 1200 / 3937 };
export function buildLayers(sources, { project = null, units = 'ft', overrides = new Map() } = {}) {
  const notes = [], layers = [];
  const projM = project ? UNIT_M[project.unit] : units === 'm' ? 1 : 1200 / 3937;
  sources.forEach((s, si) => {
    const src = overrides.get(si) || s.src;
    let fwd = null, zk = 1, geo = false;
    if (src.kind === 'same' || src.kind === 'none') { fwd = null; if (src.kind === 'none' && project) notes.push(t('gread.nocrs.same', { file: s.file })); }
    else if (src.kind === 'bad') { notes.push(t('gread.bad.crs', { file: s.file, why: src.why })); return; }
    else {
      if (!project) { notes.push(t('gread.noproject', { file: s.file, crs: srcName(src) })); return; }
      geo = src.kind === 'wgs84' || src.geographic;
      try { const f = frame(project); fwd = f.from(srcDef(src)); } catch (e) { notes.push(t('gread.noconvert', { file: s.file, why: e.message })); return; }
      const srcM = geo ? 1 : UNIT_M[src.crs.unit] || METRES_PER[src.crs.unit] || 1;
      zk = srcM / projM;
    }
    if ((s.format === 'GeoJSON' && !s.legacyCrs || s.format === 'KML') && src.kind !== 'same' && src.kind !== 'none') zk = 1 / projM;   // RFC 7946 / KML: heights in metres
    for (const l of s.layers) {
      let bad = 0;
      const feats = l.features.map((f) => {
        if (!f.g) return f;
        if (geo) { const b = bounds(f.g); if (b.minX < -180.000001 || b.maxX > 180.000001 || b.minY < -90.000001 || b.maxY > 90.000001) { bad++; return null; } }
        let g = fwd ? mapXY(f.g, fwd) : f.g;
        if (zk !== 1) g = mapZ(g, (z) => z * zk);
        return { g, p: f.p };
      });
      if (bad) notes.push(t('gread.outside', { layer: l.name, n: bad }));
      if (fwd && feats.some((f) => f?.g && !Number.isFinite(bounds(f.g).minX))) notes.push(t('gread.someconvert', { layer: l.name }));
      layers.push({ name: l.name, geom: l.geom, hasZ: l.hasZ, fields: l.fields, features: feats.filter((f) => f && (!f.g || Number.isFinite(bounds(f.g).minX))), source: { file: s.file, format: s.format, crs: src.kind === 'same' ? (project ? t('gread.src.asproject', { name: project.name }) : null) : src.kind === 'none' ? null : srcName(src) } });
    }
    if (zk !== 1 && s.layers.some((l) => l.hasZ)) notes.push(t('gread.z', { file: s.file, from: s.format === 'GeoJSON' || s.format === 'KML' || geo ? unitWord('m') : unitWord(src.crs.unit), to: unitWord(projM === 1 ? 'm' : 'ft') }));
    if (fwd && (src.kind === 'wgs84' || src.crs.proj4 !== project.proj4 || project.local)) notes.push(t(project.local ? 'gread.converted.local' : 'gread.converted', { file: s.file, from: srcName(src), to: project.name }));
  });
  return { layers, notes };
}

/** Point-file rows with latitude/longitude columns (points.js `latlon`) → project coordinates through `crs` (state.crs);
 *  z stays as it is (the elevation column is taken in project units). */
export function latLonPoints(points, crs) {
  const f = frame(crs), out = [];
  let bad = 0;
  for (const p of points) {
    const [x, y] = f.fromLonLat(p.x, p.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) { bad++; continue; }
    out.push({ ...p, x, y });
  }
  return { points: out, bad };
}

/** LandXML <CoordinateSystem> (landxml.js coordinateSystem) → { crs, why }: the EPSG code from the catalog, else the WKT
 *  through crsFromPrj, else a catalog system of exactly that name; crs null with the reason when none fits. */
export function crsFromLandXml(cs) {
  if (!cs) return { crs: null, why: t('gread.lx.none') };
  if (cs.epsgCode) { const e = byCode(cs.epsgCode); if (e) return { crs: crsFromEntry(e), why: '' }; }
  if (cs.ogcWktCode) { try { return { crs: crsFromPrj(cs.ogcWktCode).crs, why: '' }; } catch { /* next */ } }
  if (cs.name) { const e = search(cs.name, { limit: 5 }).find((x) => x.name.toLowerCase() === cs.name.toLowerCase()); if (e) return { crs: crsFromEntry(e), why: '' }; }
  return { crs: null, why: cs.epsgCode ? t('gread.lx.epsg', { code: cs.epsgCode }) : t('gread.lx.name', { name: cs.name || t('gread.lx.noname') }) };
}

/** Import what readGisFiles found into the project as one undo step (the page's Import button and the test).
 *  crs: the project's system to place them with (state.crs, an offered or a picked one); setCrs: make it the project's
 *  system in the same step; overrides: Map(source index → src) ({ kind: 'same' } = "same as the project", or a picked
 *  system); pick: Set of "source:layer" indexes to import (default all). → { ids, notes, count } */
export function importInto(project, sources, { crs = project.state.crs, setCrs = false, overrides = new Map(), pick = null } = {}) {
  const chosen = sources.map((s, si) => ({ ...s, layers: s.layers.filter((l, li) => !pick || pick.has(si + ':' + li)) }));
  const { layers, notes } = buildLayers(chosen, { project: crs, units: project.state.units, overrides });
  const keep = layers.filter((l) => l.features.some((f) => f.g));
  const files = [...new Set(keep.map((l) => l.source.file))];
  const ids = keep.length ? addLayers(project, keep, { label: files.length === 1 ? t('gread.undo', { file: files[0] }) : t('gread.undo.many', { n: files.length }), crs: setCrs ? crs : undefined }) : [];
  return { ids, notes, count: keep.reduce((s, l) => s + l.features.length, 0) };
}
