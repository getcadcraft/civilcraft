/* SPDX-License-Identifier: Apache-2.0 */
/**
 * emissions.js — emissions per stream and unit (0.8 Track CH, CH.21; DOM-free). Stoichiometry is exact (carbon balance); every factor is
 * a number with a source key, and a factor the person must choose (electricity, steam) is never defaulted: without it the result says so.
 * Sources: GWP, IPCC AR5 WG1 (2013) ch. 8 Table 8.A.1 (100-year, without climate-carbon feedback: CH4 28, N2O 265).
 * FUEL_CO2_PER_MMBTU, US EPA "Emission Factors for Greenhouse Gas Inventories" (GHG Emission Factors Hub), stationary combustion table
 * (kg CO2 per MMBtu, higher heating value). Typed from the published table, to be re-read against the current edition before use.
 */
import { atoms } from './data.js';

export const GWP_AR5 = { co2: 1, methane: 28 };                       // by component id; N2O is not a component of the package
export const GWP_SOURCE = 'IPCC AR5 WG1 Table 8.A.1';
export const FUEL_CO2_PER_MMBTU = { natural_gas: 53.06, propane: 62.87, distillate_fuel_oil_2: 73.96, residual_fuel_oil_6: 75.10, bituminous_coal: 93.28 };
export const FUEL_SOURCE = 'US EPA GHG Emission Factors Hub, stationary combustion (kg CO2/MMBtu, HHV)';
const MMBTU_J = 1.055056e9;

/** Heating values J/mol of a combustible component (C/H/O/N only) from the formation enthalpies: lower (water as gas) and higher (liquid). */
export function heatingValue(th, id) {
  const i = th.index(id), c = th.c[i], a = atoms(c.formula), co2 = th.c[th.index('co2')] || null;
  const hco2 = -393509, hh2og = -241818, hh2ol = -285830;
  for (const k of Object.keys(a)) if (!['C', 'H', 'O', 'N'].includes(k)) return null;
  const nC = a.C || 0, nH = a.H || 0, hf = c.hf || 0;
  const lhv = hf - nC * hco2 - (nH / 2) * hh2og, hhv = hf - nC * hco2 - (nH / 2) * hh2ol;
  return { lhv: Math.max(lhv, 0), hhv: Math.max(hhv, 0), source: 'SVN7 Table C.4 formation enthalpies' };
}
/** Complete combustion of a stream: CO2 and water produced (mol/s, kg/s), the heat released (W, LHV and HHV) and the oxygen needed. */
export function combustion(th, s) {
  let co2 = 0, h2o = 0, o2 = 0, lhv = 0, hhv = 0;
  for (let i = 0; i < th.n; i++) {
    const n = s.F * s.z[i], a = atoms(th.c[i].formula), id = th.ids[i];
    if (id === 'co2' || id === 'water') { if (id === 'co2') co2 += n; continue; }
    const v = heatingValue(th, id); if (!v) continue; const burns = (a.C || 0) + (a.H || 0) > 0 && v.lhv > 0;
    if (!burns) continue;
    co2 += n * (a.C || 0); h2o += n * (a.H || 0) / 2; o2 += n * ((a.C || 0) + (a.H || 0) / 4 - (a.O || 0) / 2); lhv += n * v.lhv; hhv += n * v.hhv;
  }
  return { co2, h2o, o2, co2kg: co2 * 0.04401, lhv, hhv };
}
/** Direct release of a stream: kg CO2e/s using the GWP table (components without an entry count 0). */
export function vent(th, s) {
  let kg = 0; const parts = {};
  for (let i = 0; i < th.n; i++) { const g = GWP_AR5[th.ids[i]]; if (!g) continue; const m = s.F * s.z[i] * th.c[i].MWkg; parts[th.ids[i]] = m; kg += m * g; }
  return { co2e: kg, parts, gwp: GWP_SOURCE };
}
/** The report. tags: { streamId: 'vent' | 'combust' }, fired: { unitId: { fuel: key of FUEL_CO2_PER_MMBTU, efficiency } }, electric: { unitId: { kgCO2ePerKWh } }
 * (the person's factor), hours (default 8000/year). All results kg CO2e per second and per year. */
export function emissionsReport(th, res, { tags = {}, fired = {}, electric = {}, hours = 8000 } = {}) {
  const rows = [], problems = []; let total = 0;
  for (const [id, kind] of Object.entries(tags)) {
    const s = res.streams[id]; if (!s) continue;
    const r = kind === 'combust' ? combustion(th, s) : null, co2e = kind === 'combust' ? r.co2kg : vent(th, s).co2e;
    rows.push({ kind: kind === 'combust' ? 'stream burned' : 'stream vented', id, co2e }); total += co2e;
  }
  for (const [id, f] of Object.entries(fired)) {
    const q = Math.abs((res.units[id] || {}).Q || 0), fac = FUEL_CO2_PER_MMBTU[f.fuel]; if (fac == null) { problems.push(`unknown fuel ${f.fuel}`); continue; }
    const fuelW = q / (f.efficiency || 0.85), co2e = fuelW / MMBTU_J * fac; rows.push({ kind: 'fired duty', id, fuel: f.fuel, fuelPower: fuelW, co2e }); total += co2e;
  }
  for (const [id, f] of Object.entries(electric)) {
    const w = Math.abs((res.units[id] || {}).W || 0) + Math.abs((res.units[id] || {}).Q || 0);
    if (f.kgCO2ePerKWh == null) { problems.push(`unit ${id}: no electricity factor given (choose the grid's: none is assumed)`); continue; }
    const co2e = w / 3.6e6 * f.kgCO2ePerKWh; rows.push({ kind: 'electric', id, co2e }); total += co2e;
  }
  return { rows, total, perYear: total * 3600 * hours, hours, problems, sources: [GWP_SOURCE, FUEL_SOURCE] };
}
