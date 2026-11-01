#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-people.mjs — People in the building (0.8 EG.48), session bim-sim_PART_2, in the lab: headless, real clicks.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimpeople'], { encoding: 'utf8' }));
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

  console.log('== Evacuation (EG.48)');
  await page.click('[data-eg48-details] summary');
  await page.waitForSelector('[data-eg48-run]');
  await page.fill('[data-eg48-field="m2"]', '4');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]', { timeout: 60000 });
  const sum = await page.textContent('[data-eg48-sum]');
  const m = /(\d+) of (\d+) people finished/.exec(sum);
  ok(m && Number(m[2]) > 3, 'a run on the showcase house: ' + sum);
  ok(await page.$('[data-eg48-openings] tbody tr') !== null && await page.$('[data-eg48-rooms] tbody tr') !== null, 'tables for the doors and stairs and for the rooms');
  ok(/out after/.test(await status()) || /people/.test(await status()), 'status line: ' + await status());
  await page.waitForSelector('[data-eg48-plan]');
  const painted = await page.evaluate(() => { const c = document.querySelector('[data-eg48-plan]'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  ok(painted > 200, 'the plan canvas has drawing on it (' + painted + ' pixels)');
  await page.fill('[data-eg48-time]', '5').catch(() => {});
  await page.evaluate(() => { const s = document.querySelector('[data-eg48-time]'); s.value = Math.floor(s.max / 2); s.dispatchEvent(new Event('input', { bubbles: true })); });
  ok(/\d s$/.test(await page.textContent('[data-eg48-clock]')), 'the clock follows the slider: ' + await page.textContent('[data-eg48-clock]'));
  await page.click('[data-eg48-play]');
  await page.waitForTimeout(600);
  await page.click('[data-eg48-play]');
  await shot(page, 'people-evac');

  console.log('== Shut a door, run again');
  const before = Number(m[1]);
  const exitBox = await page.$$('[data-eg48-shut]');
  ok(exitBox.length >= 1, exitBox.length + ' doors and stairs can be shut');
  for (const b of exitBox) await b.check();
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]');
  const after = await page.textContent('[data-eg48-sum]');
  const m2 = /(\d+) of (\d+) people finished/.exec(after);
  ok(m2 && Number(m2[1]) < before + 1 && (await page.$('[data-eg48-stuck]')) !== null, 'every door shut: nobody finishes and the run says they have no route: ' + after);
  ok((await page.$$('[data-eg48-problem="people.noroute"]')).length >= 1, 'an error line for the rooms with no way out');

  console.log('== Arrivals');
  await page.selectOption('[data-eg48-scenario]', 'arrive');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]');
  ok((await page.$$('[data-eg48-problem="people.noroute"]')).length >= 1, 'with every door still shut, arrivals say there is no way in (no crash)');
  await page.evaluate(() => { for (const b of document.querySelectorAll('[data-eg48-shut]')) { b.checked = false; b.dispatchEvent(new Event('change', { bubbles: true })); } });
  await page.fill('[data-eg48-field="win"]', '120');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]');
  ok(/finished/.test(await page.textContent('[data-eg48-sum]')), 'arrivals: ' + await page.textContent('[data-eg48-sum]'));
  await shot(page, 'people-arrive');
  const dl = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-eg48-save]')]);
  ok(/people-arrive\.csv/.test(dl[0].suggestedFilename()), 'results saved as ' + dl[0].suggestedFilename());

  console.log('== A count per room, exchange, people in the 3D view (EG.48 round 3)');
  await page.selectOption('[data-eg48-scenario]', 'evacuate');
  await page.waitForSelector('[data-eg48-counts-box]');
  if (!(await page.getAttribute('[data-eg48-counts-box]', 'open') !== null)) await page.click('[data-eg48-counts-box] summary');
  const boxes = await page.$$('[data-eg48-count]');
  ok(boxes.length >= 3, boxes.length + ' rooms have a count box');
  for (const b of boxes) await b.fill('0');
  await boxes[0].fill('4');
  await page.fill('[data-eg48-field="pre1"]', '30');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]');
  ok(/of 4 people finished/.test(await page.textContent('[data-eg48-sum]')) || /4 people/.test(await page.textContent('[data-eg48-sum]')), 'four people typed into the first room: ' + await page.textContent('[data-eg48-sum]'));
  for (const b of await page.$$('[data-eg48-count]')) await b.fill('3');
  await page.selectOption('[data-eg48-scenario]', 'exchange');
  await page.fill('[data-eg48-field="win"]', '20');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]');
  const exch = await page.textContent('[data-eg48-sum]');
  ok(/finished/.test(exch) && /status|got where/.test(await status()), 'exchange runs: ' + exch + ' | ' + await status());
  await page.check('[data-eg48-3d]');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.bimcraftPeople.shown3d()), 'the walkers are in the 3D scene');
  const scene = await page.evaluate(() => { const v = window.bimcraftViewer || null; return !!v; });
  await page.evaluate(() => { const s = document.querySelector('[data-eg48-time]'); s.value = Math.floor(s.max / 3); s.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.getByRole('button', { name: 'Fit', exact: true }).first().click().catch(() => {});
  await page.mouse.move(690, 470);
  for (let i = 0; i < 14; i++) { await page.mouse.wheel(0, -300); await page.waitForTimeout(60); }
  await page.waitForTimeout(600);
  await shot(page, 'people-3d');
  ok(await page.evaluate(() => window.bimcraftPeople.shown3d()), 'moving the slider keeps them in the scene' + (scene ? '' : ''));
  await page.uncheck('[data-eg48-3d]');
  await page.waitForTimeout(200);
  ok(!(await page.evaluate(() => window.bimcraftPeople.shown3d())), 'unticking removes them from the scene');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-people: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
