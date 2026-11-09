/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-png.js — a small PNG encoder for resin layer pictures (roadmap RSN.*). 8-bit grayscale (colour type 0), one IDAT, filter 1 (Sub) on every row.
 * The zlib stream comes from CompressionStream('deflate') (browsers, Node 24). Written from the PNG and zlib specifications. No DOM, imports nothing.
 *
 *   crc32(bytes: Uint8Array, seed = 0) → number      the CRC-32 of the ISO 3309 / PNG / ZIP kind (unsigned); seed continues an earlier result
 *   encodePng8(gray: Uint8Array, w, h) → Promise<Uint8Array>   the whole .png file; throws when gray.length !== w * h or a side is not 1..2^31-1
 *   deflateZlib(bytes) → Promise<Uint8Array>         the zlib stream the PNG uses
 *
 * Read back by our own reader (tools/printresin/sl1-read.mjs) only; no printer has loaded these.
 */
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes, seed = 0) {
  let c = ~seed >>> 0;
  for (let i = 0; i < bytes.length; i++) c = TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

export async function deflateZlib(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

export async function encodePng8(gray, w, h) {
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 0x7fffffff || h > 0x7fffffff) throw new Error('png size');
  if (gray.length !== w * h) throw new Error('png pixels');
  const raw = new Uint8Array((w + 1) * h);
  for (let y = 0; y < h; y++) {
    const o = y * (w + 1), s = y * w;
    raw[o] = 1;                                              // Sub: each byte minus the one to its left
    raw[o + 1] = gray[s];
    for (let x = 1; x < w; x++) raw[o + 1 + x] = (gray[s + x] - gray[s + x - 1]) & 0xff;
  }
  const ihdr = new Uint8Array(13), dv = new DataView(ihdr.buffer);
  dv.setUint32(0, w); dv.setUint32(4, h);
  ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;   // 8 bit, gray, deflate, filter method 0, no interlace
  const parts = [Uint8Array.from(SIGNATURE), chunk('IHDR', ihdr), chunk('IDAT', await deflateZlib(raw)), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
