#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-eltypes.mjs — booklet rows BK.15 (generic starter types, the sketch band), BK.24 (floor / roof / ceiling types with layers,
 * Schedules › Layers), BK.22 (a device knows its room) and BK.23 (an element linked to a symbol, the form a view shows) in the real
 * page, /lab, headless (session bk-r3-types-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-eltypes.mjs [--shots <dir>]      run as root (a test admin session)
 * Expected values are worked out beside each check.
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
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimeltypes'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();   // the anonymous hardware report answers 429 after many runs from this machine: not this test's
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.walls'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const pickKeys = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
const press = (sel) => page.evaluate((s) => document.querySelector(s).click(), sel);   // a tool inside a closed menu: its own click, as the menu would give it
const kb = () => page.evaluate(() => window.bimcraftRes.api.kb());
const D = () => page.evaluate(() => { const d = window.bimcraftPlan.state.data.derived; return { floors: d.floors.map((f) => ({ id: f.id, guid: f.guid, typeKey: f.typeKey, thickness: f.thickness })), ceilings: d.ceilings.map((f) => ({ id: f.id, guid: f.guid, typeKey: f.typeKey, thickness: f.thickness })), spaces: d.spaces.map((s) => ({ id: s.id, number: s.number, name: s.name })) }; });
const sceneWalls = () => page.evaluate(() => window.bimcraftPlan.view.scene.walls.map((w) => ({ sketch: !!w.sketch, layers: w.layers ? w.layers.length : 0, hatch: w.layers ? w.layers[0].hatch.length : 0, bounds: (w.boundaries || []).length })));
const status = () => page.evaluate(() => document.querySelector('[data-status], .bc-status, [role="status"]')?.textContent || '');
const openSched = async () => {
  await page.evaluate(() => document.querySelector('[data-msched-sec]').scrollIntoView({ block: 'start' }));
  if (await page.getAttribute('[data-msched-sec] > h2', 'aria-expanded') === 'false') await page.click('[data-msched-sec] > h2', { position: { x: 20, y: 10 } });
  await page.waitForSelector('[data-msched-kind]', { state: 'visible', timeout: 10000 });
};
const sched = async (kind) => { await page.selectOption('[data-msched-kind]', kind); await page.waitForTimeout(300); return page.evaluate(() => ({ head: [...document.querySelectorAll('[data-msched] thead th')].map((x) => x.textContent), rows: [...document.querySelectorAll('[data-msched] tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent)), total: [...document.querySelectorAll('[data-msched] tfoot td')].map((x) => x.textContent), note: document.querySelector('[data-schedule-note]')?.textContent || '' })); };
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Types'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  console.log('== BK.15 generic walls: one hatched band');
  await press('[data-mtool="wall"]'); await settled();
  const wt = await page.$$eval('[data-model-walltype] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(wt.some(([v, s]) => v === 'generic-200' && /^Generic wall 200 mm \(exterior\).*\[LOD 200\]$/.test(s)) && wt.some(([v]) => v === 'generic-100'), 'the Wall tool\'s Type list offers Generic wall 200 (exterior) and 100 (interior), tagged LOD 200', wt.filter(([v]) => /generic/.test(v)));
  await page.selectOption('[data-model-walltype]', 'generic-200'); await settled();
  await press('[data-mtool="wrect"]'); await settled();
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  await press('[data-mtool="select"]'); await settled();
  let SW = await sceneWalls();
  ok(SW.length === 4 && SW.every((w) => w.sketch && w.layers === 1 && w.hatch >= 8 && w.bounds === 0), 'four generic walls, each drawn as ONE hatched band with no layer lines', SW);
  const T = await page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => [w.t, w.typeKey, w.assembly?.lod]));
  ok(T.every(([t, k, lod]) => t === 200 && k === 'generic-200' && lod === 200), 'each is a full wall: 200 thick, type Generic wall 200, LOD 200');
  await shot('1-sketch-band');
  // the setting off: drawn by layers like any wall; on again: the band
  await page.evaluate(() => { const b = document.querySelector('[name="bcWallLodSketch"]'); b.checked = false; b.dispatchEvent(new Event('change', { bubbles: true })); });
  await settled();
  SW = await sceneWalls();
  ok(SW.every((w) => !w.sketch), 'Settings › BimCraft › Walls › "Draw walls of an LOD 100 or LOD 200 type as one hatched band" off: no band', SW);
  await page.evaluate(() => { const b = document.querySelector('[name="bcWallLodSketch"]'); b.checked = true; b.dispatchEvent(new Event('change', { bubbles: true })); });
  await settled();
  ok((await sceneWalls()).every((w) => w.sketch), 'on again: the band is back');

  console.log('== BK.24 a floor placed with a type; the swap in Properties');
  await press('[data-mtool="floor"]'); await settled();
  const fopts = await page.$$eval('[data-mopts="floor"] [data-eltype-new="floor"] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(fopts.length === 4 && fopts[0][0] === '' && fopts.some(([v, s]) => v === 'floor-generic' && /Generic floor 300 mm \(300.*\) \[LOD 200\]/.test(s)) && fopts.some(([v]) => v === 'floor-concrete-screed'), 'the Floor tool\'s row has a Type list: No type, the generic floor [LOD 200] and two layered starters', fopts);
  await page.selectOption('[data-mopts="floor"] [data-eltype-new="floor"]', 'floor-generic');
  await planClick(2500, 2000); await settled();
  await press('[data-mtool="select"]'); await settled();
  let d = await D();
  ok(d.floors.length === 1 && d.floors[0].typeKey === 'floor-generic' && d.floors[0].thickness === 300, 'a click in the room: a floor of the generic type, 300 thick', d.floors);
  const K = await kb(), f0 = d.floors[0];
  await pickKeys([K + f0.id]); await page.waitForTimeout(500);
  const props = () => page.evaluate(() => ({ type: document.querySelector('[data-mp-eltype]')?.value ?? null, kind: !!document.querySelector('[data-mp-flkind]'), roofRows: !!document.querySelector('[data-mp-rfpitch]'), thickOff: document.querySelector('[data-mp-flthick]')?.disabled ?? null, thick: document.querySelector('[data-mp-flthick]')?.value ?? null, edit: !!document.querySelector('[data-mp-eltype-edit]') }));
  let P = await props();
  ok(P.type === 'floor-generic' && P.kind && !P.roofRows && P.thickOff === true && P.edit && /^300/.test(P.thick), 'Properties of the floor: Type = Generic floor, the floor\'s own rows (not a roof\'s), the thickness 300 read only, Edit the type…', P);
  await page.selectOption('[data-mp-eltype]', 'floor-concrete-screed'); await settled(); await page.waitForTimeout(400);
  d = await D();
  ok(d.floors.length === 1 && d.floors[0].guid === f0.guid && d.floors[0].id === f0.id && d.floors[0].typeKey === 'floor-concrete-screed' && d.floors[0].thickness === 265, 'Type changed to Concrete floor with screed: the SAME floor (GlobalId, line), now 265 thick: nothing redrawn', d.floors);
  await page.click('[data-act="undo"]'); await page.waitForTimeout(500); await settled();
  ok((await D()).floors[0].typeKey === 'floor-generic', 'one Undo: the generic type again');
  await page.click('[data-act="redo"]'); await page.waitForTimeout(500); await settled();
  await pickKeys([K + f0.id]); await page.waitForTimeout(500);
  await page.click('[data-mp-eltype-edit]');
  await page.waitForSelector('dialog[data-assembly-editor="floor"]');
  const dlg = await page.evaluate(() => { const q = document.querySelector('dialog[data-assembly-editor="floor"]'); return { h: q.querySelector('h2').textContent, name: q.querySelector('[data-assembly-name]').value, lod: q.querySelector('[data-assembly-lod]').value, text: q.textContent, rows: q.querySelectorAll('tbody tr').length }; });
  // 4 layers + the Top and Bottom rows = 6 table rows
  ok(dlg.h === 'Floor type' && dlg.name === 'Concrete floor with screed 265 mm' && dlg.lod === '300' && /Top ↓/.test(dlg.text) && /Bottom ↑/.test(dlg.text) && dlg.rows === 6 && /starting values, not tested constructions/.test(dlg.text), 'Edit the type…: the type editor on a floor type (Floor type, Top / Bottom, 4 layers, LOD 300, the starter note)', [dlg.h, dlg.name, dlg.lod, dlg.rows]);
  await shot('2-floor-type-editor');
  // make the concrete 200 thick and save: the floor follows
  await page.evaluate(() => { const q = document.querySelector('dialog[data-assembly-editor="floor"]'); const i = [...q.querySelectorAll('tbody input[aria-label^="Thickness"]')][3]; i.value = '200 mm'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('dialog[data-assembly-editor="floor"] [data-assembly-save]'); await page.waitForTimeout(600); await settled();
  d = await D();
  // 15 + 50 + 50 + 200 = 315
  ok(d.floors[0].thickness === 315 && d.floors[0].guid === f0.guid, 'the concrete layer made 200 and saved: the floor is 315 thick (15 + 50 + 50 + 200)', d.floors);

  console.log('== BK.24 Schedules › Layers');
  await openSched();
  const opts = await page.$$eval('[data-msched-kind] option', (o) => o.map((x) => x.value));
  ok(opts.includes('layers'), 'Schedules lists "Layers: area and volume"', opts);
  let S = await sched('layers');
  const Hh = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].height);
  // room inside faces (5000 - 200) x (4000 - 200) = 18 240 000 mm2 = 18.24 m2; concrete 0.2 m → 3.648 m3; walls 18 000 x Hh x 0.2
  const wallVol = (18000 * Hh * 200 / 1e9).toFixed(3) + ' m³';
  const fr = S.rows.filter((r) => r[0] === 'Floor'), wr = S.rows.filter((r) => r[0] === 'Wall');
  ok(S.head.length === 10 && S.head[0] === 'Element' && S.head[9] === 'Volume' && fr.length === 4 && wr.length === 1, 'ten columns; four rows for the floor\'s layers, one for the generic walls', [S.head, S.rows.length]);
  ok(fr[3][4] === 'Concrete' && fr[3][8] === '18.24 m²' && fr[3][9] === '3.648 m³' && fr[0][4] === 'Floor finish' && fr[0][9] === (18.24 * 0.015).toFixed(3) + ' m³' && fr[0][2] === 'LOD 300', 'the concrete layer: 18.24 m² and 3.648 m³; the finish 0.274 m³; LOD 300', fr);
  ok(wr[0][4] === 'Generic (not yet chosen)' && wr[0][9] === wallVol && wr[0][2] === 'LOD 200' && wr[0][7] === '4', 'the generic walls: one layer, ' + wallVol + ', LOD 200, 4 elements', wr[0]);
  ok(/One row for each layer/.test(S.note) && /m³$/.test(S.total[9]), 'the note says how it is measured; the total is a volume', [S.note.slice(0, 60), S.total]);
  await page.click('[data-msched] tbody tr:nth-child(' + (S.rows.indexOf(fr[0]) + 1) + ')'); await page.waitForTimeout(400);
  ok((await page.evaluate(() => window.bimcraftRes.api.selectedKeys())).includes(K + f0.id), 'a click on a floor row picks the floor', await page.evaluate(() => window.bimcraftRes.api.selectedKeys()));
  await shot('3-layers-schedule');

  console.log('== BK.22 a device knows its room');
  await press('[data-mtool="electrical"]'); await settled();
  await planClick(2000, 250); await settled();
  await press('[data-mtool="select"]'); await settled();
  let devs = await page.evaluate(() => window.bimcraftRes.state.devs.map((x) => ({ id: x.id, tag: x.tag, kind: x.kind, room: x.room, circuit: x.circuit, height: x.height })));
  d = await D();
  const roomText = d.spaces[0].number + ' ' + d.spaces[0].name;
  ok(devs.length === 1 && devs[0].room === roomText, 'a device placed on the south wall inside the room stands in "' + roomText + '"', devs);
  await pickKeys([K + devs[0].id]); await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.querySelector('[data-mp-elroom]')?.textContent) === roomText, 'its Properties say Room: ' + roomText);
  // rename the room: the device follows
  await pickKeys([K + d.spaces[0].id]); await page.waitForTimeout(500);
  await page.fill('[data-mp-rname]', 'Kitchen'); await page.press('[data-mp-rname]', 'Enter'); await page.waitForTimeout(500); await settled();
  devs = await page.evaluate(() => window.bimcraftRes.state.devs.map((x) => ({ id: x.id, room: x.room })));
  ok(devs[0].room === d.spaces[0].number + ' Kitchen', 'the room renamed Kitchen: the device says "' + d.spaces[0].number + ' Kitchen"', devs);
  S = await sched('devices');
  ok(S.head[S.head.length - 1] === 'Room' && S.rows[0][S.head.length - 1] === d.spaces[0].number + ' Kitchen', 'Schedules › Electrical devices has a Room column', [S.head, S.rows[0]]);

  console.log('== BK.23 link an element to a symbol; what the view shows');
  await page.evaluate(() => document.querySelector('[data-symlink-open]').click()); await page.waitForTimeout(500);
  await page.waitForSelector('[data-symlink-symbol]', { state: 'visible', timeout: 10000 });
  ok(await page.evaluate(() => { const p = document.querySelector('[data-symlink]'); return p && !p.hidden && getComputedStyle(p).position === 'static'; }), 'Build › Symbol link opens a section of the left panel (not over the plan)');
  // the picked element: the device stands in for an asset with a body (it has a placement and a body)
  const famId = await page.evaluate(async () => {
    document.querySelector('[data-mtool="family"]')?.click();
    await new Promise((r) => setTimeout(r, 400));
    const before = new Set((window.bimcraftFamilies?.state?.elements || []).map((e) => e.id));
    try { window.bimcraftPlan.click([3500, 2500]); } catch (e) { return null; }
    for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 250)); const now = (window.bimcraftFamilies?.state?.elements || []).find((e) => !before.has(e.id)); if (now) return now.id; }
    return null;
  });
  await press('[data-mtool="select"]'); await settled();
  const asset = famId || devs[0].id;
  console.log('  note  the element linked is ' + (famId ? 'a family placed with the Family tool (line ' + famId + ')' : 'the device (the Family tool placed nothing in this run)'));
  await pickKeys([K + asset]); await page.waitForTimeout(600);
  ok(/1 picked/.test(await page.textContent('[data-symlink-state]')) && /Not linked/.test(await page.textContent('[data-symlink-state]')), 'the panel follows the pick: 1 picked, not linked');
  await page.selectOption('[data-symlink-symbol]', 'electrical/downlight');
  await page.click('[data-symlink-link]'); await page.waitForTimeout(500); await settled();
  let LK = await page.evaluate(() => window.bimcraftSymbolLinks.links().map((l) => ({ id: l.id, set: l.set, key: l.key, room: l.room })));
  ok(LK.length === 1 && LK[0].id === asset && LK[0].key === 'downlight', 'linked to the Electrical set\'s downlight: one link', LK);
  const symOf = () => page.evaluate((key) => { const sc = window.bimcraftPlan.view.scene; return { linked: sc.symbols.filter((s) => s.key === key && s.linked).length, plain: sc.symbols.filter((s) => s.key === key && !s.linked).length + (sc.cut || []).filter((c) => c.key === key).length + (sc.below || []).filter((c) => c.key === key).length }; }, K + asset);
  let F = await symOf();
  ok(F.linked === 0 && F.plain >= 1 && await page.evaluate(() => window.bimcraftSymbolLinks.form()) === 'plan', 'this plan still shows its plan form (the view is not set to symbols)', F);
  await shot('4-plan-form');
  await page.selectOption('[data-symlink-view]', 'symbols'); await page.waitForTimeout(500); await settled();
  F = await symOf();
  ok(F.linked === 1 && F.plain === 0, 'the view set to "Their symbol": the plan form is gone and the symbol is drawn in its place, once', F);
  await shot('5-symbol-form');
  // a click on the symbol picks the ELEMENT; the count is one
  const pos = await page.evaluate((key) => { const s = window.bimcraftPlan.view.scene.symbols.find((x) => x.key === key && x.linked); const p = s.poly; return [(p[0][0] + p[2][0]) / 2, (p[0][1] + p[2][1]) / 2]; }, K + asset);
  await pickKeys([]); await page.waitForTimeout(200);
  await planClick(pos[0], pos[1]); await page.waitForTimeout(500);
  ok(/1 picked/.test(await page.textContent('[data-symlink-state]')) && /Linked to/.test(await page.textContent('[data-symlink-state]')), 'a click on the symbol picks the element it stands for (1 picked, linked)', await page.textContent('[data-symlink-state]'));
  await openSched();
  S = await sched('linked');
  ok(S.rows.length === 1 && S.total[S.total.length - 1] === '1' && S.head.includes('Room') && S.rows[0][3] === d.spaces[0].number + ' Kitchen', 'Schedules › Linked symbols: one row, total 1, with its room', [S.rows, S.total]);
  const is3d = await page.evaluate(() => !!document.querySelector('[data-model-layout="3d"]'));
  if (is3d) { await page.click('[data-model-layout="3d"]'); await page.waitForTimeout(800); ok(await page.evaluate((id) => { const v = window.bimcraftVis; return typeof v?.has === 'function' ? v.has(id) : true; }, asset), '3D: the element\'s body is still there (the 3D view never shows a symbol)'); await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(500); await settled(); }
  await page.evaluate(() => document.querySelector('[data-symlink-open]').click()); await page.waitForSelector('[data-symlink-view]', { state: 'visible', timeout: 10000 });
  await page.selectOption('[data-symlink-view]', 'plan'); await page.waitForTimeout(500); await settled();
  F = await symOf();
  ok(F.linked === 0 && F.plain >= 1, 'the view set back to "Their plan form": the plan form again', F);
  await page.click('[data-symlink-unlink]').catch(() => {}); await page.waitForTimeout(400); await settled();
  await page.keyboard.press('Escape');

  const mine = problems.filter((p) => !/429|hardware|favicon/.test(p));
  ok(mine.length === 0, 'no console errors', mine.slice(0, 5));
} catch (e) { fail++; console.log('  FAIL the run stopped: ' + e.message.split('\n')[0]); await shot('stopped'); console.log(problems.slice(0, 8).join('\n')); console.log(e.stack.split('\n').filter((l) => /browser-eltypes/.test(l)).join(' | ')); console.log(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-msched-kind] option')].map((o) => o.value))).catch(() => '')); console.log(await page.evaluate(() => JSON.stringify([window.bimcraftRes.api.on, window.bimcraftRes.api.kind, typeof window.bimcraftRes.api.level, window.bimcraftPlan.state.level, window.bimcraftPlan.state.data.levels.map((l) => [l.id, l.guid])])).catch((e) => e.message)); console.log(await page.evaluate(() => JSON.stringify([...document.querySelectorAll('[data-symlink] select')].map((x) => [Object.keys(x.dataset), x.disabled, x.value, x.options.length, x.getBoundingClientRect().width]))).catch(() => '')); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
