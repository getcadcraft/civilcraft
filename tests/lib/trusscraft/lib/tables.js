/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables.js — the labelled typical values TrussCraft starts from. Nothing here is a copy of a standard's or a manufacturer's table: the
 * figures are rounded, typical magnitudes (MPa, mm, kPa) to make the first check and the sizing work. Replace them with the values of the
 * standard in force; the add-on keeps your table in its storage (see cleanSpecies). Allowable-stress style: no factors are built in other
 * than the duration factor you type.
 */
export const TABLE_LABEL = 'Typical rounded values, not a standard\'s table. Replace them with the table of the standard in force and the grade stamp of the timber you buy.';

/** Sawn sizes: actual mm, b = thickness (out of the truss plane), d = depth (in the plane). */
export const SIZES = [
  { id: '2x3', b: 38, d: 64 },
  { id: '2x4', b: 38, d: 89 },
  { id: '2x6', b: 38, d: 140 },
  { id: '2x8', b: 38, d: 184 },
  { id: '2x10', b: 38, d: 235 },
  { id: '2x12', b: 38, d: 286 },
];
export const sizeById = (id) => SIZES.find((s) => s.id === id) || null;

/** Species and grade: Ft, Fc allowable stress along the grain (MPa); E, Emin modulus of elasticity and its stability value (MPa). */
export const DEFAULT_SPECIES = [
  { id: 'spf-2', label: 'Spruce-pine-fir, No. 2', Ft: 3.1, Fc: 7.9, E: 9500, Emin: 3500 },
  { id: 'spf-ss', label: 'Spruce-pine-fir, Select Structural', Ft: 4.8, Fc: 9.7, E: 10300, Emin: 3900 },
  { id: 'dfl-2', label: 'Douglas fir-larch, No. 2', Ft: 3.6, Fc: 9.0, E: 12400, Emin: 4500 },
  { id: 'dfl-ss', label: 'Douglas fir-larch, Select Structural', Ft: 6.2, Fc: 11.7, E: 13100, Emin: 4800 },
  { id: 'syp-2', label: 'Southern pine, No. 2', Ft: 3.4, Fc: 11.0, E: 11000, Emin: 4000 },
  { id: 'hf-2', label: 'Hem-fir, No. 2', Ft: 3.1, Fc: 9.0, E: 9700, Emin: 3600 },
];
export function cleanSpecies(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const s of list) {
    if (!s || typeof s !== 'object' || !/^[a-z][a-z0-9-]{0,30}$/.test(String(s.id))) continue;
    const n = (v) => (Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) < 1e6 ? Number(v) : null);
    const Ft = n(s.Ft), Fc = n(s.Fc), E = n(s.E), Emin = n(s.Emin);
    if (Ft === null || Fc === null || E === null || Emin === null) continue;
    const row = { id: String(s.id), label: String(s.label || s.id).slice(0, 60), Ft, Fc, E, Emin };
    const Fb = n(s.Fb), Fcp = n(s.Fcp);   // optional: bending and bearing allowables (MPa), only ever the person's own
    if (Fb !== null) row.Fb = Fb;
    if (Fcp !== null) row.Fcp = Fcp;
    out.push(row);
  }
  return out;
}
export const speciesById = (list, id) => list.find((s) => s.id === id) || list[0] || null;

/** Load defaults (kPa): the roof's dead load on the slope, snow (or live) on plan, ceiling dead load on plan. Labelled placeholders. */
export const DEFAULT_LOADS = { roofDead: 0.45, snow: 1.0, ceilingDead: 0.25, duration: 1.0, windward: 0, leeward: 0, uplift: 0, floorLive: 0 };
/** Combinations: each row adds the four cases times the person's factors (D dead, S snow or live, W wind, U uplift). Blank / 0 = not in that combination. */
export const DEFAULT_COMBOS = [
  { name: 'Gravity', fD: 1, fS: 1, fW: 0, fU: 0, CD: 1 },
  { name: 'Wind', fD: 0, fS: 0, fW: 0, fU: 0, CD: 1 },
  { name: 'Uplift', fD: 0, fS: 0, fW: 0, fU: 0, CD: 1 },
];
export const COMBO_LABEL = 'Load cases and combinations are YOURS: pressures in kPa and factors are what you type, from the standard in force. Blank or zero means off. The add-on carries no code table, no wind map and no snow map. A combination row with every factor zero is not run.';
export const LOAD_CASE_LABEL = 'Load cases: roof dead on the slope + ceiling dead on the bottom chord (D), snow or roof live on plan (S), wind pressures normal to the roof, windward on the left half and leeward on the right (W), net uplift on plan (U), each times the factors of your combinations; allowable stresses of the table above times each combination\'s duration factor. Roof load on the overhang tails is not included. No unbalanced snow, no drift, no concentrated loads, no water tank.';
export const BENDING_LABEL = 'Chord bending between panel points is taken as a simple span (wL²/8 by default; change the divisor if you assume continuity). It is checked only when the species table has an Fb for the species; with no Fb the stress is reported and not checked.';
export const DEFLECTION_LABEL = 'Deflection is the axial (virtual work) estimate from E in the species table, a typical value unless you loaded your own. It leaves out chord bending, joint slip and creep.';

/** Defaults that a truss is generated from. */
export const DEFAULT_TRUSS = { type: 'fink', span: 8000, pitch: 22.5, overhang: 450, heel: 150, panels: 6, bottomPitch: 0, atticWidth: 3000, atticHeight: 2400, spacing: 600, stock: 6000, braceLen: 600 };
export const TYPES = ['king', 'queen', 'howe', 'pratt', 'fink', 'scissor', 'mono', 'attic'];

/**
 * Connector plate series (a stand-in for the manufacturer's): plate w × h (mm) and an INDICATIVE capacity per face (kN) = area × q. q is a
 * labelled placeholder, not a tested value; plate capacity comes from the manufacturer's evaluated tables.
 */
export const PLATE_Q = 0.0008;   // kN per mm² of plate on the member of least contact (labelled placeholder)
export const PLATES_PLACEHOLDER = [[76, 102], [76, 152], [102, 152], [102, 203], [127, 203], [152, 203], [152, 254], [203, 254], [203, 305], [254, 305]]
  .map(([w, h]) => ({ id: w + 'x' + h, w, h, kN: Math.round(w * h * PLATE_Q * 10) / 10 }));
export const PLATES = PLATES_PLACEHOLDER;
export const PLATE_PLACEHOLDER_LABEL = 'Placeholder, not a manufacturer value';
export const PLATE_LABEL = 'Indicative only: plate sizes and capacities are placeholders (area × a stated constant), not a manufacturer\'s evaluated values.';

export const DISCLAIMER = 'Not a substitute for engineered truss design. The member check is axial force by the method of joints on a stated load case; plates, bracing, bearings, deflection and uplift need the truss designer\'s analysis and manufacturer sign-off.';
