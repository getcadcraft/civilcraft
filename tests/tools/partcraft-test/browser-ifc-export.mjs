#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ifc-export.mjs — 0.5 WL.32 on the page (the mesh kernel): Export › IFC 4 (with every property) downloads the part
 * (one element, its parameters and title block, the status bar counts the sets), and in an assembly made from it (New
 * assembly, a second copy) the whole assembly (an IfcElementAssembly, one type, two placed copies); with IfcOpenShell
 * (tools/detailcraft-test/venv) both files pass schema validation. No console errors.
 *   node tools/partcraft-test/browser-ifc-export.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PY = path.join(HERE, '../detailcraft-test/venv/bin/python');
const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, F } = h;
const TMP = path.join(out, 'ifc');
fs.mkdirSync(TMP, { recursive: true });
const menu = async (cmd) => { await page.click('[data-export-menu] > summary'); await page.click(`[data-export-menu] [data-cmd="${cmd}"]`); };
const waitDownload = async (fn) => { const [d] = await Promise.all([page.waitForEvent('download'), fn()]); const f = path.join(TMP, d.suggestedFilename()); await d.saveAs(f); return f; };
const validate = (file) => {
  if (!fs.existsSync(PY)) return null;
  const r = spawnSync(PY, ['-I', '-c', 'import sys, ifcopenshell, ifcopenshell.validate as V\nf = ifcopenshell.open(sys.argv[1]); l = V.json_logger(); V.validate(f, l); print(len(l.statements))', file], { encoding: 'utf8' });
  return r.status === 0 ? Number(r.stdout.trim()) : -1;
};

try {
  console.log('\n== IFC export (0.5 WL.32)');
  const fl = F.flange().part;
  fl.params = { vars: [{ name: 'bolts', expr: '8' }], links: [] };
  fl.drawing = { title: { title: 'Weld-neck flange', number: 'FL-100' }, notes: [] };
  fl.material = { name: 'Steel (carbon)', density: 7.85 };
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(fl));
  await built();
  const f1 = await waitDownload(() => menu('export-ifc'));
  const t1 = fs.readFileSync(f1, 'utf8');
  ok(path.basename(f1) === 'Flange.ifc' && /^ISO-10303-21;/.test(t1) && (t1.match(/IFCBUILDINGELEMENTPROXY\(/g) || []).length === 1 && /'PartCraft_Parameters'/.test(t1) && /'bolts'/.test(t1) && /'DrawingNumber',\$,IFCLABEL\('FL-100'\)/.test(t1), 'Export › IFC 4: Flange.ifc with one element, its parameters and title block');
  ok(/property and quantity sets/.test(await h.statusText()), 'the status bar: ' + (await h.statusText()).trim());
  const v1 = validate(f1);
  if (v1 !== null) ok(v1 === 0, `IfcOpenShell: the part file validates (${v1} problems)`);
  await h.tool('asm-new');
  await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy');
  await pc(() => window.partcraft.asmBuilt());
  const f2 = await waitDownload(() => menu('export-ifc'));
  const t2 = fs.readFileSync(f2, 'utf8');
  ok(/^ISO-10303-21;/.test(t2) && (t2.match(/IFCELEMENTASSEMBLY\(/g) || []).length === 1 && (t2.match(/IFCBUILDINGELEMENTPROXYTYPE\(/g) || []).length === 1 && (t2.match(/IFCBUILDINGELEMENTPROXY\(/g) || []).length === 2 && (t2.match(/'PartCraft_Instance'/g) || []).length === 2,
    `in an assembly: ${path.basename(f2)}: one assembly, one type, two placed copies, each with its instance values`);
  const v2 = validate(f2);
  if (v2 !== null) ok(v2 === 0, `IfcOpenShell: the assembly file validates (${v2} problems)`);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
