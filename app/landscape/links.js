/* SPDX-License-Identifier: Apache-2.0 */
/**
 * links.js — landscape objects made from linework stay linked to it (0.8 LA.2, session `landscape-arch_PART_4`). No DOM; imports only
 * areas.js (beside it in every host). Canonical in lib/landscape/, byte-identical copies by `node tools/landscape/sync.mjs`.
 *
 * The link an object carries (posted to landscape-project_PART_4 in closing_PART_4.md § Inbox; SuperCad Studio's links.json uses it):
 *   link = { src: 'feature' | 'gis' | 'member', as: 'outline' | 'line', at: '<fingerprint of the source points last used>',
 *            feature?: '<CivilCraft feature line id>',
 *            gis?: { layer: '<gis layer id>', i: <feature index>, handle?: '<DWG handle, hex upper-case>', fp: '<fingerprint at link time>' },
 *            member?: '<.ccproject member id>', handle?: '<hex upper-case>' }
 *   objects are addressed { list: 'hardscape' | 'areas' | 'beds' | 'hedges' | 'grading' | 'features', id }
 *   ('features' = CivilCraft feature lines made by "From a line", 0.8 LA.2 outputs, session `landscape-finish_PART_4`: they live in the
 *   project's own feature list, not in the landscape lists; the host reads them from there)
 *
 *   fingerprint(pts) → 8 hex (FNV-1a over coordinates rounded to 1e-6)
 *   checkLine(pts, { as, max }) → { ok, pts, why: 'few' | 'many' | 'far' | 'open' | 'cross' }   untrusted linework: ≥ 2 points (3 for an
 *     outline), ≤ max (5000), inside ±1e9, an outline closed (its last point back on its first, or within `closeTol`) and not crossing itself
 *   cleanLink(raw) → link | null (untrusted, from a file)
 *   followLinks(objects, resolve, { closeTol }) → { changes: [{ list, id, pts, at }], notes: [{ code, list, id, why }] }
 *     objects [{ list, id, link, name }]; resolve(link) → pts | null (null = the source is gone). An object whose source changed gets new
 *     points; a refused line or a missing source leaves it as it was and adds a note (the host shows them as Problems).
 */
import { segCross } from './areas.js';

export const LINK_LISTS = ['hardscape', 'areas', 'beds', 'hedges', 'grading', 'features'];
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function fingerprint(pts) {
  let h = 0x811c9dc5;
  const s = (pts || []).map((p) => `${Math.round(p.x * 1e6)},${Math.round(p.y * 1e6)}`).join(';');
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export function checkLine(raw, { as = 'line', max = 5000, closeTol = 1e-6 } = {}) {
  if (!Array.isArray(raw) || raw.length < 2) return { ok: false, why: 'few', pts: [] };
  if (raw.length > max) return { ok: false, why: 'many', pts: [] };
  const pts = [];
  for (const p of raw) {
    if (!p || !fin(p.x) || !fin(p.y) || Math.abs(p.x) > 1e9 || Math.abs(p.y) > 1e9) return { ok: false, why: 'far', pts: [] };
    const q = { x: p.x, y: p.y };
    if (!pts.length || Math.hypot(q.x - pts[pts.length - 1].x, q.y - pts[pts.length - 1].y) > 1e-9) pts.push(q);   // repeated points dropped
  }
  if (as === 'outline') {
    const a = pts[0], b = pts[pts.length - 1];
    if (pts.length >= 3 && Math.hypot(a.x - b.x, a.y - b.y) <= closeTol) pts.pop();
    else if (!raw.closed) return { ok: false, why: 'open', pts: [] };
    if (pts.length < 3) return { ok: false, why: 'few', pts: [] };
    if (crossesItself(pts, true)) return { ok: false, why: 'cross', pts: [] };
  } else if (crossesItself(pts, false)) return { ok: false, why: 'cross', pts: [] };
  return { ok: true, pts, why: null };
}

function crossesItself(pts, closed) {
  const n = pts.length, m = closed ? n : n - 1;
  if (n > 2000) return false;   // big lines: checked by the host's own import limits, not here (O(n²))
  for (let i = 0; i < m; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    for (let j = i + 2; j < m; j++) {
      if (closed && i === 0 && j === n - 1) continue;
      const c = pts[j], d = pts[(j + 1) % n];
      const t = segCross(a, b, c, d);
      if (t !== null && t > 1e-9 && t < 1 - 1e-9) { const u = segCross(c, d, a, b); if (u !== null && u > 1e-9 && u < 1 - 1e-9) return true; }
    }
  }
  return false;
}

const HEX = /^[0-9A-F]{1,16}$/, IDS = /^[A-Za-z0-9_.:-]{1,64}$/, FP = /^[0-9a-f]{8}$/;
export function cleanLink(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const as = raw.as === 'outline' ? 'outline' : 'line', at = FP.test(raw.at || '') ? raw.at : '';
  if (raw.src === 'feature' && IDS.test(String(raw.feature || ''))) return { src: 'feature', as, at, feature: String(raw.feature) };
  if (raw.src === 'gis' && raw.gis && IDS.test(String(raw.gis.layer || '')) && Number.isInteger(raw.gis.i) && raw.gis.i >= 0) {
    const h = String(raw.gis.handle || '').toUpperCase();
    return { src: 'gis', as, at, gis: { layer: String(raw.gis.layer), i: raw.gis.i, ...(HEX.test(h) ? { handle: h } : {}), fp: FP.test(raw.gis.fp || '') ? raw.gis.fp : at } };
  }
  if (raw.src === 'member' && IDS.test(String(raw.member || '')) && HEX.test(String(raw.handle || '').toUpperCase())) return { src: 'member', as, at, member: String(raw.member), handle: String(raw.handle).toUpperCase() };
  return null;
}

export function followLinks(objects, resolve, { closeTol = 1e-6 } = {}) {
  const changes = [], notes = [];
  for (const o of objects) {
    if (!o.link) continue;
    const src = resolve(o.link);
    if (!src) { notes.push({ code: 'ls.link.gone', list: o.list, id: o.id, name: o.name, why: 'gone' }); continue; }
    const fp = fingerprint(src);
    if (fp === o.link.at) continue;
    const c = checkLine(src, { as: o.link.as, closeTol });
    if (!c.ok) { notes.push({ code: 'ls.link.bad', list: o.list, id: o.id, name: o.name, why: c.why }); continue; }
    changes.push({ list: o.list, id: o.id, pts: c.pts, at: fp });
  }
  return { changes, notes };
}
