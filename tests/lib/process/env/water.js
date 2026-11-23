/* SPDX-License-Identifier: Apache-2.0 */
/**
 * water.js — water and wastewater treatment unit processes (0.8 Track CH, CH.20; 0.11 CH.33, CH.34, CH.39; DOM-free, imports only lib/process).
 * The activated sludge model is the published IAWQ ASM1 (Henze, Grady, Gujer, Marais and Matsuo, 1987) as written out in the BSM1 description: J. Alex, L. Benedetti,
 * J. Copp, K.V. Gernaey, U. Jeppsson, I. Nopens, M.-N. Pons, L. Rieger, C. Rosen, J.P. Steyer, P. Vanrolleghem, S. Winkler, "Benchmark Simulation Model no. 1 (BSM1)",
 * IWA Taskgroup / Lund University, TEIE-7229, 2008 (read 2026-11-21; notes with page numbers in docs/refs/bsm1-alex-2008.md). The matrix below was compared term by
 * term with its pages 5-6 and the parameter set is its Tables 2 and 3 (page 7), which the report says hold "approximately [at] 15 C". A drafting and study aid, not a
 * process design approval.
 *
 *   ASM1          COMP · STOICH · rates(c, par) · derivs(c, par) · ASM1_MODEL      the matrix as data and the rate vector; the model object plantSteady takes
 *   Temperature   asm1AtTemperature(par, T) · soSatAt(T) · ASM1_TEMPERATURE        CH.34: Arrhenius-type law through the 10 C and 15 C values (BSM2, cited below)
 *   Settler       takacsVs(X, Xmin, p) · settlerRates(X, Xf, o) · blanketOf(...) · TAKACS_BSM1 · SETTLER_BSM1   CH.33: the 10-layer Takacs settler of BSM1
 *   Plant         plantSteady(model, plant) · activatedSludge(plant)   N tanks in series, internal and sludge recycle, a clarifier by capture OR the layered settler
 *   Benchmark     BSM1_OPEN_LOOP · BSM1_PUBLISHED · bsm1Plant()        CH.39: the BSM1 open-loop plant and its published steady state (Appendix 4)
 *   Unit ops      screenLoss · idealClarifier · filterLoss · chickWatson · ctFor · srtOf · oxygenReport
 *   Site          siteLinks(plant, depths)      plan footprints and volumes for CivilCraft
 *                 basinPlan(plant, { depths, gap, origin })  those footprints laid out in one row on the plan (metres): polygons, a GeoJSON and an R12 DXF
 *   Engines       WATERTAP_ENGINE               held: its licence (BSD-3-Clause-LBNL, read 2026-11-21) is not on engines.js's permissive list, and no script is shipped
 * NOT built here: ASM2d/ASM3, anaerobic digestion, membranes and dosing (water-b-11's files, which call plantSteady), a reactive settler, solubles held up in the settler
 * (at steady state the non-reactive layers pass the solubles through unchanged, BSM1 p. 10), alkalinity in the rates beyond the matrix, the BSM1 closed-loop controllers.
 */
import { solveLinear } from '../numeric.js';
import { problem as baseProblem } from '../report.js';

export const COMP = ['SI', 'SS', 'XI', 'XS', 'XBH', 'XBA', 'XP', 'SO', 'SNO', 'SNH', 'SND', 'XND', 'SALK'];
export const COMP_INFO = { SI: 'soluble inert COD', SS: 'readily biodegradable COD', XI: 'particulate inert COD', XS: 'slowly biodegradable COD', XBH: 'heterotrophic biomass', XBA: 'autotrophic biomass', XP: 'particulate products of decay', SO: 'dissolved oxygen', SNO: 'nitrate and nitrite N', SNH: 'ammonium N', SND: 'soluble organic N', XND: 'particulate organic N', SALK: 'alkalinity (mol HCO3/m3)' };
const PARTICULATE = ['XI', 'XS', 'XBH', 'XBA', 'XP', 'XND'], COD_SPECIES = ['SI', 'SS', 'XI', 'XS', 'XBH', 'XBA', 'XP'], SOLIDS = ['XI', 'XS', 'XBH', 'XBA', 'XP'];
const BSM1_REF = 'Alex et al., Benchmark Simulation Model no. 1 (BSM1), IWA Taskgroup / Lund University TEIE-7229, 2008';
export const SOURCES = {
  matrix: 'ASM1 Petersen matrix (Henze et al. 1987) as written in ' + BSM1_REF + ', pages 5-6 (processes rho1-rho8, conversion rates r1-r13)',
  params: 'ASM1 parameters, ' + BSM1_REF + ', Table 2 (stoichiometric) and Table 3 (kinetic), page 7, "approximately 15 C": YA 0.24, YH 0.67, fP 0.08, iXB 0.08, iXP 0.06, muH 4.0 /d, KS 10, KOH 0.2, KNO 0.5, bH 0.3 /d, etag 0.8, etah 0.8, kh 3.0, KX 0.1, muA 0.5 /d, KNH 1.0, bA 0.05 /d, KOA 0.4, ka 0.05',
  oxygen: '2.86 g COD per g nitrate-N (to nitrogen gas) and 4.57 g O2 per g N nitrified, the ASM1 conversion constants in the rate equations of ' + BSM1_REF + ', page 6; oxygen saturation SO* = 8 g/m3, page 8',
  settler: 'Double-exponential settling velocity (Takacs, Patry and Nolasco, Water Research 25(10), 1991) and the 10-layer settler as given in ' + BSM1_REF + ', pages 8-10: Table 4 (page 9) v0\' 250 m/d, v0 474 m/d, rh 0.000576 m3/g, rp 0.00286 m3/g, fns 0.00228; threshold Xt 3000 g/m3 (page 10); area 1500 m2, 10 layers of 0.4 m, feed at layer 6 from the bottom (page 8); TSS = 0.75 x particulate COD (page 10). The Takacs paper itself was not read.',
  temperature: 'Temperature law of BSM2 as restated by O.B.L. Neto, M. Mulas, I. Harjunkoski, F. Corona, "Predictive control of wastewater treatment plants as energy-autonomous water resource recovery facilities", arXiv:2506.10490v1 (2025), Supplementary S1.3, Table 3 and the equation above it (supplement page 7): k(T) = k15 exp(ln(k15/k10) (T - 15)/5) for muH, muA, bH, bA, kh, ka with 10 C values muH 3.00, muA 0.30, bH 0.20, bA 0.03, kh 2.50, ka 0.04; SO_sat(T) from the same page. A secondary source: the IWA BSM2 texts could not be read in this session.',
  benchmark: BSM1_REF + ', section 4 (page 14: open loop Qa 55,338 m3/d, KLa(5) 84 /d), Table 5 (page 14: influent), Appendix 4 (pages 39-41: steady state from the Matlab/Simulink implementation by U. Jeppsson, 2008-03-27)',
  kozeny: 'Carman-Kozeny laminar filter head loss h/L = 180 nu (1-eps)^2 v / (g eps^3 d^2)',
  kirschmer: 'Kirschmer bar-screen loss h = beta (w/b)^(4/3) (v^2/2g) sin(theta), beta = bar shape factor (the person\'s)',
  hazen: 'Ideal rectangular settling basin (Hazen): overflow rate vo = Q/A; a particle settling at vs >= vo is removed completely, otherwise a fraction vs/vo',
  chick: 'Chick-Watson disinfection: N/N0 = exp(-k C^n t); the person supplies k and n for the organism and disinfectant',
};
export const REVIEW = { state: 'not confirmed', note: 'The ASM1 matrix and parameters were compared with the BSM1 report (Alex et al. 2008) by a session, and the BSM1 steady state is reproduced by the tests; an engineer has not checked them, and the temperature law comes from a secondary source. Not for design use until a person with the reports checks them.' };
export const PAR = Object.freeze({ YA: 0.24, YH: 0.67, fP: 0.08, iXB: 0.08, iXP: 0.06, muH: 4.0, KS: 10, KOH: 0.2, KNO: 0.5, bH: 0.3, etag: 0.8, etah: 0.8, kh: 3.0, KX: 0.1, muA: 0.5, KNH: 1.0, bA: 0.05, KOA: 0.4, ka: 0.05 });
export const SO_SAT = 8;          // g/m3, BSM1 page 8 ("the saturation concentration for oxygen is SO* = 8 g.m-3"); the person may change it (plant.soSat)
const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('water.' + code, severity, text, about, extra); p.source = SRC; return p; };

/** The stoichiometric matrix as 8 rows (processes) of 13 coefficients, for the parameter set `par` (BSM1 pages 6-7, r1-r13). */
export function STOICH(par = PAR) {
  const { YA, YH, fP, iXB, iXP } = par, z = () => Object.fromEntries(COMP.map((k) => [k, 0]));
  const rows = [];
  let r;
  r = z(); Object.assign(r, { SS: -1 / YH, XBH: 1, SO: -(1 - YH) / YH, SNH: -iXB, SALK: -iXB / 14 }); rows.push(r);                                     // 1 aerobic growth, heterotrophs
  r = z(); Object.assign(r, { SS: -1 / YH, XBH: 1, SNO: -(1 - YH) / (2.86 * YH), SNH: -iXB, SALK: (1 - YH) / (14 * 2.86 * YH) - iXB / 14 }); rows.push(r);   // 2 anoxic growth
  r = z(); Object.assign(r, { XBA: 1, SNO: 1 / YA, SO: -(4.57 - YA) / YA, SNH: -iXB - 1 / YA, SALK: -iXB / 14 - 1 / (7 * YA) }); rows.push(r);          // 3 aerobic growth, autotrophs
  r = z(); Object.assign(r, { XP: fP, XS: 1 - fP, XBH: -1, XND: iXB - fP * iXP }); rows.push(r);                                                     // 4 decay, heterotrophs
  r = z(); Object.assign(r, { XP: fP, XS: 1 - fP, XBA: -1, XND: iXB - fP * iXP }); rows.push(r);                                                     // 5 decay, autotrophs
  r = z(); Object.assign(r, { SNH: 1, SND: -1, SALK: 1 / 14 }); rows.push(r);                                                                         // 6 ammonification
  r = z(); Object.assign(r, { SS: 1, XS: -1 }); rows.push(r);                                                                                         // 7 hydrolysis, organics
  r = z(); Object.assign(r, { SND: 1, XND: -1 }); rows.push(r);                                                                                       // 8 hydrolysis, organic N
  return rows;
}
const pos = (v) => (v > 0 ? v : 0);
/** The 8 process rates (g/m3/d) at concentrations c (object by COMP name), BSM1 pages 5-6. */
export function rates(c, par = PAR) {
  const p = par, SS = pos(c.SS), SO = pos(c.SO), SNO = pos(c.SNO), SNH = pos(c.SNH), SND = pos(c.SND), XS = pos(c.XS), XBH = pos(c.XBH), XBA = pos(c.XBA), XND = pos(c.XND);
  const fS = SS / (p.KS + SS), fO = SO / (p.KOH + SO), fAn = p.KOH / (p.KOH + SO), fNO = SNO / (p.KNO + SNO);
  const r1 = p.muH * fS * fO * XBH, r2 = p.muH * fS * fAn * fNO * p.etag * XBH, r3 = p.muA * SNH / (p.KNH + SNH) * SO / (p.KOA + SO) * XBA;
  const r4 = p.bH * XBH, r5 = p.bA * XBA, r6 = p.ka * SND * XBH;
  const xr = XBH > 1e-12 ? XS / XBH : 0, r7 = p.kh * (xr / (p.KX + xr)) * (fO + p.etah * fAn * fNO) * XBH, r8 = XS > 1e-12 ? r7 * XND / XS : 0;
  return [r1, r2, r3, r4, r5, r6, r7, r8];
}
/** Reaction rate of every component (object), g/m3/d. */
export function derivs(c, par = PAR) {
  const rho = rates(c, par), M = STOICH(par), out = {}; for (const k of COMP) { let s = 0; for (let j = 0; j < 8; j++) s += M[j][k] * rho[j]; out[k] = s; } return out;
}

// ---- CH.34 temperature ------------------------------------------------------------------------------------------------------------------
/** The BSM2 law as restated by Neto et al. 2025 (SOURCES.temperature): the six parameters that move with temperature and their values at 10 C and 15 C. */
export const ASM1_TEMPERATURE = Object.freeze({
  law: 'k(T) = k(15 C) exp( ln(k15 / k10) (T - 15) / 5 )',
  at10: Object.freeze({ muH: 3.00, muA: 0.30, bH: 0.20, bA: 0.03, kh: 2.50, ka: 0.04 }),
  at15: Object.freeze({ muH: 4.00, muA: 0.50, bH: 0.30, bA: 0.05, kh: 3.00, ka: 0.05 }),
  range: Object.freeze([10, 15]),     // the two temperatures the source gives values at; outside them the law is an extrapolation
});
/**
 * ASM1 parameters at water temperature T (C). The person's `par` is taken as the 15 C set (BSM1's basis); each of muH, muA, bH, bA, kh, ka is multiplied by
 * exp(ln(k15/k10) (T - 15)/5) with the source's 10 C and 15 C values; the other parameters do not move. → { par, factors, problems }.
 */
export function asm1AtTemperature(par = PAR, T) {
  if (!Number.isFinite(T)) throw new Error('Give the water temperature in degrees C.');
  const { at10, at15, range } = ASM1_TEMPERATURE, out = { ...par }, factors = {};
  for (const k of Object.keys(at15)) { const f = Math.exp(Math.log(at15[k] / at10[k]) * (T - 15) / 5); factors[k] = f; out[k] = (par[k] ?? at15[k]) * f; }
  const problems = [];
  if (T < range[0] || T > range[1]) problems.push(problem('temperature.range', 'warning', `Water at ${T} C is outside 10 to 15 C, the two temperatures the source gives the ASM1 rates at; the corrected rates are an extrapolation of that law.`, [{ kind: 'plant', id: 'plant' }]));
  return { par: out, factors, problems };
}
/** Oxygen saturation (g/m3) at water temperature T (C), the BSM2 expression restated by Neto et al. 2025 (S1.3); 8.0 at 15 C. */
export function soSatAt(T) {
  if (!Number.isFinite(T)) throw new Error('Give the water temperature in degrees C.');
  const K = T + 273.15;
  return (8 * 6791.5 * 56.12 / 10.50237016) * Math.exp(-66.7354 + 8747.55 / K + 24.4526 * Math.log(K / 100));
}

// ---- CH.33 layered settler (Takacs) -----------------------------------------------------------------------------------------------------
/** BSM1 Table 4 (page 9) and the threshold Xt (page 10). v0max = v0' (m/d), v0 (m/d), rh and rp (m3/g SS), fns (-), Xt (g SS/m3). */
export const TAKACS_BSM1 = Object.freeze({ v0max: 250, v0: 474, rh: 0.000576, rp: 0.00286, fns: 0.00228, Xt: 3000 });
/** BSM1 settler geometry (page 8): area (m2), height (m), layers, feed layer counted from the bottom. */
export const SETTLER_BSM1 = Object.freeze({ area: 1500, height: 4, layers: 10, feedLayer: 6 });
/** Takacs double-exponential settling velocity (m/d) of sludge at X (g SS/m3), Xmin = fns Xf (BSM1 page 9). */
export function takacsVs(X, Xmin, p = TAKACS_BSM1) { const d = X - Xmin; return Math.max(0, Math.min(p.v0max, p.v0 * (Math.exp(-p.rh * d) - Math.exp(-p.rp * d)))); }
function settlerSpec(s) {
  const o = { ...SETTLER_BSM1, ...s, params: { ...TAKACS_BSM1, ...(s.params || {}) } };
  if (!(o.area > 0 && o.height > 0)) throw new Error('The settler needs an area (m2) and a height (m).');
  if (!(Number.isInteger(o.layers) && o.layers >= 3)) throw new Error('The settler needs 3 or more layers.');
  if (!(Number.isInteger(o.feedLayer) && o.feedLayer >= 2 && o.feedLayer <= o.layers - 1)) throw new Error('The feed layer (counted from the bottom) must be between 2 and layers - 1.');
  const q = o.params; for (const k of ['v0max', 'v0', 'rh', 'rp', 'Xt']) if (!(q[k] > 0)) throw new Error('Settling parameter ' + k + ' must be positive.');
  if (!(q.fns >= 0 && q.fns < 1)) throw new Error('The non-settleable fraction fns must be 0 to below 1.');
  return o;
}
/**
 * The layer balances of BSM1 pages 9-10 (X[0] is the bottom layer). Xf feed solids (g SS/m3), flows (m3/d) o.Qf, o.Qe, o.Qu; o.area, o.height, o.feedLayer (from the
 * bottom), o.params. The feed layer loses (vup + vdn) X: the extracted report text shows a minus sign there, which would not conserve solids (docs/refs/bsm1-alex-2008.md).
 * → dX/dt per layer (g/m3/d).
 */
export function settlerRates(X, Xf, o) {
  const L = X.length, z = o.height / L, A = o.area, f = o.feedLayer - 1, p = o.params || TAKACS_BSM1;
  const vdn = o.Qu / A, vup = o.Qe / A, Xmin = p.fns * Xf, Js = X.map((x) => takacsVs(x, Xmin, p) * x);
  const Jclar = (j) => (X[j - 1] > p.Xt ? Math.min(Js[j], Js[j - 1]) : Js[j]);   // settling flux from layer j down into j-1, above the feed
  const d = new Array(L);
  for (let m = 0; m < L; m++) {
    let r;
    if (m < f) r = vdn * (X[m + 1] - X[m]) + Math.min(Js[m], Js[m + 1]) - (m > 0 ? Math.min(Js[m], Js[m - 1]) : 0);
    else if (m === f) r = o.Qf * Xf / A + Jclar(f + 1) - (vup + vdn) * X[m] - Math.min(Js[f], Js[f - 1]);
    else if (m < L - 1) r = vup * (X[m - 1] - X[m]) + Jclar(m + 1) - Jclar(m);
    else r = vup * (X[m - 1] - X[m]) - Jclar(m);
    d[m] = r / z;
  }
  return d;
}
/** Sludge blanket: the height (m) of the layers, counted up from the bottom without a gap, whose solids are at or above `threshold` (g SS/m3). */
export function blanketOf(X, height, threshold) {
  const z = height / X.length; let n = 0; while (n < X.length && X[n] >= threshold) n++; return +(n * z).toFixed(12);
}

// ---- plant ------------------------------------------------------------------------------------------------------------------------------
/**
 * ASM1 as a model object for plantSteady (the shape water-b-11's ASM3_MODEL and ASM2D_MODEL also use): COMP, STOICH(par) → rows of { comp: coeff }, rates(c, par) → array,
 * PAR, particulate, cod { comp: g COD per unit }, n(o, par) g N/m3, n2(c, rho, par) g N/m3/d lost as N2, oxygenSpecies; plus, for the settler and the sludge age, tss(o, par)
 * (g SS/m3, BSM1 page 10: 0.75 x particulate COD), solids (the COD particulates of the classic sludge age), biomass, nitrifiers, signed (allowed below zero), seed (added to
 * the influent for the first guess) and temperature(par, T).
 */
export const ASM1_MODEL = Object.freeze({
  id: 'asm1', name: 'ASM1', COMP, STOICH, rates, PAR, particulate: PARTICULATE,
  cod: Object.fromEntries(COD_SPECIES.map((k) => [k, 1])),
  n: (o, par) => (o.SNO ?? 0) + (o.SNH ?? 0) + (o.SND ?? 0) + (o.XND ?? 0) + par.iXB * ((o.XBH ?? 0) + (o.XBA ?? 0)) + par.iXP * (o.XP ?? 0),
  n2: (_c, rho, par) => rho[1] * (1 - par.YH) / (2.86 * par.YH),
  oxygenSpecies: 'SO', tss: (o) => 0.75 * SOLIDS.reduce((s, k) => s + (o[k] ?? 0), 0), solids: SOLIDS, biomass: ['XBH', 'XBA'], nitrifiers: 'XBA', signed: ['SALK'],
  seed: { XBH: 1000, XBA: 50 }, temperature: asm1AtTemperature,
});

/**
 * Steady state of tanks in series with an internal recycle and a clarifier, for any model object of ASM1_MODEL's shape, by integrating the balances until nothing moves.
 * plant { tanks: [{ id, V (m3), aerated?: bool, KLa? (1/d), SOfixed? }], Qin (m3/d), influent: { comp: g/m3 }, Qint (m3/d, last tank back to the first), Qr (return sludge),
 *         Qw (waste sludge, taken from the underflow), and EITHER capture (0..1 of every particulate the clarifier captures — the person's number) OR settler
 *         ({ area, height, layers, feedLayer, params, blanketAt } — `{}` = BSM1's settler; the layered Takacs model, CH.33), T? (water temperature C, CH.34; needs
 *         model.temperature), soSat? (g/m3, default 8) or soSatFromT (true: soSatAt(T)), par?, init?, tol? }
 * → { tanks: [{ id, c }], effluent, waste, flows, srt (d), sludgeAge?, settler?, temperature?, balances, converged, iterations, problems, notes }
 */
export function plantSteady(model, plant) {
  const C = model.COMP, nc = C.length, OX = model.oxygenSpecies || 'SO', T = plant.tanks || [], problems = [], about = [{ kind: 'plant', id: 'plant' }];
  let par = { ...model.PAR, ...(plant.par || {}) }, temperature = null;
  if (!T.length) throw new Error('A plant needs at least one tank.');
  const { Qin, Qint = 0, Qr, Qw } = plant;
  if (!(Qin > 0 && Qr >= 0 && Qw >= 0 && Qw < Qin)) throw new Error('Flows: Qin > 0, Qr >= 0 and 0 <= Qw < Qin (the effluent is Qin - Qw).');
  const useSettler = plant.settler != null && plant.settler !== false;
  if (!useSettler && !(plant.capture >= 0 && plant.capture <= 1)) throw new Error('Give the clarifier capture of particulates (0 to 1), or a settler ({} for the BSM1 settler); no default is assumed.');
  if (useSettler && typeof model.tss !== 'function') throw new Error('This model has no solids conversion (model.tss), so the layered settler cannot be used with it.');
  for (const t of T) if (!(t.V > 0)) throw new Error('Tank ' + t.id + ' needs a volume.');
  if (plant.T != null) {
    if (typeof model.temperature !== 'function') throw new Error('This model has no temperature correction.');
    const tc = model.temperature(par, plant.T); par = tc.par; problems.push(...tc.problems);
    temperature = { T: plant.T, factors: tc.factors, law: ASM1_TEMPERATURE.law };
  }
  if (plant.soSatFromT && plant.T == null) throw new Error('soSatFromT needs the water temperature T.');
  const soSat = plant.soSat ?? (plant.soSatFromT ? soSatAt(plant.T) : SO_SAT);
  if (temperature) temperature.soSat = soSat;
  const S = useSettler ? settlerSpec(plant.settler) : null, L = S ? S.layers : 0;
  const vec = (o) => C.map((k) => o[k] ?? 0), obj = (v) => Object.fromEntries(C.map((k, i) => [k, v[i]]));
  const infl = vec(plant.influent || {}), Qt = Qin + Qr + Qint, Qc = Qin + Qr, Qe = Qin - Qw, Qu = Qr + Qw, n = T.length, M = model.STOICH(par), np = M.length;
  const isP = C.map((k) => model.particulate.includes(k)), signed = new Set(model.signed || ['SALK']), iOX = C.indexOf(OX);
  const tssOf = (v) => model.tss(obj(v), par);
  const clarify = (cf, X) => {                                // feed concentration vector (+ settler layers) → { eff, und, Xf, Xe, Xu }
    if (S) {
      const Xf = tssOf(cf), Xe = X[L - 1], Xu = X[0], re = Xf > 1e-12 ? Xe / Xf : 0, ru = Xf > 1e-12 ? Xu / Xf : 0;
      return { eff: cf.map((v, i) => (isP[i] ? v * re : v)), und: cf.map((v, i) => (isP[i] ? v * ru : v)), Xf, Xe, Xu };
    }
    const eff = cf.map((v, i) => (isP[i] ? (1 - plant.capture) * v : v)), und = cf.map((v, i) => (isP[i] && Qu > 0 ? (Qc * v - Qe * eff[i]) / Qu : v));
    return { eff, und };
  };
  const NT = n * nc;
  const f = (_t, y) => {
    const c = Array.from({ length: n }, (_, i) => y.slice(i * nc, i * nc + nc)), X = S ? y.slice(NT) : null, cl = clarify(c[n - 1], X), und = cl.und;
    const dy = new Array(y.length).fill(0);
    for (let i = 0; i < n; i++) {
      const rho = model.rates(obj(c[i]), par), t = T[i], q = Qt / t.V;
      for (let k = 0; k < nc; k++) {
        const key = C[k]; let tr;
        if (i === 0) tr = (Qin * infl[k] + Qr * und[k] + Qint * c[n - 1][k] - Qt * c[0][k]) / t.V; else tr = q * (c[i - 1][k] - c[i][k]);
        let rx = 0; for (let j = 0; j < np; j++) rx += (M[j][key] || 0) * rho[j];
        let aer = 0; if (k === iOX && t.aerated) aer = (t.KLa || 0) * (soSat - c[i][k]);
        dy[i * nc + k] = tr + rx + aer;
        if (k === iOX && t.SOfixed != null) dy[i * nc + k] = 0;
      }
    }
    if (S) { const d = settlerRates(X, cl.Xf, { ...S, Qf: Qc, Qe, Qu }); for (let m = 0; m < L; m++) dy[NT + m] = d[m]; }
    return dy;
  };
  const seed = model.seed || {};
  let y = plant.init ? plant.init.flatMap((o) => vec(o)) : T.flatMap((t) => vec({ ...plant.influent, ...Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, (plant.influent?.[k] ?? 0) + v])), [OX]: t.SOfixed ?? (t.aerated ? 2 : 0) }));
  T.forEach((t, i) => { if (t.SOfixed != null) y[i * nc + iOX] = t.SOfixed; });
  if (S) {                                                     // first guess: thickened below the feed, clear above it
    const Xf0 = tssOf(y.slice((n - 1) * nc, n * nc)), init = plant.settlerInit;
    for (let m = 0; m < L; m++) y.push(Array.isArray(init) ? init[m] : m < S.feedLayer - 1 ? 2 * Xf0 : m === S.feedLayer - 1 ? Xf0 : 0.01 * Xf0);
  }
  // pseudo-transient continuation: implicit steps (I/h - J) dy = F with a finite-difference Jacobian; h grows while the residual falls. Stiff-safe and deterministic.
  const N = y.length, scale = (v) => Math.abs(v) + 1, resid = (yy) => { const d = f(0, yy); let m = 0; for (let i = 0; i < N; i++) m = Math.max(m, Math.abs(d[i]) / scale(yy[i])); return m; };
  const free = (i) => i < NT && signed.has(C[i % nc]);
  const maxIter = plant.maxIter ?? 4000, tol = plant.tol ?? 1e-7; let conv = false, h = 1e-5, it = 0, rBest = Infinity, stall = 0;
  while (it < maxIter) {
    const F = f(0, y), Jm = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let j = 0; j < N; j++) {
      const e = 1e-6 * Math.max(1, Math.abs(y[j])), yp = y.slice(); yp[j] += e; const Fp = f(0, yp);
      if (j < NT) { for (let i = 0; i < N; i++) Jm[i][j] = (Fp[i] - F[i]) / e; continue; }
      // settler layers: central differences, so a layer sitting on a min() kink gets the mean of the two slopes rather than one side's (Newton cycled on that)
      const ym = y.slice(); ym[j] -= e; const Fm = f(0, ym); for (let i = 0; i < N; i++) Jm[i][j] = (Fp[i] - Fm[i]) / (2 * e);
    }
    const A = Jm.map((row, i) => row.map((v, j) => (i === j ? 1 / h : 0) - v));
    let dy; try { dy = solveLinear(A, F); } catch { h /= 4; it++; continue; }
    let ch = 0; for (let i = 0; i < N; i++) ch = Math.max(ch, Math.abs(dy[i]) / scale(y[i]));
    if (ch > 0.2 && h > 1e-9) { h /= 2; it++; continue; }
    y = y.map((v, i) => (free(i) ? v + dy[i] : Math.max(0, v + dy[i])));
    it++;
    const r1 = resid(y);
    if (r1 < tol) { conv = true; break; }
    if (ch < 0.05) h = Math.min(h * 2, 1e9);
    // the settler's min() terms have kinks where Newton steps can cycle: when the best residual has not improved for 30 steps, step back to short (time-like) steps
    if (r1 < 0.999 * rBest) { rBest = r1; stall = 0; } else if (++stall >= 30) { h = Math.max(h / 1000, 1e-6); stall = 0; rBest = r1; }
  }
  const c = Array.from({ length: n }, (_, i) => obj(y.slice(i * nc, i * nc + nc))), X = S ? y.slice(NT) : null;
  const cl = clarify(y.slice((n - 1) * nc, n * nc), X), effluent = obj(cl.eff), waste = obj(cl.und);
  // balances from the reaction rates and the transported flows, independently of the integration
  let reactCOD = 0, oxygenUsed = 0, n2 = 0, supplied = 0;
  const codF = model.cod || {};
  T.forEach((t, i) => {
    const rho = model.rates(c[i], par);
    for (let j = 0; j < np; j++) { let s = 0; for (const k of Object.keys(codF)) s += (M[j][k] || 0) * codF[k]; reactCOD += t.V * rho[j] * s; oxygenUsed += t.V * rho[j] * -(M[j][OX] || 0); }
    n2 += t.V * model.n2(c[i], rho, par);
    if (t.aerated) supplied += t.V * (t.KLa || 0) * (soSat - c[i][OX]);
  });
  const codOf = (o) => Object.entries(codF).reduce((s, [k, w]) => s + w * (o[k] ?? 0), 0), nOf = (o) => model.n(o, par);
  const codIn = Qin * codOf(plant.influent || {}), codOut = Qe * codOf(effluent) + Qw * codOf(waste);
  const nIn = Qin * nOf(plant.influent || {}), nOut = Qe * nOf(effluent) + Qw * nOf(waste);
  const codRes = codIn - codOut + reactCOD, nRes = nIn - nOut - n2;
  const balances = { cod: { in: codIn, out: codOut, reaction: reactCOD, residual: codRes, rel: codRes / (Math.abs(codIn) + 1e-12) }, n: { in: nIn, out: nOut, n2Lost: n2, residual: nRes, rel: nRes / (Math.abs(nIn) + 1e-12) }, oxygen: { used: oxygenUsed, supplied, residual: supplied - oxygenUsed } };
  if (typeof model.p === 'function') { const pIn = Qin * model.p(plant.influent || {}, par), pOut = Qe * model.p(effluent, par) + Qw * model.p(waste, par); balances.p = { in: pIn, out: pOut, residual: pIn - pOut, rel: (pIn - pOut) / (Math.abs(pIn) + 1e-12) }; }
  const solidsK = model.solids || model.particulate, solids = (o) => solidsK.reduce((s, k) => s + (o[k] ?? 0), 0);
  const inv = c.reduce((s, ci, i) => s + T[i].V * solids(ci), 0), leaving = Qw * solids(waste) + Qe * solids(effluent);
  const srt = leaving > 0 ? inv / leaving : Infinity;
  let settler = null, sludgeAge = null;
  if (S) {
    const z = S.height / L, last = c[n - 1], Xf = cl.Xf, blanketAt = S.blanketAt ?? S.params.Xt;
    const solidsIn = Qc * Xf, solidsOut = Qe * cl.Xe + Qu * cl.Xu;
    settler = { area: S.area, height: S.height, layers: X.map((x, m) => ({ layer: m + 1, top: +((m + 1) * z).toFixed(12), X: x, vs: takacsVs(x, S.params.fns * Xf, S.params) })), feedLayer: S.feedLayer,
      feedTSS: Xf, effluentTSS: cl.Xe, underflowTSS: cl.Xu, vup: Qe / S.area, vdn: Qu / S.area, solidsLoading: solidsIn / S.area,
      blanket: { height: blanketOf(X, S.height, blanketAt), threshold: blanketAt }, solids: { in: solidsIn, out: solidsOut, residual: solidsIn - solidsOut, rel: (solidsIn - solidsOut) / (Math.abs(solidsIn) + 1e-12) },
      thickening: Xf > 0 ? cl.Xu / Xf : null, thinning: Xf > 0 ? cl.Xe / Xf : null, params: S.params };
    if (Array.isArray(model.biomass) && Xf > 1e-12) {              // BSM1 page 11: biomass in the reactors and the settler over biomass lost in the effluent and the wastage
      const bio = (o) => model.biomass.reduce((s, k) => s + (o[k] ?? 0), 0), TXa = c.reduce((s, ci, i) => s + T[i].V * bio(ci), 0);
      const TXs = X.reduce((s, x) => s + bio(last) * (x / Xf) * z * S.area, 0), lost = bio(effluent) * Qe + bio(waste) * Qw;
      sludgeAge = { biomass: lost > 0 ? (TXa + TXs) / lost : Infinity, reactorsOnly: srt };
    }
    if (conv && Math.abs(settler.solids.rel) > 1e-6) problems.push(problem('settler.balance', 'error', `The settler's solids balance does not close (${(settler.solids.rel * 100).toFixed(4)} %).`, about));
    if (settler.blanket.height >= S.feedLayer * z - 1e-9) problems.push(problem('settler.blanket', 'warning', `The sludge blanket (solids at or above ${blanketAt} g/m3) reaches the feed layer: the clarifier is overloaded at these flows.`, about));
  }
  if (!conv) problems.push(problem('notsteady', 'warning', `The plant had not settled after ${it} Newton steps (the largest relative rate was above ${tol}); the numbers are the last state, not a steady state.`, about));
  if (conv && Math.abs(balances.cod.rel) > 1e-3) problems.push(problem('balance.cod', 'error', `COD balance does not close (${(balances.cod.rel * 100).toFixed(3)} %).`, about));
  if (conv && Math.abs(balances.n.rel) > 1e-3) problems.push(problem('balance.n', 'error', `Nitrogen balance does not close (${(balances.n.rel * 100).toFixed(3)} %).`, about));
  const nit = model.nitrifiers;
  if (nit && C.includes(nit) && Math.min(...c.map((ci) => ci[nit])) < 1e-3) problems.push(problem('washout', 'warning', 'Autotrophs have washed out of at least one tank: the sludge age is too short to nitrify.', about));
  const notes = [
    `${model.name || model.id || 'Model'} with ${temperature ? 'its rates corrected to ' + temperature.T + ' C (SOURCES.temperature)' : 'the parameter set as given (BSM1 basis, about 15 C; no temperature correction)'}.`,
    S ? `Clarifier: the ${L}-layer Takacs settler (SOURCES.settler); solubles pass through unchanged at steady state; the sludge blanket is the layers at or above ${S.blanketAt ?? S.params.Xt} g SS/m3.` : 'Clarifier: captures the fraction of particulates you gave; there is no settling model in this run.',
    'Compared with the BSM1 report by a session, not checked by an engineer.',
  ];
  return { model: model.id || null, tanks: T.map((t, i) => ({ id: t.id, c: c[i] })), effluent, waste, flows: { Qin, Qint, Qr, Qw, Qe, Qu, Qt }, srt, sludgeAge, settler, temperature, volume: T.reduce((s, t) => s + t.V, 0), balances, converged: conv, iterations: it, problems, notes };
}
/** The ASM1 plant (CH.20), or another model given as plant.model (water-b-11's ASM3/ASM2d objects). Same input and result as plantSteady. */
export function activatedSludge(plant) { return plantSteady(plant.model || ASM1_MODEL, plant); }

// ---- CH.39 the BSM1 benchmark -----------------------------------------------------------------------------------------------------------
/** BSM1 open loop (SOURCES.benchmark): Table 5 influent, page 7-8 reactors (KLa 240 /d in units 3-4), page 14 open loop (Qa 55,338 m3/d, KLa(5) 84 /d), Qr = Q0, Qw 385. */
export const BSM1_OPEN_LOOP = Object.freeze({
  tanks: [{ id: 'R1', V: 1000 }, { id: 'R2', V: 1000 }, { id: 'R3', V: 1333, aerated: true, KLa: 240 }, { id: 'R4', V: 1333, aerated: true, KLa: 240 }, { id: 'R5', V: 1333, aerated: true, KLa: 84 }],
  Qin: 18446, Qint: 55338, Qr: 18446, Qw: 385,
  influent: { SI: 30, SS: 69.5, XI: 51.2, XS: 202.32, XBH: 28.17, XBA: 0, XP: 0, SO: 0, SNO: 0, SNH: 31.56, SND: 6.95, XND: 10.59, SALK: 7 },
  settler: {},
});
/** A fresh copy of the BSM1 open-loop plant for plantSteady / activatedSludge. */
export function bsm1Plant() { return JSON.parse(JSON.stringify(BSM1_OPEN_LOOP)); }
/** BSM1 Appendix 4 (pages 39-41), steady state open loop, as printed; settler TSS counted from the BOTTOM here (the appendix counts "1 is top layer"). */
export const BSM1_PUBLISHED = Object.freeze({
  R1: { SI: 30, SS: 2.8082, XI: 1149.1183, XS: 82.1349, XBH: 2551.7631, XBA: 148.3886, XP: 448.8459, SO: 0.0042984, SNO: 5.3699, SNH: 7.9179, SND: 1.2166, XND: 5.2849, SALK: 4.9277, TSS: 3285.188 },
  R2: { SI: 30, SS: 1.4588, XI: 1149.1182, XS: 76.3862, XBH: 2553.3824, XBA: 148.3083, XP: 449.5167, SO: 6.3132e-05, SNO: 3.6619, SNH: 8.3445, SND: 0.88207, XND: 5.0291, SALK: 5.0802, TSS: 3282.5339 },
  R3: { SI: 30, SS: 1.1495, XI: 1149.1182, XS: 64.8549, XBH: 2557.1288, XBA: 148.9404, XP: 450.4123, SO: 1.7184, SNO: 6.5408, SNH: 5.548, SND: 0.82889, XND: 4.3924, SALK: 4.6748, TSS: 3277.841 },
  R4: { SI: 30, SS: 0.99532, XI: 1149.1182, XS: 55.694, XBH: 2559.18, XBA: 149.5262, XP: 451.3087, SO: 2.4289, SNO: 9.299, SNH: 2.9674, SND: 0.76679, XND: 3.879, SALK: 4.2935, TSS: 3273.6203 },
  R5: { SI: 30, SS: 0.88949, XI: 1149.1182, XS: 49.3056, XBH: 2559.341, XBA: 149.7963, XP: 452.2051, SO: 0.49094, SNO: 10.4152, SNH: 1.7334, SND: 0.68828, XND: 3.5272, SALK: 4.1256, TSS: 3269.8246 },
  underflow: { SI: 30, SS: 0.88949, XI: 2247.0367, XS: 96.4143, XBH: 5004.6489, XBA: 292.9183, XP: 884.2618, SO: 0.49094, SNO: 10.4152, SNH: 1.7334, SND: 0.68828, XND: 6.8972, SALK: 4.1256, TSS: 6393.9599 },
  effluent: { SI: 30, SS: 0.88949, XI: 4.3918, XS: 0.18844, XBH: 9.7815, XBA: 0.57251, XP: 1.7283, SO: 0.49094, SNO: 10.4152, SNH: 1.7334, SND: 0.68828, XND: 0.01348, SALK: 4.1256, TSS: 12.4969 },
  settlerTSS: [6393.9599, 356.0738, 356.0738, 356.0738, 356.0738, 356.0738, 68.9779, 29.5402, 18.1132, 12.4969],
  sludgeAgeBiomass: 9.1436, sludgeAgeTraditional: 7.3155, thickening: 1.9554, thinning: 0.0038219,
});
/** The tolerance the CH.39 test uses, fixed before the first run (docs/0.11-sessions/water-a-11.md): max(rel x |published|, abs). */
export const BSM1_TOLERANCE = Object.freeze({ rel: 1e-3, abs: 1e-3 });
/** Every published BSM1 value next to the run's (a plantSteady result of bsm1Plant()): → { rows: [{ what, ours, published, deviation, limit, within }], within, total, worst }. */
export function compareBsm1(res, tol = BSM1_TOLERANCE) {
  const P = BSM1_PUBLISHED, rows = [], tss = ASM1_MODEL.tss;
  const add = (what, ours, published) => { const deviation = Math.abs(ours - published), limit = Math.max(tol.rel * Math.abs(published), tol.abs); rows.push({ what, ours, published, deviation, limit, within: deviation <= limit }); };
  res.tanks.forEach((t, i) => { const pub = P['R' + (i + 1)]; if (!pub) return; for (const k of COMP) add('reactor ' + (i + 1) + ' ' + k, t.c[k], pub[k]); add('reactor ' + (i + 1) + ' TSS', tss(t.c), pub.TSS); });
  for (const [name, o] of [['underflow', res.waste], ['effluent', res.effluent]]) { for (const k of COMP) add(name + ' ' + k, o[k], P[name][k]); add(name + ' TSS', tss(o), P[name].TSS); }
  if (res.settler) { res.settler.layers.forEach((l, m) => add('settler layer ' + (m + 1) + ' TSS', l.X, P.settlerTSS[m])); add('thickening factor', res.settler.thickening, P.thickening); add('thinning factor', res.settler.thinning, P.thinning); }
  if (res.sludgeAge) add('sludge age, biomass (d)', res.sludgeAge.biomass, P.sludgeAgeBiomass);
  add('sludge age, traditional (d)', res.srt, P.sludgeAgeTraditional);
  const worst = rows.reduce((a, b) => (!a || b.deviation / b.limit > a.deviation / a.limit ? b : a), null);
  return { rows, within: rows.filter((r) => r.within).length, total: rows.length, worst };
}

// ---- other unit processes -------------------------------------------------------------------------------------------------------------
/** Bar-screen head loss (m) by Kirschmer: beta bar shape factor (the person's), w bar width, b clear spacing, v velocity through the bars (m/s), theta degrees from horizontal. */
export function screenLoss({ beta, w, b, v, theta = 60 }) { if (!(beta > 0 && w > 0 && b > 0 && v > 0)) throw new Error('Screen loss needs beta, bar width, clear spacing and velocity.'); return beta * Math.pow(w / b, 4 / 3) * v * v / (2 * 9.80665) * Math.sin(theta * Math.PI / 180); }
/** Ideal settling basin: removal fraction of particles settling at vs (m/d) in a basin of area A (m2) at flow Q (m3/d). */
export function idealClarifier({ Q, A, vs }) { if (!(Q > 0 && A > 0 && vs >= 0)) throw new Error('Clarifier needs Q, area and a settling velocity.'); const vo = Q / A; return { overflowRate: vo, removal: Math.min(1, vs / vo) }; }
/** Laminar granular-filter head loss (m of water) through depth L (m) at approach velocity v (m/s), grain diameter d (m), porosity eps, kinematic viscosity nu (m2/s). */
export function filterLoss({ L, v, d, eps, nu }) { if (!(L > 0 && v >= 0 && d > 0 && eps > 0 && eps < 1 && nu > 0)) throw new Error('Filter loss needs depth, velocity, grain size, porosity and viscosity.'); return L * 180 * nu * (1 - eps) ** 2 * v / (9.80665 * eps ** 3 * d * d); }
/** Chick-Watson: fraction surviving after contact time t with concentration C. → { surviving, log10 } (log10 removal). */
export function chickWatson({ k, n = 1, C, t }) { if (!(k >= 0 && C >= 0 && t >= 0)) throw new Error('Disinfection needs k, a concentration and a contact time.'); const s = Math.exp(-k * Math.pow(C, n) * t); return { surviving: s, log10: -Math.log10(s) }; }
/** Contact time needed for a log10 removal at concentration C. */
export function ctFor({ k, n = 1, C, log10 }) { if (!(k > 0 && C > 0 && log10 > 0)) throw new Error('Needs k, C and a log removal.'); return log10 * Math.LN10 / (k * Math.pow(C, n)); }
/** Sludge retention time (d): mass in the system over mass leaving. */
export function srtOf({ V, X, Qw, Xw, Qe = 0, Xe = 0 }) { const out = Qw * Xw + Qe * Xe; return out > 0 ? V * X / out : Infinity; }
/** Oxygen: requirement (kg/d) next to what the aerators supply, as Problems when they disagree. */
export function oxygenReport(res) {
  const used = res.balances.oxygen.used / 1000, supplied = res.balances.oxygen.supplied / 1000, ps = [];
  if (res.converged && supplied < 0.95 * used) ps.push(problem('oxygen', 'warning', `Aeration supplies ${supplied.toFixed(1)} kg O2/d but the reactions use ${used.toFixed(1)} kg/d.`, [{ kind: 'plant', id: 'plant' }]));
  return { usedKgPerDay: used, suppliedKgPerDay: supplied, problems: ps };
}
/** Plan footprints for the site (CivilCraft): each tank as an area from volume and water depth. depths { tankId: m } or one number. */
export function siteLinks(plant, depths = 4) {
  return (plant.tanks || []).map((t) => { const d = typeof depths === 'number' ? depths : (depths[t.id] ?? 4), area = t.V / d; return { id: t.id, kind: 'basin', volume: t.V, depth: d, area, side: Math.sqrt(area), aerated: !!t.aerated, note: 'Square footprint as a placeholder; the shape is the designer\'s.' }; });
}
/**
 * The basins on a site plan (CH.20 site links, chem-finish-11): siteLinks() laid out west to east in one row, `gap` metres apart, starting at `origin` (metres, the
 * south-west corner of the first basin). Square footprints are placeholders: the shape and the place are the designer's. A tank with no positive volume or depth is
 * left out and said so. → { basins: [{ ...siteLinks row, polygon: [[x, y] x4] }], geojson (FeatureCollection, LOCAL metres, no CRS), dxf (R12 POLYLINE text), problems }.
 */
export function basinPlan(plant, { depths = 4, gap = 5, origin = [0, 0] } = {}) {
  const f6 = (v) => +(+v).toFixed(6), problems = [], basins = [];
  const g = Number.isFinite(gap) && gap >= 0 ? gap : 5, [x0, y0] = Array.isArray(origin) && origin.every(Number.isFinite) ? origin : [0, 0];
  let x = x0;
  for (const l of siteLinks(plant, depths)) {
    if (!(l.volume > 0 && l.depth > 0 && Number.isFinite(l.area))) { problems.push(problem('site.basin', 'warning', `Tank ${l.id} has no positive volume and depth, so it has no footprint.`, [{ kind: 'tank', id: String(l.id) }])); continue; }
    const s = l.side, polygon = [[x, y0], [x + s, y0], [x + s, y0 + s], [x, y0 + s]].map(([a, b]) => [f6(a), f6(b)]);
    basins.push({ ...l, polygon }); x += s + g;
  }
  const geojson = { type: 'FeatureCollection', name: 'treatment basins', features: basins.map((b) => ({ type: 'Feature',
    properties: { id: String(b.id), kind: 'basin', aerated: b.aerated, volume_m3: f6(b.volume), depth_m: f6(b.depth), area_m2: f6(b.area), review: REVIEW.state },
    geometry: { type: 'Polygon', coordinates: [b.polygon.concat([b.polygon[0]])] } })) };
  const dx = ['0', 'SECTION', '2', 'ENTITIES'];
  for (const b of basins) {
    const layer = b.aerated ? 'WATER-AERATED' : 'WATER-BASIN';
    dx.push('0', 'POLYLINE', '8', layer, '66', '1', '70', '1');
    for (const [px, py] of b.polygon) dx.push('0', 'VERTEX', '8', layer, '10', String(px), '20', String(py), '30', '0');
    dx.push('0', 'SEQEND', '8', layer);
  }
  dx.push('0', 'ENDSEC', '0', 'EOF');
  return { basins, geojson, dxf: dx.join('\n') + '\n', problems };
}
/**
 * WaterTAP as an optional engine (a Python program on the person's own computer, run only through Studio's installed-programs path; never bundled).
 * Licence read 2026-11-21 from https://github.com/watertap-org/watertap/blob/main/LICENSE.md: "WaterTAP Copyright (c) 2020-2026, The Regents of the University of
 * California, through Lawrence Berkeley National Laboratory, Oak Ridge National Laboratory, National Laboratory of the Rockies, and National Energy Technology
 * Laboratory (subject to receipt of any required approvals from the U.S. Dept. of Energy)"; the three BSD-3-Clause conditions (the endorsement clause names those
 * laboratories and the U.S. Dept. of Energy) plus the "Enhancements" paragraph (an enhancement you publish or give to LBNL without a separate agreement is licensed
 * back to LBNL, non-exclusive and royalty-free). That text is SPDX BSD-3-Clause-LBNL; the repository's pyproject.toml declares "BSD-3-Clause". No copyleft.
 * engines.js's permissive list does not hold BSD-3-Clause-LBNL, so the record registers NOT allowed until the owner adds it; and no script is shipped
 * (tools/process/engines/cc_watertap_flowsheet.py does not exist), so turning it on would still need that script and a Studio engine-table entry.
 */
export const WATERTAP_ENGINE = { id: 'watertap', name: 'WaterTAP', license: 'BSD-3-Clause-LBNL', kind: 'program', program: { exe: 'python', script: 'cc_watertap_flowsheet.py', requires: ['watertap'] }, caps: ['water'],
  licenseSource: { url: 'https://github.com/watertap-org/watertap/blob/main/LICENSE.md', read: '2026-11-21', spdx: 'BSD-3-Clause-LBNL', declared: 'BSD-3-Clause (pyproject.toml)', copyleft: false,
    summary: 'BSD-3-Clause with the U.S. Dept. of Energy and laboratory names in the endorsement clause, and an Enhancements grant-back to LBNL for enhancements you make public or give to it.' },
  note: 'Held: BSD-3-Clause-LBNL is not on the permissive list yet (owner decision), and no WaterTAP script is shipped.' };
