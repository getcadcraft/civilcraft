#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-levels09.mjs — BimCraft FX.55 (0.9): the LEVEL / LEVELS typed command, a Levels button in the ribbon layouts, and the left
 * panel's accordion with a lock beside each caret. Run as root (Playwright, the bimres test admin), against /lab.
 *   node tools/bimcraft-test/browser-levels09.mjs [--shots dir] [--probe]
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const si = process.argv.indexOf('--shots'), SH = si > 0 ? process.argv[si + 1] : null;
if (SH) fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = '/root/.cache/ms-playwright';
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', '/var/www/CADCRAFT/getcadcraft.com/tools/cadcraft-test/admin.php', 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage(); const problems = [];
page.on('pageerror', (e) => problems.push('pageerror ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') problems.push('console ' + m.text()); });
const shot = async (n) => { if (SH) await page.screenshot({ path: path.join(SH, n + '.png') }); };
const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });
const openNew = async () => {
  await page.click('[data-empty] [data-new]').catch(() => page.click('[data-new]')); await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Levels check'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '2700 mm');
  await page.click('[data-new-ok]'); await waitStatus(/^New building Levels check/); await page.waitForSelector('[data-plan-wrap]:not([hidden])');
};
const A = 'https://getcadcraft.com/lab/bimcraft';
await page.goto(A, { waitUntil: 'networkidle' });
for (const style of ['drafting', 'ribbon']) {
  console.log('== style ' + style);
  await page.evaluate((st) => localStorage.setItem('bimcraft.input', JSON.stringify({ style: st, custom: [], tab: 0 })), style);
  await page.reload({ waitUntil: 'networkidle' }); await openNew();
  const tab = style === 'drafting' ? 'home' : 'architecture';
  await page.evaluate((tb) => document.querySelector('[role="tab"][data-tab="' + tb + '"], .cc-in-tab')?.click(), tab).catch(() => {});
  const btn = await page.$('[data-cmd="model.levels"]');
  ok(!!btn, style + ': a Levels button in the ribbon');
  await shot('1-' + style);
  if (style === 'drafting') {
    await page.fill('[data-input-cmdline]', 'LEVEL'); await page.keyboard.press('Enter');
    await page.waitForSelector('dialog[data-lv-dialog][open]', { timeout: 5000 }).then(() => ok(true, 'drafting: LEVEL opens Add levels…'), () => ok(false, 'drafting: LEVEL opens Add levels…', await0()));
    await shot('2-level-dialog'); await page.keyboard.press('Escape');
  } else if (btn) {
    await page.click('[data-cmd="model.levels"]');
    await page.waitForSelector('dialog[data-lv-dialog][open]', { timeout: 5000 }).then(() => ok(true, 'ribbon: the Levels button opens Add levels…'), () => ok(false, 'ribbon: the Levels button opens Add levels…'));
    await page.keyboard.press('Escape');
  }
}
async function await0() { return await page.evaluate(() => document.querySelector('.cc-in-cmdmsg, [data-input-cmdmsg]')?.textContent || ''); }
console.log('== panel accordion');
await page.evaluate(() => localStorage.removeItem('bimcraft.panel-locks'));
await page.reload({ waitUntil: 'networkidle' }); await openNew();
const vis = await page.$$eval('.bc-sec:not([hidden]) > details.bc-find-details', (d) => d.map((x) => Object.keys(x.dataset).find((k) => /Details$/.test(k))));
console.log('  visible sections: ' + vis.join(' '));
const open = (k) => page.evaluate((k) => { const d = document.querySelector('[data-' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ']'); d.open = true; }, k);
const isOpen = (k) => page.evaluate((k) => document.querySelector('[data-' + k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()) + ']').open, k);
if (vis.length >= 3) {
  const [a, b, c] = vis;
  ok(await page.evaluate(() => window.bimcraftSettings.panelFocus === false && !document.querySelector('[data-bimcraft]').hasAttribute('data-panel-focus')), 'the setting is off by default');
  ok(await page.$eval('[data-panel-lock]', (l) => getComputedStyle(l).display === 'none'), 'off: the locks are hidden');
  await open(a); await page.waitForTimeout(100); await open(b); await page.waitForTimeout(100);
  ok((await isOpen(a)) && (await isOpen(b)), 'off: opening a section leaves the others open');
  await page.evaluate(() => { document.querySelectorAll('.bc-sec > details.bc-find-details[open]').forEach((d) => { d.open = false; }); });
  await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]').catch(() => {});
  await page.evaluate(() => { const i = document.querySelector('input[name="bcPanelFocus"]'); document.querySelector('[data-app-settings]').ccShowSetting?.(i); }); await page.waitForTimeout(300); await page.check('input[name="bcPanelFocus"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.bimcraftSettings.panelFocus === true && document.querySelector('[data-bimcraft]').hasAttribute('data-panel-focus')), 'Settings › BimCraft › Side panels turns it on');
  ok(await page.$eval('[data-panel-lock]', (l) => getComputedStyle(l).display !== 'none'), 'on: the locks show');
  ok(await page.$$eval('[data-panel-lock]', (l) => l.length) >= 3, 'a lock beside the caret on every section');
  await open(a); await page.waitForTimeout(100); await open(b); await page.waitForTimeout(100);
  ok((await isOpen(b)) && !(await isOpen(a)), 'opening ' + b + ' closes ' + a);
  await page.click('[data-panel-lock="' + b + '"]');
  ok((await page.getAttribute('[data-panel-lock="' + b + '"]', 'aria-pressed')) === 'true' && (await isOpen(b)), 'the lock click locks and does not toggle the section');
  await open(c); await page.waitForTimeout(100);
  ok((await isOpen(b)) && (await isOpen(c)), 'a locked section stays open when another opens');
  await open(a); await page.waitForTimeout(100);
  ok((await isOpen(b)) && (await isOpen(a)) && !(await isOpen(c)), 'the unlocked one closes, the locked one stays');
  await shot('3-panel');
  await page.reload({ waitUntil: 'networkidle' });
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.panel-locks') || '[]'))).includes(b), 'the lock is remembered');
} else ok(false, 'at least three collapsible sections visible', vis.join(' '));
console.log('problems: ' + (problems.join(' | ') || 'none'));
console.log(pass + ' passed, ' + fail + ' failed');
await browser.close();
process.exit(fail ? 1 : 0);
