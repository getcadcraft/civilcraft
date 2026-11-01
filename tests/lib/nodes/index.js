/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): a visual node graph for numbers, points, curves and free-form surfaces, over
 * cc-nurbs. DOM-free; byte-identical copies in the hosts (`node tools/nodes/sync.mjs [--check] <modelcraft|partcraft|supercadcraft>`). The editor
 * panel is the shell's assets/js/app-nodes.js. Map: docs/apps/nodes.md.
 */
export * from './types.js';
export { LIBRARY, BY_ID, CATEGORIES, applyMatrix } from './library.js';
export { Graph, Evaluator, FORMAT, VERSION, CAPS } from './graph.js';
export * as script from './script.js';
export { toProblems } from './problems.js';
export { NodesDisplay } from './display.js';
export { bakeMeshes } from './bake.js';
export { words } from './words.js';
export const LIB_VERSION = '0.8.0';
