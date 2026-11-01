/* SPDX-License-Identifier: Apache-2.0 */
/** cc-schematic — the shared schematic engine (0.8 XE.1): pins, nets, wire and terminal numbering, cross-references, plans, BOM, rule checks. DOM-free, no imports outside this folder. */
export * from './model.js';
export * from './nets.js';
export * from './number.js';
export * from './xref.js';
export * from './plans.js';
export * from './check.js';
export * from './plc-channels.js';
export const ENGINE_VERSION = 1;
