#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bimcraft.mjs — point clouds in BimCraft's lab build (0.5 SG.1), headless, with real clicks.
 *   node tools/pointcloud/browser-bimcraft.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session pointcloud, disabled at the end), the cached
 * Playwright Chromium, fixtures from tools/pointcloud/fixtures.py (laspy) and tools/bimcraft-test/ifc-fixture.mjs. Fails
 * on any console error.
 *
 *   alone      the scanned room (LAS 1.2 format 2, UTM 14N) opened by itself: every point shown, drawn (pixels counted),
 *              colour by class / height / intensity, size; the Plan slice at 1.2 m and the Top view; Measure snaps to cloud
 *              points: west wall to east wall = 6.000 m; Location on a cloud point = PROJ's latitude / longitude
 *   model      the IFC fixture with its IfcMapConversion (EPSG:28356), then the same building scanned in EPSG:28356: placed by
 *              map coordinates on its own, every scanned point of wall W-101 inside W-101's box; the building in the model's
 *              own coordinates (XYZ) placed by model coordinates; Place › Centered; a model corner still wins Measure's snap
 *   bar        hide / show, points to show (re-read), the Trace in CadCraft button there when CadCraft takes hand-overs,
 *              remove; model theme; no console errors
 *   formats    (0.6 PF.2 / PF.3 / PF.1) a big-endian PLY, a binary PCD, a two-scan PTX and a two-scan E57 (web-e57 in its
 *              Worker, pinned folder) through the cloud input; an RCS → the card
 *              (format named, what to export, How to export opens help point-cloud-formats, Close)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from '../bimcraft-test/ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/pointcloud-bimcraft');
fs.mkdirSync(SHOTS, { recursive: true });
const FX = fs.mkdtempSync('/tmp/pc-browser-');
const PY = path.join(REPO, 'tools/civilcraft-test/venv/bin/python');
execFileSync(PY, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'make', FX]);
execFileSync(PY, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'building', FX]);
// 0.6 PF.2: the PLY / PCD / PTX fixtures need the corpus venv (plyfile, Open3D; outside every repo); skipped without it
const PY2 = path.resolve(REPO, '../testfiles/pointcloud-corpus/venv/bin/python');
const FMT = fs.existsSync(PY2);
if (FMT) { execFileSync(PY2, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'formats', path.join(FX, 'formats')]); execFileSync(PY2, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'e57', path.join(FX, 'e57')]); }
else console.log('  skip formats: ' + PY2 + ' is missing');
const ref = JSON.parse(execFileSync(PY, ['-c', 'import json; from pyproj import Transformer; t=Transformer.from_crs(32614,4326,always_xy=True); print(json.dumps(t.transform(620006.0,3349002.0)))'], { encoding: 'utf8' }));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const shot = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
// a session minted in-process for this test's own account (cctest+cadcraft-pointcloud): no login, so the shared
// admin-login throttle (10 / 10 min) is never touched; disabled again at the end
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'pointcloud'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const requested = [];   // every request, the Worker's included (performance entries leave a worker's fetches out)
page.on('request', (r) => requested.push(r.url()));

const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const clearStatus = () => page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });
const st = () => page.evaluate(() => window.bimcraftCloud?.state() || null);
/** Pixels of the 3D canvas that are not the background (the cloud drawn). */
const drawn = () => page.evaluate(async () => {
  const v = document.querySelector('[data-canvas]').viewer;
  v.renderer.render(v.scene, v.camera);
  const img = new Image(); img.src = v.canvas.toDataURL('image/png'); await img.decode();
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const g = c.getContext('2d'); g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const bg = v.scene.background, br = Math.round(bg.r * 255), bgG = Math.round(bg.g * 255), bb = Math.round(bg.b * 255);
  let n = 0, red = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (Math.abs(d[i] - br) + Math.abs(d[i + 1] - bgG) + Math.abs(d[i + 2] - bb) > 40) n++;
    if (d[i] > 150 && d[i + 1] < 110 && d[i + 2] < 90) red++;
  }
  return { share: n / (d.length / 4), red: red / (d.length / 4) };
});
/** Page position of a cloud point found by its place (cloud-relative metres for the room: x, y, z from the low corner). */
const screenOfCloud = (want) => page.evaluate((w) => {
  const L = window.bimcraftCloud.layer(), c = L.cloud, v = document.querySelector('[data-canvas]').viewer;
  let best = -1, bd = Infinity;
  for (let k = 0; k < c.n; k++) { const d = Math.hypot(c.pos[k * 3] - w[0], c.pos[k * 3 + 1] - w[1], c.pos[k * 3 + 2] - w[2]); if (d < bd) { bd = d; best = k; } }
  const p = L.worldOf(best);
  return { ...v.project(p), world: p, d: bd };
}, want);

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('bimcraft.settings'); localStorage.removeItem('bimcraft.cloud'); });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('== alone: the scanned room');
  const libsBefore = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /laz-perf|pointcloud|cloud-ui/.test(n)).length);
  ok(libsBefore === 0, 'nothing of the point cloud code loads before a cloud is opened');
  await page.setInputFiles('[data-file]', path.join(FX, 'room-f2-12.las'));
  await waitStatus(/showing 44,393 of 44,393 points/);
  let s = await st();
  ok(s && s.kept === 44393 && s.place === 'own' && s.unit === 'm' && s.color === 'rgb', 'opened on its own: 44,393 points, its own coordinates, meters (from EPSG:32614), the file\'s colours', JSON.stringify(s));
  ok(await page.isVisible('[data-cloudbar]') && await page.isVisible('[data-toolbar]') && (await page.getAttribute('[data-cloud-open]', 'aria-pressed')) === 'true', 'the 3D view, its toolbar and the cloud bar show; Show › Point cloud is pressed');
  let px = await drawn();
  ok(px.share > 0.05 && px.red > 0.005, `the cloud is drawn (${(px.share * 100).toFixed(1)} % of the view, the red-brown walls ${(px.red * 100).toFixed(1)} %)`);
  await shot(page, '01-room-paper');
  for (const mode of ['class', 'height', 'intensity']) {
    await page.selectOption('[data-cloud-color]', mode);
    ok((await st()).color === mode, 'Color by ' + mode);
    await shot(page, '02-color-' + mode);
  }
  px = await drawn();
  ok(px.red < 0.002, 'by intensity the walls are no longer red-brown (' + (px.red * 100).toFixed(2) + ' %)');
  await page.selectOption('[data-cloud-color]', 'rgb');
  await page.$eval('[data-cloud-size]', (r) => { r.value = '4'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  ok((await st()).size === 4 && (await page.evaluate(() => window.bimcraftCloud.layer().uniforms.uSize.value)) === 4, 'point size 4');

  await page.click('[data-cloud-slice="top"]');
  s = await st();
  ok(s.slice?.axis === 'top' && Math.abs(s.slice.at - 1.2) < 1e-6 && s.slice.thick === 0.1, 'Plan slice: 1.2 m above the lowest point, 0.1 m thick', JSON.stringify(s.slice));
  ok(await page.isVisible('[data-cloud-at]') && /1\.20 m of 3\.00 m/.test(await page.textContent('[data-cloud-atval]')), 'the slice controls say 1.20 m of 3.00 m');
  const pxAll = px.share;
  px = await drawn();
  ok(px.share < pxAll * 0.6 && px.share > 0.002, `the slice leaves the wall outline (${(px.share * 100).toFixed(2)} % of the view against ${(pxAll * 100).toFixed(1)} %)`);
  await shot(page, '03-slice-plan');

  // Measure: west wall → east wall on the slice
  await page.click('[data-toggle="measure"]');
  const a = await screenOfCloud([0, 2, 1.2]), b = await screenOfCloud([6, 2, 1.2]);
  await page.mouse.move(a.x + 3, a.y + 2);
  const hov = await page.evaluate(({ x, y }) => document.querySelector('[data-canvas]').viewer.measureAt(x, y), { x: a.x + 3, y: a.y + 2 });
  ok(hov?.snap === 'cloud' && Math.hypot(...hov.point.map((v, k) => v - a.world[k])) < 0.06, 'Measure snaps to the cloud point under the pointer (3 px off)', JSON.stringify(hov));
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  const out = await page.textContent('[data-measure-out]');
  ok(/6\.000|6\.00 m|19'-8 1\/4"/.test(out), 'west wall to east wall through the slice: ' + out.split('\n')[0]);
  await shot(page, '04-measure');
  // Location from the cloud's own system (UTM 14N) — the east wall at 2 m: E 620006, N 3349002
  await page.click('[data-measure-mode="point"]');
  const e = await screenOfCloud([6, 2, 1.2]);
  await clearStatus();
  await page.mouse.click(e.x, e.y);
  await waitStatus(/Location from the cloud/);
  const loc = await page.textContent('[data-measure-out]');
  const m = loc.match(/Lat (-?\d+\.\d+)°, long (-?\d+\.\d+)°/);
  const lat = m ? Number(m[1]) : NaN, lon = m ? Number(m[2]) : NaN;
  ok(Math.abs(lat - ref[1]) < 2e-7 && Math.abs(lon - ref[0]) < 2e-7, `Location of the east wall point = PROJ's (${lat}, ${lon} vs ${ref[1].toFixed(8)}, ${ref[0].toFixed(8)})`);
  ok(/EPSG|UTM|32614|zone 14N/.test(loc), 'it names the cloud\'s system: ' + loc.split('\n').pop());
  await page.click('[data-measure-done]');
  await page.click('[data-cloud-slice="off"]');
  ok((await st()).slice === null && !(await page.isVisible('[data-cloud-at]')), 'slice off');

  console.log('== model: the IFC fixture and scans of it');
  await page.setInputFiles('[data-file]', { name: 'bimcraft-georef.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({ georef: 'map' })) });
  await waitStatus(/^Opened /);
  s = await st();
  ok(s && s.place === 'center', 'the room scan stays when a model opens, centered on it (its UTM coordinates are far from the model\'s)', JSON.stringify(s?.place) + ' ' + JSON.stringify(s?.notes));
  await clearStatus();
  await page.setInputFiles('[data-file]', path.join(FX, 'building-mga56.las'));
  await waitStatus(/showing 9,920 of 9,920/);
  s = await st();
  ok(s.place === 'map' && !s.notes.length, 'the building scanned in EPSG:28356 is placed by map coordinates (IfcMapConversion), nothing to say', JSON.stringify(s.notes));
  const inside = () => page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, L = window.bimcraftCloud.layer(), c = L.cloud;
    const key = window.bimcraftKeys ? window.bimcraftKeys('W-101') : null;
    const bb = v.keyBounds([key]);
    if (!bb) return { error: 'no W-101' };
    let n = 0, inn = 0, far = 0;
    for (let k = 0; k < c.n; k++) {
      // W-101's axis: the scan's first wall (model y = 0), points 0 … 99 of each height row: the fixture writes walls in order
      const p = L.worldOf(k);
      const near = p.every((x, i) => x >= bb.min[i] - 0.15 && x <= bb.max[i] + 0.15);
      if (k % 10 === 0) { n++; if (near) inn++; }
    }
    // every point of the first wall (100 per row × 31 rows) inside W-101's box
    let wall = 0, wallIn = 0;
    for (let r = 0; r < 31; r++) for (let i = 0; i < 100; i++) { const k = r * 100 + i; wall++; const p = L.worldOf(k); if (p.every((x, j) => x >= bb.min[j] - 0.12 && x <= bb.max[j] + 0.12)) wallIn++; else far = Math.max(far, ...p.map((x, j) => Math.max(bb.min[j] - x, x - bb.max[j]))); }
    return { wall, wallIn, far, bb };
  });
  const w = await inside();
  ok(w.wall === 3100 && w.wallIn === 3100, `every scanned point of W-101's axis lies inside W-101's box (web-ifc's geometry) ±0.12 m: ${w.wallIn}/${w.wall}`, JSON.stringify(w));
  await page.click('[data-view="iso"]');
  await shot(page, '05-model-map');
  // a model corner still wins Measure over the cloud
  await page.click('[data-toggle="measure"]');
  const corner = await page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, key = window.bimcraftKeys('W-102'), bb = v.keyBounds([key]);
    const p = [bb.max[0], bb.max[1], bb.max[2]];
    return { ...v.project(p) };
  });
  const mc = await page.evaluate(({ x, y }) => document.querySelector('[data-canvas]').viewer.measureAt(x, y), corner);
  ok(mc && mc.snap !== 'cloud', 'near a model corner Measure snaps to the model (' + mc?.snap + '), not the cloud');
  await page.click('[data-measure-done]');
  await page.selectOption('[data-cloud-place]', 'center');
  ok((await st()).place === 'center', 'Place › Centered on the model');
  await page.selectOption('[data-cloud-place]', 'map');
  await clearStatus();
  await page.setInputFiles('[data-file]', path.join(FX, 'building-local.xyz'));
  await waitStatus(/showing 9,920 of 9,920/);
  s = await st();
  ok(s.place === 'model' && s.unit === null && s.notes.some((n) => /units/.test(n)), 'the XYZ scan in the model\'s own numbers: model coordinates; no units in the file → meters, said', JSON.stringify(s));
  ok(await page.isVisible('[data-cloud-units]'), 'Units is offered when the file does not say');
  const w2 = await inside();
  ok(w2.wallIn === 3100, `model coordinates: W-101's scan inside W-101's box: ${w2.wallIn}/${w2.wall}`);

  console.log('== bar');
  await page.click('[data-cloud-hide]');
  ok((await st()).visible === false && /Show/.test(await page.textContent('[data-cloud-hide]')), 'Hide');
  await page.click('[data-cloud-hide]');
  ok((await st()).visible === true, 'Show');
  await clearStatus();
  await page.selectOption('[data-cloud-budget]', '1000000');
  await waitStatus(/showing 9,920 of 9,920/);
  ok((await st()).budget === 1e6, 'Show 1 million points: re-read');
  const trace = await page.isVisible('[data-cloud-trace]');
  const editUrl = await page.getAttribute('main[data-bimcraft]', 'data-edit-url');
  ok(trace === !!editUrl, 'Trace in CadCraft shows exactly when CadCraft takes hand-overs here (' + (editUrl || 'none') + ')');
  const cloudItem = async () => { await page.click('[data-vis-menu] > summary'); await page.click('[data-cloud-open]'); };
  await cloudItem();
  ok(!(await page.isVisible('[data-cloudbar]')) && (await page.getAttribute('[data-cloud-open]', 'aria-pressed')) === 'false', 'Show › Point cloud hides the bar');
  await cloudItem();
  ok(await page.isVisible('[data-cloudbar]'), '… and shows it again');
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('[data-toolbar] > .bc-tool, [data-toolbar] > details > summary')].filter((b) => b.offsetParent).map((b) => Math.round(b.getBoundingClientRect().top))).size);
  ok(rows <= 2, 'the toolbar keeps its two rows at 1440 px (' + rows + ')');
  const ov = await page.evaluate(() => { const a = document.querySelector('[data-cloudbar]').getBoundingClientRect(), b = document.querySelector('[data-toolbar]').getBoundingClientRect(); return a.top >= b.bottom - 1; });
  ok(ov, 'the cloud bar sits under the toolbar');
  await page.click('[data-toggle="section"]');
  await page.waitForTimeout(200);
  const ov2 = await page.evaluate(() => { const a = document.querySelector('[data-cloudbar]').getBoundingClientRect(), b = document.querySelector('[data-sectionbar]').getBoundingClientRect(); return a.top >= b.bottom - 1; });
  ok(ov2, 'and under the section bar while that shows');
  await shot(page, '06a-section-and-cloud');
  await page.click('[data-sec-off]');
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(300);
  await shot(page, '06-model-theme');
  await page.click('[data-cloud-remove]');
  ok((await st()) === null && !(await page.isVisible('[data-cloudbar]')), 'Remove');

  if (FMT) {
    console.log('== formats (0.6 PF.2, PF.3): PLY, PCD, PTX through the cloud input; a scanner maker\'s own file → the card');
    await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
    for (const [name, n] of [['room-be-double.ply', 44393], ['room-binary.pcd', 44393], ['room-two-scans.ptx', 43507]]) {
      await clearStatus();
      await page.setInputFiles('[data-cloud-input]', path.join(FX, 'formats', name));
      await waitStatus(new RegExp('showing ' + n.toLocaleString('en-US') + ' of ' + n.toLocaleString('en-US')));
      const sf = await st();
      const pxf = await drawn();
      ok(sf?.name === name && sf.kept === n && pxf.share > 0.01, `${name}: ${sf?.kept} points shown and drawn (${(pxf.share * 100).toFixed(1)} % of the view)`, JSON.stringify(sf?.notes));
      if (name.endsWith('.ptx')) { ok(sf.unit === 'm' && /2 scans, each placed/.test(await page.textContent('[data-status]')), 'PTX: meters, the two scans said'); await shot(page, '07-ptx-two-scans'); }
    }
    // 0.6 PF.1: an E57 with two posed scans, read by our own reader in a module Worker (web-e57 only as the fallback)
    await clearStatus();
    await page.setInputFiles('[data-cloud-input]', path.join(FX, 'e57', 'posed-two-scans.e57'));
    await waitStatus(/showing 3,000 of 3,000/);
    const se = await st();
    const urls = requested.filter((n) => /web-e57|e57\.js/.test(n));
    ok(se?.kept === 3000 && se.unit === 'm' && /2 scans, each placed by its pose/.test(await page.textContent('[data-status]')), 'E57: 3,000 points from two posed scans, meters, said', JSON.stringify(se?.notes));
    ok(!urls.some((u) => /web-e57/.test(u)) && urls.some((u) => /e57\.js\?v=/.test(u)), '0.8: our own E57 reader runs in the module Worker (e57.js cache-busted); web-e57 is not even fetched unless a file needs it', urls.join(' '));
    const pxe = await drawn();
    ok(pxe.share > 0.002, `the E57 cloud is drawn (${(pxe.share * 100).toFixed(2)} % of the view)`);
    await shot(page, '07b-e57');
    // DF.22 hook for bim-draw: pc.adjust(m) — an extra viewer-space matrix after the placement
    const b0 = (await st()).box;
    const moved = await page.evaluate(() => { const pc = window.bimcraftCloud; pc.adjust([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 0, 0, 1]); return { box: pc.state().box, m: pc.adjust() }; });
    ok(Math.abs(moved.box[0][0] - b0[0][0] - 5) < 1e-6 && moved.m[12] === 5, 'pc.adjust(m) moves the cloud 5 m along x after its placement; adjust() returns it');
    await clearStatus();
    await page.selectOption('[data-cloud-budget]', '2000000');
    await waitStatus(/showing 3,000 of 3,000/);
    ok((await page.evaluate(() => window.bimcraftCloud.adjust()[12])) === 5, 'a budget re-read keeps the adjustment');
    const back = await page.evaluate(() => { const pc = window.bimcraftCloud; pc.adjust(null); return pc.state().box; });
    ok(Math.abs(back[0][0] - b0[0][0]) < 1e-6, 'adjust(null) puts it back');
    await page.click('[data-cloud-remove]');
    await page.setInputFiles('[data-cloud-input]', { name: 'site.rcs', mimeType: 'application/octet-stream', buffer: Buffer.concat([Buffer.from('ADOCT'), Buffer.alloc(200)]) });
    await page.waitForSelector('[data-cloud-card="rcs"]', { timeout: 20000 });
    const cardText = await page.textContent('[data-cloud-card]');
    ok(/can’t be opened here/.test(cardText) && /site\.rcs is a ReCap scan file/.test(cardText) && /export it as E57 or LAS/.test(cardText), 'site.rcs: the card names the format and what to export', cardText);
    ok(await page.evaluate(() => document.activeElement?.hasAttribute('data-cloud-card-help')), 'the card takes focus on How to export');
    ok(!(await page.isVisible('[data-cloudbar]')) && (await st()) === null, 'nothing is read or shown as a cloud');
    const below = await page.evaluate(() => { const a = document.querySelector('[data-cloud-card]').getBoundingClientRect(), b = document.querySelector('[data-toolbar]').getBoundingClientRect(); return a.top >= b.bottom - 1; });
    ok(below, 'the card sits under the toolbar');
    await shot(page, '08-native-card');
    await page.click('[data-cloud-card-help]');
    await page.waitForFunction(() => /Point cloud formats/.test(document.querySelector('[data-help-panel]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, 'How to export opens help: Point cloud formats');
    await shot(page, '09-help-formats');
    await page.keyboard.press('Escape');
    await page.click('[data-cloud-card-close]');
    ok(!(await page.$('[data-cloud-card]')), 'Close takes the card away');
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'zz-failure').catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'pointcloud']);
  fs.rmSync(FX, { recursive: true, force: true });
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(fail ? '\n' + fail + ' FAILED, ' + pass + ' passed' : '\nall ' + pass + ' browser checks passed (shots: ' + SHOTS + ')');
process.exit(fail ? 1 : 0);
