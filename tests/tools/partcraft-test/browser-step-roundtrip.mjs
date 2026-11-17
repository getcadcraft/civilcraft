#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-step-roundtrip.mjs — 0.9.1 FX.223 on the page, the way a metal supplier works (Discord, 2026-11-11): Open › a STEP file
 * of a W-beam with cut ends and bolt holes, Open as a body, then Export › STEP AP242 (exact solid) by clicks on the shipped
 * mesh kernel. The download is read back by native OpenCascade: a valid solid with the file's own 14 planes and 6 cylinders
 * and its volume (before: 185 flat facets). Then a click on a flat face and Export › DXF gives that face's outline with the
 * bolt holes as true CIRCLE entities. No console errors. (Saving and opening again: test-step-roundtrip.mjs.)
 *   PC_EXACT=0 node tools/partcraft-test/browser-step-roundtrip.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BEAM = path.join(REPO, 'fixtures/step-roundtrip/w-beam-cut-ends.step');
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
from OCP.TopoDS import TopoDS
from OCP.BRepAdaptor import BRepAdaptor_Surface
r = STEPControl_Reader(); ok = r.ReadFile(sys.argv[1]) == 1; r.TransferRoots(); sh = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(sh, g, 1e-10, False, False)
fm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_FACE, fm)
sm = TopTools_IndexedMapOfShape(); TopExp.MapShapes_s(sh, TopAbs_SOLID, sm)
kinds = {}
for i in range(1, fm.Extent() + 1):
    t = str(BRepAdaptor_Surface(TopoDS.Face_s(fm.FindKey(i))).GetType()).split('_')[-1]
    kinds[t] = kinds.get(t, 0) + 1
print('JSON' + json.dumps({'read': ok, 'valid': bool(BRepCheck_Analyzer(sh).IsValid()), 'solids': sm.Extent(), 'faces': fm.Extent(), 'volume': g.Mass(), 'kinds': kinds}))
`;
const haveOcp = () => fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
const ocp = (file) => JSON.parse(spawnSync(PY, ['-c', OCP, file], { encoding: 'utf8' }).stdout.split('\n').find((l) => l.startsWith('JSON')).slice(4));

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built } = h;
const dl = async (act, name) => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), act()]);
  const file = path.join(out, name + '-' + d.suggestedFilename());
  await d.saveAs(file);
  return { file, name: d.suggestedFilename(), text: fs.readFileSync(file, 'utf8') };
};
const menu = (cmd) => page.evaluate((c) => document.querySelector(`[data-cmd="${c}"]`).click(), cmd);

try {
  console.log('\n== a STEP beam opened and exported again (mesh kernel)');
  ok(await pc(() => !window.partcraft.useExact), 'the page runs the mesh kernel alone (what ships)');
  await page.setInputFiles('[data-file]', BEAM);
  await page.waitForSelector('[data-step-facts]');
  await page.click('.pc-dialog button[data-key="new"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 1);
  await built();
  const s1 = await pc(() => { const p = window.partcraft, f = p.part.features[0]; const by = {}; for (const x of p.regen.faces) by[x.type] = (by[x.type] || 0) + 1; return { status: p.regen.results.get(f.id).status, surfs: Array.isArray(f.mesh.s) ? f.mesh.s.length : 0, by, vol: p.regen.stats.volume }; });
  ok(s1.status === 'ok' && s1.surfs > 0 && s1.by.cylinder === 6, `Open as a body: built, the file's surfaces kept (${s1.surfs}); the body has ${s1.by.cylinder} cylinder faces and ${s1.by.plane} flat ones`);
  const it = await page.evaluate(() => { const b = document.querySelector('[data-cmd="export-step"]'); return { disabled: b.disabled, title: b.title, text: b.textContent.trim() }; });
  ok(!it.disabled && !/not built|exact kernel/i.test(it.title), `${it.text}: enabled, nothing about a missing kernel on it`);
  const d1 = await dl(() => menu('export-step'), 'beam');
  const st = (await h.statusText()).trim();
  ok(/\.step$/.test(d1.name) && d1.text.startsWith('ISO-10303-21;') && /ADVANCED_BREP_SHAPE_REPRESENTATION/.test(d1.text), `${d1.name} downloaded (${d1.text.length} bytes; the file opened was ${fs.statSync(BEAM).size}); status: ${st}`);
  ok((d1.text.match(/CYLINDRICAL_SURFACE\(/g) || []).length === 6 && !/mesh kernel|not built|failed/i.test(st), 'six CYLINDRICAL_SURFACE in the file; the status line names no failure and no kernel');
  if (haveOcp()) {
    const a = ocp(BEAM), b = ocp(d1.file);
    ok(b.read && b.valid && b.solids === 1, 'OpenCascade: the export is one valid solid');
    ok(b.faces === a.faces && b.kinds.Plane === a.kinds.Plane && b.kinds.Cylinder === a.kinds.Cylinder, `the faces of the file that was opened: ${b.kinds.Plane} planes and ${b.kinds.Cylinder} cylinders of ${b.faces} (it had ${a.kinds.Plane} and ${a.kinds.Cylinder} of ${a.faces})`);
    ok(Math.abs(b.volume - a.volume) / a.volume < 1e-7, `its volume to 1e-7 (${a.volume} → ${b.volume})`);
  } else console.log('  skip OpenCascade read-back (cadquery-ocp is not in tools/partcraft-test/venv)');

  console.log('\n== a flat face as DXF, for the laser or plasma table');
  const box = await page.locator('[data-stage] canvas').first().boundingBox();
  let picked = null;
  for (const [fx, fy] of [[0.5, 0.5], [0.45, 0.5], [0.55, 0.5], [0.5, 0.42], [0.5, 0.58], [0.4, 0.45], [0.6, 0.55]]) {
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await page.waitForTimeout(150);
    picked = await pc(() => { const k = window.partcraft.pick; return k && k.kind === 'face' ? { flat: !!k.flat, name: k.info ? k.info.name : null } : null; });
    if (picked && picked.flat) break;
  }
  ok(picked && picked.flat, 'a click on the beam picks a flat face' + (picked ? ` (${picked.name})` : ''));
  if (picked && picked.flat) {
    const d2 = await dl(() => menu('export-dxf'), 'face');
    const st2 = (await h.statusText()).trim();
    ok(/face\.dxf$/.test(d2.name) && /ENTITIES/.test(d2.text) && /(LINE|POLYLINE|LWPOLYLINE)/.test(d2.text), `${d2.name} downloaded with the face's outline; status: ${st2}`);
    const web = /surf/.test(picked.name || '') && (d2.text.match(/\r\nCIRCLE\r\n/g) || []).length;
    if (/POLYLINE/.test(d2.text) && web !== false) {
      const circles = [...d2.text.matchAll(/\r\nCIRCLE\r\n\s*8\r\nPROFILE\r\n\s*10\r\n([-\d.]+)\r\n\s*20\r\n([-\d.]+)\r\n\s*30\r\n[-\d.]+\r\n\s*40\r\n([-\d.]+)/g)].map((m) => +m[3]);
      const holes = await pc(() => window.partcraft.regen.faces.filter((f) => f.type === 'cylinder' && Math.abs(f.r - 11) < 1e-6).length);
      ok(circles.length === 2 && circles.every((r) => Math.abs(r - 11) < 1e-9) && holes === 2 && /true circles \(2\)/.test(st2), `the web's two bolt holes are CIRCLE entities of radius 11 exactly (${circles.join(', ')}), not polylines`);
    }
  }

  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
