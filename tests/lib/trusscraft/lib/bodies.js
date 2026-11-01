/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bodies.js — a laid-out truss set as sawn-timber solids, for every host (DOM-free; pure; plan mm, z up).
 *   boxMesh(a, b, depth, thick, planeDir) → { positions, indices, volume }   a closed, outward-facing box from a to b (positions relative to a)
 *   memberSegments(layoutTruss, g, z0, sizes) → [{ mark, role, a, b, size, dir }]
 *   speciesColor(species) → '#rrggbb'     a timber colour per species (fixed table for the typical ones, else a stable pick from the id)
 *   buildBodies(layout, designFor, { z0, species, speciesId }) → [{ name, truss, mark, role, size, color, a, b, positions, indices, volume }]
 *     positions are ABSOLUTE (plan x, y, height z) so a host maps them into its own axes with one function
 *   stlText(bodies, map) / objText(bodies, map)    ASCII STL / OBJ of the whole set; map(p) → p' (the host's axes; default: as they are)
 * Hosts: PartCraft (mesh bodies, Y up), ModelCraft (placed meshes, metres), BimCraft (IfcMember via place.js), CadCraft (drawn as entities instead).
 */
import { sizeById } from './tables.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

export function boxMesh(a, b, depth, thick, planeDir) {
  const ax = unit(sub(b, a)), tv = unit(cross([0, 0, 1], [planeDir[0], planeDir[1], 0])), nv = unit(cross(tv, ax));   // nv: in the truss plane, across the member
  const len = Math.hypot(...sub(b, a)), positions = [];
  for (let e = 0; e < 2; e++) for (let s1 = -1; s1 <= 1; s1 += 2) for (let s2 = -1; s2 <= 1; s2 += 2) {
    positions.push(...[0, 1, 2].map((i) => e * len * ax[i] + s1 * (depth / 2) * nv[i] + s2 * (thick / 2) * tv[i]));
  }
  // index = e*4 + (s1>0)*2 + (s2>0)
  const quads = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
  let indices = quads.flatMap(([p, q, r, s]) => [p, q, r, p, r, s]);
  let vol = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const A = positions.slice(indices[i] * 3, indices[i] * 3 + 3), B = positions.slice(indices[i + 1] * 3, indices[i + 1] * 3 + 3), C = positions.slice(indices[i + 2] * 3, indices[i + 2] * 3 + 3);
    vol += (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6;
  }
  if (vol < 0) indices = indices.flatMap((_, i) => (i % 3 === 0 ? [indices[i], indices[i + 2], indices[i + 1]] : []));
  return { positions, indices, volume: Math.abs(vol) };
}

export function memberSegments(t, g, z0 = 0, sizes = {}) {
  const dx = (t.b[0] - t.a[0]) / t.span, dy = (t.b[1] - t.a[1]) / t.span;
  const p = (id) => { const n = g.nodes[id]; return [t.a[0] + dx * n.x, t.a[1] + dy * n.x, z0 + n.z + (g.raise || 0) + (t.zBase || 0)]; };
  return g.members.map((m) => ({ mark: m.mark, role: m.role, a: p(m.a), b: p(m.b), size: sizes[m.role === 'post' || m.role === 'stub' ? 'web' : m.role === 'tail' ? 'top' : m.role], dir: [dx, dy] }));
}

const FIXED = { 'spf-2': '#d9bd85', 'spf-ss': '#e0c795', 'dfl-2': '#c98f55', 'dfl-ss': '#d29a62', 'hf-2': '#d6b98e', 'syp-2': '#d3a566' };
export function speciesColor(id) {
  const s = String(id || '');
  if (FIXED[s]) return FIXED[s];
  let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const hue = 28 + (h % 14), light = 62 + (h % 11);   // warm timber tones only
  const c = (1 - Math.abs(2 * light / 100 - 1)) * 0.45, x = c * (1 - Math.abs(((hue / 60) % 2) - 1)), m = light / 100 - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0] : [x, c, 0];
  return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}

export function buildBodies(layout, designFor, { z0 = 0, speciesId = '' } = {}) {
  const color = speciesColor(speciesId), out = [];
  for (const t of layout.trusses) {
    const d = designFor(t.span, t);
    if (!d) continue;
    for (const s of memberSegments(t, d.g, z0, d.sizes)) {
      const size = sizeById(s.size) || sizeById('2x4'), m = boxMesh(s.a, s.b, size.d, size.b, s.dir);
      const positions = []; for (let i = 0; i < m.positions.length; i += 3) positions.push(m.positions[i] + s.a[0], m.positions[i + 1] + s.a[1], m.positions[i + 2] + s.a[2]);
      out.push({ name: t.id + ' ' + s.mark, truss: t.id, mark: s.mark, role: s.role, size: size.id, color, a: s.a, b: s.b, positions, indices: m.indices, volume: m.volume });
    }
  }
  return out;
}

const fmt = (v) => String(Math.round(v * 1000) / 1000);
export function stlText(bodies, map = (p) => p, name = 'trusscraft') {
  const L = ['solid ' + name];
  for (const b of bodies) {
    const P = []; for (let i = 0; i < b.positions.length; i += 3) P.push(map([b.positions[i], b.positions[i + 1], b.positions[i + 2]]));
    for (let i = 0; i < b.indices.length; i += 3) {
      const [A, B, C] = [P[b.indices[i]], P[b.indices[i + 1]], P[b.indices[i + 2]]], n = unit(cross(sub(B, A), sub(C, A)));
      L.push(`facet normal ${n.map(fmt).join(' ')}`, ' outer loop', ...[A, B, C].map((v) => `  vertex ${v.map(fmt).join(' ')}`), ' endloop', 'endfacet');
    }
  }
  L.push('endsolid ' + name);
  return L.join('\n') + '\n';
}
export function objText(bodies, map = (p) => p) {
  const L = ['# TrussCraft: not a substitute for engineered truss design'];
  let base = 0;
  for (const b of bodies) {
    L.push('o ' + b.name.replace(/\s+/g, '_'));
    for (let i = 0; i < b.positions.length; i += 3) L.push('v ' + map([b.positions[i], b.positions[i + 1], b.positions[i + 2]]).map(fmt).join(' '));
    for (let i = 0; i < b.indices.length; i += 3) L.push(`f ${b.indices[i] + 1 + base} ${b.indices[i + 1] + 1 + base} ${b.indices[i + 2] + 1 + base}`);
    base += b.positions.length / 3;
  }
  return L.join('\n') + '\n';
}
