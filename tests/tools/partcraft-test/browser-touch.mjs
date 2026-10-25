#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-touch.mjs — 0.4 part 2, S.8 (PartCraft's touch pass) in headless Chromium with real touch input (CDP
 * Input.dispatchTouchEvent → pointer events of type "touch"): the touch keys appear with the first finger and go with a mouse;
 * Done finishes a line chain; a long press finishes one too without placing a point; Esc is the Esc key; a finger picks a line
 * from further away than a mouse; Add and a long press add to the selection; the drawing sheet pinch-zooms and pans by touch.
 * Runs on the 0.4 default (mesh kernel).
 *   node tools/partcraft-test/browser-touch.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, tool, F } = h;
const cdp = await h.ctx.newCDPSession(page);
const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 4, radiusY: 4, force: 1 })) });
const tap = async ([x, y]) => { await touch('touchStart', [[x, y]]); await touch('touchEnd', []); await page.waitForTimeout(60); };
const hold = async ([x, y], ms = 800) => { await touch('touchStart', [[x, y]]); await page.waitForTimeout(ms); await touch('touchEnd', []); await page.waitForTimeout(60); };
const tapEl = async (sel) => { const b = await page.locator(sel).boundingBox(); await tap([b.x + b.width / 2, b.y + b.height / 2]); };
const sk2page = (p) => pc((p) => { const e = window.partcraft.editor; const r = e.canvas.getBoundingClientRect(); const [x, y] = e.toScreen(p); return [r.left + x, r.top + y]; }, p);
const lines = () => pc(() => window.partcraft.part.features.find((f) => f.id === window.partcraft.editing).sketch.entities.filter((e) => e.type === 'line').map((e) => e.id));
const visible = (k) => page.isVisible(`[data-touchbar] [data-touch="${k}"]`);
const sel = () => pc(() => [...window.partcraft.editor.sel]);

try {
  console.log('\n== touch (S.8): the touch keys');
  await page.click('[data-plane="front"]');
  await tool('sketch');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await pc(() => window.partcraft.editor.setView({ cx: 70, cy: 10, s: 3 }));
  await pc(() => window.partcraft.editor.setTool('select'));   // a new sketch starts with Line
  ok(await page.isHidden('[data-touchbar]'), 'with a mouse there are no touch keys');
  await tap(await sk2page([60, 60]));
  ok(await page.isVisible('[data-touchbar]') && await visible('esc') && await visible('add') && !(await visible('done')), 'the first finger shows the touch keys: Esc, and Add with Select (no Done: nothing is being drawn)');
  ok(/Hold a finger still/.test(await h.statusText()), 'the status bar says what holding a finger does');

  console.log('\n== touch: Done and a long press finish a line chain');
  await page.keyboard.press('l');
  for (const p of [[0, 0], [40, 0], [40, 30]]) await tap(await sk2page(p));
  ok(await visible('done') && !(await visible('add')), 'while drawing a chain: Done shows, Add does not');
  await tapEl('[data-touchbar] [data-touch="done"]');
  ok((await lines()).length === 2 && !(await pc(() => window.partcraft.editor.step)) && !(await visible('done')), `Done finishes the chain: 2 lines (${(await lines()).length}), nothing in progress, Done hidden again`);
  for (const p of [[100, 0], [140, 0]]) await tap(await sk2page(p));
  await hold(await sk2page([140, 30]));
  ok((await lines()).length === 3 && !(await pc(() => window.partcraft.editor.step)), `holding a finger still finishes the next chain without placing a point there (${(await lines()).length} lines)`);

  console.log('\n== touch: Esc');
  await tapEl('[data-touchbar] [data-touch="esc"]');
  const afterEsc = await pc(() => [window.partcraft.mode, window.partcraft.editor.tool]);
  ok(afterEsc[0] === 'sketch' && afterEsc[1] === 'select', `Esc drops the line tool, as the key does (${afterEsc.join(', ')})`);

  console.log('\n== touch: picking and selecting with a finger');
  const [l1, l2] = await lines();
  const a = await sk2page([20, 0]);
  await tap([a[0], a[1] - 12]);
  ok((await sel()).join() === l1, 'a finger 12 px off the first line still picks it (a mouse needs 7)');
  await tap(await sk2page([60, 60]));   // empty paper: nothing
  await tap(await sk2page([20, 0]));
  await tapEl('[data-touchbar] [data-touch="add"]');
  ok((await page.getAttribute('[data-touchbar] [data-touch="add"]', 'aria-pressed')) === 'true', 'Add stays pressed');
  await tap(await sk2page([40, 15]));
  ok((await sel()).length === 2 && (await sel()).includes(l1) && (await sel()).includes(l2), 'with Add on, a second tap adds the second line (2 selected)');
  await tapEl('[data-touchbar] [data-touch="add"]');
  await tap(await sk2page([20, 0]));
  ok((await sel()).join() === l1, 'Add off: a tap selects one line again');
  await hold(await sk2page([40, 15]));
  ok((await sel()).length === 2, 'holding a finger on another line adds it (2 selected)');
  await hold(await sk2page([40, 15]));
  ok((await sel()).join() === l1, 'holding it again takes it out');
  await h.shot('touch-sketch');

  console.log('\n== touch: the drawing sheet pinches and pans');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await h.built();
  await tapEl('.pc-tools [data-cmd="drawing"]');
  await page.waitForFunction(() => window.partcraft.mode === 'drawing' && document.querySelector('.pc-sheet-svg g')?.getAttribute('transform'));
  const tf = () => page.getAttribute('.pc-sheet-svg > g', 'transform');
  const scaleOf = (s) => Number((/matrix\(([-\d.e]+)/.exec(s) || [])[1]);
  const r = await page.locator('.pc-sheet-svg').boundingBox();
  const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  const t0 = await tf();
  await touch('touchStart', [[cx - 60, cy], [cx + 60, cy]]);
  for (let i = 1; i <= 6; i++) { const d = 60 + i * 20; await touch('touchMove', [[cx - d, cy], [cx + d, cy]]); }
  await touch('touchEnd', []);
  await page.waitForTimeout(100);
  const t1 = await tf();
  const k0 = scaleOf(t0), k1 = scaleOf(t1);
  ok(Number.isFinite(k0) && k1 > k0 * 1.8, `a pinch out zooms in (×${(k1 / k0).toFixed(2)} for fingers 120 → 360 px apart)`);
  await touch('touchStart', [[cx - 50, cy], [cx + 50, cy]]);
  for (let i = 1; i <= 5; i++) await touch('touchMove', [[cx - 50 + i * 16, cy + i * 10], [cx + 50 + i * 16, cy + i * 10]]);
  await touch('touchEnd', []);
  await page.waitForTimeout(100);
  const t2 = await tf();
  ok(t2 !== t1 && Math.abs(scaleOf(t2) / k1 - 1) < 1e-6, 'two fingers moved together pan without zooming');
  const nNotes = await pc(() => window.partcraft.part.drawing?.notes?.length || 0);
  await touch('touchStart', [[cx + 200, cy + 150]]);
  for (let i = 1; i <= 5; i++) await touch('touchMove', [[cx + 200 - i * 20, cy + 150 - i * 10]]);
  await touch('touchEnd', []);
  await page.waitForTimeout(100);
  ok((await tf()) !== t2 && (await pc(() => window.partcraft.part.drawing?.notes?.length || 0)) === nNotes, 'one finger dragged on empty paper pans, and places nothing');
  await h.shot('touch-sheet');

  console.log('\n== touch: a mouse takes the touch keys away');
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(50);
  ok(await page.isHidden('[data-touchbar]'), 'a mouse click hides the touch keys');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();
