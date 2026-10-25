#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-design-features.mjs — PartCraft's Design features (2026-10-11) in headless Chromium, by clicks: the toolbar's
 * "More" features menu (one row at 1440 px), an offset plane made from the top plane and moved in its panel, a sketch on it
 * (rectangle by coordinates), a loft between it and a sketch on the top plane (frustum, exact), a sweep (circle along a
 * line: 2500π), a draft of a block's four sides picked by clicks in the view (analytic frustum), a reference plane picked
 * by a click on a face (Pick button), a tapped hole's panel, and no console errors.
 *   node tools/partcraft-test/browser-design-features.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, tool, shot, nearRel } = h;
  const PI = Math.PI;
  const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const vol = () => pc(() => window.partcraft.regen.stats?.volume ?? null);
  const results = () => pc(() => [...window.partcraft.regen.results].filter(([, r]) => r.status !== 'ok').map(([k, r]) => k + ': ' + r.message).join('; '));
  const fieldByLabel = (label) => page.locator('[data-props] label', { hasText: label }).first();
  // the control after a panel label (field() puts the input right after its label)
  const control = (label) => fieldByLabel(label).locator('xpath=following-sibling::*[1]/descendant-or-self::*[self::input or self::select][1]');
  async function setNum(label, v) {
    const c = control(label);
    await c.fill(String(v)); await c.press('Enter');
    await built();
  }
  async function rectByCoords(a, b) {
    await page.locator('form.pc-props select').first().selectOption('rect');
    await page.fill('#pc-num-0', a); await page.fill('#pc-num-1', b);
    await page.click('form.pc-props button[type=submit]');
  }
  async function circleByCoords(c, r) {
    await page.locator('form.pc-props select').first().selectOption('circle');
    await page.fill('#pc-num-0', c); await page.fill('#pc-num-1', String(r));
    await page.click('form.pc-props button[type=submit]');
  }
  /** Screen position of a world point in the 3D view. */
  const screenOf = (p) => pc((p) => {
    const v = window.partcraft.view, cam = v.camera;
    const q = cam.position.clone().set(p[0], p[1], p[2]).project(cam);
    const r = v.canvas.getBoundingClientRect();
    return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height];
  }, p);
  const clickWorld = async (p, opts) => { const [x, y] = await screenOf(p); await page.mouse.click(x, y, opts); await page.waitForTimeout(50); };

  console.log('\n== design features: the More menu, offset plane, sketch on it, loft');
  await pc(() => window.partcraft.exactReady());
  await tool('new').catch(() => {});
  await page.waitForTimeout(200);
  if (await page.locator('dialog[open] button', { hasText: 'Discard' }).count()) await page.click('dialog[open] button:has-text("Discard")');
  await built();
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-features-menu] [data-cmd]')].map((b) => b.dataset.cmd).join());
  ok(items.startsWith('revolve-cut,plane,axis,point,sweep,loft,draft'), `the Features group has a "More" menu: ${items}`);
  ok((await rows()) === 1, 'the toolbar is still one row at 1440 px');
  // the top plane picked in the history, then More › Plane: offset from it
  await page.click('[data-tree] [data-plane="top"]');
  await menu('plane');
  let f = await pc(() => window.partcraft.part.features.at(-1));
  ok(f.type === 'plane' && f.mode === 'offset' && f.planes[0].name === 'top', 'More › Plane makes an offset plane from the picked top plane');
  await setNum('Distance (mm)', 30);
  const g = await pc((id) => window.partcraft.regen.refGeom.get(id), f.id);
  ok(Math.abs(g.frame.o[1] - 30) < 1e-9 && Math.abs(g.frame.n[1] - 1) < 1e-12, 'distance 30 typed in its panel: the plane sits at y 30');
  const refsShown = await pc(() => window.partcraft.view.refs.children.length);
  ok(refsShown >= 2, 'the plane shows in the view as a translucent quad with an outline');
  await page.click('[data-props] button:has-text("Sketch on it")');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await rectByCoords('-10, -10', '10, 10');
  await tool('exit-sketch'); await built();
  const sk2 = await pc(() => window.partcraft.part.features.at(-1));
  ok(sk2.type === 'sketch' && sk2.plane.kind === 'ref' && sk2.plane.feature === f.id, 'Sketch on it: a sketch on the reference plane');
  // a sketch on the top plane (it lands before? it is added at the end, after the plane: fine)
  await page.click('[data-tree] [data-plane="top"]');
  await tool('sketch');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await rectByCoords('-20, -20', '20, 20');
  await tool('exit-sketch'); await built();
  await menu('loft');
  f = await pc(() => window.partcraft.part.features.at(-1));
  ok(f.type === 'loft' && f.sections.length === 2, 'More › Loft takes the two unused closed sketches as sections');
  let v = await vol();
  ok(nearRel(v, 28000, 1e-9), `loft 40 × 40 to 20 × 20 over 30: the frustum 28000 (${v}) ${await results()}`);
  await page.click('[data-props] label:has-text("Ruled")');
  await built();
  ok(nearRel(await vol(), 28000, 1e-9) && (await pc(() => window.partcraft.part.features.at(-1).ruled)) === true, 'ruled from its panel: still 28000');
  await shot('design-loft');

  console.log('\n== design features: sweep, draft by clicks, a plane picked on a face, a tapped hole');
  const P = await pc(() => {
    const { P: Pm, S } = window.partcraft;
    const part = Pm.newPart('Sweep');
    const a = S.newSketch(); S.addCircle(a, [0, 0], 5);
    const s1 = Pm.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: a });
    const b = S.newSketch(); S.addLine(b, [0, 0], [0, 100]);
    Pm.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: b });
    return JSON.stringify(part) + '|' + s1.id;
  });
  const [json, profId] = P.split('|');
  await pc((t) => window.partcraft.openText(t, 'Sweep.partcraft.json'), json);
  await built();
  await pc((id) => window.partcraft.selectFeature(id), profId);
  await menu('sweep');
  f = await pc(() => window.partcraft.part.features.at(-1));
  v = await vol();
  ok(f.type === 'sweep' && f.sketch === profId && f.path.length === 1 && nearRel(v, 2500 * PI, 1e-9), `More › Sweep with the circle selected: swept along the other sketch, 2500π (${v})`);
  // a block, then Draft: pick its four sides by clicks
  const blockJson = await pc(() => {
    const { P: Pm, S } = window.partcraft;
    const part = Pm.newPart('Block');
    const a = S.newSketch(); S.addRect(a, [-50, -50], [50, 50]);
    const s = Pm.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: a });
    Pm.addFeature(part, 'extrude', { sketch: s.id, depth: 50 });
    return JSON.stringify(part);
  });
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), blockJson);
  await built();
  await pc(() => window.partcraft.view.view('iso'));
  await menu('draft');
  ok((await pc(() => window.partcraft.mode)) === 'pick', 'More › Draft with nothing picked enters pick mode');
  for (const p of [[0, 25, 50], [50, 25, 0]]) await clickWorld(p);
  await pc(() => window.partcraft.view.view('back'));
  await clickWorld([0, 25, -50]);
  await pc(() => window.partcraft.view.view('left'));
  await clickWorld([-50, 25, 0]);
  await built();
  const nf = await pc(() => window.partcraft.part.features.at(-1).faces.length);
  ok(nf === 4, `four side faces picked by clicks (${nf})`);
  await tool('pick-done'); await built();
  await setNum('Angle (°)', 5);
  v = await vol();
  const a = 100, hh = 50, b = a - 2 * hh * Math.tan(5 * PI / 180);
  ok(nearRel(v, hh / 3 * (a * a + b * b + a * b), 1e-9), `draft 5° about the top plane: the frustum h/3·(a² + b² + ab) (${v}) ${await results()}`);
  await pc(() => window.partcraft.view.view('iso'));
  await shot('design-draft');
  // a reference plane picked on a face with its Pick button
  await page.keyboard.press('Escape');
  await menu('plane');
  await page.click('[data-props] [data-slot="planes0"]');
  await clickWorld([0, 50, 0]);
  await built();
  f = await pc(() => window.partcraft.part.features.at(-1));
  ok(f.planes[0].kind === 'face' && /end/.test(f.planes[0].face || f.planes[0].name || ''), `Pick, then a click on the top face: the plane is offset from that face (${JSON.stringify(f.planes[0])})`);
  const gy = await pc((id) => window.partcraft.regen.refGeom.get(id).frame.o[1], f.id);
  ok(Math.abs(gy - (50 + f.d)) < 1e-9, `it sits ${f.d} above the face`);
  // a tapped hole: the panel's thread list and callout
  const holeJson = await pc(() => {
    const { P: Pm, S } = window.partcraft;
    const part = Pm.newPart('Tapped');
    const a = S.newSketch(); S.addRect(a, [0, 0], [40, 40]);
    const s = Pm.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    const e = Pm.addFeature(part, 'extrude', { sketch: s.id, depth: 20 });
    const hs = S.newSketch(); S.addPoint(hs, 20, 20);
    const s2 = Pm.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e.id, face: 'end' }, sketch: hs });
    const hole = Pm.addFeature(part, 'hole', { sketch: s2.id, through: true });
    return JSON.stringify(part) + '|' + hole.id;
  });
  const [hj, hid] = holeJson.split('|');
  await pc((t) => window.partcraft.openText(t, 'Tapped.partcraft.json'), hj);
  await built();
  await pc((id) => window.partcraft.selectFeature(id), hid);
  await control('Type').selectOption('tapped');
  await built();
  await control('Thread').selectOption('M10');
  await built();
  v = await vol();
  const txt = await page.textContent('[data-props]');
  ok(nearRel(v, 32000 - PI * 4.25 * 4.25 * 20, 1e-9) && txt.includes('M10×1.5 - 6H, thread through') && txt.includes('ISO 2306'), `Tapped M10 from the panel: drilled Ø8.5 (${v}), the callout and its source shown`);
  const dashed = await pc(() => window.partcraft.view.extra.children.filter((o) => o.material?.isLineDashedMaterial).length);
  ok(dashed >= 2, 'the cosmetic thread is drawn dashed at the major diameter');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./rel-browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
