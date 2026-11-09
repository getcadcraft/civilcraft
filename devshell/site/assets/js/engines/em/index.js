/* SPDX-License-Identifier: Apache-2.0 */
/** cc-em — the shared circuits and electromagnetics engine (0.8 XE.10): SPICE-class circuit solver, Biot–Savart and 2-D finite-element field solvers, wire-antenna method of moments. DOM-free, no imports outside this folder. */
export * from './linalg.js';
export * from './circuit.js';
export * from './fields.js';
export { Antenna, dipole, monopole, C0, ETA0 } from './wire.js';
export const ENGINE_VERSION = 1;
