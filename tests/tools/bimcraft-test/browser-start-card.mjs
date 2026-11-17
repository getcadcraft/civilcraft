#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-start-card.mjs — FX.270: the start card is not seen until app-start-tip.js has dressed it and read "Don't show this again"
 * (/lab/<app>, headless; the script's request is held back so the time before it runs can be looked at).
 *   node tools/bimcraft-test/browser-start-card.mjs [app …]   (as root; default bimcraft cadcraft takeoffcraft)
 */
import { openLab, BASE } from './bk-page.mjs';
const apps = process.argv.slice(2).filter((a) => !a.startsWith('-')); if (!apps.length) apps.push('bimcraft', 'cadcraft', 'takeoffcraft');
const L = await openLab({ tag: 'bkstart', units: 'mm' });
const { page, ok } = L;
const look = () => page.evaluate(() => { const c = document.querySelector('[data-hint]'); if (!c) return null; const cs = getComputedStyle(c), r = c.getBoundingClientRect(); return { seen: cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0, ready: c.hasAttribute('data-hint-ready'), x: !!c.querySelector('[data-hint-close]'), never: !!c.querySelector('[data-hint-never]'), dismissed: c.hasAttribute('data-hint-dismissed') }; });
let hold = 0, block = false;
let routed = 0;
// the browser keeps scripts it has just fetched: a client with the cache off, so every load asks the server again and the route below sees it
const cdp = await page.context().newCDPSession(page); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.setBypassServiceWorker', { bypass: true });
await page.context().route(/app-start-tip\.js/, async (route) => { routed++; if (block) return route.abort(); if (hold) await new Promise((r) => setTimeout(r, hold)); return route.continue(); });
let code = 1;
try {
  for (const app of apps) {
    console.log('== ' + app);
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'networkidle' });
    await page.evaluate((a) => { try { localStorage.removeItem('cc-hint-closed:' + a); } catch (e) { /* none */ } }, app);
    // 1. the script held back 2.5 s: the card is there but not seen; then it shows, dressed
    hold = 2500;
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'commit' }).catch(() => {});   // 'commit': deferred scripts run before DOMContentLoaded, so waiting for that would wait out the hold
    await page.waitForSelector('[data-hint]', { state: 'attached', timeout: 20000 });
    await page.waitForTimeout(700);
    const early = await look();
    ok(early && !early.seen && !early.ready && !early.never, 'before its script has run the card is not seen', JSON.stringify(early));
    await page.waitForFunction(() => document.querySelector('[data-hint]')?.hasAttribute('data-hint-ready'), null, { timeout: 30000 });
    const late = await look();
    ok(late.seen && late.x && late.never && !late.dismissed, 'after it: the card shows, with its close button and "Don\'t show this again"', JSON.stringify(late));
    // 2. "Don't show this again", then the page again: never seen, before or after
    await page.evaluate(() => document.querySelector('[data-hint-never]').click());
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'commit' }).catch(() => {});   // 'commit': deferred scripts run before DOMContentLoaded, so waiting for that would wait out the hold
    await page.waitForSelector('[data-hint]', { state: 'attached', timeout: 20000 });
    await page.waitForTimeout(700);
    const e2 = await look();
    await page.waitForFunction(() => document.querySelector('[data-hint]')?.hasAttribute('data-hint-ready'), null, { timeout: 30000 });
    const l2 = await look();
    ok(!e2.seen && !l2.seen && l2.dismissed, 'with "Don\'t show this again" chosen it is never seen: not before the script, not after', JSON.stringify([e2, l2]));
    await page.evaluate((a) => { try { localStorage.removeItem('cc-hint-closed:' + a); } catch (e) { /* none */ } }, app);
    // 3. the script does not load at all: the plain card shows (nothing needed to start is lost)
    hold = 0; block = true;
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'load' }).catch(() => {});
    await page.waitForTimeout(1500);
    const fb = await look();
    ok(fb && fb.seen && !fb.ready, 'when the script cannot load the plain card shows', JSON.stringify(fb));
    block = false;
  }
  console.log('\nrequests for the script seen by the test: ' + routed + ' (console errors from the blocked request are expected)');
  code = 0;
} catch (e) { console.error(e); }
await L.close();
process.exit(code);
