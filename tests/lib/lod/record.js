// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file: the sentences here are the English fallback for a host with no catalog (keys lod.* in the host language file say the same) and file-format values */
/**
 * record.js: the LOD record every element carries, and its three parts, host-free (0.10 booklet rows BK.13 and BK.14, session bim-lod-10).
 * No DOM. THE STORED FIELDS (a host keeps them on the element; BimCraft: property set LOD_PSET, plain integers other programs can read):
 *
 *   LOD            the element's level of development, one of the scale (scale.js). Missing = not stated (never 0, never text).
 *   LODGeometry · LODInformation · LODDocumentation     the level each of the three PARTS has reached (ISO 7817-1: geometry,
 *                  alphanumeric information, documentation). Each may be stated alone: rich data with rough geometry, or the reverse.
 *
 * An element's IFC class is the element's own (the file says it) and its classification codes are the classification module's
 * (BimCraft: classify-model.js); this record does not copy either, `frameworkOf` only reads them together so every element answers
 * "LOD, IFC class, classification, three parts" in one shape.
 *
 * "Each level includes the ones below" (BK.14): a part that has reached 300 has reached 200. A part's mark against the element's own LOD:
 *   met        the part's level is at least the element's LOD
 *   below      the part has a level and it is lower than the element's LOD (the element claims more than this part shows)
 *   not-stated the part has no level yet (the mark says so; nothing is guessed)
 *   (no mark at all when the element has no LOD to compare to: `partMarks` then returns 'no-lod')
 * The milestone check (milestones.js) reads the element's own LOD, the promise others rely on; the parts are advice beside it.
 *
 *   LOD_PSET, PART_PROPS, PARTS
 *   cleanRecord(raw) → { lod, parts: { geometry, information, documentation } }   untrusted (a file is); numbers off the scale → null
 *   recordRows(rec) → [[name, 'IFCINTEGER', value | null]]       null = take the property off (a host writes only set values, '' clears)
 *   fromPset(pset) → record                                      pset = { LOD, LODGeometry, … } as a host reads it
 *   partMarks(rec) → { geometry: mark, information: mark, documentation: mark }
 *   weakestPart(rec) → { part, lod } | null                      the lowest stated part (null when none stated)
 *   effectiveLod(rec, typeLod, verified) → the element's own, else its type's; 500 while field-verified
 *   frameworkOf({ cls, record, typeLod, verified, codes }) → { ifcClass, lod, lodFrom, parts, marks, codes, complete }
 */
import { isLod } from '../walls/lod.js';

export const LOD_PSET = 'CadCraft_LOD';
export const PARTS = Object.freeze(['geometry', 'information', 'documentation']);
export const PART_PROPS = Object.freeze({ geometry: 'LODGeometry', information: 'LODInformation', documentation: 'LODDocumentation' });
export const LOD_PROP = 'LOD';

const num = (v) => { const n = typeof v === 'string' && /^\s*\d{3}\s*$/.test(v) ? Number(v) : v; return isLod(n) ? n : null; };

export function cleanRecord(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const p = r.parts && typeof r.parts === 'object' ? r.parts : {};
  return { lod: num(r.lod ?? r.LOD), parts: { geometry: num(p.geometry ?? r.LODGeometry), information: num(p.information ?? r.LODInformation), documentation: num(p.documentation ?? r.LODDocumentation) } };
}
export const fromPset = (pset) => cleanRecord(pset ? { LOD: pset.LOD, LODGeometry: pset.LODGeometry, LODInformation: pset.LODInformation, LODDocumentation: pset.LODDocumentation } : null);

/** Every row, so a host that writes them in one pass also clears a value that was taken off (null). */
export function recordRows(rec) {
  const c = cleanRecord(rec);
  return [[LOD_PROP, 'IFCINTEGER', c.lod], ...PARTS.map((p) => [PART_PROPS[p], 'IFCINTEGER', c.parts[p]])];
}
export const isEmpty = (rec) => { const c = cleanRecord(rec); return c.lod === null && PARTS.every((p) => c.parts[p] === null); };

export function partMarks(rec) {
  const c = cleanRecord(rec), out = {};
  for (const p of PARTS) out[p] = c.lod === null ? 'no-lod' : c.parts[p] === null ? 'not-stated' : c.parts[p] >= c.lod ? 'met' : 'below';
  return out;
}
export function weakestPart(rec) {
  const c = cleanRecord(rec);
  let w = null;
  for (const p of PARTS) if (c.parts[p] !== null && (w === null || c.parts[p] < w.lod)) w = { part: p, lod: c.parts[p] };
  return w;
}

export function effectiveLod(rec, typeLod = null, verified = false) {
  if (verified) return 500;
  const c = cleanRecord(rec);
  return c.lod ?? (isLod(typeLod) ? typeLod : null);
}

export function frameworkOf({ cls = '', record = null, typeLod = null, verified = false, codes = [] } = {}) {
  const c = cleanRecord(record);
  const lod = effectiveLod(c, typeLod, verified);
  const lodFrom = verified ? 'verified' : c.lod !== null ? 'element' : isLod(typeLod) ? 'type' : '';
  const cs = (codes || []).filter((x) => x && x.code).map((x) => ({ system: String(x.system || x.systemName || ''), code: String(x.code), title: String(x.title || '') }));
  return { ifcClass: String(cls || ''), lod, lodFrom, parts: c.parts, marks: partMarks({ lod, parts: c.parts }), codes: cs, complete: !!(cls && lod !== null && cs.length) };
}
