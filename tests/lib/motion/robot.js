/* SPDX-License-Identifier: Apache-2.0 */
/**
 * robot.js — a rigid-body tree (0.8 XE.4): links joined by revolute, continuous, prismatic or fixed joints, in URDF's shape.
 * Chains, arms, mobile bases with a wheel set and branching mechanisms are all trees. Closed loops are not supported (said by validate()).
 *
 *   link   {name, mass?, com?[3], inertia?[9]}     inertia = 3×3 about the centre of mass, in the link's own frame, kg·m²
 *   joint  {name, type, parent, child, origin?: {R, p}, axis?[3], limit?: {lower, upper, effort, velocity}, damping?, offset?}
 *          the child frame sits at `origin` in the parent frame; the joint then moves about / along `axis` (given in the child frame)
 *          by q + offset. `continuous` has no position limit. `fixed` has no coordinate.
 * q is an array with one number per movable joint, in the order the joints were given (see robot.dof / robot.names).
 */
import * as M from './math.js';

const MOVABLE = new Set(['revolute', 'continuous', 'prismatic']);

export class Robot {
  constructor({ name = 'robot', links = [], joints = [] } = {}) {
    this.name = name;
    const defined = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
    this.links = new Map(links.map((l) => [l.name, { mass: 0, com: [0, 0, 0], inertia: [0, 0, 0, 0, 0, 0, 0, 0, 0], ...defined(l) }]));
    this.problems = [];
    this.joints = joints.map((j) => ({ type: 'revolute', axis: [0, 0, 1], origin: M.T_ident(), damping: 0, offset: 0, ...defined(j), axis: M.unit(j.axis || [0, 0, 1]) }));
    this._build();
  }
  _build() {
    const P = this.problems; P.length = 0;
    const byChild = new Map(); const names = new Set();
    for (const j of this.joints) {
      if (names.has(j.name)) P.push(M.problem('joint.dup', 'error', `Two joints are called "${j.name}".`, [{ id: j.name }]));
      names.add(j.name);
      if (!this.links.has(j.parent)) P.push(M.problem('link.unknown', 'error', `Joint "${j.name}" joins unknown parent link "${j.parent}".`, [{ id: j.name }]));
      if (!this.links.has(j.child)) P.push(M.problem('link.unknown', 'error', `Joint "${j.name}" joins unknown child link "${j.child}".`, [{ id: j.name }]));
      if (byChild.has(j.child)) P.push(M.problem('loop', 'error', `Link "${j.child}" has two parent joints; closed loops are not supported (it would need a constraint solver).`, [{ id: j.child }]));
      byChild.set(j.child, j);
      if (!['revolute', 'continuous', 'prismatic', 'fixed'].includes(j.type)) P.push(M.problem('joint.type', 'error', `Joint "${j.name}" has an unsupported type "${j.type}".`, [{ id: j.name }]));
      if (j.type === 'revolute' && j.limit && j.limit.lower > j.limit.upper) P.push(M.problem('limit.order', 'error', `Joint "${j.name}" has lower limit above upper limit.`, [{ id: j.name }]));
    }
    const roots = [...this.links.keys()].filter((n) => !byChild.has(n));
    if (roots.length !== 1) P.push(M.problem('root', 'error', roots.length ? `The links form ${roots.length} separate trees (${roots.join(', ')}); a robot needs exactly one root.` : 'The links have no root (a loop).', roots.map((r) => ({ id: r }))));
    this.root = roots[0] || null;
    // topological order of joints, parents first, declaration order kept among siblings
    const kids = new Map(); for (const j of this.joints) { if (!kids.has(j.parent)) kids.set(j.parent, []); kids.get(j.parent).push(j); }
    this.order = []; const seen = new Set();
    const walk = (l) => { if (seen.has(l)) return; seen.add(l); for (const j of kids.get(l) || []) { this.order.push(j); walk(j.child); } };
    if (this.root) walk(this.root);
    if (this.order.length !== this.joints.length && !P.length) P.push(M.problem('unreachable', 'error', 'Some joints cannot be reached from the root.'));
    this.dofJoints = this.joints.filter((j) => MOVABLE.has(j.type));
    this.dof = this.dofJoints.length; this.names = this.dofJoints.map((j) => j.name);
    this.index = new Map(this.dofJoints.map((j, i) => [j.name, i]));
    this.parentJoint = byChild;
  }
  get ok() { return !this.problems.some((p) => p.severity === 'error'); }

  /** Pose of a joint's moving part relative to its parent, for coordinate value qv (already including offset). */
  static motion(j, qv) {
    if (j.type === 'prismatic') return { R: M.I3(), p: M.scale(j.axis, qv) };
    if (j.type === 'fixed') return M.T_ident();
    return { R: M.axisAngle(j.axis, qv), p: [0, 0, 0] };
  }
  /** All link poses in the world (root at `base`, default identity) for coordinates q. */
  fk(q, base = M.T_ident()) {
    const T = new Map([[this.root, base]]);
    for (const j of this.order) {
      const i = this.index.get(j.name), qv = i === undefined ? 0 : q[i] + j.offset;
      T.set(j.child, M.T_mul(M.T_mul(T.get(j.parent), j.origin), Robot.motion(j, qv)));
    }
    return T;
  }
  pose(q, link, base) { return this.fk(q, base).get(link); }
  /** Joints on the path root → link (movable ones carry their coordinate index). */
  path(link) { const out = []; let l = link; while (l !== this.root) { const j = this.parentJoint.get(l); if (!j) return null; out.push(j); l = j.parent; } return out.reverse(); }

  /** Geometric Jacobian 6×dof of a point (default the link origin; `local` is in the link frame) in world axes: rows 0–2 linear, 3–5 angular. */
  jacobian(q, link, local = [0, 0, 0], base) {
    const T = this.fk(q, base), pw = M.T_apply(T.get(link), local), J = M.zeros(6, this.dof);
    for (const j of this.path(link) || []) {
      const i = this.index.get(j.name); if (i === undefined) continue;
      const Tp = T.get(j.parent), Rw = M.mmul(Tp.R, j.origin.R), z = M.mvec(Rw, j.axis);
      if (j.type === 'prismatic') { for (let k = 0; k < 3; k++) J[k][i] = z[k]; continue; }
      const oj = T.get(j.child).p, lin = M.cross(z, M.sub(pw, oj));
      for (let k = 0; k < 3; k++) { J[k][i] = lin[k]; J[3 + k][i] = z[k]; }
    }
    return J;
  }
  /** Centre of mass of the whole robot in the world, and its total mass. */
  centreOfMass(q, base) {
    const T = this.fk(q, base); let m = 0, c = [0, 0, 0];
    for (const [n, l] of this.links) { if (!l.mass) continue; m += l.mass; c = M.add(c, M.scale(M.T_apply(T.get(n), l.com), l.mass)); }
    return { mass: m, com: m ? M.scale(c, 1 / m) : [0, 0, 0] };
  }
  limits() { return this.dofJoints.map((j) => ({ lower: j.type === 'continuous' ? -Infinity : (j.limit?.lower ?? -Infinity), upper: j.type === 'continuous' ? Infinity : (j.limit?.upper ?? Infinity) })); }
  /** Problems for a configuration: a joint outside its limit, or near a singularity (manipulability from the Jacobian of `link`). */
  checkConfig(q, link, { singularBelow = 1e-3 } = {}) {
    const out = [], lim = this.limits();
    q.forEach((v, i) => { if (v < lim[i].lower - 1e-9 || v > lim[i].upper + 1e-9) out.push(M.problem('limit', 'warning', `Joint "${this.names[i]}" is at ${v.toFixed(4)}, outside its limit [${lim[i].lower}, ${lim[i].upper}].`, [{ id: this.names[i] }], { found: v, req: lim[i] })); });
    if (link) {
      // arms with fewer than six coordinates are judged on position alone (their orientation is under-actuated by design)
      const Jf = this.jacobian(q, link), J = this.dof >= 6 ? Jf : Jf.slice(0, 3), sv = M.singularValues(J), s = sv.slice(0, Math.min(J.length, this.dof));
      if (s.length && s[s.length - 1] < singularBelow && this.dof >= 1 && this.dof <= 6) out.push(M.problem('singular', 'warning', `The arm is at or near a singularity for "${link}": the smallest singular value of its Jacobian is ${s[s.length - 1].toExponential(2)}.`, [{ id: link }], { found: s[s.length - 1], req: singularBelow }));
    }
    return out;
  }
}

/** Build a Robot from Denavit–Hartenberg rows. convention 'standard' (T = Rz(θ) Tz(d) Tx(a) Rx(α)) or 'modified' (Craig: T = Rx(α) Tx(a) Rz(θ) Tz(d)).
 * row {a, alpha, d, theta, type: 'revolute'|'prismatic'|'fixed', limit?, mass?, com?, inertia?, damping?}. For a revolute row `theta` is the offset added to q,
 * for a prismatic row `d` is. Link i carries the row's mass and sits at frame i. */
export function robotFromDH(rows, { convention = 'standard', name = 'dh' } = {}) {
  const links = [{ name: 'base' }], joints = [];
  const Tz = (d) => ({ R: M.I3(), p: [0, 0, d] }), Tx = (a) => ({ R: M.I3(), p: [a, 0, 0] }), Rz = (t) => ({ R: M.rotZ(t), p: [0, 0, 0] }), Rx = (a) => ({ R: M.rotX(a), p: [0, 0, 0] });
  let prev = 'base';
  rows.forEach((r, i) => {
    const n = i + 1, a = r.a || 0, al = r.alpha || 0, d = r.d || 0, th = r.theta || 0, type = r.type || 'revolute';
    const body = { name: 'L' + n, mass: r.mass || 0, com: r.com, inertia: r.inertia };
    if (convention === 'standard') {
      // motion first (about / along z of the previous frame), then the fixed part of Rz(θ) Tz(d) Tx(a) Rx(α)
      const tail = M.T_mul(Tx(a), Rx(al));
      if (type === 'fixed') { links.push(body); joints.push({ name: 'j' + n, type: 'fixed', parent: prev, child: body.name, origin: M.T_mul(M.T_mul(Rz(th), Tz(d)), tail) }); prev = body.name; return; }
      const mid = { name: 'M' + n }; links.push(mid, body);
      joints.push({ name: 'j' + n, type, parent: prev, child: mid.name, axis: [0, 0, 1], limit: r.limit, damping: r.damping, offset: type === 'prismatic' ? d : th });
      joints.push({ name: 'f' + n, type: 'fixed', parent: mid.name, child: body.name, origin: M.T_mul(type === 'prismatic' ? Rz(th) : Tz(d), tail) });
    } else {
      // modified: fixed Rx(α) Tx(a) first, then the motion about z; Tz(d) / Rz(θ) of the other kind commute into the origin
      const base = M.T_mul(Rx(al), Tx(a));
      if (type === 'fixed') { links.push(body); joints.push({ name: 'j' + n, type: 'fixed', parent: prev, child: body.name, origin: M.T_mul(base, M.T_mul(Rz(th), Tz(d))) }); prev = body.name; return; }
      links.push(body);
      const origin = type === 'prismatic' ? M.T_mul(base, Rz(th)) : M.T_mul(base, Tz(d));
      joints.push({ name: 'j' + n, type, parent: prev, child: body.name, origin, axis: [0, 0, 1], limit: r.limit, damping: r.damping, offset: type === 'prismatic' ? d : th });
    }
    prev = body.name;
  });
  return new Robot({ name, links, joints });
}
