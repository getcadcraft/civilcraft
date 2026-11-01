/* SPDX-License-Identifier: Apache-2.0 */
/** cc-pcb — the shared boards-and-chips engine (0.8 XE.11): board model and footprints, schematic-to-board import, placement, routing, DRC, Gerber X2 / Excellon / IPC-2581 out, GDSII view with layer maps and basic layout DRC. DOM-free, no imports outside this folder. */
export * from './geom.js';
export * from './board.js';
export * from './footlib.js';
export * from './place.js';
export * from './route.js';
export * from './drc.js';
export * from './gerber.js';
export * from './ipc2581.js';
export * from './gds.js';
export const ENGINE_VERSION = 1;
