/* SPDX-License-Identifier: Apache-2.0 */
// Shared set-up of tools/addons-test/browser-cabinetcraft-<app>.mjs (0.8 DC.117, session cabinetcraft_hosts): root's Playwright Chromium, a signed-in lab session minted in-process
// (tools/addons-test/admin.php), the add-on switched on through Settings › Add-ons (the app's own switch, else the loader), its panel found, console errors collected.
// One app, one page, headless, SwiftShader: nothing heavy. Run these one at a time (nice, with a timeout).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BASE = 'https://getcadcraft.com';
const ID = 'cabinetcraft';

export async function start(app, name) {
  let pass = 0, fail = 0;
  const args = process.argv.slice(2);
  const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/cabinetcraft-hosts');
  fs.mkdirSync(SHOTS, { recursive: true });
  const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + String(typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 300) : '')); } };
  const { chromium } = await import('playwright-core');
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  const SESSION = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', 'session'], { cwd: ROOT }).toString());
  const [cname, ...cv] = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: cname, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const problems = [];
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  const L = {
    ok, page, ctx, browser, problems, SHOTS,
    shot: (n) => page.screenshot({ path: path.join(SHOTS, n + '.png') }),
    /** Open the lab page of the app with the add-on off and its stored job cleared. */
    async open(ready, url = `${BASE}/lab/${app}`) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':cabinetcraft:')) localStorage.removeItem(k); try { const k = 'cc-addons:' + a; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.cabinetcraft; localStorage.setItem(k, JSON.stringify(s)); } catch { /* none */ } }, app);
      await page.goto(url, { waitUntil: 'networkidle' });
      if (ready) await page.waitForFunction(ready, null, { timeout: 60000 });
      await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'cabinetcraft' && a.state !== 'loading'), null, { timeout: 30000 });
    },
    entry: () => page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'cabinetcraft')),
    /** Settings › Add-ons, the app's own switch (else the loader); returns how it was done. */
    async enable() {
      let how = 'settings';
      try {
        await page.keyboard.press('Control+Comma');
        if (!(await page.$('dialog[open]')) && (await page.$('[data-settings-open]'))) await page.click('[data-settings-open]', { timeout: 4000 });
        const tabG = await page.$('dialog[open] [data-settings-tab="general"]');
        if (tabG) await page.evaluate(() => document.querySelector('dialog[open] [data-settings-tab="general"]').click());
        const nav = page.locator('dialog[open] .shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
        if (await nav.count()) await nav.first().click();
        await page.waitForSelector('[data-addon-toggle="cabinetcraft"]', { state: 'visible', timeout: 8000 });
        await page.click('[data-addon-toggle="cabinetcraft"]', { timeout: 8000 });
      } catch { how = 'loader'; await page.evaluate(() => window.ccAddons.loader.setEnabled('cabinetcraft', true)); }
      await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'cabinetcraft')?.state === 'active', null, { timeout: 20000 });
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());
      return how;
    },
    /** Show the add-on's panel (its tab or section) until [data-cabinetcraft] is there. */
    async showPanel() {
      await page.evaluate(() => { const b = document.querySelector('[data-addon="cabinetcraft"][role="tab"], [data-rtab="addon-cabinetcraft-cabinetcraft"], .pc-tabs [data-addon="cabinetcraft"]'); if (b) b.click(); });
      await page.waitForSelector('[data-cabinetcraft]', { state: 'attached', timeout: 20000 });
    },
    click: (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.click(); }, sel),
    tab: (v) => L.click('[data-cc-view="' + v + '"]'),
    say: () => page.evaluate(() => document.querySelector('[data-cc-msg]')?.textContent || ''),
    hostStatus: (id) => page.evaluate((i) => document.querySelector('[data-cc-host-status="' + i + '"]')?.textContent || '', id),
    waitSay: (re, ms = 30000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-cc-msg]')?.textContent || ''), re.source, { timeout: ms }),
    job: () => page.evaluate((a) => JSON.parse(localStorage.getItem('cc-addon:' + a + ':cabinetcraft:job')), app),
    async finish() {
      ok(problems.length === 0, 'no console errors', problems.slice(0, 3));
      await browser.close();
      console.log(`\n${name}: ${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    },
  };
  return L;
}
