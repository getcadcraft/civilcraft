#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * partcraft.mjs — PartCraft hands its views to the input-device layer (0.8 Track ID, partcraft.js beside `let sheetView`):
 * the 3D view (OrbitControls), the sketch canvas and the drawing sheet are listed by window.ccShellDevices.views(), and
 * zoom / pan / orbit / fit move each the way its wheel and drags do; a move on the 3D view while a sketch or the sheet is
 * open goes to that one. Mesh kernel (no OpenCascade), the flange fixture.
 *   nice -n 10 timeout 300 node tools/shell-test/devices-views/partcraft.mjs      (root)
 */
import path from 'node:path';
import { open, viewList, REPO } from './common.mjs';

const F = await import(path.join(REPO, 'tools/partcraft-test/fixtures.mjs'));
const { page, ok, finish, pc } = await open('partcraft', { init: () => { try { localStorage.removeItem('partcraft.exactKernel'); localStorage.removeItem('cc-workspace'); } catch { /* none */ } } });
await page.waitForFunction(() => window.partcraft && window.partcraft.regen, null, { timeout: 30000 });
await pc(() => window.partcraft.built());
await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
await pc(() => window.partcraft.built());
await page.keyboard.press('Escape');

console.log('== the view list');
const list = await viewList(page);
console.log('  views: ' + JSON.stringify(list));
const i3 = list.findIndex((v) => v.kind === '3d'), iSk = list.findIndex((v) => v.tag.includes('[sketchCanvas]')), iSh = list.findIndex((v) => v.tag.includes('[sheet]'));
ok(i3 >= 0 && list[i3].hasOrbit, 'the 3D view is registered (3d, with orbit)');
ok(iSk >= 0 && list[iSk].kind === '2d', 'the sketch canvas is registered (2d)');
ok(iSh >= 0 && list[iSh].kind === '2d', 'the drawing sheet host is registered (2d)');
const call = (i, fn, ...args) => pc(([i, fn, args]) => { window.ccShellDevices.views()[i][fn](...args); }, [i, fn, args]);
const size = await pc(() => { const r = document.querySelector('[data-gl]').getBoundingClientRect(); return [r.width, r.height]; });

console.log('== 3D view');
const cam = () => pc(() => { const v = window.partcraft.view, c = v.camera, t = v.controls.target; return { p: c.position.toArray(), t: t.toArray(), zoom: c.zoom }; });
const proj = (p) => pc((p) => { const v = window.partcraft.view, r = v.canvas.getBoundingClientRect(); const q = new v.camera.position.constructor(...p).project(v.camera); return [(q.x + 1) / 2 * r.width, (1 - q.y) / 2 * r.height]; }, p);
let b = await cam();
await call(i3, 'zoom', 1.5, size[0] / 2, size[1] / 2);
let a = await cam();
ok(Math.abs(a.zoom / b.zoom - 1.5) < 0.01, `zoom(1.5) at the middle: camera zoom ×1.5 (${b.zoom.toFixed(3)} → ${a.zoom.toFixed(3)})`);
b = a;
await call(i3, 'zoom', 1.5, 100, 100);
a = await cam();
ok(a.zoom > b.zoom * 1.4 && Math.hypot(...a.t.map((v, k) => v - b.t[k])) > 1e-6, 'zoom(1.5, 100, 100): closer, toward that corner (zoom to cursor moves the target)');
const s0 = await proj(a.t);
await call(i3, 'pan', 50, 0);
const s1 = await proj(a.t);
ok(Math.abs(s1[0] - s0[0] - 50) < 2 && Math.abs(s1[1] - s0[1]) < 2, `pan(50, 0): the content moves right 50 px (${(s1[0] - s0[0]).toFixed(1)}, ${(s1[1] - s0[1]).toFixed(1)})`);
b = await cam();
await call(i3, 'orbit', 40, 0);
a = await cam();
const dir = (c) => { const v = c.p.map((x, k) => x - c.t[k]); const l = Math.hypot(...v); return v.map((x) => x / l); };
const cos = dir(b).reduce((s, v, k) => s + v * dir(a)[k], 0);
ok(cos < 0.9999, `orbit(40, 0): the view turns (cos ${cos.toFixed(4)})`);
await call(i3, 'fit');
a = await cam();
const fitted = await pc(() => { const v = window.partcraft.view, c = v.box.getCenter(v.controls.target.clone()); return c.toArray(); });
ok(a.zoom === 1 && a.t.every((v, k) => Math.abs(v - fitted[k]) < 1e-6), 'fit(): zoom 1, the target at the part\'s middle (as View › Fit)');

console.log('== sketch');
const skId = await pc(() => window.partcraft.part.features.find((f) => f.sketch)?.id);
await pc((id) => window.partcraft.editSketch(id), skId);
await page.waitForFunction(() => window.partcraft.mode === 'sketch');
const skv = () => pc(() => ({ ...window.partcraft.editor.view }));
let vb = await skv();
await call(iSk, 'zoom', 1.5, 100, 100);
let va = await skv();
const sr = await pc(() => { const r = document.querySelector('[data-sketch-canvas]').getBoundingClientRect(); return [r.width, r.height]; });
const at100 = (v) => [v.cx + (100 - sr[0] / 2) / v.s, v.cy - (100 - sr[1] / 2) / v.s];
ok(Math.abs(va.s / vb.s - 1.5) < 1e-6 && Math.hypot(at100(va)[0] - at100(vb)[0], at100(va)[1] - at100(vb)[1]) < 1e-6, `sketch zoom(1.5, 100, 100): scale ×1.5, the point at (100, 100) stays put`);
vb = va;
await call(iSk, 'pan', 50, 20);
va = await skv();
ok(Math.abs((vb.cx - va.cx) * va.s - 50) < 1e-6 && Math.abs((va.cy - vb.cy) * va.s - 20) < 1e-6, 'sketch pan(50, 20): the sketch moves right 50 px and down 20 px');
vb = va;
await call(i3, 'zoom', 2, 100, 100);
va = await skv();
ok(Math.abs(va.s / vb.s - 2) < 1e-6, 'a zoom on the 3D view while the sketch is open zooms the sketch');
await call(i3, 'fit');
const fitS = await skv();
await pc(() => window.partcraft.editor.fit());
ok(JSON.stringify(fitS) === JSON.stringify(await skv()), 'fit() on the 3D view while sketching = the sketch\'s Fit');
await pc(() => window.partcraft.exitSketch());
await page.waitForFunction(() => window.partcraft.mode === 'model');

console.log('== drawing sheet');
await pc(() => window.partcraft.enterDrawing());
await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 30000 });
const tf = () => pc(() => document.querySelector('[data-sheet] svg > g').getAttribute('transform').match(/-?[\d.]+/g).map(Number));
let tb = await tf();
await call(iSh, 'zoom', 1.5, 100, 100);
let ta = await tf();
ok(Math.abs(ta[0] / tb[0] - 1.5) < 0.01, `sheet zoom(1.5, 100, 100): scale ×1.5 (${tb[0]} → ${ta[0]})`);
// the sheet point under (100, 100) stays: screen = (s − x)·k → s = sx/k − e/k
const off = await pc(() => { const a = document.querySelector('[data-sheet]').getBoundingClientRect(), b = document.querySelector('[data-sheet] svg').getBoundingClientRect(); return [b.left - a.left, b.top - a.top]; });
const under = (m) => (100 - off[0] - m[4]) / m[0];
ok(Math.abs(under(ta) - under(tb)) < 0.05, `the sheet point at (100, 100) stays put (${under(tb).toFixed(2)} → ${under(ta).toFixed(2)} mm; the transform is written to 3 decimals)`);
tb = ta;
await call(iSh, 'pan', 50, 0);
ta = await tf();
ok(Math.abs(ta[4] - tb[4] - 50) < 0.01 && Math.abs(ta[5] - tb[5]) < 0.01, 'sheet pan(50, 0): the sheet moves right 50 px');
tb = ta;
await call(i3, 'pan', 0, 30);
ta = await tf();
ok(Math.abs(ta[5] - tb[5] - 30) < 0.01, 'a pan on the 3D view while the sheet is open pans the sheet');
await call(iSh, 'fit');
ta = await tf();
await pc(() => window.partcraft.leaveDrawing());
ok(Math.abs(ta[0] - tb[0]) > 1e-3, 'sheet fit(): back to the whole sheet');
await finish();
