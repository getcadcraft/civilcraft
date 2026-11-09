#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wallshape.mjs — 0.9 WT.6 in the lab, headless: one wall, its Properties' Shape part: a gable profile typed in the
 * Profile dialog (the 3D body grows to 4500), Undo / Redo, a wall opening (a gap in the plan), a double slant, the attach lists.
 *   node tools/bimcraft-test/browser-wallshape.mjs [--shots <dir>]        run as root (test admin session, never the shared login)
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
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwshape'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, a: w.a, b: w.b, t: w.t, len: w.len })));
const dirMod = (w) => { const d = Math.atan2(w.b[1] - w.a[1], w.b[0] - w.a[0]) * 180 / Math.PI, m = ((d % 90) + 90) % 90; return Math.min(m, 90 - m); };
const square = (W) => W.every((w) => dirMod(w) < 0.01);
const joinedUp = (W) => W.every((w) => [w.a, w.b].every((p) => W.some((x) => x.guid !== w.guid && (Math.hypot(x.a[0] - p[0], x.a[1] - p[1]) < 1 || Math.hypot(x.b[0] - p[0], x.b[1] - p[1]) < 1))));
const undo = async () => { await page.click('[data-act="undo"]'); await settled(); };
const setField = async (sel, v) => { await page.fill(sel, v); await page.press(sel, 'Enter'); await settled(); };
const pickSouth = async () => { await page.click('[data-mtool="select"]'); await settled(); await planClick(2500, 0); await page.waitForSelector('[data-mp-square]'); };
/** Press on the wall's middle grip, drag there; options: ctrl, keep the button down. */
async function gripDrag(from, to, { ctrl = false, hold = false } = {}) {
  const [ax, ay] = await at(...from), [bx, by] = await at(...to);
  await page.mouse.move(ax, ay); await page.mouse.down();
  if (ctrl) await page.keyboard.down('Control');
  await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 });
  if (!hold) { await page.mouse.up(); if (ctrl) await page.keyboard.up('Control'); await settled(); }
}
const south = (W) => W.find((w) => Math.abs(w.a[1] + w.b[1]) / 2 < Math.abs(w.a[0] + w.b[0]) && Math.abs(w.a[1] - w.b[1]) < 1000 && Math.min(w.a[1], w.b[1]) < 1500);
const height3d = async (id) => page.evaluate((id) => { const S = window.bimcraftWallShape, b = S.bounds([S.keyOf(id)]); return b ? b.max.map((v, i) => v - b.min[i]) : null; }, id);
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Shape'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[0, 0], [5000, 0]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  let W = await walls();
  ok(W.length === 1, 'one wall drawn', W.length);
  const id = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].id);
  const d0 = await height3d(id);
  ok(Array.isArray(d0), 'the wall is in the 3D view', d0);
  await page.click('[data-mtool="select"]'); await settled();
  await planClick(2500, 0);
  await page.waitForSelector('[data-ws-profile]', { timeout: 15000 });
  ok(await page.$('[data-ws-attachtop]') && await page.$('[data-ws-slant]') && await page.$('[data-ws-addopen]'), 'Properties has the Shape part: attach, slant, profile, openings');
  await shot('1-props');

  console.log('== a gable profile typed in the dialog');
  await page.click('[data-ws-profile]');
  await page.waitForSelector('[data-ws-pdialog]');
  await page.click('[data-ws-paddrow="top"]');
  const rows = await page.$$('[data-ws-prow="top"]');
  ok(rows.length === 3, 'three rows in the top line', rows.length);
  await rows[2].$eval('[data-ws-ps]', (i) => { i.value = '2500'; });
  await rows[2].$eval('[data-ws-pz]', (i) => { i.value = '4500'; });
  await shot('2-profile');
  await page.click('[data-ws-psave]'); await settled();
  await page.waitForTimeout(500);
  const sh = await page.evaluate(() => { const S = window.bimcraftWallShape, w = window.bimcraftPlan.state.data.walls[0]; return S.readShape(w); });
  ok(sh.profile?.top?.length === 3 && sh.profile.top[1][1] === 4500, 'the profile is stored', JSON.stringify(sh.profile));
  const d1 = await height3d(id);
  const k = d0.map((v, i) => d1[i] / v), grew = k.findIndex((r) => Math.abs(r - 1.5) < 0.02);
  ok(grew >= 0, 'the 3D body is 1.5 times as tall (3000 → 4500): the brep is drawn', JSON.stringify(k));
  await shot('3-gable');
  await undo();
  const d2 = await height3d(id);
  ok(d2 && Math.abs(d2[grew] / d0[grew] - 1) < 0.02, 'one undo: back to 3000', JSON.stringify(d2));
  await page.click('[data-act="redo"]'); await settled();

  console.log('== a wall opening');
  await planClick(2500, 0); await page.waitForSelector('[data-ws-addopen]');
  await page.click('[data-ws-addopen]'); await settled();
  const ops = await page.evaluate(() => window.bimcraftWallShape.readWallOpenings());
  ok(ops.length === 1 && Math.abs(ops[0].width - 900) < 0.5, 'one opening, 900 wide', JSON.stringify(ops.map((o) => [o.offset, o.width, o.height])));
  const pieces = await page.evaluate(() => window.bimcraftPlan.view.scene.walls.map((r) => r.pieces.length));
  ok(pieces[0] === 2, 'the plan shows a gap: two pieces', JSON.stringify(pieces));
  await planClick(500, 0); await page.waitForSelector('[data-ws-opening]');
  await page.fill('[data-ws-ooff]', '400'); await page.press('[data-ws-ooff]', 'Enter'); await settled();
  ok(Math.abs((await page.evaluate(() => window.bimcraftWallShape.readWallOpenings()))[0].offset - 400) < 0.5, 'its offset typed in Properties: 400');
  await shot('4-opening');

  console.log('== a double slant');
  await planClick(4500, 0); await page.waitForSelector('[data-ws-slant]');
  await page.selectOption('[data-ws-slant]', 'double');
  await page.fill('[data-ws-slantl]', '5'); await page.fill('[data-ws-slantr]', '-5'); await page.press('[data-ws-slantr]', 'Enter'); await settled();
  const sh2 = await page.evaluate(() => window.bimcraftWallShape.readShape(window.bimcraftPlan.state.data.walls[0]));
  ok(JSON.stringify(sh2.slant) === '[5,-5]', 'slant stored as left 5°, right -5°', JSON.stringify(sh2.slant));
  await shot('5-slant');
  const opts = await page.$$eval('[data-ws-attachtop] option', (o) => o.length);
  ok(opts === 1, 'no roof or slab yet: the attach list offers its own height only', opts);
  ok(problems.length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); await shot('zz-error'); }
await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
