#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-toolbar.mjs — CadCraft's toolbar rows and Ctrl+F1 (0.7 CP.1, GJoe2 getcadcraft/cadcraft#2), in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-toolbar.mjs [--shots <dir>]
 *
 * Run as root (test admin cctest+cadcraft@projectz.xyz via admin.php up|down). For each menu style (CadCraft, Drafting
 * classic, Ribbon) at 1366 × 768 and 1920 × 1080: Settings › Toolbar rows Wrap / 2 rows / 1 row give the lines they
 * promise (2 rows = at most two lines, scrolling sideways when they do not fit; 1 row = one line), the page never scrolls
 * sideways, the drawing keeps height; Ctrl+F1 steps the shell's icons / labels setting, Shift+Ctrl+F1 the rows; the
 * TOOLBAR / TOOLBARROWS commands; the start hint closes with its button and keeps its text with JS off nowhere else.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { showSetting } from '../shell-test/show-setting.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

/** Lines a bar uses: distinct tops of its visible children. */
const lines = (sel) => page.evaluate((s) => {
  const bar = [...document.querySelectorAll(s)].find((b) => b.getClientRects().length);
  if (!bar) return null;
  const tops = new Set([...bar.children].filter((k) => k.getClientRects().length).map((k) => Math.round(k.getBoundingClientRect().top / 4)));
  return { n: tops.size, scrolls: bar.scrollWidth > bar.clientWidth + 1, h: Math.round(bar.getBoundingClientRect().height) };
}, sel);
const stageH = () => page.evaluate(() => Math.round(document.querySelector('[data-over]').getBoundingClientRect().height));
const noSideways = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
const settle = () => page.waitForTimeout(350);
async function openStyle(style) {
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate((s) => { localStorage.setItem('cadcraft.input', JSON.stringify({ style: s })); localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cc-app-settings:cadcraft'); }, style);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft, null, { timeout: 15000 }).catch(async (e) => { console.log('  page says: ' + (await page.title()) + ' ' + page.url()); throw e; });
  await settle();
}
const BAR = { cadcraft: '.cc-tools', drafting: '.cc-in-rbody', ribbon: '.cc-in-rbody' };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  for (const size of [[1366, 768], [1920, 1080]]) {
    await page.setViewportSize({ width: size[0], height: size[1] });
    for (const style of ['cadcraft', 'drafting', 'ribbon']) {
      console.log(`\n== ${style} at ${size[0]} x ${size[1]}`);
      await openStyle(style);
      const bar = BAR[style];
      const res = {};
      for (const mode of ['auto', '2', '1']) {
        await page.evaluate((m) => window.cadcraft.host.setToolbarRows(m), mode);
        await settle();
        res[mode] = { ...(await lines(bar)), stage: await stageH() };
        if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${style}-${size[0]}-rows-${mode}.png`) });
      }
      console.log('  ', JSON.stringify(res));
      ok(res['1'] && res['1'].n === 1, '1 row: one line', JSON.stringify(res['1']));
      ok(res['2'] && res['2'].n <= 2, '2 rows: at most two lines', JSON.stringify(res['2']));
      ok(res['auto'] && res['auto'].n >= res['2'].n, 'wrap: no fewer lines than 2 rows');
      ok(res['1'].stage >= res['auto'].stage, 'the drawing keeps at least as much height with 1 row as with wrap', `${res['1'].stage} vs ${res['auto'].stage}`);
      ok(await noSideways(), 'the page does not scroll sideways');
    }
  }

  console.log('\n== keys and commands');
  await page.setViewportSize({ width: 1366, height: 768 });
  await openStyle('cadcraft');
  const tb = () => page.evaluate(() => document.body.getAttribute('data-shell-tb'));
  const rows = () => page.evaluate(() => window.cadcraft.host.getToolbarRows());
  ok((await tb()) === 'both', 'starts with icons + text', await tb());
  await page.keyboard.press('Control+F1'); ok((await tb()) === 'icons', 'Ctrl+F1 → just icons', await tb());
  await page.keyboard.press('Control+F1'); ok((await tb()) === 'labels', 'Ctrl+F1 → just text', await tb());
  await page.keyboard.press('Control+F1'); ok((await tb()) === 'both', 'Ctrl+F1 → icons + text again', await tb());
  ok(await page.evaluate(() => !document.querySelector('[data-help-panel]')?.classList.contains('is-open') && !document.querySelector('[data-help-panel]:not([hidden])')), 'Ctrl+F1 does not open Help');
  await page.keyboard.press('Control+Shift+F1'); ok((await rows()) === '2', 'Shift+Ctrl+F1 → 2 rows', await rows());
  await page.keyboard.press('Control+Shift+F1'); ok((await rows()) === '1', 'Shift+Ctrl+F1 → 1 row', await rows());
  await page.keyboard.press('Control+Shift+F1'); ok((await rows()) === 'auto', 'Shift+Ctrl+F1 → wrap', await rows());
  const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
  await typeCmd('TOOLBARROWS'); await typeCmd('1'); ok((await rows()) === '1', 'TOOLBARROWS 1', await rows());
  await typeCmd('TOOLBARROWS'); await typeCmd('A'); ok((await rows()) === 'auto', 'TOOLBARROWS A', await rows());
  await typeCmd('TOOLBAR'); await typeCmd('I'); ok((await tb()) === 'icons', 'TOOLBAR I', await tb());
  await typeCmd('TOOLBAR'); await typeCmd('B'); ok((await tb()) === 'both', 'TOOLBAR B', await tb());

  console.log('\n== settings and persistence');
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open] input[name="ccToolbarRows"]', { state: 'attached' });
  // Since 0.7 (data-shell-07) the dialog shows one section at a time: pick the one with Toolbar rows, as a person would.
  await showSetting(page, 'input[name="ccToolbarRows"]');
  await page.waitForSelector('dialog[open] input[name="ccToolbarRows"]');
  await page.evaluate(() => document.querySelector('input[name="ccToolbarRows"][value="2"]').click());
  ok((await rows()) === '2', 'Settings › Toolbar rows → 2 rows');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  ok((await rows()) === '2', 'kept after reload', await rows());

  console.log('\n== start hint');
  ok(await page.isVisible('[data-hint]'), 'the hint shows on an empty drawing');
  await page.click('[data-hint-close]');
  ok(!(await page.isVisible('[data-hint]')), 'the close button hides it');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
