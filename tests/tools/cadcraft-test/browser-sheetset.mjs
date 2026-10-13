#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sheetset.mjs — the Sheet Set panel in the lab (0.4 part 2, track Z), headless, on the public fixture
 * (tools/cadcraft-test/fixtures/sheetset, made by make-sheetset.mjs): open the set, the tree with its subsets, double-click
 * opens a drawing at its sheet, rename (F2), drag a sheet into another subset, renumber, set fields, publish (a 6-page PDF
 * with bookmarks), update the drawings (tabs renamed and title blocks filled in the files), a new sheet from a template,
 * undo, the SHEETSET command; both themes; no console errors.
 *
 *   node tools/cadcraft-test/browser-sheetset.mjs [--shots <dir>]
 *
 * The folder: the fixture is copied into the browser's own private file system (navigator.storage.getDirectory()), and
 * window.showDirectoryPicker is replaced to hand that folder to the panel, so the real File System Access reading and
 * writing runs. Run as root (test admin cctest+cadcraft@projectz.xyz via tools/cadcraft-test/admin.php up|down).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const FX = path.join(REPO, 'tools/cadcraft-test/fixtures/sheetset');
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : path.join(REPO, 'tmp/shots/cadcraft-sheetset');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const log = () => page.textContent('[data-history]').catch(() => '');
const menu = async (key) => { await page.click('[data-sheetset-menu] > summary'); await page.click('[data-sheetset-menu] [data-ss="' + key + '"]'); };
const tree = () => page.evaluate(() => [...document.querySelectorAll('[data-sheetset-tree] [role=treeitem]')].map((li) => [li.dataset.kind, li.querySelector('.cc-ss-label').textContent, li.getAttribute('aria-level')]));
const state = () => page.evaluate(() => { const s = window.cadcraft.host.sheetSet.state; return { set: s.set && JSON.parse(JSON.stringify(s.set)), writable: s.writable, file: s.setFile }; });
const opfs = (p) => page.evaluate(async (p) => {   // a file from the browser's folder, as text (or the layouts of a drawing)
  let d = await (await navigator.storage.getDirectory()).getDirectoryHandle('Clinic');
  const parts = p.split('/');
  for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x);
  return await (await (await d.getFileHandle(parts[parts.length - 1])).getFile()).text();
}, p);

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host.sheetSet);

  console.log('\n== the folder: the fixture in the browser\'s own file system');
  const files = {};
  const walk = (dir, pre = '') => { for (const n of fs.readdirSync(dir)) { const f = path.join(dir, n); if (fs.statSync(f).isDirectory()) walk(f, pre + n + '/'); else files[pre + n] = fs.readFileSync(f).toString('base64'); } };
  walk(FX);
  await page.evaluate(async (files) => {
    const root = await navigator.storage.getDirectory();
    try { await root.removeEntry('Clinic', { recursive: true }); } catch { /* first run */ }
    const top = await root.getDirectoryHandle('Clinic', { create: true });
    for (const [p, b64] of Object.entries(files)) {
      let d = top;
      const parts = p.split('/');
      for (const x of parts.slice(0, -1)) d = await d.getDirectoryHandle(x, { create: true });
      const w = await (await d.getFileHandle(parts[parts.length - 1], { create: true })).createWritable();
      await w.write(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
      await w.close();
    }
    window.showDirectoryPicker = async () => top;   // the "folder the person picks"
  }, files);
  ok(true, 'fixture copied: ' + Object.keys(files).length + ' files');

  console.log('\n== open the set');
  ok(await page.isVisible('[data-sheetset-sec]') && await page.isVisible('[data-sheetset-empty]'), 'the left panel has a Sheet set section, empty at first');
  await menu('open');
  await page.waitForFunction(() => !!window.cadcraft.host.sheetSet.state.set);
  const t0 = await tree();
  ok(t0.length === 11 && t0[0][1] === 'Riverside Clinic' && t0.filter((x) => x[0] === 'sheet').length === 6 && t0.some((x) => x[0] === 'subset' && x[1] === 'Plans' && x[2] === '3'), 'the tree: the set, Architectural › Plans / Details, Structural, six sheets', JSON.stringify(t0));
  ok(/Opened the sheet set Riverside Clinic: 6 sheets/.test(await log()), 'the history says what opened');
  await page.screenshot({ path: path.join(SHOTS, '01-set-paper.png') });

  console.log('\n== double-click opens a drawing at its sheet');
  await page.dblclick('[data-sheetset-tree] [data-id="c1"]');
  await page.waitForFunction(() => window.cadcraft.doc.layout?.name === 'Ceiling 1', null, { timeout: 15000 });
  ok(await page.evaluate(() => window.cadcraft.doc.meta.name === 'Level 1' && window.cadcraft.doc.layouts.length === 2), 'A-201 opens Level 1.dwg on its sheet "Ceiling 1"');

  console.log('\n== rename (F2), drag into another subset, renumber, set fields');
  await page.click('[data-sheetset-tree] [data-id="p1"]');
  await page.keyboard.press('F2');
  await page.waitForSelector('dialog.cc-ss-dialog[open]');
  await page.fill('dialog.cc-ss-dialog [data-key="title"]', 'Ground floor plan');
  await page.click('dialog.cc-ss-dialog [data-key="ok"]');
  await page.waitForTimeout(300);
  const saved1 = JSON.parse(await opfs('Clinic.ccsheets'));
  ok(saved1.subsets[0].subsets[0].sheets[0].title === 'Ground floor plan', 'F2 renames the sheet, and the set file in the folder is saved at once');
  const drag = async (from, to) => { await page.dragAndDrop('[data-sheetset-tree] [data-id="' + from + '"]', '[data-sheetset-tree] [data-id="' + to + '"] > .cc-ss-label'); await page.waitForTimeout(250); };
  await drag('rf', 'str');
  let st = await state();
  ok(st.set.subsets[1].sheets.some((s) => s.id === 'rf') && !st.set.subsets[0].subsets[0].sheets.some((s) => s.id === 'rf'), 'dragging "Roof" onto Structural moves it there');
  await page.click('[data-sheetset-tree] [data-id="rf"]');
  await page.keyboard.press('Alt+ArrowUp');
  await page.waitForTimeout(200);
  st = await state();
  ok(st.set.subsets[1].sheets[0].id === 'rf', 'Alt+↑ moves it up within its subset');
  await menu('undo'); await menu('undo');
  await page.waitForTimeout(200);
  st = await state();
  ok(st.set.subsets[0].subsets[0].sheets.some((s) => s.id === 'rf'), 'Undo set change (twice) puts it back');
  await menu('renumber');
  await page.waitForSelector('dialog.cc-ss-dialog[open]');
  await page.selectOption('dialog.cc-ss-dialog [data-key="which"]', 'all');
  await page.fill('dialog.cc-ss-dialog [data-key="prefix"]', 'B-');
  await page.fill('dialog.cc-ss-dialog [data-key="start"]', '1');
  await page.click('dialog.cc-ss-dialog [data-key="ok"]');
  await page.waitForTimeout(200);
  st = await state();
  const nums = [...st.set.subsets[0].subsets[0].sheets, ...st.set.subsets[0].subsets[1].sheets, ...st.set.subsets[1].sheets].map((s) => s.number);
  ok(nums.join() === 'B-1,B-2,B-3,B-4,B-5,B-6', 'Renumber sheets: B-1 … B-6 in set order', nums.join());
  await menu('props');
  await page.waitForSelector('dialog.cc-ss-dialog[open]');
  await page.fill('dialog.cc-ss-dialog [data-key="PROJECTNUMBER"]', '2026-099');
  await page.fill('dialog.cc-ss-dialog [data-key="custom"]', 'CLIENT = Example Health Co.\nPHASE = Permit');
  await page.click('dialog.cc-ss-dialog [data-key="ok"]');
  await page.waitForTimeout(200);
  st = await state();
  ok(st.set.properties.PROJECTNUMBER === '2026-099' && st.set.properties.PHASE === 'Permit', 'Set fields: project number and your own fields', JSON.stringify(st.set.properties));

  console.log('\n== publish the set');
  await page.click('[data-sheetset-tree] [data-id="set"] > .cc-ss-label');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), menu('publish')]);
  const pdf = path.join(os.tmpdir(), 'cc-sheetset-' + process.pid + '.pdf');
  fs.writeFileSync(pdf, fs.readFileSync(await dl.path()));
  let pages = '';
  try { pages = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' }); } catch { pages = ''; }
  const text = (() => { try { return execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' }); } catch { return ''; } })();
  ok(dl.suggestedFilename() === 'Riverside Clinic.pdf' && /Pages:\s+6/.test(pages) && /B-1/.test(text.split('\f')[0]) && /Ground floor plan/.test(text.split('\f')[0]) && /2026-099/.test(text.split('\f')[4]),
    'Publish downloads Riverside Clinic.pdf: 6 pages, title blocks from the set (B-1 Ground floor plan; 2026-099 in the alias block)', dl.suggestedFilename() + ' ' + (pages.match(/Pages:\s+\d+/) || [''])[0]);
  fs.rmSync(pdf, { force: true });
  ok(/Published 6 pages as Riverside Clinic\.pdf/.test(await log()), 'the history says so');

  console.log('\n== update the drawings (title blocks and tabs written into the files)');
  await menu('update');
  await page.waitForSelector('dialog.cc-ask[open]');
  await page.click('dialog.cc-ask[open] button[data-key="ok"]');
  await page.waitForFunction(() => /Updated 3 drawings/.test(document.querySelector('[data-history]').textContent), null, { timeout: 60000 });
  st = await state();
  ok(st.set.subsets[0].subsets[0].sheets[0].layout === 'B-1 Ground floor plan', 'the set points at the renamed tab', st.set.subsets[0].subsets[0].sheets[0].layout);
  await page.dblclick('[data-sheetset-tree] [data-id="p1"]');
  await page.waitForFunction(() => window.cadcraft.doc.layout?.name === 'B-1 Ground floor plan', null, { timeout: 15000 });
  const tb = await page.evaluate(() => [...window.cadcraft.doc.layout.entities.values()].find((e) => e.type === 'insert')?.attrs);
  ok(tb?.SHEETNUMBER === 'B-1' && tb.SHEETTITLE === 'Ground floor plan' && tb.PROJECTNAME === 'Riverside Clinic', 'Level 1.dwg reopened from the folder: tab "B-1 Ground floor plan", its title block filled', JSON.stringify(tb));
  await page.screenshot({ path: path.join(SHOTS, '02-updated-sheet-paper.png') });

  console.log('\n== a new sheet from a template, the SHEETSET command');
  await page.click('[data-sheetset-tree] [data-id="det"] > .cc-ss-label');
  await menu('newsheet');
  await page.waitForSelector('dialog.cc-ss-dialog[open]');
  await page.fill('dialog.cc-ss-dialog [data-key="number"]', 'B-7');
  await page.fill('dialog.cc-ss-dialog [data-key="title"]', 'Stair details');
  await page.selectOption('dialog.cc-ss-dialog [data-key="template"]', 'details/Details.dwg|');
  await page.click('dialog.cc-ss-dialog [data-key="ok"]');
  await page.waitForFunction(() => /Made details\/B-7 Stair details\.dwg/.test(document.querySelector('[data-history]').textContent), null, { timeout: 30000 });
  st = await state();
  const nw = st.set.subsets[0].subsets[1].sheets.find((s) => s.number === 'B-7');
  ok(nw && nw.file === 'details/B-7 Stair details.dwg' && nw.layout === 'B-7 Stair details' && st.set.template?.file === 'details/Details.dwg', 'New sheet: a new drawing from the template\'s sheet, in the Details subset; the set remembers the template', JSON.stringify([nw, st.set.template]));
  await page.click('[data-cmd-input]'); await page.keyboard.type('SSM'); await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  ok(/The sheet set Riverside Clinic is in the left panel/.test(await log()), 'SSM (SHEETSET) points at the panel');
  await page.goto(BASE + '/lab/cadcraft?space=model', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host.sheetSet);
  await page.evaluate(async () => { const top = await (await navigator.storage.getDirectory()).getDirectoryHandle('Clinic'); window.showDirectoryPicker = async () => top; });
  await menu('open');
  await page.waitForFunction(() => !!window.cadcraft.host.sheetSet.state.set);
  ok((await tree()).filter((x) => x[0] === 'sheet').length === 7, 'reopened after a reload (model theme): seven sheets, the new one kept');
  await page.screenshot({ path: path.join(SHOTS, '03-set-model.png') });
  console.log('\n== opening an Archicad project or a set file through Open (N.4)');
  await page.setInputFiles('[data-file]', { name: 'Office.pln', mimeType: 'application/octet-stream', buffer: Buffer.from('not a drawing') });
  await page.waitForSelector('dialog.cc-ask[open]');
  const msg = (await page.textContent('dialog.cc-ask[open]')).replace(/\s+/g, ' ');
  ok(/Office\.pln is an Archicad project/.test(msg) && /DWG/.test(msg) && /IFC for BimCraft/.test(msg), 'a .pln says what it is and how to get a drawing or a model out of it', msg.slice(0, 200));
  await page.click('dialog.cc-ask[open] button[data-key="ok"]');
  await page.setInputFiles('[data-file]', { name: 'Clinic.ccsheets', mimeType: 'application/json', buffer: Buffer.from('{}') });
  await page.waitForTimeout(300);
  ok(/Clinic\.ccsheets is a sheet set/.test(await log()), 'a .ccsheets opened through Open points to the Sheet set panel');
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  await page.screenshot({ path: path.join(SHOTS, 'error.png') }).catch(() => {});
} finally {
  await page.evaluate(async () => { try { await (await navigator.storage.getDirectory()).removeEntry('Clinic', { recursive: true }); } catch { /* gone */ } }).catch(() => {});
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
