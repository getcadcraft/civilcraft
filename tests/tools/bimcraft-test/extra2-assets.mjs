/* SPDX-License-Identifier: Apache-2.0 */
/**
 * extra2-assets.mjs — LC.12 (session bim-extra_PART_2): asset data and the maintenance record kept in the IFC (assets-bim.js).
 * Part of extra2-test.mjs (`node bin/test-bimcraft.mjs --extra2 --only assets`). IFC4: tools/bimcraft-test/ifc-fixture.mjs
 * (desk F-101 = IfcFurniture; Pset_WallCommon shared by W-101…W-104). IFC2X3: a small file written here.
 */
import path from 'node:path';

const IFC2X3 = `ISO-10303-21;
HEADER;FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');FILE_NAME('a.ifc','2026-10-18T12:00:00',(''),(''),'test','test','');FILE_SCHEMA(('IFC2X3'));ENDSEC;
DATA;
#1=IFCPERSON($,$,'',$,$,$,$,$);
#2=IFCORGANIZATION($,'Test',$,$,$);
#3=IFCPERSONANDORGANIZATION(#1,#2,$);
#4=IFCAPPLICATION(#2,'1','Test','Test');
#5=IFCOWNERHISTORY(#3,#4,$,.ADDED.,$,$,$,0);
#6=IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.);
#7=IFCUNITASSIGNMENT((#6));
#8=IFCCARTESIANPOINT((0.,0.,0.));
#9=IFCAXIS2PLACEMENT3D(#8,$,$);
#10=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#9,$);
#11=IFCPROJECT('0YvctVUKr0kugbFTf53O9L',#5,'P',$,$,$,$,(#10),#7);
#12=IFCLOCALPLACEMENT($,#9);
#13=IFCSITE('1YvctVUKr0kugbFTf53O9L',#5,'Site',$,$,#12,$,$,.ELEMENT.,$,$,$,$,$);
#14=IFCBUILDING('2YvctVUKr0kugbFTf53O9L',#5,'B',$,$,#12,$,$,.ELEMENT.,$,$,$);
#15=IFCBUILDINGSTOREY('3YvctVUKr0kugbFTf53O9L',#5,'Ground',$,$,#12,$,$,.ELEMENT.,0.);
#16=IFCRELAGGREGATES('4YvctVUKr0kugbFTf53O9L',#5,$,$,#11,(#13));
#17=IFCRELAGGREGATES('5YvctVUKr0kugbFTf53O9L',#5,$,$,#13,(#14));
#18=IFCRELAGGREGATES('6YvctVUKr0kugbFTf53O9L',#5,$,$,#14,(#15));
#19=IFCFURNISHINGELEMENT('7YvctVUKr0kugbFTf53O9L',#5,'Boiler B-1',$,$,#12,$,'B-1');
#20=IFCRELCONTAINEDINSPATIALSTRUCTURE('8YvctVUKr0kugbFTf53O9L',#5,$,$,(#19),#15);
ENDSEC;
END-ISO-10303-21;
`;

export async function assetsPart({ APP, ROOT, WebIFC, IfcModel, quiet, ok, saved }) {
  console.log('== LC.12 assets and the maintenance record');
  const A = await import(path.join(APP, 'assets-bim.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const open = async (text) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(typeof text === 'string' ? new TextEncoder().encode(text) : text);
    return new IfcEditor(WebIFC, eng);
  };
  const today = '2026-10-18';
  const list = (ed) => A.readAssets(WebIFC, ed.api, ed.mid, { today });
  const txt = (ed) => new TextDecoder().decode(ed.save());

  // ---- IFC4: the fixture
  let ed = await open(fixtureIfc());
  let as = list(ed);
  const desk = as.find((a) => a.tag === 'F-101');
  ok(as.length === 1 && desk && desk.cls === 'IFCFURNITURE' && desk.log.length === 0 && desk.due === '', 'the fixture: one asset, the desk F-101 (IfcFurniture), no data, no log', as.map((a) => a.cls + ' ' + a.tag).join());
  const wall = (tag) => { const w = new ModelWriter(WebIFC, ed.api, ed.mid); for (const id of w.api.GetLineIDsWithType(ed.mid, WebIFC.IFCWALL) ?? []) { const l = ed.api.GetLine(ed.mid, id, false); if (l.Tag?.value === tag) return { id, guid: l.GlobalId.value }; } return null; };
  const w101 = wall('W-101'), w102 = wall('W-102');

  // asset data → the standard sets, one undo step
  let n0 = ed.changes.length;
  ed.modelChange(A.assetDataOp(desk.guid, { maker: 'Steelcase', model: 'Ology', ref: 'OL-1600', serial: 'SN 4471', barcode: '0001234', installed: '2025-03-01', warrantyId: 'W-77', warrantyStart: '2025-03-01', warrantyEnd: '2030-02-28', life: '15' }), { label: 'Asset data' });
  let d = list(ed).find((a) => a.guid === desk.guid).data;
  ok(ed.changes.length === n0 + 1 && d.maker === 'Steelcase' && d.serial === 'SN 4471' && d.installed === '2025-03-01' && d.warrantyEnd === '2030-02-28' && d.life === '15', 'asset data written and read back: one undo step', JSON.stringify(d));
  let t = txt(ed);
  ok(/IFCPROPERTYSINGLEVALUE\('Manufacturer',\$,IFCLABEL\('Steelcase'\)/.test(t) && /'SerialNumber',\$,IFCIDENTIFIER\('SN 4471'\)/.test(t) && /'AcquisitionDate',\$,IFCDATE\('2025-03-01'\)/.test(t)
    && /'WarrantyEndDate',\$,IFCDATE\('2030-02-28'\)/.test(t) && /'ServiceLifeDuration',\$,IFCDURATION\('P15Y'\)/.test(t), 'IFC4: Manufacturer (IfcLabel), SerialNumber (IfcIdentifier), dates as IfcDate, service life IfcDuration P15Y');
  ok(['Pset_ManufacturerTypeInformation', 'Pset_ManufacturerOccurrence', 'Pset_Warranty', 'Pset_ServiceLife'].every((s) => t.includes("'" + s + "'")), 'in the four standard sets');
  // refusals
  const refused = (op) => { try { op(); return ''; } catch (e) { return e.key || e.message; } };
  ok(refused(() => A.assetDataOp(desk.guid, { installed: '2025-02-30' })) === 'assets.err.date' && refused(() => A.assetDataOp(desk.guid, { life: 'ten' })) === 'assets.err.life'
    && refused(() => A.assetDataOp(desk.guid, { warrantyStart: '2026-01-01', warrantyEnd: '2025-01-01' })) === 'assets.err.warranty', 'refused: 30 February, a life in words, a warranty ending before it starts');
  // clearing one value removes the property; clearing the last removes the set
  ed.modelChange(A.assetDataOp(desk.guid, { barcode: '', life: '' }));
  t = txt(ed);
  d = list(ed).find((a) => a.guid === desk.guid).data;
  ok(d.barcode === '' && d.serial === 'SN 4471' && !t.includes("'BarCode'") && !t.includes("'Pset_ServiceLife'"), 'cleared: BarCode gone from its set (the serial stays); Pset_ServiceLife emptied → gone');
  ed.undo();
  d = list(ed).find((a) => a.guid === desk.guid).data;
  ok(d.barcode === '0001234' && d.life === '15', 'undo: both back');

  // a maintenance record
  n0 = ed.changes.length;
  ed.modelChange(A.addEntryOp(desk.guid, { date: '2026-04-02', work: 'Checked the frame, tightened bolts', by: 'FM team', next: '2026-10-02', notes: 'Left leg wobbles' }), { label: 'Maintenance' });
  ed.modelChange(A.addEntryOp(desk.guid, { date: '2025-10-01', work: 'First inspection', by: 'FM team', next: '2026-04-01' }));
  let a = list(ed).find((x) => x.guid === desk.guid);
  ok(ed.changes.length === n0 + 2 && a.log.length === 2 && a.log[0].date === '2026-04-02' && a.last === '2026-04-02' && a.nextDue === '2026-10-02' && a.due === 'overdue', 'two entries (one undo step each), newest first; next due 2 October → overdue on 18 October', JSON.stringify({ last: a.last, next: a.nextDue, due: a.due }));
  t = txt(ed);
  ok(/IFCTASK\('[^']+',#\d+,'Checked the frame, tightened bolts','Left leg wobbles','MAINTENANCE',\$,\$,'Done',\$,\.F\.,\$,#\d+,\.MAINTENANCE\.\)/.test(t), 'IFC4: an IfcTask, PredefinedType MAINTENANCE, Status Done, notes as its Description');
  ok(/IFCTASKTIME\(\$,\$,\$,\$,\$,'2026-10-02T00:00:00',(\$,){11}'2026-04-02T00:00:00',\$,\$\)/.test(t), 'IfcTaskTime: ScheduleStart = next due, ActualFinish = the day it was done');
  ok((t.match(/IFCRELASSIGNSTOPROCESS\(/g) || []).length === 2 && /'CadCraft_Maintenance'/.test(t) && /'NextDue',\$,IFCLABEL\('2026-10-02'\)/.test(t), 'each tied to the desk by IfcRelAssignsToProcess; CadCraft_Maintenance Date / By / NextDue');
  // due soon / not due
  ok(A.readAssets(WebIFC, ed.api, ed.mid, { today: '2026-09-10' }).find((x) => x.guid === desk.guid).due === 'soon' && A.readAssets(WebIFC, ed.api, ed.mid, { today: '2026-06-01' }).find((x) => x.guid === desk.guid).due === '', 'due: "soon" within 30 days, nothing four months before');
  ok(refused(() => A.addEntryOp(desk.guid, { date: '', work: 'x' })) === 'assets.err.entry-date' && refused(() => A.addEntryOp(desk.guid, { date: '2026-01-02', work: '' })) === 'assets.err.work'
    && refused(() => A.addEntryOp(desk.guid, { date: '2026-01-02', work: 'x', next: '2026-01-01' })) === 'assets.err.next', 'refused: no date, no work, next due before the work');
  // edit and delete entries
  const first = a.log[1].guid;
  ed.modelChange(A.editEntryOp(first, { date: '2025-10-01', work: 'First inspection (no faults)', by: 'J. Ruiz', next: '2026-04-01' }));
  a = list(ed).find((x) => x.guid === desk.guid);
  ok(a.log.length === 2 && a.log[1].work === 'First inspection (no faults)' && a.log[1].by === 'J. Ruiz' && (txt(ed).match(/IFCTASK\(/g) || []).length === 2, 'an entry changed: still two tasks, the new words');
  ed.modelChange(A.removeEntryOp(a.log[1].guid));
  a = list(ed).find((x) => x.guid === desk.guid);
  t = txt(ed);
  ok(a.log.length === 1 && (t.match(/IFCTASK\(/g) || []).length === 1 && (t.match(/IFCTASKTIME\(/g) || []).length === 1 && (t.match(/'CadCraft_Maintenance'/g) || []).length === 1 && (t.match(/IFCRELASSIGNSTOPROCESS\(/g) || []).length === 1, 'an entry deleted: its task, time, set and relation all gone');
  ed.undo();
  ok(list(ed).find((x) => x.guid === desk.guid).log.length === 2, 'undo: the entry back');

  // tracking any element (a wall), copy-on-write of a shared set
  ed.modelChange(A.trackOp(w101.guid));
  a = list(ed).find((x) => x.guid === w101.guid);
  ok(a && a.tracked && a.cls === 'IFCWALL', 'Track: W-101 (a wall) joins the assets with the CadCraft_Asset mark');
  const share = (ed) => { const w = new ModelWriter(ed.W, ed.api, ed.mid); return w.run(() => { const ps = w.pset('Pset_Warranty', [['WarrantyIdentifier', 'IFCIDENTIFIER', 'BLANKET-1']]); w.make('IFCRELDEFINESBYPROPERTIES', w.guid(), w.ownerHistory(), null, null, [w.H(w101.id), w.H(w102.id)], w.H(ps)); return {}; }); };
  ed.modelChange(share);
  ed.modelChange(A.assetDataOp(w101.guid, { warrantyId: 'W101-ONLY', warrantyEnd: '2031-01-01' }));
  as = list(ed);
  ok(as.find((x) => x.guid === w101.guid).data.warrantyId === 'W101-ONLY' && as.find((x) => x.guid === w102.guid)?.data.warrantyId === 'BLANKET-1', 'a set shared by W-101 and W-102: W-101 gets its own copy; W-102 keeps BLANKET-1', JSON.stringify(as.find((x) => x.guid === w102.guid)?.data));
  ed.modelChange(A.untrackOp(w101.guid));
  ok(!list(ed).find((x) => x.guid === w101.guid).tracked, 'Stop tracking: the mark goes (W-101 stays listed: it has warranty data)');
  saved['assets-ifc4'] = ed.save();

  // reopen: everything read back from the file
  const ed2 = await open(saved['assets-ifc4']);
  a = A.readAssets(WebIFC, ed2.api, ed2.mid, { today }).find((x) => x.guid === desk.guid);
  ok(a && a.log.length === 2 && a.data.maker === 'Steelcase' && a.nextDue === '2026-10-02', 'saved and opened again: data and log read from the file');
  // another program's maintenance task with only IfcTaskTime (no CadCraft_Maintenance)
  const foreign = (e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { const time = w.make('IFCTASKTIME', null, null, null, null, null, w.T('IFCDATETIME', '2027-01-15T08:00:00'), null, null, null, null, null, null, null, null, null, null, null, w.T('IFCDATETIME', '2026-07-15T09:30:00'), null, null); const task = w.make('IFCTASK', w.guid(), w.ownerHistory(), w.L('Filter change'), null, null, null, null, null, null, false, null, w.H(time), 'MAINTENANCE'); w.make('IFCRELASSIGNSTOPROCESS', w.guid(), w.ownerHistory(), null, null, [w.H(desk.id)], null, w.H(task), null); return {}; }); };
  ed2.modelChange(foreign);
  a = A.readAssets(WebIFC, ed2.api, ed2.mid, { today }).find((x) => x.guid === desk.guid);
  ok(a.log.length === 3 && a.log[0].work === 'Filter change' && a.log[0].date === '2026-07-15' && a.nextDue === '2027-01-15' && a.due === '', 'another program\'s task (IfcTaskTime only): read, newest, next due January → not due');

  // CSV
  const csv = A.assetsCsv(A.readAssets(WebIFC, ed2.api, ed2.mid, { today }), { storeyName: () => 'Level 1' });
  const lines = csv.split('\r\n');
  ok(csv.startsWith('\ufeff') && lines[0].startsWith('\ufeffkind,name,tag') && lines.filter((l) => l.startsWith('entry,')).length === 3 && /,Steelcase,Ology,/.test(csv), 'CSV: a header (column ids when the page passes no words), a row per asset with its data, a row per entry');
  ok(A.assetsCsv([{ name: '=HYPERLINK("x")', tag: '', cls: 'IFCWALL', storey: null, guid: 'g', data: Object.fromEntries(A.FIELDS.map((f) => [f, ''])), log: [], last: '', nextDue: '' }]).includes(`"'=HYPERLINK(""x"")"`), 'CSV: a formula-looking name is escaped');

  // ---- IFC2X3
  ed = await open(IFC2X3);
  as = list(ed);
  const boiler = as.find((x) => x.tag === 'B-1');
  ok(as.length === 1 && boiler.cls === 'IFCFURNISHINGELEMENT', 'IFC2X3: the furnishing element is an asset');
  ed.modelChange(A.assetDataOp(boiler.guid, { maker: 'Acme', installed: '2024-05-05', warrantyEnd: '2029-05-05', life: '20' }));
  ed.modelChange(A.addEntryOp(boiler.guid, { date: '2026-09-01', work: 'Annual service', by: 'Gas Safe 123', next: '2027-09-01' }));
  t = txt(ed);
  a = list(ed)[0];
  ok(/'AcquisitionDate',\$,IFCLABEL\('2024-05-05'\)/.test(t) && /'ServiceLifeDuration',\$,IFCTIMEMEASURE\(631152000\.?\)/.test(t), 'IFC2X3: dates as IfcLabel, 20 years as IfcTimeMeasure 631 152 000 s');
  ok(/IFCTASK\('[^']+',#\d+,'Annual service',\$,'MAINTENANCE','M-2026-09-01','Done',\$,\.F\.,\$\)/.test(t) && a.log[0].next === '2027-09-01' && a.data.life === '20', 'IFC2X3: IfcTask (ObjectType MAINTENANCE, TaskId), read back with its next due; life 20 years');
  saved['assets-ifc2x3'] = ed.save();
}
