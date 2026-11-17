/* SPDX-License-Identifier: Apache-2.0 */
/** eltypes-test.mjs, second part: BK.15 generic walls and the sketch band, BK.22 rooms, BK.23 symbol links (bk-r3-types-10). */
export async function run(X) {
  const { ok, near, APP, fresh, boot, W, snap, fmt, save, tryKey, room, t, OPS, MW, WA, WPG, PM, RL, RE, AS, PS } = X;
  const imp = (f) => import(new URL('../../public_html/assets/apps/bimcraft/dev/' + f, import.meta.url));
  const TS = await imp('wall-typeswap.js');
  const FO = await imp('family-ops.js');
  const SL = await imp('symbol-link.js');
  const OT = await imp('opening-types.js');

  // ================================================================================================ BK.15
  console.log('== BK.15 generic starter walls and the sketch band');
  const g2 = MW.wallType('generic-200'), g1 = MW.wallType('generic-100');
  ok(g2 && g2.lod === 200 && g2.exterior && g2.layers.length === 1 && g2.layers[0].t === 200 && g2.layers[0].materialId === 'material-generic' && g2.layers[0].core && g2.layers[0].function === 'structure' && g1.lod === 200 && !g1.exterior && MW.typeThickness(g1) === 100, 'Generic wall 200 (exterior) and 100 (interior): one generic layer, LOD 200');
  ok(MW.typeName(g2) === 'Generic wall 200 mm (exterior)' && MW.wallType('ext-2x6').lod === undefined, 'named in the language file; the other starters have no tag of their own (as before)');
  ok(PM.EXTRA_MATERIALS.some((m) => m.id === 'material-generic' && m.fill === 'diagonal') && PM.STARTER_MATERIALS.length === 13 && !PM.STARTER_MATERIALS.some((m) => m.id === 'material-generic') && OT.DOOR_TYPES.every((x) => OT.openingLod(x) === 200) && OT.WINDOW_TYPES.every((x) => OT.openingLod(x) === 200), 'the generic material joins a project when a type uses it (a new project\'s library is the 13 it was); the starter doors and windows are generic kinds, LOD 200');
  let ed = await fresh('Sketch');
  const L1 = room(ed, 'generic-200');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [8000, 0], b: [8000, 4000] }], typeKey: 'ext-2x6', height: 2700 }));
  ed.modelChange(OPS.placeOpening({ wall: snap(ed).walls[0].guid, typeKey: 'door-single', offset: 1000, width: 900, height: 2100, sill: 0, hand: 'a', face: 'left' }));
  const scene = (detail, more = {}) => { const s = snap(ed); const outlines = MW.wallOutlines(s.walls.map((w) => ({ key: w.guid, a: w.a, b: w.b, t: w.t, bulge: w.bulge, off: w.joinOff }))); return { s, rows: WPG.wallPlanGraphics(s.walls, outlines, s.openings, PM.readMaterials(W(ed)), { detail, cutZ: 1200, scale: 50, ...more }) }; };
  for (const detail of ['coarse', 'medium', 'fine']) {
    const { s, rows } = scene(detail);
    const gen = rows.filter((r, i) => s.walls[i].typeKey === 'generic-200'), ext = rows.find((r, i) => s.walls[i].typeKey === 'ext-2x6');
    const want = detail === 'coarse' ? undefined : 4;
    ok(gen.length === 4 && gen.every((r) => r.sketch && r.layers.length === 1 && r.layers[0].fill === 'diagonal' && r.layers[0].hatch.length >= 8 && r.boundaries.length === 0 && r.layers[0].thickness === 200) && !ext.sketch && ext.layers?.length === want,
      detail + ': each generic wall is ONE hatched band with no layer lines; the 2x6 wall is drawn as before (' + (want ? want + ' layers' : 'envelope only') + ')', [gen.map((r) => r.layers?.length), ext.layers?.length]);
  }
  {
    const { s, rows } = scene('medium');
    const south = rows[0];
    // the band with the door: two pieces (left and right of the door), both hatched; every hatch stroke stays inside the wall's envelope (y within -100..100 for the south wall)
    const inY = south.layers[0].hatch.every((v, i) => i % 2 === 0 || (v >= -100.01 && v <= 100.01));
    ok(south.pieces.length === 2 && south.layers[0].polys.length === 2 && inY, 'a door splits the band in two pieces; the hatch stays inside the wall (200 thick about its centre line)', [south.pieces.length, inY]);
    const off = scene('medium', { sketch: false }).rows[0];
    ok(!off.sketch && off.layers.length === 1 && off.layers[0].materialId === 'material-generic' && off.layers[0].hatch.length === 0, 'with the setting off the wall is drawn by its layers like any other');
  }
  // geometry light, data complete: the generic wall is a full wall: type, thickness, quantities, IFC
  const wl = snap(ed).walls[0];
  const qa = X.QS.readQtoAreas(W(ed), wl.id, 'Qto_WallBaseQuantities');
  // south wall 5000 x 2700 = 13 500 000 gross; the door 900 x 2100 = 1 890 000 → 11 610 000 net
  ok(wl.t === 200 && wl.assembly?.lod === 200 && near(qa.GrossSideArea, 13500000, 2) && near(qa.NetSideArea, 11610000, 2), 'data complete: thickness 200, the tag, gross 13.5 m2 and net 11.61 m2 in the file', qa);
  // developed by a swap, not redrawn
  const guids = snap(ed).walls.filter((w) => w.typeKey === 'generic-200').map((w) => w.guid);
  const r = ed.modelChange(TS.swapWallType(guids, 'ext-300'));
  const after = snap(ed).walls.filter((w) => guids.includes(w.guid));
  ok(after.length === 4 && after.every((w) => w.typeKey === 'ext-300' && w.t === 300) && r.swap.walls.changed === 4 && snap(ed).openings.length === 1, 'the four generic walls swapped to Exterior masonry 300: the same four walls (GlobalIds), the door still there', r.swap.walls);
  ok(scene('medium').rows.filter((x) => x.sketch).length === 0 && scene('medium').rows[0].layers.length === 4, 'and now drawn with their four layers: no element was redrawn to become more developed');
  ed.modelChange(OPS.saveWallAssembly({ version: 1, key: 'wall-sk100', name: 'Massing wall', exterior: true, lod: 100, layers: [{ mat: 'concrete', t: 250, function: 'structure', core: true }] }));
  ed.modelChange(OPS.saveWallAssembly({ version: 1, key: 'wall-sp300', name: 'Specified wall', exterior: true, lod: 300, layers: [{ mat: 'concrete', t: 250, function: 'structure', core: true }] }));
  ed.modelChange(TS.swapWallType([guids[0]], 'wall-sk100')); ed.modelChange(TS.swapWallType([guids[1]], 'wall-sp300'));
  const rows2 = scene('fine'), by = (g) => rows2.rows[rows2.s.walls.findIndex((w) => w.guid === g)];
  ok(by(guids[0]).sketch && !by(guids[1]).sketch, 'a person\'s own type tagged LOD 100 is a sketch band; the same layers tagged LOD 300 are not');

  {
    // a section through one free-standing generic wall: one hatched band there too
    const WSG = await imp('wall-section-graphics.js');
    const e5 = await fresh('Section'); const L5 = snap(e5).levels[0];
    e5.modelChange(OPS.drawWalls({ storey: L5.guid, segs: [{ a: [0, 0], b: [4000, 0] }], typeKey: 'generic-200', height: 2700 }));
    e5.modelChange(OPS.drawWalls({ storey: L5.guid, segs: [{ a: [0, 3000], b: [4000, 3000] }], typeKey: 'ext-300', height: 2700 }));
    const s5 = snap(e5), mats = PM.readMaterials(W(e5));
    const sec = WSG.wallSectionGraphics({ cuts: [], warnings: [] }, s5.walls, s5.openings, mats, { dir: [1, 0], cut: { o: [2000, 0] }, detail: 'medium' });
    const gen = sec.cuts.find((c) => c.guid === s5.walls.find((w) => w.typeKey === 'generic-200').guid), ext = sec.cuts.find((c) => c.guid === s5.walls.find((w) => w.typeKey === 'ext-300').guid);
    ok(gen?.sketch && gen.layers.length === 1 && gen.layers[0].hatch.length >= 8 && gen.boundaries.length === 0 && ext && !ext.sketch && ext.layers.length === 4, 'in a section: the generic wall is one hatched band, the masonry wall its four layers', [gen?.layers?.length, ext?.layers?.length]);
  }

  // ================================================================================================ BK.22
  console.log('== BK.22 a device knows the room it stands in');
  ed = await fresh('Rooms');
  const L = room(ed);                       // room A: x 0..5000
  ed.modelChange(OPS.drawWalls({ storey: L.guid, segs: [{ a: [5000, 0], b: [9000, 0] }, { a: [9000, 0], b: [9000, 4000] }, { a: [9000, 4000], b: [5000, 4000] }], typeKey: 'int-2x4', height: 2700 }));   // room B: x 5000..9000
  let S = snap(ed);
  const spA = S.derived.spaces.find((x) => x.seed[0] < 5000), spB = S.derived.spaces.find((x) => x.seed[0] > 5000);
  ed.modelChange(OPS.changeDerived([spA.guid], { name: 'Kitchen' })); ed.modelChange(OPS.changeDerived([spB.guid], { name: 'Hall' }));
  S = snap(ed);
  const before = save(ed);
  ok(!/CadCraft_Location/.test(before), 'a building with no device has no location set in its file');
  const faces = S.walls.map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t }));
  const spot = RE.wallSpot(faces, [2000, 300]);        // the south wall's inside face, in room A
  ed.modelChange(RE.placeDevice({ level: L.guid, kind: 'switch', units: 'mm', ...spot, circuit: '3' }));
  ed.modelChange(RE.placeDevice({ level: L.guid, kind: 'downlight', units: 'mm', at: [7000, 2000], circuit: '3' }));   // in room B
  const spotOut = RE.wallSpot(faces, [2000, -300]);    // the south wall's OUTSIDE face
  ed.modelChange(RE.placeDevice({ level: L.guid, kind: 'socket', units: 'mm', ...spotOut, circuit: '1' }));
  let devs = RE.readDevices(W(ed));
  const sw = () => RE.readDevices(W(ed)).find((d) => d.kind === 'switch'), dl = () => RE.readDevices(W(ed)).find((d) => d.kind === 'downlight'), so = () => RE.readDevices(W(ed)).find((d) => d.kind === 'socket');
  ok(sw().room === spA.number + ' Kitchen' && dl().room === spB.number + ' Hall' && so().room === '', 'the switch on the wall is in "' + spA.number + ' Kitchen", the downlight in "' + spB.number + ' Hall", the socket on the outside face in no room', devs.map((d) => [d.kind, d.room]));
  ok(sw().circuit === '3' && sw().height === 1100 && sw().tag === 'S1', 'and still holds its circuit (3), its height (1100) and its tag (S1)');
  const loc = RL.readLocation(W(ed), sw().id);
  ok(loc.number === spA.number && loc.name === 'Kitchen' && loc.guid === spA.guid && /'CadCraft_Location'/.test(save(ed)), 'in the file: CadCraft_Location with Room, RoomNumber, RoomName and the room\'s GlobalId', loc);
  let sc = RE.deviceSchedule(RE.readDevices(W(ed)), snap(ed).levels, { t });
  ok(sc.head.length === 8 && sc.head[7] === 'Room' && sc.head[0] === 'Tag' && sc.rows.find((x) => x[0] === 'S1')[7] === spA.number + ' Kitchen' && sc.total.length === 8, 'the device schedule has Room as its last column (the others are where they were)', sc.head);
  // kept up to date: the room is renamed
  ed.modelChange(OPS.changeDerived([spA.guid], { name: 'Dining', number: 'G01' }));
  ok(sw().room === 'G01 Dining', 'the room is renamed and renumbered: the switch says "G01 Dining"', sw().room);
  ed.undo();
  ok(sw().room === spA.number + ' Kitchen', 'Undo: Kitchen again');
  // the device is moved to the other room
  ed.modelChange(RE.changeDevice(dl().guid, { at: [2500, 2000] }));
  ok(dl().room === spA.number + ' Kitchen', 'the downlight moved into the kitchen: its room follows');
  ed.modelChange(RE.changeDevice(sw().guid, { at: [7000, 300] }));
  ok(sw().room === spB.number + ' Hall' && sw().wall !== spot.wall, 'the switch moved to the hall\'s wall: its room follows');
  // the wall between the rooms is deleted: one room is left (the other space is dropped); every device is in the one that is left
  const mid = snap(ed).walls.find((x) => near(x.a[0], 5000) && near(x.b[0], 5000));
  ed.modelChange(OPS.removeWalls([mid.guid]));
  const left = snap(ed).derived.spaces;
  ok(left.length === 1 && sw().room === RL.roomLabel(left[0]) && dl().room === RL.roomLabel(left[0]), 'the wall between them deleted: one room left, both devices say that room (' + RL.roomLabel(left[0]) + ')', [sw().room, dl().room]);
  ed.undo();
  ok(sw().room === spB.number + ' Hall' && dl().room === spA.number + ' Kitchen', 'Undo: Hall and Kitchen again');
  // the general function: any point, live
  const ix = RL.roomIndex(snap(ed).derived.spaces, (st) => OPS.loopsOf(ed, st));
  ok(ix.of(L.id, [1000, 1000])?.name === 'Kitchen' && ix.of(L.id, [8000, 3000])?.name === 'Hall' && ix.of(L.id, [20000, 0]) === null && ix.of(L.id, [5000, 2000]) === null && ix.of(null, [1, 1]) === null, 'roomIndex().of: a point in the kitchen, in the hall, outside (none), inside the wall between them (none)');
  ok(RL.roomLabel(null) === '' && RL.roomLabel({ number: '12', name: '' }) === '12' && near(RL.intoRoom([0, 0], Math.PI / 2, 60)[1], 60), 'roomLabel and intoRoom');
  // a plan symbol (plumbing) reports its room through the same function
  ed.modelChange(PS.placePlanSymbol({ level: L.guid, set: 'plumbing', key: 'wc', name: 'WC', at: [7500, 2500], angle: Math.PI / 2 }));
  ok(PS.readPlanSymbols(W(ed))[0].room === spB.number + ' Hall', 'a plan symbol placed in the hall says so too', PS.readPlanSymbols(W(ed))[0].room);
  const re = await boot(new TextEncoder().encode(save(ed)));
  ok(RE.readDevices(W(re)).find((d) => d.kind === 'switch').room === spB.number + ' Hall', 'saved and reopened: the room is in the file');

  {
    // the room is an ordinary property: the property index (Find, Color by property, tag schedules) lists it
    const e2 = await X.quiet(X.IfcModel.create)(X.WebIFC, null), m2 = await X.quiet((b) => e2.load(b))(new TextEncoder().encode(save(ed)));
    const ed2 = new X.IfcEditor(X.WebIFC, e2);
    const ix = (await imp('ifc-props.js')).propertyIndex(X.WebIFC, ed2.api, ed2.mid, m2);
    ok(ix.fields.some((f) => f.id === 'p:CadCraft_Location.Room' && f.group === 'CadCraft_Location'), 'the property index lists CadCraft_Location.Room (Find, Color by property and tag schedules read it)', ix.fields.filter((f) => /Location/.test(f.id)).map((f) => f.id));
  }
  // ================================================================================================ BK.23
  console.log('== BK.23 an asset linked to a symbol: one element, the right form per view');
  ok(SL.formFor({ kind: '3d' }, { set: 'electrical', key: 'downlight' }) === 'body' && SL.formFor({ kind: 'section', form: 'symbols' }, { set: 'a', key: 'b' }) === 'body' && SL.formFor({ kind: 'plan' }, { set: 'a', key: 'b' }) === 'plan' && SL.formFor({ kind: 'plan', form: 'symbols' }, { set: 'a', key: 'b' }) === 'symbol' && SL.formFor({ kind: 'rcp', form: 'symbols' }, { set: 'a', key: 'b' }) === 'symbol' && SL.formFor({ kind: 'plan', form: 'symbols' }, null) === 'plan' && SL.formFor({ kind: 'callout', form: 'symbols' }, { set: 'a', key: 'b' }) === 'symbol',
    'the rule: 3D and sections show the body; a plan shows the plan form; a plan set to symbols shows the symbol of a linked element only');
  ok(SL.cleanLink({ set: 'electrical', key: 'downlight', turn: 90 }).turn === 90 && SL.cleanLink({ set: 'Bad Set', key: 'x' }) === null && SL.cleanLink({ set: 'a', key: 'b', turn: 45 }).turn === 0 && Object.keys(SL.cleanForms({ 'plan:abc': 'symbols', 'plan:def': 'plan', 'x:1': 'symbols' })).join() === 'plan:abc', 'links and view settings are read as untrusted data');
  ed.modelChange(FO.placeFamily({ storey: L.guid, family: 'fam-chair', x: 1500, y: 1500 }));
  ed.modelChange(FO.placeFamily({ storey: L.guid, family: 'fam-chair', x: 7500, y: 1500, rot: 90 }));
  const chairs = FO.readFamilyElements(W(ed));
  ok(chairs.length === 2, 'two chairs placed (stand-ins for a light fitting with a body)', chairs.length);
  const elementsBefore = countProducts(ed);
  ed.modelChange(AS.linkSymbol([chairs[0].id, chairs[1].id], { set: 'electrical', key: 'downlight' }));
  let links = AS.readSymbolLinks(W(ed));
  ok(links.length === 2 && links.every((l) => l.set === 'electrical' && l.key === 'downlight') && countProducts(ed) === elementsBefore, 'both linked to the downlight symbol: no element was added (' + elementsBefore + ' products before and after)');
  const a = links.find((l) => near(l.at[0], 1500)), b = links.find((l) => near(l.at[0], 7500));
  ok(a && b && near(a.at[1], 1500) && near(b.at[1], 1500) && near(Math.abs(b.angle - a.angle), Math.PI / 2, 1e-6), 'each symbol stands where its element stands, turned with it (the second by 90°)', links.map((l) => [l.at, l.angle]));
  ok(a.room === spA.number + ' Kitchen' && b.room === spB.number + ' Hall', 'a linked asset reports its room through the same function (Kitchen, Hall)', [a.room, b.room]);
  const lsch = AS.linkedSchedule(links, { levels: snap(ed).levels, t, nameOf: () => 'Downlight' });
  ok(lsch.rows.length === 2 && lsch.total[4] === '2' && lsch.kinds.length === 1 && lsch.kinds[0].count === 2 && lsch.rows[0][3] !== '' && SL.countLinked([...links, ...links])[0].count === 2, 'the Linked symbols schedule: two rows, total 2; counting the same elements twice still gives 2');
  ok(Object.keys(AS.readViewForms(W(ed))).length === 0, 'no view is set: every plan shows plan forms, as before');
  const vk = AS.viewKeyOf('plan', L.guid, null);
  ed.modelChange(AS.setViewForm(vk, 'symbols'));
  ok(AS.readViewForms(W(ed))[vk] === 'symbols' && SL.formFor({ kind: 'plan', form: AS.readViewForms(W(ed))[vk] }, a) === 'symbol' && SL.formFor({ kind: 'rcp', form: AS.readViewForms(W(ed))[AS.viewKeyOf('rcp', L.guid)] }, a) === 'plan', 'this level\'s plan set to symbols: the plan shows the symbol; its ceiling plan, not set, the plan form');
  ed.modelChange(AS.turnSymbol([a.guid]));
  ok(near(AS.readSymbolLinks(W(ed)).find((l) => l.guid === a.guid).angle - a.angle, Math.PI / 2, 1e-6), 'Turn: the symbol turns a quarter, the element does not');
  const re2 = await boot(new TextEncoder().encode(save(ed)));
  ok(AS.readSymbolLinks(W(re2)).length === 2 && AS.readViewForms(W(re2))[vk] === 'symbols' && /'CadCraft_SymbolLink'/.test(save(ed)), 'saved and reopened: the links and the view\'s setting are in the file; each element carries CadCraft_SymbolLink');
  ed.modelChange(AS.unlinkSymbol([a.guid]));
  ok(AS.readSymbolLinks(W(ed)).length === 1, 'one link removed: one left');
  ed.undo();
  ok(AS.readSymbolLinks(W(ed)).length === 2, 'Undo: two again');
  ed.modelChange(FO.removeFamilyElements([chairs[1].guid]));
  ok(AS.readSymbolLinks(W(ed)).length === 1, 'a linked element deleted: its link is not read any more');
  ed.modelChange(AS.setViewForm(vk, 'plan'));
  ok(Object.keys(AS.readViewForms(W(ed))).length === 0, 'the view set back to plan forms');
  ok(tryKey(() => ed.modelChange(AS.linkSymbol([chairs[0].id], { set: 'Bad', key: 'x' }))) === 'symlink.err.symbol' && tryKey(() => ed.modelChange(AS.linkSymbol([snap(ed).derived.spaces[0].id + 999999], { set: 'electrical', key: 'downlight' }))) === 'model.err.gone', 'a bad symbol and a missing element are refused');

  function countProducts(e) { return [...save(e).matchAll(/^#\d+=\s*IFC(FURNISHINGELEMENT|FURNITURE|BUILDINGELEMENTPROXY|LIGHTFIXTURE|FLOWTERMINAL|ANNOTATION|OUTLET|SWITCHINGDEVICE)\(/gm)].length; }
}
