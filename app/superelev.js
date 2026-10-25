/* SPDX-License-Identifier: Apache-2.0 */
/**
 * superelev.js — superelevation basics for a corridor (0.4 V18). No DOM; the Node test drives it
 * (bin/test-civilcraft-super.mjs).
 *
 * The lanes rotate about the centreline through each circular curve. Slopes here are FALL-AWAY slopes, as corridor.js
 * uses them: positive = the lane falls away from the crown (normal crown +NC on both sides), negative = it rises away from
 * the crown. In full superelevation the inside lane falls away at +e and the outside lane rises away at −e (the whole
 * section slopes down toward the inside of the curve).
 *
 *   SUPER_DEFAULTS(units) → { on: false, delta, rate: [[radius ≥, e | null (normal crown)]…] }   placeholders, not a
 *       standard: the rate table and the maximum relative gradient Δ (0.5 %) are for the user to set from their own
 *       design criteria
 *   cleanSuper(obj, units) → super | null (untrusted: the project file)
 *   rateFor(R, rate) → e (a fraction) | null (normal crown: no superelevation)
 *   superPlan(alignment, { super, nc, lane }) → { curves: [{ i, R, dir: 'left'|'right', outside: 'L'|'R', e, Lr, Lt (= Lr1, Lt1), Lr2, Lt2, spirals, pc, pt,
 *       stations: { nc0, lc0, rc0, fs0, fs1, rc1, lc1, nc1 } }], problems }
 *       runoff Lr = lane × e / Δ (one lane rotated each side, AASHTO's n₁ = 1, b_w = 1), runout Lt = NC / e × Lr; two
 *       thirds of the runoff on the tangent, one third on the curve (fs0 = PC + Lr/3, lc0 = PC − 2Lr/3, nc0 = lc0 − Lt;
 *       mirrored at the PT). A curve too short for full superelevation, or transitions of neighbouring curves that
 *       overlap, are problems (the slopes are still worked out; where transitions overlap the later curve wins).
 *   slopesAt(plan, sta, nc) → { L, R }   fall-away slopes of the left and right lanes at a station
 *   keyStations(plan) → [sta]            every transition station (corridor.js adds them to its sections)
 *
 * 0.7 D7.35: a curve with a spiral at an end runs its runoff over that spiral: the outside lane is level (lc) at the TS, the
 * full superelevation is reached at the SC (and the same at the CS / ST), the runout comes before the TS. That end's runoff is the
 * spiral's length (Lr1 / Lr2, so a curve with a different spiral at each end rolls at two rates); a spiral shorter than the
 * length that holds the relative gradient is a problem (se.spiral.steep). An end without a spiral keeps the 2/3 - 1/3 rule above.
 */

import { t } from './i18n.js';

export function SUPER_DEFAULTS(units = 'ft') {
  return units === 'm'
    ? { on: false, delta: 0.005, rate: [[2100, null], [1300, 0.02], [800, 0.03], [550, 0.04], [380, 0.05], [0, 0.06]] }
    : { on: false, delta: 0.005, rate: [[7000, null], [4300, 0.02], [2600, 0.03], [1800, 0.04], [1250, 0.05], [0, 0.06]] };
}

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export function cleanSuper(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const d = SUPER_DEFAULTS(units);
  const rate = Array.isArray(o.rate) ? o.rate.filter((r) => Array.isArray(r) && fin(r[0]) && r[0] >= 0 && r[0] < 1e7 && (r[1] === null || (fin(r[1]) && r[1] >= 0 && r[1] <= 0.2))).map((r) => [r[0], r[1]]).slice(0, 40) : [];
  rate.sort((a, b) => b[0] - a[0]);
  return { on: o.on === true, delta: fin(o.delta) && o.delta > 0 && o.delta <= 0.05 ? o.delta : d.delta, rate: rate.length ? rate : d.rate };
}

export function rateFor(R, rate) {
  for (const [r, e] of rate) if (R >= r) return e;
  return rate.length ? rate[rate.length - 1][1] : null;
}

export function superPlan(al, { super: sp, nc = 0.02, lane = 12 } = {}) {
  const curves = [], problems = [];
  if (!al?.ok || !sp?.on) return { curves, problems };
  const cvs = al.curves?.length ? al.curves : al.elements.filter((e) => e.type === 'arc').map((e) => ({ r: e.r, ccw: e.ccw, ls1: 0, ls2: 0, ts: e.sta, sc: e.sta, cs: e.sta + e.len, st: e.sta + e.len }));
  cvs.forEach((c, i) => {
    const e = rateFor(c.r, sp.rate);
    if (e === null || !(e > 0)) return;
    const dir = c.ccw ? 'left' : 'right';
    const full = (lane * e) / sp.delta;
    const Lr1 = c.ls1 > 0 ? c.ls1 : full, Lr2 = c.ls2 > 0 ? c.ls2 : full;
    const Lt1 = (nc / Math.max(e, 1e-9)) * Lr1, Lt2 = (nc / Math.max(e, 1e-9)) * Lr2;
    const st = {};
    if (c.ls1 > 0) { st.lc0 = c.ts; st.fs0 = c.sc; } else { st.lc0 = c.ts - (2 * Lr1) / 3; st.fs0 = c.ts + Lr1 / 3; }
    if (c.ls2 > 0) { st.lc1 = c.st; st.fs1 = c.cs; } else { st.lc1 = c.st + (2 * Lr2) / 3; st.fs1 = c.st - Lr2 / 3; }
    st.nc0 = st.lc0 - Lt1; st.nc1 = st.lc1 + Lt2;
    st.rc0 = st.lc0 + (Lr1 * Math.min(1, nc / e)); st.rc1 = st.lc1 - (Lr2 * Math.min(1, nc / e));
    if (st.fs1 < st.fs0) problems.push(t('se.short', { n: i + 1, r: +c.r.toFixed(2) }));
    for (const [k, ls] of [[1, c.ls1], [2, c.ls2]]) if (ls > 0 && ls < full - 1e-9) problems.push(t('se.spiral.steep', { n: i + 1, end: k === 1 ? 'TS' : 'ST', ls: +ls.toFixed(2), need: +full.toFixed(2) }));
    curves.push({ i: i + 1, R: c.r, dir, outside: dir === 'right' ? 'L' : 'R', e, Lr: Lr1, Lt: Lt1, Lr1, Lr2, Lt1, Lt2, pc: c.ts, pt: c.st, spirals: c.ls1 > 0 || c.ls2 > 0, stations: st });
  });
  for (let k = 1; k < curves.length; k++) if (curves[k].stations.nc0 < curves[k - 1].stations.nc1) problems.push(t('se.overlap', { a: curves[k - 1].i, b: curves[k].i }));
  return { curves, problems };
}

/** The outside lane's fall-away slope along one curve's transition (+NC outside it). */
function outsideAt(c, sta, nc) {
  const s = c.stations, e = c.e;
  // a curve too short for full superelevation reaches only part of e: the two ramps meet in the middle
  const up = (x) => {
    if (x <= s.nc0) return nc;
    if (x <= s.lc0) return nc - (nc * (x - s.nc0)) / Math.max(c.Lt1, 1e-9);                // runout: NC → 0
    return -(e * (x - s.lc0)) / Math.max(c.Lr1, 1e-9);                                       // runoff: 0 → −e
  };
  const down = (x) => {
    if (x >= s.nc1) return nc;
    if (x >= s.lc1) return nc - (nc * (s.nc1 - x)) / Math.max(c.Lt2, 1e-9);
    return -(e * (s.lc1 - x)) / Math.max(c.Lr2, 1e-9);
  };
  return Math.max(up(sta), down(sta), -e);
}

export function slopesAt(plan, sta, nc = 0.02) {
  let L = nc, R = nc;
  for (const c of plan?.curves || []) {
    if (sta <= c.stations.nc0 || sta >= c.stations.nc1) continue;
    const o = outsideAt(c, sta, nc);
    const inside = Math.max(nc, -o);   // the inside lane keeps its crown until the outside one rolls past it, then one plane
    if (c.outside === 'L') { L = o; R = inside; } else { R = o; L = inside; }
  }
  return { L, R };
}

export function keyStations(plan) {
  const out = [];
  for (const c of plan?.curves || []) for (const v of Object.values(c.stations)) out.push(v);
  return out;
}
