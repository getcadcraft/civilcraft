/* SPDX-License-Identifier: Apache-2.0 */
/**
 * CivilCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): what "it ran" means here, a typed command
 * at Drafting classic's command line, the pan buttons of the plan and the wheel.
 */
const tool = (page) => page.evaluate(() => window.civilcraft.tool);
const toSelect = (page) => page.evaluate(() => window.civilcraft.setTool('select'));
const center = (page) => page.evaluate(() => [window.civilcraft.view.cx, window.civilcraft.view.cy]);
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 80, r[1] + 50, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(50);
}

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-status]',
  ready: (page) => page.waitForFunction(() => window.civilcraft?.view, null, { timeout: 30000 }),
  menu: { style: 'ribbon', cmd: 'design.alignment', what: 'the Alignment tool is on', check: async (page) => (await tool(page)) === 'alignment' },
  afterRun: toSelect,
  key: {
    base: 'ribbon', cmd: 'design.pad', combo: 'Ctrl+Alt+G', own: 'G', what: 'the Pad tool is on',
    check: async (page) => (await tool(page)) === 'pad',
    ownCheck: async (page) => (await tool(page)) === 'select',
  },
  beforeKey: toSelect,
  afterKey: toSelect,
  async extra(page, ok) {
    // Drafting classic: letters go to the shell's command line; a typed word runs its command
    await page.evaluate(() => window.ccInput.setStyle('drafting'));
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.type('align');
    await page.keyboard.press('Enter');
    ok((await tool(page)) === 'alignment', 'civilcraft/drafting: typed ALIGN + Enter = the Alignment tool');
    await toSelect(page);
  },
  async mouse(page, ok, useMouse) {
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    let c0 = await center(page); await drag(page, 'middle');
    ok(JSON.stringify(await center(page)) === JSON.stringify(c0), 'civilcraft: middle-drag no longer pans (style: right only)');
    c0 = await center(page); await drag(page, 'right');
    ok(JSON.stringify(await center(page)) !== JSON.stringify(c0), 'civilcraft: right-drag pans');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: null });
    c0 = await center(page); await drag(page, 'right');
    ok(JSON.stringify(await center(page)) === JSON.stringify(c0), 'civilcraft: right-drag does not pan (style: middle only)');
    c0 = await center(page); await drag(page, 'middle');
    ok(JSON.stringify(await center(page)) !== JSON.stringify(c0), 'civilcraft: middle-drag pans');
    const z0 = await page.evaluate(() => window.civilcraft.view.zoom);
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.civilcraft.view.zoom) < z0, 'civilcraft: the wheel turned round: scrolling up zooms out');
  },
};
