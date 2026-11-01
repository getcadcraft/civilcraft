#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wheel-pad.mjs — 0.8 D7.56 in a real page: every app's 2D view pans on a trackpad swipe, zooms on a pinch and on a mouse-wheel
 * step. Browser companion to bin/test-wheel-pad.mjs (which only reads the source).
 *   node tools/shell-test/browser-wheel-pad.mjs [--only cadcraft,bimcraft-plan,bimcraft-dwg,civilcraft,markupcraft,takeoffcraft,partcraft-sketch,partcraft-sheet]
 *
 * One app at a time, in /lab/<app>, headless Chromium (cached Playwright, host rule getcadcraft.com -> 127.0.0.1), a session minted with
 * tools/shell-test/admin.php session (never the shared MCP admin sign-in). For each 2D view the view's own pan/zoom state is read
 * through page.evaluate (the world point under a screen point + the zoom), then wheel events are sent:
 *   real  page.mouse.wheel (Chromium's input pipeline: hit testing, the overlay on top, passive/cancelable handling)
 *   synth new WheelEvent('wheel', { deltaX, deltaY, ctrlKey, deltaMode, clientX, clientY, bubbles, cancelable }) on the canvas
 * Checks per view: (1) swipe with a sideways part, fractional pixel deltas -> pans (content follows the fingers, zoom unchanged);
 * (2) vertical-only fractional small deltas -> pans; (3) ctrlKey pinch -> zooms about the pointer; (4) a wheel step (whole 100 / 120,
 * deltaX 0) -> zooms about the pointer, both ways; plus: default prevented (synthetic: dispatchEvent returns false; real: the page did not scroll),
 * no console errors. It cannot show what only a real trackpad shows (inertia, the OS's smoothing, Windows precision touchpad vs Mac).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// ---- per view: target() -> the element that takes wheel events; read(cx, cy) -> { z, w: [x, y] } with (cx, cy) in client px;
//      yUp: the world's y grows upward on screen. Functions are serialised into the page (self-contained).
const V = {
  cadcraft: { yUp: true, target: () => window.cadcraft.view.over,
    read: (cx, cy) => { const v = window.cadcraft.view, r = v.over.getBoundingClientRect(), w = v.toWorld(cx - r.left, cy - r.top); return { z: v.zoom, w: [w.x, w.y] }; } },
  'bimcraft-plan': { yUp: true, target: () => window.bimcraftPlan.view.canvas,
    read: (cx, cy) => { const v = window.bimcraftPlan.view; return { z: v.scale, w: v.toPlan(cx, cy) }; } },
  'bimcraft-dwg': { yUp: true, target: () => document.querySelector('[data-dwg-canvas]'),
    read: (cx, cy) => { const c = document.querySelector('[data-dwg-canvas]'), r = c.getBoundingClientRect(); return { z: c.view.zoom, w: c.view.toWorld(cx - r.left, cy - r.top) }; } },
  civilcraft: { yUp: true, target: () => window.civilcraft.view.over,
    read: (cx, cy) => { const v = window.civilcraft.view, r = v.over.getBoundingClientRect(), w = v.toWorld(cx - r.left, cy - r.top); return { z: v.zoom, w: [w.x, w.y] }; } },
  markupcraft: { yUp: false, target: () => window.markupcraft.view.over,
    read: (cx, cy) => { const v = window.markupcraft.view, r = v.over.getBoundingClientRect(); return { z: v.z, w: [(cx - r.left - v.ox) / v.z, (cy - r.top - v.oy) / v.z] }; } },
  takeoffcraft: { yUp: false, target: () => window.takeoffcraft.view.over,
    read: (cx, cy) => { const v = window.takeoffcraft.view, r = v.over.getBoundingClientRect(); return { z: v.z, w: [(cx - r.left - v.ox) / v.z, (cy - r.top - v.oy) / v.z] }; } },
  'partcraft-sketch': { yUp: true, target: () => document.querySelector('[data-sketch-canvas]'),
    read: (cx, cy) => { const e = window.partcraft.editor, r = e.canvas.getBoundingClientRect(); return { z: e.view.s, w: e.toSketch(cx - r.left, cy - r.top) }; } },
  'partcraft-sheet': { yUp: true, target: () => document.querySelector('[data-sheet] svg'),
    read: (cx, cy) => {   // the sheet's root transform is matrix(k 0 0 -k -x*k y*k)
      const svg = document.querySelector('[data-sheet] svg'), m = /matrix\(([^)]+)\)/.exec(svg.querySelector(':scope > g').getAttribute('transform'))[1].split(/[ ,]+/).map(Number);
      const k = m[0], x = -m[4] / k, y = m[5] / k, r = svg.getBoundingClientRect(); return { z: k, w: [x + (cx - r.left) / k, y - (cy - r.top) / k] };
    } },
};

/** Run the checks on one view. `page` is open on the app with the view showing content. */
async function exercise(page, name, problems) {
  const v = V[name];
  const rect = await page.evaluate(`(() => { const r = (${v.target})().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  ok(rect.w > 200 && rect.h > 150, `${name}: the canvas has a size (${Math.round(rect.w)} x ${Math.round(rect.h)})`);
  const P = { x: Math.round(rect.x + rect.w * 0.6), y: Math.round(rect.y + rect.h * 0.55) };   // the pointer, off centre
  const read = () => page.evaluate(`(${v.read})(${P.x}, ${P.y})`);
  const synth = (init) => page.evaluate(`(() => { const t = (${v.target})(); const init = ${JSON.stringify(init)}; const e = new WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true, clientX: ${P.x}, clientY: ${P.y}, deltaMode: 0 }, init)); if ('chromeLike' in init) Object.defineProperty(e, 'wheelDeltaY', { value: -3 * init.deltaY }); return { prevented: !t.dispatchEvent(e) }; })()`);
  const scrolled = () => page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const settle = () => page.waitForTimeout(500);   // past PartCraft's 400 ms swipe latch, so the next gesture starts clean

  // a pan: zoom unchanged, and the content moved by -(dx, dy) screen px (a page scrolling under the fingers)
  const panCheck = async (label, run, dx, dy) => {
    const a = await read(); await run(); const b = await read();
    const sx = (b.w[0] - a.w[0]) * a.z, sy = (b.w[1] - a.w[1]) * a.z * (v.yUp ? -1 : 1);   // = the delta the view followed
    ok(near(b.z / a.z, 1, 1e-9), `${name}: ${label} - zoom unchanged (${a.z} -> ${b.z})`);
    ok(near(sx, dx, Math.max(0.6, Math.abs(dx) * 0.03)) && near(sy, dy, Math.max(0.6, Math.abs(dy) * 0.03)), `${name}: ${label} - pans by the swipe (${sx.toFixed(2)}, ${sy.toFixed(2)} px for delta ${dx}, ${dy})`, `got ${sx.toFixed(3)}, ${sy.toFixed(3)}`);
  };
  const zoomCheck = async (label, run, dir) => {
    const a = await read(); await run(); const b = await read();
    const tol = 1.5 / Math.min(a.z, b.z);   // 1.5 screen px, in world units
    ok(dir > 0 ? b.z > a.z * 1.0005 : b.z < a.z / 1.0005, `${name}: ${label} - zooms ${dir > 0 ? 'in' : 'out'} (${a.z.toPrecision(6)} -> ${b.z.toPrecision(6)})`);
    ok(near(a.w[0], b.w[0], tol) && near(a.w[1], b.w[1], tol), `${name}: ${label} - about the pointer (world under it ${a.w.map((x) => x.toFixed(2))} -> ${b.w.map((x) => x.toFixed(2))})`);
  };
  const real = (dx, dy, ctrl) => async () => { await page.mouse.move(P.x, P.y); if (ctrl) await page.keyboard.down('Control'); await page.mouse.wheel(dx, dy); if (ctrl) await page.keyboard.up('Control'); await page.waitForTimeout(60); };

  // (1) swipe with a sideways part, fractional pixels
  await panCheck('real swipe dx 31.5 dy 12.25', real(31.5, 12.25), 31.5, 12.25); await settle();
  await panCheck('synthetic swipe dx -18.75 dy 9.5', () => synth({ deltaX: -18.75, deltaY: 9.5 }), -18.75, 9.5); await settle();
  // (2) vertical only, small fractional
  // Chromium's input injection (CDP) stamps wheelDeltaY = +-120 on EVERY real wheel event, even deltaY 7.5, so a vertical-only injected
  // event looks like a mouse tick to the detector (a real Chrome trackpad sends wheelDeltaY = -3 * deltaY). Not a trackpad: the
  // vertical swipe is proven with the same legacy field a real Chrome trackpad sets (chromeLike).
  await panCheck('Chrome-trackpad-like vertical swipe dy 7.5 (wheelDeltaY -22.5)', () => synth({ deltaX: 0, deltaY: 7.5, chromeLike: 1 }), 0, 7.5); await settle();
  await panCheck('synthetic vertical swipe dy -14.25', () => synth({ deltaX: 0, deltaY: -14.25 }), 0, -14.25); await settle();
  await panCheck('synthetic whole-pixel swipe dx 6 dy 4 (a precision touchpad sends whole numbers)', () => synth({ deltaX: 6, deltaY: 4 }), 6, 4); await settle();
  // (3) pinch: ctrlKey
  await zoomCheck('synthetic pinch ctrlKey deltaY -9.5', () => synth({ ctrlKey: true, deltaY: -9.5 }), +1); await settle();
  await zoomCheck('synthetic pinch ctrlKey deltaY 6.25', () => synth({ ctrlKey: true, deltaY: 6.25 }), -1); await settle();
  await zoomCheck('real pinch (Control held) deltaY -12', real(0, -12, true), +1); await settle();
  // (4) mouse-wheel steps
  await zoomCheck('real wheel step deltaY -100', real(0, -100), +1); await settle();
  await zoomCheck('real wheel step deltaY 100', real(0, 100), -1); await settle();
  await zoomCheck('synthetic wheel step deltaY -120', () => synth({ deltaY: -120 }), +1); await settle();
  await zoomCheck('synthetic wheel step deltaY 120', () => synth({ deltaY: 120 }), -1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY -3)', () => synth({ deltaY: -3, deltaMode: 1 }), +1); await settle();
  // the default is prevented, the page did not scroll
  const sBefore = await scrolled();
  const all = [];
  for (const init of [{ deltaX: 5.5, deltaY: 2.5 }, { deltaY: 3.5 }, { ctrlKey: true, deltaY: -4.5 }, { deltaY: 100 }, { deltaY: -120 }]) { all.push((await synth(init)).prevented); await settle(); }
  ok(all.every(Boolean), `${name}: default prevented for a swipe, a vertical swipe, a pinch and both wheel steps`, all.join());
  await real(20.5, 40.25)(); await real(0, 100)();
  ok(JSON.stringify(await scrolled()) === JSON.stringify(sBefore), `${name}: the real events did not scroll the page`);
  ok(problems.length === 0, `${name}: no console errors`, problems.join(' | '));
}

// ---- per app: open the page, bring the 2D view up with content, run the checks
async function openApp(app, search = '?space=paper') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lab/${app}${search}`, { waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 1500 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  }
  return { ctx, page, problems };
}
const want = (k) => !ONLY || ONLY.includes(k);
const waitStatus = (page, re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });

const APPS = {
  async cadcraft() {
    const { ctx, page, problems } = await openApp('cadcraft');
    await page.waitForFunction(() => window.cadcraft?.engine && window.cadcraft.view);
    for (const l of ['LINE', '0,0', '400,0', '400,300', '0,300', 'c']) { await page.evaluate((x) => { window.cadcraft.engine.text(x); }, l); await page.waitForTimeout(120); }
    await page.evaluate(() => window.cadcraft.view.fit());
    const n = await page.evaluate(() => window.cadcraft.doc.entities.size);
    ok(n >= 4, `cadcraft: ${n} lines drawn`);
    await exercise(page, 'cadcraft', problems); await ctx.close();
  },
  async bimcraft() {
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
    if (want('bimcraft-plan')) await exercise(page, 'bimcraft-plan', problems);
    await ctx.close();
    if (want('bimcraft-dwg')) {   // a page of its own: the building above would ask to be discarded
      const d = await openApp('bimcraft');
      await d.page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/cad/kitchen-count.dwg'));
      await waitStatus(d.page, /^Opened /);
      await d.page.waitForFunction(() => /rendered in/.test(document.querySelector('[data-status]')?.textContent || ''));
      if (await d.page.evaluate(() => document.querySelector('[data-dwg-canvas]').hidden)) { await d.page.keyboard.press('3'); }   // a DWG with model space opens in 3D: 3 toggles back to the 2D view
      await d.page.waitForFunction(() => { const c = document.querySelector('[data-dwg-canvas]'); return c && c.view && !c.hidden && c.clientWidth > 200; });
      await d.page.waitForTimeout(800);
      await exercise(d.page, 'bimcraft-dwg', d.problems);
      await d.ctx.close();
    }
  },
  async civilcraft() {
    const { ctx, page, problems } = await openApp('civilcraft');
    await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
    await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
    await page.waitForTimeout(800);
    await exercise(page, 'civilcraft', problems); await ctx.close();
  },
  async markupcraft() {
    const { ctx, page, problems } = await openApp('markupcraft');
    await page.setInputFiles('[data-file]', [path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')]);
    await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
    await page.waitForTimeout(800);
    await exercise(page, 'markupcraft', problems); await ctx.close();
  },
  async takeoffcraft() {
    const { ctx, page, problems } = await openApp('takeoffcraft');
    await page.setInputFiles('[data-file-pdf]', [path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')]);
    await page.waitForFunction(() => window.takeoffcraft.files.length >= 1, null, { timeout: 30000 });
    await page.waitForTimeout(1500);
    await exercise(page, 'takeoffcraft', problems); await ctx.close();
  },
  async partcraft() {
    const { ctx, page, problems } = await openApp('partcraft');
    await page.waitForFunction(() => window.partcraft?.ready !== undefined);
    const fx = await import(path.join(REPO, 'tools/partcraft-test/fixtures.mjs'));
    const text = JSON.stringify(fx.flange().part);
    await page.evaluate((t) => window.partcraft.openText(t, 'Bracket.partcraft.json'), text);
    await page.evaluate(() => window.partcraft.built());
    if (want('partcraft-sketch')) {
      await page.evaluate(() => window.partcraft.editSketch('f1'));
      await page.waitForFunction(() => window.partcraft.mode === 'sketch' && window.partcraft.editor.active);
      await page.waitForTimeout(500);
      await exercise(page, 'partcraft-sketch', problems);
      await page.evaluate(() => window.partcraft.exitSketch());
      await page.waitForFunction(() => window.partcraft.mode !== 'sketch');
    }
    if (want('partcraft-sheet')) {
      await page.evaluate(() => window.partcraft.enterDrawing());
      await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet && document.querySelector('[data-sheet] svg'));
      await page.waitForTimeout(500);
      await exercise(page, 'partcraft-sheet', problems);
    }
    await ctx.close();
  },
};

const t0 = Date.now();
try {
  for (const [app, run] of Object.entries(APPS)) {
    const keys = app === 'bimcraft' ? ['bimcraft-plan', 'bimcraft-dwg'] : app === 'partcraft' ? ['partcraft-sketch', 'partcraft-sheet'] : [app];
    if (!keys.some(want)) continue;
    console.log(`\n== ${app}`);
    try { await run(); } catch (e) { fail++; console.log('  FAIL ' + app + ' did not run: ' + String(e.message).split('\n')[0]); }
  }
} finally { await browser.close(); }
console.log(`\nwheel-pad browser: ${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exit(fail ? 1 : 0);
