#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-solids.mjs — 0.9 DC.54 (session nurbs-09) in PartCraft's real page, headless Chromium on /lab/partcraft (rule 49): the Surfaces
 * workspace's Solids group — Box solid and Cylinder solid from typed sizes, Subtract picked from the Solids list (the part's own manifold-3d),
 * the measured result line, the panel's Undo / Redo, an empty Intersect refused in words; then Surfaces › Bake: the solid becomes a body of
 * the part (an import feature with a mesh, one part undo step) and the part's volume is the solid's; a second bake cut from it; the part's
 * Undo takes the bake back; the patch set (with its solid) is kept in the part file. No console errors.
 *   PC_EXACT=0 node tools/partcraft-test/browser-solids.mjs [--state <file>] [--out <dir>]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

const partVolume = () => {
  const m = window.partcraft.regen?.mesh;
  if (!m) return 0;
  const P = m.positions || m.vertProperties, I = m.indices || m.triVerts, np = m.numProp || 3;
  let v = 0;
  for (let i = 0; i < I.length; i += 3) {
    const a = I[i] * np, b = I[i + 1] * np, c = I[i + 2] * np;
    v += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
  }
  return Math.abs(v);
};

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== DC.54 solids in the Surfaces workspace');
  const P = await import(DEV + 'part.js');
  await pc((t) => window.partcraft.openText(t, 'Solids.partcraft.json'), P.toJSON(P.newPart('Solids')));
  await built();
  await page.selectOption('[data-workspace]', 'surfaces');
  await page.waitForSelector('[data-nurbs-panel]');
  const status = () => page.textContent('[data-status]');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const names = await page.$$eval('[data-nurbs-start^="solid."]', (b) => b.map((x) => x.dataset.nurbsStart));
  ok(names.length === 10, 'the panel has the Solids group: ' + names.join(', '));   // 10 since 0.9 SU.747c (nurbs-s3-09): + Fillet between faces, Fillet several edges, Thicken into a solid
  ok(await page.isVisible('[data-nurbs-no-solids]'), 'the Solids list says there are none yet');
  const tb = await page.$$eval('.pc-tools [data-cmd="surfaces-bake"]', (b) => b.filter((x) => x.offsetParent).length);
  ok(tb === 1, 'the Surfaces toolbar has Bake');

  await page.click('[data-nurbs-start="solid.box"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'ready', 'Box solid needs nothing picked');
  await opt('size', '100, 60, 40');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  ok(/Volume 240000 mm³/.test(await status()), 'Box solid: made, its volume measured — ' + (await status()).slice(0, 120));
  await page.click('[data-nurbs-start="solid.cylinder"]');
  await opt('base', '50, 30, -10'); await opt('radius', '15'); await opt('height', '60');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b2"]');
  ok(/6 faces/.test(await page.textContent('[data-nurbs-solid="b1"]')) && /3 faces/.test(await page.textContent('[data-nurbs-solid="b2"]')), 'the Solids list: the box (6 faces) and the cylinder (3 faces)');

  console.log('== Subtract');
  await page.click('[data-nurbs-start="solid.subtract"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'solid', 'Subtract asks for a solid');
  await page.click('[data-nurbs-pick="b1"]'); await page.click('[data-nurbs-pick="b2"]');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /Subtract: done/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 });
  const line = await status();
  const vol = Number((line.match(/volume ([\d.]+) mm³/) || [])[1]);
  const want = 100 * 60 * 40 - Math.PI * 225 * 40;
  ok(/7 faces/.test(line) && Math.abs(vol - want) / want < 5e-4 && /close again/.test(line), 'Subtract: 7 faces, volume ' + vol + ' vs ' + want.toFixed(2) + ' (closed form), the faces close again — ' + line.slice(0, 260));
  const sols = await pc(() => window.partcraft.part.studies?.nurbs?.solids || []);
  ok(sols.length === 1 && sols[0].faces.length === 7, 'the result is the one solid, kept in the part file (studies.nurbs.solids)');
  ok((await pc(() => window.partcraft.part.studies.nurbs.items.filter((i) => i.trim).length)) === 3, 'three faces carry new trims (the two holes and the inside wall)');
  await shot('solids-subtract');
  await page.click('[data-nurbs-undo]');
  ok((await pc(() => (window.partcraft.part.studies?.nurbs?.solids || []).length)) === 2, 'the panel Undo brings the box and the cylinder back');
  await page.click('[data-nurbs-redo]');
  const sid = await pc(() => window.partcraft.part.studies.nurbs.solids[0].id);

  console.log('== an empty Intersect is refused');
  await page.click('[data-nurbs-start="solid.box"]'); await opt('corner', '500, 0, 0'); await opt('size', '10, 10, 10'); await page.click('[data-nurbs-run]');
  const far = await pc(() => window.partcraft.part.studies.nurbs.solids.at(-1).id);
  await page.click('[data-nurbs-start="solid.intersect"]');
  await page.click(`[data-nurbs-pick="${sid}"]`); await page.click(`[data-nurbs-pick="${far}"]`);
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-error]');
  ok((await page.getAttribute('[data-nurbs-error]', 'data-nurbs-error')) === 'nurbs.err.bool_empty' && /share nothing/.test(await page.textContent('[data-nurbs-error]')), 'two solids apart: Intersect is refused in words, nothing changed');
  await page.click('[data-nurbs-cancel]');

  console.log('== Bake into the part');
  const before = await pc(() => window.partcraft.part.features.length);
  await page.click('.pc-tools [data-cmd="surfaces-bake"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-bake-dialog]');
  await page.selectOption('[data-bake-solid]', sid);
  await page.selectOption('[data-bake-op]', 'add');
  await page.click('dialog.pc-dialog[open] [data-key="bake"]');
  await page.waitForFunction(() => /baked into the part/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 });
  await built();
  const f = await pc(() => { const x = window.partcraft.part.features.at(-1); return { type: x.type, mesh: !!x.mesh, op: x.op, up: x.up, file: x.file, closed: x.report?.closed, n: window.partcraft.part.features.length, st: window.partcraft.regen.results.get(x.id)?.status }; });
  ok(f.n === before + 1 && f.type === 'import' && f.mesh && f.op === 'add' && f.up === 'y' && f.closed && f.st === 'ok', 'Bake: one import feature with a closed mesh, built — ' + JSON.stringify(f));
  const v1 = await pc(partVolume);
  ok(Math.abs(v1 - vol) / vol < 1e-3, 'the part\'s volume is the solid\'s: ' + v1.toFixed(1) + ' vs ' + vol);
  await shot('solids-baked');
  // a second bake, cut from the part: a 20 mm sphere at a corner
  await page.click('[data-nurbs-start="solid.sphere"]'); await opt('center', '100, 60, 40'); await opt('radius', '20'); await page.click('[data-nurbs-run]');
  const sph = await pc(() => window.partcraft.part.studies.nurbs.solids.at(-1).id);
  await page.click(`[data-nurbs-bake="${sph}"]`);
  await page.waitForSelector('dialog.pc-dialog[open] [data-bake-dialog]');
  await page.selectOption('[data-bake-op]', 'cut');
  await page.click('dialog.pc-dialog[open] [data-key="bake"]');
  await page.waitForFunction(() => /baked into the part \(cut/i.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 });
  await built();
  const v2 = await pc(partVolume), cut = 4 / 3 * Math.PI * 8000 / 8;
  ok(Math.abs((v1 - v2) - cut) / cut < 0.01, 'Bake into the part from the Solids list, cut: an eighth of the sphere comes off: ' + (v1 - v2).toFixed(1) + ' vs ' + cut.toFixed(1));
  await pc(() => window.partcraft.undoRedo(true));
  await built();
  const v3 = await pc(partVolume);
  ok(Math.abs(v3 - v1) / v1 < 1e-6 && (await pc(() => window.partcraft.part.features.length)) === before + 1, 'the part\'s Undo takes the cut bake back (one step)');
  // the part file: the solid and the baked body both kept
  const back = await pc(() => { const b = window.partcraft.P.readPart(window.partcraft.P.toJSON(window.partcraft.part)); return { body: b.features.some((x) => x.type === 'import' && x.mesh), solids: (b.studies?.nurbs?.solids || []).length }; });
  ok(back.body && back.solids >= 2, 'the part file keeps the baked body and the solids (read back by PartCraft): ' + JSON.stringify(back));
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-solids');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
