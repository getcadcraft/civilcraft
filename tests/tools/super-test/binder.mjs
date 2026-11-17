// SPDX-License-Identifier: Apache-2.0
// Super: the report binder in headless Chromium: the command, the dialog, a real binder made with pdf-lib in the page, the credits from a saved IFC, the file in the project.
//   node tools/super-test/binder.mjs
import { start, launch, OUT } from './serve.mjs';
import fs from 'node:fs'; import path from 'node:path';
const { url: URL0, close, missing } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message)));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const pl = await page.evaluate(() => window.superWindow.plugins.list().find(x => x.id === 'report-binder'));
ok(pl && pl.enabled && !pl.error, 'the plugin is on: ' + JSON.stringify(pl));
await page.evaluate(() => {
  const w = window.superWindow, enc = s => new TextEncoder().encode(s), P = w.P, p = w.project;
  p.name = 'Mine Camp';
  P.addMember(p, { app: 'engineer', name: 'Beam calculation report.md', bytes: enc('# Beam\n\nSpan check **passes**.\n'), role: 'saved' });
  P.addMember(p, { app: 'markupcraft', name: 'Costs.xlsx', bytes: enc('PK'), role: 'saved' });
  P.addMember(p, { app: 'bimcraft', name: 'Camp.ifc', bytes: enc("#10=IFCPROPERTYSINGLEVALUE('ItemUuid',$,IFCIDENTIFIER('u1'),$);\n#11=IFCPROPERTYSINGLEVALUE('ItemVersion',$,IFCINTEGER(2),$);\n#12=IFCPROPERTYSINGLEVALUE('License',$,IFCLABEL('CC-BY-4.0'),$);\n#13=IFCPROPERTYSINGLEVALUE('Attribution',$,IFCTEXT('Chair by Ann, CC BY'),$);\n#14=IFCPROPERTYSET('a',#1,'CadCraft_LibraryItem',$,(#10,#11,#12,#13));\n"), role: 'saved' });
});
// Report and price shows the line; Workflow menu opens the dialog
await page.click('.sc-wstab[data-ws="report"]'); await page.waitForTimeout(200);
ok(/Report binder\s*2 documents/.test(await page.evaluate(() => document.querySelector('[data-sc-summary]')?.textContent || '')), 'the Report and price strip counts the documents');
await page.click('.sc-barbtn[data-act="workflow"]'); await page.waitForSelector('.sc-wf-menu'); await page.click('.sc-wf-menu [data-act="plugin:report-binder:binder"]');
const DLG = 'dialog[data-sc-plugin="report-binder"][open]'; await page.waitForSelector(DLG);
ok(await page.isChecked('[data-section="credits"]') && await page.isDisabled('[data-section="credits"]'), 'Credits is always in and cannot be turned off');
ok(await page.isChecked('[data-section="calc"]') && !await page.isChecked('[data-section="time"]'), 'calculations on, hours off by default');
ok((await page.$$('[data-binder-doc]')).length === 2, 'both documents are listed');
await page.screenshot({ path: path.join(OUT, 'binder-dialog.png') });
// add a PDF through the file picker
const { PDFDocument } = await import('../../public_html/assets/vendor/pdf-lib/1.17.1/pdf-lib.esm.js');
const d0 = await PDFDocument.create(); d0.addPage([612, 792]); d0.addPage([612, 792]);
const specPath = path.join(OUT, 'Spec.pdf'); fs.writeFileSync(specPath, await d0.save());
await page.setInputFiles('[data-binder-file]', specPath); await page.waitForSelector('[data-binder-doc="Spec.pdf"]');
ok(true, 'Add a document… puts it in the list');
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="binder-make"]')]);
ok(dl.suggestedFilename() === 'Mine Camp report binder.pdf', 'the download is named for the project: ' + dl.suggestedFilename());
await page.waitForFunction(() => /Saved /.test(document.querySelector('[data-binder-msg]')?.textContent || ''));
const said = await page.textContent('[data-binder-msg]');
ok(/1 Library item credited/.test(said) && /Costs\.xlsx/.test(said), 'it says what was credited and what was left out: ' + said);
const out = await PDFDocument.load(fs.readFileSync(await dl.path()));
ok(out.getPageCount() >= 5, 'cover, calculation, two Spec pages, credits: ' + out.getPageCount());
fs.copyFileSync(await dl.path(), path.join(OUT, 'binder.pdf'));
ok(await page.evaluate(() => window.superWindow.project.members.some(m => m.name === 'Mine Camp report binder.pdf')), 'the binder is in the project');
ok(await page.evaluate(() => { const w = window.superWindow; return !!w.P.extGet(w.project, 'report-binder', 'binder.json'); }), 'the choices are kept in the project');
// a calculation report made in Engineer lands in the project
await page.evaluate(() => window.dispatchEvent(new CustomEvent('cc-calc-report', { detail: { name: 'Shaft calculation report.md', markdown: '# Shaft\n' } })));
ok(await page.evaluate(() => window.superWindow.project.members.some(m => m.name === 'Shaft calculation report.md' && m.app === 'engineer')), 'a report from Engineer is filed in the project');
ok(!errors.length, 'no page errors: ' + errors.join(' | '));
ok(!missing.filter(x => /report-binder/.test(x)).length, 'no missing files: ' + missing.join());
// fonts through the real page: a Chinese note fetches its font and prints
await page.evaluate(() => { const w = window.superWindow; w.P.addMember(w.project, { app: 'markupcraft', name: 'Words.md', bytes: new TextEncoder().encode('# 中文测试\n\nمرحبا\n'), role: 'saved' }); });
await page.evaluate(() => document.querySelector('dialog[data-sc-plugin="report-binder"][open]').close());
await page.click('.sc-barbtn[data-act="workflow"]'); await page.waitForSelector('.sc-wf-menu'); await page.click('.sc-wf-menu [data-act="plugin:report-binder:binder"]'); await page.waitForSelector(DLG);
await page.selectOption('[data-doc-place="Spec.pdf"]', 'calc');
ok(await page.evaluate(() => { const w = window.superWindow; return JSON.parse(new TextDecoder().decode(w.P.extGet(w.project, 'report-binder', 'binder.json'))).place['Spec.pdf'] === 'calc'; }), 'a document can be moved to Calculations, and that is kept');
await page.screenshot({ path: path.join(OUT, 'binder-dialog.png') });
const [dl2] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-act="binder-make"]')]);
fs.copyFileSync(await dl2.path(), path.join(OUT, 'binder-unicode.pdf'));
await page.waitForFunction(() => /Saved /.test(document.querySelector('[data-binder-msg]')?.textContent || ''));
const said2 = await page.textContent('[data-binder-msg]');
ok(!/show as \?|could not be loaded/.test(said2), 'the fonts load from the vendor folder: ' + said2);
await page.evaluate(() => document.querySelector('dialog[data-sc-plugin="report-binder"][open]').close());
// Finalize and export: the ticks, and the binder in the zip
await page.click('[data-act="export"]'); await page.waitForSelector('[data-sc-export][open]');
const offered = await page.$$eval('[data-export-item]', e => e.map(x => [x.dataset.exportItem, x.querySelector('input').checked]));
ok(offered.find(x => x[0] === 'report-binder:binder')?.[1] === true && offered.filter(x => x[1]).length === 1, 'the binder is ticked first time, the rest are not: ' + JSON.stringify(offered));
await page.check('[data-export-item="report-binder:credits"] input'); await page.check('[data-export-item="notes-tasks:notes"] input');
await page.screenshot({ path: path.join(OUT, 'binder-export.png') });
const [zip] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-act="export-run"]')]);
const P0 = await import('../../public_html/assets/apps/supercadcraft/dev/super-project.js');
const z = await P0.unzip(new Uint8Array(fs.readFileSync(await zip.path())));
ok(z.has('documents/Mine Camp report binder.pdf') && z.has('documents/Mine Camp credits.pdf') && z.has('contents.txt'), 'the zip has the binder and the credits: ' + [...z.keys()].join());
ok(!z.has('documents/Notes.md'), 'no notes in this project: nothing added, and contents.txt says so');
ok(/Notes: /.test(new TextDecoder().decode(z.get('contents.txt').bytes || z.get('contents.txt').data || z.get('contents.txt'))), 'contents.txt names it');
await page.reload(); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await page.click('[data-act="export"]'); await page.waitForSelector('[data-sc-export][open]');
ok(await page.isChecked('[data-export-item="report-binder:credits"] input'), 'the ticks are remembered');
// a real CadCraft panel: the placed item is reported live (a DWG cannot be read from its bytes), and credited
{
  const pg = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })).newPage();
  pg.on('pageerror', e => errors.push(String(e.message)));
  await pg.goto(URL0); await pg.waitForSelector('[data-sc-ready]');
  await pg.evaluate(i => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.workspaces.layout.docks = { left: [], center: [{ tabs: [i], active: i }], right: [], bottom: [] }; s.workspaces.layout.floating = []; Object.assign(w.state, s); w.state.active = 'layout'; w.render(); }, 'cad');
  await pg.waitForFunction(() => document.querySelector('[data-panel="cad"]')?.dataset.mount === 'ready', null, { timeout: 60000 });
  const live = await pg.evaluate(() => {
    const d = window.cadcraft.doc;
    d.change('t', () => d.add({ type: 'insert', block: 'X', x: 0, y: 0, attrs: { 'CC-ITEM-UUID': 'live-1', 'CC-ITEM-VER': '4', 'CC-LICENSE': 'CC-BY-4.0', 'CC-ATTRIB': 'Sink by Bo, CC BY' } }));
    return window.ccLibraryCreditSources.map(f => f());
  });
  ok(live.length === 1 && live[0].app === 'cadcraft' && live[0].items.some(i => i.uuid === 'live-1' && i.attribution === 'Sink by Bo, CC BY'), 'an open CadCraft reports its placed items: ' + JSON.stringify(live).slice(0, 200));
  // CREDITS through the real command line, the table in the block list, and nothing thrown while it draws
  await pg.evaluate(async () => { const e = window.cadcraft.engine; e.run('CREDITS'); await new Promise(r => setTimeout(r, 100)); e.text('10,10'); await new Promise(r => setTimeout(r, 100)); e.text('2.5'); await e.done; });
  const tb = await pg.evaluate(() => { const d = window.cadcraft.doc, b = d.blocks.get('CC-CREDITS'); return { n: b ? b.entities.length : 0, text: b ? b.entities.filter(x => x.type === 'text').map(x => x.s).join(' ') : '', placed: d.all().filter(x => x.type === 'insert' && x.block === 'CC-CREDITS').length }; });
  ok(tb.n > 3 && /Sink by Bo/.test(tb.text) && tb.placed === 1, 'CREDITS draws the table in a real CadCraft panel: ' + JSON.stringify(tb));
  await pg.waitForTimeout(300);
  await pg.close();
}
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
