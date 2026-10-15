/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solve-why.js — when an alignment's curves or a profile's vertical curves have no solution, why, and the radius or length
 * that would fit (0.5 WL.23). No DOM; bin/test-civilcraft-why.mjs works every case by hand.
 *
 * Horizontal (the PI layout of alignment.js: a curve of radius r at each inner PI, tangent length T = r·tan(|Δ|/2)):
 *   curveWhy(pis, { minR }) → [issue]
 *     { kind: 'overlap', a, b (PI indices, b = a + 1), dist, need, Ta, Tb, fixA, fixB, both }
 *         the curves at PIs a and b need Ta + Tb of the tangent between them, the PIs are `dist` apart. fixA / fixB = the
 *         largest radius at that PI that fits with everything else kept (null: it cannot fit even with no curve — the other
 *         curve alone is too long); both = { ra, rb } both scaled down by dist / need (they then meet with no tangent left)
 *     { kind: 'back', pi }       the line turns straight back at PI pi: no curve can go there
 *     { kind: 'min', pi, r, minR, maxR, fix }   a radius under the alignment's design minimum: fix = the smallest radius
 *         that meets it when that fits (minR ≤ maxR), else null (no radius both meets the minimum and fits: maxR says why)
 *   maxRadius(pis, i) → the largest radius at inner PI i that fits with its neighbours' curves as they are (Infinity on a
 *     straight run; 0 when a neighbour's curve already takes the whole tangent)
 * Vertical (profile.js: a symmetric parabola of length L centred on each inner PVI):
 *   verticalWhy(pvis) → [{ kind: 'vc', pvi (in station order), index (in the list given), L, room, fix (largest L that fits),
 *     K (that L's K) | null, side 'before' | 'past' }]
 *     a curve may run back to the previous PVI or the end of the previous curve, and on to the next PVI
 * Radii and lengths offered are rounded DOWN to 0.01 (rounded up to 0.01 for a minimum), so they always fit.
 */

const ang = (a, b, c) => {
  const a1 = Math.atan2(b.y - a.y, b.x - a.x), a2 = Math.atan2(c.y - b.y, c.x - b.x);
  let d = a2 - a1;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};
const down = (v) => Math.floor(v * 100 + 1e-9) / 100;
const up = (v) => Math.ceil(v * 100 - 1e-9) / 100;
const dist = (p, q) => Math.hypot(q.x - p.x, q.y - p.y);

/** Each PI's turn (radians, signed) and tangent length for its radius; the first and last PI have none. */
function curvesOf(pis) {
  return pis.map((p, i) => {
    if (i === 0 || i === pis.length - 1) return { d: 0, r: 0, T: 0, tanHalf: 0 };
    const d = ang(pis[i - 1], p, pis[i + 1]), r = Number(p.r) > 0 ? Number(p.r) : 0, tanHalf = Math.tan(Math.abs(d) / 2);
    const back = Math.abs(Math.abs(d) - Math.PI) < 1e-6;
    return { d, r, T: back || Math.abs(d) < 1e-9 ? 0 : r * tanHalf, tanHalf, back };
  });
}

/** The largest radius at inner PI i that fits with its neighbours as they are (see the header). */
export function maxRadius(pis, i) {
  const C = curvesOf(pis), c = C[i];
  if (!c || i === 0 || i === pis.length - 1 || c.back) return 0;
  if (Math.abs(c.d) < 1e-9) return Infinity;
  const room = Math.min(dist(pis[i - 1], pis[i]) - C[i - 1].T, dist(pis[i], pis[i + 1]) - C[i + 1].T);
  return room <= 0 ? 0 : room / c.tanHalf;
}

/** Why the alignment's curves have no solution, with the radii that would fit (see the header). */
export function curveWhy(pis, { minR = 0 } = {}) {
  const P = (pis || []).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (P.length < 3) return [];
  const C = curvesOf(P), out = [];
  C.forEach((c, i) => { if (c.back && c.r > 0) out.push({ kind: 'back', pi: i }); });
  for (let a = 0; a + 1 < P.length; a++) {
    const b = a + 1, L = dist(P[a], P[b]), Ta = C[a].T, Tb = C[b].T;
    if (Ta + Tb <= L + 1e-9) continue;
    const inner = (i) => i > 0 && i < P.length - 1 && !C[i].back && Math.abs(C[i].d) > 1e-9;
    // largest radius at one PI with the other curve kept — limited by its OTHER tangent too
    const fix = (i, other) => {
      if (!inner(i)) return null;
      const here = L - other, far = i === a ? dist(P[a - 1], P[a]) - C[a - 1].T : dist(P[b], P[b + 1]) - C[b + 1].T;
      const room = Math.min(here, far);
      return room > 0 ? down(room / C[i].tanHalf) : null;
    };
    const f = L / (Ta + Tb);
    out.push({ kind: 'overlap', a, b, dist: L, need: Ta + Tb, Ta, Tb, fixA: fix(a, Tb), fixB: fix(b, Ta), both: { ra: inner(a) ? down(C[a].r * f) : 0, rb: inner(b) ? down(C[b].r * f) : 0 } });
  }
  if (minR > 0) C.forEach((c, i) => {
    if (i === 0 || i === P.length - 1 || !(c.r > 0) || c.r >= minR - 1e-9 || c.back) return;
    const maxR = maxRadius(P, i);
    out.push({ kind: 'min', pi: i, r: c.r, minR, maxR, fix: minR <= maxR + 1e-9 ? up(minR) : null });
  });
  return out;
}

/** Why vertical curves do not fit, with the longest length that would (see the header). */
export function verticalWhy(pvisIn) {
  const pvis = (pvisIn || []).filter((p) => Number.isFinite(p.sta) && Number.isFinite(p.z)).map((p, i) => ({ ...p, i0: i })).sort((a, b) => a.sta - b.sta);
  const out = [];
  let prevEnd = pvis.length ? pvis[0].sta : 0;
  for (let i = 1; i + 1 < pvis.length; i++) {
    const v = pvis[i], g1 = (v.z - pvis[i - 1].z) / (v.sta - pvis[i - 1].sta), g2 = (pvis[i + 1].z - v.z) / (pvis[i + 1].sta - v.sta);
    const A = (g2 - g1) * 100;
    let L = Number(v.L) || 0;
    if (!L && Number(v.K) > 0) L = Number(v.K) * Math.abs(A);
    if (!(L > 0) || Math.abs(A) < 1e-9) continue;
    const back = v.sta - Math.max(pvis[i - 1].sta, prevEnd), fwd = pvis[i + 1].sta - v.sta;
    const room = 2 * Math.min(back, fwd);
    if (L > room + 1e-9) {
      const fix = room > 0 ? down(room) : null;
      out.push({ kind: 'vc', pvi: i, index: v.i0, L, room, fix, K: fix ? fix / Math.abs(A) : null, side: back < fwd ? 'before' : 'past' });
      prevEnd = v.sta + (fix ?? 0) / 2;
    } else prevEnd = v.sta + L / 2;
  }
  return out;
}
