#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bomzones.mjs — bills of materials by zone (0.9.1, suggestion #1503) in the lab, headless: blocks with attributes, two
 * zones and two tables made with the typed commands, a block moved from one zone to the other with MOVE (both tables change,
 * one undo step), the BOMEDIT dialog (a column unticked, a heading renamed, a remark, totals, CSV), the ribbon and More-menu
 * entries, then Save as DWG and DXF, reopened, with the tables still live.
 *
 *   node tools/cadcraft-test/browser-bomzones.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
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
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-bom-'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const history = () => page.evaluate(() => [...document.querySelectorAll('.cc-history li')].map((li) => li.textContent));
const download = async (action) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), action()]);
  const file = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(file);
  return { name: dl.suggestedFilename(), bytes: fs.readFileSync(file), file };
};
/** What the drawing holds: zones, and per table its zone's name, the texts drawn in its block and its record. */
const state = () => page.evaluate(async () => {
  const B = await import('/assets/apps/cadcraft/dev/bomzones-cad.js');
  const doc = window.cadcraft.doc, reg = B.bomScan(doc);
  return { steps: doc.undoStack.length, zones: reg.zones.map((z) => z.name), labels: reg.labels.map((l) => l.ent.s),
    tables: reg.tables.map((t) => { const v = B.tableView(doc, t.id); return { id: t.id, entId: t.ent.id, zone: v.zone ? v.zone.name : '', lost: v.lost, frozen: v.table.frozen,
      columns: v.result ? v.result.columns.map((c) => c.label) : [], rows: v.result ? v.result.rows.map((r) => r.cells.join('|')) : [], totals: v.result?.totals || null,
      drawn: (doc.blocks.get(t.ent.block)?.entities || []).filter((e) => e.type === 'text').map((e) => e.s), lines: (doc.blocks.get(t.ent.block)?.entities || []).filter((e) => e.type === 'line').length }; }) };
});
const tableOf = (s, zone) => s.tables.find((t) => t.zone === zone);

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('\n== blocks with attributes');
  await page.evaluate(() => {
    const doc = window.cadcraft.doc;
    const att = (tag, def, y) => ({ tag, prompt: tag, def, x: 6, y, h: 3, rot: 0, ha: 'left', va: 'baseline', wf: 1, layer: '0', color: null });
    doc.change('test blocks', () => {
      doc.defineBlock({ name: 'VALVE', base: { x: 0, y: 0 }, entities: [{ type: 'poly', layer: '0', closed: true, pts: [{ x: -5, y: -3, b: 0 }, { x: 5, y: 3, b: 0 }, { x: 5, y: -3, b: 0 }, { x: -5, y: 3, b: 0 }] }], attdefs: [att('TAG', '', 4), att('SIZE', 'DN50', -1), att('MATERIAL', 'Brass', -6)] });
      doc.defineBlock({ name: 'PUMP', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', cx: 0, cy: 0, r: 5 }], attdefs: [att('TAG', '', 4), att('MATERIAL', 'Cast iron', -6)] });
      const ins = (block, x, y, attrs) => doc.add({ type: 'insert', layer: '0', block, x, y, sx: 1, sy: 1, rot: 0, attrs });
      ins('VALVE', 30, 60, { TAG: 'V-101', SIZE: 'DN50', MATERIAL: 'Brass' }); ins('VALVE', 70, 60, { TAG: 'V-102', SIZE: 'DN50', MATERIAL: 'Brass' }); ins('VALVE', 110, 60, { TAG: 'V-103', SIZE: 'DN80', MATERIAL: 'Steel' });
      ins('PUMP', 50, 25, { TAG: 'P-101', MATERIAL: 'Cast iron' });
      ins('VALVE', 230, 60, { TAG: 'V-201', SIZE: 'DN80', MATERIAL: 'Steel' }); ins('PUMP', 270, 25, { TAG: 'P-201', MATERIAL: 'Cast iron' });
      doc.add({ type: 'line', layer: '0', x1: 20, y1: 40, x2: 130, y2: 40 });
    });
  });

  console.log('\n== two zones, two tables');
  await typeCmd('BOMZONE'); await typeCmd('0,0'); await typeCmd('#150,90'); await typeCmd('Plant room');
  await typeCmd('BOMZONE'); await typeCmd('200,0'); await typeCmd('#350,90'); await typeCmd('Boiler house');
  let s = await state();
  ok(s.zones.join() === 'Plant room,Boiler house' && s.labels.join() === 'Plant room,Boiler house', 'BOMZONE twice: two named zones with their names on the drawing', s.zones);
  const lay = await page.evaluate(() => { const l = window.cadcraft.doc.layers.get('BOM-ZONES'); return l && { plot: l.plot, linetype: l.linetype }; });
  ok(lay && lay.plot === false && lay.linetype === 'DASHED', 'the zones are on layer BOM-ZONES: dashed, not plotted', lay);
  // pick each zone by a click on its outline, then the table's height and corner
  const clickModel = async (x, y) => { const p = await page.evaluate(([mx, my]) => { const v = window.cadcraft.view, q = v.toScreen(mx, my), r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + q.x, y: r.top + q.y }; }, [x, y]); await page.mouse.click(p.x, p.y); await page.waitForTimeout(200); };
  await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(300);
  await typeCmd('BOMTABLE'); await clickModel(75, 0); await typeCmd('3'); await typeCmd('0,-12');
  await page.keyboard.press('Escape');
  await typeCmd('BOM'); await clickModel(275, 0); await typeCmd('3'); await typeCmd('200,-12');
  await page.keyboard.press('Escape');
  s = await state();
  let A = tableOf(s, 'Plant room'), Bt = tableOf(s, 'Boiler house');
  ok(s.tables.length === 2 && A && Bt, 'BOMTABLE and BOM: one table per zone, each picked by a click on its outline', s.tables.map((t) => t.zone));
  ok(A && A.rows.length === 4 && A.columns.join() === 'Item,Qty,Name,TAG,SIZE,MATERIAL', 'table A: the pump and three valves, with a column per attribute', A && [A.columns, A.rows]);
  ok(Bt && Bt.rows.length === 2 && Bt.drawn[0] === 'Bill of materials: Boiler house', 'table B: one pump and one valve, titled with its zone', Bt && Bt.rows);
  ok(A && A.lines > 8 && A.drawn.includes('V-102'), 'the table is drawn on the drawing (lines and texts)');
  await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(500);
  await shot('bom-01-two-zones-two-tables');

  console.log('\n== move a block from one zone to the other');
  const v102 = await page.evaluate(() => [...window.cadcraft.doc.all()].find((e) => e.attrs?.TAG === 'V-102').id);
  const steps0 = s.steps;
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), v102);
  await typeCmd('MOVE'); await typeCmd('0,0'); await typeCmd('#240,-20');   // (70, 60) → (310, 40): into the Boiler house
  s = await state(); A = tableOf(s, 'Plant room'); Bt = tableOf(s, 'Boiler house');
  ok(A.rows.length === 3 && !A.drawn.includes('V-102'), 'MOVE: the valve left table A', A.rows);
  ok(Bt.rows.length === 3 && Bt.drawn.includes('V-102') && Bt.rows.find((r) => r.includes('V-102')).startsWith('3|'), '… and is in table B as item 3', Bt.rows);
  ok(s.steps === steps0 + 1, 'the move and both table updates are one undo step', s.steps - steps0);
  await shot('bom-02-after-move');
  await page.keyboard.press('Escape');
  await typeCmd('U'); await page.waitForTimeout(200);
  s = await state();
  ok(tableOf(s, 'Plant room').drawn.includes('V-102') && !tableOf(s, 'Boiler house').drawn.includes('V-102'), 'Undo puts the valve and both tables back');
  await typeCmd('REDO'); await page.waitForTimeout(200);
  s = await state();
  ok(!tableOf(s, 'Plant room').drawn.includes('V-102') && tableOf(s, 'Boiler house').drawn.includes('V-102'), 'Redo moves them again');

  console.log('\n== the dialog');
  A = tableOf(s, 'Plant room');
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), A.entId);
  await typeCmd('BOMEDIT');
  await page.waitForSelector('dialog[data-bom-dialog][open]');
  ok((await page.$$('[data-bom-col-row]')).length === 10, 'BOMEDIT lists ten columns: item, quantity, name, layer, length, area, three attributes and remarks', (await page.$$('[data-bom-col-row]')).length);
  ok(/Plant room: 3 rows/.test(await page.textContent('[data-bom-status]')), 'the heading says which zone and how many rows');
  await shot('bom-03-dialog');
  await page.uncheck('[data-bom-col="attr:MATERIAL"]'); await page.waitForTimeout(150);
  s = await state(); A = tableOf(s, 'Plant room');
  ok(A.columns.join() === 'Item,Qty,Name,TAG,SIZE' && !A.drawn.includes('MATERIAL') && !A.drawn.includes('Brass'), 'unticking MATERIAL takes the column off the table on the drawing', A.columns);
  ok(tableOf(s, 'Boiler house').columns.includes('MATERIAL'), 'the other table keeps its own columns');
  await page.fill('[data-bom-head="attr:TAG"]', 'Tag no.'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  await page.click('[data-bom-move="name:-1"]'); await page.waitForTimeout(100); await page.click('[data-bom-move="name:-1"]'); await page.waitForTimeout(150);
  await page.check('[data-bom-flag="totals"]'); await page.waitForTimeout(150);
  await page.check('[data-bom-col="remarks"]'); await page.waitForTimeout(150);
  const firstRemark = await page.$('[data-bom-remark]');
  await firstRemark.fill('Check with site'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  s = await state(); A = tableOf(s, 'Plant room');
  ok(A.columns.join() === 'Name,Item,Qty,Tag no.,SIZE,Remarks', 'a heading renamed, Name moved first, Remarks ticked', A.columns);
  ok(A.totals && A.totals.includes('3') && A.drawn.includes('Total') && A.drawn.includes('Check with site'), 'the totals row and the remark are on the drawing', A.drawn.slice(-8));
  await page.selectOption('[data-bom-group]', 'name'); await page.waitForTimeout(150);
  s = await state(); A = tableOf(s, 'Plant room');
  ok(A.rows.length === 2 && A.rows.some((r) => /^VALVE\|\d+\|2\|varies/.test(r)), 'grouped by block name: VALVE x 2 (tags vary) and PUMP x 1', A.rows);
  await page.selectOption('[data-bom-group]', 'detail'); await page.waitForTimeout(150);
  await page.click('[data-bom-act="renumber"]'); await page.waitForTimeout(150);
  s = await state(); A = tableOf(s, 'Plant room');
  ok(A.rows.map((r) => r.split('|')[1]).join() === '1,2,3', 'Renumber items: 1, 2, 3', A.rows);
  const csv = await download(() => page.click('[data-bom-act="csv"]'));
  const csvText = csv.bytes.toString('utf8');
  ok(/Plant room\.csv$/.test(csv.name) && csvText.startsWith('﻿Name,Item,Qty,Tag no.,SIZE,Remarks\r\n') && /Total/.test(csvText), 'Export CSV downloads the table as shown', csv.name + ' ' + JSON.stringify(csvText.slice(0, 80)));
  await shot('bom-04-dialog-edited');
  const stepsBefore = (await state()).steps;
  await page.click('[data-bom-close]'); await page.waitForTimeout(300);
  ok(!(await page.$('dialog[data-bom-dialog]')), 'Close closes the dialog');
  ok((await state()).steps < stepsBefore || (await state()).steps === stepsBefore, 'the visit is folded into one undo step by the command');

  console.log('\n== where the tools are');
  ok((await page.$$('[data-tb-key="Blocks"] [data-cmd="BOMZONE"], [data-tb-key="Blocks"] [data-cmd="BOMTABLE"], [data-tb-key="Blocks"] [data-cmd="BOMEDIT"], [data-tb-key="Blocks"] [data-cmd="BOMUPDATE"], [data-tb-key="Blocks"] [data-cmd="BOMEXPORT"]')).length === 5, 'the Blocks group\'s More menu has the five tools');
  await typeCmd('BOMUPDATE');
  ok((await history()).some((x) => /already up to date \(2 checked\)|tables? updated of 2/.test(x)), 'BOMUPDATE answers in the history', (await history()).slice(-2).join(' | '));
  await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(500);
  await shot('bom-05-final');

  console.log('\n== save, reopen');
  const want = await state();
  for (const [fmt, cmd] of [['dxf', async () => typeCmd('DXFOUT')], ['dwg', async () => { await typeCmd('SAVEAS'); await page.waitForSelector('dialog[open] input[name="cc-format"]'); await page.check('dialog[open] input[name="cc-format"][value="dwg"]').catch(() => {}); await page.click('dialog[open] button[data-key="ok"]'); }]]) {
    const f = await download(cmd);
    ok(f.name.toLowerCase().endsWith('.' + fmt) && f.bytes.length > 1000, 'saved as ' + fmt.toUpperCase(), f.name);
    await page.evaluate(() => window.cadcraft.doc.markSaved());
    await page.setInputFiles('[data-file]', f.file);
    await page.waitForFunction((n) => window.cadcraft.doc.meta.source === n && window.cadcraft.doc.model.size > 0, path.basename(f.file), { timeout: 60000 });
    await page.waitForTimeout(400);
    s = await state();
    const a2 = tableOf(s, 'Plant room'), b2 = tableOf(s, 'Boiler house'), a1 = tableOf(want, 'Plant room');
    ok(s.zones.join() === want.zones.join() && s.tables.length === 2 && a2 && b2, fmt.toUpperCase() + ' reopened: both zones and both tables are back', s.zones);
    ok(a2 && a2.columns.join() === a1.columns.join() && a2.rows.join(';') === a1.rows.join(';') && a2.drawn.includes('Check with site'), fmt.toUpperCase() + ': table A has the same columns (MATERIAL still unticked), rows, numbers and remark', a2 && [a2.columns, a2.rows]);
    const moved = await page.evaluate(() => { const doc = window.cadcraft.doc, e = [...doc.all()].find((x) => x.attrs?.TAG === 'V-201'); doc.change('MOVE', () => doc.update(e.id, { ...e, x: 100, y: 20 })); return true; });
    s = await state();
    ok(moved && tableOf(s, 'Plant room').drawn.includes('V-201') && !tableOf(s, 'Boiler house').drawn.includes('V-201'), fmt.toUpperCase() + ': still live after reopening (V-201 moved into the Plant room shows in table A, leaves table B)', tableOf(s, 'Plant room').rows);
    await page.evaluate(() => { window.cadcraft.doc.undo(); window.cadcraft.doc.markSaved(); });
    if (fmt === 'dxf') { await typeCmd('ZOOM'); await typeCmd('E'); await page.waitForTimeout(400); await shot('bom-06-reopened-dxf'); }
  }
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e.message));
  await shot('error').catch(() => {});
} finally {
  await browser.close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
