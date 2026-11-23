/* SPDX-License-Identifier: Apache-2.0 */
/**
 * units.js — the same dome in metric or in feet, inches and pounds (0.11 DOME.9). Host-free. The engine works in millimetres, MPa, kPa, kN and kg
 * throughout; this only turns what a person types into those and what is shown back out of them. Every factor is exact by definition:
 * 1 in = 25.4 mm, 1 ft = 12 in, 1 yd = 3 ft, 1 lb = 0.45359237 kg, 1 lbf = 4.4482216152605 N (the pound at standard gravity 9.80665 m/s²).
 */
const IN = 25.4, FT = 304.8, LB = 0.45359237, LBF = 4.4482216152605;
const PSI = LBF / (IN * IN);                 // MPa per psi
const PSF = (LBF / ((FT / 1000) ** 2)) / 1000;   // kPa per psf
const PCF = LB / (FT / 1000) ** 3;           // kg/m³ per lb/ft³

/** What kind of quantity each input is. Inputs not listed (ratios, factors, shares, angles) are the same in both systems. */
export const FIELD_KIND = {
  diameter: 'long', height: 'long', stem: 'long', headroom: 'long', atX: 'long', atY: 'long', width: 'long', sill: 'long', openHeight: 'long',
  shell: 'short', thicken: 'short', cover: 'short', coverEarth: 'short', foam: 'short', membrane: 'short', footingWidth: 'short', footingDepth: 'short', slab: 'short',
  frameWidth: 'short', frameExtra: 'short', barDia: 'short', barSpacing: 'short',
  concreteMPa: 'stress', steelStress: 'stress', modulus: 'stress', finishLoad: 'pressure', snow: 'pressure', wind: 'pressure', density: 'density',
};
/** kind → [SI unit, imperial unit, SI units per imperial unit]. */
const KINDS = { long: ['mm', 'ft', FT], short: ['mm', 'in', IN], stress: ['MPa', 'psi', PSI], pressure: ['kPa', 'psf', PSF], density: ['kg/m³', 'lb/ft³', PCF] };
/** Output units: SI unit → [imperial unit, SI units per imperial unit]. */
const OUT = {
  mm: ['in', IN], m: ['ft', FT / 1000], m2: ['ft²', (FT / 1000) ** 2], m3: ['yd³', (3 * FT / 1000) ** 3], kg: ['lb', LB], MPa: ['psi', PSI], kPa: ['psf', PSF],
  kN: ['kip', LBF], 'kN/m': ['kip/ft', LBF / (FT / 1000)], 'kN·m': ['kip·ft', LBF * (FT / 1000)], 'kN·m/m': ['kip·ft/ft', LBF], mm2: ['in²', IN * IN], 'mm2/m': ['in²/ft', (IN * IN) / (FT / 1000)],
};
const PRETTY = { m2: 'm²', m3: 'm³', mm2: 'mm²', 'mm2/m': 'mm²/m' };
const imp = (system) => system === 'imperial';

/** The unit an input is typed in. */
export function fieldUnit(field, system, si = '') { const k = KINDS[FIELD_KIND[field]]; return k ? (imp(system) ? k[1] : k[0]) : si; }
/** A stored (SI) input as the number to show; and back. Nothing is rounded here. */
export function toShown(field, value, system) { const k = KINDS[FIELD_KIND[field]]; return imp(system) && k && Number.isFinite(value) ? value / k[2] : value; }
export function fromShown(field, value, system) { const k = KINDS[FIELD_KIND[field]]; return imp(system) && k && Number.isFinite(value) ? value * k[2] : value; }
/** A result in an SI unit as { value, unit } in the system asked. */
export function shown(value, unit, system) {
  const o = OUT[unit];
  if (!imp(system) || !o) return { value, unit: PRETTY[unit] || unit };
  return { value: value / o[1], unit: o[0] };
}
/** A number tidied for a box: at most 6 significant digits, no trailing zeros. */
export const tidy = (v) => (Number.isFinite(v) ? String(Number(v.toPrecision(6))) : '');
