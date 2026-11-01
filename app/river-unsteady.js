/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-unsteady.js — unsteady 1D flow in a river reach (0.8 SU.957 rest, round 3 civil_PART_3): a flood hydrograph routed down the
 * sections of a river model. No DOM, no strings: notes are codes the UI words (`river.unsteady.<code>`). Tested by
 * bin/test-civilcraft-river-unsteady.mjs. A design aid that needs an engineer's review.
 *
 * The method is the published Preissmann four-point implicit scheme for the Saint-Venant equations (Preissmann 1961; Cunge, Holly and
 * Verwey 1980, Practical Aspects of Computational River Hydraulics, ch. 3), written here from the equations:
 *     continuity   ∂A/∂t + ∂Q/∂x = 0
 *     momentum     ∂Q/∂t + ∂(Q|Q|/A)/∂x + g·A·∂h/∂x + g·A·Sf = 0,      Sf = Q|Q|/K²,   h = water surface elevation
 *   with x positive downstream, θ = 0.6 (weighting in time; 0.5 < θ ≤ 1 is stable), A(h) and K(h) from each cross-section's table
 *   (river-solve.js hydraulics, 80 levels, interpolated). Each time step is solved by Newton's method (forward-difference Jacobian
 *   per interval, a banded LU with row pivoting for the whole reach); a step that does not converge is halved (up to 4 times).
 *   Unknowns per section: h and Q. Upstream: the inflow hydrograph Q(t). Downstream: normal depth at a slope (Q = K√S) or a stage
 *   hydrograph. The start is the steady water surface for the first inflow (river-solve.js standard step).
 *
 * Limits (flagged in the result, never hidden): subcritical flow only (`froude` where Fr > 1 at any time), no structures inside the
 * reach (they run in steady mode; `structures`), no lateral inflow, one reach, the energy coefficient α = 1 in the momentum term.
 * Water in a section above its ends is held by vertical walls, as the steady solver does.
 *
 *   unsteady(model, { profile?, inflow: [{ t, q }], down: { type: 'normal', slope } | { type: 'stage', series: [{ t, h }] },
 *                     duration, dt, theta = 0.6, every = dt × 10 }) →
 *     { units, issues, nodes: [{ id, rs, minZ }], steps, newtonMax, halved, frames: [{ t, h: [], q: [] }] (upstream section first),
 *       peaks: [{ id, rs, wse, q, tWse, tQ }], mass: { inflow, outflow, storage0, storage1, error }, flags }
 *   Times in seconds; q in m³/s or ft³/s; h in m or ft (the model's units).
 */

import { UNIT_CONST, ordered } from './river.js';
import { geometry, hydraulics, solve } from './river-solve.js';

const LEVELS = 200;

/** A(h) and K(h) of one section as a table of LEVELS + 1 levels, closer together near the bed (levels grow as the square of the index). */
function table(geo, units) {
  const lo = geo.minZ, depth = Math.max(geo.maxZ - geo.minZ, 1e-3), h0 = lo + 0.005 * depth, hi = geo.maxZ + depth;
  const h = [], A = [], K = [];
  for (let i = 0; i <= LEVELS; i++) {
    const w = h0 + (hi - h0) * (i / LEVELS) ** 2, r = hydraulics(geo, w, units);
    h.push(w); A.push(r.A); K.push(r.K);
  }
  const at = (arr, w) => {
    if (w <= h0) { const f = Math.max(w - lo, 1e-9) / (h0 - lo); return arr[0] * (arr === A ? f : Math.pow(f, 1.6667)); }
    if (w >= hi) { const a = arr[LEVELS], b = arr[LEVELS - 1]; return a + ((w - hi) / (h[LEVELS] - h[LEVELS - 1])) * (a - b); }
    const i = Math.min(LEVELS - 1, Math.floor(LEVELS * Math.sqrt((w - h0) / (hi - h0))));
    const j = w < h[i] ? i - 1 : w > h[i + 1] ? i + 1 : i, k = Math.max(0, Math.min(LEVELS - 1, j));
    return arr[k] + ((w - h[k]) / (h[k + 1] - h[k])) * (arr[k + 1] - arr[k]);
  };
  return { lo, h0, A: (w) => at(A, w), K: (w) => at(K, w) };
}

const linear = (series, t, key) => {
  if (!series.length) return 0;
  if (t <= series[0].t) return series[0][key];
  for (let i = 1; i < series.length; i++) if (t <= series[i].t) { const f = (t - series[i - 1].t) / (series[i].t - series[i - 1].t || 1); return series[i - 1][key] + f * (series[i][key] - series[i - 1][key]); }
  return series[series.length - 1][key];
};

/** Banded LU solve (partial pivoting; kl = 2, ku = 3, fill up to 5 to the right): rows as short arrays on an absolute column window. */
function bandSolve(rows, c0, rhs) {
  const n = rhs.length, W = rows[0].length, KL = 2, REACH = 6;
  const get = (r, c) => { const j = c - c0[r]; return j >= 0 && j < W ? rows[r][j] : 0; };
  const sub = (r, c, v) => { const j = c - c0[r]; if (j < 0 || j >= W) { if (v === 0) return; throw new Error('band overflow'); /* i18n-ignore: internal */ } rows[r][j] -= v; };
  for (let k = 0; k < n; k++) {
    let p = k, best = Math.abs(get(k, k));
    for (let i = k + 1; i <= Math.min(n - 1, k + KL); i++) { const v = Math.abs(get(i, k)); if (v > best) { best = v; p = i; } }
    if (!(best > 1e-300)) return null;
    if (p !== k) { [rows[k], rows[p]] = [rows[p], rows[k]]; [c0[k], c0[p]] = [c0[p], c0[k]]; [rhs[k], rhs[p]] = [rhs[p], rhs[k]]; }
    const piv = get(k, k);
    for (let i = k + 1; i <= Math.min(n - 1, k + KL); i++) {
      const f = get(i, k) / piv;
      if (f === 0) continue;
      for (let c = k; c <= Math.min(n - 1, k + REACH); c++) sub(i, c, f * get(k, c));
      rhs[i] -= f * rhs[k];
    }
  }
  const x = new Float64Array(n);
  for (let k = n - 1; k >= 0; k--) {
    let s = rhs[k];
    for (let c = k + 1; c <= Math.min(n - 1, k + REACH); c++) s -= get(k, c) * x[c];
    x[k] = s / get(k, k);
  }
  return x;
}

export function unsteady(model, opts = {}) {
  const units = model?.units === 'ft' ? 'ft' : 'm', g = UNIT_CONST[units].g, issues = [];
  const secs = ordered(model).slice().reverse();   // upstream first
  const N = secs.length;
  const inflow = (opts.inflow || []).filter((p) => Number.isFinite(p?.t) && Number.isFinite(p?.q) && p.q >= 0).sort((a, b) => a.t - b.t);
  const down = opts.down || { type: 'normal', slope: 0.001 };
  const dur = opts.duration, dt0 = opts.dt, theta = opts.theta ?? 0.6;
  if (N < 2) issues.push({ code: 'fewsections' });
  if (inflow.length < 2) issues.push({ code: 'noinflow' });
  if (!(dur > 0) || !(dt0 > 0)) issues.push({ code: 'badtime' });
  if (down.type === 'normal' && !(down.slope > 0)) issues.push({ code: 'nodown' });
  if (down.type === 'stage' && !(down.series?.length >= 1)) issues.push({ code: 'nodown' });
  if (!(theta > 0.5 && theta <= 1)) issues.push({ code: 'badtheta' });
  if (N > 500 || (dur / dt0) > 2e5) issues.push({ code: 'toobig' });
  if (model.structures?.length) issues.push({ code: 'structures' });
  if (issues.some((i) => i.code !== 'structures')) return { units, issues, nodes: [], steps: 0, frames: [], peaks: [], mass: null, flags: {} };
  const geos = secs.map(geometry), tabs = geos.map((gm) => table(gm, units));
  const dx = []; for (let i = 0; i + 1 < N; i++) dx.push(Math.max(1e-6, secs[i].rs - secs[i + 1].rs));
  // the start: steady flow at the first inflow
  const q0 = linear(inflow, 0, 'q'), s0 = down.type === 'normal' ? { type: 'normal', slope: down.slope } : { type: 'ws', wse: linear(down.series, 0, 'h') };
  const st = solve({ ...model, regime: 'sub', structures: [], profiles: [{ name: 'start', q: Math.max(q0, 1e-9), changes: [], down: s0, up: null }] });
  if (!st.profiles.length) return { units, issues: [...issues, { code: 'nostart' }], nodes: [], steps: 0, frames: [], peaks: [], mass: null, flags: {} };
  const rows0 = st.profiles[0].rows.slice().reverse();
  let h = Float64Array.from(rows0.map((r) => r.wse)), Q = Float64Array.from(rows0.map((r) => r.q));
  const Qref = Math.max(1e-6, ...inflow.map((p) => p.q)), Href = Math.max(1e-3, ...geos.map((gm) => gm.maxZ - gm.minZ));
  const flags = {};
  const flag = (c) => { flags[c] = (flags[c] || 0) + 1; };
  const Af = (i, w) => tabs[i].A(w), Kf = (i, w) => Math.max(tabs[i].K(w), 1e-12);
  const storage = (hh) => { let s = 0; for (let i = 0; i + 1 < N; i++) s += 0.5 * (Af(i, hh[i]) + Af(i + 1, hh[i + 1])) * dx[i]; return s; };
  const nodes = secs.map((s, i) => ({ id: s.id, rs: s.rs, minZ: geos[i].minZ }));
  const peaks = nodes.map((nd, i) => ({ id: nd.id, rs: nd.rs, wse: h[i], q: Q[i], tWse: 0, tQ: 0 }));
  const frames = [{ t: 0, h: Array.from(h), q: Array.from(Q) }];
  const every = opts.every || dt0 * 10;
  const mass = { inflow: 0, outflow: 0, storage0: storage(h), storage1: 0, error: 0 };

  // the residual of one interval i (between sections i and i+1) for new values (hi, Qi, hj, Qj) against the old ones
  const interval = (i, hi, Qi, hj, Qj, hio, Qio, hjo, Qjo, dt) => {
    const Ai = Af(i, hi), Aj = Af(i + 1, hj), Aio = Af(i, hio), Ajo = Af(i + 1, hjo);
    const cont = ((Ai + Aj) - (Aio + Ajo)) / (2 * dt) + (theta * (Qj - Qi) + (1 - theta) * (Qjo - Qio)) / dx[i];
    const Fn = (q, a) => (a > 0 ? (q * Math.abs(q)) / a : 0);
    const Ki = Kf(i, hi), Kj = Kf(i + 1, hj), Kio = Kf(i, hio), Kjo = Kf(i + 1, hjo);
    const sf = (q, k) => (q * Math.abs(q)) / (k * k);
    const Am = theta * 0.5 * (Ai + Aj) + (1 - theta) * 0.5 * (Aio + Ajo);
    const Sfm = theta * 0.5 * (sf(Qi, Ki) + sf(Qj, Kj)) + (1 - theta) * 0.5 * (sf(Qio, Kio) + sf(Qjo, Kjo));
    const mom = ((Qi + Qj) - (Qio + Qjo)) / (2 * dt)
      + (theta * (Fn(Qj, Aj) - Fn(Qi, Ai)) + (1 - theta) * (Fn(Qjo, Ajo) - Fn(Qio, Aio))) / dx[i]
      + (g * Am * (theta * (hj - hi) + (1 - theta) * (hjo - hio))) / dx[i] + g * Am * Sfm;
    return [cont, mom];
  };

  let t = 0, steps = 0, newtonMax = 0, halved = 0, nextFrame = every;
  const dhEps = 1e-6 * Href, dqEps = 1e-6 * Qref;
  const attempt = (tNew, dt) => {
    const ho = h, Qo = Q;
    let hn = Float64Array.from(ho), Qn = Float64Array.from(Qo);
    const n = 2 * N;
    for (let it = 1; it <= 20; it++) {
      const F = new Float64Array(n);
      const rows = [], c0 = [];
      const addRow = (r) => { rows[r] = new Array(12).fill(0); c0[r] = Math.max(0, r - 3); };
      for (let r = 0; r < n; r++) addRow(r);
      const put = (r, c, v) => { rows[r][c - c0[r]] = v; };
      // upstream: Q0 = inflow(t)
      F[0] = Qn[0] - linear(inflow, tNew, 'q'); put(0, 1, 1);
      for (let i = 0; i + 1 < N; i++) {
        const base = [hn[i], Qn[i], hn[i + 1], Qn[i + 1]], r0 = interval(i, ...base, ho[i], Qo[i], ho[i + 1], Qo[i + 1], dt);
        F[2 * i + 1] = r0[0]; F[2 * i + 2] = r0[1];
        for (let v = 0; v < 4; v++) {
          const b = base.slice(); const e = v % 2 === 0 ? dhEps : dqEps; b[v] += e;
          const r1 = interval(i, ...b, ho[i], Qo[i], ho[i + 1], Qo[i + 1], dt), col = 2 * i + v;
          put(2 * i + 1, col, (r1[0] - r0[0]) / e); put(2 * i + 2, col, (r1[1] - r0[1]) / e);
        }
      }
      const L = N - 1;
      if (down.type === 'normal') {
        const k = Kf(L, hn[L]), sl = Math.sqrt(down.slope), e = dhEps;
        F[n - 1] = Qn[L] - k * sl; put(n - 1, 2 * L, -((Kf(L, hn[L] + e) - k) / e) * sl); put(n - 1, 2 * L + 1, 1);
      } else { F[n - 1] = hn[L] - linear(down.series, tNew, 'h'); put(n - 1, 2 * L, 1); }
      const rhs = Float64Array.from(F, (v) => -v);
      let du;
      try { du = bandSolve(rows, c0, rhs); } catch { du = null; }
      if (!du) return null;
      let worst = 0;
      for (let i = 0; i < N; i++) {
        let dh = du[2 * i], dq = du[2 * i + 1];
        const cap = 0.5 * Href; if (Math.abs(dh) > cap) dh = Math.sign(dh) * cap;
        hn[i] = Math.max(tabs[i].lo + 1e-4 * Href, hn[i] + dh); Qn[i] += dq;
        worst = Math.max(worst, Math.abs(dh) / Href, Math.abs(dq) / Qref);
      }
      newtonMax = Math.max(newtonMax, it);
      if (worst < 1e-8) return { h: hn, Q: Qn };
    }
    return null;
  };
  while (t < dur - 1e-9) {
    let dt = Math.min(dt0, dur - t), res = attempt(t + dt, dt), tries = 0;
    while (!res && tries < 4) { dt /= 2; tries++; halved++; res = attempt(t + dt, dt); }
    if (!res) { flag('noconv'); break; }
    // volumes at the two ends, weighted in time like the scheme itself
    const L = N - 1;
    mass.inflow += dt * (theta * res.Q[0] + (1 - theta) * Q[0]);
    mass.outflow += dt * (theta * res.Q[L] + (1 - theta) * Q[L]);
    h = res.h; Q = res.Q; t += dt; steps++;
    for (let i = 0; i < N; i++) {
      if (h[i] > peaks[i].wse) { peaks[i].wse = h[i]; peaks[i].tWse = t; }
      if (Q[i] > peaks[i].q) { peaks[i].q = Q[i]; peaks[i].tQ = t; }
      const a = Af(i, h[i]), top = geos[i].maxZ;
      if (h[i] > top) flag('walls');
      if (a > 0) { const T = (Af(i, h[i] + 1e-3 * Href) - a) / (1e-3 * Href); if (T > 0 && Math.abs(Q[i]) / a > Math.sqrt((g * a) / T)) flag('froude'); }
    }
    if (t >= nextFrame - 1e-9 || t >= dur - 1e-9) { frames.push({ t, h: Array.from(h), q: Array.from(Q) }); nextFrame += every; }
  }
  mass.storage1 = storage(h);
  const scale = Math.max(mass.inflow, mass.outflow, Math.abs(mass.storage1 - mass.storage0), 1e-12);
  mass.error = (mass.inflow - mass.outflow - (mass.storage1 - mass.storage0)) / scale;
  return { units, issues, nodes, steps, newtonMax, halved, frames, peaks, mass, flags };
}
