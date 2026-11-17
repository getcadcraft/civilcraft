// SPDX-License-Identifier: Apache-2.0
// Super 0.1, SC.7 "Finalize and export in one step" in a real browser (lab build, headless Chromium), with the real apps mounted: a small project with a
// 2D drawing, a building model with its drawing set, a site surface, steel, a part, a PDF with markups and a takeoff; the ONE export dialog asks its
// questions once, every app writes through its own exporter with those answers (no app dialog opens), and one zip comes back. Every expected file is in the
// zip and is a valid file of its kind (our own readers); a page of the PDF set carries the title block text; the answers are kept with the project; the
// same run is handed to Issue and record and frozen as a set (BK.139). Screenshots go to tmp/super-test/.
//   node tools/super-test/export-set.mjs [--keep]
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib'; import { pathToFileURL } from 'node:url';
import { start, launch, OUT, ROOT } from './serve.mjs';
import { register } from 'node:module';
const vend = n => pathToFileURL(path.join(ROOT, 'public_html/assets/vendor', n)).href;
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  const map = { 'manifold-3d': ${JSON.stringify(vend('manifold-3d/current/manifold.js'))}, proj4: ${JSON.stringify(vend('proj4/current/proj4.esm.min.js'))}, delaunator: ${JSON.stringify(vend('delaunator/current/index.js'))}, 'robust-predicates': ${JSON.stringify(vend('robust-predicates/current/index.js'))} };
  if (map[spec]) return { url: map[spec], shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);   // the apps' readers name these libraries bare (the page has an import map)
const APPS = path.join(ROOT, 'public_html/assets/apps'), DEV = path.join(APPS, 'supercadcraft/dev');
const load = f => import(pathToFileURL(path.join(APPS, f)).href);
const P = await load('supercadcraft/dev/super-project.js');
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1600, height: 1000 });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true }); const page = await ctx.newPage(); const errors = [];
page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message).slice(0, 300)); });
const strays = []; page.on('download', d => strays.push(d.suggestedFilename()));   // a download that is not the zip means an app's file escaped the set
await page.route('**/api/v1/**', r => r.fulfill({ status: 404, contentType: 'application/json', body: '{}' }));   // nothing reaches the site

await page.goto(url + '?workspace=standard'); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await page.addStyleTag({ content: '.nh-offer{display:none!important}' });
await page.evaluate(() => { window.superWindow.home.leave(); });

/* ---- every view the project uses, mounted: all eight in the main area of one workspace ---- */
const PANELS = { cad: 'cadcraft', bim: 'bimcraft', civil: 'civilcraft', detail: 'detailcraft', part: 'partcraft', markup: 'markupcraft', takeoff: 'takeoffcraft' };
const show = async id => {
  await page.evaluate(i => { const w = window.superWindow; w.M.showPanel(w.state, i); w.M.setActiveTab(w.state, i); w.render(); }, id);
  await page.waitForFunction(i => { const d = document.querySelector(`[data-panel="${i}"]`)?.dataset.mount; return d === 'ready' || d === 'failed'; }, id, { timeout: 90000 });
  return page.evaluate(i => document.querySelector(`[data-panel="${i}"]`).dataset.mount, id);
};
for (const id of Object.keys(PANELS)) ok(await show(id) === 'ready', `the ${PANELS[id]} view is mounted`);
await page.evaluate(() => { const w = window.superWindow; w.project.name = 'Tower'; w.P.setInfo(w.project, { client: 'Acme Homes' }); });

/* a 2D drawing, a building model, a PDF sheet: through the page's own Open */
const give = async (file, panel, wait) => { await page.setInputFiles('[data-sc-open-input]', file); await page.waitForFunction(wait, null, { timeout: 90000 }); };
await give(path.join(ROOT, 'fixtures/cad/kitchen-count.dxf'), 'cad', () => window.cadcraft && window.cadcraft.doc.model.size > 0);
await give(path.join(ROOT, 'fixtures/bimcraft/small-house.ifc'), 'bim', () => window.bimcraftExport && window.bimcraftExport.can('ifc') === null);
const PDF = path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf');
await page.setInputFiles('[data-panel="markup"] input[data-file]', PDF); await page.waitForFunction(() => window.markupcraft && window.markupcraft.sheets.length > 0, null, { timeout: 90000 });
await page.setInputFiles('[data-panel="takeoff"] input[data-file-pdf]', PDF); await page.waitForFunction(() => window.takeoffcraft && window.takeoffcraft.files.length > 0, null, { timeout: 90000 });
/* a site surface (the app's own sample points; its import question is the app's own, answered once here as a person would), steel (the sample frame), a part, markups, a takeoff */
await page.evaluate(async () => { const r = await fetch(new URL('/assets/apps/civilcraft/dev/sample-site.csv', location.href)); window.civilcraft.openText(await r.text(), 'sample-site.csv', 'ft'); });
await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
await page.waitForFunction(() => window.civilcraft.exportSet.can('landxml') === null, null, { timeout: 60000 });
await page.evaluate(() => window.detailcraft.act('sample')); await page.waitForFunction(() => window.detailcraft.built.parts.length > 0, null, { timeout: 60000 });
const F = await import(pathToFileURL(path.join(ROOT, 'tools/partcraft-test/fixtures.mjs')).href);
await page.evaluate(t => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
await page.waitForFunction(() => window.partcraft.regen && window.partcraft.regen.mesh && window.partcraft.exportSet.can('step') === null, null, { timeout: 90000 });
await page.evaluate(() => { const m = window.markupcraft; m.store.change('t', tx => { tx.add({ sheet: m.sheets[0].page.key, type: 'cloudrect', rect: [300, 300, 560, 440], text: 'Redraw the hood wall', author: 'Ana' }); tx.add({ sheet: m.sheets[0].page.key, type: 'rect', rect: [100, 500, 300, 580], text: 'Check the door swing', author: 'Ana' }); });
  const tk = window.takeoffcraft, tm = tk.model; tm.addItem({ name: 'Paint', type: 'fixed', unit: 'SF', qty: 1000, mat: 4000, lab: 6000 }); const id = tm.addItem({ name: 'Wall base', type: 'linear', color: '#D62728' }); tm.addMark({ item: id, sheet: tk.sheets()[0].key, pts: [{ x: 100, y: 100 }, { x: 300, y: 100 }] }); });
await page.waitForTimeout(800);
ok(await page.evaluate(() => { const pane = document.querySelector('[data-panel="markup"] [data-act="list-bcf"]'); return !!pane && pane.offsetParent === null; }), 'the markup list panel is closed (its export buttons are not on screen)');

/* ---- the office standard of the project: its title block definition (BK.165), typed on the Standards page ---- */
await page.evaluate(() => window.superWindow.home.api.showPage('office:standards'));
const PGS = '[data-home-view="page"]:not([hidden])';
await page.waitForSelector(PGS + ' [data-sco-f="project.titleblock"]');
await page.fill(PGS + ' [data-sco-f="project.paper"]', 'iso-a3');
await page.fill(PGS + ' [data-sco-f="project.titleblock"]', 'client | Client | \ndrawn | Drawn | RD\nstage | Stage | Tender');
await page.click(PGS + ' [data-sco-act="save-project"]');
ok(await page.evaluate(() => { const s = window.superWindow.plugins.read('office', 'standard'); return !!s && s.body.titleBlock.paper === 'iso-a3' && s.body.titleBlock.fields.length === 3; }), 'the project has its office standard: paper A3 and a title block of three fields');
await page.evaluate(() => window.superWindow.home.leave());

/* ---- Sheets with title blocks: the Finalize and export workspace lists the project's sheets ---- */
await page.evaluate(() => { const w = window.superWindow; w.M.switchWorkspace(w.state, 'finalize'); w.render(); });   // nothing else: the workspace's own tool tab is in front, and it starts with the sheets
await page.waitForSelector('[data-sc-sheets] [data-act="sheets-refresh"]');
await page.click('[data-sc-sheets] [data-act="sheets-refresh"]');
await page.waitForFunction(() => document.querySelectorAll('[data-sc-sheets] [data-sheet-key]').length > 5 && !document.querySelector('[data-sc-sheets] [data-act="sheets-refresh"]').disabled, null, { timeout: 60000 });
const panelSheets = await page.$$eval('[data-sc-sheets] [data-sheet-key]', n => n.map(x => [x.dataset.sheetApp, x.dataset.sheetKey, x.textContent.trim()]));
const appsWithSheets = [...new Set(panelSheets.map(x => x[0]))];
ok(['bimcraft', 'cadcraft', 'detailcraft', 'partcraft', 'civilcraft', 'markupcraft'].every(a => appsWithSheets.includes(a)), 'the tool panel lists sheets of the building, the 2D drawing, steel, the part, the site and the PDF: ' + appsWithSheets.join());
ok(panelSheets.some(x => /A-101 Ground floor plan/.test(x[2])) && panelSheets.some(x => x[0] === 'cadcraft' && /K-101/.test(x[2])), 'each sheet is named by its number and title (A-101 Ground floor plan, the layout K-101)');
const tbOf = sel => page.$$eval(sel + ' [data-tb]', n => Object.fromEntries(n.map(x => [x.dataset.tb, x.textContent.trim()])));
await page.click('[data-sc-sheets] [data-sheet-show="bimcraft|A-101"]');
const tb1 = await tbOf('[data-sc-sheets]');
ok(tb1.project === 'Tower' && tb1.client === 'Acme Homes' && tb1.sheet_title === 'Ground floor plan' && /^A-101 \(\d+ \/ \d+\)$/.test(tb1.sheet_no) && tb1.drawn_by === 'RD' && tb1.stage === 'Tender' && /^\d{4}-\d{2}-\d{2}$/.test(tb1.date) && tb1.scale.length > 2,
  'its title block is filled from the project (name, client), the sheet (title, number, scale), the day and the office standard (drawn by, stage): ' + JSON.stringify(tb1));
await page.screenshot({ path: path.join(OUT, 'export-set-sheets-panel.png') });

/* ---- the one dialog ---- */
await page.click('[data-sc-sheets] [data-act="sheets-export"]');
await page.waitForSelector('dialog[data-sc-export][open]');
await page.waitForFunction(() => document.querySelectorAll('[data-sc-export-sheets] [data-sheet-key]').length > 5, null, { timeout: 60000 });
const rows = await page.$$eval('[data-sc-export] .sc-export-list:not([data-sc-export-missing]):not([data-sc-export-items]):not(.sclayer-export) > .sc-export-row', e => e.map(x => [x.dataset.format, x.querySelector('input').checked, x.querySelector('input').disabled, x.textContent.trim()]));
const want = ['pdf', 'dwg', 'dxf', 'ifc', 'step', 'bcf', 'xlsx', 'landxml', 'dstv'];
ok(want.every(f => rows.some(r => r[0] === f && r[1] && !r[2])), 'PDF, DWG, DXF, IFC, STEP, BCF, XLSX, LandXML and DSTV can all be written now and are ticked: ' + rows.map(r => r[0] + (r[1] ? '+' : '-')).join(' '));
ok(rows.filter(r => ['csv', 'stl', 'glb'].includes(r[0])).every(r => !r[1] && !r[2] && /tick it/.test(r[3])), 'more outputs (CSV, STL, GLB) are offered and not ticked');
const rowText = f => (rows.find(r => r[0] === f) || [])[3] || '';
ok(/2D drawing/.test(rowText('dwg')) && /2D drawing/.test(rowText('dxf')) && /Full/.test(rowText('dwg')), 'DWG and DXF come from the 2D drawing view (Full): ' + rowText('dwg').slice(0, 90));
ok(/Result only/.test(rowText('landxml')) && /Result only/.test(rowText('dstv')) && !/Full/.test(rowText('landxml') + rowText('dstv')), 'LandXML and DSTV are marked Result only');
const missing = await page.$$eval('[data-sc-export-missing] .sc-export-row', e => e.map(x => [x.dataset.format, x.querySelector('input').disabled, x.textContent.trim()]));
ok(missing.every(r => r[1] && r[3] !== ''), 'what cannot be written now is listed apart, greyed: ' + JSON.stringify(missing.map(r => r[0])));
const asks = await page.$$eval('[data-sc-export-ask] [data-ask]', n => Object.fromEntries(n.map(x => [x.dataset.ask, x.type === 'checkbox' ? x.checked : x.value])));
ok(asks.paper === 'iso-a3' && asks.scale === 'fit' && asks.ink === 'colour' && asks.dwgVersion === '2000' && asks.useProject === true && asks.perSheet === false && asks.drawnBy === 'RD' && asks.units === 'm',
  'the questions are asked once, up front; they start from the office standard (paper A3, drawn by RD): ' + JSON.stringify(asks));
ok(/would each ask/.test(await page.textContent('[data-sc-export-asknote]')), 'first time: it says the answers will be kept with the project');
ok(await page.$('[data-sclayer-export]') !== null, 'which model layers go out is asked in the same dialog (BK.128)');
// answer: DWG 2013, black ink, a revision, each sheet as its own file; leave two sheets out
await page.selectOption('[data-ask="dwgVersion"]', '2013'); await page.selectOption('[data-ask="ink"]', 'black'); await page.fill('[data-ask="revision"]', 'P1'); await page.check('[data-ask="perSheet"]');
await page.dispatchEvent('[data-ask="revision"]', 'change');
const dlgSheets = await page.$$eval('[data-sc-export-sheets] [data-sheet-key]', n => n.map(x => x.dataset.sheetKey));
ok(dlgSheets.length === panelSheets.length && dlgSheets.every((k, i) => k === panelSheets[i][1]), 'the dialog lists the same sheets, each with a tick: ' + dlgSheets.length);
await page.uncheck('[data-sc-export-sheets] [data-sheet-key="bimcraft|A-402"] input'); await page.uncheck('[data-sc-export-sheets] [data-sheet-key="detailcraft|anchor"] input');
await page.click('[data-sc-export-sheets] [data-sheet-show="detailcraft|assembly:C1"]');
const tb2 = await tbOf('[data-sc-export-sheets]');
ok(tb2.sheet_title === 'Assembly C1' && tb2.scale === '1:20' && tb2.revision === 'P1' && tb2.project === 'Tower', 'the title block of a steel sheet takes the revision just typed: ' + JSON.stringify(tb2));
await page.screenshot({ path: path.join(OUT, 'export-set-dialog.png') });

/* ---- run: every app writes with those answers; no app dialog opens; one zip ---- */
strays.length = 0;
const cadTexts = () => page.evaluate(() => { const d = window.cadcraft.doc; return JSON.stringify(d.layouts.map(l => [...l.entities.values()].filter(e => e.type === 'text').map(e => e.s))); });
const cadBefore = await cadTexts();
const watch = await page.evaluateHandle(() => { const seen = new Set(); const iv = setInterval(() => { for (const d of document.querySelectorAll('dialog[open]')) if (!d.matches('[data-sc-export]')) seen.add(d.className || d.getAttributeNames().join(' ')); }, 50); return { seen, iv }; });
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 300000 }), page.click('[data-act="export-run"]')]);
await page.waitForFunction(() => !document.querySelector('[data-act="export-run"]').disabled, null, { timeout: 300000 });
const asked = await page.evaluate(w => { clearInterval(w.iv); return [...w.seen]; }, watch);
ok(asked.length === 0, 'no app opened a dialog of its own during the run: ' + JSON.stringify(asked));
ok(await cadTexts() === cadBefore && !cadBefore.includes('Tower'), 'the 2D drawing is as it was after the export: its title block was filled for the plot only');
const outLines = await page.$$eval('[data-sc-export] .sc-export-out li', e => e.map(x => [x.dataset.outFormat, x.dataset.outApp, x.className, x.textContent]));
ok(outLines.filter(l => /is-off/.test(l[2])).length === 0, 'every job wrote its file: ' + JSON.stringify(outLines.filter(l => /is-off/.test(l[2])).map(l => l[3])));
ok(!outLines.some(l => /asked a question/.test(l[3])), 'nothing reports "it may have asked a question"');
ok(dl.suggestedFilename() === 'Tower export set.zip' && strays.length === 1, 'one file left the page: the zip (no app download escaped): ' + strays.join());
const z = await P.unzip(new Uint8Array(fs.readFileSync(await dl.path()))), names = [...z.keys()].sort();
const get = n => z.get(n).bytes, txt = n => new TextDecoder().decode(get(n)), pick = re => names.filter(n => re.test(n));
if (process.argv.includes('--keep')) console.log(names.join('\n'));
const contents = txt('contents.txt');

/* the PDF set */
const lib = await import(vend('pdf-lib/current/pdf-lib.esm.min.js'));
const streams = b => { const str = Buffer.from(b).toString('latin1'), out = []; for (const m of str.matchAll(/stream\r?\n([\s\S]*?)\r?\nendstream/g)) { try { out.push(zlib.inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1')); } catch { out.push(m[1]); } } return out; };
const hex = x => Buffer.from(x, 'latin1').toString('hex').toUpperCase(), has = (body, x) => body.includes(hex(x)) || body.includes('(' + x + ')');
ok(names.includes('pdf/Tower sheets.pdf'), 'the zip holds ONE PDF set: pdf/Tower sheets.pdf');
const setBytes = get('pdf/Tower sheets.pdf'), setDoc = await lib.PDFDocument.load(setBytes), nSet = setDoc.getPageCount();
ok(Buffer.from(setBytes.subarray(0, 5)).toString() === '%PDF-' && nSet === panelSheets.length - 2, `the set is a PDF with one page per ticked sheet: ${nSet} of ${panelSheets.length} (two were unticked)`);
const setBody = streams(setBytes).join('\n');
ok(['Tower', 'Acme Homes', 'Ground floor plan', 'RD', 'Tender', 'P1', 'Assembly C1'].every(x => has(setBody, x)), 'its pages carry the title block text: the project, the client, sheet titles, drawn by, the office\'s own field and the revision');
ok(setDoc.getPages().every(pg => pg.getMediaBox().y === 0), 'no page changed size (no strip is added under a sheet)');
const each = pick(/^sheets\/.*\.pdf$/);
ok(each.length === nSet && each.every(n => Buffer.from(get(n).subarray(0, 5)).toString() === '%PDF-') && each.some(n => /001 A-101 Ground floor plan\.pdf$/.test(n)), `each sheet is also its own PDF: ${each.length}`);
ok(!names.some(n => /^pdf\/(bimcraft|cadcraft|detailcraft|partcraft|civilcraft|markupcraft)-/.test(n)), 'the apps\' separate sheet PDFs are not repeated beside the set');
/* every engine's sheet carries the project's values exactly once: in the engine's OWN title block where it has one, else on the strip; never both */
{ const times = (body, x) => body.split(hex(x)).length - 1 + body.split(x).length - 1;
  const pageOf = re => { const n = each.find(x => re.test(x)); return n ? streams(get(n)).join('\n') : null; };
  const engines = [['the building (its strip)', / A-101 Ground floor plan\.pdf$/], ['steel (its title block)', / GA-01 Plan at Level 1\.pdf$/], ['the part drawing (above its title block)', / Flange\.pdf$/], ['the site plan (its title strip)', / sample-site\.pdf$/], ['the 2D drawing layout', / K-101\.pdf$/], ['the PDF page (no title block of its own: the strip)', / kitchen-plan-sheet/]];
  for (const [what, re] of engines) { const body = pageOf(re); ok(body !== null && times(body, 'Tower') === 1 && times(body, 'Acme Homes') === 1, `${what}: the project name and the client are on the page exactly once (${body === null ? 'no page' : times(body, 'Tower') + ' / ' + times(body, 'Acme Homes')})`); }
  const steel = pageOf(/ GA-01 Plan at Level 1\.pdf$/), part = pageOf(/ Flange\.pdf$/), bim = pageOf(/ A-101 Ground floor plan\.pdf$/);
  ok(times(steel, 'P1') >= 1 && times(part, 'P1') >= 1 && times(bim, 'P1') >= 1 && times(part, 'RD') >= 1, 'the revision typed once is in the steel, part and building title blocks; drawn by is in the part\'s');
  ok(times(bim, 'Tender') === 0 && times(steel, 'Tender') === 0 && times(pageOf(/ kitchen-plan-sheet/), 'Tender') === 1, 'a sheet with its own title block has no strip (the office\'s extra field is only on the strip of the sheet that has none)'); }

ok(pick(/^pdf\/takeoffcraft-.*\.pdf$/).length === 1, 'a PDF that is not sheets (the marked-up takeoff) stays its own file');

/* DWG and DXF from the 2D drawing: read with the drafting app's own readers */
{ const C = path.join(APPS, 'cadcraft/dev'); const imp = f => import(pathToFileURL(path.join(C, f)).href);
  (await imp('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(C, 'lang/en.json'), 'utf8')) });
  const { readDwg } = await imp('dwg/read.js'); const { readDxf } = await imp('dxf.js'); const { Doc } = await imp('doc.js');
  const dwg = pick(/^dwg\/cadcraft-.*\.dwg$/), dxf = pick(/^dxf\/cadcraft-.*\.dxf$/);
  ok(dwg.length === 1 && Buffer.from(get(dwg[0]).subarray(0, 6)).toString() === 'AC1027', 'DWG from the 2D drawing, in the version answered (2013 = AC1027): ' + (dwg[0] ? Buffer.from(get(dwg[0]).subarray(0, 6)).toString() : 'none'));
  let rd = null; try { rd = readDwg(get(dwg[0])); } catch (e) { rd = { err: String(e.message) }; }
  ok(rd && !rd.err && JSON.stringify(rd).length > 2000, 'our DWG reader reads it' + (rd && rd.err ? ': ' + rd.err : ''));
  let dd = null, nEnt = 0; try { dd = new Doc(); dd.load(readDxf(txt(dxf[0]))); nEnt = dd.model.size; } catch (e) { dd = { err: String(e.message) }; }
  ok(dxf.length === 1 && dd && !dd.err && nEnt > 10, `DXF from the 2D drawing: our DXF reader finds ${nEnt} objects` + (dd && dd.err ? ': ' + dd.err : ''));
  ok(pick(/^dwg\/civilcraft-.*\.dwg$/).length === 1 && pick(/^dxf\/civilcraft-.*\.dxf$/).length === 1 && Buffer.from(get(pick(/^dwg\/civilcraft-/)[0]).subarray(0, 6)).toString() === 'AC1027', 'the site view\'s DWG (same version, its own dialog never opened) and DXF are there too'); }

/* IFC, STEP */
{ const ifc = pick(/^ifc\/.*\.ifc$/);
  ok(['bimcraft', 'detailcraft', 'civilcraft', 'partcraft'].every(a => ifc.some(n => n.startsWith('ifc/' + a + '-'))), 'IFC from the building, steel, site and part views: ' + ifc.join());
  ok(ifc.every(n => /^ISO-10303-21;/.test(txt(n)) && /FILE_SCHEMA\s*\(\s*\(\s*'IFC/.test(txt(n)) && /END-ISO-10303-21;\s*$/.test(txt(n))), 'each is a complete IFC file (header, schema, end)');
  const bim = txt(ifc.find(n => n.startsWith('ifc/bimcraft-'))); ok((bim.match(/IFCWALL/g) || []).length > 3, 'the building\'s IFC holds its walls');
  const step = pick(/^step\/partcraft-.*\.step$/);
  ok(step.length === 1 && /^ISO-10303-21;/.test(txt(step[0])) && /MANIFOLD_SOLID_BREP|ADVANCED_FACE|FACETED_BREP/.test(txt(step[0])) && /END-ISO-10303-21;\s*$/.test(txt(step[0])), 'STEP from the part view: a complete file with a solid'); }

/* BCF and XLSX: MarkupCraft's list panel was never opened */
{ const BCF = await load('supercadcraft/dev/super-bcf.js'); const bcf = pick(/^bcf\/markupcraft-/);
  let topics = null; try { topics = await BCF.readTopics(get(bcf[0])); } catch (e) { topics = { err: String(e.message) }; }
  ok(bcf.length === 1 && topics && !topics.err && topics.topics.length === 2 && topics.topics.some(tp => /^Cloud on kitchen-plan-sheet/.test(tp.title)), 'BCF from the markups with the list panel closed: our BCF reader finds the 2 topics' + (topics && topics.err ? ': ' + topics.err : ' ' + JSON.stringify(topics && topics.topics && topics.topics.map(tp => tp.title)).slice(0, 200)));
  const { readXlsxRows } = await load('takeoffcraft/dev/xlsx-read.js');
  const xl = pick(/^xlsx\/.*\.xlsx$/); const rowsOf = async n => { try { return await readXlsxRows(get(n)); } catch (e) { return { ok: false, error: String(e.message) }; } };
  const mk = xl.find(n => n.startsWith('xlsx/markupcraft-')), tk = xl.find(n => n.startsWith('xlsx/takeoffcraft-'));
  const a = mk ? await rowsOf(mk) : null, b = tk ? await rowsOf(tk) : null;
  ok(a && a.ok && a.rows.length >= 3 && JSON.stringify(a.rows).includes('hood wall'), 'XLSX of the markups with the list panel closed: our reader finds the rows' + (a && !a.ok ? ': ' + a.error : ''));
  ok(b && b.ok && JSON.stringify(b.rows).includes('Paint'), 'XLSX of the takeoff: our reader finds the item' + (b && !b.ok ? ': ' + b.error : '')); }

/* LandXML and DSTV: the apps' own writers, read back with the apps' own readers */
{ const LX = path.join(APPS, 'civilcraft/dev'); try { (await import(pathToFileURL(path.join(LX, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(LX, 'lang/en.json'), 'utf8')) }); } catch { /* the reader's words are for errors only */ }
  const { readLandXml } = await import(pathToFileURL(path.join(LX, 'landxml.js')).href);
  const lx = pick(/^landxml\/civilcraft-.*\.xml$/); let r = null; try { r = readLandXml(txt(lx[0])); } catch (e) { r = { err: String(e.message) }; }
  ok(lx.length === 1 && r && !r.err && r.points.length > 10 && r.surfaces.length >= 1, `LandXML from the site view: CivilCraft's reader finds ${r && r.points ? r.points.length : 0} points and ${r && r.surfaces ? r.surfaces.length : 0} surface` + (r && r.err ? ': ' + r.err : ''));
  const DC = path.join(APPS, 'detailcraft/dev'); try { (await import(pathToFileURL(path.join(DC, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) }); } catch { /* as above */ }
  const { readNc1 } = await import(pathToFileURL(path.join(DC, 'nc1.js')).href);
  const nc = pick(/^dstv\/detailcraft-.*\.nc1$/); let good = 0, bad = '';
  for (const n of nc) { try { const d = readNc1(txt(n)); if (d.header && d.blocks) good++; } catch (e) { bad = n + ': ' + e.message; } }
  ok(nc.length >= 4 && good === nc.length && !names.some(n => /^dstv\/.*\.zip$/.test(n)), `DSTV from the steel view: ${nc.length} NC files, one per part mark (not a zip inside the zip), each read by DetailCraft's reader` + (bad ? ' ' + bad : '')); }

/* contents.txt: what is in the zip, what was asked, the export map's wording */
ok(names.filter(n => n !== 'contents.txt').every(n => contents.includes(n)), 'contents.txt names every file');
ok(/Asked once for this export:/.test(contents) && /Paper size: A3/.test(contents) && /DWG version: 2013/.test(contents) && /Ink: Black only/.test(contents), 'it says what was asked and answered');
ok(new RegExp(`Tower sheets\\.pdf: ${nSet} sheets in one PDF set`).test(contents) && /Title block: \d+ sheets carry the project's fields in their view's own title block; \d+ sheets with no title block of their own/.test(contents) && /replaced what was typed/.test(contents), 'it lists the sheets of the set and the title block\'s fields');
ok(/DWG \/ 2D drawing: Full/.test(contents) && /DXF \/ 2D drawing: Full/.test(contents) && /IFC \/ Building: Full/.test(contents) && /DWG \/ Site: Result only/.test(contents), 'Full only where the round-trip test covers the writer (IFC from the building, DWG and DXF from the 2D drawing)');
ok(/LandXML \(site\) \/ Site: Result only/.test(contents) && /DSTV \(steel NC files\) \/ Steel and rebar: Result only/.test(contents) && !/(LandXML|DSTV|STEP|BCF|XLSX|PDF)[^\n]*: Full\./.test(contents), 'everything else is Result only: ' + (contents.match(/^.*(LandXML|DSTV).*Result only/gm) || []).join(' | ').slice(0, 200));

/* ---- "Use the project's title block": on, the project's value replaces what was typed in the app's block; off, what was typed stays ---- */
{ const runPart = use => page.evaluate(async use => { const w = window.superWindow, p = window.partcraft.part; p.drawing = { ...(p.drawing || {}), title: { ...((p.drawing || {}).title || {}), drawnBy: 'HANDTYPED' } };
    const a = { ...w.exporter.answers.get().answers, useProject: use, drawnBy: 'PROJDRAWN' }; const r = await w.exporter.run(['pdf'], () => {}, 'partcraft', a); const f = r[0] && r[0].files[0]; return f ? Array.from(f.bytes) : null; }, use);
  const body = b => (b ? streams(Uint8Array.from(b)).join('\n') : ''), on = body(await runPart(true)), off2 = body(await runPart(false));
  ok(on.includes('PROJDRAWN') && !on.includes('HANDTYPED'), 'ticked: the project\'s "drawn by" replaces what was typed in the part drawing\'s title block');
  ok(off2.includes('HANDTYPED') && !off2.includes('PROJDRAWN'), 'unticked: what was typed by hand in the app\'s title block stays');
  ok(await page.evaluate(() => window.partcraft.part.drawing.title.drawnBy) === 'HANDTYPED', 'the part itself is never changed by an export'); }

/* ---- the answers are kept with the project and come back ---- */
const kept = await page.evaluate(async () => { const w = window.superWindow, X = await import('/assets/apps/supercadcraft/dev/super-export.js'); const b = w.P.extGet(w.project, 'export', 'answers.json'); const back = (await w.P.fromBytes(w.P.toBytes(w.project))).project;
  return { now: b ? X.answersFrom(b) : null, saved: X.answersFrom(w.P.extGet(back, 'export', 'answers.json')) }; });
ok(kept.now && kept.now.stored && kept.now.answers.dwgVersion === '2013' && kept.now.answers.ink === 'black' && kept.now.answers.revision === 'P1' && kept.now.answers.perSheet === true && kept.now.answers.sheetsOff.sort().join() === 'bimcraft|A-402,detailcraft|anchor',
  'the answers are in the project (Data/export/answers.json): ' + JSON.stringify(kept.now && kept.now.answers).slice(0, 260));
ok(kept.saved.stored && kept.saved.answers.dwgVersion === '2013' && kept.saved.answers.formats.includes('landxml'), 'and in the saved project file: they come back when it is opened');

/* ---- the same run, issued as a set (BK.139) ---- */
ok(await page.$eval('[data-act="export-issue"]', b => !b.disabled), 'after a run the set can be issued');
await page.click('[data-act="export-issue"]');
const PG = '[data-home-view="page"]:not([hidden])';
await page.waitForSelector(PG + ' [data-iss-tabs]'); await page.waitForSelector(PG + ' [data-iss-source="Tower sheets.pdf"]');
ok(await page.$$eval('dialog[open]', n => n.length) === 0, 'the dialog closed and the Issue and record page is open');
const members = await page.evaluate(() => window.superWindow.project.members.map(m => m.app + ':' + m.name));
ok(members.includes('markupcraft:Tower sheets.pdf') && members.some(m => /^cadcraft:.*\.dwg$/.test(m)) && members.some(m => /^detailcraft:.*\.nc1$/.test(m)), 'the files of the export are files of the project now');
const tickedN = await page.$$eval(PG + ' [data-iss-source]:checked', n => n.length), exportedN = names.filter(n => n !== 'contents.txt' && !n.startsWith('documents/')).length;
ok(tickedN === exportedN && await page.$eval(PG + ' [data-iss-source="Tower sheets.pdf"]', i => i.checked) && /revision A with/.test(await page.textContent(PG + ' [data-iss-preview]')), `the exported files arrive ticked (${tickedN} of ${exportedN}) and the preview shows the set`);
await page.selectOption(PG + ' [data-iss-purpose]', 'construction'); await page.fill(PG + ' [data-iss-name]', 'Tender set'); await page.fill(PG + ' [data-iss-by]', 'R. Davis');
await page.click(PG + ' [data-act="iss-freeze"]'); await page.waitForTimeout(800);
const frozen = await page.evaluate(async () => { const w = window.superWindow; const files = w.P.extList(w.project, 'issue').map(f => f.path); const man = files.find(f => /^sets\/[^/]+\/issue\.json$/.test(f));
  if (!man) return { files }; const j = JSON.parse(new TextDecoder().decode(w.P.extGet(w.project, 'issue', man))); const dir = man.replace(/issue\.json$/, 'files/');
  const pdf = files.find(f => f.startsWith(dir) && /sheets\.pdf$/.test(f)); const b = pdf ? w.P.extGet(w.project, 'issue', pdf) : null; const m = w.project.members.find(x => x.name === 'Tower sheets.pdf');
  return { code: j.code, n: j.files.length, names: j.files.map(f => f.name), same: !!b && b.length === m.bytes.length && b.every((v, i) => v === m.bytes[i]) }; });
ok(frozen.n === tickedN && frozen.same && frozen.names.includes('Tower sheets.pdf'), 'the exported set is issued: revision ' + frozen.code + ', every file of the run frozen, the PDF set byte for byte: ' + JSON.stringify(frozen).slice(0, 200));
await page.evaluate(() => window.superWindow.home.leave());

/* ---- next time: the dialog starts from the kept answers; a second export replaces nothing by surprise ---- */
await page.click('[data-act="export"]'); await page.waitForSelector('dialog[data-sc-export][open]');
const asks2 = await page.$$eval('[data-sc-export-ask] [data-ask]', n => Object.fromEntries(n.map(x => [x.dataset.ask, x.type === 'checkbox' ? x.checked : x.value])));
ok(asks2.dwgVersion === '2013' && asks2.ink === 'black' && asks2.revision === 'P1' && asks2.perSheet === true && /kept with this project/.test(await page.textContent('[data-sc-export-asknote]')), 'the next export starts from the answers kept with the project, and says so');
await page.waitForFunction(() => document.querySelectorAll('[data-sc-export-sheets] [data-sheet-key]').length > 5, null, { timeout: 60000 });
ok(await page.$eval('[data-sc-export-sheets] [data-sheet-key="bimcraft|A-402"] input', i => !i.checked) && await page.$eval('[data-sc-export-sheets] [data-sheet-key="bimcraft|A-101"] input', i => i.checked), 'the sheets left out last time are still unticked');
await page.evaluate(() => document.querySelector('[data-act="export-close"]').click());

/* ---- BK.38: the Sheets page along the bottom, with a filled drawing set ---- */
{ await page.click('[data-scpage="sheets"]');
  await page.waitForFunction(() => document.querySelectorAll('[data-res-sheets-dlg][open] [data-res-shlist] button').length > 3, null, { timeout: 60000 }).catch(() => {});
  const n = await page.$$eval('[data-res-sheets-dlg][open] [data-res-shlist] button', b => b.map(x => x.textContent.trim()));
  ok(n.length >= 5 && n.some(x => /A-101/.test(x)), 'the Sheets page opens the building\'s drawing set, filled: ' + n.length + ' sheets');
  await page.evaluate(() => document.querySelector('[data-res-sheets-dlg][open] [data-res-shclose]')?.click()); }

/* ---- the apps' own dialogs still do what they did (their buttons now call the same functions the set calls) ---- */
{ await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'civil'); w.M.setActiveTab(w.state, 'civil'); w.render(); }); await page.waitForTimeout(500);
  const viaDialog = async (open, go) => { await page.evaluate(c => window.civilcraft.command(c), open); await page.waitForSelector(go, { state: 'visible', timeout: 30000 }); const [d] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click(go)]); return d.suggestedFilename(); };
  const pdfName = await viaDialog('pdf', '[data-panel="civil"] [data-plot-go], [data-plot-go]');
  ok(/sample-site\.pdf$/.test(pdfName) && await page.$$eval('dialog[open]', n => n.length) === 0, 'the site view\'s own Plot dialog still writes its PDF and closes: ' + pdfName);
  const dwgName = await viaDialog('dwg', '[data-dwg-go]'); ok(/sample-site\.(dwg|dxf)$|-dwg\.zip$/.test(dwgName), 'its DWG / DXF dialog still writes its file: ' + dwgName);
  const ifcName = await viaDialog('ifc', '[data-ifc-go]'); ok(/sample-site-ifc.*\.ifc$/.test(ifcName), 'its IFC dialog still writes its file: ' + ifcName); }

ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
if (!process.argv.includes('--keep')) for (const f of ['export-set-sheets-panel.png', 'export-set-dialog.png']) { try { fs.rmSync(path.join(OUT, f)); } catch { /* not made */ } }
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`);
