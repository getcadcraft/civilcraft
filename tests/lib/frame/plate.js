/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate.js — the 4-node flat shell element (0.8 SU.1056 step 1): a Mindlin–Reissner plate with MITC4 transverse shear plus a
 * membrane with Taylor's incompatible modes, for slabs and walls in the frame solver (plate-solve.js). DOM-free, imports
 * nothing. An analysis aid, not a code check.
 *
 * Method:
 *   - bending: Mindlin–Reissner plate, rotations independent of w, 2 × 2 Gauss; transverse shear by the MITC4 assumed
 *     covariant strains tied at the edge midpoints (K.-J. Bathe, E. N. Dvorkin, "A four-node plate bending element based on
 *     Mindlin/Reissner plate theory and a mixed interpolation", Int. J. Numer. Methods Eng. 21 (1985) 367–383; Bathe, Finite
 *     Element Procedures, 2nd ed., 2014, §5.4.2) — free of shear locking, so thin slabs come out right;
 *   - membrane: the bilinear quadrilateral with Wilson's incompatible modes (1 − ξ², 1 − η²) in Taylor's form (derivatives at
 *     the centre Jacobian scaled by det J₀ / det J), condensed out per element (R. L. Taylor, P. J. Beresford, E. L. Wilson,
 *     "A non-conforming element for stress analysis", Int. J. Numer. Methods Eng. 10 (1976) 1211–1219) — passes the patch
 *     test on distorted meshes and bends in plane without locking (walls as shear walls);
 *   - no drilling stiffness: the rotation about a plate's normal is stiffened only by what else meets the node (a member, a
 *     plate at an angle); where nothing does, the solver holds that direction exactly (the frame solver's idle-rotation rule);
 *   - a flat element: the four corners are projected on their mean plane (warp is measured and reported);
 *   - shear correction factor 5/6; ν from the material's E and G (ν = E / 2G − 1).
 *
 * Plate axes (results are given in them, the same for every plate of a slab or a wall): a horizontal plate (|n·Z| > 0.999999)
 * takes x = global X, y = Y, z = Z whatever its corner order; any other plate takes z = its normal turned so that x = Z × n
 * points toward +X (else +Y): x is horizontal, y runs up the plate. Corner order may be either way round.
 *
 * Results per plate (resultants per unit length, N/mm and N·mm/mm): Nx, Ny, Nxy (membrane; tension +), Mx, My, Mxy, Qx, Qy.
 * Signs: Mx > 0 puts the plate's −z face in tension along x (a slab sagging under gravity: Mx > 0, as frame members' My);
 * Mxy follows Mx (Mxy = −∫σxy ζ dζ); Qx, Qy = transverse shear on the faces whose outward normals are +x, +y, along +z.
 *
 *   plateAxes(P) → { ex, ey, ez, c, xy: [[x, y]×4], order (the corners in counter-clockwise plate order), warp (mm), area }
 *   plateStiffness(P, E, nu, t) → { kg (24×24 global, row-major, corners in `order`), ax, kl, mem: { kii⁻¹·kic } }
 *   plateResultants(el, ul24, xi, eta) → [Nx, Ny, Nxy, Mx, My, Mxy, Qx, Qy] at a point; ul24 = the element's local dofs
 *   plateGaussResultants(el, ul24) → the four Gauss points' resultants (for smoothing to the corners)
 *   pressureLoads(P, ax, p) → [4] corner forces of a uniform pressure p (N/mm²) per unit area: ∫ Nᵢ p dA
 *   gaussPoints(ax) → the 2 × 2 Gauss points in plate axes; extrapolate(gv) → corner values from them
 *   toLocal(el, ug24) → local dofs from the 24 global dofs of the element's corners (in `order`)
 */

export const SHEAR_K = 5 / 6;
const G = 1 / Math.sqrt(3);
const GAUSS = [[-G, -G], [G, -G], [G, G], [-G, G]];
const XI = [-1, 1, 1, -1], ETA = [-1, -1, 1, 1];

const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return [a[0] / l, a[1] / l, a[2] / l]; };

/** Shape functions and natural derivatives at (ξ, η). */
function shape(xi, eta) {
  const N = new Array(4), dx = new Array(4), de = new Array(4);
  for (let i = 0; i < 4; i++) {
    N[i] = 0.25 * (1 + XI[i] * xi) * (1 + ETA[i] * eta);
    dx[i] = 0.25 * XI[i] * (1 + ETA[i] * eta);
    de[i] = 0.25 * ETA[i] * (1 + XI[i] * xi);
  }
  return { N, dx, de };
}
/** J = [[x,ξ y,ξ], [x,η y,η]], its determinant and inverse. */
function jac(xy, s) {
  let a = 0, b = 0, c = 0, d = 0;
  for (let i = 0; i < 4; i++) { a += s.dx[i] * xy[i][0]; b += s.dx[i] * xy[i][1]; c += s.de[i] * xy[i][0]; d += s.de[i] * xy[i][1]; }
  const det = a * d - b * c;
  return { J: [a, b, c, d], det, inv: [d / det, -b / det, -c / det, a / det] };
}

/** The plate's axes and its corners in them. P = four [x, y, z]. */
export function plateAxes(P) {
  const n0 = unit(cross([P[2][0] - P[0][0], P[2][1] - P[0][1], P[2][2] - P[0][2]], [P[3][0] - P[1][0], P[3][1] - P[1][1], P[3][2] - P[1][2]]));
  let ex, ey, ez;
  if (Math.abs(n0[2]) > 0.999999) { ex = [1, 0, 0]; ey = [0, 1, 0]; ez = [0, 0, 1]; }
  else {
    let n = n0;
    let x = [-n[1], n[0], 0];                                // Z × n
    if (x[0] < -1e-9 || (Math.abs(x[0]) <= 1e-9 && x[1] < 0)) { n = [-n[0], -n[1], -n[2]]; x = [-x[0], -x[1], 0]; }
    ex = unit(x); ez = n; ey = cross(ez, ex);
  }
  const c = [0, 1, 2].map((k) => (P[0][k] + P[1][k] + P[2][k] + P[3][k]) / 4);
  const loc = P.map((p) => { const d = [p[0] - c[0], p[1] - c[1], p[2] - c[2]]; return [dot(d, ex), dot(d, ey), dot(d, ez)]; });
  const warp = Math.max(...loc.map((q) => Math.abs(q[2])));
  // corner order counter-clockwise about ez
  let a2 = 0;
  for (let i = 0; i < 4; i++) { const p = loc[i], q = loc[(i + 1) % 4]; a2 += p[0] * q[1] - q[0] * p[1]; }
  const order = a2 >= 0 ? [0, 1, 2, 3] : [0, 3, 2, 1];
  return { ex, ey, ez, c, xy: order.map((k) => [loc[k][0], loc[k][1]]), order, warp, area: Math.abs(a2) / 2 };
}

/** Plane-stress matrix × factor: f [[1 ν 0][ν 1 0][0 0 (1−ν)/2]] / (1 − ν²). */
const dMat = (f, nu) => { const k = f / (1 - nu * nu); return [k, k * nu, 0, k * nu, k, 0, 0, 0, k * (1 - nu) / 2]; };

/** Element stiffness: local 24 × 24 (per corner u v w θx θy θz) and global. */
export function plateStiffness(P, E, nu, t) {
  const ax = plateAxes(P);
  const xy = ax.xy;
  const Gm = E / (2 * (1 + nu));
  const Dm = dMat(E * t, nu), Db = dMat(E * t ** 3 / 12, nu), Ds = SHEAR_K * Gm * t;
  const kl = new Float64Array(576);
  const add = (r, c, v) => { kl[r * 24 + c] += v; };
  // ── membrane: compatible (8: u, v per corner) + 4 incompatible modes, condensed
  const kcc = new Float64Array(64), kci = new Float64Array(32), kii = new Float64Array(16);
  const j0 = jac(xy, shape(0, 0));
  for (const [xi, eta] of GAUSS) {
    const s = shape(xi, eta), j = jac(xy, s), w = j.det;
    const Bm = new Float64Array(24);                                // 3 × 8
    for (let i = 0; i < 4; i++) {
      const nx = j.inv[0] * s.dx[i] + j.inv[1] * s.de[i], ny = j.inv[2] * s.dx[i] + j.inv[3] * s.de[i];
      Bm[2 * i] = nx; Bm[8 + 2 * i + 1] = ny; Bm[16 + 2 * i] = ny; Bm[16 + 2 * i + 1] = nx;
    }
    const sc = j0.det / j.det;
    const d1 = [-2 * xi, 0], d2 = [0, -2 * eta];                    // ∂P/∂ξ, ∂P/∂η of P1 = 1 − ξ², P2 = 1 − η²
    const cart = (d) => [sc * (j0.inv[0] * d[0] + j0.inv[1] * d[1]), sc * (j0.inv[2] * d[0] + j0.inv[3] * d[1])];
    const p1 = cart(d1), p2 = cart(d2);
    const Bi = new Float64Array(12);                                // 3 × 4: α1 u·P1, α2 u·P2, α3 v·P1, α4 v·P2
    Bi[0] = p1[0]; Bi[1] = p2[0]; Bi[4 + 2] = p1[1]; Bi[4 + 3] = p2[1];
    Bi[8] = p1[1]; Bi[9] = p2[1]; Bi[10] = p1[0]; Bi[11] = p2[0];
    const DB = (B, cols) => { const o = new Float64Array(3 * cols); for (let r = 0; r < 3; r++) for (let c = 0; c < cols; c++) o[r * cols + c] = Dm[r * 3] * B[c] + Dm[r * 3 + 1] * B[cols + c] + Dm[r * 3 + 2] * B[2 * cols + c]; return o; };
    const DBm = DB(Bm, 8), DBi = DB(Bi, 4);
    for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { let v = 0; for (let r = 0; r < 3; r++) v += Bm[r * 8 + a] * DBm[r * 8 + b]; kcc[a * 8 + b] += v * w; }
    for (let a = 0; a < 8; a++) for (let b = 0; b < 4; b++) { let v = 0; for (let r = 0; r < 3; r++) v += Bm[r * 8 + a] * DBi[r * 4 + b]; kci[a * 4 + b] += v * w; }
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) { let v = 0; for (let r = 0; r < 3; r++) v += Bi[r * 4 + a] * DBi[r * 4 + b]; kii[a * 4 + b] += v * w; }
  }
  const kiiInv = inv4(kii);
  const R = new Float64Array(32);                                   // kii⁻¹ kic (4 × 8): α = −R u_m
  for (let a = 0; a < 4; a++) for (let b = 0; b < 8; b++) { let v = 0; for (let c = 0; c < 4; c++) v += kiiInv[a * 4 + c] * kci[b * 4 + c]; R[a * 8 + b] = v; }
  const mdof = (k) => 6 * (k >> 1) + (k & 1);                       // membrane dof k (u1 v1 u2 …) → local 24
  for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
    let v = kcc[a * 8 + b];
    for (let c = 0; c < 4; c++) v -= kci[a * 4 + c] * R[c * 8 + b];
    add(mdof(a), mdof(b), v);
  }
  // ── bending + MITC4 shear: dofs per corner w, θx, θy (local 2, 3, 4); βx = θy, βy = −θx
  const tie = tying(xy);
  const pdof = (k) => 6 * Math.floor(k / 3) + 2 + (k % 3);          // plate dof k (w θx θy per corner) → local 24
  for (const [xi, eta] of GAUSS) {
    const s = shape(xi, eta), j = jac(xy, s), w = j.det;
    const Bb = bendB(s, j), Bs = shearB(tie, j, xi, eta);
    for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
      let v = 0;
      for (let r = 0; r < 3; r++) v += Bb[r * 12 + a] * (Db[r * 3] * Bb[b] + Db[r * 3 + 1] * Bb[12 + b] + Db[r * 3 + 2] * Bb[24 + b]);
      v += Ds * (Bs[a] * Bs[b] + Bs[12 + a] * Bs[12 + b]);
      if (v) add(pdof(a), pdof(b), v * w);
    }
  }
  const T = [...ax.ex, ...ax.ey, ...ax.ez];
  const kg = transform(kl, T);
  return { kg, kl, ax, T, E, nu, t, Dm, Db, Ds, R };
}

/** Bending B (3 × 12; κx = βx,x, κy = βy,y, κxy = βx,y + βy,x) at a point. */
function bendB(s, j) {
  const B = new Float64Array(36);
  for (let i = 0; i < 4; i++) {
    const nx = j.inv[0] * s.dx[i] + j.inv[1] * s.de[i], ny = j.inv[2] * s.dx[i] + j.inv[3] * s.de[i];
    const cx = 3 * i + 1, cy = 3 * i + 2;                           // θx, θy columns
    B[cy] += nx;                                                    // κx = Σ Nᵢ,x θyᵢ
    B[12 + cx] -= ny;                                               // κy = −Σ Nᵢ,y θxᵢ
    B[24 + cy] += ny; B[24 + cx] -= nx;                             // κxy = Σ (Nᵢ,y θyᵢ − Nᵢ,x θxᵢ)
  }
  return B;
}
/** Covariant transverse shear rows at the four MITC4 tying points: ξ-rows at (0, ∓1), η-rows at (∓1, 0). */
function tying(xy) {
  const row = (xi, eta, dir) => {
    const s = shape(xi, eta);
    const d = dir === 0 ? s.dx : s.de;
    let xd = 0, yd = 0;
    for (let i = 0; i < 4; i++) { xd += d[i] * xy[i][0]; yd += d[i] * xy[i][1]; }
    const r = new Float64Array(12);
    for (let i = 0; i < 4; i++) {
      r[3 * i] = d[i];                                              // w,ξ
      r[3 * i + 2] += xd * s.N[i];                                  // x,ξ βx = x,ξ θy
      r[3 * i + 1] -= yd * s.N[i];                                  // y,ξ βy = −y,ξ θx
    }
    return r;
  };
  return { xiB: row(0, -1, 0), xiT: row(0, 1, 0), etL: row(-1, 0, 1), etR: row(1, 0, 1) };
}
/** Cartesian shear B (2 × 12) at (ξ, η) from the tied covariant strains: [γx γy] = J⁻¹ [γ̃ξ γ̃η]. */
function shearB(tie, j, xi, eta) {
  const B = new Float64Array(24);
  for (let k = 0; k < 12; k++) {
    const gx = 0.5 * (1 - eta) * tie.xiB[k] + 0.5 * (1 + eta) * tie.xiT[k];
    const ge = 0.5 * (1 - xi) * tie.etL[k] + 0.5 * (1 + xi) * tie.etR[k];
    B[k] = j.inv[0] * gx + j.inv[1] * ge;
    B[12 + k] = j.inv[2] * gx + j.inv[3] * ge;
  }
  return B;
}

function inv4(m) {
  const a = Array.from({ length: 4 }, (_, i) => [...m.slice(i * 4, i * 4 + 4), ...[0, 1, 2, 3].map((j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < 4; c++) {
    let p = c;
    for (let r = c + 1; r < 4; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 8; j++) a[c][j] /= d;
    for (let r = 0; r < 4; r++) if (r !== c && a[r][c]) { const f = a[r][c]; for (let j = 0; j < 8; j++) a[r][j] -= f * a[c][j]; }
  }
  const o = new Float64Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) o[i * 4 + j] = a[i][4 + j];
  return o;
}

/** kg = Tᵀ kl T with T = blockdiag(R × 8), R rows = ex, ey, ez. */
function transform(kl, R) {
  const kg = new Float64Array(576);
  for (let bi = 0; bi < 8; bi++) for (let bj = 0; bj < 8; bj++) {
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) {
      let s = 0;
      for (let a = 0; a < 3; a++) {
        const Ra = R[a * 3 + r];
        if (!Ra) continue;
        for (let b = 0; b < 3; b++) s += Ra * kl[(bi * 3 + a) * 24 + bj * 3 + b] * R[b * 3 + q];
      }
      kg[(bi * 3 + r) * 24 + bj * 3 + q] = s;
    }
  }
  return kg;
}

/** Local dofs (24) from the element's global dofs (24, corners in `order`). */
export function toLocal(el, ug) {
  const R = el.T, ul = new Float64Array(24);
  for (let b = 0; b < 8; b++) for (let a = 0; a < 3; a++) ul[b * 3 + a] = R[a * 3] * ug[b * 3] + R[a * 3 + 1] * ug[b * 3 + 1] + R[a * 3 + 2] * ug[b * 3 + 2];
  return ul;
}

/** Resultants [Nx Ny Nxy Mx My Mxy Qx Qy] at (ξ, η) from the local dofs. */
export function plateResultants(el, ul, xi = 0, eta = 0) {
  const xy = el.ax.xy;
  const s = shape(xi, eta), j = jac(xy, s), j0 = jac(xy, shape(0, 0));
  const um = new Float64Array(8);
  for (let i = 0; i < 4; i++) { um[2 * i] = ul[6 * i]; um[2 * i + 1] = ul[6 * i + 1]; }
  const alpha = [0, 1, 2, 3].map((a) => { let v = 0; for (let b = 0; b < 8; b++) v -= el.R[a * 8 + b] * um[b]; return v; });
  let ex = 0, ey = 0, gxy = 0;
  for (let i = 0; i < 4; i++) {
    const nx = j.inv[0] * s.dx[i] + j.inv[1] * s.de[i], ny = j.inv[2] * s.dx[i] + j.inv[3] * s.de[i];
    ex += nx * um[2 * i]; ey += ny * um[2 * i + 1]; gxy += ny * um[2 * i] + nx * um[2 * i + 1];
  }
  const sc = j0.det / j.det;
  const cart = (d) => [sc * (j0.inv[0] * d[0] + j0.inv[1] * d[1]), sc * (j0.inv[2] * d[0] + j0.inv[3] * d[1])];
  const p1 = cart([-2 * xi, 0]), p2 = cart([0, -2 * eta]);
  ex += p1[0] * alpha[0] + p2[0] * alpha[1];
  ey += p1[1] * alpha[2] + p2[1] * alpha[3];
  gxy += p1[1] * alpha[0] + p2[1] * alpha[1] + p1[0] * alpha[2] + p2[0] * alpha[3];
  const D = el.Dm;
  const Nx = D[0] * ex + D[1] * ey, Ny = D[3] * ex + D[4] * ey, Nxy = D[8] * gxy;
  const up = new Float64Array(12);
  for (let i = 0; i < 4; i++) { up[3 * i] = ul[6 * i + 2]; up[3 * i + 1] = ul[6 * i + 3]; up[3 * i + 2] = ul[6 * i + 4]; }
  const Bb = bendB(s, j), Bs = shearB(tying(xy), j, xi, eta);
  const k = [0, 1, 2].map((r) => { let v = 0; for (let c = 0; c < 12; c++) v += Bb[r * 12 + c] * up[c]; return v; });
  const g = [0, 1].map((r) => { let v = 0; for (let c = 0; c < 12; c++) v += Bs[r * 12 + c] * up[c]; return v; });
  const Db = el.Db;
  // m = Db κ is ∫σ ζ dζ; the reported moments are its negative (−z face in tension = positive)
  const Mx = -(Db[0] * k[0] + Db[1] * k[1]), My = -(Db[3] * k[0] + Db[4] * k[1]), Mxy = -Db[8] * k[2];
  return [Nx, Ny, Nxy, Mx, My, Mxy, el.Ds * g[0], el.Ds * g[1]];
}

/** The four Gauss points' resultants (order of GAUSS). */
export function plateGaussResultants(el, ul) { return GAUSS.map(([xi, eta]) => plateResultants(el, ul, xi, eta)); }

/** Gauss-point values → corner values (bilinear extrapolation through the 2 × 2 points). */
export function extrapolate(gv) {
  const s3 = Math.sqrt(3);
  return [0, 1, 2, 3].map((n) => {
    const xi = XI[n] * s3, eta = ETA[n] * s3;
    const w = GAUSS.map(([gx, gy]) => 0.25 * (1 + Math.sign(gx) * xi) * (1 + Math.sign(gy) * eta));
    return gv[0].map((_, c) => w.reduce((s, wk, k) => s + wk * gv[k][c], 0));
  });
}

/** The four Gauss points in plate axes (relative to the plate's centre `ax.c`). */
export function gaussPoints(ax) {
  return GAUSS.map(([xi, eta]) => { const sh = shape(xi, eta); return [0, 1].map((k) => sh.N.reduce((t, n, i) => t + n * ax.xy[i][k], 0)); });
}

/** ∫ Nᵢ dA for each corner (in `order`): a uniform pressure p gives corner forces p · these. */
export function cornerAreas(ax) {
  const out = [0, 0, 0, 0];
  for (const [xi, eta] of GAUSS) { const s = shape(xi, eta), j = jac(ax.xy, s); for (let i = 0; i < 4; i++) out[i] += s.N[i] * j.det; }
  return out;
}
