#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-paths.mjs — assistants naming files by path in a real CadCraft window (0.7 MCP-PATHS, MCP-ANSWERS, MCP-COUNT;
 * session assistants).
 *
 *   node tools/mcp/test/browser-paths.mjs [--shots <dir>] [--verbose]      (run as root)
 *
 * Studio stood in twice: a desktop bridge (window.cadcraftDesktop: read/write/stat/list/folder dialog, backed by a temp
 * folder in Node and refusing what was not granted, as desktop-shell's files.rs does) and the window channel the control
 * requests come through. Checks Settings › Assistants › Folders (add, the list, remove), files_list, drawing_open by path,
 * drawing_save to a path in a DWG version, drawing_plot to a path, command_run with saveTo (COUNT's CSV) and openFiles
 * (INSERT F answered on the command line), script_run with a .lsp path, refusals outside the folders and without the
 * permission, and no console errors. Own test admin agentstest+cadcraft@projectz.xyz (tools/mcp/test/admin.php).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const { studioStandIn } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/test/studio-stand-in.mjs')).href);
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const VERBOSE = args.includes('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 500) : '')); } };

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-paths-'));
const JOB = path.join(TMP, 'job'), OUT = path.join(TMP, 'job', 'out'), ELSEWHERE = path.join(TMP, 'elsewhere');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(ELSEWHERE);
fs.copyFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dxf'), path.join(JOB, 'base-plan.dxf'));
fs.copyFileSync(path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'), path.join(JOB, 'kitchen.dwg'));
fs.copyFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dxf'), path.join(ELSEWHERE, 'secret.dxf'));
fs.copyFileSync(path.join(REPO, 'fixtures/dwg/base-plan.dxf'), path.join(JOB, 'theirs.dxf'));
fs.writeFileSync(path.join(JOB, 'tidy.lsp'), '(command "LINE" "0,0" "@50,0" "")\n(command "CIRCLE" "25,25" "5")\n');

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/mcp/test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Studio stood in: the desktop bridge (grants as files.rs) and the window channel (studio-stand-in.mjs)
const S = await studioStandIn(page, { app: 'cadcraft', folder: JOB });
const { rpc, call, dialogs } = S;
const text = (r) => (r && r.content && r.content[0] && r.content[0].text) || '';
const sc = (r) => (r && r.structuredContent) || {};

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.assistants.cadcraft'); } catch { /* fine */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await wait(300);

  console.log('\n== Settings › Assistants › Folders');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  const tab = await page.$('[data-app-settings] [role="tab"]');
  if (tab) await tab.click();
  const before = await page.evaluate(() => ({ add: !document.querySelector('[data-assist-folder-add]').hidden, disabled: document.querySelector('[data-assist-folder-add]').disabled, none: document.querySelector('[data-assist-folders] .shell-assist-empty')?.textContent, head: document.querySelector('[data-assist-folders-head]').textContent }));
  ok(before.add && before.disabled && /No folders/.test(before.none || '') && before.head === 'Folders it may use', 'Studio: Folders shows, empty, Add disabled while assistants are off', before);
  await page.click('[data-assist-on]');
  for (const g of ['edit', 'save']) await page.click('[data-assist-group="' + g + '"]');
  await page.click('[data-assist-folder-add]');
  await wait(400);
  const after = await page.evaluate(() => ({ list: [...document.querySelectorAll('.shell-assist-folder-path')].map((x) => x.textContent), stored: JSON.parse(localStorage.getItem('cadcraft.assistants.cadcraft') || 'null') }));
  ok(dialogs.includes('folder') && after.list.join() === JOB && after.stored && after.stored.folders.join() === JOB, 'Add a folder… asks with the desktop dialog; the folder is listed and kept', after);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-folders.png') });
  await page.keyboard.press('Escape');

  console.log('\n== tools by path');
  const tools = (await rpc('tools/list', {})).result.tools.map((t) => t.name);
  ok(['files_list', 'drawing_open', 'script_run'].every((n) => tools.includes(n)), 'files_list, drawing_open and script_run are listed', tools);
  let r = await call('files_list', { extensions: ['dwg', 'dxf'] });
  ok(!r.isError && sc(r).files.map((f) => path.basename(f.path)).sort().join() === 'base-plan.dxf,kitchen.dwg,theirs.dxf', 'files_list: the drawings in the folder', r);
  r = await call('drawing_open', { path: path.join(ELSEWHERE, 'secret.dxf') });
  ok(r.isError && /outside the folders/.test(text(r)), 'a path outside the folders is refused before the bridge is asked', r);
  r = await call('drawing_open', { path: 'base-plan.dxf' });
  const src = await page.evaluate(() => window.cadcraft.doc.meta.source);
  ok(!r.isError && sc(r).name === 'base-plan' && src === 'base-plan.dxf' && !dialogs.includes('open'), 'drawing_open: base-plan.dxf opens in the window, no dialog', { r, src });
  const objs = sc(r).objects;

  r = await call('drawing_save', { path: 'out/plan-2013.dwg', version: '2013' });
  const saved = path.join(OUT, 'plan-2013.dwg');
  ok(!r.isError && fs.existsSync(saved) && fs.readFileSync(saved).subarray(0, 6).toString() === 'AC1027' && sc(r).saved === true, 'drawing_save to a path in DWG 2013: written there (AC1027), the drawing saved', r);
  r = await call('drawing_save', {});
  ok(!r.isError && sc(r).saved && !dialogs.includes('save') && !dialogs.includes('open'), 'the next plain save goes to that file too (no dialog)', { r, dialogs });
  const theirs = fs.readFileSync(path.join(JOB, 'theirs.dxf'));
  r = await call('drawing_save', { path: 'theirs.dxf' });
  ok(/already exists/.test(JSON.stringify(r)) && fs.readFileSync(path.join(JOB, 'theirs.dxf')).equals(theirs), 'saving over a file the assistant neither opened nor wrote needs overwrite (the file is untouched)', r);
  r = await call('drawing_plot', { path: 'out/plan.pdf', paper: 'iso-a3' });
  ok(r.isError && /needs the export permission/.test(text(r)), 'drawing_plot is refused without export', r);

  r = await call('command_run', { input: ['COUNT', 'E', 'C'], saveTo: 'out/counts.csv' });
  ok(r.isError && /needs the export permission/.test(text(r)), 'saveTo a CSV without export is refused', r);
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cadcraft.assistants.cadcraft')); s.groups.push('export'); localStorage.setItem('cadcraft.assistants.cadcraft', JSON.stringify(s)); });
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  if (tab) await (await page.$('[data-app-settings] [role="tab"]')).click();
  await page.click('[data-assist-group="export"]');
  await page.keyboard.press('Escape');
  r = await call('command_run', { input: ['COUNT', 'E', 'C'], saveTo: 'out/counts.csv' });
  ok(!r.isError && fs.existsSync(path.join(OUT, 'counts.csv')) && (sc(r).filesWritten || [])[0] === path.join(OUT, 'counts.csv'), 'COUNT export with saveTo: the CSV is written there, no download', r);
  r = await call('drawing_plot', { path: 'out/plan.pdf', paper: 'iso-a3' });
  ok(!r.isError && fs.readFileSync(path.join(OUT, 'plan.pdf')).subarray(0, 5).toString() === '%PDF-', 'drawing_plot to a path writes the PDF there', r);

  const n0 = await page.evaluate(() => window.cadcraft.doc.count());
  r = await call('command_run', { input: ['INSERT', 'F', 'W', 'R', '0,0', '1', '0'], openFiles: ['kitchen.dwg'] });
  const ins = await page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.block === 'kitchen').length);
  ok(!r.isError && ins === 1 && (sc(r).filesOpened || [])[0] === path.join(JOB, 'kitchen.dwg') && /^Assistant: /.test(sc(r).undo || ''), 'INSERT F with openFiles: the whole drawing answered on the command line (no block dialog), one undo step', { r: sc(r), ins });
  ok(!(await page.evaluate(() => !!document.querySelector('dialog[open]'))), 'no dialog left open on the page');

  r = await call('script_run', { path: 'tidy.lsp' });
  const n1 = await page.evaluate(() => window.cadcraft.doc.count());
  ok(!r.isError && sc(r).added.length === 2 && sc(r).undo === 'Assistant: SCRIPT' && sc(r).printed.filter((l) => /Command: LINE/.test(l)).length === 1, 'script_run with a .lsp path: loaded as APPLOAD does, one undo step', r);
  r = await call('script_run', { path: '../elsewhere/x.lsp' });
  ok(r.isError && /not a usable path/.test(text(r)), 'script_run refuses ".."', r);
  ok(n1 > n0 && objs > 0, 'the drawing grew by the assistant\'s work');

  console.log('\n== a command left open (MCP-ANSWERS), a count (MCP-COUNT)');
  r = await call('command_run', { input: ['PLINE', '0,200', '40,200'], keepOpen: true });
  ok(!r.isError && sc(r).waiting && sc(r).waiting.open && (await page.evaluate(() => window.cadcraft.engine.running)) === 'PLINE', 'keepOpen: PLINE waits in the window', r);
  r = await call('command_run', { input: ['40,240', ''], continue: true });
  ok(!r.isError && sc(r).added.length === 1 && !(await page.evaluate(() => window.cadcraft.engine.busy)), 'continue: the assistant\'s own open command is not "the person is busy"; it finishes', r);
  r = await call('command_run', { input: 'CIRCLE 0,0 5' });
  ok(!r.isError && sc(r).added.length === 1, 'one typed string: CIRCLE 0,0 5', r);
  r = await call('objects_list', { type: 'circle', countOnly: true });
  ok(!r.isError && sc(r).total >= 2 && !sc(r).objects && sc(r).byType.circle === sc(r).total, 'objects_list countOnly in the window', r);

  console.log('\n== insert with attributes, SVG (MCP-HEADLESS in the window)');
  r = await call('block_insert', { block: 'itemtag-rect', at: [0, -300], layer: 'TAGS', attributes: { 'KCL-ITEM': '101', 'KCL-MODEL': 'XR 40 B' } });
  const tbk = r && sc(r).id ? await page.evaluate((id) => window.cadcraft.doc.get(id), sc(r).id) : null;
  ok(!r.isError && tbk && tbk.layer === 'TAGS' && tbk.attrs['KCL-ITEM'] === '101' && tbk.attrs['KCL-MODEL'] === 'XR 40 B' && sc(r).undo === 'Assistant: INSERT ITEMTAG-RECT', 'block_insert in the window: on its layer with its values, one undo step', r);
  r = await call('drawing_plot', { path: 'out/plan.svg' });
  ok(!r.isError && /<svg /.test(fs.readFileSync(path.join(OUT, 'plan.svg'), 'utf8')), 'drawing_plot to an .svg path', r);

  console.log('\n== remove the folder');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  if (tab) await (await page.$('[data-app-settings] [role="tab"]')).click();
  await page.click('[data-assist-folder-remove]');
  await page.keyboard.press('Escape');
  r = await call('files_list', {});
  ok(r.isError || sc(r).files.length === 0, 'with no folder, files_list finds nothing', r);
  r = await call('drawing_open', { path: path.join(JOB, 'base-plan.dxf') });
  ok(r.isError && /not given assistants any folder/.test(text(r)), 'and a path is refused again', r);
  ok(!problems.length, 'no console errors', problems.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* fine */ }
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
