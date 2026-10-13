#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-grids.mjs — CivilCraft 0.4 V11: grid shift files (crs.js loadGrid / defFor / gridStatus, project.js
 * crsGrids), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-grids.mjs [--build dev|x.y] [--verbose]
 *
 * Fixtures: tools/civilcraft-test/fixtures/grids/us_noaa_nadcon5_nad27_nad83_1986_conus.tif and us_noaa_conus.tif (NOAA,
 * public domain, as cdn.proj.org serves them), and an NTv2 file written here (one 1° × 1° subgrid, shifts known by hand).
 * Second reader: PROJ through pyproj (tools/civilcraft-test/venv) on the same files: a NAD27 Texas system's points to
 * WGS 84 longitude/latitude must agree to 1e-8° (about a millimeter); without the grid the rough +towgs84 lands meters
 * away. Also: what is refused, +datum=NAD27 keeps its ellipsoid, inside/outside, the project file.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/grids');
const PY = path.join(REPO, 'tools/civilcraft-test/venv/bin/python');
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
const C = await mod('crs.js');
C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-grids-'));
const haveProj = fs.existsSync(PY);
const proj = (cases) => JSON.parse(execFileSync(PY, ['-c', `
import json, sys, pyproj
out = []
for d, pts in json.load(sys.stdin):
    t = pyproj.Transformer.from_crs(pyproj.CRS.from_proj4(d), pyproj.CRS.from_proj4('+proj=longlat +datum=WGS84 +no_defs'), always_xy=True)
    out.append([list(t.transform(x, y)) for x, y in pts])
print(json.dumps(out))
`], { input: JSON.stringify(cases), encoding: 'utf8' }));

// ------------------------------------------------------------------ an NTv2 file, by hand
function ntv2() {
  const rec = (k, v) => { const b = Buffer.alloc(16); b.write(k.padEnd(8), 0, 'latin1'); if (typeof v === 'string') b.write(v.padEnd(8), 8, 'latin1'); else if (Number.isInteger(v.int)) b.writeInt32LE(v.int, 8); else b.writeDoubleLE(v, 8); return b; };
  const S = 30 * 3600, N = 31 * 3600, E = 97 * 3600, W = 98 * 3600, inc = 900, rows = (N - S) / inc + 1, cols = (W - E) / inc + 1;
  const head = [rec('NUM_OREC', { int: 11 }), rec('NUM_SREC', { int: 11 }), rec('NUM_FILE', { int: 1 }), rec('GS_TYPE', 'SECONDS'), rec('VERSION', 'NTv2.0'), rec('SYSTEM_F', 'NAD27'), rec('SYSTEM_T', 'NAD83'),
    rec('MAJOR_F', 6378206.4), rec('MINOR_F', 6356583.8), rec('MAJOR_T', 6378137), rec('MINOR_T', 6356752.314)];
  const sub = [rec('SUB_NAME', 'TEST'), rec('PARENT', 'NONE'), rec('CREATED', '20261012'), rec('UPDATED', '20261012'), rec('S_LAT', S), rec('N_LAT', N), rec('E_LONG', E), rec('W_LONG', W), rec('LAT_INC', inc), rec('LONG_INC', inc), rec('GS_COUNT', { int: rows * cols })];
  const nodes = Buffer.alloc(rows * cols * 16);
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {   // south to north, east to west
    const k = (i * cols + j) * 16;
    nodes.writeFloatLE(0.5 + 0.1 * i, k); nodes.writeFloatLE(-1.2 + 0.05 * j, k + 4); nodes.writeFloatLE(0.01, k + 8); nodes.writeFloatLE(0.01, k + 12);
  }
  return Buffer.concat([...head, ...sub, nodes, rec('END', { int: 0 })]);
}

section('reading grids');
const nadcon5 = new Uint8Array(fs.readFileSync(path.join(FIX, 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif')));
const g5 = await C.loadGrid('us_noaa_nadcon5_nad27_nad83_1986_conus.tif', nadcon5);
ok(g5.kind === 'geotiff' && g5.subgrids === 1, 'NADCON5 CONUS: a GeoTIFF grid, one subgrid');
if (haveProj) {
  // rasterio (GDAL) reads the same file: a point-registered grid, so the nodes run half a cell inside its bounds
  const b = JSON.parse(execFileSync(PY, ['-c', "import rasterio, json, sys\nwith rasterio.open(sys.argv[1]) as r: print(json.dumps([r.bounds.left + r.res[0] / 2, r.bounds.bottom + r.res[1] / 2, r.bounds.right - r.res[0] / 2, r.bounds.top - r.res[1] / 2]))", path.join(FIX, 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif')], { encoding: 'utf8' }));
  ok(g5.extent.every((v, i) => Math.abs(v - b[i]) < 1e-9), 'its nodes cover ' + b.join(', ') + ' (as GDAL reads it)');
} else ok(Math.abs(g5.extent[0] + 125) < 1e-9 && Math.abs(g5.extent[3] - 50) < 1e-9, 'its nodes from −125° to 50°');
const gc = await C.loadGrid('us_noaa_conus.tif', fs.readFileSync(path.join(FIX, 'us_noaa_conus.tif')));
ok(gc.kind === 'geotiff', 'NADCON CONUS too');
const gsb = ntv2(), gsbFile = path.join(OUT, 'test.gsb');
fs.writeFileSync(gsbFile, gsb);
const gn = await C.loadGrid('test.gsb', new Uint8Array(gsb));
ok(gn.kind === 'ntv2', 'the NTv2 file');
near(gn.extent[0], -98, 1e-9, 'NTv2 extent west −98° (positive-west in the file)'); near(gn.extent[2], -97, 1e-9, 'east −97°'); near(gn.extent[1], 30, 1e-9, 'south 30°'); near(gn.extent[3], 31, 1e-9, 'north 31°');
let err = '';
try { await C.loadGrid('x.tif', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9])); } catch (e) { err = e.message; }
ok(/not a grid shift file/.test(err), 'a file that is neither: refused (' + err + ')');
ok(C.gridsLoaded().length === 3 && C.gridInfo('test.gsb') && !C.gridInfo('nope'), 'three grids loaded, found by name');

section('definitions with a grid');
const tx = C.byCode(32039);   // NAD27 / Texas Central
ok(tx && /\+towgs84=-10,158,187/.test(tx.proj4), 'NAD27 / Texas Central (EPSG:32039) carries the rough +towgs84');
const crs = { ...C.crsFromEntry(tx), grid: 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif' };
ok(C.defFor(crs) === tx.proj4.replace(/\s*\+towgs84=\S+/, '') + ' +nadgrids=@us_noaa_nadcon5_nad27_nad83_1986_conus.tif', 'defFor: +towgs84 replaced by +nadgrids=@grid');
ok(C.defFor({ ...crs, grid: 'not-loaded.tif' }) === tx.proj4, 'a grid not loaded: the definition as it was');
ok(C.defFor({ proj4: '+proj=longlat +datum=NAD27 +no_defs', grid: 'test.gsb' }) === '+proj=longlat +ellps=clrk66 +no_defs +nadgrids=@test.gsb', '+datum=NAD27 keeps its ellipsoid (clrk66)');
const gb = C.byCode(27700);
ok(gb && C.defFor({ ...C.crsFromEntry(gb), grid: 'test.gsb' }).endsWith(' +nadgrids=@test.gsb') && !/towgs84/.test(C.defFor({ ...C.crsFromEntry(gb), grid: 'test.gsb' })), 'any datum: British National Grid swaps its +towgs84 for the grid too (OSTN15 would go here)');
// Texas Central coordinates in US survey feet round the middle of the zone
const pts = [[2000000, 700000], [2100000, 650000], [1950000, 760000], [2050000, 720000]];
const rough = pts.map(([x, y]) => C.frame(C.crsFromEntry(tx)).toLonLat(x, y));
const fine = pts.map(([x, y]) => C.frame(crs).toLonLat(x, y));
const diffM = fine.map((f, i) => Math.hypot((f[0] - rough[i][0]) * 111320 * Math.cos(f[1] * Math.PI / 180), (f[1] - rough[i][1]) * 110540));
ok(diffM.every((d) => d > 0.5 && d < 40), 'the grid moves lat/long by ' + diffM.map((d) => d.toFixed(1)).join(', ') + ' m from the rough shift');
const st = C.gridStatus(crs, fine[0][0], fine[0][1]);
ok(st.loaded && st.inside === true && C.gridStatus(crs, 10, 50).inside === false && C.gridStatus({ ...crs, grid: 'zz' }).loaded === false && C.gridStatus(C.crsFromEntry(tx)) === null, 'gridStatus: inside, outside, not loaded, none');

section('against PROJ (pyproj), the same files');
if (!haveProj) console.log('  note tools/civilcraft-test/venv missing: PROJ checks skipped');
else {
  const tiffDef = C.defFor(crs).replace('+nadgrids=@', '+nadgrids=' + FIX + '/');
  const nadconCrs = { ...crs, grid: 'us_noaa_conus.tif' }, nadconDef = C.defFor(nadconCrs).replace('+nadgrids=@', '+nadgrids=' + FIX + '/');
  const geo = [[-97.5, 30.5], [-97.9, 30.1], [-97.2, 30.9]];
  const gsbDef = '+proj=longlat +ellps=clrk66 +nadgrids=' + gsbFile + ' +no_defs';
  const ref = proj([[tiffDef, pts], [nadconDef, pts], [gsbDef, geo]]);
  const worst = (a, b) => Math.max(...a.map((p, i) => Math.max(Math.abs(p[0] - b[i][0]), Math.abs(p[1] - b[i][1]))));
  const w5 = worst(fine, ref[0]);
  ok(w5 < 1e-8, `NADCON5: lat/long within 1e-8° of PROJ (worst ${w5.toExponential(2)}°)`);
  const wc = worst(pts.map(([x, y]) => C.frame(nadconCrs).toLonLat(x, y)), ref[1]);
  ok(wc < 1e-8, `NADCON: within 1e-8° (worst ${wc.toExponential(2)}°)`);
  const ours = geo.map(([x, y]) => C.transformer({ proj4: '+proj=longlat +ellps=clrk66 +no_defs', grid: 'test.gsb' }, null)(x, y));
  const wn = worst(ours, ref[2]);
  ok(wn < 1e-8, `the NTv2 file: within 1e-8° (worst ${wn.toExponential(2)}°)`);
  // by hand at a node: 30.5° N, 97.5° W is row 2, column 2: lat +0.7", lon −1.1" (positive west) → 1.1" east
  near(ours[0][1], 30.5 + 0.7 / 3600, 1e-9, 'at a node: latitude + 0.7"'); near(ours[0][0], -97.5 + 1.1 / 3600, 1e-9, 'longitude 1.1" east');
}

section('the project file');
{
  const p = new PJ.Project();
  p.change('crs', (s) => { s.units = 'ft'; s.crs = crs; });
  p.crsGrids.set(crs.grid, nadcon5);
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(Object.keys(json.crsGrids).join() === crs.grid && json.crs.grid === crs.grid, 'the grid is saved with the project, named by its system');
  const r = PJ.Project.fromJSON(json);
  ok(r.project.state.crs.grid === crs.grid && r.project.crsGrids.get(crs.grid)?.length === nadcon5.length && !r.notes.length, 'and read back, byte for byte');
  ok(Buffer.compare(Buffer.from(r.project.crsGrids.get(crs.grid)), Buffer.from(nadcon5)) === 0, 'the same bytes');
  const gone = PJ.Project.fromJSON({ ...json, crsGrids: {} });
  ok(gone.project.state.crs.grid === crs.grid && gone.notes.some((n) => /is not in the project file/.test(n)), 'without its bytes: named, and said');
  const bad = PJ.Project.fromJSON({ ...json, crs: { ...json.crs, grid: '../etc/passwd' } });
  ok(!('grid' in bad.project.state.crs), 'a grid name with a path in it is dropped');
  const noCrs = PJ.Project.fromJSON({ ...json, crs: null });
  ok(noCrs.project.crsGrids.size === 0, 'no system: no grid kept');
}

fs.rmSync(OUT, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
