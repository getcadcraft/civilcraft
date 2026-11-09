/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lbm3.js — a 3-D lattice-Boltzmann flow solver for wind round buildings (0.9 SU.1119 wind; DOM-free, own code, Apache-2.0). Written from the published method, never from
 * another program's source (rule 43): the D3Q19 lattice (Qian, d'Humieres, Lallemand 1992), single-relaxation-time BGK collision (Bhatnagar-Gross-Krook 1954), the Smagorinsky
 * sub-grid model in lattice form (Hou, Succi, Chen et al. 1996: tau = (tau0 + sqrt(tau0^2 + 18 sqrt2 Cs^2 |Pi|/rho)) / 2), half-way bounce-back for walls and solids
 * (Ladd 1994, moving wall with the 6 w rho c.u term), specular reflection for free-slip planes, Guo forcing (Guo, Zheng, Shi 2002), and a ground wall function
 * (log law, stress = (kappa u / ln(z/z0))^2) applied in the first layer of cells over a free-slip ground.
 *
 * Lattice units: cell 1, step 1, density 1. Keep |u| below about 0.1 (low Mach). nu = (tau - 1/2)/3.
 *
 *   const S = new Lbm3({ nx, ny, nz, tau = 0.6, cs = 0 (Smagorinsky constant, 0 = off), solid?: Uint8Array(nx*ny*nz), force?: [fx, fy, fz],
 *             bc: { x0, x1, y0, y1, z0, z1 }  each 'periodic' | 'wall' | 'symmetry' | 'inlet' (x0 only) | 'outflow' (x1 only)   default periodic,
 *             wallVel: { z1: [u, v, w], ... }  speed of a wall face,
 *             inlet: (y, z) => [u, v, w]       velocity of the inlet face (equilibrium inlet),
 *             inletTurb: { intensity: (k) => sigma_u/U at row k, length (cells), tcorr (steps), seed }   synthetic inlet fluctuations (see #initTurb)
 *             groundWall: { z0 }               log-law stress in the cells at k = 0 (z0 in cells; use with bc.z0 = 'symmetry'),
 *             f64: false })                    Float32 storage by default (Float64 for the tests)
 *   S.step(n = 1) · S.accumulate() (adds the present velocity to the running mean) · S.mean() → { ux, uy, uz, rho, count }
 *   S.u(i) · S.speed() · S.idx(x, y, z)
 * Not built: WebGPU port, grid refinement, non-uniform cells, rough-wall treatment for building walls (they are smooth bounce-back walls).
 */
const CX = [0], CY = [0], CZ = [0], W = [1 / 3];
for (const [a, b, c] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) { CX.push(a); CY.push(b); CZ.push(c); W.push(1 / 18); }
for (const [a, b, c] of [[1, 1, 0], [-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 0, 1], [-1, 0, -1], [1, 0, -1], [-1, 0, 1], [0, 1, 1], [0, -1, -1], [0, 1, -1], [0, -1, 1]]) { CX.push(a); CY.push(b); CZ.push(c); W.push(1 / 36); }
const Q = 19;
const find = (a, b, c) => { for (let i = 0; i < Q; i++) if (CX[i] === a && CY[i] === b && CZ[i] === c) return i; return -1; };
const OPP = Array.from({ length: Q }, (_, i) => find(-CX[i], -CY[i], -CZ[i]));
const FLIP = [0, 1, 2].map((ax) => Array.from({ length: Q }, (_, i) => find(ax === 0 ? -CX[i] : CX[i], ax === 1 ? -CY[i] : CY[i], ax === 2 ? -CZ[i] : CZ[i])));
export { CX, CY, CZ, W, OPP, Q };

const PER = 0, WALL = 1, SYM = 2, OPEN = 3;
const kind = (s) => (s === 'wall' ? WALL : s === 'symmetry' ? SYM : s === 'inlet' || s === 'outflow' ? OPEN : PER);
const KAPPA = 0.41;

export class Lbm3 {
  constructor(o) {
    const nx = o.nx | 0, ny = o.ny | 0, nz = o.nz | 0;
    if (!(nx >= 3 && ny >= 3 && nz >= 3)) throw new Error('the grid is at least 3 cells each way');
    if (nx * ny * nz > 3e7) throw new Error('the grid is at most thirty million cells');
    this.nx = nx; this.ny = ny; this.nz = nz; const N = this.N = nx * ny * nz;
    this.tau0 = o.tau ?? 0.6; if (!(this.tau0 > 0.5)) throw new Error('tau must exceed 1/2');
    this.cs = o.cs || 0; this.force = o.force || [0, 0, 0]; this.solid = o.solid ? o.solid : new Uint8Array(N);
    const b = o.bc || {};
    this.bk = [kind(b.x0), kind(b.x1), kind(b.y0), kind(b.y1), kind(b.z0), kind(b.z1)];
    this.bkName = b;
    this.wallVel = { x0: null, x1: null, y0: null, y1: null, z0: null, z1: null, ...(o.wallVel || {}) };
    this.groundZ0 = o.groundWall ? o.groundWall.z0 : null;
    const T = o.f64 ? Float64Array : Float32Array;
    this.f = new T(Q * N); this.g = new T(Q * N);
    this.rho = new T(N).fill(1); this.ux = new T(N); this.uy = new T(N); this.uz = new T(N);
    this.inletF = null;
    if (b.x0 === 'inlet') {
      if (typeof o.inlet !== 'function') throw new Error('an inlet needs inlet(y, z)');
      this.inletF = new Float64Array(Q * ny * nz);
      for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) { const u = o.inlet(y, z); for (let i = 0; i < Q; i++) this.inletF[i + Q * (y + ny * z)] = feq(i, 1, u[0], u[1], u[2]); }
      this.inletU = (y, z) => o.inlet(y, z);
      if (o.inletTurb) this.#initTurb(o.inlet, o.inletTurb);
    }
    // initial state: rest, or the inlet profile everywhere along x when there is an inlet
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) {
      const u = this.inletF ? o.inlet(y, z) : (o.init ? o.init(y, z) : [0, 0, 0]);
      for (let x = 0; x < nx; x++) {
        const id = x + nx * (y + ny * z);
        if (this.solid[id]) continue;
        for (let i = 0; i < Q; i++) this.f[i * N + id] = feq(i, 1, u[0], u[1], u[2]);
        this.ux[id] = u[0]; this.uy[id] = u[1]; this.uz[id] = u[2];
      }
    }
    this.sumU = null; this.t = 0;
  }
  idx(x, y, z) { return x + this.nx * (y + this.ny * z); }

  step(n = 1) { for (let s = 0; s < n; s++) { if (this.turb) this.#turbStep(); this.#stream(); this.#collide(); this.t++; } }

  /** Synthetic inlet turbulence: zero-mean fluctuations, smoothed over `length` cells in the inlet plane (two box filters), correlated in time (AR(1), `tcorr` steps),
   *  intensity `intensity(z)` x the local mean speed for u, 0.75 x for v and 0.5 x for w. Deterministic (seeded). Total speed is capped at `cap` (default 0.12) for low Mach. */
  #initTurb(inlet, t) {
    const { ny, nz } = this;
    const L = Math.max(1, Math.round(t.length || 4)), w = Math.max(1, Math.round(L / 2)) | 1, k1 = [];
    for (let a = -(w - 1); a <= w - 1; a++) k1.push(w - Math.abs(a));     // box * box (triangle)
    const nrm = 1 / Math.sqrt(k1.reduce((a, b) => a + b * b, 0)), pad = w - 1;
    const ky = (ny + 2 * pad), kz = (nz + 2 * pad);
    let seed = (t.seed || 12345) >>> 0;
    const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let x = seed; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
    const base = new Float64Array(3 * ny * nz), inten = new Float64Array(nz);
    for (let z = 0; z < nz; z++) { inten[z] = t.intensity(z); for (let y = 0; y < ny; y++) { const u = inlet(y, z); base[3 * (y + ny * z)] = u[0]; base[3 * (y + ny * z) + 1] = u[1]; base[3 * (y + ny * z) + 2] = u[2]; } }
    const noise = () => {   // one smoothed unit-variance field
      const raw = new Float64Array(ky * kz); for (let i = 0; i < raw.length; i++) raw[i] = gauss();
      const tmp = new Float64Array(ky * kz), out = new Float64Array(ny * nz);
      for (let z = 0; z < kz; z++) for (let y = pad; y < ky - pad; y++) { let a = 0; for (let q = 0; q < k1.length; q++) a += k1[q] * raw[y + q - (w - 1) + ky * z]; tmp[y + ky * z] = a * nrm; }
      for (let z = pad; z < kz - pad; z++) for (let y = pad; y < ky - pad; y++) { let a = 0; for (let q = 0; q < k1.length; q++) a += k1[q] * tmp[y + ky * (z + q - (w - 1))]; out[(y - pad) + ny * (z - pad)] = a * nrm; }
      return out;
    };
    const a = Math.exp(-1 / Math.max(1, t.tcorr || 50)), b = Math.sqrt(1 - a * a);
    this.turb = { base, inten, noise, a, b, cap: t.cap || 0.12, state: [noise(), noise(), noise()], amp: [1, 0.75, 0.5] };
  }
  #turbStep() {
    const T = this.turb, { ny, nz } = this;
    for (let c = 0; c < 3; c++) { const nn = T.noise(), st = T.state[c]; for (let i = 0; i < st.length; i++) st[i] = T.a * st[i] + T.b * nn[i]; }
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) {
      const j = y + ny * z, bu = T.base[3 * j], bv = T.base[3 * j + 1], bw = T.base[3 * j + 2], sp = Math.abs(bu) * T.inten[z];
      let u = bu + T.amp[0] * sp * T.state[0][j], v = bv + T.amp[1] * sp * T.state[1][j], w = bw + T.amp[2] * sp * T.state[2][j];
      const m = Math.hypot(u, v, w); if (m > T.cap) { const f = T.cap / m; u *= f; v *= f; w *= f; }
      for (let i = 0; i < Q; i++) this.inletF[i + Q * j] = feq(i, 1, u, v, w);
    }
  }

  #stream() {
    const { nx, ny, nz, N, f, g, solid, bk, wallVel } = this;
    const names = ['x0', 'x1', 'y0', 'y1', 'z0', 'z1'];
    const dim = [nx, ny, nz], off = this._off || (this._off = CX.map((c, i) => -(c + nx * (CY[i] + ny * CZ[i]))));
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const id = x + nx * (y + ny * z);
      if (solid[id]) continue;
      const inner = x > 0 && y > 0 && z > 0 && x < nx - 1 && y < ny - 1 && z < nz - 1;
      for (let i = 0; i < Q; i++) {
        const cx = CX[i], cy = CY[i], cz = CZ[i];
        let sx = x - cx, sy = y - cy, sz = z - cz;
        if (inner) {
          const sid = id + off[i];
          g[i * N + id] = solid[sid] ? f[OPP[i] * N + id] : f[i * N + sid];
          continue;
        }
        let j = i, bounce = false, wv = null;
        const s3 = [sx, sy, sz];
        for (let a = 0; a < 3 && !bounce; a++) {
          const s = s3[a], n_ = dim[a];
          if (s >= 0 && s < n_) continue;
          const face = a * 2 + (s < 0 ? 0 : 1), k = bk[face];
          if (k === PER) s3[a] = (s + n_) % n_;
          else if (k === SYM) { s3[a] = s < 0 ? 0 : n_ - 1; j = FLIP[a][j]; }
          else if (k === WALL) { bounce = true; wv = wallVel[names[face]]; }
          else s3[a] = s < 0 ? 0 : n_ - 1;    // open: overwritten after streaming
        }
        if (!bounce) { const sid = s3[0] + nx * (s3[1] + ny * s3[2]); if (solid[sid]) bounce = true; else { g[i * N + id] = f[j * N + sid]; continue; } }
        let v = f[OPP[i] * N + id];
        if (wv) v += 6 * W[i] * this.rho[id] * (cx * wv[0] + cy * wv[1] + cz * wv[2]);
        g[i * N + id] = v;
      }
    }
    if (bk[0] === OPEN && this.inletF) {
      for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) { const id = nx * (y + ny * z); for (let i = 0; i < Q; i++) g[i * N + id] = this.inletF[i + Q * (y + ny * z)]; }
    }
    if (bk[1] === OPEN) {
      // outflow with the pressure held at the reference (rho = 1): equilibrium at rho = 1 and the neighbour's velocity, plus the neighbour's non-equilibrium part.
      // (A plain zero-gradient copy leaves the pressure free to creep: with the ground wall function the density rose steadily, 8e-4 per 1500 steps.)
      for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) {
        const id = nx - 1 + nx * (y + ny * z); if (solid[id]) continue;
        const nb = id - 1; let r = 0, mx = 0, my = 0, mz = 0;
        for (let i = 0; i < Q; i++) { const v = g[i * N + nb]; r += v; mx += v * CX[i]; my += v * CY[i]; mz += v * CZ[i]; }
        const u = mx / r, v2 = my / r, w = mz / r;
        for (let i = 0; i < Q; i++) g[i * N + id] = feq(i, 1, u, v2, w) + (g[i * N + nb] - feq(i, r, u, v2, w));
      }
    }
  }

  #collide() {
    const { nx, ny, nz, N, g, solid, tau0, cs, rho, ux, uy, uz } = this;
    const fl = new Float64Array(Q), eq = new Float64Array(Q), gx = this.force[0], gy = this.force[1], gz = this.force[2];
    const smag = cs > 0, c18 = 18 * Math.SQRT2 * cs * cs;
    const inletCol = this.inletF && this.bk[0] === OPEN;
    const gz0 = this.groundZ0;
    const lg = gz0 !== null ? Math.log(0.5 / gz0) : 0, kg = gz0 !== null ? KAPPA / lg : 0;
    for (let z = 0; z < nz; z++) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const id = x + nx * (y + ny * z);
      if (solid[id]) continue;
      let r = 0, mx = 0, my = 0, mz = 0;
      for (let i = 0; i < Q; i++) { const v = g[i * N + id]; fl[i] = v; r += v; mx += v * CX[i]; my += v * CY[i]; mz += v * CZ[i]; }
      let u = mx / r, v = my / r, w = mz / r;
      rho[id] = r; ux[id] = u; uy[id] = v; uz[id] = w;
      if (inletCol && x === 0) continue;
      let Fx = gx, Fy = gy, Fz = gz;
      if (gz0 !== null && z === 0 && this.bk[4] === SYM) {   // wall function: stress opposes the horizontal velocity, spread over the cell
        const sp = Math.hypot(u, v);
        if (sp > 1e-12) { const us2 = (kg * sp) * (kg * sp); Fx -= r * us2 * u / sp; Fy -= r * us2 * v / sp; }
      }
      const forced = Fx !== 0 || Fy !== 0 || Fz !== 0;
      let tau = tau0;
      const ua = forced ? u + 0.5 * Fx / r : u, va = forced ? v + 0.5 * Fy / r : v, wa = forced ? w + 0.5 * Fz / r : w;
      const uu = ua * ua + va * va + wa * wa;
      let pxx = 0, pyy = 0, pzz = 0, pxy = 0, pxz = 0, pyz = 0;
      for (let i = 0; i < Q; i++) {
        const cx = CX[i], cy = CY[i], cz = CZ[i], cu = cx * ua + cy * va + cz * wa, e = W[i] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uu);
        eq[i] = e;
        if (smag) { const ne = fl[i] - e; pxx += cx * cx * ne; pyy += cy * cy * ne; pzz += cz * cz * ne; pxy += cx * cy * ne; pxz += cx * cz * ne; pyz += cy * cz * ne; }
      }
      if (smag) {
        const P = Math.sqrt(pxx * pxx + pyy * pyy + pzz * pzz + 2 * (pxy * pxy + pxz * pxz + pyz * pyz));
        tau = 0.5 * (tau0 + Math.sqrt(tau0 * tau0 + c18 * P / r));
      }
      const om = 1 / tau, fa = 1 - 0.5 * om;
      for (let i = 0; i < Q; i++) {
        let nv = fl[i] - om * (fl[i] - eq[i]);
        if (forced) {
          const cx = CX[i], cy = CY[i], cz = CZ[i], cu = cx * ua + cy * va + cz * wa;
          nv += fa * W[i] * (3 * ((cx - ua) * Fx + (cy - va) * Fy + (cz - wa) * Fz) + 9 * cu * (cx * Fx + cy * Fy + cz * Fz));
        }
        g[i * N + id] = nv;
      }
      if (forced) { ux[id] = ua; uy[id] = va; uz[id] = wa; }
    }
    const t = this.f; this.f = this.g; this.g = t;   // swap buffers
  }

  /** Add the present velocity (and density) to a running mean. */
  accumulate() {
    const N = this.N;
    if (!this.sumU) { this.sumU = { ux: new Float64Array(N), uy: new Float64Array(N), uz: new Float64Array(N), rho: new Float64Array(N), uu: new Float64Array(N), count: 0 }; }
    const s = this.sumU;
    for (let i = 0; i < N; i++) { s.ux[i] += this.ux[i]; s.uy[i] += this.uy[i]; s.uz[i] += this.uz[i]; s.rho[i] += this.rho[i]; s.uu[i] += this.ux[i] * this.ux[i] + this.uy[i] * this.uy[i] + this.uz[i] * this.uz[i]; }
    s.count++;
  }
  resetMean() { this.sumU = null; }
  mean() {
    const s = this.sumU; if (!s || !s.count) throw new Error('nothing accumulated');
    const N = this.N, c = s.count, ux = new Float32Array(N), uy = new Float32Array(N), uz = new Float32Array(N), rho = new Float32Array(N), tke = new Float32Array(N);
    for (let i = 0; i < N; i++) { ux[i] = s.ux[i] / c; uy[i] = s.uy[i] / c; uz[i] = s.uz[i] / c; rho[i] = s.rho[i] / c; tke[i] = Math.max(0, s.uu[i] / c - (ux[i] * ux[i] + uy[i] * uy[i] + uz[i] * uz[i])) / 2; }
    return { ux, uy, uz, rho, tke, count: c };
  }
  speed() { const o = new Float32Array(this.N); for (let i = 0; i < this.N; i++) o[i] = Math.hypot(this.ux[i], this.uy[i], this.uz[i]); return o; }
}

function feq(i, r, u, v, w) {
  const cu = CX[i] * u + CY[i] * v + CZ[i] * w, uu = u * u + v * v + w * w;
  return W[i] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * uu);
}
export { feq };
