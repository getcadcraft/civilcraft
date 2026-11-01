/* SPDX-License-Identifier: Apache-2.0 */
// Shared set-up of the crs-share_PART_3 browser tests: a minted session (tools/shell-test/admin.php, never the shared admin login),
// the cached Playwright Chromium, one context, console errors collected. Tests call open() then run their steps one app at a time.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const BASE = 'https://getcadcraft.com';
export const UTM33 = '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs';
export const OWN = '+proj=tmerc +lat_0=0 +lon_0=152.5 +k=0.9996 +x_0=500000 +y_0=10000000 +ellps=GRS80 +units=m';
export function harness(title) {
  let pass = 0, fail = 0;
  const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' - ' + extra : '')); } };
  const problems = [];
  return {
    ok, problems, title,
    async open() {
      const { chromium } = await import('playwright-core');
      const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
      const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
      const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
      const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
      const [cname, ...rest] = minted.cookie.split('=');
      const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
      await ctx.addCookies([{ name: cname, value: rest.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
      await ctx.addInitScript(() => {   // a reload after unsaved work offers "Recover your work?": discard it
        new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
          .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
      });
      this.browser = browser; this.ctx = ctx;
      return this;
    },
    page() {
      const page = this.ctx.newPage();
      return page.then((p) => {
        p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
        p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
        return p;
      });
    },
    async finish() {
      ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
      await this.browser?.close();
      try { execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'down']); } catch { /* already down */ }
      console.log(`\n${pass} passed, ${fail} failed`);
      process.exit(fail ? 1 : 0);
    },
    get counts() { return { pass, fail }; },
    bump() { fail++; },
  };
}
