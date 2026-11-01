#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plants.mjs — BimCraft's Library › Plants source (0.8 LD.1): the CC0 plant list placed into an IFC building, headless.
 *   node tools/bimcraft-test/browser-plants.mjs [--shots <dir>]
 * Run as root. One walk: a new building, Library tab › Plants, search, Place a tree in 3D, the element is an IfcGeographicElement with the plant's key. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'ld1plants'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const problems = [];
let ctx = null, page = null;
/** A fresh browser context (its own storage: no autosave from an earlier section), signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
/** File › New building from the empty start page: n levels of h mm. */
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const pick = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
/** Open a file; when edits are waiting, answer the in-page question with "Discard". */
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const openShowcase = async () => {
  await openFile({ name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) }, /^Opened bimcraft-house/);
};

try {
  await fresh();
  console.log('== plants: LD.1 Library › Plants');
  await newBuilding('Plants', 1, 3000);
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Plants")');
  await page.waitForSelector('.bc-lib-card', { timeout: 20000 });
  await page.waitForFunction(() => document.querySelectorAll('.bc-lib-card').length >= 300, null, { timeout: 15000 }).catch(() => {});   // the live Library read finishes after the first cards (round 5)
  const n = (await page.$$('.bc-lib-card')).length;
  ok(n >= 300, 'the plant list shows as cards (the panel shows the first 300; search finds the rest): ' + n);
  await page.fill('.bc-lib-search', 'quercus');
  await page.waitForTimeout(600);
  const names = await page.$$eval('.bc-lib-card', (cs) => cs.map((c) => c.textContent));
  ok(names.length > 0 && names.length < n && names.every((x) => /quercus/i.test(x)), 'search by botanical name narrows the list: ' + names.length, names.slice(0, 3).join(' | '));
  await page.click('.bc-lib-card >> nth=0');
  await page.waitForSelector('[data-lib-place]');
  const det = await page.textContent('.bc-lib-detail');
  ok(/m high|m across/i.test(det) || /\d+\s*mm/.test(det), 'the detail gives its size', det.slice(0, 160));
  await page.click('[data-lib-place]');
  ok(await page.isVisible('[data-placebar]'), 'the placing bar opens');
  await page.fill('[data-place-xy]', '3000, 2000');
  await page.press('[data-place-xy]', 'Enter');
  const dlg = await page.waitForSelector('dialog.bc-dialog[open]', { timeout: 8000 }).catch(() => null);
  if (dlg) await page.keyboard.press('Enter');
  await waitStatus(/^Placed /, 60000);
  ok(/Placed: /.test(await page.textContent('[data-change-list]')), 'the change list shows the plant placed');
  const props = await page.textContent('[data-props]');
  ok(/CC-PLANT|Library item/.test(props), 'Properties show the library item', props.slice(0, 200));
  await shot(page, 'plants-01-placed');
  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'ld1plants']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
