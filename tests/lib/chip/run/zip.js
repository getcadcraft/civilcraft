/* SPDX-License-Identifier: Apache-2.0 */
/**
 * zip.js — stored (uncompressed) zip files for the Chip design runners (0.9 HD.4–HD.9). DOM-free, no imports. Our own code from the
 * published zip file format (local headers, central directory, end record; CRC-32). The run package that goes to Studio and the result
 * that comes back are stored zips (engines.rs `unzip_stored` reads only stored entries).
 *   zipStored({ name: Uint8Array | string }) → Uint8Array
 *   unzipStored(bytes) → { name: Uint8Array }    throws on a compressed entry or a cut-off file
 *   crc32(bytes) → number
 */

let TABLE = null;
export function crc32(b) {
  if (!TABLE) { TABLE = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const enc = new TextEncoder();
const asBytes = (v) => (v instanceof Uint8Array ? v : enc.encode(String(v)));

export function zipStored(files) {
  const parts = [], central = [];
  let off = 0;
  for (const [name, v] of Object.entries(files)) {
    const nb = enc.encode(name), data = asBytes(v), crc = crc32(data);
    const h = new Uint8Array(30 + nb.length), dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, nb.length, true);
    h.set(nb, 30);
    const c = new Uint8Array(46 + nb.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true);
    cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, nb.length, true);
    cv.setUint32(42, off, true); c.set(nb, 46);
    parts.push(h, data); central.push(c); off += h.length + data.length;
  }
  const csize = central.reduce((s, c) => s + c.length, 0), end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true);
  ev.setUint32(12, csize, true); ev.setUint32(16, off, true);
  const out = new Uint8Array(off + csize + 22);
  let p = 0;
  for (const x of [...parts, ...central, end]) { out.set(x, p); p += x.length; }
  return out;
}

export function unzipStored(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let e = b.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip file');
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  const out = {}, dec = new TextDecoder();
  for (let i = 0; i < n; i++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) throw new Error('the zip file is cut off');
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = dec.decode(b.subarray(p + 46, p + 46 + nl));
    if (method !== 0) throw new Error('compressed entry ' + name);
    const ln = dv.getUint16(lo + 26, true), lx = dv.getUint16(lo + 28, true), start = lo + 30 + ln + lx;
    if (start + size > b.length) throw new Error('the zip file is cut off');
    if (!name.endsWith('/')) out[name] = b.slice(start, start + size);
    p += 46 + nl + xl + cl;
  }
  return out;
}
