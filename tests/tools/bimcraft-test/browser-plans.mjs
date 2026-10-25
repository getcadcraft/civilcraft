#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plans.mjs — BimCraft's walls from a set of plans (0.7 DC.116, session `trace`) in the lab, headless, with real clicks.
 *   node tools/bimcraft-test/browser-plans.mjs [--shots <dir>] [--only vector,raster,scan]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimplans). Fails on any console error.
 * Fixtures: fixtures/raster/ (made once). One section per kind of source:
 *   vector  a vector PDF of two pages: page 1 → Level 1, page 2 → a new level; 1 : 50; one undo step; the pages stay as underlays
 *   raster  a PDF whose pages are pictures: drawn by pdf.js, traced
 *   scan    a crooked, speckled scan: squared, scale from two picked points and a typed distance
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimplans'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
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


const FX = path.join(REPO, 'fixtures/raster');
const open = async (file) => {
  await page.click('[data-res-tools] summary');
  await page.click('[data-trace-open]');
  await page.waitForSelector('[data-trace-dialog][open]');
  await page.setInputFiles('[data-trace-file]', { name: file, mimeType: file.endsWith('.pdf') ? 'application/pdf' : 'image/png', buffer: fs.readFileSync(path.join(FX, file)) });
  await page.waitForSelector('[data-plans-make]', { timeout: 20000 }).catch(async (e) => { console.log('DIALOG: ' + (await page.textContent('[data-trace-body]').catch(() => '?')).slice(0, 300) + ' | problems: ' + problems.slice(-3).join(' | ')); throw e; });
};
const counts = () => page.textContent('[data-plans-count]');
const waitCount = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-plans-count]')?.textContent || ''), re.source, { timeout: 60000 });
const model = () => page.evaluate(() => { const d = window.bimcraftPlan.state.data; return { walls: d.walls.length, levels: d.levels.length, ops: d.openings.length, doors: d.openings.filter((o) => o.kind === 'door').length, windows: d.openings.filter((o) => o.kind === 'window').length, spaces: d.derived.spaces.length, under: window.bimcraftTrace.state.underlays.length }; });

try {
  await fresh();
  const totalWalls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.length);

  if (want('vector')) {
    console.log('== vector: a vector PDF of two pages');
    await newBuilding('Plans', 1, 3000);
    await open('plan-vector.pdf');
    ok(await page.locator('[data-plans-pages] li').count() === 2, 'two pages are listed, with what each is');
    ok((await page.textContent('[data-plans-pages]')).includes('line work'), 'both are line work');
    ok(await page.inputValue('[data-plans-page-level="1"]') !== 'new' && await page.inputValue('[data-plans-page-level="2"]') === 'new', 'page 1 is for Level 1, page 2 for a new level');
    await page.fill('[data-plans-ratio]', '50');
    await waitCount(/^Makes 11 walls, 5 doors and 5 windows on 2 levels\./);
    ok(true, 'at 1 : 50 it will make 11 walls, 5 doors and 5 windows on 2 levels: ' + await counts());
    await shot(page, 'plans-01-dialog');
    await page.click('[data-plans-make]');
    await settled();
    const m = await model();
    ok(m.walls === 11 && m.levels === 2 && m.ops === 10 && m.doors === 5 && m.windows === 5, 'made: ' + JSON.stringify(m));
    await shot(page, 'plans-02-made');
    ok(m.under === 2, 'both pages stay as underlays (' + m.under + ')');
    await page.mouse.move(10, 10);
    await page.keyboard.press('Control+z');
    await settled();
    const m2 = await model();
    ok(m2.walls === 0 && m2.levels === 1 && m2.under === 0, 'one Ctrl+Z takes all of it back: ' + JSON.stringify(m2));
    await page.keyboard.press('Control+y');
    await settled();
    ok((await model()).walls === 11, 'and one Ctrl+Y makes it again');
  }

  if (want('raster')) {
    console.log('== raster: a PDF whose pages are pictures');
    await fresh();
    await newBuilding('Plans R', 2, 3000);
    await open('plan-raster.pdf');
    ok((await page.textContent('[data-plans-pages]')).includes('a picture (traced)'), 'the pages are named as pictures');
    ok(await page.inputValue('[data-plans-page-level="2"]') !== 'new', 'two levels: page 2 is for Level 2');
    await page.fill('[data-plans-ratio]', '50');
    await waitCount(/^Makes 11 walls, 5 doors and 5 windows on 2 levels\./);
    ok(true, 'drawn by pdf.js and traced: 11 walls, 5 doors and 5 windows: ' + await counts());
    await page.click('[data-plans-make]');
    await settled();
    const m = await model();
    ok(m.walls === 11 && m.ops === 10 && m.levels === 2 && m.spaces >= 4, 'made, with rooms from the closed loops of walls: ' + JSON.stringify(m));
    await shot(page, 'plans-03-raster');
  }

  if (want('scan')) {
    console.log('== scan: a crooked, speckled scan, the scale from two picked points');
    await fresh();
    await newBuilding('Plans S', 1, 3000);
    await open('plan-scan.png');
    ok(await page.inputValue('[data-plans-scale-mode]') === 'picks', 'a scan has no paper size: the scale comes from a distance you know');
    const truthW = 12250;
    // the two ends of the longest level line in the squared scan (the outer wall's face), found from the traced page
    await page.waitForFunction(() => !!window.bimcraftPlans.state.view, null, { timeout: 60000 });
    const ends = await page.evaluate(() => {
      const R = window.bimcraftPlans.state, nat = [...R.built.values()][0];
      let best = null;
      for (const s of nat.parts.segs) { const L = Math.hypot(s[2] - s[0], s[3] - s[1]); if (Math.abs(s[1] - s[3]) < 1e-6 && (!best || L > best.L)) best = { L, s }; }
      return { a: [best.s[0], best.s[1]], b: [best.s[2], best.s[3]], k: R.view.k, H: R.view.H };
    });
    const box = await page.locator('[data-plans-preview]').boundingBox();
    const cv = await page.evaluate(() => { const c = document.querySelector('[data-plans-preview]'); return { w: c.width, h: c.height }; });
    const toPage = (p) => [box.x + p[0] * ends.k * (box.width / cv.w), box.y + (ends.H - p[1]) * ends.k * (box.height / cv.h)];
    const [ax, ay] = toPage(ends.a), [bx, by] = toPage(ends.b);
    await page.mouse.click(ax, ay);
    await page.mouse.click(bx, by);
    await page.fill('[data-plans-dist]', String(truthW));
    await waitCount(/^Makes 6 walls, 3 doors and 2 windows on 1 levels\./);
    ok(true, 'two clicks and 12250 mm: 6 walls, 3 doors and 2 windows: ' + await counts());
    ok(/squared first \(1\.7\d?°\)/.test(await counts()), 'it says the scan was squared first (about 1.7°)');
    await page.click('[data-plans-make]');
    await settled();
    const m = await model();
    ok(m.walls === 6 && m.ops === 5 && m.under === 1 && m.spaces >= 3, 'made: ' + JSON.stringify(m));
    const dims = await page.evaluate(() => { const w = window.bimcraftPlan.state.data.walls; const xs = w.flatMap((q) => [q.a[0], q.b[0]]), ys = w.flatMap((q) => [q.a[1], q.b[1]]); return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }; });
    ok(Math.abs(dims.w - 12000) < 150 && Math.abs(dims.h - 8000) < 150, 'the building is 12 × 8 m between wall centre lines (' + Math.round(dims.w) + ' × ' + Math.round(dims.h) + ' mm)');
    await shot(page, 'plans-04-scan');
  }

  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimplans']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
