#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-toolbar-tear.mjs — the classic layout's toolbars in their own window (assets/js/app-toolbar-tear.js; owner 2026-10-30). For each
 * lab app in the classic layout: the main toolbar has the "…" button, "Move to a new window" opens a pop-up holding the bar, a tool clicked
 * THERE works in the app, "Put the toolbar back" brings it home and it still works, another layout brings it home and hides the button.
 * BimCraft also: the plan's Draw bar. /use (released) has none of it.
 *
 *   node tools/shell-test/browser-toolbar-tear.mjs [--apps cadcraft,bimcraft] [--shots <dir>]
 * Run as root (a session minted for the shell's test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
ctx.setDefaultTimeout(10000);
process.on('unhandledRejection', async (e) => { console.log('  FAIL ' + String(e?.message || e).split('\n')[0]); await browser.close().catch(() => {}); process.exit(1); });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = async (fn, ms = 6000, arg) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn, arg).catch(() => false)) return true; await sleep(80); } return false; };
const ALL = ['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'];
const apps = (opt('--apps') || ALL.join(',')).split(',');
const shots = opt('--shots');

/** A tool in the bar whose click the app answers visibly: CadCraft's LINE starts a command; elsewhere a tool with aria-pressed="false" turns on. */
const TOOL = { cadcraft: '[data-cmd="LINE"]' };
const pick = (slug, scope) => TOOL[slug] || scope + ' button[aria-pressed="false"]:not([disabled])';
const cadRunning = () => /LINE/.test(document.querySelector('.cc-cmd')?.textContent || '');

/** Open bar i through its own "…" menu; → the pop-up page. */
async function tearOut(i) {
  const btn = page.locator('.shell-tb-tear .ws-popout-menu').nth(i);
  await btn.click();
  const [pop] = await Promise.all([page.waitForEvent('popup', { timeout: 8000 }), page.locator('.shell-panel-menu [role="menuitem"]').first().click()]);
  await pop.waitForSelector('.ws-popout-box [data-tb-torn]', { timeout: 8000 });
  return pop;
}

for (const slug of apps) {
  console.log('== ' + slug);
  ok(!curl(BASE + '/use/' + slug).includes('app-toolbar-tear.js'), 'use (released): not loaded');
  problems = [];
  await page.goto(BASE + '/lab/' + slug, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.removeItem('cc-workspace'); localStorage.setItem('cc-tours', 'off'); localStorage.removeItem('cc-crosshair'); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  ok(await wait(() => window.ccToolbarTear?.bars().some((b) => b.el.classList.contains('shell-tb') && b.shown), 20000), 'classic: the main toolbar has the "…" button');
  await sleep(3000); await page.keyboard.press('Escape');
  if (slug === 'bimcraft') {
    await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new'); await page.click('[data-new-ok]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])', { timeout: 60000 }); await sleep(1500);
    ok(await wait(() => window.ccToolbarTear.bars().some((b) => b.el.matches('[data-modelbar]') && b.shown)), 'BimCraft: the plan Draw bar has one too');
  }
  if (slug === 'takeoffcraft') {
    // every drawing tool is greyed out until a sheet is open: open the showcase sheet (fixtures/showcase, built once)
    await page.setInputFiles('[data-file-pdf]', path.join(REPO, 'fixtures/showcase/takeoffcraft-count-everything.pdf'));
    await page.waitForFunction(() => window.takeoffcraft?.files?.length >= 1, null, { timeout: 30000 }); await sleep(700);
  }
  const tool = pick(slug, '.shell-tb');
  // the first SHOWN tool: a bar can hold groups hidden until their workspace is on (CivilCraft's Landscape group, ls-plant first; 2026-11-02)
  const toolKey = await page.evaluate((sel) => { const b = [...document.querySelectorAll('#main ' + sel)].find((x) => x.getClientRects().length && !x.closest('[hidden]')); if (!b) return null; return [...b.attributes].filter((a) => a.name.startsWith('data-')).map((a) => '[' + a.name + '="' + a.value + '"]').join('') || null; }, tool);
  ok(!!toolKey, 'a tool to try', tool);
  const pop = await tearOut(0);
  ok(await page.evaluate(() => !document.querySelector('#main .shell-tb') && window.ccToolbarTear.bars()[0].out), 'Move to a new window: the bar left the page');
  ok(await pop.evaluate(() => !!document.querySelector('.ws-popout-box .shell-tb') && document.querySelectorAll('.ws-popout-box .shell-tb button').length > 3), 'the pop-up holds the bar with its tools');
  ok((await pop.title()).length > 3, 'the window has a title', await pop.title());
  if (shots) await pop.screenshot({ path: shots + '/tear-' + slug + '.png' });
  if (toolKey) {
    await pop.click('.ws-popout-box ' + toolKey);
    const worked = slug === 'cadcraft' ? await wait(cadRunning, 4000) : await pop.waitForFunction((k) => document.querySelector('.ws-popout-box ' + k)?.getAttribute('aria-pressed') === 'true', toolKey, { timeout: 4000 }).then(() => true).catch(() => false);
    ok(worked, 'a tool clicked in the pop-up works in the app', toolKey);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  }
  // put it back from inside the window (the "…" moved with the bar)
  await pop.click('.ws-popout-box .shell-tb-tear .ws-popout-menu');
  await pop.locator('.shell-panel-menu [role="menuitem"]').first().click({ noWaitAfter: true }).catch(() => {});   // the window closes under the click
  ok(await wait(() => !!document.querySelector('#main .shell-tb') && !window.ccToolbarTear.bars()[0].out), 'Put the toolbar back: home again');
  ok(await wait(() => true) && pop.isClosed(), 'and the window closed');
  if (toolKey && slug !== 'cadcraft') {
    const other = await page.evaluate((k) => { const b = document.querySelector('#main .shell-tb ' + k); return b?.getAttribute('aria-pressed'); }, toolKey);
    ok(other !== null, 'the tool is back in the page', String(other));
  }
  // closing the window brings it home too
  const pop2 = await tearOut(0);
  await pop2.close();
  ok(await wait(() => !!document.querySelector('#main .shell-tb')), 'closing the window brings the bar home');
  if (slug === 'bimcraft') {
    const i = await page.evaluate(() => window.ccToolbarTear.bars().findIndex((b) => b.el.matches('[data-modelbar]')));
    const pop3 = await tearOut(i);
    await pop3.click('.ws-popout-box [data-mtool="wall"]');
    ok(await wait(() => /wall/i.test(window.bimcraftPlan?.state?.tool || document.querySelector('[data-mtool="wall"]')?.getAttribute('aria-pressed') || ''), 4000), 'BimCraft: Wall picked in the torn-off Draw bar is the plan tool', await page.evaluate(() => String(window.bimcraftPlan?.state?.tool)));
    if (shots) await pop3.screenshot({ path: shots + '/tear-bimcraft-draw.png' });
    await pop3.close();
    ok(await wait(() => !!document.querySelector('[data-plan-wrap] [data-modelbar]')), 'the Draw bar is home');
  }
  // another layout: every bar home, no buttons
  const layouts = await page.evaluate(() => [...document.querySelectorAll('[data-app-settings] select[name="workspace"] option, [data-app-settings] [name="workspace"]')].map((o) => o.value).filter((v) => v && v !== 'standard'));
  if (layouts.length) {
    const pop4 = await tearOut(0);
    console.log('  layouts', layouts.join(','), 'page closed?', page.isClosed(), 'pop4 closed?', pop4.isClosed());
    await page.evaluate((v) => { localStorage.setItem('cc-workspace', v); window.dispatchEvent(new CustomEvent('cc-workspace', { detail: { layout: v } })); }, layouts[0]);
    ok(await wait(() => window.ccToolbarTear.bars().every((b) => !b.out && !b.shown)), 'another layout (' + layouts[0] + '): bars home, buttons hidden');
    // the window closes a moment after the bars come home: wait for it rather than reading isClosed() at once
    ok(pop4.isClosed() || await pop4.waitForEvent('close', { timeout: 4000 }).then(() => true).catch(() => false), 'its window closed');
    await page.evaluate(() => { localStorage.removeItem('cc-workspace'); });
  } else console.log('  (no other layout offered here)');
  ok(problems.length === 0, 'no page errors', problems.join(' | '));
}
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
