/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tin.js — TIN surfaces: constrained Delaunay triangulation, elevations, contours, bands, slopes.
 * No DOM. The plain Delaunay step is Delaunator (ISC, vendored); breaklines are forced into it
 * here by edge flipping (Sloan 1993), and Delaunay is restored round them.
 *
 *   buildSurface({ points, breaklines, boundary, maxEdge }) → { surface, report }
 *   surfaceFromFaces({ pts:[{x,y,z}], faces:[[i,j,k]…] })    → { surface, report }   (a TIN read from a file)
 *
 *   surface.stats()                 { points, triangles, minZ, maxZ, meanZ, area2d, area3d, bounds }
 *   surface.elevationAt(x, y)       z or null (outside the surface)
 *   surface.contours(interval, { base }) → [{ z, pts:[{x,y}], closed }]
 *   surface.bands(levels)           → [{ band, loops:[[x,y,x,y…]] }]   one polygon per triangle piece
 *   surface.slopes()                → [{ x, y, slope (rise/run), dir (downhill angle) }] per triangle
 *   surface.triangles()             iterate [ax,ay,az,bx,by,bz,cx,cy,cz]
 *
 * Inputs are in project units (eastings x, northings y). Coordinates are moved to a local origin
 * before triangulating so state-plane values (millions of feet) keep their precision.
 * Points closer than SNAP in plan are one vertex (the first kept, a breakline's elevation wins).
 * Crossing breaklines are split where they cross (the first breakline gives the elevation; a
 * difference over 0.01 is reported). The outer boundary is clipped to the data's convex hull,
 * its corners take the surface's elevation there, it is forced in as edges, and triangles outside
 * it are dropped — so the surface edge follows the boundary exactly. maxEdge > 0 peels long
 * triangles off the outside (never across a breakline).
 */

import { t } from "./i18n.js";
import Delaunator from 'delaunator';
import { orient2d, incircle } from 'robust-predicates';

export const SNAP = 1e-4;
const next = (e) => (e % 3 === 2 ? e - 2 : e + 1);
const prev = (e) => (e % 3 === 0 ? e + 2 : e - 1);

// ---------------------------------------------------------------------------
// Building

export function buildSurface({ points = [], breaklines = [], boundary = null, maxEdge = 0 } = {}) {
  const report = { notes: [], errors: [], skippedNoZ: 0, merged: 0, crossings: 0, zConflicts: 0, constraintFailures: 0 };
  let clipped = null;
  if (boundary && boundary.length >= 3) {
    // pass 1: the surface without the boundary gives the boundary corners their elevations
    const first = triangulate(points, breaklines, null, 0, { notes: [], errors: [], skippedNoZ: 0, merged: 0, crossings: 0, zConflicts: 0, constraintFailures: 0 });
    if (!first.surface) { report.errors.push(...first.report.errors); return { surface: null, report }; }
    const hull = first.surface.hull();
    clipped = clipConvex(ccw(boundary), hull);
    if (clipped.length < 3) { report.errors.push(t('tin.err.bndy')); return { surface: null, report }; }
    if (clipped.length !== boundary.length || clipped.some((p, i) => Math.hypot(p.x - boundary[i]?.x, p.y - boundary[i]?.y) > 1e-9)) {
      if (boundary.some((p) => !pointInPoly(p.x, p.y, hull))) report.notes.push(t('tin.bndy.cut'));
    }
    clipped = clipped.map((p) => ({ x: p.x, y: p.y, z: first.surface.elevationAt(p.x, p.y, 1e-6) }));
    if (clipped.some((p) => p.z === null)) {
      report.errors.push(t('tin.err.bndyz'));
      return { surface: null, report };
    }
  }
  const r = triangulate(points, breaklines, clipped, maxEdge, report);
  return r;
}

function triangulate(points, breaklines, boundary, maxEdge, report) {
  // local origin
  let ox = Infinity, oy = Infinity;
  for (const p of points) if (p.z !== null && p.z !== undefined && Number.isFinite(p.z)) { if (p.x < ox) ox = p.x; if (p.y < oy) oy = p.y; }
  for (const b of breaklines) for (const p of b.pts) { if (p.x < ox) ox = p.x; if (p.y < oy) oy = p.y; }
  if (!Number.isFinite(ox)) { report.errors.push(t('tin.err.noz')); return { surface: null, report }; }
  ox = Math.floor(ox); oy = Math.floor(oy);

  const X = [], Y = [], Z = [], key = new Map();
  const kOf = (x, y) => Math.round(x / SNAP) + ',' + Math.round(y / SNAP);
  const addV = (x, y, z, hard) => {
    const lx = x - ox, ly = y - oy, k = kOf(lx, ly);
    const at = key.get(k);
    if (at !== undefined) {
      if (Math.abs(Z[at] - z) > 1e-3) { report.zConflicts++; if (hard) Z[at] = z; }
      else if (!hard) report.merged++;
      return at;
    }
    key.set(k, X.length); X.push(lx); Y.push(ly); Z.push(z);
    return X.length - 1;
  };
  for (const p of points) {
    if (p.z === null || p.z === undefined || !Number.isFinite(p.z)) { report.skippedNoZ++; continue; }
    addV(p.x, p.y, p.z, false);
  }
  const segs = [];
  for (const b of breaklines) {
    for (let i = 0; i + 1 < b.pts.length; i++) {
      const a = addV(b.pts[i].x, b.pts[i].y, b.pts[i].z, true), c = addV(b.pts[i + 1].x, b.pts[i + 1].y, b.pts[i + 1].z, true);
      if (a !== c) segs.push([a, c, true]);
    }
  }
  const nBreak = segs.length;
  if (boundary) {
    const before = report.merged;
    const ids = boundary.map((p) => addV(p.x, p.y, p.z, false));
    report.merged = before;   // a boundary corner on a point is not a duplicate point
    for (let i = 0; i < ids.length; i++) { const a = ids[i], c = ids[(i + 1) % ids.length]; if (a !== c) segs.push([a, c]); }
  }
  const pieces = splitCrossings(X, Y, Z, segs, key, kOf, report);

  if (X.length < 3) { report.errors.push(t('tin.err.three')); return { surface: null, report }; }
  const coords = new Float64Array(X.length * 2);
  for (let i = 0; i < X.length; i++) { coords[2 * i] = X[i]; coords[2 * i + 1] = -Y[i]; }   // mirrored: Delaunator's triangles come out counter-clockwise in y-up
  const del = new Delaunator(coords);
  if (!del.triangles.length) { report.errors.push(t('tin.err.line')); return { surface: null, report }; }

  const mesh = new Mesh(X, Y, Z, Int32Array.from(del.triangles), Int32Array.from(del.halfedges));
  for (const [a, b] of pieces) if (!mesh.constrain(a, b)) report.constraintFailures++;
  if (pieces.length) mesh.legalizeAll();
  if (report.constraintFailures) report.notes.push(t('tin.constraint', { n: report.constraintFailures }));

  const keep = new Uint8Array(mesh.tri.length / 3).fill(1);
  if (boundary) {
    const poly = boundary.map((p) => ({ x: p.x - ox, y: p.y - oy }));
    for (let t = 0; t < keep.length; t++) {
      const a = mesh.tri[3 * t], b = mesh.tri[3 * t + 1], c = mesh.tri[3 * t + 2];
      if (!pointInPoly((X[a] + X[b] + X[c]) / 3, (Y[a] + Y[b] + Y[c]) / 3, poly)) keep[t] = 0;
    }
  }
  if (maxEdge > 0) mesh.peel(keep, maxEdge);

  const tris = [];
  for (let t = 0; t < keep.length; t++) if (keep[t]) tris.push(mesh.tri[3 * t], mesh.tri[3 * t + 1], mesh.tri[3 * t + 2]);
  if (!tris.length) { report.errors.push(t('tin.err.inside')); return { surface: null, report }; }
  if (report.merged) report.notes.push(t('tin.merged', { n: report.merged }));
  if (report.zConflicts) report.notes.push(t('tin.zconflict', { n: report.zConflicts }));
  if (report.skippedNoZ) report.notes.push(t('tin.noz', { n: report.skippedNoZ }));
  report.breaklineSegments = nBreak;
  const surface = new Surface(Float64Array.from(X), Float64Array.from(Y), Float64Array.from(Z), Int32Array.from(tris), ox, oy);
  surface.constrainedEdges = mesh.constrainedPairs();
  return { surface, report };
}

/** A TIN given as vertices and faces (from LandXML). Faces with a missing vertex are dropped. */
export function surfaceFromFaces({ pts, faces }) {
  const report = { notes: [], errors: [] };
  let ox = Infinity, oy = Infinity;
  for (const p of pts) if (p) { ox = Math.min(ox, p.x); oy = Math.min(oy, p.y); }
  if (!Number.isFinite(ox)) { report.errors.push(t('tin.err.nopts')); return { surface: null, report }; }
  ox = Math.floor(ox); oy = Math.floor(oy);
  const X = new Float64Array(pts.length), Y = new Float64Array(pts.length), Z = new Float64Array(pts.length);
  pts.forEach((p, i) => { if (p) { X[i] = p.x - ox; Y[i] = p.y - oy; Z[i] = p.z; } });
  const tris = [];
  let bad = 0;
  for (const f of faces) {
    if (f.some((i) => !Number.isInteger(i) || i < 0 || i >= pts.length || !pts[i]) || f[0] === f[1] || f[1] === f[2] || f[0] === f[2]) { bad++; continue; }
    let [a, b, c] = f;
    const o = (X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a]);
    if (o === 0) { bad++; continue; }
    if (o < 0) [b, c] = [c, b];   // keep every triangle counter-clockwise
    tris.push(a, b, c);
  }
  if (bad) report.notes.push(t('tin.badfaces', { n: bad }));
  if (!tris.length) { report.errors.push(t('tin.err.nofaces')); return { surface: null, report }; }
  return { surface: new Surface(X, Y, Z, Int32Array.from(tris), ox, oy), report };
}

// ---------------------------------------------------------------------------
// Breakline crossings: split every pair of crossing pieces at the crossing (new vertex)

function splitCrossings(X, Y, Z, segs, key, kOf, report) {
  const n = segs.length;
  const cuts = segs.map(() => []);   // per segment: [{t, v}]
  // sort by minX for a sweep
  const order = segs.map((s, i) => i).sort((i, j) => Math.min(X[segs[i][0]], X[segs[i][1]]) - Math.min(X[segs[j][0]], X[segs[j][1]]));
  const active = [];
  for (const i of order) {
    const [a, b] = segs[i];
    const minX = Math.min(X[a], X[b]);
    for (let k = active.length - 1; k >= 0; k--) { const [c, d] = segs[active[k]]; if (Math.max(X[c], X[d]) < minX - SNAP) active.splice(k, 1); }
    for (const j of active) {
      const [c, d] = segs[j];
      if (a === c || a === d || b === c || b === d) continue;
      const hit = segHit(X[a], Y[a], X[b], Y[b], X[c], Y[c], X[d], Y[d]);
      if (!hit) continue;
      const x = X[a] + (X[b] - X[a]) * hit.t, y = Y[a] + (Y[b] - Y[a]) * hit.t;
      const zi = Z[a] + (Z[b] - Z[a]) * hit.t, zj = Z[c] + (Z[d] - Z[c]) * hit.u;
      const k = kOf(x, y);
      let v = key.get(k);
      // a breakline gives the crossing its elevation; a boundary edge does not
      // between two breaklines the one given first wins
      const z = segs[i][2] && segs[j][2] ? (i < j ? zi : zj) : segs[i][2] ? zi : segs[j][2] ? zj : zi;
      if (v === undefined) { v = X.length; key.set(k, v); X.push(x); Y.push(y); Z.push(z); }
      if (segs[i][2] && segs[j][2] && Math.abs(zi - zj) > 0.01) report.zConflicts++;
      report.crossings++;
      cuts[i].push({ t: hit.t, v }); cuts[j].push({ t: hit.u, v });
    }
    active.push(i);
  }
  const out = [];
  segs.forEach(([a, b], i) => {
    const c = cuts[i].sort((p, q) => p.t - q.t);
    let from = a;
    for (const { v } of c) { if (v !== from) out.push([from, v]); from = v; }
    if (from !== b) out.push([from, b]);
  });
  return out;
}

/** Proper crossing of two segments (not at their ends): {t along the first, u along the second}. */
function segHit(ax, ay, bx, by, cx, cy, dx, dy) {
  const rx = bx - ax, ry = by - ay, sx = dx - cx, sy = dy - cy;
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((cx - ax) * sy - (cy - ay) * sx) / den, u = ((cx - ax) * ry - (cy - ay) * rx) / den;
  const eps = 1e-9;
  if (t <= eps || t >= 1 - eps || u <= eps || u >= 1 - eps) return null;
  return { t, u };
}

// ---------------------------------------------------------------------------
// Half-edge mesh with constraints (triangles counter-clockwise; e → its twin in he[e], -1 on the hull)

class Mesh {
  constructor(X, Y, Z, tri, he) {
    this.X = X; this.Y = Y; this.Z = Z; this.tri = tri; this.he = he;
    this.con = new Uint8Array(he.length);
    this.vmap = new Int32Array(X.length).fill(-1);
    for (let e = 0; e < tri.length; e++) this.vmap[tri[e]] = e;
  }
  orient(a, b, c) { const { X, Y } = this; return -orient2d(X[a], Y[a], X[b], Y[b], X[c], Y[c]); }   // > 0: counter-clockwise (y up)
  mark(e) { this.con[e] = 1; const o = this.he[e]; if (o >= 0) this.con[o] = 1; }

  /** Every half-edge leaving vertex v. */
  around(v) {
    const out = [], start = this.vmap[v];
    if (start < 0) return out;
    let e = start, open = false;
    do { out.push(e); const o = this.he[prev(e)]; if (o < 0) { open = true; break; } e = o; } while (e !== start);
    if (open) {
      // hit the hull: go the other way from the start
      e = start;
      for (;;) { const o = this.he[e]; if (o < 0) break; e = next(o); if (e === start) break; out.push(e); }
    }
    return out;
  }

  /** Forces the edge a–b in. Returns false when it cannot (it would cross another breakline). */
  constrain(a0, b0) {
    const todo = [[a0, b0]];
    let guard = 0;
    while (todo.length) {
      if (++guard > 100000) return false;
      const [p, q] = todo.pop();
      if (p === q) continue;
      if (this.vmap[p] < 0 || this.vmap[q] < 0) return false;
      const r = this.walk(p, q);
      if (r === null) return false;
      if (r.edge !== undefined) { this.mark(r.edge); if (r.rest) todo.push(r.rest); continue; }
      if (!this.flipOut(p, q, r.crossed)) return false;
      if (r.rest) todo.push(r.rest);
    }
    return true;
  }

  /**
   * From p toward q: the existing edge p–q ({edge}), or p–v along an edge with v on the line
   * ({edge, rest:[v,q]}), or the edges the segment crosses up to q or to a vertex on the line
   * ({crossed, rest}). null when a crossed edge is already a constraint.
   */
  walk(p, q) {
    const { tri, he } = this;
    let first = -1;
    for (const e of this.around(p)) {
      const b = tri[next(e)], c = tri[prev(e)];
      if (b === q) return { edge: e };
      if (c === q) return { edge: prev(e) };
      const ob = this.side(p, q, b), oc = this.side(p, q, c);
      if (ob === 0 && this.ahead(p, q, b)) return { edge: e, rest: [b, q] };
      if (oc === 0 && this.ahead(p, q, c)) return { edge: prev(e), rest: [c, q] };
      if (ob < 0 && oc > 0) { first = next(e); break; }   // q is between b (right) and c (left)
    }
    if (first < 0) return null;
    const crossed = [];
    let e = first;
    for (let guard = 0; guard < 1e6; guard++) {
      if (this.con[e]) return null;
      crossed.push(e);
      const o = he[e];
      if (o < 0) return null;
      const v = tri[prev(o)];
      if (v === q) return { crossed, rest: null };
      const ov = this.side(p, q, v);
      if (ov === 0) return { crossed, rest: [v, q], to: v };
      // o runs from the left vertex to the right one; leave through the edge on v's other side
      e = ov > 0 ? next(o) : prev(o);
    }
    return null;
  }
  /** Which side of p→q v is on (1 left, -1 right), 0 when it is within a hair of the line. */
  side(p, q, v) {
    const { X, Y } = this;
    const o = this.orient(p, q, v);
    if (o === 0) return 0;
    const L = Math.hypot(X[q] - X[p], Y[q] - Y[p]);
    if (Math.abs(o) / L < 1e-7 * (1 + L)) return 0;
    return o > 0 ? 1 : -1;
  }
  ahead(p, q, v) {
    const { X, Y } = this;
    const dx = X[q] - X[p], dy = Y[q] - Y[p];
    const t = ((X[v] - X[p]) * dx + (Y[v] - Y[p]) * dy) / (dx * dx + dy * dy);
    return t > 0 && t < 1;
  }

  /** Sloan's flips: swap crossed diagonals until none crosses p–end, then restore Delaunay. */
  flipOut(p, q0, crossed) {
    const { tri } = this;
    // the segment really ends at the last vertex reached (q0 or a vertex on the line, handled by walk's rest)
    let q = q0;
    {
      const last = crossed[crossed.length - 1], o = this.he[last];
      q = tri[prev(o)];
    }
    const queue = crossed.slice(), made = [];
    let guard = 0;
    while (queue.length) {
      if (++guard > 50 * (crossed.length + 10) * (crossed.length + 10)) return false;
      const e = queue.shift();
      if (!this.convex(e)) { queue.push(e); continue; }
      // a flip moves the quad's outer edges c→a and d→b to the ids e and its twin: follow them
      const o = this.he[e], bot = prev(e), top = prev(o);
      for (let i = 0; i < queue.length; i++) { if (queue[i] === bot) queue[i] = o; else if (queue[i] === top) queue[i] = e; }
      const ne = this.flip(e);
      const u = tri[ne], v = tri[next(ne)];
      if (u !== p && u !== q && v !== p && v !== q && this.crosses(p, q, u, v)) queue.push(ne);
      else made.push(ne);
    }
    // mark p–q
    let found = false;
    for (const e of this.around(p)) {
      if (tri[next(e)] === q) { this.mark(e); found = true; break; }
      if (tri[prev(e)] === q) { this.mark(prev(e)); found = true; break; }
    }
    if (!found) return false;
    // restore Delaunay (Lawson) starting from the new edges; edges are kept as vertex pairs because
    // a flip re-uses half-edge ids
    // the cavity's own boundary edges now face new triangles too, so start from every edge of them
    const stack = [];
    for (const e of made) {
      const o = this.he[e];
      for (const f of [e, next(e), prev(e)]) stack.push([tri[f], tri[next(f)]]);
      if (o >= 0) for (const f of [next(o), prev(o)]) stack.push([tri[f], tri[next(f)]]);
    }
    let n = 0;
    while (stack.length && n++ < 200000) {
      const [u, v] = stack.pop();
      const e = this.findEdge(u, v);
      if (e < 0 || this.con[e] || this.he[e] < 0 || !this.illegal(e)) continue;
      const ne = this.flip(e), o = this.he[ne];
      // the four outer edges of the quad may now be illegal
      for (const f of [next(ne), prev(ne), next(o), prev(o)]) stack.push([tri[f], tri[next(f)]]);
    }
    return true;
  }
  /** Lawson flips over the whole mesh until every edge that is not a constraint is locally Delaunay. */
  legalizeAll() {
    const { tri } = this;
    const stack = [];
    for (let e = 0; e < tri.length; e++) if (this.he[e] > e) stack.push([tri[e], tri[next(e)]]);
    let n = 0;
    while (stack.length && n++ < 50 * tri.length) {
      const [u, v] = stack.pop();
      const e = this.findEdge(u, v);
      if (e < 0 || this.con[e] || this.he[e] < 0 || !this.illegal(e)) continue;
      const ne = this.flip(e), o = this.he[ne];
      for (const f of [next(ne), prev(ne), next(o), prev(o)]) stack.push([tri[f], tri[next(f)]]);
    }
  }
  findEdge(u, v) {
    for (const e of this.around(u)) {
      if (this.tri[next(e)] === v) return e;
      if (this.tri[prev(e)] === v) return prev(e);
    }
    return -1;
  }
  crosses(p, q, u, v) {
    const a = this.orient(p, q, u), b = this.orient(p, q, v), c = this.orient(u, v, p), d = this.orient(u, v, q);
    return ((a > 0 && b < 0) || (a < 0 && b > 0)) && ((c > 0 && d < 0) || (c < 0 && d > 0));
  }
  /** The two triangles on e make a strictly convex quadrilateral (so e can be flipped). */
  convex(e) {
    const o = this.he[e];
    if (o < 0) return false;
    const { tri } = this;
    const a = tri[e], b = tri[next(e)], c = tri[prev(e)], d = tri[prev(o)];
    const s1 = this.orient(c, d, a), s2 = this.orient(c, d, b);
    return (s1 > 0 && s2 < 0) || (s1 < 0 && s2 > 0);
  }
  illegal(e) {
    const o = this.he[e];
    if (o < 0) return false;
    const { tri, X, Y } = this;
    const a = tri[e], b = tri[next(e)], c = tri[prev(e)], d = tri[prev(o)];
    return incircle(X[a], Y[a], X[b], Y[b], X[c], Y[c], X[d], Y[d]) > 0 && this.convex(e);
  }
  /** Flips the diagonal e; returns the new diagonal's half-edge in e's old triangle. */
  flip(e) {
    const { tri, he, con } = this;
    const o = he[e];
    const bot = prev(e), lft = next(e), top = prev(o), rgt = next(o);
    const adjBot = he[bot], adjTop = he[top];
    const cBot = con[bot], cTop = con[top];
    // e: a→b, lft: b→c, bot: c→a | o: b→a, rgt: a→d, top: d→b   ⇒   (d,b,c) and (c,a,d)
    tri[e] = tri[top];
    he[e] = adjTop; if (adjTop >= 0) he[adjTop] = e;
    con[e] = cTop;
    tri[o] = tri[bot];
    he[o] = adjBot; if (adjBot >= 0) he[adjBot] = o;
    con[o] = cBot;
    he[bot] = top; he[top] = bot;
    con[bot] = 0; con[top] = 0;
    this.vmap[tri[e]] = e; this.vmap[tri[lft]] = lft; this.vmap[tri[o]] = o; this.vmap[tri[rgt]] = rgt;
    return bot;
  }

  /** Removes outside triangles whose outer edge is longer than maxEdge, working inward. */
  peel(keep, maxEdge) {
    const { tri, he, X, Y, con } = this;
    const len = (e) => Math.hypot(X[tri[next(e)]] - X[tri[e]], Y[tri[next(e)]] - Y[tri[e]]);
    const outer = (e) => { const o = he[e]; return o < 0 || !keep[(o / 3) | 0]; };
    const stack = [];
    for (let e = 0; e < tri.length; e++) if (keep[(e / 3) | 0] && outer(e)) stack.push(e);
    while (stack.length) {
      const e = stack.pop(), t = (e / 3) | 0;
      if (!keep[t] || con[e] || !outer(e) || len(e) <= maxEdge) continue;
      keep[t] = 0;
      for (const f of [3 * t, 3 * t + 1, 3 * t + 2]) { const o = he[f]; if (o >= 0 && keep[(o / 3) | 0]) stack.push(o); }
    }
  }
  constrainedPairs() {
    const out = [];
    for (let e = 0; e < this.tri.length; e++) if (this.con[e] && (this.he[e] < 0 || e < this.he[e])) out.push([this.tri[e], this.tri[next(e)]]);
    return out;
  }
}

// ---------------------------------------------------------------------------
// Surface

export class Surface {
  constructor(X, Y, Z, tris, ox, oy) {
    this.X = X; this.Y = Y; this.Z = Z; this.tris = tris; this.ox = ox; this.oy = oy;
    this.nT = tris.length / 3;
    this.constrainedEdges = [];
    this._grid = null; this._stats = null;
  }

  /** Vertices used by triangles. */
  usedVertices() {
    const used = new Uint8Array(this.X.length);
    for (const i of this.tris) used[i] = 1;
    return used;
  }

  stats() {
    if (this._stats) return this._stats;
    const { X, Y, Z, tris, ox, oy } = this;
    const used = this.usedVertices();
    let n = 0, minZ = Infinity, maxZ = -Infinity, sum = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i < X.length; i++) {
      if (!used[i]) continue;
      n++; sum += Z[i];
      if (Z[i] < minZ) minZ = Z[i]; if (Z[i] > maxZ) maxZ = Z[i];
      if (X[i] < minX) minX = X[i]; if (X[i] > maxX) maxX = X[i]; if (Y[i] < minY) minY = Y[i]; if (Y[i] > maxY) maxY = Y[i];
    }
    let a2 = 0, a3 = 0;
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t], b = tris[t + 1], c = tris[t + 2];
      const ux = X[b] - X[a], uy = Y[b] - Y[a], uz = Z[b] - Z[a], vx = X[c] - X[a], vy = Y[c] - Y[a], vz = Z[c] - Z[a];
      const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      a2 += Math.abs(cz) / 2;
      a3 += Math.hypot(cx, cy, cz) / 2;
    }
    this._stats = { points: n, triangles: this.nT, minZ, maxZ, meanZ: sum / n, area2d: a2, area3d: a3, bounds: { minX: minX + ox, minY: minY + oy, maxX: maxX + ox, maxY: maxY + oy } };
    return this._stats;
  }
  get bounds() { return this.stats().bounds; }

  /** The convex hull of the used vertices, counter-clockwise, in project coordinates. */
  hull() {
    const used = this.usedVertices(), pts = [];
    for (let i = 0; i < this.X.length; i++) if (used[i]) pts.push({ x: this.X[i] + this.ox, y: this.Y[i] + this.oy });
    return convexHull(pts);
  }

  grid() {
    if (this._grid) return this._grid;
    const { X, Y, tris, nT } = this;
    const s = this.stats(), b = { minX: s.bounds.minX - this.ox, minY: s.bounds.minY - this.oy, maxX: s.bounds.maxX - this.ox, maxY: s.bounds.maxY - this.oy };
    const n = Math.max(1, Math.round(Math.sqrt(nT / 2)));
    const w = Math.max(b.maxX - b.minX, 1e-9), h = Math.max(b.maxY - b.minY, 1e-9);
    const nx = Math.max(1, Math.round(n * Math.sqrt(w / h))), ny = Math.max(1, Math.round(n * Math.sqrt(h / w)));
    const cw = w / nx, ch = h / ny;
    const counts = new Int32Array(nx * ny + 1);
    const cells = (t, f) => {
      const a = tris[3 * t], c = tris[3 * t + 1], d = tris[3 * t + 2];
      const x0 = Math.min(X[a], X[c], X[d]), x1 = Math.max(X[a], X[c], X[d]), y0 = Math.min(Y[a], Y[c], Y[d]), y1 = Math.max(Y[a], Y[c], Y[d]);
      const i0 = clampI((x0 - b.minX) / cw, nx), i1 = clampI((x1 - b.minX) / cw, nx), j0 = clampI((y0 - b.minY) / ch, ny), j1 = clampI((y1 - b.minY) / ch, ny);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) f(j * nx + i);
    };
    for (let t = 0; t < nT; t++) cells(t, (k) => counts[k + 1]++);
    for (let k = 1; k < counts.length; k++) counts[k] += counts[k - 1];
    const items = new Int32Array(counts[counts.length - 1]), fill = counts.slice(0, -1);
    for (let t = 0; t < nT; t++) cells(t, (k) => { items[fill[k]++] = t; });
    this._grid = { b, nx, ny, cw, ch, start: counts, items };
    return this._grid;
  }

  /** The triangle under (local) x, y and its barycentric weights, or null. */
  locate(lx, ly, tol = 1e-9) {
    const g = this.grid(), { X, Y, tris } = this;
    if (lx < g.b.minX - tol || lx > g.b.maxX + tol || ly < g.b.minY - tol || ly > g.b.maxY + tol) return null;
    const i = clampI((lx - g.b.minX) / g.cw, g.nx), j = clampI((ly - g.b.minY) / g.ch, g.ny), k = j * g.nx + i;
    let best = null, bestMin = -Infinity;
    for (let s = g.start[k]; s < g.start[k + 1]; s++) {
      const t = g.items[s], a = tris[3 * t], b = tris[3 * t + 1], c = tris[3 * t + 2];
      const d = (Y[b] - Y[c]) * (X[a] - X[c]) + (X[c] - X[b]) * (Y[a] - Y[c]);
      if (d === 0) continue;
      const w1 = ((Y[b] - Y[c]) * (lx - X[c]) + (X[c] - X[b]) * (ly - Y[c])) / d;
      const w2 = ((Y[c] - Y[a]) * (lx - X[c]) + (X[a] - X[c]) * (ly - Y[c])) / d;
      const w3 = 1 - w1 - w2, m = Math.min(w1, w2, w3);
      if (m >= 0) return { t, w: [w1, w2, w3] };
      if (m > bestMin) { bestMin = m; best = { t, w: [w1, w2, w3] }; }
    }
    if (best && tol > 0) {
      // within tol of the triangle in plan (points on the outer edge)
      const t = best.t, a = tris[3 * t], b = tris[3 * t + 1], c = tris[3 * t + 2];
      const scale = Math.max(Math.hypot(X[b] - X[a], Y[b] - Y[a]), Math.hypot(X[c] - X[b], Y[c] - Y[b]), Math.hypot(X[a] - X[c], Y[a] - Y[c]));
      if (-bestMin * scale <= tol) { const w = best.w.map((v) => Math.max(0, v)); const s = w[0] + w[1] + w[2]; return { t, w: w.map((v) => v / s) }; }
    }
    return null;
  }

  elevationAt(x, y, tol = 1e-9) {
    const r = this.locate(x - this.ox, y - this.oy, tol);
    if (!r) return null;
    const { tris, Z } = this, t = r.t;
    return r.w[0] * Z[tris[3 * t]] + r.w[1] * Z[tris[3 * t + 1]] + r.w[2] * Z[tris[3 * t + 2]];
  }

  /** Triangle t's plane: slope (rise/run), downhill direction (radians), gradient. */
  slopeOf(t) {
    const { X, Y, Z, tris } = this;
    const a = tris[3 * t], b = tris[3 * t + 1], c = tris[3 * t + 2];
    const ux = X[b] - X[a], uy = Y[b] - Y[a], uz = Z[b] - Z[a], vx = X[c] - X[a], vy = Y[c] - Y[a], vz = Z[c] - Z[a];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const gx = -nx / nz, gy = -ny / nz;   // dz/dx, dz/dy
    return { slope: Math.hypot(gx, gy), dir: Math.atan2(-gy, -gx), gx, gy };
  }

  slopes() {
    const { X, Y, tris, nT, ox, oy } = this, out = [];
    for (let t = 0; t < nT; t++) {
      const a = tris[3 * t], b = tris[3 * t + 1], c = tris[3 * t + 2];
      const s = this.slopeOf(t);
      out.push({ x: (X[a] + X[b] + X[c]) / 3 + ox, y: (Y[a] + Y[b] + Y[c]) / 3 + oy, slope: s.slope, dir: s.dir, size: Math.sqrt(Math.abs((X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a])) / 2) });
    }
    return out;
  }

  /** Contour polylines every `interval` (levels at base + k·interval), joined across triangles. */
  contours(interval, { base = 0, maxLevels = 2000 } = {}) {
    if (!(interval > 0)) return [];
    const { X, Y, Z, tris, ox, oy } = this, s = this.stats();
    const k0 = Math.ceil((s.minZ - base) / interval - 1e-9), k1 = Math.floor((s.maxZ - base) / interval + 1e-9);
    if (k1 - k0 > maxLevels) return null;
    const out = [];
    const eps = interval * 1e-7;
    const tiny = 1e-6 * Math.hypot(s.bounds.maxX - s.bounds.minX, s.bounds.maxY - s.bounds.minY);
    for (let k = k0; k <= k1; k++) {
      const L = base + k * interval;
      const zv = (i) => (Math.abs(Z[i] - L) < eps ? L + eps : Z[i]);   // a vertex exactly on the level counts as just above it
      const segs = [];   // [keyA, keyB, ax, ay, bx, by]
      const cross = (i, j) => {
        const zi = zv(i), zj = zv(j);
        if ((zi > L) === (zj > L)) return null;
        const t = (L - zi) / (zj - zi);
        return { k: i < j ? i + '_' + j : j + '_' + i, x: X[i] + (X[j] - X[i]) * t, y: Y[i] + (Y[j] - Y[i]) * t };
      };
      for (let t = 0; t < tris.length; t += 3) {
        const a = tris[t], b = tris[t + 1], c = tris[t + 2];
        const za = zv(a), zb = zv(b), zc = zv(c);
        if ((za > L && zb > L && zc > L) || (za < L && zb < L && zc < L)) continue;
        const hits = [cross(a, b), cross(b, c), cross(c, a)].filter(Boolean);
        if (hits.length === 2) segs.push(hits);
      }
      for (const line of chain(segs)) if (extent(line.pts) > tiny) out.push({ z: L, pts: line.pts.map((p) => ({ x: p.x + ox, y: p.y + oy })), closed: line.closed });
    }
    return out;
  }

  /** Elevation band pieces: levels ascending [l0, l1, …]; band i is l(i) ≤ z < l(i+1) (below l0 = -1). */
  bands(levels) {
    const { X, Y, Z, tris, ox, oy } = this, out = [];
    for (let t = 0; t < tris.length; t += 3) {
      const v = [tris[t], tris[t + 1], tris[t + 2]].map((i) => [X[i] + ox, Y[i] + oy, Z[i]]);
      const zmin = Math.min(v[0][2], v[1][2], v[2][2]), zmax = Math.max(v[0][2], v[1][2], v[2][2]);
      let bi = bandIndex(levels, zmin);
      const bj = bandIndex(levels, zmax);
      if (bi === bj) { out.push({ band: bi, loop: v.flatMap((p) => [p[0], p[1]]) }); continue; }
      for (; bi <= bj; bi++) {
        let poly = v;
        if (bi >= 0) poly = clipZ(poly, levels[bi], 1);
        if (bi + 1 < levels.length) poly = clipZ(poly, levels[bi + 1], -1);
        if (poly.length >= 3) out.push({ band: bi, loop: poly.flatMap((p) => [p[0], p[1]]) });
      }
    }
    return out;
  }

  *triangles() {
    const { X, Y, Z, tris, ox, oy } = this;
    for (let t = 0; t < tris.length; t += 3) {
      const a = tris[t], b = tris[t + 1], c = tris[t + 2];
      yield [X[a] + ox, Y[a] + oy, Z[a], X[b] + ox, Y[b] + oy, Z[b], X[c] + ox, Y[c] + oy, Z[c]];
    }
  }

  /** Unique edges as vertex pairs (for drawing the triangles once). */
  edges() {
    const { tris } = this, seen = new Set(), out = [];
    for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) {
      const a = tris[t + k], b = tris[t + (k + 1) % 3], key = a < b ? a * 4294967296 + b : b * 4294967296 + a;
      if (seen.has(key)) continue;
      seen.add(key); out.push(a, b);
    }
    return out;
  }

  /** The outer edge(s) of the surface as closed loops (project coordinates). */
  outline() {
    const { tris, X, Y, ox, oy } = this, count = new Map();
    for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) {
      const a = tris[t + k], b = tris[t + (k + 1) % 3];
      count.set(a + '_' + b, 1);
    }
    const nextOf = new Map();
    for (const k of count.keys()) { const [a, b] = k.split('_'); if (!count.has(b + '_' + a)) nextOf.set(+a, +b); }
    const loops = [];
    while (nextOf.size) {
      const [s] = nextOf.keys(); const loop = [];
      let v = s;
      for (let g = 0; g < 1e7 && nextOf.has(v); g++) { loop.push({ x: X[v] + ox, y: Y[v] + oy }); const n = nextOf.get(v); nextOf.delete(v); v = n; }
      if (loop.length >= 3) loops.push(loop);
    }
    return loops;
  }

  /** Vertices in project coordinates [{x,y,z}] and faces [[i,j,k]] (for LandXML). */
  toFaces() {
    const used = this.usedVertices(), map = new Int32Array(this.X.length).fill(-1), pts = [];
    for (let i = 0; i < this.X.length; i++) if (used[i]) { map[i] = pts.length; pts.push({ x: this.X[i] + this.ox, y: this.Y[i] + this.oy, z: this.Z[i] }); }
    const faces = [];
    for (let t = 0; t < this.tris.length; t += 3) faces.push([map[this.tris[t]], map[this.tris[t + 1]], map[this.tris[t + 2]]]);
    return { pts, faces };
  }
}

/** Size of a point list's box (a level that only touches a peak or pit leaves a dot-sized loop: dropped). */
function extent(pts) { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of pts) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); } return Math.max(c - a, d - b); }
function clampI(v, n) { const i = Math.floor(v); return i < 0 ? 0 : i >= n ? n - 1 : i; }
function bandIndex(levels, z) { let i = -1; while (i + 1 < levels.length && z >= levels[i + 1]) i++; return i; }
/** Keeps the part of a triangle polygon [x,y,z] with sign·(z − L) ≥ 0. */
function clipZ(poly, L, sign) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const fp = sign * (p[2] - L), fq = sign * (q[2] - L);
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, L]); }
  }
  return out;
}

/** Joins two-point segments that share edge keys into polylines. */
function chain(segs) {
  const at = new Map();
  segs.forEach((s, i) => { for (const h of s) { const a = at.get(h.k); if (a) a.push(i); else at.set(h.k, [i]); } });
  const used = new Uint8Array(segs.length), out = [];
  const follow = (i, fromKey) => {
    const pts = [];
    let cur = i, k = fromKey;
    for (;;) {
      used[cur] = 1;
      const s = segs[cur];
      const nextH = s[0].k === k ? s[1] : s[0];
      pts.push(nextH);
      const list = at.get(nextH.k) || [];
      const n = list.find((j) => !used[j]);
      if (n === undefined) return { pts, end: nextH.k };
      cur = n; k = nextH.k;
    }
  };
  // open lines start at keys used once
  for (const [k, list] of at) {
    if (list.length !== 1 || used[list[0]]) continue;
    const s = segs[list[0]], startH = s[0].k === k ? s[0] : s[1];
    const r = follow(list[0], k);
    out.push({ pts: [startH, ...r.pts], closed: false });
  }
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    const s = segs[i];
    const r = follow(i, s[0].k);
    out.push({ pts: [s[0], ...r.pts], closed: true });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Plane geometry helpers (exported for grading and the UI)

export function convexHull(pts) {
  const p = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return p;
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  lo.pop(); hi.pop();
  return lo.concat(hi);
}
export function polyArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; }
export function ccw(pts) { return polyArea(pts) < 0 ? pts.slice().reverse() : pts.slice(); }
export function pointInPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
/** Sutherland–Hodgman: subject polygon clipped by a convex counter-clockwise polygon. */
export function clipConvex(subject, clip) {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const inside = (p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-9;
    const inp = out; out = [];
    for (let k = 0; k < inp.length; k++) {
      const p = inp[k], q = inp[(k + 1) % inp.length];
      const ip = inside(p), iq = inside(q);
      if (ip) out.push(p);
      if (ip !== iq) {
        const dx = q.x - p.x, dy = q.y - p.y, ex = b.x - a.x, ey = b.y - a.y;
        const t = ((a.x - p.x) * ey - (a.y - p.y) * ex) / (dx * ey - dy * ex);
        out.push({ x: p.x + dx * t, y: p.y + dy * t });
      }
    }
  }
  // drop repeats
  return out.filter((p, i) => { const q = out[(i + 1) % out.length]; return Math.hypot(p.x - q.x, p.y - q.y) > 1e-9; });
}
