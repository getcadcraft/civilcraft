/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-util.js — small web-ifc helpers shared by libitem-ifc.js (IFC types → library items) and
 * ifc-place.js (library items → IFC). No DOM: Node runs it.
 *
 *   code(api, 'IFCWALL')                  type code (no WebIFC import needed)
 *   ids(api, mid, 'IFCWALL', inherited)   [expressID…]
 *   val(x)                                web-ifc value → plain JS value
 *   lengthUnitMm(api, mid)                mm per file length unit (1 for mm files, 1000 for m, 304.8 for ft…)
 *   unitMm(unitLine)                      mm per unit of one IfcNamedUnit line (read with GetLine(…, true))
 *   M4: inv4, mul4, apply4 — column-major 4×4 matrices as web-ifc returns them
 *   yupToZup([x,y,z]) / zupToYup — web-ifc hands geometry over Y-up; IFC is Z-up
 */

export const code = (api, name) => api.GetTypeCodeFromName(name);

/** web-ifc keeps listing a line after DeleteLine; deleted ids are remembered here and left out of ids(). */
const deleted = new WeakMap();
const gone = (api, mid) => { let m = deleted.get(api); if (!m) deleted.set(api, (m = new Map())); if (!m.has(mid)) m.set(mid, new Set()); return m.get(mid); };
export function deleteLine(api, mid, id) { api.DeleteLine(mid, id); gone(api, mid).add(id); }
/** A deleted line written back (undo): web-ifc refuses to re-use a deleted id until its own list forgets it too. */
export function restored(api, mid, id) { gone(api, mid).delete(id); api.deletedLines?.get(mid)?.delete(id); }
export function isDeleted(api, mid, id) { return gone(api, mid).has(id); }
/**
 * Write `line` at its express ID even when the line there now has another type (0.4 B11: a swap changes an occurrence's
 * class; undo changes it back). web-ifc refuses "Cannot change type of existing IFC Line": delete it, forget the
 * deletion, then write — the id, and every handle that points at it, stays.
 */
export function replaceLine(api, mid, line) {
  // only ever called for a line that exists: reading a deleted one makes web-ifc log "Invalid IFC Line" (try/catch or not)
  const cur = api.GetLine(mid, line.expressID, false);
  if (cur && cur.type !== line.type) { api.DeleteLine(mid, line.expressID); restored(api, mid, line.expressID); }
  api.WriteLine(mid, line);
}

export function ids(api, mid, name, inherited = false) {
  const v = api.GetLineIDsWithType(mid, code(api, name), inherited);
  const out = [], skip = gone(api, mid);
  for (let i = 0; i < v.size(); i++) { const id = v.get(i); if (!skip.has(id)) out.push(id); }
  return out;
}

/**
 * Make a line read back from web-ifc writable again: every typed value (IfcLengthMeasure, IfcLabel, …, also inside
 * lists) is created anew from its plain value. The browser build keeps a REAL read from a file as text inside
 * (_internalValue "2100."), which it cannot write. Handles and enumerations are left as they are. → the same line.
 */
export function retypeLine(api, mid, line) {
  const fix = (v) => {
    if (Array.isArray(v)) return v.map(fix);
    if (v && typeof v === 'object' && v.type !== 5 && v.type !== 3 && typeof v.name === 'string' && 'value' in v) {
      try { return api.CreateIfcType(mid, api.GetTypeCodeFromName(v.name), v.value); } catch (e) { return v; }
    }
    return v;
  };
  for (const k of Object.keys(line)) if (k !== 'expressID' && k !== 'type') line[k] = fix(line[k]);
  return line;
}

export function val(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && 'value' in v) return v.value;
  return v;
}

const PREFIX = { EXA: 1e21, PETA: 1e18, TERA: 1e15, GIGA: 1e12, MEGA: 1e9, KILO: 1e6, HECTO: 1e5, DECA: 1e4, DECI: 100, CENTI: 10, MILLI: 1, MICRO: 1e-3, NANO: 1e-6 };

/** mm per length unit of the file (project units; SI metre with prefix, or a conversion-based unit). */
export function lengthUnitMm(api, mid) {
  const proj = ids(api, mid, 'IFCPROJECT')[0];
  let assign = null;
  if (proj) {
    const p = api.GetLine(mid, proj, false);
    if (p.UnitsInContext) assign = api.GetLine(mid, p.UnitsInContext.value, true);
  }
  if (!assign) { const a = ids(api, mid, 'IFCUNITASSIGNMENT')[0]; if (a) assign = api.GetLine(mid, a, true); }
  for (const u of assign?.Units || []) {
    if (!u || val(u.UnitType) !== 'LENGTHUNIT') continue;
    return unitMm(u);
  }
  return 1000;   // IFC's default length unit is the metre
}
export function unitMm(u) {
  if (!u) return 1000;
  if (u.Name && val(u.Name) === 'METRE' && !u.ConversionFactor) {
    const pre = val(u.Prefix);
    return pre ? (PREFIX[pre] ?? 1000) : 1000;
  }
  if (u.ConversionFactor) {
    const f = u.ConversionFactor;   // IfcMeasureWithUnit: value × its unit (usually SI metre)
    // web-ifc: {ValueComponent, UnitComponent}; cc-ifc: {name:'IFCMEASUREWITHUNIT', value:[factor, unit]}. The unit is a
    // {ref} when it was not inlined; it is the SI metre in every file we write, so a ref reads as metres.
    const arr = Array.isArray(f.value) ? f.value : null;
    const v = Number(arr ? val(arr[0]) : val(f.ValueComponent));
    const uc = arr ? arr[1] : f.UnitComponent;
    const base = uc && !uc.ref && typeof uc === 'object' && (uc.Name || uc.ConversionFactor) ? unitMm(uc) : 1000;
    if (Number.isFinite(v) && v > 0) return v * base;
    const n = String(val(u.Name) || '').toUpperCase();
    return n.includes('FOOT') ? 304.8 : n.includes('INCH') ? 25.4 : 1000;
  }
  return 1000;
}

export function mul4(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
export function apply4(m, x, y, z) {
  return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
}
/** Inverse of a rigid (rotation + translation, possibly scaled) column-major 4×4 via the general 4×4 inverse. */
/**
 * Federation (0.4 B16): where model k goes in the scene. Each model is loaded moved to the origin (web-ifc
 * COORDINATE_TO_ORIGIN, its coordination matrix C); undoing C and applying the first model's (refC) puts it in the first
 * model's coordinates, then `offset` [x, y, z] (metres, IFC axes: Z up) moves it — web-ifc's viewer space is Y up, so
 * IFC (x, y, z) → viewer (x, z, −y). Column-major 4 × 4.
 */
export function placementMatrix(refC, C, offset = [0, 0, 0]) {
  const [dx, dy, dz] = offset;
  const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, dx, dz, -dy, 1];
  return mul4(T, mul4(refC || C, inv4(C)));
}

export function inv4(m) {
  const a = m, o = new Array(16);
  o[0] = a[5] * a[10] * a[15] - a[5] * a[11] * a[14] - a[9] * a[6] * a[15] + a[9] * a[7] * a[14] + a[13] * a[6] * a[11] - a[13] * a[7] * a[10];
  o[4] = -a[4] * a[10] * a[15] + a[4] * a[11] * a[14] + a[8] * a[6] * a[15] - a[8] * a[7] * a[14] - a[12] * a[6] * a[11] + a[12] * a[7] * a[10];
  o[8] = a[4] * a[9] * a[15] - a[4] * a[11] * a[13] - a[8] * a[5] * a[15] + a[8] * a[7] * a[13] + a[12] * a[5] * a[11] - a[12] * a[7] * a[9];
  o[12] = -a[4] * a[9] * a[14] + a[4] * a[10] * a[13] + a[8] * a[5] * a[14] - a[8] * a[6] * a[13] - a[12] * a[5] * a[10] + a[12] * a[6] * a[9];
  o[1] = -a[1] * a[10] * a[15] + a[1] * a[11] * a[14] + a[9] * a[2] * a[15] - a[9] * a[3] * a[14] - a[13] * a[2] * a[11] + a[13] * a[3] * a[10];
  o[5] = a[0] * a[10] * a[15] - a[0] * a[11] * a[14] - a[8] * a[2] * a[15] + a[8] * a[3] * a[14] + a[12] * a[2] * a[11] - a[12] * a[3] * a[10];
  o[9] = -a[0] * a[9] * a[15] + a[0] * a[11] * a[13] + a[8] * a[1] * a[15] - a[8] * a[3] * a[13] - a[12] * a[1] * a[11] + a[12] * a[3] * a[9];
  o[13] = a[0] * a[9] * a[14] - a[0] * a[10] * a[13] - a[8] * a[1] * a[14] + a[8] * a[2] * a[13] + a[12] * a[1] * a[10] - a[12] * a[2] * a[9];
  o[2] = a[1] * a[6] * a[15] - a[1] * a[7] * a[14] - a[5] * a[2] * a[15] + a[5] * a[3] * a[14] + a[13] * a[2] * a[7] - a[13] * a[3] * a[6];
  o[6] = -a[0] * a[6] * a[15] + a[0] * a[7] * a[14] + a[4] * a[2] * a[15] - a[4] * a[3] * a[14] - a[12] * a[2] * a[7] + a[12] * a[3] * a[6];
  o[10] = a[0] * a[5] * a[15] - a[0] * a[7] * a[13] - a[4] * a[1] * a[15] + a[4] * a[3] * a[13] + a[12] * a[1] * a[7] - a[12] * a[3] * a[5];
  o[14] = -a[0] * a[5] * a[14] + a[0] * a[6] * a[13] + a[4] * a[1] * a[14] - a[4] * a[2] * a[13] - a[12] * a[1] * a[6] + a[12] * a[2] * a[5];
  o[3] = -a[1] * a[6] * a[11] + a[1] * a[7] * a[10] + a[5] * a[2] * a[11] - a[5] * a[3] * a[10] - a[9] * a[2] * a[7] + a[9] * a[3] * a[6];
  o[7] = a[0] * a[6] * a[11] - a[0] * a[7] * a[10] - a[4] * a[2] * a[11] + a[4] * a[3] * a[10] + a[8] * a[2] * a[7] - a[8] * a[3] * a[6];
  o[11] = -a[0] * a[5] * a[11] + a[0] * a[7] * a[9] + a[4] * a[1] * a[11] - a[4] * a[3] * a[9] - a[8] * a[1] * a[7] + a[8] * a[3] * a[5];
  o[15] = a[0] * a[5] * a[10] - a[0] * a[6] * a[9] - a[4] * a[1] * a[10] + a[4] * a[2] * a[9] + a[8] * a[1] * a[6] - a[8] * a[2] * a[5];
  const det = a[0] * o[0] + a[1] * o[4] + a[2] * o[8] + a[3] * o[12];
  if (!det) return null;
  for (let i = 0; i < 16; i++) o[i] /= det;
  return o;
}

/** web-ifc geometry is Y-up (x, y, z)_y = (x, z, −y)_z. */
export const yupToZup = (x, y, z) => [x, -z, y];
export const zupToYup = (x, y, z) => [x, z, -y];

/** Every placed triangle of a product, in the file's Z-up coordinates and length unit. Ci = inverse coordination matrix
 * when the model was opened with COORDINATE_TO_ORIGIN (undoes the shift). */
export function productTriangles(api, mid, id, unitMm, Ci = null) {
  const fm = api.GetFlatMesh(mid, id);
  const pos = [], idx = [];
  const toUnit = 1000 / unitMm;   // web-ifc meters → file units
  for (let g = 0; g < fm.geometries.size(); g++) {
    const pg = fm.geometries.get(g);
    const geom = api.GetGeometry(mid, pg.geometryExpressID);
    const v = api.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize());
    const ix = api.GetIndexArray(geom.GetIndexData(), geom.GetIndexDataSize());
    const m = pg.flatTransformation, base = pos.length / 3;
    for (let i = 0; i < v.length; i += 6) {
      let [x, y, z] = apply4(m, v[i], v[i + 1], v[i + 2]);
      if (Ci) [x, y, z] = apply4(Ci, x, y, z);
      const [X, Y, Z] = yupToZup(x, y, z);
      pos.push(X * toUnit, Y * toUnit, Z * toUnit);
    }
    for (let i = 0; i < ix.length; i++) idx.push(base + ix[i]);
    geom.delete();
  }
  if (fm.delete) fm.delete();
  return { positions: pos, indices: idx };
}
