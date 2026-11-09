/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — band and factor codes; the panel says them in words. */
/**
 * fire.js — a wildfire exposure SCREENING, present beside future (0.9 EG.46). DOM-free. SCREENING ONLY: this is our own relative scale to say
 * whether a site deserves a proper bushfire / wildfire assessment, not a bushfire attack level, not a code rating, not an insurance figure.
 *
 *   index = 10 × fuel × slope × distance × weather
 *     fuel      FUELS below: our relative weights for how much a fire in that vegetation can throw at a building (none 0 … forest 1)
 *     slope     2^(θ/10), θ = the slope in degrees UP from the vegetation to the building, capped at 20°: a fire's forward speed roughly doubles
 *               every 10° upslope (McArthur's rule of thumb, Noble, Bary & Gill 1980); downslope is not reduced (kept on the safe side)
 *     distance  min(1, 10 m / d): the gap from the building to the vegetation; radiant heat falls with distance (our simple inverse form)
 *     weather   1 + fwiPct / 100: the pack's change in the fire-weather index (present = 1); fire spread rises about in proportion to the
 *               danger index in McArthur's meters (Noble et al. 1980), so the index scales with it
 *   bands: < 0.5 very low · < 1.5 low · < 3 moderate · < 6 high · < 10 very high · ≥ 10 extreme
 *
 *   fireScreen({ fuel, slopeDeg, distanceM, fwiPct }) → { ok, present: { index, band }, future: { index, band } | null, factors, missing }
 */
export const FUELS = Object.freeze({ none: 0, urban: 0.25, grass: 0.5, shrub: 0.8, woodland: 0.9, forest: 1 });
export const BANDS = Object.freeze([[0.5, 'verylow'], [1.5, 'low'], [3, 'moderate'], [6, 'high'], [10, 'veryhigh'], [Infinity, 'extreme']]);
export const band = (x) => BANDS.find(([hi]) => x < hi)[1];

export function fireScreen({ fuel = 'grass', slopeDeg = 0, distanceM = 30, fwiPct = null } = {}) {
  const missing = [];
  if (!(fuel in FUELS)) missing.push('fuel');
  if (!(Number.isFinite(distanceM) && distanceM >= 0)) missing.push('distance');
  if (!Number.isFinite(slopeDeg)) missing.push('slope');
  if (missing.length) return { ok: false, missing };
  const s = Math.max(0, Math.min(20, slopeDeg));
  const factors = { fuel: FUELS[fuel], slope: 2 ** (s / 10), distance: Math.min(1, 10 / Math.max(distanceM, 0.1)), weather: Number.isFinite(fwiPct) ? Math.max(0, 1 + fwiPct / 100) : null, slopeCapped: slopeDeg > 20 };
  const base = 10 * factors.fuel * factors.slope * factors.distance;
  const present = { index: base, band: band(base) };
  const future = factors.weather === null ? null : { index: base * factors.weather, band: band(base * factors.weather) };
  return { ok: true, present, future, factors, missing: future ? [] : ['fwi'] };
}
