#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-clash-filters.mjs — 0.5 WL.33 on the page (the mesh kernel): an assembly of a plate with a tapped M10 hole, a bolt
 * with a cosmetic thread in it, a block through the plate's corner and a block resting on it; Clash lists a thread fit, an
 * overlap and touching faces with their kinds; clearing "Thread fit" and "Touching faces" leaves the overlap; "Hide this
 * pair" hides it (the status bar and the panel count what is hidden); one Ctrl+Z brings the pair back; the filters are saved
 * with the assembly (version 4) and read back; no console errors.
 *   node tools/partcraft-test/browser-clash-filters.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, shot, F } = h;
const DEV = '../../public_html/assets/apps/partcraft/dev/';

try {
  console.log('\n== interference kinds and filters (0.5 WL.33)');
  const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), A = await import(DEV + 'assembly.js'), V = await import(DEV + 'vec.js');
  const K = await import(DEV + 'kernel.js');
  const { default: Module } = await import('../../public_html/assets/vendor/manifold-3d/current/manifold.js');
  const M = await Module(); M.setup();
  const plate = P.newPart('Plate');
  const ps = P.addFeature(plate, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(60, 60).sk });
  const pe = P.addFeature(plate, 'extrude', { sketch: ps.id, depth: 30 });
  const hk = S.newSketch(); S.addPoint(hk, 30, 30);
  const hs = P.addFeature(plate, 'sketch', { plane: { kind: 'face', feature: pe.id, face: 'end' }, sketch: hk });
  P.addFeature(plate, 'hole', { sketch: hs.id, kind: 'tapped', size: 'M10', d: 10, depth: 20, through: false, threadDepth: 12, csinkD: 12, csinkAngle: 90 });
  const bolt = P.newPart('Bolt');
  const bk = S.newSketch(); S.addCircle(bk, [0, 0], 5);
  const bs = P.addFeature(bolt, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: bk });
  P.addFeature(bolt, 'extrude', { sketch: bs.id, depth: 30 });
  P.addFeature(bolt, 'thread', { faces: [{ name: K.regenerate(bolt, M).faces.find((f) => f.type === 'cylinder').name }] });
  const block = P.newPart('Block');
  const ks = P.addFeature(block, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(10, 10).sk });
  P.addFeature(block, 'extrude', { sketch: ks.id, depth: 10 });
  const asm = A.newAssembly('Bolted');
  A.insertPart(asm, plate);
  A.insertPart(asm, bolt, { place: V.translation([30, 20, -30]) });
  const ix = A.insertPart(asm, block, { place: V.translation([55, 25, 5]) });
  A.insertPart(asm, block, { pid: ix.part, place: V.translation([5, 30, -55]) });
  await pc((t) => window.partcraft.openText(t, 'Bolted.partcraft-asm.json'), A.toJSON(asm));
  await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-check');
  await page.waitForSelector('[data-clash-block]');
  const rows = () => page.evaluate(() => [...document.querySelectorAll('[data-clashes] li')].map((li) => li.dataset.clashKind + ': ' + li.querySelector('.grow').textContent));
  let r = await rows();
  ok(r.length === 3 && r.some((x) => /^thread: Plate\S* and Bolt\S*: Thread fit \(cosmetic threads\), [\d.]+ mm³$/.test(x)) && r.some((x) => /^overlap: .*Overlap, 125/.test(x)) && r.some((x) => /^touch: .*touching faces$/.test(x)), 'Clash lists a thread fit, an overlap of 125 mm³ and touching faces: ' + r.join(' | '));
  ok(/Interference: /.test(await h.statusText()), 'the status bar lists them');
  await shot('cf-1-all');
  await page.locator('[data-clash-kind-toggle="thread"] input').uncheck();
  await page.locator('[data-clash-kind-toggle="touch"] input').uncheck();
  r = await rows();
  ok(r.length === 1 && /^overlap/.test(r[0]) && (await page.getAttribute('[data-clash-hidden]', 'data-clash-hidden')) === '2', 'clearing Thread fit and Touching faces leaves the overlap; "2 results hidden"');
  await page.click('[data-clashes] li [data-clash-hide]');
  r = await rows();
  ok(r.length === 0 && (await page.getAttribute('[data-clash-hidden]', 'data-clash-hidden')) === '3' && await page.isVisible('[data-clash-show-pairs]'), 'Hide this pair: nothing left; 3 hidden; "Show the hidden pair again" is offered');
  const facts = await page.evaluate(() => [...document.querySelectorAll('[data-facts] dd, .pc-dl dd')].map((d) => d.textContent).join('|'));
  ok(/None/.test(facts), 'the Assembly box says Interference: None (what is shown)');
  await page.keyboard.press('Escape');
  await page.click('.pc-stage canvas', { position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(200);
  r = await rows();
  ok(r.length === 1 && /^overlap/.test(r[0]), 'one Ctrl+Z brings the pair back (the kinds stay hidden)');
  const saved = await pc(() => JSON.parse(window.partcraft.A.toJSON(window.partcraft.asm)));
  ok(saved.version === 4 && saved.clashFilter.hide.join() === 'thread,touch' && saved.clashFilter.pairs.length === 0, 'the filters are in the assembly file (version 4)');
  await shot('cf-2-filtered');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
