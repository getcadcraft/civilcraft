#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-adaptive.mjs — CAM adaptive clearing (0.4 P24) in the Manufacture workspace, headless Chromium: the flange, a new
 * setup, Adaptive on the toolbar, the disc top (round the hub) picked in the view, engagement typed, toolpaths and the stock
 * simulated in the compute worker: a toolpath, no gouges, posted as GRBL G-code. No console errors.
 *   node tools/partcraft-test/browser-adaptive.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, tool, shot, F } = h;
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const facePoints = (sel) => page.evaluate(({ sel }) => {
    const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen, re = new RegExp(sel.re), out = [];
    rg.faces.forEach((f, i) => {
      if (!re.test(f.name)) return;
      const rect = view.canvas.getBoundingClientRect();
      for (const [r, a] of sel.polar) {
        const v = new THREE.Vector3(r * Math.cos(a * Math.PI / 180), f.o[1], r * Math.sin(a * Math.PI / 180)).project(view.camera);
        const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
        if (x < rect.left + 4 || y < rect.top + 4 || x > rect.right - 4 || y > rect.bottom - 4) continue;
        const hit = view.pickAt(x, y, { edges: false });
        if (hit && hit.kind === 'face' && hit.face === i) { out.push({ x, y }); break; }
      }
    });
    return out;
  }, { sel });
  const waitResult = () => page.waitForFunction(() => !!document.querySelector('[data-mgouges]') && !/Generating/.test(document.querySelector('[data-mprogram]')?.textContent || ''), null, { timeout: 240000 });

  console.log('\n== manufacture: adaptive clearing');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await built();
  await choose('manufacture');
  await page.click('[data-mnew]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.manufacture);
  await page.click('[data-mtab="ops"]');
  ok(await page.isVisible('.pc-tools [data-cmd="manufacture-adaptive"]'), 'the toolbar has Adaptive');
  await tool('manufacture-adaptive');
  await page.waitForSelector('[data-mpick][aria-pressed="true"]');
  const disc = await facePoints({ re: '^f2\\.side:l17$', polar: [[62, -90], [62, 90], [62, 0], [62, 180], [88, -60], [88, 120]] });
  await page.mouse.click(disc[0].x, disc[0].y);
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[0]?.geo.faces.length === 1);
  await page.fill('[data-mparam="engagement"]', '0.2'); await page.press('[data-mparam="engagement"]', 'Tab');
  await page.fill('[data-mparam="stepdown"]', '10'); await page.press('[data-mparam="stepdown"]', 'Tab');
  await page.waitForFunction(() => window.partcraft.part.studies.manufacture.ops[0].params.engagement === 0.2 && window.partcraft.part.studies.manufacture.ops[0].params.stepdown === 10);
  await page.click('[data-mpick]');
  const op = await pc(() => JSON.parse(JSON.stringify(window.partcraft.part.studies.manufacture.ops[0])));
  ok(op.type === 'adaptive' && op.geo.faces[0].name === 'f2.side:l17' && (await page.textContent('[data-props], .pc-right')).includes('Engagement'), 'Adaptive: the disc top picked by a click, engagement 0.2 and step-down 10 typed');
  await tool('manufacture-simulate');
  await waitResult();
  const flag = await page.evaluate(() => document.querySelector('[data-mop] .pc-node-flag')?.textContent || '');
  ok(/moves/.test(flag), `a toolpath for the adaptive operation (${flag})`);
  ok((await page.getAttribute('[data-mgouges]', 'data-mgouges')) === '0' && !(await page.textContent('.pc-right')).includes('Rapids into stock'), 'the simulated stock: no gouges into the flange and no rapid move into stock');
  await shot('adaptive');
  const dl = page.waitForEvent('download');
  await page.click('.pc-tools [data-cmd="manufacture-post"]');
  const d = await dl; const f = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(f);
  const g = fs.readFileSync(f, 'utf8');
  ok(/G0?[23]\b/.test(g) && !/NaN/.test(g) && g.split('\n').length > 100, `posted: ${d.suggestedFilename()}, ${g.split('\n').length} lines with arcs`);
  await choose('design');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-adaptive');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
