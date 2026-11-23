/* SPDX-License-Identifier: Apache-2.0 */
/**
 * junction.js — where a road meets another road, a pad or a path (0.10.1, /suggest #1977). No DOM, no strings.
 *
 * Until now two corridors that met were graded one after the other with nothing joining them: the side road kept its own
 * profile into the main road, the main road's shoulder, curb and walk ran across the mouth, a road that ended at a pad stopped
 * at whatever elevation its profile had there, and a path drawn onto a road lay over it. This module finds those places from
 * the plan geometry; corridor.js (ties, openings) and landscape/hardscape.js (pathStrip roads) do the joining.
 *
 *   nominalWidths(asm, units) → { L: { pave, body }, R: { pave, body } }
 *       a corridor's widths from the centreline as its assembly gives them (before targets or superelevation): pave = the
 *       lanes in a row plus a gutter and curb straight after them, body = everything before the daylight.
 *   findJunctions(roads, { units }) → [{ major, minor (road keys), end 'start'|'end'|null (the minor's end that meets the
 *       major; null = it crosses), at {x, y}, staMajor, staMinor, angle (rad, between the two directions),
 *       openings: [{ side 'L'|'R', from, to }] (stations on the major where its edge opens for the minor's pavement) }]
 *       roads = [{ key, alId, al (alignment.js Alignment), from, to (the corridor's stations), w (nominalWidths) }] in grading
 *       order. A road whose END lies on another road's body (within a tolerance: its own pavement half width, at least 2 m /
 *       6 ft) is the minor road of a T junction; two centrelines that cross are a crossing with the EARLIER road the major one.
 *       Roads on the same alignment, and roads that meet nearly in line (under 20°, one continuing the other), are left alone.
 *   padEnds(road, pads, { units }) → [{ pad (id), end }]   the road's ends that lie in a pad or within the tolerance of its edge
 *   bodyOf(info) → { poly: [{x, y}], lines: [[{x, y, z}]] }   a built corridor's body: the outline between its last points
 *       before the daylight on each side, and its centreline, edges of pavement and body edges as 3D lines
 *   roadZAt(info, al) → (x, y) → z | null   the design elevation of a built corridor's body at a plan point (between its
 *       sections by station, across a section by offset); null off the body
 *   padZAt(pad) → (x, y) → z | null   a pad's elevation at a plan point: its z, or with corner elevations the mean value
 *       interpolation of the corners (Floater 2003, "Mean value coordinates"); null outside the pad
 *   segCrossings(a, b, poly) → [u…]   where the segment a→b crosses a closed polygon, as fractions 0…1 along it, sorted
 */

import { pointInPoly } from './tin.js';

const hyp = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const MIN_SIN = 0.34;   // about 20°: under it two roads run alongside or continue each other, not a junction

export function nominalWidths(asm, units = 'ft') {
  const simple = () => { const lane = asm?.lane > 0 ? asm.lane : units === 'm' ? 3.6 : 12, sh = asm?.shoulder >= 0 ? asm.shoulder : 0; return { pave: lane, body: lane + sh }; };
  const tplOn = Array.isArray(asm?.regions) && asm.regions.length > 0;
  const side = (parts) => {
    if (tplOn || !Array.isArray(parts) || !parts.length) return simple();
    let pave = 0, body = 0, inPave = true, lanes = 0;
    for (const q of parts) {
      if (q.type === 'daylight') break;
      const w = Number(q.w) > 0 ? Number(q.w) : 0;
      body += w;
      if (inPave && (q.type === 'lane' || ((q.type === 'gutter' || q.type === 'curb') && lanes > 0))) { pave += w; if (q.type === 'lane') lanes++; } else inPave = false;
    }
    return pave > 0 ? { pave, body } : simple();
  };
  return { L: side(asm?.parts?.L), R: side(asm?.parts?.R) };
}

/** Where a→b crosses the closed polygon `poly`: fractions along a→b. */
export function segCrossings(a, b, poly) {
  const out = [], dx = b.x - a.x, dy = b.y - a.y;
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i], d = poly[(i + 1) % poly.length], ex = d.x - c.x, ey = d.y - c.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-15) continue;
    const u = ((c.x - a.x) * ey - (c.y - a.y) * ex) / den, v = ((c.x - a.x) * dy - (c.y - a.y) * dx) / den;
    if (u >= -1e-12 && u <= 1 + 1e-12 && v >= -1e-12 && v <= 1 + 1e-12) out.push(Math.min(1, Math.max(0, u)));
  }
  return out.sort((p, q) => p - q).filter((u, i, A) => !i || u - A[i - 1] > 1e-9);
}

const maxPave = (r) => Math.max(r.w.L.pave, r.w.R.pave);
const maxBody = (r) => Math.max(r.w.L.body, r.w.R.body);
const sinBetween = (d1, d2) => Math.abs(Math.sin(d1 - d2));

/** The ends of `minor` that lie on `major`'s body. */
function endsOn(minor, major, minTol) {
  const out = [], tol = Math.max(maxPave(minor), minTol), len = minor.to - minor.from;
  if (!(len > 1e-6)) return out;
  for (const end of ['start', 'end']) {
    const sta = end === 'start' ? minor.from : minor.to, p = minor.al.pointAt(sta);
    if (!p) continue;
    const q = major.al.stationOffset(p.x, p.y);
    if (!q || q.outside || q.sta < major.from - tol || q.sta > major.to + tol) continue;
    const pm = major.al.pointAt(q.sta), sn = sinBetween(p.dir, pm.dir);
    if (sn < MIN_SIN) continue;
    // the side the minor road comes from: its direction away from the end, against the major's right-hand normal
    const inward = end === 'start' ? p.dir : p.dir + Math.PI;
    const side = Math.cos(inward) * Math.sin(pm.dir) - Math.sin(inward) * Math.cos(pm.dir) > 0 ? 'R' : 'L';
    const body = major.w[side].body;
    if (Math.abs(q.off) > Math.max(major.w.L.body, major.w.R.body) + tol) continue;
    // where the minor's centreline meets the major's body edge on that side (the end itself when it stops short of the edge)
    const sgn = end === 'start' ? 1 : -1, offAt = (s) => { const pt = minor.al.pointAt(s), o = major.al.stationOffset(pt.x, pt.y); return o ? (side === 'R' ? o.off : -o.off) : null; };
    let sEdge = sta;
    const o0 = offAt(sta);
    if (o0 !== null && o0 < body) {
      let a = sta, b = sta;   // a inside the body, b outside it
      const reach = Math.min(len, (body + tol) / sn + tol);
      for (let k = 1; k <= 16; k++) { b = sta + sgn * (reach * k) / 16; const o = offAt(b); if (o === null || o >= body) break; a = b; }
      const ob = offAt(b);
      if (ob !== null && ob >= body) { for (let it = 0; it < 40 && Math.abs(b - a) > 1e-5; it++) { const m = (a + b) / 2, o = offAt(m); if (o !== null && o < body) a = m; else b = m; } sEdge = b; }
    }
    const pe = minor.al.pointAt(sEdge), qe = major.al.stationOffset(pe.x, pe.y), h = maxPave(minor) / Math.max(sn, MIN_SIN);
    out.push({ major: major.key, minor: minor.key, end, at: { x: pe.x, y: pe.y }, staMajor: qe ? qe.sta : q.sta, staMinor: sEdge, angle: Math.asin(Math.min(1, sn)), openings: [{ side, from: (qe ? qe.sta : q.sta) - h, to: (qe ? qe.sta : q.sta) + h }] });
  }
  return out;
}

/** Where two centrelines cross away from their ends. */
function crossings(A, B, minTol) {
  const out = [], seg = Math.max(0.5, Math.min(maxBody(A), maxBody(B)) / 2);
  const pa = A.al.polyline(seg).filter((p) => p.sta >= A.from - 1e-9 && p.sta <= A.to + 1e-9), pb = B.al.polyline(seg).filter((p) => p.sta >= B.from - 1e-9 && p.sta <= B.to + 1e-9);
  for (let i = 0; i + 1 < pa.length; i++) for (let j = 0; j + 1 < pb.length; j++) {
    const a = pa[i], b = pa[i + 1], c = pb[j], d = pb[j + 1];
    const dx = b.x - a.x, dy = b.y - a.y, ex = d.x - c.x, ey = d.y - c.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-15) continue;
    const u = ((c.x - a.x) * ey - (c.y - a.y) * ex) / den, v = ((c.x - a.x) * dy - (c.y - a.y) * dx) / den;
    if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
    const sA = a.sta + u * (b.sta - a.sta), sB = c.sta + v * (d.sta - c.sta), sn = sinBetween(Math.atan2(dy, dx), Math.atan2(ey, ex));
    if (sn < MIN_SIN) continue;
    const h = maxPave(B) / Math.max(sn, MIN_SIN);
    out.push({ major: A.key, minor: B.key, end: null, at: { x: a.x + u * dx, y: a.y + u * dy }, staMajor: sA, staMinor: sB, angle: Math.asin(Math.min(1, sn)), openings: [{ side: 'L', from: sA - h, to: sA + h }, { side: 'R', from: sA - h, to: sA + h }] });
  }
  return out;
}

export function findJunctions(roads, { units = 'ft' } = {}) {
  const out = [], minTol = units === 'm' ? 2 : 6;
  const list = (roads || []).filter((r) => r?.al?.ok && r.to - r.from > 1e-6);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const A = list[i], B = list[j];
    if (A.alId === B.alId) continue;
    const near = (p, q) => hyp(p, q) < maxBody(A) + maxBody(B) + minTol;
    const found = endsOn(B, A, minTol);   // the later road ending on the earlier one
    for (const k of endsOn(A, B, minTol)) if (!found.some((f) => near(f.at, k.at))) found.push(k);   // (two ends that meet: the earlier road stays the major one)
    for (const k of crossings(A, B, minTol)) if (!found.some((f) => near(f.at, k.at))) found.push(k);
    out.push(...found);
  }
  return out;
}

/** The ends of a road that lie in a pad, or within the tolerance of its edge. */
export function padEnds(road, pads, { units = 'ft' } = {}) {
  const out = [], tol = Math.max(maxPave(road), units === 'm' ? 2 : 6);
  for (const end of ['start', 'end']) {
    const p = road.al.pointAt(end === 'start' ? road.from : road.to);
    if (!p) continue;
    for (const pad of pads || []) {
      const P = pad.pts || [];
      if (P.length < 3) continue;
      let hit = pointInPoly(p.x, p.y, P);
      for (let i = 0; i < P.length && !hit; i++) {
        const a = P[i], b = P[(i + 1) % P.length], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
        const u = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
        if (Math.hypot(p.x - a.x - dx * u, p.y - a.y - dy * u) <= tol) hit = true;
      }
      if (hit) { out.push({ pad: pad.id, end }); break; }
    }
  }
  return out;
}

const bodySide = (s, side) => { const a = s.det ? s.det[side] : s[side]; return a.slice(0, a.length - 1); };   // without the daylight point

export function bodyOf(info) {
  const secs = info?.sections || [];
  if (secs.length < 2) return null;
  const edge = (side) => secs.map((s) => { const a = bodySide(s, side), q = a[a.length - 1]; return { x: q.x, y: q.y, z: q.z }; });
  const eop = (side) => secs.map((s) => { const q = s[side][1]; return { x: q.x, y: q.y, z: q.z }; });
  const L = edge('L'), R = edge('R'), cl = secs.map((s) => { const q = s.L[0]; return { x: q.x, y: q.y, z: q.z }; });
  return { poly: [...L, ...R.slice().reverse()].map((q) => ({ x: q.x, y: q.y })), lines: [cl, eop('L'), eop('R'), L, R] };
}

export function roadZAt(info, al) {
  const secs = info?.sections || [], n = secs.length;
  if (n < 2 || !al?.ok) return () => null;
  const across = (s, off) => {
    const a = bodySide(s, off >= 0 ? 'R' : 'L'), o = Math.abs(off), c = a[0];
    let d0 = 0;
    for (let k = 1; k < a.length; k++) {
      const d1 = hyp(a[k], c);
      if (o <= d1 + 1e-9) return d1 - d0 > 1e-9 ? a[k - 1].z + ((Math.max(o, d0) - d0) / (d1 - d0)) * (a[k].z - a[k - 1].z) : a[k].z;
      d0 = d1;
    }
    return a.length === 1 && o < 1e-9 ? c.z : null;
  };
  return (x, y) => {
    const q = al.stationOffset(x, y);
    if (!q || q.outside || q.sta < secs[0].sta - 1e-6 || q.sta > secs[n - 1].sta + 1e-6) return null;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (secs[m].sta <= q.sta) lo = m; else hi = m; }
    const za = across(secs[lo], q.off), zb = across(secs[hi], q.off);
    if (za === null || zb === null) return null;
    const L = secs[hi].sta - secs[lo].sta, f = L > 1e-9 ? Math.min(1, Math.max(0, (q.sta - secs[lo].sta) / L)) : 0;
    return za + f * (zb - za);
  };
}

export function padZAt(pad) {
  const P = pad?.pts || [], z0 = Number(pad?.z);
  if (P.length < 3) return () => null;
  const zs = P.map((p) => (Number.isFinite(p.z) ? p.z : z0)), flat = P.every((p) => !Number.isFinite(p.z));
  return (x, y) => {
    if (!pointInPoly(x, y, P)) {
      // on the edge counts: the elevation along that side
      for (let i = 0; i < P.length; i++) {
        const a = P[i], b = P[(i + 1) % P.length], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
        const u = L ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L)) : 0;
        if (Math.hypot(x - a.x - dx * u, y - a.y - dy * u) <= 1e-6) return zs[i] + u * (zs[(i + 1) % P.length] - zs[i]);
      }
      return null;
    }
    if (flat) return Number.isFinite(z0) ? z0 : null;
    const n = P.length, r = P.map((p) => Math.hypot(p.x - x, p.y - y));
    for (let i = 0; i < n; i++) if (r[i] < 1e-9) return zs[i];
    const tanHalf = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, ax = P[i].x - x, ay = P[i].y - y, bx = P[j].x - x, by = P[j].y - y, cr = ax * by - ay * bx, dt = ax * bx + ay * by;
      if (Math.abs(cr) < 1e-12 && dt < 0) { const u = r[i] / (r[i] + r[j]); return zs[i] + u * (zs[j] - zs[i]); }   // on that side
      tanHalf.push(Math.abs(cr) < 1e-12 ? 0 : (r[i] * r[j] - dt) / cr);
    }
    let W = 0, Z = 0;
    for (let i = 0; i < n; i++) { const w = (tanHalf[(i - 1 + n) % n] + tanHalf[i]) / r[i]; W += w; Z += w * zs[i]; }
    return Math.abs(W) > 1e-12 ? Z / W : z0;
  };
}
