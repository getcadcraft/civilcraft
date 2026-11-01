#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nl-mount.mjs — 0.8 round 3 mounts in PartCraft's real page (part_PART_3), headless Chromium on /lab/partcraft:
 *   SU.891 — a part of two pieces 0.01 mm apart; Simulation › New study › type "Contact between pieces" shows the nonlinear fields and the
 *            Contact pair item; the study (supports, a push, one pair) handed over as an assistant or a file would; Solve runs nlSolve in the
 *            compute worker: the pushed end moves gap + 2FL/EA, the table says all of the load and the contact force; a soft pair (factor 1,
 *            3000 MPa) gives a ⚠ Problem "sim.nl.penetration"; Plastic strain is a plot choice; Export › CalculiX deck (.inp) downloads a deck
 *            with C3D10 elements and a *CONTACT PAIR;
 *   SU.1035 4b — Export › Nested sheets to G-code… opens the dialog;
 *   the input registry knows export.sheets, export.ccx, export.frd. No console errors.
 *   node tools/partcraft-test/browser-nl-mount.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== SU.891 contact study in the page');
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js');
  const gap = 0.01, part = P.newPart('Two bars'), sk = S.newSketch();
  S.addRect(sk, [0, 0], [50, 10]); S.addRect(sk, [50 + gap, 0], [100 + gap, 10]);
  const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 10 });
  await pc((t) => window.partcraft.openText(t, 'Two bars.partcraft.json'), JSON.stringify(part));
  await built();
  await page.selectOption('[data-workspace]', 'simulation');
  await page.waitForFunction(() => window.partcraft.workspace === 'simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  const kinds = await page.$$eval('[data-sim-kind] option', (o) => o.map((x) => x.value));
  ok(kinds.includes('nonlinear') && kinds.includes('contact'), 'the study type list has Nonlinear and Contact between pieces: ' + kinds.join(', '));
  await page.selectOption('[data-sim-kind]', 'contact');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.kind === 'contact');
  ok(await page.isVisible('[data-nl-steps]') && await page.isVisible('[data-nl-et]'), 'the panel shows Load steps and Slope after yield');
  const adds = await page.$$eval('[data-sim-add-type] option', (o) => o.map((x) => x.value));
  ok(adds.includes('contact'), 'Add offers a Contact pair');
  await page.selectOption('[data-sim-add-type]', 'contact');
  await page.click('[data-sim-add]');
  await page.waitForSelector('[data-nl-pick-b]');
  ok((await pc(() => window.partcraft.part.studies.simulation.contacts.length)) === 1, 'a Contact pair item is added with side A picking and a "Pick side B faces" button');
  // the study as a file or an assistant hands it over: symmetry supports, a push on the far end, the pair across the gap
  const setStudy = (Fc, factor) => pc(({ gap, Fc, factor }) => {
    const pcw = window.partcraft, rg = pcw.regen, ref = (f) => ({ name: f.name, at: f.at.map((v) => +v.toFixed(6)) });
    const plane = (n, test) => rg.faces.filter((f) => f.type === 'plane' && f.n.every((v, k) => Math.abs(v - n[k]) < 1e-9) && test(f));
    const zmin = rg.stats.bbox.min[2];
    const st = JSON.parse(JSON.stringify(pcw.part.studies.simulation));
    st.material = { name: 'Test steel', E: 200000, nu: 0.3, density: 7850, yield: 1e5 }; st.h = 5;
    st.constraints = [
      { id: 'c1', type: 'frictionless', faces: plane([-1, 0, 0], (f) => Math.abs(f.o[0]) < 1e-6).map(ref) },
      { id: 'c2', type: 'frictionless', faces: plane([0, -1, 0], () => true).map(ref) },
      { id: 'c3', type: 'frictionless', faces: plane([0, 0, -1], (f) => Math.abs(f.o[2] - zmin) < 1e-6).map(ref) }];
    st.loads = [{ id: 'l1', type: 'force', faces: plane([1, 0, 0], (f) => f.o[0] > 99).map(ref), total: Fc, dir: [-1, 0, 0] }];
    st.contacts = [{ id: st.contacts[0].id, type: 'frictionless', faces: plane([-1, 0, 0], (f) => Math.abs(f.o[0] - 50 - gap) < 1e-6).map(ref), master: plane([1, 0, 0], (f) => Math.abs(f.o[0] - 50) < 1e-6).map(ref), factor }];
    st.seq = 10;
    pcw.host.setStudy('simulation', st, 'Set up the contact study');
    return st.constraints.every((c) => c.faces.length >= 1) && st.loads[0].faces.length === 1 && st.contacts[0].faces.length === 1 && st.contacts[0].master.length === 1;
  }, { gap, Fc, factor });
  ok(await setStudy(10000, 1000), 'the study: three symmetry supports, 10 kN on the far end, the pair across the 0.01 mm gap');
  await page.waitForTimeout(300);
  ok(!(await page.isDisabled('[data-sim-solve]')), 'Solve is on (no problems before solving)');
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-nl-converged]', { timeout: 300000 });
  const conv = await page.getAttribute('[data-nl-converged]', 'data-nl-converged'), force = Number(await page.getAttribute('[data-nl-contact-force]', 'data-nl-contact-force'));
  const want = gap + 2 * 10000 * 50 / (200000 * 100);
  const dmax = Number(await page.getAttribute('[data-sim-max-disp]', 'data-sim-max-disp'));
  ok(conv === 'true' && Math.abs(force - 10000) < 100, `solved in the compute worker: all of the load, contact force ${force.toFixed(1)} N (10 000 applied)`);
  ok(dmax >= want * 0.99 && dmax < want * 1.05, `largest displacement ${dmax.toFixed(5)} mm (the pushed end along the bars: gap + 2FL/EA = ${want.toFixed(5)}, plus the sideways shrink)`);
  const plots = await page.$$eval('[data-sim-plot] option', (o) => o.map((x) => x.value));
  ok(plots.includes('plastic'), 'Plastic strain is a plot choice');
  await shot('contact-solved');
  // CalculiX deck through Export
  await page.click('[data-export-menu] summary');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('[data-export-menu] [data-cmd="export-ccx"]')]);
  const deck = fs.readFileSync(await dl.path(), 'utf8');
  ok(/\.inp$/.test(dl.suggestedFilename()) && /\*ELEMENT, TYPE=C3D10/.test(deck) && /\*CONTACT PAIR/.test(deck) && /\*CLOAD/.test(deck), `Export › CalculiX deck (.inp): ${dl.suggestedFilename()}, C3D10 elements, the contact pair, the loads (${(deck.length / 1024).toFixed(0)} KB)`);
  ok(await page.isVisible('[data-cmd="import-frd"]') || (await page.$('[data-cmd="import-frd"]')) !== null, 'Export › CalculiX results (.frd) is in the menu');
  await page.keyboard.press('Escape');
  // a soft pair: the penetration warning in the shared Problems
  ok(await setStudy(300000, 1), 'a soft pair (factor 1) at 3000 MPa');
  await page.waitForTimeout(300);
  await page.click('[data-sim-solve]');
  await page.waitForFunction(() => document.querySelector('[data-nl-penetration]') && !document.querySelector('[data-sim-progress]'), null, { timeout: 300000 });
  const probs = await pc(() => (window.ccProblems?.store?.list?.() || []).map((p) => p.code));
  ok(probs.includes('sim.nl.penetration'), 'the ⚠ Problems panel has "sim.nl.penetration": ' + probs.join(', '));

  console.log('\n== SU.1035 4b: Export › Nested sheets to G-code');
  await page.click('[data-export-menu] summary');
  await page.click('[data-export-menu] [data-cmd="export-sheets"]');
  await page.waitForSelector('dialog.pc-dialog[open]', { timeout: 10000 });
  ok(await page.isVisible('dialog.pc-dialog[open]'), 'the Nested sheets to G-code dialog opens');
  await shot('sheets-dialog');
  await page.keyboard.press('Escape');

  console.log('\n== SU.934 / SU.929 step 5: Export › Scale for printing, Split for printing');
  const P2 = await import(DEV + 'part.js'), S2 = await import(DEV + 'sketch.js');
  const bar = P2.newPart('Long bar'), sk2 = S2.newSketch(); S2.addRect(sk2, [0, 0], [300, 60]);
  const fb = P2.addFeature(bar, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk2 }); P2.addFeature(bar, 'extrude', { sketch: fb.id, op: 'add', end: 'blind', depth: 10 });
  await pc((t) => window.partcraft.openText(t, 'Long bar.partcraft.json'), P2.toJSON(bar));
  await built();
  await page.selectOption('[data-workspace]', 'design').catch(() => {});
  await page.click('[data-export-menu] summary');
  await page.click('[data-export-menu] [data-cmd="export-scaled"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-pexp-scale]');
  const [dl1] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('dialog.pc-dialog[open] [data-key="save"]')]);
  ok(/-scaled\.stl$/.test(dl1.suggestedFilename()) && fs.statSync(await dl1.path()).size > 84, 'Export › Scale for printing: the dialog saves ' + dl1.suggestedFilename());
  await page.click('[data-export-menu] summary');
  await page.click('[data-export-menu] [data-cmd="export-split"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-pexp-split]');
  const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('dialog.pc-dialog[open] [data-key="save"]')]);
  const zb = fs.readFileSync(await dl2.path());
  ok(/-pieces\.zip$/.test(dl2.suggestedFilename()) && zb[0] === 0x50 && zb[1] === 0x4b && zb.includes(Buffer.from('Long-bar-01.stl')) || zb.includes(Buffer.from('-01.stl')), 'Export › Split for printing: a zip of pieces ' + dl2.suggestedFilename());
  console.log('\n== EG.38: Sketch › From a photo…');
  await pc((t) => window.partcraft.openText(t, 'Photo.partcraft.json'), P2.toJSON(P2.newPart('Photo')));
  await built();
  await page.click('[data-features-menu] summary');
  await page.click('[data-features-menu] [data-cmd="sketch-photo"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-photo-dialog]');
  await page.selectOption('[data-photo-of]', 'width'); await page.fill('[data-photo-mm]', '100'); await page.fill('[data-photo-depth]', '10');
  await page.setInputFiles('[data-photo-file]', path.join(HERE, '../mcp/evals/fixtures/plate-photo.png'));
  await page.waitForSelector('[data-photo-found]', { timeout: 60000 });
  const found = await page.textContent('[data-photo-out]');
  ok(/100 × 62\.5 mm/.test(found) && (await page.$('.pc-photo-preview line, .pc-photo-preview path, .pc-photo-preview circle')) !== null, 'the dialog traces the picture: ' + found.replace(/\s+/g, ' ').slice(0, 110));
  await shot('photo-dialog');
  await page.click('dialog.pc-dialog[open] [data-key="make"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 2 && window.partcraft.regen?.stats?.volume > 0, null, { timeout: 60000 });
  await built();
  const made = await pc(() => ({ types: window.partcraft.part.features.map((f) => f.type), vol: window.partcraft.regen?.stats?.volume, undo: window.partcraft.hist.undoStack.length }));
  ok(made.types.join() === 'sketch,extrude' && Math.abs(made.vol - 58768) / 58768 < 0.01 && made.undo === 1, `Make the sketch + extrude 10 mm: one undo step, volume ${made.vol?.toFixed(0)} mm³ (58 768 by the engine's own test; 58 876 by hand)`);
  console.log('\n== EG.20 / EG.56: the drawing dimensions the holes and takes its own paper');
  {
    const pl = P2.newPart('Plate'), sk = S2.newSketch(); S2.addRect(sk, [0, 0], [100, 50]);
    const s1 = P2.addFeature(pl, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }), e1 = P2.addFeature(pl, 'extrude', { sketch: s1.id, depth: 20 });
    const a = S2.newSketch(); S2.addPoint(a, 20, 15); S2.addPoint(a, 20, 35);
    const s2 = P2.addFeature(pl, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: a });
    P2.addFeature(pl, 'hole', { sketch: s2.id, kind: 'simple', d: 6, through: true });
    await pc((t) => window.partcraft.openText(t, 'Plate.partcraft.json'), P2.toJSON(pl));
    await built();
    await h.tool('drawing');
    await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 30000 });
    await page.click('[data-hole-dims] input');
    await page.waitForFunction(() => window.partcraft.drawing?.sheet?.holeDims?.holes === 2, null, { timeout: 30000 });
    const sel = await page.$('select option[value="auto"]');
    ok(!!sel, 'the Sheet list offers Automatic');
    await page.evaluate(() => { const s2 = document.querySelector('select option[value="auto"]').parentElement; s2.value = 'auto'; s2.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForFunction(() => window.partcraft.part.drawing?.sheet === 'auto' && window.partcraft.drawing?.sheet?.paper === 'a4', null, { timeout: 30000 });
    const hd = await pc(() => ({ ...window.partcraft.drawing.sheet.holeDims, paper: window.partcraft.drawing.sheet.paper, scale: window.partcraft.drawing.sheet.scale, kept: window.partcraft.part.drawing }));
    ok(hd.holes === 2 && hd.xs.join() === '20' && hd.ys.join() === '15,35' && hd.paper === 'a4' && hd.scale === 1 && hd.kept.holeDims === true, `Dimension the holes: 2 holes on the ${hd.view} view, X ${hd.xs} / Y ${hd.ys}; Automatic sheet → ${hd.paper.toUpperCase()} at 1:1; kept in the part`);
    await shot('drawing-auto');
    await pc(() => window.partcraft.leaveDrawing());
  }
  const reg = await pc(() => { const r = window.ccInput?.commands || []; return (Array.isArray(r) ? r : Object.values(r)).map((c) => c.id || c); });
  ok(['export.sheets', 'export.ccx', 'export.frd', 'export.scaled', 'export.split', 'sketch.photo'].every((id) => reg.includes(id)), 'the input registry has export.sheets, export.ccx, export.frd, export.scaled, export.split, sketch.photo');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-nl-mount');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
