/* SPDX-License-Identifier: Apache-2.0 */
/**
 * data.js — components with cited public data (0.8 Track CH, CH.1; DOM-free, no imports; canonical copy: lib/process/).
 *
 * Every value is a number printed in a public textbook table or a US-government table, with its source key on the component
 * (`src`). Keys: SVN7 = J.M. Smith, H.C. Van Ness, M.M. Abbott, "Introduction to Chemical Engineering Thermodynamics", 7th ed.
 * (McGraw-Hill 2005): B.1 critical constants/acentric factor/normal boiling point/heat of vaporisation at Tb, B.2 Antoine constants,
 * C.1 ideal-gas heat-capacity constants, C.4 standard heats and Gibbs energies of formation at 298.15 K.
 *
 * HONESTY: the book was not open when these were typed (session process_PART_3, 2026-10-28). They are checked by tests that catch typing
 * errors (Antoine at the normal boiling point = 101.325 kPa, the cubic EOS vapour pressure at Tb, Cp at 298 K against NIST values) but
 * the table is "to be checked by an engineer against the book" (D-CH4, O7) before any design use. A person can add or replace a component.
 *
 * Units here are the book's: Tc K, Pc bar, T for Antoine in degrees C, ln P (kPa) = A - B/(T + C), Cp/R = A + B T + C T^2 + D/T^2
 * (T in K), formation values J/mol (ideal gas, 298.15 K). `normalise()` turns a component into the SI form the engine uses.
 */
export const R = 8.314462618;           // J/(mol K), CODATA 2018
export const T0 = 298.15;               // K, the thermochemical reference temperature
export const P0 = 1e5;                  // Pa, the entropy reference pressure (1 bar)
export const P_ATM = 101325;

const E = (o) => o;
// id: [name, formula, MW, Tc, Pc(bar), omega, Tb, dHvapTb, antoine [A,B,C]|null, cp [A,B,C,D], hf, gf|null]
const ROWS = {
  methane:   ['Methane', 'CH4', 16.043, 190.6, 45.99, 0.012, 111.4, 8206, null, [1.702, 9.081e-3, -2.164e-6, 0], -74520, -50460],
  ethane:    ['Ethane', 'C2H6', 30.070, 305.3, 48.72, 0.100, 184.6, 14700, null, [1.131, 19.225e-3, -5.561e-6, 0], -83820, -31855],
  propane:   ['Propane', 'C3H8', 44.097, 369.8, 42.48, 0.152, 231.1, 18770, null, [1.213, 28.785e-3, -8.824e-6, 0], -104680, -24290],
  nbutane:   ['n-Butane', 'C4H10', 58.123, 425.1, 37.96, 0.200, 272.7, 22440, [13.6608, 2154.70, 238.789], [1.935, 36.915e-3, -11.402e-6, 0], -125790, -16570],
  npentane:  ['n-Pentane', 'C5H12', 72.150, 469.7, 33.70, 0.252, 309.2, 25790, [13.7667, 2451.88, 232.014], [2.464, 45.351e-3, -14.111e-6, 0], -146760, null],
  nhexane:   ['n-Hexane', 'C6H14', 86.177, 507.6, 30.25, 0.301, 341.9, 28850, [13.8193, 2696.04, 224.317], [3.025, 53.722e-3, -16.791e-6, 0], -167190, null],
  ethylene:  ['Ethylene', 'C2H4', 28.054, 282.3, 50.40, 0.087, 169.4, 13530, null, [1.424, 14.394e-3, -4.392e-6, 0], 52510, 68460],
  propylene: ['Propylene', 'C3H6', 42.081, 365.6, 46.65, 0.140, 225.5, 18420, null, [1.637, 22.706e-3, -6.915e-6, 0], 19710, 62205],
  benzene:   ['Benzene', 'C6H6', 78.114, 562.2, 48.98, 0.210, 353.2, 30720, [13.7819, 2726.81, 217.572], [-0.206, 39.064e-3, -13.301e-6, 0], 82930, null],
  toluene:   ['Toluene', 'C7H8', 92.141, 591.8, 41.06, 0.262, 383.8, 33180, [13.9320, 3056.96, 217.625], [0.290, 47.052e-3, -15.716e-6, 0], 50170, null],
  water:     ['Water', 'H2O', 18.015, 647.1, 220.55, 0.345, 373.15, 40656, [16.3872, 3885.70, 230.170], [3.470, 1.450e-3, 0, 0.121e5], -241818, -228572],
  methanol:  ['Methanol', 'CH4O', 32.042, 512.6, 80.97, 0.564, 337.9, 35210, [16.5785, 3638.27, 239.500], [2.211, 12.216e-3, -3.450e-6, 0], -200660, -162000],
  ethanol:   ['Ethanol', 'C2H6O', 46.069, 513.9, 61.48, 0.645, 351.4, 38560, [16.8958, 3795.17, 230.918], [3.518, 20.001e-3, -6.002e-6, 0], -235100, -168490],
  acetone:   ['Acetone', 'C3H6O', 58.080, 508.2, 47.01, 0.307, 329.4, 29100, [14.3145, 2756.22, 228.060], [6.301, 26.786e-3, -8.882e-6, 0], -217150, null],
  ammonia:   ['Ammonia', 'NH3', 17.031, 405.7, 112.80, 0.253, 239.7, 23350, null, [3.578, 3.020e-3, 0, -0.186e5], -46110, -16450],
  nitrogen:  ['Nitrogen', 'N2', 28.014, 126.2, 34.00, 0.038, 77.3, 5577, null, [3.280, 0.593e-3, 0, 0.040e5], 0, 0],
  oxygen:    ['Oxygen', 'O2', 31.999, 154.6, 50.43, 0.022, 90.2, 6820, null, [3.639, 0.506e-3, 0, -0.227e5], 0, 0],
  hydrogen:  ['Hydrogen', 'H2', 2.016, 33.19, 13.13, -0.216, 20.4, 904, null, [3.249, 0.422e-3, 0, 0.083e5], 0, 0],
  co:        ['Carbon monoxide', 'CO', 28.010, 132.9, 34.99, 0.048, 81.7, 6042, null, [3.376, 0.557e-3, 0, -0.031e5], -110525, -137169],
  co2:       ['Carbon dioxide', 'CO2', 44.010, 304.2, 73.83, 0.224, 194.7, null, null, [5.457, 1.045e-3, 0, -1.157e5], -393509, -394359],
  h2s:       ['Hydrogen sulfide', 'H2S', 34.082, 373.5, 89.63, 0.094, 212.8, 18670, null, [3.931, 1.490e-3, 0, -0.232e5], -20630, -33560],
};
const SRC = { crit: 'SVN7 Table B.1', antoine: 'SVN7 Table B.2', cp: 'SVN7 Table C.1', form: 'SVN7 Table C.4' };

export const COMPONENTS = {};
for (const [id, r] of Object.entries(ROWS)) {
  COMPONENTS[id] = E({ id, name: r[0], formula: r[1], MW: r[2], Tc: r[3], Pc: r[4], omega: r[5], Tb: r[6], dHvapTb: r[7],
    antoine: r[8] ? { A: r[8][0], B: r[8][1], C: r[8][2] } : null, cp: { A: r[9][0], B: r[9][1], C: r[9][2], D: r[9][3] },
    hf: r[10], gf: r[11], src: SRC });
}
// Liquid water at 298.15 K, the one liquid formation value the combustion examples need (SVN7 Table C.4).
COMPONENTS.water.hfLiquid = -285830;

/** A component in SI units: Pc Pa, MW kg/mol, Antoine as ln P(Pa) = A' - B/(T[K] + C'). Anything missing stays null. */
export function normalise(c) {
  const o = { ...c, Pc: c.Pc * 1e5, MWkg: c.MW / 1000 };
  if (c.antoine) o.antoineSI = { A: c.antoine.A + Math.log(1000), B: c.antoine.B, C: c.antoine.C - 273.15 };
  o.cp = { A: 0, B: 0, C: 0, D: 0, ...c.cp };
  return o;
}
/** Atoms of a formula like "C2H6O" → { C: 2, H: 6, O: 1 }. */
export function atoms(formula) {
  const out = {}; const re = /([A-Z][a-z]?)(\d*)/g; let m;
  while ((m = re.exec(formula))) if (m[1]) out[m[1]] = (out[m[1]] || 0) + (m[2] ? +m[2] : 1);
  return out;
}
/** Adds or replaces a component (a person's own, D-CH2). Requires id, MW, Tc, Pc (bar), omega, cp, hf; anything else is optional. */
export function defineComponent(spec) {
  for (const k of ['id', 'MW', 'Tc', 'Pc', 'omega', 'cp']) if (spec[k] == null) throw new Error('component needs ' + k);
  COMPONENTS[spec.id] = { name: spec.id, formula: '', Tb: null, dHvapTb: null, antoine: null, hf: 0, gf: null, src: 'user', ...spec };
  return COMPONENTS[spec.id];
}
