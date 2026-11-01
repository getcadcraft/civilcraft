/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: sources and developer errors; the script layer words the errors for the user (cs-lib-eng.js) */
/**
 * eng-data.js — property data for the engineering library, every number with its source (0.8 CE.4, decision D4; DOM-free).
 * Textbook and public data only. Each property returns { value (SI), unit, ref }; the data sheet prints the ref beside it.
 *
 *   fluidProps('water' | 'air', T [K], p [Pa]) → { rho, mu, k, cp, Pr, nu, gamma?, T, p }   each a quantity { value, unit, ref }
 *   materialProps(id) → { E, nu, density, yield, k, cp, alpha, name }                          from materials.js, in SI
 *   Ranges are enforced: outside them the function throws an EngError (code 'range') rather than extrapolate.
 *
 * Water, liquid (0–100 °C, pressure ignored: the effect on a liquid is under 0.01 % per bar):
 *   density      Tanaka, Girard, Davis, Peuto, Bignell, "Recommended table for the density of water between 0 °C and 40 °C ...",
 *                Metrologia 38 (2001) 301, eq. 4 (a five-term fit, error < 1e-6 relative from 0 to 40 °C, a few 1e-4 to 100 °C)
 *   viscosity    Vogel equation, mu = A 10^(B / (T - C)), A = 2.414e-5 Pa s, B = 247.8 K, C = 140 K (as tabulated for water in
 *                e.g. Reid, Prausnitz, Poling; within about 2.5 % of the measured values from 0 to 100 °C)
 *   cp, k        CRC Handbook of Chemistry and Physics, thermophysical properties of water at saturation, interpolated linearly
 *                between the tabulated 0, 20, 40, 60, 80 and 100 °C values (rounded to the digits shown)
 * Air, dry, ideal gas (250–600 K for cp, 200–1000 K for the transport properties):
 *   density      p / (R T), R = 8.314462618 / 0.0289647 = 287.0526 J/(kg K) (molar mass of dry air 28.9647 g/mol)
 *   viscosity    Sutherland's law, mu = mu0 (T/T0)^1.5 (T0 + S) / (T + S), mu0 = 1.716e-5 Pa s, T0 = 273.15 K, S = 110.4 K (White, Viscous Fluid Flow)
 *   conductivity Sutherland's law, k = k0 (T/T0)^1.5 (T0 + S) / (T + S), k0 = 0.0241 W/(m K), S = 194 K (White, Viscous Fluid Flow)
 *   cp           Incropera, Fundamentals of Heat and Mass Transfer 7e, Table A.4, interpolated linearly between 250 ... 600 K
 *   gamma        1.4 (diatomic ideal gas, below about 500 K)
 */
import { host as hostOf, F } from './host.js';   // the host's material table and the field kernel's deterministic maths

export class EngError extends Error { constructor(code, vars = {}) { super('eng: ' + code + ' ' + JSON.stringify(vars)); this.code = code; this.vars = vars; } }
const q = (value, unit, ref) => ({ value, unit, ref });
const interp = (tab, x) => {
  let i = 0;
  while (i + 2 < tab.length && x > tab[i + 1][0]) i++;
  const [x0, y0] = tab[i], [x1, y1] = tab[i + 1];
  return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
};

const WATER_CP = [[273.15, 4217], [293.15, 4182], [313.15, 4179], [333.15, 4185], [353.15, 4197], [373.15, 4216]];
const WATER_K = [[273.15, 0.561], [293.15, 0.598], [313.15, 0.631], [333.15, 0.654], [353.15, 0.670], [373.15, 0.679]];
const AIR_CP = [[250, 1006], [300, 1007], [350, 1009], [400, 1014], [450, 1021], [500, 1030], [550, 1040], [600, 1051]];
export const R_AIR = 8.314462618 / 0.0289647;

export const FLUIDS = ['water', 'air'];
export function fluidProps(name, T, p = 101325) {
  if (!(T > 0)) throw new EngError('range', { what: 'temperature', value: T });
  if (name === 'water') {
    if (T < 273.15 || T > 373.15) throw new EngError('range', { what: 'water temperature', value: T, lo: 273.15, hi: 373.15 });
    const C = T - 273.15;
    const rho = 999.974950 * (1 - (C - 3.983035) ** 2 * (C + 301.797) / (522528.9 * (C + 69.34881)));
    const mu = 2.414e-5 * F.dpow(10, 247.8 / (T - 140));
    const cp = interp(WATER_CP, T), k = interp(WATER_K, T);
    return {
      rho: q(rho, 'kg/m3', 'Tanaka et al., Metrologia 38 (2001) 301, eq. 4'), mu: q(mu, 'Pa s', 'Vogel equation A 10^(B/(T-C)), A 2.414e-5 Pa s, B 247.8 K, C 140 K'),
      cp: q(cp, 'J/(kg K)', 'CRC Handbook, water at saturation (rounded, interpolated)'), k: q(k, 'W/(m K)', 'CRC Handbook, water at saturation (rounded, interpolated)'),
      Pr: q(mu * cp / k, '-', 'mu cp / k'), nu: q(mu / rho, 'm2/s', 'mu / rho'), T: q(T, 'K', 'given'), p: q(p, 'Pa', 'given (ignored for liquid water)'),
    };
  }
  if (name === 'air') {
    if (T < 200 || T > 1000) throw new EngError('range', { what: 'air temperature', value: T, lo: 200, hi: 1000 });
    if (T < 250 || T > 600) throw new EngError('range', { what: 'air specific heat (needs 250 to 600 K)', value: T, lo: 250, hi: 600 });
    if (!(p > 0)) throw new EngError('range', { what: 'pressure', value: p });
    const rho = p / (R_AIR * T), s = F.dpow(T / 273.15, 1.5);
    const mu = 1.716e-5 * s * (273.15 + 110.4) / (T + 110.4), k = 0.0241 * s * (273.15 + 194) / (T + 194), cp = interp(AIR_CP, T);
    return {
      rho: q(rho, 'kg/m3', 'ideal gas p / (R T), R = 8.314462618 / 0.0289647 J/(kg K)'), mu: q(mu, 'Pa s', "Sutherland's law (White, Viscous Fluid Flow): 1.716e-5 Pa s at 273.15 K, S 110.4 K"),
      cp: q(cp, 'J/(kg K)', 'Incropera 7e Table A.4 (interpolated)'), k: q(k, 'W/(m K)', "Sutherland's law (White): 0.0241 W/(m K) at 273.15 K, S 194 K"),
      Pr: q(mu * cp / k, '-', 'mu cp / k'), nu: q(mu / rho, 'm2/s', 'mu / rho'), gamma: q(1.4, '-', 'diatomic ideal gas below about 500 K'),
      T: q(T, 'K', 'given'), p: q(p, 'Pa', 'given'),
    };
  }
  throw new EngError('fluid', { name, known: FLUIDS.join(', ') });
}

// where each materials.js figure comes from (its own header has the data sheets); E and yield are in MPa there
const MAT_REF = {
  steel: 'ASM / MatWeb: ASTM A36 (E, nu, density, yield); AISI 1020 (k, cp, alpha), room temperature',
  ss304: 'ASM / MatWeb: stainless steel 304 annealed, room temperature', al6061: 'ASM / MatWeb: aluminium 6061-T6, room temperature',
  ti64: 'ASM / MatWeb: Ti-6Al-4V grade 5 annealed, room temperature', abs: 'MatWeb overview of materials, ABS injection moulded general purpose (typical)',
  pla: 'NatureWorks Ingeo 4043D data sheet (E, yield, density); typical literature values (nu, k, cp, alpha)', nylon: 'MatWeb overview of materials, nylon 6/6 unfilled dry as moulded (typical)',
};
const MATERIALS = () => hostOf().materials;
export const materialIds = () => MATERIALS().map((m) => m.id);
export function materialProps(id) {
  const m = MATERIALS().find((x) => x.id === id);
  if (!m) throw new EngError('material', { name: id, known: materialIds().join(', ') });
  const ref = MAT_REF[id] + ' (typical values: a real design uses the supplier\'s certified figures)';
  return {
    name: m.id, E: q(m.E * 1e6, 'Pa', ref), nu: q(m.nu, '-', ref), density: q(m.density, 'kg/m3', ref), yield: q(m.yield * 1e6, 'Pa', ref),
    k: q(m.k, 'W/(m K)', ref), cp: q(m.cp, 'J/(kg K)', ref), alpha: q(m.alpha, '1/K', ref),
  };
}
