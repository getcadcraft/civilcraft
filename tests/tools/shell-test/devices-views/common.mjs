/* SPDX-License-Identifier: Apache-2.0 */
/**
 * common.mjs — shared start for the devices-views checks (0.8 Track ID: an app hands its views to assets/js/app-devices-ui.js
 * through window.ccViews). Opens /lab/<slug> in headless Chromium with a session minted for the shell's test admin
 * (tools/shell-test/admin.php session). Run as root, one app at a time:  nice -n 10 timeout 300 node tools/shell-test/devices-views/<slug>.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
export const BASE = 'https://getcadcraft.com';

export async function open(slug, { init } = {}) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const { chromium } = await import(path.join(REPO, 'node_modules/playwright-core/index.mjs'));
  const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
  const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
  const [cn, cv] = minted.cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccShellDevices && typeof window.ccShellDevices.views === 'function', null, { timeout: 30000 });
  const finish = async () => {
    const real = problems.filter((p) => !/favicon|ERR_|404|net::/.test(p));
    ok(!real.length, 'no page errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
    await browser.close();
    console.log(`\n${pass} passed, ${fail} failed`);
    process.exit(fail ? 1 : 0);
  };
  return { page, ok, finish, pc: (fn, a) => page.evaluate(fn, a) };
}

/** The registered views as plain data: [{tag, kind, hasOrbit}] (index = position in views()). */
export const viewList = (page) => page.evaluate(() => window.ccShellDevices.views().map((v) => ({ tag: v.el.tagName.toLowerCase() + (v.el.className ? '.' + String(v.el.className).split(' ')[0] : '') + Object.keys(v.el.dataset).map((k) => '[' + k + ']').join(''), kind: v.kind, hasOrbit: typeof v.orbit === 'function' })));
