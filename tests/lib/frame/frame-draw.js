/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-draw.js — what frame analysis results look like on a 3D view (0.6 LC.4), as plain geometry each app hands to
 * three.js in its own coordinates (DetailCraft: mm, Z up; BimCraft: through its viewer transform). DOM-free; imports
 * frame-solve.js.
 *
 *   resultGeometry(sol, key, { mode, scale, n }) → { mode, max, scale, lines: [x,y,z, x,y,z …] (segments),
 *       lineColors: [r,g,b …] (per vertex), tris: [x,y,z …] (triangles), triColors, labels: [{ p, value, unit }] } in mm
 *   mode 'deflected': the members' deflected shape (displacements × scale; automatic = the largest drawn as 1.5 % of the
 *     model's size), one colour. Any action (N Vy Vz T My Mz): a diagram beside each member — the value drawn square to
 *     the member, as far as 8 % of the model's size for the largest — on the tension side for bending moments (My
 *     toward −z, Mz toward −y), along z for N, Vz and T, along y for Vy; filled, coloured by size (RAMP), outlined, and
 *     each member's largest value labelled at its place.
 *   RAMP(t) → [r, g, b]: blue (small) → green → ochre → red (the largest)
 */
import { diagram } from './frame-solve.js';

const STOPS = [[0.12, 0.28, 0.78], [0.09, 0.44, 0.23], [0.54, 0.38, 0], [0.70, 0.07, 0.18]];
export function RAMP(t) {
  const x = Math.max(0, Math.min(1, t)) * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(x)), f = x - i;
  return STOPS[i].map((v, k) => v + (STOPS[i + 1][k] - v) * f);
}
const DEFL = [0.70, 0.07, 0.18];

export function resultGeometry(sol, key, { mode = 'deflected', scale = 0, n = 16 } = {}) {
  const out = { mode, max: 0, scale: 0, lines: [], lineColors: [], tris: [], triColors: [], labels: [] };
  const R = sol?.results?.[key];
  if (!R || mode === 'off') return out;
  const prep = sol.prep;
  const diags = prep.mem.map((_, k) => diagram(prep, R, k, n));
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const p of prep.P) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], p[a]); hi[a] = Math.max(hi[a], p[a]); }
  const size = Math.max(1, Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]));
  const at = (o, ex, x) => [o[0] + ex[0] * x, o[1] + ex[1] * x, o[2] + ex[2] * x];
  if (mode === 'deflected') {
    let umax = 0;
    for (const d of diags) for (let k = 0; k < d.x.length; k++) umax = Math.max(umax, Math.hypot(d.dx[k], d.dy[k], d.dz[k]));
    const s = scale > 0 ? scale : umax > 0 ? 0.015 * size / umax : 1;
    prep.mem.forEach((e, k) => {
      const d = diags[k], o = prep.P[e.i], { ex, ey, ez } = e.ax;
      for (let q = 0; q < d.x.length - 1; q++) for (const r of [q, q + 1]) {
        const u = [d.dx[r], d.dy[r], d.dz[r]], b = at(o, ex, d.x[r]);
        out.lines.push(...[0, 1, 2].map((a) => b[a] + s * (ex[a] * u[0] + ey[a] * u[1] + ez[a] * u[2])));
        out.lineColors.push(...DEFL);
      }
    });
    out.max = umax; out.scale = s;
    return out;
  }
  let vmax = 0;
  for (const d of diags) for (const v of d[mode]) vmax = Math.max(vmax, Math.abs(v));
  const s = scale > 0 ? scale : vmax > 0 ? 0.08 * size / vmax : 0;
  prep.mem.forEach((e, k) => {
    const d = diags[k], o = prep.P[e.i], { ex, ey, ez } = e.ax;
    // the side a positive value is drawn on
    const dir = mode === 'My' ? ez.map((v) => -v) : mode === 'Mz' ? ey.map((v) => -v) : mode === 'Vy' ? ey : ez;
    const tip = (r) => { const b = at(o, ex, d.x[r]), h = d[mode][r] * s; return [b[0] + dir[0] * h, b[1] + dir[1] * h, b[2] + dir[2] * h]; };
    const col = (r) => RAMP(vmax > 0 ? Math.abs(d[mode][r]) / vmax : 0);
    for (let q = 0; q < d.x.length - 1; q++) {
      const b0 = at(o, ex, d.x[q]), b1 = at(o, ex, d.x[q + 1]), t0 = tip(q), t1 = tip(q + 1), c0 = col(q), c1 = col(q + 1);
      out.tris.push(...b0, ...t0, ...b1, ...t0, ...t1, ...b1);
      out.triColors.push(...c0, ...c0, ...c1, ...c0, ...c1, ...c1);
      out.lines.push(...t0, ...t1);
      out.lineColors.push(...c0, ...c1);
    }
    // the ends of the diagram, closing it on the member
    for (const r of [0, d.x.length - 1]) { out.lines.push(...at(o, ex, d.x[r]), ...tip(r)); out.lineColors.push(...col(r), ...col(r)); }
    let best = 0;
    d[mode].forEach((v, r) => { if (Math.abs(v) > Math.abs(d[mode][best])) best = r; });
    if (vmax > 0 && Math.abs(d[mode][best]) >= 0.02 * vmax) {
      const p = tip(best), push = 0.012 * size * Math.sign(d[mode][best] || 1);
      out.labels.push({ p: [p[0] + dir[0] * push, p[1] + dir[1] * push, p[2] + dir[2] * push], value: d[mode][best], unit: mode === 'N' || mode === 'Vy' || mode === 'Vz' ? 'kN' : 'kNm' });
    }
  });
  out.max = vmax; out.scale = s;
  return out;
}
