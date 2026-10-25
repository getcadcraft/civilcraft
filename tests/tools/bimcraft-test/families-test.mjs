/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --families [--only a,b]` (0.6 DC.114, session bim-families_PART_2): families on IFC types, in Node.
 * Sections (--only): copy (expr.js is PartCraft's), starters (the door / window recipes = doorParts / windowParts, box for box),
 * recipe (the untrusted reader and the evaluator: formulas, visibility, Booleans, refusals), doors (sizes as types in a new
 * building: the family's group, one type per size, retyping, undo), sizes (new / rename / remove, readFamilies counts),
 * edit (duplicate a family, add a transom with a visibility parameter and a Boolean, save: every element follows), place
 * (furniture families as mapped items, a Boolean-cut cabinet, visibility), solids (extrusions with arcs, revolve, sweep, drawn
 * by cc-ifc), files (.ccfamily.json out and in, a tampered file), x3 (an IFC2X3 file: IfcDoorStyle), guess (other programs'
 * types grouped), oracle (IfcOpenShell's schema check, web-ifc reads the families as ordinary types and groups).
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

export async function familiesMode({ APP, ROOT, WebIFC, IfcModel, quiet, args }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const oi = args.indexOf('--only'), only = oi >= 0 ? new Set(String(args[oi + 1] || '').split(',')) : null;
  const want = (k) => !only || only.has(k);
  const FM = await import(path.join(APP, 'family-model.js'));
  const FO = await import(path.join(APP, 'family-ops.js'));
  const FS = await import(path.join(APP, 'family-starters.js'));
  const O = await import(path.join(APP, 'model-openings.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const dec = (b) => new TextDecoder().decode(b).replace(/\\X2\\00D7\\X0\\/g, '×');   // the one non-ASCII character the size names use
  const count = (txt, re) => (txt.match(re) || []).length;
  const danglingRefs = (txt) => {
    const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((m) => m[1])), out = new Set();
    for (const line of txt.split('\n')) for (const m of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(m[1])) out.add('#' + m[1]);
    return [...out];
  };
  async function editorFor(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, levels: OPS.snapshotModel(ed).levels, w: () => { const w = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(w); return w; } };
  }
  const building = () => editorFor(new TextEncoder().encode(N.newBuilding({ name: 'Families', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'f.ifc', now: new Date('2026-10-18T12:00:00Z') })));
  /** cc-ifc's vertices of one element, in plan mm (x east, y north, z up). */
  async function meshOf(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null), m = await quiet((b) => eng.load(b))(bytes);
    const C = eng.api.GetCoordinationMatrix(m.modelID);
    const f = (id) => { const out = []; for (const b of m.batches) for (let i = 0; i < b.elems.ids.length; i++) if (b.elems.ids[i] === id) for (let v = b.elems.v0[i]; v < b.elems.v0[i] + b.elems.vn[i]; v++) out.push([(b.positions[v * 3] - C[12]) * 1000, -(b.positions[v * 3 + 2] - C[14]) * 1000, (b.positions[v * 3 + 1] - C[13]) * 1000]); return out; };
    f.notes = () => { try { const n = eng.api.notes?.(m.modelID); return n instanceof Map ? [...n.keys()].map(String) : Array.isArray(n) ? n.map(String) : []; } catch (e) { return []; } };
    return f;
  }
  const bbox = (V) => [0, 1, 2].map((j) => [Math.min(...V.map((q) => q[j])), Math.max(...V.map((q) => q[j]))]);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bc-fam-'));   // small IFC files for the outside readers (a few kB each)
  const saved = {};
  const IN = 25.4;

  // ============================================================================================ the formula engine copy
  if (want('copy')) {
    console.log('== expr.js is PartCraft\'s (tools/bimcraft-test/expr-sync.mjs)');
    ok(Buffer.compare(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/partcraft/dev/expr.js')), fs.readFileSync(path.join(APP, 'expr.js'))) === 0, 'bimcraft/dev/expr.js is byte for byte partcraft/dev/expr.js');
    let out = '';
    try { out = execFileSync('node', [path.join(ROOT, 'tools/bimcraft-test/expr-sync.mjs'), '--check'], { encoding: 'utf8' }); } catch (e) { out = 'FAILED ' + (e.stdout || ''); }
    ok(!/DIFFERS|FAILED/.test(out), 'expr-sync --check: the copy and its expr.* words are in step', out.trim().split('\n').slice(-1)[0]);
  }

  // ============================================================================================ starters = doorParts / windowParts
  if (want('starters')) {
    console.log('== the starter doors and windows as recipes (family-starters.js) draw what doorParts / windowParts draw');
    let cases = 0, diff = 0, first = '';
    for (const type of [...O.DOOR_TYPES, ...O.WINDOW_TYPES]) for (const face of ['left', 'right']) for (const [W, H] of [[type.width, type.height], [700, 2000], [2400, 1200]]) for (const t of [90, 140, 300]) {
      const op = { width: W, height: H, face, sill: 0 };
      const ref = type.kind === 'door' ? O.doorParts(type, op, t) : O.windowParts(type, op, t);
      const ev = FM.evaluateFamily(FM.readFamily(FS.starterRecipe(type.key)).family, { Width: W, Height: H }, { wallThickness: t, face: face === 'right' ? -1 : 1 });
      const got = ev.ok ? [...ev.solids.values()] : [];
      cases++;
      const same = got.length === ref.length && ref.every((p, i) => p.box.every((x, j) => x === got[i].box[j]) && p.style === got[i].style);
      if (!same) { diff++; if (!first) first = type.key + ' ' + face + ' ' + W + '×' + H + ' t ' + t; }
    }
    ok(cases === 324 && diff === 0, 'all 18 kinds × both faces × 3 sizes × 3 wall thicknesses: the same boxes, in the same order, the same colours (exact floats)', diff + ' differ, first ' + first);
    const all = FS.STARTER_KEYS.map((k) => FM.readFamily(FS.starterRecipe(k)));
    ok(all.length === 26 && all.every((r) => r.ok), '26 starter families (18 doors and windows, 3 furniture, 5 plumbing fixtures) pass the untrusted reader', JSON.stringify(all.find((r) => !r.ok)?.errors));
  }

  // ============================================================================================ the recipe reader and evaluator
  if (want('recipe')) {
    console.log('== recipes: the reader (untrusted) and the evaluator');
    const base = () => ({ format: 'cadcraft-family', version: 1, key: 'fam-test0001', name: 'Test', kind: 'generic', host: 'none', ifc: { class: 'IfcBuildingElementProxy' },
      params: [{ key: 'Width', kind: 'length', value: 1000 }, { key: 'Half', kind: 'length', value: 0, formula: 'Width / 2' }, { key: 'Quarter', kind: 'length', value: 0, formula: 'Half / 2' }, { key: 'Lid', kind: 'yesno', value: 1 }],
      solids: [{ id: 's1', op: 'box', x0: '-Half', y0: 0, z0: 0, x1: 'Half', y1: 'Quarter', z1: 500 }, { id: 's2', op: 'box', x0: '-Half', y0: 0, z0: 500, x1: 'Half', y1: 'Quarter', z1: 520, visible: 'Lid' },
        { id: 's3', op: 'box', x0: -100, y0: -1, z0: 100, x1: 100, y1: 300, z1: 300 }], booleans: [{ id: 'b1', op: 'difference', a: 's1', b: 's3' }] });
    let r = FM.readFamily(base());
    ok(r.ok, 'a small recipe reads', JSON.stringify(r.errors));
    let ev = FM.evaluateFamily(r.family, { Width: 2000 });
    ok(ev.ok && ev.values.Half === 1000 && ev.values.Quarter === 500 && ev.solids.get('s1').box[4] === 500, 'formulas in their order (Quarter needs Half needs Width): Width 2000 → Half 1000, Quarter 500');
    ok(ev.roots.length === 2 && ev.roots[0].kind === 'solid' && ev.roots[0].id === 's2' && ev.roots[1].kind === 'bool' && ev.roots[1].b.id === 's3', 'the Boolean is one root (the cut solid is not drawn alone), the lid another');
    ev = FM.evaluateFamily(r.family, { Width: 2000, Lid: 0 });
    ok(ev.ok && ev.roots.length === 1 && !ev.solids.get('s2').visible, 'Lid = No hides the lid (a visibility parameter)');
    const hid = base(); hid.solids[2].visible = 'Width > 5000';
    ev = FM.evaluateFamily(FM.readFamily(hid).family, {});
    ok(ev.ok && ev.roots.some((n) => n.kind === 'solid' && n.id === 's1'), 'a hidden second operand: the Boolean leaves its first operand as it is');
    const cyc = base(); cyc.params[1].formula = 'Quarter * 2';
    r = FM.readFamily(cyc); ev = r.ok ? FM.evaluateFamily(r.family, {}) : null;
    ok(r.ok && ev && !ev.ok && ev.error.key === 'fam.err.cycle', 'Half from Quarter from Half: refused (fam.err.cycle)');
    const refusals = [
      ['not a family', { format: 'x' }, 'fam.err.notfamily'], ['version 2', { ...base(), version: 2 }, 'fam.err.version'],
      ['an unknown name', { ...base(), solids: [{ id: 's1', op: 'box', x0: 0, y0: 0, z0: 0, x1: 'Nope', y1: 1, z1: 1 }], booleans: [] }, 'fam.err.unknown'],
      ['"constructor" as a name', { ...base(), solids: [{ id: 's1', op: 'box', x0: 0, y0: 0, z0: 0, x1: 'constructor', y1: 1, z1: 1 }], booleans: [] }, 'fam.err.unknown'],
      ['a parameter named sin', { ...base(), params: [{ key: 'sin', kind: 'length', value: 1 }] }, 'fam.err.param'],
      ['a Boolean of itself', { ...base(), booleans: [{ id: 'b1', op: 'difference', a: 's1', b: 's1' }] }, 'fam.err.boolean'],
      ['an operand used twice', { ...base(), booleans: [{ id: 'b1', op: 'difference', a: 's1', b: 's3' }, { id: 'b2', op: 'union', a: 's2', b: 's3' }] }, 'fam.err.boolean'],
      ['a Boolean naming a later one', { ...base(), booleans: [{ id: 'b1', op: 'difference', a: 'b2', b: 's3' }, { id: 'b2', op: 'union', a: 's1', b: 's2' }] }, 'fam.err.boolean'],
      ['eval() in a field', { ...base(), solids: [{ id: 's1', op: 'box', x0: 'eval(1)', y0: 0, z0: 0, x1: 1, y1: 1, z1: 1 }], booleans: [] }, 'fam.err.field'],
      ['a number of 1e9', { ...base(), solids: [{ id: 's1', op: 'box', x0: 1e9, y0: 0, z0: 0, x1: 1, y1: 1, z1: 1 }], booleans: [] }, 'fam.err.field'],
      ['201 solids', { ...base(), solids: Array.from({ length: 201 }, (_, i) => ({ id: 's' + i, op: 'box', x0: 0, y0: 0, z0: 0, x1: 1, y1: 1, z1: 1 })), booleans: [] }, 'fam.err.toomany'],
      ['a hosted family without Height', { ...base(), host: 'wall', kind: 'door', base: 'door-single', params: [{ key: 'Width', kind: 'length', value: 900 }] }, 'fam.err.needs'],
      ['a hosted window on a door base', { ...base(), host: 'wall', kind: 'window', base: 'door-single' }, 'fam.err.base'],
    ];
    for (const [what, obj, key] of refusals) { const q = FM.readFamily(obj); ok(!q.ok && q.errors.some((e) => e.key === key), 'refused: ' + what + ' (' + key + ')', JSON.stringify(q.errors.slice(0, 2))); }
    const name = FM.readFamily({ ...base(), name: 'A\u0000B\u001b  C', notes: 'x'.repeat(5000) });
    ok(name.ok && name.family.name === 'A B C' && name.family.notes.length === 2000, 'control characters out of names, notes cut at 2000');
    const flat = base(); flat.solids[0].x1 = '-Half';
    ok(FM.evaluateFamily(FM.readFamily(flat).family, {}).error?.key === 'fam.err.flat', 'a box with no width: fam.err.flat');
    const rev = { ...base(), solids: [{ id: 's1', op: 'revolve', plane: 'xz', at: 0, profile: [[-10, 0], [50, 0], [50, 100]], axis: [0, 0, 0, 1], angle: 360 }], booleans: [] };
    ok(FM.evaluateFamily(FM.readFamily(rev).family, {}).error?.key === 'fam.err.axis', 'a revolve whose profile crosses its axis: fam.err.axis');
    ok(FM.sizeKey(r.family || FM.readFamily(base()).family, { Width: 1000.0004, Lid: 1 }) === FM.sizeKey(FM.readFamily(base()).family, { Width: 1000 }), 'two sizes within 0.001 mm are the same size');
  }

  // ============================================================================================ doors: sizes as types
  let B = null;
  if (want('doors') || want('sizes') || want('edit') || want('oracle') || want('files')) {
    console.log('== doors and windows in a new building: their family and its sizes (IFC4, mm)');
    B = await building();
    const { ed, levels } = B, L1 = levels[0].guid;
    ed.modelChange(OPS.drawWalls({ storey: L1, segs: [{ a: [0, 0], b: [10000, 0] }, { a: [10000, 0], b: [10000, 6000] }], typeKey: 'ext-2x6', height: 3000 }));
    const walls = OPS.snapshotModel(ed).walls, w0 = walls[0].guid, w1 = walls[1].guid;
    ed.modelChange(OPS.placeOpening({ wall: w0, typeKey: 'door-single', offset: 500, width: 36 * IN, height: 80 * IN }));
    ed.modelChange(OPS.placeOpening({ wall: w0, typeKey: 'door-single', offset: 2500, width: 36 * IN, height: 80 * IN }));
    ed.modelChange(OPS.placeOpening({ wall: w0, typeKey: 'door-single', offset: 4500, width: 32 * IN, height: 80 * IN }));
    ed.modelChange(OPS.placeOpening({ wall: w1, typeKey: 'win-double-hung', offset: 1000, width: 36 * IN, height: 60 * IN, sill: 20 * IN }));
    let txt = dec(ed.save());
    ok(count(txt, /IFCGROUP\('[^']*',#\d+,'Single swing door',\$,'Family'\);/g) === 1 && count(txt, /IFCGROUP\('[^']*',#\d+,'Double hung window',\$,'Family'\);/g) === 1,
      'each family used is one IfcGroup (ObjectType "Family"): Single swing door, Double hung window', (txt.match(/IFCGROUP\([^;]*/g) || []).join(' | '));
    ok(count(txt, /IFCDOORTYPE\(/g) === 2 && /IFCDOORTYPE\('[^']*',#\d+,'Single swing door 914 × 2032',/.test(txt) && /IFCDOORTYPE\('[^']*',#\d+,'Single swing door 813 × 2032',/.test(txt) && /\.SINGLE_SWING_LEFT\.,\.F\.,\$\);/.test(txt),
      'two door sizes = two IfcDoorTypes ("Single swing door 914 × 2032", "… 813 × 2032"), SINGLE_SWING_LEFT', (txt.match(/IFCDOORTYPE\('[^']*',#\d+,'[^']*'/g) || []).join(' | '));
    ok(count(txt, /IFCRELASSIGNSTOGROUP\(/g) === 2 && count(txt, /'CadCraft_FamilySize'/g) === 3 && count(txt, /'CadCraft_Family'/g) === 2 && /'Recipe',\$,IFCTEXT\('\{"format":"cadcraft-family"/.test(txt),
      'one IfcRelAssignsToGroup per family; CadCraft_FamilySize on each of the 3 types; the recipe as JSON in CadCraft_Family');
    const ops0 = O.readOpenings(B.w());
    const t0 = ops0[0].typeId;
    ok(ops0[0].typeId === ops0[1].typeId && ops0[2].typeId !== t0 && ops0.every((o) => o.family === o.typeKey) && ops0[0].sizeName === '914 × 2032', 'the two 36" doors share one type; the 32" door has its own; each element knows its family and size');
    const sr = /IFCDOORTYPE\('[^']*',#\d+,'Single swing door 914 × 2032',\$,\$,\(#(\d+)\),\(#(\d+)\)/.exec(txt);
    ok(sr && /IFCSHAPEREPRESENTATION\(#\d+,'Body','SweptSolid',\(/.test(txt), 'a size\'s type carries its RepresentationMap (the solids at the nominal wall, 140 mm)');
    // a door changed to 32": it joins the 32" size; undo puts it back
    const n0 = ed.changes.length;
    ed.modelChange(OPS.changeOpening(ops0[1].guid, { width: 32 * IN }));
    let ops1 = O.readOpenings(B.w());
    ok(ops1.find((o) => o.guid === ops0[1].guid).typeId === ops0[2].typeId && ed.changes.length === n0 + 1, 'the second door at 32": typed by the 32" size now (one undo step)');
    ed.undo();
    ops1 = O.readOpenings(B.w());
    ok(ops1.find((o) => o.guid === ops0[1].guid).typeId === t0, 'undo: back to the 36" size');
    // the body is the starter's (as before families): leaves, frames, a 140 mm wall
    const mesh = await meshOf(ed.save());
    const bb = bbox(mesh(ops0[0].id));
    ok(near(bb[0][1] - bb[0][0], 36 * IN, 0.5) && near(bb[2][1] - bb[2][0], 80 * IN, 0.5), 'cc-ifc draws the door 36" × 80" (its frame and leaf from the recipe)', JSON.stringify(bb.map((q) => q.map(Math.round))));
    saved.doors = ed.save();
  }

  if (want('sizes') && B) {
    console.log('== sizes: new, rename, remove; the family list');
    const { ed } = B;
    let fams = FO.readFamilies(B.w());
    const single = fams.find((f) => f.key === 'door-single');
    ok(single && single.source === 'project' && single.sizes.length === 2 && single.count === 3 && single.sizes.map((s) => s.count).join(',') === '1,2', 'readFamilies: Single door, 2 sizes (813 used once, 914 twice), 3 placed', JSON.stringify(single?.sizes.map((s) => [s.name, s.count])));
    ed.modelChange(FO.newSize('door-single', { name: 'Wide', values: { Width: 42 * IN, Height: 84 * IN } }), { label: 'New size' });
    fams = FO.readFamilies(B.w());
    const wide = fams.find((f) => f.key === 'door-single').sizes.find((s) => s.name === 'Wide');
    ok(wide && wide.count === 0 && near(wide.values.Width, 42 * IN, 1e-9) && /IFCDOORTYPE\('[^']*',#\d+,'Single swing door Wide',/.test(dec(ed.save())), 'New size from this family: "Wide" (42" × 84"), a new IfcDoorType, nobody on it yet');
    let refused = null;
    try { ed.modelChange(FO.newSize('door-single', { name: 'Again', values: { Width: 42 * IN, Height: 84 * IN } })); } catch (e) { refused = e.key; }
    ok(refused === 'fam.err.samesize', 'the same values again: refused (fam.err.samesize)', refused);
    ed.modelChange(FO.renameSize(wide.guid, 'Wide entry'));
    ok(FO.readFamilies(B.w()).find((f) => f.key === 'door-single').sizes.some((s) => s.name === 'Wide entry') && /'Single swing door Wide entry'/.test(dec(ed.save())), 'renamed: the size and its type\'s name');
    refused = null;
    const used = FO.readFamilies(B.w()).find((f) => f.key === 'door-single').sizes.find((s) => s.count > 0);
    try { ed.modelChange(FO.removeSizes([used.guid])); } catch (e) { refused = e.key; }
    ok(refused === 'fam.err.inuse', 'removing a size doors use: refused (fam.err.inuse)');
    // a door changed to the Wide entry size (Properties' size list)
    const d0 = O.readOpenings(B.w())[0];
    ed.modelChange(FO.setFamilySize([d0.guid], wide.guid));
    const d1 = O.readOpenings(B.w()).find((o) => o.guid === d0.guid);
    ok(d1.typeId === wide.typeId && near(d1.width, 42 * IN, 1e-6) && near(d1.height, 84 * IN, 1e-6), 'a door set to "Wide entry": its type, 42" × 84"');
    ed.undo();
    ed.modelChange(FO.removeSizes([wide.guid]));
    const after = FO.readFamilies(B.w()).find((f) => f.key === 'door-single');
    ok(after.sizes.length === 2 && !/'Single swing door Wide entry'/.test(dec(ed.save())) && !danglingRefs(dec(ed.save())).length, 'an unused size removed: its type and maps gone, nothing dangling');
    ed.undo();
    ok(FO.readFamilies(B.w()).find((f) => f.key === 'door-single').sizes.length === 3, 'undo brings the size back');
  }

  if (want('edit') && B) {
    console.log('== editing a family: duplicate, a transom (visibility parameter), a vision panel (Boolean), save');
    const { ed } = B;
    ed.modelChange(FO.duplicateFamily('door-single', { name: 'Office door', key: 'fam-office01' }));
    let fam = FM.familyFor(B.w(), 'fam-office01');
    ok(fam && fam.name === 'Office door' && fam.base === 'door-single' && !fam.starter, 'Duplicate: "Office door", a family of this file on the single door\'s base');
    const nSingle = FO.readFamilies(B.w()).find((f) => f.key === 'door-single').sizes.length;
    ok(FO.readFamilies(B.w()).find((f) => f.key === 'fam-office01').sizes.length === nSingle, 'the copy has the same sizes (' + nSingle + ')');
    const doors = FO.openingFamilies(B.w(), 'door');
    ok(doors.length === 10 && doors.at(-1).key === 'fam-office01', 'the Door tool offers the 9 starter kinds, then Office door');
    // place one, then edit the recipe
    const w0 = OPS.snapshotModel(ed).walls[0].guid;
    ed.modelChange(OPS.placeOpening({ wall: w0, family: 'fam-office01', offset: 6500, width: 36 * IN, height: 80 * IN }));
    const off = O.readOpenings(B.w()).find((o) => o.family === 'fam-office01');
    ok(off && off.typeKey === 'door-single' && /IFCDOOR\('[^']*',#\d+,'Office door',/.test(dec(ed.save())), 'an Office door placed: its base is the single door (plan symbol, hand), its name the family\'s');
    const r = JSON.parse(JSON.stringify(fam));
    r.params.push({ key: 'Transom', kind: 'yesno', value: 0 }, { key: 'Vision', kind: 'yesno', value: 1 });
    const leaf = r.solids.find((s) => s.style === 'leaf');
    r.solids.push({ id: 'tr', name: 'Transom', op: 'box', x0: 'Frame', y0: '-3', z0: '(Height - 300)', x1: '(Width - Frame)', y1: '3', z1: '(Height - Frame)', style: 'glass', visible: 'Transom' });
    r.solids.push({ id: 'vp', name: 'Vision panel', op: 'box', x0: '(Width / 2 - 75)', y0: '(-WallThickness)', z0: '1200', x1: '(Width / 2 + 75)', y1: 'WallThickness', z1: '1800', style: 'glass', visible: 'Vision' });
    r.booleans.push({ id: 'cut1', op: 'difference', a: leaf.id, b: 'vp' });
    const n0 = ed.changes.length;
    ed.modelChange(FO.saveFamily(r), { label: 'Office door' });
    const txt = dec(ed.save());
    fam = FM.familyFor(B.w(), 'fam-office01');
    ok(ed.changes.length === n0 + 1 && fam.booleans.length === 1 && fam.params.some((p) => p.key === 'Transom'), 'saved as one undo step; the recipe in the file has the Boolean and the new parameters');
    ok(/IFCBOOLEANRESULT\(\.DIFFERENCE\.,#\d+,#\d+\)/.test(txt) && /IFCCSGSOLID\(#\d+\)/.test(txt) && /'Body','SolidModel'/.test(txt), 'the leaf cut by the vision panel: IfcBooleanResult DIFFERENCE in an IfcCsgSolid, the Body a \'SolidModel\' (no faces)');
    const mesh = await meshOf(ed.save());
    const V = mesh(off.id);
    const inPanel = V.filter((p) => p[2] > 1250 && p[2] < 1750 && Math.abs(p[1] - (-0) ) < 400);
    ok(V.length > 0 && mesh.notes().every((n) => !/boolean/i.test(n)), 'cc-ifc draws the cut door (no boolean left uncut)', JSON.stringify(mesh.notes().slice(0, 3)));
    void inPanel;
    // the transom on: a new size with Transom = Yes
    ed.modelChange(FO.newSize('fam-office01', { name: '914 × 2032 with transom', values: { Width: 36 * IN, Height: 80 * IN, Transom: 1 } }));
    const sz = FO.readFamilies(B.w()).find((f) => f.key === 'fam-office01').sizes.find((s) => /transom/.test(s.name));
    ed.modelChange(FO.setFamilySize([off.guid], sz.guid));
    const off2 = O.readOpenings(B.w()).find((o) => o.guid === off.guid);
    ok(off2.typeId === sz.typeId && off2.values.Transom === 1, 'that door on the transom size: its values say Transom = Yes');
    const t2 = dec(ed.save());
    const bodyCount = (id) => { const m = new RegExp('^#' + id + '=IFCDOOR\\([^;]*,#(\\d+),#(\\d+),', 'm').exec(t2); return m; };
    ok(!!bodyCount(off.id), 'it is still an IfcDoor with its own placement and shape');
    // a recipe that cannot draw one of the sizes: refused, naming the size
    const r2 = JSON.parse(JSON.stringify(fam)); r2.solids[0].x1 = '(Width - Width)';
    let refused = null;
    try { ed.modelChange(FO.saveFamily(r2)); } catch (e) { refused = e; }
    ok(refused?.key === 'fam.err.atsize', 'a recipe some size cannot draw (a frame of no width): refused, naming the size', refused?.fill?.size);
    ed.undo(); ed.undo();
    ok(O.readOpenings(B.w()).find((o) => o.guid === off.guid).typeId !== sz.typeId, 'undo twice: the door back on its first size, the transom size gone');
    saved.edit = ed.save();
  }

  // ============================================================================================ furniture: mapped items
  if (want('place') || want('oracle')) {
    console.log('== furniture families placed on a floor (IfcMappedItem of the size\'s maps)');
    const P = await building();
    const { ed, levels } = P, L1 = levels[0].guid;
    ed.modelChange(FO.placeFamily({ storey: L1, family: 'fam-table', x: 2000, y: 1000, rot: 30 }), { label: 'Table' });
    ed.modelChange(FO.placeFamily({ storey: L1, family: 'fam-table', x: 5000, y: 1000 }), { label: 'Table' });
    ed.modelChange(FO.placeFamily({ storey: L1, family: 'fam-cabinet', x: 0, y: 4000 }), { label: 'Cabinet' });
    ed.modelChange(FO.placeFamily({ storey: L1, family: 'fam-cabinet', values: { Door: 0 }, x: 1000, y: 4000 }), { label: 'Cabinet' });
    let txt = dec(ed.save());
    ok(count(txt, /IFCFURNITURE\(/g) === 4 && count(txt, /IFCFURNITURETYPE\(/g) === 3 && count(txt, /IFCMAPPEDITEM\(/g) >= 4 && /\.TABLE\.\);/.test(txt), 'four IfcFurniture: two tables on one IfcFurnitureType (TABLE), two cabinets on two (door / no door); every shape an IfcMappedItem');
    const els = FO.readFamilyElements(P.w());
    ok(els.length === 4 && near(els[0].x, 2000, 1e-6) && near(els[0].rot, 30, 1e-6), 'placed elements read back: where, turned 30°');
    const mesh = await meshOf(ed.save());
    const tb = bbox(mesh(els[1].id));
    ok(near(tb[0][1] - tb[0][0], 1500, 0.5) && near(tb[1][1] - tb[1][0], 900, 0.5) && near(tb[2][1], 750, 0.5), 'cc-ifc draws the table 1500 × 900, 750 high', JSON.stringify(tb.map((q) => q.map(Math.round))));
    const c1 = bbox(mesh(els[2].id)), c2 = bbox(mesh(els[3].id));
    ok(near(c1[1][0], 4000 - 18, 0.5) && near(c2[1][0], 4000, 0.5), 'the cabinet with its door reaches 18 mm in front; with Door = No it does not (a visibility parameter)', c1[1][0] + ' / ' + c2[1][0]);
    ok(/IFCBOOLEANRESULT\(\.DIFFERENCE\.,#\d+,#\d+\)/.test(txt) && mesh.notes().every((n) => !/boolean/i.test(n)), 'the cabinet\'s recess and toe kick are Booleans, cut by cc-ifc');
    ed.modelChange(FO.moveFamilyElement(els[1].guid, { x: 6000, rot: 90 }));
    const m2 = FO.readFamilyElements(P.w()).find((e) => e.guid === els[1].guid);
    ok(near(m2.x, 6000, 1e-6) && near(m2.rot, 90, 1e-6), 'moved and turned (one undo step)');
    // edit the table: the apron off by default → both tables follow (their maps are made again in place)
    const tf = JSON.parse(JSON.stringify(FM.familyFor(P.w(), 'fam-table')));
    tf.params.find((p) => p.key === 'Height').value = 720;
    ed.modelChange(FO.saveFamily(tf));
    const mesh2 = await meshOf(ed.save());
    ok(near(bbox(mesh2(els[0].id))[2][1], 750, 0.5), 'a saved default does not change a size that exists (its values are kept)');
    const sz = FO.readFamilies(P.w()).find((f) => f.key === 'fam-table').sizes[0];
    ed.modelChange(FO.newSize('fam-table', { name: 'Low', values: { ...sz.values, Height: 450 } }));
    const low = FO.readFamilies(P.w()).find((f) => f.key === 'fam-table').sizes.find((s) => s.name === 'Low');
    ed.modelChange(FO.setFamilySize([els[0].guid, els[1].guid], low.guid));
    const mesh3 = await meshOf(ed.save());
    ok(near(bbox(mesh3(els[0].id))[2][1], 450, 0.5) && near(bbox(mesh3(els[1].id))[2][1], 450, 0.5), 'both tables set to the "Low" size: 450 high');
    ed.modelChange(FO.removeFamilyElements([els[3].guid]));
    ok(FO.readFamilyElements(P.w()).length === 3 && !danglingRefs(dec(ed.save())).length, 'a cabinet deleted; nothing dangling');
    saved.place = ed.save();
  }

  // ============================================================================================ extrusions, revolves, sweeps
  if (want('solids') || want('oracle')) {
    console.log('== a family from nothing: extrusion with arcs, revolve, sweep');
    const P = await building();
    const { ed, levels } = P;
    ed.modelChange(FO.newFamily({ name: 'Planter', kind: 'generic', key: 'fam-planter1' }));
    const f = JSON.parse(JSON.stringify(FM.familyFor(P.w(), 'fam-planter1')));
    f.params.push({ key: 'R', kind: 'length', value: 300 });
    f.solids = [
      { id: 'e1', name: 'Base', op: 'extrude', plane: 'xy', at: 0, profile: [['-R', 0, 1], ['R', 0, 1]], depth: 50, style: 'stone' },
      { id: 'r1', name: 'Pot', op: 'revolve', plane: 'xz', at: 0, profile: [[0, 50], ['R', 50], ['R', 400], ['R - 20', 400], ['R - 20', 70], [0, 70]], axis: [0, 0, 0, 1], angle: 360, style: 'stone' },
      { id: 'w1', name: 'Rail', op: 'sweep', path: [['-R', '-R - 100', 0], ['-R', '-R - 100', 800], ['R', '-R - 100', 800]], radius: 15, style: 'metal' },
    ];
    ed.modelChange(FO.saveFamily(f));
    ed.modelChange(FO.placeFamily({ storey: levels[0].guid, family: 'fam-planter1', x: 0, y: 0 }));
    const txt = dec(ed.save());
    ok(/IFCINDEXEDPOLYCURVE\(#\d+,\(IFCARCINDEX\(\(1,2,3\)\),IFCARCINDEX\(\(3,4,1\)\)\),\.F\.\)/.test(txt) && /IFCREVOLVEDAREASOLID\(/.test(txt) && /IFCSWEPTDISKSOLID\(#\d+,15\.,\$,\$,\$\)/.test(txt) && /'Body','AdvancedSweptSolid'/.test(txt),
      'IFC4: the disc an IfcIndexedPolyCurve of two IfcArcIndex segments, the pot an IfcRevolvedAreaSolid, the rail an IfcSweptDiskSolid (\'AdvancedSweptSolid\')', (txt.match(/IFCINDEXEDPOLYCURVE\([^;]*/) || [''])[0]);
    const e = FO.readFamilyElements(P.w())[0];
    const mesh = await meshOf(ed.save()), bb = bbox(mesh(e.id));
    ok(near(bb[0][0], -315, 1) && near(bb[0][1], 300, 1) && near(bb[1][0], -415, 1) && near(bb[2][1], 815, 1), 'cc-ifc draws all three: x −315 (the rail) to 300 (the disc), y from −415, up to 815', JSON.stringify(bb.map((q) => q.map(Math.round))));
    saved.solids = ed.save();
  }

  // ============================================================================================ family files
  if (want('files') && B) {
    console.log('== family files (.ccfamily.json)');
    const file = FO.familyFile(B.w(), 'fam-office01') || FO.familyFile(B.w(), 'door-single');
    ok(file && file.format === 'cadcraft-family' && file.sizes.length >= 2 && !('starter' in file), 'a family as a file: recipe + its sizes');
    const P = await building();
    P.ed.modelChange(FO.importFamily(JSON.parse(JSON.stringify(file))));
    const got = FO.readFamilies(P.w()).find((f) => f.name === file.name);
    ok(got && got.sizes.length === file.sizes.length, 'opened into another model: the family and its ' + file.sizes.length + ' sizes');
    P.ed.modelChange(FO.importFamily(JSON.parse(JSON.stringify(file))));
    const two = FO.readFamilies(P.w()).filter((f) => f.name === file.name);
    ok(two.length === 2 && two[0].key !== two[1].key, 'opened twice: the second gets its own key (no clash)');
    let refused = null;
    try { P.ed.modelChange(FO.importFamily({ ...file, solids: [{ id: 'x', op: 'box', x0: 'process.exit(1)', y0: 0, z0: 0, x1: 1, y1: 1, z1: 1 }] })); } catch (e) { refused = e.key; }
    ok(refused === 'fam.err.field' || refused === 'fam.err.unknown', 'a tampered file is refused, nothing written', refused);
  }

  // ============================================================================================ the editor's logic (family-edit.js)
  if (want('editor') || want('oracle')) {
    console.log('== the family editor (family-edit.js): parameters, solids, Booleans, profiles, handles; a family drawn from nothing');
    const FE = await import(path.join(APP, 'family-edit.js'));
    const table = FM.readFamily(FS.starterRecipe('fam-table')).family;
    // parameters
    let r = FE.addParam(table, { key: 'Overhang', kind: 'length', value: 40 });
    ok(r.ok && r.fam.params.at(-1).key === 'Overhang' && table.params.length === 6, 'a parameter added (the recipe passed in is left as it was)');
    const bad = [['sin', 'fam.err.param'], ['Width', 'fam.err.param'], ['WallThickness', 'fam.err.param'], ['2x', 'fam.err.param']].map(([k, key]) => FE.addParam(table, { key }).error?.key === key);
    ok(bad.every(Boolean), 'refused names: a function (sin), one already there, a name the wall gives, one starting with a digit', JSON.stringify(bad));
    r = FE.renameParam(table, 'Leg', 'LegSize');
    ok(r.ok && r.fam.solids[1].x1 === '(-Width / 2 + 25 + LegSize)' && !FE.usesOf(r.fam, 'Leg').length && FE.usesOf(r.fam, 'LegSize').length === 12, 'renamed: every expression that named it follows (Leg → LegSize)', r.fam?.solids[1].x1);
    r = FE.removeParam(table, 'Leg');
    ok(!r.ok && r.error.key === 'fam.err.paramused' && /Leg/.test(r.error.fill.where), 'removing a parameter still used: refused, saying where', r.error?.fill?.where);
    r = FE.removeParam(FE.addParam(table, { key: 'Spare' }).fam, 'Spare');
    ok(r.ok && !r.fam.params.some((p) => p.key === 'Spare'), 'an unused parameter removed');
    r = FE.setParam(table, 'Leg', { formula: 'Width / 30' });
    let ev = r.ok ? FM.evaluateFamily(r.fam, { Width: 1500 }) : null;
    ok(r.ok && ev.ok && ev.values.Leg === 50 && !FM.inputParams(r.fam).some((p) => p.key === 'Leg'), 'a formula (expr.js): Leg = Width / 30 → 50 at 1500, and Leg is driven now');
    r = FE.setParam(FE.setParam(table, 'Top', { formula: 'Leg / 2' }).fam, 'Leg', { formula: 'Top * 2' });
    ok(!r.ok && r.error.key === 'fam.err.cycle', 'a formula that depends on itself: refused at once (fam.err.cycle)', r.error?.key);
    r = FE.setParam(table, 'Leg', { formula: 'Nope + 1' });
    ok(!r.ok && r.error.key === 'fam.err.unknown', 'a formula naming an unknown parameter: refused');
    const door = FM.readFamily(FS.starterRecipe('door-single')).family;
    ok(FE.setParam(door, 'Width', { formula: 'Height / 2' }).error?.key === 'fam.err.needs' && FE.renameParam(door, 'Height', 'H').error?.key === 'fam.err.needs', 'a door keeps a typed Width and Height (no formula, no rename)');
    // solids
    let f = table;
    const ids = [];
    for (const op of ['box', 'extrude', 'revolve', 'sweep']) { r = FE.addSolid(f, op); ok(r.ok, 'a ' + op + ' added, with numbers that draw', JSON.stringify(r.error)); f = r.fam; ids.push(r.id); }
    ev = FM.evaluateFamily(f, {});
    ok(ev.ok && ids.every((id) => ev.solids.get(id)), 'every new solid evaluates (box, extrusion, revolve, sweep)', JSON.stringify(ev.error));
    r = FE.setSolid(f, ids[0], { x1: 'Width / 3', visible: 'Apron', name: 'Panel', style: 'metal' });
    ok(r.ok && r.fam.solids.find((s) => s.id === ids[0]).visible === 'Apron' && r.fam.solids.find((s) => s.id === ids[0]).style === 'metal', 'a solid\'s field, colour and "shown when" (a visibility parameter) set');
    ok(FE.setSolid(f, ids[0], { x1: 'process.exit(1)' }).error?.key === 'fam.err.unknown' && FE.setSolid(f, ids[0], { x1: '' }).error?.key === 'fam.err.field', 'a field that does not read is refused, naming it');
    r = FE.duplicateSolid(f, ids[0]);
    ok(r.ok && r.fam.solids.length === f.solids.length + 1 && r.fam.solids.find((s) => s.id === r.id).x1 === f.solids.find((s) => s.id === ids[0]).x1, 'a solid duplicated (its fields too)');
    // Booleans
    r = FE.addBoolean(f, { op: 'difference', a: 's1', b: ids[0] });
    ok(r.ok && FE.operands(r.fam).includes(r.id) && !FE.operands(r.fam).includes('s1'), 'a Boolean added; it is an operand now and its two are not');
    let g = r.fam;
    r = FE.addBoolean(g, { op: 'union', a: r.id, b: ids[1] });
    ok(r.ok && r.fam.booleans.length === 2, 'a Boolean of a Boolean (a cut, then a join)');
    g = r.fam;
    ok(FE.addBoolean(g, { a: 's1', b: 's2' }).error?.key === 'fam.err.nooperand', 'an operand another Boolean uses: refused');
    r = FE.removeSolid(g, ids[0]);
    ok(r.ok && r.fam.booleans.length === 0, 'removing a solid takes its Boolean, and the one built on it, along');
    r = FE.setBoolean(g, g.booleans[0].id, { op: 'union' });
    ok(r.ok && r.fam.booleans[0].op === 'union', 'a Boolean changed from cut to join');
    ok(FE.removeBoolean(g, g.booleans[0].id).fam.booleans.length === 0, 'removing the first Boolean also removes the one built on it');
    // profiles and paths
    const ex = ids[1];
    r = FE.insertPoint(f, ex, 1, [250, 100]);
    ok(r.ok && FE.pointsOf(r.fam.solids.find((s) => s.id === ex)).length === 5, 'a point added after point 2');
    r = FE.movePoint(r.fam, ex, 2, [260, 120]);
    ok(r.ok && FE.pointsOf(r.fam.solids.find((s) => s.id === ex))[2].join() === '260,120', 'a point moved (typed numbers)');
    r = FE.setBulge(r.fam, ex, 0, FE.cycleArc(0));
    const prof = FE.pointsOf(r.fam.solids.find((s) => s.id === ex));
    ok(r.ok && near(prof[0][2], Math.tan(Math.PI / 8), 1e-9) && FE.cycleArc(FE.cycleArc(0)) < 0 && FE.cycleArc(FE.cycleArc(FE.cycleArc(0))) === 0, 'a segment made a quarter arc (straight → arc left → arc right → straight)');
    const ex2 = r.fam;
    r = FE.removePoint(ex2, ex, 1); r = FE.removePoint(r.fam, ex, 1);
    ok(r.ok && FE.removePoint(r.fam, ex, 0).error?.key === 'fam.err.points', 'points removed down to three, then refused');
    const bound = FE.setSolid(f, ex, { profile: [['0', '0'], ['Width', '0'], ['Width', '200'], ['0', '200']] }).fam;
    ok(FE.movePoint(bound, ex, 1, [10, 10]).error?.key === 'fam.err.bound', 'a point set by a parameter cannot be dragged (fam.err.bound)');
    // handles
    const hs = FE.sizeHandles(table, {}, {});
    ok(hs.length === 3 && hs.map((h) => h.label).join() === 'Width,Depth,Height' && hs.map((h) => h.target.axis).join() === '0,1,2' && near(hs[0].p[0], 750) && near(hs[2].p[2], 750), 'size handles: Width on +x at 750, Depth on +y, Height on +z at 750', JSON.stringify(hs.map((h) => [h.label, h.p.map(Math.round)])));
    r = FE.dragHandle(table, {}, hs[0], 1000, {});
    ok(r.ok && r.values.Width === 2000 && r.fam === table, 'dragging Width\'s handle to x = 1000 makes the size 2000 wide (the recipe unchanged)');
    const sh = FE.solidHandles(table, {}, 's1', {});
    ok(sh.length === 6 && sh.every((h) => h.target.kind === 'field'), 'a box\'s six face handles');
    r = FE.dragHandle(table, {}, sh.find((h) => h.target.field === 'z1'), 800, {});
    ok(r.ok && r.values.Height === 800, 'the top\'s upper face dragged to 800: Height (the parameter it uses) becomes 800');
    const lit = FE.setSolid(table, 's6', { z0: '600' }).fam;
    r = FE.dragHandle(lit, {}, FE.solidHandles(lit, {}, 's6', {}).find((h) => h.target.field === 'z0'), 620, {});
    ok(r.ok && r.fam.solids.find((s) => s.id === 's6').z0 === '620', 'a face on a typed number: the number changes');
    const leafTop = FE.solidHandles(door, {}, 's4', {}).find((h) => h.target.field === 'z1');
    r = FE.dragHandle(door, {}, leafTop, 2200, {});
    ok(r.ok && near(r.values.Height, 2200 + 3 + 38.1, 1e-6), 'a door leaf\'s top (Height − Frame − 3) dragged to 2200: solved through the formulas, Height 2241.1', JSON.stringify(r.values));
    // a family from nothing, every piece the editor offers, saved into a model and read by cc-ifc
    const P = await building();
    P.ed.modelChange(FO.newFamily({ name: 'Bench', kind: 'furniture', key: 'fam-bench001' }));
    let b = FM.familyFor(P.w(), 'fam-bench001');
    const step = (x) => { if (!x.ok) throw new Error(JSON.stringify(x.error)); b = x.fam; return x; };
    step(FE.addParam(b, { key: 'Back', kind: 'yesno', value: 1 }));
    step(FE.addParam(b, { key: 'Seat', kind: 'length', value: 0 }));
    step(FE.setParam(b, 'Seat', { formula: 'Height / 2' }));
    step(FE.setSolid(b, 's1', { z0: 'Seat - 40', z1: 'Seat', name: 'Seat' }));
    const legId = step(FE.addSolid(b, 'extrude')).id;
    step(FE.setSolid(b, legId, { plane: 'xz', at: '(Depth / 2)', depth: '(Depth / 2 - 20)', profile: [['(-Width / 2 + 20)', '0'], ['(-Width / 2 + 80)', '0', 0.5], ['(-Width / 2 + 80)', '(Seat - 40)'], ['(-Width / 2 + 20)', '(Seat - 40)']], name: 'Leg' }));
    const backId = step(FE.addSolid(b, 'box')).id;
    step(FE.setSolid(b, backId, { x0: '(-Width / 2)', x1: '(Width / 2)', y0: '(Depth - 30)', y1: 'Depth', z0: 'Seat', z1: 'Height', visible: 'Back', name: 'Back' }));
    const knobId = step(FE.addSolid(b, 'revolve')).id;
    step(FE.setSolid(b, knobId, { plane: 'xz', at: '0', profile: [['0', 'Height'], ['30', 'Height'], ['20', '(Height + 40)'], ['0', '(Height + 40)']], axis: ['0', '0', '0', '1'], angle: '360', name: 'Knob' }));
    const railId = step(FE.addSolid(b, 'sweep')).id;
    step(FE.setSolid(b, railId, { path: [['(-Width / 2)', '(Depth + 20)', '(Seat + 100)'], ['(Width / 2)', '(Depth + 20)', '(Seat + 100)']], radius: '12', name: 'Rail' }));
    const slotId = step(FE.addSolid(b, 'box')).id;
    step(FE.setSolid(b, slotId, { x0: '-100', x1: '100', y0: '(Depth - 40)', y1: '(Depth + 10)', z0: '(Height - 120)', z1: '(Height - 60)', name: 'Slot' }));
    step(FE.addBoolean(b, { op: 'difference', a: backId, b: slotId }));
    P.ed.modelChange(FO.saveFamily(b), { label: 'Bench' });
    P.ed.modelChange(FO.placeFamily({ storey: P.levels[0].guid, family: 'fam-bench001', x: 0, y: 0 }));
    P.ed.modelChange(FO.newSize('fam-bench001', { name: 'No back', values: { ...FM.sizeValues(b, {}), Back: 0 } }));
    const txt = dec(P.ed.save());
    ok(/IFCEXTRUDEDAREASOLID\(/.test(txt) && /IFCARCINDEX\(/.test(txt) && /IFCREVOLVEDAREASOLID\(/.test(txt) && /IFCSWEPTDISKSOLID\(/.test(txt) && /IFCBOOLEANRESULT\(\.DIFFERENCE\./.test(txt) && !/IFCTRIANGULATEDFACESET|IFCFACETEDBREP/.test(txt),
      'the bench written as IFC solids (extrusion with an arc, revolve, sweep, a Boolean cut), never a list of faces (DC.115)');
    const el0 = FO.readFamilyElements(P.w())[0];
    const mesh = await meshOf(P.ed.save()), bb = bbox(mesh(el0.id));
    ok(near(bb[2][1], 940, 1) && near(bb[0][0], -300, 1) && near(bb[0][1], 300, 1) && mesh.notes().every((n) => !/boolean/i.test(n)), 'cc-ifc draws the bench: 600 wide, the knob on top at 940, the slot cut', JSON.stringify(bb.map((q) => q.map(Math.round))));
    const sizes = FO.readFamilies(P.w()).find((x) => x.key === 'fam-bench001').sizes;
    ok(sizes.length === 2 && sizes.some((z) => z.name === 'No back' && z.values.Back === 0), 'a second size with Back = No (the visibility parameter as a size)');
    saved.editor = P.ed.save();
  }

  // ============================================================================================ an IFC library (Save as IFC) and reading it back
  if (want('library') || want('oracle')) {
    console.log('== a family as an IFC file (IfcProjectLibrary + IfcRelDeclares), read back');
    const { familyScratch } = await import(path.join(APP, 'family-ifc.js'));
    const s = await quiet(familyScratch)(WebIFC, IfcModel);
    const P = await building();
    P.ed.modelChange(FO.duplicateFamily('fam-shelf', { name: 'Book shelf', key: 'fam-books001' }));
    P.ed.modelChange(FO.newSize('fam-books001', { name: 'Tall', values: { ...FM.sizeValues(FM.familyFor(P.w(), 'fam-books001'), {}), Height: 2200 } }));
    const file = FO.familyFile(P.w(), 'fam-books001');
    const bytes = await s.library(file);
    const txt = dec(bytes);
    ok(/IFCPROJECTLIBRARY\(/.test(txt) && count(txt, /IFCRELDECLARES\(/g) >= 2 && /IFCGROUP\('[^']*',#\d+,'Book shelf',\$,'Family'\)/.test(txt) && count(txt, /IFCFURNITURETYPE\(/g) === 2,
      'Save as IFC: an IfcProjectLibrary declares the family\'s group and its 2 size types (IFC4)');
    const back = await s.familiesIn(bytes);
    ok(back.length === 1 && back[0].name === 'Book shelf' && back[0].sizes.length === 2 && back[0].sizes.some((z) => z.name === 'Tall' && z.values.Height === 2200), 'read back from the IFC file: the family and both sizes');
    const Q = await building();
    Q.ed.modelChange(FO.importFamilies([...back, FO.familyFile(P.w(), 'fam-table')], { keys: ['fam-books002', 'fam-table002'] }));
    ok(FO.readFamilies(Q.w()).filter((x) => x.source === 'project').length === 2 && Q.ed.changes.length === 1, 'two families opened into another model in one undo step');
    Q.ed.undo();
    ok(FO.readFamilies(Q.w()).filter((x) => x.source === 'project').length === 0, 'undo takes both out');
    const pv = await s.preview(FM.familyFor(P.w(), 'door-single'), { Width: 1000, Height: 2100 }, { wallThickness: 200 });
    ok(pv.model && !pv.error && /IFCDOOR\(/.test(dec(pv.bytes)), 'the editor\'s preview: the family written in a wall by the model\'s own code, read back by cc-ifc');
    s.close();
    saved.library = bytes;
  }

  // ============================================================================================ IFC2X3
  if (want('x3') || want('oracle')) {
    console.log('== an IFC2X3 file: door and window styles');
    const F = await editorFor(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', 'ios-steel-ifc2x3.ifc')));
    F.ed.modelChange(OPS.drawWalls({ storey: F.levels[0].guid, segs: [{ a: [0, 0], b: [8000, 0] }], typeKey: 'ext-2x6', height: 3000 }));
    const wg = OPS.snapshotModel(F.ed).walls[0].guid;
    F.ed.modelChange(OPS.placeOpening({ wall: wg, typeKey: 'door-double', offset: 1000 }));
    F.ed.modelChange(OPS.placeOpening({ wall: wg, typeKey: 'win-slider', offset: 4000, sill: 900 }));
    F.ed.modelChange(FO.placeFamily({ storey: F.levels[0].guid, family: 'fam-cabinet', x: 0, y: 3000 }));
    const txt = dec(F.ed.save());
    ok(/IFCDOORSTYLE\('[^']*',#\d+,'Double swing door 1524 × 2032',\$,\$,\([^)]*\),\(#\d+\),\$,\.DOUBLE_DOOR_SINGLE_SWING\.,\.NOTDEFINED\.,\.F\.,\.F\.\)/.test(txt) && /IFCWINDOWSTYLE\([^;]*\.NOTDEFINED\.,\.DOUBLE_PANEL_VERTICAL\.,\.F\.,\.F\.\)/.test(txt),
      'IFC2X3: the door typed by an IfcDoorStyle, the window by an IfcWindowStyle (none were written before families)', (txt.match(/IFCDOORSTYLE\([^;]*/) || [''])[0].slice(0, 200));
    ok(/IFCFURNISHINGELEMENT\(/.test(txt) && /IFCFURNITURETYPE\('[^']*',#\d+,'Base cabinet [^']*',\$,\$,\([^)]*\),\([^)]*\),\$,'Base cabinet',\.NOTDEFINED\.\)/.test(txt) && !danglingRefs(txt).length, 'IFC2X3 furniture: an IfcFurnishingElement typed by an IfcFurnitureType; nothing dangling');
    saved.x3 = F.ed.save();
  }

  // ============================================================================================ other programs' types
  if (want('guess')) {
    console.log('== other programs\' types, grouped by a guess');
    const clinic = path.join(path.dirname(ROOT), 'testfiles/ifc-corpus/community/IFC 2.3.0.1 (IFC 2x3)/Medical-Dental Clinic/Clinic_Architectural.ifc');
    if (!fs.existsSync(clinic)) console.log('  --   the clinic file (testfiles, outside git) is not here: skipped');
    else {
      const F = await editorFor(fs.readFileSync(clinic));
      const fams = FO.readFamilies(F.w()).filter((f) => f.source === 'guess');
      const tp = fams.find((f) => f.name === 'M_Toilet Partition');
      ok(fams.length > 5 && tp && tp.how === 'occurrence' && tp.sizes.length >= 1 && !tp.editable, 'the Revit export\'s types grouped by their elements\' names: "M_Toilet Partition" (' + (tp?.sizes.length || 0) + ' sizes), ' + fams.length + ' families in all; never editable', fams.slice(0, 6).map((f) => f.name + ':' + f.sizes.length).join(', '));
      const doors = fams.filter((f) => f.kind === 'door');
      ok(doors.length >= 2 && doors.every((f) => f.sizes.every((z) => z.count > 0)), 'door families from its IfcDoorStyles, each size with the number placed', doors.map((f) => f.name + ' ' + f.sizes.length).join(', '));
    }
    const ac = path.join(path.dirname(ROOT), 'testfiles/ifc-corpus/archicad/AC18-Schependomlaan-IFC2X3.ifc');
    if (fs.existsSync(ac)) {
      const F = await editorFor(fs.readFileSync(ac));
      const fams = FO.readFamilies(F.w()).filter((f) => f.source === 'guess');
      ok(fams.length > 0 && fams.some((f) => f.how === 'numbers'), 'the Archicad export: types grouped by names that differ only in numbers (' + fams.length + ' families)');
    }
  }

  // ============================================================================================ outside readers
  if (want('oracle')) {
    console.log('== outside readers');
    const files = Object.entries(saved).map(([k, b]) => { const p = path.join(tmp, k + '.ifc'); fs.writeFileSync(p, b); return p; });
    const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
    if (!py) console.log('  --   no venv with ifcopenshell: IfcOpenShell checks skipped');
    else {
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), ...files], { encoding: 'utf8', maxBuffer: 1 << 24 }); } catch (e) { out = String(e.stdout || ''); }
      const rows = out.trim().split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
      ok(rows.length === files.length && rows.every((r) => r.errors === 0), 'IfcOpenShell: ' + files.length + ' files (' + Object.keys(saved).join(', ') + ') valid against their schemas', JSON.stringify(rows.filter((r) => r.errors).map((r) => [path.basename(r.file), r.first.slice(0, 2)])));
    }
    try {
      const Wi = (await import('node:module')).createRequire(path.join(ROOT, 'tools/bimcraft-test/package.json'))('web-ifc');
      const api = new Wi.IfcAPI();
      api.SetWasmPath(path.join(ROOT, 'tools/bimcraft-test/node_modules/web-ifc/'), true);
      await api.Init();
      const read = (b) => { const m = api.OpenModel(new Uint8Array(b)); const n = (c) => api.GetLineIDsWithType(m, c).size(); const r = { doorTypes: n(Wi.IFCDOORTYPE), groups: n(Wi.IFCGROUP), assigns: n(Wi.IFCRELASSIGNSTOGROUP), furn: n(Wi.IFCFURNITURE), csg: n(Wi.IFCCSGSOLID) }; api.CloseModel(m); return r; };
      const a = saved.edit ? read(saved.edit) : null, b = saved.place ? read(saved.place) : null;
      ok((!a || (a.doorTypes >= 4 && a.groups >= 3 && a.assigns >= 3 && a.csg >= 1)) && (!b || (b.furn === 3 && b.groups === 2)), 'web-ifc (oracle) reads the families as ordinary types and groups: door types, IfcGroup, IfcRelAssignsToGroup, IfcCsgSolid', JSON.stringify({ a, b }));
    } catch (e) { console.log('  --   web-ifc not installed: oracle check skipped (' + e.message + ')'); }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('\n' + good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
