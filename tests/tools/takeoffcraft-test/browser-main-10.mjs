#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains2-10), which moves topics out of takeoffcraft.js's init() closure into their own
 * modules. One page load, real dialogs, and a failure on any console or page error, which is how a missed closure variable shows.
 * The same file runs on the ORIGINAL main and on the split one. It goes through tools/gpu-remote/browser.mjs, so it runs here
 * (one short run, nice) or on the workstation: tools/gpu-remote/run.sh --session code-mains2-10 --lab -- tools/takeoffcraft-test/browser-main-10.mjs
 *
* Topics: dialogs (library, trade packs, export pack, Send for bids, leveling), clipboard, bid areas, notes, compare.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map((x) => x.trim().replace(/^at /, '').replace(/https:\/\/getcadcraft.com\/lab\/[^ ]*?\//, '')).join(' < ')));
const open = () => page.locator('dialog.tc-dialog[open]').count();
const title = () => page.evaluate(() => (document.querySelector('dialog.tc-dialog[open] h2, dialog.tc-dialog[open] .tc-dialog-h, dialog.tc-dialog[open] header') || {}).textContent || '');
const closeDialog = async () => { await page.locator('dialog.tc-dialog[open] button[data-key="cancel"]').first().click(); await page.waitForTimeout(250); };
const act = (a) => page.evaluate((x) => document.querySelector('[data-act="' + x + '"]').click(), a);

try {
  console.log('machine: ' + await machine(page));
  await page.goto(BASE + '/lab/takeoffcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForTimeout(300); }
  await page.setInputFiles('[data-file-pdf]', path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && !!window.takeoffcraft.sheet(), null, { timeout: 30000 });
  await page.waitForTimeout(400);
  const ids = await page.evaluate(() => window.takeoffcraft.model.addItems([
    { name: 'Doors', type: 'count', unit: 'EA', mat: 2500000, lab: 800000 }, { name: 'Permit', type: 'fixed', unit: 'EA', qty: 1, mat: 5000000 }]));
  ok(ids.length === 2, 'two items added');

  // ---- the item library, trade packs, export pack (dialogs) ----
  await page.click('[data-library]');
  await page.waitForSelector('dialog.tc-dialog[open]');
  ok(await open() === 1, 'the library dialog opens');
  const libTitle = await title();
  await page.locator('dialog.tc-dialog[open] button[data-key="packs"]').click();
  await page.waitForTimeout(500);
  ok(await open() === 1 && await title() !== libTitle, 'Trade packs opens its own dialog', await title());
  await closeDialog();
  ok(await open() === 1 && await title() === libTitle, 'closing it brings the library back');
  await page.locator('dialog.tc-dialog[open] button[data-key="export-pack"]').click();
  await page.waitForTimeout(400);
  ok(await open() === 1 && await title() !== libTitle, 'Export pack opens its own dialog', await title());
  await closeDialog();
  ok(await open() === 1 && await title() === libTitle, 'the library is back after Export pack');
  await closeDialog();
  ok(await open() === 0, 'the library closes');

  // ---- Send for bids (bidDialog) ----
  await act('export-bid');
  await page.waitForSelector('dialog.tc-dialog[open] [data-bid]');
  ok(await page.locator('dialog.tc-dialog[open] [data-bid]').count() >= 5, 'the bid dialog opens with its percent fields');
  const before = await page.evaluate(() => window.takeoffcraft.model.bid().overhead ?? null);
  await page.locator('dialog.tc-dialog[open] [data-bid="overhead"]').fill('12.5');
  await page.locator('dialog.tc-dialog[open] [data-bid="overhead"]').dispatchEvent('change');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => window.takeoffcraft.model.bid().overhead ?? null);
  ok(after !== before, 'a bid percent changes the model', before + ' -> ' + after);
  await closeDialog();
  ok(await open() === 0, 'the bid dialog closes');

  // ---- bid leveling (levelDialog) ----
  await act('export-level');
  await page.waitForSelector('dialog.tc-dialog[open] [data-lvl]');
  ok(await page.locator('dialog.tc-dialog[open] [data-lvl]').count() === 1, 'the leveling dialog opens');
  await closeDialog();
  ok(await open() === 0, 'the leveling dialog closes');

  // ---- marks, clipboard (clipboard-ui.js) ----
  const marks = () => page.evaluate(() => window.takeoffcraft.model.state.marks.length);
  await page.evaluate(() => {
    const tc = window.takeoffcraft, m = tc.model, sheet = tc.sheet();
    for (let i = 0; i < 3; i++) m.addMark({ item: m.state.items[0].id, sheet, pts: [{ x: 100 + 40 * i, y: 100 }] });
  });
  ok(await marks() === 3, 'three marks');
  await act('select-all');
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.takeoffcraft.selection().length) === 3, 'Select all picks them');
  await act('copy');
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => !!window.takeoffcraft.clip()), 'Copy fills the clipboard');
  await act('duplicate');
  await page.waitForTimeout(300);
  ok(await marks() === 6 || await page.evaluate(() => window.takeoffcraft.pasting()), 'Duplicate adds the marks (or starts placing them)', String(await marks()));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const afterDup = await marks();
  await act('paste-in-place');
  await page.waitForTimeout(300);
  ok(await marks() > afterDup || await page.evaluate(() => window.takeoffcraft.pasting()), 'Paste in place adds the marks (or starts placing them)', afterDup + ' -> ' + await marks());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  await act('undo');

  // ---- bid areas (areas-ui.js) ----
  await page.selectOption('[data-area-cur]', '__new');
  await page.waitForSelector('dialog.tc-dialog[open]');
  ok(await open() === 1, 'the new-area dialog opens');
  await page.fill('dialog.tc-dialog[open] [data-area-name]', 'Level 1');
  await page.locator('dialog.tc-dialog[open] button[data-key="ok"]').click();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.takeoffcraft.model.state.areas.length) === 1, 'Create makes the area');
  ok(await page.evaluate(() => !!window.takeoffcraft.curArea()), 'it becomes the current area');
  await page.selectOption('[data-area-cur]', '__manage');
  await page.waitForSelector('dialog.tc-dialog[open]');
  ok(await open() === 1, 'the manage-areas dialog opens');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  ok(await open() === 0, 'both close');

  // ---- notes (notes-ui.js) ----
  await page.evaluate(() => document.querySelector('[data-tool="note"]').click());
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'note', 'the Note tool is on');
  const box = await page.locator('[data-over]').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForSelector('dialog.tc-dialog[open] [data-note-text]');
  await page.fill('dialog.tc-dialog[open] [data-note-text]', 'Check this wall');
  await page.locator('dialog.tc-dialog[open] button[data-key="ok"]').click();
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => (window.takeoffcraft.model.state.notes || []).length) === 1, 'the note is added through its dialog');
  await page.keyboard.press('Escape');

  // ---- compare (compare-ui.js): needs a second sheet ----
  await page.setInputFiles('[data-file-pdf]', path.join(REPO, 'fixtures/pdf/scan-filters.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 1, null, { timeout: 30000 });
  await page.waitForTimeout(500);
  const cmp = await page.evaluate(() => {
    const tc = window.takeoffcraft, list = tc.sheets();
    tc.showSheet(list[1].key);
    tc.startCompare(list[0].key);
    return new Promise((r) => setTimeout(() => r({ c: tc.compare(), old: list[0].key }), 800));
  });
  ok(!!cmp.c && cmp.c.old === cmp.old, 'Compare starts against the first sheet', JSON.stringify(cmp.c));
  await page.evaluate(() => window.takeoffcraft.showSheet(window.takeoffcraft.sheets()[0].key));
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => window.takeoffcraft.compare()) === null, 'changing the sheet ends Compare');

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
