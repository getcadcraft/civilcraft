#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-newhere.mjs — "I'm new…" (assets/js/app-newhere.js, core/components/app-newhere.inc) in an app's dev build:
 *   - /use (release builds) never loads it
 *   - first visit: the one-line offer appears; "No thanks" remembers (cc-newhere = skipped) and it does not come back
 *   - tours switched off in Settings: no offer
 *   - Help › I'm new… opens the card; five steps (welcome, apps, settings, help, done) with Back / Next
 *   - the apps step lists all eight, marks this one "You are here" and suggests the one picked in step 1
 *   - the settings step: the tours checkbox writes cc-tours; "Open Settings" steps the card aside and it returns when Settings closes
 *   - the help step: "Show me" opens the Help panel
 *   - Finish remembers (cc-newhere = done); Esc closes without changing a finished tour
 *
 *   node tools/shell-test/browser-newhere.mjs [--apps cadcraft,bimcraft]
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of APPS) {
  ok(curl(`${BASE}/lab/${slug}`, minted.cookie).includes('app-newhere.js'), `${slug}: /lab (dev) loads app-newhere.js`);
  ok(!curl(`${BASE}/use/${slug}`).includes('app-newhere.js'), `${slug}: /use (release) does not`);
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const [cn, cv] = minted.cookie.split('=');
const newCtx = async () => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return ctx;
};
const open = async (ctx, slug) => { const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('  pageerror: ' + e.message)); await p.goto(`${BASE}/lab/${slug}`, { waitUntil: 'load' }); await p.waitForFunction(() => !!window.cadcraftNewHere, null, { timeout: 15000 }); return p; };
const card = (p) => p.evaluate(() => { const c = document.querySelector('[data-newhere]'); return !!c && c.matches(':popover-open'); });
const title = (p) => p.evaluate(() => document.querySelector('[data-newhere-title]').textContent);
const store = (p, k) => p.evaluate((x) => localStorage.getItem(x), k);
const press = (p, sel) => p.evaluate((s) => document.querySelector(s).click(), sel);
const offerShown = (p) => p.evaluate(() => !!document.querySelector('.nh-offer'));

try {
  for (const slug of APPS) {
    console.log(`\n== ${slug}`);
    // 1. the offer, once
    let ctx = await newCtx();
    let page = await open(ctx, slug);
    await sleep(4500);
    ok(await offerShown(page), 'first visit: the offer appears');
    await page.evaluate(() => document.querySelector('.nh-offer [data-k="no"]').click());
    ok(!(await offerShown(page)) && (await store(page, 'cc-newhere')) === 'skipped', '"No thanks": gone, remembered as skipped');
    await page.reload({ waitUntil: 'load' }); await sleep(4500);
    ok(!(await offerShown(page)), 'after a reload: no second offer');
    await ctx.close();

    // 2. tours off: no offer
    ctx = await newCtx();
    await ctx.addInitScript(() => { try { localStorage.setItem('cc-tours', 'off'); } catch (e) { /* none */ } });
    page = await open(ctx, slug); await sleep(4500);
    ok(!(await offerShown(page)), 'First-time tours off: no offer');

    // 3. the tour from Help
    await press(page, '[data-help-open]'); await sleep(600);
    ok(await page.evaluate(() => !!document.querySelector('[data-help-panel] [data-newhere-open]')), 'the Help panel carries "I\'m new…"');
    await press(page, '[data-help-panel] [data-newhere-open]'); await sleep(300);
    ok(await card(page), 'the card opens');
    ok((await title(page)) === 'Welcome', 'step 1: Welcome');
    await page.selectOption('#nh-task', '1');          // building models → BimCraft
    await press(page, '[data-newhere-next]');
    ok((await title(page)) === 'The eight apps', 'step 2: the eight apps');
    const apps = await page.evaluate(() => ({ n: document.querySelectorAll('.nh-app').length, here: document.querySelector('.nh-here .nh-app-name')?.firstChild.textContent, pick: document.querySelector('.nh-rec .nh-app-name')?.firstChild.textContent }));
    ok(apps.n === 8, 'all eight apps are listed');
    ok(apps.here && apps.pick === 'BimCraft', `this app is marked; the suggestion follows step 1 (${apps.pick})`);
    ok((await page.evaluate(() => document.querySelector('[data-newhere-next]').textContent)) === 'Next', 'the Next button has its words (no raw key)');
    await press(page, '[data-newhere-back]');
    ok((await title(page)) === 'Welcome', 'Back returns to step 1');
    await press(page, '[data-newhere-next]'); await press(page, '[data-newhere-next]');
    ok((await title(page)) === 'Settings', 'step 3: Settings');
    await page.evaluate(() => document.querySelector('.newhere .nh-check input').click());
    ok((await store(page, 'cc-tours')) === null, 'the tours checkbox (turned on) removes cc-tours');
    await press(page, '[data-k="settings"]'); await sleep(500);
    ok(!(await card(page)) && (await page.evaluate(() => !!document.querySelector('[data-app-settings][open]'))), 'Open Settings: the card steps aside, Settings is open');
    await page.evaluate(() => document.querySelector('[data-app-settings]').close()); await sleep(300);
    ok(await card(page), 'Settings closed: the card is back on the same step');
    ok((await title(page)) === 'Settings', '… still on Settings');
    await press(page, '[data-newhere-next]');
    ok((await title(page)) === 'Help and information', 'step 4: Help and information');
    await press(page, '.nh-row .nh-btn');              // the first row: Help panel
    await sleep(400);
    ok(await page.evaluate(() => !document.querySelector('[data-help-panel]').hidden), 'Show me opens the Help panel');
    await press(page, '[data-newhere-next]');
    ok((await title(page)) === "You're set", 'step 5: done');
    ok((await page.evaluate(() => document.querySelector('[data-newhere-next]').textContent)) === 'Finish', 'the last step says Finish');
    await press(page, '[data-newhere-next]');
    ok(!(await card(page)) && (await store(page, 'cc-newhere')) === 'done', 'Finish: closed, remembered as done');
    await page.evaluate(() => window.cadcraftNewHere.open(0)); await page.keyboard.press('Escape'); await sleep(200);
    ok(!(await card(page)) && (await store(page, 'cc-newhere')) === 'done', 'Esc closes; a finished tour stays finished');
    await ctx.close();
  }
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
