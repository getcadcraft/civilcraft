/* SPDX-License-Identifier: Apache-2.0 */
/**
 * blast.js — vapour-cloud explosion by the multi-energy method (0.8 Track CH, CH.16; DOM-free, deterministic).
 * Multi-energy method (van den Berg 1985; TNO Yellow Book / GAME guidance): the cloud is split into confined and congested sub-volumes, each a blast source
 * of energy E = (energy density) x (volume of the flammable mixture in it), with a blast STRENGTH number 1 to 10 (1 weak deflagration, 10 detonation).
 * Distances are scaled by the Sachs length, R' = R / (E/P0)^(1/3); the overpressure and the positive duration come from the strength's curve.
 * The CURVES are data (the TNO charts) and are NOT built in (NEEDS A SOURCE: TNO Yellow Book CPR 14E chapter 5, Figure "Multi-energy blast curves", or
 * the GAME/GAMES guidance): the person types the points into a `cadcraft-blast-curve-pack`, which carries its source and review state.
 *   pack = { format: 'cadcraft-blast-curve-pack', version: 1, name, source, review: { state, by?, date? }, curves: { '<strength 1..10>': { points: [[Rbar, Pbar, tdBar?], …] } } }
 *   Rbar = R / (E/P0)^(1/3), Pbar = dP / P0 (both ascending in Rbar), tdBar = td c0 / (E/P0)^(1/3) (optional).
 * overpressure(pack, strength, E, R, P0) interpolates log-log; distanceFor(…) is its inverse; cloud(spec) sums several sources at a point (the largest governs,
 * as the method uses: sources are treated separately unless the person says they interact).
 */
export const NEEDS_SOURCE = 'TNO Yellow Book (CPR 14E) chapter 5 multi-energy curves, or the GAME/GAMES guidance; type the scaled curves per strength 1 to 10 into a cadcraft-blast-curve-pack.';
export function cleanPack(raw) {
  const p = raw && typeof raw === 'object' ? raw : {}, curves = {}, problems = [];
  if (p.format !== 'cadcraft-blast-curve-pack' || p.version !== 1) problems.push('format must be cadcraft-blast-curve-pack version 1');
  for (const [k, c] of Object.entries(p.curves && typeof p.curves === 'object' ? p.curves : {})) {
    const n = Number(k); if (!(n >= 1 && n <= 10 && Number.isInteger(n))) { problems.push('strength ' + k + ' is not 1 to 10'); continue; }
    const pts = (Array.isArray(c?.points) ? c.points : []).map((q) => q.map(Number)).filter((q) => q.length >= 2 && q[0] > 0 && q[1] > 0 && q.every(Number.isFinite)).sort((a, b) => a[0] - b[0]);
    if (pts.length < 3) { problems.push('strength ' + k + ' needs at least 3 points'); continue; } curves[n] = { points: pts };
  }
  if (!Object.keys(curves).length) problems.push('no curve');
  const rv = p.review || {}, confirmed = rv.state === 'confirmed' && rv.by && /^\d{4}-\d{2}-\d{2}$/.test(rv.date || '');
  return { ok: problems.length === 0, problems, pack: { format: 'cadcraft-blast-curve-pack', version: 1, name: String(p.name || 'unnamed').slice(0, 120), source: String(p.source || '').slice(0, 200), review: confirmed ? { state: 'confirmed', by: rv.by, date: rv.date } : { state: 'not confirmed' }, curves } };
}
const lerp = (x, x0, x1, y0, y1) => y0 + (y1 - y0) * (x - x0) / (x1 - x0);
function interpLog(pts, R, col) {
  if (R <= pts[0][0]) return pts[0][col]; if (R >= pts[pts.length - 1][0]) return pts[pts.length - 1][col];
  for (let i = 0; i + 1 < pts.length; i++) if (R >= pts[i][0] && R <= pts[i + 1][0]) return Math.exp(lerp(Math.log(R), Math.log(pts[i][0]), Math.log(pts[i + 1][0]), Math.log(pts[i][col]), Math.log(pts[i + 1][col])));
  return NaN;
}
export const sachsLength = (E, P0 = 101325) => Math.cbrt(E / P0);
export function overpressure(pack, strength, E, R, P0 = 101325) {
  const c = cleanPack(pack); if (!c.ok) { const e = new Error(NEEDS_SOURCE + ' (' + c.problems.join('; ') + ')'); e.needsSource = true; throw e; }
  const cv = c.pack.curves[strength]; if (!cv) throw new Error('the pack has no curve for strength ' + strength);
  const Rb = R / sachsLength(E, P0), Pb = interpLog(cv.points, Rb, 1), td = cv.points[0].length >= 3 ? interpLog(cv.points.filter((q) => q.length >= 3), Rb, 2) : null;
  return { dP: Pb * P0, Rbar: Rb, Pbar: Pb, duration: td != null ? td * sachsLength(E, P0) / 340 : null, reviewed: c.pack.review.state === 'confirmed' };
}
/** Distance at which the overpressure falls to dP (Pa); the curve must be monotone decreasing in the range. */
export function distanceFor(pack, strength, E, dP, P0 = 101325) {
  let lo = 1e-3 * sachsLength(E, P0), hi = 1e3 * sachsLength(E, P0);
  if (overpressure(pack, strength, E, lo, P0).dP < dP) return lo; if (overpressure(pack, strength, E, hi, P0).dP > dP) return hi;
  for (let i = 0; i < 100; i++) { const m = Math.sqrt(lo * hi); if (overpressure(pack, strength, E, m, P0).dP > dP) lo = m; else hi = m; }
  return Math.sqrt(lo * hi);
}
/** sources [{ id, x, y, volume (m3 of flammable mixture), energyDensity (J/m3, the person's), strength 1..10 }]; at {x, y}. The method treats separate sources separately: the largest governs. */
export function cloud(pack, sources, at, P0 = 101325) {
  const rows = sources.map((s) => { const E = s.volume * s.energyDensity, R = Math.max(Math.hypot(at.x - s.x, at.y - s.y), 0.01); return { id: s.id, E, R, ...overpressure(pack, s.strength, E, R, P0) }; });
  const g = rows.reduce((a, b) => (b.dP > a.dP ? b : a), rows[0]);
  return { rows, governing: g.id, dP: g.dP, notes: ['sources are treated separately (no interaction); this is a screening estimate, not an engineering approval'] };
}
/** Contour circles (plan shapes in site coordinates) of the governing source at given overpressures (Pa), for CivilCraft's site plan. */
export function contours(pack, source, levels, P0 = 101325) {
  const E = source.volume * source.energyDensity;
  return levels.map((l) => ({ id: `${source.id}:blast:${l}`, type: 'circle', cx: source.x, cy: source.y, r: distanceFor(pack, source.strength, E, l, P0), label: `${(l / 1000).toFixed(1)} kPa`, level: l, unit: 'Pa' }));
}
