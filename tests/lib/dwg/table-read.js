/* SPDX-License-Identifier: Apache-2.0 */
/**
 * table-read.js — ACAD_TABLE and its helper objects, decoded (cc-dwg, Apache-2.0; builder T).
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: 20.4.96 TABLE (until R21, and R24+),
 * 20.4.97 TABLECONTENT, 20.4.98 cell content geometry, 20.4.99 value, 20.4.100 custom data, 20.4.101 TABLESTYLE
 * (until R21, R24) with 20.4.101.3 content format and 20.4.101.4 cell style, 20.4.102 CELLSTYLEMAP,
 * 20.4.103 TABLEGEOMETRY, 20.4.76 FIELD, 20.4.77 FIELDLIST. Where the spec is wrong or silent the layout was
 * found by experiment on the corpus (testfiles/dwg-corpus: example_2000…2018 and blocks_and_tables_-_imperial,
 * each saved in all six versions by the ODA File Converter, against the converter's DXF of the same file);
 * those places are marked "Spec gap:".
 *
 *   TABLE_DECODERS   { ACAD_TABLE, TABLESTYLE, CELLSTYLEMAP, TABLECONTENT, TABLEGEOMETRY, FIELD, FIELDLIST }
 *                    decoder(r, h, rec, ctx) as in objects-read.js; handle references are absolute Numbers
 *                    under keys starting with "_" (resolved by the model builders below).
 *   tableEntityFields(rec, f, res)   fills the model fields of an ACAD_TABLE entity (f) from its record:
 *                    f.table = { rows, columns, cells, styleName, flowDirection, … } (see model.js)
 *   tableObjectFields(rec, f, res)   the same for TABLESTYLE / CELLSTYLEMAP / TABLECONTENT / TABLEGEOMETRY / FIELD
 *     res = { hx(handle) → hex, nameOf(handle) → name, get(handle) → record }
 */

import { DwgReadError } from './bits-read.js';

/**
 * Colours of the table objects. Spec gap: R2000 files (written by the ODA File Converter) store the R2004 form
 * (BS index, BL rgb word, RC name flags) in TABLESTYLE / CELLSTYLEMAP / TABLECONTENT, not the R2000 BS index —
 * found by experiment (the R2000 objects decode to the end only so, and match the converter's DXF).
 */
function cmc(r) {
  if (r.version >= 18) return r.CMC();
  const v = r.version; r.version = 18;
  try { return r.CMC(); } finally { r.version = v; }
}
const fits = (r, n, minBits) => {
  if (!(n >= 0) || n * minBits > r.end - r.pos) throw new DwgReadError('count ' + n + ' is larger than the data');
  return n;
};

// ---------------------------------------------------------------- 20.4.99 value
/**
 * A value (20.4.99). R2007+: flags BL, data type BL, the data unless flags & 1 (kGeneral), unit type BL, format
 * string TV, value string TV. Object ids (type 64) come from the handle stream.
 */
export function readValue(r, h, rec, ctx) {
  const v = {};
  if (ctx.ver >= 21) v.flags = r.BL();
  v.dataType = r.BL();
  if (!(ctx.ver >= 21 && v.flags & 1)) {
    switch (v.dataType) {
      case 0: v.value = r.BL(); break;   // unknown
      case 1: v.value = r.BL() | 0; break;
      case 2: v.value = r.BD(); break;
      case 4:
        // Spec gap: from R2007 a string value is not a TV but BL byte count + UTF-16LE text with its NUL, in the
        // data stream (found by experiment: "test" = 10 bytes in example_2000 saved as R2007).
        if (ctx.ver >= 21) { const n = fits(r, r.BL(), 8); v.value = utf16(r.bytes(n)); }
        else v.value = r.TV();
        break;
      case 8: { const n = fits(r, r.BL(), 8); v.bytes = hexOf(r.bytes(n)); break; }   // date (Int64)
      case 16: { const n = fits(r, r.BL(), 8); v.value = n >= 16 ? r.RD2() : (r.bytes(n), null); break; }
      case 32: { const n = fits(r, r.BL(), 8); v.value = n >= 24 ? r.RD3() : (r.bytes(n), null); break; }
      case 64: v._id = h.H(rec.handle); break;
      case 128: case 256: case 512: { const n = fits(r, r.BL(), 8); v.bytes = hexOf(r.bytes(n)); break; }
      default: throw new DwgReadError('value data type ' + v.dataType);
    }
  }
  if (ctx.ver >= 21) { v.unitType = r.BL(); v.format = r.TV(); v.text = r.TV(); }
  return v;
}
function hexOf(b) { let s = ''; for (const x of b) s += (x < 16 ? '0' : '') + x.toString(16).toUpperCase(); return s; }

// ---------------------------------------------------------------- 20.4.100 custom data
function readCustomData(r, h, rec, ctx) {
  const n = fits(r, r.BL(), 2);
  const out = [];
  for (let i = 0; i < n; i++) out.push({ name: r.TV(), value: readValue(r, h, rec, ctx) });
  return out;
}

// ---------------------------------------------------------------- 20.4.101.3 content format, 20.4.101.4 cell style
function readContentFormat(r, h, rec) {
  return {
    overrides: r.BL(), propertyFlags: r.BL(), dataType: r.BL(), unitType: r.BL(), format: r.TV(), rotation: r.BD(),
    blockScale: r.BD(), alignment: r.BL(), color: cmc(r), _textStyle: h.H(rec.handle), textHeight: r.BD(),
  };
}
function readCellStyle(r, h, rec) {
  const s = { styleType: r.BL() };
  s.hasData = r.BS();
  if (!s.hasData) return s;
  s.overrides = r.BL(); s.mergeFlags = r.BL(); s.background = cmc(r); s.contentLayout = r.BL();
  s.content = readContentFormat(r, h, rec);
  s.marginFlags = r.BS();
  if (s.marginFlags & 1) s.margins = { vertical: r.BD(), horizontal: r.BD(), bottom: r.BD(), right: r.BD(), hSpacing: r.BD(), vSpacing: r.BD() };
  const nb = fits(r, r.BL(), 2);
  s.borders = [];
  for (let i = 0; i < nb; i++) {
    const b = { edge: r.BL() };
    if (b.edge) {
      b.overrides = r.BL(); b.borderType = r.BL(); b.color = cmc(r); b.lineweight = r.BLs ? r.BLs() : r.BL() | 0;
      b._linetype = h.H(rec.handle); b.invisible = r.BL(); b.doubleSpacing = r.BD();
    }
    s.borders.push(b);
  }
  return s;
}
/** A cell style with its id, class and name (the cell style map and the R24 table style). */
function readNamedCellStyle(r, h, rec) {
  const s = readCellStyle(r, h, rec);
  s.id = r.BL(); s.styleClass = r.BL(); s.name = r.TV();
  return s;
}

// ---------------------------------------------------------------- 20.4.97 table content (without the common object data)
function readTableContent(r, h, rec, ctx) {
  const t = { name: r.TV(), description: r.TV() };
  const nc = fits(r, r.BL(), 8);
  t.columns = [];
  for (let i = 0; i < nc; i++) {
    const c = { name: r.TV(), customData: r.BL(), custom: readCustomData(r, h, rec, ctx) };
    c.style = readCellStyle(r, h, rec); c.styleId = r.BL(); c.width = r.BD();
    t.columns.push(c);
  }
  const nr = fits(r, r.BL(), 8);
  t.rows = [];
  for (let i = 0; i < nr; i++) {
    const n = fits(r, r.BL(), 8);
    const row = { cells: [] };
    for (let k = 0; k < n; k++) {
      const c = { state: r.BL(), tooltip: r.TV(), customData: r.BL(), custom: readCustomData(r, h, rec, ctx) };
      c.hasLink = r.BL();
      if (c.hasLink) { c._link = h.H(rec.handle); c.linkRows = r.BL(); c.linkCols = r.BL(); c.linkUnknown = r.BL(); }
      const ncont = fits(r, r.BL(), 2);
      c.contents = [];
      for (let j = 0; j < ncont; j++) {
        const ct = { type: r.BL() };
        if (ct.type === 1) ct.value = readValue(r, h, rec, ctx);
        else if (ct.type === 2) ct._field = h.H(rec.handle);
        else if (ct.type === 4) ct._block = h.H(rec.handle);
        const na = fits(r, r.BL(), 2);
        ct.attrs = [];
        for (let a = 0; a < na; a++) ct.attrs.push({ _attdef: h.H(rec.handle), value: r.TV(), index: r.BL() });
        ct.hasFormat = r.BS();
        if (ct.hasFormat) ct.format = readContentFormat(r, h, rec);
        c.contents.push(ct);
      }
      c.style = readCellStyle(r, h, rec); c.styleId = r.BL();
      c.geomFlag = r.BL();
      if (c.geomFlag) {
        c.geomUnknown = r.BL(); c.geomA = r.BD(); c.geomB = r.BD();
        c.geomDataFlags = r.BL(); c._geomUnknown = h.H(rec.handle);
        if (c.geomDataFlags) c.geometry = readContentGeometry(r);
      }
      row.cells.push(c);
    }
    row.customData = r.BL(); row.custom = readCustomData(r, h, rec, ctx);
    row.style = readCellStyle(r, h, rec); row.styleId = r.BL(); row.height = r.BD();
    t.rows.push(row);
  }
  const nf = fits(r, r.BL(), 0);
  t._fields = [];
  for (let i = 0; i < nf; i++) t._fields.push(h.H(rec.handle));
  t.tableStyle = readCellStyle(r, h, rec);   // AcDbFormattedTableData: the table's cell style overrides
  const nm = fits(r, r.BL(), 8);
  t.merged = [];
  for (let i = 0; i < nm; i++) t.merged.push({ top: r.BL(), left: r.BL(), bottom: r.BL(), right: r.BL() });
  t._style = h.H(rec.handle);
  return t;
}
function readContentGeometry(r) {
  return { distTopLeft: r.BD3(), distCenter: r.BD3(), contentWidth: r.BD(), contentHeight: r.BD(), width: r.BD(), height: r.BD(), flags: r.BL() };
}

// ---------------------------------------------------------------- 20.4.96 TABLE
function insertPart(r, h, rec, ctx) {
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
  rec._owned = 0;
  if (ctx.ver >= 18 && rec._hasAttribs) rec._owned = r.BL();
  rec._h.block = h.H(rec.handle);
  if (rec._hasAttribs) {
    if (ctx.ver < 18) { rec._h.firstAttrib = h.H(rec.handle); rec._h.lastAttrib = h.H(rec.handle); }
    else { rec._h.attribs = []; for (let i = 0; i < rec._owned; i++) rec._h.attribs.push(h.H(rec.handle)); }
    rec._h.seqend = h.H(rec.handle);
  }
}

/** R13–R21 table data: the grid, the cells and the table-wide overrides. */
function oldTable(r, h, rec, ctx) {
  const t = rec._table = {};
  t.flags = r.BS(); rec.horizDir = r.BD3();
  const nc = fits(r, r.BL(), 2), nr = fits(r, r.BL(), 2);
  t.colWidths = []; for (let i = 0; i < nc; i++) t.colWidths.push(r.BD());
  t.rowHeights = []; for (let i = 0; i < nr; i++) t.rowHeights.push(r.BD());
  rec._h.tableStyle = h.H(rec.handle);
  t.cells = [];
  for (let i = 0; i < nr * nc; i++) {
    const c = { type: r.BS(), edgeFlags: r.RC(), merged: r.B(), autoFit: r.B(), mergedWidth: r.BL(), mergedHeight: r.BL(), rotation: r.BD() };
    c._value = h.H(rec.handle);
    if (c.type === 1) {
      // Spec gap: from R2007 a text cell stores no text of its own; the cell value (below) holds it (found by
      // experiment: the string stream of example_2000 saved as R2007 holds 2 strings per cell, not 3).
      if (!c._value && ctx.ver < 21) c.text = r.TV();
    } else if (c.type === 2) {
      c.blockScale = r.BD();
      c.hasAttrs = r.B();
      if (c.hasAttrs) {
        const n = r.BS();
        c.attrs = [];
        for (let k = 0; k < n; k++) c.attrs.push({ _attdef: h.H(rec.handle), index: r.BS(), value: r.TV() });
      }
    }
    c.hasOverrides = r.B();
    if (c.hasOverrides) {
      const f = c.overrideFlags = r.BL();
      c.virtualEdges = r.RC();
      if (f & 0x01) c.alignment = r.BS();   // Spec gap: the spec says RS; it is a BS (found by experiment: blocks_and_tables)
      if (f & 0x02) c.fillNone = r.B();
      if (f & 0x04) c.background = cmc(r);
      if (f & 0x08) c.contentColor = cmc(r);
      if (f & 0x10) c._textStyle = h.H(rec.handle);
      if (f & 0x20) c.textHeight = r.BD();
      c.borders = {};
      // Spec gap: on an edge marked virtual (178) the border flags stay set but no values are stored: they are the
      // adjacent cell's (its opposite edge) — found by having the ODA File Converter write a border override.
      for (const [k, side] of [[0, 'top'], [1, 'right'], [2, 'bottom'], [3, 'left']]) {
        const b = {};
        if (c.virtualEdges & (1 << k)) continue;
        if (f & (0x40 << k)) b.color = cmc(r);
        if (f & (0x400 << k)) b.lineweight = r.BS() << 16 >> 16;
        // Spec gap: 1 = invisible (as the table-wide flags; the ODA File Converter turns 1 into R2010+ "invisible")
        if (f & (0x4000 << k)) b.visible = r.BS() === 0;
        if (Object.keys(b).length) c.borders[side] = b;
      }
    }
    if (ctx.ver >= 21) { c.unknown = r.BL(); c.value = readValue(r, h, rec, ctx); }
    t.cells.push(c);
  }
  // table-wide overrides
  t.hasOverrides = r.B();
  if (t.hasOverrides) {
    const f = t.overrideFlags = r.BL();
    const o = t.overrides = {};
    if (f & 1) o.titleSuppressed = r.B();
    if (f & 4) o.flowDirection = r.BS();
    if (f & 8) o.hMargin = r.BD();
    if (f & 0x10) o.vMargin = r.BD();
    const rows = ['title', 'header', 'data'];
    rows.forEach((n, i) => { if (f & (0x20 << i)) o[n + 'Color'] = cmc(r); });
    rows.forEach((n, i) => { if (f & (0x100 << i)) o[n + 'FillNone'] = r.B(); });
    rows.forEach((n, i) => { if (f & (0x800 << i)) o[n + 'Fill'] = cmc(r); });
    rows.forEach((n, i) => { if (f & (0x4000 << i)) o[n + 'Align'] = r.BS(); });
    rows.forEach((n, i) => { if (f & (0x20000 << i)) o['_' + n + 'Style'] = h.H(rec.handle); });
    rows.forEach((n, i) => { if (f & (0x100000 << i)) o[n + 'Height'] = r.BD(); });
  }
  const border = (read) => {
    if (!r.B()) return undefined;
    const f = r.BL(), o = { flags: f };
    for (let i = 0; i < 18; i++) if (f & (1 << i)) o[i] = read();
    return o;
  };
  t.borderColors = border(() => cmc(r));
  t.borderLineweights = border(() => r.BS() << 16 >> 16);
  t.borderVisibility = border(() => r.BS());
}

/** R24+ table: the INSERT part, a few unknowns, the table content inline, then the break data. */
function newTable(r, h, rec, ctx) {
  const t = rec._table = {};
  t.unknownRC = r.RC(); t._unknownH = h.H(rec.handle); t.unknownBL = r.BL();
  if (ctx.ver === 24) t.unknownB = r.B();
  else t.unknownBL2 = r.BL();
  t.content = readTableContent(r, h, rec, ctx);
  t.unknownBS = r.BS(); rec.horizDir = r.BD3();
  t.hasBreak = r.BL();
  if (t.hasBreak) {
    const b = t.break = { options: r.BL(), flow: r.BL(), spacing: r.BD(), unknown1: r.BL(), unknown2: r.BL() };
    const n = fits(r, r.BL(), 8);
    b.heights = [];
    for (let i = 0; i < n; i++) b.heights.push({ position: r.BD3(), height: r.BD(), flags: r.BL() });
  }
  const n = fits(r, r.BL(), 8);
  t.rowRanges = [];
  for (let i = 0; i < n; i++) t.rowRanges.push({ position: r.BD3(), start: r.BL(), end: r.BL() });
}

export const TABLE_DECODERS = {};
TABLE_DECODERS.ACAD_TABLE = (r, h, rec, ctx) => {
  insertPart(r, h, rec, ctx);
  if (ctx.ver >= 24) newTable(r, h, rec, ctx);
  else oldTable(r, h, rec, ctx);
  rec._hLeft = h.end - h.pos;
};

// ---------------------------------------------------------------- 20.4.101 TABLESTYLE
TABLE_DECODERS.TABLESTYLE = (r, h, rec, ctx) => {
  if (ctx.ver >= 24) {
    rec.unknownRC = r.RC(); rec.description = r.TV(); rec.unknownBL1 = r.BL(); rec.unknownBL2 = r.BL(); rec._h.unknown = h.H(rec.handle);
    rec.tableCellStyle = readNamedCellStyle(r, h, rec);
    // Spec gap: each of the cell styles that follow is preceded by a BL equal to its id (1 title, 2 header,
    // 3 data) — found by experiment (the R2010–R2018 table styles of the corpus decode to the end only so).
    const n = fits(r, r.BL(), 8);
    rec.cellStyles = [];
    for (let i = 0; i < n; i++) { const pre = r.BL(); const cs = readNamedCellStyle(r, h, rec); cs.preId = pre; rec.cellStyles.push(cs); }
  } else {
    rec.description = r.TV(); rec.flowDirection = r.BS(); rec.flags = r.BS(); rec.hMargin = r.BD(); rec.vMargin = r.BD();
    rec.titleSuppressed = r.B(); rec.headerSuppressed = r.B();
    rec.rowStyles = [];
    for (let i = 0; i < 3; i++) {
      const s = { _textStyle: h.H(rec.handle), textHeight: r.BD(), alignment: r.BS(), textColor: cmc(r), fillColor: cmc(r), fillEnabled: r.B(), borders: [] };
      for (let k = 0; k < 6; k++) s.borders.push({ lineweight: r.BS() << 16 >> 16, visible: r.B(), color: cmc(r) });
      if (ctx.ver >= 21) { s.dataType = r.BL(); s.unitType = r.BL(); s.format = r.TV(); }
      rec.rowStyles.push(s);
    }
  }
  rec._hLeft = h.end - h.pos;
};

// ---------------------------------------------------------------- 20.4.102 CELLSTYLEMAP
TABLE_DECODERS.CELLSTYLEMAP = (r, h, rec) => {
  const n = fits(r, r.BL(), 8);
  rec.cellStyles = [];
  for (let i = 0; i < n; i++) rec.cellStyles.push(readNamedCellStyle(r, h, rec));
  rec._hLeft = h.end - h.pos;
};

// ---------------------------------------------------------------- 20.4.97 TABLECONTENT (R21 round-trip object)
TABLE_DECODERS.TABLECONTENT = (r, h, rec, ctx) => {
  rec._content = readTableContent(r, h, rec, ctx);
  rec._hLeft = h.end - h.pos;
};

// ---------------------------------------------------------------- 20.4.103 TABLEGEOMETRY
TABLE_DECODERS.TABLEGEOMETRY = (r, h, rec) => {
  rec.rowCount = r.BL(); rec.colCount = r.BL();
  const n = fits(r, r.BL(), 8);
  rec.cells = [];
  for (let i = 0; i < n; i++) {
    const c = { flags: r.BL(), widthWithGap: r.BD(), heightWithGap: r.BD(), _unknown: h.H(rec.handle), contents: [] };
    const k = fits(r, r.BL(), 8);
    for (let j = 0; j < k; j++) c.contents.push({ distTopLeft: r.BD3(), distCenter: r.BD3(), contentWidth: r.BD(), contentHeight: r.BD(), width: r.BD(), height: r.BD(), unknown: r.BL() });
    rec.cells.push(c);
  }
  rec._hLeft = h.end - h.pos;
};

// ---------------------------------------------------------------- 20.4.76 FIELD, 20.4.77 FIELDLIST
TABLE_DECODERS.FIELD = (r, h, rec, ctx) => {
  rec.evaluatorId = r.TV(); rec.code = r.TV();
  const nc = fits(r, r.BL(), 0);
  rec._h.children = []; for (let i = 0; i < nc; i++) rec._h.children.push(h.H(rec.handle));
  const no = fits(r, r.BL(), 0);
  rec._h.objects = []; for (let i = 0; i < no; i++) rec._h.objects.push(h.H(rec.handle));
  if (ctx.ver < 21) rec.format = r.TV();
  rec.evalOptions = r.BL(); rec.filingOptions = r.BL(); rec.state = r.BL(); rec.evalStatus = r.BL(); rec.evalError = r.BL();
  rec.evalMessage = r.TV();
  rec.value = readValue(r, h, rec, ctx);
  rec.valueString = r.TV(); rec.valueStringLength = r.BL();
  const nk = fits(r, r.BL(), 2);
  rec.childValues = [];
  for (let i = 0; i < nk; i++) rec.childValues.push({ key: r.TV(), value: readValue(r, h, rec, ctx) });
  rec._hLeft = h.end - h.pos;
};
TABLE_DECODERS.FIELDLIST = (r, h, rec) => {
  const n = fits(r, r.BL(), 0);
  rec.unknown = r.B();
  rec._h.fields = []; for (let i = 0; i < n; i++) rec._h.fields.push(h.H(rec.handle));
};
function utf16(b) {
  let s = '';
  for (let i = 0; i + 1 < b.length; i += 2) { const c = b[i] | (b[i + 1] << 8); if (!c) break; s += String.fromCharCode(c); }
  return s;
}

// ================================================================ model (version-neutral, see model.js ACAD_TABLE)
const SIDES = ['top', 'right', 'bottom', 'left'];
/** R24 border edge flag → side name (20.4.101.4) */
const EDGE_SIDE = { 1: 'top', 2: 'right', 4: 'bottom', 8: 'left', 16: 'insideV', 32: 'insideH' };
/** R13–R21 table style borders, in stored order (20.4.101.1) */
const OLD_BORDER_ORDER = ['top', 'insideH', 'bottom', 'left', 'insideV', 'right'];
export const DEFAULT_STYLE_NAMES = { 1: '_TITLE', 2: '_HEADER', 3: '_DATA', 4: 'Table' };

/** A value (20.4.99) as model JSON: { dataType, unitType?, format?, text?, value? } */
export function valueModel(v, res) {
  if (!v) return undefined;
  const o = { dataType: v.dataType };
  if (v.flags !== undefined) o.flags = v.flags;
  if (v.value !== undefined) o.value = v.value;
  if (v.bytes !== undefined) o.bytes = v.bytes;
  if (v._id !== undefined) o.id = res.hx(v._id);
  if (v.unitType) o.unitType = v.unitType;
  if (v.format) o.format = v.format;
  if (v.text) o.text = v.text;
  return o;
}
/** The text a value shows. */
function valueText(v) {
  if (!v || (v.flags !== undefined && v.flags & 1)) return '';
  if (v.text) return v.text;
  if (v.dataType === 4) return v.value ?? '';
  if (v.dataType === 1 || v.dataType === 2) return v.value === undefined ? '' : String(v.value);
  return '';
}

/** A FIELD record and its children as a model tree. */
export function fieldModel(handle, res, depth = 0) {
  const r = res.get(handle);
  if (!r || r.type !== 'FIELD' || depth > 16) return undefined;
  const f = { handle: res.hx(handle), evaluatorId: r.evaluatorId, code: r.code };
  if (r.format) f.format = r.format;
  Object.assign(f, { evalOptions: r.evalOptions, filingOptions: r.filingOptions, state: r.state, evalStatus: r.evalStatus, evalError: r.evalError });
  if (r.evalMessage) f.evalMessage = r.evalMessage;
  f.value = valueModel(r.value, res);
  f.valueString = r.valueString;
  if (r.childValues.length) f.childValues = r.childValues.map((c) => ({ key: c.key, value: valueModel(c.value, res) }));
  const kids = (r._h.children || []).map((h) => fieldModel(h, res, depth + 1)).filter(Boolean);
  if (kids.length) f.children = kids;
  if ((r._h.objects || []).length) f.objects = r._h.objects.map(res.hx);
  return f;
}
/** What a field shows: its cached value string, or its code with each %<\_FldIdx n>% replaced by child n. */
export function fieldText(f) {
  if (!f) return '';
  if (f.valueString) return f.valueString;
  const kids = f.children || [];
  return String(f.code || '').replace(/%<\\_FldIdx (\d+)>%/g, (m, i) => (kids[+i] ? fieldText(kids[+i]) : ''));
}

const colorOrUndef = (c) => (c ? { ...c } : undefined);
function bordersModel(list) {
  const b = {};
  for (const x of list || []) {
    if (!x.edge || !EDGE_SIDE[x.edge]) continue;
    const s = { overrides: x.overrides, type: x.borderType, color: x.color, lineweight: x.lineweight, visible: !x.invisible, doubleSpacing: x.doubleSpacing };
    if (x._linetype) s.linetypeHandle = x._linetype;
    b[EDGE_SIDE[x.edge]] = s;
  }
  return b;
}
/** A cell style (20.4.101.4 + content format 20.4.101.3) as model JSON, handles resolved. */
export function cellStyleModel(s, res) {
  if (!s) return undefined;
  const o = { type: s.styleType };
  if (s.id !== undefined) { o.id = s.id; o.styleClass = s.styleClass; o.name = s.name; }
  if (!s.hasData) return o;
  const c = s.content;
  Object.assign(o, {
    overrides: s.overrides, mergeFlags: s.mergeFlags, background: s.background, contentLayout: s.contentLayout,
    content: { overrides: c.overrides, propertyFlags: c.propertyFlags, dataType: c.dataType, unitType: c.unitType, format: c.format,
      rotation: c.rotation, blockScale: c.blockScale, align: c.alignment, color: c.color, textStyle: res.nameOf(c._textStyle) ?? res.hx(c._textStyle), textHeight: c.textHeight },
  });
  if (s.margins) o.margins = { ...s.margins };
  const b = bordersModel(s.borders);
  for (const k in b) if (b[k].linetypeHandle) { b[k].linetype = res.nameOf(b[k].linetypeHandle) ?? res.hx(b[k].linetypeHandle); delete b[k].linetypeHandle; }
  o.borders = b;
  return o;
}

/** The name a dictionary gives an object (its owner's entry), e.g. a table style's name. */
function entryName(handle, res) {
  const r = res.get(handle);
  const d = r && res.get(r._h.owner);
  if (!d || !d.names || !d._h.items) return undefined;
  const k = d._h.items.indexOf(handle);
  return k >= 0 ? d.names[k] : undefined;
}

/** Table style → neutral { name, description, flowDirection, flags, hMargin, vMargin, titleSuppressed, headerSuppressed, cellStyles[] } */
export function tableStyleModel(r, res) {
  const o = { name: entryName(r.handle, res), description: r.description };
  if (r.rowStyles) {   // R13–R21
    Object.assign(o, { flowDirection: r.flowDirection, flags: r.flags, hMargin: r.hMargin, vMargin: r.vMargin, titleSuppressed: !!r.titleSuppressed, headerSuppressed: !!r.headerSuppressed });
    o.cellStyles = r.rowStyles.map((s, i) => {
      const id = [3, 1, 2][i];
      const borders = {};
      s.borders.forEach((b, k) => { borders[OLD_BORDER_ORDER[k]] = { lineweight: b.lineweight, visible: !!b.visible, color: b.color }; });
      const cs = { id, name: DEFAULT_STYLE_NAMES[id], styleClass: id === 3 ? 1 : 2, textStyle: res.nameOf(s._textStyle) ?? res.hx(s._textStyle), textHeight: s.textHeight,
        align: s.alignment, color: s.textColor, background: s.fillColor, backgroundEnabled: !!s.fillEnabled, borders };
      if (s.dataType !== undefined) Object.assign(cs, { dataType: s.dataType, unitType: s.unitType, format: s.format });
      return cs;
    });
  } else {   // R24+: the "Table" cell style carries the table-wide settings
    const t = r.tableCellStyle;
    o.flags = r.unknownBL1; o.unknown = { rc: r.unknownRC, bl2: r.unknownBL2 };
    o.tableCellStyle = cellStyleModel(t, res);
    o.flowDirection = t.overrides !== undefined && (t.mergeFlags & 0x10000) ? 1 : 0;
    o.cellStyles = r.cellStyles.map((s) => {
      const m = cellStyleModel(s, res);
      const cs = { id: s.id, name: s.name, styleClass: s.styleClass };
      if (m.content) Object.assign(cs, { textStyle: m.content.textStyle, textHeight: m.content.textHeight, align: m.content.align, color: m.content.color,
        background: m.background, backgroundEnabled: !(m.background && m.background.index === 257), dataType: m.content.dataType, unitType: m.content.unitType, format: m.content.format,
        rotation: m.content.rotation, margins: m.margins, borders: m.borders, cell: m });
      return cs;
    });
    if (t.margins) { o.vMargin = t.margins.vertical; o.hMargin = t.margins.horizontal; }
  }
  return o;
}

/** model fields of an ACAD_TABLE entity record (f = the entity being built) */
export function tableEntityFields(rec, f, res) {
  const H2 = rec._h;
  f.block = res.nameOf(H2.block) ?? res.hx(H2.block);
  f.blockRecord = res.hx(H2.block);
  delete f.partial; delete f.tableFlags; delete f.rows; delete f.cols; delete f.colWidths; delete f.rowHeights;
  const t = rec._table;
  if (!t) return;
  f.horizDir = rec.horizDir;
  if (t.content) f.table = newTableModel(rec, t, res);
  else f.table = oldTableModel(rec, t, res);
}

function styleOf(handle, res) {
  const r = res.get(handle);
  return r && r.type === 'TABLESTYLE' ? tableStyleModel(r, res) : null;
}

function oldTableModel(rec, t, res) {
  const style = styleOf(rec._h.tableStyle, res);
  const nc = t.colWidths.length, nr = t.rowHeights.length;
  const T = { style: res.hx(rec._h.tableStyle), styleName: style ? style.name : undefined, flags: t.flags };
  const o = t.overrides || {};
  T.flowDirection = o.flowDirection ?? (style ? style.flowDirection : 0) ?? 0;
  T.titleSuppressed = o.titleSuppressed !== undefined ? !!o.titleSuppressed : style ? style.titleSuppressed : false;
  T.headerSuppressed = style ? style.headerSuppressed : false;
  const rowStyle = (i) => {
    let k = 0;
    if (!T.titleSuppressed) { if (i === k) return '_TITLE'; k++; }
    if (!T.headerSuppressed) { if (i === k) return '_HEADER'; }
    return '_DATA';
  };
  const styleByName = new Map((style ? style.cellStyles : []).map((s) => [s.name, s]));
  T.rows = t.rowHeights.map((h, i) => ({ height: h, style: rowStyle(i) }));
  T.columns = t.colWidths.map((w) => ({ width: w }));
  T.cells = [];
  T.merged = [];
  for (let i = 0; i < nr; i++) {
    const row = [];
    for (let j = 0; j < nc; j++) {
      const c = t.cells[i * nc + j];
      const cell = { type: c.type === 2 ? 'block' : 'text', value: '' };
      if (c.type === 2) {
        cell.block = res.nameOf(c._value) ?? res.hx(c._value);
        cell.blockRecord = res.hx(c._value);
        cell.blockScale = c.blockScale;
        if (c.attrs) cell.attrs = c.attrs.map((a) => attrModel(a._attdef, a.value, a.index, res));
      } else if (c._value) {
        cell.field = fieldModel(c._value, res);
        cell.value = fieldText(cell.field);
      } else if (c.value) {
        cell.value = valueText(c.value);
      } else cell.value = c.text ?? '';
      if (c.value) cell.data = valueModel(c.value, res);
      cell.style = T.rows[i].style;
      cell.rotation = c.rotation;
      if (c.autoFit) cell.autoFit = true;
      if (c.mergedWidth > 1 || c.mergedHeight > 1) {
        cell.merged = { rows: c.mergedHeight || 1, cols: c.mergedWidth || 1 };
        T.merged.push({ top: i, left: j, bottom: i + cell.merged.rows - 1, right: j + cell.merged.cols - 1 });
      }
      if (c.merged) cell.covered = true;
      if (c.edgeFlags || c.virtualEdges) cell.edges = { flags: c.edgeFlags, virtual: c.virtualEdges || 0 };
      if (c.hasOverrides) {
        const ov = {};
        const fl = c.overrideFlags;
        if (fl & 0x01) ov.align = c.alignment;
        if (fl & 0x02) ov.fillNone = !!c.fillNone;
        if (fl & 0x04) ov.background = c.background;
        if (fl & 0x08) ov.color = c.contentColor;
        if (fl & 0x10) ov.textStyle = res.nameOf(c._textStyle) ?? res.hx(c._textStyle);
        if (fl & 0x20) ov.textHeight = c.textHeight;
        if (c.borders && Object.keys(c.borders).length) ov.borders = c.borders;
        if (Object.keys(ov).length) cell.overrides = ov;
      }
      const st = styleByName.get(cell.style);
      cell.align = cell.overrides && cell.overrides.align !== undefined ? cell.overrides.align : st ? st.align : undefined;
      row.push(cell);
    }
    T.cells.push(row);
  }
  canonicalBorders(T.cells);
  if (t.hasOverrides) {
    const ov = {};
    for (const k in o) if (k[0] === '_') ov[k.slice(1)] = res.nameOf(o[k]) ?? res.hx(o[k]); else ov[k] = o[k];
    T.overrides = ov;
    T.overrideFlags = t.overrideFlags;
  }
  for (const k of ['borderColors', 'borderLineweights', 'borderVisibility']) if (t[k]) T[k] = t[k];
  return T;
}

/**
 * Border overrides on a shared edge belong to the upper cell (its bottom) and the left cell (its right): a top or
 * left override moves to the neighbour — as the ODA File Converter stores them (found by experiment).
 */
export function canonicalBorders(cells) {
  for (let i = 0; i < cells.length; i++) for (let j = 0; j < cells[i].length; j++) {
    const b = cells[i][j].overrides?.borders;
    if (!b) continue;
    for (const [side, di, dj, to] of [['top', -1, 0, 'bottom'], ['left', 0, -1, 'right']]) {
      const n = cells[i + di]?.[j + dj];
      if (!b[side] || !n) continue;
      const ov = n.overrides || (n.overrides = {});
      ov.borders = { ...(ov.borders || {}), [to]: { ...(ov.borders?.[to] || {}), ...b[side] } };
      delete b[side];
    }
    if (!Object.keys(b).length) { delete cells[i][j].overrides.borders; if (!Object.keys(cells[i][j].overrides).length) delete cells[i][j].overrides; }
  }
}

function attrModel(attdef, value, index, res) {
  const a = { attdef: res.hx(attdef), value, index };
  const d = res.get(attdef);
  if (d && d.tag !== undefined) a.tag = d.tag;
  return a;
}

function newTableModel(rec, t, res) {
  const c = t.content;
  const style = styleOf(c._style, res);
  const T = { style: res.hx(c._style), styleName: style ? style.name : undefined };
  if (c.name) T.name = c.name;
  if (c.description) T.description = c.description;
  const names = new Map((style ? style.cellStyles : []).map((s) => [s.id, s.name]));
  const styleName = (id) => names.get(id) ?? DEFAULT_STYLE_NAMES[id] ?? (id ? 'id' + id : undefined);
  const ts = cellStyleModel(c.tableStyle, res);
  T.flowDirection = ts && ts.overrides !== undefined && ts.mergeFlags & 0x10000 ? 1 : style ? style.flowDirection : 0;
  T.rows = c.rows.map((r) => {
    const o = { height: r.height, style: styleName(r.styleId) };
    const st = cellStyleModel(r.style, res);
    if (st && st.overrides !== undefined) o.cellStyle = st;
    if (r.custom.length) o.custom = r.custom.map((x) => ({ name: x.name, value: valueModel(x.value, res) }));
    return o;
  });
  T.columns = c.columns.map((col) => {
    const o = { width: col.width };
    if (col.name) o.name = col.name;
    if (col.styleId) o.style = styleName(col.styleId);
    const st = cellStyleModel(col.style, res);
    if (st && st.overrides !== undefined) o.cellStyle = st;
    if (col.custom.length) o.custom = col.custom.map((x) => ({ name: x.name, value: valueModel(x.value, res) }));
    return o;
  });
  if (ts && ts.overrides !== undefined) T.tableCellStyle = ts;
  T.merged = c.merged.map((m) => ({ ...m }));
  const mergeAt = new Map(T.merged.map((m) => [m.top + ',' + m.left, m]));
  const covered = new Set();
  for (const m of T.merged) for (let i = m.top; i <= m.bottom; i++) for (let j = m.left; j <= m.right; j++) if (i !== m.top || j !== m.left) covered.add(i + ',' + j);
  T.cells = c.rows.map((row, i) => row.cells.map((x, j) => {
    const cell = { type: 'text', value: '' };
    const ct = x.contents[0];
    if (ct) {
      if (ct.type === 4) {
        cell.type = 'block';
        cell.block = res.nameOf(ct._block) ?? res.hx(ct._block);
        cell.blockRecord = res.hx(ct._block);
        if (ct.format) cell.blockScale = ct.format.blockScale;
        if (ct.attrs.length) cell.attrs = ct.attrs.map((a) => attrModel(a._attdef, a.value, a.index, res));
      } else if (ct.type === 2) {
        cell.field = fieldModel(ct._field, res);
        cell.value = fieldText(cell.field);
      } else if (ct.type === 1) {
        cell.value = valueText(ct.value);
        cell.data = valueModel(ct.value, res);
      }
      if (ct.format) cell.contentFormat = cellStyleModel({ styleType: 0, hasData: 1, overrides: 0, mergeFlags: 0, contentLayout: 0, content: ct.format, marginFlags: 0, borders: [] }, res).content;
      if (x.contents.length > 1) cell.extraContents = x.contents.length - 1;   // multiple contents per cell: only the first is modelled
    }
    cell.style = x.styleId ? styleName(x.styleId) : T.rows[i].style;
    const st = cellStyleModel(x.style, res);
    const cf = cell.contentFormat;
    cell.rotation = cf ? cf.rotation : 0;
    if (x.state) cell.state = x.state;
    if (x.tooltip) cell.tooltip = x.tooltip;
    if (x.custom.length) cell.custom = x.custom.map((k) => ({ name: k.name, value: valueModel(k.value, res) }));
    const m = mergeAt.get(i + ',' + j);
    if (m) cell.merged = { rows: m.bottom - m.top + 1, cols: m.right - m.left + 1 };
    if (covered.has(i + ',' + j)) cell.covered = true;
    // overrides: the cell style's and the content format's flagged properties (20.4.101.3 bits)
    const ov = {};
    const take = (fl, src) => {
      if (!src) return;
      if (fl & 0x10) ov.align = src.align;
      if (fl & 0x20) ov.color = src.color;
      if (fl & 0x40) ov.textStyle = src.textStyle;
      if (fl & 0x80) ov.textHeight = src.textHeight;
    };
    if (st && st.overrides !== undefined) {
      take(st.overrides, st.content);
      if (st.overrides & 0x200) { ov.background = st.background; if (st.background && st.background.index === 257) ov.fillNone = true; }
      cell.cellStyle = st;
    }
    if (cf) take(cf.overrides, cf);
    const sm = style && style.cellStyles.find((s) => s.name === cell.style);
    // R2010+ cells carry a border record per edge (override bits 26 on every one): an override is a value that
    // differs from the cell style's (found by having the ODA File Converter save an R2004 border override as R2018)
    if (st && st.borders) for (const side of ['top', 'right', 'bottom', 'left']) {
      const b = st.borders[side];
      if (!b) continue;
      const d = sm?.borders?.[side] || { color: { index: 0 }, lineweight: -2, visible: true };
      const x = {};
      if (JSON.stringify(b.color) !== JSON.stringify(d.color ?? { index: 0 })) x.color = b.color;
      if (b.lineweight !== (d.lineweight ?? -2)) x.lineweight = b.lineweight;
      if (b.visible !== (d.visible ?? true)) x.visible = b.visible;
      if (Object.keys(x).length) (ov.borders || (ov.borders = {}))[side] = x;
    }
    if (Object.keys(ov).length) cell.overrides = ov;
    cell.align = ov.align !== undefined ? ov.align : sm ? sm.align : undefined;
    return cell;
  }));
  T.tableBits = t.unknownBS;   // the BS after the R24 table content (6 or 38 in the corpus; meaning unknown)
  canonicalBorders(T.cells);
  if (t.hasBreak) T.breaks = { ...t.break };
  if (t.rowRanges.length) T.rowRanges = t.rowRanges.map((r) => ({ ...r }));
  return T;
}

/** model fields of the table objects (TABLESTYLE, CELLSTYLEMAP, TABLECONTENT, TABLEGEOMETRY, FIELD) */
export function tableObjectFields(rec, f, res) {
  switch (rec.type) {
    case 'TABLESTYLE': {
      for (const k of Object.keys(f)) if (!['handle', 'owner', 'reactors', 'extDict', 'type'].includes(k)) delete f[k];
      Object.assign(f, tableStyleModel(rec, res));
      break;
    }
    case 'CELLSTYLEMAP':
      f.cellStyles = rec.cellStyles.map((s) => cellStyleModel(s, res));
      break;
    case 'TABLECONTENT':
      f.content = deep(rec._content, res);
      break;
    case 'TABLEGEOMETRY':
      f.cells = deep(rec.cells, res);
      break;
    case 'FIELD': {
      const m = fieldModel(rec.handle, res);
      if (m) { delete m.children; Object.assign(f, m); f.children = (rec._h.children || []).map(res.hx); }
      break;
    }
  }
}
/** a plain copy with "_name" handle numbers turned into "name" hex strings */
function deep(v, res) {
  if (Array.isArray(v)) return v.map((x) => deep(x, res));
  if (!v || typeof v !== 'object') return v;
  const o = {};
  for (const k in v) {
    if (k[0] === '_') { const x = v[k]; o[k.slice(1)] = Array.isArray(x) ? x.map(res.hx) : typeof x === 'number' ? res.hx(x) : deep(x, res); }
    else o[k] = deep(v[k], res);
  }
  return o;
}
