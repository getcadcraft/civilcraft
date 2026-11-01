/* SPDX-License-Identifier: Apache-2.0 */
/**
 * transient.js — pump trip with a check valve, and fitting losses from the 2-K and 3-K forms (0.8 Track CH, CH.10; DOM-free, deterministic).
 * A calculation aid, "to be checked by an engineer" (O7): NOT an engineering approval.
 *
 *   pumpTrip(spec)   the loss of power to a pump pushing through one pipe to a reservoir, by the method of characteristics (Streeter and Wylie;
 *                    Chaudhry). Pump at x = 0 with a check valve, the suction head fixed, the far end a reservoir. After the trip the pump runs down
 *                    under its own inertia:  I dw/dt = -T,  T = rho g Q H / (eta w)  (efficiency constant), with the head of the pump from the affinity laws
 *                    applied to the quadratic curve at rated speed:  H = a^2 h(Q/a),  a = w / w0.  The check valve closes when the flow at the pump falls to zero
 *                    (the flow cannot reverse), after which the pump end is a closed end. Not modelled: reverse flow through the pump (the four-quadrant
 *                    pump data are the maker's), check-valve slam, column separation (flagged), unsteady friction, a network.
 *   spec = { L, D, a (wave speed), Hs (suction head at the pump, m), Hd (reservoir head, m, same datum), Q0 (rated flow m3/s), H0 (rated head m), curve: [h0, h1, h2]
 *            (m, rated-speed quadratic H = h0 + h1 Q + h2 Q^2 through the rated point, or `points` [[Q, H] x3]), eta, w0 (rad/s), I (kg m2, pump + motor + fluid inside),
 *            tTrip (s, default 0), tEnd (s), N? (reaches), Hv? (vapour head, m), noTrip? (hold the speed: the steady-state check), rho? }
 *   → { t[], Hpump[], Qpump[], speed[], Hmin, Hmax, tClose (s the check valve closed or null), steadyH, problems }
 *   k2K({ K1, Kinf }, Re, Dinch) and k3K({ K1, Ki, Kd }, Re, Dinch): the 2-K (Hooper 1981) and 3-K (Darby 1999) loss coefficient forms. The CONSTANTS per
 *   fitting are not built in (NEEDS A SOURCE: Hooper 1981 and Darby 1999 tables, or Crane TP-410): the person supplies them from a pack.
 */
import { fitPumpCurve, G } from './network.js';
import { problem } from '../report.js';

export const NEEDS_SOURCE_K = 'Per-fitting constants of the 2-K form (Hooper 1981, Chem. Eng. 88(17), Table) or the 3-K form (Darby 1999, Chem. Eng. 106(7)); Crane Technical Paper 410 for the older form. None is built in: type them from the paper into a pack, or choose the bundled DRAFT pack (pack: "draft").';
export const k2K = ({ K1, Kinf }, Re, Dinch) => K1 / Re + Kinf * (1 + 1 / Dinch);
export const k3K = ({ K1, Ki, Kd }, Re, Dinch) => K1 / Re + Ki * (1 + Kd / Math.pow(Dinch, 0.3));

export function pumpTrip(spec) {
  const { L, D, a, Hs, Hd, Q0, H0, eta, w0, I, tEnd, N = 40, Hv = null, rho = 998, tTrip = 0 } = spec;
  const h = spec.curve ? spec.curve.slice() : fitPumpCurve(spec.points);
  const A = Math.PI * D * D / 4, B = a / (G * A), dx = L / N, dt = dx / a;
  const hpump = (Q, al) => al * al * (h[0] + h[1] * Q / al + h[2] * Q * Q / (al * al));
  // calibrate friction so the steady state is exact: Hs + H(Q0) = Hd + loss
  const Hp0 = hpump(Q0, 1), loss = Hs + Hp0 - Hd;
  if (!(loss > 0)) throw new Error('the pump head at the rated flow does not exceed the static lift: no steady flow');
  const Rr = loss / (N * Q0 * Q0);                                      // per reach, head per Q|Q|
  let Q = new Array(N + 1).fill(Q0), Hh = Array.from({ length: N + 1 }, (_, i) => Hs + Hp0 - Rr * Q0 * Q0 * i);
  let w = w0, closed = false, tClose = null; const T = [], Hpump = [], Qpump = [], Spd = [], problems = [];
  let Hmin = Infinity, Hmax = -Infinity; const steps = Math.ceil(tEnd / dt);
  for (let s = 0; s <= steps; s++) {
    const t = s * dt;
    if (s > 0) {
      const Qn = new Array(N + 1), Hn = new Array(N + 1);
      for (let i = 1; i < N; i++) {
        const CP = Hh[i - 1] + B * Q[i - 1] - Rr * Q[i - 1] * Math.abs(Q[i - 1]), CM = Hh[i + 1] - B * Q[i + 1] + Rr * Q[i + 1] * Math.abs(Q[i + 1]);
        Hn[i] = 0.5 * (CP + CM); Qn[i] = (CP - CM) / (2 * B);
      }
      { const CP = Hh[N - 1] + B * Q[N - 1] - Rr * Q[N - 1] * Math.abs(Q[N - 1]); Hn[N] = Hd; Qn[N] = (CP - Hd) / B; }
      // pump end: C- from node 1
      const CM = Hh[1] - B * Q[1] + Rr * Q[1] * Math.abs(Q[1]);
      const tripped = !spec.noTrip && t >= tTrip;
      if (closed) { Qn[0] = 0; Hn[0] = CM; }
      else {
        let al = w / w0, Qp = Q[0], wNew = w;
        for (let it = 0; it < 30; it++) {
          // solve  Hs + al^2 h0 + al h1 Q + h2 Q^2 = CM + B Q
          const qa = h[2], qb = al * h[1] - B, qc = Hs + al * al * h[0] - CM;
          const disc = qb * qb - 4 * qa * qc;
          let q; if (Math.abs(qa) < 1e-14) q = -qc / qb; else if (disc < 0) q = -qb / (2 * qa); else { const r1 = (-qb + Math.sqrt(disc)) / (2 * qa), r2 = (-qb - Math.sqrt(disc)) / (2 * qa); q = Math.abs(r1 - Qp) < Math.abs(r2 - Qp) ? r1 : r2; }
          Qp = q;
          if (tripped) { const Hp = hpump(Math.max(Qp, 0), Math.max(al, 1e-6)), torque = rho * G * Math.max(Qp, 0) * Hp / (eta * Math.max(w, 1e-3)); wNew = Math.max(w - dt / I * torque, 0); al = 0.5 * (w + wNew) / w0; }
        }
        if (tripped) w = wNew;
        if (tripped && Qp <= 0) { closed = true; tClose = t; Qn[0] = 0; Hn[0] = CM; } else { Qn[0] = Qp; Hn[0] = CM + B * Qp; }
      }
      Q = Qn; Hh = Hn;
    }
    T.push(t); Hpump.push(Hh[0]); Qpump.push(Q[0]); Spd.push(w / w0);
    for (const hv of Hh) { if (hv < Hmin) Hmin = hv; if (hv > Hmax) Hmax = hv; }
  }
  if (Hv != null && Hmin < Hv) problems.push(problem('pumptrip.cavitation', 'error', `After the trip the head falls to ${Hmin.toFixed(1)} m, below the vapour head ${Hv.toFixed(1)} m: the liquid can separate and this model (no column separation) is not valid.`, [{ id: 'pump' }]));
  return { t: T, Hpump, Qpump, speed: Spd, Hmin, Hmax, tClose, steadyH: Hs + Hp0, friction: Rr, period: 4 * L / a, dtStep: dt, problems, notes: ['no reverse flow through the pump is modelled: the check valve is assumed to close at zero flow'] };
}
