/* SPDX-License-Identifier: Apache-2.0 */
/**
 * type-pack-test.mjs — the type pack round trip and the open-format check (0.10 BK.97, session bk-content-10), DOM-free:
 *   node bin/test-bimcraft.mjs --typepack
 * Three wall types are made in one project (layers, thicknesses, materials, core, a cavity, a zero-thickness membrane, layer priority,
 * an LOD tag, takeoff data, a classification code), packed, imported into an EMPTY project and packed again: the two packs must be equal.
 * Then the same through an IFC file, the conflict rules, the format's refusals, and wall types of a file another program could have written.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function typePackMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, n = 0;
  const ok = (cond, label, detail = '') => { n++; if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 700) + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const TP = await import(path.join(APP, 'type-pack.js'));
  const TPI = await import(path.join(APP, 'type-pack-ifc.js'));
  const PM = await import(path.join(APP, 'project-materials.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const CO = await import(path.join(APP, 'classify-ops.js'));
  const CM = await import(path.join(APP, 'classify-model.js'));
  const FO = await import(path.join(APP, 'family-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const dec = (b) => new TextDecoder().decode(b);
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const blank = (name) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 't.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const NOW = new Date('2026-11-11T12:00:00Z');

  // ------------------------------------------------------------------------------------------ the source project
  console.log('== three wall types in project A');
  const A = await blank('Project A');
  A.modelChange(OPS.op((w) => { PM.saveMaterial(w, { id: 'material-clt', name: 'Cross laminated timber', category: 'Timber', defaultThickness: 120, color: '#c8a46e', fill: 'diagonal', fillColor: '#444444', notes: 'Made for the test.' }); return { id: null, ids: [] }; }));
  const cavityWall = { version: 1, key: 'wall-cavity-brick', name: 'Brick cavity wall 300', exterior: true, lod: 300, takeoff: { unit: { name: 'Facing brick', length: 215, height: 65, width: 102.5 }, mortar: { name: 'M4', joint: 10 }, rate: { amount: 185.5, currency: 'GBP', basis: 'm2' } }, layers: [
    { mat: 'brick', t: 102.5, function: 'finish', core: false, priority: 250 },
    { mat: 'air', kind: 'cavity', t: 50, function: 'finish', core: false, ventilation: 'ventilated' },
    { mat: 'membrane', t: 0, function: 'membrane', core: false },
    { mat: 'insulation', t: 47.5, function: 'insulation', core: false },
    { mat: 'block', t: 100, function: 'structure', core: true, priority: 900 },
    { mat: 'plaster', t: 13, function: 'finish', core: false }] };
  const cltWall = { version: 1, key: 'wall-clt-120', name: 'CLT partition 145', exterior: false, layers: [
    { mat: 'gypsum', t: 12.5, function: 'finish', core: false },
    { mat: 'Cross laminated timber', materialId: 'material-clt', t: 120, function: 'structure', core: true },
    { mat: 'gypsum', t: 12.5, function: 'finish', core: false }] };
  const thin = { version: 1, key: 'wall-thin', name: 'Shaft wall 75', exterior: false, layers: [{ mat: 'gypsum', t: 25, function: 'substrate', core: false }, { mat: 'studs', t: 50, function: 'structure', core: true }] };
  for (const r of [cavityWall, cltWall, thin]) A.modelChange(OPS.saveWallAssembly(r));
  // a wall of one type, so that type has an IfcWallType in use, and a code on the type
  const L1 = OPS.snapshotModel(A).levels[0];
  A.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'wall-cavity-brick', height: 2700 }));
  const wallA = OPS.snapshotModel(A).walls[0];
  A.modelChange(CO.setClassification([wallA.guid], { system: 'uniclass', code: 'Ss_25_13_50', title: 'Masonry wall systems', target: 'type' }));
  A.modelChange(CO.setClassification([wallA.guid], { system: 'uniformat', code: 'B2010', target: 'type' }));
  A.modelChange(CO.setClassification([wallA.guid], { system: 'uniclass', code: 'EF_25_10', title: 'Walls' }));   // the wall's OWN code: must NOT travel with the type
  ok(WA.readAssemblies(W(A)).length === 3 && near(wallA.t, 313), 'three custom wall types; the cavity wall is 102.5 + 50 + 0 + 47.5 + 100 + 13 = 313 mm', wallA.t);

  console.log('== export');
  const choices = TP.wallTypeChoices(W(A));
  ok(choices.filter((c) => c.custom).length === 3 && choices.some((c) => c.key === 'ext-2x6' && !c.custom), 'the pack dialog\'s list: the three project types, then the starter types');
  const packA = TP.makeTypePack(W(A), { name: 'Test pack', now: NOW });
  const textA = JSON.stringify(packA, null, 1);
  const tCav = packA.types.find((t) => t.recipe.key === 'wall-cavity-brick');
  ok(packA.format === 'cadcraft-type-pack' && packA.version === 1 && packA.unit === 'mm' && packA.made === '2026-11-11' && packA.types.length === 3 && packA.types.every((t) => t.kind === 'wall' && t.ifc.class === 'IfcWallType'), 'the pack: format, version 1, mm, the date, three wall types, each naming IfcWallType');
  ok(tCav.thickness === 313 && tCav.recipe.layers.length === 6 && tCav.recipe.layers[0].priority === 250 && tCav.recipe.layers[4].priority === 900 && tCav.recipe.layers[1].kind === 'cavity' && tCav.recipe.layers[1].ventilation === 'ventilated' && tCav.recipe.layers[2].t === 0 && tCav.recipe.layers[4].core === true && tCav.recipe.lod === 300 && tCav.recipe.exterior === true,
    'the cavity wall in the pack: 6 layers, 313 mm, the ventilated cavity, the 0 mm membrane, the core, both layer priorities, LOD 300', tCav.recipe);
  ok(tCav.recipe.takeoff?.unit?.name === 'Facing brick' && tCav.recipe.takeoff.unit.length === 215 && tCav.recipe.takeoff.mortar?.joint === 10 && tCav.recipe.takeoff.rate?.amount === 185.5 && tCav.recipe.takeoff.rate.basis === 'm2', 'its takeoff data (unit 215 x 65 x 102.5, 10 mm mortar joint, rate 185.5 per m2) is in the pack', tCav.recipe.takeoff);
  ok(tCav.classification?.uniclass?.code === 'Ss_25_13_50' && tCav.classification.uniclass.title === 'Masonry wall systems' && tCav.classification.uniformat?.code === 'B2010' && !JSON.stringify(packA).includes('EF_25_10'), 'the type\'s two classification codes are in the pack; the one wall\'s own code is not (it belongs to the wall)');
  const matIds = packA.materials.map((m) => m.id).sort();
  ok(matIds.join() === ['material-block', 'material-brick', 'material-clt', 'material-gypsum', 'material-insulation', 'material-membrane', 'material-plaster', 'material-studs'].join() && packA.materials.find((m) => m.id === 'material-clt').color === '#c8a46e' && !matIds.includes('material-siding'),
    'materials: exactly the eight the three types use (with the project\'s own CLT and its colour and hatch), none of the others', matIds);

  console.log('== the open-format check');
  ok(/^[\x09\x0a\x0d\x20-\x7e -￿]*$/.test(textA) && JSON.stringify(JSON.parse(textA)) === JSON.stringify(packA), 'the file is plain JSON text: no control bytes, parses back to the same object');
  const longest = (v) => (typeof v === 'string' ? v.length : v && typeof v === 'object' ? Math.max(0, ...Object.values(v).map(longest)) : 0);
  ok(longest(packA) <= 2000 && !/base64|data:[a-z]+\/|\\u0000/i.test(textA), 'nothing encoded or binary-locked inside: no data: address, no base64, no text cell over 2000 characters', longest(packA));
  const doc = fs.readFileSync(path.join(ROOT, 'docs/apps/bimcraft-type-packs.md'), 'utf8');
  const keysOf = (o, out = new Set()) => { if (Array.isArray(o)) o.forEach((x) => keysOf(x, out)); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { out.add(k); keysOf(v, out); } return out; };
  const undocumented = [...keysOf({ ...packA, materials: packA.materials, types: packA.types.map((t) => ({ ...t, classification: undefined, recipe: { ...t.recipe, takeoff: undefined } })) })].filter((k) => !new RegExp('`' + k + '`').test(doc));
  ok(undocumented.length === 0, 'every field the pack writes is named in docs/apps/bimcraft-type-packs.md', undocumented);
  const rd = TP.readTypePack(textA);
  ok(rd.ok && TP.compareTypePacks(rd.pack, packA).length === 0 && JSON.stringify(rd.pack) === JSON.stringify(packA), 'the format check accepts it and reads it back unchanged', rd.errors);
  const refuse = (label, mut, want) => { const o = JSON.parse(textA); mut(o); const r = TP.readTypePack(JSON.stringify(o)); ok(!r.ok && r.errors.some((e) => want.test(e)), 'refused: ' + label, r.errors); };
  refuse('another format name', (o) => { o.format = 'something-else'; }, /^format: must be/);
  refuse('a newer version', (o) => { o.version = 2; }, /^version: must be 1/);
  refuse('a field the format does not have', (o) => { o.vendorBlob = 'AAAA'; }, /^vendorBlob: is not part of the format/);
  refuse('a field of a type the format does not have', (o) => { o.types[0].locked = true; }, /types\[0\]\.locked: is not part of the format/);
  refuse('a layer whose material is not in the pack', (o) => { o.materials = o.materials.filter((m) => m.id !== 'material-clt'); }, /its material material-clt is not in the pack/);
  refuse('a thickness that is not the sum of the layers', (o) => { o.types[0].thickness = 1; }, /thickness: must be the sum of the layers/);
  refuse('a type that names no IFC class', (o) => { delete o.types[0].ifc; }, /ifc\.class: must be IfcWallType/);
  refuse('a recipe with no core', (o) => { o.types[0].recipe.layers.forEach((l) => { l.core = false; }); }, /types\[0\]\.recipe:/);
  refuse('two types with one key', (o) => { o.types[1].recipe.key = o.types[0].recipe.key; }, /is there twice/);
  refuse('a classification system that is not one of the three', (o) => { o.types[0].classification = { masterformat: { code: '04 20 00' } }; }, /classification\.masterformat: must be one of/);
  refuse('inches', (o) => { o.unit = 'in'; }, /^unit: must be "mm"/);
  ok(!TP.readTypePack('PK\u0003\u0004\u0014\u0000\u0006\u0000').ok && TP.readTypePack('PK\u0003\u0004\u0014\u0000\u0006\u0000').errors[0] === 'file: not text (a type pack is plain JSON text)' && !TP.readTypePack('[1,2]').ok && !TP.readTypePack('{"format":"cadcraft-type-pack","version":1,"materials":[],"types":[]}').ok,
    'refused: a binary file (says it is not text), a JSON list, a pack with no type');

  // ------------------------------------------------------------------------------------------ into an empty project
  console.log('== import into an empty project B, then compare');
  const B = await blank('Project B');
  ok(WA.readAssemblies(W(B)).length === 0 && !PM.readMaterials(W(B)).some((m) => m.id === 'material-clt'), 'project B has no custom wall type and no CLT material');
  const steps = B.changes.length;
  const res = B.modelChange(TP.importTypePack(textA), { label: 'Type pack' });
  ok(B.changes.length === steps + 1 && res.summary.added.length === 3 && res.summary.skipped.length === 0 && res.summary.materials.added.join() === 'Cross laminated timber' && res.summary.materials.kept.length === 7,
    'one undo step: three types added; one material added (CLT), the seven starter materials B already has are kept', res.summary);
  const packB = TP.makeTypePack(W(B), { name: 'Test pack', now: NOW });
  const diff = TP.compareTypePacks(packA, packB);
  ok(diff.length === 0, 'A\'s pack and the pack exported from B are the same: layers, thicknesses, materials, core, cavity, membrane, priority, LOD, takeoff, classification', diff.slice(0, 6));
  ok(JSON.stringify(packA) === JSON.stringify(packB), 'and byte for byte the same JSON');
  const bt = dec(B.save());
  ok((bt.match(/IFCWALLTYPE\(/g) || []).length === 3 && (bt.match(/IFCMATERIALLAYERSET\(/g) || []).length >= 3 && /IFCCLASSIFICATIONREFERENCE\(\$,'Ss_25_13_50','Masonry wall systems'/.test(bt) && /IFCMATERIALLAYER\(#\d+,102\.5/.test(bt),
    'in B\'s IFC: three IfcWallType, their IfcMaterialLayerSet (a 102.5 brick layer), the classification reference on the type');
  // the type works: draw a wall of it in B
  const LB = OPS.snapshotModel(B).levels[0];
  B.modelChange(OPS.drawWalls({ storey: LB.guid, segs: [{ a: [0, 0], b: [4000, 0] }], typeKey: 'wall-cavity-brick', height: 2700 }));
  const wb = OPS.snapshotModel(B).walls[0];
  const cb = CM.codesOf(W(B), W(B).byGuid(wb.guid)).effective;
  ok(near(wb.t, 313) && cb.uniclass?.code === 'Ss_25_13_50' && cb.uniclass.from === 'type' && cb.uniformat?.code === 'B2010', 'a wall drawn in B with the imported type is 313 mm and reads the type\'s codes', [wb.t, cb]);
  B.undo(); B.undo();
  ok(WA.readAssemblies(W(B)).length === 0 && !PM.readMaterials(W(B)).some((m) => m.id === 'material-clt'), 'undo takes the import back: no type, no CLT');
  B.redo();
  ok(TP.compareTypePacks(packA, TP.makeTypePack(W(B), { name: 'Test pack', now: NOW })).length === 0, 'redo brings the same three types back');

  console.log('== a pack met twice: skip, copy, replace');
  let r2 = B.modelChange(TP.importTypePack(textA));
  ok(r2.summary.skipped.length === 3 && r2.summary.added.length === 0 && WA.readAssemblies(W(B)).length === 3, 'importing it again (skip, the default): the three types the project has are kept, nothing doubled', r2.summary);
  r2 = B.modelChange(TP.importTypePack(textA, { conflict: 'copy' }));
  const names = WA.readAssemblies(W(B)).map((x) => x.name);
  ok(r2.summary.copied.length === 3 && names.length === 6 && names.includes('Brick cavity wall 300 (2)') && new Set(WA.readAssemblies(W(B)).map((x) => x.key)).size === 6, 'copy: three more types under new keys and names ("… (2)")', names);
  B.undo();
  B.modelChange(OPS.drawWalls({ storey: LB.guid, segs: [{ a: [0, 0], b: [4000, 0] }], typeKey: 'wall-thin', height: 2700 }));
  const changed = JSON.parse(textA); changed.types.find((t) => t.recipe.key === 'wall-thin').recipe.layers[1].t = 64; changed.types.find((t) => t.recipe.key === 'wall-thin').thickness = 89;
  changed.types.find((t) => t.recipe.key === 'wall-clt-120').recipe.layers[1].t = 140; changed.types.find((t) => t.recipe.key === 'wall-clt-120').thickness = 165;
  r2 = B.modelChange(TP.importTypePack(changed, { conflict: 'replace' }));
  const after = WA.readAssemblies(W(B));
  ok(r2.summary.inUse.join() === 'Shaft wall 75' && r2.summary.replaced.includes('CLT partition 145') && after.find((x) => x.key === 'wall-thin').layers[1].t === 50 && after.find((x) => x.key === 'wall-clt-120').layers[1].t === 140 && near(OPS.snapshotModel(B).walls[0].t, 75),
    'replace: a type no wall uses is overwritten (CLT now 140); the one a wall uses is kept and reported in use (its wall stays 75 mm)', r2.summary);

  // ------------------------------------------------------------------------------------------ as IFC
  console.log('== the same pack as an IFC file');
  const scratch = await quiet(TPI.typePackScratch)(WebIFC, IfcModel);
  const ifcBytes = await quiet((p) => scratch.toIfc(p, { name: 'Test pack' }))(packA);
  const it = dec(ifcBytes);
  ok(/IFCPROJECTLIBRARY\(/.test(it) && (it.match(/IFCRELDECLARES\(/g) || []).length === 2 && (it.match(/IFCWALLTYPE\(/g) || []).length === 3 && /FILE_SCHEMA\(\('IFC4'\)\)/.test(it),
    'an IFC4 file: an IfcProjectLibrary that declares the three IfcWallType');
  ok(/IFCMATERIALLAYERSET\(\([^)]*\),'Brick cavity wall 300'/.test(it) && /IFCMATERIAL\('Cross laminated timber',\$,'Timber'\)/.test(it) && /IFCCLASSIFICATIONREFERENCE\(\$,'Ss_25_13_50'/.test(it) && /'CadCraft_WallType'/.test(it) && !/IFCWALL\(|IFCWALLSTANDARDCASE\(/.test(it),
    'each type has its IfcMaterialLayerSet, the materials by name and category, its classification reference; no wall, only types');
  const back = await quiet((b) => scratch.fromIfc(b, { name: 'Test pack' }))(ifcBytes);
  back.pack.made = packA.made;
  const d2 = TP.compareTypePacks(packA, back.pack);
  ok(d2.length === 0 && back.notes.length === 0 && TP.readTypePack(back.pack).ok, 'read back from the IFC file: the same pack (every layer, tag and code), and it passes the format check', d2.slice(0, 5));
  const C = await blank('Project C');
  C.modelChange(TP.importTypePack(back.pack));
  ok(TP.compareTypePacks(packA, TP.makeTypePack(W(C), { name: 'Test pack', now: NOW })).length === 0, 'JSON → IFC → an empty project C → JSON: still the same pack');

  console.log('== wall types of a file another program could have written');
  {
    const F = await blank('Foreign');
    F.modelChange(OPS.op((w) => {
      const mat = (n) => w.make('IFCMATERIAL', w.L(n), null, null);
      const layer = (m, t, name, cat) => w.make('IFCMATERIALLAYER', m ? w.H(m) : null, w.u(t), null, w.L(name), null, w.L(cat), null);
      const set = w.make('IFCMATERIALLAYERSET', [layer(mat('Facing brick'), 102.5, 'Outer leaf', null), layer(null, 50, 'Cavity', null), layer(mat('Mineral wool'), 100, null, 'Insulation'), layer(mat('Dense concrete block'), 140, null, 'LoadBearing'), layer(mat('Gypsum plaster'), 13, null, null)].map((x) => w.H(x)), w.L('EXT-01'), null);
      const ty = w.make('IFCWALLTYPE', w.guid(), w.ownerHistory(), w.L('EXT-01 External cavity wall'), null, null, null, null, null, null, 'STANDARD');
      w.associateMaterial(ty, set);
      const cl = w.make('IFCCLASSIFICATION', w.L('NBS'), null, null, w.L('Uniclass 2015'), null, null, null);
      const ref = w.make('IFCCLASSIFICATIONREFERENCE', null, w.T('IFCIDENTIFIER', 'Ss_25_13_50'), w.L('Masonry wall systems'), w.H(cl), null, null);
      w.make('IFCRELASSOCIATESCLASSIFICATION', w.guid(), w.ownerHistory(), null, null, [w.H(ty)], w.H(ref));
      w.make('IFCWALLTYPE', w.guid(), w.ownerHistory(), w.L('No layers'), null, null, null, null, null, null, 'STANDARD');
      return { id: ty, ids: [ty] };
    }));
    const got = await quiet((b) => scratch.fromIfc(b))(F.save());
    const ft = got.pack.types[0];
    ok(got.pack.types.length === 1 && ft.guessed === true && ft.recipe.name === 'EXT-01 External cavity wall' && near(ft.thickness, 405.5) && ft.recipe.layers.map((l) => l.t).join() === '102.5,50,100,140,13' && ft.recipe.layers[1].kind === 'cavity',
      'a wall type with an IfcMaterialLayerSet and no CadCraft data is read: its name, five layers 102.5 / 50 / 100 / 140 / 13 = 405.5 mm, the cavity; marked guessed', ft);
    ok(ft.recipe.layers[2].function === 'insulation' && ft.recipe.layers[3].function === 'structure' && ft.recipe.layers[3].core === true && ft.recipe.layers.filter((l) => l.core).length === 1 && ft.recipe.layers[0].function === 'structure' === false,
      'what the file does not say is guessed and said so: insulation and load-bearing from the IFC category, the load-bearing block is the core, the facing brick a finish', ft.recipe.layers.map((l) => [l.mat, l.function, l.core]));
    ok(ft.classification?.uniclass?.code === 'Ss_25_13_50' && got.pack.materials.some((m) => m.name === 'Facing brick') && got.pack.materials.some((m) => m.name === 'Dense concrete block') && got.notes.some((x) => x.key === 'typepack.note.nolayers' && x.fill.name === 'No layers') && TP.readTypePack(got.pack).ok,
      'its classification code and its materials (by the file\'s names) come along; the type with no layers is left out and named; the result passes the format check', got.notes);
    const D = await blank('Project D');
    D.modelChange(TP.importTypePack(got.pack));
    const LD = OPS.snapshotModel(D).levels[0];
    D.modelChange(OPS.drawWalls({ storey: LD.guid, segs: [{ a: [0, 0], b: [3000, 0] }], typeKey: ft.recipe.key, height: 2700 }));
    ok(near(OPS.snapshotModel(D).walls[0].t, 405.5), 'imported into a project, a wall of that type draws 405.5 mm thick', OPS.snapshotModel(D).walls[0].t);
  }

  console.log('== starter types and families');
  {
    const p = TP.makeTypePack(W(A), { keys: ['ext-2x6', 'wall-thin'], now: NOW });
    ok(p.types.length === 2 && p.types[0].recipe.key === 'wall-ext-2x6' && near(p.types[0].thickness, 184.15) && p.types[0].recipe.layers.filter((l) => l.core).length === 1 && TP.readTypePack(p).ok, 'a starter type goes into a pack as a copy with its own key (wall-ext-2x6, 19.05 + 12.7 + 139.7 + 12.7 = 184.15 mm)', p.types[0]);
    let threw = '';
    try { TP.makeTypePack(W(A), { keys: ['wall-nope'] }); } catch (e) { threw = e.key; }
    ok(threw === 'typepack.err.notype', 'a type that is not in the project is refused by name', threw);
    // a family in the pack
    A.modelChange(FO.newFamily({ name: 'Test shelf', kind: 'furniture', host: 'none', key: 'fam-testshelf0' }));
    const pf = TP.makeTypePack(W(A), { families: 'all', now: NOW });
    ok(pf.families?.length === 1 && pf.families[0].key === 'fam-testshelf0' && pf.families[0].format === 'cadcraft-family' && TP.readTypePack(JSON.stringify(pf)).ok, 'the project\'s family goes into the pack as a family file and passes the check', pf.families?.map((f) => f.key));
    const E = await blank('Project E');
    const st = E.changes.length;
    const re = E.modelChange(TP.importTypePack(JSON.stringify(pf)));
    const pe = TP.makeTypePack(W(E), { families: 'all', now: NOW });
    ok(E.changes.length === st + 1 && re.summary.families.join() === 'fam-testshelf0' && TP.compareTypePacks(pf, pe).length === 0, 'types and family import as ONE undo step; the pack exported from E equals the one imported (family included)', TP.compareTypePacks(pf, pe).slice(0, 4));
    E.undo();
    ok(WA.readAssemblies(W(E)).length === 0 && !FO.readFamilies(W(E)).some((f) => f.key === 'fam-testshelf0'), 'undo removes the types and the family together');
  }
  scratch.close();

  console.log(`\n${n - bad} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
