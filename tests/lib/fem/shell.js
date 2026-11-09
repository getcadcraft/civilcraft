/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shell.js — the four-node flat shell of lib/fem (0.9 SU.908 step 1): membrane + plate bending + a drilling term, 24 dofs
 * [u v w θx θy θz] × 4 corners in global axes. DOM-free, imports nothing, own code (no other program's code was read).
 * An analysis aid, not a code check; your engineer reviews the results.
 *
 * Bending kernels (the Navier simply-supported plate test in tools/fem/test-fem.mjs chose between them; both are kept):
 *   'mitc4'  Mindlin–Reissner plate, rotations independent of w, 2×2 Gauss; transverse shear from the assumed covariant strains
 *            tied at the edge midpoints (K.-J. Bathe, E. N. Dvorkin, Int. J. Numer. Methods Eng. 21 (1985) 367–383; Bathe,
 *            Finite Element Procedures, 2nd ed., 2014, §5.4.2). Shear correction 5/6 (exact for ν = 0 rectangular sections,
 *            Cowper 1966: k = 10(1+ν)/(12+11ν)). Carries shear deformation: thick walls, Timoshenko cantilever.
 *   'dkq'    Discrete Kirchhoff quadrilateral (J.-L. Batoz, M. B. Tahar, Int. J. Numer. Methods Eng. 18 (1982) 1655–1677): thin
 *            plates only (no shear strain); slopes ψ = ∇w on the eight serendipity nodes, the four midside values fixed by the
 *            Kirchhoff condition along each side (cubic w along the side: ψt_mid = 3(wj − wi)/(2L) − (ψt_i + ψt_j)/4, ψn_mid =
 *            (ψn_i + ψn_j)/2; the Hermite cubic's mid-slope).
 *   Rotation convention: u = z θy, v = −z θx (right-hand rule about x, y); thin limit θy = −∂w/∂x, θx = ∂w/∂y.
 * Membrane: bilinear quadrilateral with Wilson's incompatible modes in Taylor's form (derivatives at the centre Jacobian, scaled
 *   by det J0 / det J), condensed per element (R. L. Taylor, P. J. Beresford, E. L. Wilson, Int. J. Numer. Methods Eng. 10
 *   (1976) 1211–1219): passes the patch test on distorted quadrilaterals.
 * Drilling: θz is tied to the element's own in-plane rotation ω = ½(∂v/∂x − ∂u/∂y) by a penalty γ G t ∫(θz − ω)² dA (Hughes &
 *   Brezzi, Comput. Methods Appl. Mech. Eng. 72 (1989) 105–121; γ = 1e-3 here): a flat shell has no singular dof, and the penalty
 *   adds almost no stiffness where shells meet at an angle (it is relative to the element, not absolute).
 * The element is flat: corners are projected on their mean plane (the warp is returned).
 *
 * Units: mm, N, MPa. Resultants are per unit width in the element's local axes (ex, ey, ez) (N/mm, N·mm/mm): Nx Ny Nxy
 * (tension +), Mx My Mxy (Mx > 0 = sagging along x: −z face in tension... the face away from +ez), Qx Qy.
 *
 *   shellAxes(P) → { ex, ey, ez, c, xy: [[x, y] × 4], warp, area }
 *   shellK(P, E, nu, t, { bending = 'mitc4', gamma = 1e-3 }) → { k: Float64Array(576) global, ax, loc: Float64Array(576) local,
 *                                                              xy, alpha: condensation data }
 *   shellMass(P, rhoT) → Float64Array(576) global consistent mass (rhoT = density·thickness, t/mm³·mm; rotary inertia lumped)
 *   shellResultants(el, ulocal24, xi, eta) → [Nx Ny Nxy Mx My Mxy Qx Qy]
 *   toLocal(el, ug24) → local dofs; areaLoad(P, q) → 24 global nodal forces of a uniform global force per area q = [qx qy qz]
 */

const G2 = 1 / Math.sqrt(3);
const GP = [[-G2, -G2], [G2, -G2], [G2, G2], [-G2, G2]];
const XI = [-1, 1, 1, -1], ET = [-1, -1, 1, 1];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

export function shellAxes(P) {
  const d1 = [P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]], d2 = [P[3][0] - P[1][0], P[3][1] - P[1][1], P[3][2] - P[1][2]];
  const ez = unit(cross(d1, d2));
  let ex = [P[1][0] - P[0][0] + P[2][0] - P[3][0], P[1][1] - P[0][1] + P[2][1] - P[3][1], P[1][2] - P[0][2] + P[2][2] - P[3][2]];
  const dz = ex[0] * ez[0] + ex[1] * ez[1] + ex[2] * ez[2];
  ex = unit([ex[0] - dz * ez[0], ex[1] - dz * ez[1], ex[2] - dz * ez[2]]);
  const ey = cross(ez, ex);
  const c = [0, 1, 2].map((k) => (P[0][k] + P[1][k] + P[2][k] + P[3][k]) / 4);
  const xy = [], zz = [];
  for (const p of P) { const r = [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; xy.push([r[0] * ex[0] + r[1] * ex[1] + r[2] * ex[2], r[0] * ey[0] + r[1] * ey[1] + r[2] * ey[2]]); zz.push(r[0] * ez[0] + r[1] * ez[1] + r[2] * ez[2]); }
  const diag = Math.max(Math.hypot(d1[0], d1[1], d1[2]), Math.hypot(d2[0], d2[1], d2[2]));
  const area = 0.5 * Math.abs((xy[2][0] - xy[0][0]) * (xy[3][1] - xy[1][1]) - (xy[3][0] - xy[1][0]) * (xy[2][1] - xy[0][1]));
  return { ex, ey, ez, c, xy, warp: Math.max(...zz.map(Math.abs)) / (diag || 1), area };
}

function shape(xi, eta) {
  const N = [], dr = [], ds = [];
  for (let i = 0; i < 4; i++) { N.push(0.25 * (1 + XI[i] * xi) * (1 + ET[i] * eta)); dr.push(0.25 * XI[i] * (1 + ET[i] * eta)); ds.push(0.25 * ET[i] * (1 + XI[i] * xi)); }
  return { N, dr, ds };
}
function jacobian(xy, s) {
  let a = 0, b = 0, c = 0, d = 0;
  for (let i = 0; i < 4; i++) { a += s.dr[i] * xy[i][0]; b += s.dr[i] * xy[i][1]; c += s.ds[i] * xy[i][0]; d += s.ds[i] * xy[i][1]; }
  const det = a * d - b * c;
  return { a, b, c, d, det, inv: [d / det, -b / det, -c / det, a / det] };       // inv = [[i11 i12],[i21 i22]] row-major
}
function inv(Mat, n) {                                                            // Gauss–Jordan, small n
  const A = Array.from({ length: n }, (_, i) => [...Mat.slice(i * n, i * n + n), ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    const d = A[c][c];
    for (let k = 0; k < 2 * n; k++) A[c][k] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c]; if (f) for (let k = 0; k < 2 * n; k++) A[r][k] -= f * A[c][k]; }
  }
  const out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out[i * n + j] = A[i][n + j];
  return out;
}

// ---------------------------------------------------------------------------------------------------- bending, MITC4
/** Row vectors (length 12, dofs [w θx θy] per node) of the covariant shear strains at (xi, eta): γ_r and γ_s. */
function covariant(xy, xi, eta) {
  const s = shape(xi, eta), gr = new Float64Array(12), gs = new Float64Array(12);
  let xr = 0, yr = 0, xs = 0, ys = 0;
  for (let i = 0; i < 4; i++) { xr += s.dr[i] * xy[i][0]; yr += s.dr[i] * xy[i][1]; xs += s.ds[i] * xy[i][0]; ys += s.ds[i] * xy[i][1]; }
  for (let i = 0; i < 4; i++) {
    gr[3 * i] = s.dr[i]; gr[3 * i + 1] = -yr * s.N[i]; gr[3 * i + 2] = xr * s.N[i];
    gs[3 * i] = s.ds[i]; gs[3 * i + 1] = -ys * s.N[i]; gs[3 * i + 2] = xs * s.N[i];
  }
  return { gr, gs };
}
function bendMitc4(xy, E, nu, t) {
  const D = E * t ** 3 / (12 * (1 - nu * nu)), G = E / (2 * (1 + nu)), Gs = (5 / 6) * G * t;
  const A = covariant(xy, 0, 1), C = covariant(xy, 0, -1), B = covariant(xy, -1, 0), Dd = covariant(xy, 1, 0);
  const K = new Float64Array(144);
  for (const [xi, eta] of GP) {
    const s = shape(xi, eta), J = jacobian(xy, s), w = J.det;
    const bb = [new Float64Array(12), new Float64Array(12), new Float64Array(12)];
    for (let i = 0; i < 4; i++) {
      const dx = J.inv[0] * s.dr[i] + J.inv[1] * s.ds[i], dy = J.inv[2] * s.dr[i] + J.inv[3] * s.ds[i];
      bb[0][3 * i + 2] = dx; bb[1][3 * i + 1] = -dy; bb[2][3 * i + 2] = dy; bb[2][3 * i + 1] = -dx;
    }
    const Db = [[D, D * nu, 0], [D * nu, D, 0], [0, 0, D * (1 - nu) / 2]];
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
      let sum = 0;
      for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) sum += bb[p][a] * Db[p][q] * bb[q][b];
      K[a * 12 + b] += sum * w;
    }
    // assumed shear: γr = ½(1+η)γr(A) + ½(1−η)γr(C); γs = ½(1+ξ)γs(D) + ½(1−ξ)γs(B); [γx γy] = J⁻¹ [γr γs]
    const gr = new Float64Array(12), gs = new Float64Array(12);
    for (let k = 0; k < 12; k++) { gr[k] = 0.5 * (1 + eta) * A.gr[k] + 0.5 * (1 - eta) * C.gr[k]; gs[k] = 0.5 * (1 + xi) * Dd.gs[k] + 0.5 * (1 - xi) * B.gs[k]; }
    const bs = [new Float64Array(12), new Float64Array(12)];
    for (let k = 0; k < 12; k++) { bs[0][k] = J.inv[0] * gr[k] + J.inv[1] * gs[k]; bs[1][k] = J.inv[2] * gr[k] + J.inv[3] * gs[k]; }
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) K[a * 12 + b] += (bs[0][a] * bs[0][b] + bs[1][a] * bs[1][b]) * Gs * w;
  }
  return K;
}
/** Bending and shear rows at one point for results: { kappa: [3×12], gamma: [2×12] } (curvature as sag-positive: M = Db·kappa). */
function mitcRows(xy, xi, eta) {
  const A = covariant(xy, 0, 1), C = covariant(xy, 0, -1), B = covariant(xy, -1, 0), Dd = covariant(xy, 1, 0);
  const s = shape(xi, eta), J = jacobian(xy, s);
  const kap = [new Float64Array(12), new Float64Array(12), new Float64Array(12)];
  for (let i = 0; i < 4; i++) {
    const dx = J.inv[0] * s.dr[i] + J.inv[1] * s.ds[i], dy = J.inv[2] * s.dr[i] + J.inv[3] * s.ds[i];
    // sag-positive curvature = −(θy,x), −(−θx,y), −(θy,y − θx,x)
    kap[0][3 * i + 2] = -dx; kap[1][3 * i + 1] = dy; kap[2][3 * i + 2] = -dy; kap[2][3 * i + 1] = dx;
  }
  const gr = new Float64Array(12), gs = new Float64Array(12);
  for (let k = 0; k < 12; k++) { gr[k] = 0.5 * (1 + eta) * A.gr[k] + 0.5 * (1 - eta) * C.gr[k]; gs[k] = 0.5 * (1 + xi) * Dd.gs[k] + 0.5 * (1 - xi) * B.gs[k]; }
  const gam = [new Float64Array(12), new Float64Array(12)];
  for (let k = 0; k < 12; k++) { gam[0][k] = J.inv[0] * gr[k] + J.inv[1] * gs[k]; gam[1][k] = J.inv[2] * gr[k] + J.inv[3] * gs[k]; }
  return { kappa: kap, gamma: gam };
}

// ---------------------------------------------------------------------------------------------------- bending, DKQ
const SER_XI = [-1, 1, 1, -1, 0, 1, 0, -1], SER_ET = [-1, -1, 1, 1, -1, 0, 1, 0];
function serendipity(xi, eta) {
  const N = new Array(8), dr = new Array(8), ds = new Array(8);
  for (let i = 0; i < 4; i++) {
    const a = XI[i], b = ET[i];
    N[i] = 0.25 * (1 + a * xi) * (1 + b * eta) * (a * xi + b * eta - 1);
    dr[i] = 0.25 * a * (1 + b * eta) * (2 * a * xi + b * eta);
    ds[i] = 0.25 * b * (1 + a * xi) * (a * xi + 2 * b * eta);
  }
  for (let k = 4; k < 8; k++) {
    const a = SER_XI[k], b = SER_ET[k];
    if (a === 0) { N[k] = 0.5 * (1 - xi * xi) * (1 + b * eta); dr[k] = -xi * (1 + b * eta); ds[k] = 0.5 * b * (1 - xi * xi); }
    else { N[k] = 0.5 * (1 + a * xi) * (1 - eta * eta); dr[k] = 0.5 * a * (1 - eta * eta); ds[k] = -eta * (1 + a * xi); }
  }
  return { N, dr, ds };
}
/** 16 × 12: maps dofs [w θx θy]×4 to (ψx, ψy) at the eight nodes (rows 2a, 2a+1), ψ = ∇w = (−θy, θx). */
function dkqPsi(xy) {
  const R = new Float64Array(16 * 12);
  const set = (row, col, v) => { R[row * 12 + col] += v; };
  for (let i = 0; i < 4; i++) { set(2 * i, 3 * i + 2, -1); set(2 * i + 1, 3 * i + 1, 1); }
  for (let k = 0; k < 4; k++) {
    const i = k, j = (k + 1) % 4, dx = xy[j][0] - xy[i][0], dy = xy[j][1] - xy[i][1], L = Math.hypot(dx, dy);
    const tx = dx / L, ty = dy / L, nx = -ty, ny = tx, m = 4 + k;
    // ψt_mid = 3(wj − wi)/(2L) − (ψt_i + ψt_j)/4 ; ψn_mid = (ψn_i + ψn_j)/2 ; ψ_mid = ψt t + ψn n
    for (const [node, sg] of [[i, 1], [j, 1]]) {
      // ψ_i = (−θy, θx): ψt_i = −θy tx + θx ty ; ψn_i = −θy nx + θx ny
      const ct = [[3 * node + 2, -tx], [3 * node + 1, ty]], cn = [[3 * node + 2, -nx], [3 * node + 1, ny]];
      for (const [c, v] of ct) { set(2 * m, c, -0.25 * v * tx * sg); set(2 * m + 1, c, -0.25 * v * ty * sg); }
      for (const [c, v] of cn) { set(2 * m, c, 0.5 * v * nx * sg); set(2 * m + 1, c, 0.5 * v * ny * sg); }
    }
    set(2 * m, 3 * j, 1.5 / L * tx); set(2 * m + 1, 3 * j, 1.5 / L * ty);
    set(2 * m, 3 * i, -1.5 / L * tx); set(2 * m + 1, 3 * i, -1.5 / L * ty);
  }
  return R;
}
function dkqRows(xy, xi, eta, R) {
  const s = shape(xi, eta), J = jacobian(xy, s), q = serendipity(xi, eta);
  const kap = [new Float64Array(12), new Float64Array(12), new Float64Array(12)];
  for (let a = 0; a < 8; a++) {
    const dx = J.inv[0] * q.dr[a] + J.inv[1] * q.ds[a], dy = J.inv[2] * q.dr[a] + J.inv[3] * q.ds[a];
    for (let k = 0; k < 12; k++) {
      const px = R[(2 * a) * 12 + k], py = R[(2 * a + 1) * 12 + k];
      kap[0][k] += dx * px; kap[1][k] += dy * py; kap[2][k] += dy * px + dx * py;
    }
  }
  return { kap, det: J.det };
}
function bendDkq(xy, E, nu, t) {
  const D = E * t ** 3 / (12 * (1 - nu * nu)), R = dkqPsi(xy), K = new Float64Array(144);
  const Db = [[D, D * nu, 0], [D * nu, D, 0], [0, 0, D * (1 - nu) / 2]];
  for (const [xi, eta] of GP) {
    const { kap, det } = dkqRows(xy, xi, eta, R);
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
      let sum = 0;
      for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) sum += kap[p][a] * Db[p][q] * kap[q][b];
      K[a * 12 + b] += sum * det;
    }
  }
  return K;
}

// ---------------------------------------------------------------------------------------------------- membrane + drilling
function membrane(xy, E, nu, t, gamma) {
  const c = E * t / (1 - nu * nu), Dm = [[c, c * nu, 0], [c * nu, c, 0], [0, 0, c * (1 - nu) / 2]];
  const s0 = shape(0, 0), J0 = jacobian(xy, s0);
  const Kuu = new Float64Array(64), Kua = new Float64Array(32), Kaa = new Float64Array(16);
  const Kd = new Float64Array(144);                                               // drilling on [u v θz]×4
  const G = E / (2 * (1 + nu));
  for (const [xi, eta] of GP) {
    const s = shape(xi, eta), J = jacobian(xy, s), w = J.det;
    const Bu = [new Float64Array(8), new Float64Array(8), new Float64Array(8)];
    const dxs = [], dys = [];
    for (let i = 0; i < 4; i++) {
      const dx = J.inv[0] * s.dr[i] + J.inv[1] * s.ds[i], dy = J.inv[2] * s.dr[i] + J.inv[3] * s.ds[i];
      dxs.push(dx); dys.push(dy);
      Bu[0][2 * i] = dx; Bu[1][2 * i + 1] = dy; Bu[2][2 * i] = dy; Bu[2][2 * i + 1] = dx;
    }
    // incompatible modes G1 = 1 − ξ², G2 = 1 − η²: derivatives with J0⁻¹, scaled by det J0 / det J
    const sc = J0.det / J.det;
    const gx = [(J0.inv[0] * (-2 * xi)) * sc, (J0.inv[1] * (-2 * eta)) * sc], gy = [(J0.inv[2] * (-2 * xi)) * sc, (J0.inv[3] * (-2 * eta)) * sc];
    const Ba = [new Float64Array(4), new Float64Array(4), new Float64Array(4)];
    for (let m = 0; m < 2; m++) { Ba[0][2 * m] = gx[m]; Ba[1][2 * m + 1] = gy[m]; Ba[2][2 * m] = gy[m]; Ba[2][2 * m + 1] = gx[m]; }
    for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) {
      const d = Dm[p][q] * w; if (!d) continue;
      for (let a = 0; a < 8; a++) { for (let b = 0; b < 8; b++) Kuu[a * 8 + b] += Bu[p][a] * d * Bu[q][b]; for (let b = 0; b < 4; b++) Kua[a * 4 + b] += Bu[p][a] * d * Ba[q][b]; }
      for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) Kaa[a * 4 + b] += Ba[p][a] * d * Ba[q][b];
    }
    // drilling: (θz − ω), ω = ½(v,x − u,y) ; row over [u v θz]×4
    const row = new Float64Array(12);
    for (let i = 0; i < 4; i++) { row[3 * i] = 0.5 * dys[i]; row[3 * i + 1] = -0.5 * dxs[i]; row[3 * i + 2] = s.N[i]; }
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) Kd[a * 12 + b] += gamma * G * t * row[a] * row[b] * w;
  }
  const Kai = inv(Kaa, 4), Kc = Float64Array.from(Kuu);
  const KaiKau = new Float64Array(32);                                            // Kaa⁻¹ Kau (4×8)
  for (let i = 0; i < 4; i++) for (let j = 0; j < 8; j++) { let sm = 0; for (let k = 0; k < 4; k++) sm += Kai[i * 4 + k] * Kua[j * 4 + k]; KaiKau[i * 8 + j] = sm; }
  for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { let sm = 0; for (let k = 0; k < 4; k++) sm += Kua[a * 4 + k] * KaiKau[k * 8 + b]; Kc[a * 8 + b] -= sm; }
  return { Kc, Kd, KaiKau, Dm };
}

// ---------------------------------------------------------------------------------------------------- the element
export function shellK(P, E, nu, t, { bending = 'mitc4', gamma = 1e-3 } = {}) {
  const ax = shellAxes(P), xy = ax.xy;
  const Kb = bending === 'dkq' ? bendDkq(xy, E, nu, t) : bendMitc4(xy, E, nu, t);
  const mem = membrane(xy, E, nu, t, gamma);
  const kl = new Float64Array(576);
  // local dof order per node: u v w θx θy θz → 6i + (0..5)
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    for (let p = 0; p < 2; p++) for (let q = 0; q < 2; q++) kl[(6 * a + p) * 24 + 6 * b + q] += mem.Kc[(2 * a + p) * 8 + 2 * b + q];
    for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) kl[(6 * a + 2 + p) * 24 + 6 * b + 2 + q] += Kb[(3 * a + p) * 12 + 3 * b + q];
    const map = [0, 1, 5];
    for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) kl[(6 * a + map[p]) * 24 + 6 * b + map[q]] += mem.Kd[(3 * a + p) * 12 + 3 * b + q];
  }
  return { k: transform(kl, ax), loc: kl, ax, xy, KaiKau: mem.KaiKau, Dm: mem.Dm, E, nu, t, bending };
}
function transform(kl, ax, out = new Float64Array(576)) {
  // global = Tᵀ kl T, T = blockdiag(R) with R rows ex, ey, ez (24×24, 8 blocks)
  const R = [ax.ex, ax.ey, ax.ez];
  const tmp = new Float64Array(576);
  for (let i = 0; i < 24; i++) for (let jb = 0; jb < 8; jb++) for (let c = 0; c < 3; c++) {
    let s = 0; for (let r = 0; r < 3; r++) s += kl[i * 24 + 3 * jb + r] * R[r][c];
    tmp[i * 24 + 3 * jb + c] = s;
  }
  for (let ib = 0; ib < 8; ib++) for (let c = 0; c < 3; c++) for (let j = 0; j < 24; j++) {
    let s = 0; for (let r = 0; r < 3; r++) s += R[r][c] * tmp[(3 * ib + r) * 24 + j];
    out[(3 * ib + c) * 24 + j] = s;
  }
  return out;
}
export function toLocal(el, ug) {
  const R = [el.ax.ex, el.ax.ey, el.ax.ez], out = new Float64Array(24);
  for (let b = 0; b < 8; b++) for (let r = 0; r < 3; r++) out[3 * b + r] = R[r][0] * ug[3 * b] + R[r][1] * ug[3 * b + 1] + R[r][2] * ug[3 * b + 2];
  return out;
}

export function shellMass(P, rhoT, ax = shellAxes(P)) {
  const xy = ax.xy, ml = new Float64Array(576);
  for (const [xi, eta] of [[-0.7745966692414834, -0.7745966692414834], [0, -0.7745966692414834], [0.7745966692414834, -0.7745966692414834], [-0.7745966692414834, 0], [0, 0], [0.7745966692414834, 0], [-0.7745966692414834, 0.7745966692414834], [0, 0.7745966692414834], [0.7745966692414834, 0.7745966692414834]]) {
    const wx = (a) => (a === 0 ? 8 / 9 : 5 / 9);
    const w = wx(Math.abs(xi) < 1e-9 ? 0 : 1) * wx(Math.abs(eta) < 1e-9 ? 0 : 1);
    const s = shape(xi, eta), J = jacobian(xy, s), f = rhoT * J.det * w;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      const m = f * s.N[a] * s.N[b];
      for (let d = 0; d < 3; d++) ml[(6 * a + d) * 24 + 6 * b + d] += m;
    }
  }
  return transform(ml, ax);
}
/** Rotary inertia of the plate (θx, θy), lumped: ρ t³/12 · A / 4 per corner — returned as a value to add on those diagonals (global). */
export const rotaryLump = (rho, t, area) => rho * t ** 3 / 12 * area / 4;

export function shellResultants(el, ul, xi = 0, eta = 0) {
  const { xy, E, nu, t } = el;
  const u = new Float64Array(8), b = new Float64Array(12);
  for (let i = 0; i < 4; i++) { u[2 * i] = ul[6 * i]; u[2 * i + 1] = ul[6 * i + 1]; b[3 * i] = ul[6 * i + 2]; b[3 * i + 1] = ul[6 * i + 3]; b[3 * i + 2] = ul[6 * i + 4]; }
  // incompatible amplitudes α = −Kaa⁻¹ Kau u
  const al = new Float64Array(4);
  for (let i = 0; i < 4; i++) { let s = 0; for (let j = 0; j < 8; j++) s -= el.KaiKau[i * 8 + j] * u[j]; al[i] = s; }
  const s = shape(xi, eta), J = jacobian(xy, s), J0 = jacobian(xy, shape(0, 0)), sc = J0.det / J.det;
  let ex = 0, ey = 0, gxy = 0;
  for (let i = 0; i < 4; i++) {
    const dx = J.inv[0] * s.dr[i] + J.inv[1] * s.ds[i], dy = J.inv[2] * s.dr[i] + J.inv[3] * s.ds[i];
    ex += dx * u[2 * i]; ey += dy * u[2 * i + 1]; gxy += dy * u[2 * i] + dx * u[2 * i + 1];
  }
  const g = [[J0.inv[0] * (-2 * xi) * sc, J0.inv[1] * (-2 * eta) * sc], [J0.inv[2] * (-2 * xi) * sc, J0.inv[3] * (-2 * eta) * sc]];
  for (let m = 0; m < 2; m++) { ex += g[0][m] * al[2 * m]; ey += g[1][m] * al[2 * m + 1]; gxy += g[1][m] * al[2 * m] + g[0][m] * al[2 * m + 1]; }
  const Dm = el.Dm, N = [Dm[0][0] * ex + Dm[0][1] * ey, Dm[1][0] * ex + Dm[1][1] * ey, Dm[2][2] * gxy];
  const D = E * t ** 3 / (12 * (1 - nu * nu));
  let kap, gam = [0, 0];
  if (el.bending === 'dkq') {
    const R = dkqPsi(xy), { kap: kr } = dkqRows(xy, xi, eta, R);
    kap = kr.map((r) => r.reduce((sum, v, k) => sum + v * b[k], 0));
  } else {
    const rows = mitcRows(xy, xi, eta);
    kap = rows.kappa.map((r) => r.reduce((sum, v, k) => sum + v * b[k], 0));
    gam = rows.gamma.map((r) => r.reduce((sum, v, k) => sum + v * b[k], 0));
  }
  const G = E / (2 * (1 + nu)), Gs = (5 / 6) * G * t;
  return [N[0], N[1], N[2], D * (kap[0] + nu * kap[1]), D * (nu * kap[0] + kap[1]), D * (1 - nu) / 2 * kap[2], Gs * gam[0], Gs * gam[1]];
}

/** Nodal forces (24, global) of a uniform global force per unit area q = [qx qy qz]: ∫ Nᵢ q dA on the translations. */
export function areaLoad(P, q) {
  const ax = shellAxes(P), out = new Float64Array(24);
  for (const [xi, eta] of GP) {
    const s = shape(xi, eta), J = jacobian(ax.xy, s);
    for (let i = 0; i < 4; i++) for (let d = 0; d < 3; d++) out[6 * i + d] += s.N[i] * q[d] * J.det;
  }
  return out;
}
