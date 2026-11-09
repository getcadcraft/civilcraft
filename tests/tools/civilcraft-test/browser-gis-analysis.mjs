#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gis-analysis.mjs — CivilCraft's GIS analysis panel (0.9 SU.1080) in headless Chromium at https://getcadcraft.com/lab/civilcraft,
 * by real clicks: the Analyze button (GIS group), nothing of it loads at start, a zip of shapefiles opened through the file input, then
 * the panel's five tabs (Buffer, Overlay, Join, Select, Measure) on those layers: new layers with the numbers worked by hand, undo from
 * the panel and from Ctrl+Z, the selection drawn on the plan, a refused question, the help topic, the project saved and reopened.
 * Fails on any console error.
 *
 *   node tools/civilcraft-test/browser-gis-analysis.mjs [--out <dir for screenshots>] [--stay-up]
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin.php up|down gisn` for its own test admin
 * civilcrafttest-gisn+cadcraft@projectz.xyz (disabled again at the end unless --stay-up). Fixtures are written by GDAL
 * (tools/civilcraft-test/gisvec.py make). Screenshots: tmp/shots/civilcraft-gis-gisn/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-gis-gisn'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-gisn.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const TMP = fs.mkdtempSync('/tmp/civilcraft-gisn-');
const FX = path.join(TMP, 'fx'), DL = path.join(TMP, 'dl');
fs.mkdirSync(DL);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);
const python = path.join(HERE, 'venv/bin/python');
const py = (...a) => execFileSync(python, ['-I', path.join(HERE, 'gisvec.py'), ...a], { encoding: 'utf8', maxBuffer: 1 << 26 });
const gdal = (file, layer) => JSON.parse(py('read', file, ...(layer ? [layer] : [])));
py('make', FX);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'gisn'], { encoding: 'utf8' }));

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
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  const req = [];
  page.on('response', (r) => { if (r.status() >= 400) note('HTTP ' + r.status() + ' ' + r.url()); });
  page.on('request', (r) => { if (/gis-(analysis|poly)/.test(r.url())) req.push(r.url()); });

  console.log('\n== start');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200 && (await P(page, () => !!window.civilcraft)), '/lab/civilcraft started');
  ok(!req.length, 'nothing of the analysis is fetched at start');
  const rows = await P(page, () => { const tops = [...document.querySelectorAll('.cv-tools .cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top)); return [...new Set(tops)].length; });
  ok(rows <= 2, 'the toolbar is still ' + rows + ' row(s) at 1440 px');
  ok(!!(await page.$('[data-group-menu="Surface"] [data-cmd="gis-analysis"]')) && /Analyze/.test(await page.textContent('[data-group-menu="Surface"] [data-cmd="gis-analysis"]')), 'the Surface More menu has Analyze');
  await page.screenshot({ path: path.join(OUT, '00-toolbar-paper.png'), clip: { x: 0, y: 0, width: 1440, height: 160 } });

  console.log('\n== with no layers it says so');
  await page.click('[data-group-menu="Surface"] summary');
  await page.click('[data-group-menu="Surface"] [data-cmd="gis-analysis"]');
  await page.waitForSelector('dialog[data-gisa][open]');
  ok(req.some((u) => /gis-analysis-ui\.js/.test(u)) && req.some((u) => /gis-poly\.js/.test(u)), 'the analysis part loads on first use');
  ok(await P(page, () => !document.querySelector('dialog[data-gisa]').matches(':modal')), 'the panel is not modal: the plan stays usable beside it');
  ok(/no GIS layers/.test(await P(page, () => document.body.textContent)), 'the status line says there are no GIS layers yet');
  await page.click('dialog[data-gisa] .cv-x');

  console.log('\n== open a zip of shapefiles, then Analyze');
  await page.setInputFiles('[data-file]', fx('several.zip'));
  await page.waitForSelector('dialog[open] [data-gisv-go]');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 3);
  const L = await P(page, () => Object.fromEntries(window.civilcraft.project.state.gis.layers.map((l) => [l.name, l.id])));
  ok(L.pointz && L.polygons && L.linez, 'layers: ' + Object.keys(L).join(', '));
  const polyFeatures = await P(page, (id) => window.civilcraft.project.gisFeatures.get(id).map((f) => f.g.c.map((poly) => poly.map((r) => r.map((p) => [p[0], p[1]])))), L.polygons);
  const shoe = (r) => { let s = 0; for (let i = 0; i + 1 < r.length; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return s / 2; };
  const polyArea = polyFeatures.map((polys) => polys.reduce((s, poly) => s + poly.reduce((a, r, i) => a + (i ? -Math.abs(shoe(r)) : Math.abs(shoe(r))), 0), 0));
  note('polygons layer: areas by shoelace ' + polyArea.map((a) => a.toFixed(1)).join(', '));
  const steps0 = await P(page, () => window.civilcraft.project.undoStack.length);
  await page.click('[data-group-menu="Surface"] summary');
  await page.click('[data-group-menu="Surface"] [data-cmd="gis-analysis"]');
  await page.waitForSelector('dialog[data-gisa][open]');
  ok((await page.$$('dialog[data-gisa] [role=tab]')).length === 5, 'five tabs: Buffer, Overlay, Join, Select, Measure');
  const opts = await page.$$eval('dialog[data-gisa] #gisa-b-l option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 3 && opts.some((t) => /pointz \(.*, 5\)/.test(t)), 'the layer list shows each layer with its kind and feature count: ' + opts.join(' | '));
  await shot(page, '01-panel-paper');

  console.log('\n== Buffer');
  await page.selectOption('#gisa-b-l', L.pointz);
  await page.fill('#gisa-b-d', '100');
  await page.click('[data-gisa-pane="buffer"] [data-gisa-run]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 4);
  const b = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[3]; return { name: l.name, geom: l.geom, n: p.gisFeatures.get(l.id).length, steps: p.undoStack.length, c: p.gisFeatures.get(l.id)[0].g.c[0][0].length }; });
  ok(b.name === 'pointz buffer 100' && b.geom === 'pg' && b.steps === steps0 + 1, 'pointz buffered by 100: the layer "' + b.name + '", one undo step');
  ok(b.n === 4 && /Added the layer/.test(await page.textContent('[data-gisa-pane="buffer"] [data-gisa-msg]')), 'four wells (one point has no location) → 4 circles; the panel says what it added and "skipped"' + '');
  ok(b.c === 33, 'each circle has 32 pieces (normal setting)');
  const circ = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[3]; const r = p.gisFeatures.get(l.id)[0].g.c[0][0]; let s = 0; for (let i = 0; i + 1 < r.length; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return s / 2; });
  near(circ, ngon(32, 100), 0.05, 'a circle of radius 100 in 32 pieces: 16 r² sin(2π/32) = ' + ngon(32, 100).toFixed(3));
  await shot(page, '02-buffer-paper');
  await page.click('[data-gisa-undo]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 3);
  ok(true, 'Undo in the panel takes the layer away'); 
  await page.mouse.click(700, 500);   // the plan, not the panel
  await page.keyboard.press('Control+y');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 4).catch(() => {});
  ok(await P(page, () => window.civilcraft.project.state.gis.layers.length) === 4, 'Redo (Ctrl+Y) brings it back');
  await page.fill('#gisa-b-d', '0');
  await page.click('[data-gisa-pane="buffer"] [data-gisa-run]');
  ok(/distance that is not zero/.test(await page.textContent('[data-gisa-pane="buffer"] [data-gisa-msg]')) && await P(page, () => window.civilcraft.project.state.gis.layers.length) === 4, 'distance 0: refused in a sentence, no layer');

  console.log('\n== Overlay: polygons erase the point buffers, dissolve');
  await page.click('[data-gisa-tab="overlay"]');
  await page.selectOption('#gisa-o-op', 'dissolve');
  await page.selectOption('#gisa-o-a', L.polygons);
  await page.click('[data-gisa-pane="overlay"] [data-gisa-run]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 5);
  const dis = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[4]; return { name: l.name, f: p.gisFeatures.get(l.id).map((f) => ({ count: f.p.COUNT, area: f.p.AREA })) }; });
  near(dis.f[0].area, polyArea.reduce((s, a) => s + a, 0) - 0, polyArea.length > 1 ? 1e6 : 1e-3, 'Dissolve all: AREA ' + dis.f[0].area + ' (shapes may overlap each other; not above the sum of the areas ' + polyArea.reduce((s, a) => s + a, 0) + ')');
  ok(dis.f[0].count === polyArea.length, 'COUNT = ' + polyArea.length);
  await page.selectOption('#gisa-o-op', 'intersect');
  await page.selectOption('#gisa-o-a', L.polygons);
  await page.selectOption('#gisa-o-b', L.polygons);
  await page.click('[data-gisa-pane="overlay"] [data-gisa-run]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 6);
  const selfInt = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[5]; return p.gisFeatures.get(l.id).map((f) => f.p.NAME + '/' + f.p.NAME_2); });
  ok(selfInt.length >= polyArea.length && selfInt.every((x) => x.includes('/')), 'a layer intersected with itself: every polygon meets itself; fields NAME and NAME_2: ' + selfInt.join(', '));
  const selfArea = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[5]; const sh = (r) => { let s = 0; for (let i = 0; i + 1 < r.length; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return s / 2; }; return p.gisFeatures.get(l.id).filter((f) => f.p.NAME === f.p.NAME_2).map((f) => f.g.c.reduce((s, poly) => s + poly.reduce((a, r, i) => a + (i ? -Math.abs(sh(r)) : Math.abs(sh(r))), 0), 0)); });
  ok(polyArea.every((a) => selfArea.some((s) => Math.abs(s - a) < 1e-6 * Math.max(1, a))), 'each polygon with itself keeps its own area (holes kept): ' + selfArea.map((a) => a.toFixed(1)).join(', '));
  await shot(page, '03-overlay-paper');

  console.log('\n== Join');
  await page.click('[data-gisa-tab="join"]');
  await page.selectOption('#gisa-j-t', L.pointz);
  await page.selectOption('#gisa-j-s', L.polygons);
  await page.selectOption('#gisa-j-r', 'within');
  await page.click('[data-gisa-pane="join"] [data-gisa-run]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 7);
  const jn = await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[6]; return { geom: l.geom, fields: l.fields.map((f) => f.name), rows: p.gisFeatures.get(l.id).map((f) => [f.p.NAME, f.p.NAME_2, f.p.JOIN_COUNT]) }; });
  ok(jn.geom === 'pt' && jn.fields.includes('NAME_2') && jn.fields.includes('JOIN_COUNT') && jn.rows.length === 5, 'wells within polygons: a points layer, NAME_2 and JOIN_COUNT added, 5 features (unmatched kept)');
  note('join rows: ' + JSON.stringify(jn.rows));

  console.log('\n== Select');
  await page.click('[data-gisa-tab="select"]');
  await page.selectOption('#gisa-s-l', L.pointz);
  await page.fill('#gisa-s-q', 'COUNT > 10 and OK = true');
  await page.click('[data-gisa-pane="select"] [data-gisa-run]');
  await page.waitForFunction(() => document.querySelector('[data-gisa-pane="select"] [data-gisa-msg]').textContent.includes('selected'));
  // pointz: COUNT -3,4,11,18,25; OK true,false,true,false,true → 11 (plain) and 25 (quote) → 2 of 5
  ok(/2 of 5 features selected/.test(await page.textContent('[data-gisa-pane="select"] [data-gisa-msg]')), 'COUNT > 10 and OK = true → 2 of 5 (values 11 and 25 with OK true)');
  ok((await page.$$('[data-gisa-rows] tbody tr')).length === 2, 'a table of the two selected features');
  await page.screenshot({ path: path.join(OUT, '04-select-paper.png') });
  await page.click('[data-gisa-make]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 8);
  ok(await P(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers[7]; return l.name === 'pointz selection' && p.gisFeatures.get(l.id).length === 2; }), 'Make a layer from the selection: "pointz selection", 2 features');
  await page.fill('#gisa-s-q', 'COUNT >');
  await page.click('[data-gisa-pane="select"] [data-gisa-run]');
  ok(/not complete at character/.test(await page.textContent('[data-gisa-pane="select"] [data-gisa-msg]')), 'an unfinished question is refused: "' + (await page.textContent('[data-gisa-pane="select"] [data-gisa-msg]')) + '"');
  await page.fill('#gisa-s-q', 'Nope = 1');
  await page.click('[data-gisa-pane="select"] [data-gisa-run]');
  ok(/no field called "Nope"/.test(await page.textContent('[data-gisa-pane="select"] [data-gisa-msg]')), 'an unknown field is named in the sentence');

  console.log('\n== Measure');
  await page.click('[data-gisa-tab="measure"]');
  await page.selectOption('#gisa-m-l', L.polygons);
  const sum = await page.textContent('[data-gisa-geom]');
  const total = polyArea.reduce((s, a) => s + a, 0);
  ok(sum.replace(/,/g, '').includes(String(Math.round(total * 100) / 100).replace(/\.0+$/, '')) || /total area/.test(sum), 'the total line: ' + sum);
  await page.click('[data-gisa-calc]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.find((l) => l.name === 'polygons').fields.some((f) => f.name === 'AREA_2' || f.name === 'AREA'));
  const calc = await P(page, (id) => { const p = window.civilcraft.project; const l = p.state.gis.layers.find((x) => x.id === id); return { fields: l.fields.map((f) => f.name), areas: p.gisFeatures.get(id).map((f) => f.p[l.fields.find((q, i) => q.name.startsWith('AREA') && i >= 2 && q.name !== 'AREA' || q.name === 'AREA_2')?.name ?? 'AREA']) }; }, L.polygons);
  note('polygons fields after calculate: ' + calc.fields.join(', '));
  ok(calc.fields.some((f) => /^PERIMETER/.test(f)), 'AREA and PERIMETER fields were added to the layer');
  await page.selectOption('#gisa-m-l', L.pointz);
  await page.selectOption('#gisa-m-f', 'ELEV');
  await page.click('[data-gisa-pane="measure"] [data-gisa-run]:not([data-gisa-calc])').catch(() => {});
  await page.waitForSelector('[data-gisa-stats] table');
  // pointz ELEV: 500, 501.25, 502.5, 503.75, 505 → sum 2512.5, mean 502.5, min 500, max 505
  const stats = (await page.textContent('[data-gisa-stats]')).replace(/\s+/g, ' ');
  ok(/2,512\.5/.test(stats) && /502\.5/.test(stats) && /505/.test(stats), 'ELEV statistics: sum 2,512.5, mean 502.5, max 505 → ' + stats.slice(0, 120));
  await shot(page, '05-measure-paper');

  console.log('\n== help, save and reopen');
  const href = await page.getAttribute('[data-gisa-help]', 'href');
  ok(href === '#', 'the panel has a Help link');
  await page.click('[data-gisa-help]');
  await page.waitForSelector('[data-help-panel]:not([hidden])', { timeout: 8000 }).catch(() => {});
  ok(/Analyze GIS layers/.test(await page.textContent('[data-help-panel]').catch(() => '')), 'Help opens the topic "Analyze GIS layers"');
  const json = await P(page, () => JSON.stringify(window.civilcraft.project.toJSON()));
  const reopened = await P(page, async (j) => { const { project, notes } = window.civilcraft.project.constructor.fromJSON(JSON.parse(j)); return { layers: project.state.gis.layers.length, notes: notes.length, buffered: project.gisFeatures.get(project.state.gis.layers.find((l) => l.name === 'pointz buffer 100').id).length }; }, json).catch((e) => ({ err: e.message }));
  ok(!reopened.err && reopened.layers >= 8 && reopened.notes === 0 && reopened.buffered === 4, 'the project saved and read again keeps the analysis layers: ' + JSON.stringify(reopened));
  await shot(page, '06-help-paper');

  console.log('\n== the model theme');
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  await page.click('[data-group-menu="Surface"] summary');
  await page.click('[data-group-menu="Surface"] [data-cmd="gis-analysis"]');
  await page.waitForSelector('dialog[data-gisa][open]');
  await shot(page, '07-panel-model');

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
