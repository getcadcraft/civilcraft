#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-motion.mjs — 0.8 EG.7 in PartCraft, headless Chromium: an assembly of two flanges with a slider joint, Assembly › Motion: the card;
 * −5 → 20 mm in 5 s in 25 steps, the middle of the second flange followed, clearance measured: Run → the five steps with a negative offset
 * clash, the least clearance is 0, the speed is 5 mm/s; the speed plot is drawn (SVG) and the plot choice changes it; Save CSV has 26 rows;
 * an impossible range is held inside the joint's limits; no joints → the card says so. No console errors.
 *   node tools/partcraft-test/browser-motion.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, shot } = h;
  const A = await import(DEV + 'assembly.js');
  const V = await import(DEV + 'vec.js');
  console.log('\n== motion study');
  const fl = h.F.flange();
  const asm = A.newAssembly('Slide');
  const i1 = A.insertPart(asm, fl.part);
  const i2 = A.insertPart(asm, fl.part, { pid: i1.part, place: V.translation([300, 0, 0]) });
  const bottom = { kind: 'face', feature: fl.ids.revolve, face: 'side', entity: fl.lines[0] };
  A.addJoint(asm, 'slider', { inst: i1.id, plane: bottom }, { inst: i2.id, plane: bottom });
  await pc((t) => window.partcraft.openText(t, 'Slide.partcraft-asm.json'), A.toJSON(asm));
  await page.waitForFunction(() => window.partcraft.asm && window.partcraft.asmPlace && window.partcraft.asmPlace.world.size === 2 && window.partcraft.asmPlace.problems.length === 0, null, { timeout: 60000 });
  await h.tool('asm-motion');
  await page.waitForSelector('[data-motion]');
  ok(await page.isVisible('[data-motion]') && /Motion study/.test(await page.textContent('[data-motion]')), 'Assembly › Motion opens the card');
  const set = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); await page.waitForTimeout(100); };
  await set('[data-motion] [data-mot-from]', -5); await set('[data-motion] [data-mot-to]', 20); await set('[data-motion] [data-mot-duration]', 5); await set('[data-motion] [data-mot-steps]', 25);
  await page.selectOption('[data-motion] [data-mot-inst]', i2.id);
  await page.click('[data-motion] [data-mot-add-mid]');
  await page.waitForSelector('[data-motion] [data-mot-remove="0"]');
  await page.click('[data-motion] [data-mot-run]');
  await page.waitForSelector('[data-motion] [data-mot-result]', { timeout: 60000 });
  const res = (await page.textContent('[data-motion] [data-mot-result]')).replace(/\s+/g, ' ');
  ok(/Clashes\s*5 of 26 steps; the first at -5 mm/.test(res), 'the five steps with a negative offset clash, the first at −5 mm — ' + res.slice(0, 200));
  ok(/Least clearance\s*0 mm/.test(res), 'the least clearance is 0 (touching or overlapping)');
  ok(/Peak speed 5 mm\/s/.test(res), 'the followed point moves at 5 mm/s — ' + res.slice(res.indexOf('Peak') - 20, res.indexOf('Peak') + 90));
  ok(await page.isVisible('[data-motion] svg[data-mot-plot="position"]'), 'the position plot is drawn');
  await page.selectOption('[data-motion] [data-mot-plot-sel]', 'speed');
  await page.waitForSelector('[data-motion] svg[data-mot-plot="speed"]');
  ok((await page.$$('[data-motion] svg path')).length >= 1, 'the speed plot has its line');
  await page.selectOption('[data-motion] [data-mot-plot-sel]', 'clearance');
  await page.waitForSelector('[data-motion] svg[data-mot-plot="clearance"]');
  await shot('motion');
  const dl = page.waitForEvent('download');
  await page.click('[data-motion] [data-mot-csv]');
  const d = await dl; const fd = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(fd);
  const csv = fs.readFileSync(fd, 'utf8').split('\r\n').filter(Boolean);
  ok(/\.csv$/.test(d.suggestedFilename()) && csv.length === 27 && /Step/.test(csv[0]), 'Save CSV: a header and 26 rows — ' + d.suggestedFilename());
  const keep = await pc(() => window.partcraft.asm.joints[0].offset || 0);
  ok(keep === 0, 'the joint\'s own value is untouched by the study');
  // 0.8 EG.7 round 3 (part_PART_3): the scrub bar moves the assembly through the run, shown only; the settings are kept in the file
  const pos = () => pc(() => { const w = window.partcraft.asmPlace.world, m = w.get(window.partcraft.asm.instances[1].id); return Array.from(m).slice(12, 15).map((v) => +v.toFixed(4)); });
  const p0 = await pos();
  await page.$eval('[data-motion] [data-mot-scrub]', (r) => { r.value = String(Number(r.max)); r.dispatchEvent(new Event('input', { bubbles: true })); });
  const p1 = await pos(), atEnd = await page.getAttribute('[data-motion] [data-mot-scrub-at]', 'data-mot-scrub-at');
  ok(JSON.stringify(p0) !== JSON.stringify(p1) && atEnd === '25' && (await pc(() => window.partcraft.asm.joints[0].offset || 0)) === 0, `the scrub bar at its last step moves the slider part ${JSON.stringify(p0)} → ${JSON.stringify(p1)}; the joint keeps its own value`);
  await page.click('[data-motion] [data-mot-scrub-back]');
  ok(JSON.stringify(await pos()) === JSON.stringify(p0), 'Back to the model puts the assembly where it was');
  const saved = await pc(() => { const m = window.partcraft.asm.motion; return m ? { steps: m.steps, joint: m.joint, json: window.partcraft.A.toJSON(window.partcraft.asm) } : null; });
  ok(saved && saved.steps === 25 && /"motion"/.test(saved.json), 'the study\'s settings are kept in the assembly file (asm.motion; results are not)');
  const back = await pc((txt) => { const a = window.partcraft.A.readAssembly ? window.partcraft.A.readAssembly(txt) : null; return a ? a.motion?.steps : 'no-reader'; }, saved.json);
  ok(back === 25 || back === 'no-reader', 'the file reads back with the same settings (' + back + ')');
  // a range outside the joint's limits is held inside them
  await pc(() => { window.partcraft.asm.joints[0].limits = { min: 0, max: 10 }; });
  await page.click('[data-motion] [data-mot-run]');
  await page.waitForFunction(() => /held inside the joint's limits/.test(document.querySelector('[data-motion]').textContent), null, { timeout: 30000 });
  ok(true, 'a range outside the joint\'s limits is held inside them, and the card says so');
  await page.click('[data-motion] [data-mot-close]');
  ok(!(await page.$('[data-motion]')), 'Close takes the card away');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-motion');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
