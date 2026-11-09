#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-views09.mjs — BimCraft 0.9 D8.12 (working style, A–D) and SU.1123 in the lab, headless, real clicks (session `bim-views-09`).
 *   node tools/bimcraft-test/browser-views09.mjs [--shots <dir>] [--only w,a,b,c,d,s,t]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimviews09). Fails on any console error.
 *   w   Settings › BimCraft › Working style: presets, one default changed on its own (Custom)
 *   a   Duplicate a plan as an own copy and as a linked one from the project browser; the copy's own view range; Up; Delete
 *   b   Pens: every category in For, Apply keeps them in the IFC, Keep these in the file (the old browser store), Print through a pen
 *       table and the plan Print in monochrome
 *   c   Report as in Properties: search, class, type, Apply; saved as the reported class
 *   d   Save as template, then New building › Start from the template
 *   s   SU.1123: sheet formats and title blocks in the sheet editor, rename a family from the browser, edit in the south elevation
 *   t   D8.14-17: portrait sheets, a typed scale, move a view (typed place, arrow keys), an SVG title block imported or drawn
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimviews09'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + (process.env.V09_DEBUG ? ' @ ' + String(e.stack || '').split('\n').slice(1, 9).map((l) => l.replace(/https:\/\/getcadcraft.com\/assets\/apps\/bimcraft\/dev\//, '').trim()).join(' | ') : '')));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.workstyle'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  if (await page.isVisible('[data-new-levels]')) { await page.fill('[data-new-levels]', String(n)); await page.fill('[data-new-height]', h + ' mm'); }
  await page.click('[data-new-ok]');
  await waitStatus(/^New building /);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
// a click on the plan at a plan point; through the plan's own click handler, since the Draw bar can sit over a fitted empty plan's origin
const planClick = async (x, y) => { await page.evaluate(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); };
const room = async (x0, y0, x1, y1) => {
  for (let tryN = 0; tryN < 2; tryN++) {
    const n0 = await page.evaluate(() => window.bimcraftPlan.state.data?.walls.length || 0);
    await page.mouse.move(5, 5); await page.waitForTimeout(400);   // the status line fades before the first click
    // the room in the middle of the plan's canvas (dev's floating Draw bar can leave a fitted empty plan's origin under it)
    await page.evaluate(([x0, y0, x1, y1]) => { const st = document.querySelector('.bc-stage'); if (st) st.scrollTop = 0; const pv = window.bimcraftPlan.view; const r = pv.canvas.getBoundingClientRect(); pv.scale = Math.min(r.width / (x1 - x0), r.height / 2 / (y1 - y0)) * 0.7; pv.cx = (x0 + x1) / 2; pv.cy = (y0 + y1) / 2 - r.height * 0.15 / pv.scale; pv.render(); }, [x0, y0, x1, y1]);
    await tool('wall'); await planClick(x0, y0); await planClick(x1, y0); await planClick(x1, y1); await planClick(x0, y1); await planClick(x0, y0); await page.keyboard.press('Escape'); await settled();
    // a plan click can land on the Materials button of the Draw bar (the bar overlaps the fitted empty plan): close what it opened
    await page.evaluate(() => document.querySelectorAll('dialog[data-material-library][open]').forEach((d) => d.close()));
    if ((await page.evaluate(() => window.bimcraftPlan.state.data?.walls.length || 0)) > n0) return;
    if (process.env.V09_DEBUG) { const [px, py] = await at(x0, y0); console.log('    (room: no wall', px, py, await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className + ' ' + (e.getAttribute('data-status') !== null) : null; }, [px, py]), JSON.stringify(await page.evaluate(() => ({ tool: window.bimcraftPlan.state.tool, on: window.bimcraftPlan.state.on, st: document.querySelector('[data-status]')?.textContent }))), ')'); await shot(page, 'room-' + tryN); }
  }
};
const download = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };
/** A Draw tool inside its menu (the Build menu is a <details>), as a person opens the menu and picks it. */
const tool = async (name) => { await page.evaluate((n) => { const b = document.querySelector(`[data-mtool="${n}"]`); b.closest('details')?.setAttribute('open', ''); b.click(); b.closest('details')?.removeAttribute('open'); }, name); };
const levels = () => page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid, name: l.name })));
/** A module of the build, read in the page (ops are plain functions of the editor). */
const M = (name) => `/assets/apps/bimcraft/dev/${name}`;
const inPage = (fn, arg) => page.evaluate(fn, arg);

try {
  // ======================================================================================== w: the working style
  if (want('w')) {
    console.log('== w: Settings › BimCraft › Working style');
    await fresh();
    await page.click('[data-settings-open]');
    await page.waitForSelector('dialog[data-app-settings][open]');
    await page.locator('dialog[data-app-settings]').getByText('BimCraft', { exact: true }).first().click();
    await page.locator('dialog[data-app-settings]').getByText('Working style', { exact: true }).first().click();
    await page.waitForSelector('[data-bc-workstyle-set]', { state: 'visible' });
    ok(await page.isChecked('[data-ws9-preset="own"]') && (await page.inputValue('[data-ws9="dup"]')) === 'own', 'Settings › BimCraft › Working style: "Each view its own" with Own copy at first');
    ok(/stay that view/.test(await page.textContent('[data-ws9-hint]')), 'its line says what it does');
    await page.check('[data-ws9-preset="shared"]');
    ok((await page.inputValue('[data-ws9="dup"]')) === 'linked' && (await page.inputValue('[data-ws9="print"]')) === 'table', '"Shared annotations and pen tables" sets Linked and a pen table');
    await page.selectOption('[data-ws9="print"]', 'shown');
    ok(await page.isChecked('[data-ws9-preset="custom"]') && (await page.inputValue('[data-ws9="dup"]')) === 'linked', 'one default changed on its own: Custom, the others kept');
    const st = await inPage(() => JSON.parse(localStorage.getItem('bimcraft.workstyle')));
    ok(st?.dup === 'linked' && st.print === 'shown' && st.preset === 'custom', 'kept in this browser (bimcraft.workstyle)', JSON.stringify(st));
    await shot(page, 'w-01-settings');
    await page.check('[data-ws9-preset="own"]');
    await page.keyboard.press('Escape');
  }

  // ===================================================================================== a: duplicate a view
  if (want('a')) {
    console.log('== a: Duplicate a plan, own copy and linked');
    await fresh();
    await newBuilding('Dup test');
    await room(0, 0, 8000, 5000);
    const L = await levels();
    ok(!!(await page.$(`[data-pb-dup="plan:${L[0].guid}"]`)) && !!(await page.$(`[data-pb-dup="rcp:${L[0].guid}"]`)) && !!(await page.$('[data-pb-dup="elevation:north"]')) && !!(await page.$('[data-pb-elevedit="elevation:north"]')), 'Duplicate is on every plan, ceiling plan and elevation row (elevations also Edit in this view)');
    await page.click(`[data-pb-dup="plan:${L[0].guid}"]`);
    await page.waitForSelector('[data-dup-dialog][open]');
    ok(await page.isChecked('[data-dup-mode="own"]'), 'the dialog offers Own copy first (the working style)');
    await page.fill('[data-dup-name]', 'Furniture plan');
    await page.click('[data-dup-ok]');
    await settled();
    await page.waitForSelector('[data-pb-copy]');
    let cp = await inPage(() => window.bimcraftViews.api.copies().map((c) => ({ id: c.id, name: c.name, mode: c.mode })));
    ok(cp.length === 1 && cp[0].name === 'Furniture plan' && cp[0].mode === 'own', 'Project browser › Duplicated views lists the own copy', JSON.stringify(cp));
    await page.waitForFunction((id) => window.bimcraftPlan.state.callout === id, cp[0].id, { timeout: 20000 });
    ok(/Copy: Furniture plan/.test(await page.textContent('[data-co-chip]')), 'the copy opens; the bar says "Copy: Furniture plan" with Up');
    await shot(page, 'a-01-copy');
    // its own view range: 1:100 there, the source untouched
    await page.click(`[data-pb-cpedit="${cp[0].id}"]`);
    await page.waitForSelector('[data-cp-dialog][open]');
    await page.click('[data-cp-range]');
    await page.waitForSelector(`[data-pv-dialog][open][data-pv-copy="${cp[0].id}"]`);
    await page.selectOption('[data-pv-scale]', '100');
    await page.click('[data-pv-ok]');
    await settled();
    cp = await inPage(() => window.bimcraftViews.api.copies().map((c) => ({ id: c.id, scale: c.range?.scale })));
    const srcScale = await inPage((id) => window.bimcraftViews.state.views.get(id)?.scale ?? 0, L[0].id);
    ok(cp[0].scale === 100 && srcScale === 0, 'View range of the copy: 1:100 on the copy, the floor plan keeps its own', JSON.stringify({ cp, srcScale }));
    // a linked one, the working style set to shared annotations
    await inPage(() => { localStorage.setItem('bimcraft.workstyle', JSON.stringify({ preset: 'shared', dup: 'linked', print: 'table', count: 'reported', start: 'template' })); });
    await page.click(`[data-pb-dup="plan:${L[0].guid}"]`);
    await page.waitForSelector('[data-dup-dialog][open]');
    ok(await page.isChecked('[data-dup-mode="linked"]'), 'with "Shared annotations…" Duplicate offers Linked first');
    await page.fill('[data-dup-name]', 'Linked plan');
    await page.click('[data-dup-ok]');
    await settled();
    await page.waitForFunction(() => window.bimcraftViews.api.copies().some((c) => c.name === 'Linked plan'));
    const lk = await inPage(() => window.bimcraftViews.api.copies().find((c) => c.name === 'Linked plan'));
    await page.waitForFunction((id) => window.bimcraftPlan.state.callout === id, lk.id, { timeout: 20000 });
    ok(lk.mode === 'linked' && await inPage((g) => window.bimcraftViews.api.viewKey() === 'plan:' + g, L[0].guid), 'the linked copy draws in (and adds to) its plan\'s annotations');
    await page.click('[data-co-back]');
    await settled();
    ok(await inPage(() => window.bimcraftPlan.state.callout) === null, 'Up: back to the floor plan');
    await page.click(`[data-pb-cpedit="${lk.id}"]`);
    await page.waitForSelector('[data-cp-dialog][open]');
    await page.click('[data-cp-delete]');
    await settled();
    ok(!(await inPage(() => window.bimcraftViews.api.copies().some((c) => c.name === 'Linked plan'))), 'Delete takes the copy away');
    await page.mouse.move(10, 10);
    await page.keyboard.press('Control+z');
    await settled();
    ok(await inPage(() => window.bimcraftViews.api.copies().some((c) => c.name === 'Linked plan')), 'Ctrl+Z: it is back');
    await inPage(() => localStorage.removeItem('bimcraft.workstyle'));
  }

  // =================================================================================== b: pens in the file, print
  if (want('b')) {
    console.log('== b: pens kept in the file, every category, print through a pen table');
    await fresh();
    await newBuilding('Pen test');
    await room(0, 0, 6000, 4000);
    const L = await levels();
    await tool('pens');
    await page.waitForSelector('[data-mopts="pens"]:not([hidden])');
    const opts = await page.$$eval('[data-pen-scope] option', (o) => o.map((x) => x.value));
    ok(opts.includes('IfcSlab') && opts.includes('IfcFurniture') && opts.includes('drafting') && opts.includes('dimension'), '"For" offers every category, drafting and dimensions', opts.join());
    await page.selectOption('[data-pen-scope]', 'wall');
    await page.selectOption('[data-pen-weight]', '4');
    await page.selectOption('[data-pen-color]', '--layer-red');
    await page.click('[data-pen-apply]');
    await settled();
    const inFile = await inPage(async (u) => { const P = await import(u); const ed = window.bimcraftRes.api.ed(); const { ModelWriter } = await import(u.replace('pens.js', 'model-write.js')); return [...P.readViewPens(new ModelWriter(ed.W, ed.api, ed.mid))].map(([k, v]) => [k, v.length]); }, M('pens.js'));
    ok(inFile.length === 1 && inFile[0][0] === 'plan:' + L[0].guid && inFile[0][1] === 1, 'Apply: the pen is kept in the IFC with this plan', JSON.stringify(inFile));
    ok(await inPage(() => window.bimcraftPlan.view.scene.walls.some((w) => w.pen?.color === '--layer-red')), 'the plan draws it');
    // the old browser-only store for Level 2
    await inPage((g) => { localStorage.setItem('bimcraft.pens', JSON.stringify({ [g]: [{ id: 'old', scope: { by: 'category', value: 'wall' }, weight: 1, dash: 'dot', color: '--layer-blue' }] })); }, L[1].guid);
    await page.click(`[data-pb-plan="${L[1].guid}"]`);
    await settled();
    await tool('pens');
    await inPage(() => { window.bimcraftPens.state.legacy = JSON.parse(localStorage.getItem('bimcraft.pens')); window.bimcraftPlan.refresh(); });
    await page.waitForSelector('[data-pen-keep]:not([hidden])');
    ok(/this browser only/.test(await page.textContent('[data-pen-count]')), 'a plan with pens from before 0.9: "kept in this browser only" and Keep these in the file');
    await page.click('[data-pen-keep]');
    await settled();
    ok(await inPage((g) => window.bimcraftPens.state.file.has('plan:' + g) && !JSON.parse(localStorage.getItem('bimcraft.pens') || '{}')[g], L[1].guid), 'Keep these in the file: moved into the IFC, gone from the browser store');
    // print: as shown has the red pen; through monochrome it is black
    await page.click(`[data-pb-plan="${L[0].guid}"]`);
    await settled();
    let pr = await download('[data-model-print]');
    ok(/0\.702 0\.071 0\.18 RG/.test(pr.bytes.toString('latin1')), 'Print as shown: the red wall pen is in the PDF');
    await tool('pens');
    await page.selectOption('[data-pen-print]', 'table');
    await settled();
    ok(await inPage(() => window.bimcraftPens.print().mode === 'table'), 'Print › Through a pen table: kept in the file');
    pr = await download('[data-model-print]');
    const txt = pr.bytes.toString('latin1');
    ok(txt.startsWith('%PDF') && !/0\.702 0\.071 0\.18 RG/.test(txt) && /0 0 0 RG/.test(txt), 'the plan Print goes through the monochrome table: no red left');
    await page.click('[data-pen-tableedit]');
    await page.waitForSelector('[data-pt-dialog][open]');
    ok((await page.$$('[data-pt-color]')).length === 10, 'Edit pen table: a row for each colour');
    await page.uncheck('[data-pt-own="--layer-red"]').catch(() => {});
    await page.fill('[data-pt-name]', 'Office pens');
    await page.selectOption('[data-pt-lw="--layer-red"]', '0.7');
    await page.click('[data-pt-ok]');
    await settled();
    const tb = await inPage(() => window.bimcraftPens.print().table);
    ok(tb?.name === 'Office pens' && Object.values(tb.pens || {}).some((p) => p.lw === 0.7), 'the table of your own is kept in the model', JSON.stringify(tb?.name));
    await shot(page, 'b-01-pens');
  }

  // ======================================================================================== c: Report as
  if (want('c')) {
    console.log('== c: Report as in Properties');
    await fresh();
    await newBuilding('Report test');
    await room(0, 0, 6000, 4000);
    const w0 = await inPage(() => { const s = window.bimcraftPlan.state.data; return { id: s.walls[0].id, guid: s.walls[0].guid, n: s.walls.length }; });
    await tool('select');
    const kb = await inPage(() => window.bimcraftRes.api.kb());
    await inPage((k) => window.bimcraftVis.pick(k), kb + w0.id);
    await page.waitForSelector('[data-ra]');
    await page.click('[data-ra] summary');
    await page.fill('[data-ra-search]', 'plate');
    await page.selectOption('[data-ra-class]', 'IfcPlate');
    await page.selectOption('[data-ra-type]', 'CURTAIN_PANEL');
    await page.click('[data-ra-apply]');
    await settled();
    await waitStatus(/reported as Plate/);
    const saved = await inPage(() => new TextDecoder().decode(window.bimcraftRes.api.ed().save()));
    ok(new RegExp("=IFCPLATE\\('" + w0.guid.replace(/\$/g, '\\$') + "'.*CURTAIN_PANEL").test(saved), 'Report as › Plate, Curtain panel: the saved IFC has it as IFCPLATE');
    const nw = await inPage(() => ({ n: window.bimcraftPlan.state.data.walls.length, cls: (() => { const ed = window.bimcraftRes.api.ed(); return ed.api.GetLine(ed.mid, window.bimcraftPlan.state.data.walls[0]?.id, false)?.constructor?.name; })() }));
    ok(nw.n === w0.n && nw.cls === 'IfcWall', 'and in the plan it is still a wall to edit (' + w0.n + ' walls before and after)', JSON.stringify(nw));
    await inPage((k) => window.bimcraftVis.pick(k), kb + w0.id);
    await page.waitForSelector('[data-ra-now="IfcPlate"]');
    ok(/Reported as Plate/.test(await page.textContent('[data-ra-now]')), 'Properties says what it is reported as and drawn as');
    await shot(page, 'c-01-reportas');
    await page.click('[data-ra-clear]');
    await settled();
    ok(!/=IFCPLATE\(/.test(await inPage(() => new TextDecoder().decode(window.bimcraftRes.api.ed().save()))), 'Clear: a wall again in the file');
  }

  // ======================================================================================== d: templates
  if (want('d')) {
    console.log('== d: Save as template, New from template');
    await fresh();
    await newBuilding('Office standard', 3, 3200);
    await room(0, 0, 6000, 4000);
    const L = await levels();
    await page.click(`[data-pb-dup="plan:${L[0].guid}"]`);
    await page.waitForSelector('[data-dup-dialog][open]');
    await page.fill('[data-dup-name]', 'Template copy view');
    await page.click('[data-dup-ok]');
    await settled();
    await page.click('[data-tpl-save]');
    await page.waitForSelector('[data-tpl-dialog][open]');
    await page.fill('[data-tpl-name]', 'Office standard');
    await page.check('[data-tpl-default]');
    await page.click('[data-tpl-ok]');
    await waitStatus(/Template Office standard saved/);
    ok(true, 'Save as template: kept in this browser, made the default');
    await page.reload({ waitUntil: 'networkidle' });
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new [data-new-from]');
    const picked = await page.$eval('[data-new-from]', (s) => s.selectedOptions[0]?.textContent);
    ok(picked === 'Office standard' && !(await page.isVisible('[data-new-levels]')), 'New building: Start from is the default template; the level fields are hidden (the template has its levels)', picked);
    await page.fill('[data-new-name]', 'Clinic 12');
    await page.click('[data-new-ok]');
    await waitStatus(/from the template Office standard/);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await settled();
    const got = await inPage(() => ({ levels: window.bimcraftPlan.state.data.levels.length, walls: window.bimcraftPlan.state.data.walls.length, copies: window.bimcraftViews.api.copies().map((c) => c.name) }));
    ok(got.levels === 3 && got.walls === 0 && got.copies.includes('Template copy view'), 'the new building has the template\'s three levels and its duplicated view, and no walls', JSON.stringify(got));
    await shot(page, 'd-01-from-template');
  }

  // ============================================================== s: SU.1123 formats, rename, edit in elevation
  if (want('s')) {
    console.log('== s: sheet formats, title blocks, rename, edit in an elevation');
    await fresh();
    await newBuilding('Elevation test');
    await room(0, 0, 8000, 5000);
    // sheet formats and a title block
    await page.click('[data-pb-newsheet]');
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click('[data-sh-formats]');
    await page.waitForSelector('[data-sf-dialog][open]');
    await page.fill('[data-sf-fname]', 'Plotter 900');
    await page.fill('[data-sf-fw]', '1500');
    await page.fill('[data-sf-fh]', '900');
    await page.click('[data-sf-addformat]');
    await page.waitForSelector('[data-sf-item="format-1"]');
    await page.fill('[data-sf-tname]', 'Office block');
    await page.fill('[data-sf-tfields]', 'Client*\nDrawn by');
    await page.click('[data-sf-addtb]');
    await page.waitForSelector('[data-sf-item="titleblock-1"]');
    ok(true, 'Formats…: a sheet size and a title block of your own');
    await page.click('[data-sf-close]');
    await page.waitForSelector('[data-sh-paper] option[value="fmt:format-1"]', { state: 'attached' });
    await page.selectOption('[data-sh-paper]', 'fmt:format-1');
    await page.selectOption('[data-sh-tb]', 'titleblock-1');
    await page.waitForSelector('[data-sh-field="client"]');
    await page.fill('[data-sh-field="client"]', 'City clinic');
    ok(/City clinic/.test(await page.textContent('[data-sh-stage]')), 'the sheet on Plotter 900 with the Office block, the client filled in');
    await shot(page, 's-01-sheet');
    await page.click('[data-sh-save]');
    await settled();
    ok(await inPage(() => window.bimcraftViews.state.sheets.some((s) => s.paper === 'fmt:format-1' && s.titleBlock === 'titleblock-1' && s.fields.client === 'City clinic')), 'saved with its format, title block and field');
    // rename a family from the browser
    await inPage(async (u) => { const FO = await import(u); window.bimcraftRes.api.commit(FO.duplicateFamily('door-single', { name: 'Office door', key: 'fam-office99' }), { label: 'Office door', verb: 'Made' }); }, M('family-ops.js'));
    await settled();
    await page.waitForSelector('[data-pb-famrename="fam-office99"]');
    await page.click('[data-pb-famrename="fam-office99"]');
    await page.waitForSelector('[data-rn-dialog="family"][open]');
    await page.fill('[data-rn-name]', 'Clinic door');
    await page.click('[data-rn-ok]');
    await settled();
    await page.waitForFunction(() => /Clinic door/.test(document.querySelector('[data-pb-family="fam-office99"]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, 'Families › rename: the family is "Clinic door" in the browser');
    // edit in the south elevation: drag the south wall 500 mm along it
    const wall = await inPage(() => { const s = window.bimcraftPlan.state.data; const w = s.walls.find((x) => Math.abs(x.a[1]) < 1 && Math.abs(x.b[1]) < 1); return { guid: w.guid, a: w.a, b: w.b }; });
    await page.evaluate(() => { const d = document.querySelector('[data-pb-group="elev"]'); if (d) d.open = true; });
    await page.click('[data-pb-elevedit="elevation:south"]');
    await page.waitForSelector('[data-ev-dialog][open]');
    await page.waitForSelector(`[data-ev-wall="${wall.guid}"]`, { state: 'attached' });
    ok((await page.$$('[data-ev-wall]')).length >= 1 && (await page.$$('[data-ev-level]')).length === 2, 'Edit in this view: the south elevation with its wall and both level lines to pick');
    await shot(page, 's-02-elevation');
    const box = await page.locator(`[data-ev-wall="${wall.guid}"]`).boundingBox();
    const k = await inPage(() => { const svg = document.querySelector('[data-ev-svg]'), m = svg.getScreenCTM(); return m.a; });   // px per mm
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    // the south and north walls overlap in this view; whichever is on top is the one picked
    const picked = await inPage(() => { const g = window.bimcraftElevEdit.state.sel?.wall; const w = window.bimcraftPlan.state.data.walls.find((x) => x.guid === g); return w ? { guid: w.guid, a: w.a } : null; });
    await page.mouse.move(box.x + box.width / 2 + 250 * k, box.y + box.height / 2, { steps: 6 });
    await page.mouse.move(box.x + box.width / 2 + 500 * k, box.y + box.height / 2, { steps: 6 });
    await page.mouse.up();
    await settled();
    await page.waitForFunction(([g, a0]) => { const w = window.bimcraftPlan.state.data.walls.find((x) => x.guid === g); return w && Math.abs(w.a[0] - a0[0]) + Math.abs(w.a[1] - a0[1]) > 1; }, [picked.guid, picked.a], { timeout: 15000 }).catch(() => {});
    const moved = await inPage((g) => window.bimcraftPlan.state.data.walls.find((x) => x.guid === g)?.a, picked.guid);
    ok(moved && Math.abs(Math.abs(moved[0] - picked.a[0]) - 500) < 30, 'drag the wall 500 mm in the elevation: it moved along the view (one step)', JSON.stringify([picked.a, moved]));
    // a note
    await page.click('[data-ev-tool="note"]');
    const svgBox = await page.locator('[data-ev-svg]').boundingBox();
    await page.mouse.click(svgBox.x + svgBox.width / 2, svgBox.y + svgBox.height / 3);
    await page.waitForSelector('[data-ev-notedlg][open]');
    await page.fill('[data-ev-notetext]', 'Brick, flush joints');
    await page.click('[data-ev-noteok]');
    await settled();
    await page.waitForSelector('[data-ev-note]', { state: 'attached' });
    ok(/Brick, flush joints/.test(await page.textContent('[data-ev-svg]')), 'Note: written in the elevation and kept');
    await shot(page, 's-03-note');
    await page.keyboard.press('Escape');
    // a new level: click above the top level
    const scr = (x, y) => inPage(([X, Y]) => { const svg = document.querySelector('[data-ev-svg]'), m = svg.getScreenCTM(); return [m.a * X + m.e, m.d * -Y + m.f]; }, [x, y]);
    const lvs = await inPage(() => window.bimcraftElevEdit.state.items.levels.map((l) => l.y));
    const top = Math.max(...lvs), nLv = lvs.length;
    await page.click('[data-ev-tool="level"]');
    const [lx, ly] = await scr(wall.a[0] + 1000, top + 600);
    await page.mouse.move(lx, ly);
    await page.mouse.click(lx, ly);
    await settled();
    await page.waitForFunction((n) => window.bimcraftElevEdit.state.items.levels.length === n, nLv + 1, { timeout: 15000 });
    const lvs2 = await inPage(() => window.bimcraftElevEdit.state.items.levels.map((l) => l.y));
    ok(lvs2.length === nLv + 1 && lvs2.some((y) => Math.abs(y - (top + 600)) <= 20) && (await page.$$('[data-ev-level]')).length === nLv + 1, 'Level tool: a click just above the top level makes a new level there (a line to pick, one more in the model)', JSON.stringify(lvs2));
    const modelLv = await inPage(() => window.bimcraftPlan.state.data.levels.length);
    ok(modelLv === nLv + 1, 'the plan\'s level list has it');
    await shot(page, 's-04-level');
    // a dimension: from the wall's left end to its right end, the click catches the edges
    const wv = await inPage((g) => { const w = window.bimcraftElevEdit.state.items.walls.find((x) => x.guid === g); return { x0: w.x0, x1: w.x1, y1: w.y1 }; }, wall.guid);
    await page.click('[data-ev-tool="dim"]');
    const [ax, ay] = await scr(wv.x0 + 40, wv.y1 + 900), [bx, by] = await scr(wv.x1 - 40, wv.y1 + 900);
    await page.mouse.click(ax, ay);
    await page.mouse.move(bx, by, { steps: 4 });
    await page.mouse.click(bx, by);
    await settled();
    await page.waitForSelector('[data-ev-dim]', { state: 'attached' });
    const dimInfo = await inPage(() => window.bimcraftElevEdit.state.dims.map((d) => ({ len: d.len, a: d.a, b: d.b })));
    ok(dimInfo.length === 1 && Math.abs(dimInfo[0].len - (wv.x1 - wv.x0)) < 1 && dimInfo[0].a[1] === dimInfo[0].b[1], 'Dimension tool: two clicks near the wall\'s ends catch its edges: one horizontal dimension of the wall\'s full length', JSON.stringify(dimInfo));
    ok(/\d/.test(await page.textContent('[data-ev-dim] text')), 'the dimension shows its length');
    await shot(page, 's-05-dimension');
    // pick it and delete it (Delete key)
    await page.click('[data-ev-tool="select"]');
    const dm = await page.locator('[data-ev-dim] line').first().boundingBox();
    await page.mouse.click(dm.x + dm.width / 2, dm.y + dm.height / 2);
    await page.keyboard.press('Delete');
    await settled();
    await page.waitForFunction(() => window.bimcraftElevEdit.state.dims.length === 0, null, { timeout: 15000 });
    ok(!(await page.$('[data-ev-dim]')), 'pick the dimension and press Delete: gone');
    await page.keyboard.press('Control+z');
    await settled();
    await page.waitForFunction(() => window.bimcraftElevEdit.state.dims.length === 1, null, { timeout: 15000 });
    ok(true, 'Ctrl+Z with the panel open brings the dimension back');
    await page.click('[data-ev-close]');
  }

  // ============================================================== t: D8.14-17 portrait, typed scale, move, own SVG title block
  if (want('t')) {
    console.log('== t: portrait sheet, typed scale, move a view, an SVG title block of your own');
    await fresh();
    await newBuilding('Sheet test');
    await room(0, 0, 8000, 5000);
    await inPage(() => window.bimcraftViews.api.openSheet(null));   // the project browser's New sheet (its panel can be folded away in a lab layout)
    await page.waitForSelector('[data-sh-dialog][open]');
    // orientation
    ok((await page.$$eval('[data-sh-paper] option', (o) => o.map((x) => x.value))).every((v) => !v.endsWith(':p')), 'the paper list has one entry per size (A4 … A0, Letter …), no portrait twins');
    await page.selectOption('[data-sh-paper]', 'a2');
    await page.selectOption('[data-sh-orient]', 'portrait');
    ok(await page.$eval('[data-sh-stage] svg', (s) => s.getAttribute('viewBox')) === '0 0 420 594', 'A2 portrait: the sheet is 420 × 594 mm');
    await page.selectOption('[data-sh-orient]', 'landscape');
    ok(await page.$eval('[data-sh-stage] svg', (s) => s.getAttribute('viewBox')) === '0 0 594 420', 'and back to landscape 594 × 420');
    await page.selectOption('[data-sh-orient]', 'portrait');
    // a view, a typed scale
    await page.click('[data-sh-add^="plan:"]');
    await page.waitForSelector('[data-sh-scale-typed]');
    await page.fill('[data-sh-scale-typed]', '1:256');
    await page.press('[data-sh-scale-typed]', 'Enter');
    await page.waitForFunction(() => /1:256/.test(document.querySelector('[data-sh-stage]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, 'typed 1:256: the view is drawn and labelled 1:256');
    await page.fill('[data-sh-scale-typed]', '1:2.5');
    await page.press('[data-sh-scale-typed]', 'Enter');
    await page.waitForFunction(() => /1:2\.5/.test(document.querySelector('[data-sh-stage]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, 'typed 1:2.5: any ratio works');
    await page.fill('[data-sh-scale-typed]', 'banana');
    await page.press('[data-sh-scale-typed]', 'Enter');
    ok(/Not a scale/.test(await page.textContent('[data-sh-scale-bad]')), 'a word that is not a scale says so and changes nothing');
    await page.fill('[data-sh-scale-typed]', '1:100');
    await page.press('[data-sh-scale-typed]', 'Enter');
    await page.waitForFunction(() => /1:100/.test(document.querySelector('[data-sh-stage]')?.textContent || ''), null, { timeout: 15000 });
    // move: type a place, then arrow keys
    await page.fill('[data-sh-pos="x"]', '150');
    await page.press('[data-sh-pos="x"]', 'Enter');
    await page.waitForFunction(() => document.querySelector('[data-sh-pos="x"]')?.value === '150');
    await page.focus('[data-sh-view="0"]');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Shift+ArrowUp');
    await page.waitForFunction(() => document.querySelector('[data-sh-pos="x"]')?.value === '151', null, { timeout: 5000 });
    const y0 = await page.inputValue('[data-sh-pos="y"]');
    ok(await page.inputValue('[data-sh-pos="x"]') === '151' && Number(y0) > 0, 'typed an exact place, then the arrow keys nudged it 1 mm (Shift 10 mm)', y0);
    await shot(page, 't-01-portrait');
    await page.click('[data-sh-save]');
    await settled();
    ok(await inPage(() => window.bimcraftViews.state.sheets.some((s) => s.paper === 'a2:p' && s.views[0]?.ratio === 100 && Math.abs(s.views[0].x - 151) < 0.2)), 'saved: portrait A2, the typed ratio and the moved place');
    // an SVG title block of your own
    const svgText = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="594mm" viewBox="0 0 420 594"><rect x="10" y="10" width="400" height="574" fill="none" stroke="#000" stroke-width="0.5"/><rect x="250" y="530" width="160" height="54" fill="none" stroke="#000"/><text x="254" y="540" font-size="4">Company: {{company}}</text><text x="254" y="552" font-size="5" font-weight="bold">{{drawing-name}}</text><text x="254" y="578" font-size="6">{{number}}</text></svg>';
    const svgPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bc-sheet-')), 'own-sheet.svg');
    fs.writeFileSync(svgPath, svgText);
    await inPage(() => window.bimcraftViews.api.openSheet(window.bimcraftViews.state.sheets[0].id));
    await page.waitForSelector('[data-sh-dialog][open]');
    await page.click('[data-sh-formats]');
    await page.waitForSelector('[data-sf-dialog][open]');
    await page.setInputFiles('[data-sf-svgfile]', svgPath);
    await page.waitForSelector('[data-sf-item="titleblock-1"]');
    ok(/own-sheet/.test(await page.textContent('[data-sf-item="titleblock-1"]')), 'Formats…: Import SVG… adds your own sheet design');
    await page.click('[data-sf-close]');
    await page.waitForSelector('[data-sh-tb] option[value="titleblock-1"]', { state: 'attached' });
    await page.selectOption('[data-sh-tb]', 'titleblock-1');
    await page.waitForSelector('[data-sh-field="company"]');
    await page.fill('[data-sh-field="company"]', 'ACME Design');
    const stage = await page.textContent('[data-sh-stage]');
    ok(/Company: ACME Design/.test(stage), 'the sheet shows your design with the company field filled in', stage.slice(0, 80));
    await shot(page, 't-02-own-design');
    // draw one
    await page.click('[data-sh-formats]');
    await page.waitForSelector('[data-sf-dialog][open]');
    await page.click('[data-sf-drawtb]');
    await page.waitForSelector('[data-td-dialog][open]');
    await page.fill('[data-td-name]', 'Drawn here');
    await page.click('[data-td-border]');
    const sb = await page.locator('[data-td-stage] svg').boundingBox();
    const px = (fx, fy) => [sb.x + sb.width * fx, sb.y + sb.height * fy];
    await page.click('[data-td-tool="line"]');
    await page.mouse.move(...px(0.6, 0.85)); await page.mouse.down(); await page.mouse.move(...px(0.95, 0.85), { steps: 4 }); await page.mouse.up();
    await page.selectOption('[data-td-field]', 'company');
    await page.click('[data-td-tool="text"]');
    await page.mouse.click(...px(0.62, 0.9));
    await page.click('[data-td-save]');
    await page.waitForSelector('[data-sf-item="titleblock-2"]');
    ok(true, 'Draw one…: a border, a line and a {{company}} field drawn on the sheet, saved as a title block');
    await page.click('[data-sf-close]');
    await page.waitForSelector('[data-sh-tb] option[value="titleblock-2"]', { state: 'attached' });
    await page.selectOption('[data-sh-tb]', 'titleblock-2');
    await page.waitForSelector('[data-sh-field="company"]');
    await page.fill('[data-sh-field="company"]', 'Drawn Co');
    ok(/Drawn Co/.test(await page.textContent('[data-sh-stage]')), 'the drawn title block fills its field on the sheet');
    await page.click('[data-sh-dialog] button[value="cancel"]');
  }

  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  if (problems.length) console.log('  console: ' + problems.slice(0, 5).join(' | '));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimviews09']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
