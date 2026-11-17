/* SPDX-License-Identifier: Apache-2.0 */
/**
 * schedules-test.mjs — schedule set-ups, the office standard, room finishes, exports, figure links, the specification and the
 * assistant tools (booklet rows BK.39, BK.29, BK.149, BK.61, BK.142, BK.47; session bk-r3-schedules-10). DOM-free:
 *   node bin/test-bimcraft.mjs --schedules
 * A real IFC model made by the app's own operations. Every expected value is worked out in the comment beside it.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

export async function schedulesMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 1) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const I18 = await import(path.join(APP, 'i18n.js'));
  I18.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const t = I18.t;
  const SD = await import(path.join(APP, 'schedule-data.js'));
  const SL = await import(path.join(APP, 'schedule-layouts.js'));
  const FM = await import(path.join(APP, 'finishes-model.js'));
  const SP = await import(path.join(APP, 'spec-model.js'));
  const SA = await import(path.join(APP, 'schedule-agents.js'));
  const AG = await import(path.join(APP, 'agents.js'));
  const DH = await import(path.join(APP, 'defaults-hook.js'));
  const DT = await import(path.join(APP, 'doc-template.js'));
  const DF = await import(path.join(APP, 'doc-fields.js'));
  const TAGS = await import(path.join(APP, 'tags.js'));
  const TB = await import(path.join(APP, 'tables/table.js'));
  const QF = await import(path.join(APP, 'quantities/finishes.js'));

  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Schedules', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 's.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const [L1, L2] = OPS.snapshotModel(ed).levels;
  const T = 114.3;   // int-2x4: 12.7 + 88.9 + 12.7
  const box = (storey, x0, y0, x1, y1) => ed.modelChange(OPS.drawWalls({ storey, segs: [{ a: [x0, y0], b: [x1, y0] }, { a: [x1, y0], b: [x1, y1] }, { a: [x1, y1], b: [x0, y1] }, { a: [x0, y1], b: [x0, y0] }], typeKey: 'int-2x4', height: 2700 }));
  // Level 1: a 5000 x 4000 room (centre lines); Level 2: a 3000 x 3000 room
  box(L1.guid, 0, 0, 5000, 4000);
  box(L2.guid, 0, 0, 3000, 3000);
  let snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((x) => x.storey === L1.id && near(x.a[1], 0) && near(x.b[1], 0));
  const east = snap.walls.find((x) => x.storey === L1.id && near(x.a[0], 5000) && near(x.b[0], 5000));
  const south2 = snap.walls.find((x) => x.storey === L2.id && near(x.a[1], 0) && near(x.b[1], 0));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'win-fixed', offset: 1500, width: 1000, height: 1000, sill: 900, hand: 'a', face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south2.guid, typeKey: 'door-single', offset: 500, width: 800, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  snap = OPS.snapshotModel(ed);
  const doors = snap.openings.filter((o) => o.kind === 'door'), win = snap.openings.find((o) => o.kind === 'window');
  const d1 = doors.find((o) => o.storey === L1.id), d2 = doors.find((o) => o.storey === L2.id);
  ok(doors.length === 2 && win && snap.derived.spaces.length === 2, 'the model: two rooms on two levels, two doors, one window', [doors.length, snap.derived.spaces.length]);
  // a fire rating on the Level 1 door (the standard set) and an ironmongery tag on both doors
  ed.modelChange((e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { w.upsertPset(d1.id, 'Pset_DoorCommon', [['FireRating', 'IFCLABEL', 'FD30']]); return { id: d1.id, ids: [d1.id], made: new Map() }; }); });
  ed.modelChange(TAGS.saveDefsOp([{ name: 'Ironmongery', kind: 'text', values: [], classes: ['IfcDoor'], note: '' }]));
  ed.modelChange(TAGS.tagOp([d1.guid], { Ironmongery: 'Set A' }));
  ed.modelChange(TAGS.tagOp([d2.guid], { Ironmongery: 'Set B' }));

  // ================================================================================================ BK.39 / BK.149 the engine on the model
  console.log('== BK.39 the schedules as tables: columns, numbers, elements');
  let m = SD.modelSchedules(ed, { units: 'mm', t });
  SD.withTables(m.all, m.snap);
  const dt = m.all.doors.table;
  ok(dt && dt.cols.map((c) => c.id).join() === 'mark,type,width,height,level,wall' && dt.cols[4].role === 'level' && dt.cols[4].order.join() === 'Level 1,Level 2' && dt.cols[2].sum === false, 'doors: mark, type, width, height, level, wall; level is the grouping column in level order; widths do not add up', dt?.cols);
  ok(dt.ids.length === 2 && dt.ids.flat().sort().join() === [d1.id, d2.id].sort().join() && dt.vals.map((v) => v[2]).sort().join() === '800,900', 'each door row names its door and carries its width as a number');
  const wt = m.all.walls.table, dj = wt.cols.findIndex((c) => c.id === 'deductions');
  ok(wt.ids[0].length === 8 && wt.cellIds[0][dj].slice().sort().join() === [d1.id, d2.id, win.id].sort().join(), 'walls by type: the row is its 8 walls; the deductions figure is the two doors and the window (BK.142)', wt.cellIds[0]);
  ok(['roomfinishes', 'wallfinishes', 'zonefinishes', 'finishtotals', 'floors', 'finishes', 'rooms', 'windows'].every((k) => m.all[k]?.table), 'every schedule that is rows of elements has a table');
  // Layers comes from the one per-layer function (layer-quantities.js): int-2x4 has three layers; the stud layer is 88.9 thick on the walls' net area
  // net side area of all 8 walls: 30 000 x 2700 = 81 000 000 less 1 890 000 + 1 680 000 + 1 000 000 = 76 430 000 mm2 → 76 430 000 x 88.9 = 6.795 m3
  const ly = m.all.layers?.table, vj = ly ? ly.cols.findIndex((c) => c.id === 'volume') : -1, studs = ly ? ly.vals.find((v, i) => Math.abs(ly.vals[i][ly.cols.findIndex((c) => c.id === 'thickness')] - 88.9) < 0.01) : null;
  ok(ly && ly.rows.length === 3 && ly.cols[vj].kind === 'volume' && studs && near(studs[vj], 76430000 * 88.9, 1e5) && ly.cols.find((c) => c.id === 'net').sum === false, 'Layers (the per-layer quantity function of the layered types) is a schedule like the others: the stud layer is 6.79 m3; only volumes add up', studs);

  console.log('== BK.149 the office standard, whoever sets the schedule up');
  const ctxOf = (standard = {}) => ({ w: W(), units: 'mm', t, project: 'Schedules', standard });
  let L = SL.layOut(dt, {}, ctxOf());
  ok(L.laid.lines.map((l) => l.kind).join() === 'row,row,total' && L.laid.lines[2].cells[0] === m.all.doors.total[0] && Object.keys(L.from).length === 0, 'no standard, nothing stated: the schedule as it always was');
  const STD = { group: 'level', totals: 'groups', title: '{project}: {schedule}', headings: 'upper' };
  L = SL.layOut(dt, {}, ctxOf(STD));
  ok(L.laid.lines.map((l) => l.kind).join() === 'group,row,subtotal,group,row,subtotal,total' && L.laid.lines[0].label === 'LEVEL: Level 1' && L.laid.lines[3].label === 'LEVEL: Level 2' && L.laid.title === 'Schedules: Doors' && L.laid.head[0] === 'MARK' && Object.keys(L.from).sort().join() === 'groupBy,headings,title,totals', 'the standard groups by level with subtotals, titles it and puts the headings in capitals', [L.laid.lines.map((l) => l.kind), L.laid.title]);
  ok(L.laid.lines[2].cells[0] === 'Subtotal (1)' && L.laid.lines[6].cells[0] === 'Total (2)' && L.laid.lines[2].ids.join() === String(d1.id), 'a subtotal of one door on each level, a total of two; the subtotal names its door');
  L = SL.layOut(dt, { groupBy: null, totals: 'none' }, ctxOf(STD));
  ok(L.laid.lines.map((l) => l.kind).join() === 'row,row' && !L.from.groupBy && !L.from.totals && L.from.title && L.from.headings, 'a set-up that states its own grouping and totals keeps them; the standard still gives the title and headings');
  // through the Default Policies hook (the add-on's provider): the same result with no argument
  DH.setDefaults({ get: (id) => ({ 'all.schedule.group': 'level', 'all.schedule.totals': 'groups', 'all.schedule.title': '{project}: {schedule}', 'all.schedule.headings': 'upper' }[id]), source: () => 'from your Default Policies' });
  ok(JSON.stringify(SL.officeStandard()) === JSON.stringify(STD), 'the office standard is read from the Default Policies hook: all.schedule.group / totals / title / headings');
  let m2 = SD.modelSchedules(ed, { units: 'mm', t });
  SD.withTables(m2.all, m2.snap);
  SD.underStandard(m2.all, { units: 'mm', t, project: 'Schedules' });
  ok(m2.all.doors.head[0] === 'MARK' && m2.all.doors.rows[0][0] === 'LEVEL: Level 1' && m2.all.doors.rows.length === 6 && m2.all.doors.total[0] === 'Total (2)' && m2.all.doors.plain.rows.length === 2, 'with a standard set, the plain Doors schedule itself is laid out by it (the panel, the sheets and the CSV take it)', m2.all.doors.rows);
  ok(m2.all.walls.rows[0][0].startsWith('Wall type'.toUpperCase()) === false && m2.all.walls.head[0] === m2.all.walls.head[0].toUpperCase(), 'walls by type has no level column: not grouped, headings in capitals');
  DH.setDefaults(null);
  SD.underStandard(m2.all, { units: 'mm', t, project: 'Schedules' });
  ok(m2.all.doors.rows.length === 2 && m2.all.doors.head[0] === 'Mark' && !m2.all.doors.plain, 'the standard switched off: the same schedule object is as it was');
  ok(Object.keys(SL.officeStandard()).length === 0, 'no add-on: no standard');

  console.log('== BK.61 property columns: fire rating and ironmongery, read from the elements');
  const P = SL.withProps(dt, [{ name: 'fire rating' }, { name: 'Ironmongery' }, { name: 'Acoustic rating' }], W(), { yes: 'Yes', no: 'No', varies: 'varies' });
  const r1 = P.table.rows[dt.ids.findIndex((x) => x[0] === d1.id)], r2 = P.table.rows[dt.ids.findIndex((x) => x[0] === d2.id)];
  ok(P.table.head.slice(-3).join() === 'fire rating,Ironmongery,Acoustic rating' && r1.slice(-3).join() === 'FD30,Set A,' && r2.slice(-3).join() === ',Set B,', 'door 1: FD30 and Set A; door 2: no rating and Set B; nobody has an acoustic rating', [r1.slice(-3), r2.slice(-3)]);
  ok(P.empty.join() === 'Acoustic rating' && P.read['fire rating'] === 'Pset_DoorCommon.FireRating' && P.read.Ironmongery === 'CadCraft_Tags.Ironmongery', 'it says which column found nothing and which property each column read', P.read);

  // ================================================================================================ BK.29 finishes
  console.log('== BK.29 room finishes: areas, tiles with cuts, substrate volumes');
  const room1 = m.snap.derived.spaces.find((s) => s.storey === L1.id), room2 = m.snap.derived.spaces.find((s) => s.storey === L2.id);
  const rooms = FM.roomInputs(m.snap, m.loopsFor);
  const R1 = rooms.find((r) => r.key === room1.guid);
  // inside the wall faces: 5000 - 114.3 = 4885.7 by 4000 - 114.3 = 3885.7; walls 2700 high in a 3000 level: finished to 2700
  ok(R1 && R1.edges.length === 4 && R1.edges.every((e) => e.wall && e.height === 2700) && near(R1.edges.reduce((s, e) => s + e.length, 0), 2 * (4885.7 + 3885.7), 0.5), 'room 1: four stretches of wall, 17 542.8 mm round, each finished to its wall\'s 2700', R1?.edges.map((e) => e.length));
  const eS = R1.edges.find((e) => e.wall === south.guid), eE = R1.edges.find((e) => e.wall === east.guid);
  // the door starts 1000 along the south wall's centre line from x = 0; the room's face starts at x = 57.15: 1000 - 57.15 = 942.85 along the stretch
  ok(eS.openings.length === 1 && near(eS.openings[0].offset, 942.85, 0.5) && eS.openings[0].door && eE.openings.length === 1 && near(eE.openings[0].sill, 900) && !eE.openings[0].door, 'the door sits 942.85 along the south stretch; the window is in the east stretch, sill 900');
  const finDoc = {
    format: 'cadcraft-finishes', version: 1,
    finishes: [
      { id: 'por', name: 'Porcelain 600', kind: 'tile', thickness: 10, tile: { length: 600, width: 600, joint: 0, waste: 10 }, substrate: { name: 'Screed', thickness: 50 } },
      { id: 'paint', name: 'Emulsion paint', kind: 'coat', thickness: 0 },
      { id: 'wt', name: 'Wall tile 300', kind: 'tile', thickness: 8, tile: { length: 300, width: 300, joint: 0, waste: 5 }, substrate: { name: 'Backing board', thickness: 12 } },
    ],
    rooms: { [room1.guid]: { floor: 'por', walls: 'paint', ceiling: 'paint', skirting: { name: 'Timber 100', height: 100 } }, [room2.guid]: { floor: 'por' } },
    zones: [{ id: 'z1', name: 'Dado', room: room1.guid, surface: 'wall', finish: 'wt', from: 0, to: 1200, walls: [east.guid] }],
  };
  let threw = null;
  try { FM.saveFinishesOp({ ...finDoc, zones: [{ ...finDoc.zones[0], to: 0 }] }); } catch (e) { threw = e; }
  ok(threw && threw.key === 'fin.err.zone_band' && /larger than/.test(t(threw.key, threw.fill)), 'a wrong document is refused with its reason, nothing dropped silently', threw?.key);
  ed.modelChange(FM.saveFinishesOp(finDoc), { label: 'finishes' });
  const back = FM.readFinishes(W());
  ok(back.finishes.length === 3 && back.rooms[room1.guid].walls === 'paint' && back.zones[0].walls[0] === east.guid, 'the finishes are kept in the file and read back');
  const cov = W().readPset(room1.id, 'Pset_SpaceCoveringRequirements');
  ok(cov && cov.FloorCovering === 'Porcelain 600' && cov.WallCovering === 'Emulsion paint' && cov.CeilingCovering === 'Emulsion paint' && cov.SkirtingBoard === 'Timber 100' && near(Number(cov.FloorCoveringThickness) * W().unitMm, 10, 0.01), 'the room also carries the standard Pset_SpaceCoveringRequirements for other programs', cov);
  m = SD.modelSchedules(ed, { units: 'mm', t });
  SD.withTables(m.all, m.snap);
  const D = m.all.data || SD.finishSet(W(), m.snap, m.loopsFor, { units: 'mm', t }).data;
  const rowsOf = (room, surface, zone = null) => D.result.rows.filter((r) => r.room === room && r.surface === surface && r.zone === zone);
  // floor 1: 4885.7 x 3885.7 = 18 984 364.49 mm2; 600 tiles: 9 across (8 whole + 85.7 cut), 7 up (6 whole + 285.7 cut): 48 whole, 63 - 48 = 15 cut; order 63 x 1.1 = 69.3 → 70
  const f1 = rowsOf(room1.guid, 'floor')[0];
  ok(near(f1.net, 4885.7 * 3885.7, 5) && f1.tiles.whole === 48 && f1.tiles.cut === 15 && f1.tiles.order === 70 && near(f1.substrate.volume, 4885.7 * 3885.7 * 50, 500), 'floor of room 1: 18.98 m2, 48 whole + 15 cut tiles of 600, 70 to order, 0.949 m3 of screed', [f1.net, f1.tiles]);
  // floor 2: 2885.7 square = 8 327 264.49; 5 x 5 cells: 4 x 4 = 16 whole, 9 cut; 25 x 1.1 = 27.5 → 28
  const f2 = rowsOf(room2.guid, 'floor')[0];
  ok(near(f2.net, 2885.7 * 2885.7, 5) && f2.tiles.whole === 16 && f2.tiles.cut === 9 && f2.tiles.order === 28, 'floor of room 2: 8.33 m2, 16 whole + 9 cut, 28 to order', f2.tiles);
  // east stretch 3885.7 long: the dado 0..1200 = 4 662 840 gross; the window (sill 900) has 300 of its height in the band: 1000 x 300 = 300 000 out: 4 362 840 net
  const dado = rowsOf(room1.guid, 'wall', 'z1')[0];
  ok(near(dado.gross, 3885.7 * 1200, 2) && near(dado.deductions, 300000, 2) && near(dado.net, 3885.7 * 1200 - 300000, 2) && dado.openings.join() === String(win.id), 'the dado zone on the east wall: 4.66 gross, 0.30 window, 4.36 net', [dado.gross, dado.deductions]);
  // 300 tiles on 3885.7 x 1200: 13 columns (12 whole + 285.7 cut) x 4 rows = 52 cells. The window is 1500 along the wall's centre line, so
  // 1500 - 57.15 = 1442.85 along the stretch, to 2442.85, from 900 to 1200 (the top row): columns 4 (1200..1500) to 8 (2400..2700):
  // column 4 keeps 1200..1442.85 → cut, columns 5, 6, 7 are wholly window → gone, column 8 keeps 2442.85..2700 → cut.
  // whole = 12 x 4 - 5 = 43; cut = 4 (the end column) + 2 = 6; order 49 x 1.05 = 51.45 → 52
  ok(dado.tiles.whole === 43 && dado.tiles.cut === 6 && dado.tiles.order === 52 && near(dado.substrate.volume, dado.net * 12, 50), 'its tiles: 43 whole, 6 cut (the end column and the two beside the window), 52 to order; backing board 0.052 m3', dado.tiles);
  // paint on the east stretch above the dado: 1200..2700 = 3885.7 x 1500 = 5 828 550, less the window's other 700: 700 000 → 5 128 550
  const pe = rowsOf(room1.guid, 'wall').find((r) => r.wall === east.guid);
  ok(pe.from === 1200 && pe.to === 2700 && near(pe.net, 3885.7 * 1500 - 700000, 2), 'paint on the east wall covers 1200 to 2700: 5.13 m2 net');
  // paint on the south stretch: 4885.7 x 2700 = 13 191 390 less the door 900 x 2100 = 1 890 000 → 11 301 390
  const ps = rowsOf(room1.guid, 'wall').find((r) => r.wall === south.guid);
  ok(near(ps.net, 4885.7 * 2700 - 1890000, 2) && ps.openings.join() === String(d1.id), 'paint on the south wall: 13.19 gross less the 1.89 door = 11.30 m2');
  // skirting: 17 542.8 round less the 900 door = 16 642.8
  ok(near(rowsOf(room1.guid, 'skirting')[0].net, 2 * (4885.7 + 3885.7) - 900, 0.5), 'skirting: 17.54 m of wall less the 0.9 m door = 16.64 m');
  ok(D.result.rows.every((r) => Math.abs(r.gross - r.deductions - r.net) < 1e-6), 'gross less deductions is the net on every finish row');

  console.log('== BK.29 / BK.39 the finish schedules');
  const RF = m.all.roomfinishes, WF = m.all.wallfinishes, ZF = m.all.zonefinishes, FT = m.all.finishtotals;
  ok(RF.title === 'Finishes by room' && RF.rows.length === 2 && RF.rows[0][3] === 'Porcelain 600' && RF.rows[0][4] === '18.98 m²' && RF.rows[0][5] === 'Emulsion paint, Wall tile 300' && RF.rows[0][9] === 'Timber 100' && RF.rows[1][5] === '', 'Finishes by room: room 101 with its floor, wall and ceiling finishes and skirting; room 201 floor only', RF.rows);
  // wall area of room 1 = all four stretches to 2700 less door and window: 17 542.8 x 2700 - 1 890 000 - 1 000 000 = 44 475 560
  ok(near(RF.vals[0][6], 17542.8 * 2700 - 2890000, 5) && RF.ids[0].join() === String(room1.id) && RF.cellIds[0][6].length === 4, 'its wall area is 44.48 m2; the row is the room, the wall-area figure its four walls (BK.142)', RF.vals[0][6]);
  ok(WF.rows.length === 5 && WF.cols.map((c) => c.id).join() === 'room,wall,finish,zone,from,to,length,gross,deductions,net,whole,cut,order' && WF.rows.some((r) => r[3] === 'Dado' && r[10] === '43' && r[11] === '6' && r[12] === '52'), 'Finishes by wall: five stretches and bands; the dado row shows 43 whole, 6 cut, 52 to order', WF.rows.map((r) => r.slice(2, 4)));
  const wj = WF.cols.findIndex((c) => c.id === 'deductions'), dadoRow = WF.rows.findIndex((r) => r[3] === 'Dado');
  ok(WF.ids[dadoRow].join() === String(east.id) && WF.cellIds[dadoRow][wj].join() === String(win.id), 'the dado row is the east wall; its deductions figure is the window');
  ok(ZF.rows.length === 1 && ZF.rows[0][0] === 'Dado' && ZF.rows[0][2] === 'Wall' && ZF.rows[0][3] === 'Wall tile 300' && ZF.rows[0][8] === 'Backing board', 'Finishes by zone: the dado, on a wall, in wall tile on backing board', ZF.rows[0]);
  const por = FT.rows.find((r) => r[0] === 'Porcelain 600');
  // porcelain: 48 + 16 = 64 whole, 15 + 9 = 24 cut, 88 x 1.1 = 96.8 → 97 to order; screed (18 984 364.49 + 8 327 264.49) x 50 = 1.3656 m3
  ok(por && por[3] === '64' && por[4] === '24' && por[5] === '97' && por[6] === 'Screed' && /^1\.37 m³$/.test(por[7]), 'Finish quantities: porcelain 64 whole + 24 cut, 97 to order, 1.37 m3 of screed', por);
  ok(/Tiles are laid as a grid from one corner/.test(FT.note) && /offcuts are not reused/.test(FT.note), 'the schedules state how tiles are counted');

  // ================================================================================================ BK.61 the assistant tools
  console.log('== BK.61 the assistant sets up, the engine fills (tools called as an assistant would)');
  const tools = new Map(AG.modelTools({ ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) }).map((d) => [d.name, d]));
  ok(['schedule_list', 'schedule_setup', 'schedule_arrange', 'schedule_read', 'schedule_export', 'schedule_remove', 'finishes_get', 'finishes_set'].every((n) => tools.has(n)), 'the eight tools are among BimCraft\'s assistant tools');
  ok(['schedule_setup', 'schedule_arrange', 'schedule_remove', 'finishes_set'].every((n) => tools.get(n).group === 'edit') && tools.get('schedule_export').group === 'export' && ['schedule_list', 'schedule_read', 'finishes_get'].every((n) => tools.get(n).group === 'read'), 'reading, editing and exporting are separate permission groups');
  const call = (name, a = {}) => tools.get(name).run(a);
  const list = await call('schedule_list');
  ok(list.schedules.some((s) => s.key === 'doors' && s.rows === 2 && s.columns.find((c) => c.id === 'level')?.group_as === 'level') && list.schedules.some((s) => s.key === 'roomfinishes') && list.setups.length === 0 && list.office_standard === null, 'schedule_list: doors (2 rows, level groups it), the finish schedules, no set-up yet, no office standard');
  // "door schedule by floor, with fire rating and ironmongery"
  const undoBefore = ed.changes.length;
  const made = await call('schedule_setup', { name: 'Door schedule by floor', source: 'doors', group_by: 'level', columns: ['mark', 'type', 'width', 'height', 'fire rating', 'ironmongery'] });
  ok(made.saved && made.id === 'door-schedule-by-floor' && made.grouped_by === 'level' && made.columns.map((c) => c.heading).join() === 'Mark,Type,Width (mm),Height (mm),fire rating,ironmongery', '"door schedule by floor, with fire rating and ironmongery": saved, grouped by level, with the two property columns', made.columns);
  ok(made.lines.map((l) => l.kind).join() === 'group,row,group,row,total' && made.lines[0].cells[0] === 'Level: Level 1' && made.lines[1].cells.slice(-2).join() === 'FD30,Set A' && made.lines[3].cells.slice(-2).join() === ',Set B', 'filled by the engine: Level 1 door FD30 / Set A, Level 2 door no rating / Set B', made.lines.map((l) => l.cells));
  ok(made.lines[1].elements.join() === d1.guid && made.lines[0].elements.join() === d1.guid && made.lines[4].elements.slice().sort().join() === [d1.guid, d2.guid].sort().join() && made.properties_read['fire rating'] === 'Pset_DoorCommon.FireRating', 'every line names its elements by GlobalId; the answer says which property was read (BK.142)');
  ok(ed.changes.length === undoBefore + 1 && SL.readSetups(W()).length === 1, 'one undo step; the set-up is in the file');
  DH.setDefaults({ get: (id) => ({ 'all.schedule.totals': 'groups', 'all.schedule.headings': 'upper', 'all.schedule.group': 'type' }[id]), source: () => '' });
  let rd = await call('schedule_read', { id: 'door-schedule-by-floor' });
  ok(rd.grouped_by === 'level' && rd.from_office_standard.sort().join() === 'headings,totals' && rd.lines.map((l) => l.kind).join() === 'group,row,subtotal,group,row,subtotal,total' && rd.columns[0].heading === 'MARK', 'read under an office standard: the set-up keeps its grouping by level; totals and heading case come from the office', [rd.from_office_standard, rd.lines.map((l) => l.kind)]);
  const arr = await call('schedule_arrange', { id: 'Door schedule by floor', totals: 'grand', headings: { columns: { mark: 'Door no.' } }, title: '{schedule} ({project})' });
  ok(arr.lines.map((l) => l.kind).join() === 'group,row,group,row,total' && arr.columns[0].heading === 'DOOR NO.' && arr.title === 'Door schedule by floor (Schedules)' && arr.from_office_standard.join() === 'headings', 'schedule_arrange: one grand total, a renamed column, a title; only the heading case is still the office\'s', [arr.title, arr.from_office_standard]);
  DH.setDefaults(null);
  rd = await call('schedule_read', { source: 'walls' });
  ok(rd.lines[0].element_count === 8 && rd.lines[0].figures.deductions.length === 3 && rd.lines[0].figures.deductions.includes(win.guid), 'schedule_read of a plain schedule: the walls row has 8 elements, its deductions figure the 3 openings');
  rd = await call('schedule_read', { source: 'Finishes by room', totals: 'grand' });
  ok(rd.source === 'roomfinishes' && rd.lines.length === 3 && rd.lines[2].kind === 'total', 'a schedule is found by its title too; a layout that is not saved can be given');
  let err = null; try { await call('schedule_setup', { name: 'x', source: 'nope' }); } catch (e) { err = e; }
  ok(err && err.code === 'not_found' && err.next.length, 'an unknown schedule is refused with what to try');
  err = null; try { await call('schedule_read', { source: 'doors', group_by: 'colour' }); } catch (e) { err = e; }
  ok(err && err.code === 'invalid_argument', 'a grouping the schedule has no column for is refused');

  console.log('== BK.39 exports: CSV, Excel, tab-separated for Google Sheets');
  const csv = await call('schedule_export', { id: 'door-schedule-by-floor', format: 'csv' });
  const cl = csv.text.split(/\r?\n/);
  ok(csv.file === 'door schedule by floor (schedules).csv' && cl[0] === 'Door no.,Type,Width (mm),Height (mm),fire rating,ironmongery' && cl[1].startsWith('Level: Level 1') && /FD30,Set A$/.test(cl[2]) && /^Total \(2\)/.test(cl[5]), 'CSV: headings, group lines, rows, the total', cl);
  const tsv = await call('schedule_export', { id: 'door-schedule-by-floor', format: 'sheets' });
  ok(tsv.text.split('\n')[0].split('\t').length === 6 && /paste/.test(tsv.how) && /Nothing was sent to Google/.test(tsv.how) && !tsv.downloaded, 'Google Sheets: tab-separated text to paste, and it says nothing is sent to Google');
  let got = null;
  const tools2 = new Map(SA.scheduleTools({ ed: () => ed, apply: async (label, op) => ed.modelChange(op), units: () => 'm', download: (name, data, type) => { got = { name, data, type }; } }).map((d) => [d.name, d]));
  const x = await tools2.get('schedule_export').run({ source: 'walls', format: 'xlsx' });
  const unzip = (bytes) => { const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), out = {}; let p = 0; while (p + 4 <= bytes.length && dv.getUint32(p, true) === 0x04034b50) { const method = dv.getUint16(p + 8, true), cs = dv.getUint32(p + 18, true), nl = dv.getUint16(p + 26, true), xl = dv.getUint16(p + 28, true); const name = new TextDecoder().decode(bytes.subarray(p + 30, p + 30 + nl)), body = bytes.subarray(p + 30 + nl + xl, p + 30 + nl + xl + cs); out[name] = (method === 8 ? zlib.inflateRawSync(body) : Buffer.from(body)).toString('utf8'); p += 30 + nl + xl + cs; } return out; };
  const z = unzip(got.data);
  // walls by type in metres: 8 walls; length 18 000 + 12 000 = 30 000 mm = 30 m; gross 30 000 x 2700 = 81 m2; deductions 1.89 + 1.68 + 1.0 = 4.57; net 76.43
  ok(x.downloaded && got.name === 'walls by type.xlsx' && z['xl/worksheets/sheet1.xml'] && z['xl/worksheets/sheet2.xml'] && /<v>30<\/v>/.test(z['xl/worksheets/sheet1.xml']) && /<v>81<\/v>/.test(z['xl/worksheets/sheet1.xml']) && /<v>4\.57<\/v>/.test(z['xl/worksheets/sheet1.xml']) && /<v>76\.43<\/v>/.test(z['xl/worksheets/sheet1.xml']), 'Excel: numbers are numbers in the unit shown: 30 m, 81 m2 gross, 4.57 deducted, 76.43 net', z['xl/worksheets/sheet1.xml']?.slice(0, 900));
  ok(/<dc:creator>BimCraft<\/dc:creator>/.test(z['docProps/core.xml']) && z['xl/worksheets/sheet2.xml'].includes(south.guid.replace(/&/g, '&amp;').replace(/</g, '&lt;')) && /name="Elements"/.test(z['xl/workbook.xml']), 'the workbook is BimCraft\'s through the shared writer; its second sheet names the elements by GlobalId');
  const rm = await call('schedule_remove', { id: 'door-schedule-by-floor' });
  ok(rm.left === 0 && SL.readSetups(W()).length === 0, 'schedule_remove takes the set-up out of the file');
  ed.undo();
  ok(SL.readSetups(W()).length === 1, 'undo brings it back');

  console.log('== BK.29 finishes through the tools');
  const fg = await call('finishes_get');
  ok(fg.finishes.length === 3 && fg.rooms.length === 2 && fg.rooms.find((r) => r.guid === room1.guid).stretches.length === 4 && fg.rooms.find((r) => r.guid === room1.guid).finishes.floor === 'por' && fg.rooms.find((r) => r.guid === room1.guid).stretches[0].height === 2700 && fg.zones.length === 1, 'finishes_get: the three types, the rooms with their walls and finishes, the zone');
  const fs1 = await call('finishes_set', { rooms: { [room2.guid]: { walls: 'paint', ceiling: 'paint' } }, zones: [{ id: 'z2', name: 'Shower floor', room: room2.guid, surface: 'floor', finish: 'wt', area: 2e6 }] });
  ok(fs1.rooms_with_finishes === 2 && fs1.zones === 2 && FM.readFinishes(W()).rooms[room2.guid].floor === 'por' && FM.readFinishes(W()).rooms[room2.guid].walls === 'paint', 'finishes_set adds to what is there: room 2 keeps its floor and gains walls and ceiling; a floor zone');
  rd = await call('schedule_read', { source: 'zonefinishes' });
  // the shower floor zone: 2 m2 of 300 tiles, from the area: 2e6 / 9e4 = 22.2 → 23, marked ≈; order 23 x 1.05 = 24.15 → 25
  ok(rd.lines.some((l) => l.cells[0] === 'Shower floor' && l.cells[4] === '2.00 m²' && l.cells[6] === '≈ 23' && l.cells[7] === '≈ 25'), 'the floor zone: 2.00 m2, about 23 tiles counted from the area (marked ≈), 25 to order', rd.lines.map((l) => l.cells));
  err = null; try { await call('finishes_set', { rooms: { nope: { floor: 'por' } } }); } catch (e) { err = e; }
  ok(err && err.code === 'not_found', 'a room that does not exist is refused');
  err = null; try { await call('finishes_set', { zones: [{ id: 'z3', name: 'Bad', room: room2.guid, surface: 'wall', finish: 'missing', to: 100 }] }); } catch (e) { err = e; }
  ok(err && err.code === 'invalid_argument' && /Nothing changed/.test(err.message) && FM.readFinishes(W()).zones.length === 2, 'a wrong entry refuses the whole change and says which');

  // ================================================================================================ BK.47 specification, documents
  console.log('== BK.47 the specification and the working-drawing schedules in a document');
  snap = OPS.snapshotModel(ed);
  const fset = SD.finishSet(W(), snap, m.loopsFor, { units: 'mm', t });
  const U = await import(path.join(APP, 'model-units.js'));
  const specOpts = { t, fmtLen: (mm) => U.fmtFine(mm, 'mm'), fmtArea: (a) => U.fmtArea(a, 'mm'), finishes: fset.doc, finishRows: fset.data.result };
  let secs = SP.specSections(W(), snap, specOpts);
  ok(secs.map((s) => s.group).join() === 'wall,door,window,finish,finish,finish' && secs[0].id === 'wall:int-2x4' && secs[0].count === 8, 'one section per type in use: the wall type, the door type, the window type, the three finishes', secs.map((s) => s.id));
  ok(secs[0].facts.some((f) => /^Thickness 114 mm$/.test(f)) && secs[0].facts.some((f) => /^Layer 1: .*, 12\.7 mm, Finish$/.test(f)) && secs[0].facts.filter((f) => /^Layer \d: /.test(f)).length === 3 && secs[0].facts.some((f) => /In the model: 8 walls/.test(f)), 'the wall section states the build-up layer by layer and what is in the model', secs[0].facts);
  ok(secs[1].facts.some((f) => /2 doors/.test(f)) && secs[1].facts.some((f) => /^Marks: /.test(f)) && secs.find((s) => s.id === 'finish:por').facts.some((f) => /Tile 600 mm x 600 mm/.test(f)), 'doors with their sizes and marks; the porcelain finish with its tile size');
  ok(secs.every((s) => s.text === ''), 'no text is put there by BimCraft');
  ed.modelChange(SP.saveSpecTextsOp({ 'wall:int-2x4': 'Timber stud partition.\n\nBoards fixed at 300 centres.', 'door:gone': 'Old door text', 'bad id': 'x' }));
  secs = SP.specSections(W(), snap, specOpts);
  ok(secs[0].text.startsWith('Timber stud partition.') && secs.find((s) => s.id === 'door:gone' && !s.inUse) && !secs.some((s) => s.id === 'bad id'), 'the person\'s text is kept in the file; text for a type no longer in the model is kept and marked; a wrong id is not');
  const md = SP.specMarkdown(secs, { t });
  ok(/^# Specification/.test(md) && /## Walls/.test(md) && /Boards fixed at 300 centres\./.test(md) && /\*No specification text written yet\.\*/.test(md) && /## Text for types no longer in the model/.test(md), 'the specification as a document: headings by group, facts, the text, and "not written yet" where there is none');
  // the document template fields: {{schedule doors}} and {{specification}} through doc-fields.js
  DF.registerDocField('schedule', (arg) => { const sc = m.all[arg]; if (!sc?.table) return null; const laid = SL.layOut(sc.table, {}, ctxOf()).laid; DF.noteFigures(laid.head, laid.lines.map((l) => ({ cells: l.cells, ids: l.ids }))); return DF.mdTable(laid.head, laid.lines.map((l) => l.cells)); });
  DF.registerDocField('specification', () => md);
  const res = DT.render('# Doc\n\n{{schedule doors}}\n\n{{specification}}\n\n{{schedule nope}}', DT.docSource({ fields: DF.docFields() }));
  const tb = res.blocks.find((b) => b.t === 'table');
  ok(tb && tb.head.length === 6 && tb.rows.length === 3 && res.blocks.some((b) => b.t === 'h' && b.runs.map((r) => r.s).join('') === 'Walls') && res.warnings.length === 1 && /\[\?schedule nope\]/.test(res.markdown), 'a template prints {{schedule doors}} as a table and {{specification}} as sections; an unknown schedule is a warning', res.warnings);
  ok(DF.figureTables().length === 1 && DF.figureTables()[0].lines[0].ids.length === 1, 'the document keeps the elements behind the schedule\'s lines for the preview (BK.142)');
  const TPL = await import(path.join(APP, 'doc-templates.js'));
  ok(TPL.TEMPLATES.find((x) => x.id === 'working')?.text.includes('{{schedule roomfinishes}}') && TPL.TEMPLATES.find((x) => x.id === 'spec')?.text.includes('{{specification}}') && t('sx.su889.tpl.working') === 'Working drawing schedules', 'two templates ship: Working drawing schedules (doors, windows, finishes) and Specification');
  void TB; void QF;

  console.log('\n' + good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
