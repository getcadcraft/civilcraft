#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** browser-countall-showcase.mjs — Count everything on the saved demo set (fixtures/showcase/takeoffcraft-count-everything.pdf, 12 sheets, 24 × 36 in) against its .counts.json (0.8 EG.67, takeoff_PART_2). */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PDF = path.join(ROOT, 'fixtures/showcase/takeoffcraft-count-everything.pdf'), META = JSON.parse(fs.readFileSync(PDF.replace(/\.pdf$/, '.counts.json'), 'utf8'));
const OUT = path.join(ROOT, 'tmp/shots/takeoffcraft-countall'); fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const browser = await launch(), problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; } catch { /* fine */ } });
  await ctx.addCookies(labCookie());
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); }); page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(BASE + '/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  console.log('machine: ' + await machine(page));
  await page.setInputFiles('[data-file-pdf]', PDF);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 12, null, { timeout: 60000 });
  await page.waitForTimeout(800);
  await page.click('[data-tool="legend"]');
  const at = (x, y) => page.evaluate(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const a = await at(70, 1728 - 170), b = await at(660, 1728 - 650);
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2); await page.mouse.move(b.x, b.y); await page.mouse.up();
  await page.waitForFunction(() => window.takeoffcraft.countall()?.phase === 'review', null, { timeout: 60000 });
  let st = await page.evaluate(() => window.takeoffcraft.countall());
  ok(JSON.stringify(st.entries.map((e) => e.name)) === JSON.stringify(Object.keys(META.totals)), 'the six legend names are read from the PDF text', JSON.stringify(st.entries.map((e) => e.name)));
  await page.screenshot({ path: path.join(OUT, '10-showcase-legend.png') });
  const t0 = Date.now();
  await page.click('[data-ca-start]');
  await page.waitForFunction(() => window.takeoffcraft.countall()?.phase === 'results', null, { timeout: 900000 });
  const s = (Date.now() - t0) / 1000;
  st = await page.evaluate(() => window.takeoffcraft.countall());
  const got = Object.fromEntries(st.entries.map((e) => [e.name, st.total[e.id] || 0]));
  console.log(`  12 sheets in ${s.toFixed(1)} s: ` + JSON.stringify(got) + ' of ' + JSON.stringify(META.totals));
  for (const [n, w] of Object.entries(META.totals)) ok(got[n] <= w && got[n] >= Math.floor(w * 0.97), n + ': ' + got[n] + ' of ' + w + ' (≥ 97%, none extra)');
  await page.click('[data-ca-sheet]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, '11-showcase-results.png') });
  ok(problems.length === 0, 'no console errors', problems.slice(0, 2).join(' | '));
} catch (err) { fail++; console.log('  FAIL ' + (err.stack || err)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
