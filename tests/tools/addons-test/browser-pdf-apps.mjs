#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pdf-apps.mjs — MarkupCraft's and TakeoffCraft's add-on APIs 1.0 in the real lab pages (0.5 AO.6; session addons).
 * Run as root (it mints the test admin's session with sudo -u www-data; the admin-login throttle is never touched).
 *
 *   node tools/addons-test/browser-pdf-apps.mjs [--shots <dir>]
 *
 * Each app: its own loader starts (manifest "addons": "own"; window.ccAddons has `types`), nothing installed = nothing shown;
 * the fixture add-on (tools/addons-test/<app>/…) installed in developer mode → active after a reload; MarkupCraft: its tab in
 * the right panel (shown, then hidden by a built-in tab), tools.start picks the cloud tool; TakeoffCraft: its section, its
 * item type in the new-item form → an item with the type's height and assembly; switched off → gone; removed; no console
 * errors. Shots in tmp/shots/addons-pdf-apps.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/addons-pdf-apps');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const pkgOf = (dir) => {
  const files = {};
  const walk = (d) => { for (const n of fs.readdirSync(path.join(dir, d))) { const p = d ? d + '/' + n : n; if (fs.statSync(path.join(dir, p)).isDirectory()) walk(p); else files[p] = fs.readFileSync(path.join(dir, p), 'utf8'); } };
  walk('');
  return { manifest: JSON.parse(files['addon.json']), files };
};

const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const ready = () => page.waitForFunction(() => window.ccAddons && window.ccAddons.types instanceof Map && window.ccAddons.loader.started, null, { timeout: 30000 });
  const install = async (pkg) => {
    await page.evaluate(async (p) => { localStorage.setItem('cc-addons-dev', '1'); localStorage.setItem('markupcraft.author', 'Add-on tester'); const r = await window.ccAddons.installPackage(p); if (!r.ok) throw new Error(r.reason); }, pkg);
    await page.reload({ waitUntil: 'load' });
    await ready();
    await page.waitForFunction((id) => ['active', 'failed', 'refused', 'off'].includes(window.ccAddons.list().find((a) => a.id === id)?.state), pkg.manifest.id, { timeout: 20000 });
  };
  const cleanup = async (id) => page.evaluate(async (x) => { await window.ccAddons.uninstall(x); localStorage.removeItem('cc-addons-dev'); localStorage.removeItem('markupcraft.author'); localStorage.removeItem('cc-addons:' + window.ccAddons.loader.app); }, id);

  // ---------------------------------------------------------------- MarkupCraft
  console.log('\nMarkupCraft');
  await page.goto('https://getcadcraft.com/lab/markupcraft?space=paper', { waitUntil: 'load' });
  await ready();
  ok(await page.evaluate(() => window.ccAddons.list().length === 0 && !document.querySelector('[data-tab][data-addon]')), 'its own loader starts; nothing installed, nothing shown');
  await install(pkgOf(path.join(ROOT, 'tools/addons-test/markupcraft/rfi')));
  ok(await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'zz-test.rfi')?.state === 'active'), 'the fixture add-on installed in developer mode is active after a reload');
  const tab = page.locator('.mc-right [role="tab"][data-addon="zz-test.rfi"]');
  ok(await tab.count() === 1 && (await tab.textContent()) === 'RFIs', 'its tab is in the right panel');
  await tab.click();
  ok(await page.evaluate(() => { const p = document.querySelector('[data-pane][data-addon="zz-test.rfi"]'); return p && !p.hidden && p.textContent === 'No RFIs yet.' && document.querySelector('[data-pane="props"]').hidden; }), 'clicking it shows its pane (rendered) and hides Properties');
  await page.screenshot({ path: path.join(SHOTS, '01-markupcraft-tab.png') });
  await page.click('.mc-right [data-tab="list"]');
  ok(await page.evaluate(() => document.querySelector('[data-pane][data-addon="zz-test.rfi"]').hidden && !document.querySelector('[data-pane="list"]').hidden && document.querySelector('[data-tab][data-addon]').getAttribute('aria-selected') === 'false'), 'a built-in tab hides it again');
  await page.evaluate(() => { window.__testRfi.tools.start('rfi', { no: 1 }); });
  await page.waitForFunction(() => window.markupcraft.tool === 'cloudrect', null, { timeout: 5000 }).catch(() => {});
  ok(await page.evaluate(() => window.markupcraft.tool === 'cloudrect'), 'tools.start picks MarkupCraft\'s own cloud tool');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.ccAddons.loader.setEnabled('zz-test.rfi', false));
  ok(await page.evaluate(() => !document.querySelector('[data-tab][data-addon="zz-test.rfi"], [data-pane][data-addon="zz-test.rfi"]') && !window.ccAddons.types.size), 'switched off: its tab and type are gone');
  await cleanup('zz-test.rfi');

  // ---------------------------------------------------------------- TakeoffCraft
  console.log('\nTakeoffCraft');
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper', { waitUntil: 'load' });
  await ready();
  ok(await page.evaluate(() => window.ccAddons.list().length === 0 && ![...document.querySelectorAll('[data-item-form] select[name="type"] option')].some((o) => o.value.startsWith('addon:'))), 'its own loader starts; nothing installed, nothing shown');
  await install(pkgOf(path.join(ROOT, 'tools/addons-test/takeoffcraft/partition')));
  ok(await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'zz-test.partition')?.state === 'active'), 'the fixture add-on is active after a reload');
  ok(await page.evaluate(() => { const s = document.querySelector('.tc-right section[data-addon="zz-test.partition"]'); return s && /Partitions/.test(s.textContent) && /0 partition types/.test(s.textContent); }), 'its section is in the right panel');
  await page.click('[data-item-new]');
  await page.fill('#tc-new-name', 'Wall A');
  await page.selectOption('#tc-new-type', 'addon:zz-test.partition:partition');
  await page.click('[data-item-form] button[type="submit"]');
  const item = await page.evaluate(() => window.takeoffcraft.model.state.items.find((i) => i.name === 'Wall A'));
  ok(item && item.type === 'linear' && item.heightFt === 9 && item.components.length === 2 && item.xd?.['zz-test.partition']?.kind === 'partition', 'the new-item form makes a partition: height, assembly and its data', JSON.stringify(item));
  ok(await page.evaluate(() => /1 partition types/.test(document.querySelector('.tc-right section[data-addon]').textContent)), 'its section follows the change');
  await page.screenshot({ path: path.join(SHOTS, '02-takeoffcraft-item.png') });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('zz-test.partition', false));
  ok(await page.evaluate(() => !document.querySelector('.tc-right section[data-addon="zz-test.partition"], option[data-addon="zz-test.partition"]') && !!window.takeoffcraft.model.state.items.find((i) => i.name === 'Wall A').xd?.['zz-test.partition']), 'switched off: its section and form choice are gone; the item keeps its data');
  await cleanup('zz-test.partition');

  const unexpected = problems.filter((p) => !/404|Failed to load resource|unsigned/.test(p));
  ok(!unexpected.length, 'no console errors', unexpected.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
