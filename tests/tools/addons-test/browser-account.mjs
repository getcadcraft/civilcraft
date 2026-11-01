#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-account.mjs — Settings › "Your add-ons" in two apps (0.8 AL.13). Run as root: a signed-in session is minted by tools/addons-test/admin.php.
 *
 *   node tools/addons-test/browser-account.mjs [--apps bimcraft,cadcraft] [--shots dir]
 *
 * app-addons.js mounts the account (window.ccAddonsAccount) next to the loader; Settings has its own fieldset; the tab starts signed out and offers Sign in;
 * Sign in opens /library/connect?app=, the token comes back by postMessage and the list is fetched with it (a Bearer call, no session cookie); the token
 * lives for the tab (sessionStorage); Check for updates answers; Add and Remove go through the API and the screen follows; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const APPS = opt('--apps', 'bimcraft,cadcraft').split(',');
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/addons-account'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString().trim().split('\n').pop());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const problems = [];
try {
  for (const app of APPS) {
    console.log('— ' + app);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => { sessionStorage.clear(); for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addons-account:')) localStorage.removeItem(k); });
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.ccAddons && !!window.ccAddonsAccount, null, { timeout: 90000 });
    ok(await page.evaluate(() => !window.ccAddonsAccount.signedIn()), app + ': the account is mounted and the tab starts signed out');
    await page.click('[data-settings-open]');
    if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
    const set = '[data-addons-account-set]';
    const navBtn = '.shell-sec-nav button:has-text("Your add-ons")';
    await page.waitForSelector(navBtn, { timeout: 15000 }).then(() => page.click(navBtn)).catch(() => {});   // the 0.7 Settings list on the left, when the dialog has it
    await page.waitForSelector(set, { state: 'visible', timeout: 15000 });
    const txt0 = await page.textContent(set);
    ok(/Your add-ons/.test(txt0) && /Sign in/.test(txt0), app + ': Settings has "Your add-ons" and offers Sign in', txt0.slice(0, 120));
    await page.screenshot({ path: path.join(SHOTS, app + '-01-signed-out.png') });
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click(set + ' button:has-text("Sign in")')]);
    ok(new URL(popup.url()).pathname === '/library/connect' && /app=/.test(popup.url()), app + ': Sign in opens /library/connect for the app', popup.url());
    await popup.waitForSelector('button:has-text("Connect")', { timeout: 15000 }).then(() => popup.click('button:has-text("Connect")'));   // the page asks once before it mints the key
    await page.waitForFunction(() => window.ccAddonsAccount.signedIn(), null, { timeout: 20000 });
    ok(await page.evaluate(() => /^ccu_/.test(sessionStorage.getItem('cc-addons-account:' + window.ccAddonsAccount.app + ':token') || '')), app + ': the token came back and is kept for the tab only');
    ok(!(await page.evaluate(() => !!localStorage.getItem('cc-addons-account:' + window.ccAddonsAccount.app + ':token'))), app + ': and is not in localStorage');
    await page.waitForTimeout(1200);
    const txt1 = await page.textContent(set);
    ok(!/Sign in/.test(txt1), app + ': signed in, the Sign in button is gone', txt1.slice(0, 120));
    const sync = await page.evaluate(async () => { const r = await window.ccAddonsAccount.sync(); return { ok: r.ok, closed: !!r.closed, signedOut: !!r.signedOut, n: (r.items || []).length }; });
    ok(sync.ok, app + ': the list was asked for with the token and came back', JSON.stringify(sync));
    // Add (what the Library's Add button calls) and Remove on the screen, through the real API
    const added = await page.evaluate(() => window.ccAddonsAccount.add('acoustics'));
    ok(added.ok, app + ': Add reaches the account list', JSON.stringify(added));
    await page.waitForFunction((s) => /acoustics/i.test(document.querySelector(s).textContent), set, { timeout: 10000 }).catch(() => {});
    ok(/acoustics/i.test(await page.textContent(set)), app + ': the screen follows: the add-on is listed', (await page.textContent(set)).slice(0, 200));
    await page.screenshot({ path: path.join(SHOTS, app + '-01b-added.png') });
    await page.click(set + ' button:has-text("Check for updates")');
    await page.waitForFunction((s) => /up to date|Updates/.test(document.querySelector(s).textContent) && /up to date/.test(document.querySelector(s).textContent), set, { timeout: 15000 }).catch(() => {});
    ok(/Everything is up to date/.test(await page.textContent(set)), app + ': Check for updates answers', (await page.textContent(set)).slice(-160));
    await page.screenshot({ path: path.join(SHOTS, app + '-02-signed-in.png') });
    // Remove on the screen: the add-on goes (anything it needed that nothing else uses goes with it)
    const row = set + ' li:has-text("acoustics") button:has-text("Remove")';
    await page.click(row);
    await page.waitForFunction((s) => !/acoustics/i.test(document.querySelector(s + ' ul').textContent), set, { timeout: 10000 }).catch(() => {});
    ok(!/acoustics/i.test(await page.textContent(set + ' ul')), app + ': Remove takes it off the list', (await page.textContent(set)).slice(0, 200));
    // forget the token: back to signed out
    await page.evaluate(() => window.ccAddonsAccount.setToken(null));
    ok((await page.textContent(set)).includes('Sign in'), app + ': forgetting the token shows Sign in again');
    await page.close();
  }
  ok(!problems.length, 'no console errors', problems.slice(0, 6).join(' | '));
} catch (err) { fail++; console.log('  FAIL ' + (err?.stack || err)); }
finally { await browser.close(); try { admin('down'); } catch { /* fine */ } }
console.log('\nbrowser-account: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
