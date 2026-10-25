#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-live.mjs — 0.7 RT.3 (session realtime's hook, bim-07): BimCraft's Live view button, headless.
 *   node tools/bimcraft-test/browser-live.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimlive; disabled at the end).
 *   a small house; the toolbar has Live view and its new-window button; the button opens the live view beside the 3D view (rt/ from ModelCraft's copy,
 *   adapter rt/rt-bim.js), it says something, the 3D view still works, closing it leaves no error; `window.bimcraftRt` for tests. Any console error fails.
 */
/**
 * browser-live.mjs — 0.7 RT.3 (session realtime's hook, bim-07): BimCraft's Live view button, headless.
 *   node tools/bimcraft-test/browser-live.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimlive; disabled at the end).
 *   start screen and New building say what is true (doors and windows exist; start a new building); the level height starts in the
 *   chosen units; a laptop-sized stage starts with the plan alone; typed walls far from the first view bring the plan back into view;
 *   a house (walls, partition, door, windows, floor, ceiling, roof) → doors schedule, plan PDF, Save as IFC; Copy this level… to a
 *   new level on top (walls, openings, floor and ceiling; one Undo). Fails on any console error.
 */
/**
 * browser-live.mjs — 0.7 RT.3 (session realtime's hook, bim-07): BimCraft's Live view button, headless.
 *   node tools/bimcraft-test/browser-live.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimlive; disabled at the end).
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimlive'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
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
const typed = async (v) => { await page.evaluate((x) => window.bimcraftPlan.typed(x), v); await settled(); };
const click = async (p) => { await page.evaluate((x) => window.bimcraftPlan.click(x), p); await settled(); };
const elementsIn3d = () => page.evaluate(() => document.querySelector('[data-canvas]').viewer.allKeys().size);

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Live test'); await page.fill('[data-new-levels]', '1');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Live test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await page.click('[data-mtool="wall"]');
  await click([0, 0]);
  for (const pt of ['6000,0', '6000,4000', '0,4000', '0,0']) await typed(pt);
  await page.keyboard.press('Escape');
  ok(await page.locator('[data-live-open]').count() === 1 && await page.locator('[data-live-window]').count() === 1, 'the toolbar has Live view and Live view in a new window');
  ok(await page.evaluate(() => typeof window.bimcraftRt?.open === 'function'), 'window.bimcraftRt is there for tests');
  await page.click('[data-live-open]');
  await page.waitForSelector('.rt-live', { timeout: 60000 });
  ok(true, 'the live view opens');
  await page.waitForTimeout(2500);
  const live = await page.evaluate(() => { const e = document.querySelector('.rt-live'); return { text: e.innerText.slice(0, 160), canvases: e.querySelectorAll('canvas').length, view: !!window.bimcraftRt.view }; });
  ok(live.view && live.canvases >= 1, 'it has a picture area (' + live.canvases + ' canvas) and the handle ' + JSON.stringify(live.text.replace(/\s+/g, ' ')));
  await shot(page, 'live-01');
  const before = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.allKeys().size);
  ok(before >= 4, 'the 3D view still has the four walls (' + before + ')');
  await page.evaluate(() => window.bimcraftRt.view?.close?.());
  await page.waitForTimeout(500);
  ok(await page.locator('.rt-live').count() === 0, 'closing it removes it');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimwalls'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
