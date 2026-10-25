/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — error keys and data fields; the words are in the apps' language files (scan.* keys). */
/**
 * util.js — limits and the scratch buffers of cc-raster (0.7 LC.6). DOM-free.
 *
 * Scans and PDFs are untrusted input: every reader checks sizes before it allocates and refuses with a `RasterError`
 * whose `key` is a language key suffix (the apps print `scan.err.<key>`).
 */
export const MAX_PIXELS = 100e6;          // one picture (the same cap as pictures.js)
export const MAX_BYTES = 128 * 1024 * 1024;   // one file
export const MAX_PAGES = 200;             // pages of a TIFF
export const MAX_TRACE_PIXELS = 64e6;     // what one trace works on at once (a window keeps a bigger sheet possible)

export class RasterError extends Error {
  constructor(key, detail) { super(key + (detail ? ': ' + detail : '')); this.key = key; this.detail = detail || ''; }
}
export const refuse = (key, detail) => { throw new RasterError(key, detail); };

/** Check a picture's size before allocating for it. */
export function checkSize(w, h, channels = 1) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) refuse('size');
  if (w * h > MAX_PIXELS) refuse('pixels', w + 'x' + h);
  if (w * h * channels > 4 * MAX_PIXELS) refuse('pixels', w + 'x' + h);
}

/**
 * Scratch typed arrays that are made once and reused (hot loops allocate nothing): `ws.u8('name', n)` returns the same
 * array again while it is big enough (contents are NOT cleared unless `fill` is given).
 */
export class Workspace {
  constructor() { this.m = new Map(); }
  get(Type, name, n, fill) {
    let a = this.m.get(name);
    if (!a || a.length < n || !(a instanceof Type)) { a = new Type(Math.max(n, 16)); this.m.set(name, a); }
    if (fill !== undefined) a.fill(fill, 0, n);
    return a;
  }
  u8(name, n, fill) { return this.get(Uint8Array, name, n, fill); }
  i32(name, n, fill) { return this.get(Int32Array, name, n, fill); }
  f64(name, n, fill) { return this.get(Float64Array, name, n, fill); }
  clear() { this.m.clear(); }
}

/** The bytes of a Uint8Array / ArrayBuffer / array as a Uint8Array view (no copy). */
export const bytesOf = (b) => (b instanceof Uint8Array ? b : new Uint8Array(b || []));
