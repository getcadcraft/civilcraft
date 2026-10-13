/* SPDX-License-Identifier: Apache-2.0 */
/**
 * passthrough.js — raw passthrough of objects and entities cc-dwg does not decode (custom classes such as AEC
 * objects, parametric-constraint and associativity objects, ACAD_PROXY_ENTITY / ACAD_PROXY_OBJECT). cc-dwg,
 * Apache-2.0. Written from the ODA "Open Design Specification for .dwg files" v5.4.1: 2.13 (handle references:
 * codes 2–5 absolute, 6/8/A/C relative and "always a soft pointer"), 20.1 (common object format, the R2007+
 * string stream at the end of the data, the R2010+ handle-stream size), 20.2/20.4.1/20.4.2 (common entity data:
 * proxy graphics), 20.4.90 (PROXY: class id BL first), ch. 10 (classes).
 *
 * Reading (read.js calls `captureRaw(rec)` for each object it keeps raw): the object's own data bits after its
 * common part — up to the end of its data, so from R2007 the string stream and its trailer are inside — the
 * handle references after the common handles (code + absolute handle) and, for entities, the proxy graphics:
 *   raw = { ver, n (bits), data (base64), h: [[code, 'HEX'], …], gfx?: base64 }
 * Writing (`encodeRaw(rec, ctx)`, called through the record's `encode`): the common part is written again for the
 * target file (new handle, EED, reactors, xdictionary, owner; for entities layer/linetype/colour/…) and the data
 * bits are copied verbatim; every handle reference is mapped to the written file's handle (`rec.map(hex)` → number,
 * 0 when the target was not written). Relative references become absolute soft pointers (code 4).
 * Raw data is only meaningful in the version it was read from: `rawUsable(raw, version)` says so; converting to
 * another version the caller drops the object with a note.
 *
 * Spec gap: an object's handle stream may end with padding that parses as handle bytes (code 0, no value bytes:
 * "0x00"); such references are written back as they came (a null reference), which keeps the stream identical —
 * found by round-tripping AutoCAD and ODA files with this module and comparing the bits.
 */
import { BitReader } from './bits-read.js';
import { ByteWriter, umcBytes } from './bits-write.js';
import { crc8 } from './crc.js';
import { b64, unb64, sliceBits } from './bits-util.js';
import { VERSION_NUM } from './header-vars.js';
import { ObjWriter, CLASSED, begin, objectCommon, SOFT_PTR, HARD_OWN } from './objects-write.js';

// ---------------------------------------------------------------- base64 (Node and browsers)
export { b64, unb64, sliceBits };   // bits-util.js (shared with surface-read.js)
const hexOf = (n) => n.toString(16).toUpperCase();


// ---------------------------------------------------------------- reading
/**
 * The raw parts of a decoded record (objects-read.js leaves _dataStart, _endbit, _hPos, _objEnd, _buf and, for
 * entities with proxy graphics, _gfxPos/_graphics). Returns undefined when the record cannot be framed.
 */
export function captureRaw(rec, ver) {
  if (!rec || !rec._buf || rec._dataStart === undefined || rec._endbit === undefined) return undefined;
  const buf = rec._buf;
  if (rec._endbit < rec._dataStart) return undefined;
  const raw = { ver, n: rec._endbit - rec._dataStart, data: b64(sliceBits(buf, rec._dataStart, rec._endbit)), h: [] };
  const hr = new BitReader(buf, { version: ver, startBit: rec._hPos, endBit: rec._objEnd });
  while (hr.end - hr.pos >= 8 && raw.h.length < 1e6) {
    try { const v = hr.H(rec.handle); raw.h.push([hr.hcode, hexOf(Math.max(0, v))]); } catch { break; }
  }
  if (rec._gfxPos !== undefined && rec._graphics > 0) raw.gfx = b64(sliceBits(buf, rec._gfxPos, rec._gfxPos + rec._graphics * 8));
  if (rec._ds) raw.ds = 1;
  return raw;
}
/**
 * Versions whose data of a class is bit for bit the same (after the common part; strings in the same form), so the
 * raw copy also serves the others of its group. Spec gap: classes the spec does not describe; found by comparing
 * every object of these classes across the corpus (the same drawings saved by the ODA File Converter in all six
 * versions: identical data bits, string streams and handle codes within each group, different across groups).
 */
const RAW_GROUPS = (() => {
  const two = [[15, 18], [21, 24, 27, 32]];
  return { MATERIAL: two, DIMASSOC: two, ACDB_ALDIMOBJECTCONTEXTDATA_CLASS: two, ACDB_MTEXTOBJECTCONTEXTDATA_CLASS: two,
    RAPIDRTRENDERSETTINGS: two, SUN: [[21, 24, 27, 32]], VISUALSTYLE: [[27, 32]], ACDB_MLEADEROBJECTCONTEXTDATA_CLASS: [[24, 27, 32]],
    ACDBDETAILVIEWSTYLE: [[21, 24, 27]], ACDBSECTIONVIEWSTYLE: [[21, 24, 27]] };
})();
export const rawUsable = (raw, version, type) => {
  if (!raw) return false;
  const v = VERSION_NUM[version];
  if (raw.ver === v) return true;
  const g = type && RAW_GROUPS[type];
  return !!g && g.some((grp) => grp.includes(raw.ver) && grp.includes(v));
};

// ---------------------------------------------------------------- writing
/** Copy n bits of u8 (from bit 0) into the writer. */
export function appendBits(w, u8, n) {
  let i = 0;
  for (; i + 8 <= n; i += 8) w.RC(u8[i >> 3]);
  for (; i < n; i++) w.B((u8[i >> 3] >> (7 - (i & 7))) & 1);
}
/** Frame an object whose data (incl. R2007+ string stream and trailer) is complete at `endbit` (20.1). */
export function frameObject(w, endbit) {
  if (!w.r2010) w.patchRL(w.sizeAt, endbit);
  w.append(w.hnd);
  const data = w.bytes();
  const out = new ByteWriter(data.length + 8);
  out.MS(data.length);
  if (w.r2010) out.raw(umcBytes(data.length * 8 - endbit));
  out.raw(data);
  const all = out.bytes();
  const crc = crc8(0xC0C1, all);
  const res = new Uint8Array(all.length + 2);
  res.set(all); res[all.length] = crc & 0xFF; res[all.length + 1] = crc >> 8;
  return res;
}
/** Type number of a raw record in the written file: its class (registered from the source class) or the fixed type. */
export function rawType(rec, ctx) {
  if (rec.typeNum < 500) return rec.typeNum;
  const k = 'RAW:' + rec.cls.dxf;
  if (!CLASSED[k]) CLASSED[k] = { dxf: rec.cls.dxf, cpp: rec.cls.cpp, app: rec.cls.app, entity: !!rec.cls.entity, proxy: rec.cls.proxy | 0 };
  return ctx.classNum(k);
}
/** Map one source handle reference. */
function mapRef(rec, code, hex) {
  if (!hex || hex === '0') return [code, 0];
  const v = rec.map(hex) || 0;
  return [code >= 6 ? SOFT_PTR : code, v];
}

/**
 * Encode a raw record: { t, h, typeNum, cls?, raw, isEntity, owner, reactors, xdic, eed, map(hex) → handle,
 * proxyClass?: (classId) → class key | null, … entity common fields as write.js builds them }.
 */
export function encodeRaw(rec, ctx) {
  if (rec.conv) return encodeConverted(rec, ctx);
  const raw = rec.raw;
  const w = new ObjWriter(ctx.version);
  begin(w, rawType(rec, ctx), rec);
  if (rec.isEntity) rawEntityCommon(w, rec, raw);
  else objectCommon(w, rec);
  let bits = unb64(raw.data), n = raw.n;
  // 20.4.90: a proxy's data starts with its class id (BL); classes are renumbered in the written file
  if ((rec.typeNum === 0x1F2 || rec.typeNum === 0x1F3) && rec.proxyClass && VERSION_NUM[ctx.version] >= 15) {
    const r = new BitReader(bits, { version: VERSION_NUM[ctx.version], startBit: 0, endBit: n });
    const id = r.BL();
    const key = rec.proxyClass(id);
    if (key) {
      const t = new ObjWriter(ctx.version);
      t.BL(ctx.classNum(key));
      appendBits(t, sliceBits(bits, r.pos, n), n - r.pos);
      bits = t.buf; n = t.bit;
    }
  }
  appendBits(w, bits, n);
  const endbit = w.bit;
  for (const [code, hex] of raw.h) { const [c, v] = mapRef(rec, code, hex); w.hnd.H(c, v); }
  return frameObject(w, endbit);
}

/** 20.4.1/20.4.2 common entity data with the source's proxy graphics (objects-write.js entityCommon writes none). */
export function rawEntityCommon(w, r, raw) {
  const g = raw && raw.gfx ? unb64(raw.gfx) : null;
  if (g && g.length) {
    w.B(1);
    if (w.r2010) w.BLL(g.length); else w.RL(g.length);
    for (const b of g) w.RC(b);
  } else w.B(0);
  w.BB(r.mode ?? 2);
  w.BL((r.reactors || []).length);
  if (w.r2004) w.B(r.xdic ? 0 : 1);
  if (w.r2013) w.B(0);
  if (!w.r2004) w.B(r.prev === undefined ? 1 : 0);
  w.ENC(r.color, w.r2004 ? r.transparency : undefined);
  w.BD(r.ltscale ?? 1);
  w.BB(r.ltype?.flag ?? 0);
  w.BB(r.plotstyle?.flag ?? 0);
  if (w.r2007) { w.BB(r.material?.flag ?? 0); w.RC(r.shadow ?? 0); }
  if (w.r2010) { w.B(0); w.B(0); w.B(0); }
  w.BS(r.invisible ? 1 : 0);
  w.RC(r.lw ?? 29);
  if ((r.mode ?? 2) === 0) w.H(SOFT_PTR, r.owner);
  for (const x of r.reactors || []) w.H(SOFT_PTR, x);
  if (!w.r2004 || r.xdic) w.H(HARD_OWN, r.xdic || 0);
  if (!w.r2004 && r.prev !== undefined) { w.H(SOFT_PTR, r.prev || 0); w.H(SOFT_PTR, r.next || 0); }
  w.H(5, r.layer);
  if ((r.ltype?.flag ?? 0) === 3) w.H(5, r.ltype.h);
  if (w.r2007 && (r.material?.flag ?? 0) === 3) w.H(5, r.material.h);
  if ((r.plotstyle?.flag ?? 0) === 3) w.H(5, r.plotstyle.h);
}

// ---------------------------------------------------------------- another version: proxies (20.4.90)
/**
 * Objects and entities of classes cc-dwg does not decode can move to another version the way AutoCAD-family
 * programs save them down: as ACAD_PROXY_OBJECT / ACAD_PROXY_ENTITY carrying the class's own data. The data
 * itself is always in the R2007+ form (data bits, then the strings as a string stream: TU strings, their size in
 * bits as RS (two RS when ≥ 0x8000), a 1 bit; or a single 0 bit when there are none).
 * Spec gap: 20.4.90 gives the proxy header but not how the data is laid out per version. Found by comparing, bit
 * for bit, the ODA File Converter's proxies of the constraint/associativity classes in the corpus (civil example:
 * 120 objects saved from R2010 to R2000, 2004, 2007, 2013 and 2018) with the same objects stored natively in R2010:
 *   R2000          class id BL, data format BL, original format B, then the data with its strings inline (the
 *                  string stream and its trailer right after the data bits)
 *   R2004          class id BL, "cn:" + C++ class name as T (BS length, no NUL), data format BL, original format B,
 *                  then the data as for R2000
 *   R2007–R2013    class id BL, data format BL, original format B, the data bits; the object's own string stream
 *                  holds "cn:" + C++ class name, then the class's strings
 *   R2018          as R2007 with data format = version BL + maintenance BL
 * Data format = maintenance << 16 | the AcDb version number of the version the data was written for
 * (R2007 27, R2010 29, R2013 31, R2018 33; maintenance = the source file's). A proxy whose data format is the
 * target version's is written back as the native object (as the converter does).
 */
const DHL = { AC1015: 23, AC1018: 25, AC1021: 27, AC1024: 29, AC1027: 31, AC1032: 33 };
const DHL_VER = { 23: 15, 25: 18, 27: 21, 29: 24, 31: 27, 33: 32 };

function stringsOf(buf, n) {
  // the R2007-form tail of a blob: {dataBits, strings[]} (strings decoded from the stream, data = before it)
  const t = new BitReader(buf, { startBit: n - 1, endBit: n });
  if (!t.B()) return { nd: n - 1, strings: [] };
  let p = n - 1 - 16;
  t.pos = p; t.end = p + 16;
  let size = t.RSu();
  if (size & 0x8000) { p -= 16; t.pos = p; t.end = p + 16; const hi = t.RSu(); size = (size & 0x7FFF) | (hi << 15); }
  const start = p - size;
  if (start < 0) return null;
  const s = new BitReader(buf, { version: 32, startBit: start, endBit: p });   // 32: strings as stored (no \U+ decoding)
  const strings = [];
  while (s.end - s.pos >= 2) strings.push(s.TU());   // an empty string is a 2-bit BS 0
  return { nd: start, strings };
}

/**
 * The class data of a raw object or entity in the version-free R2007 form, or null when it cannot be had
 * (an undecoded class stored natively in an R2000/R2004 file keeps its strings as 8-bit text in place).
 *   → { bits, nd (data bits), strings, fmt: { ver (AcDb number), maint }, classId? }
 */
export function classData(raw, isProxy, srcVersion, srcMaint) {
  const buf = unb64(raw.data), n = raw.n, v = raw.ver;
  try {
    if (!isProxy) {
      if (v < 21) return null;
      const t = stringsOf(buf, n);
      if (!t) return null;
      return { bits: buf, nd: t.nd, strings: t.strings, fmt: { ver: DHL[srcVersion], maint: srcMaint } };
    }
    const r = new BitReader(buf, { version: v, startBit: 0, endBit: n });
    const classId = r.BL();
    let fmt;
    if (v === 18) { r.T(); const f = r.BL(); fmt = { ver: f & 0xFFFF, maint: f >>> 16 }; }
    else if (v >= 32) { const ver = r.BL(); fmt = { ver, maint: r.BL() }; }
    else { const f = r.BL(); fmt = { ver: f & 0xFFFF, maint: f >>> 16 }; }
    r.B();
    const body = sliceBits(buf, r.pos, n), nb = n - r.pos;
    const t = stringsOf(body, nb);
    if (!t) return null;
    let strings = t.strings;
    if (v >= 21 && strings.length && /^cn:/.test(strings[0])) strings = strings.slice(1);
    return { bits: body, nd: t.nd, strings, fmt, classId };
  } catch { return null; }
}

/** The bits of a string stream in its R2007 form: TU strings, size, 1 (or a 0 bit for none). */
function writeStrings(w, strings) {
  if (!strings.length) { w.B(0); return; }
  const t = new ObjWriter('AC1021');
  for (const s of strings) t.TU(s);
  appendBits(w, t.buf, t.bit);
  const n = t.bit;
  if (n < 0x8000) w.RS(n); else { w.RS(n >>> 15); w.RS((n & 0x7FFF) | 0x8000); }
  w.B(1);
}

/**
 * Plan writing raw class data into `version`: { mode: 'native'|'proxy', data } or null (left out).
 * `cls` = the source class { dxf, cpp, app, entity, proxy }.
 */
export function convertPlan(raw, isProxy, clsFor, srcVersion, srcMaint, version) {
  if (!raw) return null;
  const data = classData(raw, isProxy, srcVersion, srcMaint);
  if (!data || !data.fmt.ver || !DHL_VER[data.fmt.ver]) return null;
  const cls = clsFor(data.classId);
  if (!cls) return null;
  if (data.fmt.ver === DHL[version] && VERSION_NUM[version] >= 21) return { mode: 'native', data, cls };
  return { mode: 'proxy', data, cls };
}

function encodeConverted(rec, ctx) {
  const { mode, data } = rec.conv, v = VERSION_NUM[ctx.version];
  const w = new ObjWriter(ctx.version);
  const key = 'RAW:' + rec.cls.dxf;
  if (!CLASSED[key]) CLASSED[key] = { dxf: rec.cls.dxf, cpp: rec.cls.cpp, app: rec.cls.app, entity: !!rec.cls.entity, proxy: rec.cls.proxy | 0 };
  const cnum = ctx.classNum(key);
  begin(w, mode === 'native' ? cnum : rec.isEntity ? 0x1F2 : 0x1F3, rec);
  if (rec.isEntity) rawEntityCommon(w, rec, rec.raw);
  else objectCommon(w, rec);
  const strings = data.strings;
  if (mode === 'native') {
    appendBits(w, data.bits, data.nd);
    for (const s of strings) w.TV(s);           // into the string stream (endData below)
    const endbit = w.endData();
    for (const [code, hex] of rec.raw.h) { const [c, vv] = mapRef(rec, code, hex); w.hnd.H(c, vv); }
    return frameObject(w, endbit);
  }
  const fmt = ((data.fmt.maint & 0xFFFF) << 16 | data.fmt.ver) >>> 0;
  w.BL(cnum);
  if (v === 18) { const cn = 'cn:' + rec.cls.cpp; w.BS(cn.length); for (let i = 0; i < cn.length; i++) w.RC(cn.charCodeAt(i) & 0xFF); }
  if (v >= 32) { w.BL(data.fmt.ver); w.BL(data.fmt.maint); } else w.BL(fmt | 0);
  w.B(0);
  appendBits(w, data.bits, data.nd);
  let endbit;
  if (v < 21) { writeStrings(w, strings); endbit = w.bit; }
  else { w.TV('cn:' + rec.cls.cpp); for (const s of strings) w.TV(s); endbit = w.endData(); }
  for (const [code, hex] of rec.raw.h) { const [c, vv] = mapRef(rec, code, hex); w.hnd.H(c, vv); }
  return frameObject(w, endbit);
}
