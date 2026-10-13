#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-constraints.mjs — CadCraft's 2D constraints and parameters in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-constraints.mjs [--shots <dir>]    (default dir tmp/shots/cadcraft-constraints)
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium, 1440 × 900.
 * Checks: the Parametric toolbar group and its More menu; commands typed at the command line with real clicks on the
 * drawing (RECTANG, AUTOCONSTRAIN, GCFIX, DCHORIZONTAL with "width=120", DCVERTICAL Object with an expression); the
 * constraint bars and dimensional constraint labels drawn (hit boxes recorded); a click on a glyph selects it and
 * Delete removes it, Ctrl+Z brings it back; a MOVE the constraints cannot follow is refused in the history; the
 * PARAMETERS panel: editing an expression drives the geometry, a number typed in a driven value solves the
 * parameter behind it (two-way), ambiguity asks in an in-page dialog, Ctrl+Z undoes each as one step; double-click
 * on a label edits it; CONSTRAINTBAR Hide/Show from the menu; Save as DXF and DWG → reopen with every constraint and
 * parameter; Macro for SolidWorks downloads a .swb; opening a sketch export (.json) asks which sketch; both themes;
 * no console errors.
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
const SHOTS = si >= 0 ? args[si + 1] : path.join(REPO, 'tmp/shots/cadcraft-constraints');
fs.mkdirSync(SHOTS, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-bcons-'));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const history = () => page.textContent('[data-history]');
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(120); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y, opts = {}) => { const s = await screen(x, y); await page.mouse.click(s.x, s.y, opts); await page.waitForTimeout(120); };
const st = () => page.evaluate(() => {
  const { doc } = window.cadcraft;
  const poly = [...doc.model.values()].find((e) => e.type === 'poly');
  return { n: doc.constraints.length, dims: doc.constraints.filter((c) => c.name).map((c) => c.name + '=' + Math.round(c.value * 1e6) / 1e6), vars: doc.params.vars.map((v) => v.name + '=' + v.expr), pts: poly?.pts.map((p) => [Math.round(p.x * 1e6) / 1e6, Math.round(p.y * 1e6) / 1e6]), steps: doc.undoStack.length };
});
const download = async (action) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), action()]);
  const file = path.join(tmp, dl.suggestedFilename());
  await dl.saveAs(file);
  return { name: dl.suggestedFilename(), bytes: fs.readFileSync(file), file };
};
const shot = (name) => page.screenshot({ path: path.join(SHOTS, name) });
const width = async () => { const s = await st(); return s.pts ? s.pts[1][0] - s.pts[0][0] : NaN; };
const height = async () => { const s = await st(); return s.pts ? s.pts[2][1] - s.pts[1][1] : NaN; };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await page.click('[data-toggle="osnap"]');

  console.log('\n== toolbar');
  const group = await page.evaluate(() => {
    const g = document.querySelector('main > [role="toolbar"] [role="group"][aria-label="Parametric"]');
    return g ? { tools: [...g.querySelectorAll('.cc-tool-row > [data-cmd]')].map((b) => b.dataset.cmd), menu: [...g.querySelectorAll('[data-param-menu] [role="menuitem"]')].map((b) => b.textContent.trim()) } : null;
  });
  ok(group && group.tools.join() === 'AUTOCONSTRAIN,GEOMCONSTRAINT,DIMCONSTRAINT,PARAMETERS', 'a "Parametric" group: Auto, Constrain, Dimension, Parameters', JSON.stringify(group?.tools));
  ok(group && ['Horizontal', 'Vertical', 'Parallel', 'Perpendicular', 'Coincident', 'Tangent', 'Equal', 'Fix', 'Collinear', 'Concentric', 'Symmetric', 'Convert dimensions', 'Delete constraints', 'Hide constraint bars', 'Macro for SolidWorks (.swb)'].every((x) => group.menu.includes(x)), 'its More menu: every geometric constraint, the dimensional ones, delete, bars, the macro', JSON.stringify(group?.menu));
  const rows = await page.evaluate(() => new Set([...document.querySelectorAll('main > [role="toolbar"] > [role="group"]')].map((g) => Math.round(g.getBoundingClientRect().top))).size);
  ok(rows <= 2, 'the toolbar still fits in two rows at 1440 px', rows);
  await page.click('[data-param-menu] summary');
  await shot('00-parametric-menu.png');
  await page.keyboard.press('Escape');

  console.log('\n== commands at the command line, clicks on the drawing');
  await typeCmd('RECTANG'); await typeCmd('0,0'); await typeCmd('100,50');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.evaluate(() => { const v = window.cadcraft.view; v.zoomAt(v.w / 2, v.h / 2, 0.6); });
  await typeCmd('AUTOCONSTRAIN'); await typeCmd('ALL'); await typeCmd('');
  let s = await st();
  ok(s.n === 4, 'AUTOCONSTRAIN ALL: horizontal and vertical on the four sides', JSON.stringify(s));
  await typeCmd('GCFIX'); await clickAt(0.3, 0);
  s = await st();
  ok(s.n === 5 && /Fix added/.test(await history()), 'GCFIX, click near the lower-left corner: fixed');
  await typeCmd('DCHORIZONTAL'); await clickAt(1, 0); await clickAt(99, 0); await clickAt(50, -14);
  ok(/Dimension text <d1=100>/.test(await page.textContent('[data-prompt]')), 'DCHORIZONTAL asks for the text with the measured value', await page.textContent('[data-prompt]'));
  await page.keyboard.type('width=120'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ok(near(await width(), 120), 'typed "width=120": the rectangle is 120 wide, constraint named width', JSON.stringify(await st()));
  await typeCmd('DCVERTICAL'); await typeCmd('O'); await clickAt(120, 25); await clickAt(140, 25);
  await page.keyboard.type('width/2'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ok(near(await height(), 60), 'DCVERTICAL, Object, "width/2": 60 high', JSON.stringify(await st()));
  s = await st();
  ok(s.dims.join() === 'width=120,d1=60' && s.vars.join() === 'width=120,d1=width/2', 'one table: width and d1 = width/2', JSON.stringify(s));
  const hits = await page.evaluate(() => window.cadcraft.host.constraintView.hits.map((h) => h.kind));
  ok(hits.filter((k) => k === 'bar').length >= 5 && hits.filter((k) => k === 'dim').length === 2, 'constraint bars and the two dimensional constraint labels are drawn', JSON.stringify(hits));
  await shot('01-constrained-paper.png');

  console.log('\n== refused edits, glyphs, Delete, undo');
  await typeCmd('MOVE'); await typeCmd('ALL'); await typeCmd(''); await typeCmd('0,0'); await typeCmd('30,30');
  ok(/Not done: the constraints hold/.test(await history()) && near((await st()).pts[0][0], 0), 'MOVE of fixed, fully constrained geometry: refused, said in the history');
  const bar = await page.evaluate(() => window.cadcraft.host.constraintView.hits.find((h) => h.kind === 'bar' && window.cadcraft.doc.constraints.find((c) => c.id === h.cid)?.type === 'horizontal'));
  const r = await page.evaluate(() => document.querySelector('[data-over]').getBoundingClientRect().toJSON());
  const before = (await st()).n;
  await page.mouse.click(r.x + bar.x + bar.w / 2, r.y + bar.y + bar.h / 2); await page.waitForTimeout(150);
  ok((await page.evaluate(() => window.cadcraft.host.constraintView.selected)) === bar.cid && /Horizontal \(/.test(await history()), 'a click on an H glyph selects that constraint (named in the history)');
  await shot('02-glyph-selected.png');
  await page.keyboard.press('Delete'); await page.waitForTimeout(150);
  ok((await st()).n === before - 1, 'Delete removes it');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok((await st()).n === before, 'Ctrl+Z brings it back');

  console.log('\n== Parameters panel, two-way');
  await page.click('[data-cmd="PARAMETERS"]'); await page.waitForTimeout(200);
  ok(await page.isVisible('[data-params-sec]') && (await page.$$('[data-params-sec] tbody tr')).length === 2, 'PARAMETERS shows the panel with width and d1');
  const steps0 = (await st()).steps;
  await page.fill('[data-params-sec] tr[data-name="width"] .cc-par-expr', '200');
  await page.press('[data-params-sec] tr[data-name="width"] .cc-par-expr', 'Enter'); await page.waitForTimeout(200);
  ok(near(await width(), 200) && near(await height(), 100) && (await st()).steps === steps0 + 1, 'width = 200 in the panel: 200 × 100, one undo step');
  await page.fill('[data-params-sec] tr[data-name="d1"] input.cc-par-val', '40');
  await page.press('[data-params-sec] tr[data-name="d1"] input.cc-par-val', 'Enter'); await page.waitForTimeout(200);
  ok(near(await width(), 80) && (await st()).vars.includes('width=80'), 'typed 40 into d1 (= width/2): width solved to 80 (backward)', JSON.stringify(await st()));
  await shot('03-parameters-paper.png');
  await page.fill('[data-params-sec] [data-par-new="name"]', 'gap');
  await page.fill('[data-params-sec] [data-par-new="expr"]', '10');
  await page.click('[data-params-sec] .cc-par-new button'); await page.waitForTimeout(200);
  await page.fill('[data-params-sec] tr[data-name="d1"] .cc-par-expr', 'width/2 + gap');
  await page.press('[data-params-sec] tr[data-name="d1"] .cc-par-expr', 'Enter'); await page.waitForTimeout(200);
  ok(near(await height(), 50), 'gap = 10, d1 = width/2 + gap → 50');
  await page.fill('[data-params-sec] tr[data-name="d1"] input.cc-par-val', '70');
  await page.press('[data-params-sec] tr[data-name="d1"] input.cc-par-val', 'Enter');
  await page.waitForSelector('dialog[open] button[data-key="p1"]');
  ok(/depends on width, gap|depends on gap, width/.test(await page.textContent('dialog[open]')), 'a driven value with two parameters behind it asks which one changes (in-page dialog)');
  await shot('04-which-parameter.png');
  const label = await page.textContent('dialog[open] button[data-key="p1"]');
  await page.click('dialog[open] button[data-key="p1"]'); await page.waitForTimeout(200);
  ok(near(await height(), 70) && (await st()).vars.some((v) => v.startsWith(label.trim() + '=')), 'picked ' + label.trim() + ': solved, 70 high', JSON.stringify(await st()));
  const w70 = await height();
  await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
  ok(near(await height(), 50) && w70 === 70, 'Ctrl+Z undoes that whole change');

  console.log('\n== double-click a dimensional constraint');
  const lab = await page.evaluate(() => window.cadcraft.host.constraintView.hits.find((h) => h.kind === 'dim' && window.cadcraft.doc.constraints.find((c) => c.id === h.cid)?.name === 'width'));
  await page.mouse.dblclick(r.x + lab.x + lab.w / 2, r.y + lab.y + lab.h / 2); await page.waitForTimeout(200);
  ok(!!(await page.$('dialog[open][data-dc-edit]')), 'double-click on the width label opens its value dialog');
  await page.fill('dialog[open] #cc-dc-input', 'width=90');
  await page.click('dialog[open] button[data-key="ok"]'); await page.waitForTimeout(200);
  ok(near(await width(), 90), 'width=90 applied from the dialog');

  console.log('\n== constraint bars');
  await page.click('[data-param-menu] summary');
  await page.click('[data-param-menu] [data-cmd="CONSTRAINTBAR H"]'); await page.waitForTimeout(200);
  ok((await page.evaluate(() => window.cadcraft.host.constraintView.hits.filter((h) => h.kind === 'bar').length)) === 0, 'Hide constraint bars (More menu): no bars');
  await page.click('[data-param-menu] summary');
  await page.click('[data-param-menu] [data-cmd="CONSTRAINTBAR S"]'); await page.waitForTimeout(200);
  ok((await page.evaluate(() => window.cadcraft.host.constraintView.hits.filter((h) => h.kind === 'bar').length)) > 0, 'Show constraint bars: back');

  console.log('\n== save and reopen');
  const want = await st();
  for (const fmt of ['dxf', 'dwg']) {
    await typeCmd('SAVEAS');
    await page.waitForSelector('dialog[open] input[name="cc-format"]');
    await page.check('dialog[open] input[value="' + fmt + '"]');
    const f = await download(() => page.click('dialog[open] button[data-key="ok"]'));
    await page.evaluate(() => window.cadcraft.doc.markSaved());
    const copy = path.join(tmp, 'Reopen-' + fmt + '.' + fmt);
    fs.copyFileSync(f.file, copy);
    await page.setInputFiles('[data-file]', copy);
    await page.waitForFunction((n) => window.cadcraft.doc.meta.source === n, path.basename(copy), { timeout: 60000 });
    const got = await st();
    ok(got.n === want.n && got.vars.join() === want.vars.join() && got.dims.join() === want.dims.join(), fmt.toUpperCase() + ': saved and reopened with every constraint and parameter', JSON.stringify(got));
  }
  await page.evaluate(() => { const v = window.cadcraft.view; v.fit(); v.zoomAt(v.w / 2, v.h / 2, 0.6); });
  await shot('05-reopened-dwg.png');

  console.log('\n== sketch exchange');
  await page.click('[data-param-menu] summary');
  const m = await download(() => page.click('[data-param-menu] [data-cmd="SWBOUT"]'));
  ok(/\.swb$/.test(m.name) && /Not yet tested in SolidWorks/.test(m.bytes.toString('latin1')) && /SelectByID2\("Front Plane"/.test(m.bytes.toString('latin1')), 'Macro for SolidWorks (.swb) downloads; it says it is not tested in SolidWorks', m.name);
  ok(/Not yet tested in SolidWorks/.test(await history()), 'the history says so too');
  await page.evaluate(() => window.cadcraft.doc.markSaved());
  await page.setInputFiles('[data-file]', path.join(REPO, 'tools/cadcraft-test/fixtures/sw-export-plate.json'));
  await page.waitForSelector('dialog[open] button[data-key="s1"]');
  ok(/holds 2 sketches/.test(await page.textContent('dialog[open]')), 'a sketch export with two sketches: asks which one');
  await page.click('dialog[open] button[data-key="s0"]');
  // the previous drawing already has constraints: wait for the opened sketch to replace it
  await page.waitForFunction(() => /^Sketch export \(Sketch1\)/.test(window.cadcraft.doc.meta.format || '') && window.cadcraft.doc.constraints.length > 0, null, { timeout: 30000 });
  const sk =await page.evaluate(() => ({ n: window.cadcraft.doc.constraints.length, vars: window.cadcraft.doc.params.vars.map((v) => v.name) }));
  ok(sk.vars.includes('width') && sk.vars.includes('D2') && sk.n >= 10, 'Sketch1 opened: geometry, constraints, width, D1–D5', JSON.stringify(sk));
  ok(/not carried over \(smooth\)/.test(await history()), 'what is not carried over is listed');
  await page.click('[data-cmd="PARAMETERS"]'); await page.click('[data-cmd="PARAMETERS"]'); await page.waitForTimeout(150);
  await shot('06-sketch-export-paper.png');

  console.log('\n== model theme');
  await page.evaluate(() => window.cadcraft.doc.markSaved());
  await page.goto(BASE + '/lab/cadcraft?space=model', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.setInputFiles('[data-file]', path.join(tmp, 'Reopen-dwg.dwg'));
  await page.waitForFunction(() => window.cadcraft.doc.constraints.length > 0, null, { timeout: 60000 });
  await page.evaluate(() => { const v = window.cadcraft.view; v.fit(); v.zoomAt(v.w / 2, v.h / 2, 0.6); });
  await typeCmd('PARAMETERS');
  await page.waitForTimeout(250);
  await shot('07-constrained-model.png');
  ok(await page.isVisible('[data-params-sec]') && (await page.evaluate(() => window.cadcraft.host.constraintView.hits.length)) > 0, 'model space: panel and constraints drawn');

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'browser run', err.stack || err.message);
  await shot('error.png').catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
