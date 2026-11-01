/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and field names; the words are the UI's t() keys (mo.*). */
/**
 * massing-options.js — BimCraft's room-program massing options on a CivilCraft lot (0.8 EG.58, CivilCraft side; round 3 session civil_PART_3). DOM-free, no strings.
 * BimCraft's Room program to massing (bim_PART_2, `program-mass.js`) saves `*-massing-options.json` ({ format 'cadcraft-massing-options', version 1, units 'mm',
 * program: [{ name, count, area_m2, ground }], masses: [{ key, name, pts: [{x,y}], floors, floorHeight, use }] }): several ALTERNATIVE buildings, drawn in a local frame.
 * This file reads one safely, turns each alternative into a mass on a parcel (turned and slid until as much of it as possible stands inside the buildable envelope), and
 * gives the envelope back to BimCraft as a file (`cadcraft-massing-envelope`).
 *
 *   readOptions(text) → { ok, error?, options: [{ key, name, pts (mm), floors, floorHeight (mm), use, areaM2, gfaM2, longest (deg) }], program, notes }
 *   fitOption(option, polygon, units) → { pts (project units), centre, rotation (deg), inside (0–1 of the footprint), outside (area, project units²) }   polygon = the envelope
 *   toMass(option, fit, { parcel, units }) → a mass for state.masses (cleanMass shape; no id)
 *   envelopeFile(parcel, zone, units) → { ok, problem?, file }    the envelope as a `cadcraft-massing-envelope` (mm; `polygon` in BimCraft's local frame, `project` in the lot's own)
 * The file is untrusted: sizes are bounded, text is cut, a footprint that is not a simple polygon is refused.
 */
import { envelope, insideArea } from './zoning.js';
import { signedArea, centroid, cleanMass } from './massing.js';
import { METRES_PER } from './units.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const MAX_BYTES = 2e6, MAX_OPTIONS = 40, MAX_PTS = 200;
const longestEdge = (pts) => { let best = { len: -1, ang: 0 }; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], d = Math.hypot(b.x - a.x, b.y - a.y); if (d > best.len) best = { len: d, ang: Math.atan2(b.y - a.y, b.x - a.x) }; } return best; };

export function readOptions(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) return { ok: false, error: 'mo.err.size', options: [] };
  let j; try { j = JSON.parse(text); } catch { return { ok: false, error: 'mo.err.json', options: [] }; }
  if (!j || j.format !== 'cadcraft-massing-options') return { ok: false, error: 'mo.err.format', options: [] };
  if (j.version !== 1) return { ok: false, error: 'mo.err.version', options: [] };
  if (j.units !== 'mm') return { ok: false, error: 'mo.err.units', options: [] };
  const notes = [], options = [];
  for (const m of (Array.isArray(j.masses) ? j.masses : []).slice(0, MAX_OPTIONS)) {
    const pts = (Array.isArray(m?.pts) ? m.pts : []).slice(0, MAX_PTS).filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e8 && Math.abs(p.y) < 1e8).map((p) => ({ x: p.x, y: p.y }));
    const a = Math.abs(signedArea(pts));
    if (pts.length < 3 || a < 1 || !simple(pts)) { notes.push({ key: 'mo.note.skip', vars: { name: clean(m?.name ?? m?.key, 60) } }); continue; }
    const floors = fin(m.floors) && m.floors >= 1 ? Math.min(200, Math.round(m.floors)) : 0;
    const fh = fin(m.floorHeight) && m.floorHeight >= 1000 && m.floorHeight <= 20000 ? m.floorHeight : 0;
    if (!floors || !fh) { notes.push({ key: 'mo.note.skip', vars: { name: clean(m?.name ?? m?.key, 60) } }); continue; }
    options.push({ key: clean(m.key, 40) || 'o' + (options.length + 1), name: clean(m.name, 80) || 'Option ' + (options.length + 1), pts, floors, floorHeight: fh, use: clean(m.use, 60), areaM2: a / 1e6, gfaM2: (a / 1e6) * floors, longest: longestEdge(pts).ang * 180 / Math.PI });
  }
  const program = (Array.isArray(j.program) ? j.program : []).slice(0, 200).map((r) => ({ name: clean(r?.name, 60), count: fin(r?.count) ? Math.max(0, Math.min(1e4, r.count)) : 1, area_m2: fin(r?.area_m2) ? Math.max(0, Math.min(1e7, r.area_m2)) : 0, ground: r?.ground === true })).filter((r) => r.name);
  return options.length ? { ok: true, options, program, notes } : { ok: false, error: 'mo.err.empty', options: [], program, notes };
}

/** True when no two non-neighbouring edges cross (a plain polygon). */
export function simple(pts) {
  const n = pts.length, X = (a, b, c, d) => {
    const o = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
  };
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (X(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return false; }
  return true;
}

const turn = (pts, c, ang, to) => { const co = Math.cos(ang), si = Math.sin(ang); return pts.map((p) => ({ x: to.x + (p.x - c.x) * co - (p.y - c.y) * si, y: to.y + (p.x - c.x) * si + (p.y - c.y) * co })); };

export function fitOption(option, polygon, units = 'ft') {
  const k = 0.001 / (METRES_PER[units] || 0.3048);   // project units per mm
  const base = option.pts.map((p) => ({ x: p.x * k, y: p.y * k }));
  const c0 = centroid(base), area = Math.abs(signedArea(base));
  if (!polygon || polygon.length < 3) return { ok: false, error: 'mo.err.envelope' };
  const ec = centroid(polygon), edge = longestEdge(polygon), own = longestEdge(base);
  let lo = { x: Infinity, y: Infinity }, hi = { x: -Infinity, y: -Infinity };
  for (const p of polygon) { lo = { x: Math.min(lo.x, p.x), y: Math.min(lo.y, p.y) }; hi = { x: Math.max(hi.x, p.x), y: Math.max(hi.y, p.y) }; }
  let best = null;
  for (let q = 0; q < 4; q++) {
    const rot = edge.ang - own.ang + (q * Math.PI) / 2;
    let span = Math.max(hi.x - lo.x, hi.y - lo.y) / 2, at = { ...ec };
    let cur = null;
    for (let pass = 0; pass < 5; pass++, span /= 3) {
      for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
        const to = { x: at.x + (i / 3) * span, y: at.y + (j / 3) * span };
        const pts = turn(base, c0, rot, to), inside = insideArea(polygon, pts) / area;
        const d = Math.hypot(to.x - ec.x, to.y - ec.y);
        if (!cur || inside > cur.inside + 1e-9 || (Math.abs(inside - cur.inside) <= 1e-9 && d < cur.d)) cur = { pts, inside, centre: to, rot, d };
      }
      at = cur.centre;
    }
    if (!best || cur.inside > best.inside + 1e-9 || (Math.abs(cur.inside - best.inside) <= 1e-9 && cur.d < best.d)) best = cur;
  }
  return { ok: true, pts: best.pts, centre: best.centre, rotation: ((best.rot * 180) / Math.PI + 360) % 360, inside: Math.min(1, best.inside), outside: Math.max(0, area * (1 - best.inside)) };
}

export function toMass(option, fit, { parcel = null, units = 'ft' } = {}) {
  const k = 0.001 / (METRES_PER[units] || 0.3048);
  return cleanMass({ name: option.name, pts: fit.pts, floors: option.floors, floorHeight: option.floorHeight * k, use: option.use, parcel }, units);
}

export function envelopeFile(parcel, zone, units = 'ft') {
  const env = envelope(parcel, zone);
  if (!env.poly) return { ok: false, problem: env.problem || 'fold' };
  const mm = (METRES_PER[units] || 0.3048) * 1000;
  const e = longestEdge(env.poly), c = e.ang, co = Math.cos(-c), si = Math.sin(-c);
  const turned = env.poly.map((p) => ({ x: p.x * co - p.y * si, y: p.x * si + p.y * co }));
  const minx = Math.min(...turned.map((p) => p.x)), miny = Math.min(...turned.map((p) => p.y));
  const round = (v) => Math.round(v * 10) / 10;
  return { ok: true, area: env.area, file: {
    format: 'cadcraft-massing-envelope', version: 1, units: 'mm', parcel: clean(parcel.name || parcel.id, 80),
    note: 'polygon: the buildable area with its longest edge along +x and its lowest corner at 0,0 — pass it as `envelope` to BimCraft\'s massing_describe. project: the same polygon in the lot\'s own coordinates; angle is the turn between the two.',
    angle: round((c * 180) / Math.PI), areaM2: Math.round(env.area * (mm / 1000) ** 2 * 100) / 100,
    polygon: turned.map((p) => ({ x: round((p.x - minx) * mm), y: round((p.y - miny) * mm) })),
    project: env.poly.map((p) => ({ x: round(p.x * mm), y: round(p.y * mm) })),
  } };
}
