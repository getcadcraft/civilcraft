/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bodies3d.js — the job as display bodies for PartCraft's viewport (add-on API 1.1 `api.model.addBodies`; 0.8 DC.117, session `cabinetcraft_addon`).
 * DOM-free, pure. One body per panel (sides, bottoms, tops, backs, shelves, plinths, frame, every door and drawer front), per filler and end panel, per
 * countertop piece; plus the room's floor, its walls (translucent, with the doors and windows cut in) when asked. Colours follow the job's material picks
 * (a display tint, not a claim about a product). Units come out in mm, PartCraft's axes (Y up): room (x, y, z) → (x, z, −y).
 *
 *   viewportBodies(build, { word, room }) → [{ name, color, box | mesh, opacity? }]
 *   triangulate(pts) → [[i, j, k]…] ear clipping of a simple counter-clockwise polygon
 *   GROUP = 'kitchen' (the group id the add-on uses)
 */
import { allSolids } from './solids.js';
import { roomOutline, walls as roomWalls } from './room.js';
import { arcPoints } from './angled.js';

export const GROUP = 'kitchen';
const TINT = {
  'melamine-18': '#d8ccb2', 'melamine-16': '#d8ccb2', 'ply-18': '#d9bd8e', 'ply-15': '#d9bd8e', 'hdf-8': '#b99d76', 'hdf-3': '#b99d76', 'ply-6': '#cdb184',
  'mdf-painted-18': '#e9e6df', 'laminate-19': '#c6ccd2', 'veneer-ply-18': '#b98b5a', 'melamine-front-18': '#ece8df', 'hardwood-19': '#a9763f', 'hardwood-25': '#a9763f',
  'drawer-ply-15': '#d3b07c', 'drawer-melamine-16': '#d8ccb2', 'drawer-bottom-hdf-6': '#b99d76', 'drawer-bottom-ply-9': '#cdb184',
};
const OTHER = '#c9c2b4';
const KEY = { side: 'part.side', bottom: 'part.bottom', top: 'part.top', rail: 'part.rail-front', back: 'part.back', shelf: 'part.shelf', 'shelf-fixed': 'part.shelf-fixed', door: 'part.door', 'drawer-front': 'part.drawer-front', plinth: 'part.plinth', end: 'part.end-panel', frame: 'part.frame-stile', counter: 'bodies.counter' };

export function colorFor(project, role) {
  const pk = project.picks || {};
  const id = ({ side: pk.carcass, bottom: pk.carcass, top: pk.carcass, rail: pk.carcass, shelf: pk.carcass, 'shelf-fixed': pk.carcass, plinth: pk.carcass, back: pk.back, door: pk.fronts, 'drawer-front': pk.fronts, end: pk.fronts, frame: pk.frame })[role];
  if (role === 'counter') return '#8c9096';
  if (role === 'plinth') return '#8a7458';
  return TINT[id] || OTHER;
}

/** Ear clipping of a simple polygon, counter-clockwise. */
export function triangulate(pts) {
  const n = pts.length, idx = pts.map((_, i) => i), out = [];
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const inTri = (p, a, b, c) => cross(a, b, p) >= -1e-9 && cross(b, c, p) >= -1e-9 && cross(c, a, p) >= -1e-9;
  let guard = n * n + 10;
  while (idx.length > 3 && guard-- > 0) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = pts[i0], b = pts[i1], c = pts[i2];
      if (cross(a, b, c) <= 1e-9) continue;
      if (idx.some((j) => j !== i0 && j !== i1 && j !== i2 && inTri(pts[j], a, b, c))) continue;
      out.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([idx[0], idx[1], idx[2]]);
  void n;
  return out;
}

function prismMesh(pts, z0, z1, map) {
  const pos = [], ind = [];
  const P = (p, z) => { const m = map(p[0], p[1], z); pos.push(m[0], m[1], m[2]); return pos.length / 3 - 1; };
  const bot = pts.map((p) => P(p, z0)), top = pts.map((p) => P(p, z1));
  for (const [a, b, c] of triangulate(pts)) { ind.push(top[a], top[b], top[c]); ind.push(bot[a], bot[c], bot[b]); }
  const n = pts.length;
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; ind.push(bot[i], bot[j], top[j], bot[i], top[j], top[i]); }
  return { positions: pos, indices: ind };
}

export function viewportBodies(build, { word = (k) => k, room = true, kick = 0 } = {}) {
  const { project } = build;
  const k = project.unit === 'in' ? 25.4 : 1;
  const W = (x, y, z) => [x * k, z * k, -y * k];   // room → PartCraft world
  const out = [];
  const box = (name, color, p0, p1, extra = {}) => {   // p0/p1: room-coordinate corners (any order), already in the job's unit
    const a = W(...p0), b = W(...p1);
    out.push({ name, color, box: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])], ...extra });
  };
  for (const s of allSolids(build)) {
    const sh = s.shape;
    const label = (s.no || '') + ' ' + word(KEY[s.role] || 'part.' + s.role);
    const color = colorFor(project, s.role);
    if (sh.kind === 'prism') {
      const m = prismMesh(sh.pts, sh.z0, sh.z1, (x, y, z) => W(...s.to(x, y, z)));
      out.push({ name: label, color, mesh: m });
    } else {
      const c = [[sh.x0, sh.y0], [sh.x1, sh.y0], [sh.x1, sh.y1], [sh.x0, sh.y1]].flatMap(([x, y]) => [s.to(x, y, sh.z0), s.to(x, y, sh.z1)]);
      const xs = c.map((q) => q[0]), ys = c.map((q) => q[1]);
      box(label, color, [Math.min(...xs), Math.min(...ys), sh.z0], [Math.max(...xs), Math.max(...ys), sh.z1]);
    }
  }
  if (room) {
    const pts = roomOutline(project.room);
    const f = prismMesh(pts, -20 / k, 0, (x, y, z) => W(x, y, z));
    out.push({ name: word('bodies.floor'), color: '#e9e5db', mesh: f });
    const H = project.room.h, T = 100 / k;
    // a wall piece: a plain box when the wall runs along x or y, else a mesh prism (a slanted wall, or a facet of a curved one)
    const piece = (name, color, A, B, nrm, z0, z1, extra = {}) => {
      if (z1 - z0 < 1e-6 || Math.hypot(B[0] - A[0], B[1] - A[1]) < 1e-6) return;
      const quad = [[A[0] - nrm.x * T, A[1] - nrm.y * T], [B[0] - nrm.x * T, B[1] - nrm.y * T], [B[0], B[1]], [A[0], A[1]]];
      const axis = Math.abs(A[0] - B[0]) < 1e-6 || Math.abs(A[1] - B[1]) < 1e-6;
      if (axis) box(name, color, [quad[0][0], quad[0][1], z0], [quad[2][0], quad[2][1], z1], extra);
      else out.push({ name, color, mesh: prismMesh(quad, z0, z1, (x, y, z) => W(x, y, z)), ...extra });
    };
    for (const wl of roomWalls(project.room)) {
      const fr = wl.frame;
      const P = (s) => [fr.o.x + fr.u.x * s, fr.o.y + fr.u.y * s];
      const ops = (project.openings || []).filter((o) => o.wall === wl.id).sort((a, b) => a.at - b.at);
      const nm = word('bodies.wall') + ' ' + wl.id;
      const WALL = '#cdd6df';
      // the wall as facets: one piece for a straight wall, chords of the arc for a curved one; an opening sits at chord positions
      const facets = wl.arc ? arcPoints([wl.a.x, wl.a.y], [wl.b.x, wl.b.y], wl.arc.sweep, Math.max(6, Math.ceil(Math.abs(wl.arc.sweep) / 7.5))) : [[wl.a.x, wl.a.y], [wl.b.x, wl.b.y]];
      for (let i = 0; i + 1 < facets.length; i++) {
        const A = facets[i], B = facets[i + 1];
        const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
        const nrm = { x: -dy / L, y: dx / L };   // into the room
        const proj = (q) => (q[0] - wl.a.x) * fr.u.x + (q[1] - wl.a.y) * fr.u.y;
        const s0 = proj(A), s1 = proj(B);
        const lerp = (s) => { const t = (s - s0) / ((s1 - s0) || 1); return [A[0] + dx * t, A[1] + dy * t]; };
        let s = Math.min(s0, s1);
        const send = Math.max(s0, s1);
        for (const op of ops) {
          const o0 = Math.max(s, op.at), o1 = Math.min(send, op.at + op.w);
          if (o1 - o0 < 1e-6) continue;
          if (o0 > s) piece(nm, WALL, lerp(s), lerp(o0), nrm, 0, H, { opacity: 0.16 });
          const z0 = op.sill, z1 = op.sill + op.h;
          piece(nm, WALL, lerp(o0), lerp(o1), nrm, 0, z0, { opacity: 0.16 });
          piece(nm, WALL, lerp(o0), lerp(o1), nrm, z1, H, { opacity: 0.16 });
          if (op.kind === 'window') piece(word('bodies.window') + ' ' + op.id, '#8ec3e6', lerp(o0), lerp(o1), nrm, z0, z1, { opacity: 0.35 });
          else piece(word('bodies.door') + ' ' + op.id, '#a47b50', lerp(o0), lerp(o1), nrm, 0, z1, { opacity: 0.5 });
          s = o1;
        }
        if (send > s) piece(nm, WALL, lerp(s), lerp(send), nrm, 0, H, { opacity: 0.16 });
      }
      void P;
    }
  }
  void kick;
  return out;
}
