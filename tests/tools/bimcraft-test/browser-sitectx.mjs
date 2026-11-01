#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sitectx.mjs — CivilCraft's site file as suggestions in BimCraft (0.8 EG.63, civil_PART_4), in the lab with real clicks.
 *   node tools/bimcraft-test/browser-sitectx.mjs
 * Run as root (a session minted for its own test admin). A new building; a made-up .ccsite.json is handed to the app the way the handoff does; the dialog lists
 * the buildings and parcel with checkboxes; nothing changes until "Add the ticked ones"; the walls appear (one undo step), the parcel becomes the site outline.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimsitectx'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.length);
const sq = (lon, lat, d = 0.0002) => [[lon, lat], [lon + d, lat], [lon + d, lat + d], [lon, lat + d], [lon, lat]];
try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Site ctx'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm'); await page.click('[data-new-ok]');
  await waitStatus(/^New building Site ctx/); await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  const before = await walls();
  // a made-up site file, built by the shared writer inside the page
  const file = await page.evaluate(async (rings) => {
    const base = [...document.scripts].map((s) => s.src).find((u) => /bimcraft\.js/.test(u)); const C = await import(new URL('site-context.js', base).href);
    const o = { lat: 48, lon: 9 }; return JSON.stringify(C.buildContext({ origin: o, radius: 150, attribution: ['made up for the test'], items: [{ kind: 'building', rings: [rings.a], height: 12, name: 'A' }, { kind: 'building', rings: [rings.b] }, { kind: 'parcel', rings: [rings.p], name: 'APN 1' }, { kind: 'flood', rings: [rings.p], label: 'AE' }] }));
  }, { a: sq(9.0003, 48.0003), b: sq(9.0007, 48.0003), p: sq(9.0001, 48.0001, 0.001) });
  const handled = await page.evaluate(async (text) => window.bimcraftSiteContext.receive(new File([text], 'x.ccsite.json')), file);
  ok(handled === true, 'the app takes a .ccsite.json as a site file (not opened as a model)');
  await page.waitForSelector('[data-sitectx-dialog][open]');
  ok((await page.$$('[data-sitectx-item]')).length === 3, 'the dialog lists two buildings and the parcel with a checkbox each');
  ok(/information only/.test(await page.textContent('[data-sitectx-dialog]')) && /AE/.test(await page.textContent('[data-sitectx-dialog]')), 'the flood zone is listed as information only');
  ok(/12|12 000|39/.test(await page.textContent('[data-sitectx-dialog]')) && /not given/.test(await page.textContent('[data-sitectx-dialog]')), 'a building without a height says the typed one is used');
  ok(await walls() === before, 'nothing has been added yet');
  await page.uncheck('[data-sitectx-item="b2"]');
  await page.click('[data-sitectx-add]');
  await page.waitForFunction((n) => window.bimcraftPlan.state.data.walls.length > n, before, { timeout: 30000 }); await settled();
  ok(await walls() === before + 4, 'the ticked building became four walls (' + (await walls() - before) + ')');
  ok((await page.$('[data-sitectx-dialog]')) === null, 'the dialog closes');
  await page.keyboard.press('Control+z'); await settled(); await page.keyboard.press('Control+z'); await settled();
  ok(await walls() === before, 'two undo steps (outline, then walls) take it back');
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) { fail++; console.log('  FAIL ' + e.stack); } finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'down', 'bimsitectx'], { encoding: 'utf8' }); } catch (e) { /* ok */ }
}
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
