/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --fammore [--only typed,symbol,hotspots,arrays,detail,nested,csv]` (0.7 BIM-FAM-MORE, session bim-07): families that work
 * like parametric objects in other BIM programs — typed parameters, a 2D symbol of their own, hotspots, arrays, detail levels, nested families, sizes from
 * a table. Known-answer tests on the recipe model (family-model.js, family-edit.js, family-ops.js) and the IFC it writes, IFC2X3 and IFC4.
 */
import path from 'node:path';

export async function famMoreMode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const FM = await import(path.join(APP, 'family-model.js'));
  const FE = await import(path.join(APP, 'family-edit.js'));
  const FO = await import(path.join(APP, 'family-ops.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const oi = args.indexOf('--only'), only = oi >= 0 ? new Set(String(args[oi + 1] || '').split(',')) : null;
  const want = (k) => !only || only.has(k);
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const building = async () => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(N.newBuilding({ name: 'More', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-10-23T12:00:00Z') })));
    const ed = new IfcEditor(WebIFC, eng);
    const w = () => { const x = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(x); return x; };
    return { ed, w, level: OPS.snapshotModel(ed).levels[0].guid };
  };
  const block = (extra = {}) => ({ format: 'cadcraft-family', version: 1, key: 'fam-more1', name: 'More', kind: 'furniture', host: 'none', base: '', ifc: { class: 'IfcFurniture' },
    params: [{ key: 'Width', kind: 'length', value: 600 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 800 }],
    solids: [{ id: 's1', name: 'Block', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'solid' }], booleans: [], ...extra });
  const building2 = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((x) => eng.load(x))(bytes); const ed = new IfcEditor(WebIFC, eng); return { ed, w: () => { const x = new ModelWriter(WebIFC, ed.api, ed.mid); FO.familyWriter(x); return x; } }; };
  const read = (f) => FM.readFamily(f);
  const open2 = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); return quiet((x) => eng.load(x))(bytes); };

  // ============================================================================================ 1. typed parameters
  if (want('typed')) {
    console.log('== 1. typed parameters: integer, yes / no, text, material, fill, pen');
    const f = block();
    f.params.push({ key: 'Count', kind: 'integer', value: 2.6 }, { key: 'Pen', kind: 'pen', value: 99 }, { key: 'PenLow', kind: 'pen', value: 0 }, { key: 'Label', kind: 'text', value: 'Shelf\u0001 ' + 'x'.repeat(200) },
      { key: 'Mat', kind: 'material', value: 'material-brick' }, { key: 'BadMat', kind: 'material', value: '../x' }, { key: 'Hatch', kind: 'fill', value: 'concrete' }, { key: 'BadHatch', kind: 'fill', value: 'wavy' },
      { key: 'Lit', kind: 'yesno', value: 5 }, { key: 'Fx', kind: 'text', value: 'hi', formula: 'Width' });
    const r = read(f);
    ok(r.ok, 'the typed recipe reads', r.errors?.map((e) => e.key).join());
    const P = (k) => r.family.params.find((p) => p.key === k);
    ok(P('Count').value === 3 && P('Pen').value === 16 && P('PenLow').value === 1 && P('Lit').value === 1, 'integer 2.6 → 3; pen 99 → 16, pen 0 → 1; yes / no 5 → 1');
    ok(P('Label').value.length === 120 && !/\u0001/.test(P('Label').value), 'text is cleaned of control characters and cut to 120');
    ok(P('Mat').value === 'material-brick' && P('BadMat').value === '' && P('Hatch').value === 'concrete' && P('BadHatch').value === 'none', 'material keeps a library id, drops a path; fill keeps a plan fill, a stranger becomes none');
    ok(P('Fx').formula === undefined, 'a word parameter has no formula (words are not computed)');
    const sv = FM.sizeValues(r.family, { Count: 4.4, Label: 'Left', Hatch: 'diagonal', Width: 700 });
    ok(sv.Count === 4 && sv.Label === 'Left' && sv.Hatch === 'diagonal' && sv.Width === 700 && sv.Mat === 'material-brick', 'a size keeps each value in its kind, the defaults for what is not given');
    ok(FM.sizeKey(r.family, { Label: 'A' }) !== FM.sizeKey(r.family, { Label: 'B' }) && FM.sizeKey(r.family, { Label: 'A' }) === FM.sizeKey(r.family, { Label: 'A', Width: 600.0004 }), 'two sizes that differ only by a word are two sizes; 0.0004 mm is no difference');
    const ev = FM.evaluateFamily(r.family, { Label: 'Left' });
    ok(ev.ok && ev.texts.Label === 'Left' && ev.texts.Mat === 'material-brick' && !('Label' in ev.values) && ev.values.Count === 3, 'evaluating: the words beside the numbers, never inside them');
    const g = JSON.parse(JSON.stringify(f)); g.solids[0].x1 = 'Label';
    ok(!read(g).ok && read(g).errors[0].key === 'fam.err.unknown', 'an expression naming a text parameter is refused');
    const h = JSON.parse(JSON.stringify(f)); h.params = h.params.filter((p) => p.key !== 'Fx'); h.solids[0].material = 'Mat';
    ok(read(h).ok && FM.evaluateFamily(read(h).family, {}).solids.get('s1').material === 'material-brick', 'a solid names a material parameter and gets the material it holds');
    const m = JSON.parse(JSON.stringify(h)); m.solids[0].material = 'a b';
    ok(!read(m).ok, 'a solid\'s material field is a name or a library id, nothing else');
    // edit: addParam / setParam / setSolid, kinds switch
    let e = FE.addParam(block(), { key: 'Note', kind: 'text', value: 'hello' });
    ok(e.ok && e.fam.params.at(-1).value === 'hello', 'addParam: a text parameter');
    e = FE.setParam(e.fam, 'Note', { value: 'bye' });
    ok(e.ok && e.fam.params.at(-1).value === 'bye', 'setParam: its value');
    const e2 = FE.setParam(FE.addParam(block(), { key: 'Len', kind: 'length', value: 100 }).fam, 'Len', { kind: 'text' });
    ok(e2.ok && e2.fam.params.at(-1).value === '' && e2.fam.params.at(-1).kind === 'text', 'a number made a text starts empty');
    const used = block(); used.solids[0].z1 = 'Height';
    const e3 = FE.setParam(used, 'Height', { kind: 'text' });
    ok(!e3.ok && e3.error.key === 'fam.err.paramused', 'a parameter an expression uses cannot become a word');
    ok(FE.setSolid(block(), 's1', { material: 'material-brick' }).fam.solids[0].material === 'material-brick' && !FE.setSolid(block(), 's1', { material: '../..' }).ok, 'setSolid: material by id; a bad one refused');
    // the IFC: a solid in a project material's colour
    const { ed, w, level } = await building();
    const fam = block({ params: [...block().params, { key: 'Skin', kind: 'material', value: 'material-brick' }, { key: 'Tag', kind: 'text', value: 'A-1' }] });
    fam.solids[0].material = 'Skin';
    ed.modelChange(FO.importFamily(fam));
    const placed = ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', values: { Skin: 'material-concrete', Tag: 'B-2' }, x: 1000, y: 1000 }));
    const txt = new TextDecoder().decode(ed.save());
    ok(/IFCSURFACESTYLE\('Family: Concrete #b0ada5'/.test(txt), 'IFC: the solid is styled with the colour of the project material it holds ("Family: Concrete #b0ada5")');
    const els = FO.readFamilyElements(w());
    ok(els.length === 1 && els[0].values.Skin === 'material-concrete' && els[0].values.Tag === 'B-2', 'the placed element keeps its size\'s words (' + JSON.stringify(els[0]?.values) + ')');
    ok(!!placed.id, 'placed');
    ed.undo();
  }

  // ============================================================================================ 2. its own 2D symbol
  if (want('symbol')) {
    console.log('== 2. a 2D symbol of its own: parts, the cut-plane rule, the file\'s FootPrint');
    const SY = await import(path.join(APP, 'family-symbol.js'));
    const sym = { mode: 'symbol', parts: [
      { id: 'y1', kind: 'rect', x0: '(-Width / 2)', y0: '0', x1: '(Width / 2)', y1: 'Depth', fill: 'none', pen: '4' },
      { id: 'y2', kind: 'line', x0: '(-Width / 2)', y0: '0', x1: '(Width / 2)', y1: 'Depth' },
      { id: 'y3', kind: 'circle', cx: '0', cy: '(Depth / 2)', r: '50', fill: 'solid' },
      { id: 'y4', kind: 'arc', cx: '0', cy: '0', r: '100', a0: '0', a1: '90' },
      { id: 'y5', kind: 'poly', pts: [['0', '0'], ['100', '0'], ['0', '100']], closed: true, fill: 'Hatch' },
      { id: 'y6', kind: 'text', x: '0', y: '0', h: '60', text: 'No. {Tag}, {Width} wide' },
      { id: 'y7', kind: 'line', x0: '0', y0: '0', x1: '0', y1: '10', zmin: '1500', zmax: '2000' },
      { id: 'y8', kind: 'line', x0: '0', y0: '0', x1: '10', y1: '0', visible: 'Show', pen: 'Pen' }] };
    const f = block({ symbol: sym });
    f.params.push({ key: 'Tag', kind: 'text', value: 'A7' }, { key: 'Hatch', kind: 'fill', value: 'diagonal' }, { key: 'Show', kind: 'yesno', value: 0 }, { key: 'Pen', kind: 'pen', value: 9 });
    const r = read(f);
    ok(r.ok && r.family.symbol.parts.length === 8 && r.family.symbol.mode === 'symbol', 'a symbol with eight parts reads', r.errors?.map((e) => e.key + JSON.stringify(e.fill)).join());
    const ev = FM.evaluateFamily(r.family, {});
    ok(ev.ok && ev.symbol.length === 7, 'evaluated: the part hidden by its Yes / No (Show = 0) is left out (' + ev.symbol.length + ' of 8)');
    const byId = (id) => ev.symbol.find((x) => x.id === id);
    ok(byId('y1').pen === 4 && byId('y2').pen === 3 && byId('y5').fill === 'diagonal' && byId('y3').fill === 'solid' && byId('y1').fill === 'none', 'pens (4; default 3) and fills (a key; a Fill parameter\'s value)');
    ok(byId('y6').text === 'No. A7, 600 wide', 'text takes parameter values: "' + byId('y6').text + '"');
    const ev2 = FM.evaluateFamily(r.family, { Show: 1, Pen: 99, Width: 800, Hatch: 'earth' });
    ok(ev2.symbol.length === 8 && ev2.symbol.find((x) => x.id === 'y8').pen === 16 && ev2.symbol.find((x) => x.id === 'y5').fill === 'earth' && ev2.symbol.find((x) => x.id === 'y1').x1 === 400, 'another size: Show = 1 brings it, pen 99 → 16, the fill follows its parameter, the rectangle widens (x1 = 400)');
    // geometry
    const G = SY.symbolGeometry(ev.symbol, 1200);
    const ring = G.find((i) => i.kind === 'ring' && i.fill === 'none');
    ok(ring.pts.length === 4 && ring.pts[0][0] === -300 && ring.pts[2][0] === 300 && ring.pts[2][1] === 400, 'a rectangle is a ring of four corners');
    ok(G.find((i) => i.fill === 'solid').pts.length === 48, 'a circle is 48 chords');
    const arc = G.find((i) => i.kind === 'line' && i.pts.length > 2);
    ok(arc.pts.length === 13 && near(arc.pts[0][0], 100) && near(arc.pts[12][1], 100), 'a quarter arc: 12 steps of 7.5°, from (100, 0) to (0, 100)');
    ok(G.find((i) => i.kind === 'text').text.startsWith('No. A7'), 'the text item');
    const rule = (cut) => SY.symbolGeometry(ev.symbol, cut).filter((i) => i.pts && i.pts.length === 2 && i.pts[1][1] === 10)[0].rule;
    ok(rule(1200) === 'above' && rule(1700) === 'cut' && rule(2400) === 'below' && rule(null) === 'cut', 'the cut-plane rule: a part from 1500 to 2000 is overhead (dashed) at a cut of 1200, cut at 1700, below (thin) at 2400');
    ok(SY.symbolCurves(ev.symbol).length === 6, 'the file keeps six curves (the text is left out)');
    // the plan's scene items for a placed element
    {
      const sc = SY.symbolScene(ev.symbol, { x: 1000, y: 1000, rot: 90 }, 1200, 4242, (r, pat) => (pat === 'diagonal' ? [0, 0, 1, 1] : []));
      const first = sc[0], pens = sc.map((q) => q.lw);
      ok(sc.length === 2 && new Set(pens).size === 2 && sc.every((q) => q.key === 4242), 'the scene: one item per pen (pen 4 for the rectangle, the default 3 for the rest → ' + sc.length + '), all under the element\'s key');
      const xs = first.poly.map((p) => p[0]), ys = first.poly.map((p) => p[1]);
      ok(first.poly && near(Math.min(...xs), 600) && near(Math.max(...xs), 1000) && near(Math.min(...ys), 700) && near(Math.max(...ys), 1300), 'turned 90° at (1000, 1000): its extent is x 600…1000, y 700…1300 (a click inside picks the element)');
      ok(sc.some((q) => q.dashed.length === 1) && sc.some((q) => q.solid.length === 1) && sc.some((q) => q.texts.length === 1 && q.texts[0].text.startsWith('No.') && q.texts[0].rot === 90) && sc.some((q) => q.thin.length >= 1), 'overhead part dashed, the solid circle filled, the text turned with the element, a hatched triangle as strokes');
      ok(SY.symbolScene([], { x: 0, y: 0 }, 1200, 1).length === 0, 'no parts, no items');
    }
    // untrusted
    const hostile = JSON.parse(JSON.stringify(f));
    hostile.symbol.parts[0].x0 = 'Nope';
    ok(!read(hostile).ok && read(hostile).errors[0].key === 'fam.err.unknown', 'an expression naming an unknown parameter in a part is refused');
    const dup = JSON.parse(JSON.stringify(f)); dup.symbol.parts[1].id = 'y1';
    ok(!read(dup).ok, 'two parts with one id: refused');
    const big = JSON.parse(JSON.stringify(f)); big.symbol.parts = Array.from({ length: 201 }, (_, i) => ({ id: 'p' + i, kind: 'line', x0: '0', y0: '0', x1: '1', y1: '1' }));
    ok(!read(big).ok, '201 parts: refused');
    const word = JSON.parse(JSON.stringify(f)); word.symbol.parts[0].pen = 'Tag';
    ok(!read(word).ok, 'a pen expression naming a text parameter: refused');
    const wall = JSON.parse(JSON.stringify(f)); wall.host = 'wall'; wall.kind = 'door'; wall.base = 'door-single'; wall.params.push({ key: 'Height2', kind: 'length', value: 1 });
    ok(!read(wall).family?.symbol, 'a hosted family (a door) keeps its starter\'s plan symbol: the recipe\'s symbol is not kept');
    // editing
    let e = FE.addSymbolPart(block(), 'rect');
    ok(e.ok && e.fam.symbol.parts.length === 1 && e.id === 'y1' && e.fam.symbol.mode === 'symbol', 'addSymbolPart: a rectangle over the footprint');
    for (const k of ['line', 'circle', 'arc', 'poly', 'text']) e = FE.addSymbolPart(e.fam, k);
    ok(e.ok && e.fam.symbol.parts.length === 6 && FM.evaluateFamily(e.fam, {}).ok, 'one of each kind, all evaluating');
    e = FE.setSymbolPart(e.fam, 'y1', { x1: 'Width', pen: '5', fill: 'diagonal' });
    ok(e.ok && e.fam.symbol.parts[0].x1 === 'Width' && e.fam.symbol.parts[0].pen === '5' && e.fam.symbol.parts[0].fill === 'diagonal', 'setSymbolPart');
    ok(!FE.setSymbolPart(e.fam, 'y1', { x1: 'Nope' }).ok && !FE.setSymbolPart(e.fam, 'y1', { bogus: '1' }).ok, 'an unknown name or an unknown field: refused');
    e = FE.setSymbolPart(e.fam, 'y1', { pen: '' });
    ok(e.ok && e.fam.symbol.parts[0].pen === undefined, 'an empty pen goes back to the default');
    const ren = FE.renameParam(e.fam, 'Width', 'Wide');
    ok(ren.ok && ren.fam.symbol.parts[0].x1 === 'Wide' && FM.evaluateFamily(ren.fam, {}).ok, 'renaming a parameter follows into the symbol');
    ok(!FE.removeParam(e.fam, 'Width').ok && FE.removeParam(e.fam, 'Width').error.key === 'fam.err.paramused', 'a parameter only the symbol uses cannot be deleted');
    const tx = FE.renameParam(FE.addParam(FE.addSymbolPart(block(), 'text').fam, { key: 'Tag', kind: 'text', value: 'x' }).fam, 'Tag', 'Mark');
    ok(tx.ok, 'a text part\'s {Name} follows a rename');
    const dd = FE.duplicateSymbolPart(e.fam, 'y1');
    ok(dd.ok && dd.fam.symbol.parts.length === 7 && dd.id === 'y7', 'duplicate');
    const rm = FE.removeSymbolPart(FE.addSymbolPart(block(), 'rect').fam, 'y1');
    ok(rm.ok && !rm.fam.symbol, 'removing the last part removes the symbol');
    ok(FE.setSymbolMode(e.fam, 'cut').fam.symbol.mode === 'cut', 'mode: cut keeps the plan cutting the solids');
    ok(FE.moveSymbolPoint(FE.addSymbolPart(block(), 'poly').fam, 'y1', 0, [10, 20]).fam.symbol.parts[0].pts[0][0] === '10', 'a poly point moves');
    // the IFC: FootPrint from the symbol
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(block({ symbol: { mode: 'symbol', parts: [sym.parts[0], sym.parts[2], sym.parts[3]] } })));
    ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', x: 1000, y: 1000 }));
    const txt = new TextDecoder().decode(ed.save());
    const fpReps = [...txt.matchAll(/IFCSHAPEREPRESENTATION\(#\d+,'FootPrint','GeometricCurveSet',\(([^)]*)\)\)/g)];
    const curveSets = [...txt.matchAll(/IFCGEOMETRICCURVESET\(\(([^)]*)\)\)/g)];
    ok(fpReps.length >= 1 && curveSets.some((m) => m[1].split(',').length === 3), 'IFC: the type\'s FootPrint is a curve set of the symbol\'s three shapes (a rectangle, a circle, an arc)');
    ed.undo();
  }

  // ============================================================================================ 4. arrays
  if (want('arrays')) {
    console.log('== 4. arrays: count and spacing as parameters');
    const shelf = block({ params: [{ key: 'Width', kind: 'length', value: 600 }, { key: 'Depth', kind: 'length', value: 300 }, { key: 'Height', kind: 'length', value: 1000 }, { key: 'Shelves', kind: 'integer', value: 4 }, { key: 'Gap', kind: 'length', value: 250 }],
      solids: [{ id: 's1', name: 'Board', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: '18', style: 'wood', array: { count: 'Shelves', dx: '0', dy: '0', dz: 'Gap' } }] });
    const r = read(shelf);
    ok(r.ok, 'a shelf of boards in an array reads', r.errors?.map((e) => e.key).join());
    const ev = FM.evaluateFamily(r.family, {});
    const boxes = [...ev.solids.values()];
    ok(ev.ok && boxes.length === 4 && boxes.map((b) => b.box[2]).join() === '0,250,500,750' && boxes[3].box[5] === 768 && boxes.every((b) => b.box[0] === -300), 'four boards, 250 apart: z = 0, 250, 500, 750 (the last up to 768)');
    ok(ev.instances.get('s1').join() === 's1,s1~1,s1~2,s1~3' && ev.roots.length === 4, 'each is a solid of its own in the file (four roots)');
    const ev2 = FM.evaluateFamily(r.family, { Shelves: 7.4, Gap: 100 });
    ok([...ev2.solids.values()].length === 7 && [...ev2.solids.values()].at(-1).box[2] === 600, 'seven boards at a Gap of 100 (7.4 is an integer parameter: 7)');
    ok(FM.evaluateFamily(r.family, { Shelves: 0 }).error?.key === 'fam.err.arraycount' && FM.evaluateFamily(r.family, { Shelves: 201 }).error?.key === 'fam.err.arraycount', 'a count of 0 or of 201: refused, "count must be 1 to 200"');
    const many = JSON.parse(JSON.stringify(shelf)); many.solids.push({ ...many.solids[0], id: 's2' }, { ...many.solids[0], id: 's3' }, { ...many.solids[0], id: 's4' }, { ...many.solids[0], id: 's5' }, { ...many.solids[0], id: 's6' });
    ok(FM.evaluateFamily(read(many).family, { Shelves: 200 }).error?.key === 'fam.err.toomany', 'six arrays of 200: more than the ' + FM.LIMITS.instances + ' solids a family may make: refused');
    const hid = JSON.parse(JSON.stringify(shelf)); hid.params.push({ key: 'On', kind: 'yesno', value: 0 }); hid.solids[0].visible = 'On';
    ok(FM.evaluateFamily(read(hid).family, {}).roots.length === 0 || [...FM.evaluateFamily(read(hid).family, {}).solids.values()].every((b) => !b.visible), 'a hidden board hides all its copies');
    // the other ops
    const mk = (s1) => FM.evaluateFamily(read(block({ solids: [{ id: 's1', ...s1, style: 'solid', array: { count: '3', dx: '100', dy: '10', dz: '1000' } }] })).family, {}).solids;
    const ex = mk({ op: 'extrude', plane: 'xy', at: '0', profile: [['0', '0'], ['50', '0'], ['50', '50'], ['0', '50']], depth: '200' });
    ok([...ex.values()].map((e) => e.at).join() === '0,1000,2000' && [...ex.values()][2].profile[0].slice(0, 2).join() === '200,20', 'an extrusion on xy: the profile moves by (dx, dy), `at` by dz');
    const xz = mk({ op: 'extrude', plane: 'xz', at: '0', profile: [['0', '0'], ['50', '0'], ['50', '50'], ['0', '50']], depth: '200' });
    ok([...xz.values()].map((e) => e.at).join() === '0,10,20' && [...xz.values()][2].profile[0].slice(0, 2).join() === '200,2000', 'on xz: u = x moves by dx, v = z by dz, the normal (y) by dy');
    const yz = mk({ op: 'extrude', plane: 'yz', at: '0', profile: [['0', '0'], ['50', '0'], ['50', '50'], ['0', '50']], depth: '200' });
    ok([...yz.values()].map((e) => e.at).join() === '0,100,200' && [...yz.values()][2].profile[0].slice(0, 2).join() === '20,2000', 'on yz: u = y by dy, v = z by dz, the normal (x) by dx');
    const rv = mk({ op: 'revolve', plane: 'xz', at: '0', profile: [['10', '0'], ['50', '0'], ['50', '50'], ['10', '50']], axis: ['0', '0', '0', '1'], angle: '360' });
    ok([...rv.values()][1].axis.join() === '100,1000,100,1001', 'a revolve: its axis moves with it');
    const sw = mk({ op: 'sweep', path: [['0', '0', '0'], ['0', '0', '300']], radius: '10' });
    ok([...sw.values()][2].path[1].join() === '200,20,2300', 'a sweep: every path point moves by (2dx, 2dy, 2dz)');
    // as a Boolean operand: a row of holes
    const holes = block({ solids: [{ id: 's1', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'solid' },
      { id: 's2', op: 'box', x0: '-250', y0: '-1', z0: '100', x1: '-200', y1: '(Depth + 1)', z1: '150', style: 'solid', array: { count: '6', dx: '100', dy: '0', dz: '0' } }], booleans: [{ id: 'b1', op: 'difference', a: 's1', b: 's2' }] });
    const evh = FM.evaluateFamily(read(holes).family, {});
    ok(evh.ok && evh.roots.length === 1 && evh.roots[0].kind === 'bool' && evh.roots[0].b.kind === 'bool' && evh.roots[0].b.op === 'union', 'six holes as the second operand of a difference: one root, the holes joined (union) and cut');
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(holes));
    ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', x: 1000, y: 1000 }));
    const txt = new TextDecoder().decode(ed.save());
    ok((txt.match(/IFCBOOLEANRESULT\(\.UNION\./g) || []).length >= 5 && (txt.match(/IFCBOOLEANRESULT\(\.DIFFERENCE\./g) || []).length >= 1 && /IFCCSGSOLID/.test(txt), 'IFC: five unions and the difference as IFC\'s own Boolean results in an IfcCsgSolid');
    const m = await open2(ed.save());
    ok(m.elements >= 1, 'cc-ifc reads the cut block back (' + m.elements + ' element)');
    ed.undo();
    // the shelf as a family: two sizes
    const b2 = await building();
    b2.ed.modelChange(FO.importFamily(shelf));
    b2.ed.modelChange(FO.placeFamily({ storey: b2.level, family: 'fam-more1', values: { Shelves: 2 }, x: 0, y: 0 }));
    b2.ed.modelChange(FO.placeFamily({ storey: b2.level, family: 'fam-more1', values: { Shelves: 5 }, x: 2000, y: 0 }));
    const t2 = new TextDecoder().decode(b2.ed.save());
    ok((t2.match(/IFCEXTRUDEDAREASOLID\(/g) || []).length === 11, 'IFC: the default size (4 boards), a 2-board size and a 5-board size: eleven extruded boards in all (' + (t2.match(/IFCEXTRUDEDAREASOLID\(/g) || []).length + ')');
    // editing
    let e = FE.setSolidArray(FE.addSolid(FE.addParam(block(), { key: 'N', kind: 'integer', value: 3 }).fam, 'box').fam, 's2', { count: 'N', dx: 0, dy: 0, dz: 'Width' });
    ok(e.ok && e.fam.solids[1].array.count === 'N' && e.fam.solids[1].array.dz === 'Width', 'setSolidArray');
    ok(!FE.setSolidArray(block(), 's1', { count: 'Nope' }).ok && !FE.setSolidArray(block(), 's1', { count: '' }).ok, 'an unknown name or an empty count: refused');
    ok(FE.setSolidArray(e.fam, 's2', { count: '500', dz: '10' }).error?.key === 'fam.err.arraycount', 'a count over 200 is refused at once, naming the limit');
    ok(!FE.setSolidArray(e.fam, 's2', null).fam.solids[1].array, 'null puts it back to one solid');
    const rn = FE.renameParam(e.fam, 'N', 'Boards');
    ok(rn.ok && rn.fam.solids[1].array.count === 'Boards', 'renaming follows into the array');
    ok(FE.removeParam(e.fam, 'N').error?.key === 'fam.err.paramused', 'a parameter an array uses cannot be deleted');
    // symbol parts
    const sy = block({ symbol: { mode: 'symbol', parts: [{ id: 'y1', kind: 'circle', cx: '0', cy: '50', r: '20', array: { count: '3', dx: '100', dy: '0' } }] } });
    const evs = FM.evaluateFamily(read(sy).family, {});
    ok(evs.ok && evs.symbol.length === 3 && evs.symbol.map((p) => p.cx).join() === '0,100,200', 'a symbol part in an array: three circles 100 apart');
  }

  // ============================================================================================ 5. detail levels
  if (want('detail')) {
    console.log('== 5. detail levels: coarse, medium, fine, and by scale');
    const door = block({ solids: [
      { id: 's1', name: 'Body', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'solid' },
      { id: 's2', name: 'Panel', op: 'box', x0: '(-Width / 2 + 20)', y0: '-5', z0: '100', x1: '(Width / 2 - 20)', y1: '0', z1: '(Height - 100)', style: 'wood', detail: 'medium' },
      { id: 's3', name: 'Handle', op: 'box', x0: '200', y0: '-30', z0: '400', x1: '230', y1: '-5', z1: '450', style: 'metal', detail: 'fine' }],
      symbol: { mode: 'symbol', parts: [{ id: 'y1', kind: 'rect', x0: '(-Width / 2)', y0: '0', x1: '(Width / 2)', y1: 'Depth' }, { id: 'y2', kind: 'line', x0: '0', y0: '0', x1: '0', y1: 'Depth', detail: 'medium' }, { id: 'y3', kind: 'circle', cx: '0', cy: '0', r: '10', detail: 'fine' }] } });
    const r = read(door);
    ok(r.ok && r.family.solids[0].detail === undefined && r.family.solids[1].detail === 'medium' && r.family.solids[2].detail === 'fine' && r.family.symbol.parts[2].detail === 'fine', 'detail reads: none (every level), medium, fine; "coarse" is the same as none');
    const shown = (d) => [...FM.evaluateFamily(r.family, {}, { detail: d }).solids.values()].filter((x) => x.visible).map((x) => x.id).join();
    ok(shown('coarse') === 's1' && shown('medium') === 's1,s2' && shown('fine') === 's1,s2,s3' && shown(undefined) === 's1,s2,s3' && shown('auto') === 's1,s2,s3' && shown(1) === 's1,s2', 'solids by level: coarse s1; medium s1, s2; fine (and the default, and auto) all three');
    const parts = (d) => FM.evaluateFamily(r.family, {}, { detail: d }).symbol.map((x) => x.id).join();
    ok(parts('coarse') === 'y1' && parts('medium') === 'y1,y2' && parts('fine') === 'y1,y2,y3', 'symbol parts by level the same way');
    ok(FM.detailForScale('auto', 0) === 'fine' && FM.detailForScale('auto', 50) === 'fine' && FM.detailForScale('auto', 100) === 'medium' && FM.detailForScale('auto', 200) === 'coarse' && FM.detailForScale('auto', 500) === 'coarse' && FM.detailForScale('medium', 500) === 'medium', 'by scale: 1:50 fine, 1:100 medium, 1:200 and smaller coarse; a fixed level ignores scale');
    // editing
    let e = FE.setSolid(block(), 's1', { detail: 'fine' });
    ok(e.ok && e.fam.solids[0].detail === 'fine' && FE.setSolid(e.fam, 's1', { detail: 'coarse' }).fam.solids[0].detail === undefined, 'setSolid: detail fine; coarse removes it');
    e = FE.setSymbolPart(FE.addSymbolPart(block(), 'rect').fam, 'y1', { detail: 'medium' });
    ok(e.ok && e.fam.symbol.parts[0].detail === 'medium', 'setSymbolPart: detail');
    // the project's level: saved solids follow
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(door));
    ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', x: 1000, y: 1000 }));
    const solids = () => (new TextDecoder().decode(ed.save()).match(/IFCEXTRUDEDAREASOLID\(/g) || []).length;
    ok(FM.familyDetail(w()) === 'auto' && solids() === 3, 'new file: detail auto, three solids saved');
    ed.modelChange(FO.setFamilyDetail('coarse'));
    ok(FM.familyDetail(w()) === 'coarse' && solids() === 1, 'coarse: one solid saved (the body), the placed element made again');
    ed.modelChange(FO.setFamilyDetail('medium'));
    ok(solids() === 2, 'medium: two solids');
    ed.undo();
    ok(solids() === 1 && FM.familyDetail(w()) === 'coarse', 'one Undo goes back to coarse');
    ed.redo(); ed.modelChange(FO.setFamilyDetail('fine'));
    ok(solids() === 3, 'fine: all three');
    let bad1 = ''; try { ed.modelChange(FO.setFamilyDetail('huge')); } catch (x) { bad1 = x.key; }
    ok(bad1 === 'fam.err.detail', 'an unknown level is refused');
    ed.modelChange(FO.setFamilyDetail('coarse'));
    const again = await building2(ed.save());
    ok(FM.familyDetail(again.w()) === 'coarse', 'the level is in the file: saved and reopened it is still coarse');
  }

  // ============================================================================================ 6. nested families
  if (want('nested')) {
    console.log('== 6. a family inside another');
    const leg = block({ key: 'fam-leg1', name: 'Leg', params: [{ key: 'Height', kind: 'length', value: 700 }, { key: 'Size', kind: 'length', value: 50 }, { key: 'Skin', kind: 'material', value: '' }],
      solids: [{ id: 's1', op: 'box', x0: '0', y0: '0', z0: '0', x1: 'Size', y1: 'Size', z1: 'Height', style: 'wood', material: 'Skin' }] });
    const table = block({ key: 'fam-tabl1', name: 'Table', params: [{ key: 'Width', kind: 'length', value: 1200 }, { key: 'Depth', kind: 'length', value: 600 }, { key: 'Height', kind: 'length', value: 740 }, { key: 'Top', kind: 'length', value: 40 }, { key: 'Wood', kind: 'material', value: 'material-brick' }, { key: 'Legs', kind: 'yesno', value: 1 }],
      solids: [{ id: 's1', name: 'Top', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '(Height - Top)', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'wood' }],
      parts: [{ id: 'p1', family: 'fam-leg1', at: ['(-Width / 2)', '0', '0'], values: { Height: 'Height - Top', Skin: 'Wood' }, visible: 'Legs' },
        { id: 'p2', family: 'fam-leg1', at: ['(Width / 2 - 50)', '0', '0'], values: { Height: 'Height - Top', Size: '60' } },
        { id: 'p3', family: 'fam-leg1', at: ['0', '(Depth - 50)', '0'], rot: '90', values: { Height: 'Height - Top' } }] });
    const lib = { 'fam-leg1': FM.readFamily(leg).family, 'fam-tabl1': FM.readFamily(table).family };
    const ctx = (extra = {}) => ({ resolve: (k) => lib[k] || null, ...extra });
    const rt = read(table);
    ok(rt.ok && rt.family.parts.length === 3 && rt.family.parts[2].rot === '90' && rt.family.parts[1].values.Size === '60', 'a table holding three legs reads', rt.errors?.map((e) => e.key).join());
    const ev = FM.evaluateFamily(rt.family, {}, ctx());
    ok(ev.ok && [...ev.solids.keys()].join() === 's1,p1/s1,p2/s1,p3/s1' && ev.roots.length === 4, 'evaluated: the top and three legs, each a solid of its own (' + [...ev.solids.keys()].join() + ')');
    ok(ev.solids.get('p1/s1').box.join() === '-600,0,0,-550,50,700' && ev.solids.get('p2/s1').box.join() === '550,0,0,610,60,700', 'the legs: Height 740 − 40 = 700 from the table; the second at Size 60 (x 550…610, y 0…60)');
    ok(ev.solids.get('p3/s1').box.join() === '-50,550,0,0,600,700' && true, 'the third turned a quarter: its 50 × 50 foot at (0, 550) turns to x −50…0, y 550…600 (' + ev.solids.get('p3/s1').box.join() + ')');
    ok(ev.roots[1].material === 'material-brick', 'the material parameter passes down: the first leg is styled with the table\'s Wood (' + ev.roots[1].material + ')');
    ok(FM.evaluateFamily(rt.family, { Legs: 0 }, ctx()).roots.length === 3, 'the first leg hidden by Legs = 0');
    ok(FM.evaluateFamily(rt.family, { Height: 800 }, ctx()).solids.get('p1/s1').box[5] === 760, 'a taller table: the legs follow (800 − 40 = 760)');
    // refusals
    ok(FM.evaluateFamily(rt.family, {}, {}).error?.key === 'fam.err.nestmissing' && FM.evaluateFamily(rt.family, {}, ctx({ resolve: () => null })).error?.key === 'fam.err.nestmissing', 'no such family: refused, naming it');
    const badp = JSON.parse(JSON.stringify(table)); badp.parts[0].values.Nope = '1';
    ok(FM.evaluateFamily(read(badp).family, {}, ctx()).error?.key === 'fam.err.nestparam', 'a value for a parameter the family has not: refused');
    const turn = JSON.parse(JSON.stringify(table)); turn.parts[2].rot = '45';
    ok(FM.evaluateFamily(read(turn).family, {}, ctx()).error?.key === 'fam.err.nestrot', 'a turn that is not a quarter turn: refused');
    const selfp = JSON.parse(JSON.stringify(table)); selfp.parts[0].family = 'fam-tabl1';
    ok(!read(selfp).ok && read(selfp).errors[0].key === 'fam.err.nestcycle', 'a family inside itself: refused when it is read');
    const cyc = { ...leg, parts: [{ id: 'p1', family: 'fam-tabl1' }] };
    const lib2 = { 'fam-leg1': FM.readFamily(cyc).family, 'fam-tabl1': lib['fam-tabl1'] };
    ok(FM.evaluateFamily(lib2['fam-tabl1'], {}, { resolve: (k) => lib2[k] }).error?.key === 'fam.err.nestcycle', 'the table in the leg in the table: refused as a cycle');
    const chain = {}; for (let i = 0; i < 7; i++) chain['fam-c' + i] = FM.readFamily(block({ key: 'fam-c' + i, name: 'C', parts: i < 6 ? [{ id: 'p1', family: 'fam-c' + (i + 1) }] : [] })).family;
    ok(FM.evaluateFamily(chain['fam-c0'], {}, { resolve: (k) => chain[k] }).error?.key === 'fam.err.nestdeep', 'six deep: refused ("at most ' + FM.LIMITS.nestDepth + ' deep")');
    // the quarter-turn rules, solid by solid
    const rot = (solid, turns = 1) => { const c = block({ key: 'fam-rt1', name: 'Rot', solids: [{ ...solid, id: 's1', style: 'solid' }] }); const par = block({ key: 'fam-rt2', name: 'P', parts: [{ id: 'p1', family: 'fam-rt1', rot: String(turns * 90) }] }); const L = { 'fam-rt1': FM.readFamily(c).family }; return FM.evaluateFamily(FM.readFamily(par).family, {}, { resolve: (k) => L[k] }); };
    const bx = rot({ op: 'box', x0: '0', y0: '0', z0: '0', x1: '100', y1: '50', z1: '10' }).solids.get('p1/s1').box;
    ok(bx.join() === '-50,0,0,0,100,10', 'a box turned: x −50…0, y 0…100');
    const xz = rot({ op: 'extrude', plane: 'xz', at: '10', profile: [['0', '0'], ['100', '0'], ['100', '50'], ['0', '50']], depth: '20' }).solids.get('p1/s1');
    ok(xz.plane === 'yz' && xz.at === -30 && xz.depth === 20 && xz.profile[1][0] === 100, 'an extrusion on xz becomes one on yz: the volume y 10…30 turns to x −30…−10 (at −30, depth 20)');
    const yz = rot({ op: 'extrude', plane: 'yz', at: '10', profile: [['0', '0'], ['100', '0'], ['100', '50'], ['0', '50', 0.5]], depth: '20' }).solids.get('p1/s1');
    ok(yz.plane === 'xz' && yz.at === 10 && yz.profile[1][0] === -100 && yz.profile[3][2] === -0.5, 'one on yz becomes one on xz: the profile mirrors (u → −u) and its arcs turn the other way');
    const xy = rot({ op: 'extrude', plane: 'xy', at: '0', profile: [['0', '0'], ['100', '0'], ['100', '50'], ['0', '50']], depth: '20' }, 2).solids.get('p1/s1');
    ok(xy.profile[1][0] === -100 && xy.profile[1][1] === 0 && xy.profile[2][1] === -50, 'two quarter turns of one on xy: a half turn');
    ok(rot({ op: 'revolve', plane: 'xz', at: '0', profile: [['10', '0'], ['50', '0'], ['50', '50']], axis: ['0', '0', '0', '1'], angle: '360' }).error?.key === 'fam.err.nestrot' && rot({ op: 'revolve', plane: 'xy', at: '0', profile: [['10', '0'], ['50', '0'], ['50', '50']], axis: ['0', '0', '1', '0'], angle: '360' }).ok, 'a revolve on a vertical plane cannot be turned (refused); on xy it can');
    ok(rot({ op: 'sweep', path: [['0', '0', '0'], ['100', '0', '0']], radius: '5' }).solids.get('p1/s1').path[1].join() === '0,100,0', 'a sweep turned');
    ok(rot({ op: 'box', x0: '0', y0: '0', z0: '0', x1: '100', y1: '50', z1: '10' }, 4).solids.get('p1/s1').box.join() === '0,0,0,100,50,10', 'four quarter turns: where it began');
    // in a file
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(leg));
    ed.modelChange(FO.importFamily(table));
    ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-tabl1', x: 2000, y: 2000 }));
    const text = () => new TextDecoder().decode(ed.save());
    ok((text().match(/IFCEXTRUDEDAREASOLID\(/g) || []).length === 5, 'IFC: the table\'s solids are IFC\'s own: the top and three legs, plus the leg family\'s own default size (five in all)');
    ok(/fam\.err\.nested/.test((() => { try { ed.modelChange(FO.removeFamily('fam-leg1')); return ''; } catch (x) { return x.key; } })()), 'the leg cannot be deleted while the table holds it');
    const thick = FM.readFamily(leg).family; thick.params.find((p) => p.key === 'Size').value = 70;
    const before = (text().match(/\b70\./g) || []).length;
    const savedLeg = JSON.parse(JSON.stringify(FM.familyFor(w(), 'fam-leg1'))); savedLeg.params.find((p) => p.key === 'Size').value = 70;
    ed.modelChange(FO.saveFamily(savedLeg));
    ok((text().match(/\b70\./g) || []).length > before, 'saving the leg draws the table again: its solids now show the new leg size in the file');
    ok(FM.evaluateFamily(FM.familyFor(w(), 'fam-tabl1'), {}, FM.evalCtx(w())).solids.get('p1/s1').box[3] === -530, 'the table at its default: its first leg is 70 wide now (x −600…−530)');
    // the file brings what it holds
    const file = FO.familyFile(w(), 'fam-tabl1');
    ok(file.uses?.length === 1 && file.uses[0].key === 'fam-leg1' && !file.uses[0].uses, 'the table\'s family file carries the leg (`uses`)');
    const fresh = await building();
    fresh.ed.modelChange(FO.importFamily(file));
    const ks = FO.readFamilies(fresh.w()).map((f) => f.key);
    ok(ks.includes('fam-tabl1') && ks.includes('fam-leg1'), 'importing it into another file brings both families');
    fresh.ed.modelChange(FO.importFamily(file));
    ok(FO.readFamilies(fresh.w()).filter((f) => f.source === 'project').length === 3, 'importing again adds the table once more and reuses the leg (three families, not four)');
    // a cycle through saving
    const evil = JSON.parse(JSON.stringify(FM.familyFor(w(), 'fam-leg1'))); evil.parts = [{ id: 'p1', family: 'fam-tabl1' }];
    ok(/^fam\.err\.atsize|fam\.err\.nestcycle/.test((() => { try { ed.modelChange(FO.saveFamily(evil)); return 'saved'; } catch (x) { return x.key; } })()) && !FM.familyFor(w(), 'fam-leg1').parts, 'saving the leg to hold the table (which holds the leg): refused, the leg unchanged');
    // editing
    let e = FE.addPart(block(), 'fam-leg1', { at: ['0', '0', '0'], values: { Height: '300' } });
    ok(e.ok && e.fam.parts[0].family === 'fam-leg1' && e.id === 'p1', 'addPart');
    e = FE.setPart(e.fam, 'p1', { at: ['Width', 0, '10'], rot: '90', visible: 'Width', values: { Size: '20', Height: '' } });
    ok(e.ok && e.fam.parts[0].at.join() === 'Width,0,10' && e.fam.parts[0].rot === '90' && e.fam.parts[0].values.Size === '20' && !('Height' in e.fam.parts[0].values), 'setPart: where, turn, shown by, values (an empty value drops it)');
    ok(!FE.setPart(e.fam, 'p1', { at: ['Nope', 0, 0] }).ok && FE.addPart(block(), 'fam-more1').error?.key === 'fam.err.nestcycle', 'an unknown name refused; a family inside itself refused');
    const ren = FE.renameParam(e.fam, 'Width', 'Wide');
    ok(ren.ok && ren.fam.parts[0].at[0] === 'Wide' && ren.fam.parts[0].visible === 'Wide', 'renaming follows into the parts');
    ok(FE.removeParam(e.fam, 'Width').error?.key === 'fam.err.paramused', 'a parameter a part uses cannot be deleted');
    const rp = FE.removePart(e.fam, 'p1');
    ok(rp.ok && !rp.fam.parts, 'removePart');
  }

  // ============================================================================================ 7. sizes from a table
  if (want('csv')) {
    console.log('== 7. sizes from a CSV table, and out again');
    const CV = await import(path.join(APP, 'family-csv.js'));
    const p = CV.parseCsv('\ufeffName;Width;"Note; ""quoted"""\r\nA;600;x\r\n\r\nB;"7,5";"two\nlines"\r\n');
    ok(p.delimiter === ';' && p.rows.length === 3 && p.rows[0][2] === 'Note; "quoted"' && p.rows[2][2] === 'two\nlines' && p.rows[0][0] === 'Name', 'parse: BOM, semicolons, quotes, a doubled quote, CRLF, an empty line, a line break inside quotes');
    ok(CV.parseCsv('a\tb\n1\t2').delimiter === '\t' && CV.parseCsv('a,b\n1,2').rows[1][1] === '2', 'tab and comma guessed');
    const fam = FM.readFamily(block({ params: [{ key: 'Width', kind: 'length', value: 600, label: 'Wide' }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 800 }, { key: 'Doors', kind: 'integer', value: 2 }, { key: 'Glass', kind: 'yesno', value: 0 }, { key: 'Skin', kind: 'material', value: '' }, { key: 'Tilt', kind: 'angle', value: 0 }] })).family;
    const csv = 'name,wide,DEPTH,Height,Doors,Glass,Skin,Tilt,Comment\nSmall,450,300,0.9 m,1.6,yes,material-brick,15 deg,hi\n"Big, wide","1,2 m",500,36 in,3,No,,0,x\nSmall,450,300,0.9 m,2,yes,material-brick,15,dup?\n';
    const r = CV.sizesFromCsv(fam, csv.replace('"1,2 m"', '"1.2 m"'));
    ok(r.errors.length === 0 && r.sizes.length === 2, 'three rows, the third the first again (1.6 doors rounds to 2, and Tilt 15 = 15 deg): two sizes, the duplicate noted', r.errors.map((e) => e.key + ' ' + JSON.stringify(e.fill)).join());
    const [a, b2] = r.sizes;
    ok(a.name === 'Small' && a.values.Width === 450 && a.values.Depth === 300 && a.values.Height === 900 && a.values.Doors === 2 && a.values.Glass === 1 && a.values.Skin === 'material-brick' && a.values.Tilt === 15, 'row 1: a label and a different case find the column; 0.9 m = 900; 1.6 doors → 2; yes → 1; a material id; 15 deg');
    ok(b2.name === 'Big, wide' && b2.values.Width === 1200 && b2.values.Height === 914.4 && b2.values.Glass === 0 && b2.values.Skin === '', 'row 2: a quoted name with a comma, 1.2 m, 36 in = 914.4, No, an empty material cell');
    ok(r.notes.some((n) => n.key === 'fam.csv.ignored' && n.fill.column === 'Comment') && r.notes.some((n) => n.key === 'fam.csv.duplicate' && n.fill.line === 4), 'notes: the Comment column ignored, line 4 a duplicate');
    const e1 = CV.sizesFromCsv(fam, 'Width,Glass\n500,maybe\nabc,yes\n');
    ok(e1.errors.length === 2 && e1.errors.every((e) => e.key === 'fam.err.csvvalue') && e1.errors[0].fill.line === 2 && e1.sizes.length === 0, 'a Yes / No that is neither, a length that is no number: two errors, each with its line');
    const e2 = CV.sizesFromCsv(fam, 'Nope,Zip\n1,2\n');
    ok(e2.errors[0]?.key === 'fam.err.csvcols', 'no column that is a parameter: refused');
    ok(CV.sizesFromCsv(fam, 'Width\n').errors[0].key === 'fam.err.csvempty' && CV.sizesFromCsv(fam, '').errors[0].key === 'fam.err.csvempty', 'a header only, or nothing: refused');
    const many = 'Width\n' + Array.from({ length: 205 }, (_, i) => String(100 + i)).join('\n');
    const rm = CV.sizesFromCsv(fam, many);
    ok(rm.errors.some((e) => e.key === 'fam.err.csvrows') && rm.sizes.length === 200, '205 rows: the first 200 read and the table refused (limit 200)');
    ok(CV.sizesFromCsv(fam, 'Width\n' + 'x'.repeat(1048577)).errors[0].key === 'fam.err.csvbig', 'over 1 MB: refused');
    const chk = CV.sizesFromCsv(fam, 'Width,Height\n500,800\n0,800\n', { check: (v) => (v.Width < 1 ? { key: 'fam.err.flat', fill: { name: 'Block' } } : null) });
    ok(chk.errors.length === 1 && chk.errors[0].key === 'fam.err.csvrow' && chk.errors[0].fill.line === 3 && chk.errors[0].fill.why === 'fam.err.flat', 'a row the family cannot draw is an error naming its line and why');
    // out
    const out = CV.sizesToCsv(fam, [{ name: '=1+1', values: { Width: 450, Glass: 1 } }, { name: 'Plain, name', values: { Width: -5 } }]);
    ok(out.startsWith('\ufeffName,Wide,Depth,Height,Doors,Glass,Skin,Tilt\r\n') && out.includes("'=1+1,450,400,800,2,Yes,,0") && out.includes('"Plain, name",-5,'), 'out: BOM, CRLF, the label as header, a formula-looking name quoted with an apostrophe, a comma in a name quoted, negative numbers kept');
    const back = CV.sizesFromCsv(fam, out);
    ok(back.errors.length === 0 && back.sizes.length === 2 && back.sizes[0].values.Width === 450 && back.sizes[0].values.Glass === 1 && back.sizes[1].values.Width === -5, 'what goes out reads back in');
    // the operation
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(block({ params: fam.params, solids: [{ id: 's1', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'solid' }] })));
    const sizes = () => FO.readFamilies(w()).find((f) => f.key === 'fam-more1').sizes.filter((z) => z.guid).length;
    const n0 = sizes();
    const res = ed.modelChange(FO.importSizes('fam-more1', 'Name,Wide,Height\nTall,500,1800\nWide,1200,700\nTall again,500,1800\n'));
    ok(res.added === 2 && res.skipped === 0 && sizes() === n0 + 2, 'importSizes: two new sizes in one step (the third row repeats the first: noted, not made)');
    const res2 = ed.modelChange(FO.importSizes('fam-more1', 'Wide,Height\n500,1800\n'));
    ok(res2.added === 0 && res2.skipped === 1, 'importing a size that is there: skipped');
    ed.undo(); ed.undo();
    ok(sizes() === n0, 'undo takes the sizes away again (' + sizes() + ' = ' + n0 + ')');
    ed.redo();
    let err = null;
    try { ed.modelChange(FO.importSizes('fam-more1', 'Wide,Height\n777,1800\nnope,1\n')); } catch (x) { err = x; }
    ok(err && err.key === 'fam.err.csvvalue' && err.errors.length === 1 && sizes() === n0 + 2, 'one bad row refuses the table: nothing was made (' + (err && err.key) + ')');
    ok(/csvempty/.test((() => { try { ed.modelChange(FO.importSizes('fam-more1', 'Wide\n')); return 'x'; } catch (x) { return x.key; } })()), 'an empty table refused');
    const csvOut = FO.sizesCsv(w(), 'fam-more1');
    ok(csvOut.split('\r\n').length === n0 + 2 + 2 && csvOut.includes('Tall'), 'sizesCsv: the file\'s sizes with their names');
  }

  // ============================================================================================ 7b. other parts than the size: instance parameters
  if (want('instance')) {
    console.log('== 7b. a placed element showing other parts than its size');
    const tab = () => block({ params: [{ key: 'Width', kind: 'length', value: 600 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 800 }, { key: 'Legs', kind: 'yesno', value: 1, instance: true }, { key: 'Mark', kind: 'text', value: 'T', instance: true }],
      solids: [{ id: 's1', name: 'Top', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '(Height - 40)', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'wood' },
        { id: 's2', name: 'Legs', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '0', x1: '(-Width / 2 + 50)', y1: '50', z1: '(Height - 40)', style: 'wood', visible: 'Legs' }],
      symbol: { mode: 'symbol', parts: [{ id: 'y1', kind: 'text', x: '0', y: '100', h: '60', text: '{Mark}' }] } });
    const r = read(tab());
    ok(r.ok && r.family.params[3].instance === true && r.family.params[4].instance === true, 'the instance flag reads');
    const withF = tab(); withF.params.push({ key: 'Calc', kind: 'length', value: 0, formula: 'Width', instance: true });
    ok(read(withF).family.params.find((p) => p.key === 'Calc').instance === undefined, 'a driven parameter cannot be an instance one (the flag is dropped)');
    const hostedW = JSON.parse(JSON.stringify(tab())); hostedW.host = 'wall'; hostedW.kind = 'door'; hostedW.base = 'door-single'; hostedW.params[0] = { key: 'Width', kind: 'length', value: 900, instance: true }; hostedW.params[2] = { key: 'Height', kind: 'length', value: 2000 };
    ok(!read(hostedW).ok && read(hostedW).errors[0].key === 'fam.err.needs', 'a door\'s Width cannot be an instance parameter (it is its size)');
    const f = r.family;
    ok(Object.keys(FM.sizeValues(f, { Legs: 0, Width: 700 })).join() === 'Width,Depth,Height' && FM.sizeKey(f, { Legs: 0 }) === FM.sizeKey(f, { Legs: 1 }) && FM.instanceValues(f, { Legs: 0, Mark: 'B' }).Mark === 'B' && Object.keys(FM.fullValues(f, { Legs: 0 })).length === 5, 'a size does not hold instance values (one size for both); the instance and full values do');
    ok(FM.hasInstance(f, { Legs: 0 }) && !FM.hasInstance(f, { Legs: 1, Mark: 'T' }) && !FM.hasInstance(f, {}), 'hasInstance: other than the defaults or not');
    const roots = (v) => FM.evaluateFamily(f, v, {}).roots.length;
    ok(roots({}) === 2 && roots({ Legs: 0 }) === 1 && FM.evaluateFamily(f, { Mark: 'B' }, {}).symbol[0].text === 'B', 'evaluating with an instance value: Legs = 0 drops a solid; the text part takes Mark');
    // placed
    const { ed, w, level } = await building();
    ed.modelChange(FO.importFamily(tab()));
    const a1 = ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', x: 1000, y: 1000 }));
    const b1 = ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-more1', instance: { Legs: 0, Mark: 'B' }, x: 3000, y: 1000 }));
    const text = () => new TextDecoder().decode(ed.save());
    const els = () => FO.readFamilyElements(w()).sort((p, q) => p.x - q.x);
    ok(els().length === 2 && els()[0].instance.Legs === 1 && els()[1].instance.Legs === 0 && els()[1].instance.Mark === 'B' && els()[0].typeId === els()[1].typeId, 'two elements of ONE size, one showing other parts: instance read back (Legs 1 / 0, Mark B)');
    ok((text().match(/CadCraft_FamilyInstance/g) || []).length === 1 && /\{"Legs":0,"Mark":"B"\}/.test(text()), 'IFC: the pset CadCraft_FamilyInstance on the second one only, its Values JSON');
    const mapped = (id) => { const l = ed.api.GetLine(ed.mid, id, false); const pds = ed.api.GetLine(ed.mid, l.Representation.value, false); return (pds.Representations || []).some((h) => (ed.api.GetLine(ed.mid, h.value, false).Items || []).some((i) => /MAPPEDITEM/i.test(ed.api.GetLine(ed.mid, i.value, false).constructor.name))); };
    ok(mapped(els()[0].id) && !mapped(els()[1].id), 'the first is a mapped item of the size\'s shape; the second has a shape of its own');
    // change one
    ed.modelChange(FO.setFamilyInstance([els()[0].guid], { Legs: 0 }));
    ok(!mapped(els()[0].id) && els()[0].instance.Legs === 0 && (text().match(/CadCraft_FamilyInstance/g) || []).length === 2, 'setFamilyInstance: the first now has its own shape too');
    ed.modelChange(FO.setFamilyInstance([els()[0].guid, els()[1].guid], { Legs: 1, Mark: 'T' }));
    ok(els().every((e) => mapped(e.id)) && !/CadCraft_FamilyInstance/.test(text()), 'both back to the defaults: mapped again, no instance pset left');
    ed.undo();
    ok(els().every((e) => !mapped(e.id)) && els().every((e) => e.instance.Legs === 0) && els()[1].instance.Mark === 'B', 'one Undo: both back to their own shapes, the second with its Mark B again');
    ed.undo(); ed.redo(); ed.redo();
    ok(els().length === 2 && els().every((e) => mapped(e.id)), 'undo, undo, redo, redo: the same');
    // the family changes: the own shapes follow
    ed.modelChange(FO.setFamilyInstance([els()[1].guid], { Legs: 0 }));
    const rec = JSON.parse(JSON.stringify(FM.familyFor(w(), 'fam-more1')));
    rec.solids.push({ id: 's3', name: 'Shelf', op: 'box', x0: '-100', y0: '0', z0: '300', x1: '100', y1: '100', z1: '320', style: 'wood' });
    ed.modelChange(FO.saveFamily(rec));
    ok(!mapped(els()[1].id) && els()[1].instance.Legs === 0 && els().length === 2, 'saving the family draws the elements again: the one with its own shape keeps its values');
    ed.modelChange(FO.setFamilySize([els()[1].guid], FO.readFamilies(w()).find((f2) => f2.key === 'fam-more1').sizes.find((z) => z.guid).guid));
    ok(els()[1].instance.Legs === 0, 'changing its size keeps its instance values');
    // hosted
    const hosted = block({ key: 'fam-dr1', name: 'Door', kind: 'door', host: 'wall', base: 'door-single', ifc: { class: 'IfcDoor' },
      params: [{ key: 'Width', kind: 'length', value: 900 }, { key: 'Height', kind: 'length', value: 2000 }, { key: 'Transom', kind: 'yesno', value: 0, instance: true }],
      solids: [{ id: 's1', name: 'Leaf', op: 'box', x0: '0', y0: '(-WallThickness / 2)', z0: '0', x1: 'Width', y1: '(WallThickness / 2)', z1: 'Height', style: 'leaf' },
        { id: 's2', name: 'Transom', op: 'box', x0: '0', y0: '(-WallThickness / 2)', z0: '(Height - 300)', x1: 'Width', y1: '(WallThickness / 2)', z1: 'Height', style: 'frame', visible: 'Transom' }], symbol: undefined });
    const b2 = await building();
    b2.ed.modelChange(FO.importFamily(hosted));
    b2.ed.modelChange(OPS.drawWalls({ storey: b2.level, segs: [{ a: [0, 0], b: [6000, 0] }], typeKey: 'ext-2x6', height: 2700 }));
    const wall = OPS.snapshotModel(b2.ed).walls[0];
    b2.ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey: 'door-single', family: 'fam-dr1', offset: 500, instance: { Transom: 1 }, face: 'left' }));
    b2.ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey: 'door-single', family: 'fam-dr1', offset: 2500, face: 'left' }));
    const ops = () => OPS.snapshotModel(b2.ed).openings.filter((o) => o.family === 'fam-dr1').sort((p, q) => p.offset - q.offset);
    ok(ops().length === 2 && ops()[0].instance.Transom === 1 && ops()[1].instance.Transom === 0 && ops()[0].typeId === ops()[1].typeId, 'two doors of one size, the first with a transom (instance Transom 1 / 0)');
    const t2 = new TextDecoder().decode(b2.ed.save());
    ok((t2.match(/CadCraft_FamilyInstance/g) || []).length === 1, 'IFC: the pset only on the door that sets something');
    b2.ed.modelChange(FO.setFamilyInstance([ops()[1].guid], { Transom: 1 }));
    ok(ops()[1].instance.Transom === 1 && (new TextDecoder().decode(b2.ed.save()).match(/CadCraft_FamilyInstance/g) || []).length === 2, 'setFamilyInstance on a door: its transom on, in its wall');
    b2.ed.modelChange(OPS.changeOpening(ops()[0].guid, { width: 1000 }));
    ok(ops()[0].instance.Transom === 1 && ops()[0].width === 1000, 'resizing the door keeps its transom');
    // editing
    let e = FE.setParam(block(), 'Width', { instance: true });
    ok(e.ok && e.fam.params[0].instance === true && !FE.setParam(e.fam, 'Width', { instance: false }).fam.params[0].instance, 'setParam: instance on and off');
    ok(FE.setParam(FE.setParam(block(), 'Depth', { formula: 'Width' }).fam, 'Depth', { instance: true }).error?.key === 'fam.err.instance', 'a driven parameter cannot be an instance one');
  }

  // ============================================================================================ 3. hotspots
  if (want('hotspots')) {
    console.log('== 3. hotspots: points and edges that drag a parameter');
    const f = block({ params: [{ key: 'Width', kind: 'length', value: 600 }, { key: 'Depth', kind: 'length', value: 400 }, { key: 'Height', kind: 'length', value: 800 }, { key: 'Half', kind: 'length', value: 0, formula: 'Width / 2' },
      { key: 'Reach', kind: 'length', value: 500 }, { key: 'Swing', kind: 'angle', value: 30 }, { key: 'Shelves', kind: 'integer', value: 3 }, { key: 'On', kind: 'yesno', value: 1 }, { key: 'Tag', kind: 'text', value: 'x' }],
      hotspots: [
        { id: 'h1', name: 'Right edge', kind: 'edge', axis: 'x', drives: 'Width', at: ['Half', '0', '0'], to: ['Half', 'Depth', '0'] },
        { id: 'h2', kind: 'point', axis: 'y', drives: 'Depth', at: ['0', 'Depth', '(Height / 2)'] },
        { id: 'h3', kind: 'point', axis: 'x', drives: 'Swing', at: ['(Reach * cos(Swing))', '(Reach * sin(Swing))', '0'] },
        { id: 'h4', kind: 'point', axis: 'z', drives: 'Shelves', at: ['0', '0', '(Shelves * 200)'] }] });
    const r = read(f);
    ok(r.ok && r.family.hotspots.length === 4 && r.family.hotspots[0].to.length === 3, 'four hotspots read', r.errors?.map((e) => e.key).join());
    const ev = FM.evaluateFamily(r.family, {});
    ok(ev.ok && ev.hotspots.length === 4 && ev.hotspots[0].p.join() === '300,0,0' && ev.hotspots[0].q.join() === '300,400,0' && ev.hotspots[1].p.join() === '0,400,400', 'evaluated: the edge from (300, 0, 0) to (300, 400, 0), the point at (0, 400, 400)');
    ok(near(ev.hotspots[2].p[0], 500 * Math.cos(Math.PI / 6)) && ev.hotspots[3].p[2] === 600, 'trigonometry in degrees; an integer parameter (3 shelves × 200 = 600)');
    // bad ones
    const bad1 = (mut) => { const g = JSON.parse(JSON.stringify(f)); mut(g); return read(g); };
    ok(!bad1((g) => { g.hotspots[0].drives = 'Half'; }).ok, 'a hotspot cannot drag a driven parameter');
    ok(!bad1((g) => { g.hotspots[0].drives = 'On'; }).ok && !bad1((g) => { g.hotspots[0].drives = 'Tag'; }).ok && !bad1((g) => { g.hotspots[0].drives = 'Nope'; }).ok, 'nor a Yes / No, a word, or a parameter that is not there');
    ok(!bad1((g) => { g.hotspots[1].axis = 'w'; }).ok && !bad1((g) => { g.hotspots[1].kind = 'blob'; }).ok && !bad1((g) => { g.hotspots[0].to = ['1']; }).ok, 'a bad axis, kind or edge end: refused');
    ok(!bad1((g) => { g.hotspots[1].at[0] = 'Nope'; }).ok && bad1((g) => { g.hotspots[1].at[0] = 'Nope'; }).errors[0].key === 'fam.err.unknown', 'an unknown name in a position: refused');
    ok(!bad1((g) => { g.hotspots = Array.from({ length: 41 }, (_, i) => ({ id: 'q' + i, kind: 'point', axis: 'x', drives: 'Width', at: ['0', '0', '0'] })); }).ok, '41 hotspots: refused');
    ok(!bad1((g) => { g.hotspots[1].id = 'h1'; }).ok, 'two hotspots with one id: refused');
    // dragging
    const D = (id, to, vals = {}) => FE.dragHotspot(r.family, vals, id, to);
    let d = D('h1', [500, 0, 0]);
    ok(d.ok && d.values.Width === 1000 && d.key === 'Width', 'dragging the right edge to x = 500: Width becomes 1000 (through the formula Half = Width / 2)');
    d = D('h2', [0, 650, 0]);
    ok(d.ok && d.values.Depth === 650 && d.values.Width === 600, 'the back point to y = 650: Depth 650, the rest as it was');
    d = D('h3', [300, 0, 0]);
    ok(d.ok && d.values.Swing > 52 && d.values.Swing < 54, 'an angle: the point dragged to x = 300 turns Swing to about 53° (' + d.values?.Swing + ')');
    d = D('h4', [0, 0, 1000]);
    ok(d.ok && d.values.Shelves === 5, 'an integer: z = 1000 is 5 shelves');
    d = D('h4', [0, 0, 1090]);
    ok(d.ok && d.values.Shelves === 5, 'between two: rounded (1090 / 200 = 5.45 → 5)');
    ok(!D('h1', [-100, 0, 0]).ok && D('h1', [-100, 0, 0]).error.key === 'fam.err.handle', 'a drag that would make a length zero or less: refused');
    ok(!D('zz', [0, 0, 0]).ok, 'no such hotspot');
    ok(D('h1', [500, 0, 0], { Width: 800, Depth: 300 }).values.Depth === 300, 'the other values of the size being dragged are kept');
    // editing
    let e = FE.addHotspot(block(), { axis: 'x' });
    ok(e.ok && e.fam.hotspots[0].drives === 'Width' && e.fam.hotspots[0].at[0] === '(Width / 2)' && e.id === 'h1', 'addHotspot: a point on the right side driving Width');
    e = FE.addHotspot(e.fam, { kind: 'edge', axis: 'z', drives: 'Height' });
    ok(e.ok && e.fam.hotspots[1].to && FM.evaluateFamily(e.fam, {}).hotspots.length === 2, 'an edge on top driving Height');
    e = FE.setHotspot(e.fam, 'h1', { name: 'Side', at: ['(Width / 2 + 10)', 0, '0'], drives: 'Depth' });
    ok(e.ok && e.fam.hotspots[0].name === 'Side' && e.fam.hotspots[0].drives === 'Depth', 'setHotspot');
    ok(!FE.setHotspot(e.fam, 'h1', { at: ['Nope', 0, 0] }).ok && !FE.setHotspot(e.fam, 'h1', { drives: 'Nope' }).ok, 'an unknown name in a position or a parameter that is not there: refused');
    ok(FE.addHotspot(FE.addParam(block(), { key: 'Note', kind: 'text', value: '' }).fam, { drives: 'Note' }).fam.hotspots[0].drives === 'Width', 'a hotspot offered a word parameter takes the first number one instead');
    const ren = FE.renameParam(e.fam, 'Width', 'Wide');
    ok(ren.ok && ren.fam.hotspots[0].at[0] === '(Wide / 2 + 10)' && FM.evaluateFamily(ren.fam, {}).ok, 'renaming follows into positions');
    const ren2 = FE.renameParam(e.fam, 'Depth', 'Deep');
    ok(ren2.ok && ren2.fam.hotspots[0].drives === 'Deep', 'and into what a hotspot drives');
    ok(FE.removeParam(e.fam, 'Depth').error?.key === 'fam.err.paramused', 'a parameter a hotspot drives cannot be deleted');
    const rm = FE.removeHotspot(FE.removeHotspot(e.fam, 'h1').fam, 'h2');
    ok(rm.ok && !rm.fam.hotspots, 'removing the last hotspot removes the list');
    // kept in the file
    const { ed, w } = await building();
    ed.modelChange(FO.importFamily(f));
    ok((FM.familyFor(w(), 'fam-more1').hotspots || []).length === 4, 'the hotspots are in the family stored in the file');
  }

  // ============================================================================================ IFC2X3 and IFC4 round trips of all of it
  if (want('x3') || want('round')) {
    console.log('== the lot, IFC4 and IFC2X3: saved, reopened, read');
    const fs = await import('node:fs');
    const leg = block({ key: 'fam-leg1', name: 'Leg', params: [{ key: 'Height', kind: 'length', value: 700 }, { key: 'Skin', kind: 'material', value: '' }], solids: [{ id: 's1', op: 'box', x0: '0', y0: '0', z0: '0', x1: '50', y1: '50', z1: 'Height', style: 'wood', material: 'Skin' }] });
    const all = block({ key: 'fam-all1', name: 'Everything', params: [{ key: 'Width', kind: 'length', value: 1200 }, { key: 'Depth', kind: 'length', value: 600 }, { key: 'Height', kind: 'length', value: 740 }, { key: 'Boards', kind: 'integer', value: 3 },
      { key: 'Wood', kind: 'material', value: 'material-brick' }, { key: 'Mark', kind: 'text', value: 'T1', instance: true }, { key: 'Drawer', kind: 'yesno', value: 0, instance: true }],
      solids: [{ id: 's1', name: 'Top', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '(Height - 40)', x1: '(Width / 2)', y1: 'Depth', z1: 'Height', style: 'wood', material: 'Wood' },
        { id: 's2', name: 'Board', op: 'box', x0: '(-Width / 2)', y0: '0', z0: '100', x1: '(Width / 2)', y1: 'Depth', z1: '118', style: 'wood', detail: 'medium', array: { count: 'Boards', dx: '0', dy: '0', dz: '150' } },
        { id: 's3', name: 'Drawer', op: 'box', x0: '-200', y0: '0', z0: '(Height - 140)', x1: '200', y1: '100', z1: '(Height - 40)', style: 'frame', visible: 'Drawer' }],
      parts: [{ id: 'p1', family: 'fam-leg1', at: ['(-Width / 2)', '0', '0'], values: { Height: 'Height - 40', Skin: 'Wood' } }],
      symbol: { mode: 'symbol', parts: [{ id: 'y1', kind: 'rect', x0: '(-Width / 2)', y0: '0', x1: '(Width / 2)', y1: 'Depth', fill: 'none' }, { id: 'y2', kind: 'text', x: '0', y: '(Depth / 2)', h: '80', text: '{Mark}' }] },
      hotspots: [{ id: 'h1', kind: 'point', axis: 'x', drives: 'Width', at: ['(Width / 2)', '(Depth / 2)', '0'] }] });
    for (const schema of ['IFC4', 'IFC2X3']) {
      let b;
      if (schema === 'IFC4') b = await building();
      else { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((x) => eng.load(x))(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))); const ed2 = new IfcEditor(WebIFC, eng); b = { ed: ed2, w: () => { const x = new ModelWriter(WebIFC, ed2.api, ed2.mid); FO.familyWriter(x); return x; }, level: OPS.snapshotModel(ed2).levels[0].guid }; }
      const { ed, w, level } = b;
      ed.modelChange(FO.importFamily(leg));
      ed.modelChange(FO.importFamily(all));
      ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-all1', values: { Boards: 5 }, instance: { Mark: 'T7', Drawer: 1 }, x: 1000, y: 1000 }));
      ed.modelChange(FO.placeFamily({ storey: level, family: 'fam-all1', values: { Boards: 5 }, x: 4000, y: 1000 }));
      ed.modelChange(FO.setFamilyDetail('medium'));
      const bytes = ed.save();
      const txt = new TextDecoder().decode(bytes);
      const re = await building2(bytes);
      const els = FO.readFamilyElements(re.w()).filter((e) => e.family === 'fam-all1').sort((p, q) => p.x - q.x);
      const fam2 = FM.familyFor(re.w(), 'fam-all1');
      ok(els.length === 2 && els[0].instance.Mark === 'T7' && els[0].instance.Drawer === 1 && els[1].instance.Mark === 'T1' && els[0].typeId === els[1].typeId && els[0].values.Boards === 5, schema + ': reopened: two elements of one size (5 boards), the first with its own Mark and Drawer');
      ok(fam2.parts.length === 1 && fam2.hotspots.length === 1 && fam2.symbol.parts.length === 2 && fam2.solids[1].array.count === 'Boards' && fam2.solids[1].detail === 'medium' && fam2.params.find((p) => p.key === 'Wood').kind === 'material', schema + ': the recipe came back whole: nested part, hotspot, symbol, array, detail, typed parameters');
      ok(FM.familyDetail(re.w()) === 'medium', schema + ': the project detail level (medium) is in the file');
      ok(/IFCSURFACESTYLE\('Family: Brick veneer #94503c'/.test(txt), schema + ': the material colour is a surface style');
      ok(!/IFCTRIANGULATEDFACESET|IFCFACETEDBREP/.test(txt) || schema === 'IFC2X3', schema + ': no triangulated geometry written');
      const ev = FM.evaluateFamily(fam2, { Boards: 5 }, FM.evalCtx(re.w(), { detail: 'medium' }));
      ok(ev.ok && [...ev.solids.keys()].filter((k) => k.startsWith('s2')).length === 5 && ev.roots.length >= 7, schema + ': evaluated again from the file: five boards, the top, the leg (' + ev.roots.length + ' solids)');
    }
  }

  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
