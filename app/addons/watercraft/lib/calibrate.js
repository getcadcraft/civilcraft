/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * calibrate.js — calibration against field readings (0.11 WN.11). Pressure and flow readings taken in the field are set against the model and
 * the unknowns are moved until the model fits them: the Hazen–Williams roughness of each group of pipes (the usual suspect: old mains are
 * rougher than the book says) and, when asked, one factor on every demand. Damped least squares (Levenberg–Marquardt) on the logarithms of the
 * unknowns, the slopes by finite differences through the host's steady solver.
 *
 *   calibrate(water, units, { observations, groups, demandFactor, bounds: { c: [lo, hi], dm: [lo, hi] }, maxIter }) → result
 *   observation: { kind: 'pressure' | 'head' | 'flow', id (node, or pipe for a flow), value (project units), mult (demand multiplier at the reading, default 1),
 *                  levels: { tankId: level } (tank levels at the reading), sigma (what a reading is good to; default 1 psi / 7 kPa, 2 % or 5 gpm / 0.5 L/s) }
 *   group: { id, pipes: [ids] } (default: one group of all the pipes)
 *   result (rmse = the misfit in units of each reading's sigma, so pressures and flows weigh alike): { params: [{ id, type, from, to, pipes, sensitivity }], rmseBefore, rmseAfter, rows: [{ kind, id, observed, before, after }], iterations, converged,
 *             water (the model with the new roughness), demandFactor, weak: [ids the readings barely feel] }
 * The answer is only as good as the readings: the number of readings must exceed the number of unknowns, and a group no reading feels is reported as weak.
 */
import { hydraulics, num, pos, problem } from './util.js';
import { solveState } from './control.js';

export function calibrate(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const obs = (opts.observations || []).filter((o) => num(o.value) != null && o.id);
  const pipesAll = W.pipes.filter((p) => p.kind === 'pipe').map((p) => p.id);
  const groups = (opts.groups && opts.groups.length ? opts.groups : [{ id: 'all', pipes: pipesAll }]).map((g) => ({ id: g.id, pipes: g.pipes.filter((id) => pipesAll.includes(id)) })).filter((g) => g.pipes.length);
  const useDm = !!opts.demandFactor;
  const cb = opts.bounds?.c || [40, 160], db = opts.bounds?.dm || [0.5, 2];
  const nPar = groups.length + (useDm ? 1 : 0);
  if (obs.length < nPar) throw problem('few_readings', { have: obs.length, need: nPar });
  const c0 = new Map(W.pipes.map((p) => [p.id, p.c || W.settings.c]));
  const sig = (o) => num(o.sigma) ?? (o.kind === 'flow' ? Math.max(0.02 * Math.abs(o.value), units === 'm' ? 0.5 : 5) : (units === 'm' ? 7 : 1));
  const cond = new Map(); for (const o of obs) { const k = JSON.stringify([o.mult ?? 1, o.levels || null]); if (!cond.has(k)) cond.set(k, { mult: o.mult ?? 1, levels: o.levels }); }
  const x0 = groups.map((g) => Math.log(g.pipes.reduce((s, id) => s + c0.get(id), 0) / g.pipes.length));
  if (useDm) x0.push(0);
  const clampX = (x) => x.map((v, i) => (i < groups.length ? Math.min(Math.log(cb[1]), Math.max(Math.log(cb[0]), v)) : Math.min(Math.log(db[1]), Math.max(Math.log(db[0]), v))));
  const model = (x) => {
    const ratio = new Map(groups.flatMap((g, i) => g.pipes.map((id) => [id, Math.exp(x[i]) / (g.pipes.reduce((s, q) => s + c0.get(q), 0) / g.pipes.length)])));
    const w = { ...W, pipes: W.pipes.map((p) => (ratio.has(p.id) ? { ...p, c: c0.get(p.id) * ratio.get(p.id) } : p)) };
    const dm = useDm ? Math.exp(x[groups.length]) : 1;
    const res = new Map();
    for (const [k, c] of cond) res.set(k, solveState(w, units, { mult: c.mult * dm, levels: c.levels }));
    return { w, out: obs.map((o) => { const r = res.get(JSON.stringify([o.mult ?? 1, o.levels || null])); if (o.kind === 'flow') return r.pipes.get(o.id)?.q ?? NaN; const n = r.nodes.get(o.id); return o.kind === 'head' ? (n?.head ?? NaN) : (n?.pressure ?? NaN); }), dm };
  };
  const resid = (x) => { const m = model(x); return m.out.map((v, i) => (Number.isFinite(v) ? (v - obs[i].value) / sig(obs[i]) : 1e3)); };
  const cost = (r) => r.reduce((s, v) => s + v * v, 0);
  let x = clampX(x0), r = resid(x), f = cost(r), lambda = 1e-2, it = 0, converged = false;
  const before = model(x0).out;
  const jac = (x, r) => x.map((_, j) => { const h = 1e-3, xp = x.slice(); xp[j] += h; const rp = resid(xp); return rp.map((v, i) => (v - r[i]) / h); });   // columns
  for (it = 1; it <= (opts.maxIter || 40); it++) {
    const J = jac(x, r), m = nPar;
    const A = Array.from({ length: m }, (_, a) => Array.from({ length: m }, (_, b) => J[a].reduce((s, v, i) => s + v * J[b][i], 0)));
    const g = J.map((col) => col.reduce((s, v, i) => s + v * r[i], 0));
    let stepped = false;
    for (let k = 0; k < 12 && !stepped; k++) {
      const M = A.map((row, a) => row.map((v, b) => v + (a === b ? lambda * Math.max(v, 1e-9) : 0)));
      const d = g.map((v) => -v);
      for (let c = 0; c < m; c++) { let pv = c; for (let i = c + 1; i < m; i++) if (Math.abs(M[i][c]) > Math.abs(M[pv][c])) pv = i; [M[c], M[pv]] = [M[pv], M[c]]; [d[c], d[pv]] = [d[pv], d[c]]; for (let i = c + 1; i < m; i++) { const q = M[i][c] / (M[c][c] || 1e-300); for (let j = c; j < m; j++) M[i][j] -= q * M[c][j]; d[i] -= q * d[c]; } }
      for (let c = m - 1; c >= 0; c--) { let s2 = d[c]; for (let j = c + 1; j < m; j++) s2 -= M[c][j] * d[j]; d[c] = s2 / (M[c][c] || 1e-300); }
      const xn = clampX(x.map((v, i) => v + d[i])), rn = resid(xn), fn = cost(rn);
      if (fn < f) { const rel = (f - fn) / Math.max(f, 1e-12); x = xn; r = rn; f = fn; lambda = Math.max(lambda / 4, 1e-9); stepped = true; if (rel < 1e-9 || f < 1e-14) converged = true; } else lambda *= 5;
    }
    if (!stepped) { converged = true; break; }
    if (converged) break;
  }
  const J = jac(x, r), sens = J.map((col) => Math.sqrt(col.reduce((s, v) => s + v * v, 0) / obs.length));
  const final = model(x);
  const params = groups.map((g, i) => ({ id: g.id, type: 'c', from: g.pipes.reduce((s, id) => s + c0.get(id), 0) / g.pipes.length, to: Math.exp(x[i]), pipes: g.pipes, sensitivity: sens[i] }));
  if (useDm) params.push({ id: 'demand', type: 'demand', from: 1, to: Math.exp(x[groups.length]), pipes: [], sensitivity: sens[groups.length] });
  const rmse = (out) => Math.sqrt(out.reduce((s, v, i) => s + (((Number.isFinite(v) ? v : obs[i].value + 1e3) - obs[i].value) / sig(obs[i])) ** 2, 0) / obs.length);   // misfit in units of what a reading is good to: 1 = as close as the readings
  return { params, rmseBefore: rmse(before), rmseAfter: rmse(final.out), rows: obs.map((o, i) => ({ kind: o.kind, id: o.id, observed: o.value, before: before[i], after: final.out[i] })), iterations: it, converged,
    water: final.w, demandFactor: final.dm, weak: params.filter((p) => p.sensitivity < 0.05).map((p) => p.id) };
}
