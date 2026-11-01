/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — file-format code; no words. */
/**
 * pack.js — pictures kept beside the model, not inside it (0.8 D8.8 round 3, session d88b_PART_3; canonical in lib/picture, rule 39: a host
 * carries a byte copy written by tools/picture/sync.mjs). DOM-free, no imports. The zip format (PKWARE APPNOTE 6.3.x, the published layout):
 * local file headers, the data, a central directory, the end record. Entries are stored, or deflated (raw deflate) when the host passes a
 * `deflate(bytes) → Promise<Uint8Array>` (the browser's CompressionStream('deflate-raw')). No zip64: a bundle is limited to 4 GB / 65 535 entries,
 * far over what a model and 8 pictures a level need.
 *
 *   crc32(bytes) → uint32
 *   locationOf(guid, mime) → 'pictures/<guid>.<ext>'      the relative name inside the bundle (what IfcDocumentReference.Location holds)
 *   isLocation(text) → boolean                            a safe relative name in pictures/
 *   zip(entries, { deflate }) → Promise<Uint8Array>        entries: [{ name, data: Uint8Array, deflate?: boolean }]
 *   bundle({ ifc, modelFile, name, schema, pictures: [{ loc, bytes }], deflate, now }) → Promise<Uint8Array>
 *        a `cadcraft-project-bundle` v1 (the format lib/bundle/read.js opens): manifest.json + the model + pictures/…; stories / views empty
 */
const TABLE = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
export function crc32(b) { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };
export function locationOf(guid, mime) { return 'pictures/' + String(guid).replace(/[^A-Za-z0-9_$-]/g, '_') + '.' + (EXT[mime] || 'bin'); }
export function isLocation(s) {
  return typeof s === 'string' && /^pictures\/[A-Za-z0-9_$-]{1,64}\.(png|jpg|webp|bin)$/.test(s);
}

const utf8 = (s) => new TextEncoder().encode(s);

/** DOS date and time of a Date (the zip header's two 16-bit fields). */
function dos(d) {
  const y = Math.max(1980, d.getFullYear());
  return { time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date: ((y - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() };
}

export async function zip(entries, { deflate = null, now = new Date() } = {}) {
  const t = dos(now), parts = [], central = [];
  let off = 0;
  const push = (b) => { parts.push(b); off += b.length; };
  for (const e of entries) {
    const name = utf8(e.name), raw = e.data, crc = crc32(raw);
    let data = raw, method = 0;
    if (e.deflate && deflate && raw.length > 64) { const z = await deflate(raw); if (z.length < raw.length) { data = z; method = 8; } }
    const lho = off;
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, method, true);
    h.setUint16(10, t.time, true); h.setUint16(12, t.date, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, raw.length, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    push(new Uint8Array(h.buffer)); push(name); push(data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, method, true);
    c.setUint16(12, t.time, true); c.setUint16(14, t.date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, raw.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, lho, true);
    central.push(new Uint8Array(c.buffer), name);
  }
  const cdOff = off;
  for (const b of central) push(b);
  const cdSize = off - cdOff;
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, entries.length, true); end.setUint16(10, entries.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, cdOff, true);
  push(new Uint8Array(end.buffer));
  const out = new Uint8Array(off);
  let p = 0;
  for (const b of parts) { out.set(b, p); p += b.length; }
  return out;
}

/** The bundle file: manifest.json (the format lib/bundle/read.js checks), the model, the pictures. */
export async function bundle({ ifc, modelFile = 'model.ifc', name = 'model', schema = '', pictures = [], deflate = null, now = new Date() }) {
  const manifest = {
    format: 'cadcraft-project-bundle', version: 1,
    generator: { name: 'BimCraft' },
    project: { name: String(name).slice(0, 255), kind: 'project', exported_at: now.toISOString() },
    model: { file: modelFile, ...(schema ? { schema: String(schema).slice(0, 40) } : {}) },
    stories: [], views: [], layouts: [],
  };
  const entries = [{ name: 'manifest.json', data: utf8(JSON.stringify(manifest, null, 1)), deflate: true }, { name: modelFile, data: ifc, deflate: true }];
  const seen = new Set();
  for (const p of pictures) if (isLocation(p.loc) && !seen.has(p.loc) && p.bytes?.length) { seen.add(p.loc); entries.push({ name: p.loc, data: p.bytes, deflate: false }); }
  return zip(entries, { deflate, now });
}
