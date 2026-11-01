/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * insul.js — single-number ratings of sound insulation and the mass law (0.8 XE.3 phase S3 first part, session dec-ind_PART_3; owner 2026-10-29:
 * Europe first, ISO standards). DOM-free; lib/acoustics is canonical (tools/acoustics/sync.mjs). The rating arithmetic of ISO 717-1 / -2 is
 * the published shifting-curve method; the reference curves and spectrum adaptation terms are typed from it (listed below, to be confirmed
 * by a holder of the standard before a public claim: docs/0.8-sessions/dec-ind_PART_3.md).
 *
 *   THIRD_OCTAVES              the 16 bands 100 … 3150 Hz
 *   airborneRating(R)          R = 16 third-octave sound reduction indices (dB) → { Rw, C, Ctr, shift, sumUnfavourable }
 *   impactRating(L)            L = 16 third-octave normalised impact levels (dB) → { Lnw, CI, shift, sumUnfavourable }
 *   massLawR(m, f)             field-incidence mass law, R = 20 lg (m f) − 47 dB (m in kg/m², f in Hz)
 *   criticalFrequency({ rho, E, nu, h })   fc = c² / (2π h) · √(12 ρ (1 − ν²) / E)
 *   massLawBands({ rho, E, nu, h })        the octave bands up to fc / 2 by the mass law; above it null (the coincidence dip is NOT estimated here)
 *   MATERIALS                  plain walls for massLawBands (density, Young's modulus, Poisson ratio), citations in the comments
 *
 * Airborne: the reference curve is shifted in whole decibels to the highest position where the sum of the unfavourable deviations (bands where R is
 * below the shifted curve) is at most 32.0 dB; Rw = the shifted curve at 500 Hz. C and Ctr = Xa − Rw for spectrum 1 (pink) and 2 (traffic),
 * Xa = −10 lg Σ 10^((Lj − Rj) / 10), each rounded to a whole number. Impact: the curve is shifted to the lowest position with that sum of
 * unfavourable deviations (bands where L is ABOVE the curve) at most 32.0; Ln,w = the curve at 500 Hz; CI = Ln,sum − 15 − Ln,w over 100 … 2500 Hz.
 */
export const THIRD_OCTAVES = [100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];
export const REF_AIRBORNE = [33, 36, 39, 42, 45, 48, 51, 52, 53, 54, 55, 56, 56, 56, 56, 56];
export const REF_IMPACT = [62, 62, 62, 62, 62, 62, 61, 60, 59, 58, 57, 54, 51, 48, 45, 42];
export const SPECTRUM_1 = [-29, -26, -23, -21, -19, -17, -15, -13, -12, -11, -10, -9, -9, -9, -9, -9];
export const SPECTRUM_2 = [-20, -20, -18, -16, -15, -14, -13, -12, -11, -9, -8, -9, -10, -11, -13, -15];
const AT_500 = 7;

function clean(v) {
  if (!Array.isArray(v) || v.length !== THIRD_OCTAVES.length || v.some((x) => !Number.isFinite(+x))) throw new Error('sixteen third-octave values from 100 Hz to 3150 Hz are needed');
  return v.map(Number);
}
const sumBelow = (R, shift) => R.reduce((s, r, i) => s + Math.max(0, REF_AIRBORNE[i] + shift - r), 0);
const sumAbove = (L, shift) => L.reduce((s, l, i) => s + Math.max(0, l - (REF_IMPACT[i] + shift)), 0);
const adapt = (spec, R) => -10 * Math.log10(spec.reduce((s, lj, i) => s + Math.pow(10, (lj - R[i]) / 10), 0));

export function airborneRating(Rin) {
  const R = clean(Rin);
  let shift = -Infinity;
  for (let s = -80; s <= 80; s++) if (sumBelow(R, s) <= 32) shift = s; else if (shift > -Infinity) break;
  if (shift === -Infinity) throw new Error('no position of the reference curve fits');
  const Rw = REF_AIRBORNE[AT_500] + shift;
  return { Rw, C: Math.round(adapt(SPECTRUM_1, R) - Rw) || 0, Ctr: Math.round(adapt(SPECTRUM_2, R) - Rw) || 0, shift, sumUnfavourable: sumBelow(R, shift) };
}

export function impactRating(Lin) {
  const L = clean(Lin);
  let shift = null;
  for (let s = 80; s >= -80; s--) if (sumAbove(L, s) <= 32) shift = s; else if (shift !== null) break;
  if (shift === null) throw new Error('no position of the reference curve fits');
  const Lnw = REF_IMPACT[AT_500] + shift;
  const sum = 10 * Math.log10(L.slice(0, 15).reduce((s, l) => s + Math.pow(10, l / 10), 0));
  return { Lnw, CI: Math.round(sum - 15 - Lnw), shift, sumUnfavourable: sumAbove(L, shift) };
}

export const massLawR = (m, f) => 20 * Math.log10(m * f) - 47;

export function criticalFrequency({ rho, E, nu = 0.2, h }) {
  return (343 * 343) / (2 * Math.PI * h) * Math.sqrt((12 * rho * (1 - nu * nu)) / E);
}

/** Plain homogeneous panels: density kg/m³, Young's modulus Pa (static, order of magnitude), Poisson ratio. A first estimate, not a lab value. */
export const MATERIALS = {
  concrete: { rho: 2300, E: 25e9, nu: 0.2 },
  brick: { rho: 1800, E: 10e9, nu: 0.2 },
  gypsum: { rho: 800, E: 2.5e9, nu: 0.3 },
  glass: { rho: 2500, E: 70e9, nu: 0.22 },
  steel: { rho: 7850, E: 210e9, nu: 0.3 },
  timber: { rho: 500, E: 10e9, nu: 0.3 },
};

export function massLawBands({ rho, E, nu = 0.2, h }) {
  const fc = criticalFrequency({ rho, E, nu, h }), m = rho * h;
  return { fc, m, bands: [125, 250, 500, 1000, 2000, 4000].map((f) => ({ f, R: f <= fc / 2 ? massLawR(m, f) : null })) };
}
