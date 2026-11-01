#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-energy-tab.mjs — the Energy and cost tab (energy_PART_2's four panes, mounted by bim-sim_PART_2), session bim-sim_PART_2, in the lab: headless, real clicks.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimenergy'], { encoding: 'utf8' }));
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
  await page.click('[data-rtab="energy"]');
  await page.waitForSelector('[data-energy-ep] *');
  await page.click('[data-rtab="energy"]');
  for (const k of ['ep', 'carbon', 'cost', 'pv']) {
    const n = await page.$$eval('[data-energy-' + k + '] *', (x) => x.length);
    if (k === 'ep') ok(n >= 1 && await page.locator('[data-ep-gate="addon"]').count() === 1, 'ep pane says the EnergyPlus add-on is the person\'s opt-in while it is off (' + n + ' elements; owner 2026-10-29)');
    else ok(n > 3, k + ' pane has content (' + n + ' elements)');
  }
  ok((await page.$$('[data-rpane="energy"]:not([hidden])')).length === 1, 'the tab shows its pane');
  const ids = await page.$$eval('[data-energy] [data-carbon-run], [data-energy] [data-pv-run], [data-energy] button', (b) => b.length);
  ok(ids >= 4, ids + ' buttons across the four panes');
  await shot(page, 'energy-tab');
  const hub = await page.evaluate(() => window.bimcraftEnergy && Object.keys(window.bimcraftEnergy).join());
  ok(hub === 'ep,carbon,cost,pv', 'all four mounted: ' + hub);
  // EG.30 (bim_PART_3): carbon and cost feed the shell's running totals
  const tot = await page.evaluate(() => { const T = window.ccTotals; if (!T) return null; const s = T.snapshot(); const m = (k) => (s.measures || s).find?.((x) => x.measure === k) || null; return { carbon: m('carbon'), cost: m('cost') }; });
  ok(tot && tot.carbon && tot.carbon.sources >= 1, 'the running totals know the carbon source', JSON.stringify(tot));
  ok(tot && tot.carbon && tot.carbon.value > 0 && /CO/.test(tot.carbon.text || ''), 'embodied carbon of the house is a number: ' + (tot?.carbon?.text || ''), JSON.stringify(tot?.carbon));
  ok(!tot?.cost || tot.cost.value === null, 'cost says nothing until there is a price table', JSON.stringify(tot?.cost));
  // Solar: an array is placed with no level picked (the pane takes the lowest level for the ground; it used to refuse "No level with that id.")
  await page.evaluate(() => window.bimcraftEnergy.pv.show('arrays'));
  const pv = page.locator('[data-energy-pv]');
  await page.locator('details:has([data-energy-pv]) > summary').click();
  ok(await pv.locator('[data-pv-field="level"], select').count() >= 1, 'the Arrays form has a level choice');
  if (await pv.locator('[data-pv-field="site.lat"]').count()) {   // the showcase house has no site location: type one, as a person would
    await pv.locator('[data-pv-field="site.lat"]').fill('39.74'); await pv.locator('[data-pv-field="site.lat"]').dispatchEvent('change');
    await pv.locator('[data-pv-field="site.lon"]').fill('-104.99'); await pv.locator('[data-pv-field="site.lon"]').dispatchEvent('change');
  }
  await pv.locator('[data-pv-place="ground"]').click();
  const placed = await page.waitForFunction(() => /kWp/.test(document.querySelector('[data-energy-pv]')?.innerText || ''), null, { timeout: 30000 }).then(() => true, () => false);
  const pvText = await pv.innerText();
  ok(placed && !/No level with that id/.test(pvText), 'Lay out a ground array places it in the model', pvText.slice(-500));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
await browser.close();
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-energy-tab: ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
