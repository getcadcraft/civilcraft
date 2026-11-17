/* SPDX-License-Identifier: Apache-2.0 */
/**
 * measure-test.mjs — the project's measurement method, and bricks, blocks and mortar (booklet row BK.42; session bk-measure-10).
 * DOM-free:   node bin/test-bimcraft.mjs --qtymethod
 * A real IFC model made by the app's own operations, measured three ways under every shipped method: BimCraft's schedules, the
 * file's IFC quantity sets, and TakeoffCraft reading the hand-over PDF with its own modules.
 *
 * THE MODEL AND ITS NUMBERS, WORKED OUT BY HAND
 *   One level. Four brick walls on a 6000 x 4000 rectangle of centre lines, 2700 high, type "Brick 215 test":
 *   215 brick (core) + 13 plaster inside = 228 thick. A partition (int-2x4, 114.3 thick) from (3000, 0) to (3000, 4000): a T at each end.
 *   In the south wall: a door 900 x 2100 = 1 890 000 mm2 (1.89 m2), a window 1200 x 1200 = 1 440 000 (1.44),
 *   a window 1000 x 500 = 500 000 (exactly 0.5) and a window 300 x 300 = 90 000 (0.09).
 *
 *   Brick walls, gross = (6000 + 4000 + 6000 + 4000) x 2700 = 54 000 000 mm2. Partition: 4000 x 2700 = 10 800 000.
 *     CadCraft default, BIA TN 10 (all four openings out):  3 920 000 deducted, net 50 080 000
 *     NRM 2, AAQS (0.5 m2 or less stays in):                3 330 000 deducted, net 50 670 000
 *     IS 1200 (0.1 m2 or less stays in):                    3 830 000 deducted, net 50 170 000
 *   Plaster on the brick walls (the finish.wall rule):
 *     default, BIA, IS 1200 (finish rule falls back):       3 920 000 deducted
 *     NRM 2 (1 m2 or less stays in):                        1 890 000 + 1 440 000 = 3 330 000 deducted
 *     AAQS (0.5 m2 or less stays in):                       3 330 000 deducted
 *
 *   Bricks (215 x 65 x 102.5, joint 10): 1e6 / (225 x 75) = 59.259259 per m2 of one leaf; the 215 leaf is 2 unit widths
 *   across, so 118.518519 per m2 of wall. Mortar per m2 of this wall = 215 000 000 - 118.518519 x 1 432 437.5 = 45 229 629.63 mm3.
 *     default:  50.08 m2 → 5935.41 units → 5936 to order; mortar 50.08 x 45 229 629.63 = 2 265 099 851.85 mm3 (2.265 m3)
 *               850 per 1000 x 5.936 = 5045.60
 *     NRM 2 / AAQS: 50.67 m2 → 6005.33 → 6006; mortar 2 291 785 333.33 mm3
 *     IS 1200:  50.17 m2 → 5946.07 → 5947
 *     BIA TN 10 (5% waste, 15% mortar): 5935.41 x 1.05 = 6232.18 → 6233; mortar 2 265 099 851.85 x 1.15 = 2 604 864 829.63
 *
 *   An office file "to the face, 0.25 m2, reveals as a length up to 300 mm, 7.5% waste":
 *     each brick wall end meets another brick wall: it loses 228 / 2 = 114 mm at each end, 228 mm a wall, 912 mm in all,
 *     912 x 2700 = 2 462 400 mm2 → gross 51 537 600; openings above 0.25 m2 out: 3 830 000 → net 47 707 600
 *     the partition loses 114 at each end: 228 x 2700 = 615 600 → gross and net 10 184 400
 *     units = 118.518519 x 47.7076 = 5654.23, x 1.075 = 6078.30 → 6079
 *     plaster reveals (depth 228 / 2 = 114, no deeper than 300: a length): door 2 x 2100 + 900 = 5100, windows 4800 + 3000 + 1200
 *     = 14 100 mm (the office file states no smallest opening for finishes, so all four are deducted and all four have reveals)
 *
 *   A cavity wall type (brick leaf 102.5 + cavity 50 + brick leaf 102.5 + plaster 13, both leaves ticked), one wall 5000 x 2700
 *   with no opening = 13.5 m2: units = 2 x 59.259259 x 13.5 = 1600 exactly; mortar = 2 x 17 614 814.81 x 13.5 = 475 600 000 mm3
 */
import fs from 'node:fs';
import path from 'node:path';

export async function measureMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 1) => Math.abs(a - b) <= e;
  const rel = (a, b, e = 1e-4) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MF = await import(path.join(APP, 'model-floors.js'));
  const SC = await import(path.join(APP, 'model-schedule.js'));
  const QS = await import(path.join(APP, 'quantity-schedules.js'));
  const QM = await import(path.join(APP, 'quantity-method.js'));
  const QI = await import(path.join(APP, 'quantity-ifc.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const TO = await import(path.join(APP, 'res-takeoff.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const U = await import(path.join(APP, 'model-units.js'));
  const I18 = await import(path.join(APP, 'i18n.js'));
  const M = await import(path.join(APP, 'quantities/methods.js'));
  const { RULES } = await import(path.join(APP, 'quantities/rules.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { val, ids } = await import(path.join(APP, 'ifc-util.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  I18.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
  const t = I18.t;
  const TC = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev');
  const TM = await import(path.join(TC, 'model.js'));
  const TX = await import(path.join(TC, 'export.js'));
  const EMB = await import(path.join(TC, 'embed.js'));
  (await import(path.join(TC, 'i18n.js'))).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(TC, 'lang/en.json'), 'utf8')) });

  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const fresh = (name) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const fmt = { fmtLen: (mm) => U.fmtLen(mm, 'mm'), fmtArea: (a) => U.fmtArea(a, 'mm'), t, unit: U.unitMark('mm') };
  /** The schedules as the Schedules panel gathers them (quantities-ui.js read() does the same with the page's state). */
  const allOf = (ed, extra = {}) => {
    const w = new ModelWriter(WebIFC, ed.api, ed.mid), snap = OPS.snapshotModel(ed);
    const loops = new Map(), loopsFor = (id) => { if (!loops.has(id)) loops.set(id, OPS.loopsOf(ed, id)); return loops.get(id); };
    const setting = QM.readMethodSetting(w), measure = QS.measureCtx(snap, setting.method, t);
    const sideOf = QS.grossSideReader(w);
    const base = SC.schedules(snap, new Map(), { ...fmt, sideOf, measure });
    const q = QS.quantitySchedules(snap, { ...fmt, sideOf, measure, metric: true, floors: QS.floorInputs(w, snap, loopsFor), ceilings: QS.ceilingInputs(w, snap, loopsFor), ...extra });
    return { w, snap, loopsFor, setting, measure, ...base, ...q };
  };
  const rowOf = (sc, name) => { const i = sc.rows.findIndex((r) => r[0] === name); return i < 0 ? null : { cells: sc.rows[i], nums: sc.nums[i], i }; };
  const qtoOf = (w, id, set = 'Qto_WallBaseQuantities') => QS.readQtoAreas(w, id, set);
  const methodOfSet = (w, id, set = 'Qto_WallBaseQuantities') => { const d = w.defNamed(id, set); return d ? val(d.line.MethodOfMeasurement) : null; };

  const UNIT = { name: 'Brick', length: 215, height: 65, width: 102.5 };
  const brick = { version: 1, key: 'wall-brick-m', name: 'Brick 215 test', exterior: true,
    layers: [{ mat: 'brick', t: 215, function: 'structure', core: true }, { mat: 'plaster', t: 13, function: 'finish', core: false }],
    takeoff: { unit: UNIT, mortar: { name: 'M4', joint: 10 }, rate: { amount: 850, currency: 'GBP', basis: 'k' } } };
  const PER = 1e6 / (225 * 75) * 2;                    // 118.518519 units per m2 of the 215 wall
  const MORTAR_M2 = 215e6 - PER * 215 * 65 * 102.5;    // 45 229 629.63 mm3 per m2
  const GROSS = 54000000, OPEN_ALL = 3920000;

  console.log('== the model: four brick walls 6000 x 4000, a partition, a door and three windows in the south wall');
  const ed = await fresh('Measure');
  const L1 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.saveWallAssembly(brick));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'wall-brick-m', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'int-2x4', height: 2700 }));
  const south = OPS.snapshotModel(ed).walls.find((x) => x.typeKey === 'wall-brick-m' && near(x.a[1], 0) && near(x.b[1], 0));
  for (const [typeKey, offset, width, height, sill] of [['door-single', 300, 900, 2100, 0], ['win-double-hung', 1500, 1200, 1200, 900], ['win-double-hung', 3300, 1000, 500, 1500], ['win-double-hung', 4700, 300, 300, 1800]])
    ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey, offset, width, height, sill, hand: 'a', face: 'left' }));
  let A = allOf(ed);
  const bw = A.snap.walls.filter((x) => x.typeKey === 'wall-brick-m'), part = A.snap.walls.find((x) => x.typeKey === 'int-2x4');
  ok(bw.length === 4 && part && A.snap.walls.length === 5 && bw.every((x) => near(x.t, 228, 0.01)) && A.snap.openings.length === 4, 'five walls (the brick ones 228 thick) and four openings', [A.snap.walls.length, A.snap.openings.length, bw.map((x) => x.t)]);
  ok(near(A.snap.openings.reduce((s, o) => s + o.width * o.height, 0), OPEN_ALL), 'the openings are 1 890 000 + 1 440 000 + 500 000 + 90 000 = 3 920 000 mm2', A.snap.openings.map((o) => [o.width, o.height]));

  console.log('== the default method: nothing changed, and the file holds no method');
  let r = rowOf(A.walls, 'Brick 215 test');
  ok(!A.measure && A.setting.id === 'cadcraft-default' && !A.setting.missing && A.walls.note === RULES['wall.side'].text, 'no method chosen = the CadCraft default; the rule note is the plain rule');
  ok(r && near(r.nums[3], GROSS) && near(r.nums[4], OPEN_ALL) && near(r.nums[2], GROSS - OPEN_ALL), 'default: 54 000 000 gross, 3 920 000 deducted, 50 080 000 net', r?.nums);
  ok(!new TextDecoder().decode(ed.save()).includes('CadCraft_Quantities') && methodOfSet(A.w, south.id) === 'BaseQuantities', 'no CadCraft_Quantities set in the file; the quantity set says BaseQuantities');
  ok(near(qtoOf(A.w, south.id).NetSideArea, 6000 * 2700 - OPEN_ALL), 'IFC NetSideArea of the south wall: 16 200 000 - 3 920 000 = 12 280 000');
  let tk = rowOf(A.walltakeoff, 'Brick 215 test');
  ok(tk && A.walltakeoff.head.slice(8).join('|') === 'Units per m² of leaf|Units to order|Mortar volume' && tk.cells[8] === '59.26' && tk.cells[9] === '5 936' && tk.cells[10] === '2.265 m³', 'takeoff data: 59.26 units per m2 of leaf, 5 936 units to order, 2.265 m3 of mortar', tk?.cells);
  ok(tk && tk.nums[4] === 5936 && near(tk.nums[5], 50.08 * MORTAR_M2, 10) && tk.nums[3] === 5045.6 && tk.cells[6] === '850.00 GBP / 1000 units' && tk.cells[7] === '5045.60 GBP', 'priced per 1000: 850 x 5.936 = 5045.60 GBP', tk?.nums);
  ok(A.walltakeoff.masonry[tk.i].leaves[0].across === 2 && A.walltakeoff.masonry[tk.i].assumedLeaves && /core layers are taken as the masonry leaves/.test(A.walltakeoff.note) && /Units per area of one leaf = 1 \/ \(\(unit length \+ joint\) x \(unit height \+ joint\)\)/.test(A.walltakeoff.note), 'the 215 leaf is two unit widths across; the note states the formulas and that the core was taken as the leaf');
  ok(rowOf(A.walltakeoff, 'Brick 215 test') && A.walltakeoff.rows.some((x) => x[0] !== 'Brick 215 test' && x[8] === '' && x[9] === '' && x[10] === ''), 'a type with no unit has empty unit and mortar cells');
  ok(A.walltakeoff.total[9] === '5 936' && A.walltakeoff.total[10] === '2.265 m³', 'the total row adds the units and the mortar');

  // ---- the hand-over, read by TakeoffCraft's own modules
  const sceneOf = (snap, l) => ({ walls: snap.walls.filter((x) => x.storey === l.id).map((x) => { const d = [x.b[0] - x.a[0], x.b[1] - x.a[1]], L = Math.hypot(...d), nn = [-d[1] / L * x.t / 2, d[0] / L * x.t / 2]; const poly = [[x.a[0] + nn[0], x.a[1] + nn[1]], [x.b[0] + nn[0], x.b[1] + nn[1]], [x.b[0] - nn[0], x.b[1] - nn[1]], [x.a[0] - nn[0], x.a[1] - nn[1]]]; return { key: x.id, poly, pieces: [poly] }; }), symbols: [], cut: [], below: [], rooms: [], dims: [] });
  const handOver = async (X, units) => {
    const snap = X.snap, w = X.w;
    const wallsD = snap.walls.map((x) => { const ty = x.assembly || MW.wallType(x.typeKey); return { ...x, typeName: ty ? MW.typeName(ty) : x.typeKey, exterior: ty?.exterior !== false }; });
    const openingsD = MO.readOpenings(w, null, MW.readWalls(w)).map((o) => ({ ...o, typeName: o.typeKey }));
    const input = TO.modelQuantities({ name: 'Measure', units, levels: snap.levels, scenes: new Map(snap.levels.map((l) => [l.id, sceneOf(snap, l)])), walls: wallsD, openings: openingsD, roofs: [], founds: [], cabinets: [], devs: [], rooms: [], lumber: [], fmtLen: (mm) => U.fmtLen(mm, units), date: '2026-11-11', method: X.setting.method }, t);
    const res = await TO.buildTakeoff(input);
    let emb = null;
    try {
      const pdfjs = await import(path.join(ROOT, 'tools/takeoffcraft-test/node_modules/pdfjs-dist/legacy/build/pdf.mjs'));
      const doc = await pdfjs.getDocument({ data: res.pdf.slice(), isEvalSupported: false, verbosity: 0 }).promise;
      emb = await EMB.readEmbedded(doc);
      await (doc.destroy?.() ?? doc.cleanup?.());
    } catch (e) { /* pdf.js for Node not installed: the builder's own object is read instead */ }
    return { input, res, loaded: TM.readProject(emb ? emb.takeoff : res.takeoff), viaPdf: !!emb };
  };
  const FT2 = 304.8 * 304.8;
  const takeoffSide = (h, typeKey) => {
    const Q = TM.quantities(h.loaded.state), o = { gross: 0, deductions: 0, net: 0, junctions: 0, units: null, mortar: null, amount: 0, rows: [] };
    const est = TM.estimate(h.loaded.state);
    for (const [key, def] of Object.entries(h.input.items)) {
      if (!key.startsWith('wall:' + typeKey + ':')) continue;
      const it = h.loaded.state.items.find((x) => x.name === def.name), wa = TM.wallArea(it, Q.get(it.id));
      o.gross += wa.gross * FT2; o.deductions += wa.deductions * FT2; o.net += wa.net * FT2; o.junctions += (wa.junctions || 0) * FT2;
      for (const row of est.rows.filter((x) => x.kind === 'component' && x.itemId === it.id)) {
        o.rows.push(row);
        if (/units to order/.test(row.name)) { o.units = (o.units || 0) + row.qty * (row.unit === '1000 EA' ? 1000 : 1); o.amount += row.matExt; }
        if (/^Mortar volume/.test(row.name)) { o.mortar = (o.mortar || 0) + row.qty * 1e9; o.amount += row.matExt; }
      }
    }
    return o;
  };

  // ================================================================================== every shipped method, three ways
  const EXPECT = {
    'cadcraft-default': { ded: 3920000, fin: 3920000, units: 5936, mortarK: 1 },
    'rics-nrm2-2021': { ded: 3330000, fin: 3330000, units: 6006, mortarK: 1 },
    'aaqs-africa-2015': { ded: 3330000, fin: 3330000, units: 6006, mortarK: 1 },
    'is-1200-1976': { ded: 3830000, fin: 3920000, units: 5947, mortarK: 1 },
    'us-bia-tn10-2009': { ded: 3920000, fin: 3920000, units: 6233, mortarK: 1.15 },
  };
  ok(M.builtinMethods().every((m) => EXPECT[m.id]) && M.builtinMethods().length === Object.keys(EXPECT).length, 'this test has hand numbers for every shipped method');
  for (const method of M.builtinMethods()) {
    const E = EXPECT[method.id], NET = GROSS - E.ded;
    console.log('== ' + method.id + ': ' + E.ded + ' deducted from the brick walls, net ' + NET);
    ed.modelChange(QI.setMeasureMethod(method.id));
    A = allOf(ed);
    r = rowOf(A.walls, 'Brick 215 test');
    ok(A.setting.id === method.id && !A.setting.missing && A.setting.method.id === method.id, 'the project holds the method (read back from the IFC)');
    ok(r && near(r.nums[3], GROSS) && near(r.nums[4], E.ded) && near(r.nums[2], NET) && near(r.nums[3] - r.nums[4], r.nums[2], 1e-6), 'Walls by type: 54 000 000 gross, ' + E.ded + ' deducted, ' + NET + ' net (gross - deductions = net)', r?.nums);
    const pr = rowOf(A.walls, MW.typeName(part.assembly || MW.wallType('int-2x4')));
    ok(pr && near(pr.nums[3], 10800000) && pr.nums[4] === 0, 'the partition: 10 800 000, nothing deducted (no shipped method takes anything off at junctions)', pr?.nums);
    if (method.id === 'cadcraft-default') ok(A.walls.note === RULES['wall.side'].text, 'the rule note is the plain default rule');
    else ok(A.walls.note.startsWith('Measurement method: ' + method.name + '. Source: ' + method.source.title) && /Unchecked by a quantity surveyor\./.test(A.walls.note) && A.walls.note.includes('read 2026-11-11') && A.walls.note.includes(M.methodRuleText(method, 'wall.side')), 'the rule note names the method, its source, the date read and "Unchecked by a quantity surveyor", then the rule', A.walls.note.slice(0, 160));
    // the file
    const q = qtoOf(A.w, south.id);
    ok(near(q.GrossSideArea, 16200000) && near(q.NetSideArea, 16200000 - E.ded), 'IFC: the south wall\'s NetSideArea = 16 200 000 - ' + E.ded + '; GrossSideArea stays 16 200 000', q);
    ok(methodOfSet(A.w, south.id) === (method.id === 'cadcraft-default' ? 'BaseQuantities' : method.id), 'IFC: the quantity set names the method (MethodOfMeasurement)', methodOfSet(A.w, south.id));
    // finishes
    const fin = A.finishes, fi = fin.rows.findIndex((x) => /plaster/i.test(x[0]));
    ok(fi >= 0 && near(fin.nums[fi][1], GROSS) && near(fin.nums[fi][2], E.fin) && near(fin.nums[fi][3], GROSS - E.fin), 'Finishes, plaster on the brick walls: ' + E.fin + ' deducted', fin.nums[fi]);
    // bricks and mortar
    tk = rowOf(A.walltakeoff, 'Brick 215 test');
    const mortar = NET / 1e6 * MORTAR_M2 * E.mortarK;
    ok(tk && tk.nums[4] === E.units && near(tk.nums[5], mortar, 100) && tk.nums[3] === Math.round(850 * E.units / 1000 * 100) / 100, 'bricks: ' + E.units + ' to order, mortar ' + (mortar / 1e9).toFixed(3) + ' m3, ' + (850 * E.units / 1000).toFixed(2) + ' GBP at 850 per 1000', tk?.nums);
    // TakeoffCraft, both unit systems
    for (const units of ['mm', 'ftin']) {
      const h = await handOver(A, units);
      const tb = h.loaded.ok ? takeoffSide(h, 'wall-brick-m') : null;
      ok(h.loaded.ok && !h.loaded.warnings.length && (method.id === 'cadcraft-default' ? !h.loaded.state.method : h.loaded.state.method?.id === method.id), units + ': TakeoffCraft loads the hand-over, no warnings, and it carries the method' + (h.viaPdf ? ' (read out of the PDF)' : ''), h.loaded.warnings || h.loaded.error);
      ok(tb && rel(tb.gross, GROSS) && rel(tb.deductions, E.ded) && rel(tb.net, NET), units + ': TWO-WAY AGREEMENT, brick walls gross / deductions / net (TakeoffCraft ' + Math.round(tb?.gross) + ' / ' + Math.round(tb?.deductions) + ' / ' + Math.round(tb?.net) + ')', tb);
      ok(tb && Math.abs(tb.units - E.units) <= 1 && rel(tb.mortar, mortar, 2e-4), units + ': TakeoffCraft counts ' + tb?.units + ' units (BimCraft ' + E.units + ') and ' + ((tb?.mortar || 0) / 1e9).toFixed(3) + ' m3 of mortar, from the two components', [tb?.units, tb?.mortar, mortar]);
      ok(tb && Math.abs(tb.amount - Math.round(850 * E.units / 1000 * 100)) <= 85, units + ': TakeoffCraft prices the units at 850 per 1000: ' + ((tb?.amount || 0) / 100).toFixed(2) + ' (BimCraft ' + (850 * E.units / 1000).toFixed(2) + ')', tb?.amount);
      const note = TM.methodNote(h.loaded.state);
      ok(method.id === 'cadcraft-default' ? note === '' : note === M.methodLine(method), units + ': TakeoffCraft names the method' + (method.id === 'cadcraft-default' ? ' (nothing to say for the default)' : ' and says it is unchecked'), note);
      if (units === 'mm' && method.id === 'rics-nrm2-2021') {
        const csv = TX.estimateCsv(h.loaded.state);
        ok(csv.includes('Measurement method: RICS NRM 2 (United Kingdom).') && csv.includes('Unchecked by a quantity surveyor.'), 'the exported estimate ends with the method line');
        // tools/takeoffcraft-test/browser-measure.mjs opens this very file in the real TakeoffCraft page (BKM_PDF = where to write it)
        if (process.env.BKM_PDF) { fs.writeFileSync(process.env.BKM_PDF, h.res.pdf); fs.writeFileSync(process.env.BKM_PDF + '.json', JSON.stringify({ gross: GROSS, deductions: E.ded, net: NET, units: E.units, mortar, amount: 850 * E.units / 1000, line: M.methodLine(method) })); }
      }
    }
  }

  console.log('== one undo step, and the default written back');
  ed.modelChange(QI.setMeasureMethod('rics-nrm2-2021'));
  ok(near(qtoOf(new ModelWriter(WebIFC, ed.api, ed.mid), south.id).NetSideArea, 16200000 - 3330000), 'NRM 2 chosen: NetSideArea 12 870 000');
  ed.undo();
  A = allOf(ed);
  ok(A.setting.id === 'us-bia-tn10-2009' && near(qtoOf(A.w, south.id).NetSideArea, 16200000 - 3920000) && methodOfSet(A.w, south.id) === 'us-bia-tn10-2009', 'Undo: the method before it and its quantities are back in one step');
  ed.modelChange(QI.setMeasureMethod('cadcraft-default'));
  A = allOf(ed);
  ok(!A.measure && near(qtoOf(A.w, south.id).NetSideArea, 16200000 - 3920000) && methodOfSet(A.w, south.id) === 'BaseQuantities' && A.walls.note === RULES['wall.side'].text, 'back to the default: the quantities, the set\'s label and the note are the default\'s');
  let threw = '';
  try { ed.modelChange(QI.setMeasureMethod('no-such-method')); } catch (e) { threw = e.message; }
  ok(threw !== '' && allOf(ed).setting.id === 'cadcraft-default', 'an unknown method id is refused, nothing changes');

  console.log('== edits under a method keep the file right');
  ed.modelChange(QI.setMeasureMethod('rics-nrm2-2021'));
  const east = OPS.snapshotModel(ed).walls.find((x) => x.typeKey === 'wall-brick-m' && near(x.a[0], 6000) && near(x.b[0], 6000));
  // a 600 x 600 window (0.36 m2) in the east wall is not deducted under NRM 2; a 1500 x 1500 (2.25 m2) is
  ed.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'win-double-hung', offset: 500, width: 600, height: 600, sill: 900, hand: 'a', face: 'left' }));
  A = allOf(ed);
  ok(near(qtoOf(A.w, east.id).NetSideArea, 4000 * 2700), 'a 0.36 m2 window placed under NRM 2: the wall\'s NetSideArea stays 10 800 000', qtoOf(A.w, east.id));
  ed.modelChange(OPS.placeOpening({ wall: east.guid, typeKey: 'win-double-hung', offset: 1800, width: 1500, height: 1500, sill: 600, hand: 'a', face: 'left' }));
  A = allOf(ed);
  ok(near(qtoOf(A.w, east.id).NetSideArea, 4000 * 2700 - 2250000) && methodOfSet(A.w, east.id) === 'rics-nrm2-2021', 'a 2.25 m2 window: NetSideArea 10 800 000 - 2 250 000 = 8 550 000, written by the edit itself');
  r = rowOf(A.walls, 'Brick 215 test');
  ok(near(r.nums[4], 3330000 + 2250000) && near(r.nums[2], GROSS - 5580000), 'the schedule agrees: 5 580 000 deducted', r.nums);
  ed.undo(); ed.undo();

  console.log('== floors and ceilings');
  {
    ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed: [1500, 2000], mode: 'room', height: 2400 }));
    ed.modelChange(MF.placeDrawnFloor({ storey: L1.guid, points: [[8000, 1000], [11000, 1000], [11000, 3000], [8000, 3000]], kind: 'concrete' }));
    let X = allOf(ed);
    const drawn = MF.readDrawnFloors(X.w)[0];
    ed.modelChange(MF.addFloorOpening(drawn.guid, [[9000, 1500], [10000, 1500], [10000, 2000], [9000, 2000]]));   // 1000 x 500 = 0.5 m2
    X = allOf(ed);
    let fl = X.floors.nums[X.floors.rows.findIndex((x) => /drawn outline/.test(x[1]))];
    ok(near(fl[0], 6000000) && near(fl[1], 500000) && near(fl[2], 5500000) && /Not confirmed from the source, so the CadCraft default is used for: the smallest opening deducted/.test(X.floors.note), 'NRM 2 has no confirmed rule for floors: the 0.5 m2 opening is deducted as by the default, and the note says so', fl);
    // an office file with a floor rule: openings of 0.5 m2 or less stay in
    const off = M.readMethodFile(JSON.stringify({ format: M.METHOD_FORMAT, version: 1, id: 'office-floors', name: 'Office floors', region: '', source: { title: 'Office notes', publisher: 'Test office', edition: '1', url: '', read: '2026-11-11' }, quantities: { floor: { openings: { state: 'stated', clause: 'note 2', minArea: 0.5, unit: 'm2' } }, 'finish.ceiling': { openings: { state: 'stated', clause: 'note 3', minArea: 1, unit: 'm2' } } } })).method;
    ed.modelChange(QI.setMeasureMethod('office-floors', off));
    X = allOf(ed);
    fl = X.floors.nums[X.floors.rows.findIndex((x) => /drawn outline/.test(x[1]))];
    const qf = qtoOf(X.w, MF.readDrawnFloors(X.w)[0].id, 'Qto_SlabBaseQuantities');
    ok(near(fl[1], 0) && near(fl[2], 6000000) && near(qf.NetArea, 6000000) && near(qf.GrossArea, 6000000) && methodOfSet(X.w, MF.readDrawnFloors(X.w)[0].id, 'Qto_SlabBaseQuantities') === 'office-floors', 'an office rule for floors: the 0.5 m2 opening stays in, schedule and IFC NetArea both 6 000 000', [fl, qf]);
    // a second, larger opening made under the method is deducted by the writer itself
    ed.modelChange(MF.addFloorOpening(MF.readDrawnFloors(X.w)[0].guid, [[8200, 2200], [9400, 2200], [9400, 2800], [8200, 2800]]));   // 1200 x 600 = 0.72 m2
    X = allOf(ed);
    ok(near(qtoOf(X.w, MF.readDrawnFloors(X.w)[0].id, 'Qto_SlabBaseQuantities').NetArea, 6000000 - 720000), 'a 0.72 m2 opening added under the method: NetArea 5 280 000 (only it is deducted)');
    const cq = QS.quantitySchedules(X.snap, { ...fmt, measure: X.measure, floors: [], ceilings: [{ id: 1, storey: L1.id, outer: 20e6, holes: [0.8e6, 1.5e6] }] }).finishes;
    const ci = cq.rows.findIndex((x) => x[1] === 'Ceilings');
    ok(near(cq.nums[ci][2], 1.5e6) && near(cq.nums[ci][3], 18.5e6), 'a ceiling with cut-outs of 0.8 and 1.5 m2 under a 1 m2 rule: only the 1.5 is deducted');
    ed.modelChange(QI.setMeasureMethod('cadcraft-default'));
    X = allOf(ed);
    ok(near(qtoOf(X.w, MF.readDrawnFloors(X.w)[0].id, 'Qto_SlabBaseQuantities').NetArea, 6000000 - 500000 - 720000), 'back on the default: both floor openings deducted in the file again (4 780 000)');
  }

  console.log('== an office file: to the face, 0.25 m2, reveals as a length, 7.5% waste; saved in the project');
  const OFFICE = { format: M.METHOD_FORMAT, version: 1, id: 'office-face', name: 'Office method (to the face)', region: 'Test',
    source: { title: 'Office measuring notes', publisher: 'Test office', edition: 'rev 3', url: 'https://example.com/measuring-notes', read: '2026-11-11', note: 'A test file.' },
    quantities: {
      'wall.side': { openings: { state: 'stated', clause: 'Office rule 3', minArea: 0.25, unit: 'm2', inclusive: true }, junctions: { state: 'stated', clause: 'Office rule 4', mode: 'face' } },
      'finish.wall': { reveals: { state: 'stated', clause: 'Office rule 7', measured: true, linearUpTo: 300 } },
    },
    masonry: { waste: { state: 'stated', clause: 'Office rule 9', pct: 7.5 } } };
  const own = M.readMethodFile(JSON.stringify(OFFICE));
  ok(own.method && !own.errors.length, 'the office file passes the check', own.errors);
  ed.modelChange(QI.setMeasureMethod('office-face', own.method));
  A = allOf(ed);
  const CUT = 912 * 2700, G2 = GROSS - CUT, N2 = G2 - 3830000;
  r = rowOf(A.walls, 'Brick 215 test');
  ok(r && near(r.nums[3], G2) && near(r.nums[4], 3830000) && near(r.nums[2], N2), 'brick walls to the face: gross 54 000 000 - 2 462 400 = 51 537 600; 3 830 000 deducted; net 47 707 600', r?.nums);
  let pr = rowOf(A.walls, MW.typeName(part.assembly || MW.wallType('int-2x4')));
  ok(pr && near(pr.nums[3], 10800000 - 615600) && near(pr.nums[2], 10184400), 'the partition loses 114 mm at each end: 10 800 000 - 615 600 = 10 184 400', pr?.nums);
  ok(/Every wall end that meets another wall is measured to the near face/.test(A.walls.note) && /Loaded from an office file\. Unchecked by a quantity surveyor\./.test(A.walls.note), 'the note says how junctions are measured and that this is an office file, unchecked');
  ok(near(qtoOf(A.w, south.id).NetSideArea, 16200000 - 228 * 2700 - 3830000) && near(qtoOf(A.w, part.id).NetSideArea, 10184400) && near(qtoOf(A.w, part.id).GrossSideArea, 10800000), 'IFC: the south wall 16 200 000 - 615 600 - 3 830 000 = 11 754 400; the partition 10 184 400 net, 10 800 000 gross', [qtoOf(A.w, south.id), qtoOf(A.w, part.id)]);
  tk = rowOf(A.walltakeoff, 'Brick 215 test');
  ok(tk && tk.nums[4] === 6079 && /with 7\.5% waste/.test(tk.cells[9]) && /Waste on units from the method: 7\.5% \(Office rule 9\)/.test(A.walltakeoff.note), 'bricks: 118.5185 x 47.7076 x 1.075 = 6078.30 → 6 079, and the note says where the 7.5% comes from', tk?.cells);
  let fin = A.finishes, fi = fin.rows.findIndex((x) => /plaster/i.test(x[0]));
  ok(fin.head.length === 8 && fin.head[6] === 'Reveals, area' && /^Reveals, length/.test(fin.head[7]) && near(fin.nums[fi][5], 14100) && fin.nums[fi][4] === 0 && near(fin.nums[fi][2], 3920000), 'Finishes gains the reveal columns: plaster reveals 5100 + 4800 + 3000 + 1200 = 14 100 mm as a length; all four openings deducted', [fin.head, fin.nums[fi]]);
  ok(/measured by their girth: as a length when no deeper than 300 mm/.test(fin.note), 'the finishes note says how reveals are measured');
  for (const units of ['mm', 'ftin']) {
    const h = await handOver(A, units);
    const tb = takeoffSide(h, 'wall-brick-m'), tp = takeoffSide(h, 'int-2x4');
    ok(h.loaded.ok && !h.loaded.warnings.length && h.loaded.state.method?.id === 'office-face' && h.loaded.state.method.file?.id === 'office-face', units + ': the hand-over carries the office file itself, so TakeoffCraft can measure by it', h.loaded.warnings || h.loaded.error);
    ok(rel(tb.gross, G2) && rel(tb.deductions, 3830000) && rel(tb.net, N2) && rel(tb.junctions, CUT), units + ': TWO-WAY AGREEMENT to the face, brick walls (TakeoffCraft ' + Math.round(tb.gross) + ' / ' + Math.round(tb.deductions) + ' / ' + Math.round(tb.net) + ', ' + Math.round(tb.junctions) + ' taken off at junctions)', tb);
    ok(rel(tp.gross, 10184400) && rel(tp.net, 10184400), units + ': and the partition (10 184 400)', tp);
    ok(Math.abs(tb.units - 6079) <= 1, units + ': TakeoffCraft\'s unit count with the office\'s 7.5% waste: ' + tb.units + ' (BimCraft 6079)');
  }
  const CSV = SC.scheduleCsv({ ...A.walls, csvHead: A.walls.head, csvRows: [...A.walls.rows, [A.measure.line]] });
  ok(CSV.includes('Office method (to the face)'), 'a CSV row can carry the method line (quantities-ui.js adds it under a method)');

  console.log('== save and reopen');
  const bytes = ed.save();
  ok(new TextDecoder().decode(bytes).includes('CadCraft_Quantities') && new TextDecoder().decode(bytes).includes('office-face'), 'the saved IFC holds the CadCraft_Quantities set on the project');
  const ed2 = await boot(bytes);
  let A2 = allOf(ed2);
  ok(A2.setting.id === 'office-face' && !A2.setting.missing && A2.setting.own?.name === 'Office method (to the face)' && JSON.stringify(A2.setting.own) === JSON.stringify(own.method), 'reopened on a computer that never loaded the office file: the method comes out of the project, unchanged');
  const r2 = rowOf(A2.walls, 'Brick 215 test'), tk2 = rowOf(A2.walltakeoff, 'Brick 215 test');
  ok(near(r2.nums[3], G2) && near(r2.nums[2], N2) && tk2.nums[4] === 6079 && A2.walls.note === A.walls.note, 'the schedules read the same after reopening: 51 537 600 gross, 47 707 600 net, 6 079 units');
  const south2 = A2.snap.walls.find((x) => x.typeKey === 'wall-brick-m' && near(x.a[1], 0) && near(x.b[1], 0));
  ok(near(qtoOf(A2.w, south2.id).NetSideArea, 11754400) && methodOfSet(A2.w, south2.id) === 'office-face', 'and so do the IFC quantities');
  // a project that names a method this computer does not have, and carries no file
  ed2.modelChange(OPS.op((w) => { w.upsertPset(ids(w.api, w.mid, 'IFCPROJECT')[0], QM.METHOD_PSET, [['Method', 'IFCIDENTIFIER', 'somebody-elses'], ['MethodFile', 'IFCTEXT', '']]); return { id: null, ids: [] }; }));
  A2 = allOf(ed2);
  ok(A2.setting.missing && A2.setting.id === 'somebody-elses' && !A2.measure && A2.setting.method.id === 'cadcraft-default', 'a named method that is not here and has no file: the default is used and the setting says the method is missing');
  ed2.modelChange(OPS.op((w) => { w.upsertPset(ids(w.api, w.mid, 'IFCPROJECT')[0], QM.METHOD_PSET, [['Method', 'IFCIDENTIFIER', 'office-face'], ['MethodFile', 'IFCTEXT', '{"format":"cadcraft-measurement-method","version":1,"id":"office-face","name":"<b>x</b>"']]); return { id: null, ids: [] }; }));
  ok(allOf(ed2).setting.missing, 'a method file in the project that does not pass the check is not used');

  console.log('== a cavity wall: two leaves');
  {
    const e3 = await fresh('Cavity');
    const K = OPS.snapshotModel(e3).levels[0];
    const cav = { version: 1, key: 'wall-cavity-m', name: 'Cavity test', exterior: true,
      layers: [{ mat: 'brick', t: 102.5, function: 'finish', core: false, masonry: true }, { mat: 'air', kind: 'cavity', t: 50, function: 'insulation', core: false, ventilation: 'unspecified' }, { mat: 'brick', t: 102.5, function: 'structure', core: true, masonry: true }, { mat: 'plaster', t: 13, function: 'finish', core: false }],
      takeoff: { unit: { ...UNIT, waste: 0 }, mortar: { name: 'M4', joint: 10 }, rate: { amount: 180, currency: 'GBP', basis: 'm3' } } };
    e3.modelChange(OPS.saveWallAssembly(cav));
    e3.modelChange(OPS.drawWalls({ storey: K.guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'wall-cavity-m', height: 2700 }));
    let X = allOf(e3);
    const ty = WA.readAssemblies(X.w).find((x) => x.key === 'wall-cavity-m');
    ok(ty && ty.layers.map((l) => l.masonry === true).join() === 'true,false,true,false' && !('masonry' in ty.layers[1]), 'the type keeps which layers are built of the unit (no field on the others)', ty?.layers);
    let row = rowOf(X.walltakeoff, 'Cavity test');
    const MORT = 2 * (102.5e6 - 59.25925925925926 * 215 * 65 * 102.5) * 13.5;   // 475 600 000 mm3
    ok(row && row.nums[4] === 1600 && near(row.nums[5], 475600000, 10) && near(MORT, 475600000, 10) && row.cells[9] === '1 600' && row.cells[10] === '0.476 m³', 'two leaves over 13.5 m2: 2 x 59.259 x 13.5 = 1 600 units; mortar 0.476 m3; the cavity and the plaster add nothing', row?.cells);
    ok(X.walltakeoff.masonry[row.i].leaves.length === 2 && !X.walltakeoff.masonry[row.i].assumedLeaves && !/core layers are taken/.test(X.walltakeoff.note), 'both leaves were ticked: nothing assumed');
    ok(row.nums[3] === 85.61 && row.cells[6] === '180.00 GBP / m³ mortar', 'priced per m3 of mortar: 180 x 0.4756 = 85.608 → 85.61', row.nums);
    const b2 = e3.save(), e4 = await boot(b2);
    X = allOf(e4);
    row = rowOf(X.walltakeoff, 'Cavity test');
    ok(row && row.nums[4] === 1600 && near(row.nums[5], 475600000, 10) && WA.readAssemblies(X.w).find((x) => x.key === 'wall-cavity-m').layers[0].masonry === true, 'saved and reopened: the same count, the leaves still ticked');
    const h = await handOver(X, 'mm');
    const tb = takeoffSide(h, 'wall-cavity-m');
    // the hand-over rounds sheet coordinates (1 part in 10 000), so a count that lands exactly on a whole number can come out one unit higher there
    ok(h.loaded.ok && Math.abs(tb.units - 1600) <= 1 && rel(tb.mortar, 475600000, 2e-4) && Math.abs(tb.amount - 8561) <= 2, 'TakeoffCraft: ' + tb.units + ' units (BimCraft 1600, within one unit), 0.476 m3 of mortar, priced 85.61 on the mortar component', [tb.units, tb.mortar, tb.amount]);
    ok(tb.rows.length === 3 && tb.rows[0].matExt === 0 && /rate in GBP/.test(tb.rows[0].name), 'the hand-over has three components: the type\'s line (no price: the rate is per m3 of mortar), the units, the mortar', tb.rows.map((x) => [x.name, x.unit, x.matExt]));
    // a rate per unit
    e4.modelChange(OPS.saveWallAssembly({ ...cav, takeoff: { ...cav.takeoff, unit: { ...UNIT, waste: 5 }, mortar: { name: 'M4', joint: 10, extra: 20 }, rate: { amount: 0.85, currency: 'GBP', basis: 'unit' } } }));
    X = allOf(e4);
    row = rowOf(X.walltakeoff, 'Cavity test');
    ok(row.nums[4] === 1680 && row.nums[3] === 1428 && near(row.nums[5], 475600000 * 1.2, 10) && /with 5% waste/.test(row.cells[9]), 'the type\'s own 5% waste and 20% extra mortar: 1600 x 1.05 = 1 680 units, 0.85 each = 1428.00, mortar x 1.2', row.nums);
    let msg = '';
    try { WA.validateAssembly({ ...cav, key: 'wall-cav-2', name: 'Cav 2', takeoff: { unit: { ...UNIT, waste: 150 } } }); } catch (e) { msg = e.message; }
    ok(/percentage from 0 to 100/.test(msg), 'a waste of 150% is refused by the type editor\'s check with a plain message', msg);
    const flagCavity = WA.validateAssembly({ ...cav, key: 'wall-cav-3', name: 'Cav 3', layers: cav.layers.map((l, i) => (i === 1 ? { ...l, masonry: true } : l)) });
    ok(!('masonry' in flagCavity.layers[1]), 'a cavity cannot be a masonry leaf: the flag is not kept on it');
  }
  ok(!I18.missing || ![...(I18.missing() || [])].some((k) => /^(qty|model\.sch|assembly\.takeoff|wall\.err\.takeoff|res\.to\.td)\./.test(k)), 'no missing language key among the new strings', I18.missing ? [...I18.missing()].filter((k) => /^(qty|model\.sch|assembly\.takeoff|wall\.err\.takeoff|res\.to\.td)\./.test(k)) : '');

  console.log('\n' + good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
