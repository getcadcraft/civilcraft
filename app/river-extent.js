/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-extent.js — the flood extent on the plan: the computed water surface intersected with the TIN (0.8 SU.957). No DOM.
 * Tested by bin/test-civilcraft-river.mjs § flood extent.
 *
 * The water surface between two sections is level across the river and linear in river station along it (a point takes the
 * river station of its nearest centreline point). Only the river's corridor counts: the polygon through the cut lines' left
 * ends (upstream → downstream) and back through their right ends. A triangle whose middle is outside the corridor is left
 * out, so the extent's edge there follows the triangles (not cut exactly at the corridor line). LEVEES (river.js, 0.8 SU.957 step 2):
 * a point beyond a section's levee (left of the left levee's offset, right of the right one's; offset and crest taken between the two
 * sections either side of it) is dry while the water surface there is below the crest: its triangle is left out like one outside the
 * corridor. Only a levee on both of the two sections around a point counts.
 *
 *   corridor(model) → [{ x, y }] | null
 *   wsAt(model, rows, p, line?) → wse | null     the water surface at plan point p (null outside the modelled reach)
 *   floodExtent(surface, model, rows) → { wet: [[{ x, y }]] (one polygon per wet triangle piece), edges: [[p, q]] (the
 *       waterline: where the depth is 0), outline: [[{ x, y }]] (the waterline chained into lines; closed ones repeat the first
 *       point), area (plan), maxDepth, triangles (looked at) }
 *   blockedAt(model, rows, p, ws) → true when p is behind a levee that the water surface ws does not reach
 *   depthAt(surface, model, rows, p) → depth | null
 */

import { lineLength, locateOn } from './terrain-section.js';
import { pointInPoly } from './tin.js';

export function corridor(model) {
  const secs = model.sections.filter((s) => s.line?.length >= 2).sort((a, b) => b.rs - a.rs);
  if (secs.length < 2) return null;
  const left = secs.map((s) => s.line[0]), right = secs.map((s) => s.line[s.line.length - 1]).reverse();
  return [...left, ...right].map((p) => ({ x: p.x, y: p.y }));
}

export function wsAt(model, rows, p) {
  const cl = model.centreline, L = lineLength(cl), at = locateOn(cl, p);
  if (!at || !rows?.length) return null;
  // past either end of the centreline: no water surface there
  const past = (q, dir) => (p.x - q.x) * Math.cos(dir) + (p.y - q.y) * Math.sin(dir) > 1e-9;
  if (at.d <= 1e-9 && past(cl[0], at.dir + Math.PI)) return null;
  if (at.d >= L - 1e-9 && past(cl[cl.length - 1], at.dir)) return null;
  const rs = L - at.d;
  const r = rows.slice().sort((a, b) => a.rs - b.rs);
  if (rs < r[0].rs - 1e-9 || rs > r[r.length - 1].rs + 1e-9) return null;
  for (let i = 1; i < r.length; i++) {
    if (rs <= r[i].rs + 1e-9) { const a = r[i - 1], b = r[i], d = b.rs - a.rs; return d > 0 ? a.wse + ((b.wse - a.wse) * (rs - a.rs)) / d : b.wse; }
  }
  return r[0].wse;
}

export function blockedAt(model, rows, p, ws) {
  const cl = model.centreline, at = locateOn(cl, p);
  if (!at) return false;
  const rs = lineLength(cl) - at.d;
  const secs = model.sections.filter((s) => s.levees).sort((a, b) => a.rs - b.rs);
  if (!secs.length) return false;
  for (const side of ['left', 'right']) {
    const all = model.sections.slice().sort((a, b) => a.rs - b.rs);
    for (let i = 1; i < all.length; i++) {
      const a = all[i - 1], b = all[i];
      if (rs < a.rs - 1e-9 || rs > b.rs + 1e-9) continue;
      const la = a.levees?.[side], lb = b.levees?.[side];
      if (!la || !lb) continue;
      const f = b.rs > a.rs ? (rs - a.rs) / (b.rs - a.rs) : 0, o = la.o + (lb.o - la.o) * f, crest = la.z + (lb.z - la.z) * f;
      if ((side === 'left' ? at.off < o : at.off > o) && ws < crest) return true;
    }
  }
  return false;
}

export function depthAt(surface, model, rows, p) {
  const ws = wsAt(model, rows, p), z = surface.elevationAt(p.x, p.y, 1e-7);
  return ws === null || z === null ? null : ws - z;
}

export function floodExtent(surface, model, rows) {
  const out = { wet: [], edges: [], outline: [], area: 0, maxDepth: 0, triangles: 0 };
  if (!surface || !rows?.length) return out;
  const poly = corridor(model);
  const { X, Y, Z, tris, ox, oy } = surface;
  const depth = new Map();
  const dOf = (v) => {
    if (depth.has(v)) return depth.get(v);
    const ws = wsAt(model, rows, { x: X[v] + ox, y: Y[v] + oy });
    const d = ws === null ? null : ws - Z[v];
    depth.set(v, d);
    return d;
  };
  const hasLevee = model.sections.some((s) => s.levees);
  const keyed = new Map();   // TIN edge → its waterline point (shared by the two triangles, so the outline chains exactly)
  const cross = (a, b) => {
    const k = a < b ? a + ',' + b : b + ',' + a;
    if (keyed.has(k)) return keyed.get(k);
    const da = dOf(a), db = dOf(b), u = da / (da - db);
    const p = { x: X[a] + ox + (X[b] - X[a]) * u, y: Y[a] + oy + (Y[b] - Y[a]) * u, k };
    keyed.set(k, p);
    return p;
  };
  const xMin = poly ? Math.min(...poly.map((p) => p.x)) : -Infinity, xMax = poly ? Math.max(...poly.map((p) => p.x)) : Infinity;
  const yMin = poly ? Math.min(...poly.map((p) => p.y)) : -Infinity, yMax = poly ? Math.max(...poly.map((p) => p.y)) : Infinity;
  for (let t = 0; t < tris.length; t += 3) {
    const v = [tris[t], tris[t + 1], tris[t + 2]];
    const cx = (X[v[0]] + X[v[1]] + X[v[2]]) / 3 + ox, cy = (Y[v[0]] + Y[v[1]] + Y[v[2]]) / 3 + oy;
    if (cx < xMin || cx > xMax || cy < yMin || cy > yMax) continue;
    if (poly && !pointInPoly(cx, cy, poly)) continue;
    if (hasLevee) { const w = wsAt(model, rows, { x: cx, y: cy }); if (w !== null && blockedAt(model, rows, { x: cx, y: cy }, w)) continue; }
    const d = v.map(dOf);
    if (d.some((x) => x === null)) continue;
    out.triangles++;
    if (d.every((x) => x <= 0)) continue;
    const piece = [], line = [];
    for (let i = 0; i < 3; i++) {
      const a = v[i], b = v[(i + 1) % 3], da = d[i], db = d[(i + 1) % 3];
      if (da > 0) piece.push({ x: X[a] + ox, y: Y[a] + oy });
      if ((da > 0) !== (db > 0)) { const p = cross(a, b); piece.push({ x: p.x, y: p.y }); line.push(p); }
      if (da > out.maxDepth) out.maxDepth = da;
    }
    if (piece.length >= 3) {
      out.wet.push(piece);
      let a2 = 0;
      for (let i = 0; i < piece.length; i++) { const p = piece[i], q = piece[(i + 1) % piece.length]; a2 += p.x * q.y - q.x * p.y; }
      out.area += Math.abs(a2) / 2;
    }
    if (line.length === 2) out.edges.push([line[0], line[1]]);
  }
  out.outline = chain(out.edges);
  out.edges = out.edges.map(([p, q]) => [{ x: p.x, y: p.y }, { x: q.x, y: q.y }]);
  return out;
}

/** Waterline pieces → polylines, joined where they share a TIN-edge point. */
function chain(edges) {
  const at = new Map();
  edges.forEach((e, i) => { for (const p of e) { if (!at.has(p.k)) at.set(p.k, []); at.get(p.k).push(i); } });
  const used = new Uint8Array(edges.length), lines = [];
  const step = (k, from) => (at.get(k) || []).find((i) => i !== from && !used[i]);
  for (let s = 0; s < edges.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const pts = [edges[s][0], edges[s][1]];
    for (const dir of [1, -1]) {
      let end = dir === 1 ? pts[pts.length - 1] : pts[0], cur = s;
      for (;;) {
        const i = step(end.k, cur);
        if (i === undefined) break;
        used[i] = 1;
        const nxt = edges[i][0].k === end.k ? edges[i][1] : edges[i][0];
        if (dir === 1) pts.push(nxt); else pts.unshift(nxt);
        end = nxt; cur = i;
      }
    }
    lines.push(pts.map((p) => ({ x: p.x, y: p.y })));
  }
  return lines;
}
