#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-autoroute.mjs — "Route ducts automatically" (0.10 MEP.1, suggestion #1556) in the real /lab/bimcraft page (the dev build).
 * Opens fixtures/mep-route/autoroute-ahu-3-terminals-unrouted.ifc (made by `node bin/test-bimcraft.mjs --autoroute --write`),
 * opens the Clash check, picks the air handler's supply, ticks the three diffusers at 150 L/s, the main 250 mm high, and
 * presses Route ducts: the panel says what it drew, the model has the duct runs and their fittings, one Undo takes them back.
 * No console errors. Shots in tmp/shots/mep-route.
 *   node tools/bimcraft-test/browser-autoroute.mjs        (run as root; uses tools/addons-test/admin.php for the test admin)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(ROOT, 'tmp/shots/mep-route');
const FILE = path.join(ROOT, 'fixtures/mep-route/autoroute-ahu-3-terminals-unrouted.ifc');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + String(extra).slice(0, 300) : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
if (!fs.existsSync(FILE)) { console.log('  FAIL ' + path.relative(ROOT, FILE) + ' is missing: run node bin/test-bimcraft.mjs --autoroute --write'); process.exit(1); }
const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 90000 });
  await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'load' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'load' });
  await page.setInputFiles('[data-file]', FILE);
  await waitStatus(/^Opened /);
  await page.evaluate(() => { const d = document.querySelector('[data-clash-details]'); d.open = true; d.dispatchEvent(new Event('toggle')); });
  await page.waitForSelector('[data-mep-route]', { timeout: 15000 }).catch(() => {});
  ok(await page.locator('[data-mep-route]').count() === 1, 'the Clash check has the Route ducts automatically section');
  const srcOpts = await page.$$eval('[data-ar-source] option', (o) => o.map((x) => x.textContent));
  ok(srcOpts.length >= 1 && srcOpts.some((s) => /AHU-1.*supply/.test(s)), 'Start from lists the air handler\'s supply: ' + srcOpts.join(' | '));
  const terms = await page.$$eval('[data-ar-term]', (b) => b.map((x) => x.getAttribute('data-ar-term')));
  const labels = await page.$$eval('[data-ar-term]', (b) => b.map((x) => x.parentElement.textContent));
  const difs = terms.filter((k, i) => /D-\d/.test(labels[i]));
  ok(difs.length === 3, 'the three diffusers are offered as terminals', labels.join(' | '));
  for (const k of difs) { await page.check(`[data-ar-term="${k}"]`); await page.fill(`[data-ar-flow="${k}"]`, '150'); }
  await page.fill('[data-ar-h]', '250');
  const before = await page.evaluate(() => window.bimcraftLive.editor.changes.length);
  await page.click('[data-ar-route]');
  await page.waitForFunction(() => /^Drew |^No network/.test(document.querySelector('[data-ar-msg]')?.textContent || ''), null, { timeout: 120000 });
  const msg = await page.textContent('[data-ar-msg]');
  ok(/^Drew 5 duct runs reaching 3 of 3 terminals/.test(msg), 'the panel: ' + msg);
  const count = () => page.evaluate(() => { const ed = window.bimcraftLive.editor, n = (c) => ed.api.GetLineIDsWithType(ed.mid, c).size(); const W = ed.W; return { seg: n(W.IFCDUCTSEGMENT), fit: n(W.IFCDUCTFITTING), changes: ed.changes.length }; });
  const c1 = await count();
  ok(c1.seg >= 5 && c1.fit >= 10 && c1.changes === before + 1, 'the model has the runs: ' + c1.seg + ' duct segments, ' + c1.fit + ' fittings, one undo step', JSON.stringify(c1));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, 'route-ducts.png') });
  const undo = page.locator('[data-undo]:visible');
  if (await undo.count()) await undo.first().click(); else { await page.locator('body').click({ position: { x: 5, y: 5 } }); await page.keyboard.press('Control+z'); }
  await page.waitForTimeout(3000);
  const c2 = await count();
  ok(c2.seg === 0 && c2.fit === 0, 'one Undo takes the whole network back', JSON.stringify(c2));
  ok(!problems.length, 'no console errors', problems.join(' | '));
} finally { await browser.close(); }
console.log((fail ? 'FAILED ' : 'passed ') + pass + ' / ' + (pass + fail));
process.exit(fail ? 1 : 0);
