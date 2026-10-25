/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-acis — the 3D solids (ACIS SAT / SAB) other programs put in DWG and DXF, as triangles for display (0.7 D7.25,
 * docs/ACIS-READER.md). Plain JavaScript, no DOM, no dependencies, synchronous; nothing is edited or written.
 *
 *   readAcis(acis, opts?) → {
 *     ok, why?, format, version, product,
 *     bodies: [{ positions: Float64Array, triangles: Uint32Array, faceOf: Uint32Array, faces: [{ surface, planar, loops? }],
 *                closed, sheet, volume (closed only), area, box: [x0, y0, z0, x1, y1, z1] }],
 *     faces, drawn, triangles, history,
 *     notDrawn: [{ reason, what, n }]      — reasons: surface curve off_surface off_curve layout loop_open cut_off too_many wire_body
 *   }
 *   `acis` = lib/dwg's entity value { format: 'sat' | 'sab', data } (SAT text, SAB base64), or SAT text, or SAB / SAT bytes.
 *   opts: { maxTriangles (2 000 000), step (radians, 7.5°) }. Never throws on bad data.
 *
 *   notDrawnText(list) → "2 faces on torus-surface, a surface not drawn yet; …" (msg() words, the page's language)
 *   addNotDrawn(into, list) → `into` (a Map 'reason|what' → n) with list added: one report for many solids
 *   acisFromDxf(groups) → { format: 'sat', data } | null      a 3DSOLID / REGION / BODY's own [code, value] pairs (DXF ≤ 2010)
 *   acisFromDxfDataStorage(pairs) → Map(HANDLE → Uint8Array)  the ACDSDATA section's pairs (DXF 2013+)
 */

import { tokenize, LIMITS } from './tokens.js';
import { decode } from './model.js';
import { tessellate } from './tess.js';
import { msg, MESSAGES } from './messages.js';
import { b64ToBytes } from './dxf.js';

export { msg, MESSAGES, LIMITS };
export { acisFromDxf, acisFromDxfDataStorage, b64ToBytes, bytesToB64 } from './dxf.js';

export function readAcis(acis, opts = {}) {
  const res = { ok: false, bodies: [], faces: 0, drawn: 0, triangles: 0, history: false, notDrawn: [] };
  let input = null;
  try {
    if (typeof acis === 'string' || acis instanceof Uint8Array) input = acis;
    else if (acis && typeof acis === 'object') {
      if (acis.format === 'sab') input = typeof acis.data === 'string' ? b64ToBytes(acis.data) : acis.data instanceof Uint8Array ? acis.data : null;
      else input = typeof acis.data === 'string' ? acis.data : acis.data instanceof Uint8Array ? acis.data : null;
    }
  } catch { input = null; }
  if (input === null || (typeof input === 'string' ? !input.trim() : !input.length)) return { ...res, why: 'ccacis.why.no_data', notDrawn: [{ reason: 'solid', what: 'ccacis.why.no_data', n: 1 }] };
  let tok;
  try { tok = tokenize(input); } catch { tok = { ok: false, records: [], why: 'ccacis.why.unknown_data' }; }
  res.format = tok.format; res.version = tok.version; res.product = tok.product; res.history = !!tok.history;
  if (!tok.records || !tok.records.length) {
    return { ...res, why: tok.why || 'ccacis.why.not_acis', notDrawn: [{ reason: 'solid', what: tok.why || 'ccacis.why.not_acis', n: 1 }] };
  }
  let dec, t;
  try {
    dec = decode(tok);
    dec.resabs = tok.resabs;
    t = tessellate(dec, opts);
  } catch (e) {
    return { ...res, why: 'ccacis.why.unknown_data', notDrawn: [{ reason: 'solid', what: 'ccacis.why.unknown_data', n: 1 }] };
  }
  res.bodies = t.bodies; res.faces = t.faces; res.drawn = t.drawn; res.triangles = t.triangles;
  for (const [k, n] of t.notDrawn) { const [reason, what] = splitKey(k); res.notDrawn.push({ reason, what, n }); }
  // a damaged / cut-off file with nothing drawn is said as such
  if (!tok.ok || tok.cut) {
    res.why = tok.why || 'ccacis.why.cut_off';
    if (!res.bodies.length) res.notDrawn.push({ reason: 'solid', what: res.why, n: 1 });
  }
  if (!dec.bodies.length && !res.notDrawn.length) res.notDrawn.push({ reason: 'wire_body', what: 'empty', n: 1 });
  res.ok = res.bodies.length > 0;
  return res;
}

function splitKey(k) { const i = k.indexOf('|'); return [k.slice(0, i), k.slice(i + 1)]; }

export function addNotDrawn(into, list) {
  for (const x of list || []) { const k = x.reason + '|' + x.what; into.set(k, (into.get(k) || 0) + x.n); }
  return into;
}

/** a list (or a Map from addNotDrawn) → one sentence fragment per kind, joined with "; " */
export function notDrawnText(list) {
  const items = list instanceof Map ? [...list].map(([k, n]) => { const [reason, what] = splitKey(k); return { reason, what, n }; }) : list || [];
  return items.map((x) => {
    if (x.reason === 'solid') return msg('ccacis.nd.solid', { n: x.n, why: msg(x.what) });
    const key = 'ccacis.nd.' + x.reason;
    return MESSAGES[key] ? msg(key, { n: x.n, what: x.what }) : x.reason + ' ' + x.what + ' ×' + x.n;
  }).join('; ');
}
