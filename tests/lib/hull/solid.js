/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-hull speaks codes and numbers; the host words them (keys hull.*). */
/**
 * solid.js — cc-hull: surfaces to solid (0.8 EG.26; owner decision D7.45, 2026-10-29: "surfaces to solid, so a hull drawn as surfaces can float").
 * Turns a set of NURBS patches that together enclose a hull into ONE closed, outward triangle mesh the hydrostatics can float. DOM-free; the host
 * hands in its copy of cc-nurbs (`N`), as fair.js does (copies by `node tools/hull/sync.mjs <host>`).
 *
 *   surfacesToSolid(N, doc, { ids, n = 24, tol, mirror = null, at = 0, cap = true }) →
 *     { positions: Float64Array, indices: Uint32Array, closed, openEdges, nonManifold, capped, triangles, volume (mm³, >0 when outward), used: [id], notes: [code] }
 *   ids      the surface items to use (default: every surface of the doc)
 *   n        samples per patch direction (uniform in parameter: patches that share an edge and are parametrised alike meet exactly)
 *   tol      weld distance in mm (default 1e-4 of the set's size)
 *   mirror   'x' | 'y' | 'z': the patches are one HALF of the hull; the other half is its mirror image in the plane axis = `at` (a hull drawn to the centreline)
 *   cap      close planar openings (the deck, a transom, the centreline plane) with a fan; a non-planar opening stays open and is counted in openEdges
 * It never guesses: when the result is not closed `closed` is false, `openEdges` says how many mesh edges have only one triangle, and the host must say so
 * before floating it (hydrostatics of an open mesh is wrong). Notes: 'mirrored', 'capped', 'open', 'non_manifold', 'no_surfaces'.
 */
const AX = { x: 0, y: 1, z: 2 };

export function surfacesToSolid(N, doc, { ids = null, n = 24, tol = null, mirror = null, at = 0, cap = true } = {}) {
  const items = N.doc.surfaces(doc).filter((it) => !ids || ids.includes(it.id));
  const notes = [];
  if (!items.length) return { positions: new Float64Array(0), indices: new Uint32Array(0), closed: false, openEdges: 0, nonManifold: 0, capped: 0, triangles: 0, volume: 0, used: [], notes: ['no_surfaces'] };
  const N1 = Math.max(2, Math.min(200, Math.round(n)));
  const raw = [];   // flat positions
  const tris = [];  // [a, b, c] into raw points
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const it of items) {
    const s = it.surface, [u0, u1] = N.surface.domainU(s), [v0, v1] = N.surface.domainV(s);
    const up = Array.from({ length: N1 + 1 }, (_, i) => u0 + (u1 - u0) * i / N1), vp = Array.from({ length: N1 + 1 }, (_, i) => v0 + (v1 - v0) * i / N1);
    const t = N.surface.tessellate(s, { uParams: up, vParams: vp });
    const base = raw.length / 3;
    for (let i = 0; i < t.positions.length; i += 3) {
      for (let k = 0; k < 3; k++) { raw.push(t.positions[i + k]); lo[k] = Math.min(lo[k], t.positions[i + k]); hi[k] = Math.max(hi[k], t.positions[i + k]); }
    }
    for (let i = 0; i < t.indices.length; i += 3) tris.push([base + t.indices[i], base + t.indices[i + 1], base + t.indices[i + 2]]);
  }
  const size = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;
  const eps = tol ?? size * 1e-4;
  if (mirror && AX[mirror] !== undefined) {
    const k = AX[mirror], pts = raw.length / 3;
    for (let i = 0; i < pts; i++) { const p = [raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]]; p[k] = 2 * at - p[k]; raw.push(...p); }
    const m = tris.length;
    for (let i = 0; i < m; i++) { const [a, b, c] = tris[i]; tris.push([a + pts, c + pts, b + pts]); }   // a mirror image turns the winding over
    notes.push('mirrored');
  }
  // weld by position (grid of cell eps; the 27 neighbouring cells are searched)
  const pos = [], map = new Int32Array(raw.length / 3), grid = new Map();
  const key = (x, y, z) => x + ',' + y + ',' + z;
  for (let i = 0; i < raw.length / 3; i++) {
    const x = raw[i * 3], y = raw[i * 3 + 1], z = raw[i * 3 + 2], cx = Math.floor(x / eps), cy = Math.floor(y / eps), cz = Math.floor(z / eps);
    let found = -1;
    for (let dx = -1; dx <= 1 && found < 0; dx++) for (let dy = -1; dy <= 1 && found < 0; dy++) for (let dz = -1; dz <= 1 && found < 0; dz++) {
      const list = grid.get(key(cx + dx, cy + dy, cz + dz));
      if (list) for (const j of list) if (Math.hypot(pos[j * 3] - x, pos[j * 3 + 1] - y, pos[j * 3 + 2] - z) <= eps) { found = j; break; }
    }
    if (found < 0) { found = pos.length / 3; pos.push(x, y, z); const kk = key(cx, cy, cz); (grid.get(kk) || grid.set(kk, []).get(kk)).push(found); }
    map[i] = found;
  }
  let T = [];
  for (const [a, b, c] of tris) { const A = map[a], B = map[b], C = map[c]; if (A !== B && B !== C && A !== C) T.push([A, B, C]); }
  // the same triangle twice (two patches covering one spot) counts once
  const seen = new Set();
  T = T.filter((t) => { const k = [...t].sort((p, q) => p - q).join(','); if (seen.has(k)) return false; seen.add(k); return true; });

  const edgeCount = () => {
    const E = new Map();
    for (const t of T) for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], kk = a < b ? a + '_' + b : b + '_' + a; E.set(kk, (E.get(kk) || 0) + 1); }
    return E;
  };
  const orient = () => {
    const E2 = new Map();
    T.forEach((t, i) => { for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], kk = a < b ? a + '_' + b : b + '_' + a; (E2.get(kk) || E2.set(kk, []).get(kk)).push([i, a, b]); } });
    const flip = new Int8Array(T.length).fill(-1);
    for (let s0 = 0; s0 < T.length; s0++) {
      if (flip[s0] >= 0) continue;
      flip[s0] = 0;
      const stack = [s0];
      while (stack.length) {
        const i = stack.pop(), t = T[i];
        for (let k = 0; k < 3; k++) {
          const a = t[k], b = t[(k + 1) % 3], kk = a < b ? a + '_' + b : b + '_' + a, l = E2.get(kk);
          if (l.length !== 2) continue;
          const [j, ja, jb] = l[0][0] === i ? l[1] : l[0];
          // a consistent pair uses the shared edge in opposite directions (after each triangle's own flip)
          const mine = flip[i] ? [b, a] : [a, b];
          const need = (mine[0] === ja && mine[1] === jb) ? 1 : 0;
          if (flip[j] < 0) { flip[j] = need; stack.push(j); }
        }
      }
    }
    T = T.map((t, i) => (flip[i] === 1 ? [t[0], t[2], t[1]] : t));
  };
  orient();   // one winding first: the boundary loops below follow the edges' directions
  let capped = 0;
  if (cap) {
    // boundary loops (edges used once), each closed with a centroid fan when it lies in a plane
    const E = new Map();
    for (const t of T) for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], kk = a < b ? a + '_' + b : b + '_' + a; (E.get(kk) || E.set(kk, []).get(kk)).push([a, b]); }
    const next = new Map();
    for (const l of E.values()) if (l.length === 1) { const [a, b] = l[0]; (next.get(a) || next.set(a, []).get(a)).push(b); }
    const used = new Set();
    for (const start of [...next.keys()]) {
      if (used.has(start)) continue;
      const loop = [start]; used.add(start);
      let cur = start, ok = true;
      for (let guard = 0; guard < pos.length + 2; guard++) {
        const outs = (next.get(cur) || []).filter((v) => v === start || !used.has(v));
        if (!outs.length) { ok = false; break; }
        const nx = outs.includes(start) && loop.length > 2 ? start : outs[0];
        if (nx === start) break;
        loop.push(nx); used.add(nx); cur = nx;
      }
      if (!ok || loop.length < 3) continue;
      // planar? Newell normal, every point within a few weld distances of the plane
      let nx = 0, ny = 0, nz = 0, cx = 0, cy = 0, cz = 0;
      for (let i = 0; i < loop.length; i++) {
        const p = loop[i] * 3, q = loop[(i + 1) % loop.length] * 3;
        nx += (pos[p + 1] - pos[q + 1]) * (pos[p + 2] + pos[q + 2]); ny += (pos[p + 2] - pos[q + 2]) * (pos[p] + pos[q]); nz += (pos[p] - pos[q]) * (pos[p + 1] + pos[q + 1]);
        cx += pos[p]; cy += pos[p + 1]; cz += pos[p + 2];
      }
      const nl = Math.hypot(nx, ny, nz);
      if (nl < 1e-12) continue;
      nx /= nl; ny /= nl; nz /= nl; cx /= loop.length; cy /= loop.length; cz /= loop.length;
      let dev = 0;
      for (const v of loop) dev = Math.max(dev, Math.abs((pos[v * 3] - cx) * nx + (pos[v * 3 + 1] - cy) * ny + (pos[v * 3 + 2] - cz) * nz));
      if (dev > Math.max(eps * 4, size * 2e-4)) continue;
      const c = pos.length / 3; pos.push(cx, cy, cz);
      for (let i = 0; i < loop.length; i++) T.push([loop[(i + 1) % loop.length], loop[i], c]);   // reverse of the loop's own direction: it closes the hole
      capped++;
    }
    if (capped) notes.push('capped');
  }
  orient();   // and again with the caps in
  let vol = 0;
  for (const [a, b, c] of T) {
    const A = a * 3, B = b * 3, C = c * 3;
    vol += (pos[A] * (pos[B + 1] * pos[C + 2] - pos[B + 2] * pos[C + 1]) - pos[A + 1] * (pos[B] * pos[C + 2] - pos[B + 2] * pos[C]) + pos[A + 2] * (pos[B] * pos[C + 1] - pos[B + 1] * pos[C])) / 6;
  }
  if (vol < 0) { T = T.map((t) => [t[0], t[2], t[1]]); vol = -vol; }
  const E3 = edgeCount();
  let openEdges = 0, nonManifold = 0;
  for (const c of E3.values()) { if (c === 1) openEdges++; else if (c > 2) nonManifold++; }
  if (openEdges) notes.push('open');
  if (nonManifold) notes.push('non_manifold');
  const indices = new Uint32Array(T.length * 3);
  T.forEach((t, i) => { indices[i * 3] = t[0]; indices[i * 3 + 1] = t[1]; indices[i * 3 + 2] = t[2]; });
  return { positions: Float64Array.from(pos), indices, closed: openEdges === 0 && nonManifold === 0 && T.length > 0, openEdges, nonManifold, capped, triangles: T.length, volume: vol, used: items.map((i) => i.id), notes };
}
