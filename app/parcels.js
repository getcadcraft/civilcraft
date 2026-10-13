/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parcels.js — parcels (0.4 V21): areas, bearing and distance labels, closure of deed calls, and a legal description.
 * No DOM; the Node test drives it (bin/test-civilcraft-parcels.mjs).
 *
 * parcel = { id 'r…', name, pts: [{ x, y, b? }], pob? (the point of beginning in words; else its coordinates) }   a closed outline, the first corner = the point of beginning; b is the
 *   bulge of the course that STARTS at that corner (DXF style: b = tan(Δ/4), positive = curving left (counter-clockwise),
 *   negative = right), so a course is a line or a circular curve.
 *
 *   cleanParcel(o) → parcel | null (untrusted: the project file)
 *   parseAngle(s) → degrees | null    parseBearing(s) → direction (radians, 0 = east, counter-clockwise) | null   N 45°30'15" E, N45-30-15E, N 45 30 15 E,
 *       N 45.5 E, S 0 E; or an azimuth: AZ 123°45'00" / AZ 123.75
 *   parseCalls(text) → { calls: [{ kind: 'line', dir, dist } | { kind: 'curve', R, delta, turn: 1 left | -1 right, chordDir | null }],
 *       errors: [{ line, msg }] }   one call a line: "N 45°30'15" E 125.50", or a curve "C R 300 L 52.36 right [CB N 50 0 0 E]"
 *       (L = arc length, or D = central angle; without CB the curve is tangent to the course before it)
 *   runCalls(start, calls) → { pts (the corners, last = where the calls end), misclosure: { dx, dy, dist, dir },
 *       length (the calls' total), precision (length ÷ misclosure, Infinity when it closes) }
 *   courses(pts) → [{ kind: 'line', from, to, dir, dist } | { kind: 'curve', from, to, R, L, delta, turn, chordDir, chord,
 *       dirIn, dirOut, c }]   the parcel's own courses, closing back to the first corner
 *   parcelArea(pts) → square units (curves exact)    perimeter(pts)
 *   legalDescription(parcel, { units, pob }) → text (a draft for a licensed surveyor to check and sign)
 *   parcelLabels(parcel, { units, unitPerMm }) → scene items (V-PROP lines and arcs, V-PROP-TEXT courses and the area)
 */

import { t } from './i18n.js';
import { bearing, dms, fixed, grouped, unitOf } from './units.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const TAU = Math.PI * 2;
const wrap = (a) => { a %= TAU; return a < 0 ? a + TAU : a; };

export function cleanParcel(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.pts)) return null;
  const pts = o.pts.filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).slice(0, 5000)
    .map((p) => (fin(p.b) && p.b !== 0 && Math.abs(p.b) <= 1 ? { x: p.x, y: p.y, b: p.b } : { x: p.x, y: p.y }));
  if (pts.length < 2 || (pts.length === 2 && !pts.some((p) => p.b))) return null;
  const pob = String(o.pob ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200);
  return { id: /^r\d{1,9}$/.test(String(o.id)) ? String(o.id) : null, name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 120) || 'Parcel', pts, ...(pob ? { pob } : {}) };
}

// ------------------------------------------------------------------ bearings
/** Degrees from 45°30'15", 45-30-15, 45 30 15 or 45.5 (minutes and seconds under 60) | null. */
export function parseAngle(x) {
  const n = (String(x ?? '').match(/\d+(?:\.\d+)?/g) || []).map(Number);
  if (!n.length || n.length > 3) return null;
  const [d, m = 0, sec = 0] = n;
  if (m >= 60 || sec >= 60 || (n.length > 1 && !Number.isInteger(d)) || (n.length > 2 && !Number.isInteger(m))) return null;
  return d + m / 60 + sec / 3600;
}
export function parseBearing(s) {
  const str = String(s ?? '').trim().toUpperCase().replace(/[’′]/g, "'").replace(/[”″]/g, '"').replace(/º/g, '°');
  if (!str || str.length > 60) return null;
  const az = /^AZ(?:IMUTH)?\s*(.+)$/.exec(str);
  if (az) { const a = parseAngle(az[1]); return a === null || a > 360 ? null : wrap(((90 - a) * Math.PI) / 180); }
  const m = /^([NS])\s*(.*?)\s*([EW])$/.exec(str);
  if (!m) return null;
  const a = parseAngle(m[2]);
  if (a === null || a > 90) return null;
  const azd = m[1] === 'N' ? (m[3] === 'E' ? a : 360 - a) : m[3] === 'E' ? 180 - a : 180 + a;
  return wrap(((90 - azd) * Math.PI) / 180);
}

// ------------------------------------------------------------------ deed calls
export function parseCalls(text) {
  const calls = [], errors = [];
  const lines = String(text ?? '').split(/\r?\n/).slice(0, 2000);
  lines.forEach((raw, i) => {
    const line = raw.replace(/^\s*(?:thence|then)\b[\s,]*/i, '').replace(/\b(?:feet|foot|ft|meters?|metres?|m)\b\.?/gi, ' ').replace(/[;,]/g, ' ').trim();
    if (!line || line.startsWith('#')) return;
    const n = i + 1;
    if (/^(?:C|CURVE)\b/i.test(line)) {
      const rest = line.replace(/^(?:C|CURVE)\b/i, ' ');
      const num = (re) => { const m = re.exec(rest); return m ? Number(m[1]) : null; };
      const R = num(/\bR(?:ADIUS)?\s*=?\s*(\d+(?:\.\d+)?)/i), L = num(/\bL(?:ENGTH)?\s*=?\s*(\d+(?:\.\d+)?)/i);
      const dm = /\b(?:D|DELTA|Δ)\s*=?\s*([0-9°'".\-\s]+?)(?=\s+(?:LEFT|RIGHT|CB|R\b|L\b)|\s*$)/i.exec(rest);
      const turn = /\bLEFT\b/i.test(rest) ? 1 : /\bRIGHT\b/i.test(rest) ? -1 : 0;
      const cb = /\bCB\s*(.+?)\s*$/i.exec(rest);
      let delta = null;
      if (dm) { const a = parseAngle(dm[1]); delta = a === null ? null : (a * Math.PI) / 180; }
      if (!(R > 0)) { errors.push({ line: n, msg: t('pc.err.radius') }); return; }
      if (!turn) { errors.push({ line: n, msg: t('pc.err.turn') }); return; }
      if (L > 0) delta = L / R;
      if (!(delta > 0 && delta < TAU)) { errors.push({ line: n, msg: t('pc.err.delta') }); return; }
      let chordDir = null;
      if (cb) { chordDir = parseBearing(cb[1]); if (chordDir === null) { errors.push({ line: n, msg: t('pc.err.bearing') }); return; } }
      calls.push({ kind: 'curve', R, delta, turn, chordDir });
      return;
    }
    const m = /^(.*?[EW])\s+(\d+(?:\.\d+)?)\s*'?\s*$/i.exec(line) || /^(AZ(?:IMUTH)?\s*[0-9°'".\-\s]+?)\s+(\d+(?:\.\d+)?)\s*'?\s*$/i.exec(line);
    if (!m) { errors.push({ line: n, msg: t('pc.err.read') }); return; }
    const dir = parseBearing(m[1]), dist = Number(m[2]);
    if (dir === null) { errors.push({ line: n, msg: t('pc.err.bearing') }); return; }
    if (!(dist > 0)) { errors.push({ line: n, msg: t('pc.err.dist') }); return; }
    calls.push({ kind: 'line', dir, dist });
  });
  return { calls, errors };
}

export function runCalls(start, calls) {
  const pts = [{ x: start.x, y: start.y }];
  let p = { ...start }, heading = null, length = 0;
  for (const c of calls) {
    if (c.kind === 'line') {
      p = { x: p.x + c.dist * Math.cos(c.dir), y: p.y + c.dist * Math.sin(c.dir) };
      heading = c.dir; length += c.dist;
      pts.push({ ...p });
      continue;
    }
    const chordDir = c.chordDir ?? (heading === null ? 0 : heading + (c.turn * c.delta) / 2);
    const chord = 2 * c.R * Math.sin(c.delta / 2);
    pts[pts.length - 1].b = c.turn * Math.tan(c.delta / 4);
    p = { x: p.x + chord * Math.cos(chordDir), y: p.y + chord * Math.sin(chordDir) };
    heading = chordDir + (c.turn * c.delta) / 2;
    length += c.R * c.delta;
    pts.push({ ...p });
  }
  const dx = p.x - start.x, dy = p.y - start.y, dist = Math.hypot(dx, dy);
  return { pts, misclosure: { dx, dy, dist, dir: Math.atan2(dy, dx) }, length, precision: dist > 1e-9 ? length / dist : Infinity };
}

// ------------------------------------------------------------------ courses, area
function arcOf(a, b, bulge) {
  const chord = Math.hypot(b.x - a.x, b.y - a.y), delta = 4 * Math.atan(Math.abs(bulge)), turn = bulge > 0 ? 1 : -1;
  const R = chord / (2 * Math.sin(delta / 2)), chordDir = Math.atan2(b.y - a.y, b.x - a.x);
  const dirIn = chordDir - (turn * delta) / 2, dirOut = chordDir + (turn * delta) / 2;
  const toC = dirIn + (turn * Math.PI) / 2, c = { x: a.x + R * Math.cos(toC), y: a.y + R * Math.sin(toC) };
  return { R, L: R * delta, delta, turn, chordDir, chord, dirIn, dirOut, c };
}
export function courses(pts) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if (a.b) out.push({ kind: 'curve', from: a, to: b, ...arcOf(a, b, a.b) });
    else out.push({ kind: 'line', from: a, to: b, dir: Math.atan2(b.y - a.y, b.x - a.x), dist: Math.hypot(b.x - a.x, b.y - a.y) });
  }
  return out;
}
export function parcelArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    a += p.x * q.y - q.x * p.y;
    if (p.b) { const c = arcOf(p, q, p.b); a += 2 * Math.sign(p.b) * ((c.R * c.R) / 2) * (c.delta - Math.sin(c.delta)); }
  }
  return Math.abs(a / 2);
}
export const perimeter = (pts) => courses(pts).reduce((m, c) => m + (c.kind === 'line' ? c.dist : c.L), 0);

// ------------------------------------------------------------------ the legal description
const lenWord = (units) => (units === 'm' ? t('pc.lw.m') : t('pc.lw.ft'));
export function areaWords(a, units) {
  return units === 'm'
    ? t('pc.area.m', { a: grouped(a, 0), ha: fixed(a / 10000, 4) })
    : t('pc.area.ft', { a: grouped(a, 0), ac: fixed(a / 43560, 3) });
}
export function legalDescription(parcel, { units = 'ft', pob = null } = {}) {
  const pts = parcel.pts, cs = courses(pts), L = lenWord(units), d = (v) => fixed(v, 2) + ' ' + L;
  const start = pob || t('pc.pob.at', { n: fixed(pts[0].y, 3), e: fixed(pts[0].x, 3) });
  const parts = cs.map((c, i) => {
    const last = i === cs.length - 1;
    const s = c.kind === 'line'
      ? t('pc.call.line', { b: bearing(c.dir), d: d(c.dist) })
      : t(c.turn > 0 ? 'pc.call.left' : 'pc.call.right', { r: d(c.R), l: d(c.L), delta: dms((c.delta * 180) / Math.PI), cb: bearing(c.chordDir), cd: d(c.chord) });
    return t('pc.thence', { call: s }) + (last ? ' ' + t('pc.to.pob') + '.' : ';');
  });
  return [parcel.name, '', t('pc.begin', { at: start }) + ';', ...parts, '', t('pc.containing', { area: areaWords(parcelArea(pts), units) })].join('\n');
}

// ------------------------------------------------------------------ plan labels
/** Lines and arcs on V-PROP; on V-PROP-TEXT each course's bearing and distance (a curve's radius, length and central
 *  angle) along it, outside the parcel, reading from left to right; the name and area at the middle. */
export function parcelLabels(parcel, { units = 'ft', unitPerMm = 1 } = {}) {
  const items = [], pts = parcel.pts, cs = courses(pts), U = unitOf(units), ft = units !== 'm';
  const len = (v) => fixed(v, 2) + (ft ? "'" : ' m');
  const ccw = signedArea(pts) > 0;   // the outside is to the right of travel for a counter-clockwise outline
  for (const c of cs) {
    if (c.kind === 'line') items.push({ layer: 'V-PROP', kind: 'poly', pts: [c.from, c.to] });
    else {
      const a0 = Math.atan2(c.from.y - c.c.y, c.from.x - c.c.x), a1 = Math.atan2(c.to.y - c.c.y, c.to.x - c.c.x);
      items.push({ layer: 'V-PROP', kind: 'arc', c: c.c, r: c.R, a0: c.turn > 0 ? a0 : a1, a1: c.turn > 0 ? a1 : a0 });
    }
    // the label sits off the middle of the course, outside the parcel
    let mid, dir;
    if (c.kind === 'line') { mid = { x: (c.from.x + c.to.x) / 2, y: (c.from.y + c.to.y) / 2 }; dir = c.dir; }
    else { const am = Math.atan2(c.from.y - c.c.y, c.from.x - c.c.x) + (c.turn * c.delta) / 2; mid = { x: c.c.x + c.R * Math.cos(am), y: c.c.y + c.R * Math.sin(am) }; dir = am + (c.turn * Math.PI) / 2; }
    const out = dir + (ccw ? -Math.PI / 2 : Math.PI / 2), off = 1.6 * unitPerMm;
    let rot = dir;
    if (Math.cos(rot) < -1e-9 || (Math.abs(Math.cos(rot)) <= 1e-9 && Math.sin(rot) < 0)) rot += Math.PI;   // read from the left or from below
    const text = c.kind === 'line' ? bearing(c.dir) + '  ' + len(c.dist) : 'R=' + len(c.R) + '  L=' + len(c.L) + '  Delta=' + dms((c.delta * 180) / Math.PI);   // no Δ: the PDF's text is WinAnsi
    items.push({ layer: 'V-PROP-TEXT', kind: 'text', x: mid.x + Math.cos(out) * off, y: mid.y + Math.sin(out) * off, rot, mm: 1.6, align: 'center', middle: true, text });
  }
  const ctr = centroid(pts), a = parcelArea(pts);
  items.push({ layer: 'V-PROP-TEXT', kind: 'text', x: ctr.x, y: ctr.y + 1.6 * unitPerMm, rot: 0, mm: 2.2, align: 'center', middle: true, text: parcel.name, mask: true });
  items.push({ layer: 'V-PROP-TEXT', kind: 'text', x: ctr.x, y: ctr.y - 1.6 * unitPerMm, rot: 0, mm: 1.8, align: 'center', middle: true,
    text: grouped(a, 0) + ' ' + U.area + '  ' + (ft ? fixed(a / 43560, 3) + ' ac' : fixed(a / 10000, 4) + ' ha'), mask: true });
  return items;
}
function signedArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; }
export function centroid(pts) {
  const A = signedArea(pts);
  if (Math.abs(A) < 1e-12) return { x: pts.reduce((m, p) => m + p.x, 0) / pts.length, y: pts.reduce((m, p) => m + p.y, 0) / pts.length };
  let cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], k = p.x * q.y - q.x * p.y; cx += (p.x + q.x) * k; cy += (p.y + q.y) * k; }
  return { x: cx / (6 * A), y: cy / (6 * A) };
}
