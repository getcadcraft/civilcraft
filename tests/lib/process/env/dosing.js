/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dosing.js — chemical doses for water treatment from stoichiometry (0.11 CH.38, session water-b-11; DOM-free).
 *
 *   phosphorus(input)   iron or aluminium salt for phosphorus removal: metal per mol of soluble P (the molar ratio is the person's), product mass and volume a day
 *   alkalinity(input)   alkalinity used by nitrification less what denitrification gives back, and the lime or caustic that restores it
 *   chlorine(input)     chlorine dose = demand + residual, as chlorine and as the product (hypochlorite solution or gas) a day
 *   MOLAR               molar masses from the standard atomic weights (H 1.008, C 12.011, N 14.007, O 15.999, Na 22.990, Al 26.982, P 30.974, S 32.06, Cl 35.45,
 *                       Ca 40.078, Fe 55.845)
 * SOURCES (docs/refs/water-treatment-ch35-38.md § R4): US EPA (2010), Nutrient Control Design Manual, EPA/600/R-10/100:
 *   p. 3-1 Table 3-1  typical strength of commercial solutions: alum Al2(SO4)3.14H2O 48 %, ferric chloride 37-47 % (WEF and ASCE 2006);
 *   p. 3-2            the dose as mol metal per mol soluble P in the influent; 1.0 is the stoichiometric dose (Eq. 3-1 alum, Eq. 3-2 ferric chloride);
 *   p. 3-3            ferric 1.5-2.0 mol/mol for 80-98 % removal of soluble P (Smith et al. 2007); about 6-7 for effluent TP below 0.10 mg/L; similar for alum;
 *   p. 4-5            7.14 g alkalinity as CaCO3 used per g NH4-N oxidized to nitrate (Eq. 4-3; Tchobanoglous et al. 2003);
 *   p. 4-20           3.57 g alkalinity as CaCO3 produced per g NO3-N reduced (1 mol OH- per mol NO3-).
 * Solution densities and hypochlorite strengths were not read in any source: they are the person's (their supplier's sheet), never defaulted silently.
 * A study aid, not a process design approval.
 */
import { problem as baseProblem } from '../report.js';

const SRC = { kind: 'engine', name: 'process.env' };
const problem = (code, severity, text, id = 'dosing') => { const p = baseProblem('dosing.' + code, severity, text, [{ kind: 'unit', id }]); p.source = SRC; return p; };
const A = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, Na: 22.990, Al: 26.982, P: 30.974, S: 32.06, Cl: 35.45, Ca: 40.078, Fe: 55.845 };
export const ATOMIC = Object.freeze(A);
export const MOLAR = Object.freeze({
  P: A.P, Fe: A.Fe, Al: A.Al, FeCl3: A.Fe + 3 * A.Cl, alum14: 2 * A.Al + 3 * (A.S + 4 * A.O) + 14 * (2 * A.H + A.O), CaCO3: A.Ca + A.C + 3 * A.O,
  CaOH2: A.Ca + 2 * (A.O + A.H), NaOH: A.Na + A.O + A.H, Cl2: 2 * A.Cl,
});
export const EPA = Object.freeze({ stoich: 1.0, ratio80to98: [1.5, 2.0], ratioBelow01: [6, 7], strength: { fe: [0.37, 0.47], al: [0.48, 0.48] }, nitrification: 7.14, denitrification: 3.57,
  source: 'US EPA (2010) Nutrient Control Design Manual, EPA/600/R-10/100, p. 3-1 to 3-3, 4-5, 4-20' });
const num = (v) => typeof v === 'number' && Number.isFinite(v);
const need = (i, keys, id) => keys.filter((k) => !num(i[k])).map((k) => problem('input', 'error', `${id} needs ${k} (a number).`, id));
const product = (kgPerDay, strength, density) => {
  const sol = strength > 0 ? kgPerDay / strength : null, vol = sol != null && density > 0 ? sol / density : null;
  return { solutionKgPerDay: sol, litresPerDay: vol };
};

/**
 * input { Q (m3/d), Pin (mg/L soluble P at the dosing point), ratio (mol metal per mol Pin; EPA p. 3-2), metal: 'fe' | 'al', Ptarget? (mg/L wanted after),
 *         strength (w/w fraction of FeCl3 or alum in the solution), density (kg/L of the solution) }
 * → { metalKgPerDay, saltKgPerDay, solutionKgPerDay, litresPerDay, molPerDay, lines, problems }
 */
export function phosphorus(input) {
  const i = input || {}, ps = need(i, ['Q', 'Pin', 'ratio'], 'Phosphorus dose'), metal = i.metal === 'al' ? 'al' : i.metal === 'fe' ? 'fe' : null;
  if (!metal) ps.push(problem('metal', 'error', 'Choose the metal: "fe" (ferric chloride) or "al" (alum, Al2(SO4)3.14H2O).', 'P'));
  if (ps.length) return { lines: [], problems: ps };
  if (!(i.Q > 0)) ps.push(problem('q', 'error', 'The flow must be above 0 m3/d.', 'P'));
  if (!(i.Pin > 0)) ps.push(problem('pin', 'error', 'The soluble phosphorus must be above 0 mg/L.', 'P'));
  if (!(i.ratio > 0)) ps.push(problem('ratio', 'error', 'The molar ratio must be above 0.', 'P'));
  if (ps.length) return { lines: [], problems: ps };
  if (i.ratio < EPA.stoich) ps.push(problem('ratio.low', 'warning', `A ratio of ${i.ratio} is below the stoichiometric 1.0 mol metal per mol P (EPA 2010 p. 3-2): not all the phosphate can precipitate.`, 'P'));
  if (num(i.Ptarget)) {
    if (!(i.Ptarget >= 0 && i.Ptarget < i.Pin)) ps.push(problem('ptarget', 'error', 'The target phosphorus must be at or above 0 and below the influent value.', 'P'));
    else if (i.Ptarget < 0.1 && i.ratio < EPA.ratioBelow01[0]) ps.push(problem('ratio.target', 'warning', `For effluent phosphorus below 0.10 mg/L ratios of about 6-7 are reported (EPA 2010 p. 3-3); ${i.ratio} is likely too low.`, 'P'));
    else if (1 - i.Ptarget / i.Pin >= 0.8 && i.ratio < EPA.ratio80to98[0]) ps.push(problem('ratio.removal', 'info', `For 80-98 % removal of soluble P ferric doses of 1.5-2.0 are reported (EPA 2010 p. 3-3); ${i.ratio} is below that.`, 'P'));
  }
  const molP = i.Q * i.Pin / MOLAR.P, molMe = molP * i.ratio;                 // mol/d (g/m3 x m3/d = g/d)
  const metalKg = molMe * (metal === 'fe' ? MOLAR.Fe : MOLAR.Al) / 1000, saltKg = (metal === 'fe' ? molMe * MOLAR.FeCl3 : molMe / 2 * MOLAR.alum14) / 1000;
  const typ = EPA.strength[metal];
  if (!num(i.strength) || !(i.strength > 0 && i.strength <= 1)) ps.push(problem('strength', 'warning', `Give the solution strength (w/w fraction) from your supplier; typical: ${metal === 'fe' ? 'ferric chloride 37-47 %' : 'alum 48 %'} (EPA 2010 Table 3-1). Without it only the dry mass is given.`, 'P'));
  else if (i.strength < typ[0] - 0.05 || i.strength > typ[1] + 0.05) ps.push(problem('strength.range', 'info', `Strength ${(i.strength * 100).toFixed(0)} % is far from the typical ${metal === 'fe' ? '37-47 %' : '48 %'} (EPA 2010 Table 3-1).`, 'P'));
  if (num(i.strength) && !num(i.density)) ps.push(problem('density', 'warning', 'Give the solution density (kg/L) from your supplier to get the volume a day; no density was read in a source, so none is assumed.', 'P'));
  const pr = product(saltKg, num(i.strength) ? i.strength : 0, num(i.density) ? i.density : 0);
  const name = metal === 'fe' ? 'FeCl3' : 'Al2(SO4)3.14H2O';
  const lines = [
    { k: 'phosphorus to treat', v: +(i.Q * i.Pin / 1000).toPrecision(6), u: 'kg P/d' }, { k: 'metal dose', v: +metalKg.toPrecision(6), u: 'kg ' + (metal === 'fe' ? 'Fe' : 'Al') + '/d' },
    { k: 'metal dose (concentration)', v: +(metalKg * 1000 / i.Q).toPrecision(5), u: 'mg/L' }, { k: name + ' (dry)', v: +saltKg.toPrecision(6), u: 'kg/d' },
  ];
  if (pr.solutionKgPerDay != null) lines.push({ k: 'solution', v: +pr.solutionKgPerDay.toPrecision(6), u: 'kg/d' });
  if (pr.litresPerDay != null) lines.push({ k: 'solution volume', v: +pr.litresPerDay.toPrecision(6), u: 'L/d' });
  return { molPerDay: molMe, metalKgPerDay: metalKg, saltKgPerDay: saltKg, ...pr, lines, problems: ps };
}

/**
 * input { Q (m3/d), nitrified (mg N/L oxidized to nitrate), denitrified? (mg N/L reduced), alkIn (mg/L as CaCO3 in the feed), residual (mg/L as CaCO3 to keep),
 *         chemical: 'lime' (Ca(OH)2) | 'caustic' (NaOH), purity? (fraction of the product that is the chemical, default 1), strength?, density? (for a solution) }
 * → { usedMgL, returnedMgL, deficitMgL, alkalinityKgPerDay, chemicalKgPerDay, productKgPerDay, litresPerDay, lines, problems }
 */
export function alkalinity(input) {
  const i = input || {}, ps = need(i, ['Q', 'nitrified', 'alkIn', 'residual'], 'Alkalinity'), chem = i.chemical === 'caustic' ? 'caustic' : i.chemical === 'lime' ? 'lime' : null;
  if (!chem) ps.push(problem('chemical', 'error', 'Choose the chemical: "lime" (Ca(OH)2) or "caustic" (NaOH).', 'ALK'));
  if (ps.length) return { lines: [], problems: ps };
  if (!(i.Q > 0)) ps.push(problem('q', 'error', 'The flow must be above 0 m3/d.', 'ALK'));
  for (const k of ['nitrified', 'alkIn', 'residual']) if (i[k] < 0) ps.push(problem(k, 'error', `${k} cannot be negative.`, 'ALK'));
  const den = i.denitrified ?? 0;
  if (den < 0) ps.push(problem('denitrified', 'error', 'denitrified cannot be negative.', 'ALK'));
  if (den > i.nitrified) ps.push(problem('denitrified.high', 'warning', 'More nitrate is denitrified than nitrified: check the nitrogen figures (nitrate in the feed?).', 'ALK'));
  const purity = i.purity ?? 1;
  if (!(purity > 0 && purity <= 1)) ps.push(problem('purity', 'error', 'Purity is a fraction above 0 and at most 1.', 'ALK'));
  if (ps.some((p) => p.severity === 'error')) return { lines: [], problems: ps };
  const used = EPA.nitrification * i.nitrified, back = EPA.denitrification * den, deficit = Math.max(0, used - back - (i.alkIn - i.residual));
  // equivalents: CaCO3 and Ca(OH)2 give 2 per mol, NaOH 1
  const perCaCO3 = chem === 'lime' ? MOLAR.CaOH2 / MOLAR.CaCO3 : 2 * MOLAR.NaOH / MOLAR.CaCO3, alkKg = deficit * i.Q / 1000, chemKg = alkKg * perCaCO3, prodKg = chemKg / purity;
  if (i.alkIn - used + back < 0) ps.push(problem('alk.negative', 'warning', `Without dosing the alkalinity would run out (${(i.alkIn - used + back).toFixed(0)} mg/L as CaCO3): nitrification stops and the pH falls.`, 'ALK'));
  const pr = product(prodKg, num(i.strength) ? i.strength : 0, num(i.density) ? i.density : 0);
  if (num(i.strength) && !num(i.density)) ps.push(problem('density', 'warning', 'Give the solution density (kg/L) for the volume a day; none is assumed.', 'ALK'));
  const lines = [
    { k: 'alkalinity used by nitrification', v: +used.toPrecision(5), u: 'mg/L as CaCO3' }, { k: 'given back by denitrification', v: +back.toPrecision(5), u: 'mg/L as CaCO3' },
    { k: 'to add', v: +deficit.toPrecision(5), u: 'mg/L as CaCO3' }, { k: 'alkalinity to add', v: +alkKg.toPrecision(6), u: 'kg CaCO3/d' },
    { k: (chem === 'lime' ? 'Ca(OH)2' : 'NaOH') + ' (pure)', v: +chemKg.toPrecision(6), u: 'kg/d' }, { k: 'product', v: +prodKg.toPrecision(6), u: 'kg/d' },
  ];
  if (pr.solutionKgPerDay != null) lines.push({ k: 'solution', v: +pr.solutionKgPerDay.toPrecision(6), u: 'kg/d' });
  if (pr.litresPerDay != null) lines.push({ k: 'solution volume', v: +pr.litresPerDay.toPrecision(6), u: 'L/d' });
  return { usedMgL: used, returnedMgL: back, deficitMgL: deficit, alkalinityKgPerDay: alkKg, chemicalKgPerDay: chemKg, productKgPerDay: prodKg, ...pr, lines, problems: ps };
}

/**
 * input { Q (m3/d), demand (mg/L), residual (mg/L wanted after the contact time), product: 'hypochlorite' | 'gas', strength? (w/w fraction as available chlorine,
 *         for hypochlorite), density? (kg/L) } → { doseMgL, chlorineKgPerDay, solutionKgPerDay, litresPerDay, lines, problems }
 */
export function chlorine(input) {
  const i = input || {}, ps = need(i, ['Q', 'demand', 'residual'], 'Chlorine dose'), prod = i.product === 'gas' ? 'gas' : 'hypochlorite';
  if (ps.length) return { lines: [], problems: ps };
  if (!(i.Q > 0)) ps.push(problem('q', 'error', 'The flow must be above 0 m3/d.', 'CL'));
  if (i.demand < 0 || i.residual < 0) ps.push(problem('negative', 'error', 'Demand and residual cannot be negative.', 'CL'));
  if (ps.length) return { lines: [], problems: ps };
  if (i.residual === 0) ps.push(problem('residual.zero', 'info', 'A residual of 0 mg/L leaves no chlorine after the contact time: check your permit.', 'CL'));
  const dose = i.demand + i.residual, kg = dose * i.Q / 1000;
  const lines = [{ k: 'chlorine dose', v: +dose.toPrecision(5), u: 'mg/L' }, { k: 'chlorine', v: +kg.toPrecision(6), u: 'kg Cl2/d' }];
  let pr = { solutionKgPerDay: null, litresPerDay: null };
  if (prod === 'hypochlorite') {
    if (!num(i.strength) || !(i.strength > 0 && i.strength <= 1)) ps.push(problem('strength', 'warning', 'Give the hypochlorite strength as available chlorine (w/w fraction) from your supplier; none is assumed (no source for a typical value was read).', 'CL'));
    else { pr = product(kg, i.strength, num(i.density) ? i.density : 0); lines.push({ k: 'hypochlorite solution', v: +pr.solutionKgPerDay.toPrecision(6), u: 'kg/d' }); }
    if (num(i.strength) && !num(i.density)) ps.push(problem('density', 'warning', 'Give the solution density (kg/L) for the volume a day; none is assumed.', 'CL'));
    if (pr.litresPerDay != null) lines.push({ k: 'hypochlorite volume', v: +pr.litresPerDay.toPrecision(6), u: 'L/d' });
  }
  return { doseMgL: dose, chlorineKgPerDay: kg, ...pr, lines, problems: ps };
}
