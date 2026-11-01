/* SPDX-License-Identifier: Apache-2.0 */
/**
 * elements.js — the built job as ELEMENTS a host can make out of its own things (0.8 DC.117, session `cabinetcraft_hosts`): one element per cabinet, filler,
 * end panel, closing panel and countertop piece, each with its pieces as plain prisms. DOM-free, pure; the host adapters (BimCraft's IfcFurniture, ModelCraft's
 * group, CadCraft's block) only turn these into the host's objects, so the geometry is made once, here.
 *
 *   cabinetElements(build, { word, origin }) → [{ no, kind ('cabinet' | 'filler' | 'endpanel' | 'counter'), tag ('base' | 'wall' | 'tall' | 'drawers' | …),
 *        name, run, row, w, h, d, elev (mm), material, pieces: [{ name, role, color, pts: [[x, y]…] (counter-clockwise, mm), z0, z1 (mm) }], bbox: [x0, y0, z0, x1, y1, z1] }]
 *   origin = [ox, oy, oz] mm added to every point (the room's place in the host's axes: project.site). Units: millimetres, z up, whatever the job's unit.
 */
import { allSolids } from './solids.js';
import { colorFor } from './bodies3d.js';

const KEY = { side: 'part.side', bottom: 'part.bottom', top: 'part.top', rail: 'part.rail-front', back: 'part.back', shelf: 'part.shelf', 'shelf-fixed': 'part.shelf-fixed', door: 'part.door', 'drawer-front': 'part.drawer-front', plinth: 'part.plinth', frame: 'part.frame', end: 'part.end', counter: 'part.counter', carcass: 'part.side' };
const area2 = (p) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
const r3 = (v) => Math.round(v * 1000) / 1000;

export function cabinetElements(build, { word = (k) => k, origin = [0, 0, 0] } = {}) {
  const { project } = build;
  const k = project.unit === 'in' ? 25.4 : 1;
  const cellOf = new Map(build.cells.map((c) => [c.no, c]));
  const by = new Map();
  for (const s of allSolids(build)) {
    const sh = s.shape;
    let pts, z0 = sh.z0, z1 = sh.z1;
    if (sh.kind === 'prism') pts = sh.pts.map((q) => s.to(q[0], q[1], 0)).map((q) => [q[0], q[1]]);
    else pts = [[sh.x0, sh.y0], [sh.x1, sh.y0], [sh.x1, sh.y1], [sh.x0, sh.y1]].map(([x, y]) => { const q = s.to(x, y, 0); return [q[0], q[1]]; });
    if (area2(pts) < 0) pts.reverse();
    const piece = { name: (s.no || '') + ' ' + word(KEY[s.role] || 'part.' + s.role), role: s.role, color: colorFor(project, s.role), pts: pts.map((q) => [r3(q[0] * k + origin[0]), r3(q[1] * k + origin[1])]), z0: r3(z0 * k + origin[2]), z1: r3(z1 * k + origin[2]) };
    const key = s.role === 'counter' ? 'C:' + s.no : String(s.no);
    if (!by.has(key)) by.set(key, { no: s.no, run: s.run, row: s.row, role: s.role, pieces: [] });
    by.get(key).pieces.push(piece);
  }
  const out = [];
  for (const g of by.values()) {
    const c = cellOf.get(g.no);
    const kind = g.role === 'counter' ? 'counter' : c && c.kind === 'cab' ? 'cabinet' : g.pieces.every((p) => p.role === 'end') ? (c && c.kind === 'filler' ? 'filler' : 'endpanel') : 'cabinet';
    const xs = g.pieces.flatMap((p) => p.pts.map((q) => q[0])), ys = g.pieces.flatMap((p) => p.pts.map((q) => q[1]));
    const bbox = [Math.min(...xs), Math.min(...ys), Math.min(...g.pieces.map((p) => p.z0)), Math.max(...xs), Math.max(...ys), Math.max(...g.pieces.map((p) => p.z1))];
    const cab = c && c.cab;
    out.push({
      no: g.no, kind, tag: cab ? cab.type : kind, name: (g.no || '') + ' ' + word(kind === 'cabinet' ? 'el.cabinet' : kind === 'counter' ? 'el.counter' : 'el.' + kind),
      run: g.run, row: g.row, w: cab ? r3(cab.w * k) : r3(bbox[3] - bbox[0]), h: cab ? r3(cab.h * k) : r3(bbox[5] - bbox[2]), d: cab ? r3(cab.d * k) : r3(bbox[4] - bbox[1]), elev: cab ? r3(cab.elev * k) : r3(bbox[2] - origin[2]),
      material: c && c.cab ? String(project.picks && project.picks.carcass || '') : '', madeToOrder: !!(c && c.madeToOrder), pieces: g.pieces, bbox: bbox.map(r3),
    });
  }
  return out;
}

/** A prism's 3D triangles (positions, indices) for hosts that want a mesh: top, bottom and sides; points counter-clockwise. */
export function prismMesh(pts, z0, z1) {
  const n = pts.length, pos = [], idx = [];
  for (const p of pts) pos.push(p[0], p[1], z0);
  for (const p of pts) pos.push(p[0], p[1], z1);
  // fan from the first point is right for the convex pieces boxes and cabinet footprints make; concave counters use the ear clipper in bodies3d.js
  for (let i = 1; i + 1 < n; i++) { idx.push(n, n + i, n + i + 1); idx.push(0, i + 1, i); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; idx.push(i, j, n + j, i, n + j, n + i); }
  return { positions: pos, indices: idx };
}
