/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ik.js — inverse kinematics (0.8 XE.4): damped least squares (Wampler 1986; Nakamura & Hanafusa 1986) with Levenberg–Marquardt style damping
 * adaptation and joint-limit clamping, plus the closed-form planar two-link solution used as an oracle.
 */
import * as M from './math.js';

/** Pose error of `link` (point `local`) against target {p?, R?}: [Δp (3), rotation vector of R_t·Rᵀ (3)] in world axes. */
export function poseError(robot, q, link, target, local = [0, 0, 0], base) {
  const T = robot.pose(q, link, base), pw = M.T_apply(T, local), e = [];
  if (target.p) e.push(...M.sub(target.p, pw));
  if (target.R) e.push(...M.rotvec(M.mmul(target.R, M.mT(T.R))));
  return e;
}
const clampQ = (q, lim) => q.map((v, i) => Math.min(lim[i].upper, Math.max(lim[i].lower, v)));

/**
 * ik(robot, link, target, q0, opts) → {ok, q, iterations, error: {pos, rot}, problems}
 * target {p?: [x,y,z], R?: 3×3}: position only, orientation only, or both. opts: local, base, maxIter (300), tol (1e-6 m), rotTol (1e-6 rad),
 * lambda (0.1), weightRot (1), stepMax (0.3 rad or m per iteration), limits (true).
 */
export function ik(robot, link, target, q0 = null, opts = {}) {
  const { local = [0, 0, 0], base, maxIter = 300, tol = 1e-6, rotTol = 1e-6, weightRot = 1, stepMax = 0.3, limits = true } = opts;
  let lambda = opts.lambda ?? 0.1;
  const n = robot.dof, lim = robot.limits(), problems = [];
  if (!robot.ok) return { ok: false, q: q0 || new Array(n).fill(0), iterations: 0, error: { pos: NaN, rot: NaN }, problems: robot.problems.slice() };
  if (!target.p && !target.R) return { ok: false, q: q0 || new Array(n).fill(0), iterations: 0, error: { pos: NaN, rot: NaN }, problems: [M.problem('target', 'error', 'The target has neither a position nor an orientation.')] };
  let q = limits ? clampQ(q0 || new Array(n).fill(0), lim) : (q0 || new Array(n).fill(0)).slice();
  const rows = (target.p ? 3 : 0) + (target.R ? 3 : 0);
  const errNorm = (e) => { let i = 0, pe = 0, re = 0; if (target.p) { pe = Math.hypot(e[0], e[1], e[2]); i = 3; } if (target.R) re = Math.hypot(e[i], e[i + 1], e[i + 2]); return { pos: pe, rot: re }; };
  const weigh = (e) => { if (!target.R) return e; const o = e.slice(); const s = target.p ? 3 : 0; for (let k = 0; k < 3; k++) o[s + k] *= weightRot; return o; };
  let e = poseError(robot, q, link, target, local, base), er = errNorm(e), cost = er.pos ** 2 + (weightRot * er.rot) ** 2, it = 0;
  for (; it < maxIter; it++) {
    if (er.pos <= tol && er.rot <= rotTol) break;
    const Jf = robot.jacobian(q, link, local, base); // 6×n
    let J = []; if (target.p) J.push(Jf[0], Jf[1], Jf[2]); if (target.R) for (const r of [3, 4, 5]) J.push(Jf[r].map((v) => v * weightRot));
    let improved = false;
    for (let tries = 0; tries < 12 && !improved; tries++) {
      const A = M.zeros(rows, rows); for (let i = 0; i < rows; i++) for (let j = 0; j < rows; j++) { let s = 0; for (let k = 0; k < n; k++) s += J[i][k] * J[j][k]; A[i][j] = s + (i === j ? lambda * lambda : 0); }
      const y = M.solve(A, weigh(e)); if (!y) { lambda *= 4; continue; }
      let dq = new Array(n).fill(0); for (let k = 0; k < n; k++) for (let i = 0; i < rows; i++) dq[k] += J[i][k] * y[i];
      const big = Math.max(...dq.map(Math.abs)); if (big > stepMax) dq = dq.map((v) => v * stepMax / big);
      let qn = q.map((v, i) => v + dq[i]); if (limits) qn = clampQ(qn, lim);
      const en = poseError(robot, qn, link, target, local, base), ern = errNorm(en), cn = ern.pos ** 2 + (weightRot * ern.rot) ** 2;
      if (cn < cost) { q = qn; e = en; er = ern; cost = cn; lambda = Math.max(1e-4, lambda * 0.5); improved = true; } else lambda *= 3;
    }
    if (!improved) break; // stuck: a joint limit, a singularity or an unreachable target
  }
  const ok = er.pos <= tol * 10 && er.rot <= rotTol * 10;
  if (!ok) {
    const atLimit = limits ? robot.names.filter((_, i) => Math.abs(q[i] - lim[i].lower) < 1e-9 || Math.abs(q[i] - lim[i].upper) < 1e-9) : [];
    problems.push(M.problem('ik.unreached', 'warning', `Inverse kinematics did not reach the target: ${er.pos.toExponential(2)} m and ${er.rot.toExponential(2)} rad short after ${it} iterations` + (atLimit.length ? `; joint ${atLimit.join(', ')} is at its limit.` : '. The target may be out of reach or at a singularity.'), [{ id: link }], { found: er, req: { pos: tol, rot: rotTol } }));
  }
  return { ok, q, iterations: it, error: er, problems };
}

/** Closed-form IK of a planar two-link arm (links l1, l2) for a tip at (x, y): both elbow solutions [{q1, q2}] ([] when out of reach). */
export function ikPlanar2(l1, l2, x, y) {
  const r2 = x * x + y * y, c2 = (r2 - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  if (c2 > 1 + 1e-12 || c2 < -1 - 1e-12) return [];
  const out = [];
  for (const s of [1, -1]) {
    const q2 = s * Math.acos(Math.max(-1, Math.min(1, c2))), q1 = Math.atan2(y, x) - Math.atan2(l2 * Math.sin(q2), l1 + l2 * Math.cos(q2));
    out.push({ q1, q2 });
  }
  return out;
}
