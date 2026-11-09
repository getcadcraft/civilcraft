#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wallsquare.mjs — 0.9 FX.22 in the lab, headless: the report's steps (a rectangle of walls, the centre grip dragged
 * off square), Ctrl for a free move, Square up, the angle field, room size and length from the faces, a typed move, a distance
 * typed while the grip is held; each one undo step.
 *   node tools/bimcraft-test/browser-wallsquare.mjs [--shots <dir>]        run as root (test admin session, never the shared login)
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimwsq'], { encoding: 'utf8' }));
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
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Square'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[0, 0], [5000, 0], [5000, 3000], [0, 3000], [0, 0]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  let W0 = await walls();
  ok(W0.length === 4 && square(W0), 'a rectangle of four walls', W0);
  await shot('1-room');

  console.log('== the report: the centre grip dragged off square');
  await pickSouth();
  await gripDrag([2500, 0], [2900, -500]);
  let W = await walls();
  ok(square(W), 'the room stays square', W.map(dirMod));
  ok(joinedUp(W), 'every corner still joins');
  const s1 = south(W);
  ok(Math.abs(s1.a[1] + 500) < 11 && Math.abs(Math.min(s1.a[0], s1.b[0])) < 0.01 && Math.abs(Math.max(s1.a[0], s1.b[0]) - 5000) < 0.01, 'the wall moved square only: down 500, none of the 400 sideways', s1);
  await shot('2-square-move');
  await undo();
  ok(JSON.stringify(await walls()) === JSON.stringify(W0), 'one undo puts all the walls back');

  console.log('== Ctrl: a free move');
  await pickSouth();
  await gripDrag([2500, 0], [2900, -500], { ctrl: true });
  W = await walls();
  ok(!square(W), 'with Ctrl the angle breaks, as it did', W.map(dirMod));
  await shot('3-free-skewed');

  console.log('== Square up brings it back');
  await page.waitForSelector('[data-mp-square]');
  await page.click('[data-mp-square]'); await settled();
  W = await walls();
  ok(square(W), 'Square up: every wall at a right angle', W.map(dirMod));
  ok(joinedUp(W), 'every corner still joins');
  await shot('4-squared-up');
  await page.click('[data-mp-square]'); await page.waitForTimeout(200);
  ok(/already square/.test(await page.textContent('[data-status]')), 'pressed again: they are already square');
  await undo();
  ok(!square(await walls()), 'one undo: skewed again');

  console.log('== the angle field');
  const W2 = await walls(), tilted = W2.find((w) => dirMod(w) > 0.01 && Math.abs(w.a[0] - w.b[0]) < 2000);
  await page.evaluate((g) => { const s = window.bimcraftPlan.state, x = s.data.walls.find((w) => w.guid === g); window.bimcraftComforts?.api?.host.select([window.bimcraftComforts.api.kb() + x.id]); }, tilted.guid);
  await page.waitForSelector('[data-mp-angle]');
  const a0 = parseFloat(await page.inputValue('[data-mp-angle]'));
  ok(a0 > 80 && a0 < 100 && a0 !== 90, 'it reads the angle to the joined wall (' + a0 + ')');
  await setField('[data-mp-angle]', '90');
  await page.waitForSelector('[data-mp-angle]');
  ok(parseFloat(await page.inputValue('[data-mp-angle]')) === 90, 'typed 90: it reads 90');
  ok(joinedUp(await walls()), 'corners still join');
  await undo();
  await undo();
  ok(JSON.stringify(await walls()) === JSON.stringify(W0), 'undo back to the start');

  console.log('== size from the faces');
  await pickSouth();
  const t = W0[0].t;
  ok(await page.inputValue('[data-mp-from]') === 'center', 'Measure from starts on the centre line');
  ok(parseFloat(await page.inputValue('[data-mp-len]')) === 5000 && parseFloat(await page.inputValue('[data-mp-room]')) === 3000, 'from the centre: 5000 long, room 3000');
  await page.selectOption('[data-mp-from]', 'inside'); await page.waitForTimeout(150);
  ok(Math.abs(parseFloat(await page.inputValue('[data-mp-len]')) - (5000 - t)) <= 1 && Math.abs(parseFloat(await page.inputValue('[data-mp-room]')) - (3000 - t)) <= 1, 'inside: both less one wall thickness');
  await shot('5-from-inside');
  await setField('[data-mp-room]', '4000');
  W = await walls();
  ok(square(W) && joinedUp(W), 'Room size 4000: still square, still joined');
  ok(Math.abs(Math.max(...W.flatMap((w) => [w.a[1], w.b[1]])) - Math.min(...W.flatMap((w) => [w.a[1], w.b[1]])) - (4000 + t)) < 0.01, 'the room is 4000 inside', W);
  await page.waitForSelector('[data-mp-room]');
  await page.selectOption('[data-mp-from]', 'outside'); await page.waitForTimeout(150);
  ok(Math.abs(parseFloat(await page.inputValue('[data-mp-room]')) - (4000 + 2 * t)) <= 1, 'outside: 4000 and two thicknesses');
  await setField('[data-mp-len]', '6000');
  W = await walls();
  const xs = W.flatMap((w) => [w.a[0], w.b[0]]);
  ok(square(W) && joinedUp(W) && Math.abs(Math.max(...xs) - Math.min(...xs) - (6000 - t)) < 0.01, 'Length 6000 outside: the end wall moves, still square', W);
  await shot('6-sized');
  await undo(); await undo();
  ok(JSON.stringify(await walls()) === JSON.stringify(W0), 'two undos');
  await page.selectOption('[data-mp-from]', 'center').catch(() => {});

  console.log('== a typed move');
  await pickSouth();
  await page.selectOption('[data-mp-from]', 'center'); await page.waitForTimeout(150);
  await setField('[data-mp-move]', '250');
  W = await walls();
  ok(square(W) && Math.abs(Math.abs(south(W).a[1]) - 250) < 0.01, 'Move square 250', south(W));
  await undo();

  console.log('== a distance typed while the grip is held');
  await pickSouth();
  await gripDrag([2500, 0], [2600, -400], { hold: true });
  await page.keyboard.type('1000');
  await page.waitForTimeout(100);
  await shot('7-typing');
  await page.keyboard.press('Enter');
  await page.mouse.up(); await settled();
  W = await walls();
  ok(square(W) && Math.abs(Math.min(...W.flatMap((w) => [w.a[1], w.b[1]])) + 1000) < 0.01, 'typed 1000, Enter: exactly 1000, the way it was dragged', W);
  await undo();
  await pickSouth();
  await gripDrag([2500, 0], [2600, -400], { hold: true });
  await page.keyboard.type('77'); await page.keyboard.press('Escape');
  await page.mouse.up(); await settled();
  ok(JSON.stringify(await walls()) === JSON.stringify(W0), 'Esc: nothing moved');
  await pickSouth();
  await gripDrag([2500, 0], [2600, -400], { hold: true });
  await page.keyboard.type('600');
  await page.mouse.up(); await settled();
  W = await walls();
  ok(Math.abs(Math.min(...W.flatMap((w) => [w.a[1], w.b[1]])) + 600) < 0.01, 'typed 600, let go: it uses the 600', W);
  await undo();

  console.log('== Shift on an end grip');
  await pickSouth();
  const [ax, ay] = await at(5000, 0), [bx, by] = await at(6500, -80);
  await page.mouse.move(ax, ay); await page.mouse.down(); await page.keyboard.down('Shift');
  await page.mouse.move(bx, by, { steps: 6 }); await page.mouse.up(); await page.keyboard.up('Shift'); await settled();
  W = await walls();
  ok(W.some((w) => Math.abs(w.a[1] - w.b[1]) < 0.01 && Math.max(w.a[0], w.b[0]) > 5300), 'Shift: straight along the axis', W);
  ok(problems.length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) { fail++; console.log('  FAIL ' + e.message); console.log(problems.slice(0, 4)); await shot('zz-error'); }
await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
