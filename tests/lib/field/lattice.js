/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages; the script layer maps the error code to words (cs-lib-field.js) */
import { FieldError } from './grid.js';
/**
 * lattice.js — strut lists for lattices and channels (0.8 CE.2). Pure geometry, no sampling: it returns beams
 * [ax, ay, az, bx, by, bz, r0, r1] that `beams()` in field.js turns into a field.
 * Unit cells are the textbook ones: simple cubic, body-centred cubic, the octet truss, and the diamond cubic bond network.
 */
const CORNERS = [];
for (let i = 0; i < 8; i++) CORNERS.push([i & 1, i >> 1 & 1, i >> 2 & 1]);
const unit = {};
unit.cubic = () => {
  const out = [];
  for (const a of CORNERS) for (let ax = 0; ax < 3; ax++) if (!a[ax]) { const b = a.slice(); b[ax] = 1; out.push([a, b]); }
  return out;
};
unit.bcc = () => CORNERS.map((c) => [[0.5, 0.5, 0.5], c]);
unit.octet = () => {
  const faces = [];                                       // the six face centres
  for (let ax = 0; ax < 3; ax++) for (const s of [0, 1]) { const c = [0.5, 0.5, 0.5]; c[ax] = s; faces.push(c); }
  const out = [];
  for (const f of faces) for (const c of CORNERS) { const d = Math.abs(f[0] - c[0]) + Math.abs(f[1] - c[1]) + Math.abs(f[2] - c[2]); if (d === 1) out.push([f, c]); }          // corner to face centre: 24
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) { const d2 = (faces[i][0] - faces[j][0]) ** 2 + (faces[i][1] - faces[j][1]) ** 2 + (faces[i][2] - faces[j][2]) ** 2; if (d2 === 0.5) out.push([faces[i], faces[j]]); }   // adjacent face centres: 12
  return out;
};
unit.diamond = () => {
  const fcc = [];
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) for (const o of [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]]) fcc.push([i + o[0], j + o[1], k + o[2]]);
  const inner = [[0.25, 0.25, 0.25], [0.75, 0.75, 0.25], [0.75, 0.25, 0.75], [0.25, 0.75, 0.75]], out = [];
  for (const a of inner) for (const f of fcc) if (Math.abs((a[0] - f[0]) ** 2 + (a[1] - f[1]) ** 2 + (a[2] - f[2]) ** 2 - 3 / 16) < 1e-9) out.push([a, f]);
  return out;
};
export const LATTICE_KINDS = Object.keys(unit);

/**
 * Struts of a lattice filling the box [x0,y0,z0,x1,y1,z1] with cubic cells of side `cell` (whole cells, starting at the box's
 * low corner; the last row may stick out past the box by less than a cell). Shared struts are listed once. Radius r.
 * → Float64Array(8·n), row-major beams.
 */
export function latticeBeams(kind, box, cell, r) {
  if (!unit[kind]) throw new FieldError('lattice_kind', 'field: unknown lattice ' + kind + ' (' + LATTICE_KINDS.join(', ') + ')');
  if (!(cell > 0)) throw new FieldError('cell', 'field: lattice cell must be positive');
  const nx = Math.max(1, Math.ceil((box[3] - box[0]) / cell - 1e-9)), ny = Math.max(1, Math.ceil((box[4] - box[1]) / cell - 1e-9)), nz = Math.max(1, Math.ceil((box[5] - box[2]) / cell - 1e-9));
  if (nx * ny * nz > 4e6) throw new FieldError('cells', 'field: lattice would have more than 4 million cells');
  const cellBeams = unit[kind](), seen = new Set(), out = [];
  const q = (v) => Math.round(v * 1e6);
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
    for (const [a, b] of cellBeams) {
      const A = [q(i + a[0]), q(j + a[1]), q(k + a[2])], B = [q(i + b[0]), q(j + b[1]), q(k + b[2])];
      const lo = A[0] < B[0] || (A[0] === B[0] && (A[1] < B[1] || (A[1] === B[1] && A[2] <= B[2]))) ? [A, B] : [B, A];
      const key = lo[0].join(',') + '>' + lo[1].join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(box[0] + (i + a[0]) * cell, box[1] + (j + a[1]) * cell, box[2] + (k + a[2]) * cell, box[0] + (i + b[0]) * cell, box[1] + (j + b[1]) * cell, box[2] + (k + b[2]) * cell, r, r);
    }
  }
  return Float64Array.from(out);
}

/** Beams along a polyline; `radii` is one number or one per point (a round cone between neighbours). → rows [a, b, r0, r1]. */
export function pathBeams(points, radii) {
  const n = points.length;
  if (n < 2) throw new FieldError('path', 'field: a path needs at least two points');
  const out = [];
  for (let i = 0; i + 1 < n; i++) {
    const r0 = Array.isArray(radii) || ArrayBuffer.isView(radii) ? radii[i] : radii, r1 = Array.isArray(radii) || ArrayBuffer.isView(radii) ? radii[i + 1] : radii;
    out.push([points[i][0], points[i][1], points[i][2], points[i + 1][0], points[i + 1][1], points[i + 1][2], r0, r1]);
  }
  return out;
}
