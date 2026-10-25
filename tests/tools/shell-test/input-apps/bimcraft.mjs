/* SPDX-License-Identifier: Apache-2.0 */
/**
 * BimCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7). BimCraft's own deeper pass is
 * tools/bimcraft-test/browser-input.mjs; this one runs the shared checks over a new one-storey building, with the Viewer style
 * (0.5 IP.3) for the menu run.
 */
const tool = (page) => page.evaluate(() => window.bimcraftPlan?.state?.tool);
const settled = (page) => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const pan = (page) => page.evaluate(() => [window.bimcraftPlan.view.cx, window.bimcraftPlan.view.cy]);
async function dragPlan(page, button) {
  const r = await page.evaluate(() => { const b = window.bimcraftPlan.view.canvas.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height * 0.6]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 60, r[1] + 40, { steps: 6 });
  await page.mouse.up({ button });
}

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-status]',
  async ready(page) {
    if (await page.evaluate(() => !!window.bimcraftPlan?.state?.on)) return;
    if (!(await page.isVisible('[data-empty] [data-new]'))) return;
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new');
    await page.fill('[data-new-name]', 'Input test');
    await page.fill('[data-new-levels]', '1');
    await page.fill('[data-new-height]', '3000 mm');
    await page.click('[data-new-ok]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled(page);
  },
  before: (page) => page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } }),
  menu: { style: 'viewer', cmd: 'model.wall', what: 'the Wall tool, from the Model menu', check: async (page) => (await tool(page)) === 'wall' },
  afterRun: (page) => page.keyboard.press('Escape'),
  key: {
    base: 'viewer', cmd: 'model.door', combo: 'Ctrl+Alt+D', own: 'D', what: 'the Door tool',
    check: async (page) => (await tool(page)) === 'door',
    ownCheck: async (page) => (await tool(page)) !== 'door',
  },
  async beforeKey(page) { await page.keyboard.press('Escape'); await page.click('[data-model-toggle][aria-pressed="false"]').catch(() => {}); },
  async afterKey(page) { await page.keyboard.press('Escape'); },
  async mouse(page, ok, useMouse) {
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    let p0 = await pan(page); await dragPlan(page, 'middle');
    ok(JSON.stringify(await pan(page)) === JSON.stringify(p0), 'bimcraft: plan middle-drag no longer pans (style: right only)');
    p0 = await pan(page); await dragPlan(page, 'right');
    ok(JSON.stringify(await pan(page)) !== JSON.stringify(p0), 'bimcraft: plan right-drag pans');
  },
};
