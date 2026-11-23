/* SPDX-License-Identifier: Apache-2.0 */
/**
 * adm1.js — the IWA Anaerobic Digestion Model No. 1 as implemented and published for BSM2 (0.11 CH.36, session water-b-11; DOM-free).
 * Batstone, Keller, Angelidaki, Kalyuzhnyi, Pavlostathis, Rozzi, Sanders, Siegrist and Vavilin (2002), Anaerobic Digestion Model No. 1, IWA STR 13, in the form of
 * Rosen and Jeppsson (2006), "Aspects on ADM1 implementation within the BSM2 framework", Lund University IEA report LTH-IEA-7224 (read in full;
 * docs/refs/water-treatment-ch35-38.md § R1). Every equation and value below is from that report; the page is given beside it.
 *
 *   STOICH(par)                    the 19 biochemical processes x 24 liquid states (SIC, SIN rows as Eq. 10 and 11, p. 8-9) as data
 *   rates(x, par, ions)            rho1-rho19 (p. 5) with the BSM2 inhibition (p. 6-7: hydrogen-ion Hill functions, n = 3/(pHUL - pHLL))
 *   solvePH(x, par)                charge balance for SH+ (p. 10, p. 13 E(SH+); Newton from the last value, bracketing as the fallback)
 *   digester(input)                steady state of the liquid (24 states) and the head space (3 gases), ions at equilibrium (the DAE at steady state, p. 15);
 *                                  biogas flow (BSM2's qgas = kp (Pgas - Patm) Pgas / Patm, p. 11) and composition; COD, C and N balances
 *   continuity(par)                COD, carbon and nitrogen of every process row (must be ~0 with Rosen and Jeppsson's values, p. 3-4)
 *   fromSludge(waste, opts)        a waste-sludge stream of the ASM1 calculator turned into an ADM1 feed (this file's own simple interface, see its comment)
 *   BSM2_STEADY_INPUT / BSM2_STEADY_OUTPUT   the published steady-state table (p. 20), which the tests reproduce
 * Units as the report: kg COD/m3, kmol C/m3, kmol N/m3, kmol/m3 (M), bar, d. A study aid, not a process design approval.
 */
import { solveLinear, illinois } from '../numeric.js';
import { problem as baseProblem } from '../report.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, about = [{ kind: 'digester', id: 'AD' }]) => { const p = baseProblem('adm1.' + code, severity, text, about); p.source = SRC; return p; };

/** Liquid states 1-24 (+ cations, anions) in the report's order (p. 8-10, p. 20). */
export const STATES = ['Ssu', 'Saa', 'Sfa', 'Sva', 'Sbu', 'Spro', 'Sac', 'Sh2', 'Sch4', 'SIC', 'SIN', 'SI', 'Xc', 'Xch', 'Xpr', 'Xli', 'Xsu', 'Xaa', 'Xfa', 'Xc4', 'Xpro', 'Xac', 'Xh2', 'XI'];
export const IONS = ['Scat', 'San'];
export const GAS = ['Sgas_h2', 'Sgas_ch4', 'Sgas_co2'];
export const PROCESSES = ['disintegration', 'hydrolysis of carbohydrates', 'hydrolysis of proteins', 'hydrolysis of lipids', 'uptake of sugars', 'uptake of amino acids',
  'uptake of LCFA', 'uptake of valerate', 'uptake of butyrate', 'uptake of propionate', 'uptake of acetate', 'uptake of hydrogen', 'decay of Xsu', 'decay of Xaa', 'decay of Xfa',
  'decay of Xc4', 'decay of Xpro', 'decay of Xac', 'decay of Xh2'];

/** Rosen and Jeppsson (2006) § 6: stoichiometric p. 16, biochemical p. 17, physico-chemical and physical p. 18. Temperatures in K. */
export const PAR = Object.freeze({
  fsI_xc: 0.1, fxI_xc: 0.2, fch_xc: 0.2, fpr_xc: 0.2, fli_xc: 0.3, Nxc: 0.0376 / 14, NI: 0.06 / 14, Naa: 0.007,
  Cxc: 0.02786, CsI: 0.03, Cch: 0.0313, Cpr: 0.03, Cli: 0.022, CxI: 0.03, Csu: 0.0313, Caa: 0.03, ffa_li: 0.95, Cfa: 0.0217,
  fh2_su: 0.19, fbu_su: 0.13, fpro_su: 0.27, fac_su: 0.41, Nbac: 0.08 / 14, Cbu: 0.025, Cpro: 0.0268, Cac: 0.0313, Cbac: 0.0313, Ysu: 0.1,
  fh2_aa: 0.06, fva_aa: 0.23, fbu_aa: 0.26, fpro_aa: 0.05, fac_aa: 0.40, Cva: 0.024, Yaa: 0.08, Yfa: 0.06, Yc4: 0.06, Ypro: 0.04, Cch4: 0.0156, Yac: 0.05, Yh2: 0.06,
  kdis: 0.5, khyd_ch: 10, khyd_pr: 10, khyd_li: 10, KS_IN: 1e-4, km_su: 30, KS_su: 0.5, pHUL_aa: 5.5, pHLL_aa: 4, km_aa: 50, KS_aa: 0.3, km_fa: 6, KS_fa: 0.4,
  KIh2_fa: 5e-6, km_c4: 20, KS_c4: 0.2, KIh2_c4: 1e-5, km_pro: 13, KS_pro: 0.1, KIh2_pro: 3.5e-6, km_ac: 8, KS_ac: 0.15, KI_nh3: 0.0018, pHUL_ac: 7, pHLL_ac: 6,
  km_h2: 35, KS_h2: 7e-6, pHUL_h2: 6, pHLL_h2: 5, kdec_Xsu: 0.02, kdec_Xaa: 0.02, kdec_Xfa: 0.02, kdec_Xc4: 0.02, kdec_Xpro: 0.02, kdec_Xac: 0.02, kdec_Xh2: 0.02,
  R: 0.083145, Tbase: 298.15, Top: 308.15, pKw_base: 14, pKa_va: 4.86, pKa_bu: 4.82, pKa_pro: 4.88, pKa_ac: 4.76, pKa_co2_base: 6.35, pKa_IN_base: 9.25,
  Patm: 1.013, pgas_h2o_base: 0.0313, kp: 5e4, kLa: 200, KH_co2_base: 0.035, KH_ch4_base: 0.0014, KH_h2_base: 7.8e-4, Vliq: 3400, Vgas: 300,
});
export const SOURCES = {
  model: 'Batstone et al. (2002), Anaerobic Digestion Model No. 1, IWA STR 13, as implemented for BSM2 by Rosen and Jeppsson (2006), LTH-IEA-7224 (Lund University), read in full.',
  values: 'Rosen and Jeppsson (2006) § 6, tables on p. 16-18; the steady-state table p. 20 is reproduced by the tests.',
  inhibition: 'BSM2 hydrogen-ion Hill functions, I = K^n/(SH^n + K^n), K = 10^-(pHLL+pHUL)/2, n = 3/(pHUL - pHLL) (Rosen and Jeppsson p. 7 and appendix A.2).',
  gas: 'Head-space outflow kp (Pgas - Patm) in the gas balances; reported qgas = kp (Pgas - Patm) Pgas/Patm, the BSM2 choice (p. 11), so the flow is at atmospheric pressure.',
  temperature: 'Kw, Ka,co2, Ka,IN, KH,co2, KH,ch4, KH,h2 and pgas,h2o follow the operating temperature by van \'t Hoff factors (p. 4-5, p. 18); the biochemical rates do not (p. 5: still discussed by the task groups).',
};
export const REVIEW = { state: 'reproduces the published BSM2 steady state', note: 'ADM1 as Rosen and Jeppsson (2006) publish it for BSM2, checked against their steady-state table. The sludge interface (fromSludge) is this program\'s own simple one, not the BSM2 ASM1-ADM1 interface, which was not read.' };

/** Temperature-dependent physico-chemical values at par.Top (p. 18). */
export function physchem(p = PAR) {
  const factor = (1 / p.Tbase - 1 / p.Top) / (100 * p.R);
  return {
    Kw: Math.pow(10, -p.pKw_base) * Math.exp(55900 * factor), Ka_va: Math.pow(10, -p.pKa_va), Ka_bu: Math.pow(10, -p.pKa_bu), Ka_pro: Math.pow(10, -p.pKa_pro), Ka_ac: Math.pow(10, -p.pKa_ac),
    Ka_co2: Math.pow(10, -p.pKa_co2_base) * Math.exp(7646 * factor), Ka_IN: Math.pow(10, -p.pKa_IN_base) * Math.exp(51965 * factor),
    KH_co2: p.KH_co2_base * Math.exp(-19410 * factor), KH_ch4: p.KH_ch4_base * Math.exp(-14240 * factor), KH_h2: p.KH_h2_base * Math.exp(-4180 * factor),
    pgas_h2o: p.pgas_h2o_base * Math.exp(5290 * (1 / p.Tbase - 1 / p.Top)),
  };
}

/** The 19 x 24 Petersen matrix: rows of { state: coefficient }, the SIC row from Eq. 10 (s1-s13, p. 9) and the SIN row from Eq. 11 (p. 8). */
export function STOICH(p = PAR) {
  const z = () => Object.fromEntries(STATES.map((k) => [k, 0])), rows = [];
  const s = [
    -p.Cxc + p.fsI_xc * p.CsI + p.fch_xc * p.Cch + p.fpr_xc * p.Cpr + p.fli_xc * p.Cli + p.fxI_xc * p.CxI,
    -p.Cch + p.Csu, -p.Cpr + p.Caa, -p.Cli + (1 - p.ffa_li) * p.Csu + p.ffa_li * p.Cfa,
    -p.Csu + (1 - p.Ysu) * (p.fbu_su * p.Cbu + p.fpro_su * p.Cpro + p.fac_su * p.Cac) + p.Ysu * p.Cbac,
    -p.Caa + (1 - p.Yaa) * (p.fva_aa * p.Cva + p.fbu_aa * p.Cbu + p.fpro_aa * p.Cpro + p.fac_aa * p.Cac) + p.Yaa * p.Cbac,
    -p.Cfa + (1 - p.Yfa) * 0.7 * p.Cac + p.Yfa * p.Cbac,
    -p.Cva + (1 - p.Yc4) * 0.54 * p.Cpro + (1 - p.Yc4) * 0.31 * p.Cac + p.Yc4 * p.Cbac,
    -p.Cbu + (1 - p.Yc4) * 0.8 * p.Cac + p.Yc4 * p.Cbac,
    -p.Cpro + (1 - p.Ypro) * 0.57 * p.Cac + p.Ypro * p.Cbac,
    -p.Cac + (1 - p.Yac) * p.Cch4 + p.Yac * p.Cbac,
    (1 - p.Yh2) * p.Cch4 + p.Yh2 * p.Cbac,
    -p.Cbac + p.Cxc,
  ];
  let r;
  r = z(); Object.assign(r, { Xc: -1, SI: p.fsI_xc, Xch: p.fch_xc, Xpr: p.fpr_xc, Xli: p.fli_xc, XI: p.fxI_xc, SIC: -s[0], SIN: p.Nxc - p.fxI_xc * p.NI - p.fsI_xc * p.NI - p.fpr_xc * p.Naa }); rows.push(r);
  r = z(); Object.assign(r, { Xch: -1, Ssu: 1, SIC: -s[1] }); rows.push(r);
  r = z(); Object.assign(r, { Xpr: -1, Saa: 1, SIC: -s[2] }); rows.push(r);
  r = z(); Object.assign(r, { Xli: -1, Ssu: 1 - p.ffa_li, Sfa: p.ffa_li, SIC: -s[3] }); rows.push(r);
  r = z(); Object.assign(r, { Ssu: -1, Sbu: (1 - p.Ysu) * p.fbu_su, Spro: (1 - p.Ysu) * p.fpro_su, Sac: (1 - p.Ysu) * p.fac_su, Sh2: (1 - p.Ysu) * p.fh2_su, SIC: -s[4], SIN: -p.Ysu * p.Nbac, Xsu: p.Ysu }); rows.push(r);
  r = z(); Object.assign(r, { Saa: -1, Sva: (1 - p.Yaa) * p.fva_aa, Sbu: (1 - p.Yaa) * p.fbu_aa, Spro: (1 - p.Yaa) * p.fpro_aa, Sac: (1 - p.Yaa) * p.fac_aa, Sh2: (1 - p.Yaa) * p.fh2_aa, SIC: -s[5], SIN: p.Naa - p.Yaa * p.Nbac, Xaa: p.Yaa }); rows.push(r);
  r = z(); Object.assign(r, { Sfa: -1, Sac: (1 - p.Yfa) * 0.7, Sh2: (1 - p.Yfa) * 0.3, SIC: -s[6], SIN: -p.Yfa * p.Nbac, Xfa: p.Yfa }); rows.push(r);
  r = z(); Object.assign(r, { Sva: -1, Spro: (1 - p.Yc4) * 0.54, Sac: (1 - p.Yc4) * 0.31, Sh2: (1 - p.Yc4) * 0.15, SIC: -s[7], SIN: -p.Yc4 * p.Nbac, Xc4: p.Yc4 }); rows.push(r);
  r = z(); Object.assign(r, { Sbu: -1, Sac: (1 - p.Yc4) * 0.8, Sh2: (1 - p.Yc4) * 0.2, SIC: -s[8], SIN: -p.Yc4 * p.Nbac, Xc4: p.Yc4 }); rows.push(r);
  r = z(); Object.assign(r, { Spro: -1, Sac: (1 - p.Ypro) * 0.57, Sh2: (1 - p.Ypro) * 0.43, SIC: -s[9], SIN: -p.Ypro * p.Nbac, Xpro: p.Ypro }); rows.push(r);
  r = z(); Object.assign(r, { Sac: -1, Sch4: 1 - p.Yac, SIC: -s[10], SIN: -p.Yac * p.Nbac, Xac: p.Yac }); rows.push(r);
  r = z(); Object.assign(r, { Sh2: -1, Sch4: 1 - p.Yh2, SIC: -s[11], SIN: -p.Yh2 * p.Nbac, Xh2: p.Yh2 }); rows.push(r);
  for (const X of ['Xsu', 'Xaa', 'Xfa', 'Xc4', 'Xpro', 'Xac', 'Xh2']) { r = z(); Object.assign(r, { [X]: -1, Xc: 1, SIC: -s[12], SIN: p.Nbac - p.Nxc }); rows.push(r); }
  return rows;
}

/** COD, carbon and nitrogen content of each state (p. 3-4, p. 16): the columns continuity() multiplies the matrix by. */
export function composition(p = PAR) {
  const bm = ['Xsu', 'Xaa', 'Xfa', 'Xc4', 'Xpro', 'Xac', 'Xh2'];
  const COD = Object.fromEntries(STATES.filter((k) => k !== 'SIC' && k !== 'SIN').map((k) => [k, 1]));
  const C = { Ssu: p.Csu, Saa: p.Caa, Sfa: p.Cfa, Sva: p.Cva, Sbu: p.Cbu, Spro: p.Cpro, Sac: p.Cac, Sch4: p.Cch4, SIC: 1, SI: p.CsI, Xc: p.Cxc, Xch: p.Cch, Xpr: p.Cpr, Xli: p.Cli, XI: p.CxI };
  const N = { Saa: p.Naa, SIN: 1, SI: p.NI, Xc: p.Nxc, Xpr: p.Naa, XI: p.NI };
  for (const b of bm) { C[b] = p.Cbac; N[b] = p.Nbac; }
  return { COD, C, N };
}
export function continuity(p = PAR) {
  const comp = composition(p), M = STOICH(p), rows = [];
  let worst = 0;
  M.forEach((r, j) => { const q = {}; for (const [name, f] of Object.entries(comp)) { const v = Object.entries(r).reduce((s, [k, c]) => s + c * (f[k] || 0), 0); q[name] = v; worst = Math.max(worst, Math.abs(v)); } rows.push({ process: PROCESSES[j], q }); });
  return { rows, worst };
}

/** Ions at equilibrium for a given SH+ (the ODE ion states at steady state; p. 10 and appendix A.1). */
export function ionsAt(x, SH, k) {
  return { Sva_: k.Ka_va * x.Sva / (k.Ka_va + SH), Sbu_: k.Ka_bu * x.Sbu / (k.Ka_bu + SH), Spro_: k.Ka_pro * x.Spro / (k.Ka_pro + SH), Sac_: k.Ka_ac * x.Sac / (k.Ka_ac + SH),
    Shco3_: k.Ka_co2 * x.SIC / (k.Ka_co2 + SH), Snh3: k.Ka_IN * x.SIN / (k.Ka_IN + SH) };
}
/** SH+ from the charge balance E(SH+) = 0 (p. 13). x carries Scat and San. → { SH, pH, ions } */
export function solvePH(x, p = PAR, k = physchem(p), guess = 3.4e-8) {
  const E = (SH) => { const i = ionsAt(x, SH, k); return x.Scat + (x.SIN - i.Snh3) + SH - i.Shco3_ - i.Sac_ / 64 - i.Spro_ / 112 - i.Sbu_ / 160 - i.Sva_ / 208 - k.Kw / SH - x.San; };
  let SH = guess > 0 ? guess : 1e-7;
  for (let it = 0; it < 50; it++) {             // Newton as the report's pHsolver (tolerance 1e-12), with a numerical slope
    const e = E(SH), d = (E(SH * (1 + 1e-7)) - e) / (SH * 1e-7), nx = SH - e / d;
    if (!(nx > 0) || !Number.isFinite(nx)) { SH = NaN; break; }
    if (Math.abs(nx - SH) < 1e-12 * SH || Math.abs(e) < 1e-14) { SH = nx; break; }
    SH = nx;
  }
  if (!(SH > 0)) { const lg = illinois((l) => E(Math.pow(10, l)), -14, 0, { tol: 1e-14 }); SH = lg == null ? 1e-7 : Math.pow(10, lg); }
  return { SH, pH: -Math.log10(SH), ions: ionsAt(x, SH, k) };
}
const hill = (SH, UL, LL) => { const K = Math.pow(10, -(UL + LL) / 2), n = 3 / (UL - LL); return Math.pow(K, n) / (Math.pow(SH, n) + Math.pow(K, n)); };
const pos = (v) => (v > 0 ? v : 0);
/** rho1-rho19 (kg COD/m3/d) and the inhibition factors, at liquid state x and SH+ (p. 5-7). */
export function rates(x, p, SH, ions) {
  const S = Object.fromEntries(STATES.map((k) => [k, pos(x[k])])), IpH_aa = hill(SH, p.pHUL_aa, p.pHLL_aa), IpH_ac = hill(SH, p.pHUL_ac, p.pHLL_ac), IpH_h2 = hill(SH, p.pHUL_h2, p.pHLL_h2);
  const IIN = 1 / (1 + p.KS_IN / (S.SIN || 1e-300)), Ih2_fa = 1 / (1 + S.Sh2 / p.KIh2_fa), Ih2_c4 = 1 / (1 + S.Sh2 / p.KIh2_c4), Ih2_pro = 1 / (1 + S.Sh2 / p.KIh2_pro), Inh3 = 1 / (1 + pos(ions.Snh3) / p.KI_nh3);
  const I56 = IpH_aa * IIN, I7 = I56 * Ih2_fa, I89 = I56 * Ih2_c4, I10 = I56 * Ih2_pro, I11 = IpH_ac * IIN * Inh3, I12 = IpH_h2 * IIN;
  const m = (km, Sx, K, X, I) => km * Sx / (K + Sx) * X * I;
  const rho = [
    p.kdis * S.Xc, p.khyd_ch * S.Xch, p.khyd_pr * S.Xpr, p.khyd_li * S.Xli,
    m(p.km_su, S.Ssu, p.KS_su, S.Xsu, I56), m(p.km_aa, S.Saa, p.KS_aa, S.Xaa, I56), m(p.km_fa, S.Sfa, p.KS_fa, S.Xfa, I7),
    m(p.km_c4, S.Sva, p.KS_c4, S.Xc4, I89) * S.Sva / (S.Sbu + S.Sva + 1e-6), m(p.km_c4, S.Sbu, p.KS_c4, S.Xc4, I89) * S.Sbu / (S.Sva + S.Sbu + 1e-6),
    m(p.km_pro, S.Spro, p.KS_pro, S.Xpro, I10), m(p.km_ac, S.Sac, p.KS_ac, S.Xac, I11), m(p.km_h2, S.Sh2, p.KS_h2, S.Xh2, I12),
    p.kdec_Xsu * S.Xsu, p.kdec_Xaa * S.Xaa, p.kdec_Xfa * S.Xfa, p.kdec_Xc4 * S.Xc4, p.kdec_Xpro * S.Xpro, p.kdec_Xac * S.Xac, p.kdec_Xh2 * S.Xh2,
  ];
  return { rho, inhibition: { IpH_aa, IpH_ac, IpH_h2, IIN, Ih2_fa, Ih2_c4, Ih2_pro, Inh3 } };
}
/** Gas transfer (p. 6) and the head space (p. 11). */
export function gasPhase(x, g, p, k, ions) {
  const RT = p.R * p.Top, ph2 = g.Sgas_h2 * RT / 16, pch4 = g.Sgas_ch4 * RT / 64, pco2 = g.Sgas_co2 * RT, Pgas = ph2 + pch4 + pco2 + k.pgas_h2o;
  const Sco2 = x.SIC - ions.Shco3_;
  const T8 = p.kLa * (x.Sh2 - 16 * k.KH_h2 * ph2), T9 = p.kLa * (x.Sch4 - 64 * k.KH_ch4 * pch4), T10 = p.kLa * (Sco2 - k.KH_co2 * pco2);
  // the head-space outflow at its own pressure drives the gas balances; the reported flow is that flow at atmospheric pressure (p. 11). The published steady state
  // (p. 20) closes its COD balance only this way: Sgas,ch4 x kp (Pgas - Patm) = the methane COD leaving, and qgas 2955.7 = that flow x Pgas/Patm.
  const qhead = Math.max(0, p.kp * (Pgas - p.Patm)), qgas = qhead * Pgas / p.Patm;
  return { ph2, pch4, pco2, Pgas, qhead, qgas, Sco2, T8, T9, T10 };
}

/** The BSM2 steady-state test input (Rosen and Jeppsson 2006, p. 20): q 170 m3/d at 35 C. */
export const BSM2_STEADY_INPUT = Object.freeze({ q: 170, T: 35, influent: Object.freeze({ Ssu: 0.01, Saa: 0.001, Sfa: 0.001, Sva: 0.001, Sbu: 0.001, Spro: 0.001, Sac: 0.001, Sh2: 1.0e-8,
  Sch4: 1.0e-5, SIC: 0.04, SIN: 0.01, SI: 0.02, Xc: 2.0, Xch: 5.0, Xpr: 20.0, Xli: 5.0, Xsu: 0.0, Xaa: 0.01, Xfa: 0.01, Xc4: 0.01, Xpro: 0.01, Xac: 0.01, Xh2: 0.01, XI: 25.0, Scat: 0.04, San: 0.02 }) });
/** The published steady-state output (p. 20), as printed. */
export const BSM2_STEADY_OUTPUT = Object.freeze({ Ssu: 0.0119548297170, Saa: 0.0053147401716, Sfa: 0.0986214009308, Sva: 0.0116250064639, Sbu: 0.0132507296663, Spro: 0.0157836662845,
  Sac: 0.1976297169375, Sh2: 0.0000002359451, Sch4: 0.0550887764460, SIC: 0.1526778706263, SIN: 0.1302298158037, SI: 0.3286976637215, Xc: 0.3086976637215, Xch: 0.0279472404350,
  Xpr: 0.1025741061067, Xli: 0.0294830497073, Xsu: 0.4201659824546, Xaa: 1.1791717989237, Xfa: 0.2430353447194, Xc4: 0.4319211056360, Xpro: 0.1373059089340, Xac: 0.7605626583132,
  Xh2: 0.3170229533613, XI: 25.6173953274430, pH: 7.4655377698929, SH: 0.0000000342344, Sva_: 0.0115962470726, Sbu_: 0.0132208262485, Spro_: 0.0157427831916, Sac_: 0.1972411554365,
  Shco3_: 0.1427774793921, Sco2: 0.0099003912343, Snh3: 0.0040909284584, Snh4: 0.1261388873452, Sgas_h2: 0.0000102410356, Sgas_ch4: 1.6256072099814, Sgas_co2: 0.0141505346784,
  pgas_h2: 0.0000163991826, pgas_ch4: 0.6507796328232, pgas_co2: 0.3625527133281, pgas: 1.0690164904089, qgas: 2955.70345419378 });

/** Input checks → Problems. */
export function checkInput(inp) {
  const ps = [], inf = inp?.influent || {};
  if (!(inp?.q > 0)) ps.push(problem('q', 'error', 'The feed flow q must be above 0 m3/d.'));
  const V = inp?.par?.Vliq ?? PAR.Vliq;
  if (!(V > 0) || !((inp?.par?.Vgas ?? PAR.Vgas) > 0)) ps.push(problem('volume', 'error', 'The liquid and gas volumes must be above 0 m3.'));
  if (inp?.T != null && !(inp.T >= 0 && inp.T <= 60)) ps.push(problem('temperature', 'error', `Operating temperature ${inp.T} C is outside 0-60 C, the range of the temperature laws (Rosen and Jeppsson p. 5).`));
  else if (inp?.T != null && (inp.T < 30 || inp.T > 40)) ps.push(problem('temperature.rates', 'warning', `At ${inp.T} C the biochemical rates are still the 35 C values: ADM1 in BSM2 corrects only the physico-chemical constants for temperature (p. 5).`));
  for (const k of STATES.concat(IONS)) { const v = inf[k]; if (v != null && (!Number.isFinite(v) || v < 0)) ps.push(problem('influent', 'error', `Feed ${k} must be a number at or above 0 (it is ${v}).`)); }
  for (const k of Object.keys(inf)) if (!STATES.includes(k) && !IONS.includes(k)) ps.push(problem('influent.unknown', 'warning', `Feed component ${k} is not an ADM1 state and is ignored.`));
  if (inp?.q > 0 && V > 0) { const hrt = V / inp.q; if (hrt < 10) ps.push(problem('hrt', 'warning', `Hydraulic retention ${hrt.toFixed(1)} d is short for a digester without solids retention: check that the methanogens do not wash out (results below).`)); }
  return ps;
}

/**
 * Steady state of one digester. input { q (m3/d), T? (C, default 35), influent { state: value, Scat, San }, par? (overrides, e.g. Vliq, Vgas), tol?, init? }.
 * Method: the 24 liquid and 3 gas balances set to zero with the ions at equilibrium (the DAE's steady state equals the ODE's, p. 15), solved by pseudo-transient
 * continuation (implicit steps over numeric.js solveLinear, the step growing while the residual falls); water.js plantSteady cannot be used: it is written for tanks
 * in series and has no gas phase. → { liquid, gas, pH, SH, ions, biogas, balances, inhibition, converged, iterations, problems, notes }
 */
export function digester(input) {
  const problems = checkInput(input);
  if (problems.some((p) => p.severity === 'error')) { const e = new Error(problems.filter((p) => p.severity === 'error').map((p) => p.text).join(' ')); e.problems = problems; throw e; }
  const p = { ...PAR, ...(input.par || {}), Top: 273.15 + (input.T ?? 35) }, k = physchem(p), M = STOICH(p), q = input.q, inf = { ...input.influent };
  const xin = STATES.map((s) => inf[s] ?? 0), Scat = inf.Scat ?? 0, San = inf.San ?? 0, D = q / p.Vliq, ns = STATES.length, iH2 = STATES.indexOf('Sh2'), iCH4 = STATES.indexOf('Sch4'), iIC = STATES.indexOf('SIC');
  let SHlast = 3.4e-8;
  const unpack = (y) => { const x = Object.fromEntries(STATES.map((s, i) => [s, y[i]])); x.Scat = Scat; x.San = San; return { x, g: { Sgas_h2: y[ns], Sgas_ch4: y[ns + 1], Sgas_co2: y[ns + 2] } }; };
  const F = (y) => {
    const { x, g } = unpack(y), ph = solvePH(x, p, k, SHlast), r = rates(x, p, ph.SH, ph.ions), gp = gasPhase(x, g, p, k, ph.ions), out = new Array(ns + 3);
    for (let i = 0; i < ns; i++) { let s = D * (xin[i] - y[i]); const key = STATES[i]; for (let j = 0; j < 19; j++) { const v = M[j][key]; if (v) s += v * r.rho[j]; } out[i] = s; }
    out[iH2] -= gp.T8; out[iCH4] -= gp.T9; out[iIC] -= gp.T10;
    out[ns] = -g.Sgas_h2 * gp.qhead / p.Vgas + gp.T8 * p.Vliq / p.Vgas;
    out[ns + 1] = -g.Sgas_ch4 * gp.qhead / p.Vgas + gp.T9 * p.Vliq / p.Vgas;
    out[ns + 2] = -g.Sgas_co2 * gp.qhead / p.Vgas + gp.T10 * p.Vliq / p.Vgas;
    return out;
  };
  // first guess: the feed, some biomass of each group, a little gas
  const seedX = { Xsu: 0.4, Xaa: 1, Xfa: 0.2, Xc4: 0.4, Xpro: 0.1, Xac: 0.7, Xh2: 0.3 };
  let y = input.init ? STATES.map((s) => input.init[s] ?? 0).concat(GAS.map((s) => input.init[s] ?? 0)) : STATES.map((s, i) => (seedX[s] ?? 0) + xin[i] * (s.startsWith('X') ? 0.1 : 1) + (s === 'SIC' ? 0.1 : s === 'SIN' ? 0.1 : 0)).concat([1e-5, 1.5, 0.014]);
  const N = y.length, floor = (i) => (i === iH2 ? 1e-9 : i === ns ? 1e-7 : 1e-4), scale = (v, i) => Math.abs(v) + floor(i);
  const resid = (yy) => { const d = F(yy); let m = 0; for (let i = 0; i < N; i++) m = Math.max(m, Math.abs(d[i]) / scale(yy[i], i)); return m; };
  const tol = input.tol ?? 1e-10, maxIter = input.maxIter ?? 3000;
  let h = 1e-4, it = 0, conv = false, r0 = resid(y);
  while (it < maxIter) {
    const F0 = F(y), J = Array.from({ length: N }, () => new Array(N).fill(0));
    for (let j = 0; j < N; j++) { const e = 1e-7 * scale(y[j], j), yp = y.slice(); yp[j] += e; const Fp = F(yp); for (let i = 0; i < N; i++) J[i][j] = (Fp[i] - F0[i]) / e; }
    const A = J.map((row, i) => row.map((v, j) => (i === j ? 1 / h : 0) - v)), dy = solveLinear(A, F0);
    if (!dy) { h /= 4; it++; continue; }
    let ch = 0; for (let i = 0; i < N; i++) ch = Math.max(ch, Math.abs(dy[i]) / scale(y[i], i));
    if (ch > 0.3 && h > 1e-12) { h /= 2; it++; continue; }
    y = y.map((v, i) => Math.max(1e-14, v + dy[i]));
    { const { x } = unpack(y); SHlast = solvePH(x, p, k, SHlast).SH; }
    it++; r0 = resid(y);
    if (r0 < tol) { conv = true; break; }
    if (ch < 0.1) h = Math.min(h * 3, 1e12);
  }
  const { x, g } = unpack(y), ph = solvePH(x, p, k, SHlast), r = rates(x, p, ph.SH, ph.ions), gp = gasPhase(x, g, p, k, ph.ions);
  const comp = composition(p), sum = (o, f) => Object.entries(f).reduce((s, [kk, v]) => s + v * (o[kk] ?? 0), 0);
  // balances (kg/d): feed in, digested sludge out, gas out (COD of H2 and CH4; carbon of CH4 and CO2)
  const gasCOD = gp.qhead * (g.Sgas_h2 + g.Sgas_ch4), gasC = gp.qhead * (g.Sgas_ch4 * p.Cch4 + g.Sgas_co2);
  const balances = {};
  for (const [name, f] of Object.entries(comp)) {
    const inQ = q * sum(inf, f), outQ = q * sum(x, f), gas = name === 'COD' ? gasCOD : name === 'C' ? gasC : 0, res = inQ - outQ - gas;
    balances[name] = { in: inQ, out: outQ, gas, residual: res, rel: res / (Math.abs(inQ) + 1e-30) };
  }
  const ch4Frac = gp.pch4 / gp.Pgas, co2Frac = gp.pco2 / gp.Pgas;
  const biogas = { flow: gp.qgas, ch4: ch4Frac, co2: co2Frac, h2: gp.ph2 / gp.Pgas, h2o: k.pgas_h2o / gp.Pgas, methane: gp.qgas * ch4Frac, methaneCOD: gp.qhead * g.Sgas_ch4, headSpaceFlow: gp.qhead, Pgas: gp.Pgas,
    pgas_h2: gp.ph2, pgas_ch4: gp.pch4, pgas_co2: gp.pco2, note: 'Flow at atmospheric pressure and the operating temperature (BSM2, p. 11 and p. 20), composition by partial pressure, water vapour included.' };
  const notes = ['ADM1 in the BSM2 form (Rosen and Jeppsson 2006): steady state, ions at equilibrium, qgas = kp (Pgas - Patm) Pgas/Patm.', 'Biochemical rates are the 35 C values whatever the temperature; physico-chemical constants follow it.'];
  if (!conv) problems.push(problem('notsteady', 'warning', `The digester had not settled after ${it} steps (largest relative rate ${r0.toExponential(2)}); the numbers are the last state.`));
  for (const [name, b] of Object.entries(balances)) if (conv && Math.abs(b.rel) > 1e-6) problems.push(problem('balance.' + name, 'error', `${name} balance does not close (${(b.rel * 100).toFixed(4)} %).`));
  if (r.inhibition.IpH_ac < 0.5) problems.push(problem('ph', 'warning', `pH ${ph.pH.toFixed(2)} halves acetate uptake or worse (pH inhibition ${r.inhibition.IpH_ac.toFixed(2)}): the digester is souring.`));
  if (r.inhibition.Inh3 < 0.5) problems.push(problem('nh3', 'info', `Free ammonia ${ph.ions.Snh3.toExponential(2)} kmol N/m3 slows acetate uptake to ${(r.inhibition.Inh3 * 100).toFixed(0)} % of its uninhibited rate (KI,nh3 ${p.KI_nh3} M; the BSM2 test case itself runs at 31 %).`));
  if (x.Xac < 1e-3 || x.Xh2 < 1e-3) problems.push(problem('washout', 'warning', 'Methanogens have washed out: the retention time is too short or the digester is inhibited; little or no methane.'));
  return { liquid: Object.fromEntries(STATES.map((s) => [s, x[s]])), gas: g, Scat, San, pH: ph.pH, SH: ph.SH, ions: { ...ph.ions, Sco2: gp.Sco2, Snh4: x.SIN - ph.ions.Snh3 }, biogas, balances,
    rates: r.rho, inhibition: r.inhibition, hrt: p.Vliq / q, converged: conv, iterations: it, residual: r0, problems, notes, T: p.Top - 273.15 };
}

/**
 * A waste-sludge stream from the ASM1 calculator (water.js result .waste, g/m3, and Qw m3/d) as an ADM1 feed. This is a simple interface of this program, NOT the
 * BSM2 ASM1-ADM1 interface (Nopens et al. 2009), which was not read: ASM1 SS + XS + XBH + XBA go to composites Xc (which ADM1 disintegrates by its own fractions),
 * XI + XP to XI, SI to SI, SNH to SIN; the ASM1 organic nitrogen that Xc and XI do not carry (Nxc, NI) is added to SIN so N is conserved, and said; SALK
 * (mol/m3) becomes SIC (kmol/m3). Thickening multiplies the particulates by `thicken` and divides the flow by it; solubles keep their concentration, so their share
 * leaves with the thickener's water. Cations and anions are the person's.
 * opts { thicken (>= 1), Scat, San (kmol/m3), par? (ADM1 par for Nxc, NI), iXB = 0.08, iXP = 0.06 (ASM1's N contents) } → { q, influent, problems, notes }
 */
export function fromSludge(waste, Qw, opts = {}) {
  const ps = [], k = opts.thicken ?? 1, p = { ...PAR, ...(opts.par || {}) }, iXB = opts.iXB ?? 0.08, iXP = opts.iXP ?? 0.06, w = (key) => (waste?.[key] ?? 0) / 1000;
  if (!(Qw > 0)) ps.push(problem('sludge.q', 'error', 'The waste sludge flow Qw must be above 0 m3/d.'));
  if (!(k >= 1)) ps.push(problem('sludge.thicken', 'error', 'Thickening must be 1 (none) or more.'));
  if (ps.length) { const e = new Error(ps.map((x) => x.text).join(' ')); e.problems = ps; throw e; }
  const Xc = (w('XS') + w('XBH') + w('XBA')) * k + w('SS'), XI = (w('XI') + w('XP')) * k, SI = w('SI');   // solubles keep their concentration: the thickener's water takes its share away
  const nAsm = (w('SND') + w('XND') * k) + iXB * (w('XBH') + w('XBA')) * k + iXP * w('XP') * k + w('SNH') + w('SNO');   // kg N/m3 (XI of ASM1 carries no N)
  const nAdm = (p.Nxc * Xc + p.NI * (XI + SI)) * 14, extra = nAsm - nAdm - w('SNO');
  let SIN = w('SNH') / 14 + Math.max(0, extra - w('SNH')) / 14;
  if (extra - w('SNH') < 0) ps.push(problem('sludge.n', 'warning', `The ADM1 composites carry ${(nAdm * 1000).toFixed(1)} g N/m3 but the sludge has only ${((nAsm - w('SNO')) * 1000).toFixed(1)} g N/m3 of reduced N: the difference is not in the feed.`));
  else ps.push(problem('sludge.n.info', 'info', `${(((extra - w('SNH')) * 1000)).toFixed(1)} g N/m3 of ASM1 organic N that the composites do not carry was added to SIN, so nitrogen is conserved.`));
  if (w('SNO') > 0) ps.push(problem('sludge.no3', 'info', `Nitrate (${(w('SNO') * 1000).toFixed(2)} g N/m3) has no ADM1 state and is left out.`));
  SIN = Math.max(SIN, 0);
  const influent = { Ssu: 0, Saa: 0, Sfa: 0, Sva: 0, Sbu: 0, Spro: 0, Sac: 0, Sh2: 0, Sch4: 0, SIC: (waste?.SALK ?? 0) / 1000, SIN, SI, Xc, Xch: 0, Xpr: 0, Xli: 0, Xsu: 0, Xaa: 0, Xfa: 0, Xc4: 0, Xpro: 0, Xac: 0, Xh2: 0, XI,
    Scat: opts.Scat ?? 0.04, San: opts.San ?? 0.02 };
  if (opts.Scat == null || opts.San == null) ps.push(problem('sludge.ions', 'info', 'Cations and anions were not given: the BSM2 test values 0.04 and 0.02 kmol/m3 (Rosen and Jeppsson p. 20) are used; they set the pH.'));
  return { q: Qw / k, influent, problems: ps, notes: ['Sludge to digester: this program\'s simple interface (see adm1.js fromSludge), not the BSM2 ASM1-ADM1 interface.'] };
}
