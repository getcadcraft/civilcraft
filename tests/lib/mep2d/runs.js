/* SPDX-License-Identifier: Apache-2.0 */
/**
 * runs.js — pipe and duct runs as ordinary 2D geometry (lib/mep2d). DOM-free.
 *
 * A run is drawn once and then IS its geometry: lines, arcs and polylines that every drafting tool can edit. Each piece
 * carries a small record (`mep`) so the engine knows what it is:
 *   { r (run id), k ('pipe' | 'duct'), svc (service tag), size (label), mode ('single' | 'double' | 'flex'),
 *     role ('cl' centreline · 'edge' · 'elbow' · 'joint' · 'end'), o (+1 left edge, −1 right edge), w (half width) }
 * The record holds no coordinates, so moving, copying, rotating or stretching the pieces never makes it stale.
 *
 *   buildRun(def) → entities with `mep`
 *     def = { id, k, mode, svc, size, w (half width, drawing units; double/flex), elbow ('radius' | 'mitre'),
 *             R (centreline bend radius, drawing units), pts [[x, y]…], capS, capE (close the open ends) }
 *   cleanPath(pts) → the points without repeats
 *   newRunId()
 */
import { P, sub, unit, left, along, dist, add, mul, turn, line, arc, poly } from './geom.js';

let seq = 0;
export function newRunId() {
  seq = (seq + 1) % 1296;
  return 'r' + Date.now().toString(36) + seq.toString(36).padStart(2, '0') + Math.floor(Math.random() * 1296).toString(36).padStart(2, '0');
}

export function cleanPath(pts) {
  const out = [];
  for (const p of Array.isArray(pts) ? pts : []) {
    const q = Array.isArray(p) ? P(Number(p[0]), Number(p[1])) : P(Number(p?.x), Number(p?.y));
    if (!Number.isFinite(q.x) || !Number.isFinite(q.y)) continue;
    if (out.length && dist(out[out.length - 1], q) < 1e-9) continue;
    out.push(q);
  }
  return out;
}

export function buildRun(def) {
  const pts = cleanPath(def.pts);
  if (pts.length < 2) return [];
  const base = { r: String(def.id), k: def.k === 'duct' ? 'duct' : 'pipe', svc: String(def.svc || ''), size: String(def.size || ''), mode: def.mode };
  const tag = (e, role, extra = {}) => ({ ...e, mep: { ...base, role, ...extra } });
  const w = Math.max(0, Number(def.w) || 0);
  if (def.mode === 'single' || !(w > 0)) return [tag(poly(pts), 'cl', { mode: 'single' })];
  if (def.mode === 'flex') return [tag(flexPoly(pts, w), 'cl', { w })];

  const n = pts.length, d = [], L = [];
  for (let i = 0; i < n - 1; i++) { d.push(unit(sub(pts[i + 1], pts[i]))); L.push(dist(pts[i], pts[i + 1])); }
  // one bend per inside corner: { th (signed turn), T (tangent length; 0 = mitred), R }
  const bends = [null];
  for (let j = 1; j < n - 1; j++) {
    const th = turn(d[j - 1], d[j]);
    if (Math.abs(th) < 1e-9) { bends.push({ th: 0, T: 0, R: 0 }); continue; }
    const tan = Math.tan(Math.abs(th) / 2);
    let T = def.elbow === 'mitre' ? 0 : Math.min((Number(def.R) || 0) * tan, 0.49 * L[j - 1], 0.49 * L[j]);
    let R = T / tan;
    if (!(R > w * 1.0001)) { T = 0; R = 0; }   // no room for the inside edge's arc: a mitred corner
    bends.push({ th, T, R });
  }
  bends.push(null);
  const out = [];
  const mitreExt = (b, o) => (b && b.th && !b.T ? o * w * Math.tan(b.th / 2) : 0);
  for (let i = 0; i < n - 1; i++) {
    const nrm = left(d[i]), bs = bends[i], be = bends[i + 1];
    for (const o of [1, -1]) {
      const s0 = bs ? (bs.T || mitreExt(bs, o)) : 0;
      const s1 = L[i] - (be ? (be.T || mitreExt(be, o)) : 0);
      if (s1 - s0 > 1e-9) out.push(tag(line(add(along(pts[i], d[i], s0), mul(nrm, o * w)), add(along(pts[i], d[i], s1), mul(nrm, o * w))), 'edge', { o, w }));
    }
  }
  for (let j = 1; j < n - 1; j++) {
    const b = bends[j];
    if (!b.th) continue;
    const V = pts[j], nin = left(d[j - 1]), nout = left(d[j]), s = Math.sign(b.th);
    if (b.T > 0) {
      const p1 = along(V, d[j - 1], -b.T), p2 = along(V, d[j], b.T), C = add(p1, mul(nin, s * b.R));
      for (const o of [1, -1]) {
        const a = add(p1, mul(nin, o * w)), z = add(p2, mul(nout, o * w));
        const as = Math.atan2(a.y - C.y, a.x - C.x), ae = Math.atan2(z.y - C.y, z.x - C.x);
        out.push(tag(s > 0 ? arc(C.x, C.y, b.R - s * o * w, as, ae) : arc(C.x, C.y, b.R - s * o * w, ae, as), 'elbow', { o, w }));
      }
      out.push(tag(line(add(p1, mul(nin, w)), add(p1, mul(nin, -w))), 'joint', { w }));
      out.push(tag(line(add(p2, mul(nout, w)), add(p2, mul(nout, -w))), 'joint', { w }));
    } else {
      const corner = (o) => add(along(V, d[j - 1], -mitreExt(b, o)), mul(nin, o * w));
      out.push(tag(line(corner(1), corner(-1)), 'joint', { w }));
    }
  }
  if (def.capS) out.push(tag(line(add(pts[0], mul(left(d[0]), w)), add(pts[0], mul(left(d[0]), -w))), 'end', { w }));
  if (def.capE) out.push(tag(line(add(pts[n - 1], mul(left(d[n - 2]), w)), add(pts[n - 1], mul(left(d[n - 2]), -w))), 'end', { w }));
  return out;
}

/** A flexible duct: one polyline of half circles, alternating sides, as wide as the duct (the usual wavy line). */
function flexPoly(pts, w) {
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) total += dist(pts[i], pts[i + 1]);
  const n = Math.max(2, Math.min(4000, Math.round(total / (2 * w))));
  const step = total / n, out = [];
  let seg = 0, at = 0;   // walk the path by length
  for (let k = 0; k <= n; k++) {
    let s = k * step;
    while (seg < pts.length - 2 && s > at + dist(pts[seg], pts[seg + 1]) + 1e-9) { at += dist(pts[seg], pts[seg + 1]); seg++; }
    const dd = unit(sub(pts[seg + 1], pts[seg]));
    const q = along(pts[seg], dd, Math.min(s - at, dist(pts[seg], pts[seg + 1])));
    out.push([q.x, q.y, k < n ? (k % 2 ? 1 : -1) : 0]);
  }
  return poly(out);
}
