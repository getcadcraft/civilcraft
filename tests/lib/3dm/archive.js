/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is file-format text. */
/**
 * archive.js — the .3dm file's chunks and values, read with every count, offset and size checked against the bytes the
 * reader stands in (untrusted input: a file can lie about any of them). Layout from openNURBS's ON_BinaryArchive
 * (opennurbs_archive.cpp, opennurbs_3dm.h; read as a reference, see NOTICE), written here in our own words:
 *
 *   file    = 32-byte start ("3D Geometry File Format " + the version right-aligned in 8 characters: 1–4, 50, 60, 70, 80)
 *             then chunks to the end
 *   chunk   = u32 typecode + a length (i32 before version 50, i64 from 50); typecode & SHORT → the "length" is the value
 *             and nothing follows; typecode & CRC → the body ends with 4 bytes of CRC-32 (not checked: a broken CRC with
 *             good contents still opens)
 *   numbers = little-endian; strings = u32 count of UTF-16LE units including the closing 0; uuids = Data1 u32, Data2 u16,
 *             Data3 u16, Data4 8 bytes (written as text the usual way)
 *
 *   new Archive(bytes) → .version, .reader(): Reader over the whole file
 *   Reader: u8 bool i32 u32 i64 f64 f32 point(dim) uuid wstring string intArray doubleArray chunk() sub(chunk) skip()
 *           atEnd() versioned() (a 1-byte major<<4|minor) versionedChunk() (an anonymous chunk + i32 major + i32 minor)
 */
import { ThreeDmError, damaged, tooBig, LIMITS } from './util.js';
import { inflateZlib } from './zlib.js';

export const TC = {
  SHORT: 0x80000000, CRC: 0x8000,
  COMMENTBLOCK: 0x00000001, ENDOFFILE: 0x00007fff,
  ANONYMOUS: 0x40008000, MODEL_ATTRIBUTES: 0x40008002,
  MATERIAL_TABLE: 0x10000010, LAYER_TABLE: 0x10000011, OBJECT_TABLE: 0x10000013, PROPERTIES_TABLE: 0x10000014,
  SETTINGS_TABLE: 0x10000015, IDEF_TABLE: 0x10000021, ENDOFTABLE: 0xffffffff,
  MATERIAL_RECORD: 0x20008040, LAYER_RECORD: 0x20008050, OBJECT_RECORD: 0x20008070, IDEF_RECORD: 0x20008076,
  UNITSANDTOLS: 0x20008031,
  PROPERTIES_APPLICATION: 0x20008024, OPENNURBS_VERSION: 0xa0000026,
  OBJECT_RECORD_TYPE: 0x82000071, OBJECT_RECORD_ATTRIBUTES: 0x02008072, OBJECT_RECORD_END: 0x8200007f,
  CLASS: 0x00027ffa, CLASS_UUID: 0x0002fffb, CLASS_DATA: 0x0002fffc, CLASS_USERDATA: 0x00027ffd, CLASS_USERDATA_HEADER: 0x0002fff9, CLASS_END: 0x80027fff,
  COMPRESSED_BUFFER: 0x00028100,
};

const MAGIC = '3D Geometry File Format ';
const UTF16 = new TextDecoder('utf-16le');
const hex = (n, w) => n.toString(16).padStart(w, '0');

export class Archive {
  constructor(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    this.bytes = bytes;
    this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (bytes.length < 32) throw new ThreeDmError('not_3dm');
    let head = '';
    for (let i = 0; i < 24; i++) head += String.fromCharCode(bytes[i]);
    if (head !== MAGIC) throw new ThreeDmError('not_3dm');
    let ver = '';
    for (let i = 24; i < 32; i++) ver += String.fromCharCode(bytes[i]);
    ver = ver.trim();
    if (!/^\d{1,3}$/.test(ver)) throw damaged('ccdm.damaged.header');
    this.version = +ver;
    // 1–4: four-byte chunk lengths; 50 and up (the version-5 layout onwards, written as version × 10): eight
    this.lenSize = this.version < 50 ? 4 : 8;
    // the openNURBS version the file was written with (some layouts depend on it); read from the properties table
    this.onVersion = 0;
  }
  reader() { return new Reader(this, 32, this.bytes.length); }
}

export class Reader {
  constructor(ar, pos, end) { this.ar = ar; this.dv = ar.dv; this.b = ar.bytes; this.pos = pos; this.end = end; }
  need(n) {
    if (!(n >= 0) || this.pos + n > this.end) throw damaged('ccdm.damaged.short');
  }
  atEnd() { return this.pos >= this.end; }
  left() { return this.end - this.pos; }
  u8() { this.need(1); return this.b[this.pos++]; }
  bool() { return this.u8() !== 0; }
  i16() { this.need(2); const v = this.dv.getInt16(this.pos, true); this.pos += 2; return v; }
  u16() { this.need(2); const v = this.dv.getUint16(this.pos, true); this.pos += 2; return v; }
  i32() { this.need(4); const v = this.dv.getInt32(this.pos, true); this.pos += 4; return v; }
  u32() { this.need(4); const v = this.dv.getUint32(this.pos, true); this.pos += 4; return v; }
  i64() {
    this.need(8);
    const lo = this.dv.getUint32(this.pos, true), hi = this.dv.getInt32(this.pos + 4, true);
    this.pos += 8;
    return hi * 4294967296 + lo;   // exact up to 2^53, far past any length a file this size can hold
  }
  f64() { this.need(8); const v = this.dv.getFloat64(this.pos, true); this.pos += 8; return v; }
  f32() { this.need(4); const v = this.dv.getFloat32(this.pos, true); this.pos += 4; return v; }
  f64s(n) { this.count(n, 8); const a = new Float64Array(n); for (let i = 0; i < n; i++) a[i] = this.f64(); return a; }
  i32s(n) { this.count(n, 4); const a = new Int32Array(n); for (let i = 0; i < n; i++) a[i] = this.i32(); return a; }
  point(dim = 3) { const p = []; for (let i = 0; i < dim; i++) p.push(this.f64()); return p; }
  interval() { return [this.f64(), this.f64()]; }
  bbox() { return [this.point(), this.point()]; }
  xform() { const m = []; for (let i = 0; i < 16; i++) m.push(this.f64()); return m; }   // row-major, as written
  plane() {
    // ON_Plane: origin, x, y, z axes, then the plane equation (4 doubles, not needed)
    const o = this.point(), x = this.point(), y = this.point(), z = this.point();
    this.f64s(4);
    return { o, x, y, z };
  }
  /** A count about to be read: never more items than the bytes left can hold (`size` bytes each at least). */
  count(n, size = 1) {
    if (!Number.isInteger(n) || n < 0) throw damaged('ccdm.damaged.count');
    if (n * size > this.left()) throw damaged('ccdm.damaged.count');
    if (n > LIMITS.items) throw tooBig('ccdm.too_big.count', { n });
    return n;
  }
  uuid() {
    this.need(16);
    const d1 = this.dv.getUint32(this.pos, true), d2 = this.dv.getUint16(this.pos + 4, true), d3 = this.dv.getUint16(this.pos + 6, true);
    let s = hex(d1, 8) + '-' + hex(d2, 4) + '-' + hex(d3, 4) + '-';
    for (let i = 0; i < 8; i++) { s += hex(this.b[this.pos + 8 + i], 2); if (i === 1) s += '-'; }
    this.pos += 16;
    return s.toUpperCase();
  }
  /** ON_wString: u32 count of UTF-16 units including the closing 0 (0 = empty). */
  wstring() {
    const n = this.u32();
    if (n === 0) return '';
    this.count(n, 2);
    const s = UTF16.decode(this.b.subarray(this.pos, this.pos + 2 * n));
    this.pos += 2 * n;
    return s.replace(/\0+$/, '');
  }
  /** ON_String (8-bit): u32 count including the closing 0. */
  string() {
    const n = this.u32();
    if (n === 0) return '';
    this.count(n, 1);
    let s = '';
    for (let i = 0; i < n; i++) s += String.fromCharCode(this.b[this.pos + i]);
    this.pos += n;
    return s.replace(/\0+$/, '');
  }
  intArray() { const n = this.i32(); return n <= 0 ? new Int32Array(0) : this.i32s(this.count(n, 4)); }
  doubleArray() { const n = this.i32(); return n <= 0 ? new Float64Array(0) : this.f64s(this.count(n, 8)); }
  uuidArray() { const n = this.i32(); const a = []; if (n > 0) { this.count(n, 16); for (let i = 0; i < n; i++) a.push(this.uuid()); } return a; }

  /** The next chunk's header: {tc, value (short chunks), start, end (body), crc}. The body stays unread. */
  chunk() {
    const tc = this.u32();
    const len = this.ar.lenSize === 8 ? this.i64() : (tc & TC.SHORT ? this.u32() : this.i32());
    if (tc & TC.SHORT) return { tc, value: len, start: this.pos, end: this.pos, short: true };
    if (len < 0 || this.pos + len > this.end) throw damaged('ccdm.damaged.chunk', { tc: hex(tc, 8) });
    return { tc, len, start: this.pos, end: this.pos + len, crc: !!(tc & TC.CRC) };
  }
  /** A reader over a chunk's body (without its CRC); the parent moves past the chunk. */
  sub(c) {
    this.pos = c.end;
    const end = c.crc && c.end - c.start >= 4 ? c.end - 4 : c.end;
    return new Reader(this.ar, c.start, end);
  }
  /** Expect a chunk of this typecode and read into it. */
  expect(tc, key = 'ccdm.damaged.layout') {
    const c = this.chunk();
    if (c.tc !== tc) throw damaged(key, { tc: hex(c.tc, 8) });
    return c;
  }
  /** Skip the next chunk whole (its header says how long it is). */
  skipChunk() { const c = this.chunk(); this.pos = c.end; return c; }
  /** Peek at the next chunk's typecode without moving. */
  peekTc() { if (this.left() < 4) return -1; return this.dv.getUint32(this.pos, true); }
  /**
   * ReadCompressedBufferSize + ReadCompressedBuffer: u32 unpacked size; when it is not 0: u32 CRC of the unpacked bytes
   * (not checked), u8 method (0 = stored, 1 = zlib inside an anonymous chunk whose last 4 bytes are a CRC). → Uint8Array
   * of exactly `size` bytes, or null for an empty buffer. `want` (when given) is the size the caller expects.
   */
  compressed(want = null) {
    const size = this.u32();
    if (size === 0) return null;
    if (want !== null && size !== want) throw damaged('ccdm.damaged.zip');
    if (size > LIMITS.unpacked) throw tooBig('ccdm.too_big.count', { n: size });
    this.u32();
    const method = this.u8();
    if (method === 0) { this.need(size); const b = this.b.slice(this.pos, this.pos + size); this.pos += size; return b; }
    if (method !== 1) throw damaged('ccdm.damaged.zip');
    const c = this.chunk();
    if (c.tc !== TC.ANONYMOUS || c.len <= 4) throw damaged('ccdm.damaged.zip');
    this.pos = c.end;
    try { return inflateZlib(this.b.subarray(c.start, c.end - 4), size); } catch (e) { if (e instanceof ThreeDmError) throw e; throw damaged('ccdm.damaged.zip'); }
  }
  /** Read3dmChunkVersion: one byte, major in the high nibble. */
  versioned() { const v = this.u8(); return [v >> 4, v & 15]; }
  /** BeginRead3dmChunk(TCODE_ANONYMOUS_CHUNK, &major, &minor): an anonymous chunk starting with i32 major, i32 minor. */
  versionedChunk(tc = TC.ANONYMOUS) {
    const c = this.expect(tc);
    const r = this.sub(c);
    const major = r.i32(), minor = r.i32();
    return { r, major, minor };
  }
}

export const tcHex = (tc) => hex(tc >>> 0, 8);
