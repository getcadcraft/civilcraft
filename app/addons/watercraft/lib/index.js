/* SPDX-License-Identifier: Apache-2.0 */
/** cc-waternet — the WaterCraft engine (0.9 WN): water quality, fire flow at every hydrant, criticality, demand allocation. DOM-free; the steady and extended solvers are the host's (configure()). */
export { configure, hydraulics, problem, LIMITS } from './util.js';
export * from './quality.js';
export * from './fire.js';
export * from './critical.js';
export * from './demand.js';
export * from './report.js';
export const VERSION = 1;
