#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * devices-views/bimcraft.mjs — 0.8 Track ID: BimCraft hands its views to the input-device layer (assets/js/app-devices-ui.js).
 * Opens /lab/bimcraft and checks, for each view a person navigates, that window.ccShellDevices.views() lists it and that
 * zoom(1.5, 100, 100), pan(50, 0), orbit(40, 0) (3D) and fit() each move the view:
 *   - the IFC 3D viewer (viewer3d.js; the sample house from ../testfiles when present)
 *   - the plan view of a new building (model-planview.js)
 *   - a drawing in 2D (dwg-view.js) and in 3D (dwg-view3d.js)
 *
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/bimcraft.mjs
 * Run as root (a session minted for the shell's test admin, tools/shell-test/admin.php session).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const IFC = '/var/www/CADCRAFT/testfiles/samples/Ifc4_SampleHouse.ifc';
const DWG = path.join(REPO, 'tools/bimcraft-test/fixtures/dwg3d-acad2000.dwg');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } catch { /* none */ } });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 90000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Each step on the view whose el matches `sel`; `stateSrc` = a function body returning the view's state as JSON-able data. */
async function check(label, sel, stateSrc, steps) {
  const listed = await page.evaluate((s) => { const el = document.querySelector(s); const vs = window.ccShellDevices?.views() || []; const v = vs.filter((x) => x.el === el); return { n: vs.length, found: v.length, kind: v[0]?.kind, has: v[0] ? ['pan', 'zoom', 'orbit', 'fit'].filter((m) => typeof v[0][m] === 'function') : [] }; }, sel);
  ok(listed.found >= 1, `${label}: listed by ccShellDevices.views() (${listed.n} views; kind ${listed.kind}; ${listed.has.join(' ')})`);
  if (!listed.found) return;
  for (const [name, call] of steps) {
    const r = await page.evaluate(async ({ s, src, call }) => {
      const st = new Function(src);
      const el = document.querySelector(s), v = window.ccShellDevices.views().filter((x) => x.el === el).pop();
      const before = JSON.stringify(st());
      new Function('v', call)(v);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { before, after: JSON.stringify(st()) };
    }, { s: sel, src: stateSrc, call });
    ok(r.before !== r.after, `${label}: ${name} moves the view  ${r.before}  →  ${r.after}`);
  }
}
const r3 = (a) => a.map((x) => Math.round(x * 1000) / 1000);

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  ok(await page.evaluate(() => !!window.ccShellDevices), 'the device layer is loaded (window.ccShellDevices)');

  if (fs.existsSync(IFC)) {
    console.log('== IFC 3D viewer (viewer3d.js)');
    await page.setInputFiles('[data-file]', IFC);
    await waitStatus(/^Opened /);
    await sleep(300);
    const st = `const v = document.querySelector('[data-canvas]').viewer; const p = v.camera.position, t = v.controls.target; return [p.x, p.y, p.z, t.x, t.y, t.z].map((x) => Math.round(x * 1000) / 1000);`;
    await check('IFC 3D', '[data-canvas]', st, [['zoom(1.5, 100, 100)', 'v.zoom(1.5, 100, 100)'], ['pan(50, 0)', 'v.pan(50, 0)'], ['orbit(40, 0)', 'v.orbit(40, 0)'], ['fit()', 'v.zoom(3); v.pan(80, 40); window.__f = 1; v.fit()']]);
    const zin = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, d0 = v.camera.position.distanceTo(v.controls.target); window.ccShellDevices.views().find((x) => x.el === v.canvas).zoom(2); return [d0, v.camera.position.distanceTo(v.controls.target)]; });
    ok(zin[1] < zin[0] * 0.6, `IFC 3D: zoom(2) halves the distance to the target (${zin.map((x) => x.toFixed(2)).join(' → ')})`);
  } else console.log('  (skip IFC 3D: no ' + IFC + ')');

  console.log('== plan view of a new building (model-planview.js)');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Devices test');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building /);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await sleep(300);
  const pst = `const v = window.bimcraftPlan.view; return [v.cx, v.cy, v.scale].map((x) => Math.round(x * 100000) / 100000);`;
  await check('plan', '[data-plan-canvas]', pst, [['zoom(1.5, 100, 100)', 'v.zoom(1.5, 100, 100)'], ['pan(50, 0)', 'v.pan(50, 0)'], ['fit()', 'v.fit()']]);
  const pz = await page.evaluate(() => { const pv = window.bimcraftPlan.view, v = window.ccShellDevices.views().find((x) => x.el === pv.canvas); const a = pv.fromCanvas(100, 100); v.zoom(1.5, 100, 100); const b = pv.fromCanvas(100, 100); const s = pv.toScreen([0, 0]); v.pan(50, 0); const s2 = pv.toScreen([0, 0]); return { still: Math.hypot(a[0] - b[0], a[1] - b[1]), moved: s2.x - s.x }; });
  ok(pz.still < 1e-6 && Math.abs(pz.moved - 50) < 1e-6, `plan: zoom keeps the point under (100, 100) (${pz.still}); pan(50, 0) moves the content 50 px right (${pz.moved})`);

  console.log('== drawing in 2D (dwg-view.js) and 3D (dwg-view3d.js)');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', DWG);
  await waitStatus(/^Opened /);
  await sleep(300);
  const dst = `const v = document.querySelector('[data-dwg-canvas]').view; return [v.cx, v.cy, v.zoom].map((x) => Math.round(x * 100000) / 100000);`;
  await check('DWG 2D', '[data-dwg-canvas]', dst, [['zoom(1.5, 100, 100)', 'v.zoom(1.5, 100, 100)'], ['pan(50, 0)', 'v.pan(50, 0)'], ['fit()', 'v.fit()']]);
  const dz = await page.evaluate(() => { const dv = document.querySelector('[data-dwg-canvas]').view, v = window.ccShellDevices.views().find((x) => x.el === dv.canvas); const a = dv.toWorld(100, 100); v.zoom(1.5, 100, 100); const b = dv.toWorld(100, 100); const w0 = dv.toWorld(200, 200); v.pan(50, 0); const w1 = dv.toWorld(250, 200); return { still: Math.hypot(a[0] - b[0], a[1] - b[1]), follow: Math.hypot(w0[0] - w1[0], w0[1] - w1[1]) }; });
  ok(dz.still < 1e-6 && dz.follow < 1e-6, `DWG 2D: zoom keeps the point under (100, 100); pan(50, 0) moves the content 50 px right`);
  await page.click('[data-sheet-tabs] [data-dwg-3d]');
  await waitStatus(/^Model space in 3D: /);
  await sleep(300);
  const tst = `const c = document.querySelector('[data-dwg3d-canvas]').view.cam; return [...c.eye, ...c.target].map((x) => Math.round(x * 1000) / 1000);`;
  await check('DWG 3D', '[data-dwg3d-canvas]', tst, [['zoom(1.5, 100, 100)', 'v.zoom(1.5, 100, 100)'], ['pan(50, 0)', 'v.pan(50, 0)'], ['orbit(40, 0)', 'v.orbit(40, 0)'], ['fit()', 'v.fit()']]);
  const n = await page.evaluate(() => { const vs = window.ccShellDevices.views(); return { n: vs.length, els: vs.map((v) => v.el.dataset ? Object.keys(v.el.dataset).join(',') : v.el.tagName) }; });
  console.log('         views now: ' + n.n + ' (' + n.els.join(' | ') + ')');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' / ') : ''));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
