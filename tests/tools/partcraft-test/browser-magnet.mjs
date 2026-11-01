#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-magnet.mjs — 0.8 SG.7+ in PartCraft's real page (session oltl-su_PART_3), headless Chromium on /lab/partcraft:
 *   a part with three sketches (a U yoke, a magnet in its base, a keeper 2 mm above the pole faces) → More › Magnet study of sketches… opens;
 *   the three profiles are listed; each gets its part (iron / magnet / iron with force on); Run solves in the compute worker; the field is painted
 *   on the canvas (coloured pixels), the readouts name the strongest field and the keeper's force (pulled down), Save results is offered, the shell's
 *   Problems list carries sim.magnet.force_thin; the input registry has sketch.magnet; no console errors.
 *   node tools/partcraft-test/browser-magnet.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== SG.7+ Magnet study in the page');
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js');
  const poly = (pts) => { const sk = S.newSketch(); const ids = pts.map(([x, y]) => S.addPoint(sk, x, y)); ids.forEach((id, i) => S.addLine(sk, id, ids[(i + 1) % ids.length])); return sk; };
  const rect = (x0, y0, x1, y1) => { const sk = S.newSketch(); S.addRect(sk, [x0, y0], [x1, y1]); return sk; };
  const part = P.newPart('Magnet');
  for (const [name, sk] of [['Yoke', poly([[-50, -30], [50, -30], [50, 30], [30, 30], [30, -10], [-30, -10], [-30, 30], [-50, 30]])], ['Magnet', rect(-10, -30, 10, -10)], ['Keeper', rect(-50, 32, 50, 52)]]) {
    const f = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); f.name = name;
  }
  await pc((t) => window.partcraft.openText(t, 'Magnet.partcraft.json'), JSON.stringify(part));
  await built();
  const reg = await pc(() => { const r = window.ccInput?.commands || []; return (Array.isArray(r) ? r : Object.values(r)).map((c) => c.id || c); });
  ok(reg.includes('sketch.magnet'), 'the input registry has sketch.magnet');
  ok(await page.evaluate(() => !!document.querySelector('[data-cmd="sketch-magnet"]')), 'the toolbar has the Magnet study entry (Features › More)');
  await page.evaluate(() => { document.querySelector('[data-cmd="sketch-magnet"]').click(); });
  await page.waitForSelector('[data-mag-dialog]', { timeout: 30000 });
  const rows = await page.$$eval('[data-mag-row]', (r) => r.length);
  ok(rows === 3, 'the dialog lists the three closed profiles: ' + rows);
  await page.selectOption('[data-mag-role="2"]', 'magnet');
  await page.fill('[data-mag-field="br:2"]', '1.2'); await page.dispatchEvent('[data-mag-field="br:2"]', 'change');
  await page.fill('[data-mag-field="mur:1"]', '1000'); await page.dispatchEvent('[data-mag-field="mur:1"]', 'change');
  await page.fill('[data-mag-field="mur:3"]', '1000'); await page.dispatchEvent('[data-mag-field="mur:3"]', 'change');
  await page.check('[data-mag-force="3"]');
  await page.selectOption('[data-mag-fine]', '0.5');
  await page.fill('[data-mag-depth]', '1000');
  await page.click('[data-mag-run]');
  await page.waitForSelector('[data-mag-bmax]', { timeout: 240000 });
  const bmax = Number(await page.getAttribute('[data-mag-bmax]', 'data-mag-bmax'));
  ok(bmax > 0.3 && bmax < 3, 'the strongest field is shown: ' + bmax + ' T');
  const fy = Number(await page.getAttribute('[data-mag-body="3"]', 'data-mag-fy')), fx = Number(await page.getAttribute('[data-mag-body="3"]', 'data-mag-fx'));
  ok(fy < -1000 && Math.abs(fx) < 0.02 * Math.abs(fy), `the keeper is pulled down: ${fy} N, ${fx} N sideways (1 m deep)`);
  const px = await page.$eval('[data-mag-plot]', (c) => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; const seen = new Set(); let colour = 0; for (let i = 0; i < d.length; i += 4 * 97) { if (d[i + 3] > 200) { colour++; seen.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); } } return { colour, shades: seen.size }; });
  ok(px.colour > 500 && px.shades >= 6, 'the field is painted on the canvas (' + px.colour + ' sampled pixels, ' + px.shades + ' shades)');
  ok(await page.isVisible('[data-mag-csv]'), 'Save results (CSV) is offered');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-mag-csv]')]);
  ok(/magnet study\.csv$/.test(dl.suggestedFilename()), 'the CSV downloads: ' + dl.suggestedFilename());
  await shot('magnet-study');
  const probs = await pc(() => (window.ccProblems?.store?.list?.() || []).map((p) => p.code));
  ok(probs.includes('sim.magnet.force_thin'), 'the Problems list gets sim.magnet.force_thin (' + probs.join(',') + ')');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-magnet');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
