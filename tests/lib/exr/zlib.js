/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is internal diagnostics (the {why} of ccexr.damaged.chunk / ccexr.write.bad_image) and file-format text. */
/**
 * zlib.js — zlib streams (RFC 1950) around deflate (RFC 1951), written from the RFCs. Synchronous, so an EXR block
 * unpacks inside the read loop, and capped: unpacking stops with an error the moment the output would pass the size the
 * caller expects (an EXR block always knows its unpacked size), so a "zip bomb" costs nothing.
 *
 *   inflateZlib(bytes, size) → Uint8Array of exactly `size` bytes (throws Error('…') on anything else)
 *   deflateZlib(bytes, {level}) → Uint8Array (zlib header, deflate blocks, Adler-32)
 *     level 0 = stored blocks only; 1 (default) = LZ77 with hash chains + fixed Huffman codes. Plain and deterministic:
 *     the same bytes always give the same stream. (Dynamic Huffman blocks are not written; readers don't care.)
 */

// ---------------------------------------------------------------- tables (RFC 1951 § 3.2.5)

const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073,
  4097, 6145, 8193, 12289, 16385, 24577];
const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
const CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

const FAST = 9;   // bits looked up at once; longer codes go the slow canonical way

/** A decoding table from code lengths: fast[] (sym << 4 | len, 0 = longer than FAST), plus counts/symbols for the slow path. */
function buildTable(lengths, n) {
  const counts = new Uint16Array(16);
  for (let i = 0; i < n; i++) counts[lengths[i]]++;
  counts[0] = 0;
  let left = 1;
  for (let len = 1; len <= 15; len++) {
    left = left * 2 - counts[len];
    if (left < 0) throw new Error('over-subscribed code');
  }
  const offs = new Uint16Array(16);
  for (let len = 1; len < 15; len++) offs[len + 1] = offs[len] + counts[len];
  const symbols = new Uint16Array(n);
  for (let i = 0; i < n; i++) if (lengths[i]) symbols[offs[lengths[i]]++] = i;
  const fast = new Uint16Array(1 << FAST);
  // canonical codes, assigned in symbol order per length; stored bit-reversed because deflate sends them MSB first
  const next = new Uint16Array(16);
  let code = 0;
  for (let len = 1; len <= 15; len++) { code = (code + counts[len - 1]) << 1; next[len] = code; }
  for (let i = 0; i < n; i++) {
    const len = lengths[i];
    if (!len || len > FAST) continue;
    const c = next[len]++;
    let r = 0;
    for (let k = 0; k < len; k++) r |= ((c >> k) & 1) << (len - 1 - k);
    for (let j = r; j < (1 << FAST); j += 1 << len) fast[j] = (i << 4) | len;
  }
  return { fast, counts, symbols };
}

let FIXED_LIT = null;
let FIXED_DIST = null;
function fixedTables() {
  if (!FIXED_LIT) {
    const l = new Uint8Array(288);
    for (let i = 0; i < 144; i++) l[i] = 8;
    for (let i = 144; i < 256; i++) l[i] = 9;
    for (let i = 256; i < 280; i++) l[i] = 7;
    for (let i = 280; i < 288; i++) l[i] = 8;
    FIXED_LIT = buildTable(l, 288);
    FIXED_DIST = buildTable(new Uint8Array(30).fill(5), 30);
  }
  return [FIXED_LIT, FIXED_DIST];
}

// ---------------------------------------------------------------- inflate

export function inflateZlib(src, size) {
  if (src.length < 6) throw new Error('too short');
  const cmf = src[0];
  const flg = src[1];
  if ((cmf & 15) !== 8 || (cmf >> 4) > 7 || ((cmf << 8) | flg) % 31 !== 0) throw new Error('not a zlib stream');
  if (flg & 0x20) throw new Error('preset dictionary');
  const out = new Uint8Array(size);
  const end = inflateRaw(src, 2, out);
  if (end.out !== size) throw new Error('unpacks to ' + end.out + ' bytes, not ' + size);
  // Adler-32, when it is there (a few writers stop at the last block)
  if (end.pos + 4 <= src.length) {
    const want = ((src[end.pos] << 24) | (src[end.pos + 1] << 16) | (src[end.pos + 2] << 8) | src[end.pos + 3]) >>> 0;
    if (adler32(out) !== want) throw new Error('checksum');
  }
  return out;
}

function inflateRaw(src, start, out) {
  let pos = start;
  let bitbuf = 0;
  let bitcnt = 0;
  let op = 0;
  const cap = out.length;
  const srcLen = src.length;

  const need = (n) => {
    while (bitcnt < n) {
      if (pos >= srcLen) throw new Error('cut short');
      bitbuf |= src[pos++] << bitcnt;
      bitcnt += 8;
    }
  };
  const bits = (n) => {
    need(n);
    const v = bitbuf & ((1 << n) - 1);
    bitbuf >>>= n;
    bitcnt -= n;
    return v;
  };
  const decode = (t) => {
    // fill as far as the input allows (the end of the stream may hold fewer than FAST bits)
    while (bitcnt < FAST && pos < srcLen) { bitbuf |= src[pos++] << bitcnt; bitcnt += 8; }
    const e = t.fast[bitbuf & ((1 << FAST) - 1)];
    if (e && (e & 15) <= bitcnt) {
      const len = e & 15;
      bitbuf >>>= len;
      bitcnt -= len;
      return e >> 4;
    }
    // slow: canonical decode one bit at a time (RFC 1951's construction)
    let code = 0;
    let first = 0;
    let index = 0;
    for (let len = 1; len <= 15; len++) {
      code |= bits(1);
      const count = t.counts[len];
      if (code - count < first) return t.symbols[index + (code - first)];
      index += count;
      first += count;
      first <<= 1;
      code <<= 1;
    }
    throw new Error('bad code');
  };

  for (;;) {
    const last = bits(1);
    const type = bits(2);
    if (type === 0) {
      bitbuf = 0;
      bitcnt = 0;
      if (pos + 4 > srcLen) throw new Error('cut short');
      const len = src[pos] | (src[pos + 1] << 8);
      const nlen = src[pos + 2] | (src[pos + 3] << 8);
      pos += 4;
      if ((len ^ 0xffff) !== nlen) throw new Error('stored block length');
      if (pos + len > srcLen) throw new Error('cut short');
      if (op + len > cap) throw new Error('unpacks larger than expected');
      out.set(src.subarray(pos, pos + len), op);
      pos += len;
      op += len;
    } else if (type === 1 || type === 2) {
      let lit;
      let dist;
      if (type === 1) [lit, dist] = fixedTables();
      else {
        const nlen = bits(5) + 257;
        const ndist = bits(5) + 1;
        const ncode = bits(4) + 4;
        if (nlen > 286 || ndist > 30) throw new Error('bad counts');
        const cl = new Uint8Array(19);
        for (let i = 0; i < ncode; i++) cl[CL_ORDER[i]] = bits(3);
        const clt = buildTable(cl, 19);
        const lens = new Uint8Array(nlen + ndist);
        for (let i = 0; i < nlen + ndist;) {
          const sym = decode(clt);
          if (sym < 16) lens[i++] = sym;
          else {
            let rep;
            let val = 0;
            if (sym === 16) { if (!i) throw new Error('repeat with no length'); val = lens[i - 1]; rep = 3 + bits(2); }
            else if (sym === 17) rep = 3 + bits(3);
            else rep = 11 + bits(7);
            if (i + rep > nlen + ndist) throw new Error('too many lengths');
            while (rep--) lens[i++] = val;
          }
        }
        if (!lens[256]) throw new Error('no end-of-block code');
        lit = buildTable(lens.subarray(0, nlen), nlen);
        dist = buildTable(lens.subarray(nlen), ndist);
      }
      for (;;) {
        const sym = decode(lit);
        if (sym < 256) {
          if (op >= cap) throw new Error('unpacks larger than expected');
          out[op++] = sym;
        } else if (sym === 256) break;
        else {
          const li = sym - 257;
          if (li >= 29) throw new Error('bad length code');
          const len = LEN_BASE[li] + bits(LEN_EXTRA[li]);
          const di = decode(dist);
          if (di >= 30) throw new Error('bad distance code');
          const d = DIST_BASE[di] + bits(DIST_EXTRA[di]);
          if (d > op) throw new Error('distance too far back');
          if (op + len > cap) throw new Error('unpacks larger than expected');
          for (let k = 0; k < len; k++, op++) out[op] = out[op - d];
        }
      }
    } else throw new Error('bad block type');
    if (last) break;
  }
  return { pos, out: op };
}

export function adler32(b) {
  let a = 1;
  let s = 0;
  for (let i = 0; i < b.length;) {
    const stop = Math.min(b.length, i + 5552);
    for (; i < stop; i++) { a += b[i]; s += a; }
    a %= 65521;
    s %= 65521;
  }
  return ((s << 16) | a) >>> 0;
}

// ---------------------------------------------------------------- deflate (fixed codes + LZ77)

class BitOut {
  constructor(size) { this.b = new Uint8Array(Math.max(64, size)); this.pos = 0; this.acc = 0; this.n = 0; }
  room(k) {
    if (this.pos + k <= this.b.length) return;
    const nb = new Uint8Array(Math.max(this.b.length * 2, this.pos + k));
    nb.set(this.b.subarray(0, this.pos));
    this.b = nb;
  }
  put(v, n) {   // n ≤ 24, LSB first
    this.acc |= v << this.n;
    this.n += n;
    while (this.n >= 8) { this.room(1); this.b[this.pos++] = this.acc & 255; this.acc >>>= 8; this.n -= 8; }
  }
  /** a Huffman code, sent MSB first */
  code(c, len) {
    let r = 0;
    for (let k = 0; k < len; k++) r |= ((c >> k) & 1) << (len - 1 - k);
    this.put(r, len);
  }
  align() { if (this.n) { this.room(1); this.b[this.pos++] = this.acc & 255; this.acc = 0; this.n = 0; } }
}

function fixedLit(o, sym) {
  if (sym < 144) o.code(0x30 + sym, 8);
  else if (sym < 256) o.code(0x190 + sym - 144, 9);
  else if (sym < 280) o.code(sym - 256, 7);
  else o.code(0xc0 + sym - 280, 8);
}

function lenCode(len) { let i = 28; while (LEN_BASE[i] > len) i--; return i; }
function distCode(d) { let i = 29; while (DIST_BASE[i] > d) i--; return i; }

export function deflateZlib(src, { level = 1 } = {}) {
  const o = new BitOut(src.length + (src.length >> 3) + 64);
  o.put(0x78, 8);
  o.put(0x01, 8);
  if (level === 0 || src.length === 0) {
    let p = 0;
    do {
      const n = Math.min(65535, src.length - p);
      o.put(p + n >= src.length ? 1 : 0, 1);
      o.put(0, 2);
      o.align();
      o.room(4 + n);
      o.b[o.pos++] = n & 255; o.b[o.pos++] = n >> 8; o.b[o.pos++] = ~n & 255; o.b[o.pos++] = (~n >> 8) & 255;
      o.b.set(src.subarray(p, p + n), o.pos);
      o.pos += n;
      p += n;
    } while (p < src.length);
  } else {
    o.put(1, 1);   // one final block,
    o.put(1, 2);   // fixed Huffman codes
    const HBITS = 15;
    const head = new Int32Array(1 << HBITS).fill(-1);
    const prev = new Int32Array(32768);
    const n = src.length;
    const hash = (i) => (((src[i] << 10) ^ (src[i + 1] << 5) ^ src[i + 2]) & ((1 << HBITS) - 1));
    let i = 0;
    while (i < n) {
      let bestLen = 0;
      let bestDist = 0;
      if (i + 2 < n) {
        const h = hash(i);
        let cand = head[h];
        let chain = 48;
        const maxLen = Math.min(258, n - i);
        while (cand >= 0 && i - cand <= 32768 && chain--) {
          if (src[cand + bestLen] === src[i + bestLen]) {
            let l = 0;
            while (l < maxLen && src[cand + l] === src[i + l]) l++;
            if (l > bestLen) { bestLen = l; bestDist = i - cand; if (l === maxLen) break; }
          }
          cand = prev[cand & 32767];
        }
        prev[i & 32767] = head[h];
        head[h] = i;
      }
      if (bestLen >= 3) {
        const li = lenCode(bestLen);
        fixedLit(o, 257 + li);
        if (LEN_EXTRA[li]) o.put(bestLen - LEN_BASE[li], LEN_EXTRA[li]);
        const di = distCode(bestDist);
        o.code(di, 5);
        if (DIST_EXTRA[di]) o.put(bestDist - DIST_BASE[di], DIST_EXTRA[di]);
        // keep the hash chains going through the match (cheaply: every position)
        const stop = i + bestLen;
        for (let k = i + 1; k < stop && k + 2 < n; k++) { const h = hash(k); prev[k & 32767] = head[h]; head[h] = k; }
        i = stop;
      } else {
        fixedLit(o, src[i]);
        i++;
      }
    }
    fixedLit(o, 256);
  }
  o.align();
  const a = adler32(src);
  o.room(4);
  o.b[o.pos++] = a >>> 24; o.b[o.pos++] = (a >>> 16) & 255; o.b[o.pos++] = (a >>> 8) & 255; o.b[o.pos++] = a & 255;
  return o.b.slice(0, o.pos);
}
