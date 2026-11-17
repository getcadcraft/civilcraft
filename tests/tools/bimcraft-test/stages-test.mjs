/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stages-test.mjs: the project-stage modules of BimCraft's dev/stages/ (0.10 W1.10, session stages-10), DOM-free, on real IFC models:
 *   nice -n 10 timeout 600 node tools/bimcraft-test/stages-run.mjs [--brief] [--options] [--types] [--records]
 * --brief    BK.176  the brief, rooms with targets as spaces, the accommodation schedule (met / short / over), one undo step, save and reopen
 * --options  BK.105  stacking the brief into options, the fit and the budget, the layout kept with the option, the picture on one scale
 * --types    BK.110 / BK.111  detail links on types, the specification / schedule / drawing agreement
 * --records  BK.113 / BK.178  shop drawing review state on the record and its elements, resubmission, site instructions, explain changes
 * Numbers are worked by hand beside each check.
 */
import path from 'node:path';

export async function stagesMode({ APP, WebIFC, IfcModel, quiet, args = [] }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const near = (a, b, e = 0.02) => Math.abs(a - b) <= e;
  const throws = (fn) => { try { fn(); return null; } catch (e) { return e.key || String(e.message || e); } };
  const imp = (f) => import(path.join(APP, f));
  const [BR, OS, TL, RC, OPS, SP, MO, V, H, IS, N, SPEC, P, { ModelWriter }, { IfcEditor }, { t: t0 }, WD] = await Promise.all([
    imp('stages/brief.js'), imp('stages/options-side.js'), imp('stages/types-link.js'), imp('stages/records.js'), imp('model-ops.js'), imp('spaces-ops.js'), imp('mass-options.js'),
    imp('views-model.js'), imp('issuelog/history.js'), imp('issue-set.js'), imp('new-model.js'), imp('spec-model.js'), imp('program-mass.js'), imp('model-write.js'), imp('ifc-edit.js'), imp('i18n.js'), imp('stages/words.js')]);
  const t = WD.speak(t0);
  const all = !['--brief', '--options', '--types', '--records'].some((f) => args.includes(f));
  const want = (f) => all || args.includes(f);

  const boot = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return { ed: new IfcEditor(WebIFC, eng) }; };
  const fresh = (name, levels = 1) => boot(new TextEncoder().encode(N.newBuilding({ name, levels: N.stackLevels(levels, 3000, (i) => 'Level ' + (i + 1)), fileName: name + '.ifc', now: new Date('2026-11-13T12:00:00Z') })));
  const again = (S) => boot(S.ed.save());
  const W = (S) => new ModelWriter(WebIFC, S.ed.api, S.ed.mid);
  const box = (S, L, x0, y0, x1, y1) => S.ed.modelChange(OPS.drawWalls({ storey: L.guid, segs: [{ a: [x0, y0], b: [x1, y0] }, { a: [x1, y0], b: [x1, y1] }, { a: [x1, y1], b: [x0, y1] }, { a: [x0, y1], b: [x0, y0] }], typeKey: 'ext-2x6', height: 2700 }));
  const roomsOn = (S, L) => OPS.snapshotModel(S.ed).derived.spaces.filter((x) => x.storey === L.id);
  const ROOMS = 'Living; 1; 30\nBedroom, 3, 12 m2\nBath\t6\nStudy ; 10';   // net 30 + 3 x 12 + 6 + 10 = 82 m2; gross at 0.8 = 102.5 m2

  // ============================================================================================================================ BRIEF
  if (want('--brief')) {
    console.log('== BK.176 the brief');
    const pr = BR.parseRooms(ROOMS + '\nKitchen; 0; 10\nNo area\n# a comment');
    ok(JSON.stringify(pr.rooms) === JSON.stringify([{ name: 'Living', count: 1, target_m2: 30 }, { name: 'Bedroom', count: 3, target_m2: 12 }, { name: 'Bath', count: 1, target_m2: 6 }, { name: 'Study', count: 1, target_m2: 10 }]) && pr.skipped.length === 2, 'typed lines: "name; count; area", a tab, "12 m2", a count left out; a zero count and a line with no area are skipped and said', pr);
    ok(BR.nameKey('Bedroom 2') === 'bedroom' && BR.nameKey('  BÉDROOM #12 ') === 'bedroom' && BR.nameKey('Café') === 'cafe' && BR.nameKey('Hall 1A') === 'hall', 'names are matched without case, accents or a trailing number');
    ok(BR.parseProgramme('2026-03-01 | Design starts\nSite visit\n2026-01-15: Brief signed').map((x) => x.date + '/' + x.text).join('#') === '2026-01-15/Brief signed#2026-03-01/Design starts#/Site visit', 'programme lines are sorted by date, one without a date goes last');

    let S = await fresh('Brief house');
    const [L1] = OPS.snapshotModel(S.ed).levels;
    const none = BR.readBrief(W(S));
    ok(!none.exists && none.rooms.length === 0 && none.tolerance === 5 && none.efficiency === 0.8, 'a file with no brief reads as none, with the defaults 5 % and 0.8');
    S.ed.modelChange(BR.startBriefOp({ fields: { client: 'A. Client', site: '12 Example Road', budget: 2500000, currency: 'ZAR', programme: '2026-03-01 | Design starts', notes: 'Two storeys at most' }, rooms: pr.rooms }), { label: 'brief' });
    let b = BR.readBrief(W(S));
    ok(b.exists && b.client === 'A. Client' && b.budget === 2500000 && b.currency === 'ZAR' && b.rooms.length === 4 && b.rooms[0].name === 'Living' && b.rooms[1].count === 3 && b.rooms[1].target_m2 === 12, 'the brief and its four rooms read back', b);
    ok(S.ed.api.GetLineIDsWithType(S.ed.mid, WebIFC.IFCSPACE).size() === 4, 'each brief room is an IfcSpace (four), made in one step');
    ok(BR.drawnRooms(W(S)).length === 0, 'no brief room is read as a drawn room (no CadCraft_Room, no quantity set)');
    S.ed.undo();
    ok(!BR.readBrief(W(S)).exists && S.ed.api.GetLineIDsWithType(S.ed.mid, WebIFC.IFCSPACE).size() === 0, 'one Undo takes the whole brief off: fields, rooms and spaces');
    S.ed.redo();
    ok(BR.readBrief(W(S)).rooms.map((r) => r.guid).join() === b.rooms.map((r) => r.guid).join(), 'Redo makes the same rooms with the same GlobalIds');
    S = await again(S);
    b = BR.readBrief(W(S));
    ok(b.rooms.length === 4 && b.programme.includes('Design starts') && b.rooms[2].name === 'Bath' && b.notes === 'Two storeys at most', 'save and reopen keeps the brief');

    let acc = BR.accommodation(b, BR.drawnRooms(W(S)));
    ok(acc.rows.every((r) => r.status === 'notdrawn') && acc.totals.target_m2 === 82 && acc.totals.gross_m2 === 102.5 && acc.totals.notdrawn === 4, 'nothing drawn: four not drawn; target 30 + 36 + 6 + 10 = 82 m2, gross 82 / 0.8 = 102.5', acc.totals);
    const pt = P.programTotals(BR.programOf(b), { efficiency: b.efficiency });
    ok(pt.net === 82 && pt.gross === 102.5 && pt.rows.length === 4, 'programOf hands program-mass.js (EG.58) the same rows and it totals the same 82 / 102.5');

    // a room 6 x 5 m between wall centres: inside the faces (6000 - t) x (5000 - t); drawn area from the file's own quantity
    box(S, L1, 0, 0, 6300, 5000);
    const wt = OPS.snapshotModel(S.ed).walls[0].t, inner = (6300 - wt) * (5000 - wt) / 1e6, bedIn = (3000 - wt) * (4000 - wt) / 1e6;
    const sp = roomsOn(S, L1);
    ok(sp.length === 1, 'the walls made one room');
    S.ed.modelChange(SP.nameRoom(sp[0].guid, { name: 'Living', number: 'R1' }));
    let dr = BR.drawnRooms(W(S));
    const living = dr[0].area_m2;
    ok(dr.length === 1 && dr[0].name === 'Living' && near(living, inner, 0.05) && inner > 28.5 && dr[0].level === 'Level 1', 'the drawn room reads (6300 - t) x (5000 - t) = ' + inner.toFixed(2) + ' m2 on Level 1', dr);
    acc = BR.accommodation(b, dr);
    let row = (n) => acc.rows.find((r) => r.name === n);
    ok(row('Living').status === 'met' && row('Living').drawn_count === 1 && row('Bedroom').status === 'notdrawn' && acc.totals.met === 1 && acc.totals.unbriefed_m2 === 0, 'the drawn area against 30 is inside 5 % (not under 28.5): Living is MET; the others not drawn', acc.rows.map((r) => r.status));
    S.ed.modelChange(BR.changeBriefRoomOp(b.rooms[0].guid, { target_m2: 35 }));
    b = BR.readBrief(W(S)); acc = BR.accommodation(b, BR.drawnRooms(W(S)));
    ok(acc.rows[0].status === 'short' && near(acc.rows[0].diff_m2, living - 35, 0.01), 'a target of 35 m2 makes it SHORT by 35 minus the drawn area');
    S.ed.modelChange(BR.changeBriefRoomOp(b.rooms[0].guid, { target_m2: 25 }));
    acc = BR.accommodation(BR.readBrief(W(S)), BR.drawnRooms(W(S)));
    ok(acc.rows[0].status === 'over', 'a target of 25 m2 makes it OVER');
    S.ed.modelChange(BR.changeBriefRoomOp(b.rooms[0].guid, { target_m2: 30 }));
    box(S, L1, 7000, 0, 10000, 4000);
    const bed = roomsOn(S, L1).find((x) => x.guid !== sp[0].guid);
    S.ed.modelChange(SP.nameRoom(bed.guid, { name: 'Bedroom 1', number: 'R2' }));
    b = BR.readBrief(W(S)); acc = BR.accommodation(b, BR.drawnRooms(W(S)));
    ok(acc.rows.find((r) => r.name === 'Bedroom').status === 'short' && acc.rows.find((r) => r.name === 'Bedroom').drawn_count === 1 && acc.rows.find((r) => r.name === 'Bedroom').count === 3, '"Bedroom 1" is matched to the brief row Bedroom; one of three drawn is SHORT whatever its area');
    const pb = BR.briefProblems(W(S), { t });
    ok(pb.length === 1 && pb[0].code === 'brief.short' && pb[0].severity === 'warning' && pb[0].source.name === 'bimcraft.stages' && pb[0].about.length === 2, 'a Problems warning for the short row only, naming the brief room and the drawn one', pb);
    S.ed.modelChange(SP.nameRoom(bed.guid, { name: 'Pantry', number: 'R2' }));
    acc = BR.accommodation(BR.readBrief(W(S)), BR.drawnRooms(W(S)));
    ok(acc.unbriefed.length === 1 && acc.unbriefed[0].name === 'Pantry' && near(acc.totals.unbriefed_m2, bedIn, 0.05), 'a drawn room the brief does not list is reported as not in the brief, with its area', acc.unbriefed);

    ok(throws(() => BR.addBriefRoomsOp([{ name: '', target_m2: 5 }])) === 'brief.err.name' && throws(() => BR.addBriefRoomsOp([{ name: 'X', target_m2: -1 }])) === 'brief.err.area' && throws(() => BR.addBriefRoomsOp([{ name: 'X', target_m2: 5, count: 0 }])) === 'brief.err.count', 'a room with no name, no area or no count is refused with its key');
    let err = null; try { S.ed.modelChange(BR.setBriefOp({ budget: -5 })); } catch (e) { err = e.key; }
    ok(err === 'brief.err.budget', 'a negative budget is refused');
    S.ed.modelChange(BR.addBriefRoomsOp([{ name: 'Garage', target_m2: 36, group: 'Outside' }]));
    b = BR.readBrief(W(S));
    ok(b.rooms.length === 5 && b.rooms[4].name === 'Garage' && b.rooms[4].group === 'Outside', 'a room added later joins at the end');
    S.ed.modelChange(BR.removeBriefRoomsOp([b.rooms[4].guid]));
    ok(BR.readBrief(W(S)).rooms.length === 4 && S.ed.api.GetLineIDsWithType(S.ed.mid, WebIFC.IFCSPACE).size() === 4 + 2, 'removing it takes its space (4 brief + 2 drawn rooms remain)');
    S = await again(S);
    b = BR.readBrief(W(S));
    ok(b.rooms.length === 4 && BR.drawnRooms(W(S)).length === 2, 'reopened: the brief rooms and the two drawn rooms are both there and told apart');
    S.ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 6000], b: [3000, 6000] }], typeKey: 'ext-2x6', height: 2700 }));
    ok(BR.readBrief(W(S)).rooms.length === 4, 'drawing another wall (the settle step after every op) leaves the brief alone');
  }

  // ============================================================================================================================ OPTIONS
  if (want('--options')) {
    console.log('== BK.105 options against the brief');
    const brief = { efficiency: 0.8, tolerance: 5, budget: 100000, rooms: BR_ROOMS() };
    function BR_ROOMS() { return [{ name: 'Living', count: 1, target_m2: 30 }, { name: 'Bedroom', count: 3, target_m2: 12 }, { name: 'Bath', count: 1, target_m2: 6 }, { name: 'Study', count: 1, target_m2: 10 }]; }
    const bar = { guid: 'gBar', id: 1, option: 'Bar', floors: 3, footprint_m2: 200, gross_m2: 600, floorAreas_m2: [], pts: boxPts(20000, 10000), current: true };
    const mid = { guid: 'gMid', id: 2, option: 'Mid', floors: 2, footprint_m2: 100, gross_m2: 200, floorAreas_m2: [], pts: boxPts(10000, 10000), current: false };
    const tight = { guid: 'gTight', id: 3, option: 'Tight', floors: 1, footprint_m2: 40, gross_m2: 40, floorAreas_m2: [], pts: boxPts(8000, 5000), current: false };
    function boxPts(w, h) { return [[0, 0], [w, 0], [w, h], [0, h]]; }
    let L = OS.stackRooms(brief.rooms, bar, { efficiency: 0.8 });
    ok(L.floors.length === 3 && L.floors.every((f) => f.capacity_m2 === 160) && L.floors[0].net_m2 === 82 && L.unplaced.length === 0 && L.placed_m2 === 82 && L.asked_m2 === 82, 'Bar: 200 m2 x 0.8 = 160 m2 a floor; all 82 m2 of rooms go on the lowest floor', L);
    L = OS.stackRooms(brief.rooms, mid, { efficiency: 0.8 });
    ok(L.floors[0].net_m2 === 76 && L.floors[1].net_m2 === 6 && L.floors[1].rooms[0].name === 'Bath' && !L.unplaced.length, 'Mid: 80 m2 a floor; largest first: 30 + 3 x 12 + 10 = 76 on floor 1; the bath (76 + 6 > 80) goes up to floor 2', L.floors);
    L = OS.stackRooms(brief.rooms, tight, { efficiency: 0.8 });
    ok(L.floors[0].rooms.length === 1 && L.floors[0].rooms[0].name === 'Living' && L.unplaced.map((r) => r.name + 'x' + r.count).join() === 'Bedroomx3,Studyx1,Bathx1' && L.placed_m2 === 30, 'Tight: 32 m2 holds the living room only (30); the three bedrooms, the study and the bath do not fit', L);
    let fit = OS.optionFit(brief, bar, { cost: { total: 90000 } });
    ok(fit.asked_net_m2 === 82 && fit.asked_gross_m2 === 102.5 && fit.surplus_m2 === 497.5 && fit.fits && fit.placed === 6 && fit.of === 6 && fit.budget_status === 'under', 'Bar fits: asked 102.5 gross, offers 600; 90 000 is under the 100 000 budget', fit);
    fit = OS.optionFit(brief, tight, { cost: { total: 120000 } });
    ok(!fit.fits && fit.placed === 1 && fit.of === 6 && fit.surplus_m2 === -62.5 && fit.budget_status === 'over', 'Tight does not fit (1 of 6 rooms, 62.5 m2 short); 120 000 is over budget');
    ok(OS.optionFit(brief, bar).budget_status === 'none' && OS.optionFit({ ...brief, budget: 0 }, bar, { cost: { total: 5 } }).budget_status === 'none', 'no cost from the price table, or no budget: no verdict on money');
    const fig = OS.optionFigure([bar, mid, tight]);
    const polys = [...fig.matchAll(/<polygon points="([^"]+)"/g)].map((m) => m[1].split(' ').map((p) => p.split(',').map(Number)));
    const wd = (p) => Math.max(...p.map((q) => q[0])) - Math.min(...p.map((q) => q[0]));
    ok(polys.length === 3 && near(wd(polys[0]) / wd(polys[1]), 2, 0.01) && near(wd(polys[0]) / wd(polys[2]), 2.5, 0.01) && /data-option="gBar"/.test(fig) && fig.includes('600 m²'), 'the picture draws every option on ONE scale: 20 m is twice 10 m and 2.5 times 8 m, each with its name and gross area');
    ok(OS.optionFigure([]) === '' && !/<script/.test(OS.optionFigure([{ ...bar, option: '<script>x</script>' }])), 'no options: no picture; a name is escaped');

    // in a real model: two massing options, a layout kept with one of them
    let S = await fresh('Options house');
    const [L1] = OPS.snapshotModel(S.ed).levels;
    S.ed.modelChange(MO.addMassOption({ set: 'Scheme', name: 'Bar', pts: boxPts(20000, 10000), floors: 3, floorHeight: 3200 }));
    S.ed.modelChange(MO.addMassOption({ set: 'Scheme', name: 'Tight', pts: boxPts(8000, 5000), floors: 1, floorHeight: 3200 }));
    const sets = MO.readOptionSets(W(S)); 
    const barO = sets[0].options.find((o) => o.option === 'Bar'), tightO = sets[0].options.find((o) => o.option === 'Tight');
    ok(sets.length === 1 && sets[0].options.length === 2 && near(barO.footprint_m2, 200, 0.01) && near(tightO.footprint_m2, 40, 0.01), 'two massing options in one model: 200 m2 x 3 floors and 40 m2 x 1');
    ok(OS.readLayouts(W(S)).size === 0, 'no layout until one is made');
    ok(throws(() => OS.layoutOp(barO.guid, { rooms: [] })(S.ed)) === 'options.err.nobrief', 'a layout with no brief is refused');
    S.ed.modelChange(BR_start(S));
    function BR_start(X) { return BR.startBriefOp({ fields: { budget: 100000, efficiency: 0.8 }, rooms: brief.rooms }); }
    const bf = BR.readBrief(W(S));
    S.ed.modelChange(OS.layoutOp(barO.guid, bf)); S.ed.modelChange(OS.layoutOp(tightO.guid, bf));
    let lay = OS.readLayouts(W(S));
    ok(lay.size === 2 && lay.get(barO.guid).floors[0].net_m2 === 82 && lay.get(tightO.guid).unplaced.length === 3, 'the layouts are kept with their options', [lay.size, JSON.stringify(lay.get(barO.guid)), JSON.stringify(lay.get(tightO.guid))]);
    S = await again(S);
    lay = OS.readLayouts(W(S));
    ok(lay.size === 2 && lay.get(tightO.guid).placed_m2 === 30, 'save and reopen keeps them');
    S.ed.modelChange(MO.addMassOption({ set: 'Scheme', name: 'Third', pts: boxPts(10000, 10000), floors: 2, floorHeight: 3200 }));
    const thirdO = MO.readOptionSets(W(S))[0].options.find((o) => o.option === 'Third');
    S.ed.modelChange(OS.layoutOp(thirdO.guid, BR.readBrief(W(S))));
    ok(OS.readLayouts(W(S)).size === 3 && OS.readLayouts(W(S)).get(thirdO.guid).floors[1].net_m2 === 6, 'a third option: 80 m2 a floor, the bath goes up to floor 2 (hand-worked above)');
    S.ed.undo();
    ok(OS.readLayouts(W(S)).size === 2, 'Undo takes the last layout off');
    const cmp = OS.compareToBrief(BR.readBrief(W(S)), MO.readOptionSets(W(S)), { costs: new Map([[barO.guid, { total: 90000 }]]), layouts: OS.readLayouts(W(S)) });
    ok(cmp[0].options.find((o) => o.option === 'Bar').fit.budget_status === 'under' && cmp[0].options.find((o) => o.option === 'Tight').fit.fits === false, 'compared against the brief in the real model: Bar under budget, Tight does not fit');
    void L1;
  }

  // ============================================================================================================================ TYPES
  if (want('--types')) {
    console.log('== BK.110 / BK.111 specifications and details on types');
    ok(JSON.stringify(TL.statedSizes('Studs 140 mm, height 2.4 m, board 12,5 mm, 5 cm lap, 100mmm')) === JSON.stringify([140, 2400, 12.5, 50]) && TL.statedSizes('no sizes') .length === 0, 'sizes in the text: 140 mm, 2.4 m, 12,5 mm, 5 cm (a word run on after "mm" is not a size)');
    let S = await fresh('Types house');
    const [L1] = OPS.snapshotModel(S.ed).levels;
    box(S, L1, 0, 0, 6000, 4000);
    const wall = OPS.snapshotModel(S.ed).walls[0];
    S.ed.modelChange(OPS.placeOpening({ wall: wall.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
    const fmt = { t, fmtLen: (mm) => Math.round(mm) + ' mm', fmtArea: (m2) => m2.toFixed(1) + ' m2' };
    let sections = SPEC.specSections(W(S), OPS.snapshotModel(S.ed), fmt);
    const wsec = sections.find((s) => s.group === 'wall'), dsec = sections.find((s) => s.group === 'door');
    ok(wsec && dsec && wsec.inUse && !wsec.text, 'the model has a wall type and a door type in use, with no specification text', sections.map((s) => s.id));
    const thick = Math.round(wall.t);
    const sheets0 = V.readSheets(W(S));
    let ag = TL.typeAgreement({ sections, links: {}, sheets: sheets0, roofs: [] });
    const codes = (id) => ag.rows.find((r) => r.id === id).findings.join();
    ok(codes(wsec.id).includes('spec.missing') && codes(wsec.id).includes('detail.missing') && codes(wsec.id).includes('spec.schedule') && codes(dsec.id).includes('spec.missing') && codes(dsec.id).includes('spec.schedule') && !codes(dsec.id).includes('detail.missing'), 'no text: spec.missing; no schedule sheet: spec.schedule; a wall without a detail: detail.missing (a door type is not asked for one)', ag.rows.map((r) => r.id + ':' + r.findings));
    // text that states the thickness the model has, and a size it does not
    S.ed.modelChange(SPEC.saveSpecTextsOp({ [wsec.id]: 'Timber studs ' + thick + ' mm deep at 400 mm centres.' }));
    sections = SPEC.specSections(W(S), OPS.snapshotModel(S.ed), fmt);
    ag = TL.typeAgreement({ sections, links: {}, sheets: sheets0 });
    const sz = ag.findings.find((f) => f.code === 'spec.size' && f.type === wsec.id);
    ok(sz && sz.severity === 'warning' && sz.vars.sizes === '400' && !codes(wsec.id).includes('spec.missing'), 'the text states ' + thick + ' mm (the model has it) and 400 mm (no measure of the type has it): one spec.size warning naming 400', sz);
    S.ed.modelChange(SPEC.saveSpecTextsOp({ [wsec.id]: 'Timber studs ' + thick + ' mm deep.', 'wall:gone': 'Text for a type no longer drawn.' }));
    sections = SPEC.specSections(W(S), OPS.snapshotModel(S.ed), fmt);
    ag = TL.typeAgreement({ sections, links: {}, sheets: sheets0 });
    ok(!ag.findings.some((f) => f.code === 'spec.size') && ag.findings.some((f) => f.code === 'spec.orphan' && f.type === 'wall:gone'), 'with only the model\'s thickness there is no size warning; text for a type that is gone is reported as an orphan');
    // schedule sheets
    S.ed.modelChange(V.saveSheet({ number: 'A-601', title: 'Door schedule', paper: 'a3', views: [{ kind: 'schedule', ref: 'doors', x: 200, y: 150, ratio: 0 }] }));
    ag = TL.typeAgreement({ sections, links: {}, sheets: V.readSheets(W(S)) });
    ok(!ag.rows.find((r) => r.id === dsec.id).findings.includes('spec.schedule') && ag.rows.find((r) => r.id === wsec.id).findings.includes('spec.schedule'), 'a sheet holding the door schedule satisfies the door types; the wall types still have none');
    // detail links
    ok(throws(() => TL.linkDetailOp({ type: 'nonsense', title: 'x', ref: 'y' })) === 'types.err.type' && throws(() => TL.linkDetailOp({ type: wsec.id, title: '', ref: 'y' })) === 'types.err.link' && throws(() => TL.linkDetailOp({ type: wsec.id, title: 'x' })) === 'types.err.link', 'a link with a bad type id, no title or no place is refused');
    S.ed.modelChange(TL.linkDetailOp({ type: wsec.id, app: 'detailcraft', title: 'Eaves detail', ref: 'eaves-01.dcraft', note: 'Wall to roof' }));
    S.ed.modelChange(TL.linkDetailOp({ type: wsec.id, app: 'bimcraft', title: 'Section 3', sheet: 'A-999' }));
    let links = TL.readLinks(W(S));
    ok(links[wsec.id].length === 2 && links[wsec.id][0].app === 'detailcraft' && links[wsec.id][0].ref === 'eaves-01.dcraft', 'two details linked to the wall type');
    ag = TL.typeAgreement({ sections, links, sheets: V.readSheets(W(S)) });
    ok(!ag.rows.find((r) => r.id === wsec.id).findings.includes('detail.missing') && ag.rows.find((r) => r.id === wsec.id).findings.includes('detail.sheet') && ag.findings.find((f) => f.code === 'detail.sheet').vars.sheet === 'A-999', 'with details the wall is no longer "missing"; a link to sheet A-999, which the model does not have, is a warning');
    S = await again(S);
    links = TL.readLinks(W(S));
    ok(links[wsec.id]?.length === 2, 'save and reopen keeps the links');
    S.ed.modelChange(TL.unlinkDetailOp(wsec.id, links[wsec.id][1].id));
    ok(TL.readLinks(W(S))[wsec.id].length === 1, 'unlink removes one');
    S.ed.undo();
    ok(TL.readLinks(W(S))[wsec.id].length === 2, 'Undo brings it back');
    let e2 = null; try { S.ed.modelChange(TL.unlinkDetailOp(wsec.id, 'nope')); } catch (e) { e2 = e.key; }
    ok(e2 === 'types.err.gone', 'unlinking something that is not there is refused');
    const pr = TL.typeProblems(ag, { t });
    ok(pr.length === ag.findings.length && pr.every((p) => p.source.name === 'bimcraft.stages' && ['note', 'warning'].includes(p.severity) && p.text && !/^types\.p\./.test(p.text)), 'every finding is a Problems item with words (no bare key)', pr.find((p) => /^types\.p\./.test(p.text)));
    ag = TL.typeAgreement({ sections, links, sheets: V.readSheets(W(S)), roofs: [{ typeKey: 'gable-30' }] });
    ok(ag.rows.some((r) => r.id === 'roof:gable-30' && r.findings.includes('detail.missing')), 'a roof type in use is asked for a detail too');
    const md = TL.typeMarkdown(ag, sections, { t });
    ok(md.includes('Eaves detail') && md.includes('eaves-01.dcraft') && md.includes('Timber studs'), 'the Markdown gives each type its text and the details to look at');
  }

  // ============================================================================================================================ RECORDS
  if (want('--records')) {
    console.log('== BK.113 / BK.178 shop drawings and site instructions');
    let S = await fresh('Records house');
    const [L1] = OPS.snapshotModel(S.ed).levels;
    box(S, L1, 0, 0, 6000, 4000);
    let snap = OPS.snapshotModel(S.ed);
    const [wA, wB, wC] = snap.walls.map((x) => x.guid);
    const markOf = (guid, pset) => { const w = W(S); return w.readPset(w.byGuid(guid), pset); };
    const hist = () => IS.readIssues(W(S));
    // the issue the records are against
    const issue = H.planIssue(H.emptyHistory(), { id: 'iA', date: '2026-03-02', purpose: 'construction', sheets: [{ id: 's1', number: 'A-101', title: 'Plan', hash: 'x' }] });
    S.ed.modelChange(IS.setHistoryOp(H.addIssue(H.emptyHistory(), issue)));

    console.log('-- shop drawings');
    ok(throws(() => RC.receiveShopDrawingOp({ title: '' })) === 'records.err.title' && throws(() => RC.reviewShopDrawingOp('x', { state: 'open' })) === 'records.err.state', 'no title, or "open" as a review result, is refused');
    const r1 = S.ed.modelChange(RC.receiveShopDrawingOp({ title: 'Steel shop drawings, frame', trade: 'Steel', due: '2026-04-01', by: 'Acme Steel', date: '2026-03-10', issue: 'iA', elements: [wA, wB, 'NOTAGUID', wA], sheets: ['A-101'], as: 'markup', file: { name: 'frame.pdf', bytes: 1234, sha256: 'ab'.repeat(32) } }));
    let rec = RC.readRecords(W(S), 'shop-drawing');
    ok(rec.length === 1 && rec[0].ref === 'SD-001' && rec[0].status === 'open' && rec[0].rev === 'A' && rec[0].elements.length === 2 && rec[0].extras.trade === 'Steel' && rec[0].extras.as === 'markup' && rec[0].file.name === 'frame.pdf' && rec[0].issue === 'iA', 'received: SD-001, revision A, open, two elements (a bad id and a repeat are left out), the trade and how it comes back', rec[0]);
    ok(markOf(wA, RC.SHOP_PSET).Status === 'open' && markOf(wA, RC.SHOP_PSET).Ref === 'SD-001' && markOf(wB, RC.SHOP_PSET).Rev === 'A' && markOf(wC, RC.SHOP_PSET) === null, 'both elements carry the state; the third has no set');
    ok(hist().records.length === 1 && hist().records[0].kind === 'shop-drawing', 'it is a record of the ONE issue history (the Issues panel reads the same)');
    ok(RC.waitingOn(hist(), RC.readExtras(W(S))).length === 2, 'two elements wait on a review');
    S.ed.modelChange(RC.reviewShopDrawingOp(r1.record, { state: 'revise', by: 'Architect', on: '2026-03-20', note: 'Add the base plates' }));
    rec = RC.readRecords(W(S), 'shop-drawing');
    ok(rec[0].status === 'revise' && rec[0].extras.reviews.length === 1 && rec[0].extras.reviews[0].rev === 'A' && rec[0].extras.reviews[0].note === 'Add the base plates' && markOf(wA, RC.SHOP_PSET).Status === 'revise' && markOf(wA, RC.SHOP_PSET).ReviewedBy === 'Architect' && markOf(wA, RC.SHOP_PSET).ReviewedOn === '2026-03-20', 'reviewed "revise and resubmit": the record, its review history and both elements say so');
    ok(RC.recordProblems(hist(), RC.readExtras(W(S)), { t, today: '2026-03-21' }).map((p) => p.code).join() === 'shop.revise', 'a Problems note while it is "revise" (no overdue warning: it is not open)');
    S.ed.modelChange(RC.resubmitShopDrawingOp(r1.record, { by: 'Acme Steel', date: '2026-03-25', file: { name: 'frame-B.pdf', bytes: 99, sha256: 'cd'.repeat(32) } }));
    rec = RC.readRecords(W(S), 'shop-drawing');
    ok(rec[0].rev === 'B' && rec[0].status === 'open' && rec[0].file.name === 'frame-B.pdf' && rec[0].extras.reviews.length === 1 && markOf(wB, RC.SHOP_PSET).Rev === 'B' && markOf(wB, RC.SHOP_PSET).Status === 'open', 'resubmitted: revision B of the same record, open again, the first review kept as history');
    ok(RC.recordProblems(hist(), RC.readExtras(W(S)), { t, today: '2026-04-02' }).map((p) => p.code).join() === 'shop.overdue', 'open past its due date (2026-04-01) on 2026-04-02: an overdue warning');
    S = await again(S);
    rec = RC.readRecords(W(S), 'shop-drawing');
    ok(rec[0].rev === 'B' && rec[0].extras.reviews.length === 1 && markOf(wA, RC.SHOP_PSET).Rev === 'B', 'save and reopen keeps record, review history and marks');
    S.ed.modelChange(RC.reviewShopDrawingOp(r1.record, { state: 'approved-as-noted', by: 'Architect', on: '2026-03-30', note: 'As marked' }));
    ok(markOf(wA, RC.SHOP_PSET).Status === 'approved-as-noted' && RC.waitingOn(hist(), RC.readExtras(W(S))).length === 0, 'approved as noted: nothing waits any more');
    let e = null; try { S.ed.modelChange(RC.resubmitShopDrawingOp(r1.record, {})); } catch (x) { e = x.key; }
    ok(e === null, 'an approved-as-noted drawing can still come back again (a revision after the notes); an approved one cannot');
    S.ed.modelChange(RC.reviewShopDrawingOp(r1.record, { state: 'approved', by: 'Architect', on: '2026-04-05' }));
    e = null; try { S.ed.modelChange(RC.resubmitShopDrawingOp(r1.record, {})); } catch (x) { e = x.key; }
    ok(e === 'records.err.settled', 'an approved drawing is settled: resubmitting is refused');
    // a second shop drawing over wall A: the newest record shows on the element
    const r2 = S.ed.modelChange(RC.receiveShopDrawingOp({ title: 'Cladding', trade: 'Facade', elements: [wA], date: '2026-04-06' }));
    ok(markOf(wA, RC.SHOP_PSET).Ref === 'SD-002' && markOf(wB, RC.SHOP_PSET).Ref === 'SD-001' && markOf(wA, RC.SHOP_PSET).Status === 'open', 'wall A now shows the newer SD-002 (open); wall B still SD-001');
    S.ed.modelChange(RC.removeRecordOp(r2.record));
    ok(markOf(wA, RC.SHOP_PSET).Ref === 'SD-001' && markOf(wA, RC.SHOP_PSET).Status === 'approved', 'removing SD-002 puts SD-001 back on wall A');
    S.ed.modelChange(RC.removeRecordOp(r1.record));
    ok(markOf(wA, RC.SHOP_PSET).Status === '' && markOf(wB, RC.SHOP_PSET).Ref === '' && hist().records.length === 0, 'removing the last drawing empties the marks and the history');
    S.ed.undo();
    ok(markOf(wB, RC.SHOP_PSET).Ref === 'SD-001' && hist().records.length === 1, 'Undo puts the record and the marks back in one step');

    console.log('-- site instructions');
    ok(throws(() => RC.recordInstructionOp({ title: 'x', cause: 'weather' })) === 'records.err.cause', 'an unknown cause is refused');
    const i1 = S.ed.modelChange(RC.recordInstructionOp({ title: 'Move the door 300 mm', cause: 'site', by: 'Site agent', date: '2026-05-02', elements: [wB, wC], cost: 'R 4 500', time: 'none', issue: 'iA', note: 'Drain found' }));
    const i2 = S.ed.modelChange(RC.recordInstructionOp({ title: 'Thicker wall', cause: 'design', date: '2026-05-10', elements: [wB], issue: 'iA' }));
    ok(i1.ref === 'SI-001' && i2.ref === 'SI-002' && i1.elements === 2, 'references count up by kind: SI-001, SI-002 (SD-001 is separate)');
    ok(markOf(wB, RC.SI_PSET).Refs === 'SI-002; SI-001' && markOf(wB, RC.SI_PSET).Latest === 'SI-002' && markOf(wB, RC.SI_PSET).Cause === 'design' && markOf(wC, RC.SI_PSET).Refs === 'SI-001', 'each element lists the instructions that change it, newest first');
    ok(RC.instructionsFor(hist(), RC.readExtras(W(S)), wB).map((r) => r.ref).sort().join() === 'SI-001,SI-002' && RC.readRecords(W(S), 'instruction')[0].extras.cost !== undefined, 'instructionsFor finds both for wall B');
    const changes = { elements: { changed: [{ guid: wB, props: true, shape: true }, { guid: wA, props: true, shape: false }], added: [wC], removed: [] } };
    const ex = RC.explainChanges(changes, hist(), RC.readExtras(W(S)), { issueId: 'iA' });
    ok(ex.counts.changed === 3 && ex.counts.explained === 2 && ex.counts.unexplained === 1 && ex.unexplained[0].guid === wA && ex.explained.find((x) => x.guid === wB).by.length === 2 && ex.explained.find((x) => x.guid === wC).how === 'added', 'of three elements that changed since issue A: B (two instructions) and C are explained; A changed with nothing recorded', ex);
    const later = RC.explainChanges({ elements: { changed: [{ guid: wA }], added: [], removed: [] } }, hist(), RC.readExtras(W(S)), { issueId: 'nope' });
    ok(later.counts.unexplained === 1, 'an unknown issue explains nothing');
    S.ed.modelChange(RC.setInstructionStatusOp(i1.record, 'closed', { by: 'PM', note: 'done' }));
    ok(markOf(wC, RC.SI_PSET).Refs === '' && markOf(wB, RC.SI_PSET).Refs === 'SI-002' && RC.readRecords(W(S), 'instruction').find((r) => r.ref === 'SI-001').status === 'closed', 'closing SI-001 takes it off the elements; SI-002 stays on wall B');
    S = await again(S);
    ok(markOf(wB, RC.SI_PSET).Refs === 'SI-002' && RC.readRecords(W(S), 'instruction').length === 2 && RC.readRecords(W(S), 'shop-drawing').length === 1, 'save and reopen keeps instructions, shop drawing and marks together');
    ok(H.cleanHistory(hist()).records.length === 3, 'the history stays valid for the shared Issues panel (3 records)');
  }

  console.log('stages-test: ' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}
