/* SPDX-License-Identifier: Apache-2.0 */
/**
 * design.js — activated-sludge and clarifier sizing by the classic design equations (0.8 Track CH, CH.20; DOM-free). The kinetic constants (Y, kd) and the
 * design targets are the PERSON'S inputs (no default: they depend on the wastewater); the equations are those of the textbooks (Metcalf and Eddy, Wastewater
 * Engineering; Grady, Daigger and Lim). A drafting and study aid, not an engineering approval.
 *   completeMix({ Q (m3/d), S0, S (mg/L soluble BOD or COD in and out), Y (g VSS/g), kd (1/d), thetaC (d), X (mg VSS/L in the tank) })
 *       Px = Y Q (S0 - S)/(1 + kd thetaC) (kg VSS/d);  V = thetaC Px / X (m3);  tau = V/Q;  F/M = Q S0 / (V X);  oxygen = Q (S0 - S) - 1.42 Px (kg/d).
 *   returnRatio({ X, Xr, Xe = 0 })        solids balance on the reactor and clarifier: Qr/Q = (X - Xe...) / (Xr - X)  (Xe the effluent solids, small)
 *   clarifier({ Q, Qr, X, A })            surface overflow rate Q/A (m/d) and solids loading (Q+Qr) X / A (kg/m2/h)
 */
export function completeMix({ Q, S0, S, Y, kd, thetaC, X }) {
  for (const [k, v] of Object.entries({ Q, S0, Y, thetaC, X })) if (!(v > 0)) throw new Error('activated sludge: give ' + k + ' (it has no default)');
  if (!(S >= 0 && S < S0)) throw new Error('the effluent S must be 0 or more and below the influent S0');
  if (!(kd >= 0)) throw new Error('give kd (1/d)');
  const dS = Q * (S0 - S) / 1000, Px = Y * dS / (1 + kd * thetaC), V = thetaC * Px * 1000 / X;       // kg/d, m3 (X in g/m3)
  return { Px, V, tau: V / Q, tauHours: 24 * V / Q, FM: Q * S0 / (V * X), oxygen: dS - 1.42 * Px, thetaC, source: 'Metcalf and Eddy, complete-mix activated sludge design equations' };
}
export function returnRatio({ X, Xr, Xe = 0 }) {
  if (!(Xr > X && X > 0)) throw new Error('the return sludge must be thicker than the tank: Xr > X > 0');
  return { ratio: (X - Xe) / (Xr - X), note: 'neglects the solids lost in the effluent beyond Xe' };
}
export function clarifier({ Q, Qr, X, A }) {
  if (!(A > 0)) throw new Error('give the clarifier area A (m2)');
  return { overflowRate: Q / A, solidsLoading: (Q + Qr) * X / 1000 / A / 24, units: { overflowRate: 'm/d', solidsLoading: 'kg/m2/h' } };
}
