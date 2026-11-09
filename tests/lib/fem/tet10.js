/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tet10.js — the ten-node quadratic tetrahedron of lib/fem (0.9 SU.908 step 2): linear-elastic stiffness, consistent mass, face
 * pressure, stress and von Mises. DOM-free, imports nothing, own code. An analysis aid, not a code check; your engineer reviews the results.
 *
 * Node order (the order of PartCraft's tetfea.js and of the usual tet10 convention): corners 0 1 2 3, then the midside nodes of the
 * edges 0-1, 1-2, 0-2, 0-3, 1-3, 2-3 (4..9). Shape functions in the volume coordinates L0..L3: Nᵢ = Lᵢ(2Lᵢ − 1) at corners, 4LᵢLⱼ at
 * the edges (O. C. Zienkiewicz, R. L. Taylor, The Finite Element Method, 6th ed., ch. 9; Hughes, The Finite Element Method, §3.9).
 * Integration: Stroud's conical-product rule (Gauss–Legendre in three collapsed directions, 3×3×3 = 27 points, exact to degree 5), so
 * curved (midside off the chord) elements and the consistent mass are integrated well. Faces: the 6-node quadratic triangle with
 * the 6-point degree-4 rule (Dunavant 1985).
 * Faces of the element (corner indices, outward when the tet has positive volume): 0:(0,2,1)  1:(0,1,3)  2:(1,2,3)  3:(0,3,2).
 *
 *   tetK(X, E, nu) → Float64Array(900) (X = 30 coordinates)      tetM(X, rho) → Float64Array(900) consistent mass (rho in t/mm³)
 *   tetStress(X, u30, E, nu, L) → [σx σy σz τxy τyz τzx] at the volume coordinates L = [L0 L1 L2 L3]
 *   vonMises(s) · faceLoad(X, face, p) → Float64Array(30) nodal forces of a pressure p (positive pushes into the body) on a face
 *   tetVolume(X) → the volume with the curved geometry
 */
const EDGE = [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]];
export const FACES = [
  { corners: [0, 2, 1] }, { corners: [0, 1, 3] }, { corners: [1, 2, 3] }, { corners: [0, 3, 2] },   // the midside nodes are found from the corner pairs
];
const GL3 = [[-Math.sqrt(0.6), 5 / 9], [0, 8 / 9], [Math.sqrt(0.6), 5 / 9]];
const RULE = (() => {
  const out = [];
  for (const [a, wa] of GL3) for (const [b, wb] of GL3) for (const [c, wc] of GL3) {
    const u = (a + 1) / 2, v = (b + 1) / 2, w = (c + 1) / 2;
    out.push([u, v * (1 - u), w * (1 - u) * (1 - v), wa * wb * wc / 8 * (1 - u) ** 2 * (1 - v)]);   // x = u, y = v(1−u), z = w(1−u)(1−v)
  }
  return out;
})();
const DL = [[-1, -1, -1], [1, 0, 0], [0, 1, 0], [0, 0, 1]];

/** N and dN/d(x,y,z of the reference tet) at reference point (x, y, z) = (L1, L2, L3). */
export function shapes(x, y, z) {
  const L = [1 - x - y - z, x, y, z], N = new Float64Array(10), dN = new Float64Array(30);
  for (let i = 0; i < 4; i++) { N[i] = L[i] * (2 * L[i] - 1); for (let c = 0; c < 3; c++) dN[3 * i + c] = (4 * L[i] - 1) * DL[i][c]; }
  EDGE.forEach(([i, j], k) => { N[4 + k] = 4 * L[i] * L[j]; for (let c = 0; c < 3; c++) dN[3 * (4 + k) + c] = 4 * (L[i] * DL[j][c] + L[j] * DL[i][c]); });
  return { N, dN };
}
const SH = RULE.map(([x, y, z, w]) => ({ ...shapes(x, y, z), w }));

function jacobian(X, dN) {
  const J = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let a = 0; a < 10; a++) for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) J[3 * r + c] += dN[3 * a + c] * X[3 * a + r];   // J[r][c] = ∂x_r/∂ξ_c
  const det = J[0] * (J[4] * J[8] - J[5] * J[7]) - J[1] * (J[3] * J[8] - J[5] * J[6]) + J[2] * (J[3] * J[7] - J[4] * J[6]);
  const i = [
    (J[4] * J[8] - J[5] * J[7]) / det, (J[2] * J[7] - J[1] * J[8]) / det, (J[1] * J[5] - J[2] * J[4]) / det,
    (J[5] * J[6] - J[3] * J[8]) / det, (J[0] * J[8] - J[2] * J[6]) / det, (J[2] * J[3] - J[0] * J[5]) / det,
    (J[3] * J[7] - J[4] * J[6]) / det, (J[1] * J[6] - J[0] * J[7]) / det, (J[0] * J[4] - J[1] * J[3]) / det];
  return { det, inv: i };                                                         // inv[r][c] = ∂ξ_r/∂x_c
}
function gradients(X, dN, inv, g) {                                                 // g[3a + c] = ∂N_a/∂x_c
  for (let a = 0; a < 10; a++) for (let c = 0; c < 3; c++) g[3 * a + c] = dN[3 * a] * inv[c] + dN[3 * a + 1] * inv[3 + c] + dN[3 * a + 2] * inv[6 + c];
}
export function dMatrix(E, nu) {
  const l = E * nu / ((1 + nu) * (1 - 2 * nu)), m = E / (2 * (1 + nu));
  return [[l + 2 * m, l, l, 0, 0, 0], [l, l + 2 * m, l, 0, 0, 0], [l, l, l + 2 * m, 0, 0, 0], [0, 0, 0, m, 0, 0], [0, 0, 0, 0, m, 0], [0, 0, 0, 0, 0, m]];
}
export function tetVolume(X) { let v = 0; for (const s of SH) v += jacobian(X, s.dN).det * s.w; return v; }

export function tetK(X, E, nu, K = new Float64Array(900)) {
  const D = dMatrix(E, nu), g = new Float64Array(30), B = Array.from({ length: 6 }, () => new Float64Array(30));
  K.fill(0);
  for (const s of SH) {
    const { det, inv } = jacobian(X, s.dN), w = det * s.w;
    gradients(X, s.dN, inv, g);
    for (let a = 0; a < 10; a++) {
      const gx = g[3 * a], gy = g[3 * a + 1], gz = g[3 * a + 2];
      B[0][3 * a] = gx; B[1][3 * a + 1] = gy; B[2][3 * a + 2] = gz;
      B[3][3 * a] = gy; B[3][3 * a + 1] = gx; B[4][3 * a + 1] = gz; B[4][3 * a + 2] = gy; B[5][3 * a] = gz; B[5][3 * a + 2] = gx;
    }
    const DB = D.map((row) => { const o = new Float64Array(30); for (let k = 0; k < 6; k++) if (row[k]) for (let j = 0; j < 30; j++) o[j] += row[k] * B[k][j]; return o; });
    for (let i = 0; i < 30; i++) for (let j = 0; j < 30; j++) { let sum = 0; for (let k = 0; k < 6; k++) sum += B[k][i] * DB[k][j]; K[i * 30 + j] += sum * w; }
  }
  return K;
}
export function tetM(X, rho, M = new Float64Array(900)) {
  M.fill(0);
  for (const s of SH) {
    const w = jacobian(X, s.dN).det * s.w * rho;
    for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) { const m = w * s.N[a] * s.N[b]; for (let d = 0; d < 3; d++) M[(3 * a + d) * 30 + 3 * b + d] += m; }
  }
  return M;
}
/** Stress at volume coordinates L (any point; (L1, L2, L3) are the reference x, y, z). */
export function tetStress(X, u, E, nu, L) {
  const { dN } = shapes(L[1], L[2], L[3]), { inv } = jacobian(X, dN), g = new Float64Array(30);
  gradients(X, dN, inv, g);
  const e = [0, 0, 0, 0, 0, 0];
  for (let a = 0; a < 10; a++) {
    const gx = g[3 * a], gy = g[3 * a + 1], gz = g[3 * a + 2], ux = u[3 * a], uy = u[3 * a + 1], uz = u[3 * a + 2];
    e[0] += gx * ux; e[1] += gy * uy; e[2] += gz * uz; e[3] += gy * ux + gx * uy; e[4] += gz * uy + gy * uz; e[5] += gz * ux + gx * uz;
  }
  const D = dMatrix(E, nu);
  return D.map((row) => row.reduce((s, v, k) => s + v * e[k], 0));
}
export const vonMises = (s) => Math.sqrt(0.5 * ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2) + 3 * (s[3] ** 2 + s[4] ** 2 + s[5] ** 2));

const T6 = [[0.445948490915965, 0.445948490915965, 0.223381589678011], [0.445948490915965, 0.10810301816807, 0.223381589678011], [0.10810301816807, 0.445948490915965, 0.223381589678011],
  [0.091576213509771, 0.091576213509771, 0.109951743655322], [0.091576213509771, 0.816847572980459, 0.109951743655322], [0.816847572980459, 0.091576213509771, 0.109951743655322]];
/** Quadratic-triangle shapes on (a, b, c = 1 − a − b) in the order corners 0 1 2, then mids 01, 12, 20. */
function tri6(a, b) {
  const c = 1 - a - b, L = [a, b, c];
  return { N: [L[0] * (2 * L[0] - 1), L[1] * (2 * L[1] - 1), L[2] * (2 * L[2] - 1), 4 * L[0] * L[1], 4 * L[1] * L[2], 4 * L[2] * L[0]],
    da: [4 * a - 1, 0, -(4 * c - 1), 4 * b, -4 * b, 4 * (c - a)], db: [0, 4 * b - 1, -(4 * c - 1), 4 * a, 4 * (c - b), -4 * a] };
}
/** Nodal forces (30) of pressure p (N/mm², positive pushing into the body) on face f (0..3). */
export function faceLoad(X, f, p) {
  const F = FACES[f];
  // the face's six nodes in tri6 order: corners c0 c1 c2, mids between (c0,c1), (c1,c2), (c2,c0)
  const c = F.corners, nodes = [c[0], c[1], c[2], midOf(c[0], c[1]), midOf(c[1], c[2]), midOf(c[2], c[0])];
  const out = new Float64Array(30);
  for (const [a, b, w] of T6) {
    const s = tri6(a, b), tu = [0, 0, 0], tv = [0, 0, 0];
    for (let k = 0; k < 6; k++) for (let d = 0; d < 3; d++) { tu[d] += s.da[k] * X[3 * nodes[k] + d]; tv[d] += s.db[k] * X[3 * nodes[k] + d]; }
    const n = [tu[1] * tv[2] - tu[2] * tv[1], tu[2] * tv[0] - tu[0] * tv[2], tu[0] * tv[1] - tu[1] * tv[0]];   // area vector of the reference unit triangle (outward for FACES' corner order); weights sum to 1, the triangle is ½
    for (let k = 0; k < 6; k++) for (let d = 0; d < 3; d++) out[3 * nodes[k] + d] += -p * s.N[k] * n[d] * w * 0.5;
  }
  return out;
}
function midOf(i, j) {
  const a = Math.min(i, j), b = Math.max(i, j);
  return 4 + EDGE.findIndex(([x, y]) => x === a && y === b);
}
