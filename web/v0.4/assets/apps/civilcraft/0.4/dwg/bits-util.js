/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bits-util.js — byte and bit helpers shared by the readers and passthrough.js (cc-dwg, Apache-2.0): base64 both ways and
 * a bit range copied out of a stream. Its own module so surface-read.js need not import passthrough.js (which imports the
 * writer, which imports objects-read.js: an import cycle that read-async.js cannot link for a worker).
 */

export function b64(u8) {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('base64');
  let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s);
}
export function unb64(s) {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(s || '', 'base64'));
  const t = atob(s || ''); const u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return u;
}

/** Bits [from, to) of buf as a byte array starting at bit 0 (MSB first, as the DWG bit streams are). */
export function sliceBits(buf, from, to) {
  const n = Math.max(0, to - from);
  const out = new Uint8Array((n + 7) >> 3);
  const sh = from & 7, b0 = from >> 3;
  if (!sh) out.set(buf.subarray(b0, b0 + out.length));
  else for (let i = 0; i < out.length; i++) out[i] = ((buf[b0 + i] << sh) | ((buf[b0 + i + 1] || 0) >> (8 - sh))) & 0xFF;
  if (n & 7) out[out.length - 1] &= (0xFF << (8 - (n & 7))) & 0xFF;
  return out;
}
