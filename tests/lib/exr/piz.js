/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is internal diagnostics (the {why} of ccexr.damaged.chunk / ccexr.write.bad_image) and file-format text. */
/**
 * piz.js — OpenEXR's PIZ compression: a 16-bit range table (bitmap + LUT), a 2D Haar-like wavelet per channel plane,
 * then a canonical Huffman coder with a run-length pseudo-symbol. The OpenEXR documents describe PIZ only in outline, so
 * the exact bit layout follows OpenEXR's own C sources (src/lib/OpenEXRCore/internal_piz.c and internal_huf.c,
 * BSD-3-Clause, © Contributors to the OpenEXR Project; see lib/exr/NOTICE). The code here is our own JavaScript.
 *
 *   pizDecode(src, planes) → fills planes (Uint16Array per channel plane, already sized; see below) or throws Error
 *   pizEncode(planes) → Uint8Array, or null when the data does not fit the coder (the caller then stores the block raw)
 *
 * `planes` = [{ data: Uint16Array (nx × ny × w words), nx, ny, w }] in channel order, one per channel of the block:
 * w = 1 for HALF, 2 for FLOAT/UINT (each 32-bit sample is two 16-bit words, transformed separately), words in the
 * order they sit in the file (little-endian halves, low word first).
 *
 * Block layout: u16 minNonZero, u16 maxNonZero, bitmap bytes [min..max] (only when min ≤ max), u32 Huffman length,
 * then the Huffman stream: u32 im, u32 iM, u32 table bytes, u32 bit count, u32 0, the packed code-length table
 * (6-bit lengths; 59–62 = runs of 2–5 unused symbols, 63 + 8 bits = a run of 6–261), the codes. Symbol iM is the
 * run code: after it, 8 bits say how many more copies of the previous symbol follow.
 */

const USHORT_RANGE = 65536;
const BITMAP_SIZE = 8192;
const HUF_ENCSIZE = USHORT_RANGE + 1;
const SHORT_ZEROCODE_RUN = 59;
const LONG_ZEROCODE_RUN = 63;
const SHORTEST_LONG_RUN = 2 + LONG_ZEROCODE_RUN - SHORT_ZEROCODE_RUN;   // 6
const LONGEST_LONG_RUN = 255 + SHORTEST_LONG_RUN;
// Codes are kept as Numbers, exact up to 2^53. OpenEXR allows 58 bits, but a code that long needs a block of more than
// ~10^11 symbols to arise from real frequencies; a table naming one is refused as damaged. (Spec gap.)
const MAX_LEN = 52;
const FAST = 12;

// ---------------------------------------------------------------- range table

function reverseLut(bitmap) {
  const lut = new Uint16Array(USHORT_RANGE);
  let k = 0;
  for (let i = 0; i < USHORT_RANGE; i++) if (i === 0 || (bitmap[i >> 3] & (1 << (i & 7)))) lut[k++] = i;
  return { lut, max: k - 1 };
}

// ---------------------------------------------------------------- wavelet

const s16 = (v) => (v << 16) >> 16;

function wdec14(l, h) {   // → [a, b] as uint16
  const ls = s16(l);
  const hs = s16(h);
  const ai = ls + (hs & 1) + (hs >> 1);
  return [ai & 0xffff, (ai - hs) & 0xffff];
}
function wenc14(a, b) {   // → [l, h]
  const as = s16(a);
  const bs = s16(b);
  return [((as + bs) >> 1) & 0xffff, (as - bs) & 0xffff];
}
const A_OFFSET = 1 << 15;
const MOD_MASK = 0xffff;
function wdec16(l, h) {
  const bb = (l - (h >> 1)) & MOD_MASK;
  const aa = (h + bb - A_OFFSET) & MOD_MASK;
  return [aa, bb];
}
function wenc16(a, b) {
  const ao = (a + A_OFFSET) & MOD_MASK;
  let m = (ao + b) >> 1;
  const d = ao - b;
  if (d < 0) m = (m + A_OFFSET) & MOD_MASK;
  return [m, d & MOD_MASK];
}

/** In place, words at in[base + x*ox + y*oy]. */
function wav2dDecode(a, base, nx, ox, ny, oy, mx) {
  const w14 = mx < (1 << 14);
  const dec = w14 ? wdec14 : wdec16;
  const n = Math.min(nx, ny);
  let p = 1;
  while (p <= n) p <<= 1;
  p >>= 1;
  let p2 = p;
  p >>= 1;
  while (p >= 1) {
    const oy1 = oy * p;
    const oy2 = oy * p2;
    const ox1 = ox * p;
    const ox2 = ox * p2;
    const ey = base + oy * (ny - p2);
    let py = base;
    for (; py <= ey; py += oy2) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        const p10 = px + oy1;
        const p11 = p10 + ox1;
        // 2D: first along y on both columns, then along x on both rows
        const [i00, i10] = dec(a[px], a[p10]);
        const [i01, i11] = dec(a[p01], a[p11]);
        const [r00, r01] = dec(i00, i01);
        const [r10, r11] = dec(i10, i11);
        a[px] = r00; a[p01] = r01; a[p10] = r10; a[p11] = r11;
      }
      if (nx & p) {
        const p10 = px + oy1;
        const [i00, i10] = dec(a[px], a[p10]);
        a[px] = i00; a[p10] = i10;
      }
    }
    if (ny & p) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        const [i00, i01] = dec(a[px], a[p01]);
        a[px] = i00; a[p01] = i01;
      }
    }
    p2 = p;
    p >>= 1;
  }
}

function wav2dEncode(a, base, nx, ox, ny, oy, mx) {
  const w14 = mx < (1 << 14);
  const enc = w14 ? wenc14 : wenc16;
  const n = Math.min(nx, ny);
  let p = 1;
  let p2 = 2;
  while (p2 <= n) {
    const oy1 = oy * p;
    const oy2 = oy * p2;
    const ox1 = ox * p;
    const ox2 = ox * p2;
    const ey = base + oy * (ny - p2);
    let py = base;
    for (; py <= ey; py += oy2) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        const p10 = px + oy1;
        const p11 = p10 + ox1;
        const [i00, i01] = enc(a[px], a[p01]);
        const [i10, i11] = enc(a[p10], a[p11]);
        const [r00, r10] = enc(i00, i10);
        const [r01, r11] = enc(i01, i11);
        a[px] = r00; a[p10] = r10; a[p01] = r01; a[p11] = r11;
      }
      if (nx & p) {
        const p10 = px + oy1;
        const [l, h] = enc(a[px], a[p10]);
        a[px] = l; a[p10] = h;
      }
    }
    if (ny & p) {
      let px = py;
      const ex = py + ox * (nx - p2);
      for (; px <= ex; px += ox2) {
        const p01 = px + ox1;
        const [l, h] = enc(a[px], a[p01]);
        a[px] = l; a[p01] = h;
      }
    }
    p = p2;
    p2 <<= 1;
  }
}

// ---------------------------------------------------------------- Huffman

/** Canonical codes from lengths (OpenEXR's rule: shorter codes are numerically higher; same length → in symbol order). */
function canonical(lengths, im, iM) {
  const n = new Array(MAX_LEN + 2).fill(0);
  for (let i = im; i <= iM; i++) n[lengths[i]]++;
  let c = 0;
  for (let i = 58; i > 0; i--) {
    const cnt = i <= MAX_LEN ? n[i] : 0;
    const nc = Math.floor((c + cnt) / 2);
    n[i] = c;
    c = nc;
  }
  const codes = new Float64Array(HUF_ENCSIZE);
  for (let i = im; i <= iM; i++) { const l = lengths[i]; if (l > 0) codes[i] = n[l]++; }
  return codes;
}

function unpackTable(src, pos, end, im, iM) {
  const lengths = new Uint8Array(HUF_ENCSIZE);
  let c = 0;
  let lc = 0;
  const get = (nb) => {
    while (lc < nb) {
      if (pos >= end) throw new Error('code table cut short');
      c = ((c << 8) | src[pos++]) >>> 0;
      lc += 8;
    }
    lc -= nb;
    const v = (c >>> lc) & ((1 << nb) - 1);
    c &= (1 << lc) - 1;
    return v;
  };
  for (let i = im; i <= iM; i++) {
    const l = get(6);
    if (l === LONG_ZEROCODE_RUN) {
      const run = get(8) + SHORTEST_LONG_RUN;
      if (i + run > iM + 1) throw new Error('code table run too long');
      i += run - 1;   // lengths stay 0
    } else if (l >= SHORT_ZEROCODE_RUN) {
      const run = l - SHORT_ZEROCODE_RUN + 2;
      if (i + run > iM + 1) throw new Error('code table run too long');
      i += run - 1;
    } else {
      if (l > MAX_LEN) throw new Error('code longer than ' + MAX_LEN + ' bits');
      lengths[i] = l;
    }
  }
  return { lengths, pos };
}

function hufDecode(src, start, nCompressed, out) {
  if (nCompressed < 20) {
    if (out.length) throw new Error('Huffman data too short');
    return;
  }
  const dv = new DataView(src.buffer, src.byteOffset + start, nCompressed);
  const im = dv.getUint32(0, true);
  const iM = dv.getUint32(4, true);
  const nBits = dv.getUint32(12, true);
  if (im >= HUF_ENCSIZE || iM >= HUF_ENCSIZE || im > iM) throw new Error('bad symbol range');
  const end = start + nCompressed;
  const t = unpackTable(src, start + 20, end, im, iM);
  const { lengths } = t;
  const dataStart = t.pos;
  if (dataStart + Math.ceil(nBits / 8) > end) throw new Error('codes cut short');
  const codes = canonical(lengths, im, iM);

  // fast table for codes ≤ FAST bits: index = the code's bits padded with zeros on the right
  const fast = new Int32Array(1 << FAST).fill(-1);
  const fastLen = new Uint8Array(1 << FAST);
  // longer codes: per length, the first code and the symbols in code order
  const first = new Float64Array(MAX_LEN + 1);
  const count = new Uint32Array(MAX_LEN + 1);
  const bySym = [];
  for (let l = 0; l <= MAX_LEN; l++) bySym.push([]);
  for (let i = im; i <= iM; i++) {
    const l = lengths[i];
    if (!l) continue;
    const code = codes[i];
    if (l <= FAST) {
      const lo = code * (1 << (FAST - l));
      const hi = lo + (1 << (FAST - l));
      if (hi > (1 << FAST)) throw new Error('bad code table');
      for (let j = lo; j < hi; j++) {
        if (fast[j] !== -1) throw new Error('codes overlap');
        fast[j] = i;
        fastLen[j] = l;
      }
    } else {
      if (!bySym[l].length) first[l] = code;
      bySym[l].push(i);
      count[l]++;
    }
  }
  const rlc = iM;
  const no = out.length;
  let op = 0;
  let bit = 0;   // next bit to read, counted from dataStart
  const peek = (n) => {   // n ≤ 24 bits from `bit`, zeros past nBits
    let v = 0;
    for (let k = 0; k < n;) {
      const b = bit + k;
      if (b >= nBits) { v *= 2 ** (n - k); break; }
      const byte = src[dataStart + (b >> 3)];
      const off = b & 7;
      const take = Math.min(8 - off, n - k);
      v = v * (1 << take) + ((byte >> (8 - off - take)) & ((1 << take) - 1));
      k += take;
    }
    return v;
  };
  while (bit < nBits) {
    let sym;
    const j = peek(FAST);
    if (fast[j] !== -1) {
      if (bit + fastLen[j] > nBits) throw new Error('code past the end');
      sym = fast[j];
      bit += fastLen[j];
    } else {
      // canonical decode from FAST+1 bits on
      let v = j;
      let l = FAST;
      let b = bit + FAST;
      sym = -1;
      while (++l <= MAX_LEN) {
        if (b >= nBits) break;
        v = v * 2 + ((src[dataStart + (b >> 3)] >> (7 - (b & 7))) & 1);
        b++;
        if (count[l] && v >= first[l] && v < first[l] + count[l]) { sym = bySym[l][v - first[l]]; break; }
      }
      if (sym < 0) throw new Error('bad code');
      bit = b;
    }
    if (sym === rlc) {
      if (bit + 8 > nBits) throw new Error('run past the end');
      const cs = peek(8);
      bit += 8;
      if (op === 0) throw new Error('run with nothing before it');
      if (op + cs > no) throw new Error('decodes to too many values');
      const s = out[op - 1];
      for (let k = 0; k < cs; k++) out[op++] = s;
    } else {
      if (op >= no) throw new Error('decodes to too many values');
      out[op++] = sym;
    }
  }
  if (op !== no) throw new Error('decodes to ' + op + ' values, not ' + no);
}

/** Code lengths for the frequencies (a plain Huffman build with a binary heap; ties broken by symbol). */
function buildLengths(freq, im, iM) {
  const syms = [];
  for (let i = im; i <= iM; i++) if (freq[i]) syms.push(i);
  const lengths = new Uint8Array(HUF_ENCSIZE);
  if (syms.length === 1) { lengths[syms[0]] = 1; return lengths; }
  // nodes: leaves 0..n-1, internal n..2n-2
  const n = syms.length;
  const w = new Float64Array(2 * n);
  const parent = new Int32Array(2 * n).fill(-1);
  const heap = [];
  const less = (a, b) => w[a] < w[b] || (w[a] === w[b] && a < b);
  const push = (x) => {
    heap.push(x);
    let i = heap.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (!less(heap[i], heap[p])) break; [heap[i], heap[p]] = [heap[p], heap[i]]; i = p; }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l], heap[m])) m = l;
        if (r < heap.length && less(heap[r], heap[m])) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m], heap[i]];
        i = m;
      }
    }
    return top;
  };
  for (let k = 0; k < n; k++) { w[k] = freq[syms[k]]; push(k); }
  let next = n;
  while (heap.length > 1) {
    const a = pop();
    const b = pop();
    w[next] = w[a] + w[b];
    parent[a] = next;
    parent[b] = next;
    push(next++);
  }
  const depth = new Uint8Array(2 * n);
  for (let k = next - 2; k >= 0; k--) depth[k] = depth[parent[k]] + 1;
  for (let k = 0; k < n; k++) lengths[syms[k]] = depth[k];
  return lengths;
}

class Bits {
  constructor(size) { this.b = new Uint8Array(size); this.pos = 0; this.acc = 0; this.n = 0; this.total = 0; }
  put(v, nb) {   // MSB first; v < 2^nb, nb ≤ 52 (split into ≤ 24-bit pieces)
    while (nb > 24) {
      const hiBits = nb - 24;
      this.put(Math.floor(v / 2 ** 24), hiBits);
      v %= 2 ** 24;
      nb = 24;
    }
    this.acc = ((this.acc << nb) | v) >>> 0;
    this.n += nb;
    this.total += nb;
    while (this.n >= 8) {
      if (this.pos >= this.b.length) { const nb2 = new Uint8Array(this.b.length * 2 + 64); nb2.set(this.b); this.b = nb2; }
      this.n -= 8;
      this.b[this.pos++] = (this.acc >>> this.n) & 255;
      this.acc &= (1 << this.n) - 1;
    }
  }
  flush() {
    if (this.n) {
      if (this.pos >= this.b.length) { const nb2 = new Uint8Array(this.b.length + 1); nb2.set(this.b); this.b = nb2; }
      this.b[this.pos++] = (this.acc << (8 - this.n)) & 255;
      this.acc = 0;
      this.n = 0;
    }
    return this.b.subarray(0, this.pos);
  }
}

function hufEncode(raw) {
  const ni = raw.length;
  if (!ni) return new Uint8Array(0);
  const freq = new Float64Array(HUF_ENCSIZE);
  for (let i = 0; i < ni; i++) freq[raw[i]]++;
  let im = 0;
  while (!freq[im]) im++;
  let iM = 65535;
  while (!freq[iM]) iM--;
  iM++;
  freq[iM] = 1;   // the run-length pseudo-symbol
  const lengths = buildLengths(freq, im, iM);
  for (let i = im; i <= iM; i++) if (lengths[i] > MAX_LEN) return null;
  const codes = canonical(lengths, im, iM);

  const table = new Bits(1024);
  for (let i = im; i <= iM; i++) {
    const l = lengths[i];
    if (l === 0) {
      let run = 1;
      while (i < iM && run < LONGEST_LONG_RUN && lengths[i + 1] === 0) { i++; run++; }
      if (run >= 2) {
        if (run >= SHORTEST_LONG_RUN) { table.put(LONG_ZEROCODE_RUN, 6); table.put(run - SHORTEST_LONG_RUN, 8); }
        else table.put(SHORT_ZEROCODE_RUN + run - 2, 6);
        continue;
      }
    }
    table.put(l, 6);
  }
  const tableBytes = table.flush();

  const data = new Bits(ni);
  const rl = lengths[iM];
  const rc = codes[iM];
  const send = (s, cs) => {
    const l = lengths[s];
    if (l + rl + 8 < l * cs) { data.put(codes[s], l); data.put(rc, rl); data.put(cs, 8); }
    else for (let k = 0; k <= cs; k++) data.put(codes[s], l);
  };
  let s = raw[0];
  let cs = 0;
  for (let i = 1; i < ni; i++) {
    const ns = raw[i];
    if (cs === 255 || s !== ns) { send(s, cs); cs = 0; s = ns; } else cs++;
  }
  send(s, cs);
  const nBits = data.total;
  const dataBytes = data.flush();
  if (nBits > 0xffffffff) return null;
  const out = new Uint8Array(20 + tableBytes.length + dataBytes.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, im, true);
  dv.setUint32(4, iM, true);
  dv.setUint32(8, tableBytes.length, true);
  dv.setUint32(12, nBits, true);
  dv.setUint32(16, 0, true);
  out.set(tableBytes, 20);
  out.set(dataBytes, 20 + tableBytes.length);
  return out;
}

// ---------------------------------------------------------------- PIZ blocks

export function pizDecode(src, planes) {
  const total = planes.reduce((s, p) => s + p.data.length, 0);
  if (src.length < 4) throw new Error('block too short');
  const dv = new DataView(src.buffer, src.byteOffset, src.byteLength);
  const minNZ = dv.getUint16(0, true);
  const maxNZ = dv.getUint16(2, true);
  if (maxNZ >= BITMAP_SIZE) throw new Error('bad bitmap range');
  const bitmap = new Uint8Array(BITMAP_SIZE);
  let pos = 4;
  if (minNZ <= maxNZ) {
    const n = maxNZ - minNZ + 1;
    if (pos + n > src.length) throw new Error('bitmap cut short');
    bitmap.set(src.subarray(pos, pos + n), minNZ);
    pos += n;
  }
  const { lut, max } = reverseLut(bitmap);
  if (pos + 4 > src.length) throw new Error('length cut short');
  const hufBytes = dv.getUint32(pos, true);
  pos += 4;
  if (pos + hufBytes > src.length) throw new Error('Huffman data cut short');
  const all = new Uint16Array(total);
  hufDecode(src, pos, hufBytes, all);
  let off = 0;
  for (const p of planes) {
    for (let j = 0; j < p.w; j++) wav2dDecode(all, off + j, p.nx, p.w, p.ny, p.w * p.nx, max);
    off += p.data.length;
  }
  off = 0;
  for (const p of planes) {
    const d = p.data;
    for (let i = 0; i < d.length; i++) d[i] = lut[all[off + i]];
    off += d.length;
  }
}

export function pizEncode(planes) {
  const total = planes.reduce((s, p) => s + p.data.length, 0);
  const all = new Uint16Array(total);
  let off = 0;
  for (const p of planes) { all.set(p.data, off); off += p.data.length; }
  const bitmap = new Uint8Array(BITMAP_SIZE);
  for (let i = 0; i < total; i++) bitmap[all[i] >> 3] |= 1 << (all[i] & 7);
  bitmap[0] &= ~1;
  let minNZ = BITMAP_SIZE - 1;
  let maxNZ = 0;
  for (let i = 0; i < BITMAP_SIZE; i++) if (bitmap[i]) { if (minNZ > i) minNZ = i; if (maxNZ < i) maxNZ = i; }
  const lut = new Uint16Array(USHORT_RANGE);
  let k = 0;
  for (let i = 0; i < USHORT_RANGE; i++) lut[i] = i === 0 || (bitmap[i >> 3] & (1 << (i & 7))) ? k++ : 0;
  const maxValue = k - 1;
  for (let i = 0; i < total; i++) all[i] = lut[all[i]];
  off = 0;
  for (const p of planes) {
    for (let j = 0; j < p.w; j++) wav2dEncode(all, off + j, p.nx, p.w, p.ny, p.w * p.nx, maxValue);
    off += p.data.length;
  }
  const huf = hufEncode(all);
  if (!huf) return null;
  const bm = minNZ <= maxNZ ? maxNZ - minNZ + 1 : 0;
  const out = new Uint8Array(4 + bm + 4 + huf.length);
  const dv = new DataView(out.buffer);
  dv.setUint16(0, minNZ, true);
  dv.setUint16(2, maxNZ, true);
  if (bm) out.set(bitmap.subarray(minNZ, maxNZ + 1), 4);
  dv.setUint32(4 + bm, huf.length, true);
  out.set(huf, 8 + bm);
  return out;
}
