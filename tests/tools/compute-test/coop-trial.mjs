#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * coop-trial.mjs — CU.3 / RS.3's COOP/COEP trial without touching the server (0.7; sessions `compute` + `rust`): every app in
 * /lab is loaded in headless Chromium with the cross-origin isolation headers ADDED BY THE TEST (Playwright route), once with
 * COEP require-corp and once with credentialless, and the page is checked: crossOriginIsolated, console errors, requests that
 * failed or were blocked, cross-origin requests the page made (what COEP would block in the field), the shared-memory pool
 * (SharedArrayBuffer reaches the workers), and the app's own start. Prints a table for the write-up (docs/0.7-sessions/
 * compute.md § CU.3). Run as root, once (KICKOFF rule 6).
 *
 *   node tools/compute-test/coop-trial.mjs [--apps a,b] [--coep require-corp|credentialless|both] [--popup-coop]
 *   --popup-coop: also give /library pages the same COOP + COEP (the fix for the sign-in popup's window.opener: an isolated
 *                 page keeps its opener only with a popup that is isolated the same way)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPS = arg('--apps', 'cadcraft,bimcraft,modelcraft,markupcraft,takeoffcraft,civilcraft,detailcraft,partcraft').split(',');
const MODES = arg('--coep', 'both') === 'both' ? ['require-corp', 'credentialless'] : [arg('--coep')];
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedIn() {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ storageState: STATE });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/');
    await p.close(); await c.close();
    if (okLab) return;
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/modelcraft-test/admin.php'), 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext();
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  await c.close();
}
await signedIn();

const rows = [];
for (const coep of [null, ...MODES]) {
  for (const app of APPS) {
    const ctx = await browser.newContext({ storageState: STATE, viewport: { width: 1366, height: 768 } });
    if (coep) {
      // add the headers to the app pages and their files (as app-shell.inc's manifest "isolate" does) — not to the rest of the
      // site (/library, /account…), which is how it would be deployed
      await ctx.route(/^https:\/\/getcadcraft\.com\/(lab|use|assets)\//, async (route) => {
        try {
          const resp = await route.fetch();
          const headers = { ...resp.headers(), 'cross-origin-opener-policy': 'same-origin', 'cross-origin-embedder-policy': coep, 'cross-origin-resource-policy': 'same-origin' };
          await route.fulfill({ response: resp, headers });
        } catch { try { await route.continue(); } catch { /* the page went away mid-request */ } }
      });
    }
    // the fix to test for the popup: the site page it opens gets COOP same-origin too (no COEP needed there)
    if (coep && process.argv.includes('--popup-coop')) {
      await ctx.route(/^https:\/\/getcadcraft\.com\/library/, async (route) => {
        try { const resp = await route.fetch(); await route.fulfill({ response: resp, headers: { ...resp.headers(), 'cross-origin-opener-policy': 'same-origin', 'cross-origin-embedder-policy': coep } }); }
        catch { try { await route.continue(); } catch { /* gone */ } }
      });
    }
    const page = await ctx.newPage();
    const errors = [], failed = [], foreign = new Set();
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    page.on('requestfailed', (r) => failed.push(r.url().replace(BASE, '').slice(0, 100) + ' (' + (r.failure()?.errorText || '?') + ')'));
    page.on('request', (r) => { const u = new URL(r.url()); if (u.origin !== BASE && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) foreign.add(u.origin); });
    let started = false, iso = null, sab = null;
    try {
      await page.goto(BASE + '/lab/' + app, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(2500);
      iso = await page.evaluate(() => window.crossOriginIsolated);
      started = await page.evaluate(() => !!document.querySelector('main#main') && !document.querySelector('.app-error, [data-app-failed]'));
      if (app === 'modelcraft' || app === 'bimcraft') {
        sab = await page.evaluate(async () => {
          const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
          const url = Object.entries(map).find(([k]) => /\/dev\/compute\/runtime\.js/.test(k))?.[1];
          const R = await import(url);
          const pool = await R.pagePool();
          await pool.share('selftest', new Float32Array(8));
          const e = await pool.run(R.jobUrl('./selftest.js'), 'echo', { x: 1 });
          R.closePagePool();
          return { poolShared: pool.shared, workerSawShared: e.shared };
        });
      }
    } catch (e) { errors.push('load: ' + e.message.slice(0, 160)); }
    // what the apps do later: a popup that reports back to its opener (LibraryCraft sign-in: /library/connect posts the token
    // to window.opener), and a cross-origin picture (a map tile: CivilCraft's internet map layers, off by default)
    let opener = null, tile = null;
    if (app === 'bimcraft' || app === 'civilcraft') {
      try {
        const [pop] = await Promise.all([ctx.waitForEvent('page', { timeout: 15000 }), page.evaluate((u) => { window.__pop = window.open(u, '_blank'); }, BASE + '/library')]);
        await pop.waitForLoadState('load');
        opener = await pop.evaluate(() => !!window.opener);
        await pop.close();
      } catch (e) { opener = 'error: ' + e.message.slice(0, 80); }
      tile = await page.evaluate(() => new Promise((res) => {
        const img = new Image();
        const t = setTimeout(() => res('timeout'), 8000);
        img.onload = () => { clearTimeout(t); res('loaded'); };
        img.onerror = () => { clearTimeout(t); res('blocked or failed'); };
        img.src = 'https://tile.openstreetmap.org/2/1/1.png';
      }));
    }
    rows.push({ coep: coep || 'none', app, iso, started, opener, tile, errors: errors.length, failed: failed.length, foreign: [...foreign], sab, sample: [...errors.slice(0, 2), ...failed.slice(0, 2)] });
    console.log([coep || 'none', app, 'isolated=' + iso, 'started=' + started, 'errors=' + errors.length, 'failed=' + failed.length, 'cross-origin=' + ([...foreign].join(' ') || '—'), sab ? 'pool shared=' + sab.poolShared + '/worker=' + sab.workerSawShared : '', opener !== null ? 'popup opener=' + opener : '', tile !== null ? 'map tile=' + tile : ''].join('  '));
    for (const x of [...errors.slice(0, 3), ...failed.slice(0, 3)]) console.log('      ' + x);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(REPO, 'tmp/coop-trial.json'), JSON.stringify(rows, null, 1) + '\n');
console.log('\nwritten tmp/coop-trial.json');
