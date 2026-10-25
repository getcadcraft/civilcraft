/* SPDX-License-Identifier: Apache-2.0 */
/**
 * read.js — readDwg(bytes) → Model. cc-dwg (Apache-2.0), written from the ODA "Open Design Specification
 * for .dwg files" v5.4.1: ch. 9 (header section framing), 10 (classes), 23 (object map), 20 (objects),
 * 22 (template / MEASUREMENT), plus the containers (container-read.js, r2007.js).
 *
 *   readDwg(bytes, { strict = false, raw = false }) → Model (model.js)
 *     never throws on a damaged object: it is noted in report.notes and left out (or kept as UNKNOWN);
 *     a file it cannot open at all returns a Model with report.error set (strict: throws instead).
 *     raw: also return model._records (every decoded record by handle) for tests.
 */

import { fitSplineControl } from './spline-fit.js';
import { msg } from './messages.js';
import { readContainer, SENTINELS, UnsupportedDwg } from './container-read.js';
import { BitReader, codepageDecoder, readMC, readMCu, readMS, mod, DwgReadError } from './bits-read.js';
import { decodeHeaderVars } from './header-vars.js';
import { decodeObject, stringStreamStart } from './objects-read.js';
import { readDynamic } from './dynblock-read.js';   // 0.5 DB.2: dynamic blocks (after the model is built)
import { crc8 } from './crc.js';
import { newModel, handleHex, lineweightFromIndex, transparencyFromWord } from './model.js';
import { captureRaw } from './passthrough.js';
import { readMleader, readMleaderStyle } from './mleader-read.js';
import { tableEntityFields, tableObjectFields } from './table-read.js';   // builder T
import { attachDataStorage, solidFields } from './solid-read.js';   // builder S: ACIS entities, R2013+ data storage
import { surfaceFields } from './surface-read.js';   // SURFACE family (ACIS + type fields)

const sameBytes = (b, at, sig) => { for (let i = 0; i < sig.length; i++) if (b[at + i] !== sig[i]) return false; return true; };

export function readDwg(bytes, opts = {}) {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  const model = newModel();
  const notes = model.report.notes;
  let c;
  try {
    c = readContainer(bytes);
  } catch (e) {
    if (opts.strict) throw e;
    model.version = String.fromCharCode(...bytes.subarray(0, 6)).replace(/[^\x20-\x7e]/g, '?');
    model.report.error = e.message;
    notes.push(e instanceof UnsupportedDwg ? e.message : msg('ccdwg.open.failed', { reason: e.message }));
    return model;
  }
  model.version = c.version;
  model.maintenance = c.maintenance;
  notes.push(...c.notes);
  const cp = codepageDecoder(c.codepageNum);
  model.codepage = cp.name;
  if (!cp.known) notes.push(msg('ccdwg.read.codepage', { num: c.codepageNum, name: cp.name }));
  const ver = c.ver;
  const ctx = { ver, maint: c.maintenance, decode: cp.decode, classes: new Map(), strict: !!opts.strict, notes };

  // ---- header variables (ch. 9)
  try {
    model.header = readHeaderSection(c.sections['AcDb:Header'], ctx);
  } catch (e) {
    if (opts.strict) throw e;
    notes.push(msg('ccdwg.read.header_failed', { reason: e.message }));
  }
  model.header.ACADVER = c.version;
  model.header.ACADMAINTVER = c.maintenance;
  model.header.DWGCODEPAGE = cp.name;
  if (model.header.OBSCUREDCOLOR !== undefined) model.header.OBSCOLOR = model.header.OBSCUREDCOLOR;   // DXF names
  if (model.header.OBSCUREDLTYPE !== undefined) model.header.OBSLTYPE = model.header.OBSCUREDLTYPE;
  if (model.header.FLAGS !== undefined) model.header.CELWEIGHT = lineweightFromIndex(model.header.FLAGS & 0x1F);   // DXF value
  // MEASUREMENT lives in AcDb:Template (ch. 22)
  const tpl = c.sections['AcDb:Template'];
  // Spec gap: ch. 22 gives the description length in bytes; from R2007 it is a character count of UTF-16
  // text (an empty description is stored as 1 character, the NUL) — found by experiment.
  if (tpl && tpl.length >= 4) {
    const n = (tpl[0] | (tpl[1] << 8)) * (ver >= 21 ? 2 : 1);
    if (2 + n + 2 <= tpl.length) {
      model.header.MEASUREMENT = tpl[2 + n] | (tpl[3 + n] << 8);
      if (n) model.header.TEMPLATE_DESCRIPTION = ver >= 21
        ? String.fromCharCode(...new Uint16Array(tpl.slice(2, 2 + n).buffer)).replace(/\0+$/, '')
        : cp.decode(tpl.subarray(2, 2 + n));
    }
  }

  // ---- classes (ch. 10)
  try {
    model.classes = readClassesSection(c.sections['AcDb:Classes'], ctx);
    for (const k of model.classes) ctx.classes.set(k.num, k);
  } catch (e) {
    if (opts.strict) throw e;
    notes.push(msg('ccdwg.read.classes_failed', { reason: e.message }));
  }

  // ---- object map (ch. 23) and objects (ch. 20)
  let map;
  try { map = readObjectMap(c.sections['AcDb:Handles'], ctx); }
  catch (e) {
    if (opts.strict) throw e;
    notes.push(msg('ccdwg.read.map_failed', { reason: e.message }));
    map = new Map();
    ctx.mapTrouble = true;
  }
  const objs = c.sections['AcDb:AcDbObjects'];
  if (objs && (ctx.mapTrouble || !map.size || c.recovered)) {
    try {
      const added = scanObjects(objs, c.objectsAbsolute ? (c.objectsFrom || 0) : 4, objs.length, ctx, map);
      if (added) notes.push(msg('ccdwg.read.map_scanned', { n: added }));
    } catch (e) { if (opts.strict) throw e; }
  }
  const records = new Map();
  let damaged = 0, crcBad = 0;
  const damagedTypes = {};
  if (objs) {
    for (const [handle, off] of map) {
      let rec;
      try {
        rec = decodeObject(objs, off, ctx);
      } catch (e) {
        if (opts.strict) throw e;
        damaged++;
        if (damaged <= 20) notes.push(msg('ccdwg.read.object_failed', { handle: handleHex(handle), reason: e.message }));
        continue;
      }
      if (rec.handle !== handle) {
        damaged++;
        if (damaged <= 20) notes.push(msg('ccdwg.read.map_entry', { handle: handleHex(handle), other: handleHex(rec.handle) }));
        continue;
      }
      if (rec._crcBad) crcBad++;
      if (rec._error) {
        damagedTypes[rec.type] = (damagedTypes[rec.type] || 0) + 1;
        if (opts.strict) throw new DwgReadError(rec.type + ' ' + handleHex(handle) + ': ' + rec._error);
      }
      records.set(handle, rec);
    }
  } else notes.push(msg('ccdwg.read.no_objects'));
  if (damaged > 20) notes.push(msg('ccdwg.read.more_failed', { n: damaged - 20 }));
  if (crcBad) notes.push(msg('ccdwg.read.crc_failed', { n: crcBad }));
  for (const [t, n] of Object.entries(damagedTypes)) notes.push(msg('ccdwg.read.partial_type', { n, type: t }));
  if (ver >= 27) {   // builder S: ch. 24 ACIS data
    try { attachDataStorage(records, c.sections['AcDb:AcDsPrototype_1b'], notes); }
    catch (e) { if (opts.strict) throw e; notes.push(msg('ccdwg.read.section_failed', { name: 'AcDb:AcDsPrototype_1b', reason: e.message })); }
  }

  buildModel(model, records, ctx);
  try { readDynamic(model); } catch { /* never stops a read: the blocks stay as they are drawn */ }
  if (opts.raw) model._records = records;
  const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  model.report.ms = Math.round(t1 - t0);
  model.report.objects = records.size;
  return model;
}

// ---------------------------------------------------------------- ch. 9 header section
function readHeaderSection(sec, ctx) {
  if (!sec) throw new Error(msg('ccdwg.err.no_header'));
  if (!sameBytes(sec, 0, SENTINELS.header)) ctx.notes.push(msg('ccdwg.read.header_sentinel'));
  const d = new DataView(sec.buffer, sec.byteOffset, sec.byteLength);
  const size = d.getUint32(16, true);
  const ver = ctx.ver;
  // Spec gap: ch. 9 says the extra RL follows only for R2010/R2013 with maintenance > 3, and R2018+;
  // AutoCAD R2010 files with maintenance 2 do not have it (civil_example-imperial.dwg), maintenance 226 do.
  const p = dataStart(sec, ctx);
  const dataEnd = Math.min(sec.length, p + size);
  if (crc8(0xC0C1, sec, 16, dataEnd) !== d.getUint16(dataEnd, true)) ctx.notes.push(msg('ccdwg.read.header_crc'));
  if (ver < 21) {
    const r = new BitReader(sec, { version: ver, decode: ctx.decode, startBit: p * 8, endBit: dataEnd * 8 });
    const { vars, error } = decodeHeaderVars(r, ver);
    if (error) ctx.notes.push(msg('ccdwg.read.header_early', { reason: error }));
    return vars;
  }
  // R2007+: RL size in bits (counted from that RL), then data; strings in a string stream that ends at
  // the data end, handles after it (5.9). Spec gap: ch. 9 marks this RL "R2007 only"; R2010+ files have it too.
  const bits = d.getUint32(p, true);
  const endbit = p * 8 + bits;
  const r = new BitReader(sec, { version: ver, decode: ctx.decode, startBit: (p + 4) * 8, endBit: endbit });
  const ss = stringStreamStart(sec, endbit, (p + 4) * 8);
  const s = new BitReader(sec, { version: ver, decode: ctx.decode });
  if (ss !== -1) { s.pos = ss.start; s.end = ss.end; r.end = ss.start; } else { s.pos = s.end = 0; }
  r.str = s;
  const hr = new BitReader(sec, { version: ver, decode: ctx.decode, startBit: endbit, endBit: dataEnd * 8 });
  const { vars, error } = decodeHeaderVars(r, ver, { handles: hr });
  if (error) ctx.notes.push(msg('ccdwg.read.header_early', { reason: error }));
  return vars;
}

/**
 * Where the data of the header or classes section starts: after the RL size (20 bytes in), and for R2010/R2013 with
 * maintenance > 3 and R2018+ after one more RL (ch. 9/10). 0.6.1: programs other than AutoCAD do not all follow the
 * maintenance rule (the field they write is not always the one ch. 9 means), so when the section CRC disagrees with
 * the rule and agrees with the other layout, the other layout is read (noted once). Spec gap: found by experiment.
 */
function dataStart(sec, ctx) {
  const d = new DataView(sec.buffer, sec.byteOffset, sec.byteLength);
  const rule = ctx.ver >= 24 && (ctx.maint > 3 || ctx.ver >= 32) ? 24 : 20;
  if (ctx.ver < 24 || sec.length < 26) return rule;
  const size = d.getUint32(16, true);
  const crcOk = (p) => { const end = p + size; return end + 2 <= sec.length && crc8(0xC0C1, sec, 16, end) === d.getUint16(end, true); };
  if (crcOk(rule)) return rule;
  const other = rule === 24 ? 20 : 24;
  if (!crcOk(other)) return rule;
  if (!ctx.offsetNoted) { ctx.offsetNoted = true; ctx.notes.push(msg('ccdwg.read.header_offset')); }
  return other;
}

// ---------------------------------------------------------------- ch. 10 classes
function readClassesSection(sec, ctx) {
  if (!sec) throw new Error(msg('ccdwg.err.no_classes'));
  if (!sameBytes(sec, 0, SENTINELS.classes)) ctx.notes.push(msg('ccdwg.read.classes_sentinel'));
  const d = new DataView(sec.buffer, sec.byteOffset, sec.byteLength);
  const size = d.getUint32(16, true);
  const ver = ctx.ver;
  const p = dataStart(sec, ctx);
  const dataEnd = Math.min(sec.length, p + size);
  if (crc8(0xC0C1, sec, 16, dataEnd) !== d.getUint16(dataEnd, true)) ctx.notes.push(msg('ccdwg.read.classes_crc'));
  let r, endbit = dataEnd * 8;
  if (ver >= 21) {
    const bits = d.getUint32(p, true);
    endbit = p * 8 + bits;
    r = new BitReader(sec, { version: ver, decode: ctx.decode, startBit: (p + 4) * 8, endBit: endbit });
    const ss = stringStreamStart(sec, endbit, (p + 4) * 8);
    const s = new BitReader(sec, { version: ver, decode: ctx.decode });
    if (ss !== -1) { s.pos = ss.start; s.end = ss.end; r.end = ss.start; }
    r.str = s;
  } else r = new BitReader(sec, { version: ver, decode: ctx.decode, startBit: p * 8, endBit: dataEnd * 8 });
  let maxNum = Infinity;
  if (ver >= 18) { maxNum = r.BS(); r.RC(); r.RC(); r.B(); }
  const out = [];
  while (r.end - r.pos > 40) {
    const k = { num: r.BS(), proxyFlags: r.BS(), appName: r.TV(), cppName: r.TV(), dxfName: r.TV(), wasZombie: !!r.B() };
    const itemClass = r.BS();
    k.isEntity = itemClass === 0x1F2;
    if (ver >= 18) { k.instanceCount = r.BL(); k.dwgVersion = r.BS(); k.maintVersion = r.BS(); r.BL(); r.BL(); }
    if (k.num < 500 || k.num > 5000) { ctx.notes.push(msg('ccdwg.read.class_number', { num: k.num })); break; }
    out.push(k);
    if (k.num >= maxNum) break;
  }
  return out;
}

// ---------------------------------------------------------------- ch. 23 object map
function readObjectMap(sec, ctx) {
  if (!sec) throw new Error(msg('ccdwg.err.no_handles'));
  const map = new Map();
  let p = 0, bad = 0;
  // Spec gap: 23.1 says "last handle"/"last loc" start at 0 once; in files each page starts again from 0
  // (handles and offsets are deltas within the page) — the first entry of each page is absolute.
  while (p + 2 <= sec.length) {
    const size = (sec[p] << 8) | sec[p + 1];
    if (size <= 2) {
      // the last (empty) page; anything but zeros after it means the map was cut here by damage
      for (let i = p + 4; i < sec.length; i++) if (sec[i]) { ctx.mapTrouble = true; break; }
      break;
    }
    const end = p + size;
    if (end + 2 > sec.length) { ctx.notes.push(msg('ccdwg.read.map_short')); ctx.mapTrouble = true; break; }
    const crc = (sec[end] << 8) | sec[end + 1];
    if (crc8(0xC0C1, sec, p, end) !== crc) bad++;
    let q = p + 2, h = 0, loc = 0;
    while (q < end) {
      h += readMCu(sec, q); q = mod.pos;
      loc += readMC(sec, q); q = mod.pos;
      map.set(h, loc);
    }
    p = end + 2;
  }
  if (bad) { ctx.notes.push(msg('ccdwg.read.map_crc', { n: bad })); ctx.mapTrouble = true; }
  return map;
}

/**
 * 0.6.1 recovery: the objects of a section whose object map is missing or damaged, found by walking the section —
 * each object is MS size (+ MC handle-stream size from R2010), data, CRC (20.1, seed 0xC0C1) — and resynchronising
 * byte by byte where the CRC does not hold. Adds the handles the map does not have; returns how many. Bounded work.
 */
function scanObjects(buf, from, to, ctx, map) {
  const known = new Set(map.values());
  let p = from, added = 0, work = 0;
  const budget = 32 * (to - from) + 1e6;
  while (p + 4 < to) {
    if (work > budget) { ctx.notes.push(msg('ccdwg.read.scan_stopped')); break; }
    const size = readMS(buf, p);
    let q = mod.pos;
    if (ctx.ver >= 24) { readMCu(buf, q); q = mod.pos; }
    if (size >= 4 && q + size + 2 <= to) {
      work += size;
      if (crc8(0xC0C1, buf, p, q + size) === (buf[q + size] | (buf[q + size + 1] << 8))) {
        if (!known.has(p)) {
          try {
            const rec = decodeObject(buf, p, ctx);
            if (rec.handle > 0 && !map.has(rec.handle) && !/^TYPE_/.test(rec.type)) { map.set(rec.handle, p); added++; }
          } catch { /* not an object after all */ }
        }
        p = q + size + 2;
        continue;
      }
    }
    work++;
    p++;
  }
  return added;
}

// ---------------------------------------------------------------- model assembly
const hx = handleHex;
const SKIP_KEYS = new Set(['handle', 'typeNum', 'type', 'isEntity', 'className', 'color', 'ltscale', 'invisible']);
const SUB_TYPES = new Set(['VERTEX_2D', 'VERTEX_3D', 'VERTEX_MESH', 'VERTEX_PFACE', 'VERTEX_PFACE_FACE', 'SEQEND', 'ATTRIB', 'BLOCK', 'ENDBLK']);
const DIM_BASE = { DIMENSION_LINEAR: 0, DIMENSION_ALIGNED: 1, DIMENSION_ANG2LN: 2, DIMENSION_DIAMETER: 3, DIMENSION_RADIUS: 4, DIMENSION_ANG3PT: 5, DIMENSION_ORDINATE: 6 };
const TABLE_OF = { LAYER: 'layers', LTYPE: 'linetypes', STYLE: 'styles', DIMSTYLE: 'dimstyles', VIEW: 'views', UCS: 'ucs', VPORT: 'vports', APPID: 'appids', BLOCK_HEADER: 'blockRecords' };

/** Copy the public fields of a record (no _private, no handle-ref bag). */
function plain(rec) {
  const o = {};
  for (const k in rec) {
    if (k[0] === '_' || SKIP_KEYS.has(k)) continue;
    const v = rec[k];
    if (v instanceof Uint8Array) o[k] = b64(v);
    else o[k] = v;
  }
  return o;
}
function b64(u8) {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let s = ''; for (const c of u8) s += String.fromCharCode(c); return btoa(s);
}

function buildModel(model, records, ctx) {
  const buildErrors = { n: 0 };
  try { buildModelParts(model, records, ctx, buildErrors); }
  catch (err) { model.report.notes.push(msg('ccdwg.read.assembled_part', { reason: err.message })); }
  if (buildErrors.n) model.report.notes.push(msg('ccdwg.read.kept_common', { n: buildErrors.n }));
}
function buildModelParts(model, records, ctx, buildErrors) {
  const ver = ctx.ver, H = model.header, rep = model.report;
  const get = (h) => (h ? records.get(h) : undefined);
  const num = (hexStr) => (hexStr ? parseInt(hexStr, 16) : 0);
  const nameOf = (h) => { const r = get(h); return r && r.name !== undefined ? r.name : undefined; };
  const appName = (h) => nameOf(h) ?? hx(h);
  // 0.6.1: one record that cannot be put together costs that record (noted), never the whole drawing
  const fail = (what, err) => { buildErrors.steps = (buildErrors.steps || 0) + 1; if (buildErrors.steps <= 10) rep.notes.push(msg('ccdwg.read.step_failed', { what, reason: err && err.message })); };

  // ---- tables (control objects → entries)
  const controls = {
    blockRecords: H.BLOCK_CONTROL_OBJECT, layers: H.LAYER_CONTROL_OBJECT, styles: H.STYLE_CONTROL_OBJECT,
    linetypes: H.LINETYPE_CONTROL_OBJECT, views: H.VIEW_CONTROL_OBJECT, ucs: H.UCS_CONTROL_OBJECT,
    vports: H.VPORT_CONTROL_OBJECT, appids: H.APPID_CONTROL_OBJECT, dimstyles: H.DIMSTYLE_CONTROL_OBJECT,
  };
  const tableRecs = {};
  for (const [t, ch] of Object.entries(controls)) { try {
    const c = get(num(ch));
    const seen = new Set(), list = [];
    if (c && c._h.entries) for (const h of c._h.entries) { const r = get(h); if (r && !seen.has(h) && TABLE_OF[r.type] === t) { seen.add(h); list.push(r); } }
    // entries the control does not list (damaged control objects): add them in handle order
    for (const r of records.values()) if (TABLE_OF[r.type] === t && !seen.has(r.handle)) { seen.add(r.handle); list.push(r); }
    tableRecs[t] = list;
  } catch (err) { fail('tables', err); } }
  // Round-trip data of files saved down to R13/R14 (also kept by later saves): extension dictionary
  // ACAD_XREC_ROUNDTRIP, XRECORD [102 "EXTNAMES"] [1 short name] [2 long name] — the real (mixed-case, long)
  // table record name. Spec gap: not in the spec; found on R14/R13 files written by the ODA File Converter,
  // which reads the long names back the same way.
  for (const r of records.values()) { try {
    if (!TABLE_OF[r.type] || !r._h.xdic) continue;
    const d = get(r._h.xdic);
    if (!d || d.type !== 'DICTIONARY' || !d.names) continue;
    const k = d.names.indexOf('ACAD_XREC_ROUNDTRIP');
    const x = k >= 0 ? get(d._h.items[k]) : null;
    if (!x || x.type !== 'XRECORD' || !x.data) continue;
    const i = x.data.findIndex((g) => g[0] === 102 && g[1] === 'EXTNAMES');
    if (i >= 0 && x.data[i + 2] && x.data[i + 2][0] === 2 && x.data[i + 1][1] === r.name) { r._shortName = r.name; r.name = x.data[i + 2][1]; }
    // layers: [102 "LINEWEIGHT"] [280 index], [102 "PLOTBIT"] [280 0|1] (R13/R14 have neither field)
    if (r.type === 'LAYER' && ver < 15) {
      const lw = x.data.findIndex((g) => g[0] === 102 && g[1] === 'LINEWEIGHT');
      if (lw >= 0 && x.data[lw + 1]) r._lwIndex = x.data[lw + 1][1] & 0x1F;
      const pb = x.data.findIndex((g) => g[0] === 102 && g[1] === 'PLOTBIT');
      if (pb >= 0 && x.data[pb + 1]) r.plot = !!x.data[pb + 1][1];
    }
  } catch (err) { fail('ACAD_XREC_ROUNDTRIP', err); } }
  // R13/R14: the R2000+ header variables a save down keeps in the named dictionary ACDBHEADERROUNDTRIPXREC
  // (one XRECORD per variable). Spec gap: found on R13/R14 files from the ODA File Converter.
  if (ver < 15) { try {
    const nod = get(num(H.DICTIONARY_NAMED_OBJECTS));
    const k = nod && nod.names ? nod.names.indexOf('ACDBHEADERROUNDTRIPXREC') : -1;
    const d = k >= 0 ? get(nod._h.items[k]) : null;
    if (d && d.names) d.names.forEach((name, j) => {
      const x = get(d._h.items[j]);
      if (!x || x.type !== 'XRECORD' || !x.data || x.data.length !== 1 || H[name] !== undefined) return;
      H[name] = x.data[0][1];
    });
  } catch (err) { fail('ACDBHEADERROUNDTRIPXREC', err); } }
  // A dynamic block definition saved down to an older version becomes an anonymous "*U" block with the
  // real name in xdata AcDbDynamicBlockTrueName2; it gets its name back (as the ODA File Converter does).
  // (AcDbDynamicBlockTrueName — no "2" — marks the anonymous copy a dynamic block reference uses: that
  // block stays "*U…", its trueName is reported.) Spec gap: xdata conventions, found by experiment.
  // A "*U" record that owns an evaluation graph (xdictionary entry ACAD_ENHANCEDBLOCK) is the dynamic block's
  // definition itself, stored anonymous with AcDbDynamicBlockTrueName (no "2"): it takes its true name too (the ODA File
  // Converter's DXF names it so; its copies are the "*B"/"*U" records without a graph). Spec gap: found on AutoCAD's
  // blocks-and-tables sample (docs/DWG-DYNAMIC-BLOCKS.md). A name already used by another record is not taken.
  const ownsGraph = (r) => {
    const d = r._h && r._h.xdic ? get(r._h.xdic) : null;
    return !!(d && d.names && d.names.includes('ACAD_ENHANCEDBLOCK'));
  };
  const usedNames = new Set();
  for (const r of records.values()) if (r.type === 'BLOCK_HEADER' && r.name && !/^\*/.test(r.name)) usedNames.add(String(r.name).toUpperCase());
  for (const r of records.values()) { try {
    if (r.type !== 'BLOCK_HEADER' || !r._eed || !/^\*U/i.test(r.name)) continue;
    for (const x of r._eed) {
      const app = appName(x.app);
      if ((app === 'AcDbDynamicBlockTrueName2' || app === 'AcDbDynamicBlockTrueName') && x.items[0] && x.items[0][0] === 1000) {
        r._trueName = x.items[0][1];
        const rename = app === 'AcDbDynamicBlockTrueName2' || (ownsGraph(r) && r._trueName && !usedNames.has(String(r._trueName).toUpperCase()));
        if (rename) { r._storedName = r.name; r.name = r._trueName; usedNames.add(String(r.name).toUpperCase()); }
      }
    }
  } catch (err) { fail('AcDbDynamicBlockTrueName', err); } }
  // Anonymous block names. Spec gap: the file stores "*D", "*U", "*T", "*X" (and "*Paper_Space" for every
  // layout block); readers number them. Matching the ODA File Converter's DXF: the number is the record's
  // position in the BLOCK_CONTROL entry list, null entries skipped (the active paper space keeps "*Paper_Space").
  { try {
    const c = get(num(H.BLOCK_CONTROL_OBJECT));
    const psH = num(H.BLOCK_RECORD_PAPER_SPACE), msH = num(H.BLOCK_RECORD_MODEL_SPACE);
    const list = c && c._h.entries ? c._h.entries : [];
    let i = -1;
    list.forEach((h) => {
      if (!h) return;   // null entries (deleted blocks) are not counted
      i++;
      const r = get(h);
      if (!r || r.type !== 'BLOCK_HEADER' || h === psH || h === msH) return;
      if (/^\*[A-Za-z]$/.test(r.name) || /^\*Paper_Space$/i.test(r.name)) { r._storedName = r.name; r.name = r.name + i; }
    });
  } catch (err) { fail('BLOCK_CONTROL', err); } }
  const xdataOf = (rec) => {
    if (!rec._eed) return undefined;
    const x = {};
    for (const e of rec._eed) (x[appName(e.app)] || (x[appName(e.app)] = [])).push(...e.items);
    return x;
  };
  const commonObj = (rec) => {
    const o = { handle: hx(rec.handle) };
    if (rec._h.owner) o.owner = hx(rec._h.owner);
    const xd = xdataOf(rec); if (xd) o.xdata = xd;
    if (rec._h.xdic) o.extDict = hx(rec._h.xdic);
    if (rec._h.reactors && rec._h.reactors.length) o.reactors = rec._h.reactors.map(hx);
    return o;
  };
  const T = model.tables;
  for (const r of tableRecs.layers) { try {
    const lt = get(r._h.ltype);
    T.layers.push({
      ...commonObj(r), name: r.name,
      flags: (r.frozen ? 1 : 0) | (r.frozenNew ? 2 : 0) | (r.locked ? 4 : 0) | (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0),
      color: r.color, linetype: hx(r._h.ltype), linetypeName: lt ? lt.name : undefined,
      lineweight: r._lwIndex !== undefined ? lineweightFromIndex(r._lwIndex) : -3,
      plot: r.plot, off: !r.on, frozen: r.frozen, locked: r.locked, frozenInNewViewports: r.frozenNew,
      plotStyle: r._h.plotstyle ? hx(r._h.plotstyle) : undefined, material: r._h.material ? hx(r._h.material) : undefined,
    });
  } catch (err) { fail('LAYER', err); } }
  for (const r of tableRecs.linetypes) { try {
    T.linetypes.push({
      ...commonObj(r), name: r.name, flags: (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0), description: r.description,
      patternLength: r.patternLength,
      elements: r.elements.map((e, i) => {
        const o = { length: e.length };
        if (e.flags) { o.flags = e.flags; o.shape = e.shape; o.style = hx(r._h.shapes[i]); o.offset = e.offset; o.scale = e.scale; o.rotation = e.rotation; if (e.text !== undefined) o.text = e.text; }
        return o;
      }),
    });
  } catch (err) { fail('LTYPE', err); } }
  for (const r of tableRecs.styles) { try {
    T.styles.push({
      ...commonObj(r), name: r.name, flags: (r.isShapeFile ? 1 : 0) | (r.vertical ? 4 : 0) | (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0),
      height: r.height, widthFactor: r.widthFactor, oblique: r.oblique, generation: r.generation, lastHeight: r.lastHeight,
      font: r.font, bigFont: r.bigFont, shapeFile: r.isShapeFile,
    });
  } catch (err) { fail('STYLE', err); } }
  for (const r of tableRecs.dimstyles) { try {
    const vars = { ...r.vars };
    for (const k of ['DIMTXSTY', 'DIMLDRBLK', 'DIMBLK', 'DIMBLK1', 'DIMBLK2', 'DIMLTYPE', 'DIMLTEX1', 'DIMLTEX2']) {
      if (r._h[k] !== undefined) { vars[k] = hx(r._h[k]); const n = nameOf(r._h[k]); if (n !== undefined) vars[k + '_NAME'] = n; }
    }
    T.dimstyles.push({ ...commonObj(r), name: r.name, flags: (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0), vars });
  } catch (err) { fail('DIMSTYLE', err); } }
  for (const [t, list] of [['views', tableRecs.views], ['ucs', tableRecs.ucs], ['vports', tableRecs.vports], ['appids', tableRecs.appids]]) { try {
    for (const r of list) T[t].push({ ...commonObj(r), ...plain(r), flags: (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0) });
  } catch (err) { fail('tables', err); } }
  const msRec = num(H.BLOCK_RECORD_MODEL_SPACE), psRec = num(H.BLOCK_RECORD_PAPER_SPACE);
  for (const r of tableRecs.blockRecords) { try {
    const o = {
      ...commonObj(r), name: r.name, flags: blockFlags(r), layout: hx(r._h.layout),
      base: r.base, xrefPath: r.xrefPath, description: r.description,
    };
    if (r._trueName) o.trueName = r._trueName;
    if (r.insertUnits !== undefined) { o.insertUnits = r.insertUnits; o.explodable = r.explodable; o.scalable = r.scalable; }
    if (r.preview) o.preview = b64(r.preview);
    T.blockRecords.push(o);
  } catch (err) { fail('BLOCK_RECORD', err); } }

  // ---- entities
  const layerName = (h) => { const r = get(h); return r ? r.name : '0'; };
  const recSpace = new Map();   // block record handle → 'model' | 'paper'
  const layoutBlocks = new Set();
  for (const r of records.values()) if (r.type === 'LAYOUT' && r._h.block) layoutBlocks.add(r._h.block);
  for (const r of tableRecs.blockRecords) { try {
    if (r.handle === msRec || /^\*model_space$/i.test(r.name)) recSpace.set(r.handle, 'model');
    else if (r.handle === psRec || /^\*paper_space/i.test(r.name) || (layoutBlocks.has(r.handle) && String(r.name || '').startsWith('*'))) recSpace.set(r.handle, 'paper');
  } catch (err) { fail('LAYOUT', err); } }
  const ownerOf = (rec) => {
    if (rec._h.owner) return rec._h.owner;
    if (rec._entmode === 2) return msRec;
    if (rec._entmode === 1) return psRec;
    return 0;
  };
  const counts = rep.counts, unknown = rep.unknown;
  const bySpace = rep.countsBySpace = { model: {}, paper: {}, block: {} };
  const used = new Set();

  const convert = (rec, ownerHandle) => {
    used.add(rec.handle);
    const e = { handle: hx(rec.handle), type: rec.type, owner: hx(ownerHandle || ownerOf(rec)) };
    e.layer = layerName(rec._h.layer);
    const lf = rec._ltflags;
    e.linetype = ver < 15 ? (rec._bylayerlt ? 'ByLayer' : nameOf(rec._h.ltype) ?? hx(rec._h.ltype))
      : lf === 0 ? 'ByLayer' : lf === 1 ? 'ByBlock' : lf === 2 ? 'Continuous' : nameOf(rec._h.ltype) ?? hx(rec._h.ltype);
    e.color = rec.color || { index: 256 };
    e.lineweight = rec._lw !== undefined ? lineweightFromIndex(rec._lw) : -1;
    e.ltscale = rec.ltscale;
    e.invisible = rec.invisible;
    if (rec._transparency !== undefined) e.transparency = transparencyFromWord(rec._transparency);
    if (rec._h.material) e.material = hx(rec._h.material);
    if (rec._h.plotstyle) e.plotStyle = hx(rec._h.plotstyle);
    if (rec._h.colorBook) e.colorBook = hx(rec._h.colorBook);
    const xd = xdataOf(rec); if (xd) e.xdata = xd;
    // Spec gap: some writers (Revit's DWG export) leave the entity lineweight ByLayer and put the real one
    // in ACAD extended data: [1000 "RTLwPs"] [1070 128 + index]. The ODA File Converter applies it, so do we
    // (found by comparing client drawings with the converter's DXF).
    if (xd && xd.ACAD) {
      const a = xd.ACAD, k = a.findIndex((it) => it[0] === 1000 && it[1] === 'RTLwPs');
      if (k >= 0 && a[k + 1] && a[k + 1][0] === 1070 && a[k + 1][1] & 128) e.lineweight = lineweightFromIndex(a[k + 1][1] & 0x7F);
    }
    if (rec._h.xdic) e.extDict = hx(rec._h.xdic);
    if (rec._h.reactors && rec._h.reactors.length) e.reactors = rec._h.reactors.map(hx);
    if (rec._unknown) {
      e.type = 'UNKNOWN'; e.typeNum = rec.typeNum; e.dxfName = rec.type; e.className = rec.className || '';
      const raw = captureRaw(rec, ver); if (raw) e.raw = raw;   // passthrough.js
      if (rec._dataEnd !== undefined && rec._dataStart !== undefined) e.bits = rec._dataEnd - rec._dataStart;   // undecoded data bits
      unknown[rec.type] = (unknown[rec.type] || 0) + 1;
      return e;
    }
    try { Object.assign(e, typeFields(rec)); }
    catch (err) { e.damaged = (rec._error ? rec._error + '; ' : '') + 'model: ' + err.message; buildErrors.n++; return e; }
    if (rec._error) e.damaged = rec._error;
    return e;
  };

  // R2018 multi-line attributes saved down to R2004–R2013 become single-line attributes ("TAG_001", "TAG_002",
  // …, one per line) with the real one in XRECORD "ACAD_MLATT" of the first one's extension dictionary:
  // [70 type][70][70 n][340 the other lines' attributes…][40][2 tag][1 "Embedded Object"][10 insert][40 height]
  // [41 width][46 rect height][71 attach][72 direction][1 text][11 x axis][73][44 line spacing]. The first one
  // gets the tag, text and embedded MTEXT back; the others are folded into it. Spec gap: found by experiment.
  const mlattOf = (rec) => {
    const d = get(rec._h.xdic);
    if (!d || d.type !== 'DICTIONARY' || !d.names) return null;
    const k = d.names.indexOf('ACAD_MLATT');
    const x = k >= 0 ? get(d._h.items[k]) : null;
    return x && x.type === 'XRECORD' && x.data ? x.data : null;
  };
  const mlattFold = new Set();
  for (const r of records.values()) { try {
    if ((r.type !== 'ATTRIB' && r.type !== 'ATTDEF') || !r._h.xdic) continue;
    const data = mlattOf(r);
    if (data) for (const g of data) if (g[0] === 340) mlattFold.add(parseInt(g[1], 16));
  } catch (err) { fail('ACAD_MLATT', err); } }
  const applyMlatt = (rec, f) => {
    const data = mlattOf(rec);
    if (!data) return;
    const g = (code, nth = 0) => { for (const x of data) if (x[0] === code && nth-- === 0) return x[1]; return undefined; };
    const ti = data.findIndex((x) => x[0] === 2);
    if (ti < 0) return;
    const after = data.slice(ti + 1);
    const a = (code, nth = 0) => { for (const x of after) if (x[0] === code && nth-- === 0) return x[1]; return undefined; };
    f.attType = g(70);
    f.storedTag = f.tag; f.tag = data[ti][1];
    f.mtext = {
      insert: a(10), height: a(40), width: a(41), rectHeight: a(46), attach: a(71), direction: a(72),
      value: a(1, 1), xAxis: a(11), lineSpacingStyle: a(73), lineSpacing: a(44),
    };
    if (f.mtext.value !== undefined) { f.storedValue = f.value; f.value = f.mtext.value; }
  };

  const typeFields = (rec) => {
    const f = plain(rec);
    const H2 = rec._h;
    switch (rec.type) {
      case 'TEXT': case 'ATTRIB': case 'ATTDEF':
        f.style = nameOf(H2.style) ?? hx(H2.style);
        if (rec.type !== 'TEXT' && H2.xdic) applyMlatt(rec, f);
        break;
      case 'MTEXT': {
        f.style = nameOf(H2.style) ?? hx(H2.style);
        // R13/R14 have no line spacing fields; saves down to them keep them in ACAD xdata between
        // "MTEXTBEGIN" and "MTEXTEND" as DXF code/value pairs (73 style, 44 factor). Spec gap: found by experiment.
        const ax = rec._eed && rec._eed.find((x) => appName(x.app) === 'ACAD');
        if (ax && ver < 15) {
          const it = ax.items, b0 = it.findIndex((g) => g[1] === 'MTEXTBEGIN');
          if (b0 >= 0) for (let k = b0 + 1; k + 1 < it.length && it[k][1] !== 'MTEXTEND'; k += 2) {
            if (it[k][0] !== 1070) break;
            const code = it[k][1], v = it[k + 1][1];
            if (code === 73) f.lineSpacingStyle = v; else if (code === 44) f.lineSpacing = v; else if (code === 46) f.rectHeight = v;
          }
        }
        // Files saved down to an older version keep the newer MTEXT in its extension dictionary, XRECORD
        // "ACAD_MTEXT_RT" (group-1 chunks); the stored value is a simplified copy. Spec gap: not in the spec;
        // found on the corpus files the ODA File Converter saved as R2000 (it restores the same text).
        const dict = get(H2.xdic);
        if (dict && dict.type === 'DICTIONARY' && dict.names) {
          const k = dict.names.indexOf('ACAD_MTEXT_RT');
          const xr = k >= 0 ? get(dict._h.items[k]) : null;
          if (xr && xr.type === 'XRECORD' && xr.data) {
            const t = xr.data.filter((d) => d[0] === 1).map((d) => d[1]).join('');
            if (t) { f.storedValue = f.value; f.value = t; }
          }
        }
        break;
      }
      case 'SHAPE': f.style = nameOf(H2.style) ?? hx(H2.style); break;
      case 'INSERT': case 'MINSERT': {
        f.block = nameOf(H2.block) ?? hx(H2.block); f.blockRecord = hx(H2.block);
        const atts = [];
        let ah = H2.attribs;
        if (!ah && H2.firstAttrib) ah = chain(H2.firstAttrib, H2.lastAttrib);
        if (ah) for (const h of ah) {
          const a = get(h);
          if (a && a.type === 'ATTRIB') { if (mlattFold.has(h)) used.add(h); else atts.push(convert(a, rec.handle)); }
        }
        f.attribs = atts;
        if (H2.seqend) used.add(H2.seqend);
        break;
      }
      case 'POLYLINE_2D': case 'POLYLINE_3D': case 'POLYLINE_PFACE': case 'POLYLINE_MESH': {
        let vh = H2.vertices;
        if (!vh && H2.firstVertex) vh = chain(H2.firstVertex, H2.lastVertex);
        const verts = [], faces = [];
        for (const h of vh || []) {
          const v = get(h); if (!v || !v.type.startsWith('VERTEX')) continue;
          used.add(h);
          if (v.type === 'VERTEX_PFACE_FACE') { if (v.indices) faces.push(v.indices); continue; }
          if (!v.point) continue;
          const o = { x: v.point.x, y: v.point.y, z: v.point.z, flags: v.flags };
          if (v.type === 'VERTEX_2D') { o.z = rec.elevation; o.startWidth = v.startWidth; o.endWidth = v.endWidth; o.bulge = v.bulge; o.tangent = v.tangent; if (v.id !== undefined) o.id = v.id; }
          verts.push(o);
        }
        if (H2.seqend) used.add(H2.seqend);
        f.vertices = verts;
        if (rec.type === 'POLYLINE_PFACE') f.faces = faces;
        if (rec.type === 'POLYLINE_3D') {
          f.flags = 8 | (rec._closedFlags & 1) | (rec._splineFlags & 3 ? 4 : 0);
          f.curveType = rec._splineFlags & 1 ? 5 : rec._splineFlags & 2 ? 6 : 0;
        }
        if (rec.type === 'POLYLINE_PFACE') f.flags = 64;
        if (f.flags !== undefined) f.closed = !!(f.flags & 1);
        break;
      }
      case 'LEADER': f.annotation = hx(H2.annotation); f.style = nameOf(H2.dimstyle) ?? hx(H2.dimstyle); break;
      case 'TOLERANCE': f.style = nameOf(H2.dimstyle) ?? hx(H2.dimstyle); break;
      case 'MLINE': f.style = nameOf(H2.style) ?? hx(H2.style); break;
      case 'PDFUNDERLAY': f.definition = hx(H2.def); break;
      case 'IMAGE': case 'WIPEOUT': f.def = hx(H2.def); f.defReactor = hx(H2.defReactor); break;
      case 'VIEWPORT':
        if (ver < 15) Object.assign(f, mviewXdata(rec._eed && rec._eed.find((x) => appName(x.app) === 'ACAD')));
        f.frozenLayers = (H2.frozenLayers || []).map(hx);
        if (H2.clipBoundary) f.clipBoundary = hx(H2.clipBoundary);
        break;
      case 'HATCH':
        for (const l of f.loops) { l.boundary = (l._boundary || []).map(hx); delete l._boundary; delete l._nbound; }
        break;
      case 'SPLINE':
        // a fit tolerance > 0 asks for an approximating fit (not reproduced: knots/control stay empty). 0.6.1: such a
        // spline gets `approxKnots` / `approxControl` — the curve through its fit points, for drawing only (the program
        // that made it passes within the tolerance of them; straight lines between the fit points are much further off)
        if (rec.scenario === 2 && f.fit && f.fit.length >= 2 && !(f.knots && f.knots.length)) {
          const c = fitSplineControl(f.fit, f.degree, f.startTangent, f.endTangent, f.knotParam ?? 0);
          if (c && !(f.fitTolerance > 1e-9)) { f.knots = c.knots; f.control = c.control; f.controlComputed = true; }
          else if (c) { f.approxKnots = c.knots; f.approxControl = c.control; }
        }
        break;
      case 'MULTILEADER': case 'MLEADER':
        f.style = nameOf(H2.style) ?? hx(H2.style);
        if (rec.context && rec.context.block) f.contentBlock = nameOf(rec.context.block._block) ?? hx(rec.context.block._block);
        if (rec.context && rec.context.text) f.textStyle = nameOf(rec.context.text._style);
        { let m = null; try { m = readMleader(rec, ctx, hx, nameOf); } catch { /* keep the fields above */ }   // mleader-read.js: every field
          if (m) { delete f.context; delete f.arrowheads; delete f.blockLabels; delete f.mlVersion; Object.assign(f, m); } }
        break;
      case 'ACAD_PROXY_ENTITY': { const raw = captureRaw(rec, ver); if (raw) f.raw = raw; f.typeNum = rec.typeNum; break; }
      case 'ACAD_TABLE': tableEntityFields(rec, f, { hx, nameOf, get }); break;   // table-read.js
      case 'REGION': case '3DSOLID': case 'BODY': solidFields(rec, f, hx, appName); break;   // solid-read.js
      case 'SURFACE': case 'PLANESURFACE': case 'EXTRUDEDSURFACE': case 'LOFTEDSURFACE': case 'REVOLVEDSURFACE': case 'SWEPTSURFACE':
      case 'NURBSURFACE': surfaceFields(rec, f, hx, appName, get); break;   // surface-read.js
      default:
        if (DIM_BASE[rec.type] !== undefined || rec.type === 'ARC_DIMENSION' || rec.type === 'LARGE_RADIAL_DIMENSION') {
          f.block = nameOf(H2.block) ?? hx(H2.block);
          f.style = nameOf(H2.dimstyle) ?? hx(H2.dimstyle);
          const base = DIM_BASE[rec.type] ?? f.dimType;
          f.flags = base | (rec._flags1 & 1 ? 0 : 128) | (rec._flags1 & 2 ? 32 : 0) | (rec.type === 'DIMENSION_ORDINATE' && rec._flags2 & 1 ? 64 : 0);
        }
    }
    return f;
  };

  /** R13–R2000 entity chains: first → … → last through the next links (+1 when "no links"). */
  const chain = (first, last) => {
    const out = [], seen = new Set();
    let h = first;
    while (h && !seen.has(h) && out.length <= records.size) {
      seen.add(h);
      const r = get(h);
      out.push(h);
      if (h === last || !r) break;
      const next = r._nolinks ? h + 1 : r._h.next;
      if (!next || next === h) break;
      h = next;
    }
    return out;
  };

  // ---- blocks
  const recsInOrder = [];
  const ms = tableRecs.blockRecords.find((r) => r.handle === msRec), ps = tableRecs.blockRecords.find((r) => r.handle === psRec);
  if (ms) recsInOrder.push(ms);
  if (ps && ps !== ms) recsInOrder.push(ps);
  for (const r of tableRecs.blockRecords) if (r !== ms && r !== ps) recsInOrder.push(r);
  for (const br of recsInOrder) { try {
    const blk = get(br._h.block);
    const b = {
      name: br.name, handle: hx(br._h.block), record: hx(br.handle), base: br.base, flags: blockFlags(br),
      xrefPath: br.xrefPath, description: br.description || '', entities: [], endHandle: hx(br._h.endblk),
    };
    if (br._trueName) b.trueName = br._trueName;
    if (blk) {
      used.add(blk.handle);
      b.layer = layerName(blk._h.layer);
      const xd = xdataOf(blk); if (xd) b.xdata = xd;
    }
    if (br._h.endblk) used.add(br._h.endblk);
    let eh = br._h.entities;
    if (!eh && br._h.firstEntity) eh = chain(br._h.firstEntity, br._h.lastEntity);
    const space = recSpace.get(br.handle);
    for (const h of eh || []) {
      const r = get(h);
      if (!r || !r.isEntity || SUB_TYPES.has(r.type)) continue;
      if (mlattFold.has(h)) { used.add(h); continue; }   // the extra lines of a saved-down multi-line ATTDEF
      const e = convert(r, br.handle);
      if (space) e.space = space;
      b.entities.push(e);
      const s = bySpace[space || 'block'];
      for (const x of [e, ...(e.attribs || [])]) {   // ATTRIBs are counted as entities of their own (as in DXF)
        if (x !== e && space) x.space = space;
        counts[countType(x)] = (counts[countType(x)] || 0) + 1;
        s[countType(x)] = (s[countType(x)] || 0) + 1;
      }
    }
    model.blocks.push(b);
  } catch (err) { fail('blocks', err); } }

  // ---- entities nobody lists (damaged chains): keep them in their owner block, noted
  let orphans = 0, recoveredMs = 0;
  for (const r of records.values()) { try {
    if (!r.isEntity || used.has(r.handle) || SUB_TYPES.has(r.type)) continue;
    const owner = ownerOf(r);
    let b = model.blocks.find((x) => x.record === hx(owner));
    // 0.6.1: no model space block at all (its record did not decode): the entities whose block is missing go into a
    // recovered model space, so the drawing still opens
    if (!b && !model.blocks.some((x) => /^\*model_space$/i.test(x.name))) {
      b = { name: '*Model_Space', handle: '0', record: hx(msRec || owner), base: { x: 0, y: 0, z: 0 }, flags: 0, xrefPath: '', description: '', entities: [], recovered: true };
      model.blocks.unshift(b);
      recSpace.set(msRec || owner, 'model');
    }
    if (!b) continue;
    if (b.recovered) recoveredMs++;
    const e = convert(r, owner);
    const space = b.recovered ? 'model' : recSpace.get(owner);
    if (space) e.space = space;
    b.entities.push(e);
    counts[countType(e)] = (counts[countType(e)] || 0) + 1;
    orphans++;
  } catch (err) { fail('entities', err); } }
  if (recoveredMs) rep.notes.push(msg('ccdwg.read.model_space_recovered', { n: recoveredMs }));
  if (orphans - recoveredMs) rep.notes.push(msg('ccdwg.read.orphans', { n: orphans - recoveredMs }));

  // ---- layouts
  for (const r of records.values()) { try {
    if (r.type !== 'LAYOUT') continue;
    const p = r.plot || {};
    const blockRec = r._h.block;
    let vps = (r._h.viewports || []).map(hx);
    if (!r._h.viewports) {
      const b = model.blocks.find((x) => x.record === hx(blockRec));
      if (b) vps = b.entities.filter((e) => e.type === 'VIEWPORT').map((e) => e.handle);
    }
    model.layouts.push({
      ...commonObj(r), name: r.name, tabOrder: r.tabOrder, flags: r.flags, block: hx(blockRec),
      paper: {
        name: p.paperSize, w: p.paperWidth, h: p.paperHeight, units: p.paperUnits, margins: p.margins, rotation: p.rotation,
        plotType: p.plotType, scaleType: p.scaleType, scaleFactor: p.scaleFactor, plotScale: p.drawingUnits ? p.realWorldUnits / p.drawingUnits : undefined,
        realWorldUnits: p.realWorldUnits,
        drawingUnits: p.drawingUnits, origin: p.origin, pageSetupName: p.pageSetupName, printer: p.printer,
        styleSheet: p.styleSheet, flags: p.flags, windowMin: p.windowMin, windowMax: p.windowMax,
      },
      limits: { min: r.limMin, max: r.limMax }, insbase: r.insBase, extents: { min: r.extMin, max: r.extMax },
      ucs: { origin: r.ucsOrigin, xAxis: r.ucsXAxis, yAxis: r.ucsYAxis }, elevation: r.elevation,
      lastActiveViewport: hx(r._h.lastViewport), viewports: vps,
    });
  } catch (err) { fail('LAYOUT', err); } }
  model.layouts.sort((a, b) => a.tabOrder - b.tabOrder);

  // ---- non-graphical objects
  const isTableThing = (t) => TABLE_OF[t] || /_CONTROL$/.test(t) || t === 'VPENT_HEADER';
  for (const r of records.values()) { try {
    if (r.isEntity || isTableThing(r.type)) continue;
    const o = { ...commonObj(r), type: r.type };
    if (r._unknown) { o.undecoded = true; o.typeNum = r.typeNum; if (r.className) o.className = r.className; unknown[r.type] = (unknown[r.type] || 0) + 1; }
    else {
      try { Object.assign(o, objectFields(r)); }
      catch (err) { o.damaged = 'model: ' + err.message; buildErrors.n++; }
    }
    if (r._error) o.damaged = r._error;
    const raw = captureRaw(r, ver); if (raw) o.raw = raw;   // passthrough.js (same-version copy)
    model.objects.push(o);
  } catch (err) { fail('objects', err); } }
  model.objects.sort((a, b) => parseInt(a.handle, 16) - parseInt(b.handle, 16));

  function objectFields(r) {
    const f = plain(r);
    const H2 = r._h;
    switch (r.type) {
      case 'DICTIONARY': case 'ACDBDICTIONARYWDFLT': case 'DICTIONARYWDFLT': {
        f.entries = {};
        (r.names || []).forEach((n, i) => { f.entries[n] = hx((H2.items || [])[i]); });
        delete f.names;
        if (H2.defaultEntry) f.defaultEntry = hx(H2.defaultEntry);
        break;
      }
      case 'XRECORD': f.objids = (H2.objids || []).map(hx); break;
      case 'GROUP': f.entities = (H2.entities || []).map(hx); break;
      case 'LAYOUT': f.block = hx(H2.block); f.viewports = (H2.viewports || []).map(hx); break;
      case 'SORTENTSTABLE': f.ownerBlock = hx(H2.ownerBlock); f.entities = (H2.ents || []).map(hx); f.sortHandles = (r._sort || []).map(hx); break;
      case 'IDBUFFER': f.ids = (H2.ids || []).map(hx); break;
      case 'FIELDLIST': f.fields = (H2.fields || []).map(hx); break;
      case 'GEODATA': f.host = hx(H2.host); break;
      case 'TABLESTYLE': case 'CELLSTYLEMAP': case 'TABLECONTENT': case 'TABLEGEOMETRY': case 'FIELD': tableObjectFields(r, f, { hx, nameOf, get }); break;   // table-read.js
      case 'LAYER_INDEX': f.entries = (r.entries || []).map((e, i) => ({ ...e, handle: hx(H2.entries[i]) })); break;
      case 'MLINESTYLE': if (f.elements) for (const e of f.elements) { if (e._ltype !== undefined) { e.linetype = hx(e._ltype); delete e._ltype; } } break;
      case 'MLEADERSTYLE': for (const k of ['leaderLtype', 'arrowhead', 'textStyle', 'block']) if (H2[k] !== undefined) f[k] = hx(H2[k]);
        { let m = null; try { m = readMleaderStyle(r, ctx, hx); } catch { /* keep */ } if (m) { delete f.leaderLtype; Object.assign(f, m); } break; }   // mleader-read.js
    }
    return f;
  }
}

/**
 * R13/R14 viewports keep their view in ACAD extended data "MVIEW" (the DXF R12 layout of that xdata,
 * public DXF reference): target, direction, twist, height, centre x/y, lens, front, back, view mode, circle
 * zoom, fast zoom, UCSICON, snap, grid, snap style, snap isopair, snap angle, snap base, snap spacing, grid spacing.
 */
function mviewXdata(x) {
  if (!x) return {};
  const it = x.items, k = it.findIndex((g) => g[0] === 1000 && g[1] === 'MVIEW');
  if (k < 0) return {};
  const v = it.slice(k + 3).map((g) => g[1]);
  const pt = (p) => (p && typeof p === 'object' ? p : { x: 0, y: 0, z: 0 });
  return {
    viewTarget: pt(v[0]), viewDirection: pt(v[1]), twist: v[2], viewHeight: v[3], viewCenter: { x: v[4], y: v[5] },
    lensLength: v[6], frontClip: v[7], backClip: v[8], viewMode: v[9], circleZoom: v[10], snapAngle: v[17],
    snapBase: { x: v[18], y: v[19] }, snapSpacing: { x: v[20], y: v[21] }, gridSpacing: { x: v[22], y: v[23] },
  };
}

export { fitSplineControl };   // spline-fit.js

function blockFlags(r) {
  return (r.anonymous ? 1 : 0) | (r.hasAttribs ? 2 : 0) | (r.isXref ? 4 : 0) | (r.isOverlaid ? 8 : 0) | (r._xdep ? 16 : 0) | (r._flag64 ? 64 : 0);
}
function countType(e) { return e.type === 'UNKNOWN' ? e.dxfName : e.type; }
