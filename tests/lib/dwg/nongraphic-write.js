/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: report notes go through msg() (messages.js); what is left is internal checks and file-format text. */
/**
 * nongraphic-write.js — the writer copies the source drawing's non-graphical objects (cc-dwg, Apache-2.0).
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1: 20.1 (common object format), 20.4.44/45
 * (DICTIONARY, DICTIONARYWDFLT), 20.4.72 (GROUP), 20.4.74 (DICTIONARYVAR), 20.4.77 (FIELDLIST), 20.4.79 (IDBUFFER),
 * 20.4.83 (LAYER_INDEX), 20.4.84 (the plot settings part of LAYOUT = PLOTSETTINGS), 20.4.87 (MLEADERSTYLE,
 * mleader-write.js), 20.4.92 (SCALE), 20.4.93 (SORTENTSTABLE), 20.4.94 (SPATIAL_FILTER), 20.4.104 (XRECORD), ch. 9
 * (the header's dictionary handles), ch. 10 (classes).
 *
 *   const X = extendWriter(env)   — write.js, once its tables and blocks are known (env: see below)
 *   X.convert(e, type, owner, c)  → records | 'skip reason' | undefined (entities this module and mleader-write.js
 *                                   own: MULTILEADER, ACAD_PROXY_ENTITY, entities of classes cc-dwg cannot decode)
 *   X.finish({ recs, H, layouts }) — before the records are encoded: copies the objects, links extension
 *                                   dictionaries and reactors of written entities/tables, extends the writer's own
 *                                   named-object and group dictionaries
 *   X.headerHandles               — header dictionary handles (DICTIONARY_MATERIALS …, CMATERIAL) in the new file
 *
 * What is copied: every entry of the source's named-object dictionary except those the writer makes itself
 * (ACAD_GROUP — whose groups are merged into the writer's —, ACAD_LAYOUT, ACAD_MLINESTYLE, ACAD_PLOTSTYLENAME and
 * the raster-image/wipeout dictionaries), with everything they own; the extension dictionary (and what it owns) of
 * every written entity, table entry, block record and layout; any object owned by a copied object. Handles are
 * renumbered like everything else; references to things that are not written become null (dictionary, group and
 * sort-table entries are left out instead).
 *
 * How: in the file's own version an object the reader kept raw (passthrough.js) is copied bit for bit with its
 * handles mapped — except dictionaries, groups, sort tables, xrecords, ID buffers, layer indexes and field lists,
 * whose lists can lose entries and are always encoded from their fields. In another version an object is encoded
 * from its decoded fields (the encoders below); one that cc-dwg does not decode (MATERIAL, VISUALSTYLE, custom
 * classes, proxies) is left out with a note (readers recreate the default materials and visual styles).
 *
 * Spec gap: SORTENTSTABLE's sort handles are handles of the source file (they order drawing, they need not be
 * objects). Renumbered, the draw order is kept by giving every entity of the block a sort handle: the block's new
 * entity handles, ascending, dealt out in the source's draw order — found by checking the ODA File Converter's
 * DXF of written files (SORTENTS entries in draw order).
 */
import { msg } from './messages.js';
import { ObjWriter, begin, finish, objectCommon, xrecordBytes, CLASSED, SOFT_OWN, HARD_OWN, SOFT_PTR, HARD_PTR } from './objects-write.js';
import { encodeRaw, rawUsable, convertPlan, unb64 } from './passthrough.js';
import { BitReader } from './bits-read.js';
import { VERSION_NUM } from './header-vars.js';
import { convertMleader, encodeMleaderStyle, ensureMleaderStyle } from './mleader-write.js';

const ver = (v) => VERSION_NUM[v];
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const fin = (...v) => v.every(Number.isFinite);
/** Names in the named-object dictionary that the writer makes itself. */
const WRITER_NOD = new Set(['ACAD_GROUP', 'ACAD_LAYOUT', 'ACAD_MLINESTYLE', 'ACAD_PLOTSTYLENAME', 'ACAD_IMAGE_DICT', 'ACAD_IMAGE_VARS', 'ACAD_WIPEOUT_VARS']);
/** Object types the writer makes itself (never copied, only referenced). */
const WRITER_TYPES = new Set(['LAYOUT', 'MLINESTYLE', 'IMAGEDEF', 'IMAGEDEF_REACTOR', 'VPENT_HEADER']);
/** Types whose lists can lose entries: always encoded from their fields. */
const ALWAYS_FIELDS = new Set(['DICTIONARY', 'ACDBDICTIONARYWDFLT', 'DICTIONARYWDFLT', 'GROUP', 'SORTENTSTABLE', 'XRECORD', 'IDBUFFER', 'LAYER_INDEX', 'FIELDLIST']);

/** Class properties of the object classes this module writes (DXF CLASSES section names). */
const CLS = {
  DICTIONARYVAR: { dxf: 'DICTIONARYVAR', cpp: 'AcDbDictionaryVar', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  SCALE: { dxf: 'SCALE', cpp: 'AcDbScale', app: 'ObjectDBX Classes', entity: false, proxy: 1153 },
  SORTENTSTABLE: { dxf: 'SORTENTSTABLE', cpp: 'AcDbSortentsTable', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  IDBUFFER: { dxf: 'IDBUFFER', cpp: 'AcDbIdBuffer', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  LAYER_INDEX: { dxf: 'LAYER_INDEX', cpp: 'AcDbLayerIndex', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  SPATIAL_FILTER: { dxf: 'SPATIAL_FILTER', cpp: 'AcDbSpatialFilter', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  FIELDLIST: { dxf: 'FIELDLIST', cpp: 'AcDbFieldList', app: 'ObjectDBX Classes', entity: false, proxy: 1152 },
  PLOTSETTINGS: { dxf: 'PLOTSETTINGS', cpp: 'AcDbPlotSettings', app: 'ObjectDBX Classes', entity: false, proxy: 0 },
  MLEADERSTYLE: { dxf: 'MLEADERSTYLE', cpp: 'AcDbMLeaderStyle', app: 'ACDB_MLEADERSTYLE_CLASS', entity: false, proxy: 4095 },
  GROUP: null,   // fixed type 72
};
for (const [k, v] of Object.entries(CLS)) if (v && !CLASSED[k]) CLASSED[k] = v;

/** Encoders from decoded fields: (w, o, M) after objectCommon; M = { ref(hex) → handle, version }. Others may register. */
export const FIELD_ENCODERS = {};
/** Predicates (o, version) → true to leave a source object out of the copy (builder T: table round-trip objects). */
export const COPY_SKIP = [];
const typeNumOf = (t, ctx) => (t === 'GROUP' ? 72 : ctx.classNum(t));
function simple(t, body) {
  FIELD_ENCODERS[t] = (rec, ctx) => {
    const w = new ObjWriter(ctx.version);
    begin(w, typeNumOf(t, ctx), rec);
    objectCommon(w, rec);
    body(w, rec.src, rec.M, rec);
    return finish(w);
  };
}
simple('GROUP', (w, o, M, rec) => {
  w.TV(o.name ?? ''); w.BS(o.unnamed ?? 1); w.BS(o.selectable ?? 1);
  const ents = rec.list;
  w.BL(ents.length);
  for (const h of ents) w.H(HARD_PTR, h);
});
simple('DICTIONARYVAR', (w, o) => { w.RC(o.intval | 0); w.TV(String(o.value ?? '')); });
simple('SCALE', (w, o) => { w.BS(0); w.TV(o.name ?? ''); w.BD(num(o.paperUnits, 1)); w.BD(num(o.drawingUnits, 1)); w.B(o.unitScale ? 1 : 0); });
simple('IDBUFFER', (w, o, M, rec) => { w.RC(0); w.BL(rec.list.length); for (const h of rec.list) w.H(SOFT_PTR, h); });
simple('FIELDLIST', (w, o, M, rec) => { w.BL(rec.list.length); w.B(o.unknown ? 1 : 0); for (const h of rec.list) w.H(HARD_OWN, h); });
simple('LAYER_INDEX', (w, o, M, rec) => {
  w.BL(0); w.BL(0);
  const es = rec.list;
  w.BL(es.length);
  for (const e of es) { w.BL(e.index | 0); w.TV(e.name ?? ''); }
  for (const e of es) w.H(HARD_PTR, e.h);
});
simple('SPATIAL_FILTER', (w, o) => {
  const pts = o.points || [];
  w.BS(pts.length); for (const p of pts) w.RD2(num(p.x), num(p.y));
  const e = o.extrusion || { x: 0, y: 0, z: 1 }; w.BD3(num(e.x), num(e.y), num(e.z, 1));
  const g = o.origin || {}; w.BD3(num(g.x), num(g.y), num(g.z));
  w.BS(o.displayBoundary | 0);
  if (o.frontClip !== null && o.frontClip !== undefined) { w.BS(1); w.BD(num(o.frontClip)); } else w.BS(0);
  if (o.backClip !== null && o.backClip !== undefined) { w.BS(1); w.BD(num(o.backClip)); } else w.BS(0);
  for (let i = 0; i < 12; i++) w.BD(num(o.inverseBlockTransform?.[i], i % 4 === 0 ? 1 : 0));
  for (let i = 0; i < 12; i++) w.BD(num(o.clipTransform?.[i], i % 4 === 0 ? 1 : 0));
});
simple('SORTENTSTABLE', (w, o, M, rec) => {
  const es = rec.list;   // [[entity, sort]]
  w.BL(es.length);
  for (const [, s] of es) w.Hd(0, s);
  w.H(SOFT_PTR, rec.ownerBlock || 0);
  for (const [e] of es) w.H(SOFT_PTR, e);
});
simple('PLOTSETTINGS', (w, o, M) => {
  const p = o.plot || {};
  w.TV(p.pageSetupName ?? ''); w.TV(p.printer ?? 'none_device'); w.BS(p.flags ?? 688);
  const m = p.margins || {};
  for (const k of ['left', 'bottom', 'right', 'top']) w.BD(num(m[k], 6.35));
  w.BD(num(p.paperWidth, 215.9)); w.BD(num(p.paperHeight, 279.4)); w.TV(p.paperSize ?? '');
  w.BD2(num(p.origin?.x), num(p.origin?.y));
  w.BS(p.paperUnits | 0); w.BS(p.rotation | 0); w.BS(p.plotType | 0);
  w.BD2(num(p.windowMin?.x), num(p.windowMin?.y)); w.BD2(num(p.windowMax?.x), num(p.windowMax?.y));
  if (!w.r2004) w.T8(p.viewName ?? '');
  w.BD(num(p.realWorldUnits, 1)); w.BD(num(p.drawingUnits, 1)); w.TV(p.styleSheet ?? ''); w.BS(p.scaleType | 0); w.BD(num(p.scaleFactor, 1));
  w.BD2(num(p.imageOrigin?.x), num(p.imageOrigin?.y));
  if (w.r2004) { w.BS(p.shadePlotMode | 0); w.BS(p.shadePlotRes ?? 2); w.BS(p.shadePlotDpi ?? 300); w.H(HARD_PTR, 0); }
  // Spec gap: R2007+ plot settings end with one more handle, the shade-plot visual style (soft pointer) — as in
  // LAYOUT (20.4.84); found in the corpus' R2007–R2018 PLOTSETTINGS (two handles after the common ones).
  if (w.r2007) w.H(SOFT_PTR, 0);
});
// 20.4.78 GEODATA (0.6 GEO-DWG): always the 2010 format (objectVersion 3, as AutoCAD 2013 and later write it), so only in
// R2010 and later files; R2000–R2007 leave it out (COPY_SKIP below) — a 2009-format object (1) read from a file is
// written in the 2010 format from the same fields. The host is the model space's block record.
CLASSED.GEODATA = { dxf: 'GEODATA', cpp: 'AcDbGeoData', app: 'ObjectDBX Classes', entity: false, proxy: 4095 };
const P3 = (w, p, d = 0) => w.BD3(num(p?.x, d), num(p?.y, d), num(p?.z, d));
simple('GEODATA', (w, o, M) => {
  w.BL(3);
  w.H(SOFT_PTR, M.ref(o.host));
  w.BS(o.coordType ?? 2);
  P3(w, o.designPoint); P3(w, o.referencePoint);
  w.BD(num(o.unitScaleH, 1)); w.BL(o.unitsH | 0); w.BD(num(o.unitScaleV, 1)); w.BL(o.unitsV | 0);
  w.BD3(num(o.up?.x), num(o.up?.y), num(o.up?.z, 1));
  w.RD2(num(o.north?.x), num(o.north?.y, 1));   // Spec gap: 2RD, not 3RD (see objects-read.js)
  w.BL(o.scaleMethod ?? 1); w.BD(num(o.userScale, 1)); w.B(o.seaLevel ? 1 : 0); w.BD(num(o.seaElevation)); w.BD(num(o.projRadius, 6378137));
  w.TV(String(o.csDef ?? '')); w.TV(String(o.geoRss ?? ''));
  w.TV(String(o.obsFrom ?? '')); w.TV(String(o.obsTo ?? '')); w.TV(String(o.obsCoverage ?? ''));
  const pts = (Array.isArray(o.meshPoints) ? o.meshPoints : []).filter((p) => fin(p?.source?.x, p?.source?.y, p?.dest?.x, p?.dest?.y));
  w.BL(pts.length);
  for (const p of pts) { w.RD2(p.source.x, p.source.y); w.RD2(p.dest.x, p.dest.y); }
  const faces = (Array.isArray(o.meshFaces) ? o.meshFaces : []).filter((f) => Array.isArray(f) && f.length === 3 && f.every((i) => Number.isInteger(i) && i >= 0 && i < pts.length));
  w.BL(faces.length);
  for (const f of faces) { w.BL(f[0]); w.BL(f[1]); w.BL(f[2]); }
});
COPY_SKIP.push((o, version) => o.type === 'GEODATA' && ver(version) < 24);
FIELD_ENCODERS.MLEADERSTYLE = (rec, ctx) => encodeMleaderStyle(rec, ctx);
CLASSED.RASTERVARIABLES = CLASSED.RASTERVARIABLES || { dxf: 'RASTERVARIABLES', cpp: 'AcDbRasterVariables', app: 'ISM', entity: false, proxy: 0 };
simple('RASTERVARIABLES', (w, o) => { w.BL(o.classVersion | 0); w.BS(o.displayFrame ?? 1); w.BS(o.displayQuality ?? 1); w.BS(o.units | 0); });
simple('WIPEOUTVARIABLES', (w, o) => { w.BS(o.displayFrame ?? 1); });
FIELD_ENCODERS.ACDBPLACEHOLDER = (rec, ctx) => { const w = new ObjWriter(ctx.version); begin(w, ctx.classNum('PLACEHOLDER'), rec); objectCommon(w, rec); return finish(w); };

/**
 * env = { model, version, report, next, srcMap, mapSrc, hexKey, common (e, t, owner), eedOf, layerRef, ltypeRef, styleRef,
 *         blockByName, blocks, H }
 */
export function extendWriter(env) {
  const { model, version, report, next, srcMap, mapSrc, hexKey } = env;
  const map = (hex) => srcMap.get(hexKey(hex)) || 0;
  const classes = new Map((model.classes || []).map((c) => [c.num, c]));
  const clsOf = (n) => { const c = classes.get(n); return c ? { dxf: c.dxfName, cpp: c.cppName, app: c.appName, entity: !!c.isEntity, proxy: c.proxyFlags | 0 } : null; };
  const proxyClass = (id) => {
    const c = clsOf(id);
    if (!c) return null;
    const k = 'RAW:' + c.dxf;
    if (!CLASSED[k]) CLASSED[k] = c;
    return k;
  };
  const notes = { rawEntities: {}, droppedEntities: {}, proxied: {} };
  // another version: undecoded classes go as proxies (passthrough.js convertPlan); R2018 files read maintenance 0
  // where the converter's proxies say 29
  const srcMaint = model.maintenance || (model.version === 'AC1032' ? 29 : 0);
  // Classes every AutoCAD-family program knows and stores natively in every version (the ODA File Converter re-encodes
  // them when it saves down, never as proxies): left out instead (readers recreate materials and visual styles; a
  // dimension loses its associativity, an annotative object its extra scales).
  const NEVER_PROXY = /^(MATERIAL|VISUALSTYLE|ACDBDETAILVIEWSTYLE|ACDBSECTIONVIEWSTYLE|SUN|DIMASSOC|RAPIDRTRENDERSETTINGS|RENDER\w*|ACDB_\w*OBJECTCONTEXTDATA_CLASS|TABLESTYLE|CELLSTYLEMAP|TABLECONTENT|TABLEGEOMETRY|DATATABLE|FIELD|FIELDLIST|SCALE|MLEADERSTYLE|LAYOUT|PLOTSETTINGS|\w*VARIABLES|IMAGEDEF\w*|DICTIONARY\w*|XRECORD|GROUP|ACDBPLACEHOLDER|SORTENTSTABLE|SPATIAL_\w+|LAYER_INDEX|IDBUFFER|DBCOLOR|GEODATA|LIGHTLIST|MULTILEADER|ACAD_TABLE|LIGHT|REGION|3DSOLID|BODY|MLINESTYLE)$/;
  const planFor = (raw, isProxy, typeNum) => convertPlan(raw, isProxy, (id) => { const c = clsOf(isProxy ? id : typeNum); return c && !NEVER_PROXY.test(c.dxf) ? c : null; }, model.version, srcMaint, version);
  const X = { headerHandles: {} };
  // Extended data of the objects, resolved now: new registered applications must exist before write.js writes the
  // APPID table (later calls would name applications the file does not have).
  const eedCache = new Map();
  const old = ver(version) < 24;
  const hasMl = (model.objects || []).some((o) => o.type === 'MLEADERSTYLE') || (model.blocks || []).some((b) => (b.entities || []).some((e) => e.type === 'MULTILEADER' || e.type === 'MLEADER'));
  const mleaderEed = hasMl && old ? env.eedOf({ ACAD_MLEADERVER: [[1070, 2]] }) : undefined;
  for (const o of model.objects || []) {
    let x = o.xdata;
    if (o.type === 'MLEADERSTYLE' && !rawUsable(o.raw, version)) {
      x = { ...(x || {}) };
      if (old) x.ACAD_MLEADERVER = [[1070, 2]]; else delete x.ACAD_MLEADERVER;
    }
    const e = env.eedOf(x);
    if (e) eedCache.set(o, e);
  }
  // table entries and block records keep their extended data too (write.js writes none for them); an annotative
  // drawing saved down marks its "Layer @ scale" layers with AcadAnnotativeDecomposition data, which readers need
  // to put such objects back together
  for (const list of Object.values(model.tables || {})) if (Array.isArray(list)) for (const t of list) { if (t.xdata) { const e = env.eedOf(t.xdata); if (e) eedCache.set(t, e); } }

  // ---------------------------------------------------------------- entities
  X.convert = (e, type, owner, c) => {
    if (type === 'MULTILEADER' || type === 'MLEADER') return convertMleader(e, env, c);
    if ((type === 'UNKNOWN' || type === 'ACAD_PROXY_ENTITY') && e.raw) {
      const name = type === 'UNKNOWN' ? e.dxfName || 'UNKNOWN' : type;
      const typeNum = type === 'ACAD_PROXY_ENTITY' ? 0x1F2 : e.typeNum;
      const cls = typeNum >= 500 ? clsOf(typeNum) : null;
      if (!rawUsable(e.raw, version) || (typeNum >= 500 && !cls)) {
        const conv = planFor(e.raw, type === 'ACAD_PROXY_ENTITY', typeNum);
        if (conv) {
          notes.proxied[name] = (notes.proxied[name] || 0) + 1;
          return [{ ...c(name), typeNum, cls: conv.cls, conv, raw: e.raw, isEntity: true, map, encode: encodeRaw }];
        }
        notes.droppedEntities[name] = (notes.droppedEntities[name] || 0) + 1;
        return name + ' (kept only when the drawing is written in its own version)';
      }
      notes.rawEntities[name] = (notes.rawEntities[name] || 0) + 1;
      const rec = { ...c(name), typeNum, cls, raw: e.raw, isEntity: true, map, proxyClass, encode: encodeRaw };
      return [rec];
    }
    return undefined;
  };

  // ---------------------------------------------------------------- objects
  X.finish = ({ recs, H, layouts = [] }) => {
    const objs = model.objects || [];
    for (const L of layouts) if (L.src && L.src.handle && L.h && !srcMap.has(hexKey(L.src.handle))) mapSrc(L.src.handle, L.h);
    // records write.js makes but does not map: the attributes of a reference, the *Active viewport
    const srcEnt = new Map();
    for (const b of model.blocks || []) for (const e of b.entities || []) srcEnt.set(hexKey(e.handle), e);
    const back = new Map([...srcMap].map(([k, v]) => [v, k]));
    for (const r of recs) {
      if ((r.t !== 'INSERT' && r.t !== 'MINSERT') || !r.attribs?.length) continue;
      const e = srcEnt.get(back.get(r.h));
      const atts = (e?.attribs || []).filter((a) => a.insert && Number.isFinite(a.insert.x) && Number.isFinite(a.insert.y) && a.height > 0 && a.tag);
      if (atts.length === r.attribs.length) atts.forEach((a, i) => { if (!srcMap.has(hexKey(a.handle))) mapSrc(a.handle, r.attribs[i]); });
    }
    const act = (model.tables?.vports || []).find((v) => /^\*active$/i.test(v.name || ''));
    if (act && H.vport && !srcMap.has(hexKey(act.handle))) mapSrc(act.handle, H.vport);
    const byH = new Map(objs.map((o) => [hexKey(o.handle), o]));
    const kids = new Map();   // owner → [objects]
    for (const o of objs) { const k = hexKey(o.owner); if (k) (kids.get(k) || kids.set(k, []).get(k)).push(o); }
    const sameVer = (o) => rawUsable(o.raw, version, o.type);   // same version, or a version with the same data (passthrough.js)
    const canWrite = (o) => {
      if (!o || WRITER_TYPES.has(o.type) || /_CONTROL$/.test(o.type)) return false;
      if (ALWAYS_FIELDS.has(o.type)) return !o.damaged;
      if (sameVer(o)) return true;
      if (FIELD_ENCODERS[fieldType(o)] && !o.undecoded && !o.damaged) return true;
      return !!convOf(o);
    };
    const convCache = new Map();
    const convOf = (o) => {
      if (!(o.undecoded || o.type === 'ACAD_PROXY_OBJECT') || !o.raw) return null;
      if (!convCache.has(o)) convCache.set(o, planFor(o.raw, o.type === 'ACAD_PROXY_OBJECT', o.typeNum ?? classNumOf(o)));
      return convCache.get(o);
    };
    // A multileader saved down to R2000–R2007 keeps its R2010+ fields in an ACAD_XREC_ROUNDTRIP xrecord of its extension
    // dictionary; readers use it in those versions (the ODA converter takes the landing distance of a vertical attachment
    // from it). Written R2010+, the entity has the fields itself and the stale copy is left out.
    const mlHandles = new Set([...srcEnt.values()].filter((e) => e.type === 'MULTILEADER').map((e) => hexKey(e.handle)));
    const staleRoundTrip = (o) => {
      if (ver(version) < 24) return false;
      const d = o.type === 'XRECORD' ? byH.get(hexKey(o.owner)) : o;
      if (!d || d.type !== 'DICTIONARY' || !mlHandles.has(hexKey(d.owner))) return false;
      if (o === d) return Object.keys(d.entries || {}).length > 0 && Object.keys(d.entries).every((n) => n === 'ACAD_XREC_ROUNDTRIP');
      return hexKey(d.entries?.ACAD_XREC_ROUNDTRIP) === hexKey(o.handle);
    };
    // Spec gap: ACDB_RECOMPOSE_DATA (named-object dictionary XRECORD [90 1][330 …]…) of an R2000–R2007 drawing saved by
    // AutoCAD 2008+ lists the annotative objects (multileaders, dimensions, mtext) and tables a reader must put back
    // together from their "<layer> @ <scale>" copies. Without it the ODA File Converter still deletes those layers but
    // leaves the multileaders on them, and its audit moves them to "$AUDIT-BAD-LAYER" — found by building copies with
    // and without it. Its table and table-style entries are left out (their round-trip data is not written,
    // table-write.js), and so is every entry that is not written; with nothing left, the xrecord is left out.
    const nodSrc0 = byH.get(hexKey(model.header?.DICTIONARY_NAMED_OBJECTS)) || objs.find((o) => o.type === 'DICTIONARY' && !hexKey(o.owner));
    const recomposeH = hexKey(nodSrc0?.entries?.ACDB_RECOMPOSE_DATA);
    const recomposeKeep = (v) => { const t = byH.get(hexKey(v))?.type || srcEnt.get(hexKey(v))?.type; return !!t && t !== 'TABLESTYLE' && t !== 'ACAD_TABLE'; };
    const plan = new Map();   // source hex → { o, owner (new handle or source hex), h }
    const dropped = {}, droppedH = new Set();
    const queue = [];
    const want = (hex, owner) => {
      const k = hexKey(hex);
      if (!k || plan.has(k) || srcMap.has(k)) return;
      const o = byH.get(k);
      if (!o) return;
      if (droppedH.has(k)) return;
      if (staleRoundTrip(o) || (k === recomposeH && !(o.data || []).some(([c, v]) => c === 330 && recomposeKeep(v)))) { droppedH.add(k); dropped[o.type] = (dropped[o.type] || 0) + 1; return; }
      if (COPY_SKIP.some((f) => { try { return f(o, version); } catch { return false; } }) || !canWrite(o)) { droppedH.add(k); dropped[o.type] = (dropped[o.type] || 0) + 1; return; }
      plan.set(k, { o, owner });
      queue.push(k);
    };
    // roots: the named-object dictionary
    const nodSrc = byH.get(hexKey(model.header?.DICTIONARY_NAMED_OBJECTS)) || objs.find((o) => o.type === 'DICTIONARY' && !hexKey(o.owner));
    const nodAdd = [], groupAdd = [], plotAdd = [];
    const writerNod = new Set((recs.find((r) => r.h === H.nod && r.t === 'DICTIONARY')?.items || []).map((x) => x[0]));
    if (nodSrc) {
      for (const [name, hex] of Object.entries(nodSrc.entries || {})) {
        if (!name || !hexKey(hex)) continue;
        if (name === 'ACAD_GROUP') {
          const gd = byH.get(hexKey(hex));
          for (const [gname, gh] of Object.entries(gd?.entries || {})) { if (gname && hexKey(gh)) { want(gh, H.groupDict); groupAdd.push([gname, hexKey(gh)]); } }
          continue;
        }
        if (name === 'ACAD_PLOTSTYLENAME') {   // merged into the writer's: its Normal is the source's Normal
          const pd = byH.get(hexKey(hex));
          for (const [pn, ph] of Object.entries(pd?.entries || {})) {
            if (!pn || !hexKey(ph)) continue;
            if (/^normal$/i.test(pn)) { if (!srcMap.has(hexKey(ph))) mapSrc(ph, H.plotStyleNormal); continue; }
            want(ph, H.plotStyleDict); plotAdd.push([pn, hexKey(ph)]);
          }
          continue;
        }
        if (WRITER_NOD.has(name) && !(/_VARS$/.test(name) && !writerNod.has(name))) continue;   // the variables: when the writer made none
        want(hex, H.nod);
        nodAdd.push([name, hexKey(hex)]);
      }
    }
    // roots: extension dictionaries of everything written that the model describes
    const srcThings = [];
    const T = model.tables || {};
    for (const list of Object.values(T)) if (Array.isArray(list)) srcThings.push(...list);
    for (const b of model.blocks || []) {
      srcThings.push({ handle: b.record, extDict: (T.blockRecords || []).find((r) => hexKey(r.handle) === hexKey(b.record))?.extDict, reactors: undefined });
      for (const e of b.entities || []) { srcThings.push(e); for (const a of e.attribs || []) srcThings.push(a); }
    }
    for (const L of model.layouts || []) srcThings.push(L);
    // the table control objects are not in the model; their extension dictionaries (ACAD_LAYERSTATES …) are found by owner
    const CTL = { BLOCK_CONTROL_OBJECT: 'blockCtl', LAYER_CONTROL_OBJECT: 'layerCtl', STYLE_CONTROL_OBJECT: 'styleCtl', LINETYPE_CONTROL_OBJECT: 'ltypeCtl',
      VIEW_CONTROL_OBJECT: 'viewCtl', UCS_CONTROL_OBJECT: 'ucsCtl', VPORT_CONTROL_OBJECT: 'vportCtl', APPID_CONTROL_OBJECT: 'appidCtl',
      DIMSTYLE_CONTROL_OBJECT: 'dimstyleCtl', VPORT_ENTITY_HEADER_CONTROL_OBJECT: 'vpentCtl' };
    for (const [hv, key] of Object.entries(CTL)) {
      const k = hexKey(model.header?.[hv]);
      if (!k || !H[key] || !recs.some((r) => r.h === H[key])) continue;
      if (!srcMap.has(k)) mapSrc(k, H[key]);
      const xd = (kids.get(k) || []).find((o) => /DICTIONARY/.test(o.type));
      if (xd) srcThings.push({ handle: k, extDict: xd.handle });
    }
    const thingByNew = new Map();
    for (const s of srcThings) {
      const nh = srcMap.get(hexKey(s.handle));
      if (!nh) continue;
      if (!thingByNew.has(nh) || s.extDict) thingByNew.set(nh, s);
      if (s.extDict) want(s.extDict, nh);
    }
    // roots: objects owned by something the writer wrote (a viewport's SUN, a solid's history, …)
    // (an owner that is an object written by write.js or another module — a table style, a layout — counts too)
    for (const o of objs) { const ow = hexKey(o.owner); if (ow && srcMap.has(ow)) want(o.handle, srcMap.get(ow)); }
    for (const o of objs) { const nh = srcMap.get(hexKey(o.handle)); if (nh && o.extDict && !thingByNew.has(nh)) { thingByNew.set(nh, o); want(o.extDict, nh); } }
    // closure: what a copied object owns (dictionary entries it owns, objects naming it as owner)
    while (queue.length) {
      const k = queue.shift();
      const { o } = plan.get(k);
      if (o.extDict) want(o.extDict, k);
      if (o.entries) for (const v of Object.values(o.entries)) { const c = byH.get(hexKey(v)); if (c && hexKey(c.owner) === k) want(v, k); }
      for (const c of kids.get(k) || []) want(c.handle, k);
    }
    // what a left-out object owns goes with it (reported as such)
    for (const o of objs) {
      const k0 = hexKey(o.handle);
      if (plan.has(k0) || droppedH.has(k0) || srcMap.has(k0)) continue;
      let h = hexKey(o.owner), n = 0;
      while (h && !droppedH.has(h) && byH.has(h) && !plan.has(h) && n++ < 64) h = hexKey(byH.get(h).owner);
      if (h && droppedH.has(h)) { droppedH.add(k0); dropped[o.type] = (dropped[o.type] || 0) + 1; }
    }
    // handles
    const keys = [...plan.keys()].sort((a, b) => parseInt(a, 16) - parseInt(b, 16));
    for (const k of keys) { const p = plan.get(k); p.h = next(); mapSrc(k, p.h); }
    const resolveOwner = (p) => (typeof p.owner === 'number' ? p.owner : map(p.owner));
    const written = (hex) => map(hex) || 0;
    const refs = (list) => (list || []).map(written).filter(Boolean);
    let raw = 0, fields = 0;
    const byType = {};
    for (const k of keys) {
      const p = plan.get(k), o = p.o;
      const rec = { t: 'COPY:' + o.type, h: p.h, owner: resolveOwner(p), reactors: refs(o.reactors), xdic: o.extDict ? written(o.extDict) || undefined : undefined,
        eed: eedCache.get(o), src: o, M: { ref: written, version }, newFormat: true };
      if (!rec.reactors.length) delete rec.reactors;
      byType[o.type] = (byType[o.type] || 0) + 1;
      if (o.type === 'DICTIONARY' || o.type === 'ACDBDICTIONARYWDFLT' || o.type === 'DICTIONARYWDFLT') {
        rec.t = o.type === 'DICTIONARY' ? 'DICTIONARY' : 'DICTIONARYWDFLT';
        rec.items = Object.entries(o.entries || {}).filter(([n, v]) => n && written(v)).map(([n, v]) => [n, written(v)]);
        rec.hardOwner = !!o.hardOwner; rec.cloning = o.cloning ?? 1;
        if (rec.t === 'DICTIONARYWDFLT') rec.defaultEntry = written(o.defaultEntry);
        fields++;
      } else if (o.type === 'XRECORD') {
        rec.encode = encodeXrecord; fields++;
        if (k === recomposeH) rec.keep = ([c, v]) => c !== 330 || (recomposeKeep(v) && !!written(v));
      } else if (!sameVer(o) && !ALWAYS_FIELDS.has(o.type) && !(FIELD_ENCODERS[fieldType(o)] && !o.undecoded) && convOf(o)) {
        const conv = convOf(o);
        Object.assign(rec, { encode: encodeRaw, conv, cls: conv.cls, raw: o.raw, map, isEntity: false });
        notes.proxied[o.type] = (notes.proxied[o.type] || 0) + 1;
        raw++;
      } else if (ALWAYS_FIELDS.has(o.type) || !sameVer(o)) {
        const ft = fieldType(o);
        rec.encode = FIELD_ENCODERS[ft];
        if (ft === 'GROUP') rec.list = refs(o.entities);
        else if (ft === 'IDBUFFER') rec.list = refs(o.ids);
        else if (ft === 'FIELDLIST') rec.list = refs(o.fields);
        else if (ft === 'LAYER_INDEX') rec.list = (o.entries || []).map((e) => ({ ...e, h: written(e.handle) })).filter((e) => e.h);
        else if (ft === 'SORTENTSTABLE') sortList(rec, o);
        fields++;
      } else {
        rec.encode = encodeRaw; rec.raw = o.raw; rec.map = map; rec.isEntity = false;
        rec.typeNum = o.type === 'ACAD_PROXY_OBJECT' ? 0x1F3 : o.typeNum ?? classNumOf(o);
        rec.cls = rec.typeNum >= 500 ? clsOf(rec.typeNum) : null;
        rec.proxyClass = proxyClass;
        if (rec.typeNum === undefined || (rec.typeNum >= 500 && !rec.cls)) { byType[o.type]--; dropped[o.type] = (dropped[o.type] || 0) + 1; continue; }
        raw++;
      }
      recs.push(rec);
    }
    function classNumOf(o) {
      for (const c of classes.values()) if (c.dxfName === o.type) return c.num;
      return undefined;
    }
    // SORTENTSTABLE: every entity of the block, in the source's draw order (see the header)
    function sortList(rec, o) {
      const blockRec = hexKey(o.ownerBlock);
      rec.ownerBlock = written(blockRec);
      const b = (model.blocks || []).find((x) => hexKey(x.record) === blockRec);
      const sortOf = new Map();
      (o.entities || []).forEach((e, i) => sortOf.set(hexKey(e), parseInt(o.sortHandles?.[i] || e, 16)));
      const ents = (b?.entities || []).map((e) => ({ src: parseInt(e.handle, 16), key: sortOf.get(hexKey(e.handle)) ?? parseInt(e.handle, 16), h: written(e.handle) })).filter((x) => x.h);
      ents.sort((a, c) => a.key - c.key || a.src - c.src);
      const newHs = ents.map((x) => x.h).sort((a, c) => a - c);
      rec.list = ents.map((x, i) => [x.h, newHs[i]]);
    }

    // the *Active viewport owns its SUN (20.4.64: "Sun handle, hard owner", R2007+)
    if (act && H.vport) {
      const sun = objs.find((o) => o.type === 'SUN' && hexKey(o.owner) === hexKey(act.handle));
      const vr = recs.find((r) => r.h === H.vport && r.t === 'VPORT');
      if (sun && vr && written(sun.handle)) vr.sun = written(sun.handle);
    }
    // multileaders whose style is not written get a Standard one
    ensureMleaderStyle({ recs, H, next, mleaderEed, defaults: { textStyle: env.styleRef('Standard'), ltByBlock: H.ltByBlock } });

    // written entities, table entries, block records and layouts: extension dictionaries and reactors
    let linked = 0;
    for (const r of recs) {
      const s = thingByNew.get(r.h);
      if (!s || r.t.startsWith('COPY:')) continue;
      if (s.extDict && written(s.extDict) && !r.xdic) { r.xdic = written(s.extDict); linked++; }
      if (!r.eed && eedCache.has(s) && /^(LAYER|STYLE|LTYPE|DIMSTYLE|BLOCK_HEADER|VPORT|VIEW)$/.test(r.t)) r.eed = eedCache.get(s);
      const rs = refs(s.reactors).filter((x) => !(r.reactors || []).includes(x));
      if (rs.length) r.reactors = [...(r.reactors || []), ...rs];
    }
    // the writer's own dictionaries
    const nod = recs.find((r) => r.h === H.nod && r.t === 'DICTIONARY');
    if (nod) {
      const have = new Set(nod.items.map((x) => x[0]));
      for (const [name, k] of nodAdd) if (written(k) && !have.has(name)) nod.items.push([name, written(k)]);
      nod.items.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    }
    const pd = recs.find((r) => r.h === H.plotStyleDict && r.t === 'DICTIONARYWDFLT');
    if (pd) for (const [name, k] of plotAdd) if (written(k) && !pd.items.some((x) => x[0] === name)) pd.items.push([name, written(k)]);
    for (const r of recs) if (r.t === 'LAYER') { const sl = thingByNew.get(r.h); if (sl && sl.plotStyle && written(sl.plotStyle)) r.plotstyle = written(sl.plotStyle); if (sl && sl.material && written(sl.material)) r.material = written(sl.material); }
    const gd = recs.find((r) => r.h === H.groupDict && r.t === 'DICTIONARY');
    if (gd) for (const [name, k] of groupAdd) if (written(k)) gd.items.push([name, written(k)]);
    // header handles
    const hd = model.header || {};
    for (const [hv, key] of [['DICTIONARY_MATERIALS', 'materialsDict'], ['DICTIONARY_COLORS', 'colorsDict'], ['DICTIONARY_VISUALSTYLE', 'visualStyleDict'],
      ['DICTIONARY_PLOTSETTINGS', 'plotSettingsDict'], ['CMATERIAL', 'cmaterial']]) {
      const n = written(hd[hv]);
      if (n) X.headerHandles[key] = n;
    }
    // report
    const total = raw + fields;
    if (total) report.notes.push(msg('ccdwg.write.nongraphic', { n: total, raw, fields }));
    const dn = Object.entries(dropped).filter(([, n]) => n > 0);
    if (dn.length) report.notes.push(msg('ccdwg.write.not_copied', { list: dn.map(([t, n]) => `${n} ${t}`).join(', ') }));
    for (const [t, n] of Object.entries(notes.droppedEntities)) report.notes.push(msg('ccdwg.write.entities_dropped', { n, type: t }));
    const pn = Object.entries(notes.proxied);
    if (pn.length) report.notes.push(msg('ccdwg.write.proxied', { list: pn.map(([t, n]) => `${n} ${t}`).join(', ') }));
    const rn = Object.entries(notes.rawEntities);
    if (rn.length) report.notes.push(msg('ccdwg.write.raw', { list: rn.map(([t, n]) => `${n} ${t}`).join(', ') }));
    report.copied = { objects: byType, dropped, proxied: notes.proxied, rawEntities: notes.rawEntities, droppedEntities: notes.droppedEntities, linkedExtDicts: linked };
  };
  return X;
}

/** The field-encoder name of a model object type. */
function fieldType(o) {
  if (o.type === 'ACDBDICTIONARYWDFLT') return 'DICTIONARYWDFLT';
  return o.type;
}

/** XRECORD (20.4.104) with handle values and object ids mapped. */
function encodeXrecord(rec, ctx) {
  const o = rec.src, M = rec.M;
  const isH = (c) => (c >= 320 && c <= 369) || (c >= 390 && c <= 399) || c === 480 || c === 481 || c === 1005;
  const data = (o.data || []).filter((x) => !rec.keep || rec.keep(x)).map(([c, v]) => (isH(c) ? [c, (M.ref(v) || 0).toString(16).toUpperCase()] : [c, v]));
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum('XRECORD'), rec);
  objectCommon(w, rec);
  let b = xrecordBytes(data, w.r2007);   // objects-write.js: the writer's one XRECORD data encoder
  // Spec gap: some xrecords carry group codes outside the DXF ranges (the ODA converter's LATITUDE xrecord holds a
  // double under code 5001) that the reader cannot size, so its data stops early; in the same string form (R2000/2004
  // or R2007+) the source's bytes are written back as they are — found when the ODA File Converter crashed on a copy
  // that had left them out.
  const rb = rawXrecordBytes(o.raw);
  if (rb && !rec.keep && (o.raw.ver >= 21) === !!w.r2007 && rb.length !== b.length) b = rb;
  w.BL(b.length);
  for (const x of b) w.RC(x);
  if (ver(ctx.version) >= 15) w.BS(o.cloning ?? 1);
  for (const h of o.objids || []) w.H(SOFT_PTR, M.ref(h) || 0);
  return finish(w);
}

/** The data bytes of an XRECORD as the reader kept them raw (passthrough.js): BL count, then the bytes. */
function rawXrecordBytes(raw) {
  if (!raw) return null;
  try {
    const u = unb64(raw.data);
    const r = new BitReader(u, { version: raw.ver, startBit: 0, endBit: raw.n });
    const n = r.BL();
    if (n < 0 || n * 8 > raw.n) return null;
    return r.bytes(n);
  } catch { return null; }
}
