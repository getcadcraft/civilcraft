/* SPDX-License-Identifier: Apache-2.0 */
/**
 * TakeoffCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): the public kitchen plan open (so the sheet bar
 * and its tools are there), what "it ran" means (a tool's own button pressed), the scale presets following a menu style onto
 * the sheet bar, and the pan buttons and wheel of the sheet view.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAN = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'), 'fixtures/pdf/kitchen-plan-sheet.pdf');
const pressed = (page, tool) => page.evaluate((t) => document.querySelector(`[data-tb-key] [data-tool="${t}"]`)?.getAttribute('aria-pressed'), tool);
const toSelect = (page) => page.evaluate(() => document.querySelector('[data-tb-key="Takeoff"] [data-tool="select"]').click());
const offset = (page) => page.evaluate(() => [window.takeoffcraft.view.ox, window.takeoffcraft.view.oy]);
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 70, r[1] + 40, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(50);
}

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-status]',
  async ready(page) {
    await page.waitForFunction(() => window.takeoffcraft?.ready, null, { timeout: 30000 });
    // a takeoff left behind by an earlier run would ask "Recover your work?": not this test's business
    await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); });
    if (!(await page.evaluate(() => window.takeoffcraft.sheets().length))) {
      await page.setInputFiles('[data-file-pdf]', PLAN);
      await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
    }
  },
  menu: { style: 'desk', cmd: 'scale.calibrate', what: 'the Calibrate tool, from the Scale menu', check: async (page) => (await pressed(page, 'calibrate')) === 'true' },
  afterRun: toSelect,
  // a menu style hides the toolbar: the scale presets wait on the sheet bar, and go back with the toolbar style
  async extra(page, ok) {
    const inBar = await page.evaluate(() => !!document.querySelector('[data-sheetbar] [data-scale-preset]'));
    const cur = await page.evaluate(() => window.ccInput.current().id);
    await page.evaluate(() => window.ccInput.setStyle('takeoffcraft'));
    await page.waitForTimeout(100);
    const back = await page.evaluate(() => !!document.querySelector('[data-tb-key="Scale"] [data-scale-preset]'));
    ok(inBar && back, 'takeoffcraft: the scale presets sit on the sheet bar in a menu style and go back to the toolbar');
    await page.evaluate((id) => window.ccInput.setStyle(id), cur);
  },
  key: {
    base: 'desk', cmd: 'scale.check', combo: 'Ctrl+Alt+D', own: 'D', what: 'the Check tool',
    check: async (page) => (await pressed(page, 'check')) === 'true',
    ownCheck: async (page) => (await pressed(page, 'check')) !== 'true',
  },
  beforeKey: toSelect,
  async afterKey(page) { await toSelect(page); },
  async mouse(page, ok, useMouse) {
    await toSelect(page);
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    let o = await offset(page); await drag(page, 'middle');
    ok(JSON.stringify(await offset(page)) === JSON.stringify(o), 'takeoffcraft: middle-drag no longer pans (style: right only)');
    o = await offset(page); await drag(page, 'right');
    ok(JSON.stringify(await offset(page)) !== JSON.stringify(o), 'takeoffcraft: right-drag pans');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: null });
    o = await offset(page); await drag(page, 'right');
    ok(JSON.stringify(await offset(page)) === JSON.stringify(o), 'takeoffcraft: right-drag does not pan (style: middle only)');
    o = await offset(page); await drag(page, 'middle');
    ok(JSON.stringify(await offset(page)) !== JSON.stringify(o), 'takeoffcraft: middle-drag pans');
    const z0 = await page.evaluate(() => window.takeoffcraft.view.z);
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.takeoffcraft.view.z) < z0, 'takeoffcraft: the wheel turned round: scrolling up zooms out');
  },
};
