/* SPDX-License-Identifier: Apache-2.0 */
/**
 * objects-read.js — decode one object of AcDb:AcDbObjects into a plain record. cc-dwg (Apache-2.0),
 * written from the ODA "Open Design Specification for .dwg files" v5.4.1: 20.1 (common object format,
 * the R2007+ string stream), 20.2/20.4.1/20.4.2 (common entity data and handles), 20.3 (type numbers),
 * 20.4.3–20.4.104 (each object), 28 (extended data), 2.11 (colours).
 *
 *   decodeObject(buf, offset, ctx) → record
 *     ctx = { ver, decode, classes: Map(typeNum → class), strict }
 *     record = { handle (Number), type (DXF-ish name), typeNum, isEntity, ...fields, _h: {handle refs} }
 *   Handle references are absolute Numbers in the record; read.js turns them into names / hex strings.
 *   Throws DwgReadError for an object it cannot frame; a type decoder that fails leaves `_error` and
 *   whatever it read (the caller notes it and goes on).
 *
 * Spec gaps found by experiment are marked "Spec gap:" where the code deals with them.
 */

import { msg } from './messages.js';
import { BitReader, DwgReadError, readMS, readMCu, mod } from './bits-read.js';
import { crc8 } from './crc.js';
import { TABLE_DECODERS } from './table-read.js';   // builder T: ACAD_TABLE, TABLESTYLE, CELLSTYLEMAP, TABLECONTENT, TABLEGEOMETRY, FIELD, FIELDLIST
import { decodeAcisEntity } from './solid-read.js';   // builder S: REGION 3DSOLID BODY
import { SURFACE_DECODERS } from './surface-read.js';   // SURFACE family (ACIS + type fields)

// 20.3 fixed type numbers
export const FIXED_TYPES = {
  1: 'TEXT', 2: 'ATTRIB', 3: 'ATTDEF', 4: 'BLOCK', 5: 'ENDBLK', 6: 'SEQEND', 7: 'INSERT', 8: 'MINSERT',
  10: 'VERTEX_2D', 11: 'VERTEX_3D', 12: 'VERTEX_MESH', 13: 'VERTEX_PFACE', 14: 'VERTEX_PFACE_FACE',
  15: 'POLYLINE_2D', 16: 'POLYLINE_3D', 17: 'ARC', 18: 'CIRCLE', 19: 'LINE', 20: 'DIMENSION_ORDINATE',
  21: 'DIMENSION_LINEAR', 22: 'DIMENSION_ALIGNED', 23: 'DIMENSION_ANG3PT', 24: 'DIMENSION_ANG2LN',
  25: 'DIMENSION_RADIUS', 26: 'DIMENSION_DIAMETER', 27: 'POINT', 28: '3DFACE', 29: 'POLYLINE_PFACE',
  30: 'POLYLINE_MESH', 31: 'SOLID', 32: 'TRACE', 33: 'SHAPE', 34: 'VIEWPORT', 35: 'ELLIPSE', 36: 'SPLINE',
  37: 'REGION', 38: '3DSOLID', 39: 'BODY', 40: 'RAY', 41: 'XLINE', 42: 'DICTIONARY', 43: 'OLEFRAME',
  44: 'MTEXT', 45: 'LEADER', 46: 'TOLERANCE', 47: 'MLINE', 48: 'BLOCK_CONTROL', 49: 'BLOCK_HEADER',
  50: 'LAYER_CONTROL', 51: 'LAYER', 52: 'STYLE_CONTROL', 53: 'STYLE', 56: 'LTYPE_CONTROL', 57: 'LTYPE',
  60: 'VIEW_CONTROL', 61: 'VIEW', 62: 'UCS_CONTROL', 63: 'UCS', 64: 'VPORT_CONTROL', 65: 'VPORT',
  66: 'APPID_CONTROL', 67: 'APPID', 68: 'DIMSTYLE_CONTROL', 69: 'DIMSTYLE', 70: 'VPENT_CONTROL',
  71: 'VPENT_HEADER', 72: 'GROUP', 73: 'MLINESTYLE', 74: 'OLE2FRAME', 75: 'DUMMY', 76: 'LONG_TRANSACTION',
  77: 'LWPOLYLINE', 78: 'HATCH', 79: 'XRECORD', 80: 'ACDBPLACEHOLDER', 81: 'VBA_PROJECT', 82: 'LAYOUT',
  0x1F2: 'ACAD_PROXY_ENTITY', 0x1F3: 'ACAD_PROXY_OBJECT',
};
const ENTITY_FIXED = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 74, 77, 78, 0x1F2]);
// class DXF names decoded with the fixed-type decoders
const CLASS_ALIAS = { LWPOLYLINE: 'LWPOLYLINE', HATCH: 'HATCH', XRECORD: 'XRECORD', LAYOUT: 'LAYOUT', OLE2FRAME: 'OLE2FRAME',
  ACDBPLACEHOLDER: 'ACDBPLACEHOLDER', GROUP: 'GROUP', MLINESTYLE: 'MLINESTYLE', DICTIONARYWDFLT: 'DICTIONARYWDFLT' };

/**
 * Frame an object and decode it.
 * @param {Uint8Array} buf  the AcDb:AcDbObjects data (or the whole file for R13–R15)
 */
export function decodeObject(buf, offset, ctx) {
  const ver = ctx.ver;
  if (offset < 0 || offset + 2 > buf.length) throw new DwgReadError(msg('ccdwg.err.offset_outside'));
  const size = readMS(buf, offset);
  let p = mod.pos;
  let hsize = 0;
  if (ver >= 24) { hsize = readMCu(buf, p); p = mod.pos; }
  if (p + size > buf.length) throw new DwgReadError(msg('ccdwg.err.object_past_end', { n: size }));
  const objStart = p * 8, objEnd = (p + size) * 8;
  const r = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: objStart, endBit: objEnd });
  const typeNum = r.OT();
  let endbit;
  if (ver >= 24) endbit = objEnd - hsize;
  else if (ver >= 15) endbit = objStart + r.RL();
  if (endbit !== undefined && (endbit < objStart || endbit > objEnd)) throw new DwgReadError(msg('ccdwg.err.size_fields'));
  const handle = r.H();
  const rec = { handle, typeNum, type: '', isEntity: false, _h: {} };
  rec._size = size;
  // 20.1: the CRC (seed 0xC0C1) covers the size fields and the data
  if (p + size + 2 <= buf.length && crc8(0xC0C1, buf, offset, p + size) !== (buf[p + size] | (buf[p + size + 1] << 8))) rec._crcBad = true;
  readEED(r, rec, ctx);

  let name = FIXED_TYPES[typeNum];
  let cls = null;
  if (typeNum >= 500) {
    cls = ctx.classes.get(typeNum);
    name = cls ? cls.dxfName : 'CLASS_' + typeNum;
    rec.isEntity = cls ? cls.isEntity : false;
    rec.className = cls ? cls.cppName : '';
  } else rec.isEntity = ENTITY_FIXED.has(typeNum);
  rec.type = name || 'TYPE_' + typeNum;

  if (ver < 15) endbit = undefined;   // R13/R14: size in bits comes later
  // entity / object common part
  if (rec.isEntity) commonEntity(r, rec, ctx);
  else commonObject(r, rec, ctx);
  if (ver < 15) {
    endbit = objStart + rec._r14bits;
    if (endbit < objStart || endbit > objEnd) throw new DwgReadError(msg('ccdwg.err.size_fields'));
  }

  // R2007+: the string stream sits just before the end of the data part
  let dataEnd = endbit;
  if (ver >= 21) {
    const s = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: objStart, endBit: endbit });
    const strStart = stringStreamStart(buf, endbit, objStart);
    if (strStart !== -1) { s.pos = strStart.start; s.end = strStart.end; dataEnd = strStart.start; }
    else { s.pos = s.end = endbit; }
    r.str = s;
  }
  r.end = Math.min(objEnd, dataEnd ?? objEnd);
  const h = new BitReader(buf, { version: ver, decode: ctx.decode, startBit: endbit ?? objEnd, endBit: objEnd });
  rec._dataEnd = dataEnd;

  // common handles
  try {
    if (rec.isEntity) commonEntityHandles(h, rec, ctx);
    else commonObjectHandles(h, rec, ctx);
  } catch (e) { rec._error = 'handles: ' + e.message; }

  rec._dataStart = r.pos;
  rec._hPos = h.pos; rec._endbit = endbit ?? objEnd; rec._objEnd = objEnd; rec._buf = buf;   // raw passthrough (passthrough.js)
  const dec = DECODERS[CLASS_ALIAS[name] || name];
  if (dec) {
    try { dec(r, h, rec, ctx); }
    catch (e) { rec._error = (rec._error ? rec._error + '; ' : '') + e.message; }
  } else rec._unknown = true;
  rec._dataLeft = r.end - r.pos;
  return rec;
}

/** 20.1: the string stream of an R2007+ object/section ending at `endbit`. → {start, end} or -1. */
export function stringStreamStart(buf, endbit, minBit = 0) {
  const t = new BitReader(buf, { startBit: endbit - 1, endBit: endbit });
  if (!t.B()) return -1;
  let p = endbit - 1 - 16;
  if (p < minBit) return -1;
  t.pos = p; t.end = p + 16;
  let size = t.RSu();
  if (size & 0x8000) {
    p -= 16;
    t.pos = p; t.end = p + 16;
    const hi = t.RSu();
    size = (size & 0x7FFF) | (hi << 15);
  }
  if (p - size < minBit) return -1;
  return { start: p - size, end: p };
}

// ---------------------------------------------------------------- 28 EED
function readEED(r, rec, ctx) {
  let n = 0;
  for (;;) {
    const size = r.BS();
    if (!size) break;
    const app = r.H();
    const end = r.pos + size * 8;
    const items = [];
    try {
      while (r.pos < end) {
        const code = r.RC();
        switch (code) {
          case 0: {
            if (ctx.ver >= 21) {
              const len = r.RSu(); let s = '';
              for (let i = 0; i < len; i++) s += String.fromCharCode(r.RSu());
              items.push([1000, s]);
            } else {
              const len = r.RC(); r.RSu();
              items.push([1000, ctx.decode(r.bytes(len))]);
            }
            break;
          }
          case 2: items.push([1002, r.RC() ? '}' : '{']); break;
          case 3: case 5: { const b = r.bytes(8); let v = 0; for (let i = 0; i < 8; i++) v = v * 256 + b[i]; items.push([1000 + code, v.toString(16).toUpperCase()]); break; }
          case 4: { const len = r.RC(); items.push([1004, hexBytes(r.bytes(len))]); break; }
          case 10: case 11: case 12: case 13: case 14: case 15: items.push([1000 + code, r.RD3()]); break;
          case 40: case 41: case 42: items.push([1000 + code, r.RD()]); break;
          case 70: items.push([1070, r.RS()]); break;
          case 71: items.push([1071, r.RLs()]); break;
          default: throw new DwgReadError(msg('ccdwg.err.eed_code', { code }));
        }
      }
    } catch (e) { rec._eedError = e.message; }
    r.pos = end;
    (rec._eed || (rec._eed = [])).push({ app, items });
    if (++n > 10000) break;
  }
}
function hexBytes(b) { let s = ''; for (const x of b) s += (x < 16 ? '0' : '') + x.toString(16).toUpperCase(); return s; }

// ---------------------------------------------------------------- 20.2 / 20.4.1 common entity data
function commonEntity(r, rec, ctx) {
  const ver = ctx.ver;
  if (r.B()) {   // graphic present
    const n = ver >= 24 ? r.BLL() : r.RL();
    rec._gfxPos = r.pos;   // proxy graphics, kept raw by passthrough.js
    r.pos += n * 8;
    rec._graphics = n;
  }
  if (ver < 15) rec._r14bits = r.RL();
  rec._entmode = r.BB();
  rec._nreact = r.BL();
  if (ver >= 18) rec._noXdic = r.B(); else rec._noXdic = 0;
  if (ver >= 27) rec._ds = r.B();
  if (ver < 15) rec._bylayerlt = r.B();
  // Spec gap: 20.4.1 lists Nolinks as common ("for R2004+ always 1"); R2004+ files have no such bit
  // (found by decoding AutoCAD R2004–R2018 entities: reading it shifts every later field).
  rec._nolinks = ver <= 15 ? r.B() : 1;
  const c = r.ENC();
  rec.color = c.color;
  if (c.transparency !== undefined) rec._transparency = c.transparency;
  rec._colorBook = c.hasBook;
  rec.ltscale = r.BD();
  if (ver >= 15) { rec._ltflags = r.BB(); rec._psflags = r.BB(); }
  if (ver >= 21) { rec._matflags = r.BB(); rec._shadow = r.RC(); }
  if (ver >= 24) { rec._vsFull = r.B(); rec._vsFace = r.B(); rec._vsEdge = r.B(); }
  rec.invisible = !!(r.BS() & 1);
  if (ver >= 15) rec._lw = r.RC();
}
function commonEntityHandles(h, rec, ctx) {
  const ver = ctx.ver, H = rec._h;
  if (rec._entmode === 0) H.owner = h.H(rec.handle);
  if (rec._nreact) H.reactors = hrefs(h, rec, rec._nreact);
  if (!rec._noXdic) H.xdic = h.H(rec.handle);
  if (ver < 15) {
    H.layer = h.H(rec.handle);
    if (!rec._bylayerlt) H.ltype = h.H(rec.handle);
  }
  if (ver <= 15 && !rec._nolinks) { H.prev = h.H(rec.handle); H.next = h.H(rec.handle); }
  if (ver >= 18 && rec._colorBook) H.colorBook = h.H(rec.handle);
  if (ver >= 15) {
    H.layer = h.H(rec.handle);
    if (rec._ltflags === 3) H.ltype = h.H(rec.handle);
    if (ver >= 21 && rec._matflags === 3) H.material = h.H(rec.handle);
    if (rec._psflags === 3) H.plotstyle = h.H(rec.handle);
    if (ver >= 24) {
      if (rec._vsFull) H.vsFull = h.H(rec.handle);
      if (rec._vsFace) H.vsFace = h.H(rec.handle);
      if (rec._vsEdge) H.vsEdge = h.H(rec.handle);
    }
  }
}

// ---------------------------------------------------------------- 20.1 common object data
function commonObject(r, rec, ctx) {
  const ver = ctx.ver;
  if (ver < 15) rec._r14bits = r.RL();
  rec._nreact = r.BL();
  rec._noXdic = ver >= 18 ? r.B() : 0;
  if (ver >= 27) rec._ds = r.B();
}
function commonObjectHandles(h, rec) {
  const H = rec._h;
  H.owner = h.H(rec.handle);
  if (rec._nreact) H.reactors = hrefs(h, rec, rec._nreact);
  if (!rec._noXdic) H.xdic = h.H(rec.handle);
}

// ---------------------------------------------------------------- helpers
/** n handle references (a damaged count larger than the stream can hold fails at once). */
const hrefs = (h, rec, n) => {
  if (n < 0 || n * 8 > h.end - h.pos) throw new DwgReadError(msg('ccdwg.err.handle_count', { n }));
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = h.H(rec.handle);
  return a;
};
/** a count of items of at least `minBits` each must fit in what is left of the stream */
function fits(r, n, minBits) {
  if (n < 0 || n * minBits > r.end - r.pos) throw new DwgReadError(msg('ccdwg.err.count_large', { n }));
  return n;
}
/** handles until the stream is exhausted (bytes left < 1) */
function restHandles(h, rec, max = 1e6) {
  const a = [];
  while (h.end - h.pos >= 8 && a.length < max) {
    try { a.push(h.H(rec.handle)); } catch { break; }
  }
  return a;
}
function tableEntry(r, rec, ctx) {
  rec.name = r.TV();
  rec._flag64 = r.B();
  // Spec gap: the tables of 20.4.5x store "xrefindex+1 BS" after the 64-flag; R2007+ files do not have it
  // (an APPID "ACAD" of R2018 has exactly 10 data bits: 64-flag, xdep, RC) — found by experiment.
  if (ctx.ver < 21) rec._xrefIndex = r.BS() - 1;
  rec._xdep = r.B();
}
function tableEntryHandles(h, rec) {
  rec._h.xrefBlock = h.H(rec.handle);
}

// ---------------------------------------------------------------- type decoders
const DECODERS = {};

// ---- 20.4.3 TEXT (and ATTRIB/ATTDEF text part)
function textData(r, rec, ctx) {
  if (ctx.ver < 15) {
    rec.elevation = r.BD();
    const a = r.RD2(), b = r.RD2();
    rec.insert = { x: a.x, y: a.y, z: rec.elevation }; rec.align = { x: b.x, y: b.y, z: rec.elevation };
    rec.extrusion = r.BD3(); rec.thickness = r.BD(); rec.oblique = r.BD(); rec.rotation = r.BD();
    rec.height = r.BD(); rec.widthFactor = r.BD(); rec.value = r.TV();
    rec.generation = r.BS(); rec.hAlign = r.BS(); rec.vAlign = r.BS();
  } else {
    const f = r.RC();
    rec.elevation = f & 1 ? 0 : r.RD();
    const ins = r.RD2();
    rec.insert = { x: ins.x, y: ins.y, z: rec.elevation };
    if (f & 2) rec.align = { x: ins.x, y: ins.y, z: rec.elevation };
    else rec.align = { x: r.DD(ins.x), y: r.DD(ins.y), z: rec.elevation };
    rec._alignGiven = !(f & 2);
    rec.extrusion = r.BE(); rec.thickness = r.BT();
    rec.oblique = f & 4 ? 0 : r.RD();
    rec.rotation = f & 8 ? 0 : r.RD();
    rec.height = r.RD();
    rec.widthFactor = f & 0x10 ? 1 : r.RD();
    rec.value = r.TV();
    rec.generation = f & 0x20 ? 0 : r.BS();
    rec.hAlign = f & 0x40 ? 0 : r.BS();
    rec.vAlign = f & 0x80 ? 0 : r.BS();
  }
}
DECODERS.TEXT = (r, h, rec, ctx) => { textData(r, rec, ctx); rec._h.style = h.H(rec.handle); };
function attribData(r, rec, ctx) {
  textData(r, rec, ctx);
  if (ctx.ver >= 24) rec._attVersion = r.RC();
  let type = 1;
  if (ctx.ver >= 32) type = r.RC();
  rec.attType = type;
  if (type > 1) {
    // R2018 multi-line attribute: an embedded MTEXT (from entmode on), then annotative data
    rec.mtext = embeddedMtext(r, rec, ctx);
    const annSize = r.BS();
    if (annSize > 0) { r.bytes(annSize); rec._annApp = true; r.BS(); }
    rec.tag = r.TV();
    r.BS();
    rec.flags = r.RC();
    rec.lockPosition = !!r.B();
  } else {
    rec.tag = r.TV();
    rec.fieldLength = r.BS();
    rec.flags = r.RC();
    if (ctx.ver >= 21) rec.lockPosition = !!r.B();
  }
}
DECODERS.ATTRIB = (r, h, rec, ctx) => { attribData(r, rec, ctx); rec._h.style = h.H(rec.handle); if (rec._annApp) rec._h.annApp = h.H(rec.handle); };
DECODERS.ATTDEF = (r, h, rec, ctx) => {
  attribData(r, rec, ctx);
  if (ctx.ver >= 24) rec._attdefVersion = r.RC();
  rec.prompt = r.TV();
  rec._h.style = h.H(rec.handle);
  if (rec._annApp) rec._h.annApp = h.H(rec.handle);
};
/**
 * R2018 multi-line ATTRIB/ATTDEF: "all fields of an embedded MTEXT object, starting from the entmode" (20.4.4).
 * Spec gap: that means the common entity data from the entmode on (entmode BB, reactors BL, no-xdictionary B,
 * R2013 data-store B, colour ENC, linetype scale BD, linetype/plot style/material flags BB, shadow RC, the three
 * visual-style bits, invisibility BS, lineweight RC) and then the MTEXT data; its handles are not separated
 * from the attribute's own — found by experiment with R2018 files from the ODA File Converter.
 */
function embeddedMtext(r, rec, ctx) {
  const ver = ctx.ver;
  const m = {};
  r.BB(); r.BL(); r.B(); if (ver >= 27) r.B();
  m.color = r.ENC().color; m.ltscale = r.BD(); r.BB(); r.BB();
  if (ver >= 21) { r.BB(); r.RC(); }
  if (ver >= 24) { r.B(); r.B(); r.B(); }
  r.BS(); r.RC();
  mtextData(r, null, m, ctx);
  return m;
}

// ---- 20.4.6/7/8 BLOCK, ENDBLK, SEQEND
DECODERS.BLOCK = (r, h, rec) => { rec.name = r.TV(); };
DECODERS.ENDBLK = () => {};
DECODERS.SEQEND = () => {};

// ---- 20.4.9/10 INSERT, MINSERT
function insertData(r, h, rec, ctx, minsert) {
  rec.insert = r.BD3();
  if (ctx.ver < 15) rec.scale = { x: r.BD(), y: r.BD(), z: r.BD() };
  else {
    const f = r.BB();
    if (f === 3) rec.scale = { x: 1, y: 1, z: 1 };
    else if (f === 1) { const y = r.DD(1); rec.scale = { x: 1, y, z: r.DD(1) }; }
    else if (f === 2) { const x = r.RD(); rec.scale = { x, y: x, z: x }; }
    else { const x = r.RD(); const y = r.DD(x); rec.scale = { x, y, z: r.DD(x) }; }
  }
  rec.rotation = r.BD();
  rec.extrusion = r.BD3();
  rec._hasAttribs = r.B();
  let owned = 0;
  // Spec gap: 20.4.9 lists "Owned Object Count" for R2004+ unconditionally; it is present only when the
  // has-ATTRIBs bit is set (INSERTs without attributes end right after that bit — found by experiment).
  if (ctx.ver >= 18 && rec._hasAttribs) owned = r.BL();
  if (minsert) { rec.cols = r.BS(); rec.rows = r.BS(); rec.colSpacing = r.BD(); rec.rowSpacing = r.BD(); }
  rec._h.block = h.H(rec.handle);
  if (rec._hasAttribs) {
    if (ctx.ver < 18) { rec._h.firstAttrib = h.H(rec.handle); rec._h.lastAttrib = h.H(rec.handle); }
    else rec._h.attribs = hrefs(h, rec, owned);
    rec._h.seqend = h.H(rec.handle);
  }
}
DECODERS.INSERT = (r, h, rec, ctx) => insertData(r, h, rec, ctx, false);
DECODERS.MINSERT = (r, h, rec, ctx) => insertData(r, h, rec, ctx, true);

// ---- 20.4.11–15 VERTEX
DECODERS.VERTEX_2D = (r, h, rec, ctx) => {
  rec.flags = r.RC();
  rec.point = r.BD3();
  let sw = r.BD();
  if (sw < 0) { rec.startWidth = rec.endWidth = -sw; }
  else { rec.startWidth = sw; rec.endWidth = r.BD(); }
  rec.bulge = r.BD();
  if (ctx.ver >= 24) rec.id = r.BL();
  rec.tangent = r.BD();
};
DECODERS.VERTEX_3D = (r, h, rec) => { rec.flags = r.RC(); rec.point = r.BD3(); };
DECODERS.VERTEX_MESH = DECODERS.VERTEX_3D;
DECODERS.VERTEX_PFACE = DECODERS.VERTEX_3D;
DECODERS.VERTEX_PFACE_FACE = (r, h, rec) => { rec.indices = [r.BS(), r.BS(), r.BS(), r.BS()]; };

// ---- 20.4.16/17/33/34 POLYLINE
function polyOwned(r, h, rec, ctx, owned) {
  if (ctx.ver < 18) { rec._h.firstVertex = h.H(rec.handle); rec._h.lastVertex = h.H(rec.handle); }
  else rec._h.vertices = hrefs(h, rec, owned);
  rec._h.seqend = h.H(rec.handle);
}
DECODERS.POLYLINE_2D = (r, h, rec, ctx) => {
  rec.flags = r.BS(); rec.curveType = r.BS(); rec.startWidth = r.BD(); rec.endWidth = r.BD();
  rec.thickness = r.BT(); rec.elevation = r.BD(); rec.extrusion = r.BE();
  const owned = ctx.ver >= 18 ? r.BL() : 0;
  polyOwned(r, h, rec, ctx, owned);
};
DECODERS.POLYLINE_3D = (r, h, rec, ctx) => {
  rec._splineFlags = r.RC(); rec._closedFlags = r.RC();
  const owned = ctx.ver >= 18 ? r.BL() : 0;
  polyOwned(r, h, rec, ctx, owned);
};
DECODERS.POLYLINE_PFACE = (r, h, rec, ctx) => {
  rec.numVertices = r.BS(); rec.numFaces = r.BS();
  const owned = ctx.ver >= 18 ? r.BL() : 0;
  polyOwned(r, h, rec, ctx, owned);
};
DECODERS.POLYLINE_MESH = (r, h, rec, ctx) => {
  rec.flags = r.BS(); rec.curveType = r.BS(); rec.m = r.BS(); rec.n = r.BS(); rec.mDensity = r.BS(); rec.nDensity = r.BS();
  const owned = ctx.ver >= 18 ? r.BL() : 0;
  polyOwned(r, h, rec, ctx, owned);
};

// ---- 20.4.18/20/21 ARC CIRCLE LINE
DECODERS.ARC = (r, h, rec) => {
  rec.center = r.BD3(); rec.radius = r.BD(); rec.thickness = r.BT(); rec.extrusion = r.BE();
  rec.startAngle = r.BD(); rec.endAngle = r.BD();
};
DECODERS.CIRCLE = (r, h, rec) => { rec.center = r.BD3(); rec.radius = r.BD(); rec.thickness = r.BT(); rec.extrusion = r.BE(); };
DECODERS.LINE = (r, h, rec, ctx) => {
  if (ctx.ver < 15) { rec.start = r.BD3(); rec.end = r.BD3(); }
  else {
    const zzero = r.B();
    const sx = r.RD(), ex = r.DD(sx), sy = r.RD(), ey = r.DD(sy);
    let sz = 0, ez = 0;
    if (!zzero) { sz = r.RD(); ez = r.DD(sz); }
    rec.start = { x: sx, y: sy, z: sz }; rec.end = { x: ex, y: ey, z: ez };
  }
  rec.thickness = r.BT(); rec.extrusion = r.BE();
};

// ---- 20.4.22–30 DIMENSION
function dimCommon(r, rec, ctx) {
  if (ctx.ver >= 24) rec._dimVersion = r.RC();
  rec.extrusion = r.BD3();
  const tm = r.RD2();
  rec.elevation = r.BD();
  rec.textMid = { x: tm.x, y: tm.y, z: rec.elevation };
  rec._flags1 = r.RC();
  rec.text = r.TV();
  rec.textRotation = r.BD(); rec.horizDir = r.BD();
  rec.insScale = r.BD3(); rec.insRotation = r.BD();
  if (ctx.ver >= 15) {
    rec.attach = r.BS(); rec.lineSpacingStyle = r.BS(); rec.lineSpacing = r.BD(); rec.measurement = r.BD();
  }
  if (ctx.ver >= 21) { rec._dimUnknown = r.B(); rec.flipArrow1 = r.B(); rec.flipArrow2 = r.B(); }
  const p12 = r.RD2();
  rec.insert = { x: p12.x, y: p12.y, z: rec.elevation };
}
function dimHandles(h, rec) { rec._h.dimstyle = h.H(rec.handle); rec._h.block = h.H(rec.handle); }
DECODERS.DIMENSION_ORDINATE = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 6;
  rec.defPoint = r.BD3(); rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec._flags2 = r.RC();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_LINEAR = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 0;
  rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec.defPoint = r.BD3(); rec.obliqueAngle = r.BD(); rec.angle = r.BD();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_ALIGNED = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 1;
  rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec.defPoint = r.BD3(); rec.obliqueAngle = r.BD();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_ANG3PT = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 5;
  rec.defPoint = r.BD3(); rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec.center = r.BD3();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_ANG2LN = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 2;
  const p16 = r.RD2(); rec.arcPoint = { x: p16.x, y: p16.y, z: rec.elevation };
  rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec.center = r.BD3(); rec.defPoint = r.BD3();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_RADIUS = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 4;
  rec.defPoint = r.BD3(); rec.center = r.BD3(); rec.leaderLen = r.BD();
  dimHandles(h, rec);
};
DECODERS.DIMENSION_DIAMETER = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 3;
  rec.center = r.BD3(); rec.defPoint = r.BD3(); rec.leaderLen = r.BD();
  dimHandles(h, rec);
};
DECODERS.ARC_DIMENSION = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 8;
  rec.defPoint = r.BD3(); rec.xline1 = r.BD3(); rec.xline2 = r.BD3(); rec.center = r.BD3();
  rec.isPartial = !!r.B(); rec.arcStart = r.BD(); rec.arcEnd = r.BD(); rec.hasLeader = !!r.B();
  rec.leader1 = r.BD3(); rec.leader2 = r.BD3();
  dimHandles(h, rec);
};
DECODERS.LARGE_RADIAL_DIMENSION = (r, h, rec, ctx) => {
  dimCommon(r, rec, ctx); rec.dimType = 9;
  rec.defPoint = r.BD3(); rec.chordPoint = r.BD3(); r.BD(); rec.overrideCenter = r.BD3(); rec.jogPoint = r.BD3();
  dimHandles(h, rec);
};

// ---- 20.4.31/32/35/36 POINT 3DFACE SOLID TRACE
DECODERS.POINT = (r, h, rec) => { rec.position = r.BD3(); rec.thickness = r.BT(); rec.extrusion = r.BE(); rec.xAxisAngle = r.BD(); };
DECODERS['3DFACE'] = (r, h, rec, ctx) => {
  if (ctx.ver < 15) { rec.points = [r.BD3(), r.BD3(), r.BD3(), r.BD3()]; rec.invisibleEdges = r.BS(); return; }
  const noFlags = r.B(), zzero = r.B();
  const p1 = { x: r.RD(), y: r.RD(), z: 0 };
  if (!zzero) p1.z = r.RD();
  const p2 = r.DD3(p1), p3 = r.DD3(p2), p4 = r.DD3(p3);
  rec.points = [p1, p2, p3, p4];
  rec.invisibleEdges = noFlags ? 0 : r.BS();
};
function solidData(r, h, rec) {
  rec.thickness = r.BT(); rec.elevation = r.BD();
  rec.points = [r.RD2(), r.RD2(), r.RD2(), r.RD2()].map((p) => ({ x: p.x, y: p.y, z: rec.elevation }));
  rec.extrusion = r.BE();
}
DECODERS.SOLID = solidData;
DECODERS.TRACE = solidData;
DECODERS.SHAPE = (r, h, rec) => {
  rec.insert = r.BD3(); rec.scale = r.BD(); rec.rotation = r.BD(); rec.widthFactor = r.BD(); rec.oblique = r.BD();
  rec.thickness = r.BD(); rec.shapeNumber = r.BS(); rec.extrusion = r.BD3();
  rec._h.style = h.H(rec.handle);
};

// ---- 20.4.38 VIEWPORT
DECODERS.VIEWPORT = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  rec.center = r.BD3(); rec.width = r.BD(); rec.height = r.BD();
  let frozen = 0;
  if (ver >= 15) {
    rec.viewTarget = r.BD3(); rec.viewDirection = r.BD3(); rec.twist = r.BD(); rec.viewHeight = r.BD();
    rec.lensLength = r.BD(); rec.frontClip = r.BD(); rec.backClip = r.BD(); rec.snapAngle = r.BD();
    rec.viewCenter = r.RD2(); rec.snapBase = r.RD2(); rec.snapSpacing = r.RD2(); rec.gridSpacing = r.RD2();
    rec.circleZoom = r.BS();
    if (ver >= 21) rec.gridMajor = r.BS();
    frozen = r.BL(); rec.status = r.BL(); rec.styleSheet = r.TV(); rec.renderMode = r.RC();
    rec.ucsAtOrigin = !!r.B(); rec.ucsPerViewport = !!r.B();
    rec.ucsOrigin = r.BD3(); rec.ucsXAxis = r.BD3(); rec.ucsYAxis = r.BD3(); rec.ucsElevation = r.BD(); rec.ucsOrthoType = r.BS();
    if (ver >= 18) rec.shadePlotMode = r.BS();
    if (ver >= 21) { rec.useDefaultLights = !!r.B(); rec.defaultLightingType = r.RC(); rec.brightness = r.BD(); rec.contrast = r.BD(); rec.ambientColor = r.CMC(); }
  }
  if (ver < 15) rec._h.vpentHeader = h.H(rec.handle);
  if (ver >= 15) {
    rec._h.frozenLayers = hrefs(h, rec, frozen);
    rec._h.clipBoundary = h.H(rec.handle);
    if (ver === 15) rec._h.vpentHeader = h.H(rec.handle);
    rec._h.namedUcs = h.H(rec.handle); rec._h.baseUcs = h.H(rec.handle);
  }
  if (ver >= 21) { rec._h.background = h.H(rec.handle); rec._h.visualStyle = h.H(rec.handle); rec._h.shadePlot = h.H(rec.handle); rec._h.sun = h.H(rec.handle); }
};

// ---- 20.4.39/40 ELLIPSE SPLINE
DECODERS.ELLIPSE = (r, h, rec) => {
  rec.center = r.BD3(); rec.majorAxis = r.BD3(); rec.extrusion = r.BD3(); rec.ratio = r.BD();
  rec.startParam = r.BD(); rec.endParam = r.BD();
};
DECODERS.SPLINE = (r, h, rec, ctx) => {
  let scenario = r.BL();
  if (ctx.ver >= 27) {
    rec.splineFlags1 = r.BL(); rec.knotParam = r.BL();
    // 20.4.40: from R2013 the stored scenario is superseded — fit data (method "fit points", flag 1) means
    // scenario 2 unless the knot parameter is Custom (15). Spec gap: the stored value cannot be trusted
    // (AutoCAD R2013 fit splines store 1) — found by experiment.
    scenario = rec.splineFlags1 & 1 && rec.knotParam !== 15 ? 2 : 1;
  }
  rec.degree = r.BL();
  let nknots = 0, nctrl = 0, nfit = 0, weighted = false;
  rec.flags = 0;
  if (scenario & 2) {
    rec.fitTolerance = r.BD(); rec.startTangent = r.BD3(); rec.endTangent = r.BD3(); nfit = r.BL();
  }
  if (scenario & 1) {
    rec.rational = !!r.B(); rec.closed = !!r.B(); rec.periodic = !!r.B();
    rec.knotTolerance = r.BD(); rec.controlTolerance = r.BD();
    nknots = r.BL(); nctrl = r.BL(); weighted = !!r.B();
  }
  rec.scenario = scenario;
  fits(r, nknots, 2); fits(r, nctrl, 6); fits(r, nfit, 6);
  rec.knots = new Array(nknots);
  for (let i = 0; i < nknots; i++) rec.knots[i] = r.BD();
  rec.control = new Array(nctrl);
  if (weighted) rec.weights = new Array(nctrl);
  for (let i = 0; i < nctrl; i++) { rec.control[i] = r.BD3(); if (weighted) rec.weights[i] = r.BD(); }
  rec.fit = new Array(nfit);
  for (let i = 0; i < nfit; i++) rec.fit[i] = r.BD3();
};

// ---- 20.4.41 REGION 3DSOLID BODY — builder S: solid-read.js (SAT / SAB, wireframe, silhouettes, R2013+ data storage)
DECODERS.REGION = decodeAcisEntity; DECODERS['3DSOLID'] = decodeAcisEntity; DECODERS.BODY = decodeAcisEntity;
// SURFACE PLANESURFACE EXTRUDEDSURFACE LOFTEDSURFACE REVOLVEDSURFACE SWEPTSURFACE NURBSURFACE (classes) — surface-read.js
Object.assign(DECODERS, SURFACE_DECODERS);

// ---- 20.4.42/43 RAY XLINE
DECODERS.RAY = (r, h, rec) => { rec.start = r.BD3(); rec.direction = r.BD3(); };
DECODERS.XLINE = DECODERS.RAY;

// ---- 20.4.44/45 DICTIONARY
function dictionary(r, h, rec, ctx, wdflt) {
  const n = r.BL();
  if (n < 0 || n > 1e7) throw new DwgReadError(msg('ccdwg.err.dictionary_size', { n }));
  if (ctx.ver === 14) r.RC();
  if (ctx.ver >= 15) { rec.cloning = r.BS(); rec.hardOwner = r.RC(); }
  rec.names = new Array(n);
  for (let i = 0; i < n; i++) rec.names[i] = r.TV();
  rec._h.items = hrefs(h, rec, n);
  if (wdflt) rec._h.defaultEntry = h.H(rec.handle);
}
DECODERS.DICTIONARY = (r, h, rec, ctx) => dictionary(r, h, rec, ctx, false);
DECODERS.DICTIONARYWDFLT = (r, h, rec, ctx) => dictionary(r, h, rec, ctx, true);
DECODERS.ACDBDICTIONARYWDFLT = DECODERS.DICTIONARYWDFLT;

// ---- 20.4.46 MTEXT
DECODERS.MTEXT = (r, h, rec, ctx) => mtextData(r, h, rec, ctx);
/** MTEXT data; `h` null for the MTEXT embedded in an R2018 multi-line attribute (no handles read). */
function mtextData(r, h, rec, ctx) {
  const ver = ctx.ver;
  rec.insert = r.BD3(); rec.extrusion = r.BD3(); rec.xAxis = r.BD3(); rec.width = r.BD();
  if (ver >= 21) rec.rectHeight = r.BD();
  rec.height = r.BD(); rec.attach = r.BS(); rec.direction = r.BS();
  rec._extH = r.BD(); rec._extW = r.BD();
  rec.value = r.TV();
  if (h) rec._h.style = h.H(rec.handle);
  if (ver >= 15) { rec.lineSpacingStyle = r.BS(); rec.lineSpacing = r.BD(); r.B(); }
  if (ver >= 18) {
    const bg = r.BL();
    rec.backgroundFlags = bg;
    if (bg & 1 || (ver >= 32 && bg & 0x10)) {
      // Spec gap: 20.4.46 types the background scale BL; it is a BD (DXF 45, default 1.5) — found by experiment.
      rec.backgroundScale = r.BD();
      rec.backgroundColor = r.CMC();
      rec.backgroundTransparency = r.BL();
    }
  }
  if (ver >= 32) {
    const notAnnotative = r.B();
    if (notAnnotative) {
      r.BS(); r.B();
      if (h) rec._h.mtextApp = h.H(rec.handle);
      r.BL(); r.BD3(); r.BD3(); r.BD(); r.BD(); r.BD(); r.BD();
      const colType = r.BS();
      if (colType) {
        rec.columns = { type: colType };
        const count = r.BL();
        rec.columns.count = count;
        rec.columns.width = r.BD(); rec.columns.gutter = r.BD();
        rec.columns.autoHeight = !!r.B(); rec.columns.flowReversed = !!r.B();
        if (!rec.columns.autoHeight && colType === 2) { rec.columns.heights = []; for (let i = 0; i < count; i++) rec.columns.heights.push(r.BD()); }
      }
    }
  }
};

// ---- 20.4.47 LEADER
DECODERS.LEADER = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  r.B();
  rec.annotType = r.BS(); rec.pathType = r.BS();
  const n = fits(r, r.BL(), 6);
  rec.vertices = [];
  for (let i = 0; i < n; i++) rec.vertices.push(r.BD3());
  rec.origin = r.BD3(); rec.extrusion = r.BD3(); rec.xDirection = r.BD3(); rec.blockOffset = r.BD3();
  if (ver >= 14) rec.endPointProj = r.BD3();
  if (ver < 15) rec.dimgap = r.BD();
  // Spec gap: R2010+ files have no box height/width here (13 bits follow the block offset whether or not the
  // leader has an annotation) — found with leaders saved by the ODA File Converter in R2007 and R2010.
  if (ver < 24) { rec.boxHeight = r.BD(); rec.boxWidth = r.BD(); }
  rec.hookLineOnX = !!r.B(); rec.arrowhead = !!r.B();
  if (ver < 15) { r.BS(); r.BD(); r.B(); r.B(); r.BS(); r.BS(); r.B(); r.B(); }
  else { r.BS(); r.B(); r.B(); }
  rec._h.annotation = h.H(rec.handle); rec._h.dimstyle = h.H(rec.handle);
};

// ---- 20.4.49 TOLERANCE, 20.4.50 MLINE
DECODERS.TOLERANCE = (r, h, rec, ctx) => {
  if (ctx.ver < 15) { r.BS(); rec.height = r.BD(); rec.dimgap = r.BD(); }
  rec.insert = r.BD3(); rec.xDirection = r.BD3(); rec.extrusion = r.BD3(); rec.text = r.TV();
  rec._h.dimstyle = h.H(rec.handle);
};
DECODERS.MLINE = (r, h, rec) => {
  rec.scale = r.BD(); rec.justification = r.RC(); rec.base = r.BD3(); rec.extrusion = r.BD3();
  rec.closed = r.BS() === 3; const lines = r.RC(); const n = r.BS();
  rec.vertices = [];
  for (let i = 0; i < n; i++) {
    const v = { point: r.BD3(), direction: r.BD3(), miter: r.BD3(), lines: [] };
    for (let k = 0; k < lines; k++) {
      const seg = []; const ns = r.BS(); for (let j = 0; j < ns; j++) seg.push(r.BD());
      const fill = []; const nf = r.BS(); for (let j = 0; j < nf; j++) fill.push(r.BD());
      v.lines.push({ segments: seg, fill });
    }
    rec.vertices.push(v);
  }
  rec._h.style = h.H(rec.handle);
};

// ---- 20.4.51–70 tables
function control(r, h, rec, ctx) {
  const n = r.BL();
  rec.count = n;
  // Spec gap: 20.4.67 does not list it, but R2000+ DIMSTYLE controls carry an RC (count of extra handles,
  // DXF 71) after the entry count — known from our own R2000 writer (dwg-write.js) and confirmed here.
  if (rec.type === 'DIMSTYLE_CONTROL' && ctx.ver >= 15) rec._extra = r.RC();
  // BLOCK/LTYPE controls list *MODEL_SPACE/*PAPER_SPACE and BYLAYER/BYBLOCK after the counted entries
  // (20.4.51/57) and the R2000+ DIMSTYLE control has extra handles (the RC above): every control is read to the
  // end of its handle stream and read.js keeps the handles that point at records of the table's type.
  rec._h.entries = restHandles(h, rec);
}
for (const t of ['BLOCK_CONTROL', 'LAYER_CONTROL', 'STYLE_CONTROL', 'LTYPE_CONTROL', 'VIEW_CONTROL', 'UCS_CONTROL',
  'VPORT_CONTROL', 'APPID_CONTROL', 'DIMSTYLE_CONTROL', 'VPENT_CONTROL']) DECODERS[t] = control;

DECODERS.BLOCK_HEADER = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  tableEntry(r, rec, ctx);
  rec.anonymous = !!r.B(); rec.hasAttribs = !!r.B(); rec.isXref = !!r.B(); rec.isOverlaid = !!r.B();
  if (ver >= 15) rec.loaded = !!r.B();
  let owned = 0;
  // Spec gap: 20.4.52 lists "Owned Object Count" for R2004+; xref and overlay block records do not have it
  // (they own no entities) — found on a client drawing's xref records.
  if (ver >= 18 && !rec.isXref && !rec.isOverlaid) owned = r.BL();
  rec.base = r.BD3();
  rec.xrefPath = r.TV();
  let inserts = 0;
  if (ver >= 15) {
    while (r.RC()) inserts++;
    rec.description = r.TV();
    const n = r.BL();
    if (n > 0) { rec.preview = r.bytes(n); }
  }
  if (ver >= 21) { rec.insertUnits = r.BS(); rec.explodable = !!r.B(); rec.scalable = r.RC(); }
  tableEntryHandles(h, rec);
  rec._h.block = h.H(rec.handle);
  if (ver < 18) {
    if (!rec.isXref && !rec.isOverlaid) { rec._h.firstEntity = h.H(rec.handle); rec._h.lastEntity = h.H(rec.handle); }
  } else rec._h.entities = hrefs(h, rec, owned);
  rec._h.endblk = h.H(rec.handle);
  if (ver >= 15) { rec._h.inserts = hrefs(h, rec, inserts); rec._h.layout = h.H(rec.handle); }
};

DECODERS.LAYER = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx);
  if (ctx.ver < 15) {
    // Spec gap: 20.4.54 calls the second bit "On"; it is set when the layer is OFF (R13/R14 files saved by the
    // ODA File Converter: the layers it shows off, with a negative colour in its DXF, have the bit set).
    rec.frozen = !!r.B(); rec.on = !r.B(); rec.frozenNew = !!r.B(); rec.locked = !!r.B();
    rec.plot = true; rec.lineweight = -3;
  } else {
    const v = r.BS();
    rec._values = v;
    // Spec gap: 20.4.54 calls bit 2 "on"; it is set when the layer is OFF (checked against the converter's DXF,
    // which writes the colour negative for those layers).
    rec.frozen = !!(v & 1); rec.on = !(v & 2); rec.frozenNew = !!(v & 4); rec.locked = !!(v & 8);
    rec.plot = !!(v & 16); rec._lwIndex = (v & 0x3E0) >> 5;
  }
  rec.color = r.CMC();
  tableEntryHandles(h, rec);
  if (ctx.ver >= 15) rec._h.plotstyle = h.H(rec.handle);
  if (ctx.ver >= 21) rec._h.material = h.H(rec.handle);
  rec._h.ltype = h.H(rec.handle);
  // Spec gap: 20.4.54 lists a trailing NULL handle as common; only R2013+ files have it (R2000–R2010 end after the linetype).
  if (ctx.ver >= 27) rec._h.unknown = h.H(rec.handle);
};

DECODERS.STYLE = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx);
  rec.vertical = !!r.B(); rec.isShapeFile = !!r.B();
  rec.height = r.BD(); rec.widthFactor = r.BD(); rec.oblique = r.BD(); rec.generation = r.RC();
  rec.lastHeight = r.BD(); rec.font = r.TV(); rec.bigFont = r.TV();
  tableEntryHandles(h, rec);
};

DECODERS.LTYPE = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx);
  rec.description = r.TV(); rec.patternLength = r.BD(); rec.alignment = r.RC();
  const n = r.RC();
  rec.elements = [];
  let anyText = false;
  for (let i = 0; i < n; i++) {
    const e = { length: r.BD(), shape: r.BS(), offset: { x: r.RD(), y: r.RD() }, scale: r.BD(), rotation: r.BD(), flags: r.BS() };
    if (e.flags & 2) anyText = true;
    rec.elements.push(e);
  }
  let area = null;
  if (ctx.ver <= 18) area = r.bytes(256);
  else if (anyText) area = r.bytes(512);
  if (area) {
    for (const e of rec.elements) {
      if (e.flags & 2 && ctx.ver <= 18) {
        // text dashes keep their string in the area at the 75-group index
        let s = ''; for (let k = e.shape; k < area.length && area[k]; k++) s += String.fromCharCode(area[k]);
        e.text = s;
      } else if (e.flags & 2) {
        let s = ''; for (let k = e.shape * 2; k + 1 < area.length; k += 2) { const c = area[k] | (area[k + 1] << 8); if (!c) break; s += String.fromCharCode(c); }
        e.text = s;
      }
    }
  }
  tableEntryHandles(h, rec);
  rec._h.shapes = hrefs(h, rec, n);
};

DECODERS.VIEW = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  tableEntry(r, rec, ctx);
  rec.height = r.BD(); rec.width = r.BD(); rec.center = r.RD2(); rec.target = r.BD3(); rec.direction = r.BD3();
  rec.twist = r.BD(); rec.lensLength = r.BD(); rec.frontClip = r.BD(); rec.backClip = r.BD();
  rec.viewMode = r.bits(4);
  if (ver >= 15) rec.renderMode = r.RC();
  if (ver >= 21) { rec.useDefaultLights = !!r.B(); rec.defaultLightingType = r.RC(); rec.brightness = r.BD(); rec.contrast = r.BD(); rec.ambientColor = r.CMC(); }
  rec.paperSpace = !!r.B();
  if (ver >= 15) {
    rec.associatedUcs = !!r.B();
    if (rec.associatedUcs) { rec.ucsOrigin = r.BD3(); rec.ucsXAxis = r.BD3(); rec.ucsYAxis = r.BD3(); rec.ucsElevation = r.BD(); rec.ucsOrthoType = r.BS(); }
  }
  if (ver >= 21) rec.cameraPlottable = !!r.B();
  tableEntryHandles(h, rec);
  if (ver >= 21) { rec._h.background = h.H(rec.handle); rec._h.visualStyle = h.H(rec.handle); rec._h.sun = h.H(rec.handle); }
  if (ver >= 15 && rec.associatedUcs) { rec._h.baseUcs = h.H(rec.handle); rec._h.namedUcs = h.H(rec.handle); }
  if (ver >= 21) rec._h.liveSection = h.H(rec.handle);
};

DECODERS.UCS = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx);
  rec.origin = r.BD3(); rec.xAxis = r.BD3(); rec.yAxis = r.BD3();
  if (ctx.ver >= 15) { rec.elevation = r.BD(); rec.orthoViewType = r.BS(); rec.orthoType = r.BS(); }
  tableEntryHandles(h, rec);
};

DECODERS.VPORT = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  tableEntry(r, rec, ctx);
  rec.viewHeight = r.BD(); rec.aspectRatio = r.BD(); rec.viewCenter = r.RD2(); rec.viewTarget = r.BD3();
  rec.viewDirection = r.BD3(); rec.twist = r.BD(); rec.lensLength = r.BD(); rec.frontClip = r.BD(); rec.backClip = r.BD();
  rec.viewMode = r.bits(4);
  if (ver >= 15) rec.renderMode = r.RC();
  if (ver >= 21) { rec.useDefaultLights = !!r.B(); rec.defaultLightingType = r.RC(); rec.brightness = r.BD(); rec.contrast = r.BD(); rec.ambientColor = r.CMC(); }
  rec.lowerLeft = r.RD2(); rec.upperRight = r.RD2(); rec.ucsFollow = !!r.B(); rec.circleZoom = r.BS(); rec.fastZoom = !!r.B();
  rec.ucsIcon = r.bits(2); rec.gridOn = !!r.B(); rec.gridSpacing = r.RD2(); rec.snapOn = !!r.B(); rec.snapStyle = !!r.B();
  rec.snapIsoPair = r.BS(); rec.snapRotation = r.BD(); rec.snapBase = r.RD2(); rec.snapSpacing = r.RD2();
  if (ver >= 15) {
    r.B(); rec.ucsPerViewport = !!r.B(); rec.ucsOrigin = r.BD3(); rec.ucsXAxis = r.BD3(); rec.ucsYAxis = r.BD3();
    rec.ucsElevation = r.BD(); rec.ucsOrthoType = r.BS();
  }
  if (ver >= 21) { rec.gridFlags = r.BS(); rec.gridMajor = r.BS(); }
  tableEntryHandles(h, rec);
  if (ver >= 21) { rec._h.background = h.H(rec.handle); rec._h.visualStyle = h.H(rec.handle); rec._h.sun = h.H(rec.handle); }
  if (ver >= 15) { rec._h.namedUcs = h.H(rec.handle); rec._h.baseUcs = h.H(rec.handle); }
};

DECODERS.APPID = (r, h, rec, ctx) => { tableEntry(r, rec, ctx); rec.unknown = r.RC(); tableEntryHandles(h, rec); };

// 20.4.68 DIMSTYLE — values kept by DXF variable name
const DIMSTYLE_R2000 = [
  ['DIMPOST', 'TV'], ['DIMAPOST', 'TV'], ['DIMSCALE', 'BD'], ['DIMASZ', 'BD'], ['DIMEXO', 'BD'], ['DIMDLI', 'BD'],
  ['DIMEXE', 'BD'], ['DIMRND', 'BD'], ['DIMDLE', 'BD'], ['DIMTP', 'BD'], ['DIMTM', 'BD'],
  ['DIMFXL', 'BD', 21], ['DIMJOGANG', 'BD', 21], ['DIMTFILL', 'BS', 21], ['DIMTFILLCLR', 'CMC', 21],
  ['DIMTOL', 'B'], ['DIMLIM', 'B'], ['DIMTIH', 'B'], ['DIMTOH', 'B'], ['DIMSE1', 'B'], ['DIMSE2', 'B'],
  ['DIMTAD', 'BS'], ['DIMZIN', 'BS'], ['DIMAZIN', 'BS'], ['DIMARCSYM', 'BS', 21],
  ['DIMTXT', 'BD'], ['DIMCEN', 'BD'], ['DIMTSZ', 'BD'], ['DIMALTF', 'BD'], ['DIMLFAC', 'BD'], ['DIMTVP', 'BD'],
  ['DIMTFAC', 'BD'], ['DIMGAP', 'BD'], ['DIMALTRND', 'BD'], ['DIMALT', 'B'], ['DIMALTD', 'BS'], ['DIMTOFL', 'B'],
  ['DIMSAH', 'B'], ['DIMTIX', 'B'], ['DIMSOXD', 'B'], ['DIMCLRD', 'CMC'], ['DIMCLRE', 'CMC'], ['DIMCLRT', 'CMC'],
  ['DIMADEC', 'BS'], ['DIMDEC', 'BS'], ['DIMTDEC', 'BS'], ['DIMALTU', 'BS'], ['DIMALTTD', 'BS'], ['DIMAUNIT', 'BS'],
  ['DIMFRAC', 'BS'], ['DIMLUNIT', 'BS'], ['DIMDSEP', 'BS'], ['DIMTMOVE', 'BS'], ['DIMJUST', 'BS'], ['DIMSD1', 'B'],
  ['DIMSD2', 'B'], ['DIMTOLJ', 'BS'], ['DIMTZIN', 'BS'], ['DIMALTZ', 'BS'], ['DIMALTTZ', 'BS'], ['DIMUPT', 'B'],
  ['DIMATFIT', 'BS'], ['DIMFXLON', 'B', 21], ['DIMTXTDIRECTION', 'B', 24], ['DIMALTMZF', 'BD', 24], ['DIMALTMZS', 'TV', 24],
  ['DIMMZF', 'BD', 24], ['DIMMZS', 'TV', 24], ['DIMLWD', 'BS'], ['DIMLWE', 'BS'],
];
const DIMSTYLE_R13 = [
  ['DIMTOL', 'B'], ['DIMLIM', 'B'], ['DIMTIH', 'B'], ['DIMTOH', 'B'], ['DIMSE1', 'B'], ['DIMSE2', 'B'], ['DIMALT', 'B'],
  ['DIMTOFL', 'B'], ['DIMSAH', 'B'], ['DIMTIX', 'B'], ['DIMSOXD', 'B'], ['DIMALTD', 'RC'], ['DIMZIN', 'RC'], ['DIMSD1', 'B'],
  ['DIMSD2', 'B'], ['DIMTOLJ', 'RC'], ['DIMJUST', 'RC'], ['DIMFIT', 'RC'], ['DIMUPT', 'B'], ['DIMTZIN', 'RC'], ['DIMALTZ', 'RC'],
  ['DIMALTTZ', 'RC'], ['DIMTAD', 'RC'], ['DIMUNIT', 'BS'], ['DIMAUNIT', 'BS'], ['DIMDEC', 'BS'], ['DIMTDEC', 'BS'],
  ['DIMALTU', 'BS'], ['DIMALTTD', 'BS'], ['DIMSCALE', 'BD'], ['DIMASZ', 'BD'], ['DIMEXO', 'BD'], ['DIMDLI', 'BD'],
  ['DIMEXE', 'BD'], ['DIMRND', 'BD'], ['DIMDLE', 'BD'], ['DIMTP', 'BD'], ['DIMTM', 'BD'], ['DIMTXT', 'BD'], ['DIMCEN', 'BD'],
  ['DIMTSZ', 'BD'], ['DIMALTF', 'BD'], ['DIMLFAC', 'BD'], ['DIMTVP', 'BD'], ['DIMTFAC', 'BD'], ['DIMGAP', 'BD'],
  ['DIMPOST', 'T'], ['DIMAPOST', 'T'], ['DIMBLK_NAME', 'T'], ['DIMBLK1_NAME', 'T'], ['DIMBLK2_NAME', 'T'],
  ['DIMCLRD', 'BS'], ['DIMCLRE', 'BS'], ['DIMCLRT', 'BS'],
];
function readTyped(r, t) {
  switch (t) {
    case 'B': return r.B(); case 'BS': return r.BS(); case 'BD': return r.BD(); case 'RC': return r.RC();
    case 'TV': return r.TV(); case 'T': return r.T(); case 'CMC': return r.CMC(); default: throw new Error(t);
  }
}
DECODERS.DIMSTYLE = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx);
  const vars = {};
  for (const [name, t, from] of ctx.ver < 15 ? DIMSTYLE_R13 : DIMSTYLE_R2000) {
    if (from && ctx.ver < from) continue;
    vars[name] = readTyped(r, t);
  }
  rec._unknownBit = r.B();
  rec.vars = vars;
  tableEntryHandles(h, rec);
  rec._h.DIMTXSTY = h.H(rec.handle);
  if (ctx.ver >= 15) { rec._h.DIMLDRBLK = h.H(rec.handle); rec._h.DIMBLK = h.H(rec.handle); rec._h.DIMBLK1 = h.H(rec.handle); rec._h.DIMBLK2 = h.H(rec.handle); }
  if (ctx.ver >= 21) { rec._h.DIMLTYPE = h.H(rec.handle); rec._h.DIMLTEX1 = h.H(rec.handle); rec._h.DIMLTEX2 = h.H(rec.handle); }
};
DECODERS.VPENT_HEADER = (r, h, rec, ctx) => {
  tableEntry(r, rec, ctx); rec.flag1 = r.B();
  tableEntryHandles(h, rec); rec._h.viewport = h.H(rec.handle); rec._h.prevHeader = h.H(rec.handle);
};

// ---- 20.4.72/73 GROUP MLINESTYLE
DECODERS.GROUP = (r, h, rec) => {
  rec.name = r.TV(); rec.unnamed = r.BS(); rec.selectable = r.BS();
  const n = r.BL();
  rec._h.entities = hrefs(h, rec, n);
};
DECODERS.MLINESTYLE = (r, h, rec, ctx) => {
  rec.name = r.TV(); rec.description = r.TV(); rec.flags = r.BS(); rec.fillColor = r.CMC();
  rec.startAngle = r.BD(); rec.endAngle = r.BD();
  const n = r.RC();
  rec.elements = [];
  for (let i = 0; i < n; i++) {
    const e = { offset: r.BD(), color: r.CMC() };
    if (ctx.ver < 32) e.linetypeIndex = r.BS();
    rec.elements.push(e);
  }
  if (ctx.ver >= 32) for (const e of rec.elements) e._ltype = h.H(rec.handle);
};

// ---- 20.4.74 DICTIONARYVAR
DECODERS.DICTIONARYVAR = (r, h, rec) => { rec.intval = r.RC(); rec.value = r.TV(); };

// ---- 20.4.75 HATCH
DECODERS.HATCH = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  if (ver >= 18) {
    const isGrad = r.BL();
    r.BL();
    const angle = r.BD(), shift = r.BD(), single = r.BL(), tint = r.BD();
    const nc = r.BL();
    const colors = [];
    for (let i = 0; i < nc; i++) { const value = r.BD(); r.BS(); const rgb = r.BL() >>> 0; r.RC(); colors.push({ value, rgb: rgb & 0xFFFFFF }); }
    const name = r.TV();
    if (isGrad) rec.gradient = { name, angle, shift, singleColor: single, tint, colors };
  }
  rec.elevation = r.BD(); rec.extrusion = r.BD3(); rec.pattern = r.TV();
  rec.solid = !!r.B(); rec.associative = !!r.B();
  const np = r.BL();
  rec.loops = [];
  let totalBound = 0, anyPixel = false;
  for (let i = 0; i < np; i++) {
    const flags = r.BL();
    const loop = { flags };
    if (flags & 4) anyPixel = true;
    if (!(flags & 2)) {
      const ns = r.BL();
      loop.edges = [];
      for (let k = 0; k < ns; k++) {
        const t = r.RC();
        if (t === 1) loop.edges.push({ type: 'line', start: r.RD2(), end: r.RD2() });
        else if (t === 2) loop.edges.push({ type: 'arc', center: r.RD2(), radius: r.BD(), startAngle: r.BD(), endAngle: r.BD(), ccw: !!r.B() });
        else if (t === 3) loop.edges.push({ type: 'ellipse', center: r.RD2(), majorAxis: r.RD2(), ratio: r.BD(), startAngle: r.BD(), endAngle: r.BD(), ccw: !!r.B() });
        else if (t === 4) {
          const e = { type: 'spline', degree: r.BL(), rational: !!r.B(), periodic: !!r.B() };
          const nk = r.BL(), nc = r.BL();
          e.knots = []; for (let j = 0; j < nk; j++) e.knots.push(r.BD());
          e.control = []; if (e.rational) e.weights = [];
          for (let j = 0; j < nc; j++) { e.control.push(r.RD2()); if (e.rational) e.weights.push(r.BD()); }
          if (ver >= 24) {
            const nf = r.BL();
            if (nf > 0) {
              e.fit = []; for (let j = 0; j < nf; j++) e.fit.push(r.RD2());
              e.startTangent = r.RD2(); e.endTangent = r.RD2();
            }
          }
          loop.edges.push(e);
        } else throw new DwgReadError(msg('ccdwg.err.hatch_edge', { type: t }));
      }
    } else {
      const bulges = r.B();
      const closed = r.B();
      const n = r.BL();
      const vs = [];
      for (let k = 0; k < n; k++) { const p = r.RD2(); vs.push({ x: p.x, y: p.y, bulge: bulges ? r.BD() : 0 }); }
      loop.polyline = { closed: !!closed, hasBulges: !!bulges, vertices: vs };
    }
    loop._nbound = r.BL();
    totalBound += loop._nbound;
    rec.loops.push(loop);
  }
  rec.style = r.BS(); rec.patternType = r.BS();
  if (!rec.solid) {
    rec.angle = r.BD(); rec.scale = r.BD(); rec.double = !!r.B();
    const nd = r.BS();
    rec.patternLines = [];
    for (let i = 0; i < nd; i++) {
      const l = { angle: r.BD(), base: r.BD2(), offset: r.BD2(), dashes: [] };
      const n = r.BS();
      for (let k = 0; k < n; k++) l.dashes.push(r.BD());
      rec.patternLines.push(l);
    }
  }
  if (anyPixel) rec.pixelSize = r.BD();
  const ns = r.BL();
  rec.seeds = [];
  for (let i = 0; i < ns; i++) rec.seeds.push(r.RD2());
  rec._h.boundary = hrefs(h, rec, totalBound);
  let bi = 0;
  for (const l of rec.loops) { l._boundary = rec._h.boundary.slice(bi, bi + l._nbound); bi += l._nbound; }
};

// ---- 20.4.79–84
DECODERS.IDBUFFER = (r, h, rec) => { r.RC(); const n = r.BL(); rec._h.ids = hrefs(h, rec, n); };
function imageData(r, h, rec, ctx) {
  rec.classVersion = r.BL(); rec.insert = r.BD3(); rec.u = r.BD3(); rec.v = r.BD3(); rec.size = r.RD2();
  rec.displayFlags = r.BS(); rec.clipping = !!r.B(); rec.brightness = r.RC(); rec.contrast = r.RC(); rec.fade = r.RC();
  if (ctx.ver >= 24) rec.clipMode = r.B();
  rec.clipType = r.BS();
  if (rec.clipType === 1) rec.clip = [r.RD2(), r.RD2()];
  else { const n = r.BL(); rec.clip = []; for (let i = 0; i < n; i++) rec.clip.push(r.RD2()); }
  rec._h.def = h.H(rec.handle); rec._h.defReactor = h.H(rec.handle);
}
DECODERS.IMAGE = imageData;
DECODERS.WIPEOUT = imageData;
DECODERS.IMAGEDEF = (r, h, rec) => {
  rec.classVersion = r.BL(); rec.size = r.RD2(); rec.fileName = r.TV(); rec.loaded = !!r.B(); rec.resUnits = r.RC();
  rec.pixelSize = r.RD2();
};
DECODERS.IMAGEDEF_REACTOR = (r, h, rec) => { rec.classVersion = r.BL(); };
DECODERS.LAYER_INDEX = (r, h, rec) => {
  r.BL(); r.BL(); const n = r.BL(); rec.entries = [];
  for (let i = 0; i < n; i++) rec.entries.push({ index: r.BL(), name: r.TV() });
  rec._h.entries = hrefs(h, rec, n);
};
DECODERS.LAYOUT = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  const ps = rec.plot = {};
  ps.pageSetupName = r.TV(); ps.printer = r.TV(); ps.flags = r.BS();
  ps.margins = { left: r.BD(), bottom: r.BD(), right: r.BD(), top: r.BD() };
  ps.paperWidth = r.BD(); ps.paperHeight = r.BD(); ps.paperSize = r.TV(); ps.origin = r.BD2();
  ps.paperUnits = r.BS(); ps.rotation = r.BS(); ps.plotType = r.BS(); ps.windowMin = r.BD2(); ps.windowMax = r.BD2();
  if (ver <= 15) ps.viewName = r.T();
  ps.realWorldUnits = r.BD(); ps.drawingUnits = r.BD(); ps.styleSheet = r.TV(); ps.scaleType = r.BS(); ps.scaleFactor = r.BD();
  ps.imageOrigin = r.BD2();
  if (ver >= 18) { ps.shadePlotMode = r.BS(); ps.shadePlotRes = r.BS(); ps.shadePlotDpi = r.BS(); }
  rec.name = r.TV(); rec.tabOrder = r.BL(); rec.flags = r.BS(); rec.ucsOrigin = r.BD3(); rec.limMin = r.RD2(); rec.limMax = r.RD2();
  rec.insBase = r.BD3(); rec.ucsXAxis = r.BD3(); rec.ucsYAxis = r.BD3(); rec.elevation = r.BD(); rec.orthoType = r.BS();
  rec.extMin = r.BD3(); rec.extMax = r.BD3();
  let nvp = 0;
  if (ver >= 18) nvp = r.BL();   // Spec gap: 20.4.84 types it RL; AutoCAD files carry a BL (found by experiment)
  if (ver >= 18) rec._h.plotView = h.H(rec.handle);
  if (ver >= 21) rec._h.visualStyle = h.H(rec.handle);
  rec._h.block = h.H(rec.handle); rec._h.lastViewport = h.H(rec.handle); rec._h.baseUcs = h.H(rec.handle); rec._h.namedUcs = h.H(rec.handle);
  if (ver >= 18) rec._h.viewports = hrefs(h, rec, nvp);
};
DECODERS.PLOTSETTINGS = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  const ps = rec.plot = {};
  ps.pageSetupName = r.TV(); ps.printer = r.TV(); ps.flags = r.BS();
  ps.margins = { left: r.BD(), bottom: r.BD(), right: r.BD(), top: r.BD() };
  ps.paperWidth = r.BD(); ps.paperHeight = r.BD(); ps.paperSize = r.TV(); ps.origin = r.BD2();
  ps.paperUnits = r.BS(); ps.rotation = r.BS(); ps.plotType = r.BS(); ps.windowMin = r.BD2(); ps.windowMax = r.BD2();
  if (ver <= 15) ps.viewName = r.T();
  ps.realWorldUnits = r.BD(); ps.drawingUnits = r.BD(); ps.styleSheet = r.TV(); ps.scaleType = r.BS(); ps.scaleFactor = r.BD();
  ps.imageOrigin = r.BD2();
  if (ver >= 18) { ps.shadePlotMode = r.BS(); ps.shadePlotRes = r.BS(); ps.shadePlotDpi = r.BS(); }
  if (ver >= 18) rec._h.plotView = h.H(rec.handle);
};

// ---- 20.4.85 LWPOLYLINE
DECODERS.LWPOLYLINE = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  const f = r.BS();
  rec.flags = f;
  rec.constantWidth = f & 4 ? r.BD() : 0;
  rec.elevation = f & 8 ? r.BD() : 0;
  rec.thickness = f & 2 ? r.BD() : 0;
  rec.extrusion = f & 1 ? r.BD3() : { x: 0, y: 0, z: 1 };
  const n = fits(r, r.BL(), 2);
  const nb = f & 16 ? fits(r, r.BL(), 2) : 0;
  const nid = ver >= 24 && f & 1024 ? fits(r, r.BL(), 2) : 0;
  const nw = f & 32 ? fits(r, r.BL(), 4) : 0;
  rec.closed = !!(f & 512);
  rec.plinegen = !!(f & 256);
  const vs = rec.vertices = new Array(n);
  if (n > 0) {
    if (ver < 15) for (let i = 0; i < n; i++) { const p = r.RD2(); vs[i] = { x: p.x, y: p.y, bulge: 0, startWidth: 0, endWidth: 0 }; }
    else {
      let x = r.RD(), y = r.RD();
      vs[0] = { x, y, bulge: 0, startWidth: 0, endWidth: 0 };
      for (let i = 1; i < n; i++) { x = r.DD(x); y = r.DD(y); vs[i] = { x, y, bulge: 0, startWidth: 0, endWidth: 0 }; }
    }
  }
  for (let i = 0; i < nb; i++) { const b = r.BD(); if (vs[i]) vs[i].bulge = b; }
  for (let i = 0; i < nid; i++) { const id = r.BL(); if (vs[i]) vs[i].id = id; }
  for (let i = 0; i < nw; i++) { const s = r.BD(), e = r.BD(); if (vs[i]) { vs[i].startWidth = s; vs[i].endWidth = e; } }
};

// ---- 20.4.88 OLE2FRAME
DECODERS.OLE2FRAME = (r, h, rec, ctx) => {
  rec.flags = r.BS();
  if (ctx.ver >= 15) rec.mode = r.BS();
  rec.dataLength = r.BL();
  r.pos += rec.dataLength * 8;
  if (ctx.ver >= 15) r.RC();
};
DECODERS.OLEFRAME = DECODERS.OLE2FRAME;

// ---- 20.4.90 PROXY
function proxy(r, h, rec, ctx) {
  if (ctx.ver >= 15) {
    rec.classId = r.BL();
    if (ctx.ver >= 32) { rec.proxyVersion = r.BL(); rec.proxyMaint = r.BL(); } else rec.drawingFormat = r.BL();
    rec.originalFormat = r.B();
  }
}
DECODERS.ACAD_PROXY_ENTITY = proxy;
DECODERS.ACAD_PROXY_OBJECT = proxy;

// ---- 20.4.91–95
DECODERS.RASTERVARIABLES = (r, h, rec) => { rec.classVersion = r.BL(); rec.displayFrame = r.BS(); rec.displayQuality = r.BS(); rec.units = r.BS(); };
DECODERS.SCALE = (r, h, rec) => { r.BS(); rec.name = r.TV(); rec.paperUnits = r.BD(); rec.drawingUnits = r.BD(); rec.unitScale = !!r.B(); };
DECODERS.SORTENTSTABLE = (r, h, rec) => {
  const n = r.BL();
  rec._sort = [];
  for (let i = 0; i < n; i++) rec._sort.push(r.H());
  rec._h.ownerBlock = h.H(rec.handle);
  rec._h.ents = hrefs(h, rec, n);
};
DECODERS.SPATIAL_FILTER = (r, h, rec) => {
  const n = r.BS(); rec.points = []; for (let i = 0; i < n; i++) rec.points.push(r.RD2());
  rec.extrusion = r.BD3(); rec.origin = r.BD3(); rec.displayBoundary = r.BS();
  rec.frontClip = r.BS() ? r.BD() : null;
  rec.backClip = r.BS() ? r.BD() : null;
  rec.inverseBlockTransform = []; for (let i = 0; i < 12; i++) rec.inverseBlockTransform.push(r.BD());
  rec.clipTransform = []; for (let i = 0; i < 12; i++) rec.clipTransform.push(r.BD());
};

// ---- 20.4.96 TABLE (ACAD_TABLE): the INSERT-like start and the grid size; cells are not decoded (the drawn
// table is the anonymous "*T" block the entity references, like a dimension's block)
DECODERS.ACAD_TABLE = (r, h, rec, ctx) => {
  rec.insert = r.BD3();
  if (ctx.ver < 15) rec.scale = { x: r.BD(), y: r.BD(), z: r.BD() };
  else {
    const f = r.BB();
    if (f === 3) rec.scale = { x: 1, y: 1, z: 1 };
    else if (f === 1) { const y = r.DD(1); rec.scale = { x: 1, y, z: r.DD(1) }; }
    else if (f === 2) { const x = r.RD(); rec.scale = { x, y: x, z: x }; }
    else { const x = r.RD(); const y = r.DD(x); rec.scale = { x, y, z: r.DD(x) }; }
  }
  rec.rotation = r.BD(); rec.extrusion = r.BD3(); rec._hasAttribs = r.B();
  if (ctx.ver >= 18 && rec._hasAttribs) r.BL();
  rec.partial = true;
  if (ctx.ver < 24) {
    rec.tableFlags = r.BS(); rec.horizDir = r.BD3();
    const nc = fits(r, r.BL(), 2), nr = fits(r, r.BL(), 2);
    rec.cols = nc; rec.rows = nr;
    rec.colWidths = []; for (let i = 0; i < nc; i++) rec.colWidths.push(r.BD());
    rec.rowHeights = []; for (let i = 0; i < nr; i++) rec.rowHeights.push(r.BD());
  }
  rec._h.block = h.H(rec.handle);
};

// ---- LIGHT. Spec gap: not in the spec; the layout below was found by experiment (bit by bit against the
// ODA File Converter's DXF of the same light): version BL, name TV, type BS, status B, colour CMC, plot glyph B,
// intensity BD, position 3BD, target 3BD, then the attenuation / spot / shadow fields in DXF order.
DECODERS.LIGHT = (r, h, rec) => {
  rec.lightVersion = r.BL(); rec.name = r.TV(); rec.lightType = r.BS(); rec.status = !!r.B(); rec.lightColor = r.CMC();
  rec.plotGlyph = !!r.B(); rec.intensity = r.BD(); rec.position = r.BD3(); rec.target = r.BD3();
  rec.attenuationType = r.BS(); rec.useAttenuationLimits = !!r.B(); rec.attenuationStart = r.BD(); rec.attenuationEnd = r.BD();
  rec.hotspot = r.BD(); rec.falloff = r.BD(); rec.castShadows = !!r.B(); rec.shadowType = r.BS();
  rec.shadowMapSize = r.BS(); rec.shadowMapSoftness = r.RC();
};

// ---- objects with no or one field
DECODERS.ACDBPLACEHOLDER = () => {};
DECODERS.WIPEOUTVARIABLES = (r, h, rec) => { rec.displayFrame = r.BS(); };   // not in the spec: one BS, as RASTERVARIABLES' frame
DECODERS.FIELDLIST = (r, h, rec) => { const n = r.BL(); rec.unknown = r.B(); rec._h.fields = hrefs(h, rec, n); };

// ---- 20.4.104 XRECORD
DECODERS.XRECORD = (r, h, rec, ctx) => {
  const n = r.BL();
  const end = r.pos + n * 8;
  rec.data = [];
  try {
    while (r.pos < end) {
      const code = r.RS();
      rec.data.push([code, xrecordValue(r, code, ctx)]);
    }
  } catch (e) { rec._xrecError = e.message; }
  r.pos = end;
  if (ctx.ver >= 15) rec.cloning = r.BS();
  rec._h.objids = restHandles(h, rec);
};
function xrecordValue(r, code, ctx) {
  const t = groupType(code);
  switch (t) {
    case 'str': {
      if (ctx.ver >= 21) { const n = r.RSu(); let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(r.RSu()); return s; }
      const n = r.RSu(); r.RC(); return ctx.decode(r.bytes(n));
    }
    case 'pt3': return r.RD3();
    case 'pt2': return r.RD2();
    case 'dbl': return r.RD();
    case 'i8': return r.RC();
    case 'i16': return r.RS();
    case 'i32': return r.RLs();
    case 'i64': return r.RLL();
    case 'hnd': { const b = r.bytes(8); let v = 0; for (let i = 7; i >= 0; i--) v = v * 256 + b[i]; return v.toString(16).toUpperCase(); }
    case 'bin': { const n = r.RC(); return hexBytes(r.bytes(n)); }
    case 'bool': return r.RC();
    default: throw new DwgReadError(msg('ccdwg.err.xrecord_code', { code }));
  }
}
/** DXF group code → value kind (public DXF reference ranges). */
export function groupType(c) {
  if (c >= 0 && c <= 9) return 'str';
  if (c >= 10 && c <= 39) return 'pt3';
  if (c >= 40 && c <= 59) return 'dbl';
  if (c >= 60 && c <= 79) return 'i16';
  if (c >= 90 && c <= 99) return 'i32';
  if (c === 100 || c === 101 || c === 102) return 'str';
  if (c === 105) return 'hnd';
  if (c >= 110 && c <= 149) return c <= 139 ? 'pt3' : 'dbl';
  if (c >= 160 && c <= 169) return 'i64';
  if (c >= 170 && c <= 179) return 'i16';
  if (c >= 210 && c <= 239) return 'pt3';
  if (c >= 270 && c <= 279) return 'i16';
  if (c >= 280 && c <= 289) return 'i8';
  if (c >= 290 && c <= 299) return 'bool';
  if (c >= 300 && c <= 309) return 'str';
  if (c >= 310 && c <= 319) return 'bin';
  if (c >= 320 && c <= 369) return 'hnd';
  if (c >= 370 && c <= 389) return 'i16';
  if (c >= 390 && c <= 399) return 'hnd';
  if (c >= 400 && c <= 409) return 'i16';
  if (c >= 410 && c <= 419) return 'str';
  if (c >= 420 && c <= 429) return 'i32';
  if (c >= 430 && c <= 439) return 'str';
  if (c >= 440 && c <= 459) return 'i32';
  if (c >= 460 && c <= 469) return 'dbl';
  if (c >= 470 && c <= 479) return 'str';
  if (c >= 480 && c <= 481) return 'hnd';
  if (c === 999) return 'str';
  if (c >= 1000 && c <= 1009) return 'str';
  if (c >= 1010 && c <= 1059) return c <= 1039 ? 'pt3' : 'dbl';
  if (c >= 1060 && c <= 1070) return 'i16';
  if (c === 1071) return 'i32';
  return null;
}

// ---- 20.4.48/86 MULTILEADER
DECODERS.MULTILEADER = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  if (ver >= 24) rec.mlVersion = r.BS();
  annotContext(r, h, rec, ctx);
  rec._h.style = h.H(rec.handle);
  rec.overrideFlags = r.BL(); rec.leaderType = r.BS(); rec.leaderColor = r.CMC(); rec._h.leaderLtype = h.H(rec.handle);
  rec.leaderLineweight = r.BL(); rec.landingEnabled = !!r.B(); rec.doglegEnabled = !!r.B(); rec.landingDistance = r.BD();
  rec._h.arrowhead = h.H(rec.handle); rec.arrowSize = r.BD(); rec.contentType = r.BS(); rec._h.textStyle = h.H(rec.handle);
  rec.textLeftAttach = r.BS(); rec.textRightAttach = r.BS(); rec.textAngleType = r.BS(); r.BS();
  rec.textColor = r.CMC(); rec.textFrame = !!r.B(); rec._h.blockStyle = h.H(rec.handle); rec.blockColor = r.CMC();
  rec.blockScale = r.BD3(); rec.blockRotation = r.BD(); rec.blockAttach = r.BS(); rec.annotative = !!r.B();
  if (ver < 24) {
    const na = r.BL(); rec.arrowheads = [];
    for (let i = 0; i < na; i++) rec.arrowheads.push({ isDefault: !!r.B(), _h: h.H(rec.handle) });
  }
  const nl = r.BL(); rec.blockLabels = [];
  for (let i = 0; i < nl; i++) rec.blockLabels.push({ _attdef: h.H(rec.handle), text: r.TV(), index: r.BS(), width: r.BD() });
  rec.textDirectionNegative = !!r.B(); rec.ipeAlign = r.BS(); rec.justification = r.BS(); rec.scale = r.BD();
  if (ver >= 24) { rec.attachDirection = r.BS(); rec.textTopAttach = r.BS(); rec.textBottomAttach = r.BS(); }
  if (ver >= 27) rec.extendToText = !!r.B();
};
DECODERS.MLEADER = DECODERS.MULTILEADER;
function annotContext(r, h, rec, ctx) {
  const ver = ctx.ver;
  const c = rec.context = { roots: [] };
  const nr = r.BL();
  for (let i = 0; i < nr; i++) {
    const root = { contentValid: !!r.B(), unknown: !!r.B(), connection: r.BD3(), direction: r.BD3(), breaks: [], lines: [] };
    const nb = r.BL();
    for (let k = 0; k < nb; k++) root.breaks.push([r.BD3(), r.BD3()]);
    root.index = r.BL(); root.landingDistance = r.BD();
    const nl = r.BL();
    for (let k = 0; k < nl; k++) {
      const line = { points: [] };
      const np = r.BL();
      for (let j = 0; j < np; j++) line.points.push(r.BD3());
      line.breakInfoCount = r.BL();
      if (line.breakInfoCount) {
        line.segmentIndex = r.BL();
        const ns = r.BL();
        line.breaks = [];
        for (let j = 0; j < ns; j++) line.breaks.push([r.BD3(), r.BD3()]);
      }
      line.index = r.BL();
      if (ver >= 24) {
        line.leaderType = r.BS(); line.color = r.CMC(); line._ltype = h.H(rec.handle); line.lineweight = r.BL();
        line.arrowSize = r.BD(); line._arrow = h.H(rec.handle); line.overrideFlags = r.BL();
      }
      root.lines.push(line);
    }
    if (ver >= 24) root.attachDirection = r.BS();
    c.roots.push(root);
  }
  c.scale = r.BD(); c.contentBase = r.BD3(); c.textHeight = r.BD(); c.arrowSize = r.BD(); c.landingGap = r.BD();
  c.leftAttach = r.BS(); c.rightAttach = r.BS(); c.textAlign = r.BS(); c.attachType = r.BS();
  c.hasText = !!r.B();
  if (c.hasText) {
    const t = c.text = {};
    t.label = r.TV(); t.normal = r.BD3(); t._style = h.H(rec.handle); t.location = r.BD3(); t.direction = r.BD3();
    t.rotation = r.BD(); t.width = r.BD(); t.height = r.BD(); t.lineSpacing = r.BD(); t.lineSpacingStyle = r.BS();
    t.color = r.CMC(); t.alignment = r.BS(); t.flow = r.BS(); t.bgColor = r.CMC(); t.bgScale = r.BD(); t.bgTransparency = r.BL();
    t.bgFill = !!r.B(); t.bgMask = !!r.B(); t.columnType = r.BS(); t.autoHeight = !!r.B(); t.columnWidth = r.BD();
    t.columnGutter = r.BD(); t.columnFlowReversed = !!r.B();
    const ncs = r.BL(); t.columnSizes = []; for (let i = 0; i < ncs; i++) t.columnSizes.push(r.BD());
    t.wordBreak = !!r.B(); r.B();
  } else {
    c.hasBlock = !!r.B();
    if (c.hasBlock) {
      const b = c.block = {};
      b._block = h.H(rec.handle); b.normal = r.BD3(); b.location = r.BD3(); b.scale = r.BD3(); b.rotation = r.BD();
      b.color = r.CMC(); b.matrix = []; for (let i = 0; i < 16; i++) b.matrix.push(r.BD());
    }
  }
  c.basePoint = r.BD3(); c.baseDirection = r.BD3(); c.baseVertical = r.BD3(); c.normalReversed = !!r.B();
  if (ver >= 24) { c.topAttach = r.BS(); c.bottomAttach = r.BS(); }
}
DECODERS.MLEADERSTYLE = (r, h, rec, ctx) => {
  const ver = ctx.ver;
  if (ver >= 24) rec.styleVersion = r.BS();
  rec.contentType = r.BS(); rec.drawMLeaderOrder = r.BS(); rec.drawLeaderOrder = r.BS(); rec.maxPoints = r.BL();
  rec.firstAngle = r.BD(); rec.secondAngle = r.BD(); rec.leaderType = r.BS(); rec.leaderColor = r.CMC();
  rec._h.leaderLtype = h.H(rec.handle); rec.leaderLineweight = r.BL(); rec.landingEnabled = !!r.B(); rec.landingGap = r.BD();
  rec.doglegEnabled = !!r.B(); rec.landingDistance = r.BD(); rec.description = r.TV(); rec._h.arrowhead = h.H(rec.handle);
  rec.arrowSize = r.BD(); rec.textDefault = r.TV(); rec._h.textStyle = h.H(rec.handle);
  rec.leftAttach = r.BS(); rec.rightAttach = r.BS();
  // 20.4.87: "IsNewFormat" = R2010+, or extended data of ACAD_MLEADERVER (the only EED these objects carry)
  const newFormat = ver >= 24 || !!rec._eed;
  if (newFormat) rec.textAngleType = r.BS();
  rec.textAlign = r.BS(); rec.textColor = r.CMC(); rec.textHeight = r.BD(); rec.textFrame = !!r.B();
  if (newFormat) rec.alwaysAlignLeft = !!r.B();
  rec.alignSpace = r.BD(); rec._h.block = h.H(rec.handle); rec.blockColor = r.CMC(); rec.blockScale = r.BD3();
  rec.blockScaleEnabled = !!r.B(); rec.blockRotation = r.BD(); rec.blockRotationEnabled = !!r.B(); rec.blockConnection = r.BS();
  rec.scale = r.BD(); rec.changed = !!r.B(); rec.annotative = !!r.B(); rec.breakSize = r.BD();
  if (ver >= 24) { rec.attachDirection = r.BS(); rec.topAttach = r.BS(); rec.bottomAttach = r.BS(); }
};

// builder T (table-read.js) replaces the ACAD_TABLE / FIELDLIST decoders above and adds the table objects
Object.assign(DECODERS, TABLE_DECODERS);
