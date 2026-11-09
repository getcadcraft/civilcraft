#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fem-solid-super.mjs — the Solid FEM add-on in SuperCad Studio's real lab page, through the mounted PartCraft (0.9 SU.908c). Run as root, one browser at a time:
 *   nice timeout 800 node tools/addons-test/browser-fem-solid-super.mjs [--shots dir]
 * Super has no add-on host of its own: the mounted PartCraft starts its own loader and its panel tab (.pc-tabs) is PartCraft's own. The add-on is switched on in the app's own
 * memory before the page opens; the Model workspace's Part panel lists the Solid FEM tab; a bar is opened, the settings are written as the panel writes them (face picking by click is
 * tested in /lab/partcraft by browser-fem-solid.mjs: same code), Mesh and Solve are pressed in the panel, the tip deflection is read against Timoshenko and the plot is drawn in the view.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart } from '../partcraft-test/browser-simulation.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/fem-solid-super'));
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
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const unscroll = () => page.evaluate(() => { for (let e = document.querySelector('[data-sfem]'); e; e = e.parentElement) if (e.scrollLeft) e.scrollLeft = 0; });
const shot = async (name) => { await unscroll().catch(() => {}); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const pane = '[data-sfem]';
const act = async (a) => { const sel = pane + ' [data-sfem-act="' + a + '"]'; await page.$eval(sel, (e) => e.scrollIntoView({ block: 'center' })); await page.click(sel); };
try {
  await page.goto(BASE + '/lab/supercadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); s.on = s.on || {}; s.on['fem-solid'] = true; if (s.off) delete s.off['fem-solid']; localStorage.setItem(k, JSON.stringify(s)); localStorage.removeItem('partcraft.exactKernel'); });
  await page.goto(BASE + '/lab/supercadcraft', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-sc-ready]', { timeout: 60000 });
  await page.evaluate(() => document.querySelectorAll('dialog.shell-fit[open]').forEach((d) => d.close()));   // the first-visit screen-fit question
  await page.click('.sc-wstab[data-ws="model"]'); await page.waitForTimeout(2000);
  await page.click('[data-panel-tab="part"]').catch(() => {});
  const tab = await page.waitForFunction(() => !!document.querySelector('.pc-tabs [data-addon="fem-solid"]'), null, { timeout: 120000 }).then(() => true).catch(() => false);
  ok(tab, 'the mounted PartCraft panel in Super lists the Solid FEM tab (the add-on was switched on in the app\'s own memory)');
  const st = await page.evaluate(() => window.ccAddons?.list().find((a) => a.id === 'fem-solid')?.state);
  ok(st === 'active' || st === 'ready', 'the mounted PartCraft started its own loader and Solid FEM is on', String(st));
  await page.evaluate(() => document.querySelector('.pc-tabs [data-addon="fem-solid"]').click());
  await page.waitForSelector(pane, { timeout: 15000 });
  ok(/Not a code check; your engineer reviews the results/.test(await page.textContent(pane + ' [data-sfem-note]')), 'the panel is in Super with the liability line');
  const hasApp = await page.evaluate(() => !!(window.partcraft && window.partcraft.openText));
  ok(hasApp, 'the mounted PartCraft is reachable (window.partcraft)');
  if (hasApp) {
    const L = 100, w = 10, P = 100;
    await page.evaluate(async ([t, n]) => { await window.partcraft.openText(t, n); await window.partcraft.built(); }, [JSON.stringify(await cantileverPart(L, w, w)), 'Bar.partcraft.json']);
    // the settings, written as the panel would write them (picking faces by click is tested in /lab/partcraft: same code), then mesh and solve through the panel's buttons
    await page.evaluate(() => {
      const rg = window.partcraft.regen, ref = (n) => { const i = rg.faces.findIndex((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999); return { name: rg.faces[i].name, at: rg.faces[i].at.map((v) => +v.toFixed(6)) }; };
      const s = { v: 1, h: null, material: { id: 'steel', E: 200000, nu: 0.26, rho: 7850, yield: 250 }, kind: 'static', modes: 4, supports: [{ id: 's1', faces: [ref([-1, 0, 0])] }], loads: [{ id: 'l1', type: 'force', faces: [ref([1, 0, 0])], F: [0, -100, 0] }], plot: { field: 'vm', mode: 1, scale: null, beside: true } };
      window.partcraft.host.setStudy('fem-solid', s, 'test');
    });
    await page.evaluate(() => { document.querySelector('.pc-tabs button:not([data-addon])').click(); });   // another tab and back: the panel draws what the part holds
    await page.waitForTimeout(300);
    await page.evaluate(() => document.querySelector('.pc-tabs [data-addon="fem-solid"]').click());
    await page.waitForSelector(pane + ' [data-sfem-item="l1"]', { timeout: 10000 });
    ok(true, 'the panel reads the settings from the part (one support, one load)');
    await act('mesh');
    await page.waitForSelector(pane + ' [data-sfem-mesh]', { timeout: 150000 });
    await act('solve');
    await page.waitForSelector(pane + ' [data-sfem-result]', { timeout: 400000 });
    const rows = await page.$$eval(pane + ' [data-sfem-result] span', (e) => e.map((x) => x.textContent));
    const d = parseFloat(rows[rows.findIndex((r) => r.startsWith('Largest displacement')) + 1]);
    const nu = 0.26, E = 200000, G = E / (2 * (1 + nu)), kappa = 10 * (1 + nu) / (12 + 11 * nu), I = w ** 4 / 12, tim = P * L ** 3 / (3 * E * I) + P * L / (kappa * G * w * w);
    ok(Math.abs(d / tim - 1) < 0.06, `solved in Super: largest displacement ${d} mm vs Timoshenko ${tim.toFixed(4)} mm`);
    await act('show');
    await page.waitForSelector(pane + ' [data-sfem-legend]', { timeout: 20000 });
    ok(await page.evaluate(() => (window.partcraft.part.addonBodies?.['fem-solid']?.plot?.bodies.length || 0) >= 4), 'the colour plot is drawn in the mounted PartCraft\'s view');
    await page.screenshot({ path: path.join(SHOTS, 'super-plot.png') });
  }
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404|429/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e.message));
  await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
