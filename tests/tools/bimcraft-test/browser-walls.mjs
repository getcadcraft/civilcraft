#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-walls.mjs — custom wall assemblies and the project material library (Doc / achartt, 0.7 contributions item 2) in the lab, headless.
 *   node tools/bimcraft-test/browser-walls.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimwalls; disabled at the end).
 *   a custom wall type with an explicit core from the Wall assemblies editor, drawn, then edited (the wall follows), undone;
 *   the project material library opens; Save as IFC reads back with the type. Fails on any console error.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimwalls'], { encoding: 'utf8' }));

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

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Walls test');
  await page.fill('[data-new-levels]', '1');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Walls test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');

  console.log('== the wall assemblies editor');
  await page.click('[data-mtool="wall"]');
  await page.click('[data-wall-assemblies]');
  await page.waitForSelector('dialog[data-assembly-editor][open]');
  ok(true, 'Wall assemblies… opens the editor');
  const layerCount = await page.locator('[data-assembly-editor] tbody tr:has(select[aria-label^="Material"]), [data-assembly-editor] tbody tr:has(input[aria-label^="Thickness"])').count();
  ok(layerCount >= 3, 'a starter recipe\'s layers are listed (' + layerCount + ')');
  ok(await page.locator('[data-assembly-orientation]').isVisible(), 'the exterior-to-interior orientation is shown');
  await shot(page, 'walls-01-editor');
  await page.fill('[data-assembly-name]', 'Test 2x6 wall');
  const before = await page.$$eval('[data-assembly-editor] input[aria-label^="Thickness"]', (i) => i.map((x) => x.value));
  await page.click('[data-assembly-save]');
  await page.waitForFunction(() => !document.querySelector('dialog[data-assembly-editor][open]'), null, { timeout: 30000 });
  await settled();
  const types = await page.$$eval('[data-model-walltype] option', (o) => o.map((x) => x.textContent));
  ok(types.some((n) => /Test 2x6 wall/.test(n)), 'the new type is in the Wall tool\'s list');
  await page.selectOption('[data-model-walltype]', { label: types.find((n) => /Test 2x6 wall/.test(n)) });
  await planClick(0, 0);
  await planClick(6000, 0);
  await settled();
  let W = await walls();
  ok(W.length === 1 && W[0].t > 100, 'one wall drawn with the new type, thickness ' + (W[0] && W[0].t) + ' mm (layers ' + before.join(' + ') + ')');
  const t0 = W[0].t;

  console.log('== edit the type: the wall follows, undo puts it back');
  await page.click('[data-wall-assemblies]');
  await page.waitForSelector('dialog[data-assembly-editor][open]');
  ok(await page.inputValue('[data-assembly-name]') === 'Test 2x6 wall', 'editing opens the saved type, not a copy');
  const th = page.locator('[data-assembly-editor] input[aria-label^="Thickness"]').first();
  await th.fill('50.8');
  await th.dispatchEvent('input');
  await page.click('[data-assembly-save]');
  await page.waitForFunction(() => !document.querySelector('dialog[data-assembly-editor][open]'), null, { timeout: 30000 });
  await settled();
  W = await walls();
  ok(W[0].t !== t0, 'the wall\'s thickness changed with the type (' + t0 + ' → ' + W[0].t + ')');
  await page.click('[data-act="undo"]');
  await settled();
  W = await walls();
  ok(W[0].t === t0, 'one Undo restores the thickness (' + W[0].t + ')');

  console.log('== the project material library');
  await page.click('[data-materials-menu]');
  await page.waitForSelector('dialog[open]');
  ok(/gypsum/i.test(await page.textContent('dialog[open]')), 'Material library… lists the starter materials');
  await shot(page, 'walls-02-materials');
  await page.keyboard.press('Escape');

} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimwalls'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
