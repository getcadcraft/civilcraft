#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tools-a.mjs — the real /lab/bimcraft page, headless (session bk-tools-a-10): in the "Ribbon and project browser" layout each
 * of the ten ribbon buttons that were planned (Room, Room Separator, Tag Room, Area, Area Boundary, Tag Area, Shaft, Wall Opening,
 * Vertical Opening, Model Group) is clicked, the thing is drawn on the plan, and it is undone. Then the same ten are checked in the
 * "Auto-revise" layout, and the Rooms menu in the classic layout.
 *   node tools/bimcraft-test/browser-tools-a.mjs [--shots <dir>]        run as root (a test staff session; one browser)
 */
import fs from 'node:fs';
import path from 'node:path';
import { openLab } from '../shell-test/lab-page.mjs';

const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const near = (a, b, e = 1) => Math.abs(a - b) <= e;
const TEN = ['room', 'roomseparator', 'tagroom', 'area', 'areaboundary', 'tagarea', 'shaft', 'wallopening', 'vertical', 'modelgroup'];

const lab = await openLab('bktoolsa');
try {
  // ============================================================================================ the docked ribbon layout
  console.log('== "Ribbon and project browser" layout: the ten buttons');
  let { ctx, page, errors } = await lab.page('bimcraft', { layout: 'docked', viewport: { width: 1600, height: 1000 }, storage: { 'bimcraft.model.units': 'mm' } });
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) problems.push(m.text().slice(0, 200)); });
  const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 }).then(() => page.waitForTimeout(150));
  const at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); await page.waitForTimeout(60); };
  const ribbon = async (id) => {
    // a picked wall brings up its own tab: go back to Architecture, where these tools are
    if (!(await page.$('.ws-ribbon [data-ws-command="' + id + '"]'))) { await page.evaluate(() => [...document.querySelectorAll('[data-ws-tab]')].find((b) => b.dataset.wsTab === 'architecture')?.click()); await page.waitForTimeout(300); }
    await page.evaluate((id) => { const b = document.querySelector('.ws-ribbon [data-ws-command="' + id + '"]'); b.scrollIntoView({ block: 'nearest' }); b.click(); }, id); await page.waitForTimeout(350); await settled();
  };
  const tool = () => page.evaluate(() => window.bimcraftPlan.state.tool);
  const undo = async () => { await page.evaluate(() => document.querySelector('[data-ws-command="undo"]').click()); await settled(); };
  const redo = async () => { await page.evaluate(() => document.querySelector('[data-ws-command="redo"]').click()); await settled(); };
  const R = () => page.evaluate(() => { const r = window.bimcraftSpaces.read(); const lv = window.bimcraftPlan.state.level; return { bounds: r.bounds.map((b) => ({ kind: b.kind, scheme: b.scheme, a: b.a, b: b.b, wall: !!b.wall })), areas: r.areas.map((a) => ({ name: a.name, scheme: a.scheme, area: a.area, enclosed: a.enclosed })), tags: r.tags.map((t) => ({ kind: t.kind, text: t.text, at: t.at })),
    shafts: r.shafts.map((s) => ({ kind: s.kind, n: s.openings.length, area: s.openings.reduce((x, o) => x + o.area, 0) })), groups: r.groups.map((g) => ({ name: g.name, n: g.members.length, def: g.definition })),
    rooms: window.bimcraftPlan.state.data.derived.spaces.filter((s) => s.storey === lv).map((s) => ({ name: s.name, number: s.number })), walls: window.bimcraftPlan.state.data.walls.length }; });
  const status = () => page.evaluate(() => document.querySelector('[data-status]')?.textContent || '');
  const optRow = (name) => page.evaluate((name) => { const r = document.querySelector('[data-mopts="' + name + '"]'); return !!r && !r.hidden && r.getClientRects().length > 0; }, name);

  const rib = await page.evaluate((ids) => ids.map((id) => { const b = document.querySelector('.ws-ribbon [data-ws-command="' + id + '"]'); return b ? { id, off: b.classList.contains('ws-notbuilt') || b.getAttribute('aria-disabled') === 'true', why: b.dataset.wsReason || '', icon: !!b.querySelector('svg'), label: b.textContent.trim() } : { id, missing: true }; }), TEN);
  ok(rib.every((b) => !b.missing && !b.off && b.icon && b.label), 'all ten are on the ribbon, switched on, each with an icon and a name', rib.filter((b) => b.missing || b.off || !b.icon));
  ok(await page.evaluate(() => { const c = window.ccInput.commands, ids = ['room.place', 'room.separator', 'room.tag', 'area.place', 'area.boundary', 'area.tag', 'opening.shaft', 'opening.vertical', 'group.model', 'wall.opening']; return ids.every((id) => { const x = c.find((y) => y.id === id); return x && document.querySelector(x.sel); }); }), 'the ten registry commands each find their button on the page');
  ok(await page.evaluate(() => { const set = window.ccIconSet; return !!set && ['roomsep', 'roomtag', 'areabound', 'areatag', 'shaft', 'vertopen', 'modelgroup', 'room', 'area', 'wallopen'].every((k) => set.keys.includes(k) && set.node(k)); }), 'the CadCraft icon set has the drawings');

  // four walls, 6000 x 4000, through the ribbon's own Wall button
  // the page starts on the 3D view: a planned-then-built tool opens a floor plan for itself (the ribbon's Wall needs one open)
  await ribbon('roomseparator');
  ok(await tool() === 'roomsep' && await page.evaluate(() => window.bimcraftPlan.state.layout !== '3d' && !!window.bimcraftPlan.view), 'Room Separator clicked from the 3D view: a floor plan is opened and the tool is in hand');
  await ribbon('wall');
  for (const [x, y] of [[0, 0], [6000, 0], [6000, 4000], [0, 4000], [0, 0]]) { await planClick(x, y); await settled(); }
  await page.keyboard.press('Escape'); await settled();
  let s = await R();
  ok(s.walls === 4 && s.rooms.length === 1, 'four walls drawn from the ribbon: one room', [s.walls, s.rooms.length]);
  await page.evaluate(() => window.bimcraftPlan.view.fit?.()); await page.waitForTimeout(300);

  console.log('== Room');
  await ribbon('room');
  ok(await tool() === 'room' && await optRow('room'), 'Room: the tool is in hand, its row (Name, Number) is showing');
  await page.fill('[data-sp-rname]', 'Workshop'); await page.press('[data-sp-rname]', 'Tab');
  await page.fill('[data-sp-rnum]', 'W-01'); await page.press('[data-sp-rnum]', 'Tab');
  await planClick(3000, 2000); await settled();
  s = await R();
  ok(s.rooms[0].name === 'Workshop' && s.rooms[0].number === 'W-01', 'clicked in the room: it is Workshop, W-01', s.rooms);
  ok(/W-01 Workshop/.test(await status()) && /m²/.test(await status()) && /m³/.test(await status()), 'the status line says its area, perimeter and volume', await status());
  ok(await page.inputValue('[data-sp-rnum]') === 'W-02', 'the Number field went on to W-02 for the next room');
  { const vol = await page.evaluate(() => document.querySelector('[data-mp-rvol]')?.textContent || '');
    // (6000 - t) x (4000 - t) x the level's height: read back from the page's own numbers
    const want = await page.evaluate(() => { const S = window.bimcraftPlan.state, l = S.loops.rooms[0], L = S.data.levels, i = L.findIndex((x) => x.id === S.level), h = L[i + 1] ? L[i + 1].elevation - L[i].elevation : L[i].height; return (l.area * h / 1e9).toFixed(2) + ' m³'; });
    ok(vol === want && /m³/.test(vol), 'Properties shows the room\'s volume (' + vol + ' = area x level height)', [vol, want]); }
  await shot('1-room');
  await undo();
  ok((await R()).rooms[0].name !== 'Workshop', 'undo: the name is taken back');
  await redo();

  console.log('== Room Separator');
  await ribbon('roomseparator');
  ok(await tool() === 'roomsep', 'Room Separator: the tool is in hand');
  await planClick(2000, 0); await planClick(2000, 4000); await settled();
  await page.keyboard.press('Escape');
  s = await R();
  ok(s.bounds.length === 1 && s.bounds[0].kind === 'room' && s.rooms.length === 2 && s.rooms.some((r) => r.name === 'Workshop'), 'a line drawn across the room: two rooms, Workshop kept', s);
  ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.some((x) => x.bound === 'room' && x.dashed?.length === 1)), 'the plan draws it dashed');
  await undo();
  ok((await R()).rooms.length === 1 && (await R()).bounds.length === 0, 'undo: one room, no line');
  await redo();
  ok((await R()).rooms.length === 2, 'redo: two rooms');
  await shot('2-separator');

  console.log('== Tag Room');
  await ribbon('tagroom');
  ok(await tool() === 'tagroom' && await optRow('tagroom'), 'Tag Room: the tool and its row (text height on paper, Tag all untagged)');
  await planClick(4000, 2500); await settled();
  s = await R();
  ok(s.tags.length === 1 && s.tags[0].kind === 'room' && /^W-01\nWorkshop\n/.test(s.tags[0].text) && near(s.tags[0].at[0], 4000, 2) && near(s.tags[0].at[1], 2500, 2), 'clicked in Workshop: its tag sits where clicked and says W-01, Workshop and the area', s.tags);
  { const sym = await page.evaluate(() => { const sc = window.bimcraftPlan.view.scene, x = sc.symbols.find((y) => y.texts?.length === 3); return x ? { h: x.texts[0].h, scale: sc.scale || 100, lines: x.texts.map((q) => q.text), plain: sc.rooms.filter((r) => r.label).length } : null; });
    ok(sym && near(sym.h, 2.5 * sym.scale, 0.01) && sym.lines[0] === 'W-01' && sym.plain === 1, 'drawn 2.5 mm tall on paper (2.5 x the view scale ' + sym?.scale + ' = ' + sym?.h + ' mm in the model); the tagged room\'s plain label is replaced', sym); }
  await page.click('[data-sp-tagall]'); await settled();
  s = await R();
  ok(s.tags.length === 2 && /2|1 tag/.test(await status()), 'Tag all untagged: the other room is tagged too', [s.tags.length, await status()]);
  await undo();
  ok((await R()).tags.length === 1, 'undo: one tag');
  await redo();
  // drag the tag: pick it, drag it 600 up
  await ribbon('select');
  await planClick(4000, 2500); await page.waitForTimeout(250);
  { const [ax, ay] = await at(4000, 2500), [bx, by] = await at(4300, 3100);
    await page.mouse.move(ax, ay); await page.mouse.down(); await page.mouse.move((ax + bx) / 2, (ay + by) / 2, { steps: 4 }); await page.mouse.move(bx, by, { steps: 4 }); await page.mouse.up(); await settled();
    const t2 = (await R()).tags.find((x) => /^W-01/.test(x.text));
    ok(near(t2.at[0], 4300, 15) && near(t2.at[1], 3100, 15), 'a picked tag dragged: it moved to where it was dropped', t2.at); }
  await shot('3-tags');

  console.log('== Area Boundary and Area');
  await ribbon('areaboundary');
  ok(await tool() === 'areabound' && await optRow('areabound'), 'Area Boundary: the tool and its row (scheme, draw or pick walls)');
  await page.selectOption('[data-sp-pick]', 'centre');
  for (const [x, y] of [[3000, 0], [6000, 2000], [3000, 4000], [0, 2000]]) { await planClick(x, y); await settled(); }
  s = await R();
  ok(s.bounds.filter((b) => b.kind === 'area' && b.scheme === 'gross' && b.wall).length === 4, 'four walls picked: four area boundaries on their centre lines, each following its wall', s.bounds.length);
  await undo();
  ok((await R()).bounds.filter((b) => b.kind === 'area').length === 3, 'undo: three');
  await redo();
  await ribbon('area');
  ok(await tool() === 'area' && await optRow('area'), 'Area: the tool and its row (scheme, name, number, type)');
  await page.fill('[data-sp-aname]', 'Ground floor'); await page.press('[data-sp-aname]', 'Tab');
  await planClick(1000, 1000); await settled();
  s = await R();
  // the walls' centre lines as the ribbon's Wall tool placed them (it draws by a face): the area is the box of those lines
  const CL = await page.evaluate(() => { const W = window.bimcraftPlan.state.data.walls, xs = W.flatMap((w) => [w.a[0], w.b[0]]), ys = W.flatMap((w) => [w.a[1], w.b[1]]); return (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys)); });
  ok(s.areas.length === 1 && s.areas[0].name === 'Ground floor' && s.areas[0].enclosed && near(s.areas[0].area, CL, 5) && CL > 23e6 && CL < 26e6, 'clicked inside the boundaries: the area Ground floor measures the box of the four centre lines (' + (CL / 1e6).toFixed(2) + ' m2)', [s.areas, CL]);
  ok(s.rooms.length === 2, 'the rooms are still two (an area is not a room)');
  ok(await page.evaluate(() => { const k = document.querySelector('[data-msched-kind]'); return !!k?.querySelector('option[value="areas"]'); }), 'the Schedules list has Areas');
  await undo();
  ok((await R()).areas.length === 0, 'undo: no area');
  await redo();
  await ribbon('tagarea');
  await planClick(1000, 3200); await settled();
  s = await R();
  ok(s.tags.filter((x) => x.kind === 'area').length === 1 && s.tags.find((x) => x.kind === 'area').text.endsWith('Ground floor\n' + (CL / 1e6).toFixed(2) + ' m²'), 'Tag Area: the tag says Ground floor and its area', s.tags.filter((x) => x.kind === 'area'));
  await undo();
  ok((await R()).tags.filter((x) => x.kind === 'area').length === 0, 'undo: the area tag is gone');
  await redo();
  await shot('4-areas');

  console.log('== Shaft and Vertical Opening');
  // something to cut: a floor and a ceiling in the big room, with the ribbon's own Floor and Ceiling
  await ribbon('floor'); await planClick(4000, 1000); await settled();
  await ribbon('ceiling'); await planClick(4000, 1000); await settled();
  const derived = () => page.evaluate(() => { const d = window.bimcraftPlan.state.data.derived; return { floors: d.floors.length, ceilings: d.ceilings.length }; });
  ok((await derived()).floors === 1 && (await derived()).ceilings === 1, 'a floor and a ceiling made in the big room', await derived());
  await ribbon('shaft');
  ok(await tool() === 'shaft' && await optRow('shaft'), 'Shaft: the tool and its row (base level, top level, offsets)');
  for (const [x, y] of [[4000, 500], [5000, 500], [5000, 1500], [4000, 1500]]) await planClick(x, y);
  await page.keyboard.press('Enter'); await settled();
  s = await R();
  // base Level 1, top Level 2: the ceiling is in the way (the floor's top is at the base: not cut). 1000 x 1000 = 1 000 000 out
  ok(s.shafts.length === 1 && s.shafts[0].kind === 'shaft' && s.shafts[0].n === 1 && near(s.shafts[0].area, 1000000, 5), 'a 1000 x 1000 shaft from Level 1 to Level 2: it cuts the ceiling (1 000 000 mm2), not the floor it stands on', s.shafts);
  ok(/cuts 1/.test(await status()), 'the status line says what it cut', await status());
  ok(await page.evaluate(() => window.bimcraftPlan.view.scene.symbols.some((x) => x.shaft === 'shaft' && x.thin?.length === 2)), 'the plan shows its outline with a cross');
  await shot('5-shaft');
  await undo();
  ok((await R()).shafts.length === 0, 'undo: the shaft and its opening are gone');
  await redo();
  await ribbon('vertical');
  ok(await tool() === 'vopening' && await optRow('vopening'), 'Vertical Opening: the tool and its row (what to cut)');
  for (const [x, y] of [[2500, 2500], [3100, 2500], [3100, 3100], [2500, 3100]]) await planClick(x, y);
  await page.keyboard.press('Enter'); await settled();
  s = await R();
  ok(s.shafts.length === 2 && s.shafts.some((x) => x.kind === 'vertical' && x.n === 1 && near(x.area, 360000, 5)) && /floor/.test(await status()), 'a 600 x 600 outline: the floor is cut (360 000 mm2)', [s.shafts, await status()]);
  { const net = await page.evaluate(async () => { const S = window.bimcraftPlan.state; const k = document.querySelector('[data-msched-kind]'); return !!k; });
    ok(net, 'the schedules are there to read the deduction'); }
  await undo();
  ok((await R()).shafts.length === 1, 'undo: only the shaft is left');
  await redo();

  console.log('== Wall Opening');
  await ribbon('wallopening');
  ok(await tool() === 'wsopen', 'Wall Opening: the ribbon button starts the wall opening tool (0.9 WT.6)');
  const wo = () => page.evaluate(() => window.bimcraftWallShape?.readWallOpenings?.().length ?? -1);
  const wo0 = await wo();
  await planClick(4500, 0); await settled();
  ok(await wo() === wo0 + 1, 'a click on the south wall: one opening in it', [wo0, await wo()]);
  await undo();
  ok(await wo() === wo0, 'undo: the wall is whole');

  console.log('== Model Group');
  await ribbon('select');
  const mids = await page.evaluate(() => { const W = window.bimcraftPlan.state.data.walls.map((w) => [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2]); return [W.slice().sort((p, q) => q[1] - p[1])[0], W.slice().sort((p, q) => q[0] - p[0])[0]]; });
  await planClick(20000, 20000); await page.waitForTimeout(200);   // nothing picked
  await ribbon('modelgroup');
  ok(await tool() === 'mgroup' && await optRow('mgroup') && (await R()).groups.length === 0, 'Model Group with nothing picked: the tool waits, its row (name, Group, Place another, Add the picked, Ungroup) is showing');
  await page.fill('[data-sp-gname]', 'Corner'); await page.press('[data-sp-gname]', 'Tab');
  await planClick(mids[0][0], mids[0][1]); await page.waitForTimeout(250);          // the north wall
  await page.keyboard.down('Control'); await planClick(mids[1][0], mids[1][1]); await page.keyboard.up('Control'); await page.waitForTimeout(250);   // + the east wall
  ok(await page.evaluate(() => window.bimcraftPlan.view.selection?.size) === 2, 'a click and a Ctrl+click on the plan pick two walls');
  await page.click('[data-sp-gmake]'); await settled();
  await planClick(mids[0][0], mids[0][1]); await page.waitForTimeout(250);          // a click on a member picks its group
  s = await R();
  ok(await tool() === 'mgroup' && s.groups.length === 1 && s.groups[0].n === 2 && s.groups[0].name === 'Corner', 'Group pressed: the two walls are the group Corner', [s.groups, await status(), problems.slice(-2)]);
  ok(await optRow('mgroup') && /Corner: 2 elements, 1 placed/.test(await page.evaluate(() => document.querySelector('[data-sp-ginfo]')?.textContent || '')), 'its row shows the group, with Place another, Add the picked and Ungroup');
  await page.evaluate(() => { const pv = window.bimcraftPlan.view; pv.scale *= 0.4; pv.render(); }); await page.waitForTimeout(200);   // zoom out: room on the plan for a copy
  await page.click('[data-sp-gplace]');
  await planClick(9000, 500); await settled();
  s = await R();
  ok(s.groups.length === 2 && s.groups[0].def === s.groups[1].def && s.walls === 6, 'Place another, clicked to the east: a second Corner (two more walls)', [s.groups, s.walls, await status(), await tool()]);
  await shot('6-group');
  await undo();
  s = await R();
  ok(s.groups.length === 1 && s.walls === 4, 'undo: one Corner, four walls');
  await redo();
  // ungroup the copy from its row
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);   // stops placing more copies
  if (await tool() !== 'mgroup') { await page.evaluate(() => window.bimcraftPlan.view && document.querySelector('[data-mtool="select"]').click()); await planClick(20000, 20000); await ribbon('modelgroup'); }
  // a click on a wall of the copy picks the whole copy (its north wall, moved with it)
  { const mid = await page.evaluate(() => { const S = window.bimcraftPlan.state, r = window.bimcraftSpaces.read(), g = r.groups[r.groups.length - 1], w = S.data.walls.find((x) => g.members.includes(x.id)); return [(w.a[0] + w.b[0]) / 2, (w.a[1] + w.b[1]) / 2]; });
    await planClick(mid[0], mid[1]); await page.waitForTimeout(250); }
  ok(/Corner: 2 elements, 2 placed/.test(await page.evaluate(() => document.querySelector('[data-sp-ginfo]')?.textContent || '')), 'with Model Group in hand a click on one wall of the copy picks the whole copy', await page.evaluate(() => document.querySelector('[data-sp-ginfo]')?.textContent || ''));
  await page.click('[data-sp-gungroup]'); await settled();
  s = await R();
  ok(s.groups.length === 1 && s.walls === 6, 'Ungroup on the copy: one group left, its walls stay', [s.groups.length, s.walls]);
  await undo(); await undo();
  ok((await R()).groups.length === 1 && (await R()).walls === 4, 'two undos: back to one Corner and four walls');
  ok(!errors.length && !problems.length, 'no page error in the whole run', [...errors, ...problems].slice(0, 3));
  await ctx.close();

  // ============================================================================================ the Auto-revise layout
  console.log('== "Auto-revise" layout');
  ({ ctx, page, errors } = await lab.page('bimcraft', { layout: 'autorev', viewport: { width: 1600, height: 1000 }, storage: { 'bimcraft.model.units': 'mm' } }));
  { const r2 = await page.evaluate((ids) => ids.map((id) => { const b = document.querySelector('.ws-ribbon [data-ws-command="' + id + '"]'); return b ? { id, off: b.classList.contains('ws-notbuilt') || b.getAttribute('aria-disabled') === 'true', why: b.dataset.wsReason || '' } : { id, missing: true }; }), TEN);
    ok(r2.every((b) => !b.missing && !b.off), 'all ten are on and switched on here too', r2.filter((b) => b.missing || b.off));
    await page.evaluate(() => document.querySelector('.ws-ribbon [data-ws-command="roomseparator"]').click()); await page.waitForTimeout(900);
    ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'roomsep', 'Room Separator clicked: the tool is in hand (a floor plan was opened for it)');
    ok(!errors.length, 'no page error', errors.slice(0, 2)); }
  await ctx.close();

  // ============================================================================================ the classic layout
  console.log('== classic layout: the Rooms menu of the Draw bar');
  ({ ctx, page, errors } = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1600, height: 1000 }, storage: { 'bimcraft.model.units': 'mm' } }));
  { const m = await page.evaluate(() => { const d = document.querySelector('[data-space-tools]'); return d ? { sum: d.querySelector('summary').textContent.trim(), tools: [...d.querySelectorAll('[data-mtool]')].map((b) => [b.dataset.mtool, b.textContent.trim(), !!b.title]) } : null; });
    ok(m && m.sum === 'Rooms' && m.tools.length === 9 && m.tools.every((x) => x[1] && x[2]) && m.tools[1][1] === 'Room Separator', 'a Rooms menu with the nine tools, each named with a tooltip', m);
    await page.evaluate(() => { const t = document.querySelector('[data-model-toggle]'); if (t && t.getAttribute('aria-pressed') !== 'true') t.click(); }); await page.waitForTimeout(600);
    await page.click('[data-space-tools] > summary'); await page.click('[data-space-tools] [data-mtool="shaft"]'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'shaft' && /corners of the shaft/.test(await page.evaluate(() => document.querySelector('[data-model-hint]')?.textContent || '')) && await page.evaluate(() => !document.querySelector('[data-mopts="shaft"]').hidden), 'Shaft from the menu: the tool, its hint and its row');
    for (const id of ['home', 'ribbon', 'drafting', 'viewer']) {
      await page.evaluate((id) => window.ccInput.setStyle(id), id); await page.waitForTimeout(500);
      const where = await page.evaluate(() => { const ids = ['room.place', 'room.separator', 'room.tag', 'area.place', 'area.boundary', 'area.tag', 'opening.shaft', 'opening.vertical', 'group.model', 'wall.opening']; const st = window.ccInput.current(); const txt = JSON.stringify(st); return ids.filter((x) => !txt.includes('"' + x + '"')); });
      ok(where.length === 0, 'menu style ' + id + ': the ten commands have a place', where);
    }
    await page.evaluate(() => window.ccInput.setStyle('cadcraft'));
    ok(!errors.length, 'no page error', errors.slice(0, 2)); }
  await ctx.close();
} finally { await lab.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
