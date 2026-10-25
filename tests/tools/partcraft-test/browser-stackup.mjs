#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-stackup.mjs — 0.6 LC.18 in PartCraft, headless Chromium: a 40 × 20 × 10 block, an assembly of two copies, Assembly ›
 * Stack-up: the card; Pick the chain by real clicks on the two copies' top faces (along the first face's normal) → one
 * interface link of 0; two links typed (50 +0.1/−0.1 adding, 49.5 ±0.05 taking away) and the limits 0.3–0.7 → worst case
 * ±0.15, RSS ±0.1118, ranked; Save CSV; Ctrl+Z takes the last edit back (one step); the saved assembly file is version 5 with
 * the stack-up in it. No console errors.
 *   node tools/partcraft-test/browser-stackup.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== tolerance stack-ups');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  const json = await pc(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Block');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [40, 20]);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 10 });
    return JSON.stringify(part);
  });
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), json);
  await built();
  await h.tool('asm-new'); await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy'); await pc(() => window.partcraft.asmBuilt());
  await page.waitForTimeout(300);
  await h.tool('asm-stackup');
  await page.waitForSelector('[data-stackup]');
  ok(await page.isVisible('[data-stackup]') && /No links yet|Pick the chain/.test(await page.textContent('[data-stackup]')), 'Assembly › Stack-up opens the card');
  await page.selectOption('[data-stackup] [data-stk-dir]', 'face');
  await page.click('[data-stackup] [data-stk-pick]');
  await h.tool('view-fit'); await page.waitForTimeout(300);
  // the copies' top faces (y 20 in the part) on screen
  const tops = await pc(() => {
    const pa = window.partcraft, cam = pa.view.camera, r = pa.view.canvas.getBoundingClientRect();
    return pa.asm.instances.map((i) => {
      const M = pa.asmPlace.world.get(i.id), p = [20, 20, 5];
      const w = [M[0] * p[0] + M[4] * p[1] + M[8] * p[2] + M[12], M[1] * p[0] + M[5] * p[1] + M[9] * p[2] + M[13], M[2] * p[0] + M[6] * p[1] + M[10] * p[2] + M[14]];
      const v = cam.position.clone().set(w[0], w[1], w[2]).project(cam);
      return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height];
    });
  });
  for (const [x, y] of tops) { await page.mouse.click(x, y); await page.waitForTimeout(150); }
  ok(/2 faces picked/.test(await page.textContent('[data-stackup]')), 'two clicks on the two copies\' top faces: two faces picked — ' + JSON.stringify(tops) + ' ' + (await h.statusText()) + ' | ' + (await page.textContent('[data-stackup]')).slice(0, 200));
  await page.click('[data-stackup] [data-stk-done]');
  await page.waitForTimeout(200);
  let stk = await pc(() => window.partcraft.asm.stackups?.[0]);
  ok(stk && stk.links.length === 1 && stk.links[0].source === 'interface' && Math.abs(stk.links[0].nominal) < 1e-6 && Math.abs(Math.abs(stk.dir[1]) - 1) < 1e-6, 'Done: one interface link of 0 along the top face\'s normal (Y)');
  // two links typed
  for (let k = 0; k < 2; k++) { await page.click('[data-stackup] [data-stk-add]'); await page.waitForTimeout(100); }
  const set = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); await page.waitForTimeout(120); };
  await set('[data-stackup] [data-stk-nominal="1"]', 50); await set('[data-stackup] [data-stk-up="1"]', 0.1); await set('[data-stackup] [data-stk-lo="1"]', -0.1);
  await set('[data-stackup] [data-stk-nominal="2"]', 49.5); await set('[data-stackup] [data-stk-up="2"]', 0.05); await set('[data-stackup] [data-stk-lo="2"]', -0.05);
  await page.selectOption('[data-stackup] tr[data-stk-link="2"] select >> nth=0', '-1'); await page.waitForTimeout(120);
  await set('[data-stackup] [data-stk-min]', 0.3); await set('[data-stackup] [data-stk-max]', 0.7);
  const res = (await page.textContent('[data-stackup] [data-stk-result]')).replace(/\s+/g, ' ');
  ok(/Gap, nominal\s*0\.5 mm/.test(res) && /Worst case\s*± 0\.15 mm \(0\.35 to 0\.65\)/.test(res) && /RSS\s*± 0\.1118 mm/.test(res), 'typed 50 ±0.1 and −49.5 ±0.05: gap 0.5, worst case ±0.15, RSS ±0.1118 — ' + res);
  ok(/Always inside/.test(res) && /per million/.test(res), 'against 0.3–0.7: worst case always inside, RSS in parts per million');
  const ranks = await page.$$eval('[data-stackup] tbody tr', (rs) => rs.map((r) => r.querySelector('.pc-stk-rank').textContent + ':' + r.querySelector('.pc-stk-share').textContent));
  ok(ranks[1] === '1:80 %' && ranks[2] === '2:20 %', 'the ±0.1 link ranks first with 80 % of the RSS, the ±0.05 one 20 % — ' + ranks.join(' '));
  await shot('stackup');
  const dl = page.waitForEvent('download');
  await page.click('[data-stackup] [data-stk-csv]');
  const d = await dl; const fd = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(fd);
  const csv = fs.readFileSync(fd, 'utf8');
  ok(/\.csv$/.test(d.suggestedFilename()) && /Worst case,0\.5,0\.5,0\.15,0\.35,0\.65/.test(csv), 'Save CSV: the links and the results — ' + d.suggestedFilename());
  // Ctrl+Z: the last edit (the upper limit) goes, in one step
  await page.locator('.pc-stage canvas').first().focus().catch(() => {});
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
  stk = await pc(() => window.partcraft.asm.stackups?.[0]);
  ok(stk && stk.spec && stk.spec.min === 0.3 && stk.spec.max === undefined, 'Ctrl+Z takes the upper limit back (one step)');
  const file = await pc(() => JSON.parse(window.partcraft.A.toJSON(window.partcraft.asm)));
  ok(file.version === 5 && file.stackups.length === 1 && file.stackups[0].links.length === 3, 'the assembly file: version 5, the stack-up in it');
  await page.click('[data-stackup] [data-stk-close]');
  ok(!(await page.$('[data-stackup]')), 'Close takes the card away');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-stackup');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
