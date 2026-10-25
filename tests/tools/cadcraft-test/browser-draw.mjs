#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-draw.mjs — CadCraft's 0.4 drawing and editing commands (session cad-draw) in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-draw.mjs [--shots <dir>]
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
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');

  console.log('\n== language catalog');
  const cat = await page.evaluate(() => { const s = document.getElementById('cc-lang'); try { return JSON.parse(s.textContent); } catch { return null; } });
  ok(cat && JSON.stringify(cat).includes('cmd.fillet.first'), 'the page carries the language catalog with CadCraft\'s strings (#cc-lang)');

  console.log('\n== FILLET');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('0,100'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  await typeCmd('F');
  const h0 = await history();
  ok(h0.includes('Current settings: Mode = TRIM') && !h0.includes('cmd.fillet'), 'FILLET prints its settings in words, not keys');
  await typeCmd('R'); await typeCmd('20');
  await clickAt(80, 0); await clickAt(0, 80);
  let es = await all();
  const arc = es.find((e) => e.type === 'arc');
  ok(arc && near(arc.r, 20) && near(arc.cx, 20) && near(arc.cy, 20), 'FILLET R 20 by real clicks: a tangent arc at (20, 20)', JSON.stringify(arc));
  ok(es.filter((e) => e.type === 'line').every((l) => near(Math.min(Math.hypot(l.x1, l.y1), Math.hypot(l.x2, l.y2)), 20)), 'both lines cut back 20 from the corner');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(80);
  ok((await all()).length === 2, 'one Ctrl+Z undoes the fillet');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-01-fillet.png') });

  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,100');
  await typeCmd('ZOOM'); await typeCmd('E');
  await typeCmd('F'); await typeCmd('R'); await typeCmd('10'); await typeCmd('P');
  await clickAt(100, 0);
  es = await all();
  ok(es.length === 1 && es[0].pts.length === 8 && (await history()).includes('4 corners were filleted.'), 'FILLET Polyline rounds all four corners of a rectangle', JSON.stringify(es[0]?.pts));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-02-fillet-poly.png') });

  console.log('\n== CHAMFER');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('0,100'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  const btn = await page.$('[data-cmd="CHAMFER"]');
  ok(btn && (await btn.textContent()).trim() === 'Chamfer', 'a Chamfer button in Modify');
  await btn.click(); await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.cadcraft.engine.running) === 'CHAMFER', 'the button starts CHAMFER');
  await typeCmd('D'); await typeCmd('10'); await typeCmd('20');
  await clickAt(80, 0); await clickAt(0, 80);
  es = await all();
  const ch = es.find((e) => e.type === 'line' && !near(e.x1, e.x2) && !near(e.y1, e.y2));
  ok(es.length === 3 && ch && near(Math.hypot(ch.x2 - ch.x1, ch.y2 - ch.y1), Math.hypot(10, 20)), 'CHAMFER 10 × 20 by real clicks adds the bevel line', JSON.stringify(es));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-03-chamfer.png') });

  console.log('\n== selection: Tab cycling, Fence, Remove');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('C'); await typeCmd('50,30'); await typeCmd('30');   // touches the line at (50, 0)
  await typeCmd('ZOOM'); await typeCmd('E');
  const ids = (await all()).map((e) => e.id);
  const at = await screen(50, 0);
  await page.mouse.move(at.x, at.y); await page.waitForTimeout(60);
  const hover0 = await page.evaluate(() => window.cadcraft.view.state.hover);
  await page.click('[data-cmd-input]'); await page.mouse.move(at.x, at.y); await page.waitForTimeout(60);
  await page.keyboard.press('Tab'); await page.waitForTimeout(60);
  const hover1 = await page.evaluate(() => window.cadcraft.view.state.hover);
  const st = await page.textContent('[data-status]').catch(() => '');
  ok(hover0 && hover1 && hover0 !== hover1 && ids.includes(hover1), 'Tab over two touching objects moves the highlight to the other one', JSON.stringify([hover0, hover1]));
  ok(/2 of 2/.test(st || ''), 'the status bar says which of how many', st);
  await page.mouse.click(at.x, at.y); await page.waitForTimeout(80);
  const sel = await page.evaluate(() => [...window.cadcraft.host.selection]);
  ok(sel.length === 1 && sel[0] === hover1, 'the click selects the object Tab chose', JSON.stringify(sel));
  await page.keyboard.press('Escape');
  await typeCmd('E'); await typeCmd('F'); await typeCmd('20,-10'); await typeCmd('20,10'); await typeCmd(''); await typeCmd('');
  es = await all();
  ok(es.length === 1 && es[0].type === 'circle', 'ERASE with a typed Fence erases the line it crosses');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-04-select.png') });

  console.log('\n== AREA');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('40,25');
  await typeCmd('C'); await typeCmd('100,0'); await typeCmd('10');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-group-menu="View"] summary');
  const areaBtn = await page.$('[data-group-menu="View"] [data-cmd="AREA"]');
  ok(areaBtn && (await areaBtn.textContent()).trim().startsWith('Area'), 'Area in View › More');
  await areaBtn.click(); await page.waitForTimeout(80);
  await typeCmd('A'); await typeCmd('O');
  await clickAt(20, 0); await clickAt(110, 0);
  await typeCmd(''); await typeCmd('');
  const hist = await history();
  ok(hist.includes('Area = 1000, Perimeter = 130') && hist.includes('Total area = 1314.1593'), 'AREA Add: a rectangle and a circle by real clicks, with the running total', hist.slice(-300));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-05-area.png') });

  console.log('\n== units: feet and inches');
  await fresh();
  await page.keyboard.press('Escape');
  ok(await page.$('#cc-cur-lunits') !== null, 'Current settings has a Length format select');
  await page.selectOption('#cc-cur-lunits', '4'); await page.waitForTimeout(120);
  ok(await page.evaluate(() => window.cadcraft.doc.meta.lunits) === 4, 'choosing Architectural sets the drawing\'s format');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('@12\'6",0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  await clickAt(75, 0);
  const lenVal = await page.inputValue('#cc-p-len');
  ok(lenVal === '12\'-6"', 'a line typed as @12\'6",0 shows Length 12\'-6" in Properties', lenVal);
  await page.fill('#cc-p-len', '13\'-1/2"'); await page.press('#cc-p-len', 'Enter'); await page.waitForTimeout(120);
  const ln = (await all())[0];
  ok(near(ln.x2, 156.5), 'typing 13\'-1/2" in Length makes it 156.5 inches', ln.x2);
  const at2 = await screen(24, 0); await page.mouse.move(at2.x, at2.y); await page.waitForTimeout(60);
  const coords = await page.textContent('[data-coords]');
  ok(/'-/.test(coords || ''), 'the status bar shows the pointer in feet and inches', coords);
  await page.keyboard.press('Escape');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-06-units.png') });
  await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');

  console.log('\n== paragraph text in place');
  await fresh();
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('UNITS', () => d.setMeta({ lunits: 2, luprec: 4 })); });
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,100');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-cmd="MTEXT"]'); await page.waitForTimeout(80);
  await clickAt(10, 90);
  await typeCmd('H'); await typeCmd('8');
  await clickAt(150, 60);
  await page.waitForSelector('[data-text-edit]', { timeout: 3000 });
  ok(await page.evaluate(() => document.activeElement?.matches('[data-text-edit]')), 'the editor opens over the drawing with the cursor in it');
  await page.keyboard.type('First paragraph of the note');
  await page.keyboard.press('Enter');
  await page.keyboard.type('Second');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-07-mtext-editor.png') });
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(120);
  let tx = (await all()).find((e) => e.type === 'text');
  ok(tx && tx.s === 'First paragraph of the note\nSecond' && near(tx.ww, 140, 1e-4) && near(tx.h, 8) && !(await page.$('[data-text-edit]')), 'Ctrl+Enter keeps it: two paragraphs, wrap width 140', JSON.stringify(tx));
  const tp = await screen(tx.x + 5, tx.y - 4);
  await page.mouse.dblclick(tp.x, tp.y); await page.waitForTimeout(150);
  ok(await page.$('[data-text-edit]') !== null && await page.inputValue('[data-text-edit]') === tx.s, 'double-clicking the text opens it in the editor');
  await page.keyboard.type(' more');
  await page.fill('#cc-te-w', '100'); await page.press('#cc-te-w', 'Enter');
  const away = await screen(190, 10); await page.mouse.click(away.x, away.y); await page.waitForTimeout(150);
  tx = (await all()).find((e) => e.type === 'text');
  ok(tx.s === 'First paragraph of the note\nSecond more' && near(tx.ww, 100, 1e-4), 'a click outside keeps the edit and the new width', JSON.stringify(tx));
  await page.keyboard.press('Escape'); await typeCmd(''); await page.keyboard.press('Escape');
  await page.mouse.dblclick(tp.x, tp.y); await page.waitForTimeout(150);
  await page.keyboard.type('XYZ'); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  ok(!(await all()).find((e) => e.type === 'text').s.includes('XYZ') && !(await page.$('[data-text-edit]')), 'Esc closes the editor without saving');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-08-mtext.png') });
  await page.keyboard.press('Escape');

  console.log('\n== HATCH');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,120');
  await typeCmd('C'); await typeCmd('100,60'); await typeCmd('30');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-cmd="HATCH"]'); await page.waitForTimeout(80);
  await typeCmd('P'); await typeCmd('ANSI31'); await typeCmd('SC'); await typeCmd('4');
  await clickAt(20, 20);
  await typeCmd('');
  let hs = (await all()).filter((e) => e.type === 'hatch');
  ok(hs.length === 1 && hs[0].loops.length === 2 && hs[0].pattern === 'ANSI31', 'HATCH by a click inside the rectangle, the circle left empty', JSON.stringify(hs.map((h) => ({ p: h.pattern, n: h.loops.length }))));
  await typeCmd('H'); await typeCmd('P'); await typeCmd('SOLID');
  await clickAt(100, 60); await typeCmd('');
  hs = (await all()).filter((e) => e.type === 'hatch');
  ok(hs.length === 2 && hs[1].solid, 'a solid fill in the circle');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-09-hatch.png') });
  await clickAt(10, 60.5);
  ok(await page.$('#cc-p-pat') !== null || (await page.evaluate(() => window.cadcraft.host.selection.size)) >= 1, 'a hatch can be picked and shows its pattern in Properties');

  console.log('\n== STRETCH and ARRAY');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-cmd="STRETCH"]'); await page.waitForTimeout(80);
  // a crossing lasso round the right-hand side (drawn leftward first; T.4), as AutoCAD's STRETCH takes it
  const lp = await Promise.all([[104, 62], [96, 62], [96, -2], [104, -2], [104, 60]].map(([x, y]) => screen(x, y)));
  await page.mouse.move(lp[0].x, lp[0].y); await page.mouse.down();
  for (const q of lp.slice(1)) await page.mouse.move(q.x, q.y, { steps: 6 });
  await page.mouse.up(); await page.waitForTimeout(80);
  await typeCmd(''); await typeCmd('0,0'); await typeCmd('40,0');
  let rr = (await all())[0];
  ok(rr && Math.max(...rr.pts.map((p) => p.x)) > 139.99 && Math.min(...rr.pts.map((p) => p.x)) < 0.01, 'a crossing lasso round the right side, then STRETCH 40: the rectangle is 140 wide', JSON.stringify(rr?.pts) + ' ' + (await history()).slice(-400));
  await page.keyboard.press('Control+z'); await page.waitForTimeout(80);
  await page.click('[data-cmd="STRETCH"]'); await page.waitForTimeout(80);
  await clickAt(104, 62); await clickAt(96, -2);   // click, click: still the crossing rectangle
  await typeCmd(''); await typeCmd('0,0'); await typeCmd('40,0');
  rr = (await all())[0];
  ok(rr && Math.max(...rr.pts.map((p) => p.x)) > 139.99, 'click, click right to left: the crossing rectangle still works for STRETCH', JSON.stringify(rr?.pts));
  await page.click('[data-group-menu="Modify"] summary'); await page.click('[data-group-menu="Modify"] [data-cmd="ARRAY"]'); await page.waitForTimeout(80);
  await typeCmd('L'); await typeCmd(''); await typeCmd('R'); await typeCmd('COU'); await typeCmd('2'); await typeCmd('2');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-10-array-preview.png') });
  await typeCmd('');
  ok((await all()).length === 4, 'ARRAY 2 × 2 from the toolbar: four rectangles');

  console.log('\n== JOIN and MATCHPROP (Modify › More)');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('100,50'); await typeCmd('0,50'); await typeCmd('C');
  await typeCmd('ZOOM'); await typeCmd('E');
  const items = await page.$$eval('[data-group-menu="Modify"] [role="menuitem"]', (bs) => bs.map((b) => b.firstChild.textContent.trim()));
  ok(JSON.stringify(items) === JSON.stringify(['Array', 'Join', 'Match properties', 'Break', 'Lengthen', 'Align', 'Align and distribute']), 'Modify › More lists Array, Join, Match properties, Break, Lengthen, Align, Align and distribute', JSON.stringify(items));
  await page.click('[data-group-menu="Modify"] summary'); await page.click('[data-group-menu="Modify"] [data-cmd="JOIN"]'); await page.waitForTimeout(80);
  await typeCmd('ALL'); await typeCmd('');
  let jj = await all();
  ok(jj.length === 1 && jj[0].type === 'poly' && jj[0].closed, 'JOIN from the menu: four lines → one closed polyline');
  await typeCmd('C'); await typeCmd('150,25'); await typeCmd('10'); await typeCmd('ZOOM'); await typeCmd('E');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.addLayer({ name: 'Red', color: 1 }); const e = d.all()[0]; d.change('t', () => d.update(e.id, { ...e, layer: 'Red' })); });
  await page.click('[data-group-menu="Modify"] summary'); await page.click('[data-group-menu="Modify"] [data-cmd="MATCHPROP"]'); await page.waitForTimeout(80);
  await clickAt(50, 0); await clickAt(160, 25); await typeCmd('');
  jj = await all();
  ok(jj.find((e) => e.type === 'circle')?.layer === 'Red', 'MATCHPROP by clicks: the circle goes to layer Red');

  console.log('\n== polar and object snap tracking');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60'); await typeCmd('ZOOM'); await typeCmd('E');
  await page.evaluate(() => { localStorage.removeItem('cadcraft.settings'); });
  await typeCmd('POLARANG'); await typeCmd('30');
  await page.click('[data-toggle="polar"]');
  ok(await page.getAttribute('[data-toggle="polar"]', 'aria-pressed') === 'true', 'the Polar button turns polar tracking on');
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');
  await typeCmd('L'); await typeCmd('20,20');
  const near30 = await screen(20 + 40 * Math.cos(Math.PI / 6) + 0.3, 20 + 40 * Math.sin(Math.PI / 6) - 0.3);
  await page.mouse.move(near30.x, near30.y); await page.waitForTimeout(60);
  const tr = await page.evaluate(() => window.cadcraft.view.state.track?.label || '');
  ok(/^Polar: .* < 30°$/.test(tr), 'near 30° the label reads "Polar: … < 30°"', tr);
  await typeCmd('25'); await typeCmd('');
  const pl = (await all()).find((e) => e.type === 'line');
  ok(pl && near(Math.atan2(pl.y2 - pl.y1, pl.x2 - pl.x1), Math.PI / 6, 1e-9) && near(Math.hypot(pl.x2 - pl.x1, pl.y2 - pl.y1), 25, 1e-9), 'typing 25 draws exactly 25 at exactly 30°', JSON.stringify(pl));
  await page.click('[data-toggle="polar"]');
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) !== 'true') await page.click('[data-toggle="osnap"]');
  await page.click('[data-toggle="otrack"]');
  await typeCmd('L');
  const corner = await screen(100, 60);
  await page.mouse.move(corner.x, corner.y); await page.waitForTimeout(550);
  const acqN = await page.evaluate(() => window.cadcraft.view.state.track?.acquired?.length || 0);
  ok(acqN === 1, 'resting on the rectangle\'s corner acquires it');
  const below = await screen(100.3, 20); await page.mouse.move(below.x, below.y, { steps: 4 }); await page.waitForTimeout(80);
  await page.mouse.click(below.x, below.y); await page.waitForTimeout(60);
  const fp = await page.evaluate(() => window.cadcraft.engine.lastPoint);
  ok(fp && near(fp.x, 100, 1e-9), 'a click near the vertical through it lands exactly on x = 100', JSON.stringify(fp));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-11-track.png') });
  await page.keyboard.press('Escape');
  await page.click('[data-toggle="otrack"]');

  console.log('\n== BREAK and LENGTHEN');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-group-menu="Modify"] summary'); await page.click('[data-group-menu="Modify"] [data-cmd="BREAK"]'); await page.waitForTimeout(80);
  await clickAt(30, 0); await clickAt(60, 0);
  let bl = (await all()).filter((e) => e.type === 'line');
  ok(bl.length === 2 && bl.some((e) => near(Math.max(e.x1, e.x2), 30, 1e-3)) && bl.some((e) => near(Math.min(e.x1, e.x2), 60, 1e-3)), 'BREAK by two clicks leaves 0–30 and 60–100', JSON.stringify(bl.map((e) => [e.x1, e.x2])));
  await page.click('[data-group-menu="Modify"] summary'); await page.click('[data-group-menu="Modify"] [data-cmd="LENGTHEN"]'); await page.waitForTimeout(80);
  await typeCmd('DE'); await typeCmd('10');
  await clickAt(28, 0); await typeCmd('');
  bl = (await all()).filter((e) => e.type === 'line');
  ok(bl.some((e) => near(Math.max(e.x1, e.x2), 40, 1e-3)), 'LENGTHEN DElta 10 at the clicked end: 0–40');

  console.log('\n== Quick select');
  await fresh();
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('L'); await typeCmd('0,10'); await typeCmd('20,10'); await typeCmd('');
  await typeCmd('C'); await typeCmd('50,50'); await typeCmd('10');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-edit-menu] summary'); await page.click('[data-edit-menu] [data-cmd="QSELECT"]');
  await page.waitForSelector('#cc-qs-type');
  await page.selectOption('#cc-qs-type', 'line');
  await page.selectOption('#cc-qs-prop', 'length');
  await page.selectOption('#cc-qs-op', '>');
  await page.fill('#cc-qs-value', '50');
  const cnt = await page.textContent('.cc-qs ~ .cc-plot-foot .cc-note');
  ok(/^1 of 3$/.test((cnt || '').trim()), 'the dialog counts what matches as you choose', cnt);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-12-qselect.png') });
  await page.click('dialog [data-key="ok"]'); await page.waitForTimeout(80);
  const qs = await page.evaluate(() => [...window.cadcraft.host.selection].map((id) => window.cadcraft.doc.get(id)));
  ok(qs.length === 1 && qs[0].type === 'line' && Math.abs(qs[0].x2 - 100) < 1e-9, 'Select: the long line is selected', JSON.stringify(qs));
  await page.keyboard.press('Escape');

  console.log('\n== zoom previous and named views');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60'); await typeCmd('ZOOM'); await typeCmd('E');
  const v0 = await page.evaluate(() => window.cadcraft.view.snapshot());
  await typeCmd('Z'); await typeCmd('W'); await typeCmd('0,0'); await typeCmd('10,10');
  const at3 = await screen(5, 5); await page.mouse.move(at3.x, at3.y);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(30); }
  await page.click('[data-cmd="ZOOM P"]'); await page.waitForTimeout(80);
  const v1 = await page.evaluate(() => window.cadcraft.view.viewRect());
  ok(Math.abs(v1.h - 10 / 0.9) < 0.5 || Math.abs(v1.w - 10 / 0.9) < 0.5, 'Previous after a run of wheel steps goes back to the zoomed window (the wheel run counts once)', JSON.stringify(v1));
  await page.click('[data-cmd="ZOOM P"]'); await page.waitForTimeout(80);
  const v2 = await page.evaluate(() => window.cadcraft.view.snapshot());
  ok(Math.abs(v2.zoom - v0.zoom) < 1e-9 && Math.abs(v2.cx - v0.cx) < 1e-9, 'and again to the extents');
  await typeCmd('NV'); await typeCmd('W'); await typeCmd('Corner'); await typeCmd('90,50'); await typeCmd('100,60');
  await typeCmd('NV'); await typeCmd('R'); await typeCmd('Corner');
  const v3 = await page.evaluate(() => window.cadcraft.view.viewRect());
  ok(Math.abs(v3.cx - 95) < 1e-6 && Math.abs(v3.cy - 55) < 1e-6 && Math.min(v3.w, v3.h) >= 10 - 1e-6 && Math.min(v3.w, v3.h) < 10.5, 'NAMEDVIEW Window then Restore shows exactly that window', JSON.stringify(v3));

  console.log('\n== dynamic input');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60'); await typeCmd('ZOOM'); await typeCmd('E');
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');
  await page.click('[data-toggle="dyn"]');
  ok(await page.getAttribute('[data-toggle="dyn"]', 'aria-pressed') === 'true', 'the Dyn button turns dynamic input on');
  await typeCmd('L');
  const pd = await screen(30, 30); await page.mouse.move(pd.x, pd.y); await page.waitForTimeout(60);
  const box1 = await page.evaluate(() => { const b = document.querySelector('.cc-dyn'); return b && !b.hidden ? [...b.querySelectorAll('.cc-dyn-f')].map((f) => f.textContent) : null; });
  ok(box1 && box1.length === 2 && box1[0] === '30' && box1[1] === '30', 'first point: X and Y fields by the crosshair', JSON.stringify(box1));
  await page.click('[data-cmd-input]'); await page.keyboard.type('20'); await page.keyboard.press('Tab'); await page.keyboard.type('10'); await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => { const p = window.cadcraft.engine.lastPoint; return p && p.x === 20 && p.y === 10; }), 'typed 20, Tab, 10, Enter: the first point is (20, 10)');
  const pe = await screen(60, 40); await page.mouse.move(pe.x, pe.y); await page.waitForTimeout(60);
  const box2 = await page.evaluate(() => [...document.querySelectorAll('.cc-dyn .cc-dyn-f')].map((f) => f.textContent));
  ok(box2.length === 2 && /°$/.test(box2[1]), 'next point: distance and angle fields', JSON.stringify(box2));
  await page.click('[data-cmd-input]'); await page.keyboard.type('50'); await page.keyboard.press('Tab'); await page.keyboard.type('90');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-13-dyn.png') });
  await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  await page.keyboard.press('Escape');
  const dl = (await all()).find((e) => e.type === 'line');
  ok(dl && Math.abs(dl.x2 - 20) < 1e-9 && Math.abs(dl.y2 - 60) < 1e-9, '50, Tab, 90, Enter: 50 straight up from (20, 10)', JSON.stringify(dl));
  await page.click('[data-toggle="dyn"]');

  console.log('\n== FIND');
  await fresh();
  await typeCmd('DT'); await typeCmd('0,0'); await typeCmd('5'); await typeCmd('0'); await typeCmd('KITCHEN 1'); await typeCmd('kitchenette'); await typeCmd('');
  await page.click('[data-edit-menu] summary'); await page.click('[data-edit-menu] [data-cmd="FIND"]');
  await page.waitForSelector('#cc-find-what');
  await page.fill('#cc-find-what', 'kitchen'); await page.check('#cc-find-whole');
  await page.fill('#cc-find-with', 'Pantry');
  const fl = await page.$$eval('.cc-find-list li', (li) => li.map((x) => x.textContent));
  ok(fl.length === 1 && fl[0].includes('→ Pantry 1'), 'the dialog lists what it finds and what it becomes', JSON.stringify(fl));
  await page.click('dialog [data-key="replace"]'); await page.waitForTimeout(80);
  const tt = (await all()).map((e) => e.s);
  ok(tt.includes('Pantry 1') && tt.includes('kitchenette'), 'Replace all: whole words only, so kitchenette stays', JSON.stringify(tt));

  console.log('\n== multileader');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60'); await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-cmd="MLEADER"]'); await page.waitForTimeout(80);
  await clickAt(30, 30); await clickAt(60, 50);
  await page.waitForSelector('[data-text-edit]', { timeout: 3000 });
  await page.keyboard.type('SEE DETAIL 3');
  await page.keyboard.press('Control+Enter'); await page.waitForTimeout(120);
  const ml = (await all()).find((e) => e.type === 'mleader');
  ok(ml && ml.s === 'SEE DETAIL 3' && ml.dir === 1 && ml.pts.length === 2, 'MLEADER: two clicks, then the words typed in place', JSON.stringify(ml));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-14-mleader.png') });
  const items2 = await page.$$eval('[data-group-menu="Annotate"] [role="menuitem"]', (bs) => bs.map((b) => b.firstChild.textContent.trim()));
  ok(JSON.stringify(items2) === JSON.stringify(['Continue dimension', 'Baseline dimension', 'Revision cloud']), 'Annotate › More holds Continue, Baseline and Revision cloud', JSON.stringify(items2));

  console.log('\n== revision cloud');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('100,60'); await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-group-menu="Annotate"] summary'); await page.click('[data-group-menu="Annotate"] [data-cmd="REVCLOUD"]'); await page.waitForTimeout(80);
  await typeCmd('A'); await typeCmd('4'); await typeCmd('F');
  await clickAt(30, 20);
  for (const [x, y] of [[50, 20], [60, 30], [50, 40], [30, 40], [25, 30], [30, 21]]) { const q = await screen(x, y); await page.mouse.move(q.x, q.y, { steps: 8 }); }
  await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  const rc = (await all()).filter((e) => e.type === 'poly' && e.pts.length > 4).pop();
  ok(rc && rc.closed && rc.pts.length >= 15 && rc.pts.every((p) => Math.abs(p.b) > 0.5), 'Freehand: the pointer\'s path becomes a closed cloud', rc && rc.pts.length);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-15-revcloud.png') });

  console.log('\n== ATTDEF and the block editor');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('40,20');
  await typeCmd('BLOCK'); await typeCmd('DESK'); await typeCmd('0,0'); await typeCmd('ALL'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.click('[data-group-menu="Blocks"] summary'); await page.click('[data-group-menu="Blocks"] [data-cmd="BEDIT"]'); await page.waitForTimeout(80);
  await typeCmd('DESK');
  const banner = await page.evaluate(() => { const b = document.querySelector('.cc-bedit'); return b && !b.hidden ? b.textContent : null; });
  ok(banner && banner.includes('Editing block "DESK"'), 'BEDIT shows which block is being edited', banner);
  await typeCmd('C'); await typeCmd('20,10'); await typeCmd('5');
  await page.click('.cc-bedit .cc-te-btn.is-primary'); await page.waitForTimeout(100);
  const desk = await page.evaluate(() => window.cadcraft.doc.blocks.get('DESK').entities.map((e) => e.type));
  ok(desk.length === 2 && desk.includes('circle') && await page.evaluate(() => window.cadcraft.doc.inModel && document.querySelector('.cc-bedit').hidden), 'Save block on the banner: the circle is in the block, back on the model', JSON.stringify(desk));

  console.log('\n== lineweight display (LWT)');
  await fresh();
  await typeCmd('LW'); await typeCmd('2.11');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('C'); await typeCmd('50,0'); await typeCmd('100');
  // how many pixels thick the line is at its middle, read straight off the base canvas
  const thick = () => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const v = window.cadcraft.view, c = v.base, s = v.toScreen(50, 0), d = v.dpr;
    const x = Math.round(s.x * d), y0 = Math.round(s.y * d) - 30;
    const px = c.getContext('2d').getImageData(x, y0, 1, 61).data;
    const bg = [px[0], px[1], px[2]];
    let n = 0; for (let i = 0; i < 61; i++) { const o = i * 4; if (Math.abs(px[o] - bg[0]) + Math.abs(px[o + 1] - bg[1]) + Math.abs(px[o + 2] - bg[2]) > 60) n++; }
    res(n / d);
  }))));
  if (await page.getAttribute('[data-toggle="lwt"]', 'aria-pressed') === 'true') await page.click('[data-toggle="lwt"]');
  const thin = await thick();
  await page.click('[data-toggle="lwt"]'); await page.waitForTimeout(80);
  const wide = await thick();
  ok(thin <= 2 && wide >= 7, 'LWT: a 2.11 mm line goes from 1 px to about 8 px wide', JSON.stringify({ thin, wide }));
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings') || '{}').lwt);
  ok(kept === true && await page.getAttribute('[data-toggle="lwt"]', 'aria-pressed') === 'true', 'the button is pressed and the choice is kept in this browser');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-16-lwt.png') });
  await typeCmd('LWDISPLAY'); await typeCmd('OFF');
  ok(await page.getAttribute('[data-toggle="lwt"]', 'aria-pressed') === 'false' && (await thick()) <= 2, 'LWDISPLAY OFF turns it off again (button and drawing)');

  // U.1 (user report 2026-10-13: from a layout to the model, pan and zoom "registered but not showed"). Not reproduced
  // here; these are the paths it could mean, each checked by the pixels on the base canvas.
  console.log('\n== layout → model redraws on pan and zoom (U.1)');
  await fresh();
  await typeCmd('C'); await typeCmd('0,0'); await typeCmd('50');
  await typeCmd('L'); await typeCmd('-100,-100'); await typeCmd('100,100'); await typeCmd('');
  await typeCmd('LAYOUT'); await page.waitForTimeout(200);
  const pixels = () => page.evaluate(() => new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const c = window.cadcraft.view.base, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; res(h);
  }))));
  const box = await page.$eval('[data-over]', (c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const panZoom = async (label) => {
    const p0 = await pixels();
    await page.mouse.move(box.x, box.y); await page.mouse.wheel(0, -400); await page.waitForTimeout(120);
    const p1 = await pixels();
    await page.mouse.down({ button: 'middle' }); await page.mouse.move(box.x + 120, box.y + 60, { steps: 6 }); await page.mouse.up({ button: 'middle' }); await page.waitForTimeout(120);
    const p2 = await pixels();
    ok(p1 !== p0 && p2 !== p1, label + ': the wheel zoom and the middle-button pan both show at once');
  };
  await page.click('.cc-tab:text-is("Model")'); await page.waitForTimeout(150);
  await panZoom('Model tab after a sheet');
  await page.click('.cc-tab:text-is("Layout1")'); await page.waitForTimeout(150);
  await panZoom('back on the sheet');
  const vpId = await page.evaluate(() => [...window.cadcraft.doc.entities.values()].find((e) => e.type === 'viewport')?.id);
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), vpId); await page.waitForTimeout(100);
  await page.click('button:has-text("Pick a window on the model")'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => window.cadcraft.doc.inModel && window.cadcraft.engine.running === 'VPVIEW'), 'Properties › Pick a window on the model… opens the model (VPVIEW)');
  await panZoom('in VPVIEW');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => window.cadcraft.doc.layout?.name === 'Layout1'), 'Esc in VPVIEW goes back to the sheet');
  await page.click('.app-bar button[name="space"][value="model"]'); await page.waitForTimeout(150);
  await panZoom('sheet with the Model (dark) theme');
  await page.click('.app-bar button[name="space"][value="paper"]'); await page.waitForTimeout(150);
  await page.click('.cc-tab:text-is("Model")'); await page.waitForTimeout(150);

  console.log('\n== TRIM by dragging, Shift to extend, lasso selection (T.1–T.4)');
  await fresh();
  await typeCmd('L'); await typeCmd('-5,0'); await typeCmd('100,0'); await typeCmd('');
  for (let i = 0; i < 20; i++) { await typeCmd('L'); await typeCmd((i * 5) + ',-10'); await typeCmd((i * 5) + ',10'); await typeCmd(''); }
  await typeCmd('ZOOM'); await typeCmd('E');
  const uprights = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'line' && Math.abs(e.x1 - e.x2) < 1e-9).map((e) => Math.max(e.y1, e.y2)));
  const dragThrough = async (pts, { mid } = {}) => {
    const s = await Promise.all(pts.map(([x, y]) => screen(x, y)));
    await page.mouse.move(s[0].x, s[0].y); await page.mouse.down();
    let seen = null;
    for (let i = 1; i < s.length; i++) {
      await page.mouse.move(s[i].x, s[i].y, { steps: 20 });
      if (mid && i === 1) seen = await mid();
    }
    await page.mouse.up(); await page.waitForTimeout(120);
    return seen;
  };
  await typeCmd('TR');
  const hov = await screen(2.5, 0);
  await page.mouse.move(hov.x, hov.y + 1); await page.mouse.move(hov.x, hov.y); await page.waitForTimeout(80);
  const hoverGhost = await page.evaluate(() => window.cadcraft.view.state.preview.filter((e) => e.ghost).map((e) => [Math.min(e.x1, e.x2), Math.max(e.x1, e.x2)]));
  ok(hoverGhost.length === 1 && Math.abs(hoverGhost[0][0]) < 1e-6 && Math.abs(hoverGhost[0][1] - 5) < 1e-6, 'resting on a piece in TRIM previews it (greyed, dashed)', JSON.stringify(hoverGhost));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-17-trim-hover.png') });
  const midDrag = await dragThrough([[-2, 5], [48, 6], [98, 5]], { mid: () => page.evaluate(() => ({ path: !!window.cadcraft.view.state.lasso, ghosts: window.cadcraft.view.state.preview.filter((e) => e.ghost).length })) });
  ok(midDrag && midDrag.path && midDrag.ghosts >= 9, 'while dragging, the path shows and the pieces it has crossed are previewed', JSON.stringify(midDrag));
  let ys = await uprights();
  ok(ys.length === 20 && ys.every((y) => Math.abs(y) < 1e-6), 'one drag through 20 lines trims every top piece', JSON.stringify(ys));
  await typeCmd('U');
  ys = await uprights();
  ok(ys.every((y) => Math.abs(y - 10) < 1e-6), 'U puts all 20 back in one step');
  await dragThrough([[-2, 5], [98, 5]]);
  await typeCmd('');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
  ys = await uprights();
  ok(ys.every((y) => Math.abs(y - 10) < 1e-6), 'after TRIM, one Ctrl+Z undoes the whole drag');

  await fresh();
  await typeCmd('L'); await typeCmd('10,-1'); await typeCmd('10,10'); await typeCmd('');
  for (let k = 1; k <= 5; k++) { await typeCmd('L'); await typeCmd('0,' + k); await typeCmd('5,' + k); await typeCmd(''); }
  await typeCmd('ZOOM'); await typeCmd('E');
  await typeCmd('TR');
  await page.keyboard.down('Shift');
  await dragThrough([[3, 0], [3, 6]]);
  await page.keyboard.up('Shift');
  const ends = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'line' && e.y1 === e.y2).map((e) => Math.max(e.x1, e.x2)));
  ok(ends.length === 5 && ends.every((x) => Math.abs(x - 10) < 1e-6), 'Shift+drag in TRIM extends all five lines to the boundary', JSON.stringify(ends));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-18-trim-extend.png') });
  await typeCmd('');

  // lasso: right = window, left = crossing, Space cycles; LASSOMODE 0 = a rectangle
  await fresh();
  await typeCmd('L'); await typeCmd('1,1'); await typeCmd('3,1'); await typeCmd('');
  await typeCmd('L'); await typeCmd('4.5,1'); await typeCmd('15,1'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('W'); await typeCmd('-5,-8'); await typeCmd('20,12');
  const ring = [[0, 0], [4, -1], [6, 3], [2, 5], [-1, 3], [0, 0.2]];
  const selIds = () => page.evaluate(() => [...window.cadcraft.host.selection].map((id) => window.cadcraft.doc.get(id).x1).sort((a, b) => a - b));
  const modeMid = await dragThrough(ring, { mid: () => page.evaluate(() => window.cadcraft.view.state.lasso?.mode) });
  ok(modeMid === 'window' && JSON.stringify(await selIds()) === '[1]', 'a lasso drawn to the right selects only what lies wholly inside', JSON.stringify(await selIds()));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-19-lasso-window.png') });
  await page.keyboard.press('Escape');
  const ringLeft = [[4, -1], [0, 0], [-1, 3], [2, 5], [6, 3], [4, -0.8]];
  const modeLeft = await dragThrough(ringLeft, { mid: () => page.evaluate(() => window.cadcraft.view.state.lasso?.mode) });
  ok(modeLeft === 'crossing' && JSON.stringify(await selIds()) === '[1,4.5]', 'drawn to the left it is a crossing lasso: inside or touching', JSON.stringify(await selIds()));
  await page.keyboard.press('Escape');
  const cyc = await dragThrough(ring, { mid: async () => { await page.keyboard.press(' '); return page.evaluate(() => window.cadcraft.view.state.lasso?.mode); } });
  ok(cyc === 'crossing' && JSON.stringify(await selIds()) === '[1,4.5]' && (await page.inputValue('[data-cmd-input]')) === '', 'Space while dragging switches window → crossing (and never reaches the command line)', String(cyc));
  await page.keyboard.press('Escape');
  await typeCmd('LASSOMODE'); await typeCmd('0');
  const boxMid = await dragThrough([[-1, -1], [4, 2]], { mid: () => page.evaluate(() => ({ box: !!window.cadcraft.view.state.box, lasso: !!window.cadcraft.view.state.lasso })) });
  ok(boxMid && boxMid.box && !boxMid.lasso && JSON.stringify(await selIds()) === '[1]', 'LASSOMODE 0: dragging draws the rectangle again', JSON.stringify(boxMid));
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings') || '{}').lasso) === 'box', 'the choice is kept with the other settings');
  await page.keyboard.press('Escape');
  await typeCmd('LASSOMODE'); await typeCmd('1');

  console.log('\n== split screen: panes, a sheet beside the model, two drawings tiled (Q.1–Q.4, Q.7)');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,100');
  await typeCmd('C'); await typeCmd('50,50'); await typeCmd('30');
  await typeCmd('ZOOM'); await typeCmd('E');
  const V = () => page.evaluate(() => { const v = window.cadcraft.view; return v.panes ? { n: v.panes.list.length, active: v.panes.active, zooms: v.panes.list.map((p, i) => (i === v.panes.active ? v.zoom : p.zoom)), spaces: v.panes.list.map((p) => (window.cadcraft.doc.layouts.find((l) => l.entities === p.space)?.name || 'model')) } : null; });
  const paneMid = (i, dx = 0, dy = 0) => page.evaluate(([i, dx, dy]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(), p = window.cadcraft.view.panes.list[i].rect; return { x: r.left + p.x + p.w / 2 + dx, y: r.top + p.y + p.h / 2 + dy }; }, [i, dx, dy]);
  await page.click('details[data-group-menu] summary >> nth=-1').catch(() => {});
  const splitItem = await page.$('[data-cmd="SPLIT 2V"]');
  if (splitItem && await splitItem.isVisible()) await splitItem.click(); else { await page.keyboard.press('Escape'); await typeCmd('VPORTS'); await typeCmd('2V'); }
  await page.waitForTimeout(150);
  let vs = await V();
  ok(vs && vs.n === 2 && vs.active === 0 && (await page.$$('.cc-divider')).length === 1, 'View › More › Split side by side: two panes and a divider', JSON.stringify(vs));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-20-split.png') });
  const m1 = await paneMid(1);
  await page.mouse.move(m1.x, m1.y); await page.mouse.click(m1.x, m1.y); await page.waitForTimeout(100);
  ok((await V()).active === 1 && (await all()).length === 2, 'a click in the other pane makes it active and picks nothing');
  await page.mouse.wheel(0, -500); await page.waitForTimeout(120);
  vs = await V();
  ok(vs.zooms[1] > vs.zooms[0] * 1.5, 'the wheel zooms only the active pane', JSON.stringify(vs.zooms));
  const m0 = await paneMid(0);
  await page.mouse.click(m0.x, m0.y); await page.waitForTimeout(80);
  await typeCmd('L');
  const p0 = await paneMid(0, -30, 20); await page.mouse.move(p0.x, p0.y); await page.mouse.click(p0.x, p0.y); await page.waitForTimeout(80);
  await page.mouse.click(m1.x, m1.y); await page.waitForTimeout(80);
  const p1 = await paneMid(1, 15, -10); await page.mouse.move(p1.x, p1.y); await page.mouse.click(p1.x, p1.y); await page.waitForTimeout(80);
  await page.keyboard.press('Escape');
  const crossLine = (await all()).filter((e) => e.type === 'line');
  ok(crossLine.length === 1 && Math.hypot(crossLine[0].x2 - crossLine[0].x1, crossLine[0].y2 - crossLine[0].y1) > 1, 'LINE: first point in one pane, second in the other', JSON.stringify(crossLine));
  const dv = await (await page.$('.cc-divider')).boundingBox();
  await page.mouse.move(dv.x + dv.width / 2, dv.y + 100); await page.mouse.down(); await page.mouse.move(dv.x - 150, dv.y + 100, { steps: 5 }); await page.mouse.up();
  ok(await page.evaluate(() => window.cadcraft.view.panes.fx < 0.45), 'dragging the divider resizes the panes');
  await typeCmd('LAYOUT'); await page.waitForTimeout(150);
  vs = await V();
  ok(vs.spaces[vs.active] !== 'model' && vs.spaces.filter((s) => s === 'model').length === 1, 'a sheet in the active pane, the model in the other (Q.4)', JSON.stringify(vs.spaces));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-21-model-and-sheet.png') });
  await typeCmd('SPLIT'); await typeCmd('SI');
  ok(!(await V()) && (await page.$$('.cc-divider')).length === 0, 'SPLIT SIngle from the sheet: one pane again (VPORTS on a sheet is MVIEW)');
  await page.click('.cc-tab:text-is("Model")'); await page.waitForTimeout(100);
  // a second drawing: its own tab; tile; a pane click opens it; copy and paste between them; close asks
  await typeCmd('NEW');
  const tabNames = () => page.$$eval('.cc-doctab .cc-doctab-name', (els) => els.map((e) => e.textContent));
  ok(JSON.stringify(await tabNames()) === '["Drawing1","Drawing2"]' && await page.evaluate(() => window.cadcraft.doc.count() === 0), 'NEW opens Drawing2 in its own tab; the tabs show', JSON.stringify(await tabNames()));
  await typeCmd('C'); await typeCmd('0,0'); await typeCmd('40');
  await page.click('.cc-doctab-tool[aria-label*="side by side"]'); await page.waitForTimeout(200);
  vs = await V();
  ok(vs && vs.n === 2 && await page.evaluate(() => window.cadcraft.view.panes.list.map((p) => p.docId).join()) === '1,2', 'Tile side by side: each pane shows one of the two drawings');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-22-tiled.png') });
  await page.click('.cc-doctab-tool[aria-pressed]'); await page.waitForTimeout(100);
  await page.mouse.move((await paneMid(await page.evaluate(() => window.cadcraft.view.panes.active))).x, (await paneMid(await page.evaluate(() => window.cadcraft.view.panes.active))).y);
  await page.mouse.wheel(0, -400); await page.waitForTimeout(150);
  const lk = await page.evaluate(() => { const v = window.cadcraft.view; return v.panes.list.map((p, i) => (i === v.panes.active ? { z: v.zoom, cx: v.cx } : { z: p.zoom, cx: p.cx })); });
  ok(await page.evaluate(() => window.cadcraft.view.linked) && Math.abs(lk[0].z - lk[1].z) < 1e-9 && Math.abs(lk[0].cx - lk[1].cx) < 1e-9, 'Link the panes\' views: a zoom in one pane moves both (Q.5)', JSON.stringify(lk));
  await typeCmd('LINKVIEWS'); await typeCmd('OFF');
  { const am = await paneMid(await page.evaluate(() => window.cadcraft.view.panes.active)); await page.mouse.move(am.x, am.y); }
  await page.mouse.wheel(0, -400); await page.waitForTimeout(150);
  ok(await page.evaluate(() => { const v = window.cadcraft.view, o = v.panes.list[v.panes.active === 0 ? 1 : 0]; return !v.linked && Math.abs(v.zoom - o.zoom) > 1e-6; }), 'LINKVIEWS OFF: they zoom on their own again');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set(window.cadcraft.doc.all().map((e) => e.id))));
  await page.keyboard.press('Control+c'); await page.waitForTimeout(80);
  const other = await paneMid(await page.evaluate(() => (window.cadcraft.view.panes.active === 0 ? 1 : 0)));
  await page.mouse.click(other.x, other.y); await page.waitForTimeout(250);
  ok(await page.evaluate(() => window.cadcraft.doc.meta.name === 'Drawing1' && window.cadcraft.host.tabs.active === 1), 'a click on the other pane opens Drawing1 (command line, panels and undo follow)');
  const n1 = (await all()).length;
  await typeCmd('PASTEORIG'); await page.waitForTimeout(100);
  ok((await all()).length === n1 + 1 && (await all()).some((e) => e.type === 'circle' && Math.abs(e.r - 40) < 1e-9), 'the circle copied in Drawing2 pastes into Drawing1');
  await page.click('.cc-doctab-wrap:not(.is-on) .cc-doctab-x'); await page.waitForTimeout(150);
  ok(!!(await page.$('dialog[open]')), 'closing Drawing2 (unsaved) asks first');
  await page.click('dialog[open] button[data-key="discard"]'); await page.waitForTimeout(200);
  ok((await tabNames()).length === 0 && await page.evaluate(() => window.cadcraft.host.tabs.list.length === 1 && window.cadcraft.doc.meta.name === 'Drawing1'), 'closed: one drawing left, the tabs hide');
  await typeCmd('VPORTS'); await typeCmd('SI');

  console.log('\n== touch: pinch, two-finger pan, long press = Enter, the key row (S.8)');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,100');
  await typeCmd('ZOOM'); await typeCmd('E');
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
  const tmid = await page.$eval('[data-over]', (c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  const vw = () => page.evaluate(() => ({ zoom: window.cadcraft.view.zoom, cx: window.cadcraft.view.cx, cy: window.cadcraft.view.cy }));
  const under = (sx, sy) => page.evaluate(([sx, sy]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const v = window.cadcraft.view; return v.toWorld(sx - r.left - v.x0, sy - r.top - v.y0); }, [sx, sy]);
  await touch('touchStart', [[tmid.x - 40, tmid.y]]);
  await page.waitForTimeout(200);   // the first touch turns on touch mode: the key row shows and the drawing area resizes
  const z0 = await vw(), w0 = await under(tmid.x, tmid.y);
  await touch('touchStart', [[tmid.x - 40, tmid.y], [tmid.x + 40, tmid.y]]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [[tmid.x - 40 - i * 10, tmid.y], [tmid.x + 40 + i * 10, tmid.y]]);
  await touch('touchEnd', []);
  await page.waitForTimeout(100);
  const z1 = await vw(), w1 = await under(tmid.x, tmid.y);
  ok(z1.zoom / z0.zoom > 2.2 && z1.zoom / z0.zoom < 2.8 && Math.hypot(w1.x - w0.x, w1.y - w0.y) < 2 / z1.zoom + 1e-6, 'pinch ×2.5 zooms about the point between the fingers', JSON.stringify({ r: z1.zoom / z0.zoom, w0, w1 }));
  ok((await all()).length === 1 && await page.evaluate(() => document.querySelector('.cc').classList.contains('is-touch') && !document.querySelector('.cc-keyrow').hidden), 'the pinch drew nothing; touch shows the key row');
  await touch('touchStart', [[tmid.x, tmid.y], [tmid.x + 60, tmid.y]]);
  for (let i = 1; i <= 5; i++) await touch('touchMove', [[tmid.x + i * 16, tmid.y + i * 10], [tmid.x + 60 + i * 16, tmid.y + i * 10]]);
  await touch('touchEnd', []);
  await page.waitForTimeout(100);
  const z2 = await vw();
  ok(Math.abs(z2.zoom / z1.zoom - 1) < 0.02 && Math.abs((z1.cx - z2.cx) * z2.zoom - 80) < 3 && Math.abs((z2.cy - z1.cy) * z2.zoom - 50) < 3, 'two fingers moving together pan 80 × 50 px without zooming', JSON.stringify({ z1, z2 }));
  await typeCmd('L');
  const vc = await page.evaluate(() => ({ x: window.cadcraft.view.cx, y: window.cadcraft.view.cy }));
  const tp1 = await screen(vc.x - 5, vc.y - 3);
  await touch('touchStart', [[tp1.x, tp1.y]]); await touch('touchEnd', []); await page.waitForTimeout(80);
  const tp2 = await screen(vc.x + 5, vc.y + 3);
  await touch('touchStart', [[tp2.x, tp2.y]]); await touch('touchEnd', []); await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.cadcraft.engine.running === 'LINE'), 'taps pick points (LINE still asking)');
  await touch('touchStart', [[tp2.x + 30, tp2.y + 30]]); await page.waitForTimeout(700); await touch('touchEnd', []); await page.waitForTimeout(100);
  const tlines = (await all()).filter((e) => e.type === 'line');
  ok(!(await page.evaluate(() => window.cadcraft.engine.running)) && tlines.length === 1, 'a long press is Enter: LINE ends with one segment', JSON.stringify(tlines));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-23-touch.png') });
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await page.click('.cc-keyrow .cc-key[aria-label^="Type @"]');
  await page.click('.cc-keyrow .cc-key[aria-label^="Type ,"]');
  ok(await page.inputValue('[data-cmd-input]') === '@,', 'the key row types @ and , at the command line', await page.inputValue('[data-cmd-input]'));
  await page.click('.cc-keyrow .cc-key[aria-label^="Esc"]');
  await page.click('[data-cmd-input]'); await page.keyboard.type('C');
  await page.click('.cc-keyrow .cc-key.is-enter');
  ok(await page.evaluate(() => window.cadcraft.engine.running === 'CIRCLE'), 'the key row\'s Esc clears, its Enter sends (CIRCLE starts)');
  await page.click('.cc-keyrow .cc-key[aria-label^="Esc"]');
  ok(!(await page.evaluate(() => window.cadcraft.engine.running)), 'and its Esc cancels the command');

  console.log('\n== enter a viewport by double-clicking (0.5 VP.4)');
  await fresh();
  await page.evaluate(() => window.cadcraft.doc.setSpace(null));
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('10000,5000');
  await page.evaluate(() => { window.cadcraft.doc.meta.units = 'millimeters'; });
  await typeCmd('LAYOUT');
  await typeCmd('ZOOM'); await typeCmd('E');
  const vpInfo = await page.evaluate(() => { const v = [...window.cadcraft.doc.entities.values()].find((e) => e.type === 'viewport'); return { id: v.id, x: v.x, y: v.y, w: v.w, h: v.h, s: v.s }; });
  const vpMid = await screen(vpInfo.x, vpInfo.y);
  await page.mouse.dblclick(vpMid.x, vpMid.y); await page.waitForTimeout(150);
  ok(await page.evaluate(() => !!window.cadcraft.host.viewportEntered() && window.cadcraft.doc.inModel && document.querySelector('[data-tabs] [aria-selected="true"]').textContent.startsWith('Layout')), 'a double-click inside the viewport enters it: the doc works on the model, the sheet\'s tab stays selected');
  await typeCmd('L');
  const inA = await page.evaluate(([x, y]) => window.cadcraft.view.toScreen(x, y), [2000, 1000]);
  const ovr = await page.evaluate(() => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  await page.mouse.click(ovr.x + inA.x, ovr.y + inA.y); await page.waitForTimeout(60);
  const inB = await page.evaluate(([x, y]) => window.cadcraft.view.toScreen(x, y), [8000, 1000]);
  await page.mouse.click(ovr.x + inB.x, ovr.y + inB.y); await page.waitForTimeout(60);
  await typeCmd('');
  const drawn = await page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line').map((e) => ({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 })));
  ok(drawn.length === 1 && Math.abs(drawn[0].x1 - 2000) < 30 && Math.abs(drawn[0].x2 - 8000) < 30, 'LINE by two clicks inside the viewport lands in the model, in model units', JSON.stringify(drawn));
  const before = await page.evaluate(() => window.cadcraft.view.paperView().zoom);
  await page.mouse.move(vpMid.x, vpMid.y); await page.mouse.wheel(0, -300); await page.waitForTimeout(120);
  ok(await page.evaluate((z) => Math.abs(window.cadcraft.view.paperView().zoom - z) < 1e-9 && !!window.cadcraft.view.pendingViewport(), before), 'the wheel inside zooms the viewport\'s view; the sheet stays put');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-24-inside-viewport.png') });
  const outside = await page.evaluate(() => { const f = window.cadcraft.view.enteredFrame(); const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + Math.max(f[0].x, f[2].x) + 25, y: r.top + Math.max(f[0].y, f[2].y) - 10 }; });
  await page.mouse.click(outside.x, outside.y); await page.waitForTimeout(60);
  ok(await page.evaluate(() => !!window.cadcraft.host.viewportEntered()), 'one click outside the frame does nothing');
  await page.mouse.dblclick(outside.x, outside.y); await page.waitForTimeout(150);
  const after = await page.evaluate((id) => { const d = window.cadcraft.doc; const v = d.layout && d.layout.entities.get(id); return { inside: !!window.cadcraft.host.viewportEntered(), sheet: !!d.layout, s: v?.s }; }, vpInfo.id);
  ok(!after.inside && after.sheet && after.s > vpInfo.s * 1.2, 'a double-click outside goes back to the sheet; the viewport keeps the zoom', JSON.stringify(after));
  await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
  ok(await page.evaluate(([id, s]) => Math.abs(window.cadcraft.doc.layout.entities.get(id).s - s) < 1e-12, [vpInfo.id, vpInfo.s]), 'Ctrl+Z undoes the viewport\'s new view in one step');
  await typeCmd('MS');
  ok(await page.evaluate(() => !!window.cadcraft.host.viewportEntered()), 'MS enters the sheet\'s only viewport');
  await page.click('[data-tabs] .cc-tab'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => !window.cadcraft.host.viewportEntered() && window.cadcraft.doc.inModel && !window.cadcraft.doc.layout), 'a click on the Model tab leaves the viewport and opens the model');
  await page.evaluate(() => { const d = window.cadcraft.doc; d.change('sheets', () => d.setLayouts([])); });

  console.log('\n== construction lines: XLINE and RAY by clicks, trimmed to a ray (0.5 DR.6)');
  await fresh();
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('200,100');
  await typeCmd('ZOOM'); await typeCmd('E');
  await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd('');
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.cc-tools > .cc-tool-group')].filter((g) => g.offsetParent).map((g) => g.offsetTop)).size);
  ok(rows <= 2, 'the toolbar stays two rows at 1440 px with Draw › More', String(rows));
  await page.click('[data-group-menu="Draw"] > summary');
  await page.click('[data-group-menu="Draw"] [data-cmd="XLINE"]'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.cadcraft.engine.running) === 'XLINE', 'Draw › More › Construction line starts XLINE');
  await typeCmd('H'); await clickAt(0, 50); await typeCmd('');
  await typeCmd('XL'); await typeCmd('V'); await clickAt(30, 0); await typeCmd('');
  await typeCmd('XL'); await typeCmd('A'); await typeCmd('30'); await clickAt(0, 0); await typeCmd('');
  await typeCmd('XL'); await typeCmd('B'); await clickAt(0, 0); await clickAt(100, 0); await clickAt(0, 100); await typeCmd('');
  let xs = (await all()).filter((e) => e.type === 'xline');
  const angs = xs.map((e) => Math.round(Math.atan2(e.dy, e.dx) * 180 / Math.PI));
  ok(xs.length === 4 && near(xs[0].y, 50, 0.5) && near(xs[1].x, 30, 0.5) && angs[0] === 0 && angs[1] === 90 && angs[2] === 30 && angs[3] === 45, 'XLINE Hor, Ver, Ang 30 and Bisect by clicks', JSON.stringify({ angs, xs }));
  await typeCmd('XL'); await typeCmd('O'); await typeCmd('20'); await clickAt(150, 50); await clickAt(150, 80); await typeCmd('');
  const ox = (await all()).filter((e) => e.type === 'xline').pop();
  ok(ox && near(ox.y, 70, 1e-6) && near(Math.abs(ox.dx), 1), 'XLINE Offset 20 from the horizontal one, by clicks', JSON.stringify(ox));
  const span = await page.evaluate((id) => { const v = window.cadcraft.view, e = window.cadcraft.doc.get(id); const s = v.screenRay(e); return s && { a: s[0].x, b: s[1].x, w: v.w }; }, xs[0].id);
  ok(span && Math.min(span.a, span.b) <= 0 && Math.max(span.a, span.b) >= span.w, 'drawn across the whole view, edge to edge', JSON.stringify(span));
  await typeCmd('RAY'); await clickAt(10, 10); await clickAt(60, 60); await typeCmd('');
  ok((await all()).some((e) => e.type === 'ray' && near(e.x, 10, 0.5) && Math.round(Math.atan2(e.dy, e.dx) * 180 / Math.PI) === 45), 'RAY by two clicks');
  await typeCmd('L'); await typeCmd('120,-100'); await typeCmd('120,300'); await typeCmd('');
  await typeCmd('TR'); await clickAt(170, 50); await typeCmd('');
  const afterTrim = await all();
  const leftRay = afterTrim.find((e) => e.type === 'ray' && near(e.y, 50, 1e-6));
  ok(leftRay && near(leftRay.x, 120, 1e-6) && leftRay.dx < 0 && !afterTrim.some((e) => e.type === 'xline' && near(e.y, 50, 1e-6)), 'TRIM the right part of the horizontal xline: a ray from the cut, going left', JSON.stringify(leftRay));
  await typeCmd('ZOOM'); await typeCmd('E');
  const ext = await page.evaluate(() => ({ h: window.cadcraft.view.h / window.cadcraft.view.zoom, cy: window.cadcraft.view.cy }));
  ok(Math.abs(ext.h - 400 / 0.9) < 1 && Math.abs(ext.cy - 100) < 1, 'ZOOM Extents fits the 400-long line and leaves the construction lines out', JSON.stringify(ext));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-26-xline.png') });

  console.log('\n== UCS and a turned view (0.5 DR.8)');
  {   // its own block: names of its own
  await fresh();
  await page.evaluate(() => { const d = window.cadcraft.doc; d.ucs = null; d.ucsPrev = []; });
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  const before8 = await page.evaluate(() => ({ version: window.cadcraft.doc.version, steps: window.cadcraft.doc.undoStack.length, dirty: window.cadcraft.doc.dirty }));
  await page.click('[data-group-menu="View"] > summary');
  await page.click('[data-group-menu="View"] [data-cmd="TURNRIGHT"]'); await page.waitForTimeout(200);
  const turned = await page.evaluate(() => { const c = window.cadcraft; const a = c.view.toScreen(0, 0), b = c.view.toScreen(100, 0); return { tw: c.view.tw, ucs: c.doc.ucs, a, b, version: c.doc.version, steps: c.doc.undoStack.length, dirty: c.doc.dirty }; });
  ok(Math.abs(turned.tw - Math.PI / 2) < 1e-9 && Math.abs(turned.a.x - turned.b.x) < 1e-6 && turned.b.y > turned.a.y, 'View › More › Turn view 90° right: the world X axis now runs down the screen', JSON.stringify(turned));
  ok(turned.version === before8.version && turned.steps === before8.steps && turned.dirty === before8.dirty, 'turning the view is not an edit: no undo step, no unsaved mark');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-27-turned.png') });
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('50,0'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  ok(await page.evaluate(() => Math.abs(window.cadcraft.view.tw - Math.PI / 2) < 1e-9), 'ZOOM Extents keeps the view turned');
  const ul = (await all()).pop();
  ok(ul && Math.abs(ul.x2) < 1e-9 && Math.abs(ul.y2 - 50) < 1e-9, 'typed 50,0 in the turned UCS lands at world 0,50 (its X axis is world +Y, level on screen)', JSON.stringify(ul));
  const coords = await page.evaluate(async () => { const c = window.cadcraft; const s = c.view.toScreen(0, 50); const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y }; });
  await page.mouse.move(coords.x, coords.y); await page.waitForTimeout(80);
  ok(/^50(\.0+)?, 0(\.0+)?/.test((await page.textContent('[data-coords]')).trim()), 'the coordinates readout is in the UCS', await page.textContent('[data-coords]'));
  // a selection window dragged on the turned screen picks what lies inside it on screen
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
  await typeCmd('LASSOMODE'); await typeCmd('0');   // a rectangle: the turned case is the rectangle's
  const w0 = await page.evaluate(() => { const c = window.cadcraft, r = document.querySelector('[data-over]').getBoundingClientRect(); const a = c.view.toScreen(-3, -3), b = c.view.toScreen(3, 53); return { ax: r.left + Math.min(a.x, b.x), ay: r.top + Math.min(a.y, b.y), bx: r.left + Math.max(a.x, b.x), by: r.top + Math.max(a.y, b.y) }; });
  await page.mouse.move(w0.ax, w0.ay); await page.mouse.down(); await page.mouse.move((w0.ax + w0.bx) / 2, (w0.ay + w0.by) / 2, { steps: 4 }); await page.mouse.move(w0.bx, w0.by, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(100);
  const selIds = await page.evaluate(() => [...window.cadcraft.host.selection].map((id) => window.cadcraft.doc.get(id)).map((e) => e && e.type + ':' + Math.round(e.y2)));
  await typeCmd('LASSOMODE'); await typeCmd('1');
  ok(selIds.length === 1 && selIds[0] === 'line:50', 'a window dragged on the turned screen selects the line inside it on screen, not the other', JSON.stringify(selIds));
  await page.keyboard.press('Escape');
  await page.click('[data-group-menu="View"] > summary');
  await page.click('[data-group-menu="View"] [data-cmd="TURNWORLD"]'); await page.waitForTimeout(150);
  ok(await page.evaluate(() => window.cadcraft.view.tw === 0 && window.cadcraft.doc.ucs === null), 'Back to world: level view, world UCS');
  await typeCmd('UCS'); await typeCmd('Z'); await typeCmd('30');
  await typeCmd('PLAN'); await typeCmd('W');
  ok(await page.evaluate(() => window.cadcraft.view.tw === 0 && Math.abs(window.cadcraft.doc.ucs.ang - Math.PI / 6) < 1e-9), 'UCS Z 30 then PLAN World: the view level again, the UCS kept');
  await typeCmd('UCS'); await typeCmd('W');
  }

  console.log('\n== My tools: buttons of your own, keys, a pausing macro, CUIx import (0.5 DR.9)');
  {
    await fresh();
    await typeCmd('ZOOM'); await typeCmd('C'); await typeCmd('0,0'); await typeCmd('400');
    await page.evaluate(() => window.cadcraft.host.myTools.set({ format: 'cadcraft-mytools', version: 1, groups: [{ name: 'Mine', tools: [
      { id: 'box', label: 'Box', macro: '^C^C_rectang;0,0;@100,50;', key: 'Ctrl+Alt+B' },
      { id: 'cir', label: 'Circle 25', macro: '^C^C_circle;\\25;' }] }] }));
    const grp = await page.$('[data-mytools-group][aria-label="Mine"]');
    ok(!!grp && (await grp.$$('button.cc-tool')).length === 2, 'My tools: the group and its two buttons on the toolbar');
    await page.click('[data-mytool="box"]'); await page.waitForTimeout(300);
    let es = await all();
    ok(es.length === 1 && es[0].type === 'poly' && es[0].pts.length === 4 && Math.abs(es[0].pts[2].x - 100) < 1e-9 && Math.abs(es[0].pts[2].y - 50) < 1e-9, 'a click runs the macro ^C^C_rectang;0,0;@100,50;', JSON.stringify(es[0]?.pts));
    await page.click('[data-cmd-input]');
    await page.keyboard.press('Control+Alt+b'); await page.waitForTimeout(300);
    ok((await all()).length === 2, 'its key Ctrl+Alt+B runs it too');
    await page.click('[data-mytool="cir"]'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.cadcraft.engine.running) === 'CIRCLE', 'a macro with \\ waits at the centre prompt for you');
    await clickAt(150, 80); await page.waitForTimeout(300);
    const cir = (await all()).find((e) => e.type === 'circle');
    ok(cir && Math.abs(cir.r - 25) < 1e-9 && Math.abs(cir.cx - 150) < 2 && Math.abs(cir.cy - 80) < 2 && !(await page.evaluate(() => window.cadcraft.engine.running)), 'after your click it carries on: radius 25 there', JSON.stringify(cir));
    // Settings › CadCraft › My tools: add a button, refuse a taken key
    await page.keyboard.press('Control+,'); await page.waitForTimeout(300);
    await page.click('[data-mytools-settings] [data-mt-add]'); await page.waitForTimeout(150);
    await page.fill('#cc-mt-group', 'Mine'); await page.fill('#cc-mt-label', 'Origin line'); await page.fill('#cc-mt-macro', '^C^C_line;0,0;@0,60;;');
    await page.click('#cc-mt-key'); await page.keyboard.press('Control+s');
    await page.click('.cc-mt-dlg [data-key="ok"]'); await page.waitForTimeout(100);
    ok(/already a CadCraft/.test(await page.textContent('.cc-mt-dlg [role=alert]')), 'Ctrl+S as a key: refused, it is CadCraft\'s Save', await page.textContent('.cc-mt-dlg [role=alert]'));
    await page.click('#cc-mt-key'); await page.keyboard.press('Control+Alt+o');
    await page.click('.cc-mt-dlg [data-key="ok"]'); await page.waitForTimeout(150);
    ok(await page.evaluate(() => window.cadcraft.host.myTools.data().groups[0].tools.some((x) => x.label === 'Origin line' && x.key === 'Ctrl+Alt+O')), 'the dialog adds the button with its key');
    // a CUIx through the file picker
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-mytools-settings] [data-mt-cuix]')]);
    await chooser.setFiles(path.join(REPO, 'tools/cadcraft-test/fixtures/my-tools.cuix')); await page.waitForTimeout(600);
    const report = await page.textContent('[data-mytools-settings] [role=status]');
    ok(/CUIx imported/.test(report) && /SUPERHATCH/.test(report), 'Import CUIx: groups added; the command CadCraft lacks is named', report);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    ok(!!(await page.$('[data-mytools-group][aria-label="My drafting"] img.cc-mytool-icon')), 'its toolbar is on the toolbar, with its picture');
    const n0 = (await all()).length;
    await page.click('[data-mytools-group][aria-label="My drafting"] button:has-text("Super")'); await page.waitForTimeout(200);
    ok((await all()).length === n0 && (await history()).includes('no SUPERHATCH command'), 'a button for a command CadCraft lacks says so and does nothing');
    await page.evaluate(() => window.cadcraft.host.myTools.set({ format: 'cadcraft-mytools', version: 1, groups: [] }));
    ok(!(await page.$('[data-mytools-group]')), 'emptied: no My tools group on the toolbar');
  }

  console.log('\n== freeze a layer in one viewport from the Layers panel (0.5 VP.2)');
  {
    await fresh();
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setSpace(null); d.change('lay', () => d.setLayouts([])); d.setLayer('Hide', { color: 1 }); });
    await typeCmd('LAYER'); await page.keyboard.press('Escape');
    await page.evaluate(() => { const d = window.cadcraft.doc; d.current.layer = 'Hide'; });
    await typeCmd('L'); await typeCmd('0,0'); await typeCmd('300,200'); await typeCmd('');
    await page.evaluate(() => { window.cadcraft.doc.current.layer = '0'; });
    await typeCmd('LAYOUT');
    const vpId = await page.evaluate(() => { const c = window.cadcraft; const v = [...c.doc.entities.values()].find((e) => e.type === 'viewport'); c.host.setSelection(new Set([v.id])); return v.id; });
    await page.waitForTimeout(150);
    ok(await page.evaluate(() => !document.querySelector('[data-vpfrz-note]').hidden && !!document.querySelector('[data-vpfrz="Hide"]')), 'a selected viewport: the Layers panel shows the freeze-in-viewport column and says so');
    await page.click('[data-vpfrz="Hide"]'); await page.waitForTimeout(150);
    ok(await page.evaluate((i) => JSON.stringify(window.cadcraft.doc.entities.get(i).frz) === '["Hide"]' && document.querySelector('[data-vpfrz="Hide"]').getAttribute('aria-pressed') === 'true', vpId), 'a click freezes the layer in that viewport only (the button shows it)');
    await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
    await page.waitForTimeout(100);
    ok(await page.evaluate(() => document.querySelector('[data-vpfrz-note]').hidden && !document.querySelector('[data-vpfrz]')), 'nothing selected: the column goes');
    await page.click('[data-cmd-input]'); await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
    ok(await page.evaluate((i) => !window.cadcraft.doc.entities.get(i).frz, vpId), 'Ctrl+Z thaws it again (one step)');
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setSpace(null); d.change('lay', () => d.setLayouts([])); });
  }

  console.log('\n== dynamic blocks: Properties › Custom switches the visibility state (0.5 DB.3, DB.12)');
  {
    const sample = '/var/www/CADCRAFT/testfiles/dwg-samples/blocks_and_tables_-_imperial.dwg';   // a vendor sample: outside the repo, skipped when absent
    if (fs.existsSync(sample)) {
      await page.setInputFiles('[data-file]', sample);
      await page.waitForFunction(() => [...window.cadcraft.doc.model.values()].some((e) => e.type === 'insert' && e.dyn), null, { timeout: 60000 });
      await page.waitForTimeout(300);
      const id = await page.evaluate(() => { const c = window.cadcraft; c.doc.setSpace(null); const r = [...c.doc.model.values()].find((e) => e.type === 'insert' && e.block === 'Receptacle' && e.dyn?.state === 'Duplex'); c.host.setSelection(new Set([r.id])); return r.id; });
      await page.waitForSelector('#cc-p-dyn-vis', { timeout: 5000 }).catch(() => {});
      const opts = await page.$$eval('#cc-p-dyn-vis option', (os) => os.map((o) => o.value)).catch(() => []);
      ok(opts.join('|') === 'Duplex|GFI', 'Properties › Custom: a Visibility list with the block\'s states', opts.join('|'));
      await page.selectOption('#cc-p-dyn-vis', 'GFI'); await page.waitForTimeout(300);
      ok(await page.evaluate((i) => window.cadcraft.doc.model.get(i).dyn.state === 'GFI', id), 'choosing GFI switches the reference to its GFI state');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-28-dynamic-block.png') });
      await page.click('[data-cmd-input]'); await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
      ok(await page.evaluate((i) => window.cadcraft.doc.model.get(i).dyn.state === 'Duplex', id), 'one Ctrl+Z puts Duplex back');
      // DB.5: the visibility grip opens the list of states
      const gp = await page.evaluate((i) => { const c = window.cadcraft, e = c.doc.model.get(i); c.view.fit(c.view.boundsOf(e), 0.3); c.host.setSelection(new Set([i])); const g = c.view.state.grips.find((x) => x.key === 'dyn:vis'); const s = c.view.toScreen(g.x, g.y), r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + s.x, y: r.top + s.y }; }, id);
      await page.waitForTimeout(150);
      await page.mouse.click(gp.x, gp.y); await page.waitForTimeout(200);
      const items = await page.$$eval('.cc-dynvis [role=menuitemradio]', (bs) => bs.map((b) => b.textContent + (b.getAttribute('aria-checked') === 'true' ? '*' : ''))).catch(() => []);
      ok(items.join('|') === 'Duplex*|GFI', 'a click on the visibility grip lists the states, the current one checked', items.join('|'));
      await page.click('.cc-dynvis button:has-text("GFI")'); await page.waitForTimeout(200);
      ok(await page.evaluate((i) => window.cadcraft.doc.model.get(i).dyn.state === 'GFI' && !document.querySelector('.cc-dynvis'), id), 'choosing GFI there switches it and closes the list');
      await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
      await typeCmd('NEW');
    } else console.log('  (no vendor sample: skipped)');
  }

  // 0.6.1 FIX-061-DYN-ATTRS: the attributes follow the visibility state (our own fixture, fixtures/dwg/dyn-attrs-visibility.dwg)
  console.log('\n== dynamic blocks: the attributes follow the visibility state (FIX-061-DYN-ATTRS)');
  {
    await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/dyn-attrs-visibility.dwg'));
    await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'dyn-attrs-visibility.dwg', null, { timeout: 60000 });
    await page.waitForTimeout(300);
    const id = await page.evaluate(() => { const c = window.cadcraft; const r = [...c.doc.model.values()].filter((e) => e.type === 'insert').sort((a, b) => a.x - b.x)[0]; c.host.setSelection(new Set([r.id])); return r.id; });
    // what the reference draws (the same walk the screen and the plot use) and what Properties lists
    const shows = () => page.evaluate(async (i) => {
      const { walk } = await import('/assets/apps/cadcraft/dev/walk.js');
      const c = window.cadcraft, out = [];
      walk(c.doc, [c.doc.model.get(i)], { stroke() {}, fill() {}, text: (k, x) => { if (x.tag) out.push(x.tag + '=' + x.s); } });
      return out.join(' ');
    }, id);
    const propRows = () => page.$$eval('label[htmlfor^="cc-p-att"], label[for^="cc-p-att"]', (ls) => ls.map((l) => l.textContent.trim())).catch(() => []);
    await page.waitForSelector('#cc-p-dyn-vis', { timeout: 5000 }).catch(() => {});
    ok((await shows()) === 'CIRCUIT=L1-03 ROOM=Łazienka RATING=16A', 'Single: CIRCUIT, ROOM and RATING show', await shows());
    await page.selectOption('#cc-p-dyn-vis', 'Outdoor'); await page.waitForTimeout(300);
    ok((await shows()) === 'CIRCUIT=L1-03 ROOM=Łazienka IP=IP44', 'Properties › Custom → Outdoor: RATING goes, IP shows its value (it came out empty before)', await shows());
    const rows = await propRows();
    ok(rows.length === 5 && rows.filter((x) => /hidden/.test(x)).length === 2, 'Properties lists all five attributes, the two this state hides marked hidden', JSON.stringify(rows));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-28b-dynamic-attributes.png') });
    await page.selectOption('#cc-p-dyn-vis', 'Double'); await page.waitForTimeout(300);
    ok((await shows()) === 'CIRCUIT=L1-03 ROOM=Łazienka RATING=16A GANG=2', 'Double: RATING and GANG with their values', await shows());
    await page.click('[data-cmd-input]'); await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
    ok((await shows()) === 'CIRCUIT=L1-03 ROOM=Łazienka IP=IP44', 'one Ctrl+Z: back in Outdoor');
    await page.evaluate(() => { window.cadcraft.host.setSelection(new Set()); window.cadcraft.doc.markSaved(); });
    await typeCmd('NEW');
  }

  console.log('\n== sheet tabs show numbers only (0.5 WL.9)');
  {
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setSpace(null); d.change('lay', () => d.setLayouts([])); });
    await typeCmd('LAYOUT'); await typeCmd('LAYOUT');
    await page.evaluate(() => { const d = window.cadcraft.doc; d.change('names', () => d.setLayouts(d.layouts.map((l, i) => ({ ...l, name: ['A-101 Ground floor plan', 'Layout2'][i] })))); });
    await page.keyboard.press('Control+,'); await page.waitForTimeout(300);
    await page.check('input[name="ccTabs"][value="number"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    const tabs = await page.$$eval('[data-tabs] .cc-tab', (bs) => bs.map((b) => [b.textContent, b.title]));
    ok(tabs.some(([x, ti]) => x === 'A-101' && ti.includes('A-101 Ground floor plan')) && tabs.some(([x]) => x === 'Layout2'), 'Sheet numbers only: "A-101" on the tab, the whole name in its tooltip; a name with no number stays', JSON.stringify(tabs));
    await page.keyboard.press('Control+,'); await page.waitForTimeout(300);
    await page.check('input[name="ccTabs"][value="full"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    ok((await page.$$eval('[data-tabs] .cc-tab', (bs) => bs.map((b) => b.textContent))).includes('A-101 Ground floor plan'), 'Full names again');
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setSpace(null); d.change('lay', () => d.setLayouts([])); });
  }

  console.log('\n== compare settings between two open drawings (0.5 WL.12)');
  {
    await fresh();
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setLayer('Walls', { color: 1 }); });
    await typeCmd('NEW'); await page.waitForTimeout(300);
    await page.evaluate(() => { const d = window.cadcraft.doc; d.setLayer('Walls', { color: 5 }); });
    await page.click('[data-group-menu="View"] > summary');
    await page.click('[data-group-menu="View"] [data-cmd="COMPARESETTINGS"]'); await page.waitForTimeout(300);
    await page.selectOption('#cc-cmp-cat', 'layer'); await page.waitForTimeout(100);
    const other = await page.$$eval('#cc-cmp-doc option', (os) => os.map((o) => [o.value, o.textContent]));
    const otherId = await page.evaluate(() => { const t = window.cadcraft.host.tabs; return String(t.list.filter((r) => r.id !== t.active && t.docOf(r.id).layers.has('Walls')).pop()?.id); });   // the drawing set up just before (earlier sections leave others open)
    void other;
    await page.selectOption('#cc-cmp-doc', otherId); await page.waitForTimeout(100);
    await page.selectOption('#cc-cmp-a', 'Walls'); await page.selectOption('#cc-cmp-b', 'Walls'); await page.waitForTimeout(100);
    ok(await page.$eval('tr[data-cmp-key="color"]', (tr) => tr.classList.contains('is-diff')), 'Compare settings: the layer colour that differs between the two drawings is marked');
    await page.click('tr[data-cmp-key="color"] [data-cmp-right]'); await page.waitForTimeout(150);
    ok(await page.evaluate((id) => window.cadcraft.host.tabs.docOf(+id).layers.get('Walls').color === 5, otherId), '→ copies this drawing\'s colour into the other drawing');
    ok(await page.$eval('tr[data-cmp-key="color"]', (tr) => !tr.classList.contains('is-diff')), 'and the row is the same now');
    await page.click('[data-cmp-close]'); await page.waitForTimeout(150);
    await page.click('.cc-doctab-wrap:not(.is-on) .cc-doctab-x').catch(() => {}); await page.waitForTimeout(150);
    if (await page.$('dialog[open] button[data-key="discard"]')) await page.click('dialog[open] button[data-key="discard"]');
    await page.waitForTimeout(150);
  }

  console.log('\n== keyboard shortcuts for any command (0.5 WL.18)');
  {
    await fresh();
    await typeCmd('KEYS'); await page.waitForTimeout(200);
    await page.click('#cc-keys-key'); await page.keyboard.press('Control+s');
    await page.fill('#cc-keys-cmd', 'LINE'); await page.click('[data-keys-add]'); await page.waitForTimeout(100);
    ok(/already a CadCraft/.test(await page.textContent('.cc-keys [role=status]')), 'Ctrl+S refused (CadCraft\'s Save)');
    await page.click('#cc-keys-key'); await page.keyboard.press('Alt+Shift+c');
    await page.fill('#cc-keys-cmd', 'CIRCLE'); await page.click('[data-keys-add]'); await page.waitForTimeout(100);
    ok(await page.evaluate(() => window.cadcraft.host.shortcuts.keys().get('Alt+Shift+C') === 'CIRCLE'), 'Alt+Shift+C → CIRCLE added');
    await page.click('[data-keys-close]'); await page.waitForTimeout(100);
    await page.click('[data-cmd-input]'); await page.keyboard.press('Alt+Shift+c'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.cadcraft.engine.running) === 'CIRCLE', 'the key starts CIRCLE');
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.cadcraft.host.shortcuts.set(new Map()));
  }

  console.log('\n== Tangent snap: a line touching two circles by clicks (0.5 DR.3)');
  {
    await fresh();
    await typeCmd('C'); await typeCmd('0,0'); await typeCmd('5');
    await typeCmd('C'); await typeCmd('40,0'); await typeCmd('10');
    await typeCmd('ZOOM'); await typeCmd('E');
    const keep = await page.evaluate(() => { const c = window.cadcraft; const k = [...c.host.settings.kinds]; c.host.settings.kinds.clear(); c.host.settings.kinds.add('tan'); return k; });
    if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) !== 'true') await page.click('[data-toggle="osnap"]');
    await typeCmd('L');
    await clickAt(-1, 5.2); await clickAt(38, 10.3);
    await typeCmd('');
    const tl = (await all()).find((e) => e.type === 'line');
    const dist1 = tl && Math.abs((tl.y2 - tl.y1) * 0 - (tl.x2 - tl.x1) * 0 + tl.x2 * tl.y1 - tl.y2 * tl.x1) / Math.hypot(tl.x2 - tl.x1, tl.y2 - tl.y1);
    const dist2 = tl && Math.abs((tl.y2 - tl.y1) * 40 - (tl.x2 - tl.x1) * 0 + tl.x2 * tl.y1 - tl.y2 * tl.x1) / Math.hypot(tl.x2 - tl.x1, tl.y2 - tl.y1);
    ok(tl && Math.abs(dist1 - 5) < 1e-6 && Math.abs(dist2 - 10) < 1e-6 && tl.y1 > 0 && tl.y2 > 0, 'LINE with Tangent then Tangent: the top line touches both circles exactly', JSON.stringify({ tl, dist1, dist2 }));
    await page.click('[data-toggle="osnap"]');
    await page.evaluate((k) => { const c = window.cadcraft; c.host.settings.kinds.clear(); for (const x of k) c.host.settings.kinds.add(x); }, keep);
  }

  console.log('\n== tangent circles by clicks: Tan Tan Radius, Tan Tan Tan (0.5 DR.1, DR.2)');
  {
    await fresh();
    await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('0,100'); await typeCmd('C');
    await typeCmd('ZOOM'); await typeCmd('E');
    await page.click('[data-group-menu="Draw"] > summary');
    await page.click('[data-group-menu="Draw"] [data-cmd="CIRCLE TTT"]'); await page.waitForTimeout(150);
    await clickAt(30, 0); await clickAt(0, 30); await clickAt(50, 50); await page.waitForTimeout(150);
    const ic = (await all()).find((e) => e.type === 'circle');
    const want = 100 - 50 * Math.SQRT2;
    ok(ic && Math.abs(ic.r - want) < 1e-6 && Math.abs(ic.cx - want) < 1e-6, 'Draw › More › Circle: Tan, Tan, Tan — three clicks on the triangle give its incircle', JSON.stringify(ic));
    await typeCmd('C'); await typeCmd('T'); await clickAt(60, 0); await clickAt(0, 60); await typeCmd('8');
    const tr = (await all()).filter((e) => e.type === 'circle')[1];
    ok(tr && Math.abs(tr.r - 8) < 1e-9 && Math.abs(tr.cx - 8) < 1e-6 && Math.abs(tr.cy - 8) < 1e-6, 'CIRCLE T: two clicks and radius 8 in the corner', JSON.stringify(tr));
  }

  console.log('\n== view label follows the viewport\'s view name (0.5 WL.11)');
  {
    await fresh();
    await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('1000,500');
    await page.evaluate(() => { const d = window.cadcraft.doc; d.change('views', () => d.setViews([{ name: 'Kitchen', cx: 250, cy: 125, w: 500, h: 250 }])); });
    await typeCmd('LAYOUT');
    await page.waitForTimeout(200);
    const vpId = await page.evaluate(() => { const c = window.cadcraft; const v = [...c.doc.layout.entities.values()].find((e) => e.type === 'viewport'); c.host.setSelection(new Set([v.id])); return v.id; });
    await typeCmd('VPVIEW'); await typeCmd('V'); await typeCmd('Kitchen');
    await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), vpId);
    await typeCmd('VIEWLABEL'); await typeCmd('');
    const lab = () => page.evaluate(() => [...window.cadcraft.doc.layout.entities.values()].find((e) => e.type === 'text' && e.field)?.s);
    ok((await lab()) === 'Kitchen', 'VPVIEW View + VIEWLABEL: the label reads the view name', await lab());
    await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), vpId);
    await page.waitForTimeout(200);
    const how = await page.evaluate(() => {
      const l = [...document.querySelectorAll('[data-props] label')].find((x) => x.textContent.trim() === 'View name');
      const box = l && (l.control || document.getElementById(l.htmlFor));
      if (!box) return 'no box: ' + (l ? 'label for=' + l.htmlFor : 'no label');
      box.focus(); box.value = 'Kitchen plan'; box.dispatchEvent(new Event('input', { bubbles: true })); box.dispatchEvent(new Event('change', { bubbles: true })); box.blur();   // as Enter does
      return 'ok';
    });
    ok(how === 'ok', 'Properties shows View name for the selected viewport', how);
    await page.waitForTimeout(200);
    ok((await lab()) === 'Kitchen plan', 'renaming the view in Properties: the label follows', await lab());
    await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
    ok((await lab()) === 'Kitchen', 'one Ctrl+Z puts both back', await lab());
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "draw-wl11-view-label.png") });
  }

  console.log('\n== visibility states in the block editor (0.5 DB.9)');
  {
    await fresh();
    await page.evaluate(() => {
      const { doc } = window.cadcraft;
      const L = (x1, y1, x2, y2) => ({ type: 'line', x1, y1, x2, y2, layer: '0', color: null });
      const all = [[L(0, 0, 10, 0)], [L(0, 5, 10, 5)], [{ type: 'circle', cx: 5, cy: 10, r: 2, layer: '0', color: null }]];
      doc.change('blk', () => doc.defineBlock({ name: 'SINK', base: { x: 0, y: 0 }, entities: [all[0][0], all[1][0]],
        dyn: { def: true, src: 'A1', h: ['B1', 'B2', 'B3'], all, shown: [true, true, false], ad: [], vis: { node: 7, name: 'Visibility1', label: 'Visibility', states: [{ name: 'Single', show: [0, 1] }, { name: 'Double', show: [0, 2] }] } } }));
      doc.change('ins', () => doc.add({ type: 'insert', block: 'SINK', x: 0, y: 0, sx: 1, sy: 1, rot: 0, dyn: { state: 'Single', values: [] } }));
    });
    await typeCmd('BEDIT'); await typeCmd('SINK');
    await page.waitForTimeout(200);
    const pickBox = page.locator('[data-be-state]');
    ok(await pickBox.isVisible(), 'the block editor bar shows the visibility state picker');
    await pickBox.selectOption('Double'); await page.waitForTimeout(200);
    const kinds = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => e.type).sort().join());
    ok((await kinds()) === 'circle,line', 'picking "Double" in the bar shows that state', await kinds());
    await typeCmd('BVSTATE'); await typeCmd('N'); await typeCmd('Triple'); await typeCmd('S');
    ok((await kinds()) === 'circle,line,line' && (await pickBox.inputValue()) === 'Triple', 'BVSTATE New, Show all: the bar follows', await kinds());
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set(c.doc.all().filter((e) => e.type === 'circle').map((e) => e.id))); });
    await typeCmd('BVHIDE');
    ok((await kinds()) === 'line,line', 'BVHIDE hides the selected circle in "Triple"', await kinds());
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'draw-db9-bedit-states.png') });
    await page.click('.cc-te-btn.is-primary'); await page.waitForTimeout(200);
    const st = await page.evaluate(() => window.cadcraft.doc.blocks.get('SINK').dyn?.vis.states.map((x) => x.name + ':' + x.show.join('')).join(' '));
    ok(st === 'Single:01 Double:02 Triple:01', 'Save in the bar: the block keeps its states, as edited', st);
  }

  console.log('\n== layout tabs on short windows (0.5 VP.5 guard; the full sweep is browser-tabs-sweep.mjs)');
  await fresh();
  await page.evaluate(async () => {
    const { doc, engine } = window.cadcraft;
    if (!doc.layouts.length) { await engine.run('LAYOUT'); await engine.done; }
    const base = doc.layouts[0];
    const list = Array.from({ length: 40 }, (_, i) => ({ ...base, name: `A-${101 + i} Ground floor plan, kitchen and servery — issued for construction (${i + 1})`, entities: i ? new Map() : base.entities }));
    doc.setSpace(null);
    doc.change('sheets', () => doc.setLayouts(list));
   
  });
  // 1366 × 768 at 150 % (911 × 512), 1024 × 500, and the usual 1440 × 900; the touch key row is on from the section above
  for (const [w, h] of [[911, 512], [1024, 500], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(250);
    const pr = await page.evaluate(pageCheck);
    ok(pr.length === 0, `${w} × ${h}: every sheet tab is clickable, nothing covers the command line or the status bar`, pr.join('; '));
    const last = await page.evaluate(() => { const t = [...document.querySelectorAll('[data-tabs] .cc-tab')].pop(); t.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); const r = t.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 12), y: r.top + r.height / 2 }; });
    await page.mouse.click(last.x, last.y); await page.waitForTimeout(100);
    ok(await page.evaluate(() => window.cadcraft.doc.layout?.name.endsWith('(40)')), `${w} × ${h}: a real click on the 40th tab opens that sheet`);
    if (SHOTS && w === 911) await page.screenshot({ path: path.join(SHOTS, 'draw-25-short-window.png') });
    await page.evaluate(() => { window.cadcraft.doc.setSpace(null); });
  }
  ok(await page.evaluate(() => document.querySelector('.cc').classList.contains('cc-fit-compact') === false), 'at 1440 × 900 the toolbar keeps its words');
  await page.setViewportSize({ width: 1440, height: 900 });
  // Moved panels (app-panels.js, 0.5 VP.5 rest): both floating at their default place, and the right panel docked at the
  // bottom; each arranged at 1440 × 900, then the window shrinks (the dock was measured on the big window).
  for (const [kind, moves] of [['floating panels', [['left', 'float'], ['right', 'float']]], ['bottom dock', [['right', 'bottom']]]]) {
    if (!(await page.evaluate(() => !!window.ccShellPanels))) { ok(false, `${kind}: app-panels.js is loaded`); break; }
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(150);
    await page.evaluate((mv) => { for (const [id, d] of mv) window.ccShellPanels.move(id, d); }, moves);
    for (const [w, h] of [[911, 512], [1024, 500]]) {
      await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(300);
      const pr = await page.evaluate(pageCheck);
      ok(pr.length === 0, `${kind}, ${w} × ${h}: every sheet tab is clickable, nothing covers the command line or the status bar`, pr.join('; '));
    }
    await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(150);
    await page.evaluate(() => window.ccShellPanels.reset());
  }

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
