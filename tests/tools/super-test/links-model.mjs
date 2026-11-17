/* SPDX-License-Identifier: Apache-2.0 */
/**
 * links-model.mjs: Super 0.1 package `links` against the apps' REAL engines, DOM-free (session bk-r4-links-10):
 *   node bin/test-bimcraft.mjs --super-links
 * A. BK.132: the small house (fixtures/bimcraft/small-house.ifc, tools/bimcraft-test/make-small-house.mjs). Its east wall is moved 2 000 mm east through
 *    BimCraft's own op; BimCraft's own Quantity totals (ifc-qto.js) are read per element before and after, as the Super page does, and Super's change list
 *    must say which quantities moved. By hand (walls on their centre lines, 300 thick outside, 100 partition, walls 2 438.4 mm high):
 *      south wall and north wall   10 m -> 12 m   (+2 m each)         gross side area 10 x 2.4384 = 24.384 -> 12 x 2.4384 = 29.2608 m2 (+4.8768)
 *      bedroom                     4 800 x 6 700 -> 6 800 x 6 700     its floor's perimeter 2 x (4.8 + 6.7) = 23 -> 2 x (6.8 + 6.7) = 27 m (+4)
 *      walls in the takeoff        10 + 7 + 10 + 7 + 7 = 41 m -> 45 m (+4)
 *      east, west and partition walls stay 7 m: not in the list.
 * B. BK.133: the small house as MASSING: one push/pull solid 10 x 7 m pulled 3 m in ModelCraft (its own kernel), handed over by ModelCraft's massing file
 *    (floor height 3 m: 1 floor, 70 m2, 210 m3), opened in BimCraft, developed by BimCraft's own "Develop" into 4 walls and 1 floor slab; Super's table and
 *    links must tie the solid to the mass, then each element back to the solid, through a project save and reopen. Then the solid is pulled 3 m more and
 *    the drift is reported (floors 1 -> 2, gross 70 -> 140 m2, volume 210 -> 420 m3, height 3 -> 6 m).
 */
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function superLinksMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 1e-4) => typeof a === 'number' && Math.abs(a - b) <= e;
  const SUP = path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev'), imp = (f) => import(pathToFileURL(path.join(SUP, f)));
  const P = await imp('super-project.js'), L = await imp('super-link.js'), LR = await imp('super-linkroles.js'), LS = await imp('super-linkstore.js'), CH = await imp('super-changes.js'), MS = await imp('super-massing.js');
  const routes = JSON.parse(fs.readFileSync(path.join(SUP, 'store-routes.json'), 'utf8'));
  const off = LS.hookLinkTable({ P, routes });
  const store = (p) => LS.createLinkStore({ P, getProject: () => p, routes });
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { propertyIndex } = await import(path.join(APP, 'ifc-props.js'));
  const Q = await import(path.join(APP, 'ifc-qto.js'));
  const { readWalls } = await import(path.join(APP, 'model-walls.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const MO = await import(path.join(APP, 'mass-options.js'));
  const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const model = await quiet((b) => eng.load(b))(bytes); const ed = new IfcEditor(WebIFC, eng); return { eng, model, ed, bytes }; };
  const reopen = async (B) => open(new Uint8Array(B.ed.save()));   // the index is of a model as loaded: what the page has after BimCraft's own reload of a change
  const index = (B) => propertyIndex(WebIFC, B.ed.api, B.model.modelID, B.model);
  /** What the Super page reads after each model change (supercadcraft.js syncQuantities): BimCraft's totals per element and per class. */
  const reading = (B) => {
    const ix = index(B), units = { from: P.ifcQuantityUnits(B.bytes) || 'm', to: 'm' };
    const per = Q.totals(ix, { groupBy: ['guid', 'cls', 'name'], sum: L.FIELD_IDS }), cls = Q.totals(ix, { groupBy: ['cls'], sum: L.FIELD_IDS });
    return { elements: CH.elementQuantities(per, units), items: L.itemsFromTotals(cls, { count: (l) => l + ' count', qty: (l, q) => l + ' ' + q }, units), classes: new Map(per.rows.map((r) => [String(r.values[0]), String(r.values[1])])) };
  };

  console.log('== A. BK.132: a wall moves in the model, the quantities follow, the change list says which');
  const houseBytes = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/bimcraft/small-house.ifc')));
  let B = await open(houseBytes);
  ok(JSON.stringify(P.ifcQuantityUnits(houseBytes)) === JSON.stringify({ length: 'mm', area: 'm', volume: 'm' }), 'the small house is in millimetres with areas in m2 and volumes in m3', P.ifcQuantityUnits(houseBytes));
  const walls = readWalls(new ModelWriter(WebIFC, B.ed.api, B.ed.mid));
  const wallAt = (f) => walls.find(f), south = wallAt((w) => w.a[1] === 0 && w.b[1] === 0), north = wallAt((w) => w.a[1] === 7000 && w.b[1] === 7000), east = wallAt((w) => w.a[0] === 10000 && w.b[0] === 10000), west = wallAt((w) => w.a[0] === 0 && w.b[0] === 0);
  ok(walls.length === 5 && south && north && east && west, 'five walls: south, north, east, west and the partition', walls.map((w) => [w.a, w.b]));
  const r0 = reading(B);
  const q = (r, g, k) => r.elements.get(g)?.q[k]?.qty;
  ok(q(r0, south.guid, 'length') === 10 && q(r0, east.guid, 'length') === 7 && near(q(r0, south.guid, 'grosssidearea'), 24.384), 'before: the south wall is 10 m long, 24.384 m2 gross side area; the east wall 7 m', [q(r0, south.guid, 'length'), q(r0, south.guid, 'grosssidearea')]);
  const item = (r, k) => r.items.find((i) => i.key === k)?.qty;
  ok(item(r0, 'ifc:ifcwall:length') === 41 && item(r0, 'ifc:ifcwall:count') === 5 && near(item(r0, 'ifc:ifcwall:grosssidearea'), 41 * 2.4384, 1e-3), 'before, as the takeoff gets it: 5 walls, 41 m, 41 x 2.4384 = 99.97 m2 (areas are no longer sent as 0: the unit fix)', [item(r0, 'ifc:ifcwall:length'), item(r0, 'ifc:ifcwall:grosssidearea')]);
  const tracker = CH.createTracker();
  ok(tracker.update(r0) === null, 'the first reading is the baseline');
  B.ed.modelChange(OPS.changeWall(east.guid, { a: [12000, east.a[1]], b: [12000, east.b[1]] }));   // the east wall moves 2 000 mm east
  B = await reopen(B);
  const r1 = reading(B), d = tracker.update(r1);
  const rowOf = (g, k) => d.elements.find((x) => x.element === g && x.quantity === k);
  ok(d && rowOf(south.guid, 'length')?.before === 10 && rowOf(south.guid, 'length')?.after === 12 && rowOf(south.guid, 'length')?.diff === 2 && rowOf(south.guid, 'length')?.change === 'changed', 'the south wall: length 10 -> 12 m, +2', rowOf(south.guid, 'length'));
  ok(rowOf(north.guid, 'length')?.before === 10 && rowOf(north.guid, 'length')?.after === 12 && rowOf(north.guid, 'length')?.diff === 2, 'the north wall: length 10 -> 12 m, +2', rowOf(north.guid, 'length'));
  ok(near(rowOf(south.guid, 'grosssidearea')?.after, 29.2608) && near(rowOf(south.guid, 'grosssidearea')?.diff, 4.8768), 'the south wall: gross side area 24.384 -> 29.2608 m2, +4.8768', rowOf(south.guid, 'grosssidearea'));
  ok(!rowOf(east.guid, 'length') && !rowOf(west.guid, 'length'), 'the east wall (moved, same length) and the west wall are not in the list as length changes');
  const floor = d.elements.find((x) => x.cls === 'IfcSlab' && x.quantity === 'perimeter' && x.change === 'changed');
  ok(floor && floor.before === 23 && floor.after === 27 && floor.diff === 4, 'the bedroom floor: perimeter 23 -> 27 m, +4 (the room grew from 4.8 to 6.8 m)', floor);
  const tot = d.items.find((x) => x.item_key === 'ifc:ifcwall:length');
  ok(tot && tot.before === 41 && tot.after === 45 && tot.diff === 4, 'the takeoff total: walls 41 -> 45 m, +4', tot);
  ok(d.elements.every((x) => x.unit && /^[0-9A-Za-z_$]{22}$/.test(x.element)), 'every row names its element (GlobalId) and its unit');
  const regen = d.elements.filter((x) => x.change === 'added' || x.change === 'removed').map((x) => x.cls + ':' + x.name);
  console.log('  note  BimCraft rebuilds the roof planes, soffit and fascia as new elements when the outline changes; they are listed as removed + added: ' + [...new Set(regen)].join(', '));
  // kept with the revision: written for the pending revision, saved, found again after reopening the project
  const p = P.newProject('Small house'); P.addMember(p, { app: 'bimcraft', name: 'small-house.ifc', bytes: houseBytes });
  P.toBytes(p, { now: new Date('2026-11-11T12:00:00Z') });   // revision 1: the house as opened
  const s = store(p), m = CH.mergeChanges(s.all('ver_qty_change'), d, { rev: p.revision + 1, by: 'tester' });
  for (const id of m.written) s.write('ver_qty_change', id, m.rows[id]);
  P.addMember(p, { app: 'bimcraft', name: 'small-house.ifc', bytes: B.bytes, role: 'saved' });
  const p2 = (await P.fromBytes(P.toBytes(p, { now: new Date('2026-11-11T13:00:00Z') }))).project;
  const list = CH.changeList(store(p2).all('ver_qty_change'));
  const kept = list.rows.find((x) => x.element === south.guid && x.quantity === 'length');
  ok(p2.revision === 2 && list.rev === 2 && list.rows.length === d.elements.length + d.items.length && kept && kept.before === 10 && kept.after === 12 && kept.by === 'tester', 'saved with revision 2 and reopened: the list is there, the south wall 10 -> 12 m among its ' + list.rows.length + ' rows', [p2.revision, list.rev, list.rows.length]);

  console.log('== B. BK.133: the small house as a massing solid -> elements -> the link back');
  const MC = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
  const MCI = await import(path.join(MC, 'i18n.js'));
  MCI.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(MC, 'lang/en.json'), 'utf8')) });
  const M = await import(path.join(MC, 'model.js')), V = await import(path.join(MC, 'vec.js'));
  const MM = await import(path.join(MC, 'massing-mc.js'));
  const SOL = await import(pathToFileURL(path.join(ROOT, 'lib/massing/solid.js')));
  const model = new M.Model(); model.units = 'm';
  const iid = model.change('Small house', (mm) => {
    const d0 = mm.root, b = new Set(d0.faces.keys());
    M.addPolygon(d0, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 10, 7)); M.pushPull(d0, [...d0.faces.keys()].find((id) => !b.has(id)), 3);
    const mine = [...d0.faces.keys()].filter((id) => !b.has(id));
    return mm.makeGroup(d0, M.connected(d0, [{ t: 'f', id: mine[0] }]), 'group', 'Small house');
  });
  const solids = MM.massingSolids(model);
  ok(solids.length === 1 && String(solids[0].iid) === String(iid) && solids[0].name === 'Small house', 'ModelCraft: one solid, the group "Small house" (10 x 7 m pulled 3 m)');
  const file = MM.massingFile(model, { floorHeight: 3, set: 'Small house', name: 'small-house', now: new Date('2026-11-11T12:00:00Z') });
  const rep = file.report[0];
  ok(rep.floors === 1 && near(rep.footprint, 70) && near(rep.gross, 70) && near(rep.volume, 210) && rep.prism && !rep.simplified, 'the mass by hand: 1 floor of 3 m, footprint 70 m2, gross 70 m2, volume 210 m3, a prism', [rep.floors, rep.footprint, rep.gross, rep.volume]);
  let H = await open(new TextEncoder().encode(file.text));
  const Wr = () => new ModelWriter(WebIFC, H.ed.api, H.ed.mid);
  const options = MO.readOptionSets(Wr()).flatMap((st) => st.options.map((o) => ({ guid: o.guid, massId: o.massId, set: st.set })));
  ok(options.length === 1 && options[0].massId === MS.massId(0) && /^[0-9A-Za-z_$]{22}$/.test(options[0].guid), 'BimCraft reads the file as one massing option whose mass id is opt1 (lib/massing), with a GlobalId', options);
  const pr = P.newProject('Small house massing');
  const mm = P.addMember(pr, { app: 'modelcraft', name: 'small-house.modelcraft', bytes: new TextEncoder().encode('{}') });
  const im = P.addMember(pr, { app: 'bimcraft', name: file.fileName, bytes: H.bytes, role: 'saved' });
  const st = store(pr);
  const mr = MS.massRows({ modelMember: mm.id, ifcMember: im.id, solids: solids.map((x) => ({ iid: x.iid, name: x.name })), report: file.report, options, rev: 1 });
  for (const [id, row] of Object.entries(mr.rows)) st.write('sc_massing', id, row);
  for (const l of mr.links) P.addLink(pr, l);
  const solid = MS.solidRef(mm.id, iid), proxy = { app: 'bimcraft', member: im.id, id: options[0].guid };
  ok(pr.links.length === 1 && LR.roleOf(pr.links[0]) === 'massing-of' && LR.pointingAt(pr.links, proxy).map((x) => [x.role, x.other.id]).join() === ['massing-of', String(iid)].join(), 'while it is a mass: the solid is the massing-of the proxy (one link; from the proxy the solid is found)');
  P.toBytes(pr, { now: new Date('2026-11-11T12:00:00Z') });   // revision 1
  const before = reading(H).classes;
  ok(before.get(options[0].guid) === 'IfcBuildingElementProxy' && ![...before.values()].some((c) => MS.ELEMENT_CLASS.test(c)), 'before Develop the model holds the proxy and no building element', [...before.values()]);
  const made = H.ed.modelChange(MO.developOption(options[0].guid, { typeKey: 'ext-2x6' }));
  H = await reopen(H);
  const after = reading(H).classes, dev = MS.developed(st.all('sc_massing'), before, after, { rev: 2 });
  const row = Object.values(dev.rows)[0];
  const classes = row.elements.map((g) => after.get(g)).sort();
  ok(row.state === 'developed' && classes.join() === 'IfcSlab,IfcWall,IfcWall,IfcWall,IfcWall' && !dev.ambiguous, 'BimCraft\'s Develop made 4 walls and 1 floor slab (real elements, not spaces or proxies), all found as what the mass became', classes);
  ok(!after.has(options[0].guid), 'the proxy is gone from the model');
  const opIds = (made?.ids || []).length;
  ok(opIds === 0 || opIds === row.elements.length, 'the same number of elements as BimCraft\'s own op reports (' + opIds + ')', [opIds, row.elements.length]);
  for (const [id, r] of Object.entries(dev.rows)) st.write('sc_massing', id, r);
  for (const e of dev.ended) for (const l of P.queryLinks(pr, { kind: e.kind })) if (JSON.stringify(l.to) === JSON.stringify(e.to)) P.removeLink(pr, l.id);
  for (const l of dev.links) P.addLink(pr, l);
  P.addMember(pr, { app: 'bimcraft', name: file.fileName, bytes: H.bytes, role: 'saved' });
  const pr2 = (await P.fromBytes(P.toBytes(pr, { now: new Date('2026-11-11T13:00:00Z') }))).project, st2 = store(pr2);
  const back = LR.pointingAt(pr2.links, solid);
  ok(back.length === 5 && back.every((x) => x.role === 'derives-from' && x.other.app === 'bimcraft' && after.has(x.other.id)), 'saved and reopened: the solid is pointed at by its 5 elements, each "derives-from"', back.map((x) => [x.role, x.other.id]));
  const aWall = row.elements.find((g) => after.get(g) === 'IfcWall');
  const fromWall = LR.pointingAt(pr2.links, { app: 'bimcraft', member: im.id, id: aWall }, { both: true });
  ok(fromWall.length === 1 && fromWall[0].other.app === 'modelcraft' && fromWall[0].other.id === String(iid), 'and back: from a wall, the solid it was made from');
  const tbl = JSON.parse(new TextDecoder().decode((await P.unzip(P.toBytes(pr2))).get('Small house massing/Data/links/rows/sc_link.json').bytes)).rows;
  ok(tbl.l1.role === 'massing-of' && tbl.l1.deleted_rev === 2 && Object.values(tbl).filter((r) => r.role === 'derives-from' && r.deleted_rev == null).length === 5 && st2.read('sc_massing', mm.id + ':' + iid).state === 'developed', 'the tables: sc_link has the ended massing-of row (tombstoned in revision 2) and 5 derives-from rows; sc_massing says developed');
  // the walls stand where the solid's footprint is: 10 x 7 m
  const dw = readWalls(new ModelWriter(WebIFC, H.ed.api, H.ed.mid));
  const xs = dw.flatMap((w) => [w.a[0], w.b[0]]), ys = dw.flatMap((w) => [w.a[1], w.b[1]]);
  ok(dw.length === 4 && near(Math.max(...xs) - Math.min(...xs), 10000, 400) && near(Math.max(...ys) - Math.min(...ys), 7000, 400), 'the four walls go round the 10 x 7 m footprint (location lines within a wall thickness of it)', [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]);
  // the limit, shown: the solid is pulled 3 m more AFTER its elements were made; nothing moves in the model, the drift is reported
  model.change('Pull', (m2) => { const def = m2.def(m2.root.insts.get(iid).def); const top = [...def.faces].find(([, f]) => V.dot(M.faceNormal(def, f), [0, 0, 1]) > 1 - 1e-9)[0]; M.pushPull(def, top, 3); });
  const now = SOL.massFromSolid({ tris: MM.massingSolids(model)[0].tris, floorHeight: 3, name: 'Small house' });
  const drift = MS.massDrift(st2.read('sc_massing', mm.id + ':' + iid), now);
  ok(JSON.stringify(drift.map((x) => [x.field, x.was, x.now])) === JSON.stringify([['floors', 1, 2], ['gross', 70, 140], ['volume', 210, 420], ['height', 3, 6]]), 'the solid pulled to 6 m afterwards: drift floors 1 -> 2, gross 70 -> 140 m2, volume 210 -> 420 m3, height 3 -> 6 m (the walls are not moved: that is the stated limit)', drift);

  off();
  console.log(`\nsuper-links (real engines): ${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
