/* SPDX-License-Identifier: Apache-2.0 */
/**
 * md.js — our own molecular dynamics engine (0.8 Track CH, CH.25; DOM-free, no imports). Clean room from the published methods only:
 * Lennard-Jones 12-6 with Lorentz-Berthelot mixing and an energy-shifted cutoff, harmonic bonds and angles, periodic dihedrals, Ewald summation for charges
 * (real-space erfc, reciprocal sum, self term, excluded-pair correction), velocity Verlet (Swope 1982), Langevin (OU) and Berendsen thermostats, Berendsen
 * barostat, virial pressure, radial distribution function, mean-square displacement. No LAMMPS, GROMACS or other program's code or files is used (rule 43).
 *
 * Units: 'reduced' (sigma = epsilon = m = kB = 1, Coulomb constant 1) or 'real' (Angstrom, kcal/mol, amu, ps, elementary charge; Coulomb constant 332.0637,
 * kB 0.0019872041 kcal/mol/K, 1 kcal/mol/Angstrom/amu = 418.4 Angstrom/ps^2, 1 kcal/mol/Angstrom^3 = 68568.4 atm). Typed constants are listed in UNITS and are
 * `not confirmed` until a person compares them with CODATA.
 *
 * Ewald: the plain sum (O(N * K^3)) by default; `ewald: { alpha, kmax, pme: { grid: [32, 32, 32], order: 4 } }` switches the reciprocal sum to smooth particle-mesh Ewald (pme.js, power-of-two grid); bond constraints are `shake()` in pme.js.
 * Not built (so nobody assumes): RATTLE as a separate velocity step,
 * Nose-Hoover and Parrinello-Rahman, 1-4 scaling, the dihedral term's share of the pressure virial, long-range LJ tail corrections, triclinic cells, GPU. Quantum chemistry stays out of 0.8.
 */
import { pmeRecip, shake } from './pme.js';
export const UNITS = {
  reduced: { name: 'reduced', kB: 1, ke: 1, accel: 1, pConv: 1 },
  real: { name: 'real (Angstrom, kcal/mol, amu, ps, e)', kB: 0.0019872041, ke: 332.0637, accel: 418.4, pConv: 68568.4, check: 'not confirmed' },
};
export const SOURCES = {
  lj: 'Lennard-Jones: U = 4 eps [(sigma/r)^12 - (sigma/r)^6], Lorentz-Berthelot mixing sigma_ij = (si + sj)/2, eps_ij = sqrt(ei ej), energy shifted to zero at the cutoff',
  ewald: 'Ewald (1921) as in Frenkel and Smit: E = ke/2 sum q_i q_j erfc(alpha r)/r + (2 pi ke/V) sum_{k != 0} exp(-k^2/4 alpha^2)/k^2 |S(k)|^2 - ke alpha/sqrt(pi) sum q^2, minus erf(alpha r)/r for excluded pairs',
  verlet: 'velocity Verlet (Swope et al. 1982)', langevin: 'Ornstein-Uhlenbeck velocity update v <- c v + sqrt((1 - c^2) kT/m) xi, c = exp(-gamma dt)',
  berendsen: 'Berendsen et al. 1984 weak coupling: lambda = sqrt(1 + dt/tau (T0/T - 1)); barostat mu = (1 - dt/tau_p kappa (P0 - P))^(1/3)',
  virial: 'P = (2 KE + sum r_ij . F_ij) / (3 V) with the Ewald reciprocal energy as its virial',
};
export const ARGON = { name: 'argon (LJ)', sigma: 3.405, epsK: 119.8, mass: 39.948, note: 'Typed from the usual argon Lennard-Jones set (sigma 3.405 Angstrom, eps/k 119.8 K) without the paper open: NOT confirmed' };

// ---- helpers ------------------------------------------------------------------------------------------------------------------------
function rng(seed) { let a = seed >>> 0 || 1; const u = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; let spare = null; return { u, n() { if (spare !== null) { const s = spare; spare = null; return s; } let x, y, r; do { x = 2 * u() - 1; y = 2 * u() - 1; r = x * x + y * y; } while (r >= 1 || r === 0); const m = Math.sqrt(-2 * Math.log(r) / r); spare = y * m; return x * m; } }; }
export function erfc(x) { const z = Math.abs(x), t = 1 / (1 + 0.5 * z), r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))))); return x >= 0 ? r : 2 - r; }
const erf = (x) => 1 - erfc(x);

/**
 * createSystem({ units, box: [Lx, Ly, Lz], types: { A: { sigma, eps, mass } }, atoms: [{ type, x, y, z, q? }], bonds: [[i, j, k, r0]], angles: [[i, j, l, k, theta0]],
 *   dihedrals: [[i, j, k, l, kd, n, delta]], rc, ewald: { alpha, kmax } | null, seed, T0 (initial temperature) })
 * Bond energy is k/2 (r - r0)^2 and angle energy k/2 (theta - theta0)^2 (k per length^2 or per radian^2; the person's force field).
 */
export function createSystem(o) {
  const U = UNITS[o.units || 'reduced']; if (!U) throw new Error('units: reduced or real');
  const N = o.atoms.length; if (!(N > 0 && N <= 20000)) throw new Error('1 to 20000 atoms.');
  const box = o.box.slice(); if (!(box.length === 3 && box.every((v) => v > 0))) throw new Error('box: three positive lengths.');
  const names = Object.keys(o.types), tIndex = Object.fromEntries(names.map((k, i) => [k, i]));
  const sys = { U, N, box, types: names.map((k) => ({ name: k, ...o.types[k] })), type: new Int32Array(N), mass: new Float64Array(N), q: new Float64Array(N), x: new Float64Array(3 * N), v: new Float64Array(3 * N), f: new Float64Array(3 * N),
    bonds: (o.bonds || []).map((b) => b.slice()), angles: (o.angles || []).map((b) => b.slice()), dihedrals: (o.dihedrals || []).map((b) => b.slice()), constraints: (o.constraints || []).map((c) => c.slice()), rc: o.rc ?? 2.5, ewald: o.ewald || null, shift: o.shift !== false, time: 0, step: 0, rng: rng(o.seed ?? 12345), thermo: {}, notes: [] };
  o.atoms.forEach((a, i) => { const t = tIndex[a.type]; if (t === undefined) throw new Error('Unknown atom type ' + a.type); sys.type[i] = t; sys.mass[i] = sys.types[t].mass; sys.q[i] = a.q ?? 0; sys.x[3 * i] = a.x; sys.x[3 * i + 1] = a.y; sys.x[3 * i + 2] = a.z; });
  if (sys.rc * 2 > Math.min(...box) + 1e-9) throw new Error('The cutoff must be at most half the smallest box side.');
  if (!sys.ewald && sys.q.some((c) => c !== 0)) throw new Error('Charges need Ewald parameters ({ alpha, kmax }); a bare cutoff on charges is not offered.');
  sys.excl = new Set(); const ex = (i, j) => sys.excl.add(i < j ? i * N + j : j * N + i);
  for (const b of sys.bonds) ex(b[0], b[1]); for (const c of sys.constraints) ex(c[0], c[1]); for (const a of sys.angles) { ex(a[0], a[1]); ex(a[1], a[2]); ex(a[0], a[2]); }
  sys.sig = sys.types.map((a) => sys.types.map((b) => (a.sigma + b.sigma) / 2)); sys.eps = sys.types.map((a) => sys.types.map((b) => Math.sqrt(a.eps * b.eps)));
  sys.eShift = sys.types.map((_, a) => sys.types.map((__, b) => { if (!sys.shift) return 0; const s = (sys.sig[a][b] / sys.rc) ** 6; return 4 * sys.eps[a][b] * (s * s - s); }));
  // velocities: Maxwell-Boltzmann at T0, zero total momentum
  const T0 = o.T0 ?? 0; if (T0 > 0) { for (let i = 0; i < N; i++) { const s = Math.sqrt(U.kB * T0 * U.accel / sys.mass[i]); for (let d = 0; d < 3; d++) sys.v[3 * i + d] = s * sys.rng.n(); } removeDrift(sys); scaleTo(sys, T0); }
  computeForces(sys); return sys;
}
function removeDrift(s) { let M = 0; const p = [0, 0, 0]; for (let i = 0; i < s.N; i++) { M += s.mass[i]; for (let d = 0; d < 3; d++) p[d] += s.mass[i] * s.v[3 * i + d]; } for (let i = 0; i < s.N; i++) for (let d = 0; d < 3; d++) s.v[3 * i + d] -= p[d] / M; }
export function dof(s) { return Math.max(1, 3 * s.N - 3 - (s.constraints ? s.constraints.length : 0)); }
/** Kinetic energy in the energy unit of the system. */
export function kinetic(s) { let k = 0; for (let i = 0; i < s.N; i++) k += s.mass[i] * (s.v[3 * i] ** 2 + s.v[3 * i + 1] ** 2 + s.v[3 * i + 2] ** 2); return 0.5 * k / s.U.accel; }
export function temperature(s) { return 2 * kinetic(s) / (dof(s) * s.U.kB); }
function scaleTo(s, T) { const t = temperature(s); if (t <= 0) return; const f = Math.sqrt(T / t); for (let i = 0; i < 3 * s.N; i++) s.v[i] *= f; }
const mi = (d, L) => d - L * Math.round(d / L);

/** Forces, potential energy parts and the virial. Sets s.f, s.pe = { lj, bond, angle, dihedral, coul, total }, s.W. */
export function computeForces(s) {
  const { N, box, f, x, q } = s; f.fill(0); let lj = 0, W = 0; const rc2 = s.rc * s.rc, ke = s.U.ke;
  let coulReal = 0, excl = 0; const alpha = s.ewald?.alpha, twoA = alpha ? 2 * alpha / Math.sqrt(Math.PI) : 0;
  const pair = (i, j) => {
    let dx = mi(x[3 * i] - x[3 * j], box[0]), dy = mi(x[3 * i + 1] - x[3 * j + 1], box[1]), dz = mi(x[3 * i + 2] - x[3 * j + 2], box[2]);
    const r2 = dx * dx + dy * dy + dz * dz, key = i < j ? i * N + j : j * N + i, excluded = s.excl.size && s.excl.has(key);
    if (r2 > rc2 && !excluded) return;
    let fr = 0; // force / r
    if (excluded) { if (alpha && q[i] && q[j]) { const r = Math.sqrt(r2), er = erf(alpha * r) / r; excl -= ke * q[i] * q[j] * er; fr = ke * q[i] * q[j] * (twoA * Math.exp(-alpha * alpha * r2) - er) / r2; } }
    else {
      const a = s.type[i], b = s.type[j], sg = s.sig[a][b], ep = s.eps[a][b];
      if (ep > 0) { const s2 = sg * sg / r2, s6 = s2 * s2 * s2, e = 4 * ep * (s6 * s6 - s6) - s.eShift[a][b]; lj += e; fr += 24 * ep * (2 * s6 * s6 - s6) / r2; }
      if (alpha && q[i] && q[j]) { const r = Math.sqrt(r2), ec = erfc(alpha * r); coulReal += ke * q[i] * q[j] * ec / r; fr += ke * q[i] * q[j] * (ec / r + twoA * Math.exp(-alpha * alpha * r2)) / r2; }
    }
    if (fr === 0) return;
    W += fr * r2; f[3 * i] += fr * dx; f[3 * i + 1] += fr * dy; f[3 * i + 2] += fr * dz; f[3 * j] -= fr * dx; f[3 * j + 1] -= fr * dy; f[3 * j + 2] -= fr * dz;
  };
  const nc = box.map((L) => Math.max(1, Math.floor(L / s.rc)));
  if (nc.some((c) => c < 3)) { for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) pair(i, j); }
  else {
    const head = new Int32Array(nc[0] * nc[1] * nc[2]).fill(-1), next = new Int32Array(N), cell = (i) => { const c = [0, 1, 2].map((d) => { let w = x[3 * i + d] / box[d]; w -= Math.floor(w); return Math.min(nc[d] - 1, Math.floor(w * nc[d])); }); return (c[0] * nc[1] + c[1]) * nc[2] + c[2]; };
    for (let i = 0; i < N; i++) { const c = cell(i); next[i] = head[c]; head[c] = i; }
    for (let cx = 0; cx < nc[0]; cx++) for (let cy = 0; cy < nc[1]; cy++) for (let cz = 0; cz < nc[2]; cz++) {
      const c0 = (cx * nc[1] + cy) * nc[2] + cz;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const c1 = (((cx + dx + nc[0]) % nc[0]) * nc[1] + ((cy + dy + nc[1]) % nc[1])) * nc[2] + ((cz + dz + nc[2]) % nc[2]); if (c1 < c0) continue;
        for (let i = head[c0]; i >= 0; i = next[i]) for (let j = c1 === c0 ? next[i] : head[c1]; j >= 0; j = next[j]) pair(i, j);
      }
    }
    // excluded pairs outside the cutoff (bonded atoms are normally inside; make sure of it)
    if (alpha) for (const key of s.excl) { const i = Math.floor(key / N), j = key % N; const dx = mi(x[3 * i] - x[3 * j], box[0]), dy = mi(x[3 * i + 1] - x[3 * j + 1], box[1]), dz = mi(x[3 * i + 2] - x[3 * j + 2], box[2]); if (dx * dx + dy * dy + dz * dz > rc2) pair(i, j); }
  }
  // bonded
  let eb = 0, ea = 0, ed = 0;
  for (const [i, j, k, r0] of s.bonds) { const dx = mi(x[3 * i] - x[3 * j], box[0]), dy = mi(x[3 * i + 1] - x[3 * j + 1], box[1]), dz = mi(x[3 * i + 2] - x[3 * j + 2], box[2]), r = Math.hypot(dx, dy, dz), d = r - r0; eb += 0.5 * k * d * d; const fr = -k * d / (r || 1); W += fr * r * r; f[3 * i] += fr * dx; f[3 * i + 1] += fr * dy; f[3 * i + 2] += fr * dz; f[3 * j] -= fr * dx; f[3 * j + 1] -= fr * dy; f[3 * j + 2] -= fr * dz; }
  for (const [i, j, l, k, th0] of s.angles) {   // i-j-l with j the vertex
    const ax = mi(x[3 * i] - x[3 * j], box[0]), ay = mi(x[3 * i + 1] - x[3 * j + 1], box[1]), az = mi(x[3 * i + 2] - x[3 * j + 2], box[2]), bx = mi(x[3 * l] - x[3 * j], box[0]), by = mi(x[3 * l + 1] - x[3 * j + 1], box[1]), bz = mi(x[3 * l + 2] - x[3 * j + 2], box[2]);
    const ra = Math.hypot(ax, ay, az), rb = Math.hypot(bx, by, bz), c = Math.max(-1, Math.min(1, (ax * bx + ay * by + az * bz) / (ra * rb))), th = Math.acos(c), sn = Math.max(Math.sqrt(1 - c * c), 1e-8), dth = th - th0;
    ea += 0.5 * k * dth * dth; const g = k * dth / sn;   // dE/dcos = -k dth / sin
    const fi = [g * (bx / (ra * rb) - c * ax / (ra * ra)), g * (by / (ra * rb) - c * ay / (ra * ra)), g * (bz / (ra * rb) - c * az / (ra * ra))], fl = [g * (ax / (ra * rb) - c * bx / (rb * rb)), g * (ay / (ra * rb) - c * by / (rb * rb)), g * (az / (ra * rb) - c * bz / (rb * rb))];
    for (let d = 0; d < 3; d++) { f[3 * i + d] += fi[d]; f[3 * l + d] += fl[d]; f[3 * j + d] -= fi[d] + fl[d]; }
    W += fi[0] * ax + fi[1] * ay + fi[2] * az + fl[0] * bx + fl[1] * by + fl[2] * bz;
  }
  for (const [i, j, k, l, kd, n, delta] of s.dihedrals) {
    const P = (a, b) => [mi(x[3 * b] - x[3 * a], box[0]), mi(x[3 * b + 1] - x[3 * a + 1], box[1]), mi(x[3 * b + 2] - x[3 * a + 2], box[2])], cr = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], dt = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
    const b1 = P(i, j), b2 = P(j, k), b3 = P(k, l), n1 = cr(b1, b2), n2 = cr(b2, b3), lb2 = Math.sqrt(dt(b2, b2)), n1s = dt(n1, n1), n2s = dt(n2, n2);
    if (n1s < 1e-12 || n2s < 1e-12) continue;
    const phi = Math.atan2(lb2 * dt(b1, n2), dt(n1, n2)); ed += kd * (1 + Math.cos(n * phi - delta));
    const dE = -kd * n * Math.sin(n * phi - delta), gi = n1.map((v) => -lb2 / n1s * v), gl = n2.map((v) => lb2 / n2s * v), p = dt(b1, b2) / (lb2 * lb2), r = dt(b3, b2) / (lb2 * lb2);
    const gj = gi.map((v, d) => -v - p * v + r * gl[d]), gk = gl.map((v, d) => -v + p * gi[d] - r * gl[d]);
    for (let d = 0; d < 3; d++) { f[3 * i + d] -= dE * gi[d]; f[3 * j + d] -= dE * gj[d]; f[3 * k + d] -= dE * gk[d]; f[3 * l + d] -= dE * gl[d]; }
  }
  // Ewald reciprocal + self
  let erec = 0, eself = 0;
  if (alpha) {
    const km = s.ewald.kmax, V = box[0] * box[1] * box[2], pre = 2 * Math.PI * ke / V, a4 = 1 / (4 * alpha * alpha);
    if (s.ewald.pme) {                                             // smooth particle-mesh Ewald (pme.js): grid [Kx, Ky, Kz] powers of two, spline order
      const g = s.ewald.pme.grid || [32, 32, 32], r = pmeRecip({ x: s.x, q, box, alpha, grid: Array.isArray(g) ? g : [g, g, g], order: s.ewald.pme.order || 4, ke }); erec = r.E; for (let i = 0; i < 3 * N; i++) f[i] += r.F[i];
    } else for (let nx = -km; nx <= km; nx++) for (let ny = -km; ny <= km; ny++) for (let nz = -km; nz <= km; nz++) {
      if (!nx && !ny && !nz) continue; const n2 = nx * nx + ny * ny + nz * nz; if (n2 > km * km) continue;
      const kx = 2 * Math.PI * nx / box[0], ky = 2 * Math.PI * ny / box[1], kz = 2 * Math.PI * nz / box[2], k2 = kx * kx + ky * ky + kz * kz, A = Math.exp(-k2 * a4) / k2;
      let Sr = 0, Si = 0; const cs = new Float64Array(N), sn = new Float64Array(N);
      for (let i = 0; i < N; i++) { if (!q[i]) continue; const ph = kx * x[3 * i] + ky * x[3 * i + 1] + kz * x[3 * i + 2]; cs[i] = Math.cos(ph); sn[i] = Math.sin(ph); Sr += q[i] * cs[i]; Si += q[i] * sn[i]; }
      erec += pre * A * (Sr * Sr + Si * Si);
      for (let i = 0; i < N; i++) { if (!q[i]) continue; const g = 2 * pre * A * q[i] * (Sr * sn[i] - Si * cs[i]); f[3 * i] += g * kx; f[3 * i + 1] += g * ky; f[3 * i + 2] += g * kz; }
    }
    let q2 = 0; for (let i = 0; i < N; i++) q2 += q[i] * q[i]; eself = -ke * alpha / Math.sqrt(Math.PI) * q2; W += erec;
  }
  const coul = coulReal + excl + erec + eself;
  s.pe = { lj, bond: eb, angle: ea, dihedral: ed, coul, coulReal, coulRecip: erec, coulSelf: eself, coulExcl: excl, total: lj + eb + ea + ed + coul }; s.W = W; return s.pe;
}
export function volume(s) { return s.box[0] * s.box[1] * s.box[2]; }
/** Pressure in the system's pressure unit (reduced: epsilon/sigma^3; real: atm). */
export function pressure(s) { return (2 * kinetic(s) + s.W) / (3 * volume(s)) * s.U.pConv; }

/** Advance `n` steps of `dt` (ps in real units; reduced time otherwise). opts { thermostat: null | { type: 'langevin', T, gamma } | { type: 'berendsen', T, tau }, barostat: null | { P, tau, kappa }, every, onSample(s) } */
export function run(s, n, dt, { thermostat = null, barostat = null, every = 0, onSample = null } = {}) {
  const { N, v, x, f, mass, U } = s, a = U.accel;
  for (let it = 0; it < n; it++) {
    const xOld = s.constraints.length ? Float64Array.from(x) : null;
    for (let i = 0; i < N; i++) { const c = 0.5 * dt * a / mass[i]; for (let d = 0; d < 3; d++) { v[3 * i + d] += c * f[3 * i + d]; x[3 * i + d] += dt * v[3 * i + d]; } }
    if (xOld) s.shakeInfo = shake(s, s.constraints, dt, xOld);
    if (barostat) { const P = pressure(s), mu = Math.cbrt(Math.max(0.5, 1 - dt / barostat.tau * (barostat.kappa ?? 1) * (barostat.P - P))); for (let d = 0; d < 3; d++) s.box[d] *= mu; for (let i = 0; i < 3 * N; i++) x[i] *= mu; if (s.rc * 2 > Math.min(...s.box)) throw new Error('The box shrank below twice the cutoff.'); }
    computeForces(s);
    for (let i = 0; i < N; i++) { const c = 0.5 * dt * a / mass[i]; for (let d = 0; d < 3; d++) v[3 * i + d] += c * f[3 * i + d]; }
    if (thermostat?.type === 'langevin') { const c1 = Math.exp(-thermostat.gamma * dt), c2 = Math.sqrt(1 - c1 * c1); for (let i = 0; i < N; i++) { const sd = Math.sqrt(U.kB * thermostat.T * a / mass[i]); for (let d = 0; d < 3; d++) v[3 * i + d] = c1 * v[3 * i + d] + c2 * sd * s.rng.n(); } }
    else if (thermostat?.type === 'berendsen') { const T = temperature(s); if (T > 0) { const lam = Math.sqrt(1 + dt / thermostat.tau * (thermostat.T / T - 1)); for (let i = 0; i < 3 * N; i++) v[i] *= lam; } }
    s.step++; s.time += dt;
    if (every && onSample && s.step % every === 0) onSample(s);
  }
  return s;
}
/** Wrap positions into the box (does not change dynamics). */
export function wrap(s) { for (let i = 0; i < s.N; i++) for (let d = 0; d < 3; d++) { const L = s.box[d]; s.x[3 * i + d] -= L * Math.floor(s.x[3 * i + d] / L); } }
export function energies(s) { return { kinetic: kinetic(s), potential: s.pe.total, total: kinetic(s) + s.pe.total, T: temperature(s), P: pressure(s), V: volume(s) }; }

// ---- properties ----------------------------------------------------------------------------------------------------------------------
/** Radial distribution accumulator: g = rdf(); rdf.add(sys, typeA?, typeB?); rdf.result(). rmax defaults to half the smallest box side. */
export function rdf(nbins = 100, rmax = null) {
  const hist = new Float64Array(nbins); let frames = 0, rm = rmax, nA = 0, nB = 0, vol = 0, same = true;
  return {
    add(s, ta = null, tb = null) {
      rm = rm ?? Math.min(...s.box) / 2; const dr = rm / nbins; const ia = [], ib = []; for (let i = 0; i < s.N; i++) { if (ta === null || s.types[s.type[i]].name === ta) ia.push(i); if (tb === null || s.types[s.type[i]].name === tb) ib.push(i); }
      same = ta === tb; nA = ia.length; nB = ib.length; vol = volume(s);
      for (const i of ia) for (const j of ib) { if (i === j) continue; const r = Math.hypot(mi(s.x[3 * i] - s.x[3 * j], s.box[0]), mi(s.x[3 * i + 1] - s.x[3 * j + 1], s.box[1]), mi(s.x[3 * i + 2] - s.x[3 * j + 2], s.box[2])); if (r < rm) hist[Math.floor(r / dr)]++; }
      frames++;
    },
    result() { const dr = rm / nbins, r = [], g = []; for (let b = 0; b < nbins; b++) { const shell = 4 / 3 * Math.PI * (((b + 1) * dr) ** 3 - (b * dr) ** 3), ideal = shell * (same ? (nA - 1) : nB) / vol * nA; r.push((b + 0.5) * dr); g.push(hist[b] / (frames * ideal || 1)); } return { r, g, frames }; },
  };
}
/** Mean-square displacement from unwrapped coordinates: m = msd(sys); each sample call m.add(sys, time); fit D = slope/6 over [from, to] of the stored time. */
export function msd(s0) {
  const N = s0.N, ref = Float64Array.from(s0.x), cur = Float64Array.from(s0.x), prev = Float64Array.from(s0.x), pts = [];
  return {
    add(s, t) { for (let i = 0; i < 3 * N; i++) { let d = s.x[i] - prev[i]; const L = s.box[i % 3]; d -= L * Math.round(d / L); cur[i] += d; prev[i] = s.x[i]; } let m = 0; for (let i = 0; i < 3 * N; i++) m += (cur[i] - ref[i]) ** 2; pts.push([t, m / N]); },
    points: pts,
    diffusion(from = 0.3, to = 1) { const a = pts.slice(Math.floor(pts.length * from), Math.ceil(pts.length * to)); if (a.length < 3) return null; const n = a.length, st = a.reduce((x, p) => x + p[0], 0), sm = a.reduce((x, p) => x + p[1], 0), stt = a.reduce((x, p) => x + p[0] * p[0], 0), stm = a.reduce((x, p) => x + p[0] * p[1], 0); return (n * stm - st * sm) / (n * stt - st * st) / 6; },
  };
}
/** Mass density of the system in g/cm3 (real units only). */
export function density(s) { if (s.U.name === 'reduced') throw new Error('Density in g/cm3 needs real units.'); let m = 0; for (let i = 0; i < s.N; i++) m += s.mass[i]; return m / 0.602214076 / volume(s); }   // amu per Angstrom^3 -> g/cm3 : 1.66054 per amu/A^3
/** A fcc lattice of LJ atoms (4 per cell) filling the box: n cells per side, returns atoms for createSystem. */
export function fccAtoms(n, a, type = 'A') { const b = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]], out = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) for (const p of b) out.push({ type, x: (i + p[0]) * a, y: (j + p[1]) * a, z: (k + p[2]) * a }); return out; }
