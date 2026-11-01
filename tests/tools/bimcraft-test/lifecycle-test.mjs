/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --lifecycle` (0.8 EG.45, session bim-sim_PART_2): the building over fifty years. Replacement years, costs, inflation and present
 * value worked by hand; then the parts of a drawn house and the assistant tool.
 */
import path from 'node:path';

export async function lifecycleMode({ APP, WebIFC, IfcModel, quiet }) {
  const L = await import(path.join(APP, 'lifecycle.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (v, want, tol) => Math.abs(v - want) <= tol;

  console.log('== replacement schedules by hand');
  const r = L.lifecycleRun([{ key: 'win', name: 'Windows', qty: 10, unit: 'each', life: 30, unitCost: 100 }, { key: 'paint', name: 'Paint', qty: 200, unit: 'm²', life: 8, unitCost: 5 },
    { key: 'tens', name: 'Ten-year thing', qty: 1, unit: 'each', life: 10, unitCost: 50 }, { key: 'roof', name: 'Old roof', qty: 100, unit: 'm²', life: 25, firstYear: -20, unitCost: 30 }, { key: 'forever', name: 'Lasts', qty: 1, unit: 'each', life: 60, unitCost: 1 }], { years: 50 });
  const R = Object.fromEntries(r.rows.map((x) => [x.key, x]));
  ok(R.win.years.join() === '30', 'a 30-year window in a 50-year study is replaced once, at year 30');
  ok(R.paint.years.join() === '8,16,24,32,40,48', 'paint every 8 years: 8, 16, 24, 32, 40, 48');
  ok(R.tens.years.join() === '10,20,30,40', 'every 10 years: 10, 20, 30, 40 (the end of the study, year 50, is not a replacement)');
  ok(R.roof.years.join() === '5,30', 'a roof already 20 years old with a 25-year life: replaced at 5 and 30');
  ok(R.forever.years.length === 0 && r.count === 1 + 6 + 4 + 2, 'a 60-year life is never replaced; ' + r.count + ' events in all');
  ok(near(R.win.cost, 1000, 1e-9) && near(R.paint.cost, 6 * 1000, 1e-9) && near(r.total, 1000 + 6000 + 200 + 6000, 1e-9), 'costs: windows 10 × 100 = 1000 once; paint 200 × 5 = 1000 six times; total ' + r.total);
  ok(r.byYear[30].cost === 1000 + 50 + 3000 && r.byYear[48].cost === 1000, 'year 30 has the window, a ten-year thing and the roof: ' + r.byYear[30].cost + '; year 48 has paint: ' + r.byYear[48].cost);
  ok(r.peak.year === 30, 'the dearest year is year 30');
  const infl = L.lifecycleRun([{ key: 'win', name: 'W', qty: 10, unit: 'each', life: 30, unitCost: 100 }], { years: 50, inflation: 0.02, discount: 0.03 });
  ok(near(infl.byYear[30].cost, 1000 * Math.pow(1.02, 30), 1e-6) && near(infl.byYear[30].pv, 1000 * Math.pow(1.02, 30) / Math.pow(1.03, 30), 1e-6), 'inflation 2 %, discount 3 %: year 30 costs 1000 × 1.02³⁰ = ' + infl.byYear[30].cost.toFixed(2) + ', worth ' + infl.byYear[30].pv.toFixed(2) + ' now');
  ok(near(infl.byYear[30].cum, infl.totalPv, 1e-9) && near(infl.byYear[50].cum, infl.totalPv, 1e-9), 'the running present value ends at the total');
  const none = L.lifecycleRun([{ key: 'a', name: 'A', qty: 5, unit: 'each', life: 20 }, { key: 'b', name: 'B', qty: 0, unit: 'each', life: 5, unitCost: 9 }], { years: 50 });
  ok(none.count === 2 && none.total === 0 && none.uncosted.join() === 'a' && none.peak === null, 'no cost typed: the years are still listed, the total is 0, and it says which have no cost (a); a zero quantity is never replaced');
  const csv = L.lifecycleCsv(r);
  ok(/^"component"/.test(csv) && /"Windows","10","each","30","100","30","1000"/.test(csv) && csv.split('\n').length > 10, 'a CSV of the components and the years');
  ok(L.lifecycleRun([], { years: 50 }).count === 0 && L.lifecycleRun([{ key: 'x', name: 'X', qty: 1, unit: 'e', life: 0, unitCost: 1 }]).count === 0, 'no components, or a zero life, replace nothing');

  console.log('== the parts of a drawn house');
  const N0 = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const ST = await import(path.join(APP, 'res-stair.js'));
  const LM = await import(path.join(APP, 'lifecycle-model.js'));
  const text = N0.newBuilding({ name: 'Life', levels: N0.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'l.ifc', now: new Date('2026-10-28T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A1, A2] = snap.levels.map((l) => l.guid), rect = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  for (const lv of [A1, A2]) ed.modelChange(OPS.drawWalls({ storey: lv, segs: rect.map((p, i) => ({ a: p, b: rect[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: A2, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A1, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: A2 }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((x) => x.storey === snap.levels[0].id && x.a[1] === 0 && x.b[1] === 0 && x.typeKey === 'ext-2x6'), inner = snap.walls.find((x) => x.typeKey === 'int-2x4');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: inner.guid, typeKey: 'door-single', offset: 3500, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-single-hung', offset: 5000, face: 'left' }));
  ed.modelChange(ST.placeStair({ level: A1, start: [5000, 800], angle: 90, kind: 'straight', turn: 'left', width: 1000, riserMax: 180, tread: 280, railings: 'both' }));
  const { parts } = LM.lifecycleParts(ed), P = Object.fromEntries(parts.map((x) => [x.key, x]));
  ok(near(P.windows.qty, 36 * 25.4 / 1000 * 48 * 25.4 / 1000, 0.01) && P['door-exterior'].qty === 1 && P['door-interior'].qty === 1 && P.stairs.qty === 1, 'one window of ' + P.windows.qty + ' m² (36 × 48 in), one outside door, one inside door, one stair');
  ok(near(P.roof.qty, 42.4, 3) && near(P['floor-finish'].qty, 18.54 * 2 + 37.2, 3), 'roof ' + P.roof.qty + ' m² (the footprint), floor finish ' + P['floor-finish'].qty + ' m² (two rooms of 18.5 m² below, one of 37 m² above)');
  ok(P['wall-exterior'].qty > 100 && P['wall-exterior'].qty < 160 && P['wall-paint'].qty > P['wall-exterior'].qty * 0.8, 'exterior wall ' + P['wall-exterior'].qty + ' m² net of openings; interior wall paint ' + P['wall-paint'].qty + ' m² (every room\'s walls)');
  ok(parts.every((x) => x.life === L.LIVES[x.key].years && x.unit === L.LIVES[x.key].unit), 'each part carries its default life and unit');
  const run = L.lifecycleRun(parts.map((x) => ({ ...x, unitCost: 10 })), { years: 50 });
  ok(run.count >= 8 && run.byYear[8].cost > 0, 'the house\'s parts give ' + run.count + ' replacements over 50 years; paint falls due at year 8');

  console.log('== EG.45 round 3: pipes, wiring and equipment, an equipment age, carbon per replacement');
  const MEP = await import(path.join(APP, 'mep-model.js'));
  const EL = await import(path.join(APP, 'res-elec.js'));
  const ASSETS = await import(path.join(APP, 'assets-bim.js'));
  const FM = await import(path.join(APP, 'furnish-model.js'));
  ed.modelChange(MEP.placeRun({ storey: A1, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1/2', points: [[0, 0, 2400], [10000, 0, 2400]], slope: 0 }));
  ed.modelChange(MEP.placeRun({ storey: A1, kind: 'duct', system: 'supply', shape: 'rect', w: 200, h: 150, flow: 0, points: [[0, 0, 2700], [6000, 0, 2700], [6000, 3000, 2700]] }));
  const snap2 = OPS.snapshotModel(ed), walls2 = snap2.walls.filter((x) => x.storey === snap2.levels[0].id).map((x) => ({ guid: x.guid, a: x.a, b: x.b, t: x.t }));
  const s1 = EL.wallSpot(walls2, [1000, 300]), s2 = EL.wallSpot(walls2, [5000, 300]);
  ed.modelChange(EL.placeDevice({ level: A1, kind: 'socket.double', units: 'ftin', ...s1, circuit: '1' }));
  ed.modelChange(EL.placeDevice({ level: A1, kind: 'socket.double', units: 'ftin', ...s2, circuit: '1' }));
  ed.modelChange(FM.furnishOp(A1, FM.furnishPlan(ed, { storey: A1, at: [2000, 2000], kind: 'bath' }).placements));
  const svc = LM.lifecycleServices(ed, { today: '2026-10-28' }), SP = Object.fromEntries(svc.parts.map((x) => [x.key, x]));
  ok(near(SP.pipe.qty, 10, 0.01) && SP.pipe.unit === 'm' && SP.pipe.life === L.LIVES.pipe.years, 'a 10 m pipe run: ' + SP.pipe.qty + ' m, life ' + SP.pipe.life + ' years');
  ok(near(SP.duct.qty, 9, 0.01), 'a duct run of two legs, 6 m + 3 m: ' + SP.duct.qty + ' m');
  const dx = Math.hypot(s2.at[0] - s1.at[0], s2.at[1] - s1.at[1]) / 1000;
  ok(SP.wiring && SP.wiring.estimate && near(SP.wiring.qty, dx * 1.25, 0.05), 'wiring is an estimate: the plan distance along the circuit × 1.25 (' + dx.toFixed(2) + ' m → ' + SP.wiring.qty + ' m), flagged as one');
  const eq = svc.parts.filter((x) => x.key.startsWith('eq:') || x.key.startsWith('asset:'));
  ok(eq.length > 0 && eq.every((x) => x.life > 0 && x.unit === 'each') && eq.some((x) => x.key === 'eq:IFCSANITARYTERMINAL' || x.cls === 'IFCSANITARYTERMINAL' || /^eq:/.test(x.key)), 'equipment the model holds is listed by class with the class\'s planning life (' + eq.map((x) => x.key + ' × ' + x.qty + ' @ ' + x.life + ' y').join(', ') + ')');
  const first = svc.parts.find((x) => x.guids && x.cls)?.guids[0];
  ed.modelChange(ASSETS.assetDataOp(first, { life: '10', installed: '2010-10-28' }));
  const svc2 = LM.lifecycleServices(ed, { today: '2026-10-28' }), old = svc2.parts.find((x) => x.key === 'asset:' + first);
  ok(old && old.life === 10 && near(old.firstYear, -16, 0.2) && old.qty === 1, 'an item with its own life (10 y) and a 2010 install date is its own part, 16 years old');
  const orun = L.lifecycleRun([old], { years: 50 });
  ok(orun.rows[0].years[0] === 0 && orun.rows[0].years[1] === 4 && orun.rows[0].years.length === 6, 'overdue by 6 years it is replaced now (year 0), then at 4, 14, 24, 34, 44: ' + orun.rows[0].years.join(', '));
  const withC = L.lifecycleRun([{ key: 'p', name: 'P', qty: 4, unit: 'm', life: 20, unitCarbon: 2.5 }, { key: 'q', name: 'Q', qty: 1, unit: 'each', life: 30 }], { years: 50 });
  ok(near(withC.totalCarbon, 4 * 2.5 * 2, 1e-9) && withC.byYear[20].carbon === 10 && withC.byYear[40].carbon === 10 && withC.nocarbon.join() === 'q' && /carbon/.test(L.lifecycleCsv(withC)), 'carbon per replacement: 4 m × 2.5 kg × two replacements = 20 kg; a part with no factor is listed (' + withC.nocarbon + ')');
  const cb = LM.lifecycleCarbon(ed, [...parts, ...svc.parts], { geometry: true });
  ok(cb.units instanceof Map && cb.units.size === parts.length + svc.parts.length && [...cb.units.values()].every((v) => v === null || v > 0), 'the model\'s carbon factors give a per-unit figure or none for every part (' + [...cb.units.values()].filter((v) => v !== null).length + ' with one; the rest have no factor and say so)');
  const CC = await import(path.join(APP, 'carbon-calc.js')), { ModelWriter: MW } = await import(path.join(APP, 'model-write.js'));
  const direct = CC.calcCarbonModel(new MW(ed.W, ed.api, ed.mid), { geometry: true }).res.rows;
  const doorKg = direct.filter((x) => x.cls === 'IFCDOOR').reduce((q, x) => q + x.total, 0), nDoors = parts.filter((x) => x.key.startsWith('door-')).reduce((q, x) => q + x.qty, 0);
  const dk = cb.units.get('door-exterior');
  ok(doorKg > 0 ? near(dk, doorKg / nDoors, 1e-9) : dk === null, 'a replaced door carries the model\'s doors\' carbon per door (' + (dk === null ? 'none' : dk.toFixed(2)) + ' kg, ' + doorKg.toFixed(2) + ' kg over ' + nDoors + ' doors by hand)');
  const allp = LM.lifecycleParts(ed).parts;
  ok(allp.some((x) => x.key === 'pipe') && allp.some((x) => x.key === 'windows') && !LM.lifecycleParts(ed, { mep: false }).parts.some((x) => x.key === 'pipe'), 'lifecycleParts adds the services to the building parts, and mep: false leaves them out');

  console.log('== the assistant tool');
  const SA = await import(path.join(APP, 'sim-agents.js'));
  const tool = SA.simTools({ ed: () => ed }).find((x) => x.name === 'lifecycle_run');
  const t1 = tool.run({ unitCosts: { 'wall-paint': 12, windows: 600 }, lives: { windows: 25 }, discountPct: 3 });
  ok(t1.parts.find((x) => x.key === 'windows').life === 25 && t1.parts.find((x) => x.key === 'windows').replacedInYears.join() === '25' && t1.totalCost > 0 && t1.presentValue < t1.totalCost && t1.uncosted.includes('roof'), 'lifecycle_run: a changed life (windows 25 y), costs for two parts, present value below the total, the rest listed as uncosted');
  ok(tool.group === 'read', 'read-only');

  console.log(`\nlifecycle: ${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
