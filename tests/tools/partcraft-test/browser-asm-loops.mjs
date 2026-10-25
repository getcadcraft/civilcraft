#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-asm-loops.mjs — 0.7 D7.40 on the page (the mesh kernel): a four-bar linkage assembly opens closed (no joint problems),
 * its four joints blue in the list ("under": the loop can still move), Loops "1 closed; 1 value can still move"; the crank's
 * panel says so; typing a crank angle keeps it and the loop follows (still closed, the other joints' values changed, one undo
 * step); undo puts it back. No console errors. Shot: asm-loops.png.
 *   node tools/partcraft-test/browser-asm-loops.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const A = await import(DEV + 'assembly.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');

// the four-bar of test-asm-loops.mjs: flat bars 5 thick, holes Ø4
const bar = (name, at) => {
  const part = P.newPart(name);
  const sk = S.newSketch(); S.addRect(sk, [Math.min(...at) - 8, -8], [Math.max(...at) + 8, 8]);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 5 });
  const hk = S.newSketch(); for (const x of at) S.addPoint(hk, x, 0);
  const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: hk });
  const h = P.addFeature(part, 'hole', { sketch: s2.id, kind: 'simple', d: 4, depth: 5, through: true });
  return { part, e: e1.id, h: h.id };
};
const top = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'end' }, axis: { feature: b.h, index: k } });
const bottom = (b, inst, k) => ({ inst, plane: { kind: 'face', feature: b.e, face: 'start' }, axis: { feature: b.h, index: k } });
const G = bar('Ground', [0, 100]), C = bar('Crank', [0, 30]), CP = bar('Coupler', [0, 110]), R = bar('Rocker', [0, 80]);
const asm = A.newAssembly('Four-bar');
const ig = A.insertPart(asm, G.part), ic = A.insertPart(asm, C.part), icp = A.insertPart(asm, CP.part), ir = A.insertPart(asm, R.part);
const j1 = A.addJoint(asm, 'revolute', top(G, ig.id, 0), bottom(C, ic.id, 0), { angle: 60 });
A.addJoint(asm, 'revolute', top(C, ic.id, 1), bottom(CP, icp.id, 0), { angle: -50 });
A.addJoint(asm, 'revolute', top(R, ir.id, 1), bottom(CP, icp.id, 1), { angle: 0 });
A.addJoint(asm, 'revolute', top(G, ig.id, 1), bottom(R, ir.id, 0), { angle: 90 });

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc } = h;

try {
  console.log('\n== closed-loop assemblies (0.7 D7.40)');
  await pc((t) => window.partcraft.openText(t, 'Four-bar.partcraft-asm.json'), A.toJSON(asm));
  await page.waitForFunction(() => window.partcraft.mode === 'assembly');
  await pc(() => window.partcraft.asmBuilt());
  const s0 = await pc(() => { const p = window.partcraft; return { problems: p.asmPlace.problems.length, status: p.asmPlace.loops.status, mob: p.asmPlace.loops.mobility, states: [...document.querySelectorAll('[data-joint]')].map((b) => b.dataset.loopState) }; });
  ok(s0.problems === 0 && s0.status === 'under' && s0.mob === 1 && s0.states.join() === 'under,under,under,under', 'opened closed: no joint problems, the four joints blue ("under"), mobility 1');
  const facts = await page.textContent('.pc-facts, [data-facts]').catch(() => '');
  ok(/Loops/.test(facts) && /1 closed; 1 value can still move/.test(facts), 'Part box: Loops — 1 closed; 1 value can still move');
  await page.click(`[data-joint="${j1.id}"]`);
  ok(/rest of the loop follows/.test(await page.textContent('[data-loop-note]')), 'the crank\'s panel: on a loop that can still move');
  const before = await pc(() => window.partcraft.asm.joints.map((j) => j.angle));
  const input = page.locator('[data-joint-value="angle"]');
  await input.fill('100');
  await input.press('Enter');
  await pc(() => window.partcraft.asmBuilt());
  const s1 = await pc(() => { const p = window.partcraft; return { angles: p.asm.joints.map((j) => j.angle), closed: p.asmPlace.loops.closed, problems: p.asmPlace.problems.length, undo: p.asmHist.undoStack.length }; });
  ok(s1.angles[0] === 100 && s1.closed && s1.problems === 0 && s1.angles.slice(1).some((a, i) => Math.abs(a - before[i + 1]) > 1), `the crank set to 100°: kept, the loop closed, the others moved (${s1.angles.map((a) => a.toFixed(1)).join(', ')})`);
  await page.screenshot({ path: path.join(out, 'asm-loops.png') });
  await pc(() => window.partcraft.undoRedo(true));
  await pc(() => window.partcraft.asmBuilt());
  const s2 = await pc(() => window.partcraft.asm.joints.map((j) => j.angle));
  ok(s2.every((a, i) => Math.abs(a - before[i]) < 1e-9), 'undo: every joint back (one step)');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
