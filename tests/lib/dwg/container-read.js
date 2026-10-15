/* SPDX-License-Identifier: Apache-2.0 */
/**
 * container-read.js — find the named sections of a DWG file. cc-dwg (Apache-2.0), written from the ODA
 * "Open Design Specification for .dwg files" v5.4.1: ch. 3 (R13–R15 file header and section locators),
 * ch. 4 (R2004 file header, system pages, page map, section map, masked data page headers, checksums),
 * ch. 5 (R2007 — via r2007.js), ch. 6–8 (R2010–R2018 reuse the R2004 container), ch. 26 (second header).
 *
 *   readContainer(bytes) → {
 *     version: 'AC1015', ver: 15, maintenance, codepageNum, notes: [],
 *     sections: { 'AcDb:Header': Uint8Array, 'AcDb:Classes', 'AcDb:Handles', 'AcDb:AcDbObjects',
 *                 'AcDb:Template'?, 'AcDb:AuxHeader'?, 'AcDb:Preview'?, … },
 *     objectsAbsolute: bool   true for R13–R15: object map offsets are file positions, and
 *                             sections['AcDb:AcDbObjects'] is the whole file
 *   }
 *   Throws only when the file is not a DWG of a supported family (the caller turns that into a note).
 */

import { msg } from './messages.js';
import { crc8, crc32, pageChecksum, R13_HEADER_XOR, R2004_MAGIC } from './crc.js';
import { decompressR2004 } from './lz-r2004.js';
import { readR2007Container } from './r2007.js';
import { VERSION_NUM } from './header-vars.js';
import { UnsupportedDwg, plausibleSize } from './container-util.js';

export const SENTINELS = {
  header: [0xCF, 0x7B, 0x1F, 0x23, 0xFD, 0xDE, 0x38, 0xA9, 0x5F, 0x7C, 0x68, 0xB8, 0x4E, 0x6D, 0x33, 0x5F],
  headerEnd: [0x30, 0x84, 0xE0, 0xDC, 0x02, 0x21, 0xC7, 0x56, 0xA0, 0x83, 0x97, 0x47, 0xB1, 0x92, 0xCC, 0xA0],
  classes: [0x8D, 0xA1, 0xC4, 0xB8, 0xC4, 0xA9, 0xF8, 0xC5, 0xC0, 0xDC, 0xF4, 0x5F, 0xE7, 0xCF, 0xB6, 0x8A],
  classesEnd: [0x72, 0x5E, 0x3B, 0x47, 0x3B, 0x56, 0x07, 0x3A, 0x3F, 0x23, 0x0B, 0xA0, 0x18, 0x30, 0x49, 0x75],
  fileHeaderEnd: [0x95, 0xA0, 0x4E, 0x28, 0x99, 0x82, 0x1A, 0xE5, 0x5E, 0x41, 0xE0, 0x5F, 0x9D, 0x3A, 0x4D, 0x00],
};

export { UnsupportedDwg, plausibleSize };   // container-util.js (shared with r2007.js)

const dv = (b) => new DataView(b.buffer, b.byteOffset, b.byteLength);
const ascii = (b, from, n) => { let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(b[from + i]); return s; };

export function readContainer(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  if (bytes.length < 0x80) throw new UnsupportedDwg(msg('ccdwg.open.too_short', { n: bytes.length }));
  const version = ascii(bytes, 0, 6);
  const ver = VERSION_NUM[version];
  if (!ver) {
    if (/^AC10\d\d$/.test(version) || /^AC[12]\.\d/.test(version) || version.startsWith('MC0.0')) {
      throw new UnsupportedDwg(msg('ccdwg.open.version', { version }));
    }
    throw new UnsupportedDwg(msg('ccdwg.open.not_dwg', { start: version.replace(/[^\x20-\x7e]/g, '?') }));
  }
  if (ver <= 15) return readR13(bytes, version, ver);
  if (ver === 21) return readR2007Container(bytes, version, ver);
  return readR2004(bytes, version, ver);
}

// ---------------------------------------------------------------- R13–R15 (ch. 3)
function readR13(b, version, ver) {
  const d = dv(b);
  const notes = [];
  const maintenance = b[0x0B];
  const codepageNum = d.getUint16(0x13, true);
  const n = d.getUint32(0x15, true);
  if (n > 16) throw new UnsupportedDwg(msg('ccdwg.open.r13_header', { n }));
  const loc = {};
  for (let i = 0; i < n; i++) {
    const at = 0x19 + i * 9;
    loc[b[at]] = { at: d.getUint32(at + 1, true), size: d.getUint32(at + 5, true) };
  }
  const crcAt = 0x19 + n * 9;
  const want = d.getUint16(crcAt, true);
  const got = crc8(0, b, 0, crcAt) ^ (R13_HEADER_XOR[n] || 0);
  if (want !== got) notes.push(msg('ccdwg.read.file_header_crc'));
  const sec = (k) => (loc[k] && loc[k].at + loc[k].size <= b.length ? b.subarray(loc[k].at, loc[k].at + loc[k].size) : null);
  const sections = {
    'AcDb:Header': sec(0), 'AcDb:Classes': sec(1), 'AcDb:Handles': sec(2), 'AcDb:AcDbObjects': b,
  };
  if (loc[3]) sections['AcDb:ObjFreeSpace'] = sec(3);
  if (loc[4]) sections['AcDb:Template'] = sec(4);
  if (loc[5]) sections['AcDb:AuxHeader'] = sec(5);
  if (!sections['AcDb:Header'] || !sections['AcDb:Handles']) throw new UnsupportedDwg(msg('ccdwg.open.r13_locators'));
  return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: true };
}

// ---------------------------------------------------------------- R2004 family (ch. 4, 6, 7, 8)
function readR2004(b, version, ver) {
  const d = dv(b);
  const notes = [];
  const maintenance = b[0x0B];
  const codepageNum = d.getUint16(0x13, true);
  const security = d.getUint32(0x18, true);
  if (security & 1) notes.push(msg('ccdwg.read.password'));
  // 4.1 encrypted file header data at 0x80
  const magic = R2004_MAGIC(0x6C);
  const h = new Uint8Array(0x6C);
  for (let i = 0; i < 0x6C; i++) h[i] = b[0x80 + i] ^ magic[i];
  const hd = dv(h);
  if (ascii(h, 0, 11) !== 'AcFssFcAJMB') throw new UnsupportedDwg(msg('ccdwg.open.no_id', { version }));
  {
    const want = hd.getUint32(0x68, true);
    const tmp = h.slice(); tmp[0x68] = tmp[0x69] = tmp[0x6A] = tmp[0x6B] = 0;
    if (crc32(tmp, 0) !== want) notes.push(msg('ccdwg.read.file_header_crc32'));
  }
  const pageMapAddr = Number(hd.getBigUint64(0x54, true)) + 0x100;
  const sectionMapId = hd.getUint32(0x5C, true);

  // 4.4 section page map (system page)
  const pm = readSystemPage(b, pageMapAddr, 0x41630E3B, notes, msg('ccdwg.part.page_map'));
  const pmd = dv(pm);
  const pages = new Map();   // page number → { addr, size }
  let addr = 0x100;
  for (let i = 0; i + 8 <= pm.length;) {
    const num = pmd.getInt32(i, true), size = pmd.getUint32(i + 4, true);
    i += 8;
    if (num < 0) i += 16;
    else pages.set(num, { addr, size });
    addr += size;
  }
  const sm = pages.get(sectionMapId);
  if (!sm) throw new UnsupportedDwg(msg('ccdwg.open.no_section_map', { version, id: sectionMapId }));
  // 4.5 data section map
  const smData = readSystemPage(b, sm.addr, 0x4163003B, notes, msg('ccdwg.part.section_map'));
  const sd = dv(smData);
  const count = sd.getUint32(0, true);
  const sections = {};
  let p = 0x14;
  for (let s = 0; s < count && p + 0x60 <= smData.length; s++) {
    const size = Number(sd.getBigUint64(p, true));
    const pageCount = sd.getUint32(p + 8, true);
    const maxSize = sd.getUint32(p + 0x0C, true);
    const compressed = sd.getUint32(p + 0x14, true);
    const encrypted = sd.getUint32(p + 0x1C, true);
    let name = '';
    for (let i = 0; i < 64 && smData[p + 0x20 + i]; i++) name += String.fromCharCode(smData[p + 0x20 + i]);
    p += 0x60;
    const list = [];
    if (pageCount > pages.size + 1 || p + pageCount * 16 > smData.length) { notes.push(msg('ccdwg.read.section_map_damaged', { n: pageCount })); break; }
    for (let k = 0; k < pageCount; k++) {
      list.push({ num: sd.getUint32(p, true), dataSize: sd.getUint32(p + 4, true), start: Number(sd.getBigUint64(p + 8, true)) });
      p += 16;
    }
    if (!name) continue;
    if (encrypted === 1) { notes.push(msg('ccdwg.read.section_encrypted', { name })); continue; }
    try {
      sections[name] = readDataSection(b, pages, list, size, maxSize, compressed === 2, name, notes);
    } catch (e) {
      notes.push(msg('ccdwg.read.section_failed', { name, reason: e.message }));
    }
  }
  return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: false };
}

/** 4.3 system section page: 0x14-byte header, then compressed data. */
function readSystemPage(b, addr, type, notes, what) {
  if (addr + 0x14 > b.length) throw new UnsupportedDwg(msg('ccdwg.open.past_end', { what }));
  const d = dv(b);
  const t = d.getUint32(addr, true);
  if (t !== type) throw new UnsupportedDwg(msg('ccdwg.open.page_type', { what, type: t.toString(16) }));
  const usize = plausibleSize(d.getUint32(addr + 4, true), b.length), csize = d.getUint32(addr + 8, true);
  if (addr + 0x14 + csize > b.length) throw new UnsupportedDwg(msg('ccdwg.open.runs_past', { what }));
  const ctype = d.getUint32(addr + 12, true), sum = d.getUint32(addr + 16, true);
  const hdr = b.slice(addr, addr + 0x14); hdr[16] = hdr[17] = hdr[18] = hdr[19] = 0;
  const check = pageChecksum(pageChecksum(0, hdr), b, addr + 0x14, addr + 0x14 + csize);
  if (check !== sum) notes.push(msg('ccdwg.read.system_checksum', { what }));
  if (ctype === 2) return decompressR2004(b, addr + 0x14, addr + 0x14 + csize, usize);
  return b.slice(addr + 0x14, addr + 0x14 + usize);
}

/** 4.5/4.6 a data section: masked page headers, pages compressed or stored, zero pages filled in. */
function readDataSection(b, pages, list, size, maxSize, compressed, name, notes) {
  plausibleSize(size, b.length); plausibleSize(maxSize, b.length);
  const out = new Uint8Array(size);
  const d = dv(b);
  let bad = 0;
  for (const pg of list) {
    const loc = pages.get(pg.num);
    if (!loc) { bad++; continue; }
    const at = loc.addr;
    if (at + 32 > b.length) { bad++; continue; }
    const mask = (0x4164536B ^ at) >>> 0;
    const H = (k) => (d.getUint32(at + k, true) ^ mask) >>> 0;
    const ptype = H(0), dataSize = H(8), start = H(16) + H(20) * 4294967296;
    const dataSum = H(0x1C);
    if (ptype !== 0x4163043B) { bad++; continue; }
    const from = at + 32;
    if (from + dataSize > b.length) { bad++; continue; }
    if (pageChecksum(0, b, from, from + dataSize) !== dataSum) notes.push(msg('ccdwg.read.page_checksum', { name }));
    const logical = Math.min(maxSize, size - start);
    if (logical <= 0) continue;
    if (compressed) {
      const page = decompressR2004(b, from, from + dataSize, maxSize);
      out.set(page.subarray(0, logical), start);
    } else {
      out.set(b.subarray(from, from + logical), start);
    }
  }
  if (bad) notes.push(msg('ccdwg.read.pages_bad', { n: bad, name }));
  return out;
}
