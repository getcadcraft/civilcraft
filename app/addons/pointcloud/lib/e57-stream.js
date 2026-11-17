/* SPDX-License-Identifier: Apache-2.0 */
/**
 * e57-stream.js — an E57 file read page by page (0.10 PERF.25). DOM-free, no app imports.
 *
 * The app's reader (e57.js readE57) puts the WHOLE file in one buffer (a 600 MB E57 is one 600 MB Uint8Array, and a typed array tops out
 * near 2 GB) and thins the points to a budget while it reads. This reads the file in windows of a few MB through Blob.slice, takes the
 * XML section's description of the scans from the app's own e57.js (`e57Detail`, passed in: one copy of the XML reader), then decodes
 * the data packets in order and hands out EVERY point, in the engine's source shape, so the tiler builds a full-resolution cloud.
 *
 *   await e57Source(file, { e57Detail, signal, progress }) → source for buildCloud: { name, count, min, max, rgb, intensity, crs, notes, points() }
 *       e57Detail   e57.js's export (xml text → { scans, crs, imageCount, … })
 *       points()    an async generator of arrays of { x, y, z, cls: 0, rgb?, inten? } (one array per data packet), absolute metres, the
 *                   scan's pose applied, invalid records (cartesianInvalidState / sphericalInvalidState ≠ 0, non-finite) left out
 *   Cartesian and spherical scans are read (spherical → cartesian); colours scaled to 0..255 by the scan's colour limits; intensity to 0..255.
 *   The bounds are found by a first pass over the packets (nothing kept), so a build costs two decodes; a file whose XML section lists
 *   `cartesianBounds` for every scan gets them from there instead.
 *   Throws code 'e57_unsupported' (the caller falls back to the app's reader) for a page size other than 1024, a field type outside
 *   Integer / ScaledInteger / Float, a compressed-vector codec that is not the plain bit packing the standard describes for these fields.
 * Source: ASTM E2807, "Standard Specification for 3D Imaging Data Exchange, Version 1.0" (page layout with a CRC-32 per 1024-byte page,
 * the binary section header, data packets with a stream length per field, bit-packed Integer / ScaledInteger fields, plain Float fields).
 * The page CRCs are not checked, as in the app's reader.
 */
import { fail, throwIfAborted, tick } from './util.js';

const PAGE = 1024, PAYLOAD = 1020, WINDOW_PAGES = 4096;   // 4 MB windows
const toLogical = (p) => Math.floor(p / PAGE) * PAYLOAD + (p % PAGE);
const toPhysical = (l) => Math.floor(l / PAYLOAD) * PAGE + (l % PAYLOAD);

/** Logical bytes (the pages' payloads joined) from a Blob, through one window of pages kept at a time. */
class PagedFile {
  constructor(file, physLength) { this.file = file; this.len = physLength; this.w0 = -1; this.buf = null; }
  async window(page) {
    if (this.buf && page >= this.w0 && page < this.w0 + this.buf.length / PAYLOAD) return;
    const first = Math.floor(page / 1) , last = Math.min(this.len / PAGE, first + WINDOW_PAGES);
    const raw = new Uint8Array(await this.file.slice(first * PAGE, last * PAGE).arrayBuffer());
    const n = Math.floor(raw.length / PAGE), out = new Uint8Array(n * PAYLOAD);
    for (let i = 0; i < n; i++) out.set(raw.subarray(i * PAGE, i * PAGE + PAYLOAD), i * PAYLOAD);
    this.w0 = first; this.buf = out;
  }
  async read(l, n) {
    if (!(l >= 0) || !(n >= 0) || toPhysical(l + Math.max(n, 1) - 1) >= this.len) fail('e57_bad', { why: 'section_past_end' });
    const out = new Uint8Array(n);
    let got = 0, at = l;
    while (got < n) {
      const page = Math.floor(at / PAYLOAD);
      await this.window(page);
      const off = (page - this.w0) * PAYLOAD + (at % PAYLOAD), take = Math.min(n - got, PAYLOAD - (at % PAYLOAD), this.buf.length - off);
      if (take <= 0) fail('e57_bad', { why: 'short_read' });
      out.set(this.buf.subarray(off, off + take), got);
      got += take; at += take;
    }
    return out;
  }
}

function bits24(buf, pos, bits) {
  const i = pos >>> 3, sh = pos & 7;
  let v = ((buf[i] | (buf[i + 1] << 8) | (buf[i + 2] << 16) | (buf[i + 3] << 24)) >>> sh) >>> 0;
  if (sh) v = (v | ((buf[i + 4] || 0) << (32 - sh))) >>> 0;
  return bits === 32 ? v : v & (2 ** bits - 1);
}
function readInt(buf, pos, bits) {
  if (bits <= 32) return bits24(buf, pos, bits);
  let r = 0, got = 0;
  while (got < bits) { const take = Math.min(32, bits - got); r += bits24(buf, pos + got, take) * 2 ** got; got += take; }
  return r;
}

const NEEDED = ['cartesianX', 'cartesianY', 'cartesianZ', 'sphericalRange', 'sphericalAzimuth', 'sphericalElevation', 'cartesianInvalidState', 'sphericalInvalidState', 'colorRed', 'colorGreen', 'colorBlue', 'intensity'];

export async function e57Source(file, { e57Detail, signal = null, progress = null } = {}) {
  if (typeof e57Detail !== 'function') fail('e57_unsupported', { why: 'no_xml_reader' });
  const head = new Uint8Array(await file.slice(0, 48).arrayBuffer());
  if (head.length < 48 || String.fromCharCode(...head.subarray(0, 8)) !== 'ASTM-E57') fail('e57_bad', { why: 'not_e57' });
  const dv = new DataView(head.buffer), big = (o) => Number(dv.getBigUint64(o, true));
  const H = { major: dv.getUint32(8, true), length: big(16), xmlOffset: big(24), xmlLength: big(32), page: big(40) };
  if (H.major !== 1 || H.page !== PAGE) fail('e57_unsupported', { why: 'version_or_page', major: H.major, page: H.page });
  if (H.length > file.size || H.length % PAGE) fail('e57_bad', { why: 'cut_off' });
  const pf = new PagedFile(file, H.length);
  const xml = new TextDecoder().decode(await pf.read(toLogical(H.xmlOffset), H.xmlLength));
  const c = e57Detail(xml);
  if (!c) fail('e57_bad', { why: 'no_root' });
  const scans = c.scans.filter((s) => s.points > 0);
  const listed = scans.reduce((n, s) => n + s.points, 0);
  if (!listed) fail('empty');
  for (const s of scans) {
    const names = s.fields.map((q) => q.name);
    s.cart = ['cartesianX', 'cartesianY', 'cartesianZ'].every((n) => names.includes(n));
    s.sph = ['sphericalRange', 'sphericalAzimuth', 'sphericalElevation'].every((n) => names.includes(n));
  }
  const usable = scans.filter((s) => s.cart || s.sph);
  if (!usable.length) fail('e57_unsupported', { why: 'no_positions' });
  const has = (n) => usable.some((s) => s.fields.some((q) => q.name === n));
  const colour = has('colorRed') && has('colorGreen') && has('colorBlue'), grey = !colour && has('intensity');

  /** Every record of one scan, one array per packet: { x, y, z, rgb?, inten? }. */
  async function* scanRecords(s) {
    const names = s.fields.map((q) => q.name), idx = (n) => names.indexOf(n);
    const I = { x: idx('cartesianX'), y: idx('cartesianY'), z: idx('cartesianZ'), r: idx('sphericalRange'), a: idx('sphericalAzimuth'), e: idx('sphericalElevation'), bad: idx('cartesianInvalidState') >= 0 ? idx('cartesianInvalidState') : idx('sphericalInvalidState'), cr: idx('colorRed'), cg: idx('colorGreen'), cb: idx('colorBlue'), i: idx('intensity') };
    const want = s.fields.map((q) => NEEDED.includes(q.name));
    let R = null;
    if (s.pose) {
      let [w, x, y, z] = s.pose.rotation; const n = Math.hypot(w, x, y, z) || 1; w /= n; x /= n; y /= n; z /= n;
      R = [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)];
    }
    const T = s.pose ? s.pose.translation : [0, 0, 0];
    const colLim = (k) => {
      const q = s.fields.find((z) => z.name === ['colorRed', 'colorGreen', 'colorBlue'][k]);
      if (s.colorLimits && s.colorLimits[k]) return s.colorLimits[k];
      if (q && q.kind === 'int') return [q.min * q.scale + q.offset, (q.min + 2 ** q.bits - 1) * q.scale + q.offset];
      return q ? [0, 1] : [0, 255];
    };
    const iq = s.fields.find((z) => z.name === 'intensity');
    const iLim = s.intensityLimit || (iq && iq.kind === 'int' ? [iq.min * iq.scale + iq.offset, (iq.min + 2 ** iq.bits - 1) * iq.scale + iq.offset] : [0, 1]);
    const sec = await pf.read(toLogical(s.offset), 32);
    if (sec[0] !== 1) fail('e57_bad', { why: 'section_id' });
    let at = toLogical(Number(new DataView(sec.buffer).getBigUint64(16, true)));
    let left = s.points;
    const rest = s.fields.map(() => new Uint8Array(0)), boff = s.fields.map(() => 0);
    const size = s.fields.map((q) => (q.kind === 'f64' ? 64 : q.kind === 'f32' ? 32 : q.bits));
    while (left > 0) {
      const h = await pf.read(at, 4), len = (h[2] | (h[3] << 8)) + 1;
      if (len < 4) fail('e57_bad', { why: 'short_packet' });
      if (h[0] !== 1) { at += len; continue; }
      const pk = await pf.read(at, len), pdv = new DataView(pk.buffer), nb = pdv.getUint16(4, true);
      if (nb !== s.fields.length) fail('e57_bad', { why: 'stream_count', nb });
      let off = 6 + 2 * nb;
      const bufs = [];
      for (let j = 0; j < nb; j++) {
        const l = pdv.getUint16(6 + 2 * j, true);
        if (off + l > len) fail('e57_bad', { why: 'stream_past_packet' });
        const part = pk.subarray(off, off + l); off += l;
        if (rest[j].length) { const m = new Uint8Array(rest[j].length + l); m.set(rest[j]); m.set(part, rest[j].length); bufs.push(m); } else bufs.push(part);
      }
      let n = left;
      s.fields.forEach((q, j) => { if (size[j] > 0) n = Math.min(n, Math.floor((bufs[j].length * 8 - boff[j]) / size[j])); });
      const col = (j) => {
        const q = s.fields[j], out = new Float64Array(n);
        if (!want[j]) return out;
        const buf = bufs[j], b0 = boff[j];
        if (q.kind === 'f64' || q.kind === 'f32') {
          const d = new DataView(buf.buffer, buf.byteOffset, buf.byteLength), w = q.kind === 'f64' ? 8 : 4, o0 = b0 >>> 3;
          for (let k = 0; k < n; k++) out[k] = q.kind === 'f64' ? d.getFloat64(o0 + k * w, true) : d.getFloat32(o0 + k * w, true);
        } else if (q.bits === 0) out.fill(q.min * q.scale + q.offset);
        else for (let k = 0; k < n; k++) out[k] = (readInt(buf, b0 + k * q.bits, q.bits) + q.min) * q.scale + q.offset;
        return out;
      };
      const C = {};
      for (const key of Object.keys(I)) if (I[key] >= 0) C[key] = col(I[key]);
      const batch = [];
      for (let k = 0; k < n; k++) {
        let x, y, z;
        if (s.cart) { x = C.x[k]; y = C.y[k]; z = C.z[k]; }
        else { const rr = C.r[k], ca = Math.cos(C.e[k]); x = rr * ca * Math.cos(C.a[k]); y = rr * ca * Math.sin(C.a[k]); z = rr * Math.sin(C.e[k]); }
        if (C.bad && C.bad[k] !== 0) continue;
        if (!(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z))) continue;
        if (R) { const X = R[0] * x + R[1] * y + R[2] * z + T[0], Y = R[3] * x + R[4] * y + R[5] * z + T[1], Z = R[6] * x + R[7] * y + R[8] * z + T[2]; x = X; y = Y; z = Z; } else { x += T[0]; y += T[1]; z += T[2]; }
        const p = { x, y, z, cls: 0 };
        if (colour && C.cr && C.cg && C.cb) {
          p.rgb = [0, 1, 2].map((q) => { const L = colLim(q), a = q === 0 ? C.cr : q === 1 ? C.cg : C.cb, sp = L[1] - L[0] || 1; return Math.max(0, Math.min(255, Math.round(((a[k] - L[0]) / sp) * 255))); });
        } else if (grey && C.i) p.inten = Math.max(0, Math.min(255, Math.round(((C.i[k] - iLim[0]) / (iLim[1] - iLim[0] || 1)) * 255)));
        batch.push(p);
      }
      for (let j = 0; j < nb; j++) { const used = boff[j] + n * size[j]; rest[j] = bufs[j].subarray(used >>> 3).slice(); boff[j] = used & 7; }
      left -= n; at += len;
      if (n === 0 && !batch.length && len === 0) fail('e57_bad', { why: 'no_progress' });
      yield batch;
    }
  }

  async function* all() { for (const s of usable) yield* scanRecords(s); }

  // pass 1: the bounds and the count of valid records (nothing is kept)
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  let count = 0, packets = 0, rgbSeen = false;
  for await (const b of all()) {
    for (const p of b) { count++; if (p.x < min[0]) min[0] = p.x; if (p.x > max[0]) max[0] = p.x; if (p.y < min[1]) min[1] = p.y; if (p.y > max[1]) max[1] = p.y; if (p.z < min[2]) min[2] = p.z; if (p.z > max[2]) max[2] = p.z; if (p.rgb) rgbSeen = true; }
    if ((++packets & 63) === 0) { throwIfAborted(signal); if (progress) progress(Math.min(0.99, count / listed)); await tick(); }
  }
  if (!count) fail('empty');
  const notes = [];
  if (usable.length > 1) notes.push({ code: 'scans', n: usable.length });
  if (count < listed) notes.push({ code: 'invalid', n: listed - count });
  if (c.imageCount) notes.push({ code: 'images', n: c.imageCount });
  return { name: file.name || '', count, min, max, rgb: colour && rgbSeen, intensity: grey, crs: c.crs || null, notes, points: () => all(), pictures: c.imageCount || 0 };
}
