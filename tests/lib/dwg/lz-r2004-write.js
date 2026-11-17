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
let headS = new Int32Array(1 << 15), prevS = new Int32Array(0x7400), tokS = new Int32Array(3 * 1024), outS = new Uint8Array(0x8000);   // scratch (HASH_BITS = 15)
const MIN_MATCH = 3, MAX_DIST = 0x3FFF + 0x3FFF + 1, HASH_BITS = 15, MAX_CHAIN = 64;

/** Compress `src` (Uint8Array). `literalOnly` writes one literal run (useful for tests). */
export function compressR2004(src, { literalOnly = false } = {}) {
  const n = src.length;
  const out = new Out(n + (n >> 3) + 64, true);
  if (n < 4) {   // the first literal run must be at least 4 bytes long: pad with zeros (readers take the logical size)
    const p = new Uint8Array(4); p.set(src); return compressR2004(p, { literalOnly });
  }
  if (literalOnly) { out.literalLength(n); out.bytes(src, 0, n); out.byte(0x11); return out.result(); }

  // scratch tables are reused from page to page: a new typed array per 29 KB page, 2,600 times for a 75 MB drawing, made the
  // garbage collector run a full collection of the whole (multi-GB) heap each few pages (PERF.5)
  const head = headS; head.fill(-1);
  if (prevS.length < n) prevS = new Int32Array(Math.max(n, prevS.length * 2));
  const prev = prevS; prev.fill(-1, 0, n);
  // tokens: start, length, distance of each match, in flat typed arrays (PERF.5: no array per match)
  let tok = tokS, nTok = 0;
  let mLen = 0, mDist = 0;                // result of best()
  const last = n - 2;                     // insert() needs i + 2 < n
  const insert = (i) => {
    if (i < last) { const h = (((src[i] << 16) | (src[i + 1] << 8) | src[i + 2]) * 2654435761 >>> (32 - HASH_BITS)); prev[i] = head[h]; head[h] = i; }
  };

  // find all matches greedily (with one-step lazy evaluation)
  let i = 4;                              // the first 4 bytes are always literal (see above)
  for (let k = 0; k < 4 && k < n; k++) insert(k);
  // sets mLen / mDist; false when there is no match of MIN_MATCH or more
  const best = (pos) => {
    mLen = 0; mDist = 0;
    if (pos + MIN_MATCH > n) return false;
    let cand = head[(((src[pos] << 16) | (src[pos + 1] << 8) | src[pos + 2]) * 2654435761 >>> (32 - HASH_BITS))], bestLen = 0, bestDist = 0, chain = 0;
    const maxLen = n - pos, s0 = src[pos], s1 = src[pos + 1], s2 = src[pos + 2];
    while (cand >= 0 && chain++ < MAX_CHAIN) {
      const dist = pos - cand;
      if (dist > MAX_DIST) break;
      // (a candidate shorter than 3 can never be taken - encodable() needs 3 - so bytes 1 and 2 are tested before the run is counted)
      if (src[cand + bestLen] === src[pos + bestLen] && src[cand] === s0 && src[cand + 1] === s1 && src[cand + 2] === s2) {
        let l = 0;
        while (l < maxLen && src[cand + l] === src[pos + l]) l++;
        if (l > bestLen && encodable(l, dist)) { bestLen = l; bestDist = dist; if (l === maxLen) break; }
      }
      cand = prev[cand];
    }
    if (bestLen < MIN_MATCH) return false;
    mLen = bestLen; mDist = bestDist;
    return true;
  };
  while (i < n) {
    if (!best(i)) { insert(i); i++; continue; }
    insert(i);
    let at = i, len = mLen, dist = mDist;
    if (i + 1 < n && best(i + 1) && mLen > len) { at = i + 1; len = mLen; dist = mDist; insert(at); }   // lazy: a longer match one byte later wins
    if (nTok + 3 > tok.length) { const t2 = new Int32Array(tok.length * 2); t2.set(tok); tok = tokS = t2; }
    tok[nTok++] = at; tok[nTok++] = len; tok[nTok++] = dist;
    for (let k = at + 1; k < at + len; k++) insert(k);
    i = at + len;
  }

  // emit
  const first = nTok ? tok[0] : n;
  out.literalLength(first); out.bytes(src, 0, first);
  for (let t = 0; t < nTok; t += 3) {
    const start = tok[t], len = tok[t + 1], dist = tok[t + 2];
    const end = start + len;
    const nextStart = t + 3 < nTok ? tok[t + 3] : n;
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
  constructor(size, scratch = false) {
    if (scratch) { if (outS.length < size) outS = new Uint8Array(size); outS.fill(0, 0, Math.min(outS.length, 64)); this.buf = outS; }   // the bytes are always written before they are read
    else this.buf = new Uint8Array(Math.max(64, size));
    this.pos = 0; this.scratch = scratch;
  }
  grow(k) { if (this.pos + k > this.buf.length) { const b = new Uint8Array(Math.max(this.pos + k, this.buf.length * 2)); b.set(this.buf); this.buf = b; if (this.scratch) outS = b; } }
  byte(v) { this.grow(1); this.buf[this.pos++] = v & 0xFF; }
  bytes(src, a, b) {
    const k = b - a; this.grow(k);
    if (k < 24) { const buf = this.buf; let p = this.pos; for (let j = a; j < b; j++) buf[p++] = src[j]; } else this.buf.set(src.subarray(a, b), this.pos);
    this.pos += k;
  }
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
