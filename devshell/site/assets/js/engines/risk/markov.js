/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method, solve } from './common.js';

export const M_MARKOV = method('Continuous-time Markov chain: steady state, transient (uniformisation), mean time to absorption', 'Jensen 1953 uniformisation; Trivedi 2001 ch. 7-8',
  ['Constant transition rates (exponential times): wear-out and fixed repair times are not Markov.', 'The state space grows with the number of units; a model is built by hand or by kOutOfN.', 'Numbers are only as good as the rates given.']);

/** Build the generator Q from states and transitions [{from, to, rate}] (names or indices). */
export function chain(states, transitions) {
  const n = states.length, idx = (s) => (typeof s === 'number' ? s : states.indexOf(s)), Q = Array.from({ length: n }, () => new Array(n).fill(0)), probs = [];
  for (const t of transitions) {
    const i = idx(t.from), j = idx(t.to);
    if (i < 0 || j < 0 || i >= n || j >= n) { probs.push(problem('state', 'error', `A transition names a state that does not exist (${t.from} → ${t.to}).`, [])); continue; }
    if (i === j) { probs.push(problem('self', 'warning', `A transition from "${states[i]}" to itself is ignored.`, [{ id: states[i] }])); continue; }
    if (!(t.rate >= 0) || !Number.isFinite(t.rate)) { probs.push(problem('rate', 'error', `The rate ${states[i]} → ${states[j]} must be zero or more (it is ${t.rate}).`, [{ id: states[i] }])); continue; }
    Q[i][j] += t.rate; Q[i][i] -= t.rate;
  }
  return { states, Q, problems: probs, ok: !probs.some((p) => p.severity === 'error'), method: M_MARKOV };
}

/** Long-run probabilities π with πQ = 0, Σπ = 1. Needs one recurrent class: reducible chains give a problem. */
export function steady(c) {
  const n = c.Q.length, A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => c.Q[j][i]));
  A[n - 1] = new Array(n).fill(1);
  const b = new Array(n).fill(0); b[n - 1] = 1;
  const pi = c.Q.length > 1 && c.Q.some((r, i) => r[i] === 0) ? null : solve(A, b); // a state with no way out makes the long-run answer meaningless
  if (!pi || pi.some((x) => x < -1e-9 || !Number.isFinite(x))) return { ok: false, problems: [problem('reducible', 'error', 'No single long-run distribution: the chain has an absorbing or unreachable state (use meanTimeToAbsorption instead).', [])], method: M_MARKOV };
  return { ok: true, pi: pi.map((x) => Math.max(0, x)), probs: Object.fromEntries(c.states.map((s, i) => [s, Math.max(0, pi[i])])), problems: [], method: M_MARKOV };
}

/** Probabilities at time t from p0 by uniformisation, in steps so that Λt stays below 200 (no underflow of the Poisson weights). */
export function transient(c, p0, t) {
  const n = c.Q.length, lam = 1.02 * Math.max(...c.Q.map((r, i) => -r[i]), 1e-12);
  let p = p0.slice(); const steps = Math.max(1, Math.ceil(lam * t / 200)), dt = t / steps;
  for (let s = 0; s < steps; s++) {
    const x = lam * dt; let term = p.slice(), w = Math.exp(-x), acc = term.map((v) => v * w), cum = w;
    for (let k = 1; cum < 1 - 1e-14 && k < 100000; k++) {
      const nx = new Array(n).fill(0);
      for (let i = 0; i < n; i++) if (term[i]) { nx[i] += term[i]; for (let j = 0; j < n; j++) if (j !== i && c.Q[i][j]) nx[j] += term[i] * c.Q[i][j] / lam; nx[i] -= term[i] * (-c.Q[i][i]) / lam; }
      term = nx; w *= x / k; cum += w; for (let i = 0; i < n; i++) acc[i] += term[i] * w;
    }
    p = acc;
  }
  return p;
}

/** Mean time to reach any of the absorbing states, from p0: solve −Q_TT x = 1 over the transient states. */
export function meanTimeToAbsorption(c, p0, absorbing) {
  const abs = new Set(absorbing.map((s) => (typeof s === 'number' ? s : c.states.indexOf(s)))), T = c.states.map((_, i) => i).filter((i) => !abs.has(i));
  const A = T.map((i) => T.map((j) => -c.Q[i][j])), x = solve(A, T.map(() => 1));
  if (!x || x.some((v) => !(v >= 0) || !Number.isFinite(v))) return { ok: false, problems: [problem('no-absorption', 'error', 'Some state can never reach the failed states, so the mean time is infinite or undefined.', [])], method: M_MARKOV };
  return { ok: true, mttf: T.reduce((a, i, k) => a + p0[i] * x[k], 0), perState: Object.fromEntries(T.map((i, k) => [c.states[i], x[k]])), problems: [], method: M_MARKOV };
}

/**
 * A repairable group of n identical units, system up while at least k work, `crew` repairers, failure rate λ per working unit,
 * repair rate μ per repair in progress. States are the number failed, 0..n.
 */
export function kOutOfN({ n, k, lambda, mu, crew = 1 }) {
  const states = Array.from({ length: n + 1 }, (_, i) => String(i)), tr = [];
  for (let i = 0; i < n; i++) tr.push({ from: i, to: i + 1, rate: (n - i) * lambda });
  for (let i = 1; i <= n; i++) tr.push({ from: i, to: i - 1, rate: Math.min(i, crew) * mu });
  const c = chain(states, tr); c.up = states.map((_, i) => n - i >= k); return c;
}

/** Long-run availability = Σ π over the up states. `up` is a list of booleans per state (a chain from kOutOfN carries it). */
export function availability(c, up = c.up) { const s = steady(c); return s.ok ? { ok: true, availability: s.pi.reduce((a, p, i) => a + (up[i] ? p : 0), 0), pi: s.pi, problems: [], method: M_MARKOV } : s; }
