/* SPDX-License-Identifier: Apache-2.0 */
/**
 * exchange.js — documented geometry exchange (SW.8): no live link to any program. Out: the run as plain polylines on named layers (so any CAD
 * program reads them from DXF/DWG), and a vehicle as one small JSON file. In: a vehicle file; alignments come in through the host's own LandXML reader.
 *
 *   LAYERS = { envelope: 'SWEPT-ENVELOPE', wheels: 'SWEPT-WHEELS', body: 'SWEPT-BODY', clear: 'SWEPT-CLEAR' }
 *   layerPlan(run, { every, clear, vehicleName }) → { layers: [{ name, color }], items: [{ layer, name, pts, closed }] }
 *       envelope loops, wheel/tip/bogie traces, the body outline at every `every`-th frame (default: the first, last and about 12 between), and a
 *       small square on SWEPT-CLEAR where each conflict of `clear` (clearance.check result) first happens.
 *   vehicleToFile(vehicle) → JSON text (a one-vehicle pack, always carries verified/cite as it is); vehicleFromFile(text) → { ok, vehicle, problems }
 */
import { cleanPack, FORMAT } from './vehicle.js';
import { fin } from './geom.js';

export const LAYERS = { envelope: 'SWEPT-ENVELOPE', wheels: 'SWEPT-WHEELS', body: 'SWEPT-BODY', clear: 'SWEPT-CLEAR' };
const COLORS = { [LAYERS.envelope]: 5, [LAYERS.wheels]: 3, [LAYERS.body]: 8, [LAYERS.clear]: 1 };

export function layerPlan(run, { every = 0, clear = null, size = 0.5 } = {}) {
  const items = [];
  for (const [i, lp] of (run?.envelope?.loops || []).entries()) if (lp.length >= 3) items.push({ layer: LAYERS.envelope, name: 'envelope ' + (i + 1), pts: lp, closed: true });
  for (const tr of run?.traces || []) if (tr.pts?.length >= 2) items.push({ layer: LAYERS.wheels, name: tr.name, pts: tr.pts, closed: false });
  const F = run?.frames || [];
  const step = Number.isInteger(every) && every > 0 ? every : Math.max(1, Math.ceil(F.length / 12));
  const idx = new Set(F.length ? [0, F.length - 1] : []);
  for (let i = 0; i < F.length; i += step) idx.add(i);
  for (const i of [...idx].sort((a, b) => a - b)) for (const [j, B] of F[i].bodies.entries()) items.push({ layer: LAYERS.body, name: `body ${j + 1} step ${i}`, pts: B, closed: true });
  for (const c of clear?.conflicts || []) if (c.at && fin(c.at.x) && fin(c.at.y)) {
    const h = size / 2, { x, y } = c.at;
    items.push({ layer: LAYERS.clear, name: 'conflict ' + c.name, pts: [{ x: x - h, y: y - h }, { x: x + h, y: y - h }, { x: x + h, y: y + h }, { x: x - h, y: y + h }], closed: true });
  }
  const used = [...new Set(items.map((x) => x.layer))];
  return { layers: used.map((name) => ({ name, color: COLORS[name] })), items };
}

export function vehicleToFile(vehicle) {
  const { pack, ...v } = vehicle || {};
  return JSON.stringify({ format: FORMAT, version: 1, id: 'vehicle-file', name: String(v.name || v.key || 'vehicle').slice(0, 80), source: { title: String(v.source || ''), note: String(v.note || '') }, vehicles: [v] }, null, 1);
}
export function vehicleFromFile(text) {
  let raw; try { raw = JSON.parse(String(text)); } catch { return { ok: false, vehicle: null, problems: ['not JSON'] }; }
  // a bare vehicle (the editor's box) is accepted too
  if (raw && raw.format !== FORMAT && raw.key) raw = { format: FORMAT, version: 1, id: 'vehicle-file', vehicles: [raw] };
  const c = cleanPack(raw);
  return { ok: c.ok, vehicle: c.ok ? c.pack.vehicles[0] : null, problems: c.problems };
}
