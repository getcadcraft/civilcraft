/* SPDX-License-Identifier: Apache-2.0 */
/**
 * heavygas.js — heavy-gas cloud box model (0.8 Track CH, CH.16; DOM-free, deterministic). A screening estimate, not an engineering approval.
 * A cylindrical cloud of radius R and height H slumps under its own weight and mixes with air (the box-model family: van Ulden 1974, Eidsvik 1980, Britter and
 * McQuaid's workbook 1988 give the empirical constants). Isothermal mixing, flat ground, no obstacles.
 *     dR/dt = Cg sqrt(g' H)           (gravity spreading; g' = g (rho - rho_a) / rho_a)
 *     dV/dt = pi R^2 We + 2 pi R H Ue (top and edge entrainment), We = aTop u*, Ue = aEdge dR/dt, V = pi R^2 H
 *     rho  = rho_a + c (rho_g - rho_a),   c = m_g / (rho_g V)   (the released gas mass m_g is conserved)
 * The empirical constants Cg, aTop, aEdge are the person's inputs (NEEDS A SOURCE for recommended values: Britter and McQuaid 1988 / Eidsvik 1980 / the TNO
 * Yellow Book), never defaulted. With aTop = aEdge = 0 there is no mixing and R^2 = R0^2 + 2 Cg sqrt(g' V / pi) t: the closed form the test checks.
 *   instantaneous(spec) spec = { mass (kg gas), rhoGas, rhoAir = 1.2, Cg, aTop, aEdge, ustar (m/s), uWind (m/s, drift), R0, tEnd, cEnd? (volume fraction to stop at) }
 *   → { t[], R[], H[], c[], x[] (downwind drift of the centre), reach: { time, R, x } at cEnd }
 */
const G = 9.80665;
export const NEEDS_SOURCE = 'Recommended Cg, aTop, aEdge: Britter and McQuaid (1988) "Workbook on the dispersion of dense gases", HSE Contract Research Report 17; Eidsvik (1980); TNO Yellow Book chapter 4. None is defaulted.';
export function instantaneous(spec) {
  const { mass, rhoGas, rhoAir = 1.2, Cg, aTop, aEdge, ustar = 0, uWind = 0, R0, tEnd, cEnd = null } = spec;
  for (const [k, v] of Object.entries({ mass, rhoGas, Cg, R0, tEnd })) if (!(v > 0)) throw new Error('heavy gas: give ' + k);
  if (!(aTop >= 0 && aEdge >= 0)) throw new Error('heavy gas: give the entrainment constants aTop and aEdge (zero is allowed)');
  if (!(rhoGas > rhoAir)) throw new Error('the gas is not heavier than air at this temperature: use the plume models instead');
  const Vg = mass / rhoGas; let V = Vg / 1, R = R0, t = 0, x = 0; V = Math.max(V, 1e-9); let H = V / (Math.PI * R * R);
  const out = { t: [0], R: [R], H: [H], c: [Vg / V], x: [0], reach: null }, N = 40000; let dt = tEnd / N;
  const state = (R_, V_) => { const H_ = V_ / (Math.PI * R_ * R_), c = Vg / V_, rho = rhoAir + c * (rhoGas - rhoAir), gp = G * (rho - rhoAir) / rhoAir; return { H_, c, gp }; };
  for (let s = 0; s < N && t < tEnd; s++) {
    const f = (R_, V_) => { const { H_, gp } = state(R_, V_), dR = Cg * Math.sqrt(Math.max(gp, 0) * H_), dV = Math.PI * R_ * R_ * aTop * ustar + 2 * Math.PI * R_ * H_ * aEdge * dR; return [dR, dV]; };
    const [a1, b1] = f(R, V), [a2, b2] = f(R + dt / 2 * a1, V + dt / 2 * b1), [a3, b3] = f(R + dt / 2 * a2, V + dt / 2 * b2), [a4, b4] = f(R + dt * a3, V + dt * b3);
    R += dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4); V += dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4); t += dt; x += uWind * dt;
    const st = state(R, V);
    if (s % 40 === 0) { out.t.push(t); out.R.push(R); out.H.push(st.H_); out.c.push(st.c); out.x.push(x); }
    if (cEnd != null && st.c <= cEnd && !out.reach) { out.reach = { time: t, R, x }; break; }
  }
  const st = state(R, V); out.final = { R, H: st.H_, c: st.c, V, gprime: st.gp }; out.massConserved = out.final.c * V * rhoGas; out.notes = ['isothermal, flat ground, no obstacles, no heat transfer from the ground; once g\' is small the cloud is passive and the plume models take over'];
  return out;
}
