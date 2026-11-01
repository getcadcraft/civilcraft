/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --eg` (0.8 round 2, EG.1–EG.4, session `mep_PART_2`): pipe and duct sizing with pressure drop, cable trays and
 * conduits with fill, IES / EULUMDAT photometry, the Problems they raise, the sprinkler add-on's layout and hydraulics, and the same calculations
 * on a real IFC model (runs drawn through mep-model.js, equipment with ports, tray and conduit saved as IfcCableCarrierSegment, one undo step).
 * Every figure is worked by hand beside its test.
 */
import path from 'node:path';
import fs from 'node:fs';

export async function egMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  const imp = (f) => import(path.join(APP, f));
  const N = await imp('mep/network.js'), F = await imp('mep/flow.js'), CA = await imp('mep/carrier.js'), PH = await imp('mep/photometry.js'), PR = await imp('mep/problems-mep.js');
  const SPK = (f) => import(path.join(APP, 'addons/sprinkler/lib', f));
  const HZ = await SPK('hazard.js'), LY = await SPK('layout.js'), HY = await SPK('hydraulics.js');

  console.log('== network: runs → graph → tree');
  {
    const runs = [{ id: 'main', verts: [[0, 0, 0], [10000, 0, 0]] }, { id: 'br', verts: [[4000, 0, 0], [4000, 3000, 0]] }];
    const g = N.graphFromRuns(runs, [{ key: 'src', p: [0, 0, 0] }, { key: 'a', p: [10000, 0, 0] }, { key: 'b', p: [4000, 3000, 0] }]);
    ok(g.segs.length === 3 && near(g.segs.reduce((s, x) => s + x.length, 0), 13, 1e-9), 'a branch ending on the main cuts it at the tee: three pieces, 13 m in all');
    const tr = N.buildTree(g.segs, g.nodeOf.src);
    ok(tr.order.length === 3 && !tr.cycles.length && !tr.unreached.length, 'a tree from the source reaches every piece');
    const sum = N.accumulate(tr, new Map([[g.nodeOf.a, 6], [g.nodeOf.b, 3]]));
    ok(near(sum.get('main:0'), 9, 1e-9) && near(sum.get('br:0'), 3, 1e-9), 'loads add up below each piece (9 on the first 4 m, 3 on the branch)');
    const loop = N.graphFromRuns([{ id: 'a', verts: [[0, 0, 0], [1000, 0, 0]] }, { id: 'b', verts: [[1000, 0, 0], [1000, 1000, 0]] }, { id: 'c', verts: [[1000, 1000, 0], [0, 0, 0]] }]);
    ok(N.buildTree(loop.segs, loop.nodes[0].id).cycles.length === 1, 'a closed loop is found');
    const lone = N.graphFromRuns([{ id: 'x', verts: [[0, 0, 0], [1000, 0, 0]] }, { id: 'y', verts: [[5000, 0, 0], [6000, 0, 0]] }]);
    ok(N.buildTree(lone.segs, lone.nodes[0].id).unreached.length === 1, 'a run not joined to the source is unreached');
  }

  console.log('== EG.1 hydraulics (worked by hand)');
  {
    // NFPA/Hazen–Williams inch-pound form: p = 4.52 Q^1.85 / (C^1.85 d^4.87) psi/ft — 100 gpm, 4 in, C 120 → 0.003772 psi/ft
    const psiFt = 4.52 * 100 ** 1.85 / (120 ** 1.85 * 4 ** 4.87);
    const si = F.hazenWilliams(100 * F.GPM, 4 * 0.0254, 120) / 1000 / F.KPA_PSI * 0.3048;
    ok(near(si / psiFt, 1, 0.001), 'Hazen–Williams in SI matches the inch-pound form within 0.1 %', si + ' vs ' + psiFt);
    // Darcy for water, 1 m/s in 25 mm: Re ≈ 24 900, smooth f ≈ 0.0252 → 0.0252/0.025·998.2·0.5 ≈ 503 Pa/m
    const Q = Math.PI * 0.025 ** 2 / 4;
    ok(near(F.darcyWater(Q, 0.025, 0), 503, 25), 'Darcy–Weisbach for water: 1 m/s in 25 mm smooth ≈ 503 Pa/m', String(F.darcyWater(Q, 0.025, 0)));
    const d = F.demandFor(10); ok(near(d.q / F.GPM, 14.6, 1e-9) && !d.beyond, 'demand: 10 fixture units on the example curve = 14.6 gpm');
    ok(near(F.demandFor(300).q / F.GPM, 65 * (300 / 200) ** (Math.log(65 / 43.5) / Math.log(2)), 1e-6) && F.demandFor(300).beyond, 'beyond the last point the last slope continues and says so');
    ok(near(F.demandFor(0.5).q / F.GPM, 1.5, 1e-9), 'below the first point the demand is in proportion');
    ok(F.cleanCurve({ points: [[1, 5], [2, 4]] }) === null && F.cleanCurve({ points: [[1, 5]] }) === null && F.cleanCurve({ points: [[2, 4], [1, 3]] })?.points[0][0] === 1, 'a typed curve must rise; it is sorted');
    ok(F.DEFAULT_CURVE.example === true && /not a code table/.test(F.DEFAULT_CURVE.label), 'the default curve says it is an example, not a code table');
    const runs = [{ id: 'main', verts: [[0, 0, 0], [10000, 0, 0]] }, { id: 'br', verts: [[4000, 0, 0], [4000, 3000, 0]] }];
    const g = N.graphFromRuns(runs, [{ key: 'src', p: [0, 0, 0] }, { key: 'f1', p: [10000, 0, 0] }, { key: 'f2', p: [4000, 3000, 0] }]);
    const sizes = [{ key: '1/2', idMm: 12 }, { key: '3/4', idMm: 19 }, { key: '1', idMm: 25 }, { key: '1-1/2', idMm: 38 }];
    const attrs = { main: { mat: 'copper', idMm: 25, sizes, label: '1' }, br: { mat: 'copper', idMm: 12, sizes, label: '1/2' } };
    const r = F.analyzePipes({ graph: g, source: g.nodeOf.src, loads: [{ key: 'f1', node: g.nodeOf.f1, fu: 6 }, { key: 'f2', node: g.nodeOf.f2, fu: 3 }], runAttrs: attrs, opts: { availKpa: 400, minKpa: 100 } });
    const s = Object.fromEntries(r.segs.map((x) => [x.id, x]));
    ok(near(s['main:0'].fu, 9, 1e-9) && near(s['main:1'].fu, 6, 1e-9) && near(s['br:0'].fu, 3, 1e-9), 'fixture units accumulate toward the source');
    ok(near(s['main:0'].flow, F.demandFor(9).q, 1e-12), 'each piece carries the demand of the units below it (not the sum of the demands)');
    ok(s['br:0'].status === 'small' && s['br:0'].need === '3/4', 'a 1/2 branch carrying 3 units (6.5 gpm) is too small for the velocity limit and needs 3/4', JSON.stringify([s['br:0'].status, s['br:0'].need, s['br:0'].V]));
    ok(s['main:0'].status === 'ok', 'the 1 in. main is fine');
    const f1 = r.loads.find((l) => l.key === 'f1');
    ok(f1.reached && near(f1.dpKpa, (s['main:0'].dp + s['main:1'].dp) / 1000, 1e-9) && near(f1.leftKpa, 400 - f1.dpKpa, 1e-9), 'pressure left at a fixture = supply minus the losses of the pieces on its path');
    // static: a 3 m rise costs 998.2·9.80665·3 = 29.37 kPa
    const rise = N.graphFromRuns([{ id: 'v', verts: [[0, 0, 0], [0, 0, 3000]] }], [{ key: 'src', p: [0, 0, 0] }, { key: 'top', p: [0, 0, 3000] }]);
    const rr = F.analyzePipes({ graph: rise, source: rise.nodeOf.src, loads: [{ key: 'top', node: rise.nodeOf.top, lps: 0.01 }], runAttrs: { v: { mat: 'copper', idMm: 25, sizes, label: '1' } } });
    ok(near(rr.segs[0].static / 1000, 29.37, 0.01), 'a 3 m rise costs 29.37 kPa of static pressure');
    const pp = PR.pipeProblems(r, { labelOf: (i) => i });
    ok(pp.some((p) => p.code === 'pipe.small' && p.fixes?.[0]?.args?.size === '3/4') && pp.some((p) => p.code === 'pipe.curve' && p.severity === 'note'), 'Problems: the small branch with its fix, and the note that the curve is an example');
    ok(pp.every((p) => p.source.name.startsWith('bimcraft.mep.') && p.msg?.key && p.text), 'every problem has a source, a message key and its words');
  }

  console.log('== EG.1 ducts');
  {
    const runs = [{ id: 'main', verts: [[0, 0, 0], [10000, 0, 0]] }, { id: 'br', verts: [[4000, 0, 0], [4000, 3000, 0]] }];
    const g = N.graphFromRuns(runs, [{ key: 'src', p: [0, 0, 0] }, { key: 'a', p: [10000, 0, 0] }, { key: 'b', p: [4000, 3000, 0] }]);
    const r = F.analyzeDucts({ graph: g, source: g.nodeOf.src, terminals: [{ key: 'a', node: g.nodeOf.a, lps: 300 }, { key: 'b', node: g.nodeOf.b, lps: 150 }],
      runAttrs: { main: { shape: 'rect', wMm: 400, hMm: 250, label: '400×250' }, br: { shape: 'round', wMm: 200, label: 'Ø200' } }, opts: { rate: 0.8, equipDp: 100 } });
    const s = Object.fromEntries(r.segs.map((x) => [x.id, x]));
    ok(near(s['main:0'].flow * 1000, 450, 1e-6) && near(s['main:1'].flow * 1000, 300, 1e-6), 'airflow adds up: 450 L/s in the first 4 m, 300 beyond the tee');
    ok(near(s['main:0'].V, 0.45 / 0.1, 1e-9), 'velocity = flow ÷ area: 0.45 m³/s in 400×250 = 4.5 m/s');
    ok(s['br:0'].status === 'small' && s['br:0'].rate > 0.8, 'Ø200 carrying 150 L/s runs 1.48 Pa/m: over the 0.8 Pa/m target');
    ok(r.critical && r.critical.key === 'b' && near(r.fanPa, r.critical.dp + 100, 1e-9), 'the critical path is to the branch; the fan needs its loss plus the 100 Pa of equipment');
    const t = Object.fromEntries(r.terminals.map((x) => [x.key, x]));
    ok(near(t.b.damperPa, 0, 1e-9) && near(t.a.damperPa, r.critical.dp - t.a.dp, 1e-9) && t.a.damperPa > 0, 'the other path gets the excess as damper pressure');
    const dp = PR.ductProblems(r, { labelOf: (i) => i });
    ok(dp.some((p) => p.code === 'duct.small') && dp.some((p) => p.code === 'duct.defaults' && p.severity === 'note'), 'Problems: the small duct and the note about default fitting coefficients');
  }

  console.log('== EG.2 conduit, tray, cables');
  {
    // 3 cables of 5 mm in EMT 1/2 (ID 15.8): area 3·19.63 = 58.9 mm² of 196.1 → 30.0 %; limit for 3 cables 40 % → ok
    const f = CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 5, n: 3 }] });
    ok(near(f.pct, 30.04, 0.05) && f.limitPct === 40 && f.ok, 'conduit fill: three 5 mm cables in EMT 1/2 are 30.0 % of 40 %');
    ok(CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 9, n: 1 }] }).pct > 31 && CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 9, n: 1 }] }).limitPct === 53, 'one cable is judged against 53 %');
    ok(CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 6, n: 1 }, { odMm: 6, n: 1 }] }).limitPct === 31, 'two cables against 31 %');
    ok(CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 20 }] }).tooWide, 'a cable wider than the inside diameter is flagged');
    ok(CA.conduitFor('emt', [{ odMm: 6, n: 9 }])?.size === '1-1/4' && CA.conduitSizes('emt')[1] === '3/4', 'the smallest EMT that holds nine 6 mm cables is 1-1/4 in. (254 mm² is 26 % of it; 1 in. would be 46 % against 40 %)');
    ok(CA.conduitFill({ idMm: 15.8, cables: [{ odMm: 5, n: 3 }], limits: { one: 53, two: 31, many: 25 } }).ok === false, 'the person can type other limits');
    ok(CA.trayFill({ widthMm: 300, depthMm: 100, cables: [{ odMm: 20, n: 10 }] }).pct > 10, 'tray fill by area');
    ok(CA.trayFill({ widthMm: 300, depthMm: 100, cables: [{ odMm: 30, n: 11 }], mode: 'layer' }).ok === false && CA.trayFill({ widthMm: 300, depthMm: 100, cables: [{ odMm: 30, n: 10 }], mode: 'layer' }).ok, 'single layer: ten 30 mm cables fit a 300 mm tray, eleven do not');
    const parsed = CA.parseCablesCsv('Tag,Circuit,Type,Size,OD,N,From,To\nC1,L1,THHN,12,6,1,A,B\nC2,L1,THHN,12,x,1,A,B\nC1,L2,THHN,12,6,1,A,B\n,L2,x,1,6,1,A,B');
    ok(parsed.cables.length === 1 && parsed.errors.length === 3 && parsed.errors.map((e) => e.key).join() === 'od,duplicate,tag', 'the cable list: bad diameter, duplicate tag and empty tag are rows with errors', JSON.stringify(parsed.errors));
    ok(CA.parseCablesCsv('a,b\n1,2').errors[0].key === 'columns', 'a list without tag and OD columns is refused');
    const runs = [{ id: 'T1', verts: [[0, 0, 0], [5000, 0, 0]] }, { id: 'T2', verts: [[5000, 0, 0], [5000, 4000, 0]] }, { id: 'T3', verts: [[9000, 0, 0], [10000, 0, 0]] }];
    const g = N.graphFromRuns(runs, [{ key: 'P1', p: [0, 0, 0] }, { key: 'M1', p: [5000, 4000, 0] }, { key: 'FAR', p: [10000, 0, 0] }]);
    const cables = [{ tag: 'C1', from: 'P1', to: 'M1', odMm: 10, n: 1 }, { tag: 'C2', from: 'P1', to: 'FAR', odMm: 10 }, { tag: 'C3', from: 'P1', to: 'NOPE', odMm: 10 }];
    const routes = CA.routeCables(g, cables);
    ok(routes.get('C1').found && near(routes.get('C1').lengthMm, 9000, 1e-6) && routes.get('C1').runs.map((x) => x.run).join() === 'T1,T2', 'a cable is routed along the carriers: 5 m + 4 m through T1 and T2');
    ok(!routes.get('C2').found && routes.get('C2').why === 'gap' && routes.get('C3').why === 'ends', 'no continuous route (gap) and an end not on a carrier are told apart');
    const rows = CA.scheduleRows(cables, routes, { slack: 0.1, endsMm: 1000 });
    ok(near(rows[0].lengthM, 11.9, 0.05) && /no continuous/.test(rows[1].note) && /not on a carrier/.test(rows[2].note), 'schedule length = route + 10 % + 1 m each end = 11.9 m; unrouted cables say why');
    ok(CA.scheduleCsv([{ tag: '=1+1', circuit: 'a,b' }]).includes("\"'=1+1\"") === false && CA.scheduleCsv([{ tag: '=1+1', circuit: 'a,b' }]).includes("'=1+1") && CA.scheduleCsv([{ tag: 'x', circuit: 'a,b' }]).includes('"a,b"'), 'CSV: formula cells are quoted with a leading apostrophe, commas are quoted');
    const fills = CA.fillByRun([{ tag: 'C1', odMm: 13, n: 1 }], routes, { T1: { kind: 'conduit', type: 'emt', size: '1/2', label: '1/2"' }, T2: { kind: 'tray', widthMm: 100, depthMm: 50, label: '100×50' } });
    ok(fills.length === 2 && fills[0].fill.ok === false && fills[0].bigger?.size === '3/4', 'a 13 mm cable in EMT 1/2 is 68 % full against 53 %; EMT 3/4 would hold it');
    const cp = PR.carrierProblems(fills, routes, { labelOf: (i) => i });
    ok(cp.some((p) => p.code === 'carrier.fill' && p.fixes?.[0]?.args?.size === '3/4'), 'Problems: the over-full conduit comes with the size that fixes it');
  }

  console.log('== EG.4 photometry');
  {
    const V = []; for (let g = 0; g <= 90; g += 5) V.push(g);
    const cd = V.map((g) => (1000 * Math.cos(g * Math.PI / 180) / Math.PI).toFixed(3));
    const ies = `IESNA:LM-63-2002\n[TEST] t\n[LUMINAIRE] Lambertian\nTILT=NONE\n1 1000 1 ${V.length} 1 1 2 0 0 0\n1 1 12\n${V.join(' ')}\n0\n${cd.join(' ')}\n`;
    const r = PH.parseIes(ies);
    ok(r.ok && r.photo.sym === 'axial' && r.photo.lumens === 1000 && r.photo.watts === 12 && r.photo.name === 'Lambertian', 'IES: an axially symmetric file reads (1000 lm, 12 W)');
    // Lambertian: I(γ) = Φ cosγ / π; straight below at 3 m: E = Φ/(π d²) = 1000/(π·9) = 35.368 lux
    ok(near(PH.illuminanceAt([{ photo: r.photo, p: [0, 0, 3000] }], [0, 0, 0], [0, 0, 1], 1), 1000 / Math.PI / 9, 0.001), 'illuminance straight below a 1000 lm Lambertian source at 3 m = 35.37 lux');
    // off axis 3 m sideways at 3 m height: γ = 45°, d² = 18, cosθ = cos45 → E = I(45)·cos45/18 = (1000/π·0.7071)·0.7071/18
    ok(near(PH.illuminanceAt([{ photo: r.photo, p: [0, 0, 3000] }], [3000, 0, 0], [0, 0, 1], 1), (1000 / Math.PI) * 0.5 / 18, 0.01), 'off axis (45°): E = I·cosθ/d² = 8.84 lux');
    ok(near(PH.illuminanceAt([{ photo: r.photo, p: [0, 0, 3000] }], [0, 0, 0], [0, 0, 1], 0.8), 0.8 * 35.368, 0.01), 'the light loss factor scales the result');
    ok(PH.illuminanceAt([{ photo: r.photo, p: [0, 0, 3000] }], [0, 0, 0], [0, 0, -1], 1) === 0, 'a surface facing away gets nothing');
    const g = PH.computeGrid({ luminaires: [{ photo: r.photo, p: [0, 0, 3000] }], polygon: [[-2000, -2000], [2000, -2000], [2000, 2000], [-2000, 2000]], spacing: 500, height: 0, llf: 1 });
    ok(g.stats.n === 64 && g.stats.min < g.stats.avg && g.stats.max <= 35.38 && near(g.stats.minAvg, g.stats.min / g.stats.avg, 1e-12), 'a 4 × 4 m room on a 500 mm grid: 64 points, statistics');
    const ck = PH.checkTargets(g, { avgLux: 500, uniformity: 0.4 });
    ok(ck.length === 2 && ck[0].ok === false && ck[1].ok === true, 'targets typed by the person are checked (average fails, uniformity passes)');
    const lp = PR.lightingProblems('Office', g, ck, {});
    ok(lp.length === 1 && lp[0].code === 'light.avg' && lp[0].req.value === 500, 'Problems: the failed target with its required and found values');
    const q = `IESNA:LM-63-1995\nTILT=NONE\n1 1000 1 3 3 1 2 0 0 0\n1 1 10\n0 45 90\n0 45 90\n100 90 80\n100 70 60\n100 50 40\n`;
    const rq = PH.parseIes(q);
    ok(rq.ok && rq.photo.sym === 'quadrant' && PH.candela(rq.photo, 45, 45) === 70 && PH.candela(rq.photo, 45, 135) === 70 && PH.candela(rq.photo, 45, 225) === 70 && PH.candela(rq.photo, 45, 315) === 70, 'IES quadrant symmetry is mirrored into all four quadrants');
    ok(near(PH.candela(rq.photo, 22.5, 0), 95, 1e-9) && near(PH.candela(rq.photo, 45, 22.5), 80, 1e-9), 'candela is interpolated between angles');
    ok(PH.parseIes('junk').key === 'ies.nofile' && PH.parseIes(ies.replace('1 1 2 0 0 0', '1 2 2 0 0 0')).key === 'ies.type' && PH.parseIes(ies.slice(0, ies.length - 60)).ok === false, 'IES: not a file / type B / short file are refused with a reason');
    // EULUMDAT: symmetry about the vertical axis, 3 G angles, one plane
    const ld = Array(26).fill('0');
    Object.assign(ld, { 0: 'ACME', 1: '1', 2: '1', 3: '0', 4: '0', 5: '3', 6: '45', 8: 'Lamb LDT', 12: '200', 14: '50', 15: '180', 22: '100', 23: '1', 24: '0', 25: '1' });
    const L = [...ld, '1', 'LED', '1000', '3000', '80', '10', ...Array(10).fill('0'), '0', '45', '90', '318.3', '225.1', '0'];
    // 0-based: 3 Mc, 5 Ng, 22 LORL %, 23 conversion factor, 25 sets of lamps; then six lines per set, ten direct ratios, the G angles, the one plane's intensities
    const ldt = PH.parseLdt(L.join('\n') + '\n');
    ok(ldt.ok && ldt.photo.format === 'ldt' && ldt.photo.vAngles.join() === '0,45,90' && ldt.photo.sym === 'axial' && near(ldt.photo.cd[0][0], 318.3, 1e-6), 'EULUMDAT: an axially symmetric file reads; cd/klm are scaled by the lamp flux (318.3 cd/klm × 1000 lm = 318.3 cd)', JSON.stringify(ldt).slice(0, 160));
    ok(PH.parseLdt('x\ny').key === 'ldt.short', 'EULUMDAT: a file that is too short is refused');
    ok(PH.parsePhotometry(ies, 'a.ies').ok && PH.parsePhotometry(L.join('\n') + '\n', 'a.ldt').ok, 'parsePhotometry picks the reader');
  }

  console.log('== EG.3 sprinklers (the add-on libraries)');
  {
    const hz = HZ.DEFAULT_HAZARDS[1];
    ok(HZ.cleanHazards(HZ.DEFAULT_HAZARDS).length === 5 && HZ.cleanHazards([{ id: 'x', density: -1, area: 1, maxSpacing: 1, maxCoverage: 1 }]).length === 0, 'five default classes; a bad row is dropped');
    ok(/for professional review/.test(HZ.HAZARD_LABEL), 'the design criteria are labelled for professional review');
    const room = [[0, 0], [12000, 0], [12000, 8000], [0, 8000]];
    const lay = LY.layoutRoom(room, hz, { ceilingZ: 3000 });
    // 12 × 8 m, ordinary I: max spacing 4.6 m, max coverage 12.1 m² → 4 × 2 heads of 3.0 × 4.0 m = 12 m² each
    ok(lay.nx === 4 && lay.ny === 2 && lay.heads.length === 8 && near(lay.sx, 3000, 1e-6) && near(lay.sy, 4000, 1e-6), '12 × 8 m, ordinary I: 4 × 2 heads at 3.0 × 4.0 m (12 m² each, spacing ≤ 4.6 m)');
    ok(lay.uncovered === 0 && !lay.issues.length && lay.heads.every((h) => h.p[2] === 2900), 'every point is covered, and the deflectors sit 100 mm below the ceiling');
    const L = LY.layoutRoom([[0, 0], [8000, 0], [8000, 4000], [4000, 4000], [4000, 8000], [0, 8000]], hz, {});
    ok(L.heads.length >= 5 && L.uncovered < 0.001, 'an L-shaped room is covered (' + L.heads.length + ' heads)');
    const turned = LY.layoutRoom([[0, 0], [9000, 4000], [7000, 8500], [-2000, 4500]].map((p) => p), hz, {});
    ok(turned.heads.length > 0 && turned.frame.angle !== 0, 'a room turned to the grid: the layout follows the longest wall');
    const net = LY.buildNetwork(lay, {});
    ok(net.nodes.size === 11 && net.edges.length === 10, 'network: 8 heads, 2 junctions and the source (11 nodes); edges for the riser, the main and each head (10)');
    const sup = { ps: 5.5, pr: 4, qr: 3000 };
    ok(near(HY.supplyAt(sup, 0), 5.5, 1e-9) && near(HY.supplyAt(sup, 3000), 4, 1e-9) && near(HY.supplyAt(sup, 1500), 5.5 - 1.5 * 0.5 ** 1.85, 1e-9), 'the supply curve: static at no flow, residual at the test flow, N^1.85 between');
    const r = HY.design(lay, net, hz, sup, { kFactor: 80.6, C: 120, LD: HZ.DEFAULT_OPTIONS.LD, minHeadBar: 0.5, minSize: '1', maxSize: '6', vmax: 6 });
    ok(!r.failed && r.tried >= 2, 'the calculation tries several design areas (' + r.tried + ') and keeps the one needing most pressure');
    ok(near(r.minDensity, hz.density, 0.02), 'the least-served head gets the design density (' + r.minDensity.toFixed(2) + ' mm/min)');
    // the room (96 m²) is smaller than the design area (139 m²): all 8 heads operate; each at least density × 12 m² = 73.2 L/min
    ok(r.gov.heads.length === 8 && r.qHeadsLmin >= 8 * 73.2 - 1, 'a room smaller than the design area: all 8 heads discharge, at least 8 × 73.2 L/min');
    ok(r.qTotalLmin === r.qHeadsLmin + hz.hose && r.requiredBar > 0.5 && r.ok === true && r.availableBar > r.requiredBar, 'hose allowance added; the supply (' + r.availableBar?.toFixed(2) + ' bar) covers the demand (' + r.requiredBar?.toFixed(2) + ' bar)');
    const weak = HY.design(lay, LY.buildNetwork(lay, {}), hz, { ps: 2, pr: 1, qr: 1500 }, { C: 120, LD: HZ.DEFAULT_OPTIONS.LD, minHeadBar: 0.5, minSize: '1', maxSize: '6', vmax: 6 });
    ok(weak.ok === false, 'a weak supply fails the check');
    const big = LY.layoutRoom([[0, 0], [30000, 0], [30000, 20000], [0, 20000]], HZ.DEFAULT_HAZARDS[1], {});
    const bnet = LY.buildNetwork(big, {});
    const t0 = Date.now();
    const br = HY.design(big, bnet, HZ.DEFAULT_HAZARDS[1], sup, { C: 120, LD: HZ.DEFAULT_OPTIONS.LD, minHeadBar: 0.5, minSize: '1', maxSize: '6', vmax: 6 });
    ok(big.heads.length >= 48 && br.gov.heads.length < big.heads.length && br.gov.heads.length >= Math.ceil(139 / big.coveragePerHead) - 1, '30 × 20 m: ' + big.heads.length + ' heads, a remote area of ' + br.gov.heads.length + ' heads (139 m² ÷ ' + big.coveragePerHead.toFixed(1) + ' m²)');
    ok(Date.now() - t0 < 20000, 'the large room solves in ' + (Date.now() - t0) + ' ms');
  }

  // ----------------------------------------------------------------------------------------------- on a model
  const M = await imp('mep-model.js'), C = await imp('mep-calc.js'), E = await imp('mep/equipment.js');
  const { ModelWriter } = await imp('model-write.js'), { IfcEditor } = await imp('ifc-edit.js'), OPS = await imp('model-ops.js'), NM = await imp('new-model.js');
  for (const schema of ['IFC4', 'IFC2X3']) {
    console.log('== on a ' + schema + ' model');
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    const bytes0 = schema === 'IFC2X3' ? fs.readFileSync(path.join(ROOT, 'tools/detailcraft-test/fixtures/ios-steel-ifc2x3.ifc'))
      : new TextEncoder().encode(NM.newBuilding({ name: 'EG', levels: NM.stackLevels(1, 3000, () => 'Level 1'), fileName: 'e.ifc', now: new Date('2026-10-28T12:00:00Z') }));
    await quiet((x) => eng.load(x))(bytes0);
    const ed = new IfcEditor(WebIFC, eng), w = () => new ModelWriter(WebIFC, ed.api, ed.mid);
    const lvl = OPS.snapshotModel(ed).levels[0].guid;
    const go = (op, label) => ed.modelChange(op, { label });
    const fx0 = null;
    // pipes: a 1/2 copper main with a 1/2 branch; the loads are given (no fixtures in the file)
    go(M.placeRun({ storey: lvl, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1/2', points: [[0, 0, 2400], [10000, 0, 2400]], slope: 0 }), 'main');
    go(M.placeRun({ storey: lvl, kind: 'pipe', system: 'cw', mat: 'copper', cls: 'L', size: '1/2', points: [[4000, 0, 2400], [4000, 3000, 2400]], slope: 0 }), 'branch');
    const O = M.worldOf(w(), w().byGuid(lvl), new Map())([0, 0, 0]);          // the storey's place in the world (the IFC2X3 sample is not at the origin)
    const at = (x, y, z) => [x + O[0], y + O[1], z + O[2]];
    const px = (storeyLoads) => C.calcPipes(w(), { system: 'cw', source: at(0, 0, 2400), extraLoads: storeyLoads, opts: { availKpa: 400, minKpa: 100 } });
    const loads = [{ key: 'a', fu: 6, p: at(10000, 0, 2400) }, { key: 'b', fu: 3, p: at(4000, 3000, 2400) }];
    const pc = px(loads);
    ok(pc.ok && pc.res.segs.length === 3 && pc.res.loads.every((l) => l.reached), 'calcPipes reads the runs from the ' + schema + ' file, finds the tee and reaches both loads');
    ok(pc.proposals.length >= 1 && pc.problems.some((p) => p.code === 'pipe.small'), 'the 1/2 in. pipes carrying 6 and 9 fixture units are too small: ' + pc.proposals.map((p) => p.size).join(', '));
    const before = M.readRuns(w()).map((r) => r.size).join();
    go(C.applyProposals(pc.proposals), 'apply sizes');
    const after = M.readRuns(w()).map((r) => r.size).join();
    ok(before !== after && px(loads).problems.every((p) => p.code !== 'pipe.small'), 'applying the proposals is one change and clears the problem (' + before + ' → ' + after + ')');
    ed.undo();
    ok(M.readRuns(w()).map((r) => r.size).join() === before, 'ONE Undo takes all the sizes back');
    ok(C.calcPipes(w(), { system: 'hw', source: [0, 0, 0] }).key === 'calc.norun', 'a system with no runs says so');
    // ducts: AHU supply source typed; a diffuser with a typed airflow
    go(M.placeRun({ storey: lvl, kind: 'duct', system: 'supply', shape: 'rect', w: 200, h: 150, flow: 0, points: [[0, 0, 2700], [6000, 0, 2700]] }), 'duct');
    const dc0 = C.calcDucts(w(), { system: 'supply', source: at(0, 0, 2700), terminals: [{ key: 't1', lps: 400, p: at(6000, 0, 2700) }], opts: { rate: 0.8 } });
    ok(dc0.ok && dc0.res.segs.length === 1 && dc0.proposals.length === 1 && dc0.proposals[0].w > 200, '400 L/s in 200 × 150 is far over 0.8 Pa/m: calcDucts proposes a wider duct (' + dc0.proposals[0]?.w + ' mm)');
    go(C.applyProposals(dc0.proposals), 'size duct');
    const d1 = C.calcDucts(w(), { system: 'supply', source: at(0, 0, 2700), terminals: [{ key: 't1', lps: 400, p: at(6000, 0, 2700) }], opts: { rate: 0.8 } });
    ok(d1.problems.every((p) => p.code !== 'duct.small' && p.code !== 'duct.fast') && d1.res.fanPa > 0, 'after sizing, no duct problem remains; the fan needs ' + d1.res.fanPa.toFixed(1) + ' Pa');
    // a diffuser placed on the duct end: airflow typed on it (setLoad) is read as a terminal
    const lv = OPS.snapshotModel(ed).levels[0].guid;
    const made = go(E.placeEquipment({ storey: lv, kind: 'diffuser', values: { neck: 250, face: 400, system: 'supply' }, x: 8000, y: 0, z: 2700, rot: 0, tag: 'D-1', name: 'diffuser' }), 'diffuser');
    const dg = [...made.made.keys()][0];
    go(C.setLoad(dg, { airflowLps: 120 }), 'airflow');
    ok(w().readPset(M.elementByGuid(w(), dg), 'CadCraft_MepCalc')?.AirflowLps === 120, 'a typed airflow is kept on the element (CadCraft_MepCalc)');
    ed.undo();
    ok(!w().readPset(M.elementByGuid(w(), dg), 'CadCraft_MepCalc'), 'and is one undo step');
    // carriers
    go(C.placeCarrier({ kind: 'tray', storey: lvl, points: [[0, 5000, 2800], [8000, 5000, 2800]], width: 300, depth: 100 }), 'tray');
    go(C.placeCarrier({ kind: 'conduit', storey: lvl, points: [[8000, 5000, 2800], [8000, 8000, 2800]], type: 'emt', size: '1/2' }), 'conduit');
    const runs = M.readRuns(w()).filter((r) => M.carrierOf(r));
    ok(runs.length === 2 && runs.some((r) => r.system === 'conduit' && r.size === '1/2' && r.mat === 'emt' && Math.abs(r.w - 17.9) < 0.01) && runs.some((r) => r.system === 'tray' && r.w === 300), 'a tray and a conduit are drawn as runs of their own systems (conduit OD 17.9 mm for EMT 1/2)');
    const bytes = new TextDecoder().decode(ed.save());
    ok(schema === 'IFC4' ? /IFCCABLECARRIERSEGMENT\([^)]*\.CABLETRAYSEGMENT\./.test(bytes) && /\.CONDUITSEGMENT\./.test(bytes) && /IFCCABLECARRIERFITTING|IFCCABLECARRIERSEGMENT/.test(bytes) : /IFCFLOWSEGMENT/.test(bytes), 'saved as ' + (schema === 'IFC4' ? 'IfcCableCarrierSegment (CABLETRAYSEGMENT / CONDUITSEGMENT)' : 'IfcFlowSegment (IFC2X3)'));
    ok(/IFCDISTRIBUTIONPORT\([^;]*\.CABLECARRIER\./.test(bytes) || schema === 'IFC2X3', 'IFC4 ports are CABLECARRIER ports');
    const cab = CA.parseCablesCsv(`Tag,OD,N,From,To\nC1,10,3,"${at(0, 5000, 2800)}","${at(8000, 8000, 2800)}"\nC2,4,1,"${at(0, 5000, 2800)}","${at(8000, 5000, 2800)}"\n`).cables;
    const cc = C.calcCarriers(w(), { cables: cab });
    ok(cc.ok && cc.routes.get('C1').found && near(cc.routes.get('C1').lengthMm, 11000, 5), 'cables are routed through the drawn tray and conduit (11 m for C1)');
    ok(cc.fills.some((f) => f.kind === 'conduit' && f.fill.pct > 50), 'the 1/2 in. conduit holds three 10 mm cables: far over its limit');
    ok(cc.proposals.length === 1 && cc.problems.some((p) => p.code === 'carrier.fill'), 'a larger conduit is proposed and the problem raised');
    go(C.applyProposals(cc.proposals), 'size conduit');
    ok(M.readRuns(w()).find((r) => r.system === 'conduit').size === cc.proposals[0].size, 'applying it changes the conduit\'s trade size');
    ok(cc.csv.split('\n').length === 4 && /^tag,circuit/.test(cc.csv), 'the cable schedule is a CSV with a header and two cables');
    // lighting: a luminaire written with an IES file; a room given
    const V = []; for (let g = 0; g <= 90; g += 5) V.push(g);
    const iesText = `IESNA:LM-63-2002\n[LUMINAIRE] Test\nTILT=NONE\n1 1000 1 ${V.length} 1 1 2 0 0 0\n1 1 12\n${V.join(' ')}\n0\n${V.map((g) => (1000 * Math.cos(g * Math.PI / 180) / Math.PI).toFixed(3)).join(' ')}\n`;
    let fx = null;
    go((ed2) => { const o = OPS.op((wr) => { const st = wr.byGuid(lvl), sl = wr.api.GetLine(wr.mid, st, false); const lp = wr.placeAt(sl.ObjectPlacement.value, 2000, 2000, 2800, 0); const g = wr.gid(); const id = schema === 'IFC4' ? wr.make('IFCLIGHTFIXTURE', g, wr.ownerHistory(), wr.L('LED'), null, null, wr.H(lp), null, null, 'NOTDEFINED') : wr.make('IFCFLOWTERMINAL', g, wr.ownerHistory(), wr.L('LED'), null, null, wr.H(lp), null, null); wr.noteGuid(g, id); wr.contain(id, st); fx = g; return { id, ids: [id] }; }); return o(ed2); }, 'luminaire');
    ok(!!fx, 'a luminaire is in the model');
    ok((() => { try { C.setPhotometry(fx, 'x.ies', 'junk'); return false; } catch (e) { return e.key === 'ies.nofile'; } })(), 'a file that does not parse is refused with its reason');
    go(C.setPhotometry(fx, 'test.ies', iesText), 'photometry');
    const room = { storey: w().byGuid(lvl), name: 'Office', poly: [[0, 0], [4000, 0], [4000, 4000], [0, 4000]].map((q) => [q[0] + O[0], q[1] + O[1]]), z: O[2] };
    const lc = C.calcLighting(w(), { rooms: [room], height: 0, llf: 1, spacing: 500, targets: { avgLux: 100 } });
    ok(lc.ok && lc.areas[0].luminaires === 1 && near(lc.areas[0].res.stats.max, 1000 / Math.PI / 2.8 ** 2 * 1, 3), 'calcLighting reads the luminaire and its file from the model: peak ' + lc.areas[0].res.stats.max.toFixed(1) + ' lux under a source 2.8 m up');
    ok(lc.problems.some((p) => p.code === 'light.avg') && lc.problems.some((p) => p.code === 'light.direct' && p.severity === 'note'), 'the average target fails with a Problem; the direct-only note is always there');
    ok(C.calcLighting(w(), { rooms: [] }).key === 'calc.noroom', 'no room: told so');
    // the result as colour and a report (EG.4: "shown as numbers and colour, with a report")
    {
      const PH = await import(path.join(APP, 'mep/photometry.js'));
      const hc = PH.heatCells(lc.areas[0].res);
      ok(hc && hc.cells.length === lc.areas[0].res.points.length && hc.aspect > 0.99 && hc.aspect < 1.3 && near(hc.max, lc.areas[0].res.stats.max, 1e-9), 'the grid becomes colour cells for a map: one per point, about square for a 4 × 4 m room, scale up to the room\'s brightest point', hc && hc.aspect);
      const bright = hc.cells.reduce((a, c) => (c.lux > a.lux ? c : a)), dim = hc.cells.reduce((a, c) => (c.lux < a.lux ? c : a));
      ok(bright.color === 'hsl(0 75% 50%)' && /^hsl\((2[0-4]\d|\d{2}|1\d\d) /.test(dim.color) && PH.heatColor(0, 100) === 'hsl(240 75% 50%)' && PH.heatColor(500, 100) === 'hsl(0 75% 50%)' && PH.heatColor(1, 0) === 'hsl(240 75% 50%)', 'red at the brightest point, blue at none, clamped', bright.color + ' / ' + dim.color);
      ok(PH.heatCells({ points: [], values: [], spacing: 500 }) === null && PH.heatCells(null) === null, 'no points: no map');
      const rep = PH.lightingReportCsv([{ ...lc.areas[0], name: '=cmd|x' }]);
      const lines = rep.trim().split('\n');
      ok(/^area,luminaires,area_m2,lumens,watts,w_per_m2,min_lux,avg_lux,max_lux,min_over_avg,targets/.test(lines[0]) && lines[1].startsWith("'=cmd|x,1,16.0,1000,") && lines.length === 2 + 1 + 1 + lc.areas[0].res.points.length, 'the report: a header and a row per area, then every grid point; a formula-looking name is quoted', lines[1]);
    }
    // the assistant tools, to the AI contract (rule 34), on this model
    {
      const AG = await imp('mep-agents.js'), CT = await import(path.join(ROOT, 'tools/mcp/contract.mjs'));
      const env = { ed: () => ed, apply: async (label, op) => ed.modelChange(op, { label: 'Assistant: ' + label }) };
      const tools = AG.mepTools(env), T = Object.fromEntries(tools.map((x) => [x.name, x]));
      if (schema === 'IFC4') {
        const checks = tools.map((x) => [x.name, CT.checkTool(x, { app: 'bimcraft' })]);
        ok(checks.every(([, r]) => !r.errors.length), 'the contract checker finds no error in the ' + tools.length + ' tools', checks.filter(([, r]) => r.errors.length).map(([n, r]) => n + ': ' + r.errors.join('; ')).join(' | '));
        ok(checks.every(([, r]) => !r.warnings.length), 'and no warning', checks.filter(([, r]) => r.warnings.length).map(([n, r]) => n + ': ' + r.warnings.join('; ')).join(' | '));
        ok(tools.filter((x) => x.group === 'edit').every((x) => x.rollbackPreview) && tools.filter((x) => x.group === 'read').every((x) => x.untrusted), 'every edit has a preview and every read is marked as content');
      }
      const pk = T.pipes_check.run({ system: 'cw', source: at(0, 0, 2400), extraLoads: [{ key: 'a', fu: 6, p: at(10000, 0, 2400) }], availKpa: 400, minKpa: 100 });
      ok(pk.total >= 2 && pk.problems.some((p) => p.code === 'pipe.small') && pk.proposals.length >= 1, 'pipes_check: sizes, problems and proposals come back as plain data');
      ok(JSON.stringify(pk).length < 64000, 'and the answer is well under 64 KB');
      let err = null; try { T.pipes_check.run({ system: 'zz' }); } catch (e) { err = e; }
      ok(err?.code === 'not_found' && err.next.length >= 1, 'pipes_check on a system with no runs: a not_found error with something to try');
      const sz = await T.runs_sizes_set.run({ changes: pk.proposals.map((x) => ({ run: x.guid, size: x.size })) });
      ok(sz.changed === pk.proposals.length && T.pipes_check.run({ system: 'cw', source: at(0, 0, 2400), extraLoads: [{ key: 'a', fu: 6, p: at(10000, 0, 2400) }] }).problems.every((p) => p.code !== 'pipe.small'), 'runs_sizes_set applies the proposals (one undo step) and the check is clean');
      ed.undo();
      err = null; try { await T.runs_sizes_set.run({ changes: [{ run: 'nope', size: '1' }] }); } catch (e) { err = e; }
      ok(err?.code === 'not_found', 'runs_sizes_set with an unknown run: not_found');
      err = null; try { await T.loads_set.run({ element: dg }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument', 'loads_set with nothing to set: invalid_argument');
      await T.loads_set.run({ element: dg, airflowLps: 90 });
      const dk = T.ducts_check.run({ system: 'supply', source: at(0, 0, 2700), terminals: [{ key: 'x', p: at(6000, 0, 2700), lps: 100 }] });
      ok(dk.ducts.length >= 1 && dk.fanPa > 0 && dk.problems.some((p) => p.code === 'duct.defaults'), 'ducts_check: pieces, fan pressure and the defaults note');
      const ck = T.carriers_check.run({ cablesCsv: `tag,od,n,from,to\nC1,10,3,"${at(0, 5000, 2800)}","${at(8000, 8000, 2800)}"\n` });
      ok(ck.fills.length === 2 && ck.scheduleCsv.startsWith('tag,circuit') && Array.isArray(ck.problems), 'carriers_check: fill per run, the schedule and Problems');
      err = null; try { T.carriers_check.run({ cablesCsv: 'a,b\n1,2\n3,4' }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument' && err.next.length, 'carriers_check with a bad list: invalid_argument and how to write one');
      const ca = await T.carrier_add.run({ level: lvl, kind: 'tray', points: [[0, 6000, 2800], [3000, 6000, 2800]], widthMm: 200, depthMm: 75 });
      ok(!!ca.run, 'carrier_add draws a tray and returns its id');
      err = null; try { await T.photometry_set.run({ elements: [fx0 || dg], name: 'x.ies', text: 'not a photometric file at all, just some words of the right length' }); } catch (e) { err = e; }
      ok(err?.code === 'invalid_argument', 'photometry_set with text that is not a file: refused with a reason');
      err = null; try { T.lighting_check.run({}); } catch (e) { err = e; }
      ok(err?.code === 'not_found' || err?.code === 'failed', 'lighting_check before any photometry is set: an error that says what to do');
    }
    // the Calculations pane (mep-calc-ui.js) on a stand-in DOM: Check → table → Problems → Apply (one undo step)
    if (schema === 'IFC4') {
      class Node { constructor(tag, doc) { this.tag = tag; this.ownerDocument = doc; this.children = []; this.attrs = {}; this.listeners = {}; this.className = ''; this._text = ''; this.value = ''; }
        setAttribute(k, v) { this.attrs[k] = v; } getAttribute(k) { return this.attrs[k]; } addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
        append(...k) { for (const c of k) this.children.push(typeof c === 'string' ? { text: c } : c); } replaceChildren(...k) { this.children = []; this.append(...k); }
        set textContent(v) { this.children = [{ text: String(v) }]; } get textContent() { return this.children.map((c) => (c.text !== undefined ? c.text : c.textContent)).join(''); } }
      const doc = { createElement: (tag) => new Node(tag, doc) };
      const pane = new Node('div', doc);
      const find = (n, pred, out = []) => { if (n.attrs && pred(n)) out.push(n); for (const c of n.children || []) if (c.attrs) find(c, pred, out); return out; };
      const click = async (n) => { for (const fn of n.listeners.click || []) await fn({}); await new Promise((r) => setTimeout(r, 0)); };
      const UI = await imp('mep-calc-ui.js');
      const posted = [];
      const saved = [];
      const ui = UI.mountMepCalc(pane, { w: () => w(), save: async (name, text) => saved.push([name, text]), apply: async (label, op) => ed.modelChange(op, { label }), problems: { source: () => ({ set: (l) => posted.push(l) }) } });
      ok(find(pane, (n) => n.attrs['data-mepc-tab']).length === 4, 'the pane has four tabs: pipes, ducts, cables, lighting');
      ui.state.pipes.system = 'zz';
      await click(find(pane, (n) => n.attrs['data-mepc-check'] === 'pipes')[0]);
      ok(/mepc\.err\.norun|no runs/i.test(pane.textContent) && posted.at(-1).length === 0, 'a system with no runs: the pane says so and clears its Problems');
      ui.state.pipes.system = 'cw';
      await click(find(pane, (n) => n.attrs['data-mepc-check'] === 'pipes')[0]);
      ok(find(pane, (n) => n.attrs['data-mepc-table'] === 'pipes').length === 1, 'Check on cold water draws the result table', pane.textContent.slice(0, 300));
      ok(find(pane, (n) => n.attrs['data-mepc-problems'] !== undefined).length === 1 && posted.length >= 2, 'its Problems are listed and posted to the shell');
      ui.show('cables');
      ok(find(pane, (n) => n.attrs['data-mepc-field'] === 'cables.csv').length === 1, 'the cables tab has the cable list box');
      ui.show('lighting');
      await click(find(pane, (n) => n.attrs['data-mepc-check'] === 'lighting')[0]);
      ok(/room outline|luminaire|photometric/i.test(pane.textContent), 'the lighting tab with no room drawn (or no file): says what is missing', pane.textContent.slice(0, 200));

      // a site area typed as corners is lit by every luminaire; the result is a colour map and a CSV report
      ui.state.lighting.site = [[0, 0], [4000, 0], [4000, 4000], [0, 4000]].map((q) => (q[0] + O[0]) + ', ' + (q[1] + O[1])).join('\n');
      ui.state.lighting.height = 0; ui.state.lighting.llf = 1;
      ui.show('lighting');
      ui.state.lighting.site = [[0, 0], [4000, 0], [4000, 4000], [0, 4000]].map((q) => (q[0] + O[0]) + ', ' + (q[1] + O[1])).join('\n');
      ui.state.lighting.height = 0; ui.state.lighting.llf = 1;
      await click(find(pane, (n) => n.attrs['data-mepc-check'] === 'lighting')[0]);
      ok(find(pane, (n) => n.attrs['data-mepc-map'] === 'Site area').length === 1 && find(pane, (n) => n.attrs['data-mepc-map'] === 'Site area')[0].children[0].children.length === 64, 'the site area is a colour map of 64 cells (4 × 4 m on a 500 mm grid)', pane.textContent.slice(0, 200));
      await click(find(pane, (n) => n.attrs['data-mepc-csv'] !== undefined)[0]);
      ok(saved.length === 1 && saved[0][0] === 'lighting-report.csv' && /^area,luminaires/.test(saved[0][1]) && /Site area/.test(saved[0][1]), 'Save the report writes the CSV');
    }
    // the Sprinklers add-on end to end: lay out, calculate, place heads and pipe through the add-on API shape (model.write, mep.placeRun)
    {
      const SM = await import(path.join(APP, 'addons/sprinkler/main.js')), CORE = await import(path.join(APP, 'addons/sprinkler/lib/core.js'));
      const strings = JSON.parse(fs.readFileSync(path.join(APP, 'addons/sprinkler/lang/en.json'), 'utf8'));
      const mem = new Map(), cmds = new Map(), said = [], posted = [];
      const spkStorey = (await import(path.join(APP, 'ifc-util.js'))).ids(w().api, w().mid, 'IFCBUILDINGSTOREY')[0];
      const fakeApi = { t: CORE.lookupFrom(strings), storage: { get: (k) => mem.get(k), set: (k, v) => mem.set(k, v) }, status: (x) => said.push(x),
        commands: { add: (n, fn, o) => { if (typeof n !== 'string' || typeof fn !== 'function') throw new Error('commands.add: name and fn'); cmds.set(n, fn); } }, ui: { panelTab: () => null },
        problems: { source: () => ({ set: (list) => posted.push(list) }) },
        model: { read: (fn) => fn(w()), rooms: () => [{ storey: spkStorey, name: 'Hall', poly: [[0, 0], [12000, 0], [12000, 8000], [0, 8000]], z: 0 }, { storey: spkStorey, name: 'Closet', poly: [[0, 0], [1500, 0], [1500, 1000]], z: 0 }], write: async (label, fn) => ed.modelChange(OPS.op((wr) => { const r = fn(wr); return { id: null, ids: [] , r }; }), { label }) },
        mep: { placeRun: async (spec) => ed.modelChange(M.placeRun(spec), { label: 'run' }) } };
      const inst = SM.activate(fakeApi);
      // the room comes from the model (EG.3: "room outline read from the model")
      mem.set('room', '1, 1\n2, 2\n3, 3');
      const rl = inst.rooms();
      ok(rl.length === 2 && rl[0].name === 'Hall' && Math.abs(rl[0].area - 96) < 1e-9 && rl[0].level !== undefined, 'the add-on lists the model\'s rooms with their areas (Hall 96 m²)', JSON.stringify(rl));
      inst.useRoom(0);
      ok(inst.layout().heads.length === 8 && String(mem.get('room')).split('\n').length === 4, 'taking the Hall from the model fills the outline: the layout needs no typing (8 heads)');
      let bad = null; try { inst.useRoom(9); } catch (e) { bad = e.message; }
      ok(bad && /not in the model/.test(bad), 'a room that is gone is refused with a sentence', bad);
      posted.length = 0;   // the layout above posted its Problems: the checks below count from here
      mem.set('room', '0, 0\n12000, 0\n12000, 8000\n0, 8000');
      const lay = inst.layout();
      ok(lay.heads.length === 8, 'the add-on lays out 8 heads for the default room and hazard (' + schema + ')');
      ok(posted.length === 1 && posted[0].every((p) => p.source.name === 'bimcraft.mep.sprinklers'), 'its layout goes to the shell\'s Problems (API 1.3 api.problems)');
      const rc = inst.calc();
      ok(rc.ok === true && posted.length === 2 && posted[1].some((p) => p.code === 'spk.defaults' && p.severity === 'note'), 'the calculation fits the default supply and posts the defaults note');
      mem.set('ps', 2); mem.set('pr', 1); mem.set('qr', 1500);
      ok(typeof inst.csv() === 'string' && /^head,x_mm/.test(inst.csv()), 'the report is a CSV');
      await cmds.get('place')();
      const bytes2 = new TextDecoder().decode(ed.save());
      ok((schema === 'IFC4' ? (bytes2.match(/IFCFIRESUPPRESSIONTERMINAL\(/g) || []).length === 8 && /\.SPRINKLER\./.test(bytes2) : (bytes2.match(/'Sprinkler H\d+'/g) || []).length === 8) && /CadCraft_Sprinkler/.test(bytes2), '8 sprinkler heads are in the model with their property set (' + said.at(-1) + ')');
      const fire = M.readRuns(w()).filter((r) => r.system === 'fire');
      ok(fire.length === 5 && fire.every((r) => r.mat === 'steel' && r.cls === '40'), 'the riser and cross main (one run) and four branch lines — two rows, a side each (' + fire.length + ' runs) are steel Schedule 40 in the fire system, sized by the calculation (' + fire.map((r) => r.size).join(', ') + ')');
    }
    const out = ed.save();
    const eng2 = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((x) => eng2.load(x))(out);
    const ed2 = new IfcEditor(WebIFC, eng2);
    ok(C.readLuminaires(new ModelWriter(WebIFC, ed2.api, ed2.mid)).luminaires.length === 1 && M.readRuns(new ModelWriter(WebIFC, ed2.api, ed2.mid)).filter((r) => M.carrierOf(r)).length === 3, 'reopened: the luminaire with its file and the three carrier runs are still there');
  }
  console.log('\n' + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}
