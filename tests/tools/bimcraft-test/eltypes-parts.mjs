/* SPDX-License-Identifier: Apache-2.0 */
/** The checks of eltypes-test.mjs (bk-r3-types-10). Every expected value is worked out in the comment beside it. */
export async function run(X) {
  const { ok, near, WebIFC, fresh, boot, W, snap, fmt, save, tryKey, room, layersOf, t, OPS, MW, MS, MF, WA, ET, EO, LQ, WPG, PM, TP, TLI } = X;
  // ================================================================================================ BK.24 the one model
  console.log('== BK.24 one layered-type model: floor, roof and ceiling types are wall-assemblies.js records');
  ok(WA.assemblyKind('wall-a') === 'wall' && WA.assemblyKind('floor-a') === 'floor' && WA.assemblyKind('roof-a') === 'roof' && WA.assemblyKind('ceiling-a') === 'ceiling' && WA.assemblyKind('ext-2x6') === null, 'the kind of a type is its key\'s prefix');
  for (const kind of ET.ELEMENT_KINDS) {
    const list = ET.ELEMENT_STARTERS[kind].map((x) => ET.starterRecipe(kind, x.key));
    ok(list.length === 3 && list.every((x) => x && x.starter && x.custom && x.name && !x.name.startsWith('eltype.')) && list[0].lod === 200 && list[0].layers.length === 1 && list[0].layers[0].materialId === 'material-generic', kind + ': three starters pass the wall type editor\'s own check; the first is generic, one layer, LOD 200', list.map((x) => x?.name));
  }
  // floor-timber-joist: 20 + 18 + 235 + 12.5 = 285.5; floor-concrete-screed: 15 + 50 + 50 + 150 = 265; roof-timber: 20 + 0 + 18 + 200 + 12.5 = 250.5;
  // roof-concrete-flat: 0 + 120 + 180 + 10 = 310; ceiling-suspended: 150 + 15 = 165
  const tot = (k, key) => ET.typeTotal(ET.starterRecipe(k, key));
  ok(near(tot('floor', 'floor-timber-joist'), 285.5, 1e-9) && tot('floor', 'floor-concrete-screed') === 265 && near(tot('roof', 'roof-timber'), 250.5, 1e-9) && tot('roof', 'roof-concrete-flat') === 310 && tot('ceiling', 'ceiling-suspended') === 165, 'starter thicknesses: 285.5, 265, 250.5, 310, 165 mm');
  ok(tryKey(() => WA.validateAssembly({ version: 1, key: 'slab-x', name: 'X', layers: [{ mat: 'concrete', t: 100, function: 'structure', core: true }] })) !== null, 'a key of no kind is refused');

  let ed = await fresh('Types');
  const L1 = room(ed);   // a 5000 x 4000 room on centre lines, int-2x4 (114.3 thick)
  const seed = [2500, 2000];
  // room inside faces: (5000 - 114.3) x (4000 - 114.3) = 4885.7 x 3885.7 = 18 984 364.49 mm2
  const ROOM = 4885.7 * 3885.7;
  ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed, mode: 'room', kind: 'concrete' }));
  let fl = snap(ed).derived.floors[0];
  ok(fl.typeKey === '' && near(fl.thickness, 152.4), 'a floor placed with no type is what it was before: no type, 6 in (152.4 mm)', fl);
  const before = save(ed);
  ok(!/CadCraft_FloorType|IFCSLABTYPE/.test(before) && !/TypeKey'.{0,40}floor-/.test(before), 'a file with no typed floor has no floor type in it');

  console.log('== BK.24 / BK.15 a type swap changes the element without redrawing it');
  let r = ed.modelChange(EO.swapElementType([fl.guid], 'floor-generic'));
  let f2 = snap(ed).derived.floors[0];
  ok(f2.guid === fl.guid && f2.id === fl.id && f2.typeKey === 'floor-generic' && f2.thickness === 300 && f2.seed[0] === fl.seed[0], 'generic floor: the SAME element (GlobalId, line, seed), now 300 thick', f2);
  ok(r.swap.changed === 1 && r.swap.thickness.after === 300 && near(r.swap.thickness.before[0], 152.4) && r.swap.lod.to === 200 && r.swap.lod.from[0] === null, 'the swap reports 152.4 → 300 and LOD not set → 200', r.swap);
  r = ed.modelChange(EO.swapElementType([fl.guid], 'floor-concrete-screed'));
  f2 = snap(ed).derived.floors[0];
  ok(f2.guid === fl.guid && f2.typeKey === 'floor-concrete-screed' && f2.thickness === 265 && r.swap.lod.from[0] === 200 && r.swap.lod.to === 300, 'developed by a second swap (LOD 200 → 300, 265 thick): still the same element');
  const w = W(ed);
  ok(WA.readAssemblies(w, 'floor').map((x) => x.key).sort().join() === 'floor-concrete-screed,floor-generic' && WA.readAssemblies(w).length === 0 && WA.readAssemblies(w, 'roof').length === 0, 'the two starters used are project floor types now; no wall or roof type was made');
  let txt = save(ed);
  ok(/IFCSLABTYPE\(/.test(txt) && /'CadCraft_FloorType'/.test(txt) && /'LOD',\$,IFCINTEGER\(300\)/.test(txt) && /IFCMATERIALLAYERSET\(/.test(txt), 'in the file: IfcSlabType, CadCraft_FloorType, the LOD property, a material layer set');
  // Qto: net area = the room; volume = area x 265
  const q = QSareas(X, ed, f2.id, 'Qto_SlabBaseQuantities');
  ok(near(q.NetArea, ROOM, 2) && near(q.GrossArea, ROOM, 2), 'the floor\'s quantity set keeps the room\'s area (18 984 364 mm2)', q);
  ed.undo(); ed.undo();
  f2 = snap(ed).derived.floors[0];
  ok(f2.typeKey === '' && near(f2.thickness, 152.4) && WA.readAssemblies(W(ed), 'floor').length === 0, 'two Undos: no type, 152.4 again, no floor type left in the project');
  ed.redo(); ed.redo();
  ok(snap(ed).derived.floors[0].typeKey === 'floor-concrete-screed', 'two Redos bring the type back');
  ok(tryKey(() => ed.modelChange(EO.swapElementType([fl.guid], 'roof-generic'))) === 'model.err.eltype.kind' && tryKey(() => ed.modelChange(EO.swapElementType([fl.guid], 'floor-nope'))) === 'model.err.eltype', 'a roof type on a floor and an unknown type are refused');
  ed.modelChange(OPS.changeDerived([fl.guid], { thickness: 500 }));
  ok(snap(ed).derived.floors[0].thickness === 265, 'a typed floor keeps its type\'s thickness when a thickness is typed (the type gives it)');

  console.log('== BK.24 ceiling, roof, drawn floor; placed with a type');
  ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed, mode: 'room', height: 2400, typeKey: 'ceiling-suspended' }));
  ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed, typeKey: 'roof-timber' }));
  ed.modelChange(MF.placeDrawnFloor({ storey: L1.guid, points: [[6000, 0], [8000, 0], [8000, 1000], [6000, 1000]], typeKey: 'floor-timber-joist' }));
  let S = snap(ed);
  const ce = S.derived.ceilings[0], rf = S.derived.roofs[0], df = MF.readDrawnFloors(W(ed))[0];
  ok(ce.typeKey === 'ceiling-suspended' && ce.thickness === 165 && rf.typeKey === 'roof-timber' && near(rf.thickness, 250.5, 1e-6) && df.typeKey === 'floor-timber-joist' && near(df.thickness, 285.5, 1e-6), 'ceiling 165, roof 250.5, drawn floor 285.5: each as thick as its type', [ce.thickness, rf.thickness, df.thickness]);
  txt = save(ed);
  ok(/IFCCOVERINGTYPE\(/.test(txt) && /'CadCraft_CeilingType'/.test(txt) && /'CadCraft_RoofType'/.test(txt), 'in the file: IfcCoveringType (ceiling) and the roof\'s IfcSlabType');

  console.log('== BK.24 per-layer area and volume');
  let rows = layersOf(ed);
  const of = (el, key) => rows.filter((x) => x.element === el && x.typeKey === key);
  const fs = of('floor', 'floor-concrete-screed');
  // 4 layers on the room's net area 18 984 364.49: volumes = area x 15, 50, 50, 150
  ok(fs.length === 4 && fs.every((x) => near(x.area, ROOM, 2) && x.count === 1 && x.lod === 300) && fs.map((x) => x.thickness).join() === '15,50,50,150' && near(fs[3].volume, ROOM * 150, 400) && near(fs[0].volume, ROOM * 15, 40), 'the screed floor: 4 rows on 18.984 m2; volumes area x 15 / 50 / 50 / 150 (concrete 2.848 m3)', fs.map((x) => [x.material, x.thickness, x.area, x.volume]));
  ok(fs[0].material === 'Floor finish' && fs[3].material === 'Concrete' && fs[3].core && fs[3].function === 'structure', 'layers are named by their material, top first; the concrete is the core');
  const dfr = of('floor', 'floor-timber-joist');
  // the drawn floor 2000 x 1000 = 2 000 000 mm2; joists 235 → 470 000 000 mm3
  ok(dfr.length === 4 && near(dfr[2].area, 2e6) && near(dfr[2].volume, 2e6 * 235), 'the drawn floor: 2 m2 a layer; the joist layer 0.470 m3');
  const cs = of('ceiling', 'ceiling-suspended');
  ok(cs.length === 2 && cs[0].kind === 'cavity' && near(cs[1].area, ROOM, 2) && near(cs[1].volume, ROOM * 15, 40), 'the ceiling: a cavity row and the tile on the room\'s area (0.285 m3)');
  const rr = of('roof', 'roof-timber');
  ok(rr.length === 5 && rr[1].thickness === 0 && rr[1].volume === 0 && rr[0].area > 20e6 && near(rr[3].volume, rr[0].area * 200, 1), 'the roof: 5 rows on its sloped area; the membrane has an area and no volume; framing = area x 200', rr.map((x) => [x.thickness, Math.round(x.area)]));
  const wl = of('wall', 'int-2x4');
  // walls: 18 000 x 2700 = 48 600 000 net (no openings); layers 12.7 / 88.9 / 12.7 → studs volume 48.6e6 x 88.9 = 4 320 540 000
  ok(wl.length === 3 && wl.every((x) => near(x.area, 48600000) && x.count === 4) && near(wl[1].volume, 48600000 * 88.9, 1), 'walls: 3 rows on 48.6 m2 net (4 walls); the stud layer 4.321 m3', wl.map((x) => x.volume));
  const sc = LQ.layerSchedule(rows, fmt);
  const solid = rows.filter((x) => x.kind !== 'cavity').reduce((s, x) => s + x.volume, 0);
  ok(sc.head.length === 10 && sc.rows.length === rows.length && sc.nums.every((n) => n.length === 4) && sc.total[9] === LQ.fmtVolume(solid) && /m³$/.test(sc.total[9]) && sc.note.length > 20, 'the Layers schedule: 10 columns, a row a layer, the total volume leaves the cavity out', [sc.head, sc.total]);
  const mt = LQ.materialTotals(rows);
  const gy = mt.find((m) => m.materialId === 'material-gypsum');
  // gypsum: walls 2 x 48.6e6 x 12.7 + drawn floor 2e6 x 12.5 + roof area x 12.5
  ok(gy && near(gy.volume, 2 * 48600000 * 12.7 + 2e6 * 12.5 + rr[0].area * 12.5, 5) && !mt.some((m) => m.material === 'Air cavity'), 'by material: gypsum from the walls, the drawn floor and the roof adds up; no cavity row');
  // an untyped floor is one row of its own thickness
  const ed0 = await fresh('Plain'); const L0 = room(ed0);
  ed0.modelChange(OPS.placeFloor({ storey: L0.guid, seed, mode: 'room', kind: 'wood' }));
  const r0 = layersOf(ed0).filter((x) => x.element === 'floor');
  ok(r0.length === 1 && r0[0].typeKey === '' && near(r0[0].thickness, 304.8) && near(r0[0].volume, ROOM * 304.8, 700) && r0[0].lod === null, 'a floor with no type: one row, its own 304.8 mm, no LOD');

  console.log('== BK.24 the measurement method applies');
  const QM = X.QM, QSm = X.QS;
  const methods = await import(new URL('../../public_html/assets/apps/bimcraft/dev/quantities/methods.js', import.meta.url));
  ed.modelChange(OPS.placeOpening({ wall: snap(ed).walls[0].guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  rows = layersOf(ed);
  // the door 900 x 2100 = 1 890 000 deducted once: 46 710 000 net
  ok(near(rows.find((x) => x.element === 'wall').area, 48600000 - 1890000), 'default method: the door is deducted from the walls\' layers (46.71 m2)');
  const SC = await import(new URL('../../public_html/assets/apps/bimcraft/dev/model-schedule.js', import.meta.url));
  let ran = 0;
  for (const m of methods.builtinMethods().filter((x) => !methods.isDefault(x))) {
    const mc = QSm.measureCtx(snap(ed), m, t), w2 = W(ed);
    const walls = SC.schedules(snap(ed), new Map(), { ...fmt, sideOf: QSm.grossSideReader(w2), measure: mc }).walls;
    const rowsM = layersOf(ed, mc), wa = rowsM.find((x) => x.element === 'wall').area;
    // the same number as Walls by type under that method (net area is nums[..][2])
    ok(near(wa, walls.nums[0][2], 1e-3) && LQ.layerSchedule(rowsM, { ...fmt, measure: mc }).note.includes(mc.line), 'under ' + m.id + ': the walls\' layer area is Walls by type\'s net area (' + Math.round(wa) + ' mm2) and the note names the method', [wa, walls.nums[0]]);
    ran++;
  }
  ok(ran >= 1, 'at least one shipped measurement method was run (' + ran + ')');
  console.log('== BK.24 edit a type: every element of it follows, one undo step');
  const scr = WA.readAssemblies(W(ed), 'floor').find((x) => x.key === 'floor-concrete-screed');
  const thicker = { ...scr, layers: scr.layers.map((l) => (l.mat === 'concrete' ? { ...l, t: 200 } : l)) };
  ed.modelChange(EO.saveElementType(thicker));
  ok(snap(ed).derived.floors[0].thickness === 315 && near(layersOf(ed).find((x) => x.typeKey === 'floor-concrete-screed' && x.material === 'Concrete').volume, ROOM * 200, 500), 'concrete 150 → 200: the floor is 315 thick and its concrete volume is area x 200');
  ed.undo();
  ok(snap(ed).derived.floors[0].thickness === 265, 'one Undo: 265 again');
  ok(tryKey(() => ed.modelChange(EO.saveElementType({ ...scr, key: 'wall-x' }))) === 'model.err.eltype', 'a wall type is not saved through the element types');

  console.log('== BK.24 save and reopen; a pack; a Library item of the Types kind');
  const re = await boot(new TextEncoder().encode(save(ed)));
  const S2 = snap(re);
  ok(S2.derived.floors[0].typeKey === 'floor-concrete-screed' && S2.derived.ceilings[0].typeKey === 'ceiling-suspended' && S2.derived.roofs[0].typeKey === 'roof-timber' && MF.readDrawnFloors(W(re))[0].typeKey === 'floor-timber-joist' && ET.elementType('floor', 'floor-concrete-screed', W(re)).lod === 300, 'reopened: every element has its type and the types their LOD');
  const pack = TP.makeTypePack(W(ed), { keys: ['floor-concrete-screed', 'roof-timber', 'ceiling-suspended', 'ext-2x6'] });
  ok(pack.types.map((x) => x.kind).join() === 'floor,roof,ceiling,wall' && pack.types[0].ifc.class === 'IfcSlabType' && pack.types[0].ifc.predefined === 'FLOOR' && pack.types[1].ifc.predefined === 'ROOF' && pack.types[2].ifc.class === 'IfcCoveringType' && pack.types[0].thickness === 265, 'a pack holds floor, roof, ceiling and wall types, each with its IFC class', pack.types.map((x) => x.ifc));
  const rd = TP.readTypePack(JSON.stringify(pack));
  ok(rd.ok && TP.compareTypePacks(pack, rd.pack).length === 0, 'the pack passes the format check and comes back equal', rd.errors);
  const badKind = structuredClone(pack); badKind.types[0].kind = 'roof';
  const badCls = structuredClone(pack); badCls.types[0].ifc.class = 'IfcWallType';
  ok(!TP.readTypePack(badKind).ok && !TP.readTypePack(badCls).ok && /IfcSlabType/.test(TP.readTypePack(badCls).errors[0]), 'a floor recipe called a roof, or with a wall\'s IFC class, is refused in plain words', TP.readTypePack(badCls).errors);
  const ed3 = await fresh('Empty');
  let ir = ed3.modelChange(TP.importTypePack(pack));
  ok(ir.summary.added.length === 4 && ir.summary.kinds.floor === 1 && ir.summary.kinds.roof === 1 && ir.summary.kinds.ceiling === 1 && ir.summary.kinds.wall === 1 && WA.readAssemblies(W(ed3), 'ceiling').length === 1, 'imported into an empty project: four types, one of each kind', ir.summary);
  ok(TP.compareTypePacks(pack, TP.makeTypePack(W(ed3), { keys: ['floor-concrete-screed', 'roof-timber', 'ceiling-suspended', 'wall-ext-2x6'] })).filter((d) => !/wall-ext-2x6|ext-2x6/.test(d)).length === 0, 'and packed again from there: the floor, roof and ceiling types are equal');
  ir = ed.modelChange(TP.importTypePack(pack, { conflict: 'replace' }));
  ok(ir.summary.inUse.length === 3, 'replace: a floor, roof or ceiling type that elements use is not replaced from a pack', ir.summary);
  const item = TLI.typeToLibraryItem(W(ed), 'floor-concrete-screed');
  ok(item.kind === 'type' && item.category === 'types/floors' && item.ifc.class === 'IfcSlabType' && item.type.element === 'floor' && item.type.lod === 300 && item.type.thickness === 265 && item.type.layers === 4 && item.type.pack.types.length === 1 && item.body === null, 'a floor type as a Library item: kind type, types/floors, IfcSlabType, LOD 300, 265 mm, 4 layers, a one-type pack');
  const LI = await import(new URL('../../public_html/assets/apps/bimcraft/dev/libitem.js', import.meta.url));
  const v = LI.validateItem(item, { partial: true });
  ok(v.ok, 'the Library\'s own check (libitem.js validateItem) accepts it', v.errors);
  const back = TLI.typeFromLibraryItem(JSON.parse(JSON.stringify(item)));
  ok(back.ok && back.element === 'floor' && back.key === 'floor-concrete-screed', 'and it reads back as the type', back.errors);
  const ed4 = await fresh('FromLibrary'); const L4 = room(ed4);
  ed4.modelChange(TLI.importTypeItem(item));
  ed4.modelChange(OPS.placeFloor({ storey: L4.guid, seed, mode: 'room', typeKey: 'floor-concrete-screed' }));
  ok(snap(ed4).derived.floors[0].thickness === 265 && layersOf(ed4).filter((x) => x.element === 'floor').length === 4, 'added to another project from the item and used: a 265 floor with four layer rows');
  const wi = TLI.typeToLibraryItem(W(ed4), 'int-2x4');
  ok(wi.category === 'types/walls' && wi.type.element === 'wall' && LI.validateItem(wi, { partial: true }).ok && !('lod' in wi.type), 'a wall type goes out the same way (types/walls); a type with no LOD has no lod field');
  const broken = JSON.parse(JSON.stringify(item)); broken.type.pack.types[0].recipe.layers[0].t = -5;
  ok(!TLI.typeFromLibraryItem(broken).ok && tryKey(() => TLI.importTypeItem(broken)) === 'typeitem.err.format', 'an item whose recipe the editor would refuse is refused');

  await (await import('./eltypes-parts2.mjs')).run(X);
}
function QSareas(X, ed, id, name) { return X.QS.readQtoAreas(X.W(ed), id, name) || {}; }
