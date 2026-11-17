// SPDX-License-Identifier: Apache-2.0
/**
 * face.js: the face of a wall as a flat surface (0.10 BK.25; session bim-finishes-10). Host-free: plain wall rows in, plain numbers out.
 * No DOM, no file format, no imports. Lengths mm, areas mm2.
 *
 * Every number on a face is in FACE COORDINATES (s, v): s = distance along the wall's centre line from its START (a) towards its end (b),
 * v = height above the wall's base. The same two numbers describe the left and the right face of a wall (left and right as seen going
 * from a to b), so a zone does not change when the wall moves, is turned, or has its type swapped (the face is 'thicker' or 'thinner'
 * by the type's thickness only: s and v do not change).
 *
 *   wall  { guid, a: [x, y], b: [x, y], t (thickness), height, bulge? (not 0 = curved: refused) }
 *   FACES = ['left', 'right']
 *   faceFrame(wall, face)  → { face, origin: [x, y] (plan point at s = 0 on the face), dir: [x, y] (unit, along s), normal: [x, y] (unit, out of the wall),
 *                              len (centre-line length), h (half the thickness) }
 *   planPoint(frame, s)    → [x, y] on the face at s
 *   viewerU(frame, s)      → the distance from the face's LEFT edge as a person standing in front of it sees it (left face: len - s; right face: s)
 *   extent(wall, face, poly?) → [s0, s1] the face really spans: the whole centre line, or less/more where a mitre or a butt join cuts it
 *                              (poly = the wall's outline from the host: the points on the face's own line are the face)
 *   rect(s0, s1, v0, v1)   → a normalised rectangle { s0, s1, v0, v1 } (s0 <= s1, v0 <= v1)
 *   area(r) · inter(r, q) → the overlap rectangle or null · subtract(r, holes) → [rect] r less the holes (non-overlapping rectangles)
 *   areaOf(rects) → the summed area of NON-overlapping rectangles
 *   openingRect(wall, o, frame?) → the opening { offset (from a along the wall), width, sill (above the wall base), height } as a rectangle
 */
export const FACES = ['left', 'right'];
const EPS = 1e-6;

export function faceFrame(wall, face) {
  if (!FACES.includes(face)) throw Object.assign(new Error('finishes.err.face'), { key: 'finishes.err.face' });
  if (wall.bulge) throw Object.assign(new Error('finishes.err.curved'), { key: 'finishes.err.curved' });
  const dx = wall.b[0] - wall.a[0], dy = wall.b[1] - wall.a[1], len = Math.hypot(dx, dy);
  if (!(len > EPS)) throw Object.assign(new Error('finishes.err.short'), { key: 'finishes.err.short' });
  const dir = [dx / len, dy / len], n = [-dir[1], dir[0]], h = (wall.t || 0) / 2;
  const sg = face === 'left' ? 1 : -1;
  return { face, origin: [wall.a[0] + n[0] * h * sg, wall.a[1] + n[1] * h * sg], dir, normal: [n[0] * sg, n[1] * sg], len, h };
}
export const planPoint = (f, s) => [f.origin[0] + f.dir[0] * s, f.origin[1] + f.dir[1] * s];
export const viewerU = (f, s) => (f.face === 'left' ? f.len - s : s);

export function extent(wall, face, poly = null) {
  const f = faceFrame(wall, face);
  if (!poly || poly.length < 3) return [0, f.len];
  const sg = face === 'left' ? 1 : -1, out = [];
  for (const p of poly) {
    const px = p[0] - wall.a[0], py = p[1] - wall.a[1];
    const lat = (px * -f.dir[1] + py * f.dir[0]) * sg, s = px * f.dir[0] + py * f.dir[1];
    if (Math.abs(lat - f.h) < 0.6) out.push(s);
  }
  if (out.length < 2) return [0, f.len];
  const s0 = Math.min(...out), s1 = Math.max(...out);
  return s1 - s0 > EPS ? [s0, s1] : [0, f.len];
}

export const rect = (s0, s1, v0, v1) => ({ s0: Math.min(s0, s1), s1: Math.max(s0, s1), v0: Math.min(v0, v1), v1: Math.max(v0, v1) });
export const area = (r) => Math.max(0, r.s1 - r.s0) * Math.max(0, r.v1 - r.v0);
export function inter(r, q) {
  const s0 = Math.max(r.s0, q.s0), s1 = Math.min(r.s1, q.s1), v0 = Math.max(r.v0, q.v0), v1 = Math.min(r.v1, q.v1);
  return s1 - s0 > EPS && v1 - v0 > EPS ? { s0, s1, v0, v1 } : null;
}
/** r less every hole: a list of rectangles that do not overlap each other. */
export function subtract(r, holes = []) {
  let parts = [r];
  for (const h of holes) {
    const next = [];
    for (const p of parts) {
      const i = inter(p, h);
      if (!i) { next.push(p); continue; }
      if (i.v0 - p.v0 > EPS) next.push({ s0: p.s0, s1: p.s1, v0: p.v0, v1: i.v0 });
      if (p.v1 - i.v1 > EPS) next.push({ s0: p.s0, s1: p.s1, v0: i.v1, v1: p.v1 });
      if (i.s0 - p.s0 > EPS) next.push({ s0: p.s0, s1: i.s0, v0: i.v0, v1: i.v1 });
      if (p.s1 - i.s1 > EPS) next.push({ s0: i.s1, s1: p.s1, v0: i.v0, v1: i.v1 });
    }
    parts = next;
  }
  return parts;
}
export const areaOf = (rects) => rects.reduce((s, r) => s + area(r), 0);
export const openingRect = (o) => rect(o.offset, o.offset + o.width, o.sill || 0, (o.sill || 0) + o.height);
