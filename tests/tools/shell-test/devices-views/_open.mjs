/* SPDX-License-Identifier: Apache-2.0 */
/** Shared by the devices-views checks: a signed-in Chromium page on /lab/<slug> (tools/shell-test/admin.php session), ok() lines. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const res = { pass: 0, fail: 0 };
export const ok = (c, m, extra = '') => { if (c) { res.pass++; console.log('  ok   ' + m); } else { res.fail++; console.log('  FAIL ' + m + (extra ? '  ' + extra : '')); } };

export async function open(slug) {
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const { chromium } = await import('playwright-core');
  const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const pw = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cache, pw, s)).find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  const [n, v] = minted.cookie.split('=');
  await ctx.addCookies([{ name: n, value: v, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`https://getcadcraft.com/lab/${slug}?space=paper`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.ccShellDevices, null, { timeout: 20000 });
  return { browser, page, errors, T: (fn, a) => page.evaluate(fn, a) };
}
