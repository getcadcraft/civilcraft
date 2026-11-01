/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pipestress2.js — support helpers around pipestress.js (0.8 Track CH, CH.11; DOM-free). A drafting and study aid, "to be checked by an engineer" (O7).
 *   pressureThrust({ P, Di })            the axial force P x (pi Di^2 / 4) on a blind end, an unbalanced expansion joint or a reducer step (N, P in MPa, Di in mm).
 *   selectSpring({ hotLoad, travel, table, maxVariation })   chooses a variable-spring hanger from the MAKER'S table (the caller's: sizes with a rate and a load range),
 *       by the hot load, the travel and the load variation travel x rate / hot load. Nothing is built in (NEEDS A SOURCE: a spring maker's load table).
 *   gapCheck(displacements, gaps)         a gap or stop: the thermal displacement at a node against the clearance each way (mm): flags a stop that closes.
 *   coldSpring                            NOT built: the B31.3 para. 319.5 reaction formulas need the book (NEEDS A SOURCE).
 */
export const NEEDS_SOURCE = 'Spring hanger load tables are the maker\'s (MSS SP-58 describes the types); the cold-spring reaction relations are B31.3 para. 319.5. Neither is built in.';
export const pressureThrust = ({ P, Di }) => ({ F: P * Math.PI * Di * Di / 4, units: 'N', note: 'P in MPa and Di in mm; applies where the pressure is not balanced inside the run' });
export function selectSpring({ hotLoad, travel, table, maxVariation }) {
  if (!Array.isArray(table) || !table.length) throw new Error('give the maker\'s spring table [{ size, rate (N/mm), loadMin (N), loadMax (N), travelMax (mm) }]. ' + NEEDS_SOURCE);
  if (!(maxVariation > 0)) throw new Error('give the allowed load variation (a fraction, the project\'s)');
  const ok = [];
  for (const s of table) {
    if (!(hotLoad >= s.loadMin && hotLoad <= s.loadMax && Math.abs(travel) <= s.travelMax)) continue;
    const variation = Math.abs(travel) * s.rate / hotLoad; if (variation <= maxVariation) ok.push({ size: s.size, rate: s.rate, variation });
  }
  ok.sort((a, b) => a.variation - b.variation);
  return { choices: ok, best: ok[0] || null, note: ok.length ? 'sorted by load variation; the maker\'s tables confirm the size' : 'no size in the table meets the load, the travel and the variation' };
}
export function gapCheck(displacements, gaps) {
  const out = [];
  for (const g of gaps) { const d = displacements[g.node]; if (!d) continue; const v = d[g.axis] ?? 0; const closes = v > 0 ? v > g.plus : -v > g.minus; out.push({ node: g.node, axis: g.axis, displacement: v, clearance: v > 0 ? g.plus : g.minus, closes }); }
  return { rows: out, closing: out.filter((r) => r.closes), note: 'a stop that closes adds a restraint: solve the run again with that node supported' };
}
