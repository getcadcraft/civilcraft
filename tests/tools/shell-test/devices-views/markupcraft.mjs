#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * devices-views/markupcraft.mjs — 0.8 Track ID: MarkupCraft hands its page view to the input-device layer
 * (assets/js/app-devices-ui.js). Opens /lab/markupcraft with the public kitchen sheet PDF and checks that
 * window.ccShellDevices.views() lists the page view (the overlay canvas) and that zoom(1.5, 100, 100), pan(50, 0) and fit()
 * move it (view.z / ox / oy), that zoom keeps the point under (100, 100) and pan moves the content 50 px right.
 *
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/markupcraft.mjs
 * Run as root (a session minted for the shell's test admin, tools/shell-test/admin.php session).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

try {
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  ok(await page.evaluate(() => !!window.ccShellDevices), 'the device layer is loaded (window.ccShellDevices)');
  const empty = await page.evaluate(() => { const v = window.ccShellDevices.views()[0]; if (!v) return null; const m = window.markupcraft.view, s = [m.z, m.ox, m.oy].join(); v.zoom(1.5, 100, 100); v.pan(50, 0); v.fit(); return s === [m.z, m.ox, m.oy].join(); });
  ok(empty === true, 'with no PDF open the view is listed and its methods do nothing');
  await page.setInputFiles('[data-file]', PLAN);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  await page.waitForTimeout(400);
  const listed = await page.evaluate(() => { const vs = window.ccShellDevices.views(), v = vs.find((x) => x.el === document.querySelector('[data-over]') || x.el === window.markupcraft.view.over); return { n: vs.length, found: !!v, kind: v?.kind, tag: v?.el.tagName, has: v ? ['pan', 'zoom', 'orbit', 'fit'].filter((m) => typeof v[m] === 'function') : [] }; });
  ok(listed.found && listed.kind === '2d' && !listed.has.includes('orbit'), `page view listed (${listed.n} views; ${listed.tag}, kind ${listed.kind}; ${listed.has.join(' ')})`);
  for (const [name, call] of [['zoom(1.5, 100, 100)', (v) => v.zoom(1.5, 100, 100)], ['pan(50, 0)', (v) => v.pan(50, 0)], ['fit()', (v) => v.fit()]]) {
    const r = await page.evaluate((src) => {
      const m = window.markupcraft.view, v = window.ccShellDevices.views()[0];
      const st = () => [m.z, m.ox, m.oy].map((x) => Math.round(x * 10000) / 10000);
      const before = st(); new Function('v', 'return (' + src + ')(v)')(v); return { before, after: st() };
    }, call.toString());
    ok(JSON.stringify(r.before) !== JSON.stringify(r.after), `${name} moves the view  [z, ox, oy] ${JSON.stringify(r.before)}  →  ${JSON.stringify(r.after)}`);
  }
  const geo = await page.evaluate(() => {
    const m = window.markupcraft.view, v = window.ccShellDevices.views()[0];
    const u = (sx, sy) => m.toUser(sx, sy);
    const a = u(100, 100); v.zoom(1.5, 100, 100); const b = u(100, 100);
    const ox = m.ox; v.pan(50, 0);
    return { still: Math.hypot(a[0] - b[0], a[1] - b[1]), moved: m.ox - ox };
  });
  ok(geo.still < 1e-6 && Math.abs(geo.moved - 50) < 1e-9, `zoom keeps the point under (100, 100) (${geo.still}); pan(50, 0) moves the content 50 px right (${geo.moved})`);
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
}
ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' / ') : ''));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
