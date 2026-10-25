#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-noiso.mjs — 0.4 part 2, D.5: PartCraft served WITHOUT the two optional headers (Cross-Origin-Opener-Policy and
 * Cross-Origin-Embedder-Policy), as most web servers will serve the browser edition. The lab page's headers are stripped in the
 * browser (Playwright route): the page is not cross-origin isolated, has no SharedArrayBuffer, Settings says the solvers run on
 * one thread and why, and a voxel static study still solves (pool.js stays off) to the same answer as the isolated page on
 * several threads. Needs the exact kernel for the study (the developer override; the study's workspace has no mesh path yet).
 *   node tools/partcraft-test/browser-noiso.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs, haveOcct } from './browser-harness.mjs';
import { cantileverPart, helpers } from './browser-simulation.mjs';

if (!haveOcct()) { console.log('skip: the study needs OpenCascade (a test-only oracle), which is not in this checkout'); process.exit(0); }
const { state, out } = cliArgs();
const h = await startHarness({ state, out });
const { page, ok, pc, built, tool, shot } = h;
const { facePoint, viewAs, choose, setNum } = helpers(h);
const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
const data = (sel, key) => page.evaluate(([s, k]) => document.querySelector(s)?.dataset[k] ?? null, [sel, key]);

/** Set up the cantilever's voxel static study (fixed left face, force on the right) and solve it → { vm, threads, row }. */
async function study() {
  await pc((t) => window.partcraft.openText(t, 'Cantilever.partcraft.json'), JSON.stringify(await cantileverPart()));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-mesher]', 'voxel');
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 1);
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.simulation; return s.mesher === 'voxel' && s.h === 1 && s.material === 'steel'; });
  await viewAs('left'); await tool('simulation-fixed');
  const l = await facePoint([-1, 0, 0]); await page.mouse.click(l.x, l.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('right'); await tool('simulation-force');
  const r = await facePoint([1, 0, 0]); await page.mouse.click(r.x, r.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('iso');
  await page.click('[data-sim-solve]');
  await page.waitForFunction(() => !document.querySelector('[data-sim-progress]') && document.querySelector('[data-sim-max-vm]'), null, { timeout: 240000 });
  return {
    vm: Number(await data('[data-sim-max-vm]', 'simMaxVm')), threads: Number(await data('[data-sim-threads]', 'simThreads')),
    row: await page.evaluate(() => [...document.querySelectorAll('[data-sim-table] dt')].find((d) => d.textContent === 'Solver').nextElementSibling.textContent),
  };
}
const threadsState = async () => {
  await page.click('[data-settings-open]');
  await page.waitForFunction(() => document.querySelector('[data-app-settings]')?.open);
  const s = await page.evaluate(() => document.querySelector('[data-pc-threads-state]')?.textContent || '');
  await page.keyboard.press('Escape');
  return s;
};

try {
  console.log('\n== D.5: no COOP/COEP headers (the browser edition on an ordinary web server)');
  await h.ctx.route(/\/lab\/partcraft(\?.*)?$/, async (route) => {
    const res = await route.fetch();
    const headers = { ...res.headers() };
    delete headers['cross-origin-opener-policy']; delete headers['cross-origin-embedder-policy'];
    await route.fulfill({ response: res, headers });
  });
  await h.open();
  const iso = await pc(() => ({ coi: window.crossOriginIsolated, sab: typeof SharedArrayBuffer }));
  ok(iso.coi === false && iso.sab === 'undefined', `without the headers the page is not cross-origin isolated (crossOriginIsolated ${iso.coi}, SharedArrayBuffer ${iso.sab})`);
  ok(await pc(() => window.partcraft.useExact && !!window.partcraft.regen), 'the app starts and builds (WebAssembly and module workers need no isolation)');
  const st0 = await threadsState();
  ok(/one thread|1 thread/i.test(st0), `Settings › Solver threads says why it is one thread: "${st0}"`);
  const a = await study();
  ok(a.threads === 1 && Number.isFinite(a.vm) && a.vm > 0, `a voxel static study (36 663 unknowns) solves on 1 thread: max von Mises ${a.vm} MPa — "${a.row}"`);
  await shot('noiso-study');
  ok(h.problems.length === 0, 'no console errors without isolation' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));

  console.log('\n== D.5: the same study with the headers (isolated, several threads)');
  await h.ctx.unroute(/\/lab\/partcraft(\?.*)?$/);
  await h.open();
  ok(await pc(() => window.crossOriginIsolated === true), 'with COOP same-origin + COEP require-corp the page is cross-origin isolated');
  const b = await study();
  ok(b.threads > 1 && near(b.vm, a.vm, 1e-9), `the isolated page solves it on ${b.threads} threads to the same answer: ${b.vm} vs ${a.vm} MPa`);
} catch (err) { await h.failed(err); }
await h.finish();
