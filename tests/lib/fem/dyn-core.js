/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dyn-core.js — the numerical core of response spectrum and time history analysis (0.9 SU.1056). DOM-free, no model knowledge: it works on
 * the matrices and modes lib/fem/model.js hands out (K, M, modes normalised so that φᵀMφ = 1, the reduced numbering of `sys`).
 * An analysis aid, not a code check; your engineer reviews the results.
 *
 *   spectrumFn({ rows: [[T, Sa]…], unit: 'g' | 'ms2' }) → (T) → Sa in mm/s²   linear in T between the rows, constant outside them
 *   ccqc(r, ω, ξ) → ρ (Der Kiureghian 1981, equal damping) · combine(values, ω, { method, xi }) → combined value of one response
 *       method 'srss' | 'cqc' | 'abs' | 'tenpct' (U.S. NRC Regulatory Guide 1.92, "ten percent": modes within 10 % of each other add in absolute value)
 *   directional(R: {X, Y, Z} arrays of magnitudes, rule: '100-30' | 'srss') → array
 *   influence(sys, axis) → r (reduced) · participation(sys, φ, axis) → Γ = φᵀ M r
 *   parseGroundMotion(text, opts) → { ok, dt, a (Float64Array, g or m/s² as read), n, header } · syntheticMotion(kind, p) → { dt, a (m/s²), label }
 *   resample(rec, dt) → uniform record by linear interpolation
 *   sdofStep (exact for piecewise-linear input) · modalHistory(modes, record, damping) · newmark(sys, record, dir, damping)
 *   NOTE
 * Units as lib/fem: mm, N, tonne, s. Accelerations in mm/s² inside (a record in g is multiplied by 9806.65 on entry).
 * Method sources (derivations are in tools/fem/test-fem-dynamics.mjs): CQC — Der Kiureghian, "A response spectrum method for random vibration analysis
 * of MDF systems", Earthquake Eng. Struct. Dyn. 9 (1981); Wilson, Der Kiureghian, Bayo, same journal 9 (1981). Piecewise-linear exact SDOF solution — Nigam &
 * Jennings, "Calculation of response spectra from strong-motion earthquake records", Bull. Seism. Soc. Am. 59 (1969); here re-derived (see sdofStep).
 * Newmark average acceleration (β = ¼, γ = ½) — Newmark, "A method of computation for structural dynamics", J. Eng. Mech. Div. ASCE 85 (1959); Chopra,
 * Dynamics of Structures, ch. 5 and 11 (Rayleigh damping).
 */
import { Coo, csrMul, pcg } from './linalg.js';

export const NOTE = 'Not a code check; your engineer reviews the results.';
export const G_MM = 9806.65;                  // standard gravity in mm/s²

// ---- spectrum -------------------------------------------------------------------------------------------------------------------------------
/** A spectrum table as a function T (s) → Sa (mm/s²). Rows ascending in T; before the first row and after the last the nearest value holds. */
export function spectrumFn({ rows, unit = 'g' }) {
  const r = (rows || []).map((q) => [Number(q[0]), Number(q[1])]).filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]) && q[0] >= 0 && q[1] >= 0).sort((a, b) => a[0] - b[0]);
  if (!r.length) return null;
  const k = unit === 'g' ? G_MM : unit === 'mms2' ? 1 : 1000;                      // g, mm/s², or m/s²
  return (T) => {
    if (!(T > r[0][0])) return r[0][1] * k;
    for (let i = 1; i < r.length; i++) if (T <= r[i][0]) { const a = r[i - 1], b = r[i], w = b[0] > a[0] ? (T - a[0]) / (b[0] - a[0]) : 1; return (a[1] + w * (b[1] - a[1])) * k; }
    return r[r.length - 1][1] * k;
  };
}

// ---- modal combination -----------------------------------------------------------------------------------------------------------------------
/** Correlation of two modes of equal damping ξ, r = ω_j / ω_i (Der Kiureghian 1981): 8ξ²(1+r)r^1.5 / ((1−r²)² + 4ξ²r(1+r)²). ρ(1) = 1, ρ symmetric under r → 1/r. */
export function ccqc(r, xi) {
  if (!(r > 0)) return 0;
  const num = 8 * xi * xi * (1 + r) * r ** 1.5, den = (1 - r * r) ** 2 + 4 * xi * xi * r * (1 + r) ** 2;
  return den > 0 ? num / den : 1;
}
/** One response from its signed modal peaks `v[n]` (modal frequencies `w[n]` rad/s). */
export function combine(v, w, { method = 'cqc', xi = 0.05 } = {}) {
  const n = v.length;
  if (method === 'abs') { let s = 0; for (let i = 0; i < n; i++) s += Math.abs(v[i]); return s; }
  let s = 0;
  for (let i = 0; i < n; i++) {
    s += v[i] * v[i];
    for (let j = i + 1; j < n; j++) {
      if (!v[i] || !v[j]) continue;
      if (method === 'cqc') s += 2 * ccqc(w[j] / w[i], xi) * v[i] * v[j];
      else if (method === 'tenpct' && Math.abs(w[j] - w[i]) <= 0.1 * Math.min(w[i], w[j])) s += 2 * Math.abs(v[i] * v[j]);
    }
  }
  return Math.sqrt(Math.max(s, 0));
}
/** Directions together: '100-30' = the largest of (one direction + 30 % of each other), 'srss'. R = { X, Y, Z } each an array of magnitudes (or null). */
export function directional(R, rule = '100-30', factor = 0.3) {
  const list = ['X', 'Y', 'Z'].map((d) => R[d]).filter(Boolean);
  if (!list.length) return null;
  const n = list[0].length, out = new Float64Array(n);
  if (rule === 'srss') { for (const a of list) for (let i = 0; i < n; i++) out[i] += a[i] * a[i]; for (let i = 0; i < n; i++) out[i] = Math.sqrt(out[i]); return out; }
  for (let i = 0; i < n; i++) {
    let sum = 0; for (const a of list) sum += a[i];
    let best = 0; for (const a of list) best = Math.max(best, a[i] + factor * (sum - a[i]));
    out[i] = best;
  }
  return out;
}

// ---- influence vectors and participation -------------------------------------------------------------------------------------------------------
/** The rigid-body translation along global axis (0, 1, 2) in the reduced numbering: 1 on every dof that is that translation (rotations 0). */
export function influence(sys, axis) {
  const r = new Float64Array(sys.ndof);
  for (let d = 0; d < sys.red.length; d++) if (sys.red[d] >= 0 && d % 6 === axis) r[sys.red[d]] = 1;
  return r;
}
export const reduceVec = (sys, full) => { const x = new Float64Array(sys.ndof); for (let d = 0; d < sys.red.length; d++) if (sys.red[d] >= 0) x[sys.red[d]] = full[d]; return x; };
export const mulCsr = (A, x) => csrMul(A, x, new Float64Array(A.n));
export const dot = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
/** a·A + b·B as a new Csr (patterns united). */
export function csrComb(a, A, b, B) {
  const C = new Coo(A.n);
  for (let i = 0; i < A.n; i++) {
    for (let p = A.ptr[i]; p < A.ptr[i + 1]; p++) C.add(i, A.col[p], a * A.val[p]);
    if (B) for (let p = B.ptr[i]; p < B.ptr[i + 1]; p++) C.add(i, B.col[p], b * B.val[p]);
  }
  return C.toCsr();
}

// ---- ground motion ---------------------------------------------------------------------------------------------------------------------------
const NUM = /^[+-]?(\d+\.?\d*|\.\d+)([eEdD][+-]?\d+)?$/;
const toNum = (s) => Number(String(s).replace(/[dD]/, 'e'));
/**
 * Text of a record → { ok, dt, a, n, header, uniform }. Accepts: two columns (time, acceleration) separated by commas, spaces, tabs or semicolons;
 * or one column of accelerations with `opts.dt`; or a PEER-style file whose header has "NPTS= …, DT= … SEC" (all numbers after the header are the record).
 * Lines starting with # or text are kept as the header. Does not change units: the caller says whether the numbers are g or m/s².
 */
export function parseGroundMotion(text, { dt = 0, maxPoints = 200000 } = {}) {
  const lines = String(text ?? '').replace(/\r/g, '').split('\n');
  const header = [], rows = [];
  let peerDt = 0;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = /DT\s*=\s*([0-9.eE+-]+)/i.exec(line);
    if (m && /NPTS/i.test(line)) peerDt = Number(m[1]);
    const parts = line.split(/[\s,;]+/).filter(Boolean);
    if (line[0] === '#' || !parts.every((p) => NUM.test(p))) { if (!rows.length) header.push(line.slice(0, 120)); continue; }
    rows.push(parts.map(toNum));
    if (rows.length > maxPoints * 5) break;
  }
  if (!rows.length) return { ok: false, error: 'no-numbers', header };
  let t = null, a;
  const cols = rows[0].length;
  if (peerDt > 0) { a = rows.flat(); }
  else if (cols === 2 && rows.every((r) => r.length === 2)) { t = rows.map((r) => r[0]); a = rows.map((r) => r[1]); }
  else if (cols === 1 || rows.every((r) => r.length === 1)) { a = rows.map((r) => r[0]); }
  else return { ok: false, error: 'columns', header };
  if (a.length < 2) return { ok: false, error: 'too-short', header };
  if (a.length > maxPoints) return { ok: false, error: 'too-long', header, n: a.length };
  if (!a.every(Number.isFinite)) return { ok: false, error: 'not-finite', header };
  if (t) {
    for (let i = 1; i < t.length; i++) if (!(t[i] > t[i - 1])) return { ok: false, error: 'time-order', header };
    const step = (t[t.length - 1] - t[0]) / (t.length - 1);
    const uniform = t.every((v, i) => Math.abs(v - t[0] - i * step) <= 1e-6 * Math.max(step, 1e-12) * Math.max(1, i));
    return { ok: true, t: Float64Array.from(t.map((v) => v - t[0])), dt: step, a: Float64Array.from(a), n: a.length, header, uniform };
  }
  const step = peerDt > 0 ? peerDt : dt;
  if (!(step > 0)) return { ok: false, error: 'need-dt', header };
  return { ok: true, t: null, dt: step, a: Float64Array.from(a), n: a.length, header, uniform: true };
}
/** A record at the constant step h by linear interpolation (the same piecewise-linear acceleration every method below integrates exactly or to its order). */
export function resample(rec, h, { tail = 0 } = {}) {
  const T = rec.t ? rec.t[rec.t.length - 1] : (rec.a.length - 1) * rec.dt;
  const total = T + tail, n = Math.floor(total / h + 1e-9) + 1, out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const x = i * h;
    if (x >= T) { out[i] = x - T < 1e-9 * Math.max(T, 1) ? rec.a[rec.a.length - 1] : 0; continue; }
    if (!rec.t) { const f = x / rec.dt, k = Math.min(rec.a.length - 2, Math.floor(f)); out[i] = rec.a[k] + (f - k) * (rec.a[k + 1] - rec.a[k]); continue; }
    let lo = 0, hi = rec.t.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (rec.t[mid] <= x) lo = mid; else hi = mid; }
    out[i] = rec.a[lo] + (x - rec.t[lo]) / (rec.t[hi] - rec.t[lo]) * (rec.a[hi] - rec.a[lo]);
  }
  return { dt: h, a: out, n };
}
/** Simple made-up inputs, always labelled synthetic: 'sine' (amplitude m/s², frequency Hz, cycles), 'pulse-half-sine' (amplitude, duration s), 'pulse-rect' (amplitude, duration s). Not earthquake records. */
export function syntheticMotion(kind, p = {}) {
  const amp = Number(p.amp ?? 1), dt = Number(p.dt ?? 0.005);
  if (kind === 'sine') {
    const f = Number(p.f ?? 1), cycles = Math.max(1, Number(p.cycles ?? 10)), T = cycles / f, n = Math.round(T / dt) + 1;
    return { kind, dt, a: Float64Array.from({ length: n }, (_, i) => amp * Math.sin(2 * Math.PI * f * i * dt)), label: 'synthetic', text: 'sine' };
  }
  if (kind === 'pulse-half-sine') {
    const d = Number(p.dur ?? 0.5), n = Math.round(d / dt) + 1;
    return { kind, dt, a: Float64Array.from({ length: n }, (_, i) => amp * Math.sin(Math.PI * i * dt / d)), label: 'synthetic', text: 'half-sine pulse' };
  }
  if (kind === 'pulse-rect') {
    const d = Number(p.dur ?? 0.5), n = Math.round(d / dt) + 1;
    return { kind, dt, a: Float64Array.from({ length: n }, (_, i) => (i === n - 1 ? 0 : amp)), label: 'synthetic', text: 'rectangular pulse' };
  }
  return null;
}

// ---- single degree of freedom, exact for a piecewise-linear force ---------------------------------------------------------------------------
/**
 * One step of x'' + 2ξω x' + ω² x = p(t), p linear on the step (p₀ → p₁ over h). Derived here: a particular solution of a ramp is
 * x_p = p₀/ω² + (Δp/h)(τ/ω² − 2ξ/ω³), x_p' = Δp/(hω²); the homogeneous part e^{−ξωτ}(A cos ω_dτ + B sin ω_dτ) takes the initial state:
 * A = x₀ − x_p(0), B = (v₀ − x_p'(0) + ξωA)/ω_d. ξ < 1. Returns [x₁, v₁].
 */
export function sdofStep(w, xi, h, x0, v0, p0, p1) {
  const wd = w * Math.sqrt(1 - xi * xi), dp = (p1 - p0) / h, e = Math.exp(-xi * w * h), c = Math.cos(wd * h), s = Math.sin(wd * h);
  const xp0 = p0 / (w * w) - 2 * xi * dp / (w ** 3), vp = dp / (w * w);
  const A = x0 - xp0, B = (v0 - vp + xi * w * A) / wd;
  const xh = e * (A * c + B * s), vh = e * ((-xi * w * A + wd * B) * c + (-xi * w * B - wd * A) * s);
  return [xh + p1 / (w * w) - 2 * xi * dp / (w ** 3), vh + vp];
}

/** Rayleigh coefficients giving ξ at both of two circular frequencies (Chopra, ch. 11): C = a0 M + a1 K. */
export function rayleighCoeffs(w1, w2, xi) { return { a0: 2 * xi * w1 * w2 / (w1 + w2), a1: 2 * xi / (w1 + w2) }; }
/** Damping ratios of the modes for a damping spec: { kind: 'modal', xi } or { kind: 'rayleigh', a0, a1 }. */
export function modalDamping(spec, w) {
  if (spec.kind === 'rayleigh') return w.map((x) => 0.5 * (spec.a0 / x + spec.a1 * x));
  return w.map(() => spec.xi);
}

/**
 * Modal superposition. `modes` = [{ w (rad/s), gamma (Γ along the input direction), xi }]; `a` = ground acceleration at the constant step h (mm/s²).
 * Each modal coordinate q solves q'' + 2ξωq' + ω²q = −Γ a_g exactly for the piecewise-linear record. Returns q[mode] = Float64Array(n) and qd (velocity),
 * from rest. Modal displacement of mode n is q_n φ_n. The record is the input as given; nothing is filtered.
 */
export function modalHistory(modes, a, h) {
  const n = a.length;
  return modes.map((m) => {
    const q = new Float64Array(n), qd = new Float64Array(n);
    let x = 0, v = 0;
    for (let i = 0; i + 1 < n; i++) { [x, v] = sdofStep(m.w, m.xi, h, x, v, -m.gamma * a[i], -m.gamma * a[i + 1]); q[i + 1] = x; qd[i + 1] = v; }
    return { q, qd };
  });
}

/**
 * Direct integration, Newmark average acceleration, of M u'' + C u' + K u = −M r a_g with C = a0 M + a1 K, from rest. sys = { K, M, ndof } reduced Csr.
 * Returns { U: [Float64Array(ndof) per step] when keep, steps, iter } calling `each(i, u, v, a)` after every step (including step 0). Unconditionally stable for linear
 * systems, second order in h. The effective stiffness is the same at every step, so it is factored (IC(0)) once.
 */
export function newmark(sys, r, a, h, { a0 = 0, a1 = 0, beta = 0.25, gamma = 0.5, each = null, tol = 1e-12 } = {}) {
  const n = sys.ndof, K = sys.K, M = sys.M, mr = mulCsr(M, r);
  const kM = 1 / (beta * h * h) + gamma * a0 / (beta * h), kK = 1 + gamma * a1 / (beta * h);
  const Keff = csrComb(kM, M, kK, K);
  let u = new Float64Array(n), v = new Float64Array(n), ac = Float64Array.from(r, (x) => -x * a[0]);
  let factor = null, iters = 0;
  if (each) each(0, u, v, ac);
  const tmp = new Float64Array(n), rhs = new Float64Array(n);
  for (let i = 0; i + 1 < a.length; i++) {
    const c1 = 1 / (beta * h * h), c2 = 1 / (beta * h), c3 = 1 / (2 * beta) - 1;
    // x1 = c1 u + c2 v + c3 a (mass part) ; x2 = gamma/(beta h) u + (gamma/beta − 1) v + h (gamma/(2 beta) − 1) a (damping part)
    const x1 = new Float64Array(n), x2 = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      x1[k] = c1 * u[k] + c2 * v[k] + c3 * ac[k];
      x2[k] = gamma / (beta * h) * u[k] + (gamma / beta - 1) * v[k] + h * (gamma / (2 * beta) - 1) * ac[k];
    }
    csrMul(M, x1, tmp); for (let k = 0; k < n; k++) rhs[k] = -mr[k] * a[i + 1] + tmp[k];
    if (a0 || a1) {                                                                  // C x2 = a0 M x2 + a1 K x2
      csrMul(M, x2, tmp); for (let k = 0; k < n; k++) rhs[k] += a0 * tmp[k];
      csrMul(K, x2, tmp); for (let k = 0; k < n; k++) rhs[k] += a1 * tmp[k];
    }
    const sol = pcg(Keff, rhs, { tol, x0: u, factor, maxIter: Math.max(200, 4 * n) });
    factor = sol.factor || factor; iters += sol.iter;
    if (!sol.ok) return { ok: false, step: i + 1, iter: iters };
    const un = sol.x, vn = new Float64Array(n), an = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      const du = un[k] - u[k];
      vn[k] = gamma / (beta * h) * du + (1 - gamma / beta) * v[k] + h * (1 - gamma / (2 * beta)) * ac[k];
      an[k] = c1 * du - c2 * v[k] - c3 * ac[k];
    }
    u = un; v = vn; ac = an;
    if (each) each(i + 1, u, v, ac);
  }
  return { ok: true, iter: iters, steps: a.length };
}
