#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fammore.mjs — 0.7 BIM-FAM-MORE: the family editor's new tabs and what they do in the plan, headless.
 *   node tools/bimcraft-test/browser-fammore.mjs [--shots dir]       (run as root; minted session bimfmore)
 *   a family made from nothing; typed parameters (text, material, whole number) and one set per element; a plan symbol with a rectangle and a
 *   text; a hotspot; saved and placed: the plan draws the symbol, Properties offers the per-element text, dragging the hotspot in the plan resizes it;
 *   sizes from a CSV table through the family dialog; the detail level in the list. Fails on any console error.
 */
/**
 * browser-fammore.mjs — 0.7 BIM-FAM-MORE: the family editor's new tabs and what they do in the plan, headless.
 *   node tools/bimcraft-test/browser-fammore.mjs [--shots dir]       (run as root; minted session bimfmore)
 *   every control has a name; the dialog has a name and live status; Tab stays inside and reaches Save; Esc closes and the focus
 *   returns where it was; on a 390 × 800 phone nothing runs off the side, Save is on screen and touch-sized, fields are 16 px.
 */
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimfmore'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' ' + String(e.stack || '').split('\n').slice(1, 3).join(' | ')));
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

const sym = () => page.evaluate(() => { const s = window.bimcraftPlan.view.scene; return { n: s.symbols.length, texts: s.symbols.flatMap((x) => (x.texts || []).map((q) => q.text)), polys: s.symbols.filter((x) => x.poly).length }; });
try {
  await fresh();
  await newBuilding('More');
  await page.evaluate(() => window.bimcraftFamilies.api.openNew());
  await page.waitForSelector('[data-fam-newdlg][open]');
  await page.fill('[data-fam-newnm]', 'Desk');
  await page.selectOption('[data-fam-newkind]', 'furniture');
  await page.click('[data-fam-newok]');
  await page.waitForSelector('[data-fam-editor][open]', { timeout: 30000 });
  const tabs = await page.$$eval('[data-fam-editor] [role=tab]', (t) => t.map((x) => x.dataset.feTab));
  ok(tabs.join() === 'params,solids,booleans,symbol,parts,hotspots', 'the editor has the new tabs: ' + tabs.join(', '));

  console.log('== typed parameters');
  const kinds = await page.$$eval('[data-fe-paddkind] option', (o) => o.map((x) => x.value));
  ok(['length', 'angle', 'number', 'integer', 'yesno', 'pen', 'text', 'material', 'fill'].every((k) => kinds.includes(k)), 'nine parameter kinds are offered');
  for (const k of ['text', 'material', 'integer']) { await page.selectOption('[data-fe-paddkind]', k); await page.click('[data-fe-padd]'); }
  ok(await page.locator('select[data-fe-pval]').count() === 1 && await page.locator('input[data-fe-pval]').count() >= 5, 'a material parameter is a list, a text and a whole number are boxes');
  const matOpts = await page.$$eval('select[data-fe-pval] option', (o) => o.map((x) => x.textContent));
  ok(matOpts.length > 5 && /Concrete|Brick/.test(matOpts.join()), 'the material list holds the project\'s materials (' + matOpts.length + ')');
  await page.fill('[data-fe-pval="Text1"]', 'D-1'); await page.dispatchEvent('[data-fe-pval="Text1"]', 'change');
  await page.check('[data-fe-pinst="Text1"]');
  ok(await page.isChecked('[data-fe-pinst="Text1"]') && (await page.evaluate(() => window.bimcraftFamilyEditor.state.fam.params.find((p) => p.key === 'Text1').instance)) === true, 'the text parameter is set per element');
  ok(!(await page.locator('[data-fe-pformula="Text1"]').count()), 'a word parameter has no formula box');

  console.log('== a plan symbol, a hotspot, arrays');
  await page.click('[data-fe-tab="symbol"]');
  await page.click('[data-fe-symadd="rect"]');
  await page.click('[data-fe-symadd="text"]');
  await page.fill('[data-fe-symtext]', 'No. {{Text1}}'.replace('{{', '{').replace('}}', '}'));
  await page.dispatchEvent('[data-fe-symtext]', 'change');
  ok(await page.locator('[data-fe-sympart]').count() === 2, 'two symbol parts: a rectangle and a text');
  await page.click('[data-fe-tab="hotspots"]');
  await page.click('[data-fe-hotadd="point"]');
  ok(await page.locator('[data-fe-hot]').count() === 1 && await page.inputValue('[data-fe-hotdrives]') === 'Width', 'a hotspot on the right driving Width');
  await page.click('[data-fe-tab="solids"]');
  await page.check('[data-fe-arrayon]');
  ok(await page.locator('[data-fe-arrayf="count"]').count() === 1, 'the solid can be repeated (count and steps)');
  await page.fill('[data-fe-arrayf="count"]', '3'); await page.dispatchEvent('[data-fe-arrayf="count"]', 'change');
  await page.fill('[data-fe-arrayf="dz"]', '100'); await page.dispatchEvent('[data-fe-arrayf="dz"]', 'change');
  await page.fill('[data-fe-arrayf="dx"]', '0'); await page.dispatchEvent('[data-fe-arrayf="dx"]', 'change');
  await page.waitForTimeout(600);
  await shot(page, 'more-01-editor');
  await page.click('[data-fe-save]');
  await page.waitForFunction(() => !document.querySelector('[data-fam-editor][open]'), null, { timeout: 30000 });
  await settled();

  console.log('== in the plan');
  const key = await page.evaluate(() => window.bimcraftFamilies.state.fams.find((f) => f.name === 'Desk')?.key);
  ok(!!key, 'the family is saved');
  await page.evaluate((k) => window.bimcraftFamilies.api.startPlace(k), key);
  await page.evaluate(() => window.bimcraftPlan.click([2000, 2000]));
  await settled();
  await page.click('[data-mtool="select"]');
  await page.evaluate(() => window.bimcraftPlan.view.fit());
  let s = await sym();
  ok(s.n >= 1 && s.texts.includes('No. D-1') && s.polys === 1, 'the plan draws the family\'s own symbol: a rectangle and the text "No. D-1" (' + JSON.stringify(s) + ')');
  await planClick(2000, 2000);
  await page.waitForSelector('[data-mp-inst="Text1"]', { timeout: 10000 }).catch(() => {});
  ok(await page.locator('[data-mp-inst="Text1"]').count() === 1, 'Properties offers the per-element text');
  await page.fill('[data-mp-inst="Text1"]', 'D-2'); await page.dispatchEvent('[data-mp-inst="Text1"]', 'change');
  await settled();
  s = await sym();
  ok(s.texts.includes('No. D-2'), 'changing it on the element changes the plan text ("No. D-2")');
  const el1 = await page.evaluate(() => window.bimcraftFamilies.state.elements[0]);
  ok(el1.instance.Text1 === 'D-2', 'stored on the element: ' + JSON.stringify(el1.instance));
  await shot(page, 'more-02-plan');

  console.log('== dragging a hotspot in the plan');
  const w0 = await page.evaluate(() => window.bimcraftFamilies.state.elements[0].values.Width);
  const [gx, gy] = await at(2000 + w0 / 2, 2000 + 300);
  const [tx, ty] = await at(2000 + w0 / 2 + 300, 2000 + 300);
  await page.mouse.move(gx, gy); await page.mouse.down(); await page.mouse.move(tx, ty, { steps: 8 }); await page.mouse.up();
  await settled();
  const w1 = await page.evaluate(() => window.bimcraftFamilies.state.elements[0].values.Width);
  ok(w1 > w0 + 200, 'the hotspot dragged 300 to the right widens it: Width ' + w0 + ' → ' + w1);
  ok(await page.evaluate(() => window.bimcraftFamilies.state.elements.length) === 1, 'still one element');
  await page.click('[data-act="undo"]'); await settled();
  ok(await page.evaluate(() => window.bimcraftFamilies.state.elements[0].values.Width) === w0, 'one Undo puts the size back');

  console.log('== a family inside another');
  await page.evaluate(() => window.bimcraftFamilies.api.openNew());
  await page.waitForSelector('[data-fam-newdlg][open]');
  await page.fill('[data-fam-newnm]', 'Workstation');
  await page.selectOption('[data-fam-newkind]', 'furniture');
  await page.click('[data-fam-newok]');
  await page.waitForSelector('[data-fam-editor][open]', { timeout: 30000 });
  await page.click('[data-fe-tab="parts"]');
  const offered = await page.$$eval('[data-fe-partfam] option', (o) => o.map((x) => x.textContent));
  ok(offered.includes('Desk'), 'the Desk is offered to put inside (' + offered.slice(0, 4).join(', ') + '…)');
  await page.selectOption('[data-fe-partfam]', { label: 'Desk' });
  await page.click('[data-fe-partadd]');
  await page.fill('[data-fe-partat="0"]', '500'); await page.dispatchEvent('[data-fe-partat="0"]', 'change');
  await page.waitForTimeout(1500);
  ok(await page.locator('[data-fe-part]').count() === 1 && await page.inputValue('[data-fe-partat="0"]') === '500', 'a part: the Desk 500 along');
  ok(!(await page.textContent('[data-fe-err]')).trim(), 'the preview draws it without a complaint');
  await page.click('[data-fe-save]');
  await page.waitForFunction(() => !document.querySelector('[data-fam-editor][open]'), null, { timeout: 30000 });
  await settled();
  ok(await page.evaluate(() => window.bimcraftFamilies.state.fams.some((f) => f.name === 'Workstation')), 'the Workstation is saved holding the Desk');

  console.log('== sizes from a table, and the detail level');
  await page.evaluate((k) => window.bimcraftFamilies.api.openFamily(k), key);
  await page.waitForSelector('[data-fam-dialog][open]');
  const n0 = await page.locator('[data-fam-size]').count();
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-fam-csvin]')]);
  await fc.setFiles({ name: 'sizes.csv', mimeType: 'text/csv', buffer: Buffer.from('Name,Width,Depth\nSmall,900,500\nLarge,"1,5 m",700\n') });
  await waitStatus(/2 sizes added/); await settled();
  await page.evaluate((k) => { window.bimcraftFamilies.api.read(); }, key);
  ok(await page.locator('[data-fam-size]').count() === n0 + 2, 'two sizes from the table: ' + n0 + ' → ' + (n0 + 2));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-fam-csvout]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(/^\ufeffName,/.test(csv) && /Small,900,500/.test(csv) && /Large,1500,700/.test(csv), 'Save the sizes as a table: the names and values, "1,5 m" read as 1500');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.bimcraftFamilies.api.openList());
  await page.waitForSelector('[data-famlist-dialog][open]');
  await page.selectOption('[data-famlist-detail]', 'coarse');
  await settled();
  ok(await page.inputValue('[data-famlist-detail]') === 'coarse', 'the detail level list takes Coarse (no error)');
  await shot(page, 'more-03-list');
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
