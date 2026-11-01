/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --hazard` (0.8 EG.47, session bim-sim_PART_2): hazard playback. A flood through rooms on hand-worked levels, wind on storeys
 * worked from the pressure formula, and the earthquake model against closed-form answers: the eigenvalues of a shear building, the period a stiffness
 * is made for, a damped single-degree system driven at a frequency (steady amplitude), the decay of free vibration, base shear.
 */
import path from 'node:path';

export async function hazardMode({ APP, WebIFC, IfcModel, quiet }) {
  const H = await import(path.join(APP, 'hazard.js'));
  let bad = 0, good = 0;
  const ok = (cond, label) => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (v, want, tol) => Math.abs(v - want) <= tol;
  const rel = (v, want, f) => Math.abs(v - want) <= f * Math.abs(want);

  console.log('== flood: water rising through connected rooms');
  const rooms = [{ id: 'hall', name: 'Hall', floor: 0.3, area_m2: 20 }, { id: 'kitchen', name: 'Kitchen', floor: 0.3, area_m2: 15 }, { id: 'step', name: 'Step-up room', floor: 0.3, area_m2: 10 },
    { id: 'bed', name: 'Bedroom', floor: 3.3, area_m2: 14 }, { id: 'cellar', name: 'Sealed room', floor: 0.3, area_m2: 6 }, { id: 'sash', name: 'Window-only room', floor: 0.3, area_m2: 9 }];
  const openings = [{ id: 'front', a: 'hall', b: null, sill: 0 }, { id: 'h-k', a: 'hall', b: 'kitchen', sill: 0 }, { id: 'h-s', a: 'hall', b: 'step', sill: 0.3 },
    { id: 'stair', a: 'hall', b: 'bed', sill: 0 }, { id: 'win', a: 'sash', b: null, sill: 1.2 }];
  const fl = H.floodRun({ rooms, openings, hydrograph: [[0, 0], [2000, 2]], dt: 100 });
  const R = Object.fromEntries(fl.rooms.map((r) => [r.id, r]));
  ok(fl.ok && fl.times.length === 21 && near(fl.peak, 2, 1e-12), 'a 0 → 2 m rise over 2000 s, sampled every 100 s: ' + fl.times.length + ' samples, peak ' + fl.peak + ' m');
  ok(R.hall.firstWet === 400 && near(R.hall.maxDepth, 1.7, 1e-9), 'the hall (floor 0.3 m, open door): water passes 0.3 m at 300 s, first wet sample 400 s; deepest 2 − 0.3 = ' + R.hall.maxDepth + ' m');
  ok(R.kitchen.firstWet === R.hall.firstWet && R.kitchen.maxDepth === R.hall.maxDepth, 'the kitchen, joined by a door at floor level, stands at the same level at the same time');
  ok(R.step.firstWet === 700 && near(R.step.maxDepth, 1.7, 1e-9), 'a room behind a 0.3 m threshold waits until the water passes 0.6 m (first wet 700 s)');
  ok(R.bed.firstWet === null && R.cellar.firstWet === null, 'upstairs (floor 3.3 m) and the sealed room stay dry at a 2 m peak');
  ok(R.sash.firstWet === 1600 && near(R.sash.maxDepth, 1.7, 1e-9), 'a room with only a window: water enters when it passes the sill (0.3 + 1.2 = 1.5 m, at 1500 s; first wet sample 1600 s)');
  ok(fl.wetCount === 4, 'four rooms wet in all');
  const big = H.floodRun({ rooms, openings, hydrograph: [[0, 0], [3000, 4]], dt: 100 }), BR = Object.fromEntries(big.rooms.map((r) => [r.id, r]));
  ok(BR.bed.firstWet !== null && near(BR.bed.maxDepth, 0.7, 1e-9) && BR.cellar.firstWet === null, 'at a 4 m peak the stair carries the water up: the bedroom is wet to 0.7 m; the sealed room still dry');
  const rec = H.floodRun({ rooms, openings, hydrograph: [[0, 0], [1000, 2], [2000, 0]], dt: 100 });
  ok(rec.rooms[0].depth[10] > 0 && rec.rooms[0].depth[20] === 0 && rec.rooms[0].wetFor > 0, 'water that rises and falls leaves the hall dry again at the end (wet for ' + rec.rooms[0].wetFor + ' s)');
  ok(near(H.wallPush(1), 0.5 * 1000 * 9.80665, 1e-9) && H.wallPush(-1) === 0, 'push on a wall: ½ ρ g d² = ' + H.wallPush(1).toFixed(1) + ' N per metre at 1 m');
  ok(!H.floodRun({ rooms, openings, hydrograph: [[0, 1]] }).ok, 'a hydrograph with one point is refused');

  console.log('== wind on storeys');
  const one = H.windRun({ V10: 30, G: 1, storeys: [{ z: 10, h: 3, width: 10 }] });
  ok(near(one.storeys[0].q, 0.5 * 1.225 * 900, 1e-9) && near(one.storeys[0].force, 551.25 * 1.3 * 10 * 3, 1e-6), 'one storey at 10 m, 30 m/s: q = ½ ρ V² = ' + one.storeys[0].q.toFixed(2) + ' Pa; force q × 1.3 × 10 × 3 = ' + one.storeys[0].force.toFixed(1) + ' N');
  const three = H.windRun({ V10: 30, alpha: 0.2, G: 1.2, cpWind: 0.8, cpLee: 0.5, storeys: [{ z: 5, h: 3, width: 12 }, { z: 8, h: 3, width: 12 }, { z: 11, h: 3, width: 12 }] });
  const f = (z) => 0.5 * 1.225 * (30 * Math.pow(z / 10, 0.2)) ** 2 * 1.2 * 1.3 * 12 * 3;
  ok(near(three.storeys[0].force, f(5), 1e-6) && near(three.storeys[2].force, f(11), 1e-6) && three.storeys[2].force > three.storeys[0].force, 'forces rise with height by the power law: ' + three.storeys.map((s) => Math.round(s.force)).join(', ') + ' N');
  ok(near(three.base.shear, f(5) + f(8) + f(11), 1e-6) && near(three.base.moment, f(5) * 5 + f(8) * 8 + f(11) * 11, 1e-6), 'base shear = Σ forces = ' + Math.round(three.base.shear) + ' N; overturning moment = Σ force × height = ' + Math.round(three.base.moment) + ' N·m');
  ok(near(three.storeys[0].shear, three.base.shear, 1e-6) && near(three.storeys[2].shear, f(11), 1e-6), 'storey shear is the sum of the forces above it');
  ok(H.windRun({ V10: 0, storeys: [] }).ok === false, 'no wind speed, no run');

  console.log('== earthquake: a shear building against closed-form answers');
  const b2 = H.shearBuilding({ m: [1000, 1000], k: [1e6, 1e6] });
  const w2 = [(3 - Math.sqrt(5)) / 2 * 1000, (3 + Math.sqrt(5)) / 2 * 1000];
  ok(b2.modes.every((m, i) => near(m.omega ** 2, w2[i], 1e-6)), 'two equal floors: ω² = (k/m)(3 ∓ √5)/2 = ' + w2.map((v) => v.toFixed(2)).join(', ') + ' (' + b2.modes.map((m) => (m.omega ** 2).toFixed(2)).join(', ') + ')');
  const N = 5, b5 = H.shearBuilding({ m: new Array(N).fill(500), k: new Array(N).fill(2e6) });
  ok(b5.modes.every((m, j) => near(m.omega ** 2, (2e6 / 500) * (2 - 2 * Math.cos(((2 * j + 1) * Math.PI) / (2 * N + 1))), 1e-4)), 'five equal storeys: ω² = (k/m)(2 − 2 cos((2j−1)π/(2N+1))) for every mode');
  ok(near(b5.modes.reduce((s, m) => s + m.effMass, 0), b5.totalMass, 1e-6) && near(b5.modes[0].shape[N - 1], 1, 1e-12) && b5.modes[0].shape.every((x, i, a) => i === 0 || x > a[i - 1]), 'effective masses add up to the total mass; the first mode rises to the top');
  ok(Math.abs(b5.m.reduce((s, mi, i) => s + mi * b5.modes[0].shape[i] * b5.modes[1].shape[i], 0)) < 1e-6 * b5.totalMass, 'modes are mass-orthogonal');
  const mm = [2e5, 2e5, 2e5, 1.5e5], kk = H.uniformFor(mm, 0.5), bu = H.shearBuilding({ m: mm, k: mm.map(() => kk) });
  ok(near(bu.modes[0].period, 0.5, 1e-9), 'the stiffness made for a 0.5 s first period gives 0.5 s (k = ' + (kk / 1e6).toFixed(0) + ' MN/m)');
  const sd = H.shearBuilding({ m: [1000], k: [4e5] }), w = sd.modes[0].omega;
  const drive = (r, dt = 0.002, T = 40) => { const a = new Float64Array(Math.floor(T / dt)); for (let i = 0; i < a.length; i++) a[i] = Math.sin(r * w * i * dt); return H.quakeRun(sd, a, { dt, zeta: 0.05, keep: 1 }); };
  for (const r of [0.3, 0.8, 1.0]) {
    const q = drive(r), u = q.u[0];
    let mx = 0;
    for (let i = Math.floor(u.length * 0.6); i < u.length; i++) mx = Math.max(mx, Math.abs(u[i]));
    const want = (1 / (w * w)) / Math.sqrt((1 - r * r) ** 2 + (2 * 0.05 * r) ** 2);
    ok(rel(mx, want, 0.02), 'driven at ' + r + ' × the natural frequency, 5 % damping: steady amplitude ' + (mx * 1000).toFixed(3) + ' mm (closed form ' + (want * 1000).toFixed(3) + ' mm)');
  }
  const low = drive(0.1);
  ok(rel(low.peak.shear, 1000 * 1 / Math.sqrt((1 - 0.01) ** 2 + (0.01) ** 2), 0.05), 'a slow shake (0.1 × natural) puts base shear at m × a × 1.01 within 5 % (the start from rest adds a little) = ' + low.peak.shear.toFixed(1) + ' N');
  const pulse = H.groundMotion({ kind: 'ricker', pga: 3, duration: 30, dt: 0.005, f: 2 }), free = H.quakeRun(sd, pulse, { dt: 0.005, zeta: 0.05, keep: 1 }).u[0];
  const peaks = [];
  for (let i = Math.floor(8 / 0.005); i < free.length - 1; i++) if (free[i] > free[i - 1] && free[i] >= free[i + 1] && free[i] > 0) peaks.push(free[i]);
  const decay = Math.exp(-2 * Math.PI * 0.05 / Math.sqrt(1 - 0.05 ** 2));
  ok(peaks.length >= 5 && peaks.slice(1, 6).every((p, i) => rel(p / peaks[i], decay, 0.02)), 'free vibration after the pulse decays by ' + decay.toFixed(4) + ' a cycle (measured ' + peaks.slice(1, 4).map((p, i) => (p / peaks[i]).toFixed(4)).join(', ') + ')');
  ok(H.quakeRun(sd, new Float64Array(2000), { dt: 0.01 }).peak.top === 0, 'no ground motion, no response');
  ok(Math.max(...pulse.map(Math.abs)) === 3, 'a made record has exactly the peak acceleration asked for (3 m/s²)');
  const noise1 = H.groundMotion({ kind: 'noise', pga: 2, seed: 4 }), noise2 = H.groundMotion({ kind: 'noise', pga: 2, seed: 4 }), noise3 = H.groundMotion({ kind: 'noise', pga: 2, seed: 5 });
  ok(Buffer.compare(Buffer.from(noise1.buffer), Buffer.from(noise2.buffer)) === 0 && Buffer.compare(Buffer.from(noise1.buffer), Buffer.from(noise3.buffer)) !== 0 && Math.abs(Math.max(...noise1.map(Math.abs)) - 2) < 1e-12, 'filtered noise: same seed same record, peak 2 m/s²');
  const low1 = H.quakeRun(bu, H.groundMotion({ kind: 'ricker', pga: 2, duration: 20, dt: 0.005, f: 1 / 0.5 }), { dt: 0.005 }), high = H.quakeRun(bu, H.groundMotion({ kind: 'ricker', pga: 2, duration: 20, dt: 0.005, f: 10 }), { dt: 0.005 });
  ok(low1.peak.top > 3 * high.peak.top, 'a pulse near the building\'s own frequency shakes it far more than a fast one at the same peak (top ' + (low1.peak.top * 1000).toFixed(1) + ' vs ' + (high.peak.top * 1000).toFixed(1) + ' mm)');
  ok(low1.peak.drift.length === 4 && low1.peak.acc.every((x) => x > 0) && low1.u.length === 4 && low1.t.length === low1.u[0].length, 'drift and floor acceleration are reported per floor; the history is kept for playback');
  const sw = H.staticSway(b5, [0, 0, 0, 0, 1e4]);
  ok(sw.drift.every((d) => near(d, 1e4 / 2e6, 1e-12)) && near(sw.u[4], 5 * 1e4 / 2e6, 1e-12), 'a static push of 10 kN at the top: each storey drifts F/k = 5 mm, the top 25 mm');
  ok(!H.shearBuilding({ m: [1, 0], k: [1, 1] }).ok, 'a floor with no mass is refused');

  console.log('== climate scenarios: the person\'s own table (no data shipped)');
  const C = await import(path.join(APP, 'climate.js'));
  const csv = 'year,seaLevelRiseM,floodFactor\n2020,0,1\n2050,0.3,1.1\n2080,0.8,1.3\n';
  const ps = C.parseScenario(csv);
  ok(ps.ok && ps.scenario.rows.length === 3 && ps.scenario.rows[1].seaLevelRiseM === 0.3, 'a CSV with a header: three years read');
  const at = (y) => C.scenarioAt(ps.scenario, y);
  ok(near(at(2035).seaLevelRiseM, 0.15, 1e-12) && near(at(2035).floodFactor, 1.05, 1e-12) && at(2035).exact, 'between rows it is linear: 2035 is half way from 2020 to 2050 (0.15 m, ×1.05)');
  ok(at(2100).seaLevelRiseM === 0.8 && at(2100).exact === false && at(1990).seaLevelRiseM === 0 && at(1990).exact === false, 'past the last row it holds the last values and says it is not exact; it never extrapolates');
  ok(near(C.futureFlood(2, ps.scenario, 2050), 2 * 1.1 + 0.3, 1e-12), 'the flood for 2050: peak × factor + rise = 2 × 1.1 + 0.3 = 2.5 m');
  const js = C.parseScenario(JSON.stringify({ format: 'cadcraft-climate-scenario', name: 'Mine', source: 'My engineer, 2026 report', rows: [{ year: 2050, seaLevelRiseM: 0.4 }, { year: 2030, seaLevelRiseM: 0.1 }] }));
  ok(js.ok && js.scenario.rows[0].year === 2030 && js.scenario.source === 'My engineer, 2026 report' && C.scenarioAt(js.scenario, 2040).floodFactor === 1, 'a JSON file names its source; rows come out sorted; a missing column means no change');
  ok(!C.parseScenario('').ok && !C.parseScenario('{"format":"other"}').ok && !C.parseScenario('a,b\n1,2').ok && C.parseScenario('year,seaLevelRiseM\n2050,99').errors[0].includes('seaLevelRiseM') && !C.parseScenario('year,seaLevelRiseM\n2050,99').ok, 'an empty file, another format, no year column and a rise of 99 m are all refused with the reason');
  ok(C.parseScenario('year,seaLevelRiseM\n2050,0.1\n2050,0.2').errors.includes('two rows for one year'), 'two rows for one year are refused');

  console.log('== on a drawn two-storey house');
  const N0 = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const ST = await import(path.join(APP, 'res-stair.js'));
  const HM = await import(path.join(APP, 'hazard-model.js'));
  const text = N0.newBuilding({ name: 'Hazard', levels: N0.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'h.ifc', now: new Date('2026-10-28T12:00:00Z') });
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
  const fs = HM.floodScene(ed);
  ok(fs.rooms.length === 3 && fs.rooms.filter((r) => r.floor === 0).length === 2 && near(fs.rooms.find((r) => r.floor > 0).floor, 3, 0.01), 'three rooms; the two on the lowest level have floor 0, the upper one 3 m above them');
  ok(fs.openings.some((o) => o.b === null && o.kind === 'door') && fs.openings.some((o) => o.b === null && o.kind === 'window' && o.sill > 0.5) && fs.openings.some((o) => o.kind === 'stair'), 'an outside door, an outside window with a sill, and the stair');
  const flood = H.floodRun({ rooms: fs.rooms, openings: fs.openings, hydrograph: [[0, 0], [1800, 1.5]], dt: 60 });
  ok(flood.rooms.filter((r) => r.firstWet !== null).length === 2 && flood.rooms.every((r) => r.maxDepth === 0 || near(r.maxDepth, 1.5, 0.01)), 'a 1.5 m flood wets the two rooms on the lowest level, not the upper one: ' + flood.rooms.map((r) => r.name + ' ' + r.maxDepth + ' m').join(', '));
  const hb = HM.hazardBuilding(ed, { massPerM2: 500, dir: 'x' });
  ok(hb.storeys.length === 2 && near(hb.storeys[0].z, 1.5, 0.01) && near(hb.storeys[1].z, 4.5, 0.01) && hb.assumedT1 && near(hb.T1, 0.2, 1e-12), 'two storeys, middles at 1.5 and 4.5 m; the period is the rule of thumb 0.1 s a storey (0.2 s) until it is given');
  ok(near(hb.storeys[0].area_m2, 40, 3) && near(hb.storeys[0].mass, hb.storeys[0].area_m2 * 500, 10) && near(hb.storeys[0].width_m, 5, 0.3), 'footprint about 40 m² (' + hb.storeys[0].area_m2 + '), mass = area × 500 kg/m², width across a wind along x = 5 m');
  ok(near(hb.building.modes[0].period, 0.2, 1e-9), 'the building made from them has the period asked for');
  const wr = H.windRun({ V10: 35, storeys: hb.storeys.map((s) => ({ z: s.z, h: s.h, width: s.width_m })) }), sway = H.staticSway(hb.building, wr.floors);
  ok(wr.ok && sway.u[1] > sway.u[0] && sway.u[1] > 0, 'wind at 35 m/s: base shear ' + Math.round(wr.base.shear) + ' N, top sway ' + (sway.u[1] * 1000).toFixed(1) + ' mm');

  console.log('== the assistant tool');
  const SA = await import(path.join(APP, 'sim-agents.js'));
  const tool = SA.simTools({ ed: () => ed }).find((x) => x.name === 'hazard_run');
  const fr = tool.run({ hazard: 'flood', peakM: 1.5, riseMin: 30 });
  ok(fr.wetRooms === 2 && fr.rooms.some((x) => x.maxDepthM > 1.4) && tool.group === 'read', 'hazard_run flood: ' + fr.wetRooms + ' rooms wet');
  const qr = tool.run({ hazard: 'quake', pgaG: 0.3, periodS: 0.4, motion: 'ricker', motionHz: 2.5 });
  ok(qr.storeys.length === 2 && qr.baseShearKN > 0 && qr.storeys.every((s) => s.driftMm > 0), 'hazard_run quake: base shear ' + qr.baseShearKN + ' kN, drift ' + qr.storeys.map((s) => s.driftMm + ' mm').join(', '));
  const wd = tool.run({ hazard: 'wind', windMs: 40 });
  ok(wd.baseShearKN > 0 && wd.storeys.length === 2, 'hazard_run wind: base shear ' + wd.baseShearKN + ' kN');
  let err = null;
  try { tool.run({ hazard: 'meteor' }); } catch (e) { err = e; }
  ok(err && err.code === 'invalid_argument', 'an unknown hazard is refused with the choices');

  console.log('== EG.47 round 3: floor stiffness from the Analysis frame solver, a time history on the real frame');
  const HF = await import(path.join(APP, 'hazard-frame.js')), HM2 = await import(path.join(APP, 'hazard-model.js')), FMO = await import(path.join(APP, 'frame/frame-model.js'));
  const f0 = [false, false, false, false, false, false];
  function frameOf(nst, h, Ibeam, Icol = 5e7) {
    const nodes = [], members = [], sup = [], pts = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    for (let st = 0; st <= nst; st++) pts.forEach((p, i) => nodes.push({ id: 'n' + st + '_' + i, x: p[0], y: p[1], z: st * h }));
    for (let st = 0; st < nst; st++) pts.forEach((p, i) => members.push({ id: 'c' + st + '_' + i, i: 'n' + st + '_' + i, j: 'n' + (st + 1) + '_' + i, section: 'col', material: 'm', roll: 0, rel: { i: f0, j: f0 } }));
    for (let st = 1; st <= nst; st++) for (let i = 0; i < 4; i++) members.push({ id: 'b' + st + '_' + i, i: 'n' + st + '_' + i, j: 'n' + st + '_' + ((i + 1) % 4), section: 'beam', material: 'm', roll: 0, rel: { i: f0, j: f0 } });
    pts.forEach((p, i) => sup.push({ node: 'n0_' + i, fix: [true, true, true, true, true, true] }));
    return FMO.cleanFrame({ format: 'cadcraft-frame', version: 1, name: 't', nodes, materials: [{ id: 'm', name: 's', E: 200000, G: 77000, rho: 7850 }], sections: [{ id: 'col', name: 'c', A: 10000, Iy: Icol, Iz: Icol, J: 1e7 }, { id: 'beam', name: 'b', A: 50000, Iy: Ibeam, Iz: Ibeam, J: 1e9 }], members, supports: sup, cases: [], combos: [] }).model;
  }
  const kHand = 4 * 12 * 200000 * 5e7 / 3000 ** 3 * 1000;   // four fixed-fixed columns, rigid floor: 12 E I / h³ each (N/m)
  const st2 = HF.frameStiffness(frameOf(2, 3000, 1e11), { dir: 'x' });
  ok(st2.ok && st2.floors.length === 2 && st2.floors[0].nodes.length === 4, 'a two-storey, four-column frame: two floors of four nodes found from the node heights');
  ok(st2.kStorey.every((k) => Math.abs(k - kHand) / kHand < 0.02), 'storey stiffness with stiff beams matches 4 × 12EI/h³ = ' + (kHand / 1e6).toFixed(2) + ' MN/m within 2 %: ' + st2.kStorey.map((k) => (k / 1e6).toFixed(2)).join(', '));
  ok(Math.abs(st2.K[0][1] - st2.K[1][0]) < 1e-6 * Math.abs(st2.K[0][1]) && st2.K[0][0] > 0 && st2.K[1][1] > 0 && st2.K[0][0] * st2.K[1][1] > st2.K[0][1] ** 2, 'the condensed floor stiffness is symmetric and positive definite');
  const softF = HF.frameStiffness(frameOf(2, 3000, 1e8), { dir: 'x' });
  ok(softF.kStorey[0] < st2.kStorey[0] * 0.8, 'flexible beams make the storeys softer than the rigid-floor figure (' + (softF.kStorey[0] / 1e6).toFixed(2) + ' vs ' + (st2.kStorey[0] / 1e6).toFixed(2) + ' MN/m): the frame, not a typed number, decides');
  const stY = HF.frameStiffness(frameOf(2, 3000, 1e11), { dir: 'y' });
  ok(Math.abs(stY.kStorey[0] - kHand) / kHand < 0.02, 'the y direction of this square-section frame gives the same stiffness');
  const oneSt = HF.frameBuilding(frameOf(1, 3000, 1e11), { dir: 'x', addKgM2: 500 });
  const mHand = oneSt.m[0], T1hand = 2 * Math.PI * Math.sqrt(mHand / kHand);
  ok(oneSt.ok && Math.abs(oneSt.modes[0].period - T1hand) / T1hand < 0.02 && oneSt.full === true, 'one storey: the period from the frame is 2π√(m/k) = ' + T1hand.toFixed(3) + ' s (frame gives ' + oneSt.modes[0].period.toFixed(3) + ' s), mass ' + Math.round(mHand) + ' kg = members + 500 kg/m² × 6 × 4 m');
  ok(Math.abs(oneSt.floors[0].area_m2 - 24) < 1e-9 && oneSt.m[0] > 500 * 24, 'floor mass = the members\' weight plus the load on the floor\'s plan box (24 m²)');
  // the denseB time history agrees with the tridiagonal oneSt where both apply
  const mmx = [3e4, 2e4], kkx = [2e7, 1.5e7], shx = H.shearBuilding({ m: mmx, k: kkx }), Kdx = shx.K;
  const denseB = H.buildingFromK({ m: mmx, K: Kdx }), rec9 = H.groundMotion({ kind: 'ricker', pga: 3, duration: 8, dt: 0.005, f: 2 });
  const qa1 = H.quakeRun(shx, rec9, { dt: 0.005 }), qa2 = H.quakeRun(denseB, rec9, { dt: 0.005 });
  ok(denseB.full === true && shx.full === false && Math.abs(qa1.peak.top - qa2.peak.top) < 1e-9 * qa1.peak.top + 1e-12 && Math.abs(qa1.peak.drift[0] - qa2.peak.drift[0]) < 1e-9, 'the full-matrix time history gives the same peaks as the tridiagonal one on the same stiffness (top ' + (qa2.peak.top * 1000).toFixed(3) + ' mm)');
  ok(Math.abs(qa2.peak.shear - qa1.peak.shear) / qa1.peak.shear < 0.02, 'base shear from the floor inertia (Σ m·a) agrees with the first spring\'s force within 2 %: ' + (qa2.peak.shear / 1000).toFixed(1) + ' vs ' + (qa1.peak.shear / 1000).toFixed(1) + ' kN');
  const hbf = HM2.hazardFrameBuilding(frameOf(2, 3000, 1e11), null, { addKgM2: 500, dir: 'x' });
  ok(hbf.storeys.length === 2 && hbf.source === 'frame' && hbf.T1 > 0 && hbf.assumedT1 === false && Math.abs(hbf.storeys[1].z - 4.5) < 1e-9 && hbf.storeys[0].width_m === 4, 'hazardFrameBuilding: two storeys at 1.5 and 4.5 m, the real period ' + hbf.T1.toFixed(3) + ' s, width across x = 4 m');
  const qfr = H.quakeRun(hbf.building, H.groundMotion({ kind: 'ricker', pga: 2, duration: 10, dt: 0.005, f: 2 }), { dt: 0.005 });
  ok(qfr.ok && qfr.peak.top > 0 && qfr.peak.drift.every((d) => d > 0) && qfr.peak.shear > 0, 'a quake on the frame: top ' + (qfr.peak.top * 1000).toFixed(2) + ' mm, base shear ' + (qfr.peak.shear / 1000).toFixed(1) + ' kN');
  ok(HF.frameStiffness({ ...frameOf(1, 3000, 1e11), nodes: [{ id: 'a', x: 0, y: 0, z: 0 }, { id: 'b', x: 0, y: 0, z: 100 }], members: [], supports: [] }, {}).ok === false, 'a model with no floors or no members says so instead of inventing a stiffness');

  console.log('== the same on a real IFC frame, read by the Analysis tab\'s reader (a two-storey steel frame written by DetailCraft\'s IFC writer)');
  try {
    const { register } = await import('node:module'), { pathToFileURL } = await import('node:url'), fsn = await import('node:fs');
    const ROOT = path.resolve(APP, '../../../../..'), DCD = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
    register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) { if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true }; return next(spec, ctx); }`), import.meta.url);
    const dl = (f) => import(pathToFileURL(path.join(DCD, f)).href), bl = (f) => import(pathToFileURL(path.join(APP, f)).href);
    (await bl('i18n.js')).init({ strings: JSON.parse(fsn.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
    (await dl('i18n.js')).init({ strings: JSON.parse(fsn.readFileSync(path.join(DCD, 'lang/en.json'), 'utf8')) });
    const WA = await bl('ifc/api.js'), AB = await bl('analysis-bim.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js'), { sampleModel } = await dl('sample.js');
    const base = JSON.parse(JSON.stringify(sampleModel().state || sampleModel()));
    const stt = { ...base, members: [], connections: [], footings: [], stairs: [], bolts: [], issues: [] };
    const mem = (id, type, profile, a, b, name) => stt.members.push({ id, type, profile, material: 'A992', start: a, end: b, rotation: 0, position: 'middle', name, cuts: [], holes: [], phase: 1 });
    const corners = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
    corners.forEach(([x, y], i) => { mem('c1' + i, 'column', 'W12x50', [x, y, 0], [x, y, 4000], 'C1-' + i); mem('c2' + i, 'column', 'W12x50', [x, y, 4000], [x, y, 8000], 'C2-' + i); });
    for (const z of [4000, 8000]) corners.forEach(([x, y], i) => { const [x2, y2] = corners[(i + 1) % 4]; mem('b' + z + i, 'beam', 'W16x26', [x, y, z], [x2, y2, z], 'B' + z + '-' + i); });
    const built = build(stt), marks = markParts(built, { perPhase: false });
    marks.footingMark = markFootings(stt.footings, { perPhase: false });
    const bytes = new TextEncoder().encode(writeIfc(stt, built, marks, bendingSchedule(stt.footings), { now: new Date('2026-10-16T00:00:00Z') }));
    const api = new WA.IfcAPI(); await api.Init();
    const mid = api.OpenModel(bytes, { COORDINATE_TO_ORIGIN: false });
    const r = AB.readFrameElements(WA, api, mid), fr = AB.frameOfElements(r.elements, JSON.parse(JSON.stringify({ cases: [], combos: [] })), {});
    ok(r.elements.length === 16 && fr.model.members.length >= 16, 'the Analysis reader finds the 16 beams and columns in the IFC');
    const bb = HF.frameBuilding(fr.model, { dir: 'x', addKgM2: 400 });
    const Ix = r.elements.find((e) => e.name === 'C1-0').sec.Iy, Iz = r.elements.find((e) => e.name === 'C1-0').sec.Iz;
    ok(bb.ok && bb.floors.length === 2 && bb.kStorey.every((k) => Number.isFinite(k) && k > 1e6), 'floors found from the IFC frame: heights ' + bb.floors.map((f) => f.z).join(', ') + ' mm, storey stiffness ' + bb.kStorey.map((k) => (k / 1e6).toFixed(1)).join(', ') + ' MN/m');
    const lo = 4 * 12 * 200000 * Math.min(Ix, Iz) / 4000 ** 3 * 1000, hi = 4 * 12 * 200000 * Math.max(Ix, Iz) / 4000 ** 3 * 1000;
    ok(bb.kStorey[0] > lo * 0.5 && bb.kStorey[0] < hi * 1.05, 'the lower storey lies between the weak- and strong-axis column bounds (' + (lo / 1e6).toFixed(1) + ' to ' + (hi / 1e6).toFixed(1) + ' MN/m with rigid floors; the beams flex, so it sits under the strong bound)');
    ok(bb.modes[0].period > 0.05 && bb.modes[0].period < 3 && bb.modes[0].period > bb.modes[1].period, 'first period ' + bb.modes[0].period.toFixed(3) + ' s, longer than the second (' + bb.modes[1].period.toFixed(3) + ' s)');
    const qr = H.quakeRun(bb, H.groundMotion({ kind: 'ricker', pga: 3, duration: 10, dt: 0.005, f: 1 / bb.modes[0].period }), { dt: 0.005 });
    ok(qr.ok && qr.peak.top > 0.0005, 'a Ricker pulse at the frame\'s own period moves the top ' + (qr.peak.top * 1000).toFixed(1) + ' mm: the run is on the real frame');
    // 0.8 EG.47 (bim-analysis_PART_4): wind sway from the frame's own K (K u = F), not the period-fitted springs
    const Fw = [1000, 2000], sw = H.staticSway(bb, Fw), Kk = bb.K;
    const back = [Kk[0][0] * sw.u[0] + Kk[0][1] * sw.u[1], Kk[1][0] * sw.u[0] + Kk[1][1] * sw.u[1]];
    ok(Math.abs(back[0] - Fw[0]) < 1e-6 * 3000 && Math.abs(back[1] - Fw[1]) < 1e-6 * 3000, 'wind sway on the IFC frame solves K u = F (residual under 1e-6 of the load): top ' + (sw.u[1] * 1000).toFixed(2) + ' mm');
    ok(Math.abs(sw.drift[0] - sw.u[0]) < 1e-12 && Math.abs(sw.drift[1] - (sw.u[1] - sw.u[0])) < 1e-12, 'drift = the difference of neighbouring floor displacements');
    ok(sw.u.every((v) => v > 0) && sw.u[1] > sw.u[0], 'positive forces push every floor the same way, the top furthest (K is positive definite)');
  } catch (e) { ok(false, 'the IFC frame path: ' + (e.stack || e)); }

  console.log(`\nhazard: ${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
