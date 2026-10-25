#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-directory.mjs — the add-on directory in a browser, end to end (0.4 part 2, A.7 / A.8 / A.12; session addons).
 *
 *   node tools/addons-test/browser-directory.mjs [--shots dir]      (run as root: Playwright + sudo -u www-data php)
 *
 * tools/addons-test/directory-fixture.php publishes zz-test.pipes signed with a THROWAWAY key. Then:
 *   1. /addons and /addons/zz-test.pipes (both themes, phone width): listed, permissions in words, the install panel.
 *   2. With the apps' real key list, Install refuses it: "not signed by CadCraft (key)" — nothing is stored.
 *   3. With the test key injected into addons-trust.js (request interception, this browser only): Install → the dialog lists
 *      the permissions → Cancel stores nothing → Install → stored in IndexedDB "cadcraft-addons".
 *   4. /lab/cadcraft with the test key injected into its trust.js: the installed add-on is active (source installed), PIPE runs.
 *   5. /lab/cadcraft with the real key list: the same package is refused ("unsigned") and PIPE is unknown — the apps check
 *      again; a package changed in IndexedDB is refused even with the test key.
 *   6. Remove from this browser on /addons/{id}.
 * No console errors besides the expected refusals.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/addons-directory');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());

const fixture = php('tools/addons-test/directory-fixture.php', 'up');
const { cookie } = php('tools/addons-test/admin.php', 'session');
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const TRUST = fs.readFileSync(path.join(ROOT, 'public_html/assets/js/addons-trust.js'), 'utf8');
const withTestKey = TRUST.replace("export const TRUSTED_KEYS = {", "export const TRUSTED_KEYS = {\n  '" + fixture.key + "': '" + fixture.public + "',");
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  let inject = false;
  await ctx.route(/\/(assets\/js\/addons-trust\.js|assets\/apps\/cadcraft\/dev\/addons\/trust\.js)(\?.*)?$/, (route) => (inject ? route.fulfill({ status: 200, contentType: 'text/javascript', body: withTestKey }) : route.continue()));
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));

  // 1. pages
  await page.goto('https://getcadcraft.com/addons?space=paper', { waitUntil: 'load' });
  ok(await page.locator('.addon-card', { hasText: 'Test pipes' }).count() === 1, '/addons lists the fixture');
  await page.screenshot({ path: path.join(SHOTS, '01-list-paper.png'), fullPage: true });
  await page.goto('https://getcadcraft.com/addons/zz-test.pipes?space=paper', { waitUntil: 'load' });
  await page.waitForFunction(() => window.ccAddonInstall && !document.querySelector('[data-install-actions]').hidden);
  const facts = await page.evaluate(() => ({ perms: [...document.querySelectorAll('.addon-main > .addon-perms li')].map((l) => l.textContent.trim()), status: document.querySelector('[data-install-status]').textContent }));
  ok(facts.perms.join('|') === 'Adds commands|Adds toolbar buttons and menu items|Adds its own objects and data to drawings|Opens or saves its own file types' && /Not installed/.test(facts.status), 'the add-on page: permissions in words, "Not installed"', JSON.stringify(facts));
  await page.screenshot({ path: path.join(SHOTS, '02-page-paper.png'), fullPage: true });

  // 2. real keys: refused
  await page.click('[data-install]');
  await page.waitForFunction(() => /not signed by CadCraft|could not|not installed/i.test(document.querySelector('[data-install-status]').textContent) && !document.querySelector('[data-install]').disabled);
  const st2 = await page.evaluate(async () => ({ text: document.querySelector('[data-install-status]').textContent, stored: await new Promise((r) => { const q = indexedDB.open('cadcraft-addons', 1); q.onupgradeneeded = () => q.result.createObjectStore('packages', { keyPath: 'id' }); q.onsuccess = () => { const t = q.result.transaction('packages').objectStore('packages').get('zz-test.pipes'); t.onsuccess = () => { r(!!t.result); q.result.close(); }; }; }) }));
  ok(/not signed by CadCraft \(key\)/.test(st2.text) && !st2.stored, 'with the apps\' real keys the page refuses it, nothing stored', JSON.stringify(st2));

  // 3. test key: dialog, cancel, install
  inject = true;
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.ccAddonInstall && !document.querySelector('[data-install-actions]').hidden);
  await page.click('[data-install]');
  await page.waitForSelector('dialog[data-install-dialog][open]');
  const dlg = await page.evaluate(() => [...document.querySelectorAll('dialog[data-install-dialog] li')].map((l) => l.textContent.trim()));
  ok(dlg.length === 4 && dlg[2] === 'Adds its own objects and data to drawings', 'Install asks first, listing what it may do', JSON.stringify(dlg));
  await page.screenshot({ path: path.join(SHOTS, '03-confirm.png') });
  await page.click('dialog[data-install-dialog] button[value="cancel"]');
  await page.waitForFunction(() => /Not installed/.test(document.querySelector('[data-install-status]').textContent));
  ok(true, 'Cancel installs nothing');
  await page.click('[data-install]');
  await page.waitForSelector('dialog[data-install-dialog][open]');
  await page.click('dialog[data-install-dialog] button[value="install"]');
  await page.waitForFunction(() => /^Installed/.test(document.querySelector('[data-install-status]').textContent), null, { timeout: 15000 });
  ok(await page.evaluate(() => !document.querySelector('[data-uninstall]').hidden), 'installed: "Remove from this browser" appears');
  await page.screenshot({ path: path.join(SHOTS, '04-installed.png') });

  // 4. CadCraft with the test key: active
  const lab = await ctx.newPage();
  lab.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  lab.on('pageerror', (e) => problems.push(e.message));
  await lab.goto('https://getcadcraft.com/lab/cadcraft', { waitUntil: 'load' });
  await lab.evaluate(() => localStorage.removeItem('cc-addons:cadcraft'));
  await lab.reload({ waitUntil: 'load' });
  await lab.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'zz-test.pipes') && window.ccAddons.list().every((a) => a.state !== 'ready'), null, { timeout: 15000 });
  const inst = await lab.evaluate(() => window.ccAddons.list().find((a) => a.id === 'zz-test.pipes'));
  ok(inst.state === 'active' && inst.source === 'installed' && inst.reason === '', 'CadCraft loads the installed, signed add-on', JSON.stringify(inst));
  await lab.evaluate(() => { window.cadcraft.engine.run('PIPE'); });
  await lab.waitForFunction(() => window.cadcraft.engine.running === 'PIPE');
  ok(true, 'its PIPE command runs');
  await lab.keyboard.press('Escape');

  // 5. CadCraft with the real keys: refused; a changed package refused even with the test key
  inject = false;
  await lab.reload({ waitUntil: 'load' });
  await lab.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'zz-test.pipes'), null, { timeout: 15000 });
  const ref = await lab.evaluate(() => ({ a: window.ccAddons.list().find((x) => x.id === 'zz-test.pipes'), pipe: !!document.querySelector('[data-addon-group]') }));
  await lab.evaluate(() => { window.cadcraft.engine.run('PIPE'); });
  const said = await lab.evaluate(() => [...document.querySelectorAll('[data-history] li')].slice(-1)[0]?.textContent || '');
  ok(ref.a.state === 'refused' && ref.a.reason === 'unsigned' && /Unknown command "PIPE"/.test(said), 'with the real key list CadCraft refuses it too ("unsigned"), PIPE unknown', JSON.stringify(ref.a) + ' ' + said);
  await lab.keyboard.press('Control+Comma');
  await lab.waitForSelector('dialog[open]');
  if (await lab.$('[data-settings-tab="general"]')) await lab.click('[data-settings-tab="general"]');
  const row = await lab.evaluate(() => document.querySelector('[data-addon="zz-test.pipes"]')?.textContent.replace(/\s+/g, ' ').trim() || '');
  ok(/Test pipes/.test(row) && row.length > 0, 'Settings › Add-ons lists it as refused', row);
  await lab.screenshot({ path: path.join(SHOTS, '05-refused-in-cadcraft.png') });
  await lab.keyboard.press('Escape');
  inject = true;
  await lab.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('cadcraft-addons', 1); q.onsuccess = () => r(q.result); });
    const pkg = await new Promise((r) => { const t = db.transaction('packages').objectStore('packages').get('zz-test.pipes'); t.onsuccess = () => r(t.result); });
    pkg.files['main.js'] = new Blob([(await pkg.files['main.js'].text()) + '\n// changed\n']);
    await new Promise((r) => { const t = db.transaction('packages', 'readwrite'); t.objectStore('packages').put(pkg); t.oncomplete = r; });
    db.close();
  });
  await lab.reload({ waitUntil: 'load' });
  await lab.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'zz-test.pipes'), null, { timeout: 15000 });
  const tam = await lab.evaluate(() => window.ccAddons.list().find((x) => x.id === 'zz-test.pipes'));
  ok(tam.state === 'refused' && tam.reason === 'unsigned', 'a package changed after it was installed is refused, even with the test key', JSON.stringify(tam));
  await lab.close();

  // 6. remove
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => window.ccAddonInstall && !document.querySelector('[data-uninstall]').hidden);
  await page.click('[data-uninstall]');
  await page.waitForFunction(() => /Removed/.test(document.querySelector('[data-install-status]').textContent));
  ok(await page.evaluate(() => document.querySelector('[data-uninstall]').hidden), 'Remove from this browser');

  // model theme + phone
  await page.goto('https://getcadcraft.com/addons/zz-test.pipes?space=model', { waitUntil: 'load' });
  await page.screenshot({ path: path.join(SHOTS, '06-page-model.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://getcadcraft.com/addons?space=paper', { waitUntil: 'load' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(!overflow, 'phone width: no sideways scroll');
  await page.screenshot({ path: path.join(SHOTS, '07-list-phone.png'), fullPage: true });

  const unexpected = problems.filter((p) => !/404|Failed to load resource|was switched off|not signed/.test(p));
  ok(!unexpected.length, 'no console errors', unexpected.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  php('tools/addons-test/directory-fixture.php', 'down');
  php('tools/addons-test/admin.php', 'down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
