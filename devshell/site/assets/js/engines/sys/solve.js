/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solve.js — operating point and transient of a compiled lumped model (0.8 XE.12; DOM-free).
 * The model is the DAE  g(x, t) + dS(x)/dt = 0  (g: node balances and branch laws, S: stored charge, flux, momentum…). Time steps: the
 * trapezoidal rule (default, 2nd order) or backward Euler (1st order, damps stiff ringing), a Newton solve with a finite-difference Jacobian
 * at each step, optional step-doubling error control (Richardson, the standard local-error estimate for a one-step method).
 *
 *   operatingPoint(model, { init: 'dc' | 'ic', t0 })          → { ok, x, problems }       dc: capacitive branches open, inductive short; ic: elements with `ic`
 *   simulate(model, { tEnd, dt, method, init, adaptive, rtol, atol, breakpoints, maxPoints })
 *       → { ok, t[], x[][], v(node) → number[], i(id) → number[], at(t, node), problems, steps, rejected }
 * Every failure (a floating node, a voltage-source loop, no convergence at time t) is a plain problem in the shared Problems shape (rule 29).
 */
import { DOMAINS } from './model.js';

function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'sys:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-sys' }, ...extra };
}
export { problem };

function solveLinear(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  let scale = 0; for (const r of A) for (const v of r) scale = Math.max(scale, Math.abs(v));
  const tiny = Math.max(scale, 1e-300) * 1e-13;
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) <= tiny) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) { let s = M[i][n]; for (let k = i + 1; k < n; k++) s -= M[i][k] * x[k]; x[i] = s / M[i][i]; }
  return x;
}

/** Newton with a central-difference Jacobian and backtracking. F(x) → residual array. → { x, ok, singular, iter } */
export function newton(F, x0, { rtol = 1e-9, atol = 1e-12, maxIter = 60 } = {}) {
  let x = x0.slice(), f = F(x), nrm = Math.hypot(...f);
  const n = x.length, nrm0 = nrm;
  for (let it = 0; it < maxIter; it++) {
    if (!Number.isFinite(nrm)) return { x, ok: false, iter: it };
    const J = Array.from({ length: n }, () => new Array(n));
    for (let j = 0; j < n; j++) {
      const h = 1e-7 * Math.max(Math.abs(x[j]), 1), xp = x.slice(), xm = x.slice(); xp[j] += h; xm[j] -= h;
      const fp = F(xp), fm = F(xm); for (let i = 0; i < n; i++) J[i][j] = (fp[i] - fm[i]) / (2 * h);
    }
    const dx = solveLinear(J, f.map((v) => -v)); if (!dx) return { x, ok: false, singular: true, iter: it };
    let lam = 1, accepted = false, xn, fn, nn;
    for (let k = 0; k < 30; k++) { xn = x.map((v, i) => v + lam * dx[i]); fn = F(xn); nn = Math.hypot(...fn); if (nn < nrm || nn < 1e-14) { accepted = true; break; } lam /= 2; }
    const sc = 1e-11 * Math.max(1, ...x.map(Math.abs));   // roundoff floor of the whole vector: a component near zero cannot be asked for more
    if (!accepted) { // stalled: accept if the step is already below the roundoff floor
      const small = dx.every((d, i) => Math.abs(d) <= rtol * Math.abs(x[i]) + atol + sc * 100); return { x, ok: small || nrm <= 1e-7 * nrm0 || nrm < 1e-12, iter: it };
    }
    const conv = dx.every((d, i) => Math.abs(lam * d) <= rtol * Math.abs(xn[i]) + atol + sc);
    x = xn; f = fn; nrm = nn;
    if (conv) return { x, ok: true, iter: it + 1 };
    if (nrm < 1e-15) return { x, ok: true, iter: it + 1 };
  }
  return { x, ok: false, iter: maxIter };
}

/** Which nodes have no path to ground (ignoring current sources): the usual cause of a singular system. */
export function floatingNodes(system) {
  const parent = Array.from({ length: system.N + 1 }, (_, i) => i), G = system.N;   // index N stands for every ground
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const id = (i) => (i < 0 ? G : i);
  const uniteDom = new Map();
  for (const p of system.parts) {
    if (p.kind === 'J') continue;
    const pairs = p.kind === 'X' || p.kind === 'Y' ? [[p.a, p.b], [p.a2, p.b2]] : [[p.a, p.b]];
    for (const [a, b] of pairs) { const ra = find(id(a)), rb = find(id(b)); if (ra !== rb) parent[ra] = rb; }
  }
  const out = []; for (let i = 0; i < system.N; i++) if (find(i) !== find(G)) out.push(system.nodeNames[i]);
  return out;
}

function diagnose(system, where) {
  const fl = floatingNodes(system), out = [];
  if (fl.length) out.push(problem('floating', 'error', `Nothing ties ${fl.length > 3 ? fl.slice(0, 3).join(', ') + ' and ' + (fl.length - 3) + ' more nodes' : 'node ' + fl.join(', ')} to ground, so its value is undetermined. Connect it to \`gnd\` through an element.`, fl.slice(0, 20).map((n) => ({ kind: 'node', id: n }))));
  else out.push(problem('singular', 'error', `The equations are singular${where}: a loop of voltage-like sources, a cut set of flow-like sources, or an inductive loop with no resistance can make them so.`, [{ kind: 'model', id: 'all' }]));
  return out;
}

export function operatingPoint(model, { init = 'dc', t0 = 0 } = {}) {
  const c = model.compile(); if (!c.ok) return { ok: false, problems: c.errors.map((e, i) => problem('build.' + i, 'error', e, [])) };
  const sys = c.system, n = sys.size;
  const F = (x) => { const r = new Array(n).fill(0), S = new Array(n).fill(0); sys.eval(x, t0, init === 'ic' ? 'ic' : 'dc', r, S); return r; };
  const s = newton(F, new Array(n).fill(0));
  if (!s.ok) return { ok: false, problems: s.singular ? diagnose(sys, ' at the operating point') : [problem('noconverge', 'error', 'The operating point did not converge.', [{ kind: 'model', id: 'all' }])], system: sys };
  return { ok: true, x: s.x, system: sys, problems: [], v: (name) => sys.across(name, s.x), i: (id) => sys.through(id, s.x, t0) };
}

export function simulate(model, o = {}) {
  const { tEnd, method = 'trap', init = 'dc', adaptive = false, rtol = 1e-6, atol = 1e-9, maxPoints = 200000 } = o;
  if (!(tEnd > 0)) return { ok: false, problems: [problem('tEnd', 'error', 'tEnd must be positive.', [])] };
  const dt0 = o.dt || tEnd / 1000, t0 = o.t0 || 0, bps = (o.breakpoints || []).filter((b) => b > t0 && b < tEnd).sort((a, b) => a - b);
  const op = operatingPoint(model, { init, t0 }); if (!op.ok) return { ok: false, problems: op.problems };
  const sys = op.system, n = sys.size, dynRows = sys.dyn.map((d, i) => (d ? i : -1)).filter((i) => i >= 0);
  const zero = () => new Array(n).fill(0);
  const parts = (x, t) => { const r = zero(), S = zero(); sys.eval(x, t, 'tran', r, S); return { r, S }; };
  const first = parts(op.x, t0);
  let st = { t: t0, x: op.x, S: first.S, Sd: first.r.map((v, i) => (sys.dyn[i] ? -v : 0)) };
  const trap = method !== 'be';
  const advance = (s, h, beOnce = false) => {
    const useTrap = trap && !beOnce, t1 = s.t + h, c = useTrap ? 2 / h : 1 / h;
    const F = (x) => { const { r, S } = parts(x, t1); for (const i of dynRows) r[i] += c * (S[i] - s.S[i]) - (useTrap ? s.Sd[i] : 0); return r; };
    const sol = newton(F, s.x, { rtol: 1e-10, atol: 1e-13 });
    if (!sol.ok) return sol.singular ? { singular: true } : null;
    const { S } = parts(sol.x, t1), Sd = zero(); for (const i of dynRows) Sd[i] = c * (S[i] - s.S[i]) - (useTrap ? s.Sd[i] : 0);
    return { t: t1, x: sol.x, S, Sd };
  };
  const T = [st.t], X = [st.x]; let steps = 0, rejected = 0, h = dt0, restart = true; const problems = [];
  // A step source (or the start) makes the carried derivative wrong for the trapezoid, which would ring: restart with a few short backward-Euler steps.
  const hMax = o.maxStep || (adaptive ? tEnd / 20 : dt0), hMin = o.minStep || tEnd * 1e-12;
  while (st.t < tEnd - 1e-15 * tEnd) {
    if (T.length > maxPoints) { problems.push(problem('maxPoints', 'warning', `Stopped at t = ${st.t.toPrecision(4)} s: ${maxPoints} points reached. Use a larger step or a shorter end time.`, [])); break; }
    let hh = Math.min(h, tEnd - st.t); const nb = bps.find((b) => b > st.t + 1e-15); let hitBp = false; if (nb != null && st.t + hh > nb - 1e-15) { hh = nb - st.t; hitBp = true; }
    if (restart) {
      const hs = Math.min(hh, dt0 / 16); const n1 = advance(st, hs, true);
      if (!n1 || n1.singular) { problems.push(n1 && n1.singular ? diagnose(sys, ` at t = ${st.t.toPrecision(4)} s`)[0] : problem('noconverge', 'error', `Newton did not converge at t = ${(st.t + hs).toPrecision(5)} s.`, [{ kind: 'model', id: 'all' }])); break; }
      st = n1; steps++; T.push(st.t); X.push(st.x); restart = false; continue;
    }
    if (!adaptive) {
      const n1 = advance(st, hh);
      if (!n1 || n1.singular) { problems.push(n1 && n1.singular ? diagnose(sys, ` at t = ${st.t.toPrecision(4)} s`)[0] : problem('noconverge', 'error', `Newton did not converge at t = ${(st.t + hh).toPrecision(5)} s. Try a smaller step or check for a nonlinear element with no operating point.`, [{ kind: 'model', id: 'all' }])); break; }
      st = n1; steps++; T.push(st.t); X.push(st.x); if (hitBp && st.t >= nb - 1e-15) restart = true; continue;
    }
    // step doubling
    const a = advance(st, hh); const b1 = a && !a.singular ? advance(st, hh / 2) : null; const b2 = b1 && !b1.singular ? advance(b1, hh / 2) : null;
    if (!a || !b2 || a.singular) {
      if (hh <= hMin * 2) { problems.push(problem('noconverge', 'error', `Newton did not converge at t = ${(st.t + hh).toPrecision(5)} s even at the smallest step.`, [{ kind: 'model', id: 'all' }])); break; }
      h = hh / 4; rejected++; continue;
    }
    let err = 0; for (let i = 0; i < n; i++) err = Math.max(err, Math.abs(b2.x[i] - a.x[i]) / (rtol * Math.abs(b2.x[i]) + atol));
    err /= trap ? 3 : 1;
    if (err <= 1 || hh <= hMin * 2) { st = b2; steps++; T.push(st.t); X.push(st.x); if (hitBp && st.t >= nb - 1e-15) restart = true; } else rejected++;
    const fac = err > 0 ? Math.min(5, Math.max(0.2, 0.9 * Math.pow(err, trap ? -1 / 3 : -1 / 2))) : 5;
    h = Math.min(hMax, Math.max(hMin, hh * fac));
  }
  const nodeIdx = (name) => sys.nodeNames.indexOf(String(name));
  const res = {
    ok: !problems.some((p) => p.severity === 'error'), t: T, x: X, system: sys, problems, steps, rejected,
    v(name) { if (name === 'gnd') return T.map(() => 0); const i = nodeIdx(name); if (i < 0) throw new Error('no node ' + name); return X.map((x) => x[i]); },
    i(id) { return X.map((x, k) => sys.through(id, x, T[k])); },
    at(name, t) { const y = this.v(name); return interp(T, y, t); },
    atThrough(id, t) { return interp(T, this.i(id), t); },
    final(name) { return this.v(name)[T.length - 1]; },
    domainOf(name) { return DOMAINS[sys.nodeDomain[nodeIdx(name)]]; },
  };
  return res;
}
function interp(T, y, t) {
  if (t <= T[0]) return y[0]; if (t >= T[T.length - 1]) return y[y.length - 1];
  let lo = 0, hi = T.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; (T[m] <= t ? (lo = m) : (hi = m)); }
  return y[lo] + (y[hi] - y[lo]) * (t - T[lo]) / (T[hi] - T[lo]);
}
