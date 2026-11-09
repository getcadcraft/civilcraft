/* SPDX-License-Identifier: Apache-2.0 */
/**
 * protection.js — overcurrent time–current curves and a grading check (0.8 XE.2; DOM-free). No maker's data is embedded: fuses and breakers
 * come from the person as a table of points (`tableCurve`), read log–log.
 *
 *   IEC 60255-151:2009  t = TMS · k / ((I/Is)^α − 1)      NI (0.14, 0.02), VI (13.5, 1), EI (80, 2), LTI (120, 1)
 *   IEEE C37.112-2018   t = TD · ( A / (M^p − 1) + B )     MI (0.0515, 0.114, 0.02), VI (19.61, 0.491, 2), EI (28.2, 0.1217, 2)
 *                       (TD is the multiplier of the expression as published; some makers' dials differ by a constant: use `divisor`)
 *   Cable damage        t = (k S / I)²      IEC 60364-4-43 k: Cu PVC 115, Cu XLPE 143, Al PVC 76, Al XLPE 94 (S in mm²)
 * A relay = { pickup (A, primary), curve, tms|td, divisor?, inst?: { pickup (A), time (s) }, definite?: { pickup, time }, minTime? }.
 */
import { problem } from './numeric.js';

export const IEC_CURVES = { NI: { k: 0.14, a: 0.02, name: 'Normal inverse' }, VI: { k: 13.5, a: 1, name: 'Very inverse' }, EI: { k: 80, a: 2, name: 'Extremely inverse' }, LTI: { k: 120, a: 1, name: 'Long-time inverse' } };
export const IEEE_CURVES = { MI: { A: 0.0515, B: 0.114, p: 0.02, name: 'Moderately inverse' }, VI: { A: 19.61, B: 0.491, p: 2, name: 'Very inverse' }, EI: { A: 28.2, B: 0.1217, p: 2, name: 'Extremely inverse' } };
export const CABLE_K = { 'Cu-PVC': 115, 'Cu-XLPE': 143, 'Al-PVC': 76, 'Al-XLPE': 94 };

/** Operating time (s) of a relay at primary current I (A); Infinity when it does not pick up. */
export function relayTime(r, I) {
  if (r.inst && I >= r.inst.pickup) return r.inst.time ?? 0.02;
  if (!(I > r.pickup)) return Infinity;
  let t;
  if (r.definite) t = r.definite.time;
  else if (r.standard === 'ieee') { const c = IEEE_CURVES[r.curve]; if (!c) throw new Error('unknown IEEE curve ' + r.curve); const M = I / r.pickup; t = (r.td ?? 1) / (r.divisor || 1) * (c.A / (Math.pow(M, c.p) - 1) + c.B); }
  else { const c = IEC_CURVES[r.curve || 'NI']; if (!c) throw new Error('unknown IEC curve ' + r.curve); t = (r.tms ?? 1) * c.k / (Math.pow(I / r.pickup, c.a) - 1); }
  return Math.max(t, r.minTime || 0);
}
/** Log–log interpolated curve from [[I, t], …] (a fuse or breaker as the maker published it). Outside the points: Infinity below, the last time above. */
export function tableCurve(points) {
  const p = [...points].sort((a, b) => a[0] - b[0]);
  return (I) => {
    if (I < p[0][0]) return Infinity; if (I >= p[p.length - 1][0]) return p[p.length - 1][1];
    for (let i = 1; i < p.length; i++) if (I <= p[i][0]) { const [i0, t0] = p[i - 1], [i1, t1] = p[i]; return Math.exp(Math.log(t0) + (Math.log(I) - Math.log(i0)) / (Math.log(i1) - Math.log(i0)) * (Math.log(t1) - Math.log(t0))); }
    return Infinity;
  };
}
export const cableDamageTime = (kS, I) => Math.pow(kS / I, 2);
export const cableK = (material) => CABLE_K[material];

const timeOf = (dev, I) => (typeof dev === 'function' ? dev(I) : relayTime(dev, I));
/** Samples of a device's curve between Imin and Imax (log-spaced) for plotting: [{ I, t }]; Infinity times left out. */
export function curveSamples(dev, Imin, Imax, n = 60) {
  const out = []; for (let i = 0; i < n; i++) { const I = Imin * Math.pow(Imax / Imin, i / (n - 1)), t = timeOf(dev, I); if (Number.isFinite(t)) out.push({ I, t }); } return out;
}
/**
 * Grading margin of an upstream device behind a downstream one at the listed fault currents (A, seen by the downstream device).
 * → { rows: [{ I, down, up, margin, ok }], problems }  margin = up − down; cti default 0.3 s (set by the person's own standard).
 */
export function coordinate(up, down, currents, { cti = 0.3, upId = 'upstream', downId = 'downstream' } = {}) {
  const rows = [], problems = [];
  for (const I of currents) {
    const td = timeOf(down, I), tu = timeOf(up, I), margin = tu - td, ok = !Number.isFinite(tu) ? true : margin >= cti;
    rows.push({ I, down: td, up: tu, margin, ok });
    if (!Number.isFinite(td)) problems.push(problem('coord.nopickup', 'warning', `At ${I.toFixed(0)} A the ${downId} device does not operate.`, [{ kind: 'device', id: downId }]));
    else if (Number.isFinite(tu) && margin < cti) problems.push(problem('coord.margin', margin < 0 ? 'error' : 'warning', `At ${I.toFixed(0)} A ${upId} operates ${margin < 0 ? 'before' : 'only ' + margin.toFixed(2) + ' s after'} ${downId} (${tu.toFixed(2)} s vs ${td.toFixed(2)} s); the grading margin is ${cti} s.`, [{ kind: 'device', id: upId }, { kind: 'device', id: downId }], { req: { op: '>=', value: cti, unit: 's' }, found: { value: margin, unit: 's' } }));
  }
  return { rows, problems };
}
/** Pickup against load and the smallest fault it must see; and the device against the cable's damage curve at the listed fault currents. */
export function relayChecks(r, { Iload, IfaultMin, IfaultMax, cable, id = 'relay' }) {
  const out = [];
  if (Iload && r.pickup < 1.05 * Iload) out.push(problem('pickup.load', 'warning', `${id}: pickup ${r.pickup} A is under 1.05 times the load current ${Iload} A and may trip on load.`, [{ kind: 'device', id }], { req: { op: '>=', value: 1.05 * Iload, unit: 'A' }, found: { value: r.pickup, unit: 'A' } }));
  if (IfaultMin && r.pickup > IfaultMin / 1.5) out.push(problem('pickup.sensitivity', 'warning', `${id}: pickup ${r.pickup} A is too close to the smallest fault ${IfaultMin} A (want at most ${(IfaultMin / 1.5).toFixed(0)} A for a 1.5 margin).`, [{ kind: 'device', id }], { req: { op: '<=', value: IfaultMin / 1.5, unit: 'A' }, found: { value: r.pickup, unit: 'A' } }));
  if (cable) for (const I of [IfaultMin, IfaultMax].filter(Boolean)) { const t = relayTime(r, I), tc = cableDamageTime(cable.k * cable.S, I); if (t > tc) out.push(problem('cable.damage', 'error', `${id}: at ${I} A it clears in ${t.toFixed(2)} s, longer than the cable can stand (${tc.toFixed(2)} s).`, [{ kind: 'device', id }], { req: { op: '<=', value: tc, unit: 's' }, found: { value: t, unit: 's' } })); }
  return out;
}
