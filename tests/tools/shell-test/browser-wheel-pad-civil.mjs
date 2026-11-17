#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wheel-pad-civil.mjs — 0.8 D7.56 in a real page, CivilCraft's other 2D views: the profile view, the cross-section view and
 * the picture in "Start from a scan" pan on a trackpad swipe, zoom on a pinch and on a mouse-wheel step. Companion to
 * browser-wheel-pad.mjs (the main canvases; same method, see its header).
 *   node tools/shell-test/browser-wheel-pad-civil.mjs [--only profile,sections,scan]
 *
 * One page, /lab/civilcraft, headless Chromium (cached Playwright, host rule getcadcraft.com -> 127.0.0.1), a session minted with
 * tools/shell-test/admin.php session. The sample site is loaded, an alignment is drawn across it by clicks and given a profile
 * (the profile view), then a corridor and sample lines (the section view), then fixtures/raster/plan-scan.png is opened in Start from
 * a scan. Each view's own state is read through page.evaluate:
 *   profile   window.civilcraft.pview            (s0 s1 z0 z1, toData)
 *   sections  window.civilcraft.sections.view    (o0 o1 z0 z1, toData)
 *   scan      [data-scanin-view].view            (a copy of { x, y, s } in canvas pixels)
 * The profile and section views scale each axis on its own, so a state is { zx, zy } (screen px per unit) + the world point under
 * the pointer. Checks per view: swipe with a sideways part / vertical only -> pans by the swiped pixels, both scales unchanged;
 * ctrlKey pinch and wheel steps (real 100, synthetic 120, lines) -> zoom about the pointer; default prevented, the page did not
 * scroll, no console errors. Profile and sections also: Shift / Alt + a small wheel delta zoom one axis and never pan.
 * It cannot show what only a real trackpad shows (inertia, the OS's smoothing).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
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

// ---- per view: target() -> the canvas; read(cx, cy) -> { zx, zy, w: [x, y] } with (cx, cy) in client px (zx, zy = screen px per unit);
//      yUp: the world's y grows upward on screen; oneAxis: Shift / Alt + wheel zoom one axis. Serialised into the page (self-contained).
const V = {
  profile: { yUp: true, oneAxis: true, target: () => document.querySelector('[data-prof]'),
    read: (cx, cy) => { const v = window.civilcraft.pview, r = v.cv.getBoundingClientRect(), P = v.plot, d = v.toData(cx - r.left, cy - r.top);
      return { zx: (P.x1 - P.x0) / (v.s1 - v.s0), zy: (P.y0 - P.y1) / (v.z1 - v.z0), w: [d.sta, d.z] }; } },
  sections: { yUp: true, oneAxis: true, target: () => document.querySelector('[data-sec]'),
    read: (cx, cy) => { const v = window.civilcraft.sections.view, r = v.cv.getBoundingClientRect(), P = v.plot, d = v.toData(cx - r.left, cy - r.top);
      return { zx: (P.x1 - P.x0) / (v.o1 - v.o0), zy: (P.y0 - P.y1) / (v.z1 - v.z0), w: [d.o, d.z] }; } },
  scan: { yUp: false, oneAxis: false, target: () => document.querySelector('[data-scanin-view]'),
    read: (cx, cy) => { const c = document.querySelector('[data-scanin-view]'), v = c.view, r = c.getBoundingClientRect(), kx = c.width / r.width, ky = c.height / r.height;   // canvas px per screen px
      return { zx: v.s / kx, zy: v.s / ky, w: [((cx - r.left) * kx - v.x) / v.s, ((cy - r.top) * ky - v.y) / v.s] }; } },
};

/** Run the checks on one view. `page` is open with the view showing content. */
async function exercise(page, name, problems) {
  const v = V[name];
  const rect = await page.evaluate(`(() => { const r = (${v.target})().getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
  ok(rect.w > 200 && rect.h > 100, `${name}: the canvas has a size (${Math.round(rect.w)} x ${Math.round(rect.h)})`);
  const P = { x: Math.round(rect.x + rect.w * 0.6), y: Math.round(rect.y + rect.h * 0.55) };   // the pointer, off centre
  const top = await page.evaluate(`(() => { const t = (${v.target})(), e = document.elementFromPoint(${P.x}, ${P.y}); return e === t || t.contains(e); })()`);
  ok(top, `${name}: the canvas is what sits under the pointer (real wheel events reach it)`);
  const read = () => page.evaluate(`(${v.read})(${P.x}, ${P.y})`);
  const synth = (init) => page.evaluate(`(() => { const t = (${v.target})(); const init = ${JSON.stringify(init)}; const e = new WheelEvent('wheel', Object.assign({ bubbles: true, cancelable: true, clientX: ${P.x}, clientY: ${P.y}, deltaMode: 0 }, init)); if ('chromeLike' in init) Object.defineProperty(e, 'wheelDeltaY', { value: -3 * init.deltaY }); return { prevented: !t.dispatchEvent(e) }; })()`);
  const scrolled = () => page.evaluate(() => [window.scrollX, window.scrollY, document.scrollingElement.scrollTop, document.body.scrollTop]);
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const settle = () => page.waitForTimeout(450);   // past the detector's 400 ms swipe latch, so the next gesture starts clean
  const f6 = (x) => x.toPrecision(6);

  // a pan: both scales unchanged, and the content moved by -(dx, dy) screen px (a page scrolling under the fingers)
  const panCheck = async (label, run, dx, dy) => {
    const a = await read(); await run(); const b = await read();
    const sx = (b.w[0] - a.w[0]) * a.zx, sy = (b.w[1] - a.w[1]) * a.zy * (v.yUp ? -1 : 1);   // = the delta the view followed
    ok(near(b.zx / a.zx, 1, 1e-9) && near(b.zy / a.zy, 1, 1e-9), `${name}: ${label} - zoom unchanged (${f6(a.zx)}, ${f6(a.zy)} -> ${f6(b.zx)}, ${f6(b.zy)} px a unit)`);
    ok(near(sx, dx, 0.02 + Math.abs(dx) * 1e-6) && near(sy, dy, 0.02 + Math.abs(dy) * 1e-6), `${name}: ${label} - pans by exactly the swipe (${sx.toFixed(3)}, ${sy.toFixed(3)} px for delta ${dx}, ${dy})`, `got ${sx.toFixed(4)}, ${sy.toFixed(4)}`);
  };
  // a zoom: axis 'xy' both scales move the same way, 'x' / 'y' only that one; the world point under the pointer stays
  const zoomCheck = async (label, run, dir, axis = 'xy') => {
    const a = await read(); await run(); const b = await read();
    const moved = (r) => (dir > 0 ? r > 1.0005 : r < 1 / 1.0005), still = (r) => near(r, 1, 1e-9);
    const rx = b.zx / a.zx, ry = b.zy / a.zy;
    ok((axis.includes('x') ? moved(rx) : still(rx)) && (axis.includes('y') ? moved(ry) : still(ry)),
      `${name}: ${label} - zooms ${dir > 0 ? 'in' : 'out'}${axis === 'xy' ? '' : axis === 'x' ? ', across only' : ', up and down only'} (x ${f6(a.zx)} -> ${f6(b.zx)}, y ${f6(a.zy)} -> ${f6(b.zy)})`, `ratios ${rx}, ${ry}`);
    const ex = Math.abs(b.w[0] - a.w[0]) * b.zx, ey = Math.abs(b.w[1] - a.w[1]) * b.zy;   // how far the point under the pointer slid, screen px
    ok(ex <= 0.05 && ey <= 0.05, `${name}: ${label} - about the pointer (the point under it moved ${ex.toFixed(4)}, ${ey.toFixed(4)} px)`);
  };
  const real = (dx, dy, key) => async () => { await page.mouse.move(P.x, P.y); if (key) await page.keyboard.down(key); await page.mouse.wheel(dx, dy); if (key) await page.keyboard.up(key); await page.waitForTimeout(80); };

  // (a) swipe with a sideways part, fractional pixels
  await panCheck('real swipe dx 31.5 dy 12.25', real(31.5, 12.25), 31.5, 12.25); await settle();
  await panCheck('real swipe dx -9.25 dy -20.5', real(-9.25, -20.5), -9.25, -20.5); await settle();
  await panCheck('synthetic swipe dx -18.75 dy 9.5', () => synth({ deltaX: -18.75, deltaY: 9.5 }), -18.75, 9.5); await settle();
  await panCheck('synthetic sideways-only swipe dx 12.5', () => synth({ deltaX: 12.5, deltaY: 0 }), 12.5, 0); await settle();
  // (b) vertical only, small fractional. Chromium's input injection stamps wheelDeltaY = +-120 on every real wheel event, so a
  // vertical-only injected event looks like a mouse tick; a real Chrome trackpad sends wheelDeltaY = -3 * deltaY (chromeLike).
  await panCheck('Chrome-trackpad-like vertical swipe dy 7.5 (wheelDeltaY -22.5)', () => synth({ deltaX: 0, deltaY: 7.5, chromeLike: 1 }), 0, 7.5); await settle();
  await panCheck('synthetic vertical swipe dy -14.25', () => synth({ deltaX: 0, deltaY: -14.25 }), 0, -14.25); await settle();
  await panCheck('synthetic whole-pixel swipe dx 6 dy 4 (a precision touchpad sends whole numbers)', () => synth({ deltaX: 6, deltaY: 4 }), 6, 4); await settle();
  // (c) pinch: ctrlKey
  await zoomCheck('synthetic pinch ctrlKey deltaY -9.5', () => synth({ ctrlKey: true, deltaY: -9.5 }), +1); await settle();
  await zoomCheck('synthetic pinch ctrlKey deltaY 6.25', () => synth({ ctrlKey: true, deltaY: 6.25 }), -1); await settle();
  await zoomCheck('synthetic pinch with a sideways part (ctrlKey, dx 3.5 dy -8.5)', () => synth({ ctrlKey: true, deltaX: 3.5, deltaY: -8.5 }), +1); await settle();
  await zoomCheck('real pinch (Control held) deltaY -12', real(0, -12, 'Control'), +1); await settle();
  // (d) mouse-wheel steps
  await zoomCheck('real wheel step deltaY -100', real(0, -100), +1); await settle();
  await zoomCheck('real wheel step deltaY 100', real(0, 100), -1); await settle();
  await zoomCheck('synthetic wheel step deltaY -120', () => synth({ deltaY: -120 }), +1); await settle();
  await zoomCheck('synthetic wheel step deltaY 120', () => synth({ deltaY: 120 }), -1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY -3)', () => synth({ deltaY: -3, deltaMode: 1 }), +1); await settle();
  await zoomCheck('synthetic wheel in lines (deltaMode 1, deltaY 3)', () => synth({ deltaY: 3, deltaMode: 1 }), -1); await settle();
  // (f) Shift / Alt + a small delta (what a swipe would send): one-axis zoom, never a pan
  if (v.oneAxis) {
    await zoomCheck('Shift + small delta dy -7.5', () => synth({ shiftKey: true, deltaY: -7.5 }), +1, 'x'); await settle();
    await zoomCheck('Shift + small delta with a sideways part (dx 4.5 dy 9.25)', () => synth({ shiftKey: true, deltaX: 4.5, deltaY: 9.25 }), -1, 'x'); await settle();
    await zoomCheck('Shift + Chrome-trackpad-like dy -6.5', () => synth({ shiftKey: true, deltaY: -6.5, chromeLike: 1 }), +1, 'x'); await settle();
    await zoomCheck('Alt + small delta dy -7.5', () => synth({ altKey: true, deltaY: -7.5 }), +1, 'y'); await settle();
    await zoomCheck('Alt + small delta with a sideways part (dx -5.5 dy 8.75)', () => synth({ altKey: true, deltaX: -5.5, deltaY: 8.75 }), -1, 'y'); await settle();
    // a real wheel with Shift held: the browser decides what the event carries (it may turn it sideways); whatever arrives must not pan
    await page.evaluate(`(() => { const t = (${v.target})(); window.__wp = []; t.addEventListener('wheel', (e) => window.__wp.push([e.deltaX, e.deltaY, e.shiftKey]), { once: true }); })()`);
    const a = await read(); await real(0, -7.5, 'Shift')(); const b = await read();
    const got = await page.evaluate(() => window.__wp[0] || null);
    const ex = Math.abs(b.w[0] - a.w[0]) * b.zx, ey = Math.abs(b.w[1] - a.w[1]) * b.zy;
    ok(got && got[2] === true && ex <= 0.05 && ey <= 0.05 && near(b.zy / a.zy, 1, 1e-9), `${name}: real wheel with Shift held (arrived as deltaX ${got?.[0]}, deltaY ${got?.[1]}) - does not pan (x scale ${f6(a.zx)} -> ${f6(b.zx)})`, `slid ${ex}, ${ey}`);
    await settle();
  }
  // (e) the default is prevented, the page did not scroll
  const sBefore = await scrolled();
  const all = [];
  for (const init of [{ deltaX: 5.5, deltaY: 2.5 }, { deltaY: 3.5 }, { ctrlKey: true, deltaY: -4.5 }, { deltaY: 100 }, { deltaY: -120 }, ...(v.oneAxis ? [{ shiftKey: true, deltaY: 4.5 }] : [])]) { all.push((await synth(init)).prevented); await settle(); }
  ok(all.every(Boolean), `${name}: default prevented for a swipe, a vertical swipe, a pinch and both wheel steps${v.oneAxis ? ', and Shift + wheel' : ''}`, all.join());
  await real(20.5, 40.25)(); await real(0, 100)();
  ok(JSON.stringify(await scrolled()) === JSON.stringify(sBefore), `${name}: the real events did not scroll the page`);
  ok(problems.length === 0, `${name}: no console errors`, problems.join(' | '));
}

const t0 = Date.now();
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-tours', 'off'); } catch (e) { /* none */ } });   // the tour toast would sit over the canvas, under the pointer
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 429/.test(m.text())) problems.push('console: ' + m.text()); });   // 429: the shared test account's rate limit after many runs, not the view
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lab/civilcraft?space=paper`, { waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 1500 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  }

  console.log('\n== civilcraft: the sample site, an alignment across it');
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.waitForTimeout(600);
  const ends = await page.evaluate(() => { const c = window.civilcraft, b = c.project.eg().surface.bounds, y = (b.minY + b.maxY) / 2; return [c.toScreen(b.minX + (b.maxX - b.minX) * 0.15, y), c.toScreen(b.maxX - (b.maxX - b.minX) * 0.15, y)]; });
  await page.locator('[data-over]').focus();
  await page.keyboard.press('a');
  await page.mouse.click(ends[0].x, ends[0].y);
  await page.mouse.click(ends[1].x, ends[1].y);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  await page.keyboard.press('v');
  await page.evaluate(() => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
  const press = (sel) => page.evaluate((q) => { const b = document.querySelector(q); if (!b) throw new Error('no ' + q); b.click(); }, sel);   // Properties folds its groups (one open at a time): these controls sit in folded ones
  await press('[data-start-profile]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pvis.length === 2);
  ok(true, 'an alignment drawn by two clicks, its profile started (two PVIs on the ground)');

  if (want('profile')) {
    console.log('\n== profile view');
    await page.waitForSelector('[data-profile-panel]:not([hidden])');
    await page.waitForFunction(() => { const v = window.civilcraft.pview; return v.data && v.w > 200 && Number.isFinite(v.s0) && Number.isFinite(v.z0); });
    await page.waitForTimeout(400);
    const d = await page.evaluate(() => { const v = window.civilcraft.pview; return { eg: v.data.eg.filter((p) => p.z !== null).length, len: v.data.end - v.data.start }; });
    ok(d.eg > 5 && d.len > 10, `profile: the view shows the alignment (${d.len.toFixed(1)} long, ${d.eg} ground points)`);
    await exercise(page, 'profile', problems);
  }

  if (want('sections')) {
    console.log('\n== cross-section view');
    await page.evaluate(() => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); c.project.change('raise', (s) => { for (const p of s.alignments[0].pvis) p.z += 3; }); });   // 3 above the ground: fill to draw
    await page.waitForSelector('#cv-co-on', { state: 'attached' });
    if (!(await page.evaluate(() => document.querySelector('#cv-co-on').checked))) await press('#cv-co-on');
    await page.waitForFunction(() => window.civilcraft.project.graded().surface);
    await page.waitForSelector('[data-sec-add]', { state: 'attached' });
    await press('[data-sec-add]');
    await page.waitForSelector('[data-sections-panel]:not([hidden])');
    const n = await page.evaluate(() => document.querySelectorAll('[data-sec-sta] option').length);
    await page.selectOption('[data-sec-sta]', String(Math.floor(n / 2)));
    await page.waitForFunction(() => { const v = window.civilcraft.sections.view; return v.data?.section && v.w > 200 && Number.isFinite(v.o0) && Number.isFinite(v.z0); });
    await page.waitForTimeout(400);
    const s = await page.evaluate(() => { const c = window.civilcraft.sections.current(); return { i: c.index, ground: c.section.ground.flat().length, design: c.section.design.flat().length }; });
    ok(n > 3 && s.ground > 1 && s.design > 1, `sections: section ${s.i + 1} of ${n} is drawn (ground ${s.ground} points, design ${s.design})`);
    await exercise(page, 'sections', problems);
  }

  if (want('scan')) {
    console.log('\n== Start from a scan: the picture');
    await page.evaluate(() => { window.civilcraft.command('scan-start'); });
    await page.waitForSelector('[data-scanin-source-dialog][open]', { timeout: 20000 });
    const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-scanin-src="file"]')]);
    await fc.setFiles(path.join(REPO, 'fixtures/raster/plan-scan.png'));
    await page.waitForSelector('[data-scanin-dialog][open]', { timeout: 30000 });
    await page.waitForFunction(() => !document.querySelector('[data-busy]:not([hidden])'), null, { timeout: 30000 }).catch(() => {});
    await page.waitForFunction(() => { const c = document.querySelector('[data-scanin-view]'), v = c?.view; return v && v.s > 0 && v.s !== 1 && c.getBoundingClientRect().width > 200; });
    await page.waitForTimeout(600);
    const sc = await page.evaluate(() => { const c = document.querySelector('[data-scanin-view]'), v = c.view, r = c.getBoundingClientRect(), px = c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data; return { v, k: c.width / r.width, mid: [px[0], px[1], px[2]].join() }; });
    ok(sc.mid !== '232,232,232', `scan: fixtures/raster/plan-scan.png is drawn (fit scale ${sc.v.s.toFixed(4)}, ${sc.k.toFixed(3)} canvas px a screen px, centre pixel ${sc.mid})`);
    const frozen = await page.evaluate(() => { const c = document.querySelector('[data-scanin-view]'), a = c.view; a.x += 1000; let threw = false; try { c.view = { x: 0, y: 0, s: 9 }; } catch (e) { threw = true; } return c.view.x !== a.x && c.view.s !== 9; });
    ok(frozen, 'scan: the canvas\'s view is a read-only copy (writing to it moves nothing)');
    await exercise(page, 'scan', problems);
  }
  await ctx.close();
} catch (e) { fail++; console.log('  FAIL did not run to the end: ' + String(e.message).split('\n').slice(0, 3).join(' / ')); if (process.env.WP_SHOT) await browser.contexts()[0]?.pages()[0]?.screenshot({ path: process.env.WP_SHOT }).catch(() => {}); }
finally { await browser.close(); }
console.log(`\nwheel-pad civil browser: ${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exit(fail ? 1 : 0);
