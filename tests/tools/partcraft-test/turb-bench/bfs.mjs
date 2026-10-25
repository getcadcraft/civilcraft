/* SPDX-License-Identifier: Apache-2.0 */
// Backward-facing step, Driver & Seegmiller 1985: Re_h 36,000, ER 1.125 (upstream 8h, downstream 9h), 1/7-power inflow
// δ = 1.5h at −4h, slip top. 2-D (nx = 1, periodic in x); flow along +z, y up. Reattachment x_r vs 6.26h.
// node bfs.mjs --H 6 [--C 0.17] [--len 30] [--steps 120000] [--U 0.05] [--opt k=v,...]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DEV = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/partcraft/dev/');
const LIB = process.env.FLOW_DIR || DEV;   // a scratch copy of flow.js + flow-turb.js for experiments
const FL = await import(path.join(LIB, 'flow.js'));
const FT = await import(path.join(LIB, 'flow-turb.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; };
const H = +arg('H', 6), C = +arg('C', FT.STABILIZER), LEN = +arg('len', 30), MAX = +arg('steps', 150000), U = +arg('U', 0.05);
const opts = Object.fromEntries((arg('opt', '') || '').split(',').filter(Boolean).map((s) => { const [k, v] = s.split('='); return [k, v === 'true' ? true : v === 'false' ? false : isNaN(+v) ? v : +v]; }));
const Re = 36000, nu = U * H / Re, delta = 1.5 * H;
const ny = 9 * H + 1, ks = 4 * H + 1, nz = ks + LEN * H + 1, nx = 1;
const kind = new Int32Array(nx * ny * nz);
for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) {
  const c = j * nx + k * nx * ny;
  kind[c] = j === ny - 1 ? 3 : (k < ks && j < H) ? -1 : k === 0 ? 1 : k === nz - 1 ? 2 : 0;
}
const ut = U * Math.sqrt(0.0029 / 2);   // Cf ≈ 0.0029 upstream (Re_θ ≈ 5000)
const prof = (j) => { const y = j - (H - 0.5); return y <= 0 ? 0 : U * Math.min(1, (y / delta) ** (1 / 7)); };
const lat = FL.buildLattice({ nx, ny, nz, kind, periodic: [true, false, false],
  groups: [null, { type: 'velocity', u: [0, 0, U] }, { type: 'pressure', rho: 1 }, { type: 'slip', axis: 1 }],
  profile: (g, i, j) => (g === 1 ? [0, 0, prof(j)] : null) });
const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, eddy: true, u0: [0, 0, U], smagorinsky: C });
const BL = +arg('bl', 1);
const nfv = (y) => { const yy = y / delta; return yy >= 1 ? 3 * nu : Math.max(3 * nu, BL * FT.SA.kappa * ut * y * (1 - yy)); };
const inflow = new Float64Array(lat.nf).fill(3 * nu);
for (let j = 0; j < ny; j++) { const fi = lat.index[j * nx + 1 * nx * ny]; if (fi >= 0) inflow[fi] = nfv(j - (H - 0.5)); }
const T = FT.attachSA(S, { nu, inflow, nt0: 3 * nu, ...opts });
// reattachment: bottom row j = 0 downstream of the step face (z = ks − ½)
const xr = () => {
  const zs = ks - 0.5; let last = null;
  const row = []; for (let k = ks; k < nz - 1; k++) row.push([k, S.uz[lat.index[0 * nx + k * nx * ny]]]);
  // the main bubble: the last − → + crossing before the flow stays positive
  for (let i = 1; i < row.length; i++) if (row[i - 1][1] < 0 && row[i][1] >= 0) { const [k0, a] = row[i - 1], [, b] = row[i]; last = k0 + a / (a - b); }
  return last === null ? NaN : (last - zs) / H;
};
const t0 = Date.now(); let prev = NaN, stable = 0;
for (let s = 1; s <= MAX; s++) {
  FL.step(S);
  if (s % 5000) continue;
  const x = xr(); const ws = FT.wallStats(T);
  let m = 0; for (let n = 0; n < lat.nf; n++) if (!(Number.isFinite(S.ux[n] + S.uz[n]))) m++;
  console.log(`step ${s}  x_r ${x.toFixed(3)}h (${((x / 6.26 - 1) * 100).toFixed(1)} %)  y+ p50 ${ws.p50.toFixed(1)}  nonfinite ${m}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (m) break;
  if (Math.abs(x - prev) < 0.005) { if (++stable >= 3) break; } else stable = 0;
  prev = x;
}
if (process.argv.includes('--dump')) for (const zh of [0.5, 1, 2, 4]) {
  const k = Math.round(ks - 0.5 + zh * H); const rows = [];
  for (let j = 0; j < 2 * H; j++) { const n = lat.index[j * nx + k * nx * ny]; rows.push(`${(j / H).toFixed(2)}:${(S.uz[n] / U).toFixed(2)}/${(S.nut[n] / nu).toFixed(0)}/${(S.nueff[n] / nu).toFixed(0)}`); }
  console.log(`z=${zh}h  y/h:u/U/nut÷ν/nueff÷ν  ` + rows.join(' '));
}
console.log(`RESULT H=${H} C=${C} opts=${JSON.stringify(opts)} x_r=${xr().toFixed(3)}h err ${((xr() / 6.26 - 1) * 100).toFixed(1)} %`);
