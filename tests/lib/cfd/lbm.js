/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lbm.js — mixing in stirred tanks and pipes on the lattice Boltzmann method (0.8 Track CH, CH.13; DOM-free, own code, Apache-2.0). Owner 2026-10-29: for 0.8 hand mixing to
 * PartCraft's lattice-Boltzmann method (k-epsilon waits). It is the method of PartCraft's `craftlib/lbm2d.craft` (D2Q9, BGK collision, Guo forcing, half-way bounce-back) written as a
 * module, with a passive tracer carried by the same velocity (a second D2Q9 distribution, advection–diffusion: Krüger et al., The Lattice Boltzmann Method, §8.2), an impeller
 * stand-in (a momentum source) and an open flow-through option for residence time distributions.
 *
 *   const S = createMixer({ nx, ny, solid?: (x, y) => bool | Uint8Array, tau = 0.8, tauD = 0.7, force?: [fx, fy], sources?: [{ x, y, r, fx, fy }], flow?: { u, C? } })
 *     flow: a left inlet at velocity u (equilibrium inlet; tracer value C, default 0) and a zero-gradient outlet on the right; without it the box is periodic in x
 *           and walled where `solid` says (walls are bounce-back, the tracer gets no flux through them).
 *   step(S, n = 1) · run(S, steps) · setTracer(S, (x, y) => C) · velocityAt(S, x, y) · field(S, 'ux'|'uy'|'C'|'speed') → Float64Array(nx·ny)
 *   mixingTime(S, { level = 0.05, maxSteps, every = 50 }) → { steps, reached, history }   the first time the largest deviation of the tracer from its mean is below `level` of the
 *                                                         initial deviation (or null/reached false)
 *   rtd(S, { steps, every }) → { t[], E[], mean, variance, nominal (V/Q) }   pulse of tracer at the inlet for one step, outlet flux recorded (flow-through mixers and pipes)
 *   vtk(S) → legacy ASCII VTK of ux, uy, C
 * Lattice units (cell 1, step 1): viscosity nu = (tau − 1/2)/3, diffusivity D = (tauD − 1/2)/3. Keep |u| below 0.1. Laminar only: no turbulence model (k-epsilon is not built), so a
 * result is a laminar mixing time, 2-D, with the impeller as a stand-in — not a real impeller. "Not engineer-reviewed" like the rest of Track CH equipment.
 */
export const CX = [0, 1, 0, -1, 0, 1, -1, -1, 1], CY = [0, 0, 1, 0, -1, 1, 1, -1, -1], W = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36], OPP = [0, 3, 4, 1, 2, 7, 8, 5, 6];

export function createMixer(o) {
  const nx = o.nx | 0, ny = o.ny | 0; if (!(nx >= 4 && ny >= 4 && nx * ny <= 4e6)) throw new Error('the mixer grid is 4 x 4 up to four million cells');
  const N = nx * ny, tau = o.tau ?? 0.8, tauD = o.tauD ?? 0.7; if (!(tau > 0.5) || !(tauD > 0.5)) throw new Error('tau and tauD must exceed 1/2');
  const solid = new Uint8Array(N);
  if (typeof o.solid === 'function') { for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) solid[x + nx * y] = o.solid(x, y) ? 1 : 0; } else if (o.solid) solid.set(o.solid);
  const S = { nx, ny, N, tau, tauD, solid, f: new Float64Array(9 * N), g: new Float64Array(9 * N), f2: new Float64Array(9 * N), g2: new Float64Array(9 * N), rho: new Float64Array(N).fill(1), ux: new Float64Array(N), uy: new Float64Array(N), C: new Float64Array(N),
    force: o.force || [0, 0], sources: (o.sources || []).map((s) => ({ ...s })), flow: o.flow || null, t: 0 };
  for (let i = 0; i < N; i++) for (let k = 0; k < 9; k++) { S.f[9 * i + k] = W[k]; S.g[9 * i + k] = 0; }
  // force per cell (Guo): uniform + the sources' discs
  S.Fx = new Float64Array(N).fill(S.force[0]); S.Fy = new Float64Array(N).fill(S.force[1]);
  for (const s of S.sources) for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) if (!solid[x + nx * y] && (x - s.x) ** 2 + (y - s.y) ** 2 <= s.r * s.r) { S.Fx[x + nx * y] += s.fx || 0; S.Fy[x + nx * y] += s.fy || 0; }
  if (S.flow) { const u = S.flow.u; for (let i = 0; i < N; i++) { if (solid[i]) continue; for (let k = 0; k < 9; k++) S.f[9 * i + k] = W[k] * (1 + 3 * CX[k] * u + 3 * u * u * (CX[k] * CX[k] - 1 / 3) * 1.5); S.ux[i] = u; } }
  return S;
}
const feq = (k, rho, ux, uy) => { const cu = CX[k] * ux + CY[k] * uy; return W[k] * rho * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * (ux * ux + uy * uy)); };
const geq = (k, C, ux, uy) => W[k] * C * (1 + 3 * (CX[k] * ux + CY[k] * uy));

export function step(S, n = 1) {
  const { nx, ny, N, tau, tauD, solid, Fx, Fy } = S, omega = 1 / tau, omegaD = 1 / tauD, open = !!S.flow;
  for (let it = 0; it < n; it++) {
    // collision (fluid cells): macroscopic fields, BGK with Guo forcing, tracer BGK
    for (let i = 0; i < N; i++) {
      if (solid[i]) continue;
      let r = 0, mx = 0, my = 0, c = 0; const b = 9 * i;
      for (let k = 0; k < 9; k++) { const fk = S.f[b + k]; r += fk; mx += fk * CX[k]; my += fk * CY[k]; c += S.g[b + k]; }
      const ux = (mx + 0.5 * Fx[i]) / r, uy = (my + 0.5 * Fy[i]) / r; S.rho[i] = r; S.ux[i] = ux; S.uy[i] = uy; S.C[i] = c;
      for (let k = 0; k < 9; k++) {
        const cu = CX[k] * ux + CY[k] * uy, Sk = (1 - 0.5 * omega) * W[k] * (3 * ((CX[k] - ux) * Fx[i] + (CY[k] - uy) * Fy[i]) + 9 * cu * (CX[k] * Fx[i] + CY[k] * Fy[i]));
        S.f[b + k] += -omega * (S.f[b + k] - feq(k, r, ux, uy)) + Sk;
        S.g[b + k] += -omegaD * (S.g[b + k] - geq(k, c, ux, uy));
      }
    }
    // streaming (pull) with half-way bounce-back at solid neighbours
    for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) {
      const i = x + nx * y; if (solid[i]) continue;
      for (let k = 0; k < 9; k++) {
        let xs = x - CX[k], ys = y - CY[k];
        const outY = ys < 0 || ys >= ny, outX = open && (xs < 0 || xs >= nx);
        if (!open) xs = (xs + nx) % nx; else if (outX) { S.f2[9 * i + k] = S.f[9 * i + k]; S.g2[9 * i + k] = S.g[9 * i + k]; continue; }     // the boundary columns are rewritten below
        if (outY) { S.f2[9 * i + k] = S.f[9 * i + OPP[k]]; S.g2[9 * i + k] = S.g[9 * i + OPP[k]]; continue; }     // the box edge top and bottom is a wall
        const j = xs + nx * ys;
        if (solid[j]) { S.f2[9 * i + k] = S.f[9 * i + OPP[k]]; S.g2[9 * i + k] = S.g[9 * i + OPP[k]]; } else { S.f2[9 * i + k] = S.f[9 * j + k]; S.g2[9 * i + k] = S.g[9 * j + k]; }
      }
    }
    if (open) {                                                                       // inlet: equilibrium at velocity u and tracer C; outlet: copy the neighbouring column
      const u = S.flow.u, Cin = typeof S.flow.C === 'function' ? S.flow.C(S.t) : (S.flow.C ?? 0);
      for (let y = 0; y < ny; y++) {
        const i0 = nx * y, i1 = 1 + nx * y, iN = nx - 1 + nx * y, iM = nx - 2 + nx * y;
        if (!solid[i0]) for (let k = 0; k < 9; k++) { S.f2[9 * i0 + k] = feq(k, 1, u, 0); S.g2[9 * i0 + k] = geq(k, Cin, u, 0); }
        if (!solid[iN] && !solid[iM]) {                                              // pressure outlet (density 1): equilibrium at the neighbour's velocity plus its non-equilibrium part
          let r = 0, mx = 0, my = 0; for (let k = 0; k < 9; k++) { const v = S.f2[9 * iM + k]; r += v; mx += v * CX[k]; my += v * CY[k]; }
          const ux = mx / r, uy = my / r;
          for (let k = 0; k < 9; k++) { S.f2[9 * iN + k] = feq(k, 1, ux, uy) + (S.f2[9 * iM + k] - feq(k, r, ux, uy)); S.g2[9 * iN + k] = S.g2[9 * iM + k]; }
        }
        void i1;
      }
    }
    [S.f, S.f2] = [S.f2, S.f]; [S.g, S.g2] = [S.g2, S.g]; S.t++;
  }
  // refresh the macroscopic fields from the streamed distributions
  for (let i = 0; i < N; i++) { if (solid[i]) continue; let r = 0, mx = 0, my = 0, c = 0; const b = 9 * i; for (let k = 0; k < 9; k++) { const fk = S.f[b + k]; r += fk; mx += fk * CX[k]; my += fk * CY[k]; c += S.g[b + k]; } S.rho[i] = r; S.ux[i] = (mx + 0.5 * Fx[i]) / r; S.uy[i] = (my + 0.5 * Fy[i]) / r; S.C[i] = c; }
  return S;
}
export const run = (S, steps) => step(S, steps);
export function setTracer(S, fn) {
  for (let y = 0; y < S.ny; y++) for (let x = 0; x < S.nx; x++) { const i = x + S.nx * y; if (S.solid[i]) continue; const c = fn(x, y); for (let k = 0; k < 9; k++) S.g[9 * i + k] = geq(k, c, S.ux[i], S.uy[i]); S.C[i] = c; }
}
export function field(S, name) {
  if (name === 'speed') return Float64Array.from(S.ux, (v, i) => (S.solid[i] ? 0 : Math.hypot(v, S.uy[i])));
  const a = S[name]; if (!a) throw new Error('field: ux | uy | C | rho | speed'); return Float64Array.from(a, (v, i) => (S.solid[i] ? 0 : v));
}
export const velocityAt = (S, x, y) => { const i = Math.round(x) + S.nx * Math.round(y); return [S.ux[i], S.uy[i]]; };
const stats = (S) => { let sum = 0, n = 0; for (let i = 0; i < S.N; i++) if (!S.solid[i]) { sum += S.C[i]; n++; } const mean = sum / n; let dev = 0; for (let i = 0; i < S.N; i++) if (!S.solid[i]) dev = Math.max(dev, Math.abs(S.C[i] - mean)); return { mean, dev }; };
export function mixingTime(S, { level = 0.05, maxSteps = 20000, every = 50 } = {}) {
  step(S, 0); const s0 = stats(S), history = [[S.t, s0.dev]]; if (!(s0.dev > 0)) return { steps: 0, reached: true, history };
  const t0 = S.t;
  for (let n = 0; n < maxSteps; n += every) {
    step(S, every); const s = stats(S); history.push([S.t - t0, s.dev]);
    if (s.dev <= level * s0.dev) return { steps: S.t - t0, reached: true, history, mean: s.mean };
  }
  return { steps: null, reached: false, history };
}
/** Residence time distribution of a flow-through box: a one-step pulse of tracer at the inlet, then the tracer flux through the last column. E(t) is normalised to unit area. */
export function rtd(S, { steps = 4000, every = 5, pulse = 1 } = {}) {
  if (!S.flow) throw new Error('rtd needs a flow-through mixer (flow: { u })');
  const t = [], E = [], c0 = S.flow.C; let area = 0;
  S.flow.C = pulse; step(S, 1); S.flow.C = 0;
  const base = S.t;
  for (let n = 0; n < steps; n += every) {
    step(S, every); let flux = 0; for (let y = 0; y < S.ny; y++) { const i = S.nx - 2 + S.nx * y; if (!S.solid[i]) flux += S.C[i] * S.ux[i]; }
    t.push(S.t - base); E.push(flux); area += flux * every;
  }
  S.flow.C = c0;
  const En = E.map((v) => v / (area || 1)); let mean = 0, m2 = 0; for (let k = 0; k < t.length; k++) { mean += t[k] * En[k] * every; m2 += t[k] * t[k] * En[k] * every; }
  let Q = 0, V = 0; for (let y = 0; y < S.ny; y++) { if (!S.solid[S.nx - 2 + S.nx * y]) Q += S.ux[S.nx - 2 + S.nx * y]; for (let x = 1; x <= S.nx - 2; x++) if (!S.solid[x + S.nx * y]) V++; }
  return { t, E: En, mean, variance: m2 - mean * mean, area, nominal: Q > 0 ? V / Q : null };   // nominal = V/Q from the outlet flux: the mean of a complete RTD equals it
}
export function vtk(S, name = 'mixer') {
  const L = ['# vtk DataFile Version 3.0', name, 'ASCII', 'DATASET STRUCTURED_POINTS', `DIMENSIONS ${S.nx} ${S.ny} 1`, 'ORIGIN 0 0 0', 'SPACING 1 1 1', `POINT_DATA ${S.N}`, 'VECTORS velocity float'];
  for (let i = 0; i < S.N; i++) L.push(`${(S.solid[i] ? 0 : S.ux[i]).toPrecision(6)} ${(S.solid[i] ? 0 : S.uy[i]).toPrecision(6)} 0`);
  L.push('SCALARS tracer float 1', 'LOOKUP_TABLE default'); for (let i = 0; i < S.N; i++) L.push((S.solid[i] ? 0 : S.C[i]).toPrecision(6)); return L.join('\n') + '\n';
}
