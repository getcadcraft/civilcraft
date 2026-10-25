/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-docs.mjs — LC.12 item 1 (session bim-ops): documents per asset, IfcDocumentReference on the element (assets-bim.js).
 * Part of ops-test.mjs (`node bin/test-bimcraft.mjs --ops --only docs`).
 */
import path from 'node:path';
import { IFC2X3_SMALL } from './ops-test.mjs';

export default async function docsPart({ APP, ROOT, WebIFC, ok, saved, open }) {
  console.log('== LC.12 documents per asset');
  const A = await import(path.join(APP, 'assets-bim.js'));
  const { fixtureIfc } = await import(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs'));
  const today = '2026-10-23';
  const list = (ed) => A.readAssets(WebIFC, ed.api, ed.mid, { today });
  const txt = (ed) => new TextDecoder().decode(ed.save());
  const refused = (f) => { try { f(); return ''; } catch (e) { return e.key || e.message; } };

  // ---- where a document may be
  ok(['https://example.com/m.pdf', 'http://intranet.local/x', 'Manuals/AHU-1 manual.pdf', 'C:\\FM\\pump.pdf', '\\\\server\\share\\a.pdf', 'photo 1.jpg'].every((s) => A.docLocation(s) === ''),
    'places allowed: http(s) addresses, a file name or relative path, a drive path, a network share');
  ok(A.docLocation('javascript:alert(1)') === 'assets.err.doc-scheme' && A.docLocation('data:text/html,x') === 'assets.err.doc-scheme' && A.docLocation('file:///etc/passwd') === 'assets.err.doc-scheme'
    && A.docLocation('') === 'assets.err.doc-location' && A.docLocation('https://user:pw@example.com/x') === 'assets.err.doc-location' && A.docLocation('a\u0000b') === 'assets.err.doc-location' && A.docLocation('x'.repeat(256)) === 'assets.err.doc-location',
    'refused: javascript:, data:, file:, empty, a password in the address, control characters, over 255 characters');
  ok(A.openable('https://example.com/m.pdf') && !A.openable('Manuals/m.pdf') && !A.openable('javascript:alert(1)') && !A.openable(' JAVASCRIPT:x'), 'only http(s) addresses get an Open link');

  // ---- IFC4: the fixture's desk
  let ed = await open(fixtureIfc());
  const desk = list(ed).find((a) => a.tag === 'F-101');
  ok(desk && desk.docs.length === 0, 'the desk starts with no documents');
  let n0 = ed.changes.length;
  ed.modelChange(A.addDocOp(desk.guid, { kind: 'manual', title: 'Desk assembly manual', location: 'https://example.com/ology-manual.pdf' }), { label: 'Document' });
  ed.modelChange(A.addDocOp(desk.guid, { kind: 'photo', location: 'Photos/F-101 as installed.jpg' }));
  ed.modelChange(A.addDocOp(desk.guid, { kind: 'warranty', title: 'Warranty certificate', location: 'C:\\FM\\Warranties\\W-77.pdf' }));
  let a = list(ed).find((x) => x.guid === desk.guid);
  ok(ed.changes.length === n0 + 3 && a.docs.length === 3, 'three documents added, one undo step each', String(a.docs.length));
  const photo = a.docs.find((d) => d.kind === 'photo');
  ok(photo && photo.title === 'F-101 as installed.jpg' && photo.ours && !photo.fromType, 'no title given: the file name is the title', JSON.stringify(photo));
  let t = txt(ed);
  ok(/IFCDOCUMENTREFERENCE\('https:\/\/example\.com\/ology-manual\.pdf',\$,'Desk assembly manual','manual',\$\)/.test(t), 'IFC4: IfcDocumentReference (Location as IfcURIReference, Name, Description = the kind)');
  ok((t.match(/IFCRELASSOCIATESDOCUMENT\('[^']+',#\d+,'CadCraft_AssetDocument','(manual|photo|warranty)',\(#\d+\),#\d+\)/g) || []).length === 3, 'each tied to the desk by its own IfcRelAssociatesDocument (named CadCraft_AssetDocument, the kind as its description)');
  // remove one: its relation and reference go; undo brings them back
  const nRefs = (s) => (s.match(/IFCDOCUMENTREFERENCE\(/g) || []).length;
  ed.modelChange(A.removeDocOp(desk.guid, photo.rel));
  a = list(ed).find((x) => x.guid === desk.guid);
  t = txt(ed);
  ok(a.docs.length === 2 && !a.docs.some((d) => d.kind === 'photo') && nRefs(t) === 2 && !t.includes('as installed'), 'a document removed: its relation and its reference gone');
  ed.undo();
  ok(list(ed).find((x) => x.guid === desk.guid).docs.length === 3 && nRefs(txt(ed)) === 3, 'undo: back');
  ok(refused(() => A.addDocOp(desk.guid, { location: 'javascript:alert(1)' })) === 'assets.err.doc-scheme', 'adding a javascript: link is refused before anything is written');
  // a reference shared by two elements: removing it from one keeps it on the other
  const wallOf = (tag) => { for (const id of ed.api.GetLineIDsWithType(ed.mid, WebIFC.IFCWALL) ?? []) { const l = ed.api.GetLine(ed.mid, id, false); if (l.Tag?.value === tag) return { id, guid: l.GlobalId.value }; } return null; };
  const w1 = wallOf('W-101'), w2 = wallOf('W-102');
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  ed.modelChange((e) => { const w = new ModelWriter(e.W, e.api, e.mid); return w.run(() => { const ref = w.make('IFCDOCUMENTREFERENCE', w.T('IFCURIREFERENCE', 'https://example.com/walls.pdf'), null, w.L('Wall spec'), null, null); w.make('IFCRELASSOCIATESDOCUMENT', w.guid(), w.ownerHistory(), null, null, [w.H(w1.id), w.H(w2.id)], w.H(ref)); return {}; }); });
  let as = list(ed);
  ok(!as.some((x) => x.guid === w1.guid || x.guid === w2.guid), "another program's reference on two walls does not make them assets");
  ed.modelChange(A.trackOp(w1.guid));
  ed.modelChange(A.trackOp(w2.guid));
  as = list(ed);
  const spec = as.find((x) => x.guid === w1.guid)?.docs[0];
  ok(spec && !spec.ours && spec.kind === 'other' && spec.title === 'Wall spec', 'tracked, both walls show it (kind other: not one of ours)', JSON.stringify(spec));
  ed.modelChange(A.removeDocOp(w1.guid, spec.rel));
  as = list(ed);
  ok(as.find((x) => x.guid === w1.guid).docs.length === 0 && as.find((x) => x.guid === w2.guid).docs.length === 1 && txt(ed).includes('Wall spec'), 'a shared reference taken off W-101 stays on W-102');
  saved['docs-ifc4'] = ed.save();
  const ed2 = await open(saved['docs-ifc4']);
  ok(list(ed2).find((x) => x.guid === desk.guid).docs.map((d) => d.kind).sort().join() === 'manual,photo,warranty', 'saved and opened again: the three documents read from the file');
  const csv = A.assetsCsv(list(ed2));
  ok(/\r\ndocument,[^\r]*Desk assembly manual,,manual,https:\/\/example\.com\/ology-manual\.pdf\r\n/.test(csv), 'CSV: a row per document (title, kind, where)');

  // ---- IFC2X3, with a manual on the element's type
  ed = await open(IFC2X3_SMALL);
  a = list(ed)[0];
  ok(a.docs.length === 1 && a.docs[0].fromType && a.docs[0].title === 'Boiler manual' && a.docs[0].location === 'https://example.com/boiler-manual.pdf', "IFC2X3: the type's manual is listed on the boiler (from its type)");
  ed.modelChange(A.addDocOp(a.guid, { kind: 'certificate', title: 'Gas safety certificate 2026', location: 'Certificates/gas-2026.pdf' }));
  t = txt(ed);
  a = list(ed)[0];
  ok(/IFCDOCUMENTREFERENCE\('Certificates\/gas-2026\.pdf',\$,'Gas safety certificate 2026'\)/.test(t) && a.docs.length === 2 && a.docs.find((d) => !d.fromType)?.kind === 'certificate', 'IFC2X3: IfcDocumentReference (Location IfcLabel, Name); the kind kept on the relation');
  saved['docs-ifc2x3'] = ed.save();
}
