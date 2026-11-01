/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cost.js — capital and operating cost (0.8 Track CH, CH.23; DOM-free). Textbook correlations with a cost index the OWNER or the person
 * supplies: nothing here knows today's index, so a result without one is a base-year cost and says so.
 *   - Purchased cost: log10 Cp0 = K1 + K2 log10 A + K3 (log10 A)^2, base year 2001 (CEPCI 397), Turton, Bailie, Whiting, Shaeiwitz,
 *     "Analysis, Synthesis and Design of Chemical Processes", Appendix A, Table A.1. The K constants below were typed from memory of that
 *     table (session process_PART_3, 2026-10-28); they are marked `check: true` and must be compared with the book before use (O7).
 *   - Scaling by the six-tenths rule (exponent given) from a known cost: C2 = C1 (A2/A1)^n (Williams 1947; Peters & Timmerhaus).
 *   - Installation: Lang factors 3.10 solid, 3.63 solid–fluid, 4.74 fluid processing plants (Lang 1948; Peters & Timmerhaus).
 *   - Index ratio: C(now) = C(base) · I_now / I_base.
 *   - Operating cost: utility duty × the price the person gives; nothing is defaulted.
 */
export const TURTON_BASE = { year: 2001, cepci: 397 };
export const EQUIPMENT = {
  pump_centrifugal:   { K: [3.3892, 0.0536, 0.1538], unit: 'kW shaft', min: 1, max: 300, check: true },
  hx_fixed_tube:      { K: [4.3247, -0.3030, 0.1634], unit: 'm2', min: 10, max: 1000, check: true },
  vessel_vertical:    { K: [3.4974, 0.4485, 0.1074], unit: 'm3', min: 0.3, max: 520, check: true },
  vessel_horizontal:  { K: [3.5565, 0.3776, 0.0905], unit: 'm3', min: 0.1, max: 628, check: true },
  compressor_centrifugal: { K: [2.2897, 1.3604, -0.1027], unit: 'kW', min: 450, max: 3000, check: true },
  heater_fired:       { K: [7.3488, -1.1666, 0.2028], unit: 'kW', min: 1000, max: 100000, check: true },
};
export const LANG = { solid: 3.10, solid_fluid: 3.63, fluid: 4.74 };
export const COST_SOURCES = ['Turton et al. App. A Table A.1 (K constants, check against the book)', 'Peters & Timmerhaus (Lang factors, scaling)'];

/** Base-year purchased cost (US$) of equipment `kind` at size A, with the problems (outside the correlation's range, constants unchecked). */
export function purchased(kind, A, index = null) {
  const e = EQUIPMENT[kind]; if (!e) throw new Error('unknown equipment ' + kind);
  const l = Math.log10(A), c0 = Math.pow(10, e.K[0] + e.K[1] * l + e.K[2] * l * l), notes = [];
  if (A < e.min || A > e.max) notes.push(`size ${A} ${e.unit} is outside the correlation's range ${e.min}–${e.max} ${e.unit}`);
  if (e.check) notes.push('the correlation constants have not been checked against the book yet');
  const ratio = index && index.now ? index.now / (index.base || TURTON_BASE.cepci) : null;
  if (ratio == null) notes.push('no cost index given: this is a ' + TURTON_BASE.year + ' base-year cost');
  return { base: c0, cost: ratio == null ? c0 : c0 * ratio, indexRatio: ratio, year: ratio == null ? TURTON_BASE.year : null, notes, unit: e.unit };
}
export const scale = (c1, a1, a2, n = 0.6) => c1 * Math.pow(a2 / a1, n);
export const installed = (purchasedTotal, kind = 'fluid') => purchasedTotal * LANG[kind];
/** Operating cost per second and per year: items [{ name, power (W), price ($/kWh) }], hours per year. Items without a price are listed, not guessed. */
export function operating(items, hours = 8000) {
  let perHour = 0; const rows = [], missing = [];
  for (const it of items) { if (it.price == null) { missing.push(it.name); continue; } const c = Math.abs(it.power) / 1000 * it.price; perHour += c; rows.push({ name: it.name, perHour: c }); }
  return { perHour, perYear: perHour * hours, rows, missing };
}
/** Equipment list → cost table: rows [{ name, kind, A }] ; returns purchased, installed (Lang), totals and the notes. */
export function capital(rows, { index = null, plant = 'fluid' } = {}) {
  const out = []; let total = 0; const notes = new Set();
  for (const r of rows) { const p = purchased(r.kind, r.A, index); out.push({ ...r, cost: p.cost, base: p.base }); total += p.cost; p.notes.forEach((n) => notes.add(n)); }
  return { rows: out, purchased: total, installed: installed(total, plant), lang: LANG[plant], notes: [...notes], sources: COST_SOURCES };
}
