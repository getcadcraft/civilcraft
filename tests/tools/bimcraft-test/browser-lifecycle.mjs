#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lifecycle.mjs — Life-cycle view (0.8 EG.45), session bim-sim_PART_2, in the lab: headless, real clicks.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimlife'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  await page.click('[data-eg45-details] summary');
  await page.waitForSelector('[data-eg45-table] tbody tr');
  const rows = await page.$$eval('[data-eg45-row]', (r) => r.map((x) => x.getAttribute('data-eg45-row')));
  ok(rows.length >= 4 && rows.includes('wall-paint'), rows.length + ' parts from the showcase house: ' + rows.join(', '));
  const sum0 = await page.textContent('[data-eg45-sum]');
  ok(/replacements over the period/.test(sum0), 'no costs typed: ' + sum0);
  ok(await page.$('[data-eg45-uncosted]') !== null, 'it says which parts have no cost');
  await page.fill('[data-eg45-life="wall-paint"]', '5');
  await page.keyboard.press('Tab');
  await page.waitForSelector('[data-eg45-row="wall-paint"]');
  const years = await page.textContent('[data-eg45-row="wall-paint"] td:last-child');
  ok(years.split(',').length === 9, 'paint every 5 years in a 50-year study: ' + years);
  for (const k of rows) { await page.fill('[data-eg45-cost="' + k + '"]', '10'); await page.keyboard.press('Tab'); await page.waitForTimeout(50); }
  const sum1 = await page.textContent('[data-eg45-sum]');
  ok(/Total [\d,]+, worth [\d,]+ today/.test(sum1), 'with costs: ' + sum1);
  const bars = await page.$$eval('[data-eg45-chart] rect', (r) => r.length);
  ok(bars >= 5, bars + ' bars in the chart');
  await page.fill('[data-eg45-field="disc"]', '3');
  await page.keyboard.press('Tab');
  await page.waitForSelector('[data-eg45-sum]');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-eg45-save]')]);
  const text = fs.readFileSync(await dl.path(), 'utf8');
  ok(dl.suggestedFilename() === 'life-cycle.csv' && /"component"/.test(text) && /Interior wall paint/.test(text), 'the schedule saved as ' + dl.suggestedFilename());
  await shot(page, 'lifecycle');

  console.log('== services and carbon (EG.45 round 3)');
  await page.check('[data-eg45-carbon-on]');
  await page.waitForSelector('[data-eg45-carbon-sum]');
  ok(/carbon/i.test(await page.textContent('[data-eg45-carbon-sum]')), 'the carbon line: ' + await page.textContent('[data-eg45-carbon-sum]'));
  ok(await page.$('[data-eg45-table] th:last-child') !== null && /Carbon/.test(await page.textContent('[data-eg45-table] thead')), 'a carbon column in the table');
  await page.uncheck('[data-eg45-carbon-on]');
  await page.waitForSelector('[data-eg45-sum]');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-lifecycle: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
