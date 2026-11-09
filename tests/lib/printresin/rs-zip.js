/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-zip.js — a stored (no compression) zip writer, enough for the layered-picture archives resin printers read (roadmap RSN.*).
 * Written from the ZIP appnote: local headers with known sizes and CRCs, a central directory, an end record. No zip64, so at most 65535 entries and 4 GiB - 1 in all (throws past that).
 * Names are UTF-8 (general purpose bit 11). No DOM; imports only rs-png.js for the CRC.
 *
 *   zipStored(files: [{ name, data: Uint8Array | string }], date = new Date(Date.UTC(2026, 0, 1))) → Uint8Array
 *     date is the one DOS timestamp of every entry (UTC fields, 1980..2107, two-second steps); a fixed default keeps the bytes the same run to run.
 *
 * Read back by our own reader (tools/printresin/sl1-read.mjs) and by `unzip -t` in the test only.
 */
import { crc32 } from './rs-png.js';

const utf8 = new TextEncoder();

export function zipStored(files, date = new Date(Date.UTC(2026, 0, 1))) {
  if (files.length > 0xffff) throw new Error('zip entries');
  const y = date.getUTCFullYear();
  if (y < 1980 || y > 2107) throw new Error('zip date');
  const dosTime = (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() >> 1);
  const dosDate = ((y - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();
  const entries = files.map((f) => {
    const name = utf8.encode(f.name), data = typeof f.data === 'string' ? utf8.encode(f.data) : f.data;
    if (!name.length || name.length > 0xffff) throw new Error('zip name');
    return { name, data, crc: crc32(data) };
  });
  let size = 22, at = 0;
  for (const e of entries) { size += 30 + e.name.length + e.data.length + 46 + e.name.length; }
  if (size > 0xffffffff) throw new Error('zip too big');
  const out = new Uint8Array(size), dv = new DataView(out.buffer);
  for (const e of entries) {
    e.offset = at;
    dv.setUint32(at, 0x04034b50, true);
    dv.setUint16(at + 4, 20, true);              // version needed
    dv.setUint16(at + 6, 0x0800, true);          // UTF-8 names
    dv.setUint16(at + 8, 0, true);               // stored
    dv.setUint16(at + 10, dosTime, true); dv.setUint16(at + 12, dosDate, true);
    dv.setUint32(at + 14, e.crc, true);
    dv.setUint32(at + 18, e.data.length, true); dv.setUint32(at + 22, e.data.length, true);
    dv.setUint16(at + 26, e.name.length, true); dv.setUint16(at + 28, 0, true);
    out.set(e.name, at + 30); out.set(e.data, at + 30 + e.name.length);
    at += 30 + e.name.length + e.data.length;
  }
  const dirAt = at;
  for (const e of entries) {
    dv.setUint32(at, 0x02014b50, true);
    dv.setUint16(at + 4, 20, true); dv.setUint16(at + 6, 20, true);
    dv.setUint16(at + 8, 0x0800, true); dv.setUint16(at + 10, 0, true);
    dv.setUint16(at + 12, dosTime, true); dv.setUint16(at + 14, dosDate, true);
    dv.setUint32(at + 16, e.crc, true);
    dv.setUint32(at + 20, e.data.length, true); dv.setUint32(at + 24, e.data.length, true);
    dv.setUint16(at + 28, e.name.length, true);   // extra, comment, disk, internal attrs, external attrs all 0
    dv.setUint32(at + 42, e.offset, true);
    out.set(e.name, at + 46);
    at += 46 + e.name.length;
  }
  dv.setUint32(at, 0x06054b50, true);
  dv.setUint16(at + 8, entries.length, true); dv.setUint16(at + 10, entries.length, true);
  dv.setUint32(at + 12, at - dirAt, true); dv.setUint32(at + 16, dirAt, true);
  return out;
}
