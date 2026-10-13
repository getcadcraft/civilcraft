/* SPDX-License-Identifier: Apache-2.0 */
/**
 * las.js — LiDAR point clouds for CivilCraft: LAS 1.0–1.4 (read here) and LAZ (through laz-perf, vendored, loaded on
 * first use). No DOM. Files are untrusted: every size, count and offset is checked before it is used.
 *
 *   await readLasHeader(file) → header | throws Error (plain message)
 *     header = { version: '1.4', format (0–10), recordLength, count, offsetToPoints, scale [3], offset [3],
 *                min [3], max [3], vlrs [{ user, id, desc, offset, length }], evlrs […], compressed (LAZ),
 *                crs (state.crs shape | null), code, crsNote, zUnit ('m'|'ft'|'ftUS'|null), wkt, notes[],
 *                available (points the file really holds — less than count when it is cut short) }
 *   await scanPoints(file, header, onPoint(x, y, z, cls), { signal, progress(fraction), lazPerf }) → { read }
 *     every point in file order, in the file's coordinates (scale and offset applied). LAS is read in slices of
 *     ~2 MB (never the whole file); LAZ is copied once, compressed, into laz-perf's memory in slices and decoded point by
 *     point. Classification: formats 0–5 the low 5 bits of byte 15; formats 6–10 the whole byte 16 (LAS 1.4).
 *   className(c)                                        the ASPRS standard class name (0–18) | null
 *   lazPerf({ wasmBinary }) → Promise<module>           the laz-perf module (one per page)
 *
 * Coordinate system: the WKT VLR (LASF_Projection 2112; OGC WKT 1 or 2) through crs.js crsFromPrj, else the GeoKeys VLR
 * (34735 + 34736 doubles + 34737 text) through terrain.js crsFromGeoKeys. Vertical units from the GeoKeys or the WKT's
 * vertical axis when they say; otherwise the import dialog asks.
 */

import { crsFromGeoKeys, unitFromName, LIMITS } from './terrain.js';
import { crsFromPrj } from './crs.js';
import { t } from "./i18n.js";

// key per class, so every key is written out (t() is called where the name is shown, never at import time)
const CLASS_KEYS = {
  0: 'las.class.0', 1: 'las.class.1', 2: 'las.class.2', 3: 'las.class.3', 4: 'las.class.4', 5: 'las.class.5', 6: 'las.class.6',
  7: 'las.class.7', 8: 'las.class.8', 9: 'las.class.9', 10: 'las.class.10', 11: 'las.class.11', 12: 'las.class.12',
  13: 'las.class.13', 14: 'las.class.14', 15: 'las.class.15', 16: 'las.class.16', 17: 'las.class.17', 18: 'las.class.18',
};
/** The ASPRS standard class name (0–18) in the page's language, else null. */
export const className = (c) => (CLASS_KEYS[c] ? t(CLASS_KEYS[c]) : null);
const MIN_LEN = [20, 28, 26, 34, 57, 63, 30, 36, 38, 59, 67];

const ascii = (dv, o, n) => { let s = ''; for (let i = 0; i < n; i++) { const c = dv.getUint8(o + i); if (!c) break; s += c >= 32 && c < 127 ? String.fromCharCode(c) : ' '; } return s.trim(); };
const u64 = (dv, o) => { const lo = dv.getUint32(o, true), hi = dv.getUint32(o + 4, true); return hi * 4294967296 + lo; };
const bad = (key, fill) => new Error(t(key, fill));

export async function readLasHeader(file) {
  if (file.size > LIMITS.fileBytes) throw new Error(t('raster.too_big', { name: file.name, mb: (file.size / 1048576).toFixed(0), max: String(LIMITS.fileBytes / 1048576) }));
  if (file.size < 227) throw bad('las.bad.short');
  const hb = await file.slice(0, 375).arrayBuffer(), dv = new DataView(hb);
  if (ascii(dv, 0, 4) !== 'LASF') throw new Error(t('las.not_las'));
  const major = dv.getUint8(24), minor = dv.getUint8(25);
  if (major !== 1 || minor > 4) throw bad('las.bad.version', { version: major + '.' + minor });
  const headerSize = dv.getUint16(94, true), offsetToPoints = dv.getUint32(96, true), nVlr = dv.getUint32(100, true);
  const fmtByte = dv.getUint8(104), format = fmtByte & 0x3f, compressed = (fmtByte & 0xc0) !== 0;
  const recordLength = dv.getUint16(105, true);
  if (headerSize < 227 || headerSize > file.size) throw bad('las.bad.header_size');
  if (offsetToPoints < headerSize || offsetToPoints > file.size) throw bad('las.bad.offset');
  if (format > 10) throw bad('las.bad.format', { format });
  if (recordLength < MIN_LEN[format]) throw bad('las.bad.record_len', { len: recordLength, format });
  if (nVlr > 100000) throw bad('las.bad.vlr_count', { n: nVlr });
  let count = dv.getUint32(107, true);
  const scale = [dv.getFloat64(131, true), dv.getFloat64(139, true), dv.getFloat64(147, true)];
  const offset = [dv.getFloat64(155, true), dv.getFloat64(163, true), dv.getFloat64(171, true)];
  const max = [dv.getFloat64(179, true), dv.getFloat64(195, true), dv.getFloat64(211, true)];
  const min = [dv.getFloat64(187, true), dv.getFloat64(203, true), dv.getFloat64(219, true)];
  if (![...scale, ...offset].every(Number.isFinite) || scale.some((s) => s === 0 || Math.abs(s) > 1e6)) throw bad('las.bad.scale');
  let evlrStart = 0, nEvlr = 0;
  if (minor >= 4 && headerSize >= 375) {
    evlrStart = u64(dv, 235); nEvlr = dv.getUint32(243, true);
    const c64 = u64(dv, 247);
    if (c64 > 0) count = c64;
  }
  const notes = [];
  // VLRs (54-byte headers)
  const vlrs = [];
  let o = headerSize;
  const vb = new DataView(await file.slice(headerSize, offsetToPoints).arrayBuffer());
  for (let i = 0; i < nVlr; i++) {
    const r = o - headerSize;
    if (r + 54 > vb.byteLength) { notes.push(t('las.vlr.past', { n: nVlr - i })); break; }
    const len = vb.getUint16(r + 20, true);
    if (r + 54 + len > vb.byteLength) { notes.push(t('las.vlr.one_past')); break; }
    vlrs.push({ user: ascii(vb, r + 2, 16), id: vb.getUint16(r + 18, true), desc: ascii(vb, r + 22, 32), offset: o + 54, length: len, ext: false });
    o += 54 + len;
  }
  const evlrs = [];
  if (nEvlr && evlrStart) {
    if (nEvlr > 100000 || evlrStart < offsetToPoints || evlrStart > file.size) notes.push(t('las.evlr.outside'));
    else {
      let e = evlrStart;
      for (let i = 0; i < nEvlr && e + 60 <= file.size; i++) {
        const eb = new DataView(await file.slice(e, e + 60).arrayBuffer());
        const len = u64(eb, 20);
        if (e + 60 + len > file.size) { notes.push(t('las.evlr.past')); break; }
        evlrs.push({ user: ascii(eb, 2, 16), id: eb.getUint16(18, true), desc: ascii(eb, 22, 32), offset: e + 60, length: len, ext: true });
        e += 60 + len;
      }
    }
  }
  // points the file really holds
  const end = evlrStart && evlrStart > offsetToPoints && evlrStart <= file.size ? evlrStart : file.size;
  let available = count;
  if (!compressed) {
    available = Math.floor((end - offsetToPoints) / recordLength);
    if (available < count) notes.push(t('las.short', { available: available.toLocaleString('en-US'), count: count.toLocaleString('en-US') }));
    else available = count;
  } else if (!vlrs.some((v) => v.user === 'laszip encoded' && v.id === 22204)) throw bad('las.bad.no_laszip');   // i18n-ignore: LASzip VLR user id (file format)
  const h = { name: file.name, size: file.size, version: major + '.' + minor, format, recordLength, count, available, offsetToPoints, headerSize, scale, offset, min, max, vlrs, evlrs, compressed, notes, crs: null, code: null, crsNote: null, zUnit: null, wkt: null };
  await lasCrs(file, h);
  return h;
}

async function vlrBytes(file, v, max = 1e6) {
  if (v.length > max) return null;
  return new Uint8Array(await file.slice(v.offset, v.offset + v.length).arrayBuffer());
}

async function lasCrs(file, h) {
  const all = [...h.vlrs, ...h.evlrs].filter((v) => v.user === 'LASF_Projection');
  const wktV = all.find((v) => v.id === 2112);
  if (wktV) {
    const b = await vlrBytes(file, wktV, 100000);
    const text = b ? new TextDecoder().decode(b).replace(/\u0000+$/, '').trim() : '';
    h.wkt = text || null;
    if (text) {
      try {
        const r = crsFromPrj(text);
        h.crs = r.crs; h.code = r.matched?.code ?? null; h.crsNote = r.notes.join(' ') || null;
      } catch (e) { h.crsNote = e?.message ? t('las.crs.bad_why', { reason: e.message }) : t('las.crs.bad'); }
      const vu = text.match(/VERT_?CS\[[\s\S]*?UNIT\["([^"]+)"/i) || text.match(/VERTCRS\[[\s\S]*?LENGTHUNIT\["([^"]+)"/i);
      if (vu) h.zUnit = unitFromName(vu[1]);
      if (h.crs) return;
    }
  }
  const keyV = all.find((v) => v.id === 34735);
  if (keyV) {
    const kb = await vlrBytes(file, keyV, 65536);
    if (kb && kb.length >= 8) {
      const kd = new DataView(kb.buffer, kb.byteOffset, kb.byteLength);
      const n = kd.getUint16(6, true), keys = {};
      const dblV = all.find((v) => v.id === 34736), dbl = dblV ? await vlrBytes(file, dblV, 65536) : null;
      for (let i = 0; i < n && 8 + 8 * i + 8 <= kb.length; i++) {
        const id = kd.getUint16(8 + 8 * i, true), loc = kd.getUint16(10 + 8 * i, true), val = kd.getUint16(14 + 8 * i, true);
        if (loc === 0) keys[id] = val;
        else if (loc === 34736 && dbl && (val + 1) * 8 <= dbl.length) keys[id] = new DataView(dbl.buffer, dbl.byteOffset).getFloat64(val * 8, true);
      }
      const g = crsFromGeoKeys(keys);
      h.crs = g.crs; h.code = g.code; h.crsNote = g.note; h.zUnit = h.zUnit || g.zUnit;
      return;
    }
  }
  if (!h.crs && !h.crsNote) h.crsNote = t('las.crs.none');
}

// ---------------------------------------------------------------- points
const aborted = (signal) => { if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' }); };
const tick = () => new Promise((r) => setTimeout(r, 0));

export async function scanPoints(file, h, onPoint, { signal = null, progress = null, lazPerf: lp = null } = {}) {
  return h.compressed ? scanLaz(file, h, onPoint, signal, progress, lp) : scanLas(file, h, onPoint, signal, progress);
}

function decoder(h) {
  const [sx, sy, sz] = h.scale, [ox, oy, oz] = h.offset, ext = h.format >= 6;
  return (dv, o, onPoint) => {
    const x = dv.getInt32(o, true) * sx + ox, y = dv.getInt32(o + 4, true) * sy + oy, z = dv.getInt32(o + 8, true) * sz + oz;
    const cls = ext ? dv.getUint8(o + 16) : dv.getUint8(o + 15) & 31;
    onPoint(x, y, z, cls);
  };
}

async function scanLas(file, h, onPoint, signal, progress) {
  const L = h.recordLength, per = Math.max(1, Math.floor(2 * 1048576 / L)), dec = decoder(h);
  let read = 0;
  for (let i = 0; i < h.available; i += per) {
    aborted(signal);
    const n = Math.min(per, h.available - i), start = h.offsetToPoints + i * L;
    const dv = new DataView(await file.slice(start, start + n * L).arrayBuffer());
    if (dv.byteLength < n * L) break;
    for (let k = 0; k < n; k++) dec(dv, k * L, onPoint);
    read += n;
    if (progress) { progress(read / h.available); await tick(); }
  }
  return { read };
}

let LP = null;
export function lazPerf(opts = {}) {
  return (LP ||= import('laz-perf').then((m) => m.default(opts)).catch((e) => { LP = null; throw new Error(t('las.laz.load', { reason: e.message })); }));
}

async function scanLaz(file, h, onPoint, signal, progress, lp) {
  const M = await (lp || lazPerf());
  const size = file.size;
  const ptr = M._malloc(size);
  if (!ptr) throw new Error(t('las.laz.memory'));
  let laz = null, buf = 0, read = 0;
  try {
    for (let off = 0; off < size; off += 8 * 1048576) {
      aborted(signal);
      const b = new Uint8Array(await file.slice(off, Math.min(size, off + 8 * 1048576)).arrayBuffer());
      M.HEAPU8.set(b, ptr + off);
      if (progress) progress(0.05 * off / size);
    }
    laz = new M.LASZip();
    try { laz.open(ptr, size); } catch { throw bad('las.bad.laz_open'); }
    const n = Math.min(laz.getCount(), h.count), L = laz.getPointLength();
    if (L < MIN_LEN[h.format]) throw bad('las.bad.laz_len');
    buf = M._malloc(L);
    const dec = decoder(h);
    let heap = M.HEAPU8.buffer, dv = new DataView(heap, buf, L);
    for (let i = 0; i < n; i++) {
      try { laz.getPoint(buf); } catch { h.notes.push(t('las.laz.stopped', { read: i.toLocaleString('en-US'), n: n.toLocaleString('en-US') })); break; }
      if (M.HEAPU8.buffer !== heap) { heap = M.HEAPU8.buffer; dv = new DataView(heap, buf, L); }
      dec(dv, 0, onPoint);
      read++;
      if ((i & 32767) === 32767) { aborted(signal); if (progress) progress(0.05 + 0.95 * i / n); await tick(); }
    }
  } finally {
    if (laz) laz.delete();
    if (buf) M._free(buf);
    M._free(ptr);
  }
  aborted(signal);
  return { read };
}
