/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bits-write.js — bit-level and byte-level writers for DWG (cc-dwg, Apache-2.0).
 *
 * Written from the Open Design Alliance "Open Design Specification for .dwg files" v5.4.1, ch. 2 (bit codes:
 * B BB 3B BS BL BLL BD DD BT BE RC RS RL RD 2RD 3BD MC MS H T TU TV CMC ENC OT) and our own CivilCraft
 * R2000 writer (public_html/assets/apps/civilcraft/dev/dwg-write.js). No code from any other DWG library.
 *
 * BitWriter writes MSB-first within each byte, as the spec's worked examples show. Every multi-byte raw
 * value inside the bit stream is little-endian. The version (an 'AC10xx' code) decides the forms that differ
 * per release: BT/BE (R2000+), CMC (R2004+ adds the RGB long and the name flags), text (TV is code-page bytes
 * up to R2004, UTF-16 "TU" from R2007), OT (R2010+).
 */

const f64 = new Float64Array(1), f64b = new Uint8Array(f64.buffer);

/** Version codes in order, and helpers to compare them. */
export const ORDER = ['AC1012', 'AC1014', 'AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];
export const vIndex = (v) => ORDER.indexOf(v);
export const atLeast = (v, min) => vIndex(v) >= vIndex(min);

export class BitWriter {
  /** @param {string} version 'AC1015' … 'AC1032' */
  constructor(version = 'AC1015', size = 256) {
    this.version = version;
    this.r2004 = atLeast(version, 'AC1018');
    this.r2007 = atLeast(version, 'AC1021');
    this.r2010 = atLeast(version, 'AC1024');
    this.r2013 = atLeast(version, 'AC1027');
    this.r2018 = atLeast(version, 'AC1032');
    this.buf = new Uint8Array(size);
    this.bit = 0;
  }
  grow(n) {
    const need = ((this.bit + n) >> 3) + 2;
    if (need > this.buf.length) { const b = new Uint8Array(Math.max(need, this.buf.length * 2)); b.set(this.buf); this.buf = b; }
  }
  B(v) { this.grow(1); if (v) this.buf[this.bit >> 3] |= 0x80 >> (this.bit & 7); this.bit++; }
  /** n plain bits, most significant first. */
  bits(v, n) { for (let i = n - 1; i >= 0; i--) this.B((v >>> i) & 1); }
  BB(v) { this.bits(v & 3, 2); }
  /** 3B (2.1): 1–3 bits, stop at a zero bit. Encodes 0 ('0'), 2 ('10'), 6 ('110'), 7 ('111'). */
  B3(v) { if (v === 0) this.B(0); else if (v === 2) this.bits(2, 2); else if (v === 6) this.bits(6, 3); else this.bits(7, 3); }
  RC(v) {
    v &= 0xFF;
    this.grow(8);
    const i = this.bit >> 3, o = this.bit & 7;
    if (!o) this.buf[i] = v;
    else { this.buf[i] |= v >> o; this.buf[i + 1] |= (v << (8 - o)) & 0xFF; }   // the buffer is zero past the cursor
    this.bit += 8;
  }
  RS(v) { this.RC(v); this.RC(v >> 8); }
  RL(v) { this.RC(v); this.RC(v >> 8); this.RC(v >> 16); this.RC(v >>> 24); }
  RD(v) { f64[0] = v; for (let i = 0; i < 8; i++) this.RC(f64b[i]); }
  BS(v) {
    v = Math.trunc(v) || 0;
    if (v === 0) this.BB(2); else if (v === 256) this.BB(3);
    else if (v > 0 && v < 256) { this.BB(1); this.RC(v); }
    else { this.BB(0); this.RS(v & 0xFFFF); }
  }
  BL(v) {
    v = Math.trunc(v) || 0;
    if (v === 0) this.BB(2);
    else if (v > 0 && v < 256) { this.BB(1); this.RC(v); }
    else { this.BB(0); this.RL(v >>> 0); }
  }
  /**
   * BLL (2.4). Spec gap: the spec says the length is a 3B code (1–3 bits, stop at a zero bit), which could only
   * express 0, 2, 6 or 7 bytes. Files saved by AutoCAD carry it as 3 plain bits (REQUIREDVERSIONS = 0 takes
   * exactly three bits in example_2013.dwg, found by experiment: the bit positions LibreDWG's dwgread -v5, a
   * test-only black box (see PROVENANCE.md), printed for that file).
   */
  BLL(v) {
    let x = BigInt.asUintN(64, BigInt(v || 0));
    const bytes = [];
    while (x > 0n) { bytes.push(Number(x & 0xFFn)); x >>= 8n; }
    this.bits(bytes.length, 3);
    for (const b of bytes) this.RC(b);
  }
  BD(v) {
    if (v === 0 && !Object.is(v, -0)) this.BB(2); else if (v === 1) this.BB(1); else { this.BB(0); this.RD(v); }
  }
  /** BitDouble with default (2.9): same as the default → 00, else a full RD (11). */
  DD(v, def) { if (v === def || (Number.isNaN(v) && Number.isNaN(def))) this.BB(0); else { this.BB(3); this.RD(v); } }
  /** BitThickness (2.10): R2000+ one bit for 0.0. */
  BT(v) { if (!v) this.B(1); else { this.B(0); this.BD(v); } }
  /** BitExtrusion (2.8): R2000+ one bit for (0, 0, 1). */
  BE(x = 0, y = 0, z = 1) {
    if (x === 0 && y === 0 && z === 1) this.B(1);
    else { this.B(0); this.BD(x); this.BD(y); this.BD(z); }
  }
  RD2(x, y) { this.RD(x); this.RD(y); }
  RD3(x, y, z) { this.RD(x); this.RD(y); this.RD(z); }
  BD2(x, y) { this.BD(x); this.BD(y); }
  BD3(x, y, z) { this.BD(x); this.BD(y); this.BD(z); }
  P3(p) { this.BD3(p?.x || 0, p?.y || 0, p?.z || 0); }
  P2(p) { this.BD2(p?.x || 0, p?.y || 0); }
  /**
   * CmColor (2.11) for non-entities. R2000: BS index. R2004+: BS 0, BL (method << 24 | value), RC name flags
   * (+ TV name / book). Method 0xC0 ByLayer, 0xC1 ByBlock, 0xC2 true colour (value = RGB), 0xC3 ACI (value = index).
   */
  CMC(color) {
    const c = normColor(color);
    if (!this.r2004) { this.BS(c.index ?? 256); return; }
    this.BS(0);
    this.BL(cmcLong(c) | 0);
    const names = (c.name ? 1 : 0) | (c.book ? 2 : 0);
    this.RC(names);
    if (c.name) this.TV(c.name);
    if (c.book) this.TV(c.book);
  }
  /**
   * Entity colour ENC (2.11, R2004+): BS = flags | index; 0x8000 true colour → BL RGB (spec says "BS"; the value
   * is 24 bits, written as a BL), 0x4000 a DBCOLOR handle (not written here), 0x2000 transparency BL follows.
   * R2000: plain BS index.
   */
  ENC(color, transparency) {
    const c = normColor(color);
    if (!this.r2004) { this.BS(c.index ?? 256); return; }
    const hasT = transparency !== undefined && transparency !== null;
    if (c.rgb !== undefined) {
      this.BS(0x8000 | (hasT ? 0x2000 : 0) | ((c.index ?? 0) & 0xFF));
      this.BL((0xC2000000 | (c.rgb & 0xFFFFFF)) | 0);
    } else this.BS((hasT ? 0x2000 : 0) | ((c.index ?? 256) & 0x1FF));
    if (hasT) this.BL(transparency | 0);
  }
  /** Object type (2.12): BS until R2007, from R2010 a bit pair + 1–2 bytes. */
  OT(t) {
    if (!this.r2010) { this.BS(t); return; }
    if (t < 256) { this.BB(0); this.RC(t); }
    else if (t >= 0x1F0 && t < 0x1F0 + 256) { this.BB(1); this.RC(t - 0x1F0); }
    else { this.BB(2); this.RS(t); }
  }
  /** Handle reference (2.13): code nibble, byte count nibble, value bytes MSB first. */
  H(code, value = 0) {
    const bytes = handleBytes(value);
    this.RC(((code & 15) << 4) | bytes.length);
    for (const b of bytes) this.RC(b);
  }
  /** 8-bit code page text, R13–R2004 (T): BS length counting a closing NUL, then the bytes. */
  T8(s) {
    const b = encode1252(s);
    if (!b.length) { this.BS(0); return; }
    this.BS(b.length + 1);
    for (const c of b) this.RC(c);
    this.RC(0);
  }
  /** Unicode text (TU): BS character count, then UTF-16LE code units, no terminator. */
  TU(s) {
    const str = cleanText(s);
    this.BS(str.length);
    for (let i = 0; i < str.length; i++) this.RS(str.charCodeAt(i));
  }
  /** Version text (TV): T8 up to R2004, TU from R2007. Object writers redirect it to their string stream. */
  TV(s) { if (this.r2007) this.TU(s); else this.T8(s); }
  /** Copy another writer's bits (n bits from bit 0). */
  append(w, n = w.bit) {
    let i = 0;
    for (; i + 8 <= n; i += 8) this.RC(w.buf[i >> 3]);
    for (; i < n; i++) this.B((w.buf[i >> 3] >> (7 - (i & 7))) & 1);
  }
  /** Overwrite 32 bits at a bit position with a little-endian RL. */
  patchRL(at, v) {
    const save = this.bit; this.bit = at;
    for (let i = 0; i < 4; i++) {
      const b = (v >>> (8 * i)) & 0xFF;
      for (let k = 7; k >= 0; k--) {
        const pos = this.bit, mask = 0x80 >> (pos & 7);
        if ((b >> k) & 1) this.buf[pos >> 3] |= mask; else this.buf[pos >> 3] &= ~mask;
        this.bit++;
      }
    }
    this.bit = save;
  }
  /** Pad to the byte boundary; the bytes written so far. */
  bytes() { return this.buf.slice(0, (this.bit + 7) >> 3); }
}

export function handleBytes(value) {
  const bytes = [];
  let v = typeof value === 'string' ? parseInt(value, 16) || 0 : Math.max(0, Math.trunc(value || 0));
  while (v > 0) { bytes.unshift(v % 256); v = Math.floor(v / 256); }
  return bytes;
}

/** { index } | { rgb, index? , name?, book? } | number (ACI) | null → normalised colour. */
export function normColor(c) {
  if (c === null || c === undefined) return { index: 256 };
  if (typeof c === 'number') return { index: c };
  if (c.rgb !== undefined && c.rgb !== null) return { rgb: c.rgb >>> 0, index: c.index, name: c.name, book: c.book };
  return { index: Number.isInteger(c.index) ? c.index : 256, name: c.name, book: c.book };
}
function cmcLong(c) {
  if (c.rgb !== undefined) return 0xC2000000 | (c.rgb & 0xFFFFFF);
  const i = c.index ?? 256;
  if (i === 256) return 0xC0000000;
  if (i === 0) return 0xC1000000;
  if (i === 257) return 0xC8000000;
  return 0xC3000000 | (Math.abs(i) & 0xFF);
}

// ---------------------------------------------------------------- byte stream
export class ByteWriter {
  constructor(size = 1 << 16) { this.buf = new Uint8Array(size); this.pos = 0; }
  grow(n) { if (this.pos + n > this.buf.length) { const b = new Uint8Array(Math.max(this.pos + n, this.buf.length * 2)); b.set(this.buf); this.buf = b; } }
  raw(arr) { this.grow(arr.length); this.buf.set(arr, this.pos); this.pos += arr.length; }
  zeros(n) { this.grow(n); this.buf.fill(0, this.pos, this.pos + n); this.pos += n; }
  RC(v) { this.grow(1); this.buf[this.pos++] = v & 0xFF; }
  RS(v) { this.RC(v); this.RC(v >> 8); }
  RL(v) { this.RC(v); this.RC(v >> 8); this.RC(v >> 16); this.RC(v >>> 24); }
  RLL(v) { const x = BigInt.asUintN(64, BigInt(v)); for (let i = 0n; i < 8n; i++) this.RC(Number((x >> (8n * i)) & 0xFFn)); }
  RD(v) { f64[0] = v; this.raw(f64b); }
  setRL(at, v) { this.buf[at] = v & 0xFF; this.buf[at + 1] = (v >> 8) & 0xFF; this.buf[at + 2] = (v >> 16) & 0xFF; this.buf[at + 3] = (v >>> 24) & 0xFF; }
  /** Modular char (2.6), signed: the last byte's 0x40 bit is the sign. */
  MC(v) { this.raw(mcBytes(v)); }
  /** Unsigned modular char (R2010 handle-stream size: 0x40 is not a sign). */
  UMC(v) { this.raw(umcBytes(v)); }
  /** Modular short (2.7): 15 bits per little-endian short, high bit = more follows. */
  MS(v) {
    for (;;) {
      const s = v & 0x7FFF; v = Math.floor(v / 32768);
      if (v === 0) { this.RS(s); break; }
      this.RS(s | 0x8000);
    }
  }
  bytes() { return this.buf.slice(0, this.pos); }
}
export function mcBytes(v) {
  const neg = v < 0; let a = Math.abs(v);
  const out = [];
  for (;;) {
    const b = a & 0x7F; a = Math.floor(a / 128);
    if (a === 0 && !(b & 0x40)) { out.push(b | (neg ? 0x40 : 0)); break; }
    out.push(b | 0x80);
    if (a === 0) { out.push(neg ? 0x40 : 0); break; }
  }
  return out;
}
export function umcBytes(v) {
  const out = [];
  do { let b = v & 0x7F; v = Math.floor(v / 128); if (v) b |= 0x80; out.push(b); } while (v);
  return out;
}

// ---------------------------------------------------------------- text
/** Strip what no DWG string may hold: NUL goes, other control characters become spaces — except TAB, which MTEXT uses. */
export function cleanText(s) {
  return String(s ?? '').replace(/\x00/g, '').replace(/[\x01-\x08\x0a-\x1f\x7f]/g, ' ');
}
/**
 * Text in the drawing code page (ANSI_1252) for R13–R2004. ASCII and U+00A0–U+00FF are single bytes (the same
 * in 1252 and Latin-1); everything else goes as \U+XXXX, which AutoCAD-family readers show as the character.
 */
export function encode1252(s) {
  const out = [];
  for (const ch of cleanText(s)) {
    const c = ch.codePointAt(0);
    if (c < 0x80 || (c >= 0xA0 && c <= 0xFF)) out.push(c);
    else if (c > 0xFFFF) { out.push(0x3F); encode1252.lost++; }
    else for (const b of ('\\U+' + c.toString(16).toUpperCase().padStart(4, '0'))) out.push(b.charCodeAt(0));
  }
  return out;
}
encode1252.lost = 0;
