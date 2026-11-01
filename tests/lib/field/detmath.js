/* SPDX-License-Identifier: Apache-2.0 */
/**
 * detmath.js — sine and cosine from + − × ÷ only (0.8 CE.1, rule D2).
 *
 * Math.sin / Math.cos are allowed to differ between engines in the last bits, and a field with a gyroid in it would then
 * differ between Node, Chrome, Firefox and Safari. Every operation below is an IEEE 754 double operation, which every engine
 * rounds the same way, so the same input gives the same bits everywhere. Accuracy about 1e-15 for |x| < 1e6 (textbook
 * Cody–Waite range reduction, then the Taylor series on [−π/2, π/2]); nobody needs more for a distance field.
 */
const TWO_PI_HI = 6.283185307179586, TWO_PI_LO = 2.4492935982947064e-16, INV_TWO_PI = 1 / TWO_PI_HI;
const PI = TWO_PI_HI / 2, HALF_PI = PI / 2;
const SIN_C = [], COS_C = [];
{
  let f = 1;                                   // 1/n! built by exact divisions, not typed in
  const inv = [1];
  for (let n = 1; n <= 26; n++) { f *= n; inv.push(1 / f); }
  for (let n = 0; n <= 12; n++) { SIN_C.push((n % 2 ? -1 : 1) * inv[2 * n + 1]); COS_C.push((n % 2 ? -1 : 1) * inv[2 * n]); }
}
function reduce(x) {                           // → r in [−π, π]
  const n = Math.floor(x * INV_TWO_PI + 0.5);
  return (x - n * TWO_PI_HI) - n * TWO_PI_LO;
}
function sinPoly(r) { const r2 = r * r; let s = SIN_C[12]; for (let n = 11; n >= 0; n--) s = s * r2 + SIN_C[n]; return s * r; }
function cosPoly(r) { const r2 = r * r; let s = COS_C[12]; for (let n = 11; n >= 0; n--) s = s * r2 + COS_C[n]; return s; }
export function dsin(x) {
  let r = reduce(x);
  if (r > HALF_PI) r = PI - r; else if (r < -HALF_PI) r = -PI - r;
  return sinPoly(r);
}
export function dcos(x) {
  const r = Math.abs(reduce(x));
  return r > HALF_PI ? -cosPoly(PI - r) : cosPoly(r);
}
export const DET_PI = PI;

// ---- the rest of the elementary functions (0.8 CE.4: CraftScript's math must give the same bits in every engine too) ----------
// exp, log, pow, atan and friends from + − × ÷, sqrt and the bits of a double. Accuracy a few ulp; exact where the answer is
// exact (log10 of a power of ten, log2 of a power of two, x**n for a whole n by repeated squaring).
const F64 = new Float64Array(1), U32 = new Uint32Array(F64.buffer);
const LE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1, HI = LE ? 1 : 0, LO = LE ? 0 : 1;
const LN2_HI = 6.93147180369123816490e-01, LN2_LO = 1.90821492927058770002e-10, INV_LN2 = 1.4426950408889634, LN10 = 2.302585092994046;
const pow2 = (k) => { U32[HI] = (k + 1023) << 20; U32[LO] = 0; return F64[0]; };           // 2^k for −1022 ≤ k ≤ 1023
export function dexp(x) {
  if (x !== x) return NaN;
  if (x > 709.782712893384) return Infinity;
  if (x < -745.1332191019411) return 0;
  const k = Math.floor(x * INV_LN2 + 0.5), r = (x - k * LN2_HI) - k * LN2_LO;
  let p = 1, term = 1;
  for (let n = 1; n <= 18; n++) { term = term * r / n; p += term; }
  if (k > 1023) return p * pow2(1023) * pow2(k - 1023);
  if (k < -1022) return p * pow2(-1022) * pow2(k + 1022);
  return p * pow2(k);
}
export function dlog(x) {
  if (x !== x || x < 0) return NaN;
  if (x === 0) return -Infinity;
  if (x === Infinity) return Infinity;
  F64[0] = x;
  let e = (U32[HI] >>> 20) & 0x7ff;
  if (e === 0) { F64[0] = x * 18014398509481984; e = ((U32[HI] >>> 20) & 0x7ff) - 54; }       // subnormal: scale by 2^54
  e -= 1023;
  U32[HI] = (U32[HI] & 0x000fffff) | 0x3ff00000;                                                // mantissa m in [1, 2)
  let m = F64[0];
  if (m > 1.4142135623730951) { m *= 0.5; e += 1; }                                             // m in [√2/2, √2]
  const s = (m - 1) / (m + 1), s2 = s * s;                                                        // ln m = 2 atanh s = 2 (s + s³/3 + s⁵/5 + …), |s| ≤ 0.172
  let acc = 1 / 29;
  for (let n = 27; n >= 1; n -= 2) acc = acc * s2 + 1 / n;
  return e * LN2_HI + (2 * s * acc + e * LN2_LO);
}
export function dlog2(x) {
  F64[0] = x;
  if (x > 0 && x < Infinity && U32[LO] === 0 && (U32[HI] & 0x000fffff) === 0 && ((U32[HI] >>> 20) & 0x7ff) !== 0) return ((U32[HI] >>> 20) & 0x7ff) - 1023;
  return dlog(x) * INV_LN2;
}
export function dlog10(x) {
  const r = dlog(x) / LN10;
  const n = Math.round(r);
  if (n >= -22 && n <= 22 && Math.abs(r - n) < 1e-9 && (n >= 0 ? ipow(10, n) === x : 1 / ipow(10, -n) === x)) return n;
  return r;
}
function ipow(x, n) { let r = 1; while (n > 0) { if (n & 1) r *= x; x *= x; n = Math.floor(n / 2); } return r; }
export function dpow(x, y) {
  if (y === 0) return 1;
  if (x !== x || y !== y) return Math.pow(x, y);
  if (Number.isInteger(y) && Math.abs(y) <= 1024) { const r = ipow(x, Math.abs(y)); return y < 0 ? 1 / r : r; }
  if (x === 1 || x === 0 || !Number.isFinite(x) || !Number.isFinite(y)) return Math.pow(x, y);
  if (x < 0) return NaN;                                                                          // a negative base with a fractional power
  return dexp(y * dlog(x));
}
export function datan(x) {
  if (x !== x) return NaN;
  const a = Math.abs(x);
  if (a === Infinity) return x > 0 ? HALF_PI : -HALF_PI;
  let z = a > 1 ? 1 / a : a;
  z = z / (1 + Math.sqrt(1 + z * z));                                                             // atan z = 2 atan(z / (1 + √(1+z²)))
  z = z / (1 + Math.sqrt(1 + z * z));                                                             // |z| ≤ tan(π/16) ≈ 0.199 after two halvings
  const z2 = z * z;                                                                               // atan z = z − z³/3 + z⁵/5 − …
  let acc = 0;
  for (let n = 41; n >= 1; n -= 2) acc = acc * (-z2) + 1 / n;
  let r = 4 * z * acc;
  if (a > 1) r = HALF_PI - r;
  return x < 0 ? -r : r;
}
export function datan2(y, x) {
  if (x !== x || y !== y) return NaN;
  if (x === 0 && y === 0) return Math.atan2(y, x);
  if (x > 0) return datan(y / x);
  if (x < 0) return y >= 0 && !(y === 0 && 1 / y < 0) ? datan(y / x) + PI : datan(y / x) - PI;
  return y > 0 ? HALF_PI : -HALF_PI;
}
export const dasin = (x) => (x > 1 || x < -1 ? NaN : datan2(x, Math.sqrt((1 - x) * (1 + x))));
export const dacos = (x) => (x > 1 || x < -1 ? NaN : 2 * datan2(Math.sqrt(1 - x), Math.sqrt(1 + x)));
export const dtan = (x) => dsin(x) / dcos(x);
export function dsinh(x) { if (Math.abs(x) < 0.1) { const x2 = x * x; return x * (1 + x2 / 6 * (1 + x2 / 20 * (1 + x2 / 42 * (1 + x2 / 72 * (1 + x2 / 110))))); } const e = dexp(x); return (e - 1 / e) / 2; }
export function dcosh(x) { const e = dexp(x); return (e + 1 / e) / 2; }
export function dtanh(x) { if (Math.abs(x) > 20) return x > 0 ? 1 : -1; if (Math.abs(x) < 0.1) return dsinh(x) / dcosh(x); const e = dexp(2 * x); return (e - 1) / (e + 1); }
export function dcbrt(x) { if (x === 0 || !Number.isFinite(x)) return x; const a = Math.abs(x); let r = dexp(dlog(a) / 3); r = r - (r * r * r - a) / (3 * r * r); r = r - (r * r * r - a) / (3 * r * r); return x < 0 ? -r : r; }
