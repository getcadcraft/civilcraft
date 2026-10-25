#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-step-import.mjs — 0.7 D7.26 on the page (the dev build has no exact kernel): Open › a STEP file is read as triangles
 * by cc-step and shown in the mesh import dialog (schema, solids, faces, "read as triangles"), Open as a body makes Imported1 with
 * OpenCascade's volume to 0.5 % and flat faces to sketch on; Properties says it was made from STEP; an assembly STEP added to the
 * part comes in with every placed part; a file that is not STEP says why. No console errors. Shots: step-dialog.png, step-body.png.
 *   node tools/partcraft-test/browser-step-import.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const FIX = path.join(REPO, 'fixtures/step');
const facts = JSON.parse(fs.readFileSync(path.join(FIX, 'facts.json'), 'utf8'));
const { state, out } = cliArgs();
const TMP = path.join(out, 'step');
fs.mkdirSync(TMP, { recursive: true });
fs.writeFileSync(path.join(TMP, 'not-step.step'), 'hello, this is not a STEP file\n');

const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built } = h;
const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
const openStep = async (file) => { await page.setInputFiles('[data-file]', file); await page.waitForSelector('.pc-dialog'); };

try {
  console.log('\n== STEP without the exact kernel (0.7 D7.26)');
  const off = await pc(() => !window.partcraft.useExact);
  ok(off, 'the dev build runs on the mesh kernel (no exact kernel)');
  await openStep(path.join(FIX, 'plate.step'));
  await page.waitForSelector('[data-step-facts]');
  const f1 = (await page.textContent('[data-step-facts]')).trim();
  const closed = await page.getAttribute('[data-mesh-closed]', 'data-mesh-closed');
  ok(/AP214 file: 1 solid, \d+ faces, read as triangles/.test(f1) && closed === '1', 'the dialog: ' + f1 + ' It closes.');
  ok(/from STEP/.test(await page.textContent('[data-mesh-import]')), 'the triangle line says it came from STEP');
  await page.screenshot({ path: path.join(out, 'step-dialog.png') });
  await page.click('.pc-dialog button[data-key="new"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 1);
  await built();
  const s1 = await pc(() => { const p = window.partcraft; const f = p.part.features[0]; return { type: f.type, mesh: !!f.mesh, step: 'step' in f, file: f.file, status: p.regen.results.get(f.id).status, vol: p.regen.stats.volume, flats: new Set(p.regen.faces.filter((x) => /\.flat:/.test(x.name)).map((x) => x.name)).size, name: p.part.name }; });
  const want = facts['plate.step'].volume;
  ok(s1.type === 'import' && s1.mesh && !s1.step && s1.status === 'ok' && rel(s1.vol, want, 5e-3) && s1.name === 'plate' && s1.file === 'plate.step',
    `Open as a body: a new part "plate", Imported1 from plate.step, ${s1.vol.toFixed(2)} mm³ (OpenCascade ${want})`);
  ok(s1.flats >= 6, `${s1.flats} flat faces to sketch on; status: ${(await h.statusText()).trim()}`);
  const props = (await page.textContent('[data-props]')).replace(/\s+/g, ' ');
  ok(/STEP mesh, \d+ triangles/.test(props), 'Properties: made from a STEP mesh' + (/STEP mesh/.test(props) ? '' : ' — ' + props.slice(0, 300)));
  await page.screenshot({ path: path.join(out, 'step-body.png') });
  // an assembly added to the part: a plate and a peg placed twice
  await openStep(path.join(FIX, 'assembly.step'));
  await page.waitForSelector('[data-step-facts]');
  const f2 = await page.textContent('[data-mesh-import]');
  ok(/2 solids/.test(f2) && /3 parts placed in the file come in where they stand/.test(f2), 'assembly.step: 2 solids, 3 placed parts come in where they stand');
  await page.click('.pc-dialog button[data-key="add"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 2);
  await built();
  const s2 = await pc(() => { const p = window.partcraft; return { status: p.regen.results.get(p.part.features[1].id).status, vol: p.regen.stats.volume }; });
  ok(s2.status === 'ok' && s2.vol > s1.vol, `added to the part: the body grows (${s2.vol.toFixed(1)} mm³)`);
  // not STEP
  await page.setInputFiles('[data-file]', path.join(TMP, 'not-step.step'));
  await page.waitForTimeout(400);
  ok(/is not a STEP file/.test(await h.statusText()) && (await pc(() => window.partcraft.part.features.length)) === 2, 'a .step that is not STEP: says so, nothing added');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
