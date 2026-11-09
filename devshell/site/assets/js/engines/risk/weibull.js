/* SPDX-License-Identifier: Apache-2.0 */
import { problem, method } from './common.js';

/** Γ(x) for x > 0, Lanczos approximation (g = 7, n = 9), relative error about 1e-14. */
export function gamma(x) {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x));
  x -= 1; let a = c[0]; const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}

export const W = {
  cdf: (t, b, e) => (t <= 0 ? 0 : 1 - Math.exp(-Math.pow(t / e, b))),
  reliability: (t, b, e) => (t <= 0 ? 1 : Math.exp(-Math.pow(t / e, b))),
  pdf: (t, b, e) => (t <= 0 ? 0 : (b / e) * Math.pow(t / e, b - 1) * Math.exp(-Math.pow(t / e, b))),
  hazard: (t, b, e) => (b / e) * Math.pow(Math.max(t, 0) / e, b - 1),
  quantile: (F, b, e) => e * Math.pow(-Math.log(1 - F), 1 / b),
  mean: (b, e) => e * gamma(1 + 1 / b),
  /** The life by which a share p of units has failed (B10 = life(0.1)). */
  life: (p, b, e) => e * Math.pow(-Math.log(1 - p), 1 / b),
};

export const M_W = method('Two-parameter Weibull life data analysis', 'Maximum likelihood with right-censoring (Nelson 1982; Meeker & Escobar 1998); median-rank regression with Bernard\'s approximation and Johnson\'s adjusted ranks',
  ['Two parameters, no failure-free period (no location parameter) and one failure mode: mixed modes make a bent Weibull plot, which is not fitted.', 'Right-censored (suspended) data only: no interval or left-censored data.',
   'Confidence bounds are normal approximations from the observed information: rough below about 20 failures.', 'Fewer than two distinct failure times cannot be fitted.']);

function prep(times, censored) {
  const d = times.map((t, i) => ({ t, c: !!(censored && censored[i]) }));
  const probs = [];
  if (d.some((x) => !(x.t > 0) || !Number.isFinite(x.t))) probs.push(problem('time', 'error', 'Every time must be a positive number.', []));
  const fails = d.filter((x) => !x.c), distinct = new Set(fails.map((x) => x.t)).size;
  if (!probs.length && distinct < 2) probs.push(problem('too-few', 'error', 'At least two failures at different times are needed to fit a Weibull.', [], { found: distinct, req: 2 }));
  return { d, fails, probs };
}

/** Log-likelihood of (β, η): Σ_failures ln f(t) + Σ_suspended ln R(t). */
export function logLik(d, b, e) { let s = 0; for (const x of d) s += x.c ? -Math.pow(x.t / e, b) : Math.log(b / e) + (b - 1) * Math.log(x.t / e) - Math.pow(x.t / e, b); return s; }

export function fitMLE(times, censored = null, { level = 0.9 } = {}) {
  const { d, fails, probs } = prep(times, censored);
  if (probs.length) return { ok: false, problems: probs, method: M_W };
  const r = fails.length, sumLn = fails.reduce((a, x) => a + Math.log(x.t), 0), tmax = Math.max(...d.map((x) => x.t));
  const g = (b) => { let s0 = 0, s1 = 0; for (const x of d) { const w = Math.pow(x.t / tmax, b); s0 += w; s1 += w * Math.log(x.t); } return s1 / s0 - 1 / b - sumLn / r; };
  let lo = 0.01, hi = 200; // g is increasing in β
  if (g(lo) > 0 || g(hi) < 0) return { ok: false, problems: [problem('no-root', 'error', 'The likelihood has no maximum for these times (all alike?).', [])], method: M_W };
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (g(mid) > 0) hi = mid; else lo = mid; }
  const b = (lo + hi) / 2;
  const e = tmax * Math.pow(d.reduce((a, x) => a + Math.pow(x.t / tmax, b), 0) / r, 1 / b);
  // observed information in (ln β, ln η) by central differences
  const f = (u, v) => logLik(d, Math.exp(u), Math.exp(v)), u0 = Math.log(b), v0 = Math.log(e), h = 1e-4;
  const huu = (f(u0 + h, v0) - 2 * f(u0, v0) + f(u0 - h, v0)) / (h * h), hvv = (f(u0, v0 + h) - 2 * f(u0, v0) + f(u0, v0 - h)) / (h * h);
  const huv = (f(u0 + h, v0 + h) - f(u0 + h, v0 - h) - f(u0 - h, v0 + h) + f(u0 - h, v0 - h)) / (4 * h * h);
  const det = huu * hvv - huv * huv, varU = -hvv / det, varV = -huu / det;
  const z = level === 0.95 ? 1.96 : level === 0.99 ? 2.576 : 1.645;
  const bounds = det > 0 && varU > 0 && varV > 0 ? { level, beta: [Math.exp(u0 - z * Math.sqrt(varU)), Math.exp(u0 + z * Math.sqrt(varU))], eta: [Math.exp(v0 - z * Math.sqrt(varV)), Math.exp(v0 + z * Math.sqrt(varV))] } : null;
  const out = [];
  if (r < 20) out.push(problem('few-failures', 'info', `Only ${r} failure${r === 1 ? '' : 's'}: the confidence bounds are rough.`, [], { found: r, req: 20 }));
  if (!bounds) out.push(problem('no-bounds', 'warning', 'Confidence bounds could not be worked out for these data.', []));
  return { ok: true, beta: b, eta: e, failures: r, suspended: d.length - r, logLik: logLik(d, b, e), bounds, mean: W.mean(b, e), b10: W.life(0.1, b, e),
    shape: b < 0.95 ? 'infant mortality (falling hazard)' : b > 1.05 ? 'wear-out (rising hazard)' : 'about constant hazard (random failures)', problems: out, method: M_W };
}

/** Median ranks: Johnson's adjusted rank for suspended data, Bernard's approximation (i − 0.3)/(n + 0.4). */
export function medianRanks(times, censored = null) {
  const d = times.map((t, i) => ({ t, c: !!(censored && censored[i]) })).sort((a, b) => a.t - b.t || (a.c ? 1 : 0) - (b.c ? 1 : 0)), n = d.length, out = [];
  let prev = 0;
  d.forEach((x, k) => { if (x.c) return; const inc = (n + 1 - prev) / (1 + (n - k)); prev += inc; out.push({ t: x.t, order: prev, F: (prev - 0.3) / (n + 0.4) }); });
  return out;
}

/** Rank regression (Y on X) on the Weibull plot: ln t against ln(−ln(1 − F)). Also returns the points for drawing the plot. */
export function fitMRR(times, censored = null) {
  const { fails, probs } = prep(times, censored);
  if (probs.length) return { ok: false, problems: probs, method: M_W };
  const pts = medianRanks(times, censored), X = pts.map((p) => Math.log(p.t)), Y = pts.map((p) => Math.log(-Math.log(1 - p.F)));
  const n = pts.length, mx = X.reduce((a, b) => a + b, 0) / n, my = Y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (X[i] - mx) * (Y[i] - my); sxx += (X[i] - mx) ** 2; syy += (Y[i] - my) ** 2; }
  const b = sxy / sxx, a = my - b * mx, e = Math.exp(-a / b), r2 = syy > 0 ? (sxy * sxy) / (sxx * syy) : 1;
  const out = r2 < 0.9 ? [problem('poor-fit', 'warning', `The points do not lie on a straight Weibull plot (R² ${r2.toFixed(2)}): mixed failure modes, or not Weibull.`, [], { found: r2, req: 0.9 })] : [];
  return { ok: true, beta: b, eta: e, r2, points: pts.map((p, i) => ({ ...p, x: X[i], y: Y[i] })), failures: fails.length, mean: W.mean(b, e), b10: W.life(0.1, b, e), problems: out, method: M_W };
}
