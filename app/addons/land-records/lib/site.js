/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site.js — what stands on each parcel and what there is to measure (0.11 LR.11): the building model's footprints and floor area per parcel
 * (the BIM link), and the takeoff of the land itself (areas, boundary lengths, corners, frontage, open ground). DOM-free; Node-tested.
 *
 * The buildings are the host's own (CivilCraft: its building masses, drawn there or read from an IFC file by CivilCraft itself). Nothing is
 * modelled here a second time: this file only lays them over the parcels.
 *
 *   buildingsByParcel(parcels, buildings, { unitM }) → { rows, list, totals }
 *     parcels:   [{ id, name, ring: [{ x, y }], area? }]            project units; unitM = metres per project unit
 *     buildings: [{ id, name, ring, floors, height, gfa?, use? }]    footprint ring, height and gfa in project units (gfa missing = footprint × floors)
 *     list: [{ id, name, use, parcel | null, parcelName, footprintM2, insideM2, share (0–1 of the footprint on its parcel), gfaM2, floors, heightM,
 *              state: 'inside' | 'straddles' | 'outside' }]
 *       A building belongs to the parcel that holds most of its footprint. 'straddles' = part of it is off that parcel; 'outside' = on no parcel.
 *     rows: [{ parcel, name, lotM2, buildings, footprintM2, gfaM2, coverage, far, maxHeightM, openM2 }]   one per parcel
 *       Only the part of a footprint that is ON the parcel counts for it, and the floor area is taken in the same share (a mass is a prism:
 *       every floor has the footprint's shape). coverage = footprint ÷ lot, far = floor area ÷ lot.
 *   takeoff(parcels, book, site, { unitM, frontage(id) → m | null }) → { lots, totals }
 *     lots:   [{ parcel, name, ref, use, zone, areaM2, perimeterM, corners, frontageM | null, buildings, footprintM2, gfaM2, openM2 }]
 *     totals: { lots, areaM2, perimeterM (every outline added up), sharedM (boundary two lots have in common, counted once), boundaryM (line on the
 *               ground = perimeterM − sharedM), corners (distinct corner points: one mark serves every lot that meets there), footprintM2, gfaM2, openM2, capped }
 *   quantitiesFile(tk, { project, made, units: 'm' | 'ft', words }) → the plain quantities file TakeoffCraft reads (format "cadcraft-quantities" v1)
 *   takeoffCsv(tk) → text (square metres and metres)
 */
import { area as ringArea, perimeter, overlapArea, sharedLength, bbox } from './geo.js';
import { recordOf } from './book.js';
import { csvRows } from './walk.js';

const apart = (A, B, pad = 0) => A.maxX + pad < B.minX || B.maxX + pad < A.minX || A.maxY + pad < B.minY || B.maxY + pad < A.minY;

export function buildingsByParcel(parcels, buildings, { unitM = 1 } = {}) {
  const k2 = unitM * unitM, boxes = parcels.map((p) => bbox(p.ring)), list = [];
  const rows = parcels.map((p) => ({ parcel: p.id, name: p.name, lotM2: (p.area ?? ringArea(p.ring)) * k2, buildings: 0, footprintM2: 0, gfaM2: 0, coverage: 0, far: 0, maxHeightM: 0, openM2: 0 }));
  for (const b of (Array.isArray(buildings) ? buildings : []).slice(0, 2000)) {
    if (!b || !Array.isArray(b.ring) || b.ring.length < 3) continue;
    const fp = ringArea(b.ring); if (!(fp > 0)) continue;
    const box = bbox(b.ring); let best = -1, bestOv = 0;
    for (let i = 0; i < parcels.length; i++) { if (apart(boxes[i], box)) continue; const ov = overlapArea(parcels[i].ring, b.ring); if (ov > bestOv) { bestOv = ov; best = i; } }
    const share = Math.min(1, bestOv / fp), on = best >= 0 && share > 1e-9;
    const floors = Number.isFinite(b.floors) && b.floors > 0 ? b.floors : 1, gfa = Number.isFinite(b.gfa) && b.gfa > 0 ? b.gfa : fp * floors, h = Number.isFinite(b.height) && b.height > 0 ? b.height * unitM : 0;
    list.push({ id: b.id, name: String(b.name || ''), use: String(b.use || ''), parcel: on ? parcels[best].id : null, parcelName: on ? parcels[best].name : '', footprintM2: fp * k2, insideM2: on ? bestOv * k2 : 0, share: on ? share : 0,
      gfaM2: gfa * k2, floors, heightM: h, state: !on ? 'outside' : share >= 0.999 ? 'inside' : 'straddles' });
    if (on) { const r = rows[best]; r.buildings++; r.footprintM2 += bestOv * k2; r.gfaM2 += gfa * k2 * share; r.maxHeightM = Math.max(r.maxHeightM, h); }
  }
  for (const r of rows) { r.coverage = r.lotM2 > 0 ? r.footprintM2 / r.lotM2 : 0; r.far = r.lotM2 > 0 ? r.gfaM2 / r.lotM2 : 0; r.openM2 = Math.max(0, r.lotM2 - r.footprintM2); }
  const sum = (k) => rows.reduce((m, r) => m + r[k], 0);
  return { rows, list, totals: { buildings: list.length, placed: list.filter((x) => x.parcel).length, straddling: list.filter((x) => x.state === 'straddles').length, outside: list.filter((x) => x.state === 'outside').length,
    lotM2: sum('lotM2'), footprintM2: sum('footprintM2'), gfaM2: sum('gfaM2') } };
}

/** Distinct points among the rings' corners: two corners closer than eps are one mark on the ground. */
function distinctCorners(rings, eps) {
  const cells = new Map(); let n = 0;
  for (const ring of rings) for (const p of ring) {
    const cx = Math.floor(p.x / eps), cy = Math.floor(p.y / eps); let found = false;
    for (let i = -1; i <= 1 && !found; i++) for (let j = -1; j <= 1 && !found; j++) for (const q of cells.get((cx + i) + ':' + (cy + j)) || []) if (Math.hypot(q.x - p.x, q.y - p.y) <= eps) { found = true; break; }
    if (found) continue;
    const key = cx + ':' + cy; if (!cells.has(key)) cells.set(key, []); cells.get(key).push(p); n++;
  }
  return n;
}

export function takeoff(parcels, book, site, { unitM = 1, frontage = () => null } = {}) {
  const k2 = unitM * unitM, by = new Map((site ? site.rows : []).map((r) => [r.parcel, r]));
  const lots = parcels.map((p) => {
    const r = book ? recordOf(book, p.id) : null, s = by.get(p.id), a = (p.area ?? ringArea(p.ring)) * k2, f = frontage(p.id);
    return { parcel: p.id, name: p.name, ref: r?.ref || '', use: r?.use || '', zone: r?.zone || '', areaM2: a, perimeterM: perimeter(p.ring) * unitM, corners: p.ring.length, frontageM: Number.isFinite(f) && f > 0 ? f : null,
      buildings: s ? s.buildings : 0, footprintM2: s ? s.footprintM2 : 0, gfaM2: s ? s.gfaM2 : 0, openM2: s ? s.openM2 : a };
  });
  const boxes = parcels.map((p) => bbox(p.ring)), cap = Math.min(parcels.length, 600), eps = 1e-3 / unitM;   // a millimetre, in project units
  let shared = 0;
  for (let i = 0; i < cap; i++) for (let j = i + 1; j < cap; j++) { if (apart(boxes[i], boxes[j], eps)) continue; shared += sharedLength(parcels[i].ring, parcels[j].ring, eps); }
  const sum = (k) => lots.reduce((m, r) => m + r[k], 0), per = sum('perimeterM'), sharedM = shared * unitM;
  return { lots, totals: { lots: lots.length, areaM2: sum('areaM2'), perimeterM: per, sharedM, boundaryM: per - sharedM, corners: distinctCorners(parcels.map((p) => p.ring), eps),
    footprintM2: sum('footprintM2'), gfaM2: sum('gfaM2'), openM2: sum('openM2'), capped: parcels.length > cap } };
}

const r2 = (v) => Math.round(v * 100) / 100;
export function quantitiesFile(tk, { project = '', made = '', units = 'm', words = (k) => k } = {}) {
  const ft = units !== 'm', a = (m2) => r2(ft ? m2 / 0.09290304 : m2), l = (m) => r2(ft ? m / 0.3048 : m), au = ft ? 'SF' : 'm²', lu = ft ? 'LF' : 'm', t = tk.totals;
  const items = [
    { key: 'land:area', name: words('qty.area'), unit: au, qty: a(t.areaM2), note: words('qty.area.note', { n: t.lots }) },
    { key: 'land:boundary', name: words('qty.boundary'), unit: lu, qty: l(t.boundaryM), note: words('qty.boundary.note') },
    { key: 'land:corners', name: words('qty.corners'), unit: 'EA', qty: t.corners, note: words('qty.corners.note') },
  ];
  if (t.footprintM2 > 0) items.push({ key: 'land:footprint', name: words('qty.footprint'), unit: au, qty: a(t.footprintM2), note: words('qty.footprint.note') }, { key: 'land:floorarea', name: words('qty.gfa'), unit: au, qty: a(t.gfaM2), note: words('qty.footprint.note') },
    { key: 'land:open', name: words('qty.open'), unit: au, qty: a(t.openM2), note: '' });
  for (const x of tk.lots.slice(0, 2000)) items.push({ key: 'land:lot:' + x.parcel + ':area', name: words('qty.lot.area', { lot: x.name }), unit: au, qty: a(x.areaM2), note: [x.use, x.zone].filter(Boolean).join(' / ') },
    { key: 'land:lot:' + x.parcel + ':boundary', name: words('qty.lot.boundary', { lot: x.name }), unit: lu, qty: l(x.perimeterM), note: words('qty.lot.boundary.note') });
  return { format: 'cadcraft-quantities', version: 1, app: 'CivilCraft', project: String(project).slice(0, 200), made, items };
}

export function takeoffCsv(tk) {
  const n = (v) => (v === null || v === undefined ? '' : Number(Number(v).toFixed(3))), t = tk.totals;
  return csvRows([['lot', 'reference', 'use', 'zone', 'area_m2', 'outline_m', 'frontage_m', 'corners', 'buildings', 'footprint_m2', 'floor_area_m2', 'open_ground_m2'],
    ...tk.lots.map((x) => [x.name, x.ref, x.use, x.zone, n(x.areaM2), n(x.perimeterM), n(x.frontageM), x.corners, x.buildings, n(x.footprintM2), n(x.gfaM2), n(x.openM2)]),
    [], ['total', 'value'], ['lots', t.lots], ['area_m2', n(t.areaM2)], ['outlines_added_up_m', n(t.perimeterM)], ['boundary_shared_by_two_lots_m', n(t.sharedM)], ['boundary_on_the_ground_m', n(t.boundaryM)], ['distinct_corners', t.corners],
    ['footprint_m2', n(t.footprintM2)], ['floor_area_m2', n(t.gfaM2)], ['open_ground_m2', n(t.openM2)]]);
}
