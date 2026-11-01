#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-period.mjs — the period from the analysis (0.8 round 3, SU.1056 next step; frame-concrete.js rayleighPeriods): Rayleigh's quotient against the
 * single-degree-of-freedom closed form T = 2π √(m/k), the cap at Cu·Ta, the ELF forces built with it, one period per direction.
 *   node tools/frame/test-period.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const FC = await load('lib/frame/frame-concrete.js'), FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), LA = await load('lib/frame/loads-asce7.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

const Ec = 4700 * Math.sqrt(28), side = 400, I = side ** 4 / 12;
const SEC = [{ id: 's1', name: 'COL400', A: side * side, Iy: I, Iz: I, J: 0.141 * side ** 4 }];
// cantilever columns carrying a rigid floor: n columns h high, the floors at the given heights (no beams), weight w kN each floor
function build(h, floors, nCols = 4) {
  const P = [[0, 0], [6000, 0], [6000, 5000], [0, 5000]].slice(0, nCols);
  const nodes = [], members = [];
  const zs = [0, ...floors.map((f) => f.z)];
  for (const z of zs) P.forEach(([x, y], k) => nodes.push({ id: `n${z}-${k}`, x, y, z }));
  for (let i = 0; i < zs.length - 1; i++) P.forEach((_, k) => members.push({ id: `c${i}-${k}`, i: `n${zs[i]}-${k}`, j: `n${zs[i + 1]}-${k}`, section: 's1', material: 'm', roll: 0 }));
  const raw = { format: FM.FORMAT, version: FM.VERSION, name: 'f', nodes, materials: [{ id: 'm', name: 'C28', E: Ec, G: Ec / 2.4, rho: 0 }], sections: SEC, members,
    supports: P.map((_, k) => ({ node: `n0-${k}`, fix: [true, true, true, true, true, true] })), cases: [], combos: [], diaphragms: FC.diaphragmsOf(floors) };
  return FM.cleanFrame(raw).model;
}
const concrete = (floors, extra = {}) => ({ mat: {}, floors, seismic: { SDS: 1, SD1: 0.6, S1: 0.5, R: 5, Ie: 1, Cd: 4.5, TL: 8, system: 'concrete-mf', dir: 'both', ...extra } });
const atNode = (m) => (l) => { const q = m.nodes.find((n) => Math.hypot(n.x - l.at[0], n.y - l.at[1], n.z - l.at[2]) < 1e-6); return { type: 'node', node: q.id, F: l.F }; };
function solveWith(floors, c, h = 4000) {
  const base = build(h, floors);
  const made = FC.seismicCases({ model: base }, c);
  const m = build(h, floors);
  m.cases = made.cases.map((q) => ({ id: q.id, name: q.name, kind: 'seismic', selfWeight: 0, loads: q.loads.map(atNode(base)) }));
  return { made, frame: { model: m }, sol: FS.solveFrame(m) };
}

console.log('One degree of freedom');
{
  const floors = [{ id: 'F1', name: 'F1', z: 4000, w: 800 }];
  const c = concrete(floors);
  const { made, frame, sol } = solveWith(floors, c);
  ok(made.ok && sol.ok, 'the floor and its seismic cases solve');
  const rp = FC.rayleighPeriods(frame, sol, c);
  ok(rp.ok && rp.X && rp.Y, 'a period for each direction');
  // hand: four cantilever columns, k = 4 · 3EI/h³ (N/mm), m = W/g
  const k = 4 * 3 * Ec * I / 4000 ** 3, W = 800e3, T = 2 * Math.PI * Math.sqrt((W / 9.80665 / 1000) / k * 1000);   // m in kg: W/g; k in N/mm → N/m: ×1000
  const Tm = 2 * Math.PI * Math.sqrt((W / 9.80665) / (k * 1000));
  ok(rel(rp.X.T, Tm) < 1e-6 && rel(rp.Y.T, Tm) < 1e-6, 'SDOF: Rayleigh = 2π √(m/k) exactly (both directions)', [rp.X.T, rp.Y.T, Tm]);
  ok(Tm > 0.3 && Tm < 3, 'the number is a sensible building period (' + Tm.toFixed(3) + ' s)');
  void T;
  // a heavier floor makes a longer period by √2 when the weight doubles
  const c2 = concrete([{ ...floors[0], w: 1600 }]);
  const s2 = solveWith([{ ...floors[0], w: 1600 }], c2);
  ok(rel(FC.rayleighPeriods(s2.frame, s2.sol, c2).X.T / rp.X.T, Math.SQRT2) < 1e-6, 'twice the weight: √2 times the period');
  // the force level does not matter (a different R scales the forces, not the period)
  const c3 = concrete(floors, { R: 3 });
  const s3 = solveWith(floors, c3);
  ok(rel(FC.rayleighPeriods(s3.frame, s3.sol, c3).X.T, rp.X.T) < 1e-9, 'the period does not depend on the force level (R)');
}

console.log('Several floors');
{
  const floors = [{ id: 'F1', name: 'F1', z: 3500, w: 600 }, { id: 'F2', name: 'F2', z: 7000, w: 500 }];
  const c = concrete(floors);
  const { frame, sol } = solveWith(floors, c);
  const rp = FC.rayleighPeriods(frame, sol, c);
  ok(rp.ok && rp.X.floors.length === 2 && rp.X.floors[0].delta > 0 && rp.X.floors[1].delta > rp.X.floors[0].delta, 'the top floor moves more than the first');
  ok(rel(rp.X.floors.reduce((a, f) => a + f.f, 0), FC.seismicCases({ model: frame.model }, c).elf.V) < 1e-9, 'the forces read from the case add up to the base shear V');
  // Rayleigh is an upper bound of the first mode: the second storey stiffening can only shorten it. Compare against the lumped two-mass lowest mode from the model's own stiffness
  // (shear-building estimate of the storey stiffnesses from the two storeys' drifts under the case's own shears)
  const dX = rp.X.floors.map((f) => f.delta);
  const V2 = rp.X.floors[1].f, V1 = rp.X.floors[0].f + V2;
  const k1 = V1 / dX[0], k2 = V2 / (dX[1] - dX[0]);   // N/m (δ in m)
  const m1 = 600e3 / 9.80665, m2 = 500e3 / 9.80665;
  const tr = (k1 + k2) / m1 + k2 / m2, det = (k1 + k2) * k2 / (m1 * m2) - k2 * k2 / (m1 * m2);
  const w2 = (tr - Math.sqrt(tr * tr - 4 * det)) / 2, Texact = 2 * Math.PI / Math.sqrt(w2);
  ok(rel(rp.X.T, Texact) < 0.02, 'Rayleigh is within 2 % of the two-mass period of a shear model built from the same drifts (a cross-check, not a bound)', [rp.X.T, Texact]);
}

console.log('In the ELF');
{
  const floors = [{ id: 'F1', name: 'F1', z: 3500, w: 600 }, { id: 'F2', name: 'F2', z: 7000, w: 500 }];
  const c0 = concrete(floors);
  const a = FC.seismicCases({ model: solveWith(floors, c0).frame.model }, c0);
  const Ta = a.elf.Ta;
  ok(a.elf.T === Ta && a.elfBy.X.T === Ta && a.elfBy.Y.T === Ta, 'without the switch the approximate period Ta is used');
  const { frame, sol } = solveWith(floors, c0), rp = FC.rayleighPeriods(frame, sol, c0);
  const c1 = concrete(floors, { useT: true, Tx: rp.X.T, Ty: rp.Y.T });
  const b = FC.seismicCases(frame, c1);
  const Cu = LA.cuFactor(0.6);
  ok(b.elfBy.X.T === Math.min(rp.X.T, Cu * Ta), 'with the switch the period is the analysed one, capped at Cu·Ta (12.8.2)', [b.elfBy.X.T, rp.X.T, Cu * Ta]);
  const capped = FC.seismicCases(frame, concrete(floors, { useT: true, Tx: 5, Ty: 5 }));
  ok(capped.elfBy.X.T === Cu * Ta && capped.elfBy.X.T < 5, 'a long period is cut off at Cu·Ta', [capped.elfBy.X.T, Cu * Ta]);
  const unequal = FC.seismicCases(frame, concrete(floors, { SDS: 2, SD1: 0.3, useT: true, Tx: Ta * 0.9, Ty: Ta * 1.1 }));   // Cs = SD1/(T·R) below the plateau, so the period changes the force
  ok(unequal.elfBy.X.T !== unequal.elfBy.Y.T && unequal.cases.find((q) => q.id === 'EX1').loads.reduce((a, l) => a + Math.abs(l.F[0]), 0) !== unequal.cases.find((q) => q.id === 'EY1').loads.reduce((a, l) => a + Math.abs(l.F[1]), 0), 'one period per direction gives each direction its own forces');
  ok(FC.cleanConcrete({ seismic: { useT: 'yes', Tx: -1, Ty: 99 } }).seismic.useT === false && FC.cleanConcrete({ seismic: { Tx: -1, Ty: 99 } }).seismic.Tx === null, 'settings are cleaned: useT only true, periods in range');
  ok(FC.rayleighPeriods(frame, { ok: true, results: {}, prep: sol.prep }, c0).error === 'no-weights' || FC.rayleighPeriods(frame, { ok: true, results: {}, prep: sol.prep }, c0).ok === false, 'no seismic case solved → refused');
  ok(FC.rayleighPeriods(frame, sol, concrete([{ id: 'F1', name: 'F1', z: 3500, w: 0 }, { id: 'F2', name: 'F2', z: 7000, w: 0 }])).ok === false, 'floors with no weight → refused');
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
