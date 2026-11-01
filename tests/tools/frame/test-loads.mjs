#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-loads.mjs — seismic loads by ASCE/SEI 7-22 equivalent lateral force, on rigid floors, and the drift check (0.8 SU.1056
 * step 4): lib/frame/loads-asce7.js with plate-solve.js's floors.
 *
 *   node tools/frame/test-loads.mjs [--verbose]
 *
 * Expected numbers are hand calculations written out below, each naming its ASCE 7-22 equation. No printed worked example
 * (e.g. the FEMA P-2192 / NEHRP design examples, or the SEAOC Seismic Design Manual) is typed in yet — see the session log.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const L7 = await load('lib/frame/loads-asce7.js');
const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), PS = await load('lib/frame/plate-solve.js');

console.log('Period, Cs, k (ASCE 7-22 12.8)');
// concrete moment frame, hn = 10.5 m: Ta = 0.0466 × 10.5^0.9 = 0.0466 × 8.3001 = 0.38678 s (12.8-8, Table 12.8-2 SI)
ok(rel(L7.approxPeriod('concrete-mf', 10500), 0.0466 * Math.pow(10.5, 0.9)) < 1e-12 && rel(L7.approxPeriod('concrete-mf', 10500), 0.38678) < 1e-4, 'Ta = Ct hn^x = 0.3868 s (concrete moment frame, 10.5 m)');
ok(rel(L7.cuFactor(0.25), 1.45) < 1e-12 && L7.cuFactor(0.6) === 1.4 && L7.cuFactor(0.05) === 1.7, 'Cu (Table 12.8-1): 1.45 at SD1 = 0.25 (between 0.2 → 1.5 and 0.3 → 1.4), 1.4 above 0.4, 1.7 below 0.1');
ok(rel(L7.periodUsed({ T: 1.0, Ta: 0.38678, SD1: 0.6 }), 1.4 * 0.38678) < 1e-12 && L7.periodUsed({ Ta: 0.4, SD1: 0.6 }) === 0.4, 'an analysed period is capped at Cu Ta; none given → Ta');
let c = L7.seismicCs({ SDS: 1.0, SD1: 0.6, S1: 0.5, R: 8, Ie: 1, T: 0.38678 });
ok(c.Cs === 0.125 && c.eq === '12.8-2', 'Cs = SDS / (R/Ie) = 0.125 (12.8-2) when below SD1/(T R/Ie) = 0.194');
c = L7.seismicCs({ SDS: 1.0, SD1: 0.6, S1: 0.5, R: 8, Ie: 1, T: 1.2 });
ok(rel(c.Cs, 0.0625) < 1e-12 && c.eq === '12.8-3', 'T = 1.2 s: Cs = SD1 / (T R/Ie) = 0.0625 (12.8-3)');
c = L7.seismicCs({ SDS: 1.0, SD1: 0.6, S1: 0.5, R: 8, Ie: 1, T: 10, TL: 8 });
ok(rel(c.max, 0.6 * 8 / (100 * 8)) < 1e-12 && c.Cs === 0.044 && c.eq === '12.8-5', 'T > TL: SD1 TL / (T² R/Ie) = 0.006 is below 0.044 SDS Ie → Cs = 0.044 (12.8-5)');
c = L7.seismicCs({ SDS: 1.0, SD1: 0.6, S1: 0.75, R: 8, Ie: 1, T: 10, TL: 8 });
ok(rel(c.Cs, 0.5 * 0.75 / 8) < 1e-12 && c.eq === '12.8-6', 'S1 ≥ 0.6 g: at least 0.5 S1 / (R/Ie) = 0.0469 (12.8-6)');
ok(L7.exponentK(0.4) === 1 && L7.exponentK(3) === 2 && rel(L7.exponentK(1.5), 1.5) < 1e-12, 'k = 1 to 0.5 s, 2 from 2.5 s, 1.5 at 1.5 s (12.8.3)');

console.log('Storey forces (12.8.3)');
{
  // three floors at 3.5, 7.0, 10.5 m, 5000 kN each, SDS 1.0, SD1 0.6, R 8, Ie 1, concrete moment frame:
  //   Ta = 0.3868 s → Cs = 0.125, W = 15 000 kN, V = 1875 kN, k = 1 → Cvx = 1 : 2 : 3 / 6 → 312.5, 625, 937.5 kN
  const r = L7.elf({ levels: [{ id: 'L2', z: 7000, w: 5e6 }, { id: 'L1', z: 3500, w: 5e6 }, { id: 'L3', z: 10500, w: 5e6 }], base: 0, SDS: 1.0, SD1: 0.6, S1: 0.5, R: 8, Ie: 1, system: 'concrete-mf' });
  ok(rel(r.V, 1875e3) < 1e-12 && r.k === 1 && rel(r.T, 0.38678) < 1e-4, 'V = Cs W = 0.125 × 15 000 kN = 1875 kN, T = Ta, k = 1');
  ok(r.levels.map((l) => l.id).join() === 'L1,L2,L3' && [312.5e3, 625e3, 937.5e3].every((F, k) => rel(r.levels[k].Fx, F) < 1e-12), 'Fx = 312.5, 625, 937.5 kN (lowest first)');
  ok(rel(r.levels[0].Vx, 1875e3) < 1e-12 && rel(r.levels[2].Vx, 937.5e3) < 1e-12, 'storey shears add down: 1875 kN at the base storey');
  const r2 = L7.elf({ levels: [{ id: 'A', z: 4000, w: 2e6 }, { id: 'B', z: 8000, w: 1e6 }], base: 0, SDS: 1, SD1: 0.6, R: 8, T: 1.5, system: 'other' });
  // Ta = 0.0488 × 8^0.75 = 0.2321 s; Cu Ta = 1.4 × 0.2321 = 0.325 s < 1.5 → T = 0.325, k = 1
  ok(rel(r2.T, 1.4 * 0.0488 * Math.pow(8, 0.75)) < 1e-12 && r2.k === 1, 'an analysed 1.5 s is capped at Cu Ta = 0.325 s');
  const r3 = L7.elf({ levels: [{ id: 'A', z: 4000, w: 2e6 }, { id: 'B', z: 8000, w: 1e6 }], base: 0, SDS: 1, SD1: 0.6, R: 8, T: 1.5, system: 'steel-mf' });
  const T3 = r3.T, k3 = 1 + (T3 - 0.5) / 2;
  ok(rel(r3.levels[1].Cvx, 1e6 * 8 ** k3 / (2e6 * 4 ** k3 + 1e6 * 8 ** k3)) < 1e-12, 'k between 1 and 2 shapes Cvx = wx hx^k / Σ wi hi^k', 'T ' + T3.toFixed(3) + ' s, k ' + k3.toFixed(3));
}

console.log('On the floors, and the drift check (12.8.4.2, 12.8.6, Table 12.12-1)');
{
  const E = 200000, G = 77000, I = 1e8, J = 2e6, h = 3500;
  const corners = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  const nodes = [], members = [], supports = [];
  corners.forEach(([x, y], k) => {
    for (let s = 0; s <= 2; s++) nodes.push({ id: `c${k}_${s}`, x, y, z: s * h });
    for (let s = 0; s < 2; s++) members.push({ id: `m${k}_${s}`, i: `c${k}_${s}`, j: `c${k}_${s + 1}`, section: 'S', material: 's' });
    supports.push({ node: `c${k}_0`, fix: [1, 1, 1, 1, 1, 1].map(Boolean) });
  });
  const base = { format: 'cadcraft-frame', version: 1, nodes, members, supports, materials: [{ id: 's', E, G, rho: 0 }], sections: [{ id: 'S', A: 1e4, Iy: I, Iz: I, J }], combos: [],
    diaphragms: [{ id: 'L1', z: h }, { id: 'L2', z: 2 * h }] };
  const m0 = FM.cleanFrame({ ...base, cases: [] }).model;
  const e = L7.elf({ levels: [{ id: 'L1', z: h, w: 400e3 }, { id: 'L2', z: 2 * h, w: 300e3 }], base: 0, SDS: 0.8, SD1: 0.4, R: 3, Ie: 1, system: 'steel-mf' });
  const forces = Object.fromEntries(e.levels.map((l) => [l.id, l.Fx]));
  const EX = L7.floorCase(m0, { id: 'EX', dir: 'X', forces, ecc: 0.05, sign: 1 });
  const E0 = L7.floorCase(m0, { id: 'E0', dir: 'X', forces, ecc: 0 });
  const m = FM.cleanFrame({ ...base, cases: [EX, E0] }).model;
  const sol = FS.solveFrame(m);
  ok(sol.ok && m.cases[0].loads.length === 2, 'the ELF case puts one force per floor (at the floor\'s master point, through a node + moment)');
  const R0 = sol.results['case:E0'], Rx = sol.results['case:EX'];
  ok(Math.abs(R0.masters[2]) < 1e-15 && Math.abs(R0.masters[5]) < 1e-15, 'with no eccentricity the floors do not turn (the node force was moved to the master exactly)');
  const k = 3 * E * I / h ** 3;
  // top floor: torsion of the group by superposition as for sway; here only check the applied torque per floor
  const Mt = [0, 1].map((i) => 0.05 * 4000 * e.levels[i].Fx);
  const applied = Rx.applied[5] - R0.applied[5];                    // about the origin; the no-eccentricity case takes out F × ym
  ok(rel(applied, Mt[0] + Mt[1]) < 1e-9 && rel(R0.applied[5], -2000 * e.V) < 1e-9, 'accidental torsion = F × 5 % × 4 m per floor (12.8.4.2); without it the forces act at the floors\' centres (y = 2 m)', (applied / 1e6).toFixed(3) + ' kN·m');
  ok(rel(R0.applied[0], e.V) < 1e-12, 'the case carries the whole base shear V');
  const dr = PS.storyDrifts(sol.prep, Rx);
  const chk = L7.driftCheck(dr, { Cd: 3, Ie: 1, risk: 'II', dir: 'X' });
  ok(chk.length === 2 && chk.every((c, i) => rel(c.design, 3 * Math.abs(dr[i].maxX.value)) < 1e-12 && rel(c.allowed, 0.02 * h) < 1e-12), 'design drift = Cd δxe / Ie (12.8-15), allowed 0.020 hsx (Table 12.12-1, risk II)', chk.map((c) => c.design.toFixed(2) + ' / ' + c.allowed.toFixed(0) + ' mm').join(', '));
  const iv = L7.driftCheck(dr, { Cd: 3, Ie: 1.5, risk: 'IV' });
  ok(rel(iv[0].allowed, 0.010 * h) < 1e-12 && rel(iv[0].design, 3 * Math.abs(dr[0].maxX.value) / 1.5) < 1e-12, 'risk IV: 0.010 hsx; Ie divides the design drift');
  ok(dr[0].maxX.ratio > dr[0].ratioX, 'accidental torsion makes the edge drift more than the centre');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
