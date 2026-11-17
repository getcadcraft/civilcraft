#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-house.mjs: THE release check on the real page (0.10 BK.2, BK.4, BK.80, BK.10; session bk-r3-scale-10). Run for every
 * release; each step is timed and the run is written to a durable result log the release notes quote.
 *   node tools/bimcraft-test/browser-house.mjs [--only ten,house,reopen,office] [--shots <dir>] [--no-log] [--label <text>]
 * Run as root (a session minted for its own test admin, disabled at the end). One headless browser, three page loads in a row.
 * Built on the shared lab page harness bk-page.mjs (not a copy of it).
 *
 *   ten     BK.2 the ten-minute test, the scripted half: from the start screen, with ONLY what a newcomer sees (the start
 *           screen's New building, the Draw bar's Wall, Door and Window, real mouse clicks on the plan, Section line, Sheets): a
 *           room with a door and a window, then the SAME drawing gives a correct plan, section, elevation and schedules. The
 *           script reads results through test hooks but never acts through one. Its time is a script's, not a newcomer's: the
 *           newcomer run is the community test docs/community-tests/BK.2-HAND.md.
 *   house   BK.4 / BK.80 the small house: THE fixture (fixtures/bimcraft/small-house.ifc; numbers in make-small-house.mjs HOUSE)
 *           opened on the page: plan, grids, rooms, the door, window and room schedules, dimensions, the drawing set (plan, four
 *           elevations, two sections, schedules, title blocks) with text and dimensions sized by the BK.10 rule, the same paper
 *           sizes at 1:100 and 1:50, the building's annotation sizes set in the dialog, plan PDF, the set as PDF, a BCF issue saved
 *           and opened again, Save as IFC.
 *   reopen  the IFC saved by `house` opened again: the same house, the same sheets, the annotation sizes kept.
 *   office  BK.10: with the Default Policies add-on on and the office's paper heights set, a new building starts with them.
 *
 * Result log: docs/results/<release>/small-house/<UTC time>.json and .md (+ latest.md), release = the roadmap release the dev
 * build is for (--release, default 0.10).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openLab, REPO } from './bk-page.mjs';
import { HOUSE as H } from './make-small-house.mjs';

const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ONLY = arg('--only') ? arg('--only').split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const RELEASE = arg('--release', '0.10');
const FIXTURE = path.join(REPO, H.file);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-house-'));
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
const PT = (mm) => mm / 0.718 * 72 / 25.4;   // a capital height on paper → the font size that prints it (annoscale.js CAP)

const steps = [];   // { part, name, ms, pass, fail, notes }
let cur = null, totalPass = 0, totalFail = 0;
const problems = [];
/** A timed step of a part; `ok` inside it counts for the step. */
async function step(part, name, fn) {
  cur = { part, name, ms: 0, pass: 0, fail: 0, fails: [], notes: [] };
  steps.push(cur);
  console.log('== ' + part + ': ' + name);
  const t0 = Date.now();
  try { await fn(); } catch (e) { cur.fail++; totalFail++; cur.fails.push(String(e.message || e).split('\n')[0]); console.log('  FAIL ' + (e.stack || e)); }
  cur.ms = Date.now() - t0;
  console.log('  (' + (cur.ms / 1000).toFixed(1) + ' s)');
}
const ok = (c, m, d = '') => { if (c) { cur.pass++; totalPass++; console.log('  ok   ' + m); } else { cur.fail++; totalFail++; cur.fails.push(m + (d !== '' ? ' (' + d + ')' : '')); console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } return !!c; };
const note = (s) => { cur.notes.push(s); console.log('  note ' + s); };

/** What the page holds of the building (read only). */
const facts = (page) => page.evaluate(() => {
  const S = window.bimcraftPlan.state, d = S.data, R = window.bimcraftRes;
  return { walls: d.walls.map((w) => ({ len: Math.round(w.len), t: Math.round(w.t), type: w.typeKey, a: w.a.map(Math.round), b: w.b.map(Math.round) })), doors: d.openings.filter((o) => o.kind === 'door').map((o) => o.mark), windows: d.openings.filter((o) => o.kind === 'window').map((o) => o.mark),
    rooms: (d.derived.spaces || []).map((s) => ({ number: s.number, name: s.name })), floors: d.derived.floors.length, ceilings: d.derived.ceilings.length, roofs: d.derived.roofs.length,
    grids: (window.bimcraftGrids?.state.grids || []).flatMap((g) => g.axes.map((x) => x.tag)), sections: (R?.state.secs || []).map((s) => s.name), levels: d.levels.map((l) => l.name) };
});
const schedules = (page) => page.evaluate(() => { const all = window.bimcraftRes.api.schedules(); const pick = (k) => (all[k] ? { head: all[k].head, rows: all[k].rows.map((r) => r.map(String)) } : null); return { doors: pick('doors'), windows: pick('windows'), rooms: pick('rooms') }; });
/** The drawing set as the Sheets dialog made it: per sheet its number, its views and every text with its size (pt). */
const sheetSet = (page) => page.evaluate(() => window.bimcraftRes.state.sheets.map((s) => ({ number: s.number, title: s.title, views: s.views.map((v) => ({ title: v.title, scale: v.scale, w: v.bb ? Math.round(v.bb.x1 - v.bb.x0) : 0, h: v.bb ? Math.round(v.bb.y1 - v.bb.y0) : 0 })),
  texts: s.items.filter((it) => it.t === 'text').map((it) => ({ s: String(it.s), size: Math.round(it.size * 1000) / 1000 })), lines: s.items.filter((it) => it.t === 'line').length, fills: s.items.filter((it) => it.t === 'fill').length })));
async function openSheets(L) {
  await L.page.click('[data-res-sheetsopen]');
  await L.page.waitForSelector('[data-res-shlist] button', { timeout: 120000 });
  return sheetSet(L.page);
}
const closeSheets = (L) => L.page.click('[data-res-shclose]');
const download = async (page, sel, timeout = 60000) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout }), page.click(sel)]); const p = path.join(TMP, dl.suggestedFilename().replace(/[^\w. -]/g, '_')); await dl.saveAs(p); return { name: dl.suggestedFilename(), path: p, bytes: fs.readFileSync(p) }; };
const pdfPages = (bytes) => (Buffer.from(bytes).toString('latin1').match(/\/Type \/Page\b/g) || []).length;
const sizeOf = (sheet, re) => sheet.texts.find((x) => re.test(x.s))?.size;
/** Requests the server throttled (429). Two limits belong to the test machine, not to the build: the anonymous hardware-specs
 *  report (per network; every builder's run shares one address) and the Library's automatic connect (30 an hour per account;
 *  repeated runs use one test account). A 429 anywhere else is a failure. bk-page.mjs records the address with each console error. */
const MACHINE_LIMITS = /status of 429.*\[[^\]]*(\/api\/v1\/hardware\b|\/api\/library\/connect-auto\b)/;
let throttledSeen = 0;
const done = async (L) => {
  throttledSeen += L.problems.filter((p) => MACHINE_LIMITS.test(p)).length;
  problems.push(...L.problems.filter((p) => !/favicon|ERR_ABORTED|net::ERR_FAILED.*hardware/.test(p) && !MACHINE_LIMITS.test(p)));
  await L.close();
};

/** Pan and zoom the plan (as a person does with the wheel) so the box (mm) sits in the part of the canvas nothing floats over. */
async function frameFree(L, x0, y0, x1, y1) {
  await L.page.evaluate(([x0, y0, x1, y1]) => {
    const st = document.querySelector('.bc-stage'); if (st) st.scrollTop = 0;
    const pv = window.bimcraftPlan.view, cv = pv.canvas, r = cv.getBoundingClientRect();
    let top = r.top;
    for (let fx = 0.1; fx <= 0.9; fx += 0.1) { const x = r.left + r.width * fx; let y = r.top + 2; while (y < r.bottom - 40 && document.elementFromPoint(x, y) !== cv) y += 6; top = Math.max(top, y); }
    const free = { x: r.left + 30, y: top + 30, w: r.width - 60, h: Math.min(r.bottom, window.innerHeight) - top - 110 };
    pv.scale = Math.min(free.w / (x1 - x0), free.h / (y1 - y0));
    const mx = free.x + free.w / 2 - r.left, my = free.y + free.h / 2 - r.top;   // where the box's middle goes, in canvas px
    pv.cx = (x0 + x1) / 2 - (mx - pv.w / 2) / pv.scale; pv.cy = (y0 + y1) / 2 + (my - pv.h2 / 2) / pv.scale;
    pv.userMoved = true; pv.render();
  }, [x0, y0, x1, y1]);
}
/** A real mouse click on the plan; fails loudly when something floats over that point. */
async function clickPlan(L, x, y) {
  const [px, py] = await L.at(x, y);
  const free = await L.page.evaluate(([px, py]) => document.elementFromPoint(px, py) === window.bimcraftPlan.view.canvas, [px, py]);
  if (!free) throw new Error('the plan point ' + x + ', ' + y + ' is under something else on the page');
  await L.page.mouse.move(px, py, { steps: 3 }); await L.page.waitForTimeout(80); await L.page.mouse.click(px, py);
  await L.page.waitForTimeout(150); await L.settled();
}
/** After a file is opened: Model › Draw shows its plan (the plan alone, View › Plan). */
async function showPlan(L) {
  const { page } = L;
  await L.waitStatus(/^Opened /, 120000);
  if (!(await page.evaluate(() => !!window.bimcraftPlan?.state?.on))) await page.click('[data-model-toggle]');
  await page.waitForFunction(() => window.bimcraftPlan?.state?.on && window.bimcraftPlan.state.data?.walls?.length === 5, null, { timeout: 120000 });
  await L.settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);
}
/** A control inside a left-panel section that is folded: open the section by its heading, as a person does. */
async function reveal(L, sel) {
  if (await L.page.isVisible(sel)) return;
  await L.page.click(`section.bc-sec:has(${sel}) [data-af="closed"]`);
  await L.page.waitForSelector(sel, { state: 'visible', timeout: 10000 });
}
let savedIfc = null;

// ---------------------------------------------------------------------------------------------------- BK.2 ten minutes
if (want('ten')) {
  const L = await openLab({ tag: 'bimhouse', units: 'mm', viewport: { width: 1600, height: 1700 } });
  const { page } = L;
  const t0 = Date.now();
  const W = 5000, D = 4000;
  try {
    await step('ten', 'the front door: start screen, New building', async () => {
      ok(/start a new building/i.test(await page.textContent('.bc-empty-lede')), 'the start screen says you can start a new building');
      await L.newBuilding({ name: 'Ten minute room', levels: 1 });
      ok((await facts(page)).levels.length === 1 && await page.isVisible('[data-mtool="wall"]'), 'one level, the plan open, the Draw bar\'s Wall tool in sight');
    });
    await step('ten', 'a room: four walls drawn with the mouse', async () => {
      await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(400);   // View › Plan: the plan alone
      await L.tool('wall');
      await frameFree(L, -1500, -1500, W + 1500, D + 1500);
      for (const p of [[0, 0], [W, 0], [W, D], [0, D], [0, 0]]) await clickPlan(L, p[0], p[1]);
      await page.keyboard.press('Escape');
      await L.settled();
      const f = await facts(page);
      ok(f.walls.length === 4 && f.rooms.length === 1, 'four walls close into one room', JSON.stringify({ walls: f.walls.length, rooms: f.rooms.length }));
      ok(f.walls.map((w) => w.len).sort((a, b) => a - b).every((l, i) => near(l, [D, D, W, W][i], 60)), 'the walls are 5 000 and 4 000 long (within the pointer\'s snap)', f.walls.map((w) => w.len).join());
    });
    await step('ten', 'a door and a window', async () => {
      await L.tool('door'); await frameFree(L, -1500, -1500, W + 1500, D + 1500); await clickPlan(L, W / 2, 0);
      await L.tool('window'); await frameFree(L, -1500, -1500, W + 1500, D + 1500); await clickPlan(L, W, D / 2);
      await L.tool('select');
      const f = await facts(page);
      ok(f.doors.join() === 'D1' && f.windows.join() === 'W1', 'one door D1 in the south wall, one window W1 in the east wall', JSON.stringify([f.doors, f.windows]));
    });
    const built = Date.now() - t0;
    let f0 = null;
    await step('ten', 'the plan is correct', async () => {
      f0 = await facts(page);
      const sc = await page.evaluate(() => { const s = window.bimcraftPlan.view.scene; return { walls: s.walls.length, symbols: s.symbols.length, rooms: s.rooms.filter((r) => r.label?.length).map((r) => r.label), dims: s.dims.map((d) => d.text) }; });
      ok(sc.walls === 4 && sc.symbols >= 2, 'the plan draws four walls, the door swing and the window', JSON.stringify(sc).slice(0, 200));
      ok(sc.rooms.some((l) => /^101/.test(l[0]) || /Room/.test(l.join(' '))), 'the room carries its number and its area', JSON.stringify(sc.rooms));
      ok(sc.dims.length >= 4, 'the walls are dimensioned (' + sc.dims.length + ' dimensions)');
    });
    await step('ten', 'the schedules come from the same drawing', async () => {
      const s = await schedules(page);
      ok(s.doors.rows.length === 1 && s.doors.rows[0][0] === 'D1' && s.windows.rows.length === 1 && s.windows.rows[0][0] === 'W1', 'door schedule: D1; window schedule: W1');
      // by hand: the room inside the walls is (5 000 - t) x (4 000 - t) for walls of thickness t on their centre lines
      const t = f0.walls[0].t, wl = f0.walls.map((w) => w.len).sort((a, b) => a - b), area = (wl[3] - t) * (wl[0] - t) / 1e6;
      const row = s.rooms.rows[0].join(' | '), m = /([\d.,]+)\s*m²/.exec(row);
      ok(s.rooms.rows.length === 1 && m && near(parseFloat(m[1].replace(',', '')), area, 0.06), 'room schedule: one room of ' + area.toFixed(2) + ' m² ((' + wl[3] + ' - ' + t + ') x (' + wl[0] + ' - ' + t + ') mm)', row);
      await page.selectOption('[data-msched-kind]', 'doors', { timeout: 1500 }).catch(() => {});
      ok(/D1/.test(await page.evaluate(() => document.querySelector('[data-msched]')?.innerText || '')), 'the Schedules panel on the page lists D1');
    });
    await step('ten', 'a section line, then Sheets: plan, elevations and a section of that room', async () => {
      await L.tool('section'); await frameFree(L, -1500, -1500, W + 1500, D + 1500);
      await clickPlan(L, W / 2 + 800, -1000); await clickPlan(L, W / 2 + 800, D + 1000);
      await page.waitForFunction(() => window.bimcraftRes.state.secs.length === 1, null, { timeout: 30000 });
      await L.tool('select');
      const set = await openSheets(L);
      const nums = set.map((s) => s.number);
      ok(['A-101', 'A-201', 'A-202', 'A-301'].every((n) => nums.includes(n)), 'the set: plan A-101, elevations A-201 and A-202, section A-301', nums.join());
      const t = f0.walls[0].t, elevs = set.filter((s) => /^A-2/.test(s.number)).flatMap((s) => s.views);
      // by hand: an elevation shows the building's outside faces (centre lines + t) and 500 of margin each side
      const widths = elevs.map((v) => v.w).sort((a, b) => a - b);
      ok(elevs.length === 4 && near(widths[0], D + t + 1000, 120) && near(widths[3], W + t + 1000, 120), 'four elevations: two ' + (D + t) + ' wide and two ' + (W + t) + ' wide (outside faces), drawn with a 500 margin', widths.join());
      const sec = set.find((s) => s.number === 'A-301');
      ok(sec.views.length === 1 && near(sec.views[0].w, D + t + 1000, 120) && sec.fills >= 2, 'Section A: ' + (D + t) + ' wide, the two walls it cuts filled', JSON.stringify(sec.views));
      ok(set.every((s) => s.texts.some((x) => x.s === s.number) && s.texts.some((x) => /Ten minute room/.test(x.s))), 'every sheet has a title block with its number and the project');
      await L.shot('ten-01-sheets');
      await closeSheets(L);
    });
    const all = Date.now() - t0;
    await step('ten', 'the time', async () => {
      ok(built < 600000 && all < 600000, 'the scripted path: the room, door and window in ' + (built / 1000).toFixed(1) + ' s, with plan, schedules, section and sheets checked in ' + (all / 1000).toFixed(1) + ' s (limit 600 s)');
      note('Ten-minute path, scripted: the room, the door and the window in ' + (built / 1000).toFixed(1) + ' s; with the plan, schedules, section and sheets checked, ' + (all / 1000).toFixed(1) + ' s.');
      note('A script is not a newcomer. The timed newcomer run is the community test docs/community-tests/BK.2-HAND.md.');
      note('Front door only: every action is a control a newcomer sees or a mouse click on the plan; test hooks are read, and used to pan and zoom the plan as the wheel does, never to change the building.');
    });
  } finally { await done(L); }
}

// ---------------------------------------------------------------------------------------------------- BK.4 / BK.80 the small house
async function checkHouse(L, part) {
  const { page } = L;
  let f = null;
  await step(part, 'the building', async () => {
    f = await facts(page);
    ok(f.walls.length === 5 && f.doors.join() === 'D1,D2' && f.windows.join() === 'W1,W2,W3' && f.floors === 2 && f.ceilings === 2 && f.roofs === 1, 'five walls, doors D1 D2, windows W1 W2 W3, two floors, two ceilings, one roof', JSON.stringify({ w: f.walls.length, d: f.doors, wi: f.windows, fl: f.floors, c: f.ceilings, r: f.roofs }));
    ok(f.walls.filter((w) => w.type === H.ext.type && w.t === 300).map((w) => w.len).sort().join() === '10000,10000,7000,7000' && f.walls.some((w) => w.type === H.int.type && w.t === 100 && w.len === 7000), 'outside walls 10 000 and 7 000 long, 300 thick; the partition 7 000 long, 100 thick');
    ok(f.rooms.map((r) => r.number + ' ' + r.name).join() === '101 Living room,102 Bedroom', 'rooms 101 Living room and 102 Bedroom');
    ok(f.grids.join() === H.grid.tags.join() && f.sections.join() === 'A,B', 'grids 1, 2, 3, A, B and section lines A, B', f.grids.join() + ' / ' + f.sections.join());
  });
  await step(part, 'the plan', async () => {
    const sc = await page.evaluate(() => { const s = window.bimcraftPlan.view.scene; return { walls: s.walls.length, symbols: s.symbols.length, grids: s.grids.map((g) => g.tag), rooms: s.rooms.filter((r) => r.label?.length).map((r) => r.label.join(' / ')), dims: s.dims.map((d) => d.text) }; });
    ok(sc.walls === 5 && sc.symbols >= 5 && sc.grids.join() === H.grid.tags.join(), 'the plan draws five walls, the five openings and five grid lines with their bubbles', JSON.stringify(sc).slice(0, 160));
    ok(sc.rooms.some((r) => /Living room/.test(r) && /32\.16/.test(r)) && sc.rooms.some((r) => /Bedroom/.test(r) && /32\.16/.test(r)), 'each room is labelled with its name and 32.16 m² (4 800 x 6 700 mm, by hand)', sc.rooms.filter((r) => /room/i.test(r)).join(' ; '));
    ok(sc.rooms.some((r) => r === 'A') && sc.rooms.some((r) => r === 'B'), 'the section heads A and B are on the plan');
    ok(sc.dims.length >= 5, 'the walls are dimensioned (' + sc.dims.length + ')', sc.dims.join());
  });
  await step(part, 'schedules: doors, windows, rooms', async () => {
    const s = await schedules(page);
    ok(s.doors.rows.map((r) => r[0]).join() === 'D1,D2' && s.windows.rows.map((r) => r[0]).join() === 'W1,W2,W3', 'doors D1, D2 and windows W1, W2, W3');
    ok(s.rooms.rows.length === 2 && s.rooms.rows.every((r) => /32\.16/.test(r.join(' '))) && /Living room/.test(s.rooms.rows[0].join(' ')) && /Bedroom/.test(s.rooms.rows[1].join(' ')), 'rooms: Living room and Bedroom, 32.16 m² each', s.rooms.rows.map((r) => r.join('|')).join(' ; '));
    ok(s.doors.rows.every((r) => /914/.test(r.join(' ')) && /2032/.test(r.join(' '))), 'each door is 914 x 2 032 in its schedule row', s.doors.rows.map((r) => r.join('|')).join(' ; '));
  });
  return f;
}
/** The set made by Sheets, checked against the house's numbers; returns it. */
async function checkSet(L, part, std) {
  let set = null;
  await step(part, 'the drawing set' + (std ? ' with the building\'s annotation sizes' : ''), async () => {
    set = await openSheets(L);
    const nums = set.map((s) => s.number);
    ok(['A-101', 'A-201', 'A-202', 'A-301', 'A-401'].every((n) => nums.includes(n)), 'plan A-101, elevations A-201 and A-202, sections A-301, schedules A-401', nums.join());
    ok(set.every((s) => s.texts.some((x) => x.s === s.number) && s.texts.some((x) => /Small house/.test(x.s))), 'every sheet has its title block: number and project');
    const elevs = set.filter((s) => /^A-2/.test(s.number)).flatMap((s) => s.views);
    // by hand: 10 000 + 300 of walls + 2 x 300 of eaves = 10 900; 7 000 + 300 + 600 = 7 900; each with a 500 margin on both sides
    const widths = elevs.map((v) => v.w).sort((a, b) => a - b);
    ok(elevs.length === 4 && near(widths[0], 8900, 60) && near(widths[1], 8900, 60) && near(widths[2], 11900, 60) && near(widths[3], 11900, 60), 'four elevations: east and west 7 900 wide, south and north 10 900 (drawn with a 500 margin)', widths.join());
    ok(new Set(elevs.map((v) => v.scale)).size === 1, 'the four elevations share one scale (' + elevs[0].scale + ')');
    const secs = set.find((s) => s.number === 'A-301').views;
    ok(secs.length === 2 && near(Math.min(secs[0].w, secs[1].w), 8900, 60) && near(Math.max(secs[0].w, secs[1].w), 11900, 60), 'Section A 7 900 wide, Section B 10 900: the same house', secs.map((v) => v.w).join());
    const plan = set.find((s) => s.number === 'A-101'), el = set.find((s) => s.number === 'A-201'), schs = set.filter((s) => /^A-4/.test(s.number)), sch = { texts: schs.flatMap((s) => s.texts) };
    ok(plan.texts.some((x) => x.s === 'Living room') && plan.texts.some((x) => /32\.16/.test(x.s)) && ['1', '2', '3', 'A', 'B'].every((g) => plan.texts.some((x) => x.s === g)), 'the plan sheet: room names, areas and the five grid bubbles');
    ok(sch.texts.some((x) => x.s === 'D1') && sch.texts.some((x) => x.s === 'W3') && sch.texts.some((x) => x.s === 'Living room'), 'the schedule sheets (' + schs.map((s) => s.number).join(', ') + '): the doors, the windows and the rooms');
    ok(['Doors', 'Windows', 'Rooms'].every((h) => sch.texts.some((x) => x.s === h)), 'each schedule on the sheet has its heading: Doors, Windows, Rooms', sch.texts.filter((x) => x.size > 8).map((x) => x.s).join());
    const sec = set.find((s) => s.number === 'A-301');
    ok(!sec.texts.some((x) => /Envelope fallback|inspect view records/.test(x.s)), 'the section sheet carries no diagnostic line (walls cut at coarse detail are drawn as their outline, as intended)', sec.texts.filter((x) => /fallback/.test(x.s)).map((x) => x.s).join());
    // BK.80 + BK.10: sizes by the rule. Own: room 7.5 pt, tag / level 6.5, dimension 6, grid 6.5, view title 9, schedule 7.
    const want = std ? { room: PT(std.room), dim: PT(std.dimension), grid: PT(std.grid), title: PT(std.title), sched: PT(std.schedule), tag: PT(std.tag) } : { room: 7.5, dim: 6, grid: 6.5, title: 9, sched: 7, tag: 6.5 };
    const dimText = plan.texts.find((x) => /^\d[\d ,.]*(mm)?$/.test(x.s) && !['1', '2', '3'].includes(x.s));
    const got = { room: sizeOf(plan, /^Living room$/), dim: dimText?.size, grid: sizeOf(plan, /^3$/), title: sizeOf(el, /elevation$/i), sched: sizeOf(sch, /^D1$/), tag: sizeOf(el, /^Ground floor$/) };
    ok(Object.keys(want).every((k) => near(got[k], want[k], 0.01)), 'text and dimensions on the sheets are sized by the annotation rule: room names ' + want.room.toFixed(2) + ' pt, dimension text ' + want.dim.toFixed(2) + ', grid letters ' + want.grid.toFixed(2) + ', view titles ' + want.title.toFixed(2) + ', schedule text ' + want.sched.toFixed(2) + ', level marks ' + want.tag.toFixed(2), JSON.stringify(got));
  });
  return set;
}

if (want('house')) {
  const L = await openLab({ tag: 'bimhouse', units: 'mm', viewport: { width: 1600, height: 1700 } });
  const { page } = L;
  try {
    await step('house', 'open the fixture', async () => {
      await page.setInputFiles('[data-file]', FIXTURE);
      await showPlan(L);
      ok(true, 'fixtures/bimcraft/small-house.ifc opened, its plan shown');
    });
    await checkHouse(L, 'house');
    const set0 = await checkSet(L, 'house', null);
    await step('house', 'the set as a PDF', async () => {
      const dl = await download(page, '[data-res-shpdf]');
      ok(dl.bytes.subarray(0, 8).toString('latin1') === '%PDF-1.4' && pdfPages(dl.bytes) === set0.length, dl.name + ': ' + pdfPages(dl.bytes) + ' pages, one for each of the ' + set0.length + ' sheets');
      await L.shot('house-01-set');
      await closeSheets(L);
    });
    await step('house', 'BK.10 a plan at 1:100 and at 1:50 on screen and on its sheet', async () => {
      const g = await page.evaluate(() => window.bimcraftPlan.state.data.levels[0].guid);
      const setScale = async (r) => { await reveal(L, `[data-pb-range="${g}"]`); await page.click(`[data-pb-range="${g}"]`); await page.waitForSelector('[data-pv-dialog][open]'); await page.selectOption('[data-pv-scale]', String(r)); await page.click('[data-pv-ok]'); await L.settled(); };
      const look = () => page.evaluate(() => { const pv = window.bimcraftPlan.view, s = pv.scene; return { scale: s.scale, anno: s.anno ? { ratio: s.anno.ratio, dim: s.anno.em.dimension, room: s.anno.em.room } : null, px: pv.annoPx('dimension', 10), zoom: pv.scale }; });
      const before = await look();
      ok(before.scale === 0 && before.anno === null && before.px === 10, 'a plan with no scale of its own: fixed screen text, as before');
      await setScale(100);
      const a = await look();
      // by hand: the own 6 pt dimension text at 1:100 is 6 x 25.4 / 72 x 100 = 211.67 mm of model tall; on screen that x the zoom
      ok(a.scale === 100 && near(a.anno.dim, 211.667, 0.01) && near(a.px, Math.max(2, 211.667 * a.zoom), 0.02), 'at 1:100 the dimension text is 211.67 mm of model tall (6 pt x 100) and is drawn at that size on screen (' + a.px + ' px at this zoom)', JSON.stringify(a));
      const p100 = (await openSheets(L)).find((s) => s.number === 'A-101'); await closeSheets(L);
      await setScale(50);
      const b = await look();
      ok(b.scale === 50 && near(b.anno.dim, 105.833, 0.01) && near(b.anno.dim * 2, a.anno.dim, 0.001), 'at 1:50 it is half as tall in the model (105.83 mm)');
      const p50 = (await openSheets(L)).find((s) => s.number === 'A-101'); await closeSheets(L);
      ok(p100.views[0].scale === '1:100' && p50.views[0].scale === '1:50', 'the plan sheet follows: 1:100, then 1:50', p100.views[0].scale + ' ' + p50.views[0].scale);
      ok(sizeOf(p100, /^Living room$/) === 7.5 && sizeOf(p50, /^Living room$/) === 7.5 && sizeOf(p100, /^3$/) === 6.5 && sizeOf(p50, /^3$/) === 6.5, 'the room name and the grid letters are the same size on paper at both scales');
      await page.click('[data-act="undo"]'); await L.settled(); await page.click('[data-act="undo"]'); await L.settled();
      ok((await look()).scale === 0, 'two Undos: the plan has no scale of its own again');
    });
    const std = { text: 2.5, dimension: 2.5, tag: 2.5, room: 3.5, grid: 3, title: 5, schedule: 2.5 };
    await step('house', 'BK.10 the building\'s annotation sizes, set in the dialog', async () => {
      await reveal(L, '[data-pb-anno]');
      await page.click('[data-pb-anno]');
      await page.waitForSelector('[data-anno-dialog][open]');
      ok(await page.getAttribute('[data-anno-h="dimension"]', 'placeholder') === '1.52' && await page.inputValue('[data-anno-h="dimension"]') === '', 'Project browser › Sheets › Annotation sizes: every box empty, BimCraft\'s own size in grey (dimension text 1.52 mm)');
      await page.fill('[data-anno-h="room"]', '80');
      await page.click('[data-anno-ok]');
      ok(/0\.5 to 50/.test(await page.textContent('[data-anno-dialog] [role="alert"]')) && await page.isVisible('[data-anno-dialog][open]'), 'a height of 80 mm is refused in words and the dialog stays');
      for (const [k, v] of Object.entries(std)) await page.fill(`[data-anno-h="${k}"]`, String(v));
      await page.click('[data-anno-ok]');
      await L.settled();
      await page.waitForFunction(() => !document.querySelector('[data-anno-dialog]'), null, { timeout: 20000 });
      ok(/Annotation sizes saved/.test(await page.textContent('[data-status]')), 'saved: the status says so');
      await page.click('[data-pb-anno]');
      await page.waitForSelector('[data-anno-dialog][open]');
      ok(await page.inputValue('[data-anno-h="room"]') === '3.5' && await page.inputValue('[data-anno-h="title"]') === '5', 'opened again the dialog shows the saved heights');
      await page.keyboard.press('Escape');
    });
    await checkSet(L, 'house', std);
    await step('house', 'plan PDF', async () => {
      await closeSheets(L);
      await page.click('[data-model-print]');
      await L.waitStatus(/Saved the plan as a PDF/);
      ok(true, 'Print: ' + (await page.textContent('[data-status]')).trim());
    });
    await step('house', 'BCF: an issue saved and opened again', async () => {
      await page.click('[data-rtab="issues"]');
      await page.click('[data-bcf-new]');
      await page.fill('[data-bcf-f-title]', 'Check the front door swing');
      await page.click('[data-bcf-form] button[type="submit"]');
      await L.waitStatus(/^Created the issue/);
      const dl = await download(page, '[data-bcf-save]');
      ok(/\.bcf$/.test(dl.name) && dl.bytes.subarray(0, 2).toString('latin1') === 'PK' && dl.bytes.length > 300, 'Save BCF: ' + dl.name + ' (' + dl.bytes.length + ' bytes, a zip)');
      const n0 = await page.evaluate(() => window.bimcraftIssues.list().length);
      await page.setInputFiles('[data-bcf-input]', dl.path);
      await page.waitForFunction((n) => /BCF|issue/i.test(document.querySelector('[data-status]')?.textContent || '') && window.bimcraftIssues.list().length >= n, n0, { timeout: 30000 });
      const list = await page.evaluate(() => window.bimcraftIssues.list());
      ok(list.some((x) => x.title === 'Check the front door swing' && x.viewpoints >= 1), 'opened again: the issue with its title and a viewpoint', JSON.stringify(list).slice(0, 200));
    });
    await step('house', 'Save as IFC', async () => {
      await reveal(L, '[data-save]');
      const dl = await download(page, '[data-save]');
      savedIfc = dl.path;
      const text = dl.bytes.toString('latin1');
      ok(/\.ifc$/.test(dl.name) && /CadCraft_AnnotationStandard/.test(text) && /IFCGRID\(/.test(text) && (text.match(/IFCWALL\(/g) || []).length === 5, dl.name + ': five IfcWall, the grid and the annotation standard are in the file');
    });
  } finally { await done(L); }
}

if (want('reopen') && (savedIfc || !want('house'))) {
  const L = await openLab({ tag: 'bimhouse', units: 'mm', viewport: { width: 1600, height: 1700 } });
  const { page } = L;
  const std = savedIfc ? { text: 2.5, dimension: 2.5, tag: 2.5, room: 3.5, grid: 3, title: 5, schedule: 2.5 } : null;
  try {
    await step('reopen', 'open the saved IFC', async () => {
      await page.setInputFiles('[data-file]', savedIfc || FIXTURE);
      await showPlan(L);
      ok(true, 'the file BimCraft saved opens, its plan shown');
    });
    await checkHouse(L, 'reopen');
    await checkSet(L, 'reopen', std);
    await step('reopen', 'what the first run added is still there', async () => {
      await closeSheets(L);
      if (!std) { ok(true, 'the fixture itself (run with --only reopen): nothing was added'); return; }
      await reveal(L, '[data-pb-anno]');
      await page.click('[data-pb-anno]');
      await page.waitForSelector('[data-anno-dialog][open]');
      ok(await page.inputValue('[data-anno-h="dimension"]') === '2.5' && await page.inputValue('[data-anno-h="grid"]') === '3', 'the annotation sizes came back with the file');
      await page.keyboard.press('Escape');
    });
  } finally { await done(L); }
}

// ---------------------------------------------------------------------------------------------------- BK.10 the office's sizes
if (want('office')) {
  const L = await openLab({ tag: 'bimhouse', units: 'mm', viewport: { width: 1600, height: 1700 } });
  const { page } = L;
  try {
    await step('office', 'the office\'s paper heights (Default Policies) start a new building', async () => {
      await page.evaluate(() => {
        localStorage.setItem('cc-addons:bimcraft', JSON.stringify({ off: {}, on: { 'default-policies': true } }));
        localStorage.setItem('cc-default-policies', JSON.stringify({ format: 'cc-default-policies', version: 1, office: 'Test office', policies: { 'all.anno.dimension': 2.5, 'all.anno.room': 3.5 } }));
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.ccAddons?.list().find((x) => x.id === 'default-policies')?.state === 'active', null, { timeout: 60000 });
      await L.newBuilding({ name: 'Office sizes', levels: 1 });
      await L.settled();
      await reveal(L, '[data-pb-anno]');
      await page.click('[data-pb-anno]');
      await page.waitForSelector('[data-anno-dialog][open]');
      ok(await page.inputValue('[data-anno-h="dimension"]') === '2.5' && await page.inputValue('[data-anno-h="room"]') === '3.5' && await page.inputValue('[data-anno-h="grid"]') === '', 'a new building starts with the office\'s heights: dimension text 2.5 mm, room names 3.5 mm; the kinds the office left alone stay BimCraft\'s own');
      ok(await page.isVisible('[data-anno-office]'), 'the dialog offers "Use my office\'s sizes"');
      await page.click('[data-anno-own]');
      ok(await page.inputValue('[data-anno-h="dimension"]') === '', '"BimCraft\'s own sizes" empties the boxes');
      await page.click('[data-anno-office]');
      ok(await page.inputValue('[data-anno-h="dimension"]') === '2.5', '"Use my office\'s sizes" fills them in again');
      await page.keyboard.press('Escape');
      ok((await L.changes()).some((c) => /Annotation sizes from your Default Policies/.test(c)), 'the Changes list says where the sizes came from', (await L.changes()).join(' | '));
      await page.evaluate(() => { localStorage.removeItem('cc-addons:bimcraft'); localStorage.removeItem('cc-default-policies'); });
    });
  } finally { await done(L); }
}

// ------------------------------------------------------------------------------------------------------------ the result log
cur = { part: 'run', name: 'console', ms: 0, pass: 0, fail: 0, fails: [], notes: [] };
steps.push(cur);
if (throttledSeen) note(throttledSeen + ' requests were throttled by the test machine\'s own limits (hardware report, Library auto-connect); not counted as errors.');
ok(problems.length === 0, 'no console errors on any page' + (problems.length ? ': ' + problems.slice(0, 4).join(' | ') : ''));
const when = new Date(), stamp = when.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const build = (() => { try { return JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/manifest.json'), 'utf8')).version || 'dev'; } catch (e) { return 'dev'; } })();
const sha = (() => { try { return execFileSync('sha256sum', [FIXTURE], { encoding: 'utf8' }).slice(0, 16); } catch (e) { return ''; } })();
const result = { format: 'cc-release-check', check: 'bimcraft-small-house', rows: ['BK.2', 'BK.4', 'BK.80', 'BK.10'], at: when.toISOString(), release: RELEASE, build: 'bimcraft dev (' + build + ')', label: arg('--label', ''), parts: ONLY || ['ten', 'house', 'reopen', 'office'], fixture: { file: H.file, sha256_16: sha },
  machine: { load1: os.loadavg()[0].toFixed(2), cpus: os.cpus().length }, passed: totalPass, failed: totalFail, seconds: Math.round(steps.reduce((n, s) => n + s.ms, 0) / 100) / 10, steps };
if (!process.argv.includes('--no-log')) {
  const dir = path.join(REPO, 'docs/results', RELEASE, 'small-house');
  fs.mkdirSync(dir, { recursive: true });
  const md = ['<!-- SPDX-License-Identifier: Apache-2.0 -->', '# BimCraft small-house release check, ' + when.toISOString().slice(0, 16).replace('T', ' ') + ' UTC', '',
    'Written by `node tools/bimcraft-test/browser-house.mjs` (roadmap rows BK.2, BK.4, BK.80, BK.10). Build: ' + result.build + '. Fixture: `' + H.file + '` (sha256 ' + sha + '…). Machine: ' + result.machine.cpus + ' cores, load ' + result.machine.load1 + ' (other work was running).' + (result.label ? ' ' + result.label : ''), '',
    '**' + totalPass + ' passed, ' + totalFail + ' failed**, ' + result.seconds + ' s in all. Parts run: ' + result.parts.join(', ') + '.', '',
    '| Part | Step | Time (s) | Passed | Failed |', '|---|---|---|---|---|',
    ...steps.map((s) => '| ' + s.part + ' | ' + s.name + ' | ' + (s.ms / 1000).toFixed(1) + ' | ' + s.pass + ' | ' + s.fail + ' |'), '',
    ...(steps.some((s) => s.fails.length) ? ['## Failed', '', ...steps.flatMap((s) => s.fails.map((f) => '- ' + s.part + ' › ' + s.name + ': ' + f)), ''] : []),
    ...(steps.some((s) => s.notes.length) ? ['## Notes', '', ...steps.flatMap((s) => s.notes.map((n) => '- ' + n)), ''] : []),
    'The ten-minute part is a script on the newcomer\'s path; a person\'s timed run is `docs/community-tests/BK.2-HAND.md`. Hosting in SuperCad Studio is not part of this run.', ''].join('\n');
  fs.writeFileSync(path.join(dir, stamp + '.json'), JSON.stringify(result, null, 1) + '\n');
  fs.writeFileSync(path.join(dir, stamp + '.md'), md);
  fs.writeFileSync(path.join(dir, 'latest.md'), md);
  try { execFileSync('chown', ['-R', 'www-data:www-data', path.join(REPO, 'docs/results', RELEASE)]); } catch (e) { /* not root */ }
  console.log('\nresult log: ' + path.relative(REPO, path.join(dir, stamp + '.md')));
}
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* stays */ }
console.log(`\n${totalPass} passed, ${totalFail} failed`);
process.exit(totalFail ? 1 : 0);
