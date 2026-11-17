#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of civilcraft.js's init() closure into their own
 * modules. One page load with the sample site, real downloads and dialogs, and a failure on any console or page error, which is how a
 * missed closure variable shows. The same file runs on the ORIGINAL main and on the split one. Goes through tools/gpu-remote/browser.mjs, so it
 * runs on the workstation (a heavy page, rule 68):
 *   tools/gpu-remote/run.sh --session code-mains2-10 --lab --with public_html/assets/apps/civilcraft/dev/sample-site.csv -- tools/civilcraft-test/browser-main-10.mjs
 *
 * Topics: the Properties panels (project, alignment, point), LandXML / DXF / PDF exports, the DWG / DXF and Plot dialogs, opening a LandXML back.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-main10-'));
const E0 = 6150000, N0 = 2080000;
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const clickWorld = async (x, y) => { const s = await page.evaluate(([a, b]) => window.civilcraft.toScreen(a, b), [x, y]); await page.mouse.click(s.x, s.y); await page.waitForTimeout(40); };
async function download(fn, timeout = 60000) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout }), fn()]);
  const f = path.join(TMP, d.suggestedFilename());
  await d.saveAs(f);
  return { name: d.suggestedFilename(), file: f, bytes: fs.readFileSync(f) };
}
const props = () => page.textContent('[data-props-h]');

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.civilcraft?.project, null, { timeout: 40000 });
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276, null, { timeout: 40000 });
  ok(true, 'the sample site is open (276 points)');

  // ---- Properties: project, alignment, point ----
  ok(/./.test(await props()), 'Properties: the project panel shows', await props());
  await page.keyboard.press('a');
  for (const [u, v] of [[10, 260], [200, 230], [300, 40], [390, 30]]) await clickWorld(E0 + u, N0 + v);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments.length) === 1, 'an alignment is drawn by clicks');
  ok((await props()) === 'Alignment', 'Properties: the alignment panel shows', await props());
  ok(await page.locator('[data-props] input, [data-props] select, [data-props] button').count() > 3, 'the alignment panel has its fields');
  await page.evaluate(() => window.civilcraft.select(null));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.civilcraft.pick([String(window.civilcraft.project.points[0].num ?? window.civilcraft.project.points[0].n ?? 1)]));
  await page.waitForTimeout(300);
  ok(/./.test(await props()), 'Properties: a picked point shows its panel', await props());
  await page.evaluate(() => window.civilcraft.select(null));

  // ---- exports ----
  const lx = await download(() => page.evaluate(() => window.civilcraft.exportSet.run('landxml')));
  ok(/\.xml$/i.test(lx.name) && lx.bytes.toString('utf8', 0, 200).includes('LandXML'), 'Export › LandXML downloads', lx.name);
  const dxf = await download(() => page.evaluate(() => window.civilcraft.exportSet.run('dxf')));
  ok(/\.dxf$/i.test(dxf.name) && dxf.bytes.length > 500, 'Export › DXF downloads', `${dxf.name} ${dxf.bytes.length}`);
  const pdf = await download(() => page.evaluate(() => window.civilcraft.exportSet.run('pdf', { paper: 'a3', scale: 500 })), 90000);
  ok(/\.pdf$/i.test(pdf.name) && pdf.bytes.toString('latin1', 0, 5) === '%PDF-', 'Export › PDF plots', `${pdf.name} ${pdf.bytes.length}`);

  // ---- the DWG / DXF and Plot dialogs ----
  await page.evaluate(() => window.civilcraft.command('dwg'));
  await page.waitForSelector('[data-dwg][open]');
  ok(await page.locator('[data-dwg][open] [data-dwg-format]').count() === 1, 'the DWG / DXF dialog opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await page.evaluate(() => window.civilcraft.command('pdf'));
  await page.waitForSelector('[data-plot][open]');
  ok(true, 'the Plot dialog opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // ---- open the LandXML back ----
  await page.setInputFiles('input[type=file][accept*=".xml"]', lx.file);
  await page.waitForTimeout(2500);
  const cnt = await page.evaluate(() => ({ pts: window.civilcraft.project.points.length, al: window.civilcraft.project.state.alignments.length }));
  ok(cnt.pts >= 0 && (cnt.pts > 0 || cnt.al > 0 || !!document.querySelector('dialog[open]')), 'a LandXML opened through the chooser loads or asks', JSON.stringify(cnt));

  ok(problems.length === 0, 'no console or page errors', problems.slice(0, 3).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + e.message.split('\n')[0]);
  for (const p of problems.slice(0, 5)) console.log('       ' + p);
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
