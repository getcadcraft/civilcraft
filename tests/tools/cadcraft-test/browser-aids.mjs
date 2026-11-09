#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-aids.mjs — 0.9 FX: object-snap list reachable in every layout, Snap to grid (F9), full grid when limits are off.
 *
 *   node tools/cadcraft-test/browser-aids.mjs [--shots <dir>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium, 1440 × 900.
 * Checks: the page carries its language catalog (#cc-lang, lang/en.json) and the command line prints its words,
 * not keys; FILLET (radius, real clicks on two lines, Polyline on a rectangle) and CHAMFER (distances, toolbar
 * button) on the drawing; no console errors. Grows one section per finished item; the last one (0.5 VP.5) is the
 * guard for the sheet tabs on short windows (tab-check.mjs, shared with browser-tabs-sweep.mjs).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeDwg } from '../../lib/dwg/write.js';
import { VERSION_INFO } from '../../lib/dwg/container-write.js';
import { kitchenSink } from '../dwg-test/writer-models.mjs';
import { pageCheck } from './tab-check.mjs';

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
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); } catch {} });   // 0.7 D7.06: the first-drawing tour would sit over the drawing and take the clicks
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

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  const layouts = await page.evaluate(() => { try { return JSON.parse(document.getElementById('cc-workspace').textContent).layouts || []; } catch { return []; } });
  console.log('layouts:', layouts.join(', '));

  console.log('\n== object snap list in every layout');
  for (const id of ['standard', ...layouts]) {
    await page.goto(BASE + '/lab/cadcraft?workspace=' + id, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.cadcraft);
    await page.waitForTimeout(400);
    const sum = page.locator('.cc-snapkinds > summary');
    if (!(await sum.count()) || !(await sum.first().isVisible())) { ok(false, id + ': snap chevron visible'); continue; }
    await sum.first().click();
    await page.waitForTimeout(150);
    const r = await page.evaluate(() => {
      const f = document.querySelector('[data-snap-kinds]'); const b = f.getBoundingClientRect();
      const lab = f.querySelector('label'); const lb = lab.getBoundingClientRect();
      const hit = document.elementFromPoint(lb.left + lb.width / 2, lb.top + lb.height / 2);
      const last = f.querySelector('label:last-child').getBoundingClientRect();
      return { inView: b.top >= 0 && b.left >= 0 && b.bottom <= innerHeight && b.right <= innerWidth, hit: !!hit && f.contains(hit), lastIn: last.bottom <= innerHeight, w: b.width, h: b.height };
    });
    ok(r.w > 50 && r.inView && r.hit && r.lastIn, id + ': object snap list fully visible and clickable', JSON.stringify(r));
    await page.mouse.click(5, 5);
    await page.keyboard.press('Escape');
  }

  console.log('\n== Snap to grid (F9)');
  await page.goto(BASE + '/lab/cadcraft?workspace=standard', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  ok((await page.getAttribute('[data-toggle="gsnap"]', 'aria-pressed')) === 'false', 'Grid snap button starts off');
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('F9');
  ok((await page.getAttribute('[data-toggle="gsnap"]', 'aria-pressed')) === 'true', 'F9 turns it on');
  await typeCmd('ZOOM'); await typeCmd('W'); await typeCmd('0,0'); await typeCmd('200,150');
  await page.keyboard.press('Escape');
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');
  const step = await page.evaluate(() => window.cadcraft.view.gridStep);
  await typeCmd('L');
  const p = await screen(step * 3 + step * 0.3, step * 2 - step * 0.2);
  await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80);
  const p2 = await screen(step * 9 + step * 0.4, step * 5 + step * 0.1);
  await page.mouse.move(p2.x, p2.y); await page.mouse.click(p2.x, p2.y); await page.waitForTimeout(80);
  await typeCmd('');
  await page.keyboard.press('Escape');
  const ent = await all();
  const ln = ent.find((e) => e.type === 'line');
  ok(!!ln && near(ln.x1 / step, Math.round(ln.x1 / step), 1e-6) && near(ln.y1 / step, Math.round(ln.y1 / step), 1e-6) && near(ln.x2 / step, Math.round(ln.x2 / step), 1e-6) && near(ln.x1, step * 3, 1e-6), 'picked points land on the grid', JSON.stringify(ln));

  console.log('\n== grid with the limits OFF');
  await typeCmd('LIMITS'); await typeCmd('OFF');
  await page.keyboard.press('Escape');
  await typeCmd('LIMITS'); await typeCmd('0,0'); await typeCmd('100,100');
  await page.keyboard.press('Escape');
  const lim = await page.evaluate(() => window.cadcraft.doc.meta.limits);
  ok(!!lim && lim.on === false, 'limits set and off', JSON.stringify(lim));
  await typeCmd('ZOOM'); await typeCmd('W'); await typeCmd('-500,-500'); await typeCmd('600,600');
  await page.waitForTimeout(200);
  const px = await page.evaluate(() => { const c = document.querySelector('[data-base]'); const g = c.getContext('2d'); const s = window.cadcraft.view.toScreen(-300, -300); const d = devicePixelRatio; const r = g.getImageData(0, 0, c.width, c.height).data; let n = 0; const x0 = Math.floor((s.x - 60) * d), y0 = Math.floor((s.y - 60) * d); for (let y = Math.max(0, y0); y < Math.min(c.height, y0 + 120 * d); y++) for (let x = Math.max(0, x0); x < Math.min(c.width, x0 + 120 * d); x++) { const i = (y * c.width + x) * 4; if (r[i + 3] && (r[i] !== r[i - 4] || r[i + 1] !== r[i - 3])) n++; } return n; });
  ok(px > 0, 'grid is drawn outside the limits while they are off', 'pixels ' + px);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'grid-limits-off.png') });

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) { fail++; console.log('  FAIL ' + e.message); }
finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {}
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
