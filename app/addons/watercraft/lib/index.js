/* SPDX-License-Identifier: Apache-2.0 */
/** cc-waternet — the WaterCraft engine (0.9 WN; 0.11 adds control rules, valves and energy, pressure-dependent demand and leakage, scenarios, emergency runs, calibration and sizing). DOM-free; the steady and extended solvers are the host's (configure()). */
export { configure, hydraulics, problem, LIMITS } from './util.js';
export * from './quality.js';
export * from './fire.js';
export * from './critical.js';
export * from './demand.js';
export * from './report.js';
export * from './control.js';
export * from './pdd.js';
export * from './scenario.js';
export * from './emergency.js';
export * from './calibrate.js';
export * from './sizing.js';
export const VERSION = 2;
