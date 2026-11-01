/* SPDX-License-Identifier: Apache-2.0 */
// Shared set-up of tools/addons-test/browser-trusscraft-<app>.mjs: root's Playwright Chromium, a signed-in lab session minted in-process
// (tools/addons-test/admin.php), the add-on switched on through Settings › Add-ons (the app's own switch), the Trusses panel, console errors collected.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BASE = 'https://getcadcraft.com';

export async function start(app, name) {
  let pass = 0, fail = 0;
  const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + String(typeof x === 'string' ? x : JSON.stringify(x)).slice(0, 260) : '')); } };
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
    ok, page, ctx, browser, problems,
    async open(ready) {
      await page.goto(`${BASE}/lab/${app}`, { waitUntil: 'domcontentloaded' });
      await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':trusscraft:')) localStorage.removeItem(k); try { const k = 'cc-addons:' + a; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.trusscraft; if (s.off) delete s.off.trusscraft; localStorage.setItem(k, JSON.stringify(s)); } catch { /* */ } }, app);
      await page.goto(`${BASE}/lab/${app}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(ready, null, { timeout: 60000 });
      await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'trusscraft' && a.state !== 'loading'), null, { timeout: 20000 });
    },
    entry: () => page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'trusscraft')),
    /** Settings › Add-ons, the app's own switch; returns how it was done. */
    async enable() {
      let how = 'settings';
      try {
        await page.keyboard.press('Control+Comma');
        if (!(await page.$('dialog[open]')) && (await page.$('[data-settings-open]'))) await page.click('[data-settings-open]');
        const tabG = await page.$('dialog[open] [data-settings-tab="general"]');
        if (tabG) await page.evaluate(() => document.querySelector('dialog[open] [data-settings-tab="general"]').click());
        const nav = page.locator('dialog[open] .shell-sec-nav button', { hasText: /^\s*Add-ons\s*$/ });
        if (await nav.count()) await nav.first().click();
        await page.waitForSelector('[data-addon-toggle="trusscraft"]', { state: 'visible', timeout: 8000 });
        await page.click('[data-addon-toggle="trusscraft"]', { timeout: 8000 });
      } catch { how = 'loader'; await page.evaluate(() => window.ccAddons.loader.setEnabled('trusscraft', true)); }
      await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'trusscraft')?.state === 'active', null, { timeout: 20000 });
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.querySelector('[data-settings-close]')?.click());
      return how;
    },
    /** Open the Trusses tab / section so the panel renders. */
    async showPanel() {
      await page.evaluate(() => { const b = document.querySelector('[data-addon="trusscraft"][role="tab"], [data-rtab="addon-trusscraft-trusses"]'); if (b) b.click(); });
      await page.waitForSelector('[data-trs-label]', { state: 'attached', timeout: 20000 });
    },
    /** A click that does not need the element to be on screen (panels fold, tabs hide). */
    click: (sel) => page.evaluate((s) => { const e = document.querySelector(s); if (!e) throw new Error('no ' + s); e.click(); }, sel),
    says: () => page.evaluate(() => document.querySelector('.trs-say')?.textContent || ''),
    async setOutline(text) { await page.evaluate((v) => { const t = document.querySelector('.trs-layout textarea, fieldset textarea'); t.value = v; t.dispatchEvent(new Event('change')); }, text); },
    problemsList: () => page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /trusscraft/.test(p.source && p.source.name)).map((p) => ({ code: p.code, severity: p.severity, src: p.source.name, text: p.text })) : null)),
    async finish() {
      ok(problems.length === 0, 'no console errors', problems.slice(0, 3));
      await browser.close();
      console.log(`\n${name}: ${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    },
  };
  return L;
}
