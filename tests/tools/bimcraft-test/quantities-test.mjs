/* SPDX-License-Identifier: Apache-2.0 */
/**
 * quantities-test.mjs — gross, deductions and net on the schedules; one measuring rule in BimCraft, the IFC quantities and
 * TakeoffCraft; takeoff data on a wall type (booklet rows BK.84, BK.11, BK.40; session bk-quantities-10). DOM-free:
 *   node bin/test-bimcraft.mjs --quantities
 * Real IFC models made by the app's own operations. Every expected value is worked out in the comment beside it.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function quantitiesMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
  const rel = (a, b, e = 1e-4) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MF = await import(path.join(APP, 'model-floors.js'));
  const SC = await import(path.join(APP, 'model-schedule.js'));
  const QS = await import(path.join(APP, 'quantity-schedules.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const TO = await import(path.join(APP, 'res-takeoff.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const U = await import(path.join(APP, 'model-units.js'));
  const I18 = await import(path.join(APP, 'i18n.js'));
  const { RULES } = await import(path.join(APP, 'quantities/rules.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  I18.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const t = I18.t;
  const TC = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
  const TM = await import(path.join(TC, 'model.js'));
  const TG = await import(path.join(TC, 'geom.js'));
  const TX = await import(path.join(TC, 'export.js'));
  const EMB = await import(path.join(TC, 'embed.js'));
  (await import(path.join(TC, 'i18n.js'))).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(TC, 'lang/en.json'), 'utf8')) });

  const boot = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    return new IfcEditor(WebIFC, eng);
  };
  const fresh = (name, levels, h) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(levels, h, (i) => 'Level ' + (i + 1)), fileName: 'q.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const fmt = { fmtLen: (mm) => U.fmtLen(mm, 'mm'), fmtArea: (a) => U.fmtArea(a, 'mm'), t, unit: U.unitMark('mm') };
  const col = (sc, label) => sc.head.findIndex((h) => h.startsWith(label));
  /** All the schedules of a model, as the Schedules panel gathers them (quantities-ui.js does the same with the page's own state). */
  const allOf = (ed) => {
    const w = new ModelWriter(WebIFC, ed.api, ed.mid), snap = OPS.snapshotModel(ed);
    const loops = new Map(), loopsFor = (id) => { if (!loops.has(id)) loops.set(id, OPS.loopsOf(ed, id)); return loops.get(id); };
    const roomLoops = new Map(snap.levels.map((l) => [l.id, loopsFor(l.id)]));
    const sideOf = QS.grossSideReader(w);
    const base = SC.schedules(snap, roomLoops, { ...fmt, sideOf });
    const q = QS.quantitySchedules(snap, { ...fmt, sideOf, floors: QS.floorInputs(w, snap, loopsFor), ceilings: QS.ceilingInputs(w, snap, loopsFor) });
    return { w, snap, loopsFor, ...base, ...q };
  };
  const T = 114.3;   // int-2x4: 12.7 gypsum + 88.9 studs + 12.7 gypsum

  // ================================================================================================ BK.84
  console.log('== BK.84 a 5000 x 4000 room, walls 2700 high, one door 900 x 2100 in the south wall');
  let ed = await fresh('Quantities', 1, 3000);
  const L1 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'int-2x4', height: 2700 }));
  let A = allOf(ed);
  const south0 = A.snap.walls.find((x) => near(x.a[1], 0) && near(x.b[1], 0));
  // no door yet: gross = (5000 + 4000 + 5000 + 4000) x 2700 = 48 600 000 mm2, nothing deducted
  ok(A.walls.nums.length === 1 && near(A.walls.nums[0][3], 48600000) && A.walls.nums[0][4] === 0 && near(A.walls.nums[0][2], 48600000), 'before the door: 18 000 x 2700 = 48 600 000 mm2 gross, 0 deducted, net the same', A.walls.nums);
  ed.modelChange(OPS.placeOpening({ wall: south0.guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  A = allOf(ed);
  const DOOR = 900 * 2100;   // 1 890 000 mm2
  ok(A.walls.head.length === 7 && col(A.walls, 'Gross area') === 4 && col(A.walls, 'Deductions') === 5 && col(A.walls, 'Net area') === 6, 'Walls by type has the columns Gross area, Deductions, Net area', A.walls.head);
  const [n, len, net, gross, ded] = A.walls.nums[0];
  // gross unchanged 48 600 000; the door 1 890 000 out once; net 46 710 000
  ok(n === 4 && near(len, 18000) && near(gross, 48600000) && near(ded, DOOR) && near(net, 48600000 - DOOR), 'with the door: 48 600 000 gross, 1 890 000 deducted (the door, once), 46 710 000 net', A.walls.nums[0]);
  ok(near(gross - ded, net, 1e-6), 'gross less deductions is the net');
  ok(A.walls.rows[0][4] === '48.60 m²' && A.walls.rows[0][5] === '1.89 m²' && A.walls.rows[0][6] === '46.71 m²' && A.walls.total[4] === '48.60 m²' && A.walls.total[5] === '1.89 m²' && A.walls.total[6] === '46.71 m²', 'the cells and the total row: 48.60 m2, 1.89 m2, 46.71 m2', [A.walls.rows[0], A.walls.total]);
  ok(A.walls.note === RULES['wall.side'].text && A.walls.rule === 'wall.side', 'the schedule carries the rule it was measured by, word for word');
  const csv = SC.scheduleCsv(A.walls).split(/\r?\n/);
  ok(/Gross area,Deductions,Net area$/.test(csv[0]) && /48\.60 m²,1\.89 m²,46\.71 m²$/.test(csv[1]) && /^Total,.*48\.60 m²,1\.89 m²,46\.71 m²$/.test(csv[2]), 'the CSV has the three columns, the row and the total', csv.slice(0, 3));

  console.log('== BK.84 the IFC quantities hold the same numbers');
  const qtoWalls = A.snap.walls.map((x) => ({ x, q: QS.readQtoAreas(A.w, x.id, 'Qto_WallBaseQuantities'), s: SC.wallSideOf(x, A.snap.openings) }));
  ok(qtoWalls.every(({ q, s }) => q && near(q.GrossSideArea, s.gross, 1) && near(q.NetSideArea, s.net, 1)), 'every wall: Qto GrossSideArea and NetSideArea = the schedule\'s gross and net for that wall');
  const qs = qtoWalls.find(({ x }) => x.id === south0.id);
  // the south wall: 5000 x 2700 = 13 500 000 gross, less the door = 11 610 000
  ok(near(qs.q.GrossSideArea, 13500000, 1) && near(qs.q.NetSideArea, 13500000 - DOOR, 1), 'the south wall in the file: 13 500 000 gross, 11 610 000 net');
  ok(near(qtoWalls.reduce((s, { q }) => s + q.NetSideArea, 0), net, 2) && near(qtoWalls.reduce((s, { q }) => s + q.GrossSideArea, 0), gross, 2), 'the file\'s walls add up to the schedule\'s totals');

  console.log('== BK.84 finishes: the wall with the door is not counted twice');
  // int-2x4 has a gypsum finish on each side of the studs: two faces a wall, each the wall's own side area
  const F = A.finishes;
  ok(F.rows.length === 2 && F.nums.every((r) => r[0] === 4 && near(r[1], 48600000) && near(r[2], DOOR) && near(r[3], 48600000 - DOOR)), 'two finish rows (one a side), each 4 faces: 48 600 000 gross, the door out once, 46 710 000 net', F.nums);
  ok(/exterior side/.test(F.rows.map((r) => r[1]).join('|')) && /interior side/.test(F.rows.map((r) => r[1]).join('|')) && F.rows.every((r) => r[0] === 'Gypsum board' || r[0] === 'gypsum'), 'named by material and side', F.rows);
  ok(near(A.walls.nums[0][3], 18000 * 2700) && near(A.walls.nums[0][2] + A.walls.nums[0][4], 18000 * 2700), 'the wall schedule is the wall face alone: the finishes are not added to it');
  ok(near(F.nums[0][2], A.walls.nums[0][4]) && near(F.nums[1][2], A.walls.nums[0][4]), 'the door is one deduction in the walls and one per finished face, never more');
  // a bare concrete wall has no finish: it is in the walls, not in the finishes
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [8000, 0], b: [11000, 0] }], typeKey: 'concrete-200', height: 2700 }));
  A = allOf(ed);
  ok(A.walls.rows.length === 2 && A.finishes.rows.length === 2 && A.finishes.nums.every((r) => r[0] === 4) && near(A.walls.nums.reduce((s, r) => s + r[3], 0), 48600000 + 3000 * 2700), 'a bare concrete wall adds 8 100 000 to the walls and nothing to the finishes');
  ok(/^Gross: .*Ceilings: Gross: /.test(A.finishes.note) && A.finishes.note.includes(RULES['finish.wall'].text) && A.finishes.note.includes(RULES['finish.ceiling'].text), 'the finishes schedule states both of its rules');

  console.log('== BK.84 floors and ceilings: gross, deductions, net');
  ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed: [2500, 2000], mode: 'room', kind: 'wood' }));
  ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed: [2500, 2000], mode: 'room', height: 2400 }));
  // a drawn floor 3000 x 2000 = 6 000 000 mm2 with a 1000 x 500 opening = 500 000: net 5 500 000
  const made = ed.modelChange(MF.placeDrawnFloor({ storey: L1.guid, points: [[8000, 1000], [11000, 1000], [11000, 3000], [8000, 3000]], kind: 'concrete' }));
  A = allOf(ed);
  const drawn = MF.readDrawnFloors(A.w)[0];
  ed.modelChange(MF.addFloorOpening(drawn.guid, [[9000, 1500], [10000, 1500], [10000, 2000], [9000, 2000]]));
  A = allOf(ed);
  const ROOM = (5000 - T) * (4000 - T);   // 4885.7 x 3885.7 = 18 984 364.49 mm2
  const fr = A.floors;
  ok(fr.head.length === 6 && col(fr, 'Gross area') === 3 && col(fr, 'Deductions') === 4 && col(fr, 'Net area') === 5 && fr.rows.length === 2, 'Floors: a row a floor with Gross area, Deductions, Net area', fr.head);
  const roomFloor = fr.nums[fr.rows.findIndex((r) => /fills a room/.test(r[1]))], drawnFloor = fr.nums[fr.rows.findIndex((r) => /drawn outline/.test(r[1]))];
  ok(roomFloor && near(roomFloor[0], ROOM, 1) && roomFloor[1] === 0 && near(roomFloor[2], ROOM, 1), 'the room\'s floor: 4885.7 x 3885.7 = 18 984 364 mm2, nothing deducted', roomFloor);
  ok(drawnFloor && near(drawnFloor[0], 6000000, 1) && near(drawnFloor[1], 500000, 1) && near(drawnFloor[2], 5500000, 1), 'the drawn floor: 6 000 000 gross, its 500 000 opening deducted, 5 500 000 net', drawnFloor);
  ok(fr.note === RULES.floor.text, 'the floors schedule carries its rule');
  const qf = QS.readQtoAreas(A.w, MF.readDrawnFloors(A.w)[0].id, 'Qto_SlabBaseQuantities');
  const qr = QS.readQtoAreas(A.w, A.snap.derived.floors[0].id, 'Qto_SlabBaseQuantities');
  ok(near(qf.GrossArea, 6000000, 1) && near(qf.NetArea, 5500000, 1) && near(qr.GrossArea, ROOM, 1) && near(qr.NetArea, ROOM, 1), 'the file\'s Qto_SlabBaseQuantities hold the same gross and net');
  const ceil = A.finishes.nums[A.finishes.rows.findIndex((r) => r[1] === 'Ceilings')];
  const qc = QS.readQtoAreas(A.w, A.snap.derived.ceilings[0].id, 'Qto_CoveringBaseQuantities');
  ok(ceil && ceil[0] === 1 && near(ceil[1], ROOM, 1) && ceil[2] === 0 && near(ceil[3], ROOM, 1) && near(qc.GrossArea, ROOM, 1) && near(qc.NetArea, ROOM, 1), 'the ceiling is a finish row: 18 984 364 gross and net, as in the file', ceil);
  ok(/Net area$/.test(SC.scheduleCsv(A.floors).split(/\r?\n/)[0]) && /Net area$/.test(SC.scheduleCsv(A.finishes).split(/\r?\n/)[0]) && SC.scheduleCsv(A.floors).split(/\r?\n/).filter(Boolean).length === 4, 'Floors and Finishes go to CSV with the three columns and a total row');

  console.log('== BK.84 a wall with a shaped top: the schedule takes its real face from the file');
  {
    const snap = OPS.snapshotModel(ed), w = new ModelWriter(WebIFC, ed.api, ed.mid);
    const x = snap.walls.find((q) => q.typeKey === 'concrete-200');
    const fake = { ...x, shape: { profile: 'x' } };   // a shaped wall reads GrossSideArea; this plain wall's is len x height, so a marker value proves which is used
    const plain = SC.wallSideOf(x, snap.openings, QS.grossSideReader(w)), viaFile = SC.wallSideOf(fake, snap.openings, QS.grossSideReader(w)), given = SC.wallSideOf(fake, snap.openings, () => 9000000);
    ok(near(plain.gross, 3000 * 2700) && near(viaFile.gross, 3000 * 2700, 1) && given.gross === 9000000 && QS.grossSideReader(w)(x) === null, 'a plain wall is length x height; a shaped one takes the GrossSideArea its body wrote');
  }

  // ================================================================================================ BK.11
  console.log('== BK.11 a small house counted two ways: BimCraft\'s schedules and TakeoffCraft reading the hand-over');
  ed = await fresh('House', 2, 3000);
  let lv = OPS.snapshotModel(ed).levels;
  const B = [[0, 0], [8000, 0], [8000, 6000], [0, 6000]];
  ed.modelChange(OPS.drawWalls({ storey: lv[0].guid, segs: B.map((p, i) => ({ a: p, b: B[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: lv[1].guid, height: 3000, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: lv[0].guid, segs: [{ a: [4000, 0], b: [4000, 6000] }], typeKey: 'int-2x4', topLevel: lv[1].guid, height: 3000 }));
  let hw = OPS.snapshotModel(ed).walls;
  const inner = hw.find((x) => x.typeKey === 'int-2x4'), southH = hw.find((x) => near(x.a[1], 0, 1) && near(x.b[1], 0, 1) && x.typeKey === 'ext-2x6'), east = hw.find((x) => near(x.a[0], 8000, 1) && near(x.b[0], 8000, 1));
  ed.modelChange(OPS.placeOpening({ wall: inner.guid, typeKey: 'door-single', offset: 1000, width: 813, height: 2032, sill: 0, hand: 'a', face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: southH.guid, typeKey: 'win-double-hung', offset: 1000, width: 914, height: 1219, sill: 914, hand: 'a', face: 'right' }));
  ed.modelChange(OPS.placeOpening({ wall: southH.guid, typeKey: 'door-single', offset: 5000, width: 914, height: 2032, sill: 0, hand: 'a', face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'win-double-hung', offset: 2000, width: 1200, height: 1200, sill: 900, hand: 'a', face: 'right' }));
  ed.modelChange(OPS.placeFloor({ storey: lv[0].guid, seed: [2000, 3000], mode: 'room', kind: 'wood' }));
  ed.modelChange(OPS.placeFloor({ storey: lv[0].guid, seed: [6000, 3000], mode: 'room', kind: 'wood' }));
  const H = allOf(ed);
  // way one: BimCraft's schedules
  const byName = new Map(H.walls.rows.map((r, i) => [r[0], H.walls.nums[i]]));
  const extRow = H.walls.nums[H.walls.rows.findIndex((r, i) => H.walls.nums[i][0] === 4)], intRow = H.walls.nums[H.walls.rows.findIndex((r, i) => H.walls.nums[i][0] === 1)];
  // exterior: 28 000 x 3000 = 84 000 000 gross; openings 914 x 1219 + 914 x 2032 + 1200 x 1200 = 1 114 166 + 1 857 248 + 1 440 000 = 4 411 414
  // interior: 6000 x 3000 = 18 000 000 gross; the door 813 x 2032 = 1 652 016
  ok(extRow && near(extRow[3], 84000000, 1) && near(extRow[4], 4411414, 1) && near(extRow[2], 84000000 - 4411414, 1), 'BimCraft, exterior walls: 84 000 000 gross, 4 411 414 deducted (two windows and a door), 79 588 586 net', extRow);
  ok(intRow && near(intRow[3], 18000000, 1) && near(intRow[4], 1652016, 1) && near(intRow[2], 18000000 - 1652016, 1), 'BimCraft, interior wall: 18 000 000 gross, 1 652 016 deducted (its door), 16 347 984 net', intRow);
  // way two: the hand-over file, read with TakeoffCraft's own modules
  const snapH = H.snap, wH = H.w;
  const wallsD = snapH.walls.map((x) => { const ty = x.assembly || MW.wallType(x.typeKey); return { ...x, typeName: ty ? MW.typeName(ty) : x.typeKey, exterior: ty?.exterior !== false }; });
  const openingsD = MO.readOpenings(wH, null, MW.readWalls(wH)).map((o) => ({ ...o, typeName: o.typeKey }));
  const rooms = snapH.levels.flatMap((l) => (H.loopsFor(l.id)?.rooms || []).map((r) => ({ storey: l.id, poly: r.poly, holes: r.holes || [] })));
  const sceneOf = (l) => ({ walls: snapH.walls.filter((x) => x.storey === l.id).map((x) => { const d = [x.b[0] - x.a[0], x.b[1] - x.a[1]], L = Math.hypot(...d), nn = [-d[1] / L * x.t / 2, d[0] / L * x.t / 2]; const poly = [[x.a[0] + nn[0], x.a[1] + nn[1]], [x.b[0] + nn[0], x.b[1] + nn[1]], [x.b[0] - nn[0], x.b[1] - nn[1]], [x.a[0] - nn[0], x.a[1] - nn[1]]]; return { key: x.id, poly, pieces: [poly] }; }), symbols: [], cut: [], below: [], rooms: [], dims: [] });
  const handOver = async (units) => {
    const input = TO.modelQuantities({ name: 'House', units, levels: snapH.levels, scenes: new Map(snapH.levels.map((l) => [l.id, sceneOf(l)])), walls: wallsD, openings: openingsD, roofs: [], founds: [], cabinets: [], devs: [], rooms, lumber: [], fmtLen: (mm) => U.fmtLen(mm, units), date: '2026-11-11' }, t);
    const res = await TO.buildTakeoff(input);
    let emb = null;
    try {
      const pdfjs = await import(path.join(ROOT, 'tools/takeoffcraft-test/node_modules/pdfjs-dist/legacy/build/pdf.mjs'));
      const doc = await pdfjs.getDocument({ data: res.pdf.slice(), isEvalSupported: false, verbosity: 0 }).promise;
      emb = await EMB.readEmbedded(doc);
      await (doc.destroy?.() ?? doc.cleanup?.());
    } catch (e) { console.log('  --   pdf.js for Node not installed (tools/takeoffcraft-test): the takeoff is read from the builder\'s own object instead'); }
    const loaded = TM.readProject(emb ? emb.takeoff : res.takeoff);
    return { input, res, loaded, viaPdf: !!emb };
  };
  const FT2 = 304.8 * 304.8;
  for (const units of ['ftin', 'mm']) {
    const { input, res, loaded, viaPdf } = await handOver(units);
    // tools/takeoffcraft-test/browser-bim-openings.mjs opens this very file in the real TakeoffCraft page (BKQ_PDF = where to write it)
    if (units === 'ftin' && process.env.BKQ_PDF) { fs.writeFileSync(process.env.BKQ_PDF, res.pdf); fs.writeFileSync(process.env.BKQ_PDF + '.json', JSON.stringify({ ext: { gross: extRow[3], deductions: extRow[4], net: extRow[2] }, int: { gross: intRow[3], deductions: intRow[4], net: intRow[2] } })); }
    ok(loaded.ok && !loaded.warnings.length, units + ': TakeoffCraft\'s readProject loads the hand-over with no warnings' + (viaPdf ? ' (read out of the PDF by embed.js)' : ''), loaded.warnings || loaded.error);
    const Q = TM.quantities(loaded.state);
    const sumType = (typeKey) => {
      const o = { gross: 0, deductions: 0, net: 0, A: 0, opens: 0 };
      for (const [key, def] of Object.entries(input.items)) {
        if (!key.startsWith('wall:' + typeKey + ':')) continue;
        const it = loaded.state.items.find((x) => x.name === def.name), q = Q.get(it.id), wa = TM.wallArea(it, q);
        o.gross += wa.gross * FT2; o.deductions += wa.deductions * FT2; o.net += wa.net * FT2;
        o.A += TM.itemVars(it, q).A * (it.unit === 'm' ? 1e6 : FT2);
        o.opens += loaded.state.marks.filter((m) => m.item === it.id).reduce((s, m) => s + (m.opens?.length || 0), 0);
      }
      return o;
    };
    const te = sumType('ext-2x6'), ti = sumType('int-2x4');
    // agreement to 1 part in 10 000: the hand-over rounds sheet coordinates to 0.01 point and feet to 4 decimals
    ok(rel(te.gross, extRow[3]) && rel(te.deductions, extRow[4]) && rel(te.net, extRow[2]), units + ': exterior walls agree, gross / deductions / net (TakeoffCraft ' + Math.round(te.gross) + ' / ' + Math.round(te.deductions) + ' / ' + Math.round(te.net) + ' mm2)', [te, extRow]);
    ok(rel(ti.gross, intRow[3]) && rel(ti.deductions, intRow[4]) && rel(ti.net, intRow[2]), units + ': interior wall agrees, gross / deductions / net (TakeoffCraft ' + Math.round(ti.gross) + ' / ' + Math.round(ti.deductions) + ' / ' + Math.round(ti.net) + ' mm2)', [ti, intRow]);
    ok(te.opens === 3 && ti.opens === 1, units + ': each opening is on its wall run once (3 outside, 1 inside)');
    ok(rel(te.A, extRow[2]) && rel(ti.A, intRow[2]), units + ': the formula variable A (what assemblies are priced from) is the NET wall area');
    // floors: TakeoffCraft's floor item on level 1 against BimCraft's Floors and Rooms schedules
    const fi = loaded.state.items.find((x) => x.name === input.items['floor:' + snapH.levels[0].id].name), fq = Q.get(fi.id);
    const floorNet = H.floors.nums.reduce((s, r) => s + r[2], 0), roomsNet = H.rooms.nums.reduce((s, r) => s + r[0], 0);
    ok(H.floors.rows.length === 2 && rel(fq.areaSqft * FT2, floorNet) && rel(fq.areaSqft * FT2, roomsNet), units + ': floor area agrees: TakeoffCraft ' + Math.round(fq.areaSqft * FT2) + ' mm2 = BimCraft\'s Floors net ' + Math.round(floorNet) + ' = its Rooms total', [fq.areaSqft * FT2, floorNet, roomsNet]);
    if (units === 'ftin') {
      const est = TM.estimate(loaded.state, Q), extIt = loaded.state.items.find((x) => /walls/.test(x.name) && x.components.length >= 4);
      const row = est.rows.find((r) => r.kind === 'item' && r.itemId === extIt.id);
      ok(row.wallArea && rel(row.wallArea.value * FT2, extRow[2]) && rel(row.wallArea.gross * FT2, extRow[3]) && rel(row.wallArea.deductions * FT2, extRow[4]), 'TakeoffCraft\'s estimate row says the wall area net, and what was taken out');
      ok(/Wall area [\d.]+ SF net \([\d.]+ gross less [\d.]+ of openings\)/.test(TX.estimateCsv(loaded.state)), 'and its exported estimate says so in the notes');
      // the openings survive TakeoffCraft's own save and reopen
      const again = TM.readProject(JSON.parse(JSON.stringify(new TM.Takeoff(loaded.state).toJSON())));
      const Q2 = again.ok ? TM.quantities(again.state) : null;
      ok(again.ok && rel(TM.wallArea(again.state.items.find((x) => x.id === extIt.id), Q2.get(extIt.id)).deductions * FT2, extRow[4]), 'the openings are kept through TakeoffCraft\'s own save and reopen');
    }
  }
  console.log('== BK.11 TakeoffCraft\'s own marks follow the same rule');
  {
    const sq = (x, y, s) => [{ x, y }, { x: x + s, y }, { x: x + s, y: y + s }, { x, y: y + s }];
    const a = TG.areaWithHoles(sq(0, 0, 10), [sq(1, 1, 2), sq(5, 5, 3)]);
    ok(a.gross === 100 && a.cut === 13 && a.net === 87, 'an area mark 10 x 10 with 2 x 2 and 3 x 3 cut-outs: 100 gross, 13 cut, 87 net');
    const it = { type: 'linear', heightFt: 8, unit: 'LF' };
    ok(TM.wallArea(it, { lengthFt: 20, openSqft: 0 }).net === 160 && TM.wallArea(it, { lengthFt: 20, openSqft: 21 }).net === 139 && TM.wallArea({ type: 'linear', heightFt: 0 }, { lengthFt: 20, openSqft: 21 }).net === 0, 'a run 20 ft x 8 ft: 160 sq ft; with 21 sq ft of openings 139; no height, no wall area');
    const raw = { format: TM.FORMAT, version: 1, name: 'T', seq: 3, files: [{ hash: 'a'.repeat(64), name: 'a.pdf', size: 1, pages: 1 }], sheets: { ['a'.repeat(64) + ':0']: { scale: { method: 'preset', ftPerUnit: 1, preset: null, label: '1' } } },
      items: [{ id: 'i1', name: 'Wall', type: 'linear', unit: 'LF', heightFt: 8, color: '#D9480F', waste: 0, mat: 0, lab: 0, components: [] }],
      marks: [{ id: 'm1', item: 'i1', sheet: 'a'.repeat(64) + ':0', kind: 'linear', pts: [[0, 0], [20, 0]], opens: [[3, 7], [-1, 2], 'x', [2, 0], [4, 4]] }], areas: [] };
    const r = TM.readProject(raw);
    ok(r.ok && JSON.stringify(r.state.marks[0].opens) === '[[3,7],[4,4]]', 'an opening that is not two positive lengths is dropped on reading, the good ones kept', r.ok ? r.state.marks[0].opens : r.error);
    const q = r.ok ? TM.quantities(r.state).get('i1') : null;
    ok(q && q.openSqft === 37 && TM.wallArea(r.state.items[0], q).net === 160 - 37, 'that run: 160 gross, 21 + 16 = 37 out, 123 net');
  }

  // ================================================================================================ BK.40
  console.log('== BK.40 a wall type carries its takeoff data');
  ed = await fresh('Types', 1, 3000);
  const K1 = OPS.snapshotModel(ed).levels[0];
  const brick = { version: 1, key: 'wall-brick-test', name: 'Brick 230 test', exterior: true,
    layers: [{ mat: 'brick', t: 222, function: 'structure', core: true }, { mat: 'plaster', t: 12, function: 'finish', core: false }],
    takeoff: { unit: { name: 'Clay brick', length: 222, height: 73, width: 106 }, mortar: { name: 'Class II', joint: 10 }, rate: { amount: 450, currency: 'ZAR', basis: 'm2' } } };
  ed.modelChange(OPS.saveWallAssembly(brick));
  ed.modelChange(OPS.drawWalls({ storey: K1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }], typeKey: 'wall-brick-test', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: K1.guid, segs: [{ a: [0, 3000], b: [3000, 3000] }], typeKey: 'int-2x4', height: 2700 }));
  let bw = OPS.snapshotModel(ed).walls.find((x) => x.typeKey === 'wall-brick-test' && near(x.a[1], 0) && near(x.b[1], 0));
  ed.modelChange(OPS.placeOpening({ wall: bw.guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  const check = (label, e) => {
    const X = allOf(e), S = X.walltakeoff, i = S.rows.findIndex((r) => r[0] === 'Brick 230 test'), j = S.rows.findIndex((r) => r[0] !== 'Brick 230 test');
    const ty = WA.readAssemblies(X.w).find((r) => r.key === 'wall-brick-test');
    ok(ty && JSON.stringify(ty.takeoff) === JSON.stringify(brick.takeoff), label + ': the type holds the unit, the mortar and the rate as entered', ty?.takeoff);
    ok(X.snap.walls.filter((x) => x.typeKey === 'wall-brick-test').every((x) => x.assembly?.takeoff?.rate.amount === 450), label + ': every wall of the type reads it from its type');
    // two walls 6000 + 4000 = 10 000 x 2700 = 27 000 000 gross, less the 1 890 000 door = 25 110 000 mm2 = 25.11 m2; x 450 = 11 299.50
    ok(i >= 0 && S.rows[i][1] === 'Clay brick, 222 mm x 73 mm x 106 mm' && S.rows[i][2] === 'Class II, 10 mm' && S.rows[i][3] === '2' && S.rows[i][5] === '25.11 m²' && S.rows[i][6] === '450.00 ZAR / m²' && S.rows[i][7] === '11299.50 ZAR', label + ': the schedule row: unit, mortar, 2 walls, 25.11 m2 net, 450.00 ZAR / m2, 11299.50 ZAR', S.rows[i]);
    ok(near(S.nums[i][2], 25110000, 1) && S.nums[i][3] === 11299.5, label + ': amount = rate x net area (25.11 x 450 = 11 299.50)', S.nums[i]);
    ok(j >= 0 && S.rows[j][1] === '' && S.rows[j][6] === '' && S.rows[j][7] === '' && S.nums[j][3] === null, label + ': a type with no takeoff data is listed with empty cells, no amount');
    ok(S.total[7] === '11299.50 ZAR' && /rounded up to a whole unit/.test(S.note) && S.note.includes(RULES['wall.side'].text), label + ': the total, and the note says how units and mortar are counted (BK.42: was "not calculated yet")');
    return X;
  };
  let X = check('drawn', ed);
  ok(/Unit,Mortar,Count,.*Rate,Amount,Units per m² of leaf,Units to order,Mortar volume$/.test(SC.scheduleCsv(X.walltakeoff).split(/\r?\n/)[0]) && SC.scheduleCsv(X.walltakeoff).includes('"Clay brick, 222 mm x 73 mm x 106 mm"'), 'the takeoff schedule goes to CSV');
  const bytes = ed.save();
  ok(new TextDecoder().decode(bytes).includes('Clay brick'), 'the saved IFC file holds the data (in the wall type\'s record)');
  const ed2 = await boot(bytes);
  X = check('saved and reopened', ed2);

  console.log('== BK.40 what TakeoffCraft reads');
  {
    const snap = X.snap, w = X.w;
    const wallsD2 = snap.walls.map((x) => { const ty = x.assembly || MW.wallType(x.typeKey); return { ...x, typeName: ty ? MW.typeName(ty) : x.typeKey, exterior: ty?.exterior !== false }; });
    const openingsD2 = MO.readOpenings(w, null, MW.readWalls(w)).map((o) => ({ ...o, typeName: o.typeKey }));
    const scene = { walls: [], symbols: [], cut: [], below: [], rooms: [], dims: [] };
    for (const units of ['mm', 'ftin']) {
      const input = TO.modelQuantities({ name: 'Types', units, levels: snap.levels, scenes: new Map(snap.levels.map((l) => [l.id, scene])), walls: wallsD2, openings: openingsD2, roofs: [], founds: [], cabinets: [], devs: [], rooms: [], lumber: [], fmtLen: (mm) => U.fmtLen(mm, units), date: '2026-11-11' }, t);
      const res = await TO.buildTakeoff(input);
      const loaded = TM.readProject(res.takeoff);
      const it = loaded.ok && loaded.state.items.find((x) => /^Brick 230 test walls/.test(x.name));
      const c = it?.components.find((x) => /Clay brick/.test(x.name));
      ok(loaded.ok && !loaded.warnings.length && c && (units === 'mm' ? c.name === 'Clay brick, 222 mm x 73 mm x 106 mm; mortar Class II, 10 mm; rate in ZAR' : /^Clay brick, 8 3\/4" x 2 7\/8" x 4 3\/16"; mortar Class II, 3\/8"; rate in ZAR$/.test(c.name)) && c.unit === 'm²' && c.mat === 4500000, units + ': the brick walls\' item has one component for the type\'s data: unit, mortar, currency, 450.0000 a m2', c);
      const est = loaded.ok ? TM.estimate(loaded.state) : null;
      const row = est?.rows.find((r) => r.kind === 'component' && /Clay brick/.test(r.name));
      // the same 25.11 m2 x 450 = 11 299.50 → 1 129 950 cents (the hand-over rounds coordinates: within a cent or two of a 25.11 m2 wall)
      ok(row && !row.error && Math.abs(row.qty - 25.11) < 0.003 && Math.abs(row.matExt - 1129950) <= 150, units + ': TakeoffCraft prices it at the rate x the NET wall area: ' + (row ? row.qty.toFixed(3) + ' m2, ' + (row.matExt / 100).toFixed(2) : '?') + ' (BimCraft: 25.11 m2, 11299.50)', row);
      const plain = loaded.ok && loaded.state.items.find((x) => /walls/.test(x.name) && !/Brick/.test(x.name));
      ok(plain && !plain.components.some((x) => /rate in/.test(x.name)), units + ': a type without takeoff data hands over no such component');
    }
  }

  console.log('== BK.40 the type editor\'s check');
  {
    const base = { ...brick, key: 'wall-brick-two', name: 'Brick two' };
    const v = (takeoff) => { try { return WA.validateAssembly({ ...base, takeoff }); } catch (e) { return e.message; } };
    ok(typeof v({ unit: { name: 'B', length: NaN } }) === 'string' && /length above 0/.test(v({ unit: { name: 'B', length: NaN } })), 'a size that is not a length is refused with a plain message', v({ unit: { name: 'B', length: NaN } }));
    ok(/three-letter code/.test(v({ rate: { amount: 5, currency: 'rand', basis: 'm2' } })) && /0 or more/.test(v({ rate: { amount: -2, currency: 'USD', basis: 'm2' } })) && /name/.test(v({ mortar: { joint: 10 } })), 'a wrong currency, a negative rate and a mortar with no name are refused');
    const none = v(undefined), empty = v({ unit: { name: '' }, rate: {} });
    ok(typeof none === 'object' && !('takeoff' in none) && typeof empty === 'object' && !('takeoff' in empty), 'nothing entered: the type has no takeoff field (older files and other types read as before)');
    const rateOnly = v({ rate: { amount: 12.5, currency: 'usd', basis: 'ft2' } });
    ok(typeof rateOnly === 'object' && rateOnly.takeoff.rate.currency === 'USD' && !rateOnly.takeoff.unit, 'a rate alone is fine');
    // editing the type's rate changes every wall of the type at once
    ed2.modelChange(OPS.saveWallAssembly({ ...brick, takeoff: { ...brick.takeoff, rate: { amount: 10, currency: 'USD', basis: 'each' } } }));
    const S = allOf(ed2).walltakeoff, i = S.rows.findIndex((r) => r[0] === 'Brick 230 test');
    ok(S.rows[i][6] === '10.00 USD / each' && S.nums[i][3] === 20, 'the rate changed on the type: 10.00 USD each x 2 walls = 20.00, for every wall of the type', S.rows[i]);
    ed2.modelChange(OPS.saveWallAssembly({ ...brick, takeoff: undefined }));
    const S2 = allOf(ed2).walltakeoff, k = S2.rows.findIndex((r) => r[0] === 'Brick 230 test');
    ok(S2.rows[k][1] === '' && S2.nums[k][3] === null && !WA.readAssemblies(new ModelWriter(WebIFC, ed2.api, ed2.mid)).find((r) => r.key === 'wall-brick-test').takeoff, 'cleared on the type: gone from the file and from the schedule');
  }
  ok(!I18.missing || ![...(I18.missing() || [])].some((k) => /^(qty|model\.sch|assembly\.takeoff|wall\.err\.takeoff|res\.to\.td)\./.test(k)), 'no missing language key among the new strings', I18.missing ? [...I18.missing()].filter((k) => /^(qty|model\.sch|assembly\.takeoff|wall\.err\.takeoff|res\.to\.td)\./.test(k)) : '');

  console.log('\n' + good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
