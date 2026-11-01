/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solids.js — the whole job as solid pieces in room coordinates, for the 3D drawing and the viewport (0.8 DC.117, session `cabinetcraft_addon`).
 * DOM-free, pure. Every cabinet's panels, back, shelves, plinth, frame and fronts (solid.js boxesOf, plus the frame, plus corner.js), the fillers and end
 * panels, the countertops. Lengths in the job's unit; z up from the floor (a hung cabinet's `elev` is included).
 *
 *   cellBoxes(build, cell) → [{ role, x0…z1 } | { role, kind: 'prism', pts, z0, z1 }] in the cell's own frame (x from its start, y out from the wall)
 *   allSolids(build) → [{ no, run, row, role, shape (local), to(x, y, z) → [X, Y, Z] room coordinates }]
 */
import { boxesOf } from './solid.js';
import { toWorld, cellToWorld } from './footprint.js';

export function cellBoxes(build, c) {
  const { R, F } = build;
  if (c.madeToOrder) return curvedSolids(c);
  if (c.corner) return c.corner.solids.map((s) => (s.kind === 'prism' ? { ...s, z0: s.z0 + c.cab.elev, z1: s.z1 + c.cab.elev } : { ...s, z0: s.z0 + c.cab.elev, z1: s.z1 + c.cab.elev }));
  const ff = c.construction === 'faceframe';
  const cabM = ff ? { ...c.cab, d: Math.max(1, c.cab.d - F.t) } : c.cab;
  const out = boxesOf({ ...cabM, no: c.no }, R).filter((b) => b.role !== 'door' && b.role !== 'drawer-front');
  const fy = (ff ? cabM.d + F.t : cabM.d);
  if (ff && c.frame) {
    const kick = c.frame.kick, bh = c.frame.boxH;
    out.push({ role: 'frame', x0: 0, y0: cabM.d, z0: kick, x1: F.stile + (c.blind && c.hinge === 'right' ? c.blind : 0), y1: cabM.d + F.t, z1: kick + bh });
    out.push({ role: 'frame', x0: c.cab.w - F.stile - (c.blind && c.hinge !== 'right' ? c.blind : 0), y0: cabM.d, z0: kick, x1: c.cab.w, y1: cabM.d + F.t, z1: kick + bh });
    for (const r of c.frame.rails) out.push({ role: 'frame', x0: F.stile, y0: cabM.d, z0: r.y, x1: c.cab.w - F.stile, y1: cabM.d + F.t, z1: r.y + r.h });
  }
  for (const f of c.fronts) out.push({ role: f.kind === 'blind' ? 'door' : f.kind === 'door' ? 'door' : 'drawer-front', x0: f.x, y0: fy, z0: f.y, x1: f.x + f.w, y1: fy + R.frontT, z1: f.y + f.h });
  return out.map((b) => ({ ...b, z0: b.z0 + c.cab.elev, z1: b.z1 + c.cab.elev }));
}

export function allSolids(build) {
  const { layout, R, project } = build;
  const out = [];
  const place = (L, cell) => (x, y, z) => { const p = cellToWorld(L, cell, x, y); return [p.x, p.y, z]; };
  for (const L of layout.runs) {
    for (const c of build.cells.filter((q) => q.run === L.run.id && q.kind === 'cab')) {
      const to = place(L, c.cell);
      for (const b of cellBoxes(build, c)) out.push({ no: c.no, run: L.run.id, row: c.row, role: b.role, shape: b, to });
    }
    for (const row of ['base', 'upper']) for (const cell of L.rows[row].cells) {
      if (cell.kind !== 'filler' && cell.kind !== 'endpanel') continue;
      const z0 = row === 'upper' ? (L.rows.upper.cells.find((q) => q.kind === 'cab')?.cab.elev || 0) : 0;
      const depth = cell.kind === 'endpanel' ? cell.depth : R.frontT;
      const rd = L.rows[row].depth || depth;
      const b = { role: 'end', x0: 0, y0: cell.kind === 'endpanel' ? 0 : rd, z0, x1: cell.w, y1: cell.kind === 'endpanel' ? depth : rd + depth, z1: z0 + cell.height };
      out.push({ no: cell.no, run: L.run.id, row, role: 'end', shape: b, to: place(L, cell) });
    }
  }
  const capOf = new Map(build.cells.filter((c) => c.kind === 'cab').map((c) => [c.no, c.cab.h]));
  for (const cs of layout.counters) {
    const L = layout.runs.find((r) => r.run.id === cs.run);
    if (!L) continue;
    const top = Math.max(0, ...(cs.ids || []).map((no) => capOf.get(no) || 0));
    const tz = project.counter.t;
    const to = cs.world ? (x, y, z) => [x, y, z] : (x, y, z) => { const p = toWorld(L.frame, x, y); return [p.x, p.y, z]; };
    const shape = cs.poly ? { role: 'counter', kind: 'prism', pts: cs.poly, z0: top, z1: top + tz } : { role: 'counter', x0: cs.x0, y0: cs.y0 || 0, z0: top, x1: cs.x0 + cs.length, y1: (cs.y0 || 0) + cs.width, z1: top + tz };
    out.push({ no: cs.no, run: cs.run, row: 'counter', role: 'counter', shape, to });
  }
  // the closing panels of corners that are not right angles: a panel standing on the end face of the run that stopped short (world coordinates)
  for (const wd of build.wedges || []) {
    if (!wd.height) continue;
    const [P, X, Q] = wd.tri;
    const dx = X[0] - P[0], dy = X[1] - P[1], L = Math.hypot(dx, dy) || 1;
    let nx = -dy / L, ny = dx / L;
    if (nx * (Q[0] - P[0]) + ny * (Q[1] - P[1]) < 0) { nx = -nx; ny = -ny; }
    const th = build.R.frontT;
    out.push({ no: wd.no, run: wd.from, row: wd.row, role: 'end', shape: { role: 'end', kind: 'prism', pts: [P, X, [X[0] + nx * th, X[1] + ny * th], [P[0] + nx * th, P[1] + ny * th]], z0: wd.z0, z1: wd.z0 + wd.height }, to: (x, y, z) => [x, y, z] });
  }
  return out;
}

/** A made-to-order cabinet with a curved front: a segmented, display-only body (the sector between the wall circle and the front circle, in slices). */
function curvedSolids(c) {
  const m = c.madeToOrder, out = [];
  const z0 = c.cab.elev || 0, z1 = z0 + c.cab.h;
  for (const sl of m.slices) out.push({ role: 'carcass', kind: 'prism', pts: sl, z0, z1 });
  return out;
}
