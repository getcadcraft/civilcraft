#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gis-vector.mjs — CivilCraft's GIS vector files in headless Chromium at https://getcadcraft.com/lab/civilcraft
 * (docs/GIS-SPEC.md §2), by real clicks and file inputs: nothing GIS loads at start; open a zip of shapefiles (the
 * project has no system → "use EPSG:2277" offered), the GIS layers panel (show/hide, colour, menu), pick a feature
 * (attributes in Properties), use a layer as breaklines (+ undo), a GeoJSON (asks for the project's system through the
 * coordinate system picker), a GeoPackage, GIS › Export in each format read back by GDAL (pyogrio), a point file with
 * latitude/longitude columns, a LandXML file's <CoordinateSystem> offered and written back, paper and model themes, the
 * toolbar still two rows at 1440 px. Fails on any console error.
 *
 *   node tools/civilcraft-test/browser-gis-vector.mjs [--out <dir for screenshots>] [--stay-up]
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin.php up|down gisa` for its own test admin
 * civilcrafttest-gisa+cadcraft@projectz.xyz (disabled again at the end unless --stay-up). Fixtures are written by GDAL
 * (tools/civilcraft-test/gisvec.py make). Screenshots: tmp/shots/civilcraft-gis-gisa/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-gis-gisa'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-gisa.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const TMP = fs.mkdtempSync('/tmp/civilcraft-gisa-');
const FX = path.join(TMP, 'fx'), DL = path.join(TMP, 'dl');
fs.mkdirSync(DL);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);
const python = path.join(HERE, 'venv/bin/python');
const py = (...a) => execFileSync(python, ['-I', path.join(HERE, 'gisvec.py'), ...a], { encoding: 'utf8', maxBuffer: 1 << 26 });
const gdal = (file, layer) => JSON.parse(py('read', file, ...(layer ? [layer] : [])));
py('make', FX);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'gisa'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
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
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, dl.suggestedFilename());
  await dl.saveAs(f);
  return f;
}
const fx = (...names) => names.map((n) => path.join(FX, n));
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
const P = (page, f, a) => page.evaluate(f, a);

/** Pick a system in builder C's picker (search by code), or in this part's own short list when C's is not there. */
async function pickSystem(page, code) {
  await page.waitForSelector('dialog[open] [data-crs-apply], dialog[open] select[id^="cv-gisv-pick-"]');
  if (await page.$('dialog[open] [data-crs-apply]')) {
    await page.fill('dialog[open] input[type="search"]', String(code));
    await page.click(`dialog[open] [data-crs-code="${code}"]`);
    await page.click('dialog[open] [data-crs-apply]');
  } else {
    note('builder C’s picker is not installed: the import dialog’s own list was used');
    await page.selectOption('dialog[open] select[id^="cv-gisv-pick-"]', String(code));
    await page.click('dialog[open] .btn-plot');
  }
}
/** New project, saying "Don’t save" when asked. */
async function newProject(page) {
  await page.click('[data-cmd="new"]');
  await wait(150);
  if (await page.$('dialog.cv-ask[open]')) await page.click('dialog.cv-ask[open] button[data-key="discard"]');
  await page.waitForFunction(() => !window.civilcraft.project.state.gis.layers.length && !window.civilcraft.project.points.length);
}

let ctx;
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  const gisReq = [];
  page.on('request', (r) => { if (/gis-(ui|vector-ui|read|layers|export|geom)\.js|shapefile\.js|gpkg\.js|sql-wasm/.test(r.url())) gisReq.push(r.url()); });

  console.log('\n== start');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200 && (await P(page, () => !!window.civilcraft)), '/lab/civilcraft started');
  ok(!gisReq.length, 'nothing GIS is fetched at start' + (gisReq.length ? ': ' + gisReq.join(' ') : ''));
  const rows = await P(page, () => { const tops = [...document.querySelectorAll('.cv-tools .cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top)); return [...new Set(tops)].length; });
  ok(rows <= 2, 'the toolbar is ' + rows + ' row(s) at 1440 px');
  await page.screenshot({ path: path.join(OUT, '00-toolbar-paper.png'), clip: { x: 0, y: 0, width: 1440, height: 160 } });

  console.log('\n== a zip of shapefiles');
  await page.setInputFiles('[data-file]', fx('several.zip'));
  await page.waitForSelector('dialog[open] [data-gisv-layers]');
  ok(gisReq.some((u) => /gis-vector-ui\.js/.test(u)) && !gisReq.some((u) => /sql-wasm/.test(u)), 'the GIS vector part loads on first use (sql.js not fetched for a shapefile)');
  const rowsN = await page.$$eval('dialog[open] [data-gisv-layers] tbody tr', (t) => t.length);
  ok(rowsN === 3, 'the import dialog lists 3 layers');
  const offer = await page.textContent('dialog[open] [data-gisv-crs]');
  ok(/Use NAD83 \/ Texas Central \(ftUS\) as the project’s coordinate system/.test(offer), 'no project system: offers NAD83 / Texas Central (ftUS) from the .prj');
  ok(/becomes the project’s coordinate system/.test(await page.textContent('dialog[open] [data-gisv-what]')), '"What will happen" says so');
  await shot(page, '01-import-dialog-paper');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 3);
  ok(await P(page, () => window.civilcraft.project.state.crs?.code === 2277), 'imported: 3 layers, EPSG:2277 is the project’s system');
  ok(await P(page, () => window.civilcraft.project.undoStack.length === 1), 'one undo step');
  const panelRows = await page.$$eval('[data-gis-layers]:not([hidden]) .cv-gis-row', (t) => t.map((x) => x.textContent));
  ok(panelRows.length === 3 && panelRows.some((t) => /linez/.test(t) && /3 lines/.test(t)), 'the GIS layers panel: ' + panelRows.map((t) => t.trim().replace(/\s+/g, ' ').slice(0, 40)).join(' | '));
  await wait(300);
  await shot(page, '02-layers-paper');

  console.log('\n== pick a feature');
  await page.click('[data-cmd="select"]');
  const pz = await P(page, () => { const p = window.civilcraft.project; const id = p.state.gis.layers.find((l) => l.name === 'pointz').id; const f = p.gisFeatures.get(id)[0]; return window.civilcraft.toScreen(f.g.c[0], f.g.c[1]); });
  await page.mouse.click(pz.x, pz.y);
  await page.waitForSelector('[data-gis-attrs]');
  const attrs = await page.textContent('[data-gis-attrs]');
  ok(/Héllo wörld/.test(attrs) && /2026-10-01/.test(attrs) && /Yes/.test(attrs), 'Properties shows the feature’s attributes: ' + attrs.replace(/\s+/g, ' ').slice(0, 90));
  ok(/pointz/.test(await page.textContent('[data-gis-feature]')), 'and its layer');
  await shot(page, '03-feature-paper');

  console.log('\n== use a layer as breaklines');
  const lz = await P(page, () => window.civilcraft.project.state.gis.layers.find((l) => l.name === 'linez').id);
  await page.click(`[data-gis-layer="${lz}"] .cv-gis-menu summary`);
  await page.click(`[data-gis-layer="${lz}"] .cv-gis-menu button:has-text("Use for the surface")`);
  await page.waitForSelector('dialog[open] [data-gisv-use-go]');
  await page.click('dialog[open] [data-gisv-use-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.breaklines.length === 3);
  ok(await P(page, () => window.civilcraft.project.state.surface.breaklines[0].pts[0].z === 500), 'linez → 3 breaklines at their own z');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.breaklines.length === 0);
  ok(true, 'Ctrl+Z takes them back');
  // hide and colour
  await page.uncheck(`[data-gis-layer="${lz}"] input[type=checkbox]`);
  ok(await P(page, (id) => !window.civilcraft.project.state.gis.layers.find((l) => l.id === id).visible, lz), 'a layer hides from its checkbox');
  await page.check(`[data-gis-layer="${lz}"] input[type=checkbox]`);
  await page.selectOption(`[data-gis-layer="${lz}"] select`, 'magenta');
  ok(await P(page, (id) => window.civilcraft.project.state.gis.layers.find((l) => l.id === id).color === 'magenta', lz), 'its colour changes from the list');

  console.log('\n== export each format, read back by GDAL');
  await page.click('[data-cmd="gis-export"]');
  await page.waitForSelector('dialog[open] [data-gisv-kinds]');
  ok(/grid|EPSG:2277/.test(await page.textContent('dialog[open] [data-gisv-coords]')), 'the dialog says which system the coordinates are written in');
  ok(!!(await page.$('dialog[open] [data-gis-export-extra]')), 'the dialog has the extra spot for other parts ([data-gis-export-extra])');
  await shot(page, '04-export-dialog-paper');
  const got = {};
  for (const fmt of ['shp', 'gpkg', 'geojson']) {
    await page.check(`dialog[open] [data-gisv-fmts] input[value="${fmt}"]`);
    got[fmt] = await download(page, () => page.click('dialog[open] [data-gisv-xgo]'));
    await page.waitForFunction(() => /Downloaded/.test(document.querySelector('dialog[open] [data-gisv-xmsg]')?.textContent || ''));
  }
  const shpDir = path.join(TMP, 'shp'); fs.mkdirSync(shpDir);
  execFileSync('unzip', ['-q', got.shp, '-d', shpDir]);
  const shps = fs.readdirSync(shpDir).filter((f) => f.endsWith('.shp'));
  const G1 = gdal(path.join(shpDir, shps.find((f) => /pointz/.test(f))))[0];
  ok(shps.length === 3 && G1.epsg === 2277 && G1.count === 5, `shapefile zip: ${shps.length} shapefiles; pointz EPSG:${G1.epsg}, ${G1.count} features`);
  const L = JSON.parse(py('layers', got.gpkg));
  const G2 = gdal(got.gpkg, L.find((n) => /linez/.test(n)))[0];
  ok(L.length === 3 && G2.epsg === 2277 && G2.count === 3 && /Z$/.test(G2.geometry_type), `GeoPackage: ${L.length} tables; linez EPSG:${G2.epsg}, ${G2.count} features, ${G2.geometry_type}`);
  const G3 = gdal(got.geojson)[0];
  ok(G3.epsg === 4326 && G3.count === 5 + 3 + 2, `GeoJSON: EPSG:${G3.epsg}, ${G3.count} features`);
  await page.click('dialog[open] .cv-dlg-foot .btn-line');

  console.log('\n== a GeoJSON asks for the project’s system');
  await newProject(page);
  // through GIS › Import this time (its own file picker; the files go through every part's opener)
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-cmd="gis-import"]')]);
  ok(chooser.isMultiple() && /\.geojson/.test(await page.evaluate(() => document.querySelector('input[type=file][accept*=".geojson"]:not([data-file])')?.accept || '')), 'GIS › Import opens a file picker for GIS files (several at once)');
  await chooser.setFiles(fx('austin.geojson'));
  await page.waitForSelector('dialog[open] [data-gisv-pick]');
  ok(await page.$eval('dialog[open] [data-gisv-go]', (b) => b.disabled), 'Import waits until a system is chosen');
  await page.click('dialog[open] [data-gisv-pick]');
  await pickSystem(page, 2277);
  await page.waitForFunction(() => !document.querySelector('dialog[open] [data-gisv-go]')?.disabled);
  await shot(page, '05-geojson-dialog-paper');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 3);
  const g0 = await P(page, () => { const p = window.civilcraft.project; return { crs: p.state.crs?.code, c: p.gisFeatures.get(p.state.gis.layers[0].id)[0].g.c }; });
  const want = JSON.parse(execFileSync(python, ['-I', '-c', 'from pyproj import Transformer; import json; print(json.dumps(Transformer.from_crs("EPSG:4326","EPSG:2277",always_xy=True).transform(-97.7431, 30.2672)))'], { encoding: 'utf8' }));
  ok(g0.crs === 2277 && Math.abs(g0.c[0] - want[0]) < 0.003 && Math.abs(g0.c[1] - want[1]) < 0.003, `placed in EPSG:2277 where PROJ puts it (${g0.c.slice(0, 2).map((v) => v.toFixed(3)).join(', ')})`);

  console.log('\n== a GeoPackage');
  await newProject(page);
  await page.setInputFiles('[data-file]', fx('site.gpkg'));
  await page.waitForSelector('dialog[open] [data-gisv-layers]');
  ok(gisReq.some((u) => /sql-wasm\.esm\.js/.test(u)) && gisReq.some((u) => /sql-wasm\.wasm/.test(u)), 'sql.js (module + wasm) is fetched only now');
  ok((await page.$$eval('dialog[open] [data-gisv-layers] tbody tr', (t) => t.length)) === 4, 'four tables listed');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 4);
  ok(await P(page, () => window.civilcraft.project.state.crs?.code === 2277), 'four layers; EPSG:2277 offered and used');

  console.log('\n== model theme');
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'model'));
  await wait(300);
  await shot(page, '06-layers-model');
  await page.click('[data-cmd="gis-export"]');
  await page.waitForSelector('dialog[open] [data-gisv-kinds]');
  await shot(page, '07-export-dialog-model');
  await page.click('dialog[open] .cv-dlg-foot .btn-line');
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'paper'));

  console.log('\n== a point file with latitude and longitude');
  await newProject(page);
  const csv = path.join(TMP, 'latlon.csv');
  fs.writeFileSync(csv, 'Point,Latitude,Longitude,Elevation,Description\n1,30.2672,-97.7431,500.5,CP\n2,30.2680,-97.7420,501,GRD\n3,30.2690,-97.7410,502,GRD\n');
  await page.setInputFiles('[data-file]', csv);
  await page.waitForSelector('[data-import][open]');
  ok(/latitude and longitude columns/.test(await page.textContent('[data-imp-summary]')), 'the import dialog says the file is latitude and longitude');
  await page.click('[data-imp-ok]');
  await pickSystem(page, 2277);
  await page.waitForFunction(() => window.civilcraft.project.points.length === 3);
  const lp = await P(page, () => ({ crs: window.civilcraft.project.state.crs?.code, p: window.civilcraft.project.points[0] }));
  ok(lp.crs === 2277 && Math.abs(lp.p.x - want[0]) < 0.003 && Math.abs(lp.p.y - want[1]) < 0.003 && lp.p.z === 500.5, `converted, never loaded as feet: point 1 at ${lp.p.x.toFixed(3)}, ${lp.p.y.toFixed(3)}`);

  console.log('\n== LandXML <CoordinateSystem>');
  const xmlOut = await download(page, () => page.click('[data-cmd="landxml"]'));
  const xml = fs.readFileSync(xmlOut, 'utf8');
  ok(/<CoordinateSystem name="NAD83 \/ Texas Central \(ftUS\)" epsgCode="2277"\/>/.test(xml), 'the LandXML export names the project’s system');
  await newProject(page);
  await page.setInputFiles('[data-file]', xmlOut);
  await page.waitForSelector('dialog.cv-ask[open]');
  ok(/says its coordinates are in NAD83 \/ Texas Central \(ftUS\)/.test(await page.textContent('dialog.cv-ask[open]')), 'opening it offers the file’s system');
  await page.click('dialog.cv-ask[open] button[data-key="use"]');
  await page.waitForFunction(() => window.civilcraft.project.state.crs?.code === 2277);
  ok(true, 'accepted: the project is in EPSG:2277');

  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await ctx?.close();
  await browser.close();
  if (!process.argv.includes('--stay-up')) admin('down');
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(REPO, OUT)}`);
process.exit(fail ? 1 : 0);
