/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — assumption codes; the panel says them in words (strings.js clim.fl.a.*). */
/**
 * flood.js — a present design flood level raised for a future climate (0.9 EG.46). DOM-free. A screening of the change, with its assumptions
 * returned; the design flood level itself stays the authority's (FEMA's base flood elevation in the US) or the person's engineer's.
 *
 *   raiseFlood({ level, depth, kind, d, unitPerM = 1, freeboard = 0 }) →
 *       { ok, present, future, design, parts: { slr, rain }, assumptions: [codes], missing: [codes] }
 *     level      the present flood level (any datum, in the host's length unit: unitPerM = units per metre, 3.28084 for feet)
 *     depth      the present flood depth at the site (water above the ground) in the same unit; needed for the rainfall part
 *     kind       'coastal' (tide and surge: + sea-level rise), 'river' (rain-fed river or surface water: rainfall uplift), 'both' (the two added)
 *     d          the deltas from pack.futureAt(): slrM (m) and rx1dayPct (%)
 *   Assumptions (returned as codes):
 *     'slr-add'     a coastal still-water level rises by the full sea-level rise (no change in surge or waves; vertical land motion only if the pack's
 *                   number is a relative, local one)
 *     'rain-q'      peak flow scales one to one with the wettest-day rainfall (rational method, Q = C·i·A; same catchment, same run-off)
 *     'rain-h'      flow depth from Manning's equation for a wide channel: h ∝ Q^0.6, so Δh = h · ((1 + u)^0.6 − 1)
 *     'add'         the two parts are added (no joint probability of a storm tide and a river flood)
 *     'freeboard'   the person's freeboard is added on top of the future level
 */
export const MANNING_EXP = 0.6;

export function raiseFlood({ level, depth = null, kind = 'coastal', d = {}, unitPerM = 1, freeboard = 0 } = {}) {
  const missing = [], assumptions = [];
  if (!Number.isFinite(level)) return { ok: false, missing: ['level'], assumptions };
  let slr = 0, rain = 0;
  if (kind === 'coastal' || kind === 'both') {
    if (Number.isFinite(d.slrM)) { slr = d.slrM * unitPerM; assumptions.push('slr-add'); } else missing.push('slr');
  }
  if (kind === 'river' || kind === 'both') {
    if (!Number.isFinite(d.rx1dayPct)) missing.push('rain');
    else if (!(Number.isFinite(depth) && depth > 0)) missing.push('depth');
    else { rain = depth * ((1 + d.rx1dayPct / 100) ** MANNING_EXP - 1); assumptions.push('rain-q', 'rain-h'); }
  }
  if (kind === 'both' && !missing.length) assumptions.push('add');
  const fb = Number.isFinite(freeboard) && freeboard > 0 ? freeboard : 0;
  if (fb) assumptions.push('freeboard');
  const future = level + slr + rain;
  return { ok: missing.length === 0, present: level, future, design: future + fb, parts: { slr, rain }, assumptions, missing };
}
