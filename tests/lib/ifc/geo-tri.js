/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library. */
/**
 * geo-tri.js — triangulating a planar polygon with holes by ear clipping. Each hole is first joined to the outer ring by
 * a bridge to a vertex it can see (the ray-cast rule: from the hole's right-most vertex to the right), which makes one
 * ring; ears are then cut, convex ears with no other vertex inside. Duplicate and collinear points are dropped; a ring
 * that cannot be finished (self-crossing input) is closed with a fan rather than lost.
 *
 *   triangulate(outer, holes = []) → [i, j, k, …]  indexes into [...outer, ...holes.flat()]   (points [x, y])
 *   planeTriangulate(rings3d)     → same for 3D rings on one plane (projected onto their best plane)
 */

import { newell } from './geo-math.js';

export function triangulate(outer, holes = []) {
  const pts = [], rings = [];
  let base = 0;
  for (const r of [outer, ...holes]) { rings.push({ start: base, n: r.length }); for (const p of r) pts.push(p); base += r.length; }
  if (outer.length < 3) return [];
  const area = (r) => { let s = 0; for (let i = r.start, e = r.start + r.n; i < e; i++) { const a = pts[i], b = pts[i + 1 < e ? i + 1 : r.start]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };

  let head = ring(pts, rings[0], area(rings[0]) > 0);
  if (!head) return [];
  const hs = [];
  for (let h = 1; h < rings.length; h++) {
    if (rings[h].n < 3) continue;
    const node = ring(pts, rings[h], area(rings[h]) < 0);
    if (node) hs.push(rightmost(node));
  }
  hs.sort((a, b) => b.x - a.x);
  for (const h of hs) { const r = bridgeHole(h, head); if (r) head = r; }

  const out = [];
  clip(head, out);
  return out;
}

class Node {
  constructor(i, x, y) { this.i = i; this.x = x; this.y = y; this.prev = null; this.next = null; }
}

/** A closed linked ring of ring r's points, in counter-clockwise order when ccw (else clockwise). Drops repeats. */
function ring(pts, r, keepOrder) {
  let last = null, first = null;
  const add = (i) => {
    const p = pts[i];
    if (last && last.x === p[0] && last.y === p[1]) return;
    const n = new Node(i, p[0], p[1]);
    if (!last) { first = n; n.prev = n; n.next = n; }
    else { n.next = last.next; n.prev = last; last.next.prev = n; last.next = n; }
    last = n;
  };
  if (keepOrder) for (let i = r.start; i < r.start + r.n; i++) add(i);
  else for (let i = r.start + r.n - 1; i >= r.start; i--) add(i);
  if (last && first !== last && last.x === first.x && last.y === first.y) remove(last), (last = last.prev);
  if (!first || first.next === first || first.next.next === first) return null;
  return first;
}

function remove(n) { n.prev.next = n.next; n.next.prev = n.prev; }

function rightmost(n) { let r = n, p = n; do { if (p.x > r.x || (p.x === r.x && p.y < r.y)) r = p; p = p.next; } while (p !== n); return r; }

const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

function inTri(a, b, c, p) {
  return cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0;
}

/** Join a hole (rightmost vertex m) to the outer ring; → the outer ring's head. */
function bridgeHole(m, outer) {
  // the nearest edge crossing the ray from m to +x
  let p = outer, best = null, qx = Infinity;
  do {
    const a = p, b = p.next;
    if ((a.y <= m.y && b.y >= m.y) || (b.y <= m.y && a.y >= m.y)) {
      if (a.y !== b.y) {
        const x = a.x + (m.y - a.y) * (b.x - a.x) / (b.y - a.y);
        if (x >= m.x && x < qx) { qx = x; best = a.x > b.x ? a : b; if (x === m.x) break; }
      } else if (Math.min(a.x, b.x) >= m.x && Math.min(a.x, b.x) < qx) { qx = Math.min(a.x, b.x); best = a.x < b.x ? a : b; }
    }
    p = p.next;
  } while (p !== outer);
  if (!best) return outer;
  // a vertex inside the triangle (m, hit, best) with the smallest angle to the ray is visible instead
  const hit = { x: qx, y: m.y };
  let sel = best, tanMin = Infinity;
  p = outer;
  do {
    if (p !== best && m.x <= p.x && p.x <= best.x) {
      const inside = m.y < best.y ? inTri(m, hit, best, p) || inTri(m, best, hit, p) : inTri(m, best, hit, p) || inTri(m, hit, best, p);
      if (inside && !(p.x === m.x && p.y === m.y)) {
        const tan = Math.abs(m.y - p.y) / (p.x - m.x || 1e-300);
        if (tan < tanMin || (tan === tanMin && p.x > sel.x)) { tanMin = tan; sel = p; }
      }
    }
    p = p.next;
  } while (p !== outer);
  split(sel, m);
  return outer;
}

/** Link a and b with a bridge (two new nodes duplicate them): the rings become one. */
function split(a, b) {
  const a2 = new Node(a.i, a.x, a.y), b2 = new Node(b.i, b.x, b.y);
  const an = a.next, bp = b.prev;
  a.next = b; b.prev = a;
  a2.next = an; an.prev = a2;
  b2.next = a2; a2.prev = b2;
  bp.next = b2; b2.prev = bp;
}

function isEar(e) {
  const a = e.prev, b = e, c = e.next;
  if (cross(a, b, c) <= 0) return false;
  let p = c.next;
  while (p !== a) {
    if (p.i !== a.i && p.i !== b.i && p.i !== c.i && (p.x !== a.x || p.y !== a.y) && (p.x !== c.x || p.y !== c.y) && (p.x !== b.x || p.y !== b.y) && inTri(a, b, c, p) && cross(p.prev, p, p.next) <= 0) return false;
    p = p.next;
  }
  return true;
}

function clip(start, out) {
  let e = start, stop = start, guard = 0, count = 0;
  { let p = start; do { count++; p = p.next; } while (p !== start); }
  const limit = count * count + 10;
  while (e.prev !== e.next) {
    if (++guard > limit) break;
    const a = e.prev, c = e.next;
    // drop repeated points and zero-width spikes; a point in a straight run stays (a neighbour face shares it: removing
    // it would leave a T-junction) and becomes an ear once a neighbour is cut away
    if (cross(a, e, c) === 0 && !between(a, e, c)) { remove(e); count--; if (e === stop) stop = c; e = c; if (count < 3) return; continue; }
    if (isEar(e)) {
      out.push(a.i, e.i, c.i);
      remove(e); count--;
      e = c.next; stop = e;
      if (count < 3) return;
      continue;
    }
    e = e.next;
    if (e === stop) {
      // no ear found in a whole turn: self-crossing or degenerate input; finish with a fan so nothing is lost
      let p = e.next;
      while (p.next !== e) { if (cross(e, p, p.next) !== 0) out.push(e.i, p.i, p.next.i); p = p.next; }
      return;
    }
  }
}

/** Is b strictly inside segment a–c (a straight run, not a spike or a repeat)? */
function between(a, b, c) {
  if ((a.x === b.x && a.y === b.y) || (c.x === b.x && c.y === b.y)) return false;
  return (b.x - a.x) * (c.x - b.x) + (b.y - a.y) * (c.y - b.y) > 0;
}

function onSegment(a, b, c) {
  return Math.min(a.x, c.x) <= b.x && b.x <= Math.max(a.x, c.x) && Math.min(a.y, c.y) <= b.y && b.y <= Math.max(a.y, c.y);
}

/** Triangulate 3D rings on (about) one plane: [outer, ...holes] of [x, y, z] → indexes into their concatenation. */
export function planeTriangulate(rings) {
  if (!rings.length || rings[0].length < 3) return [];
  const n = newell(rings[0]);
  const ax = Math.abs(n[0]), ay = Math.abs(n[1]), az = Math.abs(n[2]);
  // drop the largest axis; keep the winding consistent with the normal
  let proj;
  if (az >= ax && az >= ay) proj = n[2] >= 0 ? (p) => [p[0], p[1]] : (p) => [p[1], p[0]];
  else if (ax >= ay) proj = n[0] >= 0 ? (p) => [p[1], p[2]] : (p) => [p[2], p[1]];
  else proj = n[1] >= 0 ? (p) => [p[2], p[0]] : (p) => [p[0], p[2]];
  if (rings.length === 1 && rings[0].length === 3) return [0, 1, 2];
  const r2 = rings.map((r) => r.map(proj));
  return triangulate(r2[0], r2.slice(1));
}
