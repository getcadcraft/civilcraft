#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-section.mjs — the live section view (0.4 P13) in headless Chromium: View › Views › Section view and key X, the
 * card's plane / position / flip / caps, the filled cut read back from the rendered pixels (the cap is tinted, the hole
 * through it is not), picks that pass what is cut away, a flat face picked as the plane, Esc, and the same cut on an
 * assembly's two placed parts (clipping on both, caps written for both). No console errors, one toolbar row.
 *   node tools/partcraft-test/browser-section.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const screenOf = (p) => pc((p) => {
    const v = window.partcraft.view, q = v.camera.position.clone().set(p[0], p[1], p[2]).project(v.camera), r = v.canvas.getBoundingClientRect();
    return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height];
  }, p);
  /** The rendered RGB at a world point (the WebGL canvas keeps its drawing buffer). */
  const pixel = async (p) => {
    const [x, y] = await screenOf(p);
    return pc(([x, y]) => {
      const v = window.partcraft.view, c = v.canvas; v.renderNow();
      const o = document.createElement('canvas'); o.width = c.width; o.height = c.height;
      const g = o.getContext('2d'); g.drawImage(c, 0, 0);
      const r = c.getBoundingClientRect();
      return [...g.getImageData(Math.round((x - r.left) * c.width / r.width), Math.round((y - r.top) * c.height / r.height), 1, 1).data].slice(0, 3);
    }, [x, y]);
  };
  const reddish = (c) => c[0] - c[2] > 10;   // the cap: body grey pulled toward the warm layer colour (the grey body reads r − b ≈ −13)
  const sec = () => pc(() => window.partcraft.view.section && { n: window.partcraft.view.section.n, c: window.partcraft.view.section.c, caps: !!window.partcraft.view.capQuad });
  const near3 = (a, b, t = 1e-9) => a && b && a.every((v, i) => Math.abs(v - b[i]) <= t);
  const pressX = async () => { await page.focus('.pc-stage canvas'); await page.keyboard.press('x'); await page.waitForTimeout(80); };

  console.log('\n== section view: a 100 × 50 × 20 block with a Ø20 hole along Z');
  // front-plane sketch extruded +Z: x 0…100, y 0…50, z 0…20; the hole's axis at (50, 25)
  await pc((t) => window.partcraft.openText(t, 'Section.partcraft.json'), await pc(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Section');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 50]); S.addCircle(sk, [50, 25], 10);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
    return JSON.stringify(part);
  }));
  await built();
  await pc(() => { window.partcraft.view.view('iso'); window.partcraft.view.fit(); });
  await page.waitForTimeout(150);
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-views-menu] [data-cmd]')].map((b) => b.dataset.cmd).join());
  ok(/view-measure,view-mass,view-section/.test(items), `Views holds Measure, Mass properties, Section view (${items})`);
  const topBefore = await pixel([20, 10, 20]);
  ok(!reddish(topBefore), `before the cut the top face is body grey (${topBefore})`);

  await pressX();
  ok(await page.isVisible('[data-section]') && (await page.getAttribute('[data-cmd="view-section"]', 'aria-checked')) === 'true', 'X opens the Section view card; the menu item is checked');
  let s = await sec();
  ok(s && near3(s.n, [0, 0, 1]) && Math.abs(s.c - 10) < 1e-9 && s.caps, `default: the front plane through the middle of the model (cut away z > ${s?.c}), caps on`);
  await shot('section-front');
  const cap = await pixel([20, 10, 10]), hole = await pixel([50, 25, 10]);
  ok(reddish(cap), `the cut face at (20, 10, 10) is filled (${cap})`);
  ok(!reddish(hole), `the hole through it stays open (${hole} at its axis)`);
  const hit = await pc(([x, y]) => { const hh = window.partcraft.view.pickAt(x, y); return hh && hh.point ? hh.point : null; }, await screenOf([20, 10, 20]));
  ok(!hit || hit[2] <= 10 + 1e-6, `a click where the top face was goes through the cut (${hit ? 'z ' + hit[2].toFixed(3) : 'nothing'})`);
  ok(await pc(() => Math.abs(window.partcraft.regen.stats.volume - (100 * 50 - Math.PI * 100) * 20) < 1e-6), 'the part is unchanged: volume (5000 − 100π)·20');

  await page.fill('[data-section-at]', '5'); await page.press('[data-section-at]', 'Enter');
  s = await sec();
  ok(s && Math.abs(s.c - 5) < 1e-12 && Math.abs(Number(await page.inputValue('[data-section-slider]')) - 5) < 1e-9, 'typing 5 mm moves the plane and the slider');
  await page.check('[data-section-flip]');
  s = await sec();
  ok(s && near3(s.n, [0, 0, -1]) && Math.abs(s.c + 5) < 1e-12, 'Cut away the other side: the same plane, z < 5 cut away');
  await page.uncheck('[data-section-caps]');
  ok(!(await sec()).caps, 'Fill the cut faces off: no cap');
  await page.check('[data-section-caps]'); await page.uncheck('[data-section-flip]');
  await page.selectOption('[data-section-plane]', 'right');
  s = await sec();
  ok(s && near3(s.n, [1, 0, 0]) && Math.abs(s.c - 50) < 1e-9, `Plane › Right (YZ): through the middle, x = ${s?.c}`);

  // a picked flat face: the top (z 20) — then 15 mm puts the cut 5 below it
  await page.selectOption('[data-section-plane]', 'front');
  await page.fill('[data-section-at]', '30'); await page.press('[data-section-at]', 'Enter');   // nothing cut, so the top is clickable
  await page.click('[data-section-pick]');
  const [tx, ty] = await screenOf([20, 10, 20]);
  await page.mouse.click(tx, ty); await page.waitForTimeout(80);
  s = await sec();
  ok(s && near3(s.n, [0, 0, 1], 1e-9) && Math.abs(s.c - 20) < 1e-9 && (await page.inputValue('[data-section-plane]')) === 'face', 'Pick a face, then the top face: the plane lies on it (n +Z, at 20), "Picked face" chosen');
  await page.fill('[data-section-at]', '15'); await page.press('[data-section-at]', 'Enter');
  { const s15 = await sec(), p15 = await pixel([20, 10, 15]); ok(Math.abs(s15.c - 15) < 1e-12 && reddish(p15), `moved to 15 mm: cut 5 below the top, filled (${JSON.stringify(s15)}, ${p15})`); }
  await page.focus('.pc-stage canvas'); await page.keyboard.press('Escape'); await page.waitForTimeout(60);
  ok(!(await page.isVisible('[data-section]')) && (await sec()) === null && !reddish(await pixel([20, 10, 20])), 'Esc closes it: the whole part again');
  ok((await rows()) === 1, 'the toolbar is one row');

  console.log('\n== section view: an assembly of two copies');
  await h.tool('asm-new'); await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy'); await pc(() => window.partcraft.asmBuilt());
  await pc(() => { window.partcraft.view.view('iso'); window.partcraft.view.fit(); });
  await pressX();
  const st = await pc(() => { const v = window.partcraft.view; return { insts: v.instances.length, clipped: v.instances.every((o) => o.mesh.material.clippingPlanes?.length === 1 && o.edges.material.clippingPlanes?.length === 1), writers: v.capParts.length, cap: !!v.capQuad }; });
  ok(st.insts === 2 && st.clipped && st.writers === 4 && st.cap, `both placed parts are cut, each with its two stencil writers, one cap (${JSON.stringify(st)})`);
  const where = await pc(() => { const a = window.partcraft.asm; return a.instances.map((i) => [i.place[12], i.place[13], i.place[14]]); });
  const capA = await pixel([where[1][0] + 20, where[1][1] + 10, where[1][2] + 10]);
  ok(reddish(capA), `the second copy's cut is filled too (${capA})`);
  await shot('section-assembly');
  await page.focus('.pc-stage canvas'); await page.keyboard.press('Escape');
  await pc(() => { window.partcraft.asmHist.clear(); });
  await h.tool('asm-close');
  const dlg = await page.$('dialog[open] [data-key="discard"]');
  if (dlg) await dlg.click();
  await page.waitForTimeout(200);
  ok(await pc(() => window.partcraft.mode === 'model'), 'assembly closed');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
