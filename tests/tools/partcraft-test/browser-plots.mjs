#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plots.mjs — several plots at once and plot export in the Script workspace (0.4 P9), headless Chromium: a script
 * makes three plots; "Side by side" shows them in a grid (each drawn); PNG / SVG / CSV download and are read back (the PNG
 * header says 1600 × 1000, Python's XML parser reads the SVG, the CSV holds the script's numbers); a table's tab leaves the
 * grid; one plot alone has the export buttons too. No console errors.
 *   node tools/partcraft-test/browser-plots.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, pc, ok, shot } = h;
  const waitIdle = async () => { await page.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: 20000 }); await page.waitForTimeout(200); };
  const save = async (sel) => { const dl = page.waitForEvent('download'); await page.click(sel); const d = await dl; const f = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(f); return f; };

  console.log('\n== script plots: several at once, export');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'script') {
    await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
    await page.selectOption('[data-workspace]', 'script');
    await page.waitForSelector('[data-cs-panel]');
    await page.waitForTimeout(400);
  }
  await page.fill('[data-cs-editor]', [
    "clf",
    "x = 0:0.5:5;",
    "plot(x, x.^2, 'title', 'Squares', 'xlabel', 'x', 'ylabel', 'x^2');",
    "plot(x, sin(x), 'title', 'Sine', 'name', 'sin');",
    "plot(x, cos(x), 'title', 'Sine', 'append', true, 'name', 'cos');",
    "plot([1 10 100 1000], 'title', 'Residual', 'log', 'y');",
    "table(magic(3));",
  ].join('\n'));
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5'); await waitIdle();
  await page.waitForSelector('[data-cs-dock-side]:not([hidden])');
  ok(await page.isVisible('[data-cs-dock-side]'), 'with three plots the dock offers Side by side');
  await page.click('[data-cs-dock-side]');
  await page.waitForSelector('[data-cs-plot-grid]');
  const grid = await page.evaluate(() => ({ n: Number(document.querySelector('[data-cs-plot-grid]').dataset.csPlotGrid), drawn: [...document.querySelectorAll('[data-cs-plot-grid] canvas')].map((c) => { const g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; }), pressed: document.querySelector('[data-cs-dock-side]').getAttribute('aria-pressed') }));
  ok(grid.n === 3 && grid.drawn.length === 3 && grid.drawn.every((n) => n > 500) && grid.pressed === 'true', `Side by side: the three plots in a grid, each drawn (${grid.drawn.join(', ')} painted pixels)`);
  await shot('plots-side-by-side');
  // export from the grid: the Sine plot (two series sharing x)
  const cell = '[data-cs-plot-cell="Sine"]';
  const png = await save(`${cell} [data-cs-plot-save="png"]`);
  const b = fs.readFileSync(png);
  ok(b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) && b.readUInt32BE(16) === 1600 && b.readUInt32BE(20) === 1000 && path.basename(png) === 'Sine.png', `PNG: Sine.png, a real PNG of 1600 × 1000 (${b.length} bytes)`);
  const svgF = await save(`${cell} [data-cs-plot-save="svg"]`);
  const xml = spawnSync('python3', ['-c', 'import sys, xml.etree.ElementTree as E; r = E.parse(sys.argv[1]).getroot(); print(len([e for e in r.iter() if e.tag.endswith("polyline")]), [e.text for e in r.iter() if e.tag.endswith("title")][0])', svgF], { encoding: 'utf8' });
  ok(xml.status === 0 && xml.stdout.trim() === '2 Sine', `SVG: read by Python's XML parser — two lines and the title (${xml.stdout.trim() || xml.stderr.trim()})`);
  const csvF = await save(`${cell} [data-cs-plot-save="csv"]`);
  const csv = fs.readFileSync(csvF, 'utf8').replace(/^﻿/, '').trim().split('\r\n');
  const row3 = csv[3].split(',').map(Number);
  ok(csv[0] === 'x,sin,cos' && csv.length === 12 && Math.abs(row3[0] - 1) < 1e-12 && Math.abs(row3[1] - Math.sin(1)) < 1e-12 && Math.abs(row3[2] - Math.cos(1)) < 1e-12, `CSV: x, sin, cos for the 11 points, full precision (row x = 1: ${csv[3]})`);
  // a table's tab leaves the grid; a plot alone has its buttons too
  await page.click('.cs-dock-tab[data-cs-sub="table"]');
  ok(!(await page.$('[data-cs-plot-grid]')) && (await page.getAttribute('[data-cs-dock-side]', 'aria-pressed')) === 'false', 'clicking the table\'s tab shows the table alone');
  await page.click('.cs-dock-tab[data-cs-sub="plot"]');
  ok(await page.isVisible('[data-cs-dock] [data-cs-plot-save="png"]') && !(await page.$('[data-cs-plot-grid]')), 'one plot alone: PNG, SVG and CSV under it');
  await page.selectOption('[data-workspace]', 'design');   // leave the page as the next test expects it
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/craftscript');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
