#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fit.mjs — "the menus don't fit this window" (assets/js/app-fit.js, owner 2026-11-01) in an app's dev build:
 *   - a roomy window: no question
 *   - a short window: the dialog asks, with Yes / No / Don't ask again / Learn more
 *   - Learn more shows the settings text and Back returns to the question
 *   - Yes: the drawing gets a bigger share of the window and the toolbar rows setting is one row
 *   - No: no more questions in that tab (a resize, a reload); Don't ask again: none in a new page either; ccFit.reset() asks again
 *   - /use (release builds) never loads it
 *
 *   node tools/shell-test/browser-fit.mjs [--apps cadcraft,bimcraft]
 * Run as root (a session minted for the shell's test admin). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'cadcraft').split(',');
const SHOT = opt('--shot');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of APPS) {
  ok(curl(`${BASE}/lab/${slug}`, minted.cookie).includes('app-fit.js'), `${slug}: /lab (dev) loads app-fit.js`);
  ok(!curl(`${BASE}/use/${slug}`).includes('app-fit.js'), `${slug}: /use (release) does not`);
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const [cn, cv] = minted.cookie.split('=');
const newCtx = async (w, h) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-app-settings:' + location.pathname.split('/')[2], JSON.stringify({ ui: 1.4 })); } catch (e) { /* none */ } });   // a scaled-up interface, as on a zoomed screen
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return ctx;
};
const asking = (page) => page.evaluate(() => !!document.querySelector('dialog.shell-fit[open]'));
const share = (page) => page.evaluate(() => window.ccFit.measure().share);
const bars = (page) => page.evaluate(() => window.ccFit.measure().top);   // how far down the window the toolbars reach
const open = async (ctx, slug) => { const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('  pageerror: ' + e.message)); await p.goto(`${BASE}/lab/${slug}`, { waitUntil: 'load' }); await p.waitForFunction(() => !!window.ccFit, null, { timeout: 15000 }); return p; };
const click = (page, a) => page.evaluate((x) => document.querySelector(`dialog.shell-fit [data-fit="${x}"]`).click(), a);

try {
  for (const slug of APPS) {
    console.log(`\n== ${slug}`);
    // 1. a roomy window
    let ctx = await newCtx(1600, 1100);
    let page = await open(ctx, slug);
    await sleep(3500);
    const roomy = await share(page);
    ok(!(await asking(page)), `roomy window (drawing ${Math.round(roomy * 100)}% of the height): no question`);
    await ctx.close();

    // 2. a short window
    ctx = await newCtx(1440, 640);
    page = await open(ctx, slug);
    await page.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 12000 }).catch(() => {});
    const before = await share(page), barsBefore = await bars(page);
    ok(await asking(page), `short window (drawing ${Math.round(before * 100)}% of the height): the question is asked`);
    if (SHOT) await page.screenshot({ path: path.join(SHOT, `fit-${slug}-ask.png`) });
    const text = await page.evaluate(() => document.querySelector('dialog.shell-fit').innerText);
    ok(/%/.test(text) && !/shell\.fit\./.test(text), 'the words are real text (no bare keys), with the percentage');
    const names = await page.evaluate(() => [...document.querySelectorAll('dialog.shell-fit [data-fit-ask-row] button')].map((b) => b.textContent));
    ok(names.length === 4 && names.every(Boolean), `four buttons: ${names.join(' | ')}`);

    await click(page, 'more');
    ok(await page.evaluate(() => !document.querySelector('[data-fit-more]').hidden && document.querySelector('[data-fit-ask]').hidden), 'Learn more shows the menu layout and full screen text');
    if (SHOT) await page.screenshot({ path: path.join(SHOT, `fit-${slug}-more.png`) });
    await click(page, 'back');
    ok(await page.evaluate(() => document.querySelector('[data-fit-more]').hidden && !document.querySelector('[data-fit-ask]').hidden), 'Back returns to the question');

    await click(page, 'yes');
    await sleep(1500);
    const after = await share(page), barsAfter = await bars(page);
    ok(!(await asking(page)), 'Yes closes the dialog');
    ok(barsAfter < barsBefore - 0.03, `Yes tightens the toolbars: they took ${Math.round(barsBefore * 100)}% of the window, now ${Math.round(barsAfter * 100)}% (drawing ${Math.round(before * 100)}% → ${Math.round(after * 100)}%)`);
    if (SHOT) await page.screenshot({ path: path.join(SHOT, `fit-${slug}-after.png`) });
    await ctx.close();

    // 3. No: nothing more in this tab
    ctx = await newCtx(1440, 640);
    page = await open(ctx, slug);
    await page.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 12000 }).catch(() => {});
    await click(page, 'no');
    ok(!(await asking(page)), 'No closes the dialog');
    await page.setViewportSize({ width: 1430, height: 630 });
    await sleep(2800);
    ok(!(await asking(page)), 'No: a resize does not ask again');
    await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => !!window.ccFit); await sleep(3500);
    ok(!(await asking(page)), 'No: a reload in the same tab does not ask again');

    // 4. Don't ask again: a new page too; reset brings it back
    const p2 = await open(ctx, slug);   // same context = same localStorage, new tab = fresh sessionStorage
    await p2.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 12000 }).catch(() => {});
    ok(await asking(p2), 'a new tab (No is per tab) asks again');
    await click(p2, 'never');
    ok(!(await asking(p2)) && (await p2.evaluate(() => localStorage.getItem('cc-fit'))) === 'never', "Don't ask again is kept");
    const p3 = await open(ctx, slug); await sleep(3500);
    ok(!(await asking(p3)), "Don't ask again: a new tab is not asked");
    await p3.evaluate(() => window.ccFit.reset());
    ok(await p3.evaluate(() => window.ccFit.check(false)), 'ccFit.reset() lets the question come back');
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
