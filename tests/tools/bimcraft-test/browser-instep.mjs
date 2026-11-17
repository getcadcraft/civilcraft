#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-instep.mjs — BK.129 "draw once; plans, sections, schedules and sheets stay in step" in the real page
 * (/lab/bimcraft, headless), session `bk-instep-10`.   node tools/bimcraft-test/browser-instep.mjs [--shots <dir>]   (as root)
 *
 * The building of tools/bimcraft-test/instep-test.mjs (its header has the hand arithmetic), made in the page: the four
 * Concrete 200 walls and the stud partition with the Wall tool (its own click handler); the door, the window, Section A and the sheet
 * through the page's own commit (the ops the Door, Window, Section and Sheet tools commit). Then ONE move with the Move tool
 * (select the east wall, Shift+M, two clicks 1000 apart) and, in one pass, what the page itself draws and lists:
 *   the plan scene (what the plan canvas and the sheets draw), Section A and the south / north elevations as the sheets get
 *   them (res-ui.js setInput), the Schedules panel's Walls by type and Rooms, sheet A-101 made by composeSheet from that
 *   input, the sheet editor's drawing of it, and the 3D view's wall. Undo puts all of it back.
 */
import { openLab, M } from './bk-page.mjs';

const L = await openLab({ tag: 'bkinstep', units: 'mm' });
const { page, ok, inPage } = L;
const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
const DOOR = 914.4 * 2032, WIN = 1219.2 * 1219.2;
let code = 1;
try {
  await L.newBuilding({ name: 'In step', levels: 2, height: '3000 mm' });
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  // ---- the walls, with the Wall tool
  await L.frame(-1000, -1000, 10000, 6000);
  await L.tool('wall');
  await page.selectOption('[data-model-walltype]', 'concrete-200');
  // a click of the Wall tool at a plan point, through the plan's own click handler (the Draw bar floats over part of a fresh plan)
  const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(200); await L.settled(); };
  await page.mouse.move(5, 5); await page.waitForTimeout(400);
  for (const p of [[0, 0], [8000, 0], [8000, 5000], [0, 5000], [0, 0]]) await planClick(p[0], p[1]);
  await page.keyboard.press('Escape'); await L.settled();
  await L.tool('wall');
  await page.selectOption('[data-model-walltype]', 'int-100');
  await planClick(4000, 0); await planClick(4000, 5000);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await L.settled();
  let W = await L.walls();
  const pick = (W, f) => W.find(f);
  const isEast = (w) => w.type.startsWith('concrete') && near(w.a[0], w.b[0], 1) && w.a[0] > 5000, isSouth = (w) => near(w.a[1], 0, 1) && near(w.b[1], 0, 1);
  ok(W.length === 5 && W.filter((w) => w.type === 'concrete-200').length === 4 && W.filter((w) => w.type === 'int-100').length === 1 && pick(W, isEast) && near(pick(W, isEast).a[0], 8000, 1), 'drawn with the Wall tool: four Concrete 200 walls round 8000 x 5000 and a stud partition at x = 4000', JSON.stringify(W.map((w) => [w.type, w.a.map(Math.round), w.b.map(Math.round)])));
  // ---- the door, the window, Section A, the sheet: the ops their tools commit, through the page's commit
  const east0 = pick(W, isEast), south0 = pick(W, isSouth);
  await inPage(async ([u, south, east]) => { const O = await import(u); const A = window.bimcraftRes.api; A.commit(O.placeOpening({ wall: south, typeKey: 'door-single', offset: south === null ? 0 : 1000, face: 'left' }), { label: 'Door', verb: 'Placed' }); }, [M('model-ops.js'), south0.guid, east0.guid]);
  await L.settled();
  // the window 2000 from the east wall's start, wherever the Wall tool put its start
  await inPage(async ([u, east]) => { const O = await import(u); window.bimcraftRes.api.commit(O.placeOpening({ wall: east, typeKey: 'win-fixed', offset: 2000 }), { label: 'Window', verb: 'Placed' }); }, [M('model-ops.js'), east0.guid]);
  await L.settled();
  await inPage(async ([u]) => { const RS = await import(u); const S = window.bimcraftPlan.state, lv = S.data.levels.find((l) => l.id === S.level); window.bimcraftRes.api.commit(RS.placeSectionLine({ level: lv.guid, a: [-1000, 2500], b: [10000, 2500] }), { label: 'Section A', verb: 'Placed' }); }, [M('res-sheets.js')]);
  await L.settled();
  const look = await inPage(async ([u]) => { const RS = await import(u); const sl = window.bimcraftRes.state.secs[0]; const d = RS.sectionDir(sl).dir; if (d[1] < 0) window.bimcraftRes.api.commit(RS.changeSectionLine(sl.guid, { look: sl.look === 'left' ? 'right' : 'left' }), { label: 'Section A', verb: 'Flipped' }); return d; }, [M('res-sheets.js')]);
  await L.settled();
  await inPage(async ([u]) => { const V = await import(u); const S = window.bimcraftPlan.state, lv = S.data.levels.find((l) => l.id === S.level), sl = window.bimcraftRes.state.secs[0];
    const first = window.bimcraftViews.state.sheets[0];   // the sheet a new building comes with (BK.74): this test arranges it
    window.bimcraftRes.api.commit(V.saveSheet({ ...(first ? { id: first.id } : {}), number: 'A-101', title: 'In step', paper: 'a3', views: [
      { kind: 'plan', ref: lv.guid, x: 110, y: 200, ratio: 100 }, { kind: 'section', ref: sl.guid, x: 110, y: 110, ratio: 100 }, { kind: 'elevation', ref: 'south', x: 300, y: 110, ratio: 100 },
      { kind: 'schedule', ref: 'walls', x: 300, y: 235, ratio: 0 }, { kind: 'schedule', ref: 'rooms', x: 300, y: 180, ratio: 0 }] }), { label: 'Sheet A-101', verb: 'Saved' }); }, [M('views-model.js')]);
  await L.settled();
  await page.waitForFunction(() => window.bimcraftViews.state.sheets.some((s) => s.views.length === 5), null, { timeout: 20000 });

  /** One pass over the page as it is: every drawing and list, read once. */
  const drawings = () => inPage(async ([uRS, uU]) => {
    const RS = await import(uRS), U = await import(uU);
    const A = window.bimcraftRes.api, S = window.bimcraftPlan.state, kb = A.kb();
    const xs = (poly) => poly.map((q) => q[0]);
    const east = S.data.walls.find((w) => w.typeKey.startsWith('concrete') && Math.abs(w.a[0] - w.b[0]) < 1 && w.a[0] > 5000), south = S.data.walls.find((w) => Math.abs(w.a[1]) < 1 && Math.abs(w.b[1]) < 1);
    const scene = A.sceneFor(S.level);
    const row = scene.walls.find((r) => r.guid === east.guid || r.key === kb + east.id);
    const all = scene.walls.flatMap((r) => xs(r.poly || []));
    const input = A.ask('sheetInput'), opts = A.ask('sheetOpts');
    const el = (ref) => input.elevations.find((e) => e.ref === ref)?.view?.bounds || null;
    const sec = input.sections[0]?.view;
    const cuts = (sec?.cuts || []).filter((c) => c.key === kb + east.id || c.guid === east.guid);
    const cx = cuts.flatMap((c) => c.loops.flatMap(xs));
    const cys = cuts.flatMap((c) => c.loops.map((l) => [Math.min(...l.map((q) => q[1])), Math.max(...l.map((q) => q[1]))])).sort((a, b) => a[0] - b[0]);
    const sch = A.schedules ? A.schedules() : {};
    const table = (ref) => { const s = input.schedules.find((x) => x.ref === ref); return s ? { head: s.head, rows: s.rows, total: s.total } : null; };
    const spec = window.bimcraftViews.state.sheets.find((s) => s.views.length === 5);
    const sheet = RS.composeSheet(spec, input, { ...opts, paper: spec.paper, units: S.units });
    const inBox = (v, it) => (it.pts || it.polys?.flat() || []).filter((q) => q[0] >= v.box[0] - 1e-6 && q[0] <= v.box[2] + 1e-6 && q[1] >= v.box[1] - 1e-6 && q[1] <= v.box[3] + 1e-6);
    const pv = sheet.views.find((v) => v.kind === 'plan');
    // where the plan's lines and fills have their corners on the paper, measured from the view's left edge (mm, to 0.01)
    const planXs = pv ? [...new Set(sheet.items.filter((it) => it.t === 'line' || it.t === 'fill').flatMap((it) => inBox(pv, it)).map((q) => Math.round((q[0] - pv.box[0]) * 100) / 100))] : [];
    // the 3D view's own wall (the mesh the viewer holds), in plan x
    let meshX = null;
    try { const m = A.host.model(), ifc = A.host.ifc(); const P = await import(uRS.replace('res-sheets.js', 'model-plan.js')), MW = await import(uRS.replace('res-sheets.js', 'model-write.js')); const RV = await import(uRS.replace('res-sheets.js', 'res-views.js'));
      const w = new MW.ModelWriter(A.ed().W, A.ed().api, A.ed().mid); const T = RV.modelTriangles(m, P.viewerToPlan(ifc.api.GetCoordinationMatrix(m.modelID), w.storeyWorld(S.level))).find((e) => e.key === kb + east.id);
      if (T) { let a = Infinity, b = -Infinity; for (let i = 0; i < T.tris.length; i += 3) { a = Math.min(a, T.tris[i]); b = Math.max(b, T.tris[i]); } meshX = [a, b]; } } catch (e) { meshX = String(e.message || e); }
    return { units: S.units, eastX: east.a[0], eastLen: east.len, southLen: south.len, eastGuid: east.guid, eastKey: kb + east.id,
      plan: row?.poly ? [Math.min(...xs(row.poly)), Math.max(...xs(row.poly))] : null, planAll: [Math.min(...all), Math.max(...all)], roomLabels: (scene.rooms || []).map((r) => r.label?.[1]).filter(Boolean),
      south: el('south'), north: el('north'), cut: cx.length ? [Math.min(...cx), Math.max(...cx)] : null, cutYs: cys, secWarn: (sec?.warnings || []).length,
      walls: table('walls'), rooms: table('rooms'), panelWalls: sch.walls ? { head: sch.walls.head, rows: sch.walls.rows } : null,
      sheet: { views: sheet.views.map((v) => ({ kind: v.kind, ref: v.ref, box: v.box, ratio: v.ratio })), missing: sheet.missing, texts: sheet.items.filter((i) => i.t === 'text').map((i) => i.s), planXs },
      fmt: { len: (v) => 0, a26: U.fmtLen(26000, S.units), a28: U.fmtLen(28000, S.units), a5: U.fmtLen(5000, S.units), net0: U.fmtArea(26000 * 3000 - 914.4 * 2032 - 1219.2 * 1219.2, S.units), net1: U.fmtArea(28000 * 3000 - 914.4 * 2032 - 1219.2 * 1219.2, S.units),
        r18: U.fmtArea(18480000, S.units), r23: U.fmtArea(23280000, S.units), stud: U.fmtArea(15000000, S.units) },
      win: (() => { const o = S.data.openings.find((x) => x.kind === 'window'); return o ? { offset: o.offset, sill: o.sill, h: o.height, w: o.width, wall: o.wall === east.id } : null; })(), meshX,
      changes: A.ed().changes.length };
  }, [M('res-sheets.js'), M('model-units.js')]);
  const colOf = (t, re) => t.head.findIndex((h) => re.test(h));
  const wallRow = (t, re) => { const r = t.rows.find((x) => re.test(x[0])); return r ? { n: r[colOf(t, /^Count/)], len: r[colOf(t, /^Length/)], net: r[colOf(t, /^Net/)] } : null; };
  const wide = (v) => v.box[2] - v.box[0];
  const view = (D, kind) => D.sheet.views.find((v) => v.kind === kind);
  const has = (D, x) => D.sheet.planXs.some((v) => Math.abs(v - x) <= 0.011);   // by hand: (x + 1600 + 666) / 100, the plan's left edge being Section A's tail at -1600 less the 666 margin

  console.log('== BK.129 before the move');
  const D0 = await drawings();
  const c0 = wallRow(D0.walls, /^Concrete 200/), s0 = wallRow(D0.walls, /^Interior stud 100/);
  ok(D0.win && near(D0.win.w, 1219.2, 0.01) && near(D0.win.h, 1219.2, 0.01) && D0.win.wall, 'the window (1219.2 x 1219.2) is in the east wall');
  ok(D0.plan && near(D0.plan[0], 7900) && near(D0.plan[1], 8100) && near(D0.planAll[0], -100) && near(D0.planAll[1], 8100), 'plan: the east wall between x 7900 and 8100, the building from -100 to 8100', JSON.stringify([D0.plan, D0.planAll]));
  ok(D0.cut && near(D0.cut[0], 7900, 2) && near(D0.cut[1], 8100, 2) && look, 'section A cuts the east wall between x 7900 and 8100', JSON.stringify(D0.cut));
  ok(D0.south && near(D0.south.x0, -100, 2) && near(D0.south.x1, 8100, 2) && near(D0.north.x0, -8100, 2), 'elevations: south from -100 to 8100, north its mirror', JSON.stringify([D0.south, D0.north]));
  ok(c0 && c0.n === '4' && c0.len === D0.fmt.a26 && c0.net === D0.fmt.net0 && s0 && s0.n === '1' && s0.len === D0.fmt.a5 && s0.net === D0.fmt.stud, 'Walls by type: 4 concrete walls ' + D0.fmt.a26 + ' long, net ' + D0.fmt.net0 + ' (26000 x 3000 less the door and the window); the stud wall ' + D0.fmt.a5 + ', ' + D0.fmt.stud, JSON.stringify([c0, s0, D0.walls.head]));
  ok(D0.rooms && D0.rooms.rows.length === 2 && D0.rooms.rows.every((r) => r[colOf(D0.rooms, /^Area/)] === D0.fmt.r18), 'Rooms: two rooms of ' + D0.fmt.r18 + ' (3850 x 4800)', JSON.stringify(D0.rooms));
  ok(D0.sheet.views.length === 5 && !D0.sheet.missing.length && near(wide(view(D0, 'plan')), 135.32, 0.01) && near(wide(view(D0, 'section')), 92, 0.05) && near(wide(view(D0, 'elevation')), 92, 0.05) && has(D0, 103.66) && !has(D0, 113.66), 'sheet A-101 (1:100): the plan 135.32 mm wide (it takes in Section A\'s line and tails, 12200 mm, and its margin), the east wall\'s outer face 103.66 mm from its left edge; section and elevation 92 mm; the two tables', JSON.stringify([D0.sheet.views.map((v) => [v.kind, +wide(v).toFixed(2)]), D0.sheet.missing]));
  ok(D0.sheet.texts.includes(D0.fmt.a26) && D0.sheet.texts.includes(D0.fmt.net0) && D0.sheet.texts.filter((x) => x === D0.fmt.r18).length >= 2, 'the sheet\'s tables read ' + D0.fmt.a26 + ', ' + D0.fmt.net0 + ' and ' + D0.fmt.r18);
  ok(Array.isArray(D0.meshX) && near(D0.meshX[0], 7900, 2) && near(D0.meshX[1], 8100, 2), '3D: the east wall\'s body lies between x 7900 and 8100', JSON.stringify(D0.meshX));
  await L.shot('instep-1-before');

  console.log('== BK.129 the move: the Move tool, the east wall 1000 to the east');
  await inPage((k) => window.bimcraftVis.pick([k]), D0.eastKey); await L.settled();
  await page.mouse.move(10, 10); await page.keyboard.press('Shift+M');
  ok(await inPage(() => window.bimcraftPlan.state.tool) === 'move', 'Shift+M: Move is the tool, the east wall selected');
  await L.mouseClick(6000, 2500); await page.waitForTimeout(200); await L.mouseClick(7000, 2500); await L.settled();
  await page.waitForFunction((g) => { const w = window.bimcraftPlan.state.data.walls.find((x) => x.guid === g); return w && Math.abs(w.a[0] - 9000) < 2; }, D0.eastGuid, { timeout: 30000 }).catch(() => {});
  await page.keyboard.press('Escape'); await L.settled();
  const D1 = await drawings();
  ok(D1.changes === D0.changes + 1, 'one undo step', (D1.changes - D0.changes) + ' steps');
  ok(D1.eastGuid === D0.eastGuid && near(D1.eastX, 9000, 1) && near(D1.eastLen, 5000, 1) && near(D1.southLen, 9000, 1), 'the model: the same wall on x = 9000, 5000 long; the south wall 9000 long', JSON.stringify([D1.eastX, D1.eastLen, D1.southLen]));
  ok(D1.plan && near(D1.plan[0], 8900, 1) && near(D1.plan[1], 9100, 1) && near(D1.planAll[1], 9100, 1) && near(D1.planAll[0], -100, 1), 'plan: the east wall between x 8900 and 9100, the building from -100 to 9100', JSON.stringify([D1.plan, D1.planAll]));
  ok(D1.cut && near(D1.cut[0], 8900, 2) && near(D1.cut[1], 9100, 2), 'section A: its cut face between x 8900 and 9100', JSON.stringify(D1.cut));
  ok(D1.cutYs.length >= 2 && near(D1.cutYs[0][1], D1.win.sill, 2) && near(D1.cutYs[D1.cutYs.length - 1][0], D1.win.sill + 1219.2, 2) && near(D1.win.offset, 2000, 0.01) && D1.win.wall, 'section A: the window\'s gap is in the moved cut face; the window is still 2000 along the wall', JSON.stringify([D1.cutYs, D1.win]));
  ok(near(D1.south.x0, -100, 2) && near(D1.south.x1, 9100, 2) && near(D1.north.x0, -9100, 2) && near(D1.north.x1, 100, 2), 'elevations: south from -100 to 9100, north its mirror', JSON.stringify([D1.south, D1.north]));
  const c1 = wallRow(D1.walls, /^Concrete 200/), s1 = wallRow(D1.walls, /^Interior stud 100/), p1 = D1.panelWalls && wallRow(D1.panelWalls, /^Concrete 200/);
  ok(c1 && c1.n === '4' && c1.len === D1.fmt.a28 && c1.net === D1.fmt.net1 && s1.len === D1.fmt.a5 && s1.net === D1.fmt.stud, 'Walls by type: 4 concrete walls ' + D1.fmt.a28 + ' long, net ' + D1.fmt.net1 + ' (28000 x 3000 less the same door and window); the stud wall unchanged', JSON.stringify([c1, s1]));
  ok(p1 && p1.len === c1.len && p1.net === c1.net, 'the Schedules panel\'s table is the one the sheets get');
  const areas = D1.rooms.rows.map((r) => r[colOf(D1.rooms, /^Area/)]).sort();
  ok(areas.length === 2 && areas.includes(D1.fmt.r18) && areas.includes(D1.fmt.r23), 'Rooms: ' + D1.fmt.r18 + ' (west, as before) and ' + D1.fmt.r23 + ' (east: 4850 x 4800)', JSON.stringify(areas));
  ok(D1.roomLabels.includes(D1.fmt.r23) && D1.roomLabels.includes(D1.fmt.r18), 'plan: the room labels read the same two areas', JSON.stringify(D1.roomLabels));
  ok(D1.sheet.views.length === 5 && !D1.sheet.missing.length && near(wide(view(D1, 'plan')), 135.32, 0.01) && near(wide(view(D1, 'section')), 102, 0.05) && near(wide(view(D1, 'elevation')), 102, 0.05), 'sheet A-101: the section and the elevation are 102 mm wide (1000 mm more at 1:100); the plan view keeps its 135.32 mm (the section line is longer than the building)', JSON.stringify(D1.sheet.views.map((v) => [v.kind, +wide(v).toFixed(2)])));
  ok(has(D1, 113.66) && has(D1, 111.66) && !has(D1, 103.66) && has(D1, 21.66) && has(D0, 21.66), 'on the paper the east wall\'s faces are 111.66 and 113.66 mm from the plan view\'s edge (x 8900 and 9100 at 1:100; 103.66 is gone); the west face stays at 21.66', D1.sheet.planXs.filter((x) => x > 95 && x < 120).join(' '));
  ok(D1.sheet.texts.includes(D1.fmt.a28) && D1.sheet.texts.includes(D1.fmt.net1) && D1.sheet.texts.includes(D1.fmt.r23) && !D1.sheet.texts.includes(D1.fmt.a26) && !D1.sheet.texts.includes(D1.fmt.net0), 'the sheet\'s tables read ' + D1.fmt.a28 + ', ' + D1.fmt.net1 + ' and ' + D1.fmt.r23 + '; ' + D1.fmt.a26 + ' and ' + D1.fmt.net0 + ' are gone');
  ok(Array.isArray(D1.meshX) && near(D1.meshX[0], 8900, 2) && near(D1.meshX[1], 9100, 2), '3D: the wall\'s body lies between x 8900 and 9100', JSON.stringify(D1.meshX));
  ok([D1.eastX + 100, D1.plan[1], D1.cut[1], D1.south.x1, -D1.north.x0, D1.meshX[1]].every((x) => near(x, 9100, 2)), 'one outer face, x = 9100, in the model, the plan, the section, both elevations and 3D');
  // the sheet editor draws the same sheet
  await inPage(() => window.bimcraftViews.api.openSheet(window.bimcraftViews.state.sheets.find((s) => s.views.length === 5).id));
  await page.waitForSelector('[data-sh-stage] svg');
  const stage = await page.textContent('[data-sh-stage]');
  ok(stage.includes(D1.fmt.a28) && stage.includes(D1.fmt.net1) && stage.includes(D1.fmt.r23) && !stage.includes(D0.fmt.net0) && (await page.$$('.bc-sh-ov rect')).length === 5, 'the sheet editor shows A-101 with its five views and the new numbers');
  await L.shot('instep-2-sheet');
  await inPage(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));

  console.log('== BK.129 Undo');
  await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await L.settled();
  const D2 = await drawings();
  ok(near(D2.eastX, 8000, 1) && near(D2.plan[1], 8100, 1) && near(D2.cut[1], 8100, 2) && near(D2.south.x1, 8100, 2) && JSON.stringify(D2.walls.rows) === JSON.stringify(D0.walls.rows) && JSON.stringify(D2.rooms.rows) === JSON.stringify(D0.rooms.rows) && near(D2.meshX[1], 8100, 2), 'Undo: the model, plan, section, elevation, schedules and 3D as before the move');
  ok(JSON.stringify(D2.sheet.views.map((v) => v.box.map((x) => +x.toFixed(3)))) === JSON.stringify(D0.sheet.views.map((v) => v.box.map((x) => +x.toFixed(3)))) && JSON.stringify(D2.sheet.texts) === JSON.stringify(D0.sheet.texts), 'the sheet is the one from before the move: every view box and every word');
  code = L.done();
} catch (e) {
  ok(false, 'stopped: ' + (e.stack || e.message || e)); await L.shot('instep-stopped'); L.done(); code = 1;
} finally { await L.close(); }
process.exit(code);
