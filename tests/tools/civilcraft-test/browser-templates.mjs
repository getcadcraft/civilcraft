#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-templates.mjs — CivilCraft 0.9 SU.1110 + WB.6 (session civil-templates-09) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft: a person reaches every part from the page.
 *   Surface › More › Corridor templates… opens the manager (examples marked for checking by an engineer); an example into the project;
 *   the template editor (creation tool): a new template with a value, a point and a component, its drawing and problems, saved as one
 *   undo step; Save to My library (kept in this browser); export and import a .cctemplates.json file.
 *   An alignment's Properties: Build from templates by station (one undo step), a curb added on the right only, a second region with a
 *   wall end condition, a use's own value, the components' volumes; Corridors on this alignment › Add a corridor.
 *   Surface › More › Terrain templates…: a terrain template in a pad's outline, its layer volumes; Earthwork › Materials; the
 *   quantities file for TakeoffCraft carries the materials; the project file keeps it all and reopens; Ctrl+Z; the help topic.
 * Run as root; minted session (tag ctp).   node tools/civilcraft-test/browser-templates.mjs   Shots in tmp/shots/civilcraft-templates/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-templates');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'ctp'], { encoding: 'utf8' }) || '{}');

// the by-hand site of bin/test-civilcraft-templates.mjs: flat ground at 100 ft, a straight road at 103 along +x, a pad to clip with
const pts = []; let n = 1;
for (let x = -100; x <= 1300; x += 25) for (let y = -300; y <= 300; y += 25) pts.push([String(n++), x, y, 100, 'G']);
const FILE = JSON.stringify({ format: 'civilcraft-project', version: 1, name: 'Templates test', units: 'ft', points: pts, seq: 50,
  surface: { name: 'EG', groups: { G: 'points' }, breaklines: [], boundary: null, maxEdge: 0, tin: null },
  alignments: [{ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z: 103, L: 0 }, { sta: 1000, z: 103, L: 0 }], sampling: null,
    corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50 } }],
  pads: [{ id: 'p40', name: 'Lot', pts: [{ x: 100, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 160 }, { x: 100, y: 160 }], z: 100, cut: 2, fill: 2 }], network: null });

admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.templates);
  await page.evaluate(() => localStorage.removeItem('civilcraft.templates'));
  await page.evaluate(async (f) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(f, 'templates.civilcraft.json'); }, FILE);
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1 && window.civilcraft.project.eg().surface);
  const undoN = () => page.evaluate(() => window.civilcraft.project.undoStack.length);
  const S = () => page.evaluate(() => JSON.parse(JSON.stringify(window.civilcraft.project.state)));

  // ---- the menu → the manager
  const menu = await page.$('.cv-tools [aria-label="Surface"] details.cv-menu summary');
  await menu.click();
  ok(await page.isVisible('[data-cmd="corridor-templates"]') && await page.isVisible('[data-cmd="terrain-templates"]'), 'Surface › More lists Corridor templates… and Terrain templates…');
  await page.click('[data-cmd="corridor-templates"]');
  await page.waitForSelector('[data-tpl-manager][open]');
  const ex = await page.$$eval('[data-tpl-list="examples"] [data-tpl-row]', (r) => r.map((x) => x.dataset.tplRow));
  ok(ex.length === 8 && ['ex-curb', 'ex-walk', 'ex-wall', 'ex-ditch'].every((id) => ex.includes(id)), 'the manager lists the eight examples (curb and gutter, sidewalk, wall, ditch …)', ex);
  ok(await page.$$eval('[data-tpl-list="examples"] [data-tpl-check]', (b) => b.length) === 8 && /engineer must check/.test(await page.textContent('[data-tpl-examples-note]')), 'every example is marked for checking by an engineer');
  ok(await page.$eval('[data-tpl-list="examples"] canvas', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; }), 'each row has a drawing of the template');
  await page.screenshot({ path: path.join(SHOTS, '01-manager.png') });
  let u0 = await undoN();
  await page.click('[data-tpl-use="ex-curb"]');
  await page.waitForFunction(() => (window.civilcraft.project.state.templates || []).length === 1);
  ok(await undoN() === u0 + 1, 'Use in this project: the curb example copied in, one undo step');
  const curbId = (await S()).templates[0].id;
  ok((await S()).templates[0].name === 'Curb and gutter' && (await S()).templates[0].check === true, 'the copy is named in words and keeps its "for checking" mark');

  // ---- the creation tool
  await page.click('[data-tpl-new]');
  await page.waitForSelector('[data-tpl-editor][open]');
  await page.fill('[data-tpl-name]', 'Median strip'); await page.press('[data-tpl-name]', 'Enter');
  await page.click('[data-tpl-padd]');
  await page.fill('[data-tpl-pkey="0"]', 'w'); await page.press('[data-tpl-pkey="0"]', 'Enter');
  await page.fill('[data-tpl-pvalue="0"]', '6'); await page.press('[data-tpl-pvalue="0"]', 'Enter');
  await page.fill('[data-tpl-dx="0"]', 'w'); await page.press('[data-tpl-dx="0"]', 'Enter');
  await page.fill('[data-tpl-code="0"]', 'MS'); await page.press('[data-tpl-code="0"]', 'Enter');
  await page.click('[data-tpl-ptadd]');
  await page.selectOption('[data-tpl-ptkind="1"]', 'vertical');
  await page.fill('[data-tpl-dz="1"]', '-0.5'); await page.press('[data-tpl-dz="1"]', 'Enter');
  await page.click('[data-tpl-top="1"]');   // untick: below the surface
  await page.click('[data-tpl-cadd]');
  await page.fill('[data-tpl-cname="0"]', 'Median'); await page.press('[data-tpl-cname="0"]', 'Enter');
  await page.fill('[data-tpl-cpts="0"]', '0 MS P2'); await page.press('[data-tpl-cpts="0"]', 'Enter');
  ok(await page.isVisible('[data-tpl-ok]'), 'the editor says the template has no problems');
  await page.click('[data-tpl-top="0"]');   // no point on the surface: a problem
  await page.waitForSelector('[data-tpl-problem="notop"]');
  ok(true, 'the editor lists a problem as the template changes (no point on the finished surface)');
  await page.click('[data-tpl-top="0"]');
  await page.waitForSelector('[data-tpl-ok]');
  ok(await page.$eval('[data-tpl-preview]', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k > 200; }), 'the editor draws the template as it is typed');
  await page.screenshot({ path: path.join(SHOTS, '02-editor.png') });
  u0 = await undoN();
  await page.click('[data-tpl-savelib]');
  await page.click('[data-tpl-save]');
  await page.waitForFunction(() => (window.civilcraft.project.state.templates || []).length === 2);
  const med = (await S()).templates[1];
  ok(await undoN() === u0 + 1 && med.name === 'Median strip' && med.params[0].key === 'w' && med.points[0].dx === 'w' && med.components[0].pts.join() === '0,MS,P2', 'Add to this project: the new template with its value, points and component, one undo step', med);
  ok(await page.evaluate(() => window.civilcraft.templates.library.list().some((x) => x.name === 'Median strip')), 'Save to My library: kept in this browser for every project');
  await page.waitForSelector('[data-tpl-list="mine"] [data-tpl-row]');
  ok(true, 'My library lists it in the manager');
  // edit the curb: its gutter width value
  await page.click(`[data-tpl-edit="${curbId}"]`);
  await page.waitForSelector('[data-tpl-editor][open]');
  await page.fill('[data-tpl-pvalue="0"]', '2.5'); await page.press('[data-tpl-pvalue="0"]', 'Enter');
  await page.click('[data-tpl-save]');
  await page.waitForFunction((id) => window.civilcraft.project.state.templates.find((x) => x.id === id).params[0].value === 2.5, curbId);
  ok(true, 'Edit: the curb\'s gutter width saved (2.5 ft)');
  // export, then import the file again
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-tpl-export]')]);
  const tfile = path.join(SHOTS, 'templates.cctemplates.json');
  await dl.saveAs(tfile);
  const tj = JSON.parse(fs.readFileSync(tfile, 'utf8'));
  ok(tj.format === 'cadcraft-corridor-templates' && tj.templates.length === 2, 'Export: a .cctemplates.json with the two project templates');
  await page.setInputFiles('[data-tpl-file]', tfile);
  await page.waitForFunction(() => window.civilcraft.project.state.templates.length === 4);
  ok(true, 'Import a file: its templates added to the project');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z');   // the import, undone
  await page.waitForFunction(() => window.civilcraft.project.state.templates.length === 2);
  ok(true, 'Ctrl+Z undoes the import');

  // ---- the corridor from templates
  await page.evaluate(() => window.civilcraft.select({ kind: 'alignment', id: 'a1' }));
  await page.waitForSelector('[data-tpl-on="a1"]');
  u0 = await undoN();
  await page.click('[data-tpl-on="a1"]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.regions?.length === 1);
  let st = await S();
  ok(await undoN() === u0 + 1 && st.templates.length === 4, 'Build from templates by station: one undo step, the two-lanes and daylight examples copied in');
  await page.waitForSelector('[data-tpl-add-pick="R0"]');
  await page.selectOption('[data-tpl-add-pick="R0"]', curbId);
  await page.click('[data-tpl-add="R0"]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.regions[0].R.uses.length === 2);
  const g1 = await page.evaluate(() => { const it = window.civilcraft.project.graded().items.find((x) => x.id === 'a1'); const s = it.sections.find((q) => q.sta === 100); return { R: s.det.R.map((q) => q.code + ':' + Math.abs(q.y).toFixed(3) + ':' + q.z.toFixed(3)), L: s.det.L.map((q) => q.code) }; });
  ok(g1.R.includes('FL:14.500:102.560') && !g1.L.includes('FL'), 'the curb on the right only: flowline at 12 + 2.5 = 14.5 ft, z 102.76 − 0.20 = 102.56; the left untouched', g1);
  // a second region from 500 with a wall end condition on the right
  await page.click('[data-tpl-region-add="a1"]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.regions.length === 2);
  st = await S();
  ok(st.alignments[0].corridor.regions[1].from === 500, 'Add a region: starts halfway along the rest (station 500)');
  await page.evaluate(() => window.civilcraft.templates.openManager());
  await page.waitForSelector('[data-tpl-manager][open]');
  await page.click('[data-tpl-use="ex-wall"]');
  await page.waitForFunction(() => window.civilcraft.project.state.templates.some((x) => x.name === 'Retaining wall'));
  await page.keyboard.press('Escape');
  const wallId = (await S()).templates.find((x) => x.name === 'Retaining wall').id;
  await page.waitForSelector('[data-tpl-end="R1"]');
  await page.selectOption('[data-tpl-end="R1"]', wallId);
  await page.waitForFunction((id) => window.civilcraft.project.state.alignments[0].corridor.regions[1].R.end?.tpl === id, wallId);
  const g2 = await page.evaluate(() => { const it = window.civilcraft.project.graded().items.find((x) => x.id === 'a1'); const s = it.sections.find((q) => q.sta === 750); return { codes: s.det.R.map((q) => q.code), dl: s.det.R[s.det.R.length - 1].z, wall: it.components.find((c) => c.wall) }; });
  ok(g2.codes.includes('W_I') && Math.abs(g2.dl - 100) < 1e-6, 'region 2, right: the retaining wall drops to the ground', g2.codes);
  // region 2 copied region 1's right side (lanes + curb), so the wall stands at the back of curb: 103.06 − 100 = 3.06 ft high, 1 ft thick
  ok(g2.wall && Math.abs(g2.wall.volume - 3.06 * 500) < 1e-6 && Math.abs(g2.wall.maxH - 3.06) < 1e-9, 'the wall at the back of curb: 3.06 ft high × 1 ft × 500 ft = 1530 cu ft', g2.wall);
  // a use's own value: the left lanes 14 ft wide in region 1
  await page.fill('[data-tpl-param="L0:0:w"]', '14'); await page.press('[data-tpl-param="L0:0:w"]', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.regions[0].L.uses[0].params?.w === 14);
  const eopL = await page.evaluate(() => { const it = window.civilcraft.project.graded().items.find((x) => x.id === 'a1'); const q = it.sections.find((s) => s.sta === 100).det.L.find((x) => x.code === 'EOP'); return Math.abs(q.y); });
  ok(Math.abs(eopL - 14) < 1e-9, 'a use\'s own value: the left lane 14 ft in region 1 (the template still says 12)', eopL);
  await page.waitForSelector('[data-tpl-qty="a1"]');
  ok(await page.$eval('[data-tpl-qty="a1"]', (t) => /Curb and gutter/.test(t.textContent) && /Retaining wall/.test(t.textContent)), 'Properties lists each component\'s volume by side and region');
  await page.screenshot({ path: path.join(SHOTS, '03-corridor-regions.png'), fullPage: false });
  // several corridors
  u0 = await undoN();
  await page.click('[data-more-add="a1"]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridors?.length === 1);
  st = await S();
  const more = await page.evaluate(() => window.civilcraft.project.graded().items.filter((x) => x.kind === 'corridor').map((x) => ({ id: x.id, from: x.from, to: x.to, n: x.sections.length, p: x.problems })));
  ok(await undoN() === u0 + 1 && st.alignments[0].corridor.to === 500 && st.alignments[0].corridors[0].from === 500, 'Add a corridor: the first ends at 500, the second starts there (one undo step)', st.alignments[0].corridors);
  ok(more.length === 2 && more.every((x) => !x.p.length && x.n >= 2), 'two corridors graded on the alignment', more);
  await page.waitForSelector(`[data-more="${st.alignments[0].corridors[0].id}"] [data-tpl-on]`);
  ok(true, 'the second corridor has its own templates block');

  // ---- terrain templates through the menu
  await page.click('.cv-tools [aria-label="Surface"] details.cv-menu summary');
  await page.click('[data-cmd="terrain-templates"]');
  await page.waitForSelector('[data-tt-block]');
  ok(await page.evaluate(() => document.activeElement?.hasAttribute('data-tt-block')), 'Terrain templates…: the project\'s Properties, at the terrain templates block');
  u0 = await undoN();
  await page.click('[data-tt-add]');
  await page.waitForFunction(() => window.civilcraft.project.state.terrainTemplates?.length === 1);
  ok(await undoN() === u0 + 1, 'Add a terrain template: one undo step (the topsoil example copied in)');
  const ttId = (await S()).terrainTemplates[0].id;
  await page.selectOption(`[data-tt-shape="${ttId}"]`, 'pad:p40');
  await page.waitForSelector(`[data-tt-qty="${ttId}"]`);
  const tq = await page.evaluate(() => window.civilcraft.project.terrainResults()[0].q);
  ok(Math.abs(tq.planArea - 20000) < 200 && Math.abs(tq.layers[0].volume - tq.planArea * 0.5) < 1e-6, 'clipped by the pad: 20 000 sq ft of topsoil, 0.5 ft deep', { a: tq.planArea, v: tq.layers[0].volume });
  ok(await page.$eval(`[data-tt-qty="${ttId}"]`, (t) => /Into the terrain/.test(t.textContent)), 'its layer is listed as placed into the terrain');
  await page.waitForSelector('[data-tpl-materials]');
  ok(await page.$eval('[data-tpl-materials]', (t) => /Topsoil/.test(t.textContent) && /Curb and gutter/.test(t.textContent)), 'Earthwork › Materials from templates: corridor components and terrain layers');
  const planItems = await page.evaluate(() => window.civilcraft.templates.sceneItems().length);
  ok(planItems === 2, 'the pad outline is drawn on C-TOPO-TMPL with the template\'s name');
  await page.screenshot({ path: path.join(SHOTS, '04-terrain-template.png') });
  const [qd] = await Promise.all([page.waitForEvent('download'), page.click('[data-qty-send]')]);
  const qf = path.join(SHOTS, 'q.quantities.json');
  await qd.saveAs(qf);
  const qj = JSON.parse(fs.readFileSync(qf, 'utf8'));
  ok(qj.items[0].key === 'earthwork:cut' && qj.items.some((x) => x.key.startsWith('material:terrain:') && /Topsoil/.test(x.name)) && qj.items.some((x) => /Retaining wall/.test(x.name)), 'Send to TakeoffCraft: the quantities file carries the materials', qj.items.map((x) => x.key));

  // ---- 3D: both corridors' roads from their template sections
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d?.scene?.meshes?.length, null, { timeout: 30000 });
  const m3 = await page.evaluate(() => window.civilcraft.view3d.scene.meshes.map((m) => m.key));
  ok(m3.length > 0, '3D view builds with the template corridors', m3);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '05-3d.png') });
  await page.evaluate(() => window.civilcraft.show3D(false));

  // ---- the project file, reopened
  const saved = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON()));
  await page.evaluate(async (f) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(f, 'again.civilcraft.json'); }, saved);
  await page.waitForFunction(() => window.civilcraft.project.state.terrainTemplates?.length === 1);
 const re = await S(), before = JSON.parse(saved);
  const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map((y) => [y, x[y]])) : x));   // same data, whatever the key order
  ok(canon(re.templates) === canon(before.templates) && canon(re.alignments) === canon(before.alignments) && canon(re.terrainTemplates) === canon(before.terrainTemplates), 'saved and reopened: templates, regions, the second corridor and the terrain template');
  ok(await page.evaluate(() => window.civilcraft.project.graded().items.filter((x) => x.kind === 'corridor').length === 2), 'and both corridors grade again');

  // ---- the typed command and the help topic
  const help = await page.evaluate(async () => { const m = await import('app-help'); return JSON.stringify(m.default).includes('corridor-templates'); }).catch((e) => String(e));
  ok(help === true, 'the help has the topic corridor-templates', help);
  if (await page.evaluate(() => typeof window.cadcraftHelp?.open === 'function')) {
    await page.evaluate(() => window.cadcraftHelp.open('corridor-templates'));
    await page.waitForTimeout(400);
    ok(await page.evaluate(() => /Corridor templates and terrain templates/.test(document.querySelector('[data-help-panel]')?.textContent || '')), 'the help panel opens the topic');
    await page.screenshot({ path: path.join(SHOTS, '06-help.png') });
  }
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
