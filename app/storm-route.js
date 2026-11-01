/* SPDX-License-Identifier: Apache-2.0 */
/**
 * storm-route.js — a storm routed through the pipe network as hydrographs (0.8 LC.16, session oltl2-b_PART_3). No DOM; bin/test-civilcraft-storm-route.mjs drives it.
 * The rational method (hydro.js) gives one peak per pipe; this gives the whole flow over time: each catchment's runoff hydrograph, carried down the pipes by
 * Muskingum–Cunge routing (translation and attenuation in every pipe), summed at every structure, so a pipe with a long run sees its peak lower and later than the
 * rational sum, and two branches with different times of concentration add as they really do.
 *
 *   route(net, units, { duration, dt, horizon, rain }) → { dt, steps, t[], duration, rain,
 *       structs: Map(id → { peak, tPeak, q[] }),                 flow arriving at each structure (catchments + upstream pipes)
 *       pipes:   Map(id → { peakIn, peakOut, tPeakOut, lag, att, cap, ratio, K, X, c, V, over }),   att = how much lower the outlet peak is than the inlet's (0…1)
 *       outlets: [{ id, peak, tPeak, q[] }],                      structures with no pipe leaving
 *       problems: [{ id, kind, msg }] }
 *   duration  minutes of rain (default: the longest time of concentration of any catchment, and not under minTc)
 *   rain      constant intensity in/h | mm/h for that duration; default the IDF curve at `duration` (hydro.js idf)
 *   dt        minutes (default 1); horizon minutes after the rain stops (default: enough for the longest path)
 *
 * Method (stated so the numbers can be checked): a catchment of runoff area C·A and time of concentration tc sends out the rain, averaged over the last tc minutes
 * (a uniform time–area curve): q(t) = C·A·(1/tc)·∫ i dτ over [t − tc, t] — for constant rain this rises over tc, holds C·i·A, falls over tc, and for a storm
 * shorter than tc peaks at C·i·A·duration/tc. A pipe routes with Muskingum–Cunge: celerity c = 1.5 × the part-full velocity at the pipe's rational peak flow
 * (the kinematic ratio for a circular pipe is 1.3–1.7; 1.5 is a fixed, stated choice), K = L/c, X = ½(1 − Q/(T·S·c·L)) held in 0…½ with Q the rational peak and T the
 * flow's top width; if the step is too coarse for K the pipe passes the flow on after a plain lag (no attenuation, said in `lag`).
 * What it is not: no surcharge, no backwater, no storage in structures and no flooding — a pipe whose routed peak exceeds its full capacity is flagged (`over`), and the
 * water is still passed on as if the pipe carried it. SWMM's dynamic wave is the full answer; it is not built (docs/spikes/LC.16_PART_2.md).
 */
import { idf, cleanHydro, catchmentArea, rationalFlows, manningFull, normalDepth, partFull } from './hydro.js';
import { DIA_UNIT, flowOrder } from './pipes.js';
import { t } from './i18n.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const CELERITY_RATIO = 1.5;
export const MAX_STEPS = 4000;

/** Cumulative rain depth of a constant storm: i·min(τ, duration) (intensity × minutes). */
const rainDepth = (i, dur, tau) => i * Math.max(0, Math.min(tau, dur));

/** One catchment's runoff hydrograph at times 0, dt, 2dt…: C·A converted to flow units. Flow per (area × intensity): ft³/s per ac·in/h (≈1), m³/s per ha·mm/h (1/360). */
export function catchmentHydrograph({ CA, tc, i, duration, dt, steps, units }) {
  const k = units === 'm' ? 1 / 360 : 1;
  const q = new Array(steps).fill(0), w = Math.max(tc, dt);
  for (let n = 0; n < steps; n++) {
    const t1 = n * dt;
    q[n] = k * CA * (rainDepth(i, duration, t1) - rainDepth(i, duration, t1 - w)) / w;
  }
  return q;
}

/** Muskingum coefficients for K, X, dt (minutes). `lag` = the step is too coarse to attenuate: C2 would go negative. */
export function muskingum(K, X, dt) {
  const d = K * (1 - X) + 0.5 * dt;
  const c0 = (-K * X + 0.5 * dt) / d, c1 = (K * X + 0.5 * dt) / d, c2 = (K * (1 - X) - 0.5 * dt) / d;
  return { c0, c1, c2, lag: c0 < 0 || c2 < 0 };
}

/** Route one series through a reach. Muskingum needs 2·K·X ≤ step ≤ 2·K·(1 − X) for its three coefficients to stay positive, so the reach is run on a grid of
 *  max(dt, 2·K·X) minutes (the inflow read off by linear interpolation, the outflow interpolated back to dt); if even that is longer than 2·K·(1 − X) the reach is too short
 *  to attenuate on this grid and the flow passes after a plain lag of K minutes (linear interpolation, peak and volume kept). `step` = the grid used. */
export function routeReach(inflow, K, X, dt) {
  const n = inflow.length, out = new Array(n).fill(0);
  const d = Math.max(dt, 2 * K * X), co = muskingum(K, X, d);
  const at = (a, u) => { if (u <= 0) return a[0]; const j = Math.floor(u), f = u - j; return j >= a.length - 1 ? a[a.length - 1] : a[j] * (1 - f) + a[j + 1] * f; };
  if (co.lag) {
    const s = K / dt;
    for (let j = 0; j < n; j++) { const f = j - s, i = Math.floor(f), b = f - i; out[j] = f < 0 ? 0 : (inflow[i] ?? 0) * (1 - b) + (inflow[i + 1] ?? inflow[i] ?? 0) * b; }
    return { out, lag: true, step: dt };
  }
  const m = Math.ceil(((n - 1) * dt) / d) + 1, g = new Array(m);
  let qi = at(inflow, 0), prevIn = qi, prevOut = qi;
  g[0] = qi;
  for (let k = 1; k < m; k++) {
    qi = at(inflow, (k * d) / dt);
    prevOut = Math.max(0, co.c0 * qi + co.c1 * prevIn + co.c2 * prevOut); prevIn = qi; g[k] = prevOut;
  }
  for (let j = 0; j < n; j++) out[j] = at(g, (j * dt) / d);
  return { out, lag: false, step: d };
}

const peakOf = (q, dt) => { let p = 0, ip = 0; for (let j = 0; j < q.length; j++) if (q[j] > p) { p = q[j]; ip = j; } return { peak: p, tPeak: ip * dt }; };

export function route(net, units = 'ft', opts = {}) {
  const h = cleanHydro(net?.hydro, units), problems = [];
  const empty = { dt: 0, steps: 0, t: [], duration: 0, rain: 0, structs: new Map(), pipes: new Map(), outlets: [], problems };
  const ord = flowOrder(net || { pipes: [] });
  if (!ord) { problems.push({ id: null, kind: 'network', msg: t('hy.loop') }); return empty; }
  const cs = (net.catchments || []).filter((c) => c && (net.structures || []).some((s) => s.id === c.to));
  if (!cs.length || !(net.pipes || []).length) return empty;
  const dt = fin(opts.dt) && opts.dt > 0 && opts.dt <= 30 ? opts.dt : 1;
  const duration = fin(opts.duration) && opts.duration > 0 && opts.duration <= 1440 ? opts.duration : Math.max(h.minTc, ...cs.map((c) => c.tc));
  const rain = fin(opts.rain) && opts.rain > 0 && opts.rain < 1e4 ? opts.rain : idf(duration, h);
  const rat = rationalFlows(net, units);
  const sById = new Map(net.structures.map((s) => [s.id, s]));
  const per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;
  // the pipes' travel first, to know how long to simulate
  const reach = new Map();
  for (const p of ord) {
    const f = rat.pipes.get(p.id), a = sById.get(p.from), b = sById.get(p.to), D = (Number(p.dia) || 0) / per;
    if (!f || !a || !b || !(D > 0)) { if (f && !(D > 0)) problems.push({ id: p.id, kind: 'pipe', msg: t('rt.nodia', { name: p.name }) }); continue; }
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (!(f.S > 0) || !(len > 0)) { problems.push({ id: p.id, kind: 'pipe', msg: t('rt.flat', { name: p.name }) }); continue; }
    const full = manningFull(D, f.S, h.n, units), yn = normalDepth(f.Q, D, f.S, h.n, units);
    const A = yn === null ? full.A : partFull(yn, D).A, V = A > 0 ? f.Q / A : full.V, Tw = yn === null ? D : Math.max(partFull(yn, D).T, 0.1 * D);
    const c = CELERITY_RATIO * Math.max(V, 0.1), K = len / c / 60;      // minutes
    const X = Math.min(0.5, Math.max(0, 0.5 * (1 - f.Q / (Tw * f.S * c * len))));
    reach.set(p.id, { len, S: f.S, cap: full.Q, K, X, c, V });
  }
  const longest = Math.max(0, ...ord.map((p) => reach.get(p.id)?.K || 0));
  const total = ord.reduce((s, p) => s + (reach.get(p.id)?.K || 0), 0);
  const horizon = fin(opts.horizon) && opts.horizon >= 0 ? opts.horizon : Math.min(total + longest + Math.max(...cs.map((c) => c.tc)) + 5, 1440);
  const steps = Math.min(MAX_STEPS, Math.ceil((duration + horizon + Math.max(...cs.map((c) => c.tc))) / dt) + 1);
  if (steps >= MAX_STEPS) problems.push({ id: null, kind: 'network', msg: t('rt.long') });
  const zero = () => new Array(steps).fill(0);
  const into = new Map(net.structures.map((s) => [s.id, zero()]));
  for (const c of cs) {
    const hy = catchmentHydrograph({ CA: c.C * catchmentArea(c.pts, units), tc: Math.max(c.tc, dt), i: rain, duration, dt, steps, units });
    const arr = into.get(c.to); for (let j = 0; j < steps; j++) arr[j] += hy[j];
  }
  const pipes = new Map();
  for (const p of ord) {
    const r = reach.get(p.id), inflow = into.get(p.from);
    if (!r) continue;
    const { out, lag } = routeReach(inflow, r.K, r.X, dt);
    const a = peakOf(inflow, dt), b = peakOf(out, dt), dn = into.get(p.to);
    for (let j = 0; j < steps; j++) dn[j] += out[j];
    const over = b.peak > r.cap * (1 + 1e-9);
    pipes.set(p.id, { peakIn: a.peak, peakOut: b.peak, tPeakOut: b.tPeak, lag, att: a.peak > 0 ? Math.max(0, 1 - b.peak / a.peak) : 0, cap: r.cap, ratio: r.cap > 0 ? b.peak / r.cap : 0, K: r.K, X: r.X, c: r.c, V: r.V, over });
    if (over) problems.push({ id: p.id, kind: 'pipe', msg: t('rt.over', { name: p.name }) });
  }
  const structs = new Map(); for (const [id, q] of into) structs.set(id, { ...peakOf(q, dt), q });
  const outlets = net.structures.filter((s) => !net.pipes.some((p) => p.from === s.id) && net.pipes.some((p) => p.to === s.id)).map((s) => ({ id: s.id, ...structs.get(s.id) }));
  return { dt, steps, t: Array.from({ length: steps }, (_, j) => j * dt), duration, rain, structs, pipes, outlets, problems };
}

/** The outlet's hydrograph (or any structure's) as CSV text: minutes, flow. */
export function hydrographCsv(r, id, units = 'ft') {
  const s = r.structs.get(id);
  if (!s) return '';
  return ['minutes,flow ' + (units === 'm' ? 'm3/s' : 'cfs'), ...r.t.map((m, j) => `${+m.toFixed(3)},${+s.q[j].toFixed(6)}`)].join('\r\n') + '\r\n';
}
