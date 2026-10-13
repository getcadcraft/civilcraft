/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors and report notes are English (an app translates what it shows). */
/**
 * lz-r2004-write.js — the R2004-family LZ77 compressor (cc-dwg, Apache-2.0). Used for R2004, R2010, R2013 and
 * R2018 sections (R2007 has its own scheme, see r2007-write.js).
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1, ch. 4.7 (opcodes, Literal Length,
 * Two Byte Offset, Long Compression Offset). The spec describes decompression only; the encoder below emits
 * exactly those opcodes:
 *   offset ≤ 0x400, length 3–14      → opcode 0x40–0xFF + one byte
 *   offset ≤ 0x4000, length 3–33     → 0x21–0x3F + Two Byte Offset;  longer → 0x20 + Long Compression Offset
 *   offset ≤ 0x7FFF, length 4–9      → 0x12–0x17 + Two Byte Offset;  longer → 0x10 + long length
 * Up to 3 literals after a match ride in the opcode's low bits; more get a Literal Length. A literal run of 0
 * is signalled by the next opcode itself (its high nibble is set), and 0x11 ends the stream.
 *
 * Spec gap: the "compOffset" the opcodes carry is the back distance minus one (decompressing AutoCAD's
 * example_2004.dwg only reproduces the AcDb:Header sentinel with distance = compOffset + 1).
 * Spec gap: a Literal Length byte 0x01–0x0F means value + 3 (so 0x0F = 18), the 0x00 form covers 19 and up.
 * Spec gap: opcodes 0x10–0x1F are one family: length = (op & 7) + 2, with op & 7 = 0 meaning "Long Compression
 *   Offset + 7" (the spec's 0x10 rule), and op & 8 adds 0x4000 to the offset (so 0x18–0x1F are not "(op & 0x0F) + 2").
 *   0x11 (length 3, no high bit) is the terminator. Found by experiment: LibreDWG's dwgread (a test-only black box;
 *   see PROVENANCE.md) reported an extended length for our 0x18 opcode when it read our file; AutoCAD's own sample
 *   files decode consistently under this rule.
 */

// Distances stop at 0x8000: a DWG page holds at most 0x7400 bytes, and longer distances would need the
// 0x18–0x1F opcodes whose meaning the spec and real readers disagree on (see the note above).
const MIN_MATCH = 3, MAX_DIST = 0x3FFF + 0x3FFF + 1, HASH_BITS = 15, MAX_CHAIN = 64;

/** Compress `src` (Uint8Array). `literalOnly` writes one literal run (useful for tests). */
export function compressR2004(src, { literalOnly = false } = {}) {
  const n = src.length;
  const out = new Out(n + (n >> 3) + 64);
  if (n < 4) {   // the first literal run must be at least 4 bytes long: pad with zeros (readers take the logical size)
    const p = new Uint8Array(4); p.set(src); return compressR2004(p, { literalOnly });
  }
  if (literalOnly) { out.literalLength(n); out.bytes(src, 0, n); out.byte(0x11); return out.result(); }

  const head = new Int32Array(1 << HASH_BITS).fill(-1);
  const prev = new Int32Array(n).fill(-1);
  const hash = (i) => (((src[i] << 16) | (src[i + 1] << 8) | src[i + 2]) * 2654435761 >>> (32 - HASH_BITS));
  const insert = (i) => { if (i + 2 < n) { const h = hash(i); prev[i] = head[h]; head[h] = i; } };

  // find all matches greedily (with one-step lazy evaluation)
  const tokens = [];                      // [start, length, distance] of each match
  let i = 4;                              // the first 4 bytes are always literal (see above)
  for (let k = 0; k < 4 && k < n; k++) insert(k);
  const best = (pos) => {
    if (pos + MIN_MATCH > n) return null;
    let cand = head[hash(pos)], bestLen = 0, bestDist = 0, chain = 0;
    const maxLen = n - pos;
    while (cand >= 0 && chain++ < MAX_CHAIN) {
      const dist = pos - cand;
      if (dist > MAX_DIST) break;
      if (src[cand + bestLen] === src[pos + bestLen] && src[cand] === src[pos]) {
        let l = 0;
        while (l < maxLen && src[cand + l] === src[pos + l]) l++;
        if (l > bestLen && encodable(l, dist)) { bestLen = l; bestDist = dist; if (l === maxLen) break; }
      }
      cand = prev[cand];
    }
    return bestLen >= MIN_MATCH ? [bestLen, bestDist] : null;
  };
  while (i < n) {
    const m = best(i);
    if (!m) { insert(i); i++; continue; }
    insert(i);
    const m2 = i + 1 < n ? best(i + 1) : null;   // lazy: a longer match one byte later wins
    let at = i, len = m[0], dist = m[1];
    if (m2 && m2[0] > m[0]) { at = i + 1; len = m2[0]; dist = m2[1]; insert(at); }
    tokens.push([at, len, dist]);
    for (let k = at + 1; k < at + len; k++) insert(k);
    i = at + len;
  }

  // emit
  const first = tokens.length ? tokens[0][0] : n;
  out.literalLength(first); out.bytes(src, 0, first);
  for (let t = 0; t < tokens.length; t++) {
    const [start, len, dist] = tokens[t];
    const end = start + len;
    const nextStart = t + 1 < tokens.length ? tokens[t + 1][0] : n;
    const litCount = nextStart - end;
    out.match(len, dist, litCount);
    if (litCount > 3) out.literalLength(litCount);
    out.bytes(src, end, nextStart);
  }
  out.byte(0x11);
  return out.result();
}

/** Can a match of this length and distance be written with the opcodes we have? */
function encodable(len, dist) {
  const co = dist - 1;
  if (co <= 0x3FFF) return len >= 3;
  if (co <= 0x3FFF + 0x3FFF) return len >= 4;
  return false;
}

class Out {
  constructor(size) { this.buf = new Uint8Array(Math.max(64, size)); this.pos = 0; }
  grow(k) { if (this.pos + k > this.buf.length) { const b = new Uint8Array(Math.max(this.pos + k, this.buf.length * 2)); b.set(this.buf); this.buf = b; } }
  byte(v) { this.grow(1); this.buf[this.pos++] = v & 0xFF; }
  bytes(src, a, b) { this.grow(b - a); this.buf.set(src.subarray(a, b), this.pos); this.pos += b - a; }
  /** Literal Length (≥ 4). */
  literalLength(v) {
    if (v <= 0) return;
    if (v < 4) throw new Error('literal run shorter than 4');
    if (v <= 18) { this.byte(v - 3); return; }
    this.byte(0);
    let r = v - 3 - 0x0F;
    while (r > 0xFF) { this.byte(0); r -= 0xFF; }
    this.byte(r);
  }
  /** Long Compression Offset (≥ 1). */
  longValue(v) {
    if (v <= 0xFF) { this.byte(v); return; }
    this.byte(0);
    let r = v - 0xFF;
    while (r > 0xFF) { this.byte(0); r -= 0xFF; }
    this.byte(r);
  }
  twoByte(off, litCode) { this.byte(((off & 0x3F) << 2) | litCode); this.byte(off >> 6); }
  match(len, dist, litCount) {
    const lc = litCount <= 3 ? litCount : 0;
    const co = dist - 1;
    if (co <= 0x3FF && len <= 14) {
      this.byte(((len + 1) << 4) | ((co & 3) << 2) | lc);
      this.byte(co >> 2);
    } else if (co <= 0x3FFF) {
      if (len <= 33) this.byte(0x1E + len); else { this.byte(0x20); this.longValue(len - 0x21); }
      this.twoByte(co, lc);
    } else {
      let c2 = co - 0x3FFF, hi = 0;
      if (c2 > 0x3FFF) { c2 -= 0x4000; hi = 8; }
      if (len <= 9) this.byte(0x10 | hi | (len - 2)); else { this.byte(0x10 | hi); this.longValue(len - 9); }
      this.twoByte(c2, lc);
    }
  }
  result() { return this.buf.slice(0, this.pos); }
}

/** A plain decompressor for this module's own tests (the library's reader has its own). */
export function decompressR2004ForTest(src, outSize) {
  const out = new Uint8Array(outSize); let o = 0, i = 0;
  const litLen = () => { let b = src[i]; if (b >= 0x10) return 0; i++; if (b) return b + 3; let t = 0x0F; for (;;) { b = src[i++]; if (b) { t += b; break; } t += 0xFF; } return t + 3; };
  const longV = () => { let b = src[i++]; if (b) return b; let t = 0xFF; for (;;) { b = src[i++]; if (b) return t + b; t += 0xFF; } };
  const two = () => { const a = src[i++], b = src[i++]; return [(a >> 2) | (b << 6), a & 3]; };
  let k = litLen(); while (k--) out[o++] = src[i++];
  for (;;) {
    const op = src[i++]; let len, off, lit;
    if (op === 0x11) break;
    if (op < 0x20) { len = op & 7 ? (op & 7) + 2 : longV() + 9; [off, lit] = two(); off += 0x3FFF + ((op & 8) << 11); }
    else if (op === 0x20) { len = longV() + 0x21; [off, lit] = two(); }
    else if (op < 0x40) { len = op - 0x1E; [off, lit] = two(); }
    else { len = (op >> 4) - 1; off = (src[i++] << 2) | ((op & 0x0C) >> 2); lit = op & 3; }
    for (let j = 0; j < len; j++, o++) out[o] = out[o - off - 1];
    if (!lit) lit = litLen();
    while (lit--) out[o++] = src[i++];
  }
  return out.subarray(0, o);
}
