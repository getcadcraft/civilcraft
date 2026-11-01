#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-devices.mjs — the input-device layer (0.8 Track ID; assets/js/app-devices-ui.js, map docs/apps/app-devices.md) in an app's
 * dev build, with a stand-in view (so it checks the shell, not each app's adapter; tools/shell-test/devices-views/<slug>.mjs do those):
 *   - the release gate: /lab has Input devices, /use has none
 *   - defaults change nothing: a trackpad swipe reaches the app
 *   - trackpad scroll → pan / zoom / orbit on the view under the pointer, the app never sees it; pinch → nothing
 *   - a mouse side button → a command (the app's own registry, window.ccInput.run)
 *   - the pen's side button and a two-finger tap → what Input devices says (app-phone.js asks), ccShellPen.set forwards
 *   - a 3D mouse report and a game controller move the view and run their buttons
 *   - Settings › Global › Input devices: the card, Only <App> keeps its own, Every app gives it back, another app follows the shared
 *
 *   node tools/shell-test/browser-devices.mjs [--apps cadcraft,markupcraft]
 * Run as root (a session minted for the shell's test admin, tools/shell-test/admin.php session). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'cadcraft').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of APPS) {
  const lab = curl(`${BASE}/lab/${slug}`, minted.cookie);
  ok(lab.includes('data-dev-set') && lab.includes('id="cc-devices"'), `${slug}: /lab (dev) has Input devices`);
  ok(!curl(`${BASE}/use/${slug}`).includes('cc-devices'), `${slug}: /use (release) has none of it`);
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
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

// In the page: a stand-in view over the middle of the drawing, a counter of what the app's own listeners get, a spy on commands.
const PREP = () => {
  const stage = document.querySelector('body > main > section[class*="-stage"]') || document.querySelector('main');
  const r = stage.getBoundingClientRect();
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:${r.left + r.width / 4}px;top:${r.top + r.height / 4}px;width:${r.width / 2}px;height:${r.height / 2}px;z-index:5`;
  stage.append(el);   // inside the stage, so app-phone.js counts it as the drawing
  const T = window.__dv = { el, calls: [], appWheel: 0, runs: [], cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  el.addEventListener('wheel', () => { T.appWheel++; });
  window.ccViews.push({ el, kind: '3d', pan: (dx, dy) => T.calls.push(['pan', dx, dy]), zoom: (f, x, y) => T.calls.push(['zoom', f, x, y]), orbit: (dx, dy) => T.calls.push(['orbit', dx, dy]), fit: () => T.calls.push(['fit']) });
  const I = window.ccInput;
  if (I && !I.__dvSpied) { const run = I.run.bind(I); I.run = (id) => { T.runs.push(id); return id.startsWith('edit.') ? Promise.resolve(true) : run(id); }; I.__dvSpied = true; }
  T.wheel = (o) => { const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: T.cx, clientY: T.cy, deltaMode: 0, ...o }); el.dispatchEvent(e); return e.defaultPrevented; };
  T.ptr = (type, o) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: T.cx, clientY: T.cy, isPrimary: true, ...o }));
  T.take = () => { const c = T.calls.splice(0), w = T.appWheel, rr = T.runs.splice(0); T.appWheel = 0; return { calls: c, wheel: w, runs: rr }; };
  return !!window.ccShellDevices;
};
const take = () => page.evaluate(() => window.__dv.take());

try {
  for (const slug of APPS) {
    console.log(`\n== ${slug}`);
    problems = [];
    await page.goto(`${BASE}/lab/${slug}?space=paper`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { localStorage.removeItem('cc-devices'); localStorage.removeItem('cc-devices-seen'); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.ccShellDevices && window.ccInput && window.ccShellPen, null, { timeout: 30000 });
    await sleep(800);
    ok(await page.evaluate(PREP), 'window.ccShellDevices is there');
    await page.mouse.move(640, 400);   // the pointer over the drawing (the stand-in view)
    await page.evaluate(() => window.dispatchEvent(new PointerEvent('pointermove', { clientX: window.__dv.cx, clientY: window.__dv.cy })));

    // defaults: nothing changes
    await page.evaluate(() => window.__dv.wheel({ deltaX: 1.5, deltaY: 4.25 }));
    let t = await take();
    ok(t.wheel === 1 && !t.calls.length, 'defaults: a trackpad swipe reaches the app as before');
    ok(await page.evaluate(() => document.documentElement.classList.contains('cc-dev-trackpad')), 'the trackpad is noticed (html.cc-dev-trackpad)');

    // trackpad → pan / zoom / orbit
    await page.evaluate(() => window.ccShellDevices.set('trackpad.scroll', 'view:pan', 'all'));
    let prevented = await page.evaluate(() => window.__dv.wheel({ deltaX: 2.5, deltaY: 6.5 }));
    t = await take();
    ok(t.wheel === 0 && prevented && t.calls.length === 1 && t.calls[0][0] === 'pan' && t.calls[0][1] === -2.5 && t.calls[0][2] === -6.5, 'scroll = pan: the view follows the fingers, the app never sees it');
    await page.evaluate(() => { window.ccShellDevices.set('trackpad.speed', 2); window.ccShellDevices.set('trackpad.invert', true); });
    await page.evaluate(() => window.__dv.wheel({ deltaX: 1.5, deltaY: 0.5 }));
    t = await take();
    ok(t.calls[0] && t.calls[0][1] === 3 && t.calls[0][2] === 1, 'speed and invert apply');
    await page.evaluate(() => { window.ccShellDevices.set('trackpad.speed', 1); window.ccShellDevices.set('trackpad.invert', false); window.ccShellDevices.set('trackpad.scroll', 'view:zoom'); });
    await page.evaluate(() => window.__dv.wheel({ deltaX: 0, deltaY: -8.5 }));
    t = await take();
    ok(t.calls[0] && t.calls[0][0] === 'zoom' && t.calls[0][1] > 1, 'scroll = zoom: closer on a swipe up');
    await page.evaluate(() => window.ccShellDevices.set('trackpad.scroll', 'view:orbit'));
    await page.evaluate(() => window.__dv.wheel({ deltaX: 3.5, deltaY: 0 }));
    t = await take();
    ok(t.calls[0] && t.calls[0][0] === 'orbit', 'scroll = orbit');
    await page.evaluate(() => window.ccShellDevices.set('trackpad.pinch', 'off'));
    await page.evaluate(() => window.__dv.wheel({ ctrlKey: true, deltaY: 2.4 }));
    t = await take();
    ok(t.wheel === 0 && !t.calls.length, 'pinch = nothing: the app does not zoom');
    await page.evaluate(() => window.__dv.wheel({ deltaX: 0, deltaY: 100, timeStamp: 1 }));
    await sleep(450);
    await page.evaluate(() => window.__dv.wheel({ deltaX: 0, deltaY: 100 }));
    t = await take();
    ok(t.wheel >= 1, 'a mouse wheel step still reaches the app');
    await page.evaluate(() => window.ccShellDevices.reset());

    // mouse side buttons
    await page.evaluate(() => window.ccShellDevices.set('mouse.back', 'cmd:edit.undo'));
    await page.evaluate(() => { window.__dv.ptr('pointerdown', { pointerType: 'mouse', button: 3, buttons: 8 }); window.__dv.ptr('pointerup', { pointerType: 'mouse', button: 3, buttons: 0 }); });
    t = await take();
    ok(t.runs.includes('edit.undo'), 'mouse back button → Undo (the app\'s command)');

    // pen and touch through app-phone.js
    await page.evaluate(() => window.ccShellDevices.set('pen.side', 'view:fit'));
    await page.evaluate(() => { const T = window.__dv; T.ptr('pointerdown', { pointerType: 'pen', pointerId: 5, button: 2, buttons: 2 }); T.ptr('pointerup', { pointerType: 'pen', pointerId: 5, button: 2, buttons: 0 }); });
    t = await take();
    ok(t.calls.some((c) => c[0] === 'fit'), 'pen side button → Fit everything (any action, not just Undo/Redo)');
    await page.evaluate(() => window.ccShellPen.set('side', 'redo'));
    ok(await page.evaluate(() => window.ccShellDevices.prefs().pen.side === 'cmd:edit.redo'), 'ccShellPen.set forwards to Input devices (one answer)');
    await page.evaluate(() => window.ccShellDevices.set('touch.tap2', 'cmd:edit.redo'));
    await sleep(700);   // palm rejection: no finger counts within 0.6 s of a pen
    await page.evaluate(() => { const T = window.__dv; T.ptr('pointerdown', { pointerType: 'touch', pointerId: 31, buttons: 1 }); T.ptr('pointerdown', { pointerType: 'touch', pointerId: 32, buttons: 1, isPrimary: false }); T.ptr('pointerup', { pointerType: 'touch', pointerId: 31 }); T.ptr('pointerup', { pointerType: 'touch', pointerId: 32 }); });
    t = await take();
    ok(t.runs.includes('edit.redo'), 'two-finger tap → the command Input devices names');
    await page.evaluate(() => window.ccShellDevices.reset());

    // 3D mouse: a report as WebHID would give it
    await page.evaluate(() => { const A = window.ccShellDevices; A._space.dev = { productName: 'Test 3D mouse' }; A._space.t = [350, 0, 0]; A._space.r = [0, 0, 175]; A._tick(16); });
    t = await take();
    ok(t.calls.some((c) => c[0] === 'pan' && c[1] < 0) && t.calls.some((c) => c[0] === 'orbit'), '3D mouse: push right pans, twist orbits');
    await page.evaluate(() => { const A = window.ccShellDevices; A.set('spacemouse.buttons.1', 'cmd:edit.undo'); A._space.t = [0, 0, 0]; A._space.r = [0, 0, 0]; A._space.buttons = 2; A._tick(16); A._space.buttons = 0; A._tick(16); A._space.dev = null; });
    t = await take();
    ok(t.runs.includes('edit.undo'), '3D mouse: button 2 runs its command');

    // game controller: a stand-in for navigator.getGamepads
    await page.evaluate(() => {
      const pad = { index: 0, id: 'Test controller', mapping: 'standard', axes: [0.9, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
      window.__pad = pad;
      navigator.getGamepads = () => [pad];
      const e = new Event('gamepadconnected'); e.gamepad = pad; window.dispatchEvent(e);
    });
    await sleep(200);
    await page.evaluate(() => { window.__pad.axes[0] = 0; window.__pad.buttons[0].pressed = true; });
    await sleep(150);
    t = await take();
    ok(t.calls.some((c) => c[0] === 'pan' && c[1] < 0), 'controller: the left stick pans');
    ok(t.calls.some((c) => c[0] === 'fit'), 'controller: A fits the view');
    ok(await page.evaluate(() => document.documentElement.classList.contains('cc-dev-gamepad')), 'the controller is noticed');
    await page.evaluate(() => { const e = new Event('gamepaddisconnected'); e.gamepad = window.__pad; window.dispatchEvent(e); });

    // Settings › Global › Input devices
    await page.keyboard.press('Control+,');
    await page.waitForSelector('dialog[open] [data-settings-pane]', { timeout: 10000 });
    await page.evaluate(() => document.querySelector('[data-settings-tab="general"]')?.click());
    await sleep(300);
    ok(await page.evaluate(() => { const s = document.querySelector('[data-dev-set]'); return !!s && !s.hidden && s.querySelectorAll('[data-dev-card]').length === 7; }), 'Settings: the Input devices card with seven devices');
    ok(await page.evaluate(() => { const own = document.querySelector('[data-pen-own]'); return !own || own.hidden; }), 'Pen and touch: the side/eraser/taps fields moved to Input devices');
    ok(await page.evaluate(() => [...document.querySelector('[data-dev="mouse.back"]').options].some((o) => o.value === 'cmd:edit.undo')), "a button's choices list the app's commands");
    await page.evaluate(() => { const r = document.querySelector('[data-dev-scope][value="app"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.evaluate(() => { const s = document.querySelector('[data-dev="trackpad.scroll"]'); s.value = 'view:pan'; s.dispatchEvent(new Event('change', { bubbles: true })); });
    const st = await page.evaluate((a) => JSON.parse(localStorage.getItem('cc-devices')), slug);
    ok(st.apps[slug]?.trackpad.scroll === 'view:pan' && st.all.trackpad.scroll === 'app', `Only ${slug}: kept for this app, the shared one unchanged`);
    const other = slug === 'cadcraft' ? 'markupcraft' : 'cadcraft';
    const p2 = await ctx.newPage();
    await p2.goto(`${BASE}/lab/${other}?space=paper`, { waitUntil: 'domcontentloaded' });
    await p2.waitForFunction(() => window.ccShellDevices, null, { timeout: 30000 });
    ok(await p2.evaluate(() => window.ccShellDevices.scope() === 'all' && window.ccShellDevices.prefs().trackpad.scroll === 'app'), `${other} keeps the every-app settings`);
    await p2.evaluate(() => window.ccShellDevices.set('mouse.tilt', 'off', 'all'));
    await sleep(300);
    ok(await page.evaluate(() => window.ccShellDevices.state().all.mouse.tilt === 'off'), 'a change in another window reaches this one (storage event)');
    await p2.close();
    await page.evaluate(() => { const r = document.querySelector('[data-dev-scope][value="all"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
    ok(await page.evaluate((a) => !(a in JSON.parse(localStorage.getItem('cc-devices')).apps) && window.ccShellDevices.prefs().trackpad.scroll === 'app', slug), 'Every app again: its own are dropped');
    await page.keyboard.press('Escape');
    await page.evaluate(() => { localStorage.removeItem('cc-devices'); localStorage.removeItem('cc-pen'); });
    ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
  }
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
