/* SPDX-License-Identifier: Apache-2.0 */
/**
 * voxels.js — Grid → the cube grid the solvers use (voxel.js: Simulation, Thermal, Flow, Generative) (0.8 CE.1).
 * { h, nx, ny, nz, origin, solid: Uint8Array (1 = inside), count, oddRows: 0 }. A cube is solid when the field at its centre
 * (the mean of its eight corner nodes) is negative. Same element order and corner order as voxel.js.
 */
import { INSIDE, brickOf } from './grid.js';

export function toVoxelGrid(grid, { bbox = null } = {}) {
  const h = grid.h;
  let lo, hi;
  if (bbox) { lo = [0, 1, 2].map((a) => Math.floor(bbox[a] / h)); hi = [0, 1, 2].map((a) => Math.ceil(bbox[a + 3] / h)); }
  else {
    const e = grid.extent();
    if (!e) return { h, nx: 0, ny: 0, nz: 0, origin: [0, 0, 0], solid: new Uint8Array(0), count: 0, oddRows: 0 };
    lo = e.lo.map((b) => b * 8); hi = e.hi.map((b) => b * 8 + 8);
  }
  const nx = hi[0] - lo[0], ny = hi[1] - lo[1], nz = hi[2] - lo[2];
  const solid = new Uint8Array(nx * ny * nz);
  let count = 0;
  const bw = grid.bw;
  for (const key of grid.sortedKeys()) {
    const [bx, by, bz] = brickOf(key), b = grid.bricks.get(key);
    for (let k = 0; k < 8; k++) for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
      const I = bx * 8 + i, J = by * 8 + j, K = bz * 8 + k;
      if (I < lo[0] || I >= hi[0] || J < lo[1] || J >= hi[1] || K < lo[2] || K >= hi[2]) continue;
      let s = 0;
      if (b === INSIDE) s = -8 * bw;
      else for (let c = 0; c < 8; c++) s += grid.at(I + (c & 1), J + (c >> 1 & 1), K + (c >> 2 & 1));
      if (s < 0) { solid[(I - lo[0]) + nx * ((J - lo[1]) + ny * (K - lo[2]))] = 1; count++; }
    }
  }
  // cubes whose own brick is absent but whose corners reach into a stored one are handled by the stored brick's own loop only
  // when they start inside it; the rest are outside by construction (every node of an absent brick is outside the band).
  return { h, nx, ny, nz, origin: [lo[0] * h, lo[1] * h, lo[2] * h], solid, count, oddRows: 0 };
}
