#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-generative.mjs — the Generative workspace in headless Chromium: a 60 × 20 × 4 plate set up by clicks (New
 * study, element size, one target volume, Fixed on one end, Force on the other, a preserve region), generated in the
 * compute worker to completion; the outcomes table (mass = volume × density), a preview overlay with the part hidden,
 * STL downloaded and read back (closed, the stated triangle count), the outcome as a new part file opened through
 * the exact kernel as an imported solid of the same volume; Stop; one toolbar row; no console errors.
 *   node tools/partcraft-test/browser-generative.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, rows, choose, setNum } = helpers(h);

  console.log('\n== generative: a plate set up by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Plate.partcraft.json'), JSON.stringify(await cantileverPart(60, 20, 4)));
  await built();
  await choose('generative');
  ok((await rows()) === 1, 'Generative: the toolbar is one row at 1440 px');
  await page.click('[data-gen-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.generative);
  await setNum('[data-gen-size]', 2);
  await page.click('[data-gen-vol="0.2"]');
  await page.click('[data-gen-vol="0.4"]');
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.generative; return s.h === 2 && s.volfracs.join() === '0.3'; });
  const est = Number(await page.getAttribute('[data-gen-estimate]', 'data-gen-estimate'));
  ok(est === 600, `element size 2 mm and one target volume (30 %) from the panel; ${est} cubes`);
  await viewAs('left');
  await tool('generative-fixed');
  const left = await facePoint([-1, 0, 0]);
  await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => window.partcraft.part.studies.generative.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('right');
  await tool('generative-force');
  const right = await facePoint([1, 0, 0]);
  await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => window.partcraft.part.studies.generative.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await page.selectOption('[data-sim-dir]', '-y');
  await page.waitForFunction(() => Array.isArray(window.partcraft.part.studies.generative.loads[0].dir));
  // a preserve region on the top face, 2 mm deep
  await viewAs('top');
  await tool('generative-preserve');
  const top = await facePoint([0, 1, 0]);
  await page.mouse.click(top.x, top.y);
  await page.waitForFunction(() => window.partcraft.part.studies.generative.preserve[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  const st = await pc(() => window.partcraft.part.studies.generative);
  ok(st.constraints[0].type === 'fixed' && st.loads[0].type === 'force' && st.preserve[0].t === 2, 'Fixed, Force and Preserve by toolbar + clicks on faces');
  const tint = await pc(() => { let n = 0; window.partcraft.view.overlays.get('generative-markers')?.traverse((o) => { if (o.isMesh && o.material.opacity === 0.35) n++; }); return n; });
  ok(tint === 1, 'the preserve region is tinted in the view');
  await viewAs('iso');
  await shot('gen-setup');

  console.log('\n== generative: generate, outcomes, downloads');
  await tool('generative-generate');
  await page.waitForSelector('[data-gen-progress]');
  await page.waitForSelector('[data-gen-row="0"]', { timeout: 240000 });
  const row = await page.evaluate(() => { const r = document.querySelector('[data-gen-row="0"]'); return { cells: [...r.querySelectorAll('td')].map((td) => td.textContent), mass: Number(r.querySelector('[data-gen-mass]').dataset.genMass) }; });
  ok(row.cells[0] === '30 %' && row.cells[1] === 'Aluminum 6061-T6' && row.mass > 0, `one outcome: ${row.cells.join(' | ')}`);
  ok(Math.abs(row.mass / (0.3 * 4800 * 2700e-9) - 1) < 0.08, `its mass ${(row.mass * 1000).toFixed(2)} g is about 30 % of the plate's (${(4800 * 2700e-6 * 0.3).toFixed(2)} g; preserved and fixed regions included)`);
  await page.click('[data-gen-row="0"] button');
  await page.waitForFunction(() => !!window.partcraft.view.overlays.get('generative-outcome') && !window.partcraft.view.partVisible);
  ok(true, 'choosing it previews the outcome as an overlay with the part hidden');
  await shot('gen-outcome');
  await page.click('[data-gen-show-part]');
  await page.waitForFunction(() => window.partcraft.view.partVisible);
  ok(true, '"Show the part through it" shows the part again');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-gen-stl]')]);
  fs.mkdirSync(path.join(REPO, 'tmp/partcraft-sim'), { recursive: true });
  const file = path.join(REPO, 'tmp/partcraft-sim', dl.suggestedFilename());
  await dl.saveAs(file);
  const buf = fs.readFileSync(file), nt = buf.readUInt32LE(80);
  // closed: every edge twice (vertices welded by position)
  const key = (o) => [0, 1, 2].map((k) => buf.readFloatLE(o + 4 * k).toFixed(5)).join(',');
  const edges = new Map();
  for (let t = 0; t < nt; t++) { const o = 84 + 50 * t + 12, v = [key(o), key(o + 12), key(o + 24)]; for (let k = 0; k < 3; k++) { const e = [v[k], v[(k + 1) % 3]].sort().join('|'); edges.set(e, (edges.get(e) || 0) + 1); } }
  ok(buf.length === 84 + 50 * nt && nt > 100 && [...edges.values()].every((c) => c === 2), `STL downloaded (${dl.suggestedFilename()}): ${nt} triangles, closed`);
  const [dp] = await Promise.all([page.waitForEvent('download'), page.click('[data-gen-part]')]);
  const pfile = path.join(REPO, 'tmp/partcraft-sim', dp.suggestedFilename());
  await dp.saveAs(pfile);
  const meshVol = await pc(() => { const o = window.partcraft.view.overlays.get('generative-outcome'); const P = o.geometry.attributes.position.array, I = o.geometry.index.array; let v = 0; for (let t = 0; t < I.length; t += 3) { const a = 3 * I[t], b = 3 * I[t + 1], c = 3 * I[t + 2]; v += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]); } return v / 6; });
  ok(dp.suggestedFilename().endsWith('.partcraft.json') && /"type": "import"/.test(fs.readFileSync(pfile, 'utf8')), 'New part file downloaded: a part whose one feature imports the outcome');
  ok(await page.isDisabled('[data-gen-add-part]'), 'Add to this part is off for a part design space (the outcome lies inside the part), with the reason in its title');

  console.log('\n== generative: stop, the part file opened');
  await page.click('[data-gen-vol="0.2"]');
  await page.waitForFunction(() => window.partcraft.part.studies.generative.volfracs.length === 2);
  await page.click('[data-gen-generate]');
  await page.waitForSelector('[data-gen-progress]');
  await page.click('[data-gen-stop]');
  await page.waitForFunction(() => /Stopped/.test(document.querySelector('[data-status]').textContent));
  ok(!(await page.isDisabled('[data-gen-generate]')), 'Stop ends a running generation; Generate is available again');
  const back = await pc(() => window.partcraft.host.P.readPart(window.partcraft.host.P.toJSON(window.partcraft.part)).studies.generative);
  ok(back.preserve.length === 1 && back.volfracs.join() === '0.2,0.3', 'the generative study is saved in the part file and reads back');
  await choose('design');
  ok(await pc(() => window.partcraft.view.partVisible && !window.partcraft.view.overlays.size), 'back in Design: the part, no overlays');
  await pc((t) => window.partcraft.openText(t, 'Outcome.partcraft.json'), fs.readFileSync(pfile, 'utf8'));
  await built();
  const r = await pc(() => ({ ok: [...window.partcraft.regen.results.values()].every((x) => x.status === 'ok'), v: window.partcraft.regen.stats?.volume, bodies: window.partcraft.regen.stats?.bodies }));
  ok(r.ok && r.bodies === 1 && Math.abs(r.v / meshVol - 1) < 2e-3, `the part file opens: the outcome as one imported (faceted) solid through OpenCascade, ${r.v?.toFixed(1)} mm³ = the surface's ${meshVol.toFixed(1)}`);
  await shot('gen-imported');
  ok(h.problems.length === 0, 'generative: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
