#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sw.mjs — PartCraft's SolidWorks exchange in headless Chromium at /lab/partcraft, by real clicks:
 * open the flange (File › Open), Export › "Macro for SolidWorks (.swb)" downloads the macro, the dialog's
 * "Download the STEP too" downloads the STEP; Export › "STEP for SolidWorks (named, AP214)"; then Open a
 * cadcraft-sw-export fixture (tools/partcraft-sw/fixtures/flange.cadcraft-sw.json) and the report dialog shows.
 * SolidWorks is not run: the downloads are checked as text (and the STEP by native OpenCascade when the venv exists).
 *
 *   node tools/partcraft-test/browser-sw.mjs [--state <file>] [--out <dir>]   (run as root; default out tmp/shots/partcraft-sw)
 * Uses browser-harness.mjs (the test admin partcrafttest+cadcraft@projectz.xyz via admin.php, a saved session); fails on
 * any console error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './rel-browser-harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = cliArgs();
const OUT = process.argv.includes('--out') ? args.out : path.join(REPO, 'tmp/shots/partcraft-sw');
const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
const h = await startHarness({ state: args.state, out: OUT });
const { page, ok, pc, F } = h;
const PI = Math.PI;

async function exportItem(cmd) {
  await page.click('[data-export-menu] > summary');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click(`[data-export-menu] [data-cmd="${cmd}"]`)]);
  const file = path.join(OUT, dl.suggestedFilename());
  await dl.saveAs(file);
  return file;
}

try {
  // File › Open: the Catalog flange as a .partcraft.json
  const fl = F.flange();
  const { toJSON } = await import(path.join(REPO, 'public_html/assets/apps/partcraft/dev/part.js'));
  await page.setInputFiles('[data-file]', { name: 'Flange.partcraft.json', mimeType: 'application/json', buffer: Buffer.from(toJSON(fl.part)) });
  await page.waitForFunction(() => window.partcraft.part.name === 'Flange');
  await h.built();
  const v0 = await pc(() => window.partcraft.regen.stats.volume);
  ok(h.nearRel(v0, 302160 * PI, 1e-9), `the flange is open, exact: ${v0.toFixed(3)} = 302160π`);

  // Export › Macro for SolidWorks (.swb)
  const swb = await exportItem('export-sw-macro');
  const bytes = fs.readFileSync(swb);
  const text = bytes.toString('latin1');
  ok(path.basename(swb) === 'Flange.swb' && /\r\n/.test(text) && !/[^\r]\n/.test(text), 'Export › Macro for SolidWorks (.swb) downloads Flange.swb with CRLF line ends');
  ok(/^ {4}Call Step_5\r$/m.test(text) && /FeatureCircularPattern2\(8, 6\.28318530717959,/.test(text) && (text.match(/r = Expect\(0/g) || []).length === 3, 'it builds the 5 features (the circular pattern 8 × 2π rad) with a body check after each solid one — made in the exact kernel\'s worker');
  ok(/Not yet tested in SolidWorks/.test(text) && [...bytes].every((b) => b !== 0), 'the macro says it is not yet tested in SolidWorks');
  await page.waitForSelector('dialog.pc-dialog[open]');
  const dlgText = await page.textContent('dialog.pc-dialog[open]');
  ok(/builds 5 of 5 features/.test(dlgText) && /not been tested in SolidWorks/.test(dlgText), 'the dialog says what it builds and that it is not tested in SolidWorks');
  await h.shot('01-macro-dialog');
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('dialog.pc-dialog[open] button[data-key="step"]')]);
  const step1 = path.join(OUT, 'macro-' + dl2.suggestedFilename());
  await dl2.saveAs(step1);
  const st1 = fs.readFileSync(step1, 'utf8');
  ok(/^ISO-10303-21;/.test(st1) && /PRODUCT\('Flange'/.test(st1) && /COLOUR_RGB/.test(st1), '"Download the STEP too" downloads Flange.step: named, coloured');
  ok(/Exported Flange\.swb/.test(await h.statusText()), 'the status bar says what was exported');

  // Export › STEP for SolidWorks (named, AP214)
  const step = await exportItem('export-sw-step');
  const st = fs.readFileSync(step, 'utf8');
  ok(/FILE_SCHEMA\(\('AUTOMOTIVE_DESIGN/.test(st) && /PRODUCT\('Flange'/.test(st) && /SI_UNIT\(\.MILLI\.,\.METRE\.\)/.test(st), 'Export › STEP for SolidWorks: AP214, product "Flange", millimetres');
  if (fs.existsSync(PY)) {
    const out = execFileSync(PY, ['-I', '-c', `
import sys
from OCP.STEPControl import STEPControl_Reader
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
b = Bnd_Box(); BRepBndLib.AddOptimal_s(s, b, False, False)
print(g.Mass(), b.Get()[4])
`, step], { encoding: 'utf8' }).trim().split(/\s+/).map(Number);
    ok(h.nearRel(out[0], 302160 * PI, 1e-9) && Math.abs(out[1] - 80) < 1e-6, `native OpenCascade reads it: volume 302160π, Y up (top at y ${out[1]})`);
  }
  await h.shot('02-exported');

  // File › Open: a SolidWorks export (the flange fixture)
  const fx = fs.readFileSync(path.join(REPO, 'tools/partcraft-sw/fixtures/flange.cadcraft-sw.json'));
  await page.setInputFiles('[data-file]', { name: 'Flange.cadcraft-sw.json', mimeType: 'application/json', buffer: fx });
  await page.waitForSelector('dialog.pc-dialog[open]', { timeout: 120000 });
  const rep = await page.textContent('dialog.pc-dialog[open]');
  ok(/5 of 5 features carried over from SolidWorks \(Flange\.SLDPRT\)/.test(rep) && /\(the same\)/.test(rep) && /2 parameters and 2 equations/.test(rep), 'opening flange.cadcraft-sw.json shows the report: 5 of 5 features, the same volume, 2 parameters and 2 equations');
  await h.shot('03-import-report');
  await page.click('dialog.pc-dialog[open] button[data-key="cancel"]');
  await h.built();
  const info = await pc(() => ({ v: window.partcraft.regen.stats.volume, names: window.partcraft.part.features.map((f) => f.name), vars: window.partcraft.part.params?.vars.length }));
  ok(h.nearRel(info.v, 302160 * PI, 1e-9) && info.names.join(',') === 'Sketch1,Revolve1,Sketch2,Cut-Extrude1,CirPattern1' && info.vars === 2, `the part is open with SolidWorks' feature names and its 2 parameters: ${info.v.toFixed(3)} = 302160π`);
  await h.shot('04-imported-part');
  // a sweep the macro could not carry is listed
  await page.setInputFiles('[data-file]', { name: 'Ring.cadcraft-sw.json', mimeType: 'application/json', buffer: fs.readFileSync(path.join(REPO, 'tools/partcraft-sw/fixtures/ring-chamfer.cadcraft-sw.json')) });
  await page.waitForSelector('dialog.pc-dialog[open]', { timeout: 120000 });
  ok(/Not carried over: Sweep1 \(Sweep\)\./.test(await page.textContent('dialog.pc-dialog[open]')), 'the ring fixture: "Not carried over: Sweep1 (Sweep)." in the report');
  await h.shot('05-import-not-carried');
  await page.click('dialog.pc-dialog[open] button[data-key="cancel"]');
  // a tampered file is refused with a plain message
  await page.setInputFiles('[data-file]', { name: 'Bad.cadcraft-sw.json', mimeType: 'application/json', buffer: Buffer.from(String(fx).replace('"units": "mm"', '"units": "in"')) });
  await page.waitForSelector('dialog.pc-dialog[open]');
  ok(/units are not millimetres/.test(await page.textContent('dialog.pc-dialog[open]')), 'a tampered export (inches) is refused with a plain message');
  await page.click('dialog.pc-dialog[open] button[data-key="cancel"]');
  ok(!h.problems.length, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();
