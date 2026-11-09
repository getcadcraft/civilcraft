/* SPDX-License-Identifier: Apache-2.0 */
/**
 * loads-asce7.js — seismic loads by the equivalent lateral force procedure of ASCE/SEI 7-22 chapter 12, applied to the
 * frame's rigid floors, and the storey-drift check (0.8 SU.1056 step 4; owner decision O2 default). DOM-free; imports
 * nothing. An aid until an engineer has reviewed it. Wind is wind-asce7.js; site coefficients, systems and the spectrum are
 * seismic-asce7.js and spectrum-asce7.js. 0.9 SU.1056b checked these constants against public pages (loads-sources.js): Ct and x (US units),
 * Cu, the Cs equations and k are confirmed by two pages each; the SI Ct numbers typed in 0.8 were printed on no page, so Ta is now
 * computed from the confirmed US values (Ct 0.028 / 0.016 / 0.03 / 0.02, hn in ft): the answer moves by under 0.1 %. The story drift
 * ratios of Table 12.12-1 below are NOT confirmed by two pages (loads-sources.js UNCONFIRMED): check the limit.
 *
 * Units: forces N, lengths mm (heights in the period formula in m, as the SI form of Table 12.8-2), accelerations in g.
 *   12.8.1    V = Cs W
 *   12.8.1.1  Cs = SDS / (R/Ie) (12.8-2), at most SD1 / (T (R/Ie)) for T ≤ TL (12.8-3), SD1 TL / (T² (R/Ie)) for T > TL (12.8-4),
 *             at least max(0.044 SDS Ie, 0.01) (12.8-5), and where S1 ≥ 0.6 g at least 0.5 S1 / (R/Ie) (12.8-6)
 *   12.8.2.1  Ta = Ct hn^x (12.8-8), Table 12.8-2 (US, hn in ft): steel moment frames 0.028 / 0.8, concrete moment frames 0.016 / 0.9,
 *             steel eccentrically or buckling-restrained braced frames 0.03 / 0.75, all other 0.02 / 0.75
 *   12.8.2    a period from analysis may be used up to Cu Ta, Table 12.8-1 (SD1 ≥ 0.4: 1.4; 0.3: 1.4; 0.2: 1.5; 0.15: 1.6;
 *             ≤ 0.1: 1.7; straight lines between)
 *   12.8.3    Fx = Cvx V, Cvx = wx hx^k / Σ wi hi^k; k = 1 for T ≤ 0.5 s, 2 for T ≥ 2.5 s, straight line between
 *   12.8.4.2  accidental torsion: the storey force moved 5 % of the floor's plan size square to it
 *   12.8.6    δx = Cd δxe / Ie (12.8-15); Table 12.12-1, "all other structures": Δa = 0.020 / 0.015 / 0.010 hsx for risk
 *             categories I–II / III / IV (other rows of the table: give `limit` yourself)
 *
 *   PERIOD_SYSTEMS · approxPeriod(system, hn_mm) → Ta (s) · cuFactor(SD1) · periodUsed({ T, Ta, SD1 }) → T used
 *   seismicCs({ SDS, SD1, S1, R, Ie, T, TL }) → { Cs, eq, raw, max, min } · exponentK(T)
 *   elf({ levels: [{ id, z, w }], base, SDS, SD1, S1, R, Ie, T?, TL, system }) → { V, W, Cs, T, Ta, k, levels: [{ id, z, hx,
 *       w, Cvx, Fx, Vx }], clauses }   (z of each floor and base in mm; w in N; T from analysis optional)
 *   floorCase(model, { id, name, kind, dir: 'X' | 'Y', forces: { <diaphragm id>: F }, ecc = 0.05, sign = 1 }) → a load case:
 *       each storey force on its floor at the floor's master point (node force on one of its nodes + the moment that moves it
 *       there) plus the accidental torsion F × ecc × the floor's plan size across the force, with the sign given
 *   driftCheck(drifts, { Cd, Ie, risk = 'II', limit? }) → [{ id, h, elastic, design (Cd δ/Ie), allowed, ratio }]
 *       drifts from plate-solve.js storyDrifts (worst node in the direction asked)
 */

export const EDITION = 'ASCE/SEI 7-22';
export const PERIOD_SYSTEMS = Object.freeze({
  'steel-mf': { Ct: 0.028, x: 0.8 },        // Ct for hn in feet (Table 12.8-2, US units)
  'concrete-mf': { Ct: 0.016, x: 0.9 },
  'steel-ebf': { Ct: 0.03, x: 0.75 },
  other: { Ct: 0.02, x: 0.75 },
});
export const DRIFT_LIMITS = Object.freeze({ I: 0.020, II: 0.020, III: 0.015, IV: 0.010 });

export function approxPeriod(system, hn) {
  const s = PERIOD_SYSTEMS[system] || PERIOD_SYSTEMS.other;
  return s.Ct * Math.pow(hn / 304.8, s.x);
}
export function cuFactor(SD1) {
  const t = [[0.1, 1.7], [0.15, 1.6], [0.2, 1.5], [0.3, 1.4], [0.4, 1.4]];
  if (SD1 <= t[0][0]) return t[0][1];
  if (SD1 >= t[4][0]) return 1.4;
  for (let k = 1; k < t.length; k++) if (SD1 <= t[k][0]) { const [a, ca] = t[k - 1], [b, cb] = t[k]; return ca + (cb - ca) * (SD1 - a) / (b - a); }
  return 1.4;
}
export function periodUsed({ T, Ta, SD1 }) { return T && T > 0 ? Math.min(T, cuFactor(SD1) * Ta) : Ta; }

export function seismicCs({ SDS, SD1, S1 = 0, R, Ie = 1, T, TL = 8 }) {
  const RI = R / Ie;
  const raw = SDS / RI;
  const max = T <= TL ? SD1 / (T * RI) : SD1 * TL / (T * T * RI);
  let min = Math.max(0.044 * SDS * Ie, 0.01), minEq = '12.8-5';
  if (S1 >= 0.6 && 0.5 * S1 / RI > min) { min = 0.5 * S1 / RI; minEq = '12.8-6'; }
  let Cs = raw, eq = '12.8-2';
  if (max < Cs) { Cs = max; eq = T <= TL ? '12.8-3' : '12.8-4'; }
  if (min > Cs) { Cs = min; eq = minEq; }
  return { Cs, eq, raw, max, min };
}
export function exponentK(T) { return T <= 0.5 ? 1 : T >= 2.5 ? 2 : 1 + (T - 0.5) / 2; }

export function elf({ levels, base = 0, SDS, SD1, S1 = 0, R, Ie = 1, T = null, TL = 8, system = 'other' }) {
  const lv = [...levels].sort((a, b) => a.z - b.z);
  const hn = lv[lv.length - 1].z - base;
  const Ta = approxPeriod(system, hn);
  const Tu = periodUsed({ T, Ta, SD1 });
  const cs = seismicCs({ SDS, SD1, S1, R, Ie, T: Tu, TL });
  const W = lv.reduce((s, l) => s + l.w, 0), V = cs.Cs * W;
  const k = exponentK(Tu);
  const sum = lv.reduce((s, l) => s + l.w * Math.pow((l.z - base) / 1000, k), 0);
  const out = lv.map((l) => { const Cvx = l.w * Math.pow((l.z - base) / 1000, k) / sum; return { id: l.id, z: l.z, hx: l.z - base, w: l.w, Cvx, Fx: Cvx * V }; });
  let shear = 0;
  for (let i = out.length - 1; i >= 0; i--) { shear += out[i].Fx; out[i].Vx = shear; }
  return { V, W, Cs: cs.Cs, csEq: cs.eq, cs, T: Tu, Ta, Cu: cuFactor(SD1), k, hn, levels: out,
    clauses: ['ASCE/SEI 7-22 12.8.1', 'ASCE/SEI 7-22 12.8.1.1 (' + cs.eq + ')', 'ASCE/SEI 7-22 12.8.2.1 (12.8-8, Table 12.8-2)', 'ASCE/SEI 7-22 12.8.3'] };
}

/** A load case putting storey forces on the floors (rigid diaphragms) of a clean frame model. */
export function floorCase(model, { id, name, kind = 'seismic', dir = 'X', forces, ecc = 0.05, sign = 1 }) {
  const at = new Map(model.nodes.map((n) => [n.id, n]));
  const sup = new Set(model.supports.filter((s) => s.fix[0] || s.fix[1] || s.fix[5] || s.k?.[0] || s.k?.[1] || s.k?.[5]).map((s) => s.node));
  const loads = [];
  for (const d of model.diaphragms || []) {
    const F = forces[d.id];
    if (!F) continue;
    const nodes = d.nodes.filter((n) => !sup.has(n)).map((n) => at.get(n));      // as plate-solve.js: held nodes leave the floor
    if (!nodes.length) continue;
    const xm = d.master ? d.master.x : nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
    const ym = d.master ? d.master.y : nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
    const across = dir === 'X' ? Math.max(...ys) - Math.min(...ys) : Math.max(...xs) - Math.min(...xs);
    const n0 = nodes[0];
    const Fx = dir === 'X' ? F : 0, Fy = dir === 'Y' ? F : 0;
    // F at n0 makes a moment (x0 − xm) Fy − (y0 − ym) Fx about the master; take it back, then add the accidental torsion
    const Mz = -((n0.x - xm) * Fy - (n0.y - ym) * Fx) + sign * ecc * across * F;
    loads.push({ type: 'node', node: n0.id, F: [Fx, Fy, 0, 0, 0, Mz] });
  }
  return { id, name: name || id, kind, selfWeight: 0, loads };
}

export function driftCheck(drifts, { Cd, Ie = 1, risk = 'II', limit = null, dir = 'X' }) {
  const ratio = limit ?? DRIFT_LIMITS[risk] ?? 0.02;
  return drifts.map((d) => {
    const elastic = Math.abs(dir === 'X' ? d.maxX.value : d.maxY.value);
    const design = Cd * elastic / Ie, allowed = ratio * d.h;
    return { id: d.id, name: d.name, h: d.h, elastic, design, allowed, ratio: design / allowed, node: dir === 'X' ? d.maxX.node : d.maxY.node,
      clauses: ['ASCE/SEI 7-22 12.8.6 (12.8-15)', 'ASCE/SEI 7-22 Table 12.12-1'] };
  });
}
