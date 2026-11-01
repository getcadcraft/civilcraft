#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * takeoffcraft.mjs — TakeoffCraft hands its views to the input-device layer (0.8 Track ID, assets/js/app-devices-ui.js): the sheet
 * view zooms / pans / fits like the wheel and middle drag; the 3D check view (view3d.js) orbits, pans, zooms and fits, and the
 * sheet view passes its moves on to it while 3D is open.   nice -n 10 timeout 300 node tools/shell-test/devices-views/takeoffcraft.mjs
 */
import path from 'node:path';
import { open, ok, res, REPO } from './_open.mjs';

const { browser, page, errors, T } = await open('takeoffcraft');
try {
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await T(() => window.takeoffcraft.recovery) === 'asking') await page.click('[data-autosave-discard-all]');
  console.log('== sheet view');
  ok((await T(() => window.ccShellDevices.views().map((v) => v.kind))).includes('2d'), 'a 2D view is registered');
  await page.setInputFiles('[data-file-pdf]', path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
  const st = () => T(() => { const v = window.takeoffcraft.view; return { z: v.z, ox: v.ox, oy: v.oy }; });
  const d2 = (fn) => T(`(${fn})(window.ccShellDevices.views().find((v) => v.kind === '2d'))`);
  await d2('(v) => v.fit()'); const a = await st();
  await d2('(v) => v.zoom(1.5, 100, 100)'); const b = await st();
  ok(Math.abs(b.z / a.z - 1.5) < 1e-6 && Math.abs((100 - b.ox) - (100 - a.ox) * 1.5) < 1e-6, 'zoom(1.5, 100, 100): × 1.5 about that point', JSON.stringify([a, b]));
  await d2('(v) => v.pan(50, 0)'); const c = await st();
  ok(Math.abs(c.ox - b.ox - 50) < 1e-9 && c.oy === b.oy, 'pan(50, 0): the sheet moves 50 px right', JSON.stringify([b, c]));
  await d2('(v) => v.fit()'); const d = await st();
  ok(Math.abs(d.z - a.z) < 1e-9 && Math.abs(d.ox - a.ox) < 1e-9, 'fit(): the whole page again', JSON.stringify([a, d]));

  console.log('== 3D check view');
  await page.selectOption('[data-scale-preset]', 'a1/4');
  await page.click('[data-act="view-3d"]');
  await page.waitForFunction(() => window.takeoffcraft.view3d().open, null, { timeout: 30000 });
  await page.waitForTimeout(300);
  const kinds = await T(() => window.ccShellDevices.views().map((v) => v.kind));
  ok(kinds.filter((k) => k === '3d').length === 1, 'one 3D view is registered', JSON.stringify(kinds));
  const cam3 = () => T(() => { const s = window.takeoffcraft.view3d(); return { eye: s.eye, target: s.target }; });
  const d3 = (fn) => T(`(${fn})(window.ccShellDevices.views().find((v) => v.kind === '3d'))`);
  {
    const dist = (q) => Math.hypot(q.eye[0] - q.target[0], q.eye[1] - q.target[1], q.eye[2] - q.target[2]);
    const same = (p, q) => JSON.stringify([p.eye, p.target]) === JSON.stringify([q.eye, q.target]);
    const c0 = await cam3(); await d3('(v) => v.orbit(40, 0)'); const c1 = await cam3();
    ok(!same(c0, c1) && JSON.stringify(c0.target) === JSON.stringify(c1.target), 'orbit(40, 0): the eye turns about the target');
    await d3('(v) => v.pan(50, 0)'); const c2 = await cam3();
    ok(JSON.stringify(c1.target) !== JSON.stringify(c2.target) && Math.abs(dist(c1) - dist(c2)) < 1e-6, 'pan(50, 0): eye and target slide');
    await d3('(v) => v.zoom(1.5, 300, 200)'); const c3 = await cam3();
    ok(dist(c3) < dist(c2), 'zoom(1.5): closer', `${dist(c2)} → ${dist(c3)}`);
    await d3('(v) => v.fit()'); const c4 = await cam3();
    ok(!same(c3, c4), 'fit(): the camera moves to the extents');
    await d2('(v) => v.zoom(2, 400, 300)'); const c5 = await cam3();
    ok(dist(c5) < dist(c4), 'the sheet view passes its zoom to the 3D view while it is open', `${dist(c4)} → ${dist(c5)}`);
    const s0 = await st(); await d2('(v) => v.pan(30, 0)'); const s1 = await st();
    ok(s0.ox === s1.ox, 'while 3D is open the hidden sheet does not move');
  }
  ok(errors.length === 0, 'no page errors', errors.join(' | '));
} finally { await browser.close(); }
console.log(`\n${res.pass} passed, ${res.fail} failed`);
process.exit(res.fail ? 1 : 0);
