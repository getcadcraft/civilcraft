#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-3d.mjs — BimCraft's 3D additions (docs/3D-SPEC.md §D) in the lab, headless, with real pointer events.
 *   node tools/bimcraft-test/browser-3d.mjs [--shots <dir>]      (default shots: tmp/shots/bimcraft-3d)
 * Run as root: signs in with BimCraft's own test admin (tools/bimcraft-test/admin.php up|down, disabled again at the
 * end) and drives the cached Playwright Chromium. Clear the shared admin-login throttle first when other checks ran.
 *   1. DWG in 3D: opens tools/bimcraft-test/fixtures/dwg3d-acad2000.dwg (every 3D type), switches to 3D, checks what
 *      is drawn and listed (Not drawn yet / 2D only), orbits with the middle button, pans with the right, zooms at the
 *      cursor with the wheel, a trackpad swipe orbits and a pinch zooms, standard views, parallel/perspective, extents,
 *      a layer off, paper and model screenshots, back to 2D (key 3 and a sheet tab); the public kitchen fixture in 3D.
 *   2. IFC section plane on Ifc4_SampleHouse.ifc: Top/Front/Side, typed and dragged offset, flip, picking respects the
 *      cut, off; paper and model screenshots.
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const DWG = path.join(REPO, 'tools/bimcraft-test/fixtures/dwg3d-acad2000.dwg');
const KITCHEN = path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg');   // public fixture (fixtures/README.md)
const IFC = '/var/www/CADCRAFT/testfiles/samples/Ifc4_SampleHouse.ifc';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/bimcraft-3d');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); console.log('         shot ' + path.join(SHOTS, name + '.png')); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const statusOf = () => page.textContent('[data-status]');
const waitStatus = (re, timeout = 90000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const cam = () => page.evaluate(() => { const c = document.querySelector('[data-dwg3d-canvas]').view.cam; return { eye: c.eye, target: c.target, persp: c.persp, d: Math.hypot(...c.eye.map((v, i) => v - c.target[i])) }; });
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const unit = (a, b) => { const v = a.map((x, i) => x - b[i]), l = Math.hypot(...v); return v.map((x) => x / l); };
/** Share of the 3D canvas's pixels that differ from its background (what is drawn). */
const inked = (sel) => page.evaluate((s) => {
  const c = document.querySelector(s), v = c.view || c.viewer;
  if (v.draw) v.draw(); else v.renderer.render(v.scene, v.camera);
  const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
  const g = o.getContext('2d'); g.drawImage(c, 0, 0);
  const d = g.getImageData(0, 0, o.width, o.height).data, bg = [d[0], d[1], d[2]];
  let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]) > 30) n++;
  return n / (d.length / 4);
}, sel);
const box = async (sel) => { const b = await page.locator(sel).boundingBox(); return { ...b, cx: b.x + b.width / 2, cy: b.y + b.height / 2 }; };
const setSpace = async (space) => {
  await page.click(`.space-toggle button[value="${space}"]`);
  await page.waitForFunction((s) => document.documentElement.dataset.space === s, space);
  await page.waitForTimeout(150);
};

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });

  console.log('== DWG in 3D: the fixture with every 3D type');
  await page.setInputFiles('[data-file]', DWG);
  await waitStatus(/^Opened /);
  ok(await page.isVisible('[data-sheet-tabs] [data-dwg-3d]') && (await page.getAttribute('[data-sheet-tabs] [data-dwg-3d]', 'aria-pressed')) === 'false', 'the drawing opens in 2D with a 3D switch in the model/sheet bar');
  ok(!(await page.evaluate(() => [...document.querySelectorAll('script[type="module"]')].some((s) => /dwg-view3d/.test(s.src)))) && !(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /dwg-view3d|dwg-compile3d/.test(r.name)))), 'the 3D view is not loaded until someone switches to 3D');
  await page.click('[data-sheet-tabs] [data-dwg-3d]');
  await waitStatus(/^Model space in 3D: /);
  ok(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /dwg-view3d\.js/.test(r.name)) && performance.getEntriesByType('resource').some((r) => /m3d\/camera\.js/.test(r.name))), 'dwg-view3d.js and m3d/camera.js load on the first switch');
  ok(await page.isVisible('[data-dwg3d-canvas]') && !(await page.isVisible('[data-dwg-canvas]')) && await page.isVisible('[data-dwg3d-bar]'), '3D canvas and its view bar shown, 2D canvas hidden');
  ok((await page.getAttribute('[data-sheet-tabs] [data-dwg-3d]', 'aria-pressed')) === 'true', '3D switch pressed');
  const st = await page.evaluate(() => {
    const m = document.querySelector('[data-dwg3d-canvas]').view.model;
    const p3 = m.batches.filter((b) => b.layer === 'P3D').flatMap((b) => [...b.lines]);
    return { ...m.stats, p3Segs: p3.length / 6, p3Top: Math.max(...p3.filter((_, i) => i % 3 === 2)) };
  });
  ok(st.segments > 400 && st.triangles > 400 && st.p3Segs === 4 && st.p3Top === 2000, `compiled: ${st.segments} lines, ${st.triangles} faces, the 3D polyline whole (${st.p3Segs} segments up to z ${st.p3Top})`);
  ok(!(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /libredwg/i.test(r.name)))) && await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/dwg\/read\.js/.test(r.name))), 'read by dwg/read.js (cc-dwg); nothing of libredwg-web is fetched');
  const props = await page.textContent('[data-props]');
  ok(/Not drawn yet/.test(props) && /3DSOLID \(ACIS\)/.test(props) && /BODY \(ACIS\)/.test(props) && /REGION \(ACIS\)/.test(props) && /EXTRUDEDSURFACE/.test(props) && /MESH \(subdivision\)/.test(props), 'Properties: "Not drawn yet" lists 3DSOLID, BODY, REGION, EXTRUDEDSURFACE, MESH');
  ok(!/In the 2D view only[\s\S]*\bTEXT\b/.test(props) && /millimeters/.test(props), 'Properties: text is drawn in 3D since 0.4 B7, so not listed as 2D only; the size in millimeters');
  console.log('== view cube (m3d/viewcube.js) on the drawing in 3D');
  ok(await page.isVisible('[data-dwg3d] [data-viewcube]') && !(await page.isVisible('[data-dwg3d] [data-axis-icon]')), 'the view cube shows in the 3D view (default corner indicator)');
  await page.click('[data-dwg3d] [data-viewcube] [data-vc-key="front"]');
  await page.waitForFunction(() => document.querySelector('[data-dwg3d] [data-viewcube]').dataset.vcView === 'front', null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(300);
  const fd = await page.evaluate(() => { const c = document.querySelector('[data-dwg3d-canvas]').view.cam; const v = c.eye.map((x, i) => x - c.target[i]), l = Math.hypot(...v); return v.map((x) => x / l); });
  ok(Math.abs(fd[1] + 1) < 1e-3 && (await page.getAttribute('[data-dwg3d] [data-viewcube]', 'data-vc-view')) === 'front', `clicking the cube's Front face looks from the front (eye toward −Y: ${fd.map((x) => x.toFixed(3))})`);
  await page.click('[data-dwg3d] [data-viewcube] [data-vc-home]');
  await page.waitForTimeout(700);
  ok((await page.getAttribute('[data-dwg3d] [data-viewcube]', 'data-vc-view')) !== 'front', 'the cube\'s Home button goes back to the iso view');
  const cover = await inked('[data-dwg3d-canvas]');
  ok(cover > 0.01, `the 3D view draws the model (${(cover * 100).toFixed(1)}% of the canvas)`);
  await shot(page, '01-dwg3d-paper');

  console.log('== navigation (ModelCraft camera)');
  const c3 = await box('[data-dwg3d-canvas]');
  let a = await cam();
  await page.mouse.move(c3.cx, c3.cy);
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(c3.cx + 120, c3.cy + 40, { steps: 6 });
  await page.mouse.up({ button: 'middle' });
  let b = await cam();
  ok(dist3(a.eye, b.eye) > 1 && dist3(a.target, b.target) < 1e-6 && Math.abs(a.d - b.d) < 1e-6, 'middle-drag orbits round the target (eye moved, target and distance kept)');
  a = b;
  await page.mouse.move(c3.cx, c3.cy);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(c3.cx + 80, c3.cy - 50, { steps: 5 });
  await page.mouse.up({ button: 'right' });
  b = await cam();
  ok(dist3(a.target, b.target) > 1e-3 && Math.abs(a.d - b.d) < 1e-6 && Math.abs(unit(a.eye, a.target)[2] - unit(b.eye, b.target)[2]) < 1e-9, 'right-drag pans (target moved, view direction and distance kept)');
  a = b;
  await page.keyboard.down('Shift');
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(c3.cx + 30, c3.cy + 30, { steps: 3 });
  await page.mouse.up({ button: 'middle' });
  await page.keyboard.up('Shift');
  b = await cam();
  ok(dist3(a.target, b.target) > 1e-3 && Math.abs(a.d - b.d) < 1e-6, 'Shift+middle-drag pans');
  a = b;
  await page.mouse.move(c3.cx + 100, c3.cy - 60);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(50);
  b = await cam();
  ok(b.d < a.d * 0.9 && dist3(a.target, b.target) > 1e-3, `the wheel zooms at the cursor (distance ${a.d.toFixed(1)} → ${b.d.toFixed(1)}, target drawn toward the pointer)`);
  a = b;
  // a trackpad's two-finger swipe: sideways, pixel deltas → orbit; a pinch: ctrlKey wheel → zoom
  await page.dispatchEvent('[data-dwg3d-canvas]', 'wheel', { deltaX: 24, deltaY: 6.5, deltaMode: 0, clientX: c3.cx, clientY: c3.cy });
  b = await cam();
  ok(dist3(a.eye, b.eye) > 1e-3 && Math.abs(a.d - b.d) < 1e-6, 'a trackpad swipe (sideways scroll) orbits');
  a = b;
  await page.dispatchEvent('[data-dwg3d-canvas]', 'wheel', { deltaX: 0, deltaY: -12, deltaMode: 0, ctrlKey: true, clientX: c3.cx, clientY: c3.cy });
  b = await cam();
  ok(b.d < a.d, `a pinch (Ctrl+wheel) zooms in (${a.d.toFixed(1)} → ${b.d.toFixed(1)})`);

  console.log('== standard views, projection, extents');
  const dirOf = async () => { const c = await cam(); return unit(c.eye, c.target); };
  const close = (v, w) => Math.hypot(v[0] - w[0], v[1] - w[1], v[2] - w[2]) < 1e-3;
  await page.click('[data-v3="top"]'); ok(close(await dirOf(), [0, 0, 1]), 'Top looks straight down (Z up)');
  await page.click('[data-v3="bottom"]'); ok(close(await dirOf(), [0, 0, -1]), 'Bottom looks up');
  await page.click('[data-v3="front"]'); ok(close(await dirOf(), [0, -1, 0]), 'Front looks along +Y');
  await page.click('[data-v3="back"]'); ok(close(await dirOf(), [0, 1, 0]), 'Back looks along −Y');
  await page.click('[data-v3="left"]'); ok(close(await dirOf(), [-1, 0, 0]), 'Left');
  await page.click('[data-v3="right"]'); ok(close(await dirOf(), [1, 0, 0]), 'Right');
  await page.click('[data-v3="iso"]');
  const iso = await dirOf();
  ok(iso[2] > 0.3 && iso[0] > 0 && iso[1] < 0, 'Iso looks from the front-right, above');
  await page.click('[data-v3="persp"]');
  ok(!(await cam()).persp && (await page.getAttribute('[data-v3="persp"]', 'aria-pressed')) === 'false', 'Perspective off = parallel projection');
  ok(await inked('[data-dwg3d-canvas]') > 0.01, 'parallel view still draws the model');
  await page.click('[data-v3="persp"]');
  ok((await cam()).persp, 'Perspective back on');
  await page.mouse.move(c3.cx, c3.cy);
  await page.mouse.wheel(0, 2000);
  const far = (await cam()).d;
  await page.click('[data-v3="extents"]');
  const fit = (await cam()).d;
  ok(fit < far, `Extents fits the drawing again (distance ${far.toFixed(0)} → ${fit.toFixed(0)})`);
  await page.mouse.wheel(0, 1500);
  await page.keyboard.press('f');
  ok(Math.abs((await cam()).d - fit) < 1e-6, 'F = extents in 3D');

  console.log('== layers and themes');
  await page.click('[data-v3="iso"]');
  const before = await inked('[data-dwg3d-canvas]');
  await page.locator('[data-layer-list] label', { hasText: /^BLK$/ }).locator('input').uncheck();
  const hiddenBlk = await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.objects.filter((o) => o.layer === 'BLK').every((o) => !o.obj.visible));
  const after = await inked('[data-dwg3d-canvas]');
  ok(hiddenBlk && after < before, `turning layer BLK off hides its blocks in 3D (${(before * 100).toFixed(2)}% → ${(after * 100).toFixed(2)}%)`);
  await page.locator('[data-layer-list] label', { hasText: /^BLK$/ }).locator('input').check();
  ok(await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.objects.filter((o) => o.layer === 'BLK').every((o) => o.obj.visible)), 'and back on');
  const bgPaper = await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.scene.background.getHexString());
  await setSpace('model');
  const bgModel = await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.scene.background.getHexString());
  ok(bgPaper !== bgModel, `the 3D view re-themes on data-space (#${bgPaper} → #${bgModel})`);
  ok(await inked('[data-dwg3d-canvas]') > 0.01, 'model space theme still draws the model');
  await shot(page, '02-dwg3d-model');
  await setSpace('paper');

  console.log('== back to 2D');
  await page.keyboard.press('3');
  await page.waitForFunction(() => !document.querySelector('[data-dwg-canvas]').hidden);
  ok(!(await page.isVisible('[data-dwg3d-canvas]')) && !(await page.isVisible('[data-dwg3d-bar]')) && (await page.getAttribute('[data-sheet-tabs] [data-space-key="model"]', 'aria-pressed')) === 'true', 'key 3 goes back to 2D, Model tab pressed');
  ok(!(await page.isVisible('[data-viewcube]')) && !(await page.isVisible('[data-axis-icon]')), 'no corner indicator on the 2D drawing');
  ok(!/Not drawn yet[\s\S]*3DSOLID \(ACIS\)[\s\S]*BODY/.test(await page.textContent('[data-props]')) && /Drag to pan/.test(await page.textContent('[data-props]')), 'the 2D Properties come back');
  await page.click('[data-sheet-tabs] [data-dwg-3d]');
  await waitStatus(/^Model space in 3D: /);
  await page.click('[data-sheet-tabs] [data-space-key="model"]');
  ok(await page.isVisible('[data-dwg-canvas]') && !(await page.isVisible('[data-dwg3d-canvas]')), 'clicking a model/sheet tab leaves 3D');

  console.log('== the kitchen fixture in 3D');
  if (fs.existsSync(KITCHEN)) {
    await page.setInputFiles('[data-file]', KITCHEN);
    await waitStatus(/^Opened /);
    ok(!(await page.isVisible('[data-dwg3d-canvas]')), 'a new drawing opens in 2D');
    const t0 = Date.now();
    await page.click('[data-sheet-tabs] [data-dwg-3d]');
    await waitStatus(/^Model space in 3D: /);
    const cs = await page.evaluate(() => document.querySelector('[data-dwg3d-canvas]').view.model.stats);
    ok(cs.segments > 20000 && cs.triangles > 100 && await inked('[data-dwg3d-canvas]') > 0.0005, `kitchen fixture: ${cs.segments} lines and ${cs.triangles} faces in 3D in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    await page.click('[data-v3="top"]');
    await shot(page, '03-dwg3d-kitchen-top');
  }

  console.log('== IFC section plane');
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);
  const sec = '[data-toolbar] [data-toggle="section"]';
  ok(await page.isVisible(sec) && (await page.getAttribute(sec, 'aria-pressed')) === 'false' && !(await page.isVisible('[data-sectionbar]')), 'toolbar Section, off at first');
  ok(await page.isVisible('[data-canvas-wrap] [data-viewcube]'), 'the IFC 3D view has the view cube');
  await page.click('[data-canvas-wrap] [data-viewcube] [data-vc-key="front"]');
  await page.waitForFunction(() => document.querySelector('[data-canvas-wrap] [data-viewcube]').dataset.vcView === 'front', null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(300);
  const ifd = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; const d = v.controls.target.clone().sub(v.camera.position).normalize(); return d.toArray(); });
  ok(Math.abs(ifd[2] + 1) < 1e-3, `cube Front on the IFC model (web-ifc Y up): the camera looks along −Z, as the Front button (${ifd.map((x) => x.toFixed(3))})`);
  await page.click('[data-toolbar] [data-view="iso"]');
  const rows = await page.$$eval('[data-toolbar] .bc-tool', (bs) => new Set(bs.filter((x) => x.offsetParent).map((x) => Math.round(x.getBoundingClientRect().top))).size);
  ok(rows <= 2, `the toolbar keeps its shape (${rows} rows at 1440 px)`);
  const cv = await box('[data-canvas]');
  const hit0 = await page.evaluate(([x, y]) => document.querySelector('[data-canvas]').viewer.hitAt(x, y), [cv.cx, cv.cy]);
  ok(hit0 && hit0.id != null, 'without a section the centre of the view hits element #' + hit0?.id);
  await page.click(sec);
  const vstate = () => page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; return { planes: v.clip.length, s: v.section && { axis: v.section.axis, offset: v.section.offset, flip: v.section.flip, n: v.section.plane.normal.toArray(), c: v.section.plane.constant }, min: v.box.min.toArray(), max: v.box.max.toArray() }; });
  let vs = await vstate();
  ok(vs.planes === 1 && vs.s.axis === 'top' && !vs.s.flip && await page.isVisible('[data-sectionbar]') && (await page.getAttribute(sec, 'aria-pressed')) === 'true', `Section on: one clipping plane, Top, cut at ${vs.s.offset.toFixed(2)} m`);
  const under = await page.evaluate(() => { const t = document.querySelector('[data-toolbar]').getBoundingClientRect(), b = document.querySelector('[data-sectionbar]').getBoundingClientRect(); return b.top >= t.bottom - 0.5; });
  ok(under, 'the section bar sits under the toolbar, never over it');
  await shot(page, '04-section-top-paper');
  // a cut just under what the centre ray hit first: picking must go through to what is below the plane
  const h = hit0.point[1] - vs.min[1] - 0.3;
  await page.fill('[data-sec-offset]', h.toFixed(3));
  await page.press('[data-sec-offset]', 'Enter');
  vs = await vstate();
  ok(Math.abs(vs.s.offset - Number(h.toFixed(3))) < 1e-6 && Math.abs(vs.s.c - (vs.min[1] + vs.s.offset)) < 1e-6 && vs.s.n[1] === -1, `typed offset ${h.toFixed(3)} m → the plane at that height, keeping what is below`);
  const hit1 = await page.evaluate(([x, y]) => document.querySelector('[data-canvas]').viewer.hitAt(x, y), [cv.cx, cv.cy]);
  ok(!hit1 || (hit1.point[1] <= vs.min[1] + vs.s.offset + 1e-4 && (hit1.id !== hit0.id || hit1.point[1] < hit0.point[1] - 0.29)), `picking skips the cut-away part (now ${hit1 ? '#' + hit1.id + ' at ' + (hit1.point[1] - vs.min[1]).toFixed(2) + ' m' : 'nothing'})`);
  await page.mouse.click(cv.cx, cv.cy);
  const sel = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.selected);
  ok(sel === (hit1 ? hit1.id : null), 'a click picks that same element');
  if (sel !== null) {
    await page.waitForFunction(() => document.querySelector('[data-props] .bc-prop-cls'), null, { timeout: 10000 });
    const pt = await page.textContent('[data-props]');
    ok(!/\b(null|undefined)\b/.test(pt) && !/\bNaN\b/.test(pt), 'the Properties panel of the picked element has no stray "null" / "undefined" text (' + (await page.textContent('[data-props] .bc-prop-name')) + ')');
  }
  await page.click('[data-sec-flip]');
  vs = await vstate();
  const hit2 = await page.evaluate(([x, y]) => document.querySelector('[data-canvas]').viewer.hitAt(x, y), [cv.cx, cv.cy]);
  ok(vs.s.flip && vs.s.n[1] === 1 && (!hit2 || hit2.point[1] >= vs.min[1] + vs.s.offset - 1e-4), 'Flip keeps what is above the cut (and picking follows)');
  await page.click('[data-sec-flip]');
  // drag the offset slider
  const r = await box('[data-sec-range]');
  await page.mouse.click(r.x + r.width * 0.2, r.cy);
  vs = await vstate();
  const rng = await page.evaluate(() => document.querySelector('[data-canvas]').viewer.sectionRange('top')[1]);
  ok(Math.abs(vs.s.offset / rng - 0.2) < 0.08 && (await page.inputValue('[data-sec-offset]')) !== '', `dragging the slider moves the cut (${(vs.s.offset / rng * 100).toFixed(0)}% up, typed box follows)`);
  await page.click('[data-sec-axis="front"]');
  vs = await vstate();
  ok(vs.s.axis === 'front' && vs.s.n[2] === -1 && /front/.test(await page.textContent('[data-sec-hint]')), 'Front: a vertical cut across Z, seen from the front');
  await shot(page, '05-section-front-paper');
  await page.click('[data-sec-axis="side"]');
  vs = await vstate();
  ok(vs.s.axis === 'side' && vs.s.n[0] === -1, 'Side: a vertical cut across X');
  await setSpace('model');
  await page.click('[data-sec-axis="top"]');
  ok(await inked('[data-canvas]') > 0.01, 'the cut model still draws in the model theme');
  await shot(page, '06-section-top-model');
  await setSpace('paper');
  await page.click('[data-sec-off]');
  vs = await vstate();
  ok(vs.planes === 0 && !vs.s && !(await page.isVisible('[data-sectionbar]')) && (await page.getAttribute(sec, 'aria-pressed')) === 'false', 'Off: no clipping plane, bar hidden');
  await page.mouse.click(10, 10);
  await page.focus('[data-canvas]').catch(() => {});
  await page.keyboard.press('x');
  ok((await vstate()).planes === 1, 'X turns the section on');
  await page.keyboard.press('x');
  ok((await vstate()).planes === 0, 'X again turns it off');
  const hit3 = await page.evaluate(([x, y]) => document.querySelector('[data-canvas]').viewer.hitAt(x, y), [cv.cx, cv.cy]);
  ok(hit3 && hit3.id === hit0.id, 'with the section off the first element is picked again');
  // a section on one model does not carry into the next
  await page.click(sec);
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);
  ok((await vstate()).planes === 0 && !(await page.isVisible('[data-sectionbar]')), 'opening another model starts uncut');
  await page.setInputFiles('[data-file]', DWG);
  await waitStatus(/^Opened /);
  ok(!(await page.isVisible('[data-sectionbar]')), 'the section bar never shows over a drawing');

  console.log('== Settings › BimCraft › Corner indicator');
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);
  await page.click('[data-settings-open]');
  ok(await page.isVisible('input[name="bcCorner"][value="cube"]') && await page.isChecked('input[name="bcCorner"][value="cube"]'), 'the BimCraft tab has Corner indicator, View cube chosen');
  await page.check('input[name="bcCorner"][value="axes"]');
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-canvas-wrap] [data-viewcube]')) && await page.isVisible('[data-canvas-wrap] [data-axis-icon]'), 'Axis icon: the cube goes, the X/Y/Z icon shows at once');
  await page.reload({ waitUntil: 'networkidle' });
  ok(await page.evaluate(() => window.bimcraftSettings.corner) === 'axes', 'the choice is kept after a reload (bimcraft.settings)');
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);
  ok(await page.isVisible('[data-canvas-wrap] [data-axis-icon]') && !(await page.isVisible('[data-canvas-wrap] [data-viewcube]')), 'and applies to the next model');
  await shot(page, '07-axis-icon-paper');
  await page.click('[data-settings-open]');
  await page.check('input[name="bcCorner"][value="none"]');
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-canvas-wrap] [data-axis-icon]')) && !(await page.isVisible('[data-canvas-wrap] [data-viewcube]')), 'None: no corner indicator');
  await page.click('[data-settings-open]');
  await page.check('input[name="bcCorner"][value="cube"]');
  await page.keyboard.press('Escape');
  ok(await page.isVisible('[data-canvas-wrap] [data-viewcube]'), 'View cube again');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'zz-failure').catch(() => {});
} finally {
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
  console.log(`\n${pass} passed, ${fail} failed (screenshots in ${SHOTS})`);
  process.exit(fail ? 1 : 0);
}
