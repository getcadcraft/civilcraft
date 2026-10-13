#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-3d.mjs — CadCraft's 3D tab in the lab, headless, with real clicks and keys.
 *
 *   node tools/cadcraft-test/browser-3d.mjs [--shots <dir>]   (default tmp/shots/cadcraft-3d)
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium, 1440 × 900.
 * Checks: three.js is not fetched until the 3D tab opens; the toolbar keeps two rows on both tabs (the 3D group replaces
 * the 2D-only groups); a rectangle drawn by typing is extruded on the 3D tab by clicking inside it and typing a height;
 * middle-drag orbits, the wheel zooms; Style and Views menus; PRESSPULL by clicks + a typed distance; Ctrl+Z / Ctrl+Y
 * across 3D and 2D; Delete erases a selected solid; Save (DXF) and reopen restore the solid; GLB export downloads;
 * the corner indicator: axis icon by default, Settings › CadCraft › View cube persists over a reload, the Model tab's cube
 * opens the 3D tab looking from the front, the 3D cube's Top looks down; both themes; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : path.join(REPO, 'tmp/shots/cadcraft-3d');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const near = (a, b, t) => Math.abs(a - b) <= t;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const threeRequests = [];
page.on('request', (r) => { if (/\/vendor\/three\//.test(r.url())) threeRequests.push(r.url()); });

const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(120); };
const ws = (fn, arg) => page.evaluate(fn, arg);
const solids = () => ws(() => { const m = window.cadcraft.doc.model3d, k = m.k; return [...m.root.insts.entries()].map(([iid, inst]) => { const bb = m.bbox(m.def(inst.def), inst.m); return { iid, min: bb.min.map((x) => x / k), max: bb.max.map((x) => x / k) }; }); });
/** A point in drawing units → page pixels over the 3D view. */
const at3 = (x, y, z = 0) => ws(([x, y, z]) => { const w = window.cadcraft.host.ws3d, k = w.k, r = document.querySelector('.cc-3d-over').getBoundingClientRect(); const p = w.cam.project([x * k, y * k, z * k]); return { x: r.left + p[0], y: r.top + p[1] }; }, [x, y, z]);
const camDir = () => ws(() => { const a = window.cadcraft.host.ws3d.cam.axes().z; return a.map((x) => -x); });
const rows = () => ws(() => { const t = document.querySelector('main > [role="toolbar"]'); const g = [...t.querySelectorAll(':scope > [role="group"]')].filter((x) => !x.hidden); return { rows: new Set(g.map((x) => Math.round(x.getBoundingClientRect().top))).size, names: g.map((x) => x.getAttribute('aria-label')) }; });
const shot = (name) => page.screenshot({ path: path.join(SHOTS, name + '.png') });

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cc-app-settings:cadcraft'); } catch {} });
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  if (!(await page.evaluate(() => !!window.cadcraft))) throw new Error('the app did not start at ' + page.url() + ': ' + (await page.title()));

  console.log('\n== start: 2D, no three.js yet');
  ok(threeRequests.length === 0, 'three.js is not fetched at start-up', threeRequests.join(', '));
  let r = await rows();
  ok(r.rows === 2 && !r.names.includes('3D'), 'toolbar: two rows, no 3D group on the Model tab', JSON.stringify(r));
  const tabs = await page.$$eval('[data-tabs] [role="tab"]', (b) => b.map((x) => x.textContent));
  ok(tabs[0] === 'Model' && tabs[1] === '3D', 'a "3D" tab beside Model', tabs.join(', '));
  ok(await page.isVisible('[data-cadcraft] .cc-canvases > [data-viewcube]') === false && await ws(() => window.cadcraft.view.ucs) === true, 'corner indicator Automatic: the axis icon on the Model tab, no cube');
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('@1000,600');
  await typeCmd('C'); await typeCmd('1600,300'); await typeCmd('250');
  await typeCmd('ZOOM'); await typeCmd('E');

  console.log('\n== the 3D tab');
  await page.click('[data-tabs] [role="tab"]:has-text("3D")');
  await page.waitForFunction(() => window.cadcraft.host.ws3d?.active === true, null, { timeout: 15000 });
  await page.waitForTimeout(300);
  ok(threeRequests.some((u) => /three\.module\.js/.test(u)), 'opening it loads three.js');
  ok(await page.getAttribute('[data-tabs] [role="tab"]:has-text("3D")', 'aria-selected') === 'true', 'the 3D tab is selected');
  r = await rows();
  ok(r.rows <= 2 && r.names.includes('3D') && r.names.includes('Edit') && !r.names.includes('Draw'), 'toolbar on the 3D tab: File, 3D, Edit — still two rows at most', JSON.stringify(r));
  ok(await page.isVisible('.cc-3d [data-viewcube]') && !(await page.isVisible('.cc-3d [data-axis-icon]')), 'Automatic (the start): the 3D tab shows the view cube');
  await shot('3d-01-open-paper');

  console.log('\n== EXTRUDE by clicking inside the rectangle');
  await page.click('[aria-label="3D"] [data-cmd="EXTRUDE"]');
  await page.waitForTimeout(100);
  let p = await at3(500, 300, 0);
  await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(100);
  ok(await ws(() => window.cadcraft.host.selection.size) === 1, 'a click inside the rectangle picks it');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(80);
  await page.keyboard.type('400'); await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  let s = await solids();
  ok(s.length === 1 && near(s[0].max[2], 400, 1e-6) && near(s[0].max[0], 1000, 1e-6), 'typing 400 extrudes it: a 1000 × 600 × 400 solid', JSON.stringify(s));
  await shot('3d-02-extruded-paper');

  console.log('\n== orbit, zoom');
  const eye0 = await ws(() => window.cadcraft.host.ws3d.cam.eye.slice());
  const c = await ws(() => { const r = document.querySelector('.cc-3d-over').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(c.x, c.y);
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(c.x + 120, c.y + 30, { steps: 6 });
  await page.mouse.up({ button: 'middle' });
  const eye1 = await ws(() => window.cadcraft.host.ws3d.cam.eye.slice());
  ok(Math.hypot(eye1[0] - eye0[0], eye1[1] - eye0[1], eye1[2] - eye0[2]) > 1e-3, 'middle-drag orbits');
  const d0 = await ws(() => window.cadcraft.host.ws3d.cam.distance);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(80);
  ok(await ws(() => window.cadcraft.host.ws3d.cam.distance) < d0, 'the wheel zooms in');

  console.log('\n== touch on the 3D tab (S.8): three fingers orbit, two pinch, a long press is Enter, one finger turns the cube');
  {
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
    const eye = () => ws(() => window.cadcraft.host.ws3d.cam.eye.slice());
    const moved = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const tri = (dx) => [[c.x - 60 + dx, c.y], [c.x + dx, c.y - 50], [c.x + 60 + dx, c.y]];
    const n0 = (await solids()).length;
    let e0 = await eye();
    await touch('touchStart', tri(0));
    for (let k = 1; k <= 6; k++) { await touch('touchMove', tri(k * 20)); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
    await page.waitForTimeout(100);
    const e1 = await eye();
    ok(moved(e0, e1) > 1e-3 && (await solids()).length === n0, 'a three-finger drag orbits (and draws nothing)', JSON.stringify([e0, e1]));
    const dz = await ws(() => window.cadcraft.host.ws3d.cam.distance);
    await touch('touchStart', [[c.x - 40, c.y], [c.x + 40, c.y]]);
    for (let k = 1; k <= 6; k++) { await touch('touchMove', [[c.x - 40 - k * 15, c.y], [c.x + 40 + k * 15, c.y]]); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
    await page.waitForTimeout(100);
    ok(await ws(() => window.cadcraft.host.ws3d.cam.distance) < dz, 'a two-finger pinch zooms in');
    await typeCmd('LTSCALE');
    ok(await ws(() => window.cadcraft.engine.busy), 'LTSCALE waits for its value');
    await touch('touchStart', [[c.x + 200, c.y + 120]]);
    await page.waitForTimeout(800);
    await touch('touchEnd', []);
    await page.waitForTimeout(150);
    ok(!(await ws(() => window.cadcraft.engine.busy)) && (await solids()).length === n0, 'a long press is Enter: the command takes its default and ends, nothing drawn');
    const cube = await ws(() => { const r = document.querySelector('.cc-3d [data-viewcube] canvas, .cc-3d [data-viewcube]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    e0 = await eye();
    await touch('touchStart', [[cube.x, cube.y]]);
    for (let k = 1; k <= 6; k++) { await touch('touchMove', [[cube.x + k * 8, cube.y + k * 2]]); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
    await page.waitForTimeout(700);
    ok(moved(e0, await eye()) > 1e-3, 'one finger dragging the view cube turns the view');
    // a tap is still a click: LINE by two taps on the ground
    const lines0 = await ws(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line').length);
    await typeCmd('LINE');
    for (const [x, y] of [[c.x - 150, c.y + 150], [c.x - 60, c.y + 170]]) { await touch('touchStart', [[x, y]]); await page.waitForTimeout(60); await touch('touchEnd', []); await page.waitForTimeout(120); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    ok(await ws(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line').length) === lines0 + 1, 'two one-finger taps draw a line (a tap is a click)');
    await ws(() => window.cadcraft.doc.undo());   // leave the undo history as the later checks expect it
    await cdp.detach();
  }

  console.log('\n== styles and views');
  for (const [label, key] of [['Hidden line', 'hidden'], ['Wireframe', 'wire'], ['X-ray', 'xray'], ['Shaded', 'shaded'], ['Shaded with edges', 'edges']]) {
    await page.click('[data-style3d-menu] > summary');
    await page.click('[data-style3d-menu] [role="menuitemradio"]:text-is("' + label + '")');
    await page.waitForTimeout(150);
    ok(await ws(() => window.cadcraft.host.ws3d.styleKey) === key, 'Style › ' + label);
    if (key === 'hidden' || key === 'xray') await shot('3d-03-style-' + key);
  }
  await page.click('[data-view3d-menu] > summary');
  await page.click('[data-view3d-menu] [role="menuitem"]:text-is("Front")');
  await page.waitForTimeout(150);
  let dir = await camDir();
  ok(near(dir[1], 1, 1e-3), 'Views › Front looks along +Y', JSON.stringify(dir));
  await page.click('[data-view3d-menu] > summary');
  await page.click('[data-view3d-menu] [role="menuitem"]:text-is("Iso")');
  await page.waitForTimeout(150);

  console.log('\n== PRESSPULL by clicks and a typed distance');
  await page.click('[aria-label="3D"] [data-cmd="PRESSPULL"]');
  await page.waitForTimeout(100);
  p = await at3(500, 300, 400);
  await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y);
  await page.waitForTimeout(100);
  ok(await ws(() => window.cadcraft.host.ws3d.tools.tool.busy), 'a click on the top face takes it');
  await page.keyboard.type('100'); await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  s = await solids();
  ok(near(s[0].max[2], 500, 1e-6) && !(await ws(() => window.cadcraft.engine.busy)), 'typing 100 pulls it to 500 high', JSON.stringify(s));
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok(near((await solids())[0].max[2], 400, 1e-6), 'Ctrl+Z: back to 400');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok((await solids()).length === 0 && await ws(() => window.cadcraft.doc.count()) === 2, 'Ctrl+Z again: the extrusion goes, the 2D drawing stays');
  await page.keyboard.press('Control+y'); await page.waitForTimeout(150);
  ok((await solids()).length === 1, 'Ctrl+Y brings the solid back');

  console.log('\n== BOX by clicks, then select and Delete');
  await page.click('[data-view3d-menu] > summary');
  await page.click('[data-view3d-menu] [role="menuitem"]:text-is("Top")');
  await page.waitForTimeout(150);
  await page.click('[aria-label="3D"] [data-cmd="BOX"]');
  p = await at3(1400, 900); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80);
  p = await at3(1800, 1100); await page.mouse.move(p.x, p.y, { steps: 3 }); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80);
  await page.keyboard.type('300'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  s = await solids();
  ok(s.length === 2 && near(s[1].max[0] - s[1].min[0], 400, 30) && near(s[1].max[2], 300, 1e-6), 'BOX: two clicks on the ground and a typed height', JSON.stringify(s[1]));
  await page.click('[data-view3d-menu] > summary');
  await page.click('[data-view3d-menu] [role="menuitem"]:text-is("Iso")');
  await page.waitForTimeout(150);
  p = await at3(1600, 1000, 300);
  await page.mouse.click(p.x, p.y); await page.waitForTimeout(100);
  ok(await ws(() => window.cadcraft.host.ws3d.th.sel.length) === 1, 'a click selects the box');
  await shot('3d-04-selected-paper');
  await page.keyboard.press('Delete'); await page.waitForTimeout(150);
  ok((await solids()).length === 1, 'Delete erases it');

  console.log('\n== UNION from the 3D More menu (0.4 C12)');
  await typeCmd('BOX'); await typeCmd('800,400'); await typeCmd('@600,400'); await typeCmd('300');
  ok((await solids()).length === 2, 'a box overlapping the extrusion');
  await ws(() => window.cadcraft.host.ws3d.selectAll());
  await page.click('[data-bool3d-menu] > summary');
  await page.click('[data-bool3d-menu] [data-cmd="UNION"]');
  await page.waitForFunction(() => window.cadcraft.doc.model3d.root.insts.size === 1, null, { timeout: 30000 }).catch(() => {});
  s = await solids();
  ok(s.length === 1 && /joined into one/.test(await page.textContent('[data-history]')), 'UNION (manifold-3d, loaded now) joins them into one solid', JSON.stringify(s));
  await shot('3d-04b-union-paper');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok((await solids()).length === 2, 'one Ctrl+Z gives both back');
  await ws(() => window.cadcraft.host.ws3d.selectAll());
  await page.keyboard.press('Delete'); await page.waitForTimeout(150);
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  await ws(() => { const ws = window.cadcraft.host.ws3d; ws.clearSel(); const m = window.cadcraft.doc.model3d; const last = [...m.root.insts.keys()].pop(); m.change('x', () => m.root.insts.delete(last)); });
  ok((await solids()).length === 1, 'back to the one extrusion for what follows');

  console.log('\n== drawing units change: the solid follows');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  const sBefore = await solids();
  const wBefore = await ws(() => { const m = window.cadcraft.doc.model3d; return m.bbox().max[0]; });
  await page.selectOption('#cc-cur-units', 'inches');
  await page.waitForTimeout(150);
  const sAfter = await solids();
  ok(JSON.stringify(sAfter) === JSON.stringify(sBefore) && near(await ws(() => window.cadcraft.doc.model3d.bbox().max[0]), wBefore * 25.4, 1e-9), 'Units → Inches: the solid keeps its drawing-unit size (×25.4 in meters), still on the drawing', JSON.stringify(sAfter));
  ok(/3D model was scaled ×25\.4/.test(await page.textContent('[data-history]')), 'the command line says the 3D model was scaled');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok(await ws(() => window.cadcraft.doc.meta.units) === '' && near(await ws(() => window.cadcraft.doc.model3d.bbox().max[0]), wBefore, 1e-12), 'one Ctrl+Z puts the units and the solid back');

  console.log('\n== model theme');
  await ws(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(300);
  await shot('3d-05-model');
  await ws(() => { document.documentElement.dataset.space = 'paper'; });
  await page.waitForTimeout(150);

  console.log('\n== save as DXF, export GLB, reopen');
  let dl = page.waitForEvent('download');
  await typeCmd('DXFOUT');
  const dxf = await dl;
  const dxfPath = path.join(SHOTS, 'cc3d-saved.dxf');
  await dxf.saveAs(dxfPath);
  const text = fs.readFileSync(dxfPath, 'utf8');
  ok(/\n3DFACE\r?\n/.test(text) && /CADCRAFT_3D/.test(text), 'the DXF holds 3DFACEs and block CADCRAFT_3D');
  dl = page.waitForEvent('download');
  await page.click('[data-export3d-menu] > summary');
  await page.click('[data-export3d-menu] [role="menuitem"]:has-text("GLB")');
  const glb = await dl;
  const gp = path.join(SHOTS, 'cc3d.glb'); await glb.saveAs(gp);
  ok(fs.readFileSync(gp).subarray(0, 4).toString() === 'glTF', 'Export › GLB downloads a glTF binary', glb.suggestedFilename());
  const before = await solids();
  await page.evaluate(() => window.cadcraft.doc.markSaved());
  await page.click('[data-tabs] [role="tab"]:has-text("Model")');
  await page.setInputFiles('[data-file]', dxfPath);
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'cc3d-saved.dxf', null, { timeout: 10000 });
  const after = await solids();
  ok(after.length === 1 && JSON.stringify(after) === JSON.stringify(before), 'reopened: the solid is back exactly', JSON.stringify(after));
  ok(await ws(() => window.cadcraft.host.ws3d.active) === false, 'the Model tab shows the 2D drawing again');
  r = await rows();
  ok(r.rows === 2 && !r.names.includes('3D'), 'back on the Model tab: the 2D toolbar, two rows', JSON.stringify(r));

  console.log('\n== corner indicator: the view cube');
  await page.click('[data-settings-open]');
  const appTab = await page.$('[role="tab"]:has-text("CadCraft")');
  if (appTab) await appTab.click();
  ok(await page.isChecked('input[name="ccCorner"][value="auto"]'), 'Settings › CadCraft › Corner indicator: Automatic by default');
  await page.check('input[name="ccCorner"][value="cube"]');
  await page.click('.shell-dlg-foot button[type="submit"]');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')).corner)) === 'cube', 'saved as corner: cube in cadcraft.settings');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  ok(await page.isVisible('.cc-canvases > [data-viewcube]'), 'after a reload the Model tab shows the view cube (looking from the top)');
  ok(await ws(() => window.cadcraft.view.ucs) === false, 'and no X/Y axis icon');
  await shot('3d-06-cube-model-tab');
  await page.hover('.cc-canvases > [data-viewcube] svg');
  await page.click('.cc-canvases > [data-viewcube] [data-vc-step="down"]');
  await page.waitForFunction(() => window.cadcraft.host.ws3d?.active === true, null, { timeout: 15000 });
  await page.waitForTimeout(700);
  dir = await camDir();
  ok(near(dir[1], 1, 1e-3) && near(dir[2], 0, 1e-3), 'its front step opens the 3D tab looking from the front', JSON.stringify(dir));
  ok(await page.isVisible('.cc-3d [data-viewcube]') && !(await page.isVisible('.cc-canvases > [data-viewcube]')), 'the 3D tab has its own cube; the Model tab\'s is hidden');
  await page.hover('.cc-3d [data-viewcube] svg');
  // the top front edge, on the face that shows (looking from the front: the band along the front face's top)
  const edge = await ws(() => { const c = [...document.querySelectorAll('.cc-3d [data-viewcube] [data-vc-key="top-front"]')].find((x) => !x.closest('g[display="none"]')); const r = c?.getBoundingClientRect(); return r && { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(edge.x, edge.y); await page.mouse.click(edge.x, edge.y);
  await page.waitForTimeout(700);
  dir = await camDir();
  ok(dir[1] > 0.5 && dir[2] < -0.5, 'clicking the cube\'s top front edge looks from there', JSON.stringify(dir));
  await shot('3d-07-cube-3d-paper');
  await page.click('.cc-3d [data-vc-home]');
  await page.waitForTimeout(700);
  dir = await camDir();
  ok(dir[0] < 0 && dir[1] > 0 && dir[2] < 0, 'Home: the iso view', JSON.stringify(dir));
  await ws(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(300);
  await shot('3d-08-cube-3d-model');
  await ws(() => { document.documentElement.dataset.space = 'paper'; });

  // put the setting back
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.settings'); } catch {} });
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', (err.stack || err.message) + ' / problems: ' + problems.join(' | '));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed  (screenshots in ' + SHOTS + ')');
process.exit(fail ? 1 : 0);
