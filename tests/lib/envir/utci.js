/* SPDX-License-Identifier: Apache-2.0 */
/**
 * utci.js — outdoor thermal comfort: the Universal Thermal Climate Index from a weather file (0.9 SU.1119, cc-envir; DOM-free; imports solar.js, epw.js).
 *
 * UTCI is the air temperature of a reference environment (50 % humidity, still air 0.5 m/s, radiant = air temperature) that would give a
 * walking person the same physiological strain as the real one. The index is the published 6th-order polynomial approximation of the
 * 210-term fit to the Fiala multi-node model (Bröde et al. 2012, Int J Biometeorol 56:481; ISO 7933-adjacent; COST Action 730 / ISB Commission 6).
 * The coefficients below are the published ones (UTCI_a002.f90 as reproduced in the MIT-licensed pythermalcomfort package), written out by
 * script from that source, not retyped. Inputs: air temperature Ta (°C), mean radiant temperature Tmrt (°C), wind speed at 10 m (m/s), relative humidity (%).
 * Valid: −50 ≤ Ta ≤ 50, −30 ≤ Tmrt − Ta ≤ 70, 0.5 ≤ v ≤ 17, vapour pressure ≤ 5 kPa; outside, utci() returns NaN. Wind is clamped to 0.5…17 by the
 * callers that work from weather files (a calm hour is 0.5, as the index defines it).
 *
 *   utci(ta, tmrt, v10, rh) → °C | NaN
 *   utciCategory(u) → 'extreme_cold' … 'extreme_heat'   (the ten UTCI stress classes; boundaries −40 −27 −13 0 9 26 32 38 46)
 *   meanRadiantTemperature({ ta, rh, ghi, dni, dhi, ir, sun, lit = 1, svf = 1, albedo = 0.2 }) → °C
 *       a standing person, simplified from Lindberg et al. 2008 (SOLWEIG): Tmrt = ( S / (εp·σ) )^¼ − 273.15 with
 *       S = αk·( 0.5·svf·DHI + 0.5·ρ·GHI + Fp·DNI·lit ) + αl·( 0.5·svf·Ldown + 0.5·(1 − svf)·σTa⁴ + 0.5·σTa⁴ )
 *       Fp = 0.308·cos(α·(0.998 − α²/50000)) (α = sun altitude, degrees), αk = 0.7, αl = εp = 0.97. The ground and any walls that close
 *       the sky are taken at air temperature (a sunlit paving is hotter: Tmrt in sun is a little low, which is the safe side for heat stress
 *       only if you read it as a floor). Ldown is the file's horizontal infrared, else a clear-sky estimate (Martin & Berdahl 1984).
 *   comfortYear({ epw, suns?, lit, svf, albedo }) → { hours: Float32Array UTCI per hour (NaN where not valid), monthly: [12 mean UTCI], daytimeMean,
 *       counts: { category: hours }, heatHours (UTCI > 32), coldHours (UTCI < 0), valid }
 */
import { epwSun } from './epw.js';

export const CATEGORIES = ['extreme_cold', 'very_strong_cold', 'strong_cold', 'moderate_cold', 'slight_cold', 'none', 'moderate_heat', 'strong_heat', 'very_strong_heat', 'extreme_heat'];
const EDGES = [-40, -27, -13, 0, 9, 26, 32, 38, 46];
export function utciCategory(u) {
  if (!Number.isFinite(u)) return null;
  for (let i = 0; i < EDGES.length; i++) if (u <= EDGES[i]) return CATEGORIES[i];
  return CATEGORIES[9];
}

function esHpa(t) {   // saturation vapour pressure over water, hPa (Hardy 1998 as in the UTCI code)
  const g = [-2836.5744, -6028.076559, 19.54263612, -0.02737830188, 0.000016261698, 7.0229056e-10, -1.8680009e-13];
  const tk = t + 273.15;
  let e = 2.7150305 * Math.log(tk);
  for (let i = 0; i < g.length; i++) e += g[i] * Math.pow(tk, i - 2);
  return Math.exp(e) * 0.01;
}

function poly(Ta, v, D, pa) {
  return (
    Ta
    + 0.607562052
    + (-0.0227712343) * Ta
    + (8.06470249 * (10 ** (-4))) * Ta * Ta
    + (-1.54271372 * (10 ** (-4))) * Ta * Ta * Ta
    + (-3.24651735 * (10 ** (-6))) * Ta * Ta * Ta * Ta
    + (7.32602852 * (10 ** (-8))) * Ta * Ta * Ta * Ta * Ta
    + (1.35959073 * (10 ** (-9))) * Ta * Ta * Ta * Ta * Ta * Ta
    + (-2.25836520) * v
    + 0.0880326035 * Ta * v
    + 0.00216844454 * Ta * Ta * v
    + (-1.53347087 * (10 ** (-5))) * Ta * Ta * Ta * v
    + (-5.72983704 * (10 ** (-7))) * Ta * Ta * Ta * Ta * v
    + (-2.55090145 * (10 ** (-9))) * Ta * Ta * Ta * Ta * Ta * v
    + (-0.751269505) * v * v
    + (-0.00408350271) * Ta * v * v
    + (-5.21670675 * (10 ** (-5))) * Ta * Ta * v * v
    + (1.94544667 * (10 ** (-6))) * Ta * Ta * Ta * v * v
    + (1.14099531 * (10 ** (-8))) * Ta * Ta * Ta * Ta * v * v
    + 0.158137256 * v * v * v
    + (-6.57263143 * (10 ** (-5))) * Ta * v * v * v
    + (2.22697524 * (10 ** (-7))) * Ta * Ta * v * v * v
    + (-4.16117031 * (10 ** (-8))) * Ta * Ta * Ta * v * v * v
    + (-0.0127762753) * v * v * v * v
    + (9.66891875 * (10 ** (-6))) * Ta * v * v * v * v
    + (2.52785852 * (10 ** (-9))) * Ta * Ta * v * v * v * v
    + (4.56306672 * (10 ** (-4))) * v * v * v * v * v
    + (-1.74202546 * (10 ** (-7))) * Ta * v * v * v * v * v
    + (-5.91491269 * (10 ** (-6))) * v * v * v * v * v * v
    + 0.398374029 * D
    + (1.83945314 * (10 ** (-4))) * Ta * D
    + (-1.73754510 * (10 ** (-4))) * Ta * Ta * D
    + (-7.60781159 * (10 ** (-7))) * Ta * Ta * Ta * D
    + (3.77830287 * (10 ** (-8))) * Ta * Ta * Ta * Ta * D
    + (5.43079673 * (10 ** (-10))) * Ta * Ta * Ta * Ta * Ta * D
    + (-0.0200518269) * v * D
    + (8.92859837 * (10 ** (-4))) * Ta * v * D
    + (3.45433048 * (10 ** (-6))) * Ta * Ta * v * D
    + (-3.77925774 * (10 ** (-7))) * Ta * Ta * Ta * v * D
    + (-1.69699377 * (10 ** (-9))) * Ta * Ta * Ta * Ta * v * D
    + (1.69992415 * (10 ** (-4))) * v * v * D
    + (-4.99204314 * (10 ** (-5))) * Ta * v * v * D
    + (2.47417178 * (10 ** (-7))) * Ta * Ta * v * v * D
    + (1.07596466 * (10 ** (-8))) * Ta * Ta * Ta * v * v * D
    + (8.49242932 * (10 ** (-5))) * v * v * v * D
    + (1.35191328 * (10 ** (-6))) * Ta * v * v * v * D
    + (-6.21531254 * (10 ** (-9))) * Ta * Ta * v * v * v * D
    + (-4.99410301 * (10 ** (-6))) * v * v * v * v * D
    + (-1.89489258 * (10 ** (-8))) * Ta * v * v * v * v * D
    + (8.15300114 * (10 ** (-8))) * v * v * v * v * v * D
    + (7.55043090 * (10 ** (-4))) * D * D
    + (-5.65095215 * (10 ** (-5))) * Ta * D * D
    + (-4.52166564 * (10 ** (-7))) * Ta * Ta * D * D
    + (2.46688878 * (10 ** (-8))) * Ta * Ta * Ta * D * D
    + (2.42674348 * (10 ** (-10))) * Ta * Ta * Ta * Ta * D * D
    + (1.54547250 * (10 ** (-4))) * v * D * D
    + (5.24110970 * (10 ** (-6))) * Ta * v * D * D
    + (-8.75874982 * (10 ** (-8))) * Ta * Ta * v * D * D
    + (-1.50743064 * (10 ** (-9))) * Ta * Ta * Ta * v * D * D
    + (-1.56236307 * (10 ** (-5))) * v * v * D * D
    + (-1.33895614 * (10 ** (-7))) * Ta * v * v * D * D
    + (2.49709824 * (10 ** (-9))) * Ta * Ta * v * v * D * D
    + (6.51711721 * (10 ** (-7))) * v * v * v * D * D
    + (1.94960053 * (10 ** (-9))) * Ta * v * v * v * D * D
    + (-1.00361113 * (10 ** (-8))) * v * v * v * v * D * D
    + (-1.21206673 * (10 ** (-5))) * D * D * D
    + (-2.18203660 * (10 ** (-7))) * Ta * D * D * D
    + (7.51269482 * (10 ** (-9))) * Ta * Ta * D * D * D
    + (9.79063848 * (10 ** (-11)))
    * Ta
    * Ta
    * Ta
    * D
    * D
    * D
    + (1.25006734 * (10 ** (-6))) * v * D * D * D
    + (-1.81584736 * (10 ** (-9))) * Ta * v * D * D * D
    + (-3.52197671 * (10 ** (-10)))
    * Ta
    * Ta
    * v
    * D
    * D
    * D
    + (-3.36514630 * (10 ** (-8))) * v * v * D * D * D
    + (1.35908359 * (10 ** (-10)))
    * Ta
    * v
    * v
    * D
    * D
    * D
    + (4.17032620 * (10 ** (-10)))
    * v
    * v
    * v
    * D
    * D
    * D
    + (-1.30369025 * (10 ** (-9)))
    * D
    * D
    * D
    * D
    + (4.13908461 * (10 ** (-10)))
    * Ta
    * D
    * D
    * D
    * D
    + (9.22652254 * (10 ** (-12)))
    * Ta
    * Ta
    * D
    * D
    * D
    * D
    + (-5.08220384 * (10 ** (-9)))
    * v
    * D
    * D
    * D
    * D
    + (-2.24730961 * (10 ** (-11)))
    * Ta
    * v
    * D
    * D
    * D
    * D
    + (1.17139133 * (10 ** (-10)))
    * v
    * v
    * D
    * D
    * D
    * D
    + (6.62154879 * (10 ** (-10)))
    * D
    * D
    * D
    * D
    * D
    + (4.03863260 * (10 ** (-13)))
    * Ta
    * D
    * D
    * D
    * D
    * D
    + (1.95087203 * (10 ** (-12)))
    * v
    * D
    * D
    * D
    * D
    * D
    + (-4.73602469 * (10 ** (-12)))
    * D
    * D
    * D
    * D
    * D
    * D
    + 5.12733497 * pa
    + (-0.312788561) * Ta * pa
    + (-0.0196701861) * Ta * Ta * pa
    + (9.99690870 * (10 ** (-4))) * Ta * Ta * Ta * pa
    + (9.51738512 * (10 ** (-6))) * Ta * Ta * Ta * Ta * pa
    + (-4.66426341 * (10 ** (-7))) * Ta * Ta * Ta * Ta * Ta * pa
    + 0.548050612 * v * pa
    + (-0.00330552823) * Ta * v * pa
    + (-0.00164119440) * Ta * Ta * v * pa
    + (-5.16670694 * (10 ** (-6))) * Ta * Ta * Ta * v * pa
    + (9.52692432 * (10 ** (-7))) * Ta * Ta * Ta * Ta * v * pa
    + (-0.0429223622) * v * v * pa
    + 0.00500845667 * Ta * v * v * pa
    + (1.00601257 * (10 ** (-6))) * Ta * Ta * v * v * pa
    + (-1.81748644 * (10 ** (-6))) * Ta * Ta * Ta * v * v * pa
    + (-1.25813502 * (10 ** (-3))) * v * v * v * pa
    + (-1.79330391 * (10 ** (-4))) * Ta * v * v * v * pa
    + (2.34994441 * (10 ** (-6))) * Ta * Ta * v * v * v * pa
    + (1.29735808 * (10 ** (-4))) * v * v * v * v * pa
    + (1.29064870 * (10 ** (-6))) * Ta * v * v * v * v * pa
    + (-2.28558686 * (10 ** (-6))) * v * v * v * v * v * pa
    + (-0.0369476348) * D * pa
    + 0.00162325322 * Ta * D * pa
    + (-3.14279680 * (10 ** (-5))) * Ta * Ta * D * pa
    + (2.59835559 * (10 ** (-6))) * Ta * Ta * Ta * D * pa
    + (-4.77136523 * (10 ** (-8))) * Ta * Ta * Ta * Ta * D * pa
    + (8.64203390 * (10 ** (-3))) * v * D * pa
    + (-6.87405181 * (10 ** (-4))) * Ta * v * D * pa
    + (-9.13863872 * (10 ** (-6))) * Ta * Ta * v * D * pa
    + (5.15916806 * (10 ** (-7))) * Ta * Ta * Ta * v * D * pa
    + (-3.59217476 * (10 ** (-5))) * v * v * D * pa
    + (3.28696511 * (10 ** (-5))) * Ta * v * v * D * pa
    + (-7.10542454 * (10 ** (-7))) * Ta * Ta * v * v * D * pa
    + (-1.24382300 * (10 ** (-5))) * v * v * v * D * pa
    + (-7.38584400 * (10 ** (-9))) * Ta * v * v * v * D * pa
    + (2.20609296 * (10 ** (-7))) * v * v * v * v * D * pa
    + (-7.32469180 * (10 ** (-4))) * D * D * pa
    + (-1.87381964 * (10 ** (-5))) * Ta * D * D * pa
    + (4.80925239 * (10 ** (-6))) * Ta * Ta * D * D * pa
    + (-8.75492040 * (10 ** (-8))) * Ta * Ta * Ta * D * D * pa
    + (2.77862930 * (10 ** (-5))) * v * D * D * pa
    + (-5.06004592 * (10 ** (-6))) * Ta * v * D * D * pa
    + (1.14325367 * (10 ** (-7))) * Ta * Ta * v * D * D * pa
    + (2.53016723 * (10 ** (-6))) * v * v * D * D * pa
    + (-1.72857035 * (10 ** (-8))) * Ta * v * v * D * D * pa
    + (-3.95079398 * (10 ** (-8))) * v * v * v * D * D * pa
    + (-3.59413173 * (10 ** (-7))) * D * D * D * pa
    + (7.04388046 * (10 ** (-7))) * Ta * D * D * D * pa
    + (-1.89309167 * (10 ** (-8)))
    * Ta
    * Ta
    * D
    * D
    * D
    * pa
    + (-4.79768731 * (10 ** (-7))) * v * D * D * D * pa
    + (7.96079978 * (10 ** (-9)))
    * Ta
    * v
    * D
    * D
    * D
    * pa
    + (1.62897058 * (10 ** (-9)))
    * v
    * v
    * D
    * D
    * D
    * pa
    + (3.94367674 * (10 ** (-8)))
    * D
    * D
    * D
    * D
    * pa
    + (-1.18566247 * (10 ** (-9)))
    * Ta
    * D
    * D
    * D
    * D
    * pa
    + (3.34678041 * (10 ** (-10)))
    * v
    * D
    * D
    * D
    * D
    * pa
    + (-1.15606447 * (10 ** (-10)))
    * D
    * D
    * D
    * D
    * D
    * pa
    + (-2.80626406) * pa * pa
    + 0.548712484 * Ta * pa * pa
    + (-0.00399428410) * Ta * Ta * pa * pa
    + (-9.54009191 * (10 ** (-4))) * Ta * Ta * Ta * pa * pa
    + (1.93090978 * (10 ** (-5))) * Ta * Ta * Ta * Ta * pa * pa
    + (-0.308806365) * v * pa * pa
    + 0.0116952364 * Ta * v * pa * pa
    + (4.95271903 * (10 ** (-4))) * Ta * Ta * v * pa * pa
    + (-1.90710882 * (10 ** (-5))) * Ta * Ta * Ta * v * pa * pa
    + 0.00210787756 * v * v * pa * pa
    + (-6.98445738 * (10 ** (-4))) * Ta * v * v * pa * pa
    + (2.30109073 * (10 ** (-5))) * Ta * Ta * v * v * pa * pa
    + (4.17856590 * (10 ** (-4))) * v * v * v * pa * pa
    + (-1.27043871 * (10 ** (-5))) * Ta * v * v * v * pa * pa
    + (-3.04620472 * (10 ** (-6))) * v * v * v * v * pa * pa
    + 0.0514507424 * D * pa * pa
    + (-0.00432510997) * Ta * D * pa * pa
    + (8.99281156 * (10 ** (-5))) * Ta * Ta * D * pa * pa
    + (-7.14663943 * (10 ** (-7))) * Ta * Ta * Ta * D * pa * pa
    + (-2.66016305 * (10 ** (-4))) * v * D * pa * pa
    + (2.63789586 * (10 ** (-4))) * Ta * v * D * pa * pa
    + (-7.01199003 * (10 ** (-6))) * Ta * Ta * v * D * pa * pa
    + (-1.06823306 * (10 ** (-4))) * v * v * D * pa * pa
    + (3.61341136 * (10 ** (-6))) * Ta * v * v * D * pa * pa
    + (2.29748967 * (10 ** (-7))) * v * v * v * D * pa * pa
    + (3.04788893 * (10 ** (-4))) * D * D * pa * pa
    + (-6.42070836 * (10 ** (-5))) * Ta * D * D * pa * pa
    + (1.16257971 * (10 ** (-6))) * Ta * Ta * D * D * pa * pa
    + (7.68023384 * (10 ** (-6))) * v * D * D * pa * pa
    + (-5.47446896 * (10 ** (-7))) * Ta * v * D * D * pa * pa
    + (-3.59937910 * (10 ** (-8))) * v * v * D * D * pa * pa
    + (-4.36497725 * (10 ** (-6))) * D * D * D * pa * pa
    + (1.68737969 * (10 ** (-7)))
    * Ta
    * D
    * D
    * D
    * pa
    * pa
    + (2.67489271 * (10 ** (-8)))
    * v
    * D
    * D
    * D
    * pa
    * pa
    + (3.23926897 * (10 ** (-9)))
    * D
    * D
    * D
    * D
    * pa
    * pa
    + (-0.0353874123) * pa * pa * pa
    + (-0.221201190) * Ta * pa * pa * pa
    + 0.0155126038 * Ta * Ta * pa * pa * pa
    + (-2.63917279 * (10 ** (-4))) * Ta * Ta * Ta * pa * pa * pa
    + 0.0453433455 * v * pa * pa * pa
    + (-0.00432943862) * Ta * v * pa * pa * pa
    + (1.45389826 * (10 ** (-4))) * Ta * Ta * v * pa * pa * pa
    + (2.17508610 * (10 ** (-4))) * v * v * pa * pa * pa
    + (-6.66724702 * (10 ** (-5))) * Ta * v * v * pa * pa * pa
    + (3.33217140 * (10 ** (-5))) * v * v * v * pa * pa * pa
    + (-0.00226921615) * D * pa * pa * pa
    + (3.80261982 * (10 ** (-4))) * Ta * D * pa * pa * pa
    + (-5.45314314 * (10 ** (-9))) * Ta * Ta * D * pa * pa * pa
    + (-7.96355448 * (10 ** (-4))) * v * D * pa * pa * pa
    + (2.53458034 * (10 ** (-5))) * Ta * v * D * pa * pa * pa
    + (-6.31223658 * (10 ** (-6))) * v * v * D * pa * pa * pa
    + (3.02122035 * (10 ** (-4))) * D * D * pa * pa * pa
    + (-4.77403547 * (10 ** (-6))) * Ta * D * D * pa * pa * pa
    + (1.73825715 * (10 ** (-6))) * v * D * D * pa * pa * pa
    + (-4.09087898 * (10 ** (-7)))
    * D
    * D
    * D
    * pa
    * pa
    * pa
    + 0.614155345 * pa * pa * pa * pa
    + (-0.0616755931) * Ta * pa * pa * pa * pa
    + 0.00133374846 * Ta * Ta * pa * pa * pa * pa
    + 0.00355375387 * v * pa * pa * pa * pa
    + (-5.13027851 * (10 ** (-4))) * Ta * v * pa * pa * pa * pa
    + (1.02449757 * (10 ** (-4))) * v * v * pa * pa * pa * pa
    + (-0.00148526421) * D * pa * pa * pa * pa
    + (-4.11469183 * (10 ** (-5))) * Ta * D * pa * pa * pa * pa
    + (-6.80434415 * (10 ** (-6))) * v * D * pa * pa * pa * pa
    + (-9.77675906 * (10 ** (-6))) * D * D * pa * pa * pa * pa
    + 0.0882773108 * pa * pa * pa * pa * pa
    + (-0.00301859306) * Ta * pa * pa * pa * pa * pa
    + 0.00104452989 * v * pa * pa * pa * pa * pa
    + (2.47090539 * (10 ** (-4))) * D * pa * pa * pa * pa * pa
    + 0.00148348065 * pa * pa * pa * pa * pa * pa
  );
}

export function utci(ta, tmrt, v10, rh) {
  if (![ta, tmrt, v10, rh].every(Number.isFinite)) return NaN;
  const D = tmrt - ta, pa = (esHpa(ta) * (rh / 100)) / 10;
  if (ta < -50 || ta > 50 || D < -30 || D > 70 || v10 < 0.5 || v10 > 17 || rh < 0 || rh > 100 || pa > 5) return NaN;
  return poly(ta, v10, D, pa);
}

const SIGMA = 5.670374419e-8;
export function meanRadiantTemperature(o) {
  const ta = o.ta, tk = ta + 273.15, bb = SIGMA * tk ** 4, svf = o.svf ?? 1, lit = o.lit ?? 1, rho = o.albedo ?? 0.2;
  const up = o.sun && o.sun.altitude > 0;
  const a = up ? o.sun.altitude : 0;
  const Fp = up ? 0.308 * Math.cos(a * (0.998 - (a * a) / 50000) * Math.PI / 180) : 0;
  let Ld = o.ir;
  if (!Number.isFinite(Ld)) {   // Martin & Berdahl 1984, clear sky, from the dew point (or the humidity)
    const td = Number.isFinite(o.td) ? o.td : ta - (100 - (o.rh ?? 50)) / 5;
    Ld = (0.711 + 0.0056 * td + 7.3e-5 * td * td) * bb;
  }
  const Sk = 0.7 * (0.5 * svf * o.dhi + 0.5 * rho * o.ghi + Fp * o.dni * lit);
  const Sl = 0.97 * (0.5 * svf * Ld + 0.5 * (1 - svf) * bb + 0.5 * bb);
  return Math.pow((Sk + Sl) / (0.97 * SIGMA), 0.25) - 273.15;
}

export function comfortYear(o) {
  const { epw } = o, n = epw.hours.length, hours = new Float32Array(n).fill(NaN);
  const counts = {}; for (const c of CATEGORIES) counts[c] = 0;
  const msum = new Array(12).fill(0), mn = new Array(12).fill(0);
  let dsum = 0, dn = 0, heat = 0, cold = 0, valid = 0;
  for (let i = 0; i < n; i++) {
    const r = epw.hours[i];
    if (r.ta === null || r.rh === null) continue;
    const sun = o.suns ? o.suns[i] : epwSun(r, epw.location);
    const lit = typeof o.lit === 'function' ? o.lit(i) : o.lit ? o.lit[i] : 1;
    const tm = meanRadiantTemperature({ ta: r.ta, td: r.td, rh: r.rh, ghi: r.ghi, dni: r.dni, dhi: r.dhi, ir: r.ir, sun, lit, svf: o.svf ?? 1, albedo: o.albedo });
    const v = Math.min(17, Math.max(0.5, r.ws ?? 0.5));
    const u = utci(r.ta, tm, v, Math.min(100, Math.max(0, r.rh)));
    hours[i] = u;
    if (!Number.isFinite(u)) continue;
    valid++; counts[utciCategory(u)]++; msum[r.month - 1] += u; mn[r.month - 1]++;
    if (u > 32) heat++; if (u < 0) cold++;
    if (sun.altitude > 0) { dsum += u; dn++; }
  }
  return { hours, monthly: msum.map((s, k) => (mn[k] ? s / mn[k] : NaN)), daytimeMean: dn ? dsum / dn : NaN, counts, heatHours: heat, coldHours: cold, valid };
}
