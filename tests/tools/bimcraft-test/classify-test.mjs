/* SPDX-License-Identifier: Apache-2.0 */
/**
 * classify-test.mjs — classification codes on drawn elements, on a real IFC model (0.10 BK.94, session bk-content-10), DOM-free:
 *   node bin/test-bimcraft.mjs --classify
 * A 6000 x 4000 room on one level: four walls, a door, a window, a floor, a roof. Codes are set on elements and on a type, saved,
 * reopened, read by the file reader other code uses (ifc/api.js getClassifications, roundtrip.js classificationIndex), in IFC4 and IFC2X3.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function classifyMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, n = 0;
  const ok = (cond, label, detail = '') => { n++; if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const CM = await import(path.join(APP, 'classify-model.js'));
  const CO = await import(path.join(APP, 'classify-ops.js'));
  const C = await import(path.join(APP, 'classify/classify.js'));
  const SCH = await import(path.join(APP, 'model-schedule.js'));
  const CS = await import(path.join(APP, 'classify-schedule.js'));
  const RT = await import(path.join(APP, 'roundtrip.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const dec = (b) => new TextDecoder().decode(b);
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const count = (txt, re) => (txt.match(re) || []).length;
  const data = (f) => JSON.parse(fs.readFileSync(path.join(APP, 'classify/data', f), 'utf8'));

  // ---------------------------------------------------------------------------------------------------- the packs (data, not code)
  console.log('== the code lists are data packs');
  const index = data('index.json');
  const packs = index.packs.map((p) => C.readPack(fs.readFileSync(path.join(APP, 'classify/data', p.file), 'utf8')));
  ok(packs.length === 3 && packs.every((p) => p.ok), 'three bundled packs read and pass the pack check', packs.map((p) => p.error));
  ok(packs.every((p) => p.pack.system === 'uniclass' && p.pack.redistributable === true && p.pack.source.licence === 'CC BY-ND 4.0' && /^https:\/\/identifier\.buildingsmart\.org\//.test(p.pack.source.url) && /^\d{4}-\d\d-\d\d$/.test(p.pack.source.fetched) && p.pack.edition && p.pack.verified === false),
    'each bundled pack is Uniclass and says its source address, licence (CC BY-ND 4.0), edition and fetch date; none is marked verified');
  ok(index.packs.every((p, i) => p.rows === packs[i].pack.rows.length) && packs[0].pack.rows.length === 81 && packs[1].pack.rows.length === 2272 && packs[2].pack.rows.length === 7547, 'row counts as fetched: EF 81, Ss 2272, Pr 7547');
  ok(C.SYSTEMS.map((s) => s.id).join() === 'uniclass,omniclass,uniformat' && C.SYSTEMS.filter((s) => s.bundled).map((s) => s.id).join() === 'uniclass' && !index.packs.some((p) => p.system !== 'uniclass'),
    'three systems; only Uniclass has a bundled table (OmniClass and UniFormat: none in the app)');
  const px = C.packIndex(packs.map((p) => p.pack));
  ok(px.find('uniclass', 'EF_25_10')?.title === 'Walls' && px.find('uniclass', 'ef_30_10')?.title === 'Roofs' && px.find('uniclass', 'Ss_25_30_95')?.title === 'Window systems' && px.find('uniclass', 'XX_99') === null && px.find('omniclass', '21-02 20') === null,
    'lookup: EF_25_10 Walls, EF_30_10 Roofs, Ss_25_30_95 Window systems; an unknown code and a system with no pack give nothing');
  const hits = px.search('uniclass', 'curtain wall', 10);
  ok(hits.length > 0 && hits.some((h) => h.code === 'Ss_25_10_20') && px.search('uniclass', 'EF_25', 10)[0].code === 'EF_25' && px.search('omniclass', 'wall').length === 0, 'search by words and by the start of a code', hits.slice(0, 3));
  // an office's own table from CSV (made-up rows: these are NOT real codes of any publisher)
  const csv = 'My office table\r\nIssued 2026\r\n\r\nNumber,Title,Notes\r\n"99-01 00 00","Test, walls",x\r\n99-02 00 00,Test roofs,\r\n99-02 00 00,Twice,\r\n=SUM(1),bad,\r\n,empty code,\r\n';
  const own = C.packFromCsv(csv, { system: 'omniclass', name: 'Office table', edition: '2026', source: 'Our licensed copy' });
  ok(own.ok && own.pack.rows.length === 3 && own.pack.rows[0][0] === '99-01 00 00' && own.pack.rows[0][1] === 'Test, walls' && own.skipped === 2 && own.columns.header && own.pack.redistributable === false && own.pack.system === 'omniclass',
    'CSV import: the header row is found under two title lines, quoted commas kept, a repeated code and an empty code skipped; the pack is marked not redistributable', own.ok ? [own.pack.rows, own.skipped] : own.error);
  const again = C.readPack(JSON.stringify(own.pack));
  ok(again.ok && JSON.stringify(again.pack) === JSON.stringify(own.pack) && C.packFromCsv(C.packToCsv(own.pack), { system: 'omniclass', name: 'Office table', edition: '2026', source: 'Our licensed copy' }).pack.rows.length === 3, 'a pack file reads back the same; CSV out and in keeps the rows');
  ok(C.packFromCsv('A1010;Standard Foundations\nA1020;Special Foundations\n', { system: 'uniformat' }).pack?.rows.length === 2 && C.packFromCsv('', { system: 'uniformat' }).ok === false && C.packFromCsv('a,b', { system: 'nope' }).error === 'system', 'CSV without a header: first two columns; semicolons read; nothing to read and an unknown system are refused');
  ok(!C.readPack({ format: C.PACK_FORMAT, version: 1, system: 'uniclass', source: { name: 'x' }, rows: [['A', '<script>x</script>']] }).ok && !C.readPack({ format: C.PACK_FORMAT, version: 1, system: 'uniclass', rows: [['A', 'b']] }).ok && !C.readPack({ format: C.PACK_FORMAT, version: 2, system: 'uniclass', source: { name: 'x' }, rows: [['A', 'b']] }).ok && C.readPack('{').error === 'json',
    'refused: markup in a title, a pack that does not say its source, another version, broken JSON');
  ok(C.systemOf('Uniclass 2015') === 'uniclass' && C.systemOf('Uniclass2015 Ss') === 'uniclass' && C.systemOf('OmniClass Table 21') === 'omniclass' && C.systemOf('UNIFORMAT II') === 'uniformat' && C.systemOf('Our office codes') === null && C.systemOf('') === null, 'a file\'s classification name is read as its system');
  ok(C.codeLooksRight('uniclass', 'EF_25_10') && !C.codeLooksRight('uniclass', '21-02 20') && C.codeLooksRight('omniclass', '21-02 20 10') && C.codeLooksRight('uniformat', 'B2010') && C.codeLooksRight('uniformat', '') && C.cleanCode('  B2010\u0007 \n') === 'B2010', 'the shape hint knows each system; a code is cleaned of control characters');
  const defs = C.readDefaults(data('defaults-uniclass.json'));
  ok(defs && defs.verified === false && Object.values(defs.classes).every((c) => px.find('uniclass', c)) && C.defaultFor(defs, 'IfcWallStandardCase') === 'EF_25_10' && C.defaultFor(defs, 'IfcSlab', 'ROOF') === 'EF_30_10' && C.defaultFor(defs, 'IfcSlab', 'FLOOR') === 'EF_30_20' && C.defaultFor(defs, 'IfcCovering', 'CEILING') === null,
    'default codes by class: every one is a code of the bundled table; wall EF_25_10, roof slab EF_30_10, floor slab EF_30_20, no default where the table has no fit (ceiling); marked unverified');

  // ---------------------------------------------------------------------------------------------------- a drawn model
  for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== ' + schema + ': codes on drawn elements');
    let ed;
    if (schema === 'IFC4') ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Classified', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-11-11T12:00:00Z') })));
    else ed = await boot(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', 'ios-steel-ifc2x3.ifc')));
    const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const L1 = OPS.snapshotModel(ed).levels[0];
    const before0 = count(dec(ed.save()), /IFCRELASSOCIATESCLASSIFICATION\(/g);
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'ext-2x6', height: 2700 }));
    let snap = OPS.snapshotModel(ed);
    const [s, e, nn, wv] = snap.walls;
    ed.modelChange(OPS.placeOpening({ wall: s.guid, typeKey: 'door-single', offset: 1000, sill: 0 }));
    ed.modelChange(OPS.placeOpening({ wall: nn.guid, typeKey: 'win-fixed', offset: 2000, width: 1500, height: 1200, sill: 900 }));
    ed.modelChange(OPS.placeFloor({ storey: L1.guid, seed: [3000, 2000], mode: 'building' }));
    ed.modelChange(OPS.placeRoof({ storey: L1.guid, seed: [3000, 2000], pitch: 30 }));
    snap = OPS.snapshotModel(ed);
    const door = snap.openings.find((o) => o.kind === 'door'), win = snap.openings.find((o) => o.kind === 'window');
    const floor = snap.derived.floors[0], roof = snap.derived.roofs[0];
    ok(snap.walls.length === 4 && door && win && floor && roof, 'four walls, a door, a window, a floor and a roof are drawn');
    ok(count(dec(ed.save()), /IFCRELASSOCIATESCLASSIFICATION\(/g) === before0 && CM.readProjectClassification(W()).systems.length === 0, 'nothing is classified until someone says so (no relation written, no system chosen)');
    const codes = (g) => { const w = W(); return CM.codesOf(w, CM.anyByGuid(w)(g)); };

    // an element's own code
    let steps = ed.changes.length;
    ed.modelChange(CO.setClassification([s.guid], { system: 'uniclass', code: 'EF_25_10', title: 'Walls' }), { label: 'Classification' });
    ok(ed.changes.length === steps + 1 && codes(s.guid).effective.uniclass?.code === 'EF_25_10' && codes(s.guid).effective.uniclass.from === 'element' && codes(s.guid).effective.uniclass.title === 'Walls' && !codes(e.guid).effective.uniclass, 'one wall gets EF_25_10 (one undo step); the other walls have none');
    // three systems side by side, typed codes with no table behind them
    ed.modelChange(CO.setClassification([s.guid], { system: 'uniformat', code: 'B2010' }));
    ed.modelChange(CO.setClassification([s.guid], { system: 'omniclass', code: '21-02 20 10' }));
    let c = codes(s.guid);
    ok(c.effective.uniclass.code === 'EF_25_10' && c.effective.uniformat.code === 'B2010' && c.effective.omniclass.code === '21-02 20 10', 'the same wall carries a code in each of the three systems (the two with no bundled table take the typed code)', c.effective);
    // several elements at once share one reference
    ed.modelChange(CO.setClassification([e.guid, nn.guid, wv.guid], { system: 'uniformat', code: 'B2010' }));
    let txt = dec(ed.save());
    ok(count(txt, /IFCCLASSIFICATIONREFERENCE\([^;]*'B2010'/g) === 1 && count(txt, /IFCCLASSIFICATION\(/g) === (schema === 'IFC4' ? 3 : 3) && [e, nn, wv].every((x) => codes(x.guid).effective.uniformat?.code === 'B2010'),
      'three more walls get B2010: one IfcClassificationReference for the code, one IfcClassification per system', [count(txt, /IFCCLASSIFICATIONREFERENCE\([^;]*'B2010'/g), count(txt, /IFCCLASSIFICATION\(/g)]);
    ok(schema === 'IFC4' ? /IFCCLASSIFICATION\('NBS',\$,\$,'Uniclass 2015',\$,\$,\$\)/.test(txt) && /IFCCLASSIFICATIONREFERENCE\(\$,'EF_25_10','Walls',#\d+,\$,\$\)/.test(txt)
      : /IFCCLASSIFICATION\('NBS','not stated',\$,'Uniclass 2015'\)/.test(txt) && /IFCCLASSIFICATIONREFERENCE\(\$,'EF_25_10','Walls',#\d+\)/.test(txt),
      schema + ' lines as the schema writes them (system name, publisher, code in ' + (schema === 'IFC4' ? 'Identification' : 'ItemReference') + ', title in Name)', (txt.match(/IFCCLASSIFICATION(REFERENCE)?\([^;]*/g) || []).slice(0, 4));

    // a code on the TYPE: every element of the type reads it; an element's own code overrides
    ed.modelChange(CO.setClassification([e.guid], { system: 'uniclass', code: 'Ss_25_10_32', title: 'Framed wall structure systems', target: 'type' }));
    c = codes(e.guid);
    ok(c.typeId && c.type.uniclass?.code === 'Ss_25_10_32' && c.effective.uniclass.from === 'type' && codes(nn.guid).effective.uniclass?.code === 'Ss_25_10_32' && codes(wv.guid).effective.uniclass?.from === 'type',
      'a code set on the wall type is read by every wall of that type (from: type)', c.effective);
    ok(codes(s.guid).effective.uniclass.code === 'EF_25_10' && codes(s.guid).effective.uniclass.from === 'element' && codes(s.guid).type.uniclass.code === 'Ss_25_10_32', 'the wall with its own code keeps it: the element overrides its type');
    ed.modelChange(CO.setClassification([s.guid], { system: 'uniclass', code: '' }));
    ok(codes(s.guid).effective.uniclass.code === 'Ss_25_10_32' && codes(s.guid).effective.uniclass.from === 'type', 'clearing the wall\'s own code shows the type\'s again');
    ed.undo();
    ok(codes(s.guid).effective.uniclass.code === 'EF_25_10' && codes(s.guid).effective.uniclass.from === 'element', 'undo brings the wall\'s own code back');
    ed.redo(); ed.undo();
    // door, window, floor, roof
    ed.modelChange(CO.setClassification([door.guid, win.guid], { system: 'uniclass', code: 'EF_25_30', title: 'Doors and windows' }));
    ed.modelChange(CO.setClassification([floor.guid], { system: 'uniclass', code: 'EF_30_20', title: 'Floors' }));
    ed.modelChange(CO.setClassification([roof.guid], { system: 'uniclass', code: 'EF_30_10', title: 'Roofs' }));
    ok(codes(door.guid).effective.uniclass?.code === 'EF_25_30' && codes(win.guid).effective.uniclass?.code === 'EF_25_30' && codes(floor.guid).effective.uniclass?.code === 'EF_30_20' && codes(roof.guid).effective.uniclass?.code === 'EF_30_10', 'door, window, floor and roof take codes too');
    let threw = '';
    try { ed.modelChange(CO.setClassification([s.guid], { system: 'nope', code: 'X' })); } catch (x) { threw = x.key || x.message; }
    ok(threw === 'classify.err.system', 'an unknown system is refused', threw);
    threw = '';
    try { ed.modelChange(CO.setClassification(['0000000000000000000000'], { system: 'uniclass', code: 'X' })); } catch (x) { threw = x.key || x.message; }
    ok(threw === 'model.err.gone', 'an element that is not there is refused', threw);

    // schedules: optional columns
    const fmt = { fmtLen: (v) => String(Math.round(v)), fmtArea: (v) => String(Math.round(v)), t: (k) => k };
    const loops = new Map(snap.levels.map((l) => [l.id, OPS.loopsOf(ed, l.id)]));
    const plain = SCH.schedules(OPS.snapshotModel(ed), loops, fmt);
    const w0 = W();
    const withCols = CS.addClassificationColumns(SCH.schedules(OPS.snapshotModel(ed), loops, fmt), { systems: ['uniclass', 'uniformat'], codes: (sys) => CM.effectiveCodes(w0, sys), label: (sys) => C.systemById(sys).name, varies: 'varies' });
    ok(withCols.doors.head.length === plain.doors.head.length + 2 && withCols.doors.head.at(-2) === 'Uniclass' && withCols.doors.rows[0].at(-2) === 'EF_25_30' && withCols.doors.rows[0].at(-1) === '' && withCols.windows.rows[0].at(-2) === 'EF_25_30',
      'schedules: a Uniclass and a UniFormat column are added to doors and windows when asked (EF_25_30; no UniFormat code = empty)', [withCols.doors.head, withCols.doors.rows[0]]);
    ok(withCols.walls.rows.length === plain.walls.rows.length && withCols.walls.rows[0].at(-2) === 'varies' && withCols.walls.rows[0].at(-1) === 'B2010' && plain.walls.head.length + 2 === withCols.walls.head.length,
      'walls by type: the type row shows the code when its walls agree (B2010) and "varies" when they differ (one wall has its own Uniclass code)', withCols.walls.rows[0]);
    ok(JSON.stringify(SCH.schedules(OPS.snapshotModel(ed), loops, fmt).doors.head) === JSON.stringify(plain.doors.head), 'without the option the schedules are as before');

    // save, reopen: the round trip, read three ways
    const bytes = ed.save();
    txt = dec(bytes);
    const ed2 = await boot(bytes);
    const w2 = new ModelWriter(WebIFC, ed2.api, ed2.mid);
    const find2 = CM.anyByGuid(w2);
    const c2 = (g) => CM.codesOf(w2, find2(g)).effective;
    ok(c2(s.guid).uniclass.code === 'EF_25_10' && c2(s.guid).uniclass.from === 'element' && c2(s.guid).uniformat.code === 'B2010' && c2(s.guid).omniclass.code === '21-02 20 10' && c2(e.guid).uniclass.code === 'Ss_25_10_32' && c2(e.guid).uniclass.from === 'type'
      && c2(door.guid).uniclass.code === 'EF_25_30' && c2(floor.guid).uniclass.code === 'EF_30_20' && c2(roof.guid).uniclass.code === 'EF_30_10' && c2(roof.guid).uniclass.title === 'Roofs',
      'saved and reopened: every code, its title, its system and where it comes from (element or type) are as set');
    const rt = RT.classificationIndex(ed2.api, ed2.mid);
    const sid = find2(s.guid), tid = CM.codesOf(w2, find2(e.guid)).typeId;
    ok((rt.get(sid) || []).some((x) => x.system === 'Uniclass 2015' && x.code === 'EF_25_10' && x.name === 'Walls') && (rt.get(sid) || []).some((x) => x.system === 'UniFormat' && x.code === 'B2010') && (rt.get(tid) || []).some((x) => x.code === 'Ss_25_10_32'),
      'the round-trip reader (roundtrip.js classificationIndex) finds them on the element and on the type', rt.get(sid));
    const viaApi = await ed2.model.api.properties?.getClassifications?.(ed2.mid, find2(e.guid));
    if (viaApi) ok(viaApi.some((x) => x.system === 'Uniclass 2015' && x.code === 'Ss_25_10_32') && viaApi.some((x) => x.system === 'UniFormat' && x.code === 'B2010'), 'the file reader (ifc/api.js getClassifications) gives a wall its own code and its type\'s', viaApi);
    else ok(false, 'the file reader (ifc/api.js getClassifications) is reachable', Object.keys(ed2.model.api || {}).slice(0, 12));
    ok(dec(ed2.save()).length === txt.length, 'saving the reopened file again writes the same number of bytes (nothing is duplicated on reopen)', [dec(ed2.save()).length, txt.length]);
    if (schema === 'IFC4') {
      // the IFC5 alpha (IFCX) export carries the codes of drawn elements too
      const IX = await import(path.join(APP, 'ifcx-bimcraft.js'));
      const eng3 = await quiet(IfcModel.create)(WebIFC, null);
      const M3 = await quiet((b) => eng3.load(b))(bytes);
      const out = await IX.bimIfcx([{ mi: 0, ifc: eng3, model: M3, name: 'c.ifc', visible: true }], { name: 'c' });
      const withCode = out.file.data.filter((nd) => nd.attributes && nd.attributes['uniclass::class']);
      ok(withCode.some((nd) => nd.attributes['uniclass::class'].code === 'EF_25_10' && nd.attributes['uniformat::class']?.code === 'B2010' && nd.attributes['omniclass::class']?.code === '21-02 20 10') && withCode.some((nd) => nd.attributes['uniclass::class'].code === 'Ss_25_10_32') && withCode.some((nd) => nd.attributes['uniclass::class'].code === 'EF_30_20') && withCode.filter((nd) => nd.attributes['uniclass::class'].code === 'EF_25_30').length === 2,
        'IFCX export (lab option): the drawn elements carry their codes (a wall\'s own, the type\'s, the floor\'s, the door\'s and window\'s) under uniclass / uniformat / omniclass; the roof\'s code sits on the IfcRoof, which that export does not write as an element', withCode.map((nd) => Object.fromEntries(Object.entries(nd.attributes).filter(([k]) => k.endsWith('::class')).map(([k, v]) => [k, v.code]))));
    }

    // project setting + defaults by class
    console.log('== ' + schema + ': the project\'s system and default codes');
    const table = Object.fromEntries(Object.entries(defs.classes).map(([k, v]) => [k, [v, px.find('uniclass', v).title]]));
    steps = ed.changes.length;
    ed.modelChange(CO.setProjectClassification({ version: 1, systems: ['uniclass', 'uniformat'], defaults: true, defaultCodes: { uniclass: table }, editions: { uniclass: 'v1.6 (31 July 2019)' } }), { label: 'Project classification' });
    const rec = CM.readProjectClassification(W());
    ok(ed.changes.length === steps + 1 && rec.systems.join() === 'uniclass,uniformat' && rec.defaults === true && rec.defaultCodes.uniclass.IfcWall[0] === 'EF_25_10', 'the project record holds the systems in use and the default codes (one undo step)');
    // a NEW wall drawn after: it has no type code (int-2x4 is another type) and gets the default
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [3000, 0], b: [3000, 4000] }], typeKey: 'int-2x4', height: 2700 }));
    const part = OPS.snapshotModel(ed).walls.find((x) => ![s.guid, e.guid, nn.guid, wv.guid].includes(x.guid));
    ok(codes(part.guid).effective.uniclass?.code === 'EF_25_10' && codes(part.guid).effective.uniclass.from === 'default', 'a wall drawn afterwards carries the default EF_25_10 (from: default) with nobody typing it', codes(part.guid).effective);
    ok(codes(e.guid).effective.uniclass.code === 'Ss_25_10_32' && codes(e.guid).effective.uniclass.from === 'type' && !codes(e.guid).fallback.uniclass && codes(s.guid).effective.uniclass.from === 'element' && !codes(s.guid).fallback.uniclass, 'walls that have their own or their type\'s code get no default');
    txt = dec(ed.save());
    ok(count(txt, /IFCRELASSOCIATESCLASSIFICATION\('[^']*',#?\d*\$?,'CadCraft default'/g) + count(txt, /IFCRELASSOCIATESCLASSIFICATION\([^;]*'CadCraft default'/g) > 0, 'the default is a real association in the file (relation named "CadCraft default"), so other software reads it');
    ed.modelChange(CO.setClassification([part.guid], { system: 'uniclass', code: 'Ss_25_10_30', title: 'Framed partition systems' }));
    ok(codes(part.guid).effective.uniclass.code === 'Ss_25_10_30' && codes(part.guid).effective.uniclass.from === 'element' && !codes(part.guid).fallback.uniclass, 'its own code replaces the default (the default relation is gone)');
    ed.modelChange(CO.setClassification([part.guid], { system: 'uniclass', code: '' }));
    ok(codes(part.guid).effective.uniclass?.code === 'EF_25_10' && codes(part.guid).effective.uniclass.from === 'default', 'clearing it brings the default back');
    ed.modelChange(CO.setProjectClassification({ ...rec, defaults: false }));
    ok(!codes(part.guid).effective.uniclass && !/'CadCraft default'/.test(dec(ed.save())) && codes(s.guid).effective.uniclass.code === 'EF_25_10', 'defaults switched off: the default relations are removed, typed codes stay');
    ed.undo();
    ok(codes(part.guid).effective.uniclass?.from === 'default', 'undo switches them on again');
    const ed3 = await boot(ed.save());
    const w3 = new ModelWriter(WebIFC, ed3.api, ed3.mid);
    const r3 = CM.readProjectClassification(w3);
    ok(r3.systems.join() === 'uniclass,uniformat' && r3.defaults && CM.codesOf(w3, CM.anyByGuid(w3)(part.guid)).effective.uniclass.from === 'default', 'reopened: the project setting and the default (still marked a default) come back');
  }

  // ---------------------------------------------------------------------------------------------------- an imported file's codes
  console.log('== codes an imported file already has');
  {
    const ed = await boot(new TextEncoder().encode(N.newBuilding({ name: 'Imported', levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 'i.ifc', now: new Date('2026-11-11T12:00:00Z') })));
    const L1 = OPS.snapshotModel(ed).levels[0];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [4000, 0] }], typeKey: 'int-2x4', height: 2700 }));
    const g = OPS.snapshotModel(ed).walls[0].guid;
    // what another program writes: its own IfcClassification names, a nested reference, and an office system that is none of the three
    ed.modelChange(OPS.op((w) => {
      const id = w.byGuid(g);
      const u = w.make('IFCCLASSIFICATION', w.L('Other program'), w.L('2015'), null, w.L('Uniclass2015 Ss'), null, null, null);
      const parent = w.make('IFCCLASSIFICATIONREFERENCE', null, w.T('IFCIDENTIFIER', 'Ss_25'), w.L('Wall and barrier systems'), w.H(u), null, null);
      const ref = w.make('IFCCLASSIFICATIONREFERENCE', null, w.T('IFCIDENTIFIER', 'Ss_25_13_50'), w.L('Masonry wall systems'), w.H(parent), null, null);
      w.make('IFCRELASSOCIATESCLASSIFICATION', w.guid(), w.ownerHistory(), null, null, [w.H(id)], w.H(ref));
      const o = w.make('IFCCLASSIFICATION', w.L('Office'), null, null, w.L('Our office codes'), null, null, null);
      const oref = w.make('IFCCLASSIFICATIONREFERENCE', null, w.T('IFCIDENTIFIER', 'W-01'), w.L('Wall one'), w.H(o), null, null);
      w.make('IFCRELASSOCIATESCLASSIFICATION', w.guid(), w.ownerHistory(), null, null, [w.H(id)], w.H(oref));
      return { id, ids: [id] };
    }));
    const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    let c = CM.codesOf(W(), W().byGuid(g));
    ok(c.effective.uniclass?.code === 'Ss_25_13_50' && c.others.length === 1 && c.others[0].systemName === 'Our office codes' && c.others[0].code === 'W-01', 'a code under another spelling of the system and under a nested reference is read as Uniclass; an office system is listed apart, untouched', c);
    ed.modelChange(CO.setClassification([g], { system: 'uniclass', code: 'Ss_25_10_30', title: 'Framed partition systems' }));
    c = CM.codesOf(W(), W().byGuid(g));
    const txt = dec(ed.save());
    ok(c.effective.uniclass.code === 'Ss_25_10_30' && c.others[0]?.code === 'W-01' && (txt.match(/IFCCLASSIFICATION\(/g) || []).length === 2 && !/'Ss_25_13_50'/.test(txt) && /'W-01'/.test(txt),
      'changing it reuses the file\'s own IfcClassification (no second Uniclass), replaces the old code and leaves the office code alone', [(txt.match(/IFCCLASSIFICATION\(/g) || []).length]);
  }

  console.log(`\n${n - bad} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
