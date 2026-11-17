/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fv-thermal.js — SU.1812 spike (0.10, session engineering-10): fv.js with a Boussinesq temperature and a passive humidity, 2-D laminar. The temperature is carried by fv.js's own
 * TVD scalar advection; this file adds what fv.js lacks for it: explicit diffusion (operator splitting, first order in time), fixed-temperature walls and the buoyancy
 * source F_y = g beta (T - T0) on the vertical faces (the momentum `source` hook of fv.js reads the temperature). Harlow–Welch grid, Chorin projection as in fv.js.
 *
 *   const s = new ThermalFlow({ nx, ny, Lx, Ly, nu, alpha, gbeta, T0, Tleft, Tright, humidity?: { D, c0 }, bc? })    (walls on all four sides unless `bc` is given; Tleft/Tright null = adiabatic)
 *   s.run({ steady, maxSteps, tEnd }) as Flow · s.T (cell array) · s.nusseltMid()
 */
import { Flow } from './fv.js';

export class ThermalFlow extends Flow {
  constructor({ nx, ny, Lx = 1, Ly = 1, nu, alpha, gbeta, T0 = 0.5, Tleft = 1, Tright = 0, humidity = null }) {
    const wall = { type: 'wall' };
    super({ nx, ny, Lx, Ly, nu, bc: { left: wall, right: wall, bottom: wall, top: wall }, source: (x, y) => [0, this.gbeta * (this.tAt(x, y) - this.T0)] });
    this.alpha = alpha; this.gbeta = gbeta; this.T0 = T0; this.Tleft = Tleft; this.Tright = Tright;
    this.T = this.addScalar('T', { D: alpha, c0: T0 }).C;
    this.H = humidity ? this.addScalar('H', { D: humidity.D, c0: humidity.c0 ?? 0 }).C : null; this.DH = humidity?.D ?? 0;
  }
  tAt(x, y) {                                    // bilinear on the cell-centred temperature, clamped at the walls
    const { nx, ny, hx, hy, T } = this; let fx = x / hx - 0.5, fy = y / hy - 0.5; fx = Math.min(Math.max(fx, 0), nx - 1 - 1e-12); fy = Math.min(Math.max(fy, 0), ny - 1 - 1e-12);
    const i = Math.floor(fx), j = Math.floor(fy), a = fx - i, b = fy - j;
    return (1 - a) * (1 - b) * T[i + nx * j] + a * (1 - b) * T[i + 1 + nx * j] + (1 - a) * b * T[i + nx * (j + 1)] + a * b * T[i + 1 + nx * (j + 1)];
  }
  dtLimit() { return Math.min(super.dtLimit(), 0.2 * Math.min(this.hx, this.hy) ** 2 / Math.max(this.alpha, this.DH)); }
  step(dt = this.dtLimit()) {
    super.step(dt);                              // flow, projection, advection of T and H
    this.diffuse(this.T, this.alpha, dt, this.Tleft, this.Tright);
    if (this.H) this.diffuse(this.H, this.DH, dt, null, null);
  }
  diffuse(C, D, dt, Tl, Tr) {
    const { nx, ny, hx, hy } = this, N = C.slice();
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const k = i + nx * j, c = C[k];
      const w = i > 0 ? (c - C[k - 1]) / hx : Tl === null ? 0 : (c - Tl) / (hx / 2), e = i < nx - 1 ? (C[k + 1] - c) / hx : Tr === null ? 0 : (Tr - c) / (hx / 2);
      const s = j > 0 ? (c - C[k - nx]) / hy : 0, n = j < ny - 1 ? (C[k + nx] - c) / hy : 0;
      N[k] = c + dt * D * ((e - w) / hx + (n - s) / hy);
    }
    C.set(N);
  }
  /** Steady heat flux through the vertical mid-plane in units of k dT / L (Lx = Ly = 1 here): < u T / alpha - dT/dx > */
  nusseltMid() {
    const { nx, ny, hx, T, U } = this, xm = nx >> 1; let q = 0;
    for (let j = 0; j < ny; j++) { const a = xm - 1 + nx * j, c = xm + nx * j, u = U[xm + (nx + 1) * j], Tf = 0.5 * (T[a] + T[c]); q += u * Tf / this.alpha - (T[c] - T[a]) / hx; }
    return q / ny / Math.abs(this.Tleft - this.Tright);
  }
}
