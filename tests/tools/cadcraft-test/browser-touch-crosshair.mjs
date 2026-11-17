#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-touch-crosshair.mjs — the offset crosshair for fingers (1.0 ORS.20) in the CadCraft lab build, headless Chromium
 * with a touch screen emulated (real touch input through the DevTools protocol, so the page gets pointerType 'touch').
 * The rules themselves: bin/test-touch-crosshair.mjs. A real tablet has not been tried.
 *
 *   node tools/cadcraft-test/browser-touch-crosshair.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin from tools/cadcraft-test/admin.php, as the other browser checks). Fails on a console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
async function open({ touch }) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, serviceWorkers: 'block', hasTouch: touch, isMobile: touch });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch {} });   // the first-drawing tour would sit over the drawing and take the touches
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host.touchCrosshair);
  const cdp = await ctx.newCDPSession(page);
  return { ctx, page, cdp };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  // ---- a computer with a mouse: off, and no switch on the status bar
  {
    const { ctx, page } = await open({ touch: false });
    const s = await page.evaluate(() => ({ p: window.cadcraft.host.touchCrosshair.prefs(), avail: window.cadcraft.host.touchCrosshair.available, toggle: document.querySelector('[data-touch-crosshair-toggle]')?.hidden, pad: document.querySelector('[data-touch-crosshair-pad]')?.hidden }));
    ok(s.p.mode === 'auto' && s.p.on === false, 'a computer with a mouse: off by default', JSON.stringify(s.p));
    ok(s.toggle === true && s.pad === true, 'no status bar switch and no buttons without a touch screen');
    await ctx.close();
  }
  // ---- a tablet
  const { page, cdp } = await open({ touch: true });
  const st = await page.evaluate(() => ({ p: window.cadcraft.host.touchCrosshair.prefs(), toggle: document.querySelector('[data-touch-crosshair-toggle]')?.hidden, pad: document.querySelector('[data-touch-crosshair-pad]')?.hidden, coarse: matchMedia('(pointer: coarse)').matches, fine: matchMedia('(any-pointer: fine)').matches }));
  console.log('  note: emulated tablet says pointer coarse=' + st.coarse + ', any fine=' + st.fine + '; automatic gives on=' + st.p.on);
  ok(st.toggle === false, 'a touch screen: the status bar has the switch');
  ok(st.p.on === (st.coarse && !st.fine), 'automatic follows the device (on only where a finger is the only pointer)');
  await page.evaluate(() => { const c = window.cadcraft; c.host.touchCrosshair.set({ mode: 'on', distance: 80, side: 'left' }); });
  ok(await page.evaluate(() => !document.querySelector('[data-touch-crosshair-pad]').hidden && document.querySelector('[data-touch-crosshair-toggle]').getAttribute('aria-pressed') === 'true'), 'turned on: the Click and Enter buttons show and the switch is pressed');
  // snaps off for exact numbers
  await page.evaluate(() => { for (const n of ['osnap', 'gsnap', 'ortho', 'polar', 'otrack', 'dyn']) { const b = document.querySelector('[data-toggle="' + n + '"]'); if (b && b.getAttribute('aria-pressed') === 'true') b.click(); } });
  const box = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const at = (fx, fy) => ({ x: Math.round(box.x + box.w * fx), y: Math.round(box.y + box.h * fy) });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p.x, y: p.y, id: p.id ?? i, radiusX: 8, radiusY: 8, force: 1 })) });
  const worldAt = (p) => page.evaluate(({ x, y }) => { const c = window.cadcraft, r = document.querySelector('[data-over]').getBoundingClientRect(); return c.view.toWorld(x - r.left - (c.view.x0 || 0), y - r.top - (c.view.y0 || 0)); }, p);
  const cursor = () => page.evaluate(() => window.cadcraft.view.state.cursor);
  const count = () => page.evaluate(() => window.cadcraft.doc.count());
  const near = (a, b, tol) => a && b && Math.hypot(a.x - b.x, a.y - b.y) <= tol;
  const tol = await page.evaluate(() => 2.5 / window.cadcraft.view.zoom);
  const typeCmd = async (s) => { await page.evaluate((s) => { const i = document.querySelector('[data-cmd-input]'); i.focus(); }, s); await page.keyboard.type(s); await page.keyboard.press('Enter'); await sleep(150); };
  const tapEl = async (sel) => { const r = await page.evaluate((sel) => { const b = document.querySelector(sel).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, sel); await touch('touchStart', [r]); await sleep(40); await touch('touchEnd', []); await sleep(120); };

  await typeCmd('LINE');
  ok(await page.evaluate(() => window.cadcraft.engine.expects === 'point'), 'LINE asks for a point');
  // one finger: aim
  const f1 = at(0.5, 0.5), f2 = at(0.6, 0.55);
  await touch('touchStart', [f1]); await sleep(60);
  let cur = await cursor();
  ok(near(cur, await worldAt({ x: f1.x - 80, y: f1.y - 80 }), tol), 'finger down: the crosshair sits 80 px up and to the left of the finger', JSON.stringify(cur));
  await touch('touchMove', [at(0.55, 0.52)]); await sleep(30);
  await touch('touchMove', [f2]); await sleep(60);
  cur = await cursor();
  const p1 = await worldAt({ x: f2.x - 80, y: f2.y - 80 });
  ok(near(cur, p1, tol), 'dragging the finger moves the crosshair with it');
  await touch('touchEnd', []); await sleep(150);
  ok((await count()) === 0 && await page.evaluate(() => window.cadcraft.engine.running === 'LINE' && !window.cadcraft.engine.base), 'lifting the finger picks nothing');
  ok(near(await cursor(), p1, tol), 'the crosshair stays where it was left');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'touchx-aim.png') });
  // the Click button
  await tapEl('[data-touch-crosshair-pad] .is-click');
  ok(await page.evaluate(() => !!window.cadcraft.engine.base), 'the Click button picks: LINE has its first point');
  ok(near(await page.evaluate(() => window.cadcraft.engine.base), p1, tol), 'at the crosshair, not under the finger');
  // aim again, second-finger tap
  const f3 = at(0.75, 0.4);
  await touch('touchStart', [{ ...at(0.7, 0.45), id: 0 }]); await sleep(40);
  await touch('touchMove', [{ ...at(0.73, 0.42), id: 0 }]); await sleep(30);
  await touch('touchMove', [{ ...f3, id: 0 }]); await sleep(60);
  const p2 = await worldAt({ x: f3.x - 80, y: f3.y - 80 });
  await touch('touchStart', [{ ...f3, id: 0 }, { ...at(0.3, 0.6), id: 1 }]); await sleep(60);
  await touch('touchEnd', [{ ...at(0.3, 0.6), id: 1 }]); await sleep(150);   // the protocol lists the points being lifted
  const ents = await page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ type: e.type, x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 })));
  ok(ents.length === 1 && ents[0].type === 'line', 'a tap with a second finger picks: one line drawn', JSON.stringify(ents));
  ok(ents.length === 1 && near({ x: ents[0].x1, y: ents[0].y1 }, p1, tol) && near({ x: ents[0].x2, y: ents[0].y2 }, p2, tol), 'from crosshair to crosshair');
  await touch('touchEnd', []); await sleep(100);
  // a long press is Enter
  await touch('touchStart', [at(0.4, 0.4)]); await sleep(800);
  await touch('touchEnd', []); await sleep(150);
  ok(await page.evaluate(() => !window.cadcraft.engine.busy), 'a long press is Enter: LINE ends');
  ok((await count()) === 1, 'and draws nothing more');
  // object snap follows the crosshair
  await page.evaluate(() => { const b = document.querySelector('[data-toggle="osnap"]'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await typeCmd('LINE');
  const endScreen = await page.evaluate(() => { const c = window.cadcraft, e = c.doc.all()[0], s = c.view.toScreen(e.x2, e.y2), r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + (c.view.x0 || 0) + s.x, y: r.top + (c.view.y0 || 0) + s.y }; });
  await touch('touchStart', [{ x: endScreen.x + 80 + 40, y: endScreen.y + 80 + 40 }]); await sleep(40);
  await touch('touchMove', [{ x: endScreen.x + 80 + 20, y: endScreen.y + 80 + 20 }]); await sleep(40);
  await touch('touchMove', [{ x: endScreen.x + 80 + 3, y: endScreen.y + 80 + 2 }]); await sleep(120);
  const snap = await page.evaluate(() => { const s = window.cadcraft.view.state.snap; return s ? { kind: s.kind, x: s.x ?? s.p?.x, y: s.y ?? s.p?.y } : null; });
  ok(!!snap, 'object snap works on the crosshair (a snap marker shows at the line\'s end, the finger 80 px away)', JSON.stringify(snap));
  await touch('touchEnd', []); await sleep(80);
  await tapEl('[data-touch-crosshair-pad] .is-click');
  ok(near(await page.evaluate(() => window.cadcraft.engine.base), { x: ents[0]?.x2, y: ents[0]?.y2 }, 1e-6), 'and Click picks the snapped endpoint exactly');
  await tapEl('[data-touch-crosshair-pad] .is-enter');
  ok(await page.evaluate(() => !window.cadcraft.engine.busy), 'the Enter button ends the command');
  // two fingers: pinch zoom and pan, nothing picked
  const z0 = await page.evaluate(() => ({ zoom: window.cadcraft.view.zoom, cx: window.cadcraft.view.cx }));
  const a0 = at(0.4, 0.5), b0 = at(0.6, 0.5);
  await touch('touchStart', [{ ...a0, id: 0 }]); await sleep(30);
  await touch('touchStart', [{ ...a0, id: 0 }, { ...b0, id: 1 }]); await sleep(30);
  for (let i = 1; i <= 6; i++) { await touch('touchMove', [{ x: a0.x - i * 15, y: a0.y, id: 0 }, { x: b0.x + i * 15, y: b0.y, id: 1 }]); await sleep(25); }
  await touch('touchEnd', []); await sleep(150);
  const z1 = await page.evaluate(() => ({ zoom: window.cadcraft.view.zoom, n: window.cadcraft.doc.count(), busy: window.cadcraft.engine.busy, sel: window.cadcraft.host.selection.size }));
  ok(z1.zoom > z0.zoom * 1.3, 'two fingers spreading zoom in, as before', z0.zoom + ' → ' + z1.zoom);
  ok(z1.n === 1 && !z1.busy && z1.sel === 0, 'and pick nothing');
  // holding Click while the other finger moves is a drag: a selection by lasso / window picks the line up
  await typeCmd('ZOOM'); await typeCmd('E');
  const mid = await page.evaluate(() => { const c = window.cadcraft, e = c.doc.all()[0], r = document.querySelector('[data-over]').getBoundingClientRect(); const s1 = c.view.toScreen(e.x1, e.y1), s2 = c.view.toScreen(e.x2, e.y2); const ox = r.left + (c.view.x0 || 0), oy = r.top + (c.view.y0 || 0); return { x1: ox + Math.min(s1.x, s2.x) - 30, y1: oy + Math.min(s1.y, s2.y) - 30, x2: ox + Math.max(s1.x, s2.x) + 30, y2: oy + Math.max(s1.y, s2.y) + 30, clickBtn: (() => { const b = document.querySelector('[data-touch-crosshair-pad] .is-click').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })() }; });
  await page.evaluate(() => { const s = document.querySelector('input[name="ccLasso"][value="box"]'); if (s) { s.checked = true; s.dispatchEvent(new Event('change', { bubbles: true })); } });
  const fa = { x: mid.x1 + 80, y: mid.y1 + 80 }, fb = { x: mid.x2 + 80, y: mid.y2 + 80 };
  await touch('touchStart', [{ ...fa, id: 0 }]); await sleep(40);
  await touch('touchMove', [{ x: fa.x + 14, y: fa.y, id: 0 }]); await sleep(30);
  await touch('touchMove', [{ ...fa, id: 0 }]); await sleep(40);
  await touch('touchStart', [{ ...fa, id: 0 }, { ...mid.clickBtn, id: 1 }]); await sleep(60);
  for (let i = 1; i <= 5; i++) { await touch('touchMove', [{ x: fa.x + (fb.x - fa.x) * i / 5, y: fa.y + (fb.y - fa.y) * i / 5, id: 0 }, { ...mid.clickBtn, id: 1 }]); await sleep(30); }
  await touch('touchEnd', [{ ...fb, id: 0 }]); await sleep(150);
  await touch('touchEnd', []); await sleep(150);
  const sel = await page.evaluate(() => window.cadcraft.host.selection.size);
  ok(sel === 1, 'holding Click while the other finger moves drags a selection window round the line', 'selected ' + sel);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'touchx-drag.png') });
  await page.keyboard.press('Escape');
  // off again: a tap picks under the finger, as before
  await page.evaluate(() => document.querySelector('[data-touch-crosshair-toggle]').click());
  ok(await page.evaluate(() => !window.cadcraft.host.touchCrosshair.prefs().on && document.querySelector('[data-touch-crosshair-pad]').hidden), 'the status bar switch turns it off and the buttons go');
  await page.evaluate(() => { const b = document.querySelector('[data-toggle="osnap"]'); if (b.getAttribute('aria-pressed') === 'true') b.click(); });
  await typeCmd('LINE');
  const t1 = at(0.3, 0.3), t2 = at(0.5, 0.35);
  await touch('touchStart', [t1]); await sleep(40); await touch('touchEnd', []); await sleep(120);
  await touch('touchStart', [t2]); await sleep(40); await touch('touchEnd', []); await sleep(120);
  await page.keyboard.press('Escape'); await sleep(100);
  const w1 = await worldAt(t1), tol2 = await page.evaluate(() => 2.5 / window.cadcraft.view.zoom);
  const last = await page.evaluate(() => { const a = window.cadcraft.doc.all(); const e = a[a.length - 1]; return { n: a.length, x1: e.x1, y1: e.y1 }; });
  ok(last.n === 2 && near({ x: last.x1, y: last.y1 }, w1, tol2), 'off: a tap picks under the finger, as it always did', JSON.stringify(last));
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.touchCrosshair')).mode === 'off'), 'the choice is kept in this browser');
  // Settings and the command
  ok(await page.evaluate(() => !!document.querySelector('input[name="ccTouchx"]') && !!document.querySelector('input[name="ccTouchxDistance"]') && document.querySelector('input[name="ccTouchx"][value="off"]').checked), 'Settings has the choice, in step with the switch');
  await typeCmd('TCX'); await typeCmd('D'); await typeCmd('120');
  ok(await page.evaluate(() => window.cadcraft.host.touchCrosshair.prefs().distance === 120 && document.querySelector('input[name="ccTouchxDistance"]').value === '120'), 'TCX Distance 120 sets the distance (and the Settings slider follows)');
  ok(await page.evaluate(() => !!document.querySelector('[data-tb-key="View"] [data-cmd="TOUCHCROSSHAIR"]') && !!document.querySelector('[data-tb-key="View"] [data-cmd="WHOHAS"]')), 'both commands are under View, More on the toolbar');
  // WHOHAS in the browser
  await typeCmd('WHOHAS');
  const hist = await page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
  ok(/WHOHAS works in CadCraft Studio/.test(hist) && await page.evaluate(() => !window.cadcraft.engine.busy && window.cadcraft.host.drawingLock.available === false), 'WHOHAS in the browser says the feature is not there (ORS.27)');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++; console.log('  FAIL the run threw: ' + (err?.stack || err));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
