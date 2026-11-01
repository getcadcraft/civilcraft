/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --carbon` (0.8 round 2, EG.14 embodied carbon and EG.17 5D costs, session `energy_PART_2`): the factor table (strict rows,
 * CSV / JSON round trips, formula-cell guard, matching), the carbon engine against hand-worked figures, the price table, the spread of a task's cost over
 * its days and the cash-flow curve, stages and packages, planned vs built; then on a real IFC4 model (walls with layered materials and Qto volumes, a floor):
 * elements read with their quantities, the totals, a factor chosen for one element, the settings kept in the file (one undo step, reopened), the assistant
 * tools and both panes on a stand-in DOM. Every figure is worked by hand beside its test.
 */
import path from 'node:path';

export async function carbonMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const imp = (f) => import(path.join(APP, f));
  const CF = await imp('carbon-factors.js'), CB = await imp('carbon.js'), CC = await imp('carbon-calc.js'), C5 = await imp('cost5d.js'), D4 = await imp('ifc-4d.js');

  console.log('== EG.14 the factor table');
  {
    ok(CF.STARTER.length >= 15 && CF.STARTER.every((r) => r.checked === false && r.source === 'starter' && r.origin === 'starter'), 'the shipped rows are all starter values: source "starter", none checked');
    ok(/starter/i.test(CF.STARTER_LABEL) && /unverified/i.test(CF.STARTER_LABEL) && /not from any licensed database/i.test(CF.STARTER_LABEL), 'the label says starter, unverified, not from a licensed database');
    ok(Object.isFrozen(CF.STARTER), 'the starter table is frozen');
    const base = { id: 'x1', match: 'foam board|eps', basis: 'kg', density: 30, a1a3: 3.3 };
    ok(CF.cleanRow(base).row?.match.join() === 'foam board,eps', 'a good row: keywords split on |');
    const codes = (o) => CF.cleanRow({ ...base, ...o }).errors[0];
    ok(codes({ id: 'Bad Id!' }) === 'bad-id' && codes({ match: '' }) === 'match' && codes({ basis: 'lb' }) === 'basis' && codes({ density: 0 }) === 'density' && codes({ a1a3: 'abc' }) === 'a1a3' && codes({ a4: 'z' }) === 'a4' && codes({ a1a3: 1e9 }) === 'a1a3-range' && codes({ classes: 'wall' }) === 'classes',
      'strict: a bad id, no keyword, unknown basis, no density for kg, a non-number, an absurd figure and a bad class are refused with a code');
    ok(CF.cleanRow({ ...base, basis: 'm3', density: '' }).row?.density === null && CF.cleanRow({ ...base, a4: '' }).row?.a4 === null, 'm3 needs no density; an empty A4 stays empty (null), not zero');
    const m = CF.mergeTable([{ id: 'concrete', match: 'concrete', basis: 'm3', a1a3: 250, source: 'my EPD list', checked: true }, { id: 'hemp', match: 'hempcrete', basis: 'm3', a1a3: -40 }, { id: 'broken' }]);
    const conc = m.find((r) => r.id === 'concrete');
    ok(conc.a1a3 === 250 && conc.basis === 'm3' && conc.origin === 'edited' && conc.checked === true && m.find((r) => r.id === 'hemp')?.origin === 'yours' && !m.some((r) => r.id === 'broken') && m.length === CF.STARTER.length + 1,
      'the person\'s rows replace the starter row with the same id (edited), new ids are added (yours), a broken row is dropped');
    ok(CF.STARTER.find((r) => r.id === 'concrete').a1a3 === 0.12, 'the starter row itself is untouched by a merge');
    // CSV and JSON round trips, guard for formulas
    const rows = [{ ...CF.cleanRow(base).row, note: '=HYPERLINK("http://x","y"), with comma', source: '@src' }, ...CF.mergeTable([]).slice(0, 3).map((r) => CF.cleanRow(r).row)];
    const csv = CF.tableCsv(rows);
    ok(csv.includes("'=HYPERLINK") && csv.includes("'@src") && !/(^|,)=HYP/m.test(csv), 'CSV out: a text cell that starts with = + - @ gets a leading apostrophe');
    const back = CF.readTableCsv(csv);
    ok(back.errors.length === 0 && back.rows.length === 4 && back.rows[0].note === '=HYPERLINK("http://x","y"), with comma' && back.rows[0].source === '@src' && back.rows[0].a1a3 === 3.3 && back.rows[0].a4 === null, 'CSV round trip: same rows, the guard taken off again, a comma and quotes survive, empty A4 stays null');
    const js = CF.readTableJson(CF.tableJson(rows));
    ok(js.errors.length === 0 && js.rows.length === 4 && JSON.stringify(js.rows[1]) === JSON.stringify(rows[1]), 'JSON round trip: identical rows');
    ok(CF.readTableCsv('a,b\n1,2\n').errors[0].code === 'header' && CF.readTableCsv('').errors[0].code === 'empty' && CF.readTableJson('{').errors[0].code === 'json' && CF.readTableJson('{"format":"other"}').errors[0].code === 'format',
      'a CSV without the columns, an empty file, broken JSON and another format are refused with a code');
    const dup = CF.readTableCsv('id,match,basis,a1a3,density\nq,steel,m3,5,\nq,iron,m3,6,\nz,,m3,1,\n');
    ok(dup.rows.length === 1 && dup.errors.map((e) => e.code + '@' + e.line).join() === 'duplicate@3,match@4', 'a repeated id and a row with no keyword are refused with their line numbers', JSON.stringify(dup.errors));
    // matching
    const T = CF.mergeTable([]);
    const hit = (o) => CF.matchRow(T, o)?.id;
    ok(hit({ material: 'Plasterboard 12.5' }) === 'plasterboard' && hit({ material: 'plaster' }) === 'plaster', 'the longest keyword wins: "plasterboard" is not "plaster"');
    ok(hit({ material: 'Mineral wool insulation' }) === 'mineral-wool' && hit({ material: 'Clay bricks' }) === 'brick' && hit({ material: 'steps' }) === undefined, 'whole words only (a plural s is fine): "bricks" is brick, "steps" is not EPS');
    ok(hit({ material: '', name: 'Concrete slab 200' }) === 'concrete' && hit({ material: 'unobtainium', name: 'Concrete slab' }) === undefined, 'with no material the element\'s name is read; a named material that matches nothing is not rescued by the element\'s name (a Concrete wall\'s siding is not concrete)');
    const cls = [{ id: 'a', match: ['panel'], classes: ['IFCWALL'], basis: 'm2', a1a3: 1 }, { id: 'b', match: ['panel'], classes: [], basis: 'm2', a1a3: 2 }];
    ok(CF.matchRow(cls, { material: 'panel', cls: 'IFCWALLSTANDARDCASE' }).id === 'a' && CF.matchRow(cls, { material: 'panel', cls: 'IFCSLAB' }).id === 'b', 'a row limited to a class matches that class only (standard-case classes count)');
  }

  console.log('== EG.14 the engine (hand-worked)');
  {
    // 10 m³ of concrete, density 2400, 0.12 kgCO2e per kg: mass 24 000 kg, 24 000 × 0.12 = 2 880 kgCO2e
    const rows = CF.mergeTable([]);
    const item = (o) => ({ guid: 'g' + Math.random(), cls: 'IFCSLAB', name: 'Slab', storey: 'Level 1', parts: [{ material: 'Concrete', volume: 10 }], ...o });
    let r = CB.calcCarbon([item()], rows, {});
    ok(near(r.totals.mass, 24000, 1e-9) && near(r.totals.total, 2880, 1e-9) && near(r.totals.a1a3, 2880, 1e-9), '10 m³ concrete × 2400 kg/m³ × 0.12 = 24 000 kg and 2 880 kgCO2e', JSON.stringify(r.totals));
    // m3 basis: 288 per m³ gives the same
    const m3 = [{ id: 'c', match: ['concrete'], classes: [], basis: 'm3', density: 2400, a1a3: 288, a4: 5, a5: null, checked: true }];
    r = CB.calcCarbon([item()], m3, { modules: ['a1a3', 'a4', 'a5'], floorArea: 40 });
    ok(near(r.totals.total, 2930, 1e-9) && near(r.totals.a4, 50, 1e-9) && r.gaps.a5 === 1 && r.gaps.a4 === 0 && near(r.perM2, 73.25, 1e-9) && r.unchecked === 0, 'per m³ 288 + A4 5 on 10 m³ = 2 930; no A5 figure counts as a gap, not zero silently; 2 930 / 40 m² = 73.25 per m²', JSON.stringify(r.totals));
    r = CB.calcCarbon([item()], m3, { modules: ['a1a3'] });
    ok(near(r.totals.total, 2880, 1e-9) && r.totals.a4 === 0, 'only A1–A3 unless A4 is asked for');
    // other bases
    const bases = [{ id: 'm2', match: ['membrane'], classes: [], basis: 'm2', a1a3: 4, checked: true }, { id: 'm', match: ['pipe'], classes: [], basis: 'm', a1a3: 2.5, checked: true }, { id: 'it', match: ['door'], classes: [], basis: 'item', a1a3: 30, checked: true }];
    r = CB.calcCarbon([{ guid: '1', cls: 'X', name: 'a', parts: [{ material: 'membrane', area: 12 }] }, { guid: '2', cls: 'X', name: 'b', parts: [{ material: 'pipe', length: 8 }] }, { guid: '3', cls: 'X', name: 'c', parts: [{ material: 'door' }] }], bases, {});
    ok(near(r.totals.total, 48 + 20 + 30, 1e-9) && r.unchecked === 0, 'area × 4 = 48, length 8 m × 2.5 = 20, an item with no count counts 1 × 30: 98');
    // a part with no quantity, a part with no factor
    r = CB.calcCarbon([item({ guid: 'n', parts: [{ material: 'Concrete' }] }), item({ guid: 'u', parts: [{ material: 'unobtainium', volume: 1 }] }), item()], rows, {});
    ok(r.missing.length === 1 && r.missing[0].need === 'volume' && r.unmatched.length === 1 && r.unmatched[0].material === 'unobtainium' && r.rows.length === 1, 'a part with no volume and a part with no factor are listed, not counted');
    const pr = CB.carbonProblems(r);
    ok(pr.map((p) => p.code).join() === 'unmatched,noqty,unchecked' && pr.every((p) => p.source.name === 'bimcraft.carbon' && p.msg.key.startsWith('carbon.')) && pr[2].severity === 'note' && /unverified/.test(pr[2].text), 'Problems (rule 29): unmatched, no quantity, and a note that starter factors are unchecked — all from source bimcraft.carbon');
    // by material / class / storey add up to the total
    r = CB.calcCarbon([item(), item({ cls: 'IFCWALL', storey: 'Level 2', parts: [{ material: 'Brick', volume: 5 }, { material: 'Mineral wool', volume: 1 }] })], rows, {});
    const sumOf = (l) => l.reduce((s, g) => s + g.total, 0);
    ok(near(sumOf(r.byMaterial), r.totals.total, 1e-9) && near(sumOf(r.byClass), r.totals.total, 1e-9) && near(sumOf(r.byStorey), r.totals.total, 1e-9) && r.byMaterial.length === 3 && near(r.byMaterial.reduce((s, g) => s + g.pct, 0), 100, 1e-9), 'by material, class and storey each add up to the total; the percentages add up to 100');
    // brick 5 m³ × 1800 × 0.24 = 2160; mineral wool 1 × 40 × 1.2 = 48
    ok(near(r.byMaterial.find((g) => g.key === 'brick').total, 2160, 1e-9) && near(r.byMaterial.find((g) => g.key === 'mineral-wool').total, 48, 1e-9), 'brick 5 m³ × 1800 × 0.24 = 2 160; mineral wool 1 m³ × 40 × 1.2 = 48');
    // a chosen factor beats the material name
    r = CB.calcCarbon([item({ factorId: 'brick' })], rows, {});
    ok(near(r.totals.total, 10 * 1800 * 0.24, 1e-9), 'an element\'s chosen factor row (brick) is used whatever the material says');
    // takeoff lines
    const L = CB.itemsFromLines([{ name: 'Slab concrete', qty: 1, unit: 'CY' }, { name: 'Roof membrane', qty: 100, unit: 'sf', cls: '' }, { name: 'Steel beam', qty: 2, unit: 't' }, { name: 'Odd', qty: 3, unit: 'furlong' }, { name: '', qty: 1, unit: 'm' }]);
    ok(L.items.length === 3 && L.skipped.length === 2, 'takeoff lines: units cy, sf, t read; an unknown unit and a nameless line are skipped');
    r = CB.calcCarbon(L.items, rows, {});
    ok(near(r.rows.find((x) => x.name === 'Slab concrete').total, 0.764554858 * 2400 * 0.12, 1e-6) && near(r.rows.find((x) => x.name === 'Steel beam').total, 2000 * 1.7, 1e-9) && r.missing.length === 1 && r.missing[0].factor === 'bitumen' && r.missing[0].need === 'volume',
      '1 cubic yard concrete = 0.7646 m³ × 2400 × 0.12; 2 tonnes steel = 2 000 kg × 1.7; a membrane line priced per volume has no volume (listed as missing)', JSON.stringify(r.missing));
    const csv = CB.carbonCsv(CB.calcCarbon([item({ name: '=cmd|x' })], rows, {}));
    ok(csv.includes("'=cmd|x") && /^guid,name,class/.test(csv) && /total,,,,,,,,24000/.test(csv), 'the result CSV guards formula-looking names and ends in a total row');
  }

  console.log('== EG.17 the price table');
  {
    const base = { id: 'conc', match: 'concrete', unit: 'm3', mat: 150, lab: 40, waste: 0.05 };
    ok(C5.cleanPriceRow(base).row?.unit === 'm3', 'a good price row');
    const e = (o) => C5.cleanPriceRow({ ...base, ...o }).errors[0];
    ok(e({ unit: 'yd' }) === 'unit' && e({ mat: -1 }) === 'mat' && e({ waste: 9 }) === 'waste' && e({ mat: 0, lab: 0 }) === 'noprice' && e({ unit: 'kg' }) === 'density' && e({ id: 'A B' }) === 'bad-id' && e({ match: '' }) === 'match', 'refused: an unknown unit, a negative price, waste over 500 %, no price at all, kg with no density, a bad id, no keyword');
    const csv = C5.priceCsv([{ ...C5.cleanPriceRow(base).row, note: '=1+1', source: '+x' }]);
    const back = C5.readPriceCsv(csv);
    ok(csv.includes("'=1+1") && back.rows[0].note === '=1+1' && back.rows[0].mat === 150 && back.rows[0].waste === 0.05 && back.errors.length === 0, 'price CSV round trip with the formula guard');
    ok(C5.readPriceJson(C5.priceJson(back.rows)).rows[0].lab === 40 && C5.readPriceJson('[').errors[0].code === 'json' && C5.readPriceCsv('x,y\n').errors[0].code === 'header', 'price JSON round trip; broken input refused with a code');
    // TakeoffCraft rates: integers in ten-thousandths of a dollar, waste in ten-thousandths
    const tk = C5.fromTakeoff({ format: 'takeoffcraft-project', items: { a: { name: 'Roof shingles', type: 'area', mat: 125000, lab: 40000, waste: 1000 }, b: { name: 'Door', type: 'count', mat: 3000000, lab: 0 }, c: { name: 'No rate', type: 'area', mat: 0, lab: 0 } } });
    ok(tk.rows.length === 2 && tk.rows[0].mat === 12.5 && tk.rows[0].lab === 4 && tk.rows[0].waste === 0.1 && tk.rows[0].unit === 'sf' && tk.rows[1].unit === 'item' && tk.rows[1].mat === 300 && tk.skipped.length === 1, 'TakeoffCraft rates import: 125000 = $12.50, waste 1000 = 10 %, area → sf, count → item; an item with no rate is skipped');
    // priceItems: 10 m³ concrete: material 10 × 1.05 × 150 = 1575, labour 10 × 40 = 400
    const rows = [C5.cleanPriceRow(base).row, C5.cleanPriceRow({ id: 'brick', match: 'brick', unit: 'sf', mat: 2, lab: 3 }).row];
    const p = C5.priceItems([{ id: 7, guid: 'a', cls: 'IFCSLAB', name: 'S', parts: [{ material: 'Concrete', volume: 10 }] }, { id: 8, guid: 'b', cls: 'IFCWALL', name: 'W', parts: [{ material: 'Brick', area: 10 }] }, { id: 9, guid: 'c', cls: 'IFCWALL', name: 'X', parts: [{ material: 'Glass', area: 1 }] }, { id: 10, guid: 'd', cls: 'IFCSLAB', name: 'Y', parts: [{ material: 'Concrete' }] }], rows);
    ok(near(p.byId.get(7), 1975, 1e-9) && near(p.lines[0].mat, 1575, 1e-9) && near(p.lines[0].lab, 400, 1e-9), '10 m³ × 1.05 × $150 + 10 × $40 = $1 975 (waste on the material only)');
    ok(near(p.byId.get(8), (10 / 0.09290304) * 5, 1e-2) && p.unpriced.length === 2 && p.unpriced.find((u) => u.why === 'noqty') && p.unpriced.find((u) => u.why === 'noprice'), '10 m² priced per square foot = 107.64 sf × ($2 + $3); a part with no price and a part with no quantity are listed apart');
  }

  console.log('== EG.17 tasks, the spread and the curve');
  {
    const day = (s) => D4.parseDay(s);
    const task = (o) => ({ name: 't', start: day('2026-11-02'), finish: day('2026-11-05'), cents: 1200000, ...o });
    const sum = (a) => a.reduce((s, x) => s + x.cents, 0);
    const ev = C5.spread(task(), 'even');
    ok(ev.length === 4 && ev.every((s) => s.cents === 300000) && ev[0].day === day('2026-11-02'), '$12 000 over 4 days, evenly: $3 000 a day');
    ok(C5.spread(task(), 'front').map((s) => s.cents).join() === '480000,360000,240000,120000' && C5.spread(task(), 'back').map((s) => s.cents).join() === '120000,240000,360000,480000', 'front-loaded 4:3:2:1 = $4 800, $3 600, $2 400, $1 200; back-loaded the reverse');
    ok(['even', 'front', 'back', 'bell'].every((p) => sum(C5.spread(task({ cents: 10001, finish: day('2026-11-04') }), p)) === 10001), 'every profile adds up to the task to the cent ($100.01 over 3 days)');
    ok(C5.spread(task({ cents: 10001, finish: day('2026-11-04') }), 'even').map((s) => s.cents).join() === '3334,3334,3333' && C5.spread(task({ finish: day('2026-11-02') }), 'bell').length === 1, '$100.01 over 3 days: 3334 + 3334 + 3333 cents (largest remainder); a one-day task is one day');
    // cash flow
    const t1 = task({ name: 'a' }), t2 = task({ name: 'b', start: day('2026-11-09'), finish: day('2026-11-10'), cents: 50000 });
    const flowDay = C5.cashFlow([t1, t2], { per: 'day' });
    ok(flowDay.points.length === 9 && flowDay.total === 12500 && flowDay.points.at(-1).cum === 12500 && flowDay.points[0].cum === 3000 && flowDay.points[4].cost === 0, 'daily curve: 9 days from Nov 2 to Nov 10 (a gap of no spending), ends at the total $12 500');
    const flowWeek = C5.cashFlow([t1, t2], { per: 'week' });
    ok(flowWeek.points.length === 2 && flowWeek.points[0].label === '2026-11-02' && flowWeek.points[0].cost === 12000 && flowWeek.points[1].cost === 500 && flowWeek.points[1].cum === 12500, 'weekly curve: weeks start on Monday (Nov 2 and Nov 9): $12 000 then $500', JSON.stringify(flowWeek.points));
    const flowMonth = C5.cashFlow([task({ start: day('2026-10-30'), finish: day('2026-11-02'), cents: 400000 })], { per: 'month' });
    ok(flowMonth.points.map((p) => p.label + ':' + p.cost).join() === '2026-10:2000,2026-11:2000' && flowMonth.total === 4000, 'monthly curve splits a task across the month end: Oct 30–31 and Nov 1–2, $2 000 each');
    ok(C5.cashFlow([], {}).points.length === 0, 'no tasks: an empty curve');
    // tasks from matched: an element in two tasks is split evenly
    const matched = [{ name: 'Walls', stage: 'Shell', package: 'Envelope', start: day('2026-11-02'), finish: day('2026-11-06'), keys: [101, 102] }, { name: 'Roof', stage: 'Shell', package: 'Roof', start: day('2026-11-09'), finish: day('2026-11-10'), keys: [102, 103] }, { name: 'Fit-out', stage: 'Interior', package: '', start: day('2026-11-16'), finish: day('2026-11-20'), keys: [104] }];
    const byKey = new Map([[101, 1000], [102, 2000], [103, 500.5], [104, 700], [999, 123.45]]);
    const tc = C5.taskCosts(matched, byKey);
    ok(tc.tasks.map((x) => x.cost).join() === '2000,1500.5,700' && near(tc.scheduled, 4200.5, 1e-9) && near(tc.unscheduled, 123.45, 1e-9), 'element 102 ($2 000) is in two tasks: $1 000 in each; walls 1000 + 1000 = $2 000, roof 1000 + 500.50 = $1 500.50, fit-out $700; $123.45 priced but in no task', JSON.stringify(tc.tasks.map((x) => x.cost)));
    const groups = C5.byGroup(tc.tasks);
    ok(groups.map((g) => g.kind + ':' + g.name + ':' + g.cost).join() === 'stage:Shell:3500.5,package:Envelope:2000,package:Roof:1500.5,stage:Interior:700', 'cost by stage and package (the stage first, its packages after)', groups.map((g) => g.kind + ':' + g.name + ':' + g.cost).join());
    // parsed from the CSV the 4D tab reads
    const pt = D4.parseTasks('Task,Start,Finish,Field,Value,Stage,Package\nFoundation,2026-11-02,2026-11-04,Class,IfcSlab,Substructure,Base\nWalls,2026-11-05,2026-11-06,Class,IfcWall,Shell,Walls\n');
    ok(pt.errors.length === 0 && C5.byGroup(C5.taskCosts(pt.tasks.map((t, i) => ({ ...t, keys: [i + 1] })), new Map([[1, 90], [2, 10]])).tasks).filter((g) => g.kind === 'stage').map((g) => g.name + g.cost).join() === 'Substructure90,Shell10', 'tasks parsed from the 4D CSV (Stage and Package columns) group their costs');
    // planned vs built
    const tt = tc.tasks;
    const at = C5.valueAt(tt, day('2026-11-05'), {});
    ok(near(at.planned, 1600, 1e-9) && near(at.built, 0, 1e-9) && near(at.running, 2000, 1e-9) && near(at.remaining, 2200.5, 1e-9), 'on Nov 5 (day 4 of 5 for the walls, even): planned to date $1 600, nothing finished, $2 000 running, $2 200.50 not started', JSON.stringify(at));
    const late = C5.valueAt(tt, day('2026-11-12'), { progress: { Walls: 1, Roof: 0.5 } });
    ok(near(late.built, 3500.5, 1e-9) && near(late.planned, 3500.5, 1e-9) && near(late.earned, 2000 + 750.25, 1e-9) && late.running === 0 && near(late.remaining, 700, 1e-9), 'on Nov 12: walls and roof finished ($3 500.50 built = planned); with progress typed (walls 100 %, roof 50 %) the earned value is $2 750.25');
    const all = C5.calcCost5d([{ id: 1, guid: 'a', cls: 'IFCSLAB', name: 'S', parts: [{ material: 'Concrete', volume: 10 }] }], [C5.cleanPriceRow({ id: 'conc', match: 'concrete', unit: 'm3', mat: 150, lab: 40, waste: 0.05 }).row], [{ name: 'Slab', stage: '', package: '', start: day('2026-11-02'), finish: day('2026-11-05'), keys: [1] }], { keyBase: 0, per: 'day' });
    ok(near(all.grand, 1975, 1e-9) && all.flow.points.length === 4 && near(all.flow.points.at(-1).cum, 1975, 1e-9) && C5.costCsv(all).includes('Slab,2026-11-02,2026-11-05,1975.00'.replace('Slab,', ',,Slab,')), 'calcCost5d: one slab, $1 975 over 4 days, the curve ends at the total; the CSV names the task');
    const UI = await imp('cost5d-ui.js');
    const svg = UI.curveSvg(flowDay.points);
    ok(/^<svg /.test(svg) && (svg.match(/ /g) || []).length > 20 && svg.includes('<polyline') && svg.includes('12,500.00') && !/<script|onload/i.test(svg), 'the curve is an inline SVG (a polyline and bars, the total on the axis), no script');
  }

  // ------------------------------------------------------------------------------------------- on a real model
  console.log('== on an IFC4 model');
  const { ModelWriter } = await imp('model-write.js'), { IfcEditor } = await imp('ifc-edit.js'), OPS = await imp('model-ops.js'), NM = await imp('new-model.js');
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((x) => eng.load(x))(new TextEncoder().encode(NM.newBuilding({ name: 'Carbon', levels: NM.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-28T12:00:00Z') })));
  const ed = new IfcEditor(WebIFC, eng), w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const snap0 = OPS.snapshotModel(ed), A = snap0.levels[0].guid, B = snap0.levels[1].guid;
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }), { label: 'walls' });
  ed.modelChange(OPS.placeFloor({ storey: A, seed: [2000, 2000], mode: 'room', kind: 'concrete' }), { label: 'floor' });
  const items = CC.readElements(w());
  const walls = items.filter((x) => x.cls === 'IFCWALL' || x.cls === 'IFCWALLSTANDARDCASE');
  ok(walls.length === 4 && walls.every((x) => x.parts.length === 4 && x.qsource === 'qto' && x.storey === 'Level 1'), 'readElements: four walls, each with its four layers (Siding, OSB sheathing, Wood framing, Gypsum board), volume from its own Qto, on Level 1', JSON.stringify(items.map((x) => [x.cls, x.parts.length, x.qsource])));
  const wall = walls[0], vol = wall.parts.reduce((s, p) => s + p.volume, 0);
  const share = (m) => wall.parts.find((p) => p.material === m).volume / vol;
  ok(near(share('Wood framing'), 5.5 / 7.25, 1e-6) && near(share('OSB sheathing'), 0.5 / 7.25, 1e-6) && near(share('Siding'), 0.75 / 7.25, 1e-6), 'the volume splits by layer thickness: wood framing 5.5 in of 7.25 in = 75.9 %, OSB 6.9 %, siding 10.3 %');
  const floor = items.find((x) => x.cls === 'IFCSLAB' || /SLAB|COVERING/.test(x.cls));
  ok(!!floor && floor.parts[0].volume > 0 && /concrete/i.test(floor.parts[0].material), 'the floor slab has a volume and its concrete material', JSON.stringify(floor));
  ok(items.every((x) => x.id > 0 && x.guid && x.parts.every((p) => p.volume === undefined || p.volume >= 0)), 'every element carries its id and GlobalId');
  // geometry fallback: a mesh volume of a unit cube
  const cube = { positions: [0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1], indices: [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7] };
  ok(near(CC.meshVolume(cube.positions, cube.indices, 1000), 1, 1e-12) && near(CC.meshVolume(cube.positions, cube.indices, 1), 1e-9, 1e-18), 'the mesh volume of a unit cube is 1 m³ (file units in metres) and 1 mm³ in millimetres');
  const r = CC.calcCarbonModel(w(), { modules: ['a1a3'] });
  ok(r.ok && r.res.totals.total > 0 && r.res.rows.length > 4 && r.res.byStorey[0].key === 'Level 1', 'the model adds up: kgCO2e by storey', JSON.stringify(r.res.totals));
  const sidingRows = r.res.unmatched.filter((u) => u.material === 'Siding');
  ok(sidingRows.length === 4 && r.res.byMaterial.some((g) => g.key === 'timber') && r.res.byMaterial.some((g) => g.key === 'plywood') && r.res.byMaterial.some((g) => g.key === 'plasterboard') && r.res.byMaterial.some((g) => g.key === 'concrete'), 'siding has no starter factor (listed as unmatched in each wall); wood framing → timber, OSB → plywood, gypsum → plasterboard, the floor → concrete');
  // a hand check of one layer: wood framing volume × 500 kg/m³ × 0.45
  const studs = r.res.rows.find((x) => x.guid === wall.guid && x.material === 'Wood framing');
  ok(near(studs.total, wall.parts.find((p) => p.material === 'Wood framing').volume * 500 * 0.45, 1e-9) && near(studs.mass, wall.parts.find((p) => p.material === 'Wood framing').volume * 500, 1e-9), 'one layer by hand: wood framing volume × 500 kg/m³ × 0.45 kgCO2e/kg');
  const tot = CC.carbonTotal(w(), {});
  ok(near(tot.kg, r.res.totals.total, 1e-9) && tot.unmatched === 4 && tot.missing === 0, 'carbonTotal(w): the plain figure for the running totals matches the check', JSON.stringify(tot));
  const area = CC.floorAreaOf(w());
  ok(area > 0, 'the floor area is read from the spaces or floor slabs (' + area.toFixed(1) + ' m²)');
  // a factor for one element, one undo step
  const before = ed.undoStack?.length;
  ed.modelChange(CC.setElementFactor(wall.guid, 'timber'), { label: 'factor' });
  let r2 = CC.calcCarbonModel(w(), {});
  ok(r2.res.unmatched.filter((u) => u.material === 'Siding').length === 3 && r2.res.rows.filter((x) => x.guid === wall.guid).length === 4 && r2.items.find((x) => x.guid === wall.guid).factorId === 'timber', 'a chosen factor (timber) for one wall: its siding is counted now, the other three walls\' siding is still unmatched');
  ed.undo();
  ok(CC.calcCarbonModel(w(), {}).res.unmatched.filter((u) => u.material === 'Siding').length === 4 && (before === undefined || ed.undoStack.length === before), 'one undo step takes it back');
  // settings in the file
  const mine = { id: 'siding', match: 'siding', basis: 'm3', a1a3: 300, source: 'my list', checked: true };
  ed.modelChange(CC.setCarbonSettings({ rows: [mine], modules: ['a1a3', 'a4'], floorArea: 40 }), { label: 'carbon' });
  const s1 = CC.readSettings(w());
  ok(s1.user.length === 1 && s1.modules.join() === 'a1a3,a4' && s1.floorArea === 40 && s1.rows.find((x) => x.id === 'siding')?.origin === 'yours', 'the table, modules and floor area are kept in the file (IfcProject, CadCraft_CarbonFactors)');
  r2 = CC.calcCarbonModel(w(), {});
  ok(r2.res.unmatched.length === 0 && near(r2.floorArea, 40, 1e-12) && r2.res.modules.join() === 'a1a3,a4' && r2.res.gaps.a4 > 0, 'the check now uses them: siding is counted, the floor area is the typed 40 m², A4 is on (and its missing figures are counted as gaps)');
  let threw = '';
  try { CC.setCarbonSettings({ rows: [{ id: 'z', match: '', basis: 'm3', a1a3: 1 }] }); } catch (e) { threw = e.key; }
  ok(threw === 'carbon.err.row.match', 'a bad row refuses the whole change (nothing half-saved)');
  const bytes = await quiet(() => ed.save?.())();
  if (bytes) {
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((x) => eng2.load(x))(bytes);
    const ed2 = new IfcEditor(WebIFC, eng2);
    const s2 = CC.readSettings(new ModelWriter(WebIFC, ed2.api, ed2.mid));
    ok(s2.user.length === 1 && s2.user[0].id === 'siding' && s2.floorArea === 40, 'the saved IFC reopened: the table is still there');
  } else ok(true, '(save not available on this editor)');
  ed.undo();
  ok(CC.readSettings(w()).user.length === 0, 'one undo step removes the saved table');

  // 5D on the model
  const priceRows = [C5.cleanPriceRow({ id: 'stud', match: 'wood framing|osb sheathing|gypsum board', unit: 'm3', mat: 400, lab: 100, waste: 0.1 }).row, C5.cleanPriceRow({ id: 'slab', match: 'concrete', unit: 'm3', mat: 180, lab: 60 }).row];
  const items2 = CC.readElements(w());
  const day = (s) => D4.parseDay(s);
  const wallIds = items2.filter((x) => /WALL/.test(x.cls)).map((x) => x.id), floorId = items2.find((x) => /SLAB|COVERING/.test(x.cls)).id;
  const matched = [{ name: 'Floor', stage: 'Base', package: '', start: day('2026-11-02'), finish: day('2026-11-04'), keys: [floorId] }, { name: 'Walls', stage: 'Shell', package: '', start: day('2026-11-05'), finish: day('2026-11-10'), keys: wallIds }];
  const c5 = C5.calcCost5d(items2, priceRows, matched, { keyBase: 0, per: 'week' });
  const wallVol = items2.filter((x) => /WALL/.test(x.cls)).flatMap((x) => x.parts).filter((p) => /wood framing|osb sheathing|gypsum board/i.test(p.material)).reduce((s, p) => s + p.volume, 0);
  const floorVol = items2.find((x) => x.id === floorId).parts[0].volume;
  const expect = wallVol * (1.1 * 400 + 100) + floorVol * (180 + 60);
  ok(near(c5.grand, expect, 0.05 * 4) && c5.unscheduled === 0 && c5.tasks.length === 2 && near(c5.flow.points.at(-1).cum, c5.scheduled, 1e-6), 'the model priced by hand: walls (framing, OSB, gypsum) × (1.1 × 400 + 100) + floor × 240; the curve ends at the scheduled total', c5.grand + ' vs ' + expect);
  ok(c5.unpriced.filter((u) => u.material === 'Siding').length === 4, 'the siding has no price: listed as unpriced in each wall');
  const ct = C5.costTotal(w(), { rows: priceRows, matched, keyBase: 0 });
  ok(near(ct.cost, c5.grand, 1e-9) && ct.unpriced === 4, 'costTotal(w): the plain figure for the running totals matches');
  ed.modelChange(C5.setCostSettings({ rows: priceRows, profile: 'front' }), { label: 'prices' });
  const cs = C5.readCostSettings(w());
  ok(cs.rows.length === 2 && cs.profile === 'front' && cs.rows[0].mat === 400, 'the price table and the spread are kept in the file (CadCraft_Cost5D)');
  // EG.17 currency (bim-analysis_PART_4): optional; an older file has none and is shown in the shell's default, saying so
  ok(cs.currency === '' && cs.currencyDefaulted === true && cs.shownIn === C5.DEFAULT_CURRENCY, 'a table saved without a currency reads as none, shown in ' + C5.DEFAULT_CURRENCY + ' and marked defaulted');
  ok(C5.cleanCurrency(' eur ') === 'EUR' && C5.cleanCurrency('euro') === '' && C5.cleanCurrency('E1R') === '' && C5.cleanCurrency(undefined) === '', 'cleanCurrency: three letters, upper-cased, else none');
  ed.modelChange(C5.setCostSettings({ rows: priceRows, profile: 'front', currency: 'eur' }), { label: 'prices in euro' });
  const cs2 = C5.readCostSettings(w());
  ok(cs2.currency === 'EUR' && cs2.currencyDefaulted === false && cs2.shownIn === 'EUR' && cs2.rows.length === 2, 'a currency is kept in the file with the prices');
  let t3 = ''; try { C5.setCostSettings({ rows: priceRows, currency: 'euros' }); } catch (e) { t3 = e.key; }
  ok(t3 === 'cost5d.err.currency', 'a bad currency refuses the change');
  const pj = JSON.parse(C5.priceJson(priceRows, 'gbp'));
  ok(pj.currency === 'GBP' && C5.readPriceJson(C5.priceJson(priceRows, 'gbp')).currency === 'GBP' && C5.readPriceJson(C5.priceJson(priceRows)).currency === '' && !('currency' in JSON.parse(C5.priceJson(priceRows))), 'price JSON round trip carries the currency only when there is one; an old file reads as none');
  ok(C5.costCsv(c5, 'eur').split('\r\n')[0].endsWith('cost (EUR)') && C5.costCsv(c5).split('\r\n')[0] === 'stage,package,task,start,finish,cost', 'the cost CSV names the currency when it has one');
  ed.undo();
  let t2 = '';
  try { C5.setCostSettings({ rows: [{ id: 'q', match: 'x', unit: 'yd', mat: 1 }] }); } catch (e) { t2 = e.key; }
  ok(t2 === 'cost5d.err.row.unit', 'a bad price row refuses the whole change');
  ed.undo();
  ok(C5.readCostSettings(w()).rows.length === 0, 'one undo step removes the prices');

  // ------------------------------------------------------------------------------------------- assistant tools
  console.log('== the assistant tools');
  {
    const AG = await imp('carbon-agents.js'), AG5 = await imp('cost5d-agents.js');
    const env = { ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }), index: () => ({ keyBase: 0, fields: [], values: () => [] }), tasks: () => [] };
    const T = Object.fromEntries([...AG.carbonTools(env), ...AG5.cost5dTools(env)].map((x) => [x.name, x]));
    ok(Object.keys(T).sort().join() === 'carbon_check,carbon_factor_set,carbon_factors_get,carbon_factors_set,cost5d_check,cost5d_prices_get,cost5d_prices_set', 'seven tools: carbon_check, carbon_factors_get, carbon_factors_set, carbon_factor_set, cost5d_check, cost5d_prices_get, cost5d_prices_set');
    const CT = await import(path.join(APP, 'host.js'));
    ok(Object.values(T).every((x) => /^[a-z0-9]+_[a-z0-9_]+$/.test(x.name) && x.description.length < 700 && x.inputSchema.type === 'object' && x.inputSchema.additionalProperties === false && (x.group === 'read' || (x.group === 'edit' && x.rollbackPreview === true))), 'the contract: <area>_<verb> names, short descriptions, closed schemas, every edit has a rollback preview');
    const chk = T.carbon_check.run({});
    ok(chk.totalKgCO2e > 0 && /Starter values/.test(chk.factorsNote) && chk.unmatched.length === 4 && chk.byMaterial.length > 3 && chk.problems.some((p) => p.code === 'unchecked'), 'carbon_check: totals, by material, the unmatched siding, the starter-values note and the Problems');
    const get = T.carbon_factors_get.run({ format: 'csv' });
    ok(get.csv.startsWith('id,match,classes,basis') && /unverified/.test(get.label), 'carbon_factors_get: the table as CSV with its label');
    const set = await T.carbon_factors_set.run({ rows: [{ id: 'siding', match: ['siding'], basis: 'm3', a1a3: 300, source: 'owner list' }], modules: ['a1a3'] });
    ok(set.rows === 1 && T.carbon_check.run({}).unmatched.length === 0, 'carbon_factors_set: one row kept in the file; siding is counted');
    let e = null;
    try { await T.carbon_factors_set.run({ rows: [{ id: 'bad id', match: ['x'], basis: 'm3', a1a3: 1 }] }); } catch (x) { e = x; }
    ok(e?.code === 'invalid_argument' && e.next.length > 0, 'a bad row: invalid_argument with what to try next');
    e = null;
    try { await T.carbon_factor_set.run({ element: wall.guid, factor: 'nope' }); } catch (x) { e = x; }
    ok(e?.code === 'not_found', 'assigning an unknown factor row: not_found');
    await T.carbon_factor_set.run({ element: wall.guid, factor: 'brick' });
    ok(CC.readElements(w()).find((x) => x.guid === wall.guid).factorId === 'brick', 'carbon_factor_set: kept on the element');
    ed.undo(); ed.undo();
    e = null;
    try { T.cost5d_check.run({}); } catch (x) { e = x; }
    ok(e?.code === 'not_found' && /price table/.test(e.message), 'cost5d_check with no prices: not_found, says to set prices');
    await T.cost5d_prices_set.run({ rows: [{ id: 'conc', match: ['concrete'], unit: 'm3', mat: 150, lab: 40, waste: 0.05 }], profile: 'back' });
    ok(T.cost5d_prices_get.run({}).rows.length === 1 && T.cost5d_prices_get.run({}).profile === 'back', 'cost5d_prices_set / _get: the row and the profile are kept');
    e = null;
    try { T.cost5d_check.run({}); } catch (x) { e = x; }
    ok(e?.code === 'not_found' && /no tasks/i.test(e.message), 'cost5d_check with no 4D tasks: not_found, says to load a schedule');
    e = null;
    try { AG5.cost5dTools({ ed: () => ed, apply: env.apply }).find((x) => x.name === 'cost5d_check').run({}); } catch (x) { e = x; }
    ok(e?.code === 'unsupported', 'cost5d_check where the page has no 4D schedule: unsupported');
    ed.undo();   // the prices
    void CT;
  }

  // ------------------------------------------------------------------------------------------- the panes on a stand-in DOM
  console.log('== the panes');
  {
    class Node { constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.listeners = {}; this.className = ''; this.value = ''; this.innerHTML = ''; }
      setAttribute(k, v) { this.attrs[k] = v; } getAttribute(k) { return this.attrs[k]; } addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
      append(...k) { for (const c of k) this.children.push(typeof c === 'string' ? { text: c } : c); } replaceChildren(...k) { this.children = []; this.append(...k); }
      get textContent() { return this.children.map((c) => (c.text !== undefined ? c.text : c.textContent)).join(''); } }
    const doc = { createElement: (tag) => new Node(tag, doc) };
    const find = (n, pred, out = []) => { if (n.attrs && pred(n)) out.push(n); for (const c of n.children || []) if (c.attrs) find(c, pred, out); return out; };
    const click = async (n) => { for (const fn of n.listeners.click || []) await fn({}); await new Promise((r) => setTimeout(r, 0)); };
    const change = (n, v) => { n.value = v; for (const fn of n.listeners.change || []) fn({}); };
    const attr = (name, val) => (n) => (val === undefined ? n.attrs[name] !== undefined : n.attrs[name] === val);
    const UI = await imp('carbon-ui.js');
    const pane = new Node('div', doc), posted = [], saved = [];
    const ui = UI.mountCarbon(pane, { w: () => w(), apply: async (label, op) => ed.modelChange(op, { label }), problems: { source: () => ({ set: (l) => posted.push(l) }) }, save: (n, t) => saved.push([n, t]) });
    ok(/Starter values/.test(find(pane, attr('data-carbon-starter'))[0]?.textContent || '') && find(pane, attr('data-carbon-cell')).length > 50, 'the Carbon pane shows the starter-values label above the editable factor table');
    await click(find(pane, attr('data-carbon-check'))[0]);
    ok(find(pane, attr('data-carbon-result')).length === 1 && posted.at(-1).some((p) => p.source.name === 'bimcraft.carbon') && /siding|no factor/i.test(pane.textContent), 'Check: the result is drawn, the Problems are posted to the shell (source bimcraft.carbon), the unmatched parts are said', pane.textContent.slice(0, 300));
    change(find(pane, attr('data-carbon-cell', 'concrete.a1a3'))[0], '0.2');
    ok(ui.state.rows.find((x) => x.id === 'concrete').a1a3 === 0.2 && ui.state.rows.find((x) => x.id === 'concrete').origin === 'edited', 'editing a figure marks the row edited');
    await click(find(pane, attr('data-carbon-add'))[0]);
    ok(ui.state.rows.some((x) => x.origin === 'yours'), 'Add a row');
    await click(find(pane, attr('data-carbon-save'))[0]);
    ok(CC.readSettings(w()).user.map((x) => x.id).includes('concrete') && /Saved/.test(pane.textContent), 'Save table: the changed and added rows are kept in the file');
    ed.undo();
    await click(find(pane, attr('data-carbon-csv'))[0]);
    ok(saved.at(-1)[0] === 'carbon-factors.csv' && saved.at(-1)[1].includes('concrete'), 'Export table (CSV)');
    ui.state.paste = 'id,match,basis,density,a1a3\nstraw,straw bale,kg,100,-0.4\n';
    await click(find(pane, attr('data-carbon-import'))[0]);
    ok(ui.state.rows.find((x) => x.id === 'straw')?.a1a3 === -0.4, 'Import: a pasted CSV adds rows (a negative figure is allowed)');
    ui.state.paste = 'id,match\nx,y\n';
    await click(find(pane, attr('data-carbon-import'))[0]);
    ok(/Not imported/.test(pane.textContent), 'Import: a bad table is refused with a reason');
    // dec-eg_PART_3: a factor file from another source
    ui.state.paste = 'Material,Declared Unit,GWP total\nStructural steel,tonne,1700\n';
    ui.state.source = 'ICE-style file';
    await click(find(pane, attr('data-carbon-import-file'))[0]);
    const imported = ui.state.rows.find((r) => r.source === 'ICE-style file');
    ok(imported && imported.checked === false && Math.abs(imported.a1a3 - 1.7) < 1e-9 && /unreviewed/i.test(pane.textContent), 'Import a factor file: a per-tonne row lands as per kg, unchecked, named by its source, with the unreviewed label');
    // 5D pane
    const U5 = await imp('cost5d-ui.js');
    const pane5 = new Node('div', doc), saved5 = [];
    const walls5 = items2.filter((x) => /WALL/.test(x.cls)).map((x) => x.id);
    const tasks = [{ name: 'Floor', start: day('2026-11-02'), finish: day('2026-11-04'), stage: '', package: '', rows: [] }, { name: 'Walls', start: day('2026-11-05'), finish: day('2026-11-10'), stage: '', package: '', rows: [] }];
    const ix = { keyBase: 0, fields: [{ id: 'name' }], values: () => new Map(), keys: [] };
    const fake = { ...ix, values: (fid) => (fid === 'cls' ? new Map([[floorId, 'IfcSlab'], ...walls5.map((id) => [id, 'IfcWall'])]) : new Map()) };
    const ui5 = U5.mountCost5d(pane5, { w: () => w(), apply: async (label, op) => ed.modelChange(op, { label }), index: () => fake, tasks: () => tasks.map((t, i) => ({ ...t, rows: [{ field: 'Class', value: i ? 'IfcWall' : 'IfcSlab', line: i + 2 }] })), save: (n, t) => saved5.push([n, t]) });
    ok(find(pane5, attr('data-cost5d-none')).length === 1, 'the 5D pane with no prices says none are loaded (nothing is priced until you load prices)');
    ui5.state.paste = 'Description,Unit,Material,Labor\nConcrete slab,CY,145.5,62\n';
    await click(find(pane5, attr('data-cost5d-book'))[0]);
    ok(ui5.state.rows.length === 1 && ui5.state.rows[0].unit === 'cy' && ui5.state.rows[0].mat === 145.5 && /unreviewed/i.test(pane5.textContent), 'Import a cost book: a CSV export becomes price rows (CY → cy), labelled unreviewed');
    ui5.state.rows = [];
    await click(find(pane5, attr('data-cost5d-check'))[0]);
    ok(/Load prices first/.test(pane5.textContent), 'Check with no prices: says to load them');
    ui5.state.paste = 'id,match,classes,unit,mat,lab,waste\nconc,concrete,,m3,180,60,0\nstud,wood framing|osb sheathing|gypsum board,,m3,400,100,0.1\n';
    await click(find(pane5, attr('data-cost5d-import'))[0]);
    ui5.state.date = '2026-11-05';
    await click(find(pane5, attr('data-cost5d-check'))[0]);
    const res = find(pane5, attr('data-cost5d-result'))[0];
    ok(!!res && /Total: /.test(res.textContent) && find(pane5, attr('data-cost5d-curve'))[0].innerHTML.startsWith('<svg') && find(pane5, attr('data-cost5d-at')).length === 1, 'Check: the total, the curve as inline SVG, planned vs built on the typed date');
    ok(near(ui5.state.last.grand, c5.grand, 1e-6), 'the pane\'s total matches the engine\'s by hand-checked figure', ui5.state.last.grand + ' vs ' + c5.grand + ' ' + JSON.stringify(ui5.state.rows.map((r) => r.id)) + ui5.state.said);
    await click(find(pane5, attr('data-cost5d-save'))[0]);
    ok(C5.readCostSettings(w()).rows.length === 2, 'Save prices: kept in the file');
    ed.undo();
    await click(find(pane5, attr('data-cost5d-csv-result'))[0]);
    ok(saved5.at(-1)[0] === 'costs-5d.csv' && saved5.at(-1)[1].startsWith('stage,package,task'), 'Export costs (CSV)');
  }

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
