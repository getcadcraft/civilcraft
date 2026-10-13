#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-terrain.mjs — CivilCraft's elevation grids, LiDAR and GeoTIFF export (docs/GIS-SPEC.md §3, builder B),
 * the DOM-free modules (raster.js, las.js, thin.js, terrain.js, geotiff-write.js) driven in Node as the page drives them.
 *
 *   node bin/test-civilcraft-terrain.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * Fixtures are made by GDAL (rasterio) and laspy (+ lazrs for LAZ) in tools/civilcraft-test/venv
 * (tools/civilcraft-test/terrain_fixtures.py): GeoTIFF float32 tiled/DEFLATE + stripped/LZW + pixel-is-point, int16 with
 * scale/offset and nodata, a state plane US-survey-feet DEM, a geographic DEM, an RGB image, an ESRI ASCII grid + .prj;
 * LAS formats 0, 1, 3 (1.2, GeoKeys) and 6, 7, 8 (1.4, WKT, an EVLR, class 40), with and without a coordinate system, and
 * LAZ (formats 3 and 6, written by lazrs). Checked against what rasterio / laspy read from the same files (values exactly),
 * thinning by hand, reprojection against PROJ (pyproj) to 1 mm, DEM → grid surface (= the grid at the nodes, planar
 * between), the GeoTIFF export read back by rasterio (EPSG, transform, nodata, units, values vs elevationAt to 1e-4) and by
 * our own reader, and untrusted files (truncated, wrong offsets, absurd sizes, bad VLRs) — each refused with a plain
 * message, never a hang. --keep leaves the files in tmp/civilcraft-terrain-test/.
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
const VENDOR = path.join(REPO, 'public_html/assets/vendor');
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-terrain-test') : fs.mkdtempSync('/tmp/civilcraft-terrain-');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const PY = path.join(TOOLS, 'venv/bin/python');
if (!fs.existsSync(PY)) { console.log('tools/civilcraft-test/venv is missing (rasterio, laspy, lazrs, pyproj): python3 -m venv tools/civilcraft-test/venv && tools/civilcraft-test/venv/bin/pip install rasterio laspy lazrs pyproj'); process.exit(1); }

const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
// geotiff.js reads a File through FileReader (the page has it; Node has Blob but not FileReader)
globalThis.FileReader = class {
  readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onload?.(); }, (e) => { this.error = e; this.onerror?.(e); }); }
  abort() { this.onabort?.(new Error('aborted')); }
};
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const CRS = await mod('crs.js');
CRS.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
const R = await mod('raster.js');
const L = await mod('las.js');
const TH = await mod('thin.js');
const T = await mod('terrain.js');
const GW = await mod('geotiff-write.js');
const TIN = await mod('tin.js');
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const py = (...a) => JSON.parse(execFileSync(PY, [path.join(TOOLS, 'terrain_fixtures.py'), ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
const file = async (p, name = path.basename(p)) => { const b = await fs.openAsBlob(p); Object.defineProperty(b, 'name', { value: name }); return b; };
const bytesFile = (bytes, name) => { const b = new Blob([bytes]); Object.defineProperty(b, 'name', { value: name }); return b; };
const FX = path.join(OUT, 'fixtures');
async function refuses(p, m, ms = 10000) {
  let err = null;
  const t = new Promise((_, rej) => setTimeout(() => rej(new Error('timed out (a hang)')), ms));
  try { await Promise.race([p, t]); } catch (e) { err = e; }
  ok(err && !/timed out/.test(err.message) && typeof err.message === 'string' && err.message.length < 400, m + (err ? ' — "' + String(err.message).slice(0, 110) + '"' : ' — no error'));
  return err;
}

// ---------------------------------------------------------------------------
section('fixtures (GDAL via rasterio, laspy + lazrs)');
const truth = py('make', FX);
ok(truth.rasters.length === 7 && truth.las.length === 8, 'fixtures written: ' + truth.rasters.length + ' grids, ' + truth.las.length + ' LAS/LAZ, 1 RGB image');

// ---------------------------------------------------------------------------
section('elevation grids vs rasterio');
const gtOf = (t) => [t[2], t[0], t[1], t[5], t[3], t[4]];   // rasterio Affine (a b c d e f) → GDAL order
for (const t of truth.rasters) {
  const files = [await file(path.join(FX, t.file))];
  if (/\.asc$/.test(t.file)) files.push(await file(path.join(FX, t.file.replace(/\.asc$/, '.prj'))));
  const src = await R.openRaster(files);
  ok(src.width === t.width && src.height === t.height, `${t.file}: ${src.width} × ${src.height}`);
  const g = gtOf(t.transform);
  ok(src.gt.every((v, i) => Math.abs(v - g[i]) <= 1e-9 * Math.max(1, Math.abs(g[i]))), `${t.file}: geotransform = rasterio's (${src.gt.join(', ')})` + (t.area_or_point === 'Point' ? ' — pixel-is-point shifted half a cell' : ''));
  ok((src.crs?.code ?? null) === t.epsg, `${t.file}: EPSG ${src.crs?.code} (rasterio ${t.epsg})`);
  ok(src.nodata === t.nodata || (src.nodata == null && t.nodata == null), `${t.file}: nodata ${src.nodata}`);
  if (t.scale !== 1 || t.offset !== 0) ok(src.scale === t.scale && src.offset === t.offset, `${t.file}: scale ${src.scale}, offset ${src.offset}`);
  if (t.units) ok(src.zUnit === T.unitFromName(t.units), `${t.file}: elevation unit "${t.units}" → ${src.zUnit}`);
  const grid = await R.readWindow(src, {});
  let same = 0, nanOk = 0, bad = null;
  for (let k = 0; k < t.values.length; k++) {
    const want = t.values[k] === null ? NaN : t.values[k] * t.scale + t.offset, got = grid.z[k];
    if (Number.isNaN(want)) { if (Number.isNaN(got)) nanOk++; else bad ??= k; }
    else if (got === want || Math.abs(got - want) <= 1e-12 * Math.abs(want)) same++;
    else bad ??= k;
  }
  ok(bad === null, `${t.file}: every value = rasterio's (${same} values, ${nanOk} nodata)` + (bad !== null ? ` — first difference at ${bad}: ${grid.z[bad]} vs ${t.values[bad]}` : ''));
  // windows and steps: the same cells as rasterio's array
  for (const [c0, r0, c1, r1, step] of [[3, 2, 17, 11, 1], [0, 0, t.width, t.height, 3], [5, 7, 39, 29, 4], [10, 10, 11, 11, 1]]) {
    const w = await R.readWindow(src, { c0, r0, c1, r1, step });
    let good = w.nx === Math.ceil((c1 - c0) / step) && w.ny === Math.ceil((r1 - r0) / step);
    for (let j = 0; j < w.ny && good; j++) for (let i = 0; i < w.nx; i++) {
      const k = (r0 + j * step) * t.width + c0 + i * step, want = t.values[k] === null ? NaN : t.values[k] * t.scale + t.offset;
      const got = w.z[j * w.nx + i];
      if (!(Number.isNaN(want) ? Number.isNaN(got) : Math.abs(got - want) <= 1e-12 * Math.abs(want))) { good = false; break; }
    }
    ok(good, `${t.file}: window [${c0}, ${r0}, ${c1}, ${r1}] every ${step} = rasterio's cells`);
  }
}
{
  const src = await R.openRaster([await file(path.join(FX, 'utm-asc.asc'))]);
  ok(!src.crs && /no \.prj/.test(src.crsNote), 'ASCII grid without its .prj: no system, and it says why');
  const src2 = await R.openRaster([await file(path.join(FX, 'utm-f32-tiled-deflate.tif'))]);
  const s = await R.sampleStats(src2);
  const vals = truth.rasters[0].values.filter((v) => v !== null);
  ok(s.min === Math.min(...vals) && s.max === Math.max(...vals), `z range from a sample: ${s.min.toFixed(3)} to ${s.max.toFixed(3)}`);
}
{
  const p = await R.probeTiff(await file(path.join(FX, 'rgb.tif'))), q = await R.probeTiff(await file(path.join(FX, 'utm-i16-scale.tif')));
  ok(p.image && p.bands === 3 && !q.image, 'probeTiff: RGB = a picture (for map layers), int16 = an elevation grid');
  const im = await R.readGeoImage(await file(path.join(FX, 'rgb.tif')));
  const t = truth.rgb;
  ok(im.width === t.width && im.height === t.height && im.crs?.code === 32614, `readGeoImage: ${im.width} × ${im.height}, EPSG ${im.crs?.code}`);
  ok(t.pixels.every((px, i) => im.rgba[4 * i] === px[0] && im.rgba[4 * i + 1] === px[1] && im.rgba[4 * i + 2] === px[2] && im.rgba[4 * i + 3] === 255), 'readGeoImage: the first 50 pixels = rasterio\'s, alpha 255');
  ok(im.affine.every((v, i) => v === gtOf(t.transform)[i]) && im.bbox.join() === [620000, 3349700, 620400, 3350000].join(), 'readGeoImage: affine and bbox');
}

// ---------------------------------------------------------------------------
section('LAS / LAZ vs laspy');
globalThis.window = globalThis;   // laz-perf's web build checks it is in a page
const LP = L.lazPerf({ wasmBinary: fs.readFileSync(path.join(VENDOR, 'laz-perf/current/laz-perf.wasm')) });
await LP;
delete globalThis.window;
for (const t of truth.las) {
  const f = await file(path.join(FX, t.file));
  const h = await L.readLasHeader(f);
  ok(h.version === t.version && h.format === t.format && h.count === t.count && h.compressed === t.laz, `${t.file}: LAS ${h.version}, format ${h.format}, ${h.count} points` + (h.compressed ? ', compressed' : ''));
  ok(h.scale.every((v, i) => v === t.scale[i]) && h.offset.every((v, i) => v === t.offset[i]) && h.min.every((v, i) => Math.abs(v - t.min[i]) < 1e-9) && h.max.every((v, i) => Math.abs(v - t.max[i]) < 1e-9), `${t.file}: scale, offset, bounds = laspy's`);
  ok((h.crs?.code ?? null) === t.epsg, `${t.file}: EPSG ${h.crs?.code ?? null} (laspy ${t.epsg}; ${h.vlrs.some((v) => v.id === 2112) ? 'WKT' : h.vlrs.some((v) => v.id === 34735) ? 'GeoKeys' : 'none'})`);
  const first = [], cls = {};
  let sumz = 0, n = 0;
  await L.scanPoints(f, h, (x, y, z, c) => { if (first.length < 200) first.push([x, y, z, c]); cls[c] = (cls[c] || 0) + 1; sumz += z; n++; }, { lazPerf: LP });
  ok(n === t.count, `${t.file}: ${n} points read`);
  ok(JSON.stringify(Object.fromEntries(Object.entries(cls).map(([k, v]) => [k, v]))) === JSON.stringify(t.classes), `${t.file}: classes ${JSON.stringify(cls)} = laspy's`);
  ok(first.every((p, i) => p[0] === t.xyz[i][0] && p[1] === t.xyz[i][1] && p[2] === t.xyz[i][2] && p[3] === t.cls[i]), `${t.file}: the first 200 points (x, y, z, class) = laspy's exactly`);
  near(sumz, t.sumz, 1e-6, `${t.file}: sum of z`);
}
{
  const h = await L.readLasHeader(await file(path.join(FX, 'f7-14-evlr.las')));
  ok(h.evlrs.length === 1 && h.evlrs[0].user === 'CivilCraftTest' && h.evlrs[0].length === 70000, 'LAS 1.4 EVLR read (user, length)');
  const h3 = await L.readLasHeader(await file(path.join(FX, 'f3-12-nocrs.las')));
  ok(!h3.crs && /does not say/.test(h3.crsNote), 'no coordinate system: said so');
}

// ---------------------------------------------------------------------------
section('thinning (worked by hand)');
{
  // a 2 × 2 grid of 1-unit cells from (0,0); points by hand
  const P = [[0.2, 0.2, 5, 2], [0.5, 0.5, 7, 2], [0.9, 0.1, 3, 2], [1.4, 0.6, 9, 2], [1.6, 0.4, 1, 5], [0.5, 1.5, 4, 2], [1.5, 1.5, 6, 6]];
  const run = (opt) => { const t = new TH.Thinner({ cell: 1, origin: [0, 0], ...opt }); for (const p of P) t.add(...p); return t; };
  const lo = run({ mode: 'lowest' }).points();
  ok(lo.length === 4 && lo[0].z === 3 && lo[1].z === 1 && lo[2].z === 4 && lo[3].z === 6, 'lowest: 3, 1, 4, 6 (cells in first-use order)');
  const ne = run({ mode: 'nearest' }).points();
  ok(ne[0].z === 7 && ne[1].z === 9 && ne[1].x === 1.4, 'nearest the center: (0.5, 0.5) z 7 and (1.4, 0.6) z 9');
  const av = run({ mode: 'average' }).points();
  near(av[0].z, 5, 1e-12, 'average z of cell (0,0)'); near(av[0].x, (0.2 + 0.5 + 0.9) / 3, 1e-12, 'average x of cell (0,0)'); near(av[1].z, 5, 1e-12, 'average z of cell (1,0)');
  const cl = run({ mode: 'lowest', classes: new Set([2]) });
  ok(cl.count === 3 && cl.filtered === 2 && cl.points()[1].z === 9, 'class filter (ground only): 3 cells, 2 points left out, cell (1,0) keeps z 9');
  const rg = run({ mode: 'lowest', region: { minX: 0, minY: 0, maxX: 1, maxY: 1 } });
  ok(rg.count === 1 && rg.outside === 4, 'region clip: 1 cell, 4 outside');
  const cap = run({ mode: 'lowest', max: 2 });
  ok(cap.count === 2 && cap.capped && cap.dropped === 2, 'max-count cap: 2 cells kept, capped, 2 dropped');
  ok(TH.gridStep(30, 10) === 3 && TH.gridStep(5, 10) === 1 && TH.gridStep(24, 10) === 2 && TH.gridStep(26, 10) === 3, 'grid step: 30/10 → 3, 5/10 → 1, 24/10 → 2, 26/10 → 3');
  const cov = new TH.Coverage({ minX: 0, minY: 0, maxX: 100, maxY: 100 }, 10);
  for (let i = 0; i < 100; i++) for (let j = 0; j < 100; j++) cov.add(i + 0.5, j + 0.5, (i + j) % 2 ? 2 : 5);
  const e1 = cov.estimate({ spacing: 1 }), e2 = cov.estimate({ spacing: 5, classes: new Set([2]) }), e3 = cov.estimate({ spacing: 1, box: { minX: 0, minY: 0, maxX: 50, maxY: 50 } });
  ok(e1.points === 10000 && e2.inArea === 5000 && Math.abs(e2.points - 500) <= 100 && e3.inArea === 2500, `coverage estimates: ${e1.points}, ${e2.points} (≈ 400 + 1 per coarse cell), ${e3.inArea} in a quarter`);
  let threw = false; try { new TH.Thinner({ cell: 0 }); } catch { threw = true; }
  ok(threw, 'a zero spacing is refused');
}
{
  // LiDAR: thin the fixture by hand in Node and compare with a direct count of occupied cells
  const t = truth.las.find((x) => x.file === 'f1-12.las');
  const f = await file(path.join(FX, t.file)), h = await L.readLasHeader(f);
  const pts = [];
  await L.scanPoints(f, h, (x, y, z, c) => pts.push([x, y, z, c]));
  const th = new TH.Thinner({ cell: 5, mode: 'lowest', origin: [620000, 3349000], classes: new Set([2]) });
  for (const p of pts) th.add(...p);
  const cells = new Map();
  for (const [x, y, z, c] of pts) if (c === 2) { const k = Math.floor((x - 620000) / 5) + ',' + Math.floor((y - 3349000) / 5); cells.set(k, Math.min(cells.get(k) ?? Infinity, z)); }
  const got = th.points();
  ok(got.length === cells.size && got.every((p) => cells.get(Math.floor((p.x - 620000) / 5) + ',' + Math.floor((p.y - 3349000) / 5)) === p.z), `LiDAR ground thinned to 5 m: ${got.length} cells, each the lowest ground point`);
}

// ---------------------------------------------------------------------------
section('reprojection vs PROJ (1 mm)');
const sp = CRS.crsFromEntry(CRS.byCode(2277));
{
  const src = await R.openRaster([await file(path.join(FX, 'utm-f32-tiled-deflate.tif'))]);
  const grid = await R.readWindow(src, { step: 3 });
  const tr = T.toProject(src.crs, sp);
  const nodes = [];
  for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) nodes.push(T.nodeXY(src, grid.c0 + i * grid.step, grid.r0 + j * grid.step));
  const want = py('proj', JSON.stringify({ from: 'EPSG:32614', to: 'EPSG:2277', pts: nodes }));
  let worst = 0;
  nodes.forEach((n, i) => { const [x, y] = tr.fn(...n); worst = Math.max(worst, Math.hypot(x - want[i][0], y - want[i][1])); });
  ok(!tr.identity && worst * 0.3048 < 0.001, `UTM 14N DEM nodes → Texas Central (ftUS): worst ${(worst * 0.3048 * 1000).toFixed(3)} mm from PROJ (${nodes.length} nodes)`);
  // the DEM as survey points through the same transform, z meters → US survey feet
  const pts = T.gridPoints(grid, src, { fn: tr.fn, zf: T.zFactor('m', 'ftUS'), desc: 'DEM', start: 7 });
  const valid = Array.from(grid.z).filter((z) => !Number.isNaN(z)).length;
  ok(pts.length === valid && pts[0].n === '7' && pts[0].d === 'DEM', `${pts.length} survey points (nodata left out), numbered from 7, description DEM`);
  const k = grid.z.findIndex((z) => !Number.isNaN(z));
  near(pts[0].z, grid.z[k] / (1200 / 3937), 1e-9, 'z meters → US survey feet');
  // ground/local coordinates: the project frame's fromGrid is applied after the system change
  const loc = { ...sp, local: { scale: 1.00012, rotation: 0, from: [3100000, 10000000], to: [3100000, 10000000] } };
  const tl = T.toProject(src.crs, loc), f = CRS.frame(loc);
  let worstL = 0;
  nodes.forEach((n, i) => { const [x, y] = tl.fn(...n); const g = f.toGrid(x, y); worstL = Math.max(worstL, Math.hypot(g[0] - want[i][0], g[1] - want[i][1])); });
  ok(worstL * 0.3048 < 0.001, `ground coordinates (combined factor 1.00012): toGrid(result) is PROJ's to ${(worstL * 0.3048 * 1000).toFixed(3)} mm`);
}
{
  const src = await R.openRaster([await file(path.join(FX, 'geo-wgs84.tif'))]);
  ok(src.crs?.unit === 'deg' && T.crsFromGeoKeys({ GTModelTypeGeoKey: 2, GeographicTypeGeoKey: 4326 }).crs.code === 4326, 'geographic DEM: WGS 84 latitude/longitude');
  ok(!!CRS.crsProblem(src.crs, 'ft'), 'a geographic system is refused as the project\'s (the import asks for one)');
  const grid = await R.readWindow(src, { step: 5 });
  const tr = T.toProject(src.crs, sp);
  const nodes = [];
  for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) nodes.push(T.nodeXY(src, grid.c0 + i * grid.step, grid.r0 + j * grid.step));
  const want = py('proj', JSON.stringify({ from: 'EPSG:4326', to: 'EPSG:2277', pts: nodes }));
  let worst = 0;
  nodes.forEach((n, i) => { const [x, y] = tr.fn(...n); worst = Math.max(worst, Math.hypot(x - want[i][0], y - want[i][1])); });
  ok(worst * 0.3048 < 0.001, `WGS 84 DEM nodes → Texas Central (ftUS): worst ${(worst * 0.3048 * 1000).toFixed(3)} mm from PROJ`);
  const bx = T.boxThrough({ minX: 3115000, minY: 10070000, maxX: 3116000, maxY: 10071000 }, T.toSource(src.crs, sp));
  ok(bx.minX > -98 && bx.maxX < -97 && bx.minY > 30 && bx.maxY < 31, 'an area in the plan → the file\'s box in degrees');
}
{
  const src = await R.openRaster([await file(path.join(FX, 'sp-ftus.tif'))]);
  ok(T.toProject(src.crs, sp).identity, 'state plane DEM into a project in the same system: no conversion');
  const w = T.gridWindow(src, { minX: src.gt[0] + 100, minY: src.gt[3] - 500, maxX: src.gt[0] + 400, maxY: src.gt[3] - 200 });
  ok(w && w.c0 === 4 && w.c1 === 16 && w.r0 === 8 && w.r1 === 20, `gridWindow: cells whose centers fall in the box: ${JSON.stringify(w)}`);
  ok(T.gridWindow(src, { minX: 0, minY: 0, maxX: 1, maxY: 1 }) === null, 'gridWindow: an area off the grid → null');
}
ok(T.unitFromName('metre') === 'm' && T.unitFromName('US survey foot') === 'ftUS' && T.unitFromName('ft') === 'ft' && T.unitFromName('furlong') === null, 'unit names');
ok(T.zFactor('m', 'ft') === 1 / 0.3048 && T.zFactor('ftUS', 'ftUS') === 1, 'zFactor');
ok(T.crsFromGeoKeys({ GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32767 }).crs === null && /describes its own/.test(T.crsFromGeoKeys({ GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 32767 }).note), 'user-defined GeoKeys: no system, said so');
ok(/not in CivilCraft/.test(T.crsFromGeoKeys({ GTModelTypeGeoKey: 1, ProjectedCSTypeGeoKey: 4 }).note || ''), 'a code that is not in the list (EPSG:4): no system, said so');

// ---------------------------------------------------------------------------
section('DEM → grid surface');
let demSurface = null, demTin = null;
{
  const src = await R.openRaster([await file(path.join(FX, 'utm-f32-tiled-deflate.tif'))]);
  const grid = await R.readWindow(src, { step: 1 });
  const tr = T.toProject(src.crs, null);
  demTin = T.gridTin(grid, src, { fn: tr.fn, zf: 1 });
  const nodata = Array.from(grid.z).filter(Number.isNaN).length;
  ok(demTin.pts.length === grid.nx * grid.ny - nodata, `${demTin.pts.length} grid points (${nodata} nodata cells left out)`);
  ok(demTin.cells === (grid.nx - 1) * (grid.ny - 1) && demTin.faces.length + demTin.skipped === 2 * demTin.cells, `${demTin.faces.length} triangles, two per cell; ${demTin.skipped} left out at nodata corners`);
  const { surface, report } = TIN.surfaceFromFaces(demTin);
  demSurface = surface;
  ok(surface && !report.errors.length && !report.notes.length, 'surfaceFromFaces takes the grid TIN as it is');
  let worst = 0;
  for (let j = 0; j < grid.ny; j++) for (let i = 0; i < grid.nx; i++) {
    const z = grid.z[j * grid.nx + i];
    if (Number.isNaN(z)) continue;
    const [x, y] = T.nodeXY(src, i, j);
    const e = surface.elevationAt(x, y);
    if (e === null) { worst = Infinity; continue; }
    worst = Math.max(worst, Math.abs(e - z));
  }
  ok(worst <= 1e-9, `the surface equals the grid at every node (worst ${worst.toExponential(1)})`);
  // between nodes: the plane of the triangle (SW–NE diagonal)
  const [i, j] = [20, 15], zz = (a, b) => grid.z[b * grid.nx + a];
  const [x0, y0] = T.nodeXY(src, i, j + 1);   // SW corner of the cell between rows j, j+1
  const zSW = zz(i, j + 1), zSE = zz(i + 1, j + 1), zNE = zz(i + 1, j), zNW = zz(i, j);
  const u = 0.7, w = 0.2;   // below the diagonal: triangle SW-SE-NE: z = zSW + u (zSE − zSW) + w (zNE − zSE)
  near(surface.elevationAt(x0 + u * 10, y0 + w * 10), zSW + u * (zSE - zSW) + w * (zNE - zSE), 1e-9, 'between nodes (below the diagonal): planar in triangle SW-SE-NE');
  const u2 = 0.2, w2 = 0.7;  // above: triangle SW-NE-NW: z = zSW + u (zNE − zNW) + w (zNW − zSW)
  near(surface.elevationAt(x0 + u2 * 10, y0 + w2 * 10), zSW + u2 * (zNE - zNW) + w2 * (zNW - zSW), 1e-9, 'between nodes (above the diagonal): planar in triangle SW-NE-NW');
  ok(surface.elevationAt(620015, 3349985) === null, 'no surface over the nodata corner');
  // into a project, saved and opened again
  const p = new PJ.Project();
  p.state.units = 'm';
  p.state.surface.tin = { pts: demTin.pts, faces: demTin.faces, from: 'grid' };
  p.cache.clear(); p.touch('change');
  ok(p.eg().surface?.nT === demTin.faces.length, 'the project\'s existing ground is the grid TIN');
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(back.state.surface.tin?.from === 'grid' && back.eg().surface.nT === demTin.faces.length, 'saved and opened again: still the grid TIN (marked as from a grid)');
}
{
  // points into a project: one undo step that also sets the project's coordinate system
  const p = new PJ.Project();
  p.setPoints([{ n: '1', x: 3115000, y: 10070000, z: 400, d: 'TOPO' }, { n: '20', x: 3115100, y: 10070100, z: 401, d: 'TOPO' }]);
  const start = T.nextNumber(p.points);
  ok(start === 21, 'new points are numbered after the highest (21)');
  p.editPoints('Import x.tif', (old, s) => { s.crs = { ...sp }; return old.concat([{ n: String(start), x: 3115050, y: 10070050, z: 400.5, d: 'DEM' }]); });
  ok(p.points.length === 3 && p.state.crs?.code === 2277 && p.state.surface.groups.DEM === 'points', 'imported: 3 points, project system set, DEM group used for the surface');
  p.undo();
  ok(p.points.length === 2 && p.state.crs === null, 'one undo removes the points and the coordinate system together');
  p.redo();
  ok(p.points.length === 3 && p.state.crs?.code === 2277, 'redo brings both back');
}

// ---------------------------------------------------------------------------
section('GeoTIFF export, read back by rasterio and by our reader');
{
  // a surface in state plane feet: the fixture DEM, as points in the project, triangulated
  const src = await R.openRaster([await file(path.join(FX, 'sp-ftus.tif'))]);
  const grid = await R.readWindow(src, { step: 2 });
  const pts = T.gridPoints(grid, src, { fn: (x, y) => [x, y], zf: 1 });
  const { surface } = TIN.buildSurface({ points: pts });
  const avg = GW.averageEdge(surface);
  ok(avg > 50 && avg < 70, `average triangle edge ${avg.toFixed(2)} ft (grid points 50 ft apart)`);
  const cases = [
    { name: 'tiled-deflate.tif', tiled: true, compress: 'deflate', cell: 20, crs: sp },
    { name: 'strip-none.tif', tiled: false, compress: 'none', cell: 33.3, crs: sp },
    { name: 'strip-deflate-nocode.tif', tiled: false, compress: 'deflate', cell: 25, crs: { ...sp, code: null } },
    { name: 'ground-local.tif', tiled: true, compress: 'deflate', cell: 20, crs: { ...sp, local: { scale: 0.99993, rotation: 0.5, from: [3115000, 10069000], to: [3115020, 10069010] } } },
  ];
  for (const c of cases) {
    const f = CRS.frame(c.crs);
    const g = await GW.surfaceGrid(surface, { cell: c.cell, toGrid: f.toGrid, fromGrid: f.fromGrid });
    const bytes = await GW.writeDemTiff({ ...g, epsg: c.crs.code, citation: c.crs.name, xyUnit: c.crs.unit, zUnit: 'ftUS', description: 'Existing ground elevations in US survey feet (project units).', tiled: c.tiled, compress: c.compress });
    const out = path.join(OUT, c.name);
    fs.writeFileSync(out, bytes);
    // cells: every 7th row and column, and the corners
    const cells = [];
    for (let r = 0; r < g.height; r += 7) for (let k = 0; k < g.width; k += 7) cells.push([r, k]);
    cells.push([g.height - 1, g.width - 1]);
    const rr = py('tif', out, JSON.stringify(cells));
    ok(rr.width === g.width && rr.height === g.height && rr.dtype === 'float32', `${c.name}: rasterio reads ${rr.width} × ${rr.height} float32`);
    ok(rr.epsg === (c.crs.code ?? null), `${c.name}: CRS ${rr.epsg === null ? 'none (no EPSG code: none written)' : 'EPSG:' + rr.epsg}`);
    const wantT = [g.gt[1], 0, g.gt[0], 0, g.gt[5], g.gt[3]];
    ok(rr.transform.every((v, i) => Math.abs(v - wantT[i]) < 1e-9), `${c.name}: transform ${rr.transform.join(', ')}`);
    ok(rr.nodata === -3.4028234663852886e38, `${c.name}: nodata −3.4028235e38`);
    ok(rr.units === 'US survey foot' && /US survey feet/.test(rr.tags.TIFFTAG_IMAGEDESCRIPTION || ''), `${c.name}: band unit "${rr.units}" and the description name the elevation unit`);
    ok(rr.compression === (c.compress === 'deflate' ? 'DEFLATE' : null) && (c.tiled ? rr.block[0] === 256 : rr.block[0] === 16), `${c.name}: ${c.tiled ? 'tiles 256 × 256' : 'strips of 16 rows'}, ${c.compress}`);
    let worst = 0, nd = 0, mismatchNd = 0;
    cells.forEach(([r, k], i) => {
      const [x, y] = f.fromGrid(g.gt[0] + (k + 0.5) * c.cell, g.gt[3] - (r + 0.5) * c.cell);
      const e = surface.elevationAt(x, y), got = rr.values[i];
      if (e === null) { nd++; if (got !== -3.4028234663852886e38) mismatchNd++; } else worst = Math.max(worst, Math.abs(got - e));
    });
    ok(worst <= 1e-4 && !mismatchNd, `${c.name}: ${cells.length - nd} values = the surface's elevationAt to 1e-4 (worst ${worst.toExponential(1)}), ${nd} nodata outside it`);
    const back = await R.openRaster([await file(out)]);
    const bg = await R.readWindow(back, { step: 7 });
    ok(back.crs?.code === (c.crs.code ?? undefined) || (!c.crs.code && !back.crs), `${c.name}: our reader reads it back (${back.crs?.name || 'no system'})`);
    ok(back.zUnit === 'ftUS' && bg.z.every((v, i) => (Number.isNaN(v) ? rr.values[i] === -3.4028234663852886e38 : Math.abs(v - rr.values[i]) < 1e-9)), `${c.name}: our reader = rasterio, nodata as no data, unit US survey feet`);
  }
  await refuses(GW.surfaceGrid(surface, { cell: 0.01 }), 'a grid of more than 25 million cells is refused');
}

// ---------------------------------------------------------------------------
section('untrusted files');
{
  const good = fs.readFileSync(path.join(FX, 'utm-f32-strip-lzw.tif'));
  const read = async (bytes, name = 'bad.tif') => { const s = await R.openRaster([bytesFile(bytes, name)]); return R.readWindow(s, {}); };
  await refuses(read(good.subarray(0, 600)), 'GeoTIFF cut short');
  const wrongIfd = Buffer.from(good); wrongIfd.writeUInt32LE(good.length + 1000, 4);
  await refuses(read(wrongIfd), 'GeoTIFF with its first IFD offset past the end');
  const notTiff = Buffer.from('this is not a tiff at all');
  await refuses(read(notTiff), 'not a TIFF');
  // absurd width: find the ImageWidth entry (tag 256) in the IFD and make it 4 billion
  const huge = Buffer.from(good), ifd = huge.readUInt32LE(4), n = huge.readUInt16LE(ifd);
  for (let i = 0; i < n; i++) { const e = ifd + 2 + 12 * i; if (huge.readUInt16LE(e) === 256) { huge.writeUInt16LE(4, e + 2); huge.writeUInt32LE(4000000000, e + 8); } }
  await refuses(read(huge), 'GeoTIFF claiming 4 billion columns');
  const noGeo = Buffer.from(good);
  for (let i = 0; i < n; i++) { const e = ifd + 2 + 12 * i; const tag = noGeo.readUInt16LE(e); if (tag === 33922 || tag === 33550) noGeo.writeUInt16LE(65000 + i, e); }
  await refuses(read(noGeo), 'GeoTIFF without georeferencing');
  await refuses(R.openRaster([bytesFile(new Uint8Array(0), 'empty.tif')]), 'an empty .tif');
  // ASCII grids
  const asc = fs.readFileSync(path.join(FX, 'utm-asc.asc'), 'utf8');
  await refuses(read(new TextEncoder().encode('ncols 0\nnrows 5\nxllcorner 0\nyllcorner 0\ncellsize 1\n1 2 3'), 'zero.asc'), 'ASCII grid with ncols 0');
  await refuses(read(new TextEncoder().encode('ncols 4000000\nnrows 4000000\nxllcorner 0\nyllcorner 0\ncellsize 1\n1 2 3'), 'big.asc'), 'ASCII grid claiming 4 million × 4 million');
  await refuses(read(new TextEncoder().encode(asc.slice(0, Math.floor(asc.length / 2))), 'half.asc'), 'ASCII grid cut in half (fewer values than the header says)');
  await refuses(read(new TextEncoder().encode('hello\n1 2 3'), 'junk.asc'), 'ASCII grid with no header');
  // LAS
  const las = fs.readFileSync(path.join(FX, 'f6-14.las'));
  const hdr = async (bytes, name = 'bad.las') => { const f = bytesFile(bytes, name); const h = await L.readLasHeader(f); let k = 0; await L.scanPoints(f, h, () => k++, { lazPerf: LP }); return { h, k }; };
  const cut = await hdr(las.subarray(0, las.length - 3000 * 30 / 2));
  ok(cut.h.available < cut.h.count && cut.k === cut.h.available && /shorter than its header/.test(cut.h.notes.join(' ')), `LAS cut short: ${cut.k} of ${cut.h.count} points read, said so`);
  await refuses(hdr(Buffer.from('LASX' + 'x'.repeat(400))), 'no LASF signature');
  const offs = Buffer.from(las); offs.writeUInt32LE(las.length + 10, 96);
  await refuses(hdr(offs), 'offset to the points past the end');
  const rl = Buffer.from(las); rl.writeUInt16LE(10, 105);
  await refuses(hdr(rl), 'record length too short for the format');
  const nv = Buffer.from(las); nv.writeUInt32LE(4000000000, 100);
  await refuses(hdr(nv), 'four billion VLRs claimed');
  const fmt = Buffer.from(las); fmt.writeUInt8(14, 104);
  await refuses(hdr(fmt), 'point format 14');
  const sc = Buffer.from(las); sc.writeDoubleLE(0, 131);
  await refuses(hdr(sc), 'scale 0');
  const bigVlr = Buffer.from(las); bigVlr.writeUInt16LE(65000, 375 + 20);
  const bv = await hdr(bigVlr);
  ok(/run(s)? past/.test(bv.h.notes.join(' ')), 'a VLR longer than the space before the points: skipped, said so');
  const badWkt = Buffer.from(las); badWkt.fill(0x41, 375 + 54, 375 + 54 + 40);
  const bw = await hdr(badWkt);
  ok(!bw.h.crs && !!bw.h.crsNote, 'a WKT VLR full of junk: no system, said so (' + String(bw.h.crsNote).slice(0, 60) + ')');
  const evl = Buffer.from(fs.readFileSync(path.join(FX, 'f7-14-evlr.las'))); evl.writeUInt32LE(4000000000, 235); evl.writeUInt32LE(0, 239);
  const ev = await hdr(evl);
  ok(/extended/.test(ev.h.notes.join(' ')) && ev.k === 3000, 'EVLR start past the end: skipped, said so, points still read');
  await refuses(L.readLasHeader(bytesFile(new Uint8Array(100), 'tiny.las')), 'a 100-byte .las');
  // LAZ cut short: refused or read partly with a note — never a hang
  const laz = fs.readFileSync(path.join(FX, 'f6-14.laz'));
  let lazMsg = '';
  try { const r = await Promise.race([hdr(laz.subarray(0, Math.floor(laz.length * 0.6))), new Promise((_, j) => setTimeout(() => j(new Error('timed out')), 15000))]); lazMsg = 'read ' + r.k + ' points; ' + r.h.notes.join(' '); } catch (e) { lazMsg = 'refused: ' + e.message; }
  ok(!/timed out/.test(lazMsg), 'LAZ cut short: ' + lazMsg.slice(0, 140));
  const lazNoVlr = Buffer.from(laz); for (let i = 0; i < 16; i++) lazNoVlr[375 + 2 + i] = 0x5a;
  const lz = Buffer.from(lazNoVlr);
  // whichever VLR held "laszip encoded", rename every VLR's user id: the file claims compression with no LASzip record
  let o = 375; const nV = lz.readUInt32LE(100);
  for (let i = 0; i < nV && o + 54 < lz.length; i++) { for (let k = 0; k < 16; k++) lz[o + 2 + k] = 0x5a; o += 54 + lz.readUInt16LE(o + 20); }
  await refuses(hdr(lz), 'LAZ with no LASzip record');
  // over the size limit
  const big = { name: 'big.las', size: 300 * 1048576, slice: () => new Blob([]) };
  await refuses(L.readLasHeader(big), 'a 300 MB file is refused before reading');
  await refuses(R.openRaster([{ name: 'big.tif', size: 300 * 1048576, slice: () => new Blob([]) }]), 'a 300 MB grid is refused before reading');
  // cancelling a read
  const ac = new AbortController(); ac.abort();
  const src = await R.openRaster([await file(path.join(FX, 'utm-f32-strip-lzw.tif'))]);
  const e1 = await refuses(R.readWindow(src, { signal: ac.signal }), 'a cancelled grid read stops');
  const lf = await file(path.join(FX, 'f6-14.las')), lh = await L.readLasHeader(lf);
  const e2 = await refuses(L.scanPoints(lf, lh, () => {}, { signal: ac.signal }), 'a cancelled LAS read stops');
  ok(e1?.name === 'AbortError' && e2?.name === 'AbortError', 'cancelling says AbortError (the dialog says "nothing was imported")');
}

// ---------------------------------------------------------------------------
console.log(`\n${pass} passed, ${fail} failed` + (KEEP ? ' — files in ' + OUT : ''));
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
