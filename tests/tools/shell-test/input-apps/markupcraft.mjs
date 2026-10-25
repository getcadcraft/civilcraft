/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): the public kitchen sheet opened, "it ran" =
 * the tool in use, the own key held back in PDF review, typing in a text box untouched, and the pan buttons.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../fixtures/pdf/kitchen-plan-sheet.pdf');
const tool = (page) => page.evaluate(() => window.markupcraft.tool);
const origin = (page) => page.evaluate(() => [window.markupcraft.view.ox, window.markupcraft.view.oy]);
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 80, r[1] + 50, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(50);
}

export default {
  statusSel: '[data-status]',
  before: (page) => page.evaluate(() => { try { localStorage.setItem('markupcraft.author', 'Input Test'); } catch (e) { /* none */ } }),
  async ready(page) {
    await page.waitForFunction(() => window.markupcraft?.view, null, { timeout: 30000 });
    if (await page.evaluate(() => !!window.markupcraft.view.page)) return;
    await page.setInputFiles('[data-file]', [PLAN]);
    await page.waitForFunction(() => window.markupcraft.view.page && window.markupcraft.sheets.length, null, { timeout: 60000 });
  },
  menu: { style: 'review', cmd: 'tool.callout', what: 'the Callout tool, from Markup', check: async (page) => (await tool(page)) === 'callout' },
  async afterRun(page) { await page.evaluate(() => window.markupcraft.setTool('select')); },
  key: {
    base: 'review', cmd: 'tool.count', combo: 'Ctrl+Alt+U', own: 'U', what: 'the Count tool',
    check: async (page) => (await tool(page)) === 'count',
    ownCheck: async (page) => (await tool(page)) !== 'count',   // afterKey went back to Select; the held-back U must not pick Count again   // U is held back: nothing else was picked
  },
  async beforeKey(page) { await page.evaluate(() => window.markupcraft.setTool('select')); await page.click('[data-over]', { position: { x: 5, y: 5 } }).catch(() => {}); },
  async afterKey(page) { await page.evaluate(() => window.markupcraft.setTool('select')); },
  async extra(page, ok) {
    // PDF review's own letters: Q is Callout here, H the highlighter
    await page.evaluate(() => window.ccInput.setStyle('review'));
    await page.keyboard.press('h');
    ok((await tool(page)) === 'highlight', 'markupcraft/review: H = highlighter');
    await page.keyboard.press('Shift+V');
    ok((await tool(page)) === 'pan', 'markupcraft/review: Shift+V = pan');
    await page.keyboard.press('Alt+Shift+C');
    ok((await tool(page)) === 'count', 'markupcraft/review: Alt+Shift+C = count');
    // typing in a text box keeps every letter
    await page.evaluate(() => window.markupcraft.setTool('text'));
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width * 0.4, b.top + b.height * 0.4]; });
    await page.mouse.click(r[0], r[1]);
    const ta = await page.waitForSelector('[data-edit] textarea, textarea[data-edit], [data-edit]:not([hidden]) textarea', { timeout: 5000 }).catch(() => null);
    if (ta) {
      await page.keyboard.type('hvq');
      ok((await ta.inputValue()) === 'hvq' && (await tool(page)) === 'text', 'markupcraft/review: letters typed in a text box stay in it');
      await page.keyboard.press('Escape');
    } else ok(false, 'markupcraft: the text box editor opened');
    await page.evaluate(() => window.markupcraft.setTool('select'));
  },
  async mouse(page, ok, useMouse) {
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    await page.waitForTimeout(400);   // the status line's message may resize the stage once
    let o = await origin(page); await drag(page, 'middle');
    ok(JSON.stringify(await origin(page)) === JSON.stringify(o), 'markupcraft: middle-drag no longer pans (style: right only)');
    o = await origin(page); await drag(page, 'right');
    ok(JSON.stringify(await origin(page)) !== JSON.stringify(o), 'markupcraft: right-drag pans');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: null });
    await page.waitForTimeout(400);
    o = await origin(page); await drag(page, 'right');
    ok(JSON.stringify(await origin(page)) === JSON.stringify(o), 'markupcraft: right-drag does not pan (style: middle only)');
    o = await origin(page); await drag(page, 'middle');
    ok(JSON.stringify(await origin(page)) !== JSON.stringify(o), 'markupcraft: middle-drag pans');
    const z0 = await page.evaluate(() => window.markupcraft.view.z);
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(80);
    ok(await page.evaluate(() => window.markupcraft.view.z) < z0, 'markupcraft: the wheel turned round: scrolling up zooms out');
  },
};
