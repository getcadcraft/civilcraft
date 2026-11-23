/* SPDX-License-Identifier: Apache-2.0 */
/**
 * asm3.js — Activated Sludge Model No. 3 (0.11 CH.35, session water-b-11; DOM-free). Gujer, Henze, Mino and van Loosdrecht, "Activated Sludge Model No. 3",
 * Water Sci. Technol. 39(1) 183-193 (1999), in its 2000 form (IWA STR 9). 13 components, 12 processes, storage of substrate (X_STO) before growth.
 *
 * SOURCES (docs/refs/water-treatment-ch35-38.md § R2). The primary paper was NOT read (no public copy with a clear licence). Every value below is from two open
 * implementations that cite it, read 2026-11-21:
 *   R2a WaterTAP, watertap/property_models/unit_specific/activated_sludge/asm3_reactions.py + asm3_properties.py (BSD-3-Clause-LBNL): the stoichiometric expressions
 *       ("Stoichiometric numbers from Table 1"), the kinetic values at 10 C and 20 C, the Arrhenius form between them, the composition values;
 *   R2b Modelica WasteWater library (G. Reichl, Modelica License 1.1), WasteWater/ASM3/Interfaces.mo `stoichiometry` + `ASM3base`: the same matrix and the same
 *       20 C values except b_A,NOX, which it writes 0.5 1/d with a temperature coefficient that puts its 10 C value at 0.2: ten times WaterTAP's 0.05 and 0.02.
 *       WaterTAP's 0.05 is used here; the difference is said in the help and as a Problem when b_A,NOX is set above 0.2.
 * The "?" coefficients (oxygen or nitrate, ammonium, alkalinity, TSS) are not typed: they are solved from continuity of COD, N, charge and TSS (asm.js deriveRow),
 * the way the task group derives them, and the test compares them with R2a's closed forms x1-x12, y1-y12, z1-z12, t1-t12.
 * Units: g/m3 (COD, N, TSS), alkalinity in mol HCO3-/m3, rates in 1/d. A study aid, not a process design approval.
 */
import { deriveRow, continuity, plantSteady, pos } from './asm.js';

export const COMP = ['SO', 'SI', 'SS', 'SNH4', 'SN2', 'SNOX', 'SALK', 'XI', 'XS', 'XH', 'XSTO', 'XA', 'XSS'];
export const INFO = { SO: 'dissolved oxygen', SI: 'soluble inert COD', SS: 'readily biodegradable COD', SNH4: 'ammonium N', SN2: 'dinitrogen N', SNOX: 'nitrate and nitrite N',
  SALK: 'alkalinity (mol HCO3/m3)', XI: 'particulate inert COD', XS: 'slowly biodegradable COD', XH: 'heterotrophic biomass', XSTO: 'storage products of heterotrophs',
  XA: 'nitrifying biomass', XSS: 'suspended solids (TSS)' };
export const PROCESSES = ['hydrolysis', 'aerobic storage of SS', 'anoxic storage of SS', 'aerobic growth of XH', 'anoxic growth of XH', 'aerobic endogenous respiration of XH',
  'anoxic endogenous respiration of XH', 'aerobic respiration of XSTO', 'anoxic respiration of XSTO', 'aerobic growth of XA', 'aerobic endogenous respiration of XA',
  'anoxic endogenous respiration of XA'];
/** 20 C values (R2a asm3_properties.py / asm3_reactions.py "ref_temp_2"; R2b the same except bANOX). T is the liquid temperature, C. */
export const PAR = Object.freeze({
  fSI: 0, fXI: 0.2, YSTO_O: 0.85, YSTO_NOX: 0.80, YH_O: 0.63, YH_NOX: 0.54, YA: 0.24,
  iNSI: 0.01, iNSS: 0.03, iNXI: 0.02, iNXS: 0.04, iNBM: 0.07, iSSXI: 0.75, iSSXS: 0.75, iSSBM: 0.90, iSSSTO: 0.60,
  kH: 3, KX: 1, kSTO: 5, etaNOX: 0.6, KO: 0.2, KNOX: 0.5, KS: 2, KSTO: 1, muH: 2, KNH4: 0.01, KALK: 0.1,
  bHO: 0.2, bHNOX: 0.1, bSTOO: 0.2, bSTONOX: 0.1, muA: 1, KANH4: 1, KAO: 0.5, KAALK: 0.5, bAO: 0.15, bANOX: 0.05, T: 20,
});
/** 10 C values of the temperature-dependent rates (R2a "ref_temp_1"). */
export const PAR10 = Object.freeze({ kH: 2, kSTO: 2.5, muH: 1, bHO: 0.1, bHNOX: 0.05, bSTOO: 0.1, bSTONOX: 0.05, muA: 0.35, bAO: 0.05, bANOX: 0.02 });
export const SOURCES = {
  model: 'Gujer, Henze, Mino and van Loosdrecht, Activated Sludge Model No. 3, Water Sci. Technol. 39(1) 183-193 (1999); IWA STR 9 (2000). Not read: values from open implementations that cite it.',
  values: 'WaterTAP asm3_reactions.py and asm3_properties.py (BSD-3-Clause-LBNL, read 2026-11-21); checked against the Modelica WasteWater library ASM3 Interfaces.mo (G. Reichl, Modelica License 1.1), which agrees except b_A,NOX (0.5 there, 0.05 in WaterTAP; 0.05 used).',
  temperature: 'k(T) = k20 exp(theta (T - 20)), theta = ln(k10 / k20) / (10 - 20), the form WaterTAP uses with its 10 C and 20 C columns.',
  continuity: 'Oxygen or nitrate, ammonium, alkalinity and TSS coefficients solved from continuity of COD (O2 -1, N2 -24/14, NOx -64/14 g COD/g N), N, charge (NH4 +1/14, NOx -1/14 per g N, HCO3 -1 per mol) and TSS.',
};
export const REVIEW = { state: 'not confirmed against the primary paper', note: 'ASM3 values come from two open implementations that cite Gujer et al. (1999/2000), not from the paper itself; they disagree on b_A,NOX. A person with the IWA report should compare Table 1 and the parameter table before design use.' };

const T_DEP = Object.keys(PAR10);
/** Parameters at temperature par.T (C): the temperature-dependent ones moved by the Arrhenius form between 10 and 20 C. */
export function atTemperature(par = PAR) {
  const T = par.T ?? 20, out = { ...par };
  if (T === 20) return out;
  for (const k of T_DEP) { const k20 = par[k], k10 = PAR10[k] * (par[k] / PAR[k]); out[k] = k20 * Math.exp(Math.log(k10 / k20) / (10 - 20) * (T - 20)); }
  return out;
}

export function composition(p = PAR) {
  return {
    COD: { SO: -1, SI: 1, SS: 1, SN2: -24 / 14, SNOX: -64 / 14, XI: 1, XS: 1, XH: 1, XSTO: 1, XA: 1 },
    N: { SI: p.iNSI, SS: p.iNSS, SNH4: 1, SN2: 1, SNOX: 1, XI: p.iNXI, XS: p.iNXS, XH: p.iNBM, XA: p.iNBM },
    charge: { SNH4: 1 / 14, SNOX: -1 / 14, SALK: -1 },
    TSS: { XI: p.iSSXI, XS: p.iSSXS, XH: p.iSSBM, XA: p.iSSBM, XSTO: p.iSSSTO, XSS: -1 },
  };
}
const NOX = { SNOX: 1, SN2: -1 }, Q = ['COD', 'N', 'charge', 'TSS'];
const cache = new WeakMap();
/** The 12 x 13 matrix (rows = PROCESSES, objects by component) for the parameter set p; every row closes COD, N, charge and TSS. */
export function stoich(p = PAR) {
  if (cache.has(p)) return cache.get(p);
  const cp = composition(p), z = () => Object.fromEntries(COMP.map((k) => [k, 0]));
  const spec = [
    [{ SI: p.fSI, SS: 1 - p.fSI, XS: -1 }, ['SNH4', 'SALK', 'XSS']],
    [{ SS: -1, XSTO: p.YSTO_O }, ['SO', 'SNH4', 'SALK', 'XSS']],
    [{ SS: -1, XSTO: p.YSTO_NOX }, [NOX, 'SNH4', 'SALK', 'XSS']],
    [{ XH: 1, XSTO: -1 / p.YH_O }, ['SO', 'SNH4', 'SALK', 'XSS']],
    [{ XH: 1, XSTO: -1 / p.YH_NOX }, [NOX, 'SNH4', 'SALK', 'XSS']],
    [{ XI: p.fXI, XH: -1 }, ['SO', 'SNH4', 'SALK', 'XSS']],
    [{ XI: p.fXI, XH: -1 }, [NOX, 'SNH4', 'SALK', 'XSS']],
    [{ XSTO: -1 }, ['SO', 'XSS']],
    [{ XSTO: -1 }, [NOX, 'SALK', 'XSS']],
    [{ XA: 1, SNOX: 1 / p.YA }, ['SO', 'SNH4', 'SALK', 'XSS']],
    [{ XI: p.fXI, XA: -1 }, ['SO', 'SNH4', 'SALK', 'XSS']],
    [{ XI: p.fXI, XA: -1 }, [NOX, 'SNH4', 'SALK', 'XSS']],
  ];
  const rows = spec.map(([known, unk]) => ({ ...z(), ...deriveRow(known, unk, cp, Q).row }));
  cache.set(p, rows);
  return rows;
}
const sat = (s, K) => s / (K + s), inh = (s, K) => K / (K + s);
/** The 12 process rates (g/m3/d) at concentrations c (object by COMP), parameters p (already at temperature: see model.rates). */
export function ratesAt(c, p) {
  const SO = pos(c.SO), SS = pos(c.SS), SNH = pos(c.SNH4), SNOX = pos(c.SNOX), SALK = pos(c.SALK), XS = pos(c.XS), XH = pos(c.XH), XSTO = pos(c.XSTO), XA = pos(c.XA);
  const fO = sat(SO, p.KO), fAn = inh(SO, p.KO), fNO = sat(SNOX, p.KNOX), fNH = sat(SNH, p.KNH4), fAlk = sat(SALK, p.KALK);
  const xs = XH > 1e-12 ? XS / XH : 0, sto = XH > 1e-12 ? XSTO / XH : 0;
  return [
    p.kH * (xs / (p.KX + xs)) * XH,
    p.kSTO * fO * sat(SS, p.KS) * XH,
    p.kSTO * p.etaNOX * fAn * fNO * sat(SS, p.KS) * XH,
    p.muH * fO * fNH * fAlk * (sto / (p.KSTO + sto)) * XH,
    p.muH * p.etaNOX * fAn * fNO * fNH * fAlk * (sto / (p.KSTO + sto)) * XH,
    p.bHO * fO * XH,
    p.bHNOX * fAn * fNO * XH,
    p.bSTOO * fO * XSTO,
    p.bSTONOX * fAn * fNO * XSTO,
    p.muA * sat(SO, p.KAO) * sat(SNH, p.KANH4) * sat(SALK, p.KAALK) * XA,
    p.bAO * sat(SO, p.KAO) * XA,
    p.bANOX * inh(SO, p.KAO) * sat(SNOX, p.KNOX) * XA,
  ];
}
const tcache = new WeakMap();
const atT = (p) => { if (!tcache.has(p)) tcache.set(p, atTemperature(p)); return tcache.get(p); };
export const rates = (c, p = PAR) => ratesAt(c, atT(p));

/** water.js plantSteady's temperature hook: the plant's T goes into par.T; rates() applies the 10/20 C Arrhenius law. Problems outside 10-20 C (the two columns read). */
export function temperature(par, T) {
  const p = { ...par, T }, at = atTemperature(p), factors = Object.fromEntries(T_DEP.map((k) => [k, at[k] / par[k]])), problems = [];
  if (!(T >= 10 && T <= 20)) problems.push({ code: 'asm3.temperature', severity: 'warning', text: `ASM3 values were read at 10 C and 20 C only; ${T} C is outside them, so the rates are extrapolated.`, about: [{ kind: 'plant', id: 'plant' }] });
  return { par: p, factors, problems, law: SOURCES.temperature };
}
const CODK = ['SI', 'SS', 'XI', 'XS', 'XH', 'XSTO', 'XA'];
export const ASM3_MODEL = Object.freeze({
  id: 'asm3', name: 'ASM3', COMP, INFO, PROCESSES, PAR, composition, stoich, STOICH: stoich, rates, conserved: ['COD', 'N', 'charge', 'TSS'],
  // water.js plantSteady's shape (water-a-11): organic COD, every N (N2 is a state here, so nothing is "lost": n2 = 0), TSS is the XSS state
  cod: Object.fromEntries(CODK.map((k) => [k, 1])), n: (o, p) => Object.entries(composition(p).N).reduce((s, [k, v]) => s + v * (o[k] ?? 0), 0), n2: () => 0,
  oxygenSpecies: 'SO', tss: (o) => o.XSS ?? 0, biomass: ['XH', 'XA'], nitrifiers: 'XA', signed: ['SALK'], temperature,
  particulate: ['XI', 'XS', 'XH', 'XSTO', 'XA', 'XSS'], solids: ['XI', 'XS', 'XH', 'XSTO', 'XA'], oxygen: 'SO', alk: 'SALK', autotrophs: 'XA',
  seed: { XH: 1000, XA: 60, XSTO: 50, XSS: 1000 }, sources: SOURCES, review: REVIEW,
  note: 'ASM3 (Gujer et al. 1999/2000) with values from WaterTAP and the Modelica WasteWater library, not from the paper; the clarifier captures the fraction of particulates you gave.',
});
export const check = (par) => continuity(ASM3_MODEL, par);
/** The plant at steady state (asm.js plantSteady: water.js's solver once it is exported). Influent XSS: give it, or it is computed from the particulate COD. */
export function plant(pl) {
  const par = { ...PAR, ...(pl.par || {}) }, inf = { ...pl.influent };
  if (inf.XSS == null) inf.XSS = (inf.XI || 0) * par.iSSXI + (inf.XS || 0) * par.iSSXS + ((inf.XH || 0) + (inf.XA || 0)) * par.iSSBM + (inf.XSTO || 0) * par.iSSSTO;
  return plantSteady(ASM3_MODEL, { ...pl, influent: inf, par });
}
