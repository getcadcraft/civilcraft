#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-python.mjs — Python in the Script workspace (0.4 P10; 0.5: CPython for WASI), headless Chromium: Language → Python, a
 * script run with F5 in the worker (python.wasm and python-stdlib.zip load from this site's assets/vendor/cpython-wasi, nothing
 * from Pyodide), the console shows the printed lines and no "not sealed off" note (Python is sealed now), the Variables
 * tab lists what the script made, a Python error underlines its line, and a CraftScript tab reads a Python variable. No
 * console errors.
 *   node tools/partcraft-test/browser-python.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, shot } = h;
  const consoleText = () => page.evaluate(() => [...document.querySelectorAll('[data-cs-console] [data-cs-out]')].map((r) => r.textContent).join('\n'));
  const waitIdle = async (ms = 60000) => { await page.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: ms }); await page.waitForTimeout(200); };
  console.log('\n== Python in the Script workspace');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'script') {
    await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
    await page.selectOption('[data-workspace]', 'script');
    await page.waitForSelector('[data-cs-panel]');
    await page.waitForTimeout(400);
  }
  ok((await page.evaluate(() => [...document.querySelectorAll('[data-cs-lang] option')].map((o) => o.value).join())).includes('python'), 'Language offers Python');
  await page.selectOption('[data-cs-lang]', 'python');
  await page.fill('[data-cs-editor]', ['A = cs.magic(3)', 'B = A @ A.T', 'print("trace", sum(float(B[i, i]) for i in range(3)))', 'side = A[0, :]', 'total = sum(range(5))'].join('\n'));
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await waitIdle(120000);
  const text = await consoleText();
  ok(!/not sealed off/.test(text) && /trace 285(\.0)?\b/.test(text), `F5 runs it in the worker: "trace 285.0" (magic(3)·magic(3)ᵀ has trace 285), no "not sealed off" note`);
  await page.fill('[data-cs-editor]', 'import sys\nprint("platform", sys.platform, sys.version.split()[0])\n');
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await waitIdle();
  const plat = (await consoleText()).match(/platform (\S+) (\S+)/);
  ok(plat && plat[1] === 'wasi' && plat[2] === '3.14.7', `it is CPython for WASI (sys.platform "${plat?.[1]}", ${plat?.[2]}), not Pyodide (which says "emscripten")`);
  const vars = await page.evaluate(() => [...document.querySelectorAll('[data-cs-var]')].map((e) => e.dataset.csVar).join());
  ok(/\bA\b/.test(vars) && /\bB\b/.test(vars) && /side/.test(vars) && /total/.test(vars), `the Variables tab lists A, B, side, total (${vars})`);
  await shot('python-run');
  await page.fill('[data-cs-editor]', 'x = 1\ny = x +\n');
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await waitIdle();
  const t2 = await consoleText();
  ok(/line 2/i.test(t2) && /SyntaxError/.test(t2), 'a syntax error is reported on line 2');
  await page.selectOption('[data-cs-lang]', 'craft');
  await page.fill('[data-cs-editor]', 'disp(total * 2)');
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await waitIdle();
  ok(/\b20\b/.test(await consoleText()), 'a CraftScript script reads total from the Python run: 20');
  await page.selectOption('[data-workspace]', 'design');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-python');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
