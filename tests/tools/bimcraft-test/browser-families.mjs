#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-families.mjs — BimCraft families (0.6 DC.114, session `bim-families_PART_2`) in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-families.mjs [--shots <dir>] [--only a,b]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimfam), so the shared admin-login
 * throttle is never touched. Fails on any console error.
 *   a   doors in a new building show as a family: the project browser's Families, Build › Families…, the family dialog, New size
 *       from this family, rename, Select, remove an unused size; Properties: the size list and "Open the family"
 *   b   Duplicate a family: the copy opens, the Door tool offers it, a door placed from it
 *   c   Place family (furniture on a floor): the tool, its family and size, R turns, the element's Properties, Delete + Undo
 *   d   the editor: a parameter, a visibility parameter, a solid, a Boolean, the preview drawn by cc-ifc, a size handle dragged,
 *       an extrusion's profile drawn in the sketch (a point added, moved, an arc), Save = one undo step, Undo
 *   e   family files: Save the family file (.ccfamily.json), Save as IFC (an IfcProjectLibrary), Open a family file, New family
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimfam'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' ' + String(e.stack || '').split('\n').slice(1, 16).join(' | ')));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
async function newBuilding(name, n = 1, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const room = async (x0, y0, x1, y1) => { await page.click('[data-mtool="wall"]'); await planClick(x0, y0); await planClick(x1, y0); await planClick(x1, y1); await planClick(x0, y1); await planClick(x0, y0); await page.keyboard.press('Escape'); await settled(); };
const download = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };
const fams = () => page.evaluate(() => window.bimcraftFamilies.state.fams.map((f) => ({ key: f.key, name: f.name, source: f.source, count: f.count, sizes: f.sizes.map((z) => ({ name: z.name, guid: z.guid, count: z.count, values: z.values })), solids: f.fam?.solids?.length || 0, params: (f.fam?.params || []).map((p) => p.key) })));
const famBy = async (key) => (await fams()).find((f) => f.key === key);
const ops = () => page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ guid: o.guid, id: o.id, family: o.family, typeId: o.typeId, w: Math.round(o.width) })));
const buildMenu = async () => { if (!(await page.$('[data-res-tools][open]'))) await page.click('[data-res-tools] > summary'); };
const pickKeys = async (ids) => page.evaluate((list) => { const kb = window.bimcraftRes.api.kb(); window.bimcraftVis.pick(list.map((i) => kb + i)); }, ids);
const undo = async () => { await page.click('[data-act="undo"]'); await settled(); };

try {
  // ============================================================================================ a: families and their sizes
  if (want('a') || want('b')) {
    console.log('== a: doors in a new building show as a family with its sizes');
    await fresh();
    await newBuilding('Families');
    await room(0, 0, 9000, 6000);
    await page.click('[data-mtool="door"]');
    await planClick(2000, 0); await settled();
    await planClick(5000, 0); await settled();
    ok(await page.isVisible('[data-model-osize="door"]'), 'the Door tool shows a size list beside the family');
    // the project browser
    const pb = await page.$('[data-pb-group="families"]');
    ok(!!pb, 'the project browser has a Families group');
    await page.click('[data-pb-group="families"] > summary');
    const row = await page.textContent('[data-pb-family="door-single"]');
    const tag = await page.textContent('[data-pb-group="families"] [data-pb-family="door-single"] ~ .bc-pb-tag');
    ok(/Single swing door/.test(row) && /1 sizes, 2 placed/.test(tag), 'Families › Single swing door: 1 size, 2 placed', row + ' | ' + tag);
    // Build › Families…
    await buildMenu();
    await page.click('[data-fam-list]');
    await page.waitForSelector('[data-famlist-dialog][open]');
    ok(await page.isVisible('[data-famlist-row="door-single"]') && /21|20/.test(await page.textContent('[data-famlist-starters] > summary')), 'Build › Families…: the family listed, the starter families below');
    await shot(page, 'a-01-list');
    await page.click('[data-famlist-open="door-single"]');
    await page.waitForSelector('[data-fam-dialog="door-single"][open]');
    ok((await page.$$('[data-fam-dialog] [data-fam-size]')).length === 1, 'the family dialog: one size');
    // New size from this family
    await page.fill('[data-fam-nv="Width"]', '1000');
    await page.fill('[data-fam-nvname]', 'Wide');
    await page.click('[data-fam-newsize]');
    await settled();
    await page.waitForFunction(() => document.querySelectorAll('[data-fam-dialog] [data-fam-size]').length === 2);
    let f = await famBy('door-single');
    const wide = f.sizes.find((z) => z.name === 'Wide');
    ok(wide && wide.count === 0 && wide.values.Width === 1000, 'New size from this family: "Wide", 1000 wide, nobody on it yet');
    await page.fill('[data-fam-nv="Width"]', '1000');
    await page.click('[data-fam-newsize]');
    const said = await page.waitForFunction(() => /already there/.test(document.querySelector('[data-fam-dialog] [data-fam-err]')?.textContent || ''), null, { timeout: 15000 }).then(() => null, async () => page.evaluate(() => JSON.stringify({ err: document.querySelector('[data-fam-dialog] [data-fam-err]')?.textContent, status: document.querySelector('[data-status]')?.textContent, w: document.querySelector('[data-fam-nv="Width"]')?.value, sizes: document.querySelectorAll('[data-fam-dialog] [data-fam-size]').length })));
    ok(!said, 'the same values again: the dialog says the size is already there', said || '');
    await shot(page, 'a-02-family');
    // rename
    await page.click(`[data-fam-size="${wide.guid}"] [data-fam-rename]`);
    await page.waitForSelector('[data-fam-renamedlg][open]');
    await page.fill('[data-fam-newname]', 'Wide entry');
    await page.click('[data-fam-renameok]');
    await settled();
    f = await famBy('door-single');
    ok(f.sizes.some((z) => z.name === 'Wide entry'), 'renamed to "Wide entry"');
    // Properties: a door changed to the new size, and "Open the family"
    await page.click('[data-fam-dialog] button[value="close"]');
    const O = await ops();
    await pickKeys([O[0].id]);
    await page.waitForSelector('[data-mp-osize]');
    await page.selectOption('[data-mp-osize]', wide.guid);
    await settled();
    const d0 = (await ops()).find((o) => o.guid === O[0].guid);
    ok(d0.w === 1000, 'Properties › Size: the door is 1000 wide now', JSON.stringify(d0));
    f = await famBy('door-single');
    ok(f.sizes.find((z) => z.name === 'Wide entry').count === 1, 'the family counts it on its new size');
    await page.waitForSelector('[data-mp-ofam]');
    await page.click('[data-mp-ofam]');
    await page.waitForSelector('[data-fam-dialog="door-single"][open]');
    // Select picks the size's doors
    await page.click(`[data-fam-size="${wide.guid}"] [data-fam-select]`);
    await page.waitForFunction(() => !document.querySelector('[data-fam-dialog][open]'));
    const sel = await page.evaluate(() => [...document.querySelector('[data-canvas]').viewer.selection]);
    ok(sel.length === 1, 'Select: the dialog closes and the door on that size is picked');
    // remove an unused size (the one the doors left), then Undo
    await undo();
    f = await famBy('door-single');
    ok(f.sizes.find((z) => z.name === 'Wide entry').count === 0, 'Undo: the door is back on its first size');
    await page.evaluate(() => window.bimcraftFamilies.api.openFamily('door-single'));
    await page.waitForSelector(`[data-fam-size="${wide.guid}"] [data-fam-remove]`);
    await page.click(`[data-fam-size="${wide.guid}"] [data-fam-remove]`);
    await settled();
    ok(!(await famBy('door-single')).sizes.some((z) => z.name === 'Wide entry'), 'Remove: the unused size goes');
    await page.click('[data-fam-dialog] button[value="close"]').catch(() => {});
  }

  // ============================================================================================ b: duplicate
  if (want('b')) {
    console.log('== b: duplicate a family');
    await page.evaluate(() => window.bimcraftFamilies.api.openFamily('door-single'));
    await page.waitForSelector('[data-fam-dialog="door-single"][open]');
    await page.click('[data-fam-dup]');
    await page.waitForSelector('[data-fam-dupdlg][open]');
    await page.fill('[data-fam-dupname]', 'Office door');
    await page.click('[data-fam-dupok]');
    await settled();
    await page.waitForFunction(() => [...document.querySelectorAll('dialog[open][data-fam-dialog]')].some((d) => /Office door/.test(d.textContent)));
    const copy = (await fams()).find((x) => x.name === 'Office door');
    ok(copy && copy.source === 'project' && copy.sizes.length >= 1, 'Duplicate: "Office door" opens, with the same sizes', JSON.stringify(copy?.sizes.map((z) => z.name)));
    await page.click('dialog[open][data-fam-dialog] button[value="close"]');
    await page.click('[data-mtool="door"]');
    const names = await page.$$eval('[data-model-otype="door"] option', (o) => o.map((x) => x.textContent));
    ok(names.at(-1) === 'Office door', 'the Door tool offers it after the starter doors');
    await page.selectOption('[data-model-otype="door"]', copy.key);
    await planClick(7000, 0); await settled();
    ok((await ops()).some((o) => o.family === copy.key), 'a door placed from "Office door"');
    await page.click('[data-mtool="select"]');
    await shot(page, 'b-01-duplicate');
  }

  // ============================================================================================ c: place family
  if (want('c')) {
    console.log('== c: Place family (furniture on a floor)');
    await fresh();
    await newBuilding('Furniture');
    await room(0, 0, 8000, 6000);
    await buildMenu();
    await page.click('[data-mtool="family"]');
    await page.waitForSelector('[data-mopts="family"]:not([hidden])');
    const opts = await page.$$eval('[data-fam-pfam] option', (o) => o.map((x) => x.value));
    ok(opts.join() === 'fam-table,fam-shelf,fam-cabinet', 'Place family: the starter table, shelf unit and base cabinet', opts.join());
    ok(/R turns/.test(await page.textContent('[data-model-hint]')), 'its hint says R turns it');
    const [px, py] = await at(3000, 3000);
    await page.mouse.move(px, py, { steps: 3 });
    const ghost = await page.evaluate(() => window.bimcraftPlan.view.overlay?.lines?.length || 0);
    ok(ghost >= 4, 'the table\'s outline follows the pointer (' + ghost + ' lines)');
    await page.keyboard.press('r');
    await page.mouse.click(px, py);
    await settled();
    let els = await page.evaluate(() => window.bimcraftFamilies.state.elements.map((e) => ({ id: e.id, guid: e.guid, x: Math.round(e.x), y: Math.round(e.y), rot: Math.round(e.rot), family: e.family })));
    ok(els.length === 1 && els[0].family === 'fam-table' && Math.abs(els[0].x - 3000) < 40 && els[0].rot === 90, 'a table placed at the click, turned 90° by R', JSON.stringify(els));
    await page.selectOption('[data-fam-pfam]', 'fam-cabinet');
    await planClick(6000, 1000); await settled();
    els = await page.evaluate(() => window.bimcraftFamilies.state.elements.map((e) => ({ id: e.id, guid: e.guid, family: e.family })));
    ok(els.length === 2 && els.some((e) => e.family === 'fam-cabinet'), 'a base cabinet placed (its recess and toe kick cut by Booleans)');
    await shot(page, 'c-01-placed');
    await page.click('[data-mtool="select"]');
    await pickKeys([els.find((e) => e.family === 'fam-table').id]);
    await page.waitForSelector('[data-mp-famx]');
    ok(await page.isVisible('[data-mp-famsize]') && await page.isVisible('[data-mp-famrot]'), 'Properties of a placed family: size, X, Y, turned');
    await page.fill('[data-mp-famx]', '2000');
    await page.press('[data-mp-famx]', 'Enter');
    await settled();
    const moved = await page.evaluate(() => window.bimcraftFamilies.state.elements.find((e) => e.family === 'fam-table'));
    ok(Math.abs(moved.x - 2000) < 1, 'typed X = 2000: the table moves (one undo step)');
    await pickKeys([moved.id]);
    await page.keyboard.press('Delete');
    await settled();
    ok((await page.evaluate(() => window.bimcraftFamilies.state.elements.length)) === 1, 'Delete: the table goes');
    await undo();
    ok((await page.evaluate(() => window.bimcraftFamilies.state.elements.length)) === 2, 'Undo brings it back');
  }

  // ============================================================================================ d: the editor
  if (want('d')) {
    console.log('== d: the family editor');
    if (!want('c')) { await fresh(); await newBuilding('Editor'); await room(0, 0, 8000, 6000); }
    await page.evaluate(() => window.bimcraftFamilies.api.openFamily('fam-table'));
    await page.waitForSelector('[data-fam-dialog="fam-table"][open]');
    await page.click('[data-fam-edit]');
    await page.waitForSelector('[data-fam-editor][open]');
    await page.waitForFunction(() => window.bimcraftFamilyEditor?.state.pv, null, { timeout: 60000 });
    ok(true, 'Edit the family: the editor opens and its preview is drawn from the family\'s IFC');
    // parameters: add a Yes / No one, rename it
    const nParams = await page.evaluate(() => window.bimcraftFamilyEditor.state.fam.params.length);
    await page.selectOption('[data-fe-paddkind]', 'yesno');
    await page.click('[data-fe-padd]');
    await page.waitForFunction((n) => window.bimcraftFamilyEditor.state.fam.params.length === n + 1, nParams);
    const k = await page.evaluate(() => window.bimcraftFamilyEditor.state.fam.params.at(-1).key);
    await page.fill(`[data-fe-pkey="${nParams}"]`, 'Shelf');
    await page.press(`[data-fe-pkey="${nParams}"]`, 'Tab');
    await page.waitForFunction(() => window.bimcraftFamilyEditor.state.fam.params.at(-1).key === 'Shelf');
    ok(k.startsWith('Show'), 'Parameters: a Yes / No parameter added and renamed "Shelf"');
    // a formula
    await page.fill('[data-fe-pformula="Leg"]', 'Width / 30');
    await page.press('[data-fe-pformula="Leg"]', 'Tab');
    await page.waitForSelector('[data-fe-pdriven="Leg"]');
    ok(/50/.test(await page.textContent('[data-fe-pdriven="Leg"]')), 'a formula: Leg = Width / 30 shows its value (50)');
    // solids: a shelf box shown when Shelf, cut by a Boolean
    await page.click('[data-fe-tab="solids"]');
    await page.click('[data-fe-sadd="box"]');
    const sid = await page.evaluate(() => window.bimcraftFamilyEditor.state.sel);
    for (const [f, v] of [['z0', '200'], ['z1', '220'], ['x0', '(-Width / 2 + 60)'], ['x1', '(Width / 2 - 60)']]) { await page.fill(`[data-fe-f="${f}"]`, v); await page.press(`[data-fe-f="${f}"]`, 'Tab'); }
    await page.fill('[data-fe-svis]', 'Shelf');
    await page.press('[data-fe-svis]', 'Tab');
    await page.waitForFunction((id) => window.bimcraftFamilyEditor.state.fam.solids.find((s) => s.id === id)?.visible === 'Shelf', sid);
    ok(true, 'Solids: a box added, its numbers typed as expressions, shown when Shelf (a visibility parameter)');
    await page.click('[data-fe-sadd="box"]');
    const hole = await page.evaluate(() => window.bimcraftFamilyEditor.state.sel);
    for (const [f, v] of [['x0', '-50'], ['x1', '50'], ['y0', '-50'], ['y1', '50'], ['z0', '(Height - 40)'], ['z1', '(Height + 10)']]) { await page.fill(`[data-fe-f="${f}"]`, v); await page.press(`[data-fe-f="${f}"]`, 'Tab'); }
    await page.click('[data-fe-tab="booleans"]');
    await page.selectOption('[data-fe-badda]', 's1');
    await page.selectOption('[data-fe-baddb]', hole);
    await page.click('[data-fe-badd]');
    await page.waitForFunction(() => window.bimcraftFamilyEditor.state.fam.booleans.length === 1);
    ok(true, 'Booleans: a hole cut out of the top');
    // the preview again, and a size handle dragged
    await page.waitForFunction(() => { const s = window.bimcraftFamilyEditor.state; return s.pv && !s.err; }, null, { timeout: 60000 });
    await page.waitForTimeout(600);
    await page.waitForFunction(() => window.bimcraftFamilyEditor.handles().length === 3, null, { timeout: 20000 });
    const h = await page.evaluate(() => { const v = document.querySelector('[data-fe-view]').getBoundingClientRect(); const x = window.bimcraftFamilyEditor.handles().find((q) => q.h.label === 'Width'); return { x: v.left + x.x, y: v.top + x.y }; });
    const w0 = await page.evaluate(() => window.bimcraftFamilyEditor.state.values.Width);
    await page.mouse.move(h.x, h.y); await page.mouse.down(); await page.mouse.move(h.x + 60, h.y + 10, { steps: 6 }); await page.mouse.move(h.x + 120, h.y + 20, { steps: 6 }); await page.mouse.up();
    const w1 = await page.evaluate(() => window.bimcraftFamilyEditor.state.values.Width);
    const why = w1 !== w0 ? '' : await page.evaluate(() => JSON.stringify({ hs: window.bimcraftFamilyEditor.handles().map((q) => [q.h.label, Math.round(q.x), Math.round(q.y), q.h.axis]), err: document.querySelector('[data-fe-err]')?.textContent, drag: !!window.bimcraftFamilyEditor.state.drag, view: (() => { const r = document.querySelector('[data-fe-view]').getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); })() }));
    ok(w1 !== w0 && w1 > 0, 'the Width handle dragged in the 3D view: the size shown changes (' + w0 + ' → ' + w1 + ')', why + ' at ' + JSON.stringify(h));
    await shot(page, 'd-01-editor');
    // an extrusion's profile in the sketch
    await page.click('[data-fe-tab="solids"]');
    await page.click('[data-fe-sadd="extrude"]');
    await page.waitForSelector('[data-fe-sketchbox]:not([hidden])');
    const skWhy = await page.waitForFunction(() => window.bimcraftFamilyEditor.sketch()?.pts?.length === 4, null, { timeout: 15000 }).then(() => null, () => page.evaluate(() => { const E = window.bimcraftFamilyEditor; const s = E.state.fam.solids.find((q) => q.id === E.state.sel); return JSON.stringify({ sel: E.state.sel, op: s?.op, profile: s?.profile, sk: E.sketch() && { n: E.sketch().pts?.length, keys: Object.keys(E.sketch()) }, hidden: document.querySelector('[data-fe-sketchbox]')?.hidden }); }));
    if (skWhy) throw new Error('the sketch did not show the new extrusion: ' + skWhy);
    const before = await page.evaluate(() => window.bimcraftFamilyEditor.sketch().pts.length);
    await page.$eval('[data-fe-sketch]', (n) => n.scrollIntoView({ block: 'center' }));   // the sketch is further down the editor
    await page.waitForTimeout(200);
    const box = await page.$eval('[data-fe-sketch]', (n) => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
    const sk = await page.evaluate(() => window.bimcraftFamilyEditor.sketch().pts.map((p) => [p.x, p.y]));
    // empty paper, well away from the square: a point after the last one
    await page.mouse.click(box.l + sk[2][0] + 40, box.t + sk[2][1] + 30);
    const addWhy = await page.waitForFunction((n) => window.bimcraftFamilyEditor.sketch()?.pts?.length === n + 1, before, { timeout: 15000 }).then(() => null, () => page.evaluate(() => JSON.stringify({ pts: window.bimcraftFamilyEditor.sketch().pts.map((q) => [Math.round(q.x), Math.round(q.y)]), err: document.querySelector('[data-fe-err]')?.textContent, pick: window.bimcraftFamilyEditor.sketch().pick })));
    if (addWhy) throw new Error('a click on the paper added no point: ' + addWhy + ' clicked at ' + JSON.stringify([sk[2][0] + 40, sk[2][1] + 30]) + ' in ' + JSON.stringify(box));
    ok(true, 'the sketch: a click on the paper adds a point');
    // the points table above the sketch grew a row: measure the sketch again
    await page.$eval('[data-fe-sketch]', (n) => n.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(200);
    Object.assign(box, await page.$eval('[data-fe-sketch]', (n) => { const r = n.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; }));
    const p1 = await page.evaluate(() => { const s = window.bimcraftFamilyEditor.sketch(); return [s.pts[1].x, s.pts[1].y]; });
    await page.mouse.move(box.l + p1[0], box.t + p1[1]); await page.mouse.down(); await page.mouse.move(box.l + p1[0] + 80, box.t + p1[1] + 5, { steps: 8 }); await page.mouse.up();
    const sel2 = await page.evaluate(() => window.bimcraftFamilyEditor.state.sel);
    const moved = await page.evaluate((id) => window.bimcraftFamilyEditor.state.fam.solids.find((s) => s.id === id).profile[1].join(), sel2);
    ok(moved !== '200,0', 'a point dragged on the work plane (' + moved + ')');
    const mid = await page.evaluate(() => { const m = window.bimcraftFamilyEditor.sketch().mids[0]; return [m.x, m.y]; });
    await page.keyboard.down('Shift'); await page.mouse.click(box.l + mid[0], box.t + mid[1]); await page.keyboard.up('Shift');
    await page.waitForFunction((id) => !!window.bimcraftFamilyEditor.state.fam.solids.find((s) => s.id === id).profile[0][2], sel2);
    ok(true, 'Shift+click a segment\'s square: the segment becomes an arc');
    await shot(page, 'd-02-sketch');
    // undo inside the editor never touches the model
    const changes = await page.evaluate(() => document.querySelector('[data-act="undo"]').disabled);
    await page.click('[data-fe-undo]');
    await page.waitForFunction((id) => !window.bimcraftFamilyEditor.state.fam.solids.find((s) => s.id === id).profile[0][2], sel2);
    ok(await page.evaluate(() => document.querySelector('[data-act="undo"]').disabled) === changes, 'the editor\'s Undo takes back the arc only (the model is untouched)');
    // save: one undo step in the model
    await page.waitForFunction(() => { const s = window.bimcraftFamilyEditor.state; return !s.err; }, null, { timeout: 30000 }).catch(() => {});
    await page.click('[data-fe-save]');
    await page.waitForFunction(() => !document.querySelector('[data-fam-editor]'), null, { timeout: 30000 });
    await settled();
    let tf = await famBy('fam-table');
    ok(tf && tf.source === 'project' && tf.solids === 10 && tf.params.includes('Shelf'), 'Save: the table family is the file\'s own now, with its 10 solids and the Shelf parameter', JSON.stringify(tf && { s: tf.source, n: tf.solids }));
    await undo();
    tf = await famBy('fam-table');
    ok(!tf || tf.source !== 'project' || tf.solids === 7, 'Undo: the edit taken back in one step');
  }

  // ============================================================================================ e: family files
  if (want('e')) {
    console.log('== e: family files');
    if (!want('c') && !want('d')) { await fresh(); await newBuilding('Files'); await room(0, 0, 8000, 6000); }
    await page.evaluate(() => window.bimcraftFamilies.api.openFamily('fam-shelf'));
    await page.waitForSelector('[data-fam-dialog="fam-shelf"][open]');
    const j = await download('[data-fam-file]');
    const file = JSON.parse(j.bytes.toString('utf8'));
    ok(/\.ccfamily\.json$/.test(j.name) && file.format === 'cadcraft-family' && file.solids.length === 8, 'Save the family file: ' + j.name + ' (format cadcraft-family, its 8 solids)');
    const ifc = await download('[data-fam-ifc]');
    const txt = ifc.bytes.toString('latin1');
    ok(/\.ifc$/.test(ifc.name) && /IFCPROJECTLIBRARY\(/.test(txt) && /IFCRELDECLARES\(/.test(txt) && /'Family'\)/.test(txt), 'Save as IFC: ' + ifc.name + ' with an IfcProjectLibrary declaring the family');
    await page.click('[data-fam-dialog] button[value="close"]');
    // open both back
    file.name = 'Shelf from a file';
    for (const [name, bytes] of [['shelf.ccfamily.json', Buffer.from(JSON.stringify(file))], [ifc.name, ifc.bytes]]) {
      await buildMenu();
      await page.click('[data-fam-list]');
      await page.waitForSelector('[data-famlist-dialog][open]');
      const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-famlist-file]')]);
      await fc.setFiles({ name, mimeType: 'application/octet-stream', buffer: bytes });
      await waitStatus(/families opened/);
      await settled();
      await page.keyboard.press('Escape');
    }
    const names = (await fams()).filter((x) => x.source === 'project').map((x) => x.name);
    ok(names.includes('Shelf from a file') && names.filter((n) => n === 'Shelf unit').length >= 1, 'Open a family file: the .ccfamily.json and the IFC each bring their family in', names.join(', '));
    // a new family from nothing: the editor opens next
    await page.keyboard.press('Escape');
    await page.evaluate(() => window.bimcraftFamilies.api.openNew());
    await page.waitForSelector('[data-fam-newdlg][open]');
    await page.fill('[data-fam-newnm]', 'Plinth');
    await page.selectOption('[data-fam-newkind]', 'generic');
    await page.click('[data-fam-newok]');
    await page.waitForSelector('[data-fam-editor][open]', { timeout: 30000 });
    ok((await fams()).some((x) => x.name === 'Plinth'), 'New family: "Plinth" made and the editor opened on it');
    await page.click('[data-fe-cancel]');
    await shot(page, 'e-01-files');
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message || e));
  if (page) await shot(page, 'zz-failure').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimfam']); } catch (e) { /* the session ends anyway */ }
}
const real = problems.filter((p) => !/favicon|ResizeObserver loop/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 3).join(' | '));
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
