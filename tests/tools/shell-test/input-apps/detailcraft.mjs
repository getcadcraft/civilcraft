/* SPDX-License-Identifier: Apache-2.0 */
/**
 * DetailCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): what "it ran" means here, a typed command at
 * Drafting classic's command line, the pan buttons of the plan view, the 3D buttons and the wheel.
 */
const tool = (page) => page.evaluate(() => window.detailcraft.tool);
const toSelect = (page) => page.evaluate(() => window.detailcraft.setTool('select'));
const cam = (page) => page.evaluate(() => { const c = window.detailcraft.view.camera; return [c.position.x, c.position.y, c.position.z, c.zoom].map((v) => +v.toFixed(6)); });
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-canvas]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 80, r[1] + 50, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(50);
}

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-status]',
  ready: (page) => page.waitForFunction(() => window.detailcraft?.view, null, { timeout: 30000 }),
  menu: { style: 'steel', cmd: 'place.beam', what: 'the Beam tool is on', check: async (page) => (await tool(page)) === 'beam' },
  afterRun: toSelect,
  key: {
    base: 'steel', cmd: 'place.column', combo: 'Ctrl+Alt+C', own: 'C', what: 'the Column tool is on',
    check: async (page) => (await tool(page)) === 'column',
    ownCheck: async (page) => (await tool(page)) === 'select',
  },
  beforeKey: toSelect,
  afterKey: toSelect,
  async extra(page, ok) {
    // Drafting classic: letters go to the shell's command line; a typed word runs its command
    await page.evaluate(() => window.ccInput.setStyle('drafting'));
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.type('brace');
    await page.keyboard.press('Enter');
    ok((await tool(page)) === 'brace', 'detailcraft/drafting: typed BRACE + Enter = the Brace tool');
    await toSelect(page);
    const btns = await page.evaluate(() => { const b = window.detailcraft.view.controls.mouseButtons; return [b.LEFT, b.MIDDLE, b.RIGHT]; });
    ok(btns[0] === null && btns[1] === 2 && btns[2] === null, 'detailcraft/drafting: 3D view — middle pans, left and right do nothing (Shift + middle orbits): ' + JSON.stringify(btns));
    // M (Move) is a command too (0.5 final sweep: Edit › More › Move), so a style can move it to another key
    await page.evaluate(() => window.detailcraft.act('sample'));
    await page.waitForFunction(() => window.detailcraft.model.state.members.length > 0, null, { timeout: 30000 });
    const t = JSON.stringify({ format: 'cadcraft-input', version: 1, name: 'Test move key', base: 'detailcraft', keys: { 'edit.move': ['G'] } });
    ok(await page.evaluate((x) => !!window.ccInput.importText(x), t), 'detailcraft: a style with Move on G imported');
    await page.evaluate(() => { document.activeElement?.blur(); window.detailcraft.act('select-all'); });
    await page.keyboard.press('g');
    ok((await tool(page)) === 'move', 'detailcraft: G runs Move (the M key\'s command, remapped)');
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.detailcraft.act('select-all'));
    await page.keyboard.press('m');
    ok((await tool(page)) === 'select', 'detailcraft: the own key M no longer runs Move');
    await toSelect(page);
  },
  async mouse(page, ok, useMouse) {
    await page.evaluate(() => window.detailcraft.setView('plan'));
    await page.waitForTimeout(200);
    await toSelect(page);
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    let c0 = await cam(page); await drag(page, 'middle');
    ok(JSON.stringify(await cam(page)) === JSON.stringify(c0), 'detailcraft: plan middle-drag no longer pans (style: right only)');
    c0 = await cam(page); await drag(page, 'right');
    ok(JSON.stringify(await cam(page)) !== JSON.stringify(c0), 'detailcraft: plan right-drag pans');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: null });
    c0 = await cam(page); await drag(page, 'right');
    ok(JSON.stringify(await cam(page)) === JSON.stringify(c0), 'detailcraft: plan right-drag does not pan (style: middle only)');
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const z0 = (await cam(page))[3];
    const r = await page.evaluate(() => { const b = document.querySelector('[data-canvas]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(100);
    ok((await cam(page))[3] < z0, 'detailcraft: the wheel turned round: scrolling up zooms out');
    await page.evaluate(() => window.detailcraft.setView('3d'));
  },
};
