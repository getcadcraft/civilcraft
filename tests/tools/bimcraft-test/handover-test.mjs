/* SPDX-License-Identifier: Apache-2.0 */
/**
 * handover-test.mjs: the project's handover documents (BK.114, session bk-stages-10), DOM-free:
 *   node bin/test-bimcraft.mjs --handover
 * Documents on the IfcProject (IfcDocumentInformation + IfcRelAssociatesDocument), IFC4 and IFC2X3, undo / redo, save and
 * reopen, the COBie Document sheet (written to .xlsx and read back), and the handover package's files.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function handoverMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const H = await import(path.join(APP, 'handover-docs.js'));
  const A = await import(path.join(APP, 'assets-bim.js'));
  const C = await import(path.join(APP, 'assets-bim-cobie.js'));
  const X = await import(path.join(APP, 'assets-bim-xlsx.js'));
  const Z = await import(path.join(APP, 'bcf.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ids, val } = await import(path.join(APP, 'ifc-util.js'));
  const { t } = await import(path.join(APP, 'i18n.js'));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const { IFC2X3_SMALL } = await import(path.join(ROOT, 'tools/bimcraft-test/ops-test.mjs'));
  const open = async (text) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(typeof text === 'string' ? new TextEncoder().encode(text) : text); return new IfcEditor(WebIFC, eng); };
  const list = (ed) => H.readHandover(ed.api, ed.mid);
  const refused = (f) => { try { f(); return ''; } catch (e) { return e.key || e.message; } };
  const dangling = (txt) => { const def = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set(); for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!def.has(m[1])) out.add(m[1]); return [...out]; };
  const count = (ed, cls) => { try { return ids(ed.api, ed.mid, cls).length; } catch { return 0; } };

  console.log('== one document: what is accepted');
  ok(refused(() => H.cleanDoc({ kind: 'permit', title: 'x', location: 'a.pdf' })) === 'handover.err.kind', 'an unknown kind is refused');
  ok(refused(() => H.cleanDoc({ kind: 'completion', title: 'x', location: '' })) === 'assets.err.doc-location', 'no place and no file: refused');
  ok(refused(() => H.cleanDoc({ kind: 'completion', title: 'x', location: 'javascript:alert(1)' })) === 'assets.err.doc-scheme' && refused(() => H.cleanDoc({ kind: 'completion', title: 'x', location: 'file:///etc/passwd' })) === 'assets.err.doc-scheme', 'javascript: and file: places are refused (the asset documents\' rule)');
  ok(refused(() => H.cleanDoc({ kind: 'completion', title: 'x', location: 'a.pdf', date: '30/11/2026' })) === 'handover.err.date' && refused(() => H.cleanDoc({ kind: 'completion', title: 'x', location: 'a.pdf', date: '2026-02-30' })) === 'handover.err.date', 'a date that is not a real year-month-day is refused');
  ok(H.cleanDoc({ kind: 'manual', location: 'Manuals/Boiler manual.pdf' }).title === 'Boiler manual.pdf', 'no title: the file name is the title');
  ok(H.safeName('../../etc/pass wd?.pdf') === 'pass wd_.pdf' && H.safeName('C:\\docs\\Certificate (final).pdf') === 'Certificate (final).pdf' && H.safeName('..') === 'document' && !/[\\/]/.test(H.safeName('a/b\\c.pdf')), 'attached file names are made safe: no folders, no odd characters');
  const att = H.cleanDoc({ kind: 'occupancy', title: 'Occupancy', location: 'https://ignored.example/x', file: { name: '../Occ cert.pdf', bytes: 11, sha256: 'AB12' } });
  ok(att.location === 'handover/Occ cert.pdf' && att.file.sha256 === 'ab12', 'an attached file sets the place to handover/<safe name>');

  console.log('== IFC4: add, read, edit, remove, undo');
  let ed = await open(fixtureIfc());
  const projects0 = count(ed, 'IFCPROJECT'), assets0 = A.readAssets(WebIFC, ed.api, ed.mid, { today: '2026-11-11' });
  ok(list(ed).length === 0 && JSON.stringify(H.missingKinds(list(ed))) === '["completion","occupancy"]', 'a model with no handover documents: completion and occupancy are listed as not there yet');
  let n0 = ed.changes.length;
  const r1 = ed.modelChange(H.addHandoverOp({ kind: 'completion', title: 'Certificate of completion', date: '2026-10-30', issuer: 'City of Cape Town', reference: 'CC-2026-00417', location: 'https://example.com/docs/completion.pdf' }), { label: 'Completion' });
  ok(ed.changes.length === n0 + 1 && r1.rel, 'adding one is one undo step');
  const bytes = new TextEncoder().encode('%PDF-1.4 occupancy certificate test bytes');
  const sha = await H.sha256Hex(bytes);
  ok(sha.length === 64 && sha === (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex'), 'sha256Hex matches Node\'s own SHA-256');
  H.putFile('handover/Occupancy certificate.pdf', bytes);
  const r2 = ed.modelChange(H.addHandoverOp({ kind: 'occupancy', title: 'Occupancy certificate', date: '2026-11-05', issuer: 'City of Cape Town', reference: 'OC-2026-00093', file: { name: 'Occupancy certificate.pdf', bytes: bytes.length, sha256: sha } }));
  const r3 = ed.modelChange(H.addHandoverOp({ kind: 'warranty', title: 'Roof waterproofing warranty', issuer: 'Roofing contractor', location: 'Warranties/roof.pdf' }));
  let L = list(ed);
  const by = (rel) => L.find((d) => d.rel === rel);
  ok(L.length === 3 && by(r1.rel).kind === 'completion' && by(r1.rel).title === 'Certificate of completion' && by(r1.rel).date === '2026-10-30' && by(r1.rel).issuer === 'City of Cape Town' && by(r1.rel).reference === 'CC-2026-00417' && by(r1.rel).location === 'https://example.com/docs/completion.pdf' && by(r1.rel).file === null, 'the completion certificate reads back: kind, title, date, issuer, reference, link', by(r1.rel));
  ok(by(r2.rel).location === 'handover/Occupancy certificate.pdf' && by(r2.rel).file.bytes === bytes.length && by(r2.rel).file.sha256 === sha && by(r2.rel).loaded === true, 'the occupancy certificate reads back with its attached file (name, size, SHA-256), loaded', by(r2.rel));
  ok(by(r3.rel).date === '' && by(r3.rel).reference === '' && by(r3.rel).location === 'Warranties/roof.pdf', 'no date and no reference stay empty (not "n/a")');
  ok(H.missingKinds(L).length === 0, 'completion and occupancy are both there now');
  ok(count(ed, 'IFCPROJECT') === projects0 && count(ed, 'IFCDOCUMENTINFORMATION') === 3 && count(ed, 'IFCRELASSOCIATESDOCUMENT') === 3, 'three IfcDocumentInformation, each tied to the IfcProject by an IfcRelAssociatesDocument');
  {
    const rel = ids(ed.api, ed.mid, 'IFCRELASSOCIATESDOCUMENT').map((r) => ed.api.GetLine(ed.mid, r, true)).find((r) => val(r.GlobalId) === r1.rel);
    ok(val(rel.Name) === 'CadCraft_HandoverDocument' && val(rel.Description) === 'completion' && rel.RelatedObjects.length === 1 && /IfcProject/i.test(rel.RelatedObjects[0].constructor.name) && val(rel.RelatingDocument.Purpose) === 'Certificate of completion' && val(rel.RelatingDocument.Identification) === 'CC-2026-00417' && val(rel.RelatingDocument.ValidFrom) === '2026-10-30' && val(rel.RelatingDocument.DocumentOwner.Name) === 'City of Cape Town',
      'in the file: related to the IfcProject; Identification, Purpose, ValidFrom and DocumentOwner are the standard attributes');
  }
  const a1 = A.readAssets(WebIFC, ed.api, ed.mid, { today: '2026-11-11' });
  ok(a1.length === assets0.length && a1.every((a, i) => a.docs.length === assets0[i].docs.length), 'the assets\' own documents are untouched (a project document is not an asset document)');
  // edit
  n0 = ed.changes.length;
  ed.modelChange(H.editHandoverOp(r3.rel, { ...by(r3.rel), kind: 'manual', title: 'Roof maintenance manual', date: '2026-09-01', reference: 'RM-7' }));
  L = list(ed);
  ok(ed.changes.length === n0 + 1 && L.length === 3 && by(r3.rel).kind === 'manual' && by(r3.rel).title === 'Roof maintenance manual' && by(r3.rel).date === '2026-09-01' && by(r3.rel).reference === 'RM-7' && by(r3.rel).issuer === 'Roofing contractor', 'edited in one step: kind, title, date and reference changed, issuer kept');
  ok(count(ed, 'IFCDOCUMENTINFORMATION') === 3 && count(ed, 'IFCORGANIZATION') >= 3, 'the edit replaces the document\'s lines (no orphan left: still three IfcDocumentInformation)');
  ed.undo(); L = list(ed);
  ok(by(r3.rel).kind === 'warranty' && by(r3.rel).title === 'Roof waterproofing warranty', 'undo puts the old record back');
  ed.redo(); L = list(ed);
  ok(by(r3.rel).kind === 'manual', 'redo applies the edit again');
  ok(refused(() => ed.modelChange(H.removeHandoverOp('0000000000000000000000'))) === 'handover.err.gone', 'removing one that is not there: handover.err.gone');
  const orgs = count(ed, 'IFCORGANIZATION');
  ed.modelChange(H.removeHandoverOp(r3.rel));
  ok(list(ed).length === 2 && count(ed, 'IFCPROJECT') === projects0 && count(ed, 'IFCDOCUMENTINFORMATION') === 2 && count(ed, 'IFCORGANIZATION') === orgs - 1, 'removed: the record, its relation and its issuer line go; the IfcProject stays');
  ed.undo();
  ok(list(ed).length === 3 && list(ed).some((d) => d.rel === r3.rel && d.title === 'Roof maintenance manual'), 'undo brings it back');

  console.log('== the COBie Document sheet');
  const facts = C.gatherFacility(WebIFC, ed.api, ed.mid);
  L = list(ed);
  const sheets = C.cobieWorkbook(a1, facts, { createdBy: 'pm@example.com', createdOn: '2026-11-11T10:00:00', documents: (o) => H.handoverRows(L, o) });
  const wb = await X.readXlsx(await X.writeXlsx(sheets, { title: 'T' }));
  const sh = wb.sheets.find((s) => s.name === 'Document');
  const rows = sh.rows.slice(1).map((r) => Object.fromEntries(sh.rows[0].map((h, i) => [h, r[i] ?? ''])));
  const facility = C.facilityName(facts);
  const fac = rows.filter((r) => r.SheetName === 'Facility');
  ok(JSON.stringify(sh.rows[0]) === JSON.stringify(C.SHEETS.Document) && fac.length === 3 && fac.every((r) => r.RowName === facility && r.Stage === 'As built' && r.ExtObject === 'IfcDocumentInformation' && r.CreatedBy === 'pm@example.com'), 'written to .xlsx and read back: three Document rows about the Facility "' + facility + '"', fac);
  const cc = fac.find((r) => r.Name === 'Certificate of completion'), oc = fac.find((r) => r.Name === 'Occupancy certificate'), mn = fac.find((r) => r.Name === 'Roof maintenance manual');
  ok(cc && cc.Category === 'Certificate of completion' && cc.ApprovalBy === 'City of Cape Town' && cc.Reference === 'CC-2026-00417' && cc.Directory === 'n/a' && cc.File === 'n/a' && cc.ExtIdentifier === r1.rel && cc.Description === 'Certificate of completion, dated 2026-10-30, issued by City of Cape Town', 'the completion certificate row: category, issuer as ApprovalBy, reference, a web link has no Directory / File', cc);
  ok(oc && oc.Category === 'Certificate of occupancy' && oc.Directory === 'handover/' && oc.File === 'Occupancy certificate.pdf' && oc.Reference === 'OC-2026-00093', 'the occupancy certificate row: Directory handover/, File the attached file\'s name', oc);
  ok(mn && mn.Category === 'Operations and maintenance manual' && mn.Directory === 'Warranties/' && mn.File === 'roof.pdf' && mn.Reference === 'RM-7', 'a document beside the model: Directory and File from its path', mn);
  ok(C.cobieWorkbook(a1, facts, {}).find((s) => s.name === 'Document').rows.length === sheets.find((s) => s.name === 'Document').rows.length - 3, 'without the option the workbook is as before (asset documents only)');
  const chg = C.cobieChanges(wb.sheets, a1, C.elementIndex(ed.api, ed.mid));
  ok(chg.changes.length === 0, 'read back in, the Facility\'s document rows change no asset', chg.changes);

  console.log('== save and reopen');
  const saved = ed.save(), txt = new TextDecoder().decode(saved);
  ok(dangling(txt).length === 0 && /IFCDOCUMENTINFORMATION\(/.test(txt) && /'CadCraft_HandoverDocument'/.test(txt) && txt.includes('sha256=' + sha), 'the saved IFC has the documents, no dangling references, and the attached file\'s SHA-256');
  H.forgetFiles();
  ed = await open(saved);
  const L2 = list(ed);
  const flat = (x) => x.map((d) => [d.rel, d.kind, d.title, d.date, d.issuer, d.reference, d.location, d.file?.name || '', d.file?.bytes || 0, d.file?.sha256 || ''].join('|')).sort().join('\n');
  ok(L2.length === 3 && flat(L2) === flat(L), 'reopened: the three records are as saved', flat(L2));
  ok(L2.find((d) => d.kind === 'occupancy').loaded === false, 'the attached file\'s bytes are not in a plain IFC: the record says it is not loaded');
  // attaching the same bytes again matches the recorded SHA-256
  ok((await H.sha256Hex(bytes)) === L2.find((d) => d.kind === 'occupancy').file.sha256, 'the same file attached again matches the recorded SHA-256');

  console.log('== the handover package');
  let files = H.handoverPackage({ docs: L2, base: 'house', ifc: saved, cobie: new Uint8Array([1, 2, 3]), index: H.handoverIndex(L2, { project: 'House', date: '2026-11-11', t }), csv: H.handoverCsv(L2) });
  ok(files.map((f) => f.name).join() === 'README.md,handover-documents.csv,house COBie.xlsx,house.ifc', 'with the file not loaded: cover, list, COBie workbook and model; no attached file', files.map((f) => f.name));
  let readme = new TextDecoder().decode(files[0].data);
  ok(/# Handover package: House/.test(readme) && /\*\*Completion certificate:\*\* Certificate of completion \(dated 2026-10-30, issued by City of Cape Town, reference CC-2026-00417\)\. Kept at: https:\/\/example\.com\/docs\/completion\.pdf/.test(readme) && /was not loaded when the package was built/.test(readme) && !/Not in the list/.test(readme), 'the cover lists each document with date, issuer, reference and where it is; says which attached file is not in the zip');
  H.putFile('handover/Occupancy certificate.pdf', bytes);
  const L3 = list(ed);
  files = H.handoverPackage({ docs: L3, base: 'house', ifc: saved, cobie: new Uint8Array([1, 2, 3]), index: H.handoverIndex(L3, { project: 'House', date: '2026-11-11', t }), csv: H.handoverCsv(L3) });
  const pdf = files.find((f) => f.name === 'handover/Occupancy certificate.pdf');
  ok(L3.find((d) => d.kind === 'occupancy').loaded && pdf && pdf.data.length === bytes.length && /In this package: `handover\/Occupancy certificate\.pdf`/.test(new TextDecoder().decode(files[0].data)), 'attached again: the file is in the package under handover/ and the cover says so');
  const csv = new TextDecoder('utf-8', { ignoreBOM: true }).decode(files[1].data);
  ok(csv.charCodeAt(0) === 0xfeff && csv.split('\r\n').length === 5 && csv.includes('Certificate of occupancy,Occupancy certificate,2026-11-05,City of Cape Town,OC-2026-00093,handover/Occupancy certificate.pdf,yes,' + sha), 'the list as CSV: one line per document, the attached file marked as in the package with its SHA-256');
  ok(H.handoverCsv([{ kind: 'other', title: '=cmd()', date: '', issuer: '', reference: '', location: 'a.pdf', file: null }]).includes("'=cmd()"), 'a title that looks like a formula is written as text in the CSV');
  const zipped = Z.zip(files);
  ok(zipped[0] === 0x50 && zipped[1] === 0x4b && zipped.length > saved.length, 'the files zip (PK header, larger than the model alone)');
  // a missing certificate never blocks
  ed.modelChange(H.removeHandoverOp(L3.find((d) => d.kind === 'occupancy').rel));
  const L4 = list(ed);
  readme = H.handoverIndex(L4, { project: 'House', t });
  ok(JSON.stringify(H.missingKinds(L4)) === '["occupancy"]' && /## Not in the list\n\n- Occupancy certificate/.test(readme) && H.handoverPackage({ docs: L4, base: 'house', ifc: saved, index: readme, csv: H.handoverCsv(L4) }).length === 3, 'without the occupancy certificate the package is still made; the cover lists it under "Not in the list"');

  console.log('== the project bundle carries handover/ beside pictures/');
  {
    const PP = await import(path.join(APP, 'picture-pack.js'));
    const BO = await import(path.join(APP, 'bundle-open.js'));
    ok(PP.isHandoverLocation('handover/Occupancy certificate.pdf') && !PP.isHandoverLocation('handover/../x.pdf') && !PP.isHandoverLocation('handover/a/b.pdf') && !PP.isHandoverLocation('pictures/x.png') && !PP.isHandoverLocation('handover/.hidden'), 'only a plain file name in handover/ is a handover place (no folders, no "..", no dot files)');
    H.forgetFiles();
    const edB = await open(saved);   // the model with the completion (link), occupancy (attached) and manual records
    ok(H.handoverBundleFiles(edB.api, edB.mid).length === 0, 'nothing loaded: no handover file to put in a bundle');
    H.putFile('handover/Occupancy certificate.pdf', bytes, sha);
    const hf = H.handoverBundleFiles(edB.api, edB.mid);
    ok(hf.length === 1 && hf[0].loc === 'handover/Occupancy certificate.pdf' && hf[0].bytes.length === bytes.length, 'the attached, loaded file is handed to Save as bundle');
    const zipB = await PP.bundle({ ifc: edB.save(), modelFile: 'house.ifc', name: 'house', pictures: [], handover: [...hf, { loc: 'handover/../evil.txt', bytes: new Uint8Array([1]) }, { loc: 'other/x.txt', bytes: new Uint8Array([1]) }], now: new Date('2026-11-11T12:00:00Z') });
    H.forgetFiles();
    const ob = await BO.openBundle(zipB);
    const names = ob.index.names();
    ok(names.includes('manifest.json') && names.includes('house.ifc') && names.includes('handover/Occupancy certificate.pdf') && names.length === 3, 'the bundle holds the manifest, the model and handover/Occupancy certificate.pdf; unsafe names are left out', names);
    ok((await H.adoptHandover(ob.index)) === 1, 'opening the bundle takes its handover file in');
    const edR = await open(await ob.index.read(ob.manifest.model.file));
    const occ = H.readHandover(edR.api, edR.mid).find((d) => d.kind === 'occupancy');
    const got = H.getFile(occ.location);
    ok(occ.loaded === true && occ.mismatch === false && got.length === bytes.length && got.every((v, i) => v === bytes[i]) && (await H.sha256Hex(got)) === occ.file.sha256, 'bundle reopened: the record is loaded, the bytes are the ones attached, and their SHA-256 is the recorded one');
    const pkg2 = H.handoverPackage({ docs: H.readHandover(edR.api, edR.mid), base: 'house', ifc: saved, index: '', csv: '' });
    ok(pkg2.some((f) => f.name === 'handover/Occupancy certificate.pdf' && f.data.length === bytes.length), 'the handover package built after reopening the bundle still includes the file');
    // a bundle whose file was swapped: same name, other bytes
    const other = new TextEncoder().encode('%PDF-1.4 not the certificate');
    const zipBad = await PP.bundle({ ifc: edB.save(), modelFile: 'house.ifc', name: 'house', handover: [{ loc: 'handover/Occupancy certificate.pdf', bytes: other }] });
    H.forgetFiles();
    const ob2 = await BO.openBundle(zipBad);
    await H.adoptHandover(ob2.index);
    const occ2 = H.readHandover(edR.api, edR.mid).find((d) => d.kind === 'occupancy');
    ok(occ2.loaded === false && occ2.mismatch === true && H.handoverBundleFiles(edR.api, edR.mid).length === 0 && !H.handoverPackage({ docs: H.readHandover(edR.api, edR.mid), base: 'house', index: '', csv: '' }).some((f) => /^handover\//.test(f.name)), 'a bundle whose file has another SHA-256: not taken as the recorded file (not loaded, said to differ, kept out of the package and the next bundle)');
    // a plain .ifc: today's behaviour
    H.forgetFiles();
    const occ3 = H.readHandover(edR.api, edR.mid).find((d) => d.kind === 'occupancy');
    ok(occ3.loaded === false && occ3.mismatch === false && occ3.file.name === 'Occupancy certificate.pdf' && occ3.file.bytes === bytes.length && occ3.file.sha256 === sha, 'a plain .ifc: the record keeps name, size and SHA-256; the file is not loaded');
  }

  console.log('== IFC2X3');
  let e2 = await open(IFC2X3_SMALL);
  const p2 = count(e2, 'IFCPROJECT');
  const q1 = e2.modelChange(H.addHandoverOp({ kind: 'occupancy', title: 'Occupancy certificate', date: '2026-11-05', issuer: 'Municipality', reference: 'OC-1', location: 'Certificates/occupancy.pdf' }));
  const q2 = e2.modelChange(H.addHandoverOp({ kind: 'asbuilt', title: 'As-built set', file: { name: 'as-built.zip', bytes: 5, sha256: sha } }));
  let M = list(e2);
  ok(M.length === 2 && M.find((d) => d.rel === q1.rel).date === '2026-11-05' && M.find((d) => d.rel === q1.rel).issuer === 'Municipality' && M.find((d) => d.rel === q1.rel).reference === 'OC-1' && M.find((d) => d.rel === q1.rel).location === 'Certificates/occupancy.pdf' && M.find((d) => d.rel === q2.rel).file.name === 'as-built.zip', 'IFC2X3: both read back (the place through an IfcDocumentReference, the date through an IfcCalendarDate)', M);
  const s2 = e2.save(), t2 = new TextDecoder().decode(s2);
  ok(dangling(t2).length === 0 && /IFCCALENDARDATE\(5,11,2026\)/.test(t2) && /IFCDOCUMENTREFERENCE\('Certificates\/occupancy\.pdf'/.test(t2), 'IFC2X3 file: IfcCalendarDate(5, 11, 2026) and an IfcDocumentReference with the place');
  e2 = await open(s2);
  ok(flat(list(e2)) === flat(M), 'IFC2X3 reopened: the same two records');
  e2.modelChange(H.removeHandoverOp(q1.rel)); e2.modelChange(H.removeHandoverOp(q2.rel));
  ok(list(e2).length === 0 && count(e2, 'IFCPROJECT') === p2 && count(e2, 'IFCDOCUMENTINFORMATION') === 0 && count(e2, 'IFCCALENDARDATE') === 0 && dangling(new TextDecoder().decode(e2.save())).length === 0, 'IFC2X3: both removed with their own lines; the project stays; nothing dangling');

  // another IFC reader validates the files
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (!py) console.log('  --   no venv with ifcopenshell: schema validation skipped');
  else {
    const { execFileSync } = await import('node:child_process');
    const os = await import('node:os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bim-ho-'));
    const fl = [['handover-ifc4', saved], ['handover-ifc2x3', s2]].map(([k, b]) => { const f = path.join(dir, k + '.ifc'); fs.writeFileSync(f, b); return f; });
    let out = '';
    try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...fl], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || ''); }
    const res = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
    ok(res.length === fl.length && res.every((r) => r.errors === 0), 'another IFC reader (schema validation) finds no errors in ' + res.map((r) => path.basename(r.file) + ' (' + r.errors + ')').join(', ') + (res.some((r) => r.errors) ? ': ' + res.flatMap((r) => r.first).slice(0, 4).join(' | ') : ''));
    let seen = '';
    try { seen = execFileSync(py, ['-I', '-c', 'import sys, json, ifcopenshell\nf = ifcopenshell.open(sys.argv[1])\nprint(json.dumps(sorted([d.Name, d.Purpose, d.Location, str(d.ValidFrom), d.DocumentOwner.Name if d.DocumentOwner else None] for d in f.by_type("IfcDocumentInformation")), default=str))', fl[0]], { encoding: 'utf8' }); } catch (e) { seen = String(e.stdout || e.message); }
    ok(/Certificate of occupancy/.test(seen) && /handover\/Occupancy certificate\.pdf/.test(seen) && /2026-11-05/.test(seen) && /City of Cape Town/.test(seen), 'and lists the documents with purpose, place, date and issuer: ' + seen.trim().slice(0, 200));
    fs.rmSync(dir, { recursive: true, force: true });
  }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
