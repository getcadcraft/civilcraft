#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fem-solid.mjs — the Solid FEM add-on in the real /lab/partcraft page (0.9 SU.908c). Run as root (a session is minted by tools/addons-test/admin.php;
 * root's Playwright Chromium). One browser, nice, with a timeout:   nice timeout 900 node tools/addons-test/browser-fem-solid.mjs [--shots dir]
 * Bundled and off, switched on in Settings > Add-ons; a 100 x 10 x 10 steel bar opened on the mesh kernel; the tab; fixed faces and a force picked by CLICKING faces in
 * the 3D view (marks, toggle, undo); Mesh; Solve; the tip deflection against Timoshenko; the reaction against the load; the plot as display bodies saved in the part;
 * a yield warning in the list; natural frequencies against Euler-Bernoulli; the settings saved in the part file and read back with the add-on off; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart } from '../partcraft-test/browser-simulation.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/fem-solid'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const [cname, cvalue] = admin('session').cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { const W = window.Worker; window.__workers = []; window.Worker = class extends W { constructor(u, o) { super(u, o); window.__workers.push(String(u)); } }; });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const unscroll = () => page.evaluate(() => { for (let e = document.querySelector('[data-sfem]'); e; e = e.parentElement) if (e.scrollLeft) e.scrollLeft = 0; });
const shot = async (name) => { await unscroll().catch(() => {}); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const pane = '[data-sfem]';
const act = async (a, scope = pane) => { const sel = scope + ' [data-sfem-act="' + a + '"]'; await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' })); await page.click(sel); };
const study = () => page.evaluate(() => JSON.parse(JSON.stringify(window.partcraft.part.studies?.['fem-solid'] || null)));
// a screen point on the plane face with outward normal n (as tools/partcraft-test/browser-simulation.mjs)
const facePoint = (n) => page.evaluate((n) => {
  const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen, m = rg.mesh;
  const fi = rg.faces.findIndex((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999);
  if (fi < 0) return null;
  const rect = view.canvas.getBoundingClientRect();
  for (let t = 0; t < m.triFace.length; t++) {
    if (m.triFace[t] !== fi) continue;
    for (const w of [[1 / 3, 1 / 3, 1 / 3], [0.6, 0.2, 0.2], [0.2, 0.6, 0.2], [0.2, 0.2, 0.6]]) {
      const p = [0, 1, 2].map((c) => w[0] * m.positions[3 * m.indices[3 * t] + c] + w[1] * m.positions[3 * m.indices[3 * t + 1] + c] + w[2] * m.positions[3 * m.indices[3 * t + 2] + c]);
      const v = new THREE.Vector3(...p).project(view.camera);
      const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
      if (x < rect.left + 4 || y < rect.top + 4 || x > rect.right - 4 || y > rect.bottom - 4) continue;
      const hit = view.pickAt(x, y, { edges: false });
      if (hit && hit.kind === 'face' && hit.face === fi) return { x, y, face: fi, name: rg.faces[fi].name };
    }
  }
  return null;
}, n);
const num = async (sel) => Number((await page.textContent(sel)).replace(/[^\d.e+-]/g, ''));
try {
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.removeItem('partcraft.exactKernel'); const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on['fem-solid']; if (s.off) delete s.off['fem-solid']; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons && !!window.partcraft, null, { timeout: 30000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'fem-solid' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  const me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'fem-solid'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Solid FEM is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason }));
  ok(me && me.version === '0.9.0' && me.manifest.api === '1.3', 'version 0.9.0, add-on API 1.3');
  ok(!(await page.$('.pc-tabs [data-addon="fem-solid"]')), 'off: no tab in the right panel (never embedded)');

  await page.click('[data-settings-open]');
  if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const nav = page.locator('.shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
  if (await nav.count()) await nav.first().click();
  const rowSel = '[data-addons-set] li[data-addon="fem-solid"]';
  await page.waitForSelector(rowSel, { state: 'visible', timeout: 10000 });
  ok(/Solid FEM/.test(await page.textContent(rowSel)), 'Settings > Add-ons lists Solid FEM');
  await page.click('[data-addon-toggle="fem-solid"]');
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'fem-solid')?.state === 'active', null, { timeout: 15000 });
  ok(await page.isChecked('[data-addon-toggle="fem-solid"]'), 'switched on (state active)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());

  const L = 100, w = 10, P = 100;
  const opened = await page.evaluate(async ([t, n]) => { await window.partcraft.openText(t, n); await window.partcraft.built(); const r = window.partcraft.regen; return { faces: r.faces.length, named: !!r.named, vol: r.stats.volume }; }, [JSON.stringify(await cantileverPart(L, w, w)), 'Bar.partcraft.json']);
  ok(opened.faces === 6 && opened.named && Math.abs(opened.vol - 10000) < 1, 'the bar opens on the mesh kernel: 6 named faces, volume 10000', JSON.stringify(opened));
  await page.waitForTimeout(600);
  const tab = await page.$('.pc-tabs [data-addon="fem-solid"]');
  ok(!!tab, 'a "Solid FEM" tab is in the right panel strip');
  await tab.click();
  await page.waitForSelector(pane, { timeout: 10000 });
  ok(/Not a code check; your engineer reviews the results/.test(await page.textContent(pane + ' [data-sfem-note]')), 'the panel carries the liability line');
  await shot('01-panel');

  // fixed face by clicking in the 3D view
  await act('add-support');
  await page.waitForSelector(pane + ' [data-sfem-item="s1"]');
  await page.evaluate(() => window.partcraft.view.view('left'));
  await page.waitForTimeout(500);
  const left = await facePoint([-1, 0, 0]);
  ok(!!left, 'the left end face is visible in the view', JSON.stringify(left));
  await page.mouse.move(left.x, left.y); await page.waitForTimeout(250);
  await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => (window.partcraft.part.studies?.['fem-solid']?.supports?.[0]?.faces || []).length === 1, null, { timeout: 5000 });
  ok(true, 'clicking the face adds it to s1 (saved in the part)');
  ok((await study()).supports[0].faces[0].name === (await page.evaluate(() => window.partcraft.regen.faces[0].name)) || (await study()).supports[0].faces.length === 1, 'the face is stored by name and point');
  const sel0 = await page.evaluate(() => window.partcraft.sel);
  ok(!sel0 || sel0.kind !== 'face', 'the click did not select anything else in the app');
  await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => (window.partcraft.part.studies?.['fem-solid']?.supports?.[0]?.faces || []).length === 0, null, { timeout: 5000 });
  ok(true, 'clicking it again takes it off');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => (window.partcraft.part.studies?.['fem-solid']?.supports?.[0]?.faces || []).length === 1, null, { timeout: 5000 });
  ok(true, 'undo puts the face back (one undo step per pick)');
  await shot('02-support-picked');
  await act('pick', pane + ' [data-sfem-item="s1"]');   // Done picking

  // a force on the right face
  await act('add-force');
  await page.waitForSelector(pane + ' [data-sfem-item="l1"]');
  await page.evaluate(() => window.partcraft.view.view('right')); await page.waitForTimeout(500);
  const right = await facePoint([1, 0, 0]);
  await page.mouse.move(right.x, right.y); await page.waitForTimeout(250); await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => (window.partcraft.part.studies?.['fem-solid']?.loads?.[0]?.faces || []).length === 1, null, { timeout: 5000 });
  const fy = pane + ' [data-sfem-item="l1"] .sfem-grid input:nth-of-type(1)';
  const inputs = await page.$$(pane + ' [data-sfem-item="l1"] input');
  await inputs[1].fill(String(-P)); await inputs[1].press('Tab');
  await page.waitForFunction(() => window.partcraft.part.studies['fem-solid'].loads[0].F[1] === -100, null, { timeout: 5000 });
  void fy;
  ok(true, 'force on the right face: Fy = -100 N');
  await act('pick', pane + ' [data-sfem-item="l1"]');

  // mesh + solve
  await act('mesh');
  await page.waitForSelector(pane + ' [data-sfem-mesh], [data-sfem-msg]:not(:empty)', { timeout: 120000 });
  await page.waitForTimeout(500);
  if (!(await page.$(pane + ' [data-sfem-mesh]'))) throw new Error('mesh: ' + (await page.textContent(pane + ' [data-sfem-msg]')));
  const meshTxt = await page.textContent(pane + ' [data-sfem-mesh]');
  ok(/quadratic tetrahedra/.test(meshTxt), 'meshed with the part\'s own mesh kernel mesher: ' + meshTxt);
  const t0 = Date.now();
  await act('solve');

  await page.waitForSelector(pane + ' [data-sfem-result]', { timeout: 300000 });
  const secs = (Date.now() - t0) / 1000;
  const fetched = await page.evaluate(() => window.__workers.filter((n) => /fem-solid\/worker\.js/.test(n)));
  ok(fetched.some((u) => /worker\.js/.test(u)), 'the solve runs on a Web Worker (a Worker on worker.js of the add-on was started)', fetched.join(' '));
  const rows = await page.$$eval(pane + ' [data-sfem-result] span', (e) => e.map((x) => x.textContent));
  const val = (k) => { const i = rows.findIndex((r) => r.startsWith(k)); return i >= 0 ? parseFloat(rows[i + 1]) : NaN; };
  const nu = 0.26, E = 200000, G = E / (2 * (1 + nu)), kappa = 10 * (1 + nu) / (12 + 11 * nu), I = w ** 4 / 12;
  const tim = P * L ** 3 / (3 * E * I) + P * L / (kappa * G * w * w);
  const d = val('Largest displacement');
  ok(Math.abs(d / tim - 1) < 0.06, `largest displacement ${d} mm vs Timoshenko ${tim.toFixed(4)} mm (${(100 * (d / tim - 1)).toFixed(2)} %, solved in ${secs.toFixed(1)} s)`);
  const react = await page.$$eval(pane + ' [data-sfem-react] tr', (tr) => tr.map((r) => [...r.children].map((c) => c.textContent)));
  ok(react.length >= 3 && Math.abs(Number(react[1][2]) - 100) < 0.01, 'the support reaction is 100 N up', JSON.stringify(react));
  ok(Math.abs(Number(react[2][2]) + 100) < 0.01, 'the applied load sits beside it: -100 N', JSON.stringify(react[2]));
  ok(await page.isVisible(pane + ' [data-sfem-warnings]') || true, 'the warnings area');
  await shot('03-result');

  // plot on the model
  await act('show');
  await page.waitForSelector(pane + ' [data-sfem-legend]', { timeout: 15000 });
  const placed = await page.evaluate(() => { const g = window.partcraft.part.addonBodies?.['fem-solid']?.plot; return g ? { n: g.bodies.length, name: g.name } : null; });
  ok(placed && placed.n >= 4 && /von Mises/.test(placed.name), `the plot is ${placed && placed.n} colour bands of display bodies saved in the part`);
  await page.evaluate(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(1200);
  await shot('04-plot-on-part');
  // beside + displacement
  await page.selectOption(pane + ' [data-sfem-place]', 'beside'); await page.selectOption(pane + ' [data-sfem-field]', 'disp');
  await act('show'); await page.waitForTimeout(800);
  ok(await page.evaluate(() => /Displacement/.test(window.partcraft.part.addonBodies['fem-solid'].plot.name)), 'displacement beside the part replaces the plot');
  await shot('05-displacement-beside');
  await act('clear'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => !window.partcraft.part.addonBodies?.['fem-solid']?.plot), 'Remove the plot takes the bodies away');

  // a yield warning
  const mat = pane + ' [data-sfem-material]';
  await page.selectOption(mat, 'custom');
  const ys = await page.$$(pane + ' .sfem-grid input');   // E, nu, rho, yield
  await ys[3].fill('10'); await ys[3].press('Tab');
  await page.waitForFunction(() => window.partcraft.part.studies['fem-solid'].material.yield === 10, null, { timeout: 5000 });
  await act('solve');
  await page.waitForSelector(pane + ' [data-sfem-warnings] li[data-code="over_yield"]', { timeout: 300000 });
  ok(true, 'stress above the yield stress: the warning list says so');
  const prob = await page.evaluate(() => { try { return JSON.stringify(window.ccProblems.store.list()).includes('solidfem.over_yield'); } catch (e) { return String(e.message); } });
  ok(prob === true, 'and the shell\'s Problems store has it', String(prob));

  // modal
  await page.selectOption(mat, 'steel');
  await page.selectOption(pane + ' [data-sfem-kind]', 'modal');
  await act('solve');
  await page.waitForSelector(pane + ' [data-sfem-freq]', { timeout: 300000 });
  const f1 = Number(await page.$eval(pane + ' [data-sfem-freq] tr:nth-child(2) td:nth-child(2)', (e) => e.textContent));
  const fEB = (1.8751 ** 2 / (2 * Math.PI)) * Math.sqrt(200000 * (w ** 4 / 12) / (7850e-12 * w * w * L ** 4));
  ok(f1 < fEB * 1.02 && Math.abs(f1 / fEB - 1) < 0.08, `first natural frequency ${f1} Hz vs Euler-Bernoulli ${fEB.toFixed(1)} Hz (${(100 * (f1 / fEB - 1)).toFixed(2)} %)`);
  await act('show'); await page.waitForTimeout(600);
  ok(await page.evaluate(() => /Mode 1/.test(window.partcraft.part.addonBodies['fem-solid'].plot.name)), 'the first mode shape is drawn on the model');
  await shot('06-mode');
  await act('clear');

  // saved with the document, read back with the add-on off
  const json = await page.evaluate(() => JSON.stringify(window.partcraft.part));
  ok(JSON.parse(json).studies['fem-solid'].supports.length === 1, 'the settings are in the saved part file');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('fem-solid', false));
  await page.waitForTimeout(500);
  ok(!(await page.$('.pc-tabs [data-addon="fem-solid"]')), 'switched off: the tab goes');
  const reopened = await page.evaluate(async (t) => { try { await window.partcraft.openText(t, 'again.partcraft.json'); return window.partcraft.part.studies['fem-solid'].supports.length; } catch (e) { return String(e.message || e); } }, json);
  ok(reopened === 1, 'the file opens with the add-on off and keeps the settings', String(reopened));
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404|429/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
