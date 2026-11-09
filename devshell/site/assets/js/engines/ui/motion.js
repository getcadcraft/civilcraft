/* SPDX-License-Identifier: Apache-2.0 */
// Panel descriptor for lib/motion (XE.4): a chain from Denavit–Hartenberg rows, pose, Jacobian, gravity torques, inverse kinematics.
const ARM = { convention: 'standard', link: 'L2', q: [0.3, 0.5], gravity: [0, -9.81, 0],
  rows: [{ a: 1, mass: 1, com: [-0.5, 0, 0] }, { a: 1, mass: 1, com: [-0.5, 0, 0] }],
  target: { p: [1.2, 0.8, 0] } };
const SCARA = { convention: 'standard', link: 'L4', q: [0.4, -0.6, 0.05, 0.2],
  rows: [{ a: 0.45, d: 0.5 }, { a: 0.35, alpha: 3.141592653589793 }, { type: 'prismatic' }, { d: 0.1 }] };

// XE.4b: closed loops in the plane. A model with "bodies" and "joints" is a linkage (four-bar, slider-crank, 3-RPR, a suspension); a model with "rows" is a robot chain.
const FOURBAR = { fourBar: { ground: 4, crank: 1.5, coupler: 3.5, rocker: 3, theta2: 0.6 }, sweep: { from: 0, to: 6.283185307, steps: 24 } };
const SLIDER = { planar: true, bodies: [{ id: 'crank', x: 0, y: 0, theta: 0.4 }, { id: 'rod', x: 0.46, y: 0.19, theta: -0.1 }, { id: 'slider', x: 2.06, y: 0, theta: 0 }],
  joints: [{ type: 'revolute', a: 'ground', b: 'crank', pa: [0, 0], pb: [0, 0] }, { type: 'revolute', a: 'crank', b: 'rod', pa: [0.5, 0], pb: [0, 0] },
    { type: 'revolute', a: 'rod', b: 'slider', pa: [1.6, 0], pb: [0, 0] }, { type: 'prismatic', a: 'ground', b: 'slider', pa: [0, 0], pb: [0, 0], dir: [1, 0] }],
  drivers: [{ type: 'angle', body: 'crank', value: 0.4 }], points: [{ name: 'slider', body: 'slider', p: [0, 0] }], sweep: { from: 0.4, to: 6.683185307, steps: 24 } };

function runLoop(R, input) {
  const problems = [], tables = [], notes = ['Planar linkages only: rigid bodies with revolute and prismatic joints. Lengths in metres, angles in radians.',
    'The solver follows one assembly branch from the starting pose and says where it cannot go on (a toggle position or the end of its reach).'];
  let model = input;
  if (input.fourBar) {
    const fb = R.fourBar(input.fourBar); problems.push(...fb.problems);
    if (!fb.model) return { tables, problems, notes };
    model = { ...fb.model, sweep: input.sweep };
    tables.push({ title: 'Four-bar (Grashof)', head: ['Shortest', 'Longest', 'Class'], rows: [[fb.grashof.s, fb.grashof.l, fb.grashof.kind]] });
  }
  const m = R.mobility(model); problems.push(...(m.problems || []));
  if (!m.ok) return { tables, problems, notes };
  tables.push({ title: 'Mobility', head: ['Unknowns', 'Rank', 'Degrees of freedom', 'Gruebler count'], rows: [[m.unknowns, m.rank, m.dof, m.gruebler]] });
  if (m.overconstrained) problems.push({ code: 'overconstrained', severity: 'note', text: 'The linkage has more freedom than the Gruebler count says: it is a special geometry (parallel or equal links).' });
  const sw = input.sweep ? R.sweep(model, { driver: 0, ...input.sweep }) : null;
  if (sw) {
    problems.push(...sw.problems);
    const names = (model.points || []).map((p) => p.name), bodies = model.bodies.map((b) => b.id);
    tables.push({ title: 'Sweep of the first driver', head: ['Driver', ...names.flatMap((n) => [n + ' x', n + ' y']), ...bodies.map((b) => 'd' + b + '/ddriver'), 'Singularity (0 = locked)'],
      rows: sw.steps.map((s) => [s.value, ...names.flatMap((n) => s.points[n]), ...bodies.map((b) => (s.rates ? s.rates[b] : '')), s.sigmaMin]) });
  } else {
    const r = R.solvePose(model); problems.push(...r.problems);
    tables.push({ title: 'Pose', head: ['Body', 'x', 'y', 'angle'], rows: Object.entries(r.q).map(([id, q]) => [id, q.x, q.y, q.theta]) });
  }
  return { tables, problems, notes };
}

export default {
  inputLabel: 'Robot (JSON: rows of DH parameters, q, optional link, gravity, target)',
  examples: [
    { id: 'planar2', name: 'Planar two-link arm with inverse kinematics', text: JSON.stringify(ARM, null, 1) },
    { id: 'fourbar', name: 'Four-bar linkage: Grashof class, coupler path, velocity ratios', text: JSON.stringify(FOURBAR, null, 1) },
    { id: 'slidercrank', name: 'Slider-crank: piston position over a turn', text: JSON.stringify(SLIDER, null, 1) },
    { id: 'scara', name: 'SCARA arm, pose and Jacobian', text: JSON.stringify(SCARA, null, 1) },
  ],
  load: () => import('../motion/index.js'),
  run(R, text) {
    const input = JSON.parse(text);
    if (input && (input.fourBar || Array.isArray(input.joints))) return runLoop(R, input);
    if (!input || !Array.isArray(input.rows) || !input.rows.length) throw new Error('The input needs "rows" (one object per joint: a, alpha, d, theta, type).');
    const robot = R.robotFromDH(input.rows, { convention: input.convention === 'modified' ? 'modified' : 'standard' });
    const problems = [...robot.problems];
    if (!robot.ok) return { tables: [], problems };
    const q = Array.isArray(input.q) && input.q.length === robot.dof ? input.q : new Array(robot.dof).fill(0);
    if (input.q && input.q.length !== robot.dof) problems.push({ code: 'q', severity: 'warning', text: 'q has ' + input.q.length + ' values but the robot has ' + robot.dof + ' joints; zeros are used.' });
    const link = input.link || 'L' + input.rows.length, tables = [];
    const T = robot.pose(q, link);
    tables.push({ title: 'Pose of ' + link, head: ['x', 'y', 'z', 'R11', 'R12', 'R13', 'R21', 'R22', 'R23', 'R31', 'R32', 'R33'], rows: [[...T.p, ...T.R]] });
    const J = robot.jacobian(q, link);
    tables.push({ title: 'Jacobian (rows vx vy vz wx wy wz)', head: ['', ...robot.names], rows: J.map((row, i) => [['vx', 'vy', 'vz', 'wx', 'wy', 'wz'][i], ...row]) });
    if (input.rows.some((r) => r.mass)) {
      const g = Array.isArray(input.gravity) ? input.gravity : [0, 0, -9.81];
      const tau = R.biasTorque(robot, q, new Array(robot.dof).fill(0), { gravity: g });
      tables.push({ title: 'Holding torque against gravity at rest', head: ['Joint', 'Torque'], rows: robot.names.map((n, i) => [n, tau[i]]) });
    }
    if (input.target && Array.isArray(input.target.p)) {
      const r = R.ik(robot, link, { p: input.target.p }, q);
      problems.push(...r.problems);
      tables.push({ title: 'Inverse kinematics to ' + JSON.stringify(input.target.p), head: ['Joint', 'Value'], rows: robot.names.map((n, i) => [n, r.q[i]]) });
      tables.push({ title: 'IK result', head: ['Reached', 'Iterations', 'Position error'], rows: [[r.ok ? 'yes' : 'no', r.iterations, r.error.pos]] });
    }
    return { tables, problems, notes: ['Joint values are radians (revolute) or metres (prismatic).', 'Inverse kinematics is damped least squares from the given q: it finds one solution near it, not all of them.'] };
  },
};
