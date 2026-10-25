#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-draft.mjs — draft analysis (0.4 P21), headless Chromium: Views › Draft analysis on the flange; the legend's three
 * shares add to 100 %; the part takes vertex colours; Reverse swaps positive and negative; a picked flat face sets the pull;
 * a rebuild keeps the colours; Esc removes them; zebra stripes (move with the view) and curvature in the same card (0.4 P22);
 * not offered outside Design. No console errors.
 *   node tools/partcraft-test/browser-draft.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== draft analysis');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  await pc(() => { window.partcraft.view.view('iso'); window.partcraft.view.fit(); });
  const views = async (cmd) => { await page.click('details:has([data-cmd="view-section"]) > summary'); await page.click(`[data-cmd="${cmd}"]`); await page.waitForTimeout(150); };
  const shares = () => page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-draft-pct]')].map((e) => [e.dataset.draftPct, parseFloat(e.textContent)])));
  const tinted = () => pc(() => !!window.partcraft.view.mesh?.material.vertexColors);
  await views('view-draft');
  await page.waitForSelector('[data-draft]');
  let s = await shares();
  ok(Math.abs(s.positive + s.needs + s.negative - 100) < 0.2 && s.positive > 0 && s.negative > 0 && s.needs > 0 && (await tinted()) && (await page.getAttribute('[data-cmd="view-draft"]', 'aria-checked')) === 'true', `Views › Draft analysis, pull +Y: the part is coloured; positive ${s.positive} %, needs draft ${s.needs} %, negative ${s.negative} % (adds to 100)`);
  await shot('draft-analysis');
  await page.click('[data-draft-reverse]');
  const r = await shares();
  ok(Math.abs(r.positive - s.negative) < 0.11 && Math.abs(r.negative - s.positive) < 0.11 && Math.abs(r.needs - s.needs) < 0.11, 'Reverse the pull: positive and negative swap, the walls that need draft stay');
  await page.click('[data-draft-reverse]');
  await page.fill('[data-draft-min]', '0'); await page.press('[data-draft-min]', 'Enter'); await page.waitForTimeout(100);
  const z = await shares();
  ok(z.needs < s.needs, `minimum 0°: fewer faces need draft (${z.needs} % < ${s.needs} %)`);
  // pick the disc's flat bottom face: the pull runs square to it
  await page.click('[data-draft-pick]');
  await pc(() => window.partcraft.view.view('bottom'));
  await page.waitForTimeout(100);
  const r0 = await page.locator('.pc-stage canvas').first().boundingBox();
  await page.mouse.click(r0.x + r0.width / 2 + r0.width * 0.12, r0.y + r0.height / 2);
  await page.waitForTimeout(150);
  ok((await page.inputValue('[data-draft-pull]')) === 'face', 'Pick a face, then click the flat bottom face: the pull is square to it');
  await pc(() => window.partcraft.view.view('iso'));
  // a rebuild keeps the analysis on
  await pc(() => window.partcraft.commit('Hub', () => { const f = window.partcraft.part.features.find((x) => x.type === 'revolve'); f.angle = 359; }));
  await built(); await page.waitForTimeout(150);
  ok((await tinted()) && (await page.$('[data-draft]')), 'after a rebuild the part is coloured again');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  ok(!(await page.$('[data-draft]')) && !(await tinted()), 'Esc closes it and the part takes its own colour again');
  await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built();
  // 0.4 P22: zebra stripes and curvature from the same card
  const colorsSum = () => pc(() => { const c = window.partcraft.view.mesh?.geometry.getAttribute('color'); if (!c) return null; let s = 0; for (let i = 0; i < c.array.length; i += 7) s += c.array[i] * (i % 13 + 1); return s; });
  await views('view-zebra');
  await page.waitForSelector('[data-draft][data-analysis="zebra"]');
  const z0 = await colorsSum();
  await pc(() => window.partcraft.view.view('top')); await page.waitForTimeout(250);
  const z1 = await colorsSum();
  ok((await tinted()) && z0 !== null && z1 !== null && z0 !== z1 && (await page.getAttribute('[data-cmd="view-zebra"]', 'aria-checked')) === 'true', 'Views › Zebra stripes: the part is striped, and the stripes move when the view turns');
  await shot('zebra');
  await views('view-curvature');
  await page.waitForSelector('[data-draft][data-analysis="curvature"]');
  const lim = await page.getAttribute('[data-curv-limit]', 'data-curv-limit');
  ok((await tinted()) && Number(lim) > 0 && (await page.getAttribute('[data-cmd="view-zebra"]', 'aria-checked')) === 'false' && (await page.getAttribute('[data-cmd="view-curvature"]', 'aria-checked')) === 'true', `Views › Curvature switches the card to mean curvature (full colour at ±${lim} 1/mm)`);
  await shot('curvature');
  await page.selectOption('[data-analysis-mode]', 'draft'); await page.waitForTimeout(150);
  ok(await page.$('[data-draft-pull]') !== null, 'Show › Draft angle in the card goes back to the draft analysis');
  await views('view-draft'); await page.waitForTimeout(100);
  ok(!(await page.$('[data-draft]')) && !(await tinted()), 'choosing the open mode again in the menu closes it');
  await page.selectOption('[data-workspace]', 'simulation'); await page.waitForTimeout(300);
  await views('view-draft');
  ok(!(await page.$('[data-draft]')) && /Design workspace/.test(await h.statusText()), 'in another workspace it says it works on the part in Design');
  await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-draft');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
