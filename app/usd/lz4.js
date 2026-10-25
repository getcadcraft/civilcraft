/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lz4.js — LZ4 blocks (the published "LZ4 Block Format Description") and the chunked wrapper the binary USD format puts
 * round them (one leading byte: 0 = a single block, else the number of chunks, each with a 32-bit compressed size —
 * learned from the reference library's TfFastCompression, see NOTICE). Our own code; DOM-free, imports util.js only.
 *
 *   lz4Decompress(src, out)  → bytes written into `out` (a Uint8Array sized to the most the block may produce)
 *   lz4Compress(src)         → Uint8Array (a valid block; greedy matcher with a 4-byte hash)
 *   unpackChunks(src, size)  → Uint8Array(size) — throws `damaged` when the data does not unpack to exactly size bytes
 *   packChunks(src)          → Uint8Array
 */
import { damaged } from './util.js';

const CHUNK = 0x7e000000;   // the largest input one block takes

export function lz4Decompress(src, out) {
  let s = 0, o = 0;
  const sn = src.length, on = out.length;
  const bad = () => damaged('ccusd.damaged.lz4');
  while (s < sn) {
    const token = src[s++];
    let lit = token >>> 4;
    if (lit === 15) { let b; do { if (s >= sn) throw bad(); b = src[s++]; lit += b; } while (b === 255); }
    if (s + lit > sn || o + lit > on) throw bad();
    out.set(src.subarray(s, s + lit), o);
    s += lit; o += lit;
    if (s >= sn) break;                       // the last sequence has literals only
    if (s + 2 > sn) throw bad();
    const off = src[s] | (src[s + 1] << 8);
    s += 2;
    if (off === 0 || off > o) throw bad();
    let ml = token & 15;
    if (ml === 15) { let b; do { if (s >= sn) throw bad(); b = src[s++]; ml += b; } while (b === 255); }
    ml += 4;
    if (o + ml > on) throw bad();
    let from = o - off;
    if (off >= ml) { out.copyWithin(o, from, from + ml); o += ml; } else for (let k = 0; k < ml; k++) out[o++] = out[from++];
  }
  return o;
}

export function lz4Compress(src) {
  const n = src.length;
  const out = new Uint8Array(n + Math.ceil(n / 255) + 16);
  let o = 0, anchor = 0;
  const HB = 16, table = new Int32Array(1 << HB).fill(-1);
  const hash = (i) => (Math.imul(src[i] | (src[i + 1] << 8) | (src[i + 2] << 16) | (src[i + 3] << 24), 2654435761) >>> (32 - HB));
  const putLen = (len) => { while (len >= 255) { out[o++] = 255; len -= 255; } out[o++] = len; };
  const emit = (litEnd, off, ml) => {
    const lit = litEnd - anchor;
    const tok = o++;
    out[tok] = (Math.min(lit, 15) << 4) | (ml === null ? 0 : Math.min(ml - 4, 15));
    if (lit >= 15) putLen(lit - 15);
    out.set(src.subarray(anchor, litEnd), o); o += lit;
    if (ml === null) return;
    out[o++] = off & 255; out[o++] = off >>> 8;
    if (ml - 4 >= 15) putLen(ml - 4 - 15);
  };
  // matches may not start in the last 12 bytes and must end 5 bytes before the end (the format's rules)
  const mflimit = n - 12, matchEnd = n - 5;
  let i = 0;
  while (i < mflimit) {
    const h = hash(i), cand = table[h];
    table[h] = i;
    if (cand >= 0 && i - cand < 65536 && src[cand] === src[i] && src[cand + 1] === src[i + 1] && src[cand + 2] === src[i + 2] && src[cand + 3] === src[i + 3]) {
      let ml = 4;
      while (i + ml < matchEnd && src[cand + ml] === src[i + ml]) ml++;
      emit(i, i - cand, ml);
      i += ml;
      anchor = i;
      if (i - 2 >= 0 && i - 2 < mflimit) table[hash(i - 2)] = i - 2;
    } else i++;
  }
  emit(n, 0, null);
  return out.slice(0, o);
}

export function unpackChunks(src, size) {
  const out = new Uint8Array(size);
  if (!src.length) throw damaged('ccusd.damaged.lz4');
  const n = src[0];
  let got = 0;
  if (n === 0) got = lz4Decompress(src.subarray(1), out);
  else {
    let s = 1;
    const dv = new DataView(src.buffer, src.byteOffset, src.byteLength);
    for (let c = 0; c < n; c++) {
      if (s + 4 > src.length) throw damaged('ccusd.damaged.lz4');
      const len = dv.getInt32(s, true);
      s += 4;
      if (len < 0 || s + len > src.length) throw damaged('ccusd.damaged.lz4');
      got += lz4Decompress(src.subarray(s, s + len), out.subarray(got, Math.min(size, got + CHUNK)));
      s += len;
    }
  }
  if (got !== size) throw damaged('ccusd.damaged.lz4');
  return out;
}

export function packChunks(src) {
  if (src.length <= CHUNK) {
    const c = lz4Compress(src);
    const out = new Uint8Array(c.length + 1);
    out.set(c, 1);
    return out;
  }
  const parts = [];
  for (let s = 0; s < src.length; s += CHUNK) parts.push(lz4Compress(src.subarray(s, Math.min(src.length, s + CHUNK))));
  const out = new Uint8Array(1 + parts.reduce((a, p) => a + 4 + p.length, 0));
  const dv = new DataView(out.buffer);
  out[0] = parts.length;
  let o = 1;
  for (const p of parts) { dv.setInt32(o, p.length, true); out.set(p, o + 4); o += 4 + p.length; }
  return out;
}
