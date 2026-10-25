/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-cobie.mjs — LC.12 item 2 (session bim-ops): the COBie spreadsheet out and back in (assets-bim-cobie.js,
 * assets-bim-xlsx.js). Part of ops-test.mjs (`node bin/test-bimcraft.mjs --ops --only cobie`). The oracle is openpyxl
 * (tools/bimcraft-test/cobie_xlsx.py with tools/takeoffcraft-test/venv): it reads our workbook, and writes one the way a
 * spreadsheet program does for our reader. Skipped (said) without that venv.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { IFC2X3_SMALL } from './ops-test.mjs';

export default async function cobiePart({ APP, ROOT, WebIFC, ok, saved, open }) {
  console.log('== LC.12 COBie spreadsheet out and in');
  const A = await import(path.join(APP, 'assets-bim.js'));
  const C = await import(path.join(APP, 'assets-bim-cobie.js'));
  const X = await import(path.join(APP, 'assets-bim-xlsx.js'));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const today = '2026-10-23';
  const list = (ed) => A.readAssets(WebIFC, ed.api, ed.mid, { today });
  const py = path.join(ROOT, 'tools/takeoffcraft-test/venv/bin/python'), oracle = path.join(ROOT, 'tools/bimcraft-test/cobie_xlsx.py');
  const hasPy = fs.existsSync(py);
  const dir = fs.mkdtempSync(path.join(ROOT, 'tmp', 'ops-cobie-'));
  const sheetOf = (wb, name) => wb.sheets.find((s) => s.name === name);
  const rowsAsObjects = (sh) => sh.rows.slice(1).map((r) => Object.fromEntries(sh.rows[0].map((h, i) => [h, r[i] ?? ''])));
  try {
    // ---- the workbook writer and reader on their own
    ok(X.serialDay(45717) === '2025-03-01' && X.serialDay(1) === '1900-01-01' && X.serialDay(61) === '1900-03-01' && X.serialDay('x') === '', 'spreadsheet day numbers: 45717 = 1 March 2025; the 1900 leap-day quirk kept');
    const bytes = await X.writeXlsx([{ name: 'Test', rows: [[{ v: 'Name', s: 'head' }, { v: 'Value', s: 'head' }], ['=HYPERLINK("http://x","click")', 12.5], ['@SUM(1)', '-5'], ['Tab\there & <b>', -0]] }], { title: 'T' });
    const back = await X.readXlsx(bytes);
    ok(back.sheets[0].name === 'Test' && back.sheets[0].rows[1][0] === '=HYPERLINK("http://x","click")' && back.sheets[0].rows[1][1] === '12.5' && back.sheets[0].rows[3][0] === 'Tab\there & <b>' && back.formulas === 0, 'our writer → our reader: text, numbers and markup characters come back as written; no formula anywhere');
    if (hasPy) {
      const f = path.join(dir, 'ours.xlsx');
      fs.writeFileSync(f, bytes);
      const r = JSON.parse(execFileSync(py, ['-I', oracle, 'read', f], { encoding: 'utf8' }));
      ok(r.formulas === 0 && r.sheets.Test[1][0] === '=HYPERLINK("http://x","click")' && r.sheets.Test[1][1] === 12.5, 'openpyxl reads our workbook: the formula-looking text is a text cell (not a formula), 12.5 a number');
      ok(['Test!A2', 'Test!A3', 'Test!B3'].every((c) => r.quoted.includes(c)) && !r.quoted.includes('Test!A4'), 'text starting with = + - @ carries quotePrefix (shown as typed, stays text when edited); plain text does not', r.quoted.join());
    } else console.log('  --   no tools/takeoffcraft-test/venv (openpyxl): oracle checks skipped');

    // ---- hostile workbooks are refused, not run
    const refusedKey = async (b) => { try { await X.readXlsx(b); return ''; } catch (e) { return e.key || e.message; } };
    ok(/not a zip/.test(await refusedKey(new TextEncoder().encode('Name,Value\n=1+1,2'))), 'a CSV renamed .xlsx: refused (not a zip)');
    const { zip } = await import(path.join(APP, 'bcf.js'));
    const enc = new TextEncoder();
    const wbXml = '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="r"><sheets><sheet name="S" sheetId="1" r:id="rId1"/></sheets></workbook>';
    const rels = '<Relationships><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>';
    const book = (sheet) => zip([{ name: 'xl/workbook.xml', data: enc.encode(wbXml) }, { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(rels) }, { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheet) }]);
    ok(/DTD/.test(await refusedKey(book('<!DOCTYPE x [<!ENTITY a "aaaa">]><worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>&a;</t></is></c></row></sheetData></worksheet>'))), 'a sheet with a DTD (entity expansion): refused');
    ok(await refusedKey(book('<worksheet><sheetData><row r="20001"><c r="A20001"><v>1</v></c></row></sheetData></worksheet>')) === 'assets.cobie.err.too-big', 'a row past 20 000: refused as too big');
    const wide = await X.readXlsx(book('<worksheet><sheetData><row r="1"><c r="ZZ1" t="inlineStr"><is><t>far</t></is></c><c r="A1" t="inlineStr"><is><t>' + 'x'.repeat(5000) + '</t></is></c></row></sheetData></worksheet>'));
    ok(wide.sheets[0].rows[0].length === 1 && wide.sheets[0].rows[0][0].length === X.MAX_TEXT, 'a cell past column 200 is left out; a 5000-character value is cut to 1000');
    const fml = await X.readXlsx(book('<worksheet><sheetData><row r="1"><c r="A1" t="str"><f>WEBSERVICE("http://evil")</f><v>cached</v></c><c r="B1"><f>1+1</f><v>2</v></c></row></sheetData></worksheet>'));
    ok(fml.formulas === 2 && fml.sheets[0].rows[0].join() === 'cached,2', 'formula cells: only their last computed values are read, as text; the formulas are counted and never kept or run');

    // ---- out: the fixture with a desk carrying data, a record and documents
    let ed = await open(fixtureIfc({ spaceQto: true }));
    const desk = list(ed).find((a) => a.tag === 'F-101');
    ed.modelChange(A.assetDataOp(desk.guid, { maker: 'Steelcase', model: 'Ology', ref: 'OL-1600', serial: 'SN 4471', barcode: '0001234', installed: '2025-03-01', warrantyId: 'W-77', warrantyStart: '2025-03-01', warrantyEnd: '2030-03-01', life: '15' }));
    ed.modelChange(A.addEntryOp(desk.guid, { date: '2026-04-02', work: 'Checked the frame', by: 'FM team', next: '2026-10-02', notes: 'Left leg wobbles' }));
    ed.modelChange(A.addDocOp(desk.guid, { kind: 'manual', title: 'Desk assembly manual', location: 'https://example.com/ology.pdf' }));
    ed.modelChange(A.addDocOp(desk.guid, { kind: 'photo', location: 'Photos/F-101.jpg' }));
    const facts = C.gatherFacility(WebIFC, ed.api, ed.mid);
    ok(facts.unit === 'millimeters' && facts.floors.map((f) => f.name).join() === 'Level 1,Level 2' && facts.floors[0].height === 3000 && facts.spaces.length === 1 && facts.spaces[0].net === 52.5, 'facts: millimetres, Level 1 (3000 to Level 2), the space with its net area from Qto_SpaceBaseQuantities');
    ok(facts.spaceOf(desk.id) === facts.spaces[0].id, 'the desk is in space 101 (contained in it)');
    const sheets = C.cobieWorkbook(list(ed), facts, { createdBy: 'fm@example.com', createdOn: '2026-10-23T10:00:00' });
    ok(sheets.map((s) => s.name).join() === 'Contact,Facility,Floor,Space,Type,Component,System,Job,Document,Attribute', 'the sheets: Contact, Facility, Floor, Space, Type, Component, System, Job, Document, Attribute');
    ok(Object.entries(C.SHEETS).every(([n, head]) => sheets.find((s) => s.name === n).rows[0].map((c) => c.v).join() === head.join()), 'each sheet\'s header row is COBie 2.4\'s columns, in order');
    const wb = await X.readXlsx(await X.writeXlsx(sheets, { title: 'COBie' }));
    const comp = rowsAsObjects(sheetOf(wb, 'Component'));
    const dc = comp.find((r) => r.ExtIdentifier === desk.guid);
    ok(comp.length === 1 && dc && dc.Name === 'F-101' && dc.SerialNumber === 'SN 4471' && dc.InstallationDate === '2025-03-01' && dc.WarrantyStartDate === '2025-03-01' && dc.BarCode === '0001234' && dc.TagNumber === 'F-101' && dc.Space === '101' && dc.ExtObject === 'IfcFurniture' && dc.CreatedBy === 'fm@example.com',
      'Component: the desk with its GlobalId, serial, installed day, warranty start, barcode, tag and space', JSON.stringify(dc));
    const ty = rowsAsObjects(sheetOf(wb, 'Type'));
    ok(ty.length === 1 && ty[0].Name === dc.TypeName && ty[0].Manufacturer === 'Steelcase' && ty[0].ModelNumber === 'Ology' && ty[0].ModelReference === 'OL-1600' && ty[0].ExpectedLife === '15' && ty[0].DurationUnit === 'Year' && ty[0].WarrantyDurationParts === '5' && ty[0].WarrantyDurationUnit === 'Year',
      'Type: made from class + maker + model, with maker, model, reference, life 15 years, warranty 5 years', JSON.stringify(ty[0]));
    const at = rowsAsObjects(sheetOf(wb, 'Attribute'));
    ok(at.length === 6 && at.find((r) => r.Name === 'WarrantyEndDate').Value === '2030-03-01' && at.every((r) => r.SheetName === 'Component' && r.RowName === 'F-101'), 'Attribute: the desk\'s own warranty end, warranty number, maker, model, reference, life');
    const job = rowsAsObjects(sheetOf(wb, 'Job'));
    ok(job.length === 1 && job[0].Name === 'Checked the frame' && job[0].Status === 'Done' && job[0].Start === '2026-04-02' && job[0].TypeName === dc.TypeName && /By FM team\. Left leg wobbles/.test(job[0].Description), 'Job: the maintenance entry (done, its day, who, notes)');
    const doc = rowsAsObjects(sheetOf(wb, 'Document'));
    ok(doc.length === 2 && doc.find((r) => r.Reference === 'https://example.com/ology.pdf')?.Category === 'Operations and maintenance manual' && doc.find((r) => r.File === 'F-101.jpg')?.Directory === 'Photos/', 'Document: the manual by address, the photo by directory + file, both on the desk');
    const sp = rowsAsObjects(sheetOf(wb, 'Space'))[0], fl = rowsAsObjects(sheetOf(wb, 'Floor')), fa = rowsAsObjects(sheetOf(wb, 'Facility'))[0];
    ok(sp.Name === '101' && sp.FloorName === 'Level 1' && sp.NetArea === '52.5' && sp.RoomTag === '101 Office' && fl[1].Elevation === '3000' && fa.Name === 'Fixture building' && fa.ProjectName === 'BimCraft fixture' && fa.LinearUnits === 'millimeters' && fa.AreaUnits === 'squaremillimeters',
      'Space, Floor, Facility: names, storey, area, elevation and units from the model', JSON.stringify({ sp, fa: fa.LinearUnits }));
    // a model unit that is not millimetres: areas in its square; an area in mm² stays mm² (no silent conversion)
    ok(rowsAsObjects(sheetOf(wb, 'Contact'))[0].Email === 'fm@example.com' && C.cobieWorkbook([], facts, {}).find((s) => s.name === 'Contact').rows[1][0] === 'n/a', 'Contact: the typed address; none typed → n/a (never a made-up address)');
    if (hasPy) {
      const f = path.join(dir, 'cobie.xlsx');
      fs.writeFileSync(f, await X.writeXlsx(sheets));
      const r = JSON.parse(execFileSync(py, ['-I', oracle, 'read', f], { encoding: 'utf8' }));
      ok(Object.keys(r.sheets).length === 10 && r.sheets.Component[1][8] === desk.guid && r.formulas === 0, 'openpyxl opens the COBie workbook: 10 sheets, the desk\'s GlobalId, no formulas');
    }

    // a system holding the desk (an IfcDistributionSystem made here)
    const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
    const sysEd = await open(ed.save());
    sysEd.modelChange((e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { const s = w.make('IFCDISTRIBUTIONSYSTEM', w.guid(), w.ownerHistory(), w.L('Office furniture'), null, null, null, null); w.make('IFCRELASSIGNSTOGROUP', w.guid(), w.ownerHistory(), null, null, [w.H(desk.id)], null, w.H(s)); return {}; }); });
    const sysWb = await X.readXlsx(await X.writeXlsx(C.cobieWorkbook(list(sysEd), C.gatherFacility(WebIFC, sysEd.api, sysEd.mid), {})));
    const sys = rowsAsObjects(sheetOf(sysWb, 'System'));
    ok(sys.length === 1 && sys[0].Name === 'Office furniture' && sys[0].ComponentNames === 'F-101' && sys[0].Category === 'IfcDistributionSystem', 'System: an IfcDistributionSystem with the components assigned to it', JSON.stringify(sys));

    // ---- back in: unchanged → nothing to do
    let ch = C.cobieChanges(wb.sheets, list(ed));
    ok(ch.rows === 1 && ch.changes.length === 0 && ch.unmatched.length === 0 && ch.jobs === 1, 'read straight back: 1 component matched, nothing changes (jobs counted, not read)', JSON.stringify(ch.changes));
    // edited in a spreadsheet: a new serial, a later warranty end, a new document, a row for no element
    const edit = JSON.parse(JSON.stringify(wb.sheets));
    const cs = edit.find((s) => s.name === 'Component'), ci = cs.rows[0].indexOf('SerialNumber');
    cs.rows[1][ci] = 'SN 9999';
    cs.rows.push(['Ghost', 'x', 'x', 'x']);
    const as2 = edit.find((s) => s.name === 'Attribute'), vi = as2.rows[0].indexOf('Value');
    as2.rows.find((r) => r[0] === 'WarrantyEndDate')[vi] = '2031-03-01';
    const ds = edit.find((s) => s.name === 'Document');
    ds.rows.push(ds.rows[0].map((h) => ({ Name: 'Fire certificate', Category: 'Certificate', SheetName: 'Component', RowName: 'F-101', Reference: 'Certificates/F-101 fire.pdf' }[h] ?? 'n/a')));
    ds.rows.push(ds.rows[0].map((h) => ({ Name: 'Bad link', SheetName: 'Component', RowName: 'F-101', Reference: 'javascript:alert(1)' }[h] ?? 'n/a')));
    ch = C.cobieChanges(edit, list(ed));
    const c0 = ch.changes[0];
    ok(ch.changes.length === 1 && c0.data.serial === 'SN 9999' && c0.data.warrantyEnd === '2031-03-01' && Object.keys(c0.data).length === 2 && c0.docs.length === 1 && c0.docs[0].kind === 'certificate',
      'edited: exactly the new serial, the new warranty end and the new certificate', JSON.stringify(c0));
    ok(ch.unmatched.join() === 'Ghost' && ch.skipped.some((s) => s.why === 'doc' && /javascript/.test(s.what)), 'a row for no element is listed; a javascript: document is skipped and said');
    const n0 = ed.changes.length;
    ed.modelChange(A.importOp(ch.changes), { label: 'COBie' });
    let d = list(ed).find((a) => a.guid === desk.guid);
    ok(ed.changes.length === n0 + 1 && d.data.serial === 'SN 9999' && d.data.warrantyEnd === '2031-03-01' && d.data.maker === 'Steelcase' && d.docs.length === 3, 'applied in one undo step: the asset has the new values, the rest kept, 3 documents');
    ed.undo();
    d = list(ed).find((a) => a.guid === desk.guid);
    ok(d.data.serial === 'SN 4471' && d.docs.length === 2, 'undo: as before');
    // a warranty that would end before it starts is not applied
    const bad = JSON.parse(JSON.stringify(wb.sheets));
    bad.find((s) => s.name === 'Attribute').rows.find((r) => r[0] === 'WarrantyEndDate')[vi] = '2020-01-01';
    ch = C.cobieChanges(bad, list(ed));
    ok(ch.changes.length === 0 && ch.skipped.some((s) => s.why === 'warranty'), 'a warranty end before its start: skipped, said');
    saved['cobie-ifc4'] = ed.save();

    // ---- a workbook written by another program (openpyxl): matched by name, dates as date cells, life in months
    if (hasPy) {
      const f = path.join(dir, 'theirs.xlsx');
      execFileSync(py, ['-I', oracle, 'write', f]);
      const theirs = await X.readXlsx(fs.readFileSync(f));
      ok(theirs.formulas === 1 && theirs.sheets[0].rows[1][15] === '' && theirs.sheets[0].rows[1][16] === 'TRUE', 'their workbook (shared strings): the formula counted, no value kept for it; a boolean as TRUE');
      const ed3 = await open(fixtureIfc());
      const others = C.elementIndex(ed3.api, ed3.mid);
      ch = C.cobieChanges(theirs.sheets, A.readAssets(WebIFC, ed3.api, ed3.mid, { today }), others);
      const c = ch.changes[0];
      ok(ch.changes.length === 1 && c.data.serial === '4471' && c.data.installed === '2025-03-01' && c.data.warrantyStart === '2025-03-01' && c.data.warrantyEnd === '2030-03-01' && c.data.barcode === 'BC-9' && c.data.maker === 'Steelcase' && c.data.life === '15',
        'matched by name: serial typed as a number, date cells as days, a 5-year warranty from its start, 180 months = 15 years', JSON.stringify(c?.data));
      ok(ch.unmatched.join() === 'Not in this model', 'their row for something not in the model: listed');
      ed3.modelChange(A.importOp(ch.changes));
      ok(A.readAssets(WebIFC, ed3.api, ed3.mid, { today }).find((a) => a.tag === 'F-101').data.serial === '4471', 'applied to a model that had no asset data at all');
    }

    // ---- IFC2X3: out and back
    ed = await open(IFC2X3_SMALL);
    const b = list(ed)[0];
    ed.modelChange(A.assetDataOp(b.guid, { serial: 'B1-SER', installed: '2024-05-05' }));
    const wb2 = await X.readXlsx(await X.writeXlsx(C.cobieWorkbook(list(ed), C.gatherFacility(WebIFC, ed.api, ed.mid), {})));
    const comp2 = rowsAsObjects(sheetOf(wb2, 'Component'))[0], ty2 = rowsAsObjects(sheetOf(wb2, 'Type'))[0];
    ok(comp2.SerialNumber === 'B1-SER' && comp2.TypeName === 'Boiler type' && ty2.ExtObject === 'IfcFurnitureType' && rowsAsObjects(sheetOf(wb2, 'Document'))[0]?.Reference === 'https://example.com/boiler-manual.pdf', 'IFC2X3: the boiler under its own IFC type; the type\'s manual listed', JSON.stringify({ comp2, ty2, doc: rowsAsObjects(sheetOf(wb2, 'Document')) }));
    ok(C.cobieChanges(wb2.sheets, list(ed)).changes.length === 0, 'IFC2X3 read straight back: nothing changes');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
