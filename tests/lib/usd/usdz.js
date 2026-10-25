/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usdz.js — USDZ packages (the published USDZ specification): an uncompressed, unencrypted zip whose first file is the
 * default layer and whose every file's data starts on a 64-byte boundary. Our own zip code (PKWARE APPNOTE). DOM-free.
 *
 *   readUsdz(bytes, opts) → { names: [entry names in order], files: Map<name, Uint8Array>, root: first layer's name }
 *   writeUsdz([{name, bytes}]) → Uint8Array      (the first entry must be a .usda/.usdc/.usd layer)
 *   isZip(bytes)
 *
 * Refused: compressed or encrypted entries ('unsupported' — the specification forbids them), ZIP64, anything pointing
 * outside the bytes ('damaged'), more entries than LIMITS.zipEntries ('too_big').
 */
import { UsdError, damaged, unsupported, limitsOf, utf8, utf8decode } from './util.js';
import { msg } from './messages.js';

export function isZip(b) { return b && b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4; }

const LAYER = /\.(usda|usdc|usd)$/i;

export function readUsdz(bytes, opts = {}) {
  const limits = limitsOf(opts);
  const b = bytes;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const bad = () => damaged('ccusd.damaged.zip');
  // end of central directory: the last "PK\5\6" within the final 64 KB + 22 bytes
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw bad();
  const count = dv.getUint16(eocd + 10, true), cdSize = dv.getUint32(eocd + 12, true), cdOff = dv.getUint32(eocd + 16, true);
  if (count === 0xffff || cdOff === 0xffffffff) throw unsupported('ccusd.unsupported.zip', { name: 'ZIP64' });
  if (count > limits.zipEntries) throw new UsdError('too_big', msg('ccusd.too_big', { what: count + ' files' }));
  if (cdOff + cdSize > b.length) throw bad();
  const names = [], files = new Map();
  let p = cdOff;
  for (let k = 0; k < count; k++) {
    if (p + 46 > b.length || dv.getUint32(p, true) !== 0x02014b50) throw bad();
    const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    if (p + 46 + nlen > b.length) throw bad();
    const name = utf8decode(b.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (name.endsWith('/')) continue;
    if (flags & 1) throw unsupported('ccusd.unsupported.zip', { name });
    if (method !== 0) throw unsupported('ccusd.unsupported.zip', { name });
    if (csize !== usize || csize === 0xffffffff) throw unsupported('ccusd.unsupported.zip', { name });
    if (local + 30 > b.length || dv.getUint32(local, true) !== 0x04034b50) throw bad();
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true);
    if (start + csize > b.length) throw bad();
    if (files.has(name)) throw bad();
    names.push(name);
    files.set(name, b.subarray(start, start + csize));
  }
  const root = names.find((n) => LAYER.test(n));
  if (!root || root !== names[0]) {
    if (!root) throw new UsdError('missing', msg('ccusd.missing', { name: msg('ccusd.missing.layer') }));
  }
  return { names, files, root };
}

let CRC_TABLE = null;
export function crc32(b) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC_TABLE[n] = c >>> 0; }
  }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function writeUsdz(entries) {
  if (!entries.length || !LAYER.test(entries[0].name)) throw new UsdError('bad_scene', msg('ccusd.bad_scene', { why: msg('ccusd.missing.layer') }));
  const parts = [], central = [];
  let off = 0;
  const seen = new Set();
  for (const { name, bytes } of entries) {
    if (seen.has(name)) throw new UsdError('bad_scene', msg('ccusd.bad_scene', { why: name }));
    seen.add(name);
    const nb = utf8.encode(name);
    const crc = crc32(bytes);
    // pad the extra field so the data starts on a 64-byte boundary (an extra block with id 0x1986, as packagers use)
    let extra = 0;
    const base = off + 30 + nb.length;
    if (base % 64) { extra = 64 - (base % 64); if (extra < 4) extra += 64; }
    const h = new Uint8Array(30 + nb.length + extra);
    const dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x800, true); dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true); dv.setUint32(14, crc, true);
    dv.setUint32(18, bytes.length, true); dv.setUint32(22, bytes.length, true);
    dv.setUint16(26, nb.length, true); dv.setUint16(28, extra, true);
    h.set(nb, 30);
    if (extra) { dv.setUint16(30 + nb.length, 0x1986, true); dv.setUint16(32 + nb.length, extra - 4, true); }
    parts.push(h, bytes);
    central.push({ nb, crc, size: bytes.length, off });
    off += h.length + bytes.length;
  }
  const cdStart = off;
  for (const c of central) {
    const h = new Uint8Array(46 + c.nb.length);
    const dv = new DataView(h.buffer);
    dv.setUint32(0, 0x02014b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 20, true); dv.setUint16(8, 0x800, true);
    dv.setUint16(10, 0, true); dv.setUint16(14, 0x21, true); dv.setUint32(16, c.crc, true);
    dv.setUint32(20, c.size, true); dv.setUint32(24, c.size, true); dv.setUint16(28, c.nb.length, true);
    dv.setUint32(42, c.off, true);
    h.set(c.nb, 46);
    parts.push(h);
    off += h.length;
  }
  const end = new Uint8Array(22);
  const dv = new DataView(end.buffer);
  dv.setUint32(0, 0x06054b50, true); dv.setUint16(8, central.length, true); dv.setUint16(10, central.length, true);
  dv.setUint32(12, off - cdStart, true); dv.setUint32(16, cdStart, true);
  parts.push(end);
  const out = new Uint8Array(off + 22);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
