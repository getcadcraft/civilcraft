/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rng.js — seeded random numbers and distributions for cc-des (0.8 XE.5; DOM-free, no imports).
 * Generator: xoshiro128** (Blackman & Vigna, public domain) seeded through splitmix32. One stream per node, derived from the run seed and the node's name,
 * so changing one node does not change the numbers another node draws (common random numbers between scenarios).
 * Distribution forms:  5 | {const: 5} | {exp: mean} | {uniform: [a, b]} | {tri: [a, mode, b]} | {normal: [mean, sd]} (cut at 0) |
 *                      {lognormal: [mean, sd]} (of the variable itself) | {erlang: [k, mean]} | {empirical: [[value, weight], …]} | {weibull: [shape, scale]}
 */
function splitmix32(a) { return function () { a |= 0; a = a + 0x9e3779b9 | 0; let t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad); t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97); return ((t = t ^ t >>> 15) >>> 0); }; }
export function hashString(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export class Rng {
  constructor(seed = 1, stream = '') {
    const sm = splitmix32((seed ^ hashString(String(stream))) >>> 0); this.s = [sm(), sm(), sm(), sm()];
    if (!(this.s[0] | this.s[1] | this.s[2] | this.s[3])) this.s[0] = 1;
    for (let i = 0; i < 8; i++) this.u32();
  }
  u32() { const s = this.s, rotl = (x, k) => (x << k) | (x >>> (32 - k)), r = Math.imul(rotl(Math.imul(s[1], 5), 7), 9) >>> 0, t = s[1] << 9; s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = rotl(s[3], 11); return r; }
  /** uniform in (0, 1) — never exactly 0 or 1 */
  next() { return (this.u32() + 0.5) / 4294967296; }
  normal() { const u = this.next(), v = this.next(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
}

/** Check a distribution form; returns null or a message. */
export function distProblem(d) {
  if (typeof d === 'number') return Number.isFinite(d) && d >= 0 ? null : 'a constant must be a number ≥ 0';
  if (!d || typeof d !== 'object') return 'not a distribution';
  const k = Object.keys(d); if (k.length !== 1) return 'a distribution has exactly one key';
  const [name] = k, v = d[name], pos = (x) => typeof x === 'number' && Number.isFinite(x) && x > 0, nn = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0;
  switch (name) {
    case 'const': return nn(v) ? null : 'const needs a number ≥ 0';
    case 'exp': return pos(v) ? null : 'exp needs a mean > 0';
    case 'uniform': return Array.isArray(v) && v.length === 2 && nn(v[0]) && nn(v[1]) && v[0] <= v[1] ? null : 'uniform needs [a, b] with 0 ≤ a ≤ b';
    case 'tri': return Array.isArray(v) && v.length === 3 && v.every(nn) && v[0] <= v[1] && v[1] <= v[2] && v[0] < v[2] ? null : 'tri needs [a, mode, b] with a ≤ mode ≤ b';
    case 'normal': return Array.isArray(v) && v.length === 2 && nn(v[0]) && nn(v[1]) ? null : 'normal needs [mean, sd] ≥ 0';
    case 'lognormal': return Array.isArray(v) && v.length === 2 && pos(v[0]) && nn(v[1]) ? null : 'lognormal needs [mean > 0, sd ≥ 0]';
    case 'erlang': return Array.isArray(v) && v.length === 2 && Number.isInteger(v[0]) && v[0] >= 1 && pos(v[1]) ? null : 'erlang needs [k ≥ 1 (whole), mean > 0]';
    case 'weibull': return Array.isArray(v) && v.length === 2 && pos(v[0]) && pos(v[1]) ? null : 'weibull needs [shape > 0, scale > 0]';
    case 'empirical': return Array.isArray(v) && v.length > 0 && v.every((p) => Array.isArray(p) && nn(p[0]) && pos(p[1])) ? null : 'empirical needs [[value ≥ 0, weight > 0], …]';
    default: return `unknown distribution "${name}"`;
  }
}
export function sample(d, rng) {
  if (typeof d === 'number') return d;
  const name = Object.keys(d)[0], v = d[name];
  switch (name) {
    case 'const': return v;
    case 'exp': return -v * Math.log(rng.next());
    case 'uniform': return v[0] + (v[1] - v[0]) * rng.next();
    case 'tri': { const [a, c, b] = v, u = rng.next(), f = (c - a) / (b - a); return u < f ? a + Math.sqrt(u * (b - a) * (c - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - c)); }
    case 'normal': { for (let i = 0; i < 50; i++) { const x = v[0] + v[1] * rng.normal(); if (x >= 0) return x; } return v[0]; }
    case 'lognormal': { const s2 = Math.log(1 + (v[1] / v[0]) ** 2), mu = Math.log(v[0]) - s2 / 2; return Math.exp(mu + Math.sqrt(s2) * rng.normal()); }
    case 'erlang': { let p = 1; for (let i = 0; i < v[0]; i++) p *= rng.next(); return -(v[1] / v[0]) * Math.log(p); }
    case 'weibull': return v[1] * Math.pow(-Math.log(rng.next()), 1 / v[0]);
    case 'empirical': { const tot = v.reduce((s, p) => s + p[1], 0); let u = rng.next() * tot; for (const p of v) { u -= p[1]; if (u <= 0) return p[0]; } return v[v.length - 1][0]; }
  }
  return NaN;
}
/** Mean of a distribution (used for load estimates and for checks). */
export function mean(d) {
  if (typeof d === 'number') return d;
  const name = Object.keys(d)[0], v = d[name];
  switch (name) {
    case 'const': case 'exp': return v;
    case 'uniform': return (v[0] + v[1]) / 2;
    case 'tri': return (v[0] + v[1] + v[2]) / 3;
    case 'normal': return v[0];
    case 'lognormal': return v[0];
    case 'erlang': return v[1];
    case 'weibull': { return v[1] * gammaFn(1 + 1 / v[0]); }
    case 'empirical': { const tot = v.reduce((s, p) => s + p[1], 0); return v.reduce((s, p) => s + p[0] * p[1], 0) / tot; }
  }
  return NaN;
}
/** Lanczos approximation of Γ(x) for x > 0. */
export function gammaFn(x) {
  const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.PI / (Math.sin(Math.PI * x) * gammaFn(1 - x));
  x -= 1; let a = c[0]; const t = x + g + 0.5; for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
}
