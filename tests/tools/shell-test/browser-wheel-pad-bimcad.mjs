#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wheel-pad-bimcad.mjs — 0.8 D7.56 in a real page, the second set of 2D views: a trackpad's two-finger swipe pans, a pinch (a wheel
 * event with ctrlKey) zooms, a mouse-wheel step still zooms. Companion to browser-wheel-pad.mjs (the main canvases); same method.
 *   node tools/shell-test/browser-wheel-pad-bimcad.mjs [--only bimcraft-workplane,bimcraft-nodes,bimcraft-register,cadcraft-register,chip-floorplan,chip-waves,chip-layout,chip-netlist]
 *
 * One app page at a time, /lab/<app>, headless Chromium (cached Playwright, host rule getcadcraft.com -> 127.0.0.1), a session minted with
 * tools/shell-test/admin.php session. How each view is opened:
 *   bimcraft-workplane  New building (2 levels), ccInput.run('workplane.viewer'), a line drawn in the viewer with two real clicks
 *   bimcraft-nodes      BimCraft has NO screen that opens its copy of shading/editor.js (nothing in bimcraft/dev imports it), so the
 *                       test imports the served file itself into the /lab/bimcraft page and mounts a NodeEditor on a graph of four
 *                       node types from BimCraft's shading/nodes.js, with ModelCraft's shading.css linked for the layout (BimCraft
 *                       carries no copy of it). It proves the copy loads there (its '../wheel-pad.js' resolves) and pans / zooms.
 *   bimcraft-register   the start panel's Register scans button, both scans of testfiles/generated/pointcloud-register added
 *   cadcraft-register   the REGISTERSCANS command, the same scans
 *   chip-*              /lab/cadcraft: ccAddons.loader.setEnabled('chip', true), Settings' Auto-focus panel off (localStorage cc-autofocus = off, so the right panel shows the section unfolded), Open the sample design (Pebble), the wide dialog,
 *                       then the tab: floorplan (out/layout/pebble.def), waves (out/sim/wave.vcd, zoomed in 8x and slid to the
 *                       middle first: at Fit there is nothing to slide), chip-layout (out/layout/pebble.gds), chip-netlist
 * The view's own state is read through page.evaluate: an SVG's getScreenCTM (work plane viewer, floorplan, netlist), the world
 * element's CSS transform (node editor), the registration dialog's own debug.screenOf, the layout panel's root._chip.st.view, the
 * waveform viewer's el._chip (state, timeAt). Then wheel events are sent:
 *   real  page.mouse.wheel (Chromium's input pipeline: hit testing, passive/cancelable handling)
 *   synth new WheelEvent('wheel', { deltaX, deltaY, ctrlKey, deltaMode, clientX, clientY, bubbles, cancelable }) on the view
 * Checks per view: (a) a swipe with a sideways part, fractional deltas -> pans by the swiped pixels, zoom unchanged; (b) vertical-only
 * small fractional deltas -> pans (the waveform viewer: its time axis only slides sideways, so a vertical swipe changes nothing and
 * must not zoom); (c) ctrlKey pinch -> zooms about the pointer; (d) a wheel step (real 100, synthetic 120, lines) -> zooms about the
 * pointer; (e) default prevented, the page did not scroll, no console errors.
 * It cannot show what only a real trackpad shows (inertia, the OS's smoothing, Windows precision touchpad vs Mac).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SCANS = process.env.POINTCLOUD_REGISTER || path.resolve(REPO, '../testfiles/generated/pointcloud-register');
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// ---- per view: target() -> the element that takes wheel events; read(cx, cy) -> { z, w: [x, y] } with (cx, cy) in client px (z = screen
//      px per world unit; w = the world point under the pointer); yUp: the world's y grows upward on screen; axes 'x': only x moves.
//      Functions are serialised into the page (self-contained).
const svgRead = (sel) => `(cx, cy) => { const svg = document.querySelector(${JSON.stringify(sel)}), m = svg.getScreenCTM(), p = svg.createSVGPoint(); p.x = cx; p.y = cy; const q = p.matrixTransform(m.inverse()); return { z: m.a, zy: m.d, w: [q.x, q.y] }; }`;
const regRead = (api) => `(cx, cy) => {   // the dialog's own debug.screenOf: two display points give the scale, one gives the offset
  const d = (${api}).debug, n = d.shownCount(0), a = d.screenOf(0, 0); let b = a;
  for (let k = 1; k < n; k += 7) { const q = d.screenOf(0, k); if (Math.abs(q.world[0] - a.world[0]) > Math.abs(b.world[0] - a.world[0])) b = q; }
  const s = (b.x - a.x) / (b.world[0] - a.world[0]);
  return { z: s, w: [a.world[0] + (cx - a.x) / s, a.world[1] - (cy - a.y) / s] };
}`;
const V = {
  'bimcraft-workplane': { yUp: false, target: `() => document.querySelector('[data-wpv-svg]')`, read: svgRead('[data-wpv-svg]') },
  'bimcraft-nodes': { yUp: false, target: `() => document.querySelector('[data-pad-nodes] .cc-ne-view')`, at: [0.82, 0.86],
    read: `(cx, cy) => { const v = document.querySelector('[data-pad-nodes] .cc-ne-view'), r = v.getBoundingClientRect(), m = /translate\\(([-\\d.e]+)px, ([-\\d.e]+)px\\) scale\\(([-\\d.e]+)\\)/.exec(v.querySelector('.cc-ne-world').style.transform), x = Number(m[1]), y = Number(m[2]), z = Number(m[3]); return { z, w: [(cx - r.left - x) / z, (cy - r.top - y) / z] }; }` },
  'bimcraft-register': { yUp: true, target: `() => document.querySelector('[data-register] [data-reg-canvas]')`, read: regRead('window.bimcraftRegister') },
  'cadcraft-register': { yUp: true, target: `() => document.querySelector('[data-register] [data-reg-canvas]')`, read: regRead('window.cadcraft.host.registerUi') },
  'chip-floorplan': { yUp: false, target: `() => document.querySelector('[data-chip-panel="floorplan"] .chip-layout-view')`, read: svgRead('[data-chip-panel="floorplan"] .chip-layout-view svg') },
  'chip-waves': { yUp: false, axes: 'x', at: [0.7, 0.4], target: `() => document.querySelector('[data-chip-panel="waves"] canvas.chip-waves-canvas')`,
    read: `(cx, cy) => { const c = document.querySelector('[data-chip-panel="waves"] canvas.chip-waves-canvas'), h = c.closest('.chip-waves')._chip, r = c.getBoundingClientRect(), a = h.timeAt(cx - r.left), b = h.timeAt(cx - r.left + 100), s = h.state(); return { z: 100 / (b - a), w: [a, 0], t0: s.t0, t1: s.t1 }; }` },
  // the drawing's own mapping: canvas px = (x - x0) * scale, (y1 - y) * scale, the bitmap stretched over the canvas's content box (inside its
  // 1 px border; the bitmap is sized from the border box, so x and y differ by about 0.2 %: scaleTol)
  'chip-layout': { yUp: true, scaleTol: 0.01, target: `() => document.querySelector('[data-chip-panel="chip-layout"] canvas')`,
    read: `(cx, cy) => { const c = document.querySelector('[data-chip-panel="chip-layout"] canvas'), v = c.closest('.ccchip-layout')._chip.st.view, r = c.getBoundingClientRect(), kx = c.width / c.clientWidth, ky = c.height / c.clientHeight; return { z: v.scale / kx, zy: v.scale / ky, w: [v.x0 + (cx - r.left - c.clientLeft) * kx / v.scale, v.y1 - (cy - r.top - c.clientTop) * ky / v.scale], span: [v.x1 - v.x0, v.y1 - v.y0, c.width / v.scale, c.height / v.scale] }; }` },
  'chip-netlist': { yUp: false, target: `() => document.querySelector('[data-chip-panel="chip-netlist"] .chip-net-view')`, read: svgRead('[data-chip-panel="chip-netlist"] .chip-net-view svg') },
};

/** Run the checks on one view. `page` is open on the app with the view showing content. */
async function exercise(page, name, problems) {
  const v = V[name], xOnly = v.axes === 'x';
  const rect = await page.evaluate(`(() => { const t = (${v.target})(); t.scrollIntoView({ block: 'nearest' }); const r = t.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  ok(rect.w > 200 && rect.h > 150, `${name}: the view has a size (${Math.round(rect.w)} x ${Math.round(rect.h)})`);
  const [fx, fy] = v.at || [0.6, 0.55];
  const P = { x: Math.round(rect.x + rect.w * fx), y: Math.round(rect.y + rect.h * fy) };   // the pointer, off centre
  ok(await page.evaluate(`(() => { const t = (${v.target})(), e = document.elementFromPoint(${P.x}, ${P.y}); return !!e && t.contains(e) && !e.closest('input, select, button'); })()`), `${name}: the pointer (${P.x}, ${P.y}) is over the view, nothing on top of it`);
  const read = () => page.evaluate(`(${v.read})(${P.x}, ${P.y})`);
  const synth = (init) => page.evaluate(`(() => { const t = (${v.target})(); const init = ${JSON.stringify(init)}; const e = new WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true, clientX: ${P.x}, clientY: ${P.y}, deltaMode: 0 }, init)); if ('chromeLike' in init) Object.defineProperty(e, 'wheelDeltaY', { value: -3 * init.deltaY }); return { prevented: !t.dispatchEvent(e) }; })()`);
  const scrolled = () => page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const settle = () => page.waitForTimeout(450);   // past the detector's 400 ms latch, so the next gesture starts clean
  const first = await read();
  ok(Number.isFinite(first.z) && first.z > 0 && first.w.every(Number.isFinite), `${name}: the view's state is readable (zoom ${first.z.toPrecision(5)} px per unit, under the pointer ${first.w.map((x) => +x.toPrecision(6))})`, JSON.stringify(first));
  if (first.zy !== undefined) ok(near(Math.abs(first.zy) / first.z, 1, v.scaleTol || 1e-6), `${name}: one scale both ways (x ${first.z.toPrecision(6)}, y ${Math.abs(first.zy).toPrecision(6)})`);

  // a pan: zoom unchanged, and the content moved by -(dx, dy) screen px (a page scrolling under the fingers)
  const panCheck = async (label, run, dx, dy) => {
    const a = await read(); await run(); const b = await read();
    const sx = (b.w[0] - a.w[0]) * a.z, sy = (b.w[1] - a.w[1]) * a.z * (v.yUp ? -1 : 1);   // = the delta the view followed
    const wy = xOnly ? 0 : dy;
    ok(near(b.z / a.z, 1, 1e-9), `${name}: ${label} - zoom unchanged (${a.z} -> ${b.z})`);
    ok(near(sx, dx, Math.max(0.6, Math.abs(dx) * 0.03)) && near(sy, wy, Math.max(0.6, Math.abs(wy) * 0.03)), `${name}: ${label} - ${xOnly && dx === 0 ? 'nothing moves (the time axis only slides sideways)' : 'pans by the swipe'} (${sx.toFixed(2)}, ${sy.toFixed(2)} px for delta ${dx}, ${dy})`, `got ${sx.toFixed(3)}, ${sy.toFixed(3)}`);
  };
  const zoomCheck = async (label, run, dir) => {
    const a = await read(); await run(); const b = await read();
    const tol = 1.5 / Math.min(a.z, b.z);   // 1.5 screen px, in world units
    ok(dir > 0 ? b.z > a.z * 1.0005 : b.z < a.z / 1.0005, `${name}: ${label} - zooms ${dir > 0 ? 'in' : 'out'} (${a.z.toPrecision(6)} -> ${b.z.toPrecision(6)})`);
    ok(near(a.w[0], b.w[0], tol) && near(a.w[1], b.w[1], tol), `${name}: ${label} - about the pointer (world under it ${a.w.map((x) => x.toFixed(2))} -> ${b.w.map((x) => x.toFixed(2))})`);
  };
  const real = (dx, dy, ctrl) => async () => { await page.mouse.move(P.x, P.y); if (ctrl) await page.keyboard.down('Control'); await page.mouse.wheel(dx, dy); if (ctrl) await page.keyboard.up('Control'); await page.waitForTimeout(60); };

  // (a) swipe with a sideways part, fractional pixels
  await panCheck('real swipe dx 31.5 dy 12.25', real(31.5, 12.25), 31.5, 12.25); await settle();
  await panCheck('synthetic swipe dx -18.75 dy 9.5', () => synth({ deltaX: -18.75, deltaY: 9.5 }), -18.75, 9.5); await settle();
  // (b) vertical only, small fractional
  // Chromium's input injection (CDP) stamps wheelDeltaY = +-120 on EVERY real wheel event, even deltaY 7.5, so a vertical-only injected
  // event looks like a mouse tick to the detector (a real Chrome trackpad sends wheelDeltaY = -3 * deltaY). Not a trackpad: the
  // vertical swipe is proven with the same legacy field a real Chrome trackpad sets (chromeLike).
  await panCheck('Chrome-trackpad-like vertical swipe dy 7.5 (wheelDeltaY -22.5)', () => synth({ deltaX: 0, deltaY: 7.5, chromeLike: 1 }), 0, 7.5); await settle();
  await panCheck('synthetic vertical swipe dy -14.25', () => synth({ deltaX: 0, deltaY: -14.25 }), 0, -14.25); await settle();
  await panCheck('synthetic whole-pixel swipe dx 6 dy 4 (a precision touchpad sends whole numbers)', () => synth({ deltaX: 6, deltaY: 4 }), 6, 4); await settle();
  // (c) pinch: ctrlKey
  await zoomCheck('synthetic pinch ctrlKey deltaY -9.5', () => synth({ ctrlKey: true, deltaY: -9.5 }), +1); await settle();
  await zoomCheck('synthetic pinch ctrlKey deltaY 6.25', () => synth({ ctrlKey: true, deltaY: 6.25 }), -1); await settle();
  await zoomCheck('real pinch (Control held) deltaY -12', real(0, -12, true), +1); await settle();
  // (d) mouse-wheel steps
  await zoomCheck('real wheel step deltaY -100', real(0, -100), +1); await settle();
  await zoomCheck('real wheel step deltaY 100', real(0, 100), -1); await settle();
  await zoomCheck('synthetic wheel step deltaY -120', () => synth({ deltaY: -120 }), +1); await settle();
  await zoomCheck('synthetic wheel step deltaY 120', () => synth({ deltaY: 120 }), -1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY -3)', () => synth({ deltaY: -3, deltaMode: 1 }), +1); await settle();
  // (e) the default is prevented, the page did not scroll
  const sBefore = await scrolled();
  const all = [];
  for (const init of [{ deltaX: 5.5, deltaY: 2.5 }, { deltaY: 3.5 }, { ctrlKey: true, deltaY: -4.5 }, { deltaY: 100 }, { deltaY: -120 }]) { all.push((await synth(init)).prevented); await settle(); }
  ok(all.every(Boolean), `${name}: default prevented for a swipe, a vertical swipe, a pinch and both wheel steps`, all.join());
  await real(20.5, 40.25)(); await real(0, 100)();
  ok(JSON.stringify(await scrolled()) === JSON.stringify(sBefore), `${name}: the real events did not scroll the page`);
  ok(problems.length === 0, `${name}: no console errors`, problems.join(' | '));
}

// ---- per app: open the page, bring the 2D view up with content, run the checks
async function openApp(app, search = '?space=paper', store = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.addInitScript((kv) => { try { localStorage.setItem('cc-tours', 'off'); for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); } catch (e) { /* none */ } }, store);   // the tour toast would sit over the canvas, under the pointer
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const problems = [];
  // not this test's subject: the Library's automatic connection is limited to 30 an hour per account, and every test run on the shared
  // test account spends one, so /api/library/connect-auto may answer 429 here. That one answer is named in the output and not counted.
  const limited = (u) => /\/api\/(library\/connect-auto|v1\/hardware)(\?|$)/.test(u || '');
  page.on('console', (m) => { if (m.type() === 'error' && !(limited(m.location()?.url) && /\b429\b/.test(m.text()))) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('response', (r) => { if (r.status() === 429 && limited(r.url())) console.log('  note ' + app + ': /api/library/connect-auto answered 429 (the account\'s hourly limit; not counted)'); else if (r.status() >= 400) problems.push('http ' + r.status() + ': ' + r.url().replace(BASE, '')); });
  await page.goto(`${BASE}/lab/${app}${search}`, { waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 1500 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  }
  return { ctx, page, problems };
}
const waitStatus = (page, re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });

/** Register scans: both room scans in the dialog, the Plan picture showing them. */
async function registerView(app, name) {
  if (!fs.existsSync(path.join(SCANS, 'room-scan-a.las'))) { fail++; console.log(`  FAIL ${name}: ${SCANS} is missing (node tools/pointcloud/mkscans.mjs)`); return; }
  const { ctx, page, problems } = await openApp(app);
  const api = app === 'bimcraft' ? 'window.bimcraftRegister' : 'window.cadcraft.host.registerUi';
  if (app === 'cadcraft') { await page.waitForFunction(() => !!window.cadcraft); await page.click('[data-cmd-input]'); await page.keyboard.type('REGISTERSCANS'); await page.keyboard.press('Enter'); }
  else await page.click('.bc-left [data-cloud-register]');
  await page.waitForSelector('[data-register][open]');
  await page.setInputFiles('[data-reg-input]', [path.join(SCANS, 'room-scan-a.las'), path.join(SCANS, 'room-scan-b.las')]);
  await page.waitForFunction((a) => eval(a).session().scans.length === 2, api, { timeout: 60000 });
  await page.waitForFunction((a) => eval(a).debug.shownCount(0) > 100 && eval(a).debug.shownCount(1) > 100, api, { timeout: 30000 });
  await page.waitForTimeout(500);
  const shown = await page.evaluate((a) => { const r = eval(a); return [r.state().view, r.debug.shownCount(0), r.debug.shownCount(1)]; }, api);
  ok(shown[0] === 'top' && shown[1] > 100, `${name}: the dialog is open on the Plan picture with both scans (${shown[1]} + ${shown[2]} display points)`, shown.join());
  await exercise(page, name, problems);
  await ctx.close();
}

const APPS = {
  async bimcraft() {
    if (want('bimcraft-register')) await registerView('bimcraft', 'bimcraft-register');
    if (!want('bimcraft-workplane') && !want('bimcraft-nodes')) return;
    const { ctx, page, problems } = await openApp('bimcraft');
    await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
    await page.reload({ waitUntil: 'networkidle' });
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new');
    await page.fill('[data-new-name]', 'Pad'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm');
    await page.click('[data-new-ok]');
    await waitStatus(page, /^New building Pad/);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; });
    if (want('bimcraft-workplane')) {
      await page.evaluate(() => window.ccInput.run('workplane.viewer'));
      await page.waitForSelector('[data-wpv-dialog][open] [data-wpv-svg]', { timeout: 15000 });
      await page.waitForTimeout(500);
      // content of its own: a line drawn in the viewer, two real clicks
      const r = await page.evaluate(() => { const b = document.querySelector('[data-wpv-svg]').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
      await page.click('[data-wpv-tool="line"]');
      await page.mouse.click(r.x + r.w * 0.3, r.y + r.h * 0.3); await page.waitForTimeout(150);
      await page.mouse.click(r.x + r.w * 0.5, r.y + r.h * 0.7);
      await page.waitForSelector('[data-wpv-line]', { timeout: 15000 }).catch(() => {});
      await page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }).catch(() => {});
      await page.click('[data-wpv-tool="select"]'); await page.waitForTimeout(400);
      const got = await page.evaluate(() => ({ lines: document.querySelectorAll('[data-wpv-svg] [data-wpv-line]').length, els: document.querySelectorAll('[data-wpv-svg] *').length, vb: document.querySelector('[data-wpv-svg]').getAttribute('viewBox'), same: window.bimcraftWorkPlane.state.v.vb.join(' ') }));
      ok(got.lines === 1 && got.els > 3, `bimcraft-workplane: the viewer is open with a line drawn in it (${got.els} SVG elements, viewBox ${got.vb})`, JSON.stringify(got));
      await exercise(page, 'bimcraft-workplane', problems);
      const end = await page.evaluate(() => [document.querySelector('[data-wpv-svg]').getAttribute('viewBox'), window.bimcraftWorkPlane.state.v.vb.join(' ')]);
      ok(end[0] === end[1], 'bimcraft-workplane: the viewBox on the page is the viewer\'s own V.vb after all of it (redrawn each time)', end.join(' | '));
      await page.click('[data-wpv-close]'); await page.waitForTimeout(300);
    }
    if (want('bimcraft-nodes')) {
      // no BimCraft screen opens this copy: import the served file into the page and mount it
      const res = await page.evaluate(async () => {
        const dir = performance.getEntriesByType('resource').map((x) => x.name).find((n) => /\/assets\/apps\/bimcraft\/[^/]+\/[^/]+\.js/.test(n)).replace(/[^/]+\.js.*$/, '');
        const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = dir.replace('/bimcraft/', '/modelcraft/') + 'shading/shading.css';
        await new Promise((ok2) => { css.onload = css.onerror = ok2; document.head.append(css); });
        const { NodeEditor } = await import(dir + 'shading/editor.js');
        const { NODE_TYPES, CATEGORIES, defaultValues, defaultParams } = await import(dir + 'shading/nodes.js');
        const box = document.createElement('div');
        box.setAttribute('data-pad-nodes', '');
        box.style.cssText = 'position:fixed;left:120px;top:90px;width:1000px;height:640px;z-index:99999;background:#fff;display:flex';
        document.body.append(box);
        const el = (tag, props = {}, ...kids) => { const n = document.createElement(tag); for (const [k, val] of Object.entries(props)) { if (k === 'dataset') Object.assign(n.dataset, val); else if (k === 'className') n.className = val; else if (k in n && typeof val !== 'string') n[k] = val; else n.setAttribute(k, val); } n.append(...kids.filter((x) => x != null)); return n; };
        const t = (k) => k, words = { node: t, input: t, output: t, param: t, option: t, cat: t };
        const ne = new NodeEditor(box, { el, t, types: NODE_TYPES, categories: CATEGORIES, words, choices: { image: () => [], library: () => [] } });
        const types = [...NODE_TYPES.keys()], out = types.find((k) => NODE_TYPES.get(k).cat === 'output'), others = types.filter((k) => NODE_TYPES.get(k).cat !== 'output' && !NODE_TYPES.get(k).params?.some((p) => p.kind === 'image' || p.kind === 'library')).slice(0, 3);
        const nodes = [...others, out].map((type, i) => ({ id: i + 1, type, x: 40 + (i % 2) * 260, y: 30 + Math.floor(i / 2) * 200, values: defaultValues(type), params: defaultParams(type) }));
        ne.setGraph({ nodes, links: [] });
        window.__padNodes = ne;
        return { dir, drawn: box.querySelectorAll('.cc-ne-node').length, types: nodes.map((n) => n.type), tf: box.querySelector('.cc-ne-world').style.transform, pos: getComputedStyle(box.querySelector('.cc-ne-world')).position };
      });
      ok(res.drawn === 4 && /translate\(.+\) scale\(.+\)/.test(res.tf), `bimcraft-nodes: BimCraft's copy of the node editor loads in the page and draws ${res.drawn} nodes (${res.types.join(', ')}); world ${res.tf}`, JSON.stringify(res));
      await page.waitForTimeout(400);
      await exercise(page, 'bimcraft-nodes', problems);
      // a module is one object per address: the detector the editor made is an instance of the class at BimCraft's own wheel-pad.js
      const own = await page.evaluate(async (dir) => { const { PadDetector } = await import(dir + 'wheel-pad.js'); return window.__padNodes._pad instanceof PadDetector; }, res.dir);
      ok(own && /\/assets\/apps\/bimcraft\//.test(res.dir), `bimcraft-nodes: its '../wheel-pad.js' is BimCraft's own (${res.dir.replace(/^https?:\/\/[^/]+/, '')}wheel-pad.js)`);
    }
    await ctx.close();
  },
  async 'cadcraft-register'() { await registerView('cadcraft', 'cadcraft-register'); },
  async 'cadcraft-chip'() {
    // Settings > Global > Auto-focus panel off: with it on, the right panel folds the Chip design section away (every add-on section gets
    // the same fold name, 'addon-section', in app-settings.js secKey, and a real click on its heading did not open it here)
    const { ctx, page, problems } = await openApp('cadcraft', '', { 'cc-autofocus': 'off' });
    await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
    await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'chip' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => window.ccAddons.loader.setEnabled('chip', true));
    await page.waitForFunction(() => !!window.ccChip, null, { timeout: 15000 });
    page.on('dialog', (d) => d.accept());
    await page.waitForFunction(() => !!document.querySelector('[data-chip-sample]')?.offsetParent, null, { timeout: 15000 });
    await page.click('[data-chip-sample]');
    await page.waitForFunction(() => window.ccChip.ctx.files.list().includes('out/layout/pebble.gds') && window.ccChip.ctx.project.get().name === 'Pebble (sample)', null, { timeout: 30000 });
    ok(true, 'chip: the add-on is on and the sample design (Pebble) is open: ' + (await page.evaluate(() => window.ccChip.ctx.files.list().length)) + ' files');
    await page.click('[data-chip-wide]');   // the wide dialog: the right panel is too narrow for a 200 px view
    await page.waitForSelector('dialog.chip-dialog [data-chip-root]');
    const tab = async (id) => { await page.click(`[data-chip-tab="${id}"]`); await page.waitForTimeout(300); };
    if (want('chip-floorplan')) {
      await tab('floorplan');
      await page.selectOption('[data-chip-def]', 'out/layout/pebble.def');
      await page.waitForSelector('[data-chip-panel="floorplan"] svg .chip-cell', { timeout: 20000 });
      const n = await page.evaluate(() => [document.querySelectorAll('[data-chip-panel="floorplan"] .chip-cell').length, document.querySelectorAll('[data-chip-panel="floorplan"] .chip-wire').length]);
      ok(n[0] > 50, `chip-floorplan: out/layout/pebble.def drawn (${n[0]} placed cells, ${n[1]} wire pieces)`);
      await exercise(page, 'chip-floorplan', problems);
    }
    if (want('chip-waves')) {
      await tab('waves');
      await page.selectOption('[data-chip-vcd]', 'out/sim/wave.vcd');
      await page.waitForFunction(() => /of \d+ signals/.test(document.querySelector('[data-chip-panel="waves"] canvas')?.getAttribute('aria-label') || ''), null, { timeout: 20000 });
      // at Fit the whole run is in view and nothing can slide: zoom in 8x with the + button, then slide to the middle with a few swipes
      const zin = page.locator('[data-chip-panel="waves"] .chip-waves-bar button').first();
      for (let i = 0; i < 3; i++) await zin.click();
      const hook = `document.querySelector('[data-chip-panel="waves"] .chip-waves')._chip`;
      const s0 = await page.evaluate(`(() => { const h = ${hook}; return h ? h.state() : null; })()`);
      ok(!!s0 && s0.rows > 5 && s0.t1 - s0.t0 > 0, `chip-waves: out/sim/wave.vcd drawn (${s0?.rows} rows), zoomed to ${s0?.t0} .. ${s0?.t1}`, JSON.stringify(s0));
      for (let i = 0; i < 8; i++) { await page.evaluate(`(() => { const c = document.querySelector('[data-chip-panel="waves"] canvas.chip-waves-canvas'); c.dispatchEvent(new WheelEvent('wheel', { deltaX: 80.5, deltaY: 0, bubbles: true, cancelable: true })); })()`); }
      await page.waitForTimeout(500);
      const s1 = await page.evaluate(`${hook}.state()`);
      ok(s1.t0 > s0.t0 && s1.t1 - s1.t0 === s0.t1 - s0.t0, `chip-waves: swipes slide it to ${s1.t0.toFixed(1)} .. ${s1.t1.toFixed(1)}, the same span`, JSON.stringify(s1));
      await exercise(page, 'chip-waves', problems);
      // the ends: a long swipe stops at 0 and at the end of the run, the span kept
      const sw = (dx) => page.evaluate(`(() => { const c = document.querySelector('[data-chip-panel="waves"] canvas.chip-waves-canvas'); c.dispatchEvent(new WheelEvent('wheel', { deltaX: ${dx}, deltaY: 1.5, bubbles: true, cancelable: true })); const h = ${hook}; return h.state(); })()`);
      const a = await page.evaluate(`${hook}.state()`), L = await sw(-99999.5), R = await sw(99999.5), span = a.t1 - a.t0;
      ok(L.t0 === 0 && Math.abs(L.t1 - span) < 1e-6, `chip-waves: a long swipe back stops at time 0 (${L.t0} .. ${L.t1.toFixed(1)})`);
      ok(Math.abs((R.t1 - R.t0) - span) < 1e-6 && R.t0 > L.t0 && Math.abs(R.t1 - R.end) < 1e-6, `chip-waves: a long swipe forward stops at the end of the run (${R.t0.toFixed(1)} .. ${R.t1.toFixed(1)}, end ${R.end})`, JSON.stringify(R));
    }
    if (want('chip-layout')) {
      await tab('chip-layout');
      await page.selectOption('[data-chip-panel="chip-layout"] select >> nth=0', 'out/layout/pebble.gds');
      await page.waitForFunction(() => !!document.querySelector('[data-chip-panel="chip-layout"] .ccchip-layout')?._chip?.st.view, null, { timeout: 20000 });
      await page.waitForTimeout(800);
      const px = await page.evaluate(() => { const c = document.querySelector('[data-chip-panel="chip-layout"] canvas'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
      ok(px > 1000, `chip-layout: out/layout/pebble.gds drawn (${px} pixels)`);
      await exercise(page, 'chip-layout', problems);
      const sp = (await page.evaluate(`(${V['chip-layout'].read})(0, 0)`)).span;
      ok(Math.abs(sp[0] / sp[2] - 1) < 1e-9 && Math.abs(sp[1] / sp[3] - 1) < 1e-9, 'chip-layout: after all of it the window (x0..x1, y0..y1) still matches its scale', sp.join(' '));
    }
    if (want('chip-netlist')) {
      await tab('chip-netlist');
      await page.waitForFunction(() => document.querySelectorAll('[data-chip-panel="chip-netlist"] select option').length > 0, null, { timeout: 20000 });
      const opts = await page.$$eval('[data-chip-panel="chip-netlist"] select option', (o) => o.map((x) => x.value));
      const pick = opts.find((x) => /^src\|pebble_alu$/.test(x)) || opts.find((x) => /pebble_alu/.test(x)) || opts[0];
      await page.selectOption('[data-chip-panel="chip-netlist"] select', pick);
      await page.waitForSelector('[data-chip-panel="chip-netlist"] svg [data-cell]', { timeout: 30000 });
      const boxes = await page.$$eval('[data-chip-panel="chip-netlist"] svg [data-cell]', (g) => g.length);
      ok(boxes > 3, `chip-netlist: ${pick} drawn as a schematic (${boxes} boxes)`);
      await exercise(page, 'chip-netlist', problems);
    }
    await ctx.close();
  },
};
const KEYS = { bimcraft: ['bimcraft-register', 'bimcraft-workplane', 'bimcraft-nodes'], 'cadcraft-register': ['cadcraft-register'], 'cadcraft-chip': ['chip-floorplan', 'chip-waves', 'chip-layout', 'chip-netlist'] };

const t0 = Date.now();
try {
  for (const [app, run] of Object.entries(APPS)) {
    if (!KEYS[app].some(want)) continue;
    console.log(`\n== ${app}`);
    try { await run(); } catch (e) { fail++; console.log('  FAIL ' + app + ' did not run: ' + String(e.message).split('\n')[0]); }
  }
} finally { await browser.close(); }
console.log(`\nwheel-pad browser (bimcraft views, register scans, chip design): ${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exit(fail ? 1 : 0);
