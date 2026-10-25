/* SPDX-License-Identifier: Apache-2.0 */
// Fully developed pipe through voxel cells (staircase walls with Bouzidi links, true wall distances and normals),
// periodic along z, driven by a body force. Friction factor f = 8 (u_τ/U_b)² vs Colebrook (smooth).
// node pipe.mjs --D 20 --ReTau 600 [--opt k=v,...] [--steps 300000]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DEV = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/partcraft/dev/');
const LIB = process.env.FLOW_DIR || DEV;
const FL = await import(path.join(LIB, 'flow.js'));
const FT = await import(path.join(LIB, 'flow-turb.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const D = +arg('D', 20), ReTau = +arg('ReTau', 600), MAX = +arg('steps', 400000), NZ = +arg('nz', 2);
const opts = Object.fromEntries((arg('opt', '') || '').split(',').filter(Boolean).map((s) => { const [k, v] = s.split('='); return [k, v === 'true' ? true : v === 'false' ? false : +v]; }));
const R = D / 2, n = D + 3, c = (n - 1) / 2, ut = 0.003, nu = ut * R / ReTau;
const kind = new Int32Array(n * n * NZ);
for (let k = 0; k < NZ; k++) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) kind[i + n * (j + n * k)] = Math.hypot(i - c, j - c) < R ? 0 : -1;
const lat = FL.buildLattice({ nx: n, ny: n, nz: NZ, kind, periodic: [false, false, true],
  wallGroup: (cell, q) => {
    const i = cell % n, j = Math.floor(cell / n) % n, dx = FL.CX[q], dy = FL.CY[q];
    // |p + t d − c| = R, t ∈ (0, 1]
    const px = i - c, py = j - c, a = dx * dx + dy * dy, b = 2 * (px * dx + py * dy), cc = px * px + py * py - R * R;
    if (a === 0) return null;
    const t = (-b + Math.sqrt(Math.max(0, b * b - 4 * a * cc))) / (2 * a);
    const hx = px + t * dx, hy = py + t * dy, h = Math.hypot(hx, hy);
    return { g: 0, q: Math.min(1, Math.max(1e-3, t)), d: t, n: [hx / h, hy / h, 0] };
  } });
const N = lat.nf, F = 2 * Math.PI * R * NZ * ut * ut / N;   // total force N·F = τ_w · wetted area (2πR·Lz)
const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, eddy: true, force: [0, 0, F], u0: [0, 0, 18 * ut], smagorinsky: FT.STABILIZER });
const T = FT.attachSA(S, { nu, nt0: 0.05 * ut * R, ...opts });
const ub = () => { let s = 0; for (let m = 0; m < N; m++) s += S.uz[m]; return s / (Math.PI * R * R * NZ); };
const colebrook = (Re) => { let f = 0.02; for (let it = 0; it < 100; it++) f = (-2 * Math.log10(2.51 / (Re * Math.sqrt(f)))) ** -2; return f; };
let prev = 0, conv = false; const t0 = Date.now();
for (let s = 1; s <= MAX; s++) {
  FL.step(S);
  if (s % 5000) continue;
  const u = ub();
  if (!Number.isFinite(u)) { console.log('blew up at', s); break; }
  const Re = u * D / nu, f = 8 * (ut / u) ** 2, fc = colebrook(Re);
  if (s % 25000 === 0) console.log(`step ${s} Re_b ${Re.toFixed(0)} f ${f.toFixed(5)} Colebrook ${fc.toFixed(5)} (${((f / fc - 1) * 100).toFixed(1)} %) y+ ${FT.wallStats(T).p50.toFixed(1)} ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (s > 40000 && Math.abs(u - prev) < 2e-6 * u) { conv = true; break; }
  prev = u;
}
if (process.argv.includes('--profile')) {
  const bins = new Map();
  for (let m = 0; m < N; m++) { const cc = lat.cells[m], i = cc % n, j = Math.floor(cc / n) % n, y = R - Math.hypot(i - c, j - c), b = Math.round(y * 2) / 2; const e = bins.get(b) || [0, 0, 0, 0]; e[0] += S.uz[m]; e[1]++; e[2] += S.nut[m]; e[3] += T.wallOf[m] >= 0 ? 1 : 0; bins.set(b, e); }
  for (const [b, [su, k, sn, w]] of [...bins].sort((a, b) => a[0] - b[0])) { const yp = b * ut / nu, up = su / k / ut; console.log(`y ${b.toFixed(1)} y+ ${yp.toFixed(0)} u+ ${up.toFixed(2)} log ${(Math.log(yp) / 0.41 + 5).toFixed(2)} Δ ${(up - Math.log(yp) / 0.41 - 5).toFixed(2)} nut/(κuτy) ${(sn / k / (0.41 * ut * Math.max(b, 0.05))).toFixed(2)} wallcells ${w}/${k}`); }
}
const u = ub(), Re = u * D / nu, f = 8 * (ut / u) ** 2, fc = colebrook(Re);
console.log(`RESULT D=${D} ReTau=${ReTau} opts=${JSON.stringify(opts)} Re_b ${Re.toFixed(0)} f ${f.toFixed(5)} vs Colebrook ${fc.toFixed(5)}: ${((f / fc - 1) * 100).toFixed(1)} % y+ ${FT.wallStats(T).p50.toFixed(1)}${conv ? '' : ' (not converged)'}`);
