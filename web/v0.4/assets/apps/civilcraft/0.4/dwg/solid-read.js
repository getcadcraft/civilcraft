/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid-read.js — decode REGION / 3DSOLID / BODY (the ACIS entities, 20.4.41) and attach the ACIS data the
 * R2013+ data storage section keeps for them (cc-dwg, Apache-2.0). Written from the ODA "Open Design Specification for
 * .dwg files" v5.4.1: 20.4.41 (ACIS data, wireframe, silhouettes, history), 20.4.1 (the R2013+ "has data storage"
 * flag), ch. 24 (data storage, via acds.js).
 * Facts found by experiment are marked "Spec gap:".
 *
 *   decodeAcisEntity(r, h, rec, ctx)   objects-read.js decoder for REGION / 3DSOLID / BODY
 *   attachDataStorage(records, sectionBytes, notes)   R2013+: rec.acis = { format: 'sab', version, data } from AcDs
 *   solidFields(rec, f, hx, appName)   read.js: history handle; R2004–R2010 revision GUID from ACAD_OBJECT_CHANGE_GUID xdata
 *
 * Record fields (model.js documents them): acis { format 'sat'|'sab', version, data (SAT text | SAB base64) } (absent
 * when the entity is empty), wireframe? { point?, isolines, isolinesPresent, wires [] }, silhouettes? [], acisExtra?
 * (a second ACIS block, very rare), hasRevisionGuid + revisionGuid (R2013+), history (R2007+ handle, read.js names it).
 */

import { satDecrypt, findAcisEnd, isSab, sabVersion, acisInfo, bytesToB64, latin1String } from './acis.js';
import { readAcds } from './acds.js';

/**
 * One ACIS data block (20.4.41): B empty, B unknown, BS version, then version 1 SAT blocks or a version 2 file.
 * `withEmptyBit` false: the block after the wireframe's "ACIS Empty bit" (that bit was its empty bit).
 */
function acisBlock(r, withEmptyBit = true) {
  if (withEmptyBit && r.B()) return null;  // empty
  const unknown = r.B();
  const version = r.BS();
  if (version === 1) {
    // BL block size, that many RC; until a 0 size
    const parts = [];
    let total = 0;
    for (let guard = 0; guard < 1e6; guard++) {
      const n = r.BL();
      if (!n) break;
      if (n * 8 > r.end - r.pos) throw new Error('ACIS block of ' + n + ' bytes is larger than the data');
      parts.push(r.bytes(n)); total += n;
    }
    const all = new Uint8Array(total);
    let at = 0; for (const p of parts) { all.set(p, at); at += p.length; }
    const text = satDecrypt(all);
    return { unknown, dwgVersion: 1, acis: { format: 'sat', version: acisInfo('sat', text).version, data: text } };
  }
  if (version === 2) {
    // no length: read on to the end mark
    const left = (r.end - r.pos) >> 3;
    const save = r.pos;
    const all = r.bytes(left);
    const n = findAcisEnd(all);
    if (n < 0) throw new Error('ACIS data (version 2) has no end mark');
    r.pos = save + n * 8;
    const b = all.slice(0, n);
    if (isSab(b)) return { unknown, dwgVersion: 2, acis: { format: 'sab', version: sabVersion(b), data: bytesToB64(b) } };
    const text = latin1String(b);
    return { unknown, dwgVersion: 2, acis: { format: 'sat', version: acisInfo('sat', text).version, data: text } };
  }
  throw new Error('ACIS data version ' + version);
}

/** 20.4.41 a wire of the wireframe or of a silhouette. */
function wire(r) {
  const w = { type: r.RC(), selectionMarker: r.BL() | 0, color: r.BS(), acisIndex: r.BL() | 0 };
  const n = r.BL();
  if (n * 6 > r.end - r.pos) throw new Error('wire of ' + n + ' points is larger than the data');
  w.points = new Array(n);
  for (let i = 0; i < n; i++) w.points[i] = r.BD3();
  if (r.B()) {
    w.transform = { xAxis: r.BD3(), yAxis: r.BD3(), zAxis: r.BD3(), translation: r.BD3(), scale: r.BD(),
      hasRotation: !!r.B(), hasReflection: !!r.B(), hasShear: !!r.B() };
  }
  return w;
}
function wires(r) {
  const n = r.BL();
  if (n * 10 > r.end - r.pos) throw new Error(n + ' wires are more than the data holds');
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = wire(r);
  return a;
}

/** REGION / 3DSOLID / BODY. */
export function decodeAcisEntity(r, h, rec, ctx) {
  const ver = ctx.ver;
  // Spec gap: R2013+ with the common "has data storage" flag (20.4.1) set: the ACIS data lives in AcDb:AcDsPrototype_1b
  // and the entity data starts directly with the wireframe part — no empty bit, unknown bit or version (AutoCAD's
  // example_2013/2018.dwg: their entity data equals what follows the SAB in example_2010.dwg).
  if (ver >= 27 && rec._ds) rec._acisInDataStorage = true;
  else {
    const a = acisBlock(r);
    if (a) { rec.acis = a.acis; rec._acisUnknownBit = a.unknown; rec._acisDwgVersion = a.dwgVersion; }
    else rec.acisEmpty = true;
  }
  // Spec gap: 20.4.41 lists "Num silhouettes", the second "ACIS Empty bit" and (R2007+) "Unknown BL" after the wireframe
  // for every entity. In files they are: wireframe present B; only when present: point, isolines, wires, silhouettes and
  // the second empty bit; then (R2007+) the BL. (AutoCAD's solids have wireframes: 155 bits after the SAB in
  // example_2010.dwg = wireframe … empty bit + BL 0 + the string-stream flag; the ODA File Converter's solids without one
  // have just "0" + BL 0 + the flag.)
  if (r.B()) {
    const wf = rec.wireframe = {};
    if (r.B()) wf.point = r.BD3();
    wf.isolines = r.BL();
    wf.isolinesPresent = !!r.B();
    // Spec gap: "Num Wires" and the wires are there only when "IsoLines present" is set (the ODA File Converter's R2000/R2004
    // saves of example_2010.dwg: isolines present 0, then at once the silhouette count).
    if (wf.isolinesPresent) wf.wires = wires(r);
    const ns = r.BL();
    if (ns * 10 > r.end - r.pos) throw new Error(ns + ' silhouettes are more than the data holds');
    rec.silhouettes = [];
    // Spec gap: the viewport id is a BLL from R2010 (a BL before: the ODA File Converter's R2004/R2007 and R2010 saves of
    // the same client drawing), and a silhouette's "Num Wires" and wires follow a "wires present" bit, as
    // the wireframe's follow "IsoLines present".
    for (let i = 0; i < ns; i++) {
      const sil = { viewportId: ver >= 24 ? r.BLL() : r.BL(), target: r.BD3(), direction: r.BD3(), up: r.BD3(), perspective: !!r.B() };
      sil.wiresPresent = !!r.B();
      if (sil.wiresPresent) sil.wires = wires(r);
      rec.silhouettes.push(sil);
    }
    // "ACIS Empty bit — normally 1. If 0, then acis data follows in the same format as described above". Spec gap: the
    // block has no empty bit of its own (this bit is it): B unknown, BS version, data — the ODA File Converter writes the
    // solid's ACIS data a second time here when it saves an AutoCAD solid with a wireframe down to R2000/R2004.
    if (!r.B()) { const a = acisBlock(r, false); rec.acisExtra = a.acis; }
  }
  if (ver >= 21) rec._unknownBL = r.BL();
  // Spec gap: R2013+ add the revision GUID (DXF 290 flag + 2 GUID of AcDbModelerGeometry): B flag, BL, BS, BS, 8 RC, then
  // a BL (0 in every file seen) — found by locating the GUIDs the ODA File Converter's DXF shows in the entity bits.
  if (ver >= 27) {
    rec.hasRevisionGuid = !!r.B();
    const d1 = r.BL() >>> 0, d2 = r.BS() & 0xFFFF, d3 = r.BS() & 0xFFFF;
    const d4 = r.bytes(8);
    rec.revisionGuid = guidString(d1, d2, d3, d4);
    rec._unknownBL2 = r.BL();
  }
  if (ver >= 21 && rec.type === '3DSOLID') rec._h.history = h.H(rec.handle);   // DXF 350: AcDb3dSolid only
}

export function guidString(d1, d2, d3, d4) {
  const hx = (v, n) => v.toString(16).padStart(n, '0');
  const b = [...d4].map((x) => hx(x, 2)).join('');
  return '{' + hx(d1, 8) + '-' + hx(d2, 4) + '-' + hx(d3, 4) + '-' + b.slice(0, 4) + '-' + b.slice(4) + '}';
}

/** ACAD_OBJECT_CHANGE_GUID extended data (R2004–R2010 keep the revision GUID there): [1070 flag][1071][1070][1070][1070 × 8]. */
export function guidFromXdata(items) {
  if (!items || items.length < 12) return null;
  const v = items.map((x) => x[1]);
  const d4 = new Uint8Array(8);
  for (let i = 0; i < 8; i++) d4[i] = v[4 + i] & 0xFF;
  return { flag: !!v[0], guid: guidString(v[1] >>> 0, v[2] & 0xFFFF, v[3] & 0xFFFF, d4) };
}

/**
 * R2013+: the SAB of every ACIS entity stored in AcDb:AcDsPrototype_1b (ch. 24), attached to its record by handle.
 * Records of other kinds (thumbnails …) are left alone.
 */
export function attachDataStorage(records, sec, notes) {
  if (!sec) {
    let n = 0;
    for (const r of records.values()) if (r._acisInDataStorage) n++;
    if (n) notes.push(n + ' ACIS entit' + (n === 1 ? 'y says its' : 'ies say their') + ' data is in the data storage section, which the file does not have.');
    return;
  }
  const ds = readAcds(sec);
  for (const n of ds.notes) notes.push(n);
  let missing = 0;
  for (const r of records.values()) {
    if (!r._acisInDataStorage) continue;
    const b = ds.records.get(r.handle);
    if (!b) { missing++; r.acisEmpty = true; continue; }
    if (isSab(b)) r.acis = { format: 'sab', version: sabVersion(b), data: bytesToB64(b) };
    else { const t = latin1String(b); r.acis = { format: 'sat', version: acisInfo('sat', t).version, data: t }; }
  }
  if (missing) notes.push(missing + ' ACIS entit' + (missing === 1 ? 'y has' : 'ies have') + ' no record in the data storage section (kept empty).');
}

/** read.js: model fields of an ACIS entity record (handles named, the R2004–R2010 xdata GUID surfaced). */
export function solidFields(rec, f, hx, appName) {
  if (rec._h.history) f.history = hx(rec._h.history);
  if (rec.revisionGuid === undefined && rec._eed) {
    const x = rec._eed.find((e) => appName(e.app) === 'ACAD_OBJECT_CHANGE_GUID');
    const g = x && guidFromXdata(x.items);
    if (g) { f.hasRevisionGuid = g.flag; f.revisionGuid = g.guid; }
  }
}
