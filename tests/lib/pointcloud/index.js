/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — the public surface of the point cloud engine (spec § 9). DOM-free, no app imports.
 *
 *   configure({ las, thin, groundClassify, groundSurface })   hand over the collaborators once (the app's las.js, thin.js,
 *                                                              ground-classify.js, ground-surface.js modules)
 *   openStore(kind, opts) → store                              'memory' | 'opfs' | 'dir' (opts.path) | 'idb'
 *   await inspect(file) → info                                 header only
 *   await buildCloud(file, store, { id, name, nodeCap, progress(f, phase), signal, resume }) → cloud
 *   await openCloud(store, id) → cloud
 *   cloud.select(view, { budget, maxError }) · await cloud.readNode(i, { attrs, applyEdits }) · cloud.edits · await cloud.preview(region)
 *   await runOutliers(cloud, params, { progress, signal })
 *   await classifyGround(cloud, params, …) · await classifyGeometric(cloud, params, …)
 *   await groundSurface(cloud, opts) · await residuals(cloud, surface, opts) · await volumeBetween(a, b, opts) · await stockpile(src, boundary, opts)
 *   await exportLas(cloud, store|stream, opts) · await exportLaz(cloud, store|stream, opts)   (LAZ: our own compressor, laz.js, PC.14)
 * Additions to the spec's list: configure, PcError (every error has .code), cloud.readRaw / readRegion / forEachNode / ground() for
 * code that needs the planes, edits.exportJson / saved / canUndo / canRedo.
 */
export { configure, PcError } from './util.js';
export { openStore, MemoryStore, DirStore, OpfsStore, IdbStore } from './store.js';
export { inspect, buildCloud } from './tiler.js';
export { openCloud, decodeNode, encodeNode } from './octree.js';
export { runOutliers } from './outliers.js';
export { classifyGround, classifyGeometric } from './classify.js';
export { groundSurface, residuals, volumeBetween, stockpile, nearestPoint } from './surface.js';
export { exportLas, exportLaz } from './export.js';
export { readLaz, LazChunkWriter, lazVlrPayload, lazItems } from './laz.js';
export { compileRegion } from './select.js';
