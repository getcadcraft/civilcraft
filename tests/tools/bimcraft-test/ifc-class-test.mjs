/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-class-test.mjs — every element has an IFC class whatever library it came from (0.10 BK.96, session bk-content-10), DOM-free:
 *   node bin/test-bimcraft.mjs --ifcclass
 * 1. The item checker (libitem.js validateItem): an item of a kind that is placed must name its class; the kinds that are records need none.
 * 2. Every way the apps make an item gives it a class. 3. Drawn elements and placed library items are written with their class, and a
 * library item of any class the file's schema has is written as that class (not as a proxy). bin/test-library-ifc-class.php runs the
 * same documents through the PHP checker and compares.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function ifcClassMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, n = 0;
  const ok = (cond, label, detail = '') => { n++; if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 600) + ')' : '')); };
  const L = await import(path.join(APP, 'libitem.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { classesFor } = await import(path.join(APP, 'ifc-place.js'));
  const { ids, val } = await import(path.join(APP, 'ifc-util.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const dec = (b) => new TextDecoder().decode(b);
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };

  console.log('== the checker');
  const base = (kind, category, ifc) => ({ format: 'cadcraft-library-item', format_version: 1, name: 'T ' + kind, kind, category, ...(ifc ? { ifc } : {}),
    plan: { layers: [{ name: 'A', color: 7 }], entities: [{ type: 'line', layer: 'A', color: null, x1: 0, y1: 0, x2: 100, y2: 0 }] }, body: null, params: {} });
  const errs = (o) => L.validateItem(o, { partial: true }).errors;
  const WHY = 'ifc: is required: every item placed in a drawing or model names its IFC class (ifc.class, for example IfcFurniture; IfcAnnotation for a drawing-only symbol or detail), so other software reads it as what it is';
  const CAT = { equipment: 'other/other', furniture: 'furniture/tables', fixture: 'plumbing/fixtures', door: 'openings/doors', window: 'openings/windows', symbol: 'symbols/annotation', detail: 'details/generic', plant: 'plants/species' };
  ok(L.ELEMENT_KINDS.join() === 'equipment,furniture,fixture,door,window,symbol,detail,plant' && L.ELEMENT_KINDS.every((k) => L.KINDS.includes(k)), 'the kinds that are placed: equipment, furniture, fixture, door, window, symbol, detail, plant');
  ok(L.ELEMENT_KINDS.every((k) => errs(base(k, CAT[k])).includes(WHY)), 'each of them without an ifc block is refused, with the reason in plain words', L.ELEMENT_KINDS.filter((k) => !errs(base(k, CAT[k])).includes(WHY)));
  ok(L.ELEMENT_KINDS.every((k) => errs(base(k, CAT[k], { predefined: 'NOTDEFINED' })).includes('ifc.class: must be an IFC class name') && errs(base(k, CAT[k], { class: '' })).includes('ifc.class: must be an IFC class name') && errs(base(k, CAT[k], { class: 'Wall' })).includes('ifc.class: must be an IFC class name')),
    'an ifc block with no class, an empty class or a name that is not an IFC class is refused too');
  const good = { equipment: 'IfcElectricAppliance', furniture: 'IfcFurniture', fixture: 'IfcSanitaryTerminal', door: 'IfcDoor', window: 'IfcWindow', symbol: 'IfcAnnotation', detail: 'IfcAnnotation', plant: 'IfcGeographicElement' };
  ok(L.ELEMENT_KINDS.filter((k) => k !== 'plant').every((k) => errs(base(k, CAT[k], { class: good[k], predefined: 'NOTDEFINED' })).length === 0), 'with a class each is accepted; a drawing-only symbol or detail takes IfcAnnotation', L.ELEMENT_KINDS.map((k) => errs(base(k, CAT[k], { class: good[k] }))).flat().slice(0, 3));
  ok(!errs(base('plant', CAT.plant, { class: 'IfcGeographicElement' })).some((e) => /^ifc/.test(e)), 'a plant with IfcGeographicElement has no class error (its plant record is checked apart)');
  ok(errs(base('door', CAT.door, { class: 'IfcWall' })).includes('ifc.class: must be IfcDoor for a door') && errs(base('window', CAT.window, { class: 'IfcDoor' })).includes('ifc.class: must be IfcWindow for a window') && errs(base('door', CAT.door, { class: 'IfcDoor' })).length === 0,
    'a door is an IfcDoor and a window an IfcWindow: any other class is refused by name');
  const records = { material: 'materials/brick', regulation: 'regulations/building', component: 'components/process', template: 'templates/specification' };
  ok(Object.entries(records).every(([k, c]) => !errs(base(k, c)).some((e) => /^ifc/.test(e))), 'the kinds that are records, not elements (material, regulation, component, template), need no class', Object.entries(records).map(([k, c]) => errs(base(k, c)).filter((e) => /^ifc/.test(e))).flat());
  ok(Object.entries(records).every(([k, c]) => errs(base(k, c, { class: 'nope' })).includes('ifc.class: must be an IFC class name')), 'but a class they do carry is still checked');
  ok(L.validateItem(base('equipment', 'other/other')).errors.includes(WHY), 'the full check (a published item) refuses it as well as the partial one (an upload)');
  ok(fs.readFileSync(path.join(APP, 'libitem.js')).equals(fs.readFileSync(path.join(APP, '../../cadcraft/dev/libitem.js'))), 'CadCraft\'s copy of the checker is byte-identical');

  console.log('== every maker of items gives a class');
  const csv = L.itemsFromCsv('name,width (mm),depth (mm),height (mm)\nPrep table,1200,600,900\nMixer,500,500,700\n', { category: 'foodservice/prep' });
  const csvItems = csv.items || csv;
  ok(Array.isArray(csvItems) && csvItems.length === 2 && csvItems.every((it) => /^Ifc/.test(it.ifc?.class || '') && !errs(it).some((e) => /^ifc/.test(e))), 'a CSV list with no class column: each item still has one', Array.isArray(csvItems) ? csvItems.map((i) => i.ifc) : Object.keys(csv));
  const doors = L.itemsFromCsv('name,width (mm),depth (mm),height (mm)\nDoor 900,900,45,2100\n', { category: 'openings/doors' });
  ok(((doors.items || doors)[0]?.ifc?.class) === 'IfcDoor', 'a CSV row in the Doors category is an IfcDoor');
  const SH = await import(path.join(ROOT, 'lib/shapes/items.js'));
  const SP = await import(path.join(ROOT, 'lib/shapes/parts.js'));
  const SS = await import(path.join(ROOT, 'lib/shapes/sections.js'));
  const parts = SP.LIBRARY_SET.map(([family, size, opts]) => SP.makePart(family, size, opts)).filter((r) => r.ok).map((r) => SH.partItem(r.part));
  const byClass = {};
  for (const p of parts) { const k = p.ifc?.class + '.' + p.ifc?.predefined; byClass[k] = (byClass[k] || 0) + 1; }
  ok(parts.length > 50 && parts.every((p) => errs(p).length === 0) && byClass['IfcMechanicalFastener.BOLT'] > 0 && byClass['IfcMechanicalFastener.SCREW'] > 0 && byClass['IfcDiscreteAccessory.NOTDEFINED'] > 0,
    'the standard parts (' + parts.length + '): bolts and screws are mechanical fasteners of that type, bearings and gears discrete accessories; all pass the checker', byClass);
  const sec = SS.findSection ? SS.findSection('IPE300') : null;
  const secItem = sec ? SH.sectionItem(sec) : null;
  ok(secItem && secItem.ifc.class === 'IfcMember' && errs(secItem).length === 0, 'a steel section is an IfcMember', secItem?.ifc);
  const EN = await import(path.join(ROOT, 'lib/entourage/entourage.js'));
  const ent = EN.entourage().map((e) => EN.libraryItem(e));
  ok(ent.length > 5 && ent.every((it) => errs(it).length === 0) && ent.some((it) => it.ifc.class === 'IfcTransportElement') && ent.some((it) => it.ifc.class === 'IfcGeographicElement'), 'the entourage set (' + ent.length + '): vehicles are transport elements, plants and rocks geographic elements; all pass');

  console.log('== drawn and placed elements in the file');
  const ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Classes', levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 'k.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const L1 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [8000, 0] }, { a: [8000, 0], b: [8000, 6000] }, { a: [8000, 6000], b: [0, 6000] }, { a: [0, 6000], b: [0, 0] }], typeKey: 'ext-2x6', height: 2700 }));
  const walls = OPS.snapshotModel(ed).walls;
  ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'door-single', offset: 1000, sill: 0 }));
  ed.modelChange(OPS.placeOpening({ wall: walls[2].guid, typeKey: 'win-fixed', offset: 2000, sill: 900 }));
  ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed: [4000, 3000], mode: 'building' }));
  ed.modelChange(OPS.placeCeiling({ storey: L1.guid, seed: [4000, 3000], height: 2400 }));
  ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed: [4000, 3000], pitch: 30 }));
  const box = (w, d, h) => ({ type: 'box', x: -w / 2, y: -d / 2, z: 0, w, d, h });
  const item = (name, kind, category, cls, predefined = 'NOTDEFINED', i = 0) => ({ format: 'cadcraft-library-item', format_version: 1, uuid: '0b9a4d6e-1c2f-4a8b-9d3e-5f6a7b8c9d' + String(10 + i), version: 1, name, kind, category,
    description: '', maker: '', model: '', ifc: { class: cls, predefined }, plan: { layers: [{ name: 'A', color: 7 }], entities: [{ type: 'poly', layer: 'A', color: null, closed: true, pts: [[-300, -300], [300, -300], [300, 300], [-300, 300]] }] },
    body: box(600, 600, 900), clearances: [], params: { width: 600, depth: 600, height: 900 }, source_attrs: {}, license: { id: 'CC0-1.0' }, provenance: { library: 'test', sha256: null, published_at: null } });
  // [item, the class the file must show]
  const placed = [
    [item('Range', 'equipment', 'foodservice/cooking', 'IfcElectricAppliance', 'NOTDEFINED', 0), 'IFCELECTRICAPPLIANCE'],
    [item('Table', 'furniture', 'furniture/tables', 'IfcFurniture', 'TABLE', 1), 'IFCFURNITURE'],
    [item('Basin', 'fixture', 'plumbing/fixtures', 'IfcSanitaryTerminal', 'WASHHANDBASIN', 2), 'IFCSANITARYTERMINAL'],
    [item('Boiler', 'equipment', 'mechanical/equipment', 'IfcBoiler', 'WATER', 3), 'IFCBOILER'],
    [item('Steel post', 'detail', 'structural/steel', 'IfcMember', 'POST', 4), 'IFCMEMBER'],
    [item('Hex bolt', 'detail', 'mechanical/parts', 'IfcMechanicalFastener', 'BOLT', 5), 'IFCMECHANICALFASTENER'],
    [item('Oak', 'plant', 'plants/species', 'IfcGeographicElement', 'USERDEFINED', 6), 'IFCGEOGRAPHICELEMENT'],
    [item('Car', 'symbol', 'site/vehicles', 'IfcTransportElement', 'NOTDEFINED', 7), 'IFCTRANSPORTELEMENT'],
    [item('Bearing', 'detail', 'mechanical/parts', 'IfcDiscreteAccessory', 'NOTDEFINED', 8), 'IFCDISCRETEACCESSORY'],
    [item('North arrow', 'symbol', 'symbols/annotation', 'IfcAnnotation', 'NOTDEFINED', 9), 'IFCBUILDINGELEMENTPROXY'],        // no type class: a proxy
    [item('Odd thing', 'equipment', 'other/other', 'IfcNoSuchClassAnywhere', 'NOTDEFINED', 10), 'IFCBUILDINGELEMENTPROXY'],   // a class the schema lacks: a proxy
    [item('Pump', 'equipment', 'mechanical/equipment', 'IfcPump', 'NOT_A_VALUE', 11), 'IFCPUMP'],                             // a predefined type the schema lacks: NOTDEFINED
  ];
  const made = [];
  placed.forEach(([it, want], i) => { const r = ed.placeItem(it, { storey: L1.id, x: 1000 + i * 500, y: 3000, rot: 0, itemNumber: String(i + 1), quantity: 1 }); made.push({ r, it, want }); });
  const again = ed.placeItem(placed[3][0], { storey: L1.id, x: 500, y: 5000, rot: 0, itemNumber: '99', quantity: 1 });
  ok(again.typeId === made[3].r.typeId && again.typeCreated === false, 'a second placement of the same item reuses its type (one IfcBoilerType)');
  const text = dec(ed.save());
  const ed2 = await boot(ed.save());
  const up = (id) => String(ed2.api.GetLine(ed2.mid, id, false)?.constructor?.name || '').toUpperCase();
  const line = (re) => (text.match(re) || [])[0] || '';
  const got = made.map((m) => { const g = val(ed.api.GetLine(ed.mid, m.r.id, false).GlobalId); const w2 = new ModelWriter(WebIFC, ed2.api, ed2.mid); let id = null; for (const x of ids(ed2.api, ed2.mid, 'IFCELEMENT', true)) if (w2.guidOf(x) === g) { id = x; break; } return { name: m.it.name, want: m.want, cls: id ? up(id) : 'MISSING' }; });
  ok(got.every((g) => g.cls === g.want), 'saved and reopened, each placed library item is the class it named: appliance, furniture, sanitary terminal, boiler, member, fastener, geographic element, transport element, discrete accessory, pump', got.filter((g) => g.cls !== g.want));
  ok(got[9].cls === 'IFCBUILDINGELEMENTPROXY' && got[10].cls === 'IFCBUILDINGELEMENTPROXY', 'a class with no type class (IfcAnnotation) and a class the schema does not have still give an element with a class: a building element proxy, never nothing');
  ok(/IFCBOILER\([^;]*\.NOTDEFINED\.\)|IFCBOILER\([^;]*\.WATER\.\)/.test(text) && /IFCBOILERTYPE\([^;]*\.WATER\.\)/.test(text) && (text.match(/IFCBOILERTYPE\(/g) || []).length === 1 && /IFCMEMBERTYPE\([^;]*\.POST\.\)/.test(text) && /IFCMECHANICALFASTENERTYPE\([^;]*\.BOLT\.[^;]*\)/.test(text),
    'each has the type class that goes with it, with the item\'s predefined type (IfcBoilerType WATER, IfcMemberType POST, IfcMechanicalFastenerType BOLT)', [line(/IFCBOILERTYPE\([^;]*/), line(/IFCMEMBERTYPE\([^;]*/)]);
  ok(/IFCPUMPTYPE\([^;]*\.NOTDEFINED\.\)/.test(text) && /IFCGEOGRAPHICELEMENTTYPE\([^;]*\.NOTDEFINED\.\)/.test(text) && /IFCGEOGRAPHICELEMENT\([^;]*\.USERDEFINED\.\)/.test(text),
    'a predefined type the schema does not have becomes NOTDEFINED; USERDEFINED is kept on the element (it has an ObjectType) and not put on a type with no ElementType', [line(/IFCPUMPTYPE\([^;]*/), line(/IFCGEOGRAPHICELEMENT\([^;]*/)]);
  // every element in the file: a concrete IFC class, and what was drawn is what it should be
  const all = ids(ed2.api, ed2.mid, 'IFCELEMENT', true).map(up);
  const count = (c) => all.filter((x) => x === c).length;
  ok(all.length >= 19 && all.every((c) => /^IFC[A-Z0-9]+$/.test(c) && c !== 'IFCELEMENT'), all.length + ' elements in the file, every one a concrete IFC class', all.filter((c) => !/^IFC[A-Z0-9]+$/.test(c)));
  ok(count('IFCWALL') + count('IFCWALLSTANDARDCASE') === 4 && count('IFCDOOR') === 1 && count('IFCWINDOW') === 1 && count('IFCSLAB') >= 1 && count('IFCCOVERING') >= 1 && (count('IFCROOF') + count('IFCSLAB')) >= 2,
    'drawn: 4 walls are IfcWall, the door IfcDoor, the window IfcWindow, the floor an IfcSlab, the ceiling an IfcCovering (the floor finish is one too), the roof an IfcRoof or roof slab', Object.fromEntries([...new Set(all)].map((c) => [c, count(c)])));
  // IFC2X3: classes the older schema lacks fall back, the ones it has are kept
  const x3 = await boot(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', 'ios-steel-ifc2x3.ifc')));
  const sch3 = x3.api.file(x3.mid).schema;
  ok(classesFor(placed[4][0], 'IFC2X3', sch3).occ === 'IFCMEMBER' && classesFor(placed[6][0], 'IFC2X3', sch3).occ === 'IFCBUILDINGELEMENTPROXY' && classesFor(placed[0][0], 'IFC2X3', sch3).occ === 'IFCFLOWTERMINAL' && classesFor(placed[4][0], 'IFC2X3').occ === 'IFCBUILDINGELEMENTPROXY',
    'IFC2X3: a member stays a member, a class that schema does not have (IfcGeographicElement) is a proxy, the older pairs are unchanged; with no schema at hand the old proxy rule applies');
  const L3 = OPS.snapshotModel(x3).levels[0];
  const m3 = x3.placeItem(placed[4][0], { storey: L3.id, x: 0, y: 0, rot: 0, itemNumber: '1', quantity: 1 });
  const t3 = dec(x3.save());
  ok(/IFCMEMBER\(/.test(t3.slice(t3.lastIndexOf('IFCMEMBERTYPE('))) || (/IFCMEMBERTYPE\(/.test(t3) && String(x3.api.GetLine(x3.mid, m3.id, false).constructor.name).toUpperCase() === 'IFCMEMBER'), 'IFC2X3: the placed steel post is written as IfcMember with an IfcMemberType');

  console.log(`\n${n - bad} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
