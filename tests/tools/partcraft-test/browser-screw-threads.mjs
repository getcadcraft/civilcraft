#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-screw-threads.mjs — 0.5 WL.29 on the page as it ships (the mesh kernel): a Ø10 boss's round face clicked in the
 * view, More › Thread makes a cosmetic M10 thread (callout in the panel, dashed circles in the view), Modelled cuts the
 * helical thread (named thread face, the volume drops), Clearance 0.2 removes more, a size that does not fit says so, one
 * Ctrl+Z puts the size back, the drawing sheet carries the callout, a flat face is refused while picking, no console errors.
 *   node tools/partcraft-test/browser-screw-threads.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, shot, F } = h;
const stats = async () => { await built(); return pc(() => window.partcraft.regen.stats); };
const proj3 = (p) => pc((p) => { const v = window.partcraft.view; const q = new (v.camera.position.constructor)(p[0], p[1], p[2]).project(v.camera); const r = v.canvas.getBoundingClientRect(); return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height]; }, p);
const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };

try {
  console.log('\n== threads on the mesh kernel (0.5 WL.29)');
  const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
  const S = await import('../../public_html/assets/apps/partcraft/dev/sketch.js');
  const bp = P.newPart('Boss');
  const s1 = P.addFeature(bp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(40, 40).sk });
  const e1 = P.addFeature(bp, 'extrude', { sketch: s1.id, depth: 10 });
  const sk = S.newSketch(); S.addCircle(sk, [20, 20], 5);
  const s2 = P.addFeature(bp, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
  P.addFeature(bp, 'extrude', { sketch: s2.id, depth: 20 });
  await pc((t) => window.partcraft.openText(t, 'Boss.partcraft.json'), JSON.stringify(bp));
  const s0 = await stats();
  ok((await pc(() => window.partcraft.exact.state)) === 'off' && s0.bodies === 1, 'the boss opened on the mesh kernel');
  await pc(() => window.partcraft.view.view('iso'));
  await page.waitForTimeout(100);

  // a flat face first: More › Thread opens pick mode, the flat face is refused
  const cyl = await pc(() => window.partcraft.regen.faces.find((f) => f.type === 'cylinder'));
  await page.keyboard.press('Escape');
  await menu('thread');
  await page.waitForFunction(() => window.partcraft.mode === 'pick');
  const topPt = await proj3([30, 10, -30]);   // the block's top, beside the boss
  await page.mouse.click(topPt[0], topPt[1]);
  ok(/round face/.test(await h.statusText()) && (await pc(() => window.partcraft.part.features.at(-1).faces.length)) === 0, 'More › Thread with nothing picked opens pick mode; a flat face is refused: ' + (await h.statusText()).trim());
  // the boss's side: a point on the cylinder facing the camera
  const side = await proj3([cyl.axis.o[0] + 5 * Math.SQRT1_2, 25, cyl.axis.o[2] + 5 * Math.SQRT1_2]);
  await page.mouse.click(side[0], side[1]);
  await built();
  let f = await pc(() => window.partcraft.part.features.at(-1));
  ok(f.type === 'thread' && f.faces.length === 1 && f.faces[0].name === cyl.name, `clicking the boss's round face adds it (${f.faces[0]?.name})`);
  await h.tool('pick-done');
  await built();
  let r = await pc((id) => { const p = window.partcraft; const th = p.regen.threads.get(id); return { st: p.regen.results.get(id).status, callout: th?.callout, modelled: th?.modelled, vol: p.regen.stats.volume }; }, f.id);
  ok(r.st === 'ok' && r.callout === 'M10×1.5 - 6g, thread 20 long' && !r.modelled && Math.abs(r.vol - s0.volume) < 1e-6, `a cosmetic M10 by itself: "${r.callout}", the solid unchanged`);
  ok(await page.locator('.pc-right', { hasText: 'M10×1.5 - 6g, thread 20 long' }).count() > 0, 'the panel shows the callout');
  await shot('th-1-cosmetic');

  // Modelled
  await page.locator('.pc-right label.pc-check', { hasText: 'Modelled' }).locator('input').check();
  let s = await stats();
  r = await pc((id) => { const p = window.partcraft; return { st: p.regen.results.get(id).status, faces: p.regen.faces.filter((x) => x.type === 'thread').map((x) => [x.name, x.r]), callout: p.regen.threads.get(id).callout }; }, f.id);
  const removed1 = s0.volume - s.volume;
  // closed form: 20 × (the faceted Ø10 circle − the bolt's section at clearance 0.1), as test-screw-threads.mjs
  const TH = await import('../../public_html/assets/apps/partcraft/dev/threads.js');
  const c = TH.profileCorners('iso', 'M10', -0.1);
  let A = 0; for (let k = 1; k < c.length; k++) { const wd = c[k][0] - c[k - 1][0], a = c[k - 1][1], b = c[k][1]; A += Math.PI * wd * (a * a + a * b + b * b) / 3; }
  const want = 20 * (0.5 * 64 * 25 * Math.sin(2 * Math.PI / 64) - A / 1.5);
  ok(r.st === 'ok' && r.faces.length === 1 && Math.abs(r.faces[0][1] - 4.9) < 1e-9 && Math.abs(removed1 - want) < 0.01 * want && s.bodies === 1, `Modelled: the helical thread is cut (${removed1.toFixed(2)} mm³ removed = ${want.toFixed(2)} to 1 %, crest Ø9.8 at clearance 0.1), one body`);
  ok(r.callout === 'M10×1.5 - 6g, thread 20 long (modelled)', 'the callout says modelled');
  await page.waitForTimeout(200);
  await shot('th-2-modelled');
  const cl = page.locator('.pc-right label:has-text("Clearance (mm)") + input');
  await cl.fill('0.2'); await cl.press('Enter');
  s = await stats();
  ok(s0.volume - s.volume > removed1 + 5, `clearance 0.2 removes more (${(s0.volume - s.volume).toFixed(2)} mm³)`);

  // a size that does not fit: built, and said; one undo puts it back
  const sizeSel = page.locator('.pc-right label:has-text("Size") + select');
  await sizeSel.selectOption('M12');
  await built();
  const w = await pc((id) => window.partcraft.regen.results.get(id), f.id);
  ok(w.status === 'ok' && /not M12's Ø12/.test(w.warning || ''), 'M12 on a Ø10 shaft: built, and the panel says ' + (w.warning || ''));
  await page.keyboard.press('Control+z');
  await built();
  ok((await pc((id) => window.partcraft.part.features.find((x) => x.id === id).size, f.id)) === 'auto', 'one Ctrl+Z puts Fit to the face back');

  // the drawing sheet notes the thread
  await h.tool('drawing');
  await page.waitForTimeout(400);
  const sheetText = await page.locator('.pc-stage, [data-sheet], svg').allTextContents().then((a) => a.join(' ')).catch(() => '');
  ok(/M10×1\.5 - 6g, thread 20 long \(modelled\)/.test(sheetText), 'the drawing sheet carries the callout');
  await shot('th-3-drawing');
  await h.tool('dr-back');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
