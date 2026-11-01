#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civilcraft.mjs — CivilCraft hands its views to the input-device layer (0.8 Track ID; civilcraft.js plan view, site-view3d.js 3D view):
 * the plan view (2d) is listed at start; zoom / pan / fit move it (view.zoom, view.cx/cy); after 3D opens the 3D view (3d) is listed,
 * zoom / pan / orbit / fit move its camera, and while 3D is open the plan view is not the one under the pointer.
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/civilcraft.mjs
 */
import { open, viewList } from './common.mjs';

const { page, ok, finish, pc } = await open('civilcraft');
try {
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  let vs = await viewList(page);
  console.log('  views', JSON.stringify(vs));
  ok(vs.length === 1 && vs[0].kind === '2d' && !vs[0].hasOrbit && vs[0].tag.includes('[over]'), 'plan view listed (2d, the over canvas, no orbit)');
  const plan = () => pc(() => { const v = window.civilcraft.view; return { zoom: v.zoom, cx: v.cx, cy: v.cy }; });
  const P = (i) => `window.ccShellDevices.views()[${i}]`;
  const s0 = await plan();
  await pc(() => window.ccShellDevices.views()[0].zoom(1.5, 100, 100));
  const s1 = await plan();
  ok(Math.abs(s1.zoom / s0.zoom - 1.5) < 1e-9 && (s1.cx !== s0.cx || s1.cy !== s0.cy), `zoom(1.5, 100, 100): zoom ×1.5 about the point (${s0.zoom.toFixed(4)} → ${s1.zoom.toFixed(4)})`);
  await pc(() => window.ccShellDevices.views()[0].pan(50, 0));
  const s2 = await plan();
  ok(Math.abs((s1.cx - s2.cx) * s2.zoom - 50) < 1e-6 && s2.cy === s1.cy, 'pan(50, 0): content 50 px to the right (centre moved left)');
  await pc(() => window.ccShellDevices.views()[0].fit());
  const s3 = await plan();
  ok(Math.abs(s3.zoom - s0.zoom) / s0.zoom < 1e-6 && Math.abs(s3.cx - s0.cx) < 1e-6, 'fit(): back to the start-up fit');

  console.log('== 3D');
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d?.scene && !document.querySelector('[data-view3d]').hidden, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  vs = await viewList(page);
  console.log('  views', JSON.stringify(vs));
  const i3 = vs.findIndex((v) => v.kind === '3d');
  ok(i3 >= 0 && vs[i3].hasOrbit && vs[i3].tag.includes('[3dCanvas]'), '3D view listed (3d, its canvas, orbit)');
  ok(vs.some((v) => v.tag.includes('[planAway]')), 'while 3D is open the plan hands over its hidden stand-in');
  // the view under the middle of the stage is the 3D one (the device layer's own pick)
  const under = await pc(() => { const c = document.querySelector('[data-3d-canvas]').getBoundingClientRect(); const x = c.left + c.width / 2, y = c.top + c.height / 2;
    return window.ccShellDevices.views().filter((v) => { const r = v.el.getBoundingClientRect(); return r.width > 0 && !v.el.closest('[hidden]') && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }).map((v) => v.kind); });
  ok(under.length === 1 && under[0] === '3d', 'only the 3D view is under the pointer while 3D is open (' + under.join(',') + ')');
  const cam = () => pc(() => { const c = window.civilcraft.view3d.cam; return { eye: c.eye.slice(), target: c.target.slice(), dist: c.distance }; });
  const c0 = await cam();
  await pc((i) => window.ccShellDevices.views()[i].zoom(1.5, 100, 100), i3);
  const c1 = await cam();
  ok(Math.abs(c1.dist / c0.dist - 1 / 1.5) < 1e-6, `zoom(1.5): distance ×1/1.5 (${c0.dist.toFixed(1)} → ${c1.dist.toFixed(1)})`);
  await pc((i) => window.ccShellDevices.views()[i].pan(50, 0), i3);
  const c2 = await cam();
  ok(c2.target.some((v, k) => Math.abs(v - c1.target[k]) > 1e-6) && Math.abs(c2.dist - c1.dist) < 1e-6, 'pan(50, 0): target moved, distance kept');
  const shotBefore = await page.locator('[data-3d-canvas]').screenshot();
  await pc((i) => window.ccShellDevices.views()[i].orbit(40, 0), i3);
  const c3 = await cam();
  ok(c3.eye.some((v, k) => Math.abs(v - c2.eye[k]) > 1e-6) && c3.target.every((v, k) => Math.abs(v - c2.target[k]) < 1e-6), 'orbit(40, 0): eye turned about the target');
  await page.waitForTimeout(300);
  ok(!shotBefore.equals(await page.locator('[data-3d-canvas]').screenshot()), 'the 3D canvas redrew');
  await pc((i) => window.ccShellDevices.views()[i].fit(), i3);
  const c4 = await cam();
  ok(Math.abs(c4.dist - c3.dist) > 1e-6, `fit(): camera refitted (distance ${c3.dist.toFixed(1)} → ${c4.dist.toFixed(1)})`);

  await page.evaluate(() => window.civilcraft.show3D(false));
  await page.waitForTimeout(200);
  vs = await viewList(page);
  ok(vs.some((v) => v.kind === '2d' && v.tag.includes('[over]')) && vs.length === 2, 'back to the plan: plan view on its canvas again, both still listed');
} catch (e) { ok(false, 'threw: ' + (e.stack || e)); }
await finish();
