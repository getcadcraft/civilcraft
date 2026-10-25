/* SPDX-License-Identifier: Apache-2.0 */
/**
 * CadCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): what "it ran" means here, the 3D group opened
 * once for the coverage check, the WL.18 text keys at the command line, the carry of cadcraft.shortcuts, and the pan buttons.
 */
const running = (page) => page.evaluate(() => window.cadcraft.engine.running);
const escape = async (page) => { await page.evaluate(async () => { const e = window.cadcraft.engine; if (e.busy) { e.escape(); await e.done; } }); };
const pressed = (page, sel) => page.evaluate((s) => document.querySelector(s).getAttribute('aria-pressed'), sel);
const center = (page) => page.evaluate(() => [window.cadcraft.view.cx, window.cadcraft.view.cy]);
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 80, r[1] + 50, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(50);
}
let orthoWas = null;

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_/i],
  statusSel: '[data-status]',
  ready: (page) => page.waitForFunction(() => window.cadcraft?.engine && window.cadcraft.host?.shortcuts, null, { timeout: 30000 }),
  before: (page) => page.evaluate(() => { try { localStorage.removeItem('cadcraft.shortcuts'); } catch (e) { /* none */ } }),
  // the 3D group joins the toolbar the first time the 3D tab opens: open it so its buttons are checked too
  async coverage(page) {
    await page.click('[data-tabs] > [role="tab"]:nth-child(2)');
    await page.waitForFunction(() => window.cadcraft.host.ws3d?.active, null, { timeout: 60000 });
  },
  async afterCoverage(page) {
    await page.click('[data-tabs] > [role="tab"]:nth-child(1)');
    await page.waitForFunction(() => !window.cadcraft.host.ws3d?.active);
  },
  menu: { style: 'drafting', cmd: 'draw.circle', what: 'CIRCLE is running', check: async (page) => (await running(page)) === 'CIRCLE' },
  afterRun: escape,
  key: {
    base: 'drafting', cmd: 'aids.ortho', combo: 'Ctrl+Alt+O', own: 'F8', what: 'Ortho turned on',
    async check(page) { const v = await pressed(page, '[data-toggle="ortho"]'); const was = orthoWas; orthoWas = v; return was === null ? v === 'true' : v !== was; },
    ownCheck: async (page) => (await pressed(page, '[data-toggle="ortho"]')) === orthoWas,
  },
  async beforeKey(page) { orthoWas = null; if ((await pressed(page, '[data-toggle="ortho"]')) === 'true') await page.click('[data-toggle="ortho"]'); orthoWas = null; },
  async afterKey(page) { if ((await pressed(page, '[data-toggle="ortho"]')) === 'true') await page.click('[data-toggle="ortho"]'); orthoWas = 'false'; },
  async extra(page, ok) {
    // WL.18 text keys: a key that types a command; it works with the focus in the (empty) command line too
    await page.evaluate(() => window.ccInput.importText(JSON.stringify({ format: 'cadcraft-input', version: 1, name: 'Text keys', base: 'cadcraft', macros: { 'Ctrl+Alt+L': 'LINE' } })));
    await page.focus('[data-cmd-input]');
    await page.keyboard.press('Control+Alt+L');
    await page.waitForTimeout(100);
    ok((await running(page)) === 'LINE', 'cadcraft: a text key (Ctrl+Alt+L → LINE) runs with the focus in the empty command line');
    await escape(page);
    await page.keyboard.type('ci');
    await page.keyboard.press('Control+Alt+L');
    ok((await page.inputValue('[data-cmd-input]')) === 'ci' && !(await running(page)), 'cadcraft: with letters typed at the command line, keys stay the command line\'s');
    await page.fill('[data-cmd-input]', '');
    // the WL.18 carry: keys made with SHORTCUTS in an older build come in once as "My CadCraft keys"
    await page.evaluate(() => {
      localStorage.removeItem('cadcraft.input');
      localStorage.setItem('cadcraft.shortcuts', JSON.stringify({ format: 'cadcraft-shortcuts', version: 1, keys: { 'Ctrl+Alt+R': 'RECTANG' } }));
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ccInput && window.cadcraft?.host?.shortcuts);
    const cur = await page.evaluate(() => window.ccInput.current());
    ok(/My CadCraft keys/.test(cur.name) && cur.macros && cur.macros['Ctrl+Alt+R'] === 'RECTANG', 'cadcraft: SHORTCUTS\' keys carried into "' + cur.name + '"');
    await page.keyboard.press('Control+Alt+R');
    await page.waitForTimeout(100);
    ok((await running(page)) === 'RECTANG', 'cadcraft: the carried key runs RECTANG');
    await escape(page);
    ok(await page.evaluate(() => [...window.cadcraft.host.shortcuts.keys()].some(([k, v]) => /R$/.test(k) && v === 'RECTANG')), 'cadcraft: SHORTCUTS reads its keys from the style now');
    await page.evaluate(() => localStorage.removeItem('cadcraft.shortcuts'));
  },
  async mouse(page, ok, useMouse) {
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['right'], orbit3d: null });
    let c0 = await center(page); await drag(page, 'middle');
    ok(JSON.stringify(await center(page)) === JSON.stringify(c0), 'cadcraft: middle-drag no longer pans (style: right only)');
    c0 = await center(page); await drag(page, 'right');
    ok(JSON.stringify(await center(page)) !== JSON.stringify(c0), 'cadcraft: right-drag pans');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle'], orbit3d: null });
    c0 = await center(page); await drag(page, 'right');
    ok(JSON.stringify(await center(page)) === JSON.stringify(c0), 'cadcraft: right-drag does not pan (style: middle only)');
    c0 = await center(page); await drag(page, 'middle');
    ok(JSON.stringify(await center(page)) !== JSON.stringify(c0), 'cadcraft: middle-drag pans');
    const z0 = await page.evaluate(() => window.cadcraft.view.zoom);
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-over]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(50);
    ok(await page.evaluate(() => window.cadcraft.view.zoom) < z0, 'cadcraft: the wheel turned round: scrolling up zooms out');
  },
};
