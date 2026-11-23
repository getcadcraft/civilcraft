/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer errors; a host words them */
/**
 * lbm3d.js — a three-dimensional lattice Boltzmann core for a ventilated room (0.11 SU.1812, session engineering-11). Own code, Apache-2.0, DOM-free.
 *
 *   Flow:         D3Q19, single-relaxation-time (BGK) collision, Guo forcing for the Boussinesq buoyancy force F = rho g beta (T - Tref) in +z.
 *   Temperature:  D3Q7 advection-diffusion population (D3Q19 with `thermal: 19`), diffusivity alpha + nu_t / PrT.
 *   Turbulence:   Smagorinsky large-eddy closure: nu_t = (Cs)^2 |S| (lattice spacing 1), |S| from the non-equilibrium momentum flux of the cell, which gives the
 *                 closed form tau = 1/2 (tau0 + sqrt(tau0^2 + 18 Cs^2 sqrt(2 Pi:Pi) / rho)) (worked in docs/0.11-sessions/engineering-11.md; Hou et al. 1996 is the
 *                 usual citation for the form). Cs = 0 is plain laminar BGK.
 *   Cell flags:   FLUID, WALL (no slip, adiabatic), WALL_T (no slip, fixed temperature bT), INLET (velocity bu,bv,bw and temperature bT), OUTLET (fixed pressure, zero
 *                 temperature gradient), SOLID is WALL. Walls and inlets sit half-way between a solid cell and a fluid cell (bounce-back, moving-wall bounce-back, and
 *                 anti-bounce-back for the fixed temperature and the pressure outlet: Kruger et al., The Lattice Boltzmann Method, Springer 2017, ch. 5).
 *                 Inlets and outlets carrying heat (su-finish-11, 2026-11-21): on each link from an inlet the heat (and the scalar) coming in is the mass that
 *                 crossed that link times bT (bH); on each link to an outlet the heat going out is the mass times the cell's own value (upwind). With `thermal: 19`
 *                 the temperature and the scalar use the D3Q19 links of the air, so this is exact; with the default D3Q7 only the six axis links carry heat while
 *                 the air also comes in on the face diagonals, so an inlet brings in too little heat (a room fed with air at 5 settled near 3.8 with the old
 *                 anti-bounce-back rule). room.js uses thermal: 19; the closed-box benchmarks (no inlets) keep D3Q7.
 *                 The temperature and scalar equilibria use the momentum r u, so what they carry follows the mass when the density is not uniform.
 *   Domain:       periodic in every axis unless `periodic` says otherwise; put WALL cells on the edge for a closed box.
 *   Scalar:       (0.11 su-finish-11 cfd, opt-in `scalar: true`) one more D3Q7 population H for a passive scalar (humidity in room.js): carried by the flow, diffusivity
 *                 Dh + nu_t / ScT, no force; INLET sets bH, OUTLET zero gradient, every wall zero flux; `setSourceH` adds a volumetric source. Off: nothing is allocated
 *                 and the flow and temperature steps are the same as before.
 *   Units:        lattice units (dx = dt = 1, rho0 = 1). `latticeFor` turns a physical room into lattice numbers and says when the Mach number is too high.
 *
 *   const s = new Lbm3D({ nx, ny, nz, nu, alpha, gbeta, Tref, Cs, PrT, periodic: [true,true,true] });
 *   s.setFlag(x, y, z, FLAG.WALL_T, { T }) …; s.init({ T, u }); s.step(n); s.macros() → fills s.rho, s.ux, s.uy, s.uz, s.T (Float32Array, index x + nx (y + ny z))
 *   s.heatFluxX(x) → mean over the plane x of (u T - alpha dT/dx) in lattice units; s.mass() → total density; s.memoryBytes()
 */
export const FLAG = Object.freeze({ FLUID: 0, WALL: 1, WALL_T: 2, INLET: 3, OUTLET: 4 });

// D3Q19: 0 rest; 1..6 axes; 7..18 face diagonals
const CX = [0, 1, -1, 0, 0, 0, 0, 1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0];
const CY = [0, 0, 0, 1, -1, 0, 0, 1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1];
const CZ = [0, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1];
const W = [1 / 3, ...Array(6).fill(1 / 18), ...Array(12).fill(1 / 36)];
const OPP = CX.map((_, q) => CX.findIndex((__, r) => CX[r] === -CX[q] && CY[r] === -CY[q] && CZ[r] === -CZ[q]));   // found, not typed
// D3Q7
const Q7 = { X: [0, 1, -1, 0, 0, 0, 0], Y: [0, 0, 0, 1, -1, 0, 0], Z: [0, 0, 0, 0, 0, 1, -1], W: [1 / 4, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8, 1 / 8], OPP: [0, 2, 1, 4, 3, 6, 5], n: 7, cs2: 1 / 4 };
// D3Q19 for the temperature and the scalar (`thermal: 19`): the same links as the air, so what an inlet's air brings in, its heat brings in too
const Q19 = { X: CX, Y: CY, Z: CZ, W, OPP, n: 19, cs2: 1 / 3 };

export class Lbm3D {
  constructor(o) {
    const { nx, ny, nz } = o;
    if (![nx, ny, nz].every((n) => Number.isInteger(n) && n >= 3)) throw new Error('lbm3d: nx, ny, nz are integers of at least 3');
    this.nx = nx; this.ny = ny; this.nz = nz; this.N = nx * ny * nz;
    this.nu = o.nu ?? 0.02; this.alpha = o.alpha ?? this.nu / 0.71;
    this.gbeta = o.gbeta ?? 0; this.Tref = o.Tref ?? 0; this.Cs = o.Cs ?? 0; this.PrT = o.PrT ?? 0.85;
    this.rhoOut = o.rhoOut ?? 1;
    this.periodic = o.periodic || [true, true, true];
    if (this.nu <= 0 || this.alpha <= 0) throw new Error('lbm3d: nu and alpha must be positive');
    this.tau0 = 3 * this.nu + 0.5;
    this.step_ = 0;
    const N = this.N;
    this.st = o.thermal === 19 ? Q19 : Q7;
    const QT = this.st.n;
    this.f = new Float32Array(19 * N); this.f2 = new Float32Array(19 * N);
    this.g = new Float32Array(QT * N); this.g2 = new Float32Array(QT * N);
    this.flag = new Uint8Array(N); this.edge = new Uint8Array(N);
    this.bu = new Float32Array(N); this.bv = new Float32Array(N); this.bw = new Float32Array(N); this.bT = new Float32Array(N);
    this.Q = null;   // volumetric heat source per cell in lattice units (temperature per step); allocate with setSource
    this.rho = new Float32Array(N).fill(1); this.ux = new Float32Array(N); this.uy = new Float32Array(N); this.uz = new Float32Array(N);
    this.T = new Float32Array(N).fill(this.Tref); this.nuT = new Float32Array(N);
    if (o.scalar) {
      this.h = new Float32Array(QT * N); this.h2 = new Float32Array(QT * N); this.H = new Float32Array(N); this.bH = new Float32Array(N);
      this.Dh = o.Dh ?? this.alpha; this.ScT = o.ScT ?? this.PrT; this.Qh = null;
      if (this.Dh <= 0) throw new Error('lbm3d: Dh must be positive');
    }
    this.edgeReady = false;
  }
  idx(x, y, z) { return x + this.nx * (y + this.ny * z); }
  setFlag(x, y, z, flag, o = {}) {
    const i = this.idx(x, y, z);
    this.flag[i] = flag; this.bu[i] = o.u ?? 0; this.bv[i] = o.v ?? 0; this.bw[i] = o.w ?? 0; this.bT[i] = o.T ?? this.Tref;
    if (this.bH) this.bH[i] = o.H ?? 0;
    this.edgeReady = false;
  }
  setSource(x, y, z, q) { if (!this.Q) this.Q = new Float32Array(this.N); this.Q[this.idx(x, y, z)] = q; }
  setSourceH(x, y, z, q) { if (!this.h) throw new Error('lbm3d: setSourceH needs scalar: true'); if (!this.Qh) this.Qh = new Float32Array(this.N); this.Qh[this.idx(x, y, z)] = q; }
  memoryBytes() { let b = 0; for (const k of ['f', 'f2', 'g', 'g2', 'flag', 'edge', 'bu', 'bv', 'bw', 'bT', 'rho', 'ux', 'uy', 'uz', 'T', 'nuT', 'Q', 'h', 'h2', 'H', 'bH', 'Qh']) if (this[k]) b += this[k].byteLength; return b; }

  /** Equilibrium start: uniform or per-cell. o = { T, u: [ux,uy,uz], rho, H (the scalar, when on) } */
  init(o = {}) {
    const { nx, ny, nz, N } = this;
    const T0 = o.T ?? this.Tref, u0 = o.u || [0, 0, 0], r0 = o.rho ?? 1;
    const { X: TX, Y: TY, Z: TZ, W: TW, n: QT } = this.st, ic2 = 1 / this.st.cs2;
    for (let i = 0; i < N; i++) {
      this.rho[i] = r0; this.ux[i] = u0[0]; this.uy[i] = u0[1]; this.uz[i] = u0[2]; this.T[i] = this.flag[i] === FLAG.WALL_T || this.flag[i] === FLAG.INLET ? this.bT[i] : T0;
      const uu = u0[0] * u0[0] + u0[1] * u0[1] + u0[2] * u0[2];
      for (let q = 0; q < 19; q++) {
        const cu = CX[q] * u0[0] + CY[q] * u0[1] + CZ[q] * u0[2];
        this.f[q * N + i] = W[q] * r0 * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uu);
      }
      for (let q = 0; q < QT; q++) this.g[q * N + i] = TW[q] * this.T[i] * (1 + ic2 * (TX[q] * u0[0] + TY[q] * u0[1] + TZ[q] * u0[2]));
      if (this.h) {
        this.H[i] = this.flag[i] === FLAG.INLET ? this.bH[i] : (o.H ?? 0);
        for (let q = 0; q < QT; q++) this.h[q * N + i] = TW[q] * this.H[i] * (1 + ic2 * (TX[q] * u0[0] + TY[q] * u0[1] + TZ[q] * u0[2]));
      }
    }
    this.f2.set(this.f); this.g2.set(this.g);
    if (this.h) this.h2.set(this.h);
    this._edges();
    void nx; void ny; void nz;
  }

  _nb(x, y, z, dx, dy, dz) {   // neighbour index of (x,y,z) shifted by (dx,dy,dz), or -1 outside a non-periodic edge
    const { nx, ny, nz, periodic } = this;
    let X = x + dx, Y = y + dy, Z = z + dz;
    if (X < 0 || X >= nx) { if (!periodic[0]) return -1; X = (X + nx) % nx; }
    if (Y < 0 || Y >= ny) { if (!periodic[1]) return -1; Y = (Y + ny) % ny; }
    if (Z < 0 || Z >= nz) { if (!periodic[2]) return -1; Z = (Z + nz) % nz; }
    return X + nx * (Y + ny * Z);
  }
  _edges() {
    const { nx, ny, nz } = this;
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = this.idx(x, y, z); let e = 0;
      if (this.flag[i] === FLAG.FLUID) for (let q = 1; q < 19 && !e; q++) { const s = this._nb(x, y, z, -CX[q], -CY[q], -CZ[q]); if (s < 0 || this.flag[s] !== FLAG.FLUID) e = 1; }
      this.edge[i] = e;
    }
    this.edgeReady = true;
  }

  /** n steps of collide-and-stream (fused pull scheme). */
  step(n = 1) {
    if (!this.edgeReady) this._edges();
    const { nx, ny, nz, N, flag, edge, rho, ux, uy, uz, T, nuT, bu, bv, bw, bT, Q } = this;
    const gF = this.gbeta, Tref = this.Tref, tau0 = this.tau0, Cs2 = this.Cs * this.Cs, alpha0 = this.alpha, PrT = this.PrT, rhoOut = this.rhoOut;
    const { X: TX, Y: TY, Z: TZ, W: TW, OPP: TOPP, n: QT, cs2: CS2T } = this.st, ic2 = 1 / CS2T;
    const fv = new Float64Array(19), gv = new Float64Array(19), hv = new Float64Array(19), mL = new Float64Array(19);   // mL: the mass on a link from an inlet (+) or to an outlet (-)
    const hOn = !!this.h, H = this.H, bH = this.bH, Qh = this.Qh, D0 = this.Dh, ScT = this.ScT;
    for (let it = 0; it < n; it++) {
      const f = this.f, f2 = this.f2, g = this.g, g2 = this.g2, h = this.h, h2 = this.h2;
      for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
        const i = x + nx * (y + ny * z);
        if (flag[i] !== FLAG.FLUID) continue;
        // ---- pull
        if (!edge[i]) {
          for (let q = 0; q < 19; q++) {
            let X = x - CX[q], Y = y - CY[q], Z = z - CZ[q];
            if (X < 0) X += nx; else if (X >= nx) X -= nx;
            if (Y < 0) Y += ny; else if (Y >= ny) Y -= ny;
            if (Z < 0) Z += nz; else if (Z >= nz) Z -= nz;
            fv[q] = f[q * N + X + nx * (Y + ny * Z)];
          }
          for (let q = 0; q < QT; q++) {
            let X = x - TX[q], Y = y - TY[q], Z = z - TZ[q];
            if (X < 0) X += nx; else if (X >= nx) X -= nx;
            if (Y < 0) Y += ny; else if (Y >= ny) Y -= ny;
            if (Z < 0) Z += nz; else if (Z >= nz) Z -= nz;
            const j = X + nx * (Y + ny * Z);
            gv[q] = g[q * N + j];
            if (hOn) hv[q] = h[q * N + j];
          }
        } else {
          const ui = ux[i], vi = uy[i], wi = uz[i];
          const u2 = ui * ui + vi * vi + wi * wi;
          mL.fill(0);
          for (let q = 0; q < 19; q++) {
            const s = this._nb(x, y, z, -CX[q], -CY[q], -CZ[q]);
            if (s >= 0 && flag[s] === FLAG.FLUID) { fv[q] = f[q * N + s]; continue; }
            const fo = f[OPP[q] * N + i];                       // this cell's own post-collision value going the other way
            const t = s < 0 ? FLAG.WALL : flag[s];
            if (t === FLAG.INLET) { fv[q] = fo + 6 * W[q] * 1 * (CX[q] * bu[s] + CY[q] * bv[s] + CZ[q] * bw[s]); mL[q] = fv[q] - fo; }
            else if (t === FLAG.OUTLET) { const cu = CX[q] * ui + CY[q] * vi + CZ[q] * wi; fv[q] = -fo + 2 * W[q] * rhoOut * (1 + 4.5 * cu * cu - 1.5 * u2); mL[q] = fv[q] - fo; }
            else fv[q] = fo;                                    // WALL, WALL_T: half-way bounce-back
          }
          for (let q = 0; q < QT; q++) {
            const s = this._nb(x, y, z, -TX[q], -TY[q], -TZ[q]);
            if (s >= 0 && flag[s] === FLAG.FLUID) { gv[q] = g[q * N + s]; continue; }
            const go = g[TOPP[q] * N + i];
            const t = s < 0 ? FLAG.WALL : flag[s];
            if (t === FLAG.WALL_T) gv[q] = -go + 2 * TW[q] * bT[s];
            else if (t === FLAG.INLET) gv[q] = go + mL[q] * bT[s];      // the air that came in on this link brings the inlet's temperature
            else if (t === FLAG.OUTLET) gv[q] = go + mL[q] * T[i];      // the air that left on it takes this cell's (upwind)
            else gv[q] = go;                                    // adiabatic wall
          }
          if (hOn) for (let q = 0; q < QT; q++) {
            const s = this._nb(x, y, z, -TX[q], -TY[q], -TZ[q]);
            if (s >= 0 && flag[s] === FLAG.FLUID) { hv[q] = h[q * N + s]; continue; }
            const ho = h[TOPP[q] * N + i];
            const t = s < 0 ? FLAG.WALL : flag[s];
            if (t === FLAG.INLET) hv[q] = ho + mL[q] * bH[s];
            else if (t === FLAG.OUTLET) hv[q] = ho + mL[q] * H[i];
            else hv[q] = ho;                                    // every wall: no flux
          }
        }
        // ---- macros
        let r = 0, mx = 0, my = 0, mz = 0;
        for (let q = 0; q < 19; q++) { const v = fv[q]; r += v; mx += v * CX[q]; my += v * CY[q]; mz += v * CZ[q]; }
        let Tt = 0; for (let q = 0; q < QT; q++) Tt += gv[q];
        const Fz = r * gF * (Tt - Tref);
        const inv = 1 / r;
        const u = mx * inv, v = my * inv, w = (mz + 0.5 * Fz) * inv;
        const uu = u * u + v * v + w * w;
        // ---- Smagorinsky: Pi = sum c c (f - feq)
        let tau = tau0, nt = 0;
        if (Cs2 > 0) {
          let pxx = 0, pyy = 0, pzz = 0, pxy = 0, pxz = 0, pyz = 0;
          for (let q = 1; q < 19; q++) {
            const cu = CX[q] * u + CY[q] * v + CZ[q] * w;
            const d = fv[q] - W[q] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uu);
            pxx += CX[q] * CX[q] * d; pyy += CY[q] * CY[q] * d; pzz += CZ[q] * CZ[q] * d;
            pxy += CX[q] * CY[q] * d; pxz += CX[q] * CZ[q] * d; pyz += CY[q] * CZ[q] * d;
          }
          const PP = pxx * pxx + pyy * pyy + pzz * pzz + 2 * (pxy * pxy + pxz * pxz + pyz * pyz);
          tau = 0.5 * (tau0 + Math.sqrt(tau0 * tau0 + 18 * Cs2 * Math.sqrt(2 * PP) * inv));
          nt = (tau - tau0) / 3;
        }
        rho[i] = r; ux[i] = u; uy[i] = v; uz[i] = w; T[i] = Tt; nuT[i] = nt;
        const om = 1 / tau, fc = 1 - 0.5 * om;
        for (let q = 0; q < 19; q++) {
          const cu = CX[q] * u + CY[q] * v + CZ[q] * w;
          const feq = W[q] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uu);
          const force = fc * W[q] * 3 * (CZ[q] - w + 3 * cu * CZ[q]) * Fz;   // Guo, F along z only
          f2[q * N + i] = fv[q] - om * (fv[q] - feq) + force;
        }
        const aE = alpha0 + nt / PrT, omg = 1 / (aE / CS2T + 0.5), qs = Q ? Q[i] : 0;
        for (let q = 0; q < QT; q++) {
          const geq = TW[q] * Tt * (1 + ic2 * r * (TX[q] * u + TY[q] * v + TZ[q] * w));   // r u (the momentum): with inlets and outlets the advection then carries what the mass carries
          g2[q * N + i] = gv[q] - omg * (gv[q] - geq) + TW[q] * qs;
        }
        if (hOn) {
          let Ht = 0; for (let q = 0; q < QT; q++) Ht += hv[q];
          H[i] = Ht;
          const omh = 1 / ((D0 + nt / ScT) / CS2T + 0.5), qh = Qh ? Qh[i] : 0;
          for (let q = 0; q < QT; q++) {
            const heq = TW[q] * Ht * (1 + ic2 * r * (TX[q] * u + TY[q] * v + TZ[q] * w));
            h2[q * N + i] = hv[q] - omh * (hv[q] - heq) + TW[q] * qh;
          }
        }
      }
      this.f = f2; this.f2 = f; this.g = g2; this.g2 = g;
      if (hOn) { this.h = h2; this.h2 = h; }
      this.step_++;
    }
  }

  /** Mean over the plane x = X of the heat flux u T - alpha dT/dx, from the first moment of the (post-collision) temperature population, over fluid cells. */
  heatFluxX(X) {
    const { nx, ny, nz, N, flag } = this;
    let s = 0, n = 0;
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) {
      const i = X + nx * (y + ny * z);
      if (flag[i] !== FLAG.FLUID) continue;
      const u = this.ux[i], Tt = this.T[i];
      const { X: TX, Y: TY, Z: TZ, W: TW, n: QT, cs2: CS2T } = this.st;
      let m = 0; for (let q = 0; q < QT; q++) m += TX[q] * (this.g[q * N + i] - TW[q] * Tt * (1 + (TX[q] * u + TY[q] * this.uy[i] + TZ[q] * this.uz[i]) / CS2T));
      // the stored populations are post-collision: m_post = (1 - w) m_pre, and the diffusive flux is (1 - w/2) m_pre, w = 1 / tau_g
      const om = 1 / ((this.alpha + this.nuT[i] / this.PrT) / CS2T + 0.5);
      s += u * Tt + (Math.abs(1 - om) < 1e-9 ? 0 : (1 - om / 2) / (1 - om) * m); n++;
    }
    return n ? s / n : 0;
  }
  /**
   * Net flow across the links between fluid cells and the boundary cells for which `pick(i)` is true (e.g. one outlet's cells), from the stored post-collision
   * populations and the value the boundary rule hands back next step: { q (lattice volume per step, + = out of the fluid), qT, qH (q times the fluid cell's T, H) }.
   * Only for OUTLET and INLET cells (walls carry nothing).
   */
  boundaryFlux(pick) {
    const { nx, ny, nz, N, flag, f } = this;
    let q = 0, qT = 0, qH = 0;
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = x + nx * (y + ny * z);
      if (flag[i] !== FLAG.FLUID || !this.edge[i]) continue;
      const u = this.ux[i], v = this.uy[i], w = this.uz[i], u2 = u * u + v * v + w * w;
      let m = 0;
      for (let d = 1; d < 19; d++) {
        const s = this._nb(x, y, z, CX[d], CY[d], CZ[d]);
        if (s < 0 || !pick(s)) continue;
        const t = flag[s], fo = f[d * N + i];
        let back;
        if (t === FLAG.OUTLET) { const cu = CX[d] * u + CY[d] * v + CZ[d] * w; back = -fo + 2 * W[d] * this.rhoOut * (1 + 4.5 * cu * cu - 1.5 * u2); }
        else if (t === FLAG.INLET) back = fo - 6 * W[d] * (CX[d] * this.bu[s] + CY[d] * this.bv[s] + CZ[d] * this.bw[s]);
        else continue;
        m += fo - back;
      }
      if (m) { q += m; qT += m * this.T[i]; if (this.H) qH += m * this.H[i]; }
    }
    return { q, qT, qH };
  }
  /**
   * The air an inlet's cells for which `pick(i)` is true put into the fluid each step (lattice volume per step), from the geometry alone: on every link from an
   * inlet cell to a fluid cell the moving-wall rule adds 6 w (c . u_b). A face cell at the edge of a body has links that point back against its velocity, so
   * a face blows less than its velocity times its cells; room.js scales the velocity by this so the face gives the airflow asked for.
   */
  inletRate(pick) {
    const { nx, ny, nz, flag } = this;
    let q = 0;
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const s = x + nx * (y + ny * z);
      if (flag[s] !== FLAG.INLET || !pick(s)) continue;
      for (let d = 1; d < 19; d++) { const n = this._nb(x, y, z, CX[d], CY[d], CZ[d]); if (n >= 0 && flag[n] === FLAG.FLUID) q += 6 * W[d] * (CX[d] * this.bu[s] + CY[d] * this.bv[s] + CZ[d] * this.bw[s]); }
    }
    return q;
  }
  /** Scale the inlet velocity of the picked cells by k. */
  scaleInlet(pick, k) { for (let s = 0; s < this.N; s++) if (this.flag[s] === FLAG.INLET && pick(s)) { this.bu[s] *= k; this.bv[s] *= k; this.bw[s] *= k; } }
  /** After step(): the stored macros are those of the last pulled state. Total mass over fluid cells. */
  mass() { let m = 0; for (let i = 0; i < this.N; i++) if (this.flag[i] === FLAG.FLUID) m += this.rho[i]; return m; }
  /** Largest lattice speed (Mach number is this times sqrt(3)). */
  maxSpeed() { let m = 0; for (let i = 0; i < this.N; i++) if (this.flag[i] === FLAG.FLUID) { const u = Math.hypot(this.ux[i], this.uy[i], this.uz[i]); if (u > m) m = u; } return m; }
  /** Effective relaxation time at a cell (laminar + Smagorinsky) from its stored eddy viscosity. */
  tauAt(i) { return this.tau0 + 3 * this.nuT[i]; }
}

/**
 * latticeFor — a physical room to lattice numbers. SI inputs: L (m, reference length), U (m/s, reference speed), dx (m, cell), nu, alpha (m2/s), g, beta, dT.
 * The lattice speed is held at uLat (default 0.1, Mach 0.17): dt = uLat dx / U, nuLat = nu dt / dx^2.  `ok` is false when tau0 is under 0.505 (the cell is too coarse for this
 * viscosity without the turbulence model carrying it) or the buoyancy speed is above 0.2.
 */
export function latticeFor({ dx, U, nu = 1.516e-5, alpha = 2.14e-5, g = 9.81, beta = 3.43e-3, dT = 0, uLat = 0.1 }) {
  const dt = uLat * dx / U, nuL = nu * dt / (dx * dx), aL = alpha * dt / (dx * dx);
  const gbetaL = g * beta * dt * dt / dx;           // per unit temperature (temperature itself is not scaled)
  const buoySpeed = Math.sqrt(gbetaL * dT);          // lattice cells per step over one cell of height
  const tau0 = 3 * nuL + 0.5;
  return { dt, nu: nuL, alpha: aL, gbeta: gbetaL, tau0, buoySpeedLat: buoySpeed, ok: tau0 >= 0.505 && buoySpeed <= 0.2, steps: (t) => Math.ceil(t / dt) };
}
