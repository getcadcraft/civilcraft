/* SPDX-License-Identifier: Apache-2.0 */
/**
 * traverse.js — a traverse from field angles or bearings and distances, its closure and the compass (Bowditch) adjustment
 * (0.4 V22). No DOM; the Node test drives it (bin/test-civilcraft-traverse.mjs).
 *
 *   parseTraverse(text, mode) → { legs: [{ angle (degrees, angles right) | dir (radians, bearings), dist, name }], errors }
 *       one leg a line: "<angle or bearing> <distance> [name]"; mode 'angles' (the angle right turned at the station the leg
 *       leaves, clockwise from the backsight to the next station: 270°00'10", 270-00-10, 270.0028) or 'bearings'
 *       (N 45°30'15" E, N 45 30 15 E, or an azimuth as one token: AZ 45-30-15, AZ 45.5). A line "close <angle>" (angles, loops) is the angle at the first station again, turned
 *       from the last station to the second, which checks the angles.
 *   runTraverse({ start: {x, y}, mode, backsight (azimuth in degrees from the first station to its backsight; angles mode),
 *       legs, close: 'loop' | { x, y } (the known point the traverse ends on), closingAngle (degrees | null) })
 *     → { stations: [{ name, x, y (unadjusted), ax, ay (adjusted), dir (the leg's direction after the angle adjustment), dist }],
 *         angular: { misclosure (degrees, measured − expected) | null, perAngle } , linear: { dx, dy, dist, dir }, length,
 *         precision (length ÷ linear misclosure, Infinity when it closes), problems }
 *     Angles: with a closing angle on a loop, the first leg's azimuth is worked out again at the end; the difference is the
 *     angular misclosure, spread equally over the angles that make it (every angle but the first, which is turned from the
 *     backsight, plus the closing one). Then the linear misclosure is spread by the compass rule: each station moves against
 *     it in proportion to the length travelled to reach it.
 *   traverseReport(result, { units }) → CSV text (station, unadjusted and adjusted northing/easting, the corrections), with
 *     the closure lines first.
 */

import { t } from './i18n.js';
import { parseAngle, parseBearing } from './parcels.js';
import { bearing, dms, fixed } from './units.js';

const D2R = Math.PI / 180;
const az2dir = (az) => (90 - az) * D2R;          // azimuth (degrees, clockwise from north) → math direction (radians)
const dir2az = (d) => { let a = 90 - d / D2R; a %= 360; return a < 0 ? a + 360 : a; };

export function parseTraverse(text, mode = 'angles') {
  const legs = [], errors = [];
  let closingAngle = null;
  String(text ?? '').split(/\r?\n/).slice(0, 2000).forEach((raw, i) => {
    const line = raw.replace(/\b(?:feet|foot|ft|meters?|metres?)\b\.?/gi, ' ').replace(/[;,]/g, ' ').trim();
    if (!line || line.startsWith('#')) return;
    const n = i + 1;
    const cl = /^close\s+(.+)$/i.exec(line);
    if (cl) {
      if (mode !== 'angles') { errors.push({ line: n, msg: t('tv.err.closebearing') }); return; }
      const a = parseAngle(cl[1]);
      if (a === null || a >= 360) { errors.push({ line: n, msg: t('tv.err.angle') }); return; }
      closingAngle = a; return;
    }
    let ang, rest;
    if (mode === 'bearings') {
      const m = /^(.*?[EW]|AZ(?:IMUTH)?\s*\S+)\s+(.+)$/i.exec(line);   // a quadrant bearing ends at E or W; an azimuth is one token
      if (!m) { errors.push({ line: n, msg: t('tv.err.read') }); return; }
      ang = parseBearing(m[1]); rest = m[2];
      if (ang === null) { errors.push({ line: n, msg: t('tv.err.bearing') }); return; }
    } else {
      // the angle: one token (270°00'10", 270-00-10, 270.0028) or three numbers (270 00 10) before the distance
      const tok = line.split(/\s+/);
      const three = tok.length >= 4 && tok.slice(0, 3).every((x) => /^\d+(?:\.\d+)?$/.test(x)) ? 3 : 1;
      ang = parseAngle(tok.slice(0, three).join(' ')); rest = tok.slice(three).join(' ');
      if (ang === null || ang >= 360) { errors.push({ line: n, msg: t('tv.err.angle') }); return; }
    }
    const m2 = /^(\d+(?:\.\d+)?)\s*'?\s*(.*)$/.exec(rest.trim());
    if (!m2 || !(Number(m2[1]) > 0)) { errors.push({ line: n, msg: t('tv.err.dist') }); return; }
    const name = m2[2].replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 40);
    legs.push(mode === 'bearings' ? { dir: ang, dist: Number(m2[1]), name } : { angle: ang, dist: Number(m2[1]), name });
  });
  return { legs, errors, closingAngle };
}

export function runTraverse({ start, mode = 'angles', backsight = 0, legs, close = 'loop', closingAngle = null }) {
  const problems = [];
  const n = legs.length;
  // 1. directions. Angles: az(1) = backsight + a(1); at each next station the back azimuth is the leg's + 180°, so
  //    az(i) = az(i-1) + 180° + a(i). On a loop the closing angle turns from the last station to the second again:
  //    az(1)' = az(n) + 180° + a(close). az(1)' − az(1) = a(2) + … + a(n) + a(close) + n × 180° (mod 360°) is the angular
  //    misclosure; a(1) and the backsight cancel, so it is spread equally over those n angles.
  let dirs, angular = { misclosure: null, perAngle: 0 };
  if (mode === 'angles') {
    const a = legs.map((l) => l.angle);
    if (close === 'loop' && closingAngle !== null && n >= 2) {
      let az = backsight + a[0];
      for (let i = 1; i < n; i++) az += 180 + a[i];
      const again = az + 180 + closingAngle, first = backsight + a[0];
      const mis = ((((again - first) % 360) + 540) % 360) - 180;
      angular = { misclosure: mis, perAngle: -mis / n };
    }
    dirs = [];
    let az = backsight + a[0];
    dirs.push(az2dir(az));
    for (let i = 1; i < n; i++) { az += 180 + a[i] + angular.perAngle; dirs.push(az2dir(az)); }
  } else dirs = legs.map((l) => l.dir);
  // 2. unadjusted coordinates
  const st = [];
  let x = start.x, y = start.y, length = 0;
  for (let i = 0; i < n; i++) {
    x += legs[i].dist * Math.cos(dirs[i]); y += legs[i].dist * Math.sin(dirs[i]); length += legs[i].dist;
    st.push({ name: legs[i].name || '', x, y, dir: dirs[i], dist: legs[i].dist, run: length });
  }
  const end = close === 'loop' ? start : close;
  const dx = x - end.x, dy = y - end.y, dist = Math.hypot(dx, dy);
  // 3. compass rule
  for (const s of st) { s.cx = -dx * (s.run / length); s.cy = -dy * (s.run / length); s.ax = s.x + s.cx; s.ay = s.y + s.cy; }
  if (n < 2) problems.push(t('tv.few'));
  return { stations: st, angular, linear: { dx, dy, dist, dir: Math.atan2(dy, dx) }, length, precision: dist > 1e-12 ? length / dist : Infinity, problems, start, close };
}

export function traverseReport(r, { units = 'ft' } = {}) {
  const u = units === 'm' ? 'm' : 'ft';
  const q = (v) => (/^-?\d/.test(v) ? v : /^[=+\-@\t\r]/.test(v) ? "'" + v : v);   // text that a spreadsheet would run as a formula gets a leading '
  const c = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  const rows = [
    [t('tv.r.angular'), r.angular.misclosure === null ? '' : (r.angular.misclosure < 0 ? '-' : '') + dms(Math.abs(r.angular.misclosure))],
    [t('tv.r.linear', { u }), fixed(r.linear.dist, 4), bearing(r.linear.dir)],
    [t('tv.r.length', { u }), fixed(r.length, 3)],
    [t('tv.r.precision'), Number.isFinite(r.precision) ? '1 : ' + Math.round(r.precision) : t('tv.r.exact')],
    [],
    [t('tv.r.station'), t('tv.r.dir'), t('tv.r.dist'), t('tv.r.n'), t('tv.r.e'), t('tv.r.cn'), t('tv.r.ce'), t('tv.r.an'), t('tv.r.ae')],
    [t('tv.r.start'), '', '', fixed(r.start.y, 4), fixed(r.start.x, 4), '0.0000', '0.0000', fixed(r.start.y, 4), fixed(r.start.x, 4)],
    ...r.stations.map((s, i) => [s.name || String(i + 1), bearing(s.dir), fixed(s.dist, 3), fixed(s.y, 4), fixed(s.x, 4), fixed(s.cy, 4), fixed(s.cx, 4), fixed(s.ay, 4), fixed(s.ax, 4)]),
  ];
  return rows.map((r2) => r2.map((v) => c(q(String(v)))).join(',')).join('\r\n') + '\r\n';
}

export { dir2az };
