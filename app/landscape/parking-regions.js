/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parking-regions.js — stall and aisle sizes for regions other than the US (SU.1815, "other regions"). Data in METRES, host-free.
 * EVERY entry is `read: false`: these are the typical design values the author knows for each region, NOT read against the printed standard or guide
 * named in `source` (rule 66). A host shows "not read against the printed source" next to them and lets the person type over every size.
 * The accessible-space count rule is deliberately null for these regions: nothing is entered until someone reads the local code.
 *
 *   REGIONS[id] = { name, source (the document to read), read: false, stall: { w, l, parallelW, parallelL }, aisle: { one, two } (metres, by traffic), accessibleStall: { w, l, aisleW }|null, accessibleCount: null }
 *   forUnits(id, units) → the same in project units (feet when 'ft'), `read` and `source` kept; null for an unknown id
 */
export const REGIONS = {
  uk: { name: 'United Kingdom', source: 'Manual for Streets 2 and BS 8300 (accessible bays), local parking standards: read the edition you design to', read: false,
    stall: { w: 2.4, l: 4.8, parallelW: 2.0, parallelL: 6.0 }, aisle: { one: 3.6, two: 6.0 }, accessibleStall: { w: 3.6, l: 4.8, aisleW: 0 }, accessibleCount: null },
  au: { name: 'Australia and New Zealand', source: 'AS/NZS 2890.1 (off-street parking) and AS/NZS 2890.6 (accessible parking): read the edition you design to', read: false,
    stall: { w: 2.4, l: 5.4, parallelW: 2.3, parallelL: 6.7 }, aisle: { one: 5.8, two: 5.8 }, accessibleStall: { w: 2.4, l: 5.4, aisleW: 2.4 }, accessibleCount: null },
  eu: { name: 'Continental Europe (generic)', source: 'The national garage or parking regulation of the country (for example the German EAR / Garagenverordnung): read the one that applies', read: false,
    stall: { w: 2.5, l: 5.0, parallelW: 2.0, parallelL: 6.0 }, aisle: { one: 4.0, two: 6.0 }, accessibleStall: { w: 3.5, l: 5.0, aisleW: 0 }, accessibleCount: null },
};
export const IDS = Object.keys(REGIONS);

export function forUnits(id, units = 'm') {
  const R = REGIONS[id]; if (!R) return null;
  const f = units === 'ft' ? 1 / 0.3048 : 1, c = (v) => Math.round(v * f * 1000) / 1000, o = (x) => x && Object.fromEntries(Object.entries(x).map(([k, v]) => [k, c(v)]));
  return { id, name: R.name, source: R.source, read: R.read, stall: o(R.stall), aisle: o(R.aisle), accessibleStall: o(R.accessibleStall), accessibleCount: R.accessibleCount, units: units === 'ft' ? 'ft' : 'm' };
}
