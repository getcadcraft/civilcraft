#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gordon-g1.mjs — Gordon surfaces tangent to planes (0.4 P11), headless Chromium: a tent network of sketch lines
 * (profiles at y 0, 50, 100; guides at x 0, 50, 100), its Gordon surface; in the panel, Tangent to › Add a plane › Front plane
 * (the floor, z 0) twice: the report names both outer profiles; Remove takes one off; one undo step each. No console errors.
 *   node tools/partcraft-test/browser-gordon-g1.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== Gordon surface tangent to planes');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc(() => window.partcraft.exactReady());
  // built here with the app's own modules (V.frameFor sets a fixed sketch plane's axes, as the app does)
  const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
  const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), V = await import(DEV + 'vec.js');
  const part = P.newPart('Tent');
  const onPlane = (o, n, pts) => {
    const fr = V.frameFor(n, o), L = (p) => V.toPlane(fr, p), sk = S.newSketch();
    let prev = null;
    for (let i = 0; i + 1 < pts.length; i++) prev = S.addLine(sk, prev ? prev.p2 : L(pts[i]), L(pts[i + 1]));
    return P.addFeature(part, 'sketch', { sketch: sk, plane: { kind: 'fixed', o, n } });
  };
  const pr = [0, 50, 100].map((y) => onPlane([0, y, 0], [0, 1, 0], [[0, y, y === 50 ? 20 : 0], [50, y, y === 50 ? 30 : 0], [100, y, y === 50 ? 20 : 0]]));
  const gu = [0, 50, 100].map((x) => onPlane([x, 0, 0], [1, 0, 0], [[x, 0, 0], [x, 50, x === 50 ? 30 : 20], [x, 100, 0]]));
  P.addFeature(part, 'gordon', { profiles: pr.map((s) => ({ sketch: s.id })), guides: gu.map((s) => ({ sketch: s.id })) });
  const json = P.toJSON(part);
  await pc((t) => window.partcraft.openText(t, 'Tent.partcraft.json'), json);
  await built();
  const gid = await pc(() => window.partcraft.part.features.at(-1).id);
  const result = () => pc((id) => { const r = window.partcraft.regen.results.get(id); return { status: r?.status, message: r?.message, tangent: r?.gordon?.tangent?.map((x) => x.side) || [] }; }, gid);
  let r = await result();
  ok(r.status === 'ok' && !r.tangent.length, `the tent's Gordon surface builds (${r.status}${r.message ? ': ' + r.message : ''})`);
  await pc((id) => window.partcraft.selectFeature(id), gid);
  await page.waitForSelector('[data-props] [data-gordon-tangent-add]');
  ok(/None: the surface meets its neighbours/.test(await page.textContent('[data-props]')), 'the panel has Tangent to: none yet');
  for (let k = 0; k < 2; k++) { await page.selectOption('[data-props] [data-gordon-tangent-add]', 'base:front'); await built(); await page.waitForTimeout(150); }
  r = await result();
  const txt = await page.textContent('[data-props]');
  ok(r.status === 'ok' && r.tangent.length === 2 && (await page.$$('[data-props] [data-gordon-tangent]')).length === 2 && (txt.match(/tangent along Profile/g) || []).length === 2, `Add a plane › Front plane, twice: tangent along both outer profiles (${r.tangent.join(', ')}), listed and reported`);
  await shot('gordon-g1');
  await page.click('[data-props] [data-gordon-tangent="1"] button'); await built();
  ok((await result()).tangent.length === 1, 'Remove takes one off');
  await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built();
  ok((await result()).tangent.length === 2, 'Ctrl+Z puts it back');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-gordon');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
