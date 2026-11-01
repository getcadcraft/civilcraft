/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dynamics.js — contact-free rigid-body dynamics of a tree (0.8 XE.4).
 * Inverse dynamics: the recursive Newton–Euler algorithm (Luh, Walker & Paul 1980) written for tree structures with revolute, prismatic and fixed joints;
 * mass matrix by columns of the same recursion (Walker & Orin 1982, method 1); forward dynamics q̈ = M⁻¹(τ − h); fixed-step RK4.
 * All link quantities are in the link's own frame. Gravity defaults to −9.81 m/s² along world z. Viscous joint damping (joint.damping) is part of h.
 */
import * as M from './math.js';
import { Robot } from './robot.js';

function frames(robot, q) {
  return robot.order.map((j) => {
    const i = robot.index.get(j.name), qv = i === undefined ? 0 : q[i] + j.offset;
    if (j.type === 'prismatic') return { j, i, R: j.origin.R, p: M.add(j.origin.p, M.mvec(j.origin.R, M.scale(j.axis, qv))) };
    if (j.type === 'fixed') return { j, i, R: j.origin.R, p: j.origin.p };
    return { j, i, R: M.mmul(j.origin.R, M.axisAngle(j.axis, qv)), p: j.origin.p };
  });
}

/** tau = rnea(robot, q, qd, qdd, {gravity, base, wrenches: {link: {f, n}}, damping}) — wrenches act on the link, in its frame (force at the link origin, moment). */
export function rnea(robot, q, qd, qdd, { gravity = [0, 0, -9.81], base, wrenches = {}, damping = true } = {}) {
  const fr = frames(robot, q), st = new Map();
  const Rb = base ? base.R : M.I3();
  st.set(robot.root, { w: [0, 0, 0], al: [0, 0, 0], vd: M.mTvec(Rb, M.scale(gravity, -1)) });
  const acc = new Map(); // link → {f, n} accumulated
  for (const { j, i, R, p } of fr) {
    const P = st.get(j.parent), Rt = M.mT(R), ax = j.axis, qdi = i === undefined ? 0 : qd[i], qddi = i === undefined ? 0 : qdd[i];
    const wp = P.w, ap = P.al;
    let base_a = M.add(P.vd, M.add(M.cross(ap, p), M.cross(wp, M.cross(wp, p))));
    let w = M.mvec(Rt, wp), al = M.mvec(Rt, ap);
    if (j.type === 'revolute' || j.type === 'continuous') {
      w = M.add(w, M.scale(ax, qdi));
      al = M.add(al, M.add(M.cross(M.mvec(Rt, wp), M.scale(ax, qdi)), M.scale(ax, qddi)));
    } else if (j.type === 'prismatic') {
      const rel = M.mvec(j.origin.R, ax);
      base_a = M.add(base_a, M.add(M.scale(M.cross(wp, rel), 2 * qdi), M.scale(rel, qddi)));
    }
    const vd = M.mvec(Rt, base_a), L = robot.links.get(j.child), c = L.com;
    const vdc = M.add(vd, M.add(M.cross(al, c), M.cross(w, M.cross(w, c))));
    const F = M.scale(vdc, L.mass), Ic = L.inertia, N = M.add(M.mvec(Ic, al), M.cross(w, M.mvec(Ic, w)));
    const ext = wrenches[j.child];
    let f = F, n = M.add(N, M.cross(c, F));
    if (ext) { if (ext.f) f = M.add(f, ext.f); if (ext.n) n = M.add(n, ext.n); }
    st.set(j.child, { w, al, vd });
    acc.set(j.child, { f, n });
  }
  const tau = new Array(robot.dof).fill(0);
  for (let k = fr.length - 1; k >= 0; k--) {
    const { j, i, R, p } = fr[k], a = acc.get(j.child);
    if (i !== undefined) {
      tau[i] = (j.type === 'prismatic' ? M.dot(j.axis, a.f) : M.dot(j.axis, a.n)) + (damping ? j.damping * qd[i] : 0);
    }
    const Rf = M.mvec(R, a.f), Rn = M.mvec(R, a.n);
    let pa = acc.get(j.parent);
    if (!pa) { pa = { f: [0, 0, 0], n: [0, 0, 0] }; acc.set(j.parent, pa); }
    pa.f = M.add(pa.f, Rf); pa.n = M.add(pa.n, M.add(Rn, M.cross(p, Rf)));
  }
  return tau;
}

/** Joint-space mass matrix (n×n, symmetric positive definite for a physical robot). */
export function massMatrix(robot, q, opts = {}) {
  const n = robot.dof, z = new Array(n).fill(0), Mm = M.zeros(n, n);
  for (let j = 0; j < n; j++) { const e = z.slice(); e[j] = 1; const col = rnea(robot, q, z, e, { ...opts, gravity: [0, 0, 0], damping: false, wrenches: {} }); for (let i = 0; i < n; i++) Mm[i][j] = col[i]; }
  return Mm;
}
/** Bias torque h(q, qd): gravity, Coriolis, centrifugal and damping. */
export const biasTorque = (robot, q, qd, opts = {}) => rnea(robot, q, qd, new Array(robot.dof).fill(0), opts);

/** Joint accelerations for applied torques tau. */
export function forwardDynamics(robot, q, qd, tau, opts = {}) {
  const Mm = massMatrix(robot, q, opts), h = biasTorque(robot, q, qd, opts), rhs = tau.map((t, i) => t - h[i]);
  const x = M.solve(Mm, rhs);
  return x || null;
}

/** Kinetic + potential energy (J). Potential is measured against the gravity vector from the world origin. */
export function energy(robot, q, qd, { gravity = [0, 0, -9.81], base } = {}) {
  const Mm = massMatrix(robot, q, { base }), ke = 0.5 * qd.reduce((s, v, i) => s + v * Mm[i].reduce((t, m, j) => t + m * qd[j], 0), 0);
  const T = robot.fk(q, base); let pe = 0;
  for (const [nme, l] of robot.links) if (l.mass) pe -= l.mass * M.dot(gravity, M.T_apply(T.get(nme), l.com));
  return { kinetic: ke, potential: pe, total: ke + pe };
}

/**
 * simulate(robot, q0, qd0, {T, dt, torque(t, q, qd) → tau[], gravity, base, every}) → {t[], q[], qd[], problems}. RK4, fixed step.
 * Contact-free: nothing stops a joint at its limit; leaving one is reported once as a Problem.
 */
export function simulate(robot, q0, qd0, { T = 1, dt = 1e-3, torque = null, gravity, base, every = 1 } = {}) {
  const n = robot.dof, opts = { gravity, base }, out = { t: [0], q: [q0.slice()], qd: [qd0.slice()], problems: [] };
  if (!robot.ok) { out.problems.push(...robot.problems); return out; }
  const lim = robot.limits(), warned = new Set();
  const acc = (t, q, qd) => { const tau = torque ? torque(t, q, qd) : new Array(n).fill(0); const a = forwardDynamics(robot, q, qd, tau, opts); return a || new Array(n).fill(NaN); };
  let q = q0.slice(), qd = qd0.slice(), t = 0; const steps = Math.round(T / dt);
  for (let s = 1; s <= steps; s++) {
    const k1q = qd, k1v = acc(t, q, qd);
    const q2 = q.map((v, i) => v + 0.5 * dt * k1q[i]), v2 = qd.map((v, i) => v + 0.5 * dt * k1v[i]);
    const k2q = v2, k2v = acc(t + dt / 2, q2, v2);
    const q3 = q.map((v, i) => v + 0.5 * dt * k2q[i]), v3 = qd.map((v, i) => v + 0.5 * dt * k2v[i]);
    const k3q = v3, k3v = acc(t + dt / 2, q3, v3);
    const q4 = q.map((v, i) => v + dt * k3q[i]), v4 = qd.map((v, i) => v + dt * k3v[i]);
    const k4q = v4, k4v = acc(t + dt, q4, v4);
    q = q.map((v, i) => v + dt / 6 * (k1q[i] + 2 * k2q[i] + 2 * k3q[i] + k4q[i]));
    qd = qd.map((v, i) => v + dt / 6 * (k1v[i] + 2 * k2v[i] + 2 * k3v[i] + k4v[i]));
    t = s * dt;
    if (q.some((v) => !Number.isFinite(v))) { out.problems.push(M.problem('sim.diverged', 'error', `The simulation produced a non-finite value at t = ${t.toFixed(4)} s (singular mass matrix or too large a step).`)); break; }
    q.forEach((v, i) => { if ((v < lim[i].lower || v > lim[i].upper) && !warned.has(i)) { warned.add(i); out.problems.push(M.problem('sim.limit', 'warning', `Joint "${robot.names[i]}" left its limit [${lim[i].lower}, ${lim[i].upper}] at t = ${t.toFixed(3)} s; nothing stops it (no contacts).`, [{ id: robot.names[i] }])); } });
    if (s % every === 0 || s === steps) { out.t.push(t); out.q.push(q.slice()); out.qd.push(qd.slice()); }
  }
  return out;
}
