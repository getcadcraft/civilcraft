/* SPDX-License-Identifier: Apache-2.0 */
/**
 * walk.js — a field walk: positions taken on foot with a phone or a watch, made into corners, an outline and an honest statement of how
 * rough they are (0.11 LR.2). DOM-free; Node-tested (bin/test-landrecords.mjs). Nothing here asks a device for anything: capture.js does.
 *
 * A FIX is what the device says at one moment: { lat, lon, acc (its own accuracy figure in metres, or null when a file does not say),
 * alt (metres, or null), t (ms since 1970) }. A walk POINT is one press of the button: the fixes of the last few seconds averaged.
 *
 *   WALK_FORMAT 'cadcraft-fieldwalk' · WALK_VERSION 1 · LIMITS
 *   cleanFix(f) → fix | null                       (untrusted: a device, a file)
 *   newWalk({ name, t, device }) → walk            walk = { format, version, name, started, device, points: [], track: [], closed, notes }
 *   cleanWalk(o) → { ok, walk, dropped } | { ok: false, why }      (untrusted: a walk file, the project file)
 *   averageFixes(fixes, { maxAcc }) → { lat, lon, alt, acc, spread, n, dropped } | null
 *       fixes worse than maxAcc are left out; the rest are averaged with weights 1/acc². `acc` is the BEST figure among the fixes used, never
 *       divided by √n: a phone's errors over a few seconds move together, so more fixes steady the point but do not make it that much truer.
 *       `spread` is how far the fixes lay from their mean (root mean square, metres).
 *   markPoint(walk, fixes, { code, t, maxAcc, minFixes }) → { ok, point } | { ok: false, why: 'nofix' | 'poor' | 'full' }
 *       point = { n, lat, lon, alt, acc, spread, fixes, t, code }; code 'C' = a corner of the outline, anything else = a point that is not
 *   settled(fixes, cap) → the fixes since the walker came to rest (markPoint averages only these; a press while the newest fix is worse than
 *       maxAcc is refused outright, so good readings from the last corner never stand in for a poor one here)
 *   undoPoint(walk) → point | null · addTrack(walk, fix, minMove) → bool (a breadcrumb when the walker has moved minMove metres)
 *   plane(walk) → geo.localPlane at the first corner (or the first track fix) | null
 *   outline(walk, pl) → [{ x, y, acc }] metres, the corners in the order they were taken
 *   stats(walk) → { corners, points, area, perimeter, areaSigma, worst, best, unknown, closing }   metres and square metres
 *       areaSigma = ½ · √Σ σᵢ² · |Pᵢ₊₁ − Pᵢ₋₁|²: the area's one-sigma when each corner is off by its own accuracy figure in each direction,
 *       independently. It is a guide to the size of the doubt, not a guarantee; null when any corner's accuracy is unknown.
 *   cornersFromTrack(track, tol) → [index]         Douglas–Peucker on the plane: the corners of a walked line, within tol metres
 *   readGpx(text) → { ok, waypoints: [fix + name], tracks: [[fix]], routes: [[fix]], notes } | { ok: false, why }      GPX 1.0 / 1.1
 *   walkFromGpx(gpx, { name, use: 'waypoints' | 'track' | 'route', tol }) → walk
 *   writeGpx(walk) → text · walkCsv(walk) → text · walkGeoJSON(walk) → object (RFC 7946: a Point per walk point, a Polygon when closed)
 */
import { fin, localPlane, area, perimeter } from './geo.js';
import { WALK_FORMAT, WALK_VERSION, LIMITS, cleanFix, newWalk, cleanWalk } from './clean.js';
export { WALK_FORMAT, WALK_VERSION, LIMITS, cleanFix, newWalk, cleanWalk };

const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function averageFixes(fixes, { maxAcc = Infinity } = {}) {
  const all = (Array.isArray(fixes) ? fixes.slice(-LIMITS.fixes) : []).map(cleanFix).filter(Boolean);
  const use = all.filter((f) => f.acc === null || f.acc <= maxAcc);
  if (!use.length) return null;
  const pl = localPlane(use[0]);
  let sw = 0, sx = 0, sy = 0, sa = 0, na = 0, best = null;
  const xy = use.map((f) => pl.toXY(f.lat, f.lon));
  use.forEach((f, i) => {
    const w = f.acc ? 1 / (f.acc * f.acc) : 1;
    sw += w; sx += xy[i].x * w; sy += xy[i].y * w;
    if (f.alt !== null) { sa += f.alt; na++; }
    if (f.acc !== null && (best === null || f.acc < best)) best = f.acc;
  });
  const mx = sx / sw, my = sy / sw, at = pl.toLatLon(mx, my);
  const spread = Math.sqrt(xy.reduce((m, p) => m + (p.x - mx) ** 2 + (p.y - my) ** 2, 0) / xy.length);
  return { lat: at.lat, lon: at.lon, alt: na ? sa / na : null, acc: best, spread, n: use.length, dropped: all.length - use.length };
}

/** The fixes taken since the walker came to rest: back from the newest, as long as each lies within the newest one's own accuracy (2 m at least)
 *  of it. A press made on arrival then averages where the walker stands, not the last steps of the way there. */
export function settled(fixes, cap = Infinity) {
  const all = (Array.isArray(fixes) ? fixes : []).map(cleanFix).filter(Boolean);
  if (all.length < 2) return all;
  const last = all[all.length - 1], pl = localPlane(last), r = Math.max(2, Math.min(last.acc || 0, cap));
  let i = all.length - 1;
  while (i > 0) { const q = pl.toXY(all[i - 1].lat, all[i - 1].lon); if (Math.hypot(q.x, q.y) > r) break; i--; }
  return all.slice(i);
}

export function markPoint(walk, fixes, { code = 'C', t = 0, maxAcc = Infinity, minFixes = 1 } = {}) {
  if (walk.points.length >= LIMITS.points) return { ok: false, why: 'full' };
  const all = settled(fixes, maxAcc);
  if (!all.length) return { ok: false, why: 'nofix' };
  // where the device is poor NOW there is no point, however good it was a moment ago somewhere else
  if (all[all.length - 1].acc !== null && all[all.length - 1].acc > maxAcc) return { ok: false, why: 'poor' };
  const m = averageFixes(all, { maxAcc });
  if (!m || m.n < minFixes) return { ok: false, why: 'poor' };
  const point = { n: walk.points.length + 1, lat: m.lat, lon: m.lon, alt: m.alt, acc: m.acc, spread: m.spread, fixes: m.n, t: fin(t) && t > 0 ? t : (all[all.length - 1].t || 0), code: str(code, LIMITS.code) || 'C' };
  walk.points.push(point);
  if (!walk.started) walk.started = point.t;
  return { ok: true, point };
}
export function undoPoint(walk) { walk.closed = false; return walk.points.pop() || null; }

export function addTrack(walk, fix, minMove = 2) {
  const f = cleanFix(fix); if (!f || walk.track.length >= LIMITS.track) return false;
  const last = walk.track[walk.track.length - 1];
  if (last) { const p = localPlane(last).toXY(f.lat, f.lon); if (Math.hypot(p.x, p.y) < minMove) return false; }
  walk.track.push(f); return true;
}

export const isCorner = (p) => p.code === 'C';
export function plane(walk) {
  const o = walk.points.find(isCorner) || walk.points[0] || walk.track[0];
  return o ? localPlane(o) : null;
}
export function outline(walk, pl = plane(walk)) {
  if (!pl) return [];
  return walk.points.filter(isCorner).map((p) => ({ ...pl.toXY(p.lat, p.lon), acc: p.acc }));
}

export function stats(walk) {
  const ring = outline(walk), n = ring.length, accs = ring.map((p) => p.acc);
  const known = accs.filter((a) => a !== null);
  const out = { corners: n, points: walk.points.length, area: 0, perimeter: 0, areaSigma: null, worst: known.length ? Math.max(...known) : null, best: known.length ? Math.min(...known) : null, unknown: accs.length - known.length, closing: 0 };
  if (n >= 2) out.closing = Math.hypot(ring[0].x - ring[n - 1].x, ring[0].y - ring[n - 1].y);
  if (n < 3) return out;
  out.area = area(ring); out.perimeter = perimeter(ring);
  if (!out.unknown) {
    let s = 0;
    for (let i = 0; i < n; i++) { const a = ring[(i + n - 1) % n], b = ring[(i + 1) % n]; s += ring[i].acc ** 2 * ((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }
    out.areaSigma = Math.sqrt(s) / 2;
  }
  return out;
}

export function cornersFromTrack(track, tol = 3) {
  const fixes = track.map(cleanFix).filter(Boolean);
  if (fixes.length < 3) return fixes.map((_, i) => i);
  const pl = localPlane(fixes[0]), P = fixes.map((f) => pl.toXY(f.lat, f.lon)), keep = new Uint8Array(P.length);
  keep[0] = keep[P.length - 1] = 1;
  const stack = [[0, P.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); if (b - a < 2) continue;
    const dx = P[b].x - P[a].x, dy = P[b].y - P[a].y, len = Math.hypot(dx, dy);
    let worst = -1, at = -1;
    for (let i = a + 1; i < b; i++) {
      const d = len > 0 ? Math.abs(dx * (P[i].y - P[a].y) - dy * (P[i].x - P[a].x)) / len : Math.hypot(P[i].x - P[a].x, P[i].y - P[a].y);
      if (d > worst) { worst = d; at = i; }
    }
    if (worst > tol) { keep[at] = 1; stack.push([a, at], [at, b]); }
  }
  const out = []; for (let i = 0; i < P.length; i++) if (keep[i]) out.push(i);
  // a loop walked back to its start: the last fix is the first corner again
  if (out.length > 3 && Math.hypot(P[0].x - P[P.length - 1].x, P[0].y - P[P.length - 1].y) <= tol) out.pop();
  return out;
}

// ---------------------------------------------------------------- GPX
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
const unx = (s) => String(s).replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENT[m]).replace(/&#(\d{1,7});/g, (_, d) => { const c = Number(d); return c > 31 && c < 0x110000 ? String.fromCodePoint(c) : ' '; });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function readGpx(text) {
  const src = String(text ?? '');
  if (src.length > 60e6) return { ok: false, why: 'size' };
  if (/<!DOCTYPE|<!ENTITY/i.test(src)) return { ok: false, why: 'doctype' };   // no entity tricks: a GPX file needs neither
  if (!/<gpx[\s>]/i.test(src)) return { ok: false, why: 'format' };
  const notes = [];
  const fixOf = (attrs, body) => {
    const lat = /\blat\s*=\s*["']([^"']{1,40})["']/.exec(attrs), lon = /\blon\s*=\s*["']([^"']{1,40})["']/.exec(attrs);
    if (!lat || !lon) return null;
    const ele = /<ele>\s*([^<]{1,40})\s*<\/ele>/.exec(body), tm = /<time>\s*([^<]{1,40})\s*<\/time>/.exec(body), nm = /<name>([^<]{0,200})<\/name>/.exec(body);
    const f = cleanFix({ lat: Number(lat[1]), lon: Number(lon[1]), acc: null, alt: ele ? Number(ele[1]) : null, t: tm ? Date.parse(tm[1]) : 0 });
    if (f && nm) f.name = str(unx(nm[1]), 80);
    return f;
  };
  const scan = (chunk, tag, max) => {
    const out = [], re = new RegExp('<' + tag + '\\b([^>]*?)(?:/>|>([\\s\\S]*?)</' + tag + '>)', 'g');
    let m, bad = 0;
    while ((m = re.exec(chunk)) && out.length < max) { const f = fixOf(m[1], m[2] || ''); if (f) out.push(f); else bad++; }
    if (bad) notes.push({ code: 'badpoints', n: bad, tag });
    return out;
  };
  const groups = (tag, inner, max) => {
    const out = [], re = new RegExp('<' + tag + '\\b[^>]*>([\\s\\S]*?)</' + tag + '>', 'g');
    let m;
    while ((m = re.exec(src)) && out.length < 200) { const g = scan(m[1], inner, max); if (g.length) out.push(g); }
    return out;
  };
  // waypoints are the <wpt> outside any track or route
  const bare = src.replace(/<trk\b[\s\S]*?<\/trk>/g, '').replace(/<rte\b[\s\S]*?<\/rte>/g, '');
  const waypoints = scan(bare, 'wpt', LIMITS.points);
  const tracks = groups('trk', 'trkpt', LIMITS.track), routes = groups('rte', 'rtept', LIMITS.points);
  if (!waypoints.length && !tracks.length && !routes.length) return { ok: false, why: 'empty' };
  return { ok: true, waypoints, tracks, routes, notes };
}

export function walkFromGpx(gpx, { name = 'GPX', use = null, tol = 3 } = {}) {
  const w = newWalk({ name, device: 'GPX file' });
  const kind = use || (gpx.waypoints.length >= 3 ? 'waypoints' : gpx.routes.length ? 'route' : 'track');
  const put = (f, code = 'C') => { w.points.push({ n: w.points.length + 1, lat: f.lat, lon: f.lon, alt: f.alt, acc: f.acc, spread: null, fixes: 1, t: f.t, code }); };
  if (kind === 'waypoints') gpx.waypoints.forEach((f) => put(f));
  else if (kind === 'route') (gpx.routes[0] || []).forEach((f) => put(f));
  else {
    const trk = (gpx.tracks[0] || []).slice(0, LIMITS.track);
    w.track = trk.map((f) => ({ lat: f.lat, lon: f.lon, acc: f.acc, alt: f.alt, t: f.t }));
    for (const i of cornersFromTrack(trk, tol)) put(trk[i]);
  }
  w.started = w.points[0]?.t || 0; w.used = kind;
  return w;
}

const iso = (t) => (t ? new Date(t).toISOString() : '');
export function writeGpx(walk) {
  const L = ['<?xml version="1.0" encoding="UTF-8"?>', '<gpx version="1.1" creator="CadCraft Land records" xmlns="http://www.topografix.com/GPX/1/1">', ' <metadata><name>' + esc(walk.name) + '</name>' + (walk.started ? '<time>' + iso(walk.started) + '</time>' : '') + '</metadata>'];
  for (const p of walk.points) L.push(' <wpt lat="' + p.lat.toFixed(8) + '" lon="' + p.lon.toFixed(8) + '">' + (p.alt !== null ? '<ele>' + p.alt.toFixed(2) + '</ele>' : '') + (p.t ? '<time>' + iso(p.t) + '</time>' : '') + '<name>' + esc(p.n + ' ' + p.code) + '</name>' + (p.acc !== null ? '<desc>accuracy ' + p.acc.toFixed(1) + ' m (the device\'s own figure)</desc>' : '') + '</wpt>');
  if (walk.track.length) {
    L.push(' <trk><name>' + esc(walk.name) + '</name><trkseg>');
    for (const f of walk.track) L.push('  <trkpt lat="' + f.lat.toFixed(8) + '" lon="' + f.lon.toFixed(8) + '">' + (f.alt !== null ? '<ele>' + f.alt.toFixed(2) + '</ele>' : '') + (f.t ? '<time>' + iso(f.t) + '</time>' : '') + '</trkpt>');
    L.push(' </trkseg></trk>');
  }
  L.push('</gpx>');
  return L.join('\n') + '\n';
}

/** A cell a spreadsheet will not run as a formula, quoted when it must be. */
export function csvCell(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return fin(v) ? String(v) : '';
  let s = String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
export const csvRows = (rows) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

export function walkCsv(walk) {
  const rows = [['point', 'code', 'latitude', 'longitude', 'height_m', 'accuracy_m', 'spread_m', 'fixes', 'time_utc']];
  for (const p of walk.points) rows.push([p.n, p.code, Number(p.lat.toFixed(8)), Number(p.lon.toFixed(8)), p.alt === null ? '' : Number(p.alt.toFixed(2)), p.acc === null ? '' : Number(p.acc.toFixed(2)), p.spread === null ? '' : Number(p.spread.toFixed(2)), p.fixes, iso(p.t)]);
  return csvRows(rows);
}

export function walkGeoJSON(walk) {
  const pos = (p) => (p.alt !== null ? [Number(p.lon.toFixed(8)), Number(p.lat.toFixed(8)), Number(p.alt.toFixed(2))] : [Number(p.lon.toFixed(8)), Number(p.lat.toFixed(8))]);
  const features = walk.points.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: pos(p) }, properties: { kind: 'walk point', point: p.n, code: p.code, accuracy_m: p.acc, spread_m: p.spread, fixes: p.fixes, time: iso(p.t) } }));
  const corners = walk.points.filter(isCorner);
  if (corners.length >= 3) {
    const pl = localPlane(corners[0]), ring = corners.map((p) => pl.toXY(p.lat, p.lon));
    let s = 0; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; s += a.x * b.y - b.x * a.y; }
    const order = s < 0 ? corners.slice().reverse() : corners;   // RFC 7946: the outer ring counter-clockwise
    const c = order.map((p) => [Number(p.lon.toFixed(8)), Number(p.lat.toFixed(8))]); c.push(c[0]);
    features.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [c] }, properties: { kind: 'walk outline', name: walk.name, ...(() => { const st = stats(walk); return { area_m2: Number(st.area.toFixed(2)), area_sigma_m2: st.areaSigma === null ? null : Number(st.areaSigma.toFixed(2)), worst_accuracy_m: st.worst }; })() } });
  }
  return { type: 'FeatureCollection', name: walk.name, features };
}
