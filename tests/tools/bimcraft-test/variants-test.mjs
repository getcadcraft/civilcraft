/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --variants` (0.7 W3.19, session `configurator`): placing an item with variants, in Node, on the sample
 * models (IFC4 and IFC2X3): the default variant when none is named, a chosen one, one type per variant (the same variant twice shares
 * its type), the variant in CadCraft_LibraryItem (Variant, VariantName, VariantValues) on the type and the placement, the geometry
 * of each variant (the box's width and depth in the reopened file), Swap to another variant (number and quantity kept, undo), copy
 * (placeLike), the clipboard key and its round trip (libKey, placementClip, writeClip, readClip), an update that keeps the variant
 * when the new version still has it and takes the default when not, and an item without variants unchanged.
 */
import path from 'node:path';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export async function variantsMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 0.6) => Math.abs(a - b) <= tol;
  const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
  const TF = process.env.BIMCRAFT_TESTFILES || path.join(ROOT, '..', 'testfiles');
  const L = await imp('libitem.js'), C = await imp('clipboard.js');
  const { IfcPlacer, PSETS, withVariant } = await imp('ifc-place.js');
  const { IfcEditor } = await imp('ifc-edit.js');
  const { productTriangles } = await imp('ifc-util.js');
  const base = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/library/fixtures/plate-variants.item.json'), 'utf8'));
  const plate = { ...base, uuid: '55555555-5555-4555-8555-555555555555', version: 1, license: { id: 'CC0-1.0', holder: 'Test' }, ifc: { class: 'IfcBuildingElementProxy', predefined: 'NOTDEFINED' } };
  const plain = { ...L.cleanItem(base), uuid: '66666666-6666-4666-8666-666666666666', version: 1, name: 'Plain plate', variants: undefined, license: { id: 'CC0-1.0', holder: 'Test' } };
  delete plain.variants;
  const sizeOf = (api, mid, id, unitMm) => {
    const t = productTriangles(api, mid, id, unitMm);
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < t.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], t.positions[i + k]); hi[k] = Math.max(hi[k], t.positions[i + k]); }
    return [(hi[0] - lo[0]) * unitMm, (hi[1] - lo[1]) * unitMm, (hi[2] - lo[2]) * unitMm];   // file units → mm
  };
  const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), removeItem: (k) => m.delete(k), setItem: (k, v) => { m.set(k, String(v)); } }; };

  console.log('== withVariant (the one place that turns an item into a variant)');
  {
    const [a, oa] = withVariant(plate, {});
    ok(a.name === 'Mounting plate — Medium' && !a.variants && oa.variant.id === 'medium' && oa.variant.values.width === 120, 'no variant named: the default (Medium), named "Mounting plate — Medium"');
    const [b, ob] = withVariant(plate, { variant: { id: 'large' }, library: 'librarycraft' });
    ok(b.params.width === 180 && ob.variant.id === 'large' && ob.library === 'librarycraft', 'a variant named: its size, the other options kept');
    const [c, oc] = withVariant(plate, { variant: { id: 'nope' } });
    ok(oc.variant.id === 'medium' && c.name.endsWith('Medium'), 'a variant the item does not have: the default');
    const [d, od] = withVariant(plain, { x: 1 });
    ok(d === plain && od.x === 1 && !od.variant, 'an item without variants comes back as it was');
  }

  const engine = await quiet(IfcModel.create)(WebIFC, null);
  const engine2 = await quiet(IfcModel.create)(WebIFC, null);
  const api = engine.api;
  for (const f of ['Ifc4_SampleHouse.ifc', 'Ifc2x3_Duplex_Architecture.ifc'].filter((x) => fs.existsSync(path.join(TF, 'samples', x)))) {
    console.log('== placing variants in ' + f);
    await quiet((b) => engine.load(b))(new Uint8Array(fs.readFileSync(path.join(TF, 'samples', f))));
    const ed = new IfcEditor(WebIFC, engine);
    const inf = ed.placer().info();
    const storey = inf.storeys[0];
    const at = (n, extra = {}) => ({ storey: storey.id, x: 1000 + n * 2500, y: 1000, rot: 0, itemNumber: String(n + 1), quantity: 1, library: 'librarycraft', sha256: 'a'.repeat(64), ...extra });
    const dflt = ed.placeItem(plate, at(0));
    const small = ed.placeItem(plate, at(1, { variant: { id: 'small' } }));
    const large = ed.placeItem(plate, at(2, { variant: { id: 'large' } }));
    const large2 = ed.placeItem(plate, at(3, { variant: { id: 'large' }, quantity: 5 }));
    const noholes = ed.placeItem(plate, at(4, { variant: { id: 'medium-no-holes' } }));
    const sw = ed.placeItem(plate, at(7, { variant: { id: 'small' } }));   // the one swapped, undone and redone below
    const pl = ed.placer().placements();
    const row = (r) => pl.find((x) => x.id === r.id);
    ok(row(dflt).variant === 'medium' && row(small).variant === 'small' && row(large).variant === 'large' && row(noholes).variant === 'medium-no-holes', 'placements() reads the variant back: ' + pl.map((x) => x.variant).join(', '));
    ok(row(large).variantName === 'Large' && row(large).name === 'Mounting plate — Large' && row(small).name === 'Mounting plate — Small', 'the occurrence is named after item and variant');
    ok(new Set([dflt.typeId, small.typeId, large.typeId, noholes.typeId]).size === 4 && large2.typeId === large.typeId && !large2.typeCreated && large.typeCreated, 'one type per variant; the same variant twice shares its type');
    ok(row(large2).quantity === 5 && row(large2).itemNumber === '4', 'quantity and item number are the placement\'s own');
    const props = await quiet((x) => engine.properties(x))(large.id);
    const lib = props.sets.find((s) => s.name === PSETS.library);
    const val = (n) => lib?.rows.find((r) => r.name === n)?.value;
    ok(val('Variant') === 'large' && val('VariantName') === 'Large' && /width=180/.test(val('VariantValues') || '') && /thick=10/.test(val('VariantValues') || '') && val('ItemUuid') === plate.uuid, 'CadCraft_LibraryItem: Variant large, VariantName Large, VariantValues "' + val('VariantValues') + '"');
    const tprops = props.sets.find((s) => s.name === PSETS.library + ' (type)');
    ok(tprops && tprops.rows.some((r) => r.name === 'Variant' && r.value === 'large'), 'the type carries the variant too (a type per variant)');
    const plainP = ed.placeItem(plain, at(5));
    ok(ed.placer().placements().find((x) => x.id === plainP.id).variant === '' && !(await quiet((x) => engine.properties(x))(plainP.id)).sets.find((s) => s.name === PSETS.library).rows.some((r) => r.name === 'Variant'), 'an item without variants has no Variant property');

    // swap: Small → Large keeps number and quantity; undo restores
    const swapped = ed.swapItem(sw.id, plate, { library: 'librarycraft', sha256: 'a'.repeat(64), variant: { id: 'large' } });
    let r2 = ed.placer().placements().find((x) => x.id === sw.id);
    ok(r2.variant === 'large' && r2.itemNumber === '8' && swapped.typeId === large.typeId, 'swap to another variant: Large, item number 8 kept, the Large type shared');
    ed.undo();
    r2 = ed.placer().placements().find((x) => x.id === sw.id);
    ok(r2.variant === 'small' && r2.name === 'Mounting plate — Small', 'undo brings Small back');
    ed.redo();
    ok(ed.placer().placements().find((x) => x.id === sw.id).variant === 'large', 'redo swaps it again');

    // copy
    const copy = ed.placeLike(large.id, at(6), { label: 'copy' });
    const rc = ed.placer().placements().find((x) => x.id === copy.id);
    ok(rc.variant === 'large' && rc.variantName === 'Large' && copy.typeId === large.typeId, 'copy (placeLike) is the same variant, same type');

    // update: keeps the variant while the new version has it; else the default
    const v2 = { ...plate, version: 2 };
    ed.swapItem(large2.id, v2, { library: 'librarycraft', variant: { id: 'large' } }, { what: 'update' });
    const v3 = { ...plate, version: 3, variants: { ...plate.variants, rows: plate.variants.rows.filter((x) => x.id !== 'large') } };
    const gone = v3.variants.rows.find((x) => x.id === 'large');
    ed.swapItem(large.id, v3, { library: 'librarycraft', variant: gone ? { id: 'large' } : null }, { what: 'update' });
    const after = ed.placer().placements();
    ok(after.find((x) => x.id === large2.id).variant === 'large' && after.find((x) => x.id === large2.id).version === 2, 'update to a version that still has the variant keeps it');
    ok(after.find((x) => x.id === large.id).variant === 'medium' && after.find((x) => x.id === large.id).version === 3, 'update to a version without it: the default variant');

    // saved and reopened: geometry per variant
    const bytes = ed.save();
    const re = await quiet((b) => engine2.load(b))(bytes);
    const back = new IfcPlacer(WebIFC, engine2.api, engine2.modelID);
    const unit = back.unitMm;
    const b0 = back.placements(), by = new Map(b0.map((x) => [x.id, x]));
    ok(by.get(small.id).variant === 'small' && by.get(dflt.id).variant === 'medium' && by.get(noholes.id).variant === 'medium-no-holes' && by.get(copy.id).variant === 'large', 'reopened: the variants are in the file');
    const sz = (id) => sizeOf(engine2.api, engine2.modelID, id, unit).map((x) => Math.round(x * 10) / 10);
    const sSmall = sz(small.id), sMed = sz(dflt.id), sLarge2 = sz(large2.id), sCopy = sz(copy.id);
    ok(near(sSmall[0], 80) && near(sSmall[1], 50) && near(sSmall[2], 6), 'reopened: the Small placement is 80 × 50 × 6 mm (' + sSmall.join(' × ') + ')');
    ok(near(sMed[0], 120) && near(sMed[1], 60) && near(sMed[2], 8), 'reopened: Medium is 120 × 60 × 8 mm (' + sMed.join(' × ') + ')');
    ok(near(sLarge2[0], 180) && near(sLarge2[1], 90) && near(sLarge2[2], 10) && near(sCopy[0], 180), 'reopened: Large (updated) and its copy are 180 × 90 × 10 mm (' + sLarge2.join(' × ') + ')');
    ok(re.elements >= 1 && b0.length === ed.placer().placements().length, 'the reopened model reads the same placements');

    // clipboard
    const mk = (id, ed_) => ed_.placer().placements().find((x) => x.id === id);
    const cpy = mk(copy.id, ed);
    const kept = { item: withVariant(plate, { variant: { id: 'large' } })[0], meta: { library: 'librarycraft', sha256: 'a'.repeat(64), sourceFile: '', variant: { id: 'large', name: 'Large', values: { width: 180, depth: 90, thick: 10 } } } };
    ok(C.libKey(cpy) === plate.uuid + '@1#large' && C.libKey({ uuid: plate.uuid, version: 1, variant: '' }) === plate.uuid + '@1', 'libKey: uuid@version#variant, and no # without a variant');
    const clip = C.placementClip(cpy, { model: 'm', file: f, item: kept.item, meta: kept.meta, box: C.boxFromItem(kept.item) });
    const store = memStore();
    C.writeClip(store, clip);
    const rd = C.readClip(store);
    ok(rd && rd.key === plate.uuid + '@1#large' && rd.meta.variant.id === 'large' && rd.meta.variant.values.width === 180 && rd.item && rd.item.name === 'Mounting plate — Large', 'a clip keeps the variant: key, meta.variant and the variant item survive write → read');
    const tampered = JSON.parse(store.getItem(C.CLIP_KEY)); tampered.meta.variant = { id: 'bad id!', name: 'x', values: {} };
    store.setItem(C.CLIP_KEY, JSON.stringify(tampered));
    ok(C.readClip(store) === null, 'a clip with a malformed variant id is refused');
  }
  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
