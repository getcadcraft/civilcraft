#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-design.mjs — Furnish a room (0.8 EG.60) and Room program to massing (0.8 EG.58), session bim_PART_2, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-design.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session sxtags), so the shared admin-login
 * throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase/bimcraft-house.ifc).
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimdesign'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);

  console.log('== Furnish a room (EG.60)');
  await page.click('[data-eg60-details] summary');
  await page.waitForSelector('[data-eg60-room], [data-eg60-none]');
  const rooms = await page.$$eval('[data-eg60-room] option', (o) => o.length);
  ok(rooms >= 1, rooms + ' rooms listed for the first level');
  await page.selectOption('[data-eg60-kind]', 'living');
  await page.click('[data-eg60-preview]');
  const plan = await page.textContent('[data-eg60-plan]');
  ok(/pieces fit as a Living room/.test(plan), 'what fits: ' + plan);
  await page.click('[data-eg60-go]');
  await waitStatus(/pieces placed/);
  ok(/pieces placed/.test(await status()), 'furnished: ' + await status());
  await shot(page, 'design-furnished');

  console.log('== Room program to massing (EG.58)');
  await page.click('[data-eg58-details] summary');
  await page.click('[data-eg58-find]');
  await page.waitForSelector('[data-eg58-options] li');
  const opts = await page.$$eval('[data-eg58-option]', (o) => o.map((x) => x.value));
  ok(opts.length >= 4 && /gross/.test(await page.textContent('[data-eg58-sum]')), opts.length + ' options: ' + opts.join(', '));
  await page.check('[data-eg58-option="block2"]');
  const save = await download(() => page.click('[data-eg58-save]'));
  const body = JSON.parse(save.bytes.toString());
  ok(body.format === 'cadcraft-massing-options' && body.masses.length === opts.length && body.masses[0].pts.length === 4, 'the options file for CivilCraft: ' + save.name);
  await page.fill('[data-eg58-field="cap"]', '3');
  await page.click('[data-eg58-find]');
  const capped = await page.$$eval('[data-eg58-option]', (o) => o.map((x) => x.value));
  ok(capped.every((k) => /1$/.test(k)) && capped.length >= 2, 'a 3 m cap leaves only single-storey options: ' + capped.join(', '));
  await shot(page, 'design-program');
  await page.fill('[data-eg58-field="cap"]', '');
  await page.click('[data-eg58-find]');
  await page.check('[data-eg58-option="block2"]');
  await page.click('[data-eg58-build]');
  await waitStatus(/built as levels, walls and slabs/);
  ok(/Block, 2 floors built/.test(await status()), 'built: ' + await status());

  console.log("== mep_PART_2's Calculations tab, mounted here");
  await page.click('[data-rtab="calc"]');
  await page.waitForSelector('[data-mepcalc] button');
  const tabs = await page.$$eval('[data-mepcalc] button', (b) => b.map((x) => x.textContent.trim()).filter(Boolean));
  ok(tabs.length >= 4 && /Pipes/.test(tabs.join()) && /Ducts/.test(tabs.join()), 'the Calculations tab shows its buttons: ' + tabs.slice(0, 6).join(', '));
  await page.evaluate(() => window.bimcraftControl.configure({ enabled: true, groups: ['read'] }));
  const names = await page.evaluate(async () => (await window.bimcraftControl.handle({ jsonrpc: '2.0', id: 1, method: 'tools.list', params: {} }, 's', { name: 't', version: '1' })).result.tools.map((x) => x.name));
  ok(names.length >= 10 && names.includes('walls_find'), 'the assistant tool list: ' + names.length + ' tools');
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);
