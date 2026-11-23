/* SPDX-License-Identifier: Apache-2.0 */
/**
 * uvalues.js — the U-factors a person's statements give each wall type, in the units a model carries (0.11 T24.6). Host-free.
 *
 * The quick heat loss (Heating and cooling loads) read a framed wall as its layers: a stud layer is solid wood, so a 2x6 wall that is
 * insulated between the studs came out far too leaky. The code's own method for framed walls is its table of assembly U-factors
 * (the framing, the spacing, the cavity insulation and the continuous insulation select one printed cell); pack.js wallU reads that
 * table the way the code says to use it by hand, with no interpolation. This file only turns those cells into what an IFC wall
 * carries: Pset_WallCommon.ThermalTransmittance in W/m²K (one Btu/h·ft²·°F = 5.678263 W/m²K).
 *
 *   U_IP                                 5.678263
 *   toSI(u) → W/m²K · fromSI(u) → Btu/h·ft²·°F   rounded to 4 and 5 places so a value is not changed by going there and back
 *   wallTypeUs(pack, building) → [{ key, name, u, si, column, table, page }]   one per wall type whose framing, spacing and cavity
 *                                          are stated and whose cell the table prints; a type the table cannot read is not listed
 *   wallTypeSkipped(pack, building) → [{ key, name, why }]   the others, and why ('framing' | 'cavity' | 'table-row' | 'table-spacing' …)
 * T24.6, the ceiling and the lowest floor, the same way:
 *   ceilingUOf(pack, ceiling) → { ok, u, si, column, table, page } | { ok: false, why }   a vented attic (Option B or C) reads JA4 Table
 *       4.2.1 (wood framed attic roofs) by the ceiling insulation, spacing (24 in. unless said) and continuous insulation (none unless said);
 *       a cathedral ceiling has no table in the pack ('cathedral')
 *   floorUOf(pack, floor) → the same for a raised wood floor: JA4 Table 4.4.1 over a vented crawl space, 4.4.2 with outside air under it
 *   slabFOf(pack, floor, perimeterFt) → { ok, f, fp (Btu/h·°F for the whole edge) | null, siF (W/mK), siFP (W/K) | null, … }   a slab on the
 *       ground has an F-factor per foot of its EDGE (Tables 4.4.7, 4.4.8), not a U-factor over its area: it is shown, never written as one
 * One Btu/h·ft·°F = 1.730735 W/mK.
 */
import { wallU, atticU, floorU, slabF } from './pack.js';

export const U_IP = 5.678263;
const r = (x, n) => { const k = 10 ** n; return Math.round(x * k) / k; };
export const toSI = (u) => r(u * U_IP, 4);
export const fromSI = (si) => r(si / U_IP, 5);

export function wallTypeUs(pack, building) {
  const out = [];
  for (const w of building?.walls || []) {
    if (!w.framing || typeof w.cavity !== 'number') continue;
    const u = wallU(pack, w);
    if (!u.ok) continue;
    out.push({ key: w.key, name: w.name || w.key || '', u: u.u, si: toSI(u.u), column: u.column, table: u.table, page: u.page });
  }
  return out;
}

export function wallTypeSkipped(pack, building) {
  const out = [];
  for (const w of building?.walls || []) {
    if (!w.framing) { out.push({ key: w.key, name: w.name || w.key || '', why: 'framing' }); continue; }
    if (typeof w.cavity !== 'number') { out.push({ key: w.key, name: w.name || w.key || '', why: 'cavity' }); continue; }
    const u = wallU(pack, w);
    if (!u.ok) out.push({ key: w.key, name: w.name || w.key || '', why: 'table-' + u.why });
  }
  return out;
}

export const F_IP = 1.730735;
const pick = (x) => (x.ok ? { ...x, si: toSI(x.u) } : x);
export function ceilingUOf(pack, c = {}) {
  if (!c || !c.kind) return { ok: false, why: 'kind' };
  if (c.kind === 'cathedral') return { ok: false, why: 'cathedral' };
  if (typeof c.r !== 'number') return { ok: false, why: 'r' };
  return pick(atticU(pack, { spacing: c.spacing || 24, attic: c.r, continuous: c.continuous || 0 }));
}
export function floorUOf(pack, f = {}) {
  if (!f || f.kind !== 'raised') return { ok: false, why: 'kind' };
  if (typeof f.r !== 'number') return { ok: false, why: 'r' };
  if (f.r > 0 && !f.framing) return { ok: false, why: 'framing' };
  return pick(floorU(pack, { crawl: f.crawl !== false, spacing: f.spacing || 16, framing: f.framing, cavity: f.r, continuous: f.continuous || 0 }));
}
export function slabFOf(pack, f = {}, perimeterFt = null) {
  if (!f || f.kind !== 'slab') return { ok: false, why: 'kind' };
  const x = slabF(pack, { heated: f.heated === true, r: typeof f.r === 'number' ? f.r : 0, edge: f.edge || 'none' });
  if (!x.ok) return x;
  const p = perimeterFt > 0 ? perimeterFt : null, r4 = (v) => Math.round(v * 1e4) / 1e4;
  return { ...x, fp: p ? x.f * p : null, siF: r4(x.f * F_IP), siFP: p ? r4(x.f * p * F_IP * 0.3048) : null };
}
