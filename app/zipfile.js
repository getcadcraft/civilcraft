/* SPDX-License-Identifier: Apache-2.0 */
/**
 * zipfile.js — a small ZIP reader and writer (docs/GIS-SPEC.md §2). No DOM; Node has the same streams.
 *
 *   listZip(bytes) → [{ name, size, csize, method, offset, crc, dir }]   central directory, checked (throws ZipError)
 *   await unzipEntry(bytes, entry, { max }) → Uint8Array                stored (0) or deflate (8) via
 *                                                                          DecompressionStream('deflate-raw'); CRC checked
 *   await zip([{ name, data: Uint8Array | string }], { deflate = true }) → Uint8Array   UTF-8 names (flag 11), CRC-32;
 *                                                                          deflate via CompressionStream, stored when that
 *                                                                          does not make the entry smaller (or is missing)
 *   crc32(bytes) → uint32
 *
 * Untrusted input: every offset and size is checked against the file before it is used, sizes are capped (an entry
 * claiming more than `max` bytes, 200 MB by default, is refused, and the inflated output is cut off at its stated size
 * — a zip bomb stops there), encrypted entries, ZIP64 and other methods are refused with a plain message.
 */

import { t } from "./i18n.js";

export class ZipError extends Error {}
const MAX_ENTRIES = 20000;
const MAX_ENTRY = 200 * 1024 * 1024;

let CRC_TABLE = null;
export function crc32(b, crc = 0) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_TABLE[n] = c >>> 0; }
  }
  crc = ~crc >>> 0;
  for (let i = 0; i < b.length; i++) crc = CRC_TABLE[(crc ^ b[i]) & 255] ^ (crc >>> 8);
  return ~crc >>> 0;
}

const u8 = (b) => (b instanceof Uint8Array ? b : new Uint8Array(b));
const utf8 = new TextDecoder('utf-8', { fatal: false });
const latin = new TextDecoder('windows-1252');

export function listZip(bytes) {
  const b = u8(bytes);
  if (b.length < 22) throw new ZipError(t('zip.short'));
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  // end of central directory: the last 22 bytes, or up to 64 KB earlier when there is a comment
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new ZipError(t('zip.noend'));
  const count = dv.getUint16(eocd + 10, true), cdSize = dv.getUint32(eocd + 12, true), cdOff = dv.getUint32(eocd + 16, true);
  if (count === 0xffff || cdOff === 0xffffffff) throw new ZipError(t('zip.zip64'));
  if (count > MAX_ENTRIES) throw new ZipError(t('zip.many', { n: count, max: MAX_ENTRIES }));
  if (cdOff + cdSize > eocd || cdOff > b.length) throw new ZipError(t('zip.outside'));
  const out = [];
  let p = cdOff;
  for (let k = 0; k < count; k++) {
    if (p + 46 > eocd || dv.getUint32(p, true) !== 0x02014b50) throw new ZipError(t('zip.list'));
    const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true);
    const crc = dv.getUint32(p + 16, true), csize = dv.getUint32(p + 20, true), size = dv.getUint32(p + 24, true);
    const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
    const offset = dv.getUint32(p + 42, true);
    if (p + 46 + nl + xl + cl > eocd) throw new ZipError(t('zip.list'));
    const raw = b.subarray(p + 46, p + 46 + nl);
    const name = ((flags & 0x800) ? utf8 : latin).decode(raw).replace(/\\/g, '/');
    out.push({ name, size, csize, method, offset, crc, flags, dir: name.endsWith('/') });
    p += 46 + nl + xl + cl;
  }
  return out;
}

async function pump(stream, input, limit) {
  const w = stream.writable.getWriter();
  w.write(input).catch(() => {}); w.close().catch(() => {});
  const r = stream.readable.getReader();
  const parts = []; let n = 0;
  for (;;) {
    let res;
    try { res = await r.read(); } catch { throw new ZipError(t('zip.inflate')); }
    if (res.done) break;
    n += res.value.length;
    if (n > limit) { r.cancel().catch(() => {}); throw new ZipError(t('zip.bomb')); }
    parts.push(res.value);
  }
  const out = new Uint8Array(n); let o = 0;
  for (const q of parts) { out.set(q, o); o += q.length; }
  return out;
}

export async function unzipEntry(bytes, e, { max = MAX_ENTRY } = {}) {
  const b = u8(bytes);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (e.flags & 1) throw new ZipError(t('zip.encrypted', { file: e.name }));
  if (e.size > max || e.csize > b.length) throw new ZipError(t('zip.big', { file: e.name, mb: Math.round(e.size / 1048576), max: Math.round(max / 1048576) }));
  if (e.offset + 30 > b.length || dv.getUint32(e.offset, true) !== 0x04034b50) throw new ZipError(t('zip.entry', { file: e.name }));
  const start = e.offset + 30 + dv.getUint16(e.offset + 26, true) + dv.getUint16(e.offset + 28, true);
  if (start + e.csize > b.length) throw new ZipError(t('zip.cut', { file: e.name }));
  const data = b.subarray(start, start + e.csize);
  let out;
  if (e.method === 0) { if (e.csize !== e.size) throw new ZipError(t('zip.entry', { file: e.name })); out = data.slice(); }
  else if (e.method === 8) {
    if (typeof DecompressionStream === 'undefined') throw new ZipError(t('zip.nostream'));
    out = await pump(new DecompressionStream('deflate-raw'), data, e.size);
    if (out.length !== e.size) throw new ZipError(t('zip.size', { file: e.name }));
  } else throw new ZipError(t('zip.method', { file: e.name, method: e.method }));
  if (crc32(out) !== e.crc) throw new ZipError(t('zip.crc', { file: e.name }));
  return out;
}

const enc = new TextEncoder();
export async function zip(files, { deflate = true, date = new Date() } = {}) {
  const dosTime = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
  const locals = [], central = [];
  let off = 0;
  for (const f of files) {
    const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : u8(f.data);
    const crc = crc32(data);
    let body = data, method = 0;
    if (deflate && data.length > 64 && typeof CompressionStream !== 'undefined') {
      const c = await pump(new CompressionStream('deflate-raw'), data, Infinity);
      if (c.length < data.length) { body = c; method = 8; }
    }
    const h = new Uint8Array(30), hv = new DataView(h.buffer);
    hv.setUint32(0, 0x04034b50, true); hv.setUint16(4, 20, true); hv.setUint16(6, 0x800, true); hv.setUint16(8, method, true);
    hv.setUint16(10, dosTime, true); hv.setUint16(12, dosDate, true); hv.setUint32(14, crc, true);
    hv.setUint32(18, body.length, true); hv.setUint32(22, data.length, true); hv.setUint16(26, name.length, true);
    const c = new Uint8Array(46), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x800, true); cv.setUint16(10, method, true);
    cv.setUint16(12, dosTime, true); cv.setUint16(14, dosDate, true); cv.setUint32(16, crc, true);
    cv.setUint32(20, body.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, off, true);
    locals.push(h, name, body); central.push(c, name);
    off += 30 + name.length + body.length;
  }
  const cdSize = central.reduce((s, x) => s + x.length, 0);
  const e = new Uint8Array(22), ev = new DataView(e.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true);
  ev.setUint32(12, cdSize, true); ev.setUint32(16, off, true);
  const all = [...locals, ...central, e];
  const out = new Uint8Array(all.reduce((s, x) => s + x.length, 0));
  let o = 0;
  for (const x of all) { out.set(x, o); o += x.length; }
  return out;
}
