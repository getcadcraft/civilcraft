/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lbm-thermal.js — SU.1812 spike (0.10, session engineering-10): the lattice Boltzmann solver of lbm.js with a Boussinesq temperature and a passive humidity,
 * 2-D, D2Q9 for the flow and one D2Q9 population per scalar (Krüger et al., The Lattice Boltzmann Method, 2017, ch. 8: advection–diffusion by a second distribution;
 * Guo, Zheng & Shi 2002: forcing). Own code, DOM-free, Apache-2.0. Laminar only: no turbulence model. A calculation aid; an engineer checks every result.
 *
 *   const S = createThermal({ nx, ny, nu, alpha, uRef?, Tleft?, Tright?, T0?, humidity?: { D, c0 } })
 *     lattice units (cell 1, step 1). Walls: left and right are walls at fixed temperature Tleft / Tright (null = adiabatic), top and bottom adiabatic; every wall is
 *     no-slip (half-way bounce-back); temperature wall = half-way anti-bounce-back (g_k = -g_opp + 2 w_k T_wall). The buoyancy is Boussinesq:
 *     F_y = g beta (T - T0), with g beta = uRef^2 / (ny * (Tleft - Tright)) so that uRef = sqrt(g beta dT L) (keep uRef near 0.1).
 *   stepThermal(S, n) · nusseltMid(S) → the heat flux through the vertical mid-plane in units of k dT / L (steady, adiabatic top and bottom: the wall Nusselt number)
 */
import { CX, CY, W, OPP } from './lbm.js';

const feq = (k, r, ux, uy) => { const cu = CX[k] * ux + CY[k] * uy; return W[k] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * (ux * ux + uy * uy)); };
const geq = (k, c, ux, uy) => W[k] * c * (1 + 3 * (CX[k] * ux + CY[k] * uy));

export function createThermal(o) {
  const nx = o.nx | 0, ny = o.ny | 0; if (!(nx >= 4 && ny >= 4 && nx * ny <= 4e6)) throw new Error('grid 4 x 4 up to four million cells');
  const tau = 0.5 + 3 * o.nu, tauT = 0.5 + 3 * o.alpha; if (!(tau > 0.5 && tauT > 0.5)) throw new Error('nu and alpha must be positive');
  const N = nx * ny, Tl = o.Tleft ?? 1, Tr = o.Tright ?? 0, T0 = o.T0 ?? (Tl + Tr) / 2, uRef = o.uRef ?? 0.1;
  const gb = Math.abs(Tl - Tr) > 0 ? uRef * uRef / (ny * Math.abs(Tl - Tr)) : 0;
  const hum = o.humidity ? { tau: 0.5 + 3 * o.humidity.D, c0: o.humidity.c0 ?? 0 } : null;
  const S = { nx, ny, N, tau, tauT, Tl, Tr, T0, gb, hum, t: 0, f: new Float64Array(9 * N), f2: new Float64Array(9 * N), g: new Float64Array(9 * N), g2: new Float64Array(9 * N),
    ux: new Float64Array(N), uy: new Float64Array(N), T: new Float64Array(N).fill(T0), Fy: new Float64Array(N) };
  if (hum) { S.h = new Float64Array(9 * N); S.h2 = new Float64Array(9 * N); S.H = new Float64Array(N).fill(hum.c0); }
  for (let i = 0; i < N; i++) for (let k = 0; k < 9; k++) { S.f[9 * i + k] = W[k]; S.g[9 * i + k] = W[k] * T0; if (hum) S.h[9 * i + k] = W[k] * hum.c0; }
  return S;
}

export function stepThermal(S, n = 1) {
  const { nx, ny, N, tau, tauT, Tl, Tr, gb, T0, hum } = S, om = 1 / tau, omT = 1 / tauT, omH = hum ? 1 / hum.tau : 0, f = () => S.f, wallL = Tl !== null, wallR = Tr !== null;
  for (let it = 0; it < n; it++) {
    const F = S.f, G = S.g, Hh = S.h;
    for (let i = 0; i < N; i++) {
      const b = 9 * i; let r = 0, mx = 0, my = 0, T = 0, c = 0;
      for (let k = 0; k < 9; k++) { const v = F[b + k]; r += v; mx += v * CX[k]; my += v * CY[k]; T += G[b + k]; if (hum) c += Hh[b + k]; }
      const Fy = gb * (T - T0) * r, ux = mx / r, uy = (my + 0.5 * Fy) / r; S.ux[i] = ux; S.uy[i] = uy; S.T[i] = T; if (hum) S.H[i] = c;
      for (let k = 0; k < 9; k++) {
        const cu = CX[k] * ux + CY[k] * uy, Sk = (1 - 0.5 * om) * W[k] * (3 * (CY[k] - uy) * Fy + 9 * cu * CY[k] * Fy);
        F[b + k] += -om * (F[b + k] - feq(k, r, ux, uy)) + Sk;
        G[b + k] += -omT * (G[b + k] - geq(k, T, ux, uy));
        if (hum) Hh[b + k] += -omH * (Hh[b + k] - geq(k, c, ux, uy));
      }
    }
    const F2 = S.f2, G2 = S.g2, H2 = S.h2;
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = x + nx * y, b = 9 * i;
      for (let k = 0; k < 9; k++) {
        const xs = x - CX[k], ys = y - CY[k];
        if (xs < 0 || xs >= nx || ys < 0 || ys >= ny) {                               // a wall half a cell outside: bounce back
          F2[b + k] = F[b + OPP[k]];
          const Tw = xs < 0 ? (wallL ? Tl : null) : xs >= nx ? (wallR ? Tr : null) : null;
          G2[b + k] = Tw === null ? G[b + OPP[k]] : -G[b + OPP[k]] + 2 * W[k] * Tw;     // anti-bounce-back: fixed wall temperature
          if (hum) H2[b + k] = Hh[b + OPP[k]];
        } else { const j = 9 * (xs + nx * ys); F2[b + k] = F[j + k]; G2[b + k] = G[j + k]; if (hum) H2[b + k] = Hh[j + k]; }
      }
    }
    [S.f, S.f2] = [S.f2, S.f]; [S.g, S.g2] = [S.g2, S.g]; if (hum) [S.h, S.h2] = [S.h2, S.h]; S.t++;
  }
  // macroscopic fields from the streamed populations
  for (let i = 0; i < N; i++) { let r = 0, mx = 0, my = 0, T = 0, c = 0; const b = 9 * i; for (let k = 0; k < 9; k++) { const v = S.f[b + k]; r += v; mx += v * CX[k]; my += v * CY[k]; T += S.g[b + k]; if (hum) c += S.h[b + k]; }
    S.ux[i] = mx / r; S.uy[i] = my / r; S.T[i] = T; if (hum) S.H[i] = c; }
  return S;
}

/** Steady heat flux through the vertical mid-plane: Nu = < ux T L / alpha - L dT/dx >, with dT = Tleft - Tright (central differences between the two cells either side). */
export function nusseltMid(S) {
  const { nx, ny } = S, dT = Math.abs(S.Tl - S.Tr), alpha = (S.tauT - 0.5) / 3, L = nx, xm = (nx >> 1);
  let q = 0;
  for (let y = 0; y < ny; y++) {
    const a = xm - 1 + nx * y, c = xm + nx * y, u = 0.5 * (S.ux[a] + S.ux[c]), T = 0.5 * (S.T[a] + S.T[c]), dTdx = (S.T[c] - S.T[a]);
    q += u * T * L / alpha - L * dTdx;           // lattice cell = 1, so dT/dx per cell and the length L = nx cells
  }
  return q / ny / dT;
}
export const maxSpeed = (S) => { let m = 0; for (let i = 0; i < S.N; i++) m = Math.max(m, Math.hypot(S.ux[i], S.uy[i])); return m; };
