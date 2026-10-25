/* SPDX-License-Identifier: Apache-2.0 */
/**
 * PartCraft's probe for tools/shell-test/browser-input-apps.mjs (0.5 IP.7): a workspace switched from the Feature tree
 * ribbon (the hidden switcher buttons), Measure on a remapped key with the own M held back, the sketch editor keeping its
 * letters, and the 3D view's buttons (middle orbits, left only picks) from a style's mouse.
 */
const measureOn = (page) => page.evaluate(() => document.querySelector('[data-cmd="view-measure"]').getAttribute('aria-checked') === 'true');
const cam = (page) => page.evaluate(() => window.partcraft.view.camera.position.toArray().map((v) => +v.toFixed(5)).join());
async function drag(page, button) {
  const r = await page.evaluate(() => { const b = document.querySelector('[data-gl]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 90, r[1] + 40, { steps: 8 });
  await page.mouse.up({ button });
  await page.waitForTimeout(80);
}
let was = null;

export default {
  ignoreConsole: [/WebGL|GPU stall|GL_|SharedArrayBuffer/i],
  statusSel: '[data-status]',
  ready: async (page) => {
    await page.waitForFunction(() => window.partcraft && window.partcraft.view, null, { timeout: 60000 });
    await page.evaluate(() => window.partcraft.ready);
  },
  menu: { style: 'feature', cmd: 'ws.simulation', what: 'the Simulation workspace is open', check: (page) => page.evaluate(() => window.partcraft.workspace === 'simulation') },
  afterRun: (page) => page.evaluate(() => window.partcraft.setWorkspace('design')),
  key: {
    base: 'feature', cmd: 'view.measure', combo: 'Ctrl+Alt+M', own: 'M', what: 'Measure turned on',
    async check(page) { const v = await measureOn(page); const w = was; was = v; return w === null ? v : v !== w; },
    ownCheck: async (page) => (await measureOn(page)) === was,
  },
  async beforeKey(page) { await page.click('[data-gl]', { position: { x: 5, y: 5 } }).catch(() => {}); if (await measureOn(page)) await page.evaluate(() => window.partcraft.run('view-measure')); was = null; },
  async afterKey(page) { if (await measureOn(page)) await page.evaluate(() => window.partcraft.run('view-measure')); was = false; },
  async extra(page, ok) {
    // a sketch tool outside a sketch says what to do first; a Design tool from another workspace switches back first
    await page.evaluate(() => window.ccInput.setStyle('feature'));
    const ran = await page.evaluate(() => window.ccInput.run('sketch.line'));
    const said = await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
    ok(ran === false && /sketch first/i.test(said), 'partcraft: Line outside a sketch: "' + said.slice(0, 80) + '"');
    await page.evaluate(() => window.partcraft.setWorkspace('manufacture'));
    await page.evaluate(() => window.ccInput.run('view.fit'));
    ok(await page.evaluate(() => window.partcraft.workspace) === 'manufacture', 'partcraft: View tools run in any workspace (Fit stays in Manufacture)');
    await page.evaluate(() => window.ccInput.run('feature.plane'));
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => window.partcraft.workspace) === 'design', 'partcraft: a Design tool from Manufacture switches to Design first');
    await page.keyboard.press('Escape');
    // the mouse of the Feature tree style on the 3D view
    const btns = await page.evaluate(() => window.partcraft.view.controls.mouseButtons);
    ok(btns.LEFT === null && btns.MIDDLE === 0 && btns.RIGHT === 2, 'partcraft/feature: 3D view — left only picks, middle orbits, right pans ' + JSON.stringify(btns));
    await page.evaluate(() => window.ccInput.setStyle('partcraft'));
  },
  async mouse(page, ok, useMouse) {
    await page.evaluate(() => window.partcraft.view.view('iso'));
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: { left: 'none', middle: 'orbit', right: 'none' } });
    let c0 = await cam(page); await drag(page, 'left');
    ok(await cam(page) === c0, 'partcraft: a left drag no longer turns the 3D view (style: middle orbits)');
    c0 = await cam(page); await drag(page, 'middle');
    ok(await cam(page) !== c0, 'partcraft: a middle drag turns it');
    await useMouse({ wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    c0 = await cam(page); await drag(page, 'left');
    ok(await cam(page) !== c0, 'partcraft: back to the view\'s own buttons: a left drag turns it again');
    const z0 = await page.evaluate(() => window.partcraft.view.camera.zoom);
    await useMouse({ wheel: -1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: null });
    const r = await page.evaluate(() => { const b = document.querySelector('[data-gl]').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await page.mouse.move(r[0], r[1]);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(80);
    ok(await page.evaluate(() => window.partcraft.view.camera.zoom) < z0, 'partcraft: the wheel turned round: scrolling up zooms out');
  },
};
