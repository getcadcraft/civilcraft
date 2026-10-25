#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bundle.mjs — 0.7 BIM-BUNDLE-OPEN in the lab, headless.
 *   node tools/bimcraft-test/browser-bundle.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimbundle; disabled at the end).
 *   a folder holding the sample project bundle: the folder report lists it and its name opens the bundle; the bundle's layouts offer
 *   "Open in <app>" (the PDF to the markup app, the DWG to the drafting app) and a click opens that app in a new tab with the file
 *   waiting. Sample: testfiles/archicad-bundle (node tools/archicad-bundle/make-sample.mjs). Fails on any console error.
 */
/**
 * browser-bundle.mjs — 0.7 BIM-BUNDLE-OPEN in the lab, headless.
 *   node tools/bimcraft-test/browser-bundle.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimbundle; disabled at the end).
 *   a three-level building; the Wall tool's "up to" list offers Level 3; walls drawn on Level 1 up to Level 3 are 6000 tall,
 *   show in Level 2's plan as through walls (not picked), Properties says which levels they run through. Fails on any console error.
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
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimbundle'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');

/** The plan: page position of a plan point (mm). */
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
/** Wait until the model has settled (no reload running, nothing queued). */
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a.map(Math.round), b: w.b.map(Math.round), t: Math.round(w.t * 100) / 100, h: Math.round(w.height), type: w.typeKey, side: w.extSide, storey: w.storey })));
const levels = () => page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ name: l.name, e: Math.round(l.elevation), h: Math.round(l.height) })));
const elementsIn3d = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.allKeys().size);

let dir = null;
const sample = path.join(REPO, '../testfiles/archicad-bundle/FZK-Haus.ccbundle.zip');
try {
  if (!fs.existsSync(sample)) throw new Error('no sample bundle: node tools/archicad-bundle/make-sample.mjs');
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });

  console.log('== a folder with a bundle in it');
  dir = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'bundle-folder-'));
  {
    fs.mkdirSync(path.join(dir, 'Job'));
    fs.copyFileSync(sample, path.join(dir, 'Job', 'FZK-Haus.ccbundle.zip'));
    await page.setInputFiles('[data-folder-input]', path.join(dir, 'Job'));
    await page.waitForSelector('[data-folder-bundles]', { timeout: 30000 });
    ok(true, 'the folder report has a Project bundles section');
    ok(/1 project bundle/.test(await page.textContent('.bc-folder-head')), 'and counts it in the head');
    await shot(page, 'bundle-01-folder');
    await page.click('[data-folder-bundle]');
    await page.waitForSelector('[data-bundle-sec]:not([hidden])', { timeout: 60000 });
    ok(await page.locator('[data-bundle-views] li').count() === 4, 'its name opens the bundle: 4 views');
  }

  console.log('== a layout goes to the app that can work on it');
  const pdfBtn = page.locator('[data-bundle-pdf-hand]').first();
  const dwgBtn = page.locator('[data-bundle-dwg-hand]').first();
  const nPdf = await pdfBtn.count(), nDwg = await dwgBtn.count();
  ok(nPdf + nDwg > 0, 'the layouts offer "Open in <app>" (PDF buttons ' + nPdf + ', DWG buttons ' + nDwg + ')');
  await shot(page, 'bundle-02-layouts');
  if (nPdf) {
    const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 20000 }), pdfBtn.click()]);
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    ok(/\/lab\/markupcraft/.test(popup.url()), 'the PDF opens MarkupCraft in a new tab (' + popup.url().replace(BASE, '') + ')');
    await popup.close();
  }
  if (nDwg) {
    const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 20000 }), dwgBtn.click()]);
    await popup.waitForLoadState('domcontentloaded').catch(() => {});
    ok(/\/lab\/cadcraft/.test(popup.url()), 'the DWG opens CadCraft in a new tab (' + popup.url().replace(BASE, '') + ')');
    await popup.close();
  }
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  await browser.close();
  if (dir) fs.rmSync(dir, { recursive: true, force: true });
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimwalls'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
