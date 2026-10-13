/* SPDX-License-Identifier: Apache-2.0 */
/**
 * acds.js — the R2013+ data storage section AcDb:AcDsPrototype_1b (cc-dwg, Apache-2.0), read and write.
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1, ch. 24 (file header 24.1, file segments
 * 24.2, segment index 24.2.2.1, data index 24.2.2.2, data segment + blob references 24.2.2.3, blob01 24.2.2.4, schema
 * index/data 24.2.2.5–6, search 24.2.2.7, default contents 24.3) and ch. 7 (where the section sits). The section
 * holds one record per ACIS entity (REGION / 3DSOLID / BODY / SURFACE …): the entity's handle and its SAB stream.
 * Where the document is wrong or silent the facts were found by experiment (AutoCAD's own example_2013/2018.dwg and
 * files the ODA File Converter saved) and are marked "Spec gap:".
 *
 *   readAcds(bytes) → { records: Map(handle Number → Uint8Array), notes: [string], info }
 *   writeAcds(records: [{ handle: Number, data: Uint8Array }]) → Uint8Array (the section's logical bytes)
 */

const SIG = 0x6472616A;            // "jard" (24.1 file signature)
const SEG_SIG = 0xD5AC;            // 24.2.1
const BLOB_REF = 0xBB106BB1;       // 24.2.2.3: dataSize of a record that is a blob reference
const PAD = 0x70;                  // 24.2: segment padding byte

const dv = (b) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const name6 = (b, at) => { let s = ''; for (let i = 0; i < 6; i++) s += String.fromCharCode(b[at + i]); return s; };

/** Read the data storage section. Never throws: a damaged section gives fewer records and a note. */
export function readAcds(sec) {
  const notes = [];
  const records = new Map();
  const info = {};
  try {
    if (!sec || sec.length < 0x40) { notes.push('The data storage section is empty.'); return { records, notes, info }; }
    const d = dv(sec);
    if (d.getUint32(0, true) !== SIG) { notes.push('The data storage section has no "jard" signature.'); return { records, notes, info }; }
    const H = (k) => d.getInt32(k, true);
    Object.assign(info, { headerSize: H(4), unknown1: H(8), version: H(12), unknown2: H(16), revision: H(20), segIdxOffset: H(24),
      segIdxUnknown: H(28), segCount: H(32), schIdx: H(36), datIdx: H(40), searchIdx: H(44), prevSave: H(48), fileSize: H(52) });
    // 24.2.2.1 segment index: the stream offset and size of every file segment, by segment index
    const segAt = (off) => {
      if (off < 0 || off + 0x30 > sec.length || d.getUint16(off, true) !== SEG_SIG) throw new Error('no file segment at ' + off);
      return { off, name: name6(sec, off + 2), index: H(off + 8), unknown1: H(off + 12), size: H(off + 16), revision: H(off + 24),
        sysAlign: H(off + 32), objAlign: H(off + 36), data: off + 0x30 };
    };
    const si = segAt(info.segIdxOffset);
    if (si.name !== 'segidx') throw new Error('the segment index is a "' + si.name + '" segment');
    const segs = [];
    for (let i = 0, p = si.data; i < info.segCount && p + 12 <= sec.length; i++, p += 12) {
      segs.push({ offset: Number(d.getBigUint64(p, true)), size: d.getUint32(p + 8, true) });
    }
    const seg = (i) => { const s = segs[i]; if (!s || !s.offset) throw new Error('segment ' + i + ' is not in the index'); return segAt(s.offset); };
    // 24.2.2.2 data index: (segment, local offset, schema) per entry
    const di = seg(info.datIdx);
    const n = H(di.data);
    const entries = [];
    for (let i = 0, p = di.data + 8; i < n && p + 12 <= sec.length; i++, p += 12) {
      const e = { seg: d.getUint32(p, true), local: d.getUint32(p + 4, true), schema: d.getUint32(p + 8, true) };
      if (e.seg) entries.push(e);
    }
    info.entries = entries.length;
    // 24.2.2.3 data segments: record headers at the entries' local offsets, data after the "data start marker"
    const bySeg = new Map();
    for (const e of entries) (bySeg.get(e.seg) || bySeg.set(e.seg, []).get(e.seg)).push(e);
    for (const [si2, list] of bySeg) {
      const s = seg(si2);
      if (s.name !== '_data_') { notes.push('Data storage entry points at a "' + s.name + '" segment.'); continue; }
      const segEnd = s.off + segs[si2].size;
      // Spec gap: the data index's local offsets count from the end of the segment header (stream position + 0x30),
      // and the "data start marker" is the segment start + (object data alignment offset << 4) — found by experiment.
      const heads = list.map((e) => {
        const p = s.data + e.local;
        return { size: d.getUint32(p, true), unknown: d.getUint32(p + 4, true), handle: Number(d.getBigUint64(p + 8, true)), local: d.getUint32(p + 16, true) };
      });
      const start = s.off + (s.objAlign << 4);
      const starts = heads.map((h) => start + h.local).sort((a, b) => a - b);
      for (const h of heads) {
        const at = start + h.local;
        const nextAt = starts.find((x) => x > at) ?? segEnd;
        const max = nextAt - at;
        const size = d.getUint32(at, true);
        if (size === BLOB_REF) records.set(h.handle, readBlob(sec, d, at + 4, seg, segs));
        else if (size + 4 <= max) records.set(h.handle, sec.slice(at + 4, at + 4 + size));
        else notes.push('Data storage record of ' + h.handle.toString(16).toUpperCase() + ' is larger than its segment.');
      }
    }
  } catch (e) {
    notes.push('The data storage section could only be read in part: ' + e.message);
  }
  return { records, notes, info };
}

/** 24.2.2.3.1 a blob reference: the pages live in blob01 segments (24.2.2.4). */
function readBlob(sec, d, p, seg, segs) {
  const total = Number(d.getBigUint64(p, true));
  const pages = d.getUint32(p + 8, true);
  const out = new Uint8Array(total);
  let q = p + 32;   // total UInt64, page count, record size, page size, last page size, 2 × unknown
  for (let k = 0; k < pages; k++, q += 8) {
    const si = d.getUint32(q, true);
    const s = seg(si);
    const b = s.data;
    const start = Number(d.getBigUint64(b + 8, true));
    const size = Number(d.getBigUint64(b + 24, true));
    out.set(sec.subarray(b + 32, b + 32 + Math.min(size, total - start)), start);
  }
  return out;
}

export const ACDS_CONST = { SIG, SEG_SIG, BLOB_REF, PAD };

// ---------------------------------------------------------------- writer
/**
 * The section for a list of records (ACIS entities: handle + SAB bytes), laid out as the ODA File Converter lays out
 * its own (checked byte for byte against the converter's files for the same records): file header (0x80), blob01
 * segments for records over 0x40000 bytes, the data segment, an empty data segment, data index, schema data, schema
 * index, search, and the segment index last. Schemas: the defaults of 24.3 plus "AcDb_Thumbnail_Schema" (index 0) as
 * the converter writes them; the ACIS records use schema 1 "AcDb3DSolid_ASM_Data".
 * Spec gaps (found by experiment): segments are padded to 0x40 with 0x70; the record headers of a data segment are
 * padded to 16 with 0x62 before the data start (the object data alignment); the schema data pads its property-name list
 * to 16 with 0x73; the schema index lists the schemas (index, segment, offset) first and the eight "unknown properties"
 * (segment, offset, schema) second, then the schema names (not in 24.2.2.5); a blob01 header has 0x30 where other
 * segments have their size, and the page index where they have the object data alignment; a blob is cut into pages of
 * 0xFFFB0 bytes, the last page taking the rest (it may be larger).
 */
const BLOB_MAX = 0x40000, PAGE = 0xFFFB0;
const SCHEMA_NAMES = ['AcDb_Thumbnail_Schema', 'AcDb3DSolid_ASM_Data', 'AcDbDs::TreatedAsObjectDataSchema', 'AcDbDs::LegacySchema',
  'AcDbDs::IndexedPropertySchema', 'AcDbDs::HandleAttributeSchema'];
const PROP_NAMES = ['AcDbDs::ID', 'Thumbnail_Data', 'ASM_Data', 'AcDbDs::TreatedAsObjectData', 'AcDbDs::Legacy', 'AcDs:Indexable',
  'AcDbDs::HandleAttribute'];

class Bytes {
  constructor(n = 1024) { this.b = new Uint8Array(n); this.p = 0; }
  need(n) { if (this.p + n > this.b.length) { const c = new Uint8Array(Math.max(this.b.length * 2, this.p + n)); c.set(this.b); this.b = c; } }
  u8(v) { this.need(1); this.b[this.p++] = v & 0xFF; }
  u16(v) { this.u8(v); this.u8(v >>> 8); }
  u32(v) { this.need(4); new DataView(this.b.buffer).setUint32(this.p, v >>> 0, true); this.p += 4; }
  u64(v) { this.need(8); new DataView(this.b.buffer).setBigUint64(this.p, BigInt(v), true); this.p += 8; }
  raw(a) { this.need(a.length); this.b.set(a, this.p); this.p += a.length; }
  str0(s) { for (let i = 0; i < s.length; i++) this.u8(s.charCodeAt(i)); this.u8(0); }
  pad(mult, byte) { while (this.p % mult) this.u8(byte); }
  bytes() { return this.b.slice(0, this.p); }
}

/** A file segment: 0x30 header + data, padded to 0x40 with 0x70. */
function segment(name, index, data, { unknown1 = 0, sysAlign = 0, objAlign = 0, sizeField } = {}) {
  const size = (0x30 + data.length + 0x3F) & ~0x3F;
  const o = new Bytes(size);
  o.u16(SEG_SIG);
  for (let i = 0; i < 6; i++) o.u8(name.charCodeAt(i));
  o.u32(index); o.u32(unknown1); o.u32(sizeField ?? size); o.u32(0); o.u32(1); o.u32(0); o.u32(sysAlign); o.u32(objAlign);
  for (let i = 0; i < 8; i++) o.u8(0x55);
  o.raw(data);
  o.pad(0x40, PAD);
  return o.bytes();
}

/** 24.2.2.6 schema data: the eight unknown properties, the six schemas, the property names. */
function schemaData() {
  const o = new Bytes(512);
  for (let s = 0; s < 2; s++) for (const f of [1, 1, 1, 0]) { o.u32(8); o.u32(f); }
  const offsets = [];
  const prop = (flags, nameIdx, type, values = [], extra) => {
    o.u32(flags); o.u32(nameIdx);
    if (!(flags & 2)) o.u32(type);
    if (flags === 1 || flags === 8) o.u32(extra ?? 0);
    o.u16(values.length);
    for (const v of values) { if (type === 10) o.u64(v); else if (type === 7) o.u8(v); }
  };
  // 0 AcDb_Thumbnail_Schema / 1 AcDb3DSolid_ASM_Data: indexes, then AcDbDs::ID (type 10, two values) and the data (type 15)
  for (const [idx, ids, dataName] of [[[4, 5], [6, 7], 1], [[0, 1], [2, 3], 2]]) {
    offsets.push(o.p);
    o.u16(idx.length); for (const v of idx) o.u64(v);
    o.u16(2); prop(0, 0, 10, ids); prop(0, dataName, 15);
  }
  for (const n of [3, 4, 5]) { offsets.push(o.p); o.u16(0); o.u16(1); prop(0, n, 1); }   // TreatedAsObjectData, Legacy, Indexable
  offsets.push(o.p); o.u16(0); o.u16(1); prop(8, 6, 7, [0], 1);                       // HandleAttribute
  o.pad(16, 0x73);
  const namesAt = o.p;
  o.u32(PROP_NAMES.length); for (const n of PROP_NAMES) o.str0(n);
  return { data: o.bytes(), offsets, namesAt };
}
/** 24.2.2.5 schema index. */
function schemaIndex(datSeg, offsets) {
  const o = new Bytes(512);
  o.u32(offsets.length); o.u32(0);
  offsets.forEach((off, i) => { o.u32(i); o.u32(datSeg); o.u32(off); });
  o.u64(0x0AF10C);
  o.u32(8); o.u32(0);
  for (let k = 0; k < 8; k++) { o.u32(datSeg); o.u32(k * 8); o.u32(2 + (k & 3)); }
  o.pad(16, PAD);
  const namesAt = o.p;
  o.u32(SCHEMA_NAMES.length); for (const n of SCHEMA_NAMES) o.str0(n);
  return { data: o.bytes(), namesAt };
}

/**
 * The data storage section for the ACIS records [{ handle, data: Uint8Array (SAB) }] (handles ascending), or null when
 * there are none (a file without ACIS entities has no such section).
 */
export function writeAcds(records) {
  if (!records || !records.length) return null;
  records = records.slice().sort((a, b) => a.handle - b.handle);
  const segs = [];                                   // [{ index, bytes }] in stream order
  let nextIndex = 2;                                 // 0 unused, 1 = the segment index (written last)
  // blob pages first
  const blobRefs = new Map();
  for (const r of records) {
    if (r.data.length <= BLOB_MAX) continue;
    const n = Math.max(1, Math.floor(r.data.length / PAGE));
    const pages = [];
    for (let k = 0; k < n; k++) {
      const start = k * PAGE, size = k === n - 1 ? r.data.length - start : PAGE;
      const h = new Bytes(32 + size);
      h.u64(r.data.length); h.u64(start); h.u32(k); h.u32(n); h.u64(size);
      h.raw(r.data.subarray(start, start + size));
      const index = nextIndex++;
      segs.push({ index, bytes: segment('blob01', index, h.bytes(), { unknown1: 1, sizeField: 0x30, objAlign: k }) });
      pages.push({ index, size });
    }
    blobRefs.set(r, pages);
  }
  // the data segment: record headers, padding to 16 (0x62), then the records
  const dataIndex = nextIndex++;
  const head = new Bytes(records.length * 20);
  const body = new Bytes(1 << 16);
  for (const r of records) {
    head.u32(20); head.u32(1); head.u64(r.handle); head.u32(body.p);
    const pages = blobRefs.get(r);
    if (pages) {
      body.u32(BLOB_REF); body.u64(r.data.length); body.u32(pages.length); body.u32(32 + pages.length * 8);
      body.u32(PAGE); body.u32(pages[pages.length - 1].size); body.u32(0); body.u32(0);
      for (const p of pages) { body.u32(p.index); body.u32(p.size); }
    } else { body.u32(r.data.length); body.raw(r.data); }
  }
  const hb = head.bytes();
  const dataStart = (0x30 + hb.length + 15) & ~15;
  const dd = new Bytes(dataStart - 0x30 + body.p);
  dd.raw(hb); while (dd.p < dataStart - 0x30) dd.u8(0x62); dd.raw(body.bytes());
  segs.push({ index: dataIndex, bytes: segment('_data_', dataIndex, dd.bytes(), { objAlign: dataStart >> 4 }) });
  // an empty data segment (the converter always adds one)
  const emptyIndex = nextIndex++;
  segs.push({ index: emptyIndex, bytes: segment('_data_', emptyIndex, new Uint8Array(16).fill(0x62), { objAlign: 4 }) });
  // data index
  const datIdx = nextIndex++;
  const di = new Bytes(8 + records.length * 12);
  di.u32(records.length); di.u32(0);
  records.forEach((r, i) => { di.u32(dataIndex); di.u32(i * 20); di.u32(1); });
  segs.push({ index: datIdx, bytes: segment('datidx', datIdx, di.bytes()) });
  // schema data and index
  const schDat = nextIndex++, schIdx = nextIndex++;
  const sd = schemaData();
  segs.push({ index: schDat, bytes: segment('schdat', schDat, sd.data, { sysAlign: (0x30 + sd.namesAt) >> 4 }) });
  const si = schemaIndex(schDat, sd.offsets);
  segs.push({ index: schIdx, bytes: segment('schidx', schIdx, si.data, { sysAlign: (0x30 + si.namesAt) >> 4 }) });
  // search: schema 1 lists every record (sorted index = position), schema 0 none
  const searchIdx = nextIndex++;
  const se = new Bytes(64 + records.length * 32);
  se.u32(2);
  se.u32(1); se.u64(records.length); records.forEach((r, i) => se.u64(i));
  se.u32(1); se.u32(0); se.u32(records.length);
  records.forEach((r, i) => { se.u64(r.handle); se.u64(1); se.u64(i); });
  se.u32(0); se.u64(0); se.u32(1); se.u32(0); se.u32(0);
  segs.push({ index: searchIdx, bytes: segment('search', searchIdx, se.bytes()) });
  // stream positions; the segment index goes last
  const count = nextIndex;
  let pos = 0x80;
  const where = new Array(count).fill(null);
  for (const s of segs) { where[s.index] = { off: pos, size: s.bytes.length }; pos += s.bytes.length; }
  const segIdxOff = pos;
  const sx = new Bytes(count * 12);
  const siSize = (0x30 + count * 12 + 0x3F) & ~0x3F;
  where[1] = { off: segIdxOff, size: siSize };
  for (let i = 0; i < count; i++) { const w = where[i] || { off: 0, size: 0 }; sx.u64(w.off); sx.u32(w.size); }
  const segIdxBytes = segment('segidx', 1, sx.bytes());
  const fileSize = segIdxOff + segIdxBytes.length;
  // 24.1 file header
  const out = new Bytes(fileSize);
  out.u32(SIG); out.u32(0x80); out.u32(2); out.u32(2); out.u32(0); out.u32(1);
  out.u32(segIdxOff); out.u32(0); out.u32(count); out.u32(schIdx); out.u32(datIdx); out.u32(searchIdx); out.u32(0); out.u32(fileSize);
  while (out.p < 0x80) out.u8(0);
  for (const s of segs) out.raw(s.bytes);
  out.raw(segIdxBytes);
  return out.bytes();
}
