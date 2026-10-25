/* SPDX-License-Identifier: Apache-2.0 */
/**
 * zoning.js — what a lot allows (0.7 LC.1 M3): setbacks per lot line, a height cap, a sky-exposure plane, floor area ratio and
 * coverage. No DOM; the Node test drives it (bin/test-civilcraft-massing.mjs).
 *
 * THE LIMITS ARE TYPED BY THE PERSON. CivilCraft ships no zoning code library and no city's rules: every number here is one the
 * person read in their own ordinance, and every result says "against the limits you typed".
 *
 * zone = { parcel: parcel id, front, side, rear (setback distances, project units; 0 = none), frontCourse: index of the lot line
 *          on the street (courses of the parcel, parcels.js courses()), rearCourse: index | null (null = the course most opposite
 *          the front one), setbacks: { [course index]: distance } (a typed distance for one line wins over front / side / rear),
 *          show (the envelope is drawn on the plan), heightCap (0 = none), sky: null | { h0, rise, from: 'front' | 'all' } (see below), far (0 = none), coverage (0 – 1, 0 = none) }
 *
 * Setbacks. Each lot line has its own distance; the buildable area is the lot taken in from every line by that line's distance,
 * the offset lines meeting at mitred corners (what a plan examiner draws). When every line has the same distance this IS
 * featureline.js offsetFeature (called, not copied); with different distances the same mitre is built per line. A lot whose
 * setbacks fold over themselves (a deep setback on a narrow or very concave lot) gives no envelope and a plain reason. Arcs in the
 * lot lines are taken as short chords within 0.01 of the curve, each chord with its line's distance.
 *
 * Sky-exposure plane. Over a point p the plane is at h0 + rise × s, where s is p's perpendicular distance in from the lot line
 * (rise = feet of height gained per foot of run: 2 means 2:1), measured from the front line only or from every line; the
 * height allowed at p is the lowest of the plane(s) and the cap. A prism of one height can only break a plane that rises
 * inward at the footprint's corner nearest the line, so the allowed height of a footprint is the smallest allowed height at its corners.
 *
 *   cleanZone(o, units) → zone | null           (untrusted: the project file)
 *   lotRing(parcel) → [{ x, y, course }]         the lot's outline counter-clockwise, arcs as chords, each point with its course index
 *   courseSetbacks(parcel, zone) → [distance per course]
 *   envelope(parcel, zone) → { ring, courses, distances, poly | null, area, lotArea, problem | null, uniform }
 *   allowedHeight(parcel, zone, pts) → { height, by: 'cap' | 'sky' | null, at }   lowest height the zone allows over the footprint (Infinity = no limit)
 *   checkMasses(parcel, zone, masses) → { envelope, lotArea, coverage, far, items: [{ key, ok, limit, value, mass? }], ok }
 *       items: 'setback' (area of a mass outside the envelope; limit 0), 'height' (a mass taller than allowed), 'far', 'coverage'
 *   insideArea(poly, pts) → area of the footprint inside the envelope polygon
 */

import { offsetFeature } from './featureline.js';
import { courses } from './parcels.js';
import { triangulate, signedArea, massArea, massGfa, massHeight } from './massing.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const nz = (v, max) => (fin(v) && v > 0 && v < max ? v : 0);

export function cleanZone(o, units = 'ft') {
  if (!o || typeof o !== 'object' || !/^r\d{1,9}$/.test(String(o.parcel))) return null;
  const big = units === 'm' ? 1000 : 3000, idx = (v) => (Number.isInteger(v) && v >= 0 && v < 5000 ? v : null);
  const setbacks = {};
  if (o.setbacks && typeof o.setbacks === 'object') for (const [k, v] of Object.entries(o.setbacks).slice(0, 5000)) if (/^\d{1,4}$/.test(k) && fin(v) && v >= 0 && v < big) setbacks[k] = v;
  const sky = o.sky && typeof o.sky === 'object' && nz(o.sky.rise, 100) ? { h0: nz(o.sky.h0, big) , rise: nz(o.sky.rise, 100), from: o.sky.from === 'all' ? 'all' : 'front' } : null;
  return {
    parcel: String(o.parcel), front: nz(o.front, big), side: nz(o.side, big), rear: nz(o.rear, big),
    frontCourse: idx(o.frontCourse) ?? 0, rearCourse: idx(o.rearCourse), setbacks,
    show: o.show === true, heightCap: nz(o.heightCap, 10000), sky, far: nz(o.far, 1000), coverage: fin(o.coverage) && o.coverage > 0 && o.coverage <= 1 ? o.coverage : 0,
  };
}

// ------------------------------------------------------------------ the lot
/** The lot as a counter-clockwise ring of points; a point's `course` is the lot line that STARTS there. Arcs as chords. */
export function lotRing(parcel) {
  const cs = courses(parcel.pts), ring = [];
  cs.forEach((c, i) => {
    ring.push({ x: c.from.x, y: c.from.y, course: i });
    if (c.kind === 'curve') {
      const a0 = Math.atan2(c.from.y - c.c.y, c.from.x - c.c.x), step = 2 * Math.acos(Math.max(0, Math.min(1, 1 - 0.01 / Math.max(c.R, 0.02)))) || Math.PI / 8;
      const n = Math.max(2, Math.min(400, Math.ceil(c.delta / step)));
      for (let k = 1; k < n; k++) { const a = a0 + c.turn * c.delta * (k / n); ring.push({ x: c.c.x + c.R * Math.cos(a), y: c.c.y + c.R * Math.sin(a), course: i }); }
    }
  });
  if (signedArea(ring) < 0) {   // keep the course tags: reverse so the point that starts a line now ends it
    const r = ring.slice().reverse();
    return r.map((p, k) => ({ x: p.x, y: p.y, course: r[(k + 1) % r.length].course }));
  }
  return ring;
}

/** Each ring edge (ring index i → i + 1) with the lot line it lies on: [{ a, b, course }]. */
function ringEdges(ring) {
  return ring.map((p, i) => ({ a: p, b: ring[(i + 1) % ring.length], course: p.course }));
}

// ------------------------------------------------------------------ setbacks
export function courseSetbacks(parcel, zone) {
  const cs = courses(parcel.pts), n = cs.length;
  const mid = (c) => (c.kind === 'line' ? { x: (c.from.x + c.to.x) / 2, y: (c.from.y + c.to.y) / 2 } : { x: (c.from.x + c.to.x) / 2, y: (c.from.y + c.to.y) / 2 });
  const f = Math.min(Math.max(0, zone.frontCourse | 0), n - 1);
  let rear = zone.rearCourse;
  if (!(Number.isInteger(rear) && rear >= 0 && rear < n && rear !== f)) {   // the line most opposite the front one: facing the other way and farthest from it
    const fm = mid(cs[f]), fd = cs[f].dir ?? cs[f].chordDir ?? 0;
    let best = -Infinity; rear = null;
    cs.forEach((c, i) => {
      if (i === f) return;
      const d = c.dir ?? c.chordDir ?? 0, anti = -Math.cos(d - fd), m = mid(c), far = Math.hypot(m.x - fm.x, m.y - fm.y);
      const score = anti > 0.5 ? far : -Infinity;
      if (score > best) { best = score; rear = i; }
    });
  }
  return cs.map((_, i) => {
    const typed = zone.setbacks?.[String(i)];
    if (fin(typed)) return typed;
    return i === f ? zone.front : i === rear ? zone.rear : zone.side;
  });
}

/** The lot taken in from every line by that line's distance, mitred; or why it cannot be. */
export function envelope(parcel, zone) {
  const ring = lotRing(parcel), lotArea = Math.abs(signedArea(ring));
  const dist = courseSetbacks(parcel, zone);
  const per = ring.map((p) => dist[p.course] || 0);   // the distance for the ring edge starting at each point
  const base = { ring, courses: dist.length, distances: dist, lotArea };
  if (per.every((d) => d === 0)) return { ...base, poly: ring.map((p) => ({ x: p.x, y: p.y })), area: lotArea, problem: null, uniform: true };
  const uniform = per.every((d) => Math.abs(d - per[0]) < 1e-12);
  let poly = null, problem = null;
  if (uniform) {   // the same distance all round is a plain offset: featureline.js does it (the lot's interior is to the left, so a negative distance)
    const r = offsetFeature({ pts: ring.map((p) => ({ x: p.x, y: p.y, z: 0 })), closed: true }, -per[0]);
    if (r.f) poly = r.f.pts.map((p) => ({ x: p.x, y: p.y })); else problem = r.problem || 'fold';
  } else {
    const r = mitreInset(ring, per);
    if (r.poly) poly = r.poly; else problem = r.problem;
  }
  if (poly && !(simple(poly) && Math.abs(signedArea(poly)) > 1e-9 && signedArea(poly) > 0 && poly.every((p) => inside(p, ring) || onEdge(p, ring)))) { poly = null; problem = 'fold'; }
  return { ...base, poly, area: poly ? Math.abs(signedArea(poly)) : 0, problem, uniform };
}

/** Per-edge mitre: edge i (ring[i] → ring[i+1]) moved in (to its left) by per[i]; corner i = where edges i−1 and i meet. */
export function mitreInset(ring, per) {
  const n = ring.length, E = [];
  for (let i = 0; i < n; i++) {
    const a = ring[i], b = ring[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1e-12) return { poly: null, problem: 'repeat' };
    const ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, nx = -uy, ny = ux;
    E.push({ px: a.x + nx * per[i], py: a.y + ny * per[i], ux, uy, nx, ny });   // a point on the moved line and its direction
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = E[(i + n - 1) % n], q = E[i], cr = p.ux * q.uy - p.uy * q.ux;
    if (Math.abs(cr) < 1e-9) {   // collinear lines: a straight continuation (two different distances on one straight line step; take the later)
      if (Math.abs((q.px - p.px) * p.nx + (q.py - p.py) * p.ny) > 1e-9) return { poly: null, problem: 'step' };
      out.push({ x: q.px, y: q.py }); continue;
    }
    // p.p + s p.u = q.p + t q.u
    const dx = q.px - p.px, dy = q.py - p.py, s = (dx * q.uy - dy * q.ux) / cr;
    if (Math.abs(s) > 1e7) return { poly: null, problem: 'sharp' };
    out.push({ x: p.px + s * p.ux, y: p.py + s * p.uy });
  }
  // every moved edge must keep its direction (a line that turned round has folded over)
  for (let i = 0; i < n; i++) { const a = out[i], b = out[(i + 1) % n]; if ((b.x - a.x) * E[i].ux + (b.y - a.y) * E[i].uy <= 1e-12) return { poly: null, problem: 'fold' }; }
  return { poly: out, problem: null };
}

function inside(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
function onEdge(p, poly, tol = 1e-7) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1e-12) continue;
    const u = Math.max(0, Math.min(1, ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / (L * L)));
    if (Math.hypot(p.x - a.x - u * (b.x - a.x), p.y - a.y - u * (b.y - a.y)) < tol) return true;
  }
  return false;
}
function simple(poly) {
  const n = poly.length;
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue;
    const a = poly[i], b = poly[(i + 1) % n], c = poly[j], d = poly[(j + 1) % n];
    const d1 = cross(a, b, c), d2 = cross(a, b, d), d3 = cross(c, d, a), d4 = cross(c, d, b);
    if (((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12))) return false;
  }
  return true;
}

// ------------------------------------------------------------------ heights
/** Lowest height the zone allows over a footprint. */
export function allowedHeight(parcel, zone, pts) {
  let height = zone.heightCap > 0 ? zone.heightCap : Infinity, by = zone.heightCap > 0 ? 'cap' : null, at = null;
  if (zone.sky) {
    const ring = lotRing(parcel), cs = courses(parcel.pts);
    const f = Math.min(Math.max(0, zone.frontCourse | 0), cs.length - 1);
    const lines = ringEdges(ring).filter((e) => zone.sky.from === 'all' || e.course === f);
    for (const p of pts) for (const e of lines) {
      const L = Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y);
      if (L < 1e-12) continue;
      const s = ((p.x - e.a.x) * -(e.b.y - e.a.y) + (p.y - e.a.y) * (e.b.x - e.a.x)) / L;   // distance in from the line (the interior is to the left)
      const h = zone.sky.h0 + zone.sky.rise * Math.max(0, s);
      if (h < height) { height = h; by = 'sky'; at = { x: p.x, y: p.y, course: e.course }; }
    }
  }
  return { height, by, at };
}

// ------------------------------------------------------------------ checks
/** Area of a footprint inside the envelope: the envelope cut into triangles, the footprint clipped to each (Sutherland–Hodgman against a convex piece). */
export function insideArea(poly, pts) {
  if (!poly || poly.length < 3) return 0;
  const tri = triangulate(poly);
  let sum = 0;
  for (let i = 0; i < tri.length; i += 3) {
    const T = [poly[tri[i]], poly[tri[i + 1]], poly[tri[i + 2]]];
    sum += Math.abs(signedArea(clipConvex(pts, T)));
  }
  return sum;
}
function clipConvex(subject, clip) {   // clip is counter-clockwise
  let out = subject.map((p) => ({ x: p.x, y: p.y }));
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length], inn = [];
    const side = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    for (let k = 0; k < out.length; k++) {
      const p = out[k], q = out[(k + 1) % out.length], sp = side(p), sq = side(q);
      if (sp >= 0) inn.push(p);
      if ((sp >= 0) !== (sq >= 0)) { const u = sp / (sp - sq); inn.push({ x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u }); }
    }
    out = inn;
  }
  return out;
}

/** Every limit the person typed, against the masses on this lot. */
export function checkMasses(parcel, zone, masses) {
  const env = envelope(parcel, zone), lotArea = env.lotArea, items = [];
  const footprint = masses.reduce((s, m) => s + massArea(m), 0), gfa = masses.reduce((s, m) => s + massGfa(m), 0);
  const coverage = lotArea ? footprint / lotArea : 0, far = lotArea ? gfa / lotArea : 0;
  const any = zone.front || zone.side || zone.rear || Object.keys(zone.setbacks || {}).length;
  if (any) {
    for (const m of masses) {
      if (!env.poly) { items.push({ key: 'setback', ok: false, limit: 0, value: massArea(m), mass: m.id, problem: env.problem }); continue; }
      const out = massArea(m) - insideArea(env.poly, m.pts);
      items.push({ key: 'setback', ok: out <= 1e-6 * Math.max(1, massArea(m)), limit: 0, value: Math.max(0, out), mass: m.id });
    }
  }
  if (zone.heightCap > 0 || zone.sky) {
    for (const m of masses) {
      const a = allowedHeight(parcel, zone, m.pts), h = massHeight(m);
      items.push({ key: 'height', ok: h <= a.height + 1e-9, limit: a.height, value: h, mass: m.id, by: a.by });
    }
  }
  if (zone.far > 0) items.push({ key: 'far', ok: far <= zone.far + 1e-9, limit: zone.far, value: far });
  if (zone.coverage > 0) items.push({ key: 'coverage', ok: coverage <= zone.coverage + 1e-9, limit: zone.coverage, value: coverage });
  return { envelope: env, lotArea, coverage, far, items, ok: items.every((i) => i.ok) };
}
