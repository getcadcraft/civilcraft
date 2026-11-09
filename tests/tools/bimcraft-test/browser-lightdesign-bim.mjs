#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lightdesign-bim.mjs — the Interior lighting design add-on in /lab/bimcraft (0.9 IL.7 + IL.9, session `adapters-09`), headless, on the showcase house.
 *   node tools/bimcraft-test/browser-lightdesign-bim.mjs [--shots dir]      (run as root; BimCraft's test admin, tools/frame/admin.php up|down)
 * Rooms and their windows come from the model; Calculate gives lux + daylight + emergency; Draw places IfcLightFixture in the room's level (one undo step) and writes the lux
 * numbers into that level's plan view; Draw again replaces them; Erase removes them; Undo takes the placement back. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(REPO, 'tmp/shots/lightdesign');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ld = (k) => `[data-ld="${k}"]`;
/** The light fixtures this add-on placed, read from the open model (fresh each call). */
const fixtures = () => page.evaluate(async () => {
  const E = await import(performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\/res-elec\.js/.test(n)));
  return window.ccLightDesign.api.model.read((w) => E.readDevices(w).filter((d) => w.readPset(d.id, 'CadCraft_LightDesign')).map((d) => ({ kind: d.kind, tag: d.tag, load: d.load, at: d.at, height: d.height, lux: w.readPset(d.id, 'CadCraft_LightDesign').RoomMeanLux })));
});
const planNumbers = () => page.evaluate(() => window.ccLightDesign.api.model.read((w) => {
  let n = 0; try { const ids = w.api.GetLineIDsWithType(w.mid, w.api.GetTypeCodeFromName('IFCANNOTATION')); for (let i = 0; i < ids.size(); i++) { const p = w.readPset(ids.get(i), 'CadCraft_DraftTag'); if (p && p.Tag === 'lightdesign') n++; } } catch { n = -1; } return n; }));
try {
  const ck = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: ck[0], value: ck.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-addons:bimcraft'); Object.keys(localStorage).filter((k) => k.startsWith('cc-addon:bimcraft:lightdesign')).forEach((k) => localStorage.removeItem(k)); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await page.waitForFunction(() => /^Opened bimcraft-house/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));
  await page.waitForFunction(() => window.ccAddons.list().find((x) => x.id === 'lightdesign')?.state === 'active', null, { timeout: 20000 });
  ok(true, 'the Interior lighting design add-on is switched on in /lab/bimcraft');
  await page.click('[data-rtab="addon-lightdesign-lightdesign"]');
  await page.waitForSelector('[data-ld-root]', { state: 'attached', timeout: 20000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-ld="roompick"] option').length > 2, null, { timeout: 20000 });
  const opts = await page.$$eval('[data-ld="roompick"] option', (o) => o.map((x) => x.textContent));
  ok(opts.length >= 6, 'the panel lists the model\'s rooms: ' + opts.slice(1, 4).join(' | '), opts);

  // a room with three windows (Level 1: 3)
  const idx = await page.$$eval('[data-ld="roompick"] option', (o) => o.findIndex((x) => /: 3/.test(x.textContent)));
  await page.selectOption('[data-ld="roompick"]', { index: idx });
  await page.waitForTimeout(400);
  const outline = await page.inputValue(ld('outline')), wins = await page.inputValue(ld('windows')), height = await page.inputValue(ld('height'));
  ok(outline.split('\n').length >= 3, 'picking a room fills the outline (' + outline.split('\n').length + ' corners)');
  ok(wins.split('\n').filter(Boolean).length === 3 && wins.split('\n').every((l) => l.split(',').length === 6), 'and the three windows of that room, from the model', wins);
  ok(Number(height) === 2800, 'and the ceiling height from the walls (' + height + ' mm)');
  await page.selectOption('[data-ld="targetLux"]', { index: 0 }).catch(() => {});
  await page.check(ld('emOn'));
  await page.fill(ld('emRoute'), outline.split('\n').slice(0, 2).map((l) => l.split(',').map((v, i) => Number(v) + (i ? 600 : 600)).join(', ')).join('\n'));
  await page.dispatchEvent(ld('emRoute'), 'change');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 20000 });
  const em = await page.textContent('[data-ld-result]');
  ok(/lx/.test(em), 'Calculate: the lux table is there', em.slice(0, 120));
  ok(await page.isVisible('[data-ld-day]'), 'Calculate: the daylight table is there: ' + (await page.textContent('[data-ld-day]')).slice(0, 90));
  const df = await page.evaluate(() => window.ccLightDesign.result.result.daylight.dfAvg);
  ok(df > 0.3 && df < 30, 'the mean daylight factor is a sensible figure: ' + df.toFixed(2) + ' %', df);
  ok(await page.isVisible('[data-ld-emres]') && (await page.$$('[data-ld-emcheck]')).length >= 2, 'Calculate: emergency lighting result and its checks are there');
  ok(/EN 1838/.test(await page.textContent('[data-ld-em-note]')) && /engineer/.test(await page.textContent('[data-ld-em-note]')), 'the emergency limits are marked as waiting for a lighting engineer');
  await page.screenshot({ path: path.join(SHOTS, 'bim-result.png') });

  const before = await page.$$eval('[data-change-list] li', (n) => n.length);
  ok((await fixtures()).length === 0, 'no fixtures of ours in the model yet');
  await page.click(ld('draw'));
  await page.waitForFunction(() => /light fixtures/.test(document.querySelector('[data-ld-message]')?.textContent || '') || document.querySelector('[data-ld-error]'), null, { timeout: 60000 });
  ok(!(await page.$('[data-ld-error]')), 'Draw raised no error', await page.$('[data-ld-error]').then((e) => e && e.textContent()));
  const msg = await page.textContent('[data-ld-message]');
  const fx = await fixtures();
  const lums = await page.evaluate(() => window.ccLightDesign.result.result.luminaires.map((l) => [Math.round(l.p[0]), Math.round(l.p[1]), l.p[2]]));
  ok(fx.length === lums.length && fx.length > 0, 'Draw: ' + fx.length + ' IfcLightFixture placed (' + msg + ')', { fx: fx.length, lums: lums.length });
  ok(fx.every((f) => /^luminaire|^downlight/.test(f.kind) && f.load > 0 && f.lux > 0), 'each is a BimCraft luminaire with its watts as Load and the room\'s mean lux in CadCraft_LightDesign', fx[0]);
  const near = (a, b) => Math.abs(a - b) < 1;
  ok(lums.every((l) => fx.some((f) => near(f.at[0], l[0]) && near(f.at[1], l[1]) && near(f.height, l[2]))), 'at the positions and height the calculation used (plan mm)', { lum: lums[0], fx: fx[0] });
  const nn = await planNumbers();
  ok(nn > 10, 'the lux numbers are drafting strokes in the level\'s plan view (' + nn + ' annotations tagged lightdesign)', nn);
  const after = await page.$$eval('[data-change-list] li', (n) => n.map((x) => x.textContent.trim().slice(0, 80)));
  ok(after.length >= 2 && after.some((x) => /Place lighting design luminaires/.test(x)) && after.some((x) => /lux on the plan/.test(x)), 'two undo steps in the change list (fixtures, plan numbers): ' + after.slice(-2).join(' | '), { before, after: after.length });
  await page.screenshot({ path: path.join(SHOTS, 'bim-drawn.png') });

  await page.click(ld('draw'));
  await page.waitForTimeout(2500);
  const fx2 = await fixtures();
  ok(fx2.length === fx.length, 'Draw again replaces them, never doubles (' + fx2.length + ')');
  ok(Math.abs((await planNumbers()) - nn) <= 0, 'and the numbers in the plan (' + (await planNumbers()) + ')');

  await page.click(ld('erase'));
  await page.waitForFunction(() => /Erased/.test(document.querySelector('[data-ld-message]')?.textContent || ''), null, { timeout: 30000 });
  ok((await fixtures()).length === 0 && (await planNumbers()) === 0, 'Erase removes the fixtures and the numbers');
  let back = 0;
  for (let i = 0; i < 4 && !back; i++) { await page.evaluate(() => document.querySelector('[data-undo]').click()); await page.waitForTimeout(1200); back = (await fixtures()).length; }
  ok(back === fx.length, 'Undo brings the placed fixtures back (' + back + ' after undoing the erase)');
  await page.screenshot({ path: path.join(SHOTS, 'bim-erased.png') });
} catch (e) {
  fail++; console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
