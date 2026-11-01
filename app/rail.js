/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail.js — railway design on an alignment (0.7.1 71.26, owner 2026-10-26: "why doesn't Civil have a rail?"). No DOM; the Node
 * test drives it (bin/test-civilcraft-rail.mjs). Field reference for other modules (the IFC export): docs/apps/civilcraft-rail.md.
 *
 * An alignment with `rail: { on: true, … }` is a track: its curves carry rail transitions (alignment.js TRANSITIONS, `pi.tr`) and an
 * applied cant (`pi.cant`, mm, on the rail-centre distance `base`); with its corridor on, the corridor is built as a track
 * (corridor.js calls trackShape) instead of a road. Every limit below is a PLACEHOLDER the user sets from the railway's own
 * standard — no national table ships (docs/spikes/CV.1-rail.md).
 *
 *   GAUGES                        presets [{ key, mm }]: standard 1435, broad 1520 / 1600 / 1668 / 1676, metre 1000, cape 1067, narrow 762
 *   RAIL_PROFILES                 rail sections by name: dimensions only (h height, head, foot, web in mm; kg per m), as published
 *   SLEEPERS                      materials; railDefaults(units) → the settings below; cleanRail(o, units) (untrusted: the project file)
 *   rail = { on, gauge (mm), base (mm | null = gauge + the rail's head width), tracks (1–6), centres (project units), pivot 'low'|'inner'|'centre',
 *            rail (RAIL_PROFILES key), pad (mm, rail seat), sleeper: { material, length, width, depth, spacing }, ballast: { depth (under the
 *            sleeper at the low rail), shoulder, slope (H:V), crib (the ballast's top below the sleepers' tops) }, sub: { depth, cess (beyond the ballast toe), fall (cross fall, fraction) },
 *            limits: { cant, deficiency, excess (mm), gradient (mm/m), rate (mm/s) }, minSpeed (the slowest trains, the alignment's speed unit) }
 *   equilibriumCant(vKmh, Rm, base = 1500) → mm   E = G·v² / (g·R), G = base (the distance between the rails' centres), g = 9.81 m/s²
 *                                                   (with base 1500 this is the familiar E = 11.8·V² / R, V in km/h, R in m)
 *   cantPlan(alignment, rail, { speed, minSpeed (km/h | null), units, id, name, t }) → { curves, segments, warnings, stations }
 *     curves:   [{ i, piIndex, R, dir 'left'|'right', high 'L'|'R' (the outer rail), cant (mm), eq, deficiency, excess (mm | null),
 *                 rampIn / rampOut: { from, to, len, shape, onTransition, gradient (mm/m, steepest), rate (mm/s | null) } | null }]
 *     segments: the cant along the whole alignment in order, IFC 4.3 IfcAlignmentCantSegment's fields:
 *               [{ start (station), length, type 'CONSTANTCANT'|'LINEARTRANSITION'|'BLOSSCURVE'|'HELMERTCURVE'|'COSINECURVE'|'SINECURVE',
 *                  startCant, endCant (applied, mm), startLeft, startRight, endLeft, endRight (each rail's height over the profile, mm) }]
 *     warnings: the shared Problems shape (problems-civilcraft.js maps them): { code, severity, text, hard: false, msg: { key, vars },
 *               ref (alignment id), about: { kind: 'alignment', id }, part, limit, value, unit }
 *               codes rail.cant.max, rail.cant.deficiency, rail.cant.excess, rail.cant.gradient, rail.cant.rate, rail.cant.notransition,
 *               rail.cant.overlap, rail.speed.none (a note)
 *   cantAt(plan, sta, pivot) → { E (applied, mm), L, R (mm above the profile) }
 *   rampShape(kind) / RAMP_PEAK: the cant follows the curvature: linear for the clothoid and the cubic parabola, Bloss-shaped for Bloss …
 *   trackShape(rail, { hL, hR }, units) → the section square to the alignment, offsets o (right +) and z from the profile, project units:
 *     { tracks: [{ c, rails: [{o, z}×2] (head centres), sleeper: [{o, z}×4] (top-left, top-right, bottom-right, bottom-left), slope (dz/do),
 *       below (rail + pad: the head to the sleeper's top) }],
 *       top: { L, R } (the ballast top from the centre out: CL, sleeper ends SLP…, BSH (ballast shoulder), BTOE (toe), CESS; each { o, z, code }),
 *       ballast (polygon), sub (polygon), areas: { ballast, sub } }
 *   trackQuantities(sections, rail, units) → { length, tracks: [{ c, length, sleepers, rail }], sleepers, railLength, sleeperVolume,
 *       ballastGross, ballast (net of the sleepers' part below the ballast top), sub }
 *   railSceneItems(items, { unitPerMm }) → plan items: each rail (C-RAIL-TRAK), track centres when more than one (C-RAIL-CNTR)
 */

import { cleanStd, cleanCites } from './rail-standard.js';   // 0.8 CV.1 (civil_PART_4)
import { t as tr } from './i18n.js';
import { LAYERS } from './scene.js';

// the plan's track layers (screen, DXF, DWG, PDF, sheets)
if (!LAYERS.some((l) => l.name === 'C-RAIL-TRAK')) LAYERS.push({ name: 'C-RAIL-TRAK', token: 'major', aci: 7, get label() { return tr('scene.layer.railtrak'); } }, { name: 'C-RAIL-CNTR', token: 'red', aci: 1, get label() { return tr('scene.layer.railcntr'); } });

export const GAUGES = [
  { key: 'standard', mm: 1435 }, { key: 'broad1520', mm: 1520 }, { key: 'broad1600', mm: 1600 }, { key: 'broad1668', mm: 1668 },
  { key: 'broad1676', mm: 1676 }, { key: 'metre', mm: 1000 }, { key: 'cape', mm: 1067 }, { key: 'narrow762', mm: 762 },
];
/** Rail sections: overall height h, head width, foot width, web thickness (mm) and mass (kg/m). Published dimensions only (EN 13674-1
 *  for the E profiles, the AREMA manual's tables for the RE ones; facts, no drawing copied): the 3D view and the track depth use them. */
export const RAIL_PROFILES = {
  '60E1': { h: 172, head: 72, foot: 150, web: 16.5, kg: 60.21 },
  '54E1': { h: 159, head: 70, foot: 140, web: 16, kg: 54.77 },
  '49E1': { h: 149, head: 67, foot: 125, web: 14, kg: 49.39 },
  '115RE': { h: 168.3, head: 69.1, foot: 139.7, web: 15.9, kg: 56.9 },
  '136RE': { h: 185.7, head: 74.6, foot: 152.4, web: 17.5, kg: 67.6 },
};
export const SLEEPERS = ['concrete', 'timber', 'steel', 'composite'];
export const PIVOTS = ['low', 'inner', 'centre'];
export const MAX_TRACKS = 6;
const G = 9.81;
const KMH_PER_MPH = 1.609344;
const M_PER_FT = 1200 / 3937;   // US survey foot, as units.js

/** Placeholders to start from, in the project's units (not a standard: the help says so). */
export function railDefaults(units = 'ft') {
  const m = units === 'm';
  return {
    on: true, gauge: 1435, base: null, tracks: 1, centres: m ? 4.0 : 14, pivot: 'low', rail: m ? '60E1' : '115RE', pad: 10,
    sleeper: m ? { material: 'concrete', length: 2.6, width: 0.28, depth: 0.22, spacing: 0.6 } : { material: 'timber', length: 8.5, width: 0.75, depth: 0.583, spacing: 1.625 },
    ballast: m ? { depth: 0.3, shoulder: 0.4, slope: 1.5, crib: 0.03 } : { depth: 1, shoulder: 1, slope: 1.5, crib: 0.1 },
    sub: m ? { depth: 0.2, cess: 0.6, fall: 0.03 } : { depth: 0.5, cess: 2, fall: 0.03 },
    limits: m ? { cant: 160, deficiency: 130, excess: 110, gradient: 2.25, rate: 55 } : { cant: 152, deficiency: 76, excess: 76, gradient: 2.1, rate: 50 },
    minSpeed: null, std: 'none', cites: {},
  };
}

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (v, d, lo, hi) => (fin(v) && v >= lo && v <= hi ? v : d);
/** The rail settings of an untrusted object (the project file), or null. */
export function cleanRail(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const d = railDefaults(units), big = units === 'm' ? 1 : 3.28084;
  const sl = o.sleeper && typeof o.sleeper === 'object' ? o.sleeper : {}, bl = o.ballast && typeof o.ballast === 'object' ? o.ballast : {}, sb = o.sub && typeof o.sub === 'object' ? o.sub : {}, li = o.limits && typeof o.limits === 'object' ? o.limits : {};
  return {
    on: o.on === true,
    gauge: num(o.gauge, d.gauge, 500, 2000), base: fin(o.base) && o.base >= 500 && o.base <= 2200 ? o.base : null,
    tracks: Number.isInteger(o.tracks) && o.tracks >= 1 && o.tracks <= MAX_TRACKS ? o.tracks : 1,
    centres: num(o.centres, d.centres, 2 * big, 20 * big), pivot: PIVOTS.includes(o.pivot) ? o.pivot : 'low',
    rail: Object.hasOwn(RAIL_PROFILES, o.rail) ? o.rail : d.rail, pad: num(o.pad, d.pad, 0, 100),
    sleeper: { material: SLEEPERS.includes(sl.material) ? sl.material : d.sleeper.material, length: num(sl.length, d.sleeper.length, 0.5 * big, 6 * big), width: num(sl.width, d.sleeper.width, 0.05 * big, 1 * big), depth: num(sl.depth, d.sleeper.depth, 0.05 * big, 1 * big), spacing: num(sl.spacing, d.sleeper.spacing, 0.2 * big, 3 * big) },
    ballast: { depth: num(bl.depth, d.ballast.depth, 0, 2 * big), shoulder: num(bl.shoulder, d.ballast.shoulder, 0, 3 * big), slope: num(bl.slope, d.ballast.slope, 0.5, 10), crib: num(bl.crib, d.ballast.crib, 0, 0.2 * big) },
    sub: { depth: num(sb.depth, d.sub.depth, 0, 2 * big), cess: num(sb.cess, d.sub.cess, 0, 10 * big), fall: num(sb.fall, d.sub.fall, 0, 0.2) },
    limits: { cant: num(li.cant, d.limits.cant, 0, 300), deficiency: num(li.deficiency, d.limits.deficiency, 0, 400), excess: num(li.excess, d.limits.excess, 0, 400), gradient: num(li.gradient, d.limits.gradient, 0.1, 20), rate: num(li.rate, d.limits.rate, 1, 500) },
    minSpeed: fin(o.minSpeed) && o.minSpeed > 0 && o.minSpeed < 1000 ? o.minSpeed : null,
    std: cleanStd(o.std), cites: cleanCites(o.cites),   // 0.8 CV.1: which standard the placeholders are for, and the clause the person entered beside each
  };
}

/** The distance between the rails' centres (mm): set, or the gauge + the rail's head width. */
export const baseOf = (rail) => (fin(rail?.base) ? rail.base : (rail?.gauge || 1435) + (RAIL_PROFILES[rail?.rail]?.head || 72));
/** A speed in the alignment's unit → km/h. */
export const kmh = (v, unit) => (fin(v) && v > 0 ? (unit === 'mph' ? v * KMH_PER_MPH : v) : null);
/** Project length → metres (US survey feet for ft projects). */
export const toM = (v, units) => (units === 'm' ? v : v * M_PER_FT);
/** A length in metres (a cant in mm ÷ a gradient in mm/m) → project units. */
const toProj = (m, units) => (units === 'm' ? m : m / M_PER_FT);
/** mm → project units. */
export const mmTo = (v, units) => (units === 'm' ? v / 1000 : v / 1000 / M_PER_FT);

export function equilibriumCant(vKmh, Rm, base = 1500) {
  if (!(vKmh > 0) || !(Rm > 0)) return 0;
  const v = vKmh / 3.6;
  return (base * v * v) / (G * Rm);
}

/** The cant ramp's shape g(u) (0 → 1) for a transition kind: the cant follows the curvature. */
export function rampShape(kind) {
  switch (kind) {
    case 'bloss': return (u) => u * u * (3 - 2 * u);
    case 'helmert': return (u) => (u <= 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2);
    case 'sinehalf': return (u) => (1 - Math.cos(Math.PI * u)) / 2;
    case 'sine': return (u) => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI);
    default: return (u) => u;   // clothoid, cubic parabola, a ramp on the straight
  }
}
/** The steepest slope of each shape over a ramp of length 1 (× cant / length = the steepest cant gradient). */
export const RAMP_PEAK = { linear: 1, bloss: 1.5, helmert: 2, sinehalf: Math.PI / 2, sine: 2 };
const SHAPE_OF = { clothoid: 'linear', cubic: 'linear', bloss: 'bloss', helmert: 'helmert', sinehalf: 'sinehalf', sine: 'sine' };
/** IFC 4.3 IfcAlignmentCantSegmentTypeEnum per ramp shape. */
export const CANT_TYPES = { linear: 'LINEARTRANSITION', bloss: 'BLOSSCURVE', helmert: 'HELMERTCURVE', sinehalf: 'COSINECURVE', sine: 'SINECURVE' };

/** Each rail's height (mm) over the profile for a signed cant c (+ = the right rail higher) on a curve whose outer side is `high`. */
function heights(E, high, pivot) {
  const c = high === 'R' ? E : -E;
  if (pivot === 'centre') return { L: -c / 2, R: c / 2 };
  if (pivot === 'inner') return high === 'R' ? { L: 0, R: E } : { L: E, R: 0 };   // the inner rail stays; a negative cant lowers the outer
  return { L: Math.max(0, -c), R: Math.max(0, c) };   // 'low': the lower rail stays on the profile
}

export function cantPlan(al, rail, { speed = null, minSpeed = null, units = 'm', id = '', name = '', t = tr } = {}) {
  const curves = [], warnings = [], segments = [], stations = [];
  if (!al?.ok || !rail?.on) return { curves, segments, warnings, stations };
  const L = rail.limits || railDefaults(units).limits, base = baseOf(rail), U = units === 'm' ? 'm' : 'ft';
  const v = speed > 0 ? speed / 3.6 : null;   // m/s
  const n1 = (x) => String(Math.round(x * 10) / 10), n2 = (x) => String(Math.round(x * 100) / 100);
  const warn = (code, severity, part, vars, extra = {}) => {
    const msg = { key: code, vars: { name, ...vars } };
    warnings.push({ code, severity, text: t(code, msg.vars), hard: false, msg, ref: id, about: { kind: 'alignment', id }, part, ...extra });
  };
  const recs = al.curves || [];
  recs.forEach((c, k) => {
    const pi = al.pis?.[c.piIndex] || {}, E = fin(pi.cant) ? pi.cant : 0, kind = c.tr || 'clothoid';
    const dir = c.ccw ? 'left' : 'right', high = c.ccw ? 'R' : 'L';
    const Rm = toM(c.r, units), eq = v ? equilibriumCant(speed, Rm, base) : null, eqMin = minSpeed > 0 ? equilibriumCant(minSpeed, Rm, base) : null;
    const rec = { i: k + 1, piIndex: c.piIndex, R: c.r, dir, high, cant: E, eq, deficiency: eq === null ? null : eq - E, excess: eqMin === null ? null : E - eqMin, tr: kind, ts: c.ts, sc: c.sc, cs: c.cs, st: c.st, rampIn: null, rampOut: null };
    const part = 'pi' + (c.piIndex + 1);
    if (E !== 0) {
      // the ramps: over the transition (shaped like its curvature), or, with none at that end, on the straight before / after the
      // curve, linear, as long as the gradient limit needs (said: the cant then changes where the curvature does not)
      const ramp = (end, on, from, to) => {
        const len = to - from, shape = on ? SHAPE_OF[kind] || 'linear' : 'linear';
        const gradient = len > 1e-9 ? (Math.abs(E) / toM(len, units)) * RAMP_PEAK[shape] : Infinity;
        return { end, from, to, len, shape, onTransition: on, gradient, rate: v ? gradient * v : null };
      };
      rec.rampIn = c.ls1 > 0 ? ramp('in', true, c.ts, c.sc) : ramp('in', false, c.ts - toProj(Math.abs(E) / L.gradient, units), c.ts);
      rec.rampOut = c.ls2 > 0 ? ramp('out', true, c.cs, c.st) : ramp('out', false, c.st, c.st + toProj(Math.abs(E) / L.gradient, units));
      for (const r of [rec.rampIn, rec.rampOut]) {
        stations.push(r.from, r.to);
        if (!r.onTransition) warn('rail.cant.notransition', 'warning', part + '-' + r.end, { pi: c.piIndex + 1, cant: n1(E), len: n2(r.len), u: U, end: r.end === 'in' ? 'TS' : 'ST' });
        if (r.gradient > L.gradient + 1e-9) warn('rail.cant.gradient', 'warning', part + '-' + r.end, { pi: c.piIndex + 1, end: r.end === 'in' ? 'TS' : 'ST', g: n2(r.gradient), max: n2(L.gradient) }, { limit: L.gradient, value: r.gradient, unit: 'mm/m' });
        if (r.rate !== null && r.rate > L.rate + 1e-9) warn('rail.cant.rate', 'warning', part + '-' + r.end, { pi: c.piIndex + 1, end: r.end === 'in' ? 'TS' : 'ST', r: n1(r.rate), max: n1(L.rate) }, { limit: L.rate, value: r.rate, unit: 'mm/s' });
      }
    }
    if (Math.abs(E) > L.cant + 1e-9) warn('rail.cant.max', 'warning', part, { pi: c.piIndex + 1, cant: n1(E), max: n1(L.cant) }, { limit: L.cant, value: Math.abs(E), unit: 'mm' });
    if (rec.deficiency !== null && rec.deficiency > L.deficiency + 1e-9) warn('rail.cant.deficiency', 'warning', part, { pi: c.piIndex + 1, d: n1(rec.deficiency), max: n1(L.deficiency), eq: n1(eq), cant: n1(E) }, { limit: L.deficiency, value: rec.deficiency, unit: 'mm' });
    if (rec.excess !== null && rec.excess > L.excess + 1e-9) warn('rail.cant.excess', 'warning', part, { pi: c.piIndex + 1, x: n1(rec.excess), max: n1(L.excess), eq: n1(eqMin), cant: n1(E) }, { limit: L.excess, value: rec.excess, unit: 'mm' });
    curves.push(rec);
  });
  if (!v && curves.length) warn('rail.speed.none', 'note', '', {});
  // neighbouring curves whose ramps overlap
  for (let k = 1; k < curves.length; k++) {
    const a = curves[k - 1], b = curves[k], aEnd = a.rampOut ? a.rampOut.to : a.st, bStart = b.rampIn ? b.rampIn.from : b.ts;
    if ((a.cant || b.cant) && bStart < aEnd - 1e-9) warn('rail.cant.overlap', 'warning', 'pi' + (a.piIndex + 1) + '-' + (b.piIndex + 1), { a: a.piIndex + 1, b: b.piIndex + 1 });
  }
  const plan = { curves, segments, warnings, stations, pivot: rail.pivot || 'low', start: al.start, end: al.end };
  // the segments, in order; where ramps overlap the later piece starts where the earlier ends
  const pieces = [];
  for (const c of curves) {
    if (!c.cant) continue;
    const ri = c.rampIn, ro = c.rampOut;
    pieces.push({ from: ri.from, to: ri.to, shape: ri.shape, e0: 0, e1: c.cant, c }, { from: ri.to, to: ro.from, shape: null, e0: c.cant, e1: c.cant, c }, { from: ro.from, to: ro.to, shape: ro.shape, e0: c.cant, e1: 0, c });
  }
  let at = al.start;
  const seg = (from, to, type, e0, e1, high) => {
    const a = Math.max(from, al.start), b = Math.min(to, al.end);
    if (!(b - a > 1e-9)) return;
    const h0 = heights(e0, high, plan.pivot), h1 = heights(e1, high, plan.pivot);
    segments.push({ start: a, length: b - a, type, startCant: e0, endCant: e1, startLeft: h0.L, startRight: h0.R, endLeft: h1.L, endRight: h1.R, high });
  };
  for (const p of pieces) {
    const from = Math.max(p.from, at);
    if (from > at + 1e-9) seg(at, from, 'CONSTANTCANT', 0, 0, p.c.high);
    if (p.to - from > 1e-9) {
      // a ramp cut short by the one before starts where that one ended, at the cant this ramp has there
      const g = p.shape ? rampShape(p.shape) : null, val = (s) => (g ? p.e0 + (p.e1 - p.e0) * g(Math.min(1, Math.max(0, (s - p.from) / (p.to - p.from)))) : p.e0);
      seg(from, p.to, p.shape ? CANT_TYPES[p.shape] : 'CONSTANTCANT', val(from), val(p.to), p.c.high);
    }
    at = Math.max(at, p.to);
  }
  if (al.end > at + 1e-9) seg(at, al.end, 'CONSTANTCANT', 0, 0, curves[curves.length - 1]?.high || 'L');
  return plan;
}

/** The applied cant and each rail's height at a station. */
export function cantAt(plan, sta) {
  for (const s of plan?.segments || []) {
    if (sta < s.start - 1e-9 || sta > s.start + s.length + 1e-9) continue;
    if (s.type === 'CONSTANTCANT') return { E: s.startCant, L: s.startLeft, R: s.startRight };
    const shape = Object.keys(CANT_TYPES).find((k) => CANT_TYPES[k] === s.type), g = rampShape(shape);
    // the segment may be a ramp cut short: map back to the ramp's own u through its curve record
    const c = plan.curves.find((x) => x.rampIn && sta >= x.rampIn.from - 1e-9 && sta <= x.rampIn.to + 1e-9 && CANT_TYPES[x.rampIn.shape] === s.type) || plan.curves.find((x) => x.rampOut && sta >= x.rampOut.from - 1e-9 && sta <= x.rampOut.to + 1e-9 && CANT_TYPES[x.rampOut.shape] === s.type);
    let E;
    if (c) {
      const inn = c.rampIn && sta >= c.rampIn.from - 1e-9 && sta <= c.rampIn.to + 1e-9, r = inn ? c.rampIn : c.rampOut, u = (sta - r.from) / Math.max(r.len, 1e-12);
      E = c.cant * (inn ? g(u) : 1 - g(u));
    } else E = s.startCant + ((s.endCant - s.startCant) * (sta - s.start)) / Math.max(s.length, 1e-12);
    const h = heights(E, s.high, plan.pivot);
    return { E, L: h.L, R: h.R };
  }
  return { E: 0, L: 0, R: 0 };
}

/**
 * The track's cross section square to the alignment (offsets o right +, z from the profile's elevation; project units). The rails'
 * heads sit at hL, hR (mm) over the profile, ±base/2 from each track's centre; the sleeper lies parallel to them, the rail + pad
 * below; the ballast bed is filled to `crib` under the sleepers' tops, its shoulder level out to `shoulder` past the sleeper end, then the
 * ballast slope down to the sub-ballast, whose top falls away from the centre at `fall` and lies `ballast.depth` under the sleeper
 * at the lowest low rail; the sub-ballast runs `cess` past the ballast toe, `sub.depth` thick. The formation (its bottom) is not
 * tilted by the cant; the track is.
 */
export function trackShape(rail, { hL = 0, hR = 0 } = {}, units = 'm') {
  const mm = (v) => mmTo(v, units), P = RAIL_PROFILES[rail.rail] || RAIL_PROFILES['60E1'];
  const base = mm(baseOf(rail)), n = rail.tracks || 1, S = rail.sleeper, B = rail.ballast, SB = rail.sub;
  const below = mm(P.h + (rail.pad || 0));   // rail head to the sleeper's top
  const slope = (mm(hR) - mm(hL)) / base;    // dz / do across the track
  const tracks = [];
  for (let k = 0; k < n; k++) {
    const c = (k - (n - 1) / 2) * rail.centres;
    const zl = mm(hL), plane = (o) => zl + (o - (c - base / 2)) * slope - below;   // the sleeper's top
    const a = c - S.length / 2, b = c + S.length / 2;
    const lowO = hL <= hR ? c - base / 2 : c + base / 2;
    tracks.push({ c, slope, below, rails: [{ o: c - base / 2, z: mm(hL) }, { o: c + base / 2, z: mm(hR) }], sleeper: [{ o: a, z: plane(a) }, { o: b, z: plane(b) }, { o: b, z: plane(b) - S.depth }, { o: a, z: plane(a) - S.depth }], plane, lowO, under: plane(lowO) - S.depth });
  }
  // the sub-ballast's top: z0 − |o|·fall, ballast.depth under the sleeper at each track's low rail (the deepest one decides)
  const z0 = Math.min(...tracks.map((k) => k.under - B.depth + Math.abs(k.lowO) * SB.fall));
  const sbTop = (o) => z0 - Math.abs(o) * SB.fall;
  // the ballast top from the centre out, each side
  const crib = B.crib || 0;   // the ballast's top lies this far under the sleepers' tops (they stand proud of it)
  const ends = tracks.flatMap((k) => [{ o: k.sleeper[0].o, z: k.sleeper[0].z - crib }, { o: k.sleeper[1].o, z: k.sleeper[1].z - crib }]);
  const topAt0 = () => {
    const on = tracks.find((k) => k.sleeper[0].o <= 1e-9 && k.sleeper[1].o >= -1e-9);
    if (on) return on.plane(0) - crib;
    const l = ends.filter((e) => e.o < 0).sort((p, q) => q.o - p.o)[0], r = ends.filter((e) => e.o > 0).sort((p, q) => p.o - q.o)[0];
    return l && r ? l.z + ((r.z - l.z) * (0 - l.o)) / (r.o - l.o) : (l || r).z;
  };
  const top = {}, tz = topAt0();
  for (const [side, sx] of [['L', -1], ['R', 1]]) {
    const out = [{ o: 0, z: tz, code: 'CL' }];
    const mine = ends.filter((e) => e.o * sx > 1e-9).sort((p, q) => Math.abs(p.o) - Math.abs(q.o));
    mine.forEach((e, i) => out.push({ o: e.o, z: e.z, code: i ? 'SLP' + (i + 1) : 'SLP' }));
    const last = mine.length ? mine[mine.length - 1] : { o: 0, z: tz };
    const bsh = { o: last.o + sx * B.shoulder, z: last.z, code: 'BSH' };
    // down the ballast slope to the sub-ballast top: bsh.z − d/slope = z0 − (|bsh.o| + d)·fall
    const d = Math.max(0, (bsh.z - z0 + Math.abs(bsh.o) * SB.fall) / Math.max(1 / B.slope - SB.fall, 1e-6));
    const toe = { o: bsh.o + sx * d, z: sbTop(bsh.o + sx * d), code: 'BTOE' };
    const cess = { o: toe.o + sx * SB.cess, z: sbTop(toe.o + sx * SB.cess), code: 'CESS' };
    out.push(bsh, toe, cess);
    top[side] = out;
  }
  // the ballast: its top (toe, shoulder, sleeper ends …, shoulder, toe), its bottom along the sub-ballast top (with the crown)
  const Lr = top.L.slice().reverse(), Rr = top.R;
  const tL = Lr.filter((q) => q.code !== 'CESS'), tR = Rr.filter((q) => q.code !== 'CESS' && q.code !== 'CL');
  const ballast = [...tL.map(({ o, z }) => ({ o, z })), ...tR.map(({ o, z }) => ({ o, z }))];
  const toeL = top.L.find((q) => q.code === 'BTOE'), toeR = top.R.find((q) => q.code === 'BTOE');
  ballast.push({ o: 0, z: z0 });   // the crown of the sub-ballast under it (after the right toe, before closing at the left toe)
  const cL = top.L.find((q) => q.code === 'CESS'), cR = top.R.find((q) => q.code === 'CESS');
  const sub = [{ o: cL.o, z: cL.z }, { o: 0, z: z0 }, { o: cR.o, z: cR.z }, { o: cR.o, z: cR.z - SB.depth }, { o: 0, z: z0 - SB.depth }, { o: cL.o, z: cL.z - SB.depth }];
  void toeL; void toeR;
  return { tracks: tracks.map(({ plane, lowO, under, ...k }) => k), top, ballast, sub, areas: { ballast: Math.abs(area(ballast)), sub: Math.abs(area(sub)) }, z0 };
}
function area(P) { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a.o * b.z - b.o * a.z; } return s / 2; }

/** Quantities from the corridor's sections (each with `track` from corridor.js): average end areas between sections, track and rail
 *  lengths along each track's own line (shorter inside a curve), sleepers every `spacing` along each track. */
export function trackQuantities(sections, rail, units = 'm') {
  const secs = (sections || []).filter((s) => s.track);
  const n = rail?.tracks || 1, out = { length: 0, tracks: [], sleepers: 0, railLength: 0, sleeperVolume: 0, ballastGross: 0, ballast: 0, sub: 0 };
  if (secs.length < 2) return out;
  out.length = secs[secs.length - 1].sta - secs[0].sta;
  for (let i = 1; i < secs.length; i++) {
    const a = secs[i - 1].track, b = secs[i].track, ds = secs[i].sta - secs[i - 1].sta;
    out.ballastGross += ((a.shape.areas.ballast + b.shape.areas.ballast) / 2) * ds;
    out.sub += ((a.shape.areas.sub + b.shape.areas.sub) / 2) * ds;
  }
  const S = rail.sleeper, world = (sec, o) => ({ x: sec.track.p.x + sec.track.r.x * o, y: sec.track.p.y + sec.track.r.y * o });
  for (let k = 0; k < n; k++) {
    let len = 0, rl = 0;
    for (let i = 1; i < secs.length; i++) {
      const A = secs[i - 1].track.shape.tracks[k], B = secs[i].track.shape.tracks[k];
      const p = world(secs[i - 1], A.c), q = world(secs[i], B.c);
      len += Math.hypot(q.x - p.x, q.y - p.y);
      for (let j = 0; j < 2; j++) { const u = world(secs[i - 1], A.rails[j].o), w = world(secs[i], B.rails[j].o); rl += Math.hypot(w.x - u.x, w.y - u.y); }
    }
    const sleepers = Math.floor(len / S.spacing + 1e-9) + 1;
    out.tracks.push({ c: secs[0].track.shape.tracks[k].c, length: len, sleepers, rail: rl });
    out.sleepers += sleepers; out.railLength += rl;
  }
  out.sleeperVolume = out.sleepers * S.length * S.width * S.depth;
  out.ballast = Math.max(0, out.ballastGross - out.sleepers * S.length * S.width * Math.max(0, S.depth - (rail.ballast?.crib || 0)));   // the part of each sleeper in the bed
  void units;
  return out;
}

/** Plan items: each rail (C-RAIL-TRAK) and, with more than one track, each track's centre (C-RAIL-CNTR, dashed). */
export function railSceneItems(items) {
  const out = [];
  for (const it of items || []) {
    const secs = (it.sections || []).filter((s) => s.track);
    if (secs.length < 2) continue;
    const nT = secs[0].track.shape.tracks.length;
    const at = (sec, o) => ({ x: sec.track.p.x + sec.track.r.x * o, y: sec.track.p.y + sec.track.r.y * o });
    for (let k = 0; k < nT; k++) {
      for (let j = 0; j < 2; j++) out.push({ layer: 'C-RAIL-TRAK', kind: 'poly', pts: secs.map((s) => at(s, s.track.shape.tracks[k].rails[j].o)) });
      if (nT > 1) out.push({ layer: 'C-RAIL-CNTR', kind: 'poly', dashed: true, pts: secs.map((s) => at(s, s.track.shape.tracks[k].c)) });
    }
  }
  return out;
}
