#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pen.mjs — the shell's pen and touch layer (0.6 DC.102, session studio-extra_PART_2; app-phone.js § Pen and touch,
 * map docs/apps/app-phone.md § Pen and touch) in every app's dev build:
 *   - the release gate: /use (0.5) has no Pen and touch settings; /lab (dev) has them
 *   - before any pen, a finger reaches the app as before
 *   - a pen is noticed (html.cc-pen, remembered); palm rejection: a touch while the pen is down, within 0.6 s of it, or
 *     palm-sized never reaches the app; a touch later does
 *   - "Only move the view": one finger reaches nothing; a second finger hands both to the app (the first at where it is now)
 *   - two-finger tap = the app's Undo, three = Redo (window.ccInput.run); a moved or slow tap does nothing
 *   - the pen's side button / eraser end set to Undo / Redo: the app never sees the press, the command runs, the right
 *     click's context menu is eaten
 *   - Settings › General › Pen and touch: shown once a pen was seen, its fields follow and set the choices (kept on reload)
 *   - CadCraft with real input (CDP): a two-finger tap undoes a line; a pen stroke then a finger right after: the finger is
 *     dropped
 * The app-level events are synthetic PointerEvents dispatched on the drawing (the shell's capture listener on window sees
 * them first, as it sees real ones); the CadCraft part uses real touch and pen input through CDP.
 *
 *   node tools/shell-test/browser-pen.mjs [--apps a,b] [--shots <dir>]
 * Run as root (a session minted in-process for the shell's test admin, tools/shell-test/admin.php session).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const ALL = ['cadcraft', 'bimcraft', 'markupcraft', 'takeoffcraft', 'modelcraft', 'civilcraft', 'detailcraft', 'partcraft'];
const APPS = opt('--apps') ? opt('--apps').split(',') : ALL;
const SHOTS = opt('--shots');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const adminPhp = path.join(REPO, 'tools/shell-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of ['cadcraft', 'markupcraft']) {
  ok(curl(`${BASE}/lab/${slug}`, minted.cookie).includes('data-pen-set'), `${slug}: /lab (dev) has Pen and touch`);
  ok(!curl(`${BASE}/use/${slug}`).includes('data-pen-set'), `${slug}: /use (0.5 release) has none of it`);
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', hasTouch: true });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + (process.env.PEN_STACK ? ' @ ' + String(e.stack).split('\n').slice(1, 4).join(' / ') : '')));

// In the page: a counter on the drawing (what the app would get), a spy on the app's commands, and a pointer-event helper.
const PREP = () => {
  const stage = document.querySelector('body > main > section[class*="-stage"]');
  window.__pen = { got: [], runs: [], menus: 0, stage };
  if (!stage) return false;
  for (const t of ['pointerdown', 'pointermove', 'pointerup']) stage.addEventListener(t, (e) => window.__pen.got.push([t, e.pointerType, e.pointerId, Math.round(e.clientX)]));
  stage.addEventListener('contextmenu', () => { window.__pen.menus++; });
  if (window.ccInput && !window.ccInput.__spied) {
    const run = window.ccInput.run.bind(window.ccInput);
    window.ccInput.run = (id) => { if ((id === 'edit.undo' || id === 'edit.redo') && !window.__pen.real) { window.__pen.runs.push(id); return Promise.resolve(false); } return run(id); };
    window.ccInput.__spied = true;
  }
  const r = stage.getBoundingClientRect();
  window.__pen.cx = Math.round(r.left + r.width / 2); window.__pen.cy = Math.round(r.top + r.height / 2);
  window.__ev = (type, o) => {
    const target = document.elementFromPoint(o.x, o.y) || stage;
    target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, pointerId: o.id, pointerType: o.kind, isPrimary: !!o.primary,
      clientX: o.x, clientY: o.y, button: o.button ?? (type === 'pointermove' ? -1 : 0), buttons: o.buttons ?? (type === 'pointerup' ? 0 : 1), width: o.w || 10, height: o.w || 10, pressure: o.pressure ?? 0.5 }));
    if (type === 'pointerup' && o.button === 2) target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: o.x, clientY: o.y, button: 2 }));
  };
  return true;
};
const ev = (type, o) => page.evaluate(([t, x]) => window.__ev(t, x), [type, o]);
const got = () => page.evaluate(() => window.__pen.got.splice(0));
const runs = () => page.evaluate(() => window.__pen.runs.splice(0));
const C = () => page.evaluate(() => [window.__pen.cx, window.__pen.cy]);
const tap = async (id, x, y, extra = {}) => { await ev('pointerdown', { id, kind: 'touch', x, y, primary: true, ...extra }); await ev('pointerup', { id, kind: 'touch', x, y, ...extra }); };

try {
  for (const slug of APPS) {
    console.log(`\n== ${slug}`);
    problems = [];
    await page.goto(`${BASE}/lab/${slug}?space=paper`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.ccShellPen && window.ccShellPhone, null, { timeout: 30000 });
    await page.evaluate(() => { window.ccShellPen.forget(); ['palm', 'taps'].forEach((k) => window.ccShellPen.set(k, true)); window.ccShellPen.set('fingers', 'draw'); window.ccShellPen.set('side', 'app'); window.ccShellPen.set('eraser', 'app'); });
    await sleep(800);
    ok(await page.evaluate(PREP), 'the drawing (stage) is found');
    const [x, y] = await C();

    // before any pen
    await tap(11, x, y);
    let g = await got();
    ok(g.some(([t, k]) => t === 'pointerdown' && k === 'touch'), 'before any pen: a finger reaches the app');
    ok(!(await page.evaluate(() => document.documentElement.classList.contains('cc-pen'))), 'no html.cc-pen yet');

    // a pen: noticed, remembered
    await ev('pointerdown', { id: 2, kind: 'pen', x, y, primary: true });
    await ev('pointermove', { id: 2, kind: 'pen', x: x + 5, y, pressure: 0.7 });
    g = await got();
    ok(g.some(([t, k]) => t === 'pointerdown' && k === 'pen'), 'the pen reaches the app');
    ok(await page.evaluate(() => document.documentElement.classList.contains('cc-pen') && window.ccShellPen.seen() && JSON.parse(localStorage.getItem('cc-pen')).seen === true), 'the pen is noticed (html.cc-pen) and remembered for the device');
    ok(await page.evaluate(() => window.ccShellPen.down() && Math.abs(window.ccShellPen.state().pressure - 0.7) < 1e-6), 'ccShellPen: down, and the last pressure');
    // palm while the pen is down, and right after
    await tap(12, x + 40, y + 40);
    ok(!(await got()).some(([, k]) => k === 'touch'), 'palm rejection: a touch while the pen is down never reaches the app');
    await ev('pointerup', { id: 2, kind: 'pen', x: x + 5, y });
    await tap(13, x + 40, y + 40);
    ok(!(await got()).some(([, k]) => k === 'touch'), 'palm rejection: nor right after the pen lifts');
    await sleep(700);
    await tap(14, x + 40, y + 40);
    ok((await got()).some(([t, k]) => t === 'pointerdown' && k === 'touch'), 'a finger 0.7 s after the pen reaches the app');
    await tap(15, x + 40, y + 40, { w: 60 });
    ok(!(await got()).some(([, k]) => k === 'touch'), 'a palm-sized contact (60 px) never reaches the app');
    await page.evaluate(() => window.ccShellPen.set('palm', false));
    await tap(16, x + 40, y + 40, { w: 60 });
    ok((await got()).some(([t, k]) => t === 'pointerdown' && k === 'touch'), 'palm rejection off: it does');
    await page.evaluate(() => window.ccShellPen.set('palm', true));

    // fingers: only move the view
    await page.evaluate(() => window.ccShellPen.set('fingers', 'view'));
    await ev('pointerdown', { id: 21, kind: 'touch', x, y, primary: true });
    await ev('pointermove', { id: 21, kind: 'touch', x: x + 30, y });
    await ev('pointerup', { id: 21, kind: 'touch', x: x + 30, y });
    ok(!(await got()).some(([, k]) => k === 'touch'), 'Only move the view: one finger reaches nothing');
    await ev('pointerdown', { id: 22, kind: 'touch', x, y, primary: true });
    await ev('pointermove', { id: 22, kind: 'touch', x: x + 20, y });
    await ev('pointerdown', { id: 23, kind: 'touch', x: x + 80, y });
    g = await got();
    const downs = g.filter(([t]) => t === 'pointerdown');
    ok(downs.length === 2 && downs[0][2] === 22 && downs[0][3] === x + 20 && downs[1][2] === 23, 'a second finger: the first is handed over (where it is now), then the second — the app\'s own two-finger gesture');
    await ev('pointermove', { id: 22, kind: 'touch', x: x + 10, y: y + 30 });
    await ev('pointerup', { id: 22, kind: 'touch', x: x + 10, y: y + 30 });
    await ev('pointerup', { id: 23, kind: 'touch', x: x + 80, y });
    g = await got();
    ok(g.filter(([t]) => t === 'pointerup').length === 2 && g.some(([t, , id]) => t === 'pointermove' && id === 22), 'then both move and lift as usual');
    await page.evaluate(() => window.ccShellPen.set('fingers', 'draw'));
    await runs();

    // taps: two = undo, three = redo
    await ev('pointerdown', { id: 31, kind: 'touch', x, y, primary: true });
    await ev('pointerdown', { id: 32, kind: 'touch', x: x + 60, y });
    await ev('pointerup', { id: 31, kind: 'touch', x, y });
    await ev('pointerup', { id: 32, kind: 'touch', x: x + 60, y });
    await sleep(50);
    ok(JSON.stringify(await runs()) === '["edit.undo"]', 'a two-finger tap runs the app\'s Undo');
    for (const id of [41, 42, 43]) await ev('pointerdown', { id, kind: 'touch', x: x + id, y, primary: id === 41 });
    for (const id of [41, 42, 43]) await ev('pointerup', { id, kind: 'touch', x: x + id, y });
    await sleep(50);
    ok(JSON.stringify(await runs()) === '["edit.redo"]', 'a three-finger tap runs Redo');
    await ev('pointerdown', { id: 51, kind: 'touch', x, y, primary: true });
    await ev('pointerdown', { id: 52, kind: 'touch', x: x + 60, y });
    await ev('pointermove', { id: 52, kind: 'touch', x: x + 120, y });
    await ev('pointerup', { id: 51, kind: 'touch', x, y });
    await ev('pointerup', { id: 52, kind: 'touch', x: x + 120, y });
    await ev('pointerdown', { id: 53, kind: 'touch', x, y, primary: true });
    await ev('pointerdown', { id: 54, kind: 'touch', x: x + 60, y });
    await sleep(450);
    await ev('pointerup', { id: 53, kind: 'touch', x, y });
    await ev('pointerup', { id: 54, kind: 'touch', x: x + 60, y });
    await sleep(50);
    ok((await runs()).length === 0, 'a two-finger pan or a slow two-finger press is not a tap');
    await page.evaluate(() => window.ccShellPen.set('taps', false));
    await ev('pointerdown', { id: 55, kind: 'touch', x, y, primary: true });
    await ev('pointerdown', { id: 56, kind: 'touch', x: x + 60, y });
    await ev('pointerup', { id: 55, kind: 'touch', x, y });
    await ev('pointerup', { id: 56, kind: 'touch', x: x + 60, y });
    await sleep(50);
    ok((await runs()).length === 0, 'taps off: nothing');
    await page.evaluate(() => window.ccShellPen.set('taps', true));
    await got();

    // the pen's buttons
    await page.evaluate(() => { window.ccShellPen.set('side', 'undo'); window.ccShellPen.set('eraser', 'redo'); window.__pen.menus = 0; });
    await ev('pointerdown', { id: 61, kind: 'pen', x, y, primary: true, button: 2, buttons: 2 });
    await ev('pointerup', { id: 61, kind: 'pen', x, y, button: 2 });
    await sleep(50);
    g = await got();
    ok(!g.some(([t, k]) => t === 'pointerdown' && k === 'pen') && JSON.stringify(await runs()) === '["edit.undo"]', 'side button set to Undo: the app never sees the press, Undo runs');
    ok(await page.evaluate(() => window.__pen.menus === 0), 'and its right click\'s context menu is eaten');
    await ev('pointerdown', { id: 62, kind: 'pen', x, y, primary: true, button: 5, buttons: 32 });
    await ev('pointerup', { id: 62, kind: 'pen', x, y, button: 5 });
    await sleep(50);
    g = await got();
    ok(!g.some(([t, k]) => t === 'pointerdown' && k === 'pen') && JSON.stringify(await runs()) === '["edit.redo"]', 'eraser end set to Redo: the same');
    await page.evaluate(() => { window.ccShellPen.set('side', 'app'); window.ccShellPen.set('eraser', 'app'); });
    await ev('pointerdown', { id: 63, kind: 'pen', x, y, primary: true, button: 2, buttons: 2 });
    await ev('pointerup', { id: 63, kind: 'pen', x, y, button: 2 });
    g = await got();
    ok(g.some(([t, k]) => t === 'pointerdown' && k === 'pen') && (await runs()).length === 0, 'side button "What the app does": the app gets its right click');
    await sleep(700);

    // Settings › General › Pen and touch
    await page.evaluate(() => { const d = document.querySelector('[data-app-settings]'); if (!d.open) document.querySelector('[data-settings-open]').click(); });
    await page.evaluate(() => { const t = document.querySelector('[data-settings-tab="general"]'); if (t && !t.closest('[hidden]')) t.click(); });
    await sleep(100);
    ok(await page.isVisible('[data-pen-set]'), 'Settings › General shows Pen and touch once a pen was seen');
    ok(await page.evaluate(() => { const f = document.querySelector('[data-pen-set]'); return f.querySelector('[data-pen="palm"]').checked && f.querySelector('[data-pen="taps"]').checked && f.querySelector('input[value="draw"]').checked && f.querySelector('[data-pen="side"]').value === 'app'; }), 'its fields show the choices');
    await page.evaluate(() => {
      const f = document.querySelector('[data-pen-set]');
      f.querySelector('input[value="view"]').click();
      const sel = f.querySelector('[data-pen="side"]'); sel.value = 'redo'; sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    ok(await page.evaluate(() => { const p = window.ccShellPen.prefs(); return p.fingers === 'view' && p.side === 'redo'; }), 'changing them sets the choices');
    if (SHOTS && slug === 'cadcraft') {
      await page.evaluate(() => document.querySelector('[data-pen-set]').scrollIntoView({ block: 'center' }));
      await page.screenshot({ path: path.join(SHOTS, `pen-settings-${slug}.png`) });
    }
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.ccShellPen, null, { timeout: 30000 });
    ok(await page.evaluate(() => { const p = window.ccShellPen.prefs(); return p.fingers === 'view' && p.side === 'redo' && document.documentElement.classList.contains('cc-pen'); }), 'kept on reload (the device\'s choice)');
    // Synthetic pointer ids are not real pointers: an app calling setPointerCapture on one throws (the 3D views do). Real
    // input (below) has real ids, the replayed finger included.
    const real = problems.filter((m) => !/setPointerCapture.*No active pointer/.test(m));
    ok(!real.length, 'no console errors (but synthetic ids refused by setPointerCapture)' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  }

  // CadCraft with real input through CDP
  if (APPS.includes('cadcraft')) {
    console.log('\n== cadcraft, real touch and pen (CDP)');
    problems = [];
    await page.goto(`${BASE}/lab/cadcraft?space=paper`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.ccShellPen && window.cadcraft && window.cadcraft.doc, null, { timeout: 30000 });
    await page.evaluate(() => { window.ccShellPen.forget(); window.ccShellPen.set('fingers', 'draw'); window.ccShellPen.set('side', 'app'); window.ccShellPen.set('eraser', 'app'); window.ccShellPen.set('taps', true); window.ccShellPen.set('palm', true); });
    await sleep(800);
    await page.evaluate(PREP);
    await page.evaluate(() => { window.__pen.real = true; });   // the app's own Undo runs for real here
    const [x, y] = await C();
    await page.evaluate(() => { const d = window.cadcraft.doc; d.change('LINE', () => d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 50, y2: 20 })); });
    const lines = () => page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line').length);
    ok(await lines() === 1, 'a line in the drawing');
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((p, i) => ({ x: p[0], y: p[1], id: p[2] ?? i, radiusX: p[3] || 5, radiusY: p[3] || 5 })) });
    await touch('touchStart', [[x, y, 0], [x + 60, y, 1]]);
    await touch('touchEnd', []);
    await page.waitForFunction(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line').length === 0, null, { timeout: 3000 }).catch(() => {});
    ok(await lines() === 0, 'a real two-finger tap undoes the line (CadCraft\'s own Undo)');
    await got();
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x - 50, y: y - 50, pointerType: 'pen' });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x - 50, y: y - 50, button: 'left', buttons: 1, clickCount: 1, pointerType: 'pen', force: 0.6 });
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x - 50, y: y - 50, button: 'left', buttons: 0, clickCount: 1, pointerType: 'pen' });
    ok(await page.evaluate(() => window.ccShellPen.seen() && document.documentElement.classList.contains('cc-pen')), 'a real pen is noticed');
    await got();
    await touch('touchStart', [[x + 100, y + 60, 5]]);
    await touch('touchEnd', []);
    ok(!(await got()).some(([, k]) => k === 'touch'), 'a real finger right after the pen never reaches CadCraft (palm rejection)');
    await sleep(700);
    await touch('touchStart', [[x + 100, y + 60, 6]]);
    await touch('touchEnd', []);
    ok((await got()).some(([t, k]) => t === 'pointerdown' && k === 'touch'), 'later it does');
    // Only move the view, real fingers: one does nothing; a second hands both to CadCraft, which pans and zooms with them
    await page.evaluate(() => window.ccShellPen.set('fingers', 'view'));
    await sleep(700);
    await got();
    await touch('touchStart', [[x, y, 7]]);
    await touch('touchMove', [[x + 40, y, 7]]);
    await touch('touchEnd', []);
    ok(!(await got()).some(([, k]) => k === 'touch'), 'real finger, Only move the view: CadCraft gets nothing');
    const view0 = await page.evaluate(() => JSON.stringify([window.cadcraft.view.cx, window.cadcraft.view.cy, window.cadcraft.view.zoom]));
    await touch('touchStart', [[x, y, 8]]);
    await touch('touchMove', [[x + 10, y, 8]]);
    await touch('touchStart', [[x + 10, y, 8], [x + 110, y, 9]]);
    for (let i = 1; i <= 5; i++) await touch('touchMove', [[x + 10 - i * 15, y + i * 8, 8], [x + 110 + i * 15, y + i * 8, 9]]);
    await touch('touchEnd', []);
    await sleep(100);
    const g2 = await got();
    ok(g2.filter(([t, k]) => t === 'pointerdown' && k === 'touch').length === 2, 'two real fingers: both reach CadCraft (the first handed over)');
    ok(await page.evaluate((v) => JSON.stringify([window.cadcraft.view.cx, window.cadcraft.view.cy, window.cadcraft.view.zoom]) !== v, view0), 'and CadCraft pans and zooms with them');
    ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  }
} finally {
  await page.evaluate(() => { try { localStorage.removeItem('cc-pen'); } catch { /* gone */ } }).catch(() => {});
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* best effort */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
