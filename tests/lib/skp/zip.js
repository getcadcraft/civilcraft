/* SPDX-License-Identifier: Apache-2.0 */
/**
 * zip.js — the smallest ZIP reader cc-skp needs (docs/SKP-LIB-SPEC.md). A SketchUp 2021+ file is a short header
 * followed by an ordinary ZIP archive (OpenSKP's docs/BINARY_FORMAT.md §1 told us so — MIT, see NOTICE; this code is
 * ours, written from the PKWARE APPNOTE). DOM-free, no dependencies.
 *
 *   const zip = openZip(bytes, start)   bytes = the whole file, start = offset of the first "PK\3\4"
 *   zip.names                           entry names in central-directory order
 *   zip.has(name)                       true when the entry exists
 *   await zip.read(name, budget)        → Uint8Array (stored or deflated; CRC-32 checked)
 *
 * Reads the central directory only (local headers are just used to find the data). Stored (0) and deflate (8);
 * deflate goes through DecompressionStream('deflate-raw') (Node 18+, every current browser). Refused with SkpError:
 * ZIP64 and encrypted entries ('unsupported'), anything that points outside the bytes ('damaged'), entries bigger
 * than LIMITS.entryBytes or a running total over LIMITS.inflatedBytes ('too_big'). `budget` = { used } shared
 * by every read of one file so the total cap holds across entries.
 */
import { SkpError, LIMITS } from './util.js';
import { msg } from './messages.js';

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_END = 0x06054b50;
const SIG_END64_LOCATOR = 0x07064b50;

const damaged = (key, fills) => new SkpError('damaged', msg('ccskp.damaged', { reason: msg(key, fills) }));

/** Entry names are UTF-8 even when the "UTF-8" flag is not set (SketchUp never sets it); fall back to Latin-1. */
function decodeName(raw) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(raw); } catch { /* not UTF-8 */ }
  let s = '';
  for (const c of raw) s += String.fromCharCode(c);
  return s;
}

let crcTable = null;
/** CRC-32 (IEEE, as ZIP uses it). */
export function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Inflate raw deflate data, stopping (too_big) as soon as the output passes `cap` bytes. */
async function inflateRaw(data, cap) {
  if (typeof DecompressionStream !== 'function') {
    throw new SkpError('unsupported', msg('ccskp.unsupported.no_decompress'));
  }
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  // Write and close without awaiting: a broken stream rejects these, and the reader below reports it.
  writer.write(data).catch(() => {});
  writer.close().catch(() => {});
  const reader = ds.readable.getReader();
  const parts = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > cap) {
        reader.cancel().catch(() => {});
        throw new SkpError('too_big', msg('ccskp.too_big.part_unpacks', { mb: Math.round(cap / 1048576) }));
      }
      parts.push(value);
    }
  } catch (e) {
    if (e instanceof SkpError) throw e;
    throw damaged('ccskp.damaged.inflate');
  }
  if (parts.length === 1) return parts[0];
  const out = new Uint8Array(total);
  let p = 0;
  for (const part of parts) { out.set(part, p); p += part.length; }
  return out;
}

/**
 * Open the ZIP archive that starts at `start` in `bytes` (which may carry other bytes before it, like the SketchUp
 * header: offsets in the directory are taken relative to wherever the directory turns out to be).
 */
export function openZip(bytes, start = 0) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('openZip needs a Uint8Array');   // i18n-ignore: diagnostic (a caller's bug)
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const len = bytes.length;

  // End of central directory: 22 bytes + up to 65535 bytes of comment, searched backwards.
  let eocd = -1;
  for (let i = len - 22; i >= Math.max(start, len - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === SIG_END && i + 22 + dv.getUint16(i + 20, true) <= len) { eocd = i; break; }
  }
  if (eocd < 0) throw damaged('ccskp.damaged.no_end');
  if (eocd >= 20 && dv.getUint32(eocd - 20, true) === SIG_END64_LOCATOR) {
    throw new SkpError('unsupported', msg('ccskp.unsupported.zip64'));
  }
  const disk = dv.getUint16(eocd + 4, true);
  const count = dv.getUint16(eocd + 10, true);
  const cdSize = dv.getUint32(eocd + 12, true);
  const cdOffset = dv.getUint32(eocd + 16, true);
  if (count === 0xffff || cdSize === 0xffffffff || cdOffset === 0xffffffff) {
    throw new SkpError('unsupported', msg('ccskp.unsupported.zip64'));
  }
  if (disk !== 0) throw new SkpError('unsupported', msg('ccskp.unsupported.multipart'));
  // Where the directory really is, versus where it says it is = the archive's offset inside the file.
  const cdStart = eocd - cdSize;
  if (cdStart < start) throw damaged('ccskp.damaged.dir_outside');
  const base = cdStart - cdOffset;
  if (base < 0) throw damaged('ccskp.damaged.dir_outside');

  const entries = new Map();
  const names = [];
  let p = cdStart;
  for (let i = 0; i < count; i++) {
    if (p + 46 > eocd || dv.getUint32(p, true) !== SIG_CENTRAL) throw damaged('ccskp.damaged.dir_broken');
    const flags = dv.getUint16(p + 8, true);
    const method = dv.getUint16(p + 10, true);
    const crc = dv.getUint32(p + 16, true);
    const csize = dv.getUint32(p + 20, true);
    const usize = dv.getUint32(p + 24, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    if (p + 46 + nameLen + extraLen + commentLen > eocd) throw damaged('ccskp.damaged.dir_broken');
    const name = decodeName(bytes.subarray(p + 46, p + 46 + nameLen));
    if (csize === 0xffffffff || usize === 0xffffffff || local === 0xffffffff) {
      throw new SkpError('unsupported', msg('ccskp.unsupported.zip64'));
    }
    if (!entries.has(name)) {
      entries.set(name, { name, flags, method, crc, csize, usize, local: base + local });
      names.push(name);
    }
    p += 46 + nameLen + extraLen + commentLen;
  }

  return {
    names,
    has: (name) => entries.has(name),
    size: (name) => entries.get(name)?.usize ?? 0,
    /** Unpack one entry. budget = { used } (bytes inflated so far for this file). */
    async read(name, budget = { used: 0 }) {
      const e = entries.get(name);
      if (!e) throw damaged('ccskp.damaged.entry_missing', { name });
      if (e.flags & 1) throw new SkpError('unsupported', msg('ccskp.unsupported.encrypted'));
      if (e.usize > LIMITS.entryBytes) throw new SkpError('too_big', msg('ccskp.too_big.part', { mb: Math.round(LIMITS.entryBytes / 1048576) }));
      if (budget.used + e.usize > LIMITS.inflatedBytes) throw new SkpError('too_big', msg('ccskp.too_big.unpacked'));
      const lh = e.local;
      if (lh < start || lh + 30 > len || dv.getUint32(lh, true) !== SIG_LOCAL) throw damaged('ccskp.damaged.entry_outside', { name });
      const dataStart = lh + 30 + dv.getUint16(lh + 26, true) + dv.getUint16(lh + 28, true);
      if (dataStart + e.csize > len) throw damaged('ccskp.damaged.entry_past_end', { name });
      const raw = bytes.subarray(dataStart, dataStart + e.csize);
      let out;
      if (e.method === 0) {
        if (e.csize !== e.usize) throw damaged('ccskp.damaged.entry_size', { name });
        out = raw;
      } else if (e.method === 8) {
        out = await inflateRaw(raw, Math.min(e.usize, LIMITS.entryBytes));
      } else {
        throw new SkpError('unsupported', msg('ccskp.unsupported.method', { name, method: e.method }));
      }
      if (out.length !== e.usize) throw damaged('ccskp.damaged.entry_unpacked', { name });
      if (crc32(out) !== e.crc) throw damaged('ccskp.damaged.entry_crc', { name });
      budget.used += out.length;
      return out;
    },
  };
}
