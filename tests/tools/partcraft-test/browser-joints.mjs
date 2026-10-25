#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-joints.mjs — the joints of 0.4 P19 in the assembly panel, headless Chromium: an assembly of two flanges with a
 * cylindrical joint opened from a file; the panel shows a number and a slider for each moving value; a typed offset moves
 * the part; a limit on the offset holds it; the motion check sweeps the value chosen; Type → Planar (the offset limit goes,
 * X / Y appear and move the part across the face), Ball (two tilts), Pin in slot (slot direction); saved as version 3.
 * No console errors.
 *   node tools/partcraft-test/browser-joints.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, shot, near } = h;
  const A = await import(DEV + 'assembly.js');
  const V = await import(DEV + 'vec.js');
  console.log('\n== joints: cylindrical, planar, ball, pin in slot');
  // two flanges joined bottom to bottom by a cylindrical joint
  const fl = h.F.flange();
  const asm = A.newAssembly('Joints');
  const i1 = A.insertPart(asm, fl.part);
  const i2 = A.insertPart(asm, fl.part, { pid: i1.part, place: V.translation([300, 0, 0]) });
  const bottom = { kind: 'face', feature: fl.ids.revolve, face: 'side', entity: fl.lines[0] };
  const jt = A.addJoint(asm, 'cylindrical', { inst: i1.id, plane: bottom }, { inst: i2.id, plane: bottom });
  await pc((t) => window.partcraft.openText(t, 'Joints.partcraft-asm.json'), A.toJSON(asm));
  // placed by the joint (the parts built; before that the second flange stands free where it was put)
  await page.waitForFunction(() => window.partcraft.asm && window.partcraft.asmPlace && window.partcraft.asmPlace.world.size === 2 && window.partcraft.asmPlace.problems.length === 0, null, { timeout: 60000 });
  const origin = () => pc((id) => { const W = window.partcraft.asmPlace.world.get(id); return [W[12], W[13], W[14]]; }, i2.id);
  const joint = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.asm.joints[0])));
  /** Type a value; wait until the joint holds it and the part has been placed again (a commit re-places the parts, slower when the machine is busy). */
  const typeIn = async (key, v) => {
    const before = await origin();
    const n = page.locator(`[data-props] [data-joint-value="${key}"]`); await n.fill(String(v)); await n.press('Enter');
    await page.waitForFunction(([k, val]) => window.partcraft.asm.joints[0][k] === val, [key, v], { timeout: 20000 });
    await page.waitForFunction((b) => { const W = window.partcraft.asmPlace?.world?.get(window.partcraft.asm.instances[1].id); return W && Math.hypot(W[12] - b[0], W[13] - b[1], W[14] - b[2]) > 1e-9; }, before, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(100);
  };
  const setType = async (v) => { await page.locator('[data-props] label', { hasText: /^Type$/ }).first().locator('xpath=following-sibling::*[1]/descendant-or-self::select[1]').selectOption(v); await page.waitForTimeout(200); };
  await page.click(`[data-joint="${jt.id}"]`);
  await page.waitForSelector('[data-props] [data-joint-value="offset"]');
  const fields = await page.evaluate(() => ({ v: [...document.querySelectorAll('[data-props] [data-joint-value]')].map((e) => e.dataset.jointValue).join(), r: [...document.querySelectorAll('[data-props] [data-joint-range]')].map((e) => e.dataset.jointRange).join() }));
  ok(fields.v === 'angle,offset' && fields.r === 'angle,offset' && (await page.textContent('[data-joint-note]')).startsWith('Cylindrical'), `a cylindrical joint: a number and a slider for its angle and its offset (${fields.v} / ${fields.r})`);
  const o0 = await origin();
  await typeIn('offset', 5);
  let o1 = await origin();
  ok((await joint()).offset === 5 && near(V.len(V.sub(o1, o0)), 5, 1e-9), `offset 5 typed in: the second flange moves 5 along the joint's axis (offset ${(await joint()).offset}, moved ${V.len(V.sub(o1, o0)).toFixed(6)}, joints ${await pc(() => window.partcraft.asm.joints.length)}, problems ${JSON.stringify(await pc(() => window.partcraft.asmPlace.problems.map((p) => p.message)))})`);
  // a limit on the offset, then its maximum 3: the part is held at 3
  await page.click('[data-props] [data-limit-for="offset"] input, [data-props] label[data-limit-for="offset"]');
  await page.waitForSelector('[data-props] [data-limit-max="offset"]');
  const mx = page.locator('[data-props] [data-limit-max="offset"]'); await mx.fill('3'); await mx.press('Enter'); await page.waitForTimeout(150);
  o1 = await origin();
  ok(JSON.stringify((await joint()).limits) === JSON.stringify({ offset: { min: 0, max: 3 } }) && near(V.len(V.sub(o1, o0)), 3, 1e-9), 'Hold the offset between limits, maximum 3: the limit is kept by name and the part is held 3 away');
  await page.selectOption('[data-props] [data-joint-sweep]', 'offset');
  await page.click('[data-joint-check]');
  ok(/No clash anywhere for Offset \(mm\) from 0 to 3/.test(await h.statusText()), `the motion check sweeps the offset across its limits: "${(await h.statusText()).trim().slice(0, 90)}"`);
  await shot('joint-cylindrical');
  // planar: the offset limit does not fit it and goes; X and Y move the part across the face
  await setType('planar');
  const j2 = await joint();
  const fp = await page.evaluate(() => [...document.querySelectorAll('[data-props] [data-joint-value]')].map((e) => e.dataset.jointValue).join());
  ok(j2.type === 'planar' && j2.limits === undefined && fp === 'dx,dy,angle', `Type → Planar: X, Y and angle; the offset limit is dropped (${fp})`);
  const p0 = await origin();
  await typeIn('dx', 12);
  const p1 = await origin();
  ok(near(V.len(V.sub(p1, p0)), 12, 1e-9), 'Along X 12: the part slides 12 across the face');
  await setType('ball');
  const fb = await page.evaluate(() => [...document.querySelectorAll('[data-props] [data-joint-value]')].map((e) => e.dataset.jointValue).join());
  ok(fb === 'angle,tiltX,tiltY' && (await page.textContent('[data-joint-note]')).startsWith('Ball'), 'Type → Ball: a spin and two tilts');
  await typeIn('tiltX', 30);
  ok((await joint()).tiltX === 30 && (await pc(() => window.partcraft.asmPlace.problems.length)) === 0, 'tilt about X 30: placed without a problem');
  await shot('joint-ball');
  await setType('pinslot');
  const fs2 = await page.evaluate(() => [...document.querySelectorAll('[data-props] [data-joint-value]')].map((e) => e.dataset.jointValue).join());
  ok(fs2 === 'slide,angle,slotDir', `Type → Pin in slot: along the slot, angle, and the slot's direction (${fs2})`);
  await typeIn('slotDir', 90);
  const s0 = await origin();
  await typeIn('slide', 7);
  ok(near(V.len(V.sub(await origin(), s0)), 7, 1e-9), 'slot at 90°, along the slot 7: the pin moves 7');
  // saved: version 3 with the pin-slot joint
  const dl = page.waitForEvent('download');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+s');
  const d = await dl; const f = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(f);
  const aj = JSON.parse(fs.readFileSync(f, 'utf8'));
  ok(aj.version === 3 && aj.joints[0].type === 'pinslot' && aj.joints[0].slotDir === 90 && aj.joints[0].slide === 7, 'Ctrl+S: the assembly file is version 3 with the pin-slot joint and its values');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-joints');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
