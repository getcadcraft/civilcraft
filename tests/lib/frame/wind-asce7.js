/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wind-asce7.js — wind loads on an enclosed, rigid building by the ASCE 7 directional procedure for the main wind force resisting system
 * (chapter 27, Part 1, buildings of all heights), turned into storey forces for the frame's rigid floors (0.9 SU.1056b). DOM-free,
 * imports nothing. An aid until an engineer has reviewed it; not a code check. The standard is not held here: every number is one that at
 * least two independent public pages print (loads-sources.js lists them with the date read; what could not be confirmed is left out).
 * Editions: the ASCE 7-10 form (no Ke) and the ASCE 7-16 form (Ke). ASCE 7-22 is NOT built (Kz was revised and Kd moved; see UNCONFIRMED).
 *
 * Units here: lengths mm, speed m/s, pressure Pa, force N. The printed constants are in feet, mph and psf; they are converted with the exact
 * definitions of those units (0.3048 m, 0.44704 m/s, lbf 4.4482216152605 N), so the SI form of 0.00256 is a conversion, about 0.05 % above 0.613.
 *   qz = 0.00256 Kz Kzt Kd Ke V²   (psf, mph; Ke = 1 for 7-10)        Kz = 2.01 (z/zg)^(2/α), z at least 15 ft:
 *       B α 7.0 zg 1200 ft · C α 9.5 zg 900 ft · D α 11.5 zg 700 ft        Ke = e^(−0.0000362 ze) (ze in ft)     Kzt = (1 + K1 K2 K3)²
 *   p = q G Cp − qi (GCpi): walls Cp windward 0.8, side −0.7, leeward −0.5 (L/B ≤ 1); q = qz windward, qh elsewhere; G = 0.85 (rigid); GCpi ±0.18 enclosed,
 *       ±0.55 partially enclosed, 0 open. Minimum 16 psf on the wall area. For the whole building the internal pressure cancels.
 *
 *   kz(z_mm, exposure) · ke(ze_m) · kzt(K1, K2, K3) · velocityPressure({ V, exposure, z, Kzt, Kd, Ke, edition }) → Pa
 *   windStories({ V, exposure, edition, Kzt, Kd, Ke, G, enclosure, floors: [{ id, z }], base, h?, B, L, cpLee? }) → { qh, Cpl, rows, total, warnings }
 *       B = plan size across the wind, L = along it (mm); rows [{ id, z, band: [lo, hi], qz, pWind, pLee, F, minimum }] (Pa, N), lowest first
 *   windCase(model, { id, name, dir: 'X'|'Y', sign, forces, ecc }) → a load case (floorCase of loads-asce7.js)
 */
import { floorCase } from './loads-asce7.js';

export const EDITIONS = ['7-16', '7-10'];
export const EXPOSURES = Object.freeze({ B: { alpha: 7.0, zg: 1200 }, C: { alpha: 9.5, zg: 900 }, D: { alpha: 11.5, zg: 700 } });   // zg in ft
export const ENCLOSURES = Object.freeze({ enclosed: 0.18, partial: 0.55, open: 0 });
export const FT = 0.3048, MPH = 0.44704, PSF = 4.4482216152605 / (FT * FT);
export const KD_BUILDING = 0.85, G_RIGID = 0.85, CP = Object.freeze({ windward: 0.8, side: -0.7, leeward: -0.5 }), MIN_WALL_PSF = 16;

/** Kz at z (mm) for the exposure; below 15 ft the 15 ft value (the printed table is flat there). */
export function kz(z, exposure = 'C') {
  const e = EXPOSURES[exposure];
  if (!e) throw new Error('exposure ' + exposure);
  const zft = Math.max(z / 1000 / FT, 15);
  return 2.01 * Math.pow(zft / e.zg, 2 / e.alpha);
}
export const ke = (ze) => Math.exp(-0.0000362 * (ze / FT));
export const kzt = (K1, K2, K3) => Math.pow(1 + K1 * K2 * K3, 2);

export function velocityPressure({ V, exposure = 'C', z, Kzt = 1, Kd = KD_BUILDING, Ke = 1, edition = '7-16' }) {
  const mph = V / MPH;
  const psf = 0.00256 * kz(z, exposure) * Kzt * Kd * (edition === '7-10' ? 1 : Ke) * mph * mph;
  return psf * PSF;
}

export function windStories(p) {
  const { V, exposure = 'C', edition = '7-16', Kzt = 1, Kd = KD_BUILDING, Ke = 1, G = G_RIGID, enclosure = 'enclosed', base = 0, B, L } = p;
  const warnings = [];
  const floors = [...p.floors].sort((a, b) => a.z - b.z);
  if (!floors.length) return { qh: 0, rows: [], total: 0, warnings: [{ code: 'no-floors' }] };
  const top = floors[floors.length - 1].z;
  const h = Math.max(p.h ?? top, base + 1);
  const q = (z) => velocityPressure({ V, exposure, z, Kzt, Kd, Ke, edition });
  const qh = q(h);
  const LB = L / B;
  const typed = p.cpLee !== undefined && p.cpLee !== null;
  const Cpl = typed ? p.cpLee : CP.leeward;
  if (!typed && LB > 1) warnings.push({ code: 'leeward-cp', LB });
  if (G !== G_RIGID) warnings.push({ code: 'gust-changed' });
  const minPa = MIN_WALL_PSF * PSF;
  const rows = [];
  floors.forEach((f, i) => {
    const lo = i === 0 ? (base + f.z) / 2 : (floors[i - 1].z + f.z) / 2;
    const hi = Math.min(i === floors.length - 1 ? h : (f.z + floors[i + 1].z) / 2, h);
    const band = Math.max(hi - lo, 0);
    const n = Math.max(8, Math.ceil(band / 250));
    let wind = 0;
    for (let k = 0; k < n; k++) wind += q(lo + (k + 0.5) * band / n) * G * CP.windward * (band / n);
    const lee = qh * G * Math.abs(Cpl) * band;
    let F = (wind + lee) * B / 1e6;      // Pa · mm · mm / 1e6 = N
    const Fmin = minPa * band * B / 1e6;
    let minimum = false;
    if (F < Fmin) { F = Fmin; minimum = true; }
    rows.push({ id: f.id, z: f.z, band: [lo, hi], qz: q(f.z), pWind: q(f.z) * G * CP.windward, pLee: qh * G * Cpl, pSide: qh * G * CP.side, F, minimum });
  });
  const gcpi = ENCLOSURES[enclosure] ?? 0.18;
  for (const r of rows) { r.pInPlus = r.pWind - qh * gcpi; r.pInMinus = r.pWind + qh * gcpi; }
  if (rows.some((r) => r.minimum)) warnings.push({ code: 'minimum' });
  if (h < top - 1) warnings.push({ code: 'roof-below-top' });
  return { qh, Cpl, gcpi, rows, total: rows.reduce((s, r) => s + r.F, 0), warnings, h, LB };
}

export function windCase(model, { id, name, dir, sign = 1, forces, ecc = 0, torsion = 1 }) {
  const f = {};
  for (const k of Object.keys(forces)) f[k] = sign * forces[k];
  return floorCase(model, { id, name, kind: 'wind', dir, forces: f, ecc: ecc, sign: torsion });
}
