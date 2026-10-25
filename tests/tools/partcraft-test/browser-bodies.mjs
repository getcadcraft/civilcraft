#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bodies.mjs — PartCraft's body tools (2026-10-11) in headless Chromium, by clicks: an extrude turned into a new
 * body from its panel, Combine from two faces clicked (cut / join / keep tools, exact volumes), Move body (translate,
 * copy, rotate, align by two clicked faces), Scale body (uniform and 2 × 0.5 × 3 with its note), a path pattern along
 * an arc (instance centres on the arc), a linear pattern copying a body, the datum points / planes "between objects"
 * (three planes, the middle of a clicked edge, through an edge and a point), one toolbar row, and no console errors.
 *   node tools/partcraft-test/browser-bodies.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, tool, shot, nearRel } = h;
  const PI = Math.PI;
  const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const vol = () => pc(() => window.partcraft.regen.stats?.volume ?? null);
  const bodies = () => pc(() => window.partcraft.regen.bodies.map((b) => ({ id: b.id, volume: b.volume, box: [...b.bbox.min, ...b.bbox.max] })));
  const results = () => pc(() => [...window.partcraft.regen.results].filter(([, r]) => r.status !== 'ok').map(([k, r]) => k + ': ' + r.message).join('; '));
  const last = () => pc(() => window.partcraft.part.features.at(-1));
  const fieldByLabel = (label) => page.locator('[data-props] label', { hasText: label }).first();
  const control = (label) => fieldByLabel(label).locator('xpath=following-sibling::*[1]/descendant-or-self::*[self::input or self::select][1]');
  const setNum = async (label, v) => { const c = control(label); await c.fill(String(v)); await c.press('Enter'); await built(); };
  const choose = async (label, v) => { await control(label).selectOption(v); await built(); };
  const tick = async (text) => { await page.click(`[data-props] label:has-text("${text}")`); await built(); };
  const near6 = (a, b, t = 1e-6) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= t);
  const screenOf = (p) => pc((p) => {
    const v = window.partcraft.view, cam = v.camera;
    const q = cam.position.clone().set(p[0], p[1], p[2]).project(cam);
    const r = v.canvas.getBoundingClientRect();
    return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height];
  }, p);
  const clickWorld = async (p, { shift = false } = {}) => { const [x, y] = await screenOf(p); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(x, y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(60); };
  const openPart = async (build) => {
    const json = await pc(build);
    await pc((t) => window.partcraft.openText(t, 'Bodies.partcraft.json'), json);
    await built();
    await pc(() => { window.partcraft.view.view('iso'); window.partcraft.view.fit(); });
    await page.waitForTimeout(100);
  };

  console.log('\n== bodies: a new body from the extrude panel, Combine by clicks');
  await pc(() => window.partcraft.exactReady());
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-features-menu] [data-cmd]')].map((b) => b.dataset.cmd).join());
  ok(/combine,movebody,scalebody,pathpattern/.test(items), `More holds Combine, Move body, Scale body, Path pattern (${items})`);
  ok((await rows()) === 1, 'the toolbar is one row at 1440 px');
  // A = [0,100]×[0,50]×[0,20], B = [60,140]×[10,40]×[0,30] (joined at first); A∩B = 24000
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Bodies');
    const a = S.newSketch(); S.addRect(a, [0, 0], [100, 50]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
    const b = S.newSketch(); S.addRect(b, [60, 10], [140, 40]);
    const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: b });
    P.addFeature(part, 'extrude', { sketch: s2.id, depth: 30 });
    return JSON.stringify(part);
  });
  ok(nearRel(await vol(), 148000, 1e-9) && (await bodies()).length === 1, 'two extrudes joined: one body, 148000');
  await pc(() => window.partcraft.selectFeature('f4'));
  await choose('Operation', 'new');
  let bs = await bodies();
  ok(bs.length === 2 && bs.some((b) => b.id === 'f2' && nearRel(b.volume, 100000)) && bs.some((b) => b.id === 'f4' && nearRel(b.volume, 72000)), 'Extrude2 → Operation "New body" in its panel: two bodies, 100000 and 72000');
  // Shift+click A's top (30, 25, 20), then B's top (120, 25, 30), then More › Combine: A is the target, B the tool
  await page.keyboard.press('Escape');
  await clickWorld([30, 25, 20], { shift: true });
  await clickWorld([120, 25, 30], { shift: true });
  await menu('combine');
  let f = await last();
  ok(f.type === 'combine' && f.target === 'f2' && JSON.stringify(f.tools) === '["f4"]' && f.op === 'join', `two faces clicked, More › Combine: target Extrude1, tool Extrude2 (${f.target} ← ${f.tools})`);
  ok(nearRel(await vol(), 148000, 1e-9) && (await bodies()).length === 1, 'join: 148000, one body');
  await choose('Operation', 'cut');
  ok(nearRel(await vol(), 76000, 1e-9), `Operation → Cut in the panel: 100000 − 24000 = 76000 (${await vol()}) ${await results()}`);
  await tick('Keep the tool bodies');
  bs = await bodies();
  ok(bs.length === 2 && nearRel(await vol(), 148000, 1e-9), 'Keep the tool bodies: A cut (76000) and B kept (72000)');
  await choose('Operation', 'intersect');
  bs = await bodies();
  ok(bs.some((b) => b.id === 'f2' && nearRel(b.volume, 24000, 1e-9)), 'Intersect: A keeps the 24000 it shares with B');
  await choose('Operation', 'cut');
  await shot('bodies-combine');

  console.log('\n== bodies: rename and hide (0.4 P3)');
  // A cut by B with B kept: two bodies, f2 = 76000 and f4 = 72000. The part panel lists them.
  await page.keyboard.press('Escape');
  { const r = await page.locator('.pc-stage canvas').first().boundingBox(); await page.mouse.click(r.x + 12, r.y + r.height - 12); await page.waitForTimeout(100); }   // empty space: the part panel
  await page.waitForSelector('[data-props] [data-body-list] [data-body-name="f4"]');
  const nameBox = page.locator('[data-props] [data-body-name="f4"]');
  ok((await nameBox.inputValue()) === 'Extrude2' && (await page.locator('[data-props] [data-body-name="f2"]').getAttribute('placeholder')) === 'Extrude1', 'the part panel lists both bodies, each in a name box holding the name from its feature');
  await nameBox.fill('Tool block'); await nameBox.press('Enter'); await built();
  ok(await pc(() => window.partcraft.part.bodyInfo?.f4?.name === 'Tool block'), 'typing a name renames the body (part.bodyInfo)');
  const triCount = () => pc(() => { const v = window.partcraft.view; return { drawn: v.visTri ? v.visTri.length : v.data.triFace.length, all: v.data.triFace.length, edges: v.edgeOfSeg.length }; });
  const before = await triCount();
  await page.click('[data-props] [data-body-hide="f4"]'); await built();
  const after = await triCount();
  ok(await pc(() => window.partcraft.part.bodyInfo?.f4?.hidden === true) && after.drawn < before.drawn && after.edges < before.edges && after.all === before.all,
    `Hide on its row: the view draws ${after.drawn} of ${after.all} triangles and ${after.edges} of ${before.edges} edge segments`);
  ok(/Hid Tool block/.test(await page.textContent('[data-status]')), 'the status line names the hidden body and says where to show it again');
  ok(nearRel(await vol(), 148000, 1e-9), 'hidden is display only: the volume still counts both bodies (148000)');
  // a click on B's top goes through it: nothing of f4 can be picked
  const [bx, by] = await screenOf([120, 25, 30]);
  const hitBody = await pc(([x, y]) => { const hh = window.partcraft.view.pickAt(x, y); return hh && hh.face !== undefined ? window.partcraft.regen.faceBody[hh.face] : null; }, [bx, by]);
  ok(hitBody !== 'f4', `a click where the hidden body was does not pick it (${hitBody ?? 'nothing'})`);
  await page.keyboard.press('Control+z'); await built();
  ok(await pc(() => !window.partcraft.part.bodyInfo?.f4?.hidden && window.partcraft.part.bodyInfo?.f4?.name === 'Tool block') && (await triCount()).drawn === before.drawn, 'Ctrl+Z shows it again (one undo step), the name stays');
  await page.keyboard.press('Control+y'); await built();
  ok(await pc(() => window.partcraft.part.bodyInfo?.f4?.hidden === true), 'Ctrl+Y hides it again');
  const saved = await pc(() => window.partcraft.P.readPart(window.partcraft.P.toJSON(window.partcraft.part)).bodyInfo);
  ok(saved?.f4?.name === 'Tool block' && saved?.f4?.hidden === true, 'the name and the hidden body are in the saved file');
  await page.click('[data-props] [data-body-show-all]'); await built();
  ok(await pc(() => !window.partcraft.part.bodyInfo?.f4?.hidden) && (await triCount()).drawn === before.drawn, 'Show all brings every hidden body back');
  await shot('bodies-rename-hide');

  console.log('\n== bodies: Move body');
  await page.keyboard.press('Escape');
  await menu('movebody');
  f = await last();
  ok(f.type === 'movebody' && f.bodies.length === 1, `More › Move body takes the newest body (${f.bodies})`);
  ok(/Tool block/.test(await page.textContent('[data-props] [data-bodies="bodies"]')), 'the renamed body is called "Tool block" in the Move body panel');
  // choose B only by its checkbox
  if (f.bodies[0] !== 'f4') { await page.click(`[data-props] [data-bodies="bodies"] label[data-body="${f.bodies[0]}"]`); await built(); await page.click('[data-props] [data-bodies="bodies"] label[data-body="f4"]'); await built(); }
  await setNum('ΔZ (mm)', 50);
  let b = (await bodies()).find((x) => x.id === 'f4');
  ok(b && near6(b.box, [60, 10, 50, 140, 40, 80]), `ΔZ 50: B at [60,140]×[10,40]×[50,80] (${b && b.box.map((v) => +v.toFixed(6))})`);
  await tick('Copy (keep the original too)');
  bs = await bodies();
  ok(bs.length === 3 && bs.some((x) => /^f4@f\d+#1$/.test(x.id) && near6(x.box, [60, 10, 50, 140, 40, 80])), 'Copy: the original stays, the copy is a third body up at z 50…80');
  await tick('Copy (keep the original too)');
  await choose('Move', 'rotate');
  await choose('Axis', 'world:z');
  await setNum('Angle (°)', 90);
  b = (await bodies()).find((x) => x.id === 'f4');
  // about +Z through the origin: (x, y) → (−y, x): x ∈ [−40,−10], y ∈ [60,140]
  ok(b && near6(b.box, [-40, 60, 0, -10, 140, 30]), 'rotate 90° about Z: B at [−40,−10]×[60,140]×[0,30]');
  // align: B's top face (z 30) face to face onto A's top face (z 20) → B turned over about Y, standing on A: z 20…50
  await choose('Move', 'align');
  await pc(() => window.partcraft.view.view('iso'));
  await page.click('[data-props] [data-bslot="alignFrom"]');
  // B is still rotated in the view? the move is built with align now (no planes yet → fails, B shown where it was)
  await clickWorld([120, 25, 30]);
  await built();
  await page.click('[data-props] [data-bslot="alignTo"]');
  await clickWorld([30, 25, 20]);
  await built();
  f = await last();
  b = (await bodies()).find((x) => x.id === 'f4');
  ok(f.planes.length === 2 && b && near6(b.box, [60, 10, 20, 140, 40, 50]), `align, two faces picked by clicks: B face to face on A, [60,140]×[10,40]×[20,50] (${b && b.box.map((v) => +v.toFixed(6))}) ${await results()}`);
  await shot('bodies-align');

  console.log('\n== bodies: Scale body');
  await page.keyboard.press('Escape');
  await menu('scalebody');
  f = await last();
  if (f.bodies[0] !== 'f4') { await page.click(`[data-props] [data-bodies="bodies"] label[data-body="${f.bodies[0]}"]`); await built(); await page.click('[data-props] [data-bodies="bodies"] label[data-body="f4"]'); await built(); }
  await setNum('Scale', 2);
  b = (await bodies()).find((x) => x.id === 'f4');
  ok(b && nearRel(b.volume, 72000 * 8, 1e-9), `uniform 2: B's volume ×8 = 576000 (${b && b.volume})`);
  await tick('Uniform (the same in every direction)');
  await setNum('Scale X', 2); await setNum('Scale Y', 0.5); await setNum('Scale Z', 3);
  b = (await bodies()).find((x) => x.id === 'f4');
  const txt = await page.textContent('[data-props]');
  ok(b && nearRel(b.volume, 72000 * 3, 1e-9) && /only flat faces/.test(txt), `2 × 0.5 × 3: volume × sx·sy·sz = 216000 (${b && b.volume}), the panel says it is exact for a box`);
  await shot('bodies-scale');
  // a cylinder scaled non-uniformly: an elliptic cylinder, its note in the panel
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Ellipse');
    const a = S.newSketch(); S.addCircle(a, [0, 0], 10);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 40 });
    return JSON.stringify(part);
  });
  await menu('scalebody');
  await tick('Uniform (the same in every direction)');
  await setNum('Scale X', 2); await setNum('Scale Y', 0.5); await setNum('Scale Z', 3);
  const t2 = await page.textContent('[data-props]');
  ok(nearRel(await vol(), 12000 * PI, 1e-7) && /ellipses/.test(t2) && /B-spline/.test(t2), `a Ø20 × 40 cylinder scaled 2 × 0.5 × 3: π·20·5·120 = 12000π within 1e-7 (${await vol()}), the note says circles became ellipses and B-splines`);

  console.log('\n== bodies: path pattern, pattern of a body');
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Path');
    const a = S.newSketch(); S.addRect(a, [45, -5], [55, 5]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
    const b = S.newSketch(); S.addArc(b, [0, 0], [50, 0], [0, 50]);
    P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: b });
    return JSON.stringify(part);
  });
  await menu('pathpattern');
  f = await last();
  ok(f.type === 'pathpattern' && JSON.stringify(f.bodies) === '["f2"]' && f.path.length === 1 && f.path[0].sketch === 'f3', 'More › Path pattern: the body and the unused arc sketch as the path');
  const centres = async () => (await bodies()).map((x) => [(x.box[0] + x.box[3]) / 2, (x.box[1] + x.box[4]) / 2]);
  let cs = await centres();
  ok(cs.length === 4 && [0, 1, 2, 3].every((i) => cs.some((c) => Math.abs(c[0] - 50 * Math.cos(i * PI / 6)) < 1e-6 && Math.abs(c[1] - 50 * Math.sin(i * PI / 6)) < 1e-6)), 'count 4, equal: copies every 30° on the r 50 arc');
  await setNum('Count', 3);
  cs = await centres();
  ok(cs.length === 3 && cs.some((c) => Math.abs(c[0] - 50 * Math.cos(PI / 4)) < 1e-6 && Math.abs(c[1] - 50 * Math.sin(PI / 4)) < 1e-6), 'count 3: the middle copy at 45°');
  await choose('Orientation', 'fixed');
  bs = await bodies();
  ok(bs.every((x) => Math.abs(x.box[3] - x.box[0] - 10) < 1e-6), 'Orientation fixed: every copy stays square to the axes');
  await shot('bodies-path');
  // a linear pattern copying the body
  await page.keyboard.press('Escape');
  await pc(() => window.partcraft.selectFeature('f2'));
  await tool('lpattern'); await built();
  await tick('Copy bodies (each copy a new body)');
  bs = await bodies();
  f = await last();
  ok(f.type === 'lpattern' && JSON.stringify(f.bodies) === '["f2"]' && bs.filter((x) => x.id.includes('@' + f.id)).length === 2, `a linear pattern with "Copy bodies": two more bodies (${bs.map((x) => x.id).join(', ')}) ${await results()}`);

  console.log('\n== bodies: datum geometry between objects');
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Datum');
    const a = S.newSketch(); S.addRect(a, [0, 0], [100, 60]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 40 });
    return JSON.stringify(part);
  });
  await page.keyboard.press('Escape');
  await menu('point');
  await choose('Type', 'planes3');
  await choose('First plane', 'base:front'); await choose('Second plane', 'base:top'); await choose('Third plane', 'base:right');
  f = await last();
  let g = await pc((id) => window.partcraft.regen.refGeom.get(id), f.id);
  ok(g && near6(g.p, [0, 0, 0], 1e-12) && /0, 0, 0/.test(await page.textContent('[data-props] [data-point-at]')), 'Point › where three planes meet: front, top and right at the origin, shown in the panel');
  await choose('Type', 'mid');
  await page.click('[data-props] [data-slot="edge"]');
  await clickWorld([50, 0, 40]);   // the top front edge, (0,0,40)–(100,0,40)
  await built();
  g = await pc((id) => window.partcraft.regen.refGeom.get(id), f.id);
  ok(g && near6(g.p, [50, 0, 40], 1e-9), `Point › middle of an edge, the edge clicked: (50, 0, 40) (${g && g.p.map((v) => +v.toFixed(6))})`);
  await page.keyboard.press('Escape');
  await menu('plane');
  await choose('Type', 'edgept');
  await page.click('[data-props] [data-slot="edge"]');
  await clickWorld([30, 0, 40]);   // the same edge, away from the point feature drawn at its middle
  await built();
  await page.click('[data-props] [data-slot="points0"]');
  await clickWorld([80, 30, 40]);   // a spot on the front face (z 40)
  await built();
  f = await last();
  g = await pc((id) => window.partcraft.regen.refGeom.get(id), f.id);
  const P0 = await pc((id) => window.partcraft.part.features.find((x) => x.id === id).points[0]?.p, f.id);
  const dist = g && P0 ? Math.abs((P0[0] - g.frame.o[0]) * g.frame.n[0] + (P0[1] - g.frame.o[1]) * g.frame.n[1] + (P0[2] - g.frame.o[2]) * g.frame.n[2]) : 1;
  // the edge (y 0, z 40) and a point of the face z 40: the plane z = 40
  ok(g && Math.abs(g.frame.n[0]) < 1e-12 && Math.abs(Math.abs(g.frame.n[2]) - 1) < 1e-6 && dist < 1e-9 && Math.abs(g.frame.o[2] - 40) < 1e-9, `Plane › through an edge and a point, both clicked: the plane z 40 holding both (n ${g && g.frame.n.map((v) => +v.toFixed(6))}) ${await results()}`);
  await shot('bodies-datum');
  ok((await rows()) === 1, 'the toolbar is still one row');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
