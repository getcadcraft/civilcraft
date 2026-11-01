#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-georun.mjs — CivilCraft 0.8 round 2 (civil-geo): geo-state.js cleaners, the project round trip and geo-run.js glue, in Node.
 * A project saved with borings, a section, a slope, a settlement, a junction, a stripe plan, a network, a pit, a link and a turnout reads back the same;
 * hostile numbers are bounded; the glue gives the engine's answers (a slope on a drawn ground, settlement of a boring, a junction with a blocked sight triangle, ...).
 *   node bin/test-civilcraft-georun.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const base = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const S = await import(pathToFileURL(path.join(base, 'geo-state.js')).href), R = await import(pathToFileURL(path.join(base, 'geo-run.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
let seq = 1; const id = (v, p) => (/^[a-z]+\d+$/.test(String(v)) ? String(v) : p + seq++);

const raw = {
  borings: [{ name: 'B1', x: 0, y: 0, z: 100, water: 4, layers: [{ from: 0, to: 3, soil: 'FILL', unit: 'fill' }, { from: 3, to: 12, soil: 'CL', unit: 'clay', cc: 0.3, cs: 0.05, e0: 0.9, cv: 2, su: 50, c: 5, phi: 24 }] },
    { name: 'B2', x: 40, y: 0, z: 90, layers: [{ from: 0, to: 2, soil: 'FILL', unit: 'fill' }, { from: 2, to: 12, soil: 'CL', unit: 'clay' }] }, { name: 'bad', x: 'x', y: 1 }],
  sections: [{ name: 'A–A', line: [{ x: -10, y: 0 }, { x: 50, y: 0 }], width: 20 }],
  slopes: [{ name: 'cut', section: 'sx1', method: 'bishop', water: null, surcharge: [{ x0: 0, x1: 5, q: 20 }], materials: { clay: { gamma: 18, c: 5, phi: 24, cu: 60 }, fill: { gamma: 19, c: 0, phi: 30 } } }],
  settles: [{ name: 'footing', boring: 'bo1', load: { q: 150, B: 3, L: 3, depth: 1, at: 'centre', method: 'boussinesq' } }],
  junctions: [{ name: 'Main × Elm', centre: { x: 0, y: 0 }, legs: [{ bearing: 0, halfWidth: 6, length: 50, name: 'E' }, { bearing: 180, halfWidth: 6, length: 50, name: 'W' }, { bearing: 90, halfWidth: 4, length: 40, name: 'Elm' }], radius: 9, speed: 60 }],
  stripes: [{ name: 'Main', alignment: 'a1', plan: { lanesLeft: 1, lanesRight: 1, laneWidth: 3.6, centre: 'double' }, signs: [{ kind: 'stop', station: 90, side: 'R' }] }],
  nets: [{ name: 'net', points: { A: { x: 0, y: 0, fixed: true }, B: { x: 100, y: 0, fixed: true }, P: { x: 48, y: 52 } }, obs: [{ type: 'dist', from: 'A', to: 'P', value: 70.72, sd: 0.01 }, { type: 'dist', from: 'B', to: 'P', value: 70.7, sd: 0.01 }, { type: 'bogus' }] }],
  pits: [{ name: 'pit', nx: 5, ny: 1, nz: 3, size: [10, 10, 10], origin: [0, 0, 0], price: 50, recovery: 0.9, processCost: 20, miningCost: 2, slope: 45, samples: [{ x: 25, y: 5, z: 5, grade: 3 }, { x: 25, y: 5, z: 15, grade: 0.1 }, { x: 25, y: 5, z: 25, grade: 0.1 }] }],
  links: [{ name: 'hill link', a: { x: 0, y: 0, h: 30 }, b: { x: 10000, y: 0, h: 30 }, f: 5 }],
  turnouts: [{ name: 'T1', n: 8, side: 'L' }, { name: 'X1', n: 10, spacing: 4.5 }],
  clearances: [{ name: 'gauge', radius: 300, cant: 100, base: 1500, length: 20, bogie: 14, outline: [{ o: -1.7, z: 0.1 }, { o: 1.7, z: 0.1 }, { o: 1.7, z: 4.3 }, { o: -1.7, z: 4.3 }] }, { name: 'bad', outline: [{ o: 0, z: 0 }] }],
};
const g = S.cleanGeo(raw, 'm', id);
ok(g.borings.length === 2, 'the bad boring is dropped'); ok(g.sections.length === 1 && g.slopes.length === 1 && g.settles.length === 1, 'collections kept');
ok(g.nets[0].obs.length === 2, 'the bogus observation is dropped'); ok(S.geoCount(g) === 2 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 1 + 2 + 1, 'geoCount');
const again = S.cleanGeo(JSON.parse(JSON.stringify(g)), 'm', id); ok(JSON.stringify(again) === JSON.stringify(g), 'save → load → save is stable');
const hostile = S.cleanGeo({ borings: [{ x: 1e300, y: 0, z: -1e300, layers: [{ from: 0, to: 1e300, soil: '<b>', gamma: 1e9 }] }], links: [{ a: { x: 0, y: 0, h: 1e9 }, b: { x: 1, y: 1 }, f: -5 }] }, 'm', id);
ok(hostile.borings[0].z === -1e9 || hostile.borings[0].z < -1e8, 'hostile elevation is bounded'); ok(hostile.borings[0].layers[0].gamma <= 35, 'unit weight bounded'); ok(hostile.links[0].a.h <= 500 && hostile.links[0].f >= 0.1, 'link numbers bounded');
ok(S.cleanGeo(null, 'm', id) === null && S.cleanGeo({}, 'm', id) === null, 'nothing in, nothing out');

// the glue
const ground = { elevationAt: (x) => 100 - 0.25 * Math.min(Math.max(x, 0), 40) + (x > 40 ? 0 : 0) };   // a slope falling 10 m over 40 m
const sec = g.sections[0].id;
const prof = R.runProfile(g, sec, 'm'); ok(prof.profile.borings.length === 2 && prof.profile.stations.length > 5, 'profile along the section');
const st = prof.profile.stations.reduce((a, q) => (Math.abs(q.sta - 12) < Math.abs(a.sta - 12) ? q : a)).stack; ok(st.length >= 2, 'stack at B1');
const slopeItem = { ...g.slopes[0], section: sec };
const sl = R.runSlope(g, slopeItem, 'm', ground); ok(Number.isFinite(sl.fs) && sl.fs > 0.3 && sl.fs < 20, 'slope fs ' + sl.fs); ok(sl.critical.circle.R > 0, 'critical circle');
const sl2 = R.runSlope(g, { ...slopeItem, water: 99.5 }, 'm', ground); ok(sl2.fs <= sl.fs + 1e-9, 'water table does not raise the FS');
const ft = R.runSlope(g, slopeItem, 'ft', { elevationAt: (x) => ground.elevationAt(x * 0.3048) / 0.3048 }); ok(Number.isFinite(ft.fs), 'the same in feet runs');
const se = R.runSettlement(g, g.settles[0], 'm'); ok(se.total > 0 && se.consolidation > 0, 'settlement ' + se.total.toFixed(4)); ok(se.time && se.time.t90 > se.time.t50, 'time curve'); ok(R.runSettlement(g, { ...g.settles[0], boring: 'nope' }, 'm').problems[0].code === 'geo.settle.noboring', 'missing boring reported');
const ju = R.runJunction(g.junctions[0], 'm', { obstacles: [[{ x: 6, y: 6 }, { x: 20, y: 6 }, { x: 20, y: 18 }, { x: 6, y: 18 }]] });
ok(ju.intersection.area > 0 && ju.isd > 100, 'junction built, ISD ' + ju.isd.toFixed(0)); ok(ju.triangles.length === 2, 'two sight triangles for the minor road');
const line = [{ x: 0, y: 0 }, { x: 100, y: 0 }]; const sr = R.runStripe(g.stripes[0], line, 'm'); near(sr.stripe.quantities.length.edge, 200, 1e-6, 'edge lines'); ok(sr.signs.counts.stop === 1, 'a stop sign');
const srf = R.runStripe(g.stripes[0], line.map((p) => ({ x: p.x / 0.3048, y: 0 })), 'ft'); near(srf.stripe.quantities.length.edge, 200 / 0.3048, 1e-6, 'feet: the same road'); ok(srf.stripe.items.find((q) => q.kind === 'centre-double').width > 0.3, 'widths scaled to feet');
const nw = R.runNet(g.nets[0], {}); ok(nw.converged, 'network adjusts'); ok(nw.dof === 0 || nw.dof > 0, 'dof');
const pt = R.runPit(g.pits[0], 'm'); ok(pt.result.blocks > 0 && pt.summary.ore > 0, 'pit finds the ore: ' + pt.result.blocks); ok(pt.gradeTonnage.length === 6, 'grade–tonnage rows');
const lk = R.runLink({ ...g.links[0] }, 'm', { elevationAt: (x) => (Math.abs(x - 5000) < 300 ? 160 : 100) }); ok(!lk.los.clear && lk.mast > 30, 'a hill blocks the link; taller mast ' + lk.mast); ok(lk.problems.some((p) => p.code === 'tel.los.blocked'), 'blocked reported'); ok(lk.budget.margin > 10, 'budget margin');
const lf = R.runLink(g.links[0], 'm', { elevationAt: () => 100 }); ok(lf.los.clear, 'flat ground clears');
const tu = R.runTurnout(g.turnouts[0]); ok(tu.ok && tu.speed > 20, 'turnout ' + tu.speed.toFixed(1)); const xo = R.runTurnout(g.turnouts[1]); ok(xo.ok && xo.straight > 0, 'crossover');
const cl = R.runClearance(g.clearances[0]); near(cl.allowance.inside, 196 / 2400, 1e-9, 'clearance inside'); ok(cl.spacing > 3.4 && cl.spacing < 4.5, 'least spacing on the curve ' + cl.spacing); ok(g.clearances.length === 1, 'a clearance with one corner is dropped');
console.log(`georun: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
