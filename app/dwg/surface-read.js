/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surface-read.js — decode the SURFACE family: SURFACE, PLANESURFACE, EXTRUDEDSURFACE, LOFTEDSURFACE, REVOLVEDSURFACE,
 * SWEPTSURFACE and NURBSURFACE (cc-dwg, Apache-2.0). Written from the ODA "Open Design Specification for .dwg files"
 * v5.4.1: 20.4.41 (the ACIS data, wireframe and silhouettes every ACIS entity starts with — solid-read.js reads it),
 * 20.4.1 (the R2013+ "has data storage" flag), ch. 24 (data storage: the R2013+ SAB, acds.js), ch. 10 (classes).
 *
 * Spec gap: the specification documents none of these classes (it has no section on any SURFACE entity, nor on
 * AcDbSurface's own data). Everything after the 20.4.41 part was found by experiment: fixtures with a distinctive value
 * in every field (tools/dwg-test/surfaces-fixture.py, made by ezdxf), saved by the ODA File Converter as DWG in all six
 * versions; each double located bit by bit in the entity data, each flag by fixtures that set one flag at a time, and
 * every field checked against the converter's DXF of the same DWG (tools/dwg-test/surfaces-check.mjs). The layout is the
 * same in every version from R2000 to R2018 (the R2007+ string stream holds no strings for these classes).
 *
 *   SURFACE_DECODERS                  objects-read.js decoders for the seven classes
 *   SURFACE_LAYOUTS, SURFACE_TYPES    (re-exported from surface-layout.js) the per-class field list after the AcDbSurface
 *                                     part, shared with surface-write.js; the class DXF names
 *   surfaceFields(rec, f, hx, appName)   read.js: model fields (revision GUID from R2004–R2010 xdata, as for solids)
 *
 * Layout (all versions): the 20.4.41 ACIS part (as REGION/BODY; no history handle) — then AcDbSurface: BS U isolines
 * (DXF 71), BS V isolines (72) — then the class's fields, SURFACE_LAYOUTS (surface-layout.js). Codes: BD, BS, B, BL, BD3 (3BD), M (a
 * 4×4 matrix as 16 BD, in DXF order), ENT (an embedded entity: BL class id, then its data when the id is not 0).
 *
 * Spec gap: an embedded profile / path / revolve / sweep entity (the DXF's "90 class id, 90 size, 310 data"; the loft's
 * cross sections, guides and path) was 0 / absent in every file the converter wrote; the converter drops a surface whose
 * embedded data it cannot parse (found by giving it made-up DXF data) and refuses one that announces data without it
 * (found by writing such files), so the encoding is unknown: a non-zero value ends the decoding and the rest of the
 * entity's data is kept as it is (`{ value, raw: { ver, n, data } }`, value = the class id / count, or true for the
 * loft's path flag), written back only in the same version (surface-write.js).
 */

import { msg } from './messages.js';
import { decodeAcisEntity, solidFields } from './solid-read.js';
import { sliceBits, b64 } from './bits-util.js';
import { SURFACE_TYPES, SURFACE_LAYOUTS } from './surface-layout.js';

export { SURFACE_TYPES, SURFACE_LAYOUTS };

function readField(r, op) {
  switch (op) {
    case 'BD': return r.BD();
    case 'BS': return r.BS();
    case 'BL': return r.BL();
    case 'B': return !!r.B();
    case 'BD3': return r.BD3();
    case 'M': { const m = new Array(16); for (let i = 0; i < 16; i++) m[i] = r.BD(); return m; }
    default: throw new Error(msg('ccdwg.err.surface_code', { code: op }));
  }
}

/** Any SURFACE class: the ACIS part, AcDbSurface, the class's fields. */
function decodeSurface(r, h, rec, ctx) {
  decodeAcisEntity(r, h, rec, ctx);
  rec.uIsolines = r.BS();
  rec.vIsolines = r.BS();
  for (const [name, op] of SURFACE_LAYOUTS[rec.type] || []) {
    if (op !== 'ENT' && op !== 'ENTB') { rec[name] = readField(r, op); continue; }
    const value = op === 'ENT' ? r.BL() : r.B();
    if (!value) continue;
    // embedded data of unknown encoding (see the header): keep the rest of the entity's data as it is and stop
    const n = Math.max(0, r.end - r.pos);
    rec[name] = { value, raw: { ver: ctx.ver, n, data: b64(sliceBits(r.buf, r.pos, r.pos + n)) } };
    r.pos = r.end;
    break;
  }
}

export const SURFACE_DECODERS = Object.fromEntries(SURFACE_TYPES.map((t) => [t, decodeSurface]));

/**
 * read.js: model fields of a surface — the revision GUID R2004–R2010 keep in ACAD_OBJECT_CHANGE_GUID xdata (as for
 * solids), and `savedDownFrom: 'NURBSURFACE'` for a SURFACE that a save-down made of a NURBS surface. Spec gap: not in
 * the spec; the ODA File Converter marks it with XRECORD ACAD_XREC_ROUNDTRIP of the surface's extension dictionary,
 * [102 "AcadNurbSurfaceData"][90 0][310][102 "AcadModlrDecomposedType"][90 1], and makes it a NURBSURFACE again when it
 * saves the drawing as R2013+ (found by converting the fixture down and up again; surface-write.js does the same).
 */
export function surfaceFields(rec, f, hx, appName, get) {
  solidFields(rec, f, hx, appName);
  const dict = get && rec._h.xdic ? get(rec._h.xdic) : null;
  if (rec.type !== 'SURFACE' || !dict || dict.type !== 'DICTIONARY' || !dict.names) return;
  const k = dict.names.indexOf('ACAD_XREC_ROUNDTRIP');
  const xr = k >= 0 ? get(dict._h.items[k]) : null;
  if (!xr || xr.type !== 'XRECORD' || !xr.data) return;
  const i = xr.data.findIndex((d) => d[0] === 102 && d[1] === 'AcadModlrDecomposedType');
  const v = i >= 0 && xr.data[i + 1] && xr.data[i + 1][0] === 90 ? xr.data[i + 1][1] : undefined;
  if (v === 1) f.savedDownFrom = 'NURBSURFACE';
  else if (v !== undefined) f.decomposedType = v;
}
