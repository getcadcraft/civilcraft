/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dxf-model.js — an ASCII DXF file → the drawing model cc-dwg's readDwg() returns (docs/DWG-LIB-SPEC.md "Model";
 * lib/dwg/model.js), so BimCraft's views and the library adapters read DWG and DXF through the same code. No DOM.
 * Written from the public DXF reference (group codes) only. Byte-identical in bimcraft/dev and cadcraft/dev
 * (bin/test-bimcraft.mjs checks).
 *
 *   readDxfModel(text) → { version, codepage, header, classes: [], tables, blocks, layouts, objects, report }
 *
 * What is read: HEADER variables; LAYER, LTYPE (names), STYLE, DIMSTYLE (DIMSCALE …), BLOCK_RECORD tables; every block;
 * entities LINE POINT CIRCLE ARC ELLIPSE LWPOLYLINE POLYLINE (2D / 3D / polyface / mesh, VERTEX folded in) TEXT ATTRIB
 * ATTDEF MTEXT INSERT / MINSERT (ATTRIBs folded in) DIMENSION (→ DIMENSION_LINEAR …) LEADER HATCH (boundaries) SOLID
 * TRACE 3DFACE SPLINE RAY XLINE VIEWPORT IMAGE WIPEOUT TOLERANCE MLINE MULTILEADER (leaders, text, block) ACAD_TABLE
 * (its block) ARC_DIMENSION (its block and points) 3DSOLID / REGION / BODY / LIGHT / ACAD_PROXY_ENTITY (type only); objects LAYOUT and IMAGEDEF. Anything else is kept as
 * { type: 'UNKNOWN', dxfName } and counted in report.unknown, never guessed at. Entities of the ENTITIES section go to
 * the block of their owner (330), else *Model_Space / *Paper_Space by group 67; an R12 file without those blocks or
 * layouts gets them made up (Model, plus Layout1 when it has paper space).
 * Same conventions as readDwg: handles upper-case hex without leading zeros, angles radians, colours {index} | {rgb},
 * lineweights 1/100 mm (−1 ByLayer, −2 ByBlock, −3 default), `invisible`, xdata { APPNAME: [[code, value]…] }.
 */

const D2R = Math.PI / 180;
const HATCH_EDGE = { 1: 'line', 2: 'arc', 3: 'ellipse', 4: 'spline' };
const DIM_TYPES = ['DIMENSION_LINEAR', 'DIMENSION_ALIGNED', 'DIMENSION_ANG2LN', 'DIMENSION_DIAMETER', 'DIMENSION_RADIUS', 'DIMENSION_ANG3PT', 'DIMENSION_ORDINATE'];
const DIMVAR_CODES = { 40: 'DIMSCALE', 41: 'DIMASZ', 42: 'DIMEXO', 43: 'DIMDLI', 44: 'DIMEXE', 140: 'DIMTXT', 147: 'DIMGAP', 77: 'DIMTAD', 78: 'DIMZIN', 271: 'DIMDEC', 179: 'DIMADEC', 144: 'DIMLFAC', 141: 'DIMCEN' };

/** The value of a group by its code range (DXF reference, "Group code value types"). */
function typed(code, v) {
  if ((code >= 10 && code <= 59) || (code >= 110 && code <= 149) || (code >= 210 && code <= 239) || (code >= 460 && code <= 469) || (code >= 1010 && code <= 1059)) {
    const x = parseFloat(v); return Number.isFinite(x) ? x : 0;
  }
  if ((code >= 60 && code <= 99) || (code >= 160 && code <= 179) || (code >= 270 && code <= 289) || (code >= 370 && code <= 389)
    || (code >= 400 && code <= 409) || (code >= 420 && code <= 429) || (code >= 440 && code <= 459) || (code >= 1060 && code <= 1071)) {
    const x = parseInt(v, 10); return Number.isFinite(x) ? x : 0;
  }
  if (code >= 290 && code <= 299) return parseInt(v, 10) === 1;
  return v;
}
const hx = (v) => String(v || '').trim().toUpperCase().replace(/^0+/, '');

// ---- words (docs/LANG.md § Shared libraries; node tools/lang/lib-keys.mjs copies MESSAGES into the apps' lang/en.json)
/* i18n-ignore-start: the English source of the keys below */
export const MESSAGES = {
  'dxfmodel.not_text': 'This DXF file could not be read as text.',
  'dxfmodel.binary': 'This is a binary DXF. Save it as ASCII DXF and try again.',
  'dxfmodel.bad_code': 'This file is not a readable DXF (bad group code on line {line}).',
};
/* i18n-ignore-end */

const FILL_RE_ = /\{\{|\}\}|\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
/** The text for key (dxfmodel.*) with its fills: the page's language through globalThis.ccI18n (i18n.js) when it has the key,
 * else the English in MESSAGES — so Node and the site's converter read that English (docs/LANG.md § Shared libraries). */
function msg(key, fills = {}) {
  const i18n = globalThis.ccI18n;
  if (i18n && typeof i18n.has === 'function' && i18n.has(key)) return i18n.t(key, fills);
  let s = MESSAGES[key];
  if (s === undefined) return key;
  if (typeof s === 'object') s = s['=' + fills.n] ?? (Number(fills.n) === 1 ? s.one : s.other) ?? s.other;
  return s.replace(FILL_RE_, (m, k) => (m === '{{' ? '{' : m === '}}' ? '}' : fills[k] !== undefined && fills[k] !== null ? String(fills[k]) : m));
}

export function readDxfModel(text) {
  if (typeof text !== 'string') throw new Error(msg('dxfmodel.not_text'));
  if (text.startsWith('AutoCAD Binary DXF')) throw new Error(msg('dxfmodel.binary'));   // i18n-ignore: the binary DXF signature
  const lines = text.split(/\r?\n/);
  const codes = [], vals = [];
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const c = parseInt(lines[i], 10);
    if (Number.isNaN(c)) { if (!lines[i].trim() && i + 2 >= lines.length) break; throw new Error(msg('dxfmodel.bad_code', { line: i + 1 })); }
    const raw = lines[i + 1];
    codes.push(c);
    vals.push(typed(c, c === 1 || c === 3 || (c >= 1000 && c <= 1009) ? raw : raw.trim()));
  }
  const n = codes.length;
  let i = 0;
  const is0 = (name) => codes[i] === 0 && vals[i] === name;
  /** The groups up to the next 0 group, as [code, value] pairs. */
  const group = () => { const g = []; while (i < n && codes[i] !== 0) { g.push([codes[i], vals[i]]); i++; } return g; };

  const model = {
    version: '', maintenance: 0, codepage: '', header: {}, classes: [],
    tables: { layers: [], linetypes: [], styles: [], dimstyles: [], views: [], ucs: [], vports: [], appids: [], blockRecords: [] },
    blocks: [], layouts: [], objects: [], report: { counts: {}, notes: [], unknown: {} },
  };
  const loose = [];   // ENTITIES section, placed by owner after everything is read
  let auto = 0;
  const handleOf = (g) => hx(val(g, 5) ?? val(g, 105)) || 'DXF' + (++auto).toString(16).toUpperCase();

  while (i < n) {
    if (!is0('SECTION')) { i++; continue; }
    i++;
    const sec = codes[i] === 2 ? vals[i++] : '';
    if (sec === 'HEADER') readHeader(group());
    else if (sec === 'TABLES') readTables();
    else if (sec === 'BLOCKS') readBlocks();
    else if (sec === 'ENTITIES') readEntities(loose, true);
    else if (sec === 'OBJECTS') readObjects();
    while (i < n && !is0('ENDSEC')) { i++; group(); }
    i++;
  }
  place();
  return model;

  function readHeader(g) {
    let name = null;
    for (const [c, v] of g) {
      if (c === 9) { name = String(v).replace(/^\$/, ''); continue; }
      if (!name) continue;
      if (c >= 10 && c <= 39) {
        const p = model.header[name] && typeof model.header[name] === 'object' ? model.header[name] : (model.header[name] = { x: 0, y: 0 });
        p[c < 20 ? 'x' : c < 30 ? 'y' : 'z'] = v;
      } else model.header[name] = v;
    }
    model.version = String(model.header.ACADVER || '');
    model.maintenance = model.header.ACADMAINTVER || 0;
    model.codepage = String(model.header.DWGCODEPAGE || '');
  }

  function readTables() {
    while (i < n && !is0('ENDSEC')) {
      if (!is0('TABLE')) { i++; group(); continue; }
      i++;
      const table = val(group(), 2);
      while (i < n && !is0('ENDTAB') && !is0('ENDSEC')) {
        const kind = vals[i];
        i++;
        const g = group();
        if (kind === table) tableEntry(kind, g);
      }
      if (is0('ENDTAB')) { i++; group(); }
    }
  }
  function tableEntry(kind, g) {
    const handle = handleOf(g), name = String(val(g, 2) ?? '');
    const flags = val(g, 70) || 0;
    switch (kind) {
      case 'LAYER': {
        const ci = val(g, 62) ?? 7, lw = val(g, 370);
        model.tables.layers.push({ handle, name, flags, color: colorOf(Math.abs(ci) || 7, val(g, 420)), linetypeName: String(val(g, 6) ?? 'Continuous'),
          lineweight: lw ?? -3, plot: val(g, 290) !== false, off: ci < 0, frozen: !!(flags & 1), locked: !!(flags & 4) });
        break;
      }
      case 'LTYPE': model.tables.linetypes.push({ handle, name, description: String(val(g, 3) ?? ''), patternLength: val(g, 40) || 0, elements: [] }); break;
      case 'STYLE': model.tables.styles.push({ handle, name, flags, height: val(g, 40) || 0, widthFactor: val(g, 41) ?? 1, oblique: (val(g, 50) || 0) * D2R,
        generation: val(g, 71) || 0, lastHeight: val(g, 42) || 0, font: String(val(g, 3) ?? ''), bigFont: String(val(g, 4) ?? '') }); break;
      case 'DIMSTYLE': {
        const vars = {};
        for (const [c, v] of g) if (DIMVAR_CODES[c]) vars[DIMVAR_CODES[c]] = v;
        model.tables.dimstyles.push({ handle, name, vars });
        break;
      }
      case 'BLOCK_RECORD': model.tables.blockRecords.push({ handle, name, flags: 0, layout: hx(val(g, 340)), insertUnits: val(g, 70) || 0,
        explodable: val(g, 280) !== 0, scalable: val(g, 281) || 0 }); break;
      case 'APPID': model.tables.appids.push({ handle, name, flags }); break;
      case 'VPORT': model.tables.vports.push({ handle, name, flags }); break;
      default: break;
    }
  }

  function readBlocks() {
    while (i < n && !is0('ENDSEC')) {
      if (!is0('BLOCK')) { i++; group(); continue; }
      i++;
      const g = group();
      const blk = { name: String(val(g, 2) ?? val(g, 3) ?? ''), handle: handleOf(g), record: hx(val(g, 330)), base: point(g, 10), flags: val(g, 70) || 0,
        xrefPath: String(val(g, 1) ?? ''), description: String(val(g, 4) ?? ''), entities: [] };
      readEntities(blk.entities, false, 'ENDBLK');
      if (is0('ENDBLK')) { i++; blk.endHandle = handleOf(group()); }
      model.blocks.push(blk);
    }
  }

  /** Entities up to ENDSEC (or `stop`), POLYLINE vertices and INSERT attributes folded into their owner. */
  function readEntities(list, top, stop = 'ENDSEC') {
    while (i < n && !is0('ENDSEC') && !is0(stop)) {
      if (codes[i] !== 0) { i++; continue; }
      const type = vals[i];
      i++;
      const g = group();
      let follow = null;
      if (type === 'POLYLINE' || (type === 'INSERT' && val(g, 66) === 1)) {
        follow = [];
        while (i < n && codes[i] === 0 && (vals[i] === 'VERTEX' || vals[i] === 'ATTRIB')) { const t = vals[i]; i++; follow.push({ type: t, g: group() }); }
        if (is0('SEQEND')) { i++; group(); }
      }
      const e = entity(type, g, follow);
      if (!e) continue;
      if (top) e._paper = val(g, 67) === 1;
      list.push(e);
    }
  }

  function readObjects() {
    while (i < n && !is0('ENDSEC')) {
      if (codes[i] !== 0) { i++; continue; }
      const type = vals[i];
      i++;
      const g = group();
      if (type === 'LAYOUT') {
        // two 330s: the owner dictionary, then (in the AcDbLayout part) the paper space block record
        let sub = '', block = '', owner = '';
        for (const [c, v] of g) { if (c === 100) sub = v; else if (c === 330) { if (sub === 'AcDbLayout') block = hx(v); else if (!owner) owner = hx(v); } }
        const lay = { handle: handleOf(g), owner, type, name: String(subVal(g, 'AcDbLayout', 1) ?? ''), tabOrder: subVal(g, 'AcDbLayout', 71) || 0,
          flags: subVal(g, 'AcDbLayout', 70) || 0, block, limMin: subPoint(g, 'AcDbLayout', 10), limMax: subPoint(g, 'AcDbLayout', 11),
          insBase: subPoint(g, 'AcDbLayout', 12), extMin: subPoint(g, 'AcDbLayout', 14), extMax: subPoint(g, 'AcDbLayout', 15),
          plot: { pageSetupName: String(val(g, 1) ?? ''), printer: String(val(g, 2) ?? ''), paperSize: String(val(g, 4) ?? ''),
            paperWidth: val(g, 44) || 0, paperHeight: val(g, 45) || 0, paperUnits: val(g, 72) || 0, rotation: val(g, 73) || 0 } };
        model.objects.push(lay);
      } else if (type === 'IMAGEDEF') {
        model.objects.push({ handle: handleOf(g), owner: hx(val(g, 330)), type, fileName: String(val(g, 1) ?? ''), size: point(g, 10, false), loaded: val(g, 280) === 1 });
      } else if (type !== 'DICTIONARY' && type !== 'ENDSEC') {
        model.objects.push({ handle: handleOf(g), owner: hx(val(g, 330)), type });
      }
    }
  }

  /** Blocks, records and layouts tied together; loose entities into their space; counts. */
  function place() {
    const T = model.tables;
    for (const b of model.blocks) if (/^\$(model|paper)_space$/i.test(b.name)) b.name = /model/i.test(b.name) ? '*Model_Space' : '*Paper_Space';   // R12 names
    const recByName = new Map(T.blockRecords.map((r) => [r.name.toUpperCase(), r]));
    for (const b of model.blocks) {
      let r = (b.record && T.blockRecords.find((x) => x.handle === b.record)) || recByName.get(b.name.toUpperCase());
      if (!r) { r = { handle: 'R' + (++auto).toString(16).toUpperCase(), name: b.name, flags: 0, layout: '', insertUnits: 0, explodable: true, scalable: 0 }; T.blockRecords.push(r); recByName.set(b.name.toUpperCase(), r); }
      b.record = r.handle;
      r.flags = b.flags; r.base = b.base; r.xrefPath = b.xrefPath; r.description = b.description;
      for (const e of b.entities) e.owner = r.handle;
    }
    const space = (name) => {
      let b = model.blocks.find((x) => x.name.toUpperCase() === name);
      if (!b) {   // R12: no *Model_Space / *Paper_Space blocks
        const r = { handle: 'R' + (++auto).toString(16).toUpperCase(), name: name === '*MODEL_SPACE' ? '*Model_Space' : '*Paper_Space', flags: 0, layout: '', insertUnits: 0, explodable: true, scalable: 0, base: { x: 0, y: 0, z: 0 } };
        T.blockRecords.push(r);
        b = { name: r.name, handle: r.handle, record: r.handle, base: { x: 0, y: 0, z: 0 }, flags: 0, xrefPath: '', description: '', entities: [] };
        model.blocks.push(b);
      }
      return b;
    };
    const byRecord = new Map(model.blocks.map((b) => [b.record, b]));
    const link = (e) => { const r = recByName.get(e.block.toUpperCase()); if (r) e.blockRecord = r.handle; };
    for (const e of [...loose, ...model.blocks.flatMap((b) => b.entities)]) if (e.type === 'INSERT' || e.type === 'MINSERT' || e.type === 'ACAD_TABLE') link(e);
    for (const e of loose) {
      const paper = e._paper;
      delete e._paper;
      const b = (e.owner && byRecord.get(e.owner)) || space(paper ? '*PAPER_SPACE' : '*MODEL_SPACE');
      e.owner = b.record;
      b.entities.push(e);
    }
    // layouts: the LAYOUT objects, else Model (+ Layout1 when there is paper space)
    for (const o of model.objects) {
      if (o.type !== 'LAYOUT') continue;
      model.layouts.push({ handle: o.handle, owner: o.owner, name: o.name, tabOrder: o.tabOrder, flags: o.flags, block: o.block,
        paper: { name: o.plot.paperSize, w: o.plot.paperWidth, h: o.plot.paperHeight, units: o.plot.paperUnits, rotation: o.plot.rotation, pageSetupName: o.plot.pageSetupName, printer: o.plot.printer },
        limits: { min: o.limMin, max: o.limMax }, insbase: o.insBase, extents: { min: o.extMin, max: o.extMax }, viewports: [] });
    }
    if (!model.layouts.length) {
      const H = model.header, ms = space('*MODEL_SPACE');
      model.layouts.push({ handle: 'L1', name: 'Model', tabOrder: 0, flags: 1, block: ms.record, limits: { min: H.LIMMIN || { x: 0, y: 0 }, max: H.LIMMAX || { x: 12, y: 9 } }, viewports: [] });
      const ps = model.blocks.find((b) => b.name.toUpperCase() === '*PAPER_SPACE');
      if (ps && ps.entities.length) model.layouts.push({ handle: 'L2', name: 'Layout1', tabOrder: 1, flags: 0, block: ps.record, limits: { min: H.PLIMMIN || { x: 0, y: 0 }, max: H.PLIMMAX || { x: 0, y: 0 } }, viewports: [] });
    }
    for (const l of model.layouts) { const r = T.blockRecords.find((x) => x.handle === l.block); if (r && !r.layout) r.layout = l.handle; }
    space('*MODEL_SPACE');
    const C = model.report.counts;
    for (const b of model.blocks) {
      const sp = /^\*model_space$/i.test(b.name) ? 'model' : /^\*paper_space/i.test(b.name) ? 'paper' : null;
      for (const e of b.entities) {
        if (sp) e.space = sp;
        C[e.type] = (C[e.type] || 0) + 1;
        if (e.type === 'UNKNOWN') model.report.unknown[e.dxfName] = (model.report.unknown[e.dxfName] || 0) + 1;
      }
    }
  }

  // ---- one entity ----
  function entity(type, g, follow) {
    const lw = val(g, 370);
    const e = { handle: handleOf(g), type, owner: hx(val(g, 330)), layer: String(val(g, 8) ?? '0'), linetype: String(val(g, 6) ?? 'ByLayer'),
      color: colorOf(val(g, 62) ?? 256, val(g, 420)), lineweight: lw ?? -1, ltscale: val(g, 48) ?? 1, invisible: val(g, 60) === 1 };
    const xd = xdata(g);
    if (xd) e.xdata = xd;
    const ext = point(g, 210, true, { x: 0, y: 0, z: 1 });
    const P = (c) => point(g, c);
    switch (type) {
      case 'LINE': return { ...e, start: P(10), end: P(11), thickness: val(g, 39) || 0, extrusion: ext };
      case 'POINT': return { ...e, position: P(10), thickness: val(g, 39) || 0, extrusion: ext, xAxisAngle: (val(g, 50) || 0) * D2R };
      case 'CIRCLE': return { ...e, center: P(10), radius: val(g, 40) || 0, thickness: val(g, 39) || 0, extrusion: ext };
      case 'ARC': return { ...e, center: P(10), radius: val(g, 40) || 0, thickness: val(g, 39) || 0, extrusion: ext, startAngle: (val(g, 50) || 0) * D2R, endAngle: (val(g, 51) || 0) * D2R };
      case 'ELLIPSE': return { ...e, center: P(10), majorAxis: P(11), extrusion: ext, ratio: val(g, 40) ?? 1, startParam: val(g, 41) || 0, endParam: val(g, 42) ?? 2 * Math.PI };
      case 'LWPOLYLINE': {
        const vs = [];
        for (const [c, v] of g) {
          if (c === 10) vs.push({ x: v, y: 0, bulge: 0, startWidth: 0, endWidth: 0 });
          else if (!vs.length) continue;
          else if (c === 20) vs[vs.length - 1].y = v;
          else if (c === 40) vs[vs.length - 1].startWidth = v;
          else if (c === 41) vs[vs.length - 1].endWidth = v;
          else if (c === 42) vs[vs.length - 1].bulge = v;
        }
        const f = val(g, 70) || 0, cw = val(g, 43) || 0;
        if (cw && !has(g, 40) && !has(g, 41)) for (const v of vs) { v.startWidth = cw; v.endWidth = cw; }   // as DWG stores it
        return { ...e, constantWidth: cw, elevation: val(g, 38) || 0, thickness: val(g, 39) || 0, extrusion: ext, closed: !!(f & 1), plinegen: !!(f & 128), vertices: vs };
      }
      case 'POLYLINE': {
        const flags = val(g, 70) || 0;
        const vx = (follow || []).filter((s) => s.type === 'VERTEX').map((s) => ({ g: s.g, f: val(s.g, 70) || 0 }));
        const vert = (s) => ({ ...point(s.g, 10), flags: s.f });
        if (flags & 64) {
          const vertices = vx.filter((s) => s.f & 64).map(vert);
          const faces = vx.filter((s) => (s.f & 128) && !(s.f & 64)).map((s) => [val(s.g, 71) || 0, val(s.g, 72) || 0, val(s.g, 73) || 0, val(s.g, 74) || 0]);
          return { ...e, type: 'POLYLINE_PFACE', numVertices: val(g, 71) || vertices.length, numFaces: val(g, 72) || faces.length, flags, vertices, faces, closed: false };
        }
        if (flags & 16) return { ...e, type: 'POLYLINE_MESH', flags, curveType: val(g, 75) || 0, m: val(g, 71) || 0, n: val(g, 72) || 0, mDensity: val(g, 73) || 0, nDensity: val(g, 74) || 0, vertices: vx.map(vert), closed: !!(flags & 1) };
        if (flags & 8) return { ...e, type: 'POLYLINE_3D', flags, curveType: val(g, 75) || 0, closed: !!(flags & 1), vertices: vx.map(vert) };
        return { ...e, type: 'POLYLINE_2D', flags, curveType: val(g, 75) || 0, startWidth: val(g, 40) || 0, endWidth: val(g, 41) || 0, thickness: val(g, 39) || 0,
          elevation: point(g, 10).z, extrusion: ext, closed: !!(flags & 1),
          vertices: vx.map((s) => ({ ...point(s.g, 10), startWidth: val(s.g, 40) || 0, endWidth: val(s.g, 41) || 0, bulge: val(s.g, 42) || 0, tangent: (val(s.g, 50) || 0) * D2R, flags: s.f })) };
      }
      case 'TEXT': case 'ATTRIB': case 'ATTDEF': return textEnt(e, g, ext);
      case 'MTEXT': {
        const cut = g.findIndex(([c]) => c === 101);
        if (cut >= 0) g = g.slice(0, cut);   // an embedded object (columns, R2018) repeats codes
        const P = (c) => point(g, c);
        const xAxis = val(g, 11) !== undefined ? P(11) : { x: Math.cos((val(g, 50) || 0) * D2R), y: Math.sin((val(g, 50) || 0) * D2R), z: 0 };
        let value = '';
        for (const [c, v] of g) if (c === 3) value += v;
        value = decode(value + String(val(g, 1) ?? ''));
        return { ...e, insert: P(10), extrusion: ext, xAxis, width: val(g, 41) || 0, rectHeight: val(g, 46) || 0, height: val(g, 40) || 0, attach: val(g, 71) || 1,
          direction: val(g, 72) || 1, value, style: String(val(g, 7) ?? 'Standard'), lineSpacingStyle: val(g, 73) || 1, lineSpacing: val(g, 44) || 1 };
      }
      case 'INSERT': {
        const cols = val(g, 70) || 1, rows = val(g, 71) || 1;
        const attribs = (follow || []).filter((s) => s.type === 'ATTRIB').map((s) => { const a = entity('ATTRIB', s.g, null); a.owner = e.handle; return a; });
        const ins = { ...e, type: cols * rows > 1 ? 'MINSERT' : 'INSERT', insert: P(10), scale: { x: val(g, 41) ?? 1, y: val(g, 42) ?? 1, z: val(g, 43) ?? 1 },
          rotation: (val(g, 50) || 0) * D2R, extrusion: ext, block: String(val(g, 2) ?? ''), attribs };
        if (cols * rows > 1) Object.assign(ins, { cols, rows, colSpacing: val(g, 44) || 0, rowSpacing: val(g, 45) || 0 });
        return ins;
      }
      case 'DIMENSION': case 'ARC_DIMENSION': {
        const flags = val(g, 70) || 0, dimType = type === 'ARC_DIMENSION' ? 8 : flags & 7;
        const d = { ...e, type: type === 'ARC_DIMENSION' ? type : DIM_TYPES[dimType] || 'DIMENSION_LINEAR', dimType, flags, block: String(val(g, 2) ?? ''), style: String(val(g, 3) ?? 'Standard'),
          extrusion: ext, defPoint: P(10), textMid: P(11), insert: P(12), text: String(val(g, 1) ?? ''), measurement: val(g, 42) || 0, attach: val(g, 71) || 5,
          lineSpacingStyle: val(g, 72) || 1, lineSpacing: val(g, 41) || 1, textRotation: (val(g, 53) || 0) * D2R, horizDir: (val(g, 51) || 0) * D2R };
        if (has(g, 13)) d.xline1 = P(13);
        if (has(g, 14)) d.xline2 = P(14);
        if (has(g, 15)) d.center = P(15);
        if (has(g, 16)) d.arcPoint = P(16);
        if (has(g, 40)) d.leaderLen = val(g, 40);
        if (dimType <= 1) { d.angle = (val(g, 50) || 0) * D2R; d.obliqueAngle = (val(g, 52) || 0) * D2R; }
        return d;
      }
      case 'LEADER': return { ...e, vertices: points(g, 10), style: String(val(g, 3) ?? ''), arrowhead: val(g, 71) ?? 1, pathType: val(g, 72) || 0,
        annotType: val(g, 73) ?? 3, annotation: hx(val(g, 340)), extrusion: ext };
      case 'HATCH': return hatch(e, g, ext);
      case 'SOLID': case 'TRACE': {
        const pts = [P(10), P(11), P(12), has(g, 13) ? P(13) : P(12)];
        return { ...e, thickness: val(g, 39) || 0, elevation: pts[0].z, points: pts, extrusion: ext };
      }
      case '3DFACE': return { ...e, points: [P(10), P(11), P(12), has(g, 13) ? P(13) : P(12)], invisibleEdges: val(g, 70) || 0 };
      case 'SPLINE': {
        const f = val(g, 70) || 0;
        const s = { ...e, degree: val(g, 71) || 3, flags: f, closed: !!(f & 1), periodic: !!(f & 2), rational: !!(f & 4), extrusion: ext,
          knots: g.filter(([c]) => c === 40).map(([, v]) => v), control: points(g, 10), fit: points(g, 11),
          knotTolerance: val(g, 42) ?? 1e-10, controlTolerance: val(g, 43) ?? 1e-10, fitTolerance: val(g, 44) ?? 1e-10 };
        const w = g.filter(([c]) => c === 41).map(([, v]) => v);
        if (w.length) s.weights = w;
        if (has(g, 12)) s.startTangent = P(12);
        if (has(g, 13)) s.endTangent = P(13);
        return s;
      }
      case 'RAY': case 'XLINE': return { ...e, start: P(10), direction: P(11) };
      case 'VIEWPORT': return { ...e, center: P(10), width: val(g, 40) || 0, height: val(g, 41) || 0, id: val(g, 69) || 0, viewCenter: point(g, 12, false),
        viewTarget: P(17), viewDirection: point(g, 16, true, { x: 0, y: 0, z: 1 }), viewHeight: val(g, 45) || 0, twist: (val(g, 51) || 0) * D2R,
        lensLength: val(g, 42) ?? 50, frontClip: val(g, 43) || 0, backClip: val(g, 44) || 0, status: val(g, 90) || 0,
        frozenLayers: g.filter(([c]) => c === 331).map(([, v]) => hx(v)) };
      case 'IMAGE': case 'WIPEOUT': return { ...e, insert: P(10), u: P(11), v: P(12), size: point(g, 13, false), def: hx(val(g, 340)), defReactor: hx(val(g, 360)),
        displayFlags: val(g, 70) || 0, clipping: val(g, 280) === 1, brightness: val(g, 281) ?? 50, contrast: val(g, 282) ?? 50, fade: val(g, 283) || 0,
        clipType: val(g, 71) || 1, clip: points(g, 14, false) };
      case 'TOLERANCE': return { ...e, insert: P(10), xDirection: P(11), extrusion: ext, text: String(val(g, 1) ?? ''), style: String(val(g, 3) ?? '') };
      case 'MLINE': {
        const vs = [];
        const p11 = points(g, 11), p12 = points(g, 12), p13 = points(g, 13);
        for (let k = 0; k < p11.length; k++) vs.push({ point: p11[k], direction: p12[k] || { x: 1, y: 0, z: 0 }, miter: p13[k] || { x: 0, y: 1, z: 0 } });
        return { ...e, style: String(val(g, 2) ?? 'STANDARD'), scale: val(g, 40) ?? 1, justification: val(g, 70) || 0, closed: !!((val(g, 71) || 0) & 2), base: P(10), extrusion: ext, vertices: vs };
      }
      case 'MULTILEADER': return mleader(e, g);
      case 'ACAD_TABLE': return { ...e, insert: P(10), extrusion: ext, block: String(val(g, 2) ?? ''), partial: true };
      case '3DSOLID': case 'REGION': case 'BODY': case 'LIGHT': case 'ACAD_PROXY_ENTITY': return e;   // type only
      default: return { ...e, type: 'UNKNOWN', dxfName: type };
    }
  }

  function textEnt(e, g, ext) {
    // With subclass markers, the text's own values are the AcDbText ones; ATTRIB / ATTDEF repeat some codes in their
    // own subclass (and keep the vertical alignment in 74, 73 being the field length there).
    const att = e.type !== 'TEXT', marked = has(g, 100);
    const own = att ? (e.type === 'ATTRIB' ? 'AcDbAttribute' : 'AcDbAttributeDefinition') : null;
    const T = (code) => (marked ? subVal(g, 'AcDbText', code) : val(g, code));
    const A = (code) => (marked ? subVal(g, own, code) : val(g, code));
    const insert = marked ? subPoint(g, 'AcDbText', 10, true) : point(g, 10);
    const align = marked ? (subVal(g, 'AcDbText', 11) !== undefined ? subPoint(g, 'AcDbText', 11, true) : null) : (has(g, 11) ? point(g, 11) : null);
    const t = { ...e, insert, align: align || { ...insert }, height: T(40) || 0, value: decode(T(1)), rotation: (T(50) || 0) * D2R, widthFactor: T(41) ?? 1,
      oblique: (T(51) || 0) * D2R, style: String(T(7) ?? 'Standard'), hAlign: T(72) || 0, vAlign: (att ? A(74) : T(73)) || 0,
      generation: T(71) || 0, thickness: T(39) || 0, elevation: insert.z, extrusion: ext };
    if (att) {
      t.tag = String(A(2) ?? '');
      t.flags = A(70) || 0;
      t.lockPosition = A(280) === 1;
      t.fieldLength = A(73) || 0;
      if (e.type === 'ATTDEF') t.prompt = decode(A(3));
    }
    return t;
  }

  /** HATCH: its groups repeat per loop and edge, so they are read in order. */
  function hatch(e, g, ext) {
    let k = 0;
    const at = (c) => g[k] && g[k][0] === c;
    const take = () => g[k++][1];
    const xy = (cx) => { const p = { x: 0, y: 0 }; if (at(cx)) p.x = take(); if (at(cx + 10)) p.y = take(); return p; };
    const h = { ...e, pattern: String(val(g, 2) ?? ''), solid: val(g, 70) === 1, associative: val(g, 71) === 1, elevation: point(g, 10).z, extrusion: ext, loops: [], seeds: [] };
    while (k < g.length && !at(91)) k++;
    const nLoops = k < g.length ? take() : 0;
    for (let L = 0; L < nLoops && k < g.length; L++) {
      while (k < g.length && !at(92)) k++;
      if (k >= g.length) break;
      const flags = take(), loop = { flags };
      if (flags & 2) {
        const hasBulges = at(72) ? take() === 1 : false, closed = at(73) ? take() === 1 : true;
        const cnt = at(93) ? take() : 0, vertices = [];
        for (let v = 0; v < cnt && k < g.length; v++) { const p = xy(10); vertices.push({ x: p.x, y: p.y, bulge: at(42) ? take() : 0 }); }
        loop.polyline = { closed, hasBulges, vertices };
      } else {
        const cnt = at(93) ? take() : 0, edges = [];
        for (let d = 0; d < cnt && k < g.length; d++) {
          while (k < g.length && !at(72)) k++;
          const type = HATCH_EDGE[take()];
          if (type === 'line') edges.push({ type, start: xy(10), end: xy(11) });
          else if (type === 'arc') { const center = xy(10); const radius = at(40) ? take() : 0; const s = at(50) ? take() : 0, t = at(51) ? take() : 360; edges.push({ type, center, radius, startAngle: s * D2R, endAngle: t * D2R, ccw: at(73) ? take() === 1 : true }); }
          else if (type === 'ellipse') { const center = xy(10), majorAxis = xy(11); const ratio = at(40) ? take() : 1; const s = at(50) ? take() : 0, t = at(51) ? take() : 360; edges.push({ type, center, majorAxis, ratio, startAngle: s * D2R, endAngle: t * D2R, ccw: at(73) ? take() === 1 : true }); }
          else if (type === 'spline') {
            const sp = { type, degree: at(94) ? take() : 3, rational: at(73) ? take() === 1 : false, periodic: at(74) ? take() === 1 : false, knots: [], control: [] };
            const nk = at(95) ? take() : 0, nc = at(96) ? take() : 0;
            for (let q = 0; q < nk && at(40); q++) sp.knots.push(take());
            const w = [];
            for (let q = 0; q < nc && at(10); q++) { sp.control.push(xy(10)); if (at(42)) w.push(take()); }
            if (w.length) sp.weights = w;
            if (at(97)) { const nf = take(); sp.fit = []; for (let q = 0; q < nf && at(11); q++) sp.fit.push(xy(11)); }
            if (at(12)) sp.startTangent = xy(12);
            if (at(13)) sp.endTangent = xy(13);
            edges.push(sp);
          } else break;
        }
        loop.edges = edges;
      }
      loop.boundary = [];
      if (at(97)) { const nb = take(); for (let b = 0; b < nb && at(330); b++) loop.boundary.push(hx(take())); }
      h.loops.push(loop);
    }
    for (; k < g.length; k++) {
      const [c, v] = g[k];
      if (c === 75) h.style = v; else if (c === 76) h.patternType = v; else if (c === 52) h.angle = v * D2R; else if (c === 41) h.scale = v; else if (c === 77) h.double = v === 1;
      else if (c === 98) { const ns = v; k++; for (let s = 0; s < ns && g[k] && g[k][0] === 10; s++) { const p = { x: g[k][1], y: 0 }; k++; if (g[k] && g[k][0] === 20) { p.y = g[k][1]; k++; } h.seeds.push(p); } k--; }
    }
    return h;
  }

  /** MULTILEADER: the context data's leaders (lines), text and block, as cc-dwg models them (as much as BimCraft draws). */
  function mleader(e, g) {
    const ctx = { roots: [], text: null, block: null };
    let root = null, line = null, depth = '';
    // the MLEADER's own values follow the context block (301 "}"); codes inside it mean other things
    const end = g.findIndex(([c, v]) => c === 301 && v === '}'), own = end >= 0 ? g.slice(end + 1) : g;
    const m = { ...e, style: hx(val(own, 340)), leaderType: val(own, 170) ?? 1, contentType: val(own, 172) ?? 2, doglegEnabled: val(own, 291) !== false,
      landingEnabled: val(own, 290) !== false, arrowSize: val(own, 42) || 0, context: ctx };
    for (let k = 0; k < g.length; k++) {
      const [c, v] = g[k];
      const pt = (cx) => { const p = { x: v, y: 0, z: 0 }; if (g[k + 1]?.[0] === cx + 10) p.y = g[++k][1]; if (g[k + 1]?.[0] === cx + 20) p.z = g[++k][1]; return p; };
      // section markers: 300 CONTEXT_DATA{ · 302 LEADER{ · 304 LEADER_LINE{ · 305 } · 303 } · 301 }
      if (c === 300 && v === 'CONTEXT_DATA{') { depth = 'ctx'; continue; }
      if (c === 302 && v === 'LEADER{') { root = { connection: null, direction: null, lines: [] }; ctx.roots.push(root); depth = 'leader'; continue; }
      if (c === 304 && v === 'LEADER_LINE{' && root) { line = { points: [] }; root.lines.push(line); depth = 'line'; continue; }
      if (c === 304 && depth === 'ctx') { ctx.text = { ...(ctx.text || {}), label: String(v) }; continue; }
      if (c === 305 && v === '}') { depth = 'leader'; continue; }
      if (c === 303 && v === '}') { depth = 'ctx'; continue; }
      if (c === 301 && v === '}') { depth = ''; continue; }
      if (depth === 'line' && c === 10) line.points.push(pt(10));
      else if (depth === 'leader' && c === 10) root.connection = pt(10);
      else if (depth === 'leader' && c === 11) root.direction = pt(11);
      else if (depth === 'leader' && c === 40) root.doglegLength = v;
      else if (depth === 'ctx' && c === 41) ctx.textHeight = v;
      else if (depth === 'ctx' && c === 140) ctx.arrowSize = v;
      else if (depth === 'ctx' && c === 12) ctx.text = { ...(ctx.text || {}), location: pt(12) };
      else if (depth === 'ctx' && c === 13) ctx.text = { ...(ctx.text || {}), direction: pt(13) };
      else if (depth === 'ctx' && c === 290) ctx.hasText = v;
      else if (depth === 'ctx' && c === 296) ctx.hasBlock = v;
      else if (depth === 'ctx' && c === 341) ctx.block = { ...(ctx.block || {}), handle: hx(v) };
      else if (depth === 'ctx' && c === 15) ctx.block = { ...(ctx.block || {}), location: pt(15) };
      else if (depth === 'ctx' && c === 16) ctx.block = { ...(ctx.block || {}), scale: pt(16) };
      else if (depth === 'ctx' && c === 46) ctx.block = { ...(ctx.block || {}), rotation: v };
      else if (depth === 'ctx' && c === 47 && ctx.block) (ctx.block.matrix = ctx.block.matrix || []).push(v);
    }
    // block attribute values: 330 attdef, 177 index, 44 width, 302 text, in that order
    m.blockLabels = [];
    for (let k = 0; k < own.length; k++) if (own[k][0] === 330) {
      const l = { attdefHandle: hx(own[k][1]), text: '', index: 0, width: 0 };
      for (k++; k < own.length && [177, 44, 302].includes(own[k][0]); k++) { const [c, v] = own[k]; if (c === 177) l.index = v; else if (c === 44) l.width = v; else l.text = decode(v); }
      k--;
      m.blockLabels.push(l);
    }
    if (m.contentType === 1 && ctx.block?.handle) m.contentBlock = ctx.block.handle;
    return m;
  }
}

// ---- small readers over one entity's groups ----
const val = (g, code) => { for (const [c, v] of g) if (c === code) return v; return undefined; };
const has = (g, code) => g.some(([c]) => c === code);
function point(g, code, z = true, dflt = null) {
  let x, y, zz;
  for (const [c, v] of g) {
    if (c === code && x === undefined) x = v;
    else if (c === code + 10 && y === undefined) y = v;
    else if (c === code + 20 && zz === undefined) zz = v;
  }
  if (x === undefined && dflt) return { ...dflt };
  const p = { x: x || 0, y: y || 0 };
  if (z) p.z = zz || 0;
  return p;
}
/** Every point of a repeated code (x at `code`, y at code + 10, z at code + 20), in order. */
function points(g, code, z = true) {
  const out = [];
  for (const [c, v] of g) {
    if (c === code) out.push(z ? { x: v, y: 0, z: 0 } : { x: v, y: 0 });
    else if (c === code + 10 && out.length) out[out.length - 1].y = v;
    else if (z && c === code + 20 && out.length) out[out.length - 1].z = v;
  }
  return out;
}
/** A value inside one subclass (after its 100 marker). */
function subVal(g, sub, code) {
  let inside = false;
  for (const [c, v] of g) { if (c === 100) inside = v === sub; else if (inside && c === code) return v; }
  return undefined;
}
function subPoint(g, sub, code, z = false) {
  let inside = false;
  const p = z ? { x: 0, y: 0, z: 0 } : { x: 0, y: 0 };
  for (const [c, v] of g) {
    if (c === 100) inside = v === sub;
    else if (inside && c === code) p.x = v;
    else if (inside && c === code + 10) p.y = v;
    else if (inside && c === code + 20) p.z = v;
  }
  return p;
}
/** DXF caret escapes in text: "^ " is a caret, ^J and the like control characters. */
const decode = (s) => String(s ?? '').replace(/\^(.)/g, (m, c) => (c === ' ' ? '^' : String.fromCharCode(c.charCodeAt(0) & 31)));
function colorOf(index, rgb) { return rgb !== undefined ? { rgb: rgb & 0xffffff, index } : { index }; }
function xdata(g) {
  let out = null, app = null;
  for (let k = 0; k < g.length; k++) {
    const [c, v] = g[k];
    if (c === 1001) { out = out || {}; app = out[v] = out[v] || []; continue; }
    if (!app || c < 1000) continue;
    if (c >= 1010 && c <= 1013) {
      const p = { x: v, y: 0, z: 0 };
      if (g[k + 1]?.[0] === c + 10) p.y = g[++k][1];
      if (g[k + 1]?.[0] === c + 20) p.z = g[++k][1];
      app.push([c, p]);
    } else app.push([c, v]);
  }
  return out;
}
