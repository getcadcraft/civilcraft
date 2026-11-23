/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plume.js — the ONE Gaussian plume core of lib/process (0.8 Track CH; DOM-free, no imports outside lib/process).
 * Moved here from safety/consequence.js by chem-env_PART_3 (R3.28) so CH.16 (consequence screening, chem-safety_PART_3) and CH.19 (air dispersion,
 * dispersion.js) share one copy of the Briggs coefficients and the plume equation (rule 39). safety/consequence.js re-exports these names unchanged.
 *
 *   sigma(stab, x, terrain)                Briggs sigma_y, sigma_z (m) at downwind distance x (m); terrain 'rural' (open country, the default) or 'urban'
 *   plumeConc({ Q, u, H, stab, terrain, zi }, x, y, z)    concentration (Q units per m3) from a continuous release, ground reflection, optional mixing lid zi
 *   plumeReach(p, Cend)                    farthest ground-level centreline distance still >= Cend
 *   plumeFootprint(p, Cend, { cx, cy, toDeg, steps })     the Cend contour as a polygon in site coordinates
 *   isDense({ M, T })                      is the gas denser than air (a Gaussian screening result is then not to be trusted)
 *
 * Every coefficient is typed from the public literature WITHOUT the book open (REVIEW below): the tests prove the code uses the value as its comment says,
 * not that the value is the book's. An engineer (O7) compares the SOURCES lines with Turner's Workbook / the EPA user's guide before any permit use.
 */
import { R } from '../data.js';

const P_ATM = 101325, M_AIR = 0.028964;
export const STABILITY = ['A', 'B', 'C', 'D', 'E', 'F'];
export const SOURCES = {
  briggs: 'Briggs (1973) open-country sigma_y, sigma_z (as tabulated in Turner\'s Workbook): A y 0.22x(1+1e-4x)^-1/2, z 0.20x; B 0.16x.., 0.12x; C 0.11x.., 0.08x(1+2e-4x)^-1/2; D 0.08x.., 0.06x(1+1.5e-3x)^-1/2; E 0.06x.., 0.03x(1+3e-4x)^-1; F 0.04x.., 0.016x(1+3e-4x)^-1',
  briggsUrban: 'Briggs (1973) urban: A-B y 0.32x(1+4e-4x)^-1/2, z 0.24x(1+1e-3x)^1/2; C y 0.22x(1+4e-4x)^-1/2, z 0.20x; D y 0.16x(1+4e-4x)^-1/2, z 0.14x(1+3e-4x)^-1/2; E-F y 0.11x(1+4e-4x)^-1/2, z 0.08x(1+1.5e-3x)^-1/2',
  plume: 'Gaussian plume, continuous release, ground reflection: C = Q/(2 pi u sy sz) exp(-y^2/2sy^2) [exp(-(z-H)^2/2sz^2) + exp(-(z+H)^2/2sz^2)]',
  lid: 'Reflection from a mixing-height lid zi by the method of images (Turner), switching to a well-mixed column C = Q/(sqrt(2 pi) u sy zi) exp(-y^2/2sy^2) when sz > 1.6 zi',
};
export const REVIEW = { state: 'not confirmed', note: 'Coefficients typed without the book open. Each is exercised against a closed form in the tests, not against a printed worked example.' };

// [a_y, b_y(1+b x)^e_y ...] : sy = ay x (1 + by x)^ey ; sz = az x (1 + bz x)^ez
const RURAL = {
  A: { ay: 0.22, by: 1e-4, ey: -0.5, az: 0.20, bz: 0, ez: 0 },
  B: { ay: 0.16, by: 1e-4, ey: -0.5, az: 0.12, bz: 0, ez: 0 },
  C: { ay: 0.11, by: 1e-4, ey: -0.5, az: 0.08, bz: 2e-4, ez: -0.5 },
  D: { ay: 0.08, by: 1e-4, ey: -0.5, az: 0.06, bz: 1.5e-3, ez: -0.5 },
  E: { ay: 0.06, by: 1e-4, ey: -0.5, az: 0.03, bz: 3e-4, ez: -1 },
  F: { ay: 0.04, by: 1e-4, ey: -0.5, az: 0.016, bz: 3e-4, ez: -1 },
};
const URBAN_AB = { ay: 0.32, by: 4e-4, ey: -0.5, az: 0.24, bz: 1e-3, ez: 0.5 };
const URBAN_EF = { ay: 0.11, by: 4e-4, ey: -0.5, az: 0.08, bz: 1.5e-3, ez: -0.5 };
const URBAN = { A: URBAN_AB, B: URBAN_AB, C: { ay: 0.22, by: 4e-4, ey: -0.5, az: 0.20, bz: 0, ez: 0 }, D: { ay: 0.16, by: 4e-4, ey: -0.5, az: 0.14, bz: 3e-4, ez: -0.5 }, E: URBAN_EF, F: URBAN_EF };

/** Briggs sigmas (m) at downwind distance x (m). terrain 'rural' (default, open country) or 'urban'. */
export function sigma(stab, x, terrain = 'rural') {
  const t = (terrain === 'urban' ? URBAN : RURAL)[stab];
  if (!t) throw new Error('Stability class A to F.');
  return { sy: t.ay * x * Math.pow(1 + t.by * x, t.ey), sz: t.az * x * (t.bz ? Math.pow(1 + t.bz * x, t.ez) : 1) };
}
/** Concentration (Q units per m³) at (x downwind, y crosswind, z height) from a continuous release Q (mass/s) at effective height H, wind u (m/s) at that height.
 *  Optional `zi` (m) = mixing height: images reflect the plume between the ground and the lid. */
export function plumeConc({ Q, u, H = 0, stab = 'D', terrain = 'rural', zi = 0 }, x, y = 0, z = 0) {
  if (!(Q >= 0) || !(u > 0)) throw new Error('Plume needs Q >= 0 and wind u > 0.');
  if (x <= 0) return 0;
  const { sy, sz } = sigma(stab, x, terrain), lat = Math.exp(-y * y / (2 * sy * sy));
  if (zi > 0) {
    if (H >= zi) return 0;                                     // released above the lid: nothing reaches the ground in this model
    if (sz > 1.6 * zi) return Q / (Math.sqrt(2 * Math.PI) * u * sy * zi) * lat;
    let s = 0; for (let n = -3; n <= 3; n++) s += Math.exp(-((z - H + 2 * n * zi) ** 2) / (2 * sz * sz)) + Math.exp(-((z + H + 2 * n * zi) ** 2) / (2 * sz * sz));
    return Q / (2 * Math.PI * u * sy * sz) * lat * s;
  }
  return Q / (2 * Math.PI * u * sy * sz) * lat * (Math.exp(-((z - H) ** 2) / (2 * sz * sz)) + Math.exp(-((z + H) ** 2) / (2 * sz * sz)));
}
/** Farthest downwind distance (m) where the ground-level centreline concentration is still >= Cend; scans a log grid then refines. null when it is never reached. */
export function plumeReach(p, Cend, { xMin = 5, xMax = 50000 } = {}) {
  if (!(Cend > 0)) throw new Error('Give the endpoint concentration (kg/m³).');
  const at = (x) => plumeConc(p, x, 0, 0); let last = null, n = 400;
  for (let i = 0; i <= n; i++) { const x = xMin * Math.pow(xMax / xMin, i / n); if (at(x) >= Cend) last = x; }
  if (last == null) return null;
  const hi = last * Math.pow(xMax / xMin, 1 / n); let a = last, b = Math.min(hi, xMax);
  if (at(b) >= Cend) return b;
  for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (at(m) >= Cend) a = m; else b = m; }
  return a;
}
const halfWidth = (p, Cend, x) => { const c = plumeConc(p, x, 0, 0); if (c < Cend) return 0; return sigma(p.stab || 'D', x, p.terrain).sy * Math.sqrt(2 * Math.log(c / Cend)); };
const topHeight = (p, Cend, x) => { let lo = 0, hi = 5 * sigma(p.stab || 'D', x, p.terrain).sz + (p.H || 0) + 10; if (plumeConc(p, x, 0, 0) < Cend) return 0; if (plumeConc(p, x, 0, hi) >= Cend) return hi; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (plumeConc(p, x, 0, m) >= Cend) lo = m; else hi = m; } return lo; };
/** The contour as a footprint polygon in site coordinates: origin at (cx, cy), wind blowing TOWARD angle `toDeg` (mathematical: 0 = +x, 90 = +y). → { reach, polygon: [[x, y]…], height } */
export function plumeFootprint(p, Cend, { cx = 0, cy = 0, toDeg = 0, steps = 40 } = {}) {
  const reach = plumeReach(p, Cend); if (reach == null) return { reach: null, polygon: [], height: 0 };
  const xs = Array.from({ length: steps + 1 }, (_, i) => 1 + (reach - 1) * i / steps), w = xs.map((x) => halfWidth(p, Cend, x)), t = toDeg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  const rot = (x, y) => [cx + x * c - y * s, cy + x * s + y * c];
  const polygon = [...xs.map((x, i) => rot(x, w[i])), ...xs.map((x, i) => rot(x, -w[i])).reverse()];
  return { reach, polygon, height: Math.max(...xs.map((x) => topHeight(p, Cend, x))) };
}
/** Is the released gas denser than air at release (so a Gaussian screening result is not trustworthy)? */
export function isDense({ M, T, Pa = P_ATM, Tair = 293.15, ratio = 1.1 }) { const rho = Pa * M / (R * T), rhoAir = Pa * M_AIR / (R * Tair); return { dense: rho / rhoAir > ratio, ratio: rho / rhoAir }; }
