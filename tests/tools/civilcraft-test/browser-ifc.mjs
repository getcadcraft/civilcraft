#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ifc.mjs — CivilCraft 0.7.1 71.24 (semhustej) in headless Chromium at https://getcadcraft.com/lab/civilcraft: the IFC demo
 * project (tools/civilcraft-test/fixtures/ifc/demo.civilcraft.json) opened, Export › IFC: the dialog (IFC 4.3 ADD2 first, what the file
 * holds, what each schema leaves out, the choice remembered), the IFC2x3 and IFC 4.3 files downloaded and checked by IfcOpenShell (rules
 * on); then a new project and the 4.3 file opened back: the import dialog, the alignment and existing ground in, the rest as reference
 * in 3D. The toolbar keeps one row at 1440 px (IFC is in Surface › More; the ribbon styles have it under Output › Export).
 * Run as root; minted session (tag cif).   node tools/civilcraft-test/browser-ifc.mjs   Shots + downloads in tmp/shots/civilcraft-ifc/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-ifc');
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/ifc');
const PY = path.join(REPO, 'tools/detailcraft-test/venv/bin/python');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cif'], { encoding: 'utf8' }) || '{}');
const check = (file) => JSON.parse(execFileSync(PY, ['-I', path.join(REPO, 'tools/civilcraft-test/ifc-check.py'), file, '--samples', '4'], { encoding: 'utf8', maxBuffer: 64 << 20 }));
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.evaluate(() => { try { localStorage.removeItem('civilcraft.ifcSchema'); } catch { /* */ } });

  // the toolbar at 1440 px: every group on one row with the IFC button
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.cv-tools > .cv-tool-group')].filter((g) => g.getBoundingClientRect().height > 0).map((g) => Math.round(g.getBoundingClientRect().top))).size);
  const exportTools = await page.$$eval('.cv-tools [aria-label="Export"] .cv-tool', (b) => b.map((x) => x.dataset.cmd + ':' + x.textContent.trim()));
  ok(rows === 1 && exportTools.join() === 'landxml:LandXML,dwg:DWG/DXF,pdf:PDF,ifc:IFC', 'Export group: LandXML, DWG/DXF (one button), PDF, IFC — and the toolbar keeps one row at 1440 px (owner 2026-10-26)', { rows, exportTools });
  const openIfc = () => page.click('.cv-tools [aria-label="Export"] [data-cmd="ifc"]');

  await page.evaluate(async (text) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(text, 'demo.civilcraft.json'); }, fs.readFileSync(path.join(FIX, 'demo.civilcraft.json'), 'utf8'));
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1 && window.civilcraft.project.eg().surface);
  // DWG / DXF: one button, the dialog asks the format; DXF keeps its own command for the ribbon styles and keys people bound
  await page.click('.cv-tools [data-cmd="dwg"]');
  await page.waitForSelector('[data-dwg][open]');
  const fmts = await page.$$eval('[data-dwg-format] option', (o) => o.map((x) => x.value));
  ok(fmts.includes('AC1015') && fmts.includes('AC1032') && fmts.at(-1) === 'DXF', 'the DWG/DXF dialog offers DWG 2000 … 2018 and DXF', fmts);
  await page.selectOption('[data-dwg-format]', 'DXF');
  ok(await page.$eval('[data-dwg-map-row]', (r) => r.hidden), 'DXF: no map picture choice (that is DWG\'s)');
  const [dx] = await Promise.all([page.waitForEvent('download'), page.click('[data-dwg-go]')]);
  ok(/\.dxf$/.test(dx.suggestedFilename()) && /AC1009/.test(fs.readFileSync(await dx.path(), 'utf8').slice(0, 2000)), 'DXF chosen: an R12 .dxf downloads', dx.suggestedFilename());
  ok(await page.$('.cv-tools [data-cmd="dxf"]') === null && await page.$('[data-dwg] [data-cmd="dxf"][hidden]'), 'the DXF command stays (hidden in the dialog, for the registry), not on the toolbar');
  const [dx2] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.civilcraftControl ? document.querySelector('[data-cmd="dxf"]').click() : null)]);
  ok(/\.dxf$/.test(dx2.suggestedFilename()), 'the registry\'s export.dxf still exports the DXF straight away');
  // the alignment's design speed and the courses in its Properties (owner 2026-10-26)
  await page.evaluate(() => window.civilcraft.select({ kind: 'alignment', id: 'a1' }));
  await page.waitForSelector('#cv-al-speed');
  ok(await page.inputValue('#cv-al-speed') === '80' && await page.inputValue('#cv-al-class') === 'Collector' && await page.$eval('[data-al-speed-unit]', (s) => s.value) === 'km/h', 'Properties: design speed 80 km/h, class Collector');
  ok(/no table that ties a speed/.test(await page.textContent('[data-al-speed-note]')), 'and says plainly that nothing is checked from the speed');
  await page.fill('#cv-al-speed', '100'); await page.press('#cv-al-speed', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].design.speed === 100);
  ok(true, 'typing 100 sets it (one undo step)');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments[0].design.speed) === 80, 'undo puts 80 back');
  await page.evaluate(() => window.civilcraft.select({ kind: 'alignment', id: 'a1' }));
  await page.waitForSelector('[data-as-quantities]');
  const qrows = await page.$$eval('[data-as-quantities] tbody tr', (r) => r.length);
  const crs = await page.$$eval('[data-as-course]', (r) => r.length);
  ok(qrows === 10 && crs >= 10, 'the assembly editor lists each part\'s courses and the quantities table has a row per course', { qrows, crs });
  await page.locator('[data-as-quantities]').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOTS, '00-courses-and-speed.png') });
  const n0 = await page.evaluate(() => window.civilcraft.project.state.alignments[0].corridor.parts.L.find((q) => q.type === 'gutter').layers?.length || 0);
  await page.click('[data-as-courses="gutter"] [data-as-course-add]');
  await page.waitForFunction((n) => (window.civilcraft.project.state.alignments[0].corridor.parts.L.find((q) => q.type === 'gutter').layers?.length || 0) === n + 1, n0);
  ok(true, 'Add a course on the left gutter adds one');
  await page.evaluate(() => window.civilcraft.project.undo());

  await openIfc();
  await page.waitForSelector('[data-ifc][open]');
  const d1 = await page.evaluate(() => { const d = document.querySelector('[data-ifc]'); return { schema: d.querySelector('[data-ifc-schema]').value, first: d.querySelector('[data-ifc-schema] option').value, summary: d.querySelector('[data-ifc-summary]').textContent, losses: d.querySelectorAll('[data-ifc-losses] li').length, notes: d.querySelector('[data-ifc-notes]').textContent, go: !d.querySelector('[data-ifc-go]').disabled }; });
  ok(d1.schema === 'IFC4X3_ADD2' && d1.first === 'IFC4X3_ADD2', 'the dialog opens on IFC 4.3 ADD2 (first in the list)', d1);
  ok(/alignments 1, corridors 1, surfaces 2, pads 1, retaining walls 1, pipes 1, structures 2, parcels 1/.test(d1.summary) && d1.go, 'it says what the file will hold', d1.summary);
  ok(d1.losses === 2 && !d1.notes, 'IFC 4.3: two things it leaves out (cant, layer thickness); the project has a coordinate system, so no note', d1);
  await page.selectOption('[data-ifc-schema]', 'IFC2X3');
  const l2 = await page.$$eval('[data-ifc-losses] li', (li) => li.map((x) => x.textContent));
  ok(l2.length === 4 && l2.some((x) => /ePSet_MapConversion/.test(x)) && l2.some((x) => /proxies/.test(x)), 'IFC2x3: four losses, named (proxies, georeferencing in property sets …)', l2);
  await page.screenshot({ path: path.join(SHOTS, '01-export-dialog-2x3.png') });
  const save = async (name) => { const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-ifc-go]')]); const f = path.join(SHOTS, name); await dl.saveAs(f); return { f, suggested: dl.suggestedFilename() }; };
  const x2 = await save('export-2x3.ifc');
  const t2 = fs.readFileSync(x2.f, 'utf8');
  ok(/FILE_SCHEMA\(\('IFC2X3'\)\);/.test(t2) && /-ifc2x3\.ifc$/.test(x2.suggested), 'the download is IFC2X3, named …-ifc2x3.ifc', x2.suggested);
  const v2 = check(x2.f);
  ok(v2.nproblems === 0 && v2.counts.IfcBuildingElementProxy >= 16, 'IfcOpenShell (rules on) finds nothing in the downloaded IFC2x3', v2.problems);
  await page.waitForFunction(() => /Saved .*-ifc2x3\.ifc/.test(document.querySelector('[data-status]').textContent));
  // the choice is remembered; back to 4.3
  await openIfc();
  await page.waitForSelector('[data-ifc][open]');
  ok(await page.$eval('[data-ifc-schema]', (s) => s.value) === 'IFC2X3', 'the dialog remembers IFC2x3 the next time');
  await page.selectOption('[data-ifc-schema]', 'IFC4X3_ADD2');
  await page.screenshot({ path: path.join(SHOTS, '02-export-dialog-43.png') });
  const x4 = await save('export-4x3.ifc');
  const v4 = check(x4.f);
  ok(v4.schema === 'IFC4X3_ADD2' && v4.nproblems === 0 && v4.counts.IfcAlignment === 1 && v4.counts.IfcRoad === 1, 'the downloaded IFC 4.3 passes IfcOpenShell (rules on): an IfcAlignment, an IfcRoad', { p: v4.problems, c: v4.counts });
  ok(v4.alignments[0]?.samples?.Axis?.pts?.length && !v4.alignments[0].samples.Axis.error, 'IfcOpenShell evaluates its gradient curve');
  ok(/IFCSITE\([^;]*,\(48,/.test(fs.readFileSync(x4.f, 'utf8')), 'the site carries the latitude at the origin (48° N, from EPSG:25832)');

  // a new project, then the 4.3 file opened (Open / drop take .ifc)
  await page.evaluate(() => { window.civilcraft.project.saved = window.civilcraft.project.version; return window.civilcraft.command('new'); });
  await page.waitForFunction(() => !window.civilcraft.project.state.alignments.length);
  await page.setInputFiles('[data-file]', path.join(FIX, 'demo-4x3.ifc'));
  await page.waitForSelector('[data-ifc-in][open]');
  const di = await page.evaluate(() => { const d = document.querySelector('[data-ifc-in]'), s = d.querySelector('[data-ifc-in-eg]'); return { found: d.querySelector('[data-ifc-in-found]').textContent, eg: s.options[s.selectedIndex].textContent, n: s.options.length, refs: d.querySelector('[data-ifc-in-refs]').checked }; });
  ok(/alignments 1, surfaces 2, other elements \d+/.test(di.found) && /Existing ground \(512 triangles\)/.test(di.eg) && di.n === 3 && di.refs, 'the import dialog: what the file holds, the existing ground picked, the rest as reference', di);
  await page.screenshot({ path: path.join(SHOTS, '03-import-dialog.png') });
  await page.click('[data-ifc-in-ok]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  const after = await page.evaluate(() => { const p = window.civilcraft.project, a = p.state.alignments[0]; return { units: p.state.units, name: p.state.name, start: a.start, pis: a.pis.length, r: a.pis[1].r, ls1: a.pis[1].ls1, pvis: a.pvis.length, tris: p.eg().surface?.nT, refs: (p.ifcRefs || []).length, ok: p.alignment(a).ok, status: document.querySelector('[data-status]').textContent }; });
  ok(after.units === 'm' && after.start === 1000 && after.pis === 4 && after.r === 400 && Math.abs(after.ls1 - 80) < 1e-9 && after.pvis === 4 && after.tris === 512 && after.ok, 'imported: metres, station 1000, 4 PIs (R 400 with 80 m spirals), 4 PVIs, the existing ground (512 triangles)', after);
  ok(after.refs >= 15 && /Imported from demo-4x3\.ifc/.test(after.status), 'the rest kept as reference elements; the status line says so', after);
  await page.evaluate(() => window.civilcraft.command('view3d'));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SHOTS, '04-imported-3d.png') });
  ok(!problems.length, 'no console errors', problems);
} finally {
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
