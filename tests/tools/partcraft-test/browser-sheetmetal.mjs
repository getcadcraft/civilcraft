#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sheetmetal.mjs — sheet metal in the Design workspace (0.4 P15/P16), headless Chromium: More › Base flange on a
 * closed sketch (a plate) and on an open chain (a bent U channel, thickness inside, then outside), the thickness from the
 * panel, More › Edge flange waiting for an edge, a click on the plate's edge, angle and offset (with its bend relief) from
 * the panel, one undo step each; Flat pattern › Lay flat (preview, size with the bend allowance) and Save DXF (read back).
 * Volumes against closed forms. No console errors.
 *   node tools/partcraft-test/browser-sheetmetal.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot, nearRel } = h;
  const PI = Math.PI;
  const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };
  const vol = () => pc(() => window.partcraft.regen.stats?.volume ?? null);
  const results = () => pc(() => [...window.partcraft.regen.results].filter(([, r]) => r.status !== 'ok').map(([k, r]) => k + ': ' + r.message).join('; '));
  const last = () => pc(() => window.partcraft.part.features.at(-1));
  const control = (label) => page.locator('[data-props] label', { hasText: label }).first().locator('xpath=following-sibling::*[1]/descendant-or-self::*[self::input or self::select][1]');
  const setNum = async (label, v) => { const c = control(label); await c.fill(String(v)); await c.press('Enter'); await built(); };
  const tick = async (text) => { await page.click(`[data-props] label:has-text("${text}")`); await built(); };
  const screenOf = (p) => pc((p) => {
    const v = window.partcraft.view, cam = v.camera;
    const q = cam.position.clone().set(p[0], p[1], p[2]).project(cam);
    const r = v.canvas.getBoundingClientRect();
    return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height];
  }, p);
  const openPart = async (draw) => {
    const json = await pc(draw);
    await pc((t) => window.partcraft.openText(t, 'Sheet.partcraft.json'), json);
    await built();
    await pc(() => { window.partcraft.view.view('iso'); window.partcraft.view.fit(); });
    await page.waitForTimeout(100);
  };

  console.log('\n== sheet metal: base flange, edge flange');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc(() => window.partcraft.exactReady());
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-features-menu] [data-cmd]')].map((b) => b.dataset.cmd).join());
  ok(/sheetbase,sheetflange/.test(items), 'More holds Base flange and Edge flange');
  // a closed sketch 100 × 60 → a plate; thickness 3 from the panel
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Bracket');
    const a = S.newSketch(); S.addRect(a, [0, 0], [100, 60]);
    P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    return JSON.stringify(part);
  });
  await pc(() => window.partcraft.selectFeature('f1'));
  await menu('sheetbase');
  let f = await last();
  ok(f.type === 'sheetbase' && f.sketch === 'f1' && nearRel(await vol(), 12000, 1e-9), `More › Base flange on the selected sketch: a 100 × 60 plate, 2 thick = 12000 (${await vol()}) ${await results()}`);
  await setNum('Thickness', 3);
  ok(nearRel(await vol(), 18000, 1e-9), 'Thickness 3 in the panel: 18000');
  // More › Edge flange with nothing picked waits for an edge; the edge between the top (z 3) and the side y = 60
  await page.keyboard.press('Escape');
  await menu('sheetflange');
  f = await last();
  ok(f.type === 'sheetflange' && f.edge === null && /straight edge/.test(await h.statusText()), 'More › Edge flange with no edge picked waits for one (the status says so)');
  const [x, y] = await screenOf([50, 60, 3]);
  await page.mouse.click(x, y); await built();
  f = await last();
  // 18000 + 100 × ((π/4)((2+3)² − 2²) + 20·3)
  const v90 = 18000 + 100 * (21 * PI / 4 + 60);
  ok(f.edge && nearRel(await vol(), v90, 1e-9), `a click on the plate's top edge at y 60: flange 90°, 20 long, bent about r 2 → ${v90.toFixed(4)} (${await vol()}) ${await results()}`);
  await shot('sheet-flange');
  await setNum('Angle', 45);
  const v45 = 18000 + 100 * (21 * PI / 8 + 60);
  ok(nearRel(await vol(), v45, 1e-9), `Angle 45 in the panel: ${v45.toFixed(4)}`);
  await setNum('Offset at the start', 10);
  // 90 long; a 2-wide relief, r + t = 5 deep, through 3: − 30
  const vOff = 18000 - 30 + 90 * (21 * PI / 8 + 60);
  ok(nearRel(await vol(), vOff, 1e-9), `Offset at the start 10: the flange is 90 long and a 2 × 5 × 3 bend relief is cut (${(await vol()).toFixed(4)} = ${vOff.toFixed(4)})`);
  await page.locator('.pc-stage canvas').first().focus().catch(() => {});
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  ok(nearRel(await vol(), v45, 1e-9), 'Ctrl+Z takes the offset back (one step)');
  // the flat pattern (P17): 100 × (60 + BA + 20) with BA = (π/4)(2 + 0.44·3)
  await page.click('[data-props] [data-sheet-flat]');
  await page.waitForSelector('[data-sheet-flat-svg]', { timeout: 20000 });
  const BA = (PI / 4) * (2 + 0.44 * 3);
  const facts = await page.textContent('[data-sheet-flat-facts]');
  ok(facts.includes(`100 × ${String(+(80 + BA).toFixed(3))} mm`) && /Bends\s*1/.test(facts), `Lay flat: the preview and the size 100 × ${(80 + BA).toFixed(3)} mm (60 + the bend allowance + 20), one bend (${facts.replace(/\s+/g, ' ')})`);
  ok((await page.textContent('[data-sheet-flat-block]')).includes('EdgeFlange1: up 45°, inside radius 2 mm'), 'the bend is listed: EdgeFlange1 up 45°, inside radius 2 mm');
  await shot('sheet-flat');
  const dl = page.waitForEvent('download');
  await page.click('[data-sheet-dxf]');
  const d = await dl; const fd = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(fd);
  const dxf = fs.readFileSync(fd, 'utf8');
  ok(/^Bracket flat\.dxf$/.test(d.suggestedFilename()) && /\r\nAC1009\r\n/.test(dxf) && /\r\nBEND\r\n/.test(dxf) && /UP 45%%d R2\r\n/.test(dxf) && (dxf.match(/\r\n  0\r\nLINE\r\n  8\r\nOUTLINE/g) || []).length === 4, `Save DXF: "${d.suggestedFilename()}", R12, four outline lines, a bend line and the note UP 45° R2`);
  await setNum('Length', 25);
  ok(!(await page.$('[data-sheet-flat-svg]')) && (await page.isVisible('[data-sheet-flat]')), 'after an edit the old flat goes and Lay flat comes back');
  // an open chain → a bent U channel, legs 30 / 40 / 30, t 2, r 2, depth 50
  await openPart(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Channel');
    const a = S.newSketch(); let l = S.addLine(a, [0, 30], [0, 0]); l = S.addLine(a, l.p2, [40, 0]); S.addLine(a, l.p2, [40, 30]);
    P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    return JSON.stringify(part);
  });
  await pc(() => window.partcraft.selectFeature('f1'));
  await menu('sheetbase');
  ok(nearRel(await vol(), (84 * 2 + 6 * PI) * 50, 1e-9), `More › Base flange on an open chain: a U channel bent with r 2, thickness inside: (84·2 + 6π)·50 (${await vol()}) ${await results()}`);
  await tick('Thickness outside the bends');
  ok(nearRel(await vol(), (92 * 2 + 6 * PI) * 50, 1e-9), 'Thickness outside the bends: (92·2 + 6π)·50');
  await shot('sheet-channel');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-sheet');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
