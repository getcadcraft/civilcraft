/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words for people here. */
/**
 * geom-vec.js — the array-vector one-liners every app typed again (0.11 PERF.74; tools/perf/quality-utils.mjs counted 2,088 vector helpers, the
 * top clusters are these exact bodies). Pure functions, no imports, no DOM. lib/geom2d is canonical; each app carries a byte copy in
 * <app>/dev/geom-vec.js made by `node tools/geom2d/sync.mjs <app>`; nobody edits a copy.
 *
 * Every body is the text the copies had (same operations in the same order), so a caller that swaps its own copy for one of these gets the
 * same bits: tools/perf/util-copies.mjs only replaces a copy whose syntax tree is one of the accepted forms, and
 * tools/perf/test-util-copies.mjs runs each replaced old text against the function here on random and edge inputs.
 *
 * 3D, [x, y, z]:  dot3 sub3 add3 cross3 len3 dist3 scale3 lerp3 unit3 (a zero vector stays [0, 0, 0] … see unit3)
 * 2D, [x, y]:     dot2 sub2 add2 cross2 len2 dist2 scale2 mid2 unit2
 * 2D affine:      affineMul(a, b) — PDF-style [a b c d e f] matrices: the matrix that applies b first, then a
 */

export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a) => Math.hypot(a[0], a[1], a[2]);
export const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const scale3 = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** a / |a|; a zero vector is divided by 1 (so [0, 0, 0] stays [0, 0, 0], NaN stays NaN), as the copies did. */
export const unit3 = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

export const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
export const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];
export const len2 = (a) => Math.hypot(a[0], a[1]);
export const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
export const scale2 = (a, s) => [a[0] * s, a[1] * s];
export const mid2 = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
/** a / |a|; a zero (or NaN) vector gives [1, 0], as the copies did. */
export const unit2 = (v) => { const L = Math.hypot(v[0], v[1]); return L > 0 ? [v[0] / L, v[1] / L] : [1, 0]; };

/** The 2D affine product of [a b c d e f] matrices (a point goes through b first, then a), the same six sums the PDF / takeoff copies wrote. */
export const affineMul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
