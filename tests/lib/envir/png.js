/* SPDX-License-Identifier: Apache-2.0 */
/**
 * png.js — a PNG writer with no dependencies and no compression (stored deflate blocks), so a shade-study image or a frame of the
 * animation can be saved from any host, in a worker or in Node (0.9 SU.1119, cc-envir).
 *   encodePng(w, h, rgba: Uint8Array|Uint8ClampedArray, scale = 1) → Uint8Array      scale repeats each pixel (a 60-cell map saved at 8× is a readable picture)
 */
let TABLE = null;
function crc32(buf, crc = 0xffffffff) {
  if (!TABLE) { TABLE = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c >>> 0; } }
  for (let i = 0; i < buf.length; i++) crc = TABLE[(crc ^ buf[i]) & 255] ^ (crc >>> 8);
  return crc;
}
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length), dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, (crc32(out.subarray(4, 8 + data.length)) ^ 0xffffffff) >>> 0);
  return out;
}
export function encodePng(w, h, rgba, scale = 1) {
  const s = Math.max(1, Math.floor(scale)), W = w * s, H = h * s;
  if (!(W > 0 && H > 0) || W * H > 64e6) throw new Error('bad_size');
  const rowLen = 1 + W * 4, raw = new Uint8Array(rowLen * H);
  for (let y = 0; y < H; y++) {
    const sy = Math.floor(y / s), o = y * rowLen;
    for (let x = 0; x < W; x++) { const sx = Math.floor(x / s), a = (sy * w + sx) * 4, b = o + 1 + x * 4; raw[b] = rgba[a]; raw[b + 1] = rgba[a + 1]; raw[b + 2] = rgba[a + 2]; raw[b + 3] = rgba[a + 3]; }
  }
  const blocks = Math.ceil(raw.length / 65535) || 1, z = new Uint8Array(2 + raw.length + blocks * 5 + 4);
  z[0] = 0x78; z[1] = 0x01;
  let p = 2, a1 = 1, a2 = 0;
  for (let i = 0; i < raw.length; i += 65535) {
    const n = Math.min(65535, raw.length - i), last = i + n >= raw.length ? 1 : 0;
    z[p++] = last; z[p++] = n & 255; z[p++] = n >> 8; z[p++] = ~n & 255; z[p++] = (~n >> 8) & 255;
    z.set(raw.subarray(i, i + n), p); p += n;
  }
  for (let i = 0; i < raw.length; i++) { a1 = (a1 + raw[i]) % 65521; a2 = (a2 + a1) % 65521; }
  new DataView(z.buffer).setUint32(p, ((a2 << 16) | a1) >>> 0);
  const ihdr = new Uint8Array(13), dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W); dv.setUint32(4, H); ihdr[8] = 8; ihdr[9] = 6;
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', z), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let o = 0; for (const q of parts) { out.set(q, o); o += q.length; }
  return out;
}
