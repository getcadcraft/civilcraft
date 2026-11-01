#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sprinkler.mjs — the Fire sprinklers add-on takes its room from the model (0.8 round 3, oltl-eg-a_PART_3; EG.3), in the lab, headless.
 *   node tools/bimcraft-test/browser-sprinkler.mjs        (run as root; BimCraft's test admin, tools/bimcraft-test/admin.php up|down)
 * The showcase house opened; the add-on switched on; its panel lists the model's rooms; picking one fills the outline and the level; Lay out puts heads in it;
 * Calculate gives a result; the layout goes to the shell's Problems. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 240) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));   // a signed-in lab session, minted in-process (no login throttle)
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
try {
  const ck = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: ck[0], value: ck.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-addons:bimcraft'); Object.keys(localStorage).filter((k) => k.startsWith('cc-addon:bimcraft:sprinkler')).forEach((k) => localStorage.removeItem(k)); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await page.waitForFunction(() => /^Opened bimcraft-house/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  void (0); console.log('  addons: ' + JSON.stringify(await page.evaluate(() => window.ccAddons.list().map((a) => a.id + ':' + a.state + (a.reason ? '(' + a.reason + ')' : '')))));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('sprinkler', true));
  await page.waitForTimeout(3000);
  console.log('  mid: ' + JSON.stringify(await page.evaluate(() => window.ccAddons.list().find((x) => x.id === 'sprinkler'))));
  await page.waitForFunction(() => window.ccAddons.list().find((x) => x.id === 'sprinkler')?.state === 'active', null, { timeout: 20000 });
  console.log('  after: ' + JSON.stringify(await page.evaluate(() => window.ccAddons.list().map((a) => a.id + ':' + a.state + (a.reason ? '(' + a.reason + ')' : '')))));
  ok(true, 'the Fire sprinklers add-on is switched on');
  await page.waitForTimeout(1500);
  console.log('  tabs: ' + JSON.stringify(await page.$$eval('[data-rtab], [data-addon-tab], .bc-rtab, [role=tab]', (n) => n.map((x) => (x.dataset.rtab || x.textContent || '').trim().slice(0, 30)))));
  await page.click('[data-rtab="addon-sprinkler-sprinkler"]');
  await page.waitForSelector('[data-spk-rooms]', { state: 'attached', timeout: 20000 });
  const opts = await page.$$eval('[data-spk-rooms] option', (o) => o.map((x) => x.textContent));
  ok(opts.length >= 2 && /m²/.test(opts[1]), 'the panel lists the model\'s rooms with their areas: ' + opts.slice(0, 3).join(' | '), opts);
  const before = await page.inputValue('[data-spk-rooms] >> xpath=ancestor::div[1]//textarea');
  await page.selectOption('[data-spk-rooms]', { index: 1 });
  await page.waitForTimeout(500);
  const after = await page.inputValue('[data-spk-rooms] >> xpath=ancestor::div[1]//textarea');
  ok(after !== before && after.split('\n').length >= 3 && /^-?\d+, -?\d+/.test(after), 'picking a room fills the outline (' + after.split('\n').length + ' corners)', after.slice(0, 80));
  await page.click('.sprk-say >> xpath=preceding::button[3]');   // Lay out, Calculate, Place: the three buttons above the result
  await page.waitForTimeout(500);
  const say = await page.textContent('.sprk-say');
  ok(/head/i.test(say), 'Lay out puts heads in that room: ' + say.split('\n')[0], say);
  await page.click('.sprk-say >> xpath=preceding::button[2]');
  await page.waitForFunction(() => /bar/i.test(document.querySelector('.sprk-say')?.textContent || ''), null, { timeout: 15000 }).catch(() => {});
  const calc = await page.textContent('.sprk-say');
  ok(/bar/i.test(calc) && /head/i.test(calc), 'Calculate: the hydraulic result is in the panel: ' + calc.split('\n').pop(), calc);
  await page.click('.sprk-say >> xpath=preceding::button[1]');
  await page.waitForFunction(() => /placed|Placed/.test(document.querySelector('.sprk-say')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  const placed = await page.textContent('.sprk-say');
  ok(/placed/i.test(placed), 'Place in the model: heads and pipe are written into the IFC (one undo step): ' + placed.split('\n')[0], placed);
  const inModel = await page.evaluate(() => { const c = document.querySelector('[data-change-list]')?.textContent || ''; return c.slice(0, 200); });
  ok(/Sprinkler|sprinkler/.test(inModel), 'it shows in the change list', inModel);
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).map((p) => (p.source && p.source.name) + '|' + p.code + '|' + p.severity) : null));
  ok(Array.isArray(probs) && probs.some((x) => /\|spk\.defaults\|note$/.test(x)), 'the calculation posts its labelled-defaults note to the shell\'s Problems', probs);
} catch (e) {
  fail++; console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware/.test(p));   // the hardware report is throttled to 30 an hour per network: every test run on this machine counts
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
