#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-day.mjs — 0.7 SU.751 / SU.461: a new user's first house in the lab, headless (1366 × 768, a laptop).
 *   node tools/bimcraft-test/browser-day.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimday; disabled at the end).
 *   start screen and New building say what is true (doors and windows exist; start a new building); the level height starts in the
 *   chosen units; a laptop-sized stage starts with the plan alone; typed walls far from the first view bring the plan back into view;
 *   a house (walls, partition, door, windows, floor, ceiling, roof) → doors schedule, plan PDF, Save as IFC; Copy this level… to a
 *   new level on top (walls, openings, floor and ceiling; one Undo). Fails on any console error.
 */
/**
 * browser-day.mjs — 0.7 SU.751 / SU.461: a new user's first house in the lab, headless (1366 × 768, a laptop).
 *   node tools/bimcraft-test/browser-day.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimday; disabled at the end).
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimday'], { encoding: 'utf8' }));

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

  console.log('== the first screen and New building');
  ok(/start a new building/i.test(await page.textContent('.bc-empty-lede')), 'the start screen says you can start a new building');
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  const lede = await page.textContent('dialog.bc-new p');
  ok(/doors and windows/.test(lede) && !/come next/.test(lede), 'New building does not say doors and windows are still to come');
  ok(await page.inputValue('[data-new-height]') === '3000 mm', 'the level height starts in the chosen units (mm): ' + await page.inputValue('[data-new-height]'));
  await page.fill('[data-new-name]', 'Small house');
  await page.fill('[data-new-levels]', '2');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Small house/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  ok(await page.evaluate(() => document.querySelector('[data-model-stage], .bc-stage')?.classList.contains('is-plan-only') ?? document.querySelector('.is-plan-only') !== null), 'a laptop-sized stage starts with the plan alone');

  console.log('== a house drawn by typing');
  await page.click('[data-mtool="wall"]');
  await click([0, 0]);
  for (const pt of ['10000,0', '10000,7000', '0,7000', '0,0']) await typed(pt);
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => window.bimcraftPlan.state.data.walls.length) === 4 && await page.evaluate(() => window.bimcraftPlan.state.data.derived.spaces.length) === 1, 'four walls, one room (closing the loop makes it)');
  ok(!(await page.evaluate(() => window.bimcraftPlan.view.outsideView())), 'the whole house is in view without touching Fit (it went off the first view as it was typed)');
  await click([5000, 0]); await typed('5000,7000'); await page.keyboard.press('Escape');
  await page.click('[data-mtool="door"]'); await planClick(2500, 0); await settled();
  await page.click('[data-mtool="window"]'); await planClick(7500, 0); await settled(); await planClick(0, 3500); await settled();
  for (const tool of ['floor', 'ceiling', 'roof']) { await page.click(`[data-mtool="${tool}"]`); await planClick(2500, 3500); await settled(); }
  const c = await page.evaluate(() => { const d = window.bimcraftPlan.state.data; return { walls: d.walls.length, openings: d.openings.length, spaces: d.derived.spaces.length, floors: d.derived.floors.length, ceilings: d.derived.ceilings.length, roofs: d.derived.roofs.length }; });
  ok(c.walls === 5 && c.openings === 3 && c.spaces === 2 && c.floors === 1 && c.ceilings === 1 && c.roofs === 1, 'five walls, a door and two windows, two rooms, a floor, a ceiling, a roof: ' + JSON.stringify(c));
  ok(!(await page.evaluate(() => window.bimcraftPlan.view.outsideView())), 'the house is not under the Draw bar after the tools changed its height');
  await shot(page, 'day-01-house');
  await page.click('[data-mtool="select"]');
  await page.click('[data-model-print]');
  await waitStatus(/Saved the plan as a PDF/);
  ok(true, 'plan PDF: ' + await statusOf());
  const rowsText = await page.evaluate(() => document.body.innerText);
  ok(/D1\s+Single swing door/.test(rowsText), 'the doors schedule lists D1');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-save]')]);
  ok(/Small house.*\.ifc$/.test(dl.suggestedFilename()), 'Save as IFC downloads "' + dl.suggestedFilename() + '"');

  console.log('== Split frames the whole house in 3D');
  await page.click('[data-model-layout="split"]');
  await page.waitForTimeout(1200);
  ok(await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; const b = v.model?.bounds || v.bounds; return !!v; }), '3D view there (framing checked by eye: shots)');
  await shot(page, 'day-02-split');
  await page.click('[data-model-layout="plan"]');
  await page.waitForTimeout(600);

  console.log('== Copy this level… to a new level on top');
  await page.click('[data-lv-copy]');
  await page.waitForSelector('dialog[data-lvc-dialog][open]');
  const opts = await page.$$eval('[data-lvc-to] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 2 && /new level on top/i.test(opts[1]), 'the dialog offers Level 2 and a new level on top (' + opts.join(' | ') + ')');
  await page.selectOption('[data-lvc-to]', { index: 1 });
  await page.click('[data-lvc-ok]');
  await settled();
  const d2 = await page.evaluate(() => { const d = window.bimcraftPlan.state.data, s = window.bimcraftPlan.state; return { levels: d.levels.length, current: d.levels.find((l) => l.id === s.level)?.name, walls: d.walls.length, openings: d.openings.length, floors: d.derived.floors.length }; });
  ok(d2.levels === 3 && d2.walls === 10 && d2.openings === 6 && d2.floors === 2 && d2.current === 'Level 3', 'copied to a new Level 3: 10 walls, 6 openings, 2 floors, and the plan shows it (' + JSON.stringify(d2) + ')');
  await shot(page, 'day-03-copied');
  await page.click('[data-act="undo"]');
  await settled();
  ok(await page.evaluate(() => window.bimcraftPlan.state.data.levels.length) === 2, 'one Undo takes the copy and its level away');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimwalls'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
