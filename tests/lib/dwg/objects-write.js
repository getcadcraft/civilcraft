/* SPDX-License-Identifier: Apache-2.0 */
/**
 * objects-write.js — DWG object, header-variable and class encoders for every version R2000–R2018 (cc-dwg,
 * Apache-2.0).
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: ch. 2 (bit codes), ch. 9 (header
 * variables), ch. 10 (classes), ch. 20 (common object/entity formats 20.1–20.2, prescriptions 20.4.x), ch. 28
 * (EED); and our own CivilCraft/CadCraft R2000 writer. Where the document is wrong or silent, the facts were
 * found by experiment — writing files and opening them in the ODA File Converter, LibreDWG and libdxfrw, which are
 * test-only black boxes (their behaviour observed, never their source read, never shipped; see PROVENANCE.md), or
 * printing files saved by AutoCAD (testfiles/dwg-samples) with LibreDWG's `dwgread -v5` and comparing field
 * positions. Each is marked "Spec gap:".
 *
 * Input: "records" prepared by write.js — plain objects with numeric handles already resolved:
 *   { t: 'LINE', h, owner, mode (entmode 0 owned | 1 paper | 2 model), layer, ltype: {flag, h}, color,
 *     transparency, ltscale, lw (lineweight index), invisible, plotstyle: {flag, h}, material: {flag, h},
 *     prev, next (R2000 entity chain), reactors: [h], xdic, eed: [{app: h, items: [[code, value]]}], …fields }
 * Output: the bytes of one object as stored in the AcDbObjects stream (MS size, [R2010+ handle-stream size],
 * bit data, CRC-16).
 */
import { BitWriter, ByteWriter, atLeast, encode1252, cleanText, umcBytes } from './bits-write.js';
import { HEADER_VARS, VERSION_NUM } from './header-vars.js';
import { crc8 as crc16 } from './crc.js';
import { groupType } from './objects-read.js';

export const TYPE = {
  TEXT: 1, ATTRIB: 2, ATTDEF: 3, BLOCK: 4, ENDBLK: 5, SEQEND: 6, INSERT: 7, MINSERT: 8, VERTEX_2D: 10, VERTEX_3D: 11,
  VERTEX_MESH: 12, VERTEX_PFACE: 13, VERTEX_PFACE_FACE: 14, POLYLINE_2D: 15, POLYLINE_3D: 16, ARC: 17, CIRCLE: 18, LINE: 19,
  DIMENSION_ORDINATE: 20, DIMENSION_LINEAR: 21, DIMENSION_ALIGNED: 22, DIMENSION_ANG3PT: 23, DIMENSION_ANG2LN: 24,
  DIMENSION_RADIUS: 25, DIMENSION_DIAMETER: 26, POINT: 27, '3DFACE': 28, POLYLINE_PFACE: 29, POLYLINE_MESH: 30, SOLID: 31,
  TRACE: 32, SHAPE: 33, VIEWPORT: 34, ELLIPSE: 35, SPLINE: 36, REGION: 37, '3DSOLID': 38, BODY: 39, RAY: 40, XLINE: 41,
  DICTIONARY: 42, OLE2FRAME: 74, MTEXT: 44, LEADER: 45, TOLERANCE: 46, MLINE: 47, BLOCK_CONTROL: 48, BLOCK_HEADER: 49, LAYER_CONTROL: 50,
  LAYER: 51, STYLE_CONTROL: 52, STYLE: 53, LTYPE_CONTROL: 56, LTYPE: 57, VIEW_CONTROL: 60, VIEW: 61, UCS_CONTROL: 62, UCS: 63,
  VPORT_CONTROL: 64, VPORT: 65, APPID_CONTROL: 66, APPID: 67, DIMSTYLE_CONTROL: 68, DIMSTYLE: 69, VPENT_CONTROL: 70,
  VPENT: 71, GROUP: 72, MLINESTYLE: 73, LWPOLYLINE: 77, HATCH: 78, XRECORD: 79, PLACEHOLDER: 80, LAYOUT: 82,
};
/** Types written through a class (number ≥ 500): the class table names them. */
export const CLASSED = {
  LAYOUT: { dxf: 'LAYOUT', cpp: 'AcDbLayout', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  DICTIONARYWDFLT: { dxf: 'ACDBDICTIONARYWDFLT', cpp: 'AcDbDictionaryWithDefault', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  PLACEHOLDER: { dxf: 'ACDBPLACEHOLDER', cpp: 'AcDbPlaceHolder', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  XRECORD: { dxf: 'XRECORD', cpp: 'AcDbXrecord', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  // 20.4.19 / 20.4.30: class properties as the spec lists them
  ARC_DIMENSION: { dxf: 'ARC_DIMENSION', cpp: 'AcDbArcDimension', app: 'ObjectDBX Classes', entity: true, proxy: 0x401 },
  LARGE_RADIAL_DIMENSION: { dxf: 'LARGE_RADIAL_DIMENSION', cpp: 'AcDbRadialDimensionLarge', app: 'ObjectDBX Classes', entity: true, proxy: 0x401 },
  // raster images (20.4.80–82, 91): the class names and flags DXF files carry in their CLASSES section
  IMAGE: { dxf: 'IMAGE', cpp: 'AcDbRasterImage', app: 'ISM', entity: true, proxy: 127 },
  IMAGEDEF: { dxf: 'IMAGEDEF', cpp: 'AcDbRasterImageDef', app: 'ISM', entity: false, proxy: 0 },
  IMAGEDEF_REACTOR: { dxf: 'IMAGEDEF_REACTOR', cpp: 'AcDbRasterImageDefReactor', app: 'ISM', entity: false, proxy: 1 },
  RASTERVARIABLES: { dxf: 'RASTERVARIABLES', cpp: 'AcDbRasterVariables', app: 'ISM', entity: false, proxy: 0 },
  WIPEOUT: { dxf: 'WIPEOUT', cpp: 'AcDbWipeout', app: 'WipeOut', entity: true, proxy: 127 },
  // PDF underlays (0.7 D7.24): class names and flags as the ODA File Converter writes them (the entity's class is PDFREFERENCE)
  PDFDEFINITION: { dxf: 'PDFDEFINITION', cpp: 'AcDbPdfDefinition', app: 'ObjectDBX Classes', entity: false, proxy: 1153 },
  PDFUNDERLAY: { dxf: 'PDFREFERENCE', cpp: 'AcDbPdfReference', app: 'ObjectDBX Classes', entity: true, proxy: 1153 },
  WIPEOUTVARIABLES: { dxf: 'WIPEOUTVARIABLES', cpp: 'AcDbWipeoutVariables', app: 'WipeOut', entity: false, proxy: 0 },
};
export const SOFT_OWN = 2, HARD_OWN = 3, SOFT_PTR = 4, HARD_PTR = 5;

// ---------------------------------------------------------------- the object writer: data, string and handle streams
/**
 * One object being written. Data bits go to `this` (a BitWriter); handles to `hnd`; from R2007 every TV string
 * goes to the string stream `str` (20.1: the "string stream" sits at the end of the data, before the handles).
 */
export class ObjWriter extends BitWriter {
  /** @param {boolean} inline handles stay in the data stream (the header section before R2007) */
  constructor(version, inline = false) {
    super(version, 256);
    this.hnd = new BitWriter(version, 64);
    this.str = new BitWriter(version, 64);
    this.hasStr = false;
    this.inline = inline;
  }
  TV(s) { if (this.r2007) { this.str.TU(s); this.hasStr = true; } else this.T8(s); }
  /** A handle in the handle stream (in the data stream when `inline`). */
  H(code, v = 0) { if (this.inline) super.H(code, v); else this.hnd.H(code, v); }
  /** A handle in the data stream (the object's own handle, HANDSEED, EED application handles). */
  Hd(code, v = 0) { super.H(code, v); }
  /**
   * Close the data: R2007+ appends the string stream, its size and the "present" bit (20.1). Returns endbit.
   * Spec gap: the size is the string data's length in bits, stored as an RS just before the flag bit (with a
   * second RS before it, and 0x8000 on the first, when it needs more than 15 bits) — read back from AutoCAD
   * files with dwgread -v5.
   */
  endData() {
    if (this.r2007) {
      if (this.hasStr) {
        this.append(this.str);
        const n = this.str.bit;
        if (n < 0x8000) this.RS(n);
        else { this.RS(n >>> 15); this.RS((n & 0x7FFF) | 0x8000); }
        this.B(1);
      } else this.B(0);
    }
    return this.bit;
  }
}

// ---------------------------------------------------------------- framing (20.1, 20.2)
function begin(w, type, rec) {
  w.OT(type);
  if (!w.r2010) { w.sizeAt = w.bit; w.RL(0); }   // R2000–R2007: size of the data in bits, patched at the end
  w.Hd(0, rec.h);
  writeEED(w, rec.eed);
}
/** Finish: patch the bit size, add the handle stream, frame with MS (+ R2010 handle-stream size) and CRC. */
function finish(w) {
  const endbit = w.endData();
  if (!w.r2010) w.patchRL(w.sizeAt, endbit);
  w.append(w.hnd);
  const data = w.bytes();
  const out = new ByteWriter(data.length + 8);
  out.MS(data.length);
  if (w.r2010) out.raw(umcBytes(data.length * 8 - endbit));
  out.raw(data);
  const all = out.bytes();
  const crc = crc16(0xC0C1, all);
  const res = new Uint8Array(all.length + 2);
  res.set(all); res[all.length] = crc & 0xFF; res[all.length + 1] = crc >> 8;
  return res;
}

/** Extended entity data (ch. 28): per application BS size, app handle (data stream), items. */
function writeEED(w, eed) {
  for (const e of eed || []) {
    const b = eedBytes(e.items, w);
    if (!b.length) continue;
    w.BS(b.length);
    w.Hd(5, e.app);
    for (const x of b) w.RC(x);
  }
  w.BS(0);
}
function eedBytes(items, w) {
  const o = new ByteWriter(64);
  for (const [code, v] of items || []) {
    switch (true) {
      case code === 1000: {
        o.RC(0);
        if (w.r2007) { const s = cleanText(v).slice(0, 255); o.RS(s.length); for (let i = 0; i < s.length; i++) o.RS(s.charCodeAt(i)); }
        // Spec gap: the code page after the length byte is big-endian (00 1E for ANSI_1252) — AutoCAD's R2000/R2004
        // files printed by dwgread -v5; written little-endian, the ODA File Converter (a test-only black box) rejected
        // ACAD's own xdata (MTEXTBEGIN …) in our file.
        else { const b = encode1252(v).slice(0, 255); o.RC(b.length); o.RC(0); o.RC(30); o.raw(b); }
        break;
      }
      case code === 1002: o.RC(2); o.RC(v === '}' ? 1 : 0); break;
      case code === 1003 || code === 1005: {
        o.RC(code - 1000);
        let x = BigInt(typeof v === 'number' ? v : parseInt(v, 16) || 0);
        const bytes = []; for (let i = 0; i < 8; i++) { bytes.unshift(Number(x & 0xFFn)); x >>= 8n; }
        o.raw(bytes);
        break;
      }
      case code === 1004: {   // the reader gives binary chunks as hex strings (read.js); programs may pass bytes
        const b = v instanceof Uint8Array ? v : typeof v === 'string' ? Uint8Array.from((v.match(/[0-9a-f]{2}/gi) || []).map((x) => parseInt(x, 16))) : new Uint8Array(0);
        o.RC(4); o.RC(Math.min(255, b.length)); o.raw(b.slice(0, 255)); break;
      }
      case code >= 1010 && code <= 1013: o.RC(code - 1000); o.RD(v?.x ?? v?.[0] ?? 0); o.RD(v?.y ?? v?.[1] ?? 0); o.RD(v?.z ?? v?.[2] ?? 0); break;
      case code >= 1040 && code <= 1042: o.RC(code - 1000); o.RD(+v || 0); break;
      case code === 1070: o.RC(70); o.RS(v | 0); break;
      case code === 1071: o.RC(71); o.RL(v | 0); break;
      default: break;
    }
  }
  return o.bytes();
}

// ---------------------------------------------------------------- common entity data (20.4.1, 20.4.2)
function entityCommon(w, r) {
  w.B(0);                                       // no proxy graphics
  w.BB(r.mode ?? 2);
  w.BL((r.reactors || []).length);
  if (w.r2004) w.B(r.xdic ? 0 : 1);             // XDic missing flag
  if (w.r2013) w.B(r.ds ? 1 : 0);               // binary data in the data store (ACIS entities: solid-write.js)
  // Spec gap: the "Nolinks" bit is written only up to R2000; files saved by AutoCAD 2004+ have no bit here
  // (the colour starts right after the XDic flag — dwgread -v5 on example_2004/2007/2010/2013.dwg).
  if (!w.r2004) w.B(r.prev === undefined ? 1 : 0);
  w.ENC(r.color, w.r2004 ? r.transparency : undefined);
  w.BD(r.ltscale ?? 1);
  w.BB(r.ltype?.flag ?? 0);
  w.BB(r.plotstyle?.flag ?? 0);
  if (w.r2007) { w.BB(r.material?.flag ?? 0); w.RC(r.shadow ?? 0); }
  if (w.r2010) { w.B(0); w.B(0); w.B(0); }     // full / face / edge visual style
  w.BS(r.invisible ? 1 : 0);
  w.RC(r.lw ?? 29);
  // handles
  if ((r.mode ?? 2) === 0) w.H(SOFT_PTR, r.owner);
  for (const x of r.reactors || []) w.H(SOFT_PTR, x);
  if (!w.r2004 || r.xdic) w.H(HARD_OWN, r.xdic || 0);
  if (!w.r2004 && r.prev !== undefined) { w.H(SOFT_PTR, r.prev || 0); w.H(SOFT_PTR, r.next || 0); }
  w.H(HARD_PTR, r.layer);
  if ((r.ltype?.flag ?? 0) === 3) w.H(HARD_PTR, r.ltype.h);
  if (w.r2007 && (r.material?.flag ?? 0) === 3) w.H(HARD_PTR, r.material.h);
  if ((r.plotstyle?.flag ?? 0) === 3) w.H(HARD_PTR, r.plotstyle.h);
}
/** Common non-entity data (20.1). */
function objectCommon(w, r) {
  w.BL((r.reactors || []).length);
  if (w.r2004) w.B(r.xdic ? 0 : 1);
  if (w.r2013) w.B(0);
  w.H(r.ownerCode ?? SOFT_PTR, r.owner || 0);
  for (const x of r.reactors || []) w.H(SOFT_PTR, x);
  if (!w.r2004 || r.xdic) w.H(HARD_OWN, r.xdic || 0);
}
/**
 * Table entry header. Spec gap: from R2007 the 64-flag and Xdep bits are gone — only the xref index BS follows
 * the name (dwgread -v5 on AutoCAD's own 2007/2010/2013 files).
 */
function tableEntry(w, name, flags = 0) {
  w.TV(name);
  if (!w.r2007) { w.B(flags & 64 ? 1 : 0); w.BS(0); w.B(flags & 16 ? 1 : 0); return; }   // 64-flag, xref index + 1, xdep
  // R2007+: no xref index (objects-read.js tableEntry); the 64-flag and xdep bits. Every entry had "BS 0" here, which
  // reads as 64-flag 1 and xdep 0: the same two bits, so only an xref-dependent entry (WL.15) changes
  w.B(1); w.B(flags & 16 ? 1 : 0);
}

const rad = (a) => { const t = 2 * Math.PI; let r = (+a || 0) % t; if (r < 0) r += t; return r; };
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const P = (p) => ({ x: num(p?.x), y: num(p?.y), z: num(p?.z) });
const isDefaultExtrusion = (e) => !e || (num(e.x) === 0 && num(e.y) === 0 && num(e.z, 1) === 1);
const BEx = (w, e) => (isDefaultExtrusion(e) ? w.BE() : w.BE(num(e.x), num(e.y), num(e.z, 1)));
const ext3 = (w, e) => (e ? w.BD3(num(e.x), num(e.y), num(e.z, 1)) : w.BD3(0, 0, 1));

// ---------------------------------------------------------------- encoders
const ENC = {};

// --- control objects (20.4.51, 53, 55, 57, 59, 61, 63, 65, 67, 69)
function control(w, r) {
  objectCommon(w, r);
  w.BL(r.count ?? r.entries.length);
  // Spec gap (our R2000 writer): the dimension-style table has one more RC (DXF 71, count of extra hard
  // handles) after its entry count; files saved by AutoCAD have it.
  if (r.t === 'DIMSTYLE_CONTROL') w.RC(0);
  for (const h of r.entries) w.H(SOFT_OWN, h);
  for (const h of r.hardEntries || []) w.H(HARD_OWN, h);
}
for (const k of ['BLOCK_CONTROL', 'LAYER_CONTROL', 'STYLE_CONTROL', 'LTYPE_CONTROL', 'VIEW_CONTROL', 'UCS_CONTROL', 'VPORT_CONTROL',
  'APPID_CONTROL', 'DIMSTYLE_CONTROL', 'VPENT_CONTROL']) ENC[k] = control;

// --- BLOCK HEADER (20.4.52)
ENC.BLOCK_HEADER = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name, r.xdep ? 16 : 0);
  w.B(r.anonymous ? 1 : 0); w.B(r.hasAttrs ? 1 : 0); w.B(r.isXref ? 1 : 0); w.B(r.overlaid ? 1 : 0);
  w.B(0);                                       // loaded
  // Spec gap (as objects-read.js reads it): xref and overlay records have no owned object count — they own no entities
  if (w.r2004 && !r.isXref && !r.overlaid) w.BL(r.owned.length);
  w.P3(r.base);
  w.TV(r.xrefPath || '');
  // R2000+: one non-zero RC per INSERT handle, then 0. Spec gap: AutoCAD 2004+ files carry the insert count
  // the same way (dwgread -v5).
  for (let i = 0; i < r.inserts.length; i++) w.RC(1);
  w.RC(0);
  w.TV(r.description || '');
  const pv = r.preview instanceof Uint8Array ? r.preview : null;
  w.BL(pv ? pv.length : 0);
  if (pv) for (const b of pv) w.RC(b);
  if (w.r2007) { w.BS(r.insertUnits ?? 0); w.B(r.explodable === false ? 0 : 1); w.RC(r.scalable === false ? 0 : 1); }
  w.H(HARD_PTR, 0);                             // xref block (NULL)
  w.H(HARD_OWN, r.block);
  if (!w.r2004) {
    if (!r.isXref && !r.overlaid) { w.H(SOFT_PTR, r.owned[0] || 0); w.H(SOFT_PTR, r.owned[r.owned.length - 1] || 0); }
  } else if (!r.isXref && !r.overlaid) for (const h of r.owned) w.H(HARD_OWN, h);
  w.H(HARD_OWN, r.endblk);
  for (const h of r.inserts) w.H(SOFT_PTR, h);
  w.H(HARD_PTR, r.layout || 0);
};

// --- LAYER (20.4.54)
ENC.LAYER = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name, r.xdep ? 16 : 0);   // xref-dependent: a linked drawing's layer (WL.15)
  const lwIndex = r.lwIndex ?? 31;
  w.BS((r.frozen ? 1 : 0) | (r.off ? 2 : 0) | (r.frozenNew ? 4 : 0) | (r.locked ? 8 : 0) | (r.plot === false ? 0 : 16) | ((lwIndex & 31) << 5));
  // Spec gap: "off" is the flag bit above; the colour index itself stays positive. The ODA reader turns a negative
  // index in an R2000 layer into -7 (white), so the DXF convention of a negative 62 is not used in the DWG.
  const c = r.color && r.color.rgb === undefined ? { index: Math.abs(r.color.index ?? 7) } : r.color;
  w.CMC(c);
  w.H(HARD_PTR, r.xrefBlock || 0);              // xref block (the link a dependent layer belongs to)
  w.H(HARD_PTR, r.plotstyle || 0);
  if (w.r2007) w.H(HARD_PTR, r.material || 0);
  w.H(HARD_PTR, r.ltype || 0);
  if (w.r2013) w.H(HARD_PTR, 0);                // visual style (spec: "unknown handle, always NULL")
};

// --- STYLE (20.4.56)
ENC.STYLE = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  w.B(r.vertical ? 1 : 0); w.B(r.shapeFile ? 1 : 0);
  w.BD(num(r.height)); w.BD(num(r.widthFactor, 1)); w.BD(num(r.oblique));
  w.RC(r.generation | 0); w.BD(num(r.lastHeight, 0.2));
  w.TV(r.font ?? 'txt'); w.TV(r.bigFont ?? '');
  w.H(HARD_PTR, 0);
};

// --- LTYPE (20.4.58)
ENC.LTYPE = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  w.TV(r.description || '');
  const els = r.elements || [];
  w.BD(num(r.patternLength, els.reduce((s, e) => s + Math.abs(num(e.length)), 0)));
  w.RC(65);
  w.RC(els.length);
  let textArea = false;
  for (const e of els) {
    w.BD(num(e.length)); w.BS(e.shape | 0); w.RD(num(e.offset?.x ?? e.offsetX)); w.RD(num(e.offset?.y ?? e.offsetY));
    w.BD(num(e.scale, 1)); w.BD(num(e.rotation)); w.BS(e.flags | 0);
    if ((e.flags | 0) & 2) textArea = true;
  }
  if (!w.r2007) for (let i = 0; i < 256; i++) w.RC(0);
  else if (textArea) for (let i = 0; i < 512; i++) w.RC(0);
  w.H(HARD_PTR, 0);
  for (const e of els) w.H(HARD_PTR, e.styleH || 0);
};

// --- UCS (20.4.62; 0.5 DR.8): a named UCS
ENC.UCS = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  const o = P(r.origin), x = P(r.xAxis), y = P(r.yAxis);
  w.BD3(o.x, o.y, o.z); w.BD3(x.x, x.y, x.z); w.BD3(y.x, y.y, y.z);
  w.BD(num(r.elevation)); w.BS(0); w.BS(0);    // R2000+: elevation, orthographic view type, orthographic type
  w.H(HARD_PTR, 0);                             // xref block
  w.H(HARD_PTR, 0); w.H(HARD_PTR, 0);           // base UCS, named UCS
};

// --- VPORT (20.4.64)
ENC.VPORT = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  const vh = num(r.viewHeight, 1), asp = num(r.aspect, 1.5);
  w.BD(vh); w.BD(vh * asp);
  w.RD2(num(r.center?.x), num(r.center?.y));
  w.P3(r.target); ext3(w, r.direction || { x: 0, y: 0, z: 1 });
  w.BD(num(r.twist)); w.BD(num(r.lens, 50)); w.BD(0); w.BD(0);
  w.bits(r.viewMode ?? 0b0000, 4);
  w.RC(0);                                      // render mode
  if (w.r2007) { w.B(1); w.RC(1); w.BD(0); w.BD(0); w.CMC({ index: 250 }); }
  w.RD2(num(r.lowerLeft?.x), num(r.lowerLeft?.y)); w.RD2(num(r.upperRight?.x, 1), num(r.upperRight?.y, 1));   // the pane's corners in the window (split screen)
  w.B(0); w.BS(1000); w.B(1);
  w.bits(0b11, 2);
  w.B(0); w.RD2(num(r.grid?.x, 10), num(r.grid?.y, 10));
  w.B(0); w.B(0); w.BS(0); w.BD(0); w.RD2(0, 0); w.RD2(num(r.snap?.x, 10), num(r.snap?.y, 10));
  w.B(0); w.B(1);
  w.BD3(0, 0, 0); w.BD3(1, 0, 0); w.BD3(0, 1, 0); w.BD(0); w.BS(0);
  if (w.r2007) { w.BS(7); w.BS(5); }
  w.H(HARD_PTR, 0);
  if (w.r2007) { w.H(SOFT_PTR, 0); w.H(HARD_PTR, 0); w.H(HARD_OWN, r.sun || 0); }   // sun: a copied SUN (nongraphic-write.js)
  w.H(HARD_PTR, 0); w.H(HARD_PTR, 0);
};

// --- VIEW (20.4.60): a named view, field for field as objects-read.js DECODERS.VIEW reads it
ENC.VIEW = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name, (r.flags | 0) & 64);
  w.BD(num(r.height, 1)); w.BD(num(r.width, 1));
  w.RD2(num(r.center?.x), num(r.center?.y));
  w.P3(P(r.target)); ext3(w, r.direction || { x: 0, y: 0, z: 1 });
  w.BD(num(r.twist)); w.BD(num(r.lensLength, 50)); w.BD(num(r.frontClip)); w.BD(num(r.backClip));
  w.bits((r.viewMode | 0) & 15, 4);
  w.RC(r.renderMode | 0);
  if (w.r2007) { w.B(r.useDefaultLights === false ? 0 : 1); w.RC(r.defaultLightingType ?? 1); w.BD(num(r.brightness)); w.BD(num(r.contrast)); w.CMC(r.ambientColor || { index: 250 }); }
  w.B(r.paperSpace ? 1 : 0);
  w.B(r.associatedUcs ? 1 : 0);
  if (r.associatedUcs) {
    w.P3(P(r.ucsOrigin)); w.P3(r.ucsXAxis ? P(r.ucsXAxis) : { x: 1, y: 0, z: 0 }); w.P3(r.ucsYAxis ? P(r.ucsYAxis) : { x: 0, y: 1, z: 0 });
    w.BD(num(r.ucsElevation)); w.BS(r.ucsOrthoType | 0);
  }
  if (w.r2007) w.B(r.cameraPlottable ? 1 : 0);
  w.H(HARD_PTR, 0);                             // xref block
  if (w.r2007) { w.H(SOFT_PTR, 0); w.H(HARD_PTR, 0); w.H(HARD_OWN, 0); }   // background, visual style, sun
  if (r.associatedUcs) { w.H(HARD_PTR, 0); w.H(HARD_PTR, 0); }            // base UCS, named UCS (the writer has no UCS table)
  if (w.r2007) w.H(SOFT_PTR, 0);                // live section
};

// --- APPID (20.4.66)
ENC.APPID = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  w.RC(0);                                      // unknown
  w.H(HARD_PTR, 0);
};

// --- DIMSTYLE (20.4.68); vars by DXF name, AutoCAD's imperial defaults
export const DIM_DEFAULTS = {
  DIMPOST: '', DIMAPOST: '', DIMSCALE: 1, DIMASZ: 0.18, DIMEXO: 0.0625, DIMDLI: 0.38, DIMEXE: 0.18, DIMRND: 0, DIMDLE: 0, DIMTP: 0,
  DIMTM: 0, DIMFXL: 1, DIMJOGANG: Math.PI / 4, DIMTFILL: 0, DIMTFILLCLR: 0, DIMTOL: 0, DIMLIM: 0, DIMTIH: 1, DIMTOH: 1, DIMSE1: 0,
  DIMSE2: 0, DIMTAD: 0, DIMZIN: 0, DIMAZIN: 0, DIMARCSYM: 0, DIMTXT: 0.18, DIMCEN: 0.09, DIMTSZ: 0, DIMALTF: 25.4, DIMLFAC: 1,
  DIMTVP: 0, DIMTFAC: 1, DIMGAP: 0.09, DIMALTRND: 0, DIMALT: 0, DIMALTD: 2, DIMTOFL: 0, DIMSAH: 0, DIMTIX: 0, DIMSOXD: 0,
  DIMCLRD: 0, DIMCLRE: 0, DIMCLRT: 0, DIMADEC: 0, DIMDEC: 4, DIMTDEC: 4, DIMALTU: 2, DIMALTTD: 2, DIMAUNIT: 0, DIMFRAC: 0,
  DIMLUNIT: 2, DIMDSEP: 46, DIMTMOVE: 0, DIMJUST: 0, DIMSD1: 0, DIMSD2: 0, DIMTOLJ: 1, DIMTZIN: 0, DIMALTZ: 0, DIMALTTZ: 0,
  DIMUPT: 0, DIMATFIT: 3, DIMFXLON: 0, DIMTXTDIRECTION: 0, DIMALTMZF: 100, DIMALTMZS: '', DIMMZF: 100, DIMMZS: '', DIMLWD: -2, DIMLWE: -2,
};
function dimVars(w, V, inHeader) {
  const g = (k) => (V[k] !== undefined ? V[k] : DIM_DEFAULTS[k]);
  const clr = (k) => { const c = g(k); return typeof c === 'number' ? { index: c } : c; };
  if (!inHeader) { w.TV(g('DIMPOST')); w.TV(g('DIMAPOST')); }
  for (const k of ['DIMSCALE', 'DIMASZ', 'DIMEXO', 'DIMDLI', 'DIMEXE', 'DIMRND', 'DIMDLE', 'DIMTP', 'DIMTM']) w.BD(num(g(k)));
  if (w.r2007) { w.BD(num(g('DIMFXL'))); w.BD(num(g('DIMJOGANG'))); w.BS(g('DIMTFILL') | 0); w.CMC(clr('DIMTFILLCLR')); }
  for (const k of ['DIMTOL', 'DIMLIM', 'DIMTIH', 'DIMTOH', 'DIMSE1', 'DIMSE2']) w.B(g(k) ? 1 : 0);
  w.BS(g('DIMTAD') | 0); w.BS(g('DIMZIN') | 0); w.BS(g('DIMAZIN') | 0);
  if (w.r2007) w.BS(g('DIMARCSYM') | 0);
  for (const k of ['DIMTXT', 'DIMCEN', 'DIMTSZ', 'DIMALTF', 'DIMLFAC', 'DIMTVP', 'DIMTFAC', 'DIMGAP', 'DIMALTRND']) w.BD(num(g(k)));
  w.B(g('DIMALT') ? 1 : 0); w.BS(g('DIMALTD') | 0);
  for (const k of ['DIMTOFL', 'DIMSAH', 'DIMTIX', 'DIMSOXD']) w.B(g(k) ? 1 : 0);
  // Spec gap: the DIMSTYLE object's three colours are CmColor (CMC) like the header's, not plain BS, from R2004.
  for (const k of ['DIMCLRD', 'DIMCLRE', 'DIMCLRT']) w.CMC(clr(k));
  for (const k of ['DIMADEC', 'DIMDEC', 'DIMTDEC', 'DIMALTU', 'DIMALTTD', 'DIMAUNIT', 'DIMFRAC', 'DIMLUNIT', 'DIMDSEP', 'DIMTMOVE', 'DIMJUST']) w.BS(g(k) | 0);
  w.B(g('DIMSD1') ? 1 : 0); w.B(g('DIMSD2') ? 1 : 0);
  for (const k of ['DIMTOLJ', 'DIMTZIN', 'DIMALTZ', 'DIMALTTZ']) w.BS(g(k) | 0);
  w.B(g('DIMUPT') ? 1 : 0); w.BS(g('DIMATFIT') | 0);
  if (w.r2007) w.B(g('DIMFXLON') ? 1 : 0);
  if (w.r2010) { w.B(g('DIMTXTDIRECTION') ? 1 : 0); w.BD(num(g('DIMALTMZF'))); w.TV(g('DIMALTMZS')); w.BD(num(g('DIMMZF'))); w.TV(g('DIMMZS')); }
}
ENC.DIMSTYLE = (w, r) => {
  objectCommon(w, r);
  tableEntry(w, r.name);
  const V = r.vars || {};
  dimVars(w, V, false);
  w.BS(V.DIMLWD ?? -2); w.BS(V.DIMLWE ?? -2);
  w.B(0);                                       // unknown (70 bit 1)
  w.H(HARD_PTR, 0);                             // xref block
  w.H(HARD_PTR, r.txsty || 0);
  w.H(HARD_PTR, r.ldrblk || 0); w.H(HARD_PTR, r.blk || 0); w.H(HARD_PTR, r.blk1 || 0); w.H(HARD_PTR, r.blk2 || 0);
  if (w.r2007) { w.H(HARD_PTR, r.dimltype || 0); w.H(HARD_PTR, r.ltex1 || 0); w.H(HARD_PTR, r.ltex2 || 0); }
};

// --- DICTIONARY (20.4.44), DICTIONARYWDFLT (20.4.45)
ENC.DICTIONARY = (w, r) => {
  objectCommon(w, r);
  w.BL(r.items.length);
  w.BS(r.cloning ?? 1); w.RC(r.hardOwner ? 1 : 0);
  for (const [name] of r.items) w.TV(name);
  for (const [, h] of r.items) w.H(r.hardOwner ? HARD_OWN : SOFT_OWN, h);
};
ENC.DICTIONARYWDFLT = (w, r) => { ENC.DICTIONARY(w, r); w.H(HARD_PTR, r.defaultEntry || 0); };

// --- ACDBPLACEHOLDER (no data of its own)
ENC.PLACEHOLDER = (w, r) => { objectCommon(w, r); };

// --- XRECORD (20.4.104): raw group-code data; records with r.data ([[code, value]…], handle values already mapped)
ENC.XRECORD = (w, r) => {
  objectCommon(w, r);
  const b = xrecordBytes(r.data || [], w.r2007);
  w.BL(b.length);
  for (const x of b) w.RC(x);
  w.BS(r.cloning ?? 1);
  for (const h of r.objids || []) w.H(SOFT_PTR, h);
};
/**
 * XRECORD data bytes (20.4.104) — the one encoder of every XRECORD the writer makes — every group code the way the
 * reader decodes it (objects-read.js groupType: the public DXF group-code ranges). Spec gap: 20.4.104 names
 * strings, shorts, doubles and points only; binary chunks (310–319) are RC length + bytes, 280–289 one byte,
 * 290–299 one byte, handles 8 bytes little-endian — found by reading AutoCAD/ODA xrecords (ACAD_XREC_ROUNDTRIP,
 * layer states) back with the same layout. Codes the reader cannot size are left out.
 */
function xrecordBytes(items, r2007) {
  const o = new ByteWriter(256);
  for (const [code, v] of items) {
    const t = groupType(code);
    if (!t) continue;
    o.RS(code);
    switch (t) {
      case 'str':
        if (r2007) { const st = cleanText(v); o.RS(st.length); for (let i = 0; i < st.length; i++) o.RS(st.charCodeAt(i)); }
        else { const b = encode1252(v); o.RS(b.length); o.RC(30); o.raw(b); }
        break;
      case 'pt3': o.RD(+v?.x || 0); o.RD(+v?.y || 0); o.RD(+v?.z || 0); break;
      case 'pt2': o.RD(+v?.x || 0); o.RD(+v?.y || 0); break;
      case 'dbl': o.RD(+v || 0); break;
      case 'i8': case 'bool': o.RC(v | 0); break;
      case 'i16': o.RS(v | 0); break;
      case 'i32': o.RL(v | 0); break;
      case 'i64': o.RLL(typeof v === 'bigint' ? v : BigInt(Math.trunc(+v || 0))); break;
      case 'hnd': o.RLL(BigInt('0x' + (String(v || '0').replace(/^0x/i, '') || '0'))); break;
      case 'bin': { const hex = String(v || ''); const n = Math.min(255, hex.length >> 1); o.RC(n); for (let i = 0; i < n; i++) o.RC(parseInt(hex.substr(i * 2, 2), 16)); break; }
    }
  }
  return o.bytes();
}

// --- MLINESTYLE (20.4.73)
ENC.MLINESTYLE = (w, r) => {
  objectCommon(w, r);
  w.TV(r.name || 'Standard'); w.TV(r.description || '');
  w.BS(0); w.CMC({ index: 256 }); w.BD(Math.PI / 2); w.BD(Math.PI / 2);
  w.RC(2);
  for (const off of [0.5, -0.5]) {
    w.BD(off); w.CMC({ index: 256 });
    // Spec: from R2018 the element linetype is a handle (by ByLayer linetype), before that a BS index
    if (w.r2018) w.H(HARD_PTR, r.ltByLayer || 0); else w.BS(32767);
  }
};

// --- LAYOUT (20.4.84)
ENC.LAYOUT = (w, r) => {
  objectCommon(w, r);
  const p = r.paper || {};
  w.TV(p.pageSetup || ''); w.TV(p.printer || 'none_device');
  w.BS(r.plotFlags ?? (r.tab ? 688 : 1712));
  for (const m of [p.left, p.bottom, p.right, p.top]) w.BD(num(m, 6.35));
  w.BD(num(p.w, 215.9)); w.BD(num(p.h, 279.4));
  w.TV(p.name || 'Letter_(8.50_x_11.00_Inches)');
  w.BD2(0, 0);
  w.BS(p.units ?? (r.tab ? 1 : 0)); w.BS(p.rotation ?? 1); w.BS(p.plotType ?? (r.tab ? 5 : 0));
  w.BD2(0, 0); w.BD2(0, 0);
  if (!w.r2004) w.T8('');                      // plot view name (R13–R2000; R2004+ uses a handle)
  w.BD(1); w.BD(num(p.drawingUnits, 1));
  w.TV(p.styleSheet || '');
  w.BS(p.scaleType ?? (r.tab ? 16 : 0)); w.BD(num(p.scale, 1));
  w.BD2(0, 0);
  if (w.r2004) { w.BS(0); w.BS(2); w.BS(300); }   // shade plot mode, resolution level, custom dpi
  w.TV(r.name);
  w.BL(r.tab | 0); w.BS(r.flags ?? 1);
  w.BD3(0, 0, 0);
  w.RD2(num(r.limits?.min?.x), num(r.limits?.min?.y)); w.RD2(num(r.limits?.max?.x, 12), num(r.limits?.max?.y, 9));
  w.P3(r.insbase); w.BD3(1, 0, 0); w.BD3(0, 1, 0);
  w.BD(0); w.BS(0);
  const e = r.extents || { min: { x: 1e20, y: 1e20, z: 1e20 }, max: { x: -1e20, y: -1e20, z: -1e20 } };
  w.P3(e.min); w.P3(e.max);
  // Spec gap: the viewport count is a BL, not an RL (AutoCAD's own R2004+ files, dwgread -v5).
  if (w.r2004) w.BL((r.viewports || []).length);
  if (w.r2004) w.H(HARD_PTR, 0);               // plot view
  if (w.r2007) w.H(SOFT_PTR, 0);               // visual style
  w.H(SOFT_PTR, r.block); w.H(SOFT_PTR, r.lastViewport || 0); w.H(HARD_PTR, 0); w.H(HARD_PTR, 0);
  if (w.r2004) for (const h of r.viewports || []) w.H(SOFT_PTR, h);
};

// ---------------------------------------------------------------- entities
ENC.BLOCK = (w, r) => { entityCommon(w, r); w.TV(r.name); };
ENC.ENDBLK = (w, r) => { entityCommon(w, r); };
ENC.SEQEND = (w, r) => { entityCommon(w, r); };

ENC.LINE = (w, r) => {
  entityCommon(w, r);
  const a = P(r.start), b = P(r.end), flat = !a.z && !b.z;
  w.B(flat ? 1 : 0);
  w.RD(a.x); w.DD(b.x, a.x); w.RD(a.y); w.DD(b.y, a.y);
  if (!flat) { w.RD(a.z); w.DD(b.z, a.z); }
  w.BT(num(r.thickness)); BEx(w, r.extrusion);
};
ENC.POINT = (w, r) => { entityCommon(w, r); w.P3(r.position); w.BT(num(r.thickness)); BEx(w, r.extrusion); w.BD(num(r.xAxisAngle)); };
ENC.CIRCLE = (w, r) => { entityCommon(w, r); w.P3(r.center); w.BD(num(r.radius)); w.BT(num(r.thickness)); BEx(w, r.extrusion); };
ENC.ARC = (w, r) => {
  entityCommon(w, r); w.P3(r.center); w.BD(num(r.radius)); w.BT(num(r.thickness)); BEx(w, r.extrusion);
  w.BD(rad(r.startAngle)); w.BD(rad(r.endAngle));
};
ENC.ELLIPSE = (w, r) => {
  entityCommon(w, r); w.P3(r.center); w.P3(r.majorAxis); ext3(w, r.extrusion);
  w.BD(num(r.ratio, 1)); w.BD(num(r.startParam)); w.BD(num(r.endParam, 2 * Math.PI));
};
ENC.RAY = (w, r) => { entityCommon(w, r); w.P3(r.start); w.P3(r.direction); };
ENC.XLINE = ENC.RAY;
// 20.4.88 OLE2FRAME (0.7 D7.23): flags, mode, the OLE2 data as the file had it, one unknown byte (0). The record's own fields are
// oleFlags / oleMode / data (a Uint8Array): `mode` is the entity's space (write.js sets it) and `flags` its common flags.
ENC.OLE2FRAME = (w, r) => {
  entityCommon(w, r);
  const d = r.data || new Uint8Array(0);
  w.BS(r.oleFlags | 0); w.BS(r.oleMode | 0); w.BL(d.length);
  for (let i = 0; i < d.length; i++) w.RC(d[i]);
  w.RC(0);
};
function corners(w, r) {
  entityCommon(w, r);
  w.BT(num(r.thickness)); w.BD(num(r.elevation ?? r.points?.[0]?.z));
  const pts = r.points;
  for (let i = 0; i < 4; i++) { const p = pts[i] || pts[pts.length - 1]; w.RD2(num(p.x), num(p.y)); }
  BEx(w, r.extrusion);
}
ENC.SOLID = corners; ENC.TRACE = corners;
ENC['3DFACE'] = (w, r) => {
  entityCommon(w, r);
  const p = [0, 1, 2, 3].map((i) => P(r.points[i] || r.points[r.points.length - 1]));
  const flags = r.invisibleEdges | 0;
  const zz = p.every((q) => !q.z);
  w.B(flags ? 0 : 1); w.B(zz ? 1 : 0);
  w.RD(p[0].x); w.RD(p[0].y); if (!zz) w.RD(p[0].z);
  for (let i = 1; i < 4; i++) { w.DD(p[i].x, p[i - 1].x); w.DD(p[i].y, p[i - 1].y); w.DD(p[i].z, p[i - 1].z); }
  if (flags) w.BS(flags);
};

/** TEXT data (20.4.3 R2000+), also the start of ATTRIB / ATTDEF. */
function textData(w, r) {
  const ins = P(r.insert), al = r.align ? P(r.align) : null;
  const ha = r.hAlign | 0, va = r.vAlign | 0;
  const hasAlign = !!al && (ha || va);
  const elev = num(ins.z), rot = num(r.rotation), wf = num(r.widthFactor, 1), obl = num(r.oblique), gen = r.generation | 0;
  w.RC((elev ? 0 : 1) | (hasAlign ? 0 : 2) | (obl ? 0 : 4) | (rot ? 0 : 8) | (wf !== 1 ? 0 : 0x10) | (gen ? 0 : 0x20) | (ha ? 0 : 0x40) | (va ? 0 : 0x80));
  if (elev) w.RD(elev);
  w.RD2(ins.x, ins.y);
  if (hasAlign) { w.DD(al.x, ins.x); w.DD(al.y, ins.y); }
  BEx(w, r.extrusion); w.BT(num(r.thickness));
  if (obl) w.RD(obl);
  if (rot) w.RD(rot);
  w.RD(num(r.height, 0.2));
  if (wf !== 1) w.RD(wf);
  w.TV(r.value ?? '');
  if (gen) w.BS(gen);
  if (ha) w.BS(ha);
  if (va) w.BS(va);
}
ENC.TEXT = (w, r) => { entityCommon(w, r); textData(w, r); w.H(HARD_PTR, r.style); };
/**
 * ATTRIB (20.4.4) / ATTDEF (20.4.5). R2010+ adds a version RC after the text data, R2018 an attribute type
 * (1 = single line). Multi-line attributes (an embedded MTEXT) are written as single-line ones.
 */
function attribTail(w, r) {
  if (w.r2010) w.RC(0);
  if (w.r2018) w.RC(1);
  w.TV(r.tag);
  w.BS(0);
  w.RC(r.flags | 0);
  if (w.r2007) w.B(r.lockPosition ? 1 : 0);
}
ENC.ATTRIB = (w, r) => { entityCommon(w, r); textData(w, r); attribTail(w, r); w.H(HARD_PTR, r.style); };
ENC.ATTDEF = (w, r) => {
  entityCommon(w, r); textData(w, r); attribTail(w, r);
  if (w.r2010) w.RC(0);
  w.TV(r.prompt ?? '');
  w.H(HARD_PTR, r.style);
};

ENC.MTEXT = (w, r) => {
  entityCommon(w, r);
  const ins = P(r.insert);
  const xa = r.xAxis ? P(r.xAxis) : { x: Math.cos(num(r.rotation)), y: Math.sin(num(r.rotation)), z: 0 };
  w.BD3(ins.x, ins.y, ins.z); ext3(w, r.extrusion); w.BD3(xa.x, xa.y, xa.z);
  w.BD(num(r.width));
  if (w.r2007) w.BD(num(r.rectHeight));
  w.BD(num(r.height, 0.2));
  w.BS(r.attach || 1); w.BS(r.direction || 1);
  w.BD(num(r.extHeight)); w.BD(num(r.extWidth));
  w.TV(r.value ?? '');
  w.H(HARD_PTR, r.style);                       // STYLE comes before the R2018 application handle
  w.BS(r.lineSpacingStyle || 1); w.BD(num(r.lineSpacing, 1)); w.B(0);
  if (w.r2004) {
    // background mask (0.5 WL.8): flags 1 = fill with its colour, 2 = the drawing window's colour; the scale (BD, see
    // objects-read.js), colour and transparency follow when flag 1 (or the R2018 text frame, 0x10) is on
    const bg = r.backgroundFlags | 0;
    w.BL(bg);
    if (bg & 1 || (w.r2018 && bg & 0x10)) { w.BD(num(r.backgroundScale, 1.5)); w.CMC(r.backgroundColor || { index: 7 }); w.BL(r.backgroundTransparency | 0); }
  }
  if (w.r2018) {
    // Spec gap (filled from AutoCAD 2018 files read with dwgread -v5): not annotative → class version 4, default
    // flag, the redundant geometry block and column type.
    w.B(1); w.BS(4); w.B(1);
    w.H(HARD_PTR, 0);                           // registered application
    w.BL(r.attach || 1); w.BD3(xa.x, xa.y, xa.z); w.BD3(ins.x, ins.y, ins.z);
    w.BD(num(r.width)); w.BD(num(r.rectHeight)); w.BD(num(r.extWidth)); w.BD(num(r.extHeight));
    w.BS(0);                                    // no columns
  }
};

function insertScale(w, s) {
  const sx = num(s?.x, 1), sy = num(s?.y, 1), sz = num(s?.z, 1);
  if (sx === 1 && sy === 1 && sz === 1) w.BB(3);
  else if (sx === sy && sx === sz) { w.BB(2); w.RD(sx); }
  else if (sx === 1) { w.BB(1); w.DD(sy, 1); w.DD(sz, 1); }
  else { w.BB(0); w.RD(sx); w.DD(sy, sx); w.DD(sz, sx); }
}
function insertTail(w, r) {
  if (r.attribs.length) {
    if (!w.r2004) { w.H(SOFT_PTR, r.attribs[0]); w.H(SOFT_PTR, r.attribs[r.attribs.length - 1]); }
    else for (const h of r.attribs) w.H(HARD_OWN, h);
    w.H(HARD_OWN, r.seqend);
  }
}
ENC.INSERT = (w, r) => {
  entityCommon(w, r);
  w.P3(r.insert); insertScale(w, r.scale); w.BD(num(r.rotation)); ext3(w, r.extrusion);
  w.B(r.attribs.length ? 1 : 0);
  if (w.r2004 && r.attribs.length) w.BL(r.attribs.length);
  w.H(HARD_PTR, r.block);
  insertTail(w, r);
};
ENC.MINSERT = (w, r) => {
  entityCommon(w, r);
  w.P3(r.insert); insertScale(w, r.scale); w.BD(num(r.rotation)); ext3(w, r.extrusion);
  w.B(r.attribs.length ? 1 : 0);
  if (w.r2004 && r.attribs.length) w.BL(r.attribs.length);
  w.BS(r.cols || 1); w.BS(r.rows || 1); w.BD(num(r.colSpacing)); w.BD(num(r.rowSpacing));
  w.H(HARD_PTR, r.block);
  insertTail(w, r);
};

// --- polylines and vertices (20.4.11–17, 33, 34)
function polyOwned(w, r) {
  if (w.r2004) { for (const h of r.vertices) w.H(HARD_OWN, h); }
  else { w.H(SOFT_PTR, r.vertices[0] || 0); w.H(SOFT_PTR, r.vertices[r.vertices.length - 1] || 0); }
  w.H(HARD_OWN, r.seqend);
}
ENC.POLYLINE_2D = (w, r) => {
  entityCommon(w, r);
  w.BS(r.flags | 0); w.BS(r.curveType | 0); w.BD(num(r.startWidth)); w.BD(num(r.endWidth));
  w.BT(num(r.thickness)); w.BD(num(r.elevation)); BEx(w, r.extrusion);
  if (w.r2004) w.BL(r.vertices.length);
  polyOwned(w, r);
};
ENC.POLYLINE_3D = (w, r) => {
  entityCommon(w, r);
  w.RC(r.splineFlags | 0); w.RC(r.closed ? 1 : 0);
  if (w.r2004) w.BL(r.vertices.length);
  polyOwned(w, r);
};
ENC.POLYLINE_PFACE = (w, r) => {
  entityCommon(w, r);
  w.BS(r.numVerts | 0); w.BS(r.numFaces | 0);
  if (w.r2004) w.BL(r.vertices.length);
  polyOwned(w, r);
};
ENC.POLYLINE_MESH = (w, r) => {
  entityCommon(w, r);
  w.BS(r.flags | 0); w.BS(r.curveType | 0); w.BS(r.m | 0); w.BS(r.n | 0); w.BS(r.mDensity | 0); w.BS(r.nDensity | 0);
  if (w.r2004) w.BL(r.vertices.length);
  polyOwned(w, r);
};
ENC.VERTEX_2D = (w, r) => {
  entityCommon(w, r);
  w.RC(r.flags | 0);
  w.P3({ x: r.point.x, y: r.point.y, z: 0 });
  const sw = num(r.startWidth), ew = num(r.endWidth, sw);
  if (sw && sw === ew) w.BD(-Math.abs(sw)); else { w.BD(sw); w.BD(ew); }
  w.BD(num(r.bulge));
  if (w.r2010) w.BL(r.id | 0);
  w.BD(num(r.tangent));
};
ENC.VERTEX_3D = (w, r) => { entityCommon(w, r); w.RC(r.flags | 0); w.P3(r.point); };
ENC.VERTEX_MESH = ENC.VERTEX_3D;
ENC.VERTEX_PFACE = ENC.VERTEX_3D;
ENC.VERTEX_PFACE_FACE = (w, r) => { entityCommon(w, r); for (let i = 0; i < 4; i++) w.BS(r.indices[i] | 0); };

ENC.LWPOLYLINE = (w, r) => {
  entityCommon(w, r);
  const v = r.vertices;
  const bulges = v.some((p) => num(p.bulge)) ? v.map((p) => num(p.bulge)) : null;
  const widths = r.constantWidth ? null : v.some((p) => num(p.startWidth) || num(p.endWidth)) ? v : null;
  const ids = w.r2010 && v.some((p) => p.id) ? v.map((p) => p.id | 0) : null;
  const elev = num(r.elevation), th = num(r.thickness), cw = num(r.constantWidth);
  const ex = !isDefaultExtrusion(r.extrusion);
  const flags = (ex ? 1 : 0) | (th ? 2 : 0) | (cw ? 4 : 0) | (elev ? 8 : 0) | (bulges ? 16 : 0) | (widths ? 32 : 0) |
    (r.plinegen ? 256 : 0) | (r.closed ? 512 : 0) | (ids ? 1024 : 0);
  w.BS(flags);
  if (cw) w.BD(cw);
  if (elev) w.BD(elev);
  if (th) w.BD(th);
  if (ex) w.BD3(num(r.extrusion.x), num(r.extrusion.y), num(r.extrusion.z, 1));
  w.BL(v.length);
  if (bulges) w.BL(v.length);
  if (ids) w.BL(v.length);
  if (widths) w.BL(v.length);
  w.RD2(num(v[0].x), num(v[0].y));
  for (let k = 1; k < v.length; k++) { w.DD(num(v[k].x), num(v[k - 1].x)); w.DD(num(v[k].y), num(v[k - 1].y)); }
  if (bulges) for (const b of bulges) w.BD(b);
  if (ids) for (const i of ids) w.BL(i);
  if (widths) for (const p of widths) { w.BD(num(p.startWidth)); w.BD(num(p.endWidth)); }
};

ENC.SPLINE = (w, r) => {
  entityCommon(w, r);
  const fit = r.fit || [], ctrl = r.control || [], knots = r.knots || [];
  const useFit = fit.length >= 2 && !ctrl.length;
  const closed = (r.flags | 0) & 1;
  if (w.r2013) {
    // Spec gap (AutoCAD 2013 files, dwgread -v5): the scenario is written as 1 even for fit-point splines; what
    // follows is decided by spline flags 1 — bit 1 "method fit points" (with bit 8 "use knot parameter" and the
    // knot parameter 0 = chord) → fit data, else control data with the knot parameter 15 (custom).
    w.BL(1);
    w.BL(useFit ? 9 | (closed ? 4 : 0) : (closed ? 4 : 0));
    w.BL(useFit ? (r.knotParam >= 0 && r.knotParam <= 2 ? r.knotParam : 0) : 15);
  } else w.BL(useFit ? 2 : 1);
  w.BL(r.degree || 3);
  const weights = ctrl.some((p) => p.w !== undefined && p.w !== 1) || (r.weights || []).some((x) => x !== 1);
  if (useFit) {
    w.BD(num(r.fitTolerance)); w.P3(r.startTangent); w.P3(r.endTangent); w.BL(fit.length);
    for (const p of fit) w.P3(p);
  } else {
    w.B(weights ? 1 : 0); w.B(closed ? 1 : 0); w.B((r.flags | 0) & 2 ? 1 : 0);
    w.BD(num(r.knotTolerance, 1e-10)); w.BD(num(r.controlTolerance, 1e-10));
    w.BL(knots.length); w.BL(ctrl.length); w.B(weights ? 1 : 0);
    for (const k of knots) w.BD(num(k));
    ctrl.forEach((p, i) => { w.P3(p); if (weights) w.BD(num(p.w ?? r.weights?.[i], 1)); });
  }
};

ENC.HATCH = (w, r) => {
  entityCommon(w, r);
  if (w.r2004) {
    const g = r.gradient;
    w.BL(g ? 1 : 0); w.BL(0); w.BD(num(g?.angle)); w.BD(num(g?.shift)); w.BL(g?.single ? 1 : 0); w.BD(num(g?.tint));
    const cols = g?.colors || [];
    w.BL(cols.length);
    for (const c of cols) { w.BD(num(c.value)); w.BS(0); w.BL((0xC2000000 | (num(c.rgb) & 0xFFFFFF)) | 0); w.RC(0); }
    w.TV(g?.name || '');
  }
  w.BD(num(r.elevation)); ext3(w, r.extrusion);
  w.TV(r.pattern || (r.solid ? 'SOLID' : 'ANSI31'));
  w.B(r.solid ? 1 : 0); w.B(0);               // solid, associative (boundary objects are not written)
  const loops = r.loops || [];
  w.BL(loops.length);
  let pixel = false;
  for (const l of loops) {
    const poly = !!l.polyline;
    const flag = ((l.flags | 0) & ~2 & ~0x200) | (poly ? 2 : 0);
    if (flag & 4) pixel = true;
    w.BL(flag);
    if (!poly) {
      w.BL(l.edges.length);
      for (const e of l.edges) {
        const t = { line: 1, arc: 2, ellipse: 3, spline: 4 }[e.type] || e.type;
        w.RC(t);
        if (t === 1) { w.RD2(num(e.start.x), num(e.start.y)); w.RD2(num(e.end.x), num(e.end.y)); }
        else if (t === 2) { w.RD2(num(e.center.x), num(e.center.y)); w.BD(num(e.radius)); w.BD(num(e.startAngle)); w.BD(num(e.endAngle)); w.B(e.ccw === false ? 0 : 1); }
        else if (t === 3) { w.RD2(num(e.center.x), num(e.center.y)); w.RD2(num(e.majorAxis.x), num(e.majorAxis.y)); w.BD(num(e.ratio, 1)); w.BD(num(e.startAngle)); w.BD(num(e.endAngle)); w.B(e.ccw === false ? 0 : 1); }
        else if (t === 4) {
          const ctl = e.control || [], kn = e.knots || [];
          const rational = ctl.some((p) => p.w !== undefined && p.w !== 1);
          w.BL(e.degree || 3); w.B(rational ? 1 : 0); w.B(e.periodic ? 1 : 0); w.BL(kn.length); w.BL(ctl.length);
          for (const k of kn) w.BD(num(k));
          for (const p of ctl) { w.RD2(num(p.x), num(p.y)); if (rational) w.BD(num(p.w, 1)); }
          if (w.r2010) {
            const fit = e.fit || [];
            w.BL(fit.length);
            if (fit.length) { for (const p of fit) w.RD2(num(p.x), num(p.y)); w.RD2(num(e.startTangent?.x), num(e.startTangent?.y)); w.RD2(num(e.endTangent?.x), num(e.endTangent?.y)); }
          }
        }
      }
    } else {
      const pl = l.polyline;
      const hasB = pl.vertices.some((p) => num(p.bulge));
      w.B(hasB ? 1 : 0); w.B(pl.closed === false ? 0 : 1);
      w.BL(pl.vertices.length);
      for (const p of pl.vertices) { w.RD2(num(p.x), num(p.y)); if (hasB) w.BD(num(p.bulge)); }
    }
    w.BL(0);                                    // no boundary objects
  }
  w.BS(r.style | 0); w.BS(r.patternType ?? 1);
  if (!r.solid) {
    w.BD(num(r.angle)); w.BD(num(r.scale, 1)); w.B(r.double ? 1 : 0);
    const lines = r.lines || [];
    w.BS(lines.length);
    for (const ln of lines) {
      w.BD(num(ln.angle)); w.BD2(num(ln.base?.x), num(ln.base?.y)); w.BD2(num(ln.offset?.x), num(ln.offset?.y));
      w.BS((ln.dashes || []).length);
      for (const d of ln.dashes || []) w.BD(num(d));
    }
  }
  if (pixel) w.BD(num(r.pixelSize, 1));
  const seeds = r.seeds || [];
  w.BL(seeds.length);
  for (const s of seeds) w.RD2(num(s.x), num(s.y));
};

// --- DIMENSION (20.4.22–29)
function dimCommon(w, r) {
  entityCommon(w, r);
  if (w.r2010) w.RC(0);                        // version
  ext3(w, r.extrusion);
  w.RD2(num(r.textMid?.x), num(r.textMid?.y));
  w.BD(num(r.elevation ?? r.textMid?.z));
  w.RC(r.flags1 ?? (r.textMidUser ? 0 : 1) | 0);
  w.TV(r.text ?? '');
  w.BD(num(r.textRotation)); w.BD(num(r.horizDir));
  w.P3(r.insScale || { x: 1, y: 1, z: 1 }); w.BD(num(r.insRotation));   // insertion scale and rotation of the block
  w.BS(r.attach || 5); w.BS(r.lineSpacingStyle || 1); w.BD(num(r.lineSpacing, 1)); w.BD(num(r.measurement));
  if (w.r2007) { w.B(0); w.B(r.flipArrow1 ? 1 : 0); w.B(r.flipArrow2 ? 1 : 0); }
  w.RD2(num(r.insert?.x), num(r.insert?.y));
}
function dimHandles(w, r) { w.H(HARD_PTR, r.dimstyle); w.H(HARD_PTR, r.block); }
ENC.DIMENSION_ORDINATE = (w, r) => {
  dimCommon(w, r); w.P3(r.defPoint); w.P3(r.xline1); w.P3(r.xline2); w.RC(r.ordinateX ? 1 : 0); dimHandles(w, r);
};
ENC.DIMENSION_LINEAR = (w, r) => {
  dimCommon(w, r); w.P3(r.xline1); w.P3(r.xline2); w.P3(r.defPoint); w.BD(num(r.obliqueAngle)); w.BD(num(r.angle)); dimHandles(w, r);
};
ENC.DIMENSION_ALIGNED = (w, r) => {
  dimCommon(w, r); w.P3(r.xline1); w.P3(r.xline2); w.P3(r.defPoint); w.BD(num(r.obliqueAngle)); dimHandles(w, r);
};
ENC.DIMENSION_ANG3PT = (w, r) => {
  dimCommon(w, r); w.P3(r.defPoint); w.P3(r.xline1); w.P3(r.xline2); w.P3(r.center); dimHandles(w, r);
};
ENC.DIMENSION_ANG2LN = (w, r) => {
  dimCommon(w, r); w.RD2(num(r.arcPoint?.x), num(r.arcPoint?.y)); w.P3(r.xline1); w.P3(r.xline2); w.P3(r.xline1End ?? r.center); w.P3(r.defPoint); dimHandles(w, r);
};
ENC.DIMENSION_RADIUS = (w, r) => { dimCommon(w, r); w.P3(r.defPoint); w.P3(r.chordPoint); w.BD(num(r.leaderLen)); dimHandles(w, r); };
ENC.DIMENSION_DIAMETER = (w, r) => { dimCommon(w, r); w.P3(r.chordPoint); w.P3(r.defPoint); w.BD(num(r.leaderLen)); dimHandles(w, r); };
ENC.ARC_DIMENSION = (w, r) => {
  dimCommon(w, r); w.P3(r.defPoint); w.P3(r.xline1); w.P3(r.xline2); w.P3(r.center);
  w.B(r.isPartial ? 1 : 0); w.BD(num(r.arcStart)); w.BD(num(r.arcEnd)); w.B(r.hasLeader ? 1 : 0); w.P3(r.leader1); w.P3(r.leader2);
  dimHandles(w, r);
};
ENC.LARGE_RADIAL_DIMENSION = (w, r) => {
  dimCommon(w, r); w.P3(r.defPoint); w.P3(r.chordPoint); w.BD(0); w.P3(r.overrideCenter); w.P3(r.jogPoint);
  dimHandles(w, r);
};

// --- IMAGE / WIPEOUT (20.4.80), IMAGEDEF (20.4.81), IMAGEDEF_REACTOR (20.4.82), RASTERVARIABLES (20.4.91)
function imageEntity(w, r) {
  entityCommon(w, r);
  w.BL(r.classVersion | 0); w.P3(r.insert); w.P3(r.u); w.P3(r.v); w.RD2(num(r.size?.x, 1), num(r.size?.y, 1));
  w.BS(r.displayFlags ?? 7); w.B(r.clipping ? 1 : 0); w.RC(r.brightness ?? 50); w.RC(r.contrast ?? 50); w.RC(r.fade | 0);
  if (w.r2010) w.B(r.clipMode ? 1 : 0);
  const clip = r.clip || [];
  const type = r.clipType === 1 && clip.length >= 2 ? 1 : 2;
  w.BS(type);
  if (type === 1) { w.RD2(num(clip[0].x), num(clip[0].y)); w.RD2(num(clip[1].x), num(clip[1].y)); }
  else { w.BL(clip.length); for (const p of clip) w.RD2(num(p.x), num(p.y)); }
  w.H(HARD_PTR, r.def || 0); w.H(HARD_OWN, r.defReactor || 0);
}
ENC.IMAGE = imageEntity;
ENC.WIPEOUT = imageEntity;
ENC.IMAGEDEF = (w, r) => {
  objectCommon(w, r);
  w.BL(r.classVersion | 0); w.RD2(num(r.size?.x, 1), num(r.size?.y, 1)); w.TV(r.fileName || '');
  w.B(r.loaded === false ? 0 : 1); w.RC(r.resUnits | 0); w.RD2(num(r.pixelSize?.x, 1), num(r.pixelSize?.y, 1));
};
ENC.IMAGEDEF_REACTOR = (w, r) => { objectCommon(w, r); w.BL(r.classVersion ?? 2); };
ENC.RASTERVARIABLES = (w, r) => { objectCommon(w, r); w.BL(0); w.BS(r.frame ?? 1); w.BS(r.quality ?? 1); w.BS(r.units | 0); };
/** WIPEOUTVARIABLES: not in the spec; AutoCAD's own (example_2018.dwg, dwgread -v5) hold one BS, the display frame. */
ENC.WIPEOUTVARIABLES = (w, r) => { objectCommon(w, r); w.BS(r.frame ?? 1); };

// --- PDFUNDERLAY / PDFDEFINITION (0.7 D7.24): layout found by black box, see objects-read.js DECODERS.PDFUNDERLAY
ENC.PDFUNDERLAY = (w, r) => {
  entityCommon(w, r);
  w.BD3(num(r.normal?.x), num(r.normal?.y), num(r.normal?.z, 1)); w.P3(r.insertion); w.BD(num(r.rotation)); w.BD3(num(r.scale?.x, 1), num(r.scale?.y, 1), num(r.scale?.z, 1));
  w.RC((r.flags ?? 2) & 255); w.RC(Math.min(100, Math.max(20, r.contrast ?? 100))); w.RC(Math.min(80, Math.max(0, r.fade | 0)));
  const clip = (r.clip || []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  w.BL(clip.length);
  for (const p of clip) w.RD2(p.x, p.y);
  w.H(HARD_PTR, r.def || 0);
};
ENC.PDFDEFINITION = (w, r) => { objectCommon(w, r); w.TV(r.file || ''); w.TV(String(r.page ?? '1')); };

// --- LEADER (20.4.47), TOLERANCE (20.4.49), MLINE (20.4.50), SHAPE (20.4.37)
ENC.LEADER = (w, r) => {
  entityCommon(w, r);
  w.B(0);
  w.BS(r.annotType ?? 3); w.BS(r.pathType | 0);
  const v = r.vertices || [];
  w.BL(v.length);
  for (const p of v) w.P3(p);
  w.P3(r.origin || v[0]); ext3(w, r.extrusion); w.P3(r.xDirection || { x: 1, y: 0, z: 0 }); w.P3(r.blockOffset);
  w.P3(r.endPointProj);
  // Spec gap (builder R's reader, ODA-saved R2007/R2010 leaders): from R2010 there is no box height/width.
  if (!w.r2010) { w.BD(num(r.boxHeight)); w.BD(num(r.boxWidth)); }
  w.B(r.hookLineOnX ? 1 : 0); w.B(r.arrowhead === false ? 0 : 1);
  w.BS(0); w.B(0); w.B(0);
  w.H(HARD_PTR, r.annotation || 0); w.H(HARD_PTR, r.dimstyle || 0);
};
ENC.TOLERANCE = (w, r) => {
  entityCommon(w, r);
  w.P3(r.insert); w.P3(r.xDirection || { x: 1, y: 0, z: 0 }); ext3(w, r.extrusion);
  w.TV(r.text ?? '');
  w.H(HARD_PTR, r.dimstyle || 0);
};
ENC.MLINE = (w, r) => {
  entityCommon(w, r);
  w.BD(num(r.scale, 1)); w.RC(r.justification | 0); w.P3(r.base || r.vertices[0]?.point); ext3(w, r.extrusion);
  w.BS(r.closed ? 3 : 1);
  const nl = r.lines;
  w.RC(nl); w.BS(r.vertices.length);
  for (const v of r.vertices) {
    w.P3(v.point); w.P3(v.direction); w.P3(v.miter);
    for (let k = 0; k < nl; k++) {
      const l = v.lines?.[k] || { segments: [], fill: [] };
      w.BS(l.segments.length); for (const x of l.segments) w.BD(num(x));
      w.BS(l.fill.length); for (const x of l.fill) w.BD(num(x));
    }
  }
  w.H(HARD_PTR, r.style || 0);
};
ENC.SHAPE = (w, r) => {
  entityCommon(w, r);
  w.P3(r.insert); w.BD(num(r.scale, 1)); w.BD(num(r.rotation)); w.BD(num(r.widthFactor, 1)); w.BD(num(r.oblique)); w.BD(num(r.thickness));
  w.BS(r.shapeNumber | 0); ext3(w, r.extrusion);
  w.H(HARD_PTR, r.style || 0);
};

// --- VIEWPORT (20.4.38)
ENC.VIEWPORT = (w, r) => {
  entityCommon(w, r);
  w.P3(r.center); w.BD(num(r.width, 1)); w.BD(num(r.height, 1));
  w.P3(r.viewTarget); ext3(w, r.viewDirection || { x: 0, y: 0, z: 1 });
  w.BD(num(r.twist)); w.BD(num(r.viewHeight, num(r.height, 1))); w.BD(num(r.lens, 50)); w.BD(0); w.BD(0); w.BD(0);
  w.RD2(num(r.viewCenter?.x), num(r.viewCenter?.y)); w.RD2(0, 0); w.RD2(10, 10); w.RD2(10, 10);
  w.BS(1000);
  if (w.r2007) w.BS(5);
  const frozen = r.frozenLayers || [];
  w.BL(frozen.length);
  w.BL(r.status ?? 0x8060);
  w.TV('');
  w.RC(0); w.B(0); w.B(0);
  w.BD3(0, 0, 0); w.BD3(1, 0, 0); w.BD3(0, 1, 0); w.BD(0); w.BS(0);
  if (w.r2004) w.BS(0);
  if (w.r2007) { w.B(1); w.RC(1); w.BD(0); w.BD(0); w.CMC({ index: 250 }); }
  for (const h of frozen) w.H(w.r2004 ? SOFT_PTR : HARD_PTR, h);
  w.H(SOFT_PTR, 0);                             // clip boundary
  if (!w.r2004) w.H(HARD_PTR, 0);              // viewport entity header (R2000)
  w.H(HARD_PTR, 0); w.H(HARD_PTR, 0);          // named UCS, base UCS
  if (w.r2007) { w.H(SOFT_PTR, 0); w.H(HARD_PTR, 0); w.H(SOFT_PTR, 0); w.H(HARD_OWN, 0); }
};

/** Encode one record. Returns null for an unknown type. */
export function encodeObject(rec, ctx) {
  if (rec.encode) return rec.encode(rec, ctx);   // records built by nongraphic-write.js / mleader-write.js / passthrough.js
  const enc = ENC[rec.t];
  if (!enc) return null;
  const type = CLASSED[rec.t] ? ctx.classNum(rec.t) : TYPE[rec.t];
  if (type === undefined) return null;
  const w = new ObjWriter(ctx.version);
  begin(w, type, rec);
  enc(w, rec);
  return finish(w);
}

// ---------------------------------------------------------------- classes (ch. 10, 5.8)
export function encodeClasses(classes, ctx) {
  const v = ctx.version;
  const w = new ObjWriter(v);
  const maxNum = classes.reduce((m, c) => Math.max(m, c.num), 499);
  if (w.r2007) { w.sizeAt = w.bit; w.RL(0); }   // R2007+: size in bits, counted from this field (5.8)
  if (w.r2004) { w.BS(maxNum); w.RC(0); w.RC(0); w.B(1); }
  for (const c of classes) {
    w.BS(c.num); w.BS(c.proxy | 0);
    w.TV(c.app); w.TV(c.cpp); w.TV(c.dxf);
    w.B(0); w.BS(c.entity ? 0x1F2 : 0x1F3);
    if (w.r2004) { w.BL(c.count | 0); w.BS(ctx.dwgVersion); w.BS(ctx.maint); w.BL(0); w.BL(0); }
  }
  const endbit = w.endData();
  if (w.r2007) w.patchRL(w.sizeAt, endbit);
  return { w, endbit };
}

// ---------------------------------------------------------------- header variables (ch. 9)
const julian = (d) => {
  const t = d instanceof Date ? d.getTime() : Date.now();
  const days = Math.floor(t / 86400000);
  return { day: days + 2440588, ms: t - days * 86400000 };
};
export { julian };
// framing and common parts for the encoders in nongraphic-write.js, mleader-write.js and passthrough.js
export { begin, finish, objectCommon, entityCommon, ENC, xrecordBytes };

/** Writer-side values for header variables the table gives no default for (AutoCAD's own new-drawing values). */
const HEADER_DEFAULTS = {
  UNKNOWN_9: 24, MENU: 'acad', DIMASO: 1, DIMSHO: 1, REGENMODE: 1, FILLMODE: 1, PSLTSCALE: 1, USRTIMER: 1, WORLDVIEW: 1,
  TILEMODE: 1, VISRETAIN: 1, PROXYGRAPHICS: 1, TREEDEPTH: 3020, LUNITS: 2, LUPREC: 4, ATTMODE: 1, SPLINESEGS: 8,
  SURFU: 6, SURFV: 6, SURFTYPE: 6, SURFTAB1: 6, SURFTAB2: 6, SPLINETYPE: 6, SHADEDGE: 3, SHADEDIF: 70, MAXACTVP: 64,
  ISOLINES: 4, TEXTQLTY: 50, LTSCALE: 1, TEXTSIZE: 0.2, TRACEWID: 0.05, SKETCHINC: 0.1, FACETRES: 0.5, CMLSCALE: 1,
  CELTSCALE: 1, PUCSXDIR: { x: 1, y: 0, z: 0 }, PUCSYDIR: { x: 0, y: 1, z: 0 }, UCSXDIR: { x: 1, y: 0, z: 0 }, UCSYDIR: { x: 0, y: 1, z: 0 },
  PLIMMIN: { x: 0, y: 0 }, PLIMMAX: { x: 12, y: 9 }, LIMMIN: { x: 0, y: 0 }, LIMMAX: { x: 12, y: 9 },
  TSTACKALIGN: 1, TSTACKSIZE: 70, SORTENTS: 127, HIDETEXT: 1, DIMASSOC: 2, OBSCUREDCOLOR: 257, INTERSECTIONCOLOR: 257,
  STEPSPERSEC: 2, STEPSIZE: 6, '3DDWFPREC': 2, LENSLENGTH: 50, SHOWHIST: 1, PSOLWIDTH: 0.25, PSOLHEIGHT: 4,
  LOFTANG1: Math.PI / 2, LOFTANG2: Math.PI / 2, LOFTPARAM: 7, LOFTNORMALS: 1, LATITUDE: 37.795, LONGITUDE: -122.394,
  TIMEZONE: -8000, LIGHTGLYPHDISPLAY: 1, TILEMODELIGHTSYNCH: 1, DWFFRAME: 2, INTERFERECOLOR: { index: 1 },
  CECOLOR: { index: 256 }, DIMLWD: -2, DIMLWE: -2, PSTYLEMODE: 1,
};
/** Header handle variables → the writer's fixed handles (write.js `H`). */
const HEADER_HANDLES = {
  CLAYER: 'clayer', TEXTSTYLE: 'textstyle', CELTYPE: 'celtype', CMATERIAL: 'cmaterial', DIMSTYLE: 'dimstyleCur', CMLSTYLE: 'cmlstyle',
  DIMTXSTY: 'textstyle', BLOCK_CONTROL_OBJECT: 'blockCtl', LAYER_CONTROL_OBJECT: 'layerCtl', STYLE_CONTROL_OBJECT: 'styleCtl',
  LINETYPE_CONTROL_OBJECT: 'ltypeCtl', VIEW_CONTROL_OBJECT: 'viewCtl', UCS_CONTROL_OBJECT: 'ucsCtl', VPORT_CONTROL_OBJECT: 'vportCtl',
  APPID_CONTROL_OBJECT: 'appidCtl', DIMSTYLE_CONTROL_OBJECT: 'dimstyleCtl', VPORT_ENTITY_HEADER_CONTROL_OBJECT: 'vpentCtl',
  DICTIONARY_ACAD_GROUP: 'groupDict', DICTIONARY_ACAD_MLINESTYLE: 'mlsDict', DICTIONARY_NAMED_OBJECTS: 'nod',
  DICTIONARY_LAYOUTS: 'layoutDict', DICTIONARY_PLOTSETTINGS: 'plotSettingsDict', DICTIONARY_PLOTSTYLES: 'plotStyleDict',
  DICTIONARY_MATERIALS: 'materialsDict', DICTIONARY_COLORS: 'colorsDict', DICTIONARY_VISUALSTYLE: 'visualStyleDict',
  BLOCK_RECORD_PAPER_SPACE: 'psBlockHdr', BLOCK_RECORD_MODEL_SPACE: 'msBlockHdr', LTYPE_BYLAYER: 'ltByLayer',
  LTYPE_BYBLOCK: 'ltByBlock', LTYPE_CONTINUOUS: 'ltContinuous',
};
/** Handle codes of the header handles (hard owner for the tables and the named-object dictionary). */
const HARD_OWNED = new Set(['BLOCK_CONTROL_OBJECT', 'LAYER_CONTROL_OBJECT', 'STYLE_CONTROL_OBJECT', 'LINETYPE_CONTROL_OBJECT', 'VIEW_CONTROL_OBJECT',
  'UCS_CONTROL_OBJECT', 'VPORT_CONTROL_OBJECT', 'APPID_CONTROL_OBJECT', 'DIMSTYLE_CONTROL_OBJECT', 'VPORT_ENTITY_HEADER_CONTROL_OBJECT', 'DICTIONARY_NAMED_OBJECTS']);

/**
 * The AcDb:Header data, written by walking builder R's shared table (header-vars.js, ch. 9) for the version.
 * H = the fixed handles (write.js), hv = header values by DXF name (model.header merged with computed ones).
 * Returns the ObjWriter (data + string + handle streams) and its endbit.
 */
export function encodeHeader(H, hv, ctx) {
  const ver = VERSION_NUM[ctx.version];
  const w = new ObjWriter(ctx.version, !atLeast(ctx.version, 'AC1021'));
  if (w.r2007) { w.sizeAt = w.bit; w.RL(0); }   // R2007+: size in bits, counted from this field
  const noExt = { x: 1e20, y: 1e20, z: 1e20 }, noExtMax = { x: -1e20, y: -1e20, z: -1e20 };
  const computed = {
    UNKNOWN_5: ctx.metric ? 'm' : '',
    EXTMIN: ctx.extents?.min || noExt, EXTMAX: ctx.extents?.max || noExtMax,
    PEXTMIN: ctx.pextents?.min || noExt, PEXTMAX: ctx.pextents?.max || noExtMax,
    TDCREATE: julian(ctx.created), TDUPDATE: julian(ctx.updated || ctx.created),
    HANDSEED: ctx.handseed, FINGERPRINTGUID: ctx.guid(), VERSIONGUID: ctx.guid(),
  };
  const val = (name, def) => {
    if (name in computed) return computed[name];
    if (/^DIM/.test(name) && hv[name] === undefined && DIM_DEFAULTS[name] !== undefined) return DIM_DEFAULTS[name];
    return hv[name] ?? HEADER_DEFAULTS[name] ?? def;
  };
  for (const e of HEADER_VARS) {
    if (ver < e.from || ver > e.to) continue;
    const name = e.name, v = val(name, e.def);
    switch (e.type) {
      case 'B': w.B(v ? 1 : 0); break;
      case 'BS': w.BS(v | 0); break;
      case 'BL':
        if (name === 'FLAGS') w.BL(29 | 0x200 | 0x800 | (val('PSTYLEMODE', 1) ? 0x2000 : 0));   // CELWEIGHT ByLayer, LWDISPLAY off, EXTNAMES
        else w.BL(v | 0);
        break;
      case 'BLL': w.BLL(v || 0); break;
      case 'BD': w.BD(num(+v, 0)); break;
      case 'RC': w.RC(v | 0); break;
      case 'RS': w.RS(v | 0); break;
      case 'RL': w.RL(v | 0); break;
      case 'TV': w.TV(v ?? ''); break;
      case 'T': w.T8(v ?? ''); break;
      case 'CMC': w.CMC(typeof v === 'number' ? { index: v } : (v || { index: 256 })); break;
      case '3BD': w.BD3(num(v?.x), num(v?.y), num(v?.z)); break;
      case '2RD': w.RD2(num(v?.x), num(v?.y)); break;
      case 'TD': w.BL(v.day); w.BL(v.ms); break;
      case 'TS': w.BL(0); w.BL(0); break;
      case 'HS': w.Hd(0, v); break;
      case 'H':
        if (name === 'CPSNID') { if ((val('CEPSNTYPE', 0) | 0) !== 3) break; }
        w.H(HARD_OWNED.has(name) ? HARD_OWN : HARD_PTR, HEADER_HANDLES[name] ? H[HEADER_HANDLES[name]] || 0 : 0);
        break;
      default: throw new Error('header type ' + e.type);   // i18n-ignore: an internal check (the writer's own header table)
    }
  }
  const endbit = w.endData();
  if (w.r2007) w.patchRL(w.sizeAt, endbit);
  return { w, endbit };
}
