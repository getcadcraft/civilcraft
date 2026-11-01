#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-magnetics.mjs — the Magnetics add-on in /lab/partcraft (0.8 SG.7+; session addons-finish-magnetics). Run as root: a signed-in session is
 * minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the set-up of browser-cabinetcraft.mjs).
 *
 *   node tools/addons-test/browser-magnetics.mjs [--shots dir]     (shots default: tmp/shots/magnetics)
 *
 * Bundled and off; Settings › Add-ons switches it on; its tab; the C-core example solved in a compute worker (the page's own phys-worker.js),
 * checked against the magnetic circuit; shown on the part as real scene objects in ONE undo step; Undo/Redo; the holding magnet with its keeper
 * force; the downloads (VTK, summary CSV); switched off; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/magnetics'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
const workers = [];
page.on('worker', (w) => workers.push(w.url()));
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const shot = async (name, o = {}) => { await page.screenshot({ path: path.join(SHOTS, name + '.png'), ...o }); };
const pane = '[data-magnetics]';
const setf = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); };
const sceneBodies = () => page.evaluate(() => { const v = window.partcraft.view; const out = []; for (const [k, o] of v.overlays) if (k.startsWith('addon-bodies:')) { let tri = 0; o.traverse((c) => { if (c.isMesh) tri += c.geometry.getAttribute('position').count / 3; }); out.push({ key: k, bodies: o.userData.addonBodies, tri }); } return out; });
const ink = () => page.evaluate(() => { const c = document.querySelector('[data-gl]'); const g = document.createElement('canvas'); g.width = 200; g.height = 120; const x = g.getContext('2d'); x.drawImage(c, 0, 0, 200, 120); const d = x.getImageData(0, 0, 200, 120).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 50) n++; return n; });   // colored (not grey) pixels: the field map
try {
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:partcraft:magnetics:')) localStorage.removeItem(k); const k = 'cc-addons:partcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.magnetics; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/partcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons && !!window.partcraft, null, { timeout: 30000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'magnetics' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'magnetics'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Magnetics is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason }));
  ok(me && me.version === '0.8.0' && me.manifest.api === '1.1', 'version 0.8.0, add-on API 1.1');
  // Settings › Add-ons: the row and its switch, used for real
  await page.click('[data-settings-open]');
  if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const nav = page.locator('.shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
  if (await nav.count()) await nav.first().click();
  const rowSel = '[data-addons-set] li[data-addon="magnetics"]';
  await page.waitForSelector(rowSel, { state: 'visible', timeout: 10000 });
  ok(/Magnetics/.test(await page.textContent(rowSel)) && !(await page.isChecked('[data-addon-toggle="magnetics"]')), 'Settings › Add-ons lists Magnetics, switched off');
  await page.click('[data-addon-toggle="magnetics"]');
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'magnetics')?.state === 'active', null, { timeout: 15000 });
  ok(true, 'the switch turned it on (state active)');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());
  const tabBtn = await page.$('.pc-tabs [data-addon="magnetics"]');
  ok(!!tabBtn, 'a Magnetics tab is in the right panel strip');
  await tabBtn.click();
  await page.waitForSelector(pane, { timeout: 10000 });
  ok(await page.$$eval('[data-mg-row]', (n) => n.length) === 3 && await page.inputValue('[data-mg-template]') === 'ccore', 'the tab opens on the C-core example: iron core and two coil sides');

  // ---- the C-core: solve in the page's compute worker
  const w0 = workers.length;
  await page.click('[data-mg-solve]');
  await page.waitForSelector('[data-mg-check]', { timeout: 60000 });
  const chk = await page.evaluate(() => { const e = document.querySelector('[data-mg-check]'); return { diff: Number(e.getAttribute('data-mg-check')), ok: e.getAttribute('data-mg-check-ok'), text: e.textContent }; });
  ok(chk.ok === 'true' && Math.abs(chk.diff) < 5, 'solved: gap field against the magnetic circuit — ' + chk.text);
  ok(workers.length > w0 && workers.slice(w0).every((u) => u.startsWith('blob:')), 'it ran in a compute worker made from blob: modules (the page is cross-origin isolated): ' + workers.slice(w0).length);
  const bmax = Number(await page.getAttribute('[data-mg-bmax]', 'data-mg-bmax'));
  ok(bmax > 1 && bmax < 4, 'largest |B| ' + bmax + ' T (linear iron at the inner corners)');
  ok(await page.$('[data-mg-problem="sim.magnet.saturation"]') !== null, 'the saturation warning is shown in words');
  const txt = await page.textContent(pane);
  ok(!/\b(study\.mag|res\.|tpl\.|msg\.)[a-z_.]+/.test(txt), 'no language key shows as raw text in the panel');
  const plotInk = await page.evaluate(() => { const c = document.querySelector('[data-mg-plot]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) n++; return n / (c.width * c.height); });
  ok(plotInk > 0.5, 'the field picture is drawn (' + Math.round(plotInk * 100) + ' % of it painted)');
  await page.evaluate(() => { const h = document.querySelector('[data-hint]'); if (h) h.hidden = true; });   // the empty part's "Start a part" hint
  await page.locator('[data-mg-results]').scrollIntoViewIfNeeded();
  await shot('magnetics-01-results');

  // ---- show on the part
  const hist0 = await page.evaluate(() => window.partcraft.hist.undoStack.length);
  await page.click('[data-mg-place]');
  await page.waitForFunction(() => [...window.partcraft.view.overlays.keys()].some((k) => k === 'addon-bodies:magnetics:study'), null, { timeout: 15000 });
  const sb = await sceneBodies();
  ok(sb.length === 1 && sb[0].bodies >= 10 && sb[0].tri > 5000, 'the study is in the viewport as real scene objects: ' + JSON.stringify(sb));
  const st = await page.evaluate(() => ({ undo: window.partcraft.hist.undoStack.length, last: window.partcraft.hist.undoStack.at(-1).label, n: window.partcraft.part.addonBodies.magnetics.study.bodies.length }));
  ok(st.undo === hist0 + 1 && st.last === 'Magnetics: show the study', 'one undo step: "' + st.last + '" (' + st.n + ' bodies)');
  await page.evaluate(() => { window.partcraft.view.view('front'); const h = document.querySelector('[data-hint]'); if (h) h.hidden = true; });   // the empty part's "Start a part" hint would cover the shot
  await page.waitForTimeout(500);
  const inkN = await ink();
  ok(inkN > 1500, 'the viewport shows the colored field (' + inkN + ' colored pixels of 24 000)');
  await shot('magnetics-02-on-part');
  await page.evaluate(() => window.partcraft.undoRedo(true));
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 0, 'Undo takes the study off the viewport');
  await page.evaluate(() => window.partcraft.undoRedo(false));
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 1, 'Redo brings it back');

  // ---- downloads
  const dl = async (k) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(`[data-mg-export="${k}"]`)]); const f = path.join(SHOTS, d.suggestedFilename()); await d.saveAs(f); const s = fs.readFileSync(f, 'utf8'); fs.rmSync(f); return { name: d.suggestedFilename(), s }; };
  const v = await dl('vtk');
  ok(/\.vtk$/.test(v.name) && v.s.startsWith('# vtk DataFile Version 3.0') && /CELL_DATA \d+/.test(v.s), 'Field (VTK) downloads: ' + v.name + ', ' + Math.round(v.s.length / 1024) + ' KB');
  const c = await dl('summary');
  ok(/summary\.csv$/.test(c.name) && /quantity,value,unit/.test(c.s) && /hand formula hand\.ccore/.test(c.s), 'Summary (CSV) downloads with the hand comparison');

  // ---- the holding magnet: force on the keeper, arrows on the part
  await page.selectOption('[data-mg-template]', 'keeper');
  await page.selectOption('[data-mg-fine]', '0.5');
  await page.click('[data-mg-solve]');
  await page.waitForSelector('[data-mg-body="3"][data-mg-fy]', { timeout: 60000 });
  const fy = Number(await page.getAttribute('[data-mg-body="3"]', 'data-mg-fy'));
  ok(fy < 0, 'holding magnet: the keeper is pulled down onto the poles (Fy ' + fy + ' N at 20 mm depth)');
  ok(await page.$('[data-mg-problem="sim.magnet.force_thin"]') !== null, 'and the panel says a force through a thin gap is rough');
  await page.click('[data-mg-place]');
  await page.waitForTimeout(400);
  const kb = await page.evaluate(() => window.partcraft.part.addonBodies.magnetics.study.bodies.map((b) => b.name));
  ok(kb.some((n) => /^Force on body 3/.test(n)) && kb.some((n) => /Keeper/.test(n)), 'Show again: the keeper and its force arrow on the part');
  await page.evaluate(() => { window.partcraft.view.view('iso'); const h = document.querySelector('[data-hint]'); if (h) h.hidden = true; });
  await page.waitForTimeout(500);
  await shot('magnetics-03-keeper-on-part');
  await page.locator('[data-mg-results]').scrollIntoViewIfNeeded();
  await shot('magnetics-04-keeper-panel');

  // ---- off
  await page.click('[data-mg-clear]');
  await page.waitForTimeout(200);
  ok((await sceneBodies()).length === 0 && !(await page.evaluate(() => window.partcraft.part.addonBodies)), 'Take off the part: gone from the scene and the part');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('magnetics', false));
  await page.waitForTimeout(400);
  ok(!(await page.$('.pc-tabs [data-addon="magnetics"]')), 'switched off: the tab goes');
  const real = problems.filter((p) => !/favicon|ResizeObserver|net::ERR|404/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 3).join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('magnetics-error').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
