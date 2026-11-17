// SPDX-License-Identifier: Apache-2.0
/**
 * zip.js — read (stored + deflate) and write (stored) zip files in the browser or Node, no library. Untrusted input: entry count, entry size and
 * total size are capped, names must be safe relative paths, zip64 and encryption are refused. Errors carry `code`.
 *   const z = await unzip(bytes, { maxEntry, maxTotal, maxEntries })   → { names(), has(name), size(name), read(name) → Promise<Uint8Array>, text(name) }
 *   const bytes = zipStore([{ name, bytes }])                          → Uint8Array
 */
const LIM = { maxEntry: 512 * 1024 * 1024, maxTotal: 1024 * 1024 * 1024, maxEntries: 50000 };
const err = (code, extra) => Object.assign(new Error('navis.zip.' + code), { code }, extra);

export function safeName(n) {
  if (typeof n !== 'string' || !n || n.length > 255) return false;
  if (n.startsWith('/') || /^[a-zA-Z]:/.test(n) || n.includes('\\') || n.includes('\0')) return false;
  return !n.split('/').some(p => p === '..' || p === '.');
}

async function inflateRaw(data) {
  const ds = new DecompressionStream('deflate-raw');
  return new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(ds)).arrayBuffer());
}

export async function unzip(bytes, opt = {}) {
  const L = { ...LIM, ...opt };
  if (!(bytes instanceof Uint8Array) || bytes.length < 22) throw err('notzip');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let e = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw err('notzip');
  const count = dv.getUint16(e + 10, true), cdSize = dv.getUint32(e + 12, true), cdOff = dv.getUint32(e + 16, true);
  if (count === 0xffff || cdOff === 0xffffffff || cdSize === 0xffffffff) throw err('zip64');
  if (count > L.maxEntries) throw err('toomany');
  if (cdOff + cdSize > bytes.length) throw err('broken');
  const entries = new Map(); const skipped = []; let p = cdOff, total = 0;
  for (let k = 0; k < count; k++) {
    if (p + 46 > bytes.length || dv.getUint32(p, true) !== 0x02014b50) throw err('broken');
    const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    if (name.endsWith('/')) continue;
    if (!safeName(name)) { skipped.push(name.slice(0, 80)); continue; }
    if (csize === 0xffffffff || usize === 0xffffffff || lho === 0xffffffff) throw err('zip64');
    total += usize; if (total > L.maxTotal) throw err('toolarge');
    entries.set(name, { name, method, flags, csize, usize, lho });
  }
  const read = async name => {
    const en = entries.get(name); if (!en) throw err('missing', { entry: name });
    if (en.flags & 1) throw err('encrypted', { entry: name });
    if (en.usize > L.maxEntry) throw err('toolarge', { entry: name });
    if (en.lho + 30 > bytes.length || dv.getUint32(en.lho, true) !== 0x04034b50) throw err('broken', { entry: name });
    const start = en.lho + 30 + dv.getUint16(en.lho + 26, true) + dv.getUint16(en.lho + 28, true);
    if (start + en.csize > bytes.length) throw err('broken', { entry: name });
    const raw = bytes.subarray(start, start + en.csize);
    let data;
    if (en.method === 0) data = raw; else if (en.method === 8) data = await inflateRaw(raw); else throw err('method', { entry: name });
    if (data.length !== en.usize) throw err('broken', { entry: name });
    return data;
  };
  return { names: () => [...entries.keys()], has: n => entries.has(n), size: n => entries.get(n)?.usize ?? 0, skipped, read, text: async n => new TextDecoder().decode(await read(n)) };
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

/** entries: [{ name, bytes: Uint8Array | string }] → a zip with stored (uncompressed) entries. */
export function zipStore(entries, when = new Date()) {
  const enc = new TextEncoder(); const parts = []; const central = []; let off = 0;
  const dosTime = ((when.getHours() << 11) | (when.getMinutes() << 5) | (when.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((when.getFullYear() - 1980) << 9) | ((when.getMonth() + 1) << 5) | when.getDate()) & 0xffff;
  for (const en of entries) {
    if (!safeName(en.name)) throw err('badname', { entry: en.name });
    const name = enc.encode(en.name), data = typeof en.bytes === 'string' ? enc.encode(en.bytes) : en.bytes, crc = crc32(data);
    const lh = new Uint8Array(30 + name.length), v = new DataView(lh.buffer);
    v.setUint32(0, 0x04034b50, true); v.setUint16(4, 20, true); v.setUint16(6, 0x0800, true); v.setUint16(8, 0, true); v.setUint16(10, dosTime, true); v.setUint16(12, dosDate, true);
    v.setUint32(14, crc, true); v.setUint32(18, data.length, true); v.setUint32(22, data.length, true); v.setUint16(26, name.length, true); lh.set(name, 30);
    const ch = new Uint8Array(46 + name.length), c = new DataView(ch.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, dosTime, true); c.setUint16(14, dosDate, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true); ch.set(name, 46);
    parts.push(lh, data); central.push(ch); off += lh.length + data.length;
  }
  const cdSize = central.reduce((n, x) => n + x.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, cdSize, true); ev.setUint32(16, off, true);
  const all = [...parts, ...central, end]; const out = new Uint8Array(all.reduce((n, x) => n + x.length, 0)); let o = 0;
  for (const x of all) { out.set(x, o); o += x.length; }
  return out;
}
