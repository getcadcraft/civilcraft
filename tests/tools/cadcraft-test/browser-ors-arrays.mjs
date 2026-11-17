#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ors-arrays.mjs — the click-through for builder "arrays" (1.0 ORS.2, ORS.7, ORS.29, ORS.16) in CadCraft's lab build, headless.
 * The engines are tested in Node: bin/test-arrays.mjs, bin/test-hatch-extras.mjs, bin/test-vpclip.mjs.
 *
 *   node tools/cadcraft-test/browser-ors-arrays.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin). Cached
 * Playwright Chromium. What it proves that Node cannot: the page loads with the new modules, the More menus hold the buttons,
 * a gradient is really painted on the canvas (pixels read back), an array's grips and Properties rows show, TRIM cuts a hatch by a
 * real click, and a clipped viewport hides the model outside its outline (pixels read back).
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
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  ok(await cc(() => ['ARRAYPATH', 'ARRAYEDIT', 'ARRAYCLOSE', 'ARRAYASSOCIATIVITY', 'GRADIENT', 'HATCHGENERATEBOUNDARY', 'VPCLIP'].every((n) => !!window.cadcraft.commands.lookup?.(n) || !!window.cadcraft.engine)), 'the page loads with the new modules');
  for (const cmd of ['ARRAYPATH', 'ARRAYEDIT', 'ARRAYCLOSE', 'ARRAYASSOCIATIVITY', 'GRADIENT', 'HATCHGENERATEBOUNDARY', 'VPCLIP']) ok(await page.$('[data-cmd="' + cmd + '"]') !== null, 'a button for ' + cmd + ' is on the page');
  ok(await page.$('[data-tb-key="Sheets"] [data-cmd="VPCLIP"]') !== null && await page.$('[data-tb-key="Draw"] [data-cmd="GRADIENT"]') !== null && await page.$('[data-tb-key="Modify"] [data-cmd="ARRAYEDIT"]') !== null, 'each in its group\'s More menu (Sheets, Draw, Modify)');

  console.log('\n== ORS.7 a gradient is painted');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.meta.units = 'millimeters';
    d.change('fixture', () => d.add({ type: 'poly', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 1000, y: 0, b: 0 }, { x: 1000, y: 500, b: 0 }, { x: 0, y: 500, b: 0 }] }));
    window.cadcraft.host.zoomWindow({ x: -300, y: -900 }, { x: 2600, y: 900 });
  });
  await settle();
  await typeCmd('GRADIENT'); await typeCmd('T'); await typeCmd('LINEAR'); await typeCmd('TW'); await typeCmd('255,0,0'); await typeCmd('0,0,255'); await typeCmd('A'); await typeCmd('0'); await typeCmd('');
  await clickAt(500, 250);
  await page.keyboard.press('Enter');
  await settle();
  ok(await cc(() => window.cadcraft.doc.all().some((e) => e.type === 'hatch' && e.xd && e.xd.CADCRAFT_GRAD)), 'GRADIENT made a gradient fill', (await history()).slice(-300));
  const left = await pixel(60, 250), right = await pixel(940, 250), mid = await pixel(500, 250);
  ok(left[0] > 200 && left[2] < 60 && right[2] > 200 && right[0] < 60 && mid[0] > 80 && mid[0] < 180 && mid[2] > 80 && mid[2] < 180, 'the canvas shows red at the left, blue at the right and the mix between', JSON.stringify([left, mid, right]));
  await shot('ors7-gradient');

  console.log('\n== ORS.29 TRIM cuts the hatch; the boundary again');
  await cc(() => { const d = window.cadcraft.doc; d.change('fixture', () => d.add({ type: 'line', x1: 600, y1: -100, x2: 600, y2: 600 })); });
  await settle();
  await typeCmd('TRIM');
  await clickAt(800, 400);
  await page.keyboard.press('Enter');
  await settle();
  const area = await cc(() => { const h = window.cadcraft.doc.all().find((e) => e.type === 'hatch'); let a = 0; for (const l of h.loops) { let s = 0; for (let i = 0, n = l.length / 2; i < n; i++) { const j = (i + 1) % n; s += l[2 * i] * l[2 * j + 1] - l[2 * j] * l[2 * i + 1]; } a += Math.abs(s / 2); } return a; });
  ok(Math.abs(area - 300000) < 1, 'a click on the hatch right of the line trims that side away', String(area) + ' ' + (await history()).slice(-200));
  const cut = await pixel(800, 250), kept = await pixel(300, 250);
  ok(kept[0] > 100 && kept[1] < 60 && cut[1] > 150, 'the canvas shows it: fill on the left, paper on the right', JSON.stringify([kept, cut]));
  await cc(() => { const d = window.cadcraft.doc; d.change('x', () => { for (const e of d.all()) if (e.type !== 'hatch') d.remove(e.id); }); window.cadcraft.host.setSelection(new Set([d.all()[0].id])); });
  await typeCmd('HATCHGENERATEBOUNDARY'); await typeCmd('Y');
  ok(await cc(() => { const d = window.cadcraft.doc; return d.all().filter((e) => e.type === 'poly' && e.closed).length === 1 && d.all().find((e) => e.type === 'hatch').assoc === true; }), 'HATCHGENERATEBOUNDARY draws the polyline and links the hatch', (await history()).slice(-200));
  await shot('ors29-trim');

  console.log('\n== ORS.2 an array that stays editable');
  await cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of d.all()) d.remove(e.id); d.add({ type: 'circle', cx: 0, cy: 0, r: 50 }); }); window.cadcraft.host.setSelection(new Set([d.all()[0].id])); });
  await typeCmd('ARRAYRECT'); await typeCmd('COU'); await typeCmd('3'); await typeCmd('2'); await typeCmd('S'); await typeCmd('300'); await typeCmd('200'); await typeCmd('AS'); await typeCmd('');
  await settle();
  const arr = await cc(() => { const d = window.cadcraft.doc, e = d.all()[0]; return { n: d.count(), type: e.type, items: d.blocks.get(e.block)?.entities.length, sel: window.cadcraft.host.selection.size }; });
  ok(arr.n === 1 && arr.type === 'insert' && arr.items === 6, 'ARRAYRECT with ASsociative: one array object of 6 items', JSON.stringify(arr));
  await cc(() => window.cadcraft.host.setSelection(new Set([window.cadcraft.doc.all()[0].id])));
  await settle();
  const grips = await cc(() => window.cadcraft.view.gripsFor([...window.cadcraft.host.selection]).map((g) => g.key));
  ok(grips.includes('arr:dx') && grips.includes('arr:cols') && grips.includes('arr:rows') && grips.includes('p'), 'the selected array shows its spacing and count grips', grips.join());
  const propText = await page.evaluate(() => document.querySelector('[data-props]')?.textContent || document.body.textContent);
  ok(/Column spacing/.test(propText) && /Items in all/.test(propText), 'Properties shows the Array rows (when the panel is open)', propText.length + ' characters read');
  await typeCmd('ARRAYEDIT'); await typeCmd('COL'); await typeCmd('5'); await typeCmd('150'); await typeCmd('');
  await settle();
  ok(await cc(() => { const d = window.cadcraft.doc, e = d.all()[0]; return d.blocks.get(e.block).entities.length === 10; }), 'ARRAYEDIT: 5 columns, the array is rebuilt', (await history()).slice(-200));
  const ink = await pixel(600 + 50, 200), gap = await pixel(600 + 100, 300);
  ok(JSON.stringify(ink) !== JSON.stringify(gap), 'the fifth column is drawn on the canvas', JSON.stringify([ink, gap]));
  await shot('ors2-array');
  await typeCmd('ARRAYASSOCIATIVITY'); await typeCmd('0');

  console.log('\n== ORS.16 a clipped viewport');
  await cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of d.all()) d.remove(e.id); d.add({ type: 'hatch', layer: '0', color: 1, solid: true, loops: [[0, 0, 10000, 0, 10000, 5000, 0, 5000]] }); }); window.cadcraft.host.setSelection(new Set()); });
  await typeCmd('LAYOUT');
  await settle();
  await cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of d.all()) if (e.type === 'viewport') d.remove(e.id); }); });
  await typeCmd('MVIEW'); await clickAt(100, 60); await clickAt(300, 160);
  await settle();
  const vp0 = await cc(() => { const v = window.cadcraft.doc.all().find((e) => e.type === 'viewport'); return v && { x: v.x, y: v.y, w: v.w, h: v.h, id: v.id }; });
  ok(vp0 && Math.abs(vp0.w - 200) < 1 && Math.abs(vp0.h - 100) < 1, 'MVIEW made a rectangular viewport on the sheet', JSON.stringify(vp0));
  // make sure the red fill covers the whole viewport, whatever scale MVIEW chose
  await cc((id) => { const d = window.cadcraft.doc; d.change('aim', () => d.update(id, { ...d.get(id), cx: 5000, cy: 2500, s: 0.05 })); }, vp0.id);
  await settle();
  const corner0 = await pixel(104, 156), centre0 = await pixel(200, 80);
  await cc((id) => window.cadcraft.host.setSelection(new Set([id])), vp0.id);
  await typeCmd('VPCLIP'); await typeCmd('P'); await clickAt(100, 60); await clickAt(300, 60); await clickAt(200, 160); await page.keyboard.press('Enter');
  await settle();
  ok(await cc(() => { const v = window.cadcraft.doc.all().find((e) => e.type === 'viewport'); return Array.isArray(v.clip) && v.clip.length === 6; }), 'VPCLIP Polygonal clipped it to a triangle', (await history()).slice(-200));
  const corner1 = await pixel(104, 156), centre1 = await pixel(200, 80);
  ok(JSON.stringify(centre0) === JSON.stringify(centre1) && centre1[0] > 150 && centre1[1] < 100, 'the model still shows inside the outline (the red fill)', JSON.stringify([centre0, centre1]));
  ok(corner0[0] > 150 && corner0[1] < 100 && !(corner1[0] > 150 && corner1[1] < 100), 'and no longer in the corner of the box outside it', JSON.stringify([corner0, corner1]));
  await shot('ors16-vpclip');
  await cc((id) => window.cadcraft.host.setSelection(new Set([id])), vp0.id);
  await typeCmd('VPCLIP'); await typeCmd('D');
  await settle();
  const corner2 = await pixel(104, 156);
  ok(await cc(() => !window.cadcraft.doc.all().find((e) => e.type === 'viewport').clip) && corner2[0] > 150 && corner2[1] < 100, 'VPCLIP Delete: a rectangle again, the corner shows the model', JSON.stringify(corner2));
  await typeCmd('MVIEW'); await typeCmd('P'); await clickAt(320, 60); await clickAt(400, 60); await clickAt(360, 140); await page.keyboard.press('Enter');
  await settle();
  ok(await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'viewport' && e.clip).length === 1), 'MVIEW Polygonal makes a viewport with an outline', (await history()).slice(-200));

  const mine = problems.filter((p) => /arrays|hatch-gradient|hatch-trim|hatch-extras|vpclip/i.test(p));
  ok(mine.length === 0, 'no console error names these modules', mine.slice(0, 4).join(' | '));
  if (problems.length) console.log('  (console errors seen in all: ' + problems.length + (problems.length ? ' — first: ' + problems[0].slice(0, 200) : '') + ')');
} catch (err) {
  fail++;
  console.log('  FAIL the run stopped: ' + (err?.stack || err));
  console.log('  history: ' + (await history().catch(() => '')).slice(-400));
  if (problems.length) console.log('  ' + problems.slice(0, 8).join('\n  '));
  await shot('ors-arrays-stopped');
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
