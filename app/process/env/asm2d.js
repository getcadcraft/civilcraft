/* SPDX-License-Identifier: Apache-2.0 */
/**
 * asm2d.js — Activated Sludge Model No. 2d (0.11 CH.35, session water-b-11; DOM-free). Henze, Gujer, Mino, Matsuo, Wentzel, Marais and van Loosdrecht,
 * "Activated Sludge Model No. 2d, ASM2d", Water Sci. Technol. 39(1) 165-182 (1999); IWA STR 9 (2000). Biological phosphorus removal with denitrifying PAOs,
 * fermentation, and chemical precipitation with a metal hydroxide: 18 components (TSS is not carried as a state), 21 processes.
 *
 * SOURCES (docs/refs/water-treatment-ch35-38.md § R3). The primary text was NOT read (no public copy with a clear licence). The matrix and every value are from QSDsan
 * (University of Illinois/NCSA Open Source License, read 2026-11-21), which cites Henze et al. (2000): qsdsan/data/process_data/_asm2d.tsv (the Petersen matrix,
 * known coefficients and the "?" entries), qsdsan/process_models/_asm2d.py (class ASM2d defaults and the rate function rhos_asm2d), qsdsan/data/_components.tsv
 * (S_PO4 "assumed 50% H2PO4-, 50% HPO4-2", S_A acetate, X_MeP FePO4, X_MeOH Fe(OH)3). Like QSDsan, the "?" entries are solved from continuity of COD, N, P and charge
 * (asm.js deriveRow). Differences from QSDsan, on purpose: S_ALK is kept in mol HCO3-/m3 (QSDsan uses g C and multiplies K_ALK by 12; the values here are its
 * docstring values in mol/m3), and X_PP's charge uses the atomic weight of P (QSDsan writes -1/31).
 * Molar masses: P 30.974, Fe 55.845, O 15.999 (standard atomic weights): FePO4 holds 30.974 / 150.815 g P per g.
 * A study aid, not a process design approval.
 */
import { deriveRow, continuity, plantSteady, pos } from './asm.js';

export const COMP = ['SO2', 'SN2', 'SNH4', 'SNO3', 'SPO4', 'SF', 'SA', 'SI', 'SALK', 'XI', 'XS', 'XH', 'XPAO', 'XPP', 'XPHA', 'XAUT', 'XMeOH', 'XMeP'];
export const INFO = { SO2: 'dissolved oxygen', SN2: 'dinitrogen N', SNH4: 'ammonium N', SNO3: 'nitrate and nitrite N', SPO4: 'phosphate P', SF: 'fermentable readily biodegradable COD',
  SA: 'fermentation products (acetate) COD', SI: 'soluble inert COD', SALK: 'alkalinity (mol HCO3/m3)', XI: 'particulate inert COD', XS: 'slowly biodegradable COD',
  XH: 'heterotrophic biomass', XPAO: 'phosphate-accumulating organisms', XPP: 'stored polyphosphate P', XPHA: 'stored PHA COD', XAUT: 'nitrifying biomass',
  XMeOH: 'metal hydroxide (iron)', XMeP: 'metal phosphate (iron)' };
export const PROCESSES = ['aerobic hydrolysis', 'anoxic hydrolysis', 'anaerobic hydrolysis', 'growth of XH on SF', 'growth of XH on SA', 'denitrification with SF',
  'denitrification with SA', 'fermentation', 'lysis of XH', 'storage of XPHA', 'aerobic storage of XPP', 'anoxic storage of XPP', 'aerobic growth of XPAO',
  'anoxic growth of XPAO', 'lysis of XPAO', 'lysis of XPP', 'lysis of XPHA', 'aerobic growth of XAUT', 'lysis of XAUT', 'precipitation', 'redissolution'];
/** QSDsan ASM2d defaults (class ASM2d.__new__), 20 C. Half-saturation constants for alkalinity in mol HCO3-/m3 (QSDsan's docstring units). */
export const PAR = Object.freeze({
  iN_SI: 0.01, iN_SF: 0.03, iN_XI: 0.02, iN_XS: 0.04, iN_BM: 0.07, iP_SI: 0.0, iP_SF: 0.01, iP_XI: 0.01, iP_XS: 0.01, iP_BM: 0.02,
  f_SI: 0.0, Y_H: 0.625, f_XI_H: 0.1, Y_PAO: 0.625, Y_PO4: 0.4, Y_PHA: 0.2, f_XI_PAO: 0.1, Y_A: 0.24, f_XI_AUT: 0.1,
  K_h: 3.0, eta_NO3: 0.6, eta_fe: 0.4, K_O2: 0.2, K_NO3: 0.5, K_X: 0.1,
  mu_H: 6.0, q_fe: 3.0, eta_NO3_H: 0.8, b_H: 0.4, K_O2_H: 0.2, K_F: 4.0, K_fe: 4.0, K_A_H: 4.0, K_NO3_H: 0.5, K_NH4_H: 0.05, K_P_H: 0.01, K_ALK_H: 0.1,
  q_PHA: 3.0, q_PP: 1.5, mu_PAO: 1.0, eta_NO3_PAO: 0.6, b_PAO: 0.2, b_PP: 0.2, b_PHA: 0.2, K_O2_PAO: 0.2, K_NO3_PAO: 0.5, K_A_PAO: 4.0, K_NH4_PAO: 0.05,
  K_PS: 0.2, K_P_PAO: 0.01, K_ALK_PAO: 0.1, K_PP: 0.01, K_MAX: 0.34, K_IPP: 0.02, K_PHA: 0.01,
  mu_AUT: 1.0, b_AUT: 0.15, K_O2_AUT: 0.5, K_NH4_AUT: 1.0, K_ALK_AUT: 0.5, K_P_AUT: 0.01, k_PRE: 1.0, k_RED: 0.6, K_ALK_PRE: 0.5,
  MeOH_per_P: 3.45,
});
export const P_IN_MEP = 30.974 / (55.845 + 30.974 + 4 * 15.999);
export const SOURCES = {
  model: 'Henze et al., Activated Sludge Model No. 2d, Water Sci. Technol. 39(1) 165-182 (1999); IWA STR 9 (2000). Not read: matrix and values from QSDsan, which cites it.',
  values: 'QSDsan (University of Illinois/NCSA licence) _asm2d.tsv, _asm2d.py class ASM2d defaults and rhos_asm2d, _components.tsv; read 2026-11-21. -3.45 g Fe(OH)3 per g P precipitated is the tsv value.',
  continuity: 'The "?" entries solved from continuity of COD (O2 -1, N2 -24/14, NO3 -64/14 g COD/g N), N, P (FePO4 30.974/150.815 g P/g) and charge (SA -1/64 per g COD, NH4 +1/14 and NO3 -1/14 per g N, PO4 -1.5/30.974 per g P (50 % H2PO4-, 50 % HPO4 2-), XPP -1/30.974 per g P, HCO3 -1 per mol).',
};
export const REVIEW = { state: 'not confirmed against the primary paper', note: 'ASM2d values come from QSDsan, which cites Henze et al. (1999/2000), not from the report itself. A person with the IWA report should compare the matrix and the parameter table before design use.' };

const COD_deN = 64 / 14 - 24 / 14;
export function composition(p = PAR) {
  const bm = (o, v) => { o.XH = v; o.XPAO = v; o.XAUT = v; return o; };
  return {
    COD: { SO2: -1, SN2: -24 / 14, SNO3: -64 / 14, SF: 1, SA: 1, SI: 1, XI: 1, XS: 1, XH: 1, XPAO: 1, XPHA: 1, XAUT: 1 },
    N: bm({ SN2: 1, SNH4: 1, SNO3: 1, SF: p.iN_SF, SI: p.iN_SI, XI: p.iN_XI, XS: p.iN_XS }, p.iN_BM),
    P: bm({ SPO4: 1, XPP: 1, XMeP: P_IN_MEP, SF: p.iP_SF, SI: p.iP_SI, XI: p.iP_XI, XS: p.iP_XS }, p.iP_BM),
    charge: { SA: -1 / 64, SNH4: 1 / 14, SNO3: -1 / 14, SPO4: -1.5 / 30.974, SALK: -1, XPP: -1 / 30.974 },
  };
}
const Q = ['COD', 'N', 'P', 'charge'], NPA = ['SNH4', 'SPO4', 'SALK'];
const cache = new WeakMap();
/** The 21 x 18 matrix for the parameter set p; every row closes COD, N, P and charge. */
export function stoich(p = PAR) {
  if (cache.has(p)) return cache.get(p);
  const cp = composition(p), z = () => Object.fromEntries(COMP.map((k) => [k, 0])), hyd = { SF: 1 - p.f_SI, SI: p.f_SI, XS: -1 };
  const dn = (Y) => (1 - Y) / (COD_deN * Y);
  const spec = [
    [hyd, NPA], [hyd, NPA], [hyd, NPA],
    [{ SO2: 1 - 1 / p.Y_H, SF: -1 / p.Y_H, XH: 1 }, NPA],
    [{ SO2: 1 - 1 / p.Y_H, SA: -1 / p.Y_H, XH: 1 }, NPA],
    [{ SF: -1 / p.Y_H, SN2: dn(p.Y_H), SNO3: -dn(p.Y_H), XH: 1 }, NPA],
    [{ SA: -1 / p.Y_H, SN2: dn(p.Y_H), SNO3: -dn(p.Y_H), XH: 1 }, NPA],
    [{ SF: -1, SA: 1 }, NPA],
    [{ XI: p.f_XI_H, XS: 1 - p.f_XI_H, XH: -1 }, NPA],
    [{ SA: -1, SPO4: p.Y_PO4, XPP: -p.Y_PO4, XPHA: 1 }, ['SNH4', 'SALK']],
    [{ SO2: -p.Y_PHA, SPO4: -1, XPP: 1, XPHA: -p.Y_PHA }, ['SNH4', 'SALK']],
    [{ SN2: p.Y_PHA / COD_deN, SNO3: -p.Y_PHA / COD_deN, SPO4: -1, XPP: 1, XPHA: -p.Y_PHA }, ['SNH4', 'SALK']],
    [{ XPAO: 1, XPHA: -1 / p.Y_PAO }, ['SO2', ...NPA]],
    [{ SN2: dn(p.Y_PAO), SNO3: -dn(p.Y_PAO), XPAO: 1, XPHA: -1 / p.Y_PAO }, NPA],
    [{ XI: p.f_XI_PAO, XS: 1 - p.f_XI_PAO, XPAO: -1 }, NPA],
    [{ SPO4: 1, XPP: -1 }, ['SALK']],
    [{ SA: 1, XPHA: -1 }, ['SALK']],
    [{ SNO3: 1 / p.Y_A, XAUT: 1 }, ['SO2', ...NPA]],
    [{ XI: p.f_XI_AUT, XS: 1 - p.f_XI_AUT, XAUT: -1 }, NPA],
    [{ SPO4: -1, XMeOH: -p.MeOH_per_P }, ['SALK', 'XMeP']],
    [{ SPO4: 1, XMeOH: p.MeOH_per_P }, ['SALK', 'XMeP']],
  ];
  const rows = spec.map(([known, unk]) => ({ ...z(), ...deriveRow(known, unk, cp, Q).row }));
  cache.set(p, rows);
  return rows;
}
const sat = (s, K) => s / (K + s), inh = (s, K) => K / (K + s);
/** The 21 process rates (g/m3/d), as QSDsan rhos_asm2d writes them. */
export function rates(c, p = PAR) {
  const SO2 = pos(c.SO2), SNH4 = pos(c.SNH4), SNO3 = pos(c.SNO3), SPO4 = pos(c.SPO4), SF = pos(c.SF), SA = pos(c.SA), SALK = pos(c.SALK);
  const XS = pos(c.XS), XH = pos(c.XH), XPAO = pos(c.XPAO), XPP = pos(c.XPP), XPHA = pos(c.XPHA), XAUT = pos(c.XAUT), XMeOH = pos(c.XMeOH), XMeP = pos(c.XMeP);
  const r = new Array(21).fill(0);
  if (XH > 0) {
    const h = p.K_h * (XS / XH) / (p.K_X + XS / XH) * XH;
    r[0] = h * sat(SO2, p.K_O2);
    r[1] = h * p.eta_NO3 * inh(SO2, p.K_O2) * sat(SNO3, p.K_NO3);
    r[2] = h * p.eta_fe * inh(SO2, p.K_O2) * inh(SNO3, p.K_NO3);
    const g = p.mu_H * sat(SNH4, p.K_NH4_H) * sat(SPO4, p.K_P_H) * sat(SALK, p.K_ALK_H) * XH, tot = SF + SA;
    if (tot > 0) {
      const gF = g * sat(SF, p.K_F) * (SF / tot), gA = g * sat(SA, p.K_A_H) * (SA / tot), ox = sat(SO2, p.K_O2_H), ax = p.eta_NO3_H * inh(SO2, p.K_O2_H) * sat(SNO3, p.K_NO3_H);
      r[3] = gF * ox; r[4] = gA * ox; r[5] = gF * ax; r[6] = gA * ax;
    }
    r[7] = p.q_fe * inh(SO2, p.K_O2_H) * inh(SNO3, p.K_NO3_H) * sat(SF, p.K_fe) * sat(SALK, p.K_ALK_H) * XH;
    r[8] = p.b_H * XH;
  }
  if (XPAO > 0) {
    const pp = XPP / XPAO, pha = XPHA / XPAO;
    r[9] = p.q_PHA * sat(SA, p.K_A_PAO) * sat(SALK, p.K_ALK_PAO) * (pp / (p.K_PP + pp)) * XPAO;
    // (K_MAX - XPP/XPAO) is held at 0 or above here; QSDsan writes it unguarded
    const st = p.q_PP * sat(SPO4, p.K_PS) * sat(SALK, p.K_ALK_PAO) * (pha / (p.K_PHA + pha)) * Math.max(0, p.K_MAX - pp) / (p.K_IPP + Math.max(0, p.K_MAX - pp)) * XPAO;
    const gr = p.mu_PAO * sat(SNH4, p.K_NH4_PAO) * sat(SPO4, p.K_P_PAO) * sat(SALK, p.K_ALK_PAO) * (pha / (p.K_PHA + pha)) * XPAO;
    const ox = sat(SO2, p.K_O2_PAO), ax = p.eta_NO3_PAO * inh(SO2, p.K_O2_PAO) * sat(SNO3, p.K_NO3_PAO);
    r[10] = st * ox; r[11] = st * ax; r[12] = gr * ox; r[13] = gr * ax;
    r[14] = p.b_PAO * XPAO;
  }
  r[15] = p.b_PP * XPP; r[16] = p.b_PHA * XPHA;
  const fa = sat(SALK, p.K_ALK_PAO); r[14] *= fa; r[15] *= fa; r[16] *= fa;
  if (XAUT > 0) { r[17] = p.mu_AUT * sat(SO2, p.K_O2_AUT) * sat(SNH4, p.K_NH4_AUT) * sat(SPO4, p.K_P_AUT) * sat(SALK, p.K_ALK_AUT) * XAUT; r[18] = p.b_AUT * XAUT; }
  if (XMeOH > 0) r[19] = p.k_PRE * SPO4 * XMeOH;
  if (XMeP > 0) r[20] = p.k_RED * XMeP * sat(SALK, p.K_ALK_PRE);
  return r;
}

const CODK = ['SF', 'SA', 'SI', 'XI', 'XS', 'XH', 'XPAO', 'XPHA', 'XAUT'], sum = (q) => (o, p) => Object.entries(composition(p)[q]).reduce((s, [k, v]) => s + v * (o[k] ?? 0), 0);
export const ASM2D_MODEL = Object.freeze({
  id: 'asm2d', name: 'ASM2d', COMP, INFO, PROCESSES, PAR, composition, stoich, STOICH: stoich, rates, conserved: ['COD', 'N', 'P', 'charge'],
  // water.js plantSteady's shape (water-a-11): organic COD, every N (N2 is a state), every P; no tss (no TSS factors for XPP, XPHA, XMeOH, XMeP were read), so no layered settler
  cod: Object.fromEntries(CODK.map((k) => [k, 1])), n: sum('N'), n2: () => 0, p: sum('P'), oxygenSpecies: 'SO2', biomass: ['XH', 'XPAO', 'XAUT'], nitrifiers: 'XAUT', signed: ['SALK'],
  particulate: ['XI', 'XS', 'XH', 'XPAO', 'XPP', 'XPHA', 'XAUT', 'XMeOH', 'XMeP'], solids: ['XI', 'XS', 'XH', 'XPAO', 'XPHA', 'XAUT'],
  oxygen: 'SO2', alk: 'SALK', autotrophs: 'XAUT', seed: { XH: 1000, XAUT: 60, XPAO: 200, XPP: 20, XPHA: 10 }, sources: SOURCES, review: REVIEW,
  note: 'ASM2d (Henze et al. 1999/2000) with QSDsan\'s matrix and defaults, not from the report; the sludge age counts the particulate COD states.',
});
export const check = (par) => continuity(ASM2D_MODEL, par);
export const plant = (pl) => plantSteady(ASM2D_MODEL, { ...pl, par: { ...PAR, ...(pl.par || {}) } });
