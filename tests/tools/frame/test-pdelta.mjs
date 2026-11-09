#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-pdelta.mjs — second-order elastic analysis (0.9 SU.1056, session engineer-09): solveFrame(model, { secondOrder }) — the
 * geometric stiffness K_G(N) of every piece, members cut into pieces for P-delta, iterated on the axial forces.
 *
 * Closed forms (derived in docs/0.9-sessions/engineer-09.md § SU.1056 from the beam-column equation EI v'' = M(x) with the axial force
 * acting on the deflected shape; k² = P / EI), each one ALSO checked here against an independent numerical integration of that same
 * differential equation (RK4 shooting), so no reference number is typed in:
 *   cantilever, base fixed, tip loads P (compression) and H:   tip deflection δ = (H / P)(tan kL / k − L),  base moment M = H tan(kL) / k
 *   simply supported, uniform w across, end compression P:     mid deflection δ = w / (P k²) (sec(kL/2) − 1) − w L² / (8 P),
 *                                                              mid moment M = w / k² (sec(kL/2) − 1)
 * These are the two shapes of the AISC 360 Commentary C2 benchmark problems (Case 2 and Case 1); the Commentary's own tables were not
 * available here (aisc.org refuses an automated download), so they are not quoted.
 *   node tools/frame/test-pdelta.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js');
let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const info = (s) => console.log('  ' + s);
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);

const E = 200000, G = 77000, Iy = 8e7, Iz = 1.6e8, A = 6000, J = 5e5;   // the other axis stiffer, so the checked axis is the one that buckles
function model({ nodes, members, supports, loads, combos = [] }) {
  const raw = { format: FM.FORMAT, version: FM.VERSION, name: 'pdelta', nodes: nodes.map(([id, x, y, z]) => ({ id, x, y, z })),
    materials: [{ id: 'st', name: 'steel', E, G, rho: 0 }], sections: [{ id: 'S', name: 'S', A, Iy, Iz, J }],
    members: members.map(([id, i, j, relx]) => ({ id, i, j, section: 'S', material: 'st', roll: 0, rel: relx })),
    supports: supports.map(([node, fix]) => ({ node, fix: fix.map(Boolean) })), cases: [{ id: 'A', name: 'A', kind: 'other', selfWeight: 0, loads }], combos };
  const { model: m, warnings } = FM.cleanFrame(raw);
  if (warnings.length) throw new Error(JSON.stringify(warnings));
  return m;
}
/** RK4 on y = [v, v'] for v'' = f(x, v); returns v and v' at x = L. */
function rk4(f, L, y0, n = 4000) {
  let x = 0, y = y0.slice(); const h = L / n;
  const d = (x, y) => [y[1], f(x, y[0])];
  for (let i = 0; i < n; i++) {
    const k1 = d(x, y), k2 = d(x + h / 2, [y[0] + h / 2 * k1[0], y[1] + h / 2 * k1[1]]), k3 = d(x + h / 2, [y[0] + h / 2 * k2[0], y[1] + h / 2 * k2[1]]), k4 = d(x + h, [y[0] + h * k3[0], y[1] + h * k3[1]]);
    y = [y[0] + h / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), y[1] + h / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])]; x += h;
  }
  return y;
}

console.log('== cantilever, base fixed, tip compression P and lateral H (the Case 2 shape)');
{
  const L = 5000, EI = E * Iy, Pe = Math.PI ** 2 * EI / (4 * L * L), H = 10000;
  for (const ratio of [0.1, 0.3, 0.5, 0.7]) {
    const P = ratio * Pe, k = Math.sqrt(P / EI);
    const dCF = (H / P) * (Math.tan(k * L) / k - L), mCF = H * Math.tan(k * L) / k;
    // independent: shoot EI v'' = H (L − x) + P (δ − v) with v(0) = v'(0) = 0 for δ such that v(L) = δ (linear in δ: two shots)
    const shot = (dl) => rk4((x, v) => (H * (L - x) + P * (dl - v)) / EI, L, [0, 0])[0] - dl;
    const s0 = shot(0), s1 = shot(1), dNum = -s0 / (s1 - s0);
    ok(rel(dCF, dNum) < 1e-6, `P/Pe ${ratio}: the closed-form tip deflection agrees with the numerical integration`, `${dCF.toFixed(4)} vs ${dNum.toFixed(4)} mm`);
    const m = model({ nodes: [['B', 0, 0, 0], ['T', 0, 0, L]], members: [['c', 'B', 'T']], supports: [['B', [1, 1, 1, 1, 1, 1]]],
      loads: [{ type: 'node', node: 'T', F: [H, 0, -P, 0, 0, 0] }] });
    for (const seg of [4, 8]) {
      const sol = FS.solveFrame(m, { secondOrder: { segments: seg } });
      if (!sol.ok) { ok(false, 'solved', JSON.stringify(sol.error)); continue; }
      const R = sol.results['case:A'], d = R.u[6 * 1 + 0], Mb = Math.abs(R.reactions[4]);
      const dg = FS.diagram(sol.prep, R, 0, 20);
      const tolD = seg === 4 ? 0.005 : 0.002;
      ok(rel(d, dCF) < tolD, `P/Pe ${ratio}, ${seg} pieces: tip deflection within ${tolD * 100} % of the closed form`, `${d.toFixed(4)} vs ${dCF.toFixed(4)} mm`);
      ok(rel(Mb, mCF) < tolD, `P/Pe ${ratio}, ${seg} pieces: base moment (reaction) within ${tolD * 100} %`, `${(Mb / 1e6).toFixed(4)} vs ${(mCF / 1e6).toFixed(4)} kNm`);
      ok(rel(Math.abs(dg.My[0]), mCF) < tolD && Math.abs(dg.My[20]) < 1e-6 * mCF, `P/Pe ${ratio}, ${seg} pieces: the moment along the member includes P·δ (base ${(dg.My[0] / 1e6).toFixed(4)} kNm, tip 0)`);
      ok(rel(Mb, H * L + P * d) < 1e-6, `P/Pe ${ratio}, ${seg} pieces: base moment = H·L + P·δ (statics on the deflected shape)`);
      ok(R.second.converged && R.second.iterations < 30, `P/Pe ${ratio}, ${seg} pieces: converged in ${R.second.iterations} passes`);
      if (seg === 8) info(`P/Pe ${ratio}: δ ${d.toFixed(3)} mm (closed form ${dCF.toFixed(3)}, first order ${(H * L ** 3 / (3 * EI)).toFixed(3)}), base M ${(Mb / 1e6).toFixed(3)} kNm (closed form ${(mCF / 1e6).toFixed(3)}, first order ${(H * L / 1e6).toFixed(3)}), amplification ${R.second.amplification.toFixed(4)}, ${R.second.iterations} passes`);
    }
  }
  // above the elastic critical load the run stops in words
  const m = model({ nodes: [['B', 0, 0, 0], ['T', 0, 0, L]], members: [['c', 'B', 'T']], supports: [['B', [1, 1, 1, 1, 1, 1]]], loads: [{ type: 'node', node: 'T', F: [H, 0, -1.2 * Pe, 0, 0, 0] }] });
  const sol = FS.solveFrame(m, { secondOrder: true });
  ok(!sol.ok && sol.error.code === 'second-order-unstable', 'above the critical load (1.2 Pe) the second-order run is refused as unstable', JSON.stringify(sol.error));
  const lin = FS.solveFrame(m);
  ok(lin.ok, 'the same model to first order still solves (the first-order answer knows nothing of buckling)');
}

console.log('== simply supported, uniform load across, end compression (the Case 1 shape)');
{
  const L = 6000, EI = E * Iy, Pe = Math.PI ** 2 * EI / (L * L), w = 20;    // N/mm
  for (const ratio of [0.2, 0.4, 0.6]) {
    const P = ratio * Pe, k = Math.sqrt(P / EI);
    const dCF = w / (P * k * k) * (1 / Math.cos(k * L / 2) - 1) - w * L * L / (8 * P), mCF = w / (k * k) * (1 / Math.cos(k * L / 2) - 1);
    // independent: EI v'' = −(w x (L − x) / 2 + P v), v(0) = 0, v(L) = 0 (shoot on v'(0))
    const shot = (s) => rk4((x, v) => -(w * x * (L - x) / 2 + P * v) / EI, L, [0, s])[0];
    const a0 = shot(0), a1 = shot(1e-3), s = -a0 / ((a1 - a0) / 1e-3);
    const mid = rk4((x, v) => -(w * x * (L - x) / 2 + P * v) / EI, L / 2, [0, s])[0];
    ok(rel(Math.abs(mid), dCF) < 1e-6, `P/Pe ${ratio}: the closed-form mid deflection agrees with the numerical integration`, `${dCF.toFixed(4)} vs ${Math.abs(mid).toFixed(4)} mm`);
    const m = model({ nodes: [['A', 0, 0, 0], ['B', L, 0, 0]], members: [['b', 'A', 'B']], supports: [['A', [1, 1, 1, 1, 0, 0]], ['B', [0, 1, 1, 1, 0, 0]]],
      loads: [{ type: 'udl', member: 'b', dir: 'Z', w: -w }, { type: 'node', node: 'B', F: [-P, 0, 0, 0, 0, 0] }] });
    const sol = FS.solveFrame(m, { secondOrder: { segments: 8 } });
    if (!sol.ok) { ok(false, 'solved', JSON.stringify(sol.error)); continue; }
    const R = sol.results['case:A'], dg = FS.diagram(sol.prep, R, 0, 20);
    const dMid = Math.abs(dg.dz[10]), mMid = dg.My[10];
    ok(rel(dMid, dCF) < 0.005, `P/Pe ${ratio}: mid deflection within 0.5 % of the closed form`, `${dMid.toFixed(4)} vs ${dCF.toFixed(4)} mm`);
    ok(rel(mMid, mCF) < 0.005, `P/Pe ${ratio}: mid moment (P-delta along the member) within 0.5 %`, `${(mMid / 1e6).toFixed(4)} vs ${(mCF / 1e6).toFixed(4)} kNm`);
    ok(Math.abs(dg.My[0]) < 1e-6 * mCF && Math.abs(dg.My[20]) < 1e-3 * mCF, `P/Pe ${ratio}: no moment at the pinned ends`, `${dg.My[0]} / ${dg.My[20]}`);
    const first = FS.solveFrame(m), dg1 = FS.diagram(first.prep, first.results['case:A'], 0, 20);
    ok(rel(dg1.My[10], w * L * L / 8) < 1e-9, `P/Pe ${ratio}: without secondOrder the run is first order as before (mid moment wL²/8)`);
    info(`P/Pe ${ratio}: mid δ ${dMid.toFixed(3)} mm (closed form ${dCF.toFixed(3)}), mid M ${(mMid / 1e6).toFixed(3)} kNm (closed form ${(mCF / 1e6).toFixed(3)}, first order ${(w * L * L / 8 / 1e6).toFixed(3)}), ${R.second.iterations} passes`);
  }
}

console.log('== a portal frame: combinations are solved whole, members keep their ids, the result has the first-order shape');
{
  const h = 4000, b = 6000;
  const raw = (loads) => model({ nodes: [['A', 0, 0, 0], ['B', 0, 0, h], ['C', b, 0, h], ['D', b, 0, 0]], members: [['c1', 'A', 'B'], ['bm', 'B', 'C'], ['c2', 'D', 'C']],
    supports: [['A', [1, 1, 1, 1, 1, 1]], ['D', [1, 1, 1, 1, 1, 1]]], loads });
  const m = raw([{ type: 'node', node: 'B', F: [5000, 0, -400000, 0, 0, 0] }, { type: 'node', node: 'C', F: [0, 0, -400000, 0, 0, 0] }, { type: 'udl', member: 'bm', dir: 'Z', w: -10 }]);
  const so = FS.solveFrame(m, { secondOrder: true }), fo = FS.solveFrame(m);
  ok(so.ok && fo.ok, 'both solve');
  const R2 = so.results['case:A'], R1 = fo.results['case:A'];
  ok(R2.ends.length === R1.ends.length && R2.u.length === R1.u.length && R2.reactions.length === R1.reactions.length, 'same result shape as the first-order run (per member, per original node)');
  ok(R2.u[6] > R1.u[6] && R2.second.amplification > 1, `sway grows: ${R1.u[6].toFixed(3)} → ${R2.u[6].toFixed(3)} mm, amplification ${R2.second.amplification.toFixed(4)}`);
  let eq = 0; for (let k = 0; k < 3; k++) eq = Math.max(eq, Math.abs(R2.applied[k] + R2.reacted[k]));
  ok(eq < 1e-6 * 800000, 'forces balance (applied + reactions = 0)', String(eq));
  const colMax = (s, R) => Math.max(FS.memberExtremes(s.prep, R, 0).My.abs, FS.memberExtremes(s.prep, R, 2).My.abs);
  ok(Number.isFinite(colMax(so, R2)) && colMax(so, R2) > colMax(fo, R1), `memberExtremes works on the second-order result and the larger column moment grows (${(colMax(fo, R1) / 1e6).toFixed(3)} → ${(colMax(so, R2) / 1e6).toFixed(3)} kNm)`);
  ok(Object.keys(so.results).join() === Object.keys(fo.results).join() && so.secondOrder && so.secondOrder.segments === 4, 'same sets, the run says it is second order (4 pieces)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
