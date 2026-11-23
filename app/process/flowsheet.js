/* SPDX-License-Identifier: Apache-2.0 */
/**
 * flowsheet.js — steady-state, sequential-modular flowsheet solver (0.8 Track CH, CH.2; DOM-free, deterministic).
 *
 * Definition (plain data, saved in the file):
 *   { v: 1, thermo: { components, model, kij?, params?, henry? },
 *     feeds:  { id: { flows | massFlows | { F, z }, T, P } },
 *     units:  [ { id, type, in: [stream ids], out: [stream ids], p: {…} } ],       types: UNIT_TYPES (stream.js), conversion | equilibrium | cstr | pfr,
 *                                                                                   shortcut, mesh (p.feedStages = stage per inlet)
 *     tear?: [stream ids], method?: 'wegstein' | 'broyden' | 'direct', tol?, maxIter?,
 *     specs?: [ { vary: { unit, param, min?, max?, x0? }, target: { stream, prop, value } } ] }       prop: T P F vf H, x:<comp>, flow:<comp>, duty:<unit>
 * Units are run in the order of the list, strongly connected groups (recycles) are iterated on tear streams (Wegstein 1958 bounded
 * acceleration, or Broyden's good method), and design specs adjust a unit parameter by a finite-difference Newton on the whole flowsheet.
 */
import { Thermo } from './thermo.js';
import { UNITS, feedStream, emptyStream, isZero, fromFlash } from './stream.js';
import { REACTORS } from './reactor.js';
import { shortcut, mesh } from './column.js';
import { balanceReport, problem } from './report.js';
import { newtonFD, illinois } from './numeric.js';
import './hydraulics.js';   // registers the `pipe` unit

const sum = (a) => a.reduce((s, v) => s + v, 0);
export const ALL_TYPES = [...Object.keys(UNITS), ...Object.keys(REACTORS), 'shortcut', 'mesh'];

function runUnit(th, u, ins, p) {
  const t = u.type;
  if (UNITS[t]) return UNITS[t](th, ins, p);
  if (REACTORS[t]) return REACTORS[t](th, ins, p);
  if (t === 'shortcut') return shortcut(th, ins, p);
  if (t === 'mesh') return mesh(th, ins.map((s, i) => ({ stage: (p.feedStages || [1])[i] || 1, stream: s })), p);
  throw new Error('unknown unit type ' + t);
}
export function thermoFor(def) { return new Thermo(def.thermo); }

/** Strongly connected components of the unit graph (Tarjan), each as sorted unit indices; returned in topological order. */
export function groups(def) {
  const U = def.units, prod = {}; U.forEach((u, i) => (u.out || []).forEach((s) => { prod[s] = i; }));
  const adj = U.map(() => new Set()); U.forEach((u, j) => u.in.forEach((s) => { if (prod[s] != null) adj[prod[s]].add(j); }));
  let idx = 0; const index = new Array(U.length).fill(-1), low = [], on = [], st = [], comps = [];
  const visit = (v) => {
    index[v] = low[v] = idx++; st.push(v); on[v] = true;
    for (const w of [...adj[v]].sort((a, b) => a - b)) { if (index[w] < 0) { visit(w); low[v] = Math.min(low[v], low[w]); } else if (on[w]) low[v] = Math.min(low[v], index[w]); }
    if (low[v] === index[v]) { const c = []; let w; do { w = st.pop(); on[w] = false; c.push(w); } while (w !== v); comps.push(c.sort((a, b) => a - b)); }
  };
  for (let v = 0; v < U.length; v++) if (index[v] < 0) visit(v);
  // Kahn on the condensation, ties by the smallest unit index
  const of = new Array(U.length); comps.forEach((c, k) => c.forEach((v) => { of[v] = k; }));
  const indeg = comps.map(() => 0), cadj = comps.map(() => new Set());
  U.forEach((_, v) => adj[v].forEach((w) => { if (of[v] !== of[w] && !cadj[of[v]].has(of[w])) { cadj[of[v]].add(of[w]); indeg[of[w]]++; } }));
  const ready = comps.map((_, k) => k).filter((k) => indeg[k] === 0), order = [];
  while (ready.length) { ready.sort((a, b) => comps[a][0] - comps[b][0]); const k = ready.shift(); order.push(comps[k]); for (const m of cadj[k]) if (--indeg[m] === 0) ready.push(m); }
  return { order, prod };
}

function tearSet(def, group, prod) {
  const set = new Set(group), tears = new Set();
  const userTear = new Set(def.tear || []);
  group.forEach((j) => def.units[j].in.forEach((s) => { const i = prod[s]; if (i != null && set.has(i)) { if (i >= j || userTear.has(s)) tears.add(s); } }));
  return [...tears].sort();
}

export function solveFlowsheet(def, overrides = {}) {
  const th = thermoFor(def), problems = [], S = {}, info = {}, nc = th.n;
  for (const [id, f] of Object.entries(def.feeds || {})) S[id] = feedStream(th, f, id);
  const Fscale = Math.max(1e-12, ...Object.values(S).map((s) => s.F));
  const { order, prod } = groups(def);
  const method = def.method || 'wegstein', tol = def.tol || 1e-9, maxIter = def.maxIter || 300, tearInfo = [];
  const inStream = (id) => S[id] || emptyStream(th, id);
  const params = (u) => ({ ...(u.p || {}), ...(overrides[u.id] || {}) });
  const exec = (j) => {
    const u = def.units[j];
    try {
      const r = runUnit(th, u, u.in.map(inStream), params(u));
      (u.out || []).forEach((id, k) => { if (r.outs[k]) S[id] = { ...r.outs[k], id }; });
      info[u.id] = { type: u.type, ...Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'outs')) };
    } catch (e) {
      problems.push(problem('unit.failed', 'error', `${u.id} (${u.type}) failed: ${e.message}`, [{ kind: 'unit', id: u.id }]));
      (u.out || []).forEach((id) => { S[id] = emptyStream(th, id); }); info[u.id] = { type: u.type, Q: 0, W: 0, notes: ['failed: ' + e.message], failed: true };
    }
  };
  let converged = true, totalIter = 0;
  for (const g of order) {
    const tears = tearSet(def, g, prod), hasLoop = g.length > 1 || g.some((j) => def.units[j].in.some((s) => (def.units[j].out || []).includes(s)));
    if (!tears.length && !hasLoop) { exec(g[0]); continue; }
    if (!tears.length) { g.forEach(exec); continue; }
    const toVec = (ids) => ids.flatMap((id) => { const s = S[id] || emptyStream(th, id); return [...s.z.map((z) => z * s.F), s.T, s.P]; });
    const fromVec = (ids, x) => ids.forEach((id, k) => {
      const base = k * (nc + 2), n = x.slice(base, base + nc).map((v) => Math.max(v, 0)), F = sum(n);
      S[id] = F > 1e-300 ? fromFlash(F, th.flashPT(x[base + nc], x[base + nc + 1], n.map((v) => v / F)), id) : { ...emptyStream(th, id), T: x[base + nc], P: x[base + nc + 1] };
    });
    const scale = tears.flatMap(() => [...new Array(nc).fill(1e-6 * Fscale), 1, 1e3]);
    // initial values: the feeds' T and P when known, empty flow
    let x = toVec(tears); fromVec(tears, x);
    const G = (xv) => { fromVec(tears, xv); g.forEach(exec); return toVec(tears); };
    let xPrev = null, gPrev = null, err = Infinity, it = 0, H = null;
    for (it = 1; it <= maxIter; it++) {
      const gx = G(x); err = 0; for (let i = 0; i < x.length; i++) err = Math.max(err, Math.abs(gx[i] - x[i]) / (Math.abs(x[i]) + scale[i]));
      if (err < tol) { x = gx; break; }
      let xn;
      if (method === 'direct' || (xPrev == null && method !== 'broyden')) xn = gx;
      else if (method === 'wegstein') {
        xn = x.map((xi, i) => { const dx = xi - xPrev[i]; if (Math.abs(dx) < 1e-300) return gx[i]; const s = (gx[i] - gPrev[i]) / dx, q = Math.max(-5, Math.min(0, s / (s - 1))); return q * xi + (1 - q) * gx[i]; });
      } else {                                                  // Broyden's good method on F = x - G(x)
        const Fx = x.map((v, i) => v - gx[i]);
        if (H == null) { H = x.map((_, i) => x.map((__, j) => (i === j ? 1 : 0))); }
        else {
          const dx = x.map((v, i) => v - xPrev[i]), dF = Fx.map((v, i) => v - (xPrev[i] - gPrev[i]));
          const Hd = H.map((row) => row.reduce((s, h, j) => s + h * dF[j], 0)), dxH = x.map((_, j) => dx.reduce((s, d, i) => s + d * H[i][j], 0)), den = dx.reduce((s, d, i) => s + d * Hd[i], 0);
          if (Math.abs(den) > 1e-300) for (let i = 0; i < x.length; i++) for (let j = 0; j < x.length; j++) H[i][j] += (dx[i] - Hd[i]) * dxH[j] / den;
        }
        const step = H.map((row) => row.reduce((s, h, j) => s + h * Fx[j], 0));
        xn = x.map((v, i) => v - step[i]);
        gPrev = Fx.map((f, i) => x[i] - f); xPrev = x; xn = xn.map((v, i) => (i % (nc + 2) < nc ? Math.max(v, 0) : v)); x = xn; continue;
      }
      xPrev = x; gPrev = gx; x = xn.map((v, i) => (i % (nc + 2) < nc ? Math.max(v, 0) : v));
    }
    totalIter += it; const ok = err < tol;
    if (ok) { fromVec(tears, x); g.forEach(exec); } else { converged = false; problems.push(problem('recycle.unconverged', 'error', `The recycle loop through ${tears.join(', ')} did not converge in ${maxIter} iterations (error ${err.toExponential(2)}).`, tears.map((id) => ({ kind: 'stream', id })))); }
    tearInfo.push({ streams: tears, iterations: it, error: err, converged: ok, method });
  }
  const res = { converged, iterations: totalIter, streams: S, units: info, tears: tearInfo, order: order.map((g) => g.map((j) => def.units[j].id)), problems };
  res.report = balanceReport(th, def, res); res.problems = [...problems, ...res.report.problems];
  return res;
}

export function propOf(th, res, t) {
  const s = res.streams[t.stream], p = t.prop;
  if (p === 'T' || p === 'P' || p === 'F' || p === 'vf' || p === 'H') return s ? s[p] : NaN;
  if (p.startsWith('x:')) return s.z[th.index(p.slice(2))];
  if (p.startsWith('flow:')) return s.F * s.z[th.index(p.slice(5))];
  if (p.startsWith('duty:')) return (res.units[p.slice(5)] || {}).Q;
  if (p.startsWith('work:')) return (res.units[p.slice(5)] || {}).W;
  throw new Error('unknown spec property ' + p);
}

/** Solve with design specs; each spec varies one unit parameter. Returns the usual result plus `specs: [{ vary, value, residual }]`. */
export function solve(def) {
  if (!def.specs || !def.specs.length) return solveFlowsheet(def);
  const th = thermoFor(def), sp = def.specs;
  const ov = (xv) => { const o = {}; sp.forEach((s, k) => { (o[s.vary.unit] ||= {})[s.vary.param] = xv[k]; }); return o; };
  const x0 = sp.map((s) => s.vary.x0 ?? (def.units.find((u) => u.id === s.vary.unit)?.p?.[s.vary.param]) ?? 0.5 * ((s.vary.min ?? 0) + (s.vary.max ?? 1)));
  let last = null;
  const F = (xv) => { last = solveFlowsheet(def, ov(xv)); return sp.map((s) => { const v = propOf(th, last, s.target); return (v - s.target.value) / (Math.abs(s.target.value) + 1e-6); }); };
  const feas = (xv) => sp.every((s, k) => (s.vary.min == null || xv[k] >= s.vary.min) && (s.vary.max == null || xv[k] <= s.vary.max));
  let sol = null;
  if (sp.length === 1 && sp[0].vary.min != null && sp[0].vary.max != null) {          // one spec with limits: bracket by a scan (flat regions defeat Newton), then Illinois
    const { min, max } = sp[0].vary, N = 48; let prev = null;
    for (let k = 0; k <= N && !sol; k++) {
      const v = min + (max - min) * k / N, f = F([v])[0];
      if (f === 0) sol = { x: [v], ok: true };
      else if (prev && prev.f * f < 0) { const r = illinois((t) => F([t])[0], prev.v, v, { tol: 1e-12 }); sol = { x: [r], ok: r != null }; }
      prev = { v, f };
    }
  }
  if (!sol) sol = newtonFD(F, x0, { tol: 1e-10, maxIter: 60, feasible: feas, rel: 1e-6 });
  const final = solveFlowsheet(def, ov(sol.x));
  final.specs = sp.map((s, k) => ({ unit: s.vary.unit, param: s.vary.param, value: sol.x[k], target: s.target, achieved: propOf(th, final, s.target) }));
  if (!sol.ok) { final.converged = false; final.problems.push(problem('spec.unconverged', 'error', 'A design specification could not be met within the limits on the varied parameter.', sp.map((s) => ({ kind: 'unit', id: s.vary.unit })))); }
  return final;
}
