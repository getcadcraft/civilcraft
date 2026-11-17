/* SPDX-License-Identifier: Apache-2.0 */
/**
 * library-kinds-test.mjs: Symbols / Types / Assets, Types and project templates and Quick Kits as Library items, the version rule (0.10 BK.21,
 * BK.98, BK.153, BK.154; session bk-r3-library-10), DOM-free:  node bin/test-bimcraft.mjs --libkinds
 * A wall type is made in project A, made into a Library item (typeToLibraryItem, the Types builder's maker), checked by libitem.js (content rules on) AND by the server's PHP checker
 * (same verdict), then added to an EMPTY project B through importTypePack: same thickness, layers, LOD and code. Kits are made with kitItem and
 * checked by both. The class map, LOD scale, systems and the pack-version copies are compared with the PHP side.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export async function libraryKindsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, n = 0;
  const ok = (cond, label, detail = '') => { n++; if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)).slice(0, 500) + ')' : '')); };
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const TP = await import(path.join(APP, 'type-pack.js'));
  const WA = await import(path.join(APP, 'wall-assemblies.js'));
  const CO = await import(path.join(APP, 'classify-ops.js'));
  const L = await import(path.join(APP, 'libitem.js'));
  const TLI = await import(path.join(APP, 'type-library-item.js'));   // the Types builder's item maker (bk-r3-types-10)
  const PV = await import(path.join(APP, 'packver.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const blank = (name) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 't.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const NOW = new Date('2026-11-11T12:00:00Z');
  const php = (code, input) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', '-r', "require '" + ROOT + "/public_html/core/bootstrap.php'; " + code, '--', input || ''], { encoding: 'utf8', input: input || '' }));
  const phpCheck = (items) => { const f = path.join(os.tmpdir(), 'lk-' + process.pid + '.json'); fs.writeFileSync(f, JSON.stringify(items)); fs.chmodSync(f, 0o644);
    try { return php("LibraryCatalog::\$contentRules = true; \$d = json_decode(file_get_contents('" + f + "'), true); \$o = []; foreach (\$d as \$k => \$i) \$o[\$k] = LibraryItemFormat::validate(\$i, true)['errors']; echo json_encode(\$o);"); } finally { fs.unlinkSync(f); } };

  console.log('== BK.21: the class map is one map');
  const ph = php("echo json_encode(['classes' => array_keys(LibraryCatalog::ITEM_CLASSES), 'map' => LibraryCatalog::KIND_CLASS, 'lod' => LibraryCatalog::LOD_SCALE, 'sys' => array_keys(LibraryCatalog::CLASSIFICATION_SYSTEMS), 'lodKinds' => LibraryCatalog::LOD_KINDS, 'classified' => LibraryCatalog::CLASSIFIED_KINDS, 'kinds' => array_keys(LibraryCatalog::KINDS), 'te' => LibraryCatalog::TYPE_ELEMENTS, 'tic' => LibraryCatalog::TYPE_IFC_CLASSES, 'kt' => LibraryCatalog::KIT_TYPES]);");
  ok(JSON.stringify(L.ITEM_CLASSES) === JSON.stringify(ph.classes), 'three classes, the same names and order in PHP and JS', ph.classes);
  ok(JSON.stringify(Object.entries(L.KIND_CLASS).sort()) === JSON.stringify(Object.entries(ph.map).sort()), 'kind → class: the same map', ph.map);
  ok(JSON.stringify(L.LOD_SCALE) === JSON.stringify(ph.lod) && JSON.stringify(L.CLASSIFICATION_SYSTEMS) === JSON.stringify(ph.sys), 'LOD scale and classification systems agree');
  ok(JSON.stringify(L.LOD_KINDS) === JSON.stringify(ph.lodKinds) && JSON.stringify(L.CLASSIFIED_KINDS) === JSON.stringify(ph.classified) && JSON.stringify(L.TYPE_ELEMENTS) === JSON.stringify(ph.te) && JSON.stringify(L.TYPE_IFC_CLASSES) === JSON.stringify(ph.tic) && JSON.stringify(L.KIT_TYPES) === JSON.stringify(ph.kt), 'the kinds that need a LOD or a code, type elements, type classes and kit types agree');
  ok(L.KINDS.every((k) => ph.kinds.includes(k)), 'every JS kind is a kind the server knows');
  ok(L.classOfKind('door') === 'asset' && L.classOfKind('symbol') === 'symbol' && L.classOfKind('type') === 'type' && L.classOfKind('kit') === '' && L.classOfKind('material') === '', 'classOfKind: door is an Asset, symbol a Symbol, type a Type, kit and material none');
  ok(JSON.stringify(L.kindsOfClass('symbol').sort()) === JSON.stringify(['detail', 'symbol']), 'kindsOfClass(symbol)');
  ok(Object.keys(L.CATEGORIES).includes('types/floors') && Object.keys(L.CATEGORIES).includes('kits/quick'), 'the type and kit categories are in the JS taxonomy');

  console.log('== BK.153 / BK.154: the version rule has one source');
  for (const t of ['bimcraft', 'cadcraft', 'shell']) {
    const drift = JSON.parse(execFileSync('node', [path.join(ROOT, 'tools/packver/sync.mjs'), '--check', '--to', t], { encoding: 'utf8' }).includes('in sync') ? '[]' : '["drift"]');
    ok(!drift.length, 'packver.js copy "' + t + '" is byte-identical to lib/packver/packver.js');
  }
  ok(PV.validatePackVersion({ version: '0.1.0', changelog: [{ version: '0.1.0', date: '2026-11-11', added: ['x'] }] }).ok, 'packver.js is the one the app imports');

  console.log('== BK.21: a wall type becomes a Library item and comes back');
  const A = await blank('Project A');
  const cav = { version: 1, key: 'wall-cavity-brick', name: 'Brick cavity wall 300', exterior: true, lod: 300, layers: [
    { mat: 'brick', t: 102.5, function: 'finish', core: false }, { mat: 'air', kind: 'cavity', t: 50, function: 'finish', core: false, ventilation: 'ventilated' },
    { mat: 'insulation', t: 47.5, function: 'insulation', core: false }, { mat: 'block', t: 100, function: 'structure', core: true }, { mat: 'plaster', t: 13, function: 'finish', core: false }] };
  const bare = { version: 1, key: 'wall-bare', name: 'Bare wall 100', exterior: false, layers: [{ mat: 'block', t: 100, function: 'structure', core: true }] };
  for (const r of [cav, bare]) A.modelChange(OPS.saveWallAssembly(r));
  const L1 = OPS.snapshotModel(A).levels[0];
  A.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }], typeKey: 'wall-cavity-brick', height: 2700 }));
  const wall = OPS.snapshotModel(A).walls[0];
  A.modelChange(CO.setClassification([wall.guid], { system: 'uniclass', code: 'Ss_25_13_50', title: 'Masonry wall systems', target: 'type' }));
  const it = TLI.typeToLibraryItem(W(A), 'wall-cavity-brick');
  const made = L.validateItem(it, { partial: true });
  ok(made.ok, 'typeToLibraryItem: the item passes libitem.js (partial)', made.errors);
  ok(it.kind === 'type' && it.category === 'types/walls' && it.ifc.class === 'IfcWallType' && it.ifc.predefined === 'STANDARD' && it.type.lod === 300 && it.type.element === 'wall', 'a Type: kind type, wall category, IfcWallType, LOD 300 stated');
  ok(it.type.thickness === 313 && it.type.layers === 5, 'real thickness 313 mm over 5 layers (102.5 + 50 + 47.5 + 100 + 13)', it.type);
  ok(it.classification?.length === 1 && it.classification[0].system === 'uniclass' && it.classification[0].code === 'Ss_25_13_50', 'the type\'s own classification code travels (a code, not a name)', it.classification);
  const strict = L.validateItem({ ...it, license: { id: 'CC0-1.0' }, uuid: '11111111-2222-4333-8444-555555555555', version: 1 }, { content: true });
  ok(strict.ok, 'with the content rules on, the item passes', strict.errors);
  const bareItem = { item: TLI.typeToLibraryItem(W(A), 'wall-bare') };
  ok(L.validateItem(bareItem.item, { partial: true }).ok && bareItem.item.type.lod === undefined && !bareItem.item.classification, 'a type with no LOD and no code: the item says none (nothing invented)');
  const bareStrict = L.validateItem(bareItem.item, { partial: true, content: true });
  ok(!bareStrict.ok && bareStrict.errors.some((e) => /^type\.lod: is required: every item states its level of development/.test(e)) && bareStrict.errors.some((e) => /^classification: is required: every item carries a classification code/.test(e)), 'with the content rules on, it is refused with both plain reasons', bareStrict.errors);
  ok(L.validateItem(bareItem.item, { partial: true }).ok, 'with them off (the default of the converter and older files) it is accepted');
  const twoPack = TP.makeTypePack(W(A), { keys: ['wall-cavity-brick', 'wall-bare'], name: 'Two', now: NOW });
  const twoR = L.validateItem({ ...it, type: { ...it.type, pack: twoPack } }, { partial: true });
  ok(!twoR.ok && twoR.errors.some((e) => /exactly one type/.test(e)), 'a pack with two types is not a Type item: exactly one type', twoR.errors);
  const pv = phpCheck({ typed: { ...it, license: { id: 'CC0-1.0' } }, bare: bareItem.item });
  ok(pv.typed.length === 0, 'the server\'s PHP checker accepts the same item with the content rules on', pv.typed);
  ok(JSON.stringify(pv.bare) === JSON.stringify(L.validateItem(bareItem.item, { partial: true, content: true }).errors), 'and refuses the bare one with the same words as libitem.js', { php: pv.bare, js: bareStrict.errors });

  const B = await blank('Project B');
  ok(WA.readAssemblies(W(B)).length === 0, 'project B has no custom wall type');
  const steps = B.changes.length;
  const res = B.modelChange(TP.importTypePack(it.type.pack, { conflict: 'copy' }), { label: 'Type from the Library' });
  ok(B.changes.length === steps + 1 && res.summary.added.length === 1, 'added from the Library item: one undo step, one type', res.summary);
  const got = WA.readAssemblies(W(B)).find((x) => x.key === 'wall-cavity-brick');
  ok(got && got.lod === 300 && got.layers.length === 5 && Math.abs(got.layers.reduce((s, l) => s + l.t, 0) - 313) < 1e-9, 'in project B: the type has LOD 300, five layers, 313 mm', got);
  const again = B.modelChange(TP.importTypePack(it.type.pack, { conflict: 'copy' }), { label: 'Type from the Library' });
  ok(again.summary.copied.length === 1 && WA.readAssemblies(W(B)).length === 2, 'adding it again makes a copy (a name that is taken never overwrites)', again.summary);

  console.log('== BK.98: a project template and a Quick Kit');
  const ifcText = 'ISO-10303-21;\nHEADER;\nENDSEC;\nDATA;\nENDSEC;\nEND-ISO-10303-21;\n';
  const tpl = L.kitItem({ type: 'project-template', name: 'Office start', app: 'bimcraft', summary: 'Two levels, grids', ifcText, date: '2026-11-11' });
  ok(tpl.ok && tpl.item.kind === 'kit' && tpl.item.category === 'kits/templates' && tpl.item.kit.version === '0.1.0' && tpl.item.kit.changelog[0].added[0] === 'First version' && tpl.item.kit.changelog[0].date === '2026-11-11', 'a project template item: version 0.1.0 (for discussion), a changelog with its first line', tpl.errors);
  const uuid = '11111111-2222-4333-8444-555555555555';
  const qk = L.kitItem({ type: 'quick-kit', name: 'Office kit', apps: ['bimcraft'], members: [{ uuid, name: 'Table' }], version: '0.2.0', added: ['Added a table'], date: '2026-11-11' });
  ok(qk.ok && qk.item.category === 'kits/quick' && qk.item.kit.members[0].uuid === uuid && !('file' in qk.item.kit), 'a Quick Kit item names the Library items it brings', qk.errors);
  const bad1 = L.kitItem({ type: 'quick-kit', name: 'x', members: [{ uuid }], version: 'v1' });
  ok(!bad1.ok && bad1.errors.some((e) => /^kit\.version: must be MAJOR\.MINOR\.PATCH/.test(e)), 'a version that is not MAJOR.MINOR.PATCH is refused with the reason', bad1.errors);
  const bad2 = L.kitItem({ type: 'quick-kit', name: 'x', members: [{ uuid }], version: '1.0.0' });
  ok(!bad2.ok && bad2.errors.some((e) => /^kit\.adopted: is required from version 1\.0\.0 on/.test(e)), '1.0.0 is refused until the owner adopts it', bad2.errors);
  const bad3 = L.kitItem({ type: 'project-template', name: 'x', app: 'bimcraft', ifcText: 'not ifc' });
  ok(!bad3.ok && bad3.errors.some((e) => /^kit\.file\.data: must be the text of an IFC/.test(e)), 'a template that is not IFC text is refused', bad3.errors);
  const pk = phpCheck({ tpl: tpl.item, qk: qk.item, b1: bad1.item, b2: bad2.item, b3: bad3.item });
  ok(pk.tpl.length === 0 && pk.qk.length === 0 && JSON.stringify(pk.b1) === JSON.stringify(bad1.errors) && JSON.stringify(pk.b2) === JSON.stringify(bad2.errors) && JSON.stringify(pk.b3) === JSON.stringify(bad3.errors),
    'the server\'s PHP checker gives the same verdict and words on all five', pk);
  const tmpl = await import(path.join(APP, 'template-store.js'));
  const id = await tmpl.putTemplate({ name: tpl.item.name, bytes: new TextEncoder().encode(tpl.item.kit.file.data) });
  const back = await tmpl.getTemplate(id);
  ok(back && new TextDecoder().decode(new Uint8Array(back.bytes)) === ifcText, 'the template file comes out of the item byte for byte and goes into "my templates"');
  await tmpl.removeTemplate(id);

  console.log(bad ? `\n${bad} of ${n} failed` : `\n${n} ok, 0 failed`);
  return bad ? 1 : 0;
}
