#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mesh-import.mjs — 0.7 D7.49 on the page (the mesh kernel): Open › an STL shows what was read and repaired, the units
 * change the "Size here" line, Open as a body makes Imported1 with the body's volume and its flat faces; Properties changes the
 * units (one undo step); a sketch on one of its flat faces cuts a pocket; an STL that does not close says so and adds nothing;
 * an STL added to a part with features cuts it. No console errors. Shots: mesh-dialog.png, mesh-body.png.
 *   node tools/partcraft-test/browser-mesh-import.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const { state, out } = cliArgs();
const TMP = path.join(out, 'mesh');
fs.mkdirSync(TMP, { recursive: true });

// the files: a 40 × 30 × 20 block (Z up) with a Ø10 hole and a 10 × 10 × 5 boss; the same with its bottom (a ring face) gone
const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js'));
const M = await Module(); M.setup();
const X = await import(DEV + 'export.js');
const body = M.Manifold.cube([40, 30, 20]).subtract(M.Manifold.cylinder(30, 5, 5, 48).translate([12, 15, -5])).add(M.Manifold.cube([10, 10, 5]).translate([25, 10, 20]));
const VOL = body.volume();
const g = body.getMesh();
const yUp = new Float32Array(g.vertProperties.length);   // stlBinary writes PartCraft's Y up as Z up
for (let i = 0; i < yUp.length; i += 3) { yUp[i] = g.vertProperties[i]; yUp[i + 1] = g.vertProperties[i + 2]; yUp[i + 2] = -g.vertProperties[i + 1]; }
const tris = Uint32Array.from(g.triVerts);
fs.writeFileSync(path.join(TMP, 'bracket.stl'), Buffer.from(X.stlBinary({ positions: yUp, indices: tris }, 'bracket')));
const keep = [];
for (let t = 0; t < tris.length / 3; t++) if (![0, 1, 2].every((k) => Math.abs(g.vertProperties[tris[t * 3 + k] * 3 + 2]) < 1e-9)) keep.push(tris[t * 3], tris[t * 3 + 1], tris[t * 3 + 2]);
fs.writeFileSync(path.join(TMP, 'open.stl'), Buffer.from(X.stlBinary({ positions: yUp, indices: Uint32Array.from(keep) }, 'open')));

const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built } = h;
const rel = (a, b, r) => Math.abs(a - b) <= r * Math.max(1e-12, Math.abs(b));
const openMesh = async (name) => { await page.setInputFiles('[data-file]', path.join(TMP, name)); await page.waitForSelector('[data-mesh-import]'); };

try {
  console.log('\n== meshes as bodies (0.7 D7.49)');
  await openMesh('bracket.stl');
  const facts = await page.textContent('[data-mesh-import] p');
  ok(/triangles/.test(facts) && /STL/.test(facts) && (await page.getAttribute('[data-mesh-closed]', 'data-mesh-closed')) === '1', 'the dialog: ' + facts.trim() + ' It closes.');
  ok(/doubled corners joined/.test(await page.textContent('[data-mesh-report]')), 'the report lists the repairs (the joined corners)');
  const size0 = await page.textContent('[data-mesh-size]');
  await page.selectOption('[data-mesh-pick="units"]', 'cm');
  const size1 = await page.textContent('[data-mesh-size]');
  ok(/40 × 25 × 30/.test(size0) && /400 × 250 × 300/.test(size1), `Size here follows the units: "${size0.trim()}" → "${size1.trim()}"`);
  await page.selectOption('[data-mesh-pick="units"]', 'mm');
  await page.screenshot({ path: path.join(out, 'mesh-dialog.png') });
  await page.click('.pc-dialog button[data-key="new"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 1);   // the dialog's handler commits after the click returns
  await built();
  const s1 = await pc(() => { const p = window.partcraft; const f = p.part.features[0]; return { n: p.part.features.length, type: f.type, mesh: !!f.mesh, step: 'step' in f, status: p.regen.results.get(f.id).status, vol: p.regen.stats.volume, flats: new Set(p.regen.faces.filter((x) => /\.flat:/.test(x.name)).map((x) => x.name)).size, name: p.part.name }; });
  ok(s1.n === 1 && s1.type === 'import' && s1.mesh && !s1.step && s1.status === 'ok' && rel(s1.vol, VOL, 1e-6) && s1.name === 'bracket', `Open as a body: a new part "bracket" with Imported1, ${s1.vol.toFixed(3)} mm³ (${VOL.toFixed(3)})`);
  ok(s1.flats >= 9 && /is a solid body/.test(await h.statusText()), `${s1.flats} flat faces; the status bar: ${(await h.statusText()).trim()}`);
  await page.screenshot({ path: path.join(out, 'mesh-body.png') });
  // Properties: the units
  const unitsSel = page.locator('.pc-props select').first();
  await unitsSel.selectOption('cm');
  await built();
  const v2 = await pc(() => window.partcraft.regen.stats.volume);
  ok(rel(v2, VOL * 1000, 1e-6), 'Properties › Units in the file: centimetres → 1000 × the volume');
  await pc(() => window.partcraft.undoRedo(true));
  await built();
  ok(rel(await pc(() => window.partcraft.regen.stats.volume), VOL, 1e-6), 'undo: back to millimetres (one step)');
  // a sketch on the boss's top (flat face) and a 4 × 4 × 3 pocket
  const v3 = await pc(async () => {
    const p = window.partcraft, f = p.part.features[0];
    const top = p.regen.candidates.get(f.id).find((c) => c.frame.n[1] > 0.999 && Math.abs(c.frame.o[1] - 25) < 1e-4);
    const sk = p.S.newSketch(); p.S.addRect(sk, [28, 13], [32, 17]);
    p.commit('pocket', () => { const s = p.P.addFeature(p.part, 'sketch', { plane: { kind: 'face', feature: f.id, face: 'flat', entity: top.ref.entity }, sketch: sk }); p.P.addFeature(p.part, 'extrude', { sketch: s.id, op: 'cut', depth: 3 }); });
    await p.built();
    return p.regen.stats.volume;
  });
  ok(rel(VOL - v3, 48, 1e-6), `a sketch on its flat face cuts a 4 × 4 × 3 pocket (${(VOL - v3).toFixed(4)} mm³)`);
  // an STL that does not close
  const before = await pc(() => window.partcraft.part.features.length);
  await openMesh('open.stl');
  const verdict = await page.getAttribute('[data-mesh-closed]', 'data-mesh-closed');
  const rep = await page.textContent('[data-mesh-report]');
  const keys = await page.$$eval('.pc-dialog button[data-key]', (bs) => bs.map((b) => b.dataset.key));
  ok(verdict === '0' && /could not be closed/.test(rep) && keys.join() === 'cancel', 'an open STL: "does not close", the openings reported, only Close');
  await page.click('.pc-dialog button[data-key="cancel"]');
  ok((await pc(() => window.partcraft.part.features.length)) === before, 'nothing added');
  // the same STL added to the part with Use it to = Keep only the overlap: the pocketed body overlaps all of it
  await openMesh('bracket.stl');
  await page.selectOption('[data-mesh-pick="op"]', 'intersect');
  await page.click('.pc-dialog button[data-key="add"]');
  await page.waitForFunction((n) => window.partcraft.part.features.length === n, before + 1);
  await built();
  const v4 = await pc(() => ({ n: window.partcraft.part.features.length, vol: window.partcraft.regen.stats.volume, op: window.partcraft.part.features.at(-1).op }));
  ok(v4.n === before + 1 && v4.op === 'intersect' && rel(v4.vol, v3, 1e-6), 'added again with Use it to = Keep only the overlap: the part is unchanged (it overlaps itself)' + ` (${JSON.stringify(v4)}, want n ${before + 1}, vol ${v3})`);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
