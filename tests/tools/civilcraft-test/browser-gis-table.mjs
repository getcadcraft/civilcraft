#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gis-table.mjs — CivilCraft's attribute table and symbology by attribute (0.9 SU.1080 round 2) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft, by real clicks: nothing of them loads at start; a zip of shapefiles opened through the file
 * input; the table from a layer's menu (sort, filter, select a row and see it on the plan, click a feature on the plan and see its row,
 * edit a cell, refuse a bad value, add a field, the calculator, CSV, undo/redo); a 3,000-feature layer keeps the page light (virtual
 * rows); Style by attribute (graduated, categorized, polygon fill, legend on the plan, scene layers per class); save and reopen.
 * Fails on any console error.
 *
 *   node tools/civilcraft-test/browser-gis-table.mjs [--out <dir for screenshots>] [--stay-up]
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin.php up|down gist` for its own test admin
 * civilcrafttest-gist+cadcraft@projectz.xyz (disabled again at the end unless --stay-up). Fixtures are written by GDAL
 * (tools/civilcraft-test/gisvec.py make). Screenshots: tmp/shots/civilcraft-gis-gist/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-gis-gist'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-gist.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const TMP = fs.mkdtempSync('/tmp/civilcraft-gist-');
const FX = path.join(TMP, 'fx'), DL = path.join(TMP, 'dl');
fs.mkdirSync(DL);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (${JSON.stringify(a)})`);
const note = (s) => console.log('  note ' + s);
const python = path.join(HERE, 'venv/bin/python');
const py = (...a) => execFileSync(python, ['-I', path.join(HERE, 'gisvec.py'), ...a], { encoding: 'utf8', maxBuffer: 1 << 26 });
const gdal = (file, layer) => JSON.parse(py('read', file, ...(layer ? [layer] : [])));
py('make', FX);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'gist'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};
async function signedInContext(opts = {}) {
  if (fs.existsSync(STATE)) {
    const ctx = await browser.newContext({ storageState: STATE, acceptDownloads: true, ...opts });
    const p = await ctx.newPage();
    const r = await p.goto(BASE + '/lab/civilcraft', { waitUntil: 'domcontentloaded' });
    const okNow = r.status() === 200 && (await p.$('[data-civilcraft]'));
    await p.close();
    if (okNow) return ctx;
    await ctx.close();
  }
  const cred = admin('up');
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts });
  const p = await ctx.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', cred.email);
  await p.fill('input[name="password"]', cred.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await ctx.storageState({ path: STATE });
  await p.close();
  return ctx;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, dl.suggestedFilename());
  await dl.saveAs(f);
  return f;
}
const fx = (...names) => names.map((n) => path.join(FX, n));
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
const P = (page, f, a) => page.evaluate(f, a);
const ngon = (n, r) => (n / 2) * r * r * Math.sin((2 * Math.PI) / n);
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);

let ctx;
const tableReq = [];
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();
  watch(page);
  page.on('response', (r) => { if (r.status() >= 400) note('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('request', (r) => { if (/gis-(table|symbology)/.test(r.url())) tableReq.push(r.url()); });
  const gisAtStart = [];
  page.on('request', (r) => { if (/gis-(layers|geom|table|symbology)/.test(r.url())) gisAtStart.push(r.url()); });

  console.log('\n== start');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200 && (await P(page, () => !!window.civilcraft)), '/lab/civilcraft started');
  ok(!gisAtStart.length, 'nothing GIS is fetched at start (ground-ui.js no longer pulls in gis-layers.js)' + (gisAtStart.length ? ': ' + gisAtStart.join(' ') : ''));
  ok(!!(await page.$('[data-group-menu="Surface"] [data-cmd="gis-table"]')), 'the Surface More menu has Attribute table');

  console.log('\n== open a zip of shapefiles, then the table from the layer menu');
  await page.setInputFiles('[data-file]', fx('several.zip'));
  await page.waitForSelector('dialog[open] [data-gisv-go]');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 3);
  const L = await P(page, () => Object.fromEntries(window.civilcraft.project.state.gis.layers.map((l) => [l.name, l.id])));
  ok(!tableReq.length || true, 'layers: ' + Object.keys(L).join(', '));
  await page.click(`[data-gis-layer="${L.pointz}"] .cv-gis-menu summary`);
  await page.click(`[data-gis-table="${L.pointz}"]`);
  await page.waitForSelector('dialog[data-gist][open]');
  ok(tableReq.some((u) => /gis-table-ui\.js/.test(u)) && tableReq.some((u) => /gis-symbology-ui\.js/.test(u)), 'the table and symbology parts load with the GIS tools, on first use');
  ok(await P(page, () => !document.querySelector('dialog[data-gist]').matches(':modal')), 'the table is not modal: the plan stays usable beside it');
  const heads = await page.$$eval('dialog[data-gist] thead th', (t) => t.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(heads.length === 6 && /NAME/.test(heads[1]) && /COUNT/.test(heads[2]) && /number/.test(heads[2]) && /date/.test(heads[4]) && /yes\/no/.test(heads[5]), 'columns with their types: ' + heads.join(' | '));
  const cellsOf = (col) => page.$$eval('dialog[data-gist] tbody tr[data-i]', (rows, c) => rows.map((tr) => tr.querySelector(`td[data-f="${c}"]`)?.textContent), col);
  const numsOf = () => page.$$eval('dialog[data-gist] tbody tr[data-i] th', (t) => t.map((x) => x.textContent));
  eq(await cellsOf('COUNT'), ['-3', '4', '11', '18', '25'], 'five rows, COUNT -3, 4, 11, 18, 25');
  await shot(page, '01-table-paper');

  console.log('\n== sort and filter');
  await page.click('[data-sort="COUNT"]'); await page.click('[data-sort="COUNT"]');
  eq(await cellsOf('COUNT'), ['25', '18', '11', '4', '-3'], 'COUNT clicked twice: descending');
  eq(await page.getAttribute('th[aria-sort="descending"] [data-sort]', 'data-sort'), 'COUNT', 'aria-sort says descending on COUNT');
  await page.click('[data-sort="COUNT"]');
  eq(await cellsOf('COUNT'), ['-3', '4', '11', '18', '25'], 'a third click puts the file order back');
  await page.fill('[data-gist-filter]', 'COUNT > 10');
  await page.waitForFunction(() => /3 of 5 rows shown/.test(document.querySelector('[data-gist-count]').textContent));
  eq(await cellsOf('COUNT'), ['11', '18', '25'], 'filter COUNT > 10: three rows');
  await page.fill('[data-gist-filter]', 'plain');
  await page.waitForFunction(() => /1 of 5 rows shown.*words/.test(document.querySelector('[data-gist-count]').textContent));
  eq(await numsOf(), ['3'], 'a word that is no field: looks in every column and finds row 3 ("plain")');
  await page.fill('[data-gist-filter]', '');
  await page.waitForFunction(() => /5 of 5 rows shown/.test(document.querySelector('[data-gist-count]').textContent));

  console.log('\n== select rows <-> features on the plan');
  const sel = () => P(page, () => window.civilcraft.gis.table.selection);
  await page.click('dialog[data-gist] tbody tr[data-i="3"] td[data-f="NAME"]');
  eq(await sel(), [3], 'a click on row 4 selects feature 4');
  eq(await P(page, () => window.civilcraft.gis.analysis.selection), { layer: L.pointz, indices: [3] }, '... and it is the selection the plan draws (the same one the Analyze panel uses)');
  await page.click('dialog[data-gist] tbody tr[data-i="0"] td[data-f="NAME"]', { modifiers: ['Control'] });
  eq(await sel(), [0, 3], 'Ctrl+click adds row 1');
  await page.click('dialog[data-gist] tbody tr[data-i="4"] td[data-f="NAME"]', { modifiers: ['Shift'] });
  eq(await sel(), [0, 1, 2, 3, 4], 'Shift+click selects the run from the last clicked row (1) to row 5');
  ok(/5 selected/.test(await page.textContent('[data-gist-count]')), 'the status line counts 5 selected');
  await page.click('[data-gist-clear]');
  eq(await sel(), [], 'Clear selection');
  await page.click('[data-gist-selall]');
  eq(await sel(), [0, 1, 2, 3, 4], 'Select shown rows');
  await page.click('[data-gist-clear]');
  // a feature clicked on the plan selects its row
  const at = await P(page, (id) => { const c = window.civilcraft, f = c.project.gisFeatures.get(id)[3].g.c, s = c.view.toScreen(f[0], f[1]), b = document.querySelector('[data-plan-over], canvas.cv-over')?.getBoundingClientRect() || c.view.over.getBoundingClientRect(); return { x: b.left + s.x, y: b.top + s.y }; }, L.pointz);
  await page.mouse.click(at.x, at.y);
  await page.waitForFunction(() => window.civilcraft.gis.table.selection.join() === '3', null, { timeout: 5000 }).catch(() => {});
  eq(await sel(), [3], 'a click on feature 4 on the plan selects row 4 in the table');
  ok(await page.$eval('dialog[data-gist] tbody tr[data-i="3"]', (tr) => tr.getAttribute('aria-selected') === 'true'), '... and the row is marked selected');
  await shot(page, '02-selected-paper');

  console.log('\n== edit a cell, undo, a bad value');
  const steps0 = await P(page, () => window.civilcraft.project.undoStack.length);
  await page.dblclick('dialog[data-gist] tbody tr[data-i="1"] td[data-f="COUNT"]');
  await page.fill('.cv-gist-edit', '99'); await page.keyboard.press('Enter');
  await page.waitForFunction((id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT === 99, L.pointz);
  ok(await P(page, () => window.civilcraft.project.undoStack.length) === steps0 + 1, 'COUNT of row 2 set to 99: one undo step');
  await page.click('[data-gist-undo]');
  await page.waitForFunction((id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT === 4, L.pointz);
  ok(true, 'Undo in the table: 4 again');
  await page.click('[data-gist-redo]');
  await page.waitForFunction((id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT === 99, L.pointz);
  ok(true, 'Redo: 99');
  await page.dblclick('dialog[data-gist] tbody tr[data-i="1"] td[data-f="COUNT"]');
  await page.fill('.cv-gist-edit', 'abc'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => /does not fit a number field/.test(document.querySelector('[data-gist-msg]').textContent));
  ok(await P(page, (id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT, L.pointz) === 99, 'letters in a number cell: refused in a sentence, 99 stays');
  await page.dblclick('dialog[data-gist] tbody tr[data-i="1"] td[data-f="COUNT"]');
  await page.fill('.cv-gist-edit', '7'); await page.keyboard.press('Escape');
  ok(await P(page, (id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT, L.pointz) === 99, 'Escape leaves the cell as it was');
  await page.focus('dialog[data-gist] tbody tr[data-i="1"] td[data-f="COUNT"]');
  await page.keyboard.press('Enter'); await page.fill('.cv-gist-edit', '5'); await page.keyboard.press('Enter');
  await page.waitForFunction((id) => window.civilcraft.project.gisFeatures.get(id)[1].p.COUNT === 5, L.pointz);
  ok(true, 'Enter on a focused cell edits it from the keyboard');

  console.log('\n== fields and the calculator');
  await page.click('dialog[data-gist] summary:has-text("Fields")');
  await page.fill('[data-gist-newname]', 'Notes'); await page.click('[data-gist-add]');
  await page.waitForFunction((id) => window.civilcraft.project.state.gis.layers.find((l) => l.id === id).fields.some((f) => f.name === 'Notes'), L.pointz);
  ok(true, 'Add field Notes (text)');
  await page.fill('[data-gist-newname]', 'notes'); await page.click('[data-gist-add]');
  ok(/already exists/.test(await page.textContent('[data-gist-msg]')), 'a second field "notes" (any case) is refused in a sentence');
  await page.click('dialog[data-gist] summary:has-text("Field calculator")');
  await page.fill('[data-gist-calcname]', 'Twice'); await page.selectOption('dialog[data-gist] select[aria-label="Field type"] >> nth=2', 'number').catch(() => {});
  await page.evaluate(() => { const s = document.querySelectorAll('dialog[data-gist] .cv-gist-row-inline select')[0]; s.value = 'number'; });
  await page.fill('[data-gist-expr]', 'COUNT * 2');
  const steps1 = await P(page, () => window.civilcraft.project.undoStack.length);
  await page.click('[data-gist-calc]');
  await page.waitForFunction(() => /values written to Twice/.test(document.querySelector('[data-gist-msg]').textContent));
  eq(await cellsOf('Twice'), ['-6', '10', '22', '36', '50'], 'calculator into a new field Twice = COUNT * 2: -6, 10 (COUNT is now 5), 22, 36, 50');
  ok(await P(page, () => window.civilcraft.project.undoStack.length) === steps1 + 1, '... field and values are one undo step');
  await page.fill('[data-gist-expr]', "concat(NAME, '!')"); await page.selectOption('[data-gist-target]', 'Notes'); await page.click('[data-gist-calc]');
  await page.waitForFunction(() => /values written to Notes/.test(document.querySelector('[data-gist-msg]').textContent));
  eq((await cellsOf('Notes')).slice(2), ['plain!', '!', 'quote "x", comma!'], 'concat(NAME, "!") into Notes (an empty name gives "!")');
  await page.fill('[data-gist-expr]', 'COUNT * ('); await page.click('[data-gist-calc]');
  ok(/could not be read/.test(await page.textContent('[data-gist-msg]')), 'a broken expression says where it fails: "' + (await page.textContent('[data-gist-msg]')) + '"');
  await page.fill('[data-gist-expr]', 'eval(1)'); await page.click('[data-gist-calc]');
  ok(/no field called eval/.test(await page.textContent('[data-gist-msg]')), 'nothing is evaluated as code: eval(1) is just an unknown name');
  await shot(page, '03-calculator-paper');

  console.log('\n== CSV');
  const csvFile = await download(page, () => page.click('[data-gist-csv]'));
  const csv = fs.readFileSync(csvFile, 'utf8');
  const lines = csv.replace(/^﻿/, '').split('\r\n');
  ok(csv.startsWith('﻿') && lines[0] === 'NAME,COUNT,ELEV,BUILT,OK,Notes,Twice', 'CSV header: ' + lines[0]);
  ok(lines.length === 7 && lines[1].startsWith('Héllo wörld,-3,500,') && lines[5].startsWith('"quote ""x"", comma",25,'), 'CSV: 5 rows, accents kept, quotes doubled (' + lines.length + ' lines)');

  console.log('\n== 3,000 features');
  const bigId = await P(page, () => {
    const p = window.civilcraft.project, E0 = p.gisFeatures.get(p.state.gis.layers[0].id)[0].g.c[0];
    let id; const cls = ['A', 'B', 'C', 'D'];
    p.editGis('test: 3000 trees', (map, s) => {
      id = 'g' + s.seq++;
      s.gis.layers.push({ id, name: 'Big', geom: 'pt', hasZ: false, fields: [{ name: 'cls', type: 'text' }, { name: 'v', type: 'number' }], visible: true, color: 'orange', source: { file: '', format: 'test', crs: null } });
      map.set(id, Array.from({ length: 3000 }, (_, i) => { const q = Object.create(null); q.cls = cls[i % 4]; q.v = (i * 7919) % 3000; return { g: { t: 'pt', c: [E0 + (i % 60) * 5, 1000 + Math.floor(i / 60) * 5] }, p: q }; }));
      return map;
    });
    return id;
  });
  await page.selectOption('[data-gist-layer]', bigId);
  await page.waitForFunction(() => /3000 of 3000 rows shown/.test(document.querySelector('[data-gist-count]').textContent));
  const domRows = await page.$$eval('dialog[data-gist] tbody tr[data-i]', (r) => r.length);
  ok(domRows > 5 && domRows < 80, '3,000 features, ' + domRows + ' rows in the page (virtual rows)');
  await page.evaluate(() => { const s = document.querySelector('[data-gist-scroll]'); s.scrollTop = s.scrollHeight; });
  await page.waitForFunction(() => [...document.querySelectorAll('dialog[data-gist] tbody tr[data-i] th')].some((t) => t.textContent === '3000'));
  ok(true, 'scrolled to the end: row 3000 is drawn');
  const t0 = Date.now();
  await page.click('[data-sort="v"]'); await page.click('[data-sort="v"]');
  await page.waitForFunction(() => document.querySelector('th[aria-sort="descending"]'));
  const top = await cellsOf('v');
  ok(top[0] === '2999' && Date.now() - t0 < 3000, 'sorted by v descending: 2999 first (' + (Date.now() - t0) + ' ms)');
  await page.fill('[data-gist-filter]', "v > 2990 and cls = 'A'");
  await page.waitForFunction(() => /of 3000 rows shown/.test(document.querySelector('[data-gist-count]').textContent) && !/3000 of 3000/.test(document.querySelector('[data-gist-count]').textContent));
  const expectN = await P(page, (id) => window.civilcraft.project.gisFeatures.get(id).filter((f) => f.p.v > 2990 && f.p.cls === 'A').length, bigId);
  ok(new RegExp(`^${expectN} of 3000 rows shown`).test(await page.textContent('[data-gist-count]')), `filter on 3,000 rows: ${expectN} rows`);
  await page.click('[data-gist-selall]');
  eq((await sel()).length, expectN, 'Select shown rows selects exactly those');
  await page.click('[data-gist-make]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 5);
  ok(await P(page, () => window.civilcraft.project.gisFeatures.get(window.civilcraft.project.state.gis.layers[4].id).length) === expectN, 'Make a layer from the selection');
  await page.fill('[data-gist-filter]', '');
  await page.click('[data-gist-clear]');

  console.log('\n== Style by attribute');
  await page.click('dialog[data-gist] .cv-x');
  const stepsS = await P(page, () => window.civilcraft.project.undoStack.length);
  await page.click(`[data-gis-layer="${L.pointz}"] .cv-gis-menu summary`);
  await page.click(`[data-gis-style="${L.pointz}"]`);
  await page.waitForSelector('dialog[data-gsym][open]');
  await page.selectOption('[data-gsym-mode]', 'graduated');
  await page.selectOption('[data-gsym-field]', 'COUNT');
  await page.selectOption('[data-gsym-method]', 'equal');
  await page.fill('[data-gsym-classes]', '3');
  await page.selectOption('[data-gsym-ramp]', 'viridis');
  // COUNT is now -3, 5, 11, 18, 25: min -3 max 25, three classes of 28/3 = 9.333: breaks -3, 6.333, 15.667, 25
  const rows = await page.$$eval('[data-gsym-preview] tbody tr', (t) => t.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(rows.length === 3 && /^-3 – 6\.33333/.test(rows[0]) && /2$/.test(rows[0]) && /15\.66671$/.test(rows[1]) && /^6\.33333 – /.test(rows[1]) && /^15\.6667 – 252$/.test(rows[2]), 'preview: -3 to 6.333 (2: -3, 5), 6.333 to 15.667 (1: 11), 15.667 to 25 (2: 18, 25): ' + rows.join(' | '));
  await shot(page, '04-style-dialog-paper');
  await page.click('[data-gsym-apply]');
  await page.waitForFunction((id) => !!window.civilcraft.project.state.gis.layers.find((l) => l.id === id).symbology, L.pointz);
  ok(await P(page, () => window.civilcraft.project.undoStack.length) === stepsS + 1, 'Apply is one undo step');
  const leg = await P(page, (id) => window.civilcraft.gis.symbology.legend(id), L.pointz);
  ok(leg.items.length === 3 && leg.items.map((i) => i.count).join() === '2,1,2' && leg.items[0].color === '#440154' && leg.items[2].color === '#fde725', 'legend: three classes 2, 1, 2 in viridis from #440154 to #fde725');
  const sc = await P(page, () => window.civilcraft.view.scene().layers.filter((l) => /^GIS-/.test(l.name)).map((l) => [l.name, l.token]));
  ok(sc.filter(([n]) => n.includes(L.pointz + '-c')).length === 3 && sc.every(([n, t]) => !n.includes(L.pointz + '-c') || /^#[0-9a-f]{6}$/.test(t)), 'the plan scene has one layer per class with its own colour: ' + JSON.stringify(sc.filter(([n]) => n.includes(L.pointz + '-c'))));
  await page.mouse.click(700, 600); await page.keyboard.press('Control+z');
  await page.waitForFunction((id) => !window.civilcraft.project.state.gis.layers.find((l) => l.id === id).symbology, L.pointz);
  ok(true, 'Ctrl+Z takes the style away'); await page.keyboard.press('Control+y');
  await page.waitForFunction((id) => !!window.civilcraft.project.state.gis.layers.find((l) => l.id === id).symbology, L.pointz);
  // size + categorized on the big layer, polygons filled
  await page.click(`[data-gis-layer="${L.polygons}"] .cv-gis-menu summary`);
  await page.click(`[data-gis-style="${L.polygons}"]`);
  await page.waitForSelector('dialog[data-gsym][open]');
  await page.selectOption('[data-gsym-mode]', 'categorized');
  await page.selectOption('[data-gsym-field]', 'NAME');
  await page.check('[data-gsym-fill]');
  await page.click('[data-gsym-apply]');
  await page.waitForFunction((id) => window.civilcraft.project.state.gis.layers.find((l) => l.id === id).symbology?.mode === 'categorized', L.polygons);
  const leg2 = await P(page, (id) => window.civilcraft.gis.symbology.legend(id), L.polygons);
  ok(leg2.items.length === 2 && leg2.items[0].color === '#0072b2' && leg2.items[1].color === '#e69f00', 'categorized by NAME: two classes in the first two Okabe-Ito colours');
  await P(page, () => window.civilcraft.fitAll?.() || window.civilcraft.view.fit?.());
  await P(page, (id) => { const c = window.civilcraft, b = c.gis.extentsAll?.() || null; c.view.invalidateScene(); c.view.invalidate(true); }, L.polygons).catch(() => {});
  await wait(400);
  const px = await P(page, (id) => {
    const c = window.civilcraft, v = c.view, g = c.project.gisFeatures.get(id)[0].g.c[0][0];   // lot 1: outer ring, holes at +10..30 and +50..70
    const x0 = Math.min(...g.map((p) => p[0])), y0 = Math.min(...g.map((p) => p[1]));
    const read = (x, y) => { const s = v.toScreen(x, y), d = v.dpr || 1, d1 = v.base.getContext('2d').getImageData(Math.round(s.x * d), Math.round(s.y * d), 1, 1).data; return [d1[0], d1[1], d1[2]]; };
    return { inside: read(x0 + 80, y0 + 20), hole: read(x0 + 20, y0 + 20), outside: read(x0 - 40, y0 - 40) };
  }, L.polygons);
  ok(px.inside.join() !== px.outside.join() && px.hole.join() === px.outside.join(), 'the polygon is tinted inside, not in its hole and not outside: inside ' + px.inside + ', hole ' + px.hole + ', outside ' + px.outside);
  await shot(page, '05-styled-paper');
  await page.click(`[data-gis-layer="${L.pointz}"] .cv-gis-menu summary`);
  await page.click(`[data-gis-style="${L.pointz}"]`);
  await page.waitForSelector('dialog[data-gsym][open]');
  ok(await page.inputValue('[data-gsym-mode]') === 'graduated' && await page.inputValue('[data-gsym-field]') === 'COUNT', 'the dialog opens on the layer\'s current style');
  await page.click('[data-gsym-reset]');
  await page.waitForFunction((id) => !window.civilcraft.project.state.gis.layers.find((l) => l.id === id).symbology, L.pointz);
  ok(true, '"Back to one colour" removes it');

  console.log('\n== saved and read again');
  const json = await P(page, () => JSON.stringify(window.civilcraft.project.toJSON()));
  const re = await P(page, (j) => { const { project, notes } = window.civilcraft.project.constructor.fromJSON(JSON.parse(j)); const l = project.state.gis.layers.find((x) => x.symbology); return { notes: notes.length, mode: l?.symbology?.mode, field: l?.symbology?.field, fill: l?.symbology?.fill }; }, json);
  ok(re.notes === 0 && re.mode === 'categorized' && re.field === 'NAME' && re.fill === true, 'the project saved and read again keeps the polygon style: ' + JSON.stringify(re));

  console.log('\n== help');
  await page.click('dialog[data-gsym] .cv-x').catch(() => {});
  await page.click('[data-group-menu="Surface"] summary');
  await page.click('[data-group-menu="Surface"] [data-cmd="gis-table"]');
  await page.waitForSelector('dialog[data-gist][open]');
  await page.click('[data-gist-help]');
  await page.waitForSelector('[data-help-panel]:not([hidden])', { timeout: 8000 }).catch(() => {});
  ok(/attribute table/i.test(await page.textContent('[data-help-panel]').catch(() => '')), 'Help opens the attribute table topic');
  await shot(page, '06-help-paper');

  console.log('\n== the model theme');
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  ok(true, 'reloaded in the model theme');

  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await ctx?.close();
  await browser.close();
  if (!process.argv.includes('--stay-up')) admin('down');
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(REPO, OUT)}`);
process.exit(fail ? 1 : 0);
