/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-slice.js — a plate of triangles → G-code for an FDM printer (roadmap PS.2, own Apache-2.0 slicer, no outside slicer code).
 * No DOM. The polygon work is manifold-3d's (`MF` = the set-up module, passed in): each closed shell becomes a solid, the solids are
 * joined, the join is cut at each layer's middle, and walls, skins and infill are offsets and booleans of those cuts.
 *
 *   splitShells(tris) → { shells: [{ positions, indices, closed }] }         welded pieces; solids touching along an edge stay apart
 *     open ends are capped and triangles turned to agree: a shell that is still not closed has edges with three or more faces of its own
 *   plateSolid(MF, tris, { sheet }) → { solid, used, skipped: [{ triangles, min, max }], thickened }   shells that are not closed are left out and listed;
 *     with `sheet` (mm) a flat zero-thickness panel (a label, a trim line) is given that thickness instead of being left out (PS.11), and counted in `thickened`
 *   slice(MF, tris, job, { yieldEvery, onProgress, signal }) → Promise<{ ok, lines, stats, warnings: [{ kind, … }], error? }>
 *     tris: [[x, y, z] ×3] in millimetres, the bed's corner at 0,0, Z up.  job: cleanJob() (ps-profiles.js)
 *     stats: { layers, seconds, filament (mm), grams, size: [x, y, z] }
 *     error: 'empty' | 'open' | 'bed' (a move would leave the bed; nothing is written).
 *     warnings: skipped (shells left out) · sheets (flat panels given a printable thickness) · thin (share of the area too thin for the nozzle) · overhang (no supports, and some parts
 *     have nothing under them) · floating (lifted or dropped to the bed)
 *
 * Output: absolute XYZ, relative E (M83), one G92-free stream a person can read, `;LAYER:n` comments. Every XY move is inside the bed.
 * Bridges (job.bridges) and the wall seam (job.seam 'aligned' | 'nearest') are in (PS.10); stats.bridges / stats.bridgeArea count them.
 * Not done yet (roadmap): per-object sequences, acceleration, multiple materials.
 */
import { startLines, endLines } from './ps-profiles.js';

const WELD = 1e-3;   // mm

export function splitShells(tris) {
  const ids = new Map(), P = [], I = [];
  const vid = (p) => {
    const k = Math.round(p[0] / WELD) + ',' + Math.round(p[1] / WELD) + ',' + Math.round(p[2] / WELD);
    let i = ids.get(k);
    if (i === undefined) { i = P.length / 3; ids.set(k, i); P.push(p[0], p[1], p[2]); }
    return i;
  };
  for (const t of tris) {
    const a = vid(t[0]), b = vid(t[1]), c = vid(t[2]);
    if (a !== b && b !== c && a !== c) I.push(a, b, c);
  }
  // Triangles join across edges with exactly two faces. An edge with four or six faces is solids touching along it, not one solid:
  // keeping them apart here is what lets each one close on its own.
  const n = I.length / 3, edges = new Map();
  const ekey = (u, v) => (u < v ? u + '_' + v : v + '_' + u);
  for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) {
    const e = ekey(I[t * 3 + k], I[t * 3 + (k + 1) % 3]);
    let l = edges.get(e); if (!l) edges.set(e, l = []); l.push(t);
  }
  const parent = new Int32Array(n).map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  for (const l of edges.values()) if (l.length === 2) parent[find(l[0])] = find(l[1]);
  const groups = new Map();
  for (let t = 0; t < n; t++) { const r = find(t); let g = groups.get(r); if (!g) groups.set(r, g = []); g.push(I[t * 3], I[t * 3 + 1], I[t * 3 + 2]); }
  const shells = [];
  for (const idx of groups.values()) {
    const map = new Map(), pos = [], out = new Array(idx.length), count = new Map();
    for (let i = 0; i < idx.length; i++) {
      let m = map.get(idx[i]);
      if (m === undefined) { m = pos.length / 3; map.set(idx[i], m); pos.push(P[idx[i] * 3], P[idx[i] * 3 + 1], P[idx[i] * 3 + 2]); }
      out[i] = m;
    }
    for (let i = 0; i < out.length; i += 3) for (let k = 0; k < 3; k++) { const e = ekey(out[i + k], out[i + (k + 1) % 3]); count.set(e, (count.get(e) || 0) + 1); }
    let pinched = false; for (const c of count.values()) if (c > 2) { pinched = true; break; }
    if (pinched && unpinch(pos, out)) { count.clear(); for (let i = 0; i < out.length; i += 3) for (let k = 0; k < 3; k++) { const e = ekey(out[i + k], out[i + (k + 1) % 3]); count.set(e, (count.get(e) || 0) + 1); } }
    let closed = capHoles(pos, out, count);
    if (closed) closed = orient(out);
    shells.push({ positions: pos, indices: out, closed });
  }
  return { shells };
}

/**
 * A shell that touches itself along an edge (4 faces on it: a bent bar whose bend meets the bar, two boxes sharing an edge but joined elsewhere) is
 * pulled into a manifold: the faces round such an edge are sorted by angle and paired across the wedges of material (face normals say which wedges,
 * and failing that the first pairing), every pair keeps the edge, and each vertex gets one copy per fan of faces that still touch. Edges with
 * an odd count (3 faces) are left as they are. Rewrites `pos` and `idx` in place; false = nothing to do or not possible (shell untouched).
 */
function unpinch(pos, idx) {
  const n = idx.length / 3, key = (a, b) => (a < b ? a + '_' + b : b + '_' + a), by = new Map();
  for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) { const e = key(idx[t * 3 + k], idx[t * 3 + (k + 1) % 3]); let l = by.get(e); if (!l) by.set(e, l = []); l.push(t); }
  const pair = new Map();   // edge → [[faceA, faceB], …]
  for (const [e, l] of by) {
    if (l.length === 2) { pair.set(e, [[l[0], l[1]]]); continue; }
    if (l.length % 2 || l.length > 8) return false;
    const [a, b] = e.split('_').map(Number);
    const ex = pos[b * 3] - pos[a * 3], ey = pos[b * 3 + 1] - pos[a * 3 + 1], ez = pos[b * 3 + 2] - pos[a * 3 + 2], el = Math.hypot(ex, ey, ez) || 1;
    const ax = [ex / el, ey / el, ez / el];
    // two axes across the edge
    const h = Math.abs(ax[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    let ux = ax[1] * h[2] - ax[2] * h[1], uy = ax[2] * h[0] - ax[0] * h[2], uz = ax[0] * h[1] - ax[1] * h[0]; const ul = Math.hypot(ux, uy, uz); ux /= ul; uy /= ul; uz /= ul;
    const vx = ax[1] * uz - ax[2] * uy, vy = ax[2] * ux - ax[0] * uz, vz = ax[0] * uy - ax[1] * ux;
    const rows = l.map((t) => {
      let o = -1; for (let k = 0; k < 3; k++) { const q = idx[t * 3 + k]; if (q !== a && q !== b) o = q; }
      const dx = pos[o * 3] - pos[a * 3], dy = pos[o * 3 + 1] - pos[a * 3 + 1], dz = pos[o * 3 + 2] - pos[a * 3 + 2];
      const ang = Math.atan2(dx * vx + dy * vy + dz * vz, dx * ux + dy * uy + dz * uz);
      // the face's normal against the direction angle grows in: +1 = material lies before the face, -1 = after (outward normals)
      const i0 = idx[t * 3], i1 = idx[t * 3 + 1], i2 = idx[t * 3 + 2];
      const p0x = pos[i0 * 3], p0y = pos[i0 * 3 + 1], p0z = pos[i0 * 3 + 2];
      const q1x = pos[i1 * 3] - p0x, q1y = pos[i1 * 3 + 1] - p0y, q1z = pos[i1 * 3 + 2] - p0z, q2x = pos[i2 * 3] - p0x, q2y = pos[i2 * 3 + 1] - p0y, q2z = pos[i2 * 3 + 2] - p0z;
      const nx = q1y * q2z - q1z * q2y, ny = q1z * q2x - q1x * q2z, nz = q1x * q2y - q1y * q2x;
      // d rotated by +90 deg about the axis: ax × d_perp; sign of n · (ax × d)
      const d = [dx - (dx * ax[0] + dy * ax[1] + dz * ax[2]) * ax[0], dy - (dx * ax[0] + dy * ax[1] + dz * ax[2]) * ax[1], dz - (dx * ax[0] + dy * ax[1] + dz * ax[2]) * ax[2]];
      const c = [ax[1] * d[2] - ax[2] * d[1], ax[2] * d[0] - ax[0] * d[2], ax[0] * d[1] - ax[1] * d[0]];
      return { t, ang, side: nx * c[0] + ny * c[1] + nz * c[2] };
    }).sort((p, q) => p.ang - q.ang);
    // wedge i (between rows i and i+1) holds material when row i's normal points away from it and row i+1's too; score each pairing
    const score = (off) => { let sc = 0; for (let i = off; i < rows.length; i += 2) { const p0 = rows[i], p1 = rows[(i + 1) % rows.length]; sc += (p0.side < 0 ? 1 : -1) + (p1.side > 0 ? 1 : -1); } return sc; };
    // an edge is walked a→b as seen by a face running a→b or b→a; orientation direction flips the sign for a face running b→a
    const off = score(1) > score(0) ? 1 : 0, pr = [];
    for (let i = off; i < rows.length; i += 2) pr.push([rows[i].t, rows[(i + 1) % rows.length].t]);
    pair.set(e, pr);
  }
  // fans: for every vertex, faces joined through a paired edge that contains the vertex share one copy
  const parent = new Int32Array(n * 3).map((_, i) => i);   // corner (t*3+k) → class
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const corner = (t, v) => { for (let k = 0; k < 3; k++) if (idx[t * 3 + k] === v) return t * 3 + k; return -1; };
  for (const [e, prs] of pair) {
    const [a, b] = e.split('_').map(Number);
    for (const [f, g] of prs) for (const v of [a, b]) { const c1 = corner(f, v), c2 = corner(g, v); if (c1 < 0 || c2 < 0) return false; parent[find(c1)] = find(c2); }
  }
  // corners of one face at one vertex that meet through *other* faces: join corners of the same vertex across the faces' shared 2-edges (already in `pair`)
  const copy = new Map(), npos = [], nidx = new Array(idx.length);
  for (let c = 0; c < idx.length; c++) {
    const v = idx[c], k = v + ':' + find(c);
    let m = copy.get(k); if (m === undefined) { m = npos.length / 3; copy.set(k, m); npos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); }
    nidx[c] = m;
  }
  pos.length = 0; for (const x of npos) pos.push(x);
  for (let c = 0; c < idx.length; c++) idx[c] = nidx[c];
  return true;
}

/** Close each hole (a loop of edges with one face, an open tube's end) with a fan from its middle. false = edges that cannot close. */
function capHoles(pos, idx, count) {
  const next = new Map();
  for (const [e, c] of count) {
    if (c === 2) continue;
    if (c !== 1) return false;
    const [a, b] = e.split('_').map(Number);
    for (const [u, v] of [[a, b], [b, a]]) { let l = next.get(u); if (!l) next.set(u, l = []); l.push(v); }
  }
  for (const l of next.values()) if (l.length !== 2) return false;
  const seen = new Set();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop = [start];
    seen.add(start);
    let prev = -1, at = start;
    for (;;) {
      const [p, q] = next.get(at), go = p !== prev && !(seen.has(p) && p !== start) ? p : q;
      if (go === start || seen.has(go)) break;
      loop.push(go); seen.add(go); prev = at; at = go;
    }
    if (loop.length < 3) return false;
    let cx = 0, cy = 0, cz = 0;
    for (const v of loop) { cx += pos[v * 3]; cy += pos[v * 3 + 1]; cz += pos[v * 3 + 2]; }
    const mid = pos.length / 3;
    pos.push(cx / loop.length, cy / loop.length, cz / loop.length);
    for (let i = 0; i < loop.length; i++) idx.push(loop[i], loop[(i + 1) % loop.length], mid);
  }
  return true;
}

/** Turn triangles that face against their neighbours, walking across shared edges. false = the shell cannot be made consistent. */
function orient(idx) {
  const n = idx.length / 3, by = new Map(), seen = new Uint8Array(n);
  const key = (a, b) => (a < b ? a + '_' + b : b + '_' + a);
  for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) {
    const e = key(idx[t * 3 + k], idx[t * 3 + (k + 1) % 3]);
    let l = by.get(e); if (!l) by.set(e, l = []); l.push(t);
  }
  const runs = (t, a, b) => { for (let k = 0; k < 3; k++) if (idx[t * 3 + k] === a && idx[t * 3 + (k + 1) % 3] === b) return true; return false; };
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    seen[s] = 1;
    const stack = [s];
    while (stack.length) {
      const t = stack.pop();
      for (let k = 0; k < 3; k++) {
        const a = idx[t * 3 + k], b = idx[t * 3 + (k + 1) % 3];
        for (const o of by.get(key(a, b))) {
          if (o === t) continue;
          const same = runs(o, a, b);   // a neighbour running the edge the same way faces the other way
          if (seen[o]) { if (same) return false; continue; }
          if (same) { const x = idx[o * 3 + 1]; idx[o * 3 + 1] = idx[o * 3 + 2]; idx[o * 3 + 2] = x; }
          seen[o] = 1; stack.push(o);
        }
      }
    }
  }
  return true;
}

const boxOf = (s) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < s.positions.length; i++) { const k = i % 3; min[k] = Math.min(min[k], s.positions[i]); max[k] = Math.max(max[k], s.positions[i]); }
  return { min, max };
};

function shellSolid(MF, s) {
  const mesh = new MF.Mesh({ numProp: 3, vertProperties: Float32Array.from(s.positions), triVerts: Uint32Array.from(s.indices) });
  const man = new MF.Manifold(mesh);
  if (man.status() !== 'NoError' || man.isEmpty()) { man.delete?.(); throw new Error('open'); }
  return man;
}

/** Signed volume: negative = the shell's faces point inward. */
function signedVolume(s) {
  const P = s.positions, I = s.indices; let v = 0;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    v += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
  }
  return v;
}

/**
 * A flat closed shell of no volume (a one-sided panel the slicer capped, or a doubled panel) becomes a slab `t` thick, hanging below the
 * panel's front side: the front faces stay, a copy shifted by -t along the normal faces the other way, walls join the rims. null when the
 * shell is not one plane, or the slab does not come out at area × t (so nothing odd reaches the solid).
 */
export function thickenSheet(s, t) {
  const P = s.positions, I = s.indices, n = I.length / 3;
  let best = -1, ba = 0, N = null;
  for (let k = 0; k < n; k++) {
    const a = I[k * 3] * 3, b = I[k * 3 + 1] * 3, c = I[k * 3 + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, l = Math.hypot(nx, ny, nz);
    if (l > ba) { ba = l; best = k; N = [nx / l, ny / l, nz / l]; }
  }
  if (best < 0) return null;
  const o = I[best * 3] * 3, bb = boxOf(s), L = Math.max(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]), tol = Math.max(1e-3, L * 1e-4);
  for (let i = 0; i < P.length; i += 3) if (Math.abs((P[i] - P[o]) * N[0] + (P[i + 1] - P[o + 1]) * N[1] + (P[i + 2] - P[o + 2]) * N[2]) > tol) return null;
  const F = [];
  for (let k = 0; k < n; k++) {
    const a = I[k * 3] * 3, b = I[k * 3 + 1] * 3, c = I[k * 3 + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    if ((uy * wz - uz * wy) * N[0] + (uz * wx - ux * wz) * N[1] + (ux * wy - uy * wx) * N[2] > 0) F.push(I[k * 3], I[k * 3 + 1], I[k * 3 + 2]);
  }
  if (!F.length) return null;
  const nv = P.length / 3, pos = Array.from(P);
  for (let v = 0; v < nv; v++) pos.push(P[v * 3] - t * N[0], P[v * 3 + 1] - t * N[1], P[v * 3 + 2] - t * N[2]);
  const idx = [], dir = new Set();
  for (let k = 0; k < F.length; k += 3) { idx.push(F[k], F[k + 1], F[k + 2], F[k] + nv, F[k + 2] + nv, F[k + 1] + nv); for (let e = 0; e < 3; e++) dir.add(F[k + e] + '_' + F[k + (e + 1) % 3]); }
  for (const e of dir) {
    const [a, b] = e.split('_').map(Number);
    if (dir.has(b + '_' + a)) continue;
    idx.push(a, a + nv, b + nv, a, b + nv, b);
  }
  const slab = { positions: pos, indices: idx, closed: true };
  let area = 0;
  for (let k = 0; k < F.length; k += 3) {
    const a = F[k] * 3, b = F[k + 1] * 3, c = F[k + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    area += Math.hypot(uy * wz - uz * wy, uz * wx - ux * wz, ux * wy - uy * wx) / 2;
  }
  const v = Math.abs(signedVolume(slab));
  if (!(v > 0.5 * area * t && v < 1.5 * area * t)) return null;
  return slab;
}

export function plateSolid(MF, tris, { sheet = 0 } = {}) {
  const { shells } = splitShells(tris);
  const parts = [], skipped = []; let thickened = 0;
  for (let s of shells) {
    if (!s.closed) { skipped.push({ triangles: s.indices.length / 3, ...boxOf(s) }); continue; }
    if (Math.abs(signedVolume(s)) < 1e-3) {   // a flat sheet holds nothing to print, unless it is given a thickness
      const slab = sheet > 0 ? thickenSheet(s, sheet) : null;
      if (!slab) { skipped.push({ triangles: s.indices.length / 3, ...boxOf(s) }); continue; }
      s = slab; thickened++;
    }
    // A shell inside out is turned outward: the Library's overlapping pieces are all solid. A real void comes from a host's own boolean.
    if (signedVolume(s) < 0) for (let i = 0; i < s.indices.length; i += 3) { const x = s.indices[i + 1]; s.indices[i + 1] = s.indices[i + 2]; s.indices[i + 2] = x; }
    try { parts.push(shellSolid(MF, s)); } catch { skipped.push({ triangles: s.indices.length / 3, ...boxOf(s) }); }
  }
  if (!parts.length) return { solid: null, used: 0, skipped, thickened };
  const solid = parts.length === 1 ? parts[0] : MF.Manifold.union(parts);
  if (parts.length > 1) for (const p of parts) p.delete?.();
  return { solid, used: parts.length, skipped, thickened };
}

// ---------------------------------------------------------------- filling

/** Straight lines at `angle` degrees, `gap` mm apart, clipped to polygons (even-odd). → [[x1, y1, x2, y2] …] */
export function hatch(polys, gap, angle, phase = 0) {
  const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  let lo = Infinity, hi = -Infinity;
  const edges = [];
  for (const poly of polys) for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    const y1 = -p[0] * s + p[1] * c, y2 = -q[0] * s + q[1] * c, x1 = p[0] * c + p[1] * s, x2 = q[0] * c + q[1] * s;
    if (y1 === y2) continue;
    edges.push(y1 < y2 ? [x1, y1, x2, y2] : [x2, y2, x1, y1]);
    lo = Math.min(lo, y1, y2); hi = Math.max(hi, y1, y2);
  }
  const out = [];
  if (!edges.length) return out;
  const first = Math.ceil((lo - phase) / gap) * gap + phase;
  for (let y = first; y < hi; y += gap) {
    const xs = [];
    for (const e of edges) if (y >= e[1] && y < e[3]) xs.push(e[0] + (y - e[1]) / (e[3] - e[1]) * (e[2] - e[0]));
    xs.sort((m, n) => m - n);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      if (xs[i + 1] - xs[i] < 1e-3) continue;
      out.push([xs[i] * c - y * s, xs[i] * s + y * c, xs[i + 1] * c - y * s, xs[i + 1] * s + y * c]);
    }
  }
  return out;
}

/** Nearest-end ordering so the head does not cross the part for each line. */
function order(segs, from) {
  const left = segs.slice(), out = [];
  let x = from[0], y = from[1];
  while (left.length) {
    let best = 0, bd = Infinity, flip = false;
    for (let i = 0; i < left.length; i++) {
      const s = left[i], d1 = (s[0] - x) ** 2 + (s[1] - y) ** 2, d2 = (s[2] - x) ** 2 + (s[3] - y) ** 2;
      if (d1 < bd) { bd = d1; best = i; flip = false; }
      if (d2 < bd) { bd = d2; best = i; flip = true; }
    }
    const s = left.splice(best, 1)[0];
    out.push(flip ? [s[2], s[3], s[0], s[1]] : s);
    x = out[out.length - 1][2]; y = out[out.length - 1][3];
  }
  return out;
}

// ---------------------------------------------------------------- the slice

export async function slice(MF, tris, job, { yieldEvery = 8, onProgress = null, signal = null } = {}) {
  const warnings = [];
  const fail = (error, extra = {}) => ({ ok: false, error, lines: [], stats: null, warnings, ...extra });
  if (!tris.length) return fail('empty');
  let zMin = Infinity;
  for (const t of tris) for (const p of t) zMin = Math.min(zMin, p[2]);
  const flat = zMin === 0 ? tris : tris.map((t) => t.map((p) => [p[0], p[1], p[2] - zMin]));
  if (Math.abs(zMin) > 0.01) warnings.push({ kind: 'floating', mm: zMin });
  const { solid, used, skipped, thickened } = plateSolid(MF, flat, { sheet: job.sheet === false ? 0 : job.nozzle });
  if (thickened) warnings.push({ kind: 'sheets', n: thickened });
  if (skipped.length) {
    const lost = skipped.reduce((a, x) => a + x.triangles, 0);
    warnings.push({ kind: 'skipped', n: skipped.length, of: skipped.length + used, share: Math.max(1, Math.round(lost / tris.length * 100)) });
  }
  if (!solid) return fail('open', { skipped });

  const bb = solid.boundingBox();
  const size = [bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]];
  if (bb.min[0] < 0 || bb.min[1] < 0 || bb.max[0] > job.bed[0] || bb.max[1] > job.bed[1] || bb.max[2] > job.bed[2]) { solid.delete?.(); return fail('bed', { size }); }

  const W = job.nozzle * 1.1, H = job.layer, first = Math.max(H, Math.min(0.3, job.nozzle * 0.75));
  const count = Math.max(1, Math.ceil((bb.max[2] - first) / H - 1e-6) + 1);
  const zTop = (l) => first + l * H, layerH = (l) => (l === 0 ? first : H), zCut = (l) => zTop(l) - layerH(l) / 2;
  const area = Math.PI * (job.filament / 2) ** 2;
  const CS = MF.CrossSection;
  const cuts = [];
  const pause = async (l, stage) => {
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    if (l % yieldEvery === 0) { onProgress?.({ stage, layer: l, layers: count }); await new Promise((r) => setTimeout(r, 0)); }
  };
  const free = [];   // cross-sections to delete at the end
  const keep = (c) => { free.push(c); return c; };
  try {
    for (let l = 0; l < count; l++) { await pause(l, 'cut'); cuts.push(keep(solid.slice(zCut(l)))); }

    // Supports: from the top down, whatever overhangs what lies under it, kept clear of the part; down to the bed only.
    const support = new Array(count).fill(null);
    if (job.supports) {
      let hang = null;
      for (let l = count - 2; l >= 0; l--) {
        await pause(count - l, 'supports');
        const above = cuts[l + 1], under = keep(cuts[l].offset(Math.max(W, H * 0.9), 'Miter'));
        const fresh = keep(above.subtract(under));
        const down = hang ? keep(hang.add(fresh)) : fresh;
        const clear = keep(cuts[l].offset(W * 1.5, 'Miter'));
        hang = down;
        const s = keep(down.subtract(clear));
        support[l] = s.isEmpty() ? null : s;
      }
    } else {
      let hangs = 0;
      for (let l = 1; l < count && !hangs; l++) {
        const under = cuts[l - 1].offset(H * 1.2, 'Miter'), fresh = cuts[l].subtract(under);
        if (fresh.area() > 1) hangs++;
        under.delete?.(); fresh.delete?.();
      }
      if (hangs) warnings.push({ kind: 'overhang' });
    }

    const out = [';Made by CadCraft print stage', ';Layer height: ' + H, ';Infill: ' + job.infill + '%', ...startLines(job)];
    let x = 0, y = 0, retracted = false, seconds = 0, filament = 0, thinMax = 0, bridgeCount = 0, bridgeArea = 0;
    const fmt = (v) => String(Math.round(v * 1000) / 1000);
    const travelF = 150 * 60, retractLen = job.retract, RF = 40 * 60;
    const travel = (nx, ny, z = null) => {
      const d = Math.hypot(nx - x, ny - y);
      if (d > 1.5 && retractLen > 0 && !retracted) { out.push('G1 E-' + fmt(retractLen) + ' F' + RF); retracted = true; seconds += retractLen / 40; }
      if (d > 0.001 || z != null) out.push('G0 X' + fmt(nx) + ' Y' + fmt(ny) + (z != null ? ' Z' + fmt(z) : '') + ' F' + travelF);
      seconds += d / 150; x = nx; y = ny;
    };
    const extrude = (nx, ny, h, w, feed) => {
      if (retracted) { out.push('G1 E' + fmt(retractLen) + ' F' + RF); retracted = false; seconds += retractLen / 40; }
      const d = Math.hypot(nx - x, ny - y);
      if (d < 0.01) return;
      const e = d * w * h / area;
      filament += e;
      out.push('G1 X' + fmt(nx) + ' Y' + fmt(ny) + ' E' + (Math.round(e * 100000) / 100000) + ' F' + Math.round(feed * 60));
      seconds += d / feed; x = nx; y = ny;
    };
    // Seam (PS.10): "aligned" starts every wall at the corner of its own outline nearest the rear-left of the outline's box, layer after layer, so the
    // join of each loop stacks in one line at the back and can be sanded; "nearest" starts wherever the polygon happens to, as before.
    const seamAt = (poly) => {
      if (job.seam === 'nearest' || poly.length < 3) return poly;
      let x0 = Infinity, y1 = -Infinity;
      for (const p of poly) { if (p[0] < x0) x0 = p[0]; if (p[1] > y1) y1 = p[1]; }
      let best = 0, bd = Infinity;
      for (let i = 0; i < poly.length; i++) { const d = (poly[i][0] - x0) + (y1 - poly[i][1]); if (d < bd - 1e-9) { bd = d; best = i; } }
      return best ? poly.slice(best).concat(poly.slice(0, best)) : poly;
    };
    const loop = (poly, h, w, feed, seam = false) => {
      if (poly.length < 2) return;
      if (seam) poly = seamAt(poly);
      travel(poly[0][0], poly[0][1]);
      for (let i = 1; i <= poly.length; i++) { const p = poly[i % poly.length]; extrude(p[0], p[1], h, w, feed); }
    };
    const lines = (segs, h, w, feed) => { for (const s of order(segs, [x, y])) { travel(s[0], s[1]); extrude(s[2], s[3], h, w, feed); } };

    for (let l = 0; l < count; l++) {
      await pause(l, 'write');
      const h = layerH(l), z = zTop(l), speed = l === 0 ? Math.min(20, job.speed) : job.speed, cut = cuts[l];
      out.push(';LAYER:' + l);
      if (l === 1 && job.fan > 0) out.push('M106 S' + Math.round(job.fan * 2.55));
      if (retracted === false && retractLen > 0 && l > 0) { out.push('G1 E-' + fmt(retractLen) + ' F' + RF); retracted = true; }
      out.push('G0 Z' + fmt(z) + ' F1200');
      if (l === 0 && job.skirt) {
        const base = support[0] ? keep(cut.add(support[0])) : cut;
        const ring = keep(base.offset(4, 'Round', 2, 24));
        const B = ring.bounds();
        if (B.min[0] >= 0 && B.min[1] >= 0 && B.max[0] <= job.bed[0] && B.max[1] <= job.bed[1]) for (const p of ring.toPolygons()) loop(p, h, W, speed);
      }
      // walls, the outer one last so it stays clean
      const rings = [];
      for (let k = 0; k < job.walls; k++) rings.push(keep(cut.offset(-(W / 2 + k * W), 'Miter')));
      if (l % 16 === 0 && cut.area() > 0) {
        const opened = cut.offset(-W / 2, 'Miter').offset(W / 2, 'Miter');
        thinMax = Math.max(thinMax, 1 - opened.area() / cut.area());
        opened.delete?.();
      }
      for (let k = rings.length - 1; k >= 0; k--) for (const p of rings[k].toPolygons()) loop(p, h, W, k === 0 ? speed * 0.6 : speed, true);
      // what is inside the walls: skins where the part ends within `top` or `bottom` layers, sparse infill elsewhere
      const inner = keep(cut.offset(-job.walls * W, 'Miter'));
      if (!inner.isEmpty()) {
        let solidPart = null;
        const add = (c) => { solidPart = solidPart ? keep(solidPart.add(c)) : c; };
        const rangeEnd = (from, step, n) => {
          let common = null;
          for (let i = 1; i <= n; i++) {
            const k = from + step * i;
            if (k < 0 || k >= count) return null;   // past the end of the part: all of it is skin
            common = common ? keep(common.intersect(cuts[k])) : cuts[k];
          }
          return common;
        };
        const up = job.top ? rangeEnd(l, 1, job.top) : inner, down = job.bottom ? rangeEnd(l, -1, job.bottom) : inner;
        add(up ? keep(inner.subtract(up)) : inner);
        add(down ? keep(inner.subtract(down)) : inner);
        // Bridges (PS.10): skin with nothing under it (no layer, no support) is drawn straight across the gap along its short way, slower, fan full,
        // and left out of the ordinary skin so it is not printed twice. Narrow slivers (a slope, not a span) stay ordinary skin.
        if (l > 0 && job.bridges !== false && !solidPart.isEmpty()) {
          const below = support[l - 1] ? keep(cuts[l - 1].add(support[l - 1])) : cuts[l - 1];
          const air = keep(solidPart.subtract(keep(below.offset(H * 1.2, 'Miter'))));
          const span = keep(air.offset(-W * 1.5, 'Miter').offset(W * 1.5, 'Miter'));
          if (span.area() > 4) {
            const B = span.bounds(), wide = B.max[0] - B.min[0] > B.max[1] - B.min[1], ang = wide ? 90 : 0;
            const feed = Math.max(10, Math.min(speed * 0.5, 30));
            out.push(';TYPE:BRIDGE');
            if (job.fan !== 100) out.push('M106 S255');
            lines(hatch(span.toPolygons(), W, ang), h, W * 1.05, feed);
            out.push(job.fan > 0 ? 'M106 S' + Math.round(job.fan * 2.55) : 'M107');
            out.push(';TYPE:FILL');
            bridgeCount++; bridgeArea += span.area();
            solidPart = keep(solidPart.subtract(keep(span.offset(W / 2, 'Miter'))));
          }
        }
        const sparse = keep(inner.subtract(solidPart));
        if (!solidPart.isEmpty()) lines(hatch(solidPart.toPolygons(), W, l % 2 ? 45 : 135), h, W, speed);
        if (job.infill > 0 && !sparse.isEmpty()) lines(hatch(sparse.toPolygons(), W / (job.infill / 100), l % 2 ? 45 : 135), h, W, Math.min(speed * 1.2, 120));
      }
      if (support[l]) lines(hatch(support[l].toPolygons(), 2.5, 0), h, W * 0.9, speed);
    }
    if (thinMax > 0.02) warnings.push({ kind: 'thin', share: Math.round(thinMax * 100) });
    out.push(';END', ...endLines(job));
    const grams = filament * area / 1000 * job.density;
    onProgress?.({ stage: 'done', layer: count, layers: count });
    return { ok: true, lines: out, warnings, skipped, stats: { bridges: bridgeCount, bridgeArea: Math.round(bridgeArea), layers: count, seconds: Math.round(seconds), filament: Math.round(filament), grams: Math.round(grams * 10) / 10, size } };
  } finally {
    for (const c of free) c.delete?.();
    solid.delete?.();
  }
}
