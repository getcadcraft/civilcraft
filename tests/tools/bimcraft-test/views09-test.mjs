/* SPDX-License-Identifier: Apache-2.0 */
/**
 * views09-test.mjs — BimCraft 0.9 D8.12 (working style) and SU.1123, session `bim-views-09`. DOM-free, run by
 *   node bin/test-bimcraft.mjs --views09 [--only a,b,c,d,w,s,t]
 *   a   D8.12-A duplicate a view: own copy (range, crop, hidden, drafting, dimensions, pens copied; editing either never changes
 *       the other), linked copy (one set), copies of callouts, of copies, of elevations; one undo step; save + reopen; delete
 *   b   D8.12-B pens in the IFC per view (every category, drafting), the old browser store, sheets / PDF as shown, the pen table
 *       (CadCraft's plot-style format) applied to sheet items
 *   c   D8.12-C Report as: the list of classes that fit, one undo step, saved as the reported class (IFC4 and IFC2X3) and read back
 *       as the drawn one, the property index (takeoff, Find, Problems) and the schedules
 *   d   D8.12-D project templates: Save as template keeps every setting and no model elements; New from template gives them back
 *   w   D8.12 working style: presets and their defaults, each changed on its own
 *   s   SU.1123: sheet formats and title blocks as data, rename family / size / element, editing in elevation and section views
 */
import fs from 'node:fs';
import path from 'node:path';

export async function views09Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  async function building({ n = 2, h = 3000, text = null } = {}) {
    const N = await import(path.join(APP, 'new-model.js'));
    const src = text || N.newBuilding({ name: 'Views09', levels: N.stackLevels(n, h, (i) => 'Level ' + (i + 1)), fileName: 'v.ifc', now: new Date('2026-11-02T12:00:00Z') });
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(typeof src === 'string' ? new TextEncoder().encode(src) : src);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, levels: OPS.snapshotModel(ed).levels, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  async function reopenEd(bytes) {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, eng, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  }
  const refusal = (ed, o) => { try { ed.modelChange(o); return ''; } catch (e) { return e.key || e.message; } };

  // ============================================================================================ (a) duplicate a view
  if (want('a')) {
    console.log('== D8.12-A duplicate a view (own copy, linked)');
    const V = await import(path.join(APP, 'views-model.js'));
    const C = await import(path.join(APP, 'view-copies.js'));
    const DR = await import(path.join(APP, 'drafting.js'));
    const WD = await import(path.join(APP, 'wall-dimensions.js'));
    const P = await import(path.join(APP, 'pens.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1, L2] = levels;
    const plan1 = 'plan:' + L1.guid;
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }] }));
    const walls = OPS.snapshotModel(ed).walls;
    ed.modelChange(V.setPlanView(L1.guid, { scale: 50, crop: [-500, -500, 7000, 5000], hiddenClasses: ['IfcFurniture'], hiddenGuids: [walls[1].guid] }));
    ed.modelChange(DR.addDrafting({ level: L1.guid, view: plan1, kind: 'lines', pts: [[0, -1000], [6000, -1000]] }));
    ed.modelChange(WD.saveWallDimension({ level: L1.guid, view: plan1, axis: 'x', offset: 800, refs: [{ wall: walls[0].guid, reference: 'exterior', station: 0 }, { wall: walls[0].guid, reference: 'exterior', station: 1 }] }));
    ed.modelChange(P.setViewPens(plan1, [{ id: 'p1', scope: { by: 'category', value: 'wall' }, weight: 4, dash: 'solid', color: '--layer-red' }]));
    // own copy
    let n0 = ed.changes.length;
    const r1 = ed.modelChange(C.duplicateView({ of: plan1, mode: 'own', name: 'Level 1 furniture' }));
    const copies = C.readCopies(w());
    const own = copies.find((c) => c.name === 'Level 1 furniture');
    ok(ed.changes.length === n0 + 1 && own && own.mode === 'own' && own.base === plan1 && own.of === plan1, 'Duplicate › Own copy: one undo step, kept beside the callouts with its source', JSON.stringify(copies));
    ok(own?.range?.scale === 50 && own.range.crop?.join() === '-500,-500,7000,5000' && own.range.hiddenClasses.includes('IfcFurniture') && own.range.hiddenGuids.includes(walls[1].guid), 'the copy takes the view range, scale, crop and hidden elements', JSON.stringify(own?.range));
    const ownKey = 'callout:' + own.id;
    let dr = DR.readDrafting(w());
    ok(dr.filter((d) => d.view === ownKey).length === 1 && dr.filter((d) => d.view === plan1).length === 1 && dr.find((d) => d.view === ownKey).guid !== dr.find((d) => d.view === plan1).guid, 'its drafting copied as elements of its own (a new GlobalId)');
    let dims = WD.readWallDimensions(w());
    ok(dims.filter((d) => d.view === ownKey).length === 1 && dims.filter((d) => d.view === plan1).length === 1, 'its wall dimension copied');
    ok(P.readViewPens(w()).get(ownKey)?.[0]?.color === '--layer-red', 'its pen overrides copied');
    ok(V.readCallouts(w()).every((c) => c.id !== own.id), 'a copy is not listed as a callout (older BimCraft skips it too: no top-level crop)');
    // editing the copy never changes the older view, and the other way round
    ed.modelChange(C.saveCopy(own.id, { range: { scale: 100, hiddenClasses: [] } }));
    ed.modelChange(DR.moveDrafting([dr.find((d) => d.view === ownKey).guid], 0, 500));
    ed.modelChange(P.setViewPens(ownKey, []));
    let pv = V.readPlanViews(w()).get(L1.id);
    dr = DR.readDrafting(w());
    ok(pv.scale === 50 && pv.hiddenClasses.includes('IfcFurniture') && dr.find((d) => d.view === plan1).pts[0][1] === -1000 && P.readViewPens(w()).get(plan1)?.length === 1, 'editing the copy (scale, categories, drafting, pens) leaves the source as it was');
    ed.modelChange(V.setPlanView(L1.guid, { scale: 20 }));
    ok(C.readCopies(w()).find((c) => c.id === own.id).range.scale === 100, 'editing the source leaves the own copy as it was (an issued view stays as issued)');
    // linked copy
    const r2 = ed.modelChange(C.duplicateView({ of: plan1, mode: 'linked', name: 'Level 1 linked' }));
    const lk = C.readCopies(w()).find((c) => c.name === 'Level 1 linked');
    ok(lk?.mode === 'linked' && lk.range === null && C.annotationKey(C.readCopies(w()), lk.id) === plan1, 'Duplicate › Linked: no settings of its own; its annotations are the source\'s (one set)');
    ok(DR.readDrafting(w()).filter((d) => d.view === 'callout:' + lk.id).length === 0, 'a linked copy copies nothing');
    ok(refusal(ed, C.saveCopy(lk.id, { range: { scale: 50 } })) === 'model.err.copy.linked', 'a linked copy\'s range cannot be set (it is the source\'s)');
    // a copy of a linked copy follows the chain; Make own copy
    ed.modelChange(C.duplicateView({ of: 'callout:' + lk.id, mode: 'linked', name: 'Linked twice' }));
    const lk2 = C.readCopies(w()).find((c) => c.name === 'Linked twice');
    ok(C.annotationKey(C.readCopies(w()), lk2.id) === plan1 && C.copyRoot(C.readCopies(w()), V.readCallouts(w()), lk2.id, { levels: new Set(levels.map((l) => l.guid)) })?.ref === L1.guid, 'a linked copy of a linked copy shows the first view\'s set, on Level 1');
    ed.modelChange(C.makeOwn(lk.id));
    const lkOwn = C.readCopies(w()).find((c) => c.id === lk.id);
    ok(lkOwn.mode === 'own' && lkOwn.range.scale === 20 && DR.readDrafting(w()).filter((d) => d.view === 'callout:' + lk.id).length === 1, 'Make own copy: what it showed is now its own (scale 1:20, the drafting)');
    ok(C.annotationKey(C.readCopies(w()), lk2.id) === 'callout:' + lk.id, '…and the copy linked to it now shows its set');
    // callouts and their copies
    ed.modelChange(V.saveCallout({ name: 'Stair', parent: plan1, crop: [0, 0, 2000, 2000], scale: 20 }));
    const co = V.readCallouts(w()).find((c) => c.name === 'Stair');
    ok(co && !C.readCopies(w()).some((c) => c.id === co.id), 'a callout made after the copies takes a free number', co?.id);
    ed.modelChange(C.duplicateView({ of: 'callout:' + co.id, mode: 'own', name: 'Stair copy' }));
    const coc = C.readCopies(w()).find((c) => c.name === 'Stair copy');
    ok(coc.base === plan1 && coc.range.crop?.join() === '0,0,2000,2000' && coc.range.scale === 20, 'an own copy of a callout: its crop and scale, drawn from Level 1\'s plan', JSON.stringify(coc));
    // ceiling plan, elevation and section
    ed.modelChange(V.setPlanView(L2.guid, { cut: 2400, scale: 100 }, 'rcp'));
    ed.modelChange(C.duplicateView({ of: 'rcp:' + L2.guid, mode: 'own', name: 'L2 ceiling copy' }));
    const rc = C.readCopies(w()).find((c) => c.name === 'L2 ceiling copy');
    ok(rc.base === 'rcp:' + L2.guid && rc.range.cut === 2400 && rc.range.scale === 100, 'a ceiling plan duplicated: its cut and scale');
    const PV = await import(path.join(APP, 'projected-views.js'));
    ed.modelChange(PV.setProjectedView('elevation:north', { detail: 'medium', scale: 100, crop: null }));
    ed.modelChange(C.duplicateView({ of: 'elevation:north', mode: 'own', name: 'North copy' }));
    const el = C.readCopies(w()).find((c) => c.name === 'North copy');
    ok(el.base === 'elevation:north' && el.range.detail === 'medium' && el.range.scale === 100, 'an elevation duplicated: its detail and scale', JSON.stringify(el));
    ed.modelChange(C.saveCopy(el.id, { range: { scale: 50 } }));
    ok(PV.readProjectedView(w(), 'elevation:north').scale === 100 && C.readCopies(w()).find((c) => c.id === el.id).range.scale === 50, 'the elevation copy\'s scale changed; the north elevation kept its own');
    ok(refusal(ed, C.duplicateView({ of: 'plan:' + 'x'.repeat(22), mode: 'own', name: 'n' })) === 'model.err.copy.of' && refusal(ed, C.duplicateView({ of: plan1, mode: 'half', name: 'n' })) === 'model.err.copy.mode' && refusal(ed, C.duplicateView({ of: plan1, mode: 'own', name: '  ' })) === 'model.err.co.name', 'refused: a view that is not there, a mode we do not have, no name');
    // undo / redo
    n0 = ed.changes.length;
    ed.modelChange(C.duplicateView({ of: plan1, mode: 'own', name: 'Undo me' }));
    const um = C.readCopies(w()).find((c) => c.name === 'Undo me');
    ed.undo();
    ok(!C.readCopies(w()).some((c) => c.name === 'Undo me') && !DR.readDrafting(w()).some((d) => d.view === 'callout:' + um.id), 'Ctrl+Z: the copy and its drafting are gone in one step');
    ed.redo();
    ok(C.readCopies(w()).some((c) => c.name === 'Undo me') && DR.readDrafting(w()).filter((d) => d.view === 'callout:' + um.id).length === 1, 'redo: back with its drafting');
    // delete
    ed.modelChange(C.deleteCopy(um.id));
    ok(!C.readCopies(w()).some((c) => c.name === 'Undo me') && !DR.readDrafting(w()).some((d) => d.view === 'callout:' + um.id) && !WD.readWallDimensions(w()).some((d) => d.view === 'callout:' + um.id), 'Delete: the copy with its own drafting and dimensions');
    // save and reopen
    const bytes = ed.save();
    const R = await reopenEd(bytes);
    const again = C.readCopies(R.w());
    ok(again.length === C.readCopies(w()).length && again.find((c) => c.id === own.id)?.range.scale === 100 && DR.readDrafting(R.w()).filter((d) => d.view === ownKey).length === 1, 'saved and opened again: every copy with its settings and drafting', again.length + '');
    ok(V.readCallouts(R.w()).length === 1, 'the callout reads back as the only callout');
  }

  // ============================================================================== (b) pens in the file, print as shown, pen table
  if (want('b')) {
    console.log('== D8.12-B pens in the IFC, sheets as shown, the pen table');
    const P = await import(path.join(APP, 'pens.js'));
    const PS = await import(path.join(APP, 'print-style.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const PT = await import(path.join(APP, 'plotstyle/plotstyle.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1] = levels;
    const key = 'plan:' + L1.guid;
    let n0 = ed.changes.length;
    ed.modelChange(P.setViewPens(key, [
      { id: 'a', scope: { by: 'category', value: 'wall' }, weight: 4, dash: 'dash', color: '--layer-red' },
      { id: 'b', scope: { by: 'category', value: 'IfcSlab' }, weight: 1, dash: 'solid', color: '--layer-blue' },
      { id: 'c', scope: { by: 'category', value: 'drafting' }, weight: 2.5, dash: 'dot', color: '--layer-green' },
      { id: 'd', scope: { by: 'category', value: 'dimension' }, weight: 1, dash: 'solid', color: '--layer-violet' },
      { id: 'e', scope: { by: 'category', value: 'nonsense' }, weight: 1, dash: 'solid', color: '--ink' },
    ]));
    let pens = P.readViewPens(w()).get(key) || [];
    ok(ed.changes.length === n0 + 1 && pens.length === 4, 'four pens kept in the IFC with the plan (one undo step); an unknown category dropped', JSON.stringify(pens.map((o) => o.scope.value)));
    const txt = new TextDecoder().decode(ed.save());
    ok(txt.includes("'CadCraft_ViewPens'") && txt.includes('cadcraft-viewpens'), 'written as the project\'s CadCraft_ViewPens, by view key');
    ok(P.penFor(pens, { kind: '', cls: 'IfcSlabStandardCase' })?.color === '--layer-blue' && P.penFor(pens, { kind: 'drafting' })?.dash === 'dot' && P.penFor(pens, { kind: '', cls: 'IfcColumn' }) === null, 'a class pen takes its subtypes (IfcSlabStandardCase); a class with no pen has none');
    ed.undo();
    ok(!P.readViewPens(w()).has(key), 'Ctrl+Z: the pens are gone');
    ed.redo();
    const R = await reopenEd(ed.save());
    ok(P.readViewPens(R.w()).get(key)?.length === 4, 'saved and opened again: the pens come back with the view');
    ok(P.isPenViewKey('callout:callout-3') && !P.isPenViewKey('elevation:north') && (() => { try { ed.modelChange(P.setViewPens('nope', [])); return false; } catch (e) { return e.key === 'model.err.pens.view'; } })(), 'pens belong to a plan, a ceiling plan, a callout or a copy; anything else is refused');
    // sheets draw them as the screen does
    const scene = { walls: [{ key: 1, guid: 'w', poly: [[0, 0], [4000, 0], [4000, 200], [0, 200]], pieces: [[[0, 0], [4000, 0], [4000, 200], [0, 200]]], pen: { w: 4, dash: 'dash', color: '--layer-red' } }],
      symbols: [{ key: 2, lines: [[0, 0, 900, 0]], lw: 2.5, color: '--layer-orange' }], cut: [{ key: 3, segs: [0, 1000, 3000, 1000], loops: [], pen: { w: 1, dash: 'solid', color: '--layer-blue' } }],
      drafting: [{ key: 4, kind: 'lines', lines: [[[0, 2000], [3000, 2000]]], pen: { w: 2.5, dash: 'dot', color: '--layer-green' } }], dims: [{ a: [0, -500], b: [4000, -500], off: 0, text: '4000', pen: { w: 1, color: '--layer-violet' } }], rooms: [], below: [] };
    const sheet = RS.composeSheet({ number: 'A-1', title: 'T', views: [{ kind: 'plan', ref: 'x', x: 200, y: 140, ratio: 50 }] }, { plans: [{ ref: 'x', title: 'Plan', scene }] }, { paper: 'tabloid', units: 'mm' });
    const lines = sheet.items.filter((i) => i.t === 'line');
    const has = (hex, fn = () => true) => lines.some((i) => i.color === hex && fn(i));
    ok(has('#b3122e', (i) => i.dash && Math.abs(i.w - 4 * 0.5 / 1.75) < 1e-6), 'the sheet: the wall pen (red, dashed, 4 px = 1.14 mm)');
    ok(has('#a84a00') && has('#1e48c8') && has('#17703a', (i) => i.dash) && has('#5b3cc4'), 'the sheet: door, cut slab, drafting and dimension pens in their colours');
    const pdf = new TextDecoder('latin1').decode(RS.setPdf([sheet], { paper: 'tabloid' }));
    ok(/0\.702 0\.071 0\.18 RG/.test(pdf) || /0\.70\d+ 0\.07\d* 0\.18\d* RG/.test(pdf), 'the sheet PDF carries the red pen as a stroke colour');
    // the pen table: CadCraft's plot-style format
    ok(PS.PEN_ROWS.length === 10 && PS.PEN_ROWS[0].aci === 7, 'the table rows: the ten pen colours, black as ACI 7 (as a CTB)');
    const mono = PS.tableItems(sheet.items, PT.builtinTable('monochrome'));
    ok(mono.filter((i) => i.t === 'line').every((i) => i.color === '#000000'), 'through monochrome every line prints black');
    let tb = PT.setPens({ name: 'Office', description: '', pens: {} }, [PS.PEN_ROWS.find((r) => r.token === '--layer-red').aci], { color: '#00ff00', lw: 0.7 });
    tb = PT.setPens(tb, [7], { lw: 0.35 });
    const own = PS.tableItems(sheet.items, tb);
    ok(own.some((i) => i.t === 'line' && i.color === '#00ff00' && i.w === 0.7) && own.some((i) => i.t === 'line' && i.color === '#000000' && i.w === 0.35), 'an own table: red → green at 0.7 mm; black (ink) → 0.35 mm');
    n0 = ed.changes.length;
    ed.modelChange(PS.setPrintStyle({ mode: 'table', table: tb }));
    let st = PS.readPrintStyle(w());
    ok(ed.changes.length === n0 + 1 && st.mode === 'table' && st.table?.name === 'Office' && st.table.pens[7]?.lw === 0.35, 'Print › Through a pen table, with its table: kept in the file (CadCraft_PrintStyle), one step');
    ok(PT.readTableFile(PT.exportTable(st.table)).ok, 'the table exports as a CadCraft plot style file and reads back');
    ed.modelChange(PS.setPrintStyle({ mode: 'shown', table: 'grayscale' }));
    st = PS.readPrintStyle(w());
    ok(st.mode === 'shown' && st.table?.name === 'grayscale' && PS.modeIn('', 'table') === 'table' && PS.modeIn('', 'shown') === 'shown' && PS.modeIn('shown', 'table') === 'shown', 'a model\'s own choice wins over the working style\'s default');
    ok((() => { try { ed.modelChange(PS.setPrintStyle({ mode: 'loud' })); return false; } catch (e) { return e.key === 'model.err.print.mode'; } })(), 'an unknown print mode is refused');
    PS.setActive(PT.builtinTable('monochrome'));
    ok(PS.printSheets([sheet])[0].items.filter((i) => i.t === 'line').every((i) => i.color === '#000000'), 'printSheets: the active table is applied to every sheet the model prints');
    PS.setActive(null);
    ok(PS.printSheets([sheet])[0] === sheet, '…and nothing is changed when the model prints as shown');
  }

  // ===================================================================================== (c) Report as another IFC class
  if (want('c')) {
    console.log('== D8.12-C Report as: a slab as a floor covering, a road, a shelf; a wall as a panel');
    const RA = await import(path.join(APP, 'report-as.js'));
    const RC = await import(path.join(APP, 'report-as-core.js'));
    const F = await import(path.join(APP, 'model-floors.js'));
    const PR = await import(path.join(APP, 'ifc-props.js'));
    const MS = await import(path.join(APP, 'model-schedule.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1] = levels;
    ed.modelChange(F.placeDrawnFloor({ storey: L1.guid, points: [[0, 0], [5000, 0], [5000, 4000], [0, 4000]], kind: 'concrete', thickness: 200 }));
    ed.modelChange(F.placeDrawnFloor({ storey: L1.guid, points: [[6000, 0], [9000, 0], [9000, 900], [6000, 900]], kind: 'concrete', thickness: 30 }));
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 6000], b: [4000, 6000] }, { a: [0, 8000], b: [4000, 8000] }] }));
    const slabs = F.readDrawnFloors(w()), walls = OPS.snapshotModel(ed).walls;
    const fits = RC.classesFor('IfcSlab', 'IFC4').map((c) => c.cls), fitsW = RC.classesFor('IfcWallStandardCase', 'IFC4').map((c) => c.cls), fitsX3 = RC.classesFor('IfcSlab', 'IFC2X3').map((c) => c.cls);
    ok(fits.includes('IfcCovering') && fits.includes('IfcFurniture') && fits.includes('IfcCivilElement') && !fits.includes('IfcColumn'), 'the list for a slab: coverings, furniture (a shelf), civil elements (a road)…, not columns', fits.join());
    ok(fitsW.includes('IfcPlate') && fitsW.includes('IfcCovering') && !fitsW.includes('IfcSlab'), 'the list for a wall: panels (plates), cladding…', fitsW.join());
    ok(!fitsX3.includes('IfcCivilElement') && !fitsX3.includes('IfcFurniture') && fitsX3.includes('IfcFurnishingElement'), 'IFC2X3 offers only classes it has (a furnishing element, no civil element)');
    let n0 = ed.changes.length;
    ed.modelChange(RA.setReportAs([slabs[0].guid], { cls: 'IfcCovering', type: 'FLOORING' }));
    ed.modelChange(RA.setReportAs([slabs[1].guid], { cls: 'IfcFurniture', type: 'SHELF' }));
    ed.modelChange(RA.setReportAs([walls[0].guid], { cls: 'IfcPlate', type: 'USERDEFINED', name: 'Acoustic panel' }));
    ok(ed.changes.length === n0 + 3, 'one undo step each');
    let rep = RA.readReported(w());
    ok(rep.get(slabs[0].guid)?.cls === 'IfcCovering' && rep.get(slabs[0].guid).drawnAs === 'IfcSlab' && rep.get(slabs[0].guid).drawnType === 'FLOOR', 'kept on the element: Class, PredefinedType, DrawnAs, DrawnType', JSON.stringify(rep.get(slabs[0].guid)));
    ok((() => { try { ed.modelChange(RA.setReportAs([slabs[0].guid], { cls: 'IfcCovering', type: 'NOPE' })); return false; } catch (e) { return e.key === 'model.err.ra.class'; } })(), 'a type the class does not have is refused');
    // the saved file: the reported classes (what other programs read)
    const bytes = ed.save();
    const txt = new TextDecoder().decode(bytes);
    ok(new RegExp("#\\d+=IFCCOVERING\\('" + slabs[0].guid.replace(/\$/g, '\\$') + "'.*\\.FLOORING\\.\\);").test(txt), 'saved as IFCCOVERING(… .FLOORING.) with its own GlobalId');
    ok(new RegExp("#\\d+=IFCFURNITURE\\('" + slabs[1].guid.replace(/\$/g, '\\$') + "'.*\\.SHELF\\.\\);").test(txt), 'saved as IFCFURNITURE(… .SHELF.)');
    ok(new RegExp("#\\d+=IFCPLATE\\('" + walls[0].guid.replace(/\$/g, '\\$') + "'[^;]*'Acoustic panel'[^;]*\\.USERDEFINED\\.\\);").test(txt), 'a wall saved as IFCPLATE, USERDEFINED with ObjectType "Acoustic panel"');
    ok(F.readDrawnFloors(w()).length === 2 && OPS.snapshotModel(ed).walls.length === 2, 'and in the open model they are still a floor and walls to edit (put back right after the save)');
    // reopened: other readers see the reported class; BimCraft's editor turns them back into what was drawn
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    const m2 = await quiet((b) => eng2.load(b))(bytes);
    const clsOf = (g) => { for (const [id, c] of m2.classOf) { const l = eng2.api.GetLine(m2.modelID, id, false); if (l?.GlobalId?.value === g) return c; } return null; };
    ok(clsOf(slabs[0].guid) === 'IfcCovering' && clsOf(walls[0].guid) === 'IfcPlate', 'a model reader opening the file sees IfcCovering and IfcPlate (3D, tree, takeoff)', clsOf(slabs[0].guid) + ' ' + clsOf(walls[0].guid));
    const ix = PR.propertyIndex(WebIFC, eng2.api, m2.modelID, m2);
    const idOf = (g) => { for (const id of ix.ids || m2.classOf.keys()) { const l = eng2.api.GetLine(m2.modelID, id, false); if (l?.GlobalId?.value === g) return id; } return null; };
    const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
    const ed2 = new IfcEditor(WebIFC, eng2);
    const w2 = new ModelWriter(WebIFC, ed2.api, ed2.mid);
    ok(F.readDrawnFloors(w2).length === 2 && OPS.snapshotModel(ed2).walls.length === 2 && RA.readReported(w2).size === 3, 'opened in BimCraft: still two floors and two walls to edit, each with its Report as');
    const ix2 = PR.propertyIndex(WebIFC, ed2.api, ed2.mid, m2);
    const id0 = idOf(slabs[0].guid), id2 = idOf(walls[0].guid);
    ok(ix2.value('cls', id0) === 'IfcCovering' && ix2.value('predefined', id0) === 'FLOORING' && ix2.value('cls', id2) === 'IfcPlate' && ix2.value('predefined', id2) === 'Acoustic panel', 'the property index (Quantities / takeoff, Find, Color by, model checks) counts the reported class and type');
    const sch = MS.schedules(OPS.snapshotModel(ed2), new Map(), { fmtLen: String, fmtArea: String, t: (k) => k });
    const schD = MS.schedules(OPS.snapshotModel(ed2), new Map(), { fmtLen: String, fmtArea: String, t: (k) => k, countBy: 'drawn' });
    ok(sch.walls.nums.reduce((a, r) => a + r[0], 0) === 1 && schD.walls.nums.reduce((a, r) => a + r[0], 0) === 2, 'the walls schedule leaves out the wall reported as a panel (the working style can count it as drawn)');
    // a second save round-trips the same
    const t2 = new TextDecoder().decode(ed2.save());
    ok(/=IFCCOVERING\(/.test(t2) && /=IFCFURNITURE\(/.test(t2) && /=IFCPLATE\(/.test(t2) && (t2.match(/=IFCSLAB\(/g) || []).length === 0, 'saved again from the reopened model: the same reported classes');
    // undo and clear
    ed.undo();
    ok(!RA.readReported(w()).has(walls[0].guid) && !/=IFCPLATE\(/.test(new TextDecoder().decode(ed.save())), 'Ctrl+Z: the wall is a wall again in the file');
    ed.modelChange(RA.setReportAs([slabs[1].guid], { cls: '' }));
    ok(!RA.readReported(w()).has(slabs[1].guid) && (new TextDecoder().decode(ed.save()).match(/=IFCSLAB\(/g) || []).length === 1, 'Clear: saved as a slab again');
    // IFC2X3: a beam reported as a member, and back
    const eng3 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng3.load(b))(fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures', 'ios-steel-ifc2x3.ifc')));
    const ed3 = new IfcEditor(WebIFC, eng3), w3 = new ModelWriter(WebIFC, ed3.api, ed3.mid);
    const beamId = (() => { const v = ed3.api.GetLineIDsWithType(ed3.mid, ed3.api.GetTypeCodeFromName('IFCBEAM'), false); return v.size() ? v.get(0) : null; })();
    if (beamId) {
      const g = w3.guidOf(beamId);
      ok(RC.classesFor('IfcBeam', 'IFC2X3').some((c) => c.cls === 'IfcMember' && !c.types.length), 'IFC2X3: a beam can be reported as a member (no predefined type in IFC2X3)');
      ed3.modelChange(RA.setReportAs([g], { cls: 'IfcMember', type: '' }));
      const b3 = ed3.save(), t3 = new TextDecoder().decode(b3);
      ok(new RegExp("=IFCMEMBER\\('" + g.replace(/\$/g, '\\$') + "'").test(t3) && /FILE_SCHEMA\(\('IFC2X3'\)\)/.test(t3), 'IFC2X3: saved as IFCMEMBER in an IFC2X3 file');
      const e4 = await quiet(IfcModel.create)(WebIFC, null);
      await quiet((b) => e4.load(b))(b3);
      const ed4 = new IfcEditor(WebIFC, e4);
      ok(String(ed4.api.GetLine(ed4.mid, beamId, false)?.constructor?.name) === 'IfcBeam' && RA.readReported(new ModelWriter(WebIFC, ed4.api, ed4.mid)).get(g)?.cls === 'IfcMember', 'IFC2X3: opened again it is the beam it was drawn as, reported as a member');
    } else ok(false, 'the IFC2X3 fixture has a beam');
    ok((() => { try { ed.modelChange(RA.setReportAs([OPS.snapshotModel(ed).levels[0].guid], { cls: 'IfcPlate' })); return false; } catch (e) { return e.key === 'model.err.ra.element'; } })(), 'a level (or a door, a stair, a space) cannot be reported as another class');
  }

  // =========================================================================================== (d) project templates
  if (want('d')) {
    console.log('== D8.12-D Save as template, New from template: every setting comes back, no model elements');
    const V = await import(path.join(APP, 'views-model.js'));
    const C = await import(path.join(APP, 'view-copies.js'));
    const DR = await import(path.join(APP, 'drafting.js'));
    const P = await import(path.join(APP, 'pens.js'));
    const PS = await import(path.join(APP, 'print-style.js'));
    const PV = await import(path.join(APP, 'projected-views.js'));
    const TG = await import(path.join(APP, 'tags.js'));
    const FO = await import(path.join(APP, 'family-ops.js'));
    const F = await import(path.join(APP, 'model-floors.js'));
    const PT = await import(path.join(APP, 'project-template.js'));
    const SF = await import(path.join(APP, 'sheet-formats.js')).catch(() => null);
    const N = await import(path.join(APP, 'new-model.js'));
    const text = N.newBuilding({ name: 'Office standard', levels: [{ name: 'Ground', elevation: 0, height: 3600 }, { name: 'First', elevation: 3600, height: 3200 }, { name: 'Roof', elevation: 6800, height: 1200 }], fileName: 'o.ifc', now: new Date('2026-11-02T12:00:00Z') });
    const B = await building({ text });
    const { ed, levels, w } = B;
    const [G, F1] = levels;
    // settings of every kind
    ed.modelChange(V.saveTemplate({ name: 'Working plan', cut: 1100, top: 0, bottom: 0, depth: 300, hidden: ['IfcFurniture'], scale: 100, detail: 'medium' }));
    ed.modelChange(V.setPlanView(G.guid, { template: 'Working plan', underlay: F1.guid }));
    ed.modelChange(V.setPlanView(F1.guid, { cut: 1300, scale: 50, crop: [0, 0, 20000, 15000] }));
    ed.modelChange(V.setPlanView(F1.guid, { cut: 2500, scale: 100 }, 'rcp'));
    ed.modelChange(V.saveCallout({ name: 'Core', parent: 'plan:' + G.guid, crop: [0, 0, 4000, 4000], scale: 20 }));
    ed.modelChange(C.duplicateView({ of: 'plan:' + F1.guid, mode: 'own', name: 'First furniture' }));
    ed.modelChange(C.duplicateView({ of: 'plan:' + F1.guid, mode: 'linked', name: 'First linked' }));
    ed.modelChange(DR.addDrafting({ level: G.guid, view: 'plan:' + G.guid, kind: 'lines', pts: [[0, -2000], [0, -1000]] }));
    ed.modelChange(P.setViewPens('plan:' + G.guid, [{ id: 'x', scope: { by: 'category', value: 'IfcSlab' }, weight: 1, dash: 'dash', color: '--layer-cyan' }]));
    ed.modelChange(PS.setPrintStyle({ mode: 'table', table: 'grayscale' }));
    ed.modelChange(PV.setProjectedView('elevation:south', { detail: 'fine', scale: 100, crop: null }));
    ed.modelChange(V.saveSheet({ number: 'A-101', title: 'Ground floor', paper: 'a1', views: [{ kind: 'plan', ref: G.guid, x: 400, y: 300, ratio: 100 }] }));
    ed.modelChange(TG.saveDefsOp([{ name: 'Fire rating', kind: 'text', values: ['30', '60', '90'], classes: ['IfcDoor'] }]));
    ed.modelChange(FO.newFamily({ name: 'Planter', kind: 'generic', key: 'fam-planter1' }));
    if (SF) ed.modelChange(SF.saveFormat({ kind: 'format', name: 'Office A1', w: 841, h: 594, margin: 10 }));
    // model elements, which the template must leave out
    ed.modelChange(OPS.drawWalls({ storey: G.guid, segs: [{ a: [0, 0], b: [8000, 0] }, { a: [8000, 0], b: [8000, 6000] }] }));
    ed.modelChange(F.placeDrawnFloor({ storey: G.guid, points: [[0, 0], [8000, 0], [8000, 6000], [0, 6000]], kind: 'concrete', thickness: 200 }));
    const walls = OPS.snapshotModel(ed).walls;
    ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'door-single', offset: 2000, face: 'left' }));
    const settings = (wr) => JSON.stringify({
      levels: OPS.snapshotModel({ W: WebIFC, api: wr.api, mid: wr.mid }).levels.map((l) => [l.guid, l.name, l.elevation, l.height]),
      plans: [...V.readPlanViews(wr)].map(([, v]) => v), rcps: [...V.readPlanViews(wr, 'rcp')].map(([, v]) => v), templates: V.readTemplates(wr), sheets: V.readSheets(wr),
      callouts: V.readCallouts(wr), copies: C.readCopies(wr), drafting: DR.readDrafting(wr).map((d) => [d.view, d.kind, d.pts]), pens: [...P.readViewPens(wr)],
      print: PS.readPrintStyle(wr).mode + ':' + PS.readPrintStyle(wr).name, elev: PV.readProjectedView(wr, 'elevation:south'), tags: TG.readProjectDefs(wr),
      families: FO.readFamilies(wr).filter((f) => f.source === 'project').map((f) => [f.key, f.name, f.sizes.length]), formats: SF ? SF.readFormats(wr) : null,
    });
    const before = settings(w());
    const style = { preset: 'shared', dup: 'linked', print: 'table', count: 'reported', start: 'template' };
    const tpl = await PT.templateBytes(ed.save(), { WebIFC, IfcModel, name: 'Office standard', style, now: new Date('2026-11-02T12:00:00Z') });
    const T = await reopenEd(tpl);
    const sumT = PT.templateSummary(T.w());
    ok(sumT.elements === 0 && sumT.spaces === 0 && sumT.levels === 3, 'the template has the three levels and no model elements (walls, floor, door, opening gone)', JSON.stringify(sumT));
    ok(PT.readTemplateInfo(T.w()).template && PT.readTemplateInfo(T.w()).name === 'Office standard' && PT.readTemplateInfo(T.w()).style?.dup === 'linked', 'it says it is a template, its name, and carries the working style');
    ok(settings(T.w()) === before, 'every setting is in the template as it was in the model', settings(T.w()).slice(0, 300) + ' vs ' + before.slice(0, 300));
    const made = await PT.newFromTemplate(tpl, { WebIFC, IfcModel, name: 'Clinic 12', now: new Date('2026-11-03T09:00:00Z') });
    const M = await reopenEd(made.bytes);
    const after = settings(M.w());
    ok(after === before, 'New from template: every setting comes back the same (levels, plan / ceiling / callout / copy views, view templates, drafting, pens, print style, elevations, sheets, tags, families' + (SF ? ', sheet formats' : '') + ')', after.length + ' vs ' + before.length);
    const info = PT.readTemplateInfo(M.w());
    ok(!info.template && info.from === 'Office standard' && made.style?.print === 'table', 'the new model is not a template; it says which one it came from; the working style comes with it');
    const pj = (wr) => { const id = wr.api.GetLineIDsWithType(wr.mid, wr.api.GetTypeCodeFromName('IFCPROJECT'), false).get(0); return wr.api.GetLine(wr.mid, id, false); };
    ok(pj(M.w()).GlobalId?.value !== pj(T.w()).GlobalId?.value && pj(M.w()).Name?.value === 'Clinic 12', 'its project has a GlobalId of its own and the new name', pj(M.w()).GlobalId?.value + ' ' + pj(M.w()).Name?.value);
    ok(PT.templateSummary(M.w()).elements === 0, 'and no elements: ready to draw');
  }

  // ============================================================================================== (w) working style
  if (want('w')) {
    console.log('== D8.12 working style: presets over the defaults of A–D, each changeable on its own');
    const WS = await import(path.join(APP, 'work-style.js'));
    const store = (() => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; })();
    let st = WS.readStyle(store);
    ok(st.preset === 'own' && st.dup === 'own' && st.print === 'shown' && st.count === 'reported' && st.start === 'blank', 'nothing chosen: "Each view its own" — own copies, print as shown', JSON.stringify(st));
    st = WS.setPreset('shared', store);
    ok(st.preset === 'shared' && st.dup === 'linked' && st.print === 'table' && st.start === 'template', '"Shared annotations and pen tables": linked copies, a pen table, start from a template');
    st = WS.setOne('dup', 'own', store);
    ok(st.preset === 'custom' && st.dup === 'own' && st.print === 'table', 'one default changed on its own: the others stay, and the style reads "Custom"');
    st = WS.setOne('dup', 'linked', store);
    ok(st.preset === 'shared', 'set back, it is the preset again');
    ok(WS.setOne('print', 'loud', store).print === 'table' && WS.setPreset('nope', store).preset === 'shared', 'unknown values and presets change nothing');
    ok(WS.readStyle(store).preset === 'shared' && JSON.parse(store.getItem(WS.KEY)).dup === 'linked', 'kept in the browser store bimcraft.workstyle');
    const names = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
    const words = ['ws9.own', 'ws9.shared', 'ws9.legend'].map((k) => names[k] || '');
    ok(words.every(Boolean) && !words.some((w) => /revit|archicad|autodesk|graphisoft/i.test(w)), 'the presets are named for the way of working, never a product', words.join(' | '));
  }

  // ============================================================== (t) D8.14-17: portrait sheets, a typed scale, your own SVG title block
  if (want('t')) {
    console.log('== D8.14-D8.17 portrait sheets, typed scale, own SVG title block');
    const SF = await import(path.join(APP, 'sheet-formats.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const V = await import(path.join(APP, 'views-model.js'));
    const TS = await import(path.join(APP, 'title-svg.js'));
    const B = await building();
    const { ed, levels, w } = B;
    // portrait
    ok(RS.PAPERS.a3[0] === 420 && RS.PAPERS['a3:p'][0] === 297 && RS.PAPERS['a3:p'][1] === 420 && ['a4', 'a2', 'a1', 'a0', 'letter', 'archd'].every((k) => RS.PAPERS[k + ':p'][0] === RS.PAPERS[k][1]), 'every paper has a portrait twin (a3:p = 297 × 420)');
    ok(RS.isPortrait('a1:p') && !RS.isPortrait('a1') && RS.baseKey('a1:p') === 'a1' && RS.portraitKey('a1') === 'a1:p', 'portrait key helpers');
    const pdf = new TextDecoder('latin1').decode(RS.setPdf([RS.blankSheet('A-1', 'T', { paper: 'a3:p' })], { paper: 'a3:p' }));
    ok(/MediaBox \[0 0 841\.89 1190\.55\]/.test(pdf) || /MediaBox \[0 0 841\.8\d* 1190\.5\d*\]/.test(pdf), 'a portrait A3 prints 297 × 420 mm', (pdf.match(/MediaBox \[[^\]]*\]/) || [''])[0]);
    ed.modelChange(SF.saveFormat({ kind: 'format', name: 'Plotter 900', w: 900, h: 1500, margin: 15 }));
    const P = {}; SF.registerPapers(SF.readFormats(w()).formats, P);
    ok(Object.keys(P).join() === 'fmt:format-1,fmt:format-1:p' && P['fmt:format-1:p'][0] === 900 && P['fmt:format-1:p'][1] === 1500, 'your own sheet size has its portrait twin too', JSON.stringify(P));
    ed.modelChange(V.saveSheet({ number: 'P-1', title: 'Portrait', paper: 'a2:p', views: [{ kind: 'plan', ref: levels[0].guid, x: 200, y: 300, ratio: 2.5 }, { kind: 'plan', ref: levels[1].guid, x: 100, y: 100, ratio: 64 }] }));
    const sh = V.readSheets(w()).find((x) => x.number === 'P-1');
    ok(sh?.paper === 'a2:p' && sh.views[0].ratio === 2.5 && sh.views[1].ratio === 64, 'a sheet keeps its portrait paper and a ratio like 1:2.5 (not rounded to a whole number)', JSON.stringify(sh));
    // typed scale
    const cases = [['1:64', 64], ['1:256', 256], ['64', 64], ['1:2.5', 2.5], ['2:1', 0.5], [' 1 : 100 ', 100], ['1/4" = 1\'', 48], ['1/4" = 1\'-0"', 48], ['3/16 in = 1 ft', 64], ['1/8=1\'-0"', 96], ['1"=20\'', 240], ['3/32" = 1\'', 128]];
    for (const [txt, want] of cases) { const r = RS.parseScale(txt); ok(r !== null && Math.abs(r - want) < 1e-6, 'typed scale ' + JSON.stringify(txt) + ' = 1:' + want, String(r)); }
    ok(['', 'abc', '1:', '0', '1:0', '1:abc', '-5', '1:99999999'].every((x) => RS.parseScale(x) === null), 'not a scale: empty, words, zero, a missing side, too large');
    // a typed ratio is the scale the view is drawn at
    const spec = { number: 'A-1', title: 'T', views: [{ kind: 'plan', ref: 'x', x: 200, y: 140, ratio: 256 }] };
    const scene = { walls: [{ key: 1, guid: 'w', poly: [[0, 0], [10000, 0], [10000, 200], [0, 200]], pieces: [[[0, 0], [10000, 0], [10000, 200], [0, 200]]] }], symbols: [], cut: [], drafting: [], dims: [] };
    const inp = { plans: [{ ref: 'x', title: 'Plan', scene }] };
    const at256 = RS.composeSheet(spec, inp, { paper: 'a3', units: 'mm' }), at64 = RS.composeSheet({ ...spec, views: [{ ...spec.views[0], ratio: 64 }] }, inp, { paper: 'a3', units: 'mm' });
    const wid = (c) => c.views[0].box[2] - c.views[0].box[0];
    ok(at256.views[0].ratio === 256 && at256.views[0].label === '1:256' && at64.views[0].label === '1:64' && Math.abs(wid(at256) - 11200 / 256) < 0.2 && Math.abs(wid(at64) - 11200 / 64) < 0.2, 'a view placed at 1:256 is drawn 4 times smaller than at 1:64, and labelled so', at256.views[0].label + ' ' + wid(at256).toFixed(1) + ' / ' + wid(at64).toFixed(1));
    const odd = RS.composeSheet({ ...spec, views: [{ ...spec.views[0], ratio: 2.5 }] }, inp, { paper: 'a0', units: 'mm' });
    ok(odd.views[0].label === '1:2.5', 'a ratio that is not in the list is labelled 1:2.5', odd.views[0].label);
    // own SVG title block
    const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect x="10" y="10" width="400" height="277" fill="none" stroke="#000" stroke-width="0.5"/>'
      + '<rect x="300" y="237" width="110" height="50" fill="none" stroke="#000"/><text x="304" y="246" font-size="4">Company: {{company}}</text><text x="304" y="258" font-size="5" font-weight="bold">{{drawing-name}}</text><text x="304" y="280" font-size="6">{{number}}</text><text x="304" y="268" font-size="3">{{Drawn By}}</text>'
      + '<rect id="drawing-area" x="14" y="14" width="282" height="269" fill="none"/><script>alert(1)</script></svg>';
    const ps = TS.parseTitleSvg(SVG);
    ok(ps.ok && ps.w === 420 && ps.h === 297 && ps.fields.map((f) => f.key).join() === 'company,drawn-by' && ps.area?.join() === '14,14,296,283', 'the SVG is read: size, the fields it names (drawing-name and number are the sheet\'s own), the drawing area', JSON.stringify([ps.fields, ps.area]));
    ok(!ps.shapes.some((x) => x.t === 'text' && /alert/.test(x.s)) && ps.shapes.filter((x) => x.t === 'line').length >= 2, 'drawn shapes become lines and words; a script in it is ignored (never put on the page)');
    ok(!TS.parseTitleSvg('hello').ok && !TS.parseTitleSvg('<svg viewBox="0 0 1 1"><rect width="1" height="1"/></svg>').ok && !TS.parseTitleSvg('<svg viewBox="0 0 420 297"></svg>').ok, 'not an SVG, a tiny one and an empty one are refused');
    const n0 = ed.changes.length;
    ed.modelChange(SF.saveFormat({ kind: 'titleblock', name: 'Our sheet', place: 'svg', svg: SVG }));
    const tbo = SF.readFormats(w()).titleBlocks.find((b) => b.name === 'Our sheet');
    ok(ed.changes.length === n0 + 1 && tbo?.place === 'svg' && tbo.fields.map((f) => f.key).join() === 'company,drawn-by' && tbo.svg === SVG, 'saved as a title block of the model (one undo step), its fields listed', JSON.stringify(tbo?.fields));
    ok((() => { try { ed.modelChange(SF.saveFormat({ kind: 'titleblock', name: 'Broken', place: 'svg', svg: '<p>no</p>' })); return false; } catch (e) { return e.key === 'model.err.sf.svg'; } })(), 'a file that is not an SVG design is refused (model.err.sf.svg)');
    const lib = SF.libraryText(SF.readFormats(w())), back = SF.readLibrary(lib);
    ok(back.ok && back.titleBlocks.some((b) => b.name === 'Our sheet' && b.place === 'svg' && b.svg === SVG), 'the library file carries the design to other models');
    const it = RS.composeSheet({ number: 'A-301', title: 'Ground floor', fields: { company: 'ACME Design', 'drawn-by': 'RD' }, views: [], titleBlockSpec: tbo }, { plans: [] }, { paper: 'a3', units: 'mm', project: 'Clinic' });
    const words = it.items.filter((i) => i.t === 'text').map((i) => i.s);
    ok(words.includes('Company: ACME Design') && words.includes('Ground floor') && words.includes('A-301') && words.includes('RD'), 'the sheet draws the design with the words filled in', JSON.stringify(words));
    const itP = RS.composeSheet({ number: 'A-302', title: 'T', fields: {}, views: [], titleBlockSpec: tbo }, { plans: [] }, { paper: 'a3:p', units: 'mm' });
    const xs = itP.items.filter((i) => i.t === 'line').flatMap((i) => i.pts.map((q) => q[0])), ys = itP.items.filter((i) => i.t === 'line').flatMap((i) => i.pts.map((q) => q[1]));
    ok(Math.max(...xs) <= 297 + 1e-6 && Math.max(...ys) <= 420 + 1e-6 && Math.min(...xs) >= 0, 'on a portrait sheet the design is fitted, never stretched or off the paper');
    // drawn in the designer: the same file
    const drawn = TS.designSvg([{ k: 'rect', x0: 10, y0: 10, x1: 410, y1: 287 }, { k: 'line', x0: 300, y0: 237, x1: 410, y1: 237 }, { k: 'text', x0: 304, y0: 246, s: '{{company}} & <Co>', size: 4 }, { k: 'area', x0: 14, y0: 14, x1: 296, y1: 283 }], { w: 420, h: 297 });
    const pd = TS.parseTitleSvg(drawn);
    ok(pd.ok && pd.fields[0]?.key === 'company' && pd.area && pd.shapes.some((x) => x.t === 'text' && x.s === '{{company}} & <Co>'), 'a design drawn in the editor reads back as the same kind of file (text escaped)');
    // arrange keeps the views inside the design's drawing area
    const ar = RS.arrangeSheet({ number: 'A-1', title: 'T', views: [], titleBlockSpec: tbo }, { plans: [] }, { paper: 'a3', units: 'mm' });
    ok(ar && ar.views.length === 0, 'arrange runs with an SVG title block');
  }
  // ============================================================== (s) SU.1123: sheet formats, rename, edit in elevation / section
  if (want('s')) {
    console.log('== SU.1123 sheet sizes and title blocks as data; rename family / size / element; edit in elevations and sections');
    const SF = await import(path.join(APP, 'sheet-formats.js'));
    const RS = await import(path.join(APP, 'res-sheets.js'));
    const V = await import(path.join(APP, 'views-model.js'));
    const B = await building();
    const { ed, levels, w } = B;
    const [L1, L2] = levels;
    // formats and title blocks
    let fm = SF.readFormats(w());
    ok(fm.formats.some((f) => f.id === 'a0' && f.w === 1189) && fm.formats.some((f) => f.id === 'arche') && fm.titleBlocks.map((b) => b.id).join() === 'strip,side', 'built in: every paper (A4 … A0, Letter … Arch E) and two title blocks (strip, side)');
    let n0 = ed.changes.length;
    ed.modelChange(SF.saveFormat({ kind: 'format', name: 'Plotter 900', w: 900, h: 1500, margin: 15 }));
    ed.modelChange(SF.saveFormat({ kind: 'titleblock', name: 'Office block', place: 'right', size: 80, fields: [{ label: 'Client', size: 'large' }, { label: 'Drawn by' }, { label: 'Revision' }, { label: 'Number' }] }));
    fm = SF.readFormats(w());
    const own = fm.formats.find((f) => f.name === 'Plotter 900'), tb = fm.titleBlocks.find((b) => b.name === 'Office block');
    ok(ed.changes.length === n0 + 2 && own?.w === 1500 && own.h === 900 && own.margin === 15, 'a format of your own (name, size, border), kept landscape, one undo step each', JSON.stringify(own));
    ok(tb?.place === 'right' && tb.fields.map((f) => f.key).join() === 'client,drawn-by,revision' && tb.fields[0].size === 'large', 'a title block of your own: its fields (a field named "Number" is the sheet\'s own and is left out)', JSON.stringify(tb?.fields));
    ok((() => { try { ed.modelChange(SF.saveFormat({ kind: 'format', name: 'Tiny', w: 20, h: 20 })); return false; } catch (e) { return e.key === 'model.err.sf.size'; } })() && (() => { try { ed.modelChange(SF.saveFormat({ kind: 'format', name: 'Plotter 900', w: 600, h: 600 })); return false; } catch (e) { return e.key === 'model.err.sf.name'; } })(), 'refused: a sheet smaller than 50 mm, a second format of the same name');
    const lib = SF.libraryText(fm), back = SF.readLibrary(lib);
    ok(back.ok && back.formats.length === 1 && back.titleBlocks.length === 1 && !lib.includes('"builtin"'), 'the library file (cadcraft-sheet-formats) holds your own only and reads back');
    const B2 = await building();
    B2.ed.modelChange(SF.importLibrary(back));
    ok(SF.readFormats(B2.w()).formats.some((f) => f.name === 'Plotter 900') && SF.readFormats(B2.w()).titleBlocks.some((b) => b.name === 'Office block'), 'imported into another model in one step');
    SF.registerPapers(fm.formats, RS.PAPERS);
    const key = SF.paperKey(own);
    ok(RS.PAPERS[key]?.[0] === 1500, 'the model\'s formats join the paper list as "' + key + '"');
    ed.modelChange(V.saveSheet({ number: 'A-201', title: 'Sections', paper: key, titleBlock: tb.id, fields: { client: 'City clinic', 'drawn-by': 'RD' }, views: [] }));
    const sh = V.readSheets(w()).find((x) => x.number === 'A-201');
    ok(sh?.titleBlock === tb.id && sh.fields.client === 'City clinic' && sh.paper === key, 'a sheet keeps its format, title block and field words', JSON.stringify(sh));
    const comp = RS.composeSheet({ ...sh, titleBlockSpec: tb, margin: own.margin }, { plans: [] }, { paper: key, units: 'mm' });
    const words = comp.items.filter((i) => i.t === 'text').map((i) => i.s);
    ok(words.includes('City clinic') && words.includes('RD') && words.includes('A-201') && comp.items.some((i) => i.t === 'line' && i.pts.some((q) => Math.abs(q[0] - (1500 - 15 - 80)) < 1e-6)), 'the sheet draws that title block: a column 80 mm wide inside a 15 mm border, the words filled in');
    const pdf = new TextDecoder('latin1').decode(RS.setPdf([comp], { paper: key }));
    ok(/MediaBox \[0 0 4251\.97 2551\.18\]/.test(pdf) || /MediaBox \[0 0 4251\.9\d* 2551\.1\d*\]/.test(pdf), 'its PDF page is 1500 × 900 mm', (pdf.match(/MediaBox \[[^\]]*\]/) || [''])[0]);
    // rename family, size, element
    const FO = await import(path.join(APP, 'family-ops.js'));
    const RN = await import(path.join(APP, 'rename-ops.js'));
    ed.modelChange(FO.duplicateFamily('door-single', { name: 'Office door', key: 'fam-office09' }));
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [8000, 0] }, { a: [8000, 0], b: [8000, 6000] }] }));
    let walls = OPS.snapshotModel(ed).walls;
    ed.modelChange(OPS.placeOpening({ wall: walls[0].guid, typeKey: 'door-single', family: 'fam-office09', offset: 1000, width: 900, face: 'left' }));
    let fam = FO.readFamilies(w()).find((f) => f.key === 'fam-office09');
    n0 = ed.changes.length;
    ed.modelChange(RN.renameFamily('fam-office09', 'Clinic door'));
    fam = FO.readFamilies(w()).find((f) => f.key === 'fam-office09');
    const typeNames = fam.sizes.filter((z) => z.typeId).map((z) => String(ed.api.GetLine(ed.mid, z.typeId, false).Name?.value));
    ok(ed.changes.length === n0 + 1 && fam.name === 'Clinic door' && typeNames.length && typeNames.every((n) => n.startsWith('Clinic door ')), 'rename a family: its group, recipe and every size type "Clinic door <size>" in one step', typeNames.join());
    const sz = fam.sizes.find((z) => z.guid);
    ed.modelChange(RN.renameSize(sz.guid, 'Wide'));
    fam = FO.readFamilies(w()).find((f) => f.key === 'fam-office09');
    ok(fam.sizes.some((z) => z.name === 'Wide' && String(ed.api.GetLine(ed.mid, z.typeId, false).Name?.value) === 'Clinic door Wide'), 'rename a size (its type)');
    const door = OPS.snapshotModel(ed).openings[0];
    ed.modelChange(RN.renameElement(door.guid, 'D-101 exam room'));
    ok(String(ed.api.GetLine(ed.mid, door.id, false).Name?.value) === 'D-101 exam room', 'rename an element (its IFC Name)');
    ok((() => { try { ed.modelChange(RN.renameFamily('fam-office09', '  ')); return false; } catch (e) { return e.key === 'fam.err.name'; } })(), 'an empty name is refused');
    ed.undo();
    ok(String(ed.api.GetLine(ed.mid, door.id, false).Name?.value) !== 'D-101 exam room', 'Ctrl+Z: the element\'s old name back');
    // edit in elevation and section views
    const EV = await import(path.join(APP, 'elev-edit.js'));
    const RV = await import(path.join(APP, 'res-views.js'));
    const MP = await import(path.join(APP, 'model-plan.js'));
    let snap = OPS.snapshotModel(ed);
    let F = EV.frameOf('elevation:south', { levels: snap.levels });
    let items = EV.viewItemsOf(F, snap);
    const south = items.walls.find((x) => x.guid === walls[0].guid);
    ok(south && !items.walls.some((x) => x.guid === walls[1].guid) && items.openings.length === 1 && items.levels.length === 2, 'the south elevation shows the wall along x (not the one square to it), its door and both levels');
    // the same coordinates the drawing uses (res-views.js projectView)
    {
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      const m = await quiet((b) => eng.load(b))(ed.save());
      const wr = new ModelWriter(WebIFC, eng.api, m.modelID);
      const M = MP.viewerToPlan(eng.api.GetCoordinationMatrix(m.modelID), wr.storeyWorld(L1.id));
      const v = RV.projectView(RV.modelTriangles(m, M), { dir: RV.elevationDirs.south });
      const xs = v.lines.filter((l) => l[4] === (m.keyBase || 0) + walls[0].id).flatMap((l) => [l[0], l[2]]);
      const tol = (walls[0].t || 200) + 5;
      ok(xs.length && Math.abs(Math.min(...xs) - south.x0) < tol && Math.abs(Math.max(...xs) - south.x1) < tol, 'what can be picked lies on what is drawn: the wall\'s span in the elevation matches projectView (within the wall\'s thickness at its joined corner)', Math.min(...xs) + '..' + Math.max(...xs) + ' vs ' + south.x0 + '..' + south.x1);
    }
    n0 = ed.changes.length;
    ed.modelChange(EV.moveWallInView(F, snap, walls[0].guid, -500));
    snap = OPS.snapshotModel(ed);
    let w0 = snap.walls.find((x) => x.guid === walls[0].guid);
    const r = F.right;
    ok(ed.changes.length === n0 + 1 && Math.abs((w0.a[0] - walls[0].a[0]) * r[0] + (w0.a[1] - walls[0].a[1]) * r[1] + 500) < 1 && Math.abs(w0.a[1] - walls[0].a[1]) < 1 + Math.abs(r[1]) * 500, 'drag a wall in the elevation: it moves 500 mm along the view, one undo step', JSON.stringify([walls[0].a, w0.a]));
    const d0 = snap.openings[0];
    ed.modelChange(EV.moveOpeningInView(F, snap, d0.guid, 300, 0));
    snap = OPS.snapshotModel(ed);
    ok(Math.abs(Math.abs(snap.openings[0].offset - d0.offset) - 300) < 1, 'drag the door along its wall: 300 mm');
    ed.modelChange(EV.openingInView(F, snap, { wall: walls[0].guid, x: (south.x0 + south.x1) / 2 + 1500, y: 900, typeKey: 'win-fixed' }));
    snap = OPS.snapshotModel(ed);
    const win = snap.openings.find((o) => o.kind === 'window');
    ok(win && Math.abs(win.sill - 900) < 2, 'a window placed by a click on the wall in the elevation, its sill where it was clicked', String(win?.sill));
    ed.modelChange(EV.moveOpeningInView(F, snap, win.guid, 0, 200));
    snap = OPS.snapshotModel(ed);
    ok(Math.abs(snap.openings.find((o) => o.guid === win.guid).sill - 1100) < 2, 'drag the window up 200 mm: its sill 1100');
    ed.modelChange(EV.moveLevelInView(snap, L2.guid, 300));
    snap = OPS.snapshotModel(ed);
    ok(Math.abs(snap.levels.find((l) => l.guid === L2.guid).elevation - 3300) < 1, 'drag Level 2\'s line up 300 mm in the elevation: the level is at 3300');
    // a section: draw a wall in its plane
    ed.modelChange(RS.placeSectionLine({ level: L1.guid, a: [-1000, 3000], b: [9000, 3000], look: 'left', name: 'A' }));
    const secs = RS.readSectionLines(w());
    F = EV.frameOf('section:' + secs[0].guid, { levels: snap.levels, sections: secs });
    ok(F?.kind === 'section' && F.base === 0, 'a section line\'s view: its plane and its level');
    const nW = snap.walls.length;
    ed.modelChange(EV.wallInView(F, snap, { x0: EV.toView(F, [1000, 3000], 0)[0], x1: EV.toView(F, [5000, 3000], 0)[0], y: 100 }));
    snap = OPS.snapshotModel(ed);
    const nw = snap.walls.find((x) => !walls.some((q) => q.guid === x.guid));
    ok(snap.walls.length === nW + 1 && nw && Math.abs(nw.a[1] - 3000) < 1 && Math.abs(nw.b[1] - 3000) < 1 && nw.storey === L1.id, 'Wall in the section: drawn on the section\'s plane (y 3000) on Level 1', JSON.stringify(nw && [nw.a, nw.b]));
    ok((() => { try { EV.wallInView(EV.frameOf('elevation:north', { levels: snap.levels }), snap, { x0: 0, x1: 1000, y: 0 }); return false; } catch (e) { return e.key === 'model.err.ev.wall'; } })(), 'an elevation has no depth to draw a wall at: refused');
    // notes
    ed.modelChange(EV.addViewNote({ view: 'elevation:south', x: 2000, y: 3500, text: 'Brick, flush joints' }));
    let notes = EV.readViewNotes(w(), 'elevation:south');
    ok(notes.length === 1 && notes[0].text === 'Brick, flush joints', 'a note written in the elevation, kept in the file');
    ed.modelChange(EV.changeViewNote(notes[0].id, { x: 2500 }));
    ok(EV.readViewNotes(w())[0].x === 2500, 'moved');
    const CV = await import(path.join(APP, 'comforts-views.js'));
    ok(CV.noteItems([{ t: 'text', x: 2500, y: 3500, s: 'Brick, flush joints' }], (p) => p, 1).some((i) => i.t === 'text' && i.s === 'Brick, flush joints'), 'drawn on the view\'s sheets (noteItems)');
    ed.modelChange(EV.removeViewNote(notes[0].id));
    ok(!EV.readViewNotes(w()).length, 'deleted');
    // a new level drawn in the elevation (SU.1123, last part)
    F = EV.frameOf('elevation:south', { levels: snap.levels });
    n0 = ed.changes.length;
    ed.modelChange(EV.levelInView(F, snap, { y: 6600, name: 'Roof' }));
    snap = OPS.snapshotModel(ed);
    const roof = snap.levels.find((l) => l.name === 'Roof');
    ok(ed.changes.length === n0 + 1 && roof && Math.abs(roof.elevation - 6600) < 1 && Math.abs(roof.height - 3000) < 1, 'Level tool: a level where the elevation was clicked (6600, 3000 tall above the top level), one undo step', JSON.stringify(roof));
    ed.modelChange(EV.levelInView(F, snap, { y: 1650 }));
    snap = OPS.snapshotModel(ed);
    const mid = snap.levels.find((l) => Math.abs(l.elevation - 1650) < 1);
    ok(mid && Math.abs(mid.height - (3300 - 1650)) < 1 && /^Level \d+$/.test(mid.name), 'a level between two takes the height up to the one above and a numbered name', JSON.stringify(mid));
    ok((() => { try { EV.levelInView(F, snap, { y: 6620 }); return false; } catch (e) { return e.key === 'model.err.ev.levelnear'; } })(), 'a level within 50 mm of another is refused');
    ed.undo(); ed.undo();
    ok(!OPS.snapshotModel(ed).levels.some((l) => l.name === 'Roof'), 'Ctrl+Z takes the new levels back');
    snap = OPS.snapshotModel(ed);
    // dimensions drawn in the view
    F = EV.frameOf('elevation:south', { levels: snap.levels });
    items = EV.viewItemsOf(F, snap);
    const T = EV.snapTargets(items);
    ok(T.xs.includes(items.walls[0].x0) && T.ys.includes(items.levels[1].y) && T.ys.includes(items.openings[0].y1), 'snap targets: wall and opening edges, level heights');
    ok(EV.snapTo(items.levels[1].y + 90, T.ys) === items.levels[1].y && EV.snapTo(1234, [], 150) === 1230, 'a click within 150 mm catches the target, else the nearest 10 mm');
    ed.modelChange(EV.addViewDim({ view: 'elevation:south', a: [items.walls[0].x0, items.levels[0].y], b: [items.walls[0].x0 + 4000, items.levels[0].y + 300] }));
    ed.modelChange(EV.addViewDim({ view: 'elevation:south', a: [items.walls[0].x0, items.levels[0].y], b: [items.walls[0].x0 + 150, items.levels[1].y] }));
    let dims = EV.readViewDims(w(), 'elevation:south');
    ok(dims.length === 2 && dims[0].a[1] === dims[0].b[1] && Math.abs(dims[0].len - 4000) < 1 && dims[1].a[0] === dims[1].b[0] && Math.abs(dims[1].len - (items.levels[1].y - items.levels[0].y)) < 1, 'two dimensions kept in the file, one horizontal (4000) and one vertical (level to level): the dominant axis wins', JSON.stringify(dims));
    ok(!EV.readViewDims(w(), 'section:' + secs[0].guid).length, 'a dimension belongs to its view only');
    ok((() => { try { ed.modelChange(EV.addViewDim({ view: 'elevation:south', a: [0, 0], b: [3, 4] })); return false; } catch (e) { return e.key === 'model.err.ev.dim'; } })() && (() => { try { ed.modelChange(EV.addViewDim({ view: 'plan:1', a: [0, 0], b: [3000, 0] })); return false; } catch (e) { return e.key === 'model.err.ev.view'; } })(), 'refused: a dimension shorter than 10 mm, a dimension on something that is not an elevation or section');
    const dimItems = CV.noteItems(dims.map((d) => ({ t: 'dim', a: d.a, b: d.b, off: d.off, text: d.len + ' mm' })), (p) => [p[0] / 50, p[1] / 50], 1 / 50);
    ok(dimItems.filter((i) => i.t === 'text').map((i) => i.s).join() === '4000 mm,' + dims[1].len + ' mm' && dimItems.some((i) => i.t === 'line'), 'drawn on the view\'s sheets: a line with ticks and its length (noteItems)');
    ed.modelChange(EV.removeViewDim(dims[0].id));
    ok(EV.readViewDims(w()).length === 1, 'deleted');
    // they ride along in the saved file
    {
      const eng = await quiet(IfcModel.create)(WebIFC, null);
      const m = await quiet((b) => eng.load(b))(ed.save());
      const wr = new ModelWriter(WebIFC, eng.api, m.modelID);
      ok(EV.readViewDims(wr, 'elevation:south').length === 1, 'a saved and reopened model still has the dimension');
    }
  }

  console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
  return bad ? 1 : 0;
}
