/* SPDX-License-Identifier: Apache-2.0 */
/**
 * export.js — the cleaned, classified cloud as LAS 1.4 (point format 6 or 7), PC.9, or as LAZ (point format 0 or 2 in a LAS 1.4
 * header, compressed by our own laz.js), PC.14. The source is never rewritten.
 *
 *   await exportLas(cloud, target, { classes, region, version:'1.4', format, laz:false, chunkSize, withEdits:true, key, signal, progress })
 *       → { written, points, bytes, bounds:{min,max}, classCounts, key?, laz, format, lasBytes? }
 *   await exportLaz(cloud, target, opts)  = exportLas(cloud, target, { ...opts, laz: true })
 *     target  a store (has put/openWrite: written under `key`, default 'export/<cloudId>.las' or '.laz'), or a stream
 *             { write(bytes), writeAt?(position, bytes), close?() }.
 *     classes keep only these classes (default all); region keeps only points inside it; withEdits (default true) applies the edit
 *     log (deleted points are left out, classes are the edited ones), false writes the cloud as tiled.
 *     Two passes over the nodes: counts, bounds and class counts first (the header comes first in the file), then the points.
 *     Positions are the tiler's integers (scale = cloud.scale, offset = cloud.origin), so they round-trip exactly.
 *     LAS: format 7 adds RGB (16 bit). LAZ: format 0, or 2 with RGB (16 bit); classes above 31 do not fit those formats (code
 *     laz_class_range). LAZ needs the chunk table's position written at the start of the point data once the points are written
 *     (LAZ specification 1.4 R1 clause 11.5): a target with writeAt gets it there; any other target is gathered in memory and
 *     written once at the end. `lasBytes` is the size the same points take as an uncompressed LAS 1.4 file of the same format.
 *     The cloud's WKT, when it has one, goes in the LASF_Projection VLR (2112).
 */
import { fail, throwIfAborted, reporter, textBytes } from './util.js';
import { compileRegion, regionNeedsGround } from './select.js';
import { LazChunkWriter, lazVlrPayload, LAZ_VLR } from './laz.js';

const FORMAT_LEN = { 6: 30, 7: 36 };
const LAZ_FORMAT_LEN = { 0: 20, 2: 26 };

/** The LAS 1.4 public header (375 bytes) and VLRs. `vlrs` = [{ user, id, desc, data, reserved }]. */
export function header14({ format, recordLength, count, scale, offset, min, max, wkt, vlrs = [] }) {
  const all = [];
  if (wkt) all.push({ user: 'LASF_Projection', id: 2112, desc: 'OGC WKT', data: textBytes(wkt + '\0') });   // i18n-ignore: LAS record names
  all.push(...vlrs);
  const headerSize = 375, vlrLen = all.reduce((s, v) => s + 54 + v.data.length, 0), off = headerSize + vlrLen;
  const hb = new Uint8Array(off), dv = new DataView(hb.buffer);
  hb.set([0x4c, 0x41, 0x53, 0x46], 0);                       // LASF
  dv.setUint16(6, wkt ? 16 : 0, true);                       // global encoding: bit 4 = WKT
  hb[24] = 1; hb[25] = 4;
  hb.set(textBytes('CadCraft point clouds'), 26);            // system identifier (32)   i18n-ignore: file metadata
  hb.set(textBytes('CadCraft pointcloud 1'), 58);            // generating software (32)   i18n-ignore: file metadata
  const now = new Date();
  dv.setUint16(90, Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86400000) + 1, true); dv.setUint16(92, now.getUTCFullYear(), true);
  dv.setUint16(94, headerSize, true); dv.setUint32(96, off, true); dv.setUint32(100, all.length, true);
  hb[104] = format; dv.setUint16(105, recordLength, true);
  const base = format & 0x3f, legacy = base < 6 && count <= 0xFFFFFFFF;
  dv.setUint32(107, legacy ? count : 0, true);               // legacy count: formats 0-5 only (LAS 1.4)
  if (legacy) dv.setUint32(111, count, true);                // legacy points by return: every point is return 1 of 1
  [...scale, ...offset].forEach((v, i) => dv.setFloat64(131 + 8 * i, v, true));
  [max[0], min[0], max[1], min[1], max[2], min[2]].forEach((v, i) => dv.setFloat64(179 + 8 * i, v, true));
  dv.setBigUint64(235, 0n, true); dv.setUint32(243, 0, true);   // no EVLRs
  dv.setBigUint64(247, BigInt(count), true); dv.setBigUint64(255, BigInt(count), true);   // number of points; by return 1
  let o = headerSize;
  for (const v of all) {
    dv.setUint16(o, v.reserved || 0, true); hb.set(textBytes(v.user), o + 2); dv.setUint16(o + 18, v.id, true);
    dv.setUint16(o + 20, v.data.length, true); hb.set(textBytes(v.desc), o + 22); hb.set(v.data, o + 54);
    o += 54 + v.data.length;
  }
  return hb;
}

export async function exportLas(cloud, target, opts = {}) {
  const { version = '1.4', withEdits = true, signal = null, laz = false } = opts, rep = reporter(opts.progress);
  if (version !== '1.4') fail('bad_version', { version });
  const rgbCloud = !!(cloud.meta.attrs && cloud.meta.attrs.rgb);
  const format = opts.format ?? (laz ? (rgbCloud ? 2 : 0) : (rgbCloud ? 7 : 6));
  const LENS = laz ? LAZ_FORMAT_LEN : FORMAT_LEN;
  if (!LENS[format]) fail('bad_format', { format, laz });
  const L = LENS[format], classes = opts.classes ? new Set(opts.classes) : null;
  const ground = opts.region && regionNeedsGround(opts.region) ? await cloud.ground() : null;
  const rc = opts.region ? compileRegion(opts.region, { ground }) : null;
  const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
  const nodes = cloud.nodesIn(rc && rc.bbox);
  const keep = (r, k) => {
    if (r.del[k]) return false;
    if (classes && !classes.has(r.cls[k])) return false;
    return !rc || rc.test(ox + r.x[k] * sx, oy + r.y[k] * sy, oz + r.z[k] * sz, r.cls[k]);
  };
  // pass 1
  let count = 0, maxCls = 0; const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity], cc = {};
  for (let q = 0; q < nodes.length; q++) {
    throwIfAborted(signal);
    const r = await cloud.readRaw(nodes[q], { applyEdits: withEdits });
    for (let k = 0; k < r.n; k++) {
      if (!keep(r, k)) continue;
      count++;
      const x = r.x[k], y = r.y[k], z = r.z[k];
      if (x < mn[0]) mn[0] = x; if (x > mx[0]) mx[0] = x; if (y < mn[1]) mn[1] = y; if (y > mx[1]) mx[1] = y; if (z < mn[2]) mn[2] = z; if (z > mx[2]) mx[2] = z;
      cc[r.cls[k]] = (cc[r.cls[k]] || 0) + 1;
      if (r.cls[k] > maxCls) maxCls = r.cls[k];
    }
    if ((q & 15) === 15) rep(0.4 * q / nodes.length, 'export');
  }
  if (laz && maxCls > 31) fail('laz_class_range', { max: maxCls });   // formats 0-5 keep the class in 5 bits
  if (!count) { mn.fill(0); mx.fill(0); }
  const absMin = [ox + mn[0] * sx, oy + mn[1] * sy, oz + mn[2] * sz], absMax = [ox + mx[0] * sx, oy + mx[1] * sy, oz + mx[2] * sz];
  const chunkSize = opts.chunkSize || 50000;
  const hb = header14({
    format: laz ? format | 128 : format, recordLength: L, count, scale: [sx, sy, sz], offset: [ox, oy, oz], min: absMin, max: absMax, wkt: cloud.meta.wkt || null,
    vlrs: laz ? [{ user: LAZ_VLR.user, id: LAZ_VLR.recordId, desc: 'CadCraft LAZ', data: lazVlrPayload(format, L, { chunkSize }) }] : [],   // i18n-ignore: file metadata
  });
  // sink
  let write, writeAt = null, close;
  if (target && typeof target.put === 'function') {
    const key = opts.key || 'export/' + cloud.id + (laz ? '.laz' : '.las');
    opts = { ...opts, key };
    if (typeof target.openWrite === 'function') { const w = target.openWrite(key); write = (b) => w.write(b); if (w.writeAt) writeAt = (p, b) => w.writeAt(p, b); close = () => w.close(); }
    else { const parts = []; write = async (b) => { parts.push(new Uint8Array(b)); }; close = async () => { await target.put(key, joinParts(parts)); }; }
  } else if (target && typeof target.write === 'function') {
    write = (b) => target.write(b); if (typeof target.writeAt === 'function') writeAt = (p, b) => target.writeAt(p, b);
    close = () => (target.close ? target.close() : undefined);
  } else fail('bad_target');
  // LAZ without writeAt: gather here, patch the chunk table position, write once
  let held = null;
  if (laz && !writeAt) {
    held = []; const realWrite = write, realClose = close;
    write = async (b) => { held.push(new Uint8Array(b)); };
    writeAt = async (p, b) => { patchParts(held, p, b); };
    close = async () => { await realWrite(joinParts(held)); held = null; if (realClose) await realClose(); };
  }
  await write(hb);
  let written = 0, bytes = hb.length;
  const hasRgb = rgbCloud && (format === 7 || format === 2);
  const lw = laz ? new LazChunkWriter(format, L, { chunkSize }) : null;
  if (laz) { await write(new Uint8Array(8)); bytes += 8; }   // chunk table start position, filled in at the end (clause 11.5)
  for (let q = 0; q < nodes.length; q++) {
    throwIfAborted(signal);
    const r = await cloud.readRaw(nodes[q], { applyEdits: withEdits });
    let m = 0; for (let k = 0; k < r.n; k++) if (keep(r, k)) m++;
    if (!m) continue;
    const buf = new Uint8Array(m * L), d = new DataView(buf.buffer);
    let o = 0;
    for (let k = 0; k < r.n; k++) {
      if (!keep(r, k)) continue;
      d.setInt32(o, r.x[k], true); d.setInt32(o + 4, r.y[k], true); d.setInt32(o + 8, r.z[k], true);
      d.setUint16(o + 12, r.inten ? r.inten[k] : 0, true);
      if (laz) {
        buf[o + 14] = 0x09;                                  // return 1 of 1 (bits 0-2, 3-5)
        buf[o + 15] = r.cls[k];                              // classes 0-31, no flags
        if (hasRgb) { d.setUint16(o + 20, r.rgb[3 * k] * 257, true); d.setUint16(o + 22, r.rgb[3 * k + 1] * 257, true); d.setUint16(o + 24, r.rgb[3 * k + 2] * 257, true); }
      } else {
        buf[o + 14] = 0x11;                                  // return 1 of 1
        buf[o + 16] = r.cls[k];
        if (format === 7 && hasRgb) { d.setUint16(o + 30, r.rgb[3 * k] * 257, true); d.setUint16(o + 32, r.rgb[3 * k + 1] * 257, true); d.setUint16(o + 34, r.rgb[3 * k + 2] * 257, true); }
      }
      o += L; written++;
    }
    if (lw) { for (const c of lw.add(buf, m)) { await write(c); bytes += c.length; } }
    else { await write(buf); bytes += buf.length; }
    if ((q & 15) === 15) rep(0.4 + 0.6 * q / nodes.length, 'export');
  }
  if (lw) {
    for (const c of lw.finish()) { await write(c); bytes += c.length; }
    const tablePos = bytes, table = lw.chunkTable();
    await write(table); bytes += table.length;
    const p = new Uint8Array(8); new DataView(p.buffer).setBigInt64(0, BigInt(tablePos), true);
    await writeAt(hb.length, p);
  }
  if (close) await close();
  if (written !== count) fail('export_mismatch', { written, count });
  rep(1, 'export');
  const out = { written, points: count, bytes, bounds: { min: absMin, max: absMax }, classCounts: cc, key: opts.key, laz, format };
  if (laz) out.lasBytes = hb.length - 54 - lazVlrPayload(format, L, { chunkSize }).length + count * L;
  return out;
}

export const exportLaz = (cloud, target, opts = {}) => exportLas(cloud, target, { ...opts, laz: true });

function joinParts(parts) {
  const n = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(n);
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}
function patchParts(parts, pos, bytes) {
  let o = 0;
  for (const p of parts) {
    for (let i = 0; i < bytes.length; i++) { const at = pos + i - o; if (at >= 0 && at < p.length) p[at] = bytes[i]; }
    o += p.length;
    if (o >= pos + bytes.length) break;
  }
}
