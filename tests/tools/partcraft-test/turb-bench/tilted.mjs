/* SPDX-License-Identifier: Apache-2.0 */
// A plane channel at 45° in the x-y plane (staircase walls x − y = const), periodic in x, y and z, driven by a body
// force along (1,1,0)/√2: friction vs Dean, the same Re_τ as the axis-aligned channel test. Isolates the staircase.
// node tilted.mjs --W 28 --ReTau 1000 [--opt k=v,...] [--axis]   (W = channel width in cells along x at fixed y)
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DEV = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/partcraft/dev/');
const LIB = process.env.FLOW_DIR || DEV;
const FL = await import(path.join(LIB, 'flow.js'));
const FT = await import(path.join(LIB, 'flow-turb.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const Wx = +arg('W', 28), ReTau = +arg('ReTau', 1000), MAX = +arg('steps', 600000);
const opts = Object.fromEntries((arg('opt', '') || '').split(',').filter(Boolean).map((s) => { const [k, v] = s.split('='); return [k, v === 'true' ? true : v === 'false' ? false : +v]; }));
const L = Wx + 6, s2 = Math.SQRT2;
const a = 0.3;   // walls at x − y ≡ a and a + Wx (mod L), off the cell centres
const h = Wx / s2 / 2;   // half width (normal)
const ut = 0.005, nu = ut * h / ReTau;
const kind = new Int32Array(L * L);
const sOf = (i, j) => (((i - j - a) % L) + L) % L;   // 0 … L: inside when < Wx
for (let j = 0; j < L; j++) for (let i = 0; i < L; i++) kind[i + L * j] = sOf(i, j) < Wx ? 0 : -1;
const lat = FL.buildLattice({ nx: L, ny: L, nz: 1, kind, periodic: [true, true, true],
  wallGroup: (cell, q) => {
    const i = cell % L, j = Math.floor(cell / L) % L, dx = FL.CX[q], dy = FL.CY[q], ds = dx - dy;
    if (ds === 0) return null;
    const s = sOf(i, j);   // along the link s changes by ds per unit t: hits 0 (ds < 0) or Wx (ds > 0)
    const t = ds > 0 ? (Wx - s) / ds : -s / ds;
    const n = ds > 0 ? [1 / s2, -1 / s2, 0] : [-1 / s2, 1 / s2, 0];
    return { g: 0, q: Math.min(1, Math.max(1e-3, t)), d: t, n };
  } });
const N = lat.nf, Fm = ut * ut / h, f = [Fm / s2, Fm / s2, 0];
const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, eddy: true, force: f, u0: [14 * ut / s2, 14 * ut / s2, 0], smagorinsky: FT.STABILIZER });
const T = FT.attachSA(S, { nu, nt0: 0.05 * ut * h, ...opts });
// bulk velocity: fluid volume per unit length = N cells / (length along the channel in the torus); flux along e = Σ u·e / N × (true width/cells…)
// Simpler: mean of u·e over cells × (cells per true area). Cells per unit area 1; true cross-section width 2h per unit length.
const ub = () => { let sm = 0; for (let m = 0; m < N; m++) sm += (S.ux[m] + S.uy[m]) / s2; return sm / N * (N / (2 * h * L * s2)); };
let prev = 0, conv = false;
for (let st = 1; st <= MAX; st++) {
  FL.step(S);
  if (st % 5000) continue;
  const u = ub(); if (!Number.isFinite(u)) { console.log('blew up', st); break; }
  if (st > 40000 && Math.abs(u - prev) < 1e-6 * u) { conv = true; break; }
  prev = u;
}
const u = ub(), Reb = u * 2 * h / nu, Cf = 2 * ut * ut / (u * u), dean = 0.073 * Reb ** -0.25;
console.log(`RESULT tilted 45° W=${Wx} (2h ${(2 * h).toFixed(2)} cells) ReTau=${ReTau} opts=${JSON.stringify(opts)}: fluid cells ${N} vs area ${(2 * h * L * s2).toFixed(1)}, Re_m ${Reb.toFixed(0)} Cf ${Cf.toExponential(4)} vs Dean ${dean.toExponential(4)} (${((Cf / dean - 1) * 100).toFixed(1)} %), y+ ${FT.wallStats(T).p50.toFixed(1)}${conv ? '' : ' (not converged)'}`);
