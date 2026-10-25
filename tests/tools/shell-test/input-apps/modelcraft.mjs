/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ModelCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): the tool in use is what "it ran" means; the
 * Modeler style and the older Keys setting stay one (settings.keys follows the style, the old select picks the style); a
 * person who had the modeler keys gets the Modeler style once; the middle and right buttons follow the style in 3D.
 */
const tool = (page) => page.evaluate(() => window.modelcraft.tools.name);
const toSelect = (page) => page.evaluate(() => document.querySelector('.mc-tools [data-tool="select"]').click());
const cam = (page) => page.evaluate(() => JSON.stringify([window.modelcraft.cam.eye, window.modelcraft.cam.target].flat().map((v) => +v.toFixed(4))));
async function drag(page, button, mods = []) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  for (const k of mods) await page.keyboard.down(k);
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 70, r[1] + 40, { steps: 8 });
  await page.mouse.up({ button });
  for (const k of mods) await page.keyboard.up(k);
  await page.waitForTimeout(50);
}
const overFocus = (page) => page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-msg]',
  ready: (page) => page.waitForFunction(() => window.modelcraft?.tools && window.modelcraft.syncKeyStyle, null, { timeout: 30000 }),
  before: (page) => page.evaluate(() => { try { localStorage.removeItem('modelcraft.settings'); localStorage.setItem('modelcraft.keys.carried', '1'); } catch (e) { /* none */ } }),
  menu: { style: 'pushpull', cmd: 'draw.rect', what: 'the Rectangle tool is in use', check: async (page) => (await tool(page)) === 'rect' },
  afterRun: toSelect,
  key: {
    base: 'pushpull', cmd: 'draw.circle', combo: 'Ctrl+Alt+C', own: 'C', what: 'the Circle tool is in use',
    check: async (page) => (await tool(page)) === 'circle',
    ownCheck: async (page) => (await tool(page)) !== 'circle',
  },
  beforeKey: async (page) => { await toSelect(page); await overFocus(page); },
  afterKey: async (page) => { await toSelect(page); await overFocus(page); },
  async extra(page, ok) {
    // Modeler: the modeler key set, read by ModelCraft itself
    await page.evaluate(() => window.ccInput.setStyle('modeler'));
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.modelcraft.settings.keys) === 'blender' && await page.inputValue('[data-mc-keys]') === 'blender', 'modelcraft: Modeler sets the older Keys setting to the modeler keys');
    await overFocus(page);
    await page.keyboard.press('b');
    ok((await tool(page)) === 'rect', 'modelcraft/modeler: B = Rectangle (the app\'s own modeler key)');
    await toSelect(page); await overFocus(page);
    await page.keyboard.press('e');
    ok((await tool(page)) === 'push', 'modelcraft/modeler: E = Push/pull');
    await toSelect(page); await overFocus(page);
    await page.keyboard.press('p');
    const said = await page.textContent('[data-msg]');
    ok((await tool(page)) === 'select' && /Modeler/.test(said), 'modelcraft/modeler: P (push/pull in the push-pull keys) says where it went: "' + said + '"');
    await page.click('[data-input-bar] summary:text("Add")');
    await page.click('[data-input-bar] details[open] [data-cmd="draw.circle"]');
    ok((await tool(page)) === 'circle', 'modelcraft/modeler: Add › Circle');
    await toSelect(page);
    // the older Keys select picks the style
    await page.selectOption('[data-mc-keys]', 'sketchup');
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.ccInput.current().id) === 'modelcraft' && await page.evaluate(() => window.modelcraft.settings.keys) === 'sketchup', 'modelcraft: the Keys select back to push-pull keys → the ModelCraft style');
    await page.selectOption('[data-mc-keys]', 'blender');
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.ccInput.current().id) === 'modeler', 'modelcraft: the Keys select on modeler keys → the Modeler style');
    // the modeler keys chosen in an older version: the Modeler style once
    await page.evaluate(() => {
      localStorage.removeItem('modelcraft.input'); localStorage.removeItem('modelcraft.keys.carried');
      localStorage.setItem('modelcraft.settings', JSON.stringify({ keys: 'blender' }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ccInput?.current() && window.modelcraft?.syncKeyStyle);
    await page.waitForTimeout(100);
    ok(await page.evaluate(() => window.ccInput.current().id) === 'modeler', 'modelcraft: someone who had the modeler keys opens in the Modeler style');
    await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.modelcraft.settings.keys) === 'sketchup', 'modelcraft: back on the ModelCraft style, the push-pull keys');
  },
  async mouse(page, ok, useMouse) {
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: { left: 'none', middle: 'pan', right: 'none' } });
    let c0 = await cam(page); await drag(page, 'right');
    ok((await cam(page)) === c0, 'modelcraft: the right button does nothing in 3D (style: right none)');
    c0 = await cam(page); await drag(page, 'middle');
    const c1 = await cam(page);
    ok(c1 !== c0, 'modelcraft: the middle button pans (style: middle pan)');
    const d = (s) => { const a = JSON.parse(s); return Math.hypot(a[0] - a[3], a[1] - a[4], a[2] - a[5]); };
    ok(Math.abs(d(c1) - d(c0)) < 1e-3, 'modelcraft: … a pan, not an orbit or a zoom (the eye keeps its distance)');
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    c0 = await cam(page);
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(50);
    ok(d(await cam(page)) > d(c0), 'modelcraft: the wheel turned round: scrolling up zooms out');
  },
};
