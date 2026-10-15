/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: report notes go through msg() (messages.js); what is left is internal checks and file-format text. */
/**
 * solid-write.js — write REGION / 3DSOLID / BODY with their ACIS data, and LIGHT (cc-dwg, Apache-2.0). Written from the
 * ODA "Open Design Specification for .dwg files" v5.4.1: 20.4.41 (the ACIS entities), 20.4.1/20.4.2 (common entity data:
 * the R2013+ "has data storage" flag), ch. 24 (data storage, acds.js), ch. 10 (classes, for LIGHT); the layout facts the
 * reader found by experiment (solid-read.js) are mirrored here. LIGHT is not in the specification (see solid-read.js).
 *
 *   const S = solidWriter(env)        write.js, next to the other writers (env: version, report, next, srcMap, hexKey,
 *                                     common, eedOf)
 *   S.convert(e, type, owner, c)      → records | 'skip reason' | undefined (not an entity of this module)
 *   S.finish()                        after the source's objects are copied: history handles mapped to the new file
 *   S.dataStorage()                   R2013+: the AcDb:AcDsPrototype_1b section bytes (null when no ACIS entity)
 *
 * The ACIS data is written as the model holds it (no SAT ↔ SAB conversion — that needs the ACIS schema): SAT as
 * version 1 (4096-byte blocks, 0x9F − c substitution) and SAB as version 2 inline up to R2010; from R2013 both go to the
 * data storage section (the entity's data-storage flag set; SAT as its text) — all read back by the ODA File Converter
 * (solids-check.mjs). The wireframe / silhouette cache is written back as the model holds it (none
 * for a new body); a second copy of the ACIS data after it (acisExtra) is not.
 */

import { msg } from './messages.js';
import { ObjWriter, begin, finish, entityCommon, CLASSED, SOFT_OWN } from './objects-write.js';
import { satEncrypt, normAcis, satToBytes } from './acis.js';
import { writeAcds } from './acds.js';
import { VERSION_NUM } from './header-vars.js';

const TYPE = { REGION: 37, '3DSOLID': 38, BODY: 39 };
CLASSED.LIGHT = CLASSED.LIGHT || { dxf: 'LIGHT', cpp: 'AcDbLight', app: 'SCENEOE', entity: true, proxy: 1025 };
const GUID0 = '{00000000-0000-0000-0000-000000000000}';
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);
const P3 = (p) => ({ x: num(p?.x), y: num(p?.y), z: num(p?.z) });

/** '{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}' → { d1, d2, d3, d4: Uint8Array(8) } (zeros when malformed) */
function parseGuid(s) {
  const m = /^\{?([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})\}?$/i.exec(String(s || ''));
  const d4 = new Uint8Array(8);
  if (!m) return { d1: 0, d2: 0, d3: 0, d4 };
  const tail = m[4] + m[5];
  for (let i = 0; i < 8; i++) d4[i] = parseInt(tail.slice(i * 2, i * 2 + 2), 16);
  return { d1: parseInt(m[1], 16) >>> 0, d2: parseInt(m[2], 16), d3: parseInt(m[3], 16), d4 };
}

/** One inline ACIS block (20.4.41): B empty, B unknown, BS version, data. */
function writeAcisBlock(w, a) {
  if (!a) { w.B(1); return; }
  w.B(0);
  if (a.format === 'sat') {
    // version 1: the text in blocks of at most 4096 bytes (as AutoCAD and the converter write it), then a 0 size
    w.B(1); w.BS(1);
    const b = satEncrypt(a.text);
    for (let i = 0; i < b.length; i += 4096) {
      const part = b.subarray(i, Math.min(b.length, i + 4096));
      w.BL(part.length);
      for (const x of part) w.RC(x);
    }
    w.BL(0);
  } else {
    // version 2: the SAB as it is, ending with its own end mark
    w.B(0); w.BS(2);
    for (const x of a.bytes) w.RC(x);
  }
}

/** 20.4.41 a wire (layout as solid-read.js reads it). */
function writeWire(w, x) {
  w.RC(x.type | 0); w.BL(x.selectionMarker | 0); w.BS(x.color | 0); w.BL(x.acisIndex | 0);
  const pts = x.points || [];
  w.BL(pts.length); for (const p of pts) w.P3(p);
  const t = x.transform;
  w.B(t ? 1 : 0);
  if (t) { w.P3(t.xAxis); w.P3(t.yAxis); w.P3(t.zAxis); w.P3(t.translation); w.BD(num(t.scale, 1)); w.B(t.hasRotation ? 1 : 0); w.B(t.hasReflection ? 1 : 0); w.B(t.hasShear ? 1 : 0); }
}
function writeWires(w, list) { w.BL(list.length); for (const x of list) writeWire(w, x); }
/** Wireframe present B, then (when present) point, isolines, wires, silhouettes and the second empty bit (1). */
function writeWireframe(w, rec) {
  const wf = rec.wireframe;
  if (!wf) { w.B(0); return; }
  w.B(1);
  w.B(wf.point ? 1 : 0); if (wf.point) w.P3(wf.point);
  w.BL(wf.isolines ?? 4);
  const wires = wf.wires || [];
  const present = wf.isolinesPresent ?? wires.length > 0;
  w.B(present ? 1 : 0);
  if (present) writeWires(w, wires);
  const sils = rec.silhouettes || [];
  w.BL(sils.length);
  for (const s of sils) {
    if (w.r2010) w.BLL(s.viewportId || 0); else w.BL(s.viewportId || 0);
    w.P3(s.target); w.P3(s.direction); w.P3(s.up); w.B(s.perspective ? 1 : 0);
    const sw = s.wires || [];
    const sp = s.wiresPresent ?? sw.length > 0;
    w.B(sp ? 1 : 0);
    if (sp) writeWires(w, sw);
  }
  w.B(1);                                        // "ACIS Empty bit": no second copy of the data
}

function encodeAcisEntity(rec, ctx) {
  const w = new ObjWriter(ctx.version);
  begin(w, TYPE[rec.t], rec);
  entityCommon(w, rec);                          // rec.ds: R2013+ data storage flag
  if (!(w.r2013 && rec.ds)) writeAcisBlock(w, rec.acis);
  writeWireframe(w, rec);                        // the model's wireframe / silhouette cache, if any
  if (w.r2007) w.BL(0);
  if (w.r2013) {
    const g = parseGuid(rec.revisionGuid);
    w.B(rec.hasRevisionGuid ? 1 : 0);
    w.BL(g.d1); w.BS(g.d2); w.BS(g.d3);
    for (const x of g.d4) w.RC(x);
    w.BL(0);
  }
  if (w.r2007 && rec.t === '3DSOLID') w.H(SOFT_OWN, rec.history || 0);
  return finish(w);
}

function encodeLight(rec, ctx) {
  const w = new ObjWriter(ctx.version);
  begin(w, ctx.classNum('LIGHT'), rec);
  entityCommon(w, rec);
  w.BL(rec.lightVersion ?? 1); w.TV(rec.name ?? ''); w.BS(rec.lightType ?? 2); w.B(rec.status ? 1 : 0);
  w.CMC(rec.lightColor || { index: 7 }); w.B(rec.plotGlyph ? 1 : 0); w.BD(num(rec.intensity, 1));
  w.P3(rec.position); w.P3(rec.target);
  w.BS(rec.attenuationType | 0); w.B(rec.useAttenuationLimits ? 1 : 0); w.BD(num(rec.attenuationStart)); w.BD(num(rec.attenuationEnd, 10));
  w.BD(num(rec.hotspot, Math.PI / 4)); w.BD(num(rec.falloff, Math.PI / 4 + 0.0872664626)); w.B(rec.castShadows ? 1 : 0);
  w.BS(rec.shadowType | 0); w.BS(rec.shadowMapSize ?? 256); w.RC(rec.shadowMapSoftness ?? 1);
  return finish(w);
}

export function solidWriter(env) {
  const { version, report, srcMap, hexKey } = env;
  const ver = VERSION_NUM[version];
  const acds = [];                                // R2013+: { handle, data }
  const recs = [];
  const notes = { satInR2013: 0, sabInR2000: 0, empty: 0 };

  function convert(e, type, owner, c) {
    if (type === 'LIGHT') {
      // R2000 colours are indexes: a true colour becomes the nearest index
      let lc = e.lightColor || { index: 7 };
      if (ver < 18 && lc.index === undefined && lc.rgb !== undefined) lc = { index: env.aciFromRgb(lc.rgb) };
      return [{ ...c('LIGHT'), encode: encodeLight, lightVersion: e.lightVersion, name: String(e.name ?? ''), lightType: e.lightType ?? 2,
        status: e.status !== false, lightColor: lc, plotGlyph: !!e.plotGlyph, intensity: e.intensity, position: P3(e.position),
        target: P3(e.target), attenuationType: e.attenuationType, useAttenuationLimits: !!e.useAttenuationLimits,
        attenuationStart: e.attenuationStart, attenuationEnd: e.attenuationEnd, hotspot: e.hotspot, falloff: e.falloff,
        castShadows: !!e.castShadows, shadowType: e.shadowType, shadowMapSize: e.shadowMapSize, shadowMapSoftness: e.shadowMapSoftness }];
    }
    if (!TYPE[type]) return undefined;
    const a = normAcis(e.acis);
    if (!a) notes.empty++;
    // the revision GUID: R2013+ in the entity; R2004–R2010 in ACAD_OBJECT_CHANGE_GUID xdata (kept if the model has it)
    let r;
    const xd = e.xdata && e.xdata.ACAD_OBJECT_CHANGE_GUID;
    if (ver >= 27 && xd) { const x = { ...e.xdata }; delete x.ACAD_OBJECT_CHANGE_GUID; r = env.common({ ...e, xdata: x }, type, owner); }
    else if (ver >= 18 && ver < 27 && !xd && e.hasRevisionGuid && e.revisionGuid && e.revisionGuid !== GUID0) {
      const g = parseGuid(e.revisionGuid);
      const items = [[1070, 1], [1071, g.d1 | 0], [1070, (g.d2 << 16) >> 16], [1070, (g.d3 << 16) >> 16], ...[...g.d4].map((v) => [1070, v])];
      r = env.common({ ...e, xdata: { ...(e.xdata || {}), ACAD_OBJECT_CHANGE_GUID: items } }, type, owner);
    } else r = c(type);
    let hasGuid = !!e.hasRevisionGuid, guid = e.revisionGuid;
    if (guid === undefined && xd) {
      const v = xd.map((x) => x[1]);
      if (v.length >= 12) { hasGuid = !!v[0]; guid = '{' + (v[1] >>> 0).toString(16).padStart(8, '0') + '-' + (v[2] & 0xFFFF).toString(16).padStart(4, '0') + '-' + (v[3] & 0xFFFF).toString(16).padStart(4, '0') + '-' + v.slice(4, 6).map((x) => (x & 0xFF).toString(16).padStart(2, '0')).join('') + '-' + v.slice(6, 12).map((x) => (x & 0xFF).toString(16).padStart(2, '0')).join('') + '}'; }
    }
    Object.assign(r, { encode: encodeAcisEntity, acis: a, wireframe: e.wireframe, silhouettes: e.silhouettes, hasRevisionGuid: hasGuid && !!guid, revisionGuid: guid || GUID0, historySrc: type === '3DSOLID' ? e.history : undefined });
    if (a && ver >= 27) {
      if (a.format === 'sab') { r.ds = true; acds.push({ handle: r.h, data: a.bytes }); }
      else {
        // Spec gap (24.2.2.3 speaks of SAB only): SAT text inline in an R2013+ entity (flag clear) is dropped by the ODA
        // File Converter without a word; the SAT text as the data storage record is read (and re-saved as SAB) — experiment.
        r.ds = true; acds.push({ handle: r.h, data: satToBytes(a.text) }); notes.satInR2013++;
      }
    }
    if (a && ver < 18 && a.format === 'sab') notes.sabInR2000++;
    recs.push(r);
    return [r];
  }

  function finish() {
    for (const r of recs) if (r.historySrc) r.history = srcMap.get(hexKey(r.historySrc)) || 0;
    const n = (k, s) => { if (notes[k]) report.notes.push(s(notes[k])); };
    n('empty', (k) => msg('ccdwg.write.acis_empty', { n: k }));
    n('satInR2013', (k) => msg('ccdwg.write.acis_sat', { n: k }));
    n('sabInR2000', (k) => msg('ccdwg.write.acis_sab', { n: k }));
  }

  return { convert, finish, dataStorage: () => (ver >= 27 ? writeAcds(acds) : null) };
}

export { parseGuid, writeAcisBlock, writeWireframe };   // also used by surface-write.js (the SURFACE family)
