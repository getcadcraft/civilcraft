/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vehicle.js — the vehicle pack format and the three vehicle kinds (SW.2). A vehicle is DATA: a pack is a JSON file the Library delivers.
 *
 *   { format: 'cadcraft-vehicle-pack', version: 1, id, name, source: { title, note }, vehicles: [ vehicle… ] }
 *   vehicle (SI: metres, degrees; every pack entry says `verified` — false means "placeholder, check against the standard you design to"):
 *     common   key, name, kind 'road'|'aircraft'|'rail', verified, source (where the figures come from), note?
 *     road     width, front, wheelbase, rear, track, maxSteer, trailers: [{ hitch, wheelbase, front, rear, width, track, maxArticulation }]
 *              (the same fields as CivilCraft's own swept path vehicle, so the core solver runs it as it is)
 *     aircraft length, span, noseToMain (nose gear to the centre of the main gear), noseToNose (tip of the nose ahead of the nose gear),
 *              track (main gear), fuselage (width), maxNoseSteer, points: [{ name, ahead, side }] (further points to follow: wing tips,
 *              tail, engine pods; `ahead` = metres ahead (+) or behind (-) of the MAIN gear, `side` = metres left (+) of the centreline)
 *     rail     width, bogies (distance between the bogie centres), front, rear (body ends beyond the end bogie centres), cars (1–8),
 *              gap (between the end bogie centres of neighbouring cars), gauge (mm, a note)
 *   cleanPack(raw) → { ok, pack, problems[] } — untrusted: a bad vehicle is dropped and said, never half-kept.
 *   toUnits(vehicle, units) → the vehicle with its lengths in 'ft' or 'm'.
 */
import { fin } from './geom.js';

export const FORMAT = 'cadcraft-vehicle-pack';
export const KINDS = ['road', 'aircraft', 'rail'];
export const MAX_TRAILERS = 3;
const FT = 1 / 0.3048;
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const num = (v, lo, hi) => (fin(v) && v >= lo && v <= hi ? v : null);

/** One vehicle → the clean vehicle, or { error }. */
export function cleanVehicle(o) {
  if (!o || typeof o !== 'object') return { error: 'not an object' };
  const key = clean(o.key, 40);
  if (!/^[a-z][a-z0-9-]{1,39}$/.test(key)) return { error: 'key must be lower case letters, digits and dashes' };
  const kind = o.kind;
  if (!KINDS.includes(kind)) return { error: 'kind must be road, aircraft or rail' };
  const v = { key, name: clean(o.name, 80) || key, kind, verified: o.verified === true, source: clean(o.source, 200), note: clean(o.note, 300) };
  const miss = (f) => ({ error: f + ' is missing or out of range' });
  if (kind === 'road') {
    const f = { width: num(o.width, 0.5, 5), front: num(o.front, 0, 15), wheelbase: num(o.wheelbase, 0.5, 30), rear: num(o.rear, 0, 20), track: num(o.track, 0, 5), maxSteer: num(o.maxSteer, 1, 89) };
    for (const [k, x] of Object.entries(f)) if (x === null) return miss(k);
    Object.assign(v, f); v.track = Math.min(v.track, v.width); v.trailers = [];
    for (const t0 of (Array.isArray(o.trailers) ? o.trailers : []).slice(0, MAX_TRAILERS)) {
      const t = { hitch: fin(t0?.hitch) && Math.abs(t0.hitch) < 30 ? t0.hitch : null, wheelbase: num(t0?.wheelbase, 0.5, 40), front: num(t0?.front, 0, 15), rear: num(t0?.rear, 0, 20), width: num(t0?.width, 0.5, 5), track: num(t0?.track, 0, 5), maxArticulation: num(t0?.maxArticulation, 1, 180) };
      for (const [k, x] of Object.entries(t)) if (x === null) return miss('trailer ' + k);
      t.track = Math.min(t.track, t.width); v.trailers.push(t);
    }
  } else if (kind === 'aircraft') {
    const f = { length: num(o.length, 3, 90), span: num(o.span, 3, 100), noseToMain: num(o.noseToMain, 1, 40), noseToNose: num(o.noseToNose, 0, 20), track: num(o.track, 0.5, 20), fuselage: num(o.fuselage, 0.5, 10), maxNoseSteer: num(o.maxNoseSteer, 1, 89) };
    for (const [k, x] of Object.entries(f)) if (x === null) return miss(k);
    Object.assign(v, f); v.points = [];
    for (const p of (Array.isArray(o.points) ? o.points : []).slice(0, 12)) {
      const q = { name: clean(p?.name, 40), ahead: num(p?.ahead, -80, 80), side: num(p?.side, -60, 60) };
      if (!q.name || q.ahead === null || q.side === null) return miss('point');
      v.points.push(q);
    }
  } else {
    const f = { width: num(o.width, 1, 5), bogies: num(o.bogies, 1, 30), front: num(o.front, 0, 15), rear: num(o.rear, 0, 15), cars: num(o.cars, 1, 8), gap: num(o.gap, 0, 10) };
    for (const [k, x] of Object.entries(f)) if (x === null) return miss(k);
    if (!Number.isInteger(f.cars)) return miss('cars');
    Object.assign(v, f); v.gauge = num(o.gauge, 500, 2000) ?? 1435;
  }
  return v;
}

export function cleanPack(raw) {
  const problems = [];
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || raw.version !== 1) return { ok: false, pack: null, problems: ['not a vehicle pack (format ' + FORMAT + ' version 1)'] };
  const id = clean(raw.id, 64);
  if (!/^[a-z][a-z0-9.-]{1,63}$/.test(id)) return { ok: false, pack: null, problems: ['pack id must be lower case letters, digits, dots and dashes'] };
  const pack = { id, name: clean(raw.name, 80) || id, source: { title: clean(raw.source?.title, 200), note: clean(raw.source?.note, 400) }, vehicles: [] };
  const seen = new Set();
  (Array.isArray(raw.vehicles) ? raw.vehicles : []).slice(0, 200).forEach((o, i) => {
    const v = cleanVehicle(o);
    if (v.error) problems.push('vehicle ' + (i + 1) + (o?.key ? ' (' + clean(o.key, 40) + ')' : '') + ': ' + v.error);
    else if (seen.has(v.key)) problems.push('vehicle ' + v.key + ': duplicate key');
    else { seen.add(v.key); pack.vehicles.push(v); }
  });
  return { ok: pack.vehicles.length > 0, pack, problems };
}

const L = (x, f) => x * f;
/** The vehicle with every length in 'ft' or 'm' (angles stay degrees). Packs are metres. */
export function toUnits(v, units) {
  const f = units === 'ft' ? FT : 1;
  if (v.kind === 'road') return { ...v, width: L(v.width, f), front: L(v.front, f), wheelbase: L(v.wheelbase, f), rear: L(v.rear, f), track: L(v.track, f),
    trailers: v.trailers.map((t) => ({ ...t, hitch: L(t.hitch, f), wheelbase: L(t.wheelbase, f), front: L(t.front, f), rear: L(t.rear, f), width: L(t.width, f), track: L(t.track, f) })) };
  if (v.kind === 'aircraft') return { ...v, length: L(v.length, f), span: L(v.span, f), noseToMain: L(v.noseToMain, f), noseToNose: L(v.noseToNose, f), track: L(v.track, f), fuselage: L(v.fuselage, f),
    points: v.points.map((p) => ({ ...p, ahead: L(p.ahead, f), side: L(p.side, f) })) };
  return { ...v, width: L(v.width, f), bogies: L(v.bogies, f), front: L(v.front, f), rear: L(v.rear, f), gap: L(v.gap, f) };
}
/** The CivilCraft swept path solver's own vehicle for a road vehicle, or for an aircraft's centre body (nose gear steers, main gear is the "rear axle"). */
export function coreVehicle(v, units = 'm') {
  const u = toUnits(v, units);
  if (u.kind === 'road') return { name: u.name, width: u.width, front: u.front, wheelbase: u.wheelbase, rear: u.rear, track: u.track, maxSteer: u.maxSteer, trailers: u.trailers.map((t) => ({ ...t })) };
  if (u.kind === 'aircraft') return { name: u.name, width: u.fuselage, front: u.noseToNose, wheelbase: u.noseToMain, rear: Math.max(0, u.length - u.noseToNose - u.noseToMain), track: u.track, maxSteer: u.maxNoseSteer, trailers: [] };
  return null;
}
