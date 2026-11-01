/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dispersion.js — air dispersion screening and hourly Gaussian modelling for stacks (0.8 Track CH, CH.19; DOM-free).
 * Published methods only (Pasquill-Gifford classes, Briggs sigmas and plume rise as collected in Turner's Workbook and the EPA user's guides), typed WITHOUT the
 * documents open, so every table below is listed in SOURCES with `check: 'not confirmed'` and no result is presented as EPA's. A drafting and study aid, not a
 * permit model and not an engineering approval. The plume equation itself is the shared core in ./plume.js (one copy, also used by CH.16).
 *
 *   Stability    stabilityClass({ u10, day, insolation, cloud })   windAt(u10, z, stab, terrain)
 *   Plume rise   plumeRise(stack, { u, stab, Ta, x })               Briggs buoyant + momentum, stable form for E and F, stack-tip downwash
 *   Stacks       stackFromStream(th, stream, { hs, d, species })    a stack from a flowsheet stream (CH.2): velocity, temperature, g/s per species
 *   Screening    screen(source, opts)                               worst case over a class x wind-speed grid (the structure of a screening run)
 *   Refined      hourly(sources, receptors, hours, opts)            hour-by-hour concentrations at receptors: 1-h maximum, high second high, period mean, rolling means
 *   Plan         toPlan(source, level, opts)                        contour polygon(s) in site coordinates for a CivilCraft site plan
 *   Limits       checkLimits(results, pack)                         Problems against a pack the person typed (nothing bundled but a made-up test pack)
 *   Engine       AERMOD_ENGINE, SPIKE                               what the AERMOD spike found (docs/0.8-sessions/chem-env_PART_3.md)
 *
 * NOT built: building downwash (BPIP), terrain and receptor heights, deposition, chemistry, area/volume/line sources, fumigation, calm handling beyond
 * "skipped and counted", the AERMOD boundary-layer scaling (Obukhov length, convective velocity) — this is a stability-class model, not AERMOD.
 */
import { plumeConc, plumeFootprint, STABILITY, SOURCES as PLUME_SOURCES } from './plume.js';
import { problem as baseProblem } from '../report.js';
import { R } from '../data.js';

export { STABILITY };
export const REVIEW = { state: 'not confirmed', note: 'Typed without the documents open. A person with Turner\'s Workbook / the EPA user\'s guide must compare each table before any regulatory use.' };
export const SOURCES = {
  plume: PLUME_SOURCES.plume, briggs: PLUME_SOURCES.briggs, lid: PLUME_SOURCES.lid,
  pasquill: 'Pasquill-Gifford stability classes by surface wind speed, insolation (day) or cloud cover (night), as tabulated in Turner\'s Workbook: day strong A, A-B, B, C, C; moderate A-B, B, B-C, C-D, D; slight B, C, C, D, D (wind bins <2, 2-3, 3-5, 5-6, >6 m/s); night cloud >=4/8 -, E, D, D, D; cloud <=3/8 F, F, E, D, D. A pair such as A-B takes its FIRST letter (stated in the result)',
  profile: 'Wind power law u = u10 (z/10)^p, rural p = 0.07 0.07 0.10 0.15 0.35 0.55 and urban p = 0.15 0.15 0.20 0.25 0.30 0.30 for A to F (EPA screening convention)',
  rise: 'Briggs plume rise: Fb = g vs d^2 (Ts - Ta)/(4 Ts); Fb < 55: dh = 21.425 Fb^0.75/u, else 38.71 Fb^0.6/u (final, neutral and unstable); stable (E, F): dh = 2.6 (Fb/(u s))^(1/3), s = g/Ta dtheta/dz with 0.02 (E) and 0.035 (F) K/m; transitional dh = 1.6 Fb^(1/3) x^(2/3)/u; momentum dh = 3 d vs/u when Fb = 0; stack-tip downwash h\' = hs + 2 d (vs/u - 1.5) when vs < 1.5 u',
  met: 'Screening meteorology grid (class: wind speeds at 10 m): A 1-3, B 1-5, C 1-10, D 1-20, E 1-5, F 1-4 m/s, in the steps of GRID below. A typed simplification of the usual screening grid',
  averaging: 'Screening averaging-time multipliers on the 1-hour maximum: 3 h 0.9, 8 h 0.7, 24 h 0.4, annual 0.08 (the usual screening guidance values; they carry a range and the person may replace them)',
};
const G = 9.80665;
const P_EXP = { rural: [0.07, 0.07, 0.10, 0.15, 0.35, 0.55], urban: [0.15, 0.15, 0.20, 0.25, 0.30, 0.30] };
const GRID = { A: [1, 1.5, 2, 2.5, 3], B: [1, 1.5, 2, 3, 4, 5], C: [1, 2, 3, 5, 7, 10], D: [1, 2, 3, 5, 7, 10, 15, 20], E: [1, 2, 3, 4, 5], F: [1, 2, 3, 4] };
export const AVERAGING = { 1: 1, 3: 0.9, 8: 0.7, 24: 0.4, annual: 0.08 };
const SRC = { kind: 'engine', name: 'process.env' };
export const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('air.' + code, severity, text, about, extra); p.source = SRC; return p; };

/** Pasquill-Gifford class. day: boolean; insolation 'strong'|'moderate'|'slight' (day); cloud 0..1 fraction of the sky (night). → { stab, pair, note } */
export function stabilityClass({ u10, day, insolation = 'moderate', cloud = 0.5 }) {
  if (!(u10 >= 0)) throw new Error('Give the wind speed at 10 m.');
  const bin = u10 < 2 ? 0 : u10 < 3 ? 1 : u10 < 5 ? 2 : u10 < 6 ? 3 : 4;
  const T = day ? { strong: ['A', 'A-B', 'B', 'C', 'C'], moderate: ['A-B', 'B', 'B-C', 'C-D', 'D'], slight: ['B', 'C', 'C', 'D', 'D'] }[insolation]
    : cloud >= 0.5 ? ['E', 'E', 'D', 'D', 'D'] : ['F', 'F', 'E', 'D', 'D'];
  if (!T) throw new Error('Insolation is strong, moderate or slight.');
  const pair = T[bin]; let note = '';
  if (!day && cloud >= 0.5 && bin === 0) note = 'The table has no entry for a cloudy night below 2 m/s; E is used.';
  return { stab: pair[0], pair, note: pair.length > 1 ? 'Class ' + pair + ' takes ' + pair[0] + '.' : note };
}
/** Wind speed (m/s) at height z from the 10 m value (power law). */
export function windAt(u10, z, stab, terrain = 'rural') { return u10 * Math.pow(Math.max(z, 1) / 10, (P_EXP[terrain] || P_EXP.rural)[STABILITY.indexOf(stab)]); }

/** Effective release height. stack { hs, d, vs, Ts }; opts { u (at stack top), stab, Ta, x (m, for the transitional rise; omit for the final rise), dthetadz }.
 *  → { H, dh, hs, Fb, downwash, kind } */
export function plumeRise(stack, { u, stab = 'D', Ta = 293.15, x = null, dthetadz = null } = {}) {
  const { hs, d, vs, Ts } = stack;
  if (!(hs >= 0 && d > 0 && vs >= 0 && Ts > 0 && u > 0)) throw new Error('A stack needs height, diameter, exit velocity and temperature, and the wind must be above zero.');
  let h = hs, downwash = 0;
  if (vs < 1.5 * u) { downwash = 2 * d * (1.5 - vs / u); h = hs - downwash; }          // stack-tip downwash: h' = hs + 2d(vs/u - 1.5)
  const Fb = Ts > Ta ? G * vs * d * d * (Ts - Ta) / (4 * Ts) : 0;
  let dh, kind;
  if (Fb > 0) {
    if (stab === 'E' || stab === 'F') { const s = G / Ta * (dthetadz ?? (stab === 'E' ? 0.02 : 0.035)); dh = 2.6 * Math.cbrt(Fb / (u * s)); kind = 'buoyant stable'; }
    else { dh = Fb < 55 ? 21.425 * Math.pow(Fb, 0.75) / u : 38.71 * Math.pow(Fb, 0.6) / u; kind = 'buoyant'; }
    if (x != null && x > 0) dh = Math.min(dh, 1.6 * Math.cbrt(Fb) * Math.pow(x, 2 / 3) / u);
  } else { dh = 3 * d * vs / u; kind = 'momentum'; }
  return { H: Math.max(h, 0) + dh, dh, hs, Fb, downwash, kind };
}

/** A stack from a flowsheet stream (CH.2): `th` the Thermo of the flowsheet, `stream` {T K, P Pa, F mol/s, z[]}; species = ids to report (g/s each).
 *  Gas volume flow by the ideal gas law (the stack is near atmospheric pressure); exit velocity from the diameter. */
export function stackFromStream(th, stream, { hs, d, species = [], id = 'stack', x = 0, y = 0 } = {}) {
  if (!(hs >= 0 && d > 0)) throw new Error('Give the stack height and inner diameter.');
  const vol = stream.F * R * stream.T / stream.P, vs = vol / (Math.PI * d * d / 4), Q = {};
  for (const sp of species) { const i = th.ids.indexOf(sp); if (i < 0) throw new Error('Component ' + sp + ' is not in the flowsheet.'); Q[sp] = stream.F * stream.z[i] * th.c[i].MW; }   // MW g/mol -> g/s
  return { id, x, y, hs, d, vs, Ts: stream.T, vol, Q, from: 'stream' };
}

function atDistance(source, species, ctx, x, y = 0, z = 0) {
  const { u10, stab, terrain, Ta, zi } = ctx;
  const u0 = windAt(u10, source.hs, stab, terrain), r = plumeRise(source, { u: u0, stab, Ta, x });
  const u = windAt(u10, Math.max(r.H, 1), stab, terrain);
  return { c: plumeConc({ Q: (source.Q[species] ?? 0), u, H: r.H, stab, terrain, zi }, x, y, z) * 1e6, H: r.H, u };   // g/m3 -> ug/m3
}
/** Screening: worst 1-hour ground-level concentration (ug/m3) over the class x wind grid and distances. opts { species, terrain, Ta, zi, xMin, xMax, averaging: [3, 8, 24, 'annual'] }.
 *  → { max: { c, x, stab, u10, H }, byClass: { A: { c, x, u10 } … }, averaged: { 3: c … }, notes } */
export function screen(source, { species, terrain = 'rural', Ta = 293.15, zi = 0, xMin = 20, xMax = 30000, steps = 160, averaging = [3, 8, 24, 'annual'], wind = GRID } = {}) {
  if (!species || source.Q?.[species] == null) throw new Error('Name the species and give its rate (g/s) on the source.');
  const best = { c: 0 }, byClass = {};
  for (const stab of STABILITY) for (const u10 of wind[stab] || []) {
    for (let i = 0; i <= steps; i++) {
      const x = xMin * Math.pow(xMax / xMin, i / steps), r = atDistance(source, species, { u10, stab, terrain, Ta, zi }, x);
      if (!byClass[stab] || r.c > byClass[stab].c) byClass[stab] = { c: r.c, x, u10, H: r.H };
      if (r.c > best.c) Object.assign(best, { c: r.c, x, stab, u10, H: r.H });
    }
  }
  const averaged = {}; for (const a of averaging) averaged[a] = best.c * (AVERAGING[a] ?? NaN);
  const notes = ['Stability-class screening on flat ground, one source, no buildings. Ta ' + Ta + ' K' + (Ta === 293.15 ? ' (assumed: give the real ambient temperature)' : '') + '.',
    'Averaging multipliers are screening guidance values typed without the document open; the 1-hour maximum is the model\'s number.'];
  return { max: best, byClass, averaged, notes, species };
}

const toRad = (d) => d * Math.PI / 180;
/** One source's contribution (ug/m3) at a receptor for one met hour. met { u10, dirFrom (deg clockwise from north, where the wind blows FROM), stab, zi?, Ta? } */
export function receptorHour(source, species, rec, met, terrain = 'rural') {
  const th = toRad((met.dirFrom + 180) % 360), dx = rec.x - source.x, dy = rec.y - source.y;
  const xd = dx * Math.sin(th) + dy * Math.cos(th), yc = dx * Math.cos(th) - dy * Math.sin(th);
  if (xd <= 1) return 0;
  return atDistance(source, species, { u10: met.u10, stab: met.stab, terrain, Ta: met.Ta ?? 293.15, zi: met.zi ?? 0 }, xd, yc, rec.z ?? 0).c;
}
/** Hour-by-hour run. sources [{ id, x, y, hs, d, vs, Ts, Q }], receptors [{ id, x, y, z? }], hours [met…]. opts { species, terrain, calm: 1 (m/s at 10 m, hours below it are skipped) }.
 *  → { receptors: { id: { max1h, second1h (high second high), mean, hourOfMax, rolling24 (max 24-h mean) } }, hours, calms, notes } */
export function hourly(sources, receptors, hours, { species, terrain = 'rural', calm = 1 } = {}) {
  if (!species) throw new Error('Name the species.');
  const out = {}; let calms = 0;
  const series = Object.fromEntries(receptors.map((r) => [r.id, new Array(hours.length).fill(0)]));
  hours.forEach((m, h) => {
    if (!(m.u10 >= calm)) { calms++; return; }
    for (const r of receptors) { let c = 0; for (const s of sources) c += receptorHour(s, species, r, m, terrain); series[r.id][h] = c; }
  });
  for (const r of receptors) {
    const s = series[r.id], sorted = s.map((c, i) => [c, i]).sort((a, b) => b[0] - a[0]);
    let roll = 0; if (s.length >= 24) { let acc = s.slice(0, 24).reduce((a, b) => a + b, 0); roll = acc; for (let i = 24; i < s.length; i++) { acc += s[i] - s[i - 24]; if (acc > roll) roll = acc; } roll /= 24; }
    out[r.id] = { max1h: sorted[0]?.[0] ?? 0, second1h: sorted[1]?.[0] ?? 0, hourOfMax: sorted[0]?.[1] ?? -1, mean: s.reduce((a, b) => a + b, 0) / Math.max(1, s.length), rolling24: roll };
  }
  return { receptors: out, hours: hours.length, calms, series, notes: ['Hour-by-hour stability-class Gaussian model; ' + calms + ' calm hour(s) (10 m wind below ' + calm + ' m/s) are skipped and count as zero in the means.', 'Not AERMOD: no boundary-layer scaling, no terrain, no building downwash.'] };
}

/** The Cend contour(s) of one source as plan shapes in site coordinates, for the wind blowing FROM dirFrom (deg clockwise from north). levels in ug/m3. */
export function toPlan(source, { species, levels, u10, stab, dirFrom, terrain = 'rural', Ta = 293.15, zi = 0 }) {
  const u0 = windAt(u10, source.hs, stab, terrain), r = plumeRise(source, { u: u0, stab, Ta }), u = windAt(u10, Math.max(r.H, 1), stab, terrain);
  const toAz = (dirFrom + 180) % 360, toMath = 90 - toAz, shapes = [];
  for (const lv of levels) {
    const f = plumeFootprint({ Q: source.Q[species], u, H: r.H, stab, terrain, zi }, lv * 1e-6, { cx: source.x, cy: source.y, toDeg: toMath });
    if (f.reach) shapes.push({ id: source.id + ':' + species + ':' + lv, type: 'plume', level: lv, unit: 'ug/m3', label: lv + ' ug/m3', polygon: f.polygon, reach: f.reach, H: r.H });
  }
  return { shapes, H: r.H, notes: ['One met condition, ground-level contour, flat ground.'] };
}

/** A limits pack as data: { format: 'cadcraft-air-limits-pack', version: 1, name, source, review: { state, by?, date? }, limits: [{ pollutant, avg: '1h'|'3h'|'8h'|'24h'|'annual', value, unit: 'ug/m3', clause? }] }.
 *  Nothing real is bundled: the limits are content typed by a person with the regulation open (rule 44). */
export const TEST_PACK = { format: 'cadcraft-air-limits-pack', version: 1, name: 'Test pack (made-up numbers, not any regulation)', source: 'invented for tests', review: { state: 'not confirmed' }, limits: [{ pollutant: 'X', avg: '1h', value: 100, unit: 'ug/m3', clause: 'test' }] };
export function cleanPack(raw) {
  const p = (raw && typeof raw === 'object') ? raw : {};
  const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
  const limits = (Array.isArray(p.limits) ? p.limits : []).slice(0, 500).map((l) => ({ pollutant: str(l.pollutant, 40), avg: ['1h', '3h', '8h', '24h', 'annual'].includes(l.avg) ? l.avg : '1h', value: Number.isFinite(l.value) && l.value > 0 ? l.value : null, unit: 'ug/m3', clause: str(l.clause, 80) })).filter((l) => l.pollutant && l.value);
  const rv = p.review && typeof p.review === 'object' ? p.review : {};
  const confirmed = !!(str(rv.by) && /^\d{4}-\d{2}-\d{2}$/.test(str(rv.date, 10)));
  return { format: 'cadcraft-air-limits-pack', version: 1, name: str(p.name) || 'Unnamed pack', source: str(p.source), review: confirmed ? { state: 'confirmed', by: str(rv.by), date: str(rv.date, 10) } : { state: 'not confirmed' }, limits };
}
/** Compare results { pollutant, avg, c (ug/m3), where? }[] with a pack. Problems carry the pack and clause; an unconfirmed pack says so (rule 29). */
export function checkLimits(results, pack) {
  const pk = cleanPack(pack), ps = [];
  for (const r of results) {
    const lim = pk.limits.find((l) => l.pollutant === r.pollutant && l.avg === r.avg);
    if (!lim) { ps.push(problem('nolimit', 'note', `No limit for ${r.pollutant} (${r.avg}) in pack "${pk.name}": nothing was compared.`, [{ kind: 'pollutant', id: r.pollutant }])); continue; }
    const frac = r.c / lim.value, tag = pk.review.state === 'confirmed' ? '' : ' The pack is NOT confirmed by a person.';
    if (frac > 1) ps.push(problem('exceeds', 'error', `${r.pollutant} ${r.avg}: ${r.c.toPrecision(3)} ug/m3 is above ${lim.value} (${pk.name}, ${lim.clause || 'no clause'}).${tag}`, [{ kind: 'pollutant', id: r.pollutant }], { req: { op: '<=', value: lim.value, unit: 'ug/m3' }, found: r.c, pack: pk.name, clause: lim.clause }));
    else if (frac > 0.8) ps.push(problem('near', 'warning', `${r.pollutant} ${r.avg}: ${(frac * 100).toFixed(0)} % of the limit (${pk.name}).${tag}`, [{ kind: 'pollutant', id: r.pollutant }], { found: r.c, pack: pk.name, clause: lim.clause }));
  }
  return ps;
}

/** What the AERMOD spike found (2026-10-28, VPS, no source vendored): see the session log. Kept as data so a host can show it. */
export const SPIKE = {
  date: '2026-10-28',
  program: 'AERMOD (US EPA, Fortran, US-government public domain)',
  result: 'NOT built. The source is not in the repository and the tests may not use the network; this machine has no Fortran compiler (checked); Studio may not download native code (rule 44) and the GPL gfortran compiler may not be launched by us (rule 43).',
  routes: ['(a) vendor the public-domain source and compile it to WebAssembly with a permissive Fortran compiler (LFortran is BSD-3, LLVM Flang is Apache-2.0 with exceptions) — untried, the largest job;',
    '(b) build the AERMOD boundary-layer scaling and the plume-in-convective-boundary-layer model ourselves from the published formulation (clean room) — large;',
    '(c) stay with the stability-class model here, labelled as such (what ships now).'],
  recommendation: 'Ship (c) now, say so in the help, decide (a) vs (b) with the owner after an engineer has checked (c).',
};
/** Engine record for lib/process/engines.js `createRegistry([…])`. Its licence is not on engines.js' permissive list (US-government public domain has no SPDX id there), so the registry marks it held until the owner decides. */
export const AERMOD_ENGINE = { id: 'aermod', name: 'AERMOD (US EPA)', license: 'US-Government-public-domain', kind: 'program', caps: ['air'], note: 'Held: no source vendored, no wasm build (see SPIKE). Registers as not allowed until engines.js accepts the licence and an engine exists.' };
