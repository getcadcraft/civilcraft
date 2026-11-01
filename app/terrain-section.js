/* SPDX-License-Identifier: Apache-2.0 */
/**
 * terrain-section.js — a section cut from a TIN along any polyline (0.8 SU.957 river sections; shared with SU.914 free
 * sections). No DOM, no strings, no dependencies: it reads only the Surface's public shape (X, Y, tris, ox, oy, grid(),
 * elevationAt()) from tin.js. Tested by bin/test-civilcraft-river.mjs § terrain-section.
 *
 * Words: the LINE is the polyline the section follows (project coordinates, ≥ 2 vertices). d = distance along the line from
 * its first vertex. o = the OFFSET = d − origin (so a section across a centreline gets o = 0 where it crosses, negative to
 * the left of the crossing and positive to the right when the line is drawn left to right).
 *
 *   cutSection(surface, line, { origin = 0 }) → { length, origin, runs: [[{ d, o, x, y, z, k }]], breaks }
 *       EXACT: a vertex wherever the line crosses a triangle edge (k 'edge'), at the line's own vertices (k 'vertex') and its
 *       ends (k 'end'); the TIN is flat in between, so nothing else is needed. Split into runs where the line leaves the
 *       surface (holes, outside the boundary). Points closer than 1e-9 of the line's length merge. `breaks` = edge crossings.
 *   lineLength(line) → number
 *   pointAt(line, d) → { x, y, dir }            dir = the segment's direction (radians, x axis = 0, counter-clockwise)
 *   locateOn(line, p) → { d, off, x, y, dir }   the nearest point of the line to p; off > 0 when p is to the RIGHT of the
 *       line's direction (as alignment.stationOffset and sections.js)
 *   crossing(a, b) → { da, db, x, y } | null   the first place polyline a crosses polyline b (da, db = distances on each)
 *   squareAcross(line, d, left, right) → [p, q]   a straight line square to `line` at d: p `left` to its left, q `right`
 *       to its right (so it runs left to right looking along the line)
 *   zAt(runs, o) → z | null                     linear between the section's points
 *   lowest(runs) → { o, z } | null              the thalweg of a section
 *   flatten(runs) → [{ o, z }]                  all runs as one list (gaps closed by straight lines; caller's choice)
 */

const EPS = 1e-12;

export function lineLength(line) {
  let L = 0;
  for (let i = 1; i < (line?.length || 0); i++) L += Math.hypot(line[i].x - line[i - 1].x, line[i].y - line[i - 1].y);
  return L;
}

export function pointAt(line, d) {
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const p = line[i - 1], q = line[i], l = Math.hypot(q.x - p.x, q.y - p.y);
    if (l <= 0) continue;
    if (d <= acc + l || i === line.length - 1) {
      const u = Math.max(0, Math.min(1, (d - acc) / l));
      return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, dir: Math.atan2(q.y - p.y, q.x - p.x) };
    }
    acc += l;
  }
  const p = line[0];
  return { x: p.x, y: p.y, dir: 0 };
}

export function locateOn(line, p) {
  let best = null, acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, l = Math.sqrt(l2);
    if (l2 <= 0) continue;
    const u = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
    const x = a.x + dx * u, y = a.y + dy * u, dist = Math.hypot(p.x - x, p.y - y);
    if (!best || dist < best.dist - 1e-12) {
      const cross = dx * (p.y - a.y) - dy * (p.x - a.x);   // > 0: p is to the left
      best = { d: acc + u * l, off: cross > 0 ? -dist : dist, x, y, dir: Math.atan2(dy, dx), dist };
    }
    acc += l;
  }
  if (!best) return null;
  delete best.dist;
  return best;
}

function segCross(px, py, rx, ry, qx, qy, sx, sy) {   // p + t·r vs q + u·s → [t, u] in [0,1]² or null
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-15) return null;
  const t = ((qx - px) * sy - (qy - py) * sx) / den, u = ((qx - px) * ry - (qy - py) * rx) / den;
  return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS ? [Math.max(0, Math.min(1, t)), Math.max(0, Math.min(1, u))] : null;
}

export function crossing(a, b) {
  let accA = 0;
  for (let i = 1; i < a.length; i++) {
    const p = a[i - 1], q = a[i], la = Math.hypot(q.x - p.x, q.y - p.y);
    let accB = 0, hit = null;
    for (let j = 1; j < b.length; j++) {
      const r = b[j - 1], s = b[j], lb = Math.hypot(s.x - r.x, s.y - r.y);
      const c = segCross(p.x, p.y, q.x - p.x, q.y - p.y, r.x, r.y, s.x - r.x, s.y - r.y);
      if (c && (!hit || c[0] < hit.t)) hit = { t: c[0], da: accA + c[0] * la, db: accB + c[1] * lb, x: p.x + (q.x - p.x) * c[0], y: p.y + (q.y - p.y) * c[0] };
      accB += lb;
    }
    if (hit) { delete hit.t; return hit; }
    accA += la;
  }
  return null;
}

export function squareAcross(line, d, left, right) {
  const p = pointAt(line, d);
  const rx = Math.sin(p.dir), ry = -Math.cos(p.dir);   // right of the direction (y up)
  return [{ x: p.x - rx * left, y: p.y - ry * left }, { x: p.x + rx * right, y: p.y + ry * right }];
}

function segHitsBox(ax, ay, bx, by, x0, y0, x1, y1) {   // Liang–Barsky
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return true;
}

/** Parameters t in [0, 1] where the segment a→b (local coordinates) crosses triangle edges. */
function edgeParams(surface, ax, ay, bx, by) {
  const { X, Y, tris } = surface, out = [];
  const g = surface.grid();
  const clampI = (v, n) => Math.max(0, Math.min(n - 1, Math.floor(v)));
  const x0 = Math.min(ax, bx), x1 = Math.max(ax, bx), y0 = Math.min(ay, by), y1 = Math.max(ay, by);
  if (x1 < g.b.minX || x0 > g.b.maxX || y1 < g.b.minY || y0 > g.b.maxY) return out;
  const i0 = clampI((x0 - g.b.minX) / g.cw, g.nx), i1 = clampI((x1 - g.b.minX) / g.cw, g.nx);
  const j0 = clampI((y0 - g.b.minY) / g.ch, g.ny), j1 = clampI((y1 - g.b.minY) / g.ch, g.ny);
  const dx = bx - ax, dy = by - ay, seen = new Set();
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const cx0 = g.b.minX + i * g.cw, cy0 = g.b.minY + j * g.ch;
    if (!segHitsBox(ax, ay, bx, by, cx0, cy0, cx0 + g.cw, cy0 + g.ch)) continue;
    const k = j * g.nx + i;
    for (let s = g.start[k]; s < g.start[k + 1]; s++) {
      const tri = g.items[s];
      if (seen.has(tri)) continue;
      seen.add(tri);
      for (let e = 0; e < 3; e++) {
        const p = tris[3 * tri + e], q = tris[3 * tri + ((e + 1) % 3)];
        const c = segCross(ax, ay, dx, dy, X[p], Y[p], X[q] - X[p], Y[q] - Y[p]);
        if (c) out.push(c[0]);
      }
    }
  }
  return out;
}

export function cutSection(surface, line, { origin = 0 } = {}) {
  const length = lineLength(line);
  const res = { length, origin, runs: [], breaks: 0 };
  if (!surface || !Array.isArray(line) || line.length < 2 || !(length > 0)) return res;
  const { ox, oy } = surface;
  const cand = [];   // { d, x, y, k }
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    if (!(l > 0)) continue;
    cand.push({ d: acc, x: a.x, y: a.y, k: i === 1 ? 'end' : 'vertex' });
    for (const t of edgeParams(surface, a.x - ox, a.y - oy, b.x - ox, b.y - oy)) {
      if (t <= EPS || t >= 1 - EPS) continue;
      cand.push({ d: acc + t * l, x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, k: 'edge' });
    }
    acc += l;
  }
  const last = line[line.length - 1];
  cand.push({ d: length, x: last.x, y: last.y, k: 'end' });
  cand.sort((u, v) => u.d - v.d);
  const tol = Math.max(1e-9 * length, 1e-12);
  let run = null, prev = -Infinity;
  for (const c of cand) {
    if (c.d - prev < tol) {   // merge: keep the stronger kind (end > vertex > edge)
      const r = run?.[run.length - 1];
      if (r && c.k !== 'edge') r.k = r.k === 'end' || c.k === 'end' ? 'end' : 'vertex';
      continue;
    }
    prev = c.d;
    const z = surface.elevationAt(c.x, c.y, 1e-7);
    if (z === null) { run = null; continue; }
    if (!run) res.runs.push((run = []));
    run.push({ d: c.d, o: c.d - origin, x: c.x, y: c.y, z, k: c.k });
    if (c.k === 'edge') res.breaks++;
  }
  res.runs = res.runs.filter((r) => r.length >= 2);
  return res;
}

export function zAt(runs, o) {
  for (const r of runs) {
    if (o < r[0].o - 1e-9 || o > r[r.length - 1].o + 1e-9) continue;
    for (let i = 1; i < r.length; i++) {
      if (o <= r[i].o + 1e-9) { const p = r[i - 1], q = r[i], d = q.o - p.o; return d > 0 ? p.z + ((q.z - p.z) * (o - p.o)) / d : q.z; }
    }
  }
  return null;
}

export function lowest(runs) {
  let best = null;
  for (const r of runs) for (const p of r) if (!best || p.z < best.z) best = { o: p.o, z: p.z };
  return best;
}

export function flatten(runs) {
  const out = [];
  for (const r of runs) for (const p of r) out.push({ o: p.o, z: p.z });
  return out;
}
