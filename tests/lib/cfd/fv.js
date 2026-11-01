/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fv.js — our own finite-volume flow solver (0.8 Track CH, CH.13; DOM-free, deterministic, Apache-2.0). Written from the published methods (Harlow & Welch 1965
 * marker-and-cell staggered grid; Chorin 1968 projection; Spalding 1972 hybrid scheme; Sweby 1984 flux limiters), never from another program's source (rule 43).
 * A calculation aid: an engineer checks every result.
 *
 * What it is: 2-D incompressible laminar flow on a uniform rectangular grid (staggered), time-marched with a fractional-step projection, plus a passive scalar
 * (tracer / species) with a TVD (van Leer) limiter. Boundaries per side: wall (optionally moving), inflow (given normal velocity), outflow (zero gradient, p = 0).
 * A momentum source function stands in for an impeller. NOT built (stays on CH.13): k-epsilon turbulence, unstructured meshes, 3-D, an embedded solid, the link
 * to PartCraft's LBM flow. Turbulent mixing therefore cannot be predicted here: results are for laminar flow only and say so.
 *
 *   const s = new Flow({ nx, ny, Lx, Ly, nu, rho?, bc: { left, right, bottom, top }, source?(x, y, t) → [fx, fy] })
 *   bc side = { type: 'wall', u?, v? (tangential velocity) } | { type: 'inflow', un: (s) => normal velocity (positive into the domain), c?: (s, t) => concentration } | { type: 'outflow' }
 *   s.step(dt?) · s.run({ steady: tol, maxSteps, tEnd }) · s.cellVelocity() · s.addScalar(name, { D, c0 }) · s.vtk() (legacy ASCII VTK, an open format)
 */
export class Flow {
  constructor({ nx, ny, Lx = 1, Ly = 1, nu, rho = 1, bc, source = null }) {
    this.nx = nx; this.ny = ny; this.hx = Lx / nx; this.hy = Ly / ny; this.Lx = Lx; this.Ly = Ly; this.nu = nu; this.rho = rho; this.bc = bc; this.source = source; this.t = 0; this.steps = 0;
    this.U = new Float64Array((nx + 1) * ny); this.V = new Float64Array(nx * (ny + 1)); this.P = new Float64Array(nx * ny); this.scalars = {};
    this.outflow = ['left', 'right', 'bottom', 'top'].some((k) => bc[k]?.type === 'outflow');
    this.applyBC(); if (this.hx !== this.hy) this.aniso = true;
  }
  applyBC() {
    const { nx, ny, U, V, bc } = this;
    for (let j = 0; j < ny; j++) {
      const y = (j + 0.5) * this.hy;
      if (bc.left.type === 'inflow') U[0 + (nx + 1) * j] = bc.left.un(y); else if (bc.left.type === 'wall') U[(nx + 1) * j] = 0;
      if (bc.right.type === 'inflow') U[nx + (nx + 1) * j] = -bc.right.un(y); else if (bc.right.type === 'wall') U[nx + (nx + 1) * j] = 0; else U[nx + (nx + 1) * j] = U[nx - 1 + (nx + 1) * j];
    }
    for (let i = 0; i < nx; i++) {
      const x = (i + 0.5) * this.hx;
      if (bc.bottom.type === 'inflow') V[i] = bc.bottom.un(x); else if (bc.bottom.type === 'wall') V[i] = 0;
      if (bc.top.type === 'inflow') V[i + nx * ny] = -bc.top.un(x); else if (bc.top.type === 'wall') V[i + nx * ny] = 0; else V[i + nx * ny] = V[i + nx * (ny - 1)];
    }
    if (bc.left.type === 'outflow') for (let j = 0; j < ny; j++) U[(nx + 1) * j] = U[1 + (nx + 1) * j];
    if (bc.bottom.type === 'outflow') for (let i = 0; i < nx; i++) V[i] = V[i + nx];
  }
  // velocity with ghost values beyond the domain (tangential wall velocities; zero gradient at outflow, inflow tangential = 0)
  u(i, j) {
    const { nx, ny, U, bc } = this;
    if (j < 0) { const b = bc.bottom; if (b.type === 'wall') return 2 * (b.u || 0) - U[i + (nx + 1) * 0]; if (b.type === 'inflow') return -U[i]; return U[i]; }
    if (j >= ny) { const b = bc.top; if (b.type === 'wall') return 2 * (b.u || 0) - U[i + (nx + 1) * (ny - 1)]; if (b.type === 'inflow') return -U[i + (nx + 1) * (ny - 1)]; return U[i + (nx + 1) * (ny - 1)]; }
    return U[i + (nx + 1) * j];
  }
  v(i, j) {
    const { nx, ny, V, bc } = this;
    if (i < 0) { const b = bc.left; if (b.type === 'wall') return 2 * (b.v || 0) - V[nx * j]; if (b.type === 'inflow') return -V[nx * j]; return V[nx * j]; }
    if (i >= nx) { const b = bc.right; if (b.type === 'wall') return 2 * (b.v || 0) - V[nx - 1 + nx * j]; if (b.type === 'inflow') return -V[nx - 1 + nx * j]; return V[nx - 1 + nx * j]; }
    return V[i + nx * j];
  }
  /** hybrid face value: central unless the cell Peclet number is above 2, then upwind */
  face(a, b, vel, h) { return Math.abs(vel) * h / this.nu > 2 ? (vel > 0 ? a : b) : 0.5 * (a + b); }
  dtLimit() {
    let um = 1e-12; for (const a of this.U) um = Math.max(um, Math.abs(a)); for (const a of this.V) um = Math.max(um, Math.abs(a));
    const h = Math.min(this.hx, this.hy); return Math.min(0.4 * h / um, 0.2 * h * h / this.nu, 0.8 * this.nu / (um * um));   // advective CFL, diffusion limit, and the explicit-central stability limit dt < 2 nu / u²
  }
  step(dt = this.dtLimit()) {
    const { nx, ny, hx, hy, nu, U, V, P } = this, Us = U.slice(), Vs = V.slice();
    for (let j = 0; j < ny; j++) for (let i = 1; i < nx + (this.bc.right.type === 'outflow' ? 1 : 0); i++) {
      if (i === 0) continue;
      const uc = this.u(i, j), uE = this.u(i + 1 > nx ? nx : i + 1, j), uW = this.u(i - 1, j);
      const ue = this.face(uc, uE, 0.5 * (uc + uE), hx), uw = this.face(uW, uc, 0.5 * (uW + uc), hx);
      const vn = 0.5 * (this.v(i - 1, j + 1) + this.v(i, j + 1)), vs = 0.5 * (this.v(i - 1, j) + this.v(i, j));
      const un = this.face(uc, this.u(i, j + 1), vn, hy), usv = this.face(this.u(i, j - 1), uc, vs, hy);
      const conv = (0.5 * (uc + uE) * ue - 0.5 * (uW + uc) * uw) / hx + (vn * un - vs * usv) / hy;
      const diff = nu * ((uE - 2 * uc + uW) / (hx * hx) + (this.u(i, j + 1) - 2 * uc + this.u(i, j - 1)) / (hy * hy));
      const f = this.source ? this.source(i * hx, (j + 0.5) * hy, this.t)[0] : 0;
      Us[i + (nx + 1) * j] = uc + dt * (-conv + diff + f);
    }
    for (let j = 1; j < ny + (this.bc.top.type === 'outflow' ? 1 : 0); j++) for (let i = 0; i < nx; i++) {
      const vc = this.v(i, j), vN = this.v(i, j + 1 > ny ? ny : j + 1), vS = this.v(i, j - 1);
      const vn = this.face(vc, vN, 0.5 * (vc + vN), hy), vs = this.face(vS, vc, 0.5 * (vS + vc), hy);
      const ue = 0.5 * (this.u(i + 1, j - 1) + this.u(i + 1, j)), uw = 0.5 * (this.u(i, j - 1) + this.u(i, j));
      const ve = this.face(vc, this.v(i + 1, j), ue, hx), vw = this.face(this.v(i - 1, j), vc, uw, hx);
      const conv = (0.5 * (vc + vN) * vn - 0.5 * (vS + vc) * vs) / hy + (ue * ve - uw * vw) / hx;
      const diff = nu * ((this.v(i + 1, j) - 2 * vc + this.v(i - 1, j)) / (hx * hx) + (vN - 2 * vc + vS) / (hy * hy));
      const f = this.source ? this.source((i + 0.5) * hx, j * hy, this.t)[1] : 0;
      Vs[i + nx * j] = vc + dt * (-conv + diff + f);
    }
    U.set(Us); V.set(Vs); this.applyBC();
    this.project(dt); this.applyBC();
    for (const s of Object.values(this.scalars)) this.advectScalar(s, dt);
    this.t += dt; this.steps++;
  }
  project(dt) {
    const { nx, ny, hx, hy, U, V, P } = this, n = nx * ny, b = new Float64Array(n);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) b[i + nx * j] = ((U[i + 1 + (nx + 1) * j] - U[i + (nx + 1) * j]) / hx + (V[i + nx * (j + 1)] - V[i + nx * j]) / hy) / dt;
    // matrix-free Laplacian; Dirichlet p = 0 on outflow sides (distance h/2), Neumann elsewhere
    const bc = this.bc, dirL = bc.left.type === 'outflow', dirR = bc.right.type === 'outflow', dirB = bc.bottom.type === 'outflow', dirT = bc.top.type === 'outflow';
    const A = (x, y) => {
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const k = i + nx * j, c = x[k]; let s = 0;
        if (i > 0) s += (x[k - 1] - c) / (hx * hx); else if (dirL) s += (-2 * c) / (hx * hx);
        if (i < nx - 1) s += (x[k + 1] - c) / (hx * hx); else if (dirR) s += (-2 * c) / (hx * hx);
        if (j > 0) s += (x[k - nx] - c) / (hy * hy); else if (dirB) s += (-2 * c) / (hy * hy);
        if (j < ny - 1) s += (x[k + nx] - c) / (hy * hy); else if (dirT) s += (-2 * c) / (hy * hy);
        y[k] = -s;      // positive semi-definite form
      }
    };
    const rhs = b.map((v) => -v); if (!this.outflow) { let m = 0; for (const v of rhs) m += v; m /= n; for (let k = 0; k < n; k++) rhs[k] -= m; }
    // conjugate gradient
    const x = P, r = new Float64Array(n), p = new Float64Array(n), Ap = new Float64Array(n); A(x, Ap); for (let k = 0; k < n; k++) { r[k] = rhs[k] - Ap[k]; p[k] = r[k]; }
    let rr = 0; for (const v of r) rr += v * v; const rr0 = rr || 1;
    for (let it = 0; it < 4 * (nx + ny) + 200 && rr > 1e-16 * rr0; it++) {
      A(p, Ap); let pAp = 0; for (let k = 0; k < n; k++) pAp += p[k] * Ap[k]; if (pAp <= 0) break;
      const al = rr / pAp; let rn = 0; for (let k = 0; k < n; k++) { x[k] += al * p[k]; r[k] -= al * Ap[k]; rn += r[k] * r[k]; }
      const be = rn / rr; rr = rn; for (let k = 0; k < n; k++) p[k] = r[k] + be * p[k];
    }
    // correct the velocities
    const fixedL = bc.left.type !== 'outflow', fixedR = bc.right.type !== 'outflow', fixedB = bc.bottom.type !== 'outflow', fixedT = bc.top.type !== 'outflow';
    for (let j = 0; j < ny; j++) for (let i = 0; i <= nx; i++) {
      if (i === 0 && fixedL) continue; if (i === nx && fixedR) continue;
      const pl = i > 0 ? P[i - 1 + nx * j] : null, pr = i < nx ? P[i + nx * j] : null;
      U[i + (nx + 1) * j] -= dt * (pl == null ? pr / (hx / 2) : pr == null ? -pl / (hx / 2) : (pr - pl) / hx);
    }
    for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) {
      if (j === 0 && fixedB) continue; if (j === ny && fixedT) continue;
      const pl = j > 0 ? P[i + nx * (j - 1)] : null, pr = j < ny ? P[i + nx * j] : null;
      V[i + nx * j] -= dt * (pl == null ? (pr - 0) / (hy / 2) : pr == null ? (0 - pl) / (hy / 2) : (pr - pl) / hy);
    }
  }
  addScalar(name, { D = 0, c0 = 0, source = null }) { this.scalars[name] = { name, D, source, C: new Float64Array(this.nx * this.ny).fill(c0) }; return this.scalars[name]; }
  advectScalar(s, dt) {
    const { nx, ny, hx, hy, U, V } = this, C = s.C, N = C.slice(), bc = this.bc;
    const lim = (r) => (r + Math.abs(r)) / (1 + Math.abs(r));    // van Leer
    const cAt = (i, j) => (i < 0 ? (bc.left.type === 'inflow' ? bc.left.c?.(this.t) ?? 0 : C[nx * j]) : i >= nx ? C[nx - 1 + nx * j] : j < 0 ? C[i] : j >= ny ? C[i + nx * (ny - 1)] : C[i + nx * j]);
    const fx = (i, j) => { const u = U[i + (nx + 1) * j]; if (i === 0 && bc.left.type !== 'outflow') return u * (bc.left.type === 'inflow' ? (bc.left.c?.(this.t) ?? 0) : 0); const a = cAt(i - 1, j), b = cAt(i, j); const up = u > 0 ? a : b, dn = u > 0 ? b : a, far = u > 0 ? cAt(i - 2, j) : cAt(i + 1, j); const r = dn - up === 0 ? 0 : (up - far) / (dn - up); return u * (up + 0.5 * lim(r) * (dn - up)) - s.D * (b - a) / hx; };
    const fy = (i, j) => { const v = V[i + nx * j]; if (j === 0 || j === ny) { if (j === 0 && bc.bottom.type === 'inflow') return v * (bc.bottom.c?.(this.t) ?? 0); if (j === ny && bc.top.type === 'inflow') return v * (bc.top.c?.(this.t) ?? 0); if ((j === 0 && bc.bottom.type !== 'outflow') || (j === ny && bc.top.type !== 'outflow')) return 0; } const a = cAt(i, j - 1), b = cAt(i, j); const up = v > 0 ? a : b, dn = v > 0 ? b : a, far = v > 0 ? cAt(i, j - 2) : cAt(i, j + 1); const r = dn - up === 0 ? 0 : (up - far) / (dn - up); return v * (up + 0.5 * lim(r) * (dn - up)) - s.D * (b - a) / hy; };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const wall = (side) => side.type === 'wall';
      const flxW = (i === 0 && wall(bc.left)) ? 0 : fx(i, j), flxE = (i === nx - 1 && wall(bc.right)) ? 0 : (i === nx - 1 ? U[nx + (nx + 1) * j] * C[i + nx * j] : fx(i + 1, j));
      const flyS = (j === 0 && wall(bc.bottom)) ? 0 : fy(i, j), flyN = (j === ny - 1 && wall(bc.top)) ? 0 : (j === ny - 1 ? V[i + nx * ny] * C[i + nx * j] : fy(i, j + 1));
      N[i + nx * j] = C[i + nx * j] - dt * ((flxE - flxW) / hx + (flyN - flyS) / hy) + (s.source ? dt * s.source((i + 0.5) * hx, (j + 0.5) * hy, this.t) : 0);
    }
    C.set(N);
  }
  /** Run until the velocity change per unit time is under `steady`, or maxSteps / tEnd. → { steps, t, change } */
  run({ steady = 1e-7, maxSteps = 100000, tEnd = Infinity } = {}) {
    let ch = Infinity;
    while (this.steps < maxSteps && this.t < tEnd) {
      const dt = Math.min(this.dtLimit(), tEnd - this.t), u0 = this.U.slice(), v0 = this.V.slice(); this.step(dt);
      ch = 0; for (let k = 0; k < u0.length; k++) ch = Math.max(ch, Math.abs(this.U[k] - u0[k])); for (let k = 0; k < v0.length; k++) ch = Math.max(ch, Math.abs(this.V[k] - v0[k])); ch /= dt;
      if (ch < steady && this.steps > 10) break;
    }
    return { steps: this.steps, t: this.t, change: ch };
  }
  /** u, v at cell centres */
  cellVelocity() { const { nx, ny, U, V } = this, u = new Float64Array(nx * ny), v = new Float64Array(nx * ny); for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { u[i + nx * j] = 0.5 * (U[i + (nx + 1) * j] + U[i + 1 + (nx + 1) * j]); v[i + nx * j] = 0.5 * (V[i + nx * j] + V[i + nx * (j + 1)]); } return { u, v }; }
  /** Velocity at a point (bilinear on the staggered components) */
  sample(x, y) {
    const { nx, ny, hx, hy } = this, bil = (arr, w, h, ox, oy, X, Y) => { let fx = X / hx - ox, fy = Y / hy - oy; fx = Math.min(Math.max(fx, 0), w - 1 - 1e-12); fy = Math.min(Math.max(fy, 0), h - 1 - 1e-12); const i = Math.floor(fx), j = Math.floor(fy), a = fx - i, b = fy - j; return (1 - a) * (1 - b) * arr[i + w * j] + a * (1 - b) * arr[i + 1 + w * j] + (1 - a) * b * arr[i + w * (j + 1)] + a * b * arr[i + 1 + w * (j + 1)]; };
    return [bil(this.U, nx + 1, ny, 0, 0.5, x, y), bil(this.V, nx, ny + 1, 0.5, 0, x, y)];
  }
  /** Stream function psi at the lower-left cell corners by integrating U upward: psi(i, j) with psi = 0 on the bottom */
  streamFunction() { const { nx, ny, hy, U } = this, psi = new Float64Array((nx + 1) * (ny + 1)); for (let i = 0; i <= nx; i++) for (let j = 1; j <= ny; j++) psi[i + (nx + 1) * j] = psi[i + (nx + 1) * (j - 1)] + U[i + (nx + 1) * (j - 1)] * hy; return psi; }
  /** Legacy ASCII VTK (an open format) of cell data: velocity, pressure, scalars */
  vtk(title = 'cadcraft flow') {
    const { nx, ny, hx, hy } = this, { u, v } = this.cellVelocity(); const L = ['# vtk DataFile Version 3.0', title, 'ASCII', 'DATASET STRUCTURED_POINTS', `DIMENSIONS ${nx + 1} ${ny + 1} 1`, `ORIGIN 0 0 0`, `SPACING ${hx} ${hy} 1`, `CELL_DATA ${nx * ny}`, 'VECTORS velocity float'];
    for (let k = 0; k < nx * ny; k++) L.push(`${u[k]} ${v[k]} 0`);
    L.push('SCALARS pressure float 1', 'LOOKUP_TABLE default'); for (let k = 0; k < nx * ny; k++) L.push(String(this.P[k]));
    for (const s of Object.values(this.scalars)) { L.push(`SCALARS ${s.name} float 1`, 'LOOKUP_TABLE default'); for (let k = 0; k < nx * ny; k++) L.push(String(s.C[k])); }
    return L.join('\n') + '\n';
  }
}

/** Mixing statistics of a scalar: mean, coefficient of variation, and the first time the CV falls below `target` while stepping. */
export function mixingTime(flow, name, { target = 0.05, tMax = 1e9, check = 20 } = {}) {
  const s = flow.scalars[name], cv = () => { let m = 0; for (const c of s.C) m += c; m /= s.C.length; let v = 0; for (const c of s.C) v += (c - m) ** 2; return m > 0 ? Math.sqrt(v / s.C.length) / m : Infinity; };
  const hist = [[flow.t, cv()]];
  while (flow.t < tMax && hist[hist.length - 1][1] > target) { for (let k = 0; k < check; k++) flow.step(); hist.push([flow.t, cv()]); }
  return { time: hist[hist.length - 1][1] <= target ? flow.t : null, history: hist };
}
