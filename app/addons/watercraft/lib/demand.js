/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * demand.js — demand allocation and patterns (0.9 WN.5). Customers become junction demands: each load (a parcel, a block, a meter) is
 * an average-day flow worked from an area times a unit demand, or a count of units times a use per unit, or a flow typed in; the flow goes to
 * the nearest junction, or is shared between the junctions inside a radius by inverse distance. A pattern gives the hour-by-hour multiplier.
 *
 *   UNIT_DEMANDS — starting values for the table. They are placeholders to be replaced by the utility's own standard; the add-on says so.
 *   loadFlow(load, table, units) → average-day flow in project flow units
 *   allocateDemands(water, loads, { table, units, share, radius, peak }) → { demands: Map nodeId → flow, total, unallocated: [{ load, why }], perNode }
 *   applyDemands(water, allocation, { mode: 'replace' | 'add' }) → a new water model (the input is not changed)
 *   diurnalPattern(kind, n) → n multipliers with a mean of exactly 1
 * Load: { id, x, y, kind (a key of the table), area (project area units: acres or ha, set by `areaUnit`), count, flow (explicit) }
 */
import { num, pos, LIMITS } from './util.js';

/** gal/day per unit (US) — starting values only. Area rows are per acre. */
export const UNIT_DEMANDS = {
  residential: { label: 'Residential', per: 'unit', gpd: 300 },
  apartment: { label: 'Apartment', per: 'unit', gpd: 200 },
  commercial: { label: 'Commercial', per: 'acre', gpd: 1500 },
  industrial: { label: 'Industrial', per: 'acre', gpd: 2500 },
  school: { label: 'School', per: 'acre', gpd: 800 },
  park: { label: 'Park and open space', per: 'acre', gpd: 400 },
};
const GPD_TO_GPM = 1 / 1440, GPD_TO_LS = 3.785411784 / 86400, ACRE_PER_HA = 2.47105381;

/** Average-day flow of one load in project flow units (gpm or L/s). */
export function loadFlow(load, table = UNIT_DEMANDS, units = 'ft') {
  if (load.flow != null && num(load.flow) != null) return Math.max(0, num(load.flow));
  const row = table[load.kind];
  if (!row) return null;
  const gpd = Number(row.gpd) || 0;
  let amount;
  if (row.per === 'acre') { const a = pos(load.area); if (a == null) return null; amount = (units === 'm' ? a * ACRE_PER_HA : a); }   // area is in the project's area unit: hectares (SI) or acres
  else { const c = pos(load.count); if (c == null) return null; amount = c; }
  return amount * gpd * (units === 'm' ? GPD_TO_LS : GPD_TO_GPM);
}

export function allocateDemands(water, loads, opts = {}) {
  const table = opts.table || UNIT_DEMANDS, units = opts.units === 'm' ? 'm' : 'ft';
  const peak = pos(opts.peak, 1);
  const junctions = (water?.nodes || []).filter((n) => n.kind === 'junction');
  const demands = new Map(junctions.map((n) => [n.id, 0])), unallocated = [], perNode = new Map();
  const share = opts.share === true, radius = pos(opts.radius, null);
  let total = 0;
  for (const load of (loads || []).slice(0, LIMITS.loads)) {
    const x = num(load?.x), y = num(load?.y);
    if (x == null || y == null) { unallocated.push({ load, why: 'place' }); continue; }
    const q = loadFlow(load, table, units);
    if (q == null) { unallocated.push({ load, why: 'amount' }); continue; }
    if (!junctions.length) { unallocated.push({ load, why: 'nodes' }); continue; }
    const ds = junctions.map((n) => ({ n, d: Math.hypot(n.x - x, n.y - y) })).sort((a, b) => a.d - b.d);
    let picks = [ds[0]];
    if (share && radius) { const inside = ds.filter((r) => r.d <= radius); if (inside.length > 1) picks = inside; }
    const w = picks.map((r) => 1 / Math.max(r.d, 1e-6));
    const sw = w.reduce((a, b) => a + b, 0);
    picks.forEach((r, i) => { const f = q * peak * w[i] / sw; demands.set(r.n.id, demands.get(r.n.id) + f); (perNode.get(r.n.id) || perNode.set(r.n.id, []).get(r.n.id)).push({ load: load.id ?? null, flow: f }); });
    total += q * peak;
  }
  return { demands, total, unallocated, perNode, peak };
}

export function applyDemands(water, allocation, { mode = 'replace' } = {}) {
  const nodes = (water?.nodes || []).map((n) => {
    if (n.kind !== 'junction' || !allocation.demands.has(n.id)) return { ...n };
    const v = allocation.demands.get(n.id);
    return { ...n, demand: mode === 'add' ? (n.demand || 0) + v : v };
  });
  return { ...water, nodes };
}

/** Hour-of-day multipliers with a mean of exactly 1 (so the daily volume is the average day's). The shapes are generic starting curves, not a standard. */
const SHAPES = {
  residential: [0.45, 0.35, 0.3, 0.3, 0.45, 0.85, 1.4, 1.6, 1.4, 1.15, 1.05, 1.0, 1.0, 0.95, 0.9, 0.95, 1.1, 1.4, 1.6, 1.45, 1.2, 0.95, 0.7, 0.55],
  commercial: [0.3, 0.25, 0.25, 0.25, 0.3, 0.5, 0.8, 1.2, 1.5, 1.6, 1.6, 1.55, 1.5, 1.5, 1.45, 1.4, 1.3, 1.1, 0.8, 0.6, 0.5, 0.4, 0.35, 0.3],
  flat: Array(24).fill(1),
};
export function diurnalPattern(kind = 'residential', n = 24) {
  const base = SHAPES[kind] || SHAPES.residential;
  const out = Array.from({ length: n }, (_, i) => { const x = i * base.length / n, i0 = Math.floor(x) % base.length, i1 = (i0 + 1) % base.length, f = x - Math.floor(x); return base[i0] * (1 - f) + base[i1] * f; });
  const mean = out.reduce((a, b) => a + b, 0) / n;
  return out.map((v) => v / mean);
}
