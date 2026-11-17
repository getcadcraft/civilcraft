#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of markupcraft.js's init() closure into their own
 * modules. One page load with two PDFs, real downloads, and a failure on any console or page error, which is how a missed closure variable shows.
 * The same file runs on the ORIGINAL main and on the split one. Goes through tools/gpu-remote/browser.mjs, so it runs here (one short run, nice)
 * or on the workstation:
 *   tools/gpu-remote/run.sh --session code-mains2-10 --lab --with fixtures/pdf/kitchen-plan-sheet.pdf --with fixtures/pdf/scan-filters.pdf -- tools/markupcraft-test/browser-main-10.mjs
 *
 * Topics: list exports (CSV, BCF, xlsx) and the BCF import, Find, comparing two sets and the changes list, Save flattened / clean.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-main10-'));
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Guard Tester')); } catch { /* */ } });
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '')).join(' < ')));
const tab = async (k) => { await page.locator('[data-tab="' + k + '"]').click(); await page.waitForSelector('#mc-pane-' + k + ':not([hidden])'); };
const act = (a) => page.evaluate((x) => document.querySelector('[data-act="' + x + '"]').click(), a);
async function download(fn, timeout = 40000) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout }), fn()]);
  const f = path.join(TMP, d.suggestedFilename());
  await d.saveAs(f);
  return { name: d.suggestedFilename(), file: f, bytes: fs.readFileSync(f) };
}

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.markupcraft?.orphans !== undefined, null, { timeout: 20000 }).catch(() => {});
  await page.click('[data-autosave-discard-all]', { timeout: 1500 }).catch(() => {});
  await page.setInputFiles('[data-file]', [path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf'), path.join(REPO, 'fixtures/pdf/scan-filters.pdf')]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length >= 2 && window.markupcraft.view.page, null, { timeout: 40000 });
  ok(await page.evaluate(() => window.markupcraft.sheets.length) >= 2, 'two PDFs are open');
  const ids = await page.evaluate(() => {
    const m = window.markupcraft, k = m.sheets[0].page.key, made = [];
    m.store.change('t', (tx) => {
      made.push(tx.add({ sheet: k, type: 'cloudrect', rect: [300, 300, 560, 440], text: 'Redraw the hood wall', author: 'Guard Tester' }).id);
      made.push(tx.add({ sheet: k, type: 'cloudrect', rect: [100, 100, 220, 180], text: 'Check the door swing', author: 'Guard Tester' }).id);
    });
    return made;
  });
  ok(ids.length === 2, 'two markups added');

  // ---- list exports (CSV, BCF, xlsx) and the BCF import ----
  await tab('list');
  await page.waitForTimeout(300);
  const csv = await download(() => act('list-csv'));
  ok(/\.csv$/i.test(csv.name) && csv.bytes.toString('utf8').includes('Redraw the hood wall'), 'List › CSV downloads the markups', csv.name);
  const bcf = await download(() => act('list-bcf'));
  ok(/\.(bcfzip|bcf|zip)$/i.test(bcf.name) && bcf.bytes.slice(0, 2).toString() === 'PK', 'List › BCF downloads a zip', `${bcf.name} ${bcf.bytes.length}`);
  const xl = await download(() => page.evaluate(() => window.markupcraft.exportSet.run('xlsx')));
  ok(/\.xlsx$/i.test(xl.name) && xl.bytes.slice(0, 2).toString() === 'PK', 'the export set: xlsx downloads a workbook', xl.name);
  const before = await page.evaluate(() => window.markupcraft.store.markups.size);
  await page.setInputFiles('[data-bcf-file]', bcf.file);
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => window.markupcraft.store.markups.size);
  ok(after >= before, 'a BCF opened through the chooser does not lose markups', before + ' -> ' + after);

  // ---- Find ----
  await page.evaluate(() => { const d = document.querySelector('[data-find]'); if (d) d.open = true; });
  await page.fill('[data-find-q]', 'kitchen');
  await page.locator('[data-find-form]').evaluate((f) => f.requestSubmit());
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => !!document.querySelector('[data-find]')), 'Find runs its search without an error');

  // ---- compare two sets and the changes list ----
  await tab('compare');
  await page.evaluate(() => { for (const d of document.querySelectorAll('details.mc-set-cmp')) d.open = true; });
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-set-old] option')].map((o) => o.value));
  if (opts.length >= 2) {
    await page.selectOption('[data-set-old]', opts[0]);
    await page.selectOption('[data-set-new]', opts[1]);
    await act('set-compare');
    await page.waitForFunction(() => (document.querySelector('[data-set-status]')?.textContent || '').trim().length > 0 || document.querySelector('[data-set-results] li'), null, { timeout: 40000 });
    ok(true, 'Compare two sets answers');
    await act('changes-list');
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => !document.querySelector('[data-changes-box]')?.hidden), 'the changes list opens');
  } else ok(false, 'two sets to compare', JSON.stringify(opts));

  // ---- Save flattened, Save clean ----
  const flat = await download(async () => { await act('save-flat'); await page.waitForSelector('dialog[open] button[data-key="save"]'); await page.click('dialog[open] button[data-key="save"]'); }, 60000);
  ok(/\.pdf$/i.test(flat.name) && flat.bytes.toString('latin1', 0, 5) === '%PDF-', 'Save flattened downloads a PDF', flat.name);
  await page.waitForTimeout(500);
  const clean = await download(() => act('save-clean'), 60000).catch((e) => ({ name: 'none: ' + e.message.split('\n')[0], bytes: Buffer.alloc(0) }));
  ok(/\.pdf$/i.test(clean.name) && clean.bytes.toString('latin1', 0, 5) === '%PDF-', 'Save clean downloads a PDF', clean.name);

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
