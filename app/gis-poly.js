/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-poly.js — 2D polygon sets for the GIS analysis tools (0.9 SU.1080). No DOM, no imports. Own code (an edge-split and
 * edge-classification boolean, the textbook method; no library, nothing copied). Canonical in lib/gis/; byte-identical copies
 * are made by tools/gis/sync.mjs.
 *
 *   A "multi" is an array of polygons; a polygon is [outer ring, hole ring, …]; a ring is a closed list of [x, y] (first = last).
 *   Inputs may wind either way (rings are re-wound); the members of one multi must not overlap each other (a valid multipolygon).
 *   Outputs: outer rings counter-clockwise, holes clockwise. Z is not kept (the analysis is plan-view).
 *
 *   area(multi) · perimeter(multi) · ringArea(ring) signed (CCW +) · pointIn(multi, x, y) → true inside (boundary counts as in
 *     only by luck of the ray: ask onBoundary first) · bbox(multi)
 *   union(a, b) · intersect(a, b) · difference(a, b) → multi    (a − b)
 *   unionAll(list of multis) → multi                            balanced pairwise union
 *   circle(cx, cy, r, quarter) → ring                           4 × quarter segments, vertices on the circle (inscribed)
 *   capsule(p, q, r, quarter) → ring                            segment p–q grown by r, round ends (convex)
 *   bufferMulti / bufferLine / bufferPoint                      see gis-analysis.js bufferGeometry
 *   clipLine(parts, multi) → { inside: parts, outside: parts }  line parts cut at the polygon edges
 *   distance helpers: segDist(p, q, a, b) · ptSegDist(p, a, b)
 */

export const ringArea = (r) => { let s = 0; for (let i = 0, n = r.length - 1; i < n; i++) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return s / 2; };
export const area = (m) => m.reduce((s, poly) => s + poly.reduce((a, r, i) => a + (i ? -Math.abs(ringArea(r)) : Math.abs(ringArea(r))), 0), 0);
export const perimeter = (m) => m.reduce((s, poly) => s + poly.reduce((a, r) => a + ringLen(r), 0), 0);
export const ringLen = (r) => { let s = 0; for (let i = 0; i + 1 < r.length; i++) s += Math.hypot(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]); return s; };
export function bbox(m) {
  const b = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const poly of m) for (const r of poly) for (const p of r) { if (p[0] < b.minX) b.minX = p[0]; if (p[0] > b.maxX) b.maxX = p[0]; if (p[1] < b.minY) b.minY = p[1]; if (p[1] > b.maxY) b.maxY = p[1]; }
  return b;
}

/** Ray-cast point test over every ring (even-odd: holes work). */
export function pointIn(m, x, y) {
  let c = false;
  for (const poly of m) for (const r of poly) for (let i = 0, j = r.length - 2; i < r.length - 1; j = i++) {
    const a = r[i], b = r[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}
export function onBoundary(m, x, y, tol) {
  for (const poly of m) for (const r of poly) for (let i = 0; i + 1 < r.length; i++) if (ptSegDist([x, y], r[i], r[i + 1]) <= tol) return true;
  return false;
}
export function ptSegDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
const cross = (ax, ay, bx, by) => ax * by - ay * bx;
export function segsCross(p, p2, q, q2) {
  const d1 = cross(p2[0] - p[0], p2[1] - p[1], q[0] - p[0], q[1] - p[1]), d2 = cross(p2[0] - p[0], p2[1] - p[1], q2[0] - p[0], q2[1] - p[1]);
  const d3 = cross(q2[0] - q[0], q2[1] - q[1], p[0] - q[0], p[1] - q[1]), d4 = cross(q2[0] - q[0], q2[1] - q[1], p2[0] - q[0], p2[1] - q[1]);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0)) && d1 !== 0 && d2 !== 0 && d3 !== 0 && d4 !== 0;
}
export function segDist(p, p2, q, q2) {
  if (segsCross(p, p2, q, q2)) return 0;
  return Math.min(ptSegDist(p, q, q2), ptSegDist(p2, q, q2), ptSegDist(q, p, p2), ptSegDist(q2, p, p2));
}

// ---------------------------------------------------------------------------------------------------------------- shapes
export function circle(cx, cy, r, quarter = 8) {
  const n = 4 * Math.max(1, quarter | 0), out = [];
  for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  out.push(out[0].slice());
  return out;
}
export function capsule(p, q, r, quarter = 8) {
  const th = Math.atan2(q[1] - p[1], q[0] - p[0]), k = 2 * Math.max(1, quarter | 0), out = [];
  for (let i = 0; i <= k; i++) { const a = th - Math.PI / 2 + (Math.PI * i) / k; out.push([q[0] + r * Math.cos(a), q[1] + r * Math.sin(a)]); }
  for (let i = 0; i <= k; i++) { const a = th + Math.PI / 2 + (Math.PI * i) / k; out.push([p[0] + r * Math.cos(a), p[1] + r * Math.sin(a)]); }
  out.push(out[0].slice());
  return out;
}

// ------------------------------------------------------------------------------------------------------------- booleans
/** Point location against a multi with horizontal strips (fast enough for tens of thousands of edges). */
function locator(edges, minY, maxY) {
  const n = Math.max(1, Math.ceil(Math.sqrt(edges.length))), h = (maxY - minY) / n || 1, strips = Array.from({ length: n }, () => []);
  for (const e of edges) {
    const lo = Math.max(0, Math.min(n - 1, Math.floor((Math.min(e.a[1], e.b[1]) - minY) / h))), hi = Math.max(0, Math.min(n - 1, Math.floor((Math.max(e.a[1], e.b[1]) - minY) / h)));
    for (let s = lo; s <= hi; s++) strips[s].push(e);
  }
  return (x, y) => {
    const s = Math.max(0, Math.min(n - 1, Math.floor((y - minY) / h)));
    let c = false;
    for (const e of strips[s]) if ((e.a[1] > y) !== (e.b[1] > y) && x < ((e.b[0] - e.a[0]) * (y - e.a[1])) / (e.b[1] - e.a[1]) + e.a[0]) c = !c;
    return c;
  };
}

function rawEdges(m, ox, oy, side) {
  const edges = [];
  for (const poly of m) poly.forEach((ring, ri) => {
    const pts = [];
    for (let i = 0; i < ring.length - 1; i++) { const p = [ring[i][0] - ox, ring[i][1] - oy]; const l = pts[pts.length - 1]; if (!l || l[0] !== p[0] || l[1] !== p[1]) pts.push(p); }
    if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    if (pts.length < 3) return;
    let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
    if (a === 0) return;
    const wantCcw = ri === 0;   // outer CCW, holes CW: the inside is on the left
    if ((a > 0) !== wantCcw) pts.reverse();
    for (let i = 0; i < pts.length; i++) edges.push({ a: pts[i], b: pts[(i + 1) % pts.length], side, ts: [] });
  });
  return edges;
}

function boolean(A, B, op) {
  if (!A.length && !B.length) return [];
  const bb = [bbox(A), bbox(B)].filter((b) => Number.isFinite(b.minX));
  const minX = Math.min(...bb.map((b) => b.minX)), maxX = Math.max(...bb.map((b) => b.maxX)), minY = Math.min(...bb.map((b) => b.minY)), maxY = Math.max(...bb.map((b) => b.maxY));
  const ox = (minX + maxX) / 2, oy = (minY + maxY) / 2, size = Math.max(maxX - minX, maxY - minY, 1e-9);
  const eps = size * 1e-9;
  const ea = rawEdges(A, ox, oy, 0), eb = rawEdges(B, ox, oy, 1);
  if (op === 'intersect' && (!ea.length || !eb.length)) return [];
  if (op === 'difference' && !ea.length) return [];
  // canonical vertices
  const cells = new Map();
  const vert = (x, y) => {
    const cx = Math.round(x / eps), cy = Math.round(y / eps);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const v = cells.get((cx + i) + ',' + (cy + j));
      if (v && Math.abs(v.x - x) <= eps && Math.abs(v.y - y) <= eps) return v;
    }
    const v = { x, y, id: cells.size + 1 };
    cells.set(cx + ',' + cy, v);
    return v;
  };
  // split points: A edges against B edges (a grid over B's edge boxes)
  const all = ea.concat(eb);
  for (const e of all) { e.ts.push({ t: 0, v: vert(e.a[0], e.a[1]) }, { t: 1, v: vert(e.b[0], e.b[1]) }); e.len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]); }
  if (ea.length && eb.length) {
    let tot = 0; for (const e of eb) tot += e.len;
    const cs = Math.max((tot / eb.length) * 2, size / 2048, eps * 4);
    const grid = new Map(), key = (i, j) => i + ',' + j;
    for (const e of eb) {
      const x0 = Math.floor(Math.min(e.a[0], e.b[0]) / cs), x1 = Math.floor(Math.max(e.a[0], e.b[0]) / cs), y0 = Math.floor(Math.min(e.a[1], e.b[1]) / cs), y1 = Math.floor(Math.max(e.a[1], e.b[1]) / cs);
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) { const k = key(i, j); (grid.get(k) || grid.set(k, []).get(k)).push(e); }
    }
    for (const a of ea) {
      const x0 = Math.floor(Math.min(a.a[0], a.b[0]) / cs), x1 = Math.floor(Math.max(a.a[0], a.b[0]) / cs), y0 = Math.floor(Math.min(a.a[1], a.b[1]) / cs), y1 = Math.floor(Math.max(a.a[1], a.b[1]) / cs);
      const seen = new Set();
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) for (const b of grid.get(key(i, j)) || []) {
        if (seen.has(b)) continue; seen.add(b);
        meet(a, b, eps, vert);
      }
    }
  }
  // sub-edges
  const subs = [];
  for (const e of all) {
    e.ts.sort((p, q) => p.t - q.t);
    let prev = null;
    for (const s of e.ts) { if (prev && prev.v !== s.v) subs.push({ u: prev.v, v: s.v, side: e.side }); if (!prev || prev.v !== s.v) prev = s; }
  }
  const und = (u, v) => (u.id < v.id ? u.id + '_' + v.id : v.id + '_' + u.id);
  const dirOf = [new Map(), new Map()];   // undirected key → direction (+1 low→high id, -1) per side
  for (const s of subs) dirOf[s.side].set(und(s.u, s.v), s.u.id < s.v.id ? 1 : -1);
  const locate = [A, B].map((m, i) => {
    const es = (i ? eb : ea);
    return es.length ? locator(es, es.reduce((q, e) => Math.min(q, e.a[1]), Infinity), es.reduce((q, e) => Math.max(q, e.a[1]), -Infinity)) : () => false;
  });
  // the locator needs the full y range of its edges
  for (let i = 0; i < 2; i++) {
    const es = i ? eb : ea;
    if (!es.length) continue;
    const lo = es.reduce((q, e) => Math.min(q, e.a[1]), Infinity), hi = es.reduce((q, e) => Math.max(q, e.a[1]), -Infinity);
    locate[i] = locator(es, lo, hi);
  }
  const kept = [];
  for (const s of subs) {
    const other = 1 - s.side, k = und(s.u, s.v), mine = s.u.id < s.v.id ? 1 : -1;
    const od = dirOf[other].get(k);
    let keep;
    if (od !== undefined) {   // shared boundary
      const same = od === mine;
      if (s.side === 1) keep = false;
      else keep = op === 'union' || op === 'intersect' ? same : !same;
      if (keep) kept.push({ u: s.u, v: s.v });
      continue;
    }
    const inside = locate[other]((s.u.x + s.v.x) / 2, (s.u.y + s.v.y) / 2);
    if (s.side === 0) keep = op === 'union' ? !inside : op === 'intersect' ? inside : !inside;
    else keep = op === 'union' ? !inside : op === 'intersect' ? inside : inside;
    if (!keep) continue;
    if (s.side === 1 && op === 'difference') kept.push({ u: s.v, v: s.u }); else kept.push({ u: s.u, v: s.v });
  }
  return stitch(kept, ox, oy, eps);
}

/** Add the points where two edges meet (crossings, T-junctions, collinear overlaps) as split points on both. */
function meet(a, b, eps, vert) {
  if (Math.max(a.a[0], a.b[0]) + eps < Math.min(b.a[0], b.b[0]) || Math.max(b.a[0], b.b[0]) + eps < Math.min(a.a[0], a.b[0])) return;
  if (Math.max(a.a[1], a.b[1]) + eps < Math.min(b.a[1], b.b[1]) || Math.max(b.a[1], b.b[1]) + eps < Math.min(a.a[1], a.b[1])) return;
  const rx = a.b[0] - a.a[0], ry = a.b[1] - a.a[1], sx = b.b[0] - b.a[0], sy = b.b[1] - b.a[1];
  const den = cross(rx, ry, sx, sy), qpx = b.a[0] - a.a[0], qpy = b.a[1] - a.a[1];
  if (Math.abs(den) <= 1e-12 * a.len * b.len) {   // parallel
    if (Math.abs(cross(qpx, qpy, rx, ry)) / a.len > eps) return;   // not on the same line
    // each edge's endpoints that lie within the other (along it) split the other
    for (const [e, f] of [[a, b], [b, a]]) for (const pt of [f.a, f.b]) {
      const t = ((pt[0] - e.a[0]) * (e.b[0] - e.a[0]) + (pt[1] - e.a[1]) * (e.b[1] - e.a[1])) / (e.len * e.len);
      if (t > 0 && t < 1 && ptSegDist(pt, e.a, e.b) <= eps) e.ts.push({ t, v: vert(pt[0], pt[1]) });
    }
    return;
  }
  const t = cross(qpx, qpy, sx, sy) / den, u = cross(qpx, qpy, rx, ry) / den;
  const ta = eps / a.len, tb = eps / b.len;
  if (t < -ta || t > 1 + ta || u < -tb || u > 1 + tb) return;
  const x = a.a[0] + t * rx, y = a.a[1] + t * ry;
  const v = vert(x, y);
  if (t > 0 && t < 1) a.ts.push({ t, v });
  if (u > 0 && u < 1) b.ts.push({ t: u, v });
}

function stitch(kept, ox, oy, eps) {
  const out = new Map();
  for (const e of kept) { if (!out.has(e.u.id)) out.set(e.u.id, []); out.get(e.u.id).push(e); }
  const rings = [];
  for (const e0 of kept) {
    if (e0.used) continue;
    const pts = [e0.u];
    let e = e0, guard = kept.length + 2;
    while (guard-- > 0) {
      e.used = true;
      pts.push(e.v);
      if (e.v === e0.u) break;
      const cand = (out.get(e.v.id) || []).filter((x) => !x.used);
      if (!cand.length) break;
      if (cand.length === 1) e = cand[0];
      else {
        const ix = e.v.x - e.u.x, iy = e.v.y - e.u.y;
        let best = null, ba = -Infinity;
        for (const c of cand) { const a = Math.atan2(cross(ix, iy, c.v.x - c.u.x, c.v.y - c.u.y), ix * (c.v.x - c.u.x) + iy * (c.v.y - c.u.y)); if (a > ba) { ba = a; best = c; } }
        e = best;
      }
    }
    if (pts.length >= 4 && pts[pts.length - 1] === pts[0]) rings.push(pts.map((v) => [v.x + ox, v.y + oy]));
  }
  const outers = [], holes = [];
  for (const r of rings) {
    const a = ringArea(r);
    if (Math.abs(a) <= eps * eps * 4) continue;
    (a > 0 ? outers : holes).push({ r, a });
  }
  const polys = outers.map((o) => ({ ring: o.r, a: o.a, holes: [] }));
  for (const h of holes) {
    const p = h.r[0], q = h.r[1], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    let best = null;
    for (const po of polys) if (pointIn([[po.ring]], mx, my) && (!best || po.a < best.a)) best = po;
    if (best) best.holes.push(h.r); else polys.push({ ring: h.r.slice().reverse(), a: -h.a, holes: [] });   // a stray hole becomes an outer
  }
  return polys.map((p) => [p.ring, ...p.holes]);
}

export const union = (a, b) => (!a.length ? b.map(copyPoly) : !b.length ? a.map(copyPoly) : boolean(a, b, 'union'));
export const intersect = (a, b) => boolean(a, b, 'intersect');
export const difference = (a, b) => (!b.length ? a.map(copyPoly) : boolean(a, b, 'difference'));
const copyPoly = (poly) => poly.map((r) => r.map((p) => [p[0], p[1]]));
export function unionAll(list) {
  let l = list.filter((m) => m.length);
  if (!l.length) return [];
  while (l.length > 1) {
    const nx = [];
    for (let i = 0; i < l.length; i += 2) nx.push(i + 1 < l.length ? union(l[i], l[i + 1]) : l[i]);
    l = nx;
  }
  return l[0];
}

// ------------------------------------------------------------------------------------------------------------------ lines
/** Cut line parts at a polygon set's edges; each piece goes to inside or outside by its midpoint. */
export function clipLine(parts, multi) {
  const inside = [], outside = [];
  const edges = [];
  for (const poly of multi) for (const r of poly) for (let i = 0; i + 1 < r.length; i++) edges.push([r[i], r[i + 1]]);
  for (const part of parts) {
    for (let i = 0; i + 1 < part.length; i++) {
      const p = part[i], q = part[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy);
      if (!L) continue;
      const ts = [0, 1];
      for (const [a, b] of edges) {
        const sx = b[0] - a[0], sy = b[1] - a[1], den = cross(dx, dy, sx, sy);
        if (Math.abs(den) < 1e-14 * L * Math.hypot(sx, sy)) continue;
        const t = cross(a[0] - p[0], a[1] - p[1], sx, sy) / den, u = cross(a[0] - p[0], a[1] - p[1], dx, dy) / den;
        if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
      }
      ts.sort((m, n) => m - n);
      for (let k = 0; k + 1 < ts.length; k++) {
        if (ts[k + 1] - ts[k] < 1e-12) continue;
        const a = [p[0] + dx * ts[k], p[1] + dy * ts[k]], b = [p[0] + dx * ts[k + 1], p[1] + dy * ts[k + 1]];
        const mid = (ts[k] + ts[k + 1]) / 2, ins = pointIn(multi, p[0] + dx * mid, p[1] + dy * mid);
        const dst = ins ? inside : outside;
        const last = dst[dst.length - 1];
        if (last && last[last.length - 1][0] === a[0] && last[last.length - 1][1] === a[1]) last.push(b); else dst.push([a, b]);
      }
    }
  }
  return { inside, outside };
}

// ------------------------------------------------------------------------------------------------------------------ buffers
/** Parts of a line buffered by d > 0 (round ends and joins). */
export function bufferLine(parts, d, quarter = 8) {
  const caps = [];
  for (const part of parts) for (let i = 0; i + 1 < part.length; i++) if (part[i][0] !== part[i + 1][0] || part[i][1] !== part[i + 1][1]) caps.push([[capsule(part[i], part[i + 1], d, quarter)]]);
  if (!caps.length && parts.length && parts[0].length) caps.push([[circle(parts[0][0][0], parts[0][0][1], d, quarter)]]);
  return unionAll(caps);
}
export const bufferPoint = (c, d, quarter = 8) => [[circle(c[0], c[1], d, quarter)]];
/** A polygon set grown (d > 0) or shrunk (d < 0) by |d|. */
export function bufferMulti(multi, d, quarter = 8) {
  if (!d) return multi.map(copyPoly);
  const caps = [];
  for (const poly of multi) for (const r of poly) for (let i = 0; i + 1 < r.length; i++) caps.push([[capsule(r[i], r[i + 1], Math.abs(d), quarter)]]);
  const band = unionAll(caps);
  return d > 0 ? union(multi, band) : difference(multi, band);
}
