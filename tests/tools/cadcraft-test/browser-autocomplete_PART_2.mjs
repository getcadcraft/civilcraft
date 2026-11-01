#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-autocomplete_PART_2.mjs — CadCraft drawing autocomplete (0.8 EG.54) on the real page, headless, in the lab.
 *   node tools/cadcraft-test/browser-autocomplete_PART_2.mjs [--shots <dir>] [--big 100000]
 * Run as root (test admin via tools/cadcraft-test/admin.php). Draws studs with real commands, hovers, checks the ghost,
 * Tab (one undo step), Esc, the Off setting, and the cost of a mouse move on a big drawing (rule: keep the cursor smooth).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const history = () => page.textContent('[data-history]');
const all = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ ...e })));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80); };
const fresh = async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd(''); };


const BIG = +(args[args.indexOf('--big') + 1] || 100000);
const ghosts = () => page.evaluate(() => window.cadcraft.view.state.preview.filter((g) => g.auto).length);
const hover = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y, { steps: 2 }); await page.waitForTimeout(60); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');

  console.log('\n== studs: three drawn, the fourth is a ghost');
  for (let i = 0; i < 3; i++) { await typeCmd('L'); await typeCmd(`${i * 400},0`); await typeCmd(`${i * 400},2400`); await typeCmd(''); }
  await typeCmd('ZOOM'); await typeCmd('E');
  await hover(1100, 1200);
  ok(await ghosts() === 1, 'hovering near the next stud shows one ghost');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'autocomplete-01-ghost.png') });
  await hover(0, 1200);
  ok(await ghosts() === 0, 'a cursor far from it shows none');
  await hover(1100, 1200);
  await page.click('[data-cmd-input]'); await page.keyboard.press('Tab'); await page.waitForTimeout(100);
  let es = await all();
  ok(es.length === 4 && near(es[3].x1, 1200) && near(es[3].y2, 2400), 'Tab draws the fourth stud at x = 1200', JSON.stringify(es[3]));
  ok((await history()).length >= 0 && await page.evaluate(() => window.cadcraft.doc.undoStack.at(-1).label === 'Autocomplete'), 'it is one undo step named Autocomplete');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(80);
  ok((await all()).length === 3, 'Ctrl+Z takes it back');

  console.log('\n== Esc dismisses, Off turns it off');
  await hover(1100, 1200); await hover(1105, 1200);
  ok(await ghosts() === 1, 'the ghost is back after the undo');
  await page.keyboard.press('Escape'); await page.waitForTimeout(60);
  ok(await ghosts() === 0, 'Esc dismisses it');
  await hover(1110, 1200);
  ok(await ghosts() === 0, 'it stays dismissed while the drawing is unchanged');
  await typeCmd('AUTOCOMPLETE'); await typeCmd('F');
  ok((await history()).includes('Drawing autocomplete is off.'), 'AUTOCOMPLETE Off says so');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')).autocomplete) === 'off', 'and the setting is kept');
  await typeCmd('AUTOCOMPLETE'); await typeCmd('O');
  await hover(1100, 1200); await hover(1104, 1200);
  ok(await ghosts() === 1, 'On brings the ghost back');

  console.log('\n== a stair of lines');
  await fresh();
  let x = 0, y = 0;
  for (let i = 0; i < 2; i++) { await typeCmd('L'); await typeCmd(`${x},${y}`); await typeCmd(`${x},${y + 175}`); await typeCmd(`${x + 280},${y + 175}`); await typeCmd(''); x += 280; y += 175; }
  await typeCmd('ZOOM'); await typeCmd('E');
  await hover(x + 100, y + 80);
  ok(await ghosts() >= 1, 'a polyline stair of two steps offers the next step');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'autocomplete-02-stair.png') });

  console.log('\n== cost of a mouse move on a big drawing');
  await fresh();
  await page.evaluate((n) => { const d = window.cadcraft.doc; d.change('BIG', () => { for (let i = 0; i < n; i++) d.add({ type: 'line', x1: (i % 500) * 10, y1: Math.floor(i / 500) * 10, x2: (i % 500) * 10 + 7, y2: Math.floor(i / 500) * 10 + 3 }); for (let i = 0; i < 3; i++) d.add({ type: 'line', x1: 9000 + i * 400, y1: 0, x2: 9000 + i * 400, y2: 2400 }); }); }, BIG);
  await typeCmd('ZOOM'); await typeCmd('E');
  const timing = await page.evaluate(() => {
    const c = window.cadcraft, over = document.querySelector('[data-over]'), r = over.getBoundingClientRect();
    const run = (on) => { c.host.setAutocomplete(on); const t0 = performance.now(); const N = 300; for (let i = 0; i < N; i++) over.dispatchEvent(new PointerEvent('pointermove', { clientX: r.left + 200 + (i % 100), clientY: r.top + 300, bubbles: true, pointerType: 'mouse' })); return (performance.now() - t0) / N; };
    run(false); const off = run(false), on = run(true);
    return { off, on, objects: c.doc.count() };
  });
  ok(timing.on - timing.off < 1, `the move costs ${(timing.on - timing.off).toFixed(3)} ms more with autocomplete on (off ${timing.off.toFixed(2)} ms, on ${timing.on.toFixed(2)} ms, ${timing.objects} objects)`);
  console.log('RESULT page pointermove incl. cursor+overlay work, ' + timing.objects + ' objects: off ' + timing.off.toFixed(3) + ' ms, on ' + timing.on.toFixed(3) + ' ms (headless Chromium, SwiftShader, VPS, capped)');

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
