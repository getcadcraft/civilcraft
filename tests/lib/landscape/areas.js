/* SPDX-License-Identifier: Apache-2.0 */
/**
 * areas.js — a closed outline with holes cut out of it, measured exactly (0.8 LA.5, session `landscape-arch_PART_4`). No DOM, no
 * imports: canonical in lib/landscape/, byte-identical copies by `node tools/landscape/sync.mjs` (CivilCraft's Landscape workspace
 * is the first host; SuperCad Studio, BimCraft and ModelCraft take it the same way). Used for planted areas that clip themselves
 * around paving, walls and steps (no plant under paving) and for anything else that needs "this outline minus those".
 *
 *   clipRegion(outline, holes, { maxEdges }) → { area, perimeter, outlineLength, cutLength, edges: [{ a, b, from: 'outline'|'cut' }],
 *                                                 inside(x, y), near(x, y) (distance to the nearest region edge), capped }
 *     outline: [{x, y}] closed (either winding); holes: [[{x, y}]…] (they may overlap each other and stick out of the outline).
 *     area     = |outline ∖ ∪holes|, exact for straight edges: the plane is cut into horizontal slabs at every vertex and every
 *                edge crossing, so no edge crosses inside a slab and the region's width is linear in y there (width at mid-height × h).
 *     edges    = the region's boundary: the outline's pieces outside every hole ('outline': edging runs here) and the holes' pieces
 *                inside the outline ('cut': against paving, a wall or steps).
 *   polyArea(pts) (signed) · pointIn(x, y, pts) · segCross(a, b, c, d) → t on ab | null
 */

const EPS = 1e-9;

export function polyArea(pts) { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y); return -a / 2; }

export function pointIn(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

/** Where segment ab crosses segment cd (proper or touching), as t along ab, else null. Parallel lines never cross here. */
export function segCross(a, b, c, d) {
  const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y, den = rx * sy - ry * sx;
  if (Math.abs(den) < EPS * (Math.hypot(rx, ry) * Math.hypot(sx, sy) + EPS)) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / den, u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / den;
  return t >= -EPS && t <= 1 + EPS && u >= -EPS && u <= 1 + EPS ? Math.min(1, Math.max(0, t)) : null;
}

const bbox = (pts) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const p of pts) { if (p.x < x0) x0 = p.x; if (p.y < y0) y0 = p.y; if (p.x > x1) x1 = p.x; if (p.y > y1) y1 = p.y; } return { x0, y0, x1, y1 }; };
const overlaps = (a, b) => a.x0 <= b.x1 + EPS && b.x0 <= a.x1 + EPS && a.y0 <= b.y1 + EPS && b.y0 <= a.y1 + EPS;
function segDist(x, y, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L)) : 0;
  return Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
}

export function clipRegion(outline, holes = [], { maxEdges = 6000 } = {}) {
  const A = (outline || []).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y));
  const empty = { area: 0, perimeter: 0, outlineLength: 0, cutLength: 0, edges: [], inside: () => false, near: () => Infinity, capped: false };
  if (A.length < 3) return empty;
  const box = bbox(A);
  // only holes that reach the outline's box take part
  const H = (holes || []).map((h) => (h || []).filter((p) => p && Number.isFinite(p.x) && Number.isFinite(p.y))).filter((h) => h.length >= 3 && Math.abs(polyArea(h)) > EPS && overlaps(bbox(h), box));
  const polys = [A, ...H];
  let total = polys.reduce((n, p) => n + p.length, 0), capped = false;
  if (total > maxEdges) { capped = true; while (polys.length > 1 && total > maxEdges) total -= polys.pop().length; }
  const inHole = (x, y, skip = -1) => { for (let k = 1; k < polys.length; k++) if (k !== skip && pointIn(x, y, polys[k])) return true; return false; };
  const inside = (x, y) => pointIn(x, y, A) && !inHole(x, y);
  // every edge, with where it is crossed by the others
  const edges = [];
  polys.forEach((P, pi) => { for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if (Math.hypot(b.x - a.x, b.y - a.y) > EPS) edges.push({ a, b, pi, ts: [0, 1], bb: bbox([a, b]) }); } });
  const ys = new Set(polys.flatMap((P) => P.map((p) => p.y)));
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const e = edges[i], f = edges[j];
    if (!overlaps(e.bb, f.bb)) continue;
    const t = segCross(e.a, e.b, f.a, f.b);
    if (t === null) continue;
    const u = segCross(f.a, f.b, e.a, e.b);
    e.ts.push(t); if (u !== null) f.ts.push(u);
    ys.add(e.a.y + t * (e.b.y - e.a.y));
  }
  // the area, slab by slab
  const Y = [...ys].sort((p, q) => p - q);
  let area = 0;
  for (let s = 0; s + 1 < Y.length; s++) {
    const h = Y[s + 1] - Y[s];
    if (h < EPS) continue;
    const ym = (Y[s] + Y[s + 1]) / 2, xs = [];
    for (const e of edges) {
      if ((e.a.y > ym) === (e.b.y > ym)) continue;
      xs.push({ x: e.a.x + ((ym - e.a.y) * (e.b.x - e.a.x)) / (e.b.y - e.a.y), pi: e.pi });
    }
    xs.sort((p, q) => p.x - q.x);
    const par = new Uint8Array(polys.length);
    let holesIn = 0, w = 0;
    for (let k = 0; k < xs.length; k++) {
      const { x, pi } = xs[k];
      if (pi > 0) holesIn += par[pi] ? -1 : 1;
      par[pi] ^= 1;
      if (k + 1 < xs.length && par[0] && holesIn === 0) w += xs[k + 1].x - x;
    }
    area += w * h;
  }
  // the boundary pieces
  const out = [];
  let outlineLength = 0, cutLength = 0;
  for (const e of edges) {
    const ts = [...new Set(e.ts.map((t) => Math.round(t * 1e9) / 1e9))].sort((p, q) => p - q);
    for (let k = 0; k + 1 < ts.length; k++) {
      const t0 = ts[k], t1 = ts[k + 1];
      if (t1 - t0 < 1e-9) continue;
      const tm = (t0 + t1) / 2, mx = e.a.x + tm * (e.b.x - e.a.x), my = e.a.y + tm * (e.b.y - e.a.y);
      const keep = e.pi === 0 ? !inHole(mx, my) : pointIn(mx, my, A) && !inHole(mx, my, e.pi);
      if (!keep) continue;
      const a = { x: e.a.x + t0 * (e.b.x - e.a.x), y: e.a.y + t0 * (e.b.y - e.a.y) }, b = { x: e.a.x + t1 * (e.b.x - e.a.x), y: e.a.y + t1 * (e.b.y - e.a.y) };
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      if (e.pi === 0) outlineLength += L; else cutLength += L;
      out.push({ a, b, from: e.pi === 0 ? 'outline' : 'cut' });
    }
  }
  const near = (x, y) => { let d = Infinity; for (const s of out) d = Math.min(d, segDist(x, y, s.a, s.b)); return d; };
  return { area, perimeter: outlineLength + cutLength, outlineLength, cutLength, edges: out, inside, near, capped };
}
