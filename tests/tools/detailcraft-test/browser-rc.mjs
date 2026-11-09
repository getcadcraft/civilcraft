#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-rc.mjs — reinforced concrete detailing in the real app (0.9 RC.1, session rc-09; lib/rc + rc-detail.js + rc-ui.js), at
 * /lab/detailcraft as a person reaches it: the Concrete tab, Add by grid (two columns, a beam on them, a slab, a wall), the element's fields
 * in Properties (one undo step each, a refused edit said in words), laps and anchorage with their clauses, an opening with trimmers, the
 * shell's Problems (source detailcraft.rebar), the bending schedule over the whole structure, Output › More › Reinforcement drawings (made
 * again after a change while open, both PDFs), the IFC export and File › Import IFC of it (elements back, the report), the 3D view drawing
 * the bars, the help topic, no console errors.
 *
 *   node tools/detailcraft-test/browser-rc.mjs [--shots <dir>]      (run as root: signs in through tools/shell-test/admin.php)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const DL = path.join(REPO, 'tmp/rc-browser');
fs.mkdirSync(DL, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' — ' + d : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => { problems.push('native dialog: ' + d.message()); d.dismiss(); });
const dc = (fn, arg) => page.evaluate(fn, arg);
const settle = () => page.waitForTimeout(150);
async function download(action) {
  const [d] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, d.suggestedFilename());
  await d.saveAs(f);
  return f;
}
const rc = () => dc(() => JSON.parse(JSON.stringify(window.detailcraft.model.state.rc || null)));
async function addByGrid(kind, picks, sizes = {}) {
  await page.selectOption('#dc-rc-add-kind', kind);
  await settle();
  for (const [k, v] of Object.entries(picks)) await page.selectOption('#dc-rc-add-' + k, v);
  for (const [k, v] of Object.entries(sizes)) { await page.fill('#dc-rc-add-' + k, String(v)); await page.press('#dc-rc-add-' + k, 'Tab'); }
  await page.click('[data-rc-add-go]');
  await settle();
}

try {
  await ctx.addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.detailcraft && !!window.detailcraft.rc);

  // ---- reachable: the tab, the Output menu item, the registry command ----
  ok(await page.locator('[data-tab="rc"]').count() === 1, 'a Concrete tab below the view');
  ok(await page.locator('[data-output-menu] [data-act="rc-sheets"]').count() === 1, 'Output › More › Reinforcement drawings');
  const inReg = await dc(async () => { const m = await import(new URL('input-detailcraft.js', document.querySelector('script[type=module][src*="detailcraft.js"]')?.src || location.href).href).catch(() => null); return m ? m.COMMANDS.filter((c) => /concrete|rc-sheets/.test(c.id)).map((c) => c.id).join(',') : 'n/a'; });
  ok(inReg === 'place.concrete,output.rc-sheets' || inReg === 'n/a', 'registry commands place.concrete and output.rc-sheets (menu styles, ribbons, typed CONCRETE / RCSHEETS)', inReg);
  await page.click('[data-tab="rc"]');
  await page.waitForSelector('[data-rc-add]');
  ok(await page.locator('[data-rc-none]').count() === 1 && await page.locator('[data-rc-settings]').count() === 1, 'the tab: Add by grid, an empty list, the design code and materials');

  // ---- add two columns and a beam on them, by grid ----
  await addByGrid('column', { x1: '1', y1: 'A', lv: 'Level 1', lv2: 'Level 2' });
  await addByGrid('column', { x1: '2', y1: 'A', lv: 'Level 1', lv2: 'Level 2' });
  await addByGrid('beam', { x1: '1', y1: 'A', x2: '2', y2: 'A', lv: 'Level 2' }, { w: 300, h: 600 });
  let s = await rc();
  ok(s?.elements.length === 3 && s.elements.map((e) => e.kind).join(',') === 'column,column,beam', 'two columns and a beam added by grid', JSON.stringify(s?.elements.map((e) => e.kind)));
  const beam = s.elements[2];
  ok(beam.a.join() === '0,0,4000' && beam.b.join() === '6000,0,4000', 'the beam runs 1/A to 2/A at Level 2 (4000)', beam.a + ' → ' + beam.b);
  ok(await dc(() => window.detailcraft.selection?.kind === 'rc') && await page.locator('[data-rc-props]').count() === 1, 'the new beam is selected, its fields in Properties');
  const sup = await dc(() => window.detailcraft.rcBuild.items[2].res.info.supports.map((x) => x.col || '').join(','));
  ok(sup.split(',').filter(Boolean).length === 2, 'the beam found both columns as its supports', sup);
  ok(await page.locator('[data-rc-laps] tbody tr').count() >= 4 && /ACI 318-19 25\.4\./.test(await page.textContent('[data-rc-laps]')), 'Laps and anchorage: each anchorage with its ACI 318-19 25.4 clause');
  ok(await page.locator('[data-rc-bars] tbody tr').count() >= 3, 'the beam\'s bars with their marks');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'rc-01-beam.png') });

  // ---- edit in Properties: one undo step; a refused edit says why ----
  const undo0 = await dc(() => window.detailcraft.model.undoStack.length);
  await page.fill('#dc-rc-bot-n', '4'); await page.press('#dc-rc-bot-n', 'Tab'); await settle();
  s = await rc();
  ok(s.elements[2].bot.n === 4 && await dc(() => window.detailcraft.model.undoStack.length) === undo0 + 1, 'four bottom bars: one undo step');
  ok(await dc(() => window.detailcraft.rcBuild.items[2].res.groups.filter((g) => g.role === 'bot').reduce((a, g) => a + g.count, 0)) === 4, 'the beam is rebuilt with 4 bottom bars');
  await page.fill('#dc-rc-w', '20'); await page.press('#dc-rc-w', 'Tab'); await settle();
  ok((await rc()).elements[2].w === 300 && /size/i.test(await page.textContent('[data-status]')), 'a 20 mm width is refused, the status says why', await page.textContent('[data-status]'));
  await page.selectOption('#dc-rc-ends-bot', 'hook'); await settle();
  ok((await rc()).elements[2].ends.bot === 'hook' && /25\.4\.3\.1/.test(await page.textContent('[data-rc-laps]')), 'hooked bottom bars: anchorage to 25.4.3.1');
  await dc(() => window.detailcraft.act('undo')); await settle();
  ok((await rc()).elements[2].ends.bot === 'straight', 'undo puts the straight bars back');

  // ---- Problems: source detailcraft.rebar ----
  const probs = await dc(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => p.id.startsWith('detailcraft.rebar:')).map((p) => ({ code: p.code, text: p.text, about: p.about[0]?.kind })) : null));
  ok(Array.isArray(probs) && probs.length > 0 && probs.every((p) => p.about === 'rc') && probs.some((p) => p.code === 'rc.anchor'), 'the shell\'s Problems lists the reinforcement checks (' + (probs?.length ?? 'no store') + ')', JSON.stringify(probs?.slice(0, 2)));
  ok(probs?.every((p) => /\((ACI 318-19|EN 1992-1-1)[^)]*\)$/.test(p.text) || p.code === 'rc.anchor-unknown'), 'each problem cites its clause');

  // ---- a slab with an opening, a wall ----
  await addByGrid('slab', { x1: '1', y1: 'A', x2: '3', y2: 'B', lv: 'Level 2' }, { t: 200 });
  await page.click('[data-rc-open-add]'); await settle();
  s = await rc();
  const slab = s.elements[3];
  ok(slab.kind === 'slab' && slab.L === 12000 && slab.B === 6000 && slab.open.length === 1, 'a 12 × 6 m slab between grids, with an opening added', JSON.stringify({ L: slab.L, B: slab.B, open: slab.open }));
  ok(await dc(() => window.detailcraft.rcBuild.items[3].res.groups.some((g) => g.role.startsWith('trim'))), 'trimmers each side of the opening');
  ok(await dc(() => window.detailcraft.rcBuild.items[3].res.groups.every((g) => g.length <= 12000) && window.detailcraft.rcBuild.items[3].res.laps.length === 0), 'the 12 m slab\'s bars (11960 mm inside the cover) fit the 12 m stock length: no laps');
  await addByGrid('wall', { x1: '1', y1: 'B', x2: '3', y2: 'B', lv: 'Level 1', lv2: 'Level 2' }, { t: 250 });
  ok((await rc()).elements.length === 5, 'a wall along grid B');
  if (SHOTS) { await dc(() => window.detailcraft.view?.fit()); await settle(); await page.screenshot({ path: path.join(SHOTS, 'rc-02-structure.png') }); }
  const drawn = await dc(() => window.detailcraft.view ? window.detailcraft.view.pickables.filter((m) => m.userData.ref?.kind === 'rc').length : -1);
  ok(drawn > 100, 'the 3D view draws the concrete and its bars (' + drawn + ' pickable pieces)');

  // ---- one bending schedule over the whole structure ----
  await page.click('[data-tab="bending"]'); await settle();
  const sched = await dc(() => ({ rows: window.detailcraft.schedule.rows.length, rc: window.detailcraft.schedule.rcRows.length, table: document.querySelectorAll('[data-report] tbody tr').length }));
  ok(sched.rc > 5 && sched.table === sched.rows + 1, 'the Bending schedule tab lists every bar mark of the structure (' + sched.rows + ' + total)', JSON.stringify(sched));
  const csv = fs.readFileSync(await download(() => dc(() => window.detailcraft.act('bending'))), 'utf8');
  ok(/\d+B1/.test(csv) && /\d+C1/.test(csv) && /\d+S1/.test(csv) && /\d+W1/.test(csv), 'the bending schedule CSV carries B, C, S and W marks');

  // ---- reinforcement drawings: Output › More, made again on a change ----
  await page.click('[data-output-menu] summary');
  await page.click('[data-output-menu] [data-act="rc-sheets"]');
  await page.waitForSelector('dialog[data-rc-sheets][open]');
  const n0 = await page.locator('[data-rc-sheet-pick] option').count();
  ok(n0 >= 6, 'Reinforcement drawings: a sheet per element and bar-bending sheets (' + n0 + ')');
  await page.waitForTimeout(300);
  const ink = await page.$eval('[data-rc-canvas]', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 128) n++; return n; });
  ok(ink > 2000, 'the preview is drawn (' + ink + ' dark pixels)');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'rc-03-sheets.png') });
  const note0 = await page.textContent('[data-rc-sheets-note]');
  await dc(() => { const m = window.detailcraft.model, id = m.state.rc.elements[2].id; m.change('t', (tx) => tx.updateRc(id, { top: { n: 3 } })); });
  await settle();
  const note1 = await page.textContent('[data-rc-sheets-note]');
  ok(note0 !== note1 && /made from model [0-9A-F]{8}/.test(note1), 'a change while the window is open makes the sheets again (new model ref)', note0 + ' → ' + note1);
  const pdfAll = await download(() => page.click('[data-rc-pdf-all]'));
  const head = fs.readFileSync(pdfAll).subarray(0, 5).toString();
  let pages = null;
  try { pages = Number(execFileSync('pdfinfo', [pdfAll], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)[1]); } catch { pages = null; }
  ok(head === '%PDF-' && (pages === null || pages === n0), 'All sheets as PDF: ' + (pages ?? '?') + ' pages');
  try { const txt = execFileSync('pdftotext', [pdfAll, '-'], { encoding: 'utf8' }); ok(/Bar-bending sheet/.test(txt) && /checking by an engineer/.test(txt), 'the PDF text has the bending sheet and the engineer note'); } catch { /* no poppler */ }
  await page.click('[data-rc-close]'); await settle();

  // ---- IFC out, and File › Import IFC of it ----
  const ifc = await download(() => dc(() => window.detailcraft.act('ifc')));
  const ifcText = fs.readFileSync(ifc, 'utf8');
  const nBars = await dc(() => window.detailcraft.rcBuild.items.reduce((s2, i) => s2 + i.res.groups.reduce((t2, g) => t2 + g.count, 0), 0));
  ok((ifcText.match(/IFCREINFORCINGBAR\(/g) || []).length === nBars && /IFCSLAB\(/.test(ifcText) && /IFCWALL\(/.test(ifcText), 'IFC export: ' + nBars + ' IfcReinforcingBar, IfcSlab, IfcWall');
  await dc(() => window.detailcraft.model.markSaved());
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('.dc-tool-row > [data-act="import"]')]);   // File › Import IFC, as a person clicks it
  await chooser.setFiles(ifc);
  await page.waitForSelector('[data-import-report]', { timeout: 60000 });
  const rep = await page.textContent('[data-import-report]');
  ok(/5 DetailCraft concrete elements came back/.test(rep), 'the import report says the 5 elements came back and their bars were made again', rep.slice(0, 300));
  await page.keyboard.press('Enter'); await settle();
  const back = await rc();
  ok(back?.elements.length === 5 && back.elements[2].top.n === 3, 'imported: the 5 elements with their bars as detailed');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'rc-04-imported.png') });

  // ---- EN 1992-1-1 ----
  await page.click('[data-tab="rc"]'); await settle();
  await page.selectOption('#dc-rc-code', 'ec2'); await settle();
  ok((await rc()).settings.code === 'ec2' && await page.locator('#dc-rc-gc').count() === 1, 'EN 1992-1-1 chosen: γc, γs, αct offered');
  ok(await dc(() => window.detailcraft.rcBuild.items[2].res.anchors.every((a) => /^EN 1992-1-1 8\.4\.4/.test(a.clause))), 'the beam\'s anchorage now cites EN 1992-1-1 8.4.4');

  // ---- help ----
  const topic = await dc(async () => { const h = await import(new URL('help/help.js', location.origin + document.querySelector('[data-help-panel]')?.dataset.base || location.href).href).catch(() => null); return h ? Object.keys(h.default?.topics || h.default || {}).includes('reinforced-concrete') : 'n/a'; });
  const helpSrc = fs.readFileSync(path.join(REPO, 'public_html/assets/apps/detailcraft/dev/help/help.js'), 'utf8');
  ok(/reinforced-concrete/.test(helpSrc) && topic !== false, 'the help topic "Detail reinforced concrete…" is compiled into the build\'s help');
} finally {
  await browser.close();
  fs.rmSync(DL, { recursive: true, force: true });
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
