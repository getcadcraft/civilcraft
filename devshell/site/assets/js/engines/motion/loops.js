/* SPDX-License-Identifier: Apache-2.0 */
/**
 * loops.js — closed kinematic loops in the plane (0.8 XE.4b, session part-model_PART_4). Four-bar linkages, slider-cranks, planar parallel robots (3-RPR) and
 * planar suspension linkages are the same problem: rigid bodies joined by revolute and prismatic joints so that the chain closes on itself. The joints
 * are written as constraint equations on the bodies' poses (x, y, angle); a driver fixes one or more of them; Newton's method with Levenberg–Marquardt
 * damping (Marquardt 1963) finds the pose, continuing from the last pose along a sweep, so the solution stays on the assembly branch it started on.
 * Clean room from the standard planar kinematics of Reuleaux, Grübler and Freudenstein; no program's code. DOM-free, imports ./math.js only.
 *
 *   model = { bodies: [{ id, x, y, theta }],                    approximate starting pose of every moving body (metres, radians); the ground is implicit: id 'ground'
 *             joints: [{ type: 'revolute', a, b, pa: [x,y], pb: [x,y] },                            point pa of body a coincides with point pb of body b
 *                      { type: 'prismatic', a, b, pa, pb, dir: [x,y], rel: 0 }],                   b slides along dir (a's axes) through pa; its angle to a stays rel
 *             drivers: [{ type: 'angle', body, value } | { type: 'relangle', joint, value } | { type: 'extension', joint, value }],
 *             points: [{ name, body, p: [x,y] }] }                                                 points whose paths are wanted
 *   mobility(model)            → { unknowns, equations, rank, dof, gruebler, overconstrained, sigma }   how many drivers the linkage needs
 *   solvePose(model, opts)     → { ok, q: {id: {x,y,theta}}, residual, iterations, sigmaMin, problems }
 *   sweep(model, { driver: 0, from, to, steps }) → { ok, steps: [{ value, q, points, sigmaMin, rates }], stalledAt, problems }   rates = d(body angle)/d(driver value)
 *   fourBar({ ground, crank, coupler, rocker, theta2 }) → { model, grashof }                        the textbook four-bar from four lengths, with its Grashof class
 *   grashofClass(g, a, b, c)   → { s, l, grashof, kind }                                              Grashof's rule: s + l <= p + q means one link can turn fully
 *   transmissionAngle(pose)    → radians                                                              the angle between coupler and rocker at their joint (four-bar from fourBar)
 *
 * Honest limits: planar only; rigid bodies with revolute and prismatic joints (no cams, gears, belts, springs or contact); position and velocity ratios,
 * not forces; the solver follows one assembly branch and says when it cannot go on (a toggle position, a driver beyond the reach, a locked linkage).
 */
import { solve, singularValues, problem } from './math.js';

const TOL = 1e-10;
const rot = (th, p) => { const c = Math.cos(th), s = Math.sin(th); return [c * p[0] - s * p[1], s * p[0] + c * p[1]]; };
const isPt = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);

/** Check a model; → { ok, problems, bodies (moving ids), index: id → offset in the unknown vector }. */
function prepare(model) {
  const problems = [];
  const bad = (code, text, about = []) => problems.push(problem(code, 'error', text, about));
  if (!model || typeof model !== 'object') { bad('model', 'The mechanism needs bodies and joints.'); return { ok: false, problems }; }
  const bodies = Array.isArray(model.bodies) ? model.bodies : [], joints = Array.isArray(model.joints) ? model.joints : [];
  const index = new Map(), ids = [];
  for (const b of bodies) {
    if (!b || typeof b.id !== 'string' || !b.id || b.id === 'ground') { bad('body-id', 'Every moving body needs its own name ("ground" is the fixed frame).'); continue; }
    if (index.has(b.id)) { bad('body-dup', 'Two bodies are called ' + b.id + '.', [{ id: b.id }]); continue; }
    if (![b.x, b.y, b.theta].every(Number.isFinite)) { bad('body-pose', b.id + ' needs a starting position x, y and angle theta (the solver starts there).', [{ id: b.id }]); continue; }
    index.set(b.id, ids.length * 3); ids.push(b.id);
  }
  const has = (id) => id === 'ground' || index.has(id);
  joints.forEach((j, k) => {
    const about = [{ id: 'joint' + k }];
    if (!j || (j.type !== 'revolute' && j.type !== 'prismatic')) { bad('joint-type', 'Joint ' + k + ' must be "revolute" or "prismatic".', about); return; }
    if (!has(j.a) || !has(j.b) || j.a === j.b) { bad('joint-body', 'Joint ' + k + ' must join two different bodies that exist.', about); return; }
    if (!isPt(j.pa) || !isPt(j.pb)) { bad('joint-point', 'Joint ' + k + ' needs its points pa and pb as [x, y] in each body\'s own axes.', about); return; }
    if (j.type === 'prismatic' && !(isPt(j.dir) && Math.hypot(j.dir[0], j.dir[1]) > 1e-12)) bad('joint-dir', 'Prismatic joint ' + k + ' needs a direction dir = [x, y].', about);
  });
  if (!ids.length) bad('bodies', 'The mechanism has no moving body.');
  (Array.isArray(model.drivers) ? model.drivers : []).forEach((d, k) => {
    const about = [{ id: 'driver' + k }];
    if (!d || !Number.isFinite(d.value)) { bad('driver-value', 'Driver ' + k + ' needs a number "value".', about); return; }
    if (d.type === 'angle') { if (!index.has(d.body)) bad('driver-body', 'Driver ' + k + ' names a body that does not move or does not exist.', about); }
    else if (d.type === 'relangle' || d.type === 'extension') {
      const j = joints[d.joint];
      if (!j) bad('driver-joint', 'Driver ' + k + ' names a joint that does not exist.', about);
      else if (d.type === 'relangle' && j.type !== 'revolute') bad('driver-joint', 'Driver ' + k + ': a relative angle drives a revolute joint.', about);
      else if (d.type === 'extension' && j.type !== 'prismatic') bad('driver-joint', 'Driver ' + k + ': an extension drives a prismatic joint.', about);
    } else bad('driver-type', 'Driver ' + k + ' must be "angle", "relangle" or "extension".', about);
  });
  return { ok: problems.length === 0, problems, bodies: ids, index, joints, drivers: Array.isArray(model.drivers) ? model.drivers : [] };
}

/** World position of a body-local point, and the body's angle, from the unknown vector q. */
function pose(P, q, id) { if (id === 'ground') return { x: 0, y: 0, th: 0 }; const o = P.index.get(id); return { x: q[o], y: q[o + 1], th: q[o + 2] }; }
const world = (P, q, id, p) => { const b = pose(P, q, id), r = rot(b.th, p); return [b.x + r[0], b.y + r[1]]; };
const extension = (P, q, j) => { const wa = world(P, q, j.a, j.pa), wb = world(P, q, j.b, j.pb), d = rot(pose(P, q, j.a).th, j.dir), n = Math.hypot(d[0], d[1]); return ((wb[0] - wa[0]) * d[0] + (wb[1] - wa[1]) * d[1]) / n; };

/** The joint equations (revolute 2, prismatic 2), then the driver equations. */
function residual(P, q, drivers = P.drivers) {
  const r = [];
  for (const j of P.joints) {
    const wa = world(P, q, j.a, j.pa), wb = world(P, q, j.b, j.pb);
    if (j.type === 'revolute') { r.push(wa[0] - wb[0], wa[1] - wb[1]); continue; }
    const th = pose(P, q, j.b).th - pose(P, q, j.a).th - (j.rel || 0);
    const d = rot(pose(P, q, j.a).th, j.dir), n = Math.hypot(d[0], d[1]);
    r.push(Math.atan2(Math.sin(th), Math.cos(th)), ((wb[0] - wa[0]) * d[1] - (wb[1] - wa[1]) * d[0]) / n);
  }
  for (const d of drivers) {
    if (d.type === 'angle') r.push(pose(P, q, d.body).th - d.value);
    else if (d.type === 'relangle') { const j = P.joints[d.joint]; r.push(pose(P, q, j.b).th - pose(P, q, j.a).th - d.value); }
    else r.push(extension(P, q, P.joints[d.joint]) - d.value);
  }
  return r;
}
const jacobian = (P, q, drivers) => {
  const f0 = residual(P, q, drivers), n = q.length, J = f0.map(() => new Array(n).fill(0));
  for (let k = 0; k < n; k++) {
    const h = 1e-7 * Math.max(1, Math.abs(q[k])), a = q.slice(), b = q.slice(); a[k] += h; b[k] -= h;
    const fa = residual(P, a, drivers), fb = residual(P, b, drivers);
    for (let i = 0; i < f0.length; i++) J[i][k] = (fa[i] - fb[i]) / (2 * h);
  }
  return { J, f0 };
};
const norm = (v) => Math.hypot(...v);
const toQ = (P, model) => { const q = []; for (const b of model.bodies) { if (P.index.has(b.id)) q.push(b.x, b.y, b.theta); } return q; };
const fromQ = (P, q) => Object.fromEntries(P.bodies.map((id) => { const o = P.index.get(id); return [id, { x: q[o], y: q[o + 1], theta: q[o + 2] }]; }));

/** Newton with Levenberg–Marquardt damping on the stacked joint and driver equations. */
function newton(P, q0, drivers, { maxIter = 80 } = {}) {
  let q = q0.slice(), lambda = 1e-4, it = 0;
  let { J, f0 } = jacobian(P, q, drivers), e = norm(f0);
  for (; it < maxIter && e > TOL; it++) {
    const n = q.length, A = Array.from({ length: n }, () => new Array(n).fill(0)), g = new Array(n).fill(0);
    for (let i = 0; i < J.length; i++) for (let a = 0; a < n; a++) { g[a] += J[i][a] * f0[i]; for (let b = 0; b < n; b++) A[a][b] += J[i][a] * J[i][b]; }
    let accepted = false;
    for (let tries = 0; tries < 12 && !accepted; tries++) {
      const M = A.map((r, a) => r.map((v, b) => v + (a === b ? lambda * (1 + A[a][a]) : 0)));
      const dq = solve(M, g.map((v) => -v));
      if (!dq) { lambda *= 10; continue; }
      const step = Math.min(1, 0.6 / Math.max(1e-12, Math.max(...dq.map(Math.abs))));   // no body jumps more than about half a metre or radian in one step
      const qn = q.map((v, k) => v + dq[k] * step), en = norm(residual(P, qn, drivers));
      if (en < e) { q = qn; lambda = Math.max(1e-12, lambda / 5); ({ J, f0 } = jacobian(P, q, drivers)); e = norm(f0); accepted = true; }
      else lambda *= 8;
    }
    if (!accepted) break;
  }
  return { q, residual: e, iterations: it, J };
}

/** Smallest singular value of the stacked Jacobian over its largest: near 0 means the pose is a singular (toggle or locked) position. */
function sigmaRatio(J) { const s = singularValues(J); return s.length ? (s[0] > 0 ? s[s.length - 1] / s[0] : 0) : 0; }

export function mobility(model) {
  const P = prepare(model);
  if (!P.ok) return { ok: false, problems: P.problems };
  const q = toQ(P, model), { J } = jacobian(P, q, []);   // joints only, at the starting pose
  const nq = q.length, sv = singularValues(J), top = sv[0] || 0;
  const rank = sv.filter((s) => s > 1e-7 * Math.max(1, top)).length;
  const gruebler = 3 * P.bodies.length - 2 * P.joints.length;   // 3(n-1) - 2j with n counting the ground; both joint kinds remove two
  return { ok: true, unknowns: nq, equations: J.length, rank, dof: nq - rank, gruebler, overconstrained: nq - rank > gruebler, sigma: sv, problems: [] };
}

export function solvePose(model, opts = {}) {
  const P = prepare(model);
  if (!P.ok) return { ok: false, q: {}, residual: NaN, iterations: 0, sigmaMin: NaN, problems: P.problems };
  const problems = [];
  const m = mobility(model);
  if (P.drivers.length !== m.dof) {
    problems.push(problem('drivers', 'error', P.drivers.length + ' driver(s) for a mechanism with ' + m.dof + ' degree(s) of freedom: give exactly ' + m.dof + ' (the pose is not fixed otherwise).', []));
    return { ok: false, q: fromQ(P, toQ(P, model)), residual: NaN, iterations: 0, sigmaMin: NaN, problems };
  }
  const r = newton(P, opts.start || toQ(P, model), P.drivers, opts);
  const ratio = sigmaRatio(r.J);
  const ok = r.residual <= 1e-8;
  if (!ok) problems.push(problem('no-solution', 'error', 'The linkage cannot reach that driver value from this starting pose (it may be beyond its reach, or the starting pose is on another assembly): residual ' + (+r.residual.toPrecision(3)) + '.', []));
  else if (ratio < 1e-6) problems.push(problem('singular', 'warning', 'This pose is singular (a toggle or locked position): the driver cannot move the mechanism here, or the output moves without the driver.', []));
  return { ok, q: fromQ(P, r.q), residual: r.residual, iterations: r.iterations, sigmaMin: ratio, problems, _q: r.q, _J: r.J, _P: P };
}

/** Sweep the first driver (or `driver`) from `from` to `to` in `steps` steps, each from the previous pose. */
export function sweep(model, { driver = 0, from, to, steps = 36 } = {}) {
  const P = prepare(model);
  if (!P.ok) return { ok: false, steps: [], stalledAt: null, problems: P.problems };
  const problems = [];
  if (!P.drivers[driver] || !Number.isFinite(from) || !Number.isFinite(to)) return { ok: false, steps: [], stalledAt: null, problems: [problem('sweep', 'error', 'A sweep needs a driver that exists and a from and a to value.', [])] };
  const m = mobility(model);
  if (P.drivers.length !== m.dof) return { ok: false, steps: [], stalledAt: null, problems: [problem('drivers', 'error', P.drivers.length + ' driver(s) for a mechanism with ' + m.dof + ' degree(s) of freedom: give exactly ' + m.dof + '.', [])] };
  const n = Math.max(1, Math.min(2000, Math.round(steps))), out = [];
  let q = toQ(P, model), stalledAt = null;
  const pts = Array.isArray(model.points) ? model.points : [];
  for (let k = 0; k <= n; k++) {
    const value = from + (to - from) * k / n;
    const drivers = P.drivers.map((d, i) => (i === driver ? { ...d, value } : d));
    const r = newton(P, q, drivers);
    if (r.residual > 1e-8) { stalledAt = value; problems.push(problem('stalled', 'warning', 'The linkage cannot follow the driver beyond ' + (+value.toPrecision(5)) + ' (a toggle position or the end of its reach); the sweep stops one step before.', [])); break; }
    q = r.q;
    const ratio = sigmaRatio(r.J);
    if (ratio < 1e-6) problems.push(problem('singular', 'warning', 'The pose at driver value ' + (+value.toPrecision(5)) + ' is singular (a toggle or locked position).', [{ id: 'step' + k }]));
    // rates: d(q)/d(driver value) from the implicit function theorem  J dq = -dF/dvalue, where only the swept driver's row depends on the value (row = -1)
    const row = r.J.length - P.drivers.length + driver, e = new Array(r.J.length).fill(0); e[row] = 1;
    const dq = r.J.length === q.length ? solve(r.J, e) : null;
    const rates = dq ? Object.fromEntries(P.bodies.map((id) => [id, dq[P.index.get(id) + 2]])) : null;
    out.push({ value, q: fromQ(P, q), points: Object.fromEntries(pts.map((p) => [p.name, world(P, q, p.body, p.p)])), sigmaMin: ratio, rates });
  }
  return { ok: stalledAt === null, steps: out, stalledAt, problems };
}

// ---- the textbook four-bar ------------------------------------------------------------------------------------------------------------------------

/** Grashof's rule for four link lengths: the shortest s and longest l against the other two, p and q. */
export function grashofClass(ground, crank, coupler, rocker) {
  const L = [ground, crank, coupler, rocker], sorted = L.slice().sort((a, b) => a - b), s = sorted[0], l = sorted[3], pq = sorted[1] + sorted[2];
  const grashof = s + l <= pq + 1e-12, change = Math.abs(s + l - pq) < 1e-12;
  let kind;
  if (!grashof) kind = 'triple rocker (no link turns fully)';
  else if (change) kind = 'change-point (it can fold flat, so its motion is not determined there)';
  else if (s === ground) kind = 'double crank (drag link)';
  else if (s === crank || s === rocker) kind = 'crank-rocker';
  else kind = 'double rocker (Grashof)';
  return { s, l, grashof, change, kind };
}

/**
 * A four-bar from its four lengths: the ground link from (0,0) to (g,0), the crank from (0,0) of length a at theta2, the coupler of length b, the rocker of
 * length c pivoting at (g,0). The starting pose uses the open (elbow-up) assembly; the crank angle is the driver.
 */
export function fourBar({ ground, crank, coupler, rocker, theta2 = 0.5, elbow = 1 } = {}) {
  const [g, a, b, c] = [ground, crank, coupler, rocker];
  if (![g, a, b, c].every((v) => Number.isFinite(v) && v > 0)) return { model: null, grashof: null, problems: [problem('lengths', 'error', 'A four-bar needs four positive link lengths.', [])] };
  const A = [a * Math.cos(theta2), a * Math.sin(theta2)], D = [g, 0], dx = D[0] - A[0], dy = D[1] - A[1], d = Math.hypot(dx, dy);
  if (d > b + c || d < Math.abs(b - c) || d === 0) return { model: null, grashof: grashofClass(g, a, b, c), problems: [problem('assembly', 'error', 'This four-bar cannot be assembled with the crank at ' + theta2 + ' rad: the coupler and rocker cannot meet.', [])] };
  // circle-circle intersection: B at distance b from A and c from D
  const k = (b * b - c * c + d * d) / (2 * d), h = Math.sqrt(Math.max(0, b * b - k * k)), ux = dx / d, uy = dy / d;
  const B = [A[0] + k * ux - elbow * h * uy, A[1] + k * uy + elbow * h * ux];
  const model = {
    bodies: [{ id: 'crank', x: 0, y: 0, theta: theta2 }, { id: 'coupler', x: A[0], y: A[1], theta: Math.atan2(B[1] - A[1], B[0] - A[0]) }, { id: 'rocker', x: g, y: 0, theta: Math.atan2(B[1], B[0] - g) }],
    joints: [
      { type: 'revolute', a: 'ground', b: 'crank', pa: [0, 0], pb: [0, 0] },
      { type: 'revolute', a: 'crank', b: 'coupler', pa: [a, 0], pb: [0, 0] },
      { type: 'revolute', a: 'coupler', b: 'rocker', pa: [b, 0], pb: [c, 0] },
      { type: 'revolute', a: 'ground', b: 'rocker', pa: [g, 0], pb: [0, 0] },
    ],
    drivers: [{ type: 'angle', body: 'crank', value: theta2 }],
    points: [{ name: 'coupler midpoint', body: 'coupler', p: [b / 2, 0] }, { name: 'coupler tip', body: 'coupler', p: [b, 0] }],
  };
  return { model, grashof: grashofClass(g, a, b, c), lengths: { ground: g, crank: a, coupler: b, rocker: c }, problems: [] };
}

/** The transmission angle (radians, 0 to pi/2 reported as the acute angle) between coupler and rocker at joint C, from a solved four-bar pose {coupler, rocker}. */
export function transmissionAngle(q, { coupler, rocker }) {
  // coupler axis points A -> C (angle theta_c); the rocker axis points D -> C, the rocker's own x axis runs from D to C when pb = [c,0] is at the coupler end
  const mu = Math.abs(q.coupler.theta - q.rocker.theta) % (2 * Math.PI);
  const m = mu > Math.PI ? 2 * Math.PI - mu : mu;
  return m > Math.PI / 2 ? Math.PI - m : m;
}
