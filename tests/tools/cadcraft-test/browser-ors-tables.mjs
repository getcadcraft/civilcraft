#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ors-tables.mjs — tables, data extraction and fields (1.0 ORS.1, ORS.11, ORS.22) in the lab, headless: the page loads
 * with the new modules, TABLE at the command line, a double-click on a cell opens the cell editor (Enter keeps, Tab goes on,
 * a formula), the More-menu entries, Ctrl+V with spreadsheet cells, FIELD and the light background's boxes, DWGPROPS through
 * the Drawing details store, DATAEXTRACTION to a table, Save as DWG and open again.
 *
 *   node tools/cadcraft-test/browser-ors-tables.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)) : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-ors-tables-'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); } catch { /* no storage */ } });   // the first-drawing tour and the "new here" offer would sit over the command line
const page = await ctx.newPage();
const problems = [];
// a 429 is the site's own rate limit answering a shell call (hardware specs, analytics) when many headless runs share this machine's address: not the app's error
page.on('console', (m) => { if (m.type() === 'error' && !/status of 429/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const history = () => page.evaluate(() => [...document.querySelectorAll('.cc-history li')].map((li) => li.textContent));
/** The drawing's tables: what each shows, its record's cells, its place, and the texts its block draws. */
const tables = () => page.evaluate(async () => {
  const C = await import('/assets/apps/cadcraft/dev/tables-cad.js');
  const doc = window.cadcraft.doc;
  return C.tablesOf(doc).map((t) => ({ id: t.ent.id, x: t.ent.x, y: t.ent.y, kinds: t.rec.kinds, cells: t.rec.cells, shown: C.tableShown(doc, t.ent), note: t.rec.note || '',
    drawn: (doc.blocks.get(t.ent.block)?.entities || []).filter((e) => e.type === 'text').map((e) => e.s) }));
});
/** Page coordinates of the middle of a table's cell. */
const cellAt = (id, r, c) => page.evaluate(async ([id, r, c]) => {
  const C = await import('/assets/apps/cadcraft/dev/tables-cad.js');
  const { doc, view } = window.cadcraft, k = C.cellCorners(doc, doc.get(id), r, c);
  const mid = { x: (k[0].x + k[2].x) / 2, y: (k[0].y + k[2].y) / 2 }, s = view.toScreen(mid.x, mid.y), box = document.querySelector('.cc-over, canvas.cc-over, [data-over]')?.getBoundingClientRect() || view.over.getBoundingClientRect();
  return { x: box.left + s.x + (view.x0 || 0), y: box.top + s.y + (view.y0 || 0) };
}, [id, r, c]);

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  ok(problems.length === 0, 'the lab opens with the table, data extraction and field modules, no console errors', problems.join(' | '));

  console.log('\n== TABLE and the cell editor');
  await typeCmd('TABLE'); await typeCmd('2'); await typeCmd('3'); await typeCmd('2.5'); await typeCmd('0,100');
  let ts = await tables();
  ok(ts.length === 1 && ts[0].kinds === 'thdd' && ts[0].cells[0].length === 3, 'TABLE 2 3 at the command line places a table', ts);
  await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(300);
  await shot('ors-tables-01-table');
  const id = ts[0].id;
  let p = await cellAt(id, 2, 0);
  await page.mouse.dblclick(p.x, p.y); await page.waitForTimeout(300);
  ok(await page.locator('[data-tables-cell-edit="A3"] textarea').count() === 1, 'a double-click on a cell opens the cell editor over it');
  await page.keyboard.type('12'); await shot('ors-tables-01b-cell-editor'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
  ok(await page.locator('[data-tables-cell-edit="B3"] textarea').count() === 1, 'Tab keeps the text and opens the next cell');
  await page.keyboard.type('30'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
  await page.keyboard.type('=A3+B3'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ts = await tables();
  ok(ts[0].cells[2].join() === '12,30,=A3+B3' && ts[0].shown[2][2] === '42' && ts[0].drawn.includes('42'), 'typed cells and a formula: the table draws 42', ts[0].cells[2]);
  ok(await page.locator('[data-tables-cell-edit]').count() === 0 && (await history()).some((l) => /C3 = 42/.test(l)), 'Enter closes the editor; the command line says the value');
  p = await cellAt(id, 3, 1);
  await page.mouse.dblclick(p.x, p.y); await page.waitForTimeout(300);
  await page.keyboard.type('gone'); await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  ts = await tables();
  ok(ts[0].cells[3][1] === '' && await page.locator('[data-tables-cell-edit]').count() === 0, 'Esc leaves the cell as it was');
  await shot('ors-tables-02-cells');
  ok(await page.locator('[data-cmd="TABLE"]').count() >= 1 && await page.locator('[data-cmd="DATAEXTRACTION"]').count() >= 1 && await page.locator('[data-cmd="FIELD"]').count() >= 1, 'TABLE, DATAEXTRACTION and FIELD have their More-menu entries');

  console.log('\n== spreadsheet cells from the clipboard');
  await page.evaluate(() => { window.cadcraft.host.setSelection(new Set()); });
  await page.click('[data-cmd-input]');
  await page.evaluate(() => {
    const input = document.querySelector('[data-cmd-input]');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', ctrlKey: true, bubbles: true, cancelable: true }));
    const dt = new DataTransfer(); dt.setData('text/plain', 'Mark\tWidth\r\nD1\t900\r\nD2\t800\r\n');
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await page.waitForTimeout(400);
  await typeCmd('300,100');
  ts = await tables();
  ok(ts.length === 2 && ts[1].kinds === 'hdd' && ts[1].cells[2].join() === 'D2,800', 'Ctrl+V with spreadsheet cells on the clipboard makes a table (first row the header)', ts[1] || (await history()).slice(-4));

  // which copy is newer: CadCraft's own copy puts one line on the system clipboard, so cells found there later win
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const pasteCells = () => page.evaluate(() => {
    const input = document.querySelector('[data-cmd-input]');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', code: 'KeyV', ctrlKey: true, bubbles: true, cancelable: true }));
    const dt = new DataTransfer(); dt.setData('text/plain', 'a\tb\r\n1\t2\r\n');
    input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  });
  await page.evaluate((id) => { window.cadcraft.host.setSelection(new Set([id])); }, id);
  await typeCmd('COPYCLIP'); await page.waitForTimeout(500);
  const mark = await page.evaluate(async () => ({ text: await navigator.clipboard.readText().catch(() => '(not readable)'), win: window.cadcraft.host.tablesCellsWin() }));
  if (mark.text === '(not readable)' || !mark.win) console.log('  note: this browser did not let the page write the system clipboard (' + mark.text + '): CadCraft\'s own copy wins, as before');
  else {
    ok(/^CadCraft: 1 objects copied/.test(mark.text), 'COPYCLIP also puts one line on the system clipboard', mark.text);
    await page.click('[data-cmd-input]'); await pasteCells(); await page.waitForTimeout(400);
    ok(await page.evaluate(() => window.cadcraft.engine.running) === 'TABLEPASTE', 'cells copied after CadCraft\'s own copy: Ctrl+V makes a table of them');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  }
  await page.evaluate(() => { localStorage.removeItem('cadcraft.tables.clipSynced'); });   // as when the line could not be written
  await page.click('[data-cmd-input]'); await pasteCells(); await page.waitForTimeout(500);
  ok(await page.evaluate(() => window.cadcraft.engine.running) === 'PASTECLIP' && (await history()).some((l) => /also holds spreadsheet cells/.test(l)), 'when CadCraft cannot tell which copy is newer its own copy is pasted, and it says how to make the table', (await history()).slice(-3));
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  await page.evaluate(() => { window.cadcraft.host.setSelection(new Set()); });

  console.log('\n== fields');
  await typeCmd('FIELD'); await typeCmd('F'); await typeCmd('N'); await typeCmd(''); await typeCmd('2.5'); await typeCmd('0,150');
  let f = await page.evaluate(async () => {
    const F = await import('/assets/apps/cadcraft/dev/fields-cad.js');
    const doc = window.cadcraft.doc, tx = doc.all().find((e) => e.type === 'text');
    return { s: tx?.s, src: F.fieldOf(tx)?.src, marks: F.fieldMarks(doc).length, name: doc.meta.name };
  });
  ok(f.src === '%<filename>%' && f.s === String(f.name).replace(/\.(dwg|dxf)$/i, '') && f.marks === 1, 'FIELD Filename: a text that reads the drawing\'s name, with one box for its light background', f);
  await typeCmd('DWGPROPS'); await typeCmd('T'); await typeCmd('Browser check'); await typeCmd('X'); await page.waitForTimeout(600);
  await typeCmd('FIELD'); await typeCmd('P'); await typeCmd('title'); await typeCmd(''); await typeCmd('2.5'); await typeCmd('0,170');
  f = await page.evaluate(async () => {
    const F = await import('/assets/apps/cadcraft/dev/fields-cad.js');
    const doc = window.cadcraft.doc, txs = doc.all().filter((e) => e.type === 'text');
    return { s: txs[1]?.s, title: F.propsOf(doc).title, meta: doc.meta.docinfo?.title, shell: !!window.ccDocInfo };
  });
  ok(f.s === 'Browser check' && f.title === 'Browser check', 'DWGPROPS Title, then a field that reads it', f);
  ok(!f.shell || f.meta === 'Browser check', 'the title is the Drawing details panel\'s title (kept in the drawing)', f);
  await page.evaluate(() => { window.cadcraft.host.setSelection(new Set()); });
  await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(400);
  await shot('ors-tables-03-fields');

  console.log('\n== data extraction');
  await page.evaluate(() => {
    const doc = window.cadcraft.doc;
    doc.change('test blocks', () => {
      doc.defineBlock({ name: 'DOOR', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 9, y2: 0 }], attdefs: [{ tag: 'MARK', prompt: 'MARK', def: '', x: 0, y: 2, h: 2.5, rot: 0, ha: 'left', va: 'baseline', wf: 1, layer: '0', color: null }] });
      for (const [x, mark] of [[0, 'D1'], [30, 'D1'], [60, 'D2']]) doc.add({ type: 'insert', layer: '0', block: 'DOOR', x, y: -50, sx: 1, sy: 1, rot: 0, attrs: { MARK: mark } });
    });
    window.cadcraft.host.setSelection(new Set());
  });
  await typeCmd('DATAEXTRACTION'); await typeCmd(''); await typeCmd('B'); await typeCmd(''); await typeCmd('Y'); await typeCmd('T'); await typeCmd('0,-100');
  ts = await tables();
  const ex = ts.find((t) => t.note === 'extract');
  ok(ex && JSON.stringify(ex.shown) === JSON.stringify([['Count', 'Name', 'MARK'], ['2', 'DOOR', 'D1'], ['1', 'DOOR', 'D2']]), 'DATAEXTRACTION Blocks, grouped, to a table', ex ? ex.shown : (await history()).slice(-6));

  console.log('\n== save as DWG and open again');
  const before = await tables();
  const bytes = await page.evaluate(async () => {
    const S = await import('/assets/apps/cadcraft/dev/dwg-save.js');
    return Array.from(S.saveDwg(window.cadcraft.doc, { version: '2018' }).bytes);
  });
  const after = await page.evaluate(async (arr) => {
    const R = await import('/assets/apps/cadcraft/dev/dwg/read.js'), I = await import('/assets/apps/cadcraft/dev/dwg-import.js'), D = await import('/assets/apps/cadcraft/dev/doc.js');
    const C = await import('/assets/apps/cadcraft/dev/tables-cad.js'), F = await import('/assets/apps/cadcraft/dev/fields-cad.js');
    const m = R.readDwg(new Uint8Array(arr)), d = new D.Doc();
    d.load(I.importDwg(m, { versionTag: 'AC1032' }));
    return { real: m.blocks.flatMap((b) => b.entities).filter((e) => e.type === 'ACAD_TABLE').length, tables: C.tablesOf(d).map((t) => t.rec.cells), fields: d.all().filter((e) => F.fieldOf(e)).length };
  }, bytes);
  ok(after.real === before.length && JSON.stringify(after.tables) === JSON.stringify(before.map((t) => t.cells)) && after.fields === 2, 'saved as DWG 2018 in the page: ' + before.length + ' real table objects, opened again with the same cells and both fields', after.real + ' / ' + after.fields);
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e.message));
  await shot('error').catch(() => {});
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
