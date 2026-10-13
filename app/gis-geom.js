/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-geom.js — GIS feature geometry for CivilCraft (docs/GIS-SPEC.md §2). No DOM.
 *
 *   geometry = null (empty) | { t: 'pt', c: [x, y, z?] }
 *                           | { t: 'ln', c: [part, …] }            part = [[x, y, z?], …] (≥ 2 points)
 *                           | { t: 'pg', c: [polygon, …] }         polygon = [outer ring, hole, …], each ring closed
 *   Multi-part lines and polygons are kept; a multipoint becomes one feature per point (said in the reader's notes).
 *
 *   ringArea(ring) signed (counter-clockwise +) · pointInRing(x, y, ring) · closeRing(ring)
 *   polygonsFromRings(rings) → polygons      shapefile rule: clockwise = outer, counter-clockwise = hole, each hole goes
 *                                            to the smallest outer that holds it (stray holes become outers)
 *   orient(g, outerCCW) → g                  ring winding: RFC 7946 wants outer CCW; shapefiles want outer CW
 *   bounds(g, b?) · mapXY(g, fn) → g         fn(x, y) → [x2, y2]; z kept
 *   readWkb(bytes, offset?) → { geoms: [g …], end, multipoint }   ISO WKB, also the old 0x80000000 Z flag (EWKB-style);
 *                                            GeometryCollections flattened; M dropped
 *   writeWkb(g, hasZ) → Uint8Array           ISO WKB, little endian: Point, MultiLineString, MultiPolygon (+ Z, 1000 +)
 *   KIND = { pt: 'point', ln: 'line', pg: 'polygon' } · geomKind(type string) → 'pt' | 'ln' | 'pg' | null
 */

export const KIND = { pt: 'point', ln: 'line', pg: 'polygon' };
import { t } from "./i18n.js";

export class GeomError extends Error {}

export function ringArea(r) {
  let a = 0;
  for (let i = 0, n = r.length; i < n; i++) { const p = r[i], q = r[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; }
  return a / 2;
}
export function pointInRing(x, y, r) {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i], b = r[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
export function closeRing(r) {
  if (r.length && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1])) r.push(r[0].slice());
  return r;
}

export function polygonsFromRings(rings) {
  const outers = [], holes = [];
  for (const r of rings) { if (r.length < 4) continue; (ringArea(r) < 0 ? outers : holes).push(r); }
  if (!outers.length) return holes.map((h) => [h.slice().reverse()]);   // every ring counter-clockwise: each its own polygon
  const polys = outers.map((o) => ({ o, a: Math.abs(ringArea(o)), holes: [] }));
  for (const h of holes) {
    let best = null;
    for (const p of polys) if (p.a >= Math.abs(ringArea(h)) && pointInRing(h[0][0], h[0][1], p.o) && (!best || p.a < best.a)) best = p;
    if (best) best.holes.push(h); else polys.push({ o: h.slice().reverse(), a: Math.abs(ringArea(h)), holes: [] });
  }
  return polys.map((p) => [p.o, ...p.holes]);
}

export function orient(g, outerCCW) {
  if (!g || g.t !== 'pg') return g;
  return { t: 'pg', c: g.c.map((poly) => poly.map((r, i) => { const ccw = ringArea(r) > 0; const want = i === 0 ? outerCCW : !outerCCW; return ccw === want ? r : r.slice().reverse(); })) };
}

export function bounds(g, b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }) {
  const add = (p) => { if (p[0] < b.minX) b.minX = p[0]; if (p[0] > b.maxX) b.maxX = p[0]; if (p[1] < b.minY) b.minY = p[1]; if (p[1] > b.maxY) b.maxY = p[1]; };
  if (!g) return b;
  if (g.t === 'pt') add(g.c);
  else if (g.t === 'ln') for (const part of g.c) for (const p of part) add(p);
  else if (g.t === 'pg') for (const poly of g.c) for (const p of poly[0]) add(p);
  return b;
}

export function mapXY(g, fn) {
  if (!g) return g;
  const m = (p) => { const q = fn(p[0], p[1]); return p.length > 2 ? [q[0], q[1], p[2]] : [q[0], q[1]]; };
  if (g.t === 'pt') return { t: 'pt', c: m(g.c) };
  if (g.t === 'ln') return { t: 'ln', c: g.c.map((part) => part.map(m)) };
  return { t: 'pg', c: g.c.map((poly) => poly.map((r) => r.map(m))) };
}
/** z of every vertex through fn (unit conversion); points without z stay without. */
export function mapZ(g, fn) {
  if (!g) return g;
  const m = (p) => (p.length > 2 ? [p[0], p[1], fn(p[2])] : p);
  if (g.t === 'pt') return { t: 'pt', c: m(g.c) };
  if (g.t === 'ln') return { t: 'ln', c: g.c.map((part) => part.map(m)) };
  return { t: 'pg', c: g.c.map((poly) => poly.map((r) => r.map(m))) };
}
export const vertexCount = (g) => (!g ? 0 : g.t === 'pt' ? 1 : g.t === 'ln' ? g.c.reduce((s, p) => s + p.length, 0) : g.c.reduce((s, poly) => s + poly.reduce((t, r) => t + r.length, 0), 0));

export function geomKind(type) {
  const t = String(type || '').toLowerCase().replace(/[\s_]/g, '').replace(/(zm|z|m)$/, '');
  if (t === 'point' || t === 'multipoint') return 'pt';
  if (t === 'linestring' || t === 'multilinestring' || t === 'curve' || t === 'multicurve' || t === 'compoundcurve') return 'ln';
  if (t === 'polygon' || t === 'multipolygon' || t === 'surface' || t === 'multisurface' || t === 'curvepolygon') return 'pg';
  return null;
}

// ---------------------------------------------------------------- WKB
const MAX_N = 50e6;
export function readWkb(bytes, offset = 0) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = offset, multipoint = false;
  const need = (n) => { if (p + n > b.length) throw new GeomError(t('geom.short')); };
  const geoms = [];
  function one(depth) {
    if (depth > 8) throw new GeomError(t('geom.deep'));
    need(5);
    const le = b[p] === 1; if (b[p] > 1) throw new GeomError(t('geom.order'));
    let type = dv.getUint32(p + 1, le); p += 5;
    let z = false, m = false;
    if (type & 0x80000000) { z = true; type &= 0x0fffffff; }
    if (type & 0x40000000) { m = true; type &= 0x0fffffff; }
    if (type & 0x20000000) { need(4); p += 4; type &= 0x0fffffff; }   // EWKB SRID
    if (type >= 3000) { z = true; m = true; type -= 3000; } else if (type >= 2000) { m = true; type -= 2000; } else if (type >= 1000) { z = true; type -= 1000; }
    const dim = 2 + (z ? 1 : 0) + (m ? 1 : 0);
    const pt = () => { need(8 * dim); const x = dv.getFloat64(p, le), y = dv.getFloat64(p + 8, le), zz = z ? dv.getFloat64(p + 16, le) : null; p += 8 * dim; return z && Number.isFinite(zz) ? [x, y, zz] : [x, y]; };
    const count = (per) => { need(4); const n = dv.getUint32(p, le); p += 4; if (n > MAX_N || n * per > b.length - p + 0) throw new GeomError(t('geom.count')); return n; };
    const seq = () => { const n = count(8 * dim); const out = new Array(n); for (let i = 0; i < n; i++) out[i] = pt(); return out; };
    const poly = () => { const n = count(4); const out = []; for (let i = 0; i < n; i++) out.push(closeRing(seq())); return out.filter((r) => r.length >= 4); };
    switch (type) {
      case 1: { const q = pt(); return Number.isFinite(q[0]) && Number.isFinite(q[1]) ? [{ t: 'pt', c: q }] : [null]; }   // POINT EMPTY = NaN
      case 2: { const s = seq(); return [s.length >= 2 ? { t: 'ln', c: [s] } : null]; }
      case 3: { const r = poly(); return [r.length ? { t: 'pg', c: [r] } : null]; }
      case 4: case 5: case 6: case 7: {
        const n = count(5); const kids = [];
        for (let i = 0; i < n; i++) kids.push(...one(depth + 1));
        if (type === 4) { multipoint = true; return kids.length ? kids : [null]; }
        if (type === 5) { const parts = kids.filter(Boolean).flatMap((k) => k.c); return [parts.length ? { t: 'ln', c: parts } : null]; }
        if (type === 6) { const polys = kids.filter(Boolean).flatMap((k) => k.c); return [polys.length ? { t: 'pg', c: polys } : null]; }
        return kids.length ? kids : [null];   // GeometryCollection: flattened
      }
      default: throw new GeomError(t('geom.type', { type }));
    }
  }
  geoms.push(...one(0));
  return { geoms, end: p, multipoint };
}

export function writeWkb(g, hasZ) {
  const dim = hasZ ? 3 : 2;
  const parts = [];
  let size = 0;
  const head = (type, n) => { const h = new DataView(new ArrayBuffer(n === undefined ? 5 : 9)); h.setUint8(0, 1); h.setUint32(1, type + (hasZ ? 1000 : 0), true); if (n !== undefined) h.setUint32(5, n, true); parts.push(new Uint8Array(h.buffer)); size += h.byteLength; };
  const cnt = (n) => { const h = new DataView(new ArrayBuffer(4)); h.setUint32(0, n, true); parts.push(new Uint8Array(h.buffer)); size += 4; };
  const coords = (list) => { const f = new Float64Array(list.length * dim); list.forEach((p, i) => { f[i * dim] = p[0]; f[i * dim + 1] = p[1]; if (hasZ) f[i * dim + 2] = p.length > 2 ? p[2] : 0; }); const u = new Uint8Array(f.buffer); parts.push(u); size += u.length; };
  if (!g) throw new GeomError(t('geom.none'));
  if (g.t === 'pt') { head(1); coords([g.c]); }
  else if (g.t === 'ln') { head(5, g.c.length); for (const part of g.c) { head(2); cnt(part.length); coords(part); } }
  else { head(6, g.c.length); for (const poly of g.c) { head(3); cnt(poly.length); for (const r of poly) { cnt(r.length); coords(r); } } }
  const out = new Uint8Array(size); let o = 0;
  for (const x of parts) { out.set(x, o); o += x.length; }
  return out;
}
