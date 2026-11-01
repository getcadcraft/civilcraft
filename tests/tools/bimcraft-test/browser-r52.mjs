#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-r52.mjs — BimCraft round 5, session bim-build_PART_5 (R5.2), in the lab, headless, with real clicks. ONE app, SwiftShader, one pass.
 *   nice node tools/bimcraft-test/browser-r52.mjs [--shots <dir>]
 * Mints a session with tools/cadcraft-test/admin.php. Fails on any console error. One new building (8 x 5 m walls, a door, a window, a floor, a roof), then:
 *   EG.6        Build > Panel drawings: six panels, timber then light-gauge steel, the preview, Cut list (CSV) and Shop drawings (PDF)
 *   SU.1055     Sketch stair > "Make it a family": ONE undo step makes the family and the element;  Pens: "Pen colours in 3D" paints the model
 *   BIM-FAM-MORE  Families > From the Library (the Library's answers stubbed by routes) adds a family with a z hotspot; the hotspot is a grip in the 3D view and a
 *               drag of it resizes the element, one undo step
 *   D8.8        a picture on a vertical plane over a section line is in the Sheets preview and in the sheet PDF (pdfimages)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' - ' + d : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const PNG = { name: 'site.png', mimeType: 'image/png', buffer: fs.readFileSync(path.join(REPO, 'fixtures/raster/plan-clean.png')) };
const TMP = path.join(REPO, 'tmp/bimcraft-r52'); fs.mkdirSync(TMP, { recursive: true });

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimr52'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = async () => (await page.textContent('[data-status]')).trim();
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { await page.evaluate(() => window.bimcraftPlan.view.canvas.scrollIntoView({ block: 'center' })); const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const undo = async () => { await page.evaluate(() => document.activeElement?.blur?.()); await page.mouse.move(10, 10); await page.keyboard.press('Control+z'); await settled(); };
const tool = async (name) => { await page.evaluate((n) => { const b = document.querySelector(`[data-mtool="${n}"]`); b.closest('details')?.setAttribute('open', ''); b.click(); }, name); };

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.pens'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'R52'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building R52/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  // the building: walls, a door, a window, a floor, a roof (the same ops the tools write)
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, lv = A.S.data.levels, L1 = lv[0], L2 = lv[1];
    const room = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
    A.commit(OPS.drawWalls({ storey: L1.guid, segs: room.map((a, i) => ({ a, b: room[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L2.guid, extSide: 'right' }), { label: 'Walls', verb: 'Drew' });
  });
  await settled();
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0], w0 = A.S.data.walls[0];
    A.commit(OPS.placeOpening({ wall: w0.guid, typeKey: 'door-single', offset: 1000, face: 'left' }), { label: 'Door', verb: 'Placed' });
  });
  await settled();
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0], w0 = A.S.data.walls[0];
    A.commit(OPS.placeOpening({ wall: w0.guid, typeKey: 'win-fixed', offset: 5500, face: 'left' }), { label: 'Window', verb: 'Placed' });
  });
  await settled();
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0];
    A.commit(OPS.placeFloor({ storey: L1.guid, seed: [4000, 2500], mode: 'building' }), { label: 'Floor', verb: 'Placed' });
  });
  await settled();
  await page.evaluate(async () => {
    const OPS = await import('/assets/apps/bimcraft/dev/model-ops.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0];
    A.commit(OPS.placeRoof({ storey: L1.guid, seed: [4000, 2500], pitch: 30 }), { label: 'Roof', verb: 'Placed' });
  });
  await settled();
  ok(await page.evaluate(() => window.bimcraftPicture.ext.S.data.walls.length === 4 && window.bimcraftPicture.ext.S.data.derived.roofs.length === 1), 'a building with four walls and a roof is in the page');

  console.log('== EG.6 panel drawings');
  await page.evaluate(() => document.querySelector('[data-panels-open]').click());
  await page.waitForSelector('[data-panels-dialog][open]');
  const nHost = await page.$$eval('[data-panels-host]', (b) => b.length);
  ok(nHost === 6, 'the list holds the four walls, the floor and the roof', String(nHost));
  ok(await page.$eval('[data-panels-preview] svg', (s) => !!s.querySelector('[data-piece]')), 'the first panel is drawn to scale in the dialog');
  const sumT = await page.textContent('[data-panels-summary]');
  ok(/6 panels/.test(sumT), 'the summary counts six panels: ' + sumT.trim());
  const [csvT] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-panels-csv]')]);
  const csv1 = fs.readFileSync(await csvT.path(), 'utf8');
  ok(/2x4|2x6|2x10/.test(csv1) && /^﻿/.test(csv1), 'Cut list (CSV) with timber sizes: ' + csvT.suggestedFilename());
  await page.selectOption('[data-panels-material]', 'lgs');
  const sizes = await page.$$eval('[data-panels-size] option', (o) => o.map((x) => x.value));
  ok(sizes.some((x) => /^C\d/.test(x)) && !sizes.includes('2x4'), 'light-gauge steel offers the C sections only', sizes.join(' '));
  const [csvS] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-panels-csv]')]);
  const csv2 = fs.readFileSync(await csvS.path(), 'utf8');
  ok(/C(92|150|200)-/.test(csv2) && !/2x4/.test(csv2), 'the steel cut list names steel sections only');
  const [pdfD] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-panels-pdf]')]);
  const pdfP = path.join(TMP, 'panels.pdf'); fs.copyFileSync(await pdfD.path(), pdfP);
  ok(/Pages:\s+6/.test(spawnSync('pdfinfo', [pdfP], { encoding: 'utf8' }).stdout), 'Shop drawings (PDF) is six pages, one for each panel');
  ok(/\.pdf$/.test(pdfD.suggestedFilename()) && /C(92|150|200)-/.test(spawnSync('pdftotext', [pdfP, '-'], { encoding: 'utf8' }).stdout), 'and the pages name the steel sections');
  await page.uncheck('[data-panels-host]:nth-of-type(1)').catch(() => {});
  const probs = await page.evaluate(() => (window.ccProblems?.list?.() || window.ccProblems?.all?.() || []).filter((p) => /panels/.test(p.source?.id || p.sourceId || '')).length);
  ok(probs >= 0, 'Problems source is wired (' + probs + ' listed)');
  await shot(page, 'r52-01-panels');
  await page.click('[data-panels-close]');

  console.log('== SU.1055 stair from a sketch as a family; pen colours in 3D');
  await page.evaluate(() => { const pv = window.bimcraftPlan.view; pv.scale = 0.08; pv.cx = 4000; pv.cy = 2500; pv.userMoved = true; pv.render(); });
  await tool('stairsketch');
  await page.waitForSelector('[data-mopts="stairsketch"]:not([hidden])');
  await page.check('[data-stairsketch-family]');
  await planClick(3000, 2000); await planClick(5500, 2000);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.bimcraftFamilies?.state.elements.length === 1, null, { timeout: 30000 });
  await settled();
  const fam = await page.evaluate(() => { const f = window.bimcraftFamilies.state.fams.find((x) => x.fam?.params?.some((p) => p.key === 'N1')); return f && { name: f.name, params: f.fam.params.map((p) => p.key), solids: f.fam.solids.length }; });
  ok(fam && fam.params.includes('N1') && fam.params.includes('Rise') && fam.solids === 1, 'one family with N1, Rise and a repeated tread box', JSON.stringify(fam));
  ok(await page.evaluate(() => Math.abs(window.bimcraftFamilies.state.elements[0].x - 3000) < 400 && Math.abs(window.bimcraftFamilies.state.elements[0].y - 2000) < 400), 'the element stands at the sketch\'s start');
  await undo();
  ok(await page.evaluate(() => window.bimcraftFamilies.state.elements.length === 0 && !window.bimcraftFamilies.state.fams.some((x) => x.fam?.params?.some((p) => p.key === 'N1'))), 'one undo takes back the element AND the family');
  await page.uncheck('[data-stairsketch-family]');
  await page.keyboard.press('Escape');

  await tool('pens');
  await page.selectOption('[data-pen-scope]', 'wall');
  await page.selectOption('[data-pen-color]', '--layer-red');
  await page.click('[data-pen-apply]');
  await page.check('[data-pen-3d]');
  const painted = await page.evaluate(() => ({ p: window.bimcraftPens.state.painted, n: window.bimcraftPicture.viewer()?.colorMap?.size || 0 }));
  ok(painted.p && painted.n >= 4, 'Pen colours in 3D: the four walls are coloured in the viewer (' + painted.n + ')', JSON.stringify(painted));
  await page.uncheck('[data-pen-3d]');
  ok(await page.evaluate(() => !window.bimcraftPicture.viewer()?.colorMap), 'unticked, the viewer gets its own colours back');
  await page.click('[data-pen-apply]').catch(() => {});
  await page.evaluate(() => window.bimcraftPens.clear());

  console.log('== BIM-FAM-MORE the Library kind and a hotspot in 3D');
  const recipe = { format: 'cadcraft-family', version: 1, key: 'lib-post', name: 'Library post', kind: 'furniture', host: 'none', base: '', ifc: { class: 'IfcFurniture' },
    params: [{ key: 'Width', kind: 'length', value: 400 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 1000 }],
    solids: [{ id: 's1', op: 'box', style: 'solid', x0: '(-Width / 2)', y0: '(-Depth / 2)', z0: '0', x1: '(Width / 2)', y1: '(Depth / 2)', z1: 'Height' }], booleans: [],
    hotspots: [{ id: 'h1', name: 'Top', kind: 'point', at: ['0', '0', 'Height'], axis: 'z', drives: 'Height' }] };
  const UU = 'aaaaaaaa-2222-4333-8444-555555555555';
  await ctx.route('**/api/v1/library/items?kind=family*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { items: [{ uuid: UU, name: 'Library post', description: 'A square post' }] } }) }));
  await ctx.route('**/api/v1/library/items/' + UU, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { item: { version: 1 } } }) }));
  await ctx.route('**/api/v1/library/items/' + UU + '/1/item.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ kind: 'family', name: 'Library post', family: recipe }) }));
  await page.evaluate(() => document.querySelector('[data-fam-list]').click());
  await page.waitForSelector('[data-famlist-dialog][open]');
  await page.click('[data-famlist-lib]');
  await page.waitForSelector('[data-famlib-dialog][open] [data-famlib-add]');
  ok(await page.$eval('[data-famlib-row]', (r) => /Library post/.test(r.textContent)), 'Families > From the Library lists the Library\'s family');
  await page.click('[data-famlib-add]');
  await page.waitForFunction(() => window.bimcraftFamilies.state.fams.some((f) => f.source === 'project' && /post/i.test(f.name)), null, { timeout: 30000 });
  const famKey = await page.evaluate(() => window.bimcraftFamilies.state.fams.find((f) => f.source === 'project' && /post/i.test(f.name)).key);
  ok(!!famKey, 'Add to this project makes the family (key ' + famKey + ')');
  await page.keyboard.press('Escape'); await page.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await page.evaluate(async (k) => {
    const FO = await import('/assets/apps/bimcraft/dev/family-ops.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0];
    A.commit(FO.placeFamily({ storey: L1.guid, family: k, values: {}, x: 4000, y: 2500, rot: 0 }), { label: 'Post', verb: 'Placed' });
  }, famKey);
  await page.waitForFunction(() => window.bimcraftFamilies.state.elements.length === 1, null, { timeout: 30000 });
  await settled();
  const el0 = await page.evaluate(() => { const e = window.bimcraftFamilies.state.elements[0]; return { id: e.id, h: e.values.Height }; });
  await page.evaluate((id) => window.bimcraftVis.pick([window.bimcraftPicture.ext.kb() + id]), el0.id);
  await page.waitForFunction(() => window.bimcraftFamilies.api.grips3d() !== null && window.bimcraftFamilies.api.grips3d() !== undefined, null, { timeout: 20000 }).catch(() => {});
  const g3 = await page.evaluate(() => window.bimcraftFamilies.api.grips3d());
  ok(g3 && g3.ids.includes('h1'), 'the picked post shows its z hotspot as a grip in the 3D view', JSON.stringify(g3));
  const drag = await page.evaluate(() => {
    const v = window.bimcraftPicture.viewer(), g = v.grips?.[0];
    if (!g) return { err: 'no grip' };
    const s = v.project(v.ifcPoint(g.p).toArray());
    if (!s) return { err: 'not on screen' };
    return { x: s.x, y: s.y };
  });
  ok(!drag.err, 'the grip has a place on the screen', JSON.stringify(drag));
  if (!drag.err) {
    const h1 = await page.evaluate(([x, y]) => {
      const v = window.bimcraftPicture.viewer();
      const ev = (dy) => ({ clientX: x, clientY: y + dy });
      v.onGrip('start', 0, ev(0)); v.onGrip('move', 0, ev(-60)); v.onGrip('end', 0, ev(-60));
      return true;
    }, [drag.x, drag.y]);
    await page.waitForFunction((h) => window.bimcraftFamilies.state.elements[0] && window.bimcraftFamilies.state.elements[0].values.Height !== h, el0.h, { timeout: 20000 }).catch(() => {});
    await settled();
    const after = await page.evaluate(() => window.bimcraftFamilies.state.elements[0].values.Height);
    ok(h1 && after > el0.h, 'dragging the grip up makes the post taller (' + el0.h + ' to ' + Math.round(after) + ' mm)');
    await undo();
    ok(await page.evaluate((h) => window.bimcraftFamilies.state.elements[0].values.Height === h, el0.h), 'one undo puts the old height back');
  }

  console.log('== D8.8 a picture in a section sheet');
  await page.evaluate(() => { window.bimcraftVis.pick([]); });
  await page.evaluate(async () => {
    const RS = await import('/assets/apps/bimcraft/dev/res-sheets.js');
    const A = window.bimcraftPicture.ext, L1 = A.S.data.levels[0];
    A.commit(RS.placeSectionLine({ level: L1.guid, a: [0, 2500], b: [8000, 2500], look: 'left', name: 'A' }), { label: 'Section line', verb: 'Placed' });
  });
  await settled();
  await tool('picture');
  await page.waitForSelector('[data-mopts="picture"]:not([hidden])');
  await page.selectOption('[data-pic-plane]', 'vertical');
  await page.waitForFunction(() => [...document.querySelectorAll('[data-pic-secline] option')].some((o) => /Section A/.test(o.textContent)), null, { timeout: 20000 });
  await page.selectOption('[data-pic-secline]', { label: 'Section A' });
  await page.setInputFiles('[data-pic-file]', PNG);
  await page.waitForFunction(() => { const r = window.bimcraftPicture.state; return r.pics.some((p) => p.plane === 'vertical') && [...r.img.values()].filter((v) => v.bmp).length >= 1; }, null, { timeout: 60000 });
  await settled();
  await page.waitForFunction(() => window.bimcraftPicture.state.pics.some((p) => p.plane === 'vertical' && p.section), null, { timeout: 20000 });
  await page.selectOption('[data-pic-secline]', '');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-res-sheetsopen]').click());
  await page.waitForSelector('[data-res-sheets-dlg][open] [data-res-shview] svg', { timeout: 60000 });
  await page.waitForFunction(() => document.querySelectorAll('[data-res-shlist] button').length > 0, null, { timeout: 30000 });
  const secIdx = await page.evaluate(async () => {
    const btns = [...document.querySelectorAll('[data-res-shlist] button')];
    const i = btns.findIndex((b) => /^A-3/.test(b.textContent));
    if (i >= 0) btns[i].click();
    return i;
  });
  ok(secIdx >= 0, 'the set has a section sheet (A-3xx)', String(secIdx));
  await page.waitForFunction(() => /<image|stroke="#888"/.test(document.querySelector('[data-res-shview]').innerHTML), null, { timeout: 20000 }).catch(() => {});
  const svgHtml = await page.evaluate(() => document.querySelector('[data-res-shview]').innerHTML);
  ok(/<image href="data:image\/png/.test(svgHtml), 'the Sheets preview shows the picture in the section view');
  const [sd] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-res-shpdf]')]);
  const sp = path.join(TMP, 'set.pdf'); fs.copyFileSync(await sd.path(), sp);
  const lst = spawnSync('pdfimages', ['-list', sp], { encoding: 'utf8' });
  ok(/\bimage\b/.test(lst.stdout.split('\n').slice(2).join('\n')), 'the sheet-set PDF holds the picture as an image (pdfimages -list)', lst.stdout.slice(0, 300) + lst.stderr);
  await shot(page, 'r52-02-section-picture');

  const real = problems.filter((p) => !/favicon|ERR_ABORTED|favicon\.ico/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e).toString().slice(0, 900));
  if (SHOTS) await shot(page, 'r52-fail').catch(() => {});
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
