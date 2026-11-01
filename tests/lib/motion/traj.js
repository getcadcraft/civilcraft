/* SPDX-License-Identifier: Apache-2.0 */
/**
 * traj.js — joint trajectories and drives (0.8 XE.4): cubic and quintic polynomials, the trapezoidal velocity profile, synchronised joint moves that
 * respect each joint's velocity limit, a straight-line Cartesian move through IK, and a torque check of a trajectory (inverse dynamics against effort limits).
 */
import * as M from './math.js';
import { ik } from './ik.js';
import { rnea } from './dynamics.js';

/** 1-D rest-to-rest move of `delta` with peak speed vmax and acceleration amax: triangular when the distance is too short to reach vmax. */
export function trapezoid(delta, vmax, amax) {
  const s = Math.sign(delta) || 1, d = Math.abs(delta);
  if (!(vmax > 0) || !(amax > 0)) return { T: NaN, at: () => ({ x: NaN, v: NaN, a: NaN }) };
  const ta = vmax / amax, da = vmax * vmax / amax;
  let tA, tC, vp;
  if (d >= da) { tA = ta; vp = vmax; tC = (d - da) / vmax; } else { tA = Math.sqrt(d / amax); vp = amax * tA; tC = 0; }
  const T = 2 * tA + tC;
  return { T, peak: vp * s, at(t) {
    t = Math.min(Math.max(t, 0), T);
    let x, v, a;
    if (t < tA) { a = amax; v = amax * t; x = 0.5 * amax * t * t; }
    else if (t < tA + tC) { a = 0; v = vp; x = 0.5 * amax * tA * tA + vp * (t - tA); }
    else { const u = T - t; a = -amax; v = amax * u; x = d - 0.5 * amax * u * u; }
    return { x: s * x, v: s * v, a: s * a };
  } };
}
/** Cubic with zero end velocities over T: q(t) = q0 + Δ(3τ² − 2τ³). Quintic with zero end velocity and acceleration: Δ(10τ³ − 15τ⁴ + 6τ⁵). */
export function cubic(q0, q1, T) { return { T, at(t) { const u = Math.min(Math.max(t / T, 0), 1), d = q1 - q0; return { x: q0 + d * (3 * u * u - 2 * u ** 3), v: d * (6 * u - 6 * u * u) / T, a: d * (6 - 12 * u) / T / T }; } }; }
export function quintic(q0, q1, T) { return { T, at(t) { const u = Math.min(Math.max(t / T, 0), 1), d = q1 - q0; return { x: q0 + d * (10 * u ** 3 - 15 * u ** 4 + 6 * u ** 5), v: d * (30 * u * u - 60 * u ** 3 + 30 * u ** 4) / T, a: d * (60 * u - 180 * u * u + 120 * u ** 3) / T / T }; } }; }

/**
 * jointMove(robot, qa, qb, {vmax, amax}) → {T, at(t) → {q, qd, qdd}, problems}. All joints start and stop together: the slowest joint sets T.
 * vmax / amax may be numbers or arrays; the default velocity comes from each joint's limit.velocity, else 1.
 */
export function jointMove(robot, qa, qb, { vmax, amax = 2 } = {}) {
  const n = robot.dof, vm = (i) => Array.isArray(vmax) ? vmax[i] : (vmax ?? robot.dofJoints[i].limit?.velocity ?? 1), am = (i) => Array.isArray(amax) ? amax[i] : amax;
  const prof = qa.map((a, i) => trapezoid(qb[i] - a, vm(i), am(i))), T = Math.max(0, ...prof.map((p) => p.T));
  const problems = [], lim = robot.limits();
  qb.forEach((v, i) => { if (v < lim[i].lower || v > lim[i].upper) problems.push(M.problem('limit', 'warning', `Target for joint "${robot.names[i]}" (${v}) is outside its limit.`, [{ id: robot.names[i] }])); });
  // every joint follows the slowest joint's profile scaled to its own distance, so all start and stop together
  const si = prof.reduce((b, p, i) => (p.T > prof[b].T ? i : b), 0), dS = qb[si] - qa[si];
  return { T, problems, at(t) {
    const s = T > 0 && dS !== 0 ? prof[si].at(t) : { x: 0, v: 0, a: 0 }, g = dS !== 0 ? 1 / dS : 0;
    return { q: qa.map((a, i) => a + (qb[i] - a) * s.x * g), qd: qa.map((a, i) => (qb[i] - a) * s.v * g), qdd: qa.map((a, i) => (qb[i] - a) * s.a * g) };
  } };
}

/** Straight line in space for `link` from the current pose to point `pB`, n samples through IK (each seeded from the last). → {q[][], ok, problems} */
export function linePath(robot, link, q0, pB, { n = 20, R, local, base } = {}) {
  const T0 = robot.pose(q0, link, base), pA = M.T_apply(T0, local || [0, 0, 0]), q = [q0.slice()], problems = [];
  let cur = q0.slice(), ok = true;
  for (let k = 1; k <= n; k++) {
    const p = M.add(pA, M.scale(M.sub(pB, pA), k / n)), r = ik(robot, link, R ? { p, R } : { p }, cur, { local, base });
    if (!r.ok) { ok = false; problems.push(...r.problems.map((x) => ({ ...x, id: x.id + '@' + k, text: x.text + ` (step ${k} of ${n} along the line)` }))); break; }
    cur = r.q; q.push(cur);
  }
  return { q, ok, problems };
}

/** Peak joint torques of a move against each joint's effort limit. → {peak[], problems} */
export function checkTorques(robot, move, { samples = 50, gravity } = {}) {
  const peak = new Array(robot.dof).fill(0), problems = [];
  for (let k = 0; k <= samples; k++) { const s = move.at(move.T * k / samples), tau = rnea(robot, s.q, s.qd, s.qdd, { gravity }); tau.forEach((v, i) => { peak[i] = Math.max(peak[i], Math.abs(v)); }); }
  robot.dofJoints.forEach((j, i) => { const e = j.limit?.effort; if (e && peak[i] > e) problems.push(M.problem('effort', 'warning', `Joint "${j.name}" needs a peak of ${peak[i].toFixed(2)} (N or N·m) on this move; its limit is ${e}.`, [{ id: j.name }], { found: peak[i], req: e })); });
  return { peak, problems };
}
