#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * modelcraft.mjs — ModelCraft hands its 3D view to the input-device layer (0.8 Track ID, modelcraft.js after the wheel handler):
 * window.ccShellDevices.views() lists it, and zoom / pan / orbit / fit move the camera the way the wheel and drags do.
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/modelcraft.mjs      (root)
 */
import { open, viewList } from './common.mjs';

const { page, ok, finish, pc } = await open('modelcraft');
await page.waitForFunction(() => window.modelcraft && window.modelcraft.cam, null, { timeout: 30000 });
await pc(() => window.modelcraft.guide?.close());   // the guided first model sits over the middle of a new model
await page.keyboard.press('Escape');

console.log('== a box to look at (rectangle, push/pull)');
const scr = (p) => pc((p) => { const m = window.modelcraft, s = m.cam.project(p), r = m.ui.over.getBoundingClientRect(); return [r.left + s[0], r.top + s[1]]; }, p);
const clickAt = async (p) => { const [x, y] = await scr(p); await page.mouse.move(x, y, { steps: 3 }); await page.mouse.click(x, y); };
const moveTo = async (p) => { const [x, y] = await scr(p); await page.mouse.move(x, y, { steps: 4 }); };
const typeV = async (t) => { await page.keyboard.type(t); await page.keyboard.press('Enter'); };
await pc(() => { const c = window.modelcraft.cam; c.eye = [9, -12, 9]; c.target = [2, 1.5, 1]; window.modelcraft.view.invalidate(); });
await page.waitForTimeout(100);
await page.locator('[data-over]').focus();
await page.keyboard.press('r'); await clickAt([0, 0, 0]); await moveTo([3, 2, 0]); await typeV('4,3');
await page.keyboard.press('p'); await moveTo([2, 1.5, 0]); await clickAt([2, 1.5, 0]); await moveTo([2, 1.5, 1]); await typeV('2.5');
await page.keyboard.press('Escape'); await page.keyboard.press(' ');
await page.waitForTimeout(100);
ok(!!(await pc(() => window.modelcraft.model.bbox())), 'the model has something in it');

console.log('== the view list');
const list = await viewList(page);
console.log('  views: ' + JSON.stringify(list));
const idx = list.findIndex((v) => v.kind === '3d');
ok(idx >= 0 && list[idx].hasOrbit, 'a 3d view with orbit is registered');
const camState = () => pc(() => { const c = window.modelcraft.cam; return { eye: c.eye.slice(), target: c.target.slice(), d: c.distance }; });
const call = (fn, ...args) => pc(([i, fn, args]) => { window.ccShellDevices.views()[i][fn](...args); }, [idx, fn, args]);
const moved = (a, b) => Math.max(...a.eye.map((v, i) => Math.abs(v - b.eye[i])), ...a.target.map((v, i) => Math.abs(v - b.target[i])));
const r = await pc(() => { const r = window.modelcraft.ui.over.getBoundingClientRect(); return [r.width, r.height]; });

let before = await camState();
await call('zoom', 1.5, r[0] / 2, r[1] / 2);
let after = await camState();
ok(after.d < before.d * 0.8 && after.d > before.d * 0.55, `zoom(1.5) at the middle: closer (distance ${before.d.toFixed(2)} → ${after.d.toFixed(2)})`);
before = after;
await call('zoom', 1.5, 100, 100);
after = await camState();
ok(after.d < before.d && moved(before, after) > 1e-6, 'zoom(1.5, 100, 100): closer, toward that corner');

// pan: a model point on screen moves by (dx, dy) as when dragging with the pan button
const probe = [2, 1.5, 0];
const s0 = await pc((p) => window.modelcraft.cam.project(p, window.modelcraft.cam.viewProj()), probe);
await call('pan', 50, 0);
const s1 = await pc((p) => window.modelcraft.cam.project(p, window.modelcraft.cam.viewProj()), probe);
ok(Math.abs(s1[0] - s0[0] - 50) < 6 && Math.abs(s1[1] - s0[1]) < 6, `pan(50, 0): the content moves right ~50 px (${(s1[0] - s0[0]).toFixed(1)}, ${(s1[1] - s0[1]).toFixed(1)})`);

before = await camState();
await call('orbit', 40, 0);
after = await camState();
const dirOf = (c) => { const v = c.eye.map((e, i) => e - c.target[i]); const l = Math.hypot(...v); return v.map((x) => x / l); };
const dot = dirOf(before).reduce((s, v, i) => s + v * dirOf(after)[i], 0);
ok(dot < 0.9999 && Math.abs(after.d - before.d) < 1e-6 * Math.max(1, before.d), `orbit(40, 0): the view turns (cos ${dot.toFixed(4)}), distance kept`);

await call('zoom', 4, r[0] / 2, r[1] / 2);
await call('fit');
after = await camState();
const bb = await pc(() => window.modelcraft.model.bbox());
const c = bb.min.map((v, i) => (v + bb.max[i]) / 2);
ok(after.target.every((v, i) => Math.abs(v - c[i]) < 1e-6), 'fit(): the target is the model\'s middle (zoom extents)');

// the device layer's own path: its "Fit" command reaches the view through perform()
await call('pan', 120, 40);
const done = await pc(() => window.ccShellDevices.perform('view:fit', {}));
after = await camState();
ok(done !== false && after.target.every((v, i) => Math.abs(v - c[i]) < 1e-6), 'perform(view:fit) from the device layer fits this view');
await finish();
