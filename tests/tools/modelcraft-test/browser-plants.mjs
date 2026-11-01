#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plants.mjs (modelcraft) — ModelCraft's Starter library › Plants (0.8 LD.1): the CC0 plant list as components, headless.
 *   node tools/bimcraft-test/browser-plants.mjs (modelcraft) [--shots <dir>]
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
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
}
try {
  await fresh();
  console.log('== plants: LD.1 Starter library › Plants');
  await page.waitForSelector('[data-starter]');
  await page.click('[data-starter]');
  await page.waitForSelector('[data-plants] button', { timeout: 20000 });
  const n = (await page.$$('[data-plants] button')).length;
  ok(n === 48, 'the Plants section lists the first 48 species: ' + n);
  await page.fill('[data-plant-search]', 'quercus');
  await page.waitForTimeout(300);
  const names = await page.$$eval('[data-plants] button', (bs) => bs.map((b) => b.title));
  ok(names.length > 0 && names.length < 48 && names.every((x) => /quercus/i.test(x)), 'search by botanical name narrows it: ' + names.length, names.join(' | '));
  const key = await page.getAttribute('[data-plants] button >> nth=0', 'data-starter');
  await page.click('[data-plants] button >> nth=0');
  await page.waitForFunction(() => window.modelcraft.tools.name === 'place', null, { timeout: 10000 });
  const d = await page.evaluate((k) => { const mc = window.modelcraft, def = [...mc.model.defs.values()].find((x) => x.kind === 'component' && x.starter === k); return def ? { parts: def.insts.size, name: def.name } : null; }, key);
  ok(d && d.parts > 0, 'picking one builds its component and starts placing: ' + JSON.stringify(d));
  await shot(page, 'plants-mc-01');
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
