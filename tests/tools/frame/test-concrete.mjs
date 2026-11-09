#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-concrete.mjs — the settings, floors, seismic cases, drift rows, problems and report tables around the concrete checks
 * (0.8 SU.1056, session concrete-08): lib/frame/frame-concrete.js on a two-storey concrete frame, solved with plate-solve.js's floors.
 *
 *   node tools/frame/test-concrete.mjs [--verbose]
 *
 * Expected numbers are hand calculations written out below.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const FC = await load('lib/frame/frame-concrete.js'), FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js');
const RD = await load('lib/frame/rc-design.js'), GEN = await load('lib/frame/frame-combos.js');

const Ec = 4700 * Math.sqrt(28);
// a one-bay (6 × 5 m), two-storey (3.5 m) frame: four columns 400 × 400 (COL400), beams 300 × 600 (B300X600) round each floor
const SECS = [{ id: 's1', name: 'COL400', A: 160000, Iy: 400 ** 4 / 12, Iz: 400 ** 4 / 12, J: 0.141 * 400 ** 4 }, { id: 's2', name: 'B300X600', A: 180000, Iy: 300 * 600 ** 3 / 12, Iz: 600 * 300 ** 3 / 12, J: 1.6e9 }];
function build({ cases = [], combos = [], floors = [], bases = true } = {}) {
  const nodes = [], members = [];
  const P = [[0, 0], [6000, 0], [6000, 5000], [0, 5000]];
  for (const z of [0, 3500, 7000]) P.forEach(([x, y], k) => nodes.push({ id: `n${z}-${k}`, x, y, z }));
  for (const z of [0, 3500]) P.forEach((_, k) => members.push({ id: `c${z}-${k}`, i: `n${z}-${k}`, j: `n${z + 3500}-${k}`, section: 's1', material: 'm', roll: 0 }));
  for (const z of [3500, 7000]) P.forEach((_, k) => members.push({ id: `b${z}-${k}`, i: `n${z}-${k}`, j: `n${z}-${(k + 1) % 4}`, section: 's2', material: 'm', roll: 0 }));
  const raw = { format: FM.FORMAT, version: FM.VERSION, name: 'frame', nodes, materials: [{ id: 'm', name: 'C28', E: Ec, G: Ec / 2.4, rho: 2400 }], sections: SECS, members,
    supports: bases ? P.map((_, k) => ({ node: `n0-${k}`, fix: [true, true, true, true, true, true] })) : [], cases, combos, diaphragms: FC.diaphragmsOf(floors) };
  return FM.cleanFrame(raw).model;
}
const atNode = (m) => (l) => { const q = m.nodes.find((n) => Math.hypot(n.x - l.at[0], n.y - l.at[1], n.z - l.at[2]) < 1e-6); return { type: 'node', node: q.id, F: l.F }; };

console.log('Settings');
{
  ok(FC.cleanConcrete(undefined) === null && FC.cleanConcrete('x') === null, 'nothing / not an object → null (an older file is unchanged)');
  const c = FC.cleanConcrete({ mat: { fc: 9999, fy: 'abc', sway: false }, forms: { col400: { b: 400, h: 400, cage: { ny: 3, nz: 3, d: 25 } }, bad: { b: 10, h: 400 }, '': {} }, floors: [{ id: 'F1', z: 3500, w: 5000 }, { id: 'F1', z: 1 }, { id: 'x', z: 'q' }], seismic: { R: 99, system: 'nope', dir: 'Z' } });
  ok(c.mat.fc === 28 && c.mat.fy === 420 && c.mat.sway === false, 'out-of-range / non-numeric materials fall back; sway false is kept');
  ok(Object.keys(c.forms).join() === 'COL400' && c.forms.COL400.cage.d === 25, 'form names are upper case; a form with b < 50 mm is dropped');
  ok(c.floors.length === 1 && c.floors[0].w === 5000, 'duplicate floor ids and floors with no height are dropped');
  ok(c.seismic.R === 5 && c.seismic.system === 'concrete-mf' && c.seismic.dir === 'both', 'seismic: R above 12, an unknown system and a bad direction fall back');
  const m = build();
  const rc = FC.rcOf({ forms: { COL400: { b: 400, h: 400, cover: 60, cage: { ny: 3, nz: 3, d: 25 }, tie: { legs: 2, d: 10, s: 100 } }, B300X600: { b: 300, h: 600, cover: 60, top: { n: 2, d: 16 }, bottom: { n: 3, d: 20 }, tie: { legs: 2, d: 10, s: 150 } } } }, m);
  ok(rc.code === 'aci318' && rc.sections.s1.bars.length === 8 && rc.sections.s2.bars.length === 5, 'rcOf: a 3 × 3 cage is 8 bars, 2 top + 3 bottom is 5 (sections found by name, keyed by section id)');
  ok(rel(rc.sections.s1.bars[0].A, Math.PI * 25 * 25 / 4) < 1e-12 && rel(rc.sections.s2.ties.Av, 2 * Math.PI * 25) < 1e-12 && rc.sections.s2.ties.s === 150, 'bar area π d²/4; ties Av = legs × π d²/4 (2 × 78.54 mm²)');
  ok(Object.keys(FC.rcOf({}, m).sections).length === 0, 'no forms → no sections (members read "not checked")');
}

console.log('Floors by height');
{
  const m = build();
  const f = FC.suggestFloors(m);
  ok(f.length === 2 && f[0].z === 3500 && f[1].z === 7000 && f[0].id === 'F1', 'two beam levels found above the bases: 3500 and 7000 mm (the base level has no beams)');
  ok(FC.suggestFloors(build({ bases: false })).length === 0, 'no supports → no floors suggested');
  const withF = build({ floors: f });
  ok(withF.diaphragms.length === 2 && withF.diaphragms[0].nodes.length === 4, 'diaphragmsOf: each floor takes the four nodes at its height');
}

console.log('Storey weights from a case');
{
  const floors = [{ id: 'F1', name: 'F1', z: 3500, w: 0 }, { id: 'F2', name: 'F2', z: 7000, w: 0 }];
  const m = build({ floors, cases: [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 1, loads: [] }, { id: 'L', name: 'Live', kind: 'live', selfWeight: 0, loads: [{ type: 'node', node: 'n7000-0', F: [0, 0, -20000, 0, 0, 0] }, { type: 'node', node: 'n3500-2', F: [0, 0, -30000, 0, 0, 0] }] }] });
  const g = 9.80665;
  // hand: concrete 2400 kg/m³. Column 0.4 × 0.4 × 3.5 m = 0.56 m³ = 13.18 kN, beams 0.18 m² × 22 m of beams per floor = 93.2 kN.
  //   F2: top beams + half of the four upper columns; F1: its beams + half of the upper columns + half of the lower ones; the lower columns' other half → ground
  const col = 0.16 * 3.5 * 2400 * g, beams = 0.18 * 22 * 2400 * g;
  const r = FC.floorWeights(m, [{ id: 'D', f: 1 }], floors);
  ok(r.ok && rel(r.weights.F2, beams + 4 * col / 2) < 1e-9 && rel(r.weights.F1, beams + 4 * col) < 1e-9, 'own weight: F2 = beams + ½ upper columns = ' + ((beams + 2 * col) / 1000).toFixed(1) + ' kN, F1 = beams + ½ upper + ½ lower columns = ' + ((beams + 4 * col) / 1000).toFixed(1) + ' kN', (r.weights.F1 / 1000).toFixed(2) + ' / ' + (r.weights.F2 / 1000).toFixed(2));
  ok(rel(r.ground, 2 * col) < 1e-9 && rel(r.total, 8 * col + 2 * beams) < 1e-9, 'the other half of the lower columns goes to the ground; the weights and the ground add up to the whole', (r.ground / 1000).toFixed(2) + ' kN to the ground');
  const l = FC.floorWeights(m, [{ id: 'D', f: 1 }, { id: 'L', f: 0.25 }], floors);
  ok(rel(l.weights.F2 - r.weights.F2, 5000) < 1e-9 && rel(l.weights.F1 - r.weights.F1, 7500) < 1e-9, 'a factor of 0.25 on a live case adds a quarter of its node loads to the floor they are at (5 kN, 7.5 kN)');
  ok(FC.floorWeights(m, [{ id: 'nope', f: 1 }], floors).total === 0 && FC.floorWeights(build({ bases: false }), [], floors).ok === false, 'an unknown case adds nothing; a frame with no supports is refused');
}

console.log('Seismic cases (ELF) and drift');
{
  const floors = [{ id: 'F1', name: 'F1', z: 3500, w: 3000 }, { id: 'F2', name: 'F2', z: 7000, w: 2000 }];
  const concrete = { floors, seismic: { SDS: 1, SD1: 0.6, S1: 0.5, R: 5, Ie: 1, Cd: 4.5, TL: 8, system: 'concrete-mf', risk: 'II', dir: 'both' } };
  const base = build({ floors });
  const made = FC.seismicCases({ model: base }, concrete);
  // hand: hn = 7.0 m = 22.966 ft, Ta = 0.016 × 22.966^0.9 = 0.2686 s (US Ct, 0.9 SU.1056b); Cs = SDS/(R/Ie) = 0.2 (12.8-2) vs SD1/(T R/Ie) = 0.449 → 0.2; W = 5000 kN, V = 1000 kN
  //       k = 1: Cvx = 3000×3.5 : 2000×7 = 10 500 : 14 000 → F1 = 428.571 kN, F2 = 571.429 kN
  const E = made.elf;
  ok(made.ok && rel(E.Ta, 0.016 * Math.pow(7000 / 304.8, 0.9)) < 1e-12 && rel(E.Cs, 0.2) < 1e-12 && E.csEq === '12.8-2', 'Ta = 0.2686 s, Cs = 0.2 (12.8-2)');
  ok(rel(E.V, 1000e3) < 1e-12 && rel(E.levels[0].Fx, 10500 / 24500 * 1000e3) < 1e-12 && rel(E.levels[1].Fx, 14000 / 24500 * 1000e3) < 1e-12, 'V = 1000 kN; F1 = 428.6 kN, F2 = 571.4 kN');
  ok(made.cases.map((c) => c.id).join() === 'EX1,EX2,EY1,EY2' && made.cases.every((c) => c.kind === 'seismic' && c.gen === 'elf' && c.loads.length === 2), 'four cases (X and Y, torsion each way), one node load per floor');
  const one = FC.seismicCases({ model: base }, { ...concrete, seismic: { ...concrete.seismic, dir: 'Y' } });
  ok(one.cases.map((c) => c.id).join() === 'EY1,EY2', 'direction Y → two cases');
  ok(FC.seismicCases({ model: base }, { floors: [] }).error === 'no-floors' && FC.seismicCases({ model: base }, { floors: [{ id: 'F1', z: 3500, w: 0 }] }).error === 'no-weights' && FC.seismicCases({ model: build() }, concrete).error === 'no-floors', 'no floors / no weights / floors the frame does not have are refused with a reason');
  const m = build({ floors, cases: made.cases.map((c) => ({ ...c, loads: c.loads.map(atNode(base)) })), combos: [] });
  const sol = FS.solveFrame(m);
  ok(sol.ok, 'the floors and the seismic cases solve');
  const ex = sol.results['case:EX1'], ex2 = sol.results['case:EX2'];
  const sumFx = (R) => { let s = 0; for (let k = 0; k < m.nodes.length; k++) s += R.reactions[6 * k]; return s; };
  ok(rel(-sumFx(ex), 1000e3) < 1e-6 && rel(-sumFx(ex2), 1000e3) < 1e-6, 'the base reactions add up to V = 1000 kN in both torsion variants', (sumFx(ex) / 1000).toFixed(2));
  const rows = FC.driftRows({ model: m }, sol, concrete);
  const x1 = rows.find((r) => r.set === 'EX1' && r.id === 'F1'), x2 = rows.find((r) => r.set === 'EX1' && r.id === 'F2');
  ok(rows.length === 8 && x1 && x2 && x1.dir === 'X', 'drift: 2 floors × 4 cases');
  ok(x1.elastic > 0 && rel(x1.design, 4.5 * x1.elastic) < 1e-12 && rel(x1.allowed, 0.02 * 3500) < 1e-12, 'Cd δxe / Ie = 4.5 δxe against 0.020 hsx = 70 mm (Table 12.12-1, risk II)');
  const ey = rows.find((r) => r.set === 'EY1' && r.id === 'F1');
  ok(ey.dir === 'Y' && ey.elastic > 0 && ey.elastic !== x1.elastic, 'the Y cases read the Y movement of the floors (own value, not the X one)', ey.elastic.toFixed(3) + ' vs ' + x1.elastic.toFixed(3) + ' mm');
  // torsion: the two variants load the floor with +/− 5 % of the plan size × F → the corner nodes move differently
  const worst = (R) => Math.max(...FC.driftRows({ model: m }, { ok: true, prep: sol.prep, results: { 'case:EX1': R } }, concrete).map((r) => r.elastic));
  ok(Math.abs(worst(ex) - worst(ex2)) < 1e-9 * worst(ex) + 1e-9, 'a symmetric frame: torsion in either sense gives the same worst corner drift');
  // checks with bars and the problems
  const forms = { COL400: { b: 400, h: 400, cover: 60, cage: { ny: 3, nz: 3, d: 25 }, tie: { legs: 2, d: 10, s: 100 } }, B300X600: { b: 300, h: 600, cover: 60, top: { n: 2, d: 16 }, bottom: { n: 3, d: 20 }, tie: { legs: 2, d: 10, s: 150 } } };
  const cmb = GEN.generateCombos('asce-aisc', [{ id: 'D', kind: 'dead' }, { id: 'EX1', kind: 'seismic' }, { id: 'EX2', kind: 'seismic' }], {});
  const m2 = build({ floors, cases: [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 1, loads: [] }, ...made.cases.map((c) => ({ id: c.id, name: c.name, kind: 'seismic', selfWeight: 0, loads: c.loads.map(atNode(base)) }))], combos: cmb.combos });
  const sol2 = FS.solveFrame(m2);
  const rc = RD.checkRcFrame(m2, sol2, FC.rcOf({ forms, floors, seismic: concrete.seismic }, m2));
  ok(sol2.ok && rc.ok && rc.counts.checked === m2.members.length && rc.combos === cmb.combos.filter((c) => c.limit === 'strength').length, 'the concrete checks run on the floor model with the generated combinations', JSON.stringify(rc.counts));
  const tr = (k, v) => k + (v ? ' ' + JSON.stringify(v) : '');
  const lab = (id) => 'L' + id;
  const thin = RD.checkRcFrame(m2, sol2, FC.rcOf({ forms: { ...forms, B300X600: { ...forms.B300X600, bottom: { n: 2, d: 10 }, top: { n: 2, d: 10 } } } }, m2));
  const probs = FC.problemsOf({ rc: thin, drift: [], label: lab, t: tr });
  const failing = thin.members.filter((q) => q.status === 'fail').length;
  ok(failing > 0 && probs.filter((p) => p.code === 'rc.fail').length === failing, 'every failing member is one problem', failing + ' failing');
  ok(probs.every((p) => p.id && p.source.name === 'detailcraft.frame' && p.about[0].kind === 'member' && (p.severity === 'warning' || p.severity === 'note')), 'problems carry a stable id, the source and the member');
  ok(probs.filter((p) => p.code === 'rc.fail').every((p) => p.req.op === '<=' && p.req.value === 1 && p.found.value > 1), 'required ≤ 1.0, found = utilisation > 1');
  const dprob = FC.problemsOf({ rc: null, drift: [{ id: 'F1', name: 'F1', set: 'EX1', setName: 'EX1', ratio: 1.5, design: 105, allowed: 70 }, { id: 'F2', name: 'F2', set: 'EX1', setName: 'EX1', ratio: 0.5, design: 35, allowed: 70 }], t: tr });
  ok(dprob.length === 1 && dprob[0].code === 'seismic.drift' && dprob[0].found.value === 105 && dprob[0].req.value === 70, 'a drift over the limit is a problem (required ≤ allowed mm, found = design drift); within the limit is not');
  const tables = FC.concreteTables({ rc, elf: E, drift: rows, concrete: { forms, floors, seismic: concrete.seismic } }, tr);
  ok(tables.length === 7 && tables.every((q) => q.title && q.head.length && q.rows.every((r) => r.length === q.head.length)), 'report: 7 tables, every row as wide as its head', tables.map((q) => q.rows.length).join());
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
