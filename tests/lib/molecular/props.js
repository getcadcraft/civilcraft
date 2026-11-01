/* SPDX-License-Identifier: Apache-2.0 */
/**
 * props.js — turns a finished run into numbers for a CH.1 component (0.8 Track CH, CH.25). The result is marked as simulated and unconfirmed: a short run with
 * a force field typed from a paper is a study aid, never a measured property.
 */
import { density, temperature, pressure, energies } from './md.js';

/** Run statistics from samples: mean and standard error by block averaging in 5 blocks. */
export function stats(values) {
  const n = values.length; if (!n) return { mean: NaN, sem: NaN, n: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / n, nb = Math.min(5, n), bs = Math.floor(n / nb), bm = [];
  for (let b = 0; b < nb; b++) bm.push(values.slice(b * bs, (b + 1) * bs).reduce((a, c) => a + c, 0) / bs);
  const m = bm.reduce((a, c) => a + c, 0) / nb, sem = nb > 1 ? Math.sqrt(bm.reduce((a, c) => a + (c - m) ** 2, 0) / (nb - 1) / nb) : NaN;
  return { mean, sem, n };
}
/** Component fields from an NPT run (real units): densitySamples in g/cm3, D in Angstrom^2/ps. → fields to merge into a component under `md`. */
export function toComponentProps({ T, P, densitySamples = [], D = null, forceField = '', steps = 0, dt = 0 }) {
  const d = stats(densitySamples);
  return { md: { T, P, rhoLiquid: d.n ? d.mean * 1000 : null, rhoSem: d.n ? d.sem * 1000 : null, D: D == null ? null : D * 1e-8, units: { rhoLiquid: 'kg/m3', D: 'm2/s' }, forceField, steps, dt, source: 'molecular dynamics, simulated, NOT confirmed', check: 'not confirmed' } };
}
export { density, temperature, pressure, energies };
