/* SPDX-License-Identifier: Apache-2.0 */
/**
 * instep-test.mjs — BK.129 (booklet: "draw once; plans, sections, schedules and sheets stay in step"), session `bk-instep-10`.
 * DOM-free, run by
 *   node bin/test-bimcraft.mjs --instep
 *
 * ONE wall of a small building is moved by ONE command (one undo step). Then, in one pass and from the one model, every
 * drawing that shows it is made again with the real modules and checked against numbers worked out by hand:
 *   the plan        model-walls.js wallOutlines + wall-plan-graphics.js wallPlanGraphics (the plan scene's wall rows)
 *   the section     res-views.js modelTriangles + projectView with wall-section-graphics.js sectionModel (cut faces)
 *   the elevation   res-views.js projectView (south and north), elev-edit.js viewItemsOf (what the elevation view picks)
 *   the schedules   model-schedule.js schedules(snap, loops): walls by type, rooms, doors, windows
 *   the sheet       views-model.js saveSheet / readSheets + res-sheets.js composeSheet (plan, section, elevation, both tables)
 * and Undo puts every one of them back.
 *
 * The building (mm, Level 1, both levels 3000 high; centre lines):
 *   four Concrete 200 walls round (0,0) (8000,0) (8000,5000) (0,5000), an Interior stud 100 wall from (4000,0) to (4000,5000),
 *   a single door (914.4 x 2032) in the south wall 1000 from its start, a fixed window (1219.2 x 1219.2) in the EAST wall 2000 from
 *   its start, Section A along y = 2500 looking north.
 * The move: the east wall 1000 to the east (x 8000 → 9000). By hand:
 *   plan        east wall faces x 7900..8100 → 8900..9100; the south and north walls 8000 → 9000 long (they are joined to it)
 *   section     the east wall's cut face x 7900..8100 → 8900..9100, the window's gap in it kept; the west wall and the partition stay
 *   elevation   the south side is -100..8100 → -100..9100 wide (8200 → 9200); from the north it is mirrored
 *   walls       Concrete 200: 4 walls, 26000 → 28000 long; net area 26000 x 3000 - door - window = 74655490.56 → 80655490.56 mm²
 *               (+ 2 x 1000 x 3000); Interior stud 100: 1 wall, 5000 long, 15000000 mm², unchanged
 *   rooms       west 3850 x 4800 = 18480000 mm² (unchanged); east 3850 x 4800 = 18480000 → 4850 x 4800 = 23280000 mm²,
 *               perimeter 17300 → 19300
 *   sheet 1:100 the plan 92.92 → 103.52 mm wide (the drawing 8200 → 9200 with its margin 3 % + 300 each side), the section and
 *               the elevation 92 → 102 mm wide (500 each side), the tables' cells the schedule's cells
 *
 * Schedule columns are found by their heading (other work adds columns); the text cells are read, not positions in `nums`.
 */
import path from 'node:path';

export async function instepMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const WPG = await import(path.join(APP, 'wall-plan-graphics.js'));
  const WSG = await import(path.join(APP, 'wall-section-graphics.js'));
  const RV = await import(path.join(APP, 'res-views.js'));
  const RS = await import(path.join(APP, 'res-sheets.js'));
  const MP = await import(path.join(APP, 'model-plan.js'));
  const MS = await import(path.join(APP, 'model-schedule.js'));
  const MR = await import(path.join(APP, 'model-rooms.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const EV = await import(path.join(APP, 'elev-edit.js'));
  const { readMaterials } = await import(path.join(APP, 'wall-assemblies.js')).catch(() => ({}));

  // ---- the building
  const src = N.newBuilding({ name: 'In step', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'instep.ifc', now: new Date('2026-11-11T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(src));
  const ed = new IfcEditor(WebIFC, eng);
  const w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const [L1, L2] = OPS.snapshotModel(ed).levels;
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'concrete-200', topLevel: L2.guid, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-100', topLevel: L2.guid }));
  let snap = OPS.snapshotModel(ed);
  const wallAt = (s, f) => s.walls.find(f);
  const south0 = wallAt(snap, (x) => x.a[1] === 0 && x.b[1] === 0), east0 = wallAt(snap, (x) => x.a[0] === 8000 && x.b[0] === 8000);
  ed.modelChange(OPS.placeOpening({ wall: south0.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: east0.guid, typeKey: 'win-fixed', offset: 2000 }));
  ed.modelChange(RS.placeSectionLine({ level: L1.guid, a: [-1000, 2500], b: [10000, 2500] }));
  let sl = RS.readSectionLines(w())[0];
  if (RS.sectionDir(sl).dir[1] < 0) { ed.modelChange(RS.changeSectionLine(sl.guid, { look: sl.look === 'left' ? 'right' : 'left' })); sl = RS.readSectionLines(w())[0]; }
  ed.modelChange(V.saveSheet({ number: 'A-101', title: 'In step', paper: 'a3', views: [
    { kind: 'plan', ref: L1.guid, x: 110, y: 200, ratio: 100 }, { kind: 'section', ref: sl.guid, x: 110, y: 110, ratio: 100 }, { kind: 'elevation', ref: 'south', x: 300, y: 110, ratio: 100 },
    { kind: 'schedule', ref: 'walls', x: 300, y: 230, ratio: 0 }, { kind: 'schedule', ref: 'rooms', x: 300, y: 180, ratio: 0 }] }));

  // ---- every drawing of the model as it is now: one pass over one model (what res-ui.js setInput does in the page)
  const tKey = (k) => k;   // headings as their keys, so a column is found whatever the language
  const col = (s, re) => s.head.findIndex((h) => re.test(h));
  async function drawings() {
    const s = OPS.snapshotModel(ed), wr = w();
    const here = s.walls.filter((x) => x.storey === L1.id), ops = s.openings.filter((o) => o.storey === L1.id);
    // plan
    const outlines = MW.wallOutlines(here.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge, off: x.joinOff })));
    let materials = null; try { materials = readMaterials?.(wr) || null; } catch (e) { materials = null; }
    const loops = OPS.loopsOf(ed, L1.id);
    const rooms = s.derived.spaces.filter((sp) => sp.storey === L1.id).map((sp) => ({ sp, loop: MR.loopAt(loops.rooms, sp.seed) })).filter((r) => r.loop);
    const scene = { walls: WPG.wallPlanGraphics(here, outlines, ops, materials, { detail: 'coarse', cutZ: 1200, scale: 100 }), symbols: [], cut: [], below: [],
      rooms: rooms.map(({ sp, loop }) => ({ key: sp.id, poly: loop.poly, at: sp.seed, label: [sp.name, String(Math.round(loop.area))] })), dims: [] };
    // the 3D model read back, as the page's viewer holds it
    const e2 = await quiet(IfcModel.create)(WebIFC, null), m = await quiet((b) => e2.load(b))(ed.save());
    const w2 = new ModelWriter(WebIFC, e2.api, m.modelID);
    const els = RV.modelTriangles(m, MP.viewerToPlan(e2.api.GetCoordinationMatrix(m.modelID), w2.storeyWorld(L1.id)));
    const sm = WSG.sectionModel(wr, L1.id, m.keyBase || 0);
    const south = RV.projectView(els, { dir: RV.elevationDirs.south, ...sm }), north = RV.projectView(els, { dir: RV.elevationDirs.north, ...sm });
    const line = RS.readSectionLines(wr)[0], sd = RS.sectionDir(line);
    const section = RV.projectView(els, { dir: sd.dir, cut: { o: sd.o }, far: line.depth, ...sm, materials, detail: 'coarse', scale: 100 });
    // schedules
    const sch = MS.schedules(s, new Map([[L1.id, loops]]), { fmtLen: (v) => String(Math.round(v * 100) / 100), fmtArea: (v) => String(Math.round(v * 100) / 100), t: tKey });
    const input = { plans: [{ ref: L1.guid, title: 'Level 1 plan', scene }], elevations: [{ ref: 'south', title: 'South elevation', view: south }], sections: [{ ref: line.guid, title: 'Section A', view: section }],
      schedules: ['walls', 'rooms', 'doors', 'windows'].map((k) => ({ ref: k, title: k, ...sch[k] })) };
    const sheet = RS.composeSheet(V.readSheets(wr)[0], input, { paper: 'a3', units: 'mm', project: 'In step' });
    const F = EV.frameOf('elevation:south', { levels: s.levels });
    return { s, here, outlines, scene, south, north, section, sch, sheet, loops, rooms, key: (x) => (m.keyBase || 0) + x.id, elevItems: EV.viewItemsOf(F, s) };
  }
  const xsOf = (poly) => poly.map((q) => q[0]);
  const wallRow = (D, name) => { const s = D.sch.walls, i = s.rows.findIndex((r) => r[0] === name); return i < 0 ? null : { n: Number(s.rows[i][col(s, /count/)]), len: Number(s.rows[i][col(s, /length/)]), net: Number(s.rows[i][col(s, /net/)]) }; };
  const roomRows = (D) => { const s = D.sch.rooms; return s.rows.map((r) => ({ area: Number(r[col(s, /area/)]), per: Number(r[col(s, /perimeter/)]) })).sort((a, b) => a.area - b.area); };
  const texts = (sheet) => sheet.items.filter((i) => i.t === 'text').map((i) => i.s);
  const viewOf = (sheet, kind, ref) => sheet.views.find((v) => v.kind === kind && (!ref || v.ref === ref));
  const wide = (v) => v.box[2] - v.box[0];
  const cutOf = (D, wall) => D.section.cuts.filter((c) => c.key === D.key(wall) || c.guid === wall.guid);
  const cutX = (D, wall) => { const xs = cutOf(D, wall).flatMap((c) => c.loops.flatMap(xsOf)); return [Math.min(...xs), Math.max(...xs)]; };
  /** The numbers every drawing gives for the east wall and what hangs on it. */
  function facts(D) {
    const east = D.here.find((x) => x.typeKey === 'concrete-200' && near(x.a[0], x.b[0]) && x.a[0] > 5000), south = D.here.find((x) => x.a[1] === 0 && x.b[1] === 0);
    const poly = D.outlines.get ? D.outlines.get(east.guid) : D.outlines[east.guid];
    const row = D.scene.walls.find((r) => r.guid === east.guid || r.key === east.id);
    const planXs = xsOf((row?.poly) || poly?.poly || poly || []);
    const all = D.scene.walls.flatMap((r) => xsOf(r.poly || []));
    const cx = cutX(D, east);
    const ys = cutOf(D, east).flatMap((c) => c.loops.map((l) => [Math.min(...l.map((q) => q[1])), Math.max(...l.map((q) => q[1]))])).sort((a, b) => a[0] - b[0]);
    const ev = D.elevItems.walls.find((x) => x.guid === south.guid);
    return { east, south, eastX: east.a[0], southLen: south.len, plan: [Math.min(...planXs), Math.max(...planXs)], planAll: [Math.min(...all), Math.max(...all)], cut: cx, cutYs: ys,
      southEl: [D.south.bounds.x0, D.south.bounds.x1], northEl: [D.north.bounds.x0, D.north.bounds.x1], pick: ev ? [ev.x0, ev.x1] : null,
      conc: wallRow(D, MW.typeName(MW.wallType('concrete-200'))), stud: wallRow(D, MW.typeName(MW.wallType('int-100'))), rooms: roomRows(D),
      win: D.s.openings.find((o) => o.kind === 'window'), door: D.s.openings.find((o) => o.kind === 'door') };
  }

  console.log('== BK.129 before the move: the drawings agree with the hand numbers');
  const D0 = await drawings(), f0 = facts(D0);
  const DOOR = 914.4 * 2032, WIN = 1219.2 * 1219.2;
  ok(near(f0.door.width, 914.4, 0.01) && near(f0.door.height, 2032, 0.01) && near(f0.win.width, 1219.2, 0.01) && near(f0.win.height, 1219.2, 0.01) && f0.win.wall === f0.east.id, 'the door is 914.4 x 2032 in the south wall, the window 1219.2 x 1219.2 in the east wall', JSON.stringify([f0.door.width, f0.door.height, f0.win.width, f0.win.height]));
  ok(near(f0.plan[0], 7900) && near(f0.plan[1], 8100) && near(f0.planAll[0], -100) && near(f0.planAll[1], 8100), 'plan: the east wall between x 7900 and 8100, the building from -100 to 8100', JSON.stringify([f0.plan, f0.planAll]));
  ok(near(f0.cut[0], 7900, 2) && near(f0.cut[1], 8100, 2), 'section A: the east wall is cut between x 7900 and 8100', JSON.stringify(f0.cut));
  ok(near(f0.southEl[0], -100, 2) && near(f0.southEl[1], 8100, 2) && near(f0.northEl[0], -8100, 2) && near(f0.northEl[1], 100, 2), 'elevations: the south side from -100 to 8100, the north side its mirror', JSON.stringify([f0.southEl, f0.northEl]));
  ok(f0.conc?.n === 4 && near(f0.conc.len, 26000) && near(f0.conc.net, 26000 * 3000 - DOOR - WIN, 1) && f0.stud?.n === 1 && near(f0.stud.len, 5000) && near(f0.stud.net, 15000000, 1), 'wall schedule: 4 concrete walls 26000 long, net 74655490.56 mm²; 1 stud wall 5000 long, 15000000 mm²', JSON.stringify([f0.conc, f0.stud]));
  ok(f0.rooms.length === 2 && near(f0.rooms[0].area, 18480000, 1) && near(f0.rooms[1].area, 18480000, 1) && near(f0.rooms[1].per, 17300), 'room schedule: two rooms of 3850 x 4800 = 18480000 mm² each', JSON.stringify(f0.rooms));
  const p0 = viewOf(D0.sheet, 'plan'), s0 = viewOf(D0.sheet, 'section'), e0 = viewOf(D0.sheet, 'elevation');
  ok(D0.sheet.views.length === 5 && !D0.sheet.missing.length && near(wide(p0), 92.92, 0.01) && near(wide(s0), 92, 0.05) && near(wide(e0), 92, 0.05), 'sheet A-101 at 1:100: the plan 92.92 mm wide, the section and the elevation 92 mm, both tables on it', JSON.stringify([D0.sheet.views.map((v) => [v.kind, +wide(v).toFixed(3)]), D0.sheet.missing]));
  ok(texts(D0.sheet).includes('26000') && texts(D0.sheet).some((x) => near(Number(x), 26000 * 3000 - DOOR - WIN, 1)) && texts(D0.sheet).filter((x) => near(Number(x), 18480000, 1)).length >= 2, 'the sheet\'s tables read 26000, 74655490.56 and 18480000 twice');

  console.log('== BK.129 the move: ONE command, the east wall 1000 to the east');
  const n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: f0.east.guid, dx: 1000, dy: 0 }]));
  ok(ed.changes.length === n0 + 1, 'one undo step');
  const D1 = await drawings(), f1 = facts(D1);
  ok(f1.east.guid === f0.east.guid && near(f1.eastX, 9000) && near(f1.east.len, 5000) && near(f1.southLen, 9000), 'the model: the same wall, now on x = 9000, still 5000 long; the south wall joined to it is 9000 long', JSON.stringify([f1.eastX, f1.east.len, f1.southLen]));
  ok(near(f1.plan[0], 8900) && near(f1.plan[1], 9100) && near(f1.planAll[0], -100) && near(f1.planAll[1], 9100), 'plan: the east wall between x 8900 and 9100, the building from -100 to 9100', JSON.stringify([f1.plan, f1.planAll]));
  ok(near(f1.cut[0], 8900, 2) && near(f1.cut[1], 9100, 2), 'section A: its cut face between x 8900 and 9100', JSON.stringify(f1.cut));
  const part = D1.here.find((x) => x.typeKey === 'int-100'), west = D1.here.find((x) => x.typeKey === 'concrete-200' && near(x.a[0], 0) && near(x.b[0], 0));
  ok(near(cutX(D1, west)[0], -100, 2) && near(cutX(D1, west)[1], 100, 2) && near(cutX(D1, part)[0], 3950, 2) && near(cutX(D1, part)[1], 4050, 2), 'section A: the west wall (-100..100) and the partition (3950..4050) are cut where they were', JSON.stringify([cutX(D1, west), cutX(D1, part)]));
  const gap = (f) => f.cutYs.length >= 2 ? [f.cutYs[0][1], f.cutYs[f.cutYs.length - 1][0]] : null;
  ok(gap(f0) && gap(f1) && near(gap(f1)[0], f1.win.sill, 2) && near(gap(f1)[1], f1.win.sill + 1219.2, 2) && near(gap(f0)[0], gap(f1)[0], 0.01) && near(f1.win.offset, 2000, 0.01) && f1.win.wall === f1.east.id, 'section A: the window\'s gap (sill to head, 1219.2 high) is in the moved cut face; the window is still 2000 along the east wall', JSON.stringify([gap(f0), gap(f1), f1.win.sill]));
  ok(near(f1.southEl[0], -100, 2) && near(f1.southEl[1], 9100, 2) && near(f1.northEl[0], -9100, 2) && near(f1.northEl[1], 100, 2), 'elevations: the south side from -100 to 9100 (9200 wide), the north side its mirror', JSON.stringify([f1.southEl, f1.northEl]));
  ok(f0.pick && f1.pick && near(f1.pick[1] - f1.pick[0], f0.pick[1] - f0.pick[0] + 1000, 1), 'the elevation view\'s own wall (what is picked and dragged there) is 1000 longer', JSON.stringify([f0.pick, f1.pick]));
  ok(f1.conc?.n === 4 && near(f1.conc.len, 28000) && near(f1.conc.net, 28000 * 3000 - DOOR - WIN, 1) && near(f1.conc.net - f0.conc.net, 6000000, 1), 'wall schedule: 4 concrete walls 28000 long, net 80655490.56 mm² (+ 2 x 1000 x 3000)', JSON.stringify(f1.conc));
  ok(f1.stud?.n === 1 && near(f1.stud.len, 5000) && near(f1.stud.net, 15000000, 1), 'wall schedule: the stud wall unchanged');
  ok(f1.rooms.length === 2 && near(f1.rooms[0].area, 18480000, 1) && near(f1.rooms[1].area, 23280000, 1) && near(f1.rooms[1].per, 19300), 'room schedule: the west room 18480000 mm² as before, the east room 4850 x 4800 = 23280000 mm², perimeter 19300', JSON.stringify(f1.rooms));
  ok(D1.sch.doors.rows.length === 1 && D1.sch.windows.rows.length === 1 && JSON.stringify(D1.sch.windows.rows) === JSON.stringify(D0.sch.windows.rows), 'door and window schedules: one of each, the window\'s row as it was');
  ok(D1.scene.rooms.some((r) => r.label[1] === '23280000') && D1.scene.rooms.some((r) => r.label[1] === '18480000') && D1.scene.rooms.length === 2, 'plan: the room labels read 18480000 and 23280000');
  // the sheet
  const p1 = viewOf(D1.sheet, 'plan'), s1 = viewOf(D1.sheet, 'section'), e1 = viewOf(D1.sheet, 'elevation');
  ok(D1.sheet.views.length === 5 && !D1.sheet.missing.length && near(wide(p1), 103.52, 0.01) && near(wide(s1), 102, 0.05) && near(wide(e1), 102, 0.05), 'sheet A-101: the plan 103.52 mm wide, the section and the elevation 102 mm (each 1000 mm more at 1:100)', JSON.stringify(D1.sheet.views.map((v) => [v.kind, +wide(v).toFixed(3)])));
  ok(near((p1.box[0] + p1.box[2]) / 2, 110, 0.01) && near((s1.box[0] + s1.box[2]) / 2, 110, 0.01) && near((e1.box[0] + e1.box[2]) / 2, 300, 0.01) && p1.ratio === 100, 'the views stay where they were put, at 1:100');
  // where the east wall's outer face is drawn on the paper: the plan's right edge less its margin (0.03 x 9200 + 300 = 576 mm → 5.76 mm)
  const inBox = (v, it) => (it.pts || it.polys?.flat() || []).filter((q) => q[0] >= v.box[0] - 1e-6 && q[0] <= v.box[2] + 1e-6 && q[1] >= v.box[1] - 1e-6 && q[1] <= v.box[3] + 1e-6);
  const drawnMaxX = (sheet, v) => Math.max(...sheet.items.filter((it) => it.t === 'line' || it.t === 'fill').flatMap((it) => inBox(v, it)).map((q) => q[0]));
  ok(near(drawnMaxX(D1.sheet, p1), p1.box[2] - 5.76, 0.01) && near(drawnMaxX(D0.sheet, p0), p0.box[2] - 5.46, 0.01), 'on the paper the plan\'s outermost line is the east wall\'s outer face: x = 9100 at 1:100 (5.76 mm in from the view\'s edge)', drawnMaxX(D1.sheet, p1) + ' vs ' + (p1.box[2] - 5.76));
  ok(near(drawnMaxX(D1.sheet, p1) - p1.box[0] - 5.76, 92, 0.01), 'the plan on the sheet is 92 mm from face to face: 9200 mm at 1:100');
  // the tables' cells as numbers (an area can carry a hundredth of a mm² of rounding)
  const nums = (sheet) => texts(sheet).filter((x) => /^-?\d+(\.\d+)?$/.test(x)).map(Number);
  const has = (sheet, v, tol = 1) => nums(sheet).filter((x) => near(x, v, tol)).length;
  const net1 = 28000 * 3000 - DOOR - WIN;
  ok(has(D1.sheet, 28000, 0.01) >= 1 && has(D1.sheet, net1) >= 1 && has(D1.sheet, 23280000) === 2 && has(D1.sheet, 18480000) === 2 && has(D0.sheet, 18480000) === 4 && !has(D1.sheet, 26000, 0.01) && !has(D1.sheet, 26000 * 3000 - DOOR - WIN), 'the sheet\'s tables read 28000, 80655490.56, 23280000 and 18480000 (each in the room table and as the plan\'s room label); 26000 and 74655490.56 are gone', nums(D1.sheet).join(' '));
  // one consistent position everywhere
  ok([f1.eastX + 100, f1.plan[1], f1.cut[1], f1.southEl[1], -f1.northEl[0], f1.planAll[1]].every((x) => near(x, 9100, 2)), 'the same outer face, x = 9100, in the model, the plan, the section and both elevations');

  console.log('== BK.129 Undo: every drawing goes back in one step');
  ed.undo();
  const D2 = await drawings(), f2 = facts(D2);
  ok(near(f2.eastX, 8000) && near(f2.plan[1], 8100) && near(f2.cut[1], 8100, 2) && near(f2.southEl[1], 8100, 2) && near(f2.conc.len, 26000) && near(f2.conc.net, f0.conc.net, 1e-6) && near(f2.rooms[1].area, 18480000, 1), 'Ctrl+Z: the model, plan, section, elevation and schedules read as before the move');
  const v2 = D2.sheet.views.map((v) => v.box.map((x) => +x.toFixed(4)).join()), v0 = D0.sheet.views.map((v) => v.box.map((x) => +x.toFixed(4)).join());
  ok(JSON.stringify(v2) === JSON.stringify(v0) && JSON.stringify(texts(D2.sheet)) === JSON.stringify(texts(D0.sheet)), 'the sheet is the one from before the move: every view box and every word');
  ed.redo();
  const f3 = facts(await drawings());
  ok(near(f3.eastX, 9000) && near(f3.cut[1], 9100, 2) && near(f3.conc.len, 28000) && near(f3.rooms[1].area, 23280000, 1), 'Redo: moved again everywhere');

  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
