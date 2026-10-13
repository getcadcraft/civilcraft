/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bits-read.js — the DWG bit stream reader. cc-dwg (Apache-2.0), written from the ODA "Open Design
 * Specification for .dwg files" v5.4.1 only: chapter 2 (bit codes B BB 3B BS BL BLL BD DD RC RS RL RD MC MS
 * H T TU TV CMC/ENC BE BT OT), 2.12 (object type, R2010+), 2.13 (handle references), 20.1 (the R2007+
 * string stream).
 *
 *   new BitReader(bytes, { version, decode, startBit, endBit })
 *     .pos (bit position) .end (bit limit) .version (12 14 15 18 21 24 27 32)
 *     B BB B3 BS BL BLL BD DD(def) RC RS RL RLs RD RLL 2RD 3RD 2BD 3BD 3DD BE BT CMC ENC OT
 *     H(ref) — absolute handle; .hcode is the reference code that was read
 *     T (8-bit, code page) TU (UTF-16) TV (T before R2007, TU from the string stream after)
 *     bytes(n) align() bitsLeft()
 *   readMC(bytes, pos) / readMCu / readMS — byte-level modular numbers; the next position is in `mod.pos`.
 *   DwgReadError — thrown on overrun or impossible codes; read.js catches it per object.
 *   codepageDecoder(cp) — text decoder for a DWGCODEPAGE number.
 *
 * Performance: no per-bit allocation; RC on an unaligned position combines two bytes.
 */

export class DwgReadError extends Error {}

const f64 = new Float64Array(1);
const f64b = new Uint8Array(f64.buffer);

export class BitReader {
  /**
   * @param {Uint8Array} buf
   * @param {{version?:number, decode?:(u8:Uint8Array)=>string, startBit?:number, endBit?:number}} [o]
   */
  constructor(buf, o = {}) {
    this.buf = buf;
    this.pos = o.startBit || 0;
    this.end = o.endBit ?? buf.length * 8;
    this.version = o.version || 15;
    this.decode = o.decode || latin1;
    this.str = null;      // R2007+: the reader positioned on the string stream (TV reads from it)
    this.hcode = 0;
  }
  overrun(n) { throw new DwgReadError('read past the end (' + (this.pos + n) + ' > ' + this.end + ' bits)'); }
  bitsLeft() { return this.end - this.pos; }
  align() { this.pos = (this.pos + 7) & ~7; }

  B() {
    const p = this.pos;
    if (p >= this.end) this.overrun(1);
    this.pos = p + 1;
    return (this.buf[p >> 3] >> (7 - (p & 7))) & 1;
  }
  BB() {
    const p = this.pos;
    if (p + 2 > this.end) this.overrun(2);
    this.pos = p + 2;
    const s = p & 7, i = p >> 3;
    if (s < 7) return (this.buf[i] >> (6 - s)) & 3;
    return ((this.buf[i] & 1) << 1) | (this.buf[i + 1] >> 7);
  }
  /** 2.1 3B: up to three bits, stopping at a zero bit. */
  B3() {
    let v = 0;
    for (let i = 0; i < 3; i++) { const b = this.B(); v = (v << 1) | b; if (!b) break; }
    return v;
  }
  bits(n) { let v = 0; for (let i = 0; i < n; i++) v = (v << 1) | this.B(); return v; }
  RC() {
    const p = this.pos;
    if (p + 8 > this.end) this.overrun(8);
    this.pos = p + 8;
    const i = p >> 3, s = p & 7;
    return s ? ((this.buf[i] << s) | (this.buf[i + 1] >> (8 - s))) & 0xFF : this.buf[i];
  }
  RS() { const a = this.RC(); return ((this.RC() << 8) | a) << 16 >> 16; }
  RSu() { const a = this.RC(); return (this.RC() << 8) | a; }
  RL() { const a = this.RC(), b = this.RC(), c = this.RC(), d = this.RC(); return (a | (b << 8) | (c << 16) | (d << 24)) >>> 0; }
  RLs() { return this.RL() | 0; }
  RLL() { const lo = this.RL(), hi = this.RL(); return hi * 4294967296 + lo; }
  RD() {
    for (let i = 0; i < 8; i++) f64b[i] = this.RC();
    return f64[0];
  }
  bytes(n) {
    if (this.pos + n * 8 > this.end) this.overrun(n * 8);
    if (!(this.pos & 7)) { const i = this.pos >> 3; this.pos += n * 8; return this.buf.slice(i, i + n); }
    const out = new Uint8Array(n);
    for (let i = 0; i < n; i++) out[i] = this.RC();
    return out;
  }

  /** 2.2 BITSHORT (signed 16 for the full form). */
  BS() {
    switch (this.BB()) {
      case 0: return this.RS();
      case 1: return this.RC();
      case 2: return 0;
      default: return 256;
    }
  }
  /** 2.3 BITLONG (signed 32 for the full form). */
  BL() {
    switch (this.BB()) {
      case 0: return this.RLs();
      case 1: return this.RC();
      case 2: return 0;
      default: throw new DwgReadError('bad BITLONG code 11');
    }
  }
  /** 2.4 BITLONGLONG. */
  BLL() {
    const n = this.bits(3);
    let v = 0, m = 1;
    for (let i = 0; i < n; i++) { v += this.RC() * m; m *= 256; }
    return v;
  }
  /** 2.5 BITDOUBLE. */
  BD() {
    switch (this.BB()) {
      case 0: return this.RD();
      case 1: return 1.0;
      case 2: return 0.0;
      default: throw new DwgReadError('bad BITDOUBLE code 11');
    }
  }
  /** 2.9 BitDouble with default. */
  DD(def) {
    switch (this.BB()) {
      case 0: return def;
      case 1: {
        f64[0] = def;
        for (let i = 0; i < 4; i++) f64b[i] = this.RC();
        return f64[0];
      }
      case 2: {
        f64[0] = def;
        f64b[4] = this.RC(); f64b[5] = this.RC();
        for (let i = 0; i < 4; i++) f64b[i] = this.RC();
        return f64[0];
      }
      default: return this.RD();
    }
  }
  RD2() { const x = this.RD(); return { x, y: this.RD() }; }
  RD3() { const x = this.RD(), y = this.RD(); return { x, y, z: this.RD() }; }
  BD2() { const x = this.BD(); return { x, y: this.BD() }; }
  BD3() { const x = this.BD(), y = this.BD(); return { x, y, z: this.BD() }; }
  DD3(d) { const x = this.DD(d.x), y = this.DD(d.y); return { x, y, z: this.DD(d.z) }; }
  /** 2.8 BitExtrusion (R2000+: 1 bit = 0,0,1). */
  BE() {
    if (this.version >= 15) { if (this.B()) return { x: 0, y: 0, z: 1 }; }
    return this.BD3();
  }
  /** 2.10 BitThickness. */
  BT() {
    if (this.version >= 15 && this.B()) return 0;
    return this.BD();
  }
  /** 2.12 object type. */
  OT() {
    if (this.version < 24) return this.BS();
    switch (this.BB()) {
      case 0: return this.RC();
      case 1: return this.RC() + 0x1F0;
      default: return this.RSu();
    }
  }

  /**
   * 2.13 handle reference → absolute handle (Number; handles above 2^53 do not occur in practice).
   * `ref` is the handle offsets are taken from (codes 6, 8, A, C). `this.hcode` keeps the code.
   */
  H(ref = 0) {
    const b = this.RC();
    const code = b >> 4, n = b & 15;
    let v = 0;
    for (let i = 0; i < n; i++) v = v * 256 + this.RC();
    this.hcode = code;
    switch (code) {
      case 6: return ref + 1;
      case 8: return ref - 1;
      case 0xA: return ref + v;
      case 0xC: return ref - v;
      default: return v;
    }
  }

  /** T: BS length, then that many code-page bytes (trailing NULs dropped). */
  T() {
    const n = this.BS();
    if (n <= 0) return '';
    const b = this.bytes(n);
    let e = b.length;
    while (e > 0 && b[e - 1] === 0) e--;
    return this.decode(e === b.length ? b : b.subarray(0, e));
  }
  /** TU: BS character count, then UTF-16LE (trailing NULs dropped). */
  TU() {
    const n = this.BS() & 0xFFFF;
    if (!n) return '';
    if (this.pos + n * 16 > this.end) this.overrun(n * 16);
    let s = '';
    const codes = new Array(n);
    let k = 0;
    for (let i = 0; i < n; i++) { const lo = this.RC(); codes[k++] = lo | (this.RC() << 8); }
    while (k > 0 && codes[k - 1] === 0) k--;
    for (let i = 0; i < k; i += 8192) s += String.fromCharCode.apply(null, codes.slice(i, Math.min(k, i + 8192)));
    // "\\U+XXXX" escapes left in R2007–R2013 text are decoded (as the ODA File Converter does when it reads
    // those versions); R2018 text is kept as stored (the converter keeps the escape) — found by experiment.
    return this.version < 32 ? unescapeU(s) : s;
  }
  /** TV: T up to R2004, TU (from the string stream when one is set) from R2007. */
  TV() {
    if (this.version >= 21) return (this.str || this).TU();
    return this.T();
  }

  /**
   * 2.11 CMC. R15 and earlier: BS colour index. R2004+: BS index, BL rgb (flag byte in the top byte),
   * RC name flags (+ TV colour name, TV book name).
   * Returns the model colour { index } or { rgb, index?, name?, book? }.
   */
  CMC() {
    if (this.version < 18) return { index: this.BS() };
    const index = this.BS();
    const rgb = this.BL() >>> 0;
    const flags = this.RC();
    const c = colourFromRgbWord(index, rgb);
    if (flags & 1) c.name = this.TV();
    if (flags & 2) c.book = this.TV();
    return c;
  }
  /**
   * 2.11 ENC (entity colour, R2004+). Returns { color, transparency?, hasBookHandle }.
   * Spec gap: the spec says the RGB value after flag 0x8000 is a BS; files carry a BL with the colour method
   * in its top byte (0xC2 = true colour) — found with true-colour and transparent entities saved by the ODA
   * File Converter in R2004–R2018 (tools/dwg-test/reader-fixture.py): colours and transparency match its DXF.
   */
  ENC() {
    if (this.version < 18) return { color: { index: this.BS() }, transparency: undefined, hasBook: false };
    const v = this.BS() & 0xFFFF;
    const flags = v & 0xFF00;
    const index = v & 0x1FF;
    let color;
    let hasBook = false, transparency;
    if (flags & 0x8000) {
      const rgb = this.BL() >>> 0;
      color = colourFromRgbWord(index, rgb);
      if (flags & 0x4000) hasBook = true;
    } else color = { index: v & 0xFFF };
    if (flags & 0x2000) transparency = this.BL() >>> 0;
    return { color, transparency, hasBook };
  }
}

/** The 32-bit colour word of CMC/ENC: top byte = method (0xC2 = true colour, 0xC3 = indexed, 0xC0/0xC1 = ByLayer/ByBlock). */
export function colourFromRgbWord(index, word) {
  const method = word >>> 24;
  if (method === 0xC2) return { rgb: word & 0xFFFFFF };
  if (method === 0xC3) return { index: word & 0xFF };
  if (method === 0xC0) return { index: 256 };
  if (method === 0xC1) return { index: 0 };
  if (method === 0xC8) return { index: 257 };   // "none"
  return { index: index & 0x1FF };
}

// ---------------------------------------------------------------- byte-level modular numbers (2.6, 2.7)
export const mod = { pos: 0 };
/** Modular char, signed (2.6). */
export function readMC(b, pos) {
  let v = 0, shift = 0, byte;
  for (;;) {
    byte = b[pos++];
    if (byte & 0x80) { v += (byte & 0x7F) * 2 ** shift; shift += 7; continue; }
    const neg = byte & 0x40;
    v += (byte & 0x3F) * 2 ** shift;
    mod.pos = pos;
    return neg ? -v : v;
  }
}
/** Modular char, unsigned (R2010+ handle-stream size: 0x40 is not a sign). */
export function readMCu(b, pos) {
  let v = 0, shift = 0, byte;
  do { byte = b[pos++]; v += (byte & 0x7F) * 2 ** shift; shift += 7; } while (byte & 0x80);
  mod.pos = pos;
  return v;
}
/** Modular short (2.7). */
export function readMS(b, pos) {
  let v = 0, shift = 0, w;
  do { w = b[pos] | (b[pos + 1] << 8); pos += 2; v += (w & 0x7FFF) * 2 ** shift; shift += 15; } while (w & 0x8000);
  mod.pos = pos;
  return v;
}

// ---------------------------------------------------------------- code pages
// Spec gap: the spec names the DWGCODEPAGE field (3.2.5) but not its numbering. The table below was found by
// experiment: an R2000 file with each number 0–50 patched into its header, converted by the ODA File Converter
// to DXF — its $DWGCODEPAGE gives the name (46–50 give none).
export const CODEPAGES = {
  0: 'UNDEFINED', 1: 'ASCII', 2: 'ISO8859-1', 3: 'ISO8859-2', 4: 'ISO8859-3', 5: 'ISO8859-4', 6: 'ISO8859-5',
  7: 'ISO8859-6', 8: 'ISO8859-7', 9: 'ISO8859-8', 10: 'ISO8859-9', 11: 'DOS437', 12: 'DOS850', 13: 'DOS852',
  14: 'DOS855', 15: 'DOS857', 16: 'DOS860', 17: 'DOS861', 18: 'DOS863', 19: 'DOS864', 20: 'DOS865', 21: 'DOS869',
  22: 'DOS932', 23: 'MAC-ROMAN', 24: 'BIG5', 25: 'KSC5601', 26: 'JOHAB', 27: 'DOS866', 28: 'ANSI_1250',
  29: 'ANSI_1251', 30: 'ANSI_1252', 31: 'GB2312', 32: 'ANSI_1253', 33: 'ANSI_1254', 34: 'ANSI_1255',
  35: 'ANSI_1256', 36: 'ANSI_1257', 37: 'ANSI_874', 38: 'ANSI_932', 39: 'ANSI_936', 40: 'ANSI_949',
  41: 'ANSI_950', 42: 'ANSI_1361', 43: 'ANSI_1200', 44: 'ANSI_1258', 45: 'CNT',
};
const LABELS = {
  'ANSI_1250': 'windows-1250', 'ANSI_1251': 'windows-1251', 'ANSI_1253': 'windows-1253', 'ANSI_1254': 'windows-1254',
  'ANSI_1255': 'windows-1255', 'ANSI_1256': 'windows-1256', 'ANSI_1257': 'windows-1257', 'ANSI_1258': 'windows-1258',
  'ANSI_874': 'windows-874', 'ANSI_932': 'shift_jis', 'DOS932': 'shift_jis', 'ANSI_936': 'gbk', 'GB2312': 'gbk',
  'ANSI_949': 'euc-kr', 'KSC5601': 'euc-kr', 'ANSI_950': 'big5', 'BIG5': 'big5', 'DOS866': 'ibm866',
  'ISO8859-2': 'iso-8859-2', 'ISO8859-3': 'iso-8859-3', 'ISO8859-4': 'iso-8859-4', 'ISO8859-5': 'iso-8859-5',
  'ISO8859-6': 'iso-8859-6', 'ISO8859-7': 'iso-8859-7', 'ISO8859-8': 'iso-8859-8', 'ISO8859-9': 'iso-8859-9',
  'MAC-ROMAN': 'macintosh',
};
const CP1252 = (() => {
  const t = new Array(256);
  for (let i = 0; i < 256; i++) t[i] = String.fromCharCode(i);
  const hi = [0x20AC, 0, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0, 0x017D, 0,
    0, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0, 0x017E, 0x0178];
  for (let i = 0; i < 32; i++) if (hi[i]) t[0x80 + i] = String.fromCharCode(hi[i]);
  return t;
})();
function latin1(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]); return s; }
function cp1252(u8) { let s = ''; for (let i = 0; i < u8.length; i++) s += CP1252[u8[i]]; return s; }

/**
 * A decoder (Uint8Array → string) for a DWGCODEPAGE number. Returns { name, decode, known }.
 * Up to R2004 strings are code-page bytes; characters outside the code page are written as "\U+XXXX",
 * which the decoder turns into the character (as the ODA File Converter does when it writes a DXF 2018).
 */
export function codepageDecoder(num) {
  const d = codepageDecoder8(num);
  const raw = d.decode;
  d.decode = (u8) => unescapeU(raw(u8));
  return d;
}
const RE_U = /\\U\+([0-9A-Fa-f]{4})/g;
export function unescapeU(s) { return s.indexOf('\\U+') < 0 && s.indexOf('\\u+') < 0 ? s : s.replace(RE_U, (m, h) => String.fromCharCode(parseInt(h, 16))); }
function codepageDecoder8(num) {
  const name = CODEPAGES[num];
  if (!name || name === 'ANSI_1252' || name === 'UNDEFINED' || name === 'ASCII' || name === 'ISO8859-1') {
    return { name: name || 'ANSI_1252', decode: cp1252, known: !!name };
  }
  const label = LABELS[name];
  if (label && typeof TextDecoder !== 'undefined') {
    try {
      const td = new TextDecoder(label);
      return { name, decode: (u8) => { for (let i = 0; i < u8.length; i++) if (u8[i] > 0x7F) return td.decode(u8); return latin1(u8); }, known: true };
    } catch { /* not supported here */ }
  }
  return { name, decode: cp1252, known: false };
}
