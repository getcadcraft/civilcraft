#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-gisvec.mjs — CivilCraft's GIS vector files in and out (docs/GIS-SPEC.md §2), DOM-free, in Node, through
 * the same modules and the same import map the page uses.
 *
 *   node bin/test-civilcraft-gisvec.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * Second reader and fixture writer: GDAL 3.12 through pyogrio 0.13 in tools/civilcraft-test/venv (gisvec.py; its own
 * WKB code). PROJ (pyproj) for the reprojection checks. Fixtures are written fresh by GDAL every run: shapefiles of every
 * geometry type incl. Z, multi-part, holes, empty geometries, attributes of every type, UTF-8 and Windows-1252 text (with
 * and without a .cpg), a zip of several shapefiles, GeoJSON (RFC 7946, every geometry type incl. GeometryCollection), a
 * GeoPackage with four tables. Every reader is compared with GDAL's reading of the same file; every writer's output is
 * read back by GDAL (geometry, z, attributes, CRS = EPSG code, counts) and by our own readers. Also: GeoJSON RFC 7946
 * rules on what we write, project round trips with GIS layers (+ undo/redo of import, use-for-surface, remove), the
 * as-built export of a whole project (grid coordinates through a ground adjustment), LandXML <CoordinateSystem> in and
 * out (LandXML 1.2 XSD), latitude/longitude point files, and untrusted input (truncated and lying shapefiles, bad zips,
 * bad GeoPackages, "__proto__" field names, tampered project files).
 * --keep leaves the fixtures and the written files in tmp/civilcraft-gisvec/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-gisvec') : fs.mkdtempSync('/tmp/civilcraft-gisvec-');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const FX = path.join(OUT, 'fixtures');

const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const CRS = await mod('crs.js');
CRS.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
CRS.setWktCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-wkt.json'), 'utf8')));
const ZIP = await mod('zipfile.js');
const DBF = await mod('dbf.js');
const SHP = await mod('shapefile.js');
const GJ = await mod('geojson.js');
const GP = await mod('gpkg.js');
const GG = await mod('gis-geom.js');
const GL = await mod('gis-layers.js');
const GX = await mod('gis-export.js');
const GR = await mod('gis-read.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');
const LX = await mod('landxml.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const throwsWith = async (f, re, m) => { try { await f(); ok(false, m + ' (did not throw)'); } catch (e) { ok(re.test(e.message), m + ' — "' + e.message + '"'); } };

const python = path.join(TOOLS, 'venv/bin/python');
if (!fs.existsSync(python)) { console.log('tools/civilcraft-test/venv is missing (python3 -m venv … && pip install pyogrio pyproj); GDAL checks need it.'); process.exit(1); }
const py = (...a) => execFileSync(python, ['-I', path.join(TOOLS, 'gisvec.py'), ...a], { encoding: 'utf8', maxBuffer: 1 << 28 });
const gdal = (file, layer) => JSON.parse(py('read', file, ...(layer ? [layer] : [])));
const pyproj = (from, to, pts) => JSON.parse(execFileSync(python, ['-I', '-c', `import json,sys
from pyproj import Transformer
t = Transformer.from_crs(sys.argv[1], sys.argv[2], always_xy=True)
print(json.dumps([list(t.transform(x, y)) for x, y in json.loads(sys.argv[3])]))`, from, to, JSON.stringify(pts)], { encoding: 'utf8' }));
const read = (f) => new Uint8Array(fs.readFileSync(f));

/** GDAL's geometry (gisvec.py: [type, coords]) → our geometries (multipoints and collections → several). */
function fromGdal(g) {
  if (!g) return [null];
  const [t, c] = g;
  switch (t) {
    case 'Point': return [{ t: 'pt', c }];
    case 'MultiPoint': return c.map((p) => ({ t: 'pt', c: p }));
    case 'LineString': return [{ t: 'ln', c: [c] }];
    case 'MultiLineString': return [{ t: 'ln', c }];
    case 'Polygon': return [{ t: 'pg', c: [c] }];
    case 'MultiPolygon': return [{ t: 'pg', c }];
    case 'GeometryCollection': return c.flatMap(fromGdal);
    default: return [null];
  }
}
/** Same geometry: same kind, parts, and each ring/part the same vertices (polygon rings in either direction/start). */
function sameGeom(a, b, tol = 1e-9) {
  if (!a || !b) return !a && !b;
  if (a.t !== b.t) return false;
  const P = (p, q) => Math.abs(p[0] - q[0]) <= tol * Math.max(1, Math.abs(q[0])) && Math.abs(p[1] - q[1]) <= tol * Math.max(1, Math.abs(q[1])) && (p.length > 2) === (q.length > 2) && (p.length < 3 || Math.abs(p[2] - q[2]) <= 1e-9 * Math.max(1, Math.abs(q[2])));
  const seq = (x, y) => x.length === y.length && x.every((p, i) => P(p, y[i]));
  const ring = (x, y) => {
    if (x.length !== y.length) return false;
    const xs = x.slice(0, -1), ys = y.slice(0, -1);
    for (const r of [ys, ys.slice().reverse()]) for (let s = 0; s < r.length; s++) if (xs.every((p, i) => P(p, r[(i + s) % r.length]))) return true;
    return false;
  };
  if (a.t === 'pt') return P(a.c, b.c);
  if (a.t === 'ln') return a.c.length === b.c.length && a.c.every((p, i) => seq(p, b.c[i]));
  return a.c.length === b.c.length && a.c.every((poly, i) => poly.length === b.c[i].length && poly.every((r, k) => ring(r, b.c[i][k])));
}
const sameProps = (a, b, fields) => fields.every((f) => {
  const x = a[f], y = b[f];
  if ((x === null || x === undefined || x === '') && (y === null || y === undefined || y === '')) return true;
  if (typeof x === 'number' && typeof y === 'number') return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
  // GDAL hands booleans to Python as numpy bool (no null: a null comes back False) or, in a column with nulls, 1.0 / 0.0
  if (typeof x === 'boolean' || typeof y === 'boolean') { const b = (v) => (v === true || v === 1 ? 1 : v === false || v === 0 ? 0 : null); return b(x) === b(y) || (b(x) === 0 && y === null) || (b(y) === 0 && x === null); }
  return x === y;
});

fs.mkdirSync(FX, { recursive: true });
py('make', FX);

// ---------------------------------------------------------------------------
section('zip: read and write');
{
  const files = [{ name: 'a.txt', data: 'hello '.repeat(1000) }, { name: 'dir/b.bin', data: new Uint8Array([0, 1, 2, 3, 255]) }, { name: 'Ünïcode name.txt', data: 'x' }];
  const z = await ZIP.zip(files);
  const list = ZIP.listZip(z);
  ok(list.length === 3 && list[0].method === 8 && list[1].method === 0, 'our zip: 3 entries, deflated text, stored small binary');
  ok(new TextDecoder().decode(await ZIP.unzipEntry(z, list[0])) === files[0].data, 'deflated entry reads back');
  ok((await ZIP.unzipEntry(z, list[1])).join() === '0,1,2,3,255', 'stored entry reads back');
  ok(list[2].name === 'Ünïcode name.txt', 'UTF-8 file name (flag 11)');
  fs.writeFileSync(path.join(OUT, 'ours.zip'), z);
  const t = execFileSync('unzip', ['-t', path.join(OUT, 'ours.zip')], { encoding: 'utf8' });
  ok(/No errors detected/.test(t), 'unzip -t: no errors in our zip');
  const pyz = JSON.parse(execFileSync(python, ['-I', '-c', 'import zipfile,json,sys; z=zipfile.ZipFile(sys.argv[1]); print(json.dumps([z.testzip(), z.namelist()]))', path.join(OUT, 'ours.zip')], { encoding: 'utf8' }));
  ok(pyz[0] === null && pyz[1].includes('Ünïcode name.txt'), "Python's zipfile: CRCs good, UTF-8 name");
  const several = read(path.join(FX, 'several.zip'));
  const sl = ZIP.listZip(several);
  ok(sl.some((e) => e.name === 'data/linez.shp') && sl.length >= 14, 'a zip written by Python lists its entries (' + sl.length + ')');
}

section('dbf');
{
  const d = DBF.readDbf(read(path.join(FX, 'pointz.dbf')), { cpg: fs.readFileSync(path.join(FX, 'pointz.cpg'), 'utf8') });
  ok(d.encoding === 'utf-8' && d.records.length === 5, 'UTF-8 .dbf: 5 records');
  ok(d.fields.map((f) => f.type).join() === 'text,number,number,date,bool', 'field types text, number, number, date, bool (' + d.fields.map((f) => f.dbfType + ':' + f.type).join() + ')');
  ok(d.records[0].NAME === 'Héllo wörld' && d.records[1].NAME === 'Straße — 中文', 'UTF-8 text');
  ok(d.records[0].COUNT === -3 && d.records[0].BUILT === '2026-10-01' && d.records[0].OK === true && d.records[1].OK === false, 'number, date and bool values');
  const c1 = DBF.readDbf(read(path.join(FX, 'cp1252.dbf')), { cpg: fs.readFileSync(path.join(FX, 'cp1252.cpg'), 'utf8') });
  ok(c1.encoding === 'windows-1252' && c1.records[0].NAME === 'Café crème' && c1.records[0].NOTE === 'naïve — “quoted”', 'Windows-1252 from the .cpg ("' + fs.readFileSync(path.join(FX, 'cp1252.cpg'), 'utf8').trim() + '")');
  const c2 = DBF.readDbf(read(path.join(FX, 'cp1252nocpg.dbf')));
  ok(c2.encoding === 'windows-1252' && c2.records[0].NAME === 'Café crème' && c2.notes.some((n) => /Windows-1252/.test(n)), 'no .cpg, not valid UTF-8 → Windows-1252, said in a note');
  // write: names ≤ 10, unique; types; UTF-8 cut at 254 bytes without splitting a character
  const fields = [{ name: 'A_VERY_LONG_FIELD_NAME', type: 'text' }, { name: 'A_VERY_LONG_FIELD_NAME_2', type: 'number' }, { name: '__proto__', type: 'text' }, { name: 'Höhe m', type: 'number' }, { name: 'ok', type: 'bool' }, { name: 'when', type: 'date' }];
  const rec = (a, b, c, h, o, w) => { const p = Object.create(null); p.A_VERY_LONG_FIELD_NAME = a; p.A_VERY_LONG_FIELD_NAME_2 = b; p.__proto__ = c; p['Höhe m'] = h; p.ok = o; p.when = w; return p; };
  const recs = [rec('é'.repeat(200), 1.5, 'proto', 123.456789, true, '2026-01-02'), rec(null, -2, '', null, false, null), rec('x', 1e7 + 0.125, 'z', 0.1, null, '1999-12-31')];
  const { bytes, names } = DBF.writeDbf(fields, recs);
  ok(names.every((n) => n.length <= 10 && /^[A-Za-z0-9_]+$/.test(n)) && new Set(names.map((n) => n.toUpperCase())).size === names.length, 'written names ≤ 10 ASCII characters, unique: ' + names.join(', '));
  const back = DBF.readDbf(bytes, { cpg: 'UTF-8' });
  ok(back.records[0][names[0]] === 'é'.repeat(127), 'a long UTF-8 text is cut at 254 bytes on a character boundary');
  ok(back.records[0][names[1]] === 1.5 && back.records[2][names[1]] === 1e7 + 0.125 && back.records[1][names[1]] === -2, 'numbers read back exactly');
  ok(back.records[0][names[3]] === 123.456789 && back.records[1][names[3]] === null, 'a null number reads back null');
  ok(back.records[0][names[4]] === true && back.records[1][names[4]] === false && back.records[2][names[4]] === null, 'true / false / null');
  ok(back.records[0][names[5]] === '2026-01-02' && back.records[2][names[5]] === '1999-12-31', 'dates');
  ok(back.records[0][names[2]] === 'proto' && Object.getPrototypeOf(back.records[0]) === null, 'a field named __proto__ is just a field');
}

section('shapefiles read, compared with GDAL');
async function shpSet(name, dir = FX) {
  const set = { name };
  for (const ext of ['shp', 'shx', 'dbf', 'prj', 'cpg']) { const f = path.join(dir, name + '.' + ext); if (fs.existsSync(f)) set[ext] = read(f); }
  return SHP.readShapefile(set);
}
async function vsGdal(layer, gfile, glayer, label, tol = 1e-12, only = null) {
  const G = gdal(gfile, glayer)[0];
  const gf = G.features.flatMap((f) => fromGdal(f.g).map((g) => ({ g, p: f.p })));
  const ours = layer.features;
  ok(ours.length === gf.length, `${label}: ${ours.length} features (GDAL ${gf.length})`);
  let geo = 0, att = 0;
  ours.forEach((f, i) => { if (gf[i] && sameGeom(f.g, gf[i].g, tol)) geo++; if (gf[i] && sameProps(f.p, gf[i].p, only || G.fields)) att++; });
  ok(geo === gf.length, `${label}: every geometry equals GDAL's (${geo}/${gf.length})`);
  ok(att === gf.length, `${label}: every attribute equals GDAL's (${att}/${gf.length})`);
  ok(layer.fields.map((f) => f.name).join() === G.fields.join(), `${label}: fields ${G.fields.join(', ')}`);
  return G;
}
for (const [name, geom, z] of [['pointz', 'pt', true], ['points2d', 'pt', false], ['multipoint', 'pt', true], ['linez', 'ln', true], ['contours', 'ln', false], ['polygons', 'pg', false], ['polygonz', 'pg', true], ['cp1252', 'pt', false], ['cp1252nocpg', 'pt', false], ['utm', 'pt', false]]) {
  const l = await shpSet(name);
  ok(l.geom === geom && l.hasZ === z, `${name}: ${geom}${z ? ' Z' : ''} (shape type ${l.shapeType})`);
  // without a .cpg GDAL reads the text as ISO-8859-1 (curly quotes and dashes become control characters); CivilCraft
  // reads Windows-1252 (the spec's rule), so only NAME (no such characters) is compared with GDAL there
  await vsGdal(l, path.join(FX, name + '.shp'), null, name, 1e-12, name === 'cp1252nocpg' ? ['NAME'] : null);
}
{
  const l = await shpSet('pointz');
  ok(l.features[2].g === null && l.features[2].p.NAME === 'plain', 'an empty geometry is kept (null) with its attributes');
  const mp = await shpSet('multipoint');
  ok(mp.features.length === 3 && mp.notes.some((n) => /multipoints were split/.test(n)), 'multipoint → one feature per point, said in a note');
  const pg = await shpSet('polygons');
  ok(pg.features[0].g.c.length === 1 && pg.features[0].g.c[0].length === 3, 'a polygon with two holes: one polygon, three rings');
  ok(pg.features[1].g.c.length === 2 && pg.features[1].g.c[1].length === 2, 'a multipolygon: two polygons, the second with a hole');
  ok(GG.ringArea(pg.features[0].g.c[0][0]) < 0 && GG.ringArea(pg.features[0].g.c[0][1]) > 0, 'shapefile winding kept on read: outer clockwise, hole counter-clockwise');
  const r = GR.resolveSrc({ prj: l.prj });
  ok(r.kind === 'crs' && r.matched?.code === 2277, '.prj written by GDAL for EPSG:2277 matches the catalog (' + (r.name || r.why) + ')');
  const u = await shpSet('utm');
  ok(GR.resolveSrc({ prj: u.prj }).matched?.code === 32614, '.prj for UTM 14N matches EPSG:32614');
}

section('a zip of several shapefiles, a folder inside');
{
  const r = await GR.readGisFiles([{ name: 'several.zip', data: read(path.join(FX, 'several.zip')) }]);
  ok(r.sources.length === 3 && r.sources.every((s) => s.format === 'Shapefile'), 'three layers from one zip (' + r.sources.map((s) => s.file).join(', ') + ')');
  ok(r.sources.every((s) => s.src.kind === 'crs' && s.src.matched?.code === 2277), 'each with its .prj → EPSG:2277');
  const lz = r.sources.find((s) => /linez/.test(s.file)).layers[0];
  ok(lz.features.length === 3 && lz.features[0].g.c.length === 2 && lz.hasZ, 'linez from data/ inside the zip: 3 features, multi-part, Z');
}

section('GeoJSON read, compared with GDAL');
{
  const text = fs.readFileSync(path.join(FX, 'austin.geojson'), 'utf8');
  const r = GJ.readGeoJSON(text, 'austin');
  ok(r.crsCode === null, 'RFC 7946 GeoJSON → WGS 84 longitude/latitude');
  ok(r.layers.map((l) => l.geom).join() === 'pt,ln,pg', 'one layer per kind: points, lines, polygons (' + r.layers.map((l) => l.name).join(' · ') + ')');
  ok(r.notes.some((n) => /collections were split/.test(n)) && r.notes.some((n) => /multipoints were split/.test(n)) && r.notes.some((n) => /no geometry/.test(n)), 'notes: collection flattened, multipoint split, empty geometry left out');
  const G = gdal(path.join(FX, 'austin.geojson'))[0];
  const all = G.features.flatMap((f) => fromGdal(f.g).filter(Boolean).map((g) => ({ g, p: f.p })));
  const ours = r.layers.flatMap((l) => l.features);
  ok(ours.length === all.length, `${ours.length} geometries (GDAL ${all.length})`);
  let geo = 0, att = 0;
  for (const g of all) { const m = ours.find((o) => sameGeom(o.g, g.g)); if (m) { geo++; if (sameProps(m.p, g.p, G.fields)) att++; } }
  ok(geo === all.length && att === all.length, `every geometry and its properties equal GDAL's (${geo}, ${att} of ${all.length})`);
  const pts = r.layers[0];
  ok(pts.hasZ && pts.features[0].g.c[2] === 150.5, 'the point keeps its height (150.5 m)');
  ok(pts.fields.map((f) => f.name + ':' + f.type).join() === 'name:text,n:number,v:number,flag:bool,note:text', 'field types from the values: ' + pts.fields.map((f) => f.name + ':' + f.type).join(', '));
  const legacy = GJ.readGeoJSON(JSON.stringify({ type: 'FeatureCollection', crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::2277' } }, features: [{ type: 'Feature', properties: { a: 1 }, geometry: { type: 'Point', coordinates: [3115000, 10070000] } }] }), 'old');
  ok(legacy.crsCode === 2277, 'an old-style crs member naming EPSG:2277 is honoured');
  ok(GJ.readGeoJSON('{"type":"Point","coordinates":[1,2]}', 'bare').layers[0].features.length === 1, 'a bare geometry reads as one feature');
}

section('GeoPackage read, compared with GDAL');
{
  const gp = await GP.openGpkg(read(path.join(FX, 'site.gpkg')));
  ok(gp.tables.map((t) => t.name).join() === 'survey,breaks,lots,wgs', 'four feature tables from gpkg_contents');
  ok(gp.tables.slice(0, 3).every((t) => t.srs?.org.toUpperCase() === 'EPSG' && t.srs.code === 2277) && gp.tables[3].srsId === 4326, 'systems from gpkg_spatial_ref_sys: EPSG:2277 ×3, 4326');
  for (const t of gp.tables) {
    const ls = await gp.read(t.name);
    await vsGdal(ls[0], path.join(FX, 'site.gpkg'), t.name, 'gpkg ' + t.name);
  }
  const survey = (await gp.read('survey'))[0];
  ok(survey.hasZ && survey.features[0].g.c[2] === 501.125 && survey.features[2].g === null, 'survey: Z kept, an empty geometry is null');
  gp.close();
  const r = await GR.readGisFiles([{ name: 'site.gpkg', data: read(path.join(FX, 'site.gpkg')) }]);
  ok(r.sources.length === 4 && r.sources[0].src.matched?.code === 2277 && r.sources[3].src.kind === 'wgs84', 'readGisFiles: 4 sources, systems resolved');
}

// ---------------------------------------------------------------------------
section('writers, read back by GDAL and by our own readers');
const crs2277 = CRS.crsFromEntry(CRS.byCode(2277));
const E0 = 3115000, N0 = 10070000;
const sq = (x, y, s, z) => { const r = [[x, y], [x + s, y], [x + s, y + s], [x, y + s], [x, y]]; return z === undefined ? r : r.map((p) => [p[0], p[1], z]); };
const props = (o) => Object.assign(Object.create(null), o);
const SAMPLE = [
  { name: 'Valves Ünïcode', geom: 'pt', hasZ: true, fields: [{ name: 'NAME', type: 'text' }, { name: 'SIZE_IN', type: 'number' }, { name: 'COUNT', type: 'number' }, { name: 'OPEN', type: 'bool' }, { name: 'SET_ON', type: 'date' }, { name: 'a_long_field_name_here', type: 'text' }],
    features: [{ g: { t: 'pt', c: [E0 + 1.25, N0 + 2.5, 500.125] }, p: props({ NAME: 'V-1 “main” — Straße', SIZE_IN: 8.5, COUNT: 3, OPEN: true, SET_ON: '2026-10-11', a_long_field_name_here: 'x' }) },
      { g: { t: 'pt', c: [E0 + 10, N0 + 20, 501] }, p: props({ NAME: '中文', SIZE_IN: null, COUNT: -7, OPEN: false, SET_ON: null, a_long_field_name_here: null }) },
      { g: null, p: props({ NAME: 'no geometry', SIZE_IN: 1, COUNT: 0, OPEN: null, SET_ON: '2000-01-31', a_long_field_name_here: 'y' }) }] },
  { name: 'Mains', geom: 'ln', hasZ: true, fields: [{ name: 'NAME', type: 'text' }],
    features: [{ g: { t: 'ln', c: [[[E0, N0, 490], [E0 + 100, N0 + 5, 489.5], [E0 + 180, N0 + 40, 489]], [[E0 + 5, N0 + 60, 488], [E0 + 25, N0 + 80, 487.75]]] }, p: props({ NAME: 'two parts' }) },
      { g: { t: 'ln', c: [[[E0 - 50, N0 - 50, 480], [E0 - 40, N0 - 30, 481]]] }, p: props({ NAME: 'one part' }) }] },
  { name: 'Lots', geom: 'pg', hasZ: false, fields: [{ name: 'LOT', type: 'number' }, { name: 'OWNER', type: 'text' }],
    features: [{ g: { t: 'pg', c: [[sq(E0, N0, 100), sq(E0 + 20, N0 + 20, 10).reverse(), sq(E0 + 60, N0 + 60, 15).reverse()]] }, p: props({ LOT: 1, OWNER: 'A' }) },
      { g: { t: 'pg', c: [[sq(E0 + 200, N0, 50)], [sq(E0 + 300, N0, 40), sq(E0 + 310, N0 + 10, 10).reverse()]] }, p: props({ LOT: 2, OWNER: 'B & C' }) }] },
  { name: 'Pad Z', geom: 'pg', hasZ: true, fields: [{ name: 'ELEV', type: 'number' }], features: [{ g: { t: 'pg', c: [[sq(E0 + 400, N0 + 400, 30, 505.5)]] }, p: props({ ELEV: 505.5 }) }] },
];
const proj = new PJ.Project();
proj.change('crs', (s) => { s.crs = crs2277; });
const sampleIds = GL.addLayers(proj, SAMPLE.map((l) => ({ ...l, source: { file: 'sample', format: 'test', crs: crs2277.name } })));
ok(sampleIds.length === 4 && proj.state.gis.layers.map((l) => l.id).join() === sampleIds.join(), 'four sample layers added (' + sampleIds.join(', ') + ')');
const keys = sampleIds.map((id) => 'gis:' + id);
{
  const r = await GX.exportProject(proj, keys, 'shp', { stem: 'sample' });
  fs.writeFileSync(path.join(OUT, r.name), r.bytes);
  const dir = path.join(OUT, 'sample-shp'); fs.mkdirSync(dir, { recursive: true });
  execFileSync('unzip', ['-o', '-q', path.join(OUT, r.name), '-d', dir]);
  const files = fs.readdirSync(dir).sort();
  ok(r.groups.every((g) => ['shp', 'shx', 'dbf', 'prj', 'cpg'].every((e) => files.includes(g.file + '.' + e))), 'the zip holds .shp .shx .dbf .prj .cpg per layer: ' + r.groups.map((g) => g.file).join(', '));
  ok(fs.readFileSync(path.join(dir, r.groups[0].file + '.cpg'), 'utf8') === 'UTF-8', '.cpg says UTF-8');
  ok(r.notes.some((n) => /shortened/.test(n) && /a_long_field_name_here/.test(n)), 'a note names the shortened field names');
  for (const [gi, g] of r.groups.entries()) {
    const G = gdal(path.join(dir, g.file + '.shp'))[0], src = SAMPLE[gi];
    ok(G.epsg === 2277, `${g.file}: GDAL reads the .prj as EPSG:${G.epsg}`);
    ok(G.count === src.features.length, `${g.file}: ${G.count} features (wrote ${src.features.length})`);
    ok(/ Z$/.test(G.geometry_type) === src.hasZ, `${g.file}: GDAL geometry type ${G.geometry_type}`);
    const names = DBF.dbfNames(src.fields.map((f) => f.name));
    let geo = 0, att = 0;
    G.features.forEach((f, i) => {
      const want = src.features[i];
      const got = fromGdal(f.g)[0];
      if (sameGeom(got, want.g)) geo++;
      if (src.fields.every((fd, k) => sameProps({ v: f.p[names[k]] }, { v: want.p[fd.name] }, ['v']))) att++;
    });
    ok(geo === G.count, `${g.file}: every geometry as written, z included (${geo}/${G.count})`);
    ok(att === G.count, `${g.file}: every attribute as written (${att}/${G.count})`);
  }
  const back = await GR.readGisFiles([{ name: r.name, data: r.bytes }]);
  ok(back.sources.length === 4 && back.sources.every((s) => s.src.matched?.code === 2277), 'our reader: 4 shapefiles from our zip, .prj → EPSG:2277');
  ok(back.sources.every((s, i) => s.layers[0].features.every((f, k) => sameGeom(f.g, SAMPLE[i].features[k].g))), 'our reader: every geometry as written');
}
{
  const r = await GX.exportProject(proj, keys, 'gpkg', { stem: 'sample' });
  const f = path.join(OUT, r.name); fs.writeFileSync(f, r.bytes);
  const L = JSON.parse(py('layers', f));
  ok(L.length === 4, 'GeoPackage: GDAL lists 4 tables (' + L.join(', ') + ')');
  for (const [gi, g] of r.groups.entries()) {
    const G = gdal(f, g.file)[0], src = SAMPLE[gi];
    ok(G.epsg === 2277 && G.count === src.features.length, `${g.file}: EPSG:${G.epsg}, ${G.count} features`);
    let geo = 0, att = 0;
    G.features.forEach((ft, i) => { const want = src.features[i]; const got = fromGdal(ft.g)[0]; if (sameGeom(got, want.g)) geo++; if (sameProps(ft.p, want.p, src.fields.map((x) => x.name))) att++; });
    ok(geo === G.count && att === G.count, `${g.file}: geometry (z too) and attributes as written (${geo}, ${att} of ${G.count})`);
  }
  const back = await GR.readGisFiles([{ name: r.name, data: r.bytes }]);
  ok(back.sources.length === 4 && back.sources.every((s) => s.src.matched?.code === 2277), 'our reader: 4 tables, srs → EPSG:2277');
  ok(back.sources.every((s, i) => s.layers[0].features.length === SAMPLE[i].features.length && s.layers[0].features.every((ft, k) => sameGeom(ft.g, SAMPLE[i].features[k].g) && sameProps(ft.p, SAMPLE[i].features[k].p, SAMPLE[i].fields.map((x) => x.name)))), 'our reader: every geometry and attribute as written');
  const ogr = execFileSync(python, ['-I', '-c', 'import pyogrio,sys; print(pyogrio.read_info(sys.argv[1], layer="Lots")["geometry_type"])', f], { encoding: 'utf8' }).trim();
  ok(ogr === 'MultiPolygon', 'GDAL: the Lots table is MultiPolygon');
}
{
  const r = await GX.exportProject(proj, keys, 'geojson', { stem: 'sample' });
  const f = path.join(OUT, r.name); fs.writeFileSync(f, r.bytes);
  const J = JSON.parse(new TextDecoder().decode(r.bytes));
  ok(J.type === 'FeatureCollection' && !('crs' in J), 'RFC 7946: a FeatureCollection with no "crs" member');
  ok(J.features.every((x) => typeof x.properties.kind === 'string'), 'every feature carries a "kind" property');
  const all = [];
  const walk = (c) => (typeof c[0] === 'number' ? all.push(c) : c.forEach(walk));
  J.features.forEach((x) => x.geometry && walk(x.geometry.coordinates));
  ok(all.every((p) => p[0] >= -180 && p[0] <= 180 && p[1] >= -90 && p[1] <= 90) && all.every((p) => p[0] < -90 && p[1] > 20), 'positions are longitude, latitude (Texas: lon ≈ −98, lat ≈ 31)');
  const polys = J.features.filter((x) => x.geometry && /Polygon/.test(x.geometry.type)).flatMap((x) => (x.geometry.type === 'Polygon' ? [x.geometry.coordinates] : x.geometry.coordinates));
  ok(polys.length === 4 && polys.every((poly) => poly.every((r, i) => (GG.ringArea(r) > 0) === (i === 0))), 'right-hand rule: every outer ring counter-clockwise, every hole clockwise');
  // positions vs PROJ
  const srcPts = SAMPLE[0].features.filter((x) => x.g).map((x) => x.g.c.slice(0, 2));
  const want = pyproj('EPSG:2277', 'EPSG:4326', srcPts);
  const got = J.features.filter((x) => x.properties.kind === r.groups[0].kind && x.geometry).map((x) => x.geometry.coordinates);
  ok(got.length === 2 && got.every((p, i) => Math.abs(p[0] - want[i][0]) < 2e-8 && Math.abs(p[1] - want[i][1]) < 2e-8), 'point positions equal PROJ’s EPSG:2277 → 4326 to 2e-8° (≈ 2 mm): ' + got.map((p) => p.slice(0, 2).map((v) => v.toFixed(8)).join(' ')).join(' · '));
  near(got[0][2], 500.125 * 1200 / 3937, 1e-4, 'z written in metres (500.125 US ft)');
  const G = gdal(f)[0];
  ok(G.epsg === 4326 && G.count === J.features.length, `GDAL reads it: EPSG:${G.epsg}, ${G.count} features`);
  ok(r.groups.every((g) => g.features.length === J.features.filter((x) => x.properties.kind === g.kind).length) && J.features.some((x) => x.geometry === null && x.properties.NAME === 'no geometry'), 'every feature of each kind; the empty geometry as "geometry": null (RFC 7946 §3.2)');
}
{
  const p0 = new PJ.Project();
  GL.addLayers(p0, [{ ...SAMPLE[0], source: {} }]);
  await throwsWith(() => GX.exportProject(p0, ['gis:' + p0.state.gis.layers[0].id], 'geojson'), /needs the project’s coordinate system/, 'GeoJSON without a project system is refused with the reason');
  const r = await GX.exportProject(p0, ['gis:' + p0.state.gis.layers[0].id], 'shp');
  ok(!ZIP.listZip(r.bytes).some((e) => /\.prj$/.test(e.name)) && /no coordinate system/.test(r.notes[0]), 'no project system: a shapefile without .prj, and a plain warning');
}

section('as-built export of a whole project (ground coordinates → grid)');
const site = new PJ.Project();
{
  const pts = PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8')).points;
  site.setPoints(pts, 'site-topo.csv');
  const PI = await mod('pipes.js');
  const SE = 6150000, SN = 2080000;
  site.change('design', (s) => {
    for (const k of ['FL', 'TBN', 'TBS', 'RIDGE']) s.surface.groups[k] = 'breakline';
    s.surface.groups.CP = 'off';
    s.alignments.push({ id: 'a90', name: 'Access road', start: 1000, pis: [{ x: SE + 10, y: SN + 260, r: 0 }, { x: SE + 200, y: SN + 230, r: 120 }, { x: SE + 300, y: SN + 40, r: 90 }, { x: SE + 390, y: SN + 30, r: 0 }], pvis: [], corridor: null });
    s.pads.push({ id: 'p91', name: 'Pad A', pts: [{ x: SE + 60, y: SN + 60 }, { x: SE + 140, y: SN + 60 }, { x: SE + 140, y: SN + 120 }, { x: SE + 60, y: SN + 120 }], z: 252, cut: 2, fill: 3 });
    s.network = { ...PI.defaultNetwork('ft'), structures: [{ id: 's92', name: 'S1', x: SE + 50, y: SN + 200, rim: null, sumpDepth: 1, dia: 48 }, { id: 's93', name: 'S2', x: SE + 150, y: SN + 180, rim: null, sumpDepth: 0, dia: 48 }], pipes: [{ id: 'q94', name: 'P1', from: 's92', to: 's93', dia: 18, invUp: 245, invDn: 244 }] };
    s.crs = { ...crs2277, local: CRS.groundLocal(0.99987, [SE, SN]) };
  });
  const al = site.alignment(site.state.alignments[0]), egp = site.egProfile(site.state.alignments[0]).filter((q) => q.z !== null);
  site.change('corridor', (s) => { s.alignments[0].pvis = [{ sta: egp[0].sta, z: egp[0].z, L: 0 }, { sta: egp[egp.length - 1].sta, z: egp[egp.length - 1].z, L: 0 }]; s.alignments[0].corridor = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 25 }; });
  ok(al.ok && site.graded().surface, 'the site: points, breaklines, an alignment with a corridor, a pad, a pipe run, a ground adjustment');
  const kinds = GX.exportKinds(site);
  const count = (k) => kinds.find((x) => x.key === k).count;
  ok(count('points') === 274 + 2 && count('contours-eg') > 20 && count('contours-fg') > 20 && count('breaklines') >= 4 && count('boundary') === 1 && count('alignments') === 1 && count('pads') === 1 && count('daylight') >= 3 && count('corridor') === 5 && count('pipes') === 1 && count('structures') === 2, 'every kind has something: ' + kinds.filter((k) => k.count).map((k) => k.key + ' ' + k.count).join(', '));
  const all = kinds.filter((k) => k.count).map((k) => k.key);
  const f = CRS.frame(site.state.crs);
  for (const fmt of ['shp', 'gpkg', 'geojson']) {
    const r = await GX.exportProject(site, all, fmt, { stem: 'site' });
    const file = path.join(OUT, 'site-' + r.name); fs.writeFileSync(file, r.bytes);
    let layers;
    if (fmt === 'shp') { const dir = path.join(OUT, 'site-shp'); fs.mkdirSync(dir, { recursive: true }); execFileSync('unzip', ['-o', '-q', file, '-d', dir]); layers = r.groups.map((g) => ({ g, G: gdal(path.join(dir, g.file + '.shp'))[0] })); }
    else if (fmt === 'gpkg') layers = r.groups.map((g) => ({ g, G: gdal(file, g.file)[0] }));
    else { const G = gdal(file)[0]; layers = [{ g: null, G }]; }
    ok(layers.every(({ G }) => G.epsg === (fmt === 'geojson' ? 4326 : 2277)), `${fmt}: GDAL reads every layer with EPSG:${fmt === 'geojson' ? 4326 : 2277}`);
    if (fmt === 'geojson') { ok(layers[0].G.count === r.groups.reduce((s, g) => s + g.features.filter((x) => x.g).length, 0), 'geojson: every feature (' + layers[0].G.count + ')'); continue; }
    ok(layers.every(({ g, G }) => G.count === g.features.length), `${fmt}: every layer’s feature count (${layers.map(({ G }) => G.count).join(', ')})`);
    const pts = layers.find(({ g }) => g.key === 'points').G;
    const p0 = site.points[5], want = f.toGrid(p0.x, p0.y), got = pts.features[5];
    ok(Math.abs(got.g[1][0] - want[0]) < 1e-6 && Math.abs(got.g[1][1] - want[1]) < 1e-6 && Math.abs(got.p.E - want[0]) < 1e-6 && Math.abs(got.p.N - want[1]) < 1e-6, `${fmt}: survey point ${p0.n} written in grid (${want.map((v) => v.toFixed(3)).join(', ')}), E/N fields too — not its ground numbers (${p0.x.toFixed(3)}, ${p0.y.toFixed(3)})`);
    ok(got.g[1][2] === p0.z && got.p.Z === p0.z && got.p.P === p0.n && got.p.D === p0.d, `${fmt}: Z, P, D of point ${p0.n}`);
    const pipe = layers.find(({ g }) => g.key === 'pipes').G.features[0].p;
    ok(pipe.NAME === 'P1' && pipe.FROM === 'S1' && pipe.TO === 'S2' && pipe.DIA === 18 && pipe.DIA_UNIT === 'in' && pipe.INV_UP === 245 && pipe.INV_DN === 244 && Math.abs(pipe.SLOPE - 100 / Math.hypot(100, 20)) < 1e-6 && /Storm/.test(pipe.NETWORK), `${fmt}: pipe fields ${Object.entries(pipe).map(([k, v]) => k + '=' + (typeof v === 'number' ? +v.toFixed(4) : v)).join(' ')}`);
    const st = layers.find(({ g }) => g.key === 'structures').G.features[0].p;
    ok(st.NAME === 'S1' && st.INVERT === 245 && Number.isFinite(st.RIM) && st.DIA === 48, `${fmt}: structure fields NAME RIM INVERT SUMP DIA`);
    const a = layers.find(({ g }) => g.key === 'alignments').G.features[0].p;
    ok(a.NAME === 'Access road' && Math.abs(a.STA_END - a.STA_START - a.LENGTH) < 1e-9 && a.STA_START === 1000, `${fmt}: alignment NAME LENGTH STA_START STA_END`);
    const c = layers.find(({ g }) => g.key === 'contours-eg').G;
    ok(c.features.every((x) => fromGdal(x.g)[0].c.flat().every((p) => p[2] === x.p.ELEV)), `${fmt}: contours of existing ground at their ELEV`);
    const pad = layers.find(({ g }) => g.key === 'pads').G.features[0].p;
    ok(pad.NAME === 'Pad A' && pad.ELEV === 252 && Math.abs(pad.AREA - 4800) < 1e-6, `${fmt}: pad NAME ELEV AREA`);
  }
}

section('import: the coordinate system decision, reprojection');
{
  const pz = await GR.readGisFiles(['pointz.shp', 'pointz.shx', 'pointz.dbf', 'pointz.prj', 'pointz.cpg'].map((n) => ({ name: n, data: read(path.join(FX, n)) })));
  const empty = new PJ.Project();
  let plan = GR.planImport(empty.state, pz.sources);
  ok(plan.case === 'offer' && plan.offer.code === 2277, 'no project system + a state plane ftUS shapefile → offer EPSG:2277 as the project’s system');
  const mProj = new PJ.Project(); mProj.state.units = 'm';
  plan = GR.planImport(mProj.state, pz.sources);
  ok(plan.case === 'pick' && /feet/.test(plan.why) && Math.abs(plan.near[0] + 97.5) < 2, 'a metre project + a feet shapefile → pick the project’s system (near ' + plan.near.map((v) => v.toFixed(3)).join(', ') + ')');
  const gj = await GR.readGisFiles([{ name: 'austin.geojson', data: read(path.join(FX, 'austin.geojson')) }]);
  plan = GR.planImport(empty.state, gj.sources);
  ok(plan.case === 'pick' && /latitude and longitude/.test(plan.why) && Math.abs(plan.near[0] + 97.74) < 0.01 && Math.abs(plan.near[1] - 30.27) < 0.01, 'GeoJSON → pick the project’s system, near its middle in lat/long');
  const noprj = await GR.readGisFiles(['pointz.shp', 'pointz.dbf'].map((n) => ({ name: n, data: read(path.join(FX, n)) })));
  ok(noprj.sources[0].src.kind === 'none' && GR.planImport(empty.state, noprj.sources).case === 'none', 'a shapefile with no .prj → no system known: numbers as they are');
  // offer accepted: the system becomes the project's in the same undo step
  const p = new PJ.Project();
  const r = GR.importInto(p, pz.sources, { crs: plan.offer || GR.planImport(p.state, pz.sources).offer, setCrs: true });
  ok(r.ids.length === 1 && p.state.crs?.code === 2277 && p.undoStack.length === 1, 'import with "use EPSG:2277 as the project’s system": one undo step, crs set');
  ok(sameGeom(p.gisFeatures.get(r.ids[0])[0].g, pz.sources[0].layers[0].features[0].g), 'same system: coordinates unchanged');
  p.undo();
  ok(!p.state.crs && !p.state.gis.layers.length && !p.gisFeatures.size, 'undo: the layer and the system are gone');
  p.redo();
  ok(p.state.crs?.code === 2277 && p.state.gis.layers.length === 1 && p.gisFeatures.get(r.ids[0]).length === 5, 'redo: both back');
  // GeoJSON into a 2277 project: positions vs PROJ, z metres → US ft
  const q = new PJ.Project(); q.change('crs', (s) => { s.crs = crs2277; });
  const g = GR.importInto(q, gj.sources, {});
  const pl = q.gisFeatures.get(g.ids[0]);
  const src = gj.sources[0].layers[0].features.map((f) => f.g.c.slice(0, 2));
  const want = pyproj('EPSG:4326', 'EPSG:2277', src);
  ok(pl.every((f, i) => Math.abs(f.g.c[0] - want[i][0]) < 0.003 && Math.abs(f.g.c[1] - want[i][1]) < 0.003), 'GeoJSON points placed in EPSG:2277 as PROJ places them (3 mm): ' + pl.slice(0, 2).map((f) => f.g.c.slice(0, 2).map((v) => v.toFixed(3)).join(' ')).join(' · '));
  near(pl[0].g.c[2], 150.5 / (1200 / 3937), 1e-9, 'GeoJSON z 150.5 m → US survey feet');
  ok(g.notes.some((n) => /elevations converted from metres/.test(n)) && g.notes.some((n) => /converted from WGS 84/.test(n)), 'notes say what was converted');
  // ground project: GeoJSON placed in ground coordinates (toGrid of the result = PROJ's grid)
  const gq = new PJ.Project(); gq.change('crs', (s) => { s.crs = { ...crs2277, local: CRS.groundLocal(0.9998, [3100000, 10060000]) }; });
  const gg = GR.importInto(gq, gj.sources, {});
  const fr = CRS.frame(gq.state.crs), gp0 = gq.gisFeatures.get(gg.ids[0])[0].g.c, back = fr.toGrid(gp0[0], gp0[1]);
  ok(Math.abs(back[0] - want[0][0]) < 0.003 && Math.abs(back[1] - want[0][1]) < 0.003 && Math.hypot(gp0[0] - want[0][0], gp0[1] - want[0][1]) > 1, 'ground project: the point lands at ground coordinates whose grid is PROJ’s (' + gp0.slice(0, 2).map((v) => v.toFixed(3)).join(', ') + ')');
  // UTM metres into the 2277 project
  const utm = await GR.readGisFiles(['utm.shp', 'utm.dbf', 'utm.prj'].map((n) => ({ name: n, data: read(path.join(FX, n)) })));
  const u = GR.importInto(q, utm.sources, {});
  const uw = pyproj('EPSG:32614', 'EPSG:2277', [[621160, 3349894]])[0], ug = q.gisFeatures.get(u.ids[0])[0].g.c;
  ok(Math.abs(ug[0] - uw[0]) < 0.003 && Math.abs(ug[1] - uw[1]) < 0.003, 'a UTM 14N shapefile placed in EPSG:2277 as PROJ places it (' + ug.map((v) => v.toFixed(3)).join(', ') + ')');
  // no .prj into a project with a system: "same as the project" (default) — numbers unchanged, said
  const s2 = GR.importInto(q, noprj.sources, { overrides: new Map([[0, { kind: 'same' }]]) });
  ok(sameGeom(q.gisFeatures.get(s2.ids[0])[0].g, noprj.sources[0].layers[0].features[0].g), 'no .prj, "same as the project": numbers unchanged');
  const picked = GR.importInto(q, noprj.sources, { overrides: new Map([[0, GR.resolveSrc({ code: 32614 })]]) });
  ok(Math.hypot(q.gisFeatures.get(picked.ids[0])[0].g.c[0] - 3115010.5, 0) > 1000, 'no .prj, a system picked for the file: reprojected from it');
  // lat/long that is not lat/long
  const fake = GJ.readGeoJSON(JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [3115000, 10070000] } }, { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-97, 30] } }] }), 'fake');
  const fk = GR.importInto(q, [{ file: 'fake.geojson', format: 'GeoJSON', layers: fake.layers, src: { kind: 'wgs84' }, notes: [] }], {});
  ok(q.gisFeatures.get(fk.ids[0]).length === 1 && fk.notes.some((n) => /outside ±180° \/ ±90°/.test(n)), 'GeoJSON positions outside ±180/±90 are refused with a note');
  const none = GR.importInto(new PJ.Project(), gj.sources, {});
  ok(!none.ids.length && none.notes.some((n) => /has no coordinate system; it was not imported/.test(n)), 'never placed without a project system: lat/long data with no project system is not imported');
}

section('the project’s system changes: the layers follow');
{
  const p = new PJ.Project(); p.change('crs', (s) => { s.crs = crs2277; });
  const [id] = GL.addLayers(p, [{ name: 'pts', geom: 'pt', hasZ: false, fields: [], features: [{ g: { t: 'pt', c: [3115000, 10070000] }, p: props({}) }], source: {} }]);
  const c2278 = CRS.crsFromEntry(CRS.byCode(2278));
  GL.moveLayers(p, crs2277, c2278);
  const want = pyproj('EPSG:2277', 'EPSG:2278', [[3115000, 10070000]])[0], got = p.gisFeatures.get(id)[0].g.c;
  ok(Math.abs(got[0] - want[0]) < 0.003 && Math.abs(got[1] - want[1]) < 0.003, 'Texas Central → South Central: the layer moves as PROJ moves it (' + got.map((v) => v.toFixed(3)).join(', ') + ')');
  p.undo();
  ok(p.gisFeatures.get(id)[0].g.c[0] === 3115000, 'one undo step');
  const ground = { ...crs2277, local: CRS.groundLocal(0.9998, [3100000, 10060000]) };
  GL.moveLayers(p, crs2277, ground);
  const gg = p.gisFeatures.get(id)[0].g.c, back = CRS.frame(ground).toGrid(gg[0], gg[1]);
  ok(Math.abs(back[0] - 3115000) < 1e-6 && Math.abs(back[1] - 10070000) < 1e-6 && Math.abs(gg[0] - 3115000) > 1, 'grid → ground: the layer keeps its grid place (now ' + gg.map((v) => v.toFixed(3)).join(', ') + ' in ground numbers)');
}

section('the layer model: picking, scene, extents, use for the surface, remove, undo, project file');
{
  const p = new PJ.Project();
  const pts = PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8')).points;
  p.setPoints(pts, 'site-topo.csv');
  const SE = 6150000, SN = 2080000;
  const lines = { name: 'Contours', geom: 'ln', hasZ: false, fields: [{ name: 'ELEV', type: 'number' }, { name: 'NOTE', type: 'text' }], features: [0, 1, 2].map((i) => ({ g: { t: 'ln', c: [[[SE + 50 + i * 30, SN + 50], [SE + 60 + i * 30, SN + 150], [SE + 55 + i * 30, SN + 250]]] }, p: props({ ELEV: 252 + i, NOTE: 'c' + i }) })) };
  const brk = { name: 'Break Z', geom: 'ln', hasZ: true, fields: [], features: [{ g: { t: 'ln', c: [[[SE + 20, SN + 20, 249], [SE + 380, SN + 280, 258]]] }, p: props({}) }] };
  const lot = { name: 'Site', geom: 'pg', hasZ: false, fields: [], features: [{ g: { t: 'pg', c: [[[[SE + 10, SN + 10], [SE + 390, SN + 10], [SE + 390, SN + 290], [SE + 10, SN + 290], [SE + 10, SN + 10]]]] }, p: props({}) }, { g: { t: 'pg', c: [[[[SE + 100, SN + 100], [SE + 120, SN + 100], [SE + 120, SN + 120], [SE + 100, SN + 120], [SE + 100, SN + 100]]]] }, p: props({}) }] };
  const shots = { name: 'Shots', geom: 'pt', hasZ: true, fields: [{ name: 'H', type: 'number' }], features: [{ g: { t: 'pt', c: [SE + 200, SN + 150, 260.5] }, p: props({ H: 999 }) }, { g: { t: 'pt', c: [SE + 210, SN + 150] }, p: props({ H: 261 }) }] };
  const ids = GL.addLayers(p, [lines, brk, lot, shots].map((l) => ({ ...l, source: { file: 'x' } })), { label: 'Import test' });
  ok(p.undoStack.at(-1).label === 'Import test' && p.undoStack.length === 1, 'import = one undo step');
  const ext = GL.gisExtents(p);
  ok(ext.minX === SE + 10 && ext.maxY === SN + 290, 'extents of the visible layers');
  const sc = GL.gisScene(p, 1);
  ok(sc.layers.map((l) => l.name).join() === ids.map((i) => 'GIS-' + i).join() && sc.items.length === 3 + 1 + 2 + 2, 'scene: a layer per visible GIS layer, ' + sc.items.length + ' items (lines, ring outlines, point squares)');
  ok(sc.items.find((it) => it.layer === 'GIS-' + ids[3]).pts.length === 4 && sc.items.find((it) => it.layer === 'GIS-' + ids[1]).z, 'points as squares, lines with z as 3D polylines');
  let hit = GL.pickFeature(p, SE + 60 + 30, SN + 150, 2);
  ok(hit?.layer === ids[0] && hit.i === 1, 'pick: the second contour by its line');
  hit = GL.pickFeature(p, SE + 110, SN + 110, 0.5);
  ok(hit?.layer === ids[2] && hit.i === 1, 'pick inside two polygons: the smaller one');
  hit = GL.pickFeature(p, SE + 200.4, SN + 150.3, 1);
  ok(hit?.layer === ids[3] && hit.i === 0, 'pick a point');
  GL.setLayer(p, ids[3], { visible: false });
  ok(GL.pickFeature(p, SE + 200.4, SN + 150.3, 1)?.layer !== ids[3] && !GL.gisScene(p, 1).layers.some((l) => l.name === 'GIS-' + ids[3]), 'a hidden layer is neither drawn nor picked');
  p.undo();
  ok(GL.layerOf(p, ids[3]).visible, 'undo shows it again');
  const ch = GL.useChoices(GL.layerOf(p, ids[0]), GL.featuresOf(p, ids[0]));
  ok(ch.length === 1 && ch[0].from === 'field' && ch[0].fields.join() === 'ELEV', 'contours without z: breaklines from the ELEV field');
  const nBreak = p.egBreaklines().length, n0 = p.undoStack.length;
  let r = GL.useForSurface(p, ids[0], { use: 'breaklines', from: 'field', field: 'ELEV' });
  ok(r.ok && p.state.surface.breaklines.length === 3 && p.state.surface.breaklines[1].pts.every((q) => q.z === 253) && p.undoStack.length === n0 + 1, 'contours → 3 breaklines at their ELEV, one undo step: ' + r.message);
  ok(p.egBreaklines().length === nBreak + 3 && p.eg().surface, 'the surface rebuilt with them');
  r = GL.useForSurface(p, ids[1], { use: 'breaklines', from: 'z' });
  ok(r.ok && p.state.surface.breaklines.at(-1).pts[1].z === 258, 'lines with z → breaklines at their own z');
  r = GL.useForSurface(p, ids[2], { use: 'boundary' });
  ok(r.ok && p.state.surface.boundary.length === 4 && p.state.surface.boundary[1].x === SE + 390, 'a polygon layer → the surface boundary (the largest polygon)');
  r = GL.useForSurface(p, ids[2], { use: 'boundary', feature: 1 });
  ok(r.ok && p.state.surface.boundary[0].x === SE + 100, '… or the selected polygon');
  const npts = p.points.length;
  r = GL.useForSurface(p, ids[3], { use: 'points', from: 'z' });
  ok(r.ok && p.points.length === npts + 1 && p.points.at(-1).d === 'Shots' && p.points.at(-1).z === 260.5 && Number(p.points.at(-1).n) > 276, 'points with z → survey points (the one without z left out), described with the layer name: ' + r.message);
  r = GL.useForSurface(p, ids[3], { use: 'points', from: 'field', field: 'H' });
  ok(r.ok && p.points.length === npts + 3 && p.points.at(-1).z === 261, 'points with the elevation from a field');
  ok(p.groups().some((g) => g.key === 'SHOTS' && g.count === 3), 'they form a point group');
  ok(GL.featuresOf(p, ids[3]).length === 2, 'the layer stays as it was');
  for (let k = 0; k < 5; k++) p.undo();
  ok(p.points.length === npts && p.state.surface.breaklines.length === 3 && !p.state.surface.boundary, 'undo ×5 takes them back in order');
  ok(!GL.useForSurface(p, ids[0], { use: 'breaklines', from: 'field', field: 'NOTE' }).ok, 'a text field is refused for elevations');
  // remove + undo
  GL.removeLayer(p, ids[1]);
  ok(!GL.layerOf(p, ids[1]) && !p.gisFeatures.has(ids[1]), 'remove a layer');
  p.undo();
  ok(GL.layerOf(p, ids[1]) && p.gisFeatures.get(ids[1]).length === 1, 'undo brings it back with its features');
  p.redo(); p.undo();
  // project file round trip
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(json.gis.layers.length === 4 && Array.isArray(json.gisFeatures[ids[0]]) && json.gisFeatures[ids[0]][0].length === 2, 'project file: gis + gisFeatures { id: [[geometry, props]] }');
  const { project: p2, notes } = PJ.Project.fromJSON(json);
  ok(!notes.length && p2.state.gis.layers.length === 4 && ids.every((id) => p2.gisFeatures.get(id).length === p.gisFeatures.get(id).length && p2.gisFeatures.get(id).every((f, i) => sameGeom(f.g, p.gisFeatures.get(id)[i].g) && sameProps(f.p, p.gisFeatures.get(id)[i].p, GL.layerOf(p, id).fields.map((x) => x.name)))), 'project file round trip: every layer, geometry and attribute');
  ok(p2.nextId('x') !== 'x1' && Number(p2.nextId('g').slice(1)) > Math.max(...ids.map((i) => Number(i.slice(1)))), 'ids after the GIS layers’ ids');
  // untrusted project file
  const bad = JSON.parse(JSON.stringify(json));
  bad.gis.layers.push({ id: '__proto__', name: 'x', geom: 'pt' }, { id: 'g999', name: 'evil', geom: 'pt', fields: [{ name: '__proto__', type: 'text' }, { name: 'ok', type: 'weird' }], color: 'url(javascript:1)' });
  bad.gisFeatures.__proto__ = [[{ t: 'pt', c: [1, 2] }, {}]];
  bad.gisFeatures.g999 = [[{ t: 'pt', c: [1, 2] }, JSON.parse('{"__proto__": {"polluted": 1}, "ok": 5}')], [{ t: 'pt', c: ['1', 2] }, {}], [{ t: 'ln', c: [[[0, 0], [1, 1]]] }, {}], [{ t: 'pt', c: [1, 2, 3, 4] }, {}], 'junk', [null, { ok: 'kept' }], [{ t: 'pt', c: [1e300, 2] }, {}]];
  bad.gisFeatures[ids[2]][0][0].c[0][0] = [[0, 0], [1, 1]];   // a ring too short
  const { project: p3, notes: n3 } = PJ.Project.fromJSON(bad);
  const evil = p3.state.gis.layers.find((l) => l.id === 'g999');
  ok(p3.state.gis.layers.length === 5 && evil.color === 'blue' && evil.fields[1].type === 'text', 'bad layer ids dropped; a bad colour and field type fixed');
  ok(p3.gisFeatures.get('g999').length === 2 && ({}).polluted === undefined && p3.gisFeatures.get('g999')[0].p.__proto__ !== undefined && Object.getPrototypeOf(p3.gisFeatures.get('g999')[0].p) === null, 'bad features dropped (5 of 7); "__proto__" is a plain field, nothing polluted');
  ok(n3.some((n) => /could not be read/.test(n)), 'notes name what was dropped: ' + n3.join(' | '));
}

section('LandXML <CoordinateSystem>, written and read');
{
  const p = new PJ.Project();
  p.setPoints([{ n: '1', x: 3115000, y: 10070000, z: 500, d: 'CP' }, { n: '2', x: 3115100, y: 10070050, z: 501, d: 'CP' }], 'x');
  const xml = LX.writeLandXml({ name: 'cs test', units: 'ft', points: p.points, crs: crs2277 });
  ok(/<CoordinateSystem name="NAD83 \/ Texas Central \(ftUS\)" epsgCode="2277"\/>/.test(xml), 'written: <CoordinateSystem name … epsgCode="2277"/>');
  const f = path.join(OUT, 'cs.xml'); fs.writeFileSync(f, xml);
  const chk = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'landxml', f], { encoding: 'utf8' }));
  ok(chk.schema === 'valid' || chk.schema === 'skipped', 'LandXML 1.2 XSD: ' + chk.schema + (chk.schema_errors?.length ? ' ' + chk.schema_errors.join('; ') : ''));
  const d = LX.readLandXml(xml);
  ok(d.coordinateSystem?.epsgCode === 2277 && GR.crsFromLandXml(d.coordinateSystem).crs?.code === 2277, 'read back: EPSG:2277, matched to the catalog');
  const local = LX.writeLandXml({ name: 'g', units: 'ft', points: p.points, crs: { ...crs2277, local: CRS.groundLocal(0.99987, [3115000, 10070000]) } });
  fs.writeFileSync(f, local);
  const c2 = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'landxml', f], { encoding: 'utf8' }));
  ok(/desc="Coordinates are ground coordinates, not grid: grid = \(3115000, 10070000\) \+ 0\.99987/.test(local) && (c2.schema === 'valid' || c2.schema === 'skipped'), 'a ground project says so in desc (scale and base); XSD ' + c2.schema);
  const wkt = await CRS.prjFor(CRS.crsFromEntry(CRS.byCode(32614)));
  const w = LX.writeLandXml({ name: 'w', units: 'm', points: [], crs: { code: null, name: 'From a .prj', proj4: wkt, unit: 'm', local: null } });
  fs.writeFileSync(f, w);
  const c3 = JSON.parse(execFileSync(python, [path.join(TOOLS, 'check.py'), 'landxml', f], { encoding: 'utf8' }));
  const r3 = GR.crsFromLandXml(LX.readLandXml(w).coordinateSystem);
  ok(/ogcWktCode="PROJCS\[/.test(w) && r3.crs?.code === 32614 && (c3.schema === 'valid' || c3.schema === 'skipped'), 'a system with no code: its WKT in ogcWktCode, read back and matched (EPSG:' + r3.crs?.code + ')');
  ok(LX.readLandXml('<LandXML><CoordinateSystem epsgCode="999999"/></LandXML>').coordinateSystem.epsgCode === 999999 && !GR.crsFromLandXml({ epsgCode: 999999, name: '' }).crs, 'an unknown code is read but not matched (the page then says so)');
  ok(LX.readLandXml('<LandXML><Units/></LandXML>').coordinateSystem === null, 'no element → null');
}

section('point files with latitude and longitude columns');
{
  const text = 'Point,Latitude,Longitude,Elevation,Description\n1,30.2672,-97.7431,500.5,CP\n2,30.2680,-97.7420,501,GRD\n3,95.0,-97.7,500,BAD\n4,30.27,-197.7,500,BAD\n';
  const r = PTS.parsePoints(text);
  ok(r.latlon === true && r.points.length === 2 && r.points[0].y === 30.2672 && r.points[0].x === -97.7431, 'header Latitude/Longitude → latlon, y = latitude, x = longitude');
  ok(r.bad.length === 2 && r.bad.every((b) => /outside ±90° or longitude outside ±180°/.test(b.why)), 'rows outside ±90 / ±180 refused with the reason');
  ok(PTS.parsePoints('Point,lat,lon,z\n1,30,-97,1\n').latlon && PTS.parsePoints('pt,long,lat,el,d\n1,-97,30,1,x\n').latlon, 'lat / lon / long names too, in any order');
  ok(!PTS.parsePoints('Point,Northing,Easting,Elevation,Description\n1,100,200,3,x\n').latlon, 'northing/easting files are not lat/long');
  const c = GR.latLonPoints(r.points, crs2277);
  const want = pyproj('EPSG:4326', 'EPSG:2277', r.points.map((q) => [q.x, q.y]));
  ok(c.points.every((q, i) => Math.abs(q.x - want[i][0]) < 0.003 && Math.abs(q.y - want[i][1]) < 0.003 && q.z === r.points[i].z), 'converted to EPSG:2277 as PROJ does (3 mm), elevations kept: ' + c.points.map((q) => q.x.toFixed(3) + ' ' + q.y.toFixed(3)).join(' · '));
}

section('untrusted input');
{
  const shp = read(path.join(FX, 'linez.shp')), dbf = read(path.join(FX, 'linez.dbf'));
  const cut = await SHP.readShapefile({ name: 'cut', shp: shp.slice(0, shp.length - 30), dbf });
  ok(cut.features.length === 1 && cut.notes.some((n) => /cut short in shape 2/.test(n)), 'a .shp cut short in its second shape: the first is read, said in a note');
  const lie = shp.slice(); new DataView(lie.buffer).setInt32(100 + 4, 0x3fffffff, false);
  const lr = await SHP.readShapefile({ name: 'lie', shp: lie, dbf });
  ok(lr.features.length === 0 && lr.notes.some((n) => /cut short/.test(n)), 'a record claiming a huge length stops the read there (no hang): ' + lr.notes[0]);
  const parts = shp.slice(); new DataView(parts.buffer).setInt32(100 + 8 + 36, 2e9, true);
  await throwsWith(() => SHP.readShapefile({ name: 'parts', shp: parts, dbf }), /damaged/, 'a shape claiming 2 billion parts');
  const pts = shp.slice(); new DataView(pts.buffer).setInt32(100 + 8 + 40, 0x7fffffff, true);
  await throwsWith(() => SHP.readShapefile({ name: 'pts', shp: pts, dbf }), /damaged/, 'a shape claiming 2 billion points');
  const idx = shp.slice(); new DataView(idx.buffer).setInt32(100 + 8 + 44 + 4, 99, true);
  await throwsWith(() => SHP.readShapefile({ name: 'idx', shp: idx, dbf }), /damaged/, 'a part starting past the points');
  const hdr = shp.slice(); hdr[3] = 0;
  await throwsWith(() => SHP.readShapefile({ name: 'hdr', shp: hdr }), /not a shapefile/, 'a wrong file code');
  const mp = shp.slice(); new DataView(mp.buffer).setInt32(32, 31, true);
  await throwsWith(() => SHP.readShapefile({ name: 'mp', shp: mp }), /multipatch/, 'multipatch refused');
  await throwsWith(() => SHP.readShapefile({ name: 'short', shp: new Uint8Array(50) }), /too short/, 'a 50-byte .shp');
  const d2 = dbf.slice(); new DataView(d2.buffer).setUint32(4, 4e9, true);
  const dr = DBF.readDbf(d2, { cpg: 'UTF-8' });
  ok(dr.records.length === 3 && dr.notes.some((n) => /says it has 4000000000 records but holds 3/.test(n)), 'a .dbf claiming 4 billion records: the 3 it holds, said');
  const d3 = dbf.slice(); new DataView(d3.buffer).setUint16(8, 60000, true);
  try { DBF.readDbf(d3); ok(false, 'a .dbf header longer than the file'); } catch (e) { ok(/damaged/.test(e.message), 'a .dbf header longer than the file — "' + e.message + '"'); }
  // __proto__ field names
  const dp = DBF.writeDbf([{ name: '__proto__', type: 'text' }, { name: 'constructor', type: 'number' }], [Object.assign(Object.create(null), JSON.parse('{"__proto__": "a", "constructor": 1}'))]).bytes;
  const dpr = DBF.readDbf(dp, { cpg: 'UTF-8' });
  ok(({}).polluted === undefined && dpr.fields.map((f) => f.name).join() === '__proto__,constructo' && dpr.records[0].__proto__ === 'a', '.dbf fields named __proto__ and constructo(r) are plain fields');
  const gp = GJ.readGeoJSON('{"type":"Feature","properties":{"__proto__":{"polluted":1},"constructor":"x"},"geometry":{"type":"Point","coordinates":[1,2]}}', 'p');
  ok(({}).polluted === undefined && typeof gp.layers[0].features[0].p.__proto__ === 'string', 'GeoJSON properties named __proto__ stay plain values');
  // zips
  await throwsWith(async () => ZIP.listZip(new Uint8Array(1000).map((_, i) => i * 7)), /not a zip/, 'random bytes as a zip');
  const z = await ZIP.zip([{ name: 'a.txt', data: 'hello hello hello hello hello hello hello hello hello hello hello hello hello hello hello' }]);
  await throwsWith(async () => ZIP.listZip(z.slice(0, z.length - 10)), /not a zip|cut short/, 'a zip cut short');
  const zl = ZIP.listZip(z)[0];
  const crc = z.slice(); crc[30 + 5 + 3] ^= 0xff;
  await throwsWith(() => ZIP.unzipEntry(crc, zl), /damaged|checksum/, 'a damaged entry');
  const bomb = z.slice(); new DataView(bomb.buffer).setUint32(22, 10, true);
  await throwsWith(() => ZIP.unzipEntry(bomb, { ...zl, size: 10 }), /more than it says|different size/, 'an entry that inflates past its stated size (zip bomb) stops there');
  await throwsWith(() => ZIP.unzipEntry(z, { ...zl, size: 3e9 }), /MB/, 'an entry claiming 3 GB is refused before reading');
  await throwsWith(() => ZIP.unzipEntry(z, { ...zl, flags: 1 }), /encrypted/, 'an encrypted entry');
  await throwsWith(() => ZIP.unzipEntry(z, { ...zl, method: 12 }), /method/, 'bzip2 (method 12)');
  const many = z.slice(); const eocd = many.length - 22; new DataView(many.buffer).setUint16(eocd + 10, 0xffff, true);
  await throwsWith(async () => ZIP.listZip(many), /ZIP64/, 'a ZIP64 marker');
  const rz = await GR.readGisFiles([{ name: 'junk.zip', data: new Uint8Array(500) }]);
  ok(!rz.sources.length && /junk\.zip: This is not a zip/.test(rz.notes[0]), 'readGisFiles: a bad zip gives one plain note');
  // GeoPackages
  await throwsWith(() => GP.openGpkg(new Uint8Array(5000)), /not a GeoPackage/, 'zeros as a GeoPackage');
  const S = await GP.loadSql();
  const plain = new S.Database(); plain.run('CREATE TABLE t (a)'); const pb = plain.export(); plain.close();
  await throwsWith(() => GP.openGpkg(pb), /not a GeoPackage \(no gpkg_contents/, 'an SQLite file without gpkg_contents');
  const half = read(path.join(FX, 'site.gpkg')).slice(0, 2048);
  await throwsWith(() => GP.openGpkg(half), /damaged|not a GeoPackage|could not/, 'a GeoPackage cut short');
  // bad geometry blobs and a table name with a quote
  const w = await GP.writeGpkg([{ table: 'we"ird name', label: 'odd', geom: 'pt', hasZ: false, fields: [{ name: 'x"y', type: 'text' }], features: [{ g: { t: 'pt', c: [1, 2] }, p: props({ 'x"y': 'v' }) }, { g: { t: 'pt', c: [3, 4] }, p: props({ 'x"y': 'w' }) }] }], {});
  const db = new S.Database(w); db.run('UPDATE "we""ird name" SET geom = X\'4750000100000000FFFF\' WHERE fid = 2'); const wb = db.export(); db.close();
  const o = await GP.openGpkg(wb);
  const ls = await o.read('we"ird name'); o.close();
  ok(ls[0].features.length === 1 && ls[0].features[0].p['x"y'] === 'v' && ls[0].notes.some((n) => /could not be read/.test(n)), 'a table and a field with a quote in their names; a damaged geometry blob is left out with a note');
  // WKB
  const huge = new Uint8Array(13); huge[0] = 1; new DataView(huge.buffer).setUint32(1, 2, true); new DataView(huge.buffer).setUint32(5, 0xfffffff0, true);
  try { GG.readWkb(huge); ok(false, 'WKB claiming 4 billion points'); } catch (e) { ok(/more points than|cut short/.test(e.message), 'WKB claiming 4 billion points — "' + e.message + '"'); }
  let deep = new Uint8Array(0); for (let i = 0; i < 12; i++) { const h = new Uint8Array(9); h[0] = 1; new DataView(h.buffer).setUint32(1, 7, true); new DataView(h.buffer).setUint32(5, 1, true); const n = new Uint8Array(deep.length + 9); n.set(h); n.set(deep, 9); deep = n; }
  try { GG.readWkb(deep); ok(false, 'WKB nested 12 deep'); } catch (e) { ok(/nested too deeply|cut short/.test(e.message), 'WKB collections nested 12 deep — "' + e.message + '"'); }
  // GeoJSON junk
  await throwsWith(async () => GJ.readGeoJSON('{"type":"FeatureCollection","features":', 'x'), /not valid JSON/, 'GeoJSON cut short');
  await throwsWith(async () => GJ.readGeoJSON('{"type":"Nope"}', 'x'), /not GeoJSON/, 'JSON that is not GeoJSON');
  const jj = GJ.readGeoJSON(JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: ['1', 2] } }, { type: 'Feature', geometry: { type: 'LineString', coordinates: [[0, 0]] } }, { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [0, 0]]] } }, null, 5, { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2] }, properties: { n: Infinity } }] }), 'j');
  ok(jj.layers.length === 1 && jj.layers[0].features.length === 1 && jj.notes.some((n) => /could not be read/.test(n)), 'GeoJSON: strings as numbers, one-point lines, 3-point rings and junk features left out, counted');
  ok(GR.gisFileKind('x.json', '{"type": "FeatureCollection"') === 'geojson' && GR.gisFileKind('x.json', '{"format":"civilcraft-project"') === null, 'a .json is GeoJSON only when its head says so (a project file is not)');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
