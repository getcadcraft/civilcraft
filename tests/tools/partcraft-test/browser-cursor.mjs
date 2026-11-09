#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cursor.mjs — 0.9 FX.35 in PartCraft: full screen with the toolbars hidden (the shell's "autohide" mode) must leave the pointer
 * alone: no hidden-cursor style on the 3D view, pointer moves keep reaching it for longer than the 2 s the report names, the wheel and
 * a right click do not change it, and Escape / leaving the mode gives back a normal pointer. (The reporter's freeze was on Windows
 * Studio 0.8.x; this is the page-level check. A style that hides the pointer anywhere on the view would fail it.)
 *   node tools/partcraft-test/browser-cursor.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { ok } = h;
const page = h.page;

try {
  await page.evaluate(() => window.partcraft.built());
  const cursorOf = () => page.evaluate(() => { const c = document.querySelector('canvas'); return getComputedStyle(c).cursor + '|' + getComputedStyle(document.body).cursor; });
  await page.evaluate(() => { window.__moves = 0; document.addEventListener('pointermove', () => { window.__moves++; }, true); });
  const box = await page.evaluate(() => { const r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await page.mouse.move(box.x, box.y);
  ok(!(await cursorOf()).includes('none'), 'normal screen: the 3D view does not hide the pointer (' + (await cursorOf()) + ')');

  for (const mode of ['full', 'autohide']) {
    await page.click('[data-fs-cycle]').catch(() => {});   // a real click is the gesture full screen needs
    await page.evaluate((m) => window.ccShellScreen?.goTo(m === 'full' ? 'full' : 'hidden'), mode);
    await page.waitForTimeout(300);
    const m0 = await page.evaluate(() => window.__moves);
    for (let i = 0; i < 14; i++) { await page.mouse.move(box.x + (i % 7) * 12, box.y + (i % 5) * 9); await page.waitForTimeout(250); }   // 3.5 s, past the reported 2 s
    const m1 = await page.evaluate(() => window.__moves);
    ok(m1 - m0 >= 14, mode + ': pointer moves keep arriving for 3.5 s (' + (m1 - m0) + ')');
    ok(!(await cursorOf()).includes('none'), mode + ': no hidden-pointer style after 3.5 s (' + (await cursorOf()) + ')');
    await page.mouse.wheel(0, 120); await page.mouse.click(box.x, box.y, { button: 'right' }); await page.waitForTimeout(200);
    ok(!(await cursorOf()).includes('none'), mode + ': wheel and right click leave the pointer showing');
    await page.evaluate(() => window.ccShellScreen?.goTo('normal')); await page.waitForTimeout(300);
    ok(!(await cursorOf()).includes('none'), mode + ': back to the normal screen, the pointer shows');
  }
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();
