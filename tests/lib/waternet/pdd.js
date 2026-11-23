/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * pdd.js — pressure-dependent demand and leakage (0.11 WN.9). A normal run delivers every demand whatever the pressure, so a network that
 * has lost its pressure still "serves" everyone. Here a junction delivers only what its pressure allows:
 *
 *   delivered = required · f(P),   f = 0 at or under Pmin, 1 at or over Pref, ((P − Pmin)/(Pref − Pmin))^n between      (Wagner et al. 1988)
 *   emitter   = C · P^n   at a junction (a leaking joint, a sprinkler, a service with a free orifice)
 *   leakage   = k · (L / 1000) · Pavg^n   along a pipe, half to each junction end (the pressure-leakage law of the FAVAD family; n about 0.5
 *               for holes, up to 1.5 for flexible cracks: the person sets both from what they know of the network)
 *
 * The host's steady solver is called with the demand deficits and the leaks as draws, and the draws are iterated against the pressures it
 * returns (relaxed fixed point), so valves, tanks and rules from control.js work underneath (solveState). Pressures are the host's units
 * (psi or kPa); Pmin, Pref and the coefficients are in them (C: flow units per pressure unit^n).
 *
 *   solvePDD(water, units, { pmin, pref, exponent, emitters: [{ node, coeff, exp }], leak: { coeff, exp }, mult, levels, pumpOn, closed, valves,
 *                            tol, maxIter }) → host result + { served: Map node → { required, delivered, fraction, pressure }, emitterFlow: Map,
 *                            leakFlow: Map (per pipe), leakTotal, deficit, required, delivered, iterations, pdd }
 *   wagner(P, pmin, pref, n) → the fraction served
 */
import { hydraulics, num, pos, si } from './util.js';
import { solveState } from './control.js';

export const wagner = (P, pmin, pref, n = 0.5) => {
  if (P == null || !Number.isFinite(P) || P <= pmin) return 0;
  if (P >= pref) return 1;
  return Math.pow((P - pmin) / (pref - pmin), n);
};

export function solvePDD(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const pmin = num(opts.pmin, units === 'm' ? 140 : 20), pref = Math.max(pmin + 1e-6, num(opts.pref, units === 'm' ? 280 : 40));
  const n = pos(opts.exponent, 0.5), mult = opts.mult ?? 1;
  const K = si(units);
  const junctions = W.nodes.filter((x) => x.kind === 'junction');
  const isJ = new Set(junctions.map((x) => x.id));
  const emitters = (opts.emitters || []).filter((e) => isJ.has(e.node) && num(e.coeff, 0) > 0);
  const leak = opts.leak && num(opts.leak.coeff, 0) > 0 ? { coeff: Number(opts.leak.coeff), exp: pos(opts.leak.exp, 1.18) } : null;
  const pipeLen = (p) => p.length ?? Math.hypot(W.nodes.find((x) => x.id === p.a).x - W.nodes.find((x) => x.id === p.b).x, W.nodes.find((x) => x.id === p.a).y - W.nodes.find((x) => x.id === p.b).y);
  const leakPipes = leak ? W.pipes.filter((p) => p.kind === 'pipe' && p.status !== 'closed' && !(opts.closed && opts.closed.has(p.id))) : [];
  const required = new Map(junctions.map((x) => [x.id, x.demand * mult]));
  const frac = new Map(junctions.map((x) => [x.id, 1]));
  const emit = new Map(emitters.map((e) => [e.node, 0]));
  const leakQ = new Map(leakPipes.map((p) => [p.id, 0]));
  const tol = pos(opts.tol, 1e-6), maxIter = opts.maxIter || 300;
  const press = (res, id) => res.nodes.get(id)?.pressure;
  // the unknowns as one vector (fractions served, emitter flows, leak flows; flows scaled to the size of a demand) and the map G: unknowns → what the pressures then give
  const scale = Math.max(1, [...required.values()].reduce((a, b) => a + b, 0) / Math.max(1, junctions.length));
  const names = [...junctions.map((x) => ['f', x.id]), ...emitters.map((e) => ['e', e.node]), ...leakPipes.map((p) => ['l', p.id])];
  const get = () => names.map(([k, id]) => (k === 'f' ? frac.get(id) : (k === 'e' ? emit.get(id) : leakQ.get(id)) / scale));
  const put = (x) => names.forEach(([k, id], i) => { if (k === 'f') frac.set(id, Math.min(1, Math.max(0, x[i]))); else (k === 'e' ? emit : leakQ).set(id, Math.max(0, x[i]) * scale); });
  let r = null, it = 0, converged = false;
  const G = () => {
    const extra = {};
    const add = (id, f) => { extra[id] = (extra[id] || 0) + f; };
    for (const x of junctions) add(x.id, required.get(x.id) * (frac.get(x.id) - 1));
    for (const e of emitters) add(e.node, emit.get(e.node));
    for (const p of leakPipes) {
      const q = leakQ.get(p.id), ja = isJ.has(p.a), jb = isJ.has(p.b);
      if (ja && jb) { add(p.a, q / 2); add(p.b, q / 2); } else if (ja) add(p.a, q); else if (jb) add(p.b, q);
    }
    r = solveState(W, units, { mult, levels: opts.levels, pumpOn: opts.pumpOn, closed: opts.closed, valves: opts.valves, extra });
    return names.map(([k, id]) => {
      if (k === 'f') { const P = press(r, id); return P == null ? 0 : wagner(P, pmin, pref, n); }
      if (k === 'e') { const e = emitters.find((z) => z.node === id), P = Math.max(0, press(r, id) ?? 0); return Number(e.coeff) * Math.pow(P, pos(e.exp, 0.5)) / scale; }
      const p = leakPipes.find((z) => z.id === id), pa0 = press(r, p.a), pb0 = press(r, p.b);
      const pa = Math.max(0, pa0 ?? pb0 ?? 0), pb = Math.max(0, pb0 ?? pa0 ?? 0);
      return leak.coeff * (pipeLen(p) / 1000) * Math.pow((pa + pb) / 2, leak.exp) / scale;
    });
  };
  // Anderson acceleration (depth 5) of the fixed point x = G(x): plain iteration crawls where the square-root law is steep (close to Pmin)
  const dX = [], dF = []; let xPrev = null, fPrev = null;
  for (it = 1; it <= maxIter; it++) {
    const x = get(), g = G(), fv = g.map((v, i) => v - x[i]);
    const err = Math.max(...fv.map((v, i) => Math.abs(v) * (names[i][0] === 'f' ? (required.get(names[i][1]) || 0) : scale)), 0);
    if (err <= tol * Math.max(1, scale * 10) * 1e-3 || (it > 1 && err < 1e-7)) { converged = true; break; }
    if (xPrev) { dX.push(x.map((v, i) => v - xPrev[i])); dF.push(fv.map((v, i) => v - fPrev[i])); if (dX.length > 5) { dX.shift(); dF.shift(); } }
    xPrev = x; fPrev = fv;
    let next = x.map((v, i) => v + 0.8 * fv[i]);
    const m = dF.length;
    if (m) {   // least squares: min | f − dF·γ |  (normal equations with a small ridge)
      const A = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => dF[i].reduce((s, v, k) => s + v * dF[j][k], 0) + (i === j ? 1e-12 : 0)));
      const bb = dF.map((d) => d.reduce((s, v, k) => s + v * fv[k], 0));
      const gam = bb.slice();
      for (let c = 0; c < m; c++) {   // Gauss elimination
        let pv = c; for (let i = c + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[pv][c])) pv = i;
        [A[c], A[pv]] = [A[pv], A[c]]; [gam[c], gam[pv]] = [gam[pv], gam[c]];
        if (Math.abs(A[c][c]) < 1e-300) continue;
        for (let i = c + 1; i < m; i++) { const f = A[i][c] / A[c][c]; for (let j = c; j < m; j++) A[i][j] -= f * A[c][j]; gam[i] -= f * gam[c]; }
      }
      for (let c = m - 1; c >= 0; c--) { let sacc = gam[c]; for (let j = c + 1; j < m; j++) sacc -= A[c][j] * gam[j]; gam[c] = Math.abs(A[c][c]) < 1e-300 ? 0 : sacc / A[c][c]; }
      next = x.map((v, i) => v + 0.8 * fv[i] - dX.reduce((s, d, k) => s + gam[k] * (d[i] + 0.8 * dF[k][i]), 0));
    }
    put(next);
  }
  if (converged) { put(get()); }
  const served = new Map();
  let req = 0, del = 0;
  for (const x of junctions) { const q = required.get(x.id), f = frac.get(x.id); served.set(x.id, { required: q, delivered: q * f, fraction: f, pressure: press(r, x.id) ?? null }); req += q; del += q * f; }
  let leakTotal = 0; for (const v of leakQ.values()) leakTotal += v;
  let emitTotal = 0; for (const v of emit.values()) emitTotal += v;
  return Object.assign(r, { served, emitterFlow: emit, leakFlow: leakQ, leakTotal, emitterTotal: emitTotal, required: req, delivered: del, deficit: req - del, iterations: it, converged, pdd: { pmin, pref, exponent: n } });
}
