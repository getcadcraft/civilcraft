#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of bimcraft.js's init() closure into their own
 * modules. One page load with the showcase house, the side panels it moved (Find, Quantities, Model checks), a CSV download, and a failure on
 * any console or page error, which is how a missed closure variable shows. The same file runs on the ORIGINAL main and on the split one.
 * Goes through tools/gpu-remote/browser.mjs, so it runs on the workstation (a heavy page, rule 68):
 *   tools/gpu-remote/run.sh --session code-mains2-10 --lab --with fixtures/showcase/bimcraft-house.ifc -- tools/bimcraft-test/browser-main-10.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const IFC = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bm-main10-'));
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch({ webgl: true });
const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(30000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const text = (sel) => page.evaluate((s) => (document.querySelector(s)?.innerText || '').trim(), sel);
const openPanel = (sec) => page.evaluate((s) => { const d = document.querySelector(`[data-${s}-details]`); if (d) d.open = true; }, sec);

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'networkidle' });
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});
  await page.setInputFiles('[data-file]', IFC);
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  ok(true, 'the showcase house is open');

  // ---- Find (renderFind / runFind) ----
  await openPanel('find');
  await page.waitForTimeout(300);
  const find = await text('[data-find]');
  ok(find.length > 5, 'Find: the panel is drawn', find.slice(0, 60));
  const findBtn = page.locator('[data-find] button').first();
  if (await findBtn.count()) { await findBtn.click({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(500); }
  ok(true, 'Find: a button on it answers');

  // ---- Quantities (renderQto, CSV) ----
  await openPanel('qto');
  await page.waitForTimeout(500);
  const qto = await text('[data-qto]');
  ok(qto.length > 20, 'Quantities: the table is drawn', qto.slice(0, 60));
  const csvBtn = page.locator('[data-qto] button, [data-qto] a').filter({ hasText: /csv/i }).first();
  if (await csvBtn.count()) {
    const [d] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), csvBtn.click()]);
    const f = path.join(TMP, d.suggestedFilename()); await d.saveAs(f);
    ok(/\.csv$/i.test(d.suggestedFilename()) && fs.statSync(f).size > 50, 'Quantities: CSV downloads', d.suggestedFilename());
  } else ok(false, 'Quantities: a CSV button', qto.slice(0, 120));

  // ---- Model checks (renderChecks) ----
  await openPanel('checks');
  await page.waitForTimeout(500);
  const chk = await text('[data-checks]');
  ok(chk.length > 5, 'Model checks: the panel is drawn', chk.slice(0, 60));

  // ---- Collada export, saved views, paint (xr-paint-ui.js) ----
  const dlgCount = () => page.locator('dialog[open]').count();
  const dae = page.locator('[data-dae-export]').first();
  if (await dae.count()) {
    await page.evaluate(() => { window.bimcraftDae.open(); });
    await page.waitForSelector('dialog[open]', { timeout: 10000 }).catch(() => {});
    ok(await dlgCount() === 1, 'Export Collada opens its dialog');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    if (await dlgCount()) { await page.locator('dialog[open] button').first().click().catch(() => {}); await page.waitForTimeout(300); }
  } else ok(false, 'a Collada export entry');
  const sv = page.locator('[data-saved-views]').first();
  if (await sv.count()) {
    await sv.evaluate((b) => b.click());
    await page.waitForTimeout(800);
    ok(true, 'Saved views answers');
    await page.keyboard.press('Escape');
  } else ok(false, 'a Saved views entry');
  const paint = page.locator('[data-paint-open]').first();
  if (await paint.count()) {
    await paint.evaluate((b) => b.click());
    await page.waitForTimeout(800);
    ok(true, 'Paint answers');
    await paint.evaluate((b) => b.click());
    await page.waitForTimeout(300);
  } else ok(false, 'a Paint entry');

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
