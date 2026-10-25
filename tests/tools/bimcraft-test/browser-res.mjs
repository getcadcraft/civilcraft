#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-res.mjs — BimCraft's residential tools (0.5 part 4, track RC) in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-res.mjs [--shots <dir>] [--only rc1,…]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimres; disabled at the
 * end), so the shared admin-login throttle is never touched. Fails on any console error.
 *   rc3  Build › Stair: an L by two clicks, Properties risers, changed to a U; Build › Railing by three clicks + Enter
 *   rc9  Build › Framing: Frame every wall, studs on the plan, See through / Show framing, a piece's Properties, spacing, the
 *        Lumber schedule and its CSV
 *   rc10 Build › Terrain from a survey CSV (state-plane feet), contours, Building pad by a click, Paving, the ground's
 *        Properties and its LandXML
 *   rc4  three base cabinets from LibraryCraft, Build › Countertop over them, a fourth marks it out of date, Fit in Properties
 *   rc2  Build › Foundation: a crawlspace by a click, the same building picked again, footing width and kind in Properties
 *   rc1  a room of walls, the Roof tool (hip with fascia and soffit), the roof's walls in Properties (one to gable), the
 *        Shed preset, plate height; a roof plane drawn from the Build menu by its corners; Undo; Save as IFC read back
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
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimres'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });

const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const roofs = () => page.evaluate(() => window.bimcraftPlan.state.data.derived.roofs.map((r) => ({ guid: r.guid, parts: r.parts.length, edges: r.edges, plate: Math.round(r.plate), fascia: Math.round(r.fascia), soffit: r.soffit })));
const levelValues = () => page.$$eval('[data-model-level] option', (o) => o.map((x) => x.value));
const saveText = async () => { const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]); return fs.readFileSync(await dl.path(), 'utf8'); };

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Residential test');
  await page.fill('[data-new-levels]', '2');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await waitStatus(/^New building Residential test/);
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  // a 9 × 6 m room
  await page.click('[data-mtool="wall"]');
  await page.selectOption('[data-model-walltype]', 'ext-2x6');
  // Fit again under the Draw bar as the Wall tool left it: its options rows (shape, location line, side; 0.6 round 2) make it
  // taller than at the first fit, and in Split at 1440 px it then covers the top of the plan where y 6000 would be clicked
  await page.click('[data-model-fit]');
  for (const [x, y] of [[0, 0], [9000, 0], [9000, 6000], [0, 6000], [0, 0]]) { await planClick(x, y); }
  await settled();
  ok((await page.evaluate(() => window.bimcraftPlan.state.data.walls.length)) === 4, 'a room of four walls drawn by clicks');

  if (want('rc1')) {
    console.log('== rc1: roofs from the walls, roof planes');
    ok(await page.isVisible('[data-res-tools] > summary'), 'the model bar has the Build menu');
    await page.click('[data-mtool="roof"]');
    ok(await page.isVisible('[data-mopts="roof"] [data-model-rffascia]') && (await page.$$eval('[data-model-rfends] option', (o) => o.map((x) => x.value))).includes('shed'), 'the Roof row offers Shed and "Fascia and soffit"');
    await page.fill('[data-model-rfpitch]', '6/12'); await page.press('[data-model-rfpitch]', 'Enter');
    await page.selectOption('[data-model-rfends]', 'hip');
    const [rx, ry] = await at(4500, 3000);
    await page.mouse.move(rx, ry, { steps: 3 });
    ok(await page.evaluate(() => (window.bimcraftPlan.view.overlay.symbols || []).some((s) => (s.thin || []).length >= 5)), 'the preview shows the eave and the ridge with its four hips');
    await page.mouse.click(rx, ry);
    await settled();
    let R = await roofs();
    ok(R.length === 1 && R[0].parts === 6 && R[0].fascia > 0 && R[0].soffit === true, 'a hip roof: four planes, fascia and soffit (' + R[0]?.parts + ' parts)');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'rc1-01-hip');
    // its level shows it; pick it there and set one wall to a gable end
    const lv = await levelValues();
    await page.selectOption('[data-model-level]', lv[0]);
    await settled();
    await page.click('[data-mtool="select"]');
    await planClick(4500, 3000);
    await page.waitForSelector('[data-mp-rfedges]');
    const rows = await page.$$('[data-mp-rfedgerow]');
    ok(rows.length === 4, 'Properties lists the roof\'s four walls');
    const eastRow = 1;
    await page.selectOption(`[data-mp-rfedgerow="${eastRow}"] [data-mp-rfedge]`, 'gable');
    await settled();
    R = await roofs();
    ok(/=g/.test(R[0].edges) && R[0].parts === 6, 'one wall set to gable end in Properties: stored per wall (' + R[0].edges.split(';').length + ' setting)');
    await page.waitForSelector('[data-mp-rfends]');
    await page.selectOption('[data-mp-rfends]', 'shed');
    await settled();
    R = await roofs();
    ok((R[0].edges.match(/=g/g) || []).length === 3, 'the Shed preset: three gable ends, one pitched side');
    await page.waitForSelector('[data-mp-rfplate]');
    await page.fill('[data-mp-rfplate]', '3300'); await page.press('[data-mp-rfplate]', 'Enter');
    await settled();
    R = await roofs();
    ok(R[0].plate === 3300, 'plate height 3300 typed in Properties');
    await shot(page, 'rc1-02-shed');
    await page.click('[data-act="undo"]');
    await settled();
    ok((await roofs())[0].plate === 0, 'Undo puts the plate back on the walls\' top');
    // a roof plane over a porch, drawn on Level 1 from the Build menu
    await page.keyboard.press('Escape');
    await page.selectOption('[data-model-level]', lv[lv.length - 1]);
    await settled();
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="roofplane"]');
    ok(await page.isVisible('[data-mopts="roofplane"]') && await page.getAttribute('[data-mtool="roofplane"]', 'aria-pressed') === 'true', 'Build › Roof plane: its row (pitch, eave height) shows');
    await page.fill('[data-res-rppitch]', '3/12'); await page.press('[data-res-rppitch]', 'Enter');
    for (const [x, y] of [[2000, 1500], [2000, 4500], [5000, 4500], [5000, 1500]]) await planClick(x, y);
    ok(await page.evaluate(() => window.bimcraftRes.state.plane.pts?.length === 4), 'four corners clicked (the first side is the eave)');
    await planClick(2000, 1500);
    await settled();
    const planes = await page.evaluate(() => window.bimcraftRes.state.planes.map((p) => ({ n: p.points.length, pitch: Math.round(p.pitch * 100) / 100, parts: p.parts.length })));
    ok(planes.length === 1 && planes[0].n === 4 && planes[0].pitch === 14.04 && planes[0].parts === 1, 'a click on the first corner finishes it: one roof plane at 3/12');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'rc1-03-plane');
    const text = await saveText();
    ok(/IFCROOF\([^;]*\.SHED_ROOF\.\)/.test(text) && /IFCROOF\([^;]*'Roof plane'[^;]*\.FREEFORM\.\)/.test(text) && /IFCMEMBER\([^;]*'Fascia'/.test(text) && /'CadCraft_RoofLines'/.test(text), 'Save as IFC: the shed roof, the roof plane, the fascia and the roof\'s line lengths');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="select"]');
    await page.selectOption('[data-model-level]', lv[0]);
    await settled();
    await planClick(3500, 3000);
    await page.waitForSelector('[data-mp-rppitch]');
    await page.keyboard.press('Delete');
    await settled();
    ok((await page.evaluate(() => window.bimcraftRes.state.planes.length)) === 0, 'picked on its level, Delete removes the roof plane');
  }
  if (want('rc2')) {
    console.log('== rc2: foundations');
    await page.keyboard.press('Escape');
    const lv2 = await levelValues();
    await page.selectOption('[data-model-level]', lv2[lv2.length - 1]);
    await settled();
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="foundation"]');
    ok(await page.isVisible('[data-mopts="foundation"] [data-res-fdkind]'), 'Build › Foundation: its kind list shows');
    await page.selectOption('[data-res-fdkind]', 'crawl');
    const [fx, fy] = await at(4500, 3000);
    await page.mouse.move(fx, fy, { steps: 3 });
    ok(await page.evaluate(() => !!window.bimcraftPlan.view.overlay.hud && (window.bimcraftPlan.view.overlay.dashed || []).length >= 8), 'pointing inside the building previews the footing (dashed) and its size');
    await page.mouse.click(fx, fy);
    await settled();
    let F = await page.evaluate(() => window.bimcraftRes.state.founds.map((f) => ({ kind: f.kind, parts: f.parts.length, footW: Math.round(f.prm.footW) })));
    ok(F.length === 1 && F[0].kind === 'crawl' && F[0].parts === 2 && F[0].footW === 457, 'a crawlspace foundation: walls on an 18" footing');
    await page.mouse.click(fx, fy);
    await page.waitForSelector('[data-mp-fdkind]');
    ok((await page.evaluate(() => window.bimcraftRes.state.founds.length)) === 1, 'clicking the same building again picks its foundation (no second one)');
    await page.fill('[data-mp-fdfootw]', '600'); await page.press('[data-mp-fdfootw]', 'Enter');
    await settled();
    F = await page.evaluate(() => window.bimcraftRes.state.founds.map((f) => ({ kind: f.kind, footW: Math.round(f.prm.footW) })));
    ok(F[0].footW === 600, 'footing width 600 typed in Properties');
    await page.waitForSelector('[data-mp-fdkind]');
    await page.selectOption('[data-mp-fdkind]', 'basement');
    await settled();
    F = await page.evaluate(() => window.bimcraftRes.state.founds.map((f) => ({ kind: f.kind, parts: f.parts.length })));
    ok(F[0].kind === 'basement' && F[0].parts === 3, 'changed to a basement in Properties: walls, footing and slab');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'rc2-01-basement');
    const text = await saveText();
    ok(/IFCELEMENTASSEMBLY\([^;]*'Foundation'/.test(text) && /IFCFOOTING\(/.test(text) && /\.BASESLAB\./.test(text), 'Save as IFC: the foundation assembly, its footing and slab');
  }
  if (want('rc4')) {
    console.log('== rc4: cabinets from the residential set, a countertop on them');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="select"]').catch(() => {});
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    const T6 = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].t);
    const yFace = 6000 - T6 / 2, IN = 25.4;
    const placeLib = async (query, x, y) => {
      await page.click('[data-rtab="library"]');
      await page.click('.bc-lib-src:has-text("LibraryCraft")');
      const search = page.locator('.bc-lib-filter input[type="search"], .bc-lib-filter input').first();
      await search.fill(query);
      await search.press('Enter');
      await page.waitForFunction((q) => [...document.querySelectorAll('.bc-lib-card')].some((c) => c.textContent.includes(q)), query, { timeout: 20000 });
      await page.locator('.bc-lib-card', { hasText: query }).first().click();
      await page.waitForSelector('[data-lib-place]', { timeout: 20000 });
      await page.click('[data-lib-place]');
      await page.fill('[data-place-xy]', `${x}, ${y}`);
      await page.press('[data-place-xy]', 'Enter');
      await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
      await page.keyboard.press('Enter');
      await waitStatus(/^Placed /);
      await page.keyboard.press('Escape');
      await settled();
    };
    await placeLib('Base cabinet 24" (B24)', 2000 + 12 * IN, yFace);
    await placeLib('Sink base cabinet 33"', 2000 + 24 * IN + 16.5 * IN, yFace);
    await placeLib('Base cabinet 24" (B24)', 2000 + 57 * IN + 12 * IN, yFace);
    ok((await page.evaluate(() => window.bimcraftRes.state.cabinets.length)) === 3, 'three base cabinets placed from LibraryCraft against the north wall');
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="countertop"]');
    const [cx, cy] = await at(2000 + 40 * IN, yFace - 300);
    await page.mouse.move(cx, cy, { steps: 3 });
    ok(await page.evaluate(() => /3 cabinets/.test(window.bimcraftPlan.view.overlay.hud?.text || '')), 'pointing at the run previews one countertop over its three cabinets');
    await page.mouse.click(cx, cy);
    await settled();
    let C = await page.evaluate(() => window.bimcraftRes.state.counters.map((c) => ({ stale: c.state.stale, n: c.state.run?.cabinets.length })));
    ok(C.length === 1 && C[0].n === 3 && !C[0].stale, 'a countertop over the three cabinets');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="select"]');
    await placeLib('Base cabinet 18" (B18)', 2000 + 81 * IN + 9 * IN, yFace);
    C = await page.evaluate(() => window.bimcraftRes.state.counters.map((c) => ({ stale: c.state.stale, n: c.state.run?.cabinets.length })));
    ok(C[0].stale && C[0].n === 4, 'a fourth cabinet placed beside them: the countertop is marked out of date');
    await page.click('[data-rtab="props"]');
    await page.click('[data-mtool="select"]');
    await planClick(2000 + 40 * IN, yFace - 300);
    await page.waitForSelector('[data-mp-ctfit]:not([disabled])');
    await page.click('[data-mp-ctfit]');
    await settled();
    C = await page.evaluate(() => window.bimcraftRes.state.counters.map((c) => ({ stale: c.state.stale, n: c.state.run?.cabinets.length })));
    ok(!C[0].stale && C[0].n === 4, 'Properties › Fit to the cabinets: it covers all four');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'rc4-01-kitchen');
  }
  if (want('rc3')) {
    console.log('== rc3: stairs and railings');
    await page.keyboard.press('Escape');
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="stair"]');
    ok(await page.isVisible('[data-mopts="stair"] [data-res-stkind]'), 'Build › Stair: kind, turn, width and handrails in its row');
    await page.selectOption('[data-res-stkind]', 'l');
    await page.selectOption('[data-res-stturn]', 'left');
    await planClick(7000, 800);
    const [dx, dy] = await at(7000, 3000);
    await page.mouse.move(dx, dy, { steps: 4 });
    ok(await page.evaluate(() => /risers/.test(window.bimcraftPlan.view.overlay.hud?.text || '')), 'after the first click the stair follows the pointer with its risers and treads');
    await page.mouse.click(dx, dy);
    await settled();
    let S = await page.evaluate(() => window.bimcraftRes.state.stairs.map((s) => ({ kind: s.kind, parts: s.parts.length, n: s.layout?.n })));
    ok(S.length === 1 && S[0].kind === 'l' && S[0].n === 16 && S[0].parts >= 4, 'an L stair: 16 risers for 3000 mm, flights, a landing and handrails');
    await page.keyboard.press('Escape');
    await page.click('[data-mtool="select"]');
    await planClick(7000, 1300);
    await page.waitForSelector('[data-mp-stkind]');
    ok(/16 ×/.test(await page.textContent('[data-mp-strisers]')), 'Properties shows its risers (' + (await page.textContent('[data-mp-strisers]')) + ')');
    await page.selectOption('[data-mp-stkind]', 'u');
    await settled();
    S = await page.evaluate(() => window.bimcraftRes.state.stairs.map((s) => ({ kind: s.kind })));
    ok(S[0].kind === 'u', 'changed to a U in Properties');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, 'rc3-01-stair');
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="railing"]');
    for (const [x, y] of [[1000, 4500], [3000, 4500], [3000, 5500]]) await planClick(x, y);
    await page.keyboard.press('Enter');
    await settled();
    const RL2 = await page.evaluate(() => window.bimcraftRes.state.rails.map((r) => ({ n: r.points.length, kind: r.kind })));
    ok(RL2.length === 1 && RL2[0].n === 3 && RL2[0].kind === 'guard', 'Build › Railing: three clicks and Enter draw a guardrail');
    const text = await saveText();
    ok(/IFCSTAIR\(/.test(text) && /IFCSTAIRFLIGHT\(/.test(text) && /\.GUARDRAIL\./.test(text) && /\.HANDRAIL\./.test(text), 'Save as IFC: the stair, its flights, handrails and the guardrail');
  }
  if (want('rc9')) {
    console.log('== rc9: framing');
    await page.keyboard.press('Escape');
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="framing"]');
    ok(await page.isVisible('[data-mopts="framing"] [data-res-frall]') && (await page.$$eval('[data-res-frsp] option', (o) => o.map((x) => x.textContent))).join() === '400 mm,600 mm', 'Build › Framing: spacing (400 / 600 mm in millimetres), corners, roof framing, blocking, Frame every wall, Show, See through');
    await page.click('[data-res-frall]');
    await settled();
    let F = await page.evaluate(() => window.bimcraftRes.state.frames.map((f) => ({ kind: f.kind, parts: f.parts.length })));
    ok(F.length === 4 && F.every((f) => f.kind === 'wall' && f.parts > 15), 'Frame every wall: four walls framed (' + F.map((f) => f.parts).join(', ') + ' pieces)');
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.some((s2) => s2.key === null && (s2.thin || []).length > 20)), 'the plan shows the studs the cut passes through');
    await page.click('[data-res-frsee]');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(500);
    await shot(page, 'rc9-01-framing');
    const hiddenWalls = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, k = window.bimcraftRes.api.kb(); return window.bimcraftPlan.state.data.walls.filter((w2) => w2.storey === window.bimcraftPlan.state.level).every((w2) => v.vis.hidden.has(k + w2.id)); });
    ok(hiddenWalls, 'See through: the framed walls are hidden in 3D, the framing shows');
    await page.click('[data-res-frshow]');
    const hiddenFr = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, k = window.bimcraftRes.api.kb(); return window.bimcraftRes.state.frames.every((f) => f.parts.every((p2) => v.vis.hidden.has(k + p2))); });
    ok(hiddenFr, 'Show framing off: every framing piece hidden (a layer you can turn off)');
    await page.click('[data-res-frshow]');
    await page.click('[data-res-frsee]');
    // pick a stud as the 3D view would, then the framing's Properties
    await page.evaluate(() => { const f = window.bimcraftRes.state.frames[0]; window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + f.parts[5]]); });
    await page.waitForSelector('[data-mp-frsp]');
    ok(/\d/.test(await page.textContent('[data-mp-frpieces]')) && await page.isVisible('[data-mp-frkeep]'), 'a framing piece picked: its framing in Properties (spacing, corners, pieces, board feet) and "Keep this piece"');
    await page.selectOption('[data-mp-frsp]', '600');
    await settled();
    F = await page.evaluate(() => window.bimcraftRes.state.frames.map((f) => Math.round(f.spacing)));
    ok(F.includes(600), 'its spacing changed to 600 mm in Properties');
    await page.selectOption('[data-msched-kind]', 'lumber');
    await page.waitForTimeout(300);
    const rows = await page.$$eval('[data-msched] tbody tr', (r) => r.length);
    ok(rows >= 2, 'Schedules › Lumber: the cut list by size and length (' + rows + ' rows)');
    const [csv] = await Promise.all([page.waitForEvent('download'), page.click('[data-msched-csv]')]);
    const csvText = fs.readFileSync(await csv.path(), 'utf8');
    ok(/38 × 140/.test(csvText) && /\d+\.\d/.test(csvText), 'its CSV: sizes, lengths, pieces, board feet');
    await page.selectOption('[data-msched-kind]', 'doors');
  }
  if (want('rc10')) {
    console.log('== rc10: terrain, pad, paving');
    await page.keyboard.press('Escape');
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="terrain"]');
    ok(await page.isVisible('[data-mopts="terrain"] [data-res-trmake]'), 'Build › Terrain: open a survey file, or spot elevations');
    // a survey file in feet, far-off state-plane coordinates, falling 1:10 to the west
    const rows = ['P,N,E,Z,D'];
    let n2 = 1;
    for (let x = -60; x <= 60; x += 10) for (let y = -50; y <= 50; y += 10) rows.push([n2++, 2000000 + y, 6000000 + x, 500 + x / 10, 'GND'].join(','));
    const file = path.join(process.env.TMPDIR || '/tmp', 'bim-res-survey.csv');
    fs.writeFileSync(file, rows.join('\n'));
    await page.selectOption('[data-res-trunit]', 'ft');
    await page.setInputFiles('[data-res-trfile]', file);
    await settled();
    await page.waitForFunction(() => !!window.bimcraftRes.state.terrain, null, { timeout: 30000 });
    let T = await page.evaluate(() => { const t2 = window.bimcraftRes.state.terrain; return { n: t2.pts.length, off: t2.offset, datum: t2.datum, src: t2.source }; });
    ok(T.n === rows.length - 1 && Math.abs(T.off[0]) > 1e6 && T.src === 'points', 'the survey read: ' + T.n + ' points, moved from state-plane coordinates onto the house, its datum set from the ground there');
    await page.waitForFunction(() => (window.bimcraftRes.state.tr.contours || []).length > 3, null, { timeout: 30000 }).catch(() => {});
    ok(await page.evaluate(() => (window.bimcraftRes.state.tr.contours || []).length > 3), 'contours on the plan of the ground level');
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="pad"]');
    await planClick(4500, 3000);
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.pads.length === 1, null, { timeout: 30000 });
    T = await page.evaluate(() => ({ cut: window.bimcraftRes.state.terrain.cut, fill: window.bimcraftRes.state.terrain.fill }));
    ok(T.cut > 0.5 && T.fill > 0.5, 'Build › Building pad: a click inside the house cuts its pad in (' + T.cut.toFixed(1) + ' m³ cut, ' + T.fill.toFixed(1) + ' m³ fill)');
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="paving"]');
    await page.selectOption('[data-res-hdkind]', 'driveway');
    // zoom the plan out so the drive beside the house is in view
    { const [cx, cy] = await at(4500, 3000); await page.mouse.move(cx, cy); for (let k = 0; k < 3; k++) { await page.mouse.wheel(0, 240); await page.waitForTimeout(80); } }
    for (const [x, y] of [[9800, 1500], [11000, 1500], [11000, 4500], [9800, 4500]]) await planClick(x, y);
    await page.keyboard.press('Enter');
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.hards.length === 1, null, { timeout: 30000 });
    ok((await page.evaluate(() => window.bimcraftRes.state.hards[0].kind)) === 'driveway', 'Build › Paving: a driveway by its corners, draped on the ground');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
    await page.waitForTimeout(600);
    await shot(page, 'rc10-01-terrain');
    await page.evaluate(() => window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + window.bimcraftRes.state.terrain.id]));
    await page.waitForSelector('[data-mp-trcut]');
    ok(/m³/.test(await page.textContent('[data-mp-trcut]')), 'the ground picked: its source, contour interval, cut and fill in Properties');
    const [xml] = await Promise.all([page.waitForEvent('download'), page.click('[data-mp-trxml]')]);
    const xt = fs.readFileSync(await xml.path(), 'utf8');
    ok(/<Surface name="Existing ground">/.test(xt) && /<Surface name="Finished grade">/.test(xt), 'LandXML for CivilCraft: the existing ground and the finished grade');
  }
  if (want('rc5')) {
    console.log('== rc5: section lines and the sheets');
    await page.keyboard.press('Escape');
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="section"]');
    await planClick(4500, -1500);
    await planClick(4500, 7500);
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.secs.length === 1, null, { timeout: 30000 });
    let SL = await page.evaluate(() => window.bimcraftRes.state.secs.map((x) => ({ name: x.name, look: x.look })));
    ok(SL[0].name === 'A' && SL[0].look === 'left', 'Build › Section: two clicks draw section line A (looking left of the line)');
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.rooms.some((r) => r.label?.[0] === 'A')), 'the plan shows its heads, labelled A');
    await page.evaluate(() => window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + window.bimcraftRes.state.secs[0].id]));
    await page.waitForSelector('[data-mp-secflip]');
    await page.click('[data-mp-secflip]');
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.secs[0]?.look === 'right', null, { timeout: 30000 });
    ok(true, 'picked: Properties flips the way it looks');
    await page.click('[data-res-sheetsopen]');
    await page.waitForSelector('[data-res-shlist] button', { timeout: 120000 });
    const nums = await page.$$eval('[data-res-shlist] button strong', (b) => b.map((x) => x.textContent));
    ok(nums.includes('A-101') && nums.includes('A-201') && nums.includes('A-202') && nums.includes('A-301'), 'Sheets: made from the model — ' + nums.join(', '));
    ok(await page.evaluate(() => { const g = document.querySelector('[data-res-shview] svg'); return !!g && g.querySelectorAll('path').length >= 4 && [...g.querySelectorAll('text')].some((x) => /plan$/.test(x.textContent)); }), 'the first sheet previewed (the level\'s plan: walls, title)');
    await shot(page, 'rc5-00-plan');
    console.log('  (views: ' + JSON.stringify(await page.evaluate(() => window.bimcraftRes.state.sheets.map((s2) => s2.views.map((v) => [v.scale, v.bb && Math.round(v.bb.x1 - v.bb.x0), v.bb && Math.round(v.bb.y1 - v.bb.y0)])))) + ')');
    await page.click('[data-res-shlist] button[data-sheet="1"]');
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-res-shview] svg text')].some((x) => /elevation/.test(x.textContent))), 'a click shows the elevations sheet');
    await shot(page, 'rc5-01-sheets');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-res-shpdf]')]);
    const pdfPath = await dl.path();
    const head = fs.readFileSync(pdfPath).subarray(0, 8).toString('latin1');
    let pages = 0; try { pages = Number(execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)[1]); } catch (e) { pages = -1; }
    ok(head === '%PDF-1.4' && (pages === nums.length || pages === -1) && /drawing set\.pdf$/.test(dl.suggestedFilename()), 'Download the set as PDF: ' + dl.suggestedFilename() + ', ' + pages + ' pages');
    await page.selectOption('[data-res-shpaper]', 'letter');
    await page.waitForFunction(() => /279\.4/.test(document.querySelector('[data-res-shview] svg')?.getAttribute('viewBox') || ''), null, { timeout: 60000 });
    ok(true, 'paper changed to Letter: the set drawn again on it');
    await page.selectOption('[data-res-shpaper]', 'tabloid');
    await page.click('[data-res-shclose]');
  }
  if (want('rc6')) {
    console.log('== rc6: electrical');
    await page.keyboard.press('Escape');
    const lvs = await levelValues();
    await page.selectOption('[data-model-level]', lvs[lvs.length - 1]);
    await settled();
    await page.click('[data-rtab="props"]').catch(() => {});
    await page.click('[data-res-tools] > summary');
    await page.click('[data-mtool="electrical"]');
    const kinds = await page.$$eval('[data-res-elkind] option', (o) => o.map((x) => x.value));
    // Every symbol of the add-on's generated copy (elec-sync.mjs → res-elec-symbols.js): 16 until 0.7, 33 since the add-on gained the
    // detectors group and more devices (mep-07; synced in the 0.7 closing, docs/results/0.7/2026-10-23-closing-fixes.md row 009).
    const { SYMBOLS: ELEC } = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/res-elec-symbols.js'));
    const elecKeys = ELEC.map((x) => x.key);
    ok(kinds.length === elecKeys.length && elecKeys.every((k) => kinds.includes(k)) && kinds.includes('socket.double') && kinds.includes('board'), 'Build › Electrical: the Electrical add-on\'s ' + elecKeys.length + ' devices in groups (' + kinds.length + ' offered), a circuit, a mounting height');
    await page.selectOption('[data-res-elkind]', 'socket.double');
    await page.fill('[data-res-elcircuit]', '1'); await page.press('[data-res-elcircuit]', 'Tab');
    await planClick(2000, 350);
    await settled();
    await page.selectOption('[data-res-elkind]', 'switch');
    await page.fill('[data-res-elcircuit]', '2'); await page.press('[data-res-elcircuit]', 'Tab');
    await planClick(8600, 1000);
    await settled();
    await page.selectOption('[data-res-elkind]', 'luminaire');
    await planClick(4500, 3000);
    await settled();
    await page.selectOption('[data-res-elkind]', 'downlight');
    await planClick(2000, 4000);
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.devs.length === 4, null, { timeout: 30000 });
    let D = await page.evaluate(() => window.bimcraftRes.state.devs.map((d) => ({ tag: d.tag, kind: d.kind, wall: !!d.wall, circuit: d.circuit })));
    ok(D.map((d) => d.tag).join() === 'L1,L2,R1,S1' && D.find((d) => d.tag === 'R1').wall && D.find((d) => d.tag === 'S1').wall && !D.find((d) => d.tag === 'L1').wall, 'clicks place an outlet and a switch on the walls, two lights on the ceiling: ' + D.map((d) => d.tag).join(', '));
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.filter((s2) => (s2.arcs || []).length).length >= 3), 'their symbols on the plan');
    await shot(page, 'rc6-01-plan');
    // the switch: link both lights from its Properties
    await page.evaluate(() => { const d = window.bimcraftRes.state.devs.find((x) => x.tag === 'S1'); window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + d.id]); });
    await page.waitForSelector('[data-mp-ellink]');
    await page.click('[data-mp-ellink]');
    await planClick(4500, 3000);
    await settled();
    await planClick(2000, 4000);
    await settled();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.bimcraftRes.state.devs.find((x) => x.tag === 'S1')?.controls.length === 2, null, { timeout: 30000 });
    ok(true, 'Link lights: two clicks link both lights to S1');
    await page.waitForSelector('[data-mp-elcontrols]');
    ok(/L1/.test(await page.textContent('[data-mp-elcontrols]')) && /L2/.test(await page.textContent('[data-mp-elcontrols]')), 'its Properties list L1, L2');
    ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.filter((s2) => s2.key === null && (s2.dashed || []).length === 16).length === 2), 'two switch legs on the plan');
    await page.fill('[data-mp-elcircuit]', '3'); await page.press('[data-mp-elcircuit]', 'Enter');
    await settled();
    ok((await page.evaluate(() => window.bimcraftRes.state.devs.find((x) => x.tag === 'S1').circuit)) === '3', 'its circuit changed in Properties');
    await page.selectOption('[data-msched-kind]', 'devices');
    await page.waitForTimeout(300);
    const rows = await page.$$eval('[data-msched] tbody tr', (r) => r.map((x) => x.textContent));
    ok(rows.length === 4 && rows.some((r) => /S1.*L1, L2/.test(r)), 'Schedules › Electrical devices: four rows, S1 switching L1, L2');
    await page.selectOption('[data-msched-kind]', 'circuits');
    await page.waitForTimeout(300);
    ok((await page.$$eval('[data-msched] tbody tr', (r) => r.length)) >= 2, 'Schedules › Circuits: loads and amps per circuit');
    await page.selectOption('[data-msched-kind]', 'doors');
    await page.evaluate(() => { const d = window.bimcraftRes.state.devs.find((x) => x.tag === 'L2'); window.bimcraftRes.api.host.select([window.bimcraftRes.api.kb() + d.id]); });
    await page.waitForSelector('[data-mp-elby]');
    await page.keyboard.press('Delete');
    await settled();
    await page.waitForFunction(() => window.bimcraftRes.state.devs.length === 3, null, { timeout: 30000 });
    ok((await page.evaluate(() => window.bimcraftRes.state.devs.find((x) => x.tag === 'S1').controls.length)) === 1, 'L2 deleted: S1 now switches L1 only');
    const txt = await saveText();
    ok(/IFCOUTLET\(/.test(txt) && /IFCSWITCHINGDEVICE\(/.test(txt) && /IFCLIGHTFIXTURE\(/.test(txt) && /'CadCraft_Electrical'/.test(txt), 'Save as IFC: the outlet, the switch, the light and their electrical data');
  }
  if (want('rc8')) {
    console.log('== rc8: the takeoff to TakeoffCraft');
    await page.keyboard.press('Escape');
    const url = await page.getAttribute('[data-res-takeoff]', 'data-handoff-url');
    ok(url === '/lab/takeoffcraft', 'the model bar\'s Takeoff button hands off to ' + url + ' (TakeoffCraft is open in the lab and takes a hand-off)');
    const [tc] = await Promise.all([ctx.waitForEvent('page', { timeout: 60000 }), page.click('[data-res-takeoff]')]);
    tc.on('pageerror', (e) => problems.push('takeoffcraft: ' + e.message));
    tc.on('console', (m) => { if (m.type() === 'error') problems.push('takeoffcraft: ' + m.text()); });
    await tc.waitForLoadState('networkidle');
    await tc.waitForSelector('.tc-dialog-foot button[data-key="ok"]', { timeout: 60000 });
    const asks = await tc.textContent('.tc-dialog-foot').catch(() => '');
    await tc.click('.tc-dialog-foot button[data-key="ok"]');
    await tc.waitForFunction(() => (window.takeoffcraft?.model?.state?.items?.length || 0) > 0, null, { timeout: 60000 });
    const T = await tc.evaluate(() => { const st = window.takeoffcraft.model.state, rows = window.takeoffcraft.quantities(); const walls = rows.filter((r) => / walls, /.test(r.name)); const est = window.takeoffcraft.estimate?.(); return { items: st.items.length, marks: st.marks.length, files: st.files.length, wallFt: walls.reduce((s2, r) => s2 + r.qty / (r.unit === 'm' ? 0.3048 : 1), 0), wallUnit: walls[0]?.unit, unscaled: est?.unscaled ?? 0, comps: st.items.reduce((s2, x) => s2 + x.components.length, 0) }; });
    const expectFt = await page.evaluate(() => window.bimcraftPlan.state.data.walls.reduce((s, x) => s + x.len, 0) / 304.8);
    ok(/Open/i.test(asks) && T.files === 1 && T.items >= 2, 'TakeoffCraft opens the PDF and finds the takeoff inside: ' + T.items + ' items, ' + T.marks + ' marks');
    ok(Math.abs(T.wallFt - expectFt) < 0.1 && T.unscaled === 0, 'its walls measure ' + T.wallFt.toFixed(2) + ' ft (in ' + T.wallUnit + ', a metric model) on the scaled plan = the model\'s ' + expectFt.toFixed(2) + ' ft; nothing unscaled');
    ok(T.comps >= 5, 'the trade packs\' assemblies on the items (' + T.comps + ' components)');
    await shot(tc, 'rc8-01-takeoffcraft');
    await tc.close();
  }
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error');
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join('\n  '));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimres']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
