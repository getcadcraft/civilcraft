#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-part2.mjs — BimCraft's 0.4 part 2 items (session `bim-civil`) in the lab, headless, with real clicks and keys.
 * Grows one section per finished item.
 *   node tools/bimcraft-test/browser-part2.mjs [--shots <dir>] [--only w26,i11,…]
 * Run as root: signs in with BimCraft's own test admin (tools/bimcraft-test/admin.php up|down, disabled again at the end)
 * and drives the cached Playwright Chromium. The admin-login throttle (10 / 10 min for 127.0.0.1) is shared: run it once
 * per finished item. Fails on any console error.
 *
 *   w26  browser edition (`#cc-edition` {library: false}, injected into the lab page): no Library tab, no Library or
 *        Updates button, ?library=<uuid> ignored, not one request to /api/v1/library; Equipment and Credits stay
 *   i11  cc-ifc instead of web-ifc: the import map has no web-ifc and maps manifold-3d; nothing is fetched from
 *        /assets/vendor/web-ifc; the generated fixture opens (its door cut into its wall: no "not cut" note); a public
 *        sample (testfiles/samples, skipped in a clone) opens with its elements; the file panel's "Not drawn yet" line
 *   n7   a .pln (any bytes) is refused with the export advice; the picker offers .pln/.pla/.tpl/.bpn; F1 → the help
 *        topic "Open .pln and .pla project files" is listed
 *   s8   touch (CDP touch events, a touch context): the app marks itself .is-touch and tools grow to finger size; in the IFC
 *        model a tap picks W-101, a long press adds W-102, a pinch zooms and picks nothing; in a drawing a pinch zooms
 *        ×2.5 about its middle (the point there stays put), one finger pans, a double tap fits; walking, the walk pad
 *        shows and holding "forward" moves the eye
 *   w219 files through host.js with a stand-in desktop bridge (window.cadcraftDesktop, an in-memory disk): the file the app
 *        was started with opens; Open (the label) uses the native dialog; a double-clicked file while running opens; Save
 *        as IFC goes through the save dialog, named "<name> (edited).ifc", and writes a real IFC; a CSV export too; the
 *        original file is never written
 *   a12  autosave (1.2): delete an element in the fixture, wait for the copy, close the tab without saving (a crash); a
 *        new tab offers "Recover your work?" with the model; Recover opens it with the element gone and Save as IFC on;
 *        saving it makes the copy go (a third tab offers nothing)
 *   x7   assistant tools (X.7, host.control): off by default (-32001); with bimcraft.settings `assistants` on, tools/list
 *        has elements_find, elements_isolate, element_properties; find Level 1's walls, isolate them (the view and the
 *        status as the Show menu), their properties, show all; the activity log
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const TESTFILES = process.env.BIMCRAFT_TESTFILES || path.join(REPO, '..', 'testfiles');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/bimcraft-part2');
fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? new Set(process.argv[oi + 1].split(',')) : null;
const want = (k) => !ONLY || ONLY.has(k);

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const shot = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const requests = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('request', (r) => requests.push(r.url()));

const waitStatus = (re, timeout = 90000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const fixtureFile = (opts = {}, name = 'bimcraft-fixture.ifc') => ({ name, mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc(opts)) });
const openFile = async (file) => {
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });
  await page.setInputFiles('[data-file]', file);
  await waitStatus(/^Opened |could not/);
};
/** Hidden on purpose (its own `hidden`), whatever its container shows right now (the toolbar waits for a model). */
const hidden = (sel) => page.evaluate((s) => { const n = document.querySelector(s); return !n || n.hidden; }, sel);

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  if (/\/admin\/login/.test(page.url())) throw new Error('admin sign-in refused (the login throttle is 10 per 10 minutes for 127.0.0.1: wait, do not clear it)');

  if (want('w26')) {
    console.log('== W2.6 browser edition: no Library');
    // the edition page carries #cc-edition; here it is injected into the lab page before the module runs
    await page.route(/\/lab\/bimcraft(\?|$)/, async (route) => {
      const res = await route.fetch();
      const body = (await res.text()).replace('</head>', '<script type="application/json" id="cc-edition">{"edition":"browser","library":false,"cloud":false,"handoff":false}</script></head>');
      await route.fulfill({ response: res, body, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
    });
    requests.length = 0;
    await page.goto(BASE + '/lab/bimcraft?space=paper&library=11111111-2222-3333-4444-555555555555', { waitUntil: 'networkidle' });
    ok(await page.evaluate(() => !!document.getElementById('cc-edition')), 'the edition flags are on the page');
    ok(await hidden('[data-rtab="library"]'), 'no Library tab in the right panel');
    ok(await hidden('[data-lib-tool="library"]') && await hidden('[data-lib-tool="updates"]'), 'no Library and no Updates button in the toolbar');
    ok(!(await hidden('[data-lib-tool="equipment"]')) && !(await hidden('[data-lib-tool="credits"]')), 'Equipment and Credits stay (they read the model only)');
    ok(await page.evaluate(() => document.querySelector('[data-rpane="library"]').hidden), '?library=<uuid> does not open the library pane');
    await page.setInputFiles('[data-file]', fixtureFile());
    await waitStatus(/^Opened /);
    await page.keyboard.press('Escape');
    const lib = requests.filter((u) => /\/api\/v1\/library/.test(u));
    ok(!lib.length, 'not one request to /api/v1/library', lib.slice(0, 3).join(' '));
    await shot(page, 'w26-01-edition-no-library');
    await page.unroute(/\/lab\/bimcraft(\?|$)/);
    // and the ordinary lab page still has it
    await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    ok(!(await hidden('[data-rtab="library"]')) && !(await hidden('[data-lib-tool="library"]')), 'the lab page (no edition flags) keeps the Library tab and button');
  }

  if (want('i11')) {
    console.log('== I.11 cc-ifc instead of web-ifc');
    requests.length = 0;
    await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    const map = await page.evaluate(() => JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports);
    ok(!Object.keys(map).some((k) => /web-ifc/.test(k)) && !Object.values(map).some((v) => /web-ifc/.test(v)), 'the import map has no web-ifc');
    ok(/\/assets\/vendor\/manifold-3d\/[\d.]+\/manifold\.js/.test(map['manifold-3d'] || ''), 'manifold-3d is mapped to a real version folder', map['manifold-3d']);
    await openFile(fixtureFile());
    const st = await page.evaluate(() => ({ status: document.querySelector('[data-status]').textContent, info: document.querySelector('[data-file-dl]').textContent, notes: document.querySelector('[data-ifc-notes]')?.textContent || '' }));
    ok(/^Opened bimcraft-fixture\.ifc: \d+ elements/.test(st.status), 'the generated fixture opens on cc-ifc', st.status);
    ok(!/not cut|uncut/i.test(st.notes), 'openings are cut (manifold-3d loaded): no "not cut" note', st.notes);
    ok(!requests.some((u) => /\/vendor\/web-ifc\//.test(u)), 'nothing fetched from /assets/vendor/web-ifc');
    ok(requests.some((u) => /\/vendor\/manifold-3d\/[^/]+\/manifold\.wasm/.test(u)), 'manifold-3d\'s wasm was loaded for the openings');
    await shot(page, 'i11-01-fixture');
    const sample = path.join(TESTFILES, 'samples/Ifc2x3_Duplex_Architecture.ifc');
    if (fs.existsSync(sample)) {
      await openFile(sample);
      const s2 = await page.evaluate(() => document.querySelector('[data-status]').textContent);
      const n = Number((s2.match(/: ([\d,]+) elements/) || [])[1]?.replace(/,/g, '') || 0);
      ok(n > 200, 'the Duplex sample opens with its elements (' + n + ')', s2);
      await shot(page, 'i11-02-duplex');
      await page.click('[data-space-toggle], .app-bar [data-space="model"]').catch(() => {});
    } else console.log('  (skipped: the public samples are not in this checkout)');
  }
  if (want('n7')) {
    console.log('== N.7 .pln files and their help topic');
    await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    ok(/\.pln,\.pla,\.tpl,\.bpn/.test(await page.getAttribute('[data-file]', 'accept')), 'the file picker offers .pln, .pla, .tpl and .bpn');
    await page.setInputFiles('[data-file]', { name: 'Tower.pln', mimeType: 'application/octet-stream', buffer: Buffer.from('not read') });
    await waitStatus(/project file/);
    const msg = await page.evaluate(() => document.querySelector('[data-status]').textContent);
    // 0.6 DF.12 (bim-interop): bytes that don't start like an Archicad project are said to be named like one (open.pln.renamed)
    ok(/^Tower\.pln is named like an Archicad file but does not start like one: .* export IFC .* DWG/.test(msg), '"Tower.pln is named like an Archicad file but does not start like one … export IFC … DWG"', msg);
    await shot(page, 'n7-01-pln-refused');
    await page.keyboard.press('F1');
    await page.waitForTimeout(800);
    const found = await page.evaluate(() => [...document.querySelectorAll('[data-help-panel] a, [data-help-panel] button')].some((a) => /Open \.pln and \.pla project files/.test(a.textContent)));
    ok(found, 'Help lists "Open .pln and .pla project files"');
    await page.keyboard.press('Escape');
  }
  if (want('s8')) {
    console.log('== S.8 touch');
    const tctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
    const tp = await tctx.newPage();
    tp.on('console', (m) => { if (m.type() === 'error') problems.push('touch console: ' + m.text()); });
    tp.on('pageerror', (e) => problems.push('touch pageerror: ' + e.message));
    await tctx.addCookies(await ctx.cookies());   // the same signed-in session (one admin login per run)
    await tp.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    if (!/\/lab\/bimcraft/.test(tp.url())) throw new Error('the touch context is not signed in: ' + tp.url() + ' cookies ' + (await ctx.cookies()).map((c) => c.name + '@' + c.domain).join(' '));
    const cdp = await tctx.newCDPSession(tp);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
    const tap = async (x, y) => { await touch('touchStart', [[x, y]]); await touch('touchEnd', []); };
    const tWait = (re) => tp.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 90000 });
    await tp.setInputFiles('[data-file]', fixtureFile());
    await tWait(/^Opened /);
    await tp.waitForTimeout(300);
    const spot = (name) => tp.evaluate((n) => {
      const v = document.querySelector('[data-canvas]').viewer, k = window.bimcraftKeys(n), c = v.screenOf(k), R = v.canvas.getBoundingClientRect();
      for (let r = 0; r <= 240; r += 6) for (let a = 0; a < 360; a += r ? 15 : 360) {
        const x = c.x + r * Math.cos(a * Math.PI / 180), y = c.y + r * Math.sin(a * Math.PI / 180);
        if (x > R.left + 4 && x < R.right - 4 && y > R.top + 4 && y < R.bottom - 4 && v.hitAt(x, y)?.id === k) return { x, y, k };
      }
      return null;
    }, name);
    const picked = () => tp.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection]);
    const a = await spot('W-101'), b = await spot('W-102');
    await tap(a.x, a.y);
    await tp.waitForTimeout(200);
    ok(await tp.evaluate(() => document.querySelector('[data-bimcraft]').classList.contains('is-touch')), 'the first touch marks the app .is-touch');
    const h = await tp.evaluate(() => document.querySelector('[data-toggle="edges"]').getBoundingClientRect().height);
    ok(h >= 43, 'toolbar buttons are finger-sized (' + h.toFixed(0) + ' px)');
    ok(JSON.stringify(await picked()) === JSON.stringify([a.k]), 'a tap picks W-101');
    await touch('touchStart', [[b.x, b.y]]);
    await tp.waitForTimeout(750);
    await touch('touchEnd', []);
    await tp.waitForTimeout(200);
    const two = await picked();
    ok(two.length === 2 && two.includes(a.k) && two.includes(b.k), 'a long press on W-102 adds it to the pick (' + two.join(', ') + ')');
    await tap(a.x, a.y);   // back to one
    const d0 = await tp.evaluate(() => document.querySelector('[data-canvas]').viewer.camera.position.distanceTo(document.querySelector('[data-canvas]').viewer.controls.target));
    const c2 = await spot('W-102');
    await touch('touchStart', [[c2.x - 40, c2.y], [c2.x + 40, c2.y]]);
    for (let i = 1; i <= 6; i++) await touch('touchMove', [[c2.x - 40 - i * 15, c2.y], [c2.x + 40 + i * 15, c2.y]]);
    await touch('touchEnd', []);
    await tp.waitForTimeout(200);
    const d1 = await tp.evaluate(() => document.querySelector('[data-canvas]').viewer.camera.position.distanceTo(document.querySelector('[data-canvas]').viewer.controls.target));
    ok(d1 < d0 * 0.8, 'a pinch over W-102 zooms in (distance ' + d0.toFixed(1) + ' → ' + d1.toFixed(1) + ' m)');
    ok(JSON.stringify(await picked()) === JSON.stringify([a.k]), 'and picks nothing (W-101 stays the pick)');
    await tp.screenshot({ path: path.join(SHOTS, 's8-01-ifc-touch.png') });
    // walk: tap the Walk tool, tap the floor, hold forward
    await tp.click('[data-toggle="walk"]');
    const floor = await tp.evaluate(() => { const r = document.querySelector('[data-canvas]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 }; });
    let started = false;
    for (const dy of [0, 40, -40, 80, -80, 120]) {
      await tap(floor.x, floor.y + dy);
      await tp.waitForTimeout(150);
      if (await tp.evaluate(() => !!window.bimcraftWalk.state())) { started = true; break; }
    }
    ok(started, 'Walk: a tap on the model sets where to stand');
    if (started) {
      ok(await tp.evaluate(() => getComputedStyle(document.querySelector('[data-walkpad]')).display !== 'none'), 'the walk pad shows on a touch screen');
      ok(/hold the arrow buttons/.test(await tp.textContent('[data-walk-out]')), 'the walk bar says how to walk by touch');
      const p0 = await tp.evaluate(() => window.bimcraftWalk.state().pos);
      const fb = await tp.evaluate(() => { const r = document.querySelector('[data-walk-key="w"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await touch('touchStart', [[fb.x, fb.y]]);
      await tp.waitForTimeout(700);
      await touch('touchEnd', []);
      await tp.waitForTimeout(100);
      const p1 = await tp.evaluate(() => window.bimcraftWalk.state().pos);
      const moved = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
      ok(moved > 0.2, 'holding "Walk forward" moves the eye (' + moved.toFixed(2) + ' m)');
      await tp.screenshot({ path: path.join(SHOTS, 's8-02-walk-pad.png') });
      await tp.click('[data-walk-done]');
    }
    // a drawing: pinch, pan, double tap
    await tp.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'));
    await tWait(/^Opened /);
    await tp.waitForTimeout(300);
    const R = await tp.evaluate(() => { const r = document.querySelector('[data-dwg-canvas]').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    const st = () => tp.evaluate(([x, y]) => { const v = document.querySelector('[data-dwg-canvas]').view; return { z: v.zoom, w: v.toWorld(x, y), cx: v.cx, cy: v.cy }; }, [R.w / 2, R.h / 2]);
    const s0 = await st();
    await touch('touchStart', [[cx - 60, cy], [cx + 60, cy]]);
    for (let i = 1; i <= 6; i++) { const d = 60 + i * 15; await touch('touchMove', [[cx - d, cy], [cx + d, cy]]); }
    await touch('touchEnd', []);
    const s1 = await st();
    ok(Math.abs(s1.z / s0.z - 2.5) < 0.05, 'drawing: a pinch 120 → 300 px zooms × ' + (s1.z / s0.z).toFixed(3));
    const drift = Math.hypot(s1.w[0] - s0.w[0], s1.w[1] - s0.w[1]) * s1.z;
    ok(drift < 2, 'the drawing point under the pinch middle stays put (' + drift.toFixed(2) + ' px)');
    await touch('touchStart', [[cx, cy]]);
    for (let i = 1; i <= 5; i++) await touch('touchMove', [[cx + i * 20, cy + i * 10]]);
    await touch('touchEnd', []);
    const s2 = await st();
    ok(Math.abs((s1.cx - s2.cx) * s2.z - 100) < 2 && Math.abs((s2.cy - s1.cy) * s2.z - 50) < 2, 'one finger pans 100, 50 px');
    await tap(cx, cy); await tp.waitForTimeout(80); await tap(cx, cy);
    await tp.waitForTimeout(200);
    const s3 = await st();
    const zFit = await tp.evaluate(() => { const v = document.querySelector('[data-dwg-canvas]').view; v.fit(); return v.zoom; });
    ok(Math.abs(s3.z - zFit) / zFit < 0.01, 'a double tap fits the sheet again', s0.z + ' → ' + s2.z + ' → ' + s3.z + ', fit ' + zFit);
    await tp.screenshot({ path: path.join(SHOTS, 's8-03-drawing-touch.png') });
    await tctx.close();
  }
  if (want('w219')) {
    console.log('== W2.19 files through host.js (stand-in desktop bridge)');
    const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await dctx.addCookies(await ctx.cookies());
    const ifcText = Buffer.from(fixtureIfc({})).toString('latin1');
    await dctx.addInitScript((ifc) => {
      const enc = (t) => { const b = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i) & 255; return b; };
      const files = new Map([['/home/u/Jobs/Start.ifc', enc(ifc)], ['/home/u/Jobs/Second.ifc', enc(ifc)], ['/home/u/Jobs/Third.ifc', enc(ifc)]]);
      const calls = [];
      let listener = null;
      const launch = ['/home/u/Jobs/Start.ifc'];
      window.__desk = { files, calls, fire: (p) => listener && listener(p), next: { open: null, save: null } };
      window.cadcraftDesktop = {
        version: 1,
        async openDialog(o) { calls.push(['open', JSON.stringify(o)]); return window.__desk.next.open; },
        async saveDialog(o) { calls.push(['save', JSON.stringify(o)]); return window.__desk.next.save; },
        async readFile(p) { calls.push(['read', p]); if (!files.has(p)) throw new Error('not found'); return files.get(p); },
        async writeFile(p, b) { calls.push(['write', p, b.length]); files.set(p, b); },
        async stat(p) { return files.has(p) ? { size: files.get(p).length, mtime: 42 } : null; },
        async launchFiles() { return launch.splice(0); },
        onOpenFiles(cb) { listener = cb; },
      };
    }, ifcText);
    const dp = await dctx.newPage();
    dp.on('console', (m) => { if (m.type() === 'error') problems.push('desktop console: ' + m.text()); });
    dp.on('pageerror', (e) => problems.push('desktop pageerror: ' + e.message));
    const dWait = (re) => dp.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 90000 });
    const calls = () => dp.evaluate(() => window.__desk.calls);
    await dp.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await dWait(/^Opened Start\.ifc/);
    ok(true, 'the file the app was started with opens (Start.ifc)');
    await dp.evaluate(() => { window.__desk.next.open = ['/home/u/Jobs/Second.ifc']; });
    await dp.evaluate(() => document.querySelector('[data-status]').textContent = '');
    await dp.click('label[for="bc-file"]');
    await dWait(/^Opened Second\.ifc/);
    ok((await calls()).some((c) => c[0] === 'open' && /"ifc"/.test(c[1])), 'Open uses the native dialog (with the IFC file types) and opens Second.ifc');
    await dp.evaluate(() => window.__desk.fire(['/home/u/Jobs/Third.ifc']));
    await dWait(/^Opened Third\.ifc/);
    ok(true, 'a file double-clicked while running opens (Third.ifc)');
    // an edit, then Save as IFC
    const k = await dp.evaluate(() => window.bimcraftKeys('W-104'));
    await dp.evaluate((key) => { const v = document.querySelector('[data-canvas]').viewer; v.select(key); v.onPick(key, {}); }, k);
    await dp.locator('[data-canvas]').focus().catch(() => {});
    await dp.keyboard.press('Delete');
    await dp.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
    await dp.evaluate(() => { window.__desk.next.save = '/home/u/Jobs/Third (edited).ifc'; });
    await dp.click('[data-save]');
    await dWait(/^Saved /);
    const c2 = await calls();
    const saveCall = c2.find((c) => c[0] === 'save');
    ok(saveCall && /Third \(edited\)\.ifc/.test(saveCall[1]), 'Save as IFC asks where, suggesting "Third (edited).ifc"', saveCall?.[1]);
    const written = await dp.evaluate(() => { const b = window.__desk.files.get('/home/u/Jobs/Third (edited).ifc'); return b ? String.fromCharCode(...b.slice(0, 13)) + '|' + b.length : null; });
    ok(/^ISO-10303-21;\|\d+/.test(written || ''), 'it wrote a real IFC there (' + written + ')');
    ok(!c2.some((c) => c[0] === 'write' && /\/(Start|Second|Third)\.ifc$/.test(c[1])), 'the opened files were never written');
    await dWait(/unchanged/);
    // an export: the 4D template CSV
    await dp.evaluate(() => { window.__desk.next.save = '/home/u/Jobs/tasks.csv'; window.__desk.calls.length = 0; });
    await dp.evaluate(() => { document.querySelector('[data-4d-details]').open = true; });
    const tmpl = await dp.waitForSelector('[data-4d-template]', { state: 'attached', timeout: 10000 }).catch(() => null);
    if (tmpl) {
      await dp.evaluate(() => document.querySelector('[data-4d-template]').click());
      await dp.waitForTimeout(500);
      const c3 = await calls();
      ok(c3.some((c) => c[0] === 'write' && /tasks\.csv$/.test(c[1])), 'an export (the 4D task template) goes through the save dialog', JSON.stringify(c3) + ' / ' + await dp.evaluate(() => document.querySelector('[data-status]').textContent));
    } else ok(false, 'the 4D template button was found');
    await dp.screenshot({ path: path.join(SHOTS, 'w219-01-desktop-bridge.png') });
    await dctx.close();
  }
  if (want('a12')) {
    console.log('== 1.2 autosave and recovery');
    const actx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    await actx.addCookies(await ctx.cookies());
    const watch = (p) => { p.on('console', (m) => { if (m.type() === 'error') problems.push('autosave console: ' + m.text()); }); p.on('pageerror', (e) => problems.push('autosave pageerror: ' + e.message)); };
    let ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.evaluate(() => new Promise((r) => { const q = indexedDB.deleteDatabase('cadcraft-autosave'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
    await ap.reload({ waitUntil: 'networkidle' });
    await ap.setInputFiles('[data-file]', fixtureFile());
    await ap.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]').textContent), null, { timeout: 60000 });
    const k = await ap.evaluate(() => window.bimcraftKeys('W-104'));
    await ap.evaluate((key) => { const v = document.querySelector('[data-canvas]').viewer; v.select(key); v.onPick(key, {}); }, k);
    await ap.locator('[data-canvas]').focus().catch(() => {});
    await ap.keyboard.press('Delete');
    await ap.waitForFunction(() => !document.querySelector('[data-save]').disabled, null, { timeout: 30000 });
    await ap.waitForTimeout(3500);   // the copy is written ~2 s after the edits stop
    await ap.close({ runBeforeUnload: false });   // the tab "crashes"
    ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.waitForSelector('[data-autosave-dialog][open]', { timeout: 15000 });
    const rows = await ap.$$eval('[data-autosave-row]', (r) => r.map((x) => x.textContent));
    ok(rows.length === 1 && /bimcraft-fixture\.ifc/.test(rows[0]), 'a new tab offers "Recover your work?" with the model (' + rows.length + ' row)');
    await ap.screenshot({ path: path.join(SHOTS, 'a12-01-recover-dialog.png') });
    await ap.click('[data-autosave-recover]');
    await ap.waitForFunction(() => /^Recovered bimcraft-fixture\.ifc/.test(document.querySelector('[data-status]').textContent), null, { timeout: 60000 });
    ok(await ap.evaluate(() => window.bimcraftKeys('W-104') == null && window.bimcraftKeys('W-103') != null), 'the recovered model has W-104 deleted (the edit is in it)');
    ok(await ap.evaluate(() => !document.querySelector('[data-save]').disabled), 'Save as IFC is on for the recovered model');
    await ap.waitForSelector('[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {});
    const [dl] = await Promise.all([ap.waitForEvent('download', { timeout: 15000 }), ap.click('[data-save]')]);
    ok(/bimcraft-fixture \(edited\)\.ifc$/.test(dl.suggestedFilename()), 'saving it downloads "bimcraft-fixture (edited).ifc"');
    await ap.waitForTimeout(800);
    await ap.close({ runBeforeUnload: false });
    ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.waitForTimeout(1500);
    ok(!(await ap.$('[data-autosave-dialog][open]')), 'after saving, a new tab offers nothing');
    await actx.close();
  }
  if (want('x7')) {
    console.log('== X.7 assistant tools (host.control)');
    const xctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await xctx.addCookies(await ctx.cookies());
    const xp = await xctx.newPage();
    xp.on('console', (m) => { if (m.type() === 'error') problems.push('x7 console: ' + m.text()); });
    xp.on('pageerror', (e) => problems.push('x7 pageerror: ' + e.message));
    let id = 0, sid = 'test';
    const rpc = (method, params) => xp.evaluate(([m, p, i, s]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, s), [method, params, ++id, sid]);
    const call = async (name, args) => { const a = await rpc('tools/call', { name, arguments: args }); return a.result; };
    await xp.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    let a = await rpc('tools/list', {});
    ok(a.error && a.error.code === -32001 && /Settings › Assistants/.test(a.error.message), 'assistants off (the default): every request is refused (' + (a.error && a.error.code) + ')');
    await xp.evaluate(() => localStorage.setItem('bimcraft.settings', JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit'] } })));
    await xp.reload({ waitUntil: 'networkidle' });
    a = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'browser-part2', version: '1' } });
    ok(a.result && a.result.serverInfo && a.result.serverInfo.title === 'BimCraft', 'turned on: initialize answers as BimCraft');
    a = await rpc('tools/list', {});
    const listed = (a.result?.tools || []).map((x) => x.name);
    ok(['elements_find', 'elements_isolate', 'element_properties'].every((n) => listed.includes(n)), 'tools/list: ' + listed.join(', '));
    let r = await call('elements_find', {});
    ok(r.isError && /No IFC model is open/.test(r.content[0].text), 'no model yet: the tool says to open one');
    await xp.setInputFiles('[data-file]', fixtureFile());
    await xp.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]').textContent), null, { timeout: 60000 });
    r = await call('elements_find', { class: 'IfcWall', storey: 'Level 1' });
    const walls = r.structuredContent?.elements || [];
    ok(r.structuredContent?.total === 4 && walls.every((e) => e.class === 'IfcWall' && e.storey === 'Level 1'), 'elements_find: Level 1\'s 4 walls (' + walls.map((e) => e.name).join(', ') + ')');
    r = await call('elements_isolate', { how: 'isolate', ids: walls.map((e) => e.id) });
    const v = await xp.evaluate(() => { const vw = document.querySelector('[data-canvas]').viewer; return { st: document.querySelector('[data-status]').textContent, iso: vw.vis.isolated ? vw.vis.isolated.size : null, hidden: vw.vis.hidden.size }; });
    ok(!r.isError && /^Showing only the 4 /.test(v.st), 'elements_isolate isolates them in the view, as the Show menu does: "' + v.st + '"');
    await xp.screenshot({ path: path.join(SHOTS, 'x7-01-isolated.png') });
    r = await call('element_properties', { id: walls[0].id });
    ok(r.structuredContent?.name === walls[0].name && (r.structuredContent?.sets || []).length > 0, 'element_properties: ' + walls[0].name + ' with ' + (r.structuredContent?.sets || []).length + ' sets');
    r = await call('elements_isolate', { how: 'show_all' });
    ok(!r.isError && /^Showing every element/.test(await xp.evaluate(() => document.querySelector('[data-status]').textContent)), 'show_all shows everything again');
    const log = await xp.evaluate(() => window.bimcraftControl.log.map((e) => e.tool + ':' + e.outcome));
    ok(log.includes('elements_isolate:ok') && log.includes('elements_find:error'), 'the activity log has the calls (' + log.length + ')');
    const ban = await xp.evaluate(() => { const b = document.querySelector('[data-assist-banner]'); return b && !b.hidden ? b.textContent : null; });
    ok(ban && /browser-part2/.test(ban) && /change what the view shows/.test(ban), 'the banner says an assistant is connected, by name, and what it can do: "' + (ban || '').trim().slice(0, 90) + '…"');
    await xp.screenshot({ path: path.join(SHOTS, 'x7-02-banner.png') });
    await xp.click('[data-assist-disconnect]');
    a = await rpc('tools/list', {});
    ok(a.error && a.error.code === -32002 && await xp.evaluate(() => document.querySelector('[data-assist-banner]').hidden), 'Disconnect: the banner goes and that session is refused (' + (a.error && a.error.code) + ')');
    sid = 'test-2';   // a new session (the disconnected one stays refused)
    // Settings › BimCraft: the switch, the groups, the activity
    await xp.click('[data-settings-open]');
    const dlgOpen = !!(await xp.waitForSelector('dialog[data-app-settings][open]', { timeout: 10000 }).catch(() => null));
    await xp.click('[data-settings-tab="app"]');
    const form = await xp.evaluate(() => { const q = (n) => document.querySelector('[name="' + n + '"]'); return { on: q('bcAssist')?.checked, read: q('bcAssistRead')?.checked, edit: q('bcAssistEdit')?.checked, rows: document.querySelectorAll('[data-bc-assist-log] li').length }; });
    ok(dlgOpen && form.on && form.read && form.edit && form.rows >= 5, 'Settings › BimCraft › Assistants shows it on, read and edit, and the activity (' + form.rows + ' rows)');
    await xp.evaluate(() => { document.querySelector('[data-bc-assist-log]').open = true; });
    await xp.screenshot({ path: path.join(SHOTS, 'x7-03-settings.png') });
    await xp.uncheck('[name="bcAssistEdit"]');
    a = await rpc('tools/list', {});
    const after = (a.result?.tools || []).map((x) => x.name);
    ok(after.includes('elements_find') && !after.includes('elements_isolate'), 'unticking "Change the view" takes elements_isolate off the list (' + after.join(', ') + ')');
    await xp.uncheck('[name="bcAssist"]');
    a = await rpc('tools/list', {});
    ok(a.error && a.error.code === -32001 && (await xp.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.settings')).assistants.enabled)) === false, 'turning it off refuses everything at once, and is stored');
    await xctx.close();
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed (shots: ${SHOTS})`);
process.exit(fail ? 1 : 0);
