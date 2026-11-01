#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * detailcraft.mjs — DetailCraft hands its view to the input-device layer (0.8 Track ID; detailcraft.js, the View3D canvas that is 3D, Plan
 * and Elevation): one view, kind 3d in 3D and 2d in Plan; zoom / pan / orbit / fit move the camera through its OrbitControls and the canvas
 * redraws; in Plan orbit does nothing.
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/detailcraft.mjs
 */
import { open, viewList } from './common.mjs';

const { page, ok, finish, pc } = await open('detailcraft');
try {
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
  await pc(() => window.detailcraft.act('sample'));
  await page.waitForFunction(() => window.detailcraft.built.parts.length === 25, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  let vs = await viewList(page);
  console.log('  views', JSON.stringify(vs));
  ok(vs.length === 1 && vs[0].kind === '3d' && vs[0].hasOrbit && vs[0].tag.startsWith('canvas'), 'one view listed: the canvas, 3d, with orbit');
  const cam = () => pc(() => { const v = window.detailcraft.view, c = v.camera, t = v.controls.target; return { pos: c.position.toArray(), target: t.toArray(), dist: c.position.distanceTo(t), zoom: c.zoom }; });
  const shot = () => pc(() => window.detailcraft.view.canvas.toDataURL());
  const c0 = await cam(); let img = await shot();
  await pc(() => window.ccShellDevices.views()[0].zoom(1.5, 100, 100));
  const c1 = await cam();
  ok(Math.abs(c1.dist / c0.dist - 1 / 1.5) < 1e-6, `zoom(1.5, 100, 100): distance ×1/1.5 (${c0.dist.toFixed(2)} → ${c1.dist.toFixed(2)})`);
  let img2 = await shot(); ok(img2 !== img, 'the canvas redrew after zoom'); img = img2;
  await pc(() => window.ccShellDevices.views()[0].pan(50, 0));
  const c2 = await cam();
  ok(c2.target.some((v, k) => Math.abs(v - c1.target[k]) > 1e-9) && Math.abs(c2.dist - c1.dist) < 1e-6, 'pan(50, 0): target moved, distance kept');
  // content moves right: the old target now projects to the right of the middle
  const right = await pc((t) => { const v = window.detailcraft.view; const THREE_V = v.controls.target.clone().set(t[0], t[1], t[2]).project(v.camera); return THREE_V.x; }, c1.target);
  ok(right > 0, `pan(50, 0): the content went right (old centre at ndc x ${right.toFixed(3)})`);
  await pc(() => window.ccShellDevices.views()[0].orbit(40, 0));
  const c3 = await cam();
  ok(c3.pos.some((v, k) => Math.abs(v - c2.pos[k]) > 1e-6) && c3.target.every((v, k) => Math.abs(v - c2.target[k]) < 1e-9) && Math.abs(c3.dist - c2.dist) < 1e-6, 'orbit(40, 0): eye turned about the target');
  img2 = await shot(); ok(img2 !== img, 'the canvas redrew after orbit');
  await pc(() => window.ccShellDevices.views()[0].fit());
  const c4 = await cam();
  ok(c4.target.every((v, k) => Math.abs(v - c0.target[k]) < 1e-6) && Math.abs(c4.dist - c0.dist) < 1e-6, 'fit(): back to the start-up fit');

  console.log('== Plan');
  await page.click('[data-view="plan"]');
  await page.waitForTimeout(300);
  vs = await viewList(page);
  ok(vs.length === 1 && vs[0].kind === '2d', 'Plan: the same view, now 2d');
  const p0 = await cam();
  await pc(() => window.ccShellDevices.views()[0].zoom(1.5, 100, 100));
  const p1 = await cam();
  ok(Math.abs(p1.zoom / p0.zoom - 1.5) < 1e-6, `Plan zoom(1.5): ortho zoom ×1.5 (${p0.zoom} → ${p1.zoom.toFixed(3)})`);
  await pc(() => window.ccShellDevices.views()[0].pan(50, 0));
  const p2 = await cam();
  ok(p2.target[0] < p1.target[0] && Math.abs(p2.target[1] - p1.target[1]) < 1e-9, 'Plan pan(50, 0): the centre moved left (content right)');
  await pc(() => window.ccShellDevices.views()[0].orbit(40, 0));
  const p3 = await cam();
  ok(p3.pos.every((v, k) => Math.abs(v - p2.pos[k]) < 1e-9), 'Plan orbit(40, 0): nothing (plan does not turn)');
  await pc(() => window.ccShellDevices.views()[0].fit());
  const p4 = await cam();
  ok(p4.zoom === 1 && Math.abs(p4.target[0] - p0.target[0]) < 1e-6, 'Plan fit(): back to the fitted plan');
} catch (e) { ok(false, 'threw: ' + (e.stack || e)); }
await finish();
