/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: report notes go through msg() (messages.js); what is left is internal checks and file-format text. */
/**
 * table-write.js — editable tables: ACAD_TABLE, TABLESTYLE and FIELD written in every version R2000–R2018
 * (cc-dwg, Apache-2.0; builder T).
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: 20.4.96 TABLE (until R21 and R24+),
 * 20.4.97 TABLECONTENT (inline in the R24 table), 20.4.99 value, 20.4.100 custom data, 20.4.101 TABLESTYLE with
 * 20.4.101.3 content format and 20.4.101.4 cell style, 20.4.76 FIELD; 20.1/20.4.1 common data; 2.11 colours.
 * The layouts are the ones table-read.js decodes (its "Spec gap:" notes apply here too): R2000 table objects carry
 * R2004-form colours, the cell alignment is a BS, an R2007+ text cell keeps its text only in its value, a string
 * value from R2007 is BL byte count + UTF-16 with NUL, each R24 table-style cell style is preceded by its id.
 *
 * What is written (the model of table-read.js, see model.js ACAD_TABLE):
 *   - the ACAD_TABLE entity: the block reference to its anonymous "*T" block (which still draws it) and the table
 *     data — R2000–R2007: the cell grid of 20.4.96.1; R2010+: the table content of 20.4.97 inline (20.4.96.2).
 *     R2000–R2007 files of AutoCAD 2008+ also keep "round-trip" copies (TABLECONTENT, TABLEGEOMETRY, DATATABLE,
 *     CELLSTYLEMAP and ACAD_XREC_ROUNDTRIP xrecords); they are not written (COPY_SKIP below): a reader that finds
 *     none uses the entity's own data — Spec gap / found by experiment: the ODA File Converter prefers stale
 *     round-trip data over the entity's when both exist (it shows empty "general" cells of blocks_and_tables saved
 *     as R2000/R2004).
 *   - every TABLESTYLE of the model (the source's ACAD_TABLESTYLE dictionary; a "Standard" one when a table has
 *     none) in the version's format, and that dictionary in the named-object dictionary.
 *   - the FIELD objects (with their child fields) of field cells. Their source handles are claimed here so the
 *     object copier (nongraphic-write.js) does not copy them a second time; its dictionaries then point at ours.
 *     FIELD is also registered as a field encoder of that copier (fields of MTEXT etc. in other versions).
 *
 *   tableWriter(env) → { convert(e, owner, c) → [record] | 'reason', finish({ recs, H }) }
 *     env = { model, version, next, srcMap, mapSrc, hexKey, styleRef, ltypeRef, blockByName, blocks }
 */
import { msg } from './messages.js';
import { ENC, CLASSED, entityCommon, objectCommon, begin, finish, ObjWriter, HARD_OWN, HARD_PTR, SOFT_PTR } from './objects-write.js';
import { FIELD_ENCODERS, COPY_SKIP } from './nongraphic-write.js';
import { DEFAULT_STYLE_NAMES, canonicalBorders } from './table-read.js';

// class properties as the corpus files carry them (DXF CLASSES)
const CLS = {
  ACAD_TABLE: { dxf: 'ACAD_TABLE', cpp: 'AcDbTable', app: 'ObjectDBX Classes', entity: true, proxy: 1025 },
  TABLESTYLE: { dxf: 'TABLESTYLE', cpp: 'AcDbTableStyle', app: 'ObjectDBX Classes', entity: false, proxy: 4095 },
  FIELD: { dxf: 'FIELD', cpp: 'AcDbField', app: 'ObjectDBX Classes', entity: false, proxy: 1152 },
};
for (const [k, v] of Object.entries(CLS)) if (!CLASSED[k]) CLASSED[k] = v;

const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const P = (p) => ({ x: num(p?.x), y: num(p?.y), z: num(p?.z) });
const ROUND_TRIP = new Set(['TABLECONTENT', 'TABLEGEOMETRY', 'DATATABLE', 'CELLSTYLEMAP']);
const RT_ENTRIES = new Set(['ACAD_XREC_ROUNDTRIP', 'ACAD_ROUNDTRIP_2008_TABLESTYLE_CELLSTYLEMAP']);
// Spec gap: the named-object dictionary entry ACDB_RECOMPOSE_DATA (an XRECORD [90 1][330 style][330 table]…) of
// R2007-and-earlier files saved by AutoCAD 2008+ asks the reader to rebuild those tables from their round-trip data;
// with that data left out the ODA File Converter then shows the cells empty (found by experiment). Its table and
// table-style entries are left out; the rest (multileaders, dimensions, mtext of annotative drawings) is kept —
// nongraphic-write.js recomposeKeep().
const skipHandles = new Set();
// Only the round-trip data of tables and table styles is left out: their extension dictionaries' ACAD_XREC_ROUNDTRIP /
// ACAD_ROUNDTRIP_2008_TABLESTYLE_CELLSTYLEMAP entries and what those own (TABLECONTENT, TABLEGEOMETRY, DATATABLE,
// CELLSTYLEMAP), and the dictionary itself when nothing else is in it — found by experiment: an R2007 table style with
// an (empty) extension dictionary makes the ODA File Converter drop the cells' text. Round-trip data of other
// objects (multileaders …) is the copier's business. The set is computed per drawing in tableWriter().
COPY_SKIP.push((o) => skipHandles.has(String(o.handle).toUpperCase()));

/** Colours of table data: the R2004 CMC form in every version (see table-read.js cmc). */
function cmc(w, c) {
  c = c || { index: 256 };
  if (w.r2004) { w.CMC(c); return; }
  w.r2004 = true;
  try { w.CMC(c); } finally { w.r2004 = false; }
}
function insertScale(w, s) {
  const sx = num(s?.x, 1), sy = num(s?.y, 1), sz = num(s?.z, 1);
  if (sx === 1 && sy === 1 && sz === 1) w.BB(3);
  else if (sx === sy && sx === sz) { w.BB(2); w.RD(sx); }
  else if (sx === 1) { w.BB(1); w.DD(sy, 1); w.DD(sz, 1); }
  else { w.BB(0); w.RD(sx); w.DD(sy, sx); w.DD(sz, sx); }
}
function utf16z(s) {
  const str = String(s ?? '');
  const b = new Uint8Array((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); b[2 * i] = c & 255; b[2 * i + 1] = c >> 8; }
  return b;
}
const hexBytes = (h) => { const s = String(h || ''); const b = new Uint8Array(s.length >> 1); for (let i = 0; i < b.length; i++) b[i] = parseInt(s.substr(2 * i, 2), 16); return b; };

// ---------------------------------------------------------------- 20.4.99 value
/** v = model value { flags?, dataType, value?, bytes?, id?, unitType?, format?, text? }; ref(hex) → handle for type 64 */
function writeValue(w, v, ref = () => 0, opts = {}) {
  v = v || { flags: 3, dataType: 0 };
  let type = v.dataType | 0;
  const r2007 = w.r2007;
  let flags = v.flags | 0;
  if (!r2007 && (type === 512 || type === 128 || type === 256)) { type = v.text ? 4 : 0; }   // "use Unknown before R2007" (20.4.99); general text kept as a string
  if (r2007) w.BL(flags);
  w.BL(type);
  if (!(r2007 && flags & 1)) {
    switch (type) {
      case 0: w.BL(num(v.value) | 0); break;
      case 1: w.BL(num(v.value) | 0); break;
      case 2: w.BD(num(+v.value)); break;
      case 4: {
        const s = v.value !== undefined && v.dataType === 4 ? v.value : v.text ?? '';
        if (r2007) { const b = utf16z(s); w.BL(b.length); for (const x of b) w.RC(x); } else w.TV(String(s));
        break;
      }
      case 512:
        // Spec gap: AutoCAD leaves a "general" value's bytes empty and keeps the text in the value string; in an
        // R2007 table cell (no round-trip data) the ODA File Converter then shows the cell empty. With the text as
        // UTF-16 + NUL in the bytes (as a string value) it shows it, still as type 512 — found by experiment.
        if (opts.generalText && !v.bytes && v.text) { const b = utf16z(v.text); w.BL(b.length); for (const x of b) w.RC(x); break; }
      // falls through
      case 8: case 128: case 256: { const b = hexBytes(v.bytes); w.BL(b.length); for (const x of b) w.RC(x); break; }
      case 16: w.BL(16); w.RD(num(v.value?.x)); w.RD(num(v.value?.y)); break;
      case 32: w.BL(24); w.RD(num(v.value?.x)); w.RD(num(v.value?.y)); w.RD(num(v.value?.z)); break;
      case 64: w.H(SOFT_PTR, ref(v.id)); break;
      default: w.BL(0);
    }
  }
  if (r2007) { w.BL(v.unitType | 0); w.TV(v.format ?? ''); w.TV(v.text ?? ''); }
}

// ---------------------------------------------------------------- 20.4.76 FIELD
/** f = model field (fieldModel of table-read.js); kids = child FIELD handles; objs = object handles */
function writeField(w, f, kids, objs, ref) {
  w.TV(f.evaluatorId ?? ''); w.TV(f.code ?? '');
  w.BL(kids.length); for (const h of kids) w.H(HARD_OWN, h);
  w.BL(objs.length); for (const h of objs) w.H(SOFT_PTR, h);
  if (!w.r2007) w.TV(f.format ?? f.value?.format ?? '');
  w.BL(f.evalOptions ?? 63); w.BL(f.filingOptions | 0); w.BL(f.state ?? 13); w.BL(f.evalStatus ?? 2); w.BL(f.evalError | 0);
  w.TV(f.evalMessage ?? '');
  writeValue(w, f.value, ref);
  w.TV(f.valueString ?? ''); w.BL(f.valueStringLength ?? String(f.valueString ?? '').length);
  const cv = f.childValues || [];
  w.BL(cv.length);
  for (const c of cv) { w.TV(c.key ?? ''); writeValue(w, c.value, ref); }
}
ENC.FIELD = (w, r) => {
  if (r.resolveOwner) r.resolveOwner(r);
  objectCommon(w, r);
  writeField(w, r.field, r.kids, (r.field.objects || []).map(r.ref).filter(Boolean), r.ref);
};
// the copier's encoder (fields of other objects, in another version than the source's)
FIELD_ENCODERS.FIELD = (rec, ctx) => {
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum('FIELD'), rec);
  objectCommon(w, rec);
  const o = rec.src, ref = rec.M.ref;
  writeField(w, o, (o.children || []).map(ref).filter(Boolean), (o.objects || []).map(ref).filter(Boolean), ref);
  return finish(w);
};

// ---------------------------------------------------------------- 20.4.101.3 / .4 content format and cell style
const EDGES = [[1, 'top'], [2, 'right'], [4, 'bottom'], [8, 'left'], [16, 'insideV'], [32, 'insideH']];
function writeContentFormat(w, c, R) {
  w.BL(c.overrides | 0); w.BL(c.propertyFlags | 0); w.BL(c.dataType ?? 512); w.BL(c.unitType | 0); w.TV(c.format ?? '');
  w.BD(num(c.rotation)); w.BD(num(c.blockScale, 1)); w.BL(c.align || 1); cmc(w, c.color || { index: 0 });
  w.H(HARD_PTR, c.textStyle ? R.style(c.textStyle) : 0); w.BD(num(c.textHeight, 0.18));
}
/** s = cellStyleModel form ({ type, overrides?, …, content, margins?, borders{side} }) */
function writeCellStyle(w, s, R) {
  w.BL(s?.type ?? 1);
  const has = s && s.overrides !== undefined;
  w.BS(has ? 1 : 0);
  if (!has) return;
  w.BL(s.overrides | 0); w.BL(s.mergeFlags | 0); cmc(w, s.background || { index: 257 }); w.BL(s.contentLayout ?? 1);
  writeContentFormat(w, s.content || {}, R);
  if (s.margins) {
    w.BS(1);
    const m = s.margins;
    for (const k of ['vertical', 'horizontal', 'bottom', 'right', 'hSpacing', 'vSpacing']) w.BD(num(m[k]));
  } else w.BS(0);
  const bs = EDGES.filter(([, k]) => s.borders && s.borders[k]);
  w.BL(bs.length);
  for (const [e, k] of bs) {
    const b = s.borders[k];
    w.BL(e); w.BL(b.overrides | 0); w.BL(b.type ?? 1); cmc(w, b.color || { index: 0 }); w.BL(num(b.lineweight, -2) | 0);
    w.H(HARD_PTR, b.linetype ? R.ltype(b.linetype) : 0); w.BL(b.visible === false ? 1 : 0); w.BD(num(b.doubleSpacing, 0.045));
  }
}
function writeNamedCellStyle(w, s, R) { writeCellStyle(w, s, R); w.BL(s.id | 0); w.BL(s.styleClass ?? 2); w.TV(s.name ?? ''); }

// ---------------------------------------------------------------- 20.4.101 TABLESTYLE
/** a neutral table-style cell style (tableStyleModel cellStyles[i]) as an R24 cell style */
function r24CellStyle(cs, st) {
  if (cs.cell && cs.cell.content) return { ...cs.cell, id: cs.id, name: cs.name, styleClass: cs.styleClass ?? cs.cell.styleClass };
  const borders = {};
  for (const [, k] of EDGES) {
    const b = cs.borders?.[k] || {};
    borders[k] = { overrides: 0, type: 1, color: b.color || { index: 0 }, lineweight: num(b.lineweight, -2), visible: b.visible !== false, doubleSpacing: 0.045 };
  }
  const hm = num(st.hMargin, 0.06), vm = num(st.vMargin, 0.06);
  return {
    type: 5, overrides: 0, mergeFlags: cs.id === 1 ? 0x8000 : 0, background: cs.backgroundEnabled ? cs.background : { index: 257 }, contentLayout: 1,
    content: { overrides: 0, propertyFlags: 0, dataType: cs.dataType ?? 512, unitType: cs.unitType | 0, format: cs.format ?? '', rotation: num(cs.rotation),
      blockScale: 1, align: cs.align || (cs.id === 3 ? 2 : 5), color: cs.color || { index: 0 }, textStyle: cs.textStyle, textHeight: num(cs.textHeight, 0.18) },
    margins: { vertical: vm, horizontal: hm, bottom: vm, right: hm, hSpacing: hm * 3, vSpacing: vm * 3 }, borders,
    id: cs.id, name: cs.name, styleClass: cs.styleClass ?? (cs.id === 3 ? 1 : 2),
  };
}
ENC.TABLESTYLE = (w, r) => {
  r.reactors = [r.ownerDict, ...r.tables.map(r.R.src).filter(Boolean)].filter(Boolean);
  if (!r.xdic && r.style.extDict) r.xdic = r.R.src(r.style.extDict) || undefined;   // what the copier kept of its extension dictionary
  objectCommon(w, r);
  const st = r.style, R = r.R;
  const cells = st.cellStyles || [];
  const byId = (id) => cells.find((c) => c.id === id) || { id, name: DEFAULT_STYLE_NAMES[id], textHeight: id === 1 ? 0.25 : 0.18, align: id === 3 ? 2 : 5 };
  if (w.r2010) {
    w.RC(st.unknown?.rc | 0); w.TV(st.description ?? ''); w.BL(st.flags ?? 8); w.BL(st.unknown?.bl2 ?? 101); w.H(HARD_OWN, 0);
    const tcs = st.tableCellStyle || { type: 5, overrides: 0, mergeFlags: st.flowDirection ? 0x10000 : 0, background: { index: 257 }, contentLayout: 1,
      content: { overrides: 0, propertyFlags: 0, dataType: 4, unitType: 0, format: '', rotation: 0, blockScale: 1, align: 1, color: { index: 0 }, textHeight: 0.18 },
      margins: { vertical: num(st.vMargin, 0.06), horizontal: num(st.hMargin, 0.06), bottom: num(st.vMargin, 0.06), right: num(st.hMargin, 0.06), hSpacing: 0.18, vSpacing: 0.18 },
      borders: Object.fromEntries(EDGES.map(([, k]) => [k, { overrides: 0, type: 1, color: { index: 0 }, lineweight: -2, visible: true, doubleSpacing: 0.045 }])) };
    writeNamedCellStyle(w, { ...tcs, id: 4, styleClass: 2, name: 'Table' }, R);
    const list = [byId(1), byId(2), byId(3), ...cells.filter((c) => c.id > 4)].map((c) => r24CellStyle(c, st));
    w.BL(list.length);
    for (const s of list) { w.BL(s.id); writeNamedCellStyle(w, s, R); }
    return;
  }
  w.TV(st.description ?? ''); w.BS(st.flowDirection | 0); w.BS(st.tableCellStyle ? 0 : (st.flags | 0) & 0x7FFF);   // R24 "flags" are another field
  w.BD(num(st.hMargin, 0.06)); w.BD(num(st.vMargin, 0.06)); w.B(st.titleSuppressed ? 1 : 0); w.B(st.headerSuppressed ? 1 : 0);
  for (const id of [3, 1, 2]) {
    const cs = byId(id);
    w.H(HARD_PTR, R.style(cs.textStyle)); w.BD(num(cs.textHeight, 0.18)); w.BS(cs.align || 5);
    cmc(w, cs.color || { index: 0 }); cmc(w, cs.background || { index: 257 }); w.B(cs.backgroundEnabled ? 1 : 0);
    for (const k of ['top', 'insideH', 'bottom', 'left', 'insideV', 'right']) {
      const b = cs.borders?.[k] || {};
      w.BS(num(b.lineweight, -2)); w.B(b.visible === false ? 0 : 1); cmc(w, b.color || { index: 0 });
    }
    if (w.r2007) { w.BL(cs.dataType ?? 512); w.BL(cs.unitType | 0); w.TV(cs.format ?? ''); }
  }
};

// ---------------------------------------------------------------- 20.4.96 ACAD_TABLE
const SIDE_BIT = { top: 0, right: 1, bottom: 2, left: 3 };
function insertPart(w, r) {
  w.P3(r.insert); insertScale(w, r.scale); w.BD(num(r.rotation));
  const e = r.extrusion || { x: 0, y: 0, z: 1 }; w.BD3(num(e.x), num(e.y), num(e.z, 1));
  w.B(0);                                       // no attributes
  w.H(HARD_PTR, r.block);
}
const isText = (c) => c.type !== 'block';
/** the value a text cell stores (R2007+): its own, or a string built from its text */
function cellValue(c) {
  if (c.data && (c.data.flags & 1) === 0 && c.data.dataType !== undefined) {
    const v = { ...c.data };
    if (v.dataType === 4) v.value = c.value ?? v.value;
    else if (v.dataType === 512) v.text = c.value ?? v.text;
    return v;
  }
  if (c.value === '' || c.value === undefined) return { flags: 3, dataType: 0 };
  return { flags: 0, dataType: 4, value: String(c.value) };
}

/**
 * Border overrides per cell edge: the cell that owns one sets its edge flag; the neighbour across that edge gets the same
 * edge flag marked virtual and the same properties (old format: flags without values, as the ODA File Converter writes
 * them; R2010+: the same border record on both cells). → (i, j) → { flags, virtual, vprops: { side: props } }
 */
function edgeMap(T) {
  const nr = T.rows.length, nc = T.columns.length;
  const OPP = { top: ['bottom', -1, 0], right: ['left', 0, 1], bottom: ['top', 1, 0], left: ['right', 0, -1] };
  const edge = new Map();   // "i,j" → { flags, virtual, vprops: {side: props} }
  const E = (i, j) => edge.get(i + ',' + j) || edge.set(i + ',' + j, { flags: 0, virtual: 0, vprops: {} }).get(i + ',' + j);
  for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
    const c = T.cells[i]?.[j];
    if (!c) continue;
    const e = E(i, j);
    e.flags |= c.edges?.flags | 0; e.virtual |= c.edges?.virtual | 0;
    for (const [side, b] of Object.entries(c.overrides?.borders || {})) {
      if (!(side in SIDE_BIT) || !b) continue;
      const k = SIDE_BIT[side];
      e.flags |= 1 << k; e.virtual &= ~(1 << k);
      const [os, di, dj] = OPP[side], ni = i + di, nj = j + dj;
      if (ni < 0 || nj < 0 || ni >= nr || nj >= nc) continue;
      const n = E(ni, nj), ok = SIDE_BIT[os];
      n.flags |= 1 << ok; n.virtual |= 1 << ok; n.vprops[os] = b;
    }
  }
  return E;
}

function oldTable(w, r) {
  const T = r.table, R = r.R, nr = T.rows.length, nc = T.columns.length;
  w.BS(T.flags ?? (6 | (T.flowDirection ? 0 : 0x10) | (T.titleSuppressed ? 0x20 : 0)));
  w.P3(r.horizDir || { x: 1, y: 0, z: 0 });
  w.BL(nc); w.BL(nr);
  for (const c of T.columns) w.BD(num(c.width, 1));
  for (const x of T.rows) w.BD(num(x.height, 0.25));
  w.H(HARD_PTR, r.styleH);
  const mergeAt = new Map();
  for (const m of T.merged || []) mergeAt.set(m.top + ',' + m.left, m);
  const covered = new Set();
  for (const m of T.merged || []) for (let i = m.top; i <= m.bottom; i++) for (let j = m.left; j <= m.right; j++) if (i !== m.top || j !== m.left) covered.add(i + ',' + j);
  const E = edgeMap(T);
  for (let i = 0; i < nr; i++) for (let j = 0; j < nc; j++) {
    const c = T.cells[i]?.[j] || { type: 'text', value: '' };
    const m = mergeAt.get(i + ',' + j);
    const ed = E(i, j);
    w.BS(isText(c) ? 1 : 2); w.RC(ed.flags); w.B(covered.has(i + ',' + j) || c.covered ? 1 : 0); w.B(c.autoFit ? 1 : 0);
    w.BL(m ? m.right - m.left + 1 : 1); w.BL(m ? m.bottom - m.top + 1 : 1); w.BD(num(c.rotation));
    const fieldH = isText(c) && c.field ? R.field(c) : 0;
    if (isText(c)) {
      w.H(HARD_PTR, fieldH);
      if (!fieldH && !w.r2007) w.TV(String(c.value ?? ''));
    } else {
      w.H(HARD_PTR, R.block(c));
      w.BD(num(c.blockScale, 1));
      const at = (c.attrs || []).map((a) => ({ ...a, h: R.src(a.attdef) })).filter((a) => a.h);
      w.B(at.length ? 1 : 0);
      if (at.length) { w.BS(at.length); for (const a of at) { w.H(SOFT_PTR, a.h); w.BS(a.index | 0); w.TV(String(a.value ?? '')); } }
    }
    const ov = c.overrides || {};
    let fl = 0;
    if (ov.align !== undefined) fl |= 0x01;
    if (ov.fillNone !== undefined) fl |= 0x02;
    if (ov.background) fl |= 0x04;
    if (ov.color) fl |= 0x08;
    if (ov.textStyle !== undefined) fl |= 0x10;
    if (ov.textHeight !== undefined) fl |= 0x20;
    const bo = { ...ed.vprops, ...(ov.borders || {}) };
    for (const [side, k] of Object.entries(SIDE_BIT)) {
      const b = bo[side];
      if (!b) continue;
      if (b.color) fl |= 0x40 << k;
      if (b.lineweight !== undefined) fl |= 0x400 << k;
      if (b.visible !== undefined) fl |= 0x4000 << k;
    }
    // Spec gap: R2007+ sets 0x40000 on a text cell that holds a value (found in the ODA File Converter's DXF and
    // in the R2007 corpus files: every non-empty, non-field text cell has it)
    const val = isText(c) && !fieldH ? cellValue(c) : { flags: 3, dataType: 0 };
    if (w.r2007 && isText(c) && !fieldH && !(val.flags & 1)) fl |= 0x40000;
    w.B(fl || ed.virtual ? 1 : 0);
    if (fl || ed.virtual) {
      w.BL(fl); w.RC(ed.virtual);
      if (fl & 0x01) w.BS(ov.align | 0);
      if (fl & 0x02) w.B(ov.fillNone ? 1 : 0);
      if (fl & 0x04) cmc(w, ov.background);
      if (fl & 0x08) cmc(w, ov.color);
      if (fl & 0x10) w.H(HARD_PTR, R.style(ov.textStyle));
      if (fl & 0x20) w.BD(num(ov.textHeight, 0.18));
      for (const [side, k] of Object.entries(SIDE_BIT)) {
        const b = bo[side];
        if (!b || ed.virtual & (1 << k)) continue;
        if (fl & (0x40 << k)) cmc(w, b.color);
        if (fl & (0x400 << k)) w.BS(num(b.lineweight, -2));
        if (fl & (0x4000 << k)) w.BS(b.visible === false ? 1 : 0);   // 1 = invisible (table-read.js)
      }
    }
    if (w.r2007) { w.BL(0); writeValue(w, val, R.src, { generalText: true }); }
  }
  // table-wide overrides (as read from an R13–R21 table; others write none)
  const o = T.overrides, f = o ? T.overrideFlags | 0 : 0;
  w.B(f ? 1 : 0);
  if (f) {
    w.BL(f);
    if (f & 1) w.B(o.titleSuppressed ? 1 : 0);
    if (f & 4) w.BS(o.flowDirection | 0);
    if (f & 8) w.BD(num(o.hMargin));
    if (f & 0x10) w.BD(num(o.vMargin));
    const rows = ['title', 'header', 'data'];
    rows.forEach((n, i) => { if (f & (0x20 << i)) cmc(w, o[n + 'Color']); });
    rows.forEach((n, i) => { if (f & (0x100 << i)) w.B(o[n + 'FillNone'] ? 1 : 0); });
    rows.forEach((n, i) => { if (f & (0x800 << i)) cmc(w, o[n + 'Fill']); });
    rows.forEach((n, i) => { if (f & (0x4000 << i)) w.BS(o[n + 'Align'] | 0); });
    rows.forEach((n, i) => { if (f & (0x20000 << i)) w.H(HARD_PTR, R.style(o[n + 'Style'])); });
    rows.forEach((n, i) => { if (f & (0x100000 << i)) w.BD(num(o[n + 'Height'])); });
  }
  for (const [k, wr] of [['borderColors', (v) => cmc(w, v)], ['borderLineweights', (v) => w.BS(num(v, -2))], ['borderVisibility', (v) => w.BS(v | 0)]]) {
    const b = T[k];
    w.B(b ? 1 : 0);
    if (b) { w.BL(b.flags | 0); for (let i = 0; i < 18; i++) if (b.flags & (1 << i)) wr(b[i]); }
  }
}

/** R24 cell style of a cell: its own (if the source had one) with the model's overrides applied */
function cellStyleFor(c, vprops = {}) {
  const ov0 = c.overrides || {};
  const ov = Object.keys(vprops).length ? { ...ov0, borders: { ...vprops, ...(ov0.borders || {}) } } : ov0;
  const base = c.cellStyle && c.cellStyle.overrides !== undefined ? JSON.parse(JSON.stringify(c.cellStyle)) : null;
  const rot = num(c.rotation);
  if (!base && !Object.keys(ov).length && !rot) return { type: 1 };
  const s = base || { type: 1, overrides: 0, mergeFlags: 0, background: { index: 257 }, contentLayout: 1,
    content: { overrides: 0, propertyFlags: 0, dataType: 512, unitType: 0, format: '', rotation: 0, blockScale: 1, align: c.align || 1, color: { index: 0 }, textHeight: 0.18 }, borders: {} };
  let fl = s.overrides & ~(0x4 | 0x10 | 0x20 | 0x40 | 0x80 | 0x200);
  const ct = s.content;
  if (ov.align !== undefined) { fl |= 0x10; ct.align = ov.align; }
  if (ov.color) { fl |= 0x20; ct.color = ov.color; }
  if (ov.textStyle !== undefined) { fl |= 0x40; ct.textStyle = ov.textStyle; }
  if (ov.textHeight !== undefined) { fl |= 0x80; ct.textHeight = ov.textHeight; }
  if (ov.background || ov.fillNone) { fl |= 0x200; s.background = ov.fillNone ? { index: 257 } : ov.background; }
  // the cell's rotation: also a cell style override (the ODA File Converter takes it from there)
  if (rot) { fl |= 0x4; ct.rotation = rot; } else if (!(s.overrides & 0x4)) ct.rotation = 0;
  ct.overrides = fl & 0x1FF;
  s.overrides = fl;
  if (ov.borders) for (const [side, b] of Object.entries(ov.borders)) {
    const x = s.borders[side] || (s.borders[side] = { overrides: 0, type: 1, color: { index: 0 }, lineweight: -2, visible: true, doubleSpacing: 0.045 });
    x.overrides |= 26;   // lineweight, colour, invisibility: on every border record R2010+ files carry
    if (b.color) x.color = b.color;
    if (b.lineweight !== undefined) x.lineweight = b.lineweight;
    if (b.visible !== undefined) x.visible = !!b.visible;
  }
  return s;
}

function newTable(w, r) {
  const T = r.table, R = r.R, nr = T.rows.length, nc = T.columns.length;
  const E = edgeMap(T);
  w.RC(0); w.H(SOFT_PTR, 0); w.BL(0);
  if (w.r2013) w.BL(0); else w.B(1);
  // table content (20.4.97) without the common object data
  w.TV(T.name ?? ''); w.TV(T.description ?? '');
  const sid = (name) => R.styleId(name);
  w.BL(nc);
  for (const col of T.columns) {
    w.TV(col.name ?? ''); w.BL(0); w.BL(0);   // custom data: none
    writeCellStyle(w, col.cellStyle || { type: 3 }, R); w.BL(col.style ? sid(col.style) : 0); w.BD(num(col.width, 1));
  }
  w.BL(nr);
  const fields = [];
  for (let i = 0; i < nr; i++) {
    const row = T.rows[i];
    w.BL(nc);
    for (let j = 0; j < nc; j++) {
      const c = T.cells[i]?.[j] || { type: 'text', value: '' };
      w.BL(c.state | 0); w.TV(c.tooltip ?? ''); w.BL(0); w.BL(0); w.BL(0);   // state, tooltip, no custom data, no data link
      const fieldH = isText(c) && c.field ? R.field(c) : 0;
      const cf = { overrides: 0, propertyFlags: 0, dataType: 512, unitType: 0, format: '', rotation: num(c.rotation), blockScale: num(c.blockScale, 1), align: c.align || 1,
        color: { index: 0 }, textHeight: 0.18, ...(c.contentFormat || {}) };
      cf.rotation = num(c.rotation); if (c.type === 'block') cf.blockScale = num(c.blockScale, 1);
      if (cf.rotation) cf.overrides |= 4;   // rotation is an override of the content format (20.4.101.3)
      if (!isText(c)) {
        w.BL(1); w.BL(4); w.H(HARD_PTR, R.block(c));
        const at = (c.attrs || []).map((a) => ({ ...a, h: R.src(a.attdef) })).filter((a) => a.h);
        w.BL(at.length); for (const a of at) { w.H(SOFT_PTR, a.h); w.TV(String(a.value ?? '')); w.BL(a.index | 0); }
        w.BS(1); writeContentFormat(w, cf, R);
      } else if (fieldH) {
        fields.push(fieldH);
        w.BL(1); w.BL(2); w.H(HARD_PTR, fieldH); w.BL(0); w.BS(1); writeContentFormat(w, cf, R);
      } else {
        const v = cellValue(c);
        if (v.flags & 1 && !c.contentFormat) w.BL(0);
        else {
          if (!c.contentFormat) { cf.overrides = 1; cf.dataType = v.dataType; }
          w.BL(1); w.BL(1); writeValue(w, v, R.src); w.BL(0); w.BS(1); writeContentFormat(w, cf, R);
        }
      }
      writeCellStyle(w, cellStyleFor(c, E(i, j).vprops), R);
      w.BL(c.style && c.style !== row.style ? sid(c.style) : 0);
      w.BL(0);   // no geometry data
    }
    w.BL(0); w.BL(0);   // custom data: none
    writeCellStyle(w, row.cellStyle || { type: 2 }, R); w.BL(sid(row.style)); w.BD(num(row.height, 0.25));
  }
  w.BL(fields.length); for (const h of fields) w.H(HARD_OWN, h);
  writeCellStyle(w, T.tableCellStyle || { type: 4 }, R);
  const merged = T.merged || [];
  w.BL(merged.length); for (const m of merged) { w.BL(m.top); w.BL(m.left); w.BL(m.bottom); w.BL(m.right); }
  w.H(HARD_PTR, r.styleH);
  // the table entity part after the content
  w.BS(T.tableBits ?? 38); w.P3(r.horizDir || { x: 1, y: 0, z: 0 });
  const br = T.breaks;
  w.BL(br ? 1 : 0);
  if (br) {
    w.BL(br.options | 0); w.BL(br.flow ?? 1); w.BD(num(br.spacing)); w.BL(br.unknown1 | 0); w.BL(br.unknown2 | 0);
    const hs = br.heights || [];
    w.BL(hs.length); for (const x of hs) { w.P3(x.position); w.BD(num(x.height)); w.BL(x.flags | 0); }
  }
  const ranges = T.rowRanges && T.rowRanges.length ? T.rowRanges : [{ position: { x: 0, y: 0, z: 0 }, start: 0, end: nr - 1 }];
  w.BL(ranges.length); for (const x of ranges) { w.P3(x.position); w.BL(x.start | 0); w.BL(x.end | 0); }
}

ENC.ACAD_TABLE = (w, r) => {
  r.styleH = r.R.tableStyle();
  r.block = r.blockRef ? r.blockRef.hdr : 0;
  entityCommon(w, r);
  insertPart(w, r);
  if (w.r2010) newTable(w, r);
  else oldTable(w, r);
};

// ================================================================ conversion (write.js)
const DEFAULT_TABLE_STYLE = { name: 'Standard', description: '', flowDirection: 0, flags: 0, hMargin: 0.06, vMargin: 0.06, titleSuppressed: false, headerSuppressed: false,
  cellStyles: [
    { id: 3, name: '_DATA', styleClass: 1, textStyle: 'Standard', textHeight: 0.18, align: 2, color: { index: 0 }, background: { index: 257 }, backgroundEnabled: false },
    { id: 1, name: '_TITLE', styleClass: 2, textStyle: 'Standard', textHeight: 0.25, align: 5, color: { index: 0 }, background: { index: 257 }, backgroundEnabled: false },
    { id: 2, name: '_HEADER', styleClass: 2, textStyle: 'Standard', textHeight: 0.18, align: 5, color: { index: 0 }, background: { index: 257 }, backgroundEnabled: false },
  ] };

export function tableWriter(env) {
  const { model, next, srcMap, mapSrc, hexKey, styleRef, ltypeRef, blockByName, blocks } = env;
  const src = (hex) => srcMap.get(hexKey(hex)) || 0;
  const objs = model.objects || [];
  const byH = new Map(objs.map((o) => [hexKey(o.handle), o]));
  skipHandles.clear();
  {
    const xdicts = objs.filter((o) => o.type === 'TABLESTYLE' && o.extDict).map((o) => o.extDict);
    for (const b of model.blocks || []) for (const e of b.entities || []) if (String(e.type).toUpperCase() === 'ACAD_TABLE' && e.extDict) xdicts.push(e.extDict);
    for (const xh of xdicts) {
      const d = byH.get(hexKey(xh));
      if (!d || d.type !== 'DICTIONARY' || !d.entries) continue;
      const names = Object.keys(d.entries);
      for (const [name, h] of Object.entries(d.entries)) {
        if (!RT_ENTRIES.has(name)) continue;
        skipHandles.add(hexKey(h));
        const x = byH.get(hexKey(h));
        if (x && x.type === 'XRECORD') for (const [c, v] of x.data || []) if ((c === 360 || c === 361) && ROUND_TRIP.has(byH.get(hexKey(v))?.type)) skipHandles.add(hexKey(v));
      }
      if (names.length && names.every((n) => RT_ENTRIES.has(n))) skipHandles.add(hexKey(xh));
    }
  }
  const styles = new Map();     // source hex (or '*default') → { rec }
  const objRecs = [];
  let dict = null;              // the ACAD_TABLESTYLE dictionary record
  let nTables = 0, nFieldCells = 0, fieldFallback = 0;

  const ensureDict = () => {
    if (dict) return dict;
    const srcStyle = objs.find((o) => o.type === 'TABLESTYLE');
    const srcDict = srcStyle && byH.get(hexKey(srcStyle.owner));
    dict = { t: 'DICTIONARY', h: next(), owner: 0, items: [], hardOwner: false, srcDict };
    if (srcDict) mapSrc(srcDict.handle, dict.h);
    // every table style of the source (used or not)
    for (const o of objs) if (o.type === 'TABLESTYLE') addStyle(o);
    return dict;
  };
  function addStyle(o) {
    const k = o ? hexKey(o.handle) : '*default';
    if (styles.has(k)) return styles.get(k);
    const st = o || DEFAULT_TABLE_STYLE;
    const rec = { t: 'TABLESTYLE', h: next(), owner: 0, style: st, tables: [], R };
    if (o) mapSrc(o.handle, rec.h);
    let name = st.name || (o ? 'Style' + rec.h.toString(16) : 'Standard');
    const used = new Set(dict.items.map((x) => x[0].toUpperCase()));
    let n = name, i = 2; while (used.has(n.toUpperCase())) n = name + '_' + i++;
    dict.items.push([n, rec.h]);
    const v = { rec };
    styles.set(k, v);
    objRecs.push(rec);
    return v;
  }
  const styleNameIds = (st) => {
    const m = new Map([['_TITLE', 1], ['_HEADER', 2], ['_DATA', 3], ['TABLE', 4]]);
    for (const c of st.cellStyles || []) if (c.name) m.set(String(c.name).toUpperCase(), c.id);
    return m;
  };

  // handle resolvers used by the encoders (everything is allocated by then)
  const R = {
    src,
    style: (name) => (name ? styleRef(name) : styleRef('Standard')),
    ltype: (name) => ltypeRef(name).h || 0,
  };

  function fieldRecs(f, tableH) {
    // claim the source handle (a field shared by two cells is written once)
    const k = hexKey(f.handle);
    if (k && srcMap.has(k)) return srcMap.get(k);
    const rec = { t: 'FIELD', h: next(), owner: 0, field: f, kids: [], ref: src };
    if (k) mapSrc(k, rec.h);
    rec.kids = (f.children || []).map((x) => fieldRecs(x, rec.h)).filter(Boolean);
    for (const kid of objRecs.filter((x) => x.t === 'FIELD' && rec.kids.includes(x.h))) kid.parent = rec.h;
    const srcObj = k ? byH.get(k) : null;
    rec.resolveOwner = (r) => {
      if (r.parent) { r.owner = r.parent; r.reactors = [r.parent]; return; }
      const o = srcObj && src(srcObj.owner);
      r.owner = o || tableH;
      r.reactors = o ? [o] : [];
    };
    objRecs.push(rec);
    return rec.h;
  }

  const T = {};
  T.convert = (e, owner, c) => {
    const B = blockByName.get(String(e.block ?? '').toUpperCase()) || blocks.find((x) => hexKey(x.src.record) === hexKey(e.blockRecord ?? e.block));
    if (!B || B.kind !== 'block') return 'ACAD_TABLE without its block';
    const t = e.table;
    const head = { ...c('ACAD_TABLE'), insert: P(e.insert), scale: e.scale, rotation: num(e.rotation), extrusion: e.extrusion, horizDir: e.horizDir, blockRef: B };
    B.inserts.push(head.h);
    if (!t || !Array.isArray(t.rows) || !Array.isArray(t.columns) || !t.rows.length || !t.columns.length) {
      // no table data in the model (a reader that did not decode it): still a table, one empty cell per grid slot is not possible → a reference
      return [{ ...head, t: 'INSERT', attribs: [], cols: 1, rows: 1, colSpacing: 0, rowSpacing: 0 }];
    }
    nTables++;
    ensureDict();
    if (globalThis.TBL_DEBUG === 'insert') return [{ ...head, t: 'INSERT', attribs: [], cols: 1, rows: 1, colSpacing: 0, rowSpacing: 0 }];
    const sv = (t.style && byH.get(hexKey(t.style))?.type === 'TABLESTYLE' ? addStyle(byH.get(hexKey(t.style))) : null)
      || [...styles.values()].find((x) => String(x.rec.style.name).toUpperCase() === String(t.styleName || '').toUpperCase())
      || [...styles.values()].find((x) => /^standard$/i.test(x.rec.style.name)) || addStyle(null);
    sv.rec.tables.push(e.handle);
    const ids = styleNameIds(sv.rec.style);
    // cells: fields → FIELD records; field-less copies keep their text
    const cells = t.cells.map((row) => row.map((x) => ({ ...x, ...(x.overrides ? { overrides: { ...x.overrides, ...(x.overrides.borders ? { borders: { ...x.overrides.borders } } : {}) } } : {}) })));
    canonicalBorders(cells);
    const fieldOf = new Map();
    for (const row of cells) for (const x of row) if (x.field && x.type !== 'block') { fieldOf.set(x, fieldRecs(x.field, head.h)); nFieldCells++; }
    head.table = { ...t, cells };
    head.R = {
      ...R,
      tableStyle: () => sv.rec.h,
      styleId: (name) => ids.get(String(name ?? '').toUpperCase()) ?? 0,
      field: (cell) => fieldOf.get(cell) || 0,
      block: (cell) => { const b = blockByName.get(String(cell.block ?? '').toUpperCase()); return b ? b.hdr : src(cell.blockRecord); },
    };
    return [head];
  };

  T.finish = ({ recs, H }) => {
    if (!dict) return;
    dict.owner = H.nod; dict.reactors = [H.nod];
    for (const s of styles.values()) { s.rec.owner = dict.h; s.rec.ownerDict = dict.h; }
    recs.push(dict, ...objRecs);
    const nod = recs.find((r) => r.h === H.nod && r.t === 'DICTIONARY');
    if (nod && !nod.items.some((x) => x[0] === 'ACAD_TABLESTYLE')) { nod.items.push(['ACAD_TABLESTYLE', dict.h]); nod.items.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)); }
    if (fieldFallback) env.report.notes.push(msg('ccdwg.write.table_fields', { n: fieldFallback }));
    env.report.tables = { tables: nTables, styles: styles.size, fieldCells: nFieldCells };
  };
  return T;
}
