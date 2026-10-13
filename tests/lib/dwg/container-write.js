/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors and report notes are English (an app translates what it shows). */
/**
 * container-write.js — lays the named sections out as a DWG file (cc-dwg, Apache-2.0):
 *   R13–R15 layout (AC1015: file header with section locators, ch. 3, 26) and the R2004 family (AC1018, AC1024,
 *   AC1027, AC1032: encrypted file header, data pages with masked headers, LZ77 compression, section map and
 *   section page map, ch. 4, 6, 7, 8). R2007 (AC1021) is in r2007-write.js.
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: ch. 2.14 (CRC-8/16 and CRC-32), 3, 4.1–4.7,
 * 9–14, 21–23, 26, 27, and our own CivilCraft R2000 writer. Facts the document leaves out were found by reading
 * AutoCAD's own sample files (testfiles/dwg-samples) with throwaway probes, and by experiment: what LibreDWG's
 * `dwgread -v5` (a test-only black box, never shipped or read; see PROVENANCE.md) printed for those files and ours;
 * each is marked "Spec gap:".
 */
import { ByteWriter, BitWriter } from './bits-write.js';
import { compressR2004 } from './lz-r2004-write.js';
import { crc8 as crc16, crc32, pageChecksum, R2004_MAGIC } from './crc.js';

// ---------------------------------------------------------------- CRCs and checksums: builder R's crc.js (shared)
export { crc8 as crc16, crc32, pageChecksum } from './crc.js';
/** 4.1: the pseudo-random byte sequence (XOR mask of the R2004 file header, padding between pages). */
export const MAGIC = R2004_MAGIC(0x100);

// ---------------------------------------------------------------- sentinels (3, 9, 10, 14, 26)
const SN = {
  FILEHDR_END: [0x95, 0xA0, 0x4E, 0x28, 0x99, 0x82, 0x1A, 0xE5, 0x5E, 0x41, 0xE0, 0x5F, 0x9D, 0x3A, 0x4D, 0x00],
  HEADER: [0xCF, 0x7B, 0x1F, 0x23, 0xFD, 0xDE, 0x38, 0xA9, 0x5F, 0x7C, 0x68, 0xB8, 0x4E, 0x6D, 0x33, 0x5F],
  HEADER_END: [0x30, 0x84, 0xE0, 0xDC, 0x02, 0x21, 0xC7, 0x56, 0xA0, 0x83, 0x97, 0x47, 0xB1, 0x92, 0xCC, 0xA0],
  CLASSES: [0x8D, 0xA1, 0xC4, 0xB8, 0xC4, 0xA9, 0xF8, 0xC5, 0xC0, 0xDC, 0xF4, 0x5F, 0xE7, 0xCF, 0xB6, 0x8A],
  CLASSES_END: [0x72, 0x5E, 0x3B, 0x47, 0x3B, 0x56, 0x07, 0x3A, 0x3F, 0x23, 0x0B, 0xA0, 0x18, 0x30, 0x49, 0x75],
  PREVIEW: [0x1F, 0x25, 0x6D, 0x07, 0xD4, 0x36, 0x28, 0x28, 0x9D, 0x57, 0xCA, 0x3F, 0x9D, 0x44, 0x10, 0x2B],
  PREVIEW_END: [0xE0, 0xDA, 0x92, 0xF8, 0x2B, 0xC9, 0xD7, 0xD7, 0x62, 0xA8, 0x35, 0xC0, 0x62, 0xBB, 0xEF, 0xD4],
  SECOND: [0xD4, 0x7B, 0x21, 0xCE, 0x28, 0x93, 0x9F, 0xBF, 0x53, 0x24, 0x40, 0x09, 0x12, 0x3C, 0xAA, 0x01],
  SECOND_END: [0x2B, 0x84, 0xDE, 0x31, 0xD7, 0x6C, 0x60, 0x40, 0xAC, 0xDB, 0xBF, 0xF6, 0xED, 0xC3, 0x55, 0xFE],
};

// ---------------------------------------------------------------- the per-version facts the writer uses
/** Aux-header / file-header version numbers (ch. 27) and the maintenance release we write. */
export const VERSION_INFO = {
  AC1015: { code: 23, maint: 6 },
  AC1018: { code: 25, maint: 0 },
  AC1021: { code: 27, maint: 0 },
  AC1024: { code: 29, maint: 6 },
  AC1027: { code: 31, maint: 8 },
  AC1032: { code: 33, maint: 0 },
};
/**
 * The header and classes sections carry an extra RL after their size "for R2010/R2013 when the maintenance
 * version is greater than 3, and for R2018" (ch. 9, 10.2).
 */
export const hasHiSize = (version) => {
  const m = VERSION_INFO[version]?.maint ?? 0;
  return version === 'AC1032' || ((version === 'AC1024' || version === 'AC1027') && m > 3);
};

// ---------------------------------------------------------------- section bodies shared by the layouts
/** Wrap header/class data: sentinel, RL size, [RL 0], data, CRC-16 (seed 0xC0C1 over size + data), end sentinel. */
export function wrapSection(begin, end, data, version) {
  const o = new ByteWriter(data.length + 64);
  o.raw(begin);
  const from = o.pos;
  o.RL(data.length);
  if (hasHiSize(version)) o.RL(0);
  o.raw(data);
  const b = o.bytes();
  o.RS(crc16(0xC0C1, b, from, b.length));
  o.raw(end);
  return o.bytes();
}
export const headerSection = (data, version) => wrapSection(SN.HEADER, SN.HEADER_END, data, version);
export const classesSection = (data, version) => wrapSection(SN.CLASSES, SN.CLASSES_END, data, version);

/** An empty preview (14.2): no images. */
export function previewSection() {
  const o = new ByteWriter(64);
  o.raw(SN.PREVIEW); o.RL(1); o.RC(0); o.raw(SN.PREVIEW_END);
  return o.bytes();
}

/** Object map (ch. 23): pages of at most 2032 bytes, big-endian size and CRC; each page restarts at 0/0. */
export function objectMap(map) {
  const out = new ByteWriter(map.length * 6 + 64);
  // Spec gap (our R2000 writer): every page starts again from handle 0 and offset 0, as in AutoCAD's files.
  let i = 0;
  for (;;) {
    const sec = new ByteWriter(2048);
    const start = i;
    let lastH = 0, lastLoc = 0;
    while (i < map.length && sec.pos < 2020) {
      const [h, loc] = map[i];
      sec.MC(h - lastH); sec.MC(loc - lastLoc);
      lastH = h; lastLoc = loc; i++;
    }
    const body = sec.bytes();
    const size = body.length + 2;
    const chunk = new Uint8Array(size);
    chunk[0] = size >> 8; chunk[1] = size & 0xFF; chunk.set(body, 2);
    const c = crc16(0xC0C1, chunk);
    out.raw(chunk); out.RC(c >> 8); out.RC(c & 0xFF);
    if (start === i) break;
  }
  return out.bytes();
}

/** Free-space table (21.1). */
export function objFreeSpace(count, jdUpdate, objectsAt) {
  const o = new ByteWriter(64);
  o.RL(0); o.RL(count); o.RL(jdUpdate.day); o.RL(jdUpdate.ms); o.RL(objectsAt);
  o.RC(4);
  for (const v of [0x32, 0x64, 0x200, 0xFFFFFFFF]) { o.RL(v); o.RL(0); }
  return o.bytes();
}

/**
 * Template (22): empty description + MEASUREMENT. Spec gap: from R2007 the description length counts UTF-16
 * characters and AutoCAD stores the empty description as one NUL character (example_2007.dwg: 6 bytes; builder
 * R's reader found the same).
 */
export function templateSection(measurement, version = 'AC1015') {
  const o = new ByteWriter(8);
  if (['AC1015', 'AC1018'].includes(version)) o.RS(0); else { o.RS(1); o.RS(0); }
  o.RS(measurement ? 1 : 0);
  return o.bytes();
}

/** Auxiliary header (27). */
export function auxHeader(version, jd, handseed) {
  const { code, maint } = VERSION_INFO[version];
  const o = new ByteWriter(160);
  o.raw([0xFF, 0x77, 0x01]);
  o.RS(code); o.RS(maint);
  o.RL(1); o.RL(-1); o.RS(1); o.RS(0); o.RL(0);
  o.RS(code); o.RS(maint); o.RS(code); o.RS(maint);
  o.RS(0x0005); o.RS(0x0893); o.RS(0x0005); o.RS(0x0893); o.RS(0); o.RS(1);
  for (let i = 0; i < 5; i++) o.RL(0);
  o.RL(jd.created.day); o.RL(jd.created.ms); o.RL(jd.updated.day); o.RL(jd.updated.ms);
  o.RL(handseed < 0x7FFFFFFF ? handseed : -1);
  o.RL(0); o.RS(0); o.RS(1); o.RL(0); o.RL(0); o.RL(0); o.RL(1); o.RL(0); o.RL(0); o.RL(0); o.RL(0);
  if (version === 'AC1032') { o.RS(0); o.RS(0); o.RS(0); }
  return o.bytes();
}

/**
 * Summary info (13). Strings: 16-bit length then the characters, NUL-terminated — 8-bit up to R2004, UTF-16 from
 * R2007. Spec gap: the length counts the terminating NUL (empty strings are length 1 + NUL; observed in an AutoCAD
 * 2013 file printed by dwgread -v5, a test-only black box).
 */
export function summaryInfo(version, jd, { title = '', author = '', lastSavedBy = 'cc-dwg' } = {}) {
  const wide = version !== 'AC1018';
  const o = new ByteWriter(256);
  const str = (s) => {
    s = String(s ?? '');
    o.RS(s.length + 1);
    if (wide) { for (let i = 0; i < s.length; i++) o.RS(s.charCodeAt(i)); o.RS(0); }
    else { for (let i = 0; i < s.length; i++) o.RC(s.charCodeAt(i) & 0xFF); o.RC(0); }
  };
  for (const s of [title, '', author, '', '', lastSavedBy, '', '']) str(s);
  o.RL(0); o.RL(0);
  o.RL(jd.created.day); o.RL(jd.created.ms); o.RL(jd.updated.day); o.RL(jd.updated.ms);
  o.RS(0); o.RL(0); o.RL(0);
  return o.bytes();
}

/** RevHistory (18): R18 writes three zero longs, R21+ 0, 0, 1, 0. */
export function revHistory(version) {
  const o = new ByteWriter(16);
  if (version === 'AC1018') { o.RL(0); o.RL(0); o.RL(0); } else { o.RL(0); o.RL(0); o.RL(1); o.RL(0); }
  return o.bytes();
}

// ---------------------------------------------------------------- R13–R15 (AC1015)
/**
 * parts: { header (data bytes), classes (data bytes), objects [{handle, data}], measurement, jd {created, updated},
 *          handseed, keys [handseed, blockCtl, …] }
 */
export function layoutR2000(parts) {
  const version = 'AC1015', { code, maint } = VERSION_INFO[version];
  const CODEPAGE = 30;
  const out = new ByteWriter(1 << 16);
  const HDR_LEN = 0x19 + 6 * 9 + 2 + 16;
  out.zeros(HDR_LEN);
  const aux = auxHeader(version, parts.jd, parts.handseed);
  const axAt = out.pos; out.raw(aux);
  const pvAt = out.pos; out.raw(previewSection());
  const hvAt = out.pos; const hv = headerSection(parts.header, version); out.raw(hv);
  const clAt = out.pos; const cl = classesSection(parts.classes, version); out.raw(cl);
  out.zeros(0x200);                                           // padding (ch. 11)
  const objStart = out.pos;
  const map = [];
  for (const o of parts.objects) { map.push([o.handle, out.pos]); out.raw(o.data); }
  const omAt = out.pos; const om = objectMap(map); out.raw(om);
  const fsAt = out.pos; const fs = objFreeSpace(map.length, parts.jd.updated, objStart); out.raw(fs);
  const loc = [[0, hvAt, hv.length], [1, clAt, cl.length], [2, omAt, om.length], [3, fsAt, fs.length]];
  // second file header (ch. 26)
  const shAt = out.pos;
  {
    const w = new BitWriter(version, 160);
    w.BL(shAt);
    for (const c of [0x41, 0x43, 0x31, 0x30, 0x31, 0x35, 0, 0, 0, 0, 0]) w.RC(c);
    w.RC(maint); w.RC(1);
    w.BS(code | (maint << 8));
    w.RS(CODEPAGE);
    w.BS(6);
    for (const [n, at, size] of [...loc, [4, 0, 1], [5, axAt, aux.length]]) { w.RC(n); w.BL(at); w.BL(size); }
    w.BS(parts.keys.length);
    parts.keys.forEach((h, i) => {
      const bytes = [];
      for (let v = h; v > 0; v = Math.floor(v / 256)) bytes.unshift(v % 256);
      w.RC(bytes.length); w.RC(i);
      for (const b of bytes) w.RC(b);
    });
    const data = w.bytes();
    out.raw(SN.SECOND);
    const sizeAt = out.pos;
    out.RL(4 + data.length + 2 + 8);
    out.raw(data);
    { const b = out.bytes(); out.RS(crc16(0xC0C1, b, sizeAt, out.pos)); }
    out.zeros(8);
    out.raw(SN.SECOND_END);
  }
  const tplAt = out.pos; const tpl = templateSection(parts.measurement, 'AC1015'); out.raw(tpl);
  // file header (3.2), written last
  const fh = new ByteWriter(128);
  fh.raw([0x41, 0x43, 0x31, 0x30, 0x31, 0x35]);
  fh.raw([0, 0, 0, 0, 0, maint, 1]);
  fh.RL(pvAt);
  fh.RC(code); fh.RC(maint);
  fh.RS(CODEPAGE);
  fh.RL(6);
  for (const [n, at, size] of [...loc, [4, tplAt, tpl.length], [5, axAt, aux.length]]) { fh.RC(n); fh.RL(at); fh.RL(size); }
  { const b = fh.bytes(); fh.RS(crc16(0, b) ^ 0x8461); }
  fh.raw(SN.FILEHDR_END);
  const head = fh.bytes();
  if (head.length !== HDR_LEN) throw new Error('DWG file header size mismatch');
  out.buf.set(head, 0);
  return out.bytes();
}

// ---------------------------------------------------------------- R2004 family (AC1018, AC1024, AC1027, AC1032)
const PAGE_DATA = 0x4163043B, PAGE_MAP = 0x41630E3B, SECTION_MAP = 0x4163003B;

/**
 * parts as for layoutR2000. Returns the file bytes.
 * Sections (name, data, compressed?, page size) in the section-map order of 4.5; written in the stream order.
 */
export function layoutR2004(parts, version) {
  const { code, maint } = VERSION_INFO[version];
  const CODEPAGE = 30;
  // AcDb:AcDbObjects: RL 0x0DCA then the objects (20); the object map's offsets are relative to this section.
  const ob = new ByteWriter(1 << 16);
  ob.RL(0x0DCA);
  const map = [];
  for (const o of parts.objects) { map.push([o.handle, ob.pos]); ob.raw(o.data); }
  const sections = [
    // [name, data, compressed (2) / not (1), max page size]
    ['AcDb:SummaryInfo', summaryInfo(version, parts.jd), 1, 0x100],
    ['AcDb:Preview', previewSection(), 1, 0x400],
    // R2013+ ACIS data storage (builder S: acds.js), compressed, its pages right after the preview's as AutoCAD writes them
    ...(parts.acds ? [['AcDb:AcDsPrototype_1b', parts.acds, 2, 0x7400]] : []),
    ['AcDb:RevHistory', revHistory(version), 2, 0x7400],
    ['AcDb:AcDbObjects', ob.bytes(), 2, 0x7400],
    ['AcDb:ObjFreeSpace', objFreeSpace(map.length, parts.jd.updated, 0), 2, 0x7400],
    ['AcDb:Template', templateSection(parts.measurement, version), 2, 0x7400],
    ['AcDb:Handles', objectMap(map), 2, 0x7400],
    ['AcDb:Classes', classesSection(parts.classes, version), 2, 0x7400],
    ['AcDb:AuxHeader', auxHeader(version, parts.jd, parts.handseed), 2, 0x7400],
    ['AcDb:Header', headerSection(parts.header, version), 2, 0x7400],
  ];
  // section ids: "" is 0, the rest count down in section-map order (4.5)
  const mapOrder = [...(parts.acds ? ['AcDb:AcDsPrototype_1b'] : []), 'AcDb:Preview', 'AcDb:SummaryInfo', 'AcDb:RevHistory', 'AcDb:AcDbObjects', 'AcDb:ObjFreeSpace', 'AcDb:Template',
    'AcDb:Handles', 'AcDb:Classes', 'AcDb:AuxHeader', 'AcDb:Header'];
  const ids = new Map(mapOrder.map((n, i) => [n, mapOrder.length - i]));

  const out = new ByteWriter(1 << 16);
  out.zeros(0x100);
  const pages = [];                                            // [{id, addr, size}]
  const descs = [];                                            // section map entries
  let pageId = 0;
  const pad32 = () => { while (out.pos % 0x20) out.RC(MAGIC[out.pos % 0x100]); };
  for (const [name, data, compressed, maxSize] of sections) {
    const id = ids.get(name);
    const desc = { name, size: data.length, maxSize, compressed, id, pages: [] };
    for (let start = 0; start < Math.max(1, data.length); start += maxSize) {
      const logical = data.subarray(start, Math.min(data.length, start + maxSize));
      const full = new Uint8Array(maxSize); full.set(logical);   // pages are stored / compressed whole (spec 4.5)
      const payload = compressed === 2 ? compressR2004(full, { literalOnly: !!globalThis.__LZ_LITERAL }) : full;
      const addr = out.pos;
      const pageSize = (32 + payload.length + 0x1F) & ~0x1F;
      const dataSum = pageChecksum(0, payload);
      const hdr = new ByteWriter(32);
      hdr.RL(PAGE_DATA); hdr.RL(id); hdr.RL(payload.length); hdr.RL(pageSize); hdr.RLL(start); hdr.RL(0); hdr.RL(dataSum);
      const h = hdr.bytes();
      const hdrSum = pageChecksum(dataSum, h);
      h[24] = hdrSum & 0xFF; h[25] = (hdrSum >>> 8) & 0xFF; h[26] = (hdrSum >>> 16) & 0xFF; h[27] = hdrSum >>> 24;
      const mask = (0x4164536B ^ addr) >>> 0;
      for (let k = 0; k < 32; k += 4) {
        const v = (h[k] | (h[k + 1] << 8) | (h[k + 2] << 16) | (h[k + 3] << 24)) ^ mask;
        h[k] = v & 0xFF; h[k + 1] = (v >>> 8) & 0xFF; h[k + 2] = (v >>> 16) & 0xFF; h[k + 3] = v >>> 24;
      }
      out.raw(h); out.raw(payload); pad32();
      const pid = ++pageId;
      pages.push({ id: pid, addr, size: out.pos - addr });
      desc.pages.push({ id: pid, dataSize: payload.length, start });
      if (!data.length) break;
    }
    descs.push(desc);
  }
  if (descs.find((d) => d.name === 'AcDb:Preview')) desc0(descs);

  // Spec gap: AutoCAD leaves two page numbers unused between the data pages and the two system pages
  // (example_2004: data 1–24, section map 27, page map 28; example_2013: 1–20, 23, 24).
  const sectionMapId = pageId + 3, pageMapId = pageId + 4;

  // section map (4.5)
  const sm = new ByteWriter(4096);
  const all = [{ name: '', size: 0, maxSize: 0x7400, compressed: 2, id: 0, pages: [] }, ...mapOrder.map((n) => descs.find((d) => d.name === n))];
  sm.RL(all.length); sm.RL(2); sm.RL(0x7400); sm.RL(0); sm.RL(all.length);
  for (const d of all) {
    sm.RLL(d.size); sm.RL(d.pages.length); sm.RL(d.maxSize); sm.RL(1); sm.RL(d.compressed); sm.RL(d.id); sm.RL(0);
    const nm = new Uint8Array(64); for (let i = 0; i < d.name.length; i++) nm[i] = d.name.charCodeAt(i); sm.raw(nm);
    for (const p of d.pages) { sm.RL(p.id); sm.RL(p.dataSize); sm.RLL(p.start); }
  }
  const smAddr = out.pos;
  out.raw(systemPage(SECTION_MAP, sm.bytes()));
  pad32();
  pages.push({ id: sectionMapId, addr: smAddr, size: out.pos - smAddr });

  // section page map (4.4): its own entry included; its size is known before it is written
  const pmAddr = out.pos;
  const pmEntries = (pmSize) => {
    const pm = new ByteWriter(pages.length * 8 + 16);
    for (const p of pages) { pm.RL(p.id); pm.RL(p.size); }
    pm.RL(pageMapId); pm.RL(pmSize);
    return pm.bytes();
  };
  let pmSize = 0x20, pmBytes;
  for (let k = 0; k < 4; k++) {   // the page's size depends on its compressed length; settle it
    pmBytes = systemPage(PAGE_MAP, pmEntries(pmSize));
    const s = (pmBytes.length + 0x1F) & ~0x1F;
    if (s <= pmSize) break;   // fits (builder S: a size that alternates 0x80 ↔ 0xA0 settles on the larger, entry = header)
    pmSize = s;
  }
  // a settled size larger than the bytes (0xA0 recorded, 0x81 written): pad, so the recorded size is the page's real length
  if (pmBytes.length < pmSize) { const padded = new Uint8Array(pmSize); padded.set(pmBytes); pmBytes = padded; }
  out.raw(pmBytes);
  // Spec gap: the page map's page is not padded — the second copy of the file header follows it directly.
  const secondAt = out.pos;

  // the file header (4.1): 0x6C bytes, encrypted, repeated at the end
  const fhd = new ByteWriter(0x6C);
  fhd.raw([...'AcFssFcAJMB'].map((c) => c.charCodeAt(0))); fhd.RC(0);
  fhd.RL(0); fhd.RL(0x6C); fhd.RL(0x04);
  fhd.RL(0); fhd.RL(0); fhd.RL(0); fhd.RL(1);
  fhd.RL(pageMapId);                                           // last section page id
  fhd.RLL(pmAddr + pmSize - 0x100);                            // last section page end address
  fhd.RLL(secondAt);                                           // second header address
  fhd.RL(0);                                                   // gap amount
  fhd.RL(pageId + 2);                                          // section page amount
  fhd.RL(0x20); fhd.RL(0x80); fhd.RL(0x40);
  fhd.RL(pageMapId); fhd.RLL(pmAddr - 0x100);
  fhd.RL(sectionMapId);
  fhd.RL(pageMapId);                                           // section page array size
  fhd.RL(0);                                                   // gap array size
  fhd.RL(0);                                                   // CRC placeholder
  const plain = fhd.bytes();
  const c = crc32(plain, 0);
  plain[0x68] = c & 0xFF; plain[0x69] = (c >>> 8) & 0xFF; plain[0x6A] = (c >>> 16) & 0xFF; plain[0x6B] = c >>> 24;
  const enc = plain.map((b, i) => b ^ MAGIC[i]);
  out.raw(enc);

  const head = new ByteWriter(0x100);
  head.raw([...version].map((ch) => ch.charCodeAt(0)));
  head.raw([0, 0, 0, 0, 0]); head.RC(maint); head.RC(3);
  const pv = pages[sections.findIndex((s) => s[0] === 'AcDb:Preview')];
  const si = pages[sections.findIndex((s) => s[0] === 'AcDb:SummaryInfo')];
  head.RL(pv.addr + 0x20);
  head.RC(code); head.RC(maint); head.RS(CODEPAGE);
  head.raw([0, 0, 0]);
  head.RL(0); head.RL(0);
  head.RL(si.addr + 0x20); head.RL(0); head.RL(0x80);
  head.zeros(0x80 - head.pos);
  head.raw(enc);
  head.raw(MAGIC.subarray(0xEC, 0x100));
  out.buf.set(head.bytes(), 0);
  return out.bytes();
}
function desc0() { /* placeholder kept for symmetry; the empty section has no pages */ }

/**
 * A system page (4.3): 0x14-byte header (type, decompressed size, compressed size, compression type 2,
 * checksum), the compressed data, then the same header again with sizes and checksum zero.
 * Spec gap: the trailing copy of the header is what AutoCAD writes (the spec mentions it in passing).
 */
function systemPage(type, data) {
  const z = compressR2004(data);
  const h = new ByteWriter(0x14);
  h.RL(type); h.RL(data.length); h.RL(z.length); h.RL(2); h.RL(0);
  const hb = h.bytes();
  const sum = pageChecksum(pageChecksum(0, hb), z);
  hb[16] = sum & 0xFF; hb[17] = (sum >>> 8) & 0xFF; hb[18] = (sum >>> 16) & 0xFF; hb[19] = sum >>> 24;
  const o = new ByteWriter(z.length + 0x28);
  o.raw(hb); o.raw(z);
  o.RL(type); o.RL(0); o.RL(0); o.RL(2); o.RL(0);
  return o.bytes();
}
