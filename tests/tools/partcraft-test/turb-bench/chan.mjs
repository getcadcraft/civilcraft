/* SPDX-License-Identifier: Apache-2.0 */
// Plane channels as tools/partcraft-test/test-flow-turb.mjs runs them (Re_τ 1000 and 2000 at 20 cells, 180 at 60), with
// attachSA options: node chan.mjs 'feedback=false,ref=true'
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const LIB = process.env.FLOW_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/partcraft/dev/');
const FL = await import(path.join(LIB, 'flow.js')); const FT = await import(path.join(LIB, 'flow-turb.js'));
const opts = Object.fromEntries((process.argv[2] || '').split(',').filter(Boolean).map((s) => { const [k, v] = s.split('='); return [k, v === 'true' ? true : v === 'false' ? false : +v]; }));
const channel = (N, ReTau, ut = 0.005) => {
  const h = N / 2, nu = ut * h / ReTau;
  const lat = FL.buildLattice({ nx: 1, ny: N, nz: 1, kind: new Int32Array(N), periodic: [true, false, true] });
  const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, eddy: true, force: [ut * ut / h, 0, 0], u0: [20 * ut, 0, 0], smagorinsky: FT.STABILIZER });
  const T = FT.attachSA(S, { nu, nt0: 0.05 * ut * h, ...opts });
  let prev = 0, ub = 0;
  for (let s = 1; s <= 1500000; s++) { FL.step(S); if (s % 2000) continue; ub = 0; for (let n = 0; n < N; n++) ub += S.ux[n]; ub /= N; if (s > 20000 && Math.abs(ub - prev) < 1e-7 * ub) break; prev = ub; }
  const Reb = ub * 2 * h / nu, Cf = 2 * ut * ut / (ub * ub), dean = 0.073 * Reb ** -0.25;
  return `N ${N} Re_τ ${ReTau}: Cf ${((Cf / dean - 1) * 100).toFixed(1)} % vs Dean, U_b+ ${(ub / ut).toFixed(3)} (MKM 15.72 at 180)`;
};
console.log(JSON.stringify(opts), '|', channel(20, 1000), '|', channel(20, 2000), '|', channel(60, 180));
