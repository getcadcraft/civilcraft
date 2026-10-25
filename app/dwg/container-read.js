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
  // 0.6.1: a cut-short file (the object map is written last) still opens: read.js finds the objects by scanning
  // from the end of the classes section (objectsFrom)
  if (!sections['AcDb:Header'] && !sections['AcDb:Handles']) throw new UnsupportedDwg(msg('ccdwg.open.r13_locators'));
  for (const name of ['AcDb:Header', 'AcDb:Classes', 'AcDb:Handles']) if (!sections[name]) notes.push(msg('ccdwg.read.section_not_found', { name }));
  const objectsFrom = loc[1] && loc[1].at + loc[1].size <= b.length ? loc[1].at + loc[1].size : loc[0] && loc[0].at + loc[0].size <= b.length ? loc[0].at + loc[0].size : 0x19 + n * 9 + 2;
  return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: true, objectsFrom };
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

  // 4.4 section page map (system page). 0.6.1: a page map that cannot be read (a truncated file, a damaged page) is
  // rebuilt by finding the pages themselves: every data page starts with a masked header (4.6) that names its section
  // and start offset, every system page with its type.
  let pages = null;
  try {
    const pm = readSystemPage(b, pageMapAddr, 0x41630E3B, notes, msg('ccdwg.part.page_map'));
    const pmd = dv(pm);
    pages = new Map();   // page number → { addr, size }
    let addr = 0x100;
    for (let i = 0; i + 8 <= pm.length;) {
      const num = pmd.getInt32(i, true), size = pmd.getUint32(i + 4, true);
      i += 8;
      if (num < 0) i += 16;
      else pages.set(num, { addr, size });
      addr += size;
    }
  } catch (e) {
    notes.push(msg('ccdwg.read.page_map_rebuilt', { reason: e.message }));
  }
  let scan = null;
  const scanned = () => scan || (scan = scanPages(b));
  // 4.5 data section map: the page the header names, else (no page map, or that page is damaged) the last good one found
  let smData = null;
  const sm = pages && pages.get(sectionMapId);
  if (sm) {
    try { smData = readSystemPage(b, sm.addr, 0x4163003B, notes, msg('ccdwg.part.section_map')); }
    catch (e) { notes.push(msg('ccdwg.read.section_map_search', { reason: e.message })); }
  } else if (pages) notes.push(msg('ccdwg.read.section_map_search', { reason: msg('ccdwg.open.no_section_map', { version, id: sectionMapId }) }));
  if (!smData) {
    for (const at of scanned().system.slice().reverse()) {
      try {
        const cand = readSystemPage(b, at, 0x4163003B, [], '');
        if (plausibleSectionMap(cand)) { smData = cand; break; }
      } catch { /* the next one */ }
    }
  }
  // where a page of a section is: by page number through the page map, else by (section id, start) from the scan
  const locate = (num, secId, start) => {
    if (pages) { const l = pages.get(num); return l ? l.addr : undefined; }
    return scanned().data.get(secId + ':' + start)?.addr;
  };
  const sections = {};
  if (!smData) {
    if (!pages && !scanned().data.size) throw new UnsupportedDwg(msg('ccdwg.open.no_pages', { version }));
    notes.push(msg('ccdwg.read.sections_guessed'));
    Object.assign(sections, guessSections(b, scanned().data, notes));
    return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: false, recovered: true };
  }
  const sd = dv(smData);
  const count = sd.getUint32(0, true);
  let p = 0x14;
  for (let s = 0; s < count && p + 0x60 <= smData.length; s++) {
    const size = Number(sd.getBigUint64(p, true));
    const pageCount = sd.getUint32(p + 8, true);
    const maxSize = sd.getUint32(p + 0x0C, true);
    const compressed = sd.getUint32(p + 0x14, true);
    const secId = sd.getUint32(p + 0x18, true);
    const encrypted = sd.getUint32(p + 0x1C, true);
    let name = '';
    for (let i = 0; i < 64 && smData[p + 0x20 + i]; i++) name += String.fromCharCode(smData[p + 0x20 + i]);
    p += 0x60;
    const list = [];
    // Spec 4.5: PageCount counts the pages written (zero pages are not), so it is only impossible past the map's end
    if (p + pageCount * 16 > smData.length) { notes.push(msg('ccdwg.read.section_map_damaged', { n: pageCount })); break; }
    for (let k = 0; k < pageCount; k++) {
      list.push({ num: sd.getUint32(p, true), dataSize: sd.getUint32(p + 4, true), start: Number(sd.getBigUint64(p + 8, true)) });
      p += 16;
    }
    if (!name) continue;
    if (encrypted === 1) { notes.push(msg('ccdwg.read.section_encrypted', { name })); continue; }
    try {
      sections[name] = readDataSection(b, (pg) => locate(pg.num, secId, pg.start), list, size, maxSize, compressed === 2, name, notes);
    } catch (e) {
      notes.push(msg('ccdwg.read.section_failed', { name, reason: e.message }));
    }
  }
  return { version, ver, maintenance, codepageNum, notes, sections, objectsAbsolute: false, recovered: !pages };
}

/** 0.6.1 recovery: every data page (4.6 masked header) and system page in the file, found by their headers. */
function scanPages(b) {
  const d = dv(b);
  const data = new Map(), system = [];
  for (let at = 0x100; at + 0x20 <= b.length; at += 4) {
    const w = d.getUint32(at, true);
    if (w === 0x4163003B) { system.push(at); continue; }
    const mask = (0x4164536B ^ at) >>> 0;
    if (((w ^ mask) >>> 0) !== 0x4163043B) continue;
    const H = (k) => (d.getUint32(at + k, true) ^ mask) >>> 0;
    const secId = H(4), dataSize = H(8), start = H(16) + H(20) * 4294967296;
    if (dataSize > b.length || secId > 0xFFFF) continue;
    data.set(secId + ':' + start, { addr: at, secId, start, dataSize, pageSize: H(12) });
  }
  return { data, system };
}

/** A decoded section map that looks like one (4.5): a sane count, names that are section names. */
function plausibleSectionMap(m) {
  if (m.length < 0x14 + 0x60) return false;
  const d = dv(m), n = d.getUint32(0, true);
  if (!n || n > 256) return false;
  let name = '';
  for (let i = 0; i < 64 && m[0x14 + 0x20 + i]; i++) name += String.fromCharCode(m[0x14 + 0x20 + i]);
  return name === '' || name.startsWith('AcDb:');
}

/**
 * 0.6.1 recovery without a section map: the pages found by scanPages, grouped by section id and put together by
 * start offset; the sections readDwg needs are told apart by what they start with (the header and classes sentinels,
 * ch. 9/10; RL 0x0DCA for the objects, ch. 20; an object map page with a good CRC, ch. 23).
 */
function guessSections(b, data, notes) {
  const groups = new Map();
  for (const pg of data.values()) { if (!groups.has(pg.secId)) groups.set(pg.secId, []); groups.get(pg.secId).push(pg); }
  const out = {};
  for (const list of groups.values()) {
    list.sort((x, y) => x.start - y.start);
    const tryAs = (compressed) => {
      const parts = [];
      let size = 0;
      for (let i = 0; i < list.length; i++) {
        const pg = list[i], from = pg.addr + 32, to = Math.min(b.length, from + pg.dataSize);
        const room = i + 1 < list.length ? list[i + 1].start - pg.start : 0x40000;
        if (!(room > 0) || room > 1 << 24) return null;
        let page;
        if (compressed) {
          page = decompressR2004(b, from, to, room, true);
          if (page.lzError && i === 0) return null;
          page = page.subarray(0, i + 1 < list.length ? room : page.lzLength);
        } else page = b.subarray(from, to);
        parts.push([pg.start, page]);
        size = Math.max(size, pg.start + page.length);
      }
      if (size > Math.max(1 << 26, b.length * 64)) return null;
      const sec = new Uint8Array(size);
      for (const [at, page] of parts) sec.set(page, at);
      return sec;
    };
    for (const compressed of [true, false]) {
      const sec = tryAs(compressed);
      const name = sec && sectionKind(sec);
      if (name && !out[name]) { out[name] = sec; break; }
    }
  }
  for (const k of ['AcDb:Header', 'AcDb:Classes', 'AcDb:Handles', 'AcDb:AcDbObjects']) if (!out[k]) notes.push(msg('ccdwg.read.section_not_found', { name: k }));
  return out;
}
function sectionKind(sec) {
  const starts = (sig) => sig.every((x, i) => sec[i] === x);
  if (sec.length >= 16 && starts(SENTINELS.header)) return 'AcDb:Header';
  if (sec.length >= 16 && starts(SENTINELS.classes)) return 'AcDb:Classes';
  if (sec.length >= 8 && sec[0] === 0xCA && sec[1] === 0x0D && sec[2] === 0 && sec[3] === 0) return 'AcDb:AcDbObjects';
  if (sec.length >= 4) {
    const size = (sec[0] << 8) | sec[1];
    if (size > 2 && size <= 2040 && size + 2 <= sec.length && crc8(0xC0C1, sec, 0, size) === ((sec[size] << 8) | sec[size + 1])) return 'AcDb:Handles';
  }
  return null;
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

/** 4.5/4.6 a data section: masked page headers, pages compressed or stored, zero pages filled in. `locate(page)` → its file
 *  address. 0.6.1: a page that is missing or does not decompress is left as zeros (or keeps what decoded before the
 *  damage) and noted; the rest of the section is kept. */
function readDataSection(b, locate, list, size, maxSize, compressed, name, notes) {
  plausibleSize(size, b.length); plausibleSize(maxSize, b.length);
  const out = new Uint8Array(size);
  const d = dv(b);
  let bad = 0, sums = 0;
  for (const pg of list) {
    const at = locate(pg);
    if (at === undefined) { bad++; continue; }
    if (at + 32 > b.length) { bad++; continue; }
    const mask = (0x4164536B ^ at) >>> 0;
    const H = (k) => (d.getUint32(at + k, true) ^ mask) >>> 0;
    const ptype = H(0), dataSize = H(8), start = H(16) + H(20) * 4294967296;
    const dataSum = H(0x1C);
    if (ptype !== 0x4163043B) { bad++; continue; }
    const from = at + 32;
    const to = Math.min(b.length, from + dataSize);
    if (to < from + dataSize) bad++;   // cut short (a truncated file): keep what is there
    else if (pageChecksum(0, b, from, to) !== dataSum) sums++;
    const logical = Math.min(maxSize, size - start);
    if (logical <= 0) continue;
    if (compressed) {
      const page = decompressR2004(b, from, to, maxSize, true);
      if (page.lzError && to === from + dataSize) bad++;
      out.set(page.subarray(0, logical), start);
    } else {
      out.set(b.subarray(from, Math.min(to, from + logical)), start);
    }
  }
  if (sums) notes.push(msg('ccdwg.read.page_checksum', { name }));
  if (bad) notes.push(msg('ccdwg.read.pages_bad', { n: bad, name }));
  return out;
}
