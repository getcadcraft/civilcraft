#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-kml.mjs — CivilCraft 0.4 V6: KML and KMZ in and out (kml.js, gis-read.js, gis-export.js), DOM-free, in
 * Node. Second reader and writer: GDAL's KML driver through pyogrio in tools/civilcraft-test/venv (gisvec.py read / kml).
 *
 *   node bin/test-civilcraft-kml.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * Reading: folders → layers per kind, Point / LineString / LinearRing / Polygon with holes / MultiGeometry / gx:Track,
 * name, description (markup removed), ExtendedData Data and SchemaData, numbers, 0 heights read as 2D, bad coordinates,
 * entities, a KMZ; a KML written by GDAL. Import into a project in a state plane system (heights metres → feet). Writing:
 * the project's points, alignment and pads as KML and KMZ — read back by GDAL (counts, coordinates to 1e-7°, heights in
 * metres, attributes) and by us; refused without a coordinate system; untrusted input.
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
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-kml') : fs.mkdtempSync('/tmp/civilcraft-kml-');
fs.mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const CRS = await mod('crs.js');
CRS.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
CRS.setWktCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-wkt.json'), 'utf8')));
const KML = await mod('kml.js');
const GR = await mod('gis-read.js');
const GX = await mod('gis-export.js');
const GL = await mod('gis-layers.js');
const PJ = await mod('project.js');
const PTS = await mod('points.js');
const ZIP = await mod('zipfile.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const python = path.join(TOOLS, 'venv/bin/python');
const haveGdal = fs.existsSync(python);
const gdal = (...a) => JSON.parse(execFileSync(python, ['-I', path.join(TOOLS, 'gisvec.py'), ...a], { encoding: 'utf8', maxBuffer: 1 << 26 }));

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
<Document><name>Survey</name>
 <Placemark><name>Loose &amp; free</name><Point><coordinates>-97.7,30.2,0</coordinates></Point></Placemark>
 <Folder><name>Utilities</name>
  <Placemark><name>MH-1</name><description><![CDATA[<b>Manhole</b> 1]]></description>
   <ExtendedData><Data name="Rim"><value>151.25</value></Data><Data name="Kind"><value>storm</value></Data></ExtendedData>
   <Point><coordinates>-97.7431,30.2672,151.25</coordinates></Point></Placemark>
  <Placemark><name>MH-2</name><ExtendedData><Data name="Rim"><value>n/a</value></Data></ExtendedData><Point><coordinates>-97.7429,30.2673,150</coordinates></Point></Placemark>
  <Placemark><name>Main</name><LineString><coordinates>
    -97.7431,30.2672,151 -97.7425,30.2675,152 -97.7420,30.2672,150.5
  </coordinates></LineString></Placemark>
  <Placemark><name>Both</name><MultiGeometry>
    <LineString><coordinates>-97.74,30.26 -97.741,30.261</coordinates></LineString>
    <Polygon><outerBoundaryIs><LinearRing><coordinates>-97.74,30.26 -97.739,30.26 -97.739,30.261 -97.74,30.26</coordinates></LinearRing></outerBoundaryIs></Polygon>
  </MultiGeometry></Placemark>
  <Placemark><name>Track</name><gx:Track><when>2026-10-12T10:00:00Z</when><gx:coord>-97.74 30.26 150</gx:coord><gx:coord>-97.741 30.262 151</gx:coord></gx:Track></Placemark>
  <Placemark><name>Broken</name><Point><coordinates>500,30.2</coordinates></Point></Placemark>
 </Folder>
 <Folder><name>Lots</name>
  <Placemark><name>Lot 7</name><ExtendedData><SchemaData schemaUrl="#s"><SimpleData name="Area">1234.5</SimpleData></SchemaData></ExtendedData>
   <Polygon><outerBoundaryIs><LinearRing><coordinates>0,0 1,0 1,1 0,1 0,0</coordinates></LinearRing></outerBoundaryIs>
    <innerBoundaryIs><LinearRing><coordinates>0.2,0.2 0.2,0.4 0.4,0.4 0.4,0.2 0.2,0.2</coordinates></LinearRing></innerBoundaryIs></Polygon></Placemark>
 </Folder>
</Document></kml>`;

section('reading KML');
{
  const r = KML.readKml(SAMPLE, 'site');
  const by = Object.fromEntries(r.layers.map((l) => [l.name, l]));
  ok(Object.keys(by).sort().join('|') === 'Lots|Survey|Utilities (lines)|Utilities (points)|Utilities (polygons)', 'layers: ' + Object.keys(by).sort().join(' | '));
  const pts = by['Utilities (points)'];
  ok(pts.features.length === 2 && pts.hasZ && pts.features[0].g.c[2] === 151.25, 'points with heights');
  ok(pts.features[0].p.description === 'Manhole 1' && pts.features[0].p.Kind === 'storm', 'description without markup (CDATA), ExtendedData values');
  ok(pts.fields.find((f) => f.name === 'Rim').type === 'text' && pts.features[0].p.Rim === '151.25', 'a field with a non-number ("n/a") stays text');
  ok(by.Survey.features[0].p.name === 'Loose & free' && !by.Survey.hasZ, 'a placemark outside any folder: the document’s layer; &amp; decoded; height 0 read as 2D');
  const ln = by['Utilities (lines)'];
  ok(ln.features.length === 3 && ln.features.some((f) => f.p.name === 'Track' && f.g.c[0].length === 2 && f.g.c[0][1][2] === 151), 'lines: LineString, the MultiGeometry part, the gx:Track (with heights)');
  ok(by['Utilities (polygons)'].features.length === 1, 'the MultiGeometry polygon part in the polygons layer');
  const lot = by.Lots.features[0];
  ok(lot.g.t === 'pg' && lot.g.c[0].length === 2 && lot.p.Area === 1234.5 && by.Lots.fields[1].type === 'number', 'a polygon with a hole; SchemaData Area as a number');
  ok(r.notes.some((n) => /1 placemark geometry had coordinates/.test(n)) && r.notes.some((n) => /MultiGeometry/.test(n)), 'notes: the broken point, the split MultiGeometry');
  let threw = false; try { KML.readKml('<kml><Placemark>', 'x'); } catch (e) { threw = /not a KML file/.test(e.message); }
  ok(threw, 'broken XML: refused with the reason');
  ok(KML.readKml('<!DOCTYPE x [<!ENTITY a "boom">]><kml><Placemark><name>&a;</name><Point><coordinates>1,2</coordinates></Point></Placemark></kml>', 'e').layers[0].features[0].p.name === '&a;', 'a DTD entity is not expanded');
  ok(KML.readKml(SAMPLE, 'site', { maxFeatures: 3 }).notes.some((n) => /more than 3 placemarks/.test(n)), 'capped at maxFeatures, said');
}

section('KMZ and the import into a project');
{
  const kmz = await ZIP.zip([{ name: 'doc.kml', data: SAMPLE }]);
  const rr = await GR.readGisFiles([{ name: 'site.kmz', data: kmz }]);
  ok(rr.sources.length === 1 && rr.sources[0].format === 'KML' && rr.sources[0].src.kind === 'wgs84' && rr.sources[0].layers.length === 5, 'a KMZ: unzipped, read as KML in WGS 84');
  const p = new PJ.Project();
  const tx = CRS.crsFromEntry(CRS.byCode(2277));
  p.change('crs', (s) => { s.crs = tx; });
  const r = await GR.readGisFiles([{ name: 'site.kml', data: new TextEncoder().encode(SAMPLE) }]);
  const imp = GR.importInto(p, r.sources, {});
  const layers = GL.gisOf(p).layers;
  ok(layers.length >= 4, 'imported into a Texas Central (ftUS) project: ' + layers.length + ' layers');
  const mh = GL.featuresOf(p, layers.find((l) => l.name === 'Utilities (points)').id)[0].g.c;
  const back = CRS.transformer(tx, null)(mh[0], mh[1]);
  near(back[0], -97.7431, 1e-8, 'longitude back'); near(back[1], 30.2672, 1e-8, 'latitude back');
  near(mh[2], 151.25 * 3937 / 1200, 1e-6, 'height 151.25 m → US survey feet');
  ok(imp.notes.join(' ').includes('elevations converted from metres to feet'), 'said: elevations converted from metres to feet');
}

section('writing KML and KMZ');
{
  const p = new PJ.Project();
  p.setPoints(PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8')).points, 'site');
  const tx = CRS.crsFromEntry(CRS.byCode(2277));
  ok(!!tx, 'EPSG:2277 found');
  let threw = false;
  try { await GX.exportProject(p, ['points'], 'kml', { stem: 'x' }); } catch (e) { threw = /needs the project's coordinate system/.test(e.message); }
  ok(threw, 'without a coordinate system: refused, said');
  p.change('crs', (s) => { s.crs = tx; });
  p.change('a', (s) => { const b = p.eg().surface.bounds; s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: b.minX + 20, y: b.minY + 50 }, { x: b.maxX - 20, y: b.minY + 50 }], pvis: [], corridor: null, sampling: null }); });
  const kinds = GX.exportKinds(p).map((k) => k.key);
  const r = await GX.exportProject(p, kinds.filter((k) => ['points', 'alignments', 'boundary'].includes(k)), 'kml', { stem: 'site' });
  ok(r.name === 'site.kml' && /^<\?xml/.test(new TextDecoder().decode(r.bytes)), 'site.kml written');
  const f = path.join(OUT, 'site.kml');
  fs.writeFileSync(f, r.bytes);
  const own = KML.readKml(new TextDecoder().decode(r.bytes), 'site');
  const ownPts = own.layers.find((l) => /points/.test(l.name) && l.geom === 'pt');
  ok(ownPts && ownPts.features.length === p.points.length, 'read back by us: every survey point (' + ownPts?.features.length + ')');
  const pt0 = p.points[0], ll = CRS.transformer(tx, null)(pt0.x, pt0.y);
  const f0 = ownPts.features.find((q) => String(q.p.P) === String(pt0.n));
  ok(f0 && Math.abs(f0.g.c[0] - ll[0]) < 1e-8 && Math.abs(f0.g.c[1] - ll[1]) < 1e-8 && Math.abs(f0.g.c[2] - pt0.z * 1200 / 3937) < 1e-3, 'a point: lon/lat to 1e-8°, height in metres');
  if (haveGdal) {
    const g = gdal('read', f);
    const gp = g.find((l) => l.name === 'survey_points');
    ok(gp && gp.count === p.points.length, 'GDAL reads the points folder: ' + gp?.count + ' features');
    const gf = gp?.features.find((q) => String(q.p.P) === String(pt0.n));
    ok(gf && Math.abs(gf.g[1][0] - ll[0]) < 1e-7 && Math.abs(gf.g[1][1] - ll[1]) < 1e-7 && Math.abs(gf.g[1][2] - pt0.z * 1200 / 3937) < 1e-3, 'GDAL: the same point, lon/lat and metres' + (gf ? '' : ' (' + JSON.stringify(gp?.features[0]).slice(0, 200) + ')'));
    ok(g.some((l) => l.name === 'alignments' && l.count === 1) && g.some((l) => l.name === 'boundary'), 'GDAL: the alignment and the surface edge folders (' + g.map((l) => l.name + ':' + l.count).join(' ') + ')');
    // a KML written by GDAL, read by us
    gdal_fixture: {
      const gk = path.join(OUT, 'gdal.kml');
      execFileSync(python, ['-I', path.join(TOOLS, 'gisvec.py'), 'kml', gk]);
      const rg = KML.readKml(fs.readFileSync(gk, 'utf8'), 'gdal');
      const L = Object.fromEntries(rg.layers.map((l) => [l.name, l]));
      ok(L.Trees?.features.length === 3 && L.Trees.hasZ && L.Trees.features[2].g.c[2] === 152 && L.Trees.features[0].p.Height === 10.5, 'GDAL’s KML: Trees (3 points with heights, Height numbers)');
      ok(L.Roads?.features[0].g.c[0].length === 3 && L.Lots?.features[0].g.c[0].length === 2 && L.Lots.features[0].p.name === 'Lot 1', 'Roads (a line), Lots (a polygon with its hole)');
      break gdal_fixture;
    }
  } else console.log('  note tools/civilcraft-test/venv missing: GDAL checks skipped');
  const z = await GX.exportProject(p, ['points'], 'kmz', { stem: 'site' });
  const ent = ZIP.listZip(z.bytes);
  ok(z.name === 'site.kmz' && ent.length === 1 && ent[0].name === 'doc.kml', 'site.kmz: one doc.kml inside');
  const again = await GR.readGisFiles([{ name: 'site.kmz', data: z.bytes }]);
  ok(again.sources[0]?.layers[0]?.features.length === p.points.length, 'and it opens again');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
