/* SPDX-License-Identifier: Apache-2.0 */
/** cc-motion — rigid-body kinematics and dynamics (0.8 XE.4): DH and URDF models, forward/inverse kinematics, Newton–Euler dynamics, trajectories. DOM-free, no imports outside this folder. */
export * from './robot.js';
export * from './ik.js';
export * from './dynamics.js';
export * from './traj.js';
export * from './urdf.js';
export * from './loops.js';
export { problem, singularValues, rotvec, rpy, toRpy, axisAngle } from './math.js';
export const VERSION = 1;
