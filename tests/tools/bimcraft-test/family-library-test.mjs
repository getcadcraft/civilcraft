/* SPDX-License-Identifier: Apache-2.0 */
/**
 * family-library-test.mjs — a loadable family library (0.8 BIM-FAM-MORE step 8), DOM-free, run by
 *   node bin/test-bimcraft.mjs --famlib
 * Several families (one holding another) saved as one `cadcraft-family-library` file, opened in a blank building in IFC4 and IFC2X3,
 * placed there; hostile files refused; nothing in the file changes the Library item format.
 */
import path from 'node:path';

export async function famLibMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const FO = await import(path.join(APP, 'family-ops.js'));
  const FM = await import(path.join(APP, 'family-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const fs = await import('node:fs');
  const lang = fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8');
  const make = async (schema = 'IFC4') => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const bytes = schema === 'IFC2X3' ? fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))
      : new TextEncoder().encode(N.newBuilding({ name: 'Lib', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'l.ifc', now: new Date('2026-10-29T12:00:00Z') }));
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    const w = () => { const x = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(x); return x; };
    return { ed, w, level: OPS.snapshotModel(ed).levels[0].guid };
  };
  const block = (key, name, extra = {}) => ({ format: 'cadcraft-family', version: 1, key, name, kind: 'furniture', host: 'none', base: '', ifc: { class: 'IfcFurniture' },
    params: [{ key: 'Width', kind: 'length', value: 600 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 800 }],
    solids: [{ id: 's1', name: 'Block', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'solid' }], booleans: [], ...extra });

  for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== family library, ' + schema);
    const A = await make(schema);
    const inner = block('fam-inner', 'Shelf'), outer = block('fam-outer', 'Unit', { parts: [{ id: 'p1', family: 'fam-inner', at: ['0', '0', '0'], values: {} }] });
    A.ed.modelChange(FO.importFamilies([inner, outer], { keys: ['fam-inner', 'fam-outer'] }), { label: 'two families' });
    const lib = FO.familyLibrary(A.w(), 'Test set');
    ok(lib.format === 'cadcraft-family-library' && lib.version === 1 && lib.name === 'Test set', 'the library file has its format, version and name');
    ok(lib.families.length === 2 && lib.families.map((f) => f.key).sort().join() === 'fam-inner,fam-outer', 'both families are in it: ' + lib.families.map((f) => f.key));
    ok(lib.families.every((f) => Array.isArray(f.sizes) && f.sizes.length >= 1), 'each carries its sizes');
    const json = JSON.stringify(lib);
    const back = FO.readFamilyLibrary(JSON.parse(json));
    ok(back.ok && back.list.length === 1 && back.list[0].key === 'fam-outer', 'reading it drops the family that the other already brings in `uses`', JSON.stringify(back.list?.map((f) => f.key)));
    const B = await make(schema);
    ok(new TextDecoder().decode(B.ed.save()).includes('FILE_SCHEMA((\'' + schema), 'the building really is ' + schema);
    B.ed.modelChange(FO.importFamilies(back.list, { keys: back.list.map(() => null) }), { label: 'library' });
    const keys = [...FM.familyIndex(B.w()).groups.keys()];
    ok(keys.includes('fam-outer') && keys.includes('fam-inner'), 'opened in another building: the held family came along, once', keys.join());
    ok(keys.filter((k) => k === 'fam-inner').length === 1 && FM.familyIndex(B.w()).groups.size === keys.length, 'no duplicate');
    const n0 = B.ed.changes.length;
    B.ed.modelChange(FO.placeFamily({ storey: B.level, family: 'fam-outer', x: 1000, y: 1000 }), { label: 'place' });
    ok(B.ed.changes.length === n0 + 1, 'a family from the library is placed (one undo step)');
    const els = FO.readFamilyElements(B.w());
    ok(els.some((e) => e.family === 'fam-outer'), 'and it stands in the building', JSON.stringify(els.map((e) => e.family)));
    B.ed.undo(); B.ed.undo();
    ok(!FM.familyIndex(B.w()).groups.has('fam-outer'), 'one Undo removes the whole library load');
    // the same library into a building that already has fam-outer: it is kept, the new one takes a free key
    const C = await make(schema);
    C.ed.modelChange(FO.importFamilies([block('fam-outer', 'Mine')], { keys: ['fam-outer'] }), { label: 'mine' });
    C.ed.modelChange(FO.importFamilies(back.list, { keys: back.list.map(() => null) }), { label: 'library' });
    const names = [...FM.familyIndex(C.w()).groups.values()].map((g) => g.fam?.name).sort();
    ok(names.includes('Mine') && names.includes('Unit') && names.includes('Shelf'), 'a clash keeps the building\'s own family and adds the library\'s under a new key', names.join());
  }
  console.log('== hostile files');
  const R = (o) => FO.readFamilyLibrary(o);
  ok(!R(null).ok && !R({}).ok && !R({ format: 'cadcraft-family' }).ok && R({}).key === 'fam.err.notlibrary', 'not a library: refused');
  ok(R({ format: 'cadcraft-family-library', families: [] }).key === 'fam.err.emptylibrary' && R({ format: 'cadcraft-family-library' }).key === 'fam.err.emptylibrary', 'empty: refused with a reason');
  ok(R({ format: 'cadcraft-family-library', families: new Array(201).fill({ key: 'x' }) }).key === 'fam.err.biglibrary', 'over 200 families: refused');
  ok(R({ format: 'cadcraft-family-library', families: [1, 'a'] }).key === 'fam.err.notfamily' && R({ format: 'cadcraft-family-library', families: [[]] }).key === 'fam.err.notfamily', 'entries that are not objects: refused');
  const X = await make('IFC4');
  let threw = false;
  try { X.ed.modelChange(FO.importFamilies([block('good', 'Good'), { format: 'cadcraft-family', version: 1, key: 'bad', name: 'Bad', params: [], solids: [{ id: 's1', op: 'eval', x0: 'process.exit()' }] }], { keys: [null, null] }), { label: 'x' }); } catch (e) { threw = true; }
  ok(threw || !FM.familyIndex(X.w()).groups.has('good'), 'one bad family refuses the whole file; nothing half-loaded');
  ok(!FM.familyIndex(X.w()).groups.has('good'), 'the good one was not kept either');
  console.log('== words');
  ok(['fam.savelib', 'fam.savelib.done', 'fam.err.notlibrary', 'fam.err.emptylibrary', 'fam.err.biglibrary', 'fam.err.nolibrary'].every((k) => lang.includes('"' + k + '"')), 'every message has its words in lang/en.json');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
