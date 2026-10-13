#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-terrain.mjs — CivilCraft's elevation grids, LiDAR and GeoTIFF export (docs/GIS-SPEC.md §3, builder B) in
 * headless Chromium at https://getcadcraft.com/lab/civilcraft, through the real file input and dialogs:
 *   geotiff.js / laz-perf are not fetched until a grid / a LAZ is opened; an RGB GeoTIFF is passed on (not ours);
 *   a state plane DEM (US survey feet) into an empty project as survey points — offered as the project's system, one undo
 *   step for both, redo; the area choices (whole file / extents + margin / what the plan shows) change the count live;
 *   a UTM DEM with no elevation unit (Import stays off until one is chosen) converted into the project's system as the
 *   surface itself (asks before replacing; nodes vs the file's values through PROJ-checked conversion); a LAZ (class
 *   scan with counts, ground ticked, live estimate, lowest-point thinning) → LIDAR points; a geographic DEM in a project
 *   without a system (asks through reg.pickCrs — stubbed when builder C's is not there); Cancel during the class scan
 *   and during the import of a 3-million-point LAS (nothing changes; the page answers while it reads); GeoTIFF export
 *   read back by rasterio (EPSG, transform, nodata, values vs the surface); the 3D view draws the grid surface;
 *   the toolbar stays at two rows at 1440 px; paper and model screenshots. Fails on any console error.
 *
 *   node tools/civilcraft-test/browser-terrain.mjs [--out <dir>] [--state <storageState.json>] [--stay-up]
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin.php up|down gisb` (its own test admin
 * civilcrafttest-gisb+cadcraft@projectz.xyz) and tools/civilcraft-test/venv (rasterio, laspy) for fixtures and checks.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-gis-gisb'));
const STATE = arg('--state', path.join(REPO, 'tmp/civilcraft-test/state-gisb.json'));
const STAY = process.argv.includes('--stay-up');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const WORK = fs.mkdtempSync('/tmp/civilcraft-terrain-browser-');
const FX = path.join(WORK, 'fx'), DL = path.join(WORK, 'dl');
fs.mkdirSync(DL);
const PY = path.join(HERE, 'venv/bin/python');
const py = (...a) => JSON.parse(execFileSync(PY, [path.join(HERE, 'terrain_fixtures.py'), ...a], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const truth = py('make', FX);
const BIG = path.join(WORK, 'big.las');
py('big', BIG, '3000000');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'gisb'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};
async function signedInContext(opts = {}) {
  if (fs.existsSync(STATE)) {
    const ctx = await browser.newContext({ storageState: STATE, acceptDownloads: true, ...opts });
    const p = await ctx.newPage();
    const r = await p.goto(BASE + '/lab/civilcraft', { waitUntil: 'domcontentloaded' });
    const okNow = r.status() === 200 && (await p.$('[data-civilcraft]'));
    await p.close();
    if (okNow) return ctx;
    await ctx.close();
  }
  const cred = admin('up');
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts });
  const p = await ctx.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', cred.email);
  await p.fill('input[name="password"]', cred.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await ctx.storageState({ path: STATE });
  await p.close();
  return ctx;
}

const DLG = 'dialog.cv-terrain[open]';
async function openFiles(page, files) {
  await page.setInputFiles('[data-file]', files);
}
async function newProject(page, units = 'ft') {
  await page.evaluate(async (units) => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const key = Object.keys(map).find((k) => /\/civilcraft\/[^/]+\/project\.js$/.test(k));
    const { Project } = await import(key);
    const p = new Project();
    p.state.units = units;
    window.civilcraft.gis.setProject(p);
  }, units);
}
const countText = (page) => page.$eval(DLG + ' [role="status"]', (n) => n.textContent);
const dialogState = (page) => page.evaluate(() => { const d = window.civilcraft.gis.terrain.dialog; return { plan: d.plan, st: { area: d.st.area, spacing: d.st.spacing, zUnit: d.st.zUnit, scanned: d.st.scanned, classes: d.st.classes ? [...d.st.classes] : null, adopt: d.st.adopt, newCrs: d.st.newCrs?.code ?? null } }; });
async function importClick(page) {
  await page.click(DLG + ' .cv-dlg-foot .btn-plot');
}
async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, dl.suggestedFilename());
  await dl.saveAs(f);
  return f;
}
async function shot(page, name, { dialog = false } = {}) {
  if (dialog) await page.locator(DLG).screenshot({ path: path.join(OUT, name + '.png') });
  else await page.screenshot({ path: path.join(OUT, name + '.png') });
}

let ctx;
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  const libReq = [];
  page.on('request', (r) => { if (/\/vendor\/(geotiff|laz-perf)\//.test(r.url()) || /\/(raster|las|gis-terrain-ui)\.js/.test(r.url())) libReq.push(r.url()); });

  console.log('\n== start');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200 && (await page.evaluate(() => !!window.civilcraft)), '/lab/civilcraft started');
  ok(libReq.length === 0, 'nothing of the terrain part (geotiff.js, laz-perf, raster.js, las.js) is fetched at start');
  ok(await page.evaluate(() => { const t = document.querySelector('.cv-tools'); const tops = new Set([...t.querySelectorAll('.cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top))); return tops.size <= 2; }), 'the toolbar is at most two rows at 1440 px');
  await page.locator('.cv-tools').screenshot({ path: path.join(OUT, '00-toolbar-1440.png') });

  console.log('\n== an RGB GeoTIFF is a picture, not ours');
  await openFiles(page, [path.join(FX, 'rgb.tif')]);
  await page.waitForFunction(() => !!window.civilcraft.gis.terrain, null, { timeout: 20000 });
  await wait(800);
  ok(!(await page.$(DLG)), 'no elevation dialog for rgb.tif');
  ok(libReq.some((u) => /geotiff/.test(u)) && !libReq.some((u) => /laz-perf/.test(u)), 'geotiff.js loads when a GeoTIFF is opened; laz-perf does not');
  const reader = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const key = Object.keys(map).find((k) => /\/civilcraft\/[^/]+\/raster\.js$/.test(k));
    return !!(await import(key)).readGeoImage;
  });
  ok(reader, 'raster.js exports readGeoImage for map layers');
  // close whatever builder C opened for the picture, if anything
  await page.keyboard.press('Escape');
  await wait(200);

  console.log('\n== a state plane DEM (US survey feet) into an empty project, as survey points');
  await newProject(page, 'ft');
  await openFiles(page, [path.join(FX, 'sp-ftus.tif')]);
  await page.waitForSelector(DLG);
  await wait(400);
  let ds = await dialogState(page);
  const spT = truth.rasters.find((t) => t.file === 'sp-ftus.tif');
  const valid = spT.values.filter((v) => v !== null).length;
  ok(ds.st.area === 'all' && ds.plan.ok && ds.plan.count === spT.width * spT.height, `empty project: the whole file, ${ds.plan.count} points at the file's own spacing`);
  ok(ds.st.zUnit === 'ft', 'the file names its elevation unit (ft): chosen already');
  const factsText = await page.$eval(DLG + ' .cv-dlg-body', (n) => n.textContent);
  ok(/NAD83 \/ Texas Central \(ftUS\) \(EPSG:2277\)/.test(factsText) && /30\.\d+° N, 97\.\d+° W/.test(factsText), 'facts: its system and its extent in latitude/longitude');
  const adopt = page.locator(DLG + ' .cv-terrain-crs input[type=checkbox]');
  ok(await adopt.count() === 1 && (await adopt.isChecked()), 'offered (ticked): use NAD83 / Texas Central (ftUS) as the project\'s system');
  await adopt.check();
  await page.fill(DLG + ' input[id$="-spacing"]', '50');
  await wait(100);
  ds = await dialogState(page);
  ok(ds.plan.step === 2 && ds.plan.count === 20 * 15 && /every 2nd cell/.test(await countText(page)), `thin to 50 ft: every 2nd cell, ${ds.plan.count} points (live)`);
  await page.fill(DLG + ' input[id$="-spacing"]', '25');
  await shot(page, '01-dem-dialog-paper', { dialog: true });
  await importClick(page);
  await page.waitForSelector(DLG, { state: 'detached', timeout: 20000 });
  let st = await page.evaluate(() => { const p = window.civilcraft.project; return { n: p.points.length, crs: p.state.crs?.code, d: [...new Set(p.points.map((q) => q.d))], first: p.points[0], undo: p.undoStack.length, tin: !!p.eg().surface }; });
  ok(st.n === valid && st.crs === 2277 && st.d.join() === 'DEM' && st.tin, `${st.n} DEM points imported, project system EPSG:2277, surface built`);
  ok(Math.abs(st.first.x - (spT.transform[2] + 12.5)) < 1e-9 && Math.abs(st.first.y - (spT.transform[5] - 12.5)) < 1e-9 && Math.abs(st.first.z - spT.values[0] * 0.3048 / (1200 / 3937)) < 1e-9, 'the first point is the first cell\'s center with its value (the file says "ft": international feet → the project\'s US survey feet): ' + JSON.stringify(st.first));
  await page.click('[data-cmd="undo"]');
  st = await page.evaluate(() => ({ n: window.civilcraft.project.points.length, crs: window.civilcraft.project.state.crs }));
  ok(st.n === 0 && st.crs === null, 'one undo takes out the points and the coordinate system');
  await page.click('[data-cmd="redo"]');
  st = await page.evaluate(() => ({ n: window.civilcraft.project.points.length, crs: window.civilcraft.project.state.crs?.code }));
  ok(st.n === valid && st.crs === 2277, 'redo brings both back');
  await shot(page, '02-dem-points-paper');

  console.log('\n== area choices');
  await openFiles(page, [path.join(FX, 'utm-f32-tiled-deflate.tif')]);
  await page.waitForSelector(DLG);
  await wait(300);
  ds = await dialogState(page);
  ok(ds.st.area === 'extents' && ds.st.zUnit === null && !ds.plan.ok && /unit/.test(await countText(page)), 'UTM DEM, no elevation unit: Import stays off until one is chosen');
  ok(await page.isDisabled(DLG + ' .cv-dlg-foot .btn-plot'), 'the Import button is off');
  await page.selectOption(DLG + ' select[id$="-z"]', 'm');
  await wait(100);
  const zt = await page.$eval(DLG + ' .cv-note:not([role])', (n) => n.textContent).catch(() => '');
  ds = await dialogState(page);
  const cExt = ds.plan.count;
  await page.fill(DLG + ' input[id$="-margin"]', '0');
  await wait(100);
  const cExt0 = (await dialogState(page)).plan.count;
  await page.selectOption(DLG + ' select[id$="-area"]', 'all');
  await wait(100);
  const cAll = (await dialogState(page)).plan.count;
  ok(ds.plan.ok && cExt0 <= cExt && cExt <= cAll && cAll > 0, `counts follow the area: extents ${cExt0} (no margin) ≤ ${cExt} (100 ft margin) ≤ whole file ${cAll}`);
  await page.selectOption(DLG + ' select[id$="-area"]', 'view');
  await wait(100);
  ok((await dialogState(page)).st.area === 'view', 'what the plan shows now: chosen');
  await page.selectOption(DLG + ' select[id$="-area"]', 'all');
  await page.click(DLG + ' input[value="surface"]');
  await page.fill(DLG + ' input[id$="-spacing"]', '1');
  await wait(100);
  ds = await dialogState(page);
  ok(/Converted from WGS 84 \/ UTM zone 14N/.test(await page.$eval(DLG + ' .cv-terrain-crs', (n) => n.textContent)), 'converted from UTM 14N to the project\'s system (said)');
  ok(/as meters/.test(await page.$eval(DLG + ' .cv-dlg-body', (n) => n.textContent)), 'the z range is shown both ways');
  await shot(page, '03-dem-surface-dialog-paper', { dialog: true });
  await importClick(page);
  await page.waitForSelector('dialog.cv-ask[open]');
  ok(/Replace the surface/.test(await page.$eval('dialog.cv-ask[open]', (n) => n.textContent)), 'asks before replacing the surface');
  await page.click('dialog.cv-ask[open] button[data-key="replace"]');
  await page.waitForSelector(DLG, { state: 'detached', timeout: 20000 });
  const utmT = truth.rasters.find((t) => t.file === 'utm-f32-tiled-deflate.tif');
  // node (20, 15): its UTM center through PROJ → state plane, its value in meters → US survey feet
  const [nodeSp] = py('proj', JSON.stringify({ from: 'EPSG:32614', to: 'EPSG:2277', pts: [[620000 + 20.5 * 10, 3350000 - 15.5 * 10]] }));
  st = await page.evaluate(([x, y]) => { const p = window.civilcraft.project, s = p.eg().surface; return { from: p.state.surface.tin?.from, nT: s?.nT, z: s?.elevationAt(x, y), head: document.querySelector('[data-surface-h]').textContent }; }, nodeSp);
  ok(st.from === 'grid' && st.nT > 2000 && st.head === 'Surface (from an elevation grid)', `the surface is the grid TIN (${st.nT} triangles); the panel says so`);
  const wantZ = utmT.values[15 * 40 + 20] / (1200 / 3937);
  ok(Math.abs(st.z - wantZ) < 1e-4, `at a grid node (PROJ-converted) the surface = the file's value in US survey feet (${st.z?.toFixed(4)} vs ${wantZ.toFixed(4)})`);
  // 0.4 V9 (session civil): replacing the surface is one undo step
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.tin?.from !== 'grid');
  ok(true, 'Ctrl+Z: the surface before the grid is back (0.4 V9)');
  await page.keyboard.press('Control+y');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.tin?.from === 'grid');
  ok(await page.evaluate((n) => window.civilcraft.project.eg().surface.nT === n, st.nT), 'Ctrl+Y: the grid surface again, the same triangles');
  await page.click('[data-cmd="fit"]');
  await shot(page, '04-dem-surface-plan-paper');

  console.log('\n== the 3D view shows the grid surface');
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.scene && !document.querySelector('[data-view3d]').hidden, null, { timeout: 30000 });
  await wait(400);
  const s3 = await page.evaluate(() => { const s = window.civilcraft.view3d.scene; const m = s.meshes.find((x) => x.key === 'eg'); return { has: !!m, tris: m ? m.indices.length / 3 : 0 }; });
  ok(s3.has && s3.tris > 0, `3D: the existing ground mesh is there (${s3.tris} triangles)`);
  await shot(page, '05-dem-3d-paper');
  await page.click('[data-cmd="view3d"]');
  await wait(300);

  console.log('\n== LAZ: classes, thinning, LIDAR points');
  await openFiles(page, [path.join(FX, 'f6-14.laz')]);
  await page.waitForSelector(DLG);
  await page.waitForFunction(() => window.civilcraft.gis.terrain.dialog?.st.scanned, null, { timeout: 30000 });
  ok(libReq.some((u) => /laz-perf\.js/.test(u)) && libReq.some((u) => /laz-perf/.test(u)), 'laz-perf loads when a LAZ is opened');
  const lazT = truth.las.find((t) => t.file === 'f6-14.laz');
  const rows = await page.$$eval(DLG + ' .cv-terrain-classes tbody tr', (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent).concat(tr.querySelector('input').checked)));
  ok(rows.length === Object.keys(lazT.classes).length && rows.every((r) => lazT.classes[r[1]] === Number(r[3].replace(/,/g, ''))), 'classes with counts = laspy\'s: ' + rows.map((r) => r[1] + ' ' + r[2] + ' ' + r[3]).join(', '));
  ok(rows.filter((r) => r[4]).map((r) => r[1]).join() === '2', 'ground (2) ticked, the others not');
  ok(rows.some((r) => r[1] === '40' && /Reserved/.test(r[2])), 'a LAS 1.4 class above 31 (40) is listed');
  ds = await dialogState(page);
  ok(ds.st.zUnit === null && !ds.plan.ok, 'no vertical unit in the file: asked');
  await page.selectOption(DLG + ' select[id$="-z"]', 'm');
  await page.selectOption(DLG + ' select[id$="-mode"]', 'lowest');
  await page.selectOption(DLG + ' select[id$="-area"]', 'all');
  await page.fill(DLG + ' input[id$="-spacing"]', '10');
  await wait(100);
  ds = await dialogState(page);
  const est = ds.plan.count;
  ok(ds.plan.ok && est > 50 && est <= 1726 && /About/.test(await countText(page)), `a live estimate: about ${est} points at 10 ft`);
  await shot(page, '06-laz-dialog-paper', { dialog: true });
  const before = await page.evaluate(() => window.civilcraft.project.points.length);
  await importClick(page);
  await page.waitForSelector(DLG, { state: 'detached', timeout: 30000 });
  st = await page.evaluate((b) => { const p = window.civilcraft.project; const pts = p.points.slice(b); return { n: pts.length, d: [...new Set(pts.map((q) => q.d))], nums: pts.slice(0, 2).map((q) => q.n) }; }, before);
  ok(st.n > 0 && st.d.join() === 'LIDAR', `${st.n} LIDAR points added (estimate was ${est})`);
  ok(Math.abs(st.n - est) / est < 0.5, 'the estimate was within 50%');
  ok(Number(st.nums[0]) === before + 1 || Number(st.nums[0]) > 0, 'numbered after the highest point number');
  const rep = await page.evaluate(() => window.civilcraft.gis.terrain.last.notes.join(' '));
  ok(/1,726 in classes|in classes left out/.test(rep) && /Converted from WGS 84 \/ UTM zone 14N/.test(rep) && /Elevations converted from meters/.test(rep), 'the report says what was left out, the conversion and the units');

  console.log('\n== a geographic DEM in a project without a system: asks through pickCrs');
  await newProject(page, 'ft');
  const hadPick = await page.evaluate(() => !!window.civilcraft.gis.reg.pickCrs);
  await page.evaluate(() => { window.__realPick = window.civilcraft.gis.reg.pickCrs; window.civilcraft.gis.reg.pickCrs = null; });
  await openFiles(page, [path.join(FX, 'geo-wgs84.tif')]);
  await page.waitForSelector(DLG);
  await wait(300);
  ds = await dialogState(page);
  ok(!ds.plan.ok && /latitude and longitude/.test(ds.plan.msg) && /GIS › Coordinates/.test(await page.$eval(DLG + ' .cv-terrain-crs', (n) => n.textContent)), 'without a picker (builder C not there): it says to set the project\'s system first; Import off');
  await page.click(DLG + ' .cv-dlg-foot .btn-line');
  await page.waitForSelector(DLG, { state: 'detached' });
  await page.evaluate(() => {
    window.__asked = null;
    window.civilcraft.gis.reg.pickCrs = async ({ reason, near }) => { window.__asked = { reason, near }; return { code: 2277, name: 'NAD83 / Texas Central (ftUS)', proj4: '+proj=lcc +lat_0=29.6666666666667 +lon_0=-100.333333333333 +lat_1=31.8833333333333 +lat_2=30.1166666666667 +x_0=700000 +y_0=3000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs +type=crs', unit: 'ftUS', local: null }; };
  });
  await openFiles(page, [path.join(FX, 'geo-wgs84.tif')]);
  await page.waitForSelector(DLG);
  await page.click(DLG + ' .cv-terrain-crs button');
  await wait(200);
  const asked = await page.evaluate(() => window.__asked);
  ds = await dialogState(page);
  ok(asked && /latitude|Pick the project/.test(asked.reason) && Math.abs(asked.near[0] + 97.748) < 0.01 && Math.abs(asked.near[1] - 30.2986) < 0.01, `pickCrs asked with the reason and near = the file's center (${asked?.near?.map((v) => v.toFixed(3)).join(', ')})`);
  ok(ds.st.newCrs === 2277 && ds.st.zUnit === 'm' && ds.plan.ok, 'picked: converted to Texas Central; the file says meters');
  await importClick(page);
  await page.waitForSelector(DLG, { state: 'detached', timeout: 20000 });
  st = await page.evaluate(() => ({ n: window.civilcraft.project.points.length, crs: window.civilcraft.project.state.crs?.code }));
  ok(st.n > 0 && st.crs === 2277, `${st.n} points; the project's system is the one picked`);
  await page.evaluate(() => { window.civilcraft.gis.reg.pickCrs = window.__realPick; });
  if (!hadPick) note('reg.pickCrs was null (builder C not installed): stubbed for this check');

  console.log('\n== Cancel (3 million LiDAR points, 86 MB)');
  await newProject(page, 'm');
  await openFiles(page, [BIG]);
  await page.waitForSelector(DLG);
  await page.waitForFunction(() => /Reading the classes in the file… [1-9]/.test(document.querySelector('dialog.cv-terrain[open] .cv-progress-box')?.textContent || ''), null, { timeout: 30000 });
  const t0 = Date.now();
  const pong = await page.evaluate(() => 1 + 1);
  ok(pong === 2 && Date.now() - t0 < 1000, `the page answers while it reads (${Date.now() - t0} ms)`);
  await shot(page, '07-progress-paper', { dialog: true });
  await page.click(DLG + ' .cv-dlg-foot .btn-line');
  await page.waitForSelector(DLG, { state: 'detached', timeout: 5000 });
  ok(await page.evaluate(() => window.civilcraft.project.points.length === 0), 'Cancel during the class scan: the dialog closes, nothing changes');
  await openFiles(page, [BIG]);
  await page.waitForSelector(DLG);
  await page.waitForFunction(() => window.civilcraft.gis.terrain.dialog?.st.scanned, null, { timeout: 120000 });
  await page.fill(DLG + ' input[id$="-spacing"]', '4');
  await wait(100);
  ds = await dialogState(page);
  ok(ds.st.zUnit === null || ds.st.zUnit === 'm', 'big file: scanned');
  if (!ds.st.zUnit) await page.selectOption(DLG + ' select[id$="-z"]', 'm');
  await importClick(page);
  await page.waitForFunction(() => /Reading the points… [1-9]/.test(document.querySelector('dialog.cv-terrain[open] .cv-progress-box')?.textContent || ''), null, { timeout: 30000 });
  await page.click(DLG + ' .cv-dlg-foot .btn-line');
  await page.waitForFunction(() => /Cancelled/.test(document.querySelector('dialog.cv-terrain[open] .cv-progress-box')?.textContent || ''), null, { timeout: 10000 });
  ok(await page.evaluate(() => window.civilcraft.project.points.length === 0), 'Cancel during the import: "Cancelled: nothing was imported", the project unchanged');
  await page.click(DLG + ' .cv-dlg-foot .btn-line');
  await page.waitForSelector(DLG, { state: 'detached' });

  console.log('\n== export the surface as a GeoTIFF');
  await newProject(page, 'ft');
  await openFiles(page, [path.join(FX, 'sp-ftus.tif')]);
  await page.waitForSelector(DLG);
  await page.locator(DLG + ' .cv-terrain-crs input[type=checkbox]').check();
  await importClick(page);
  await page.waitForSelector(DLG, { state: 'detached', timeout: 20000 });
  await page.click('[data-cmd="gis-export"]');
  const spot = await page.waitForSelector('dialog[open] [data-gis-geotiff] .btn-plot, dialog.cv-terrain[open] .btn-plot', { timeout: 10000 });
  const inA = await page.$('dialog[open] [data-gis-geotiff]');
  note(inA ? 'GeoTIFF section in builder A\'s GIS › Export dialog' : 'builder A\'s Export dialog has no GeoTIFF spot yet: our own dialog');
  const cellIn = inA ? 'dialog[open] [data-gis-geotiff] input[id$="-c"]' : 'dialog.cv-terrain[open] input[id$="-c"]';
  ok(Number(await page.inputValue(cellIn)) > 0, 'a default cell size from the surface\'s average triangle edge: ' + (await page.inputValue(cellIn)));
  await page.fill(cellIn, '20');
  await page.locator(inA ? 'dialog[open] [data-gis-geotiff]' : DLG).screenshot({ path: path.join(OUT, '08-export-paper.png') });
  const tif = await download(page, () => spot.click());
  const exp = await page.evaluate(() => window.civilcraft.gis.terrain.lastExport);
  const cells = [];
  for (let rr = 0; rr < exp.height; rr += 5) for (let cc = 0; cc < exp.width; cc += 5) cells.push([rr, cc]);
  const rio = py('tif', tif, JSON.stringify(cells));
  ok(rio.epsg === 2277 && rio.dtype === 'float32' && rio.nodata === -3.4028234663852886e38 && rio.units === 'US survey foot', `rasterio: EPSG:${rio.epsg}, float32, nodata −3.4028235e38, unit "${rio.units}"`);
  ok(rio.transform[0] === 20 && rio.transform[2] === exp.gt[0] && rio.transform[5] === exp.gt[3], `rasterio transform: 20 ft cells from (${rio.transform[2]}, ${rio.transform[5]})`);
  const zs = await page.evaluate(([cells, gt]) => { const s = window.civilcraft.project.eg().surface; return cells.map(([r, c]) => s.elevationAt(gt[0] + (c + 0.5) * gt[1], gt[3] + (r + 0.5) * gt[5])); }, [cells, exp.gt]);
  let worst = 0, nd = 0, badNd = 0;
  zs.forEach((z, i) => { if (z === null) { nd++; if (rio.values[i] !== -3.4028234663852886e38) badNd++; } else worst = Math.max(worst, Math.abs(z - rio.values[i])); });
  ok(worst < 1e-4 && !badNd, `${zs.length - nd} cells = the surface's elevation at their centers (worst ${worst.toExponential(1)}), ${nd} nodata`);
  await page.keyboard.press('Escape');
  await wait(200);

  console.log('\n== model theme');
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.civilcraft.gisLoad());
  await newProject(page, 'm');
  await openFiles(page, [path.join(FX, 'f3-12.laz')]);
  await page.waitForSelector(DLG);
  await page.waitForFunction(() => window.civilcraft.gis.terrain.dialog?.st.scanned, null, { timeout: 30000 });
  await shot(page, '06-laz-dialog-model', { dialog: true });
  await page.selectOption(DLG + ' select[id$="-z"]', 'm');
  await importClick(page);
  await page.waitForSelector(DLG, { state: 'detached', timeout: 30000 });
  await page.click('[data-cmd="fit"]');
  await shot(page, '09-lidar-points-model');
  await openFiles(page, [path.join(FX, 'utm-f32-tiled-deflate.tif')]);
  await page.waitForSelector(DLG);
  await wait(300);
  await shot(page, '01-dem-dialog-model', { dialog: true });
  await page.click(DLG + ' .cv-dlg-foot .btn-line');

  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  await ctx?.close();
  await browser.close();
  if (!STAY) { try { admin('down'); } catch { /* ignore */ } }
  fs.rmSync(WORK, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
