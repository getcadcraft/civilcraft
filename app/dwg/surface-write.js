/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors and report notes are English (an app translates what it shows). */
/**
 * surface-write.js — write the SURFACE family: SURFACE, PLANESURFACE, EXTRUDEDSURFACE, LOFTEDSURFACE, REVOLVEDSURFACE,
 * SWEPTSURFACE and NURBSURFACE (cc-dwg, Apache-2.0). Written from the ODA "Open Design Specification for .dwg files"
 * v5.4.1: 20.4.41 (the ACIS part every ACIS entity starts with), 20.4.1/20.4.2 (common entity data, the R2013+ "has data
 * storage" flag), ch. 24 (data storage), ch. 10 (classes), 20.4.44/20.4.104 (DICTIONARY, XRECORD); the class layouts the
 * reader found by experiment (surface-read.js, surface-layout.js) are mirrored here.
 *
 *   const S = surfaceWriter(env, SOL)   write.js, after solidWriter (SOL: its record builder does the ACIS data, the
 *                                       R2013+ data storage record and the revision GUID; env: version, report, next,
 *                                       srcMap, hexKey, model, common)
 *   S.convert(e, type, owner, c)        → records | undefined (not a surface)
 *   S.finish({ recs })                  after the source's objects are copied (nongraphic-write.js): the NURBSURFACE
 *                                       round-trip extension dictionary entries (below)
 *
 * The ACIS data goes as for 3DSOLID (solid-write.js: SAT as version 1, SAB as version 2 inline up to R2010; from R2013
 * the data storage section). Then AcDbSurface (BS U isolines, BS V isolines) and the class's fields.
 *
 * Saving down — what the ODA File Converter writes when it saves a surface drawing to an older version (found by
 * converting the fixture of tools/dwg-test/surfaces-fixture.py from R2018 to every version and reading the results):
 *   - every class is written natively in every version from R2000 on (the class entries are written; no proxies, no
 *     BODY/REGION conversion), with its full data — the layout does not change between versions;
 *   - NURBSURFACE (R2013+) becomes a plain SURFACE in R2000–R2010: U/V isolines 6/6, no revision GUID, and an extension
 *     dictionary entry ACAD_XREC_ROUNDTRIP → XRECORD [102 "AcadNurbSurfaceData"][90 0][310 (no bytes)]
 *     [102 "AcadModlrDecomposedType"][90 1] (the converter keeps none of the NURBS fields in it). Spec gap: not in the
 *     spec. Saving such a SURFACE up to R2013+ again, the converter makes it a NURBSURFACE (its fields 0, a new GUID)
 *     and drops the round-trip entry: this writer does the same (the model's `savedDownFrom: 'NURBSURFACE'`, read.js);
 *   - the converter also adds proxy graphics in R2000–R2010 and the revision GUID as ACAD_OBJECT_CHANGE_GUID xdata in
 *     R2000 too: this writer adds the GUID xdata (R2004–R2010 through solid-write.js, R2000 here) but no proxy graphics
 *     (the ACIS data is the geometry; readers that cannot use it draw nothing, as for a 3DSOLID).
 * An embedded profile / path entity of unknown encoding (surface-read.js) is written back in its own version only;
 * written to another version it is left out (the value written as 0, noted).
 */

import { ObjWriter, begin, finish, entityCommon, CLASSED } from './objects-write.js';
import { writeAcisBlock, writeWireframe, parseGuid } from './solid-write.js';
import { SURFACE_TYPES, SURFACE_LAYOUTS, SURFACE_CLASSES } from './surface-layout.js';
import { appendBits, unb64 } from './passthrough.js';
import { VERSION_NUM } from './header-vars.js';

for (const [k, c] of Object.entries(SURFACE_CLASSES)) if (!CLASSED[k]) CLASSED[k] = c;
const TYPES = new Set(SURFACE_TYPES);
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const P3 = (p) => ({ x: num(p?.x), y: num(p?.y), z: num(p?.z) });
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
/** Defaults of a field the model does not give (the values the converter writes for a new surface). */
const DEFAULTS = { scaleFactor: 1, startDraftAngle: Math.PI / 2, noTwist: true, alignDirection: true, simpleSurfaces: true };
const ROUNDTRIP = [[102, 'AcadNurbSurfaceData'], [90, 0], [310, ''], [102, 'AcadModlrDecomposedType'], [90, 1]];

function writeField(w, op, v, name) {
  switch (op) {
    case 'BD': w.BD(num(v, DEFAULTS[name] ?? 0)); break;
    case 'BS': w.BS(num(v, DEFAULTS[name] ?? 0)); break;
    case 'BL': w.BL(num(v, 0)); break;
    case 'B': w.B((v ?? DEFAULTS[name]) ? 1 : 0); break;
    case 'BD3': w.P3(P3(v)); break;
    case 'M': { const m = Array.isArray(v) && v.length === 16 && v.every(Number.isFinite) ? v : IDENTITY; for (const x of m) w.BD(x); break; }
    default: throw new Error('surface field code ' + op);
  }
}

function encodeSurface(rec, ctx) {
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum(rec.t), rec);
  entityCommon(w, rec);                          // rec.ds: R2013+ data storage flag (solid-write.js)
  // 20.4.41, as solid-write.js writes REGION / BODY (a surface has no history handle)
  if (!(w.r2013 && rec.ds)) writeAcisBlock(w, rec.acis);
  writeWireframe(w, rec);
  if (w.r2007) w.BL(0);
  if (w.r2013) {
    const g = parseGuid(rec.revisionGuid);
    w.B(rec.hasRevisionGuid ? 1 : 0);
    w.BL(g.d1); w.BS(g.d2); w.BS(g.d3);
    for (const x of g.d4) w.RC(x);
    w.BL(0);
  }
  // AcDbSurface, then the class (surface-layout.js)
  w.BS(num(rec.uIsolines, 6)); w.BS(num(rec.vIsolines, 6));
  for (const [name, op] of SURFACE_LAYOUTS[rec.t] || []) {
    if (op !== 'ENT' && op !== 'ENTB') { writeField(w, op, rec.f[name], name); continue; }
    const ent = rec.f[name];
    if (ent && ent.value && ent.raw && ent.raw.ver === VERSION_NUM[ctx.version]) {
      // unknown encoding (surface-read.js): the value and the rest of the entity's data as they came, then nothing more
      if (op === 'ENT') w.BL(ent.value); else w.B(1);
      appendBits(w, unb64(ent.raw.data), ent.raw.n);
      break;
    }
    if (op === 'ENT') w.BL(0); else w.B(0);
  }
  return finish(w);
}

function newGuid() {
  const b = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(b); else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return '{' + h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20) + '}';
}

export function surfaceWriter(env, SOL) {
  const { version, report, next, srcMap, hexKey, model } = env;
  const ver = VERSION_NUM[version];
  const notes = { down: 0, up: 0, embedded: 0 };
  const downs = [], ups = [];

  function convert(e, type, owner, c) {
    if (!TYPES.has(type)) return undefined;
    let t = type;
    const down = t === 'NURBSURFACE' && ver < 27;
    const up = t === 'SURFACE' && ver >= 27 && e.savedDownFrom === 'NURBSURFACE';
    if (down) t = 'SURFACE';
    if (up) t = 'NURBSURFACE';
    let src = e;
    const xd = e.xdata && e.xdata.ACAD_OBJECT_CHANGE_GUID;
    if (down) {
      // as the converter: no revision GUID on the saved-down surface
      const x = { ...(e.xdata || {}) }; delete x.ACAD_OBJECT_CHANGE_GUID;
      src = { ...e, xdata: x, hasRevisionGuid: false, revisionGuid: undefined };
    } else if (ver < 18 && !xd && e.hasRevisionGuid && e.revisionGuid && !/^\{?0{8}-/.test(e.revisionGuid)) {
      // R2000: the GUID as ACAD_OBJECT_CHANGE_GUID xdata, as the converter writes it (solid-write.js does R2004–R2010)
      const g = parseGuid(e.revisionGuid);
      const items = [[1070, 1], [1071, g.d1 | 0], [1070, (g.d2 << 16) >> 16], [1070, (g.d3 << 16) >> 16], ...[...g.d4].map((v) => [1070, v])];
      src = { ...e, xdata: { ...(e.xdata || {}), ACAD_OBJECT_CHANGE_GUID: items } };
    }
    // the common part from `src` (write.js's `c` would take the source entity's own xdata)
    const rs = SOL.convert(src, 'BODY', owner, (tt) => env.common(src, tt, owner));
    const r = rs[0];
    const f = {};
    for (const [name, op] of SURFACE_LAYOUTS[t] || []) {
      f[name] = e[name];
      if ((op === 'ENT' || op === 'ENTB') && e[name] && e[name].value && !(e[name].raw && e[name].raw.ver === ver)) notes.embedded++;
    }
    Object.assign(r, { t, encode: encodeSurface, f, uIsolines: down ? 6 : e.uIsolines, vIsolines: down ? 6 : e.vIsolines });
    if (up) {
      // the converter gives the restored NURBS surface a new revision GUID
      if (!r.hasRevisionGuid || /^\{?0{8}-0{4}-0{4}-0{4}-0{12}\}?$/.test(r.revisionGuid)) r.revisionGuid = newGuid();
      r.hasRevisionGuid = true; notes.up++; ups.push({ r, e });
    }
    if (down) { notes.down++; downs.push({ r, e }); }
    return rs;
  }

  /** The NURBSURFACE round-trip entries (see the header). */
  function finishWriter({ recs }) {
    const byH = new Map(recs.map((x) => [x.h, x]));
    for (const { r } of downs) {
      let dict = r.xdic ? byH.get(r.xdic) : null;
      const xh = next();
      if (!dict || dict.t !== 'DICTIONARY') {
        dict = { t: 'DICTIONARY', h: next(), owner: r.h, reactors: [r.h], items: [], hardOwner: true, cloning: 1 };
        recs.push(dict); r.xdic = dict.h;
      }
      dict.items = dict.items.filter(([n]) => n !== 'ACAD_XREC_ROUNDTRIP');
      dict.items.push(['ACAD_XREC_ROUNDTRIP', xh]);
      dict.items.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
      recs.push({ t: 'XRECORD', h: xh, owner: dict.h, reactors: [dict.h], data: ROUNDTRIP, cloning: 1 });
    }
    for (const { r, e } of ups) {
      // the source's round-trip entry is stale once the surface is a NURBSURFACE again (the converter drops it)
      const sd = (model.objects || []).find((o) => hexKey(o.handle) === hexKey(e.extDict));
      const xs = sd && sd.entries && sd.entries.ACAD_XREC_ROUNDTRIP;
      const xh = xs && srcMap.get(hexKey(xs));
      const dict = r.xdic ? byH.get(r.xdic) : null;
      if (xh) { const i = recs.findIndex((x) => x.h === xh); if (i >= 0) recs.splice(i, 1); }
      if (dict && dict.items) {
        dict.items = dict.items.filter(([n, h]) => n !== 'ACAD_XREC_ROUNDTRIP' && h !== xh);
        if (!dict.items.length) { const i = recs.indexOf(dict); if (i >= 0) recs.splice(i, 1); delete r.xdic; }
      }
    }
    const n = (k, s) => { if (notes[k]) report.notes.push(s(notes[k])); };
    n('down', (k) => `${k} NURBS surface${k === 1 ? ' was' : 's were'} written as plain SURFACE (${version} has no NURBSURFACE; as AutoCAD and the ODA File Converter save it down, with the ACAD_XREC_ROUNDTRIP marker that turns it back into a NURBS surface in R2013+).`);
    n('up', (k) => `${k} surface${k === 1 ? '' : 's'} saved down from NURBSURFACE ${k === 1 ? 'was' : 'were'} written as NURBSURFACE again (its NURBS fields were not kept by the save-down).`);
    n('embedded', (k) => `${k} embedded profile/path entit${k === 1 ? 'y' : 'ies'} of a surface (an encoding cc-dwg does not know) ${k === 1 ? 'was' : 'were'} left out: it is kept only in the drawing's own version.`);
  }

  return { convert, finish: finishWriter };
}
