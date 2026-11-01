#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-round2-cad_PART_2.mjs — CadCraft round 2 commands on the real page, headless, in the lab: SKETCHFIX (EG.55), AUTOSHEET (EG.56),
 * DETAILS (EG.57), GRIDMOVE (EG.35), AUTODIM (EG.20). Each is typed in the command line; one undo step each.
 *   node tools/cadcraft-test/browser-round2-cad_PART_2.mjs [--shots <dir>]
 * Run as root (test admin via tools/cadcraft-test/admin.php).
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



const count = () => page.evaluate(() => window.cadcraft.doc.count());
const undo = async () => { await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.doc.undo()); await page.waitForTimeout(60); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.meta.units = 'millimeters'; });

  console.log('\n== AUTODIM: a room with a gap in one wall');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('room', () => { for (const [a, b, c, e] of [[0, 0, 2000, 0], [3000, 0, 8000, 0], [8000, 0, 8000, 6000], [8000, 6000, 0, 6000], [0, 6000, 0, 0]]) d.add({ type: 'line', layer: '0', x1: a, y1: b, x2: c, y2: e }); }); });
  await page.evaluate(() => window.cadcraft.host.zoomWindow?.({ x: -1500, y: -2500 }, { x: 9500, y: 8000 }));
  const n0 = await count();
  await typeCmd('ADIM'); await typeCmd('R');
  const n1 = await count();
  ok(n1 > n0 + 3, `AUTODIM drew ${n1 - n0} dimensions`);
  ok((await history()).includes('dimension(s) made'), 'the command line says what it made');
  await undo(); ok((await count()) === n0, 'one undo step takes them all back');
  await typeCmd('ADIM'); await typeCmd('R'); await typeCmd('ADIM'); await typeCmd('R');
  ok((await history()).includes('Nothing new to dimension'), 'a second run makes nothing new');
  await undo();

  console.log('\n== AUTOSHEET: the room becomes a sheet');
  const L0 = await page.evaluate(() => window.cadcraft.doc.layouts.length);
  await typeCmd('ASH'); await typeCmd('R');
  const L1 = await page.evaluate(() => window.cadcraft.doc.layouts.length);
  ok(L1 === L0 + 1, `a layout was made (${L0} → ${L1})`);
  const vps = await page.evaluate(() => [...window.cadcraft.doc.layout.entities.values()].filter((e) => e.type === 'viewport').length);
  ok(vps >= 1, `with ${vps} viewport(s)`);
  await page.evaluate(() => { const c = window.cadcraft; c.doc.setSpace(null); });
  await undo();
  ok((await page.evaluate(() => window.cadcraft.doc.layouts.length)) === L0, 'one undo step removes the sheet');

  console.log('\n== GRIDMOVE: grid line carries the wall that ends on it');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('grid', () => { d.addLayer({ name: 'A-GRID', color: 1 }); d.add({ type: 'line', layer: 'A-GRID', x1: 8000, y1: -1000, x2: 8000, y2: 7000 }); }); });
  const gid = await page.evaluate(() => [...window.cadcraft.doc.all()].find((e) => e.layer === 'A-GRID').id);
  await page.evaluate(() => window.cadcraft.host.zoomWindow?.({ x: -2500, y: -3500 }, { x: 10500, y: 9000 }));
  await typeCmd('GM');
  const gp = await screen(8000, -800); await page.mouse.move(gp.x, gp.y); await page.mouse.click(gp.x, gp.y); await page.waitForTimeout(80);
  await typeCmd('D'); await typeCmd('-500');
  const moved = await page.evaluate((id) => { const d = window.cadcraft.doc; return { g: d.get(id).x1, walls: d.all().filter((e) => e.layer === '0' && e.type === 'line').map((e) => [e.x1, e.x2]) }; }, gid);
  ok(Math.abs(moved.g - 8500) < 1e-6 || Math.abs(moved.g - 7500) < 1e-6, `the grid line moved to x = ${moved.g}`);
  ok(moved.walls.some((w) => w.includes(moved.g)), 'a wall that ended on it follows');
  await undo(); ok((await page.evaluate((id) => window.cadcraft.doc.get(id).x1, gid)) === 8000, 'one undo step');

  console.log('\n== DETAILS: add a block, list it, find it for a window layer');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('b', () => { d.defineBlock({ name: 'SillFlashing', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 50, y2: 0 }, { type: 'text', layer: '0', x: 0, y: 0, h: 5, rot: 0, s: 'window sill flashing' }] }); d.addLayer({ name: 'A-WINDOW', color: 3 }); d.add({ type: 'line', layer: 'A-WINDOW', x1: 100, y1: 100, x2: 900, y2: 100 }); }); });
  await page.evaluate(() => localStorage.removeItem('cadcraft.details'));
  await typeCmd('DET'); await typeCmd('A'); await typeCmd('SillFlashing');
  ok((await history()).includes('added to the firm'), 'DETAILS Add put the block in the library');
  await typeCmd('DET'); await typeCmd('L');
  ok((await history()).includes('Sill Flashing'), 'DETAILS List shows it');
  const winId = await page.evaluate(() => window.cadcraft.doc.all().find((e) => e.layer === 'A-WINDOW').id);
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), winId);
  await page.waitForTimeout(900);
  const status = await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
  ok(/Sill Flashing/.test(status), 'selecting the window line offers the detail in the status bar: "' + status + '"');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
  // EG.57, while drawing: nothing selected, a finished command leaves a window-layer line as the newest object
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; const d = window.cadcraft.doc; d.change('draw', () => { d.add({ type: 'line', layer: 'A-WINDOW', x1: 0, y1: 100, x2: 900, y2: 100 }); }); });
  await page.waitForTimeout(1500);
  const drawn = await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
  ok(/Sill Flashing/.test(drawn), 'drawing a window line (nothing selected) offers the detail: "' + drawn + '"');
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });
  await page.evaluate(() => { localStorage.setItem('x', '1'); });
  await typeCmd('DET'); await typeCmd('F'); await typeCmd('1'); 
  const n2 = await count(); await clickAt(500, 500);
  ok((await count()) === n2 + 1, 'Find › pick 1 › a point placed the detail as a block reference');
  await undo();
  await page.evaluate(() => localStorage.removeItem('cadcraft.details'));

  console.log('\n== SKETCHFIX: a wobbly rectangle and a wobbly circle with the pen');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('wipe', () => { for (const e of c.doc.all()) c.doc.remove(e.id); }); });
  const wob = (v, s) => v + (Math.sin(v * 0.7) * s);
  const stroke = async (pts) => { const p0 = await screen(pts[0][0], pts[0][1]); await page.mouse.move(p0.x, p0.y); await page.mouse.down(); for (const [x, y] of pts.slice(1)) { const p = await screen(x, y); await page.mouse.move(p.x, p.y, { steps: 2 }); } await page.mouse.up(); await page.waitForTimeout(80); };
  await page.evaluate(() => window.cadcraft.host.zoomWindow?.({ x: -500, y: -500 }, { x: 4500, y: 3500 }));
  await typeCmd('SKF');
  const rect = []; const lerp = (a, b, n) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * i / (n - 1), a[1] + (b[1] - a[1]) * i / (n - 1)]);
  const A = [0, 0], B = [4000, 40], C = [3960, 2500], D = [20, 2540];
  await stroke([...lerp(A, B, 14), ...lerp(B, C, 14).slice(1), ...lerp(C, D, 14).slice(1), ...lerp(D, A, 14).slice(1)].map(([x, y], i) => [wob(x, 25), wob(y, 25)]));
  await typeCmd('');
  const ents = await all();
  const rect4 = ents.find((e) => e.type === 'poly' && e.closed && e.pts.length === 4);
  ok(!!rect4, 'the closed stroke became a 4-sided polyline: ' + JSON.stringify(ents.map((e) => e.type)));
  if (rect4) ok(rect4.pts.every((p, i, a) => Math.abs(p.x - a[(i + 1) % 4].x) < 1e-6 || Math.abs(p.y - a[(i + 1) % 4].y) < 1e-6), 'and its sides are exactly level and plumb');
  ok((await history()).includes('Sketch made precise'), 'the command line says so');
  await undo(); ok((await count()) === 0, 'one undo step');

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
