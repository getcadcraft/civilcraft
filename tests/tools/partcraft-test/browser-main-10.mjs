#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of partcraft.js's init() closure into their own
 * modules. One page, real downloads and a mesh imported back through the file chooser, and a failure on any console or page error, which is how
 * a missed closure variable shows. The same file runs on the ORIGINAL main and on the split one. Uses the PartCraft harness (the test admin's
 * session comes from this server's admin.php, so it runs here, not on the workstation).
 *
 * Topics (grows as each group of the main moves): exports (STL, 3MF, USD, IFC, STEP, print check), a mesh import round trip, the drawing mode.
 *   nice -n 10 timeout 600 node tools/partcraft-test/browser-main-10.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { state, out } = cliArgs();
const TMP = path.join(out, 'main-10');
fs.mkdirSync(TMP, { recursive: true });

export async function run(h) {
  const { page, ok, pc, built } = h;
  const menu = async (cmd) => { await page.click('[data-export-menu] > summary'); await page.click(`[data-export-menu] [data-cmd="${cmd}"]`); };
  const download = async (fn) => { const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); const f = path.join(TMP, d.suggestedFilename()); await d.saveAs(f); return { name: d.suggestedFilename(), file: f, bytes: fs.readFileSync(f) }; };

  console.log('\n== exports and imports after the main was split');
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }

  const stl = await download(() => menu('export-stl'));
  ok(/\.stl$/i.test(stl.name) && stl.bytes.length > 1000, 'Export › STL downloads a mesh', `${stl.name} ${stl.bytes.length}`);
  const mf = await download(() => menu('export-3mf'));
  ok(/\.3mf$/i.test(mf.name) && mf.bytes.slice(0, 2).toString() === 'PK', 'Export › 3MF downloads a zip', `${mf.name} ${mf.bytes.length}`);
  const usd = await download(() => menu('export-usd'));
  ok(/\.(usdz|usda|usd)$/i.test(usd.name) && usd.bytes.length > 100, 'Export › USD downloads', `${usd.name} ${usd.bytes.length}`);
  const ifc = await download(() => menu('export-ifc'));
  ok(/\.ifc$/i.test(ifc.name) && /^ISO-10303-21;/.test(ifc.bytes.toString('utf8', 0, 20)), 'Export › IFC downloads a STEP-file', ifc.name);
  const step = await download(() => menu('export-step'));
  ok(/\.(step|stp)$/i.test(step.name) && /^ISO-10303-21;/.test(step.bytes.toString('utf8', 0, 20)), 'Export › STEP downloads', `${step.name} ${step.bytes.length}`);
  await menu('export-print');
  await page.waitForTimeout(800);
  ok((await h.statusText()).trim().length > 0 || (await page.locator('dialog[open]').count()) > 0, 'Export › Print check answers (status or dialog)');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // the mesh read back through the file chooser (importMesh)
  const before = await pc(() => window.partcraft.part.features.length);
  await page.setInputFiles('[data-file]', stl.file);
  await page.waitForTimeout(1500);
  const dlg = await page.locator('dialog[open]').count();
  ok(dlg > 0 || (await pc(() => window.partcraft.part.features.length)) !== before, 'an STL opened through the chooser shows its import dialog or changes the part', `dialogs ${dlg}`);
  if (dlg) { await page.keyboard.press('Escape'); await page.waitForTimeout(300); }

  // the Properties panel (props-ui.js): the part, a feature, a sketch
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  await page.keyboard.press('Escape');
  { const r = await page.locator('.pc-stage canvas').first().boundingBox(); await page.mouse.click(r.x + 12, r.y + r.height - 12); await page.waitForTimeout(150); }
  ok(await page.locator('[data-props] [data-part-material]').count() === 1, 'Properties: the part panel has its Material field');
  const feats = await pc(() => window.partcraft.part.features.map((f) => ({ id: f.id, type: f.type })));
  const solid = feats.find((f) => f.type === 'extrude') || feats[feats.length - 1];
  await pc((id) => window.partcraft.selectFeature(id), solid.id);
  await page.waitForTimeout(200);
  ok(await page.locator('[data-props] input, [data-props] select').count() > 0, `Properties: a ${solid.type} feature shows its fields`);
  const sk = feats.find((f) => f.type === 'sketch');
  await pc((id) => window.partcraft.editSketch(id), sk.id);
  await page.waitForFunction(() => window.partcraft.mode === 'sketch', null, { timeout: 10000 });
  await page.waitForTimeout(200);
  ok(await page.locator('[data-props]').innerText().then((x) => x.trim().length > 20), 'Properties: a sketch in edit shows its panel');
  await pc(() => window.partcraft.exitSketch());
  await page.waitForFunction(() => window.partcraft.mode !== 'sketch', null, { timeout: 10000 });

  // drawing mode (enter, sheet, leave)
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  await page.keyboard.press('Escape');
  await h.tool('drawing');
  await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 30000 });
  ok(await pc(() => !!document.querySelector('[data-sheet] svg')), 'Drawing: the sheet is on screen');
  const pdf = await download(() => page.click('[data-props] button:has-text("Export PDF")'));
  ok(/\.pdf$/i.test(pdf.name) && pdf.bytes.toString('latin1', 0, 5) === '%PDF-', 'Drawing: Export PDF downloads', pdf.name);
  await page.click('[data-props] button:has-text("Back to the model")');
  await page.waitForFunction(() => window.partcraft.mode !== 'drawing');
  ok(true, 'Back to the model leaves the drawing');

  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const h = await startHarness({ state, out });
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
