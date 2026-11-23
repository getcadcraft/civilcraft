#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx0101-inbox.mjs — the click-through for 0.10.1 inbox fixes in CadCraft's lab build, headless: ARRAY takes P (FIX-0101-ARRAY-P) and
 * the GRID command draws the drawing's own spacing with every Nth line major (FIX-0101-GRID-SPEC). Engines: bin/test-cadcraft.mjs.
 *
 *   node tools/cadcraft-test/browser-fx0101-inbox.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin). Cached
 * Playwright Chromium. What it proves that Node cannot: the page loads with the new module, P is taken at the real command line, and the
 * canvas really shows a minor and a major grid line where the spacing says (pixels read back).
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
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.removeItem('cadcraft.arrays.assoc'); } catch {} });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
const cc = (fn, arg) => page.evaluate(fn, arg);
const esc = async () => { await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };
/** The colour the drawing canvas shows at a world point: [r, g, b, a]. */
const pixel = (x, y) => page.evaluate(([x, y]) => {
  const v = window.cadcraft.view, s = v.toScreen(x, y), d = v.dpr || 1;
  return [...v.base.getContext('2d').getImageData(Math.round((s.x + v.x0) * d), Math.round((s.y + v.y0) * d), 1, 1).data];
}, [x, y]);
const settle = () => page.waitForTimeout(350);

try {
  console.log('\n== the page');
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);

  console.log('\n== ARRAY: a lone P is polar');
  await cc(() => { const d = window.cadcraft.doc; d.meta.units = 'millimeters'; d.change('fixture', () => d.add({ type: 'line', x1: 0, y1: 0, x2: 100, y2: 0 })); window.cadcraft.host.zoomWindow({ x: -300, y: -300 }, { x: 600, y: 300 }); });
  await settle();
  await typeCmd('ARRAY'); await typeCmd('ALL'); await typeCmd(''); await typeCmd('P');
  const prompt = await page.evaluate(() => document.querySelector('[data-prompt]')?.textContent || document.body.textContent.slice(-400));
  ok(/center point of array/i.test(prompt + (await history()).slice(-300)), 'P at "Enter array type" goes on to the centre point', (await history()).slice(-200));
  await typeCmd('0,0'); await typeCmd('');
  ok(await cc(() => window.cadcraft.doc.count() >= 6), 'six polar copies are made', String(await cc(() => window.cadcraft.doc.count())));

  console.log('\n== GRID: the drawing\'s own spacing and major lines');
  await cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of d.all()) d.remove(e.id); }); window.cadcraft.host.zoomWindow({ x: -50, y: -50 }, { x: 450, y: 250 }); });
  await settle();
  await typeCmd('GRID'); await typeCmd('50');
  await typeCmd('GRID'); await typeCmd('M'); await typeCmd('4');
  await settle();
  const g = await cc(() => ({ meta: window.cadcraft.doc.meta.grid, step: window.cadcraft.view.gridStep }));
  ok(g.meta && g.meta.step === 50 && g.meta.major === 4 && g.step === 50, 'GRID 50, Major 4: kept in the drawing and used by the view', JSON.stringify(g));
  // a grid line at x = 50 (minor, faint), x = 200 (major: 4 x 50, solid), and none at x = 75
  const alphaAt = async (x, y) => (await pixel(x, y))[3];
  const bg = await pixel(75, 20);
  const minor = await pixel(50, 20), major = await pixel(200, 20);
  const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]);
  ok(dist(minor, bg) > 6 && dist(major, bg) > 6, 'the canvas shows grid lines where the spacing says (x = 50 and x = 200) and none between', JSON.stringify({ bg, minor, major }));
  ok(dist(major, bg) > dist(minor, bg), 'the major line (x = 200, every 4th) is stronger than the minor one (x = 50)', JSON.stringify({ minor, major }));
  await shot('fx0101-grid');
  await typeCmd('GRID'); await typeCmd('A');
  ok(await cc(() => !window.cadcraft.doc.meta.grid), 'GRID Auto clears it');
  if (problems.length) console.log('  (console errors seen in all: ' + problems.length + ' — first: ' + problems[0].slice(0, 200) + ')');
  ok(problems.length === 0, 'no console errors or page errors', problems.slice(0, 3).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL the run stopped: ' + (err?.stack || err));
  console.log('  history: ' + (await history().catch(() => '')).slice(-400));
  if (problems.length) console.log('  ' + problems.slice(0, 8).join('\n  '));
  await shot('fx0101-stopped');
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
