#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scanfit.mjs — 0.9 SU.1082 (session reverse-nurbs-09) in PartCraft's real page, headless Chromium on /lab/partcraft (rule 49): the
 * Surfaces workspace's Scan group. A cylinder (radius 15, height 60) is made by Cylinder solid and baked into the part, so the part's mesh is a
 * faceted can (chords within 0.05 mm); the NURBS solid is deleted; "Fit surfaces to the scan" must find ONE cylinder and TWO planes from that
 * mesh alone, with the radius, the measured error line and table shown; "Stitch the surfaces to a solid" closes them (volume against the
 * closed form) and the panel Undo takes it back. A part with no body says so in words. No console errors.
 *   PC_EXACT=0 node tools/partcraft-test/browser-scanfit.mjs [--state <file>] [--out <dir>]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { roundedBox, roundedVolume, binaryStl } = await import(path.join(HERE, '../nurbs/scan-fixtures.mjs'));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== SU.1082 scan fit in the Surfaces workspace');
  const P = await import(DEV + 'part.js');
  await pc((t) => window.partcraft.openText(t, 'Scan.partcraft.json'), P.toJSON(P.newPart('Scan')));
  await built();
  await page.selectOption('[data-workspace]', 'surfaces');
  await page.waitForSelector('[data-nurbs-panel]');
  const status = () => page.textContent('[data-status]');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const names = await page.$$eval('[data-nurbs-start^="scan."]', (b) => b.map((x) => x.dataset.nurbsStart));
  ok(names.join() === 'scan.fit,scan.solid', 'the panel has the Scan group: ' + names.join(', '));

  console.log('== a part with no body');
  await page.click('[data-nurbs-start="scan.fit"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-error]');
  ok(/Select a mesh first/.test(await page.textContent('[data-nurbs-error]')), 'Fit with nothing to fit says so in words');
  await page.click('[data-nurbs-cancel]');

  console.log('== a can in the part (Cylinder solid, baked)');
  await page.click('[data-nurbs-start="solid.cylinder"]');
  await opt('base', '0, 0, 0'); await opt('radius', '15'); await opt('height', '60');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  await page.click('.pc-tools [data-cmd="surfaces-bake"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-bake-dialog]');
  await page.click('dialog.pc-dialog[open] [data-key="bake"]');
  await page.waitForFunction(() => /baked into the part/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 30000 });
  await built();
  const tris = await pc(() => window.partcraft.regen.mesh.indices.length / 3);
  await page.click('[data-nurbs-solid-delete="b1"]');
  ok((await pc(() => window.partcraft.part.studies?.nurbs?.items?.length || 0)) === 0, 'the NURBS cylinder is deleted; the baked mesh body (' + tris + ' triangles) stays');

  console.log('== Fit surfaces to the scan');
  await page.click('[data-nurbs-start="scan.fit"]');
  await opt('tol', '0.1');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-scan-table]', { timeout: 60000 });
  const line = await status();
  const rows = await page.$$eval('[data-nurbs-scan-row]', (r) => r.map((x) => ({ ok: x.dataset.ok, t: x.textContent })));
  const kinds = rows.map((r) => (/Cylinder/.test(r.t) ? 'cylinder' : /Plane/.test(r.t) ? 'plane' : 'other')).sort().join();
  ok(kinds === 'cylinder,plane,plane' && rows.every((r) => r.ok === '1'), 'one cylinder and two planes, each largest error within 0.1 mm — ' + kinds + ' — ' + line.slice(0, 220));
  const r = await pc(() => {
    const d = window.partcraft.part.studies.nurbs, S = window.partcraft.surfaces || null;
    return { n: d.items.length };
  });
  ok(r.n === 3, 'three faces in the part file\'s patch set');
  const rr = Number((line.match(/largest ([\d.]+) mm/) || [])[1]);
  ok(rr < 0.1, 'measured largest deviation ' + rr + ' mm from the scan to the faces');
  await shot('scanfit-fit');

  console.log('== Stitch to a solid');
  await page.click('[data-nurbs-start="scan.solid"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid]', { timeout: 30000 });
  const l2 = await status();
  const vol = Number((l2.match(/Volume ([\d.]+) mm/) || [])[1]), want = Math.PI * 225 * 60;
  ok(Math.abs(vol - want) / want < 0.01, 'the stitched solid closes: volume ' + vol + ' vs ' + want.toFixed(1) + ' (closed form, within the chord error) — ' + l2.slice(0, 140));
  await page.click('[data-nurbs-undo]');
  ok((await pc(() => (window.partcraft.part.studies.nurbs.solids || []).length)) === 0, 'the panel Undo takes the solid back');

  console.log('== round 2: an STL box with 3 mm fillets on all edges as the part\'s body');
  await pc((t) => window.partcraft.openText(t, 'Scan2.partcraft.json'), P.toJSON(P.newPart('Scan2')));
  await built();
  const A = 94, B = 54, C = 34, R = 3;
  await page.setInputFiles('[data-file]', { name: 'rounded-box.stl', mimeType: 'model/stl', buffer: binaryStl(roundedBox(A, B, C, R, 6, 0.01)) });
  await page.waitForSelector('[data-mesh-import]');
  await page.click('.pc-dialog button[data-key="new"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 1);
  await built();
  await page.selectOption('[data-workspace]', 'surfaces');
  await page.waitForSelector('[data-nurbs-panel]');
  await page.click('[data-nurbs-start="scan.fit"]');
  await opt('tol', '0.1');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => document.querySelectorAll('[data-nurbs-scan-row]').length >= 20, null, { timeout: 120000 });
  const rows2 = await page.$$eval('[data-nurbs-scan-row]', (r) => r.map((x) => ({ ok: x.dataset.ok, t: x.textContent })));
  const cnt = (re) => rows2.filter((r) => re.test(r.t)).length;
  ok(cnt(/Plane/) === 6 && cnt(/Cylinder/) === 12 && cnt(/Sphere/) === 8, 'six planes, twelve cylinders, eight spheres - ' + rows2.length + ' faces');
  const frad = rows2.map((r) => Number((r.t.match(/fillet, radius ([\d.]+) mm/) || [])[1])).filter((x) => x > 0);
  ok(frad.length === 20 && frad.every((x) => Math.abs(x - 3) < 0.05), 'twenty fillets, each radius within 0.05 mm of 3 - ' + frad.length + ', worst ' + Math.max(...frad.map((x) => Math.abs(x - 3))).toFixed(3));
  ok(rows2.every((r) => r.ok === '1'), 'every face: largest error within 0.1 mm');
  const dev = await pc(() => { const d = window.partcraft.surfaces?.display; return d && d.cloud ? d.cloud.userData.nurbsCloud : -1; });
  ok(dev === -1 ? (await page.isChecked('[data-nurbs-devmap]')) : dev > 1000, 'the deviation map is on' + (dev > 0 ? ': ' + dev + ' coloured points' : ''));
  await shot('scanfit-fillets');
  await page.click('[data-nurbs-start="scan.solid"]');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid], [data-nurbs-error]', { timeout: 60000 });
  const l3 = (await page.$('[data-nurbs-error]')) ? 'ERROR ' + await page.textContent('[data-nurbs-error]') : await status();
  const vol3 = Number((l3.match(/Volume ([\d.]+) mm/) || [])[1]), want3 = roundedVolume(A, B, C, R);
  ok(Math.abs(vol3 - want3) / want3 < 0.005, 'the filleted box stitches to a closed solid: volume ' + vol3 + ' vs ' + want3.toFixed(0) + ' mm3 - ' + l3.slice(0, 100));
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-scanfit');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
