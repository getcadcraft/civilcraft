#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-hazard.mjs — Hazard playback (0.8 EG.47), session bim-sim_PART_2, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-people.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin. Fails on any console error. Opens the showcase house.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimhazard'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'm'); } catch (e) { /* none */ } });   // GH.3-A: results follow the display unit; these checks read metres
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  await page.click('[data-eg47-details] summary');
  await page.waitForSelector('[data-eg47-run]');

  console.log('== Flood (EG.47)');
  await page.fill('[data-eg47-field="peak"]', '3');
  await page.click('[data-eg47-run]');
  await page.waitForSelector('[data-eg47-sum]');
  const sum = await page.textContent('[data-eg47-sum]');
  ok(/rooms get wet/.test(sum) && /3 m above/.test(sum), 'a 3 m flood: ' + sum);
  ok(await page.$('[data-eg47-table] tbody tr') !== null, 'a table of the rooms that get wet');
  await page.evaluate(() => { const s = document.querySelector('[data-eg47-time]'); s.value = s.max; s.dispatchEvent(new Event('input', { bubbles: true })); });
  ok(/min · water 3/.test(await page.textContent('[data-eg47-clock]')), 'the clock at the end of the rise: ' + await page.textContent('[data-eg47-clock]'));
  const wet = await page.evaluate(() => { const c = document.querySelector('[data-eg47-plan]'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i + 2] > d[i] + 30) n++; return n; });
  ok(wet > 200, 'blue water on the plan at the peak (' + wet + ' pixels)');
  await page.fill('[data-eg47-field="tol"]', '0.1');
  await page.click('[data-eg47-run]');
  await page.waitForSelector('[data-eg47-problem="hazard.flood"]');
  ok(true, 'a room over the person\'s own 0.1 m limit is a warning');
  await shot(page, 'hazard-flood');

  console.log('== Climate scenario (EG.46: the person\'s own file)');
  const scen = path.join(REPO, 'tmp/eg46-scenario.csv');
  fs.mkdirSync(path.dirname(scen), { recursive: true });
  fs.writeFileSync(scen, '# a made-up table for the test\nyear,seaLevelRiseM,floodFactor\n2020,0,1\n2050,1,1\n');
  await page.setInputFiles('[data-eg46-file]', scen);
  await page.waitForSelector('[data-eg46-info]');
  ok(/In 2050: sea level up 1 m, floods ×1, so/.test(await page.textContent('[data-eg46-info]')) && /4 m above/.test(await page.textContent('[data-eg46-info]')), 'the scenario is read and applied: ' + await page.textContent('[data-eg46-info]'));
  await page.fill('[data-eg46-year]', '2100');
  await page.keyboard.press('Tab');
  ok(/outside the scenario/.test(await page.textContent('[data-eg47]')), 'a year past the table says the values are held, not extended');
  fs.writeFileSync(scen, 'nothing useful here');
  await page.setInputFiles('[data-eg46-file]', scen);
  await page.waitForSelector('[data-eg46-error]');
  ok(true, 'a bad file is refused with the reason');
  fs.rmSync(scen);
  await page.selectOption('[data-eg47-kind]', 'wind');
  await shot(page, 'hazard-climate');

  console.log('== Wind');
  await page.selectOption('[data-eg47-kind]', 'wind');
  await page.click('[data-eg47-run]');
  await page.waitForSelector('[data-eg47-sum]');
  ok(/Wind at the base: shear [\d.]+ kN/.test(await page.textContent('[data-eg47-sum]')), await page.textContent('[data-eg47-sum]'));
  await shot(page, 'hazard-wind');

  console.log('== Earthquake');
  await page.selectOption('[data-eg47-kind]', 'quake');
  await page.fill('[data-eg47-field="T1"]', '0.4');
  await page.fill('[data-eg47-field="drift"]', '0.0005');
  await page.click('[data-eg47-run]');
  await page.waitForSelector('[data-eg47-sum]');
  ok(/Base shear [\d.]+ kN/.test(await page.textContent('[data-eg47-sum]')), await page.textContent('[data-eg47-sum]'));
  ok(await page.$('[data-eg47-problem="hazard.drift"]') !== null, 'a storey over the person\'s own drift ratio is a warning');
  await page.click('[data-eg47-play]');
  await page.waitForTimeout(500);
  await page.click('[data-eg47-play]');
  await shot(page, 'hazard-quake');

  console.log('== the Analysis frame as the source of stiffness (EG.47 round 3)');
  await page.selectOption('[data-eg47-source]', 'frame');
  await page.click('[data-eg47-run]');
  await page.waitForTimeout(800);
  ok(/No frame to read/.test(await status()), 'a model with no frame says so: ' + await status());
  await page.selectOption('[data-eg47-source]', 'period');
  ok(await page.$('[data-eg47-field="T1"]') !== null, 'back to the typed period, its box is back');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-hazard: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
