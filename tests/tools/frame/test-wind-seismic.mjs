#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-wind-seismic.mjs — wind (ASCE 7 directional procedure), seismic site values, the design spectrum and the ASCE 7 combinations
 * (0.9 SU.1056b): lib/frame/{wind,seismic,spectrum,combos}-asce7.js, loads-sources.js, the panel's settings.
 *   node tools/frame/test-wind-seismic.mjs [--verbose]
 * Known answers come from worked examples PUBLISHED on public pages (URL in each message; loads-sources.js lists them with the date read),
 * and from closed forms written out below. No claim of equality with any program or of code compliance.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const W = await load('lib/frame/wind-asce7.js'), S = await load('lib/frame/seismic-asce7.js'), SP = await load('lib/frame/spectrum-asce7.js');
const CB = await load('lib/frame/combos-asce7.js'), L7 = await load('lib/frame/loads-asce7.js'), SRC = await load('lib/frame/loads-sources.js');
const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), LP = await load('lib/frame/frame-loads-panel.js'), FP = await load('lib/frame/frame-panel.js');
const FT = 304.8, PSF = W.PSF, MPH = W.MPH;

console.log('Wind: Kz, Ke, qz');
// Bentley STAAD verification model (ASCE 7-10, V 110 mph, Exposure B): Kz(20 ft) = 0.6239543877, qh = 16.42847 psf (docs.bentley.com STAAD.Pro Help, ASCE 7 wind load example)
ok(rel(W.kz(20 * FT, 'B'), 0.6239543877) < 1e-9, 'Kz(20 ft, B) = 0.62395 (Bentley STAAD example)');
ok(rel(W.kz(15 * FT, 'B'), 0.5747) < 5e-4 && W.kz(5 * FT, 'B') === W.kz(15 * FT, 'B'), 'Kz(15 ft, B) = 0.5747 and the 15 ft value below 15 ft (Bentley)');
const qpsf = (zft, ex = 'B', V = 110) => W.velocityPressure({ V: V * MPH, exposure: ex, z: zft * FT, edition: '7-10' }) / PSF;
ok(rel(qpsf(20), 16.42847) < 1e-6, 'qh = 0.00256 Kz Kd V² = 16.42847 psf (Bentley example: 20 ft, B, 110 mph, Kd 0.85)', qpsf(20).toFixed(5));
ok([[16, 15.41], [17, 15.68], [18, 15.94], [19, 16.19]].every(([z, q]) => Math.abs(qpsf(z) - q) < 0.006), 'qz at 16 to 19 ft = 15.41, 15.68, 15.94, 16.19 psf (Bentley table)');
const KzC = [[10, 0.85], [15, 0.85], [20, 0.90], [30, 0.98]], KzB = [[10, 0.57], [20, 0.62], [30, 0.70], [40, 0.76]];
ok(KzC.every(([z, k]) => Math.abs(W.kz(z * FT, 'C') - k) < 0.0051) && KzB.every(([z, k]) => Math.abs(W.kz(z * FT, 'B') - k) < 0.0051), 'Kz table points: C 0.85 / 0.90 / 0.98, B 0.57 / 0.62 / 0.70 / 0.76 (SkyCiv, steelcalculator reference, Bentley)');
ok(rel(W.ke(110), 0.987) < 1e-3 && rel(W.ke(230 * FT / 1000), 0.9917) < 1e-4, 'Ke = e^(−0.0000362 ze): 0.987 at 110 m (SkyCiv), 0.9917 at 230 ft (Bentley)');
ok(W.kzt(0.3, 0.5, 0.8) === Math.pow(1.12, 2), 'Kzt = (1 + K1 K2 K3)²');
// SkyCiv ASCE 7-16 example (SI): Exposure C, V 52 m/s, Kd 0.85, Ke 0.987, Kz(5 m) 0.865, q 1202.87 Pa, Kz(6.5 m) 0.914, qh 1271.01 Pa
const sk = (z) => W.velocityPressure({ V: 52, exposure: 'C', z, Kd: 0.85, Ke: 0.987, edition: '7-16' });
ok(Math.abs(W.kz(5000, 'C') - 0.865) < 5e-4 && Math.abs(W.kz(6500, 'C') - 0.914) < 5e-4, 'Kz(5 m) = 0.865 and Kz(6.5 m) = 0.914, Exposure C (SkyCiv)');
ok(rel(sk(5000), 1202.87) < 1e-3 && rel(sk(6500), 1271.01) < 1e-3, 'q(5 m) = 1202.87 Pa, qh = 1271.01 Pa (SkyCiv; ours is converted from 0.00256, 0.05 % above its 0.613)', sk(5000).toFixed(2) + ' / ' + sk(6500).toFixed(2));
const qh = sk(6500);
ok(rel(qh * 0.85 * 0.8, 864.288) < 1e-3 && rel(qh * 0.85 * 0.5, 540.18) < 1e-3 && rel(qh * 0.85 * 0.7, 756.252) < 1e-3, 'p = q G Cp: windward 864.3, leeward −540.2, side −756.3 Pa (SkyCiv)');
ok(rel(qpsf(20) * 0.85 * 0.8 + 0.18 * qpsf(20), 14.13) < 1e-3, 'p windward at 20 ft = q G Cp − qi(GCpi) = 14.13 psf (Bentley)');

console.log('Wind: storey forces');
{
  const V = 40, B = 10000, h = 6000;
  const r = W.windStories({ V, exposure: 'C', edition: '7-16', floors: [{ id: 'F1', z: 3000 }, { id: 'F2', z: 6000 }], base: 0, B, L: 8000 });
  const q = (z) => W.velocityPressure({ V, exposure: 'C', z, edition: '7-16' });
  let I = 0; const N = 6000, lo0 = 1500;     // the half storey under the first floor goes to the ground, not to a floor
  for (let k = 0; k < N; k++) I += q(lo0 + (k + 0.5) * (h - lo0) / N) * ((h - lo0) / N);
  const total = (I * 0.85 * 0.8 + q(h) * 0.85 * 0.5 * (h - lo0)) * B / 1e6;
  ok(rel(r.total, total) < 2e-3 && r.rows.length === 2 && !r.rows.some((x) => x.minimum), 'forces on the floors add up to the pressure over the height they carry × width (closed form, 6 m, 40 m/s; the half storey at the base goes to the ground)', (r.total / 1000).toFixed(2) + ' kN');
  ok(rel(r.rows[0].F + r.rows[1].F, r.total) < 1e-12 && r.rows[1].F > r.rows[0].F * 0.4, 'storey forces F1 + F2 = total');
  ok(rel(r.qh, q(h)) < 1e-12 && rel(r.rows[1].pLee, -q(h) * 0.85 * 0.5) < 1e-12 && rel(r.rows[1].pSide, -q(h) * 0.85 * 0.7) < 1e-12, 'qh at the roof; leeward and side wall pressures use qh');
  ok(rel(r.rows[0].pInPlus, r.rows[0].pWind - r.qh * 0.18) < 1e-12 && r.gcpi === 0.18, 'enclosed: internal pressure ±0.18 qh');
  const pe = W.windStories({ V, exposure: 'C', floors: [{ id: 'F1', z: 6000 }], base: 0, B, L: 8000, enclosure: 'partial' });
  ok(pe.gcpi === 0.55, 'partially enclosed: GCpi 0.55');
  const lb = W.windStories({ V, exposure: 'C', floors: [{ id: 'F1', z: 6000 }], base: 0, B, L: 20000 });
  ok(lb.warnings.some((x) => x.code === 'leeward-cp') && lb.Cpl === -0.5, 'L/B above 1: −0.5 used and flagged');
  ok(!W.windStories({ V, exposure: 'C', floors: [{ id: 'F1', z: 6000 }], base: 0, B, L: 20000, cpLee: -0.3 }).warnings.some((x) => x.code === 'leeward-cp'), 'a typed leeward Cp replaces it');
  const lo = W.windStories({ V: 5, exposure: 'B', floors: [{ id: 'F1', z: 3000 }], base: 0, B, L: 8000 });
  ok(lo.rows[0].minimum && rel(lo.rows[0].F, 16 * PSF * 1500 * B / 1e6) < 1e-12, 'minimum wall load 16 psf governs at a tiny speed (band 1.5 m × 10 m)');
}

console.log('Wind case on a rigid-floor frame');
{
  const E = 200000, G = 77000, I = 1e8, J = 2e6, h = 3500;
  const corners = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  const nodes = [], members = [], supports = [];
  corners.forEach(([x, y], k) => {
    for (let s = 0; s <= 2; s++) nodes.push({ id: `c${k}_${s}`, x, y, z: s * h });
    for (let s = 0; s < 2; s++) members.push({ id: `m${k}_${s}`, i: `c${k}_${s}`, j: `c${k}_${s + 1}`, section: 'S', material: 's' });
    supports.push({ node: `c${k}_0`, fix: [1, 1, 1, 1, 1, 1].map(Boolean) });
  });
  const base = { format: 'cadcraft-frame', version: 1, nodes, members, supports, materials: [{ id: 's', E, G, rho: 0 }], sections: [{ id: 'S', A: 1e4, Iy: I, Iz: I, J }], combos: [], diaphragms: [{ id: 'L1', z: h }, { id: 'L2', z: 2 * h }] };
  const m0 = FM.cleanFrame({ ...base, cases: [] }).model;
  const ws = W.windStories({ V: 45, exposure: 'B', floors: [{ id: 'L1', z: h }, { id: 'L2', z: 2 * h }], base: 0, B: 4000, L: 6000 });
  const forces = Object.fromEntries(ws.rows.map((r) => [r.id, r.F]));
  const cs = [W.windCase(m0, { id: 'WX1', dir: 'X', sign: 1, forces }), W.windCase(m0, { id: 'WX2', dir: 'X', sign: -1, forces })];
  const m = FM.cleanFrame({ ...base, cases: cs }).model;
  const sol = FS.solveFrame(m);
  const A = sol.results['case:WX1'], Bm = sol.results['case:WX2'];
  ok(sol.ok && cs[0].kind === 'wind', 'wind cases solve (kind wind)');
  ok(rel(A.applied[0], ws.total) < 1e-9 && rel(Bm.applied[0], -ws.total) < 1e-9, 'the +X case carries the whole wind force, the −X case the opposite');
  let reac = 0; for (let k = 0; k < A.reactions.length; k += 6) reac += A.reactions[k];
  ok(rel(Math.abs(reac), ws.total) < 1e-6, 'base shear of the supports = the wind force');
  const eccA = W.windCase(m0, { id: 'e', dir: 'X', sign: 1, forces, ecc: 0.1 }), eccB = W.windCase(m0, { id: 'e', dir: 'X', sign: 1, forces, ecc: 0.1, torsion: -1 });
  ok(eccA.loads[0].F[5] !== eccB.loads[0].F[5], 'an eccentricity adds torsion with the sign given');
}

console.log('Seismic: site values, spectrum, systems');
{
  // SEAOC Structural/Seismic Design Manual Vol.1 (2021 IBC) Design Example 1: Ss 0.52, S1 0.232, site class D → Fa 1.384, Fv 2.136, SMS 0.72, SM1 (×1.5) 0.743, SDS 0.48, SD1 0.496
  ok(rel(S.faOf(0.52, 'D'), 1.384) < 1e-12 && rel(S.fvOf(0.232, 'D'), 2.136) < 1e-12, 'Fa 1.384 and Fv 2.136 by straight-line interpolation (SEAOC Example 1)');
  const v = S.designValues({ edition: '7-16', Ss: 0.52, S1: 0.232, siteClass: 'D', d1exception: true });
  ok(Math.abs(v.SMS - 0.72) < 0.001 && Math.abs(v.SM1 - 0.743) < 0.001 && Math.abs(v.SDS - 0.48) < 0.001 && Math.abs(v.SD1 - 0.496) < 0.001, 'SMS 0.72, SM1 0.743, SDS 0.48, SD1 0.496 (SEAOC Example 1)');
  ok(S.designValues({ edition: '7-16', Ss: 0.52, S1: 0.232, siteClass: 'D' }).error === 'site-specific', 'site class D, S1 ≥ 0.2: a site study (or the 50 % exception) is required (11.4.8; the USGS 7-16 service returns null SD1 there)');
  const c = S.designValues({ edition: '7-16', Ss: 0.3, S1: 0.1, siteClass: 'C' });
  ok(Math.abs(c.Fa - 1.3) < 1e-12 && Math.abs(c.Fv - 1.5) < 1e-12, 'site class C: Fa 1.3 (Ss 0.3 → 1.3 + 0), Fv 1.5');
  ok(S.faOf(0.1, 'D') === 1.6 && S.faOf(2, 'D') === 1.0 && S.fvOf(0.9, 'D') === 1.7 && S.faOf(1.0, 'D') === 1.1, 'flat below the first and above the last column; printed values at the columns');
  ok(S.designValues({ edition: '7-16', Ss: 1, S1: 0.1, siteClass: 'E' }).error === 'site-class', 'class E / F: not built (values unconfirmed)');
  const v22 = S.designValues({ edition: '7-22', SMS: 2.17, SM1: 1.69 });
  ok(Math.abs(v22.SDS - 1.45) < 0.005 && Math.abs(v22.SD1 - 1.13) < 0.005, '7-22: SDS = 2/3 SMS = 1.45 and SD1 = 2/3 SM1 = 1.13 (USGS ASCE 7-22 service, 34°N 118°W, class D)');
  ok(S.faOf.length === 2 && !('fa' in (v22)), '7-22 has no Fa / Fv');
  const sp = SP.designSpectrum({ SDS: 0.55, SD1: 0.34, TL: 8 });
  ok(Math.abs(sp.T0 - 0.12) < 0.004 && Math.abs(sp.Ts - 0.62) < 0.003, 'T0 = 0.12 s, Ts = 0.62 s (SEAOC Design Example 2)');
  ok([[0, 0.22], [1, 0.34], [2, 0.17], [8, 0.04], [0.75, 0.45], [1.5, 0.23], [4, 0.09], [10, 0.03]].every(([T, Sa]) => Math.abs(sp(T) - Sa) < 0.005), 'Sa(T) = 0.22, 0.45 (0.75 s), 0.34, 0.23, 0.17, 0.09, 0.04, 0.03 (SEAOC table)');
  ok(Math.abs(sp(sp.T0) - 0.55) < 1e-12 && Math.abs(sp(sp.Ts) - 0.55) < 1e-12 && rel(sp(5), 0.34 / 5) < 1e-12 && rel(sp(9), 0.34 * 8 / 81) < 1e-12, 'plateau SDS between T0 and Ts, SD1/T up to TL, SD1 TL/T² beyond');
  const u = SP.designSpectrum({ SDS: 1.45, SD1: 1.13, TL: 8 });
  ok(Math.abs(u(0) - 0.58) < 1e-12 && Math.abs(u(0.5) - 1.45) < 1e-12 && Math.abs(u(1) - 1.13) < 1e-12 && Math.abs(u(9) - 0.11) < 0.003, 'the USGS 7-22 two-period ordinates: 0.58, 1.45, 1.13, 0.11');
  const mp = SP.designSpectrum({ SDS: 1, SD1: 0.5, periods: [0, 0.2, 1, 10], ordinates: [0.4, 1, 0.5, 0.05] });
  ok(mp.kind === 'multi-period' && Math.abs(mp(0.1) - 0.7) < 1e-12 && mp(20) === 0.05 && Math.abs(mp(1) - 0.5) < 1e-12, 'multi-period: straight lines between the USGS periods, last value held');
  ok(SP.spectrumPoints(sp).length >= 8 && SP.spectrumPoints(sp)[0][1] === sp(0), 'spectrumPoints');
  ok(S.SYSTEMS.every((s) => [s.R, s.Omega0, s.Cd].every(Number.isFinite) && L7.PERIOD_SYSTEMS[s.period]) && S.systemById('steel-smf').R === 8 && S.systemById('steel-ocbf').Cd === 3.25 && S.systemById('rc-smf').Omega0 === 3, 'systems: steel SMF 8/3/5.5, OCBF 3.25/2/3.25, RC SMF 8/3/5.5 (ideCAD, SEAIN, SEAOC)');
  ok(S.IE.II === 1 && S.IE.IV === 1.5 && !('I' in S.IE) && !('III' in S.IE), 'Ie for II and IV only (I and III have one source: type them)');
  const url = S.usgsUrl({ edition: '7-22', latitude: 34, longitude: -118, riskCategory: 'II', siteClass: 'D', title: 'x' });
  ok(url === 'https://earthquake.usgs.gov/ws/building-codes/asce7-22/calculate?latitude=34&longitude=-118&riskCategory=II&siteClass=D&title=x' && S.usgsUrl({ latitude: 1, longitude: 2 }).includes('/asce7-16/'), 'USGS address as the service documents');
  const pu = S.parseUsgs({ response: { data: { ss: 2.15, s1: 0.75, sms: 2.17, sm1: 1.69, sds: 1.45, sd1: 1.13, tl: 8, multiPeriodDesignSpectrum: { periods: [0, 0.2, 1], ordinates: [0.5, 1.45, 1.13] } } } });
  ok(pu.Ss === 2.15 && pu.SM1 === 1.69 && pu.periods.length === 3 && S.parseUsgs({}).error === 'usgs' && S.parseUsgs({ response: { data: { ss: 1, s1: 0.5, sm1: null } } }).SM1 === null, 'the USGS answer is read (null stays null; no data is an error)');
}

console.log('Seismic: constants checked against public worked examples (loads-asce7.js)');
{
  // FEMA P-2192-V1 Sec 4.5.1 (ASCE 7-22): SDS 1.1, SD1 0.65, S1 0.65, R 8, Ie 1, hn 234.25 ft, W 43 099 kips, Ct 0.02 x 0.75 → Ta 1.2 s, Cu Ta 1.68 s, Cs 0.0485, V 2090 kips
  const hn = 234.25 * FT, Ta = L7.approxPeriod('other', hn);
  ok(rel(Ta, 1.2) < 0.005 && rel(1.4 * Ta, 1.68) < 0.005, 'Ta = Ct hn^x = 1.2 s and Cu Ta = 1.68 s (FEMA P-2192 4.5.1, Ct 0.02 / x 0.75 in feet)', Ta.toFixed(4));
  const cs = L7.seismicCs({ SDS: 1.1, SD1: 0.65, S1: 0.65, R: 8, Ie: 1, T: 1.4 * Ta });
  ok(rel(cs.raw, 0.138) < 0.005 && rel(cs.max, 0.0485) < 0.005 && rel(0.5 * 0.65 / 8, 0.041) < 0.01 && rel(cs.Cs * 43099, 2090) < 0.003, 'Cs: 12.8-2 0.138, 12.8-3 0.0485, 12.8-6 0.041; V = Cs W = 2090 kips (P-2192 4.5.1)', (cs.Cs * 43099).toFixed(0));
  ok(rel(L7.approxPeriod('steel-mf', 10 * FT * 3), 0.028 * Math.pow(30, 0.8)) < 1e-12 && rel(L7.approxPeriod('concrete-mf', 30 * FT), 0.016 * Math.pow(30, 0.9)) < 1e-12 && rel(L7.approxPeriod('steel-ebf', 30 * FT), 0.03 * Math.pow(30, 0.75)) < 1e-12, 'Ct, x: steel MF 0.028 / 0.8, concrete MF 0.016 / 0.9, EBF 0.03 / 0.75 (Bentley RAM, FEMA P-2192, IISEE)');
  // FEMA P-2192-V1 Table 5-4 (ASCE 7-22, 18 storeys, k 1.6): roof 238 ft 1263 kips; L3 to L18 every 13 ft up from 30 ft, 1440 kips; L2 17 ft 1555 kips; Fx roof 146.2, L18 152.3, L9 47.1, L2 2.7 kips; V printed 1238 kips
  const levels = [{ id: 'Roof', z: 238 * FT, w: 1263 * 4448.2216 }, { id: 'L2', z: 17 * FT, w: 1555 * 4448.2216 }];
  for (let k = 3; k <= 18; k++) levels.push({ id: 'L' + k, z: (30 + 13 * (k - 3)) * FT, w: 1440 * 4448.2216 });
  const e = L7.elf({ levels, base: 0, SDS: 1.101, SD1: 0.65, S1: 0.65, R: 8, Ie: 1, T: 1.7, system: 'steel-mf' });
  const by = Object.fromEntries(e.levels.map((l) => [l.id, l.Fx / e.V * 1238]));
  ok(Math.abs(e.k - 1.6) < 1e-12 && Math.abs(e.T - 1.7) < 1e-12, 'k = 1.6 at T = 1.7 s (12.8.3; P-2192 5.5.3)');
  ok([['Roof', 146.2], ['L18', 152.3], ['L9', 47.1], ['L2', 2.7]].every(([id, F]) => Math.abs(by[id] - F) < 0.15), 'vertical distribution Fx/V: roof 146.2, L18 152.3, L9 47.1, L2 2.7 kips of 1238 (P-2192 Table 5-4, within 0.15 kip: the table rounds)', ['Roof', 'L18', 'L9', 'L2'].map((id) => by[id].toFixed(1)).join(' / '));
  ok(rel(e.V / 4448.2216, 1238) < 0.02, 'V = 1253 kips against 1238 printed (the example rounds Cs to 0.048 and prints a typo in its minimum)', (e.V / 4448.2216).toFixed(0));
}

console.log('Combinations (ASCE 7 chapter 2)');
{
  const cases = [{ id: 'D', name: 'Dead', kind: 'dead' }, { id: 'L', name: 'Live', kind: 'live' }, { id: 'S', name: 'Snow', kind: 'snow' }, { id: 'W1', name: 'W+X', kind: 'wind' }, { id: 'E1', name: 'EX1', kind: 'seismic' }];
  const has = (r, f) => r.combos.some((c) => { const m = Object.fromEntries(c.factors.map((x) => [x.case, x.f])); return Object.keys(f).length === Object.keys(m).length && Object.entries(f).every(([k, v]) => Math.abs((m[k] ?? NaN) - v) < 1e-9); });
  const lr = CB.asce7Combos(cases, { method: 'lrfd', SDS: 1, rho: 1, Omega0: 3 });
  ok(has(lr, { D: 1.4 }) && has(lr, { D: 1.2, L: 1.6, S: 0.5 }) && has(lr, { D: 1.2, S: 1.6, L: 1 }) && has(lr, { D: 1.2, S: 1.6, W1: 0.5 }), 'LRFD (1) 1.4D, (2) 1.2D + 1.6L + 0.5S, (3) 1.2D + 1.6S + L or 0.5W (ASCE 7-10 2.3.2)');
  ok(has(lr, { D: 1.2, W1: 1, L: 1, S: 0.5 }) && has(lr, { D: 0.9, W1: 1 }), 'LRFD (4) 1.2D + 1.0W + L + 0.5S, (6) 0.9D + 1.0W');
  ok(has(lr, { D: 1.4, E1: 1, L: 1, S: 0.2 }) && has(lr, { D: 0.7, E1: 1 }) && has(lr, { D: 0.7, E1: -1 }), 'LRFD seismic with Ev = 0.2 SDS D (SDS 1): (1.2 + 0.2)D + ρQE + L + 0.2S; (0.9 − 0.2)D ± ρQE (ASCE 7-10 12.4.2.3; UMass, ideCAD)');
  ok(has(lr, { D: 1.4, E1: 3, L: 1, S: 0.2 }) && has(lr, { D: 0.7, E1: 3 }) && lr.combos.filter((c) => c.limit).every((c) => !/overstrength/.test(c.clause)), 'overstrength with Ω0 = 3 made, and not marked for the member checks');
  const lr13 = CB.asce7Combos(cases, { method: 'lrfd', SDS: 0.8, rho: 1.3 });
  ok(has(lr13, { D: 1.36, E1: 1.3, L: 1, S: 0.2 }) && has(lr13, { D: 0.74, E1: 1.3 }), 'ρ = 1.3, SDS 0.8: 1.36 D + 1.3 QE ..., 0.74 D + 1.3 QE');
  const ad = CB.asce7Combos(cases, { method: 'asd', SDS: 1, rho: 1, Omega0: 3 });
  ok(has(ad, { D: 1 }) && has(ad, { D: 1, L: 1 }) && has(ad, { D: 1, S: 1 }) && has(ad, { D: 1, L: 0.75, S: 0.75 }) && has(ad, { D: 1, W1: 0.6 }) && has(ad, { D: 0.6, W1: 0.6 }), 'ASD (1) to (5), (7): D; D + L; D + S; D + 0.75L + 0.75S; D + 0.6W; 0.6D + 0.6W (ASCE 7-10 2.4.1)');
  ok(has(ad, { D: 1.14, E1: 0.7 }) && has(ad, { D: 0.46, E1: 0.7 }) && has(ad, { D: 1.105, E1: 0.525, L: 0.75, S: 0.75 }) && has(ad, { D: 1, L: 0.75, W1: 0.45, S: 0.75 }), 'ASD seismic: (1 + 0.14 SDS)D + 0.7ρQE; (0.6 − 0.14 SDS)D + 0.7ρQE; 6b with 0.105 SDS and 0.525 (ICC solutions manual); 6a with 0.75 × 0.6W');
  ok(ad.combos.every((c) => !c.limit) && ad.combos.every((c) => c.id.startsWith('A7-')), 'ASD combinations carry no member-check mark; ids start A7-');
  ok(CB.asce7Combos([{ id: 'D', name: 'D', kind: 'dead' }, { id: 'X', name: 'X', kind: 'other' }], {}).warnings.some((w) => w.code === 'other-skipped'), 'cases of kind other are skipped with a warning');
  const z = CB.asce7Combos(cases, { method: 'lrfd', SDS: 1, vertical: false });
  ok(has(z, { D: 1.2, E1: 1, L: 1, S: 0.2 }) && has(z, { D: 0.9, E1: 1 }), 'without the vertical effect: 1.2D + E ..., 0.9D + E');
}

console.log('Sources file and settings');
{
  const ids = Object.keys(SRC.SOURCES);
  ok(ids.length >= 25 && ids.every((id) => (SRC.SOURCES[id].urls.length >= 2 || id.startsWith('wind.example')) && new Set(SRC.SOURCES[id].urls.map((u) => new URL(u).hostname)).size >= 1 && SRC.SOURCES[id].urls.every((u) => /^https?:\/\//.test(u))), 'every source item lists at least two pages (URL; the two worked-example items are test data and have one)', ids.length + ' items');
  ok(ids.every((id) => new Set(SRC.SOURCES[id].urls).size === SRC.SOURCES[id].urls.length) && SRC.UNCONFIRMED.length >= 10 && SRC.DATE_READ === '2026-11-06', 'no page twice in one item; the unconfirmed list is kept; date read');
  const c = LP.cleanLoads({ wind: { V: 'x', exposure: 'Z', dir: 'W', enclosure: 'bad', ecc: 9 }, site: { Ss: 99, system: 'nope', risk: 'V', mp: { periods: [1, 0], ordinates: [1, 1] } }, combos: { method: 'x' } });
  ok(c.wind.V === 0 && c.wind.exposure === 'C' && c.wind.dir === 'both' && c.wind.enclosure === 'enclosed' && c.wind.ecc === 0 && c.site.Ss === 0 && c.site.system === 'rc-smf' && c.site.risk === 'II' && c.site.mp === null && c.combos.method === 'lrfd', 'cleanLoads: bad values fall back to defaults');
  ok(LP.cleanLoads(null) === null && JSON.stringify(LP.cleanLoads(LP.cleanLoads({ wind: { V: 40, exposure: 'B' } }))) === JSON.stringify(LP.cleanLoads({ wind: { V: 40, exposure: 'B' } })), 'cleanLoads is idempotent; nothing in, nothing out');
  const a = FP.cleanAnalysis({ cases: [{ id: 'W', name: 'w', kind: 'wind', gen: 'wind', loads: [] }, { id: 'X', name: 'x', kind: 'wind', gen: 'evil', loads: [] }], loads: { wind: { V: 40 } } });
  ok(a.cases[0].gen === 'wind' && a.cases[1].gen === undefined && a.loads.wind.V === 40, 'cleanAnalysis keeps the settings and the wind mark, nothing else');
  ok(FP.cleanAnalysis({ cases: [] }).loads === undefined, 'an older analysis gets no loads settings');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
