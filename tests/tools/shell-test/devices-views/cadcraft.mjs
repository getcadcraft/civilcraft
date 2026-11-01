#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cadcraft.mjs — CadCraft hands its views to the input-device layer (0.8 Track ID, assets/js/app-devices-ui.js): the 2D drawing
 * view moves on zoom / pan / fit like the wheel and middle drag; the 3D tab's view (ws3d.js) orbits, pans, zooms and fits, and
 * the 2D view passes its moves on to it while the 3D tab shows.   nice -n 10 timeout 300 node tools/shell-test/devices-views/cadcraft.mjs
 */
import { open, ok, res } from './_open.mjs';

const { browser, page, errors, T } = await open('cadcraft');
try {
  await page.waitForFunction(() => !!window.cadcraft, null, { timeout: 20000 });
  if (await page.$('[data-autosave-discard-all]')) await page.click('[data-autosave-discard-all]').catch(() => {});
  const typeCmd = async (s) => { await page.fill('[data-cmd-input]', s); await page.press('[data-cmd-input]', 'Enter'); await page.waitForTimeout(60); };
  await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('@1000,600');
  console.log('== 2D drawing view');
  const vs = await T(() => window.ccShellDevices.views().map((v) => v.kind));
  ok(vs.includes('2d'), 'a 2D view is registered', JSON.stringify(vs));
  const st = () => T(() => { const v = window.cadcraft.view; return { z: v.zoom, cx: v.cx, cy: v.cy }; });
  const d2 = (fn) => T(`(${fn})(window.ccShellDevices.views().find((v) => v.kind === '2d'))`);
  await d2('(v) => v.fit()'); let a = await st();
  await d2('(v) => v.zoom(1.5, 100, 100)'); let b = await st();
  ok(Math.abs(b.z / a.z - 1.5) < 1e-6 && (b.cx !== a.cx || b.cy !== a.cy), 'zoom(1.5, 100, 100): zoom × 1.5 about that point', JSON.stringify([a, b]));
  await d2('(v) => v.pan(50, 0)'); let c = await st();
  ok(c.cx < b.cx && c.z === b.z, 'pan(50, 0): the content moves right (cx goes down)', JSON.stringify([b, c]));
  await d2('(v) => v.fit()'); let d = await st();
  ok(Math.abs(d.z - a.z) < 1e-9 && Math.abs(d.cx - a.cx) < 1e-9, 'fit(): back to the extents', JSON.stringify([a, d]));
  await d2('(v) => v.zoom(2, 200, 200)'); await T(() => window.cadcraft.host.zoomPrevious()); const e = await st();
  ok(Math.abs(e.z - d.z) < 1e-9 && Math.abs(e.cx - d.cx) < 1e-9, 'Zoom Previous steps back over a device zoom (rememberView)', JSON.stringify([d, e]));

  console.log('== 3D tab');
  await page.click('[data-tabs] [role="tab"]:has-text("3D")');
  await page.waitForFunction(() => window.cadcraft.host.ws3d?.active === true, null, { timeout: 30000 });
  await page.waitForTimeout(300);
  const kinds = await T(() => window.ccShellDevices.views().map((v) => v.kind));
  ok(kinds.filter((k) => k === '3d').length === 1, 'one 3D view is registered', JSON.stringify(kinds));
  const cam = () => T(() => { const c = window.cadcraft.host.ws3d.cam; return { eye: c.eye.slice(), target: c.target.slice() }; });
  const d3 = (fn) => T(`(${fn})(window.ccShellDevices.views().find((v) => v.kind === '3d'))`);
  const dist = (q) => Math.hypot(q.eye[0] - q.target[0], q.eye[1] - q.target[1], q.eye[2] - q.target[2]);
  const same = (p, q) => JSON.stringify(p) === JSON.stringify(q);
  let c0 = await cam(); await d3('(v) => v.orbit(40, 0)'); let c1 = await cam();
  ok(!same(c0, c1) && same(c0.target, c1.target), 'orbit(40, 0): the eye turns about the target', JSON.stringify([c0, c1]));
  await d3('(v) => v.pan(50, 0)'); let c2 = await cam();
  ok(!same(c1.target, c2.target) && Math.abs(dist(c1) - dist(c2)) < 1e-6, 'pan(50, 0): eye and target slide', JSON.stringify([c1, c2]));
  await d3('(v) => v.zoom(1.5, 300, 200)'); let c3 = await cam();
  ok(dist(c3) < dist(c2), 'zoom(1.5): closer', `${dist(c2)} → ${dist(c3)}`);
  await d3('(v) => v.fit()'); let c4 = await cam();
  ok(!same(c3, c4), 'fit(): the camera moves to the extents');
  await d2('(v) => v.zoom(2, 400, 300)'); let c5 = await cam();
  ok(dist(c5) < dist(c4), 'the 2D view passes its zoom to the 3D tab while it shows', `${dist(c4)} → ${dist(c5)}`);
  ok(errors.length === 0, 'no page errors', errors.join(' | '));
} finally { await browser.close(); }
console.log(`\n${res.pass} passed, ${res.fail} failed`);
process.exit(res.fail ? 1 : 0);
