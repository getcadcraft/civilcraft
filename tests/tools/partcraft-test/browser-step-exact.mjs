#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-step-exact.mjs — 0.9.1 FIX-091-EXACT-STEP in headless Chromium, on the shipped default (the mesh kernel alone):
 * the flange opened, Export › STEP AP242 (exact solid) and STEP AP214 (exact solid) enabled and clicked, the downloads read
 * back by native OpenCascade (valid solid, 14 faces, the closed-form volume, Z up); then Manufacture › New setup ›
 * Exact STEP (work coordinates), read back the same way with the setup's origin at 0; no console errors.
 *   PC_EXACT=0 node tools/partcraft-test/browser-step-exact.mjs [--state …] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PY = path.join(HERE, 'venv/bin/python');
const OCP = `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopAbs import TopAbs_SOLID, TopAbs_FACE
from OCP.TopTools import TopTools_IndexedMapOfShape
from OCP.TopExp import TopExp
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
r = STEPControl_Reader(); ok = r.ReadFile(sys.argv[1]) == 1; r.TransferRoots(); sh = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(sh, g, 1e-11, False, False)
fm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_FACE, fm)
sm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_SOLID, sm)
b = Bnd_Box(); BRepBndLib.AddOptimal_s(sh, b, False, False)
print(json.dumps({'read': ok, 'valid': bool(BRepCheck_Analyzer(sh).IsValid()), 'solids': sm.Extent(), 'faces': fm.Extent(), 'volume': g.Mass(), 'bbox': list(b.Get())}))
`;
const haveOcp = () => fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
const ocp = (file) => JSON.parse(spawnSync(PY, ['-c', OCP, file], { encoding: 'utf8' }).stdout.trim().split('\n').pop());

export async function run(h) {
  const { page, ok, pc, built, F } = h;
  const V = Math.PI * 302160;
  const menuItem = async (cmd) => {
    await page.evaluate((c) => { const b = document.querySelector(`[data-cmd="${c}"]`); b.closest('[role=menu]')?.removeAttribute('hidden'); }, cmd);
    return page.evaluate((c) => { const b = document.querySelector(`[data-cmd="${c}"]`); return { disabled: b.disabled, title: b.title, text: b.textContent.trim() }; }, cmd);
  };
  const exportBy = async (cmd) => {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.evaluate((c) => document.querySelector(`[data-cmd="${c}"]`).click(), cmd)]);
    const file = path.join(h.OUT, cmd + '-' + dl.suggestedFilename());
    await dl.saveAs(file);
    return { file, name: dl.suggestedFilename(), text: fs.readFileSync(file, 'utf8') };
  };

  console.log('\n== exact STEP on the mesh kernel: Export menu');
  const exactOn = await pc(() => window.partcraft.useExact);
  ok(exactOn === false, 'the page runs the mesh kernel alone (what ships)' + (exactOn ? ' — run with PC_EXACT=0' : ''));
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  for (const [cmd, schema, re] of [['export-step', 'AP242', /AP242_MANAGED_MODEL_BASED_3D_ENGINEERING/], ['export-step214', 'AP214', /AUTOMOTIVE_DESIGN/]]) {
    const it = await menuItem(cmd);
    ok(!it.disabled && !/not built/i.test(it.title), `${it.text}: enabled, no "not built yet" on it`);
    const d = await exportBy(cmd);
    const c = (r) => (d.text.match(r) || []).length;
    ok(d.name === 'Flange.step' && re.test(d.text) && c(/ADVANCED_FACE\(/g) === 14 && c(/CYLINDRICAL_SURFACE\(/g) === 10 && c(/CONICAL_SURFACE\(/g) === 1 && c(/CIRCLE\(/g) === 22 && !/FACETED_BREP|POLY_LOOP/.test(d.text),
      `${schema}: ${d.name} downloaded, a true B-rep (14 advanced faces, 10 cylinders, 1 cone, 22 circles, no facets)`);
    const st = await h.statusText();
    ok(/exact solid/.test(st) && /14 faces/.test(st) && st.includes(schema), `status: ${st}`);
    if (haveOcp()) { const o = ocp(d.file); ok(o.read && o.valid && o.solids === 1 && o.faces === 14 && Math.abs(o.volume - V) <= 1e-9 * V && Math.abs(o.bbox[5] - 80) < 1e-3, `${schema}: OpenCascade reads a valid solid, 14 faces, volume ${o.volume.toFixed(4)} = 302160π, 80 mm along Z`); }
    else console.log('  skip cadquery-ocp missing: the download is not read back');
  }
  const fac = await menuItem('export-step-faceted');
  ok(!fac.disabled, 'STEP (faceted) is still there');

  console.log('\n== exact STEP in work coordinates: Manufacture');
  await page.selectOption('[data-workspace]', 'manufacture');
  await page.waitForFunction(() => window.partcraft.workspace === 'manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  await page.click('[data-mtab="ops"]');
  await page.waitForSelector('[data-mstep]');
  ok(!(await page.isDisabled('[data-mstep]')), 'Exact STEP (work coordinates) is on the Operations tab, enabled');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-mstep]')]);
  const wfile = path.join(h.OUT, dl.suggestedFilename());
  await dl.saveAs(wfile);
  const wst = await h.statusText();
  ok(dl.suggestedFilename() === 'Flange-work.step' && /origin at/.test(wst), `downloaded ${dl.suggestedFilename()}; status: ${wst}`);
  if (haveOcp()) { const o = ocp(wfile); ok(o.read && o.valid && o.faces === 14 && Math.abs(o.volume - V) <= 1e-9 * V && Math.abs(o.bbox[5] - (-1)) < 1e-3 && Math.abs(o.bbox[0] - 2) < 1e-3, `work coordinates: valid, same volume; the part's top 1 mm under the stock top (Z ${o.bbox[5].toFixed(3)}), its side 2 mm in from the stock corner (X ${o.bbox[0].toFixed(3)}): the setup's stock offsets`); }
  await page.selectOption('[data-workspace]', 'design');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness({ ...cliArgs(), exact: false });
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
