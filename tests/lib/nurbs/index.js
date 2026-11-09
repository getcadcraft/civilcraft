/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-nurbs (0.8 SU.747b, session `nurbs`): NURBS curves and untrimmed surfaces with measured continuity, for
 * ModelCraft and PartCraft (byte-identical copies: `node tools/nurbs/sync.mjs [--check]`). DOM-free, no dependencies, no kernel.
 * Map: docs/apps/nurbs.md.
 */
export * as basis from './basis.js';
export * as curve from './curve.js';
export * as fit from './fit.js';
export * as surface from './surface.js';
export * as construct from './construct.js';
export * as continuity from './continuity.js';
export * as match from './match.js';
export * as analysis from './analysis.js';
export * as doc from './doc.js';
export * as step from './step.js';
export * as iges from './iges.js';
export * as trim from './trim.js';
export * as solid from './solid.js';
export * as reverse from './reverse.js';
export * as blend from './blend.js';
export * as nodesSolid from './nodes-solid.js';
export * as tools from './tools.js';
export * as cage from './cage.js';   // 0.9 D9.8: SubD cages that are exact NURBS
export { NurbsError } from './curve.js';
export const VERSION = '0.9.0';
