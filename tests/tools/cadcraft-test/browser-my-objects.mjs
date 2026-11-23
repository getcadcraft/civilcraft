#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-my-objects.mjs — PO.3: "My objects" in CadCraft's Library panel, in the lab, headless, against the live API.
 *   node tools/cadcraft-test/browser-my-objects.mjs [--shots <dir>]
 * Run as root. Signs in with the MarkupCraft test admin, hands the panel a one-hour Library token, reads tools/library/seed.csv under
 * Files…, keeps one item in My objects, finds it there, PLACES it in the drawing (a LIB_ block carrying its uuid), removes it.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const php = (...a) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', ...a], { encoding: 'utf8' }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const helper = path.join(REPO, 'tools/bimcraft-test/my-objects-helper.php');
const admin = php(adminPhp, 'up');
const tok = php(helper, 'token');
let keptName = '';

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript((t) => { try { if (location.pathname.startsWith('/lab/')) sessionStorage.setItem('cadcraft.library.token', t); } catch { /* another origin */ } }, tok.token);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => d.accept());
const cc = (fn, arg) => page.evaluate(fn, arg);
const stageClick = async (fx, fy) => { const b = await page.locator('[data-over]').boundingBox(); await page.mouse.click(b.x + b.width * fx, b.y + b.height * fy); await page.waitForTimeout(150); };
const said = () => page.textContent('dialog[data-lib]');

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('== Keep an item read from a file');
  await page.click('[data-library]');
  await page.waitForSelector('dialog[data-lib][open]');
  ok(await page.locator('dialog[data-lib] [data-src="mine"]').count() === 1, 'the Library panel has a My objects tab');
  await page.click('dialog[data-lib] [data-src="files"]');
  await page.setInputFiles('dialog[data-lib] input[type="file"]', path.join(REPO, 'tools/library/seed.csv'));
  await page.waitForSelector('.cc-lib-card [data-lib-keep]');
  const nCards = await page.locator('.cc-lib-card').count(), nKeep = await page.locator('.cc-lib-card [data-lib-keep]').count();
  ok(nCards > 0 && nKeep === nCards, 'Files…: ' + nCards + ' items from seed.csv, each with "Keep in my objects"', nCards + ' cards, ' + nKeep + ' buttons');
  keptName = (await page.locator('.cc-lib-card .cc-lib-name').first().textContent()).trim();
  await page.locator('.cc-lib-card [data-lib-keep]').first().click();
  await page.waitForFunction(() => /kept in My objects/.test(document.querySelector('dialog[data-lib]').textContent), null, { timeout: 30000 });
  ok(await page.locator('.cc-lib-card [data-lib-keep]').first().isDisabled(), '"' + keptName + '" kept: the button reads "Kept in my objects"');

  console.log('== My objects');
  await page.click('dialog[data-lib] [data-src="mine"]');
  await page.waitForSelector('.cc-lib-card [data-lib-unkeep]', { timeout: 15000 });
  const names = await page.$$eval('.cc-lib-card .cc-lib-name', (n) => n.map((x) => x.textContent.trim()));
  ok(names.includes(keptName), 'My objects lists it');
  const card = page.locator('.cc-lib-card', { hasText: keptName }).first();
  ok((await card.locator('.cc-lib-badge').textContent()) === 'Private (only you)', 'its badge reads "Private (only you)"');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cad-01-my-objects.png') });

  console.log('== Place it');
  await card.locator('button:has-text("Place")').click();
  await page.waitForFunction(() => /insertion point/.test(document.querySelector('[data-prompt]').textContent), null, { timeout: 30000 });
  await stageClick(0.4, 0.45);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const lp = await cc(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'insert'); return e && { block: e.block, uuid: e.attrs['CC-ITEM-UUID'], ver: e.attrs['CC-ITEM-VER'] }; });
  const mine = await cc(async (t) => (await (await fetch('/api/v1/library/my-items?per=100', { headers: { Authorization: 'Bearer ' + t } })).json()).data.items, tok.token);
  const row = mine.find((i) => i.name === keptName);
  ok(lp && row && lp.uuid === row.uuid && /^LIB_.+_v1$/.test(lp.block), 'the private object places as a LIB_ block carrying its uuid and version', JSON.stringify(lp));
  if (SHOTS) { await cc(() => window.cadcraft.view.fit()); await page.waitForTimeout(200); await page.screenshot({ path: path.join(SHOTS, 'cad-02-placed.png') }); }
  await page.click('[data-library]');
  await page.click('dialog[data-lib] button:has-text("Check for updates")');
  await page.waitForTimeout(1200);
  ok(!/could not|error|404/i.test((await said()).replace(keptName, '')) , 'Check for updates answers for a private object (no error)');

  console.log('== Remove');
  await page.click('dialog[data-lib] [data-src="mine"]');
  await page.waitForSelector('.cc-lib-card [data-lib-unkeep]', { timeout: 15000 });
  await page.locator('.cc-lib-card', { hasText: keptName }).first().locator('[data-lib-unkeep]').click();
  await page.waitForFunction(() => /removed from My objects/.test(document.querySelector('dialog[data-lib]').textContent), null, { timeout: 15000 });
  ok(!(await page.$$eval('.cc-lib-card .cc-lib-name', (n) => n.map((x) => x.textContent.trim()))).includes(keptName), 'removed: My objects no longer lists it');
  ok(await cc(() => window.cadcraft.doc.all().some((x) => x.type === 'insert')), 'the copy placed in the drawing stays');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
  try { console.log('  panel: ' + (await said()).slice(-300)); if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cad-zz-failure.png') }); } catch (x) { /* ignore */ }
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { console.log('  cleanup: ' + JSON.stringify(php(helper, 'clean', String(tok.id), keptName || 'zz-none'))); } catch (e) { console.log('  cleanup failed: ' + e.message.split('\n')[0]); }
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
